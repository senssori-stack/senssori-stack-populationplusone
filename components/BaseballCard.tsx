import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const US_FLAG_IMAGE = require('../assets/images/us-flag.png');
const AMERICA250_WHITE = require('../assets/images/america250-white.png');

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
    nameGold?: boolean;
    forceFullSize?: boolean;
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
    backgroundColor = '#000080',
    nameGold = false,
    forceFullSize = false,
}: BaseballCardProps) {
    const { width } = useWindowDimensions();

    // Standard trading card: 2.5" x 3.5" at 300 DPI = 750 x 1050 pixels
    // Hi-res multiplier for download: 3× → 2250 x 3150 pixels
    const baseDocWidth = 750;
    const baseDocHeight = 1050;
    const hiRes = forceFullSize ? 3 : 1;
    const fixedDocWidth = baseDocWidth * hiRes;
    const fixedDocHeight = baseDocHeight * hiRes;
    const scale = forceFullSize ? 1 : Math.min((width * 0.85) / baseDocWidth, 1);
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.048;

    // Proportional spacing — keeps preview & hi-res download visually identical
    const sp = (px: number) => displayWidth * (px / 750);

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
                    <View style={{ position: 'absolute', left: sp(23), top: 0, bottom: 0, justifyContent: 'center' }}>
                        <Image source={US_FLAG_IMAGE} style={{ width: displayWidth * 0.084, height: displayWidth * 0.049, resizeMode: 'contain' }} />
                    </View>
                    <Text style={[styles.teamName, { fontSize: baseFontSize * 0.9, letterSpacing: sp(5) }]}>
                        ⭐ POPULATION +1™ ⭐
                    </Text>
                    <View style={{ position: 'absolute', right: sp(23), top: 0, bottom: 0, justifyContent: 'center' }}>
                        <Image source={AMERICA250_WHITE} style={{ width: displayWidth * 0.084, height: displayWidth * 0.049, resizeMode: 'contain' }} />
                    </View>
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
                                    borderWidth: sp(7),
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
                                    borderWidth: sp(7),
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
                <View style={[styles.namePlate, { backgroundColor, paddingVertical: displayHeight * 0.015, paddingHorizontal: sp(18) }]}>
                    <Text style={[styles.playerName, { fontSize: baseFontSize * 1.3, letterSpacing: sp(5) }, nameGold && { color: '#FFD700', textShadowColor: '#B8860B', textShadowOffset: { width: sp(2), height: sp(2) }, textShadowRadius: sp(7) }]}>
                        {babyName.toUpperCase()}
                    </Text>
                </View>

                {/* Stats section */}
                <View style={[styles.statsSection, { paddingHorizontal: displayWidth * 0.05, paddingVertical: sp(9) }]}>
                    <Text style={[styles.statsHeader, { fontSize: baseFontSize * 0.7, letterSpacing: sp(5), marginBottom: sp(9) }]}>
                        ROOKIE STATS
                    </Text>

                    <View style={[styles.statsGrid, { gap: sp(5) }]}>
                        {/* Row 1 */}
                        <View style={styles.statRow}>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>DEBUT</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthDate || '—'}</Text>
                            </View>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>TIME</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthTime || '—'}</Text>
                            </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.statRow}>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>WEIGHT</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{weight || '—'}</Text>
                            </View>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>LENGTH</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{length || '—'}</Text>
                            </View>
                        </View>

                        {/* Row 3 - Mystical stats */}
                        <View style={styles.statRow}>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>SIGN</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{zodiacSign || '—'}</Text>
                            </View>
                            <View style={[styles.statItem, { paddingVertical: sp(5) }]}>
                                <Text style={[styles.statLabel, { fontSize: baseFontSize * 0.55, letterSpacing: sp(2) }]}>STONE</Text>
                                <Text style={[styles.statValue, { fontSize: baseFontSize * 0.7 }]}>{birthstone || '—'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Team Name */}
                    <View style={[styles.hometownSection, { marginTop: displayHeight * 0.01, borderTopWidth: sp(2), paddingTop: sp(9) }]}>
                        <Text style={[styles.hometownValue, { fontSize: baseFontSize * 0.65 }]}>
                            +1 TEAM {(lastName || babyName.split(' ').pop() || '').toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor, height: displayHeight * 0.04 }]}>
                    <Text style={[styles.footerText, { fontSize: baseFontSize * 0.45 }]}>
                        PopulationPlusOne.com • 🔢 #{lifePathNumber || '1'} Life Path
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
        color: '#000080',
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
        color: '#000080',
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
