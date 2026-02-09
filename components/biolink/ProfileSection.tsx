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

  return (
    <div className="relative -mt-12 px-5 pb-4">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full border-[3px] border-[#0f0f0f] overflow-hidden mx-auto mb-3"
        style={{ boxShadow: `0 0 20px ${color}40` }}
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
      <h1 className="text-white text-lg font-bold text-center">{tenant.name}</h1>

      {/* Tagline */}
      {tenant.description && (
        <p className="text-zinc-400 text-sm text-center mt-1 line-clamp-2">
          {tenant.description}
        </p>
      )}

    </div>
  );
}
