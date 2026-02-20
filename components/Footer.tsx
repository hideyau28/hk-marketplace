import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { Instagram, Facebook, Youtube } from "lucide-react";

type SocialLink = { platform: string; url: string };

// Platform → resolved href
function resolveSocialHref(platform: string, url: string): string {
  if (!url) return "#";
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
    case "instagram":
      return url.startsWith("http") ? url : `https://instagram.com/${url.replace(/^@/, "")}`;
    case "facebook":
      return url.startsWith("http") ? url : `https://facebook.com/${url}`;
    case "telegram":
      return url.startsWith("http") ? url : `https://t.me/${url.replace(/^@/, "")}`;
    case "tiktok":
      return url.startsWith("http") ? url : `https://tiktok.com/@${url.replace(/^@/, "")}`;
    case "threads":
      return url.startsWith("http") ? url : `https://threads.net/@${url.replace(/^@/, "")}`;
    case "youtube":
      return url.startsWith("http") ? url : `https://youtube.com/@${url.replace(/^@/, "")}`;
    case "x":
      return url.startsWith("http") ? url : `https://x.com/${url.replace(/^@/, "")}`;
    case "xiaohongshu":
      return url.startsWith("http") ? url : `https://www.xiaohongshu.com/user/profile/${url}`;
    case "wechat":
      return "#"; // WeChat doesn't have direct links; show as info
    default:
      return url.startsWith("http") ? url : `https://${url}`;
  }
}

// SVG icons per platform
function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "instagram":
      return <Instagram size={20} className="text-white" />;
    case "facebook":
      return <Facebook size={20} className="text-white" />;
    case "youtube":
      return <Youtube size={20} className="text-white" />;
    case "whatsapp":
      return (
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.731 2.177-1.14 3.655-1.153l.006-.001c.882.004 1.67.107 2.349.305-.18-.96-.585-1.7-1.21-2.203-.795-.64-1.96-.964-3.464-.964h-.018c-1.391.009-2.512.398-3.332 1.155l-1.372-1.48C7.075 3.593 8.639 3.06 10.504 3.044h.023c1.905.015 3.421.498 4.508 1.437.974.84 1.59 2.005 1.834 3.46.464.172.9.385 1.302.639 1.19.75 2.065 1.766 2.53 2.936.776 1.95.72 4.665-1.333 6.68C17.67 19.928 15.565 20.792 12.186 24zM11.093 14.7c-.287.002-.57.018-.844.047-1.028.083-1.72.403-2.06.702-.44.387-.597.838-.57 1.325.03.548.337 1.058.87 1.402.606.393 1.373.552 2.159.513 1.07-.058 1.855-.433 2.395-1.145.364-.48.629-1.1.786-1.841a8.136 8.136 0 0 0-2.736-.503z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "xiaohongshu":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M10.535 2.513a5.47 5.47 0 0 1 3.334 0l5.534 1.746a2.75 2.75 0 0 1 1.849 2.353l.69 6.9a5.46 5.46 0 0 1-1.203 4.065l-3.874 4.702a2.75 2.75 0 0 1-2.973.857l-1.706-.537a5.47 5.47 0 0 1-1.171-.543l-.107-.066a5.47 5.47 0 0 1-1.17.543l-1.707.537a2.75 2.75 0 0 1-2.972-.857l-3.874-4.702A5.46 5.46 0 0 1 .98 13.512l.69-6.9a2.75 2.75 0 0 1 1.85-2.353zm2.686 1.412a3.97 3.97 0 0 0-2.418 0L5.27 5.67a1.25 1.25 0 0 0-.841 1.07l-.69 6.9a3.96 3.96 0 0 0 .872 2.948l3.874 4.702a1.25 1.25 0 0 0 1.351.39l1.706-.538a3.97 3.97 0 0 0 1.47-.844 3.97 3.97 0 0 0 1.47.844l1.706.537a1.25 1.25 0 0 0 1.35-.39l3.875-4.701a3.96 3.96 0 0 0 .873-2.948l-.69-6.9a1.25 1.25 0 0 0-.842-1.07zm.479 5.27a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75m-3.7.75a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0z" />
        </svg>
      );
    case "wechat":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.958-7.062-6.122zm-2.18 2.768c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
        </svg>
      );
    default:
      // Fallback: globe icon
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx={12} cy={12} r={10} />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
        </svg>
      );
  }
}

// Platform-specific hover colors
function getHoverClass(platform: string): string {
  switch (platform) {
    case "whatsapp": return "hover:bg-[#25D366]";
    case "instagram": return "hover:bg-[#E1306C]";
    case "facebook": return "hover:bg-[#1877F2]";
    case "telegram": return "hover:bg-[#0088CC]";
    case "tiktok": return "hover:bg-[#010101]";
    case "youtube": return "hover:bg-[#FF0000]";
    case "x": return "hover:bg-[#000000]";
    case "threads": return "hover:bg-[#000000]";
    case "xiaohongshu": return "hover:bg-[#FE2C55]";
    case "wechat": return "hover:bg-[#07C160]";
    default: return "hover:bg-zinc-600";
  }
}

type FooterProps = {
  locale: Locale;
  t: Translations;
  storeName?: string;
  hideBranding?: boolean;
  socialLinks?: SocialLink[];
  // Legacy fallback props
  whatsappNumber?: string | null;
  instagramUrl?: string | null;
};

export default function Footer({ locale, t, storeName = "May's Shop", hideBranding = false, socialLinks, whatsappNumber, instagramUrl }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Build effective links: prefer socialLinks array, fall back to legacy fields
  const effectiveLinks: SocialLink[] = (socialLinks && socialLinks.length > 0)
    ? socialLinks
    : [
        ...(instagramUrl ? [{ platform: "instagram", url: instagramUrl }] : []),
        ...(whatsappNumber ? [{ platform: "whatsapp", url: whatsappNumber }] : []),
      ];

  return (
    <footer className="bg-zinc-900 text-zinc-100 pb-24 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="px-6 py-8 text-center">
        {/* Brand */}
        <h3 className="text-lg font-bold mb-3">{storeName}</h3>

        {/* Links - Single line with · separator */}
        <div className="flex justify-center items-center gap-1 mb-4 text-sm">
          <Link
            href={`/${locale}/about`}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {t.footer.about}
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href={`/${locale}/contact`}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {t.footer.contact}
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href={`/${locale}/privacy`}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {t.footer.privacy}
          </Link>
          <span className="text-zinc-600">·</span>
          <Link
            href={`/${locale}/terms`}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {t.footer.terms}
          </Link>
        </div>

        {/* Social icons — dynamic from socialLinks or legacy fields */}
        {effectiveLinks.length > 0 && (
          <div className="flex justify-center gap-3 mb-4">
            {effectiveLinks.map((link) => {
              const href = resolveSocialHref(link.platform, link.url);
              if (href === "#") return null; // Skip non-linkable (e.g. WeChat with no URL)
              return (
                <a
                  key={link.platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center transition-colors ${getHoverClass(link.platform)}`}
                  aria-label={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              );
            })}
          </div>
        )}

        {/* Copyright */}
        <p className="text-zinc-500 text-xs">
          © {currentYear} {storeName}. {t.footer.rights}
        </p>

        {/* Powered by WoWlix — hidden only for Pro with hideBranding */}
        {!hideBranding && (
          <p className="text-zinc-600 text-[10px] mt-2">
            {t.footer.poweredBy}{" "}
            <a
              href="https://wowlix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors underline"
            >
              WoWlix
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
