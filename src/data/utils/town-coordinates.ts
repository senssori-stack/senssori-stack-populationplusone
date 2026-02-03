// src/data/utils/town-coordinates.ts
// Major US city coordinates (latitude, longitude)

export interface CityCoordinates {
    name: string;
    state: string;
    lat: number;
    lng: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
    // Top 50 US Cities
    'NEW YORK, NY': { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    'LOS ANGELES, CA': { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    'CHICAGO, IL': { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    'HOUSTON, TX': { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    'PHOENIX, AZ': { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0742 },
    'PHILADELPHIA, PA': { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
    'SAN ANTONIO, TX': { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
    'SAN DIEGO, CA': { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
    'DALLAS, TX': { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
    'SAN JOSE, CA': { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
    'AUSTIN, TX': { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
    'JACKSONVILLE, FL': { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
    'FORT WORTH, TX': { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
    'COLUMBUS, OH': { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
    'CHARLOTTE, NC': { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
    'INDIANAPOLIS, IN': { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
    'SEATTLE, WA': { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
    'DENVER, CO': { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
    'BOSTON, MA': { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
    'MINNEAPOLIS, MN': { name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
    'MIAMI, FL': { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
    'ATLANTA, GA': { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
    'PORTLAND, OR': { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
    'PORTLAND, ME': { name: 'Portland', state: 'ME', lat: 43.6591, lng: -70.2568 },
    'NASHVILLE, TN': { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
    'NEW ORLEANS, LA': { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.2623 },
    'DETROIT, MI': { name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
    'MEMPHIS, TN': { name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
    'LOUISVILLE, KY': { name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
    'BALTIMORE, MD': { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
    'LAS VEGAS, NV': { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
    'ALBUQUERQUE, NM': { name: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
    'TUCSON, AZ': { name: 'Tucson', state: 'AZ', lat: 32.2217, lng: -110.9265 },
    'LONG BEACH, CA': { name: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937 },
    'FRESNO, CA': { name: 'Fresno', state: 'CA', lat: 36.7469, lng: -119.7726 },
    'SACRAMENTO, CA': { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
    'KANSAS CITY, MO': { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
    'MESA, AZ': { name: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8313 },
    'VIRGINIA BEACH, VA': { name: 'Virginia Beach', state: 'VA', lat: 36.8529, lng: -75.9780 },
    'OAKVILLE, ON': { name: 'Oakville', state: 'ON', lat: 43.4516, lng: -79.6633 },
    'TORONTO, ON': { name: 'Toronto', state: 'ON', lat: 43.6629, lng: -79.3957 },
    'VANCOUVER, BC': { name: 'Vancouver', state: 'BC', lat: 49.2827, lng: -123.1207 },
    'SPRINGFIELD, MO': { name: 'Springfield', state: 'MO', lat: 37.2089, lng: -93.2923 },
    'MIAMI BEACH, FL': { name: 'Miami Beach', state: 'FL', lat: 25.7907, lng: -80.1300 },
    'SANTA FE, NM': { name: 'Santa Fe', state: 'NM', lat: 35.0853, lng: -106.6056 },
    'SAN FRANCISCO, CA': { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    'PALM BEACH, FL': { name: 'Palm Beach', state: 'FL', lat: 26.7153, lng: -80.0534 },
};

/**
 * Get coordinates for a city
 * Supports "City, State" format and fuzzy matching
 */
export function getCityCoordinates(hometown: string): CityCoordinates | null {
    if (!hometown) return null;

    const normalized = hometown.toUpperCase().trim();

    // Direct lookup
    if (CITY_COORDINATES[normalized]) {
        return CITY_COORDINATES[normalized];
    }

    // Fuzzy matching - search for city name
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return coords;
        }
    }

    // Try partial matching on city name
    const parts = normalized.split(',');
    if (parts.length > 0) {
        const cityName = parts[0].trim();
        for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
            if (key.startsWith(cityName)) {
                return coords;
            }
        }
    }

    return null;
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
