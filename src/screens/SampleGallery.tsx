import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ThemeName } from '../types';
import { COLOR_SCHEMES } from '../data/utils/colors';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { calculateLifePath } from '../data/utils/life-path-calculator';

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
                <Text style={[styles.title, { color: '#333' }]}>Sample Gallery</Text>
                <Text style={[styles.subtitle, { color: '#666' }]}>See what your announcement can look like</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {/* View Mode Toggle */}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, viewMode === 'front' && styles.activeButton]}
                        onPress={() => setViewMode('front')}
                    >
                        <Text style={[styles.buttonText, viewMode === 'front' && styles.activeButtonText]}>Front</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, viewMode === 'back' && styles.activeButton]}
                        onPress={() => setViewMode('back')}
                    >
                        <Text style={[styles.buttonText, viewMode === 'back' && styles.activeButtonText]}>Back</Text>
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
                            babies={[sampleBaby]}
                            hometown={sampleData.hometown}
                            population={sampleData.population}
                            photoUri={sampleBaby.photoUri}
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    controls: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    activeButton: {
        backgroundColor: '#333',
    },
    buttonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 14,
    },
    activeButtonText: {
        color: '#fff',
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
        borderColor: '#333',
    },
    themeButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    colorBox: {
        flex: 1,
        aspectRatio: 1,
        height: 12.5,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#ffffff',
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
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 20,
        alignItems: 'center',
        minHeight: 400,
        justifyContent: 'center',
    },
    infoSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    infoBullet: {
        fontSize: 20,
    },
    infoText: {
        flex: 1,
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    ctaButton: {
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: '#333',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    ctaButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    backButton: {
        marginHorizontal: 20,
        marginVertical: 12,
        marginBottom: 30,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    backButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14,
    },
});
