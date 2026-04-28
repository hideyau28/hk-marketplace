"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Phone,
  Palette,
  User,
  Truck,
  DollarSign,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Crown,
  Lock,
  Wallet,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Share2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SidebarToggle from "@/components/admin/SidebarToggle";
import ImageUpload from "@/components/admin/ImageUpload";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DeliveryOption = {
  id: string;
  label: string;
  price: number;
  enabled: boolean;
};

type OrderConfirmConfig = {
  thanks: string;
  whatsappTemplate: string;
};

type SocialLink = {
  platform: string;
  url: string;
};

type TenantSettings = {
  name: string;
  slug: string;
  tagline: string | null;
  location: string | null;
  whatsapp: string | null;
  instagram: string | null;
  socialLinks: SocialLink[];
  coverTemplate: string | null;
  coverPhoto: string | null;
  logo: string | null;
  email: string | null;
  // New checkout settings
  currency: string;
  deliveryOptions: DeliveryOption[];
  freeShippingThreshold: number | null;
  freeShippingEnabled: boolean;
  orderConfirmMessage: OrderConfirmConfig;
  hideBranding: boolean;
};

const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    placeholder: "https://instagram.com/yourshop",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    placeholder: "https://wa.me/85291234567",
  },
  {
    id: "facebook",
    name: "Facebook",
    placeholder: "https://facebook.com/yourshop",
  },
  {
    id: "xiaohongshu",
    name: "小紅書",
    placeholder: "https://xiaohongshu.com/user/profile/xxx",
  },
  { id: "telegram", name: "Telegram", placeholder: "https://t.me/yourshop" },
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@yourshop" },
  {
    id: "threads",
    name: "Threads",
    placeholder: "https://threads.net/@yourshop",
  },
  {
    id: "youtube",
    name: "YouTube",
    placeholder: "https://youtube.com/@yourshop",
  },
  { id: "x", name: "X", placeholder: "https://x.com/yourshop" },
  { id: "wechat", name: "WeChat", placeholder: "微信號 / WeChat ID" },
] as const;

const MAX_SOCIAL_LINKS = 4;

function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const c = className || "w-5 h-5";
  switch (platform) {
    case "instagram":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "xiaohongshu":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.176 7.348l-1.424.024-.276 1.2h1.7l-.252 1.092h-1.7l-.672 2.904h-1.2l.672-2.904H10.6l-.672 2.904h-1.2l.672-2.904H7.824l.252-1.092H9.7l.276-1.2H8.4l.252-1.092h1.576l.648-2.808h1.2l-.648 2.808h1.424l.648-2.808h1.2l-.648 2.808h1.576z" />
        </svg>
      );
    case "telegram":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "threads":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.798-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.343-.783-.99-1.42-1.852-1.838-.142.793-.376 1.505-.706 2.078-.615 1.065-1.534 1.787-2.726 2.143a6.28 6.28 0 01-1.837.27c-1.327 0-2.553-.41-3.451-1.154-.96-.796-1.527-1.942-1.6-3.228-.047-.82.108-1.593.46-2.296.65-1.3 1.903-2.19 3.53-2.509a10.65 10.65 0 012.55-.151c-.022-.59-.105-1.132-.253-1.607a3.78 3.78 0 00-.842-1.378c-.71-.733-1.72-1.105-2.998-1.105-.04 0-.08 0-.12.002l-.053.001c-1.605.05-2.773.69-3.472 1.903l-1.75-1.065C7.3 3.09 9.098 2.216 11.266 2.149c.06-.002.12-.003.18-.003 1.896 0 3.405.588 4.49 1.749.633.676 1.077 1.498 1.332 2.444.378-.026.762-.038 1.152-.038l.18.002c1.96.05 3.475.722 4.504 1.997.936 1.162 1.37 2.71 1.254 4.477-.083 1.274-.414 2.447-1.012 3.586-.672 1.279-1.66 2.357-2.945 3.21-1.484.985-3.297 1.486-5.392 1.486l-.014-.001c-2.466-.006-4.368-.488-5.653-1.432-.752-.553-1.32-1.27-1.688-2.13a5.698 5.698 0 01-.493-2.333zm5.898-.397c.753-.208 1.33-.642 1.714-1.305a5.17 5.17 0 00.599-1.843 3.97 3.97 0 00-.925-.108c-.262 0-.526.016-.793.048-.925.147-1.624.548-2.02 1.16a2.17 2.17 0 00-.263 1.265c.063 1.111.893 1.783 2.22 1.783.158 0 .317-.013.468-.04v.04z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "x":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
        </svg>
      );
    case "wechat":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.18 2.982c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z" />
        </svg>
      );
    default:
      return <Share2 className={c} />;
  }
}

