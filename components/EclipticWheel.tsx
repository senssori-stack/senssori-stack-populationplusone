import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

// ── Astronomically accurate constellation star patterns ──
// Each constellation: eclipticLongitude (center of its 30° segment),
// stars as [x,y] offsets from center (normalized -1..1 scale),
// lines connecting stars (index pairs)
const CONSTELLATIONS = [
    {
        name: 'Aries', symbol: '♈', lon: 15, element: 'Fire', color: '#FF6B6B',
        dates: 'Mar 21 – Apr 19',
        stars: [[0, -0.6], [0.3, -0.2], [0.5, 0.1], [0.3, 0.4]],
        lines: [[0, 1], [1, 2], [2, 3]],
    },
    {
        name: 'Taurus', symbol: '♉', lon: 45, element: 'Earth', color: '#8BC34A',
        dates: 'Apr 20 – May 20',
        stars: [[-0.5, -0.3], [-0.2, -0.1], [0, 0], [0.3, -0.2], [0.5, -0.4], [0.2, 0.2], [0.4, 0.4]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]],
    },
    {
        name: 'Gemini', symbol: '♊', lon: 75, element: 'Air', color: '#64B5F6',
        dates: 'May 21 – Jun 20',
        stars: [[-0.3, -0.6], [-0.3, -0.2], [-0.3, 0.2], [-0.3, 0.5], [0.3, -0.6], [0.3, -0.2], [0.3, 0.2], [0.3, 0.5]],
        lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5]],
    },
    {
        name: 'Cancer', symbol: '♋', lon: 105, element: 'Water', color: '#4FC3F7',
        dates: 'Jun 21 – Jul 22',
        stars: [[-0.3, -0.4], [0, -0.1], [0.3, 0.1], [0.1, 0.4], [-0.2, 0.3]],
        lines: [[0, 1], [1, 2], [1, 3], [3, 4]],
    },
    {
        name: 'Leo', symbol: '♌', lon: 135, element: 'Fire', color: '#FFD54F',
        dates: 'Jul 23 – Aug 22',
        stars: [[-0.4, -0.3], [-0.1, -0.5], [0.2, -0.3], [0.4, -0.1], [0.3, 0.2], [0, 0.3], [-0.3, 0.1]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
    },
    {
        name: 'Virgo', symbol: '♍', lon: 165, element: 'Earth', color: '#A5D6A7',
        dates: 'Aug 23 – Sep 22',
        stars: [[-0.4, -0.4], [-0.1, -0.2], [0.2, -0.4], [0.1, 0], [-0.2, 0.2], [0.3, 0.2], [0.1, 0.5]],
        lines: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [5, 6]],
    },
    {
        name: 'Libra', symbol: '♎', lon: 195, element: 'Air', color: '#90CAF9',
        dates: 'Sep 23 – Oct 22',
        stars: [[-0.3, -0.3], [0.3, -0.3], [0, 0], [-0.2, 0.4], [0.2, 0.4]],
        lines: [[0, 2], [1, 2], [2, 3], [2, 4]],
    },
    {
        name: 'Scorpius', symbol: '♏', lon: 225, element: 'Water', color: '#CE93D8',
        dates: 'Oct 23 – Nov 21',
        stars: [[-0.5, -0.2], [-0.3, 0], [-0.1, -0.1], [0.1, 0.1], [0.2, 0.3], [0.35, 0.4], [0.5, 0.3], [0.55, 0.15]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    },
    {
        name: 'Sagittarius', symbol: '♐', lon: 255, element: 'Fire', color: '#FF8A65',
        dates: 'Nov 22 – Dec 21',
        stars: [[-0.3, 0.3], [0, 0], [0.3, -0.3], [0.1, 0.3], [-0.1, -0.3], [0.3, 0.1], [-0.3, -0.1]],
        lines: [[0, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]],
    },
    {
        name: 'Capricorn', symbol: '♑', lon: 285, element: 'Earth', color: '#A1887F',
        dates: 'Dec 22 – Jan 19',
        stars: [[-0.4, -0.2], [-0.1, -0.4], [0.2, -0.2], [0.4, 0], [0.2, 0.3], [-0.1, 0.4], [-0.3, 0.2]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    },
    {
        name: 'Aquarius', symbol: '♒', lon: 315, element: 'Air', color: '#80DEEA',
        dates: 'Jan 20 – Feb 18',
        stars: [[-0.4, -0.3], [-0.1, -0.2], [0.2, -0.3], [0.1, 0], [-0.2, 0.1], [0, 0.4], [0.3, 0.3]],
        lines: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [5, 6]],
    },
    {
        name: 'Pisces', symbol: '♓', lon: 345, element: 'Water', color: '#B39DDB',
        dates: 'Feb 19 – Mar 20',
        stars: [[-0.4, -0.2], [-0.2, 0], [0, -0.2], [0.1, 0.1], [0.3, -0.1], [0.4, 0.2]],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    },
];

