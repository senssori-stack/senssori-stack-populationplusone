import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DaysAlive'>;

// ─── Life Expectancy Data (WHO / CDC 2024 estimates, US) ──────
const LIFE_EXPECTANCY = {
    male: {
        years: 74.8,
        label: 'Male',
        emoji: '👨',
        color: '#4FC3F7',
    },
    female: {
        years: 80.2,
        label: 'Female',
        emoji: '👩',
        color: '#F48FB1',
    },
    overall: {
        years: 77.5,
        label: 'Overall (US Average)',
        emoji: '🌍',
        color: '#FFD54F',
    },
};

// ─── Global life expectancy by region ─────────────────────────
const GLOBAL_EXPECTANCY = [
    { region: 'Japan', emoji: '🇯🇵', male: 81.5, female: 87.7 },
    { region: 'Switzerland', emoji: '🇨🇭', male: 81.9, female: 85.6 },
    { region: 'Australia', emoji: '🇦🇺', male: 81.3, female: 85.4 },
    { region: 'Canada', emoji: '🇨🇦', male: 79.9, female: 84.1 },
    { region: 'United Kingdom', emoji: '🇬🇧', male: 79.0, female: 82.9 },
    { region: 'United States', emoji: '🇺🇸', male: 74.8, female: 80.2 },
    { region: 'Mexico', emoji: '🇲🇽', male: 72.1, female: 77.8 },
    { region: 'Brazil', emoji: '🇧🇷', male: 72.0, female: 79.4 },
    { region: 'India', emoji: '🇮🇳', male: 68.7, female: 71.2 },
    { region: 'Nigeria', emoji: '🇳🇬', male: 52.7, female: 54.7 },
    { region: 'World Average', emoji: '🌐', male: 70.8, female: 75.9 },
];

function formatNumber(n: number): string {
    return n.toLocaleString();
}

