import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WrittenInTheStars'>;

export default function WrittenInTheStarsScreen({ navigation }: Props) {
    const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [birthLocation, setBirthLocation] = useState('');
    const [showLocationInput, setShowLocationInput] = useState(false);

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const formattedTime = birthDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <LinearGradient colors={['#0d1b2a', '#1b2838', '#2c3e50']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>✨</Text>
                    <Text style={styles.mainTitle}>Written in the Stars</Text>
                    <Text style={styles.subtitle}>
                        Explore the cosmic blueprint of your birth — numerology, astrology, and the celestial map of your life.
                    </Text>
                </View>

                {/* Date / Time / Location Section */}
                <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>🎂 Enter Your Birthday:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>{formattedDate}</Text>
                    </TouchableOpacity>

                    <Text style={styles.dateLabel}>🕐 Birth Time (for Rising sign accuracy):</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>{formattedTime}</Text>
                    </TouchableOpacity>

                    <Text style={styles.dateLabel}>📍 Birth City (for house placements):</Text>
                    {showLocationInput ? (
                        <TextInput
                            style={styles.locationInput}
                            value={birthLocation}
                            onChangeText={setBirthLocation}
                            placeholder="e.g. New York, Chicago, Los Angeles"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            onBlur={() => setShowLocationInput(false)}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowLocationInput(true)}
                        >
                            <Text style={[styles.dateButtonText, !birthLocation && { opacity: 0.5 }]}>
                                {birthLocation || 'Tap to enter birth city'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {!birthLocation && (
                        <Text style={styles.accuracyNote}>
                            💡 Birth time and location are needed for accurate Rising sign, house placements, and horoscope readings.
                        </Text>
                    )}
                </View>

                {/* Feature Buttons */}
                <View style={styles.buttonSection}>
                    {/* Life Path Number */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('LifePathNumber', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Find Your Life Path Number</Text>
                        <Text style={styles.featureDesc}>Discover your numerology destiny</Text>
                    </TouchableOpacity>

                    {/* Numerology Numbers */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('LuckyNumbers', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Your Numerology Numbers</Text>
                        <Text style={styles.featureDesc}>Life Path, Birthday, &amp; Personal Year</Text>
                    </TouchableOpacity>

                    {/* Birthstone */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Birthstone', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>💎</Text>
                        <Text style={styles.featureTitle}>What is Your Birthstone?</Text>
                        <Text style={styles.featureDesc}>Discover your gem and its meaning</Text>
                    </TouchableOpacity>

                    {/* Zodiac Sign */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('ZodiacSign', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>⭐</Text>
                        <Text style={styles.featureTitle}>What is Your Zodiac Sign?</Text>
                        <Text style={styles.featureDesc}>Learn your astrological profile</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for Rising sign accuracy</Text>
                        )}
                    </TouchableOpacity>

                    {/* Daily Horoscope */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Horoscope', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🔮</Text>
                        <Text style={styles.featureTitle}>View Your Daily Horoscope</Text>
                        <Text style={styles.featureDesc}>Real-time planetary transits to your chart</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for accurate results</Text>
                        )}
                    </TouchableOpacity>

                    {/* Full Natal Chart */}
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('FullAstrology', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🌌</Text>
                        <Text style={styles.featureTitle}>Full Natal Chart</Text>
                        <Text style={styles.featureDesc}>Your complete astrological birth chart &amp; solar system</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for best results</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Bottom spacer */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Date Picker Modal */}
            <ScrollableDatePicker
                visible={showDatePicker}
                date={birthDate}
                onDateChange={(d) => {
                    const updated = new Date(d);
                    updated.setHours(birthDate.getHours(), birthDate.getMinutes());
                    setBirthDate(updated);
                }}
                onClose={() => setShowDatePicker(false)}
                title="Select Birth Date"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
            />

            {/* Time Picker Modal */}
            <ScrollableDatePicker
                visible={showTimePicker}
                date={birthDate}
                onDateChange={(d) => {
                    const updated = new Date(birthDate);
                    updated.setHours(d.getHours(), d.getMinutes());
                    setBirthDate(updated);
                }}
                onClose={() => setShowTimePicker(false)}
                title="Select Birth Time"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
            />
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
        marginBottom: 24,
    },
    headerEmoji: {
        fontSize: 56,
        marginBottom: 8,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    dateSection: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        marginTop: 8,
    },
    dateButton: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    dateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    locationInput: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.5)',
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    accuracyNote: {
        fontSize: 12,
        color: 'rgba(255,215,0,0.8)',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    buttonSection: {
        gap: 12,
    },
    featureButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    featureEmoji: {
        fontSize: 28,
        marginBottom: 6,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    recommendNotice: {
        fontSize: 11,
        color: 'rgba(255,215,0,0.8)',
        marginTop: 6,
        fontStyle: 'italic',
    },
});
