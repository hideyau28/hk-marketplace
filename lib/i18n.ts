import zhHK from "@/messages/zh-HK.json";
import en from "@/messages/en.json";

export type Locale = "zh-HK" | "en";
export const locales: Locale[] = ["zh-HK", "en"];

const dict = { "zh-HK": zhHK, "en": en } as const;
export function getDict(locale: Locale) {
  return dict[locale] ?? dict["en"];
}
