// src/data/utils/historical-populations.ts
// Historical population data for cities (110 years of data)
// Used to show population at birth date vs current population

import { POPULATIONS_CSV_URL } from './sheets';
import { fetchCSV } from './csv';

let HISTORICAL_POP_CACHE: Record<string, Record<number, number>> | null = null;

/**
 * Get historical population for a city at a specific year
 * Returns the population in that year, or null if not found
 */
export async function getHistoricalPopulationForCity(
    hometown: string,
    year: number
): Promise<number | null> {
    console.log(`📊 Getting historical population for ${hometown} in year ${year}`);

    // For now, return null - this would fetch from a historical population CSV/database
    // The structure would be: City, State, 1914, 1915, 1916, ..., 2026
    // This needs to be set up in Firebase or Google Sheets with historical census data

    try {
        // Load historical populations from database
        const data = await loadHistoricalPopulations();

        const key = hometown.toLowerCase();
        if (data[key] && data[key][year]) {
            return data[key][year];
        }

        console.warn(`⚠️ No historical data found for ${hometown} in ${year}`);
        return null;
    } catch (error) {
        console.warn(`⚠️ Failed to load historical populations:`, error);
        return null;
    }
}

/**
 * Load all historical population data
 * Expected format from CSV:
 * City,State,1914,1915,1916,...,2026
 * New York,New York,3437202,3482013,...,8336817
 */
async function loadHistoricalPopulations(): Promise<Record<string, Record<number, number>>> {
    if (HISTORICAL_POP_CACHE) {
        return HISTORICAL_POP_CACHE;
    }

    const result: Record<string, Record<number, number>> = {};

    try {
        // This would fetch from a dedicated historical populations sheet/database
        // For now, we'll implement a placeholder that needs to be connected to:
        // - Firebase Firestore collection with historical data
        // - Or a Google Sheets CSV with historical census data

        console.log('📋 Loading historical population data...');

        // TODO: Replace with actual database/sheet fetch
        // const csv = await fetchCSV(HISTORICAL_POPULATIONS_CSV_URL);
        // 
        // for (let i = 1; i < csv.length; i++) {
        //     const row = csv[i];
        //     const city = row[0]?.trim();
        //     const state = row[1]?.trim();
        //     if (!city || !state) continue;
        //     
        //     const key = `${city}, ${state}`.toLowerCase();
        //     result[key] = {};
        //     
        //     // Years 1914-2026 in columns 2+
        //     for (let yearIdx = 0; yearIdx < 113; yearIdx++) {
        //         const year = 1914 + yearIdx;
        //         const popStr = row[2 + yearIdx]?.trim();
        //         const pop = parseInt(popStr?.replace(/,/g, '') || '0', 10);
        //         if (pop > 0) {
        //             result[key][year] = pop;
        //         }
        //     }
        // }

        HISTORICAL_POP_CACHE = result;
        return result;
    } catch (error) {
        console.warn('⚠️ Failed to load historical populations:', error);
        return {};
    }
}

/**
 * Clear the cache (for testing/updates)
 */
export function clearHistoricalPopulationCache() {
    HISTORICAL_POP_CACHE = null;
}
