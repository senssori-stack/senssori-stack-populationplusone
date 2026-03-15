import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, G, Line, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BirthMoonPhase'>;

const MOON_PHASES = [
    { name: 'New Moon', icon: '🌑', range: [0, 1.85], personality: 'You are a natural starter — full of potential and new beginnings. You thrive on fresh starts and setting intentions. Your energy is inward and contemplative, perfect for planting seeds of change.', strengths: ['Visionary', 'Intuitive', 'Adventurous', 'Pioneering'], shadow: 'Can struggle with follow-through' },
    { name: 'Waxing Crescent', icon: '🌒', range: [1.85, 5.54], personality: 'You are driven by faith and hope. Born under a growing sliver of light, you have an instinctive ability to push through challenges with optimism. You set bold intentions and chase them with determination.', strengths: ['Determined', 'Optimistic', 'Creative', 'Resourceful'], shadow: 'May be overly idealistic' },
    { name: 'First Quarter', icon: '🌓', range: [5.54, 9.23], personality: 'Action is your middle name! You are a decisive problem-solver who thrives on challenges. The half-lit moon at your birth gives you the courage to make tough choices and stand your ground.', strengths: ['Decisive', 'Courageous', 'Strong-willed', 'Dynamic'], shadow: 'Can be inflexible' },
    { name: 'Waxing Gibbous', icon: '🌔', range: [9.23, 12.91], personality: 'You are a natural refiner and perfectionist. Born under an almost-full moon, you have an eye for detail and a drive to improve everything you touch. Your analytical mind is your superpower.', strengths: ['Analytical', 'Dedicated', 'Patient', 'Perfectionist'], shadow: 'May overthink or over-prepare' },
    { name: 'Full Moon', icon: '🌕', range: [12.91, 16.61], personality: 'You are magnetic and expressive! Born under the Full Moon\'s brilliant light, you have powerful emotions and a need to share your gifts with the world. Relationships are central to your life.', strengths: ['Charismatic', 'Empathetic', 'Expressive', 'Illuminating'], shadow: 'Can be overly emotional' },
    { name: 'Waning Gibbous', icon: '🌖', range: [16.61, 20.30], personality: 'You are a natural teacher and mentor. Born as the moon begins to share its light, you feel called to give back wisdom and guide others. Your life is about sharing knowledge and experience.', strengths: ['Wise', 'Generous', 'Teaching', 'Philosophical'], shadow: 'May feel burdened by responsibility' },
    { name: 'Last Quarter', icon: '🌗', range: [20.30, 23.99], personality: 'You are a revolutionary thinker! Born under the half-dark moon, you question the status quo and forge your own path. You have a deep need to release what no longer serves you.', strengths: ['Independent', 'Revolutionary', 'Principled', 'Transformative'], shadow: 'Can be stubborn about beliefs' },
    { name: 'Waning Crescent', icon: '🌘', range: [23.99, 27.69], personality: 'You are an old soul with deep wisdom. Born under the final sliver of moonlight, you are introspective and spiritually attuned. You have a gift for closure and preparation for new cycles.', strengths: ['Spiritual', 'Reflective', 'Compassionate', 'Insightful'], shadow: 'May withdraw too much' },
];

const MOON_SIGNS = [
    { sign: 'Aries', symbol: '♈', traits: 'Fiery emotions, quick reactions, passionate instincts', need: 'Action & independence' },
    { sign: 'Taurus', symbol: '♉', traits: 'Steady feelings, comfort-seeking, sensual needs', need: 'Security & stability' },
    { sign: 'Gemini', symbol: '♊', traits: 'Restless emotions, curious mind, social needs', need: 'Mental stimulation' },
    { sign: 'Cancer', symbol: '♋', traits: 'Deep feelings, nurturing instinct, home-focused', need: 'Emotional safety' },
    { sign: 'Leo', symbol: '♌', traits: 'Dramatic emotions, generous heart, creative fire', need: 'Recognition & love' },
    { sign: 'Virgo', symbol: '♍', traits: 'Analyzed feelings, service-oriented, detail-focused', need: 'Order & usefulness' },
    { sign: 'Libra', symbol: '♎', traits: 'Balanced emotions, harmony-seeking, relationship-driven', need: 'Partnership & beauty' },
    { sign: 'Scorpio', symbol: '♏', traits: 'Intense emotions, transformative depth, powerful instincts', need: 'Truth & authenticity' },
    { sign: 'Sagittarius', symbol: '♐', traits: 'Optimistic feelings, freedom-loving, philosophical', need: 'Adventure & meaning' },
    { sign: 'Capricorn', symbol: '♑', traits: 'Controlled emotions, ambitious drive, cautious trust', need: 'Achievement & respect' },
    { sign: 'Aquarius', symbol: '♒', traits: 'Detached feelings, humanitarian instinct, unique perspective', need: 'Freedom & purpose' },
    { sign: 'Pisces', symbol: '♓', traits: 'Boundless emotions, empathic sponge, dreamy nature', need: 'Creativity & escape' },
];

