import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Dimensions, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Ellipse, G, Path, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GalaxyWheel'>;

// ── Spiral arm data (4 major + 2 minor arms) ──
const ARMS = [
    { name: 'Perseus Arm', baseAngle: 0, color: '#7986CB', width: 18 },
    { name: 'Sagittarius Arm', baseAngle: 90, color: '#4FC3F7', width: 16 },
    { name: 'Scutum-Centaurus', baseAngle: 180, color: '#81C784', width: 18 },
    { name: 'Norma Arm', baseAngle: 270, color: '#FFB74D', width: 16 },
    { name: 'Orion Spur', baseAngle: 50, color: '#FFD54F', width: 10 },
    { name: 'Outer Arm', baseAngle: 140, color: '#B39DDB', width: 12 },
];

// Notable objects in the galaxy
const GALAXY_OBJECTS = [
    { name: 'Sagittarius A*', desc: 'Supermassive black hole at the center', emoji: '🕳️', angle: 0, dist: 0 },
    { name: 'Our Solar System', desc: '~26,000 light-years from center', emoji: '☀️', angle: 50, dist: 0.55 },
    { name: 'Andromeda Direction', desc: '2.5 million light-years away', emoji: '🌌', angle: 120, dist: 0.95 },
    { name: 'Crab Nebula', desc: 'Supernova remnant in Perseus Arm', emoji: '🦀', angle: 15, dist: 0.45 },
    { name: 'Orion Nebula', desc: 'Stellar nursery near our arm', emoji: '⭐', angle: 55, dist: 0.48 },
    { name: 'Cygnus X-1', desc: 'Famous black hole binary system', emoji: '🌀', angle: 70, dist: 0.42 },
    { name: 'Galactic Bar', desc: 'Central bar structure ~27,000 ly long', emoji: '🔶', angle: 45, dist: 0.12 },
];

// Planets for the mini solar system
const PLANETS = [
    { name: 'Mercury', color: '#B0BEC5', r: 2, orbit: 5 },
    { name: 'Venus', color: '#FFE0B2', r: 2.5, orbit: 8 },
    { name: 'Earth', color: '#4FC3F7', r: 2.5, orbit: 11 },
    { name: 'Mars', color: '#EF5350', r: 2, orbit: 14 },
    { name: 'Jupiter', color: '#FFB74D', r: 4, orbit: 19 },
    { name: 'Saturn', color: '#FFF176', r: 3.5, orbit: 24 },
    { name: 'Uranus', color: '#80DEEA', r: 3, orbit: 28 },
    { name: 'Neptune', color: '#5C6BC0', r: 3, orbit: 32 },
];

function degToRad(d: number) { return d * Math.PI / 180; }

