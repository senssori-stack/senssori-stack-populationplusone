/**
 * LOCAL HOROSCOPE ENGINE — No external API needed
 *
 * Generates daily horoscope readings based on REAL astronomical transits:
 * current planetary positions, aspects to natal chart, Moon phase & sign.
 *
 * This is what top-tier apps (Co-Star, The Pattern) do: compute real transits
 * and map them to interpretive text. We own the entire pipeline.
 */

import { calculateNatalChart } from './natal-chart-calculator';

// ─── Astronomical helpers (Meeus Ch. 25) ───

function toJDE(date: Date): number {
    return date.getTime() / 86400000 + 2440587.5;
}

function normDeg(d: number): number {
    return ((d % 360) + 360) % 360;
}

function degToRad(d: number): number {
    return (d * Math.PI) / 180;
}

/** Sun ecliptic longitude — Meeus Ch. 25, accurate ~0.01° */
function sunLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mr = degToRad(M);
    const C =
        (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
        0.000289 * Math.sin(3 * Mr);
    const sunLon = normDeg(L0 + C);
    const omega = degToRad(125.04 - 1934.136 * T);
    return normDeg(sunLon - 0.00569 - 0.00478 * Math.sin(omega));
}

/** Moon ecliptic longitude — Meeus Ch. 47, principal terms */
function moonLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const T2 = T * T;
    const T3 = T2 * T;
    const Lp = normDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841);
    const D = normDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868);
    const M = normDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
    const Mp = normDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699);
    const F = normDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000);
    const Dr = degToRad(D), Mr2 = degToRad(M), Mpr = degToRad(Mp), Fr = degToRad(F);
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    let sl = 0;
    sl += 6288774 * Math.sin(Mpr);
    sl += 1274027 * Math.sin(2 * Dr - Mpr);
    sl += 658314 * Math.sin(2 * Dr);
    sl += 213618 * Math.sin(2 * Mpr);
    sl -= 185116 * E * Math.sin(Mr2);
    sl -= 114332 * Math.sin(2 * Fr);
    sl += 58793 * Math.sin(2 * Dr - 2 * Mpr);
    sl += 57066 * E * Math.sin(2 * Dr - Mr2 - Mpr);
    sl += 53322 * Math.sin(2 * Dr + Mpr);
    sl += 45758 * E * Math.sin(2 * Dr - Mr2);
    sl -= 40923 * E * Math.sin(Mr2 - Mpr);
    sl -= 34720 * Math.sin(Dr);
    sl -= 30383 * E * Math.sin(Mr2 + Mpr);
    sl += 15327 * Math.sin(2 * Dr - 2 * Fr);
    sl -= 12528 * Math.sin(Mpr + 2 * Fr);
    sl += 10980 * Math.sin(Mpr - 2 * Fr);
    return normDeg(Lp + sl / 1000000);
}

/** Approximate planet mean longitudes — good to ~1° for transit themes */
function planetLongitude(planet: string, jde: number): number {
    const d = jde - 2451545.0;
    switch (planet) {
        case 'Mercury': return normDeg(252.251 + 4.09233445 * d);
        case 'Venus': return normDeg(181.980 + 1.60213034 * d);
        case 'Mars': return normDeg(355.433 + 0.52402068 * d);
        case 'Jupiter': return normDeg(34.351 + 0.08308529 * d);
        case 'Saturn': return normDeg(50.077 + 0.03344414 * d);
        case 'Uranus': return normDeg(314.055 + 0.01172834 * d);
        case 'Neptune': return normDeg(304.349 + 0.00598103 * d);
        case 'Pluto': return normDeg(238.929 + 0.00397000 * d);
        default: return 0;
    }
}

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function lonToSign(lon: number): string {
    return ZODIAC_SIGNS[Math.floor(normDeg(lon) / 30)];
}

// ─── Moon phase ───

function getMoonAge(date: Date): number {
    const jde = toJDE(date);
    const elongation = normDeg(moonLongitude(jde) - sunLongitude(jde));
    return (elongation / 360) * 29.530588853;
}

function getMoonPhaseName(age: number): string {
    const f = age / 29.530588853;
    if (f < 0.0625 || f >= 0.9375) return 'New Moon';
    if (f < 0.1875) return 'Waxing Crescent';
    if (f < 0.3125) return 'First Quarter';
    if (f < 0.4375) return 'Waxing Gibbous';
    if (f < 0.5625) return 'Full Moon';
    if (f < 0.6875) return 'Waning Gibbous';
    if (f < 0.8125) return 'Last Quarter';
    return 'Waning Crescent';
}

