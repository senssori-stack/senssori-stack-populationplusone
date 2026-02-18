import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RomanNumerals'>;

const { width: screenWidth } = Dimensions.get('window');

// Convert number to Roman numerals
function toRoman(num: number): string {
    const romanNumerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];

    let result = '';
    for (const [value, symbol] of romanNumerals) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
}

export default function RomanNumeralsScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);

    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();

    const monthRoman = toRoman(month);
    const dayRoman = toRoman(day);
    const yearRoman = toRoman(year);
    const fullRoman = `${monthRoman}•${dayRoman}•${yearRoman}`;

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const numericDate = `${month}-${day}-${year}`;

    return (
        <LinearGradient colors={['#5d4037', '#795548', '#8d6e63']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5d4037" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🏛️</Text>
                    <Text style={styles.title}>Your Birthday in</Text>
                    <Text style={styles.titleBold}>Roman Numerals</Text>
                </View>

                {/* Original Date */}
                <View style={styles.dateCard}>
                    <Text style={styles.dateLabel}>Your Birthday</Text>
                    <Text style={styles.dateValue}>{formattedDate}</Text>
                    <Text style={styles.dateNumeric}>{numericDate}</Text>
                </View>

                {/* Roman Numeral Display */}
                <View style={styles.romanCard}>
                    <Text style={styles.romanFull}>{fullRoman}</Text>
                </View>

                {/* Breakdown */}
                <View style={styles.breakdownSection}>
                    <Text style={styles.sectionTitle}>Breakdown</Text>

                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownItem}>
                            <Text style={styles.breakdownLabel}>Month</Text>
                            <Text style={styles.breakdownNumber}>{month}</Text>
                            <Text style={styles.breakdownArrow}>↓</Text>
                            <Text style={styles.breakdownRoman}>{monthRoman}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <Text style={styles.breakdownLabel}>Day</Text>
                            <Text style={styles.breakdownNumber}>{day}</Text>
                            <Text style={styles.breakdownArrow}>↓</Text>
                            <Text style={styles.breakdownRoman}>{dayRoman}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <Text style={styles.breakdownLabel}>Year</Text>
                            <Text style={styles.breakdownNumber}>{year}</Text>
                            <Text style={styles.breakdownArrow}>↓</Text>
                            <Text style={styles.breakdownRoman}>{yearRoman}</Text>
                        </View>
                    </View>
                </View>

                {/* Roman Numeral Guide */}
                <View style={styles.guideSection}>
                    <Text style={styles.sectionTitle}>Roman Numeral Guide</Text>

                    <View style={styles.guideGrid}>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>I</Text>
                            <Text style={styles.guideNum}>= 1</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>V</Text>
                            <Text style={styles.guideNum}>= 5</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>X</Text>
                            <Text style={styles.guideNum}>= 10</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>L</Text>
                            <Text style={styles.guideNum}>= 50</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>C</Text>
                            <Text style={styles.guideNum}>= 100</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>D</Text>
                            <Text style={styles.guideNum}>= 500</Text>
                        </View>
                        <View style={styles.guideItem}>
                            <Text style={styles.guideRoman}>M</Text>
                            <Text style={styles.guideNum}>= 1000</Text>
                        </View>
                    </View>

                    <Text style={styles.guideNote}>
                        Roman numerals are written by adding symbols together (VI = 6) or
                        subtracting when a smaller symbol appears before a larger one (IV = 4).
                    </Text>
                </View>

                {/* Fun Uses */}
                <View style={styles.usesSection}>
                    <Text style={styles.sectionTitle}>Fun Uses for Your Date</Text>

                    <View style={styles.useItem}>
                        <Text style={styles.useEmoji}>💍</Text>
                        <Text style={styles.useText}>Engrave on wedding rings or jewelry</Text>
                    </View>
                    <View style={styles.useItem}>
                        <Text style={styles.useEmoji}>🎨</Text>
                        <Text style={styles.useText}>Tattoo design inspiration</Text>
                    </View>
                    <View style={styles.useItem}>
                        <Text style={styles.useEmoji}>🏠</Text>
                        <Text style={styles.useText}>Home décor or wall art</Text>
                    </View>
                    <View style={styles.useItem}>
                        <Text style={styles.useEmoji}>📸</Text>
                        <Text style={styles.useText}>Photo captions and announcements</Text>
                    </View>
                    <View style={styles.useItem}>
                        <Text style={styles.useEmoji}>🎂</Text>
                        <Text style={styles.useText}>Birthday cake decorations</Text>
                    </View>
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
        fontSize: 22,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    titleBold: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    dateCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#5d4037',
    },
    dateNumeric: {
        fontSize: 16,
        color: '#8d6e63',
        marginTop: 4,
    },
    romanCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    romanFull: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5d4037',
        letterSpacing: 3,
        textAlign: 'center',
    },
    breakdownSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5d4037',
        marginBottom: 16,
        textAlign: 'center',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    breakdownItem: {
        alignItems: 'center',
        flex: 1,
    },
    breakdownLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    breakdownNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#666',
    },
    breakdownArrow: {
        fontSize: 18,
        color: '#ccc',
        marginVertical: 4,
    },
    breakdownRoman: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5d4037',
    },
    guideSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    guideGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },
    guideItem: {
        backgroundColor: '#f5f0eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    guideRoman: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5d4037',
    },
    guideNum: {
        fontSize: 16,
        color: '#8d6e63',
    },
    guideNote: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    usesSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    useItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    useEmoji: {
        fontSize: 24,
    },
    useText: {
        fontSize: 15,
        color: '#555',
        flex: 1,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