// ── Jean Meeus astronomical algorithms (Astronomical Algorithms, 2nd Ed) ──

/** Convert a JS Date to Julian Day Number */
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

/**
 * Compute Sun's ecliptic longitude (degrees) — Meeus Ch. 25
 */
function sunLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mr = degToRad(M);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
        + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
        + 0.000289 * Math.sin(3 * Mr);
    const sunLon = normDeg(L0 + C);
    // Apparent longitude (nutation + aberration)
    const omega = degToRad(125.04 - 1934.136 * T);
    return normDeg(sunLon - 0.00569 - 0.00478 * Math.sin(omega));
}

/**
 * Compute Moon's ecliptic longitude (degrees) — Meeus Ch. 47 (principal terms)
 */
function moonLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const T2 = T * T;
    const T3 = T2 * T;
    const T4 = T3 * T;
    // Mean values
    const Lp = normDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
    const D = normDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
    const M = normDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
    const Mp = normDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
    const F = normDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

    const Dr = degToRad(D), Mr = degToRad(M), Mpr = degToRad(Mp), Fr = degToRad(F);
    const E = 1 - 0.002516 * T - 0.0000074 * T2;

    // Principal longitude terms (largest ~60 terms condensed to the dominant ones)
    let sl = 0;
    sl += 6288774 * Math.sin(Mpr);
    sl += 1274027 * Math.sin(2 * Dr - Mpr);
    sl += 658314 * Math.sin(2 * Dr);
    sl += 213618 * Math.sin(2 * Mpr);
    sl += -185116 * Math.sin(Mr) * E;
    sl += -114332 * Math.sin(2 * Fr);
    sl += 58793 * Math.sin(2 * Dr - 2 * Mpr);
    sl += 57066 * Math.sin(2 * Dr - Mr - Mpr) * E;
    sl += 53322 * Math.sin(2 * Dr + Mpr);
    sl += 45758 * Math.sin(2 * Dr - Mr) * E;
    sl += -40923 * Math.sin(Mr - Mpr) * E;
    sl += -34720 * Math.sin(Dr);
    sl += -30383 * Math.sin(Mr + Mpr) * E;
    sl += 15327 * Math.sin(2 * Dr - 2 * Fr);
    sl += -12528 * Math.sin(Mpr + 2 * Fr);
    sl += 10980 * Math.sin(Mpr - 2 * Fr);
    sl += 10675 * Math.sin(4 * Dr - Mpr);
    sl += 10034 * Math.sin(3 * Mpr);
    sl += 8548 * Math.sin(4 * Dr - 2 * Mpr);
    sl += -7888 * Math.sin(2 * Dr + Mr - Mpr) * E;
    sl += -6766 * Math.sin(2 * Dr + Mr) * E;
    sl += -5163 * Math.sin(Dr - Mpr);
    sl += 4987 * Math.sin(Dr + Mr) * E;
    sl += 4036 * Math.sin(2 * Dr - Mr + Mpr) * E;

    return normDeg(Lp + sl / 1000000);
}

/**
 * Compute moon age in days (0–29.53) from the Sun-Moon elongation angle.
 * This is the TRUE phase angle, not a simple modulo approximation.
 */
function getMoonAge(date: Date): number {
    const jde = toJDE(date);
    const sunLon = sunLongitude(jde);
    const moonLon = moonLongitude(jde);
    // Elongation: how far the moon is ahead of the sun
    let elongation = normDeg(moonLon - sunLon);
    // Convert elongation (0°–360°) to moon age in days
    return elongation / 360 * 29.530588853;
}

