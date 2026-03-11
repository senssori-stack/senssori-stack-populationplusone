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

type Props = NativeStackScreenProps<RootStackParamList, 'WeddingRSVP'>;

export default function WeddingRSVPScreen({ route, navigation }: Props) {
    const { weddingId } = route.params || {};

    const [weddingInfo, setWeddingInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guestName, setGuestName] = useState('');
    const [guestCount, setGuestCount] = useState('1');
    const [dietaryNotes, setDietaryNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [response, setResponse] = useState<'attending' | 'not-attending' | null>(null);

    useEffect(() => {
        loadWeddingInfo();
    }, [weddingId]);

    const loadWeddingInfo = async () => {
        try {
            if (!db || !weddingId) {
                setLoading(false);
                return;
            }
            const weddingDoc = await getDoc(doc(db, 'weddings', weddingId));
            if (weddingDoc.exists()) {
                setWeddingInfo(weddingDoc.data());
            }
        } catch (error) {
            console.error('Error loading wedding info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (attending: boolean) => {
        if (!guestName.trim()) {
            Alert.alert('Name Required', 'Please enter your name so the couple knows who is responding.');
            return;
        }

        setResponse(attending ? 'attending' : 'not-attending');

        try {
            if (db && weddingId) {
                const rsvpRef = doc(collection(db, 'weddings', weddingId, 'rsvps'), guestName.trim().toLowerCase().replace(/\s+/g, '-'));
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

    const coupleName = weddingInfo?.coupleName || 'The Happy Couple';
    const weddingDate = weddingInfo?.weddingDate || '';
    const venue = weddingInfo?.venue || '';

    if (loading) {
        return (
            <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Loading wedding details...</Text>
                </View>
            </LinearGradient>
        );
    }

    // After submission - show confirmation
    if (submitted) {
        return (
            <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.centered}>
                    <Text style={styles.emoji}>{response === 'attending' ? '🎉' : '💝'}</Text>
                    <Text style={styles.thankYouTitle}>
                        {response === 'attending' ? 'We Can\'t Wait to See You!' : 'Thank You for Letting Us Know!'}
                    </Text>
                    <Text style={styles.thankYouMessage}>
                        {response === 'attending'
                            ? `Thank you, ${guestName}! Your RSVP for ${parseInt(guestCount) || 1} guest${(parseInt(guestCount) || 1) > 1 ? 's' : ''} has been recorded. See you at the celebration!`
                            : `We'll miss you, ${guestName}! Your response has been recorded. The couple appreciates you taking the time to respond.`
                        }
                    </Text>

                    {response === 'not-attending' && (
                        <View style={styles.giftSection}>
                            <Text style={styles.giftTitle}>💝 Send Your Love with a Gift</Text>
                            <Text style={styles.giftSubtitle}>
                                Can't make it? You can still celebrate the couple with a thoughtful gift!
                            </Text>
                            <TouchableOpacity
                                style={styles.giftButton}
                                onPress={() => navigation.navigate('GiftSuggestions', { occasion: 'wedding' })}
                            >
                                <Text style={styles.giftButtonText}>🎁 Browse Wedding Gift Ideas</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Landing')}
                    >
                        <Text style={styles.backButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        );
    }

    // RSVP form
    return (
        <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Wedding Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>💒</Text>
                    <Text style={styles.headerTitle}>You're Invited!</Text>
                    <Text style={styles.coupleNameText}>{coupleName}</Text>
                    {weddingDate ? <Text style={styles.dateText}>{weddingDate}</Text> : null}
                    {venue ? <Text style={styles.venueText}>{venue}</Text> : null}
                </View>

                {/* RSVP Form */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>RSVP</Text>
                    <Text style={styles.formSubtitle}>Please let us know if you can attend</Text>

                    <Text style={styles.label}>Your Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={guestName}
                        onChangeText={setGuestName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Number of Guests</Text>
                    <View style={styles.guestCountRow}>
                        {['1', '2', '3', '4'].map(num => (
                            <TouchableOpacity
                                key={num}
                                style={[styles.countButton, guestCount === num && styles.countButtonSelected]}
                                onPress={() => setGuestCount(num)}
                            >
                                <Text style={[styles.countText, guestCount === num && styles.countTextSelected]}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Dietary Restrictions / Notes (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={dietaryNotes}
                        onChangeText={setDietaryNotes}
                        placeholder="Any dietary needs or special requests..."
                        placeholderTextColor="#999"
                        multiline
                    />

                    {/* RSVP Buttons */}
                    <View style={styles.rsvpButtons}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleRSVP(true)}
                        >
                            <Text style={styles.acceptButtonText}>✓ Joyfully Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.declineButton}
                            onPress={() => handleRSVP(false)}
                        >
                            <Text style={styles.declineButtonText}>✗ Respectfully Decline</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Powered By */}
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
        marginBottom: 8,
        fontStyle: 'italic',
    },
    coupleNameText: {
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 2,
    },
    venueText: {
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
        color: '#000080',
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
        backgroundColor: '#000080',
        borderColor: '#000080',
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
        backgroundColor: '#000080',
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
        borderColor: '#000080',
    },
    declineButtonText: {
        color: '#000080',
        fontSize: 18,
        fontWeight: '800',
    },
    // Thank you / confirmation styles
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
    },
    giftButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    giftButtonText: {
        color: '#000080',
        fontSize: 16,
        fontWeight: '800',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        width: '100%',
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
