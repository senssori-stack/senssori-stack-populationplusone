import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, G, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
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
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate + 'T00:00:00'), [route.params.birthDate]);
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate + 'T00:00:00'));

    // ── Sign detail modal ──
    const [selectedSign, setSelectedSign] = useState<typeof ZODIAC_SIGNS[number] | null>(null);

    // ── Time Travel State ──
    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const SLIDER_RANGE = 1826; // ±5 years
    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);

    const changeDate = useCallback((newOffset: number) => {
        const clamped = Math.max(-SLIDER_RANGE, Math.min(SLIDER_RANGE, newOffset));
        setDayOffset(clamped);
        dayOffsetRef.current = clamped;
        setBirthDate(new Date(originalBirthDate.getTime() + clamped * 86400000));
        setAngleOffset(0);
        spinAccumRef.current = 0;
    }, [originalBirthDate, SLIDER_RANGE]);

    const sliderStartOffsetRef = useRef(0);
    const sliderPan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                sliderStartOffsetRef.current = dayOffsetRef.current;
            },
            onPanResponderMove: (_, gesture) => {
                const daysPerPixel = (2 * SLIDER_RANGE) / sliderWRef.current;
                changeDate(sliderStartOffsetRef.current + gesture.dx * daysPerPixel);
            },
            onPanResponderRelease: () => { },
        })
    ).current;

    const jumpToToday = useCallback(() => {
        const today = new Date();
        const offsetDays = (today.getTime() - originalBirthDate.getTime()) / 86400000;
        setDayOffset(offsetDays);
        dayOffsetRef.current = offsetDays;
        setBirthDate(today);
        setAngleOffset(0);
        spinAccumRef.current = 0;
    }, [originalBirthDate]);

    const formatOffset = (offset: number) => {
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? '+' : '−';
        if (absOffset < 1) {
            const hrs = Math.round(absOffset * 24);
            return `${sign}${hrs} hr${hrs !== 1 ? 's' : ''} from birth`;
        }
        const totalDays = Math.round(absOffset);
        if (totalDays < 365) return `${sign}${totalDays} day${totalDays !== 1 ? 's' : ''} from birth`;
        const years = Math.floor(totalDays / 365.25);
        const remDays = Math.round(totalDays - years * 365.25);
        if (remDays === 0) return `${sign}${years} yr${years !== 1 ? 's' : ''} from birth`;
        return `${sign}${years}y ${remDays}d from birth`;
    };

    const sunPos = getSunPosition(birthDate);
    const sign = ZODIAC_SIGNS[sunPos.signIndex];
    const decanData = sunPos.decanNum === 1 ? sign.decan1 : sunPos.decanNum === 2 ? sign.decan2 : sign.decan3;
    const compat = COMPATIBILITY[sign.name];
    const { season, distance: seasonDist } = getNearestSeason(sunPos.longitude);

    const [selectedSignIdx, setSelectedSignIdx] = useState<number | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    // ── Interactive Ecliptic Bar ──
    const eclipticWRef = useRef(300); // layout width of the ecliptic touch area
    const [eclipticW, setEclipticW] = useState(300);
    const [isDraggingEcliptic, setIsDraggingEcliptic] = useState(false);
    const eclipticStartOffsetRef = useRef(0);

    const eclipticPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 3,
            onPanResponderGrant: (evt) => {
                eclipticStartOffsetRef.current = dayOffsetRef.current;
                setIsDraggingEcliptic(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
                // Immediately jump to tap position
                const touchX = evt.nativeEvent.locationX;
                const targetLon = Math.max(0, Math.min(360, (touchX / eclipticWRef.current) * 360));
                const birthLon = getSunPosition(originalBirthDate).longitude;
                let lonDiff = targetLon - birthLon;
                if (lonDiff > 180) lonDiff -= 360;
                if (lonDiff < -180) lonDiff += 360;
                const dayDiff = lonDiff / (360 / 365.25);
                changeDate(dayDiff);
            },
            onPanResponderMove: (evt) => {
                const touchX = evt.nativeEvent.locationX;
                const targetLon = Math.max(0, Math.min(360, (touchX / eclipticWRef.current) * 360));
                const birthLon = getSunPosition(originalBirthDate).longitude;
                let lonDiff = targetLon - birthLon;
                if (lonDiff > 180) lonDiff -= 360;
                if (lonDiff < -180) lonDiff += 360;
                const dayDiff = lonDiff / (360 / 365.25);
                changeDate(dayDiff);
            },
            onPanResponderRelease: () => {
                setIsDraggingEcliptic(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
            onPanResponderTerminate: () => {
                setIsDraggingEcliptic(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
        })
    ).current;

    // ── Interactive Zodiac Wheel ──
    const [angleOffset, setAngleOffset] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
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

    // Wheel-selected sign (updates hero at top when wheel is spun)
    const wheelSignIdx = angleOffset !== 0
        ? Math.floor(normDeg(-angleOffset) / 30) % 12
        : null;
    const displaySign = wheelSignIdx !== null ? ZODIAC_SIGNS[wheelSignIdx] : sign;
    const heroSign = displaySign;

    return (
        <LinearGradient colors={['#1a0a00', '#2d1500', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0a00" />
            <RisingStars />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>☀️ Your Birth Sun</Text>
                <Text style={styles.birthDate}>
                    {birthDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>

                {/* Sun Sign Hero */}
                <View style={styles.heroContainer}>
                    <Text style={styles.heroEmoji}>{heroSign.emoji}</Text>
                    <Text style={styles.heroSymbol}>{heroSign.symbol}</Text>
                    <Text style={styles.heroName}>{heroSign.name}</Text>
                    <Text style={styles.heroDetail}>{heroSign.element} Sign • Ruled by {heroSign.ruler}</Text>
                </View>

                {/* ── TIME TRAVEL SLIDER — right under hero so users see changes ── */}
                <View style={styles.sliderSection}>
                    <Text style={styles.sliderTitle}>⏳ Time Travel</Text>
                    <Text style={[styles.cardBody, { textAlign: 'center', marginBottom: 4 }]}>Drag to change the date and watch everything on this page update.</Text>
                    <Text style={styles.sliderDateText}>
                        {birthDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    {dayOffset !== 0 && (
                        <Text style={styles.sliderOffsetText}>{formatOffset(dayOffset)}</Text>
                    )}
                    <View
                        style={styles.sliderTrackOuter}
                        onLayout={(e) => { const w = e.nativeEvent.layout.width; sliderWRef.current = w; setSliderW(w); }}
                        {...sliderPan.panHandlers}
                    >
                        <View style={styles.sliderTrack} />
                        <View style={[styles.sliderCenterMark, { left: sliderW / 2 - 1 }]} />
                        <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(sliderW - 24, ((dayOffset + SLIDER_RANGE) / (2 * SLIDER_RANGE)) * sliderW - 12)) }]} />
                    </View>
                    <View style={styles.sliderLabelsRow}>
                        <Text style={styles.sliderEndLabel}>−5 yrs</Text>
                        <TouchableOpacity onPress={() => changeDate(0)}>
                            <Text style={styles.sliderResetLabel}>⟲ Birth</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={jumpToToday}>
                            <Text style={[styles.sliderResetLabel, { color: '#40E0D0' }]}>📅 Today</Text>
                        </TouchableOpacity>
                        <Text style={styles.sliderEndLabel}>+5 yrs</Text>
                    </View>
                </View>

                {/* ── SECTION 1: Where Was the Sun? (Visual + Interactive) ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📍 Where Was the Sun?</Text>
                    <Text style={styles.cardBody}>
                        The gold dot ☀️ shows the Sun's position — {Math.round(sunPos.degreeInSign)}° into {heroSign.name}. Drag the ☀️ along the bar to move through time!
                    </Text>
                    <View
                        onLayout={(e) => { const w = e.nativeEvent.layout.width; eclipticWRef.current = w; setEclipticW(w); }}
                        {...eclipticPanResponder.panHandlers}
                        style={{ paddingVertical: 8 }}
                    >
                        {(() => {
                            const barLon = normDeg(sunPos.longitude + angleOffset);
                            const barX = (barLon / 360) * eclipticW;
                            return (
                                <Svg width="100%" height={70} viewBox={`0 0 ${eclipticW} 70`}>
                                    <Line x1={0} y1={35} x2={eclipticW} y2={35} stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
                                    {ZODIAC_SIGNS.map((z) => {
                                        const x = (z.startDeg / 360) * eclipticW;
                                        return (
                                            <G key={z.name}>
                                                <Circle cx={x} cy={35} r={2.5} fill="rgba(255,255,255,0.25)" />
                                                <SvgText x={x} y={55} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">{z.symbol}</SvgText>
                                            </G>
                                        );
                                    })}
                                    {isDraggingEcliptic && (
                                        <Circle cx={barX} cy={35} r={14} fill="rgba(255,215,0,0.15)" />
                                    )}
                                    <Circle cx={barX} cy={35} r={8} fill="#FFD700" />
                                    <SvgText x={barX} y={18} fill="#FFD700" fontSize={10} fontWeight="bold" textAnchor="middle">☀️</SvgText>
                                </Svg>
                            );
                        })()}
                    </View>
                    <Text style={styles.cycleText}>
                        Each dot is one of the 12 signs — drag the ☀️ to explore the full year
                    </Text>
                </View>

                {/* ── SECTION 2: Interactive Zodiac Wheel ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔮 Explore the Zodiac Wheel</Text>
                    <Text style={styles.cardBody}>
                        The ☀️ moves with the slider too. Spin the wheel with your finger to explore the signs.
                    </Text>
                    <View style={styles.wheelWrap} {...wheelPanResponder.panHandlers}>
                        <Svg width={320} height={320} viewBox="0 0 320 320">
                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={WHEEL_R + 8} fill="none" stroke="rgba(255,215,0,0.06)" strokeWidth={8} />

                            {ZODIAC_SIGNS.map((z, i) => {
                                const startAngle = degToRad(-90 + z.startDeg + angleOffset);
                                const endAngle = degToRad(-90 + z.startDeg + 30 + angleOffset);
                                const isCurrent = i === sunPos.signIndex;

                                const x1 = WHEEL_CX + WHEEL_R * Math.cos(startAngle);
                                const y1 = WHEEL_CY + WHEEL_R * Math.sin(startAngle);
                                const x2 = WHEEL_CX + WHEEL_R * Math.cos(endAngle);
                                const y2 = WHEEL_CY + WHEEL_R * Math.sin(endAngle);

                                const innerR = 50;
                                const ix1 = WHEEL_CX + innerR * Math.cos(startAngle);
                                const iy1 = WHEEL_CY + innerR * Math.sin(startAngle);
                                const ix2 = WHEEL_CX + innerR * Math.cos(endAngle);
                                const iy2 = WHEEL_CY + innerR * Math.sin(endAngle);

                                const midAngle = degToRad(-90 + z.startDeg + 15 + angleOffset);
                                const labelR = WHEEL_R - 30;
                                const lx = WHEEL_CX + labelR * Math.cos(midAngle);
                                const ly = WHEEL_CY + labelR * Math.sin(midAngle);

                                const outerR = WHEEL_R + 18;
                                const sx = WHEEL_CX + outerR * Math.cos(midAngle);
                                const sy = WHEEL_CY + outerR * Math.sin(midAngle);

                                return (
                                    <G key={z.name}>
                                        <Path
                                            d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${WHEEL_R} ${WHEEL_R} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1}`}
                                            fill={isCurrent ? `${z.color}33` : 'rgba(255,255,255,0.03)'}
                                            stroke={isCurrent ? z.color : 'rgba(255,255,255,0.12)'}
                                            strokeWidth={isCurrent ? 1.5 : 0.5}
                                        />
                                        <SvgText x={lx} y={ly + 5} fontSize={14} textAnchor="middle"
                                            fill={isCurrent ? z.color : 'rgba(255,255,255,0.5)'} fontWeight={isCurrent ? 'bold' : 'normal'}>
                                            {z.symbol}
                                        </SvgText>
                                        <SvgText x={sx} y={sy + 4} fontSize={9} textAnchor="middle"
                                            fill={isCurrent ? z.color : 'rgba(255,255,255,0.35)'}>
                                            {z.name.substring(0, 3)}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={46} fill="rgba(0,0,0,0.6)" />
                            <Circle cx={WHEEL_CX} cy={WHEEL_CY} r={46} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

                            <Circle cx={sunX} cy={sunY} r={12} fill="#FFD700" opacity={0.9} />
                            <SvgText x={sunX} y={sunY + 5} fontSize={14} textAnchor="middle">☀️</SvgText>

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
                            ? `${displaySign.symbol} ${displaySign.name} — ${displaySign.element} sign`
                            : '☝️ Swipe the wheel to spin it'}
                    </Text>
                </View>

                {/* ── SECTION 5: Plain-English Intro ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌞 What Does This Page Mean?</Text>
                    <Text style={styles.cardBody}>
                        Think of the sky as a giant clock. The Sun moves through 12 sections of that clock over the course of a year — those sections are the 12 zodiac signs.{'\n\n'}Whichever section the Sun was passing through on the day you were born becomes your "Sun sign." It's the sign most people mean when they say "I'm a Leo" or "I'm a Pisces."{'\n\n'}Your Sun sign is basically your personality headline — the broadest description of who you are, what drives you, and how you show up in the world.
                    </Text>
                </View>

                {/* ── SECTION 6: YOUR Sign Personality ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{sign.symbol} You're a {sign.name} — Here's What That Means</Text>
                    <Text style={styles.cardBody}>{sign.personality}</Text>
                    <View style={styles.tagRow}>
                        {sign.strengths.map(s => (
                            <View key={s} style={[styles.tag, { backgroundColor: `${sign.color}22` }]}>
                                <Text style={[styles.tagText, { color: sign.color }]}>{s}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.shadowText}>⚠️ Watch out for: {sign.shadow}</Text>
                </View>

                {/* ── SECTION 7: Your Element ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{getElementEmoji(sign.element)} You're a {sign.element} Sign</Text>
                    <Text style={styles.cardBody}>
                        Every sign belongs to one of four elements: Fire, Earth, Air, or Water. Your element is like your sign's personality family — it tells you a lot about your general vibe.{'\n\n'}{getElementDescriptionSimple(sign.element)}
                    </Text>
                    <View style={styles.elementGroup}>
                        <Text style={styles.detailLabel}>Other {sign.element} Signs</Text>
                        <Text style={styles.detailText}>
                            {ZODIAC_SIGNS.filter(z => z.element === sign.element && z.name !== sign.name).map(z => `${z.symbol} ${z.name}`).join('  •  ')}
                        </Text>
                    </View>
                </View>

                {/* ── SECTION 6: Your Decan (simplified) ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔱 Your Flavor of {sign.name}</Text>
                    <Text style={styles.cardBody}>
                        Not all {sign.name}s are exactly the same! Each sign is split into 3 groups called "decans" (think of it like early, middle, and late {sign.name}). You're in group {sunPos.decanNum} — which gives your personality an extra twist from the planet {decanData.ruler}.
                    </Text>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>What makes your group different</Text>
                        <Text style={styles.detailText}>{decanData.traits}</Text>
                    </View>
                </View>

                {/* ── SECTION 7: Compatibility ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💕 Who Do {sign.name}s Get Along With?</Text>
                    <Text style={styles.cardBody}>
                        Some signs just click — kind of like how some people instantly get your humor. Here's who tends to vibe best with {sign.name}:
                    </Text>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>❤️ Best Match — natural soulmates</Text>
                        <View style={styles.compatRow}>
                            {compat.best.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>✨ Good Chemistry — easy connection</Text>
                        <View style={styles.compatRow}>
                            {compat.good.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                    <View style={styles.compatSection}>
                        <Text style={styles.compatLabel}>⚡ Opposites Attract — takes more work</Text>
                        <View style={styles.compatRow}>
                            {compat.challenge.map(n => {
                                const z = ZODIAC_SIGNS.find(s => s.name === n)!;
                                return <Text key={n} style={styles.compatSign}>{z.symbol} {z.name}</Text>;
                            })}
                        </View>
                    </View>
                </View>

                {/* ── SECTION 8: Season ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 What Season Were You Born In?</Text>
                    <Text style={styles.cardBody}>
                        The zodiac follows the real seasons of the year. Each season starts with a major event — a solstice or equinox — and your sign falls in the {getSolarSeason(sunPos.longitude)} part of the cycle.
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
                            ? `You were born right near the ${season.name} — a powerful turning point in the year!`
                            : `Your closest seasonal marker is the ${season.emoji} ${season.name} (${Math.round(seasonDist)}° away).`}
                    </Text>
                </View>

                {/* ── SECTION 10: Sun vs Moon (plain English) ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Quick Guide: Sun Sign vs Moon Sign</Text>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>☀️ Sun Sign = Who You Are</Text>
                        <Text style={styles.detailText}>Your personality, your ego, your main character energy. It's the "you" that people see when they first get to know you.</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>🌙 Moon Sign = How You Feel</Text>
                        <Text style={styles.detailText}>Your emotions, your inner world, how you deal with stress and comfort. It's the private "you" that only close people see.</Text>
                    </View>
                    <View style={styles.decanDetail}>
                        <Text style={styles.detailLabel}>⬆️ Rising Sign = How You Come Across</Text>
                        <Text style={styles.detailText}>Your first impression, your outward style, the mask you wear when you walk into a room full of strangers.</Text>
                    </View>
                </View>

                {/* ── SECTION 11: All 12 Signs Grid ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 All 12 Sun Signs at a Glance</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginBottom: 6 }}>Tap any sign to explore</Text>
                    {[0, 1, 2, 3].map(row => (
                        <View key={row} style={styles.signGridRow}>
                            {ZODIAC_SIGNS.slice(row * 3, row * 3 + 3).map(z => (
                                <TouchableOpacity key={z.name} activeOpacity={0.7} onPress={() => setSelectedSign(z)}
                                    style={[styles.signGridCell, z.name === sign.name && { backgroundColor: `${z.color}15`, borderColor: z.color }]}>
                                    <Text style={styles.signGridSymbol}>{z.symbol}</Text>
                                    <Text style={[styles.signGridName, z.name === sign.name && { color: z.color }]}>{z.name}</Text>
                                    <Text style={styles.signGridDetail}>{z.element}</Text>
                                    <Text style={styles.signGridDetail}>{z.ruler}</Text>
                                    {z.name === sign.name && <Text style={[styles.signGridYou, { color: z.color }]}>YOU</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── Sign Detail Modal ── */}
            <Modal visible={selectedSign !== null} transparent animationType="slide" onRequestClose={() => setSelectedSign(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSign && (() => {
                            const s = selectedSign;
                            const compat = COMPATIBILITY[s.name];
                            const isYou = s.name === sign.name;
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Header */}
                                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                                        <Text style={{ fontSize: 48 }}>{s.symbol}</Text>
                                        <Text style={{ fontSize: 26, fontWeight: '900', color: s.color, marginTop: 4 }}>{s.name} {s.emoji}</Text>
                                        {isYou && <Text style={{ fontSize: 13, fontWeight: '800', color: s.color, marginTop: 2 }}>⭐ YOUR SUN SIGN</Text>}
                                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                            {s.element} · {s.quality} · Ruled by {s.ruler}
                                        </Text>
                                    </View>

                                    {/* Personality */}
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>✨ Personality</Text>
                                        <Text style={styles.modalText}>{s.personality}</Text>
                                    </View>

                                    {/* Strengths */}
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>💪 Strengths</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                            {s.strengths.map(str => (
                                                <View key={str} style={{ backgroundColor: `${s.color}20`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: `${s.color}40` }}>
                                                    <Text style={{ color: s.color, fontSize: 12, fontWeight: '700' }}>{str}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Shadow */}
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>🌑 Shadow Side</Text>
                                        <Text style={styles.modalText}>{s.shadow}</Text>
                                    </View>

                                    {/* Decans */}
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>🔮 The Three Decans</Text>
                                        {[s.decan1, s.decan2, s.decan3].map((d, i) => (
                                            <View key={i} style={{ marginTop: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8 }}>
                                                <Text style={{ color: s.color, fontSize: 12, fontWeight: '800' }}>{ordinal(i + 1)} Decan — Ruled by {d.ruler}</Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>{d.traits}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Compatibility */}
                                    {compat && (
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalSectionTitle}>💕 Compatibility</Text>
                                            <View style={{ marginTop: 4 }}>
                                                <Text style={{ color: '#4CAF50', fontSize: 13, fontWeight: '700' }}>🔥 Best Match: {compat.best.join(', ')}</Text>
                                                <Text style={{ color: '#FFD54F', fontSize: 13, fontWeight: '700', marginTop: 3 }}>👍 Good Match: {compat.good.join(', ')}</Text>
                                                <Text style={{ color: '#EF5350', fontSize: 13, fontWeight: '700', marginTop: 3 }}>⚡ Challenge: {compat.challenge.join(', ')}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Close button */}
                                    <TouchableOpacity onPress={() => setSelectedSign(null)}
                                        style={{ marginTop: 16, alignSelf: 'center', backgroundColor: s.color, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 10 }}>
                                        <Text style={{ color: '#000', fontSize: 14, fontWeight: '800' }}>Close</Text>
                                    </TouchableOpacity>
                                    <View style={{ height: 20 }} />
                                </ScrollView>
                            );
                        })()}
                    </View>
                </View>
            </Modal>

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

function getElementDescriptionSimple(element: string): string {
    switch (element) {
        case 'Fire': return 'Fire signs are the go-getters. They\'re passionate, energetic, and not afraid to take risks. Think of them as the people who light up a room and get things moving.';
        case 'Earth': return 'Earth signs are the steady ones. They\'re practical, reliable, and grounded. They\'re the people you can always count on — the builders and planners of the group.';
        case 'Air': return 'Air signs are the thinkers and talkers. They love ideas, conversation, and connecting with people. They\'re curious about everything and always asking "why?"';
        case 'Water': return 'Water signs are the feelers. They\'re deeply emotional, intuitive, and empathetic. They pick up on vibes other people miss and feel things on a whole different level.';
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
    signGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    signGridCell: { flex: 1, alignItems: 'center', paddingVertical: 10, marginHorizontal: 3, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
    signGridSymbol: { fontSize: 26, marginBottom: 2 },
    signGridName: { fontSize: 12, fontWeight: '800', color: '#fff', marginBottom: 2 },
    signGridDetail: { fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 13 },
    signGridYou: { fontSize: 9, fontWeight: '900', marginTop: 3, letterSpacing: 1 },
    sliderSection: { marginBottom: 14, paddingHorizontal: 8, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    sliderTitle: { fontSize: 16, fontWeight: '800', color: '#FFD54F', textAlign: 'center', marginBottom: 4 },
    sliderDateText: { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 2 },
    sliderOffsetText: { fontSize: 12, fontWeight: '600', color: '#FFD54F', textAlign: 'center', marginBottom: 6 },
    sliderTrackOuter: { height: 44, justifyContent: 'center', marginHorizontal: 4, marginVertical: 8 },
    sliderTrack: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
    sliderCenterMark: { position: 'absolute', width: 2, height: 20, backgroundColor: 'rgba(255,213,79,0.5)', borderRadius: 1, top: 12 },
    sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFD54F', borderWidth: 2, borderColor: '#fff', top: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    sliderEndLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    sliderResetLabel: { fontSize: 13, fontWeight: '700', color: '#FFD54F' },
    stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, gap: 4 },
    stepBtn: { flex: 1, paddingVertical: 4, paddingHorizontal: 1, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
    stepBtnText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 60 },
    modalContent: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    modalSection: { marginBottom: 14 },
    modalSectionTitle: { fontSize: 15, fontWeight: '800', color: '#FFE082', marginBottom: 4 },
    modalText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
});
