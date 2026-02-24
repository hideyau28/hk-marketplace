import { ReactNode } from "react";
import {
  DM_Sans,
  JetBrains_Mono,
  Noto_Sans_TC,
  Plus_Jakarta_Sans,
} from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "500", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${notoSansTC.variable} ${plusJakartaSans.variable}`}
    >
      {children}
    </div>
  );
}
