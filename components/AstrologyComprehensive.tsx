import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, Pressable } from 'react-native';
import { Svg, Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { getWesternBirthChart, BirthChartData, getDailyHoroscope } from '../src/data/utils/astrology-api';
import { getChineseZodiac, getChineseElement, getChineseYinYang, getLuckyNumbers, dateToRomanNumerals, getAgeInDogYears } from '../src/data/utils/astrology-utils';
import { calculateLifePath } from '../src/data/utils/life-path-calculator';
import { calculateNatalChart } from '../src/data/utils/natal-chart-calculator';
import { getZodiacInfo } from '../src/data/utils/zodiac-database';
import { birthstoneFromISO } from '../src/data/utils/birthstone';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
const LANDSCAPE_WIDTH = 3300;
const LANDSCAPE_HEIGHT = 2550;

type Props = {
    theme: ThemeName;
    babyName: string;
    dobISO: string;
    timeOfBirth: string; // HH:MM format
    latitude: number;
    longitude: number;
    hometown: string;
    zodiacSign: string;
    previewScale?: number;
};

export default function AstrologyComprehensive(props: Props) {
    const {
        theme,
        babyName,
        dobISO,
        timeOfBirth,
        latitude,
        longitude,
        hometown,
        zodiacSign,
        previewScale = 0.2,
    } = props;

    const [chartData, setChartData] = useState<BirthChartData | null>(null);
    const [horoscope, setHoroscope] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [zoomedQuadrant, setZoomedQuadrant] = useState<number | null>(null);
    const lastTapRef = useRef<{ quadrant: number; time: number } | null>(null);

    const handleDoubleTap = (quadrant: number) => {
        const now = Date.now();
        const lastTap = lastTapRef.current;

        if (lastTap && lastTap.quadrant === quadrant && now - lastTap.time < 300) {
            // Double tap detected
            setZoomedQuadrant(quadrant);
            lastTapRef.current = null;
        } else {
            // First tap or timeout
            lastTapRef.current = { quadrant, time: now };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch birth chart
                const chart = await getWesternBirthChart(dobISO, timeOfBirth, latitude, longitude);
                setChartData(chart);

                // Fetch daily horoscope
                const horoscopeText = await getDailyHoroscope(zodiacSign);
                setHoroscope(horoscopeText || 'Horoscope not available');
            } catch (error) {
                console.error('Failed to fetch astrology data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dobISO, timeOfBirth, latitude, longitude, zodiacSign]);

    const colors = COLOR_SCHEMES[theme];
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    // Match SignFrontLandscape border styling
    const borderWidth = Math.round(displayWidth * 0.02);
    const padding = Math.round(displayWidth * 0.01);
    const titleSize = Math.round(displayWidth * 0.025);
    const headerSize = Math.round(displayWidth * 0.02);
    const bodySize = Math.round(displayWidth * 0.014);
    const labelSize = Math.round(displayWidth * 0.012);
    const smallSize = Math.round(displayWidth * 0.01);

    // Calculate natal chart
    const birthDateObj = new Date(dobISO);
    const natalChart = useMemo(() => {
        return calculateNatalChart(birthDateObj, latitude, longitude);
    }, [dobISO, latitude, longitude]);

    // Calculate all astrology data
    const birthDate = new Date(dobISO);
    const year = birthDate.getFullYear();
    const chineseZodiac = getChineseZodiac(year);
    const chineseElement = getChineseElement(year);
    const chineseYinYang = getChineseYinYang(year);
    const luckyNumbers = getLuckyNumbers(dobISO);
    const lifePathResult = calculateLifePath(dobISO);
    const romanDate = dateToRomanNumerals(dobISO);
    const dogYears = getAgeInDogYears(dobISO);
    const birthstone = birthstoneFromISO(dobISO);
    const zodiacInfo = getZodiacInfo(zodiacSign);
    const formattedDate = birthDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Natal chart rendering function
    const renderNatalChartWheel = () => {
        const svgSize = displayHeight * 0.375; // 50% smaller - was 0.75, now 0.375
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
        const planetSymbols: any = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' };

        const degToRad = (deg: number) => (deg * Math.PI) / 180;
        const positionOnCircle = (lng: number, radius: number) => {
            const rad = degToRad(lng - 90);
            return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
        };

        return (
            <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                {/* Outer circle */}
                <Circle cx={cx} cy={cy} r={r_outer} fill="none" stroke="#FFFFFF" strokeWidth={svgSize * 0.004} opacity="0.6" />

                {/* Zodiac band */}
                <Circle cx={cx} cy={cy} r={r_sign_outer} fill="none" stroke="#FFFFFF" strokeWidth={svgSize * 0.003} opacity="0.4" />
                <Circle cx={cx} cy={cy} r={r_sign_inner} fill="none" stroke="#FFFFFF" strokeWidth={svgSize * 0.003} opacity="0.4" />

                {/* House circles */}
                <Circle cx={cx} cy={cy} r={r_house_out} fill="none" stroke="#4ECDC4" strokeWidth={svgSize * 0.002} opacity="0.3" />
                <Circle cx={cx} cy={cy} r={r_house_in} fill="none" stroke="#4ECDC4" strokeWidth={svgSize * 0.002} opacity="0.3" />

                {/* Inner circle */}
                <Circle cx={cx} cy={cy} r={r_inner} fill="none" stroke="#FFFFFF" strokeWidth={svgSize * 0.003} opacity="0.4" />

                {/* Zodiac boundaries */}
                {zodiacSigns.map((_, i) => {
                    const outer = positionOnCircle(i * 30, r_sign_outer);
                    const inner = positionOnCircle(i * 30, r_sign_inner);
                    return (
                        <Line
                            key={`zodiac-line-${i}`}
                            x1={outer.x} y1={outer.y}
                            x2={inner.x} y2={inner.y}
                            stroke="#FFFFFF"
                            strokeWidth={svgSize * 0.003}
                            opacity="0.4"
                        />
                    );
                })}

                {/* Zodiac signs */}
                {zodiacSigns.map((sign, i) => {
                    const angle = i * 30;
                    const pos = positionOnCircle(angle + 15, r_sign_outer + svgSize * 0.035);
                    return (
                        <SvgText
                            key={`sign-${i}`}
                            x={pos.x} y={pos.y}
                            fontSize={svgSize * 0.04}
                            fontWeight="800"
                            fill={colors.text}
                            textAnchor="middle"
                            opacity="0.9"
                        >
                            {signSymbols[i]}
                        </SvgText>
                    );
                })}

                {/* Houses */}
                {natalChart.houses.map((house: any, i: number) => {
                    const outer = positionOnCircle(house.cusp, r_house_out);
                    const inner = positionOnCircle(house.cusp, r_house_in);
                    const labelPos = positionOnCircle(house.cusp + 15, (r_house_out + r_house_in) / 2);
                    return (
                        <G key={`house-${i}`}>
                            <Line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                                stroke="#4ECDC4" strokeWidth={svgSize * 0.003} opacity="0.5" />
                            <SvgText x={labelPos.x} y={labelPos.y} fontSize={svgSize * 0.025}
                                fill={colors.text} textAnchor="middle" opacity="0.7">
                                {i + 1}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Planets */}
                {natalChart.planets.map((planet: any, i: number) => {
                    const pos = positionOnCircle(planet.longitude, r_planet);
                    return (
                        <G key={`planet-${i}`}>
                            <Circle cx={pos.x} cy={pos.y} r={svgSize * 0.015}
                                fill="rgba(255,255,255,0.2)" stroke={colors.text} strokeWidth={svgSize * 0.002} />
                            <SvgText x={pos.x} y={pos.y + svgSize * 0.006}
                                fontSize={svgSize * 0.028} fontWeight="bold"
                                fill={colors.text} textAnchor="middle">
                                {planetSymbols[planet.name] || planet.name[0]}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Ascendant marker */}
                {(() => {
                    const ascPos = positionOnCircle(natalChart.ascendant, r_outer + svgSize * 0.02);
                    return (
                        <G>
                            <Line x1={cx} y1={cy} x2={ascPos.x} y2={ascPos.y}
                                stroke="#FFD700" strokeWidth={svgSize * 0.004} opacity="0.7" />
                            <SvgText x={ascPos.x} y={ascPos.y}
                                fontSize={svgSize * 0.035} fontWeight="bold"
                                fill="#FFD700" textAnchor="middle">
                                ↑
                            </SvgText>
                        </G>
                    );
                })()}

                {/* Center point */}
                <Circle cx={cx} cy={cy} r={svgSize * 0.008} fill={colors.text} />
            </Svg>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
                <View style={[styles.border, { borderWidth, borderColor: '#FFFFFF' }]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: padding * 2 }}>
                        <Text style={{ color: colors.text, fontSize: titleSize, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                            ✨ Gathering Celestial Wisdom ✨
                        </Text>
                        <Text style={{ color: colors.text, fontSize: bodySize, textAlign: 'center', opacity: 0.8, lineHeight: bodySize * 1.6 }}>
                            Calculating your complete astrological profile...
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
            {/* White border extending to edges - like SignFrontLandscape */}
            <View style={[styles.border, { borderWidth, borderColor: '#FFFFFF' }]}>
                <View style={[styles.content, { padding: padding * 1.5 }]}>
                    {/* Title Header */}
                    <View style={{ alignItems: 'center', marginBottom: padding * 0.5 }}>
                        <Text style={{ fontSize: titleSize * 0.9, color: colors.text, letterSpacing: 2, fontWeight: 'bold' }}>
                            ✦ COMPLETE ASTROLOGY PROFILE ✦
                        </Text>
                        <View style={{ width: '30%', height: 1.5, backgroundColor: colors.text, marginVertical: padding * 0.2, opacity: 0.4 }} />
                        <Text style={{ fontSize: titleSize * 1.1, color: colors.text, fontWeight: 'bold' }}>
                            {babyName}
                        </Text>
                        <Text style={{ fontSize: bodySize * 0.9, color: colors.text, opacity: 0.85, marginTop: padding * 0.15 }}>
                            {formattedDate}
                        </Text>
                    </View>

                    {/* 4-Container Grid Layout: 2x2 */}
                    <View style={{ flex: 1, flexDirection: 'row', gap: padding }}>
                        {/* Left Column */}
                        <View style={{ flex: 1, gap: padding }}>
                            {/* Container 1: Natal Chart */}
                            <Pressable onPress={() => handleDoubleTap(1)} style={{ flex: 1.2 }}>
                                <View style={[styles.containerBox, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', padding: padding * 0.8 }]}>
                                    <Text style={[styles.containerTitle, { fontSize: headerSize * 0.95, color: colors.text, marginBottom: padding * 0.3 }]}>
                                        🌟 Natal Chart Wheel
                                    </Text>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        {renderNatalChartWheel()}
                                    </View>
                                </View>
                            </Pressable>

                            {/* Container 3: Love Life */}
                            <Pressable onPress={() => handleDoubleTap(3)} style={{ flex: 0.8 }}>
                                <View style={[styles.containerBox, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', padding: padding * 0.8 }]}>
                                    <Text style={[styles.containerTitle, { fontSize: headerSize * 0.95, color: colors.text, marginBottom: padding * 0.3 }]}>
                                        ❤️ Love & Relationships
                                    </Text>
                                    <ScrollView>
                                        <Text style={{ fontSize: bodySize * 0.9, color: colors.text, lineHeight: bodySize * 1.4, opacity: 0.95 }}>
                                            {zodiacInfo?.loveLife || 'Love life information not available.'}
                                        </Text>
                                    </ScrollView>
                                </View>
                            </Pressable>
                        </View>

                        {/* Right Column */}
                        <View style={{ flex: 1, gap: padding }}>
                            {/* Container 2: Basic Info */}
                            <Pressable onPress={() => handleDoubleTap(2)} style={{ flex: 1 }}>
                                <View style={[styles.containerBox, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', padding: padding * 0.8 }]}>
                                    <Text style={[styles.containerTitle, { fontSize: headerSize * 0.95, color: colors.text, marginBottom: padding * 0.4 }]}>
                                        ℹ️ Birth Information
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: padding * 0.5 }}>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Zodiac Sign:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{zodiacSign}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Chinese Animal:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{chineseElement} {chineseZodiac}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Life Path Number:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{lifePathResult.number}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Birthstone:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{birthstone}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Element:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{zodiacInfo?.element}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>Lucky Day:</Text>
                                            <Text style={{ fontSize: bodySize * 0.95, color: colors.text, fontWeight: 'bold' }}>{zodiacInfo?.day}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: 2 }}>DOB (Roman):</Text>
                                            <Text style={{ fontSize: bodySize * 0.85, color: colors.text, fontWeight: 'bold' }}>{romanDate}</Text>
                                        </View>
                                        <View style={{ width: '100%', marginTop: padding * 0.2 }}>
                                            <Text style={{ fontSize: labelSize * 0.95, color: colors.text, opacity: 0.7, marginBottom: padding * 0.15 }}>Lucky Numbers:</Text>
                                            <View style={{ flexDirection: 'row', gap: padding * 0.2, flexWrap: 'wrap' }}>
                                                {luckyNumbers.map((num, idx) => (
                                                    <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: padding * 0.25, paddingVertical: padding * 0.12, borderRadius: 4 }}>
                                                        <Text style={{ fontSize: bodySize * 0.9, color: colors.text, fontWeight: 'bold' }}>{num}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>

                            {/* Container 4: Zodiac Knowledge */}
                            <Pressable onPress={() => handleDoubleTap(4)} style={{ flex: 1 }}>
                                <View style={[styles.containerBox, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', padding: padding * 0.8 }]}>
                                    <Text style={[styles.containerTitle, { fontSize: headerSize * 0.95, color: colors.text, marginBottom: padding * 0.4 }]}>
                                        🔮 {zodiacSign} Traits
                                    </Text>
                                    <ScrollView>
                                        <View style={{ gap: padding * 0.35 }}>
                                            <View>
                                                <Text style={{ fontSize: labelSize * 0.95, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: padding * 0.08 }}>✨ Strengths:</Text>
                                                <Text style={{ fontSize: smallSize * 0.95, color: colors.text, lineHeight: smallSize * 1.35, opacity: 0.85 }}>
                                                    {zodiacInfo?.strengths}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: labelSize * 0.95, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: padding * 0.08 }}>⚠️ Weaknesses:</Text>
                                                <Text style={{ fontSize: smallSize * 0.95, color: colors.text, lineHeight: smallSize * 1.35, opacity: 0.85 }}>
                                                    {zodiacInfo?.weaknesses}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: labelSize * 0.95, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: padding * 0.08 }}>💚 Likes:</Text>
                                                <Text style={{ fontSize: smallSize * 0.95, color: colors.text, lineHeight: smallSize * 1.35, opacity: 0.85 }}>
                                                    {zodiacInfo?.likes}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: labelSize * 0.95, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: padding * 0.08 }}>💔 Dislikes:</Text>
                                                <Text style={{ fontSize: smallSize * 0.95, color: colors.text, lineHeight: smallSize * 1.35, opacity: 0.85 }}>
                                                    {zodiacInfo?.dislikes}
                                                </Text>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </Pressable>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={{ alignItems: 'center', marginTop: padding * 0.6, paddingTop: padding * 0.3, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <Text style={{ fontSize: smallSize, color: colors.text, opacity: 0.7 }}>
                            Ruler: {zodiacInfo?.ruler} • Color: {zodiacInfo?.color} • Quality: {zodiacInfo?.quality} • Compatibility: {zodiacInfo?.compatibility}
                        </Text>
                        <Text style={{ fontSize: smallSize * 0.6, color: colors.text, opacity: 0.5, marginTop: padding * 0.15 }}>
                            www.populationplus.one
                        </Text>
                    </View>
                </View>
            </View>

            {/* Zoom Modal */}
            <Modal
                visible={zoomedQuadrant !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setZoomedQuadrant(null)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setZoomedQuadrant(null)}
                >
                    <View style={{ width: '90%', height: '85%', backgroundColor: colors.bg, borderRadius: 12, borderWidth: 3, borderColor: '#FFFFFF', padding: 20 }}>
                        {/* Close button */}
                        <Pressable
                            onPress={() => setZoomedQuadrant(null)}
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>✕</Text>
                        </Pressable>

                        {/* Zoomed Content */}
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
                            {zoomedQuadrant === 1 && (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: titleSize * 1.5, color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
                                        🌟 Natal Chart Wheel
                                    </Text>
                                    <View style={{ transform: [{ scale: 2.5 }], marginVertical: 100 }}>
                                        {renderNatalChartWheel()}
                                    </View>
                                </View>
                            )}

                            {zoomedQuadrant === 2 && (
                                <View>
                                    <Text style={{ fontSize: titleSize * 1.5, color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
                                        ℹ️ Birth Information
                                    </Text>
                                    <View style={{ gap: 15 }}>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Zodiac Sign:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{zodiacSign}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Chinese Animal:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{chineseElement} {chineseZodiac}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Life Path Number:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{lifePathResult.number}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Birthstone:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{birthstone}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Element:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{zodiacInfo?.element}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>Lucky Day:</Text>
                                            <Text style={{ fontSize: bodySize * 2, color: colors.text, fontWeight: 'bold' }}>{zodiacInfo?.day}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7 }}>DOB (Roman):</Text>
                                            <Text style={{ fontSize: bodySize * 1.8, color: colors.text, fontWeight: 'bold' }}>{romanDate}</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 2, color: colors.text, opacity: 0.7, marginBottom: 10 }}>Lucky Numbers:</Text>
                                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                                                {luckyNumbers.map((num, idx) => (
                                                    <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 }}>
                                                        <Text style={{ fontSize: bodySize * 1.8, color: colors.text, fontWeight: 'bold' }}>{num}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {zoomedQuadrant === 3 && (
                                <View>
                                    <Text style={{ fontSize: titleSize * 1.5, color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
                                        ❤️ Love & Relationships
                                    </Text>
                                    <Text style={{ fontSize: bodySize * 1.8, color: colors.text, lineHeight: bodySize * 2.6, opacity: 0.95 }}>
                                        {zodiacInfo?.loveLife || 'Love life information not available.'}
                                    </Text>
                                </View>
                            )}

                            {zoomedQuadrant === 4 && (
                                <View>
                                    <Text style={{ fontSize: titleSize * 1.5, color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
                                        🔮 {zodiacSign} Traits
                                    </Text>
                                    <View style={{ gap: 20 }}>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 1.8, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 }}>✨ Strengths:</Text>
                                            <Text style={{ fontSize: bodySize * 1.5, color: colors.text, lineHeight: bodySize * 2.2, opacity: 0.85 }}>
                                                {zodiacInfo?.strengths}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 1.8, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 }}>⚠️ Weaknesses:</Text>
                                            <Text style={{ fontSize: bodySize * 1.5, color: colors.text, lineHeight: bodySize * 2.2, opacity: 0.85 }}>
                                                {zodiacInfo?.weaknesses}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 1.8, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 }}>💚 Likes:</Text>
                                            <Text style={{ fontSize: bodySize * 1.5, color: colors.text, lineHeight: bodySize * 2.2, opacity: 0.85 }}>
                                                {zodiacInfo?.likes}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: labelSize * 1.8, color: colors.text, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 }}>💔 Dislikes:</Text>
                                            <Text style={{ fontSize: bodySize * 1.5, color: colors.text, lineHeight: bodySize * 2.2, opacity: 0.85 }}>
                                                {zodiacInfo?.dislikes}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
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
        borderRadius: 0, // Square edges like SignFrontLandscape
    },
    content: {
        flex: 1,
    },
    containerBox: {
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
    },
    containerTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    sectionTitle: {
        fontWeight: 'bold',
        opacity: 0.95,
    },
});
