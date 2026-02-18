import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Svg, Text as SvgText } from 'react-native-svg';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { calculateNatalChart } from '../src/data/utils/natal-chart-calculator';
import type { ThemeName } from '../src/types';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
const LANDSCAPE_WIDTH = 3300;
const LANDSCAPE_HEIGHT = 2550;

// Zodiac descriptions (condensed)
const ZODIAC_SUN_SHORT: Record<string, string> = {
    'Aries': 'Bold, courageous, and pioneering leader',
    'Taurus': 'Stable, dependable, and grounded',
    'Gemini': 'Curious, communicative, and bright',
    'Cancer': 'Nurturing, intuitive, and family-focused',
    'Leo': 'Creative, confident, and warm-hearted',
    'Virgo': 'Practical, analytical, and helpful',
    'Libra': 'Diplomatic, charming, and balanced',
    'Scorpio': 'Intense, perceptive, and transformative',
    'Sagittarius': 'Optimistic, adventurous, and philosophical',
    'Capricorn': 'Disciplined, responsible, and ambitious',
    'Aquarius': 'Progressive, independent, and innovative',
    'Pisces': 'Imaginative, compassionate, and intuitive',
};

const ZODIAC_MOON_SHORT: Record<string, string> = {
    'Aries': 'Direct and spontaneous emotions',
    'Taurus': 'Calm and grounded emotional nature',
    'Gemini': 'Processes feelings through communication',
    'Cancer': 'Deeply feeling and nurturing',
    'Leo': 'Playful and emotionally generous',
    'Virgo': 'Thoughtful and detail-focused',
    'Libra': 'Balanced and people-oriented',
    'Scorpio': 'Intensely feeling and intuitive',
    'Sagittarius': 'Optimistic and expansive',
    'Capricorn': 'Reserved and responsible',
    'Aquarius': 'Unconventional and free-spirited',
    'Pisces': 'Deeply intuitive and dreamy',
};

const ASCENDANT_SHORT: Record<string, string> = {
    'Aries': 'Projects bold, direct energy',
    'Taurus': 'Appears calm and steady',
    'Gemini': 'Comes across as curious and animated',
    'Cancer': 'Seems gentle and protective',
    'Leo': 'Radiates natural confidence',
    'Virgo': 'Appears thoughtful and reliable',
    'Libra': 'Projects charm and grace',
    'Scorpio': 'Appears intense and perceptive',
    'Sagittarius': 'Seems optimistic and open',
    'Capricorn': 'Projects maturity and purpose',
    'Aquarius': 'Appears unique and original',
    'Pisces': 'Seems dreamy and artistic',
};

const PLANET_MEANINGS: Record<string, string> = {
    'Sun': 'Core identity',
    'Moon': 'Emotions',
    'Mercury': 'Communication',
    'Venus': 'Love & beauty',
    'Mars': 'Action & drive',
    'Jupiter': 'Expansion & luck',
    'Saturn': 'Discipline',
    'Uranus': 'Innovation',
    'Neptune': 'Dreams',
    'Pluto': 'Transformation',
};

const HOUSE_THEMES = [
    'Self', 'Values', 'Communication', 'Home', 'Creativity', 'Health',
    'Partnerships', 'Transformation', 'Exploration', 'Career', 'Community', 'Spirituality'
];

const ELEMENT_INFO: Record<string, { color: string; trait: string }> = {
    'Fire': { color: '#e53935', trait: 'Passionate & Dynamic' },
    'Earth': { color: '#43a047', trait: 'Grounded & Practical' },
    'Air': { color: '#1e88e5', trait: 'Intellectual & Social' },
    'Water': { color: '#00acc1', trait: 'Emotional & Intuitive' },
};

const SIGN_ELEMENTS: Record<string, string> = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

type Props = {
    theme: ThemeName;
    babyName: string;
    dobISO: string;
    hometown: string;
    previewScale?: number;
};

