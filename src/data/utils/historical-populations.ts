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

    try {
        // Load historical populations from database
        const data = await loadHistoricalPopulations();

        const key = hometown.toLowerCase().trim();

        // Check if city exists in database
        if (!data[key]) {
            console.warn(`⚠️ City not found in database: ${hometown}`);
            return null;
        }

        // City exists - now check for year data
        const cityData = data[key];

        // If exact year exists, return it
        if (cityData[year]) {
            const population = cityData[year];
            console.log(`✅ Found ${hometown} (${year}): ${population.toLocaleString()}`);
            return population;
        }

        // Year not found - use closest available year
        const availableYears = Object.keys(cityData).map(Number).sort((a, b) => a - b);
        const minYear = availableYears[0];
        const maxYear = availableYears[availableYears.length - 1];

        let closestYear = year;
        if (year < minYear) {
            closestYear = minYear;
            console.log(`⚠️ Year ${year} before data range (${minYear}-${maxYear}), using ${minYear}`);
        } else if (year > maxYear) {
            closestYear = maxYear;
            console.log(`⚠️ Year ${year} after data range (${minYear}-${maxYear}), using ${maxYear}`);
        }

        const population = cityData[closestYear];
        console.log(`✅ Found ${hometown} (${year} → ${closestYear}): ${population.toLocaleString()}`);
        return population;
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
        console.log('📋 Loading historical population data...');

        // SAMPLE DATA - Replace with actual database/Google Sheets fetch
        // Format: "City, ST": { year: population }

        // Major US Cities with sample historical data
        const sampleData: Record<string, Record<number, number>> = {
            'new york, ny': generatePopulationData(7071639, 8336817, 1990, 2026),
            'los angeles, ca': generatePopulationData(3485398, 3898747, 1990, 2026),
            'chicago, il': generatePopulationData(2783726, 2746388, 1990, 2026),
            'houston, tx': generatePopulationData(1630553, 2314157, 1990, 2026),
            'phoenix, az': generatePopulationData(983403, 1650070, 1990, 2026),
            'philadelphia, pa': generatePopulationData(1585577, 1590402, 1990, 2026),
            'san antonio, tx': generatePopulationData(935933, 1511946, 1990, 2026),
            'san diego, ca': generatePopulationData(1110549, 1410791, 1990, 2026),
            'dallas, tx': generatePopulationData(1006877, 1331825, 1990, 2026),
            'san jose, ca': generatePopulationData(782248, 1030119, 1990, 2026),
            'austin, tx': generatePopulationData(465622, 974447, 1990, 2026),
            'jacksonville, fl': generatePopulationData(635230, 949611, 1990, 2026),
            'fort worth, tx': generatePopulationData(447619, 935508, 1990, 2026),
            'columbus, oh': generatePopulationData(632910, 913175, 1990, 2026),
            'charlotte, nc': generatePopulationData(395934, 879709, 1990, 2026),
            'san francisco, ca': generatePopulationData(723959, 815201, 1990, 2026),
            'indianapolis, in': generatePopulationData(741952, 880621, 1990, 2026),
            'seattle, wa': generatePopulationData(516259, 753675, 1990, 2026),
            'denver, co': generatePopulationData(467610, 711463, 1990, 2026),
            'washington, dc': generatePopulationData(606900, 701974, 1990, 2026),
            'boston, ma': generatePopulationData(574283, 654776, 1990, 2026),
            'nashville, tn': generatePopulationData(488374, 689447, 1990, 2026),
            'el paso, tx': generatePopulationData(515342, 678815, 1990, 2026),
            'detroit, mi': generatePopulationData(1027974, 632464, 1990, 2026),
            'oklahoma city, ok': generatePopulationData(444719, 655057, 1990, 2026),
            'portland, or': generatePopulationData(437319, 652503, 1990, 2026),
            'las vegas, nv': generatePopulationData(258295, 656274, 1990, 2026),
            'memphis, tn': generatePopulationData(610337, 628127, 1990, 2026),
            'louisville, ky': generatePopulationData(269063, 628594, 1990, 2026),
            'baltimore, md': generatePopulationData(736014, 569931, 1990, 2026),
            'st. louis, mo': generatePopulationData(396685, 286578, 1990, 2026),
            'milwaukee, wi': generatePopulationData(628088, 563305, 1990, 2026),
            'albuquerque, nm': generatePopulationData(384736, 560218, 1990, 2026),
            'tucson, az': generatePopulationData(405390, 548073, 1990, 2026),
            'fresno, ca': generatePopulationData(354202, 545716, 1990, 2026),
            'mesa, az': generatePopulationData(288091, 511648, 1990, 2026),
            'sacramento, ca': generatePopulationData(369365, 528001, 1990, 2026),
            'atlanta, ga': generatePopulationData(394017, 506811, 1990, 2026),
            'kansas city, mo': generatePopulationData(435146, 495327, 1990, 2026),
            'colorado springs, co': generatePopulationData(281140, 488664, 1990, 2026),
            'omaha, ne': generatePopulationData(335795, 478192, 1990, 2026),
            'raleigh, nc': generatePopulationData(207951, 474069, 1990, 2026),
            'miami, fl': generatePopulationData(358548, 467963, 1990, 2026),
            'long beach, ca': generatePopulationData(429433, 456062, 1990, 2026),
            'virginia beach, va': generatePopulationData(393069, 449628, 1990, 2026),
            'oakland, ca': generatePopulationData(372242, 437548, 1990, 2026),
            'minneapolis, mn': generatePopulationData(368383, 425336, 1990, 2026),
            'tulsa, ok': generatePopulationData(367302, 410652, 1990, 2026),
            'tampa, fl': generatePopulationData(280015, 403364, 1990, 2026),
            'arlington, tx': generatePopulationData(261721, 397269, 1990, 2026),
            'new orleans, la': generatePopulationData(496938, 369749, 1990, 2026),
        };

        // Merge sample data into result
        Object.assign(result, sampleData);

        // TODO: Fetch from actual Google Sheets or Firebase
        // Uncomment when data source is ready:
        // const csv = await fetchCSV(HISTORICAL_POPULATIONS_CSV_URL);
        // Parse CSV and populate result...

        HISTORICAL_POP_CACHE = result;
        console.log(`✅ Loaded ${Object.keys(result).length} cities with historical population data`);
        return result;
    } catch (error) {
        console.warn('⚠️ Failed to load historical populations:', error);
        return {};
    }
}

/**
 * Helper function to generate population data between two years
 * Interpolates values linearly between start and end population
 */
function generatePopulationData(
    startPop: number,
    endPop: number,
    startYear: number,
    endYear: number
): Record<number, number> {
    const result: Record<number, number> = {};
    const yearSpan = endYear - startYear;
    const popChange = endPop - startPop;

    for (let year = startYear; year <= endYear; year++) {
        const progress = (year - startYear) / yearSpan;
        const population = Math.round(startPop + (popChange * progress));
        result[year] = population;
    }

    return result;
}

/**
 * Clear the cache (for testing/updates)
 */
export function clearHistoricalPopulationCache() {
    HISTORICAL_POP_CACHE = null;
}
