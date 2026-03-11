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

/** Census designation suffixes to strip from CSV city names */
const CENSUS_SUFFIXES = [' city', ' town', ' village', ' cdp', ' borough', ' municipality', ' urban county', ' metro township', ' charter township', ' consolidated government', ' metropolitan government', ' unified government'];

function stripCensusSuffixFromCity(cityName: string): string {
    for (const suffix of CENSUS_SUFFIXES) {
        // Case-sensitive: Census suffixes are lowercase (" city"), name parts are Title Case (" City")
        // This prevents "Jefferson City" → "Jefferson" while still handling "Jefferson City city" → "Jefferson City"
        if (cityName.endsWith(suffix)) {
            return cityName.substring(0, cityName.length - suffix.length);
        }
    }
    return cityName;
}

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

        // Strip Census suffixes from the city name
        const strippedCity = stripCensusSuffixFromCity(city);
        if (strippedCity !== city) {
            keys.push(`${strippedCity}, ${state}`);
            keys.push(`${strippedCity},${state}`);
        }

        // If state looks like abbreviation (2-3 chars), add full name version
        if (state.length <= 3 && STATE_ABBREV_MAP[state]) {
            const fullState = STATE_ABBREV_MAP[state];
            keys.push(`${city}, ${fullState}`);
            if (strippedCity !== city) {
                keys.push(`${strippedCity}, ${fullState}`);
            }
        }

        // Also try without space after comma
        keys.push(`${city},${state}`);
        if (state.length <= 3 && STATE_ABBREV_MAP[state]) {
            keys.push(`${city},${STATE_ABBREV_MAP[state]}`);
            if (strippedCity !== city) {
                keys.push(`${strippedCity},${STATE_ABBREV_MAP[state]}`);
            }
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
// NYC borough historical populations (US Census decennial data)
const NYC_BOROUGH_HISTORICAL_POP: Record<string, Record<number, number>> = {
    'queens': {
        1910: 284041, 1920: 469042, 1930: 1079129, 1940: 1297634, 1950: 1550849,
        1960: 1809578, 1970: 1986473, 1980: 1891325, 1990: 1951598, 2000: 2229379,
        2010: 2230722, 2020: 2405464,
    },
    'brooklyn': {
        1910: 1634351, 1920: 2018356, 1930: 2560401, 1940: 2698285, 1950: 2738175,
        1960: 2627319, 1970: 2602012, 1980: 2230936, 1990: 2300664, 2000: 2465326,
        2010: 2504700, 2020: 2736074,
    },
    'manhattan': {
        1910: 2331542, 1920: 2284103, 1930: 1867312, 1940: 1889924, 1950: 1960101,
        1960: 1698281, 1970: 1539233, 1980: 1428285, 1990: 1487536, 2000: 1537195,
        2010: 1585873, 2020: 1694251,
    },
    'bronx': {
        1910: 430980, 1920: 732016, 1930: 1265258, 1940: 1394711, 1950: 1451277,
        1960: 1424815, 1970: 1471701, 1980: 1168972, 1990: 1203789, 2000: 1332650,
        2010: 1385108, 2020: 1472654,
    },
    'the bronx': {
        1910: 430980, 1920: 732016, 1930: 1265258, 1940: 1394711, 1950: 1451277,
        1960: 1424815, 1970: 1471701, 1980: 1168972, 1990: 1203789, 2000: 1332650,
        2010: 1385108, 2020: 1472654,
    },
    'staten island': {
        1910: 85969, 1920: 116531, 1930: 158346, 1940: 174441, 1950: 191555,
        1960: 221991, 1970: 295443, 1980: 352121, 1990: 378977, 2000: 443728,
        2010: 468730, 2020: 495747,
    },
};

const NYC_BOROUGH_CURRENT_POP: Record<string, number> = {
    'queens': 2405464, 'brooklyn': 2736074, 'manhattan': 1694251,
    'bronx': 1472654, 'the bronx': 1472654, 'staten island': 495747,
};

// Map neighborhoods to their parent borough or city (NOT boroughs themselves)
const NEIGHBORHOOD_TO_PARENT: Record<string, string> = {
    'astoria': 'Queens', 'flushing': 'Queens', 'jamaica': 'Queens',
    'bayside': 'Queens', 'forest hills': 'Queens', 'long island city': 'Queens',
    'williamsburg': 'Brooklyn', 'bushwick': 'Brooklyn', 'bed-stuy': 'Brooklyn',
    'bedford-stuyvesant': 'Brooklyn', 'greenpoint': 'Brooklyn', 'bay ridge': 'Brooklyn',
    'flatbush': 'Brooklyn', 'park slope': 'Brooklyn', 'coney island': 'Brooklyn',
    'east new york': 'Brooklyn', 'brownsville': 'Brooklyn',
    'harlem': 'Manhattan', 'soho': 'Manhattan', 'tribeca': 'Manhattan',
    'chelsea': 'Manhattan', 'east village': 'Manhattan', 'west village': 'Manhattan',
    'south bronx': 'Bronx', 'mott haven': 'Bronx', 'riverdale': 'Bronx',
    'tottenville': 'Staten Island', 'st. george': 'Staten Island',
    'hollywood': 'Los Angeles', 'venice': 'Los Angeles', 'watts': 'Los Angeles',
    'hyde park': 'Chicago', 'wicker park': 'Chicago', 'lincoln park': 'Chicago',
};

function isNYState(state: string): boolean {
    const s = state.toLowerCase().trim();
    return s === 'ny' || s === 'new york';
}

function resolveHometown(hometown: string): string {
    const parts = hometown.split(',');
    if (parts.length < 2) return hometown;
    const inputCity = parts[0].trim().toLowerCase();
    const stateRaw = parts.slice(1).join(',').trim();
    const parent = NEIGHBORHOOD_TO_PARENT[inputCity];
    if (parent) return `${parent}, ${stateRaw}`;
    return hometown;
}

export async function getHistoricalPopulationForCity(
    hometown: string,
    year: number
): Promise<number | null> {
    console.log(`📊 Getting historical population for ${hometown} in year ${year}`);

    // ── NYC BOROUGH CHECK — boroughs have their own county-level population data ──
    const parts = hometown.split(',');
    if (parts.length >= 2) {
        const city = parts[0].trim().toLowerCase();
        const state = parts.slice(1).join(',').trim();
        if (isNYState(state)) {
            const boroData = NYC_BOROUGH_HISTORICAL_POP[city];
            if (boroData) {
                const years = Object.keys(boroData).map(Number).sort((a, b) => a - b);
                let closest = years[0];
                for (const y of years) {
                    if (Math.abs(y - year) < Math.abs(closest - year)) closest = y;
                }
                console.log(`🏙️ NYC borough historical: ${hometown} (${year}→${closest}) = ${boroData[closest].toLocaleString()}`);
                return boroData[closest];
            }
        }
    }

    // ── NEIGHBORHOOD RESOLUTION ──
    hometown = resolveHometown(hometown);
    // Check if resolved to an NYC borough
    const resolvedParts = hometown.split(',');
    if (resolvedParts.length >= 2) {
        const city = resolvedParts[0].trim().toLowerCase();
        const state = resolvedParts.slice(1).join(',').trim();
        if (isNYState(state)) {
            const boroData = NYC_BOROUGH_HISTORICAL_POP[city];
            if (boroData) {
                const years = Object.keys(boroData).map(Number).sort((a, b) => a - b);
                let closest = years[0];
                for (const y of years) {
                    if (Math.abs(y - year) < Math.abs(closest - year)) closest = y;
                }
                console.log(`🏙️ Neighborhood → borough historical: ${hometown} (${year}→${closest}) = ${boroData[closest].toLocaleString()}`);
                return boroData[closest];
            }
        }
    }

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
            // Strip Census designation suffixes (e.g., "Kansas City city" → "Kansas City")
            // Normalize whitespace: CSV may have extra spaces that break matching
            const cleanCity = stripCensusSuffixFromCity(city).replace(/\s+/g, ' ').trim();
            const cleanState = state.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
            const key = `${cleanCity}, ${cleanState}`.toLowerCase();

            // Also store with original city name as fallback key
            const originalKey = `${city.replace(/\s+/g, ' ').trim()}, ${cleanState}`.toLowerCase();

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
                // Merge with existing data if key already exists (e.g. "New York city" and "New York City"
                // both strip to "new york, new york" — merge so we keep all decade + yearly data)
                if (result[key]) {
                    result[key] = { ...result[key], ...yearData };
                } else {
                    result[key] = yearData;
                }
                // Also store under original key if different (for direct CSV matches)
                if (originalKey !== key) {
                    if (result[originalKey]) {
                        result[originalKey] = { ...result[originalKey], ...yearData };
                    } else {
                        result[originalKey] = yearData;
                    }
                }
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
