/**
 * LearningScreen.tsx
 * 
 * Learning Center — Alphabet, Numbers, Shapes & Colors
 * Original educational content by Population +1
 * 
 * Features:
 * - 4 category tabs (Letters, Numbers, Shapes, Colors)
 * - Tap-to-explore detail modals for each item
 * - Learning milestones checklist by age
 * - Parent tips section
 * - Progress tracking via AsyncStorage
 * - Medical/educational disclaimer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ALPHABET,
    COLORS,
    LEARNING_MILESTONES,
    LEARNING_SUMMARY,
    LEARNING_TIPS,
    NUMBERS, SHAPES,
    type ColorData,
    type LearningTip,
    type LetterData, type NumberData, type ShapeData
} from '../data/learning-data';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LearningCenter'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 3;

// Storage keys
const PROGRESS_KEY = '@p1_learning_progress';
const MILESTONES_KEY = '@p1_learning_milestones';

// Category config
const CATEGORIES = [
    { key: 'letters' as const, label: 'ABC', emoji: '🔤', color: '#1565C0' },
    { key: 'numbers' as const, label: '123', emoji: '🔢', color: '#2E7D32' },
    { key: 'shapes' as const, label: 'Shapes', emoji: '🔺', color: '#E65100' },
    { key: 'colors' as const, label: 'Colors', emoji: '🎨', color: '#7B1FA2' },
];

type CategoryKey = 'letters' | 'numbers' | 'shapes' | 'colors';

// Age groups for milestones
const AGE_GROUPS = ['0-12 months', '1-2 years', '2-3 years', '3-4 years', '4-5 years'];

export default function LearningScreen({ navigation }: Props) {
    // ─── State ────────────────────────────────
    const [activeTab, setActiveTab] = useState<CategoryKey>('letters');
    const [viewMode, setViewMode] = useState<'explore' | 'milestones' | 'tips'>('explore');

    // Detail modals
    const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<NumberData | null>(null);
    const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
    const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);

    // Progress
    const [exploredItems, setExploredItems] = useState<Set<string>>(new Set());
    const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
    const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[2]); // default 2-3 years
    const [selectedTip, setSelectedTip] = useState<LearningTip | null>(null);

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ─── Load Progress ────────────────────────
    useEffect(() => {
        loadProgress();
        Animated.timing(fadeAnim, {
            toValue: 1, duration: 600, useNativeDriver: true,
        }).start();
    }, []);

    const loadProgress = async () => {
        try {
            const [progressData, milestonesData] = await Promise.all([
                AsyncStorage.getItem(PROGRESS_KEY),
                AsyncStorage.getItem(MILESTONES_KEY),
            ]);
            if (progressData) setExploredItems(new Set(JSON.parse(progressData)));
            if (milestonesData) setCompletedMilestones(new Set(JSON.parse(milestonesData)));
        } catch (e) { /* first load */ }
    };

    const markExplored = async (key: string) => {
        const updated = new Set(exploredItems);
        updated.add(key);
        setExploredItems(updated);
        try {
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify([...updated]));
        } catch (e) { /* silent */ }
    };

    const toggleMilestone = async (id: string) => {
        const updated = new Set(completedMilestones);
        if (updated.has(id)) updated.delete(id);
        else updated.add(id);
        setCompletedMilestones(updated);
        try {
            await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify([...updated]));
        } catch (e) { /* silent */ }
    };

    // ─── Progress Calculation ─────────────────
    const getTabProgress = (tab: CategoryKey) => {
        let total = 0;
        let explored = 0;
        const prefix = tab === 'letters' ? 'letter_' : tab === 'numbers' ? 'number_' : tab === 'shapes' ? 'shape_' : 'color_';
        const items = tab === 'letters' ? ALPHABET : tab === 'numbers' ? NUMBERS : tab === 'shapes' ? SHAPES : COLORS;
        total = items.length;
        items.forEach((_item, i) => {
            if (exploredItems.has(`${prefix}${i}`)) explored++;
        });
        return { total, explored, pct: total > 0 ? Math.round((explored / total) * 100) : 0 };
    };

    const totalExplored = exploredItems.size;
    const totalItems = LEARNING_SUMMARY.totalLetters + LEARNING_SUMMARY.totalNumbers + LEARNING_SUMMARY.totalShapes + LEARNING_SUMMARY.totalColors;

    // ─── Renderers ────────────────────────────

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            {CATEGORIES.map(cat => {
                const active = activeTab === cat.key;
                const progress = getTabProgress(cat.key);
                return (
                    <TouchableOpacity
                        key={cat.key}
                        style={[styles.tab, active && { backgroundColor: cat.color }]}
                        onPress={() => setActiveTab(cat.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.tabEmoji}>{cat.emoji}</Text>
                        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{cat.label}</Text>
                        {progress.explored > 0 && (
                            <View style={[styles.progressBadge, { backgroundColor: active ? '#fff' : cat.color }]}>
                                <Text style={[styles.progressBadgeText, { color: active ? cat.color : '#fff' }]}>
                                    {progress.pct}%
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderViewToggle = () => (
        <View style={styles.viewToggle}>
            {[
                { key: 'explore' as const, label: '📖 Explore' },
                { key: 'milestones' as const, label: '✅ Milestones' },
                { key: 'tips' as const, label: '💡 Tips' },
            ].map(v => (
                <TouchableOpacity
                    key={v.key}
                    style={[styles.viewBtn, viewMode === v.key && styles.viewBtnActive]}
                    onPress={() => setViewMode(v.key)}
                >
                    <Text style={[styles.viewBtnText, viewMode === v.key && styles.viewBtnTextActive]}>
                        {v.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // ─── LETTERS GRID ─────────────────────────
    const renderLettersGrid = () => (
        <View style={styles.gridContainer}>
            <Text style={styles.sectionTitle}>The Alphabet</Text>
            <Text style={styles.sectionSubtitle}>Tap any letter to explore its sound, words, and activities</Text>
            <View style={styles.grid}>
                {ALPHABET.map((letter, idx) => {
                    const explored = exploredItems.has(`letter_${idx}`);
                    return (
                        <TouchableOpacity
                            key={letter.letter}
                            style={[styles.letterCard, explored && styles.exploredCard]}
                            onPress={() => {
                                setSelectedLetter(letter);
                                markExplored(`letter_${idx}`);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.letterBig}>{letter.uppercase}</Text>
                            <Text style={styles.letterSmall}>{letter.lowercase}</Text>
                            <Text style={styles.letterEmoji}>{letter.emoji}</Text>
                            {explored && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // ─── NUMBERS GRID ─────────────────────────
    const renderNumbersGrid = () => (
        <View style={styles.gridContainer}>
            <Text style={styles.sectionTitle}>Numbers 0-20</Text>
            <Text style={styles.sectionSubtitle}>Tap any number to learn counting activities and fun facts</Text>
            <View style={styles.grid}>
                {NUMBERS.map((num, idx) => {
                    const explored = exploredItems.has(`number_${idx}`);
                    return (
                        <TouchableOpacity
                            key={num.number}
                            style={[styles.numberCard, explored && styles.exploredCardGreen]}
                            onPress={() => {
                                setSelectedNumber(num);
                                markExplored(`number_${idx}`);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.numberBig}>{num.number}</Text>
                            <Text style={styles.numberWord}>{num.word}</Text>
                            <Text style={styles.numberEmoji}>{num.emoji}</Text>
                            {explored && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // ─── SHAPES GRID ──────────────────────────
    const renderShapesGrid = () => (
        <View style={styles.gridContainer}>
            <Text style={styles.sectionTitle}>Shapes</Text>
            <Text style={styles.sectionSubtitle}>Tap to learn about each shape and where to find them</Text>
            <View style={styles.grid}>
                {SHAPES.map((shape, idx) => {
                    const explored = exploredItems.has(`shape_${idx}`);
                    return (
                        <TouchableOpacity
                            key={shape.name}
                            style={[styles.shapeCard, explored && styles.exploredCardOrange]}
                            onPress={() => {
                                setSelectedShape(shape);
                                markExplored(`shape_${idx}`);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.shapeEmoji}>{shape.emoji}</Text>
                            <Text style={styles.shapeName}>{shape.name}</Text>
                            <Text style={styles.shapeSides}>
                                {typeof shape.sides === 'number' ? (shape.sides === 0 ? 'No sides' : `${shape.sides} sides`) : shape.sides}
                            </Text>
                            {explored && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // ─── COLORS GRID ──────────────────────────
    const renderColorsGrid = () => (
        <View style={styles.gridContainer}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <Text style={styles.sectionSubtitle}>Tap to discover mixing tips, real-world examples, and fun facts</Text>
            <View style={styles.grid}>
                {COLORS.map((color, idx) => {
                    const explored = exploredItems.has(`color_${idx}`);
                    return (
                        <TouchableOpacity
                            key={color.name}
                            style={[
                                styles.colorCard,
                                { borderColor: color.hex, borderWidth: 3 },
                                explored && { backgroundColor: color.hex + '20' },
                            ]}
                            onPress={() => {
                                setSelectedColor(color);
                                markExplored(`color_${idx}`);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
                            <Text style={styles.colorName}>{color.name}</Text>
                            <Text style={styles.colorEmoji}>{color.emoji}</Text>
                            {explored && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // ─── MILESTONES VIEW ──────────────────────
    const renderMilestones = () => {
        const milestones = LEARNING_MILESTONES.filter(m => m.ageRange === selectedAgeGroup);
        const completed = milestones.filter(m => completedMilestones.has(m.id)).length;

        return (
            <View style={styles.milestonesContainer}>
                <Text style={styles.sectionTitle}>Learning Milestones</Text>
                <Text style={styles.sectionSubtitle}>Track your child's learning progress by age</Text>

                {/* Age selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageScroll}>
                    {AGE_GROUPS.map(age => (
                        <TouchableOpacity
                            key={age}
                            style={[styles.ageChip, selectedAgeGroup === age && styles.ageChipActive]}
                            onPress={() => setSelectedAgeGroup(age)}
                        >
                            <Text style={[styles.ageChipText, selectedAgeGroup === age && styles.ageChipTextActive]}>
                                {age}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Progress bar */}
                <View style={styles.progressBarOuter}>
                    <View style={[styles.progressBarInner, { width: `${milestones.length > 0 ? (completed / milestones.length) * 100 : 0}%` }]} />
                </View>
                <Text style={styles.progressText}>{completed} of {milestones.length} milestones reached</Text>

                {/* Milestones list */}
                {milestones.map(milestone => {
                    const done = completedMilestones.has(milestone.id);
                    const catColor = CATEGORIES.find(c => c.key === milestone.category)?.color || '#333';
                    return (
                        <TouchableOpacity
                            key={milestone.id}
                            style={[styles.milestoneRow, done && styles.milestoneRowDone]}
                            onPress={() => toggleMilestone(milestone.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.milestoneCheck, done && { backgroundColor: catColor }]}>
                                {done && <Text style={styles.milestoneCheckText}>✓</Text>}
                            </View>
                            <View style={styles.milestoneContent}>
                                <Text style={[styles.milestoneTitle, done && styles.milestoneTitleDone]}>
                                    {milestone.emoji} {milestone.title}
                                </Text>
                                <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                                <View style={[styles.categoryTag, { backgroundColor: catColor + '20' }]}>
                                    <Text style={[styles.categoryTagText, { color: catColor }]}>
                                        {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {milestones.length === 0 && (
                    <Text style={styles.emptyText}>No milestones for this age group yet.</Text>
                )}
            </View>
        );
    };

    // ─── TIPS VIEW ────────────────────────────
    const renderTips = () => (
        <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>Parent Tips</Text>
            <Text style={styles.sectionSubtitle}>Research-backed strategies to support early learning</Text>
            {LEARNING_TIPS.map(tip => (
                <TouchableOpacity
                    key={tip.id}
                    style={styles.tipCard}
                    onPress={() => setSelectedTip(tip)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                        <Text style={styles.tipAge}>{tip.ageRange}</Text>
                    </View>
                    <Text style={styles.tipArrow}>→</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // ─── DETAIL MODALS ────────────────────────

    const renderLetterModal = () => {
        if (!selectedLetter) return null;
        const l = selectedLetter;
        return (
            <Modal visible={!!selectedLetter} transparent animationType="slide" onRequestClose={() => setSelectedLetter(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalLetterBig}>{l.uppercase}{l.lowercase}</Text>
                                <Text style={styles.modalEmoji}>{l.emoji}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🔊 Phonic Sound</Text>
                                <Text style={styles.modalValue}>{l.phonicSound}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>📝 Words That Start With {l.uppercase}</Text>
                                <View style={styles.wordRow}>
                                    {l.words.map((w, i) => (
                                        <View key={i} style={styles.wordChip}>
                                            <Text style={styles.wordChipText}>{w}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>✏️ How to Write {l.uppercase}</Text>
                                <Text style={styles.modalValue}>{l.traceHint}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🎮 Try This Activity</Text>
                                <View style={styles.activityBox}>
                                    <Text style={styles.activityText}>{l.activity}</Text>
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>💡 Fun Fact</Text>
                                <Text style={styles.funFactText}>{l.funFact}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>📅 Typically Learned</Text>
                                <Text style={styles.modalValue}>{l.ageIntroduced}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLetter(null)}>
                            <Text style={styles.closeBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderNumberModal = () => {
        if (!selectedNumber) return null;
        const n = selectedNumber;
        return (
            <Modal visible={!!selectedNumber} transparent animationType="slide" onRequestClose={() => setSelectedNumber(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalNumberBig}>{n.number}</Text>
                                <Text style={styles.modalEmoji}>{n.emoji}</Text>
                            </View>
                            <Text style={styles.modalNumberWord}>{n.word}</Text>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🖐️ Show on Fingers</Text>
                                <Text style={styles.modalValue}>{n.fingerShow}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🎮 Counting Activity</Text>
                                <View style={styles.activityBox}>
                                    <Text style={styles.activityText}>{n.countingActivity}</Text>
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🌍 Real World</Text>
                                <Text style={styles.modalValue}>{n.realWorldExample}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>💡 Fun Fact</Text>
                                <Text style={styles.funFactText}>{n.funFact}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>📅 Typically Learned</Text>
                                <Text style={styles.modalValue}>{n.ageIntroduced}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.closeBtnGreen} onPress={() => setSelectedNumber(null)}>
                            <Text style={styles.closeBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderShapeModal = () => {
        if (!selectedShape) return null;
        const s = selectedShape;
        return (
            <Modal visible={!!selectedShape} transparent animationType="slide" onRequestClose={() => setSelectedShape(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalShapeName}>{s.name}</Text>
                                <Text style={styles.modalEmoji}>{s.emoji}</Text>
                            </View>
                            <Text style={styles.modalShapeSides}>
                                {typeof s.sides === 'number' ? (s.sides === 0 ? 'No straight sides' : `${s.sides} sides`) : s.sides}
                            </Text>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>✏️ How to Draw</Text>
                                <Text style={styles.modalValue}>{s.drawingTip}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🌍 Find It In Real Life</Text>
                                <View style={styles.wordRow}>
                                    {s.realWorldExamples.map((ex, i) => (
                                        <View key={i} style={styles.wordChipOrange}>
                                            <Text style={styles.wordChipTextOrange}>{ex}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>💡 Fun Fact</Text>
                                <Text style={styles.funFactText}>{s.funFact}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.closeBtnOrange} onPress={() => setSelectedShape(null)}>
                            <Text style={styles.closeBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderColorModal = () => {
        if (!selectedColor) return null;
        const c = selectedColor;
        return (
            <Modal visible={!!selectedColor} transparent animationType="slide" onRequestClose={() => setSelectedColor(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <View style={[styles.modalColorSwatch, { backgroundColor: c.hex }]} />
                                <Text style={styles.modalColorName}>{c.name}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🎨 How to Mix</Text>
                                <Text style={styles.modalValue}>{c.mixingTip}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>🌍 Find It In Real Life</Text>
                                <View style={styles.wordRow}>
                                    {c.realWorldExamples.map((ex, i) => (
                                        <View key={i} style={[styles.wordChipColor, { backgroundColor: c.hex + '20', borderColor: c.hex }]}>
                                            <Text style={[styles.wordChipTextColor, { color: c.hex === '#FFFF00' || c.hex === '#FFFFFF' ? '#333' : c.hex }]}>{ex}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>💡 Fun Fact</Text>
                                <Text style={styles.funFactText}>{c.funFact}</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: c.hex === '#FFFFFF' || c.hex === '#FFFF00' ? '#333' : c.hex }]} onPress={() => setSelectedColor(null)}>
                            <Text style={styles.closeBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderTipModal = () => {
        if (!selectedTip) return null;
        const t = selectedTip;
        return (
            <Modal visible={!!selectedTip} transparent animationType="fade" onRequestClose={() => setSelectedTip(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: 350 }]}>
                        <Text style={styles.tipModalEmoji}>{t.emoji}</Text>
                        <Text style={styles.tipModalTitle}>{t.title}</Text>
                        <Text style={styles.tipModalAge}>{t.ageRange}</Text>
                        <Text style={styles.tipModalText}>{t.tip}</Text>
                        <TouchableOpacity style={styles.closeBtnTip} onPress={() => setSelectedTip(null)}>
                            <Text style={styles.closeBtnText}>Got It</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    // ─── MAIN RENDER ──────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0a0e27', '#1a1a4e', '#0d1b3e']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                        <Text style={styles.headerEmoji}>📚</Text>
                        <Text style={styles.headerTitle}>Learning Center</Text>
                        <Text style={styles.headerSubtitle}>
                            Alphabet • Numbers • Shapes • Colors
                        </Text>
                        {totalExplored > 0 && (
                            <View style={styles.overallProgress}>
                                <Text style={styles.overallProgressText}>
                                    🌟 {totalExplored} of {totalItems} items explored ({Math.round((totalExplored / totalItems) * 100)}%)
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* Educational Disclaimer */}
                    <View style={styles.disclaimerBox}>
                        <Text style={styles.disclaimerTitle}>📋 Educational Content Notice</Text>
                        <Text style={styles.disclaimerText}>
                            This content is designed as a fun learning companion for parents and children.
                            Every child learns at their own pace — the age ranges provided are general guidelines, not rigid benchmarks.
                            If you have concerns about your child's development, consult your pediatrician.
                        </Text>
                        <Text style={styles.disclaimerSource}>Content by Population +1 — Original Educational Material</Text>
                    </View>

                    {/* Tab Bar */}
                    {renderTabBar()}

                    {/* View Toggle */}
                    {renderViewToggle()}

                    {/* Content */}
                    {viewMode === 'explore' && (
                        <>
                            {activeTab === 'letters' && renderLettersGrid()}
                            {activeTab === 'numbers' && renderNumbersGrid()}
                            {activeTab === 'shapes' && renderShapesGrid()}
                            {activeTab === 'colors' && renderColorsGrid()}
                        </>
                    )}
                    {viewMode === 'milestones' && renderMilestones()}
                    {viewMode === 'tips' && renderTips()}

                    {/* Cross-links */}
                    <View style={styles.crossLinks}>
                        <Text style={styles.crossLinksTitle}>More Resources</Text>
                        <TouchableOpacity
                            style={styles.crossLinkBtn}
                            onPress={() => navigation.navigate('MilestoneTracker')}
                        >
                            <Text style={styles.crossLinkText}>📊 Baby Milestone Tracker</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.crossLinkBtn}
                            onPress={() => navigation.navigate('GrowthTracker')}
                        >
                            <Text style={styles.crossLinkText}>📈 Baby Growth Chart</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Original educational content by Population +1.{'\n'}
                            Age guidelines based on general developmental research.{'\n'}
                            Every child is unique — learning is not a race. 💛
                        </Text>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>

            {/* Modals */}
            {renderLetterModal()}
            {renderNumberModal()}
            {renderShapeModal()}
            {renderColorModal()}
            {renderTipModal()}
        </View>
    );
}

// ─── STYLES ─────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0e27' },
    gradient: { flex: 1 },
    scrollContent: { paddingBottom: 30 },

    // Header
    header: { alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
    headerEmoji: { fontSize: 48, marginBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, letterSpacing: 0.5 },
    overallProgress: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 },
    overallProgressText: { color: '#fbbf24', fontSize: 13, fontWeight: '600' },

    // Disclaimer
    disclaimerBox: {
        margin: 16, padding: 14, backgroundColor: '#1a2744', borderRadius: 12,
        borderWidth: 1, borderColor: '#334155',
    },
    disclaimerTitle: { color: '#fbbf24', fontSize: 14, fontWeight: '700', marginBottom: 6 },
    disclaimerText: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
    disclaimerSource: { color: '#64748b', fontSize: 11, marginTop: 8, fontStyle: 'italic' },

    // Tab Bar
    tabBar: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 6 },
    tab: {
        flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
        backgroundColor: '#1e293b',
    },
    tabEmoji: { fontSize: 22 },
    tabLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    tabLabelActive: { color: '#fff' },
    progressBadge: {
        position: 'absolute', top: -4, right: -2, borderRadius: 8,
        paddingHorizontal: 5, paddingVertical: 1, minWidth: 26, alignItems: 'center',
    },
    progressBadgeText: { fontSize: 9, fontWeight: '800' },

    // View Toggle
    viewToggle: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 6 },
    viewBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
        backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155',
    },
    viewBtnActive: { backgroundColor: '#1e40af', borderColor: '#3b82f6' },
    viewBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
    viewBtnTextActive: { color: '#fff' },

    // Grid
    gridContainer: { paddingHorizontal: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
    sectionSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },

    // Letter cards
    letterCard: {
        width: CARD_WIDTH, aspectRatio: 0.85, backgroundColor: '#1e293b', borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#334155',
    },
    exploredCard: { borderColor: '#3b82f6', backgroundColor: '#1e3a5f' },
    letterBig: { fontSize: 32, fontWeight: '900', color: '#fff' },
    letterSmall: { fontSize: 18, color: '#64748b', marginTop: -2 },
    letterEmoji: { fontSize: 20, marginTop: 4 },
    checkMark: { position: 'absolute', top: 4, right: 6, fontSize: 14, color: '#22c55e', fontWeight: '900' },

    // Number cards
    numberCard: {
        width: CARD_WIDTH, aspectRatio: 0.85, backgroundColor: '#1e293b', borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#334155',
    },
    exploredCardGreen: { borderColor: '#22c55e', backgroundColor: '#14532d' },
    numberBig: { fontSize: 32, fontWeight: '900', color: '#fff' },
    numberWord: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    numberEmoji: { fontSize: 20, marginTop: 4 },

    // Shape cards
    shapeCard: {
        width: CARD_WIDTH, aspectRatio: 0.85, backgroundColor: '#1e293b', borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#334155',
        paddingHorizontal: 4,
    },
    exploredCardOrange: { borderColor: '#f97316', backgroundColor: '#431407' },
    shapeEmoji: { fontSize: 30 },
    shapeName: { fontSize: 12, color: '#fff', fontWeight: '700', marginTop: 4, textAlign: 'center' },
    shapeSides: { fontSize: 10, color: '#64748b' },

    // Color cards
    colorCard: {
        width: CARD_WIDTH, aspectRatio: 0.85, backgroundColor: '#1e293b', borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    colorSwatch: { width: 36, height: 36, borderRadius: 18, marginBottom: 4, borderWidth: 2, borderColor: '#ffffff30' },
    colorName: { fontSize: 12, color: '#fff', fontWeight: '700' },
    colorEmoji: { fontSize: 16, marginTop: 2 },

    // Milestones
    milestonesContainer: { paddingHorizontal: 16 },
    ageScroll: { marginBottom: 12 },
    ageChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#1e293b', marginRight: 8, borderWidth: 1, borderColor: '#334155',
    },
    ageChipActive: { backgroundColor: '#1e40af', borderColor: '#3b82f6' },
    ageChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    ageChipTextActive: { color: '#fff' },
    progressBarOuter: {
        height: 8, backgroundColor: '#1e293b', borderRadius: 4, marginBottom: 6, overflow: 'hidden',
    },
    progressBarInner: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
    progressText: { color: '#64748b', fontSize: 12, marginBottom: 16, fontWeight: '600' },

    milestoneRow: {
        flexDirection: 'row', alignItems: 'flex-start', padding: 12,
        backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#334155',
    },
    milestoneRowDone: { borderColor: '#22c55e50', backgroundColor: '#14532d30' },
    milestoneCheck: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2,
        borderColor: '#475569', marginRight: 12, marginTop: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    milestoneCheckText: { color: '#fff', fontSize: 14, fontWeight: '900' },
    milestoneContent: { flex: 1 },
    milestoneTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
    milestoneTitleDone: { color: '#86efac' },
    milestoneDesc: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 17 },
    categoryTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
    categoryTagText: { fontSize: 10, fontWeight: '700' },
    emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 20 },

    // Tips
    tipsContainer: { paddingHorizontal: 16 },
    tipCard: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#334155',
    },
    tipEmoji: { fontSize: 28, marginRight: 12 },
    tipContent: { flex: 1 },
    tipTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
    tipAge: { color: '#64748b', fontSize: 11, marginTop: 2 },
    tipArrow: { color: '#475569', fontSize: 20, fontWeight: '300' },

    // Cross-links
    crossLinks: { marginHorizontal: 16, marginTop: 24 },
    crossLinksTitle: { color: '#64748b', fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    crossLinkBtn: {
        padding: 14, backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#334155',
    },
    crossLinkText: { color: '#93c5fd', fontSize: 14, fontWeight: '600' },

    // Footer
    footer: { marginHorizontal: 16, marginTop: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
    footerText: { color: '#475569', fontSize: 11, textAlign: 'center', lineHeight: 17 },

    // ─── MODALS ─────────────

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10, gap: 16,
    },
    modalLetterBig: { fontSize: 56, fontWeight: '900', color: '#3b82f6' },
    modalNumberBig: { fontSize: 64, fontWeight: '900', color: '#22c55e' },
    modalNumberWord: { fontSize: 22, fontWeight: '700', color: '#86efac', textAlign: 'center', marginBottom: 8 },
    modalShapeName: { fontSize: 28, fontWeight: '800', color: '#f97316' },
    modalShapeSides: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 8 },
    modalColorName: { fontSize: 28, fontWeight: '800', color: '#fff' },
    modalColorSwatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: '#ffffff40' },
    modalEmoji: { fontSize: 48 },

    modalSection: { marginTop: 16 },
    modalLabel: { fontSize: 14, fontWeight: '800', color: '#fbbf24', marginBottom: 6 },
    modalValue: { fontSize: 14, color: '#e2e8f0', lineHeight: 21 },

    wordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    wordChip: {
        backgroundColor: '#1565C020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: '#1565C050',
    },
    wordChipText: { color: '#93c5fd', fontSize: 14, fontWeight: '600' },
    wordChipOrange: {
        backgroundColor: '#E6510020', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: '#E6510050',
    },
    wordChipTextOrange: { color: '#fb923c', fontSize: 14, fontWeight: '600' },
    wordChipColor: {
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1,
    },
    wordChipTextColor: { fontSize: 14, fontWeight: '600' },

    activityBox: {
        backgroundColor: '#0f172a', borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: '#334155', borderLeftWidth: 4, borderLeftColor: '#22c55e',
    },
    activityText: { color: '#e2e8f0', fontSize: 14, lineHeight: 21 },

    funFactText: { color: '#c4b5fd', fontSize: 14, lineHeight: 21, fontStyle: 'italic' },

    closeBtn: {
        backgroundColor: '#1565C0', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 16,
    },
    closeBtnGreen: {
        backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 16,
    },
    closeBtnOrange: {
        backgroundColor: '#E65100', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 16,
    },
    closeBtnTip: {
        backgroundColor: '#6366f1', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 16,
    },
    closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Tip Modal
    tipModalEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
    tipModalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
    tipModalAge: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 12 },
    tipModalText: { fontSize: 15, color: '#e2e8f0', lineHeight: 23, textAlign: 'center' },
});
