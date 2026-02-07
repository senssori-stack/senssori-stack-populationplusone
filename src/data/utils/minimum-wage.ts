// src/data/utils/minimum-wage.ts
// Get the applicable minimum wage based on location (highest of federal, state, or local)

// Federal minimum wage history
const FEDERAL_MINIMUM_WAGES: Record<number, number> = {
    1938: 0.25, 1939: 0.30, 1945: 0.40, 1950: 0.75, 1956: 1.00,
    1961: 1.15, 1963: 1.25, 1967: 1.40, 1968: 1.60, 1974: 2.00,
    1975: 2.10, 1976: 2.30, 1978: 2.65, 1979: 2.90, 1980: 3.10,
    1981: 3.35, 1990: 3.80, 1991: 4.25, 1996: 4.75, 1997: 5.15,
    2007: 5.85, 2008: 6.55, 2009: 7.25, 2024: 7.25, 2025: 7.25, 2026: 7.25
};

// Current state minimum wages (as of 2026)
// These are updated annually - reflects highest known rates
const CURRENT_STATE_WAGES: Record<string, number> = {
    'AK': 11.91, 'AL': 7.25, 'AR': 11.00, 'AZ': 14.70, 'CA': 16.50,
    'CO': 14.81, 'CT': 16.35, 'DC': 17.50, 'DE': 15.00, 'FL': 14.00,
    'GA': 7.25, 'HI': 14.00, 'IA': 7.25, 'ID': 7.25, 'IL': 14.00,
    'IN': 7.25, 'KS': 7.25, 'KY': 7.25, 'LA': 7.25, 'MA': 15.00,
    'MD': 15.00, 'ME': 14.65, 'MI': 10.56, 'MN': 11.13, 'MO': 13.75,
    'MS': 7.25, 'MT': 10.55, 'NC': 7.25, 'ND': 7.25, 'NE': 13.50,
    'NH': 7.25, 'NJ': 15.49, 'NM': 12.00, 'NV': 12.00, 'NY': 16.50,
    'OH': 10.70, 'OK': 7.25, 'OR': 15.95, 'PA': 7.25, 'RI': 15.00,
    'SC': 7.25, 'SD': 11.50, 'TN': 7.25, 'TX': 7.25, 'UT': 7.25,
    'VA': 12.41, 'VT': 14.01, 'WA': 16.66, 'WI': 7.25, 'WV': 8.75, 'WY': 7.25
};

// State name to abbreviation mapping
const STATE_NAMES: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC'
};

// Major cities with local minimum wages higher than state (as of 2026)
const LOCAL_MINIMUM_WAGES: Record<string, number> = {
    // California cities
    'san francisco, ca': 18.67,
    'san francisco, california': 18.67,
    'los angeles, ca': 17.28,
    'los angeles, california': 17.28,
    'san jose, ca': 17.55,
    'san jose, california': 17.55,
    'oakland, ca': 16.50,
    'oakland, california': 16.50,
    'berkeley, ca': 18.67,
    'berkeley, california': 18.67,
    'emeryville, ca': 19.36,
    'emeryville, california': 19.36,
    'west hollywood, ca': 19.08,
    'west hollywood, california': 19.08,
    // Washington cities
    'seattle, wa': 19.97,
    'seattle, washington': 19.97,
    'seatac, wa': 19.71,
    'seatac, washington': 19.71,
    // Colorado cities
    'denver, co': 18.29,
    'denver, colorado': 18.29,
    // New York cities
    'new york, ny': 16.50,
    'new york city, ny': 16.50,
    'new york, new york': 16.50,
    // Arizona cities
    'flagstaff, az': 17.85,
    'flagstaff, arizona': 17.85,
    // Other high-cost cities
    'washington, dc': 17.50,
    'district of columbia': 17.50,
};

/**
 * Extract state abbreviation from hometown string
 */
export function extractStateFromHometown(hometown: string): string | null {
    if (!hometown) return null;

    const parts = hometown.split(',');
    if (parts.length >= 2) {
        const statePart = parts[parts.length - 1].trim().toUpperCase();
        // Check if it's already a 2-letter abbreviation
        if (statePart.length === 2 && CURRENT_STATE_WAGES[statePart] !== undefined) {
            return statePart;
        }
        // Try to match full state name
        const statePartLower = parts[parts.length - 1].trim().toLowerCase();
        if (STATE_NAMES[statePartLower]) {
            return STATE_NAMES[statePartLower];
        }
    }
    return null;
}

/**
 * Get federal minimum wage for a given year
 */
export function getFederalMinimumWage(year: number): number {
    const years = Object.keys(FEDERAL_MINIMUM_WAGES).map(Number).sort((a, b) => a - b);
    for (let i = years.length - 1; i >= 0; i--) {
        if (year >= years[i]) {
            return FEDERAL_MINIMUM_WAGES[years[i]];
        }
    }
    return FEDERAL_MINIMUM_WAGES[years[0]];
}

/**
 * Get state minimum wage for a given state abbreviation
 */
export function getStateMinimumWage(stateCode: string): number {
    return CURRENT_STATE_WAGES[stateCode.toUpperCase()] || 7.25;
}

/**
 * Get local minimum wage for a specific city (if any)
 */
export function getLocalMinimumWage(hometown: string): number | null {
    if (!hometown) return null;
    const normalized = hometown.toLowerCase().trim();
    return LOCAL_MINIMUM_WAGES[normalized] || null;
}

export interface MinimumWageResult {
    wage: number;
    formatted: string;
    source: 'federal' | 'state' | 'local';
    location?: string;
}

/**
 * Get the applicable minimum wage for a location
 * Returns the HIGHEST of federal, state, or local minimum wage
 * This follows the legal rule that workers get whichever is highest
 */
export function getMinimumWage(hometown: string | undefined, year: number = new Date().getFullYear()): MinimumWageResult {
    const federal = getFederalMinimumWage(year);
    let highest = federal;
    let source: 'federal' | 'state' | 'local' = 'federal';
    let location: string | undefined;

    if (hometown) {
        // Check local minimum wage first (highest priority)
        const local = getLocalMinimumWage(hometown);
        if (local && local > highest) {
            highest = local;
            source = 'local';
            location = hometown.split(',')[0].trim();
        }

        // Check state minimum wage
        const state = extractStateFromHometown(hometown);
        if (state) {
            const stateWage = getStateMinimumWage(state);
            if (stateWage > highest) {
                highest = stateWage;
                source = 'state';
                location = state;
            }
        }
    }

    return {
        wage: highest,
        formatted: `$${highest.toFixed(2)}/hr`,
        source,
        location
    };
}

/**
 * Get formatted minimum wage string for display
 */
export function getMinimumWageFormatted(hometown: string | undefined, year?: number): string {
    const result = getMinimumWage(hometown, year);
    return result.formatted;
}
