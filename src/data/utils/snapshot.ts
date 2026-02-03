// src/data/utils/snapshot.ts
import { fetchCSV } from './csv';
import { SNAPSHOT_CSV_URL } from './sheets';
import SNAPSHOT_CANONICAL_MAP from './snapshot-mapping';
import { getHistoricalSnapshotForDate } from './historical-snapshot';
import { CURRENT_SNAPSHOT_DATA } from './current-snapshot';
import { getSnapshotFromFirebase } from './firebase-snapshot';
import { getMetalsPrices, getDowJonesPrice } from './external-apis';

// last applied mappings for debug visibility
export let LAST_SNAPSHOT_MAPPINGS: Array<{ from: string; to: string }> = [];

// Cache
let SNAP_CACHE: Record<string, string> | null = null;

/**
 * Get snapshot data for a specific date (YYYY-MM-DD format)
 * Falls back to historical data
 */
export async function getSnapshotForBirthDate(dobISO: string): Promise<Record<string, string>> {
    return getHistoricalSnapshotForDate(dobISO);
}

/**
 * Get current snapshot from Firebase (preferred), then CSV, then local fallback
 * Also fetches live metal prices and Dow Jones data
 */
export async function getAllSnapshotValues(): Promise<Record<string, string>> {
    if (SNAP_CACHE) return SNAP_CACHE;

    LAST_SNAPSHOT_MAPPINGS = [];

    // Try Firebase first (most reliable)
    try {
        console.log('🔥 Attempting to fetch snapshot from Firebase...');
        const firebaseData = await getSnapshotFromFirebase();

        // Enhance with live metal prices and Dow Jones
        const [metalsPrices, dowJones] = await Promise.all([
            getMetalsPrices(),
            getDowJonesPrice()
        ]);

        if (metalsPrices) {
            firebaseData['GOLD'] = metalsPrices.gold;
            firebaseData['SILVER'] = metalsPrices.silver;
        }
        if (dowJones) {
            firebaseData['DOW_JONES'] = dowJones;
        }

        if (Object.keys(firebaseData).length > 0) {
            console.log('✅ Using Firebase snapshot data with live prices');
            return (SNAP_CACHE = firebaseData);
        }
    } catch (error) {
        console.warn('⚠️ Firebase fetch failed, trying Google Sheets...');
    }

    // Fall back to Google Sheets CSV
    try {
        console.log('📊 Attempting to fetch snapshot from Google Sheets...');
        const csv = await fetchCSV(SNAPSHOT_CSV_URL);
        if (csv.length === 0) {
            throw new Error('CSV is empty');
        }

        const out: Record<string, string> = {};

        // Detect orientation
        const isHorizontal = csv[0].length >= 2 && csv.length >= 2;

        if (isHorizontal) {
            const headers = csv[0].map(h => h.trim());

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

                out[rawKey] = val;
                out[keyUpper] = val;

                const mapped = SNAPSHOT_CANONICAL_MAP[keyUpper] ?? SNAPSHOT_CANONICAL_MAP[rawKey];
                if (mapped && mapped !== rawKey) {
                    out[mapped] = val;
                    LAST_SNAPSHOT_MAPPINGS.push({ from: rawKey, to: mapped });
                }
            }
        } else {
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

        console.log('✅ Using Google Sheets snapshot data');

        // Enhance with live metal prices and Dow Jones
        const [metalsPrices, dowJones] = await Promise.all([
            getMetalsPrices(),
            getDowJonesPrice()
        ]);

        if (metalsPrices) {
            out['GOLD'] = metalsPrices.gold;
            out['SILVER'] = metalsPrices.silver;
        }
        if (dowJones) {
            out['DOW_JONES'] = dowJones;
        }

        return (SNAP_CACHE = out);
    } catch (error) {
        console.warn('⚠️ Google Sheets fetch failed, using local fallback data');
    }

    // Final fallback to local data with live prices if possible
    const localData = { ...CURRENT_SNAPSHOT_DATA };

    // Try to enhance local fallback with live prices
    try {
        const [metalsPrices, dowJones] = await Promise.all([
            getMetalsPrices(),
            getDowJonesPrice()
        ]);

        if (metalsPrices) {
            localData['GOLD'] = metalsPrices.gold;
            localData['SILVER'] = metalsPrices.silver;
        }
        if (dowJones) {
            localData['DOW_JONES'] = dowJones;
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch live prices, using local data values');
    }

    console.log('📱 Using local fallback snapshot data');
    return (SNAP_CACHE = localData);
}

/**
 * For development: allow forcing a cache clear so the app can re-fetch the CSV
 */
export function clearSnapshotCache() {
    SNAP_CACHE = null;
    LAST_SNAPSHOT_MAPPINGS = [];
}
