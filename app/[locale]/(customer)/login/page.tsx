"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Phone, Shield } from "lucide-react";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "zh-HK";
  const redirectTo = searchParams?.get("redirect") || `/${locale}`;
  const { user, login } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
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

  const validatePhone = (value: string): boolean => {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return false;
    return ["2", "3", "5", "6", "7", "8", "9"].includes(digits[0]);
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      setError("請輸入有效嘅8位香港電話號碼");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+852${phone.replace(/\D/g, "")}` }),
      });
      const data = await res.json();

      if (data.ok) {
        setStep("otp");
        setCountdown(60);
        // Store demo OTP if provided
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

    const normalizedPhone = `+852${phone.replace(/\D/g, "")}`;
    const result = await login(normalizedPhone, otpCode);

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
    phoneLabel: locale === "zh-HK" ? "電話號碼" : "Phone Number",
    phonePlaceholder: locale === "zh-HK" ? "輸入8位電話號碼" : "Enter 8-digit phone number",
    sendOtp: locale === "zh-HK" ? "發送驗證碼" : "Send OTP",
    otpLabel: locale === "zh-HK" ? "驗證碼" : "Verification Code",
    otpSent: locale === "zh-HK" ? "驗證碼已發送到" : "OTP sent to",
    verify: locale === "zh-HK" ? "驗證" : "Verify",
    resend: locale === "zh-HK" ? "重新發送" : "Resend",
    resendIn: locale === "zh-HK" ? "秒後可重新發送" : "s before resend",
    demoHint: locale === "zh-HK" ? "測試用驗證碼: 123456" : "Test OTP: 123456",
    back: locale === "zh-HK" ? "返回" : "Back",
    changePhone: locale === "zh-HK" ? "更改號碼" : "Change number",
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

          {step === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.phoneLabel}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Phone size={16} />
                    <span className="text-sm">+852</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder={t.phonePlaceholder}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-olive-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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
                disabled={loading || phone.length !== 8}
                className="w-full rounded-xl bg-olive-600 py-3 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "發送中..." : t.sendOtp}
              </button>

              {/* Demo hint */}
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>{t.demoHint}</span>
                </div>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {t.otpSent} <span className="font-semibold text-zinc-900 dark:text-zinc-100">+852 {phone}</span>
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

              {/* Show demo OTP if available */}
              {demoOtp && (
                <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  驗證碼: <span className="font-mono font-semibold">{demoOtp}</span>
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
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                    setDemoOtp(null);
                  }}
                  className="text-olive-600 hover:text-olive-700 dark:text-olive-500 dark:hover:text-olive-400"
                >
                  {t.changePhone}
                </button>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="text-olive-600 hover:text-olive-700 disabled:text-zinc-400 disabled:cursor-not-allowed dark:text-olive-500 dark:hover:text-olive-400"
                >
                  {countdown > 0 ? `${countdown}${t.resendIn}` : t.resend}
                </button>
              </div>

              {/* Demo hint */}
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>{t.demoHint}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
