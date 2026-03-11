import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { PanResponder, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BirthSunPosition'>;

// ── Zodiac sign data ──
const ZODIAC_SIGNS = [
    {
        name: 'Aries', symbol: '♈', emoji: '🐏', element: 'Fire', quality: 'Cardinal', ruler: 'Mars', startDeg: 0, color: '#FF4444',
        personality: 'Bold, ambitious, and fiercely independent. Aries charges into life headfirst with unstoppable energy. Natural-born leaders who thrive on competition and new challenges.',
        strengths: ['Courageous', 'Determined', 'Confident', 'Enthusiastic'], shadow: 'Can be impatient and impulsive',
        decan1: { ruler: 'Mars', traits: 'Pure Aries fire — bold, direct, competitive' },
        decan2: { ruler: 'Sun', traits: 'Creative showmanship with Leo flair — warm, generous, dramatic' },
        decan3: { ruler: 'Jupiter', traits: 'Philosophical adventurer with Sagittarius wisdom — restless, optimistic' },
    },
    {
        name: 'Taurus', symbol: '♉', emoji: '🐂', element: 'Earth', quality: 'Fixed', ruler: 'Venus', startDeg: 30, color: '#66BB6A',
        personality: 'Grounded, sensual, and deeply loyal. Taurus values comfort, beauty, and stability above all. Patient and persistent, they build lasting foundations in everything they do.',
        strengths: ['Reliable', 'Patient', 'Devoted', 'Sensual'], shadow: 'Can be stubborn and materialistic',
        decan1: { ruler: 'Venus', traits: 'Pure Taurus sensuality — luxurious, artistic, pleasure-seeking' },
        decan2: { ruler: 'Mercury', traits: 'Practical mind with Virgo precision — detail-oriented, analytical' },
        decan3: { ruler: 'Saturn', traits: 'Disciplined builder with Capricorn ambition — hardworking, traditional' },
    },
    {
        name: 'Gemini', symbol: '♊', emoji: '👯', element: 'Air', quality: 'Mutable', ruler: 'Mercury', startDeg: 60, color: '#FFD54F',
        personality: 'Witty, curious, and endlessly adaptable. Gemini\'s dual nature gives them the ability to see all sides of every story. Communication is their superpower — they connect people and ideas effortlessly.',
        strengths: ['Versatile', 'Curious', 'Expressive', 'Quick-witted'], shadow: 'Can be inconsistent and superficial',
        decan1: { ruler: 'Mercury', traits: 'Pure Gemini wit — talkative, clever, mentally agile' },
        decan2: { ruler: 'Venus', traits: 'Charming socialite with Libra grace — diplomatic, artistic' },
        decan3: { ruler: 'Uranus', traits: 'Eccentric visionary with Aquarius innovation — unconventional, brilliant' },
    },
    {
        name: 'Cancer', symbol: '♋', emoji: '🦀', element: 'Water', quality: 'Cardinal', ruler: 'Moon', startDeg: 90, color: '#90CAF9',
        personality: 'Nurturing, intuitive, and deeply emotional. Cancer feels everything with extraordinary depth. Home and family are sacred — they create emotional sanctuaries wherever they go.',
        strengths: ['Nurturing', 'Intuitive', 'Protective', 'Loyal'], shadow: 'Can be moody and clingy',
        decan1: { ruler: 'Moon', traits: 'Pure Cancer sensitivity — deeply emotional, maternal, psychic' },
        decan2: { ruler: 'Pluto', traits: 'Intense depth with Scorpio power — transformative, magnetic' },
        decan3: { ruler: 'Neptune', traits: 'Dreamy mystic with Pisces imagination — compassionate, spiritual' },
    },
    {
        name: 'Leo', symbol: '♌', emoji: '🦁', element: 'Fire', quality: 'Fixed', ruler: 'Sun', startDeg: 120, color: '#FF9800',
        personality: 'Magnetic, creative, and gloriously confident. Leo lights up every room with their warmth and generosity. Born performers with hearts of gold — they inspire others just by being themselves.',
        strengths: ['Creative', 'Generous', 'Warm-hearted', 'Charismatic'], shadow: 'Can be arrogant and attention-seeking',
        decan1: { ruler: 'Sun', traits: 'Pure Leo radiance — theatrical, proud, commanding' },
        decan2: { ruler: 'Jupiter', traits: 'Adventurous optimist with Sagittarius fire — philosophical, bold' },
        decan3: { ruler: 'Mars', traits: 'Fierce warrior with Aries courage — competitive, pioneering' },
    },
    {
        name: 'Virgo', symbol: '♍', emoji: '👩‍🔬', element: 'Earth', quality: 'Mutable', ruler: 'Mercury', startDeg: 150, color: '#A5D6A7',
        personality: 'Analytical, meticulous, and deeply service-oriented. Virgo sees the details everyone else misses. Their drive to improve and perfect makes them invaluable — they genuinely want to help make the world work better.',
        strengths: ['Analytical', 'Practical', 'Diligent', 'Helpful'], shadow: 'Can be overcritical and perfectionist',
        decan1: { ruler: 'Mercury', traits: 'Pure Virgo precision — methodical, health-conscious, efficient' },
        decan2: { ruler: 'Saturn', traits: 'Disciplined planner with Capricorn structure — ambitious, responsible' },
        decan3: { ruler: 'Venus', traits: 'Refined aesthete with Taurus appreciation — sensual, grounded' },
    },
    {
        name: 'Libra', symbol: '♎', emoji: '⚖️', element: 'Air', quality: 'Cardinal', ruler: 'Venus', startDeg: 180, color: '#CE93D8',
        personality: 'Harmonious, diplomatic, and deeply fair-minded. Libra seeks balance and beauty in everything. Masters of relationship and compromise — they bring people together with grace and charm.',
        strengths: ['Diplomatic', 'Fair-minded', 'Social', 'Graceful'], shadow: 'Can be indecisive and people-pleasing',
        decan1: { ruler: 'Venus', traits: 'Pure Libra charm — romantic, aesthetic, peace-loving' },
        decan2: { ruler: 'Uranus', traits: 'Intellectual rebel with Aquarius edge — innovative, humanitarian' },
        decan3: { ruler: 'Mercury', traits: 'Quick-minded communicator with Gemini curiosity — versatile, social' },
    },
    {
        name: 'Scorpio', symbol: '♏', emoji: '🦂', element: 'Water', quality: 'Fixed', ruler: 'Pluto', startDeg: 210, color: '#B71C1C',
        personality: 'Intense, magnetic, and profoundly transformative. Scorpio dives deeper than any other sign — they demand truth and authenticity. Their emotional power is unmatched, and their loyalty is fierce.',
        strengths: ['Passionate', 'Resourceful', 'Brave', 'Perceptive'], shadow: 'Can be jealous and secretive',
        decan1: { ruler: 'Pluto', traits: 'Pure Scorpio intensity — powerful, mysterious, regenerative' },
        decan2: { ruler: 'Neptune', traits: 'Visionary mystic with Pisces depth — empathic, creative, spiritual' },
        decan3: { ruler: 'Moon', traits: 'Emotional nurturer with Cancer sensitivity — protective, intuitive' },
    },
    {
        name: 'Sagittarius', symbol: '♐', emoji: '🏹', element: 'Fire', quality: 'Mutable', ruler: 'Jupiter', startDeg: 240, color: '#7E57C2',
        personality: 'Adventurous, philosophical, and wildly optimistic. Sagittarius lives for the grand quest — whether that\'s traveling the world, pursuing knowledge, or chasing the meaning of life. Freedom is non-negotiable.',
        strengths: ['Adventurous', 'Optimistic', 'Philosophical', 'Honest'], shadow: 'Can be tactless and restless',
        decan1: { ruler: 'Jupiter', traits: 'Pure Sagittarius wanderlust — expansive, jovial, freedom-loving' },
        decan2: { ruler: 'Mars', traits: 'Passionate crusader with Aries fire — bold, direct, energetic' },
        decan3: { ruler: 'Sun', traits: 'Radiant performer with Leo flair — creative, confident, warm' },
    },
    {
        name: 'Capricorn', symbol: '♑', emoji: '🐐', element: 'Earth', quality: 'Cardinal', ruler: 'Saturn', startDeg: 270, color: '#78909C',
        personality: 'Ambitious, disciplined, and masterfully strategic. Capricorn plays the long game — climbing steadily to the top through sheer determination. They build empires with patience, responsibility, and quiet confidence.',
        strengths: ['Ambitious', 'Disciplined', 'Responsible', 'Strategic'], shadow: 'Can be rigid and workaholic',
        decan1: { ruler: 'Saturn', traits: 'Pure Capricorn ambition — structured, authoritative, persistent' },
        decan2: { ruler: 'Venus', traits: 'Refined builder with Taurus sensibility — practical yet elegant' },
        decan3: { ruler: 'Mercury', traits: 'Detail-oriented planner with Virgo precision — analytical, service-minded' },
    },
    {
        name: 'Aquarius', symbol: '♒', emoji: '🏺', element: 'Air', quality: 'Fixed', ruler: 'Uranus', startDeg: 300, color: '#4FC3F7',
        personality: 'Visionary, humanitarian, and brilliantly unconventional. Aquarius thinks decades ahead of everyone else. They champion individuality, progress, and the collective good — often all at once.',
        strengths: ['Innovative', 'Humanitarian', 'Independent', 'Original'], shadow: 'Can be detached and contrarian',
        decan1: { ruler: 'Uranus', traits: 'Pure Aquarius genius — revolutionary, eccentric, future-oriented' },
        decan2: { ruler: 'Mercury', traits: 'Intellectual communicator with Gemini wit — curious, articulate' },
        decan3: { ruler: 'Venus', traits: 'Harmonious visionary with Libra grace — diplomatic, aesthetic' },
    },
    {
        name: 'Pisces', symbol: '♓', emoji: '🐠', element: 'Water', quality: 'Mutable', ruler: 'Neptune', startDeg: 330, color: '#80CBC4',
        personality: 'Deeply empathic, creative, and spiritually attuned. Pisces absorbs the emotions of everyone around them like a psychic sponge. Their imagination knows no bounds — they dream worlds into existence.',
        strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Wise'], shadow: 'Can be escapist and overly sensitive',
        decan1: { ruler: 'Neptune', traits: 'Pure Pisces mysticism — dreamy, empathic, otherworldly' },
        decan2: { ruler: 'Moon', traits: 'Emotional depth with Cancer nurture — caring, protective, psychic' },
        decan3: { ruler: 'Pluto', traits: 'Transformative healer with Scorpio power — intense, regenerative' },
    },
];

// ── Compatibility quick-reference ──
const COMPATIBILITY: Record<string, { best: string[]; good: string[]; challenge: string[] }> = {
    Aries: { best: ['Leo', 'Sagittarius'], good: ['Gemini', 'Aquarius'], challenge: ['Cancer', 'Capricorn'] },
    Taurus: { best: ['Virgo', 'Capricorn'], good: ['Cancer', 'Pisces'], challenge: ['Leo', 'Aquarius'] },
    Gemini: { best: ['Libra', 'Aquarius'], good: ['Aries', 'Leo'], challenge: ['Virgo', 'Pisces'] },
    Cancer: { best: ['Scorpio', 'Pisces'], good: ['Taurus', 'Virgo'], challenge: ['Aries', 'Libra'] },
    Leo: { best: ['Aries', 'Sagittarius'], good: ['Gemini', 'Libra'], challenge: ['Taurus', 'Scorpio'] },
    Virgo: { best: ['Taurus', 'Capricorn'], good: ['Cancer', 'Scorpio'], challenge: ['Gemini', 'Sagittarius'] },
    Libra: { best: ['Gemini', 'Aquarius'], good: ['Leo', 'Sagittarius'], challenge: ['Cancer', 'Capricorn'] },
    Scorpio: { best: ['Cancer', 'Pisces'], good: ['Virgo', 'Capricorn'], challenge: ['Leo', 'Aquarius'] },
    Sagittarius: { best: ['Aries', 'Leo'], good: ['Libra', 'Aquarius'], challenge: ['Virgo', 'Pisces'] },
    Capricorn: { best: ['Taurus', 'Virgo'], good: ['Scorpio', 'Pisces'], challenge: ['Aries', 'Libra'] },
    Aquarius: { best: ['Gemini', 'Libra'], good: ['Aries', 'Sagittarius'], challenge: ['Taurus', 'Scorpio'] },
    Pisces: { best: ['Cancer', 'Scorpio'], good: ['Taurus', 'Capricorn'], challenge: ['Gemini', 'Sagittarius'] },
};

// ── Season data ──
const SEASONS = [
    { name: 'Spring Equinox', deg: 0, emoji: '🌸', desc: 'Day and night equal — rebirth and new beginnings' },
    { name: 'Summer Solstice', deg: 90, emoji: '☀️', desc: 'Longest day — peak energy, growth, and abundance' },
    { name: 'Autumn Equinox', deg: 180, emoji: '🍂', desc: 'Day and night equal — harvest, gratitude, and balance' },
    { name: 'Winter Solstice', deg: 270, emoji: '❄️', desc: 'Longest night — introspection, rest, and renewal' },
];

// ── Jean Meeus astronomical algorithms (Astronomical Algorithms, 2nd Ed) ──

function toJDE(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + date.getUTCHours() / 24 +
        date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
    let Y = y, M = m;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5;
}

function degToRad(d: number) { return d * Math.PI / 180; }
function normDeg(d: number) { return ((d % 360) + 360) % 360; }

function sunLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mr = degToRad(M);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
        + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
        + 0.000289 * Math.sin(3 * Mr);
    const sunLon = normDeg(L0 + C);
    const omega = degToRad(125.04 - 1934.136 * T);
    return normDeg(sunLon - 0.00569 - 0.00478 * Math.sin(omega));
}

