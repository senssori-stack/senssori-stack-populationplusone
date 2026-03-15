import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AllThingsBaby'>;

const FEATURES = [
    {
        title: 'JUMPSTART THE AMERICAN DREAM',
        subtitle: "Build your child's financial future",
        emoji: '\u{1F1FA}\u{1F1F8}',
        route: 'JumpstartAmericanDream' as const,
        color: '#001f3f',
    },
    {
        title: 'Build Your Family Tree',
        subtitle: 'Create an interactive family tree',
        emoji: '\u{1F333}',
        route: 'FamilyTreeIntro' as const,
        color: '#2e7d32',
    },
    {
        title: 'Baby Milestone Tracker',
        subtitle: 'Track developmental milestones by age',
        emoji: '\u{1F4CA}',
        route: 'MilestoneTracker' as const,
        color: '#000060',
    },
    {
        title: 'Baby Growth Chart',
        subtitle: 'Height, weight & head circumference',
        emoji: '\u{1F4C8}',
        route: 'GrowthTracker' as const,
        color: '#1a237e',
    },
    {
        title: 'Learning Center',
        subtitle: 'Letters, numbers, shapes & colors',
        emoji: '\u{1F4DA}',
        route: 'LearningCenter' as const,
        color: '#4a148c',
    },
    {
        title: 'Lullabies',
        subtitle: 'Music-box melodies for your little one',
        emoji: '\u{1F3B5}',
        route: 'Lullabies' as const,
        color: '#1a1040',
    },
    {
        title: 'Bedtime Stories',
        subtitle: '25 classic tales read aloud',
        emoji: '\u{1F4D6}',
        route: 'BedtimeStories' as const,
        color: '#1e1b4b',
    },
];

/* ────────── Silhouette Figures ────────── */
const C = '#e8b896'; // Silhouette color (warm peach skin tone)

/** Crawling baby — horizontal, arms and knees on ground */
function Crawling() {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ width: 5, height: 9, backgroundColor: C, borderRadius: 2, transform: [{ rotate: '30deg' }], marginRight: -3 }} />
                <View style={{ width: 22, height: 9, backgroundColor: C, borderRadius: 5 }} />
                <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: C, marginLeft: -3, marginBottom: 5 }} />
            </View>
            <View style={{ position: 'absolute', left: 22, bottom: 0, width: 5, height: 8, backgroundColor: C, borderRadius: 2, transform: [{ rotate: '-15deg' }] }} />
        </View>
    );
}

/** Generic standing figure — all dimensions parameterized */
function Figure({ head, bodyW, bodyH, armW, legW, legH, lean = 0 }: {
    head: number; bodyW: number; bodyH: number; armW: number; legW: number; legH: number; lean?: number;
}) {
    const totalH = head * 2 + bodyH + legH + 6;
    return (
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: totalH }}>
            <View style={{ alignItems: 'center', transform: [{ rotate: `${lean}deg` }] }}>
                {/* Head */}
                <View style={{ width: head * 2, height: head * 2, borderRadius: head, backgroundColor: C }} />
                {/* Arms bar */}
                <View style={{ position: 'absolute', top: head * 2 + 1, width: armW, height: Math.max(3, bodyW * 0.28), backgroundColor: C, borderRadius: 2 }} />
                {/* Torso */}
                <View style={{
                    width: bodyW, height: bodyH, backgroundColor: C, marginTop: 1,
                    borderTopLeftRadius: bodyW * 0.35, borderTopRightRadius: bodyW * 0.35,
                    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
                }} />
                {/* Legs */}
                <View style={{ flexDirection: 'row', marginTop: 1, gap: 2 }}>
                    <View style={{ width: legW, height: legH, backgroundColor: C, borderRadius: 2, transform: [{ rotate: '-10deg' }] }} />
                    <View style={{ width: legW, height: legH, backgroundColor: C, borderRadius: 2, transform: [{ rotate: '10deg' }] }} />
                </View>
                {/* Feet */}
                <View style={{ flexDirection: 'row', marginTop: 0, gap: legW }}>
                    <View style={{ width: legW + 3, height: 3, backgroundColor: C, borderRadius: 2 }} />
                    <View style={{ width: legW + 3, height: 3, backgroundColor: C, borderRadius: 2 }} />
                </View>
            </View>
        </View>
    );
}