// ─── Deterministic seeded RNG (consistent per day) ───

function seedFromDate(date: Date): number {
    const d = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let h = d;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = (h >> 16) ^ h;
    return (h & 0x7fffffff) / 0x7fffffff;
}

function pickOne<T>(arr: T[], seed: number, offset: number = 0): T {
    const idx = Math.floor(((seed * 997 + offset * 131) % 1) * arr.length) % arr.length;
    return arr[Math.abs(idx)];
}

function seededPick<T>(arr: T[], seed: number): T {
    return arr[Math.floor(Math.abs(seed) * arr.length) % arr.length];
}

function hashPick<T>(arr: T[], ...seeds: number[]): T {
    let h = 0;
    for (const s of seeds) h = ((h * 31 + Math.floor(s * 1000)) & 0x7fffffff);
    return arr[h % arr.length];
}

// ─── Transit aspect interpretations ───

const ASPECT_THEMES: Record<string, Record<string, string[]>> = {
    conjunction: {
        Sun: ['A day of heightened self-awareness and vitality.', 'Your core identity is illuminated — own it.', 'The spotlight finds you today, whether you seek it or not.'],
        Moon: ['Emotions and instincts align powerfully today.', 'Trust your gut — your feelings are your compass.', 'A deeply intuitive day lies ahead.'],
        Mercury: ['Communication flows effortlessly.', 'Your mind is razor-sharp — put ideas into action.', 'Words carry extra weight today; choose them wisely.'],
        Venus: ['Love and beauty surround you.', 'Relationships deepen through genuine connection.', 'Creativity and charm are amplified.'],
        Mars: ['Energy surges — channel it constructively.', 'Boldness pays off today, but avoid reckless impulses.', 'Drive and determination reach a peak.'],
        Jupiter: ['Expansion and opportunity knock at your door.', 'Generosity attracts abundance.', 'A day for big-picture thinking and optimism.'],
        Saturn: ['Structure and discipline bring rewards.', 'A serious tone underlies the day — focus on responsibilities.', 'Patience and persistence are your greatest allies.'],
    },
    trine: {
        Sun: ['Everything flows naturally — trust the current.', 'Confidence radiates from within.', 'Talents shine without effort.'],
        Moon: ['Emotional harmony and inner peace prevail.', 'Nurturing connections bring joy.', 'Home and family fill the heart.'],
        Mercury: ['Ideas come together beautifully.', 'Conversations lead to breakthroughs.', 'Learning feels effortless.'],
        Venus: ['A harmonious day for love and aesthetics.', 'Beauty in small moments brings contentment.', 'Social graces are heightened.'],
        Mars: ['Physical energy flows smoothly.', 'Actions align with desires naturally.', 'Competitive spirits channel productively.'],
        Jupiter: ['Fortune favors the optimistic.', 'Wisdom comes through experience today.', 'Doors open with ease.'],
        Saturn: ['Long-term plans crystallize.', 'Hard work and structure bear fruit.', 'Mature decisions lead to stability.'],
    },
    square: {
        Sun: ['Inner tension creates motivation — use it.', 'Ego challenges push growth.', 'Friction leads to breakthroughs if you stay open.'],
        Moon: ['Emotions may feel turbulent — breathe through it.', 'Internal conflicts surface for resolution.', 'Sensitivity is heightened; set boundaries.'],
        Mercury: ['Miscommunication possible — seek clarity.', 'Mental restlessness drives problem-solving.', 'Think before speaking; precision matters.'],
        Venus: ['Relationship dynamics require attention.', 'Values may clash — find common ground.', 'Desire conflicts with reality; adapt.'],
        Mars: ['Frustrations may boil over — find a healthy outlet.', 'Impulsive energy needs direction.', 'Conflict can spark necessary change.'],
        Jupiter: ['Overconfidence is the risk — stay grounded.', 'Excess in any direction backfires.', 'Growth comes through moderation.'],
        Saturn: ['Obstacles test your resolve.', 'Limitations point to where growth is needed.', 'Perseverance transforms challenges into strengths.'],
    },
    opposition: {
        Sun: ['Awareness of others illuminates self-knowledge.', 'Balancing your needs with others\' is the lesson.', 'Opposites attract — integration is key.'],
        Moon: ['Pull between inner needs and outer demands.', 'Emotional awareness reaches a crescendo.', 'Relationships mirror your internal state.'],
        Mercury: ['Different perspectives challenge your thinking.', 'Debate sharpens your arguments.', 'Listen as much as you speak.'],
        Venus: ['Relationship tensions reveal deeper truths.', 'Love requires compromise today.', 'Your desires and another\'s may diverge — find balance.'],
        Mars: ['Others may push your buttons — respond, don\'t react.', 'Competitive energy is high — compete with yourself.', 'Assert boundaries without aggression.'],
        Jupiter: ['Promise and reality may feel disconnected.', 'Others\' optimism can inspire or overwhelm.', 'Find balance between expansion and conservation.'],
        Saturn: ['Authority figures or structures push back.', 'Responsibility and freedom pull in opposite directions.', 'Maturity means accepting limitations gracefully.'],
    },
    sextile: {
        Sun: ['Opportunities arise through self-expression.', 'A gentle push toward creative action.', 'Subtle confidence carries you far.'],
        Moon: ['Emotional openness invites connection.', 'Intuition subtly guides decisions.', 'Small gestures of care have big impact.'],
        Mercury: ['Pleasant conversations spark new ideas.', 'Networking feels natural and productive.', 'A good day for writing, planning, or learning.'],
        Venus: ['Social life brings easy pleasures.', 'Art, music, or nature refresh the soul.', 'Gentle affection strengthens bonds.'],
        Mars: ['Mild energy boost — great for exercise or projects.', 'Initiative comes naturally without aggression.', 'Small actions set the stage for larger accomplishments.'],
        Jupiter: ['Lucky breaks come through preparation.', 'Generosity circulates back to you.', 'A nudge toward growth — embrace it.'],
        Saturn: ['Practical steps build lasting foundations.', 'Quiet discipline yields subtle rewards.', 'Organization and routine feel satisfying.'],
    },
};

