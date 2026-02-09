import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getCityCoordinates } from '../data/utils/town-coordinates';
import {
    calculateTransitAspects,
    getMoonPhase,
    getRetrogradePlanets,
    getSignificantTransits,
    getTransitDuration,
    Transit
} from '../data/utils/transit-calculator';
import {
    getTransitInterpretation
} from '../data/utils/transit-interpretations';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Horoscope'>;

export default function HoroscopeScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const [birthTime, setBirthTime] = useState(route.params.birthTime || '12:00');
    const [birthLocation, setBirthLocation] = useState(route.params.birthLocation || '');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Get coordinates
    const coordinates = useMemo(() => {
        if (birthLocation) {
            const coords = getCityCoordinates(birthLocation);
            if (coords) return { lat: coords.lat, lng: coords.lng, found: true };
        }
        return { lat: 40.7128, lng: -74.0060, found: false };
    }, [birthLocation]);

    // Parse birth time
    const [hours, minutes] = birthTime.split(':').map(Number);
    const adjustedBirthDate = useMemo(() => {
        const d = new Date(birthDate);
        d.setHours(hours || 12, minutes || 0, 0, 0);
        return d;
    }, [birthDate, hours, minutes]);

    // Calculate natal chart
    const natalChart = useMemo(() => {
        return calculateNatalChart(adjustedBirthDate, coordinates.lat, coordinates.lng);
    }, [adjustedBirthDate, coordinates]);

    // Calculate today's transits
    const allTransits = useMemo(() => {
        return calculateTransitAspects(natalChart, new Date());
    }, [natalChart]);

    // Get most significant transits
    const significantTransits = useMemo(() => {
        return getSignificantTransits(allTransits, 6);
    }, [allTransits]);

    // Moon phase
    const moonPhase = useMemo(() => getMoonPhase(new Date()), []);

    // Retrograde planets
    const retrogrades = useMemo(() => getRetrogradePlanets(new Date()), []);

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'exact': return '#ff5722';
            case 'strong': return '#ff9800';
            case 'moderate': return '#ffc107';
            case 'weak': return '#8bc34a';
            default: return '#9e9e9e';
        }
    };

    const getAspectColor = (influence: string) => {
        switch (influence) {
            case 'harmonious': return '#4caf50';
            case 'challenging': return '#f44336';
            default: return '#2196f3';
        }
    };

    const renderTransitCard = (transit: Transit, index: number) => {
        const interpretation = getTransitInterpretation(
            transit.transitingPlanet,
            transit.natalPlanet,
            transit.aspectType.name
        );
        const duration = getTransitDuration(transit.transitingPlanet);

        return (
            <View key={index} style={styles.transitCard}>
                <View style={styles.transitHeader}>
                    <View style={[styles.intensityDot, { backgroundColor: getIntensityColor(transit.intensity) }]} />
                    <Text style={styles.transitTitle}>
                        {transit.transitingPlanet} {transit.aspectType.symbol} {transit.natalPlanet}
                    </Text>
                    <View style={[styles.aspectBadge, { backgroundColor: getAspectColor(transit.aspectType.influence) }]}>
                        <Text style={styles.aspectBadgeText}>{transit.aspectType.name}</Text>
                    </View>
                </View>

                <View style={styles.transitDetails}>
                    <Text style={styles.transitOrb}>
                        {transit.exactOrb < 1 ? '✨ Nearly Exact' : `${transit.exactOrb.toFixed(1)}° orb`}
                    </Text>
                    <Text style={styles.transitDuration}>⏱ {duration}</Text>
                </View>

                {interpretation && (
                    <View style={styles.interpretationBox}>
                        <Text style={styles.interpretationTitle}>{interpretation.title}</Text>
                        <Text style={styles.interpretationText}>{interpretation.meaning}</Text>
                        <Text style={styles.interpretationAdvice}>💡 {interpretation.advice}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <LinearGradient colors={['#1a237e', '#311b92', '#4527a0']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🌟</Text>
                    <Text style={styles.title}>Your Daily Horoscope</Text>
                    <Text style={styles.subtitle}>{today}</Text>
                    <Text style={styles.explainerText}>
                        Your horoscope is a personalized cosmic forecast based on where the planets are TODAY compared to where they were at YOUR exact moment of birth. It's like a weather report for your life — showing which areas may feel energized, challenged, or calm.
                    </Text>
                </View>

                {/* Birth Data Summary */}
                <View style={styles.birthDataCard}>
                    <TouchableOpacity style={styles.birthDataItem} onPress={() => setShowTimeModal(true)}>
                        <Text style={styles.birthDataLabel}>🕐 Birth Time</Text>
                        <Text style={styles.birthDataValue}>{birthTime}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.birthDataItem} onPress={() => setShowLocationModal(true)}>
                        <Text style={styles.birthDataLabel}>📍 Location</Text>
                        <Text style={styles.birthDataValue}>{birthLocation || 'Not Set'}</Text>
                    </TouchableOpacity>
                    {!coordinates.found && (
                        <Text style={styles.accuracyNote}>⚠️ Using default location. Set your birth city for accurate readings.</Text>
                    )}
                </View>

                {/* Moon Phase */}
                <View style={styles.moonCard}>
                    <Text style={styles.moonEmoji}>{moonPhase.emoji}</Text>
                    <Text style={styles.moonPhase}>{moonPhase.phase}</Text>
                    <Text style={styles.moonDesc}>{moonPhase.description}</Text>
                </View>

                {/* Retrograde Planets */}
                {retrogrades.length > 0 && (
                    <View style={styles.retrogradeCard}>
                        <Text style={styles.retrogradeTitle}>⟲ Planets in Retrograde</Text>
                        <View style={styles.retrogradeList}>
                            {retrogrades.map(p => (
                                <View key={p.name} style={styles.retrogradePill}>
                                    <Text style={styles.retrogradeName}>{p.name} Rx</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.retrogradeNote}>
                            Retrograde planets suggest areas where you may need to review, revisit, or redo things.
                        </Text>
                    </View>
                )}

                {/* Today's Transits */}
                <View style={styles.transitsSection}>
                    <Text style={styles.sectionTitle}>🔮 Your Transits Today</Text>
                    <Text style={styles.sectionExplainer}>
                        These are the current planetary influences affecting YOUR specific birth chart right now.
                    </Text>

                    {significantTransits.length > 0 ? (
                        significantTransits.map((transit, i) => renderTransitCard(transit, i))
                    ) : (
                        <View style={styles.noTransitsCard}>
                            <Text style={styles.noTransitsText}>
                                No major exact transits today. A good day for routine activities.
                            </Text>
                        </View>
                    )}
                </View>

                {/* How to Read This */}
                <View style={styles.educationCard}>
                    <Text style={styles.educationTitle}>📚 Understanding Your Transits</Text>
                    <Text style={styles.educationText}>
                        <Text style={{ fontWeight: 'bold' }}>Intensity Legend:</Text>{'\n'}
                        🔴 Exact = Very powerful, happening now{'\n'}
                        🟠 Strong = Significant influence{'\n'}
                        🟡 Moderate = Noticeable effect{'\n'}
                        🟢 Weak = Subtle background energy{'\n\n'}
                        <Text style={{ fontWeight: 'bold' }}>Aspect Types:</Text>{'\n'}
                        <Text style={{ color: '#4caf50' }}>● Harmonious</Text> = Easy, flowing, lucky{'\n'}
                        <Text style={{ color: '#f44336' }}>● Challenging</Text> = Tension, growth through effort{'\n'}
                        <Text style={{ color: '#2196f3' }}>● Neutral</Text> = Powerful, depends on how you use it
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

            {/* Time Modal */}
            <Modal visible={showTimeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🕐 Birth Time</Text>
                        <Text style={styles.modalHint}>Format: HH:MM (24-hour)</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={birthTime}
                            onChangeText={setBirthTime}
                            placeholder="12:00"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowTimeModal(false)}>
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Location Modal */}
            <Modal visible={showLocationModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📍 Birth Location</Text>
                        <Text style={styles.modalHint}>Enter city and state (e.g., "Chicago, IL")</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={birthLocation}
                            onChangeText={setBirthLocation}
                            placeholder="City, State"
                            autoCapitalize="words"
                        />
                        {birthLocation && (
                            <Text style={coordinates.found ? styles.coordsFound : styles.coordsNotFound}>
                                {coordinates.found ? '✓ Location found' : '✗ City not found'}
                            </Text>
                        )}
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowLocationModal(false)}>
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        marginTop: 10,
        marginBottom: 20,
    },
    emoji: {
        fontSize: 50,
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    explainerText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
        paddingHorizontal: 8,
        fontStyle: 'italic',
    },
    birthDataCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    birthDataItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    birthDataLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    birthDataValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    accuracyNote: {
        fontSize: 11,
        color: '#ffd54f',
        textAlign: 'center',
        marginTop: 8,
    },
    moonCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    moonEmoji: {
        fontSize: 50,
    },
    moonPhase: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    moonDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginTop: 4,
    },
    retrogradeCard: {
        backgroundColor: 'rgba(244,67,54,0.2)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(244,67,54,0.4)',
    },
    retrogradeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffcdd2',
        marginBottom: 8,
    },
    retrogradeList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    retrogradePill: {
        backgroundColor: 'rgba(244,67,54,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    retrogradeName: {
        fontSize: 13,
        color: '#ffcdd2',
        fontWeight: '600',
    },
    retrogradeNote: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 10,
        fontStyle: 'italic',
    },
    transitsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionExplainer: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 16,
    },
    transitCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    transitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    intensityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    transitTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a237e',
        flex: 1,
    },
    aspectBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    aspectBadgeText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    transitDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    transitOrb: {
        fontSize: 12,
        color: '#666',
    },
    transitDuration: {
        fontSize: 12,
        color: '#666',
    },
    interpretationBox: {
        backgroundColor: '#f5f0ff',
        borderRadius: 10,
        padding: 12,
    },
    interpretationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4527a0',
        marginBottom: 6,
    },
    interpretationText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    interpretationAdvice: {
        fontSize: 13,
        color: '#1a237e',
        fontWeight: '500',
        fontStyle: 'italic',
    },
    noTransitsCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    noTransitsText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    educationCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    educationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffd54f',
        marginBottom: 10,
    },
    educationText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 8,
    },
    modalHint: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 2,
        borderColor: '#1a237e',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: 'center',
        width: '80%',
        marginBottom: 12,
    },
    coordsFound: {
        fontSize: 13,
        color: '#4caf50',
        marginBottom: 8,
    },
    coordsNotFound: {
        fontSize: 13,
        color: '#f44336',
        marginBottom: 8,
    },
    modalButton: {
        backgroundColor: '#1a237e',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
