import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LuckyNumbers'>;

const { width: screenWidth } = Dimensions.get('window');

// Generate lucky numbers based on birthday and current date
function generateLuckyNumbers(birthDate: Date): {
    mainNumbers: number[];
    bonusNumber: number;
    powerNumber: number;
    luckyTime: string;
    luckyColor: { name: string; hex: string };
} {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    const today = new Date();
    const todayNum = today.getDate() + today.getMonth() + 1 + today.getFullYear();

    // Create a seed based on birthday + today's date for daily variation
    const seed = (month * day * year + todayNum) % 1000000;

    // Generate main numbers (1-69 like Powerball)
    const mainNumbers: number[] = [];
    let current = seed;
    while (mainNumbers.length < 5) {
        current = (current * 9301 + 49297) % 233280;
        const num = (current % 69) + 1;
        if (!mainNumbers.includes(num)) {
            mainNumbers.push(num);
        }
    }
    mainNumbers.sort((a, b) => a - b);

    // Bonus number (1-26 like Powerball)
    current = (current * 9301 + 49297) % 233280;
    const bonusNumber = (current % 26) + 1;

    // Power number (1-10)
    current = (current * 9301 + 49297) % 233280;
    const powerNumber = (current % 10) + 1;

    // Lucky time
    const hours = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
    current = (current * 9301 + 49297) % 233280;
    const luckyTime = hours[current % hours.length];

    // Lucky color
    const colors = [
        { name: 'Red', hex: '#e74c3c' },
        { name: 'Blue', hex: '#3498db' },
        { name: 'Green', hex: '#27ae60' },
        { name: 'Purple', hex: '#9b59b6' },
        { name: 'Gold', hex: '#f39c12' },
        { name: 'Pink', hex: '#e91e63' },
        { name: 'Teal', hex: '#00bcd4' },
        { name: 'Orange', hex: '#ff5722' },
        { name: 'Silver', hex: '#95a5a6' },
        { name: 'Indigo', hex: '#3f51b5' },
    ];
    current = (current * 9301 + 49297) % 233280;
    const luckyColor = colors[current % colors.length];

    return { mainNumbers, bonusNumber, powerNumber, luckyTime, luckyColor };
}

export default function LuckyNumbersScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const [numbers, setNumbers] = useState(generateLuckyNumbers(birthDate));
    const [bounceAnim] = useState(new Animated.Value(0));

    const today = new Date();
    const formattedToday = today.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Bounce animation for the numbers
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const regenerateNumbers = () => {
        // Add some randomness by using current milliseconds
        const now = new Date();
        const randomizedDate = new Date(
            birthDate.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
        );
        setNumbers(generateLuckyNumbers(randomizedDate));
    };

    return (
        <LinearGradient colors={['#1a5f2a', '#2d8a3e', '#3cb371']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a5f2a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🍀</Text>
                    <Text style={styles.title}>Your Lucky Numbers</Text>
                    <Text style={styles.subtitle}>{formattedToday}</Text>
                </View>

                {/* Main Lucky Numbers */}
                <View style={styles.numbersSection}>
                    <Text style={styles.sectionLabel}>Today's Lucky Numbers</Text>
                    <View style={styles.numbersRow}>
                        {numbers.mainNumbers.map((num, index) => (
                            <View key={index} style={styles.numberBall}>
                                <Text style={styles.numberText}>{num}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bonus & Power Numbers */}
                <View style={styles.specialNumbers}>
                    <View style={styles.specialCard}>
                        <Text style={styles.specialLabel}>Bonus</Text>
                        <View style={[styles.numberBall, styles.bonusBall]}>
                            <Text style={styles.numberText}>{numbers.bonusNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.specialCard}>
                        <Text style={styles.specialLabel}>Power</Text>
                        <View style={[styles.numberBall, styles.powerBall]}>
                            <Text style={styles.numberText}>{numbers.powerNumber}</Text>
                        </View>
                    </View>
                </View>

                {/* Lucky Time & Color */}
                <View style={styles.extrasRow}>
                    <View style={styles.extraCard}>
                        <Text style={styles.extraEmoji}>⏰</Text>
                        <Text style={styles.extraLabel}>Lucky Time</Text>
                        <Text style={styles.extraValue}>{numbers.luckyTime}</Text>
                    </View>
                    <View style={styles.extraCard}>
                        <Text style={styles.extraEmoji}>🎨</Text>
                        <Text style={styles.extraLabel}>Lucky Color</Text>
                        <View style={styles.colorRow}>
                            <View style={[styles.colorDot, { backgroundColor: numbers.luckyColor.hex }]} />
                            <Text style={styles.extraValue}>{numbers.luckyColor.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Regenerate Button */}
                <TouchableOpacity style={styles.regenButton} onPress={regenerateNumbers}>
                    <Text style={styles.regenText}>🎲 Generate New Numbers</Text>
                </TouchableOpacity>

                {/* What Are Lucky Numbers For? */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>What Are Lucky Numbers?</Text>
                    <Text style={styles.infoText}>
                        Lucky numbers are special numbers believed to bring good fortune, positive energy,
                        and favorable outcomes. They're calculated using numerology principles based on
                        your birth date combined with today's cosmic energies.
                    </Text>

                    <Text style={styles.infoSubtitle}>🎰 Lottery & Games</Text>
                    <Text style={styles.infoText}>
                        Use these numbers when playing lottery games, raffles, bingo, or any games of chance.
                        Many people use their personalized lucky numbers for Powerball, Mega Millions,
                        scratch-offs, and casino games.
                    </Text>

                    <Text style={styles.infoSubtitle}>📅 Important Decisions</Text>
                    <Text style={styles.infoText}>
                        Schedule important meetings, sign contracts, or make big decisions at your lucky time.
                        Your lucky numbers can help you choose dates for events like weddings, job interviews,
                        or house closings.
                    </Text>

                    <Text style={styles.infoSubtitle}>🏠 Addresses & Phone Numbers</Text>
                    <Text style={styles.infoText}>
                        When choosing between options, look for your lucky numbers in addresses,
                        phone numbers, license plates, or apartment numbers.
                    </Text>

                    <Text style={styles.infoSubtitle}>💼 Business & Career</Text>
                    <Text style={styles.infoText}>
                        Use lucky numbers for pricing products, setting goals, or choosing office numbers.
                        Some entrepreneurs incorporate lucky numbers into their business names or branding.
                    </Text>

                    <Text style={styles.infoSubtitle}>🎨 Your Lucky Color</Text>
                    <Text style={styles.infoText}>
                        Wear your lucky color for important occasions, use it in your environment,
                        or incorporate it into presentations and materials when you need an extra boost of luck.
                    </Text>

                    <Text style={styles.infoSubtitle}>⏰ Your Lucky Time</Text>
                    <Text style={styles.infoText}>
                        This is when your energy aligns most favorably with the universe today.
                        Schedule important calls, send key emails, or start new projects during this hour.
                    </Text>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        🌟 For entertainment purposes only. Lucky numbers are based on numerology traditions
                        and should be used for fun. Always gamble responsibly.
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
        marginBottom: 30,
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
    specialNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    specialCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        width: '45%',
    },
    specialLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a5f2a',
        marginBottom: 12,
    },
    bonusBall: {
        backgroundColor: '#f39c12',
    },
    powerBall: {
        backgroundColor: '#e74c3c',
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
    regenButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    regenText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f2a',
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
