// src/data/utils/current-snapshot.ts
// Current snapshot data as of January 2026 - fallback when Google Sheets is unavailable

export const CURRENT_SNAPSHOT_DATA: Record<string, string> = {
    // Prices
    'GALLON OF GASOLINE': '$2.82',
    'MINIMUM WAGE': '$7.25/hr',
    'LOAF OF BREAD': '$2.75',
    'DOZEN EGGS': '$4.90',
    'GALLON OF MILK': '$3.00',
    // GOLD OZ and SILVER OZ - NO FALLBACK, must come from Google Sheets fetch
    'DOW JONES CLOSE': '44,873.28',

    // Entertainment
    '#1 SONG': 'Thats So True by Gracie Abrams',
    '#1 MOVIE': 'Mufasa The Lion King',

    // Sports
    'WON LAST SUPERBOWL': 'Philadelphia Eagles',
    'WON LAST WORLD SERIES': 'Los Angeles Dodgers',

    // Population
    'US POPULATION': '343,065,849',
    'WORLD POPULATION': '8,200,000,000',

    // Government
    'PRESIDENT': 'Donald Trump',
    'VICE PRESIDENT': 'JD Vance',
};
