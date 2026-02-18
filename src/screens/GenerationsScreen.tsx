import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Generations'>;

const generations = [
    {
        name: 'The Greatest Generation',
        shortName: 'Greatest Generation',
        years: '1901 – 1927',
        startYear: 1901,
        endYear: 1927,
        emoji: '🎖️',
        description: 'Known for their "can-do" attitude and sense of duty.',
        definingEvents: 'The Great Depression and World War II.',
        legacy: 'They are credited with saving democracy and rebuilding the global economy post-war. They valued frugality, patriotism, and sacrifice.',
    },
    {
        name: 'The Silent Generation',
        shortName: 'Silent Generation',
        years: '1928 – 1945',
        startYear: 1928,
        endYear: 1945,
        emoji: '📻',
        description: 'A smaller cohort born during a time of economic hardship and war.',
        definingEvents: 'The Korean War and the McCarthy era.',
        legacy: 'Called "Silent" because they were raised to work hard and keep their heads down rather than protest. They were the bridge between the traditionalists and the upcoming social radicals.',
    },
    {
        name: 'Baby Boomers',
        shortName: 'Baby Boomer',
        years: '1946 – 1964',
        startYear: 1946,
        endYear: 1964,
        emoji: '🌙',
        description: 'The massive population "boom" following the return of soldiers from WWII.',
        definingEvents: 'The Civil Rights Movement, the Vietnam War, and the Moon Landing.',
        legacy: 'They oversaw a period of massive economic prosperity and social change. They are often characterized by their workaholism and their influence on the modern consumer economy.',
    },
    {
        name: 'Generation X',
        shortName: 'Gen X',
        years: '1965 – 1980',
        startYear: 1965,
        endYear: 1980,
        emoji: '🔑',
        description: 'Often called the "Latchkey Generation," they grew up as dual-income households became common.',
        definingEvents: 'The Fall of the Berlin Wall and the rise of personal computers.',
        legacy: 'Known for being skeptical, independent, and entrepreneurial. They are the "middle children" of generations, bridging the gap between the analog and digital worlds.',
    },
    {
        name: 'Millennials / Gen Y',
        shortName: 'Millennial',
        years: '1981 – 1996',
        startYear: 1981,
        endYear: 1996,
        emoji: '📱',
        description: 'The first generation to come of age in the new millennium.',
        definingEvents: 'The 9/11 attacks, the 2008 Great Recession, and the explosion of social media.',
        legacy: 'They prioritized "work-life balance" and social impact. They are the first "digital natives," having integrated the internet into their daily lives from a young age.',
    },
    {
        name: 'Generation Z',
        shortName: 'Gen Z',
        years: '1997 – 2012',
        startYear: 1997,
        endYear: 2012,
        emoji: '🌐',
        description: 'The most diverse and technologically fluent generation to date.',
        definingEvents: 'The COVID-19 pandemic, climate change activism, and the ubiquitous smartphone.',
        legacy: 'They are known for being socially conscious, comfortable with fluid identities, and highly skeptical of traditional corporate paths.',
    },
    {
        name: 'Generation Alpha',
        shortName: 'Gen Alpha',
        years: '2013 – Mid-2020s',
        startYear: 2013,
        endYear: 2026,
        emoji: '🤖',
        description: 'The children of Millennials.',
        definingEvents: 'Remote learning, AI integration (like ChatGPT), and the post-pandemic world.',
        legacy: 'Still being defined, but they are expected to be the most technologically immersed generation in history.',
    },
];

function getGeneration(birthYear: number) {
    for (const gen of generations) {
        if (birthYear >= gen.startYear && birthYear <= gen.endYear) {
            return gen;
        }
    }
    // Before Greatest Generation
    if (birthYear >= 1883 && birthYear <= 1900) {
        return {
            name: 'The Lost Generation',
            shortName: 'Lost Generation',
            years: '1883 – 1900',
            startYear: 1883,
            endYear: 1900,
            emoji: '⚔️',
            description: 'The young adults who fought in World War I.',
            definingEvents: 'World War I and the aftermath of the "Great War."',
            legacy: 'The term was popularized by Ernest Hemingway and Gertrude Stein to describe the sense of disillusionment and lack of direction felt by survivors.',
        };
    }
    return null;
}

const comparisonData = [
    { generation: 'Greatest/Silent', environment: 'Hardship & Discipline', communication: 'Formal Letters / Face-to-Face' },
    { generation: 'Boomers', environment: 'Post-war Prosperity', communication: 'Telephone' },
    { generation: 'Gen X', environment: 'Shifting Values', communication: 'Email / SMS' },
    { generation: 'Millennials', environment: 'Digital Revolution', communication: 'Social Media / IM' },
    { generation: 'Gen Z', environment: 'Always Connected', communication: 'Video / Short-form Media' },
];

