export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// HK regions mapping for common districts
const REGION_MAP: Record<string, string> = {
  // Hong Kong Island
  "中西區": "香港島",
  "灣仔區": "香港島",
  "東區": "香港島",
  "南區": "香港島",
  "中環": "香港島",
  "上環": "香港島",
  "西營盤": "香港島",
  "銅鑼灣": "香港島",
  "跑馬地": "香港島",
  "北角": "香港島",
  "鰂魚涌": "香港島",
  "太古": "香港島",
  "筲箕灣": "香港島",
  "柴灣": "香港島",
  "香港仔": "香港島",
  "黃竹坑": "香港島",
  "淺水灣": "香港島",
  "赤柱": "香港島",
  // Kowloon
  "油尖旺區": "九龍",
  "深水埗區": "九龍",
  "九龍城區": "九龍",
  "黃大仙區": "九龍",
  "觀塘區": "九龍",
  "旺角": "九龍",
  "油麻地": "九龍",
  "尖沙咀": "九龍",
  "佐敦": "九龍",
  "深水埗": "九龍",
  "長沙灣": "九龍",
  "荔枝角": "九龍",
  "九龍城": "九龍",
  "紅磡": "九龍",
  "土瓜灣": "九龍",
  "九龍塘": "九龍",
  "黃大仙": "九龍",
  "鑽石山": "九龍",
  "觀塘": "九龍",
  "牛頭角": "九龍",
  "九龍灣": "九龍",
  "藍田": "九龍",
  // New Territories
  "葵青區": "新界",
  "荃灣區": "新界",
  "屯門區": "新界",
  "元朗區": "新界",
  "北區": "新界",
  "大埔區": "新界",
  "沙田區": "新界",
  "西貢區": "新界",
  "葵涌": "新界",
  "荃灣": "新界",
  "屯門": "新界",
  "元朗": "新界",
  "天水圍": "新界",
  "上水": "新界",
  "粉嶺": "新界",
  "大埔": "新界",
  "沙田": "新界",
  "馬鞍山": "新界",
  "大圍": "新界",
  "火炭": "新界",
  "將軍澳": "新界",
  "西貢": "新界",
  "清水灣": "新界",
  "調景嶺": "新界",
  // Islands
  "離島區": "離島",
  "大嶼山": "離島",
  "東涌": "離島",
  "愉景灣": "離島",
  "長洲": "離島",
  "南丫島": "離島",
  "坪洲": "離島",
  "梅窩": "離島",
  "大澳": "離島",
};

// Detect region from address text
function detectRegion(address: string): string {
  // Check for explicit island references
  if (/離島|大嶼山|東涌|愉景灣|長洲|南丫島|坪洲|梅窩|大澳/.test(address)) {
    return "離島";
  }

  for (const [key, region] of Object.entries(REGION_MAP)) {
    if (address.includes(key)) {
      return region;
    }
  }

  // Default heuristics
  if (/香港島|港島/.test(address)) return "香港島";
  if (/九龍/.test(address)) return "九龍";
  if (/新界/.test(address)) return "新界";

  return "九龍"; // Default fallback
}

// Extract district from ALS response
function extractDistrict(address: any): string {
  // Try different fields from ALS response
  if (address.ChiDistrict?.DcDistrict) {
    return address.ChiDistrict.DcDistrict;
  }
  if (address.ChiPremisesAddress?.ChiDistrict?.DcDistrict) {
    return address.ChiPremisesAddress.ChiDistrict.DcDistrict;
  }
  // Fallback: extract from full address
  const fullAddr = address.ChiPremisesAddress?.FullAddress?.FullAddress || "";
  // Try to find district pattern
  const districtMatch = fullAddr.match(/([\u4e00-\u9fff]+區)/);
  if (districtMatch) return districtMatch[1];

  return "";
}

