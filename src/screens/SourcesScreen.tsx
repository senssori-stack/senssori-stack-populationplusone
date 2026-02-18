import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    CATEGORY_LABELS,
    DATA_SOURCES,
    HISTORICAL_SOURCES,
    type DataSource,
} from '../data/sources';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Sources'>;

function SourceCard({ source }: { source: DataSource }) {
    const openUrl = () => {
        if (source.url) {
            Linking.openURL(source.url);
        }
    };

    return (
        <View style={styles.sourceCard}>
            <Text style={styles.sourceField}>{source.field}</Text>
            <TouchableOpacity onPress={openUrl} disabled={!source.url}>
                <Text style={[styles.sourceProvider, source.url && styles.sourceLink]}>
                    {source.source}
                </Text>
            </TouchableOpacity>
            <Text style={styles.sourceFrequency}>Updated: {source.updateFrequency}</Text>
            {source.notes && (
                <Text style={styles.sourceNotes}>{source.notes}</Text>
            )}
        </View>
    );
}

function CategorySection({ category, sources }: { category: string; sources: DataSource[] }) {
    return (
        <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
                {CATEGORY_LABELS[category] || category}
            </Text>
            {sources.map((source, index) => (
                <SourceCard key={`${source.field}-${index}`} source={source} />
            ))}
        </View>
    );
}

export default function SourcesScreen({ navigation }: Props) {
    // Group sources by category
    const categories = [...new Set(DATA_SOURCES.map(s => s.category))];

    return (
        <LinearGradient colors={['#2d5016', '#3d6b1f']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d5016" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={styles.iconBox}>
                        <Text style={styles.iconText}>📚</Text>
                    </View>
                    <Text style={styles.title}>Data Sources</Text>
                    <Text style={styles.subtitle}>
                        All data in Population +1™ is sourced from official, verified sources.
                    </Text>
                </View>

                {/* Current Data Sources */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionHeader}>Current ("NOW") Data</Text>
                    <Text style={styles.sectionSubheader}>
                        Live data updated regularly from these sources:
                    </Text>

                    {categories.map(category => (
                        <CategorySection
                            key={category}
                            category={category}
                            sources={DATA_SOURCES.filter(s => s.category === category)}
                        />
                    ))}
                </View>

                {/* Historical Data Sources */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionHeader}>Historical ("THEN") Data</Text>
                    <Text style={styles.sectionSubheader}>
                        Historical records used for birth date snapshots:
                    </Text>

                    {HISTORICAL_SOURCES.map((source, index) => (
                        <SourceCard key={`hist-${index}`} source={source} />
                    ))}
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerSection}>
                    <Text style={styles.disclaimerTitle}>Data Accuracy</Text>
                    <Text style={styles.disclaimerText}>
                        We strive for 100% accuracy in all our data. Historical data is sourced
                        from official government records, reputable financial data providers,
                        and industry-standard entertainment tracking services.
                    </Text>
                    <Text style={styles.disclaimerText}>
                        Current market prices (gold, silver, stock indices) are updated multiple
                        times daily during market hours. Consumer prices reflect national averages
                        and may vary by location.
                    </Text>
                    <Text style={styles.disclaimerText}>
                        If you notice any data discrepancy, please contact us at{' '}
                        <Text style={styles.emailLink}>info@populationplusone.com</Text>
                    </Text>
                </View>

                {/* Back Button */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2d5016',
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
        width: 70,
        height: 70,
        backgroundColor: '#4a7c2c',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 12,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    contentSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        marginTop: 10,
    },
    sectionSubheader: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
    },
    categorySection: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#a8d08d',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sourceCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#a8d08d',
    },
    sourceField: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    sourceProvider: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    sourceLink: {
        color: '#a8d08d',
        textDecorationLine: 'underline',
    },
    sourceFrequency: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
    },
    sourceNotes: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    disclaimerSection: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    disclaimerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
    },
    disclaimerText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 20,
        marginBottom: 10,
    },
    emailLink: {
        color: '#a8d08d',
        textDecorationLine: 'underline',
    },
    buttonSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: '#4a7c2c',
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
