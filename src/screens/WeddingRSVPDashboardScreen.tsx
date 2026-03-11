import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../data/utils/firebase-config';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WeddingRSVPDashboard'>;

type RSVPEntry = {
    id: string;
    guestName: string;
    attending: boolean;
    guestCount: number;
    dietaryNotes: string;
    respondedAt: any;
};

export default function WeddingRSVPDashboardScreen({ route, navigation }: Props) {
    const { weddingId, coupleName } = route.params || {};

    const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!db || !weddingId) {
            setLoading(false);
            return;
        }

        // Real-time listener for RSVPs
        const rsvpRef = collection(db, 'weddings', weddingId, 'rsvps');
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
    }, [weddingId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Snapshot listener auto-updates, just toggle refresh indicator
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    const handleDeleteRSVP = (entry: RSVPEntry) => {
        Alert.alert(
            'Remove RSVP',
            `Remove ${entry.guestName}'s RSVP?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove', style: 'destructive', onPress: async () => {
                        try {
                            if (db && weddingId) {
                                await deleteDoc(doc(db, 'weddings', weddingId, 'rsvps', entry.id));
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

    const rsvpLink = `https://populationplusone.com/rsvp/${weddingId}`;

    return (
        <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <Text style={styles.title}>💒 Wedding RSVP Dashboard</Text>
                <Text style={styles.subtitle}>{coupleName || 'Your Wedding'}</Text>

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

                {/* Share Link */}
                <View style={styles.linkCard}>
                    <Text style={styles.linkTitle}>📎 Share RSVP Link</Text>
                    <Text style={styles.linkText}>{rsvpLink}</Text>
                    <Text style={styles.linkHint}>This link is on your wedding postcards' QR code</Text>
                </View>

                {/* Attending List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Attending ({attending.length})</Text>
                    {attending.length === 0 && (
                        <Text style={styles.emptyText}>No responses yet</Text>
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
                    <Text style={styles.sectionTitle}>❌ Declined ({declined.length})</Text>
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

                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backBtnText}>← Back</Text>
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
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
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
        backgroundColor: '#000060',
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
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        marginBottom: 4,
    },
    linkHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
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
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    backBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
