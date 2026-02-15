import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RabbitHole'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FLOATING_EMOJIS = ['👶', '🎂', '🎓', '💍', '🕊️', '⭐', '🎉', '🌟', '💫', '✨', '🎁', '🍼', '🎈', '🌈', '❤️'];

const FloatingEmoji = ({ emoji, delay }: { emoji: string; delay: number }) => {
    const translateY = useRef(new Animated.Value(screenHeight + 50)).current;
    const translateX = useRef(new Animated.Value(Math.random() * screenWidth)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            translateY.setValue(screenHeight + 50);
            translateX.setValue(Math.random() * (screenWidth - 50));
            opacity.setValue(1);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 6000 + Math.random() * 4000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.timing(rotate, {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    })
                ),
            ]).start(() => {
                startAnimation();
            });
        };

        const timeout = setTimeout(startAnimation, delay);
        return () => clearTimeout(timeout);
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.Text
            style={[
                styles.floatingEmoji,
                {
                    transform: [
                        { translateY },
                        { translateX },
                        { rotate: spin },
                    ],
                    opacity,
                },
            ]}
        >
            {emoji}
        </Animated.Text>
    );
};

export default function RabbitHoleScreen({ navigation }: Props) {
    const [showCredits, setShowCredits] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for the +1
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={StyleSheet.absoluteFill}
            />

            {/* Floating Emojis Background */}
            {FLOATING_EMOJIS.map((emoji, index) => (
                <FloatingEmoji key={index} emoji={emoji} delay={index * 400} />
            ))}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Content */}
                <Animated.View
                    style={[
                        styles.mainContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Giant Pulsing +1 */}
                    <Animated.View style={[styles.giantIconBox, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.giantIconText}>+1</Text>
                    </Animated.View>

                    <Text style={styles.welcomeText}>You Found It!</Text>
                    <Text style={styles.secretText}>🐰 Down the Rabbit Hole 🕳️</Text>

                    {/* Fun Facts */}
                    <View style={styles.factsContainer}>
                        <Text style={styles.factsTitle}>Fun Facts About +1</Text>

                        <View style={styles.factCard}>
                            <Text style={styles.factEmoji}>🌍</Text>
                            <Text style={styles.factText}>
                                Every 8 seconds, a new baby is born somewhere in the world!
                            </Text>
                        </View>

                        <View style={styles.factCard}>
                            <Text style={styles.factEmoji}>📊</Text>
                            <Text style={styles.factText}>
                                The world population increases by ~200,000 people every day.
                            </Text>
                        </View>

                        <View style={styles.factCard}>
                            <Text style={styles.factEmoji}>🎉</Text>
                            <Text style={styles.factText}>
                                You share your birthday with ~21 million other people!
                            </Text>
                        </View>

                        <View style={styles.factCard}>
                            <Text style={styles.factEmoji}>⏰</Text>
                            <Text style={styles.factText}>
                                The exact moment you were born will never happen again in the universe.
                            </Text>
                        </View>
                    </View>

                    {/* Credits Button */}
                    <TouchableOpacity
                        style={styles.creditsButton}
                        onPress={() => setShowCredits(!showCredits)}
                    >
                        <Text style={styles.creditsButtonText}>
                            {showCredits ? 'Hide Credits' : '✨ Secret Credits ✨'}
                        </Text>
                    </TouchableOpacity>

                    {showCredits && (
                        <View style={styles.creditsCard}>
                            <Text style={styles.creditsTitle}>🎬 Population +1™ 🎬</Text>
                            <Text style={styles.creditsSubtitle}>Created with ❤️</Text>

                            <View style={styles.creditRow}>
                                <Text style={styles.creditRole}>Concept & Vision</Text>
                                <Text style={styles.creditName}>You, The Creator</Text>
                            </View>

                            <View style={styles.creditRow}>
                                <Text style={styles.creditRole}>Development</Text>
                                <Text style={styles.creditName}>GitHub Copilot + You</Text>
                            </View>

                            <View style={styles.creditRow}>
                                <Text style={styles.creditRole}>Data Wizardry</Text>
                                <Text style={styles.creditName}>Google Sheets Magic</Text>
                            </View>

                            <View style={styles.creditRow}>
                                <Text style={styles.creditRole}>Easter Eggs</Text>
                                <Text style={styles.creditName}>Hidden Everywhere 🥚</Text>
                            </View>

                            <Text style={styles.creditsQuote}>
                                "Every life is a +1 to the world."
                            </Text>
                        </View>
                    )}

                    {/* Secret Codes */}
                    <View style={styles.secretCodesCard}>
                        <Text style={styles.secretCodesTitle}>🔐 Secret Konami Style 🔐</Text>
                        <Text style={styles.secretCodesText}>
                            Remember: About Us → Tap +1 five times{'\n'}
                            to unlock the partner portals!
                        </Text>
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>🚀 Return to Reality</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Population +1™ © 2026{'\n'}
                        Making every life count.
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    floatingEmoji: {
        position: 'absolute',
        fontSize: 30,
        zIndex: 0,
    },
    mainContent: {
        alignItems: 'center',
        zIndex: 10,
    },
    giantIconBox: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 24,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    giantIconText: {
        fontSize: 72,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(255,255,255,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    secretText: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 40,
    },
    factsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    factsTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    factCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    factEmoji: {
        fontSize: 32,
        marginRight: 14,
    },
    factText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    creditsButton: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,215,0,0.5)',
    },
    creditsButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffd700',
    },
    creditsCard: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    creditsTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffd700',
        textAlign: 'center',
        marginBottom: 4,
    },
    creditsSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 20,
    },
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    creditRole: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    creditName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    creditsQuote: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'rgba(255,215,0,0.8)',
        textAlign: 'center',
        marginTop: 20,
    },
    secretCodesCard: {
        width: '100%',
        backgroundColor: 'rgba(100,181,246,0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(100,181,246,0.3)',
        alignItems: 'center',
    },
    secretCodesTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#64b5f6',
        marginBottom: 10,
    },
    secretCodesText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 20,
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 40,
        marginBottom: 24,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#302b63',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 18,
    },
});
