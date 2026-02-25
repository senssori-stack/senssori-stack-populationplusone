import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── TYPES ──────────────────────────────────────
interface Story {
    id: string;
    title: string;
    emoji: string;
    ageRange: string;
    readTime: string;
    pages: string[];
}

// ─── DATA ───────────────────────────────────────
const stories: Story[] = require('../../assets/stories/stories.json');

const { width } = Dimensions.get('window');

// ─── COMPONENT ──────────────────────────────────
export default function StoryReaderScreen() {
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [femaleVoice, setFemaleVoice] = useState<string | undefined>(undefined);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // ── Find a female English voice on mount ─
    useEffect(() => {
        (async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();
                const englishVoices = voices.filter((v) =>
                    v.language.startsWith('en'),
                );

                // Prefer well-known female voice names across platforms
                const femaleKeywords = [
                    'samantha', 'karen', 'moira', 'victoria', 'allison',
                    'ava', 'susan', 'zira', 'hazel', 'jenny', 'aria',
                    'siri female', 'google us english', 'female',
                ];

                const match = englishVoices.find((v) => {
                    const name = v.name.toLowerCase();
                    return femaleKeywords.some((kw) => name.includes(kw));
                });

                if (match) {
                    setFemaleVoice(match.identifier);
                } else if (englishVoices.length > 0) {
                    // Fallback: use first available English voice
                    setFemaleVoice(englishVoices[0].identifier);
                }
            } catch (_e) {
                // Voice detection unavailable — will use defaults
            }
        })();
    }, []);

    // ── Clean text for TTS (strip emojis & extra whitespace) ──
    const cleanForSpeech = useCallback((text: string) => {
        return text
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}]/gu, '')
            .replace(/\n{2,}/g, '. ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }, []);

    // ── Animate page turns ───────────────────
    const animatePageTurn = useCallback(
        (nextPage: number) => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                setCurrentPage(nextPage);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            });
        },
        [fadeAnim],
    );

    // ── Next / Prev page ─────────────────────
    const nextPage = useCallback(() => {
        if (!selectedStory) return;
        if (currentPage < selectedStory.pages.length - 1) {
            Speech.stop();
            setIsReading(false);
            animatePageTurn(currentPage + 1);
        }
    }, [selectedStory, currentPage, animatePageTurn]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            Speech.stop();
            setIsReading(false);
            animatePageTurn(currentPage - 1);
        }
    }, [currentPage, animatePageTurn]);

    // ── Go back to story list ────────────────
    const goBack = useCallback(() => {
        Speech.stop();
        setIsReading(false);
        setSelectedStory(null);
        setCurrentPage(0);
        fadeAnim.setValue(1);
    }, [fadeAnim]);

    // ── Read aloud / stop ────────────────────
    const toggleReadAloud = useCallback(() => {
        if (isReading) {
            Speech.stop();
            setIsReading(false);
        } else if (selectedStory) {
            setIsReading(true);
            const text = cleanForSpeech(selectedStory.pages[currentPage]);
            Speech.speak(text, {
                language: 'en-US',
                ...(femaleVoice ? { voice: femaleVoice } : {}),
                rate: 0.85,
                pitch: 1.1,
                onDone: () => setIsReading(false),
                onStopped: () => setIsReading(false),
            });
        }
    }, [isReading, selectedStory, currentPage, femaleVoice, cleanForSpeech]);

    // ── READING VIEW ─────────────────────────
    if (selectedStory) {
        const totalPages = selectedStory.pages.length;
        const isLastPage = currentPage === totalPages - 1;
        const isFirstPage = currentPage === 0;
        const progress = (currentPage + 1) / totalPages;

        return (
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#0f172a']}
                style={styles.container}
            >
                {/* Header bar */}
                <View style={styles.readerHeader}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#93c5fd" />
                        <Text style={styles.backText}>Stories</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageIndicator}>
                        {currentPage + 1} / {totalPages}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${progress * 100}%` }]}
                    />
                </View>

                {/* Story title */}
                <View style={styles.storyTitleBar}>
                    <Text style={styles.storyEmoji}>{selectedStory.emoji}</Text>
                    <Text style={styles.storyTitleText}>{selectedStory.title}</Text>
                </View>

                {/* Page content */}
                <View style={styles.pageContainer}>
                    <Animated.View
                        style={[styles.pageCard, { opacity: fadeAnim }]}
                    >
                        <Text style={styles.pageText}>
                            {selectedStory.pages[currentPage]}
                        </Text>
                    </Animated.View>
                </View>

                {/* Read Aloud button */}
                <View style={styles.readAloudRow}>
                    <TouchableOpacity
                        onPress={toggleReadAloud}
                        style={[
                            styles.readAloudBtn,
                            isReading && styles.readAloudBtnActive,
                        ]}
                    >
                        <Ionicons
                            name={isReading ? 'stop-circle' : 'volume-high'}
                            size={20}
                            color={isReading ? '#0f172a' : '#93c5fd'}
                        />
                        <Text
                            style={[
                                styles.readAloudText,
                                isReading && styles.readAloudTextActive,
                            ]}
                        >
                            {isReading ? 'Stop Reading' : 'Read Aloud'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Navigation buttons */}
                <View style={styles.navRow}>
                    <TouchableOpacity
                        onPress={prevPage}
                        style={[styles.navBtn, isFirstPage && styles.navBtnDisabled]}
                        disabled={isFirstPage}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color={isFirstPage ? '#334155' : '#93c5fd'}
                        />
                        <Text
                            style={[
                                styles.navBtnText,
                                isFirstPage && styles.navBtnTextDisabled,
                            ]}
                        >
                            Back
                        </Text>
                    </TouchableOpacity>

                    {isLastPage ? (
                        <TouchableOpacity
                            onPress={goBack}
                            style={styles.finishBtn}
                        >
                            <Ionicons name="book" size={20} color="#0f172a" />
                            <Text style={styles.finishBtnText}>
                                More Stories
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={nextPage}
                            style={styles.navBtn}
                        >
                            <Text style={styles.navBtnText}>Next</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={28}
                                color="#93c5fd"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        );
    }

    // ── STORY LIST VIEW ──────────────────────
    const renderStoryCard = ({ item }: { item: Story }) => (
        <TouchableOpacity
            style={styles.storyCard}
            onPress={() => {
                setSelectedStory(item);
                setCurrentPage(0);
                fadeAnim.setValue(1);
            }}
            activeOpacity={0.7}
        >
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <View style={styles.cardMeta}>
                    <Text style={styles.cardAge}>Ages {item.ageRange}</Text>
                    <Text style={styles.cardDot}>·</Text>
                    <Text style={styles.cardTime}>{item.readTime}</Text>
                    <Text style={styles.cardDot}>·</Text>
                    <Text style={styles.cardPages}>
                        {item.pages.length} pages
                    </Text>
                </View>
            </View>
            <Ionicons name="book-outline" size={20} color="#64748b" />
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0f172a', '#1e1b4b', '#0f172a']}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>📖</Text>
                <Text style={styles.headerTitle}>Bedtime Stories</Text>
                <Text style={styles.headerSub}>
                    Classic tales retold for your little one
                </Text>
                <Text style={styles.headerNote}>
                    25 stories · All ages 1–5 · Public domain tales
                </Text>
            </View>

            {/* Story list */}
            <FlatList
                data={stories}
                renderItem={renderStoryCard}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </LinearGradient>
    );
}

// ─── STYLES ─────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // ── List header ──
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingHorizontal: 20,
        paddingBottom: 12,
        alignItems: 'center',
    },
    headerEmoji: { fontSize: 40, marginBottom: 4 },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
        textAlign: 'center',
    },
    headerNote: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },

    // ── Story list ──
    list: { flex: 1, paddingHorizontal: 16 },
    storyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30,41,59,0.6)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardEmoji: { fontSize: 32, marginRight: 12 },
    cardInfo: { flex: 1 },
    cardTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    cardAge: { color: '#64748b', fontSize: 12 },
    cardDot: { color: '#475569', fontSize: 12, marginHorizontal: 6 },
    cardTime: { color: '#64748b', fontSize: 12 },
    cardPages: { color: '#64748b', fontSize: 12 },

    // ── Reader header ──
    readerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 16,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center' },
    backText: { color: '#93c5fd', fontSize: 16, fontWeight: '600', marginLeft: 4 },
    pageIndicator: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    // ── Progress ──
    progressBar: {
        height: 3,
        backgroundColor: '#1e293b',
        marginHorizontal: 16,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#93c5fd',
        borderRadius: 2,
    },

    // ── Story title bar ──
    storyTitleBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    storyEmoji: { fontSize: 28, marginRight: 10 },
    storyTitleText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // ── Page content ──
    pageContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    pageCard: {
        backgroundColor: 'rgba(30,41,59,0.5)',
        borderRadius: 16,
        padding: 28,
        borderWidth: 1,
        borderColor: '#334155',
    },
    pageText: {
        color: '#e2e8f0',
        fontSize: 19,
        lineHeight: 30,
        fontWeight: '400',
        textAlign: 'left',
    },

    // ── Navigation ──
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { color: '#93c5fd', fontSize: 16, fontWeight: '600' },
    navBtnTextDisabled: { color: '#334155' },
    finishBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#93c5fd',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
    },
    finishBtnText: {
        color: '#0f172a',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },

    // ── Read Aloud ──
    readAloudRow: {
        alignItems: 'center',
        paddingBottom: 4,
    },
    readAloudBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#93c5fd',
        backgroundColor: 'rgba(147,197,253,0.1)',
    },
    readAloudBtnActive: {
        backgroundColor: '#93c5fd',
        borderColor: '#93c5fd',
    },
    readAloudText: {
        color: '#93c5fd',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
    readAloudTextActive: {
        color: '#0f172a',
    },
});
