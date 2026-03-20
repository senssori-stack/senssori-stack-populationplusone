import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const NAVY = '#0B1929';
const GOLD = '#F5A623';
const GOLD_BRIGHT = '#FFB800';
const TOTAL_DURATION = 30000; // 30 seconds

const FEATURES = [
    { emoji: '📋', label: 'Birth Announcements' },
    { emoji: '🌟', label: 'Natal Charts' },
    { emoji: '🗺️', label: 'Astrology Maps' },
    { emoji: '📦', label: 'Time Capsule' },
    { emoji: '⚾', label: 'Trading Cards' },
    { emoji: '📈', label: 'Milestone Tracker' },
    { emoji: '🎉', label: "Life's Big Moments" },
];

const BADGES = [
    { emoji: '🚫', label: 'Zero Ads' },
    { emoji: '💰', label: 'No Subscriptions' },
    { emoji: '🔓', label: 'No Login' },
    { emoji: '🛡️', label: 'No Data Collection' },
    { emoji: '📶', label: 'Works Offline' },
    { emoji: '🖨️', label: '300 DPI Print' },
];

interface Props {
    onFinish: () => void;
}

export default function IntroVideoScreen({ onFinish }: Props) {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Scene visibility (0 = hidden, 1 = visible)
    const scene1 = useRef(new Animated.Value(0)).current;
    const scene2 = useRef(new Animated.Value(0)).current;
    const scene3 = useRef(new Animated.Value(0)).current;
    const scene4 = useRef(new Animated.Value(0)).current;
    const scene5 = useRef(new Animated.Value(0)).current;

    // Scene 1: three lines fade up
    const line1 = useRef(new Animated.Value(0)).current;
    const line2 = useRef(new Animated.Value(0)).current;
    const line3 = useRef(new Animated.Value(0)).current;

    // Scene 2: counter + slam
    const counterOpacity = useRef(new Animated.Value(0)).current;
    const plusOneScale = useRef(new Animated.Value(3)).current;
    const plusOneOpacity = useRef(new Animated.Value(0)).current;
    const ringScale1 = useRef(new Animated.Value(0.5)).current;
    const ringOpacity1 = useRef(new Animated.Value(0)).current;
    const ringScale2 = useRef(new Animated.Value(0.5)).current;
    const ringOpacity2 = useRef(new Animated.Value(0)).current;
    const makeItCountOpacity = useRef(new Animated.Value(0)).current;

    // Scene 3: feature cards slide in
    const featureAnims = useRef(FEATURES.map(() => new Animated.Value(-SCREEN_W))).current;

    // Scene 4: trust badges pop in
    const badgeAnims = useRef(BADGES.map(() => new Animated.Value(0))).current;

    // Scene 5: logo + CTA
    const logoScale = useRef(new Animated.Value(0)).current;
    const ctaOpacity = useRef(new Animated.Value(0)).current;

    // Population counter display
    const [counterValue, setCounterValue] = useState(8153420117);

    const handleSkip = useCallback(async () => {
        if (dontShowAgain) {
            await AsyncStorage.setItem('ppo_intro_dismissed', 'true');
        }
        onFinish();
    }, [dontShowAgain, onFinish]);

    const handleDontShowToggle = useCallback(() => {
        setDontShowAgain(prev => !prev);
    }, []);

    useEffect(() => {
        // Progress bar
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: TOTAL_DURATION,
            useNativeDriver: false,
        }).start();

        // Auto-finish timer
        const autoFinish = setTimeout(() => {
            handleSkip();
        }, TOTAL_DURATION + 500);

        // === SCENE 1: 0-4s — "Every second a new life enters the world" ===
        Animated.timing(scene1, { toValue: 1, duration: 300, useNativeDriver: true }).start();

        Animated.stagger(600, [
            Animated.timing(line1, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(line2, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(line3, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();

        // Fade out scene 1 at 3.5s
        const s1out = setTimeout(() => {
            Animated.timing(scene1, { toValue: 0, duration: 500, useNativeDriver: true }).start();
        }, 3500);

        // === SCENE 2: 4-13.5s — Population counter + "+1" slam ===
        const s2in = setTimeout(() => {
            Animated.timing(scene2, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            Animated.timing(counterOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();

            // Increment counter
            let count = 8153420117;
            const counterInterval = setInterval(() => {
                count += Math.floor(Math.random() * 3) + 1;
                setCounterValue(count);
            }, 200);

            // "+1" slam at 9s
            setTimeout(() => {
                clearInterval(counterInterval);
                Animated.parallel([
                    Animated.timing(plusOneOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                    Animated.spring(plusOneScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
                    // Ring 1
                    Animated.timing(ringOpacity1, { toValue: 0.8, duration: 200, useNativeDriver: true }),
                    Animated.timing(ringScale1, { toValue: 2.5, duration: 800, useNativeDriver: true }),
                    // Ring 2 (delayed)
                    Animated.sequence([
                        Animated.delay(200),
                        Animated.parallel([
                            Animated.timing(ringOpacity2, { toValue: 0.6, duration: 200, useNativeDriver: true }),
                            Animated.timing(ringScale2, { toValue: 3, duration: 900, useNativeDriver: true }),
                        ]),
                    ]),
                ]).start();

                // Fade out rings
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(ringOpacity1, { toValue: 0, duration: 600, useNativeDriver: true }),
                        Animated.timing(ringOpacity2, { toValue: 0, duration: 600, useNativeDriver: true }),
                    ]).start();
                }, 600);

                // "Make your baby count" fade in
                setTimeout(() => {
                    Animated.timing(makeItCountOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
                }, 800);
            }, 5000); // 5s after scene 2 starts = 9s total

            // Fade out scene 2 at 13s
            setTimeout(() => {
                Animated.timing(scene2, { toValue: 0, duration: 500, useNativeDriver: true }).start();
            }, 9000);
        }, 4000);

        // === SCENE 3: 13.5-21s — Feature cards slide in ===
        const s3in = setTimeout(() => {
            Animated.timing(scene3, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            Animated.stagger(300, featureAnims.map(anim =>
                Animated.spring(anim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true })
            )).start();

            // Fade out scene 3 at 20.5s
            setTimeout(() => {
                Animated.timing(scene3, { toValue: 0, duration: 500, useNativeDriver: true }).start();
            }, 7000);
        }, 13500);

        // === SCENE 4: 21-25.5s — Trust badges pop in ===
        const s4in = setTimeout(() => {
            Animated.timing(scene4, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            Animated.stagger(200, badgeAnims.map(anim =>
                Animated.spring(anim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true })
            )).start();

            // Fade out scene 4 at 25s
            setTimeout(() => {
                Animated.timing(scene4, { toValue: 0, duration: 500, useNativeDriver: true }).start();
            }, 4000);
        }, 21000);

        // === SCENE 5: 25.5-30s — Logo + CTA ===
        const s5in = setTimeout(() => {
            Animated.timing(scene5, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
            Animated.timing(ctaOpacity, { toValue: 1, duration: 800, delay: 500, useNativeDriver: true }).start();
        }, 25500);

        return () => {
            clearTimeout(autoFinish);
            clearTimeout(s1out);
            clearTimeout(s2in);
            clearTimeout(s3in);
            clearTimeout(s4in);
            clearTimeout(s5in);
        };
    }, []);

    const formatNumber = (n: number) => n.toLocaleString();

    return (
        <View style={styles.container}>
            {/* === SCENE 1 === */}
            <Animated.View style={[styles.sceneCenter, { opacity: scene1 }]} pointerEvents="none">
                <Animated.Text style={[styles.introLine, { opacity: line1, transform: [{ translateY: line1.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                    Every second
                </Animated.Text>
                <Animated.Text style={[styles.introLine, { opacity: line2, transform: [{ translateY: line2.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                    a new life enters
                </Animated.Text>
                <Animated.Text style={[styles.introLine, { opacity: line3, transform: [{ translateY: line3.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                    the world
                </Animated.Text>
            </Animated.View>

            {/* === SCENE 2 === */}
            <Animated.View style={[styles.sceneCenter, { opacity: scene2 }]} pointerEvents="none">
                <Text style={styles.worldPopLabel}>WORLD POPULATION</Text>
                <Animated.Text style={[styles.counter, { opacity: counterOpacity }]}>
                    {formatNumber(counterValue)}
                </Animated.Text>

                {/* Rings */}
                <Animated.View style={[styles.ring, {
                    opacity: ringOpacity1,
                    transform: [{ scale: ringScale1 }],
                }]} />
                <Animated.View style={[styles.ring, {
                    opacity: ringOpacity2,
                    transform: [{ scale: ringScale2 }],
                    borderColor: GOLD,
                }]} />

                {/* +1 slam */}
                <Animated.Text style={[styles.plusOne, {
                    opacity: plusOneOpacity,
                    transform: [{ scale: plusOneScale }],
                }]}>
                    +1
                </Animated.Text>

                <Animated.Text style={[styles.makeItCount, { opacity: makeItCountOpacity }]}>
                    Make your baby count
                </Animated.Text>
            </Animated.View>

            {/* === SCENE 3 === */}
            <Animated.View style={[styles.sceneCenter, { opacity: scene3 }]} pointerEvents="none">
                <Text style={styles.sectionTitle}>Everything in one app</Text>
                {FEATURES.map((f, i) => (
                    <Animated.View key={f.label} style={[styles.featureCard, { transform: [{ translateX: featureAnims[i] }] }]}>
                        <Text style={styles.featureEmoji}>{f.emoji}</Text>
                        <Text style={styles.featureLabel}>{f.label}</Text>
                    </Animated.View>
                ))}
            </Animated.View>

            {/* === SCENE 4 === */}
            <Animated.View style={[styles.sceneCenter, { opacity: scene4 }]} pointerEvents="none">
                <Text style={[styles.sectionTitle, { marginBottom: 24 }]}>Built with trust</Text>
                <View style={styles.badgeGrid}>
                    {BADGES.map((b, i) => (
                        <Animated.View key={b.label} style={[styles.badge, { transform: [{ scale: badgeAnims[i] }] }]}>
                            <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                            <Text style={styles.badgeLabel}>{b.label}</Text>
                        </Animated.View>
                    ))}
                </View>
            </Animated.View>

            {/* === SCENE 5 === */}
            <Animated.View style={[styles.sceneCenter, { opacity: scene5 }]} pointerEvents="none">
                <Animated.View style={{ transform: [{ scale: logoScale }], alignItems: 'center' }}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
                <Animated.View style={{ opacity: ctaOpacity, alignItems: 'center' }}>
                    <Text style={styles.brandName}>Population</Text>
                    <Text style={styles.plusOneBrand}>+1™</Text>
                    <Text style={styles.tagline}>MAKE YOURS COUNT</Text>
                </Animated.View>
            </Animated.View>

            {/* === BOTTOM CONTROLS === */}
            <View style={styles.bottomControls}>
                {/* Don't show again toggle */}
                <TouchableOpacity style={styles.checkboxRow} onPress={handleDontShowToggle} activeOpacity={0.7}>
                    <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
                        {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Don't show me this again</Text>
                </TouchableOpacity>

                {/* Progress bar */}
                <View style={styles.progressBar}>
                    <Animated.View style={[styles.progressFill, {
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    }]} />
                </View>

                {/* Skip button */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NAVY,
    },
    sceneCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    // Scene 1
    introLine: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '300',
        textAlign: 'center',
        lineHeight: 48,
    },

    // Scene 2
    worldPopLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        letterSpacing: 4,
        marginBottom: 8,
    },
    counter: {
        color: GOLD_BRIGHT,
        fontSize: 36,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        letterSpacing: 1,
    },
    ring: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: GOLD_BRIGHT,
    },
    plusOne: {
        color: GOLD_BRIGHT,
        fontSize: 72,
        fontWeight: '900',
        marginTop: 12,
    },
    makeItCount: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '300',
        marginTop: 20,
        fontStyle: 'italic',
    },

    // Scene 3
    sectionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 8,
        width: SCREEN_W * 0.75,
        borderLeftWidth: 3,
        borderLeftColor: GOLD,
    },
    featureEmoji: {
        fontSize: 22,
        marginRight: 12,
    },
    featureLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },

    // Scene 4
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        maxWidth: SCREEN_W * 0.85,
    },
    badge: {
        width: (SCREEN_W * 0.85 - 24) / 3,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245,166,35,0.3)',
    },
    badgeEmoji: {
        fontSize: 28,
        marginBottom: 6,
    },
    badgeLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Scene 5
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    brandName: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '300',
        letterSpacing: 2,
    },
    plusOneBrand: {
        color: GOLD_BRIGHT,
        fontSize: 28,
        fontWeight: '900',
        marginTop: -4,
    },
    tagline: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        letterSpacing: 6,
        marginTop: 12,
    },

    // Bottom controls
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: GOLD,
        borderColor: GOLD,
    },
    checkmark: {
        color: NAVY,
        fontSize: 14,
        fontWeight: '900',
    },
    checkboxLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: GOLD,
        borderRadius: 2,
    },
    skipButton: {
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 32,
    },
    skipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
});
