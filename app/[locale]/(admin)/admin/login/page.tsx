"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";

type TenantOption = {
  id: string;
  name: string;
  slug: string;
  mode: string;
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSecretLogin, setShowSecretLogin] = useState(false);
  // Tenant selection state for super admin
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [showTenantPicker, setShowTenantPicker] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "en";
  const dict = getDict(locale as Locale);
  const labels = dict.admin.login;
  const oauthError = searchParams.get("error");

  // Auto-redirect if already authenticated via JWT
  useEffect(() => {
    fetch("/api/tenant-admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          router.replace(`/${locale}/admin`);
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [locale, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tenant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push(`/${locale}/admin`);
        router.refresh();
      } else {
        setError(data.error?.message || data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecretLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json();

      if (data.ok) {
        // 登入成功後，取得 tenant 列表讓 super admin 揀
        const tenantsRes = await fetch("/api/admin/tenants");
        const tenantsData = await tenantsRes.json();

        if (tenantsData.ok && tenantsData.tenants?.length > 0) {
          setTenants(tenantsData.tenants);
          setShowTenantPicker(true);
        } else {
          setError("No active tenants found");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTenant = async (tenantId: string) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/select-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push(`/${locale}/admin`);
        router.refresh();
      } else {
        setError(data.error || "Failed to select tenant");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Tenant picker UI (shown after ADMIN_SECRET login)
  if (showTenantPicker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 text-white text-2xl">
                  ✦
                </div>
                <span className="text-2xl font-bold text-zinc-800">Admin</span>
              </div>
              <h1 className="text-xl font-semibold text-zinc-900">{labels.selectTenant}</h1>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSelectTenant(tenant.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FF9500] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-900 truncate">{tenant.name}</div>
                    <div className="text-xs text-zinc-400">{tenant.slug}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTenantPicker(false);
                setTenants([]);
                setSecret("");
              }}
              className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors w-full text-center"
            >
              {labels.selectTenantBack}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <a
              href="/api/tenant-admin/google"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {labels.googleLogin}
            </a>

          </div>

          {oauthError && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-red-600 text-sm text-center">{labels.oauthError}</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-zinc-500">{labels.or}</span>
            </div>
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                {labels.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#FF9500] focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30"
                placeholder={labels.passwordPlaceholder}
                required
                autoComplete="current-password"
              />
            </div>

            {error && !showSecretLogin && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-xl bg-[#FF9500] py-3 text-white font-semibold hover:bg-[#E68600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && !showSecretLogin ? labels.submitting : labels.submit}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-zinc-500 mt-4">
            {labels.noAccount}{" "}
            <Link href={`/${locale}/start`} className="text-[#FF9500] font-medium hover:underline">
              {labels.createStore}
            </Link>
          </p>

          {/* Admin secret login (collapsible) */}
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setShowSecretLogin(!showSecretLogin)}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors w-full text-center"
            >
              {labels.adminLogin}
            </button>
            {showSecretLogin && (
              <form onSubmit={handleSecretLogin} className="mt-3 space-y-3">
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-sm"
                  placeholder={labels.adminSecretPlaceholder}
                  required
                  autoComplete="current-password"
                />
                {error && showSecretLogin && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !secret}
                  className="w-full rounded-xl bg-zinc-800 py-2.5 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading && showSecretLogin ? "..." : labels.adminLogin}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
