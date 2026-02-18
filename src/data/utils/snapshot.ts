// src/data/utils/snapshot.ts
import { getFromCache, saveToCache } from './cache-manager';
import { fetchCSV } from './csv';
import { CURRENT_SNAPSHOT_DATA } from './current-snapshot';
import { getHistoricalSnapshotForDate } from './historical-snapshot';
import { getMetalsBackup, saveMetalsBackup } from './metals-backup';
import { SNAPSHOT_CSV_URL } from './sheets';
import SNAPSHOT_CANONICAL_MAP from './snapshot-mapping';

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
 * Get current snapshot from Google Sheets (fast), with AsyncStorage cache for speed
 * Firebase is only used for auth and customer data, NOT snapshot data
 */
export async function getAllSnapshotValues(): Promise<Record<string, string>> {
    if (SNAP_CACHE) return SNAP_CACHE;

    LAST_SNAPSHOT_MAPPINGS = [];

    // Check cache first for instant load
    const cached = await getFromCache();
    if (cached) {
        console.log('✅ Using cached snapshot data (instant load)');
        return (SNAP_CACHE = cached);
    }

    // Fetch from Google Sheets CSV (primary source)
    try {
        console.log('📊 Fetching snapshot from Google Sheets...');
        const csv = await fetchCSV(SNAPSHOT_CSV_URL);
        if (csv.length === 0) {
            throw new Error('CSV is empty');
        }

        const out: Record<string, string> = {};

        // Detect orientation: Check if first row contains "Field Name" or similar
        const firstRowFirstCol = (csv[0]?.[0] ?? '').trim().toUpperCase();
        const isVerticalFormat = firstRowFirstCol === 'FIELD NAME' || firstRowFirstCol === 'KEY' || firstRowFirstCol === 'NAME';

        if (!isVerticalFormat && csv[0].length >= 2 && csv.length >= 2) {
            // Horizontal format: First row = headers, second row = values
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
            // Vertical format - skip header row
            console.log('📋 Using VERTICAL format parser (Field Name | Value)');
            for (let i = 0; i < csv.length; i++) {
                const row = csv[i];
                const rawKey = (row[0] ?? '').trim();
                const keyUpper = rawKey.toUpperCase();

                // Skip header row (contains "Field Name", "Value", etc.)
                if (i === 0 && (keyUpper === 'FIELD NAME' || keyUpper === 'KEY' || keyUpper === 'NAME')) {
                    console.log('⏭️ Skipping header row:', rawKey);
                    continue;
                }

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
            console.log('✅ Parsed vertical format:', Object.keys(out).length, 'total keys');
        }

        console.log('✅ Using Google Sheets snapshot data');
        console.log('🪙 Gold from sheet:', out['GOLD OZ']);
        console.log('🪙 Silver from sheet:', out['SILVER OZ']);

        // Save gold/silver to permanent backup after successful fetch
        if (out['GOLD OZ'] && out['SILVER OZ']) {
            await saveMetalsBackup(out['GOLD OZ'], out['SILVER OZ'], 'Google Sheets');
        }

        // ALWAYS use hardcoded President/VP - never trust Google Sheets for this
        out['PRESIDENT'] = CURRENT_SNAPSHOT_DATA['PRESIDENT'];
        out['VICE PRESIDENT'] = CURRENT_SNAPSHOT_DATA['VICE PRESIDENT'];
        console.log('🏛️ Using hardcoded President/VP:', out['PRESIDENT'], '/', out['VICE PRESIDENT']);

        // Save to cache for next time (instant load)
        await saveToCache(out);

        return (SNAP_CACHE = out);
    } catch (error) {
        console.warn('⚠️ Google Sheets fetch failed, trying backups...');

        // Try to get last known good values from cache first
        const cachedData = await getFromCache();
        if (cachedData && cachedData['GOLD OZ'] && cachedData['SILVER OZ']) {
            console.log('✅ Using cached data (fetch failed)');
            console.log('🪙 Cached Gold:', cachedData['GOLD OZ']);
            console.log('🪙 Cached Silver:', cachedData['SILVER OZ']);
            return (SNAP_CACHE = cachedData);
        }

        // Try metals backup database (permanent storage)
        const metalsBackup = await getMetalsBackup();
        if (metalsBackup) {
            console.log('✅ Using metals backup database (fetch failed)');
            console.log('🪙 Backup Gold:', metalsBackup.gold);
            console.log('🪙 Backup Silver:', metalsBackup.silver);
            console.log('📅 Last fetched:', metalsBackup.fetchedAt);

            // Merge backup metals with other fallback data
            const fallbackWithMetals = { ...CURRENT_SNAPSHOT_DATA };
            fallbackWithMetals['GOLD OZ'] = metalsBackup.gold;
            fallbackWithMetals['SILVER OZ'] = metalsBackup.silver;
            return (SNAP_CACHE = fallbackWithMetals);
        }

        console.error('❌ No cache or backup available - gold/silver will be empty');
    }

    // Final fallback - NO gold/silver values (force fetch to work)
    console.log('⚠️ Using minimal fallback data (no gold/silver - fetch required)');
    const fallbackData = { ...CURRENT_SNAPSHOT_DATA };
    delete fallbackData['GOLD OZ'];
    delete fallbackData['SILVER OZ'];

    return (SNAP_CACHE = fallbackData);
}

/**
 * For development: allow forcing a cache clear so the app can re-fetch the CSV
 */
export function clearSnapshotCache() {
    SNAP_CACHE = null;
    LAST_SNAPSHOT_MAPPINGS = [];
}