// Parse ALS API response into simplified format
function parseALSResponse(data: any): Array<{
  fullAddress: string;
  region: string;
  district: string;
  street: string;
  building: string;
}> {
  const results: Array<{
    fullAddress: string;
    region: string;
    district: string;
    street: string;
    building: string;
  }> = [];

  // ALS returns different structures based on query
  const suggestions = data.SuggestedAddress || [];

  for (const item of suggestions) {
    const addr = item.Address || {};
    const premisesAddr = addr.PremisesAddress || {};

    // Get Chinese address
    const chiAddr = premisesAddr.ChiPremisesAddress || {};

    // Build full address string
    let fullAddress = "";
    let building = "";
    let street = "";

    // Building name
    if (chiAddr.BuildingName) {
      building = chiAddr.BuildingName;
    }

    // Street info
    if (chiAddr.ChiStreet) {
      const streetInfo = chiAddr.ChiStreet;
      street = `${streetInfo.StreetName || ""}${streetInfo.BuildingNoFrom ? streetInfo.BuildingNoFrom + "號" : ""}`;
    }

    // Block/Estate
    if (chiAddr.ChiBlock?.BlockDescriptor && chiAddr.ChiBlock?.BlockNo) {
      building = `${chiAddr.ChiBlock.BlockDescriptor}${chiAddr.ChiBlock.BlockNo} ${building}`.trim();
    }

    if (chiAddr.ChiEstate?.EstateName) {
      building = `${chiAddr.ChiEstate.EstateName} ${building}`.trim();
    }

    // District
    const district = extractDistrict(addr);

    // Full address from ALS
    if (chiAddr.FullAddress) {
      fullAddress = chiAddr.FullAddress;
    } else {
      // Construct full address
      fullAddress = [building, street, district].filter(Boolean).join(" ");
    }

    if (!fullAddress) continue;

    // Detect region
    const region = detectRegion(fullAddress);

    results.push({
      fullAddress,
      region,
      district,
      street: street || building,
      building: building || street,
    });
  }

  return results;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Load local address database
let localAddresses: any = null;
async function getLocalAddresses() {
  if (localAddresses) return localAddresses;

  try {
    const filePath = path.join(process.cwd(), "app", "data", "hk-addresses.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    localAddresses = JSON.parse(fileContents);
    return localAddresses;
  } catch (error) {
    console.error("Failed to load local addresses:", error);
    return { regions: {}, estates: [] };
  }
}

// Search local address database
async function searchLocalAddresses(query: string): Promise<Array<{
  fullAddress: string;
  region: string;
  district: string;
  street: string;
  building: string;
}>> {
  const data = await getLocalAddresses();
  const results: Array<{
    fullAddress: string;
    region: string;
    district: string;
    street: string;
    building: string;
  }> = [];

  const lowerQuery = query.toLowerCase();

  // Search estates first
  for (const estate of data.estates || []) {
    if (estate.name.includes(query) || estate.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        fullAddress: `${estate.region} ${estate.district} ${estate.street} ${estate.name}`,
        region: estate.region,
        district: estate.district,
        street: estate.street,
        building: estate.name,
      });
    }
  }

  // Search streets
  for (const [region, districts] of Object.entries(data.regions || {})) {
    for (const [district, streets] of Object.entries(districts as Record<string, string[]>)) {
      for (const street of streets) {
        if (street.includes(query) || street.toLowerCase().includes(lowerQuery)) {
          results.push({
            fullAddress: `${region} ${district} ${street}`,
            region,
            district,
            street,
            building: "",
          });
        }
      }
    }
  }

  // Limit to 10 results
  return results.slice(0, 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ ok: true, data: { addresses: [] } });
  }

  // Check cache
  const cacheKey = `als:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ok: true, data: { addresses: cached.data } });
  }

  // Try ALS API first with 2-second timeout
  let addresses: Array<{
    fullAddress: string;
    region: string;
    district: string;
    street: string;
    building: string;
  }> = [];

  try {
    const alsUrl = new URL("https://www.als.ogcio.gov.hk/lookup");
    alsUrl.searchParams.set("q", query);
    alsUrl.searchParams.set("n", "10");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(alsUrl.toString(), {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "zh-HK,zh;q=0.9,en;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      addresses = parseALSResponse(data);

      // Cache successful ALS result
      if (addresses.length > 0) {
        cache.set(cacheKey, { data: addresses, timestamp: Date.now() });
      }
    }
  } catch (error) {
    // ALS failed or timed out, will fall back to local
    console.log("ALS API failed/timeout, using local fallback:", error instanceof Error ? error.message : "unknown");
  }

  // If ALS returned no results or failed, use local database
  if (addresses.length === 0) {
    try {
      addresses = await searchLocalAddresses(query);

      // Cache local result
      if (addresses.length > 0) {
        cache.set(cacheKey, { data: addresses, timestamp: Date.now() });
      }
    } catch (error) {
      console.error("Local address search failed:", error);
      return NextResponse.json({
        ok: false,
        error: { code: "SEARCH_FAILED", message: "Failed to search addresses" }
      }, { status: 500 });
    }
  }

  // Clean old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  }

  return NextResponse.json({ ok: true, data: { addresses } });
}
