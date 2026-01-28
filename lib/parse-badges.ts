/**
 * Parse comma-separated badges string into array
 * - Trim spaces
 * - Ignore empty entries
 * - Deduplicate while preserving order
 */
export function parseBadges(input: string | null | undefined): string[] {
  if (!input || typeof input !== "string") return [];

  const seen = new Set<string>();
  const result: string[] = [];

  const parts = input.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }

  return result;
}
