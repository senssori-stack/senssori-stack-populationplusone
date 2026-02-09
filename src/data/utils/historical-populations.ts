// src/data/utils/historical-populations.ts
// Historical population data for cities (110 years of data)
// Used to show population at birth date vs current population

import { fetchCSV } from './csv';
import { HISTORICAL_POPULATIONS_CSV_URL } from './sheets';
// NOTE: Do not import from populations.ts to avoid circular dependency
// Use dynamic import if needed for getCurrentPopulationForCity

let HISTORICAL_POP_CACHE: Record<string, Record<number, number>> | null = null;

// State abbreviation to full name mapping
const STATE_ABBREV_MAP: Record<string, string> = {
    'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
    'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
    'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
    'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
    'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi', 'mo': 'missouri',
    'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new hampshire', 'nj': 'new jersey',
    'nm': 'new mexico', 'ny': 'new york', 'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio',
    'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
    'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont',
    'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia', 'wi': 'wisconsin', 'wy': 'wyoming',
    'dc': 'district of columbia'
};

/**
 * Normalize city, state format to handle abbreviations
 * "St. Louis, Mo" -> ["st. louis, missouri", "st. louis, mo"]
 */
function generateCityKeys(hometown: string): string[] {
    const normalized = hometown.toLowerCase().trim();
    const keys = [normalized];

    // Try to split by comma to get city and state
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length === 2) {
        const [city, state] = parts;

        // If state looks like abbreviation (2-3 chars), add full name version
        if (state.length <= 3 && STATE_ABBREV_MAP[state]) {
            const fullState = STATE_ABBREV_MAP[state];
            keys.push(`${city}, ${fullState}`);
        }

        // Also try without space after comma
        keys.push(`${city},${state}`);
        if (state.length <= 3 && STATE_ABBREV_MAP[state]) {
            keys.push(`${city},${STATE_ABBREV_MAP[state]}`);
        }
    }

    return keys;
}

/**
 * Get historical population for a city at a specific year
 * Returns the population in that year, or null if not found
 * 
 * Uses comprehensive Google Sheets CSV with historical data from 1910-2024
 */
export async function getHistoricalPopulationForCity(
    hometown: string,
    year: number
): Promise<number | null> {
    console.log(`📊 Getting historical population for ${hometown} in year ${year}`);

    try {
        // Load historical populations from Google Sheets CSV
        const data = await loadHistoricalPopulations();

        // Try multiple key variations
        const possibleKeys = generateCityKeys(hometown);
        let cityData: Record<number, number> | undefined;
        let matchedKey: string | undefined;

        for (const key of possibleKeys) {
            if (data[key]) {
                cityData = data[key];
                matchedKey = key;
                break;
            }
        }

        // Check if city exists in database
        if (!cityData) {
            console.warn(`⚠️ City "${hometown}" not found in historical database (tried: ${possibleKeys.join(', ')})`);

            // Fallback: For current year only, use current population database via dynamic import
            if (year >= 2024) {
                try {
                    const { getCurrentPopulationForCity } = await import('./populations');
                    const currentPop = await getCurrentPopulationForCity(hometown);
                    if (currentPop !== null) {
                        console.log(`✅ Found ${hometown} in current database: ${currentPop.toLocaleString()}`);
                        return currentPop;
                    }
                } catch (e) {
                    console.warn('Failed to load current population:', e);
                }
            }

            return null;
        }

        console.log(`✅ Found city in database with key: "${matchedKey}"`);

        // If exact year exists, return it
        if (cityData[year]) {
            const population = cityData[year];
            console.log(`✅ Found ${hometown} (${year}): ${population.toLocaleString()}`);
            return population;
        }

        // Year not found - use closest available year
        const availableYears = Object.keys(cityData).map(Number).sort((a, b) => a - b);

        if (availableYears.length === 0) {
            console.warn(`⚠️ No population data for ${hometown}`);
            return null;
        }

        const minYear = availableYears[0];
        const maxYear = availableYears[availableYears.length - 1];

        let closestYear = year;
        if (year < minYear) {
            closestYear = minYear;
            console.log(`⚠️ Year ${year} before data range (${minYear}-${maxYear}), using ${minYear}`);
        } else if (year > maxYear) {
            closestYear = maxYear;
            console.log(`⚠️ Year ${year} after data range (${minYear}-${maxYear}), using ${maxYear}`);
        } else {
            // Find closest year
            closestYear = availableYears.reduce((prev, curr) =>
                Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
            );
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
 * Load all historical population data from Google Sheets CSV
 * CSV format: City,State,1910,1920,1930,...,2024
 * Example: New York,New York,4766883,5620048,...,8336817
 */
async function loadHistoricalPopulations(): Promise<Record<string, Record<number, number>>> {
    if (HISTORICAL_POP_CACHE) {
        return HISTORICAL_POP_CACHE;
    }

    const result: Record<string, Record<number, number>> = {};

    try {
        console.log('📋 Loading historical population data from Google Sheets...');

        // fetchCSV returns string[][] (already parsed)
        const rows = await fetchCSV(HISTORICAL_POPULATIONS_CSV_URL);

        if (rows.length < 2) {
            console.warn('⚠️ CSV file is empty or invalid');
            return {};
        }

        // Parse header to get year columns
        const header = rows[0];
        const cityIndex = 0;
        const stateIndex = 1;
        const yearColumns: { year: number; index: number }[] = [];

        for (let i = 2; i < header.length; i++) {
            const year = parseInt(header[i]);
            if (!isNaN(year)) {
                yearColumns.push({ year, index: i });
            }
        }

        console.log(`📊 Found ${yearColumns.length} year columns from ${yearColumns[0]?.year} to ${yearColumns[yearColumns.length - 1]?.year}`);

        // Parse each city row
        let cityCount = 0;
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            if (values.length < 3) continue;

            const city = values[cityIndex];
            const state = values[stateIndex];

            if (!city || !state) continue;

            // Create key as "city, state" (lowercase for case-insensitive matching)
            const key = `${city}, ${state}`.toLowerCase();

            // Parse population data for each year
            const yearData: Record<number, number> = {};

            for (const { year, index } of yearColumns) {
                const popStr = values[index];
                if (popStr && popStr !== '') {
                    const pop = parseInt(popStr.replace(/,/g, ''));
                    if (!isNaN(pop) && pop > 0) {
                        yearData[year] = pop;
                    }
                }
            }

            // Only add if we have at least some data
            if (Object.keys(yearData).length > 0) {
                result[key] = yearData;
                cityCount++;
            }
        }

        HISTORICAL_POP_CACHE = result;
        console.log(`✅ Loaded ${cityCount} cities with historical population data`);
        return result;
    } catch (error) {
        console.warn('⚠️ Failed to load historical populations from Google Sheets:', error);
        return {};
    }
}

/**
 * Clear the cache (for testing/updates)
 */
export function clearHistoricalPopulationCache() {
    HISTORICAL_POP_CACHE = null;
}
