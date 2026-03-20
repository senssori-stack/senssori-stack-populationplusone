import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, G, Rect, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ZodiacCompatibility'>;

const SIGNS = [
    { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21–Apr 19', color: '#F44336' },
    { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20–May 20', color: '#8BC34A' },
    { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21–Jun 20', color: '#FFC107' },
    { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21–Jul 22', color: '#90CAF9' },
    { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23–Aug 22', color: '#FF9800' },
    { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23–Sep 22', color: '#795548' },
    { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23–Oct 22', color: '#E91E63' },
    { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23–Nov 21', color: '#9C27B0' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22–Dec 21', color: '#7C4DFF' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22–Jan 19', color: '#607D8B' },
    { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20–Feb 18', color: '#00BCD4' },
    { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19–Mar 20', color: '#3F51B5' },
];

// Compatibility matrix (row = sign1, col = sign2, value = 0-100)
const COMPAT_MATRIX: number[][] = [
    //   Ari Tau Gem Can Leo Vir Lib Sco Sag Cap Aqu Pis
    [50, 38, 83, 42, 97, 63, 85, 50, 93, 47, 78, 67], // Aries
    [38, 50, 33, 97, 73, 90, 65, 88, 30, 95, 58, 85], // Taurus
    [83, 33, 50, 25, 88, 68, 93, 28, 85, 60, 95, 53], // Gemini
    [42, 97, 25, 50, 35, 78, 43, 94, 53, 60, 25, 98], // Cancer
    [97, 73, 88, 35, 50, 55, 97, 58, 93, 35, 68, 48], // Leo
    [63, 90, 68, 78, 55, 50, 28, 77, 48, 95, 40, 88], // Virgo
    [85, 65, 93, 43, 97, 28, 50, 35, 73, 40, 90, 68], // Libra
    [50, 88, 28, 94, 58, 77, 35, 50, 28, 80, 53, 97], // Scorpio
    [93, 30, 85, 53, 93, 48, 73, 28, 50, 35, 88, 63], // Sagittarius
    [47, 95, 60, 60, 35, 95, 40, 80, 35, 50, 68, 78], // Capricorn
    [78, 58, 95, 25, 68, 40, 90, 53, 88, 68, 50, 45], // Aquarius
    [67, 85, 53, 98, 48, 88, 68, 97, 63, 78, 45, 50], // Pisces
];

const COMPAT_DESCRIPTIONS: Record<string, string> = {
    'Fire-Fire': 'Two fire signs together create explosive passion! You push each other to be your best but watch out for ego clashes. This pairing burns bright — just make sure to give each other space.',
    'Fire-Earth': 'Fire inspires Earth while Earth grounds Fire. This can be a stabilizing partnership where ambition meets practicality, though Fire may find Earth too cautious.',
    'Fire-Air': 'A dynamic and exciting combination! Air fans Fire\'s flames, making this one of the most energetic pairings. Great intellectual and physical chemistry.',
    'Fire-Water': 'Steam! Fire\'s intensity and Water\'s depth create powerful emotions. Can be transformative but also volatile — requires patience from both sides.',
    'Earth-Earth': 'Two grounded souls building something lasting. Great for long-term security and shared goals. May need to inject spontaneity to keep the spark alive.',
    'Earth-Air': 'Air brings fresh ideas while Earth provides structure. Can feel disconnected at times — Air wants freedom, Earth wants stability. Balance is key.',
    'Earth-Water': 'A natural, nurturing combination. Water nourishes Earth, and Earth gives Water structure. One of the most compatible element pairings for lasting love.',
    'Air-Air': 'Two brilliant minds that never run out of things to discuss. Socially vibrant but may struggle with emotional depth. Intellectual soulmates.',
    'Air-Water': 'A challenging but growth-oriented pairing. Air\'s logic and Water\'s emotion can clash, but when balanced, they create profound understanding.',
    'Water-Water': 'Deep emotional connection and intuitive understanding. Two Water signs share a psychic bond, but beware of drowning in emotions together.',
};

function getSign(date: Date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return SIGNS[0];
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return SIGNS[1];
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return SIGNS[2];
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return SIGNS[3];
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return SIGNS[4];
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return SIGNS[5];
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return SIGNS[6];
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return SIGNS[7];
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return SIGNS[8];
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return SIGNS[9];
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return SIGNS[10];
    return SIGNS[11];
}

function getElementPairKey(e1: string, e2: string): string {
    const ordered = [e1, e2].sort();
    return `${ordered[0]}-${ordered[1]}`;
}

export default function ZodiacCompatibilityScreen({ route }: Props) {
    const birthDate1 = new Date(route.params.birthDate + 'T00:00:00');
    const sign1 = getSign(birthDate1);
    const idx1 = SIGNS.indexOf(sign1);
    const defaultIdx2 = (idx1 + 4) % 12; // default to a traditionally compatible sign
    const [selectedIdx2, setSelectedIdx2] = useState<number>(defaultIdx2);

    const sign2 = SIGNS[selectedIdx2];
    const idx2 = selectedIdx2;
    const overallScore = COMPAT_MATRIX[idx1][idx2];
    const elementKey = getElementPairKey(sign1.element, sign2.element);
    const elementDesc = COMPAT_DESCRIPTIONS[elementKey] || 'A unique pairing with its own special dynamics.';

    // Category scores (derived from overall)
    const categories = [
        { name: 'Love & Romance', icon: '❤️', score: Math.min(100, overallScore + Math.round((idx1 * 3 + idx2 * 7) % 15) - 5) },
        { name: 'Communication', icon: '💬', score: Math.min(100, overallScore + Math.round((idx1 * 5 + idx2 * 3) % 20) - 8) },
        { name: 'Trust', icon: '🤝', score: Math.min(100, overallScore + Math.round((idx1 * 7 + idx2 * 5) % 18) - 7) },
        { name: 'Shared Values', icon: '⚖️', score: Math.min(100, overallScore + Math.round((idx1 * 2 + idx2 * 9) % 16) - 6) },
        { name: 'Intimacy', icon: '🔥', score: Math.min(100, overallScore + Math.round((idx1 * 9 + idx2 * 2) % 22) - 9) },
        { name: 'Emotional Bond', icon: '💫', score: Math.min(100, overallScore + Math.round((idx1 * 4 + idx2 * 6) % 14) - 4) },
    ];

    const scoreColor = overallScore >= 80 ? '#4CAF50' : overallScore >= 60 ? '#FFC107' : overallScore >= 40 ? '#FF9800' : '#F44336';
    const scoreLabel = overallScore >= 80 ? 'Soulmates!' : overallScore >= 60 ? 'Great Match' : overallScore >= 40 ? 'With Effort' : 'Challenging';

    return (
        <LinearGradient colors={['#1a0020', '#2d0a2a', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0020" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>💕 Zodiac Compatibility</Text>

                {/* Two signs display */}
                <View style={styles.pairRow}>
                    <View style={styles.signCard}>
                        <Text style={styles.signSymbol}>{sign1.symbol}</Text>
                        <Text style={styles.signName}>{sign1.name}</Text>
                        <Text style={styles.signDates}>{sign1.dates}</Text>
                        <View style={[styles.elementBadge, { backgroundColor: sign1.color + '33' }]}>
                            <Text style={[styles.elementBadgeText, { color: sign1.color }]}>{sign1.element}</Text>
                        </View>
                    </View>

                    <View style={styles.heartContainer}>
                        <Text style={{ fontSize: 36 }}>💕</Text>
                    </View>

                    <View style={[styles.signCard, { borderColor: sign2.color + '66', borderWidth: 2 }]}>
                        <Text style={styles.signSymbol}>{sign2.symbol}</Text>
                        <Text style={styles.signName}>{sign2.name}</Text>
                        <Text style={styles.signDates}>{sign2.dates}</Text>
                        <View style={[styles.elementBadge, { backgroundColor: sign2.color + '33' }]}>
                            <Text style={[styles.elementBadgeText, { color: sign2.color }]}>{sign2.element}</Text>
                        </View>
                    </View>
                </View>

                {/* Zodiac symbol row — right below the two cards */}
                <View style={styles.symbolRow}>
                    {SIGNS.map((s, i) => {
                        const isSelected = i === idx2;
                        return (
                            <TouchableOpacity
                                key={s.name}
                                style={[styles.symbolBtn, isSelected && { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: '#FFD54F' }]}
                                onPress={() => setSelectedIdx2(i)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ fontSize: 22 }}>{s.symbol}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Overall Score - Ring Chart */}
                <View style={styles.scoreCard}>
                    <Svg width={160} height={160} viewBox="0 0 160 160">
                        <Circle cx={80} cy={80} r={65} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} />
                        <Circle cx={80} cy={80} r={65} fill="none" stroke={scoreColor} strokeWidth={12}
                            strokeDasharray={`${overallScore * 4.08} ${408 - overallScore * 4.08}`}
                            strokeDashoffset={102} strokeLinecap="round" />
                        <SvgText x={80} y={72} fill="#fff" fontSize={36} fontWeight="900" textAnchor="middle">{overallScore}</SvgText>
                        <SvgText x={80} y={92} fill="rgba(255,255,255,0.6)" fontSize={12} textAnchor="middle">out of 100</SvgText>
                    </Svg>
                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
                </View>

                {/* Element Pairing */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌍 Element Pairing: {sign1.element} + {sign2.element}</Text>
                    <Text style={styles.cardBody}>{elementDesc}</Text>
                </View>

                {/* Category Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Compatibility Breakdown</Text>
                    <Svg width="100%" height={categories.length * 42 + 10} viewBox={`0 0 320 ${categories.length * 42 + 10}`}>
                        {categories.map((c, i) => {
                            const y = i * 42 + 5;
                            const barW = (c.score / 100) * 180;
                            const barColor = c.score >= 80 ? '#4CAF50' : c.score >= 60 ? '#FFC107' : c.score >= 40 ? '#FF9800' : '#F44336';
                            return (
                                <G key={c.name}>
                                    <SvgText x={0} y={y + 16} fill="#fff" fontSize={12}>{c.icon} {c.name}</SvgText>
                                    <Rect x={130} y={y + 2} width={180} height={20} rx={6} fill="rgba(255,255,255,0.08)" />
                                    <Rect x={130} y={y + 2} width={barW} height={20} rx={6} fill={barColor} opacity={0.8} />
                                    <SvgText x={130 + barW + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight="bold">{c.score}%</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 20, marginTop: 10 },
    pairRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 8 },
    signCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    signSymbol: { fontSize: 42 },
    signName: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 4 },
    signDates: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    elementBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
    elementBadgeText: { fontSize: 11, fontWeight: '700' },
    tapHint: { fontSize: 9, color: 'rgba(255,215,0,0.7)', marginTop: 6 },
    heartContainer: { marginHorizontal: 4 },
    scoreCard: { alignItems: 'center', marginBottom: 20 },
    scoreLabel: { fontSize: 20, fontWeight: '900', marginTop: 8 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    symbolRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 20 },
    symbolBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.04)' },
});
