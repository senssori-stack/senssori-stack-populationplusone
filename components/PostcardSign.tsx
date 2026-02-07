import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

interface PostcardSignProps {
    babyName: string;
    birthDate?: string;
    city: string;
    state: string;
    weight?: string;
    length?: string;
    parents?: string;
    photoUri?: string;
    backgroundColor?: string;
    message?: string;
}

/**
 * PostcardSign Component - 4×6" or 5×7" mailable postcard
 * Front: Photo and announcement
 * Designed for grandparents and family to mail as birth announcements
 */
export default function PostcardSign({
    babyName,
    birthDate = '',
    city,
    state,
    weight = '',
    length = '',
    parents = '',
    photoUri,
    backgroundColor = '#1a472a',
    message = '',
}: PostcardSignProps) {
    const { width } = useWindowDimensions();

    // Standard postcard: 4" x 6" at 300 DPI = 1200 x 1800 pixels (landscape)
    const fixedDocWidth = 1800;
    const fixedDocHeight = 1200;
    const scale = Math.min((width * 0.95) / fixedDocWidth, 1);
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.032;

    return (
        <View
            style={[
                styles.container,
                {
                    width: displayWidth,
                    height: displayHeight,
                    borderRadius: displayWidth * 0.015,
                },
            ]}
        >
            {/* Left side - Photo */}
            <View style={[styles.photoSide, { width: displayWidth * 0.5 }]}>
                {photoUri ? (
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.photo}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.photoPlaceholder, { backgroundColor }]}>
                        <Text style={[styles.placeholderEmoji, { fontSize: baseFontSize * 4 }]}>
                            👶
                        </Text>
                        <Text style={[styles.placeholderText, { fontSize: baseFontSize * 0.8 }]}>
                            Photo Here
                        </Text>
                    </View>
                )}

                {/* Photo overlay with name */}
                <View style={[styles.photoOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <Text style={[styles.overlayName, { fontSize: baseFontSize * 1.4 }]}>
                        {babyName}
                    </Text>
                </View>
            </View>

            {/* Right side - Details */}
            <View style={[styles.detailsSide, { width: displayWidth * 0.5, backgroundColor }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.welcomeText, { fontSize: baseFontSize * 0.9 }]}>
                        Introducing...
                    </Text>
                    <Text style={[styles.babyName, { fontSize: baseFontSize * 1.6 }]}>
                        {babyName.toUpperCase()}
                    </Text>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { gap: displayHeight * 0.02 }]}>
                    {birthDate && (
                        <View style={styles.statRow}>
                            <Text style={[styles.statEmoji, { fontSize: baseFontSize * 1.2 }]}>📅</Text>
                            <Text style={[styles.statText, { fontSize: baseFontSize * 0.85 }]}>{birthDate}</Text>
                        </View>
                    )}
                    {weight && (
                        <View style={styles.statRow}>
                            <Text style={[styles.statEmoji, { fontSize: baseFontSize * 1.2 }]}>⚖️</Text>
                            <Text style={[styles.statText, { fontSize: baseFontSize * 0.85 }]}>{weight}</Text>
                        </View>
                    )}
                    {length && (
                        <View style={styles.statRow}>
                            <Text style={[styles.statEmoji, { fontSize: baseFontSize * 1.2 }]}>📏</Text>
                            <Text style={[styles.statText, { fontSize: baseFontSize * 0.85 }]}>{length}</Text>
                        </View>
                    )}
                    <View style={styles.statRow}>
                        <Text style={[styles.statEmoji, { fontSize: baseFontSize * 1.2 }]}>📍</Text>
                        <Text style={[styles.statText, { fontSize: baseFontSize * 0.85 }]}>{city}, {state}</Text>
                    </View>
                </View>

                {/* Parents */}
                {parents && (
                    <View style={[styles.parentsSection, { marginTop: displayHeight * 0.03 }]}>
                        <Text style={[styles.parentsLabel, { fontSize: baseFontSize * 0.65 }]}>
                            Proud Parents
                        </Text>
                        <Text style={[styles.parentsText, { fontSize: baseFontSize * 0.8 }]}>
                            {parents}
                        </Text>
                    </View>
                )}

                {/* Population badge */}
                <View style={[styles.populationBadge, { marginTop: displayHeight * 0.04 }]}>
                    <View style={[styles.badge, { paddingVertical: displayHeight * 0.015, paddingHorizontal: displayWidth * 0.03 }]}>
                        <Text style={[styles.badgeLabel, { fontSize: baseFontSize * 0.6 }]}>
                            POPULATION
                        </Text>
                        <Text style={[styles.badgeValue, { fontSize: baseFontSize * 2.2 }]}>
                            +1
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { fontSize: baseFontSize * 0.5 }]}>
                        PopulationPlusOne.com
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    photoSide: {
        height: '100%',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        color: '#fff',
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    overlayName: {
        color: '#fff',
        fontWeight: '700',
        textAlign: 'center',
    },
    detailsSide: {
        height: '100%',
        padding: 16,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
    },
    babyName: {
        color: '#fff',
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        marginTop: 4,
    },
    statsContainer: {
        marginTop: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statEmoji: {
        width: 28,
        textAlign: 'center',
    },
    statText: {
        color: '#fff',
        fontWeight: '600',
    },
    parentsSection: {
        alignItems: 'center',
    },
    parentsLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    parentsText: {
        color: '#fff',
        fontWeight: '700',
        marginTop: 2,
    },
    populationBadge: {
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    badgeLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '700',
        letterSpacing: 2,
    },
    badgeValue: {
        color: '#FFD700',
        fontWeight: '900',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
    },
});
