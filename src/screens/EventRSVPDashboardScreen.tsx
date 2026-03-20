import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../data/utils/firebase-config';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EventRSVPDashboard'>;

type RSVPEntry = {
    id: string;
    guestName: string;
    attending: boolean;
    guestCount: number;
    dietaryNotes: string;
    respondedAt: any;
};

// Theme config per event type
const EVENT_THEMES: Record<string, { emoji: string; gradient: [string, string]; title: string }> = {
    birthday: { emoji: '🎂', gradient: ['#7c3aed', '#a855f7'], title: 'Birthday RSVP Dashboard' },
    wedding: { emoji: '💒', gradient: ['#000080', '#1a1a9e'], title: 'Wedding RSVP Dashboard' },
    'baby-shower': { emoji: '👶', gradient: ['#0d9488', '#14b8a6'], title: 'Party RSVP Dashboard' },
    graduation: { emoji: '🎓', gradient: ['#b45309', '#d97706'], title: 'Graduation RSVP Dashboard' },
    default: { emoji: '🎉', gradient: ['#000080', '#1a1a9e'], title: 'RSVP Dashboard' },
};

export default function EventRSVPDashboardScreen({ route, navigation }: Props) {
    const { eventId, eventName, eventType: eventTypeProp } = route.params || {};

    const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!db || !eventId) {
            setLoading(false);
            return;
        }

        // Real-time listener for RSVPs
        const rsvpRef = collection(db, 'events', eventId, 'rsvps');
        const unsubscribe = onSnapshot(rsvpRef, (snapshot) => {
            const entries: RSVPEntry[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
            })) as RSVPEntry[];
            entries.sort((a, b) => (a.guestName || '').localeCompare(b.guestName || ''));
            setRsvps(entries);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to RSVPs:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    const handleDeleteRSVP = (entry: RSVPEntry) => {
        Alert.alert(
            'Remove RSVP',
            `Remove ${entry.guestName}'s response?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive', onPress: async () => {
                        try {
                            if (db && eventId) {
                                await deleteDoc(doc(db, 'events', eventId, 'rsvps', entry.id));
                            }
                        } catch (error) {
                            console.error('Error deleting RSVP:', error);
                        }
                    }
                },
            ]
        );
    };

    const attending = rsvps.filter(r => r.attending);
    const declined = rsvps.filter(r => !r.attending);
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

    const rsvpLink = `https://populationplusone.com/rsvp/${eventId}`;
    const eventType = eventTypeProp || 'default';
    const themeConfig = EVENT_THEMES[eventType] || EVENT_THEMES.default;

    const handleCopyLink = async () => {
        try {
            await Share.share({ message: rsvpLink });
        } catch {
            // User cancelled
        }
    };

    const handleShareLink = async () => {
        try {
            await Share.share({
                message: `You're invited! RSVP here: ${rsvpLink}`,
                url: rsvpLink,
            });
        } catch {
            // User cancelled
        }
    };

    return (
        <LinearGradient colors={themeConfig.gradient} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <Text style={styles.title}>{themeConfig.emoji} {themeConfig.title}</Text>
                <Text style={styles.subtitle}>{eventName || 'Your Event'}</Text>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{rsvps.length}</Text>
                        <Text style={styles.statLabel}>Responses</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#1b5e20' }]}>
                        <Text style={styles.statNumber}>{attending.length}</Text>
                        <Text style={styles.statLabel}>Attending</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#b71c1c' }]}>
                        <Text style={styles.statNumber}>{declined.length}</Text>
                        <Text style={styles.statLabel}>Declined</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#4a148c' }]}>
                        <Text style={styles.statNumber}>{totalGuests}</Text>
                        <Text style={styles.statLabel}>Total Guests</Text>
                    </View>
                </View>

                {/* Share Section */}
                <View style={styles.linkCard}>
                    <Text style={styles.linkTitle}>📎 Share RSVP Link</Text>
                    <Text style={styles.linkText} numberOfLines={2}>{rsvpLink}</Text>
                    <Text style={styles.linkHint}>
                        This link is on your postcard's QR code. Share it via text, social media, or mail the postcard!
                    </Text>
                    <View style={styles.shareButtons}>
                        <TouchableOpacity style={styles.shareBtn} onPress={handleCopyLink}>
                            <Text style={styles.shareBtnText}>📋 Copy Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={handleShareLink}>
                            <Text style={styles.shareBtnText}>📤 Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Attending List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Attending ({attending.length})</Text>
                    {attending.length === 0 && (
                        <Text style={styles.emptyText}>No responses yet — share the link!</Text>
                    )}
                    {attending.map(entry => (
                        <TouchableOpacity
                            key={entry.id}
                            style={styles.rsvpCard}
                            onLongPress={() => handleDeleteRSVP(entry)}
                        >
                            <View style={styles.rsvpCardContent}>
                                <Text style={styles.guestName}>{entry.guestName}</Text>
                                <Text style={styles.guestCount}>{entry.guestCount} guest{entry.guestCount > 1 ? 's' : ''}</Text>
                            </View>
                            {entry.dietaryNotes ? (
                                <Text style={styles.dietaryNote}>📝 {entry.dietaryNotes}</Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Declined List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>❌ Can't Make It ({declined.length})</Text>
                    {declined.length === 0 && (
                        <Text style={styles.emptyText}>None yet</Text>
                    )}
                    {declined.map(entry => (
                        <TouchableOpacity
                            key={entry.id}
                            style={[styles.rsvpCard, styles.declinedCard]}
                            onLongPress={() => handleDeleteRSVP(entry)}
                        >
                            <Text style={styles.guestName}>{entry.guestName}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tip */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipText}>
                        💡 Guests respond by scanning the QR code on the postcard, or tapping the link if you share digitally. This dashboard updates in real time!
                    </Text>
                </View>

                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back to Postcard</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    linkCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    linkTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    linkText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        marginBottom: 6,
    },
    linkHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        fontStyle: 'italic',
        lineHeight: 16,
        marginBottom: 12,
    },
    shareButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    shareBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    shareBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
    },
    rsvpCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    declinedCard: {
        borderLeftColor: '#ef5350',
    },
    rsvpCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guestName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    guestCount: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    dietaryNote: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    tipCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
    },
    tipText: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
