// src/data/utils/town-coordinates.ts
// City coordinates fetched from Google Sheets (32,350 US cities from Census Gazetteer)

import { fetchCSV } from './csv';
import { COORDINATES_CSV_URL } from './sheets';

export interface CityCoordinates {
    name: string;
    state: string;
    lat: number;
    lng: number;
}

// Cache for coordinates data
let COORDINATES_CACHE: Record<string, CityCoordinates> | null = null;
let COORDINATES_LOADING: Promise<void> | null = null;

// Fallback for major cities (used while loading or if fetch fails)
const FALLBACK_COORDINATES: Record<string, CityCoordinates> = {
    'NEW YORK, NY': { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    'LOS ANGELES, CA': { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    'CHICAGO, IL': { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    'HOUSTON, TX': { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    'PHOENIX, AZ': { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0742 },
    'PHILADELPHIA, PA': { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
    'SAN ANTONIO, TX': { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
    'SAN DIEGO, CA': { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
    'DALLAS, TX': { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
    'SAN FRANCISCO, CA': { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    'SEATTLE, WA': { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
    'DENVER, CO': { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
    'BOSTON, MA': { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
    'MIAMI, FL': { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
    'ATLANTA, GA': { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
    'KANSAS CITY, MO': { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
    'ST. LOUIS, MO': { name: 'St. Louis', state: 'MO', lat: 38.6270, lng: -90.1994 },
    'BELLEFONTAINE NEIGHBORS, MO': { name: 'Bellefontaine Neighbors', state: 'MO', lat: 38.7528, lng: -90.2280 },
};

// Legacy export for backwards compatibility
export const CITY_COORDINATES = FALLBACK_COORDINATES;

/**
 * Load coordinates from Google Sheets CSV
 */
async function loadCoordinates(): Promise<void> {
    if (COORDINATES_CACHE) return;

    if (COORDINATES_LOADING) {
        await COORDINATES_LOADING;
        return;
    }

    COORDINATES_LOADING = (async () => {
        try {
            console.log('🌐 Fetching coordinates from Google Sheets...');
            const csv = await fetchCSV(COORDINATES_CSV_URL);
            console.log(`📥 Loaded ${csv.length} coordinate records`);

            // Skip header row
            const dataRows = csv.slice(1);

            COORDINATES_CACHE = {};

            for (const row of dataRows) {
                if (row.length >= 4) {
                    const city = (row[0] || '').trim();
                    const state = (row[1] || '').trim();
                    const lat = parseFloat(row[2]);
                    const lng = parseFloat(row[3]);

                    if (city && state && !isNaN(lat) && !isNaN(lng)) {
                        const key = `${city.toUpperCase()}, ${state.toUpperCase()}`;
                        COORDINATES_CACHE[key] = { name: city, state, lat, lng };
                    }
                }
            }

            console.log(`✅ Cached ${Object.keys(COORDINATES_CACHE).length} city coordinates`);
        } catch (error) {
            console.error('❌ Failed to load coordinates from Google Sheets:', error);
            // Use fallback
            COORDINATES_CACHE = { ...FALLBACK_COORDINATES };
        }
    })();

    await COORDINATES_LOADING;
}

/**
 * Get coordinates for a city (async - fetches from Google Sheets if needed)
 * Supports "City, State" format and fuzzy matching
 */
export async function getCityCoordinatesAsync(hometown: string): Promise<CityCoordinates | null> {
    if (!hometown) return null;

    await loadCoordinates();

    const normalized = hometown.toUpperCase().trim();
    const cache = COORDINATES_CACHE || FALLBACK_COORDINATES;

    // Direct lookup
    if (cache[normalized]) {
        return cache[normalized];
    }

    // Try with different formatting
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        const city = parts[0];
        const state = parts[1];

        // Try exact match with cleaned format
        const cleanKey = `${city}, ${state}`;
        if (cache[cleanKey]) {
            return cache[cleanKey];
        }
    }

    // Fuzzy matching - search for city name
    for (const [key, coords] of Object.entries(cache)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return coords;
        }
    }

    // Try partial matching on city name
    if (parts.length > 0) {
        const cityName = parts[0];
        for (const [key, coords] of Object.entries(cache)) {
            if (key.startsWith(cityName + ',')) {
                return coords;
            }
        }
    }

    return null;
}

/**
 * Get coordinates for a city (sync - uses cache or fallback)
 * For backwards compatibility with existing code
 */
export function getCityCoordinates(hometown: string): CityCoordinates | null {
    if (!hometown) return null;

    const normalized = hometown.toUpperCase().trim();
    const cache = COORDINATES_CACHE || FALLBACK_COORDINATES;

    // Direct lookup
    if (cache[normalized]) {
        return cache[normalized];
    }

    // Try with different formatting
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        const city = parts[0];
        const state = parts[1];

        const cleanKey = `${city}, ${state}`;
        if (cache[cleanKey]) {
            return cache[cleanKey];
        }
    }

    // Fuzzy matching
    for (const [key, coords] of Object.entries(cache)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return coords;
        }
    }

    // Try partial matching on city name
    if (parts.length > 0) {
        const cityName = parts[0];
        for (const [key, coords] of Object.entries(cache)) {
            if (key.startsWith(cityName + ',')) {
                return coords;
            }
        }
    }

    return null;
}

/**
 * Preload coordinates (call early in app startup)
 */
export async function preloadCoordinates(): Promise<void> {
    await loadCoordinates();
}

/**
 * Format coordinates for display
 * Returns formatted string like "40.7128°N, 74.0060°W"
 */
export function formatCoordinates(coords: CityCoordinates): string {
    const latDir = coords.lat >= 0 ? 'N' : 'S';
    const lngDir = coords.lng >= 0 ? 'E' : 'W';

    return `${Math.abs(coords.lat).toFixed(4)}°${latDir}, ${Math.abs(coords.lng).toFixed(4)}°${lngDir}`;
}

/**
 * Get both city name and coordinates for display
 */
export function getCityInfo(hometown: string): { name: string; coordinates: string } | null {
    const coords = getCityCoordinates(hometown);
    if (!coords) return null;

    return {
        name: `${coords.name}, ${coords.state}`,
        coordinates: formatCoordinates(coords),
    };
}

/**
 * Get both city name and coordinates for display (async version)
 */
export async function getCityInfoAsync(hometown: string): Promise<{ name: string; coordinates: string } | null> {
    const coords = await getCityCoordinatesAsync(hometown);
    if (!coords) return null;

    return {
        name: `${coords.name}, ${coords.state}`,
        coordinates: formatCoordinates(coords),
    };
}
