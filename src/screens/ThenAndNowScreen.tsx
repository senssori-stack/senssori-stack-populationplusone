import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ThenAndNow'>;

const { width: screenWidth } = Dimensions.get('window');

// Then and Now comparison - uses live snapshot data for "now" values
function getThenAndNow(birthYear: number, snapshot: Record<string, string>): { category: string; then: string; now: string; emoji: string }[] {
    // Historical data by decade (for "then" values)
    const historicalData: Record<string, Record<number, string>> = {
        'gas': { 1950: '$0.27', 1960: '$0.31', 1970: '$0.36', 1980: '$1.19', 1990: '$1.15', 2000: '$1.51', 2010: '$2.79', 2020: '$2.17' },
        'minwage': { 1950: '$0.75', 1960: '$1.00', 1970: '$1.60', 1980: '$3.10', 1990: '$3.80', 2000: '$5.15', 2010: '$7.25', 2020: '$7.25' },
        'bread': { 1950: '$0.14', 1960: '$0.20', 1970: '$0.24', 1980: '$0.50', 1990: '$0.70', 2000: '$0.99', 2010: '$1.98', 2020: '$2.50' },
        'eggs': { 1950: '$0.60', 1960: '$0.57', 1970: '$0.61', 1980: '$0.84', 1990: '$1.00', 2000: '$0.96', 2010: '$1.79', 2020: '$1.48' },
        'milk': { 1950: '$0.83', 1960: '$0.95', 1970: '$1.15', 1980: '$1.60', 1990: '$2.15', 2000: '$2.78', 2010: '$3.32', 2020: '$3.54' },
        'gold': { 1950: '$35', 1960: '$35', 1970: '$38', 1980: '$615', 1990: '$386', 2000: '$279', 2010: '$1,225', 2020: '$1,770' },
        'silver': { 1950: '$0.74', 1960: '$0.91', 1970: '$1.63', 1980: '$16.39', 1990: '$4.83', 2000: '$4.95', 2010: '$20.19', 2020: '$20.55' },
        'dow': { 1950: '235', 1960: '616', 1970: '839', 1980: '964', 1990: '2,753', 2000: '10,787', 2010: '11,578', 2020: '30,606' },
        'uspop': { 1950: '151M', 1960: '180M', 1970: '205M', 1980: '227M', 1990: '250M', 2000: '282M', 2010: '309M', 2020: '331M' },
        'worldpop': { 1950: '2.5B', 1960: '3.0B', 1970: '3.7B', 1980: '4.4B', 1990: '5.3B', 2000: '6.1B', 2010: '6.9B', 2020: '7.8B' },
        'president': { 1950: 'Harry Truman', 1960: 'Dwight Eisenhower', 1970: 'Richard Nixon', 1980: 'Jimmy Carter', 1990: 'George H.W. Bush', 2000: 'Bill Clinton', 2010: 'Barack Obama', 2020: 'Donald Trump' },
    };

    // Map categories to snapshot keys for "now" values (LIVE from Google Sheets)
    const nowFromSnapshot: Record<string, string> = {
        'gas': snapshot['GALLON OF GASOLINE'] || '$3.15',
        'minwage': snapshot['MINIMUM WAGE'] || '$7.25',
        'bread': snapshot['LOAF OF BREAD'] || '$2.50',
        'eggs': snapshot['DOZEN EGGS'] || '$3.75',
        'milk': snapshot['GALLON OF MILK'] || '$3.89',
        'gold': snapshot['GOLD OZ'] || 'Loading...',
        'silver': snapshot['SILVER OZ'] || 'Loading...',
        'dow': snapshot['DOW JONES CLOSE'] || '43,250',
        'uspop': snapshot['US POPULATION'] || '340M',
        'worldpop': snapshot['WORLD POPULATION'] || '8.2B',
        'president': snapshot['PRESIDENT'] || 'Donald Trump',
    };

    const getData = (category: string): { then: string; now: string } => {
        const categoryData = historicalData[category] || {};
        const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
        let thenValue = categoryData[2020] || 'N/A';

        for (const decade of decades) {
            if (birthYear <= decade + 9) {
                thenValue = categoryData[decade] || thenValue;
                break;
            }
        }

        return { then: thenValue, now: nowFromSnapshot[category] || 'N/A' };
    };

    const comparisons = [
        { category: 'Gas (Gallon)', emoji: '⛽', ...getData('gas') },
        { category: 'Minimum Wage', emoji: '💵', ...getData('minwage') },
        { category: 'Loaf of Bread', emoji: '🍞', ...getData('bread') },
        { category: 'Dozen Eggs', emoji: '🥚', ...getData('eggs') },
        { category: 'Milk (Gallon)', emoji: '🥛', ...getData('milk') },
        { category: 'Gold (oz)', emoji: '🪙', ...getData('gold') },
        { category: 'Silver (oz)', emoji: '💍', ...getData('silver') },
        { category: 'Dow Jones', emoji: '📈', ...getData('dow') },
        { category: 'US Population', emoji: '🇺🇸', ...getData('uspop') },
        { category: 'World Population', emoji: '🌍', ...getData('worldpop') },
        { category: 'President', emoji: '🏛️', ...getData('president') },
    ];

    return comparisons;
}

