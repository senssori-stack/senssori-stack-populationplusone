import { fetchCSV } from './csv';
import { POPULATIONS_CSV_URL } from './sheets';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠️  CRITICAL POPULATION FETCH RULES - DO NOT MODIFY ⚠️                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                           ║
 * ║  RULE 1: DOB BEFORE 01-01-2020                                                           ║
 * ║  → City, ST population from HISTORICAL CSV (HISTORICAL_POPULATIONS_CSV_URL)              ║
 * ║  → Used for: Front Sign + Time Capsule "THEN" section                                    ║
 * ║                                                                                           ║
 * ║  RULE 2: DOB ON OR AFTER 01-01-2020                                                      ║
 * ║  → City, ST population from CURRENT CSV (POPULATIONS_CSV_URL)                            ║
 * ║  → Used for: Front Sign                                                                  ║
 * ║                                                                                           ║
 * ║  RULE 3: TIME CAPSULE "NOW" SECTION                                                      ║
 * ║  → ALWAYS use CURRENT CSV regardless of DOB                                              ║
 * ║  → Use getCurrentPopulationForCity() function                                            ║
 * ║                                                                                           ║
 * ║  RULE 4: CITY NOT FOUND                                                                  ║
 * ║  → Return null - caller must show popup:                                                 ║
 * ║  → "OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT                     ║
 * ║     INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT."        ║
 * ║                                                                                           ║
 * ║  DO NOT USE FALLBACK_POPULATIONS ARRAY - CAUSES FALSE RESULTS                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

// cache to avoid re-downloading
let POP_ROWS: { area: string; pop: number }[] | null = null;

/**
 * @deprecated DO NOT USE - CAUSES FALSE RESULTS
 * This array is kept only for reference. All population lookups MUST use Google Sheets CSV.
 */
