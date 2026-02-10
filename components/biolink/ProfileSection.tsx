"use client";

import Image from "next/image";
import { getAvatarFallback } from "@/lib/biolink-helpers";
import type { TenantForBioLink } from "@/lib/biolink-helpers";

type Props = {
  tenant: TenantForBioLink;
};

export default function ProfileSection({ tenant }: Props) {
  const fallbackLetter = getAvatarFallback(tenant);
  const color = tenant.brandColor || "#FF9500";
  // tagline 優先，description 作 fallback
  const displayTagline = tenant.tagline || tenant.description;

  return (
    <div className="relative -mt-8 px-5 pb-4">
      {/* Avatar — 縮小到 56px */}
      <div
        className="w-14 h-14 rounded-full border-[3px] border-[#0f0f0f] overflow-hidden mx-auto mb-2"
        style={{ boxShadow: `0 0 16px ${color}40` }}
      >
        {tenant.logoUrl ? (
          <Image
            src={tenant.logoUrl}
            alt={tenant.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {fallbackLetter}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="text-white text-lg font-bold text-center">{tenant.name}</h1>

      {/* Tagline */}
      {displayTagline && (
        <p className="text-zinc-400 text-sm text-center mt-0.5 line-clamp-2">
          {displayTagline}
        </p>
      )}

      {/* Location */}
      {tenant.location && (
        <p className="text-zinc-500 text-xs text-center mt-0.5">
          📍 {tenant.location}
        </p>
      )}

    </div>
  );
}
