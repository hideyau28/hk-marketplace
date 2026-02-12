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

  const social = {
    instagram: tenant.instagram?.trim() || null,
    facebook: tenant.facebook?.trim() || null,
    whatsapp: tenant.whatsapp?.trim() || null,
  };

  const hasSocial = !!(social.instagram || social.facebook || social.whatsapp);

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

      {/* Social icons */}
      {hasSocial && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.75-2.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
              </svg>
            </a>
          )}

          {social.facebook && (
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.2-1.5 1.6-1.5H16.7V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.3V11H7.5v3h2.7v8h3.3Z" />
              </svg>
            </a>
          )}

          {social.whatsapp && (
            <a
              href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-[#25D366]/15 flex items-center justify-center hover:bg-[#25D366]/25 transition-colors"
            >
              <svg className="w-4.5 h-4.5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