export default function ThenAndNowScreen({ navigation, route }: Props) {
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const birthDate = new Date(route.params.birthDate);
    const birthYear = birthDate.getFullYear();

    // Fetch live snapshot from Google Sheets
    useEffect(() => {
        (async () => {
            try {
                const data = await getAllSnapshotValues();
                console.log('📊 ThenAndNow: Gold from Sheet =', data['GOLD OZ'], 'Silver =', data['SILVER OZ']);
                setSnapshot(data);
            } catch (error) {
                console.warn('⚠️ ThenAndNow: Failed to fetch snapshot:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const comparisons = getThenAndNow(birthYear, snapshot);

    const formattedBirthDate = birthDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (loading) {
        return (
            <LinearGradient colors={['#1a5f2a', '#2d8a3e', '#3cb371']} style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1a5f2a" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 12 }}>Loading current prices...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#1a5f2a', '#2d8a3e', '#3cb371']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a5f2a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>⏰</Text>
                    <Text style={styles.title}>Then & Now</Text>
                    <Text style={styles.subtitle}>Time Capsule</Text>
                    <View style={styles.birthDateBadge}>
                        <Text style={styles.birthDateText}>Born: {formattedBirthDate}</Text>
                    </View>
                    <Text style={styles.explainer}>
                        See how prices and facts have changed from when you were born to today!
                    </Text>
                </View>

                {/* Comparison Cards */}
                <View style={styles.cardsContainer}>
                    {comparisons.map((item, idx) => (
                        <View key={idx} style={styles.comparisonCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                                <Text style={styles.cardTitle}>{item.category}</Text>
                            </View>
                            <View style={styles.comparisonRow}>
                                <View style={styles.valueColumn}>
                                    <Text style={styles.columnLabel}>THEN</Text>
                                    <Text style={styles.columnYear}>{birthYear}</Text>
                                    <Text style={styles.thenValue}>{item.then}</Text>
                                </View>
                                <View style={styles.arrowContainer}>
                                    <Text style={styles.arrow}>→</Text>
                                </View>
                                <View style={[styles.valueColumn, styles.nowColumn]}>
                                    <Text style={styles.columnLabel}>NOW</Text>
                                    <Text style={styles.columnYear}>2026</Text>
                                    <Text style={styles.nowValue}>{item.now}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerText}>
                        *Minimum wage shown is federal rate ($7.25). Your actual rate may be higher based on state or local laws.
                    </Text>
                    <Text style={styles.disclaimerText}>
                        Values are approximate and based on historical averages for the decade of your birth.
                    </Text>
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back</Text>
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
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    birthDateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
    },
    birthDateText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    explainer: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    cardsContainer: {
        marginTop: 20,
    },
    comparisonCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 8,
    },
    cardEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a5f2a',
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    valueColumn: {
        flex: 1,
        alignItems: 'center',
    },
    nowColumn: {
        alignItems: 'center',
    },
    columnLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        letterSpacing: 1,
    },
    columnYear: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    thenValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d8a3e',
    },
    nowValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a5f2a',
    },
    arrowContainer: {
        paddingHorizontal: 12,
    },
    arrow: {
        fontSize: 24,
        color: '#ccc',
    },
    disclaimerBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    disclaimerText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 4,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 40,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