// Generate spiral arm path points
function spiralPoints(baseAngle: number, rotation: number): string {
    const cx = 160, cy = 160;
    const points: string[] = [];
    for (let t = 0.15; t <= 3.2; t += 0.08) {
        const r = 15 + 42 * t;
        const angle = baseAngle + t * 90 + rotation;
        const rad = degToRad(angle);
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        points.push(t === 0.15 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return points.join(' ');
}

// Generate star cluster positions along an arm
function armStars(baseAngle: number, rotation: number, count: number, seed: number): Array<{ x: number; y: number; size: number; opacity: number }> {
    const cx = 160, cy = 160;
    const stars: Array<{ x: number; y: number; size: number; opacity: number }> = [];
    for (let i = 0; i < count; i++) {
        const t = 0.3 + (i / count) * 2.8;
        const r = 15 + 42 * t + (Math.sin(seed * i * 0.7) * 12);
        const angle = baseAngle + t * 90 + rotation + (Math.cos(seed * i * 1.3) * 8);
        const rad = degToRad(angle);
        stars.push({
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad),
            size: 0.4 + Math.abs(Math.sin(seed * i * 2.1)) * 1.2,
            opacity: 0.3 + Math.abs(Math.cos(seed * i * 1.7)) * 0.6,
        });
    }
    return stars;
}

export default function GalaxyWheelScreen({ route, navigation }: Props) {
    const screenW = Dimensions.get('window').width;
    const wheelSize = Math.min(screenW - 24, 340);
    const cx = 160, cy = 160;

    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [showSolarZoom, setShowSolarZoom] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const lastAngleRef = useRef<number | null>(null);
    const spinAccumRef = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
            onPanResponderGrant: () => {
                lastAngleRef.current = null;
                spinAccumRef.current = rotation;
                setIsSpinning(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const a = Math.atan2(locationY - cy, locationX - cx) * (180 / Math.PI);
                if (lastAngleRef.current !== null) {
                    let delta = a - lastAngleRef.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    spinAccumRef.current += delta;
                    setRotation(spinAccumRef.current);
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

    // Solar system position on the galaxy
    const solarAngle = degToRad(50 + rotation);
    const solarDist = 0.55 * 140;
    const solarX = cx + solarDist * Math.cos(solarAngle);
    const solarY = cy + solarDist * Math.sin(solarAngle);

    // Galactic year: 1 full revolution (360°) = 1 galactic year ≈ 225 million Earth years
    const GALACTIC_YEAR_MY = 225; // million years
    const galacticYears = rotation / 360;
    const earthMillionYears = Math.abs(galacticYears * GALACTIC_YEAR_MY);
    const formatGY = (gy: number) => {
        const abs = Math.abs(gy);
        if (abs < 0.01) return '0';
        if (abs < 1) return abs.toFixed(2);
        if (abs < 10) return abs.toFixed(1);
        return Math.round(abs).toLocaleString();
    };

    return (
        <LinearGradient colors={['#020010', '#0a0025', '#050018']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#020010" />
            <RisingStars />
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🌌 The Milky Way Galaxy</Text>
                <Text style={styles.subtitle}>
                    ~100,000 light-years across • ~200 billion stars • You are here
                </Text>

                {/* ── Interactive Galaxy Wheel ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔮 Spin the Galaxy</Text>
                    <Text style={styles.cardBody}>
                        Drag to rotate. Tap the ☀️ to zoom into our solar system.
                    </Text>
                    <View style={styles.wheelWrap} {...panResponder.panHandlers}>
                        <Svg width={wheelSize} height={wheelSize} viewBox="0 0 320 320">
                            {/* Dark background */}
                            <Circle cx={cx} cy={cy} r={158} fill="#030012" />
                            <Circle cx={cx} cy={cy} r={158} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

                            {/* Galactic halo glow */}
                            <Circle cx={cx} cy={cy} r={150} fill="none" stroke="rgba(138,100,200,0.06)" strokeWidth={30} />
                            <Circle cx={cx} cy={cy} r={120} fill="none" stroke="rgba(200,180,255,0.04)" strokeWidth={20} />

                            {/* Spiral arms */}
                            {ARMS.map((arm, i) => (
                                <Path
                                    key={arm.name}
                                    d={spiralPoints(arm.baseAngle, rotation)}
                                    fill="none"
                                    stroke={arm.color}
                                    strokeWidth={arm.width}
                                    opacity={0.18}
                                    strokeLinecap="round"
                                />
                            ))}
                            {/* Brighter inner arm glow */}
                            {ARMS.map((arm) => (
                                <Path
                                    key={`${arm.name}-inner`}
                                    d={spiralPoints(arm.baseAngle, rotation)}
                                    fill="none"
                                    stroke={arm.color}
                                    strokeWidth={arm.width * 0.4}
                                    opacity={0.3}
                                    strokeLinecap="round"
                                />
                            ))}

                            {/* Star clusters along arms */}
                            {ARMS.map((arm, ai) =>
                                armStars(arm.baseAngle, rotation, 30, ai * 7 + 3).map((s, si) => (
                                    <Circle key={`${ai}-${si}`} cx={s.x} cy={s.y} r={s.size} fill="#fff" opacity={s.opacity} />
                                ))
                            )}

                            {/* Galactic center — bright core */}
                            <Circle cx={cx} cy={cy} r={22} fill="rgba(255,200,100,0.15)" />
                            <Circle cx={cx} cy={cy} r={14} fill="rgba(255,220,150,0.25)" />
                            <Circle cx={cx} cy={cy} r={8} fill="rgba(255,240,200,0.4)" />
                            <Circle cx={cx} cy={cy} r={4} fill="#FFE082" />
                            {/* Central bar */}
                            <Ellipse
                                cx={cx} cy={cy} rx={28} ry={8}
                                fill="rgba(255,200,120,0.12)"
                                rotation={45 + rotation}
                                origin={`${cx}, ${cy}`}
                            />

                            {/* Sagittarius A* label */}
                            <SvgText x={cx} y={cy + 32} fontSize={8} textAnchor="middle" fill="rgba(255,224,130,0.8)" fontWeight="bold">
                                Sagittarius A* 🕳️
                            </SvgText>

                            {/* Our Solar System — highlighted */}
                            <Circle cx={solarX} cy={solarY} r={16} fill="none" stroke="#FFD54F" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
                            <Circle cx={solarX} cy={solarY} r={5} fill="#FFD700" />
                            <SvgText x={solarX} y={solarY + 4} fontSize={7} textAnchor="middle">☀️</SvgText>
                            <SvgText x={solarX} y={solarY - 20} fontSize={7} fontWeight="bold" textAnchor="middle" fill="#FFD54F" textDecoration="underline">
                                You Are Here ↗
                            </SvgText>
                            {/* Tiny Earth orbiting near Sun */}
                            <Circle cx={solarX + 9} cy={solarY - 2} r={2} fill="#4FC3F7" />

                            {/* Notable objects */}
                            {GALAXY_OBJECTS.filter(o => o.dist > 0 && o.name !== 'Our Solar System').map((obj, i) => {
                                const a = degToRad(obj.angle + rotation);
                                const d = obj.dist * 140;
                                const ox = cx + d * Math.cos(a);
                                const oy = cy + d * Math.sin(a);
                                return (
                                    <G key={obj.name}>
                                        <Circle cx={ox} cy={oy} r={3} fill="rgba(255,255,255,0.3)" />
                                        <SvgText x={ox} y={oy + 12} fontSize={6} textAnchor="middle" fill="rgba(255,255,255,0.5)">
                                            {obj.emoji} {obj.name}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Galactic distance rings */}
                            {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                                <Circle key={frac} cx={cx} cy={cy} r={frac * 140} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} strokeDasharray="4,6" />
                            ))}

                            {/* Distance labels */}
                            <SvgText x={cx + 38} y={cy - 2} fontSize={6} fill="rgba(255,255,255,0.25)">25k ly</SvgText>
                            <SvgText x={cx + 73} y={cy - 2} fontSize={6} fill="rgba(255,255,255,0.25)">50k ly</SvgText>
                        </Svg>
                        {/* Touchable overlay for "You Are Here" → Solar System Time Machine */}
                        {(() => {
                            const scale = wheelSize / 320;
                            const tapX = solarX * scale - 30;
                            const tapY = (solarY - 25) * scale;
                            return (
                                <TouchableOpacity
                                    style={[styles.youAreHereTap, { left: tapX, top: tapY }]}
                                    activeOpacity={0.6}
                                    onPress={() => navigation.navigate('SolarSystemTimeCapsule', {
                                        birthDate: route.params.birthDate,
                                        birthTime: route.params.birthTime,
                                        birthLocation: route.params.birthLocation,
                                    })}
                                />
                            );
                        })()}
                    </View>
                    <Text style={styles.spinHint}>
                        {isSpinning ? '🌀 Spinning the galaxy...' : '☝️ Swipe to spin the Milky Way'}
                    </Text>

                    {/* Galactic Year Counter */}
                    <View style={styles.galacticCounter}>
                        <Text style={styles.galacticLabel}>1 revolution = 1 Galactic Year</Text>
                        <Text style={styles.galacticValue}>
                            {formatGY(galacticYears)} Galactic {Math.abs(galacticYears) === 1 ? 'Year' : 'Years'}
                        </Text>
                        <Text style={styles.galacticEarth}>
                            ≈ {earthMillionYears < 1 ? earthMillionYears.toFixed(1) : Math.round(earthMillionYears).toLocaleString()} million Earth years
                        </Text>
                        <Text style={styles.galacticNote}>
                            The Sun orbits the Milky Way at ~514,000 mph, completing one orbit every ~225 million years
                        </Text>
                    </View>
                </View>

                {/* ── Zoom: Our Solar System ── */}
                <TouchableOpacity style={styles.card} onPress={() => setShowSolarZoom(!showSolarZoom)} activeOpacity={0.8}>
                    <Text style={styles.cardTitle}>☀️ Our Solar System {showSolarZoom ? '(tap to collapse)' : '(tap to expand)'}</Text>
                    <Text style={styles.cardBody}>
                        Located in the Orion Spur, a minor arm between the Perseus and Sagittarius arms — about 26,000 light-years from the galactic center.
                    </Text>
                    {showSolarZoom && (
                        <View style={{ alignItems: 'center', marginTop: 12 }}>
                            <Svg width={280} height={280} viewBox="0 0 280 280">
                                <Circle cx={140} cy={140} r={138} fill="#020015" />
                                {/* Sun */}
                                <Circle cx={140} cy={140} r={10} fill="#FFD700" />
                                <SvgText x={140} y={144} fontSize={10} textAnchor="middle">☀️</SvgText>
                                {/* Orbits and planets */}
                                {PLANETS.map((p, i) => {
                                    const orbitR = p.orbit * 3.5 + 15;
                                    const angle = degToRad((i * 45 + rotation * 2) % 360);
                                    const px = 140 + orbitR * Math.cos(angle);
                                    const py = 140 + orbitR * Math.sin(angle);
                                    return (
                                        <G key={p.name}>
                                            <Circle cx={140} cy={140} r={orbitR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} strokeDasharray="3,4" />
                                            <Circle cx={px} cy={py} r={p.r} fill={p.color} />
                                            <SvgText x={px} y={py + p.r + 9} fontSize={7} textAnchor="middle" fill="rgba(255,255,255,0.6)">
                                                {p.name}
                                            </SvgText>
                                        </G>
                                    );
                                })}
                                {/* Asteroid belt hint */}
                                <Circle cx={140} cy={140} r={68} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} strokeDasharray="1,5" />
                                <SvgText x={140} y={62} fontSize={6} textAnchor="middle" fill="rgba(255,255,255,0.25)">Asteroid Belt</SvgText>
                                {/* Kuiper belt hint */}
                                <Circle cx={140} cy={140} r={132} fill="none" stroke="rgba(200,180,255,0.06)" strokeWidth={6} strokeDasharray="2,6" />
                                <SvgText x={140} y={16} fontSize={6} textAnchor="middle" fill="rgba(200,180,255,0.25)">Kuiper Belt</SvgText>
                            </Svg>
                            <Text style={styles.solarCaption}>Planets rotate as you spin the galaxy above</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* ── Galaxy Facts ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📚 Milky Way Facts</Text>
                    {[
                        { icon: '📏', label: 'Diameter', value: '~100,000 light-years' },
                        { icon: '⭐', label: 'Stars', value: '200–400 billion' },
                        { icon: '🪐', label: 'Known Exoplanets', value: '5,000+ confirmed' },
                        { icon: '🕳️', label: 'Central Black Hole', value: 'Sagittarius A* (~4 million solar masses)' },
                        { icon: '🌀', label: 'Type', value: 'Barred Spiral Galaxy (SBbc)' },
                        { icon: '⏱️', label: 'Sun\'s Orbital Period', value: '~225 million years ("Galactic Year")' },
                        { icon: '📍', label: 'Sun\'s Location', value: 'Orion Spur, ~26,000 ly from center' },
                        { icon: '💨', label: 'Sun\'s Speed', value: '~514,000 mph around galactic center' },
                        { icon: '🔭', label: 'Nearest Galaxy', value: 'Canis Major Dwarf (~25,000 ly)' },
                        { icon: '💥', label: 'Future Collision', value: 'Andromeda merger in ~4.5 billion years' },
                    ].map((fact) => (
                        <View key={fact.label} style={styles.factRow}>
                            <Text style={styles.factIcon}>{fact.icon}</Text>
                            <View style={styles.factContent}>
                                <Text style={styles.factLabel}>{fact.label}</Text>
                                <Text style={styles.factValue}>{fact.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Perspective ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 Putting It In Perspective</Text>
                    <Text style={styles.cardBody}>
                        If the Milky Way were the size of a football field, our entire solar system — from the Sun all the way out past Pluto — would be smaller than a grain of sand.{'\n\n'}The light from the center of the galaxy takes 26,000 years to reach us. When that light started its journey, humans were painting on cave walls.{'\n\n'}Every star you can see with your naked eye at night is inside our galaxy — and they represent only a tiny fraction of the Milky Way's hundreds of billions of stars.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 40 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4, marginBottom: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
    wheelWrap: { alignItems: 'center', marginVertical: 8, position: 'relative' },
    youAreHereTap: { position: 'absolute', width: 60, height: 40, zIndex: 10 },
    spinHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },
    galacticCounter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
    galacticLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
    galacticValue: { fontSize: 22, fontWeight: '900', color: '#FFD54F', marginBottom: 2 },
    galacticEarth: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
    galacticNote: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 14 },
    solarCaption: { fontSize: 11, color: 'rgba(255,215,0,0.6)', textAlign: 'center', marginTop: 8 },
    factRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    factIcon: { fontSize: 18, marginRight: 12, marginTop: 2 },
    factContent: { flex: 1 },
    factLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    factValue: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
});