export default function DaysAliveScreen({ route, navigation }: Props) {
    const { birthDate } = route.params;
    const birth = useMemo(() => new Date(birthDate), [birthDate]);
    const now = new Date();

    // ── Core calculations ─────────────────────
    const stats = useMemo(() => {
        const diffMs = now.getTime() - birth.getTime();
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const totalSeconds = Math.floor(diffMs / 1000);
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

        // Age breakdown
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) {
            months -= 1;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        // Hearts beat (~72 bpm avg)
        const heartbeats = totalMinutes * 72;
        // Breaths (~16/min avg)
        const breaths = totalMinutes * 16;

        return {
            totalDays,
            totalHours,
            totalMinutes,
            totalSeconds,
            totalWeeks,
            totalMonths,
            years,
            months,
            days,
            heartbeats,
            breaths,
        };
    }, [birth]);

    // ── Life expectancy stats ─────────────────
    const lifeExpStats = useMemo(() => {
        return Object.entries(LIFE_EXPECTANCY).map(([key, data]) => {
            const expectedDays = Math.round(data.years * 365.25);
            const daysRemaining = expectedDays - stats.totalDays;
            const percentLived = Math.min((stats.totalDays / expectedDays) * 100, 100);
            return {
                key,
                ...data,
                expectedDays,
                daysRemaining: Math.max(daysRemaining, 0),
                yearsRemaining: Math.max(daysRemaining / 365.25, 0).toFixed(1),
                percentLived: percentLived.toFixed(1),
            };
        });
    }, [stats.totalDays]);

    // ── Next milestone ────────────────────────
    const nextMilestone = useMemo(() => {
        const milestones = [1000, 2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000, 25000, 30000, 35000, 40000];
        const next = milestones.find(m => m > stats.totalDays);
        if (!next) return null;
        const daysUntil = next - stats.totalDays;
        const milestoneDate = new Date(now);
        milestoneDate.setDate(milestoneDate.getDate() + daysUntil);
        return { days: next, daysUntil, date: milestoneDate };
    }, [stats.totalDays]);

    return (
        <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEmoji}>⏳</Text>
                    <Text style={styles.heroTitle}>Your Life in Numbers</Text>
                    <Text style={styles.heroBirthDate}>
                        Born: {birth.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Big number: Days Alive */}
                <View style={styles.bigNumberCard}>
                    <Text style={styles.bigNumberLabel}>You Have Been Alive For</Text>
                    <Text style={styles.bigNumber}>{formatNumber(stats.totalDays)}</Text>
                    <Text style={styles.bigNumberUnit}>DAYS</Text>
                    <Text style={styles.ageText}>
                        That's {stats.years} years, {stats.months} month{stats.months !== 1 ? 's' : ''}, and {stats.days} day{stats.days !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Fun Stats Grid */}
                <Text style={styles.sectionTitle}>📊 Your Life Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>📅</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.totalWeeks)}</Text>
                        <Text style={styles.statLabel}>Weeks</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>📆</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.totalMonths)}</Text>
                        <Text style={styles.statLabel}>Months</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>⏰</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.totalHours)}</Text>
                        <Text style={styles.statLabel}>Hours</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>⏱️</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.totalMinutes)}</Text>
                        <Text style={styles.statLabel}>Minutes</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>❤️</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.heartbeats)}</Text>
                        <Text style={styles.statLabel}>Heartbeats</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>🌬️</Text>
                        <Text style={styles.statValue}>{formatNumber(stats.breaths)}</Text>
                        <Text style={styles.statLabel}>Breaths</Text>
                    </View>
                </View>

                {/* Next Milestone */}
                {nextMilestone && (
                    <View style={styles.milestoneCard}>
                        <Text style={styles.milestoneTitle}>🎯 Next Milestone</Text>
                        <Text style={styles.milestoneNumber}>Day {formatNumber(nextMilestone.days)}</Text>
                        <Text style={styles.milestoneDetail}>
                            {formatNumber(nextMilestone.daysUntil)} days away — {nextMilestone.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </View>
                )}

                {/* Life Expectancy Section */}
                <Text style={styles.sectionTitle}>📈 Life Expectancy (United States)</Text>
                <Text style={styles.sectionSubtitle}>Based on CDC / WHO 2024 estimates</Text>

                {lifeExpStats.map((item) => (
                    <View key={item.key} style={styles.expectancyCard}>
                        <View style={styles.expectancyHeader}>
                            <Text style={styles.expectancyEmoji}>{item.emoji}</Text>
                            <View style={styles.expectancyHeaderText}>
                                <Text style={styles.expectancyLabel}>{item.label}</Text>
                                <Text style={styles.expectancyYears}>{item.years} years</Text>
                            </View>
                            <Text style={styles.expectancyDays}>{formatNumber(item.expectedDays)} days</Text>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${Math.min(parseFloat(item.percentLived), 100)}%`,
                                        backgroundColor: item.color,
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressPercent}>{item.percentLived}% lived</Text>
                            {parseFloat(item.percentLived) < 100 && (
                                <Text style={styles.progressRemaining}>
                                    ~{item.yearsRemaining} yrs / {formatNumber(item.daysRemaining)} days remaining
                                </Text>
                            )}
                        </View>
                    </View>
                ))}

                {/* Global Comparison */}
                <Text style={styles.sectionTitle}>🌍 Life Expectancy Around the World</Text>
                <Text style={styles.sectionSubtitle}>Average life expectancy by country (years)</Text>

                <View style={styles.globalTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Country</Text>
                        <Text style={styles.tableHeaderCell}>Male</Text>
                        <Text style={styles.tableHeaderCell}>Female</Text>
                        <Text style={styles.tableHeaderCell}>Days (Avg)</Text>
                    </View>
                    {GLOBAL_EXPECTANCY.map((row, i) => {
                        const avgYears = (row.male + row.female) / 2;
                        const avgDays = Math.round(avgYears * 365.25);
                        const isUS = row.region === 'United States';
                        return (
                            <View key={row.region} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven, isUS && styles.tableRowHighlight]}>
                                <Text style={[styles.tableCell, { flex: 2 }]}>
                                    {row.emoji} {row.region}
                                </Text>
                                <Text style={styles.tableCell}>{row.male}</Text>
                                <Text style={styles.tableCell}>{row.female}</Text>
                                <Text style={[styles.tableCell, styles.tableCellDays]}>{formatNumber(avgDays)}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerText}>
                        ⚠️ Life expectancy data is based on population-level statistical averages from the WHO and CDC.
                        Individual life expectancy varies greatly based on genetics, lifestyle, healthcare access, and many other factors.
                        These numbers are for informational and entertainment purposes only.
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

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    // Hero
    heroSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    heroEmoji: {
        fontSize: 50,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    heroBirthDate: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 6,
        textAlign: 'center',
    },
    // Big number
    bigNumberCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    bigNumberLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    bigNumber: {
        fontSize: 56,
        fontWeight: '900',
        color: '#FFD700',
        letterSpacing: 2,
    },
    bigNumberUnit: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFD700',
        letterSpacing: 4,
        marginTop: 2,
    },
    ageText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    // Section
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
        marginTop: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 14,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        width: '31%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statEmoji: {
        fontSize: 22,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFD700',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        marginTop: 2,
    },
    // Milestone
    milestoneCard: {
        backgroundColor: 'rgba(255,215,0,0.12)',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.25)',
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFD700',
        marginBottom: 6,
    },
    milestoneNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    milestoneDetail: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        textAlign: 'center',
    },
    // Expectancy cards
    expectancyCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    expectancyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    expectancyEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    expectancyHeaderText: {
        flex: 1,
    },
    expectancyLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    expectancyYears: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    expectancyDays: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFD700',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 8,
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
    },
    progressRemaining: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    // Global table
    globalTable: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,215,0,0.15)',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    tableHeaderCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: '800',
        color: '#FFD700',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    tableRowEven: {
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    tableRowHighlight: {
        backgroundColor: 'rgba(255,215,0,0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#FFD700',
    },
    tableCell: {
        flex: 1,
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontWeight: '600',
    },
    tableCellDays: {
        color: '#FFD700',
        fontWeight: '800',
    },
    // Disclaimer
    disclaimerBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    disclaimerText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.45)',
        lineHeight: 16,
        textAlign: 'center',
    },
    // Back
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    backText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
