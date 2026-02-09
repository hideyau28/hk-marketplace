import {
  FaInstagram, FaFacebookF, FaYoutube, FaTiktok,
  FaWhatsapp, FaTelegram, FaThreads
} from "react-icons/fa6";
import { HiLink } from "react-icons/hi";

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  match: (url: string) => boolean;
}

const PLATFORMS: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: FaInstagram,
    color: "#E4405F",
    match: url => url.includes("instagram.com"),
  },
  {
    name: "Facebook",
    icon: FaFacebookF,
    color: "#1877F2",
    match: url => url.includes("facebook.com") || url.includes("fb.com"),
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    color: "#FF0000",
    match: url => url.includes("youtube.com") || url.includes("youtu.be"),
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    color: "#000000",
    match: url => url.includes("tiktok.com"),
  },
  {
    name: "Threads",
    icon: FaThreads,
    color: "#000000",
    match: url => url.includes("threads.net"),
  },
  {
    name: "小紅書",
    icon: HiLink,
    color: "#FE2C55",
    match: url => url.includes("xiaohongshu.com") || url.includes("xhslink.com"),
  },
  {
    name: "Telegram",
    icon: FaTelegram,
    color: "#26A5E4",
    match: url => url.includes("t.me") || url.includes("telegram.me"),
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    color: "#25D366",
    match: url => url.includes("wa.me") || url.includes("whatsapp.com"),
  },
  {
    name: "Carousell",
    icon: HiLink,
    color: "#FF4747",
    match: url => url.includes("carousell.com") || url.includes("carousell.hk"),
  },
  {
    name: "Lemon8",
    icon: HiLink,
    color: "#FFE135",
    match: url => url.includes("lemon8-app.com"),
  },
  {
    name: "OpenRice",
    icon: HiLink,
    color: "#FF6600",
    match: url => url.includes("openrice.com"),
  },
];

const FALLBACK_PLATFORM: SocialPlatform = {
  name: "連結",
  icon: HiLink,
  color: "#888888",
  match: () => true,
};

export function detectPlatform(url: string): SocialPlatform {
  return PLATFORMS.find(p => p.match(url)) || FALLBACK_PLATFORM;
}
