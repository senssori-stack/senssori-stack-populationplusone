import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Element'>;

const ELEMENTS = {
    Fire: {
        symbol: '🔥', color: '#F44336', gradient: ['#2a0a0a', '#4a1a0a'],
        signs: ['Aries', 'Leo', 'Sagittarius'],
        quality: 'Cardinal energy that initiates and transforms',
        personality: 'Fire signs are the pioneers and performers of the zodiac. Driven by passion, enthusiasm, and an unquenchable spirit, they light up every room they enter. Fire energy is about action, courage, and living life at full volume.',
        strengths: ['Passionate', 'Courageous', 'Creative', 'Enthusiastic', 'Inspirational', 'Confident'],
        challenges: ['Impulsive', 'Impatient', 'Self-centered', 'Aggressive', 'Burnout-prone'],
        compatibility: { best: 'Air', good: 'Fire', neutral: 'Earth', challenging: 'Water' },
        bodyGoverns: 'Head, muscles, blood, adrenals',
        season: 'Summer',
        direction: 'South',
        chakra: 'Solar Plexus',
        tarot: 'Wands',
        activities: ['Adventure sports', 'Dance', 'Competitive games', 'Leadership roles', 'Creative arts'],
        foods: ['Spicy peppers', 'Cinnamon', 'Ginger', 'Red meat', 'Garlic'],
        crystals: ['Carnelian', 'Fire Opal', 'Red Jasper', 'Sunstone'],
    },
    Earth: {
        symbol: '🌍', color: '#8BC34A', gradient: ['#0a1a0a', '#1a2a0a'],
        signs: ['Taurus', 'Virgo', 'Capricorn'],
        quality: 'Fixed energy that builds and sustains',
        personality: 'Earth signs are the builders and keepers of the zodiac. Grounded, practical, and endlessly reliable, they create lasting foundations in everything they do. Earth energy is about patience, persistence, and material mastery.',
        strengths: ['Reliable', 'Patient', 'Practical', 'Loyal', 'Hardworking', 'Sensual'],
        challenges: ['Stubborn', 'Materialistic', 'Resistant to change', 'Overworking', 'Possessive'],
        compatibility: { best: 'Water', good: 'Earth', neutral: 'Fire', challenging: 'Air' },
        bodyGoverns: 'Bones, skin, teeth, digestive system',
        season: 'Autumn',
        direction: 'North',
        chakra: 'Root',
        tarot: 'Pentacles',
        activities: ['Gardening', 'Cooking', 'Hiking', 'Pottery', 'Financial planning'],
        foods: ['Root vegetables', 'Grains', 'Mushrooms', 'Nuts', 'Dark leafy greens'],
        crystals: ['Emerald', 'Jade', 'Peridot', 'Moss Agate'],
    },
    Air: {
        symbol: '💨', color: '#03A9F4', gradient: ['#0a0a2a', '#0a1a3a'],
        signs: ['Gemini', 'Libra', 'Aquarius'],
        quality: 'Mutable energy that connects and communicates',
        personality: 'Air signs are the thinkers and communicators of the zodiac. Intellectual, social, and endlessly curious, they navigate the world through ideas and connections. Air energy is about thought, communication, and social harmony.',
        strengths: ['Intellectual', 'Communicative', 'Adaptable', 'Social', 'Innovative', 'Fair-minded'],
        challenges: ['Detached', 'Indecisive', 'Superficial', 'Overthinking', 'Restless'],
        compatibility: { best: 'Fire', good: 'Air', neutral: 'Water', challenging: 'Earth' },
        bodyGoverns: 'Lungs, nervous system, circulation',
        season: 'Spring',
        direction: 'East',
        chakra: 'Heart & Throat',
        tarot: 'Swords',
        activities: ['Reading', 'Debating', 'Social events', 'Travel', 'Writing'],
        foods: ['Light salads', 'Berries', 'Mint', 'Citrus fruits', 'Herbal teas'],
        crystals: ['Aquamarine', 'Blue Lace Agate', 'Celestite', 'Clear Quartz'],
    },
    Water: {
        symbol: '🌊', color: '#9C27B0', gradient: ['#0a0020', '#1a0a2a'],
        signs: ['Cancer', 'Scorpio', 'Pisces'],
        quality: 'Receptive energy that feels and heals',
        personality: 'Water signs are the feelers and healers of the zodiac. Deeply emotional, intuitive, and empathic, they navigate life through feeling rather than thinking. Water energy is about emotion, intuition, and spiritual depth.',
        strengths: ['Intuitive', 'Empathic', 'Nurturing', 'Creative', 'Healing', 'Loyal'],
        challenges: ['Moody', 'Oversensitive', 'Manipulative', 'Escapist', 'Clingy'],
        compatibility: { best: 'Earth', good: 'Water', neutral: 'Air', challenging: 'Fire' },
        bodyGoverns: 'Lymphatic system, kidneys, reproductive system',
        season: 'Winter',
        direction: 'West',
        chakra: 'Sacral',
        tarot: 'Cups',
        activities: ['Swimming', 'Meditation', 'Music', 'Art therapy', 'Journaling'],
        foods: ['Seaweed', 'Fish', 'Melons', 'Cucumber', 'Coconut water'],
        crystals: ['Moonstone', 'Amethyst', 'Pearl', 'Labradorite'],
    },
};

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

