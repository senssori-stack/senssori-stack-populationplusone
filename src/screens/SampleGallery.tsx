import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import type { RootStackParamList, ThemeName } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SampleGallery'>;

export default function SampleGallery({ navigation }: Props) {
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>('green');
    const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const previewScale = Math.min(screenWidth / 3300, screenHeight / 2550) * 0.8;

    // Sample baby data
    const sampleBaby = {
        first: 'Emma',
        middle: 'Grace',
        last: 'Johnson',
        photoUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    };

    const sampleData = {
        theme: selectedTheme,
        babies: [sampleBaby],
        hometown: 'Austin, Texas',
        population: 978908,
        motherName: 'Sarah Johnson',
        fatherName: 'Michael Johnson',
        dobISO: '2024-12-25',
        weightLb: '7',
        weightOz: '8',
        lengthIn: '20',
        snapshot: {
            'GALLON OF GASOLINE': '$3.21',
            'LOAF OF BREAD': '$2.99',
            'DOZEN EGGS': '$4.50',
            'GALLON OF MILK': '$3.79',
            'GOLD OZ': '$2,738',
            'SILVER OZ': '$31.45',
            'DOW JONES CLOSE': '43,729.93',
            'US POPULATION': '341,814,420',
            'WORLD POPULATION': '8,118,835,999',
            'PRESIDENT': 'Joe Biden',
            'VICE PRESIDENT': 'Kamala Harris',
            '#1 SONG': 'Sabrina Carpenter - Espresso',
            'WON LAST SUPERBOWL': 'Kansas City Chiefs',
            'WON LAST WORLD SERIES': 'Los Angeles Dodgers',
        },
    };

    // Calculate life path number for sample
    const lifePathResult = calculateLifePath(sampleData.dobISO);
    const lifePathNumber = lifePathResult.number;

    const C = COLOR_SCHEMES[selectedTheme as keyof typeof COLOR_SCHEMES];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sample Gallery</Text>
                <Text style={styles.subtitle}>See what your announcement can look like</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {/* View Mode Toggle */}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, viewMode === 'front' && styles.activeButton]}
                        onPress={() => setViewMode('front')}
                    >
                        <Text style={[styles.buttonText, viewMode === 'front' && styles.activeButtonText]}>+1 Sign</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, viewMode === 'back' && styles.activeButton]}
                        onPress={() => setViewMode('back')}
                    >
                        <Text style={[styles.buttonText, viewMode === 'back' && styles.activeButtonText]}>Time Capsule</Text>
                    </TouchableOpacity>
                </View>

                {/* Theme Selector */}
                <Text style={styles.colorLabel}>Background Color</Text>
                <View style={{ alignSelf: 'center', width: '37.5%' }}>
                    <View style={{ gap: 1.5, marginBottom: 4 }}>
                        {/* Row 1 - Blues */}
                        <View style={{ flexDirection: 'row', gap: 1.5 }}>
                            {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSelectedTheme(t)}
                                    style={[
                                        styles.colorBox,
                                        {
                                            backgroundColor: COLOR_SCHEMES[t].bg,
                                            opacity: selectedTheme === t ? 1 : 0.85,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: COLOR_SCHEMES[t].bg,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 4,
                                            elevation: 6,
                                        }
                                    ]}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 2 - Greens */}
                        <View style={{ flexDirection: 'row', gap: 1.5 }}>
                            {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSelectedTheme(t)}
                                    style={[
                                        styles.colorBox,
                                        {
                                            backgroundColor: COLOR_SCHEMES[t].bg,
                                            opacity: selectedTheme === t ? 1 : 0.85,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: COLOR_SCHEMES[t].bg,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 4,
                                            elevation: 6,
                                        }
                                    ]}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 3 - Pinks/Purples */}
                        <View style={{ flexDirection: 'row', gap: 1.5 }}>
                            {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSelectedTheme(t)}
                                    style={[
                                        styles.colorBox,
                                        {
                                            backgroundColor: COLOR_SCHEMES[t].bg,
                                            opacity: selectedTheme === t ? 1 : 0.85,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: COLOR_SCHEMES[t].bg,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 4,
                                            elevation: 6,
                                        }
                                    ]}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 4 - Reds/Oranges */}
                        <View style={{ flexDirection: 'row', gap: 1.5 }}>
                            {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSelectedTheme(t)}
                                    style={[
                                        styles.colorBox,
                                        {
                                            backgroundColor: COLOR_SCHEMES[t].bg,
                                            opacity: selectedTheme === t ? 1 : 0.85,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: COLOR_SCHEMES[t].bg,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 4,
                                            elevation: 6,
                                        }
                                    ]}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 5 - Grays */}
                        <View style={{ flexDirection: 'row', gap: 1.5 }}>
                            {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSelectedTheme(t)}
                                    style={[
                                        styles.colorBox,
                                        {
                                            backgroundColor: COLOR_SCHEMES[t].bg,
                                            opacity: selectedTheme === t ? 1 : 0.85,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: COLOR_SCHEMES[t].bg,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 4,
                                            elevation: 6,
                                        }
                                    ]}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* Preview */}
            <View style={styles.previewSection}>
                <View style={styles.previewContainer}>
                    {viewMode === 'front' ? (
                        <SignFrontLandscape
                            theme={selectedTheme}
                            photoUris={[sampleBaby.photoUri]}
                            hometown={sampleData.hometown}
                            population={sampleData.population}
                            personName={`${sampleBaby.first} ${sampleBaby.middle} ${sampleBaby.last}`}
                            previewScale={previewScale}
                        />
                    ) : (
                        <TimeCapsuleLandscape
                            theme={selectedTheme}
                            babies={[sampleBaby]}
                            dobISO={sampleData.dobISO}
                            motherName={sampleData.motherName}
                            fatherName={sampleData.fatherName}
                            weightLb={sampleData.weightLb}
                            weightOz={sampleData.weightOz}
                            lengthIn={sampleData.lengthIn}
                            hometown={sampleData.hometown}
                            snapshot={sampleData.snapshot}
                            zodiac="Capricorn"
                            birthstone="Turquoise"
                            lifePathNumber={lifePathNumber}
                            previewScale={previewScale}
                        />
                    )}
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>What You Get:</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>📄</Text>
                    <Text style={styles.infoText}>Beautiful landscape announcements (11" × 8.5")</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>⏰</Text>
                    <Text style={styles.infoText}>Time capsule with historical data from birth date</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>🖼️</Text>
                    <Text style={styles.infoText}>Multiple layout options for 1-3 babies</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>🎨</Text>
                    <Text style={styles.infoText}>3 beautiful color themes to choose from</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoBullet}>🖨️</Text>
                    <Text style={styles.infoText}>Print-ready files for professional printing</Text>
                </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Form')}
            >
                <Text style={styles.ctaButtonText}>CREATE YOUR ANNOUNCEMENT</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a3a5c',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
    },
    controls: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeButton: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    buttonText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '700',
        fontSize: 16,
    },
    activeButtonText: {
        color: '#1a3a5c',
    },
    themeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeThemeButton: {
        borderColor: '#fff',
    },
    themeButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    colorLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    colorBox: {
        flex: 1,
        aspectRatio: 1,
        height: 12.5,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    previewSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    previewContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 24,
        alignItems: 'center',
        minHeight: 400,
        justifyContent: 'center',
    },
    infoSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 14,
    },
    infoBullet: {
        fontSize: 24,
    },
    infoText: {
        flex: 1,
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    ctaButton: {
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: '#fff',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
    },
    ctaButtonText: {
        color: '#1a3a5c',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    backButton: {
        marginHorizontal: 20,
        marginVertical: 12,
        marginBottom: 40,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