// ─── Sign-based daily themes ───

const SIGN_DAILY_THEMES: Record<string, string[]> = {
    Aries: [
        'Your pioneering energy is unstoppable today.',
        'Leadership opportunities emerge — step forward.',
        'Channel your fire into starting something new.',
        'Courage is your superpower; use it with intention.',
        'Independence calls — trust your own path.',
    ],
    Taurus: [
        'Stability anchors you while the world spins.',
        'Sensory pleasures bring deep satisfaction today.',
        'Patient effort is quietly building your empire.',
        'Trust in your own timing — you can\'t rush nature.',
        'Comfort and quality are not luxuries, they\'re necessities.',
    ],
    Gemini: [
        'Your mind is a lightning bolt today — capture every idea.',
        'Conversations lead somewhere unexpected and exciting.',
        'Curiosity opens doors that logic can\'t find.',
        'Multitasking is your art form; embrace it.',
        'Words have wings today — let yours take flight.',
    ],
    Cancer: [
        'Your intuition is a supercomputer — trust its output.',
        'Home and heart are your sanctuary today.',
        'Nurturing others fills your own cup.',
        'Emotional depth is your strength, not a vulnerability.',
        'Memories illuminate the path forward.',
    ],
    Leo: [
        'The universe arranged a spotlight just for you.',
        'Creative expression is your love language today.',
        'Generosity returns to you tenfold.',
        'Confidence is quiet today — let actions speak.',
        'Your warmth melts barriers others can\'t budge.',
    ],
    Virgo: [
        'Details others miss are your secret advantage.',
        'Organization creates space for inspiration.',
        'Service to others sharpens your own purpose.',
        'Perfectionism is a compass, not a destination.',
        'Practical magic: small acts, big transformations.',
    ],
    Libra: [
        'Harmony flows naturally in your interactions.',
        'Beauty in any form nourishes your soul today.',
        'Diplomacy turns potential conflict into collaboration.',
        'Balance isn\'t static — it\'s a graceful dance.',
        'Fairness is your compass; follow it fearlessly.',
    ],
    Scorpio: [
        'Depth is your domain — surface-level doesn\'t satisfy.',
        'Transformation is uncomfortable but essential today.',
        'Your intensity is magnetic — own it without apology.',
        'Secrets reveal themselves to those who look deeper.',
        'Emotional honesty is your most powerful tool.',
    ],
    Sagittarius: [
        'Adventure beckons — even a small one feeds the soul.',
        'Your optimism is the antidote others need today.',
        'Big-picture thinking reveals opportunities the cautious miss.',
        'Freedom and meaning walk hand in hand for you.',
        'Laughter is healing; share it generously.',
    ],
    Capricorn: [
        'Ambition and strategy align beautifully today.',
        'Every step, however small, builds the mountain.',
        'Respect is earned through consistent excellence.',
        'Structure liberates rather than confines you.',
        'Legacy thinking transforms ordinary decisions.',
    ],
    Aquarius: [
        'Your vision is ahead of its time — that\'s the point.',
        'Community and individuality aren\'t opposites for you.',
        'Innovation strikes when you question conventions.',
        'Humanitarian instincts guide brilliantly today.',
        'Being different is your greatest contribution.',
    ],
    Pisces: [
        'Creativity flows like water — don\'t dam it.',
        'Compassion is your superpower, not your weakness.',
        'Dreams contain messages worth decoding.',
        'Artistic expression heals what words cannot.',
        'Your sensitivity picks up frequencies others can\'t hear.',
    ],
};