function getElement(sign: string): string {
    for (const [elem, data] of Object.entries(ELEMENTS)) {
        if (data.signs.includes(sign)) return elem;
    }
    return 'Fire';
}

export default function ElementScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const sign = getZodiacSign(birthDate);
    const userElement = getElement(sign);
    const data = ELEMENTS[userElement as keyof typeof ELEMENTS];

    // Element distribution pie chart (simplified bar representation)
    const allElements = Object.entries(ELEMENTS);
    const elementStrengths = allElements.map(([name, e]) => ({
        name,
        symbol: e.symbol,
        color: e.color,
        strength: name === userElement ? 60 : name === data.compatibility.best ? 25 : 10,
    }));

    return (
        <LinearGradient colors={data.gradient as [string, string, ...string[]]} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={data.gradient[0]} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>{data.symbol} Your Element: {userElement}</Text>
                <Text style={styles.subtitle}>{sign} — {data.quality}</Text>

                {/* Element wheel */}
                <View style={styles.wheelContainer}>
                    <Svg width={220} height={220} viewBox="0 0 220 220">
                        {allElements.map(([name, e], i) => {
                            const angle = (i * 90 - 45) * (Math.PI / 180);
                            const r = 70;
                            const x = 110 + r * Math.cos(angle);
                            const y = 110 + r * Math.sin(angle);
                            const isUser = name === userElement;
                            return (
                                <G key={name}>
                                    <Circle cx={x} cy={y} r={isUser ? 32 : 26} fill={e.color} opacity={isUser ? 0.35 : 0.15} />
                                    <Circle cx={x} cy={y} r={isUser ? 28 : 22} fill={e.color} opacity={isUser ? 0.9 : 0.4} />
                                    <SvgText x={x} y={y - 4} fill="#fff" fontSize={isUser ? 22 : 16} textAnchor="middle">{e.symbol}</SvgText>
                                    <SvgText x={x} y={y + 14} fill="#fff" fontSize={isUser ? 10 : 8} fontWeight={isUser ? 'bold' : 'normal'} textAnchor="middle">{name}</SvgText>
                                    {/* Connection lines */}
                                    {i < allElements.length - 1 && (
                                        <Line x1={x} y1={y} x2={110 + 70 * Math.cos(((i + 1) * 90 - 45) * (Math.PI / 180))} y2={110 + 70 * Math.sin(((i + 1) * 90 - 45) * (Math.PI / 180))} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                    )}
                                </G>
                            );
                        })}
                        {/* Center sign */}
                        <Circle cx={110} cy={110} r={18} fill={data.color} opacity={0.2} />
                        <SvgText x={110} y={114} fill={data.color} fontSize={14} fontWeight="bold" textAnchor="middle">{sign}</SvgText>
                    </Svg>
                </View>

                {/* Signs under this element */}
                <View style={styles.signsRow}>
                    {data.signs.map(s => (
                        <View key={s} style={[styles.signBadge, s === sign && { borderColor: data.color, borderWidth: 2 }]}>
                            <Text style={styles.signName}>{s}</Text>
                            {s === sign && <Text style={{ fontSize: 8, color: data.color }}>← YOU</Text>}
                        </View>
                    ))}
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 {userElement} Element Personality</Text>
                    <Text style={styles.cardBody}>{data.personality}</Text>
                </View>

                {/* Strengths & Challenges */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Strengths vs Challenges</Text>
                    <Svg width="100%" height={220} viewBox="0 0 320 220">
                        {/* Strengths on left (green bars going left) */}
                        <SvgText x={160} y={15} fill="#4CAF50" fontSize={11} fontWeight="bold" textAnchor="middle">Strengths</SvgText>
                        {data.strengths.slice(0, 5).map((s, i) => {
                            const y = 30 + i * 36;
                            const w = 100 + (5 - i) * 12;
                            return (
                                <G key={`s-${s}`}>
                                    <Rect x={155 - w} y={y} width={w} height={22} rx={6} fill="#4CAF50" opacity={0.6 + i * 0.06} />
                                    <SvgText x={155 - w + 8} y={y + 15} fill="#fff" fontSize={10} fontWeight="bold">{s}</SvgText>
                                </G>
                            );
                        })}
                        {/* Challenges on right (red bars going right) */}
                        <SvgText x={160} y={15} fill="#4CAF50" fontSize={0} textAnchor="middle">{''}</SvgText>
                        {data.challenges.slice(0, 5).map((c, i) => {
                            const y = 30 + i * 36;
                            const w = 80 + (5 - i) * 10;
                            return (
                                <G key={`c-${c}`}>
                                    <Rect x={165} y={y} width={w} height={22} rx={6} fill="#F44336" opacity={0.5 + i * 0.06} />
                                    <SvgText x={173} y={y + 15} fill="#fff" fontSize={10} fontWeight="bold">{c}</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                {/* Compatibility */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💕 Element Compatibility</Text>
                    {Object.entries(data.compatibility).map(([level, elem]) => {
                        const e = ELEMENTS[elem as keyof typeof ELEMENTS];
                        const labels: Record<string, string> = { best: '🟢 Best Match', good: '🔵 Good Match', neutral: '🟡 Neutral', challenging: '🔴 Challenging' };
                        return (
                            <View key={level} style={styles.compatRow}>
                                <Text style={styles.compatLabel}>{labels[level]}</Text>
                                <Text style={[styles.compatElement, { color: e?.color || '#fff' }]}>{e?.symbol || ''} {elem}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Correspondences */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔮 {userElement} Correspondences</Text>
                    <View style={styles.detailGrid}>
                        <View style={styles.detailItem}><Text style={styles.dl}>🧭 Direction</Text><Text style={styles.dv}>{data.direction}</Text></View>
                        <View style={styles.detailItem}><Text style={styles.dl}>🍂 Season</Text><Text style={styles.dv}>{data.season}</Text></View>
                        <View style={styles.detailItem}><Text style={styles.dl}>🧘 Chakra</Text><Text style={styles.dv}>{data.chakra}</Text></View>
                        <View style={styles.detailItem}><Text style={styles.dl}>🃏 Tarot Suit</Text><Text style={styles.dv}>{data.tarot}</Text></View>
                        <View style={styles.detailItem}><Text style={styles.dl}>🫀 Body</Text><Text style={styles.dv}>{data.bodyGoverns}</Text></View>
                    </View>
                </View>

                {/* Activities, Foods, Crystals */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>✨ {userElement} Energy Boosters</Text>
                    <Text style={styles.sectionLabel}>🏃 Activities</Text>
                    <View style={styles.tagRow}>{data.activities.map(a => <View key={a} style={[styles.tag, { backgroundColor: data.color + '22' }]}><Text style={[styles.tagText, { color: data.color }]}>{a}</Text></View>)}</View>
                    <Text style={styles.sectionLabel}>🍎 Power Foods</Text>
                    <View style={styles.tagRow}>{data.foods.map(f => <View key={f} style={[styles.tag, { backgroundColor: data.color + '22' }]}><Text style={[styles.tagText, { color: data.color }]}>{f}</Text></View>)}</View>
                    <Text style={styles.sectionLabel}>💎 Crystals</Text>
                    <View style={styles.tagRow}>{data.crystals.map(c => <View key={c} style={[styles.tag, { backgroundColor: data.color + '22' }]}><Text style={[styles.tagText, { color: data.color }]}>{c}</Text></View>)}</View>
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
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 },
    wheelContainer: { alignItems: 'center', marginBottom: 16 },
    signsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
    signBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    signName: { color: '#fff', fontWeight: '700', fontSize: 14 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    compatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    compatLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    compatElement: { fontSize: 14, fontWeight: '800' },
    detailGrid: { gap: 8 },
    detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dl: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    dv: { fontSize: 13, color: '#fff', fontWeight: '700' },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 6, marginTop: 10 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    tagText: { fontSize: 12, fontWeight: '700' },
});
