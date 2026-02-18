import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface BaseballCardProps {
    babyName: string;
    birthDate?: string;
    birthTime?: string;
    weight?: string;
    length?: string;
    city: string;
    state: string;
    zodiacSign?: string;
    birthstone?: string;
    lifePathNumber?: string;
    photoUri?: string;
    backgroundColor?: string;
}

/**
 * BaseballCard Component - Trading card style (2.5×3.5")
 * Classic sports card design featuring baby "stats"
 * Perfect for sharing, collecting, and keepsakes
 */
export default function BaseballCard({
    babyName,
    birthDate = '',
    birthTime = '',
    weight = '',
    length = '',
    city,
    state,
    zodiacSign = '',
    birthstone = '',
    lifePathNumber = '',
    photoUri,
    backgroundColor = '#1a472a',
}: BaseballCardProps) {
    const { width } = useWindowDimensions();

    // Standard trading card: 2.5" x 3.5" at 300 DPI = 750 x 1050 pixels
    const fixedDocWidth = 750;
    const fixedDocHeight = 1050;
    const scale = Math.min((width * 0.85) / fixedDocWidth, 1);
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.048;

    // Extract first name for the "card name"
    const firstName = babyName.split(' ')[0] || babyName;
    const lastName = babyName.split(' ').slice(1).join(' ') || '';

    return (
        <View
            style={[
                styles.container,
                {
                    width: displayWidth,
                    height: displayHeight,
                    borderRadius: displayWidth * 0.04,
                },
            ]}
        >
            {/* Card border with gold trim */}
            <View style={[styles.cardBorder, { borderWidth: displayWidth * 0.015 }]}>
                {/* Header - Team name style */}
                <View style={[styles.header, { backgroundColor, height: displayHeight * 0.08 }]}>
                    <Text style={[styles.teamName, { fontSize: baseFontSize * 0.9 }]}>
                        ⭐ POPULATION +1™ ⭐
                    </Text>
                </View>

                {/* Photo section */}
                <View style={[styles.photoSection, { height: displayHeight * 0.45 }]}>
                    {photoUri ? (
                        <Image
                            source={{ uri: photoUri }}
                            style={[
                                styles.photo,
                                {
                                    width: displayWidth * 0.75,
                                    height: displayHeight * 0.40,
                                    borderRadius: displayWidth * 0.02,
                                },
                            ]}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.photoPlaceholder,
                                {
                                    width: displayWidth * 0.75,
                                    height: displayHeight * 0.40,
                                    borderRadius: displayWidth * 0.02,
                                },
                            ]}
                        >
                            <Text style={[styles.photoPlaceholderText, { fontSize: baseFontSize * 2 }]}>
                                👶
                            </Text>
                        </View>
                    )}
                </View>

                {/* Name plate */}
                <View style={[styles.namePlate, { backgroundColor, paddingVertical: displayHeight * 0.015 }]}>
                    <Text style={[styles.playerName, { fontSize: baseFontSize * 1.3 }]}>
                        {firstName.toUpperCase()}
                    </Text>
                    {lastName && (
                        <Text style={[styles.lastName, { fontSize: baseFontSize * 0.8 }]}>
                            {lastName.toUpperCase()}
                        </Text>
                    )}
                </View>

                {/* Stats section */}
                <View style={[styles.statsSection, { paddingHorizontal: displayWidth * 0.05 }]}>
                    <Text style={[styles.statsHeader, { fontSize: baseFontSize * 0.7 }]}>
                        ROOKIE STATS
                    </Text>

                    <View style={styles.statsGrid}>
                        {/* Row 1 */}
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>DEBUT</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthDate || '—'}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>TIME</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthTime || '—'}</Text>
                            </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>WEIGHT</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{weight || '—'}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>LENGTH</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{length || '—'}</Text>
                            </View>
                        </View>

                        {/* Row 3 - Mystical stats */}
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>SIGN</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{zodiacSign || '—'}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55 }]}>STONE</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthstone || '—'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Team Name */}
                    <View style={[styles.hometownSection, { marginTop: displayHeight * 0.01 }]}>
                        <Text style={[styles.hometownLabel, { fontSize: baseFontSize * 0.5 }]}>TEAM</Text>
                        <Text style={[styles.hometownValue, { fontSize: baseFontSize * 0.65 }]}>
                            {(lastName || babyName.split(' ').pop() || 'BABY').toUpperCase()} FAMILY
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor, height: displayHeight * 0.04 }]}>
                    <Text style={[styles.footerText, { fontSize: baseFontSize * 0.45 }]}>
                        PopulationPlusOne.com • #{lifePathNumber || '1'} Life Path
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardBorder: {
        flex: 1,
        borderColor: '#DAA520', // Gold border
        overflow: 'hidden',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamName: {
        color: '#FFD700',
        fontWeight: '900',
        letterSpacing: 2,
    },
    photoSection: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        borderWidth: 3,
        borderColor: '#DAA520',
    },
    photoPlaceholder: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#DAA520',
    },
    photoPlaceholderText: {
        color: '#888',
    },
    namePlate: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    playerName: {
        color: '#fff',
        fontWeight: '900',
        letterSpacing: 2,
    },
    lastName: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '700',
        letterSpacing: 1,
    },
    statsSection: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 4,
    },
    statsHeader: {
        color: '#333',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 4,
    },
    statsGrid: {
        gap: 2,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 2,
    },
    statLabel: {
        color: '#666',
        fontWeight: '700',
        letterSpacing: 1,
    },
    statValue: {
        color: '#1a472a',
        fontWeight: '800',
    },
    hometownSection: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 4,
    },
    hometownLabel: {
        color: '#666',
        fontWeight: '700',
        letterSpacing: 1,
    },
    hometownValue: {
        color: '#1a472a',
        fontWeight: '800',
    },
    footer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
});
