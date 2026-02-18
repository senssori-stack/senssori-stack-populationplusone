import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Svg, Circle, Line, Text as SvgText, G, Path, Defs, Stop, LinearGradient, Rect } from 'react-native-svg';
import type { ThemeName } from '../types';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';

interface NatalChartViewProps {
    birthDate: Date;
    hometown?: string;
    theme?: ThemeName;
    latitude?: number;
    longitude?: number;
    previewScale?: number;
}

export default function NatalChartView({
    birthDate,
    hometown = 'Birth Location',
    theme = 'green',
    latitude = 40.7128,
    longitude = -74.0060,
    previewScale = 1
}: NatalChartViewProps) {
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;
    const { width: screenWidth } = useWindowDimensions();

    // Mobile-optimized sizing
    const svgSize = Math.min(900, screenWidth - 40);

    const natalChart = useMemo(() => {
        return calculateNatalChart(birthDate, latitude, longitude);
    }, [birthDate, latitude, longitude]);

    // Scale-aware sizing
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

    // Render zodiac signs with modern styling
    const renderZodiacSigns = () => {
        return zodiacSigns.map((sign, i) => {
            const angle = i * 30;
            const pos = positionOnCircle(angle + 15, r_sign_outer + svgSize * 0.04);
            return (
                <G key={`sign-${i}`}>
                    {/* Sign background */}
                    <Circle cx={pos.x} cy={pos.y} r={svgSize * 0.025} fill="#1a1a1a" opacity="0.8" />
                    {/* Sign text */}
                    <SvgText
                        x={pos.x}
                        y={pos.y}
                        fontSize={String(svgSize * 0.045)}
                        fontWeight="800"
                        fill="#000000"
                        textAnchor="middle"
                    >
                        {signSymbols[i]}
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

    // Render house divisions
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
                    opacity="0.5"
                />
            );
        }
        return lines;
    };

    // Render planets with large glyphs
    const renderPlanets = () => {
        return natalChart.planets.slice(0, 10).map((planet) => {
            const pos = positionOnCircle(planet.longitude, r_planet);
            const planetColors: any = {
                'Sun': '#FF6B35', 'Moon': '#C0C5CE', 'Mercury': '#4ECDC4', 'Venus': '#FF6B9D',
                'Mars': '#C44569', 'Jupiter': '#6C5CE7', 'Saturn': '#4A4E69', 'Uranus': '#00BFA5',
                'Neptune': '#3F51B5', 'Pluto': '#2C2E3E'
            };
            const planetColor = planetColors[planet.name] || colors.accent;

            return (
                <G key={`planet-${planet.name}`}>
                    {/* Planet circle background */}
                    <Circle cx={pos.x} cy={pos.y} r={svgSize * 0.035} fill={planetColor} opacity="0.2" stroke={planetColor} strokeWidth={String(svgSize * 0.004)} />
                    {/* Planet glyph - LARGE */}
                    <SvgText
                        x={pos.x}
                        y={pos.y}
                        fontSize={String(svgSize * 0.11)}
                        fontWeight="400"
                        fill={planetColor}
                        textAnchor="middle"
                        fontFamily="serif"
                    >
                        {planet.symbol}
                    </SvgText>
                    {/* Retrograde indicator */}
                    {planet.retrograde && (
                        <SvgText
                            x={pos.x + svgSize * 0.03}
                            y={pos.y + svgSize * 0.03}
                            fontSize={String(svgSize * 0.03)}
                            fontWeight="bold"
                            fill={planetColor}
                            textAnchor="middle"
                        >
                            R
                        </SvgText>
                    )}
                </G>
            );
        });
    };

    // Render ascendant marker
    const renderAscendant = () => {
        const pos = positionOnCircle(natalChart.ascendant, r_sign_outer + svgSize * 0.02);
        return (
            <G key="ascendant-marker">
                {/* Triangle marker */}
                <Path
                    d={`M ${pos.x} ${pos.y - svgSize * 0.03} L ${pos.x - svgSize * 0.025} ${pos.y + svgSize * 0.02} L ${pos.x + svgSize * 0.025} ${pos.y + svgSize * 0.02} Z`}
                    fill="#FFD700"
                    stroke="#000000"
                    strokeWidth={String(svgSize * 0.003)}
                />
                {/* Line to center */}
                <Line
                    x1={pos.x}
                    y1={pos.y}
                    x2={cx}
                    y2={cy}
                    stroke="#FFD700"
                    strokeWidth={String(svgSize * 0.002)}
                    opacity="0.5"
                    strokeDasharray={`${svgSize * 0.01},${svgSize * 0.008}`}
                />
            </G>
        );
    };

    // Render major aspects
    const renderAspects = () => {
        const aspectColors: any = {
            'conjunction': '#FF6B6B',
            'sextile': '#4ECDC4',
            'square': '#FFE66D',
            'trine': '#95E1D3',
            'opposition': '#FF6B6B'
        };

        const major = natalChart.aspects.filter((a: any) =>
            ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
        );

        return major.slice(0, 15).map((aspect: any, i: number) => {
            const p1 = natalChart.planets.find((p: any) => p.name === aspect.planet1);
            const p2 = natalChart.planets.find((p: any) => p.name === aspect.planet2);
            if (!p1 || !p2) return null;

            const pos1 = positionOnCircle(p1.longitude, r_planet);
            const pos2 = positionOnCircle(p2.longitude, r_planet);
            const color = aspectColors[aspect.type] || '#999999';

            return (
                <Line
                    key={`aspect-${i}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke={color}
                    strokeWidth={String(svgSize * 0.003)}
                    opacity="0.4"
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>Natal Chart</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    {birthDate.toLocaleDateString()} • {hometown}
                </Text>
            </View>

            <View style={[styles.chartContainer, { width: svgSize + 20, height: svgSize + 20 }]}>
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

                    {/* Zodiac signs */}
                    {renderZodiacSigns()}

                    {/* Aspect lines */}
                    {renderAspects()}

                    {/* Planets */}
                    {renderPlanets()}

                    {/* Ascendant marker */}
                    {renderAscendant()}

                    {/* Center point */}
                    <Circle cx={cx} cy={cy} r={svgSize * 0.01} fill="#000000" />
                </Svg>
            </View>

            <View style={styles.infoPanelTop}>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>☉ Sun</Text>
                    <Text style={[styles.infoValue, { color: colors.accent }]}>{natalChart.planets[0]?.zodiac}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>☽ Moon</Text>
                    <Text style={[styles.infoValue, { color: colors.accent }]}>{natalChart.planets[1]?.zodiac}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>↑ ASC</Text>
                    <Text style={[styles.infoValue, { color: colors.accent }]}>{natalChart.ascendantZodiac}</Text>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.colorDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Ascendant</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.colorDot, { backgroundColor: '#4ECDC4' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Houses</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.colorDot, { backgroundColor: '#95E1D3' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Aspects</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleSection: {
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 13,
        opacity: 0.7,
        fontWeight: '500',
    },
    chartContainer: {
        marginVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoPanelTop: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 16,
        paddingHorizontal: 16,
        width: '100%',
    },
    infoRow: {
        alignItems: 'center',
        gap: 4,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.7,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 8,
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '500',
    },
});

