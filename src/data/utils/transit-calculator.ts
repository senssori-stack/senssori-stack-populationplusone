/**
 * TRANSIT CALCULATOR
 * Calculates current planetary positions and their aspects to natal chart
 * Used for generating accurate daily/weekly horoscopes
 */

import { calculateNatalChart, NatalChartData, PlanetaryPosition } from './natal-chart-calculator';

// Aspect types and their properties
export interface AspectType {
    name: string;
    angle: number;
    orb: number;  // Allowed deviation in degrees
    symbol: string;
    nature: 'major' | 'minor';
    influence: 'harmonious' | 'challenging' | 'neutral';
}

export const ASPECT_TYPES: AspectType[] = [
    { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌', nature: 'major', influence: 'neutral' },
    { name: 'Sextile', angle: 60, orb: 4, symbol: '⚹', nature: 'major', influence: 'harmonious' },
    { name: 'Square', angle: 90, orb: 7, symbol: '□', nature: 'major', influence: 'challenging' },
    { name: 'Trine', angle: 120, orb: 7, symbol: '△', nature: 'major', influence: 'harmonious' },
    { name: 'Opposition', angle: 180, orb: 8, symbol: '☍', nature: 'major', influence: 'challenging' },
];

// Transit information
export interface Transit {
    transitingPlanet: string;
    transitingSign: string;
    transitingDegree: number;
    natalPlanet: string;
    natalSign: string;
    natalDegree: number;
    aspectType: AspectType;
    exactOrb: number;  // How close to exact (0 = perfect)
    isApplying: boolean;  // Getting closer (stronger) vs separating
    intensity: 'exact' | 'strong' | 'moderate' | 'weak';
}

// Planet speed categories for transit duration estimation
const PLANET_SPEEDS: Record<string, { category: string; duration: string }> = {
    'Moon': { category: 'fast', duration: 'hours' },
    'Sun': { category: 'medium', duration: '1-3 days' },
    'Mercury': { category: 'medium', duration: '1-5 days' },
    'Venus': { category: 'medium', duration: '2-7 days' },
    'Mars': { category: 'slow', duration: '1-2 weeks' },
    'Jupiter': { category: 'slow', duration: '2-4 weeks' },
    'Saturn': { category: 'slow', duration: '2-4 weeks' },
    'Uranus': { category: 'very-slow', duration: '1-3 months' },
    'Neptune': { category: 'very-slow', duration: '2-6 months' },
    'Pluto': { category: 'very-slow', duration: '3-12 months' },
};

/**
 * Calculate the angular difference between two positions
 */
function getAngleDifference(pos1: number, pos2: number): number {
    let diff = Math.abs(pos1 - pos2);
    if (diff > 180) diff = 360 - diff;
    return diff;
}

/**
 * Determine aspect intensity based on orb
 */
function getIntensity(orb: number, maxOrb: number): 'exact' | 'strong' | 'moderate' | 'weak' {
    const ratio = orb / maxOrb;
    if (ratio <= 0.15) return 'exact';
    if (ratio <= 0.4) return 'strong';
    if (ratio <= 0.7) return 'moderate';
    return 'weak';
}

/**
 * Calculate current planetary positions (transits)
 * Uses the same astronomical calculations as natal chart
 */
export function getCurrentTransits(): PlanetaryPosition[] {
    // Calculate chart for right now, using Greenwich as reference
    const now = new Date();
    const chart = calculateNatalChart(now, 51.4772, 0.0);  // Greenwich
    return chart.planets;
}

/**
 * Find all aspects between current transits and natal chart
 */
export function calculateTransitAspects(
    natalChart: NatalChartData,
    transitDate: Date = new Date()
): Transit[] {
    // Get current positions
    const transitChart = calculateNatalChart(transitDate, 51.4772, 0.0);
    const transits: Transit[] = [];

    // Check each transiting planet against each natal planet
    for (const transitPlanet of transitChart.planets) {
        // Skip Moon for daily transits (too fast, changes every 2 hours)
        // But keep it for more detailed readings

        for (const natalPlanet of natalChart.planets) {
            // Check each aspect type
            for (const aspectType of ASPECT_TYPES) {
                const angleDiff = getAngleDifference(transitPlanet.longitude, natalPlanet.longitude);
                const orb = Math.abs(angleDiff - aspectType.angle);

                // Check if within orb
                if (orb <= aspectType.orb) {
                    transits.push({
                        transitingPlanet: transitPlanet.name,
                        transitingSign: transitPlanet.zodiac,
                        transitingDegree: transitPlanet.degree,
                        natalPlanet: natalPlanet.name,
                        natalSign: natalPlanet.zodiac,
                        natalDegree: natalPlanet.degree,
                        aspectType: aspectType,
                        exactOrb: Math.round(orb * 100) / 100,
                        isApplying: transitPlanet.longitude < natalPlanet.longitude, // Simplified
                        intensity: getIntensity(orb, aspectType.orb),
                    });
                }
            }
        }
    }

    // Sort by intensity (most exact first) and planet importance
    return transits.sort((a, b) => {
        // Prioritize major aspects
        if (a.aspectType.nature !== b.aspectType.nature) {
            return a.aspectType.nature === 'major' ? -1 : 1;
        }
        // Then by exactness
        return a.exactOrb - b.exactOrb;
    });
}

/**
 * Get transit duration estimate
 */
export function getTransitDuration(planetName: string): string {
    return PLANET_SPEEDS[planetName]?.duration || 'unknown';
}

/**
 * Filter transits to most significant ones for daily reading
 */
export function getSignificantTransits(transits: Transit[], limit: number = 5): Transit[] {
    // Filter out Moon transits for daily reading (too fast)
    const filtered = transits.filter(t => t.transitingPlanet !== 'Moon');

    // Prioritize:
    // 1. Exact aspects (orb < 1°)
    // 2. Major aspects
    // 3. Slow-moving planets (more impactful)

    const scored = filtered.map(t => {
        let score = 100 - t.exactOrb * 10;  // Closer = higher score

        if (t.aspectType.nature === 'major') score += 20;
        if (t.intensity === 'exact') score += 30;
        if (t.intensity === 'strong') score += 15;

        // Outer planets = bigger impact
        if (['Pluto', 'Neptune', 'Uranus'].includes(t.transitingPlanet)) score += 25;
        if (['Saturn', 'Jupiter'].includes(t.transitingPlanet)) score += 15;

        // Transits to personal planets matter more
        if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(t.natalPlanet)) score += 10;

        return { transit: t, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.transit);
}

/**
 * Get moon phase for a date — Meeus astronomical algorithm
 */
export function getMoonPhase(date: Date = new Date()): { phase: string; emoji: string; description: string } {
    // Julian Day Number
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + date.getUTCHours() / 24 +
        date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
    let Y = y, M = m;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const jde = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5;

    const T = (jde - 2451545.0) / 36525;
    const T2 = T * T;
    const T3 = T2 * T;
    const rad = (deg: number) => deg * Math.PI / 180;
    const norm = (deg: number) => ((deg % 360) + 360) % 360;

    // Sun longitude (Meeus Ch.25)
    const L0 = norm(280.46646 + 36000.76983 * T + 0.0003032 * T2);
    const Ms = norm(357.52911 + 35999.05029 * T - 0.0001537 * T2);
    const Msr = rad(Ms);
    const C = (1.914602 - 0.004817 * T) * Math.sin(Msr) + (0.019993 - 0.000101 * T) * Math.sin(2 * Msr) + 0.000289 * Math.sin(3 * Msr);
    const omega = rad(125.04 - 1934.136 * T);
    const sunLon = norm(L0 + C - 0.00569 - 0.00478 * Math.sin(omega));

    // Moon longitude (Meeus Ch.47 principal terms)
    const T4 = T3 * T;
    const Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
    const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
    const Mm = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
    const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
    const F = norm(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
    const Dr = rad(D), Mmr = rad(Mm), Mpr = rad(Mp), Fr = rad(F);
    const E = 1 - 0.002516 * T - 0.0000074 * T2;

    let sl = 0;
    sl += 6288774 * Math.sin(Mpr);
    sl += 1274027 * Math.sin(2 * Dr - Mpr);
    sl += 658314 * Math.sin(2 * Dr);
    sl += 213618 * Math.sin(2 * Mpr);
    sl += -185116 * Math.sin(Mmr) * E;
    sl += -114332 * Math.sin(2 * Fr);
    sl += 58793 * Math.sin(2 * Dr - 2 * Mpr);
    sl += 57066 * Math.sin(2 * Dr - Mmr - Mpr) * E;
    sl += 53322 * Math.sin(2 * Dr + Mpr);
    sl += 45758 * Math.sin(2 * Dr - Mmr) * E;
    sl += -40923 * Math.sin(Mmr - Mpr) * E;
    sl += -34720 * Math.sin(Dr);
    sl += -30383 * Math.sin(Mmr + Mpr) * E;
    sl += 15327 * Math.sin(2 * Dr - 2 * Fr);
    sl += -12528 * Math.sin(Mpr + 2 * Fr);
    sl += 10980 * Math.sin(Mpr - 2 * Fr);
    sl += 10675 * Math.sin(4 * Dr - Mpr);
    sl += 10034 * Math.sin(3 * Mpr);
    sl += 8548 * Math.sin(4 * Dr - 2 * Mpr);
    sl += -7888 * Math.sin(2 * Dr + Mmr - Mpr) * E;
    sl += -6766 * Math.sin(2 * Dr + Mmr) * E;
    sl += -5163 * Math.sin(Dr - Mpr);
    sl += 4987 * Math.sin(Dr + Mmr) * E;
    sl += 4036 * Math.sin(2 * Dr - Mmr + Mpr) * E;
    const moonLon = norm(Lp + sl / 1000000);

    // Phase from elongation
    const elongation = norm(moonLon - sunLon);
    const phase = elongation / 360;

    if (phase < 0.0625) return { phase: 'New Moon', emoji: '🌑', description: 'Time for new beginnings and setting intentions' };
    if (phase < 0.1875) return { phase: 'Waxing Crescent', emoji: '🌒', description: 'Take action on your intentions, build momentum' };
    if (phase < 0.3125) return { phase: 'First Quarter', emoji: '🌓', description: 'Overcome challenges, make decisions' };
    if (phase < 0.4375) return { phase: 'Waxing Gibbous', emoji: '🌔', description: 'Refine and adjust, almost there' };
    if (phase < 0.5625) return { phase: 'Full Moon', emoji: '🌕', description: 'Culmination, harvest results, heightened emotions' };
    if (phase < 0.6875) return { phase: 'Waning Gibbous', emoji: '🌖', description: 'Share wisdom, express gratitude' };
    if (phase < 0.8125) return { phase: 'Last Quarter', emoji: '🌗', description: 'Release what no longer serves, forgive' };
    if (phase < 0.9375) return { phase: 'Waning Crescent', emoji: '🌘', description: 'Rest, reflect, prepare for renewal' };
    return { phase: 'New Moon', emoji: '🌑', description: 'Time for new beginnings and setting intentions' };
}

/**
 * Get retrograde planets
 */
export function getRetrogradePlanets(date: Date = new Date()): PlanetaryPosition[] {
    const chart = calculateNatalChart(date, 51.4772, 0.0);
    return chart.planets.filter(p => p.retrograde);
}