/** Get Sun's zodiac sign and degree within that sign */
function getSunPosition(date: Date) {
    const jde = toJDE(date);
    const lon = sunLongitude(jde);
    const signIndex = Math.floor(lon / 30) % 12;
    const degreeInSign = lon % 30;
    const decanNum = Math.floor(degreeInSign / 10) + 1;
    return { longitude: lon, signIndex, degreeInSign, decanNum };
}

/** Get nearest season marker */
function getNearestSeason(longitude: number) {
    let closest = SEASONS[0];
    let minDist = 360;
    for (const s of SEASONS) {
        let dist = Math.abs(normDeg(longitude - s.deg));
        if (dist > 180) dist = 360 - dist;
        if (dist < minDist) { minDist = dist; closest = s; }
    }
    return { season: closest, distance: minDist };
}

export default function BirthSunPositionScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const sunPos = getSunPosition(birthDate);
    const sign = ZODIAC_SIGNS[sunPos.signIndex];
    const decanData = sunPos.decanNum === 1 ? sign.decan1 : sunPos.decanNum === 2 ? sign.decan2 : sign.decan3;
    const compat = COMPATIBILITY[sign.name];
    const { season, distance: seasonDist } = getNearestSeason(sunPos.longitude);

    const [selectedSignIdx, setSelectedSignIdx] = useState<number | null>(null);

    // ── Interactive Zodiac Wheel ──
    const [angleOffset, setAngleOffset] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const lastAngleRef = useRef<number | null>(null);
    const spinAccumRef = useRef(0);

    const WHEEL_CX = 160;
    const WHEEL_CY = 160;
    const WHEEL_R = 110;

    const wheelPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) =>
                Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
            onPanResponderGrant: () => {
                lastAngleRef.current = null;
                spinAccumRef.current = angleOffset;
                setIsSpinning(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const a = Math.atan2(locationY - WHEEL_CY, locationX - WHEEL_CX) * (180 / Math.PI);
                if (lastAngleRef.current !== null) {
                    let delta = a - lastAngleRef.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    spinAccumRef.current += delta;
                    setAngleOffset(spinAccumRef.current);
                }
                lastAngleRef.current = a;
            },
            onPanResponderRelease: () => {
                lastAngleRef.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
            onPanResponderTerminate: () => {
                lastAngleRef.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
        })
    ).current;

    // Sun position on the wheel
    const sunAngleDeg = -90 + sunPos.longitude + angleOffset; // -90 so 0° Aries is at top
    const sunAngleRad = degToRad(sunAngleDeg);
    const sunX = WHEEL_CX + (WHEEL_R - 25) * Math.cos(sunAngleRad);
    const sunY = WHEEL_CY + (WHEEL_R - 25) * Math.sin(sunAngleRad);

    // Hovered sign from spinning
    const hoveredIdx = isSpinning
        ? Math.floor(normDeg(-angleOffset) / 30) % 12
        : null;
    const displaySign = hoveredIdx !== null ? ZODIAC_SIGNS[hoveredIdx] : sign;

    return (
        <LinearGradient colors={['#1a0a00', '#2d1500', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0a00" />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>☀️ Your Birth Sun</Text>
                <Text style={styles.birthDate}>
                    {birthDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>

                {/* Sun Sign Hero */}
                <View style={styles.heroContainer}>
                    <Text style={styles.heroEmoji}>{sign.emoji}</Text>
                    <Text style={styles.heroSymbol}>{sign.symbol}</Text>
                    <Text style={styles.heroName}>{sign.name}</Text>
                    <Text style={styles.heroDetail}>
                        {Math.round(sunPos.degreeInSign)}° {sign.name} • {sign.element} • {sign.quality}
                    </Text>
                    <Text style={styles.heroDetail}>Ruled by {sign.ruler}</Text>
                </View>

                {/* Educational Intro */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌞 What Is Your Sun Sign?</Text>
                    <Text style={styles.cardBody}>
                        Your Sun sign is determined by where the Sun was positioned along the ecliptic — the apparent path it traces through the sky — at the exact moment of your birth. The ecliptic passes through 12 constellations (the zodiac), and whichever constellation the Sun was "in" becomes your sign.{'\n\n'}In astrology, the Sun represents your core identity, ego, and life purpose. It's the most fundamental piece of your birth chart — your essential self that shines through everything you do.
                    </Text>
                </View>

                {/* Ecliptic Position */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📍 Ecliptic Position</Text>
                    <Svg width="100%" height={70} viewBox="0 0 320 70">
                        {/* Track */}
                        <Line x1={10} y1={35} x2={310} y2={35} stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
                        {/* Sign markers */}
                        {ZODIAC_SIGNS.map((z, i) => {
                            const x = 10 + (z.startDeg / 360) * 300;
                            return (
                                <G key={z.name}>
                                    <Circle cx={x} cy={35} r={2.5} fill="rgba(255,255,255,0.25)" />
                                    <SvgText x={x} y={55} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">{z.symbol}</SvgText>
                                </G>
                            );
                        })}
                        {/* Sun position */}
                        <Circle cx={10 + (sunPos.longitude / 360) * 300} cy={35} r={8} fill="#FFD700" />
                        <SvgText x={10 + (sunPos.longitude / 360) * 300} y={18} fill="#FFD700" fontSize={10} fontWeight="bold" textAnchor="middle">☀️</SvgText>
                    </Svg>
                    <Text style={styles.cycleText}>
                        {Math.round(sunPos.longitude * 10) / 10}° ecliptic longitude — {Math.round(sunPos.degreeInSign)}° into {sign.name}
                    </Text>
                </View>

                {/* Personality Deep-Dive */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{sign.symbol} {sign.name} Personality</Text>
                    <Text style={styles.cardBody}>{sign.personality}</Text>
                    <View style={styles.tagRow}>
                        {sign.strengths.map(s => (
                            <View key={s} style={[styles.tag, { backgroundColor: `${sign.color}22` }]}>
                                <Text style={[styles.tagText, { color: sign.color }]}>{s}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.shadowText}>⚠️ Shadow side: {sign.shadow}</Text>
                </View>

                {/* Decan */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔱 Your Decan: {sign.name} {toRoman(sunPos.decanNum)}</Text>
                    <Text style={styles.cardBody}>
                        Each zodiac sign is divided into three 10-degree sections called "decans" — each with its own sub-ruler that adds a unique flavor to your Sun sign. You were born in the {ordinal(sunPos.decanNum)} decan of {sign.name}.
                    </Text>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>Sub-ruler</Text>
                        <Text style={styles.detailText}>{decanData.ruler}</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>Decan Expression</Text>
                        <Text style={styles.detailText}>{decanData.traits}</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>Degrees</Text>
                        <Text style={styles.detailText}>{(sunPos.decanNum - 1) * 10}°–{sunPos.decanNum * 10}° of {sign.name} (you: {Math.round(sunPos.degreeInSign)}°)</Text>
                    </View>
                </View>

                {/* Season & Solstice Context */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 Seasonal Context</Text>
                    <Text style={styles.cardBody}>
                        The zodiac is linked to Earth's seasons. The four cardinal points — the two equinoxes and two solstices — mark the start of Aries, Cancer, Libra, and Capricorn respectively.
                    </Text>
                    <View style={styles.seasonRow}>
                        {SEASONS.map(s => (
                            <View key={s.name} style={[styles.seasonItem, s.name === season.name && { backgroundColor: 'rgba(255,213,79,0.12)', borderColor: '#FFD54F' }]}>
                                <Text style={styles.seasonEmoji}>{s.emoji}</Text>
                                <Text style={[styles.seasonName, s.name === season.name && { color: '#FFD54F' }]}>{s.name}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.seasonDetail}>
                        {seasonDist < 15
                            ? `Born just ${Math.round(seasonDist)}° from the ${season.name}! You carry the powerful transitional energy of a seasonal turning point.`
                            : `Nearest marker: ${season.emoji} ${season.name} (${Math.round(seasonDist)}° away). Your birth Sun sits in the ${getSolarSeason(sunPos.longitude)} portion of the zodiac year.`}
                    </Text>
                </View>

                {/* Compatibility */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💕 Sun Sign Compatibility</Text>
                    <Text style={styles.cardBody}>
                        Sun sign compatibility is the most popular layer of astrological matchmaking — which signs naturally harmonize with yours?
                    </Text>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>🔥 Best Matches</Text>
                        <View style={styles.compatRow}>
                            {compat.best.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>✨ Good Chemistry</Text>
                        <View style={styles.compatRow}>
                            {compat.good.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>⚡ Growth Edges</Text>
                        <View style={styles.compatRow}>
                            {compat.challenge.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                </View>

                {/* ═══ Interactive Zodiac Wheel ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔮 Interactive Zodiac Wheel</Text>
                    <Text style={styles.cardBody}>
                        Spin the wheel to explore all 12 signs. The ☀️ marks where the Sun was at your birth.
                    </Text>
                    <View style={styles.wheelWrap} {...wheelPanResponder.panHandlers}>
                        <Svg width={320} height={320} viewBox="0 0 320 320">
                            {/* Outer ring glow */}
                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={WHEEL_R + 8} fill="none" stroke="rgba(255,215,0,0.06)" strokeWidth={8} />

                            {/* Sign segments */}
                            {ZODIAC_SIGNS.map((z, i) => {
                                const startAngle = degToRad(-90 + z.startDeg + angleOffset);
                                const endAngle = degToRad(-90 + z.startDeg + 30 + angleOffset);
                                const isCurrent = i === sunPos.signIndex;

                                // Segment arc
                                const x1 = WHEEL_CX + WHEEL_R * Math.cos(startAngle);
                                const y1 = WHEEL_CY + WHEEL_R * Math.sin(startAngle);
                                const x2 = WHEEL_CX + WHEEL_R * Math.cos(endAngle);
                                const y2 = WHEEL_CY + WHEEL_R * Math.sin(endAngle);

                                // Inner radius for filled segment
                                const innerR = 50;
                                const ix1 = WHEEL_CX + innerR * Math.cos(startAngle);
                                const iy1 = WHEEL_CY + innerR * Math.sin(startAngle);
                                const ix2 = WHEEL_CX + innerR * Math.cos(endAngle);
                                const iy2 = WHEEL_CY + innerR * Math.sin(endAngle);

                                // Label position (middle of segment)
                                const midAngle = degToRad(-90 + z.startDeg + 15 + angleOffset);
                                const labelR = WHEEL_R - 30;
                                const lx = WHEEL_CX + labelR * Math.cos(midAngle);
                                const ly = WHEEL_CY + labelR * Math.sin(midAngle);

                                // Outer symbol position
                                const outerR = WHEEL_R + 18;
                                const sx = WHEEL_CX + outerR * Math.cos(midAngle);
                                const sy = WHEEL_CY + outerR * Math.sin(midAngle);

                                return (
                                    <G key={z.name}>
                                        {/* Segment fill */}
                                        <Path
                                            d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${WHEEL_R} ${WHEEL_R} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1}`}
                                            fill={isCurrent ? `${z.color}33` : 'rgba(255,255,255,0.03)'}
                                            stroke={isCurrent ? z.color : 'rgba(255,255,255,0.12)'}
                                            strokeWidth={isCurrent ? 1.5 : 0.5}
                                        />
                                        {/* Sign symbol */}
                                        <SvgText x={lx} y={ly + 5} fontSize={14} textAnchor="middle"
                                            fill={isCurrent ? z.color : 'rgba(255,255,255,0.5)'} fontWeight={isCurrent ? 'bold' : 'normal'}>
                                            {z.symbol}
                                        </SvgText>
                                        {/* Outer label */}
                                        <SvgText x={sx} y={sy + 4} fontSize={9} textAnchor="middle"
                                            fill={isCurrent ? z.color : 'rgba(255,255,255,0.35)'}>
                                            {z.name.substring(0, 3)}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Center circle */}
                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={46} fill="rgba(0,0,0,0.6)" />
                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={46} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

                            {/* Sun marker */}
                            <Circle cx={sunX} cy={sunY} r={12} fill="#FFD700" opacity={0.9} />
                            <SvgText x={sunX} y={sunY + 5} fontSize={14} textAnchor="middle">☀️</SvgText>

                            {/* Center info */}
                            <SvgText x={WHEEL_CX} y={WHEEL_CY - 8} fontSize={18} textAnchor="middle" fill="#FFD700">
                                {displaySign.symbol}
                            </SvgText>
                            <SvgText x={WHEEL_CX} y={WHEEL_CY + 10} fontSize={11} fontWeight="bold"
                                textAnchor="middle" fill="rgba(255,255,255,0.8)">
                                {displaySign.name}
                            </SvgText>
                            <SvgText x={WHEEL_CX} y={WHEEL_CY + 24} fontSize={9}
                                textAnchor="middle" fill="rgba(255,255,255,0.4)">
                                {displaySign.element} • {displaySign.quality}
                            </SvgText>
                        </Svg>
                    </View>
                    <Text style={styles.spinHint}>
                        {isSpinning
                            ? `${displaySign.symbol} ${displaySign.name} — ${displaySign.element}`
                            : '☝️ Spin the wheel to explore all 12 signs'}
                    </Text>
                </View>

                {/* What the Sun Represents */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 What the Sun Represents</Text>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>🪞 Identity & Ego</Text>
                        <Text style={styles.detailText}>Your Sun sign is your core self — the "you" that comes through most clearly as you mature. It shapes your fundamental motivations, values, and sense of purpose.</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>🔥 Vitality & Energy</Text>
                        <Text style={styles.detailText}>The Sun rules your physical vitality and life force. Where the Moon governs emotions and instinct, the Sun powers your conscious will, creativity, and drive to express yourself.</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>👑 Life Purpose</Text>
                        <Text style={styles.detailText}>In traditional astrology, the Sun sign reveals the themes you're meant to master in this lifetime. It's the hero's journey you're on — shaped by your sign's element, quality, and ruling planet.</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>☀️ vs 🌙 Sun vs Moon</Text>
                        <Text style={styles.detailText}>Your Sun sign is who you ARE. Your Moon sign is how you FEEL. Together they form the two most important pillars of your birth chart — the conscious self and the emotional self.</Text>
                    </View>
                </View>

                {/* Element Deep-Dive */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{getElementEmoji(sign.element)} {sign.element} Sign</Text>
                    <Text style={styles.cardBody}>{getElementDescription(sign.element)}</Text>
                    <View style={styles.elementGroup}>
                        <Text style={styles.detailLabel}>{sign.element} Signs</Text>
                        <Text style={styles.detailText}>
                            {ZODIAC_SIGNS.filter(z => z.element === sign.element).map(z => `${z.symbol} ${z.name}`).join('  •  ')}
                        </Text>
                    </View>
                </View>

                {/* All 12 Signs Reference */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 The 12 Sun Signs</Text>
                    {ZODIAC_SIGNS.map(z => (
                        <View key={z.name} style={[styles.signRow, z.name === sign.name && { backgroundColor: `${z.color}15`, borderRadius: 8 }]}>
                            <Text style={styles.signRowSymbol}>{z.symbol}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.signRowName, z.name === sign.name && { color: z.color }]}>{z.name}</Text>
                                <Text style={styles.signRowDesc}>{z.element} • {z.quality} • {z.ruler}</Text>
                            </View>
                            {z.name === sign.name && <Text style={{ color: z.color, fontWeight: '900', fontSize: 12 }}>← YOU</Text>}
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

// ── Helper functions ──

function toRoman(n: number): string {
    return n === 1 ? 'I' : n === 2 ? 'II' : 'III';
}

function ordinal(n: number): string {
    return n === 1 ? '1st' : n === 2 ? '2nd' : '3rd';
}

function getSolarSeason(longitude: number): string {
    if (longitude < 90) return 'spring';
    if (longitude < 180) return 'summer';
    if (longitude < 270) return 'autumn';
    return 'winter';
}

function getElementEmoji(element: string): string {
    return element === 'Fire' ? '🔥' : element === 'Earth' ? '🌍' : element === 'Air' ? '💨' : '🌊';
}

function getElementDescription(element: string): string {
    switch (element) {
        case 'Fire': return 'Fire signs are passionate, dynamic, and temperamental. They get angry quickly, but they also forgive easily. They are adventurers with immense energy — physically strong and a source of inspiration for others. Fire signs are intelligent, self-aware, creative, and idealistic.';
        case 'Earth': return 'Earth signs are grounded, practical, and stable. They are the builders of the zodiac — patient, reliable, and deeply connected to the physical world. They value security and material comfort, but also possess a deep appreciation for nature and beauty.';
        case 'Air': return 'Air signs are intellectual, communicative, and social. They are the thinkers and connectors of the zodiac — analytical, curious, and always seeking new ideas and perspectives. They thrive on mental stimulation and meaningful conversation.';
        case 'Water': return 'Water signs are emotional, intuitive, and deeply sensitive. They are the feelers of the zodiac — empathic, nurturing, and profoundly connected to the unseen currents of life. They experience the world through emotion and intuition first.';
        default: return '';
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10 },
    birthDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 },
    heroContainer: { alignItems: 'center', marginBottom: 20 },
    heroEmoji: { fontSize: 48 },
    heroSymbol: { fontSize: 36, color: '#FFD700', marginTop: 4 },
    heroName: { fontSize: 28, fontWeight: '900', color: '#FFE082', marginTop: 4 },
    heroDetail: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginBottom: 8 },
    cycleText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 4 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    tag: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
    tagText: { fontSize: 12, fontWeight: '700' },
    shadowText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 4 },
    decanDetail: { marginBottom: 10 },
    detailLabel: { fontSize: 12, color: '#FFE082', fontWeight: '700', marginBottom: 2 },
    detailText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
    seasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    seasonItem: { alignItems: 'center', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minWidth: 70 },
    seasonEmoji: { fontSize: 20 },
    seasonName: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },
    seasonDetail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, lineHeight: 20 },
    compatSection: { marginBottom: 10 },
    compatLabel: { fontSize: 13, color: '#FFE082', fontWeight: '700', marginBottom: 4 },
    compatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    compatSign: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    wheelWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
    spinHint: { fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 2 },
    elementGroup: { marginTop: 6 },
    signRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 6, gap: 10 },
    signRowSymbol: { fontSize: 22 },
    signRowName: { fontSize: 14, fontWeight: '700', color: '#fff' },
    signRowDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});
