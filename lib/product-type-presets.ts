/**
 * Product Type Presets — 產品類型 + 對應 size/option preset
 *
 * 每個產品類型自動帶出 preset checkbox：
 * - 波鞋：US/UK/EU/CM size grid
 * - 服裝：XS-3XL + Free Size
 * - 童裝：身高碼 90-160
 * - 飾物-戒指：HK 戒指碼 7-20
 * - 飾物-其他：Free Size
 * - 烘焙食品/美妝/其他：無尺碼
 */

export interface SizeSystemDef {
  id: string;
  label: string;
  sizes: string[];
}

export interface ProductTypePreset {
  id: string;
  label: string;
  icon: string;
  /** Size systems available for option 1 (size dimension) */
  sizeSystems: SizeSystemDef[];
  /** Default size system id */
  defaultSizeSystem?: string;
  /** If true, no size dimension needed */
  noSize: boolean;
}

// 波鞋 size systems
const SNEAKER_SIZE_SYSTEMS: SizeSystemDef[] = [
  {
    id: "us",
    label: "US",
    sizes: [
      "US 3.5", "US 4", "US 4.5", "US 5", "US 5.5", "US 6", "US 6.5",
      "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10",
      "US 10.5", "US 11", "US 11.5", "US 12", "US 12.5", "US 13", "US 14", "US 15",
    ],
  },
  {
    id: "uk",
    label: "UK",
    sizes: [
      "UK 3", "UK 3.5", "UK 4", "UK 4.5", "UK 5", "UK 5.5", "UK 6", "UK 6.5",
      "UK 7", "UK 7.5", "UK 8", "UK 8.5", "UK 9", "UK 9.5", "UK 10", "UK 10.5",
      "UK 11", "UK 11.5", "UK 12", "UK 13", "UK 14",
    ],
  },
  {
    id: "eu",
    label: "EU",
    sizes: [
      "EU 35.5", "EU 36", "EU 36.5", "EU 37.5", "EU 38", "EU 38.5", "EU 39",
      "EU 40", "EU 40.5", "EU 41", "EU 42", "EU 42.5", "EU 43", "EU 44",
      "EU 44.5", "EU 45", "EU 45.5", "EU 46", "EU 47", "EU 47.5", "EU 48", "EU 49", "EU 50",
    ],
  },
  {
    id: "cm",
    label: "CM",
    sizes: [
      "22cm", "22.5cm", "23cm", "23.5cm", "24cm", "24.5cm", "25cm", "25.5cm",
      "26cm", "26.5cm", "27cm", "27.5cm", "28cm", "28.5cm", "29cm", "29.5cm",
      "30cm", "30.5cm", "31cm",
    ],
  },
];

// 服裝 sizes
const APPAREL_SIZE_SYSTEMS: SizeSystemDef[] = [
  {
    id: "standard",
    label: "標準碼",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"],
  },
];

// 童裝 sizes
const KIDS_SIZE_SYSTEMS: SizeSystemDef[] = [
  {
    id: "height",
    label: "身高碼",
    sizes: ["90", "100", "110", "120", "130", "140", "150", "160"],
  },
  {
    id: "age",
    label: "年齡碼",
    sizes: ["1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-10Y", "10-12Y"],
  },
];

// 戒指 sizes
const RING_SIZE_SYSTEMS: SizeSystemDef[] = [
  {
    id: "hk",
    label: "HK 戒指碼",
    sizes: ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
  },
];

// Free size only
const FREE_SIZE_SYSTEMS: SizeSystemDef[] = [
  {
    id: "free",
    label: "Free Size",
    sizes: ["Free Size"],
  },
];

export const PRODUCT_TYPES: ProductTypePreset[] = [
  {
    id: "sneakers",
    label: "波鞋",
    icon: "👟",
    sizeSystems: SNEAKER_SIZE_SYSTEMS,
    defaultSizeSystem: "us",
    noSize: false,
  },
  {
    id: "apparel",
    label: "服裝",
    icon: "👕",
    sizeSystems: APPAREL_SIZE_SYSTEMS,
    defaultSizeSystem: "standard",
    noSize: false,
  },
  {
    id: "kids",
    label: "童裝",
    icon: "👶",
    sizeSystems: KIDS_SIZE_SYSTEMS,
    defaultSizeSystem: "height",
    noSize: false,
  },
  {
    id: "jewelry_ring",
    label: "飾物—戒指",
    icon: "💍",
    sizeSystems: RING_SIZE_SYSTEMS,
    defaultSizeSystem: "hk",
    noSize: false,
  },
  {
    id: "jewelry_other",
    label: "飾物—其他",
    icon: "📿",
    sizeSystems: FREE_SIZE_SYSTEMS,
    defaultSizeSystem: "free",
    noSize: false,
  },
  {
    id: "food",
    label: "烘焙/食品",
    icon: "🍰",
    sizeSystems: [],
    noSize: true,
  },
  {
    id: "beauty",
    label: "美妝",
    icon: "💄",
    sizeSystems: [],
    noSize: true,
  },
  {
    id: "other",
    label: "其他",
    icon: "📦",
    sizeSystems: [],
    noSize: true,
  },
];

export function getProductTypePreset(typeId: string): ProductTypePreset | undefined {
  return PRODUCT_TYPES.find((t) => t.id === typeId);
}
