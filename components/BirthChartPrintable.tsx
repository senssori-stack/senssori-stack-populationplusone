import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BirthChartData, getWesternBirthChart } from '../src/data/utils/astrology-api';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
const LANDSCAPE_WIDTH = 3300;
const LANDSCAPE_HEIGHT = 2550;

// Lighten a hex color by mixing with white
function lightenColor(hex: string, amount: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const lr = Math.round(r + (255 - r) * amount);
    const lg = Math.round(g + (255 - g) * amount);
    const lb = Math.round(b + (255 - b) * amount);
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

type Props = {
    theme: ThemeName;
    babyName: string;
    dobISO: string;
    timeOfBirth: string; // HH:MM format
    latitude: number;
    longitude: number;
    hometown: string;
    previewScale?: number;
};

export default function BirthChartPrintable(props: Props) {
    const {
        theme,
        babyName,
        dobISO,
        timeOfBirth,
        latitude,
        longitude,
        hometown,
        previewScale = 0.2,
    } = props;

    const [chartData, setChartData] = useState<BirthChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                console.log('Fetching chart for:', dobISO, timeOfBirth, latitude, longitude);
                const data = await getWesternBirthChart(dobISO, timeOfBirth, latitude, longitude);
                console.log('Chart data received:', data ? 'Success' : 'Failed');
                setChartData(data);
            } catch (error) {
                console.error('Failed to fetch birth chart:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [dobISO, timeOfBirth, latitude, longitude]);

    const colors = COLOR_SCHEMES[theme];
    const lighterBg = lightenColor(colors.bg, 0.55);
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    const titleSize = Math.round(displayHeight * 0.035);
    const headerSize = Math.round(displayHeight * 0.025);
    const bodySize = Math.round(displayHeight * 0.018);
    const labelSize = Math.round(displayHeight * 0.016);
    const borderWidth = Math.round(displayHeight * 0.02);
    const padding = Math.round(displayHeight * 0.025);

    if (loading) {
        return (
            <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: lighterBg }]}>
                <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: padding }]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: padding * 2 }}>
                        <Text style={{ color: colors.text, fontSize: titleSize * 0.9, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                            ✨ Creating Your Custom Birth Chart ✨
                        </Text>
                        <Text style={{ color: colors.text, fontSize: bodySize, textAlign: 'center', opacity: 0.8, marginBottom: 30, lineHeight: bodySize * 1.6 }}>
                            Please be patient while we gather{'\n'}all the celestial data for your creation...
                        </Text>
                        <View style={{ width: displayWidth * 0.5, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
                            <View style={{ width: '70%', height: '100%', backgroundColor: colors.text, opacity: 0.6 }} />
                        </View>
                        <Text style={{ color: colors.text, fontSize: labelSize, opacity: 0.6, marginTop: 20 }}>
                            Calculating planetary positions, house cusps, and aspects...
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    if (!chartData) {
        return (
            <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: lighterBg }]}>
                <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: padding }]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: padding * 2 }}>
                        <Text style={{ color: colors.text, fontSize: titleSize * 0.8, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                            Unable to Load Birth Chart Data
                        </Text>
                        <Text style={{ color: colors.text, fontSize: bodySize, textAlign: 'center', opacity: 0.8, lineHeight: bodySize * 1.6 }}>
                            We're experiencing connectivity issues.{'\n'}Please check your internet connection and try again.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    const formattedDate = new Date(dobISO).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: lighterBg }]}>
            {/* White border frame */}
            <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: padding }]}>
                <View style={[styles.content, { padding: padding * 0.8 }]}>
                    {/* Official Header */}
                    <View style={{ alignItems: 'center', marginBottom: padding * 0.4 }}>
                        <Text style={[styles.title, { fontSize: titleSize * 0.7, color: colors.text, letterSpacing: 2 }]}>
                            ✦ NATAL CHART CERTIFICATE ✦
                        </Text>
                        <View style={{ width: '80%', height: 1, backgroundColor: colors.text, marginVertical: 8, opacity: 0.3 }} />
                        <Text style={[styles.officialName, { fontSize: titleSize * 1.2, color: colors.text, fontWeight: 'bold', marginTop: 4 }]}>
                            {babyName}
                        </Text>
                    </View>

                    {/* Birth Details Box */}
                    <View style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.28)',
                        padding: padding * 0.4,
                        borderRadius: 8,
                        marginBottom: padding * 0.4,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                            <View style={{ alignItems: 'center', minWidth: '30%' }}>
                                <Text style={{ fontSize: labelSize * 0.8, color: colors.text, opacity: 0.7 }}>DATE OF BIRTH</Text>
                                <Text style={{ fontSize: bodySize, color: colors.text, fontWeight: 'bold' }}>{formattedDate}</Text>
                            </View>
                            <View style={{ alignItems: 'center', minWidth: '20%' }}>
                                <Text style={{ fontSize: labelSize * 0.8, color: colors.text, opacity: 0.7 }}>TIME</Text>
                                <Text style={{ fontSize: bodySize, color: colors.text, fontWeight: 'bold' }}>{timeOfBirth}</Text>
                            </View>
                            <View style={{ alignItems: 'center', minWidth: '30%' }}>
                                <Text style={{ fontSize: labelSize * 0.8, color: colors.text, opacity: 0.7 }}>LOCATION</Text>
                                <Text style={{ fontSize: bodySize, color: colors.text, fontWeight: 'bold' }}>{hometown}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                            <Text style={{ fontSize: labelSize * 0.75, color: colors.text, opacity: 0.6 }}>
                                Coordinates: {latitude.toFixed(4)}°N, {Math.abs(longitude).toFixed(4)}°{longitude >= 0 ? 'E' : 'W'}
                            </Text>
                        </View>
                    </View>

                    {/* Main content: Chart SVG on left, data on right */}
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        {/* Left: Birth Chart Wheel */}
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {chartData.chartSvg ? (
                                <Image
                                    source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(chartData.chartSvg)}` }}
                                    style={{ width: '90%', height: '90%' }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={{ fontSize: bodySize, color: colors.text }}>Chart visual unavailable</Text>
                            )}
                        </View>

                        {/* Right: Data panels */}
                        <View style={{ flex: 1, paddingLeft: padding * 0.5 }}>
                            {/* Big Three */}
                            <View style={[styles.section, { marginBottom: padding * 0.3 }]}>
                                <Text style={[styles.sectionTitle, { fontSize: headerSize, color: colors.text }]}>
                                    The Big Three
                                </Text>
                                <View style={styles.dataRow}>
                                    <Text style={[styles.dataLabel, { fontSize: labelSize, color: colors.text }]}>☀️ Sun Sign:</Text>
                                    <Text style={[styles.dataValue, { fontSize: labelSize, color: colors.text }]}>{chartData.sunSign}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={[styles.dataLabel, { fontSize: labelSize, color: colors.text }]}>🌙 Moon Sign:</Text>
                                    <Text style={[styles.dataValue, { fontSize: labelSize, color: colors.text }]}>{chartData.moonSign}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={[styles.dataLabel, { fontSize: labelSize, color: colors.text }]}>⬆️ Rising Sign:</Text>
                                    <Text style={[styles.dataValue, { fontSize: labelSize, color: colors.text }]}>{chartData.risingSign}</Text>
                                </View>
                            </View>

                            {/* Planetary Positions */}
                            <View style={[styles.section, { marginBottom: padding * 0.3 }]}>
                                <Text style={[styles.sectionTitle, { fontSize: headerSize, color: colors.text }]}>
                                    Planetary Positions
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {chartData.planets.slice(0, 10).map((planet, idx) => (
                                        <View key={idx} style={{ width: '50%', marginBottom: 2 }}>
                                            <Text style={{ fontSize: labelSize * 0.85, color: colors.text }}>
                                                {planet.name}: {planet.sign} {planet.degree.toFixed(1)}°
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* House Cusps */}
                            <View style={[styles.section, { marginBottom: padding * 0.3 }]}>
                                <Text style={[styles.sectionTitle, { fontSize: headerSize, color: colors.text }]}>
                                    House Cusps
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {chartData.houses.slice(0, 12).map((house, idx) => (
                                        <View key={idx} style={{ width: '33%', marginBottom: 2 }}>
                                            <Text style={{ fontSize: labelSize * 0.8, color: colors.text }}>
                                                {house.house}: {house.sign} {house.degree.toFixed(0)}°
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Major Aspects */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { fontSize: headerSize, color: colors.text }]}>
                                    Major Aspects
                                </Text>
                                {chartData.aspects.slice(0, 8).map((aspect, idx) => (
                                    <Text key={idx} style={{ fontSize: labelSize * 0.85, color: colors.text, marginBottom: 2 }}>
                                        {aspect.planet1} {aspect.aspect} {aspect.planet2} ({aspect.angle.toFixed(1)}°)
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={{
                        alignItems: 'center',
                        marginTop: padding * 0.4,
                        paddingTop: padding * 0.3,
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(255, 255, 255, 0.2)'
                    }}>
                        <Text style={{ fontSize: labelSize * 0.75, color: colors.text, opacity: 0.8 }}>
                            Chart calculated using Placidus house system • Western Tropical Zodiac
                        </Text>
                        <Text style={{ fontSize: labelSize * 0.7, color: colors.text, opacity: 0.6, marginTop: 4 }}>
                            Certificate generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
    },
    border: {
        flex: 1,
        borderRadius: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    officialName: {
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    subtitle: {
        fontStyle: 'italic',
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        padding: 8,
        borderRadius: 8,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
        textDecorationLine: 'underline',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dataLabel: {
        fontWeight: '600',
    },
    dataValue: {
        fontWeight: '400',
    },
});