/* ────────── Main Screen ────────── */
export default function AllThingsBabyScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
    }, []);

    return (
        <LinearGradient colors={['#0a0e27', '#1a1040', '#0a0e27']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>{'\u{1F476}'}</Text>
                    <Text style={styles.headerTitle}>All Things Baby</Text>
                    <Text style={styles.headerSub}>Everything you need for your little one</Text>
                </View>

                {/* ═══ MARCH OF PROGRESS ═══ */}
                <Animated.View style={[styles.marchPanel, { opacity: fadeAnim }]}>
                    <View style={styles.marchRow}>
                        {/* 1: Crawling baby */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}><Crawling /></View>
                            <Text style={styles.marchAge}>0-1</Text>
                        </View>
                        {/* 2: Wobbly toddler */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}>
                                <Figure head={5.5} bodyW={9} bodyH={13} armW={14} legW={4} legH={11} lean={5} />
                            </View>
                            <Text style={styles.marchAge}>2-3</Text>
                        </View>
                        {/* 3: Child */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}>
                                <Figure head={6} bodyW={10} bodyH={17} armW={20} legW={4} legH={15} lean={2} />
                            </View>
                            <Text style={styles.marchAge}>6-8</Text>
                        </View>
                        {/* 4: Pre-teen */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}>
                                <Figure head={6} bodyW={11} bodyH={22} armW={24} legW={5} legH={20} lean={1} />
                            </View>
                            <Text style={styles.marchAge}>10-12</Text>
                        </View>
                        {/* 5: Teen */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}>
                                <Figure head={6.5} bodyW={12} bodyH={26} armW={28} legW={5} legH={24} />
                            </View>
                            <Text style={styles.marchAge}>14-17</Text>
                        </View>
                        {/* 6: Adult */}
                        <View style={styles.marchStage}>
                            <View style={styles.figWrap}>
                                <Figure head={7} bodyW={14} bodyH={30} armW={32} legW={6} legH={28} />
                            </View>
                            <Text style={styles.marchAge}>18+</Text>
                        </View>
                    </View>
                    {/* Ground line */}
                    <View style={styles.marchGround} />
                    <Text style={styles.marchCaption}>{'crawl  \u2192  walk  \u2192  run  \u2192  lead'}</Text>
                </Animated.View>

                {/* Feature cards */}
                <View style={styles.cardList}>
                    {FEATURES.map((feature) => (
                        <TouchableOpacity
                            key={feature.route}
                            style={styles.featureCard}
                            onPress={() => navigation.navigate(feature.route)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                            </View>
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureSub}>{feature.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="#475569" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        All data is stored locally on your device.{'\n'}
                        No account or internet connection required. {'\u{1F49B}'}
                    </Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    header: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerEmoji: { fontSize: 52, marginBottom: 8 },
    headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 15, color: '#94a3b8', marginTop: 6, textAlign: 'center' },

    /* March of Progress */
    marchPanel: {
        marginHorizontal: 16,
        marginBottom: 24,
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 6,
        backgroundColor: 'rgba(10,14,39,0.85)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(139,164,196,0.12)',
    },
    marchRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
    },
    marchStage: { alignItems: 'center', flex: 1 },
    figWrap: { justifyContent: 'flex-end', alignItems: 'center', minHeight: 80 },
    marchAge: { fontSize: 10, color: 'rgba(139,164,196,0.45)', fontWeight: '700', marginTop: 5 },
    marchGround: { height: 1.5, backgroundColor: 'rgba(139,164,196,0.12)', marginTop: 6, borderRadius: 1 },
    marchCaption: { fontSize: 11, color: 'rgba(139,164,196,0.25)', textAlign: 'center', marginTop: 8, letterSpacing: 2, fontStyle: 'italic' },

    /* Feature cards */
    cardList: { paddingHorizontal: 16 },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30,41,59,0.6)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    featureIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    featureEmoji: { fontSize: 28 },
    featureInfo: { flex: 1 },
    featureTitle: { color: '#e2e8f0', fontSize: 17, fontWeight: '700' },
    featureSub: { color: '#64748b', fontSize: 13, marginTop: 3 },

    /* Footer */
    footer: { marginHorizontal: 16, marginTop: 24, padding: 16, backgroundColor: '#000060', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
    footerText: { color: '#475569', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
