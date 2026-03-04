"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const locale = (params.locale as string) || "en";
  const dict = getDict(locale as Locale);
  const labels = dict.admin.forgotPassword;
  const loginLabels = dict.admin.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
      } else {
        setError(data.error?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          {/* Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9500] text-white text-2xl">
                ✦
              </div>
              <span className="text-2xl font-bold text-[#FF9500]">WoWlix</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">{labels.heading}</h1>
            {!success && (
              <p className="text-sm text-zinc-500 mt-1">{labels.description}</p>
            )}
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <p className="text-green-700 text-sm font-medium">{labels.successMessage}</p>
              </div>
              <Link
                href={`/${locale}/admin/login`}
                className="block text-sm text-[#FF9500] hover:underline mt-2"
              >
                {labels.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {labels.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#FF9500] focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30"
                  placeholder={labels.emailPlaceholder}
                  required
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-xl bg-[#FF9500] py-3 text-white font-semibold hover:bg-[#E68600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? labels.submitting : labels.submit}
              </button>

              <p className="text-center text-sm text-zinc-500">
                <Link
                  href={`/${locale}/admin/login`}
                  className="text-[#FF9500] font-medium hover:underline"
                >
                  {loginLabels.selectTenantBack}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
