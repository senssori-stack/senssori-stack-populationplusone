import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface SignFrontProps {
    babyName: string;
    city: string;
    state: string;
    population?: string;
    photoUri?: string;
    backgroundColor?: string;
}

export default function SignFront({
    babyName,
    city,
    state,
    population = '0',
    photoUri,
    backgroundColor = '#1a472a',
}: SignFrontProps) {
    const { width } = useWindowDimensions();

    // Fixed physical dimensions at 300 DPI for professional print quality
    // 11" x 8.5" = 3300 x 2550 pixels at 300 DPI
    const fixedDocWidth = 3300;
    const fixedDocHeight = 2550;
    const scale = Math.min(width / fixedDocWidth, 1); // Fit to screen, never enlarge
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.0675; // Proportional to document width (reduced 50%)

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                    width: displayWidth,
                    height: displayHeight,
                    padding: displayWidth * 0.024,
                },
            ]}
        >
            {/* Border frame */}
            <View style={styles.border}>
                <View style={styles.innerBorder}>
                    {/* Content */}
                    <View style={styles.content}>
                        {/* "Welcome To" script */}
                        <Text style={[styles.script, { fontSize: baseFontSize * 0.9 }]}>
                            Welcome To
                        </Text>

                        {/* City, State */}
                        <Text style={[styles.cityState, { fontSize: baseFontSize * 2.8512 }]}>
                            {city.toUpperCase()}, {state.toUpperCase()}
                        </Text>

                        {/* Population label */}
                        <Text style={[styles.populationLabel, { fontSize: baseFontSize * 1.5 }]}>
                            POPULATION
                        </Text>

                        {/* +1 indicator */}
                        <Text style={[styles.plusOne, { fontSize: baseFontSize * 3.5 }]}>
                            +1
                        </Text>

                        {/* Baby name */}
                        <Text style={[styles.babyName, { fontSize: baseFontSize * 2 }]}>
                            {babyName.toUpperCase()}
                        </Text>

                        {/* Photo */}
                        {photoUri && (
                            <Image
                                source={{ uri: photoUri }}
                                style={[
                                    styles.photo,
                                    {
                                        width: displayWidth * 0.24,
                                        height: displayWidth * 0.24,
                                    },
                                ]}
                            />
                        )}

                        {/* Fallback placeholder */}
                        {!photoUri && (
                            <View
                                style={[
                                    styles.photoPlaceholder,
                                    {
                                        width: displayWidth * 0.24,
                                        height: displayWidth * 0.24,
                                    },
                                ]}
                            >
                                <Text style={styles.photoPlaceholderText}>Photo</Text>
                            </View>
                        )}
                    </View>

                    {/* Watermark - discreet branding */}
                    <Text style={[styles.watermark, { fontSize: baseFontSize * 0.18 }]}>
                        www.populationplusone.com
                    </Text>
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
    border: {
        flex: 1,
        width: '100%',
        borderWidth: 8,
        borderColor: '#fff',
        borderRadius: 24,
        padding: 4,
    },
    innerBorder: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    script: {
        color: '#fff',
        fontStyle: 'italic',
        fontWeight: '300',
        marginBottom: 8,
    },
    cityState: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 2,
    },
    populationLabel: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        marginTop: 8,
    },
    plusOne: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 4,
    },
    babyName: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 16,
    },
    photo: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoPlaceholder: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    watermark: {
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        letterSpacing: 0.5,
        paddingBottom: 6,
        fontWeight: '400',
    },
});
