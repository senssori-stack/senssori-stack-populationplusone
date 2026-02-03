// src/data/utils/birthstone-urls.ts
// Birthstone URLs linked to gia.edu

export const BIRTHSTONE_URLS: Record<number, string> = {
    1: 'https://www.gia.edu/birthstones/january-birthstones',
    2: 'https://www.gia.edu/birthstones/february-birthstones',
    3: 'https://www.gia.edu/birthstones/march-birthstones',
    4: 'https://www.gia.edu/birthstones/april-birthstones',
    5: 'https://www.gia.edu/birthstones/may-birthstones',
    6: 'https://www.gia.edu/birthstones/june-birthstones',
    7: 'https://www.gia.edu/birthstones/july-birthstones',
    8: 'https://www.gia.edu/birthstones/august-birthstones',
    9: 'https://www.gia.edu/birthstones/september-birthstones',
    10: 'https://www.gia.edu/birthstones/october-birthstones',
    11: 'https://www.gia.edu/birthstones/november-birthstones',
    12: 'https://www.gia.edu/birthstones/december-birthstones',
};

export function getBirthstoneURL(month: number): string | null {
    return BIRTHSTONE_URLS[month] || null;
}
