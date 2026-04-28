import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export const alt = "WoWlix storefront";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  paper: "#FBFAF7",
  cream: "#F8F6F2",
  ink: "#1A1A1A",
  stone: "#6F6A63",
  mist: "#E8E5DE",
  fallbackAccent: "#C9A961",
};

type Props = { params: Promise<{ slug: string; locale: string }> };

export default async function OgImage({ params }: Props) {
  const { slug } = await params;

  let tenant: {
    name: string;
    description: string | null;
    brandColor: string | null;
    logoUrl: string | null;
    coverPhoto: string | null;
  } | null = null;

  try {
    tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        brandColor: true,
        logoUrl: true,
        coverPhoto: true,
      },
    });
  } catch {
    tenant = null;
  }

  if (!tenant) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.paper,
            color: COLORS.ink,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            fontSize: 48,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          WoWlix
        </div>
      ),
      { ...size },
    );
  }

  const accent = tenant.brandColor || COLORS.ink;
  const fallbackInitial = tenant.name.trim().charAt(0).toUpperCase() || "W";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: COLORS.paper,
          color: COLORS.ink,
          fontFamily: "system-ui, sans-serif",
          padding: "72px 80px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top — restrained brand wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: COLORS.stone,
          }}
        >
          WoWlix
        </div>

        {/* Center — tenant identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          {/* Logo / fallback initial */}
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt=""
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: `1px solid ${COLORS.mist}`,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: accent,
                color: COLORS.paper,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 500,
              }}
            >
              {fallbackInitial}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 960,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 88,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: COLORS.ink,
              }}
            >
              {tenant.name}
            </div>
            {tenant.description && (
              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  lineHeight: 1.35,
                  color: COLORS.stone,
                  overflow: "hidden",
                  maxHeight: 88,
                }}
              >
                {tenant.description.length > 90
                  ? tenant.description.slice(0, 87) + "…"
                  : tenant.description}
              </div>
            )}
          </div>
        </div>

        {/* Footer — URL pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            paddingTop: 28,
            borderTop: `1px solid ${COLORS.mist}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: COLORS.stone,
            }}
          >
            wowlix.com/{slug}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: COLORS.stone,
            }}
          >
            Tasteful · IG-native · 0% commission
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
