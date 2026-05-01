"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Mail, Shield } from "lucide-react";

type Step = "email" | "otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "zh-HK";
  const redirectTo = searchParams?.get("redirect") || `/${locale}`;
  const { user, login } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmailInput = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
  };

  const handleSendOtp = async () => {
    if (!validateEmailInput(email)) {
      setError("請輸入有效嘅電郵地址");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.ok) {
        setStep("otp");
        setCountdown(60);
        // Store demo OTP if provided (local dev only)
        if (data.data.demoMode && data.data.otp) {
          setDemoOtp(data.data.otp);
        }
        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error?.message || "發送失敗，請重試");
      }
    } catch {
      setError("網絡錯誤，請重試");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const result = await login(normalizedEmail, otpCode);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || "驗證失敗，請重試");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setDemoOtp(null);
    handleSendOtp();
  };

  const t = {
    title: locale === "zh-HK" ? "登入 / 註冊" : "Login / Register",
    emailLabel: locale === "zh-HK" ? "電郵地址" : "Email address",
    emailPlaceholder: locale === "zh-HK" ? "you@example.com" : "you@example.com",
    sendOtp: locale === "zh-HK" ? "發送電郵驗證碼" : "Send email code",
    otpLabel: locale === "zh-HK" ? "電郵驗證碼" : "Email verification code",
    otpSent: locale === "zh-HK" ? "驗證碼已發送至" : "Code sent to",
    verify: locale === "zh-HK" ? "驗證" : "Verify",
    resend: locale === "zh-HK" ? "重新發送" : "Resend",
    resendIn: locale === "zh-HK" ? "秒後可重新發送" : "s before resend",
    demoHint:
      locale === "zh-HK"
        ? "本地測試：驗證碼會喺呢度顯示"
        : "Local dev: code shown here",
    back: locale === "zh-HK" ? "返回" : "Back",
    changeEmail: locale === "zh-HK" ? "更改電郵" : "Change email",
    checkInbox:
      locale === "zh-HK"
        ? "請檢查收件箱（及垃圾郵件夾）"
        : "Check your inbox (and spam folder)",
  };

  return (
    <div className="min-h-[80vh] px-4 py-8 pb-28">
      <div className="mx-auto max-w-md">
        {/* Back button */}
        <Link
          href={redirectTo}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6"
        >
          <ArrowLeft size={16} />
          {t.back}
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
            {t.title}
          </h1>

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-olive-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || !validateEmailInput(email)}
                className="w-full rounded-xl bg-olive-600 py-3 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "發送中..." : t.sendOtp}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {t.otpSent}{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {email.trim().toLowerCase()}
                </span>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {t.checkInbox}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.otpLabel}
                </label>
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-olive-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  ))}
                </div>
              </div>

              {/* Show demo OTP if available (local dev only) */}
              {demoOtp && (
                <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span>{t.demoHint}: </span>
                    <span className="font-mono font-semibold">{demoOtp}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={() => handleVerifyOtp(otp.join(""))}
                disabled={loading || otp.some((d) => !d)}
                className="w-full rounded-xl bg-olive-600 py-3 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "驗證中..." : t.verify}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                    setDemoOtp(null);
                  }}
                  className="text-olive-600 hover:text-olive-700 dark:text-olive-500 dark:hover:text-olive-400"
                >
                  {t.changeEmail}
                </button>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="text-olive-600 hover:text-olive-700 disabled:text-zinc-400 disabled:cursor-not-allowed dark:text-olive-500 dark:hover:text-olive-400"
                >
                  {countdown > 0 ? `${countdown}${t.resendIn}` : t.resend}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