function getPhase(moonAge: number) {
    // Use phase fraction (0–1) for accurate boundary detection with wrapping
    const frac = (moonAge / 29.530588853) % 1;
    if (frac < 0.0625 || frac >= 0.9375) return MOON_PHASES[0]; // New Moon (wraps)
    if (frac < 0.1875) return MOON_PHASES[1]; // Waxing Crescent
    if (frac < 0.3125) return MOON_PHASES[2]; // First Quarter
    if (frac < 0.4375) return MOON_PHASES[3]; // Waxing Gibbous
    if (frac < 0.5625) return MOON_PHASES[4]; // Full Moon
    if (frac < 0.6875) return MOON_PHASES[5]; // Waning Gibbous
    if (frac < 0.8125) return MOON_PHASES[6]; // Last Quarter
    return MOON_PHASES[7]; // Waning Crescent
}

/**
 * Compute the Moon's zodiac sign from its true ecliptic longitude (Meeus Ch. 47)
 */
function getMoonSign(date: Date) {
    const jde = toJDE(date);
    const moonLon = moonLongitude(jde);
    const signIndex = Math.floor(moonLon / 30) % 12;
    return MOON_SIGNS[signIndex];
}

function getIlluminationPercent(moonAge: number): number {
    // Illumination from elongation-derived age: 0% at new, 100% at full
    return Math.round(50 * (1 - Math.cos((moonAge / 29.530588853) * 2 * Math.PI)));
}

