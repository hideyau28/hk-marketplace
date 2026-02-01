import { translations } from "@/lib/translations";

export type Locale = "zh-HK" | "en";
export const locales: Locale[] = ["zh-HK", "en"];

const dict = { "zh-HK": translations["zh-HK"], en: translations.en };
export function getDict(locale: Locale): typeof translations.en {
  return dict[locale] ?? dict["en"];
}