export default function NatalChartPrintable(props: Props) {
    const { theme, babyName, dobISO, hometown, previewScale = 0.2 } = props;

    const colors = COLOR_SCHEMES[theme];
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    // Parse birth date
    const birthDate = new Date(dobISO);
    const formattedDate = birthDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate natal chart (using noon and default coordinates)
    const natalChart = useMemo(() => {
        const d = new Date(birthDate);
        d.setHours(12, 0, 0, 0);
        return calculateNatalChart(d, 40.7128, -74.0060); // Default NYC
    }, [dobISO]);

    const sunSign = natalChart.planets[0]?.zodiac || 'Unknown';
    const moonSign = natalChart.planets[1]?.zodiac || 'Unknown';
    const ascendantSign = natalChart.ascendantZodiac || 'Unknown';
    const sunElement = SIGN_ELEMENTS[sunSign] || 'Fire';

    // Sizing
    const borderWidth = displayHeight * 0.015;
    const padding = displayHeight * 0.02;
    const titleSize = displayHeight * 0.045;
    const sectionTitleSize = displayHeight * 0.028;
    const bodySize = displayHeight * 0.018;
    const smallSize = displayHeight * 0.014;

    // Chart wheel sizing (scaled for print) — 20% larger diameter
    const svgSize = displayHeight * 0.504;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r_outer = svgSize * 0.45;
    const r_sign = svgSize * 0.38;
    const r_planet = svgSize * 0.25;

    const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const planetSymbols: Record<string, string> = {
        'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
        'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇'
    };

    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    const positionOnCircle = (lng: number, radius: number) => {
        const rad = degToRad(lng - 90);
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
            {/* Border */}
            <View style={[styles.border, { borderWidth, borderColor: colors.border || '#FFFFFF', margin: padding }]}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { fontSize: titleSize, color: colors.text }]}>
                            ✨ NATAL CHART ✨
                        </Text>
                        <Text style={[styles.subtitle, { fontSize: sectionTitleSize * 0.9, color: colors.text }]}>
                            {babyName}
                        </Text>
                        <Text style={[styles.dateText, { fontSize: bodySize, color: colors.text, opacity: 0.9 }]}>
                            {formattedDate} • {hometown}
                        </Text>
                    </View>

                    {/* Main content - 3 columns */}
                    <View style={styles.mainContent}>
                        {/* Left Column - Big Three + Element */}
                        <View style={[styles.column, { flex: 0.3, justifyContent: 'space-between' }]}>
                            <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, color: colors.text }]}>
                                ✨ The Big Three
                            </Text>

                            {/* Sun */}
                            <View style={[styles.bigThreeCard, { backgroundColor: 'transparent', flex: 1, marginBottom: '2%' }]}>
                                <Text style={[styles.bigThreeLabel, { fontSize: smallSize, color: colors.text }]}>☉ SUN SIGN</Text>
                                <Text style={[styles.bigThreeSign, { fontSize: sectionTitleSize * 1.1, color: '#ffd54f' }]}>{sunSign}</Text>
                                <Text style={[styles.bigThreeDesc, { fontSize: smallSize, color: colors.text }]}>{ZODIAC_SUN_SHORT[sunSign]}</Text>
                            </View>

                            {/* Moon */}
                            <View style={[styles.bigThreeCard, { backgroundColor: 'transparent', flex: 1, marginBottom: '2%' }]}>
                                <Text style={[styles.bigThreeLabel, { fontSize: smallSize, color: colors.text }]}>☽ MOON SIGN</Text>
                                <Text style={[styles.bigThreeSign, { fontSize: sectionTitleSize * 1.1, color: '#b0bec5' }]}>{moonSign}</Text>
                                <Text style={[styles.bigThreeDesc, { fontSize: smallSize, color: colors.text }]}>{ZODIAC_MOON_SHORT[moonSign]}</Text>
                            </View>

                            {/* Rising */}
                            <View style={[styles.bigThreeCard, { backgroundColor: 'transparent', flex: 1, marginBottom: '2%' }]}>
                                <Text style={[styles.bigThreeLabel, { fontSize: smallSize, color: colors.text }]}>↑ RISING SIGN</Text>
                                <Text style={[styles.bigThreeSign, { fontSize: sectionTitleSize * 1.1, color: colors.text }]}>{ascendantSign}</Text>
                                <Text style={[styles.bigThreeDesc, { fontSize: smallSize, color: colors.text }]}>{ASCENDANT_SHORT[ascendantSign]}</Text>
                            </View>

                            {/* Element */}
                            <View style={[styles.elementCard, { backgroundColor: ELEMENT_INFO[sunElement]?.color || '#666', paddingVertical: '3%' }]}>
                                <Text style={[styles.elementTitle, { fontSize: bodySize * 1.1, color: '#fff' }]}>
                                    Element: {sunElement}
                                </Text>
                                <Text style={[styles.elementDesc, { fontSize: smallSize * 1.1, color: 'rgba(255,255,255,0.9)' }]}>
                                    {ELEMENT_INFO[sunElement]?.trait}
                                </Text>
                            </View>
                        </View>

                        {/* Center Column - Chart Wheel */}
                        <View style={[styles.column, { flex: 0.4, alignItems: 'center' }]}>
                            <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, color: colors.text }]}>
                                🌌 Birth Chart Wheel
                            </Text>
                            <View style={[styles.chartWrapper, { backgroundColor: 'transparent', borderRadius: svgSize * 0.05, marginTop: -displayHeight * 0.03 }]}>
                                <Svg width={svgSize} height={svgSize}>
                                    {/* Outer circle */}
                                    <Circle cx={cx} cy={cy} r={r_outer} stroke="#fff" strokeWidth={2} fill="#000000" />
                                    <Circle cx={cx} cy={cy} r={r_sign} stroke="rgba(255,255,255,0.3)" strokeWidth={1} fill="#000000" />

                                    {/* Zodiac sign dividers and symbols */}
                                    {zodiacSigns.map((sign, i) => {
                                        const angle = i * 30;
                                        const p1 = positionOnCircle(angle, r_sign);
                                        const p2 = positionOnCircle(angle, r_outer);
                                        const midAngle = angle + 15;
                                        const labelPos = positionOnCircle(midAngle, (r_sign + r_outer) / 2);

                                        return (
                                            <G key={sign}>
                                                <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                                                <SvgText
                                                    x={labelPos.x}
                                                    y={labelPos.y}
                                                    fill={sign === sunSign ? '#ffea00' : '#00ffff'}
                                                    fontSize={svgSize * 0.055}
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    alignmentBaseline="middle"
                                                >
                                                    {signSymbols[i]}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Planet positions */}
                                    {natalChart.planets.slice(0, 10).map((planet) => {
                                        const pos = positionOnCircle(planet.longitude, r_planet);
                                        const symbol = planetSymbols[planet.name] || '●';
                                        return (
                                            <SvgText
                                                key={planet.name}
                                                x={pos.x}
                                                y={pos.y}
                                                fill={planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : '#fff'}
                                                fontSize={svgSize * 0.055}
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                alignmentBaseline="middle"
                                            >
                                                {symbol}
                                            </SvgText>
                                        );
                                    })}

                                    {/* Center - Planet Earth */}
                                    <Defs>
                                        <ClipPath id="earthClip">
                                            <Circle cx={cx} cy={cy} r={12} />
                                        </ClipPath>
                                    </Defs>
                                    {/* Ocean */}
                                    <Circle cx={cx} cy={cy} r={12} fill="#1a6fc4" />
                                    {/* Continents - simplified landmasses */}
                                    <G clipPath="url(#earthClip)">
                                        {/* North America */}
                                        <Ellipse cx={cx - 5} cy={cy - 5} rx={5} ry={4} fill="#2e8b57" transform={`rotate(-20 ${cx - 5} ${cy - 5})`} />
                                        {/* South America */}
                                        <Ellipse cx={cx - 3} cy={cy + 5} rx={3} ry={5} fill="#2e8b57" transform={`rotate(10 ${cx - 3} ${cy + 5})`} />
                                        {/* Europe/Africa */}
                                        <Ellipse cx={cx + 5} cy={cy - 2} rx={3} ry={4} fill="#2e8b57" transform={`rotate(5 ${cx + 5} ${cy - 2})`} />
                                        <Ellipse cx={cx + 5} cy={cy + 5} rx={2.5} ry={4} fill="#2e8b57" />
                                        {/* Asia */}
                                        <Ellipse cx={cx + 9} cy={cy - 5} rx={4} ry={3} fill="#2e8b57" transform={`rotate(-10 ${cx + 9} ${cy - 5})`} />
                                    </G>
                                    {/* Atmosphere highlight */}
                                    <Circle cx={cx - 3} cy={cy - 3} r={10} fill="rgba(255,255,255,0.15)" />
                                </Svg>
                            </View>

                            {/* Planet Legend - 2 columns */}
                            <View style={styles.planetLegend}>
                                <View style={styles.planetLegendColumn}>
                                    {natalChart.planets.slice(0, 5).map((planet) => (
                                        <View key={planet.name} style={styles.planetLegendRow}>
                                            <Text style={[styles.planetSymbol, { fontSize: bodySize, color: planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : colors.text }]}>
                                                {planetSymbols[planet.name]}
                                            </Text>
                                            <Text style={[styles.planetText, { fontSize: smallSize, color: colors.text }]}>
                                                {planet.name} in {planet.zodiac}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.planetLegendColumn}>
                                    {natalChart.planets.slice(5, 10).map((planet) => (
                                        <View key={planet.name} style={styles.planetLegendRow}>
                                            <Text style={[styles.planetSymbol, { fontSize: bodySize, color: colors.text }]}>
                                                {planetSymbols[planet.name]}
                                            </Text>
                                            <Text style={[styles.planetText, { fontSize: smallSize, color: colors.text }]}>
                                                {planet.name} in {planet.zodiac}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Right Column - Houses */}
                        <View style={[styles.column, { flex: 0.3 }]}>
                            <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, color: colors.text }]}>
                                🏠 The 12 Houses
                            </Text>
                            <View style={[styles.housesGrid, { flex: 1 }]}>
                                {HOUSE_THEMES.map((theme, i) => {
                                    const houseSign = natalChart.houses[i] !== undefined ?
                                        zodiacSigns[Math.floor(natalChart.houses[i] / 30) % 12] :
                                        zodiacSigns[i];
                                    return (
                                        <View key={i} style={[styles.houseCard, { backgroundColor: 'transparent', height: '22%', justifyContent: 'center' }]}>
                                            <Text style={[styles.houseNumber, { fontSize: smallSize * 1.2, color: colors.text }]}>
                                                {i + 1}
                                            </Text>
                                            <Text style={[styles.houseTheme, { fontSize: smallSize, color: colors.text, opacity: 0.8 }]}>
                                                {theme}
                                            </Text>
                                            <Text style={[styles.houseSign, { fontSize: smallSize * 1.1, color: '#ffd54f' }]}>
                                                {signSymbols[zodiacSigns.indexOf(houseSign)]}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { fontSize: smallSize * 0.8, color: colors.text, opacity: 0.6 }]}>
                            Chart calculated for {formattedDate} • For entertainment purposes • www.populationplusone.com
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
        marginBottom: '2%',
    },
    title: {
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtitle: {
        fontWeight: 'bold',
        marginTop: '0.5%',
    },
    dateText: {
        fontWeight: 'bold',
        marginTop: '0.3%',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        gap: '2%',
    },
    column: {
        justifyContent: 'flex-start',
    },
    sectionTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '3%',
    },
    bigThreeCard: {
        borderRadius: 8,
        padding: '4%',
        marginBottom: '3%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    bigThreeLabel: {
        fontWeight: 'bold',
        letterSpacing: 1,
        opacity: 0.8,
    },
    bigThreeSign: {
        fontWeight: 'bold',
        marginVertical: '2%',
    },
    bigThreeDesc: {
        textAlign: 'center',
        fontWeight: 'bold',
        opacity: 0.9,
    },
    elementCard: {
        borderRadius: 8,
        padding: '4%',
        alignItems: 'center',
        marginTop: '2%',
    },
    elementTitle: {
        fontWeight: 'bold',
    },
    elementDesc: {
        fontWeight: 'bold',
        marginTop: '1%',
    },
    chartWrapper: {
        padding: '3%',
    },
    planetLegend: {
        flexDirection: 'row',
        marginTop: '-5%',
        width: '100%',
        justifyContent: 'space-around',
    },
    planetLegendColumn: {
        gap: 4,
    },
    planetLegendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    planetSymbol: {
        fontWeight: 'bold',
        width: 20,
        textAlign: 'center',
    },
    planetText: {
        fontWeight: 'bold',
        opacity: 0.9,
    },
    housesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'space-between',
        gap: '1.5%',
    },
    houseCard: {
        width: '31%',
        borderRadius: 6,
        padding: '2%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    houseNumber: {
        fontWeight: 'bold',
    },
    houseTheme: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    houseSign: {
        fontWeight: 'bold',
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: '1%',
    },
    footerText: {
        fontStyle: 'italic',
    },
});
