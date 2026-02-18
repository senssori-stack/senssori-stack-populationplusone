import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    CATEGORY_COLORS,
    CATEGORY_LABELS,
    getDailyTip,
} from '../data/utils/daily-tips';
import { getZodiacSign } from '../data/utils/zodiac-database';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TipOfTheDay'>;

const { width: screenWidth } = Dimensions.get('window');

const ZODIAC_EMOJIS: Record<string, string> = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
};

const ZODIAC_GRADIENTS: Record<string, [string, string, string]> = {
    Aries: ['#e53935', '#c62828', '#b71c1c'],
    Taurus: ['#43a047', '#2e7d32', '#1b5e20'],
    Gemini: ['#fdd835', '#f9a825', '#f57f17'],
    Cancer: ['#90caf9', '#42a5f5', '#1565c0'],
    Leo: ['#ff8f00', '#ff6f00', '#e65100'],
    Virgo: ['#66bb6a', '#388e3c', '#1b5e20'],
    Libra: ['#ec407a', '#c2185b', '#880e4f'],
    Scorpio: ['#5c6bc0', '#283593', '#1a237e'],
    Sagittarius: ['#7e57c2', '#4527a0', '#311b92'],
    Capricorn: ['#546e7a', '#37474f', '#263238'],
    Aquarius: ['#26c6da', '#00838f', '#006064'],
    Pisces: ['#7986cb', '#3949ab', '#1a237e'],
};

export default function TipOfTheDayScreen({ route, navigation }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    const zodiacSign = useMemo(() => getZodiacSign(month, day), [month, day]);
    const tip = useMemo(() => getDailyTip(zodiacSign), [zodiacSign]);
    const emoji = ZODIAC_EMOJIS[zodiacSign] || '⭐';
    const gradients = ZODIAC_GRADIENTS[zodiacSign] || ['#4a148c', '#6a1b9a', '#7b1fa2'];

    const today = new Date();
    const dateStr = today.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <LinearGradient colors={gradients} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.dateText}>{dateStr}</Text>
                    <Text style={styles.mainTitle}>Tip of the Day</Text>
                    <Text style={styles.subtitle}>Personalized for your zodiac sign</Text>
                </View>

                {/* Zodiac Badge */}
                <View style={styles.zodiacBadge}>
                    <Text style={styles.zodiacEmoji}>{emoji}</Text>
                    <Text style={styles.zodiacName}>{zodiacSign}</Text>
                </View>

                {/* Tip Card */}
                {tip ? (
                    <View style={styles.tipCard}>
                        <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                        <Text style={styles.tipText}>{tip.tip}</Text>

                        {/* Category Badge */}
                        <View
                            style={[
                                styles.categoryBadge,
                                { backgroundColor: CATEGORY_COLORS[tip.category] || '#7b1fa2' },
                            ]}
                        >
                            <Text style={styles.categoryText}>
                                {CATEGORY_LABELS[tip.category] || tip.category}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.tipCard}>
                        <Text style={styles.tipText}>No tip available for today. Check back tomorrow!</Text>
                    </View>
                )}

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>💡 How It Works</Text>
                    <Text style={styles.infoText}>
                        Your daily tip is based on your zodiac sign ({zodiacSign}) and changes every day.
                        Each tip is tailored to the strengths, challenges, and personality traits
                        unique to your sign. Come back tomorrow for a fresh insight!
                    </Text>
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back to Fun Facts</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
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
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
        fontWeight: '500',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    zodiacBadge: {
        alignItems: 'center',
        marginBottom: 24,
    },
    zodiacEmoji: {
        fontSize: 64,
        marginBottom: 8,
    },
    zodiacName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    tipCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    tipEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    tipText: {
        fontSize: 20,
        color: '#333',
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: '500',
    },
    categoryBadge: {
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
    },
    backButton: {
        marginTop: 10,
        marginBottom: 40,
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
});