const FALLBACK_POPULATIONS: { area: string; pop: number }[] = [
    // Top 100 US Cities to minimize Google Sheets usage
    { area: "New York, New York", pop: 8336817 },
    { area: "Los Angeles, California", pop: 3979576 },
    { area: "Chicago, Illinois", pop: 2693976 },
    { area: "Houston, Texas", pop: 2320268 },
    { area: "Phoenix, Arizona", pop: 1680992 },
    { area: "Philadelphia, Pennsylvania", pop: 1584064 },
    { area: "San Antonio, Texas", pop: 1547253 },
    { area: "San Diego, California", pop: 1423851 },
    { area: "Dallas, Texas", pop: 1343573 },
    { area: "San Jose, California", pop: 1021795 },
    { area: "Austin, Texas", pop: 978908 },
    { area: "Jacksonville, Florida", pop: 911507 },
    { area: "Fort Worth, Texas", pop: 918915 },
    { area: "Columbus, Ohio", pop: 898553 },
    { area: "Charlotte, North Carolina", pop: 885708 },
    { area: "San Francisco, California", pop: 873965 },
    { area: "Indianapolis, Indiana", pop: 876384 },
    { area: "Seattle, Washington", pop: 753675 },
    { area: "Denver, Colorado", pop: 715522 },
    { area: "Washington, District of Columbia", pop: 689545 },
    { area: "Boston, Massachusetts", pop: 694583 },
    { area: "Nashville, Tennessee", pop: 670820 },
    { area: "Detroit, Michigan", pop: 673104 },
    { area: "Portland, Oregon", pop: 652503 },
    { area: "Las Vegas, Nevada", pop: 651319 },
    { area: "Memphis, Tennessee", pop: 651073 },
    { area: "Baltimore, Maryland", pop: 585708 },
    { area: "Milwaukee, Wisconsin", pop: 577222 },
    { area: "Atlanta, Georgia", pop: 498715 },
    { area: "Miami, Florida", pop: 470914 },
    { area: "Tampa, Florida", pop: 384959 },
    { area: "New Orleans, Louisiana", pop: 383997 },
    { area: "Cleveland, Ohio", pop: 383793 },
    { area: "Orlando, Florida", pop: 307573 },
    { area: "St. Louis, Missouri", pop: 301578 },
    { area: "Pittsburgh, Pennsylvania", pop: 302971 },
    // Additional major cities to reduce Google Sheets calls
    { area: "Tucson, Arizona", pop: 548073 },
    { area: "Fresno, California", pop: 542107 },
    { area: "Sacramento, California", pop: 524943 },
    { area: "Kansas City, Missouri", pop: 508090 },
    { area: "Mesa, Arizona", pop: 504258 },
    { area: "Virginia Beach, Virginia", pop: 459470 },
    { area: "Oakland, California", pop: 440646 },
    { area: "Minneapolis, Minnesota", pop: 429954 },
    { area: "Tulsa, Oklahoma", pop: 413066 },
    { area: "Arlington, Texas", pop: 394266 },
    { area: "Wichita, Kansas", pop: 397532 },
    { area: "Raleigh, North Carolina", pop: 474069 },
    { area: "Omaha, Nebraska", pop: 486051 },
    { area: "Long Beach, California", pop: 466742 },
    { area: "Albuquerque, New Mexico", pop: 564559 },
    { area: "Bakersfield, California", pop: 383579 },
    { area: "Colorado Springs, Colorado", pop: 478961 },
    { area: "Anaheim, California", pop: 352497 },
    { area: "Honolulu, Hawaii", pop: 345064 },
    { area: "Tampa Bay, Florida", pop: 384959 },
    { area: "Aurora, Colorado", pop: 379289 },
    { area: "Santa Ana, California", pop: 334217 },
    { area: "St. Paul, Minnesota", pop: 311527 },
    { area: "Riverside, California", pop: 314998 },
    { area: "Corpus Christi, Texas", pop: 326586 },
    { area: "Lexington, Kentucky", pop: 323152 },
    { area: "Anchorage, Alaska", pop: 291247 },
    { area: "Stockton, California", pop: 310496 },
    { area: "Toledo, Ohio", pop: 270871 },
    { area: "St. Petersburg, Florida", pop: 258308 },
    { area: "Newark, New Jersey", pop: 311549 },
    { area: "Greensboro, North Carolina", pop: 296710 },
    { area: "Plano, Texas", pop: 285494 },
    { area: "Henderson, Nevada", pop: 320189 },
    { area: "Lincoln, Nebraska", pop: 295178 },
    { area: "Buffalo, New York", pop: 278349 },
    { area: "Fort Wayne, Indiana", pop: 270402 },
    { area: "Jersey City, New Jersey", pop: 292449 },
    { area: "Chula Vista, California", pop: 275487 },
    { area: "Norfolk, Virginia", pop: 238005 },
    { area: "Orlando, FL", pop: 307573 },
    { area: "Chandler, Arizona", pop: 261165 },
    { area: "Laredo, Texas", pop: 262491 },
    { area: "Madison, Wisconsin", pop: 269840 },
    { area: "Durham, North Carolina", pop: 283506 },
    { area: "Lubbock, Texas", pop: 258862 },
    { area: "Winston-Salem, North Carolina", pop: 249545 },
    { area: "Garland, Texas", pop: 246018 },
    { area: "Glendale, Arizona", pop: 248325 },
    { area: "Hialeah, Florida", pop: 223109 },
    { area: "Reno, Nevada", pop: 264165 },
    { area: "Baton Rouge, Louisiana", pop: 227470 },
    { area: "Irvine, California", pop: 307670 },
    { area: "Chesapeake, Virginia", pop: 249422 },
    { area: "Irving, Texas", pop: 256684 },
    { area: "Scottsdale, Arizona", pop: 258069 },
    { area: "North Las Vegas, Nevada", pop: 262527 },
    { area: "Fremont, California", pop: 230504 },
    { area: "Gilbert, Arizona", pop: 267918 },
    { area: "San Bernardino, California", pop: 222101 },
    { area: "Boise, Idaho", pop: 235684 },
    { area: "Birmingham, Alabama", pop: 200733 }
];

/**
 * @deprecated DO NOT USE - CAUSES FALSE RESULTS
 * This function is kept only for reference. All population lookups MUST use Google Sheets CSV.
 * DO NOT CALL THIS FUNCTION UNDER ANY CIRCUMSTANCES.
 */
