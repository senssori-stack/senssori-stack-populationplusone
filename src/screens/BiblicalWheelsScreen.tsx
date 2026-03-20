import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Circle, Defs, Ellipse, G, Line, Path, Rect, Stop, Svg, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BiblicalWheels'>; // biblical cosmology screen

export default function BiblicalWheelsScreen({ route, navigation }: Props) {
    const originalBirthDate = useMemo(() => new Date(route.params.birthDate + 'T00:00:00'), [route.params.birthDate]);
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate + 'T00:00:00'));

    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const SLIDER_RANGE = 30; // ±30 days (full moon cycle)

    const sliderWRef = useRef(300);
    const [sliderW, setSliderW] = useState(300);

    const applyOffset = useCallback((newOffset: number) => {
        const clamped = Math.max(-SLIDER_RANGE, Math.min(SLIDER_RANGE, newOffset));
        dayOffsetRef.current = clamped;
        setDayOffset(clamped);
        setBirthDate(new Date(originalBirthDate.getTime() + clamped * 86400000));
    }, [SLIDER_RANGE, originalBirthDate]);

    const lastAngleRef = useRef(0);
    const wheelPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
            onPanResponderGrant: () => { setIsSpinning(true); lastAngleRef.current = 0; },
            onPanResponderMove: (_, gesture) => {
                const angleDelta = gesture.dx * 0.5;
                const dayDelta = angleDelta - lastAngleRef.current;
                lastAngleRef.current = angleDelta;
                applyOffset(dayOffsetRef.current + dayDelta);
            },
            onPanResponderRelease: () => setIsSpinning(false),
        })
    ).current;

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
                applyOffset(sliderStartOffsetRef.current + gesture.dx * daysPerPixel);
            },
            onPanResponderRelease: () => { },
        })
    ).current;
    const jumpToToday = useCallback(() => {
        const today = new Date();
        const offsetDays = (today.getTime() - originalBirthDate.getTime()) / 86400000;
        dayOffsetRef.current = offsetDays;
        setDayOffset(offsetDays);
        setBirthDate(today);
    }, [originalBirthDate]);
    const formatOffset = (offset: number) => {
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? '+' : '\u2212';
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

    // Compute sun & moon positions from the date
    const dayOfYear = useMemo(() => {
        const start = new Date(birthDate.getFullYear(), 0, 0);
        const diff = birthDate.getTime() - start.getTime();
        return diff / 86400000;
    }, [birthDate]);

    // Moon age (simplified synodic calculation)
    const moonAge = useMemo(() => {
        const known = new Date(2000, 0, 6, 18, 14); // known new moon
        const diff = (birthDate.getTime() - known.getTime()) / 86400000;
        return ((diff % 29.530588853) + 29.530588853) % 29.530588853;
    }, [birthDate]);

    const moonPhase = useMemo(() => {
        const frac = moonAge / 29.530588853;
        if (frac < 0.0625 || frac >= 0.9375) return { name: 'New Moon', icon: '🌑' };
        if (frac < 0.1875) return { name: 'Waxing Crescent', icon: '🌒' };
        if (frac < 0.3125) return { name: 'First Quarter', icon: '🌓' };
        if (frac < 0.4375) return { name: 'Waxing Gibbous', icon: '🌔' };
        if (frac < 0.5625) return { name: 'Full Moon', icon: '🌕' };
        if (frac < 0.6875) return { name: 'Waning Gibbous', icon: '🌖' };
        if (frac < 0.8125) return { name: 'Last Quarter', icon: '🌗' };
        return { name: 'Waning Crescent', icon: '🌘' };
    }, [moonAge]);

    return (
        <LinearGradient colors={['#1a0a2e', '#0d0d2b', '#1a0a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0a2e" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>

                <View style={styles.header}>
                    <Text style={styles.emoji}>📜</Text>
                    <Text style={styles.title}>Biblical Cosmology{'\n'}Wheel</Text>
                    <Text style={styles.subtitle}>
                        {originalBirthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📜 The Biblical Cosmos</Text>
                    <Text style={styles.sectionExplainer}>
                        The Hebrew Bible describes a layered cosmos very different from the Greek spheres. Earth is a flat disc resting on pillars, covered by a solid dome called the Firmament (Raqia). The Sun, Moon, and stars are set INSIDE this dome. Above the dome are the "waters above" — a cosmic ocean — and above everything sits God's throne in the highest heaven.{"\n\n"}Below the Earth lies the Great Deep (Tehom) — primordial waters — and beneath that, Sheol, the realm of the dead.{"\n\n"}This wheel shows the complete Biblical model as a circular diagram with the Sun and Moon moving through the firmament based on the date shown.
                    </Text>

                    <View style={styles.spinHint}>
                        <Text style={styles.spinHintText}>👆 Spin the wheel or use the slider to travel through time!</Text>
                        <Text style={styles.spinHintDetail}>
                            Watch the Sun trace its path and the Moon change phase through the firmament.
                        </Text>
                    </View>

                    {(() => {
                        const size = 402;
                        const cx = size / 2;
                        const cy = size / 2;

                        // Sun angle: full circle over a year, starting from east (right side)
                        const sunAngle = ((dayOfYear / 365.25) * 360 + 90) % 360; // 0° = east, goes clockwise
                        const sunRad = (sunAngle - 90) * Math.PI / 180;
                        const sunOrbitR = size * 0.28;
                        const sunX = cx + sunOrbitR * Math.cos(sunRad);
                        const sunY = cy + sunOrbitR * Math.sin(sunRad);

                        // Moon angle: full circle in ~29.5 days
                        const moonAngle = ((moonAge / 29.530588853) * 360 + 90) % 360;
                        const moonRad = (moonAngle - 90) * Math.PI / 180;
                        const moonOrbitR = size * 0.22;
                        const moonX = cx + moonOrbitR * Math.cos(moonRad);
                        const moonY = cy + moonOrbitR * Math.sin(moonRad);

                        // Stars — 7 classical "wandering stars" (planets) at fixed decorative positions
                        const stars = [
                            { name: '⭐', angle: 15, r: size * 0.35 },
                            { name: '⭐', angle: 55, r: size * 0.38 },
                            { name: '⭐', angle: 100, r: size * 0.34 },
                            { name: '⭐', angle: 145, r: size * 0.37 },
                            { name: '⭐', angle: 200, r: size * 0.36 },
                            { name: '⭐', angle: 250, r: size * 0.33 },
                            { name: '⭐', angle: 300, r: size * 0.39 },
                            { name: '✦', angle: 35, r: size * 0.40 },
                            { name: '✦', angle: 80, r: size * 0.42 },
                            { name: '✦', angle: 130, r: size * 0.41 },
                            { name: '✦', angle: 175, r: size * 0.43 },
                            { name: '✦', angle: 220, r: size * 0.40 },
                            { name: '✦', angle: 265, r: size * 0.42 },
                            { name: '✦', angle: 320, r: size * 0.41 },
                            { name: '✦', angle: 350, r: size * 0.44 },
                        ];

                        // "Windows of heaven" — gates through which rain falls
                        const windowAngles = [60, 120, 180, 240, 300, 360];

                        // Pillars of the earth
                        const pillarAngles = [210, 250, 290, 330];

                        return (
                            <View style={styles.wheelContainer} {...wheelPanResponder.panHandlers}>
                                {(isSpinning || dayOffset !== 0) && (
                                    <View style={styles.spinOverlay}>
                                        <Text style={styles.spinOverlayDate}>
                                            {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                        <Text style={styles.spinOverlayDelta}>
                                            {dayOffset === 0 ? 'Original Date' : `${dayOffset > 0 ? '+' : ''}${dayOffset} day${Math.abs(dayOffset) !== 1 ? 's' : ''}`}
                                        </Text>
                                    </View>
                                )}
                                <Svg width={size} height={size}>
                                    <Defs>
                                        <SvgLinearGradient id="heavenGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#FFD700" stopOpacity="0.3" />
                                            <Stop offset="1" stopColor="#FFD700" stopOpacity="0.05" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="watersAbove" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#1565C0" stopOpacity="0.4" />
                                            <Stop offset="1" stopColor="#42A5F5" stopOpacity="0.15" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="firmamentGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#1A237E" stopOpacity="0.9" />
                                            <Stop offset="1" stopColor="#0D47A1" stopOpacity="0.6" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="earthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#4E342E" stopOpacity="0.9" />
                                            <Stop offset="1" stopColor="#3E2723" stopOpacity="0.9" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#0D47A1" stopOpacity="0.7" />
                                            <Stop offset="1" stopColor="#01579B" stopOpacity="0.9" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="sheolGrad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#1B1B1B" stopOpacity="0.9" />
                                            <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                                        </SvgLinearGradient>
                                    </Defs>

                                    {/* Layer 7 (outermost): God's Throne / Highest Heaven */}
                                    <Circle cx={cx} cy={cy} r={size * 0.48} fill="url(#heavenGrad)" stroke="#FFD700" strokeWidth={2} />
                                    <SvgText x={cx} y={18} fill="#FFD700" fontSize={9} fontWeight="900" textAnchor="middle" opacity={0.9}>
                                        GOD'S THRONE — HIGHEST HEAVEN
                                    </SvgText>

                                    {/* Layer 6: Waters Above */}
                                    <Circle cx={cx} cy={cy} r={size * 0.44} fill="url(#watersAbove)" stroke="rgba(66,165,245,0.5)" strokeWidth={1.5} strokeDasharray="4,3" />
                                    <SvgText x={cx} y={32} fill="#42A5F5" fontSize={8} fontWeight="800" textAnchor="middle" opacity={0.85}>
                                        WATERS ABOVE THE FIRMAMENT
                                    </SvgText>

                                    {/* Windows of Heaven — small gate marks on the firmament */}
                                    {windowAngles.map((a, i) => {
                                        const wRad = (a - 90) * Math.PI / 180;
                                        const wR = size * 0.395;
                                        const wx = cx + wR * Math.cos(wRad);
                                        const wy = cy + wR * Math.sin(wRad);
                                        return (
                                            <G key={`window-${i}`}>
                                                <Line x1={wx - 4} y1={wy - 4} x2={wx + 4} y2={wy + 4} stroke="#42A5F5" strokeWidth={1.5} opacity={0.6} />
                                                <Line x1={wx + 4} y1={wy - 4} x2={wx - 4} y2={wy + 4} stroke="#42A5F5" strokeWidth={1.5} opacity={0.6} />
                                            </G>
                                        );
                                    })}

                                    {/* Layer 5: The Firmament (Raqia) — solid dome with stars */}
                                    <Circle cx={cx} cy={cy} r={size * 0.38} fill="url(#firmamentGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                                    <SvgText x={cx} y={cy - size * 0.32} fill="rgba(255,255,255,0.7)" fontSize={8} fontWeight="800" textAnchor="middle">
                                        THE FIRMAMENT (RAQIA)
                                    </SvgText>

                                    {/* Fixed stars embedded in the firmament */}
                                    {stars.map((s, i) => {
                                        const sRad = (s.angle - 90) * Math.PI / 180;
                                        const sx = cx + s.r * Math.cos(sRad);
                                        const sy = cy + s.r * Math.sin(sRad);
                                        return (
                                            <SvgText key={`star-${i}`} x={sx} y={sy}
                                                fill="#FFFDE7" fontSize={s.name === '⭐' ? 10 : 6} textAnchor="middle" alignmentBaseline="middle"
                                                opacity={s.name === '⭐' ? 0.9 : 0.5}>
                                                {s.name}
                                            </SvgText>
                                        );
                                    })}

                                    {/* Sun orbit path */}
                                    <Circle cx={cx} cy={cy} r={sunOrbitR} fill="none" stroke="rgba(255,213,79,0.2)" strokeWidth={1} strokeDasharray="4,4" />

                                    {/* Moon orbit path */}
                                    <Circle cx={cx} cy={cy} r={moonOrbitR} fill="none" stroke="rgba(200,200,200,0.15)" strokeWidth={0.8} strokeDasharray="3,3" />

                                    {/* Sun — the Greater Light */}
                                    <Circle cx={sunX} cy={sunY} r={16} fill="#FFA000" />
                                    <Circle cx={sunX} cy={sunY} r={12} fill="#FFD54F" />
                                    <Circle cx={sunX} cy={sunY} r={7} fill="#FFECB3" />
                                    {/* Sun glow */}
                                    <Circle cx={sunX} cy={sunY} r={22} fill="none" stroke="rgba(255,213,79,0.3)" strokeWidth={4} />
                                    <SvgText x={sunX} y={sunY + 28} fill="#FFD54F" fontSize={7} fontWeight="bold" textAnchor="middle">
                                        Greater Light
                                    </SvgText>

                                    {/* Moon — the Lesser Light */}
                                    <Circle cx={moonX} cy={moonY} r={10} fill="#222" />
                                    {/* Moon illumination */}
                                    {(() => {
                                        const mr = 10;
                                        const p = moonAge / 29.530588853;
                                        if (p < 0.02 || p > 0.98) return null;
                                        if (p > 0.48 && p < 0.52) return <Circle cx={moonX} cy={moonY} r={mr} fill="#E8E8C8" />;
                                        const cosP = Math.cos(p * 2 * Math.PI);
                                        const termRx = mr * Math.abs(cosP);
                                        const litOnRight = p < 0.5;
                                        const sO = litOnRight ? 1 : 0;
                                        const sT = cosP > 0 ? (litOnRight ? 0 : 1) : (litOnRight ? 1 : 0);
                                        return <Path d={`M ${moonX} ${moonY - mr} A ${mr} ${mr} 0 0 ${sO} ${moonX} ${moonY + mr} A ${termRx} ${mr} 0 0 ${sT} ${moonX} ${moonY - mr} Z`} fill="#E8E8C8" />;
                                    })()}
                                    <Circle cx={moonX} cy={moonY} r={13} fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth={1.5} />
                                    <SvgText x={moonX} y={moonY + 22} fill="#C0C0C0" fontSize={7} fontWeight="bold" textAnchor="middle">
                                        Lesser Light
                                    </SvgText>

                                    {/* Layer 4: Earth Disc — flat circle in the center */}
                                    <Circle cx={cx} cy={cy} r={size * 0.14} fill="url(#earthGrad)" stroke="#8D6E63" strokeWidth={2} />
                                    {/* Earth surface details */}
                                    <Ellipse cx={cx - 8} cy={cy - 5} rx={12} ry={6} fill="#2E7D32" opacity={0.6} />
                                    <Ellipse cx={cx + 10} cy={cy + 3} rx={8} ry={5} fill="#2E7D32" opacity={0.5} />
                                    <Ellipse cx={cx - 3} cy={cy + 8} rx={6} ry={3} fill="#1B5E20" opacity={0.4} />
                                    <SvgText x={cx} y={cy + 3} fill="#fff" fontSize={10} fontWeight="900" textAnchor="middle" alignmentBaseline="middle">
                                        🌍
                                    </SvgText>
                                    <SvgText x={cx} y={cy + 19} fill="#A1887F" fontSize={7} fontWeight="800" textAnchor="middle">
                                        EARTH
                                    </SvgText>

                                    {/* Pillars of the Earth — below the disc, in the lower half */}
                                    {pillarAngles.map((a, i) => {
                                        const pRad = (a - 90) * Math.PI / 180;
                                        const innerR = size * 0.14;
                                        const outerR = size * 0.08;
                                        const px1 = cx + innerR * Math.cos(pRad);
                                        const py1 = cy + innerR * Math.sin(pRad);
                                        const px2 = cx + (innerR - outerR) * Math.cos(pRad);
                                        const py2 = cy + (innerR - outerR) * Math.sin(pRad);
                                        // Only show pillars in the lower half (below Earth)
                                        if (py1 < cy) return null;
                                        return (
                                            <G key={`pillar-${i}`}>
                                                <Line x1={px1} y1={py1} x2={px1 + (px2 - px1) * 3} y2={py1 + (py2 - py1) * 3}
                                                    stroke="#8D6E63" strokeWidth={3} opacity={0.7} />
                                                <Line x1={px1} y1={py1} x2={px1 + (px2 - px1) * 3} y2={py1 + (py2 - py1) * 3}
                                                    stroke="#A1887F" strokeWidth={1.5} opacity={0.4} />
                                            </G>
                                        );
                                    })}

                                    {/* Layer 3: The Great Deep (Tehom) — ring around the lower portion */}
                                    {/* Represented by a darker blue ring in the lower hemisphere */}
                                    <Path
                                        d={`M ${cx - size * 0.38} ${cy} A ${size * 0.38} ${size * 0.38} 0 1 0 ${cx + size * 0.38} ${cy}`}
                                        fill="none" stroke="rgba(1,87,155,0.4)" strokeWidth={size * 0.03}
                                    />
                                    <SvgText x={cx} y={cy + size * 0.37} fill="#4FC3F7" fontSize={7} fontWeight="800" textAnchor="middle" opacity={0.8}>
                                        THE GREAT DEEP (TEHOM)
                                    </SvgText>

                                    {/* Layer 2: Sheol — the underworld, bottom of the diagram */}
                                    <SvgText x={cx} y={size - 16} fill="#757575" fontSize={8} fontWeight="800" textAnchor="middle" opacity={0.7}>
                                        SHEOL — REALM OF THE DEAD
                                    </SvgText>
                                    {/* Sheol flames/markers */}
                                    {[-30, -10, 10, 30].map((offset, i) => (
                                        <SvgText key={`sheol-${i}`} x={cx + offset} y={size - 28} fill="#616161" fontSize={8} textAnchor="middle" opacity={0.5}>
                                            ☠
                                        </SvgText>
                                    ))}

                                    {/* Pillars of Heaven — supporting the dome from the edges */}
                                    {[150, 30].map((a, i) => {
                                        const pRad = (a - 90) * Math.PI / 180;
                                        const innerR = size * 0.38;
                                        const px = cx + innerR * Math.cos(pRad);
                                        const py = cy + innerR * Math.sin(pRad);
                                        return (
                                            <G key={`hpillar-${i}`}>
                                                <Line x1={px} y1={py} x2={px} y2={cy + size * 0.42}
                                                    stroke="#8D6E63" strokeWidth={4} opacity={0.5} />
                                                <Line x1={px} y1={py} x2={px} y2={cy + size * 0.42}
                                                    stroke="#BCAAA4" strokeWidth={1.5} opacity={0.3} />
                                            </G>
                                        );
                                    })}

                                    {/* Cardinal directions on the Earth disc */}
                                    {[
                                        { label: 'E', angle: 0 },
                                        { label: 'S', angle: 90 },
                                        { label: 'W', angle: 180 },
                                        { label: 'N', angle: 270 },
                                    ].map(d => {
                                        const dRad = (d.angle - 90) * Math.PI / 180;
                                        const dr = size * 0.17;
                                        return (
                                            <SvgText key={d.label} x={cx + dr * Math.cos(dRad)} y={cy + dr * Math.sin(dRad) + 3}
                                                fill="rgba(255,255,255,0.35)" fontSize={8} fontWeight="900" textAnchor="middle">
                                                {d.label}
                                            </SvgText>
                                        );
                                    })}

                                    {/* Concentric labels for the seven heavens tradition */}
                                    {/* Ring labels at different radii */}
                                    <SvgText x={cx + size * 0.30} y={cy - size * 0.17} fill="rgba(255,255,255,0.25)" fontSize={6} fontWeight="700" textAnchor="middle" rotation={25} origin={`${cx + size * 0.30}, ${cy - size * 0.17}`}>
                                        Gen 1:6-8
                                    </SvgText>
                                    <SvgText x={cx - size * 0.30} y={cy - size * 0.17} fill="rgba(255,255,255,0.25)" fontSize={6} fontWeight="700" textAnchor="middle" rotation={-25} origin={`${cx - size * 0.30}, ${cy - size * 0.17}`}>
                                        Job 26:11
                                    </SvgText>
                                    <SvgText x={cx + size * 0.18} y={cy + size * 0.30} fill="rgba(100,181,247,0.35)" fontSize={6} fontWeight="700" textAnchor="middle">
                                        Gen 7:11
                                    </SvgText>
                                    <SvgText x={cx - size * 0.18} y={cy + size * 0.30} fill="rgba(100,181,247,0.35)" fontSize={6} fontWeight="700" textAnchor="middle">
                                        1 Sam 2:8
                                    </SvgText>
                                </Svg>

                                <View style={styles.dateLabel}>
                                    <Text style={styles.dateLabelText}>
                                        {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text style={styles.moonPhaseText}>
                                        {moonPhase.icon} {moonPhase.name}
                                    </Text>
                                </View>
                            </View>
                        );
                    })()}

                    {/* ═══ SIDE PERSPECTIVE — CROSS-SECTION VIEW ═══ */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🏔️ Side View — Cross Section</Text>
                    <Text style={styles.sectionExplainer}>
                        This is the Biblical cosmos seen from the side — a cutaway showing the dome arching over the flat Earth, with the Sun and Moon in true motion. The Sun arcs across the firmament based on the time of day, and the Moon shows its real orbital position and phase.
                    </Text>

                    {(() => {
                        const w = 380;
                        const h = 440;

                        // Vertical layout zones
                        const throneY = 22;
                        const watersTopY = 48;
                        const domeTopY = 75;
                        const domeBaseY = 265;
                        const earthTopY = domeBaseY;
                        const earthBottomY = 295;
                        const deepTopY = earthBottomY;
                        const deepBottomY = 360;
                        const sheolY = 400;

                        const midX = w / 2;
                        const earthLeft = 55;
                        const earthRight = w - 55;
                        const earthW = earthRight - earthLeft;

                        // Dome arch control points (elliptical arc)
                        const domeRx = earthW / 2 + 10;
                        const domeRy = domeBaseY - domeTopY;

                        // Sun position: arcs across the dome based on hour of day
                        // Hour 6 = east horizon, 12 = zenith, 18 = west horizon
                        const hour = birthDate.getHours() + birthDate.getMinutes() / 60;
                        // Map 6AM-6PM to 0-180 degrees (east to west across dome)
                        // Night hours: sun goes "under" earth (not visible)
                        const isDaytime = hour >= 6 && hour < 18;
                        const sunArc = isDaytime
                            ? ((hour - 6) / 12) * Math.PI  // 0 to PI (left to right across dome)
                            : 0;

                        // Sun position on the dome ellipse
                        const sunDomeX = isDaytime
                            ? midX - domeRx * Math.cos(sunArc)
                            : midX - domeRx * 0.85; // hidden below east horizon

                        const sunDomeY = isDaytime
                            ? domeBaseY - domeRy * Math.sin(sunArc)
                            : domeBaseY + 20; // below earth

                        // Night sun: travels beneath the earth
                        const isNight = !isDaytime;
                        const nightProgress = hour >= 18
                            ? (hour - 18) / 12
                            : hour < 6
                                ? (hour + 6) / 12
                                : 0;
                        const nightSunX = midX + (earthW / 2) * Math.cos(Math.PI * nightProgress);
                        const nightSunY = earthBottomY + 25 + 15 * Math.sin(Math.PI * nightProgress);

                        // Moon: similar arc but offset by its synodic phase
                        // Moon rises/sets at different times based on its age
                        // New moon rises with the sun, full moon rises at sunset
                        const moonRiseHour = 6 + (moonAge / 29.530588853) * 12;
                        const moonHoursSinceRise = ((hour - moonRiseHour) + 24) % 24;
                        const moonIsUp = moonHoursSinceRise < 12;
                        const moonArc = moonIsUp ? (moonHoursSinceRise / 12) * Math.PI : 0;

                        const moonDomeX = moonIsUp
                            ? midX - (domeRx * 0.85) * Math.cos(moonArc)
                            : midX + domeRx * 0.7;
                        const moonDomeY = moonIsUp
                            ? domeBaseY - (domeRy * 0.85) * Math.sin(moonArc)
                            : domeBaseY + 15;

                        // Seasonal sun altitude: summer solstice → higher arc, winter → lower
                        const seasonalFactor = 0.7 + 0.3 * Math.sin(((dayOfYear - 80) / 365.25) * 2 * Math.PI);

                        // Stars visible only at night
                        const starsVisible = isNight ? 0.9 : 0.1;

                        // Decorative star positions within the dome
                        const domeStars = [
                            { x: midX - 80, y: domeTopY + 30 },
                            { x: midX - 50, y: domeTopY + 18 },
                            { x: midX - 20, y: domeTopY + 40 },
                            { x: midX + 15, y: domeTopY + 25 },
                            { x: midX + 55, y: domeTopY + 35 },
                            { x: midX + 90, y: domeTopY + 20 },
                            { x: midX - 100, y: domeTopY + 60 },
                            { x: midX + 100, y: domeTopY + 55 },
                            { x: midX - 30, y: domeTopY + 70 },
                            { x: midX + 40, y: domeTopY + 65 },
                            { x: midX - 70, y: domeTopY + 80 },
                            { x: midX + 75, y: domeTopY + 75 },
                        ];

                        return (
                            <View style={styles.wheelContainer}>
                                <Svg width={w} height={h}>
                                    <Defs>
                                        <SvgLinearGradient id="sideWatersAbove" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#1565C0" stopOpacity="0.5" />
                                            <Stop offset="1" stopColor="#42A5F5" stopOpacity="0.2" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="sideFirmament" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor={isDaytime ? '#1976D2' : '#0D1B2A'} stopOpacity="0.9" />
                                            <Stop offset="1" stopColor={isDaytime ? '#42A5F5' : '#1B2838'} stopOpacity="0.7" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="sideEarth" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#558B2F" stopOpacity="0.9" />
                                            <Stop offset="0.3" stopColor="#4E342E" stopOpacity="0.95" />
                                            <Stop offset="1" stopColor="#3E2723" stopOpacity="1" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="sideDeep" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#0D47A1" stopOpacity="0.8" />
                                            <Stop offset="1" stopColor="#01579B" stopOpacity="0.95" />
                                        </SvgLinearGradient>
                                        <SvgLinearGradient id="sideSheol" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#212121" stopOpacity="0.9" />
                                            <Stop offset="1" stopColor="#000" stopOpacity="1" />
                                        </SvgLinearGradient>
                                    </Defs>

                                    {/* Background */}
                                    <Rect x={0} y={0} width={w} height={h} fill="#030318" rx={12} />

                                    {/* ── GOD'S THRONE ── */}
                                    <Rect x={midX - 60} y={8} width={120} height={20} rx={10} fill="rgba(255,215,0,0.15)" stroke="#FFD700" strokeWidth={1} />
                                    <SvgText x={midX} y={throneY} fill="#FFD700" fontSize={9} fontWeight="900" textAnchor="middle">
                                        👑 GOD'S THRONE
                                    </SvgText>

                                    {/* ── WATERS ABOVE ── */}
                                    <Rect x={15} y={32} width={w - 30} height={watersTopY - 20} rx={4} fill="url(#sideWatersAbove)" />
                                    {/* Wave pattern */}
                                    <Path
                                        d={`M 20 ${watersTopY - 6} Q 50 ${watersTopY - 14} 80 ${watersTopY - 6} T 140 ${watersTopY - 6} T 200 ${watersTopY - 6} T 260 ${watersTopY - 6} T 320 ${watersTopY - 6} T 370 ${watersTopY - 6}`}
                                        fill="none" stroke="#42A5F5" strokeWidth={1.5} opacity={0.5}
                                    />
                                    <SvgText x={midX} y={watersTopY - 12} fill="#64B5F6" fontSize={7} fontWeight="800" textAnchor="middle" opacity={0.8}>
                                        WATERS ABOVE
                                    </SvgText>

                                    {/* ── THE FIRMAMENT DOME ── */}
                                    {/* Dome fill (elliptical arc) */}
                                    <Path
                                        d={`M ${earthLeft - 10} ${domeBaseY} A ${domeRx} ${domeRy} 0 0 1 ${earthRight + 10} ${domeBaseY} L ${earthRight + 10} ${domeBaseY} Z`}
                                        fill="url(#sideFirmament)"
                                    />
                                    {/* Dome outline */}
                                    <Path
                                        d={`M ${earthLeft - 10} ${domeBaseY} A ${domeRx} ${domeRy} 0 0 1 ${earthRight + 10} ${domeBaseY}`}
                                        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2.5}
                                    />
                                    <SvgText x={midX} y={domeTopY + 10} fill="rgba(255,255,255,0.5)" fontSize={8} fontWeight="800" textAnchor="middle">
                                        THE FIRMAMENT (RAQIA)
                                    </SvgText>

                                    {/* Windows of Heaven on the dome */}
                                    {[0.15, 0.5, 0.85].map((frac, i) => {
                                        const windowAngle = frac * Math.PI;
                                        const wx = midX - domeRx * Math.cos(windowAngle);
                                        const wy = domeBaseY - domeRy * Math.sin(windowAngle);
                                        return (
                                            <G key={`swin-${i}`}>
                                                <Rect x={wx - 5} y={wy - 6} width={10} height={10} rx={2}
                                                    fill="none" stroke="#42A5F5" strokeWidth={1} opacity={0.5} />
                                                <Line x1={wx} y1={wy - 5} x2={wx} y2={wy + 3}
                                                    stroke="#42A5F5" strokeWidth={0.7} opacity={0.4} />
                                                <Line x1={wx - 4} y1={wy - 1} x2={wx + 4} y2={wy - 1}
                                                    stroke="#42A5F5" strokeWidth={0.7} opacity={0.4} />
                                            </G>
                                        );
                                    })}

                                    {/* Stars in the dome (brighter at night) */}
                                    {domeStars.map((s, i) => (
                                        <SvgText key={`ds-${i}`} x={s.x} y={s.y}
                                            fill="#FFFDE7" fontSize={i < 6 ? 8 : 5} textAnchor="middle"
                                            opacity={i < 6 ? starsVisible : starsVisible * 0.6}>
                                            {i < 6 ? '⭐' : '✦'}
                                        </SvgText>
                                    ))}

                                    {/* Sun path arc (dashed guide) */}
                                    <Path
                                        d={`M ${earthLeft} ${domeBaseY - 5} A ${domeRx * 0.85} ${domeRy * seasonalFactor * 0.85} 0 0 1 ${earthRight} ${domeBaseY - 5}`}
                                        fill="none" stroke="rgba(255,213,79,0.2)" strokeWidth={1} strokeDasharray="4,4"
                                    />

                                    {/* ── SUN ── */}
                                    {isDaytime && (
                                        <G>
                                            {/* Sun glow */}
                                            <Circle cx={sunDomeX} cy={sunDomeY * seasonalFactor + domeBaseY * (1 - seasonalFactor)} r={24} fill="none" stroke="rgba(255,213,79,0.2)" strokeWidth={6} />
                                            <Circle cx={sunDomeX} cy={sunDomeY * seasonalFactor + domeBaseY * (1 - seasonalFactor)} r={15} fill="#FFA000" />
                                            <Circle cx={sunDomeX} cy={sunDomeY * seasonalFactor + domeBaseY * (1 - seasonalFactor)} r={11} fill="#FFD54F" />
                                            <Circle cx={sunDomeX} cy={sunDomeY * seasonalFactor + domeBaseY * (1 - seasonalFactor)} r={6} fill="#FFECB3" />
                                            <SvgText x={sunDomeX} y={sunDomeY * seasonalFactor + domeBaseY * (1 - seasonalFactor) + 26} fill="#FFD54F" fontSize={7} fontWeight="bold" textAnchor="middle">
                                                ☉ Sun
                                            </SvgText>
                                        </G>
                                    )}

                                    {/* Night sun (beneath earth) */}
                                    {isNight && (
                                        <G>
                                            <Circle cx={nightSunX} cy={nightSunY} r={8} fill="#FFA000" opacity={0.3} />
                                            <Circle cx={nightSunX} cy={nightSunY} r={5} fill="#FFD54F" opacity={0.35} />
                                            <SvgText x={nightSunX} y={nightSunY + 14} fill="rgba(255,213,79,0.3)" fontSize={6} fontWeight="bold" textAnchor="middle">
                                                ☉ (below)
                                            </SvgText>
                                        </G>
                                    )}

                                    {/* ── MOON ── */}
                                    {moonIsUp && (
                                        <G>
                                            <Circle cx={moonDomeX} cy={moonDomeY} r={13} fill="none" stroke="rgba(200,200,200,0.2)" strokeWidth={1.5} />
                                            <Circle cx={moonDomeX} cy={moonDomeY} r={9} fill="#222" />
                                            {/* Moon phase rendering */}
                                            {(() => {
                                                const mr = 9;
                                                const p = moonAge / 29.530588853;
                                                if (p < 0.02 || p > 0.98) return null;
                                                if (p > 0.48 && p < 0.52) return <Circle cx={moonDomeX} cy={moonDomeY} r={mr} fill="#E8E8C8" />;
                                                const cosP = Math.cos(p * 2 * Math.PI);
                                                const termRx = mr * Math.abs(cosP);
                                                const litOnRight = p < 0.5;
                                                const sO = litOnRight ? 1 : 0;
                                                const sT = cosP > 0 ? (litOnRight ? 0 : 1) : (litOnRight ? 1 : 0);
                                                return <Path d={`M ${moonDomeX} ${moonDomeY - mr} A ${mr} ${mr} 0 0 ${sO} ${moonDomeX} ${moonDomeY + mr} A ${termRx} ${mr} 0 0 ${sT} ${moonDomeX} ${moonDomeY - mr} Z`} fill="#E8E8C8" />;
                                            })()}
                                            <SvgText x={moonDomeX} y={moonDomeY + 18} fill="#C0C0C0" fontSize={7} fontWeight="bold" textAnchor="middle">
                                                ☽ Moon
                                            </SvgText>
                                        </G>
                                    )}

                                    {/* ── EARTH DISC (side view = flat bar) ── */}
                                    <Rect x={earthLeft} y={earthTopY} width={earthW} height={earthBottomY - earthTopY} fill="url(#sideEarth)" />
                                    {/* Grass/surface on top */}
                                    <Rect x={earthLeft} y={earthTopY} width={earthW} height={5} fill="#558B2F" opacity={0.8} />
                                    {/* Mountains */}
                                    <Path d={`M ${earthLeft + 40} ${earthTopY} L ${earthLeft + 55} ${earthTopY - 15} L ${earthLeft + 70} ${earthTopY} Z`} fill="#4E342E" stroke="#6D4C41" strokeWidth={0.5} />
                                    <Path d={`M ${earthLeft + 130} ${earthTopY} L ${earthLeft + 150} ${earthTopY - 22} L ${earthLeft + 170} ${earthTopY} Z`} fill="#5D4037" stroke="#6D4C41" strokeWidth={0.5} />
                                    <Path d={`M ${earthLeft + 190} ${earthTopY} L ${earthLeft + 205} ${earthTopY - 12} L ${earthLeft + 220} ${earthTopY} Z`} fill="#4E342E" stroke="#6D4C41" strokeWidth={0.5} />
                                    {/* Trees (small triangles) */}
                                    {[80, 100, 115, 200, 230].map((xOff, i) => (
                                        <Path key={`tree-${i}`} d={`M ${earthLeft + xOff} ${earthTopY} L ${earthLeft + xOff + 4} ${earthTopY - 8} L ${earthLeft + xOff + 8} ${earthTopY} Z`} fill="#2E7D32" opacity={0.7} />
                                    ))}
                                    {/* People (tiny) */}
                                    <Circle cx={earthLeft + 140} cy={earthTopY - 3} r={2} fill="#FFCC80" />
                                    <Line x1={earthLeft + 140} y1={earthTopY - 1} x2={earthLeft + 140} y2={earthTopY} stroke="#FFCC80" strokeWidth={1} />

                                    <SvgText x={midX} y={earthTopY + 18} fill="rgba(255,255,255,0.6)" fontSize={9} fontWeight="800" textAnchor="middle">
                                        THE EARTH — FLAT DISC
                                    </SvgText>

                                    {/* ── PILLARS OF THE EARTH ── */}
                                    {[earthLeft + 30, earthLeft + earthW * 0.35, earthLeft + earthW * 0.65, earthRight - 30].map((px, i) => (
                                        <G key={`pillar-${i}`}>
                                            <Rect x={px - 5} y={earthBottomY} width={10} height={deepBottomY - earthBottomY + 10} fill="#8D6E63" opacity={0.7} />
                                            <Rect x={px - 3} y={earthBottomY} width={6} height={deepBottomY - earthBottomY + 10} fill="#A1887F" opacity={0.3} />
                                            {/* Pillar capital */}
                                            <Rect x={px - 7} y={earthBottomY - 2} width={14} height={4} rx={1} fill="#8D6E63" opacity={0.8} />
                                        </G>
                                    ))}
                                    <SvgText x={midX} y={earthBottomY + 18} fill="#A1887F" fontSize={6} fontWeight="800" textAnchor="middle" opacity={0.7}>
                                        PILLARS (1 Sam 2:8)
                                    </SvgText>

                                    {/* ── THE GREAT DEEP (TEHOM) ── */}
                                    <Rect x={20} y={deepTopY} width={w - 40} height={deepBottomY - deepTopY} fill="url(#sideDeep)" rx={4} />
                                    {/* Water wave lines */}
                                    {[0, 15, 30].map((yOff, i) => (
                                        <Path key={`wave-${i}`}
                                            d={`M 25 ${deepTopY + 10 + yOff} Q 60 ${deepTopY + 5 + yOff} 95 ${deepTopY + 10 + yOff} T 165 ${deepTopY + 10 + yOff} T 235 ${deepTopY + 10 + yOff} T 305 ${deepTopY + 10 + yOff} T 365 ${deepTopY + 10 + yOff}`}
                                            fill="none" stroke="rgba(66,165,245,0.3)" strokeWidth={1}
                                        />
                                    ))}
                                    <SvgText x={midX} y={(deepTopY + deepBottomY) / 2 + 3} fill="#4FC3F7" fontSize={8} fontWeight="800" textAnchor="middle" opacity={0.7}>
                                        THE GREAT DEEP — TEHOM (Gen 1:2)
                                    </SvgText>

                                    {/* ── SHEOL ── */}
                                    <Rect x={40} y={deepBottomY + 5} width={w - 80} height={40} fill="url(#sideSheol)" rx={6} />
                                    {[-40, -15, 10, 35].map((xOff, i) => (
                                        <SvgText key={`ss-${i}`} x={midX + xOff} y={sheolY - 6} fill="#616161" fontSize={9} textAnchor="middle" opacity={0.5}>
                                            ☠
                                        </SvgText>
                                    ))}
                                    <SvgText x={midX} y={sheolY + 8} fill="#757575" fontSize={8} fontWeight="800" textAnchor="middle" opacity={0.6}>
                                        SHEOL — REALM OF THE DEAD
                                    </SvgText>

                                    {/* ── Pillars of Heaven (sides of the dome) ── */}
                                    {[earthLeft - 8, earthRight + 8].map((px, i) => (
                                        <G key={`hp-${i}`}>
                                            <Rect x={px - 4} y={domeBaseY - 80} width={8} height={85} fill="#8D6E63" opacity={0.5} />
                                            <Rect x={px - 2} y={domeBaseY - 80} width={4} height={85} fill="#BCAAA4" opacity={0.25} />
                                        </G>
                                    ))}
                                    <SvgText x={earthLeft - 8} y={domeBaseY - 85} fill="#BCAAA4" fontSize={5} fontWeight="700" textAnchor="middle" opacity={0.6}>
                                        Pillar
                                    </SvgText>
                                    <SvgText x={earthRight + 8} y={domeBaseY - 85} fill="#BCAAA4" fontSize={5} fontWeight="700" textAnchor="middle" opacity={0.6}>
                                        Pillar
                                    </SvgText>

                                    {/* ── HORIZON LABELS ── */}
                                    <SvgText x={earthLeft - 5} y={domeBaseY + 12} fill="rgba(255,255,255,0.35)" fontSize={7} fontWeight="800" textAnchor="middle">
                                        EAST
                                    </SvgText>
                                    <SvgText x={earthRight + 5} y={domeBaseY + 12} fill="rgba(255,255,255,0.35)" fontSize={7} fontWeight="800" textAnchor="middle">
                                        WEST
                                    </SvgText>

                                    {/* Time of day indicator */}
                                    <SvgText x={midX} y={h - 10} fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="700" textAnchor="middle">
                                        {birthDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })} — {isDaytime ? '☀️ Day' : '🌙 Night'}
                                    </SvgText>
                                </Svg>
                            </View>
                        );
                    })()}

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
                            <Text style={styles.sliderEndLabel}>−30 days</Text>
                            <TouchableOpacity onPress={() => applyOffset(0)}>
                                <Text style={styles.sliderResetLabel}>⟲ Birth</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={jumpToToday}>
                                <Text style={[styles.sliderResetLabel, { color: '#40E0D0' }]}>📅 Today</Text>
                            </TouchableOpacity>
                            <Text style={styles.sliderEndLabel}>+30 days</Text>
                        </View>
                        <View style={styles.stepRow}>
                            {[{ label: '6hr', d: 0.25 }, { label: '3hr', d: 0.125 }, { label: '2hr', d: 2 / 24 }, { label: '1hr', d: 1 / 24 }].map(s => (
                                <TouchableOpacity key={'m' + s.label} onPress={() => applyOffset(dayOffset - s.d)} style={styles.stepBtn}>
                                    <Text style={styles.stepBtnText}>◀{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.stepRow}>
                            {[{ label: '1hr', d: 1 / 24 }, { label: '2hr', d: 2 / 24 }, { label: '3hr', d: 0.125 }, { label: '6hr', d: 0.25 }].map(s => (
                                <TouchableOpacity key={'p' + s.label} onPress={() => applyOffset(dayOffset + s.d)} style={styles.stepBtn}>
                                    <Text style={styles.stepBtnText}>{s.label}▶</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Key / Legend */}
                    <Text style={styles.keySectionHeader}>🏛️ The Seven Layers</Text>
                    <View style={styles.keyGrid}>
                        {[
                            { icon: '👑', name: "God's Throne", desc: 'The Highest Heaven — above all waters and firmament (Psalm 104:2-3, Isaiah 66:1)', color: '#FFD700' },
                            { icon: '🌊', name: 'Waters Above', desc: 'Cosmic ocean above the dome — source of the Great Flood and all rain (Genesis 1:7, 7:11)', color: '#42A5F5' },
                            { icon: '🏮', name: 'Windows of Heaven', desc: 'Gates in the firmament through which rain, snow, and blessings pour down (Genesis 7:11, Malachi 3:10)', color: '#64B5F6' },
                            { icon: '🌌', name: 'The Firmament (Raqia)', desc: 'A solid dome or expanse separating waters above from below — the Sun, Moon, and stars are set in it (Genesis 1:6-8, 14-17)', color: '#3F51B5' },
                            { icon: '☀️', name: 'Greater Light (Sun)', desc: 'Set in the firmament to rule the day — traces a yearly path through the dome (Genesis 1:16)', color: '#FFD54F' },
                            { icon: '🌙', name: 'Lesser Light (Moon)', desc: 'Set in the firmament to rule the night — its monthly cycle shown with real phase (Genesis 1:16)', color: '#B0BEC5' },
                            { icon: '⭐', name: 'The Stars', desc: 'Fixed lights set in the firmament — "He determines the number of the stars; He gives to all of them their names" (Psalm 147:4)', color: '#FFFDE7' },
                            { icon: '🌍', name: 'The Earth (Disc)', desc: 'A flat circular disc — "He sits enthroned above the circle of the earth" (Isaiah 40:22)', color: '#8D6E63' },
                            { icon: '🏛️', name: 'Pillars of the Earth', desc: 'Foundations holding up the Earth — "For the pillars of the earth are the LORD\'s, and He has set the world upon them" (1 Samuel 2:8)', color: '#A1887F' },
                            { icon: '🏗️', name: 'Pillars of Heaven', desc: 'Supporting the dome itself — "The pillars of heaven tremble and are astounded at His rebuke" (Job 26:11)', color: '#BCAAA4' },
                            { icon: '🌊', name: 'The Great Deep (Tehom)', desc: 'Primordial waters beneath the Earth — "In the beginning... darkness was over the face of the deep" (Genesis 1:2)', color: '#0D47A1' },
                            { icon: '💀', name: 'Sheol', desc: 'The underworld, realm of the dead below all else — "For Sheol cannot thank You, death cannot praise You" (Isaiah 38:18)', color: '#616161' },
                        ].map(item => (
                            <View key={item.name} style={[styles.keyItem, { width: '100%' as any }]}>
                                <View style={[styles.keyDot, { backgroundColor: item.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.keyName}>{item.icon} {item.name}</Text>
                                    <Text style={styles.keyDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Scripture References */}
                    <Text style={styles.keySectionHeader}>📖 Key Scripture References</Text>
                    <View style={styles.keyGrid}>
                        {[
                            { ref: 'Genesis 1:1-19', text: 'The creation account — God creates the firmament, separates waters, and places lights in the dome.' },
                            { ref: 'Genesis 7:11', text: '"All the fountains of the great deep burst forth, and the windows of the heavens were opened."' },
                            { ref: 'Job 26:7-11', text: '"He stretches out the north over the void and hangs the earth on nothing. The pillars of heaven tremble."' },
                            { ref: 'Job 38:4-7', text: '"Where were you when I laid the foundation of the earth? ...On what were its bases sunk, or who laid its cornerstone?"' },
                            { ref: 'Psalm 19:1-6', text: '"The heavens declare the glory of God; the firmament shows His handiwork... The sun comes out like a bridegroom."' },
                            { ref: 'Psalm 104:2-3', text: '"He stretches out the heavens like a tent, He lays the beams of His upper chambers on the waters."' },
                            { ref: 'Isaiah 40:22', text: '"He sits enthroned above the circle of the earth, and its inhabitants are like grasshoppers."' },
                            { ref: 'Isaiah 66:1', text: '"Heaven is My throne, and the earth is My footstool."' },
                        ].map(s => (
                            <View key={s.ref} style={[styles.keyItem, { width: '100%' as any }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.keyName, { color: '#FFD54F' }]}>{s.ref}</Text>
                                    <Text style={styles.keyDesc}>{s.text}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>
                            ℹ️  This diagram represents the cosmological model described in the Hebrew Bible as understood by ancient Near Eastern scholars. The Sun's position reflects the actual day of the year, and the Moon phase is calculated from real synodic cycles. Scripture references are from the ESV translation.
                        </Text>
                    </View>
                </View>

                {/* ═══ PRAGUE ASTRONOMICAL CLOCK — NAV BUTTON ═══ */}
                <TouchableOpacity
                    style={{
                        marginTop: 24,
                        backgroundColor: 'rgba(139,105,20,0.15)',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 2,
                        borderColor: 'rgba(218,165,32,0.4)',
                        alignItems: 'center',
                    }}
                    onPress={() => navigation.navigate('PragueClock', {
                        birthDate: route.params.birthDate,
                        birthTime: route.params.birthTime,
                        birthLocation: route.params.birthLocation,
                    })}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 44, marginBottom: 8 }}>🕰️</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#DAA520', textAlign: 'center' }}>Prague Astronomical Clock</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4 }}>Staroměstský Orloj • Installed 1410 AD</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Tap to Explore →</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { padding: 20, paddingBottom: 40 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    emoji: { fontSize: 55, fontWeight: 'bold', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    sectionContainer: { marginBottom: 24 },
    sectionTitle: { fontSize: 23, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
    sectionExplainer: { fontSize: 14, fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 12, lineHeight: 21, paddingHorizontal: 8 },
    spinHint: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10, alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' },
    spinHintText: { fontSize: 15, color: '#ffd54f', textAlign: 'center', fontWeight: '700' },
    spinHintDetail: { fontSize: 13, fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', textAlign: 'left', lineHeight: 21, marginTop: 4 },
    wheelContainer: { backgroundColor: '#05051a', borderRadius: 16, padding: 8, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,215,0,0.3)', position: 'relative' as const },
    spinOverlay: { position: 'absolute' as const, top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, zIndex: 10, borderWidth: 1, borderColor: '#ffd700' },
    spinOverlayDate: { fontSize: 14, fontWeight: '700', color: '#ffd700', textAlign: 'center' },
    spinOverlayDelta: { fontSize: 11, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    dateLabel: { position: 'absolute' as const, bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    dateLabelText: { fontSize: 13, fontWeight: '600', color: '#FFD54F' },
    moonPhaseText: { fontSize: 11, fontWeight: '600', color: '#C0C0C0', marginTop: 2 },
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
    keySectionHeader: { fontSize: 16, fontWeight: '900', color: '#FFD54F', marginTop: 16, marginBottom: 8, textAlign: 'center' },
    keyGrid: { gap: 8 },
    keyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
    keyDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
    keyName: { fontSize: 14, fontWeight: '800', color: '#fff' },
    keyDesc: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginTop: 2, lineHeight: 18 },
    noteBox: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    noteText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', lineHeight: 18 },
});