type SaveState = "idle" | "saving" | "success" | "error";

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-wlx-ink",
        className,
      )}
    >
      {children}
    </label>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.8rem] text-wlx-stone mt-1.5">{children}</p>;
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
      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
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
      className="flex min-h-[80px] w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    />
  );
}

const COVER_TEMPLATES = [
  { id: "noir", name: "暗黑 Noir", color: "#FF9500" },
  { id: "linen", name: "棉麻 Linen", color: "#C49A6C" },
  { id: "mochi", name: "抹茶 Mochi", color: "#2D6A4F" },
  { id: "petal", name: "花瓣 Petal", color: "#C77D91" },
];

const CURRENCIES = [
  { code: "HKD", symbol: "$", label: "港幣 (HKD)" },
  { code: "TWD", symbol: "NT$", label: "新台幣" },
  { code: "SGD", symbol: "S$", label: "新加坡幣" },
  { code: "MYR", symbol: "RM", label: "令吉" },
];

const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "meetup", label: "面交", price: 0, enabled: true },
  { id: "sf-collect", label: "順豐到付", price: 0, enabled: true },
  { id: "sf-prepaid", label: "順豐寄付", price: 30, enabled: true },
];

export default function TenantSettings({
  params,
}: {
  params: { locale: string };
}) {
  const [formData, setFormData] = useState<TenantSettings>({
    name: "",
    slug: "",
    tagline: null,
    location: null,
    whatsapp: null,
    instagram: null,
    socialLinks: [],
    coverTemplate: "mochi",
    coverPhoto: null,
    logo: null,
    email: null,
    currency: "HKD",
    deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
    freeShippingThreshold: null,
    freeShippingEnabled: false,
    orderConfirmMessage: {
      thanks: "多謝你嘅訂單！",
      whatsappTemplate: "你好！我落咗單 #{orderNumber}",
    },
    hideBranding: false,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [slugWarning, setSlugWarning] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  // Account editing
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  // Delivery modal
  const [editingDelivery, setEditingDelivery] = useState<{
    index: number;
    label: string;
    price: string;
  } | null>(null);
  const [addingDelivery, setAddingDelivery] = useState(false);
  const [newDeliveryLabel, setNewDeliveryLabel] = useState("");
  const [newDeliveryPrice, setNewDeliveryPrice] = useState("");
  // Plan status
  const [planData, setPlanData] = useState<{
    plan: string;
    isExpired: boolean;
    isTrialing: boolean;
    planExpiresAt: string | null;
    trialEndsAt: string | null;
    usage: {
      sku: { current: number; limit: number };
      orders: { current: number; limit: number };
    };
  } | null>(null);

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
          const d = data.data;
          setFormData({
            ...d,
            socialLinks: Array.isArray(d.socialLinks) ? d.socialLinks : [],
            deliveryOptions: d.deliveryOptions || DEFAULT_DELIVERY_OPTIONS,
            freeShippingEnabled: d.freeShippingThreshold != null,
            freeShippingThreshold: d.freeShippingThreshold,
            orderConfirmMessage: d.orderConfirmMessage || {
              thanks: "多謝你嘅訂單！",
              whatsappTemplate: "你好！我落咗單 #{orderNumber}",
            },
            currency: d.currency || "HKD",
            hideBranding: d.hideBranding ?? false,
          });
          setOriginalSlug(d.slug);
          if (d.email) setAccountEmail(d.email);
        }
      } catch {
        // Ignore errors
      }

      // Load plan data (non-blocking)
      try {
        const planRes = await fetch("/api/admin/plan");
        if (planRes.ok) {
          const planJson = await planRes.json();
          if (mounted && planJson.ok) setPlanData(planJson.data);
        }
      } catch {
        // Ignore plan load errors
      }

      if (mounted) setDataLoaded(true);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "slug") {
        setSlugWarning(value !== originalSlug && originalSlug !== "");
      }
    },
    [originalSlug],
  );

  const handleCoverTemplateChange = useCallback((templateId: string) => {
    setFormData((prev) => ({ ...prev, coverTemplate: templateId }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMessage("");

    try {
      // Build payload — send freeShippingThreshold as null when disabled
      const payload = {
        ...formData,
        freeShippingThreshold: formData.freeShippingEnabled
          ? formData.freeShippingThreshold
          : null,
      };

      const res = await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveState("success");
        if (data.data) {
          setFormData((prev) => ({
            ...prev,
            ...data.data,
            deliveryOptions: data.data.deliveryOptions || prev.deliveryOptions,
            freeShippingEnabled: data.data.freeShippingThreshold != null,
            orderConfirmMessage:
              data.data.orderConfirmMessage || prev.orderConfirmMessage,
          }));
          setOriginalSlug(data.data.slug);
          setSlugWarning(false);
        }
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        if (res.status === 409) {
          setErrorMessage(
            locale === "zh-HK"
              ? "網址已被使用，請選擇其他網址"
              : "URL already taken, please choose another",
          );
        } else {
          setErrorMessage(
            data.error?.message ||
              (locale === "zh-HK" ? "儲存失敗" : "Save failed"),
          );
        }
      }
    } catch (err) {
      setSaveState("error");
      setErrorMessage(
        locale === "zh-HK"
          ? `網絡錯誤: ${err instanceof Error ? err.message : String(err)}`
          : `Network error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, [formData]);

  // Account handlers
  const handleSaveEmail = async () => {
    setAccountSaving(true);
    setAccountError("");
    setAccountSuccess("");
    try {
      const res = await fetch("/api/tenant-admin/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "email", newEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAccountEmail(data.email);
        setFormData((prev) => ({ ...prev, email: data.email }));
        setEditingEmail(false);
        setAccountSuccess(
          locale === "zh-HK" ? "Email 已更新" : "Email updated",
        );
        setTimeout(() => setAccountSuccess(""), 3000);
      } else {
        setAccountError(
          data.error || (locale === "zh-HK" ? "更新失敗" : "Update failed"),
        );
      }
    } catch {
      setAccountError(locale === "zh-HK" ? "網絡錯誤" : "Network error");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPw !== confirmNewPw) {
      setAccountError(
        locale === "zh-HK" ? "新密碼不一致" : "Passwords do not match",
      );
      return;
    }
    if (newPw.length < 8) {
      setAccountError(
        locale === "zh-HK"
          ? "新密碼最少 8 個字"
          : "Password must be at least 8 characters",
      );
      return;
    }
    setAccountSaving(true);
    setAccountError("");
    setAccountSuccess("");
    try {
      const res = await fetch("/api/tenant-admin/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "password",
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEditingPassword(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmNewPw("");
        setAccountSuccess(
          locale === "zh-HK" ? "密碼已更新" : "Password updated",
        );
        setTimeout(() => setAccountSuccess(""), 3000);
      } else {
        setAccountError(
          data.error || (locale === "zh-HK" ? "更新失敗" : "Update failed"),
        );
      }
    } catch {
      setAccountError(locale === "zh-HK" ? "網絡錯誤" : "Network error");
    } finally {
      setAccountSaving(false);
    }
  };

  // Delivery option handlers
  const toggleDeliveryOption = (index: number) => {
    setFormData((prev) => {
      const options = [...prev.deliveryOptions];
      options[index] = { ...options[index], enabled: !options[index].enabled };
      return { ...prev, deliveryOptions: options };
    });
  };

  const saveEditDelivery = () => {
    if (!editingDelivery) return;
    setFormData((prev) => {
      const options = [...prev.deliveryOptions];
      options[editingDelivery.index] = {
        ...options[editingDelivery.index],
        label: editingDelivery.label,
        price: Number(editingDelivery.price) || 0,
      };
      return { ...prev, deliveryOptions: options };
    });
    setEditingDelivery(null);
  };

  const deleteDeliveryOption = (index: number) => {
    setFormData((prev) => {
      const options = prev.deliveryOptions.filter((_, i) => i !== index);
      return { ...prev, deliveryOptions: options };
    });
  };

  const addDeliveryOption = () => {
    if (!newDeliveryLabel.trim()) return;
    const id =
      newDeliveryLabel
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || `custom-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      deliveryOptions: [
        ...prev.deliveryOptions,
        {
          id,
          label: newDeliveryLabel.trim(),
          price: Number(newDeliveryPrice) || 0,
          enabled: true,
        },
      ],
    }));
    setNewDeliveryLabel("");
    setNewDeliveryPrice("");
    setAddingDelivery(false);
  };

  if (!dataLoaded) {
    return (
      <div className="bg-wlx-cream min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-wlx-stone" />
      </div>
    );
  }

  return (
    <div className="bg-wlx-cream text-wlx-ink pb-20">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-wlx-ink">
              ⚙️ 商店設定
            </h1>
            <p className="text-wlx-stone text-base max-w-lg">
              管理你嘅商店基本資料、聯絡方式同外觀設定
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {saveState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4" />{" "}
                  {locale === "zh-HK" ? "已儲存" : "Saved"}
                </motion.div>
              )}
              {saveState === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />{" "}
                  {errorMessage || (locale === "zh-HK" ? "失敗" : "Failed")}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md bg-wlx-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
                saveState === "saving" && "opacity-80",
              )}
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {locale === "zh-HK" ? "儲存中" : "Saving"}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />{" "}
                  {locale === "zh-HK" ? "儲存" : "Save"}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Plan Status */}
          {planData && (
            <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                  <Crown className="h-5 w-5 text-wlx-stone" />
                  {locale === "zh-HK" ? "方案狀態" : "Plan Status"}
                </h3>
                <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                  {locale === "zh-HK"
                    ? "你嘅訂閱方案同用量"
                    : "Your subscription plan and usage"}
                </p>
              </div>

              {/* Current plan badge */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold",
                    planData.plan === "pro"
                      ? "bg-violet-100 text-violet-700"
                      : planData.plan === "lite"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-wlx-cream text-wlx-stone",
                  )}
                >
                  {planData.plan === "pro"
                    ? "Pro"
                    : planData.plan === "lite"
                      ? "Lite"
                      : "Free"}
                </span>
                {planData.isTrialing && (
                  <span className="text-xs text-amber-600 bg-wlx-cream border border-amber-200 px-2 py-0.5 rounded-full">
                    {locale === "zh-HK" ? "試用中" : "Trial"}
                  </span>
                )}
                {planData.isExpired && (
                  <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {locale === "zh-HK" ? "已到期" : "Expired"}
                  </span>
                )}
              </div>

              {/* SKU usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-wlx-stone">
                    {locale === "zh-HK" ? "產品 (SKU)" : "Products (SKU)"}
                  </span>
                  <span className="font-medium text-wlx-ink">
                    {planData.usage.sku.current} /{" "}
                    {planData.usage.sku.limit === Infinity ||
                    planData.usage.sku.limit > 999999
                      ? "∞"
                      : planData.usage.sku.limit}
                  </span>
                </div>
                {planData.usage.sku.limit !== Infinity &&
                  planData.usage.sku.limit <= 999999 && (
                    <div className="w-full h-2 bg-wlx-cream rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          planData.usage.sku.current /
                            planData.usage.sku.limit >=
                            0.9
                            ? "bg-red-500"
                            : planData.usage.sku.current /
                                  planData.usage.sku.limit >=
                                0.7
                              ? "bg-wlx-cream0"
                              : "bg-emerald-500",
                        )}
                        style={{
                          width: `${Math.min(100, (planData.usage.sku.current / planData.usage.sku.limit) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
              </div>

              {/* Orders usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-wlx-stone">
                    {locale === "zh-HK" ? "本月訂單" : "Orders this month"}
                  </span>
                  <span className="font-medium text-wlx-ink">
                    {planData.usage.orders.current} /{" "}
                    {planData.usage.orders.limit === Infinity ||
                    planData.usage.orders.limit > 999999
                      ? "∞"
                      : planData.usage.orders.limit}
                  </span>
                </div>
                {planData.usage.orders.limit !== Infinity &&
                  planData.usage.orders.limit <= 999999 && (
                    <div className="w-full h-2 bg-wlx-cream rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          planData.usage.orders.current /
                            planData.usage.orders.limit >=
                            0.9
                            ? "bg-red-500"
                            : planData.usage.orders.current /
                                  planData.usage.orders.limit >=
                                0.7
                              ? "bg-wlx-cream0"
                              : "bg-emerald-500",
                        )}
                        style={{
                          width: `${Math.min(100, (planData.usage.orders.current / planData.usage.orders.limit) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
              </div>

              {/* Upgrade CTA — show for free/lite or when near limit */}
              {(planData.plan === "free" ||
                planData.plan === "lite" ||
                planData.usage.sku.current / (planData.usage.sku.limit || 1) >=
                  0.8 ||
                planData.usage.orders.current /
                  (planData.usage.orders.limit || 1) >=
                  0.8) &&
                planData.plan !== "pro" && (
                  <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-violet-900">
                        {locale === "zh-HK"
                          ? "升級解鎖更多功能"
                          : "Upgrade to unlock more features"}
                      </p>
                      <p className="text-xs text-violet-600 mt-0.5">
                        {locale === "zh-HK"
                          ? "升級至 Lite 或 Pro 方案，獲得更多產品配額同進階功能"
                          : "Upgrade to Lite or Pro for more products and advanced features"}
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors flex-shrink-0">
                      {locale === "zh-HK" ? "升級" : "Upgrade"}
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* Basic Info */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <Store className="h-5 w-5 text-wlx-stone" />
                基本資料
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
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
                  <span className="text-sm text-wlx-stone">wowlix.com/</span>
                  <SettingsInput
                    id="slug"
                    value={formData.slug || ""}
                    onChange={handleChange}
                    placeholder="myshopp"
                  />
                </div>
                {slugWarning && (
                  <div className="flex items-start gap-2 p-3 bg-wlx-cream border border-amber-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      ⚠️ 改網址會影響現有連結
                    </p>
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
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <Phone className="h-5 w-5 text-wlx-stone" />
                聯絡方式
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                客人聯絡你嘅方式
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>WhatsApp 電話號碼</Label>
                <SettingsInput
                  id="whatsapp"
                  value={formData.whatsapp || ""}
                  onChange={handleChange}
                  placeholder="+852 9XXX XXXX"
                />
                <Description>用於結帳 WhatsApp 通知按鈕</Description>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <Share2 className="h-5 w-5 text-wlx-stone" />
                社交媒體連結
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                顯示喺你商店頁面嘅社交媒體 icon（最多 {MAX_SOCIAL_LINKS} 個）
              </p>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {formData.socialLinks.map((link, index) => {
                  const platformInfo = SOCIAL_PLATFORMS.find(
                    (p) => p.id === link.platform,
                  );
                  return (
                    <motion.div
                      key={`${link.platform}-${index}`}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-center gap-2 rounded-lg border border-wlx-mist bg-wlx-cream/50 p-3"
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...formData.socialLinks];
                            [next[index - 1], next[index]] = [
                              next[index],
                              next[index - 1],
                            ];
                            setFormData((prev) => ({
                              ...prev,
                              socialLinks: next,
                            }));
                          }}
                          className="p-0.5 rounded hover:bg-wlx-mist disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-wlx-stone" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formData.socialLinks.length - 1}
                          onClick={() => {
                            const next = [...formData.socialLinks];
                            [next[index], next[index + 1]] = [
                              next[index + 1],
                              next[index],
                            ];
                            setFormData((prev) => ({
                              ...prev,
                              socialLinks: next,
                            }));
                          }}
                          className="p-0.5 rounded hover:bg-wlx-mist disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-wlx-stone" />
                        </button>
                      </div>

                      {/* Platform icon + name */}
                      <div className="flex items-center gap-2 w-28 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-wlx-mist/80 flex items-center justify-center text-wlx-stone">
                          <SocialPlatformIcon
                            platform={link.platform}
                            className="w-4 h-4"
                          />
                        </div>
                        <span className="text-sm font-medium text-wlx-stone truncate">
                          {platformInfo?.name || link.platform}
                        </span>
                      </div>

                      {/* URL input */}
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const next = formData.socialLinks.map((l, i) =>
                            i === index ? { ...l, url: e.target.value } : l,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            socialLinks: next,
                          }));
                        }}
                        placeholder={platformInfo?.placeholder || "https://..."}
                        className="flex-1 h-9 rounded-md border border-wlx-mist bg-white px-3 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      />

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.socialLinks.filter(
                            (_, i) => i !== index,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            socialLinks: next,
                          }));
                        }}
                        className="p-1.5 rounded-md text-wlx-stone hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {formData.socialLinks.length === 0 && (
                <p className="text-sm text-wlx-stone py-4 text-center">
                  未有社交媒體連結
                </p>
              )}
            </div>

            {/* Add platform dropdown */}
            {formData.socialLinks.length < MAX_SOCIAL_LINKS && (
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const next = [
                      ...formData.socialLinks,
                      { platform: e.target.value, url: "" },
                    ];
                    setFormData((prev) => ({ ...prev, socialLinks: next }));
                    e.target.value = "";
                  }}
                  className="w-full h-10 rounded-md border border-dashed border-wlx-mist bg-white px-3 text-sm text-wlx-stone hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-colors cursor-pointer appearance-none"
                >
                  <option value="">+ 新增社交媒體</option>
                  {SOCIAL_PLATFORMS.filter(
                    (p) =>
                      !formData.socialLinks.some((l) => l.platform === p.id),
                  ).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.socialLinks.length >= MAX_SOCIAL_LINKS && (
              <p className="text-xs text-wlx-stone text-center">
                已達上限 {MAX_SOCIAL_LINKS} 個
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-wlx-stone" />
                貨幣
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                商店顯示嘅貨幣
              </p>
            </div>

            <div className="space-y-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, currency: c.code }))
                  }
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
                    formData.currency === c.code
                      ? "border-zinc-900 bg-wlx-cream"
                      : "border-wlx-mist hover:border-wlx-mist",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      formData.currency === c.code
                        ? "border-zinc-900"
                        : "border-wlx-mist",
                    )}
                  >
                    {formData.currency === c.code && (
                      <div className="w-2 h-2 rounded-full bg-wlx-ink" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-wlx-ink">
                    {c.symbol} {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods (link card) */}
          <Link
            href={`/${locale}/admin/settings/payment-methods`}
            className="block rounded-xl border border-wlx-mist bg-white p-6 md:p-8 hover:border-wlx-mist hover:bg-wlx-cream/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-wlx-stone" />
                  收款方式
                </h3>
                <p className="text-sm text-wlx-stone mt-1">
                  設定 FPS、PayMe、AlipayHK、銀行過數等收款方式
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-wlx-stone group-hover:text-wlx-stone transition-colors flex-shrink-0" />
            </div>
          </Link>

          {/* Delivery Options */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <Truck className="h-5 w-5 text-wlx-stone" />
                送貨方式
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                管理客人結帳時嘅送貨選項
              </p>
            </div>

            <div className="space-y-2">
              {formData.deliveryOptions.map((opt, index) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-wlx-mist"
                >
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDeliveryOption(index)}
                    className={cn(
                      "w-10 h-6 rounded-full relative transition-colors flex-shrink-0",
                      opt.enabled ? "bg-emerald-500" : "bg-zinc-300",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all",
                        opt.enabled ? "left-[18px]" : "left-0.5",
                      )}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        opt.enabled ? "text-wlx-ink" : "text-wlx-stone",
                      )}
                    >
                      {opt.label}
                    </span>
                  </div>

                  <span className="text-sm text-wlx-stone flex-shrink-0">
                    ${opt.price}
                  </span>

                  {/* Edit button */}
                  <button
                    onClick={() =>
                      setEditingDelivery({
                        index,
                        label: opt.label,
                        price: String(opt.price),
                      })
                    }
                    className="w-7 h-7 rounded-md bg-wlx-cream flex items-center justify-center hover:bg-wlx-mist transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-wlx-stone" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteDeliveryOption(index)}
                    className="w-7 h-7 rounded-md bg-wlx-cream flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-wlx-stone hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new delivery option */}
            {!addingDelivery ? (
              <button
                onClick={() => setAddingDelivery(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-wlx-stone bg-wlx-cream rounded-md hover:bg-wlx-mist transition-colors"
              >
                <Plus className="h-4 w-4" /> 新增送貨方式
              </button>
            ) : (
              <div className="border border-wlx-mist rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <Label>名稱</Label>
                  <input
                    type="text"
                    value={newDeliveryLabel}
                    onChange={(e) => setNewDeliveryLabel(e.target.value)}
                    placeholder="郵寄"
                    className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>運費</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-wlx-stone">$</span>
                    <input
                      type="number"
                      value={newDeliveryPrice}
                      onChange={(e) => setNewDeliveryPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAddingDelivery(false);
                      setNewDeliveryLabel("");
                      setNewDeliveryPrice("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-wlx-stone bg-wlx-cream rounded-md hover:bg-wlx-mist transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={addDeliveryOption}
                    className="px-4 py-2 text-sm font-medium text-white bg-wlx-ink rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    儲存
                  </button>
                </div>
              </div>
            )}

            {/* Edit delivery modal (inline) */}
            {editingDelivery && (
              <div className="border border-wlx-mist rounded-lg p-4 space-y-3 bg-wlx-cream">
                <h4 className="text-sm font-semibold text-wlx-ink">
                  編輯送貨方式
                </h4>
                <div className="space-y-2">
                  <Label>名稱</Label>
                  <input
                    type="text"
                    value={editingDelivery.label}
                    onChange={(e) =>
                      setEditingDelivery((prev) =>
                        prev ? { ...prev, label: e.target.value } : null,
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>運費</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-wlx-stone">$</span>
                    <input
                      type="number"
                      value={editingDelivery.price}
                      onChange={(e) =>
                        setEditingDelivery((prev) =>
                          prev ? { ...prev, price: e.target.value } : null,
                        )
                      }
                      min="0"
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDelivery(null)}
                    className="px-4 py-2 text-sm font-medium text-wlx-stone bg-wlx-cream rounded-md hover:bg-wlx-mist transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveEditDelivery}
                    className="px-4 py-2 text-sm font-medium text-white bg-wlx-ink rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    儲存
                  </button>
                </div>
              </div>
            )}

            {/* Free shipping threshold */}
            <div className="pt-4 border-t border-wlx-mist space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      freeShippingEnabled: !prev.freeShippingEnabled,
                    }))
                  }
                  className={cn(
                    "w-10 h-6 rounded-full relative transition-colors flex-shrink-0",
                    formData.freeShippingEnabled
                      ? "bg-emerald-500"
                      : "bg-zinc-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all",
                      formData.freeShippingEnabled ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </button>
                <Label>免運費門檻</Label>
              </div>
              {formData.freeShippingEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-wlx-stone">滿 $</span>
                  <input
                    type="number"
                    value={formData.freeShippingThreshold ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freeShippingThreshold: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    placeholder="500"
                    min="0"
                    className="flex h-10 w-32 rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  />
                  <span className="text-sm text-wlx-stone">免運費</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Confirmation Message */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-wlx-stone" />
                訂單訊息
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                自訂客人完成訂單後嘅顯示訊息
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>確認頁面文字</Label>
                <input
                  type="text"
                  value={formData.orderConfirmMessage.thanks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderConfirmMessage: {
                        ...prev.orderConfirmMessage,
                        thanks: e.target.value,
                      },
                    }))
                  }
                  placeholder="多謝你嘅訂單！"
                  className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
                <Description>完成落單後顯示嘅感謝文字</Description>
              </div>

              <div className="space-y-3">
                <Label>WhatsApp 模板</Label>
                <textarea
                  value={formData.orderConfirmMessage.whatsappTemplate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderConfirmMessage: {
                        ...prev.orderConfirmMessage,
                        whatsappTemplate: e.target.value,
                      },
                    }))
                  }
                  placeholder="你好！我落咗單 #{orderNumber}"
                  rows={2}
                  className="flex min-h-[60px] w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink placeholder:text-wlx-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                />
                <Description>可用 {"#{orderNumber}"} 代入訂單編號</Description>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <Palette className="h-5 w-5 text-wlx-stone" />
                外觀
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
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
                          : "border-wlx-mist hover:border-zinc-400",
                      )}
                      style={{ backgroundColor: template.color }}
                    >
                      <span className="text-xs text-white font-medium mt-auto mb-1">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>封面圖</Label>
                <ImageUpload
                  currentUrl={formData.coverPhoto || undefined}
                  onUpload={(url) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverPhoto: url || null,
                    }))
                  }
                  label="上傳封面圖"
                  hint="建議尺寸：1200×400，JPG / PNG，最大 5MB"
                  aspectClass="aspect-[3/1]"
                />
                <Description>商店頂部嘅封面相片</Description>
              </div>

              <div className="space-y-3">
                <Label>頭像</Label>
                <ImageUpload
                  currentUrl={formData.logo || undefined}
                  onUpload={(url) =>
                    setFormData((prev) => ({ ...prev, logo: url || null }))
                  }
                  label="上傳頭像"
                  hint="建議尺寸：200×200，JPG / PNG，最大 5MB"
                  previewRounded
                />
                <Description>商店嘅 logo 或頭像</Description>
              </div>

              {/* Hide Branding Toggle (Pro only) */}
              <div className="pt-4 border-t border-wlx-mist space-y-3">
                <div className="flex items-center gap-3">
                  {planData?.plan === "pro" ? (
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hideBranding: !prev.hideBranding,
                        }))
                      }
                      className={cn(
                        "w-10 h-6 rounded-full relative transition-colors flex-shrink-0",
                        formData.hideBranding
                          ? "bg-emerald-500"
                          : "bg-zinc-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all",
                          formData.hideBranding ? "left-[18px]" : "left-0.5",
                        )}
                      />
                    </button>
                  ) : (
                    <div className="w-10 h-6 rounded-full bg-wlx-mist relative flex-shrink-0 cursor-not-allowed">
                      <div className="w-5 h-5 rounded-full bg-white shadow absolute top-0.5 left-0.5" />
                    </div>
                  )}
                  <Label
                    className={
                      planData?.plan !== "pro" ? "text-wlx-stone" : undefined
                    }
                  >
                    {locale === "zh-HK"
                      ? "隱藏 WoWlix 品牌"
                      : "Hide WoWlix branding"}
                  </Label>
                  {planData?.plan !== "pro" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                      <Lock className="h-3 w-3" /> Pro
                    </span>
                  )}
                </div>
                <Description>
                  {planData?.plan !== "pro"
                    ? locale === "zh-HK"
                      ? "升級至 Pro 方案即可移除頁底嘅「Powered by WoWlix」字樣"
                      : 'Upgrade to Pro to remove the "Powered by WoWlix" text from your store footer'
                    : locale === "zh-HK"
                      ? "開啟後會隱藏頁底嘅「Powered by WoWlix」字樣"
                      : 'When enabled, hides the "Powered by WoWlix" text from your store footer'}
                </Description>
                {planData?.plan !== "pro" && (
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors">
                    {locale === "zh-HK" ? "升級至 Pro" : "Upgrade to Pro"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-wlx-mist bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-wlx-ink flex items-center gap-2">
                <User className="h-5 w-5 text-wlx-stone" />
                帳戶
              </h3>
              <p className="text-sm text-wlx-stone mt-1 border-b border-wlx-mist pb-4">
                帳戶相關設定
              </p>
            </div>

            {/* Feedback */}
            {accountSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> {accountSuccess}
              </div>
            )}
            {accountError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" /> {accountError}
              </div>
            )}

            <div className="space-y-4">
              {/* Email row */}
              <div className="py-2">
                <Label>Email</Label>
                {!editingEmail ? (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-wlx-stone">
                      {accountEmail || formData.email || "未設定"}
                    </p>
                    <button
                      onClick={() => {
                        setNewEmail(accountEmail || formData.email || "");
                        setEditingEmail(true);
                        setAccountError("");
                      }}
                      className="text-xs px-2 py-1 rounded bg-wlx-cream text-wlx-stone hover:bg-wlx-mist transition-colors"
                    >
                      更改
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      placeholder="新 Email"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEmail(false);
                          setAccountError("");
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-wlx-stone bg-wlx-cream rounded-md hover:bg-wlx-mist transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveEmail}
                        disabled={accountSaving}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-wlx-ink rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        {accountSaving ? "儲存中..." : "儲存"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password row */}
              <div className="py-2 border-t border-wlx-mist">
                <Label>密碼</Label>
                {!editingPassword ? (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-wlx-stone tracking-widest">
                      ••••••••
                    </p>
                    <button
                      onClick={() => {
                        setEditingPassword(true);
                        setAccountError("");
                      }}
                      className="text-xs px-2 py-1 rounded bg-wlx-cream text-wlx-stone hover:bg-wlx-mist transition-colors"
                    >
                      更改
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      placeholder="舊密碼"
                      autoComplete="current-password"
                    />
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      placeholder="新密碼（最少 8 個字）"
                      autoComplete="new-password"
                    />
                    <input
                      type="password"
                      value={confirmNewPw}
                      onChange={(e) => setConfirmNewPw(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                      placeholder="確認新密碼"
                      autoComplete="new-password"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPassword(false);
                          setCurrentPw("");
                          setNewPw("");
                          setConfirmNewPw("");
                          setAccountError("");
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-wlx-stone bg-wlx-cream rounded-md hover:bg-wlx-mist transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSavePassword}
                        disabled={accountSaving}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-wlx-ink rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        {accountSaving ? "儲存中..." : "儲存"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="pt-2 border-t border-wlx-mist">
                <button
                  onClick={() => {
                    if (confirm("確定要登出？")) {
                      window.location.href = `/${locale}/admin/logout`;
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
