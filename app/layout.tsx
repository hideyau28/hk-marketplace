import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let tenantName = "HK•Market";
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: "hk-marketplace" },
      select: { name: true },
    });
    if (tenant?.name) tenantName = tenant.name;
  } catch {}

  return {
    title: `${tenantName} - Sports Gear for Hong Kong`,
    description: "Shop the latest sports apparel and gear from Nike, Adidas, Puma and more.",
    manifest: "/manifest.json",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-zinc-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