// ─── Moon sign daily overlay ───

const MOON_SIGN_OVERLAY: Record<string, string[]> = {
    Aries: ['Act on impulse wisely.', 'Emotional courage surfaces.', 'Quick feelings demand quick processing.'],
    Taurus: ['Seek comfort and grounding.', 'Patience with feelings is rewarded.', 'Nourish your body to nourish your soul.'],
    Gemini: ['Talk through your feelings.', 'Mental agility merges with emotional intelligence.', 'Variety in connection satisfies.'],
    Cancer: ['Deep feelings rise to the surface.', 'Home is where the healing is.', 'Nurture yourself first.'],
    Leo: ['Express emotions boldly.', 'Creative emotional outlets shine.', 'Warmth radiates from your core.'],
    Virgo: ['Organize your emotional world.', 'Helpful actions ease inner turbulence.', 'Small acts of self-care have outsized impact.'],
    Libra: ['Seek emotional balance in relationships.', 'Fairness in feelings matters.', 'Beauty soothes emotional rough edges.'],
    Scorpio: ['Dive deep — the treasure is below the surface.', 'Emotional intensity transforms obstacles.', 'Trust the process of emotional alchemy.'],
    Sagittarius: ['Optimism lightens emotional burdens.', 'Adventure cures restlessness.', 'Philosophical perspective on feelings helps.'],
    Capricorn: ['Emotional discipline serves you well.', 'Structure your feelings; don\'t suppress them.', 'Maturity and vulnerability can coexist.'],
    Aquarius: ['Detached observation of feelings offers clarity.', 'Unconventional emotional expression is valid.', 'Community lifts emotional weight.'],
    Pisces: ['Intuition is your guiding star.', 'Artistic outlets channel emotional currents.', 'Compassion flows without effort.'],
};

// ─── Moon phase guidance ───

const MOON_PHASE_GUIDANCE: Record<string, string> = {
    'New Moon': 'Set intentions and plant seeds for what you wish to manifest. The cosmos supports new beginnings.',
    'Waxing Crescent': 'Nurture your intentions with small, consistent actions. Momentum is building invisibly.',
    'First Quarter': 'Challenges may arise — they\'re tests of your commitment. Push through resistance.',
    'Waxing Gibbous': 'Refine and adjust your approach. The details matter now more than ever.',
    'Full Moon': 'Heightened emotions illuminate truths. Celebrate progress and release what no longer serves you.',
    'Waning Gibbous': 'Share what you\'ve learned. Gratitude and generosity amplify the Full Moon\'s gifts.',
    'Last Quarter': 'Let go of what\'s complete. Make space for what\'s next by clearing the old.',
    'Waning Crescent': 'Rest, reflect, and surrender. The cycle completes — trust the pause before the next beginning.',
};

// ─── Main horoscope generation ───

export interface DailyHoroscope {
    mainReading: string;
    moonPhaseGuidance: string;
    transitHighlight: string;
    moonSignFeeling: string;
    luckyTheme: string;
    overallEnergy: 'high' | 'moderate' | 'reflective';
}

/**
 * Generate a complete daily horoscope using REAL astronomical data.
 * No external API needed — everything computed locally.
 */
