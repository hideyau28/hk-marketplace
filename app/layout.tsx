import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit, Inter } from "next/font/google";
import { getStoreName } from "@/lib/get-store-name";
import { isPlatformMode } from "@/lib/tenant";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  // Platform bare domain → WoWlix branding
  if (await isPlatformMode()) {
    return {
      title: "WoWlix — Turn Followers into Customers",
      description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。免費開始。",
      manifest: "/manifest.json",
      icons: {
        icon: "/favicon.svg",
      },
    };
  }

  const storeName = await getStoreName();

  return {
    title: `${storeName} - Sports Gear for Hong Kong`,
    description: "Shop the latest sports apparel and gear from Nike, Adidas, Puma and more.",
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.svg",
    },
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
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${inter.variable} bg-white text-zinc-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