export default function GenerationsScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const birthYear = birthDate.getFullYear();
    const userGeneration = getGeneration(birthYear);

    return (
        <LinearGradient colors={['#4a5568', '#2d3748']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4a5568" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Your Generation Banner */}
                {userGeneration && (
                    <View style={styles.yourGenBanner}>
                        <Text style={styles.yourGenEmoji}>{userGeneration.emoji}</Text>
                        <Text style={styles.yourGenLabel}>You are a</Text>
                        <Text style={styles.yourGenName}>{userGeneration.shortName}!</Text>
                        <Text style={styles.yourGenYears}>Born in {birthYear} ({userGeneration.years})</Text>
                    </View>
                )}

                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>The Living Generations</Text>
                    <Text style={styles.subtitle}>Oldest to Youngest</Text>
                </View>

                {/* Generation Cards */}
                <View style={styles.contentSection}>
                    {generations.map((gen, index) => {
                        const isUserGen = userGeneration && gen.name === userGeneration.name;
                        return (
                            <View key={index} style={[styles.card, isUserGen && styles.cardHighlighted]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.genEmoji}>{gen.emoji}</Text>
                                    <View style={styles.cardHeaderText}>
                                        <Text style={styles.cardTitle}>{gen.name}</Text>
                                        <Text style={styles.cardYears}>{gen.years}</Text>
                                    </View>
                                    {isUserGen && <Text style={styles.youBadge}>👈 YOU</Text>}
                                </View>
                                <Text style={styles.cardDescription}>{gen.description}</Text>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Defining Events:</Text>
                                    <Text style={styles.detailText}>{gen.definingEvents}</Text>
                                </View>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Legacy:</Text>
                                    <Text style={styles.detailText}>{gen.legacy}</Text>
                                </View>
                            </View>
                        );
                    })}

                    {/* Comparison Table */}
                    <View style={styles.card}>
                        <Text style={styles.tableTitle}>Comparison at a Glance</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.tableCol1]}>Generation</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCol2]}>Environment</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCol3]}>Communication</Text>
                        </View>
                        {comparisonData.map((row, index) => (
                            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                                <Text style={[styles.tableCell, styles.tableCol1]}>{row.generation}</Text>
                                <Text style={[styles.tableCell, styles.tableCol2]}>{row.environment}</Text>
                                <Text style={[styles.tableCell, styles.tableCol3]}>{row.communication}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Lost Generation Note */}
                    <View style={[styles.card, styles.noteCard]}>
                        <Text style={styles.noteTitle}>A Note on "The Lost Generation"</Text>
                        <Text style={styles.noteText}>
                            Before the Greatest Generation, there was the Lost Generation (1883–1900).
                            They were the young adults who fought in World War I. The term was popularized
                            by Ernest Hemingway and Gertrude Stein to describe the sense of disillusionment
                            and lack of direction felt by survivors of the "Great War."
                        </Text>
                    </View>
                </View>

                {/* Back Button */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>← Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4a5568',
    },
    scrollView: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#5a6778',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 16,
    },
    iconEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#e2e8f0',
        marginTop: 4,
    },
    contentSection: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    genEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d3748',
    },
    cardYears: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 14,
        color: '#4a5568',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 20,
    },
    detailSection: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 2,
    },
    detailText: {
        fontSize: 13,
        color: '#4a5568',
        lineHeight: 19,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 12,
        textAlign: 'center',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4a5568',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 6,
    },
    tableHeaderCell: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    tableCol1: {
        flex: 1.2,
    },
    tableCol2: {
        flex: 1.3,
    },
    tableCol3: {
        flex: 1.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableRowAlt: {
        backgroundColor: '#f7fafc',
    },
    tableCell: {
        fontSize: 11,
        color: '#4a5568',
    },
    noteCard: {
        backgroundColor: '#fefcbf',
        borderLeftWidth: 4,
        borderLeftColor: '#d69e2e',
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#744210',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 13,
        color: '#744210',
        lineHeight: 20,
    },
    buttonSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4a5568',
    },
    yourGenBanner: {
        backgroundColor: '#48bb78',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    yourGenEmoji: {
        fontSize: 50,
        marginBottom: 8,
    },
    yourGenLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    yourGenName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
    },
    yourGenYears: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    cardHighlighted: {
        borderWidth: 3,
        borderColor: '#48bb78',
        backgroundColor: '#f0fff4',
    },
    youBadge: {
        fontSize: 14,
        fontWeight: '700',
        color: '#48bb78',
        marginLeft: 8,
    },
});
