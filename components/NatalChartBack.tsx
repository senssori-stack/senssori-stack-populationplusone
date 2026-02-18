import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

// Landscape: 11" x 8.5" at 300 DPI
const LANDSCAPE_WIDTH = 3300;
const LANDSCAPE_HEIGHT = 2550;

type Props = {
    theme: ThemeName;
    babyName: string;
    zodiacSign?: string;
    previewScale?: number;
};

const ZODIAC_SYMBOLS: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

/**
 * NatalChartBack - The back page of the natal chart printable
 * Explains what everything on the natal chart means in plain, approachable language.
 * Landscape 11x8.5" format — 3-column layout to maximize space.
 */
export default function NatalChartBack(props: Props) {
    const { theme, babyName, zodiacSign, previewScale = 0.2 } = props;
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    const borderWidth = displayHeight * 0.012;
    const pagePadding = displayHeight * 0.015;
    const titleSize = displayHeight * 0.0253;
    const sectionTitleSize = displayHeight * 0.0184;
    const bodySize = displayHeight * 0.01495;
    const smallSize = displayHeight * 0.01322;

    const cardBg = 'transparent';
    const cardRadius = 8;

    const planets = [
        { symbol: '☉', name: 'Sun', meaning: 'Identity, ego, life purpose' },
        { symbol: '☽', name: 'Moon', meaning: 'Emotions, instincts, inner needs' },
        { symbol: '☿', name: 'Mercury', meaning: 'Thinking, learning, communication' },
        { symbol: '♀', name: 'Venus', meaning: 'Love, beauty, values' },
        { symbol: '♂', name: 'Mars', meaning: 'Drive, energy, courage' },
        { symbol: '♃', name: 'Jupiter', meaning: 'Growth, luck, expansion' },
        { symbol: '♄', name: 'Saturn', meaning: 'Discipline, lessons, structure' },
        { symbol: '♅', name: 'Uranus', meaning: 'Originality, change, breakthroughs' },
        { symbol: '♆', name: 'Neptune', meaning: 'Dreams, imagination, spirituality' },
        { symbol: '♇', name: 'Pluto', meaning: 'Transformation, power, rebirth' },
    ];

    const houses = [
        { num: '1st', name: 'Self', desc: 'Identity & appearance' },
        { num: '2nd', name: 'Values', desc: 'Money & self-worth' },
        { num: '3rd', name: 'Communication', desc: 'Thinking & siblings' },
        { num: '4th', name: 'Home', desc: 'Family & roots' },
        { num: '5th', name: 'Creativity', desc: 'Joy & self-expression' },
        { num: '6th', name: 'Health', desc: 'Routines & wellness' },
        { num: '7th', name: 'Partnerships', desc: 'Relationships & bonds' },
        { num: '8th', name: 'Transformation', desc: 'Deep change & rebirth' },
        { num: '9th', name: 'Exploration', desc: 'Travel & philosophy' },
        { num: '10th', name: 'Career', desc: 'Public life & reputation' },
        { num: '11th', name: 'Community', desc: 'Friends & dreams' },
        { num: '12th', name: 'Spirituality', desc: 'Inner world & rest' },
    ];

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
            <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: pagePadding }]}>
                <View style={styles.content}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { fontSize: titleSize, color: colors.text }]}>
                            📖 HOW TO READ YOUR NATAL CHART 📖
                        </Text>
                        <Text style={[styles.subtitle, { fontSize: sectionTitleSize * 0.8, color: colors.text, opacity: 0.85 }]}>
                            A Simple Guide to {babyName}'s Celestial Blueprint
                        </Text>
                    </View>

                    {/* Main 3-column layout */}
                    <View style={styles.mainContent}>

                        {/* COLUMN 1 — Intro + Big Three + Elements */}
                        <View style={[styles.column, { flex: 1 }]}>

                            {/* What Is a Natal Chart? */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🌌 What Is a Natal Chart?
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text }]}>
                                    A natal chart is a snapshot of the sky at the exact moment of birth. It maps where the Sun, Moon, and planets were positioned among the 12 zodiac signs — a cosmic fingerprint unique to every person. It highlights natural strengths, tendencies, and potential.
                                </Text>
                            </View>

                            {/* The Big Three */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    ✨ The Big Three
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    The three most important placements in any chart:
                                </Text>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize, color: '#ffd54f' }]}>☉ Sun Sign — Core Self</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                        Your identity, ego, and life purpose. The "main character energy" of the chart.
                                    </Text>
                                </View>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize, color: '#b0bec5' }]}>☽ Moon Sign — Emotional World</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                        How you feel, what brings comfort. Especially important for babies and children.
                                    </Text>
                                </View>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize, color: colors.text }]}>↑ Rising Sign — First Impression</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                        The sign rising on the eastern horizon at birth. How others see you — your "social mask."
                                    </Text>
                                </View>
                            </View>

                            {/* The Four Elements — single row */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🔥 The Four Elements
                                </Text>
                                <View style={styles.elementGrid}>
                                    <View style={[styles.elementBox, { backgroundColor: '#e53935' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>🔥 Fire</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.85 }]}>Aries • Leo • Sag</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.8 }]}>Bold & energetic</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#43a047' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>🌍 Earth</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.85 }]}>Tau • Vir • Cap</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.8 }]}>Grounded & reliable</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#1e88e5' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>💨 Air</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.85 }]}>Gem • Lib • Aqu</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.8 }]}>Social & curious</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#00acc1' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>💧 Water</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.85 }]}>Can • Sco • Pis</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.8 }]}>Intuitive & deep</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Reading the Chart Wheel */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🎯 Reading the Chart Wheel
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    • The outer ring shows the 12 zodiac signs, each covering 30° of the sky
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    • Planet symbols inside show where each planet was at birth
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    • "Sun in Leo" means the Sun was in the Leo section at birth
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    • Planets close together blend and amplify each other's energy
                                </Text>
                            </View>
                        </View>

                        {/* COLUMN 2 — Planets + Good to Know */}
                        <View style={[styles.column, { flex: 1 }]}>

                            {/* The Planets */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🪐 The Planets
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize * 0.92, color: colors.text, marginBottom: 2 }]}>
                                    Each planet governs a different part of life. The sign it was in at birth colors how that energy expresses:
                                </Text>

                                {planets.map((planet) => (
                                    <View key={planet.name} style={styles.planetRow}>
                                        <Text style={[styles.planetSymbol, { fontSize: bodySize, color: planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : colors.text }]}>
                                            {planet.symbol}
                                        </Text>
                                        <Text style={[styles.planetName, { fontSize: smallSize, color: colors.text }]}>
                                            {planet.name}
                                        </Text>
                                        <Text style={[styles.planetMeaning, { fontSize: smallSize * 0.88, color: colors.text, opacity: 0.85 }]}>
                                            {planet.meaning}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Good to Know */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    💡 Good to Know
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text }]}>
                                    • Your Sun sign is what you read in horoscopes — but it's only one piece of the puzzle
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text, marginTop: 2 }]}>
                                    • The Moon sign often matters most for babies — it shows what makes them feel safe and loved
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text, marginTop: 2 }]}>
                                    • No placement is "bad." Every sign has strengths to be embraced
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text, marginTop: 2 }]}>
                                    • A chart shows potential, not destiny — it's a starting point, not a limit
                                </Text>
                                <Text style={[styles.bulletBody, { fontSize: smallSize * 0.92, color: colors.text, marginTop: 2 }]}>
                                    • Exact birth time and location make the Rising sign and house positions more precise
                                </Text>
                            </View>
                        </View>

                        {/* COLUMN 3 — The 12 Houses (2-column sub-grid) */}
                        <View style={[styles.column, { flex: 1 }]}>

                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius, flex: 1 }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🏠 The 12 Houses — Areas of Life
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize * 0.92, color: colors.text, marginBottom: 4 }]}>
                                    The 12 houses divide life into different areas. The zodiac sign on each house colors how that area is experienced:
                                </Text>

                                {/* Houses in 2 sub-columns: 1-6 left, 7-12 right */}
                                <View style={styles.housesGrid}>
                                    <View style={styles.housesSubColumn}>
                                        {houses.slice(0, 6).map((house) => (
                                            <View key={house.num} style={styles.houseRow}>
                                                <Text style={[styles.houseNum, { fontSize: smallSize, color: '#ffd54f' }]}>
                                                    {house.num}
                                                </Text>
                                                <View style={styles.houseInfo}>
                                                    <Text style={[styles.houseName, { fontSize: smallSize * 0.95, color: colors.text }]}>
                                                        {house.name}
                                                    </Text>
                                                    <Text style={[styles.houseDesc, { fontSize: smallSize * 0.82, color: colors.text, opacity: 0.8 }]}>
                                                        {house.desc}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.housesSubColumn}>
                                        {houses.slice(6).map((house) => (
                                            <View key={house.num} style={styles.houseRow}>
                                                <Text style={[styles.houseNum, { fontSize: smallSize, color: '#ffd54f' }]}>
                                                    {house.num}
                                                </Text>
                                                <View style={styles.houseInfo}>
                                                    <Text style={[styles.houseName, { fontSize: smallSize * 0.95, color: colors.text }]}>
                                                        {house.name}
                                                    </Text>
                                                    <Text style={[styles.houseDesc, { fontSize: smallSize * 0.82, color: colors.text, opacity: 0.8 }]}>
                                                        {house.desc}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { fontSize: smallSize * 0.75, color: colors.text, opacity: 0.6 }]}>
                            For entertainment & keepsake purposes • www.populationplusone.com
                        </Text>
                    </View>

                    {/* Zodiac symbol — bottom right */}
                    {zodiacSign && ZODIAC_SYMBOLS[zodiacSign] && (
                        <View style={styles.zodiacCorner}>
                            <Text style={[styles.zodiacSymbol, { fontSize: displayHeight * 0.256, color: colors.text, opacity: 0.45 }]}>
                                {ZODIAC_SYMBOLS[zodiacSign]}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    border: {
        flex: 1,
        borderRadius: 8,
    },
    content: {
        flex: 1,
        padding: '1%',
    },
    header: {
        alignItems: 'center',
        marginBottom: '0.3%',
    },
    title: {
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtitle: {
        fontWeight: 'bold',
        marginTop: '0.1%',
        fontStyle: 'italic',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        gap: '0.6%',
    },
    column: {
        justifyContent: 'flex-start',
        gap: '0.3%',
    },
    card: {
        padding: '2.5%',
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: '1%',
    },
    cardBody: {
        fontWeight: 'bold',
        lineHeight: 13,
        opacity: 0.9,
    },
    bulletGroup: {
        marginTop: '0.8%',
    },
    bulletTitle: {
        fontWeight: 'bold',
        marginBottom: '0.2%',
    },
    bulletBody: {
        fontWeight: 'bold',
        opacity: 0.9,
        lineHeight: 13,
    },
    elementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '1%',
        marginTop: '0.5%',
    },
    elementBox: {
        width: '48%',
        borderRadius: 6,
        padding: '1.5%',
        alignItems: 'center',
    },
    elementName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    elementSigns: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 'bold',
        marginTop: 1,
    },
    elementDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginTop: 0,
    },
    planetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '0.4%',
        gap: 3,
    },
    planetSymbol: {
        width: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    planetName: {
        fontWeight: 'bold',
        width: 55,
    },
    planetMeaning: {
        fontWeight: 'bold',
        flex: 1,
    },
    housesGrid: {
        flexDirection: 'row',
        gap: '2%',
        flex: 1,
    },
    housesSubColumn: {
        flex: 1,
        justifyContent: 'flex-start',
        gap: '0.5%',
    },
    houseRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 3,
    },
    houseNum: {
        fontWeight: 'bold',
        width: 28,
        textAlign: 'right',
    },
    houseInfo: {
        flex: 1,
    },
    houseName: {
        fontWeight: 'bold',
    },
    houseDesc: {
        fontWeight: 'bold',
        marginTop: 0,
    },
    footer: {
        alignItems: 'center',
        marginTop: '0.1%',
    },
    footerText: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    zodiacCorner: {
        position: 'absolute',
        bottom: '5%',
        right: '5%',
    },
    zodiacSymbol: {
        fontWeight: 'bold',
    },
});
