import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BirthMoonPhase'>;

const MOON_PHASES = [
    { name: 'New Moon', icon: '🌑', range: [0, 1], personality: 'You are a natural starter — full of potential and new beginnings. You thrive on fresh starts and setting intentions. Your energy is inward and contemplative, perfect for planting seeds of change.', strengths: ['Visionary', 'Intuitive', 'Adventurous', 'Pioneering'], shadow: 'Can struggle with follow-through' },
    { name: 'Waxing Crescent', icon: '🌒', range: [1, 3.69], personality: 'You are driven by faith and hope. Born under a growing sliver of light, you have an instinctive ability to push through challenges with optimism. You set bold intentions and chase them with determination.', strengths: ['Determined', 'Optimistic', 'Creative', 'Resourceful'], shadow: 'May be overly idealistic' },
    { name: 'First Quarter', icon: '🌓', range: [3.69, 7.38], personality: 'Action is your middle name! You are a decisive problem-solver who thrives on challenges. The half-lit moon at your birth gives you the courage to make tough choices and stand your ground.', strengths: ['Decisive', 'Courageous', 'Strong-willed', 'Dynamic'], shadow: 'Can be inflexible' },
    { name: 'Waxing Gibbous', icon: '🌔', range: [7.38, 11.07], personality: 'You are a natural refiner and perfectionist. Born under an almost-full moon, you have an eye for detail and a drive to improve everything you touch. Your analytical mind is your superpower.', strengths: ['Analytical', 'Dedicated', 'Patient', 'Perfectionist'], shadow: 'May overthink or over-prepare' },
    { name: 'Full Moon', icon: '🌕', range: [11.07, 14.76], personality: 'You are magnetic and expressive! Born under the Full Moon\'s brilliant light, you have powerful emotions and a need to share your gifts with the world. Relationships are central to your life.', strengths: ['Charismatic', 'Empathetic', 'Expressive', 'Illuminating'], shadow: 'Can be overly emotional' },
    { name: 'Waning Gibbous', icon: '🌖', range: [14.76, 18.45], personality: 'You are a natural teacher and mentor. Born as the moon begins to share its light, you feel called to give back wisdom and guide others. Your life is about sharing knowledge and experience.', strengths: ['Wise', 'Generous', 'Teaching', 'Philosophical'], shadow: 'May feel burdened by responsibility' },
    { name: 'Last Quarter', icon: '🌗', range: [18.45, 22.14], personality: 'You are a revolutionary thinker! Born under the half-dark moon, you question the status quo and forge your own path. You have a deep need to release what no longer serves you.', strengths: ['Independent', 'Revolutionary', 'Principled', 'Transformative'], shadow: 'Can be stubborn about beliefs' },
    { name: 'Waning Crescent', icon: '🌘', range: [22.14, 29.53], personality: 'You are an old soul with deep wisdom. Born under the final sliver of moonlight, you are introspective and spiritually attuned. You have a gift for closure and preparation for new cycles.', strengths: ['Spiritual', 'Reflective', 'Compassionate', 'Insightful'], shadow: 'May withdraw too much' },
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

function getMoonAge(date: Date): number {
    // Simplified synodic month calculation
    const known = new Date(2000, 0, 6, 18, 14); // Known new moon
    const diff = date.getTime() - known.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    const cycle = 29.53058867;
    let age = days % cycle;
    if (age < 0) age += cycle;
    return age;
}

function getPhase(moonAge: number) {
    return MOON_PHASES.find(p => moonAge >= p.range[0] && moonAge < p.range[1]) || MOON_PHASES[0];
}

function getMoonSign(date: Date) {
    // Approximate moon sign from date (simplified - moon moves ~13° per day through zodiac)
    const known = new Date(2000, 0, 6); // Moon was in Pisces
    const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
    const degreesPerDay = 13.176;
    const totalDegrees = diff * degreesPerDay;
    let zodiacDegree = (totalDegrees + 330) % 360; // Starting offset Pisces ~330°
    if (zodiacDegree < 0) zodiacDegree += 360;
    const signIndex = Math.floor(zodiacDegree / 30);
    return MOON_SIGNS[signIndex % 12];
}

function getIlluminationPercent(moonAge: number): number {
    // 0 at new moon, 100 at full moon
    return Math.round(50 * (1 - Math.cos((moonAge / 29.53) * 2 * Math.PI)));
}

export default function BirthMoonPhaseScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const moonAge = getMoonAge(birthDate);
    const phase = getPhase(moonAge);
    const moonSign = getMoonSign(birthDate);
    const illumination = getIlluminationPercent(moonAge);

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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🌙 Your Birth Moon</Text>
                <Text style={styles.birthDate}>
                    {birthDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>

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
});
