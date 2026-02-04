// src/data/utils/astrology-api.ts
// Free Astrology API integration for Western astrology

const API_KEY = '9rXp3kmjA7a3FeZ9GdLLF7FhoDzxzTsdUSFPhE92';
const BASE_URL = 'https://json.freeastrologyapi.com';

export interface BirthChartData {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planets: Array<{
        name: string;
        sign: string;
        degree: number;
        house: number;
    }>;
    houses: Array<{
        house: number;
        sign: string;
        degree: number;
    }>;
    aspects: Array<{
        planet1: string;
        planet2: string;
        aspect: string;
        angle: number;
    }>;
    chartSvg?: string;
}

/**
 * Fetch complete Western birth chart data
 */
export async function getWesternBirthChart(
    dateOfBirth: string, // YYYY-MM-DD
    timeOfBirth: string, // HH:MM (24-hour format)
    latitude: number,
    longitude: number,
    timezone: string = 'America/New_York'
): Promise<BirthChartData | null> {
    try {
        console.log('🔮 Fetching birth chart data from Free Astrology API...');

        // Parse date and time
        const [year, month, day] = dateOfBirth.split('-').map(Number);
        const [hour, minute] = timeOfBirth.split(':').map(Number);

        // Convert timezone string to numeric offset (e.g., "America/New_York" -> -5)
        const timezoneOffset = -5; // Default EST, should be calculated based on location

        const requestBody = {
            year,
            month,
            date: day,
            hours: hour,
            minutes: minute,
            seconds: 0,
            latitude,
            longitude,
            timezone: timezoneOffset,
            config: {
                observation_point: 'topocentric',
                ayanamsha: 'lahiri'
            }
        };

        console.log('📤 Request body:', JSON.stringify(requestBody));

        // Fetch planetary positions
        const planetsResponse = await fetch(`${BASE_URL}/planets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify(requestBody),
        });

        if (!planetsResponse.ok) {
            throw new Error(`Planets API returned ${planetsResponse.status}`);
        }

        const planetsData = await planetsResponse.json();
        console.log('📊 Planets data:', JSON.stringify(planetsData).substring(0, 200));

        // Fetch house cusps - try different endpoint
        let housesData: any = { output: [] };
        try {
            const housesResponse = await fetch(`${BASE_URL}/house-cusps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify(requestBody),
            });

            if (housesResponse.ok) {
                housesData = await housesResponse.json();
                console.log('🏠 Houses data:', JSON.stringify(housesData).substring(0, 200));
            } else {
                console.warn('⚠️ Houses endpoint returned', housesResponse.status, '- using fallback');
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch houses:', e);
        }

        // Fetch aspects
        let aspectsData: any = { output: [] };
        try {
            const aspectsResponse = await fetch(`${BASE_URL}/major-aspects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify(requestBody),
            });

            if (aspectsResponse.ok) {
                aspectsData = await aspectsResponse.json();
                console.log('⭐ Aspects data:', JSON.stringify(aspectsData).substring(0, 200));
            } else {
                console.warn('⚠️ Aspects endpoint returned', aspectsResponse.status, '- using fallback');
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch aspects:', e);
        }

        // Try to fetch chart SVG (optional)
        let chartSvg: string | undefined;
        try {
            const chartResponse = await fetch(`${BASE_URL}/natal-wheel-chart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify(requestBody),
            });
            if (chartResponse.ok) {
                const chartData = await chartResponse.json();
                chartSvg = chartData.output?.svg || chartData.svg;
                console.log('🎨 Chart SVG:', chartSvg ? 'Success' : 'Not found');
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch chart SVG:', e);
        }

        // Parse and structure the data
        const planets = planetsData.output || planetsData;
        const houses = housesData.output || [];
        const aspects = aspectsData.output || [];

        const birthChart: BirthChartData = {
            sunSign: planets.sun?.sign || planets.Sun?.sign || calculateZodiacSign(month, day),
            moonSign: planets.moon?.sign || planets.Moon?.sign || 'Unknown',
            risingSign: (Array.isArray(houses) && houses.length > 0 ? houses[0]?.sign : null) || 'Unknown',
            planets: Object.entries(planets)
                .filter(([name]) => !['output', 'status', 'statusCode', 'input'].includes(name))
                .map(([name, data]: [string, any]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    sign: data.sign || data.Sign || '',
                    degree: data.degree || data.degrees || data.full_degree || data.normDegree || 0,
                    house: data.house || data.House || 0,
                }))
                .filter(p => p.sign), // Only include planets with sign data
            houses: Array.isArray(houses) ? houses : [],
            aspects: Array.isArray(aspects) ? aspects : [],
            chartSvg,
        };

        console.log('✅ Birth chart data fetched successfully');
        console.log('Sun:', birthChart.sunSign, 'Moon:', birthChart.moonSign, 'Rising:', birthChart.risingSign);
        console.log('Planets count:', birthChart.planets.length, 'Houses count:', birthChart.houses.length, 'Aspects count:', birthChart.aspects.length);
        return birthChart;
    } catch (error) {
        console.error('❌ Failed to fetch birth chart:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
        return null;
    }
}

/**
 * Get daily horoscope for a zodiac sign
 */
export async function getDailyHoroscope(zodiacSign: string): Promise<string | null> {
    try {
        const response = await fetch(`${BASE_URL}/western-api/sun-sign-prediction/daily/${zodiacSign.toLowerCase()}`, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`Horoscope API returned ${response.status}`);
        }

        const data = await response.json();
        return data.prediction || null;
    } catch (error) {
        console.warn('⚠️ Failed to fetch horoscope:', error);
        return null;
    }
}

/**
 * Simple zodiac sign calculator (backup if API fails)
 */
export function calculateZodiacSign(month: number, day: number): string {
    const zodiacSigns = [
        { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
        { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
        { sign: 'Pisces', start: [2, 19], end: [3, 20] },
        { sign: 'Aries', start: [3, 21], end: [4, 19] },
        { sign: 'Taurus', start: [4, 20], end: [5, 20] },
        { sign: 'Gemini', start: [5, 21], end: [6, 20] },
        { sign: 'Cancer', start: [6, 21], end: [7, 22] },
        { sign: 'Leo', start: [7, 23], end: [8, 22] },
        { sign: 'Virgo', start: [8, 23], end: [9, 22] },
        { sign: 'Libra', start: [9, 23], end: [10, 22] },
        { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
        { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
    ];

    for (const zodiac of zodiacSigns) {
        const [startMonth, startDay] = zodiac.start;
        const [endMonth, endDay] = zodiac.end;

        if (
            (month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay)
        ) {
            return zodiac.sign;
        }
    }

    return 'Unknown';
}
