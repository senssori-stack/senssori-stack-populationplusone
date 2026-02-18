// src/screens/MilestoneTrackerScreen.tsx
// ═══════════════════════════════════════════════════════════════════
// POPULATION +1™ Baby Milestone Tracker
// The finest milestone tracker in the industry
// ═══════════════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CelebrationOverlay from '../../components/CelebrationOverlay';
import {
    AGE_GROUPS,
    BADGES,
    CATEGORY_META,
    TOTAL_MILESTONES,
    getAllMilestones,
    getMilestonesForAge,
    getTipForAge,
    type AgeGroup,
    type Badge,
    type Milestone,
    type MilestoneCategory
} from '../data/milestone-data';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MilestoneTracker'>;

const { width: SW, height: SH } = Dimensions.get('window');
const STORAGE_KEY = '@p1_milestones';
const STREAK_KEY = '@p1_streak';
const BABY_KEY = '@p1_baby_info';

// ── Persisted state types ────────────────────────────────────────

interface CompletedMilestone {
    id: string;
    completedAt: string; // ISO date
    note?: string;
    photoUri?: string;
    ageAtCompletion?: number; // baby's age in months when completed
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCheckIn: string; // ISO date
    totalCheckIns: number;
}

interface BabyInfo {
    name: string;
    dateOfBirth: string; // ISO
    photoUri?: string;
}

// ── Progress ring component ──────────────────────────────────────

function ProgressRing({ progress, size, strokeWidth, color, children }: {
    progress: number; size: number; strokeWidth: number; color: string; children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - Math.min(progress, 1));

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background circle */}
            <View style={{
                position: 'absolute', width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: 'rgba(255,255,255,0.15)',
            }} />
            {/* Progress arc (approximated with border) */}
            <View style={{
                position: 'absolute', width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: color,
                borderTopColor: progress >= 0.25 ? color : 'transparent',
                borderRightColor: progress >= 0.50 ? color : 'transparent',
                borderBottomColor: progress >= 0.75 ? color : 'transparent',
                borderLeftColor: progress >= 1.0 ? color : progress > 0 ? color : 'transparent',
                transform: [{ rotate: '-90deg' }],
                opacity: progress > 0 ? 1 : 0,
            }} />
            {children}
        </View>
    );
}

// ── Animated badge component ─────────────────────────────────────

function BadgeCard({ badge, earned, animateIn }: { badge: Badge; earned: boolean; animateIn?: boolean }) {
    const scaleAnim = useRef(new Animated.Value(animateIn ? 0 : 1)).current;

    useEffect(() => {
        if (animateIn && earned) {
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
        }
    }, [earned]);

    return (
        <Animated.View style={[styles.badgeCard, {
            opacity: earned ? 1 : 0.4,
            transform: [{ scale: scaleAnim }],
            backgroundColor: earned ? badge.color + '30' : 'rgba(255,255,255,0.05)',
            borderColor: earned ? badge.color : 'rgba(255,255,255,0.1)',
        }]}>
            <Text style={{ fontSize: 28 }}>{badge.emoji}</Text>
            <Text style={[styles.badgeName, { color: earned ? '#fff' : '#888' }]}>{badge.name}</Text>
            <Text style={[styles.badgeDesc, { color: earned ? '#ccc' : '#666' }]}>{badge.description}</Text>
        </Animated.View>
    );
}

// ── Status indicator ─────────────────────────────────────────────

