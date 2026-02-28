import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chakra'>;

interface ChakraData {
    name: string;
    sanskrit: string;
    color: string;
    location: string;
    governs: string;
    element: string;
    mantra: string;
    signs: string[];
    affirmation: string;
    crystals: string[];
    foods: string[];
    yPosition: number; // for body diagram
}

const CHAKRAS: ChakraData[] = [
    { name: 'Crown', sanskrit: 'Sahasrara', color: '#9C27B0', location: 'Top of head', governs: 'Spiritual connection, consciousness, enlightenment', element: 'Cosmic Energy', mantra: 'OM', signs: ['Pisces', 'Aquarius'], affirmation: 'I am connected to the divine wisdom of the universe.', crystals: ['Amethyst', 'Clear Quartz', 'Selenite'], foods: ['Fasting/Detox', 'Purple grapes', 'Lavender tea'], yPosition: 40 },
    { name: 'Third Eye', sanskrit: 'Ajna', color: '#3F51B5', location: 'Between eyebrows', governs: 'Intuition, imagination, insight, psychic ability', element: 'Light', mantra: 'AUM', signs: ['Sagittarius', 'Pisces'], affirmation: 'I trust my intuition and inner wisdom.', crystals: ['Lapis Lazuli', 'Sodalite', 'Fluorite'], foods: ['Blueberries', 'Dark chocolate', 'Purple cabbage'], yPosition: 70 },
    { name: 'Throat', sanskrit: 'Vishuddha', color: '#03A9F4', location: 'Throat', governs: 'Communication, truth, self-expression', element: 'Ether/Sound', mantra: 'HAM', signs: ['Gemini', 'Virgo', 'Aquarius'], affirmation: 'I speak my truth with clarity and confidence.', crystals: ['Blue Lace Agate', 'Turquoise', 'Aquamarine'], foods: ['Blueberries', 'Herbal tea', 'Honey'], yPosition: 112 },
    { name: 'Heart', sanskrit: 'Anahata', color: '#4CAF50', location: 'Center of chest', governs: 'Love, compassion, forgiveness, connection', element: 'Air', mantra: 'YAM', signs: ['Libra', 'Taurus', 'Leo'], affirmation: 'I give and receive love freely and unconditionally.', crystals: ['Rose Quartz', 'Green Aventurine', 'Jade'], foods: ['Green vegetables', 'Green tea', 'Avocado'], yPosition: 150 },
    { name: 'Solar Plexus', sanskrit: 'Manipura', color: '#FFC107', location: 'Upper abdomen', governs: 'Confidence, willpower, self-esteem, personal power', element: 'Fire', mantra: 'RAM', signs: ['Aries', 'Leo', 'Sagittarius'], affirmation: 'I am confident, powerful, and capable of great things.', crystals: ['Citrine', 'Tiger\'s Eye', 'Yellow Jasper'], foods: ['Bananas', 'Corn', 'Ginger', 'Turmeric'], yPosition: 185 },
    { name: 'Sacral', sanskrit: 'Svadhisthana', color: '#FF9800', location: 'Lower abdomen', governs: 'Creativity, pleasure, emotions, sensuality', element: 'Water', mantra: 'VAM', signs: ['Cancer', 'Scorpio', 'Pisces'], affirmation: 'I embrace pleasure and abundance in my life.', crystals: ['Carnelian', 'Orange Calcite', 'Moonstone'], foods: ['Oranges', 'Mangoes', 'Coconut', 'Sweet potato'], yPosition: 218 },
    { name: 'Root', sanskrit: 'Muladhara', color: '#F44336', location: 'Base of spine', governs: 'Survival, security, grounding, stability', element: 'Earth', mantra: 'LAM', signs: ['Taurus', 'Virgo', 'Capricorn'], affirmation: 'I am safe, grounded, and secure in this world.', crystals: ['Red Jasper', 'Black Tourmaline', 'Hematite'], foods: ['Root vegetables', 'Red fruits', 'Protein-rich foods'], yPosition: 260 },
];

function getZodiacSign(date: Date): string {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries';
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus';
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini';
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer';
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo';
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo';
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra';
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio';
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius';
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Capricorn';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius';
    return 'Pisces';
}

function getChakraAlignment(sign: string): { chakra: ChakraData; strength: number }[] {
    return CHAKRAS.map(c => ({
        chakra: c,
        strength: c.signs.includes(sign) ? 85 + Math.round(Math.random() * 15) : 30 + Math.round(Math.random() * 40),
    }));
}

