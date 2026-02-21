"use client";

import Image from "next/image";
import { getAvatarFallback } from "@/lib/biolink-helpers";
import type { TenantForBioLink } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";

type Props = {
  tenant: TenantForBioLink;
};

export default function ProfileSection({ tenant }: Props) {
  const tmpl = useTemplate();
  const fallbackLetter = getAvatarFallback(tenant);
  const color = tenant.brandColor || tmpl.accent;

  return (
    <div className="relative -mt-12 px-5 pb-4">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full border-[3px] overflow-hidden mx-auto mb-3"
        style={{ borderColor: tmpl.bg, boxShadow: `0 0 20px ${color}40` }}
      >
        {tenant.logoUrl ? (
          <Image
            src={tenant.logoUrl}
            alt={tenant.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {fallbackLetter}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="text-lg font-bold text-center" style={{ color: tmpl.text, fontFamily: tmpl.headingFont }}>{tenant.name}</h1>

      {/* Tagline */}
      {tenant.description && (
        <p className="text-sm text-center mt-1 line-clamp-2" style={{ color: tmpl.subtext }}>
          {tenant.description}
        </p>
      )}

      {/* Social links — icon-only (WhatsApp 由 floating button 處理) */}
      {tenant.instagram && (
        <div className="flex justify-center gap-3 mt-3">
          <a
            href={`https://instagram.com/${tenant.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${tmpl.subtext}20`, color: tmpl.subtext }}
            aria-label="Instagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      )}

    </div>
  );
}