export function generateDailyHoroscope(
    sunSign: string,
    birthDate: Date,
    latitude: number,
    longitude: number,
    targetDate: Date = new Date()
): DailyHoroscope {
    const jde = toJDE(targetDate);
    const seed = seedFromDate(targetDate);

    // Current astronomical positions
    const currentSunLon = sunLongitude(jde);
    const currentMoonLon = moonLongitude(jde);
    const currentMoonSign = lonToSign(currentMoonLon);
    const moonAge = getMoonAge(targetDate);
    const moonPhaseName = getMoonPhaseName(moonAge);

    // Get natal chart for transit comparison
    const natal = calculateNatalChart(birthDate, latitude, longitude);

    // Find strongest current transit aspect to natal planets
    const transitPlanets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    let strongestAspect: { planet: string; type: string; orb: number } | null = null;
    let smallestOrb = 999;

    for (const tp of transitPlanets) {
        const transitLon = planetLongitude(tp, jde);
        for (const np of natal.planets) {
            const diff = normDeg(transitLon - np.longitude);
            const aspects = [
                { type: 'conjunction', angle: 0, maxOrb: 8 },
                { type: 'sextile', angle: 60, maxOrb: 5 },
                { type: 'square', angle: 90, maxOrb: 7 },
                { type: 'trine', angle: 120, maxOrb: 7 },
                { type: 'opposition', angle: 180, maxOrb: 8 },
            ];
            for (const asp of aspects) {
                const orb = Math.abs(diff - asp.angle);
                const orbWrapped = Math.min(orb, 360 - orb);
                if (orbWrapped <= asp.maxOrb && orbWrapped < smallestOrb) {
                    smallestOrb = orbWrapped;
                    strongestAspect = { planet: tp, type: asp.type, orb: orbWrapped };
                }
            }
        }
    }

    // Build main reading from sign theme
    const signThemes = SIGN_DAILY_THEMES[sunSign] || SIGN_DAILY_THEMES['Aries'];
    const mainReading = hashPick(signThemes, seed, jde);

    // Transit highlight
    let transitHighlight: string;
    if (strongestAspect) {
        const aspectThemes = ASPECT_THEMES[strongestAspect.type]?.[strongestAspect.planet];
        if (aspectThemes) {
            transitHighlight = hashPick(aspectThemes, seed, jde + 1);
        } else {
            transitHighlight = `Transit ${strongestAspect.planet} forms a ${strongestAspect.type} — stay mindful of shifting energies.`;
        }
    } else {
        transitHighlight = 'The planets move quietly today — a good day for inner work and reflection.';
    }

    // Moon sign emotional overlay
    const moonOverlays = MOON_SIGN_OVERLAY[currentMoonSign] || MOON_SIGN_OVERLAY['Aries'];
    const moonSignFeeling = hashPick(moonOverlays, seed, jde + 2);

    // Moon phase guidance
    const moonPhaseGuidance = MOON_PHASE_GUIDANCE[moonPhaseName] || MOON_PHASE_GUIDANCE['New Moon'];

    // Lucky theme (seeded daily)
    const luckyThemes = [
        'Color: ' + hashPick(['Gold', 'Silver', 'Emerald', 'Sapphire', 'Ruby', 'Amethyst', 'Pearl', 'Coral', 'Jade', 'Amber', 'Onyx', 'Opal'], seed, jde + 3),
        'Number: ' + (Math.floor(seed * 30 + jde % 7) % 33 + 1),
        'Element: ' + hashPick(['Fire', 'Earth', 'Air', 'Water'], seed, jde + 4),
    ];

    // Overall energy based on Moon phase and aspects
    let overallEnergy: 'high' | 'moderate' | 'reflective';
    if (moonPhaseName === 'Full Moon' || moonPhaseName === 'New Moon') {
        overallEnergy = 'high';
    } else if (strongestAspect && (strongestAspect.type === 'square' || strongestAspect.type === 'opposition')) {
        overallEnergy = 'moderate';
    } else if (moonPhaseName.includes('Waning') || moonPhaseName === 'Last Quarter') {
        overallEnergy = 'reflective';
    } else {
        overallEnergy = 'moderate';
    }

    return {
        mainReading,
        moonPhaseGuidance,
        transitHighlight,
        moonSignFeeling,
        luckyTheme: luckyThemes.join(' • '),
        overallEnergy,
    };
}

/**
 * Generate a single-paragraph horoscope string (drop-in replacement for API getDailyHoroscope)
 */
export function getLocalDailyHoroscope(
    sunSign: string,
    birthDate: Date,
    latitude: number,
    longitude: number,
    targetDate: Date = new Date()
): string {
    const h = generateDailyHoroscope(sunSign, birthDate, latitude, longitude, targetDate);
    return `${h.mainReading} ${h.transitHighlight} ${h.moonSignFeeling} 🌙 ${h.moonPhaseGuidance}`;
}
