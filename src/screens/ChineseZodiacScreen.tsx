import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Rect, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChineseZodiac'>;

const ANIMALS = [
    { name: 'Rat', emoji: '🐀', years: '2020, 2008, 1996, 1984, 1972', element: 'Water', traits: ['Clever', 'Quick-witted', 'Resourceful', 'Versatile'], lucky: '2, 3', color: '#4FC3F7', bestMatch: ['Dragon', 'Monkey', 'Ox'], worstMatch: ['Horse', 'Goat'], personality: 'Rats are clever and quick thinkers. They are successful but content with a quiet, peaceful life. People born in the Year of the Rat are charming yet aggressive, and they are thrifty with money.' },
    { name: 'Ox', emoji: '🐂', years: '2021, 2009, 1997, 1985, 1973', element: 'Earth', traits: ['Diligent', 'Dependable', 'Strong', 'Determined'], lucky: '1, 4', color: '#A1887F', bestMatch: ['Rat', 'Snake', 'Rooster'], worstMatch: ['Tiger', 'Dragon', 'Horse', 'Goat'], personality: 'Oxen are strong, reliable, fair and conscientious. They are calm and patient, methodical, and they can be trusted. They have fierce tempers when provoked and are known for their stubbornness.' },
    { name: 'Tiger', emoji: '🐅', years: '2022, 2010, 1998, 1986, 1974', element: 'Wood', traits: ['Brave', 'Competitive', 'Confident', 'Unpredictable'], lucky: '1, 3, 4', color: '#FF8A65', bestMatch: ['Dragon', 'Horse', 'Pig'], worstMatch: ['Ox', 'Tiger', 'Snake', 'Monkey'], personality: 'Tigers are courageous and active. They love adventure and are generous and passionate. They are natural leaders with an air of authority that demands respect.' },
    { name: 'Rabbit', emoji: '🐇', years: '2023, 2011, 1999, 1987, 1975', element: 'Wood', traits: ['Gentle', 'Quiet', 'Elegant', 'Alert'], lucky: '3, 4, 6', color: '#CE93D8', bestMatch: ['Goat', 'Monkey', 'Dog', 'Pig'], worstMatch: ['Snake', 'Rooster'], personality: 'Rabbits are gentle, quiet, elegant, and alert. They are quick, skillful, kind, and patient. They have a special connection to beauty and are artistic and possess good judgment.' },
    { name: 'Dragon', emoji: '🐉', years: '2024, 2012, 2000, 1988, 1976', element: 'Earth', traits: ['Confident', 'Intelligent', 'Ambitious', 'Driven'], lucky: '1, 6, 7', color: '#FFD54F', bestMatch: ['Rooster', 'Rat', 'Monkey'], worstMatch: ['Ox', 'Goat', 'Dog'], personality: 'Dragons are powerful, courageous, and intelligent. The Dragon symbolizes power, nobleness, honor, luck, and success. They are natural leaders who attract followers with charisma.' },
    { name: 'Snake', emoji: '🐍', years: '2025, 2013, 2001, 1989, 1977', element: 'Fire', traits: ['Enigmatic', 'Intelligent', 'Wise', 'Graceful'], lucky: '2, 8, 9', color: '#66BB6A', bestMatch: ['Dragon', 'Rooster'], worstMatch: ['Tiger', 'Rabbit', 'Snake', 'Goat', 'Pig'], personality: 'Snakes are enigmatic and intelligent. They are deep thinkers who rely on their own judgment. Wise and charming, they are romantic and often take the lead in relationships.' },
    { name: 'Horse', emoji: '🐴', years: '2026, 2014, 2002, 1990, 1978', element: 'Fire', traits: ['Animated', 'Active', 'Energetic', 'Free-spirited'], lucky: '2, 3, 7', color: '#EF5350', bestMatch: ['Tiger', 'Goat', 'Rabbit'], worstMatch: ['Rat', 'Ox', 'Rooster', 'Horse'], personality: 'Horses are active and energetic. They love being in crowds and enjoy entertainment and large gatherings. They are witty, perceptive, and talented but can be impatient.' },
    { name: 'Goat', emoji: '🐐', years: '2027, 2015, 2003, 1991, 1979', element: 'Earth', traits: ['Calm', 'Gentle', 'Sympathetic', 'Creative'], lucky: '2, 7', color: '#BCAAA4', bestMatch: ['Rabbit', 'Horse', 'Pig'], worstMatch: ['Ox', 'Tiger', 'Dog'], personality: 'Goats are gentle and calm. They are able to maintain inner peace despite outer turbulence. They are creative and bring unique beauty to everything they touch with strong artistic sensibility.' },
    { name: 'Monkey', emoji: '🐒', years: '2028, 2016, 2004, 1992, 1980', element: 'Metal', traits: ['Sharp', 'Smart', 'Curious', 'Mischievous'], lucky: '4, 9', color: '#FFB74D', bestMatch: ['Ox', 'Rabbit'], worstMatch: ['Tiger', 'Pig'], personality: 'Monkeys are sharp, smart, and curious. They have magnetic personalities and are incredibly witty. Their intelligence and charm make them natural entertainers and problem-solvers.' },
    { name: 'Rooster', emoji: '🐓', years: '2029, 2017, 2005, 1993, 1981', element: 'Metal', traits: ['Observant', 'Hardworking', 'Courageous', 'Talented'], lucky: '5, 7, 8', color: '#F44336', bestMatch: ['Ox', 'Snake'], worstMatch: ['Rat', 'Rabbit', 'Horse', 'Rooster', 'Dog'], personality: 'Roosters are observant, hardworking, and courageous. They are very loyal and honest individuals who speak their mind freely. They are practical and resourceful and very confident.' },
    { name: 'Dog', emoji: '🐕', years: '2030, 2018, 2006, 1994, 1982', element: 'Earth', traits: ['Loyal', 'Honest', 'Amiable', 'Kind'], lucky: '3, 4, 9', color: '#8D6E63', bestMatch: ['Rabbit'], worstMatch: ['Dragon', 'Goat', 'Rooster'], personality: 'Dogs are loyal and honest. They are not afraid of difficulties in daily life. They inspire confidence in others and know how to keep secrets. Dogs are valued for their loyalty and devotion.' },
    { name: 'Pig', emoji: '🐷', years: '2031, 2019, 2007, 1995, 1983', element: 'Water', traits: ['Compassionate', 'Generous', 'Diligent', 'Optimistic'], lucky: '2, 5, 8', color: '#F48FB1', bestMatch: ['Tiger', 'Rabbit', 'Goat'], worstMatch: ['Snake', 'Monkey'], personality: 'Pigs are compassionate and generous. They concentrate well and once they set a goal, they will devote all their energy to achieving it. They have great fortitude and tremendous inner strength.' },
];