function checkLocalFallback(hometown: string): number | null {
    try {
        const parts = hometown.split(',');
        if (parts.length < 2) return null;

        const city = parts[0].trim();
        const state = parts[1].trim();

        // Try exact match first
        const searchString = `${city}, ${state}`;
        let match = FALLBACK_POPULATIONS.find(item =>
            item.area.toLowerCase() === searchString.toLowerCase()
        );

        if (match) {
            console.log('🎯 LOCAL CACHE HIT (free):', match.area, '→', match.pop.toLocaleString());
            return match.pop;
        }

        // Try partial matches for major cities
        match = FALLBACK_POPULATIONS.find(item => {
            const itemParts = item.area.toLowerCase().split(', ');
            const cityLower = city.toLowerCase();
            const stateLower = state.toLowerCase();

            return itemParts[0] === cityLower && (
                itemParts[1] === stateLower ||
                itemParts[1] === toFullState(stateLower).toLowerCase()
            );
        });

        if (match) {
            console.log('🎯 LOCAL PARTIAL HIT (free):', match.area, '→', match.pop.toLocaleString());
            return match.pop;
        }

        console.log('❌ Not in local cache, will try Google Sheets');
        return null;
    } catch (error) {
        console.error('Error checking local fallback:', error);
        return null;
    }
}

// map postal -> full state
const STATE_MAP: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
    MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
    NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
    OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia',
};

function toFullState(s: string): string {
    const t = s.replace('.', '').trim();
    const up = t.toUpperCase();
    if (STATE_MAP[up]) return STATE_MAP[up];
    // Already full?
    const guess = t
        .replace(/\s+/g, ' ')
        .replace(/\bSt\b\.?/gi, 'Saint')
        .trim();
    return guess;
}

function normArea(city: string, stateFull: string): string[] {
    // Sheet sometimes has no space after comma: "City,Alabama"
    const c = city.replace(/\s+/g, ' ').replace(/\./g, '').trim();
    const s = stateFull.replace(/\s+/g, ' ').trim();
    return [`${c},${s}`, `${c}, ${s}`];
}

