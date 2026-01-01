// src/data/utils/geo.ts
// Normalizes "City, ST" or "City, State" to a stable key like "city, st"
export function normalizeCityKey(input: string): string {
  if (!input) return "";
  // collapse whitespace, strip quotes, normalize commas, lowercase
  const cleaned = input.replace(/["']/g, "").replace(/\s*,\s*/g, ", ").trim();
  return cleaned.toLowerCase();
}