const ELEMENTS_DATA: Record<string, { color: string; emoji: string; meaning: string }> = {
    'Metal': { color: '#CFD8DC', emoji: '⚔️', meaning: 'Determined, self-reliant, resolute. Metal people are strong-willed and set in their ways.' },
    'Water': { color: '#4FC3F7', emoji: '🌊', meaning: 'Sympathetic, flexible, diplomatic. Water people are intuitive and good at reading others.' },
    'Wood': { color: '#66BB6A', emoji: '🌿', meaning: 'Generous, warm, cooperative. Wood people seek growth, exploration, and pushing boundaries.' },
    'Fire': { color: '#FF7043', emoji: '🔥', meaning: 'Passionate, adventurous, decisive. Fire people are dynamic leaders full of energy.' },
    'Earth': { color: '#BCAAA4', emoji: '🌍', meaning: 'Grounded, reliable, nurturing. Earth people are practical and provide stability to others.' },
};

function getChineseZodiacAnimal(year: number): string {
    const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    const baseYear = 1924;
    const index = (year - baseYear) % 12;
    return animals[index < 0 ? index + 12 : index];
}

function getElement(year: number): string {
    const elements = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
    return elements[year % 10];
}

function getYinYang(year: number): string {
    return year % 2 === 0 ? 'Yang ☀️' : 'Yin 🌙';
}