export default function BirthMoonPhaseScreen({ route }: Props) {
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate), [route.params.birthDate]);
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate));

    // ── Time Travel State ──
    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const SLIDER_RANGE = 36525; // ±100 years
    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);

    const changeDate = useCallback((newOffset: number) => {
        const clamped = Math.max(-SLIDER_RANGE, Math.min(SLIDER_RANGE, newOffset));
        setDayOffset(clamped);
        dayOffsetRef.current = clamped;
        setBirthDate(new Date(originalBirthDate.getTime() + clamped * 86400000));
        setMoonAgeOffset(0);
        moonAgeOffsetRef.current = 0;
    }, [originalBirthDate, SLIDER_RANGE]);

    const sliderStartOffsetRef = useRef(0);
    const timeSliderPan = useRef(
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
        setMoonAgeOffset(0);
        moonAgeOffsetRef.current = 0;
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

    const moonAge = getMoonAge(birthDate);
    const phase = getPhase(moonAge);
    const moonSign = getMoonSign(birthDate);
    const illumination = getIlluminationPercent(moonAge);
    const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number | null>(null);

    // ── Orbital Wheel ──
    const [moonAgeOffset, setMoonAgeOffset] = useState(0);
    const displayMoonAge = ((moonAge + moonAgeOffset) % 29.53 + 29.53) % 29.53;
    const displayPhase = getPhase(displayMoonAge);
    const [isSpinning, setIsSpinning] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const lastAngleRef = useRef<number | null>(null);
    const spinAccumRef = useRef(0);
    const moonAgeOffsetRef = useRef(0);

    const ORBIT_CX = 160;
    const ORBIT_R = 90;

    const orbitPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) =>
                Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
            onPanResponderGrant: () => {
                lastAngleRef.current = null;
                spinAccumRef.current = moonAgeOffsetRef.current * (360 / 29.53);
                setIsSpinning(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const a =
                    Math.atan2(locationY - ORBIT_CX, locationX - ORBIT_CX) *
                    (180 / Math.PI);
                if (lastAngleRef.current !== null) {
                    let delta = a - lastAngleRef.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    spinAccumRef.current += delta;
                    const newOff = (spinAccumRef.current / 360) * 29.53;
                    moonAgeOffsetRef.current = newOff;
                    setMoonAgeOffset(newOff);
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

    // Current moon position on orbit
    const moonAngleRad = Math.PI + (displayMoonAge / 29.53) * 2 * Math.PI;
    const curMoonX = ORBIT_CX + ORBIT_R * Math.cos(moonAngleRad);
    const curMoonY = ORBIT_CX + ORBIT_R * Math.sin(moonAngleRad);

    // Lit-side geometry: the lit hemisphere always faces the Sun
    const SUN_X = 16;
    const SUN_Y = 160;
    const toSunAngle = Math.atan2(SUN_Y - curMoonY, SUN_X - curMoonX);
    const mR = 13;
    // Terminator endpoints (perpendicular to Sun direction)
    const t1x = curMoonX + mR * Math.cos(toSunAngle + Math.PI / 2);
    const t1y = curMoonY + mR * Math.sin(toSunAngle + Math.PI / 2);
    const t2x = curMoonX + mR * Math.cos(toSunAngle - Math.PI / 2);
    const t2y = curMoonY + mR * Math.sin(toSunAngle - Math.PI / 2);

    // ── Earth's Eye PanResponder (shares same moonAgeOffset) ──
    const earthLastAngle = useRef<number | null>(null);
    const earthSpinAccum = useRef(0);
    const EARTH_EYE_CX = 160;
    const EARTH_EYE_R = 60;

    const earthPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) =>
                Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
            onPanResponderGrant: () => {
                earthLastAngle.current = null;
                earthSpinAccum.current = moonAgeOffsetRef.current * (360 / 29.53);
                setIsSpinning(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const a =
                    Math.atan2(locationY - 100, locationX - EARTH_EYE_CX) *
                    (180 / Math.PI);
                if (earthLastAngle.current !== null) {
                    let delta = a - earthLastAngle.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    earthSpinAccum.current += delta;
                    const newOff = (earthSpinAccum.current / 360) * 29.53;
                    moonAgeOffsetRef.current = newOff;
                    setMoonAgeOffset(newOff);
                }
                earthLastAngle.current = a;
            },
            onPanResponderRelease: () => {
                earthLastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
            onPanResponderTerminate: () => {
                earthLastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
        })
    ).current;

    // Earth's-Eye terminator (how the phase looks FROM Earth)
    const eyeAngle = (displayMoonAge / 29.53) * 2 * Math.PI;
    const eyeTermX = EARTH_EYE_R * Math.cos(eyeAngle);

    // SVG Moon visual
    const moonR = 55;
    const cx = 80;
    const cy = 80;
    // Calculate the terminator position
    const angle = (moonAge / 29.53) * 2 * Math.PI;
    const terminatorX = moonR * Math.cos(angle);

    return (
        <LinearGradient colors={['#0a0a2a', '#1a0030', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a2a" />
            <RisingStars />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🌙 Your Birth Moon</Text>
                <Text style={styles.birthDate}>
                    {birthDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>

                {/* ═══ TIME TRAVEL SLIDER ═══ */}
                <View style={styles.sliderSection}>
                    <Text style={styles.sliderTitle}>⏳ Time Travel</Text>
                    <Text style={styles.sliderDateText}>
                        {birthDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    {dayOffset !== 0 && (
                        <Text style={styles.sliderOffsetText}>{formatOffset(dayOffset)}</Text>
                    )}
                    <View
                        style={styles.sliderTrackOuter}
                        onLayout={(e) => { const w = e.nativeEvent.layout.width; sliderWRef.current = w; setSliderW(w); }}
                        {...timeSliderPan.panHandlers}
                    >
                        <View style={styles.sliderTrack} />
                        <View style={[styles.sliderCenterMark, { left: sliderW / 2 - 1 }]} />
                        <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(sliderW - 24, ((dayOffset + SLIDER_RANGE) / (2 * SLIDER_RANGE)) * sliderW - 12)) }]} />
                    </View>
                    <View style={styles.sliderLabelsRow}>
                        <Text style={styles.sliderEndLabel}>−100 yrs</Text>
                        <TouchableOpacity onPress={() => changeDate(0)}>
                            <Text style={styles.sliderResetLabel}>⟲ Birth</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={jumpToToday}>
                            <Text style={[styles.sliderResetLabel, { color: '#40E0D0' }]}>📅 Today</Text>
                        </TouchableOpacity>
                        <Text style={styles.sliderEndLabel}>+100 yrs</Text>
                    </View>
                    <View style={styles.stepRow}>
                        {[{ label: '5yr', d: 1826.25 }, { label: '1yr', d: 365.25 }, { label: '6mo', d: 182.625 }, { label: '1mo', d: 30.44 }, { label: '12h', d: 0.5 }, { label: '3h', d: 0.125 }].map(s => (
                            <TouchableOpacity key={'m' + s.label} onPress={() => changeDate(dayOffset - s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>◀{s.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.stepRow}>
                        {[{ label: '3h', d: 0.125 }, { label: '12h', d: 0.5 }, { label: '1mo', d: 30.44 }, { label: '6mo', d: 182.625 }, { label: '1yr', d: 365.25 }, { label: '5yr', d: 1826.25 }].map(s => (
                            <TouchableOpacity key={'p' + s.label} onPress={() => changeDate(dayOffset + s.d)} style={styles.stepBtn}>
                                <Text style={styles.stepBtnText}>{s.label}▶</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Moon Visual */}
                <View style={styles.moonContainer}>
                    <Svg width={160} height={160} viewBox="0 0 160 160">
                        {/* Glow */}
                        <Circle cx={cx} cy={cy} r={moonR + 12} fill="rgba(200,200,255,0.04)" />
                        <Circle cx={cx} cy={cy} r={moonR + 6} fill="rgba(200,200,255,0.06)" />
                        {/* Moon base (dark side) */}
                        <Circle cx={cx} cy={cy} r={moonR} fill="#222" />
                        {/* Illuminated side */}
                        <Path
                            d={moonAge <= 14.76
                                ? `M ${cx} ${cy - moonR} A ${moonR} ${moonR} 0 0 1 ${cx} ${cy + moonR} A ${Math.abs(terminatorX)} ${moonR} 0 0 ${terminatorX < 0 ? 1 : 0} ${cx} ${cy - moonR}`
                                : `M ${cx} ${cy - moonR} A ${moonR} ${moonR} 0 0 0 ${cx} ${cy + moonR} A ${Math.abs(terminatorX)} ${moonR} 0 0 ${terminatorX > 0 ? 1 : 0} ${cx} ${cy - moonR}`
                            }
                            fill="#E8E0D0"
                        />
                        {/* Craters */}
                        <Circle cx={cx - 15} cy={cy - 10} r={8} fill="rgba(0,0,0,0.08)" />
                        <Circle cx={cx + 10} cy={cy + 15} r={6} fill="rgba(0,0,0,0.06)" />
                        <Circle cx={cx - 5} cy={cy + 20} r={4} fill="rgba(0,0,0,0.05)" />
                    </Svg>
                    <Text style={styles.phaseIcon}>{phase.icon}</Text>
                    <Text style={styles.phaseName}>{phase.name}</Text>
                    <Text style={styles.illuminationText}>{illumination}% illuminated</Text>
                </View>

                {/* Educational Intro */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 What Is a Birth Moon?</Text>
                    <Text style={styles.cardBody}>
                        The Moon takes about 29.5 days to orbit Earth — one full lunar cycle. During that journey, sunlight hits the Moon from different angles, creating the 8 phases you see below (New Moon → Full Moon → back again).{'\n\n'}Your "Birth Moon" is whichever phase the Moon was in the moment you were born. For thousands of years, cultures around the world have believed the Moon's phase at birth shapes personality, emotional tendencies, and even life purpose — much like a zodiac sign, but tied to the lunar cycle instead of the Sun's position.
                    </Text>
                </View>

                {/* Lunar Cycle Position */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔄 Lunar Cycle Position</Text>
                    <Svg width="100%" height={70} viewBox="0 0 320 70">
                        {/* Track */}
                        <Line x1={20} y1={35} x2={300} y2={35} stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
                        {/* Phase markers */}
                        {MOON_PHASES.map((p, i) => {
                            const x = 20 + (p.range[0] / 29.53) * 280;
                            return (
                                <G key={p.name}>
                                    <Circle cx={x} cy={35} r={3} fill="rgba(255,255,255,0.3)" />
                                    <SvgText x={x} y={55} fill="rgba(255,255,255,0.4)" fontSize={14} textAnchor="middle">{p.icon}</SvgText>
                                </G>
                            );
                        })}
                        {/* Current position */}
                        <Circle cx={20 + (moonAge / 29.53) * 280} cy={35} r={7} fill="#FFD54F" />
                        <SvgText x={20 + (moonAge / 29.53) * 280} y={18} fill="#FFD54F" fontSize={10} fontWeight="bold" textAnchor="middle">YOU</SvgText>
                    </Svg>
                    <Text style={styles.cycleText}>Day {Math.round(moonAge * 10) / 10} of 29.5-day cycle</Text>
                </View>

                {/* Personality */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{phase.icon} {phase.name} Personality</Text>
                    <Text style={styles.cardBody}>{phase.personality}</Text>
                    <View style={styles.tagRow}>
                        {phase.strengths.map(s => (
                            <View key={s} style={styles.tag}>
                                <Text style={styles.tagText}>{s}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.shadowText}>⚠️ Shadow side: {phase.shadow}</Text>
                </View>

                {/* Moon Sign */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌙 Moon Sign: {moonSign.symbol} {moonSign.sign}</Text>
                    <Text style={styles.cardBody}>Your Moon sign reveals your emotional nature — how you feel, react, and nurture yourself and others.</Text>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>Emotional Style</Text>
                        <Text style={styles.detailText}>{moonSign.traits}</Text>
                    </View>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>Core Need</Text>
                        <Text style={styles.detailText}>{moonSign.need}</Text>
                    </View>
                </View>

                {/* Illumination Gauge */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Illumination Meter</Text>
                    <Svg width="100%" height={50} viewBox="0 0 320 50">
                        <Rect x={10} y={15} width={300} height={24} rx={12} fill="rgba(255,255,255,0.08)" />
                        <Rect x={10} y={15} width={illumination * 3} height={24} rx={12} fill="#FFE082" opacity={0.9} />
                        <SvgText x={160} y={31} fill="#333" fontSize={12} fontWeight="bold" textAnchor="middle">{illumination}%</SvgText>
                    </Svg>
                    <Text style={styles.gaugeHint}>
                        {illumination < 25 ? '🌑 Born in darkness — deeply introspective and mysterious' :
                            illumination < 50 ? '🌒 Growing light — building towards something great' :
                                illumination < 75 ? '🌔 Nearly full — abundant energy and clarity' :
                                    '🌕 Full illumination — powerful emotions and strong presence'}
                    </Text>
                </View>

                {/* How the Moon Affects Everyday Life */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌊 How the Moon Affects Everyday Life</Text>
                    <Text style={styles.cardBody}>
                        The Moon isn't just a light in the sky — its gravitational pull drives ocean tides, and many believe it subtly influences human behavior too. Here's what people have observed for centuries:
                    </Text>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>😴 Sleep & Energy</Text>
                        <Text style={styles.detailText}>Studies suggest people sleep less and feel more alert around the Full Moon. Born under a Full Moon? You may naturally be a night owl with high energy.</Text>
                    </View>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>💭 Mood & Emotions</Text>
                        <Text style={styles.detailText}>The word "lunatic" comes from "luna" (Moon). Emergency rooms and police departments have long reported upticks around the Full Moon. Your birth phase may shape your emotional baseline — New Moon babies tend to be introspective, while Full Moon babies are expressive.</Text>
                    </View>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>🌱 Growth & Planning</Text>
                        <Text style={styles.detailText}>Farmers have planted by the Moon for millennia — root crops during waning phases, above-ground crops during waxing. Many people today use the same cycle to plan projects: start new things at the New Moon, launch at the Full Moon, reflect during waning phases.</Text>
                    </View>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>💇 Body & Wellness</Text>
                        <Text style={styles.detailText}>Some traditions recommend cutting hair during the Waxing Moon for faster growth, or during the Waning Moon for thicker, stronger hair. Surgeons in some cultures prefer to schedule procedures during waning phases when swelling is believed to be reduced.</Text>
                    </View>
                    <View style={styles.moonSignDetail}>
                        <Text style={styles.detailLabel}>🤝 Relationships</Text>
                        <Text style={styles.detailText}>Your birth moon phase can affect how you connect with others. Waxing-phase people are builders who pull energy toward them. Waning-phase people are givers who share wisdom outward. Full Moon people thrive on deep bonds; New Moon people need more solitude to recharge.</Text>
                    </View>
                </View>

                {/* ═══ Interactive Orbital Wheel ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 Sun–Earth–Moon Wheel</Text>
                    <Text style={styles.cardBody}>
                        Spin the Moon around Earth to see how phases form. Sunlight always comes from the left — watch the shadow change!
                    </Text>
                    <View style={styles.orbitalWheelWrap} {...orbitPanResponder.panHandlers}>
                        <Svg width={320} height={320} viewBox="0 0 320 320">
                            {/* Sunlight rays */}
                            {[-50, -30, -10, 10, 30, 50].map(dy => (
                                <Line key={dy} x1={0} y1={160 + dy} x2={55} y2={160 + dy}
                                    stroke="rgba(255,215,0,0.12)" strokeWidth={1.5} strokeDasharray="4,4" />
                            ))}

                            {/* Sun glow + circle */}
                            <Circle cx={16} cy={160} r={26} fill="rgba(255,200,0,0.08)" />
                            <Circle cx={16} cy={160} r={18} fill="#FFD700" />
                            <SvgText x={16} y={165} fontSize={16} textAnchor="middle">☀️</SvgText>

                            {/* Moon orbit ring */}
                            <Circle cx={ORBIT_CX} cy={ORBIT_CX} r={ORBIT_R}
                                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="6,4" />

                            {/* 8 phase marker emojis */}
                            {MOON_PHASES.map((p, i) => {
                                const a = Math.PI + (i / 8) * 2 * Math.PI;
                                const lx = ORBIT_CX + (ORBIT_R + 20) * Math.cos(a);
                                const ly = ORBIT_CX + (ORBIT_R + 20) * Math.sin(a);
                                const isActive = p.name === displayPhase.name;
                                return (
                                    <G key={p.name}>
                                        <Circle
                                            cx={ORBIT_CX + ORBIT_R * Math.cos(a)}
                                            cy={ORBIT_CX + ORBIT_R * Math.sin(a)}
                                            r={3}
                                            fill={isActive ? '#FFD54F' : 'rgba(255,255,255,0.18)'}
                                        />
                                        <SvgText x={lx} y={ly + 5} fontSize={13} textAnchor="middle"
                                            fill={isActive ? '#FFD54F' : 'rgba(255,255,255,0.45)'}>
                                            {p.icon}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Earth at center */}
                            <Circle cx={ORBIT_CX} cy={ORBIT_CX} r={16} fill="#1565C0" />
                            <Circle cx={ORBIT_CX} cy={ORBIT_CX} r={16}
                                fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={0.5} />
                            <SvgText x={ORBIT_CX} y={ORBIT_CX + 5} fontSize={14} textAnchor="middle">🌍</SvgText>

                            {/* Moon — dark base circle */}
                            <Circle cx={curMoonX} cy={curMoonY} r={mR} fill="#333" />
                            {/* Moon — sunlit hemisphere (always faces the Sun) */}
                            <Path
                                d={`M ${t1x} ${t1y} A ${mR} ${mR} 0 0 1 ${t2x} ${t2y} Z`}
                                fill="#E8E0D0"
                            />
                            {/* Moon outline */}
                            <Circle cx={curMoonX} cy={curMoonY} r={mR}
                                fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />

                            {/* Earth label */}
                            <SvgText x={ORBIT_CX} y={ORBIT_CX + 28} fontSize={9}
                                textAnchor="middle" fill="rgba(255,255,255,0.5)">Earth</SvgText>

                            {/* Phase label at bottom */}
                            <SvgText x={160} y={308} fontSize={12} fontWeight="bold"
                                textAnchor="middle" fill={isSpinning ? '#FFD54F' : 'rgba(255,255,255,0.6)'}>
                                {displayPhase.icon} {displayPhase.name} — Day {Math.round(displayMoonAge * 10) / 10}
                            </SvgText>
                        </Svg>
                    </View>
                    <Text style={styles.spinHint}>
                        {isSpinning
                            ? `${displayPhase.icon} ${displayPhase.name}`
                            : '☝️ Drag to spin the Moon around Earth'}
                    </Text>
                </View>

                {/* ═══ Earth's Eye View — what you actually see ═══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>👁️ Earth's Eye View</Text>
                    <Text style={styles.cardBody}>
                        This is what the Moon actually looks like from Earth right now. Spin either wheel — they stay in sync!
                    </Text>
                    <View style={styles.orbitalWheelWrap} {...earthPanResponder.panHandlers}>
                        <Svg width={320} height={220} viewBox="0 0 320 220">
                            {/* Starfield dots */}
                            {[{ x: 20, y: 15 }, { x: 55, y: 45 }, { x: 280, y: 25 }, { x: 300, y: 70 }, { x: 40, y: 160 }, { x: 130, y: 180 }, { x: 240, y: 170 }, { x: 290, y: 150 }, { x: 175, y: 20 }, { x: 95, y: 75 }].map((s, i) => (
                                <Circle key={i} cx={s.x} cy={s.y} r={0.8} fill="rgba(255,255,255,0.25)" />
                            ))}

                            {/* Outer glow */}
                            <Circle cx={EARTH_EYE_CX} cy={100} r={EARTH_EYE_R + 15} fill="rgba(200,200,255,0.03)" />
                            <Circle cx={EARTH_EYE_CX} cy={100} r={EARTH_EYE_R + 8} fill="rgba(200,200,255,0.05)" />

                            {/* Moon base (dark side) */}
                            <Circle cx={EARTH_EYE_CX} cy={100} r={EARTH_EYE_R} fill="#222" />

                            {/* Illuminated portion — same math as top moon visual */}
                            <Path
                                d={displayMoonAge <= 14.76
                                    ? `M ${EARTH_EYE_CX} ${100 - EARTH_EYE_R} A ${EARTH_EYE_R} ${EARTH_EYE_R} 0 0 1 ${EARTH_EYE_CX} ${100 + EARTH_EYE_R} A ${Math.abs(eyeTermX)} ${EARTH_EYE_R} 0 0 ${eyeTermX < 0 ? 1 : 0} ${EARTH_EYE_CX} ${100 - EARTH_EYE_R}`
                                    : `M ${EARTH_EYE_CX} ${100 - EARTH_EYE_R} A ${EARTH_EYE_R} ${EARTH_EYE_R} 0 0 0 ${EARTH_EYE_CX} ${100 + EARTH_EYE_R} A ${Math.abs(eyeTermX)} ${EARTH_EYE_R} 0 0 ${eyeTermX > 0 ? 1 : 0} ${EARTH_EYE_CX} ${100 - EARTH_EYE_R}`
                                }
                                fill="#E8E0D0"
                            />

                            {/* Craters for texture */}
                            <Circle cx={EARTH_EYE_CX - 18} cy={90} r={9} fill="rgba(0,0,0,0.06)" />
                            <Circle cx={EARTH_EYE_CX + 12} cy={115} r={7} fill="rgba(0,0,0,0.05)" />
                            <Circle cx={EARTH_EYE_CX - 6} cy={120} r={5} fill="rgba(0,0,0,0.04)" />
                            <Circle cx={EARTH_EYE_CX + 25} cy={88} r={4} fill="rgba(0,0,0,0.04)" />

                            {/* Moon outline */}
                            <Circle cx={EARTH_EYE_CX} cy={100} r={EARTH_EYE_R}
                                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

                            {/* Phase name */}
                            <SvgText x={EARTH_EYE_CX} y={200} fontSize={13} fontWeight="bold"
                                textAnchor="middle" fill={isSpinning ? '#FFD54F' : 'rgba(255,255,255,0.6)'}>
                                {displayPhase.icon} {displayPhase.name}
                            </SvgText>
                        </Svg>
                    </View>
                    <Text style={styles.spinHint}>
                        {isSpinning
                            ? `${displayPhase.icon} ${displayPhase.name} — ${Math.round(getIlluminationPercent(displayMoonAge))}% illuminated`
                            : '☝️ Drag here too — both views stay synced'}
                    </Text>
                </View>

                {/* All 8 phases reference */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 The 8 Lunar Phases</Text>
                    {MOON_PHASES.map(p => (
                        <View key={p.name} style={[styles.phaseRow, p.name === phase.name && { backgroundColor: 'rgba(255,213,79,0.1)', borderRadius: 8 }]}>
                            <Text style={styles.phaseRowIcon}>{p.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.phaseRowName, p.name === phase.name && { color: '#FFD54F' }]}>{p.name}</Text>
                                <Text style={styles.phaseRowDesc}>Days {p.range[0].toFixed(1)}–{p.range[1].toFixed(1)}</Text>
                            </View>
                            {p.name === phase.name && <Text style={{ color: '#FFD54F', fontWeight: '900' }}>← YOU</Text>}
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10 },
    birthDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 },
    moonContainer: { alignItems: 'center', marginBottom: 20 },
    phaseIcon: { fontSize: 32, marginTop: 8 },
    phaseName: { fontSize: 22, fontWeight: '900', color: '#FFE082', marginTop: 4 },
    illuminationText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginBottom: 8 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    tag: { backgroundColor: 'rgba(255,213,79,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
    tagText: { color: '#FFE082', fontSize: 12, fontWeight: '700' },
    shadowText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 4 },
    moonSignDetail: { marginBottom: 8 },
    detailLabel: { fontSize: 12, color: '#FFE082', fontWeight: '700', marginBottom: 2 },
    detailText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    gaugeHint: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 6 },
    cycleText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 4 },
    phaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 6, gap: 10 },
    phaseRowIcon: { fontSize: 22 },
    phaseRowName: { fontSize: 14, fontWeight: '700', color: '#fff' },
    phaseRowDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
    orbitalWheelWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
    spinHint: { fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 2 },
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
});
