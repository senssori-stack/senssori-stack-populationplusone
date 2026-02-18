// src/data/utils/snapshot-mapping.ts
// Canonical mapping from common published-sheet header variants -> internal keys

export const SNAPSHOT_CANONICAL_MAP: Record<string, string> = {
    // gas
    'GAS (GALLON)': 'GALLON OF GASOLINE',
    'GALLON OF GASOLINE': 'GALLON OF GASOLINE',

    // bread / eggs / milk
    'LOAF OF BREAD': 'LOAF OF BREAD',
    'DOZEN EGGS': 'DOZEN EGGS',
    'GALLON OF MILK': 'GALLON OF MILK',

    // electricity variants
    'ELECTRICITY (KWH)': 'ELECTRICITY KWH',
    'ELECTRICITY KWH': 'ELECTRICITY KWH',
    'ELECTRICITY (kWh)': 'ELECTRICITY KWH',

    // precious metals
    'TROY OUNCE OF GOLD': 'GOLD OZ',
    'TROY OUNCE OF SILVER': 'SILVER OZ',
    'GOLD (OZ)': 'GOLD OZ',
    'SILVER (OZ)': 'SILVER OZ',

    // bitcoin
    'ONE BITCOIN': 'BITCOIN 1 BTC',
    'BITCOIN': 'BITCOIN 1 BTC',
    'BITCOIN 1 BTC': 'BITCOIN 1 BTC',

    // song
    'NO 1 SONG': '#1 SONG',
    'NO. 1 SONG': '#1 SONG',
    '#1 SONG': '#1 SONG',

    // misc
    'US POPULATION': 'US POPULATION',
    'WORLD POPULATION': 'WORLD POPULATION',
    'PRESIDENT': 'PRESIDENT',
    'VICE PRESIDENT': 'VICE PRESIDENT',
    'WON LAST SUPERBOWL': 'WON LAST SUPERBOWL',
    'WON LAST WORLD SERIES': 'WON LAST WORLD SERIES',
};

export default SNAPSHOT_CANONICAL_MAP;
