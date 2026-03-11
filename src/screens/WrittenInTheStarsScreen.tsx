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
        <LinearGradient colors={['#000060', '#1b2838', '#2c3e50']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000060" />

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

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 1: YOUR CORE PROFILE                   */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>🌟</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Your Core Profile</Text>
                        <Text style={styles.sectionSubtitle}>The essentials — start here</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
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

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Birthstone', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>💎</Text>
                        <Text style={styles.featureTitle}>What is Your Birthstone?</Text>
                        <Text style={styles.featureDesc}>Discover your gem and its meaning</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('LifePathNumber', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Find Your Life Path Number</Text>
                        <Text style={styles.featureDesc}>Discover your numerology destiny</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('LuckyNumbers', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Your Numerology Numbers</Text>
                        <Text style={styles.featureDesc}>Life Path, Birthday, &amp; Personal Year</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 2: DAILY & LIVE GUIDANCE                */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>🔮</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Daily &amp; Live Guidance</Text>
                        <Text style={styles.sectionSubtitle}>Updates that change day to day</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('TipOfTheDay', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>💫</Text>
                        <Text style={styles.featureTitle}>Tip of the Day</Text>
                        <Text style={styles.featureDesc}>A daily astrology tip just for your sign</Text>
                    </TouchableOpacity>

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

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('RetrogradeTracker', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>☿</Text>
                        <Text style={styles.featureTitle}>Retrograde Tracker</Text>
                        <Text style={styles.featureDesc}>Current retrogrades, timelines &amp; survival tips</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 3: INTERACTIVE CHARTS & VISUALS        */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>🌌</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Interactive Charts &amp; Visuals</Text>
                        <Text style={styles.sectionSubtitle}>Deep, interactive explorations of the sky</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('FullAstrology', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🌌</Text>
                        <Text style={styles.featureTitle}>Full Interactive Natal Chart</Text>
                        <Text style={styles.featureDesc}>Your complete astrological birth chart &amp; solar system</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for best results</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('SkyWheels', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🎡</Text>
                        <Text style={styles.featureTitle}>Sky Wheels</Text>
                        <Text style={styles.featureDesc}>Interactive solar, zodiac, moon &amp; ancient cosmology wheels</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for best results</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('BirthSunPosition', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>☀️</Text>
                        <Text style={styles.featureTitle}>Interactive Birth Sun Position</Text>
                        <Text style={styles.featureDesc}>Where the Sun was on the ecliptic the day you were born</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('BirthMoonPhase', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🌙</Text>
                        <Text style={styles.featureTitle}>Interactive Birth Moon Phase</Text>
                        <Text style={styles.featureDesc}>What the moon looked like the night you were born</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Astrocartography', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🌍</Text>
                        <Text style={styles.featureTitle}>Astrocartography</Text>
                        <Text style={styles.featureDesc}>Your birth chart mapped onto the globe — discover where your stars shine brightest</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 4: COSMIC IDENTITY                     */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>🐾</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Cosmic Identity</Text>
                        <Text style={styles.sectionSubtitle}>Personality, archetypes &amp; spiritual layers</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('ChineseZodiac', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🐉</Text>
                        <Text style={styles.featureTitle}>Chinese Zodiac</Text>
                        <Text style={styles.featureDesc}>Your animal sign, element, yin/yang &amp; compatibility</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('SpiritAnimal', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🐾</Text>
                        <Text style={styles.featureTitle}>Spirit Animal</Text>
                        <Text style={styles.featureDesc}>Discover your zodiac spirit animal &amp; its wisdom</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Chakra', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🧘</Text>
                        <Text style={styles.featureTitle}>Chakra Profile</Text>
                        <Text style={styles.featureDesc}>Your zodiac chakra alignment &amp; healing guide</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Element', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🔥</Text>
                        <Text style={styles.featureTitle}>Your Element</Text>
                        <Text style={styles.featureDesc}>Fire, Earth, Air, or Water — deep dive into your element</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('TarotBirthCard', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🃏</Text>
                        <Text style={styles.featureTitle}>Tarot Birth Card</Text>
                        <Text style={styles.featureDesc}>Your soul &amp; personality tarot cards revealed</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 5: RELATIONSHIPS & LIFE PLANNING       */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>💕</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Relationships &amp; Life Planning</Text>
                        <Text style={styles.sectionSubtitle}>Compatibility, timing &amp; big decisions</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('ZodiacCompatibility', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>💕</Text>
                        <Text style={styles.featureTitle}>Zodiac Compatibility</Text>
                        <Text style={styles.featureDesc}>Check your cosmic connection with any sign</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('FriendCompatibility', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>👫</Text>
                        <Text style={styles.featureTitle}>Friend Compatibility (Interactive)</Text>
                        <Text style={styles.featureDesc}>Add friends &amp; rank who you're most compatible with</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('WeddingDatePlanner', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>💍</Text>
                        <Text style={styles.featureTitle}>Wedding Date Planner</Text>
                        <Text style={styles.featureDesc}>Find the best day to marry using synastry &amp; electional astrology</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('LifeEventsTiming', {
                            birthDate: birthDate.toISOString(),
                            birthTime: formattedTime,
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>📋</Text>
                        <Text style={styles.featureTitle}>Life Events Timed by the Stars</Text>
                        <Text style={styles.featureDesc}>When to buy a home, start a business, travel &amp; more</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 6: LEARN MORE                          */}
                {/* ═══════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEmoji}>📚</Text>
                    <View>
                        <Text style={styles.sectionTitle}>Learn More</Text>
                        <Text style={styles.sectionSubtitle}>Background, history &amp; the science</Text>
                    </View>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('AstrologyEducation')}
                    >
                        <Text style={styles.featureEmoji}>📚</Text>
                        <Text style={styles.featureTitle}>Understanding Astrology</Text>
                        <Text style={styles.featureDesc}>History, science, the 13th sign &amp; what it all means</Text>
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
                mode="time"
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
        gap: 7,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 18,
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionEmoji: {
        fontSize: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },
    sectionSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 1,
    },
    featureButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 11,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    featureEmoji: {
        fontSize: 17,
        marginBottom: 4,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    recommendNotice: {
        fontSize: 11,
        color: 'rgba(255,215,0,0.8)',
        marginTop: 6,
        fontStyle: 'italic',
    },
});
