import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

// Portrait: 8.5" x 11" at 300 DPI
const PORTRAIT_WIDTH = 2550;
const PORTRAIT_HEIGHT = 3300;

type Props = {
    theme: ThemeName;
    babyName: string;
    previewScale?: number;
};

/**
 * NatalChartBack - The back page of the natal chart printable
 * Explains what everything on the natal chart means in plain, approachable language.
 * Portrait 8.5x11" format.
 */
export default function NatalChartBack(props: Props) {
    const { theme, babyName, previewScale = 0.2 } = props;
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    const displayWidth = PORTRAIT_WIDTH * previewScale;
    const displayHeight = PORTRAIT_HEIGHT * previewScale;

    const borderWidth = displayHeight * 0.012;
    const padding = displayHeight * 0.015;
    const titleSize = displayHeight * 0.018;
    const sectionTitleSize = displayHeight * 0.014;
    const bodySize = displayHeight * 0.0105;
    const smallSize = displayHeight * 0.009;

    const cardBg = 'rgba(255,255,255,0.12)';
    const cardRadius = 8;

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
            <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: padding }]}>
                <View style={styles.content}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { fontSize: titleSize, color: colors.text }]}>
                            📖 HOW TO READ YOUR NATAL CHART 📖
                        </Text>
                        <Text style={[styles.subtitle, { fontSize: sectionTitleSize * 0.85, color: colors.text, opacity: 0.85 }]}>
                            A Simple Guide to {babyName}'s Celestial Blueprint
                        </Text>
                    </View>

                    {/* Main 2-column layout */}
                    <View style={styles.mainContent}>

                        {/* LEFT COLUMN */}
                        <View style={[styles.column, { flex: 0.5 }]}>

                            {/* What Is a Natal Chart? */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🌌 What Is a Natal Chart?
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text }]}>
                                    A natal chart is a snapshot of the sky at the exact moment of birth. It maps where the Sun, Moon, and planets were positioned among the 12 zodiac signs. Think of it as a cosmic fingerprint — no two are exactly alike. It doesn't predict the future; it highlights natural strengths, tendencies, and potential.
                                </Text>
                            </View>

                            {/* The Big Three */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    ✨ The Big Three
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text }]}>
                                    These are the three most important placements in any chart. They shape the core of who someone is:
                                </Text>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize * 1.05, color: '#ffd54f' }]}>☉ Sun Sign — Your Core Self</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        This is the sign most people know. It represents the essence of who you are — your identity, ego, and life purpose. It's the "main character energy" of the chart.
                                    </Text>
                                </View>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize * 1.05, color: '#b0bec5' }]}>☽ Moon Sign — Your Emotional World</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        The Moon reveals how someone feels, what brings comfort, and how emotions are processed. If the Sun is who you are, the Moon is how you feel. It's especially important for babies and children.
                                    </Text>
                                </View>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletTitle, { fontSize: smallSize * 1.05, color: colors.text }]}>↑ Rising Sign (Ascendant) — Your First Impression</Text>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        This is the sign that was rising on the eastern horizon at the moment of birth. It shapes how others see you and the energy you project when walking into a room. Think of it as your "social mask."
                                    </Text>
                                </View>
                            </View>

                            {/* The Four Elements */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🔥 The Four Elements
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text }]}>
                                    Every zodiac sign belongs to one of four elements. The element of your Sun sign reveals your basic temperament:
                                </Text>
                                <View style={styles.elementGrid}>
                                    <View style={[styles.elementBox, { backgroundColor: '#e53935' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>🔥 Fire</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.9 }]}>Aries • Leo • Sagittarius</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.85 }]}>Passionate, energetic, bold</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#43a047' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>🌍 Earth</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.9 }]}>Taurus • Virgo • Capricorn</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.85 }]}>Grounded, practical, reliable</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#1e88e5' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>💨 Air</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.9 }]}>Gemini • Libra • Aquarius</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.85 }]}>Intellectual, social, curious</Text>
                                    </View>
                                    <View style={[styles.elementBox, { backgroundColor: '#00acc1' }]}>
                                        <Text style={[styles.elementName, { fontSize: smallSize }]}>💧 Water</Text>
                                        <Text style={[styles.elementSigns, { fontSize: smallSize * 0.9 }]}>Cancer • Scorpio • Pisces</Text>
                                        <Text style={[styles.elementDesc, { fontSize: smallSize * 0.85 }]}>Emotional, intuitive, deep</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Reading the Chart Wheel — moved from center column */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🎯 Reading the Chart Wheel
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text }]}>
                                    The circular diagram on the front is called the "chart wheel." Here's how to read it:
                                </Text>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • The outer ring shows the 12 zodiac signs (♈ through ♓), each covering 30° of the sky
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • The planet symbols inside the wheel show where each planet was located at birth
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • When you see "Sun in Leo," it means the Sun was passing through the Leo section of the sky at the moment of birth
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • Planets close together suggest those energies blend and amplify each other
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* RIGHT COLUMN */}
                        <View style={[styles.column, { flex: 0.5 }]}>

                            {/* The Planets */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🪐 The Planets — What They Represent
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text, marginBottom: displayHeight * 0.008 }]}>
                                    Each planet governs a different part of life. The zodiac sign it was in at birth colors how that energy expresses itself:
                                </Text>

                                {[
                                    { symbol: '☉', name: 'Sun', meaning: 'Your identity, ego, and life purpose' },
                                    { symbol: '☽', name: 'Moon', meaning: 'Emotions, instincts, and inner needs' },
                                    { symbol: '☿', name: 'Mercury', meaning: 'How you think, learn, and communicate' },
                                    { symbol: '♀', name: 'Venus', meaning: 'Love, beauty, values, and what you enjoy' },
                                    { symbol: '♂', name: 'Mars', meaning: 'Drive, energy, courage, and how you take action' },
                                    { symbol: '♃', name: 'Jupiter', meaning: 'Growth, luck, optimism, and where you expand' },
                                    { symbol: '♄', name: 'Saturn', meaning: 'Discipline, lessons, responsibility, and structure' },
                                    { symbol: '♅', name: 'Uranus', meaning: 'Originality, change, rebellion, and breakthroughs' },
                                    { symbol: '♆', name: 'Neptune', meaning: 'Dreams, imagination, intuition, and spirituality' },
                                    { symbol: '♇', name: 'Pluto', meaning: 'Transformation, power, and deep change' },
                                ].map((planet) => (
                                    <View key={planet.name} style={styles.planetRow}>
                                        <Text style={[styles.planetSymbol, { fontSize: bodySize * 1.1, color: planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : colors.text }]}>
                                            {planet.symbol}
                                        </Text>
                                        <View style={styles.planetInfo}>
                                            <Text style={[styles.planetName, { fontSize: smallSize * 1.05, color: colors.text }]}>
                                                {planet.name}
                                            </Text>
                                            <Text style={[styles.planetMeaning, { fontSize: smallSize * 0.92, color: colors.text, opacity: 0.85 }]}>
                                                {planet.meaning}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>



                            {/* The 12 Houses */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    🏠 The 12 Houses — Areas of Life
                                </Text>
                                <Text style={[styles.cardBody, { fontSize: smallSize, color: colors.text, marginBottom: displayHeight * 0.005 }]}>
                                    The 12 houses divide life into different areas. The zodiac sign on each house colors how that area of life is experienced:
                                </Text>

                                {[
                                    { num: '1st', name: 'Self', desc: 'Identity, appearance, how you show up' },
                                    { num: '2nd', name: 'Values', desc: 'Money, possessions, self-worth' },
                                    { num: '3rd', name: 'Communication', desc: 'Thinking, siblings, daily interactions' },
                                    { num: '4th', name: 'Home', desc: 'Family, roots, emotional foundation' },
                                    { num: '5th', name: 'Creativity', desc: 'Joy, play, romance, self-expression' },
                                    { num: '6th', name: 'Health', desc: 'Daily routines, wellness, service' },
                                    { num: '7th', name: 'Partnerships', desc: 'Relationships, marriage, close bonds' },
                                    { num: '8th', name: 'Transformation', desc: 'Deep change, shared resources, rebirth' },
                                    { num: '9th', name: 'Exploration', desc: 'Travel, higher learning, philosophy' },
                                    { num: '10th', name: 'Career', desc: 'Public life, achievements, reputation' },
                                    { num: '11th', name: 'Community', desc: 'Friends, groups, hopes, and dreams' },
                                    { num: '12th', name: 'Spirituality', desc: 'Inner world, rest, the subconscious' },
                                ].map((house) => (
                                    <View key={house.num} style={styles.houseRow}>
                                        <Text style={[styles.houseNum, { fontSize: smallSize, color: '#ffd54f' }]}>
                                            {house.num}
                                        </Text>
                                        <View style={styles.houseInfo}>
                                            <Text style={[styles.houseName, { fontSize: smallSize * 0.95, color: colors.text }]}>
                                                {house.name}
                                            </Text>
                                            <Text style={[styles.houseDesc, { fontSize: smallSize * 0.85, color: colors.text, opacity: 0.8 }]}>
                                                {house.desc}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Good to Know */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderRadius: cardRadius }]}>
                                <Text style={[styles.cardTitle, { fontSize: sectionTitleSize, color: '#ffd54f' }]}>
                                    💡 Good to Know
                                </Text>

                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • Your Sun sign is what you read in horoscopes, but it's only one piece of the puzzle
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • The Moon sign often matters most for babies — it shows what makes them feel safe and loved
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • No placement is "bad." Every sign and position has strengths to be embraced
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • A chart is a starting point, not a destiny. It shows potential, not limits
                                    </Text>
                                </View>
                                <View style={styles.bulletGroup}>
                                    <Text style={[styles.bulletBody, { fontSize: smallSize, color: colors.text }]}>
                                        • For a more precise chart, exact birth time and location are used to calculate the Rising sign and house positions
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { fontSize: smallSize * 0.8, color: colors.text, opacity: 0.6 }]}>
                            For entertainment & keepsake purposes • www.populationplusone.com
                        </Text>
                    </View>
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
        padding: '2%',
    },
    header: {
        alignItems: 'center',
        marginBottom: '1.5%',
    },
    title: {
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtitle: {
        fontWeight: '500',
        marginTop: '0.3%',
        fontStyle: 'italic',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        gap: '2%',
    },
    column: {
        justifyContent: 'flex-start',
        gap: '1.5%',
    },
    card: {
        padding: '5%',
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: '3%',
    },
    cardBody: {
        lineHeight: 18,
        opacity: 0.9,
    },
    bulletGroup: {
        marginTop: '2%',
    },
    bulletTitle: {
        fontWeight: 'bold',
        marginBottom: '1%',
    },
    bulletBody: {
        opacity: 0.9,
        lineHeight: 17,
    },
    elementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '2%',
        marginTop: '3%',
    },
    elementBox: {
        width: '48%',
        borderRadius: 6,
        padding: '3%',
        alignItems: 'center',
    },
    elementName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    elementSigns: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    elementDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        marginTop: 1,
    },
    planetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '2%',
        gap: 6,
    },
    planetSymbol: {
        width: 22,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    planetInfo: {
        flex: 1,
    },
    planetName: {
        fontWeight: 'bold',
    },
    planetMeaning: {
        marginTop: 1,
    },
    houseRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: '1.5%',
        gap: 6,
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
        marginTop: 1,
    },
    footer: {
        alignItems: 'center',
        marginTop: '1%',
    },
    footerText: {
        fontStyle: 'italic',
    },
});