function StatusIndicator({ milestone, babyAgeMonths, completed }: {
    milestone: Milestone; babyAgeMonths: number; completed: boolean;
}) {
    if (completed) {
        return <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]}><Text style={styles.statusIcon}>✓</Text></View>;
    }
    if (babyAgeMonths > milestone.concernMonth) {
        return (
            <TouchableOpacity
                onPress={() => Alert.alert(
                    '⚠️ Talk to Your Doctor',
                    `Most children achieve "${milestone.title}" by ${milestone.concernMonth} months.\n\n${milestone.doctorNote}\n\nEvery child develops at their own pace, but it's always good to check in with your pediatrician if you have concerns.`,
                    [{ text: 'OK', style: 'default' }]
                )}
            >
                <View style={[styles.statusDot, { backgroundColor: '#FF5252' }]}><Text style={styles.statusIcon}>!</Text></View>
            </TouchableOpacity>
        );
    }
    if (babyAgeMonths >= milestone.typicalMonth) {
        return <View style={[styles.statusDot, { backgroundColor: '#FFD700' }]}><Text style={styles.statusIcon}>○</Text></View>;
    }
    return <View style={[styles.statusDot, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Text style={styles.statusIcon}>·</Text></View>;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════

export default function MilestoneTrackerScreen({ navigation }: Props) {
    // ── State ────────────────────────────────────────────────────
    const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);
    const [completed, setCompleted] = useState<CompletedMilestone[]>([]);
    const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastCheckIn: '', totalCheckIns: 0 });
    const [selectedGroup, setSelectedGroup] = useState<AgeGroup | null>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [showSetup, setShowSetup] = useState(false);
    const [showBadges, setShowBadges] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMsg, setCelebrationMsg] = useState('');
    const [noteText, setNoteText] = useState('');
    const [filterCategory, setFilterCategory] = useState<MilestoneCategory | 'all'>('all');

    // Setup form
    const [setupName, setSetupName] = useState('');
    const [setupMonth, setSetupMonth] = useState('');
    const [setupDay, setSetupDay] = useState('');
    const [setupYear, setSetupYear] = useState('');

    // Animation
    const headerAnim = useRef(new Animated.Value(0)).current;

    // ── Load data on mount ───────────────────────────────────────
    useEffect(() => {
        loadData();
        Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, []);

    const loadData = async () => {
        try {
            const [babyStr, compStr, streakStr] = await Promise.all([
                AsyncStorage.getItem(BABY_KEY),
                AsyncStorage.getItem(STORAGE_KEY),
                AsyncStorage.getItem(STREAK_KEY),
            ]);
            if (babyStr) setBabyInfo(JSON.parse(babyStr));
            else setShowSetup(true);
            if (compStr) setCompleted(JSON.parse(compStr));
            if (streakStr) setStreak(JSON.parse(streakStr));

            // Check-in streak
            if (streakStr) {
                const s: StreakData = JSON.parse(streakStr);
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (s.lastCheckIn === today) {
                    // Already checked in today
                } else if (s.lastCheckIn === yesterday) {
                    // Continue streak
                    const updated = {
                        ...s,
                        currentStreak: s.currentStreak + 1,
                        longestStreak: Math.max(s.longestStreak, s.currentStreak + 1),
                        lastCheckIn: today,
                        totalCheckIns: s.totalCheckIns + 1,
                    };
                    setStreak(updated);
                    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
                } else {
                    // Streak broken
                    const updated = { ...s, currentStreak: 1, lastCheckIn: today, totalCheckIns: s.totalCheckIns + 1 };
                    setStreak(updated);
                    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
                }
            } else {
                const today = new Date().toISOString().split('T')[0];
                const initial: StreakData = { currentStreak: 1, longestStreak: 1, lastCheckIn: today, totalCheckIns: 1 };
                setStreak(initial);
                await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(initial));
            }
        } catch (e) {
            console.warn('Failed to load milestone data:', e);
        }
    };

    // ── Baby age calculation ─────────────────────────────────────
    const babyAgeMonths = useMemo(() => {
        if (!babyInfo?.dateOfBirth) return 0;
        const dob = new Date(babyInfo.dateOfBirth);
        const now = new Date();
        return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    }, [babyInfo]);

    const babyAgeDays = useMemo(() => {
        if (!babyInfo?.dateOfBirth) return 0;
        const dob = new Date(babyInfo.dateOfBirth);
        return Math.floor((Date.now() - dob.getTime()) / 86400000);
    }, [babyInfo]);

    const ageText = useMemo(() => {
        if (babyAgeMonths < 1) return `${babyAgeDays} days old`;
        if (babyAgeMonths < 24) return `${babyAgeMonths} month${babyAgeMonths !== 1 ? 's' : ''} old`;
        const years = Math.floor(babyAgeMonths / 12);
        const months = babyAgeMonths % 12;
        return months > 0 ? `${years} year${years !== 1 ? 's' : ''}, ${months} mo` : `${years} year${years !== 1 ? 's' : ''}`;
    }, [babyAgeMonths, babyAgeDays]);

    // ── Completed IDs set for fast lookup ────────────────────────
    const completedIds = useMemo(() => new Set(completed.map(c => c.id)), [completed]);

    // ── Badge calculations ───────────────────────────────────────
    const earnedBadges = useMemo(() => {
        const earned: string[] = [];
        const count = completed.length;

        BADGES.forEach(badge => {
            if (badge.requirement === 'milestones_logged' && count >= badge.threshold) {
                earned.push(badge.id);
            }
            if (badge.requirement === 'streak_days' && streak.currentStreak >= badge.threshold) {
                earned.push(badge.id);
            }
            if (badge.requirement === 'early_milestone') {
                const hasEarly = completed.some(c => {
                    const m = getAllMilestones().find(ms => ms.id === c.id);
                    return m && c.ageAtCompletion !== undefined && c.ageAtCompletion < m.typicalMonth;
                });
                if (hasEarly) earned.push(badge.id);
            }
            if (badge.requirement === 'photos_added') {
                const photosCount = completed.filter(c => c.photoUri).length;
                if (photosCount >= badge.threshold) earned.push(badge.id);
            }
            if (badge.requirement === 'age_group_complete') {
                const complete = AGE_GROUPS.some(g => g.milestones.every(m => completedIds.has(m.id)));
                if (complete) earned.push(badge.id);
            }
            if (badge.requirement === 'category_complete') {
                const categories: MilestoneCategory[] = ['physical', 'cognitive', 'language', 'social', 'fine_motor'];
                const hasCategoryComplete = AGE_GROUPS.some(g =>
                    categories.some(cat => {
                        const catMs = g.milestones.filter(m => m.category === cat);
                        return catMs.length > 0 && catMs.every(m => completedIds.has(m.id));
                    })
                );
                if (hasCategoryComplete) earned.push(badge.id);
            }
        });

        return new Set(earned);
    }, [completed, streak, completedIds]);

    // ── Current age group & tip ──────────────────────────────────
    const { current: currentGroup, upcoming: upcomingGroup, past: pastGroups } = useMemo(
        () => getMilestonesForAge(babyAgeMonths), [babyAgeMonths]
    );

    const currentTip = useMemo(() => getTipForAge(babyAgeMonths), [babyAgeMonths]);

    // ── Overall progress ─────────────────────────────────────────
    const overallProgress = completed.length / TOTAL_MILESTONES;
    const currentGroupProgress = useMemo(() => {
        if (!currentGroup) return 0;
        const done = currentGroup.milestones.filter(m => completedIds.has(m.id)).length;
        return done / currentGroup.milestones.length;
    }, [currentGroup, completedIds]);

    // ── Concern count (milestones past concern age that aren't completed) ──
    const concernCount = useMemo(() => {
        return getAllMilestones().filter(m =>
            !completedIds.has(m.id) && babyAgeMonths > m.concernMonth
        ).length;
    }, [completedIds, babyAgeMonths]);

    // ── Mark milestone complete ──────────────────────────────────
    const completeMilestone = useCallback(async (milestone: Milestone) => {
        if (completedIds.has(milestone.id)) return;

        const entry: CompletedMilestone = {
            id: milestone.id,
            completedAt: new Date().toISOString(),
            note: noteText.trim() || undefined,
            ageAtCompletion: babyAgeMonths,
        };

        const updated = [...completed, entry];
        setCompleted(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNoteText('');

        // Check for badge unlock
        const prevCount = completed.length;
        const newCount = updated.length;
        const badgeThresholds = [1, 5, 10, 25, 50, 100];
        const justEarned = badgeThresholds.find(t => prevCount < t && newCount >= t);
        if (justEarned) {
            const badge = BADGES.find(b => b.requirement === 'milestones_logged' && b.threshold === justEarned);
            if (badge) {
                setCelebrationMsg(`🏆 Badge Earned: ${badge.name}!\n${badge.description}`);
                setShowCelebration(true);
            }
        }

        // Check age group complete
        if (currentGroup) {
            const allDone = currentGroup.milestones.every(m => m.id === milestone.id || completedIds.has(m.id));
            if (allDone) {
                setCelebrationMsg(`🎯 Age Group Complete!\nAll milestones for "${currentGroup.label}" are done!`);
                setShowCelebration(true);
            }
        }

        // Check early milestone
        if (babyAgeMonths < milestone.typicalMonth) {
            Alert.alert('🐣 Early Bird!', `${babyInfo?.name || 'Baby'} hit this milestone early! That's wonderful!`);
        }

        setSelectedMilestone(null);
    }, [completed, completedIds, noteText, babyAgeMonths, currentGroup, babyInfo]);

    // ── Undo milestone ───────────────────────────────────────────
    const undoMilestone = useCallback(async (milestoneId: string) => {
        Alert.alert(
            'Remove Milestone?',
            'Are you sure you want to uncheck this milestone?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive', onPress: async () => {
                        const updated = completed.filter(c => c.id !== milestoneId);
                        setCompleted(updated);
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    }
                },
            ]
        );
    }, [completed]);

    // ── Save baby setup ──────────────────────────────────────────
    const saveBabySetup = async () => {
        if (!setupName.trim()) {
            Alert.alert('Name Required', 'Please enter your baby\'s name.');
            return;
        }
        const m = parseInt(setupMonth, 10);
        const d = parseInt(setupDay, 10);
        const y = parseInt(setupYear, 10);
        if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 2015 || y > 2030) {
            Alert.alert('Invalid Date', 'Please enter a valid date of birth (MM/DD/YYYY).');
            return;
        }
        const dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const info: BabyInfo = { name: setupName.trim(), dateOfBirth: dob };
        setBabyInfo(info);
        await AsyncStorage.setItem(BABY_KEY, JSON.stringify(info));
        setShowSetup(false);
    };

    // ── Legend colors ────────────────────────────────────────────
    const legendItems = [
        { color: '#4CAF50', label: 'Completed' },
        { color: '#FFD700', label: 'On Track (typical age)' },
        { color: '#FF5252', label: 'Talk to Doctor' },
        { color: 'rgba(255,255,255,0.2)', label: 'Upcoming' },
    ];

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
            <CelebrationOverlay
                visible={showCelebration}
                message={celebrationMsg}
                onComplete={() => setShowCelebration(false)}
            />

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ── HERO SECTION ─────────────────────────────────── */}
                <Animated.View style={[styles.hero, {
                    opacity: headerAnim,
                    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                }]}>
                    <LinearGradient colors={['#1b4332', '#2d6a4f', '#40916c']} style={styles.heroGradient}>
                        <View style={styles.heroTop}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.heroTitle}>
                                    {babyInfo ? `${babyInfo.name}'s Milestones` : 'Baby Milestone Tracker'}
                                </Text>
                                {babyInfo && <Text style={styles.heroAge}>{ageText}</Text>}
                            </View>
                            <TouchableOpacity onPress={() => setShowSetup(true)} style={styles.settingsBtn}>
                                <Text style={{ fontSize: 22 }}>⚙️</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Progress ring + stats */}
                        <View style={styles.statsRow}>
                            <ProgressRing progress={overallProgress} size={90} strokeWidth={6} color="#4CAF50">
                                <Text style={styles.ringPercent}>{Math.round(overallProgress * 100)}%</Text>
                                <Text style={styles.ringLabel}>Overall</Text>
                            </ProgressRing>

                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{completed.length}</Text>
                                    <Text style={styles.statLabel}>Done</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{TOTAL_MILESTONES - completed.length}</Text>
                                    <Text style={styles.statLabel}>Remaining</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNumber, { color: '#FF9800' }]}>🔥 {streak.currentStreak}</Text>
                                    <Text style={styles.statLabel}>Day Streak</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNumber, { color: concernCount > 0 ? '#FF5252' : '#4CAF50' }]}>
                                        {concernCount > 0 ? `⚠️ ${concernCount}` : '✓ 0'}
                                    </Text>
                                    <Text style={styles.statLabel}>Concerns</Text>
                                </View>
                            </View>
                        </View>

                        {/* Badges button */}
                        <TouchableOpacity onPress={() => setShowBadges(true)} style={styles.badgesButton}>
                            <Text style={styles.badgesButtonText}>
                                🏆 {earnedBadges.size}/{BADGES.length} Badges Earned — View All
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* ── CONCERN ALERT ─────────────────────────────── */}
                {concernCount > 0 && (
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>⚠️ Developmental Check</Text>
                        <Text style={styles.alertText}>
                            {concernCount} milestone{concernCount > 1 ? 's are' : ' is'} past the typical age range.
                            Tap the red indicators below to see details. Every child develops differently, but
                            it's always good to discuss concerns with your pediatrician.
                        </Text>
                        <Text style={styles.alertAction}>
                            📞 Schedule a well-child visit to discuss any concerns.
                        </Text>
                    </View>
                )}

                {/* ── WEEKLY TIP ────────────────────────────────── */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipHeader}>💡 Developmental Tip</Text>
                    <Text style={styles.tipText}>{currentTip.tip}</Text>
                    <Text style={styles.tipSource}>Source: {currentTip.source}</Text>
                </View>

                {/* ── WHY MILESTONES MATTER ────────────────────── */}
                <TouchableOpacity
                    style={styles.whyCard}
                    onPress={() => Alert.alert(
                        '📊 Why Track Milestones?',
                        'Developmental milestones are behaviors or physical skills seen in infants and children as they grow. Rolling over, crawling, walking, and talking are all considered milestones.\n\n'
                        + '✅ EARLY DETECTION: Tracking milestones helps identify potential developmental delays early, when intervention is most effective.\n\n'
                        + '🧠 BRAIN DEVELOPMENT: 90% of brain development happens before age 5. Each milestone represents new neural connections forming.\n\n'
                        + '👩‍⚕️ INFORMED VISITS: Having a milestone log makes pediatrician visits more productive — you can share exactly what your child is doing.\n\n'
                        + '📈 PEACE OF MIND: Knowing what to expect helps reduce parental anxiety. Every child is unique, but milestones provide a helpful roadmap.\n\n'
                        + '💪 EARLY INTERVENTION: Children who receive early support for developmental delays often catch up to their peers. The earlier, the better!\n\n'
                        + 'Source: CDC, AAP, WHO',
                        [{ text: 'Got It!', style: 'default' }]
                    )}
                >
                    <Text style={styles.whyText}>📊 Why Tracking Milestones Changes Everything → Tap to Learn</Text>
                </TouchableOpacity>

                {/* ── LEGEND ─────────────────────────────────────── */}
                <View style={styles.legend}>
                    {legendItems.map(item => (
                        <View key={item.label} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── CATEGORY FILTER ─────────────────────────────── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        style={[styles.filterChip, filterCategory === 'all' && styles.filterChipActive]}
                        onPress={() => setFilterCategory('all')}
                    >
                        <Text style={[styles.filterText, filterCategory === 'all' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    {(Object.keys(CATEGORY_META) as MilestoneCategory[]).map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterChip, filterCategory === cat && { backgroundColor: CATEGORY_META[cat].color + '40', borderColor: CATEGORY_META[cat].color }]}
                            onPress={() => setFilterCategory(cat)}
                        >
                            <Text style={[styles.filterText, filterCategory === cat && { color: '#fff' }]}>
                                {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── CURRENT AGE GROUP (expanded) ────────────────── */}
                {currentGroup && (
                    <View style={styles.ageSection}>
                        <View style={[styles.ageSectionHeader, { borderLeftColor: currentGroup.color }]}>
                            <Text style={styles.ageSectionEmoji}>{currentGroup.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ageSectionTitle}>{currentGroup.label}</Text>
                                <Text style={styles.ageSectionDesc}>{currentGroup.description}</Text>
                            </View>
                            <View style={styles.ageBadge}>
                                <Text style={styles.ageBadgeText}>
                                    {currentGroup.milestones.filter(m => completedIds.has(m.id)).length}/{currentGroup.milestones.length}
                                </Text>
                            </View>
                        </View>

                        {currentGroup.milestones
                            .filter(m => filterCategory === 'all' || m.category === filterCategory)
                            .map(milestone => {
                                const isDone = completedIds.has(milestone.id);
                                const catMeta = CATEGORY_META[milestone.category];
                                return (
                                    <Pressable
                                        key={milestone.id}
                                        style={[styles.milestoneRow, isDone && styles.milestoneRowDone]}
                                        onPress={() => {
                                            if (isDone) {
                                                undoMilestone(milestone.id);
                                            } else {
                                                setSelectedMilestone(milestone);
                                                setNoteText('');
                                            }
                                        }}
                                    >
                                        <StatusIndicator milestone={milestone} babyAgeMonths={babyAgeMonths} completed={isDone} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.milestoneTitle, isDone && styles.milestoneTitleDone]}>
                                                    {milestone.emoji} {milestone.title}
                                                </Text>
                                                <View style={[styles.categoryTag, { backgroundColor: catMeta.color + '30' }]}>
                                                    <Text style={[styles.categoryTagText, { color: catMeta.color }]}>
                                                        {catMeta.emoji}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                                            <Text style={styles.milestoneAge}>
                                                Typical: {milestone.typicalMonth}mo • Range: {milestone.ageRangeMonths[0]}-{milestone.ageRangeMonths[1]}mo
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedMilestone(milestone);
                                                setNoteText('');
                                            }}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Text style={{ fontSize: 18, color: '#888' }}>ℹ️</Text>
                                        </TouchableOpacity>
                                    </Pressable>
                                );
                            })}
                    </View>
                )}

                {/* ── UPCOMING AGE GROUP ───────────────────────────── */}
                {upcomingGroup && (
                    <TouchableOpacity
                        style={styles.upcomingCard}
                        onPress={() => setSelectedGroup(upcomingGroup)}
                    >
                        <Text style={styles.upcomingEmoji}>{upcomingGroup.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.upcomingTitle}>Coming Up: {upcomingGroup.label}</Text>
                            <Text style={styles.upcomingDesc}>{upcomingGroup.milestones.length} milestones to watch for</Text>
                        </View>
                        <Text style={{ color: '#888', fontSize: 18 }}>→</Text>
                    </TouchableOpacity>
                )}

                {/* ── PAST AGE GROUPS (collapsed) ─────────────────── */}
                {pastGroups.length > 0 && (
                    <View style={{ marginTop: 16 }}>
                        <Text style={styles.sectionLabel}>Previous Stages</Text>
                        {pastGroups.map(group => {
                            const done = group.milestones.filter(m => completedIds.has(m.id)).length;
                            const total = group.milestones.length;
                            const pct = Math.round((done / total) * 100);
                            return (
                                <TouchableOpacity
                                    key={group.id}
                                    style={styles.pastGroupRow}
                                    onPress={() => setSelectedGroup(group)}
                                >
                                    <Text style={{ fontSize: 20 }}>{group.emoji}</Text>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.pastGroupTitle}>{group.label}</Text>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: group.color }]} />
                                        </View>
                                    </View>
                                    <Text style={styles.pastGroupPct}>{done}/{total}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* ── ALL AGE GROUPS ───────────────────────────────── */}
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.sectionLabel}>All Developmental Stages</Text>
                    {AGE_GROUPS.map(group => {
                        if (group.id === currentGroup?.id) return null; // Already shown expanded
                        const done = group.milestones.filter(m => completedIds.has(m.id)).length;
                        const total = group.milestones.length;
                        const pct = Math.round((done / total) * 100);
                        return (
                            <TouchableOpacity
                                key={group.id}
                                style={styles.pastGroupRow}
                                onPress={() => setSelectedGroup(group)}
                            >
                                <Text style={{ fontSize: 20 }}>{group.emoji}</Text>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.pastGroupTitle}>{group.label}</Text>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: group.color }]} />
                                    </View>
                                </View>
                                <Text style={styles.pastGroupPct}>{done}/{total}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── RESOURCES SECTION ────────────────────────────── */}
                <View style={styles.resourcesSection}>
                    <Text style={styles.sectionLabel}>📚 Trusted Resources</Text>

                    {/* Growth Chart cross-link */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#1a237e',
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={() => navigation.navigate('GrowthTracker' as any)}
                    >
                        <Text style={{ fontSize: 24, marginRight: 10 }}>📈</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Baby Growth Chart</Text>
                            <Text style={{ color: '#82b1ff', fontSize: 12, marginTop: 2 }}>
                                Track weight, length & head with CDC/WHO percentile curves
                            </Text>
                        </View>
                        <Text style={{ color: '#82b1ff', fontSize: 18 }}>→</Text>
                    </TouchableOpacity>

                    <Text style={styles.resourceItem}>• CDC Milestone Tracker: cdc.gov/milestones</Text>
                    <Text style={styles.resourceItem}>• AAP HealthyChildren.org</Text>
                    <Text style={styles.resourceItem}>• WHO Child Growth Standards</Text>
                    <Text style={styles.resourceItem}>• Zero to Three: zerotothree.org</Text>
                    <Text style={styles.resourceItem}>• American Red Cross: redcross.org/take-a-class (CPR Training)</Text>
                    <Text style={styles.resourceItem}>• American Heart Association: heart.org/cpr</Text>

                    {/* ── MEDICAL DISCLAIMER ─────────────────────────── */}
                    <View style={{ backgroundColor: 'rgba(26,35,126,0.15)', borderRadius: 10, padding: 14, marginTop: 14, borderWidth: 1, borderColor: 'rgba(130,177,255,0.2)' }}>
                        <Text style={{ color: '#82b1ff', fontWeight: '800', fontSize: 13, marginBottom: 6 }}>
                            ⚕️ MEDICAL DISCLAIMER
                        </Text>
                        <Text style={{ color: '#999', fontSize: 11, lineHeight: 17, fontStyle: 'italic' }}>
                            This milestone tracker is an educational reference tool designed to support — not replace — the guidance of qualified healthcare professionals.
                        </Text>
                        <Text style={{ color: '#e0e0e0', fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 8 }}>
                            ⚠️ This app does not provide medical diagnoses, treatment plans, or prescriptions.
                        </Text>
                        <Text style={{ color: '#999', fontSize: 11, lineHeight: 17, marginTop: 6 }}>
                            All milestone information is sourced from the CDC "Learn the Signs. Act Early." program, WHO guidelines, and AAP Bright Futures.
                            Every child develops at their own pace. If you have any concerns about your child's development, always consult your pediatrician or qualified healthcare provider.
                        </Text>
                        <Text style={{ color: '#ff8a80', fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 8 }}>
                            In a medical emergency, call 911 immediately.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MILESTONE DETAIL MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={!!selectedMilestone} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedMilestone && (() => {
                            const m = selectedMilestone;
                            const isDone = completedIds.has(m.id);
                            const catMeta = CATEGORY_META[m.category];
                            const completedEntry = completed.find(c => c.id === m.id);
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalHeader}>
                                        <Text style={{ fontSize: 40 }}>{m.emoji}</Text>
                                        <Text style={styles.modalTitle}>{m.title}</Text>
                                        <View style={[styles.categoryTag, { backgroundColor: catMeta.color + '30', alignSelf: 'center', marginTop: 4 }]}>
                                            <Text style={[styles.categoryTagText, { color: catMeta.color }]}>
                                                {catMeta.emoji} {catMeta.label}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.modalDesc}>{m.description}</Text>

                                    {/* Age info */}
                                    <View style={styles.modalInfoBox}>
                                        <Text style={styles.modalInfoTitle}>📅 Age Range</Text>
                                        <Text style={styles.modalInfoText}>
                                            Typical: {m.typicalMonth} months{'\n'}
                                            Range: {m.ageRangeMonths[0]}–{m.ageRangeMonths[1]} months{'\n'}
                                            Concern if not by: {m.concernMonth} months
                                        </Text>
                                    </View>

                                    {/* Parent tip */}
                                    <View style={[styles.modalInfoBox, { backgroundColor: '#1b4332' }]}>
                                        <Text style={styles.modalInfoTitle}>💡 Parent Tip</Text>
                                        <Text style={styles.modalInfoText}>{m.parentTip}</Text>
                                    </View>

                                    {/* Doctor note */}
                                    <View style={[styles.modalInfoBox, { backgroundColor: '#4a1942' }]}>
                                        <Text style={styles.modalInfoTitle}>👩‍⚕️ When to Talk to Your Doctor</Text>
                                        <Text style={styles.modalInfoText}>{m.doctorNote}</Text>
                                    </View>

                                    {/* Fun fact */}
                                    {m.funFact && (
                                        <View style={[styles.modalInfoBox, { backgroundColor: '#1a3a5c' }]}>
                                            <Text style={styles.modalInfoTitle}>🤓 Did You Know?</Text>
                                            <Text style={styles.modalInfoText}>{m.funFact}</Text>
                                        </View>
                                    )}

                                    {/* Completion section */}
                                    {isDone ? (
                                        <View style={styles.completedBanner}>
                                            <Text style={styles.completedBannerText}>
                                                ✅ Completed on {new Date(completedEntry!.completedAt).toLocaleDateString()}
                                            </Text>
                                            {completedEntry?.note && (
                                                <Text style={styles.completedNote}>📝 "{completedEntry.note}"</Text>
                                            )}
                                        </View>
                                    ) : (
                                        <View style={styles.completeSection}>
                                            <Text style={styles.completeSectionTitle}>Ready to check this off? 🎉</Text>
                                            <TextInput
                                                style={styles.noteInput}
                                                placeholder="Add a note (optional) — e.g., 'First smiled at Daddy!'"
                                                placeholderTextColor="#777"
                                                value={noteText}
                                                onChangeText={setNoteText}
                                                multiline
                                            />
                                            <TouchableOpacity
                                                style={styles.completeButton}
                                                onPress={() => completeMilestone(m)}
                                            >
                                                <Text style={styles.completeButtonText}>✓ Mark Complete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Close */}
                                    <TouchableOpacity
                                        style={styles.modalClose}
                                        onPress={() => setSelectedMilestone(null)}
                                    >
                                        <Text style={styles.modalCloseText}>Close</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* AGE GROUP DETAIL MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={!!selectedGroup} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedGroup && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalHeader}>
                                    <Text style={{ fontSize: 40 }}>{selectedGroup.emoji}</Text>
                                    <Text style={styles.modalTitle}>{selectedGroup.label}</Text>
                                    <Text style={styles.modalDesc}>{selectedGroup.description}</Text>
                                </View>

                                {selectedGroup.milestones
                                    .filter(m => filterCategory === 'all' || m.category === filterCategory)
                                    .map(milestone => {
                                        const isDone = completedIds.has(milestone.id);
                                        const catMeta = CATEGORY_META[milestone.category];
                                        return (
                                            <Pressable
                                                key={milestone.id}
                                                style={[styles.milestoneRow, isDone && styles.milestoneRowDone]}
                                                onPress={() => {
                                                    setSelectedGroup(null);
                                                    setTimeout(() => {
                                                        if (isDone) {
                                                            undoMilestone(milestone.id);
                                                        } else {
                                                            setSelectedMilestone(milestone);
                                                            setNoteText('');
                                                        }
                                                    }, 300);
                                                }}
                                            >
                                                <StatusIndicator milestone={milestone} babyAgeMonths={babyAgeMonths} completed={isDone} />
                                                <View style={{ flex: 1, marginLeft: 12 }}>
                                                    <Text style={[styles.milestoneTitle, isDone && styles.milestoneTitleDone]}>
                                                        {milestone.emoji} {milestone.title}
                                                    </Text>
                                                    <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                                                </View>
                                                <View style={[styles.categoryTag, { backgroundColor: catMeta.color + '30' }]}>
                                                    <Text style={[styles.categoryTagText, { color: catMeta.color }]}>{catMeta.emoji}</Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}

                                <TouchableOpacity
                                    style={styles.modalClose}
                                    onPress={() => setSelectedGroup(null)}
                                >
                                    <Text style={styles.modalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* BADGES MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={showBadges} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 8 }]}>🏆 Your Badges</Text>
                            <Text style={[styles.modalDesc, { textAlign: 'center', marginBottom: 16 }]}>
                                {earnedBadges.size}/{BADGES.length} earned — keep going!
                            </Text>

                            <View style={styles.badgeGrid}>
                                {BADGES.map(badge => (
                                    <BadgeCard
                                        key={badge.id}
                                        badge={badge}
                                        earned={earnedBadges.has(badge.id)}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowBadges(false)}
                            >
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* BABY SETUP MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={showSetup} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: SH * 0.55 }]}>
                        <Text style={[styles.modalTitle, { textAlign: 'center' }]}>👶 Baby Setup</Text>
                        <Text style={[styles.modalDesc, { textAlign: 'center', marginBottom: 16 }]}>
                            Enter your baby's info to personalize the tracker
                        </Text>

                        <Text style={styles.setupLabel}>Baby's Name</Text>
                        <TextInput
                            style={styles.setupInput}
                            placeholder="e.g., Emma"
                            placeholderTextColor="#777"
                            value={setupName}
                            onChangeText={setSetupName}
                            autoCapitalize="words"
                        />

                        <Text style={styles.setupLabel}>Date of Birth</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                style={[styles.setupInput, { flex: 1 }]}
                                placeholder="MM"
                                placeholderTextColor="#777"
                                value={setupMonth}
                                onChangeText={setSetupMonth}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <TextInput
                                style={[styles.setupInput, { flex: 1 }]}
                                placeholder="DD"
                                placeholderTextColor="#777"
                                value={setupDay}
                                onChangeText={setSetupDay}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <TextInput
                                style={[styles.setupInput, { flex: 2 }]}
                                placeholder="YYYY"
                                placeholderTextColor="#777"
                                value={setupYear}
                                onChangeText={setSetupYear}
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                        </View>

                        <TouchableOpacity style={styles.completeButton} onPress={saveBabySetup}>
                            <Text style={styles.completeButtonText}>Save & Start Tracking! 🚀</Text>
                        </TouchableOpacity>

                        {babyInfo ? (
                            <TouchableOpacity style={[styles.modalClose, { marginTop: 8 }]} onPress={() => setShowSetup(false)}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.modalClose, { marginTop: 8 }]} onPress={() => navigation.goBack()}>
                                <Text style={styles.modalCloseText}>← Go Back</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: { flex: 1 },
    hero: { marginBottom: 0 },
    heroGradient: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 10, paddingBottom: 16 },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
    heroAge: { fontSize: 16, color: '#a8dadc', marginTop: 2, fontWeight: '600' },
    settingsBtn: { padding: 8 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statBox: { width: '45%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 8, alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 10, color: '#a8dadc', fontWeight: '600', marginTop: 2 },
    ringPercent: { fontSize: 20, fontWeight: '900', color: '#fff' },
    ringLabel: { fontSize: 9, color: '#a8dadc', fontWeight: '600' },
    badgesButton: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 10, marginTop: 12, alignItems: 'center' },
    badgesButtonText: { color: '#FFD700', fontWeight: '700', fontSize: 13 },

    // Alert
    alertBox: { margin: 16, backgroundColor: '#5c1010', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FF5252' },
    alertTitle: { fontSize: 16, fontWeight: '800', color: '#FF5252', marginBottom: 6 },
    alertText: { fontSize: 13, color: '#ffcccc', lineHeight: 20 },
    alertAction: { fontSize: 13, color: '#FFD700', fontWeight: '700', marginTop: 8 },

    // Tip card
    tipCard: { margin: 16, backgroundColor: '#1a3a2a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2d6a4f' },
    tipHeader: { fontSize: 14, fontWeight: '800', color: '#4CAF50', marginBottom: 6 },
    tipText: { fontSize: 14, color: '#e0e0e0', lineHeight: 22 },
    tipSource: { fontSize: 11, color: '#888', marginTop: 6, fontStyle: 'italic' },

    // Why card
    whyCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1a237e', borderRadius: 12, padding: 14 },
    whyText: { fontSize: 13, color: '#82b1ff', fontWeight: '700', textAlign: 'center' },

    // Legend
    legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 4, gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: '#888' },

    // Filter
    filterRow: { marginBottom: 12 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
    filterChipActive: { backgroundColor: 'rgba(76,175,80,0.3)', borderColor: '#4CAF50' },
    filterText: { fontSize: 12, color: '#888', fontWeight: '600' },
    filterTextActive: { color: '#4CAF50' },

    // Age section
    ageSection: { marginHorizontal: 16 },
    ageSectionHeader: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, paddingLeft: 12, marginBottom: 12, gap: 10 },
    ageSectionEmoji: { fontSize: 32 },
    ageSectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
    ageSectionDesc: { fontSize: 12, color: '#a0a0a0', marginTop: 2, lineHeight: 16 },
    ageBadge: { backgroundColor: 'rgba(76,175,80,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    ageBadgeText: { color: '#4CAF50', fontWeight: '700', fontSize: 13 },

    // Milestone row
    milestoneRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    milestoneRowDone: { backgroundColor: 'rgba(76,175,80,0.08)', borderColor: 'rgba(76,175,80,0.2)' },
    milestoneTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    milestoneTitleDone: { color: '#4CAF50', textDecorationLine: 'line-through' },
    milestoneDesc: { fontSize: 12, color: '#a0a0a0', marginTop: 2 },
    milestoneAge: { fontSize: 10, color: '#666', marginTop: 4 },
    categoryTag: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
    categoryTagText: { fontSize: 11, fontWeight: '600' },

    // Status dot
    statusDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    statusIcon: { color: '#fff', fontSize: 14, fontWeight: '800' },

    // Upcoming
    upcomingCard: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, gap: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    upcomingEmoji: { fontSize: 28 },
    upcomingTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    upcomingDesc: { fontSize: 12, color: '#888' },

    // Section label
    sectionLabel: { fontSize: 16, fontWeight: '800', color: '#fff', marginHorizontal: 16, marginBottom: 12 },

    // Past groups
    pastGroupRow: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, gap: 8,
    },
    pastGroupTitle: { fontSize: 14, fontWeight: '600', color: '#ccc', marginBottom: 4 },
    pastGroupPct: { fontSize: 13, fontWeight: '700', color: '#fff' },
    progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },

    // Resources
    resourcesSection: { margin: 16, marginTop: 24 },
    resourceItem: { fontSize: 13, color: '#888', marginBottom: 4, lineHeight: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, maxHeight: SH * 0.85, paddingBottom: 40,
    },
    modalHeader: { alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 8 },
    modalDesc: { fontSize: 14, color: '#a0a0a0', lineHeight: 20, marginTop: 4 },
    modalInfoBox: { backgroundColor: '#162447', borderRadius: 12, padding: 14, marginTop: 12 },
    modalInfoTitle: { fontSize: 14, fontWeight: '800', color: '#FFD700', marginBottom: 6 },
    modalInfoText: { fontSize: 13, color: '#e0e0e0', lineHeight: 20 },
    modalClose: { alignSelf: 'center', marginTop: 16, paddingVertical: 12, paddingHorizontal: 30 },
    modalCloseText: { color: '#888', fontSize: 15, fontWeight: '600' },

    // Completed banner
    completedBanner: { backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#4CAF50' },
    completedBannerText: { color: '#4CAF50', fontWeight: '700', fontSize: 14, textAlign: 'center' },
    completedNote: { color: '#a8dadc', fontSize: 13, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },

    // Complete section
    completeSection: { marginTop: 16 },
    completeSectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
    noteInput: {
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
        color: '#fff', fontSize: 14, minHeight: 60, textAlignVertical: 'top',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    completeButton: {
        backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, marginTop: 12,
        alignItems: 'center', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    // Badges
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    badgeCard: {
        width: (SW - 72) / 3, alignItems: 'center', padding: 12, borderRadius: 12,
        borderWidth: 1, minHeight: 110,
    },
    badgeName: { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    badgeDesc: { fontSize: 9, marginTop: 2, textAlign: 'center', lineHeight: 12 },

    // Setup
    setupLabel: { color: '#a0a0a0', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    setupInput: {
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 14,
        color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
});
