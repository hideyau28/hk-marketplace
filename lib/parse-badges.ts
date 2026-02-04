/**
 * Parse badges input into array
 * - Accepts comma-separated string or string array
 * - Trim spaces
 * - Ignore empty entries
 * - Deduplicate while preserving order
 */
export function parseBadges(input: unknown): string[] {
  if (!input) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  const push = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  };

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") push(item);
    }
    return result;
  }

  if (typeof input === "string") {
    const parts = input.split(",");
    for (const part of parts) {
      push(part);
    }
  }

  return result;
}
