import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ActionSheetIOS, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Circle, G, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getAllPDFResources, PDFResourceKey, savePDF, viewPDF } from '../data/utils/pdf-helper';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChartReading'>;

// Zodiac descriptions
const ZODIAC_SUN_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'Bold, courageous, and pioneering. Natural leaders with boundless energy and enthusiasm.',
    'Taurus': 'Stable, dependable, and grounded. Known for calm demeanor and love of comfort.',
    'Gemini': 'Curious, communicative, and intellectually bright. Natural communicators who love learning.',
    'Cancer': 'Nurturing, intuitive, and emotionally intelligent. Deeply connected to family and home.',
    'Leo': 'Creative, confident, and natural-born performers. Shine brightly with warmth and generosity.',
    'Virgo': 'Practical, analytical, and detail-oriented. Methodical approach and enjoy helping others.',
    'Libra': 'Diplomatic, charming, and relationship-focused. Seek balance and harmony in all things.',
    'Scorpio': 'Intense, perceptive, and deeply transformative. Remarkable resilience and emotional depth.',
    'Sagittarius': 'Optimistic, adventurous, and philosophical. Natural explorers with love of learning.',
    'Capricorn': 'Disciplined, responsible, and goal-oriented. Mature with natural sense of purpose.',
    'Aquarius': 'Progressive, independent, and humanitarian. Innovative thinkers who see differently.',
    'Pisces': 'Imaginative, compassionate, and spiritually attuned. Natural dreamers with deep intuition.',
};

const ZODIAC_MOON_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'Emotionally direct and spontaneous. Quick reactions and need for independence.',
    'Taurus': 'Calm and grounded emotional foundation. Seeks comfort and stability.',
    'Gemini': 'Intellectually curious emotional nature. Processes feelings through communication.',
    'Cancer': 'Deeply feeling and protective emotional core. Naturally nurturing with strong bonds.',
    'Leo': 'Playful and emotionally generous. Expresses feelings openly and uplifts others.',
    'Virgo': 'Thoughtful and detail-focused emotional processing. Appreciates order.',
    'Libra': 'Emotionally balanced and people-oriented. Seeks harmony in relationships.',
    'Scorpio': 'Intensely feeling and intuitive. Experiences emotions profoundly.',
    'Sagittarius': 'Optimistic and expansive emotional landscape. Processes through exploration.',
    'Capricorn': 'Reserved and responsible emotional world. Matures emotionally with self-control.',
    'Aquarius': 'Unconventional and intellectually focused emotions. Needs emotional freedom.',
    'Pisces': 'Deeply intuitive and imaginative emotional realm. Sensitive to atmospheres.',
};

const ASCENDANT_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'Bold, direct, and energetic presence. Appears as a leader and trailblazer.',
    'Taurus': 'Calm, steady, and dependable. Grounded and naturally collected demeanor.',
    'Gemini': 'Curious, talkative, and animated. Communicative and quick-minded.',
    'Cancer': 'Gentle, protective, and home-loving. Sensitive and emotionally aware.',
    'Leo': 'Natural confidence and warmth. Creative and magnetic presence.',
    'Virgo': 'Thoughtful, helpful, and intelligent. Reliable and naturally organized.',
    'Libra': 'Charming, graceful, and peacekeeping. Balanced and naturally sociable.',
    'Scorpio': 'Intense, mysterious, and perceptive. Appears more mature, emotionally intelligent.',
    'Sagittarius': 'Optimistic, adventurous, and expansive. Friendly and open-minded.',
    'Capricorn': 'Mature, responsible, and goal-focused. Recognized for natural wisdom.',
    'Aquarius': 'Independent, unique, and intellectually different. Unconventional and original.',
    'Pisces': 'Dreamy, artistic, and compassionate. Gentle, intuitive, and imaginative.',
};

