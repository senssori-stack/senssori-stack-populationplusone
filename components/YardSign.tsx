import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

interface YardSignProps {
    babyName: string;
    city: string;
    state: string;
    birthDate?: string;
    weight?: string;
    length?: string;
    population?: string;
    photoUri?: string;
    backgroundColor?: string;
}

/**
 * YardSign Component - 18×24" or 24×36" corrugated plastic yard sign
 * Designed for outdoor display with large, readable text
 * Printed on weatherproof corrugated plastic with H-stake included
 */
export default function YardSign({
    babyName,
    city,
    state,
    birthDate = '',
    weight = '',
    length = '',
    population = '0',
    photoUri,
    backgroundColor = '#1a472a',
}: YardSignProps) {
    const { width } = useWindowDimensions();

    // Yard signs are typically 18×24" (portrait) at 150 DPI for outdoor viewing
    // 18" x 24" = 2700 x 3600 pixels at 150 DPI
    const fixedDocWidth = 2700;
    const fixedDocHeight = 3600;
    const scale = Math.min(width * 0.9 / fixedDocWidth, 1);
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.045;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                    width: displayWidth,
                    height: displayHeight,
                },
            ]}
        >
            {/* Outer border - bold for visibility at distance */}
            <View style={[styles.outerBorder, { borderWidth: displayWidth * 0.012 }]}>
                {/* Inner content area */}
                <View style={styles.content}>

                    {/* IT'S A... Banner */}
                    <View style={[styles.banner, { paddingVertical: displayHeight * 0.015 }]}>
                        <Text style={[styles.bannerText, { fontSize: baseFontSize * 1.2 }]}>
                            🎉 IT'S A BABY! 🎉
                        </Text>
                    </View>

                    {/* Welcome To script */}
                    <Text style={[styles.script, { fontSize: baseFontSize * 1.1, marginTop: displayHeight * 0.02 }]}>
                        Welcome To
                    </Text>

                    {/* City, State - LARGE for roadside visibility */}
                    <Text style={[styles.cityState, { fontSize: baseFontSize * 2.2 }]}>
                        {city.toUpperCase()}
                    </Text>
                    <Text style={[styles.stateText, { fontSize: baseFontSize * 1.4 }]}>
                        {state.toUpperCase()}
                    </Text>

                    {/* Population section */}
                    <View style={[styles.populationSection, { marginVertical: displayHeight * 0.025 }]}>
                        <Text style={[styles.populationLabel, { fontSize: baseFontSize * 1.0 }]}>
                            POPULATION
                        </Text>
                        <Text style={[styles.plusOne, { fontSize: baseFontSize * 4.5 }]}>
                            +1
                        </Text>
                    </View>

                    {/* Baby Photo - Large and centered */}
                    {photoUri ? (
                        <Image
                            source={{ uri: photoUri }}
                            style={[
                                styles.photo,
                                {
                                    width: displayWidth * 0.55,
                                    height: displayWidth * 0.55,
                                    borderRadius: displayWidth * 0.04,
                                    borderWidth: displayWidth * 0.008,
                                },
                            ]}
                        />
                    ) : (
                        <View
                            style={[
                                styles.photoPlaceholder,
                                {
                                    width: displayWidth * 0.55,
                                    height: displayWidth * 0.55,
                                    borderRadius: displayWidth * 0.04,
                                    borderWidth: displayWidth * 0.008,
                                },
                            ]}
                        >
                            <Text style={[styles.photoPlaceholderText, { fontSize: baseFontSize * 1.5 }]}>
                                📷
                            </Text>
                        </View>
                    )}

                    {/* Baby Name - HUGE for visibility */}
                    <Text style={[styles.babyName, { fontSize: baseFontSize * 2.8, marginTop: displayHeight * 0.025 }]}>
                        {babyName.toUpperCase()}
                    </Text>

                    {/* Birth details */}
                    {(birthDate || weight || length) && (
                        <View style={[styles.detailsRow, { marginTop: displayHeight * 0.015 }]}>
                            {birthDate && (
                                <Text style={[styles.detailText, { fontSize: baseFontSize * 0.9 }]}>
                                    📅 {birthDate}
                                </Text>
                            )}
                            {weight && (
                                <Text style={[styles.detailText, { fontSize: baseFontSize * 0.9 }]}>
                                    ⚖️ {weight}
                                </Text>
                            )}
                            {length && (
                                <Text style={[styles.detailText, { fontSize: baseFontSize * 0.9 }]}>
                                    📏 {length}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Footer */}
                    <View style={[styles.footer, { marginTop: displayHeight * 0.02 }]}>
                        <Text style={[styles.footerText, { fontSize: baseFontSize * 0.7 }]}>
                            PopulationPlusOne.com
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    outerBorder: {
        flex: 1,
        width: '100%',
        borderColor: '#FFD700', // Gold border for visibility
        margin: 8,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    banner: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    bannerText: {
        color: '#FFD700',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 3,
    },
    script: {
        color: '#fff',
        fontStyle: 'italic',
        fontWeight: '300',
    },
    cityState: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    stateText: {
        color: '#fff',
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 6,
    },
    populationSection: {
        alignItems: 'center',
    },
    populationLabel: {
        color: '#fff',
        fontWeight: '800',
        letterSpacing: 4,
    },
    plusOne: {
        color: '#FFD700',
        fontWeight: '900',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 6,
    },
    photo: {
        borderColor: '#fff',
    },
    photoPlaceholder: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        color: '#fff',
    },
    babyName: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    detailText: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 12,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
});
