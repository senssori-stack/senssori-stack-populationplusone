import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Rect, Svg, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SpiritAnimal'>;

interface AnimalData {
    animal: string;
    emoji: string;
    element: string;
    traits: string[];
    description: string;
    strengths: string[];
    challenges: string[];
    message: string;
    power: number; // 0-100
    wisdom: number;
    courage: number;
    intuition: number;
    adaptability: number;
}

const SPIRIT_ANIMALS: Record<string, AnimalData> = {
    Aries: { animal: 'Hawk', emoji: '🦅', element: 'Fire', traits: ['Fearless', 'Visionary', 'Swift'], description: 'The Hawk soars above with piercing vision and fearless determination. Like those born under Aries, the Hawk strikes decisively and leads from the front. Your spirit animal sees opportunity where others see obstacles.', strengths: ['Strategic vision', 'Quick action', 'Natural leadership'], challenges: ['Patience with slower energies', 'Seeing the forest not just prey'], message: 'Soar high and keep your eyes on the prize. Your vision guides others.', power: 92, wisdom: 68, courage: 97, intuition: 75, adaptability: 62 },
    Taurus: { animal: 'Bear', emoji: '🐻', element: 'Earth', traits: ['Protective', 'Strong', 'Patient'], description: 'The Bear embodies the Taurus spirit — immensely strong yet gentle with loved ones. Patient and grounded, the Bear knows when to rest and when to unleash tremendous power. Your spirit animal teaches the value of preparation and persistence.', strengths: ['Unwavering loyalty', 'Inner strength', 'Patience'], challenges: ['Letting go of comfort zones', 'Avoiding hibernation from life'], message: 'Your strength is quiet but undeniable. Trust in your natural power.', power: 95, wisdom: 78, courage: 82, intuition: 65, adaptability: 55 },
    Gemini: { animal: 'Dolphin', emoji: '🐬', element: 'Air', traits: ['Playful', 'Intelligent', 'Social'], description: 'The Dolphin mirrors Gemini\'s dual nature — equally at home in dark depths and sunny surfaces. Incredibly intelligent and communicative, Dolphins thrive in community and bring joy wherever they go. Your spirit animal speaks the language of connection.', strengths: ['Communication mastery', 'Joyful energy', 'Social intelligence'], challenges: ['Depth over breadth', 'Staying focused'], message: 'Your playful spirit heals others. Never lose your sense of wonder.', power: 70, wisdom: 82, courage: 68, intuition: 88, adaptability: 95 },
    Cancer: { animal: 'Wolf', emoji: '🐺', element: 'Water', traits: ['Loyal', 'Protective', 'Intuitive'], description: 'The Wolf walks the line between fierce independence and deep pack loyalty — just like Cancer. Guided by powerful instincts and the moon itself, the Wolf protects its family above all else. Your spirit animal knows that true strength comes from love.', strengths: ['Fierce loyalty', 'Deep intuition', 'Family bonds'], challenges: ['Trust beyond the pack', 'Embracing solitude'], message: 'Your pack is your world. Your howl reaches the moon.', power: 85, wisdom: 80, courage: 78, intuition: 96, adaptability: 72 },
    Leo: { animal: 'Lion', emoji: '🦁', element: 'Fire', traits: ['Regal', 'Brave', 'Magnetic'], description: 'The Lion — king of the savanna and the ultimate Leo totem. Majestic, bold, and inherently commanding, the Lion leads not by force but by presence. Your spirit animal radiates confidence and inspires loyalty in all who follow.', strengths: ['Natural authority', 'Courageous heart', 'Inspiring presence'], challenges: ['Sharing the spotlight', 'Vulnerability as strength'], message: 'Wear your crown with grace. Your light lifts entire kingdoms.', power: 98, wisdom: 72, courage: 99, intuition: 60, adaptability: 58 },
    Virgo: { animal: 'Fox', emoji: '🦊', element: 'Earth', traits: ['Clever', 'Analytical', 'Adaptable'], description: 'The Fox is the master strategist of the animal kingdom, just like Virgo. With sharp analytical skills and an uncanny ability to navigate complex situations, the Fox finds elegant solutions to impossible problems. Your spirit animal thrives on intelligence and precision.', strengths: ['Problem-solving genius', 'Keen observation', 'Strategic mind'], challenges: ['Trusting instinct over analysis', 'Accepting imperfection'], message: 'Your cleverness is a gift. Use it to help, not just to solve.', power: 72, wisdom: 92, courage: 65, intuition: 85, adaptability: 90 },
    Libra: { animal: 'Swan', emoji: '🦢', element: 'Air', traits: ['Graceful', 'Beautiful', 'Balanced'], description: 'The Swan glides through life with effortless grace and beauty — the perfect Libra totem. Beneath the serene surface lies tremendous strength and fierce protectiveness. Your spirit animal teaches that true beauty comes from inner harmony and balance.', strengths: ['Harmony creation', 'Grace under pressure', 'Beauty in all things'], challenges: ['Showing the less graceful side', 'Making tough choices'], message: 'Your grace transforms chaos into beauty. Float above the turbulence.', power: 68, wisdom: 85, courage: 60, intuition: 80, adaptability: 82 },
    Scorpio: { animal: 'Phoenix', emoji: '🔥', element: 'Water', traits: ['Transformative', 'Powerful', 'Reborn'], description: 'The Phoenix — rising from ashes again and again — is the ultimate Scorpio totem. No other creature understands death and rebirth like the Phoenix. Your spirit animal teaches that destruction always precedes creation, and your greatest power lies in transformation.', strengths: ['Incredible resilience', 'Transformative power', 'Depth of feeling'], challenges: ['Not burning bridges unnecessarily', 'Trust after betrayal'], message: 'From every ending you create a more magnificent beginning.', power: 97, wisdom: 88, courage: 90, intuition: 98, adaptability: 85 },
    Sagittarius: { animal: 'Horse', emoji: '🐴', element: 'Fire', traits: ['Free', 'Adventurous', 'Noble'], description: 'The Wild Horse runs free across open plains — the embodiment of Sagittarian spirit. Powerful, noble, and untameable, the Horse lives for the journey, not the destination. Your spirit animal calls you to explore beyond every horizon.', strengths: ['Unbridled freedom', 'Exploration spirit', 'Noble character'], challenges: ['Being tamed by responsibility', 'Running from feelings'], message: 'The open road is your home. Run free and inspire others to follow.', power: 88, wisdom: 72, courage: 92, intuition: 70, adaptability: 78 },
    Capricorn: { animal: 'Mountain Goat', emoji: '🐐', element: 'Earth', traits: ['Determined', 'Climbing', 'Resilient'], description: 'The Mountain Goat conquers impossible terrain with steady determination — pure Capricorn energy. No peak is too high, no path too treacherous. Your spirit animal knows that the greatest views come from the hardest climbs.', strengths: ['Unmatched determination', 'Sure-footed progress', 'Summit reaching'], challenges: ['Enjoying the view instead of always climbing', 'Asking for help'], message: 'Every mountain has a summit. You were built to reach it.', power: 90, wisdom: 82, courage: 88, intuition: 58, adaptability: 75 },
    Aquarius: { animal: 'Owl', emoji: '🦉', element: 'Air', traits: ['Wise', 'Mysterious', 'Visionary'], description: 'The Owl sees what others miss — in darkness, in silence, in the spaces between. As Aquarius\'s spirit animal, the Owl represents the revolutionary wisdom that comes from observing the world from a unique vantage point.', strengths: ['Night wisdom', 'Seeing truth', 'Silent power'], challenges: ['Connecting emotionally', 'Coming down from the tree'], message: 'Your unique perspective is the gift the world needs most.', power: 75, wisdom: 98, courage: 72, intuition: 95, adaptability: 80 },
    Pisces: { animal: 'Seahorse', emoji: '🐡', element: 'Water', traits: ['Mystical', 'Gentle', 'Dreamy'], description: 'The Seahorse drifts through mystical waters with gentle grace — perfectly Piscean. These magical creatures let the currents guide them, trusting in the flow of the universe. Your spirit animal teaches surrender, patience, and the magic of going with the flow.', strengths: ['Flowing with life', 'Gentle strength', 'Mystical connection'], challenges: ['Grounding dreams in reality', 'Setting boundaries'], message: 'Your dreams are prophecies. Trust the currents carrying you.', power: 60, wisdom: 90, courage: 55, intuition: 99, adaptability: 92 },
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

export default function SpiritAnimalScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const sign = getZodiacSign(birthDate);
    const data = SPIRIT_ANIMALS[sign];
    const stats = [
        { name: 'Power', value: data.power, color: '#F44336' },
        { name: 'Wisdom', value: data.wisdom, color: '#2196F3' },
        { name: 'Courage', value: data.courage, color: '#FF9800' },
        { name: 'Intuition', value: data.intuition, color: '#9C27B0' },
        { name: 'Adaptability', value: data.adaptability, color: '#4CAF50' },
    ];

    return (
        <LinearGradient colors={['#1a2a0a', '#0a1a1a', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a2a0a" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🐾 Your Spirit Animal</Text>

                {/* Animal Display */}
                <View style={styles.animalHero}>
                    <Text style={styles.animalEmoji}>{data.emoji}</Text>
                    <Text style={styles.animalName}>The {data.animal}</Text>
                    <Text style={styles.zodiacLabel}>{sign} Spirit Guide</Text>
                    <View style={styles.elementBadge}>
                        <Text style={styles.elementText}>{data.element} Element</Text>
                    </View>
                </View>

                {/* Trait Tags */}
                <View style={styles.tagRow}>
                    {data.traits.map(t => (
                        <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                        </View>
                    ))}
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📖 Your Animal's Message</Text>
                    <Text style={styles.cardBody}>{data.description}</Text>
                </View>

                {/* Radar/Stats Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Spirit Animal Stats</Text>
                    <Svg width="100%" height={stats.length * 44 + 10} viewBox={`0 0 320 ${stats.length * 44 + 10}`}>
                        {stats.map((s, i) => {
                            const y = i * 44 + 5;
                            const barW = (s.value / 100) * 180;
                            return (
                                <G key={s.name}>
                                    <SvgText x={0} y={y + 18} fill="#fff" fontSize={13} fontWeight="bold">{s.name}</SvgText>
                                    <Rect x={100} y={y + 4} width={180} height={22} rx={8} fill="rgba(255,255,255,0.06)" />
                                    <Rect x={100} y={y + 4} width={barW} height={22} rx={8} fill={s.color} opacity={0.75} />
                                    <SvgText x={100 + barW + 6} y={y + 19} fill={s.color} fontSize={12} fontWeight="bold">{s.value}</SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>

                {/* Pentagon / Radar visualization */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🕸️ Power Profile</Text>
                    <Svg width="100%" height={220} viewBox="0 0 260 240">
                        {/* Pentagon grid lines */}
                        {[20, 40, 60, 80, 100].map(level => {
                            const points = stats.map((_, i) => {
                                const angle = (i * 72 - 90) * (Math.PI / 180);
                                const r = level * 0.9;
                                return `${130 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
                            }).join(' ');
                            return <Line key={level} x1={0} y1={0} x2={0} y2={0} stroke="none" />;
                        })}
                        {/* Background pentagon */}
                        {[100, 75, 50, 25].map(level => {
                            const pts = stats.map((_, i) => {
                                const angle = (i * 72 - 90) * (Math.PI / 180);
                                const r = level * 0.9;
                                return `${130 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
                            }).join(' ');
                            return (
                                <G key={`bg-${level}`}>
                                    {stats.map((_, i) => {
                                        const a1 = (i * 72 - 90) * (Math.PI / 180);
                                        const a2 = (((i + 1) % 5) * 72 - 90) * (Math.PI / 180);
                                        const r = level * 0.9;
                                        return <Line key={`line-${level}-${i}`} x1={130 + r * Math.cos(a1)} y1={120 + r * Math.sin(a1)} x2={130 + r * Math.cos(a2)} y2={120 + r * Math.sin(a2)} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
                                    })}
                                </G>
                            );
                        })}
                        {/* Axes */}
                        {stats.map((s, i) => {
                            const angle = (i * 72 - 90) * (Math.PI / 180);
                            return (
                                <G key={`axis-${i}`}>
                                    <Line x1={130} y1={120} x2={130 + 90 * Math.cos(angle)} y2={120 + 90 * Math.sin(angle)} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                                    <SvgText x={130 + 102 * Math.cos(angle)} y={120 + 102 * Math.sin(angle) + 4} fill={s.color} fontSize={9} fontWeight="bold" textAnchor="middle">{s.name}</SvgText>
                                </G>
                            );
                        })}
                        {/* Data polygon */}
                        {(() => {
                            const pts = stats.map((s, i) => {
                                const angle = (i * 72 - 90) * (Math.PI / 180);
                                const r = (s.value / 100) * 90;
                                return `${130 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
                            }).join(' ');
                            return (
                                <G>
                                    <Line x1={0} y1={0} x2={0} y2={0} stroke="none" />
                                    {/* Filled polygon using lines */}
                                    {stats.map((s, i) => {
                                        const a1 = (i * 72 - 90) * (Math.PI / 180);
                                        const a2 = (((i + 1) % 5) * 72 - 90) * (Math.PI / 180);
                                        const r1 = (s.value / 100) * 90;
                                        const r2 = (stats[(i + 1) % 5].value / 100) * 90;
                                        return <Line key={`data-${i}`} x1={130 + r1 * Math.cos(a1)} y1={120 + r1 * Math.sin(a1)} x2={130 + r2 * Math.cos(a2)} y2={120 + r2 * Math.sin(a2)} stroke="#FFD54F" strokeWidth={2} />;
                                    })}
                                    {/* Data dots */}
                                    {stats.map((s, i) => {
                                        const angle = (i * 72 - 90) * (Math.PI / 180);
                                        const r = (s.value / 100) * 90;
                                        return <Circle key={`dot-${i}`} cx={130 + r * Math.cos(angle)} cy={120 + r * Math.sin(angle)} r={4} fill={s.color} />;
                                    })}
                                </G>
                            );
                        })()}
                    </Svg>
                </View>

                {/* Strengths & Challenges */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💪 Strengths</Text>
                    {data.strengths.map(s => (
                        <Text key={s} style={styles.listItem}>✅ {s}</Text>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔥 Challenges</Text>
                    {data.challenges.map(c => (
                        <Text key={c} style={styles.listItem}>⚡ {c}</Text>
                    ))}
                </View>

                {/* Spirit Message */}
                <View style={[styles.card, { borderColor: '#FFD54F33', borderWidth: 2 }]}>
                    <Text style={styles.cardTitle}>🌟 Spirit Message</Text>
                    <Text style={styles.messageText}>"{data.message}"</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10, marginBottom: 20 },
    animalHero: { alignItems: 'center', marginBottom: 16 },
    animalEmoji: { fontSize: 80 },
    animalName: { fontSize: 28, fontWeight: '900', color: '#FFE082', marginTop: 6 },
    zodiacLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    elementBadge: { backgroundColor: 'rgba(255,213,79,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, marginTop: 6 },
    elementText: { color: '#FFE082', fontSize: 12, fontWeight: '700' },
    tagRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    tag: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
    tagText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    cardBody: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    listItem: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 6, lineHeight: 20 },
    messageText: { fontSize: 16, color: '#FFE082', fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
});
