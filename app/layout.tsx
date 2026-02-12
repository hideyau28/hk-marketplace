import type { Metadata } from "next";
import localFont from "next/font/local";
import { getStoreName } from "@/lib/get-store-name";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-zinc-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