const ELEMENT_COLORS: Record<string, string> = {
    Fire: '#FF6B6B',
    Earth: '#8BC34A',
    Air: '#64B5F6',
    Water: '#4FC3F7',
};

interface EclipticWheelProps {
    width: number;
    /** Days since J2000.0 epoch */
    daysSinceJ2000: number;
    /** The user's Sun sign (zodiac name) to highlight */
    userSign?: string;
    /** Called when user drags Earth — passes new day offset (delta days from current) */
    onDaysChange?: (newDaysSinceJ2000: number) => void;
}

export default function EclipticWheel({ width, daysSinceJ2000, userSign, onDaysChange }: EclipticWheelProps) {
    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const height = width * 0.85;
    const cx = width / 2;
    const cy = height * 0.48;

    // Ecliptic ellipse radii (perspective tilt — wider than tall)
    const rx = width * 0.40;
    const ry = height * 0.22;

    // Constellation ring (outer) — where star patterns sit
    const constellationR = width * 0.46;

    // Earth's ecliptic longitude — accurate mean longitude from J2000
    // L0 = 100.46° at J2000, rate = 0.9856°/day
    const earthLon = ((100.46 + 0.9856 * daysSinceJ2000) % 360 + 360) % 360;

    const dRad = (deg: number) => (deg * Math.PI) / 180;

    // Project a point on the ecliptic ellipse given ecliptic longitude
    const eclipticXY = (lon: number) => {
        const rad = dRad(lon - 90); // -90 to put 0° Aries at top
        return {
            x: cx + rx * Math.cos(rad),
            y: cy + ry * Math.sin(rad),
        };
    };

    // Earth position on the ellipse
    const earthPos = eclipticXY(earthLon);

    // ── Drag Earth around the orbit ──
    const lastAngleRef = useRef<number | null>(null);
    const daysAccumRef = useRef(daysSinceJ2000);
    daysAccumRef.current = daysSinceJ2000;

    const earthPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !!onDaysChange,
            onMoveShouldSetPanResponder: (_, gs) =>
                !!onDaysChange && (Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4),
            onPanResponderGrant: () => {
                lastAngleRef.current = null;
                setIsDragging(true);
            },
            onPanResponderMove: (evt) => {
                if (!onDaysChange) return;
                const { locationX, locationY } = evt.nativeEvent;
                const angle = Math.atan2(locationY - cy, locationX - cx) * (180 / Math.PI);
                if (lastAngleRef.current !== null) {
                    let delta = angle - lastAngleRef.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    // Convert degrees of orbit to days (360° = 365.25 days)
                    const daysDelta = delta / (360 / 365.25);
                    onDaysChange(daysAccumRef.current + daysDelta);
                }
                lastAngleRef.current = angle;
            },
            onPanResponderRelease: () => {
                lastAngleRef.current = null;
                setIsDragging(false);
            },
            onPanResponderTerminate: () => {
                lastAngleRef.current = null;
                setIsDragging(false);
            },
        })
    ).current;

    // Moon position (tiny orbit around Earth)
    const moonLon = ((218.32 + 13.1764 * daysSinceJ2000) % 360 + 360) % 360;
    const moonOrbitR = 8;
    const moonRad = dRad(moonLon);
    const moonX = earthPos.x + moonOrbitR * Math.cos(moonRad);
    const moonY = earthPos.y + moonOrbitR * Math.sin(moonRad);

    // The currently selected constellation data
    const selectedData = selectedSign ? CONSTELLATIONS.find(c => c.name === selectedSign) : null;

    // Determine which constellation Earth is "in" (from heliocentric perspective, 
    // the Sun appears to be in the sign opposite Earth)
    const sunApparentLon = (earthLon + 180) % 360;
    const currentSignIdx = Math.floor(sunApparentLon / 30) % 12;
    const currentSign = CONSTELLATIONS[currentSignIdx];

    return (
        <View style={eclStyles.container}>
            {/* Title & explanation */}
            <Text style={eclStyles.title}>🌌 The Ecliptic — Zodiac Belt</Text>
            <Text style={eclStyles.subtitle}>
                The ecliptic is the Sun's apparent path through the sky as seen from Earth.
                The 12 zodiac constellations sit along this belt. As Earth orbits the Sun,
                different constellations appear behind the Sun throughout the year.
            </Text>

            {/* SVG Wheel — draggable */}
            <View style={{ alignItems: 'center' }} {...earthPanResponder.panHandlers}>
                <Svg width={width} height={height + 10}>
                    <Defs>
                        <RadialGradient id="sunGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#FFF176" stopOpacity={1} />
                            <Stop offset="40%" stopColor="#FFD54F" stopOpacity={0.8} />
                            <Stop offset="70%" stopColor="#FFB300" stopOpacity={0.3} />
                            <Stop offset="100%" stopColor="#FFB300" stopOpacity={0} />
                        </RadialGradient>
                    </Defs>

                    {/* Deep space background */}
                    <Circle cx={cx} cy={cy} r={width * 0.49} fill="#03030f" />

                    {/* Subtle background stars */}
                    {Array.from({ length: 60 }, (_, i) => {
                        const sx = Math.random() * width;
                        const sy = Math.random() * height;
                        const sr = 0.3 + Math.random() * 0.7;
                        return <Circle key={`bg-${i}`} cx={sx} cy={sy} r={sr} fill="rgba(255,255,255,0.3)" />;
                    })}

                    {/* 30° segment dividers on ecliptic (faint) */}
                    {CONSTELLATIONS.map((c, i) => {
                        const startAngle = c.lon - 15;
                        const p1 = eclipticXY(startAngle);
                        // Extend outward for divider line
                        const rad = dRad(startAngle - 90);
                        const outerX = cx + constellationR * Math.cos(rad);
                        const outerY = cy + constellationR * 0.65 * Math.sin(rad);
                        return (
                            <Line key={`div-${i}`}
                                x1={p1.x} y1={p1.y}
                                x2={outerX} y2={outerY}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth={0.5}
                            />
                        );
                    })}

                    {/* Ecliptic ellipse — the orbital path */}
                    <Ellipse cx={cx} cy={cy} rx={rx} ry={ry}
                        fill="none" stroke="rgba(100,149,237,0.5)" strokeWidth={1.2} />
                    {/* Second ring for depth/perspective */}
                    <Ellipse cx={cx} cy={cy} rx={rx + 2} ry={ry + 1}
                        fill="none" stroke="rgba(100,149,237,0.15)" strokeWidth={0.5} />

                    {/* Direction arrows on ecliptic */}
                    {[45, 135, 225, 315].map(a => {
                        const p = eclipticXY(a);
                        const p2 = eclipticXY(a + 3);
                        return (
                            <G key={`arrow-${a}`}>
                                <Line x1={p.x} y1={p.y} x2={p2.x} y2={p2.y}
                                    stroke="rgba(100,149,237,0.6)" strokeWidth={1.5} />
                                <SvgText x={p2.x} y={p2.y} fontSize={6} fill="rgba(100,149,237,0.6)"
                                    textAnchor="middle">▸</SvgText>
                            </G>
                        );
                    })}

                    {/* ☀️ SUN — at center with glow */}
                    <Circle cx={cx} cy={cy} r={55} fill="url(#sunGlow)" />
                    <Circle cx={cx} cy={cy} r={30} fill="#FFD54F" />
                    <Circle cx={cx} cy={cy} r={20} fill="#FFF176" />

                    {/* 🌍 EARTH — draggable on ecliptic */}
                    {/* Drag glow ring (visible when dragging OR as subtle hint) */}
                    <Circle cx={earthPos.x} cy={earthPos.y}
                        r={isDragging ? 27 : 18}
                        fill={isDragging ? 'rgba(79,195,247,0.12)' : 'rgba(79,195,247,0.05)'}
                        stroke={isDragging ? '#4FC3F7' : 'rgba(79,195,247,0.2)'}
                        strokeWidth={isDragging ? 1.5 : 0.8}
                        strokeDasharray={isDragging ? '' : '3,3'}
                    />
                    {/* Earth body */}
                    <Circle cx={earthPos.x} cy={earthPos.y} r={isDragging ? 12 : 9} fill="#1565C0" stroke="#4FC3F7" strokeWidth={isDragging ? 2 : 1.5} />
                    <Circle cx={earthPos.x} cy={earthPos.y} r={isDragging ? 7.5 : 5.25} fill="#4FC3F7" opacity={0.5} />
                    {/* Tiny green land patches */}
                    <Circle cx={earthPos.x - 1.5} cy={earthPos.y - 1.5} r={2.25} fill="#66BB6A" opacity={0.7} />
                    <Circle cx={earthPos.x + 3} cy={earthPos.y + 1.5} r={1.5} fill="#66BB6A" opacity={0.7} />

                    {/* 🌙 MOON — tiny orbit around Earth */}
                    <Circle cx={moonX} cy={moonY} r={2.5} fill="#E0E0E0" stroke="#bbb" strokeWidth={0.3} />

                    {/* Earth label */}
                    <SvgText x={earthPos.x} y={earthPos.y + (isDragging ? 21 : 18)} fontSize={isDragging ? 9 : 8} fontWeight="700"
                        fill="#4FC3F7" textAnchor="middle">{isDragging ? '👆 Drag me!' : 'Earth'}</SvgText>

                    {/* ── CONSTELLATION STAR PATTERNS ── */}
                    {CONSTELLATIONS.map((c) => {
                        const isSelected = selectedSign === c.name;
                        const isUserSign = userSign === c.name;
                        const isCurrent = currentSign.name === c.name;
                        const highlight = isSelected || isUserSign || isCurrent;

                        // Position constellation around the ecliptic ring
                        const rad = dRad(c.lon - 90);
                        const conX = cx + constellationR * Math.cos(rad);
                        const conY = cy + constellationR * 0.58 * Math.sin(rad);
                        const starScale = width * 0.035; // Size of star pattern

                        const starOpacity = highlight ? 1 : 0.6;
                        const lineOpacity = highlight ? 0.8 : 0.25;
                        const starColor = highlight ? c.color : '#ccc';
                        const nameColor = highlight ? c.color : 'rgba(255,255,255,0.7)';
                        const fontSize = highlight ? 9 : 7.5;

                        // Name position (slightly further out)
                        const nameR = constellationR * 1.08;
                        const nameX = cx + nameR * Math.cos(rad);
                        const nameY = cy + nameR * 0.58 * Math.sin(rad);

                        // Adjust text position based on angle to avoid overlapping the circle
                        const angleDeg = ((c.lon - 90) % 360 + 360) % 360;
                        const textAnchor = angleDeg > 90 && angleDeg < 270 ? 'end' : 'start';
                        const nameOffsetX = angleDeg > 90 && angleDeg < 270 ? -6 : 6;

                        return (
                            <G key={c.name} onPress={() => setSelectedSign(isSelected ? null : c.name)}>
                                {/* Highlight ring for current/user sign */}
                                {highlight && (
                                    <Circle cx={conX} cy={conY} r={starScale * 1.6}
                                        fill="none" stroke={c.color} strokeWidth={0.8}
                                        opacity={0.3} strokeDasharray="2,2" />
                                )}

                                {/* Constellation lines */}
                                {c.lines.map(([a, b], li) => (
                                    <Line key={`l${li}`}
                                        x1={conX + c.stars[a][0] * starScale}
                                        y1={conY + c.stars[a][1] * starScale}
                                        x2={conX + c.stars[b][0] * starScale}
                                        y2={conY + c.stars[b][1] * starScale}
                                        stroke={starColor} strokeWidth={0.8} opacity={lineOpacity}
                                    />
                                ))}

                                {/* Stars (dots) */}
                                {c.stars.map(([sx, sy], si) => (
                                    <Circle key={`s${si}`}
                                        cx={conX + sx * starScale}
                                        cy={conY + sy * starScale}
                                        r={highlight ? 2 : 1.3}
                                        fill={starColor} opacity={starOpacity}
                                    />
                                ))}

                                {/* Constellation name */}
                                <SvgText
                                    x={nameX + nameOffsetX} y={nameY}
                                    fontSize={fontSize} fontWeight={highlight ? '800' : '600'}
                                    fill={nameColor} textAnchor={textAnchor}
                                    alignmentBaseline="middle"
                                >
                                    {c.name}
                                </SvgText>

                                {/* Symbol near the ecliptic ring */}
                                {(() => {
                                    const symR = constellationR * 0.82;
                                    const symX = cx + symR * Math.cos(rad);
                                    const symY = cy + symR * 0.58 * Math.sin(rad);
                                    return (
                                        <SvgText x={symX} y={symY} fontSize={30} fontWeight="900"
                                            fill={highlight ? c.color : 'rgba(255,255,255,0.4)'}
                                            textAnchor="middle" alignmentBaseline="middle">
                                            {c.symbol}
                                        </SvgText>
                                    );
                                })()}
                            </G>
                        );
                    })}

                    {/* Line from Sun to Earth */}
                    <Line x1={cx} y1={cy} x2={earthPos.x} y2={earthPos.y}
                        stroke="rgba(255,213,79,0.2)" strokeWidth={0.5} strokeDasharray="3,3" />

                    {/* "Sun appears in ___" indicator line — opposite side from Earth */}
                    {(() => {
                        const oppositePos = eclipticXY(sunApparentLon);
                        return (
                            <Line x1={earthPos.x} y1={earthPos.y}
                                x2={oppositePos.x} y2={oppositePos.y}
                                stroke="rgba(255,213,79,0.15)" strokeWidth={0.5} strokeDasharray="2,4" />
                        );
                    })()}

                    {/* Center label */}
                    <SvgText x={cx} y={cy + 38} fontSize={9} fontWeight="700"
                        fill="#FFD54F" textAnchor="middle">Sun</SvgText>

                </Svg>
            </View>

            {/* Current position info */}
            <View style={eclStyles.infoBar}>
                <View style={[eclStyles.infoBadge, { backgroundColor: currentSign.color + '22', borderColor: currentSign.color }]}>
                    <Text style={[eclStyles.infoBadgeText, { color: currentSign.color }]}>
                        {currentSign.symbol} Sun in {currentSign.name}
                    </Text>
                </View>
                {userSign && userSign !== currentSign.name && (
                    <View style={[eclStyles.infoBadge, { backgroundColor: '#FFD54F22', borderColor: '#FFD54F' }]}>
                        <Text style={[eclStyles.infoBadgeText, { color: '#FFD54F' }]}>
                            ⭐ Your sign: {userSign}
                        </Text>
                    </View>
                )}
            </View>

            {/* Selected constellation detail panel */}
            {selectedData && (
                <View style={[eclStyles.detailPanel, { borderColor: selectedData.color + '66' }]}>
                    <View style={eclStyles.detailHeader}>
                        <Text style={[eclStyles.detailSymbol, { color: selectedData.color }]}>{selectedData.symbol}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[eclStyles.detailName, { color: selectedData.color }]}>{selectedData.name}</Text>
                            <Text style={eclStyles.detailDates}>{selectedData.dates}</Text>
                        </View>
                        <View style={[eclStyles.elementBadge, { backgroundColor: ELEMENT_COLORS[selectedData.element] + '33' }]}>
                            <Text style={[eclStyles.elementText, { color: ELEMENT_COLORS[selectedData.element] }]}>
                                {selectedData.element === 'Fire' ? '🔥' : selectedData.element === 'Earth' ? '🌍' : selectedData.element === 'Air' ? '💨' : '💧'} {selectedData.element}
                            </Text>
                        </View>
                    </View>
                    <Text style={eclStyles.detailExplain}>
                        {selectedData.name} occupies {selectedData.lon - 15}°–{selectedData.lon + 15}° of the ecliptic.
                        The Sun appears to pass through this constellation each year during {selectedData.dates}.
                        {selectedData.stars.length} major stars form this constellation pattern.
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedSign(null)} style={eclStyles.closeButton}>
                        <Text style={eclStyles.closeText}>✕ Close</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Educational legend */}
            <View style={eclStyles.legend}>
                <Text style={eclStyles.legendTitle}>How to Read This</Text>
                <View style={eclStyles.legendRow}>
                    <View style={[eclStyles.legendDot, { backgroundColor: '#FFD54F' }]} />
                    <Text style={eclStyles.legendText}>Sun — center of our solar system</Text>
                </View>
                <View style={eclStyles.legendRow}>
                    <View style={[eclStyles.legendDot, { backgroundColor: '#4FC3F7' }]} />
                    <Text style={eclStyles.legendText}>Earth — orbiting the Sun (blue ring = ecliptic path)</Text>
                </View>
                <View style={eclStyles.legendRow}>
                    <View style={[eclStyles.legendDot, { backgroundColor: '#E0E0E0' }]} />
                    <Text style={eclStyles.legendText}>Moon — orbiting Earth</Text>
                </View>
                <View style={eclStyles.legendRow}>
                    <View style={[eclStyles.legendDot, { backgroundColor: '#ccc', width: 6, height: 6 }]} />
                    <Text style={eclStyles.legendText}>Star patterns — the 12 zodiac constellations</Text>
                </View>
                <Text style={eclStyles.legendNote}>
                    As Earth orbits the Sun, the Sun appears to pass through each constellation.
                    {'\n'}Your zodiac sign is whichever constellation the Sun was "in" on your birthday.
                    {'\n\n'}👆 Drag Earth around its orbit to travel through time! Tap any constellation to learn more.
                </Text>
            </View>
        </View>
    );
}

const eclStyles = StyleSheet.create({
    container: {
        marginBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        paddingBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginTop: 14,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
        lineHeight: 16,
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
        marginHorizontal: 12,
        flexWrap: 'wrap',
    },
    infoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
    },
    infoBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailPanel: {
        marginHorizontal: 12,
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    detailSymbol: {
        fontSize: 28,
        fontWeight: '900',
    },
    detailName: {
        fontSize: 18,
        fontWeight: '800',
    },
    detailDates: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
    },
    elementBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    elementText: {
        fontSize: 11,
        fontWeight: '700',
    },
    detailExplain: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    closeText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
    },
    legend: {
        marginHorizontal: 12,
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    legendTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        gap: 8,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        flex: 1,
    },
    legendNote: {
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.45)',
        marginTop: 6,
        lineHeight: 15,
        fontStyle: 'italic',
    },
});
