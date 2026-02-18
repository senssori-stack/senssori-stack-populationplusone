import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import type { RootStackParamList } from '../types';
import { getZodiacSign, ZODIAC_DATABASE } from '../data/utils/zodiac-database';

type Props = NativeStackScreenProps<RootStackParamList, 'LuckyNumbers'>;

const { width: screenWidth } = Dimensions.get('window');

// Reduce a number to a single digit (1-9) or master number (11, 22, 33)
const reduceToSingleDigit = (num: number, allowMasterNumbers: boolean = true): number => {
    if (allowMasterNumbers && (num === 11 || num === 22 || num === 33)) {
        return num;
    }
    while (num > 9) {
        num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (allowMasterNumbers && (num === 11 || num === 22 || num === 33)) {
            return num;
        }
    }
    return num;
};

// Calculate Life Path Number from birth date
const calculateLifePathNumber = (birthDate: Date): number => {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    // Reduce each component separately, then add
    const monthReduced = reduceToSingleDigit(month, false);
    const dayReduced = reduceToSingleDigit(day, false);
    const yearSum = String(year).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const yearReduced = reduceToSingleDigit(yearSum, false);
    
    const total = monthReduced + dayReduced + yearReduced;
    return reduceToSingleDigit(total);
};

// Calculate Birthday Number (just the day, reduced)
const calculateBirthdayNumber = (birthDate: Date): number => {
    const day = birthDate.getDate();
    return reduceToSingleDigit(day, false);
};

// Calculate Personal Year Number
const calculatePersonalYearNumber = (birthDate: Date): number => {
    const currentYear = new Date().getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    const monthReduced = reduceToSingleDigit(month, false);
    const dayReduced = reduceToSingleDigit(day, false);
    const yearSum = String(currentYear).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    const yearReduced = reduceToSingleDigit(yearSum, false);
    
    const total = monthReduced + dayReduced + yearReduced;
    return reduceToSingleDigit(total, false);
};

// Life Path Number meanings
const LIFE_PATH_MEANINGS: { [key: number]: { title: string; description: string } } = {
    1: { title: 'The Leader', description: 'Independent, pioneering, ambitious. You forge your own path.' },
    2: { title: 'The Mediator', description: 'Diplomatic, sensitive, cooperative. You bring harmony.' },
    3: { title: 'The Communicator', description: 'Creative, expressive, social. You inspire others.' },
    4: { title: 'The Builder', description: 'Practical, disciplined, hardworking. You create foundations.' },
    5: { title: 'The Adventurer', description: 'Freedom-loving, versatile, dynamic. You embrace change.' },
    6: { title: 'The Nurturer', description: 'Caring, responsible, harmonious. You heal and protect.' },
    7: { title: 'The Seeker', description: 'Analytical, spiritual, introspective. You seek truth.' },
    8: { title: 'The Achiever', description: 'Ambitious, powerful, successful. You manifest abundance.' },
    9: { title: 'The Humanitarian', description: 'Compassionate, generous, wise. You serve humanity.' },
    11: { title: 'The Intuitive', description: 'Visionary, inspirational, idealistic. Master Number.' },
    22: { title: 'The Master Builder', description: 'Practical vision, powerful manifesting. Master Number.' },
    33: { title: 'The Master Teacher', description: 'Selfless, nurturing, healing. Master Number.' },
};

// Personal Year meanings
const PERSONAL_YEAR_MEANINGS: { [key: number]: string } = {
    1: 'New beginnings, fresh starts, taking initiative',
    2: 'Patience, partnerships, cooperation',
    3: 'Creativity, self-expression, social expansion',
    4: 'Building foundations, hard work, organization',
    5: 'Change, freedom, adventure, versatility',
    6: 'Home, family, responsibility, nurturing',
    7: 'Reflection, spirituality, inner wisdom',
    8: 'Achievement, success, material matters',
    9: 'Completion, transformation, letting go',
};