export default function ChineseZodiacScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const year = birthDate.getFullYear();

    const animalName = getChineseZodiacAnimal(year);
    const element = getElement(year);
    const yinYang = getYinYang(year);
    const animalData = ANIMALS.find(a => a.name === animalName)!;
    const elementData = ELEMENTS_DATA[element];

    // Compatibility chart data
    const compatData = useMemo(() => {
        return ANIMALS.map(a => {
            const isBest = animalData.bestMatch.includes(a.name);
            const isWorst = animalData.worstMatch.includes(a.name);
            const isSelf = a.name === animalName;
            const score = isSelf ? 70 : isBest ? 95 : isWorst ? 25 : 60;
            return { ...a, score, isBest, isWorst, isSelf };
        });
    }, [animalName]);

    // Trait strength chart (pseudo-random but deterministic per animal)
    const traitScores = useMemo(() => {
        const traits = [
            { name: 'Intelligence', icon: '🧠' },
            { name: 'Courage', icon: '⚔️' },
            { name: 'Creativity', icon: '🎨' },
            { name: 'Loyalty', icon: '❤️' },
            { name: 'Ambition', icon: '🏆' },
            { name: 'Patience', icon: '🧘' },
            { name: 'Charisma', icon: '✨' },
            { name: 'Adaptability', icon: '🔄' },
        ];
        const animalIndex = ANIMALS.findIndex(a => a.name === animalName);
        const seed = animalIndex * 17 + 42;
        return traits.map((t, i) => ({
            ...t,
            score: Math.min(98, Math.max(35, ((seed * (i + 3) * 13) % 60) + 38)),
        }));
    }, [animalName]);

    return (
        <LinearGradient colors={['#1a0000', '#2d0a0a', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0000" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.animalEmoji}>{animalData.emoji}</Text>
                    <Text style={styles.mainTitle}>Year of the {animalName}</Text>
                    <Text style={styles.yearText}>{year}</Text>
                </View>

                {/* Element & Yin/Yang Badge */}
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: elementData.color + '33' }]}>
                        <Text style={styles.badgeText}>{elementData.emoji} {element}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: 'rgba(255,215,0,0.15)' }]}>
                        <Text style={styles.badgeText}>{yinYang}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: animalData.color + '33' }]}>
                        <Text style={styles.badgeText}>🍀 Lucky: {animalData.lucky}</Text>
                    </View>
                </View>

                {/* Personality */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 Personality</Text>
                    <Text style={styles.cardBody}>{animalData.personality}</Text>
                </View>

                {/* Element Meaning */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{elementData.emoji} {element} Element</Text>
                    <Text style={styles.cardBody}>{elementData.meaning}</Text>
                </View>

                {/* Trait Strength Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Trait Strength Chart</Text>
                    <Svg width="100%" height={traitScores.length * 38 + 10} viewBox={`0 0 320 ${traitScores.length * 38 + 10}`}>
                        {traitScores.map((t, i) => {
                            const y = i * 38 + 8;
                            const barWidth = (t.score / 100) * 200;
                            return (
                                <G key={t.name}>
                                    <SvgText x={0} y={y + 14} fill="#fff" fontSize={12} fontWeight="600">{t.icon} {t.name}</SvgText>
                                    <Rect x={110} y={y} width={200} height={22} rx={6} fill="rgba(255,255,255,0.08)" />
                                    <Rect x={110} y={y} width={barWidth} height={22} rx={6} fill={animalData.color} opacity={0.85} />
                                    <SvgText x={110 + barWidth + 6} y={y + 15} fill="#fff" fontSize={11} fontWeight="bold">{t.score}%</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                {/* Key Traits */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💫 Key Traits</Text>
                    <View style={styles.traitRow}>
                        {animalData.traits.map(t => (
                            <View key={t} style={[styles.traitChip, { backgroundColor: animalData.color + '33' }]}>
                                <Text style={[styles.traitChipText, { color: animalData.color }]}>{t}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Compatibility Wheel */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💕 Compatibility Chart</Text>
                    <Text style={styles.cardSubtitle}>How {animalName} pairs with each animal</Text>
                    <Svg width="100%" height={300} viewBox="0 0 300 300">
                        {/* Wheel of animals */}
                        {compatData.map((c, i) => {
                            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
                            const r = 120;
                            const x = 150 + r * Math.cos(angle);
                            const y = 150 + r * Math.sin(angle);
                            const lineColor = c.isBest ? '#4CAF50' : c.isWorst ? '#F44336' : 'rgba(255,255,255,0.2)';
                            const lineWidth = c.isBest ? 2.5 : c.isWorst ? 2 : 0.5;
                            return (
                                <G key={c.name}>
                                    <Line x1={150} y1={150} x2={x} y2={y} stroke={lineColor} strokeWidth={lineWidth} />
                                    <Circle cx={x} cy={y} r={c.isSelf ? 22 : 18} fill={c.isBest ? 'rgba(76,175,80,0.25)' : c.isWorst ? 'rgba(244,67,54,0.25)' : 'rgba(255,255,255,0.08)'} stroke={c.isBest ? '#4CAF50' : c.isWorst ? '#F44336' : 'rgba(255,255,255,0.3)'} strokeWidth={c.isSelf ? 2 : 1} />
                                    <SvgText x={x} y={y - 3} fill="#fff" fontSize={16} textAnchor="middle">{c.emoji}</SvgText>
                                    <SvgText x={x} y={y + 12} fill={c.isBest ? '#4CAF50' : c.isWorst ? '#F44336' : 'rgba(255,255,255,0.7)'} fontSize={7} fontWeight="bold" textAnchor="middle">{c.score}%</SvgText>
                                </G>
                            );
                        })}
                        {/* Center - your animal */}
                        <Circle cx={150} cy={150} r={26} fill={animalData.color + '33'} stroke={animalData.color} strokeWidth={2} />
                        <SvgText x={150} y={148} fill="#fff" fontSize={22} textAnchor="middle">{animalData.emoji}</SvgText>
                        <SvgText x={150} y={165} fill="#fff" fontSize={8} fontWeight="bold" textAnchor="middle">YOU</SvgText>
                    </Svg>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} /><Text style={styles.legendText}>Best Match</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#F44336' }]} /><Text style={styles.legendText}>Conflict</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} /><Text style={styles.legendText}>Neutral</Text></View>
                    </View>
                </View>

                {/* Best & Worst Matches */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>✅ Best Matches</Text>
                    {animalData.bestMatch.map(m => {
                        const match = ANIMALS.find(a => a.name === m)!;
                        return (
                            <View key={m} style={styles.matchRow}>
                                <Text style={styles.matchEmoji}>{match.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.matchName}>{match.name}</Text>
                                    <Text style={styles.matchDesc}>Harmonious relationship — complementary traits</Text>
                                </View>
                                <Text style={styles.matchScore}>95%</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>⚠️ Challenging Matches</Text>
                    {animalData.worstMatch.map(m => {
                        const match = ANIMALS.find(a => a.name === m)!;
                        return (
                            <View key={m} style={styles.matchRow}>
                                <Text style={styles.matchEmoji}>{match.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.matchName}>{match.name}</Text>
                                    <Text style={styles.matchDesc}>May face conflicts — requires understanding</Text>
                                </View>
                                <Text style={[styles.matchScore, { color: '#F44336' }]}>25%</Text>
                            </View>
                        );
                    })}
                </View>

                {/* All 12 Animals Reference */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏮 The 12 Animals</Text>
                    <View style={styles.animalGrid}>
                        {ANIMALS.map(a => (
                            <View key={a.name} style={[styles.animalCell, a.name === animalName && { borderColor: animalData.color, borderWidth: 2, backgroundColor: animalData.color + '15' }]}>
                                <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                                <Text style={styles.animalCellName}>{a.name}</Text>
                                <Text style={styles.animalCellElement}>{a.element}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    animalEmoji: { fontSize: 72, marginBottom: 8 },
    mainTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
    yearText: { fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    badgeRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10, marginTop: -6 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    traitChip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
    traitChipText: { fontSize: 13, fontWeight: '700' },
    legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    matchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    matchEmoji: { fontSize: 28, marginRight: 12 },
    matchName: { fontSize: 15, fontWeight: '700', color: '#fff' },
    matchDesc: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    matchScore: { fontSize: 18, fontWeight: '900', color: '#4CAF50' },
    animalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    animalCell: { width: 90, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    animalCellName: { fontSize: 12, fontWeight: '700', color: '#fff', marginTop: 4 },
    animalCellElement: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
});
