import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "開店 | WoWlix",
  description: "2 分鐘開店，一條連結搞掂所有嘢。免費開始。",
};

export default function StartLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