async function ensureLoaded(): Promise<void> {
    if (POP_ROWS) return;

    /**
     * ⚠️ CRITICAL: DO NOT USE FALLBACK_POPULATIONS - CAUSES FALSE RESULTS ⚠️
     * Always fetch from Google Sheets CSV. If fetch fails, throw error.
     */

    let csv: string[][];
    try {
        console.log('🌐 Fetching populations CSV from:', POPULATIONS_CSV_URL);
        csv = await fetchCSV(POPULATIONS_CSV_URL);
        console.log('📥 CSV fetched from Google Sheets, rows:', csv.length);
    } catch (error) {
        console.error('❌ CRITICAL: Failed to fetch from Google Sheets - DO NOT USE LOCAL FALLBACK');
        // DO NOT USE FALLBACK_POPULATIONS - causes false results
        throw new Error('Google Sheets population fetch failed - local fallback disabled');
    }

    // Check if first row looks like a header or actual data
    const firstRow = csv[0];
    let dataRows = csv;

    console.log('📋 First CSV row:', firstRow);

    // If first row contains header text, skip it
    if (firstRow && firstRow.some(cell =>
        /geographic\s*area/i.test(cell) || /population/i.test(cell)
    )) {
        console.log('  Found header row, using header format');
        const [header, ...body] = csv;
        const areaIdx = header.findIndex(h => /geographic\s*area/i.test(h));
        const popIdx = header.findIndex(h => /population/i.test(h));

        if (areaIdx === -1 || popIdx === -1) {
            console.error('❌ CRITICAL: Header format invalid - DO NOT USE LOCAL FALLBACK');
            // DO NOT USE FALLBACK_POPULATIONS - causes false results
            throw new Error('Google Sheets CSV header format invalid - local fallback disabled');
        }

        dataRows = body;
        POP_ROWS = dataRows
            .filter(r => r[areaIdx] && r[popIdx])
            .map(r => {
                const area = r[areaIdx].trim();
                const pop = parseInt(r[popIdx].replace(/,/g, ''), 10);
                return { area, pop: Number.isFinite(pop) ? pop : NaN };
            });
    } else {
        // No header, assume format: [city_state, population]
        console.log('📊 No header found, assuming raw data format');
        POP_ROWS = dataRows
            .filter(r => r.length >= 2 && r[0] && r[1])
            .map(r => {
                const area = r[0].trim();
                const popStr = (r[1] || '').toString().replace(/[",]/g, '');
                const pop = parseInt(popStr, 10);
                return { area, pop: Number.isFinite(pop) ? pop : NaN };
            })
            .filter(r => Number.isFinite(r.pop)); // Filter out invalid populations
    }

    console.log(`✅ Loaded ${POP_ROWS.length} population records from Google Sheets`);
    if (POP_ROWS.length > 0) {
        console.log('📍 Sample records:', POP_ROWS.slice(0, 3).map(r => `${r.area}: ${r.pop}`));
    }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠️  CRITICAL POPULATION ROUTING - DO NOT MODIFY ⚠️                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════╣
 * ║  DOB BEFORE 01-01-2020 → HISTORICAL CSV (HISTORICAL_POPULATIONS_CSV_URL)                 ║
 * ║  DOB ON/AFTER 01-01-2020 → CURRENT CSV (POPULATIONS_CSV_URL)                             ║
 * ║                                                                                           ║
 * ║  IF CITY NOT FOUND → Return null (caller shows error popup)                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * Returns population for "City, ST" or "City, State" (case/space tolerant).
 * If not found, returns null - caller must show popup message.
 * 
 * @param hometown - The city, state string (e.g., "Las Vegas, NV" or "Las Vegas, Nevada")
 * @param dobISO - Date of birth in ISO format (YYYY-MM-DD). Routes to appropriate CSV.
 */
export async function getPopulationForCity(hometown: string, dobISO?: string): Promise<number | null> {
    console.log('📍 getPopulationForCity called with:', hometown, 'DOB:', dobISO || 'not provided');

    const CUTOFF_DATE = new Date('2020-01-01');
    const dobDate = dobISO ? new Date(dobISO) : null;
    const isBefore2020 = dobDate ? dobDate < CUTOFF_DATE : false;

    /**
     * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
     * ║  RULE: DOB BEFORE 01-01-2020 → Use HISTORICAL CSV                                        ║
     * ║  RULE: DOB ON/AFTER 01-01-2020 → Use CURRENT CSV                                         ║
     * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
     */
    if (isBefore2020 && dobDate) {
        const birthYear = dobDate.getFullYear();
        console.log('🟡 DOB is BEFORE 2020-01-01 - Using HISTORICAL CSV for year', birthYear);

        // Dynamic import to avoid circular dependency
        const { getHistoricalPopulationForCity } = await import('./historical-populations');
        return getHistoricalPopulationForCity(hometown, birthYear);
    }

    // DOB is on/after 2020-01-01 OR no DOB provided → Use CURRENT CSV
    console.log('🔵 DOB is ON/AFTER 2020-01-01 - Using CURRENT CSV (POPULATIONS_CSV_URL)');

    try {
        await ensureLoaded();
        console.log('📋 Population data loaded, rows count:', POP_ROWS?.length || 0);

        // Extract city + state parts
        const match = hometown.split(',');
        if (match.length < 2) {
            console.log('❌ Invalid hometown format (no comma):', hometown);
            return null;
        }

        const city = match[0].trim();
        const stateRaw = match.slice(1).join(',').trim(); // handle "City, State, Extra"
        const stateFull = toFullState(stateRaw);
        console.log('🔍 Searching for city:', city, 'state:', stateFull);

        const candidates = normArea(city, stateFull).map(x => x.toLowerCase());
        console.log('🎯 Search candidates:', candidates);

        const found = POP_ROWS!.find(r => candidates.includes(r.area.toLowerCase()));
        if (found && Number.isFinite(found.pop)) {
            console.log('✅ Exact match found:', found);
            return found.pop;
        }

        // Try more flexible search: normalize spaces and special characters
        const normalizeCity = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s,]/g, '').trim();
        const normalizedInput = normalizeCity(`${city}, ${stateFull}`);

        const flexibleMatch = POP_ROWS!.find(r => {
            const normalizedRecord = normalizeCity(r.area);
            return normalizedRecord === normalizedInput ||
                normalizedRecord.includes(normalizeCity(city)) && normalizedRecord.includes(normalizeCity(stateFull));
        });

        if (flexibleMatch && Number.isFinite(flexibleMatch.pop)) {
            console.log('✅ Flexible match found:', flexibleMatch);
            return flexibleMatch.pop;
        }

        // Try loosy search: startsWith city + includes state
        const byCity = POP_ROWS!.filter(r => r.area.toLowerCase().startsWith(city.toLowerCase() + ','));
        console.log('🔍 Cities starting with', city + ':', byCity.length, 'found');
        const fuzzy = byCity.find(r => r.area.toLowerCase().includes(stateFull.toLowerCase()));
        if (fuzzy && Number.isFinite(fuzzy.pop)) {
            console.log('✅ Fuzzy match found:', fuzzy);
            return fuzzy.pop;
        }

        // Try partial city name matching 
        const partialMatch = POP_ROWS!.find(r => {
            const recordCity = r.area.split(',')[0].toLowerCase().trim();
            const recordState = r.area.split(',')[1]?.toLowerCase().trim() || '';
            return recordCity.includes(city.toLowerCase()) && recordState.includes(stateFull.toLowerCase());
        });

        if (partialMatch && Number.isFinite(partialMatch.pop)) {
            console.log('✅ Partial match found:', partialMatch);
            return partialMatch.pop;
        }

        // Show some example cities that are available
        const newYorkOptions = POP_ROWS!.filter(r => r.area.toLowerCase().includes('new york')).slice(0, 3);
        const suggestions = POP_ROWS!.filter(r => r.area.toLowerCase().includes(city.toLowerCase().substring(0, 4))).slice(0, 3);

        console.log('❌ No population found in Google Sheets for:', hometown);
        console.log('💡 Available New York options:', newYorkOptions.map(r => r.area));
        console.log('💡 Similar cities found:', suggestions.map(r => r.area));

        /**
         * ⚠️ CRITICAL: DO NOT USE SMART FALLBACK - RETURN NULL
         * Caller must show popup: "OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, 
         * WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT."
         */
        console.log('🔴 CITY NOT FOUND - Returning null (caller must show error popup)');
        return null;

    } catch (error) {
        console.error('💥 Error with Google Sheets:', error);
        console.log('🔴 FETCH ERROR - Returning null (caller must show error popup)');
        return null;
    }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  getCurrentPopulationForCity - FOR TIME CAPSULE "NOW" SECTION ONLY                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════╣
 * ║  ALWAYS uses CURRENT CSV (POPULATIONS_CSV_URL) regardless of DOB.                        ║
 * ║  This is for the "NOW" side of Time Capsule comparisons.                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */
export async function getCurrentPopulationForCity(hometown: string): Promise<number | null> {
    console.log('📍 getCurrentPopulationForCity called for TIME CAPSULE NOW section:', hometown);
    console.log('🔵 Using CURRENT CSV (POPULATIONS_CSV_URL) for NOW population');

    try {
        await ensureLoaded();
        console.log('📋 Current population data loaded, rows count:', POP_ROWS?.length || 0);

        // Extract city + state parts
        const match = hometown.split(',');
        if (match.length < 2) {
            console.log('❌ Invalid hometown format (no comma):', hometown);
            return null;
        }

        const city = match[0].trim();
        const stateRaw = match.slice(1).join(',').trim();
        const stateFull = toFullState(stateRaw);
        console.log('🔍 Searching for city:', city, 'state:', stateFull);

        const candidates = normArea(city, stateFull).map(x => x.toLowerCase());

        const found = POP_ROWS!.find(r => candidates.includes(r.area.toLowerCase()));
        if (found && Number.isFinite(found.pop)) {
            console.log('✅ NOW population found:', found);
            return found.pop;
        }

        // Flexible matching
        const normalizeCity = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s,]/g, '').trim();
        const normalizedInput = normalizeCity(`${city}, ${stateFull}`);

        const flexibleMatch = POP_ROWS!.find(r => {
            const normalizedRecord = normalizeCity(r.area);
            return normalizedRecord === normalizedInput ||
                normalizedRecord.includes(normalizeCity(city)) && normalizedRecord.includes(normalizeCity(stateFull));
        });

        if (flexibleMatch && Number.isFinite(flexibleMatch.pop)) {
            console.log('✅ NOW flexible match found:', flexibleMatch);
            return flexibleMatch.pop;
        }

        // Fuzzy search
        const byCity = POP_ROWS!.filter(r => r.area.toLowerCase().startsWith(city.toLowerCase() + ','));
        const fuzzy = byCity.find(r => r.area.toLowerCase().includes(stateFull.toLowerCase()));
        if (fuzzy && Number.isFinite(fuzzy.pop)) {
            console.log('✅ NOW fuzzy match found:', fuzzy);
            return fuzzy.pop;
        }

        console.log('❌ City not found in CURRENT CSV for NOW section:', hometown);
        return null;

    } catch (error) {
        console.error('💥 Error fetching NOW population:', error);
        return null;
    }
}

/**
 * @deprecated DO NOT USE - generateSmartFallback is disabled
 * If city is not found, return null and caller must show error popup.
 * Smart fallback causes incorrect results.
 */
// function generateSmartFallback - REMOVED - causes false results