// Color hex codes for zodiac colors
const COLOR_HEX: { [key: string]: string } = {
    'Red': '#e74c3c',
    'Green': '#27ae60',
    'Pink': '#e84393',
    'Silver': '#C0C0C0',
    'Yellow': '#f1c40f',
    'Orange': '#f39c12',
    'Blue': '#3498db',
    'Purple': '#9b59b6',
    'Turquoise': '#1abc9c',
    'Brown': '#8B4513',
    'Black': '#2c3e50',
    'White': '#f5f5f5',
    'Maroon': '#800000',
    'Gray': '#808080',
    'Sea Green': '#2E8B57',
    'Lavender': '#E6E6FA',
    'Coral': '#FF7F50',
    'Navy': '#000080',
};

export default function LuckyNumbersScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    
    // Calculate all numerology numbers
    const lifePathNumber = calculateLifePathNumber(birthDate);
    const birthdayNumber = calculateBirthdayNumber(birthDate);
    const personalYearNumber = calculatePersonalYearNumber(birthDate);
    
    // Get zodiac info
    const zodiacSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
    const zodiacData = ZODIAC_DATABASE[zodiacSign];
    const zodiacLuckyNumbers = zodiacData.luckyNumbers.split(',').map(n => parseInt(n.trim()));
    const zodiacColor = zodiacData.color;
    const zodiacDay = zodiacData.day;
    const colorHex = COLOR_HEX[zodiacColor] || '#27ae60';

    const today = new Date();
    const formattedToday = today.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const lifePathMeaning = LIFE_PATH_MEANINGS[lifePathNumber] || LIFE_PATH_MEANINGS[9];
    const personalYearMeaning = PERSONAL_YEAR_MEANINGS[personalYearNumber] || '';

    return (
        <LinearGradient colors={['#1a5f2a', '#2d8a3e', '#3cb371']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a5f2a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔢</Text>
                    <Text style={styles.title}>Your Numerology Numbers</Text>
                    <Text style={styles.subtitle}>Derived from your birth chart</Text>
                </View>

                {/* Life Path Number - The Big One */}
                <View style={styles.featuredSection}>
                    <Text style={styles.featuredLabel}>Life Path Number</Text>
                    <View style={styles.featuredBall}>
                        <Text style={styles.featuredNumber}>{lifePathNumber}</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{lifePathMeaning.title}</Text>
                    <Text style={styles.featuredDescription}>{lifePathMeaning.description}</Text>
                </View>

                {/* Birthday & Personal Year Numbers */}
                <View style={styles.specialNumbers}>
                    <View style={styles.specialCard}>
                        <Text style={styles.specialLabel}>Birthday Number</Text>
                        <View style={[styles.numberBall, styles.birthdayBall]}>
                            <Text style={styles.numberText}>{birthdayNumber}</Text>
                        </View>
                        <Text style={styles.specialSubtext}>Your natural talents</Text>
                    </View>
                    <View style={styles.specialCard}>
                        <Text style={styles.specialLabel}>Personal Year</Text>
                        <View style={[styles.numberBall, styles.yearBall]}>
                            <Text style={styles.numberText}>{personalYearNumber}</Text>
                        </View>
                        <Text style={styles.specialSubtext}>{today.getFullYear()} theme</Text>
                    </View>
                </View>

                {/* Personal Year Meaning */}
                <View style={styles.yearMeaningSection}>
                    <Text style={styles.yearMeaningTitle}>Your {today.getFullYear()} Theme</Text>
                    <Text style={styles.yearMeaningText}>{personalYearMeaning}</Text>
                </View>

                {/* Zodiac Lucky Numbers */}
                <View style={styles.numbersSection}>
                    <Text style={styles.sectionLabel}>{zodiacSign} Lucky Numbers</Text>
                    <View style={styles.numbersRow}>
                        {zodiacLuckyNumbers.map((num, index) => (
                            <View key={index} style={styles.numberBall}>
                                <Text style={styles.numberText}>{num}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.zodiacSubtext}>Traditional lucky numbers for your zodiac sign</Text>
                </View>

                {/* Lucky Day & Color */}
                <View style={styles.extrasRow}>
                    <View style={styles.extraCard}>
                        <Text style={styles.extraEmoji}>📅</Text>
                        <Text style={styles.extraLabel}>Lucky Day</Text>
                        <Text style={styles.extraValue}>{zodiacDay}</Text>
                    </View>
                    <View style={styles.extraCard}>
                        <Text style={styles.extraEmoji}>🎨</Text>
                        <Text style={styles.extraLabel}>Lucky Color</Text>
                        <View style={styles.colorRow}>
                            <View style={[styles.colorDot, { backgroundColor: colorHex }]} />
                            <Text style={styles.extraValue}>{zodiacColor}</Text>
                        </View>
                    </View>
                </View>

                {/* What These Numbers Mean */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Understanding Your Numbers</Text>
                    
                    <Text style={styles.infoSubtitle}>🌟 Life Path Number</Text>
                    <Text style={styles.infoText}>
                        Your most important numerology number, calculated by reducing your full birth date 
                        to a single digit (or master number 11, 22, 33). It reveals your life's purpose, 
                        core personality traits, and the path you're meant to walk.
                    </Text>

                    <Text style={styles.infoSubtitle}>🎂 Birthday Number</Text>
                    <Text style={styles.infoText}>
                        Derived from just your birth day, this number represents your natural talents and 
                        abilities—the gifts you were born with that come easily to you.
                    </Text>

                    <Text style={styles.infoSubtitle}>📆 Personal Year Number</Text>
                    <Text style={styles.infoText}>
                        Calculated from your birth month and day plus the current year, this number 
                        reveals the theme and energy of your current year. It cycles through 1-9 
                        over a nine-year period.
                    </Text>

                    <Text style={styles.infoSubtitle}>✨ Zodiac Lucky Numbers</Text>
                    <Text style={styles.infoText}>
                        These traditional lucky numbers are associated with your zodiac sign based on 
                        centuries of astrological tradition. Each sign has specific numbers that resonate 
                        with its planetary ruler and elemental nature.
                    </Text>

                    <Text style={styles.infoSubtitle}>🎨 Lucky Color & Day</Text>
                    <Text style={styles.infoText}>
                        Your lucky color and day are determined by your zodiac sign's ruling planet 
                        and traditional associations that have been observed across cultures.
                    </Text>
                </View>

                {/* Authenticity Note */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        ✨ These numbers are calculated using genuine numerological and astrological 
                        principles based on your birth date. They represent real traditions that 
                        have been practiced for thousands of years.
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
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    featuredSection: {
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderRadius: 20,
        padding: 28,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    featuredLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    featuredBall: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#1a5f2a',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        marginBottom: 16,
    },
    featuredNumber: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
    },
    featuredTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a5f2a',
        marginBottom: 8,
    },
    featuredDescription: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    numbersSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f2a',
        marginBottom: 16,
    },
    numbersRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
    },
    numberBall: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a5f2a',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    numberText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    zodiacSubtext: {
        fontSize: 13,
        color: '#666',
        marginTop: 12,
        fontStyle: 'italic',
    },
    specialNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        gap: 12,
    },
    specialCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        flex: 1,
    },
    specialLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a5f2a',
        marginBottom: 12,
    },
    specialSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 10,
        fontStyle: 'italic',
    },
    birthdayBall: {
        backgroundColor: '#9b59b6',
    },
    yearBall: {
        backgroundColor: '#e67e22',
    },
    yearMeaningSection: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    yearMeaningTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e67e22',
        marginBottom: 6,
    },
    yearMeaningText: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    extrasRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    extraCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    extraEmoji: {
        fontSize: 30,
        marginBottom: 8,
    },
    extraLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    extraValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f2a',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a5f2a',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d8a3e',
        marginTop: 16,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    disclaimer: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    disclaimerText: {
        fontSize: 13,
        color: '#fff',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
