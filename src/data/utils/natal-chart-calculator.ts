/**
 * NATAL CHART CALCULATOR
 * Uses Celestine library - NASA/JPL Horizons verified astrology library
 * Provides accurate astronomical calculations for natal chart generation
 */

import {
    calculateChart,
    BirthData,
    Chart,
    ChartPlanet,
    Aspect as CelestineAspect,
    eclipticToZodiac,
    Planet,
    Sign
} from 'celestine';

export interface PlanetaryPosition {
    name: string;
    symbol: string;
    longitude: number; // 0-360 degrees
    latitude: number;  // -90 to 90 degrees
    zodiac: string;    // Aries, Taurus, etc.
    degree: number;    // 0-30 within the zodiac sign
    retrograde: boolean;
}

export interface NatalChartData {
    planets: PlanetaryPosition[];
    ascendant: number;
    ascendantZodiac: string;
    houses: number[];
    aspects: Aspect[];
    timestamp: number;
}

export interface Aspect {
    planet1: string;
    planet2: string;
    angle: number;
    type: string; // 'conjunction', 'sextile', 'square', 'trine', 'opposition'
    orb: number;
}

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: { [key: string]: string } = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
};

/**
 * Convert ecliptic longitude to zodiac sign and degree
 */
function longitudeToZodiac(longitude: number): { sign: string; degree: number } {
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLon / 30);
    const degree = normalizedLon % 30;

    return {
        sign: ZODIAC_SIGNS[signIndex],
        degree: Math.round(degree * 100) / 100
    };
}

/**
 * Map Celestine planets to our interface
 */
function mapCelestinePlanets(chart: Chart): PlanetaryPosition[] {
    const planets: PlanetaryPosition[] = [];

    if (chart.planets) {
        for (const planet of chart.planets) {
            const zodiac = longitudeToZodiac(planet.longitude);
            planets.push({
                name: planet.name,
                symbol: PLANET_SYMBOLS[planet.name] || planet.name[0],
                longitude: planet.longitude,
                latitude: planet.latitude || 0,
                zodiac: zodiac.sign,
                degree: zodiac.degree,
                retrograde: planet.isRetrograde || false
            });
        }
    }

    return planets;
}

/**
 * Map Celestine aspects to our interface
 */
function mapCelestineAspects(chart: Chart): Aspect[] {
    const aspects: Aspect[] = [];

    if (chart.aspects && Object.keys(chart.aspects).length > 0) {
        // Celestine returns aspects as an object indexed by planet pairs
        for (const key in chart.aspects) {
            const aspectArray = (chart.aspects as any)[key];
            if (Array.isArray(aspectArray)) {
                for (const aspect of aspectArray) {
                    aspects.push({
                        planet1: aspect.bodies?.[0] || 'Unknown',
                        planet2: aspect.bodies?.[1] || 'Unknown',
                        angle: aspect.angle || 0,
                        type: aspect.type?.name?.toLowerCase() || 'aspect',
                        orb: aspect.orb || 0
                    });
                }
            }
        }
    }

    return aspects;
}

/**
 * Calculate natal chart data from birth information
 * Uses Celestine library for NASA-verified calculations
 */
export function calculateNatalChart(
    birthDate: Date,
    latitude: number = 40.7128, // Default: NYC
    longitude: number = -74.0060
): NatalChartData {
    try {
        // Create BirthData object for Celestine
        const birthData: BirthData = {
            year: birthDate.getUTCFullYear(),
            month: birthDate.getUTCMonth() + 1,
            day: birthDate.getUTCDate(),
            hour: birthDate.getUTCHours(),
            minute: birthDate.getUTCMinutes(),
            second: birthDate.getUTCSeconds(),
            latitude,
            longitude,
            // Using UTC timezone of 0 for UTC dates
            timezone: 0
        };

        // Calculate natal chart using Celestine
        const chart = calculateChart(birthData);

        // Map Celestine data to our interface
        const planets = mapCelestinePlanets(chart);

        // Get ascendant from chart angles
        const ascendantValue = chart.angles?.ascendant?.longitude || 0;
        const ascendantZodiac = longitudeToZodiac(ascendantValue).sign;

        // Get house cusps from chart - handle ChartHouses structure
        const houses: number[] = [];
        if (chart.houses && Object.keys(chart.houses).length > 0) {
            for (let i = 1; i <= 12; i++) {
                const house = (chart.houses as any)[i];
                if (house?.longitude) {
                    houses.push(house.longitude);
                }
            }
        }

        // Get aspects from chart
        const aspects = mapCelestineAspects(chart);

        return {
            planets,
            ascendant: ascendantValue,
            ascendantZodiac,
            houses,
            aspects,
            timestamp: birthDate.getTime()
        };
    } catch (error) {
        console.error('Error calculating natal chart:', error);
        // Fallback to empty chart
        return {
            planets: [],
            ascendant: 0,
            ascendantZodiac: 'Aries',
            houses: [],
            aspects: [],
            timestamp: birthDate.getTime()
        };
    }
}

/**
 * Get interpretation for a planet in a sign
 */
export function getPlanetSignInterpretation(planet: string, sign: string): string {
    const interpretations: { [key: string]: { [key: string]: string } } = {
        'Sun': {
            'Aries': 'Courageous, bold, and pioneering spirit',
            'Taurus': 'Stable, reliable, and grounded presence',
            'Gemini': 'Communicative, curious, and intellectual nature',
            'Cancer': 'Nurturing, emotional, and intuitive soul',
            'Leo': 'Creative, confident, and natural leader',
            'Virgo': 'Analytical, practical, and detail-oriented',
            'Libra': 'Diplomatic, balanced, and relationship-focused',
            'Scorpio': 'Intense, mysterious, and transformative energy',
            'Sagittarius': 'Adventurous, philosophical, and expansive outlook',
            'Capricorn': 'Ambitious, disciplined, and responsible nature',
            'Aquarius': 'Innovative, independent, and idealistic vision',
            'Pisces': 'Compassionate, artistic, and spiritual essence'
        },
        'Moon': {
            'Aries': 'Quick emotional reactions, independent feelings',
            'Taurus': 'Stable emotions, loves comfort and security',
            'Gemini': 'Curious mind, emotional communication',
            'Cancer': 'Deep feelings, strong family bonds',
            'Leo': 'Warm heart, need for recognition',
            'Virgo': 'Analytical emotions, practical needs',
            'Libra': 'Harmony-seeking, relationship-oriented',
            'Scorpio': 'Intense emotions, mysterious depths',
            'Sagittarius': 'Optimistic feelings, freedom-loving',
            'Capricorn': 'Reserved emotions, serious feelings',
            'Aquarius': 'Detached emotions, unconventional needs',
            'Pisces': 'Sensitive feelings, empathetic nature'
        }
    };

    return interpretations[planet]?.[sign] || 'Explore their unique astrological influence';
}
