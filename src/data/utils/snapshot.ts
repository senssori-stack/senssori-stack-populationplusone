// src/data/utils/snapshot.ts
import { fetchCSV } from './csv';
import { SNAPSHOT_CSV_URL } from './sheets';
import SNAPSHOT_CANONICAL_MAP from './snapshot-mapping';

// last applied mappings for debug visibility
export let LAST_SNAPSHOT_MAPPINGS: Array<{ from: string; to: string }> = [];

// Cache
let SNAP_CACHE: Record<string, string> | null = null;

/**
 * The SNAPSHOT sheet is a single "row of values" with headers in row 1,
 * prices/values in row 2. We return a Record<header, value>.
 */
export async function getAllSnapshotValues(): Promise<Record<string, string>> {
  if (SNAP_CACHE) return SNAP_CACHE;

  // reset previous mapping log for a fresh fetch
  LAST_SNAPSHOT_MAPPINGS = [];

  const csv = await fetchCSV(SNAPSHOT_CSV_URL);
  if (csv.length === 0) return (SNAP_CACHE = {});

  const out: Record<string, string> = {};

  // Detect orientation: horizontal if first row has multiple columns and there is at least a second row
  const isHorizontal = csv[0].length >= 2 && csv.length >= 2;

  if (isHorizontal) {
    const headers = csv[0].map(h => h.trim());

    // Some published CSVs have a blank row between headers and the values row.
    // Find the first non-empty row after the header row and use that as values.
    let valuesRowIndex = -1;
    for (let i = 1; i < csv.length; i++) {
      const row = csv[i];
      if (row && row.some(cell => (cell || '').toString().trim() !== '')) {
        valuesRowIndex = i;
        break;
      }
    }

    const values = valuesRowIndex >= 0 ? csv[valuesRowIndex].map(v => v.trim()) : [];

    for (let i = 0; i < headers.length; i++) {
      const rawKey = headers[i] ?? '';
      const keyUpper = rawKey.trim().toUpperCase();
  const val = values[i] ?? '';

      // Default store
      out[rawKey] = val;
      out[keyUpper] = val;

      // Apply canonical mapping if exists (and store mapping log)
      const mapped = SNAPSHOT_CANONICAL_MAP[keyUpper] ?? SNAPSHOT_CANONICAL_MAP[rawKey];
      if (mapped && mapped !== rawKey) {
        out[mapped] = val;
        LAST_SNAPSHOT_MAPPINGS.push({ from: rawKey, to: mapped });
      }
    }
  } else {
    // Vertical: expect rows like [key, value]
    for (const row of csv) {
      const rawKey = (row[0] ?? '').trim();
      const keyUpper = rawKey.toUpperCase();
      const val = (row[1] ?? '').trim();
      if (!rawKey) continue;
      out[rawKey] = val;
      out[keyUpper] = val;

      const mapped = SNAPSHOT_CANONICAL_MAP[keyUpper] ?? SNAPSHOT_CANONICAL_MAP[rawKey];
      if (mapped && mapped !== rawKey) {
        out[mapped] = val;
        LAST_SNAPSHOT_MAPPINGS.push({ from: rawKey, to: mapped });
      }
    }
  }

  return (SNAP_CACHE = out);
}

// For development: allow forcing a cache clear so the app can re-fetch the CSV
export function clearSnapshotCache() {
  SNAP_CACHE = null;
  LAST_SNAPSHOT_MAPPINGS = [];
}
