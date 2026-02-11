"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Store, Phone, Palette, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SidebarToggle from "@/components/admin/SidebarToggle";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TenantSettings = {
  name: string;
  slug: string;
  tagline: string | null;
  location: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  coverTemplate: string | null;
  coverPhoto: string | null;
  logo: string | null;
  email: string | null;
};

type SaveState = "idle" | "saving" | "success" | "error";

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("text-sm font-medium leading-none text-zinc-900", className)}>
      {children}
    </label>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.8rem] text-zinc-600 mt-1.5">{children}</p>;
}

function SettingsInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    />
  );
}

function SettingsTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      autoComplete="off"
      className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    />
  );
}

const COVER_TEMPLATES = [
  { id: "warm", name: "暖橙", color: "#FF9500" },
  { id: "blue", name: "藍白", color: "#0A84FF" },
  { id: "pink", name: "粉彩", color: "#FF2D55" },
  { id: "green", name: "清新", color: "#34C759" },
  { id: "purple", name: "紫羅蘭", color: "#AF52DE" },
];

export default function TenantSettings({ params }: { params: { locale: string } }) {
  const [formData, setFormData] = useState<TenantSettings>({
    name: "",
    slug: "",
    tagline: null,
    location: null,
    whatsapp: null,
    instagram: null,
    facebook: null,
    coverTemplate: "default",
    coverPhoto: null,
    logo: null,
    email: null,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [slugWarning, setSlugWarning] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");

  const locale = params.locale;

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/admin/tenant-settings");
        if (!res.ok) {
          if (res.status === 401) {
            setErrorMessage("Please log in to view settings");
          }
          setDataLoaded(true);
          return;
        }
        const data = await res.json();
        if (mounted && data.ok && data.data) {
          setFormData(data.data);
          setOriginalSlug(data.data.slug);
        }
      } catch {
        // Ignore errors
      } finally {
        if (mounted) {
          setDataLoaded(true);
        }
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "slug") {
      setSlugWarning(value !== originalSlug && originalSlug !== "");
    }
  }, [originalSlug]);

  const handleCoverTemplateChange = useCallback((templateId: string) => {
    setFormData((prev) => ({ ...prev, coverTemplate: templateId }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveState("success");
        if (data.data) {
          setFormData(data.data);
          setOriginalSlug(data.data.slug);
          setSlugWarning(false);
        }
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        if (res.status === 409) {
          setErrorMessage("網址已被使用，請選擇其他網址");
        } else {
          setErrorMessage(data.error?.message || "儲存失敗");
        }
      }
    } catch (err) {
      setSaveState("error");
      setErrorMessage(`網絡錯誤: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [formData]);

  if (!dataLoaded) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 text-zinc-900 pb-20">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">⚙️ 商店設定</h1>
            <p className="text-zinc-600 text-base max-w-lg">
              管理你嘅商店基本資料、聯絡方式同外觀設定
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {saveState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> 已儲存
                </motion.div>
              )}
              {saveState === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4" /> {errorMessage || "失敗"}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
                saveState === "saving" && "opacity-80"
              )}
            >
              {saveState === "saving" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> 儲存中</>
              ) : (
                <><Save className="h-4 w-4" /> 儲存</>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-zinc-600" />
                基本資料
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                商店嘅基本資訊
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>店舖名稱</Label>
                <SettingsInput
                  id="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="我嘅小店"
                />
                <Description>顯示喺商店頂部同瀏覽器標題</Description>
              </div>

              <div className="space-y-3">
                <Label>店舖網址</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600">wowlix.com/</span>
                  <SettingsInput
                    id="slug"
                    value={formData.slug || ""}
                    onChange={handleChange}
                    placeholder="myshopp"
                  />
                </div>
                {slugWarning && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">⚠️ 改網址會影響現有連結</p>
                  </div>
                )}
                <Description>商店嘅唯一網址識別碼</Description>
              </div>

              <div className="space-y-3">
                <Label>簡介</Label>
                <SettingsTextarea
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={handleChange}
                  placeholder="手工烏龍茶專門店"
                  rows={2}
                />
                <Description>簡單介紹你嘅商店</Description>
              </div>

              <div className="space-y-3">
                <Label>地點</Label>
                <SettingsInput
                  id="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="觀塘"
                />
                <Description>商店所在地區</Description>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-zinc-600" />
                聯絡方式
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                客人聯絡你嘅方式
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>WhatsApp</Label>
                <SettingsInput
                  id="whatsapp"
                  value={formData.whatsapp || ""}
                  onChange={handleChange}
                  placeholder="+852 9XXX XXXX"
                />
              </div>

              <div className="space-y-3">
                <Label>Instagram</Label>
                <SettingsInput
                  id="instagram"
                  value={formData.instagram || ""}
                  onChange={handleChange}
                  placeholder="@myshopp"
                />
              </div>

              <div className="space-y-3">
                <Label>Facebook</Label>
                <SettingsInput
                  id="facebook"
                  value={formData.facebook || ""}
                  onChange={handleChange}
                  placeholder="fb.com/myshopp"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Palette className="h-5 w-5 text-zinc-600" />
                外觀
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                商店嘅視覺設定
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>封面色調</Label>
                <div className="flex gap-3">
                  {COVER_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleCoverTemplateChange(template.id)}
                      className={cn(
                        "w-16 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                        formData.coverTemplate === template.id
                          ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                          : "border-zinc-300 hover:border-zinc-400"
                      )}
                      style={{ backgroundColor: template.color }}
                    >
                      <span className="text-xs text-white font-medium mt-auto mb-1">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>封面圖</Label>
                <SettingsInput
                  id="coverPhoto"
                  value={formData.coverPhoto || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                />
                {formData.coverPhoto && (
                  <img src={formData.coverPhoto} alt="Cover preview" className="h-32 w-full object-cover rounded-md mt-2" />
                )}
                <Description>商店頂部嘅封面相片</Description>
              </div>

              <div className="space-y-3">
                <Label>頭像</Label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 border-zinc-200" />
                  )}
                  <div className="flex-1">
                    <SettingsInput
                      id="logo"
                      value={formData.logo || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.jpg"
                    />
                  </div>
                </div>
                <Description>商店嘅 logo 或頭像</Description>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <User className="h-5 w-5 text-zinc-600" />
                帳戶
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                帳戶相關設定
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-zinc-600 mt-1">{formData.email || "未設定"}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => alert("改密碼功能開發中")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
                >
                  🔑 改密碼
                </button>
                <button
                  onClick={() => {
                    if (confirm("確定要登出？")) {
                      window.location.href = `/${locale}/admin/logout`;
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  🚪 登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
