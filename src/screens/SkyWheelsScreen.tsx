import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Circle, G, Path, Svg, Text as SvgText } from 'react-native-svg';
import EclipticWheel from '../../components/EclipticWheel';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getCityCoordinates } from '../data/utils/town-coordinates';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SkyWheels'>;

// ── Moon phase helpers (Meeus algorithm) ──
function toJDE(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
    let Y = y, M = m;
    if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5;
}

const degToRadM = (d: number) => d * Math.PI / 180;
const normDeg = (d: number) => ((d % 360) + 360) % 360;

function sunLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mr = degToRadM(M);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
    const omega = degToRadM(125.04 - 1934.136 * T);
    return normDeg(L0 + C - 0.00569 - 0.00478 * Math.sin(omega));
}

function moonLongitude(jde: number): number {
    const T = (jde - 2451545.0) / 36525;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    const Lp = normDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
    const D = normDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
    const Mm = normDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
    const Mp = normDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
    const F = normDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
    const Dr = degToRadM(D), Mr = degToRadM(Mm), Mpr = degToRadM(Mp), Fr = degToRadM(F);
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    let sl = 0;
    sl += 6288774 * Math.sin(Mpr); sl += 1274027 * Math.sin(2 * Dr - Mpr); sl += 658314 * Math.sin(2 * Dr);
    sl += 213618 * Math.sin(2 * Mpr); sl += -185116 * Math.sin(Mr) * E; sl += -114332 * Math.sin(2 * Fr);
    sl += 58793 * Math.sin(2 * Dr - 2 * Mpr); sl += 57066 * Math.sin(2 * Dr - Mr - Mpr) * E;
    sl += 53322 * Math.sin(2 * Dr + Mpr); sl += 45758 * Math.sin(2 * Dr - Mr) * E;
    sl += -40923 * Math.sin(Mr - Mpr) * E; sl += -34720 * Math.sin(Dr);
    sl += -30383 * Math.sin(Mr + Mpr) * E; sl += 15327 * Math.sin(2 * Dr - 2 * Fr);
    sl += -12528 * Math.sin(Mpr + 2 * Fr); sl += 10980 * Math.sin(Mpr - 2 * Fr);
    sl += 10675 * Math.sin(4 * Dr - Mpr); sl += 10034 * Math.sin(3 * Mpr);
    sl += 8548 * Math.sin(4 * Dr - 2 * Mpr); sl += -7888 * Math.sin(2 * Dr + Mr - Mpr) * E;
    sl += -6766 * Math.sin(2 * Dr + Mr) * E; sl += -5163 * Math.sin(Dr - Mpr);
    sl += 4987 * Math.sin(Dr + Mr) * E; sl += 4036 * Math.sin(2 * Dr - Mr + Mpr) * E;
    return normDeg(Lp + sl / 1000000);
}

function getMoonAge(date: Date): number {
    const jde = toJDE(date);
    return normDeg(moonLongitude(jde) - sunLongitude(jde)) / 360 * 29.530588853;
}

const MOON_PHASES = [
    { name: 'New Moon', icon: '🌑' },
    { name: 'Waxing Crescent', icon: '🌒' },
    { name: 'First Quarter', icon: '🌓' },
    { name: 'Waxing Gibbous', icon: '🌔' },
    { name: 'Full Moon', icon: '🌕' },
    { name: 'Waning Gibbous', icon: '🌖' },
    { name: 'Last Quarter', icon: '🌗' },
    { name: 'Waning Crescent', icon: '🌘' },
];

function getMoonPhaseName(moonAge: number) {
    const frac = (moonAge / 29.530588853) % 1;
    if (frac < 0.0625 || frac >= 0.9375) return MOON_PHASES[0];
    if (frac < 0.1875) return MOON_PHASES[1];
    if (frac < 0.3125) return MOON_PHASES[2];
    if (frac < 0.4375) return MOON_PHASES[3];
    if (frac < 0.5625) return MOON_PHASES[4];
    if (frac < 0.6875) return MOON_PHASES[5];
    if (frac < 0.8125) return MOON_PHASES[6];
    return MOON_PHASES[7];
}

