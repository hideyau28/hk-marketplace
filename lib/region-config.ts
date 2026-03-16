/**
 * Region-based configuration for international checkout.
 * All region-specific logic reads from here — zero hardcoding in components.
 */

export type RegionCode = "HK" | "ME" | "SG" | "TW" | "MY" | "JP" | "US" | "EU";

export type PhoneConfig = {
  code: string;        // e.g. "+852"
  placeholder: string; // e.g. "9XXX XXXX"
  maxDigits: number;   // e.g. 8
  minDigits: number;   // e.g. 7
};

export type AddressField = {
  key: string;
  label: string;       // English label
  labelZh?: string;    // Chinese label (optional)
  placeholder: string;
  required: boolean;
  type: "text" | "select";
  options?: string[];   // for select type
};

export type RegionConfig = {
  code: RegionCode;
  name: string;
  phone: PhoneConfig;
  /** Country codes available in the dropdown for this region */
  phoneCodes: Array<{ code: string; country: string; flag: string }>;
  /** Address fields for delivery forms */
  addressFields: AddressField[];
  /** Whether to show district-based address (HK-specific) */
  useDistrictAddress: boolean;
};

// ─── Phone code options per region ───

const PHONE_CODES_HK = [
  { code: "+852", country: "HK", flag: "🇭🇰" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+886", country: "TW", flag: "🇹🇼" },
];

const PHONE_CODES_ME = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+974", country: "QA", flag: "🇶🇦" },
  { code: "+973", country: "BH", flag: "🇧🇭" },
  { code: "+965", country: "KW", flag: "🇰🇼" },
  { code: "+968", country: "OM", flag: "🇴🇲" },
  { code: "+962", country: "JO", flag: "🇯🇴" },
  { code: "+961", country: "LB", flag: "🇱🇧" },
];

const PHONE_CODES_SG = [
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
];

const PHONE_CODES_DEFAULT = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+852", country: "HK", flag: "🇭🇰" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
];

// ─── Address field templates ───

const HK_ADDRESS_FIELDS: AddressField[] = [
  {
    key: "district",
    label: "District",
    labelZh: "地區",
    placeholder: "Select district",
    required: true,
    type: "select",
    options: ["Hong Kong Island", "Kowloon", "New Territories", "Outlying Islands"],
  },
  {
    key: "line1",
    label: "Street Address",
    labelZh: "街道地址",
    placeholder: "e.g. 10 Shing Yip Street, Kwun Tong",
    required: true,
    type: "text",
  },
  {
    key: "building",
    label: "Building",
    labelZh: "大廈名稱",
    placeholder: "Building name",
    required: false,
    type: "text",
  },
  {
    key: "floor",
    label: "Floor",
    labelZh: "樓層",
    placeholder: "Floor",
    required: false,
    type: "text",
  },
  {
    key: "unit",
    label: "Unit / Flat",
    labelZh: "室",
    placeholder: "Unit",
    required: false,
    type: "text",
  },
];

const INTERNATIONAL_ADDRESS_FIELDS: AddressField[] = [
  {
    key: "line1",
    label: "Address Line 1",
    placeholder: "Street address, apartment, suite",
    required: true,
    type: "text",
  },
  {
    key: "line2",
    label: "Address Line 2",
    placeholder: "Building, floor, unit (optional)",
    required: false,
    type: "text",
  },
  {
    key: "city",
    label: "City",
    placeholder: "City",
    required: true,
    type: "text",
  },
  {
    key: "state",
    label: "State / Province",
    placeholder: "State or province",
    required: false,
    type: "text",
  },
  {
    key: "postalCode",
    label: "Postal Code",
    placeholder: "Postal / ZIP code",
    required: false,
    type: "text",
  },
  {
    key: "country",
    label: "Country",
    placeholder: "Country",
    required: true,
    type: "text",
  },
];

// ─── Region configs ───

const REGION_CONFIGS: Record<string, RegionConfig> = {
  HK: {
    code: "HK",
    name: "Hong Kong",
    phone: { code: "+852", placeholder: "9XXX XXXX", maxDigits: 8, minDigits: 8 },
    phoneCodes: PHONE_CODES_HK,
    addressFields: HK_ADDRESS_FIELDS,
    useDistrictAddress: true,
  },
  ME: {
    code: "ME",
    name: "Middle East",
    phone: { code: "+971", placeholder: "5X XXX XXXX", maxDigits: 12, minDigits: 7 },
    phoneCodes: PHONE_CODES_ME,
    addressFields: INTERNATIONAL_ADDRESS_FIELDS,
    useDistrictAddress: false,
  },
  SG: {
    code: "SG",
    name: "Singapore",
    phone: { code: "+65", placeholder: "9XXX XXXX", maxDigits: 8, minDigits: 8 },
    phoneCodes: PHONE_CODES_SG,
    addressFields: INTERNATIONAL_ADDRESS_FIELDS,
    useDistrictAddress: false,
  },
  TW: {
    code: "TW",
    name: "Taiwan",
    phone: { code: "+886", placeholder: "9XX XXX XXX", maxDigits: 10, minDigits: 9 },
    phoneCodes: [{ code: "+886", country: "TW", flag: "🇹🇼" }],
    addressFields: INTERNATIONAL_ADDRESS_FIELDS,
    useDistrictAddress: false,
  },
  MY: {
    code: "MY",
    name: "Malaysia",
    phone: { code: "+60", placeholder: "1X XXX XXXX", maxDigits: 11, minDigits: 9 },
    phoneCodes: [
      { code: "+60", country: "MY", flag: "🇲🇾" },
      { code: "+65", country: "SG", flag: "🇸🇬" },
    ],
    addressFields: INTERNATIONAL_ADDRESS_FIELDS,
    useDistrictAddress: false,
  },
  JP: {
    code: "JP",
    name: "Japan",
    phone: { code: "+81", placeholder: "90 XXXX XXXX", maxDigits: 11, minDigits: 10 },
    phoneCodes: [{ code: "+81", country: "JP", flag: "🇯🇵" }],
    addressFields: INTERNATIONAL_ADDRESS_FIELDS,
    useDistrictAddress: false,
  },
};

// ─── Default fallback ───

const DEFAULT_CONFIG: RegionConfig = {
  code: "HK",
  name: "Default",
  phone: { code: "+852", placeholder: "Phone number", maxDigits: 15, minDigits: 7 },
  phoneCodes: PHONE_CODES_DEFAULT,
  addressFields: INTERNATIONAL_ADDRESS_FIELDS,
  useDistrictAddress: false,
};

/**
 * Get region config based on tenant region string.
 * Falls back to HK config for unknown regions (backward compatible).
 */
export function getRegionConfig(region?: string | null): RegionConfig {
  if (!region) return REGION_CONFIGS.HK;
  return REGION_CONFIGS[region] || DEFAULT_CONFIG;
}

/**
 * Validate phone number for a given region config.
 */
export function validatePhone(
  digits: string,
  config: RegionConfig,
): boolean {
  const clean = digits.replace(/\D/g, "");
  return clean.length >= config.phone.minDigits && clean.length <= config.phone.maxDigits;
}

/**
 * Format full phone number with country code.
 */
export function formatFullPhone(countryCode: string, digits: string): string {
  const clean = digits.replace(/\D/g, "");
  return `${countryCode}${clean}`;
}
