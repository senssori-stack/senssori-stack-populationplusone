// src/data/utils/zodiac-urls.ts
// Zodiac sign URLs linked to zodiacsign.com

export const ZODIAC_URLS: Record<string, string> = {
    'Aries': 'https://www.zodiacsign.com/zodiac-signs/aries/',
    'Taurus': 'https://www.zodiacsign.com/zodiac-signs/taurus/',
    'Gemini': 'https://www.zodiacsign.com/zodiac-signs/gemini/',
    'Cancer': 'https://www.zodiacsign.com/zodiac-signs/cancer/',
    'Leo': 'https://www.zodiacsign.com/zodiac-signs/leo/',
    'Virgo': 'https://www.zodiacsign.com/zodiac-signs/virgo/',
    'Libra': 'https://www.zodiacsign.com/zodiac-signs/libra/',
    'Scorpio': 'https://www.zodiacsign.com/zodiac-signs/scorpio/',
    'Sagittarius': 'https://www.zodiacsign.com/zodiac-signs/sagittarius/',
    'Capricorn': 'https://www.zodiacsign.com/zodiac-signs/capricorn/',
    'Aquarius': 'https://www.zodiacsign.com/zodiac-signs/aquarius/',
    'Pisces': 'https://www.zodiacsign.com/zodiac-signs/pisces/',
};

export function getZodiacURL(zodiacSign: string): string | null {
    return ZODIAC_URLS[zodiacSign] || null;
}