export default function ChakraScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const sign = getZodiacSign(birthDate);
    const alignment = React.useMemo(() => getChakraAlignment(sign), [sign]);
    const primaryChakra = alignment.reduce((best, a) => a.strength > best.strength ? a : best, alignment[0]);

    return (
        <LinearGradient colors={['#0d001a', '#1a0a2a', '#0a0d1a']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d001a" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🧘 Your Chakra Profile</Text>
                <Text style={styles.subtitle}>{sign} Energy Alignment</Text>

                {/* Body Diagram with Chakras */}
                <View style={styles.bodyCard}>
                    <Svg width={180} height={310} viewBox="0 0 180 310">
                        {/* Simple body silhouette */}
                        <Circle cx={90} cy={45} r={28} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        {/* Neck */}
                        <Line x1={82} y1={73} x2={82} y2={95} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        <Line x1={98} y1={73} x2={98} y2={95} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        {/* Torso */}
                        <Line x1={65} y1={95} x2={65} y2={240} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        <Line x1={115} y1={95} x2={115} y2={240} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        <Line x1={65} y1={95} x2={82} y2={95} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        <Line x1={98} y1={95} x2={115} y2={95} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        {/* Arms */}
                        <Line x1={65} y1={100} x2={35} y2={190} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                        <Line x1={115} y1={100} x2={145} y2={190} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                        {/* Legs */}
                        <Line x1={75} y1={240} x2={70} y2={300} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                        <Line x1={105} y1={240} x2={110} y2={300} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                        {/* Chakra circles */}
                        {alignment.map((a, i) => {
                            const glow = a.strength > 70;
                            return (
                                <G key={a.chakra.name}>
                                    {glow && <Circle cx={90} cy={a.chakra.yPosition} r={14} fill={a.chakra.color} opacity={0.15} />}
                                    <Circle cx={90} cy={a.chakra.yPosition} r={8} fill={a.chakra.color} opacity={glow ? 0.9 : 0.35} />
                                    <SvgText x={145} y={a.chakra.yPosition + 4} fill={a.chakra.color} fontSize={9} fontWeight="bold">{a.chakra.name}</SvgText>
                                    <SvgText x={145} y={a.chakra.yPosition + 14} fill="rgba(255,255,255,0.4)" fontSize={7}>{a.strength}%</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                {/* Primary Chakra */}
                <View style={[styles.card, { borderColor: primaryChakra.chakra.color + '66' }]}>
                    <Text style={styles.cardTitle}>⭐ Primary Chakra: {primaryChakra.chakra.name}</Text>
                    <Text style={[styles.sanskritText, { color: primaryChakra.chakra.color }]}>{primaryChakra.chakra.sanskrit}</Text>
                    <Text style={styles.cardBody}>As a {sign}, your {primaryChakra.chakra.name} Chakra is your strongest energy center, governing {primaryChakra.chakra.governs.toLowerCase()}.</Text>
                    <Text style={styles.mantraText}>Mantra: {primaryChakra.chakra.mantra}</Text>
                </View>

                {/* Alignment Bar Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Chakra Alignment</Text>
                    <Svg width="100%" height={CHAKRAS.length * 40 + 10} viewBox={`0 0 320 ${CHAKRAS.length * 40 + 10}`}>
                        {alignment.map((a, i) => {
                            const y = i * 40 + 5;
                            const barW = (a.strength / 100) * 170;
                            return (
                                <G key={a.chakra.name}>
                                    <Circle cx={12} cy={y + 13} r={7} fill={a.chakra.color} opacity={0.8} />
                                    <SvgText x={26} y={y + 17} fill="#fff" fontSize={11} fontWeight="bold">{a.chakra.name}</SvgText>
                                    <Rect x={110} y={y + 3} width={170} height={20} rx={6} fill="rgba(255,255,255,0.06)" />
                                    <Rect x={110} y={y + 3} width={barW} height={20} rx={6} fill={a.chakra.color} opacity={0.7} />
                                    <SvgText x={110 + barW + 6} y={y + 17} fill={a.chakra.color} fontSize={10} fontWeight="bold">{a.strength}%</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                {/* Individual Chakra Details */}
                {CHAKRAS.map((c, i) => {
                    const a = alignment[i];
                    const isStrong = a.strength > 70;
                    return (
                        <View key={c.name} style={[styles.card, isStrong && { borderColor: c.color + '44' }]}>
                            <View style={styles.chakraHeader}>
                                <View style={[styles.chakraDot, { backgroundColor: c.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.chakraName}>{c.name} Chakra</Text>
                                    <Text style={[styles.chakraSanskrit, { color: c.color }]}>{c.sanskrit} — {c.element}</Text>
                                </View>
                                <Text style={[styles.chakraPercent, { color: c.color }]}>{a.strength}%</Text>
                            </View>
                            <Text style={styles.locationText}>📍 {c.location}</Text>
                            <Text style={styles.governsText}>{c.governs}</Text>
                            <View style={styles.affirmationBox}>
                                <Text style={styles.affirmationLabel}>💫 Affirmation</Text>
                                <Text style={styles.affirmation}>"{c.affirmation}"</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <View style={styles.detailCol}>
                                    <Text style={styles.detailLabel}>💎 Crystals</Text>
                                    {c.crystals.map(cr => <Text key={cr} style={styles.detailItem}>{cr}</Text>)}
                                </View>
                                <View style={styles.detailCol}>
                                    <Text style={styles.detailLabel}>🍎 Healing Foods</Text>
                                    {c.foods.map(f => <Text key={f} style={styles.detailItem}>{f}</Text>)}
                                </View>
                            </View>
                            <Text style={styles.zodiacLink}>♈ Associated signs: {c.signs.join(', ')}</Text>
                        </View>
                    );
                })}

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 },
    bodyCard: { alignItems: 'center', marginBottom: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    sanskritText: { fontSize: 14, fontWeight: '700', fontStyle: 'italic', marginBottom: 6 },
    mantraText: { fontSize: 16, color: '#FFE082', fontWeight: '800', marginTop: 8 },
    chakraHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    chakraDot: { width: 16, height: 16, borderRadius: 8 },
    chakraName: { fontSize: 16, fontWeight: '800', color: '#fff' },
    chakraSanskrit: { fontSize: 11, fontWeight: '600' },
    chakraPercent: { fontSize: 18, fontWeight: '900' },
    locationText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
    governsText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8, lineHeight: 20 },
    affirmationBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 10 },
    affirmationLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
    affirmation: { fontSize: 14, color: '#FFE082', fontStyle: 'italic', lineHeight: 22 },
    detailRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    detailItem: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
    zodiacLink: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: 4 },
});