export default function NatalChartWithReadingScreen({ navigation, route }: Props) {
    const params = route.params || {};

    const birthDate = params.dobISO ? new Date(params.dobISO) : new Date();
    const babyName = params.babyFirst ? `${params.babyFirst}${params.babyMiddle ? ' ' + params.babyMiddle : ''}` : 'Baby';
    const hometown = params.hometown || 'their birthplace';
    const theme = params.theme || 'green';
    const latitude = params.latitude || 40.7128;
    const longitude = params.longitude || -74.0060;

    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;
    const { width: screenWidth } = useWindowDimensions();

    // Optimized for 8.5x11 printing with chart on left, info on right
    const svgSize = Math.min(300, screenWidth * 0.35);

    const natalChart = useMemo(() => {
        return calculateNatalChart(birthDate, latitude, longitude);
    }, [birthDate, latitude, longitude]);

    // Chart sizing
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r_outer = svgSize * 0.48;
    const r_sign_outer = svgSize * 0.44;
    const r_sign_inner = svgSize * 0.37;
    const r_house_out = svgSize * 0.35;
    const r_house_in = svgSize * 0.28;
    const r_planet = svgSize * 0.24;
    const r_inner = svgSize * 0.18;

    const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    const positionOnCircle = (lng: number, radius: number) => {
        const rad = degToRad(lng - 90);
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    // Render zodiac with labels
    const renderZodiacSigns = () => {
        return zodiacSigns.map((sign, i) => {
            const angle = i * 30;
            const symbolPos = positionOnCircle(angle + 15, r_sign_outer + svgSize * 0.04);
            const labelPos = positionOnCircle(angle + 15, r_sign_outer + svgSize * 0.12);

            return (
                <G key={`sign-${i}`}>
                    {/* Sign background */}
                    <Circle cx={symbolPos.x} cy={symbolPos.y} r={svgSize * 0.025} fill="#1a1a1a" opacity="0.8" />
                    {/* Sign symbol */}
                    <SvgText
                        x={symbolPos.x}
                        y={symbolPos.y}
                        fontSize={String(svgSize * 0.045)}
                        fontWeight="800"
                        fill="#000000"
                        textAnchor="middle"
                    >
                        {signSymbols[i]}
                    </SvgText>
                    {/* Sign label */}
                    <SvgText
                        x={labelPos.x}
                        y={labelPos.y}
                        fontSize={String(svgSize * 0.028)}
                        fontWeight="600"
                        fill="#000000"
                        textAnchor="middle"
                    >
                        {sign.substring(0, 3)}
                    </SvgText>
                </G>
            );
        });
    };

    // Render zodiac boundaries
    const renderZodiacBoundaries = () => {
        const lines = [];
        for (let i = 0; i < 12; i++) {
            const outer = positionOnCircle(i * 30, r_sign_outer);
            const inner = positionOnCircle(i * 30, r_sign_inner);
            lines.push(
                <Line
                    key={`zodiac-line-${i}`}
                    x1={outer.x}
                    y1={outer.y}
                    x2={inner.x}
                    y2={inner.y}
                    stroke="#000000"
                    strokeWidth={String(svgSize * 0.004)}
                    opacity="0.6"
                />
            );
        }
        return lines;
    };

    // Render houses
    const renderHouses = () => {
        const lines = [];
        for (let i = 0; i < natalChart.houses.length; i++) {
            const houseLng = natalChart.houses[i];
            const outer = positionOnCircle(houseLng, r_house_out);
            const inner = positionOnCircle(houseLng, r_house_in);
            lines.push(
                <Line
                    key={`house-${i}`}
                    x1={outer.x}
                    y1={outer.y}
                    x2={inner.x}
                    y2={inner.y}
                    stroke="#4ECDC4"
                    strokeWidth={String(svgSize * 0.005)}
                    opacity="0.6"
                />
            );
        }
        return lines;
    };

    // Render planets with degrees and anti-collision
    const renderPlanets = () => {
        const placed: Array<[number, number]> = [];

        return natalChart.planets.slice(0, 10).map((planet) => {
            const pos = positionOnCircle(planet.longitude, r_planet);
            const planetColors: any = {
                'Sun': '#FF6B35', 'Moon': '#C0C5CE', 'Mercury': '#4ECDC4', 'Venus': '#FF6B9D',
                'Mars': '#C44569', 'Jupiter': '#6C5CE7', 'Saturn': '#4A4E69', 'Uranus': '#00BFA5',
                'Neptune': '#3F51B5', 'Pluto': '#2C2E3E'
            };
            const planetColor = planetColors[planet.name] || colors.accent;

            // Detect collision and adjust radius for degree label
            let labelRadius = r_planet + svgSize * 0.06;
            let collision = false;
            for (const [plon, pr] of placed) {
                const angleDiff = Math.min(Math.abs(planet.longitude - plon), 360 - Math.abs(planet.longitude - plon));
                if (angleDiff <= 15) {
                    collision = true;
                    labelRadius = r_planet - svgSize * 0.08;
                    break;
                }
            }

            placed.push([planet.longitude, r_planet]);
            const labelPos = positionOnCircle(planet.longitude, labelRadius);

            // Format degree label
            const deg = Math.floor(planet.longitude % 30);
            const min = Math.round((planet.longitude % 30 - deg) * 60);
            const retroLabel = planet.retrograde ? '℞' : '';
            const degreeText = `${deg}°${min.toString().padStart(2, '0')}${retroLabel}`;

            return (
                <G key={`planet-${planet.name}`}>
                    {/* Planet circle background with slight glow */}
                    <Circle
                        cx={pos.x}
                        cy={pos.y}
                        r={svgSize * 0.035}
                        fill={planetColor}
                        opacity="0.15"
                        stroke={planetColor}
                        strokeWidth={String(svgSize * 0.004)}
                    />
                    {/* Planet glyph - LARGE and bold */}
                    <SvgText
                        x={pos.x}
                        y={pos.y}
                        fontSize={String(svgSize * 0.13)}
                        fontWeight="400"
                        fill={planetColor}
                        textAnchor="middle"
                        fontFamily="serif"
                    >
                        {planet.symbol}
                    </SvgText>
                    {/* Degree label */}
                    <SvgText
                        x={labelPos.x}
                        y={labelPos.y}
                        fontSize={String(svgSize * 0.024)}
                        fontWeight="600"
                        fill="#2C3E50"
                        textAnchor="middle"
                    >
                        {degreeText}
                    </SvgText>
                    {/* Retrograde indicator if needed */}
                    {planet.retrograde && (
                        <SvgText
                            x={pos.x + svgSize * 0.035}
                            y={pos.y + svgSize * 0.035}
                            fontSize={String(svgSize * 0.03)}
                            fontWeight="bold"
                            fill="#000000"
                            textAnchor="middle"
                        >
                            R
                        </SvgText>
                    )}
                </G>
            );
        });
    };

    const renderAscendant = () => {
        const pos = positionOnCircle(natalChart.ascendant, r_sign_outer + svgSize * 0.02);
        return (
            <G key="ascendant-marker">
                <Path
                    d={`M ${pos.x} ${pos.y - svgSize * 0.03} L ${pos.x - svgSize * 0.025} ${pos.y + svgSize * 0.02} L ${pos.x + svgSize * 0.025} ${pos.y + svgSize * 0.02} Z`}
                    fill="#FFD700"
                    stroke="#000000"
                    strokeWidth={String(svgSize * 0.003)}
                />
                <Line
                    x1={pos.x}
                    y1={pos.y}
                    x2={cx}
                    y2={cy}
                    stroke="#FFD700"
                    strokeWidth={String(svgSize * 0.002)}
                    opacity="0.7"
                    strokeDasharray={`${svgSize * 0.01},${svgSize * 0.008}`}
                />
            </G>
        );
    };

    // Render house numbers
    const renderHouseNumbers = () => {
        const houseLabels = [];
        for (let i = 0; i < 12; i++) {
            const houseLng = natalChart.houses[i];
            const houseNum = (i + 1).toString();
            const pos = positionOnCircle(houseLng, (r_house_out + r_house_in) / 2);
            houseLabels.push(
                <SvgText
                    key={`house-num-${i}`}
                    x={pos.x}
                    y={pos.y}
                    fontSize={String(svgSize * 0.022)}
                    fontWeight="600"
                    fill="#4ECDC4"
                    textAnchor="middle"
                >
                    {houseNum}
                </SvgText>
            );
        }
        return houseLabels;
    };

    // Render angle labels (ASC/DS)
    const renderAngleLabels = () => {
        const angleData = [
            { lon: natalChart.ascendant, label: 'ASC', color: '#FFD700' },
            { lon: (natalChart.ascendant + 180) % 360, label: 'DS', color: '#FFD700' },
        ];

        return angleData.map((angle) => {
            const pos = positionOnCircle(angle.lon, r_sign_inner - svgSize * 0.06);
            return (
                <G key={`angle-${angle.label}`}>
                    {/* Background circle for label */}
                    <Circle
                        cx={pos.x}
                        cy={pos.y}
                        r={svgSize * 0.02}
                        fill="white"
                        stroke={angle.color}
                        strokeWidth={String(svgSize * 0.003)}
                        opacity="0.95"
                    />
                    {/* Label text */}
                    <SvgText
                        x={pos.x}
                        y={pos.y}
                        fontSize={String(svgSize * 0.024)}
                        fontWeight="700"
                        fill={angle.color}
                        textAnchor="middle"
                    >
                        {angle.label}
                    </SvgText>
                </G>
            );
        });
    };

    const sunSign = natalChart.planets[0]?.zodiac || 'Unknown';
    const moonSign = natalChart.planets[1]?.zodiac || 'Unknown';
    const ascendantSign = natalChart.ascendantZodiac || 'Unknown';

    const showPDFActions = (pdfKey: PDFResourceKey, pdfName: string) => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'View Document', 'Save to Device'],
                    cancelButtonIndex: 0,
                    title: pdfName,
                    message: 'What would you like to do?',
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        viewPDF(pdfKey);
                    } else if (buttonIndex === 2) {
                        savePDF(pdfKey);
                    }
                }
            );
        } else {
            Alert.alert(
                pdfName,
                'What would you like to do?',
                [
                    { text: 'View Document', onPress: () => viewPDF(pdfKey) },
                    { text: 'Save to Device', onPress: () => savePDF(pdfKey) },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }
    };

    const handleInfoPress = () => {
        const pdfResources = getAllPDFResources();
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', ...pdfResources.map(p => p.name)],
                    cancelButtonIndex: 0,
                    title: 'Educational Documents',
                    message: 'Learn about natal charts and astrology',
                },
                (buttonIndex) => {
                    if (buttonIndex > 0) {
                        const selected = pdfResources[buttonIndex - 1];
                        showPDFActions(selected.key, selected.name);
                    }
                }
            );
        } else {
            Alert.alert(
                'Educational Documents',
                'Select a document:',
                [
                    ...pdfResources.map(p => ({
                        text: p.name,
                        onPress: () => showPDFActions(p.key, p.name),
                    })),
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Subtle info button - top right corner */}
            <TouchableOpacity
                style={styles.infoButton}
                onPress={handleInfoPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.infoButtonText}>ⓘ</Text>
            </TouchableOpacity>

            <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
                {/* Single Unified Box - Everything compact */}
                <View style={[styles.unifiedChartBox, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
                    {/* Header with name and date */}
                    <View style={styles.compactHeader}>
                        <Text style={[styles.compactHeaderName, { color: '#1a1a1a' }]}>
                            {babyName}
                        </Text>
                        <Text style={[styles.compactHeaderDate, { color: '#666666' }]}>
                            {birthDate.toLocaleDateString()} • {hometown}
                        </Text>
                    </View>

                    {/* Unified Chart Box - All content in one container */}
                    <View style={[styles.unifiedChartBox, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
                        {/* Compact Header - Baby Name and Date */}
                        <View style={styles.compactHeader}>
                            <Text style={styles.compactHeaderName}>{babyName}</Text>
                            <Text style={styles.compactHeaderDate}>{birthDate.toLocaleDateString()} • {hometown}</Text>
                        </View>

                        {/* Chart and Info Row - Horizontal Layout */}
                        <View style={styles.chartDataRow}>
                            {/* LEFT: Compact Chart */}
                            <View style={styles.compactChartContainer}>
                                <View style={styles.chartContainer}>
                                    <Svg width={String(svgSize)} height={String(svgSize)} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                                        {/* Outer circle */}
                                        <Circle cx={cx} cy={cy} r={r_outer} fill="none" stroke="#000000" strokeWidth={String(svgSize * 0.004)} opacity="0.8" />

                                        {/* Zodiac band */}
                                        <Circle cx={cx} cy={cy} r={r_sign_outer} fill="none" stroke="#000000" strokeWidth={String(svgSize * 0.003)} opacity="0.6" />
                                        <Circle cx={cx} cy={cy} r={r_sign_inner} fill="none" stroke="#000000" strokeWidth={String(svgSize * 0.003)} opacity="0.6" />

                                        {/* House circles */}
                                        <Circle cx={cx} cy={cy} r={r_house_out} fill="none" stroke="#4ECDC4" strokeWidth={String(svgSize * 0.002)} opacity="0.4" />
                                        <Circle cx={cx} cy={cy} r={r_house_in} fill="none" stroke="#4ECDC4" strokeWidth={String(svgSize * 0.002)} opacity="0.4" />

                                        {/* Inner circle */}
                                        <Circle cx={cx} cy={cy} r={r_inner} fill="none" stroke="#000000" strokeWidth={String(svgSize * 0.003)} opacity="0.5" />

                                        {/* Zodiac boundaries */}
                                        {renderZodiacBoundaries()}

                                        {/* House divisions */}
                                        {renderHouses()}

                                        {/* Zodiac signs with labels */}
                                        {renderZodiacSigns()}

                                        {/* Planets */}
                                        {renderPlanets()}

                                        {/* House numbers */}
                                        {renderHouseNumbers()}

                                        {/* Angle labels */}
                                        {renderAngleLabels()}

                                        {/* Ascendant marker */}
                                        {renderAscendant()}

                                        {/* Center point */}
                                        <Circle cx={cx} cy={cy} r={svgSize * 0.01} fill="#000000" />
                                    </Svg>
                                </View>
                            </View>

                            {/* RIGHT: Compact Info (Planet & House Data) */}
                            <View style={styles.infoColumn}>
                                {/* Birth Info - Ultra Compact */}
                                <View style={[styles.birthInfoBoxCompact, { backgroundColor: colors.accent }]}>
                                    <Text style={styles.birthInfoCompactText}>{birthDate.toLocaleDateString()}</Text>
                                    <Text style={styles.birthInfoCompactText}>{birthDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    <Text style={styles.birthInfoCompactText}>{hometown}</Text>
                                </View>

                                {/* Cardinal Signs - Inline */}
                                <View style={styles.cardinalSignsInline}>
                                    <Text style={[styles.cardinalSign, { color: colors.accent }]}>☉ {sunSign}</Text>
                                    <Text style={[styles.cardinalSign, { color: colors.accent }]}>☽ {moonSign}</Text>
                                    <Text style={[styles.cardinalSign, { color: colors.accent }]}>↑ {ascendantSign}</Text>
                                </View>

                                {/* Ultra-Compact Planet Grid */}
                                <View style={styles.miniGridContainer}>
                                    <Text style={[styles.miniGridTitle, { color: colors.accent }]}>Planets</Text>
                                    <View style={styles.miniGrid}>
                                        {natalChart.planets.slice(0, 10).map((planet) => {
                                            const degree = Math.floor(planet.longitude);
                                            const minutes = Math.round((planet.longitude - degree) * 60);
                                            return (
                                                <View key={`planet-${planet.name}`} style={styles.miniGridItem}>
                                                    <Text style={[styles.miniGridSymbol, { color: colors.accent }]}>{planet.symbol}</Text>
                                                    <Text style={[styles.miniGridValue, { color: colors.text }]}>{planet.zodiac.substring(0, 3)}</Text>
                                                    <Text style={[styles.miniGridDegree, { color: colors.text }]}>{degree}°</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Ultra-Compact Houses Grid */}
                                <View style={styles.miniGridContainer}>
                                    <Text style={[styles.miniGridTitle, { color: colors.accent }]}>Houses</Text>
                                    <View style={styles.miniGrid}>
                                        {natalChart.houses.map((house, idx) => {
                                            const houseNum = idx + 1;
                                            const degree = Math.floor(house);
                                            const zodiac = zodiacSigns[Math.floor(house / 30)];
                                            return (
                                                <View key={`house-${idx}`} style={styles.miniGridItem}>
                                                    <Text style={[styles.miniGridSymbol, { color: colors.accent }]}>H{houseNum}</Text>
                                                    <Text style={[styles.miniGridValue, { color: colors.text }]}>{zodiac.substring(0, 3)}</Text>
                                                    <Text style={[styles.miniGridDegree, { color: colors.text }]}>{degree}°</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Aspect Summary */}
                                <View style={[styles.aspectSummary, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                                    <Text style={styles.aspectTitle}>Key Aspects</Text>
                                    <Text style={styles.aspectText}>Analyze major transits and progressions for {babyName}</Text>
                                </View>

                                {/* RIGHT: Compact Info (Planet & House Data) */}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Full-width descriptions below */}
                <View style={styles.descriptionsSection}>
                    <View style={[styles.readingCard, { borderColor: colors.accent }]}>
                        <Text style={[styles.readingTitle, { color: colors.accent }]}>
                            ☉ {sunSign}
                        </Text>
                        <Text style={[styles.readingText, { color: colors.text }]}>
                            {ZODIAC_SUN_DESCRIPTIONS[sunSign] || 'A unique individual with special gifts.'}
                        </Text>
                    </View>

                    <View style={[styles.readingCard, { borderColor: colors.accent }]}>
                        <Text style={[styles.readingTitle, { color: colors.accent }]}>
                            ☽ {moonSign}
                        </Text>
                        <Text style={[styles.readingText, { color: colors.text }]}>
                            {ZODIAC_MOON_DESCRIPTIONS[moonSign] || 'Rich emotional depths and sensitivity.'}
                        </Text>
                    </View>

                    <View style={[styles.readingCard, { borderColor: colors.accent }]}>
                        <Text style={[styles.readingTitle, { color: colors.accent }]}>
                            ↑ {ascendantSign}
                        </Text>
                        <Text style={[styles.readingText, { color: colors.text }]}>
                            {ASCENDANT_DESCRIPTIONS[ascendantSign] || 'A natural presence that draws others in.'}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

interface InfoRowProps {
    icon: string;
    label: string;
    value: string;
    accentColor: string;
    textColor: string;
}

function InfoRow({ icon, label, value, accentColor, textColor }: InfoRowProps) {
    return (
        <View style={styles.infoRow}>
            <Text style={[styles.infoIcon, { color: accentColor }]}>{icon}</Text>
            <View>
                <Text style={[styles.infoLabel, { color: textColor }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: accentColor }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
    },
    infoButton: {
        position: 'absolute',
        top: 8,
        right: 12,
        zIndex: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoButtonText: {
        fontSize: 18,
        color: '#666',
    },
    unifiedChartBox: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    compactHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    compactHeaderName: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    compactHeaderDate: {
        fontSize: 11,
        marginTop: 4,
    },
    chartDataRow: {
        flexDirection: 'row',
        gap: 12,
    },
    compactChartContainer: {
        flex: 0.4,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSection: {
        marginBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 11,
        opacity: 0.7,
        fontWeight: '500',
    },
    twoColumnLayout: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    chartColumn: {
        flex: 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 8,
    },
    infoColumn: {
        flex: 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 8,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
        padding: 8,
    },
    birthInfoBox: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 0,
    },
    birthInfoBoxCompact: {
        marginBottom: 6,
        padding: 6,
        borderRadius: 6,
        marginHorizontal: 0,
    },
    birthInfoCompactText: {
        fontSize: 8,
        fontWeight: '600',
        color: '#1a1a1a',
        lineHeight: 10,
    },
    cardinalSignsInline: {
        marginBottom: 6,
        paddingHorizontal: 4,
        paddingVertical: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
        gap: 2,
    },
    cardinalSign: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.1,
        color: '#1a1a1a',
    },
    miniGridContainer: {
        marginBottom: 8,
    },
    miniGridTitle: {
        fontSize: 8,
        fontWeight: '700',
        marginBottom: 3,
        letterSpacing: 0.2,
        color: '#1a1a1a',
    },
    miniGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    miniGridItem: {
        flex: 0.33,
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 2,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    miniGridSymbol: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    miniGridValue: {
        fontSize: 7,
        fontWeight: '600',
        lineHeight: 9,
        color: '#1a1a1a',
    },
    miniGridDegree: {
        fontSize: 7,
        fontWeight: '500',
        color: '#333333',
    },
    aspectSummary: {
        marginTop: 8,
        padding: 6,
        borderRadius: 6,
        marginHorizontal: 0,
    },
    aspectTitle: {
        fontSize: 8,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    aspectText: {
        fontSize: 7,
        color: '#FFFFFF',
        lineHeight: 9,
        fontWeight: '500',
    },
    descriptionsSection: {
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 12,
    },
    infoPanel: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingHorizontal: 8,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoIcon: {
        fontSize: 24,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.7,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    dataTable: {
        marginBottom: 12,
        borderLeftWidth: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tableTitle: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.08)',
        letterSpacing: 0.3,
    },
    tableContent: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    tableCell: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.15,
    },
    tableCellRight: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.25,
        textAlign: 'right',
        flex: 1.2,
    },
    readingCard: {
        marginBottom: 12,
        padding: 14,
        borderRadius: 10,
        borderLeftWidth: 5,
        backgroundColor: 'rgba(255,255,255,0.04)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    readingTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.3,
        color: '#1a1a1a',
    },
    readingText: {
        fontSize: 13,
        lineHeight: 20,
        opacity: 1,
        color: '#333333',
        fontWeight: '500',
    },
});
