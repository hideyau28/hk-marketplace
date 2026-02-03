import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// JWT secret - in production, use a proper secret from env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hk-marketplace-secret-key-change-in-production"
);

const COOKIE_NAME = "hk_session";
const TOKEN_EXPIRY = "7d"; // 7 days

export interface JWTPayload {
  userId: string;
  phone: string;
  [key: string]: unknown; // Required for jose JWTPayload compatibility
}

export interface SessionUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
}

// OTP storage (in-memory for now, replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP for a phone number (5 minute expiry)
export function storeOTP(phone: string, otp: string): void {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phone, { otp, expiresAt });
}

// Verify OTP (also accepts "123456" in demo mode)
export function verifyOTP(phone: string, otp: string): boolean {
  // Demo mode: always accept "123456"
  if (otp === "123456") {
    return true;
  }

  const stored = otpStore.get(phone);
  if (!stored) {
    return false;
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  // Check OTP match
  if (stored.otp !== otp) {
    return false;
  }

  // OTP is valid, remove it (one-time use)
  otpStore.delete(phone);
  return true;
}

// Validate HK phone number format (8 digits starting with 2/3/5/6/7/8/9)
export function validateHKPhone(phone: string): boolean {
  // Remove +852 prefix if present
  const digits = phone.replace(/^\+852/, "").replace(/\D/g, "");

  // Must be 8 digits
  if (digits.length !== 8) {
    return false;
  }

  // Must start with 2, 3, 5, 6, 7, 8, or 9
  const firstDigit = digits[0];
  return ["2", "3", "5", "6", "7", "8", "9"].includes(firstDigit);
}

// Normalize phone to +852XXXXXXXX format
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/^\+852/, "").replace(/\D/g, "");
  return `+852${digits}`;
}

// Create JWT token
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Set session cookie (server-side)
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

// Clear session cookie (server-side)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Get session token from cookie (server-side)
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

// Get session user from request (API routes)
export async function getSessionUser(request: Request): Promise<JWTPayload | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  // Parse cookies manually
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies[COOKIE_NAME];
  if (!token) {
    return null;
  }

  return verifyToken(token);
}
