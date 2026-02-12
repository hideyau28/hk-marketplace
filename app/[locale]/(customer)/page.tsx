import { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "WoWlix — Turn Followers into Customers",
    description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。免費開始。",
    openGraph: {
      title: "WoWlix — Turn Followers into Customers",
      description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。",
      url: "https://wowlix.com",
      siteName: "WoWlix",
      locale: "zh_HK",
      type: "website",
    },
  };
}

export default function Home() {
  return <LandingPage />;
}