// ── Zodiac helpers ──
const getZodiacFromDegree = (degree: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(degree / 30) % 12];
};

export default function SkyWheelsScreen({ route }: Props) {
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate + 'T00:00:00'));
    const initialTime = route.params.birthTime || '12:00 PM';
    const [birthTime] = useState(() => {
        if (initialTime.includes('AM') || initialTime.includes('PM')) {
            const match = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2];
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                return `${h.toString().padStart(2, '0')}:${m}`;
            }
        }
        return '12:00';
    });
    const [birthLocation] = useState(route.params.birthLocation || '');

    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const originalBirthDateRef = useRef(new Date(route.params.birthDate + 'T00:00:00'));
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate + 'T00:00:00'), [route.params.birthDate]);
    const scrollRef = useRef<ScrollView>(null);

    // ── Date mode & step system (matches Solar System Time Machine) ──
    const [dateMode, setDateMode] = useState<'birth' | 'today'>('birth');
    const baseDateRef = useRef(new Date(route.params.birthDate + 'T00:00:00'));
    const steps = [
        { label: '24hr', days: 1, sliderDays: 60 },
        { label: '7 days', days: 7, sliderDays: 365 },
        { label: '1 month', days: 30.4375, sliderDays: 1826 },
        { label: '2.5 yrs', days: 913.125, sliderDays: 7305 },
    ];
    const [selectedStepIdx, setSelectedStepIdx] = useState(0);
    const selectedStepRef = useRef(steps[0].days);
    const sliderDaysRef = useRef(steps[0].sliderDays);
    const FIVE_YEARS_MS = 5 * 365.25 * 86400000;
    const END_2050_MS = Date.UTC(2050, 0, 1);

    // Coordinates
    const coordinates = useMemo(() => {
        if (birthLocation) {
            const coords = getCityCoordinates(birthLocation);
            if (coords) return { lat: coords.lat, lng: coords.lng };
        }
        return { lat: 40.7128, lng: -74.0060 };
    }, [birthLocation]);

    const [hours, minutes] = birthTime.split(':').map(Number);
    const adjustedBirthDate = useMemo(() => {
        const d = new Date(birthDate.getTime());
        d.setHours(hours || 12, minutes || 0, 0, 0);
        return d;
    }, [birthDate, hours, minutes]);

    const natalChart = useMemo(() => calculateNatalChart(adjustedBirthDate, coordinates.lat, coordinates.lng), [adjustedBirthDate, coordinates]);

    // Shared date-change helper (matches Solar System applyOffset pattern)
    const applyOffset = useCallback((newOffset: number) => {
        const stepDays = selectedStepRef.current;
        const snapped = Math.round(newOffset / stepDays) * stepDays;
        const baseMs = baseDateRef.current.getTime();
        const minOff = (originalBirthDate.getTime() - FIVE_YEARS_MS - baseMs) / 86400000;
        const maxOff = (END_2050_MS - baseMs) / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, snapped));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setBirthDate(new Date(baseMs + clamped * 86400000));
    }, []);

    // Alias for EclipticWheel compatibility
    const changeDate = applyOffset;

    const switchDateMode = useCallback((mode: 'birth' | 'today') => {
        setDateMode(mode);
        dayOffsetRef.current = 0;
        setDayOffset(0);
        const base = mode === 'today' ? new Date() : new Date(originalBirthDate.getTime());
        baseDateRef.current = base;
        setBirthDate(base);
    }, [originalBirthDate]);

    const selectStep = useCallback((idx: number) => {
        setSelectedStepIdx(idx);
        selectedStepRef.current = steps[idx].days;
        sliderDaysRef.current = steps[idx].sliderDays;
        const stepDays = steps[idx].days;
        const snapped = Math.round(dayOffsetRef.current / stepDays) * stepDays;
        const baseMs = baseDateRef.current.getTime();
        const minOff = (originalBirthDate.getTime() - FIVE_YEARS_MS - baseMs) / 86400000;
        const maxOff = (END_2050_MS - baseMs) / 86400000;
        const clamped = Math.max(minOff, Math.min(maxOff, snapped));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setBirthDate(new Date(baseMs + clamped * 86400000));
    }, []);

    const formatOffset = (offset: number) => {
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? '+' : '\u2212';
        const modeLabel = dateMode === 'today' ? 'from today' : 'from birth';
        if (absOffset < 1) {
            const hrs = Math.round(absOffset * 24);
            return `${sign}${hrs} hr${hrs !== 1 ? 's' : ''} ${modeLabel}`;
        }
        const totalDays = Math.round(absOffset);
        if (totalDays < 30) return `${sign}${totalDays} day${totalDays !== 1 ? 's' : ''} ${modeLabel}`;
        if (totalDays < 365) {
            const months = Math.floor(totalDays / 30.4375);
            const remDays = Math.round(totalDays - months * 30.4375);
            if (remDays === 0) return `${sign}${months} mo${months !== 1 ? 's' : ''} ${modeLabel}`;
            return `${sign}${months}mo ${remDays}d ${modeLabel}`;
        }
        const years = Math.floor(totalDays / 365.25);
        const remDays = Math.round(totalDays - years * 365.25);
        if (remDays === 0) return `${sign}${years} yr${years !== 1 ? 's' : ''} ${modeLabel}`;
        return `${sign}${years}y ${remDays}d ${modeLabel}`;
    };

    // Slider position calculations
    const baseMs = baseDateRef.current.getTime();
    const fullMinOff = (originalBirthDate.getTime() - FIVE_YEARS_MS - baseMs) / 86400000;
    const fullMaxOff = (END_2050_MS - baseMs) / 86400000;
    const fullRange = fullMaxOff - fullMinOff;
    const sliderFrac = fullRange > 0 ? (dayOffset - fullMinOff) / fullRange : 0.5;
    const sliderCenterFrac = fullRange > 0 ? (0 - fullMinOff) / fullRange : 0.5;

    // ── Time Slider ──
    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);
    const sliderStartOffsetRef = useRef(0);
    const sliderPan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                sliderStartOffsetRef.current = dayOffsetRef.current;
            },
            onPanResponderMove: (_, gesture) => {
                const totalRange = sliderDaysRef.current;
                const rawOffset = sliderStartOffsetRef.current + (gesture.dx / sliderWRef.current) * totalRange;
                applyOffset(rawOffset);
            },
            onPanResponderRelease: () => { },
        })
    ).current;

    // ── Natal Chart constants ──
    const chartRotation = 270 - (natalChart.ascendant || 0);
    const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const planetSymbols: Record<string, string> = { 'Sun': '☀', 'Moon': '●', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇' };

    // ── Moon orbital data ──
    const moonAge = getMoonAge(birthDate);
    const displayMoonAge = ((moonAge % 29.53) + 29.53) % 29.53;
    const displayPhase = getMoonPhaseName(displayMoonAge);

    return (
        <LinearGradient colors={['#1a237e', '#283593', '#3949ab']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.pageTitle}>🎡 Sky Wheels</Text>
                <Text style={styles.pageSubtitle}>
                    {birthDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                {/* ═══ ECLIPTIC ZODIAC BELT ═══ */}
                {(() => {
                    const screenW = Dimensions.get('window').width;
                    const j2000d = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
                    const d2k = (birthDate.getTime() - j2000d.getTime()) / 86400000;
                    // Compute user's sun sign from birth date
                    const sunLon = ((280.46 + 0.9856 * d2k) % 360 + 360) % 360;
                    const userSign = getZodiacFromDegree(sunLon);
                    return (
                        <EclipticWheel
                            width={screenW - 24}
                            daysSinceJ2000={d2k}
                            userSign={userSign}
                            onDaysChange={(newD2k) => {
                                // Convert J2000 days back to a day offset from original birth date
                                const origD2k = (originalBirthDateRef.current.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) / 86400000;
                                changeDate(newD2k - origD2k);
                            }}
                        />
                    );
                })()}

                {/* ═══ SKY WHEELS — 2×2 GRID ═══ */}
                {(() => {
                    const screenW = Dimensions.get('window').width;
                    const tileW = (screenW - 40) / 2; // 12 padding each side + 16 gap
                    const j2000d = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
                    const daysSinceJ2kDash = (birthDate.getTime() - j2000d.getTime()) / 86400000;

                    // Mini natal chart
                    const miniSize = tileW - 8;
                    const mCx = miniSize / 2; const mCy = miniSize / 2;
                    const mOuter = miniSize * 0.45; const mSign = miniSize * 0.38; const mPlanet = miniSize * 0.27;

                    // Mini solar system
                    const miniSolarPlanets = [
                        { sym: '☿', L0: 252.25, rate: 4.09233, au: 0.387, color: '#B0B0B0' },
                        { sym: '♀', L0: 181.98, rate: 1.60213, au: 0.723, color: '#FFD700' },
                        { sym: '🌍', L0: 100.47, rate: 0.98560, au: 1.000, color: '#4FC3F7' },
                        { sym: '♂', L0: 355.45, rate: 0.52403, au: 1.524, color: '#FF6B35' },
                        { sym: '♃', L0: 34.40, rate: 0.08309, au: 5.203, color: '#FFB74D' },
                        { sym: '♄', L0: 50.08, rate: 0.03346, au: 9.537, color: '#BCAAA4' },
                        { sym: '♅', L0: 314.06, rate: 0.01173, au: 19.19, color: '#80DEEA' },
                        { sym: '♆', L0: 304.35, rate: 0.00598, au: 30.07, color: '#5C6BC0' },
                    ];
                    const ssMaxAU = 35; const ssMaxR = miniSize * 0.44; const ssMinR = miniSize * 0.08;
                    const ssScale = (au: number) => ssMinR + (ssMaxR - ssMinR) * Math.sqrt(Math.min(au, ssMaxAU) / ssMaxAU);

                    // Interstellar objects — hyperbolic trajectories
                    // Each has: perihelion date (ms), perihelion distance (AU), eccentricity, perihelion ecliptic longitude
                    const interstellarObjs = [
                        { name: '1I', sym: '1I', periDate: Date.UTC(2017, 8, 9), q: 0.255, e: 1.1995, periLong: 115, color: '#FF5252' },   // 'Oumuamua
                        { name: '2I', sym: '2I', periDate: Date.UTC(2019, 11, 8), q: 2.007, e: 3.3572, periLong: 218, color: '#69F0AE' },  // Borisov
                        { name: '3I', sym: '3I', periDate: Date.UTC(2025, 9, 29), q: 1.36, e: 5.18, periLong: 200, color: '#FFAB40' },     // ATLAS
                    ];
                    const computeInterstellar = (obj: typeof interstellarObjs[0]) => {
                        const dtDays = (birthDate.getTime() - obj.periDate) / 86400000;
                        // Approx distance from Sun using hyperbolic Kepler: r ≈ q * (1 + e) / (1 + e * cos(trueAnomaly))
                        // For simplicity, use energy equation: v²=GM(2/r - 1/a), with a = -q/(e-1)
                        const a = -obj.q / (obj.e - 1);
                        const mu = 0.01720209895 * 0.01720209895; // GM in AU³/day²
                        const n = Math.sqrt(mu / Math.abs(a * a * a)); // mean motion for hyperbola
                        const M = n * dtDays; // mean anomaly
                        // Solve hyperbolic Kepler's equation M = e*sinh(H) - H
                        let H = M;
                        for (let i = 0; i < 20; i++) {
                            const dH = (obj.e * Math.sinh(H) - H - M) / (obj.e * Math.cosh(H) - 1);
                            H -= dH;
                            if (Math.abs(dH) < 1e-10) break;
                        }
                        // True anomaly
                        const tanHalfNu = Math.sqrt((obj.e + 1) / (obj.e - 1)) * Math.tanh(H / 2);
                        const nu = 2 * Math.atan(tanHalfNu);
                        // Distance
                        const r = obj.q * (1 + obj.e) / (1 + obj.e * Math.cos(nu));
                        // Ecliptic longitude
                        const lng = obj.periLong + (nu * 180 / Math.PI);
                        return { r: Math.abs(r), lng, visible: Math.abs(r) < ssMaxAU };
                    };
                    const interstellarPositions = interstellarObjs.map(o => ({ ...o, pos: computeInterstellar(o) }));

                    // Mini moon
                    const miniMoonR = miniSize * 0.28;
                    const miniMoonCx = miniSize / 2;
                    const miniMoonAngle = Math.PI + (displayMoonAge / 29.53) * 2 * Math.PI;
                    const miniMx = miniMoonCx + miniMoonR * Math.cos(miniMoonAngle);
                    const miniMy = miniMoonCx + miniMoonR * Math.sin(miniMoonAngle);

                    // Mini geocentric
                    const geoSpheres = [
                        { sym: '☽', r: miniSize * 0.14, color: '#C0C0C0', L0: 218.32, rate: 13.17640 },
                        { sym: '☿', r: miniSize * 0.20, color: '#B0B0B0', L0: 252.25, rate: 4.09233 },
                        { sym: '♀', r: miniSize * 0.26, color: '#FFD700', L0: 181.98, rate: 1.60213 },
                        { sym: '☀', r: miniSize * 0.32, color: '#FFD54F', L0: 280.46, rate: 0.98565, isSun: true },
                        { sym: '♂', r: miniSize * 0.38, color: '#FF6B35', L0: 355.45, rate: 0.52403 },
                        { sym: '♃', r: miniSize * 0.42, color: '#FFB74D', L0: 34.40, rate: 0.08309 },
                        { sym: '♄', r: miniSize * 0.46, color: '#BCAAA4', L0: 50.08, rate: 0.03346 },
                    ];

                    const dRad = (deg: number) => (deg * Math.PI) / 180;

                    return (
                        <View style={styles.gridContainer}>
                            <View style={styles.gridInner}>
                                {/* Tile 1: Natal Chart */}
                                <View style={[styles.dashboardTile, { width: tileW, height: tileW }]}>
                                    <Svg width={miniSize} height={miniSize}>
                                        <Circle cx={mCx} cy={mCy} r={mOuter} stroke="#fff" strokeWidth={1} fill="#000" />
                                        <Circle cx={mCx} cy={mCy} r={mSign} stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} fill="none" />
                                        {signSymbols.map((sym, i) => {
                                            const angle = i * 30 + chartRotation + 15;
                                            const rad = dRad(angle - 90);
                                            const lx = mCx + ((mSign + mOuter) / 2) * Math.cos(rad);
                                            const ly = mCy + ((mSign + mOuter) / 2) * Math.sin(rad);
                                            return <SvgText key={i} x={lx} y={ly} fill="#fff" fontSize={10} fontWeight="900" textAnchor="middle" alignmentBaseline="middle">{sym}</SvgText>;
                                        })}
                                        {natalChart.planets.slice(0, 10).map((planet: any) => {
                                            const rad = dRad(planet.longitude + chartRotation - 90);
                                            const px = mCx + mPlanet * Math.cos(rad);
                                            const py = mCy + mPlanet * Math.sin(rad);
                                            return <SvgText key={planet.name} x={px} y={py} fill={planet.name === 'Sun' ? '#ffd54f' : '#fff'} fontSize={10} fontWeight="900" textAnchor="middle" alignmentBaseline="middle">{planetSymbols[planet.name] || '●'}</SvgText>;
                                        })}
                                        <Circle cx={mCx} cy={mCy} r={8} fill="#1a6fc4" />
                                    </Svg>
                                    <Text style={styles.dashboardTileLabel}>Natal Chart</Text>
                                    <Text style={styles.dashboardTileDesc}>Planet positions in the zodiac at birth</Text>
                                </View>

                                {/* Tile 2: Solar System */}
                                <View style={[styles.dashboardTile, { width: tileW, height: tileW }]}>
                                    <Svg width={miniSize} height={miniSize}>
                                        <Circle cx={mCx} cy={mCy} r={miniSize * 0.47} fill="#05051a" />
                                        {miniSolarPlanets.map((p, i) => <Circle key={i} cx={mCx} cy={mCy} r={ssScale(p.au)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />)}
                                        <Circle cx={mCx} cy={mCy} r={10} fill="#FFD54F" />
                                        {miniSolarPlanets.map((p, i) => {
                                            const ml = ((p.L0 + p.rate * daysSinceJ2kDash) % 360 + 360) % 360;
                                            const rad = dRad(ml - 90);
                                            const r = ssScale(p.au);
                                            return <G key={i}><Circle cx={mCx + r * Math.cos(rad)} cy={mCy + r * Math.sin(rad)} r={3.5} fill={p.color} /><SvgText x={mCx + r * Math.cos(rad)} y={mCy + r * Math.sin(rad) + 3} fontSize={6} textAnchor="middle">{p.sym}</SvgText></G>;
                                        })}
                                        {interstellarPositions.filter(o => o.pos.visible).map(o => {
                                            const rad = dRad(o.pos.lng - 90);
                                            const r = ssScale(o.pos.r);
                                            return <G key={o.name}><Circle cx={mCx + r * Math.cos(rad)} cy={mCy + r * Math.sin(rad)} r={3} fill={o.color} strokeWidth={0.5} stroke="#fff" /><SvgText x={mCx + r * Math.cos(rad)} y={mCy + r * Math.sin(rad) - 4} fontSize={4} fill={o.color} fontWeight="700" textAnchor="middle">{o.sym}</SvgText></G>;
                                        })}
                                    </Svg>
                                    <Text style={styles.dashboardTileLabel}>Solar System</Text>
                                    <Text style={styles.dashboardTileDesc}>Where the planets were orbiting the Sun</Text>
                                </View>

                                {/* Tile 3: Moon Phase */}
                                <View style={[styles.dashboardTile, { width: tileW, height: tileW }]}>
                                    <Svg width={miniSize} height={miniSize}>
                                        <Circle cx={miniMoonCx} cy={miniMoonCx} r={miniSize * 0.47} fill="#050520" />
                                        <Circle cx={miniMoonCx} cy={miniMoonCx} r={miniMoonR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} strokeDasharray="4,3" />
                                        <Circle cx={miniMoonCx} cy={miniMoonCx} r={12.5} fill="#1565C0" />
                                        <SvgText x={miniMoonCx} y={miniMoonCx + 4} fontSize={10} textAnchor="middle">🌍</SvgText>
                                        <Circle cx={miniMx} cy={miniMy} r={10} fill="#222" />
                                        {(() => {
                                            const mr = 10;
                                            const p = displayMoonAge / 29.53;
                                            if (p < 0.02 || p > 0.98) return null;
                                            if (p > 0.48 && p < 0.52) return <Circle cx={miniMx} cy={miniMy} r={mr} fill="#E8E8C8" />;
                                            const cosP = Math.cos(p * 2 * Math.PI);
                                            const termRx = mr * Math.abs(cosP);
                                            const litOnRight = p < 0.5;
                                            const sO = litOnRight ? 1 : 0;
                                            const sT = cosP > 0 ? (litOnRight ? 0 : 1) : (litOnRight ? 1 : 0);
                                            return <Path d={`M ${miniMx} ${miniMy - mr} A ${mr} ${mr} 0 0 ${sO} ${miniMx} ${miniMy + mr} A ${termRx} ${mr} 0 0 ${sT} ${miniMx} ${miniMy - mr} Z`} fill="#E8E8C8" />;
                                        })()}
                                        <SvgText x={miniMoonCx} y={miniSize - 6} fontSize={9} fontWeight="bold" textAnchor="middle" fill="#FFD54F">{displayPhase.icon} {displayPhase.name}</SvgText>
                                        <SvgText x={10} y={miniMoonCx + 4} fontSize={20} textAnchor="middle">☀️</SvgText>
                                    </Svg>
                                    <Text style={styles.dashboardTileLabel}>Moon Phase</Text>
                                    <Text style={styles.dashboardTileDesc}>The Moon's illumination and orbit stage</Text>
                                </View>

                                {/* Tile 4: Geocentric */}
                                <View style={[styles.dashboardTile, { width: tileW, height: tileW }]}>
                                    <Svg width={miniSize} height={miniSize}>
                                        <Circle cx={mCx} cy={mCy} r={miniSize * 0.47} fill="#040418" />
                                        {geoSpheres.map((s, i) => <Circle key={i} cx={mCx} cy={mCy} r={s.r} fill="none" stroke={s.color} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.4} />)}
                                        <Circle cx={mCx} cy={mCy} r={miniSize * 0.07} fill="#1a3a4a" stroke="#4FC3F7" strokeWidth={1} />
                                        <SvgText x={mCx} y={mCy + 4} fontSize={8} textAnchor="middle">🌍</SvgText>
                                        {geoSpheres.map((s, i) => {
                                            const lng = (s.L0 + s.rate * daysSinceJ2kDash) % 360;
                                            const rad = dRad(lng - 90);
                                            const sx = mCx + s.r * Math.cos(rad);
                                            const sy = mCy + s.r * Math.sin(rad);
                                            if ((s as any).isSun) {
                                                return <G key={i}><Circle cx={sx} cy={sy} r={8} fill="#FFD54F" opacity={0.25} /><Circle cx={sx} cy={sy} r={5.5} fill="#FFD54F" /><SvgText x={sx} y={sy + 4} fontSize={8} textAnchor="middle">☀</SvgText></G>;
                                            }
                                            return <G key={i}><Circle cx={sx} cy={sy} r={3.5} fill={s.color} opacity={0.9} /><SvgText x={sx} y={sy + 3} fontSize={6} textAnchor="middle">{s.sym}</SvgText></G>;
                                        })}
                                    </Svg>
                                    <Text style={styles.dashboardTileLabel}>Geocentric</Text>
                                    <Text style={styles.dashboardTileDesc}>The sky as seen from Earth's perspective</Text>
                                </View>
                            </View>
                        </View>
                    );
                })()}

                {/* ═══ DATE MODE TOGGLE ═══ */}
                <View style={styles.dateModeRow}>
                    <TouchableOpacity
                        onPress={() => switchDateMode('birth')}
                        style={[styles.dateModeBtn, dateMode === 'birth' && styles.dateModeBtnActive]}
                    >
                        <Text style={[styles.dateModeBtnText, dateMode === 'birth' && styles.dateModeBtnTextActive]}>🎂 Birth Date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => switchDateMode('today')}
                        style={[styles.dateModeBtn, dateMode === 'today' && styles.dateModeBtnActive]}
                    >
                        <Text style={[styles.dateModeBtnText, dateMode === 'today' && styles.dateModeBtnTextActive]}>📅 Today's Date</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══ TIME TRAVEL CONTROLS ═══ */}
                <View style={styles.sliderSection}>
                    <Text style={styles.sliderTitle}>⏳ Time Travel</Text>
                    <Text style={styles.sliderDateText}>
                        {birthDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    {dayOffset !== 0 && (
                        <Text style={styles.sliderOffsetText}>{formatOffset(dayOffset)}</Text>
                    )}
                    {/* Increment selector */}
                    <View style={styles.stepSelectorRow}>
                        {steps.map((s, idx) => (
                            <TouchableOpacity
                                key={s.label}
                                style={[styles.stepSelectorBtn, idx === selectedStepIdx && styles.stepSelectorBtnActive]}
                                onPress={() => selectStep(idx)}
                            >
                                <Text style={[styles.stepSelectorText, idx === selectedStepIdx && styles.stepSelectorTextActive]}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View
                        style={styles.sliderTrackOuter}
                        onLayout={(e) => { const w = e.nativeEvent.layout.width; sliderWRef.current = w; setSliderW(w); }}
                        {...sliderPan.panHandlers}
                    >
                        <View style={styles.sliderTrack} />
                        <View style={[styles.sliderCenterMark, { left: sliderCenterFrac * sliderW - 1 }]} />
                        <View style={[styles.sliderThumb, { left: Math.max(0, Math.min(sliderW - 24, sliderFrac * sliderW - 12)) }]} />
                    </View>
                    <View style={styles.sliderLabelsRow}>
                        <Text style={styles.sliderEndLabel}>{new Date(baseMs + fullMinOff * 86400000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</Text>
                        <Text style={styles.sliderEndLabel}>{new Date(baseMs + fullMaxOff * 86400000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</Text>
                    </View>

                    {/* Forward / Back / Reset */}
                    <View style={styles.stepRow}>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => applyOffset(dayOffsetRef.current - steps[selectedStepIdx].days)}>
                            <Text style={styles.stepBtnText}>◀ {steps[selectedStepIdx].label}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.stepBtn, { backgroundColor: 'rgba(255,213,79,0.15)' }]} onPress={() => applyOffset(0)}>
                            <Text style={[styles.stepBtnText, { color: '#FFD54F' }]}>⟲ Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => applyOffset(dayOffsetRef.current + steps[selectedStepIdx].days)}>
                            <Text style={styles.stepBtnText}>{steps[selectedStepIdx].label} ▶</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 12, paddingBottom: 40 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 8 },
    pageSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 12 },
    gridContainer: {
        marginBottom: 16,
    },
    gridInner: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    dashboardTile: {
        backgroundColor: '#0a0a2a',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden',
        paddingTop: 6,
    },
    dashboardTileLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 1,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    dashboardTileDesc: {
        fontSize: 8,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        marginBottom: 5,
        paddingHorizontal: 6,
    },
    sliderSection: {
        marginBottom: 14,
        paddingHorizontal: 8,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    sliderTitle: { fontSize: 16, fontWeight: '800', color: '#FFD54F', textAlign: 'center', marginBottom: 4 },
    sliderDateText: { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 2 },
    sliderOffsetText: { fontSize: 12, fontWeight: '600', color: '#FFD54F', textAlign: 'center', marginBottom: 6 },
    sliderTrackOuter: {
        height: 44,
        justifyContent: 'center',
        marginHorizontal: 4,
        marginVertical: 8,
    },
    sliderTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
    },
    sliderCenterMark: {
        position: 'absolute',
        width: 2,
        height: 20,
        backgroundColor: 'rgba(255,213,79,0.5)',
        borderRadius: 1,
        top: 12,
    },
    sliderThumb: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFD54F',
        borderWidth: 2,
        borderColor: '#fff',
        top: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    sliderLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    sliderEndLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    sliderResetLabel: { fontSize: 13, fontWeight: '700', color: '#FFD54F' },
    dateModeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 12,
    },
    dateModeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    dateModeBtnActive: {
        backgroundColor: 'rgba(255,213,79,0.2)',
        borderColor: '#FFD54F',
    },
    dateModeBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
    },
    dateModeBtnTextActive: {
        color: '#FFD54F',
    },
    stepSelectorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 4,
        marginTop: 4,
    },
    stepSelectorBtn: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    stepSelectorBtnActive: {
        backgroundColor: 'rgba(255,213,79,0.2)',
        borderColor: '#FFD54F',
    },
    stepSelectorText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
    },
    stepSelectorTextActive: {
        color: '#FFD54F',
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        gap: 4,
    },
    stepBtn: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 1,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    stepBtnText: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
    },
});
