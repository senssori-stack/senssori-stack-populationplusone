import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../data/utils/firebase-config';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EventRSVP'>;

// Theme config per event type
const EVENT_THEMES: Record<string, { emoji: string; gradient: [string, string]; accent: string; label: string }> = {
    birthday: { emoji: '🎂', gradient: ['#7c3aed', '#a855f7'], accent: '#7c3aed', label: 'Birthday Party' },
    wedding: { emoji: '💒', gradient: ['#000080', '#1a1a9e'], accent: '#000080', label: 'Wedding' },
    'baby-shower': { emoji: '👶', gradient: ['#0d9488', '#14b8a6'], accent: '#0d9488', label: 'Welcome Party' },
    graduation: { emoji: '🎓', gradient: ['#b45309', '#d97706'], accent: '#b45309', label: 'Graduation Party' },
    anniversary: { emoji: '💍', gradient: ['#be185d', '#ec4899'], accent: '#be185d', label: 'Anniversary' },
    default: { emoji: '🎉', gradient: ['#000080', '#1a1a9e'], accent: '#000080', label: 'Celebration' },
};

export default function EventRSVPScreen({ route, navigation }: Props) {
    const { eventId } = route.params || {};

    const [eventInfo, setEventInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guestName, setGuestName] = useState('');
    const [guestCount, setGuestCount] = useState('1');
    const [dietaryNotes, setDietaryNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [response, setResponse] = useState<'attending' | 'not-attending' | null>(null);

    useEffect(() => {
        loadEventInfo();
    }, [eventId]);

    const loadEventInfo = async () => {
        try {
            if (!db || !eventId) {
                setLoading(false);
                return;
            }
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            if (eventDoc.exists()) {
                setEventInfo(eventDoc.data());
            }
        } catch (error) {
            console.error('Error loading event info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (attending: boolean) => {
        if (!guestName.trim()) {
            Alert.alert('Name Required', 'Please enter your name so the host knows who is responding.');
            return;
        }

        setResponse(attending ? 'attending' : 'not-attending');

        try {
            if (db && eventId) {
                const rsvpRef = doc(
                    collection(db, 'events', eventId, 'rsvps'),
                    guestName.trim().toLowerCase().replace(/\s+/g, '-')
                );
                await setDoc(rsvpRef, {
                    guestName: guestName.trim(),
                    attending,
                    guestCount: attending ? parseInt(guestCount) || 1 : 0,
                    dietaryNotes: attending ? dietaryNotes.trim() : '',
                    respondedAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error saving RSVP:', error);
        }

        setSubmitted(true);
    };

    const eventType = eventInfo?.eventType || 'default';
    const themeConfig = EVENT_THEMES[eventType] || EVENT_THEMES.default;
    const honoree = eventInfo?.honoree || 'Guest of Honor';
    const eventDate = eventInfo?.eventDate || '';
    const hostName = eventInfo?.hostName || '';

    if (loading) {
        return (
            <LinearGradient colors={themeConfig.gradient} style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Loading event details...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Not found
    if (!eventInfo) {
        return (
            <LinearGradient colors={['#374151', '#1f2937']} style={styles.container}>
                <View style={styles.centered}>
                    <Text style={{ fontSize: 60, marginBottom: 16 }}>🔍</Text>
                    <Text style={styles.thankYouTitle}>Event Not Found</Text>
                    <Text style={styles.thankYouMessage}>
                        This invitation link may have expired or is no longer valid.
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Landing')}>
                        <Text style={styles.backButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // After submission - show confirmation
    if (submitted) {
        const occasion = eventType === 'birthday' ? 'birthday' : eventType === 'wedding' ? 'wedding' : 'baby';
        return (
            <LinearGradient colors={themeConfig.gradient} style={styles.container}>
                <ScrollView contentContainerStyle={styles.centered}>
                    <Text style={styles.emoji}>{response === 'attending' ? '🎉' : '💝'}</Text>
                    <Text style={styles.thankYouTitle}>
                        {response === 'attending' ? 'See You There!' : 'Thanks for Letting Us Know!'}
                    </Text>
                    <Text style={styles.thankYouMessage}>
                        {response === 'attending'
                            ? `Thank you, ${guestName}! Your RSVP for ${parseInt(guestCount) || 1} guest${(parseInt(guestCount) || 1) > 1 ? 's' : ''} has been recorded. See you at the party!`
                            : `We'll miss you, ${guestName}! Your response has been recorded.`
                        }
                    </Text>

                    {response === 'not-attending' && (
                        <View style={styles.giftSection}>
                            <Text style={styles.giftTitle}>🎁 Send a Gift Instead?</Text>
                            <Text style={styles.giftSubtitle}>
                                Can't make it? You can still show {honoree} some love with a thoughtful gift!
                            </Text>
                            <TouchableOpacity
                                style={styles.giftButton}
                                onPress={() => navigation.navigate('GiftSuggestions', { occasion })}
                            >
                                <Text style={[styles.giftButtonText, { color: themeConfig.accent }]}>
                                    🎁 Browse Gift Ideas
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Landing')}>
                        <Text style={styles.backButtonText}>Done</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        );
    }

    // RSVP form
    return (
        <LinearGradient colors={themeConfig.gradient} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Event Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>{themeConfig.emoji}</Text>
                    <Text style={styles.headerTitle}>You're Invited!</Text>
                    <Text style={styles.subheaderText}>
                        {eventType === 'birthday' ? 'to celebrate the birthday of' :
                            eventType === 'wedding' ? 'to the wedding celebration of' :
                                eventType === 'graduation' ? 'to the graduation party of' :
                                    'to celebrate'}
                    </Text>
                    <Text style={styles.honoreeName}>{honoree}</Text>
                    {eventDate ? <Text style={styles.dateText}>{eventDate}</Text> : null}
                    {hostName ? <Text style={styles.hostText}>Hosted by {hostName}</Text> : null}
                </View>

                {/* RSVP Form */}
                <View style={styles.formCard}>
                    <Text style={[styles.formTitle, { color: themeConfig.accent }]}>RSVP</Text>
                    <Text style={styles.formSubtitle}>Let the host know if you can make it</Text>

                    <Text style={styles.label}>Your Name</Text>
                    <TextInput
                        style={styles.input}
                        value={guestName}
                        onChangeText={setGuestName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>How many are coming?</Text>
                    <View style={styles.guestCountRow}>
                        {['1', '2', '3', '4'].map(num => (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.countButton,
                                    guestCount === num && [styles.countButtonSelected, { backgroundColor: themeConfig.accent, borderColor: themeConfig.accent }]
                                ]}
                                onPress={() => setGuestCount(num)}
                            >
                                <Text style={[styles.countText, guestCount === num && styles.countTextSelected]}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Notes for the host (optional)</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={dietaryNotes}
                        onChangeText={setDietaryNotes}
                        placeholder="Allergies, dietary needs, anything else..."
                        placeholderTextColor="#999"
                        multiline
                    />

                    {/* RSVP Buttons */}
                    <View style={styles.rsvpButtons}>
                        <TouchableOpacity
                            style={[styles.acceptButton, { backgroundColor: themeConfig.accent }]}
                            onPress={() => handleRSVP(true)}
                        >
                            <Text style={styles.acceptButtonText}>🎉 I'll Be There!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.declineButton, { borderColor: themeConfig.accent }]}
                            onPress={() => handleRSVP(false)}
                        >
                            <Text style={[styles.declineButtonText, { color: themeConfig.accent }]}>Can't Make It</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.poweredBy}>Powered by PopulationPlusOne.com</Text>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    headerEmoji: {
        fontSize: 60,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    subheaderText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    honoreeName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 2,
    },
    hostText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginTop: 8,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginTop: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    guestCountRow: {
        flexDirection: 'row',
        gap: 10,
    },
    countButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    countButtonSelected: {
        // backgroundColor and borderColor set inline via themeConfig
    },
    countText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    countTextSelected: {
        color: '#fff',
    },
    rsvpButtons: {
        marginTop: 24,
        gap: 12,
    },
    acceptButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    declineButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    declineButtonText: {
        fontSize: 18,
        fontWeight: '800',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    thankYouTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    thankYouMessage: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    giftSection: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    giftTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    giftSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    giftButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    giftButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 30,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    poweredBy: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    },
});
