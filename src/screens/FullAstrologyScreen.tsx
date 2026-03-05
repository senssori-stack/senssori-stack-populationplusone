import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Modal,
    PanResponder,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Svg, Text as SvgText } from 'react-native-svg';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getCityCoordinates } from '../data/utils/town-coordinates';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FullAstrology'>;

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

const ELEMENT_INFO: Record<string, { color: string; trait: string }> = {
    'Fire': { color: '#e53935', trait: 'Passionate, dynamic, and temperamental' },
    'Earth': { color: '#43a047', trait: 'Grounded, practical, and reliable' },
    'Air': { color: '#1e88e5', trait: 'Intellectual, communicative, and social' },
    'Water': { color: '#00acc1', trait: 'Emotional, intuitive, and nurturing' },
};

const SIGN_ELEMENTS: Record<string, string> = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

const PLANET_MEANINGS: Record<string, string> = {
    'Sun': 'Core identity, ego, vitality',
    'Moon': 'Emotions, instincts, subconscious',
    'Mercury': 'Communication, intellect, learning',
    'Venus': 'Love, beauty, values, pleasure',
    'Mars': 'Action, desire, energy, courage',
    'Jupiter': 'Expansion, luck, wisdom, growth',
    'Saturn': 'Structure, discipline, responsibility',
    'Uranus': 'Innovation, rebellion, sudden change',
    'Neptune': 'Dreams, intuition, spirituality',
    'Pluto': 'Transformation, power, rebirth',
};

// House meanings - the 12 areas of life
const HOUSE_INFO: { name: string; emoji: string; theme: string; description: string }[] = [
    { name: '1st House', emoji: '🪞', theme: 'Self & Identity', description: 'Your appearance, first impressions, and how you approach life. This is YOU - your personality and physical self.' },
    { name: '2nd House', emoji: '💰', theme: 'Money & Values', description: 'Your finances, possessions, self-worth, and what you value most. How you earn and spend money.' },
    { name: '3rd House', emoji: '💬', theme: 'Communication', description: 'How you think, speak, and learn. Also siblings, neighbors, and short trips. Your everyday mind.' },
    { name: '4th House', emoji: '🏠', theme: 'Home & Family', description: 'Your roots, home life, family, and emotional foundation. Where you feel safe and secure.' },
    { name: '5th House', emoji: '🎨', theme: 'Creativity & Fun', description: 'Romance, children, creative expression, hobbies, and joy. What brings you pleasure and play.' },
    { name: '6th House', emoji: '⚕️', theme: 'Health & Service', description: 'Daily routines, health habits, work environment, and being of service to others.' },
    { name: '7th House', emoji: '💑', theme: 'Partnerships', description: 'Marriage, business partners, and close one-on-one relationships. Who you attract and commit to.' },
    { name: '8th House', emoji: '🦋', theme: 'Transformation', description: 'Deep bonds, shared resources, intimacy, and major life changes. Death and rebirth cycles.' },
    { name: '9th House', emoji: '✈️', theme: 'Exploration', description: 'Higher education, travel, philosophy, and expanding your horizons. Your search for meaning.' },
    { name: '10th House', emoji: '👔', theme: 'Career & Legacy', description: 'Your public image, career, achievements, and reputation. What you\'re known for in the world.' },
    { name: '11th House', emoji: '👥', theme: 'Community', description: 'Friends, groups, hopes, and dreams. Your social network and humanitarian ideals.' },
    { name: '12th House', emoji: '🔮', theme: 'Spirituality', description: 'The subconscious, dreams, secrets, and spiritual life. What\'s hidden and your connection to the divine.' },
];

// Helper to get zodiac sign from degree
const getZodiacFromDegree = (degree: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index = Math.floor(degree / 30) % 12;
    return signs[index];
};

export default function FullAstrologyScreen({ navigation, route }: Props) {
    const [birthDate, setBirthDate] = useState(() => new Date(route.params.birthDate));
    const [showDateModal, setShowDateModal] = useState(false);
    // Use route params if provided, otherwise defaults
    const initialTime = route.params.birthTime || '12:00 PM';
    // Convert 12-hour format to 24-hour for internal use
    const [birthTime, setBirthTime] = useState(() => {
        if (initialTime.includes('AM') || initialTime.includes('PM')) {
            const match = initialTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2];
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                return `${h.toString().padStart(2, '0')}:${m}`;
            }
        }
        return '12:00';
    });
    const [birthLocation, setBirthLocation] = useState(route.params.birthLocation || '');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [expandedEdu, setExpandedEdu] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [dayOffset, setDayOffset] = useState(0);
    const dayOffsetRef = useRef(0);
    const spinAccum = useRef(0);
    const lastAngle = useRef<number | null>(null);
    const originalBirthDateRef = useRef(new Date(route.params.birthDate));
    const scrollRef = useRef<ScrollView>(null);

    const toggleEdu = (key: string) => setExpandedEdu(prev => prev === key ? null : key);

    // Spin gesture: track circular finger movement around chart center
    const getAngle = useCallback((x: number, y: number) => {
        const halfSize = 161; // svgSize/2
        const dx = x - halfSize;
        const dy = y - halfSize;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) =>
                Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
            onPanResponderGrant: (evt) => {
                lastAngle.current = null;
                spinAccum.current = dayOffsetRef.current * 15;
                setIsSpinning(true);
                // Disable parent scroll while spinning
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const touch = evt.nativeEvent;
                const angle = Math.atan2(
                    touch.locationY - 161,
                    touch.locationX - 161
                ) * (180 / Math.PI);

                if (lastAngle.current !== null) {
                    let delta = angle - lastAngle.current;
                    // Handle wrapping at ±180°
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    spinAccum.current += delta;

                    // Every 15° of rotation = 1 day
                    const newDayOffset = Math.round(spinAccum.current / 15);
                    if (newDayOffset !== dayOffsetRef.current) {
                        dayOffsetRef.current = newDayOffset;
                        setDayOffset(newDayOffset);
                        // Update the displayed birth date
                        const newDate = new Date(originalBirthDateRef.current);
                        newDate.setDate(newDate.getDate() + newDayOffset);
                        setBirthDate(newDate);
                    }
                }
                lastAngle.current = angle;
            },
            onPanResponderRelease: () => {
                lastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
            onPanResponderTerminate: () => {
                lastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
        })
    ).current;

    // Second PanResponder for the solar system wheel (same logic, same date)
    const solarSpinAccum = useRef(0);
    const solarLastAngle = useRef<number | null>(null);
    const solarPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) =>
                Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
            onPanResponderGrant: () => {
                solarLastAngle.current = null;
                solarSpinAccum.current = dayOffsetRef.current * 15;
                setIsSpinning(true);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: false });
            },
            onPanResponderMove: (evt) => {
                const touch = evt.nativeEvent;
                const angle = Math.atan2(
                    touch.locationY - 201,
                    touch.locationX - 201
                ) * (180 / Math.PI);

                if (solarLastAngle.current !== null) {
                    let delta = angle - solarLastAngle.current;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    solarSpinAccum.current += delta;

                    const newDayOffset = Math.round(solarSpinAccum.current / 15);
                    if (newDayOffset !== dayOffsetRef.current) {
                        dayOffsetRef.current = newDayOffset;
                        setDayOffset(newDayOffset);
                        const newDate = new Date(originalBirthDateRef.current);
                        newDate.setDate(newDate.getDate() + newDayOffset);
                        setBirthDate(newDate);
                    }
                }
                solarLastAngle.current = angle;
            },
            onPanResponderRelease: () => {
                solarLastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
            onPanResponderTerminate: () => {
                solarLastAngle.current = null;
                setIsSpinning(false);
                scrollRef.current?.setNativeProps?.({ scrollEnabled: true });
            },
        })
    ).current;

    // Get coordinates from location, default to NYC if not found
    const coordinates = useMemo(() => {
        if (birthLocation) {
            const coords = getCityCoordinates(birthLocation);
            if (coords) {
                return { lat: coords.lat, lng: coords.lng, found: true };
            }
        }
        return { lat: 40.7128, lng: -74.0060, found: false };
    }, [birthLocation]);

    const latitude = coordinates.lat;
    const longitude = coordinates.lng;

    // Parse birth time
    const [hours, minutes] = birthTime.split(':').map(Number);
    const adjustedBirthDate = useMemo(() => {
        const d = new Date(birthDate);
        d.setHours(hours || 12, minutes || 0, 0, 0);
        return d;
    }, [birthDate, hours, minutes]);

    const natalChart = useMemo(() => {
        return calculateNatalChart(adjustedBirthDate, latitude, longitude);
    }, [adjustedBirthDate, latitude, longitude]);

    const sunSign = natalChart.planets[0]?.zodiac || 'Unknown';
    const moonSign = natalChart.planets[1]?.zodiac || 'Unknown';
    const ascendantSign = natalChart.ascendantZodiac || 'Unknown';
    const sunElement = SIGN_ELEMENTS[sunSign] || 'Unknown';

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Voyager probe distance calculations (component level so legend can access)
    const voyager1LaunchMs = Date.UTC(1977, 8, 5);
    const voyager2LaunchMs = Date.UTC(1977, 7, 20);
    const kmPerSecToAUPerDay = (kmPerSec: number) => (kmPerSec * 86400) / 149597870.7;
    const v1DaysOut = (birthDate.getTime() - voyager1LaunchMs) / 86400000;
    const v2DaysOut = (birthDate.getTime() - voyager2LaunchMs) / 86400000;
    const v1AU = v1DaysOut > 0 ? 1 + v1DaysOut * kmPerSecToAUPerDay(17.0) : 0;
    const v2AU = v2DaysOut > 0 ? 1 + v2DaysOut * kmPerSecToAUPerDay(15.4) : 0;

    // Professional natal chart rendering (Ascendant-on-left layout)
    const svgSize = 322;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r_outer = svgSize * 0.45;
    const r_sign = svgSize * 0.38;
    const r_house = svgSize * 0.15; // inner house ring
    const r_planet = svgSize * 0.27;

    // Chart rotation: offset so the Ascendant sits at the LEFT (9 o'clock = 270° in our system)
    const ascendantDeg = natalChart.ascendant || 0;
    const chartRotation = 270 - ascendantDeg;

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
        <LinearGradient colors={['#1a237e', '#283593', '#3949ab']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

            <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔮</Text>
                    <Text style={styles.title}>Your Natal Chart</Text>
                    <Text style={styles.subtitle}>{formattedDate}</Text>
                    {birthLocation ? (
                        <Text style={styles.subtitleLocation}>📍 {birthLocation}  •  🕐 {birthTime}</Text>
                    ) : null}
                </View>

                {/* If location/time not pre-entered, show inline inputs */}
                {(!route.params.birthTime || !route.params.birthLocation) && (
                    <View style={styles.inlineInputSection}>
                        <Text style={styles.inlineInputLabel}>Enter your birth details for the most accurate chart:</Text>

                        {/* Birth Date */}
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setShowDateModal(true)}
                        >
                            <Text style={styles.timeButtonText}>🎂 Birth Date: {birthDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                            <Text style={styles.timeButtonHint}>Tap to change</Text>
                        </TouchableOpacity>

                        {/* Birth Time */}
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setShowTimeModal(true)}
                        >
                            <Text style={styles.timeButtonText}>🕐 Birth Time: {birthTime}</Text>
                            <Text style={styles.timeButtonHint}>Tap to set for accurate Rising sign</Text>
                        </TouchableOpacity>

                        {/* Birth Location */}
                        <TouchableOpacity
                            style={[styles.timeButton, coordinates.found && styles.locationFound]}
                            onPress={() => setShowLocationModal(true)}
                        >
                            <Text style={styles.timeButtonText}>📍 Birth City: {birthLocation || 'Not Set'}</Text>
                            {coordinates.found ? (
                                <Text style={styles.locationFoundText}>✓ Coordinates found: {latitude.toFixed(2)}°N, {Math.abs(longitude).toFixed(2)}°W</Text>
                            ) : (
                                <Text style={styles.timeButtonHint}>Enter city, state for accurate houses</Text>
                            )}
                        </TouchableOpacity>

                        {(!birthLocation || !coordinates.found) && (
                            <View style={styles.accuracyWarning}>
                                <Text style={styles.accuracyWarningText}>
                                    ⚠️ Enter birth time & city above for accurate Rising sign and house placements.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* If all details were pre-entered, show compact edit buttons */}
                {route.params.birthTime && route.params.birthLocation && (
                    <View style={styles.compactEditRow}>
                        <TouchableOpacity style={styles.compactEditButton} onPress={() => setShowDateModal(true)}>
                            <Text style={styles.compactEditText}>🎂 Change Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.compactEditButton} onPress={() => setShowTimeModal(true)}>
                            <Text style={styles.compactEditText}>🕐 Change Time</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.compactEditButton} onPress={() => setShowLocationModal(true)}>
                            <Text style={styles.compactEditText}>📍 Change City</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ═══ NATAL CHART WHEEL — wheel first, then title/info ═══ */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartWrapper} {...panResponder.panHandlers}>
                        {/* Spin date overlay */}
                        {(isSpinning || dayOffset !== 0) && (
                            <View style={styles.spinOverlay}>
                                <Text style={styles.spinOverlayDate}>
                                    {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                                <Text style={styles.spinOverlayDelta}>
                                    {dayOffset === 0 ? 'Original Date' : `${dayOffset > 0 ? '+' : ''}${dayOffset} day${Math.abs(dayOffset) !== 1 ? 's' : ''}`}
                                </Text>
                            </View>
                        )}
                        <View style={styles.wheelRow}>
                            {/* Zodiac signs sidebar — two stacks left of wheel */}
                            <View style={styles.zodiacSidebar}>
                                <Text style={styles.sidebarHeader}>Signs</Text>
                                <View style={styles.zodiacSidebarCols}>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '♈', label: 'ARI' },
                                            { sym: '♉', label: 'TAU' },
                                            { sym: '♊', label: 'GEM' },
                                            { sym: '♋', label: 'CAN' },
                                            { sym: '♌', label: 'LEO' },
                                            { sym: '♍', label: 'VIR' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarZodiacItem}>
                                                <Text style={styles.sidebarSym}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '♎', label: 'LIB' },
                                            { sym: '♏', label: 'SCO' },
                                            { sym: '♐', label: 'SAG' },
                                            { sym: '♑', label: 'CAP' },
                                            { sym: '♒', label: 'AQU' },
                                            { sym: '♓', label: 'PIS' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarZodiacItem}>
                                                <Text style={styles.sidebarSym}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <Svg width={svgSize} height={svgSize} viewBox="16 16 290 290">
                                {/* Outer circle & sign ring */}
                                <Circle cx={cx} cy={cy} r={r_outer} stroke="#fff" strokeWidth={2} fill="#000000" />
                                <Circle cx={cx} cy={cy} r={r_sign} stroke="rgba(255,255,255,0.5)" strokeWidth={1} fill="none" />
                                {/* Inner house ring */}
                                <Circle cx={cx} cy={cy} r={r_house} stroke="rgba(255,255,255,0.2)" strokeWidth={1} fill="none" />

                                {/* Zodiac sign dividers and symbols — ROTATED by chartRotation */}
                                {zodiacSigns.map((sign, i) => {
                                    const eclipticAngle = i * 30; // 0°=Aries, 30°=Taurus...
                                    const chartAngle = eclipticAngle + chartRotation; // rotated
                                    const p1 = positionOnCircle(chartAngle, r_sign);
                                    const p2 = positionOnCircle(chartAngle, r_outer);
                                    const midAngle = chartAngle + 15;
                                    const labelPos = positionOnCircle(midAngle, (r_sign + r_outer) / 2);

                                    return (
                                        <G key={sign}>
                                            <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                                            <Circle cx={labelPos.x} cy={labelPos.y} r={12} fill="#6A0DAD" opacity="0.85" />
                                            <SvgText
                                                x={labelPos.x}
                                                y={labelPos.y}
                                                fill={sign === sunSign ? '#ffff00' : '#ffffff'}
                                                fontSize={20}
                                                fontWeight="900"
                                                textAnchor="middle"
                                                alignmentBaseline="middle"
                                                opacity="1"
                                                stroke="#000"
                                                strokeWidth={0.5}
                                            >
                                                {signSymbols[i]}
                                            </SvgText>
                                        </G>
                                    );
                                })}

                                {/* House cusp lines — from inner ring to sign ring */}
                                {natalChart.houses && natalChart.houses.length >= 12 && natalChart.houses.map((cusp, i) => {
                                    const chartAngle = cusp + chartRotation;
                                    const inner = positionOnCircle(chartAngle, r_house);
                                    const outer = positionOnCircle(chartAngle, r_sign);
                                    // House number label between this cusp and next cusp
                                    const nextCusp = natalChart.houses[(i + 1) % 12];
                                    const midDeg = cusp + ((((nextCusp - cusp) % 360) + 360) % 360) / 2;
                                    const numPos = positionOnCircle(midDeg + chartRotation, (r_house + r_sign) / 2);
                                    const isAngularHouse = i === 0 || i === 3 || i === 6 || i === 9;
                                    return (
                                        <G key={`house-${i}`}>
                                            <Line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                                                stroke={isAngularHouse ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
                                                strokeWidth={isAngularHouse ? 1.5 : 0.8}
                                                strokeDasharray={isAngularHouse ? undefined : '3,3'}
                                            />
                                            <SvgText
                                                x={numPos.x} y={numPos.y}
                                                fill="rgba(255,255,255,0.6)"
                                                fontSize={10}
                                                fontWeight="900"
                                                textAnchor="middle"
                                                alignmentBaseline="middle"
                                                stroke="rgba(0,0,0,0.3)"
                                                strokeWidth={0.3}
                                            >
                                                {i + 1}
                                            </SvgText>
                                        </G>
                                    );
                                })}

                                {/* Planet positions — ROTATED by chartRotation */}
                                {natalChart.planets.slice(0, 10).map((planet, i) => {
                                    const pos = positionOnCircle(planet.longitude + chartRotation, r_planet);
                                    const symbol = planetSymbols[planet.name] || '●';
                                    return (
                                        <SvgText
                                            key={planet.name}
                                            x={pos.x}
                                            y={pos.y}
                                            fill={planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : '#fff'}
                                            fontSize={18}
                                            fontWeight="900"
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            stroke="#000"
                                            strokeWidth={0.5}
                                        >
                                            {symbol}
                                        </SvgText>
                                    );
                                })}

                                {/* Center - Planet Earth */}
                                <Defs>
                                    <ClipPath id="earthClipFA">
                                        <Circle cx={cx} cy={cy} r={12} />
                                    </ClipPath>
                                </Defs>
                                <Circle cx={cx} cy={cy} r={12} fill="#1a6fc4" />
                                <G clipPath="url(#earthClipFA)">
                                    <Ellipse cx={cx - 5} cy={cy - 5} rx={5} ry={4} fill="#0000b3" transform={`rotate(-20 ${cx - 5} ${cy - 5})`} />
                                    <Ellipse cx={cx - 3} cy={cy + 5} rx={3} ry={5} fill="#0000b3" transform={`rotate(10 ${cx - 3} ${cy + 5})`} />
                                    <Ellipse cx={cx + 5} cy={cy - 2} rx={3} ry={4} fill="#0000b3" transform={`rotate(5 ${cx + 5} ${cy - 2})`} />
                                    <Ellipse cx={cx + 5} cy={cy + 5} rx={2.5} ry={4} fill="#0000b3" />
                                    <Ellipse cx={cx + 9} cy={cy - 5} rx={4} ry={3} fill="#0000b3" transform={`rotate(-10 ${cx + 9} ${cy - 5})`} />
                                </G>
                                <Circle cx={cx - 3} cy={cy - 3} r={10} fill="rgba(255,255,255,0.15)" />

                                {/* Four Angles: ASC, DSC, MC, IC — ROTATED */}
                                {(() => {
                                    const ascDeg = natalChart.ascendant || 0;
                                    const dscDeg = (ascDeg + 180) % 360;
                                    const mcDeg = natalChart.houses && natalChart.houses.length >= 10 ? natalChart.houses[9] : (ascDeg + 270) % 360;
                                    const icDeg = (mcDeg + 180) % 360;

                                    const angles = [
                                        { label: 'ASC', deg: ascDeg, color: '#FFD700' },
                                        { label: 'DSC', deg: dscDeg, color: '#FF6B6B' },
                                        { label: 'MC', deg: mcDeg, color: '#4ECDC4' },
                                        { label: 'IC', deg: icDeg, color: '#A78BFA' },
                                    ];

                                    return angles.map(({ label, deg, color }) => {
                                        const rotatedDeg = deg + chartRotation;
                                        const inner = positionOnCircle(rotatedDeg, r_house * 0.4);
                                        const outer = positionOnCircle(rotatedDeg, r_outer);
                                        const labelPos = positionOnCircle(rotatedDeg, r_outer + 14);
                                        return (
                                            <G key={label}>
                                                <Line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                                                    stroke={color} strokeWidth={2} opacity="0.85" />
                                                <SvgText x={labelPos.x} y={labelPos.y}
                                                    fontSize={11} fontWeight="900"
                                                    fill={color} textAnchor="middle" alignmentBaseline="middle"
                                                    stroke="#000" strokeWidth={0.4}>
                                                    {label}
                                                </SvgText>
                                            </G>
                                        );
                                    });
                                })()}
                            </Svg>
                            {/* Planets & points sidebar — right of wheel */}
                            <View style={styles.planetSidebar}>
                                <Text style={styles.sidebarHeader}>Planets</Text>
                                <View style={styles.zodiacSidebarCols}>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '☉', label: 'SUN' },
                                            { sym: '☽', label: 'MON' },
                                            { sym: '☿', label: 'MER' },
                                            { sym: '♀', label: 'VEN' },
                                            { sym: '♂', label: 'MAR' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarPlanetItem}>
                                                <Text style={styles.sidebarSym}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '♃', label: 'JUP' },
                                            { sym: '♄', label: 'SAT' },
                                            { sym: '♅', label: 'URA' },
                                            { sym: '♆', label: 'NEP' },
                                            { sym: '♇', label: 'PLU' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarPlanetItem}>
                                                <Text style={styles.sidebarSym}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <Text style={[styles.sidebarHeader, { marginTop: 2 }]}>Points</Text>
                                <View style={styles.zodiacSidebarCols}>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '◉', label: 'ASC', color: '#FFD700' },
                                            { sym: '◉', label: 'DSC', color: '#FF6B6B' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarPlanetItem}>
                                                <Text style={[styles.sidebarSym, { color: item.color }]}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.zodiacSidebarCol}>
                                        {[
                                            { sym: '◉', label: 'MC', color: '#4ECDC4' },
                                            { sym: '◉', label: 'IC', color: '#A78BFA' },
                                        ].map(item => (
                                            <View key={item.label} style={styles.sidebarPlanetItem}>
                                                <Text style={[styles.sidebarSym, { color: item.color }]}>{item.sym}</Text>
                                                <Text style={styles.sidebarMiniLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Reset button — only show when date has been spun away */}
                    {dayOffset !== 0 && (
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setDayOffset(0);
                                dayOffsetRef.current = 0;
                                spinAccum.current = 0;
                                solarSpinAccum.current = 0;
                                setBirthDate(new Date(originalBirthDateRef.current));
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.resetButtonText}>↺ Reset to Original Birth Date</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionTitle}>🌌 Your Birth Chart</Text>
                    <Text style={styles.sectionExplainer}>
                        This is a traditional natal chart with the Ascendant (ASC) anchored to the left — the same layout used by professional astrologers worldwide. The outer ring shows the 12 zodiac signs, rotated to match YOUR unique sky at birth. Planet symbols inside show their real ecliptic positions. The 12 numbered sections are your astrological houses, each governing a different area of life. The tiny Earth at center represents YOU.{"\n\n"}The four cardinal points (colored lines) are:{"\n"}• ASC (Ascendant) — Left side — Your rising sign, how others first see you{"\n"}• DSC (Descendant) — Right side — Partnerships and relationships{"\n"}• MC (Midheaven) — Near top — Career, public image, and life goals{"\n"}• IC (Imum Coeli) — Near bottom — Home, roots, and inner foundation
                    </Text>

                    {/* Spin hint */}
                    <View style={styles.spinHint}>
                        <Text style={styles.spinHintText}>👆 Spin the wheel with your finger to travel through time!</Text>
                        <Text style={styles.spinHintDetail}>
                            {"\n"}The wheel moves in 15° increments — each 15° of rotation equals 1 day. Since a full circle is 360°, one complete revolution moves you 24 days (360 ÷ 15 = 24).{"\n\n"}• A small nudge (15°) = 1 day{"\n"}• Quarter turn (90°) = 6 days{"\n"}• Half turn (180°) = 12 days{"\n"}• Full revolution (360°) = 24 days{"\n"}• Clockwise = forward in time{"\n"}• Counter-clockwise = backward in time{"\n\n"}Watch the planets shift positions as you spin! The entire chart — Big Three, houses, and planet placements — recalculates in real time. Use the Reset button to return to the original birth date.
                        </Text>
                    </View>


                </View>

                {/* What is a Natal Chart - Educational Intro */}
                <View style={styles.educationCard}>
                    <Text style={styles.educationTitle}>📚 What is a Natal Chart?</Text>
                    <Text style={styles.educationText}>
                        A natal chart (also called a birth chart) is like a cosmic snapshot of the sky at the exact moment you were born. It shows where all the planets were positioned and which zodiac signs they were in.
                        {'\n\n'}
                        Ancient astrologers believed these planetary positions influence your personality, strengths, challenges, and life path. Think of it as a celestial blueprint unique to you!
                    </Text>
                </View>

                {/* ── ACCURACY MATTERS BANNER ── */}
                <View style={styles.accuracyBanner}>
                    <Text style={styles.accuracyBannerIcon}>⚠️</Text>
                    <Text style={styles.accuracyBannerTitle}>Accuracy Matters</Text>
                    <Text style={styles.accuracyBannerText}>
                        Your birth date, exact birth time, and birth city are critical for providing the most accurate and realistic natal chart. Without all three, your Rising sign, house placements, and Moon sign may be inaccurate. For best results, check your official birth certificate for the exact time and location.
                    </Text>
                </View>

                {/* The Big Three */}
                <View style={styles.bigThreeContainer}>
                    <Text style={styles.sectionTitle}>✨ Your Big Three</Text>
                    <Text style={styles.sectionExplainer}>
                        The "Big Three" are the most important placements in your chart. Together, they paint a picture of who you are at your core, how you feel, and how you present yourself to the world.
                    </Text>

                    <View style={styles.bigThreeCard}>
                        <View style={styles.bigThreeItem}>
                            <Text style={styles.bigThreeLabel}>☉ SUN</Text>
                            <Text style={styles.bigThreeSign}>{sunSign}</Text>
                            <Text style={styles.bigThreeDesc}>{ZODIAC_SUN_DESCRIPTIONS[sunSign] || 'Your core identity'}</Text>
                        </View>

                        <View style={styles.bigThreeDivider} />

                        <View style={styles.bigThreeItem}>
                            <Text style={styles.bigThreeLabel}>☽ MOON</Text>
                            <Text style={styles.bigThreeSign}>{moonSign}</Text>
                            <Text style={styles.bigThreeDesc}>{ZODIAC_MOON_DESCRIPTIONS[moonSign] || 'Your emotional nature'}</Text>
                        </View>

                        <View style={styles.bigThreeDivider} />

                        <View style={styles.bigThreeItem}>
                            <Text style={styles.bigThreeLabel}>↑ RISING</Text>
                            <Text style={styles.bigThreeSign}>{ascendantSign}</Text>
                            <Text style={styles.bigThreeDesc}>{ASCENDANT_DESCRIPTIONS[ascendantSign] || 'How others see you'}</Text>
                        </View>
                    </View>
                </View>

                {/* Element */}
                <View style={[styles.elementCard, { backgroundColor: ELEMENT_INFO[sunElement]?.color || '#666' }]}>
                    <Text style={styles.elementTitle}>🔥 Your Element: {sunElement}</Text>
                    <Text style={styles.elementDesc}>{ELEMENT_INFO[sunElement]?.trait || 'Unique and balanced'}</Text>
                    <Text style={styles.elementExplainer}>
                        Each zodiac sign belongs to one of four elements. Your Sun sign's element shows your basic temperament and how you naturally approach life.
                    </Text>
                </View>

                {/* ═══ HELIOCENTRIC SOLAR SYSTEM VIEW ═══ */}
                <View style={styles.solarSystemContainer}>
                    <Text style={styles.sectionTitle}>☀️ Our Solar System — Real Orbits</Text>
                    <Text style={styles.sectionExplainer}>
                        This is a heliocentric (Sun-centered) view of our Solar System on the date shown. Unlike the natal chart above (which is geocentric — Earth at center), this shows where every planet, dwarf planet, comet, and space probe ACTUALLY is.{"\n\n"}What you'll see:{"\n"}• 8 planets with color-coded orbit rings{"\n"}• 3 dwarf planets: Pluto, Ceres, and Eris{"\n"}• 3 famous comets: Halley's, Encke, and Hale-Bopp{"\n"}• The Asteroid Belt and Kuiper Belt{"\n"}• Voyager 1 & 2 — humanity's farthest travelers
                    </Text>

                    {/* Spin hint for solar system */}
                    <View style={styles.spinHint}>
                        <Text style={styles.spinHintText}>👆 Spin the wheel or use the slider below to travel through time!</Text>
                        <Text style={styles.spinHintDetail}>
                            Watch Mercury zip around while Neptune barely moves — that's real orbital mechanics!
                        </Text>
                    </View>

                    {(() => {
                        const ssSize = 402;
                        const ssCx = ssSize / 2;
                        const ssCy = ssSize / 2;

                        // J2000.0 epoch: Jan 1, 2000 12:00 TT
                        const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
                        const daysSinceJ2000 = (birthDate.getTime() - j2000.getTime()) / 86400000;

                        // Mean orbital elements (J2000.0 epoch)
                        // L0 = mean longitude at epoch, rate = degrees per day
                        const solarPlanets = [
                            { name: 'Mercury', sym: '☿', L0: 252.25, rate: 4.09233, au: 0.387, color: '#B0B0B0' },
                            { name: 'Venus', sym: '♀', L0: 181.98, rate: 1.60213, au: 0.723, color: '#FFD700' },
                            { name: 'Earth', sym: '🌍', L0: 100.47, rate: 0.98560, au: 1.000, color: '#4FC3F7' },
                            { name: 'Mars', sym: '♂', L0: 355.45, rate: 0.52403, au: 1.524, color: '#FF6B35' },
                            { name: 'Jupiter', sym: '♃', L0: 34.40, rate: 0.08309, au: 5.203, color: '#FFB74D' },
                            { name: 'Saturn', sym: '♄', L0: 50.08, rate: 0.03346, au: 9.537, color: '#BCAAA4' },
                            { name: 'Uranus', sym: '♅', L0: 314.06, rate: 0.01173, au: 19.19, color: '#80DEEA' },
                            { name: 'Neptune', sym: '♆', L0: 304.35, rate: 0.00598, au: 30.07, color: '#5C6BC0' },
                        ];

                        // Dwarf planets
                        const dwarfPlanets = [
                            { name: 'Pluto', sym: '♇', L0: 238.96, rate: 0.00397, au: 39.48, color: '#CE93D8' },
                            { name: 'Ceres', sym: '⚳', L0: 153.94, rate: 0.21408, au: 2.77, color: '#8D6E63' },
                            { name: 'Eris', sym: '⯰', L0: 36.02, rate: 0.00176, au: 67.67, color: '#EEEEEE' },
                        ];

                        // Comets — using Keplerian elements for elliptical orbits
                        // For comets we compute position on an ellipse using mean anomaly
                        const comets = [
                            {
                                name: "Halley's", sym: '☄',
                                // Perihelion in Feb 1986, period ~75.3 years
                                periDate: new Date(Date.UTC(1986, 1, 9)).getTime(),
                                periodDays: 27510, // ~75.3 years
                                a: 17.83, e: 0.967, periLong: 111.33, // semi-major, eccentricity, perihelion longitude
                                color: '#E0F7FA',
                            },
                            {
                                name: 'Encke', sym: '☄',
                                periDate: new Date(Date.UTC(2023, 9, 22)).getTime(),
                                periodDays: 1204, // ~3.3 years
                                a: 2.22, e: 0.848, periLong: 186.5,
                                color: '#FFF9C4',
                            },
                            {
                                name: 'Hale-Bopp', sym: '☄',
                                periDate: new Date(Date.UTC(1997, 3, 1)).getTime(),
                                periodDays: 925000, // ~2533 years
                                a: 186.0, e: 0.995, periLong: 130.6,
                                color: '#B2EBF2',
                            },
                        ];

                        // Voyager probes — multi-phase trajectory model
                        // Phase 1: Pre-launch (not visible)
                        // Phase 2: Earth-to-Jupiter cruise
                        // Phase 3: Jupiter flyby → Saturn (V1 & V2)
                        // Phase 4: V2 → Uranus → Neptune; V1 → interstellar
                        // Phase 5: Interstellar escape on fixed heading

                        // Key waypoints (date, ecliptic longitude, AU from Sun)
                        const v1Waypoints = [
                            { date: Date.UTC(1977, 8, 5), lng: 340, au: 1.0 },    // Launch
                            { date: Date.UTC(1978, 5, 1), lng: 10, au: 2.5 },     // Crossing asteroid belt
                            { date: Date.UTC(1979, 2, 5), lng: 38, au: 5.2 },     // Jupiter flyby
                            { date: Date.UTC(1980, 10, 12), lng: 100, au: 9.5 },  // Saturn flyby
                            { date: Date.UTC(1983, 0, 1), lng: 180, au: 18 },     // Heading north out of ecliptic
                            { date: Date.UTC(1990, 0, 1), lng: 235, au: 40 },     // Deep space
                            { date: Date.UTC(2000, 0, 1), lng: 252, au: 72 },     // Approaching heliopause
                            { date: Date.UTC(2012, 7, 25), lng: 258, au: 121 },   // Entered interstellar space
                            { date: Date.UTC(2030, 0, 1), lng: 262, au: 165 },    // Projected
                        ];
                        const v2Waypoints = [
                            { date: Date.UTC(1977, 7, 20), lng: 335, au: 1.0 },   // Launch
                            { date: Date.UTC(1978, 11, 1), lng: 5, au: 3.5 },     // Crossing asteroid belt
                            { date: Date.UTC(1979, 6, 9), lng: 40, au: 5.2 },     // Jupiter flyby
                            { date: Date.UTC(1981, 7, 26), lng: 115, au: 9.5 },   // Saturn flyby
                            { date: Date.UTC(1986, 0, 24), lng: 195, au: 19.2 },  // Uranus flyby
                            { date: Date.UTC(1989, 7, 25), lng: 250, au: 30.1 },  // Neptune flyby
                            { date: Date.UTC(2000, 0, 1), lng: 280, au: 58 },     // Deep space
                            { date: Date.UTC(2018, 10, 5), lng: 293, au: 119 },   // Entered interstellar space
                            { date: Date.UTC(2030, 0, 1), lng: 298, au: 155 },    // Projected
                        ];

                        const interpolateVoyager = (waypoints: typeof v1Waypoints, dateMs: number) => {
                            if (dateMs <= waypoints[0].date) return null; // not launched yet
                            if (dateMs >= waypoints[waypoints.length - 1].date) {
                                // Extrapolate beyond last waypoint at constant velocity & heading
                                const last = waypoints[waypoints.length - 1];
                                const prev = waypoints[waypoints.length - 2];
                                const dt = (last.date - prev.date) / 86400000;
                                const auPerDay = (last.au - prev.au) / dt;
                                const lngPerDay = (last.lng - prev.lng) / dt;
                                const daysExtra = (dateMs - last.date) / 86400000;
                                return {
                                    lng: last.lng + lngPerDay * daysExtra,
                                    au: last.au + auPerDay * daysExtra,
                                };
                            }
                            // Find surrounding waypoints and interpolate
                            for (let i = 0; i < waypoints.length - 1; i++) {
                                if (dateMs >= waypoints[i].date && dateMs < waypoints[i + 1].date) {
                                    const t = (dateMs - waypoints[i].date) / (waypoints[i + 1].date - waypoints[i].date);
                                    return {
                                        lng: waypoints[i].lng + t * (waypoints[i + 1].lng - waypoints[i].lng),
                                        au: waypoints[i].au + t * (waypoints[i + 1].au - waypoints[i].au),
                                    };
                                }
                            }
                            return null;
                        };

                        const v1Pos_data = interpolateVoyager(v1Waypoints, birthDate.getTime());
                        const v2Pos_data = interpolateVoyager(v2Waypoints, birthDate.getTime());

                        // Use sqrt scaling so inner and outer planets are all visible
                        const maxAU = 80; // expanded for Eris/comets/Voyagers
                        const maxRadius = ssSize * 0.46;
                        const minRadius = ssSize * 0.07;
                        const scaleR = (au: number) => minRadius + (maxRadius - minRadius) * Math.sqrt(au / maxAU);

                        const ssDegToRad = (deg: number) => (deg * Math.PI) / 180;
                        const ssPosOnCircle = (lng: number, radius: number) => {
                            const rad = ssDegToRad(lng - 90);
                            return { x: ssCx + radius * Math.cos(rad), y: ssCy + radius * Math.sin(rad) };
                        };

                        return (
                            <View style={styles.solarSystemWheel} {...solarPanResponder.panHandlers}>
                                {/* Spin date overlay for solar system */}
                                {(isSpinning || dayOffset !== 0) && (
                                    <View style={styles.solarSpinOverlay}>
                                        <Text style={styles.spinOverlayDate}>
                                            {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                        <Text style={styles.spinOverlayDelta}>
                                            {dayOffset === 0 ? 'Original Date' : `${dayOffset > 0 ? '+' : ''}${dayOffset} day${Math.abs(dayOffset) !== 1 ? 's' : ''}`}
                                        </Text>
                                    </View>
                                )}
                                <Svg width={ssSize} height={ssSize}>
                                    {/* Space background */}
                                    <Circle cx={ssCx} cy={ssCy} r={ssSize * 0.48} fill="#05051a" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                                    {/* Asteroid belt (2.1 - 3.3 AU) */}
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(2.1)} fill="none" stroke="rgba(139,119,101,0.2)" strokeWidth={1} />
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(2.7)} fill="none" stroke="rgba(139,119,101,0.15)" strokeWidth={scaleR(3.3) - scaleR(2.1)} />
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(3.3)} fill="none" stroke="rgba(139,119,101,0.2)" strokeWidth={1} />

                                    {/* Kuiper Belt hint (30 - 50 AU) */}
                                    <Circle cx={ssCx} cy={ssCy} r={scaleR(40)} fill="none" stroke="rgba(100,100,140,0.12)" strokeWidth={scaleR(50) - scaleR(30)} />

                                    {/* Orbit rings */}
                                    {solarPlanets.map((p) => (
                                        <Circle
                                            key={`orbit-${p.name}`}
                                            cx={ssCx} cy={ssCy}
                                            r={scaleR(p.au)}
                                            fill="none"
                                            stroke={p.name === 'Earth' ? 'rgba(79,195,247,0.3)' : 'rgba(255,255,255,0.12)'}
                                            strokeWidth={p.name === 'Earth' ? 1.5 : 0.8}
                                            strokeDasharray={p.name === 'Earth' ? undefined : '2,4'}
                                        />
                                    ))}

                                    {/* Dwarf planet orbits */}
                                    {dwarfPlanets.map((dp) => (
                                        <Circle
                                            key={`orbit-${dp.name}`}
                                            cx={ssCx} cy={ssCy}
                                            r={scaleR(dp.au)}
                                            fill="none"
                                            stroke={`${dp.color}33`}
                                            strokeWidth={0.6}
                                            strokeDasharray="1,5"
                                        />
                                    ))}

                                    {/* Sun at center */}
                                    <Circle cx={ssCx} cy={ssCy} r={17.5} fill="#FFA000" />
                                    <Circle cx={ssCx} cy={ssCy} r={14} fill="#FFD54F" />
                                    <Circle cx={ssCx} cy={ssCy} r={9} fill="#FFECB3" />
                                    {/* Sun glow */}
                                    <Circle cx={ssCx} cy={ssCy} r={25} fill="none" stroke="rgba(255,213,79,0.25)" strokeWidth={5} />

                                    {/* Planets at their real positions */}
                                    {solarPlanets.map((p) => {
                                        const meanLong = ((p.L0 + p.rate * daysSinceJ2000) % 360 + 360) % 360;
                                        const orbitR = scaleR(p.au);
                                        const pos = ssPosOnCircle(meanLong, orbitR);
                                        const dotR = p.name === 'Earth' ? 9 : (p.au < 2 ? 6 : (p.au < 10 ? 8 : 6));

                                        return (
                                            <G key={`planet-${p.name}`}>
                                                {/* Planet dot */}
                                                <Circle cx={pos.x} cy={pos.y} r={dotR} fill={p.color} />
                                                {/* Planet symbol */}
                                                <SvgText
                                                    x={pos.x}
                                                    y={pos.y + (dotR + 14)}
                                                    fill={p.color}
                                                    fontSize={13}
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    alignmentBaseline="middle"
                                                >
                                                    {p.sym}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Dwarf planets */}
                                    {dwarfPlanets.map((dp) => {
                                        const dpLong = ((dp.L0 + dp.rate * daysSinceJ2000) % 360 + 360) % 360;
                                        const dpR = scaleR(dp.au);
                                        const dpPos = ssPosOnCircle(dpLong, dpR);
                                        return (
                                            <G key={`dwarf-${dp.name}`}>
                                                <Circle cx={dpPos.x} cy={dpPos.y} r={4.5} fill={dp.color} opacity={0.85} />
                                                <SvgText x={dpPos.x} y={dpPos.y + 13}
                                                    fill={dp.color} fontSize={9} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle" opacity={0.9}>
                                                    {dp.name}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Comets — position on elliptical orbit */}
                                    {comets.map((c) => {
                                        const daysSincePeri = (birthDate.getTime() - c.periDate) / 86400000;
                                        const meanAnomaly = ((daysSincePeri / c.periodDays) * 360 % 360 + 360) % 360;
                                        const M = meanAnomaly * Math.PI / 180;
                                        // Solve Kepler's equation via Newton-Raphson (converges for all eccentricities)
                                        let E = M + c.e * Math.sin(M); // better initial guess
                                        for (let k = 0; k < 30; k++) {
                                            const dE = (E - c.e * Math.sin(E) - M) / (1 - c.e * Math.cos(E));
                                            E -= dE;
                                            if (Math.abs(dE) < 1e-12) break;
                                        }
                                        // True anomaly
                                        const nu = 2 * Math.atan2(
                                            Math.sqrt(1 + c.e) * Math.sin(E / 2),
                                            Math.sqrt(1 - c.e) * Math.cos(E / 2)
                                        );
                                        // Distance from Sun
                                        const rAU = c.a * (1 - c.e * Math.cos(E));
                                        // Clamp display radius so it doesn't fly off-screen
                                        const displayAU = Math.min(rAU, 75);
                                        const cometR = scaleR(displayAU);
                                        const cometLong = (c.periLong + nu * 180 / Math.PI + 360) % 360;
                                        const cPos = ssPosOnCircle(cometLong, cometR);

                                        // Only show if within visible range
                                        if (displayAU > 0.1) {
                                            return (
                                                <G key={`comet-${c.name}`}>
                                                    {/* Comet tail (line toward Sun) */}
                                                    <Line x1={cPos.x} y1={cPos.y} x2={ssCx} y2={ssCy}
                                                        stroke={c.color} strokeWidth={0.5} opacity={0.3} />
                                                    <Circle cx={cPos.x} cy={cPos.y} r={3} fill={c.color} opacity={0.9} />
                                                    <SvgText x={cPos.x} y={cPos.y - 8}
                                                        fill={c.color} fontSize={6} fontWeight="bold"
                                                        textAnchor="middle" alignmentBaseline="middle" opacity={0.85}>
                                                        {c.name}
                                                    </SvgText>
                                                </G>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Voyager 1 */}
                                    {v1Pos_data && (() => {
                                        const v1R = scaleR(Math.min(v1Pos_data.au, 75));
                                        const v1Pos = ssPosOnCircle(v1Pos_data.lng, v1R);
                                        return (
                                            <G key="voyager1">
                                                <Circle cx={v1Pos.x} cy={v1Pos.y} r={2.5} fill="#FF5252" />
                                                <SvgText x={v1Pos.x} y={v1Pos.y - 7}
                                                    fill="#FF5252" fontSize={6} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle">
                                                    V1
                                                </SvgText>
                                            </G>
                                        );
                                    })()}

                                    {/* Voyager 2 */}
                                    {v2Pos_data && (() => {
                                        const v2R = scaleR(Math.min(v2Pos_data.au, 75));
                                        const v2Pos = ssPosOnCircle(v2Pos_data.lng, v2R);
                                        return (
                                            <G key="voyager2">
                                                <Circle cx={v2Pos.x} cy={v2Pos.y} r={2.5} fill="#69F0AE" />
                                                <SvgText x={v2Pos.x} y={v2Pos.y - 7}
                                                    fill="#69F0AE" fontSize={6} fontWeight="bold"
                                                    textAnchor="middle" alignmentBaseline="middle">
                                                    V2
                                                </SvgText>
                                            </G>
                                        );
                                    })()}

                                    {/* Special marker for Earth */}
                                    {(() => {
                                        const earthLong = ((100.47 + 0.98560 * daysSinceJ2000) % 360 + 360) % 360;
                                        const earthR = scaleR(1.0);
                                        const earthPos = ssPosOnCircle(earthLong, earthR);
                                        return (
                                            <Circle cx={earthPos.x} cy={earthPos.y} r={11} fill="none" stroke="#4FC3F7" strokeWidth={1.5} />
                                        );
                                    })()}
                                </Svg>

                                {/* Date label */}
                                <View style={styles.solarDateLabel}>
                                    <Text style={styles.solarDateText}>
                                        {birthDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })()}

                    {/* Time Travel Slider */}
                    <View style={styles.timeSliderContainer}>
                        <Text style={styles.timeSliderTitle}>⏳ Time Travel</Text>
                        <View style={styles.timeSliderRow}>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset - 365;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>−1Y</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset - 30;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>−1M</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset - 1;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>◀ Day</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.timeSliderBtn, styles.timeSliderResetBtn]}
                                onPress={() => {
                                    setDayOffset(0);
                                    dayOffsetRef.current = 0;
                                    setBirthDate(new Date(originalBirthDateRef.current));
                                }}
                            >
                                <Text style={[styles.timeSliderBtnText, { color: '#FFD54F' }]}>⟲</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset + 1;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>Day ▶</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset + 30;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>+1M</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeSliderBtn}
                                onPress={() => {
                                    const newOffset = dayOffset + 365;
                                    setDayOffset(newOffset);
                                    dayOffsetRef.current = newOffset;
                                    const newDate = new Date(originalBirthDateRef.current);
                                    newDate.setDate(newDate.getDate() + newOffset);
                                    setBirthDate(newDate);
                                }}
                            >
                                <Text style={styles.timeSliderBtnText}>+1Y</Text>
                            </TouchableOpacity>
                        </View>
                        {dayOffset !== 0 && (
                            <Text style={styles.timeSliderOffset}>
                                {dayOffset > 0 ? '+' : ''}{dayOffset} day{Math.abs(dayOffset) !== 1 ? 's' : ''} from birth
                            </Text>
                        )}
                    </View>

                    {/* Solar System Key — Planets */}
                    <Text style={styles.solarKeySectionHeader}>🪐 Planets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '☿', name: 'Mercury', orbit: '88 days', color: '#B0B0B0' },
                            { sym: '♀', name: 'Venus', orbit: '225 days', color: '#FFD700' },
                            { sym: '🌍', name: 'Earth', orbit: '365 days', color: '#4FC3F7' },
                            { sym: '♂', name: 'Mars', orbit: '687 days', color: '#FF6B35' },
                            { sym: '♃', name: 'Jupiter', orbit: '11.9 yrs', color: '#FFB74D' },
                            { sym: '♄', name: 'Saturn', orbit: '29.5 yrs', color: '#BCAAA4' },
                            { sym: '♅', name: 'Uranus', orbit: '84 yrs', color: '#80DEEA' },
                            { sym: '♆', name: 'Neptune', orbit: '165 yrs', color: '#5C6BC0' },
                        ].map(p => (
                            <View key={p.name} style={styles.solarKeyItem}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <Text style={styles.solarKeyName}>{p.sym} {p.name}</Text>
                                <Text style={styles.solarKeyOrbit}>{p.orbit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Dwarf Planets */}
                    <Text style={styles.solarKeySectionHeader}>🔵 Dwarf Planets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '♇', name: 'Pluto', orbit: '248 yrs', color: '#CE93D8', desc: 'Orbits beyond Neptune in the Kuiper Belt' },
                            { sym: '⚳', name: 'Ceres', orbit: '4.6 yrs', color: '#8D6E63', desc: 'Largest object in the Asteroid Belt' },
                            { sym: '⯰', name: 'Eris', orbit: '559 yrs', color: '#EEEEEE', desc: 'Most massive known dwarf planet' },
                        ].map(p => (
                            <View key={p.name} style={styles.solarKeyItem}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <Text style={styles.solarKeyName}>{p.sym} {p.name}</Text>
                                <Text style={styles.solarKeyOrbit}>{p.orbit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Comets */}
                    <Text style={styles.solarKeySectionHeader}>☄️ Famous Comets</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: '☄', name: "Halley's", orbit: '75.3 yrs', color: '#E0F7FA', desc: 'Most famous comet — last perihelion 1986, next 2061' },
                            { sym: '☄', name: 'Encke', orbit: '3.3 yrs', color: '#FFF9C4', desc: 'Shortest known orbital period of any comet' },
                            { sym: '☄', name: 'Hale-Bopp', orbit: '2,533 yrs', color: '#B2EBF2', desc: 'Great Comet of 1997 — visible to naked eye for 18 months' },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.sym} {p.name}  <Text style={styles.solarKeyOrbit}>{p.orbit}</Text></Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Belts & Zones */}
                    <Text style={styles.solarKeySectionHeader}>🪨 Belts & Zones</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { name: 'Asteroid Belt', desc: 'Rocky debris between Mars & Jupiter (2.1–3.3 AU)', color: '#8B7765' },
                            { name: 'Kuiper Belt', desc: 'Icy bodies beyond Neptune (30–50 AU), home to Pluto', color: '#6464A0' },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.name}</Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Voyager Probes */}
                    <Text style={styles.solarKeySectionHeader}>🛰️ Voyager Probes</Text>
                    <View style={styles.solarKeyGrid}>
                        {[
                            { sym: 'V1', name: 'Voyager 1', desc: 'Launched Sep 5, 1977 — farthest human-made object in interstellar space', color: '#FF5252', au: `~${v1AU > 0 ? v1AU.toFixed(1) : '—'} AU` },
                            { sym: 'V2', name: 'Voyager 2', desc: 'Launched Aug 20, 1977 — only probe to visit Uranus & Neptune', color: '#69F0AE', au: `~${v2AU > 0 ? v2AU.toFixed(1) : '—'} AU` },
                        ].map(p => (
                            <View key={p.name} style={[styles.solarKeyItem, { width: '100%' as any }]}>
                                <View style={[styles.solarKeyDot, { backgroundColor: p.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.solarKeyName}>{p.sym} {p.name}  <Text style={styles.solarKeyOrbit}>{p.au}</Text></Text>
                                    <Text style={[styles.solarKeyOrbit, { marginTop: 2 }]}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.solarNote}>
                        <Text style={styles.solarNoteText}>
                            ℹ️  Planet positions use J2000.0 mean orbital elements (NASA reference). Comet positions use Keplerian elements with Kepler's equation solved iteratively. Voyager distances are calculated from launch date at their known cruise velocities (~17 km/s and ~15.4 km/s). Distances use √ scaling so everything from Mercury to the Kuiper Belt fits on screen.
                        </Text>
                    </View>
                </View>

                {/* Planet Positions */}
                <View style={styles.planetsContainer}>
                    <Text style={styles.sectionTitle}>🪐 Planet Positions</Text>
                    <Text style={styles.sectionExplainer}>
                        Each planet represents a different part of your personality. The zodiac sign it's in colors HOW that part of you expresses itself.
                    </Text>
                    <View style={styles.planetsGrid}>
                        {natalChart.planets.slice(0, 10).map((planet) => (
                            <View key={planet.name} style={styles.planetCard}>
                                <Text style={styles.planetSymbol}>{planetSymbols[planet.name]}</Text>
                                <Text style={styles.planetName}>{planet.name}</Text>
                                <Text style={styles.planetSign}>{planet.zodiac}</Text>
                                <Text style={styles.planetMeaning}>{PLANET_MEANINGS[planet.name]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* The 12 Houses */}
                <View style={styles.housesContainer}>
                    <Text style={styles.sectionTitle}>🏛️ The 12 Houses</Text>
                    <Text style={styles.sectionExplainer}>
                        While planets show WHAT energies you have and signs show HOW they express, houses show WHERE in life these energies play out. Think of houses as 12 different areas or "departments" of your life.
                    </Text>

                    {natalChart.houses && natalChart.houses.length > 0 ? (
                        <View style={styles.housesGrid}>
                            {HOUSE_INFO.map((house, index) => {
                                const houseDegree = natalChart.houses[index];
                                const houseSign = houseDegree !== undefined ? getZodiacFromDegree(houseDegree) : 'Unknown';
                                return (
                                    <View key={house.name} style={styles.houseCard}>
                                        <View style={styles.houseHeader}>
                                            <Text style={styles.houseEmoji}>{house.emoji}</Text>
                                            <Text style={styles.houseName}>{house.name}</Text>
                                        </View>
                                        <Text style={styles.houseTheme}>{house.theme}</Text>
                                        <Text style={styles.houseSign}>♒ {houseSign}</Text>
                                        <Text style={styles.houseDesc}>{house.description}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.housesFallback}>
                            <Text style={styles.housesFallbackText}>
                                House positions require exact birth time and location for accurate calculation. Enter your birth time as shown on your official birth certificate above to see your house placements!
                            </Text>
                            {/* Still show house meanings */}
                            <View style={styles.housesGrid}>
                                {HOUSE_INFO.map((house) => (
                                    <View key={house.name} style={styles.houseCard}>
                                        <View style={styles.houseHeader}>
                                            <Text style={styles.houseEmoji}>{house.emoji}</Text>
                                            <Text style={styles.houseName}>{house.name}</Text>
                                        </View>
                                        <Text style={styles.houseTheme}>{house.theme}</Text>
                                        <Text style={styles.houseDesc}>{house.description}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Personality Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>🌟 Your Cosmic Blueprint</Text>
                    <Text style={styles.summaryText}>
                        With your Sun in <Text style={styles.highlight}>{sunSign}</Text>, your core identity is shaped by{' '}
                        {sunElement === 'Fire' ? 'passion and initiative' :
                            sunElement === 'Earth' ? 'stability and practicality' :
                                sunElement === 'Air' ? 'intellect and communication' : 'emotion and intuition'}.
                        {'\n\n'}
                        Your Moon in <Text style={styles.highlight}>{moonSign}</Text> reveals your emotional nature -
                        how you process feelings and find comfort.
                        {'\n\n'}
                        With <Text style={styles.highlight}>{ascendantSign}</Text> Rising, others first perceive you as{' '}
                        {ASCENDANT_DESCRIPTIONS[ascendantSign]?.split('.')[0].toLowerCase() || 'unique'}.
                    </Text>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>
                    *For most accurate Rising sign, enter your exact birth time.
                    Chart calculated using astronomical positions.
                </Text>

                {/* ── FREE EDUCATIONAL CONTENT ── */}
                <View style={styles.eduSection}>
                    <Text style={styles.eduSectionTitle}>📚 FREE EDUCATIONAL GUIDES</Text>
                    <Text style={styles.eduSectionSub}>Tap any topic below to learn more</Text>

                    {/* ── THE 12 ZODIAC SIGNS ── */}
                    <TouchableOpacity style={styles.eduHeader} onPress={() => toggleEdu('signs')} activeOpacity={0.7}>
                        <Text style={styles.eduHeaderEmoji}>♈</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.eduHeaderTitle}>The Twelve Zodiac Signs</Text>
                            <Text style={styles.eduHeaderDesc}>Complete guide to all 12 astrological signs</Text>
                        </View>
                        <Text style={styles.eduChevron}>{expandedEdu === 'signs' ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {expandedEdu === 'signs' && (
                        <View style={styles.eduBody}>
                            <Text style={styles.eduIntro}>The zodiac is divided into 12 signs, each spanning 30° of the ecliptic. Each sign has a ruling planet, element, modality, and unique personality traits.</Text>

                            <Text style={styles.eduSignName}>♈ Aries (March 21 – April 19)</Text>
                            <Text style={styles.eduText}>Element: Fire  •  Modality: Cardinal  •  Ruler: Mars{"\n"}Aries is the first sign of the zodiac, symbolizing new beginnings and raw initiative. Aries natives are natural leaders — bold, energetic, and competitive. They thrive on challenges and are often the first to take action. Their shadow side can include impatience and impulsiveness. Body association: Head and face.</Text>

                            <Text style={styles.eduSignName}>♉ Taurus (April 20 – May 20)</Text>
                            <Text style={styles.eduText}>Element: Earth  •  Modality: Fixed  •  Ruler: Venus{"\n"}Taurus is the stabilizer of the zodiac. Grounded, patient, and sensual, Taurus natives value comfort, beauty, and security. They are incredibly reliable but can become stubborn when pushed. They have a deep appreciation for music, food, and nature. Body association: Throat and neck.</Text>

                            <Text style={styles.eduSignName}>♊ Gemini (May 21 – June 20)</Text>
                            <Text style={styles.eduText}>Element: Air  •  Modality: Mutable  •  Ruler: Mercury{"\n"}Gemini is the communicator — curious, witty, and versatile. Represented by the Twins, Gemini natives can see multiple sides of any situation. They love variety, conversation, and mental stimulation. They may struggle with consistency but excel at adapting. Body association: Arms, hands, and lungs.</Text>

                            <Text style={styles.eduSignName}>♋ Cancer (June 21 – July 22)</Text>
                            <Text style={styles.eduText}>Element: Water  •  Modality: Cardinal  •  Ruler: Moon{"\n"}Cancer is the nurturer — deeply intuitive, protective, and emotionally intelligent. Home and family are central to their identity. They feel things profoundly and have remarkable memories. Their shell protects a deeply sensitive interior. Body association: Chest, breasts, and stomach.</Text>

                            <Text style={styles.eduSignName}>♌ Leo (July 23 – August 22)</Text>
                            <Text style={styles.eduText}>Element: Fire  •  Modality: Fixed  •  Ruler: Sun{"\n"}Leo is the performer — creative, generous, and warm-hearted. Leos radiate confidence and have a natural flair for drama and self-expression. They are fiercely loyal and love to celebrate life. Pride can be both their greatest strength and weakness. Body association: Heart, spine, and upper back.</Text>

                            <Text style={styles.eduSignName}>♍ Virgo (August 23 – September 22)</Text>
                            <Text style={styles.eduText}>Element: Earth  •  Modality: Mutable  •  Ruler: Mercury{"\n"}Virgo is the analyst — practical, detail-oriented, and service-minded. Virgos have a gift for seeing what needs improvement and working tirelessly to fix it. They are modest, health-conscious, and prefer order. Perfectionism can lead to self-criticism. Body association: Digestive system and intestines.</Text>

                            <Text style={styles.eduSignName}>♎ Libra (September 23 – October 22)</Text>
                            <Text style={styles.eduText}>Element: Air  •  Modality: Cardinal  •  Ruler: Venus{"\n"}Libra is the diplomat — charming, fair-minded, and relationship-focused. Symbolized by the Scales, Libra strives for balance, harmony, and justice. They appreciate beauty and elegance in all forms. Indecision can be a challenge as they weigh every option. Body association: Kidneys and lower back.</Text>

                            <Text style={styles.eduSignName}>♏ Scorpio (October 23 – November 21)</Text>
                            <Text style={styles.eduText}>Element: Water  •  Modality: Fixed  •  Rulers: Pluto & Mars{"\n"}Scorpio is the transformer — intense, perceptive, and powerfully emotional. Scorpios experience life on a deep level and are drawn to life's mysteries. They possess remarkable willpower and resilience. Trust is earned, never given freely. Body association: Reproductive organs.</Text>

                            <Text style={styles.eduSignName}>♐ Sagittarius (November 22 – December 21)</Text>
                            <Text style={styles.eduText}>Element: Fire  •  Modality: Mutable  •  Ruler: Jupiter{"\n"}Sagittarius is the explorer — optimistic, philosophical, and freedom-loving. The Archer aims for the highest truths and broadest horizons. They are natural teachers and storytellers with infectious enthusiasm. Restlessness can make commitment challenging. Body association: Hips and thighs.</Text>

                            <Text style={styles.eduSignName}>♑ Capricorn (December 22 – January 19)</Text>
                            <Text style={styles.eduText}>Element: Earth  •  Modality: Cardinal  •  Ruler: Saturn{"\n"}Capricorn is the achiever — disciplined, ambitious, and responsible. The Sea-Goat climbs steadily toward its goals with patience and determination. Capricorns value tradition, structure, and legacy. They may appear reserved but possess a dry, understated humor. Body association: Bones, knees, and teeth.</Text>

                            <Text style={styles.eduSignName}>♒ Aquarius (January 20 – February 18)</Text>
                            <Text style={styles.eduText}>Element: Air  •  Modality: Fixed  •  Rulers: Uranus & Saturn{"\n"}Aquarius is the visionary — innovative, humanitarian, and independent. The Water Bearer pours knowledge to the world. Aquarians think ahead of their time and value community and progress. They can seem emotionally detached but care deeply about collective welfare. Body association: Ankles and circulatory system.</Text>

                            <Text style={styles.eduSignName}>♓ Pisces (February 19 – March 20)</Text>
                            <Text style={styles.eduText}>Element: Water  •  Modality: Mutable  •  Rulers: Neptune & Jupiter{"\n"}Pisces is the dreamer — compassionate, artistic, and spiritually attuned. The Fish swims between reality and imagination. Pisces natives are empathic and often absorb the emotions of those around them. They have a gift for creative and healing arts. Body association: Feet and lymphatic system.</Text>

                            <Text style={styles.eduNote}>The Elements: Fire signs (Aries, Leo, Sagittarius) are passionate and energetic. Earth signs (Taurus, Virgo, Capricorn) are practical and grounded. Air signs (Gemini, Libra, Aquarius) are intellectual and communicative. Water signs (Cancer, Scorpio, Pisces) are emotional and intuitive.</Text>
                        </View>
                    )}

                    {/* ── THE 36 DECANS ── */}
                    <TouchableOpacity style={styles.eduHeader} onPress={() => toggleEdu('decans')} activeOpacity={0.7}>
                        <Text style={styles.eduHeaderEmoji}>🔮</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.eduHeaderTitle}>The Thirty-Six Decans</Text>
                            <Text style={styles.eduHeaderDesc}>How each sign is subdivided into 3 unique decans</Text>
                        </View>
                        <Text style={styles.eduChevron}>{expandedEdu === 'decans' ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {expandedEdu === 'decans' && (
                        <View style={styles.eduBody}>
                            <Text style={styles.eduIntro}>Each zodiac sign spans 30° and is divided into three 10° segments called decans. The first decan (0°–9°) is ruled by the sign itself, the second (10°–19°) and third (20°–29°) are influenced by the other signs of the same element, adding layers of nuance.</Text>

                            <Text style={styles.eduDecanGroup}>♈ ARIES DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Mar 21–30) — Ruled by Mars: The purest Aries energy. Extremely courageous, pioneering, and competitive. These are the trailblazers who charge forward without hesitation.{"\n\n"}2nd Decan (Mar 31–Apr 9) — Sub-ruled by Sun (Leo): Aries with added warmth, creativity, and flair. More dramatic and generous. Natural performers who lead with charisma.{"\n\n"}3rd Decan (Apr 10–19) — Sub-ruled by Jupiter (Sagittarius): Aries with a philosophical edge. More optimistic, adventurous, and interested in big-picture thinking. The explorer-warriors.</Text>

                            <Text style={styles.eduDecanGroup}>♉ TAURUS DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Apr 20–29) — Ruled by Venus: The most sensual and comfort-seeking Taurus. Deep love of beauty, food, music, and physical pleasures. Steadfast and loyal.{"\n\n"}2nd Decan (Apr 30–May 9) — Sub-ruled by Mercury (Virgo): Taurus with analytical abilities. More practical and detail-oriented. Excellent with finances and planning.{"\n\n"}3rd Decan (May 10–20) — Sub-ruled by Saturn (Capricorn): Taurus with extra ambition and discipline. More serious and goal-driven. Builds lasting structures and legacies.</Text>

                            <Text style={styles.eduDecanGroup}>♊ GEMINI DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (May 21–31) — Ruled by Mercury: The quintessential communicator. Quick-witted, curious, and constantly seeking new information. The most talkative Gemini.{"\n\n"}2nd Decan (Jun 1–10) — Sub-ruled by Venus (Libra): Gemini with added charm and social grace. More diplomatic and relationship-oriented. Gifted in arts and mediation.{"\n\n"}3rd Decan (Jun 11–20) — Sub-ruled by Uranus (Aquarius): Gemini with a rebellious and inventive streak. More eccentric and forward-thinking. Drawn to technology and innovation.</Text>

                            <Text style={styles.eduDecanGroup}>♋ CANCER DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Jun 21–Jul 1) — Ruled by Moon: The most emotionally sensitive Cancer. Deeply nurturing, intuitive, and attached to home and family. Moods shift with the lunar cycle.{"\n\n"}2nd Decan (Jul 2–11) — Sub-ruled by Pluto (Scorpio): Cancer with intensity and depth. More secretive, protective, and psychologically perceptive. Powerful emotional resilience.{"\n\n"}3rd Decan (Jul 12–22) — Sub-ruled by Neptune (Pisces): Cancer with a dreamy, artistic quality. More compassionate and spiritually inclined. Vivid imagination and strong intuition.</Text>

                            <Text style={styles.eduDecanGroup}>♌ LEO DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Jul 23–Aug 1) — Ruled by Sun: The most radiant and confident Leo. Born leaders who light up every room. Creative, proud, and generous to the core.{"\n\n"}2nd Decan (Aug 2–11) — Sub-ruled by Jupiter (Sagittarius): Leo with expanded wisdom and optimism. More philosophical and adventurous. Love of travel and higher learning.{"\n\n"}3rd Decan (Aug 12–22) — Sub-ruled by Mars (Aries): Leo with extra fire and drive. More competitive, energetic, and action-oriented. Warriors with a regal bearing.</Text>

                            <Text style={styles.eduDecanGroup}>♍ VIRGO DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Aug 23–Sep 1) — Ruled by Mercury: The sharpest analytical mind. Extremely detail-oriented, health-conscious, and service-driven. The perfectionists.{"\n\n"}2nd Decan (Sep 2–11) — Sub-ruled by Saturn (Capricorn): Virgo with ambition and discipline. More career-focused and structured. Combines meticulous work ethic with long-term goals.{"\n\n"}3rd Decan (Sep 12–22) — Sub-ruled by Venus (Taurus): Virgo with an appreciation for beauty and comfort. More sensual and artistic. Finds harmony between practicality and pleasure.</Text>

                            <Text style={styles.eduDecanGroup}>♎ LIBRA DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Sep 23–Oct 2) — Ruled by Venus: The most charming and aesthetically gifted Libra. Masters of diplomacy, beauty, and social harmony. True romantics.{"\n\n"}2nd Decan (Oct 3–12) — Sub-ruled by Uranus (Aquarius): Libra with an unconventional edge. More intellectually independent and drawn to social justice. Progressive thinkers.{"\n\n"}3rd Decan (Oct 13–22) — Sub-ruled by Mercury (Gemini): Libra with enhanced communication skills. More witty, versatile, and socially active. Excellent mediators and writers.</Text>

                            <Text style={styles.eduDecanGroup}>♏ SCORPIO DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Oct 23–Nov 1) — Ruled by Pluto: The most intense and transformative Scorpio. Deeply passionate, secretive, and psychologically penetrating. Masters of regeneration.{"\n\n"}2nd Decan (Nov 2–11) — Sub-ruled by Neptune (Pisces): Scorpio with added psychic sensitivity and compassion. More spiritual and artistic. Drawn to healing and mysticism.{"\n\n"}3rd Decan (Nov 12–21) — Sub-ruled by Moon (Cancer): Scorpio with deep emotional attachment to family and home. More nurturing beneath the tough exterior. Protectors of loved ones.</Text>

                            <Text style={styles.eduDecanGroup}>♐ SAGITTARIUS DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Nov 22–Dec 1) — Ruled by Jupiter: The ultimate adventurer and truth-seeker. Endlessly optimistic, philosophical, and drawn to foreign cultures and higher education.{"\n\n"}2nd Decan (Dec 2–11) — Sub-ruled by Mars (Aries): Sagittarius with extra fire and determination. More competitive and action-oriented. Warrior-philosophers.{"\n\n"}3rd Decan (Dec 12–21) — Sub-ruled by Sun (Leo): Sagittarius with creative flair and charisma. More theatrical and generous. Natural entertainers who inspire others.</Text>

                            <Text style={styles.eduDecanGroup}>♑ CAPRICORN DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Dec 22–31) — Ruled by Saturn: The most disciplined and ambitious Capricorn. Hard-working, traditional, and focused on building lasting achievements.{"\n\n"}2nd Decan (Jan 1–9) — Sub-ruled by Venus (Taurus): Capricorn with a love of comfort and beauty. More sensual and financially savvy. Builds wealth and enjoys it.{"\n\n"}3rd Decan (Jan 10–19) — Sub-ruled by Mercury (Virgo): Capricorn with exceptional analytical skills. More detail-oriented and communicative. Excels in business and organization.</Text>

                            <Text style={styles.eduDecanGroup}>♒ AQUARIUS DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Jan 20–29) — Ruled by Uranus: The most innovative and rebellious Aquarius. Visionary thinkers who break conventions. Champions of progress and humanitarian causes.{"\n\n"}2nd Decan (Jan 30–Feb 8) — Sub-ruled by Mercury (Gemini): Aquarius with enhanced communication gifts. More social, witty, and intellectually versatile. Brilliant networkers.{"\n\n"}3rd Decan (Feb 9–18) — Sub-ruled by Venus (Libra): Aquarius with a stronger sense of beauty and relationships. More diplomatic and artistic. Social visionaries.</Text>

                            <Text style={styles.eduDecanGroup}>♓ PISCES DECANS</Text>
                            <Text style={styles.eduText}>1st Decan (Feb 19–28/29) — Ruled by Neptune: The most dreamy and spiritually attuned Pisces. Deeply compassionate, artistic, and connected to the unseen world.{"\n\n"}2nd Decan (Mar 1–10) — Sub-ruled by Moon (Cancer): Pisces with strong emotional bonds and nurturing instincts. More devoted to family and home. Deeply empathetic.{"\n\n"}3rd Decan (Mar 11–20) — Sub-ruled by Pluto (Scorpio): Pisces with intensity and transformative power. More determined and psychologically insightful. The mystic healers.</Text>

                            <Text style={styles.eduNote}>Finding your decan: Locate your Sun sign above, then find the date range that includes your birthday. The decan's sub-ruler adds a secondary influence that refines your Sun sign's expression.</Text>
                        </View>
                    )}

                    {/* ── ASTROLOGY QUICK REFERENCE ── */}
                    <TouchableOpacity style={styles.eduHeader} onPress={() => toggleEdu('reference')} activeOpacity={0.7}>
                        <Text style={styles.eduHeaderEmoji}>📋</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.eduHeaderTitle}>Astrology Quick Reference</Text>
                            <Text style={styles.eduHeaderDesc}>Symbols, planets, houses, and aspects at a glance</Text>
                        </View>
                        <Text style={styles.eduChevron}>{expandedEdu === 'reference' ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {expandedEdu === 'reference' && (
                        <View style={styles.eduBody}>
                            <Text style={styles.eduRefHeading}>THE PLANETS & THEIR MEANINGS</Text>
                            <Text style={styles.eduText}>☉ Sun — Your core identity, ego, and life purpose. The essential "you."{"\n"}☽ Moon — Your emotions, instincts, and inner world. How you feel and nurture.{"\n"}☿ Mercury — Communication, thinking, and learning style.{"\n"}♀ Venus — Love, beauty, values, and what you attract.{"\n"}♂ Mars — Drive, energy, passion, and how you take action.{"\n"}♃ Jupiter — Expansion, luck, wisdom, and abundance.{"\n"}♄ Saturn — Discipline, structure, responsibility, and life lessons.{"\n"}♅ Uranus — Innovation, rebellion, sudden change, and freedom.{"\n"}♆ Neptune — Dreams, intuition, spirituality, and illusion.{"\n"}♇ Pluto — Transformation, power, death and rebirth, and deep psychology.</Text>

                            <Text style={styles.eduRefHeading}>THE 12 HOUSES</Text>
                            <Text style={styles.eduText}>1st House — Self, appearance, and first impressions (ruled by Aries){"\n"}2nd House — Money, possessions, and personal values (Taurus){"\n"}3rd House — Communication, siblings, and short travel (Gemini){"\n"}4th House — Home, family, roots, and emotional foundations (Cancer){"\n"}5th House — Creativity, romance, children, and fun (Leo){"\n"}6th House — Health, daily routines, and service to others (Virgo){"\n"}7th House — Partnerships, marriage, and one-on-one relationships (Libra){"\n"}8th House — Transformation, shared resources, and deep intimacy (Scorpio){"\n"}9th House — Travel, higher education, philosophy, and beliefs (Sagittarius){"\n"}10th House — Career, public reputation, and life achievements (Capricorn){"\n"}11th House — Friends, community, hopes, and wishes (Aquarius){"\n"}12th House — Spirituality, hidden matters, and the subconscious (Pisces)</Text>

                            <Text style={styles.eduRefHeading}>MAJOR ASPECTS</Text>
                            <Text style={styles.eduText}>☌ Conjunction (0°) — Two planets in the same place. Intense blending of energies. Can be harmonious or tense depending on the planets.{"\n\n"}⚹ Sextile (60°) — A friendly, cooperative aspect. Opportunities that require some effort to activate. Generally positive.{"\n\n"}□ Square (90°) — Tension and challenge. Creates friction that drives growth. The most dynamic aspect — problems that push you to evolve.{"\n\n"}△ Trine (120°) — The most harmonious aspect. Natural talents and easy flow of energy. Gifts that come effortlessly.{"\n\n"}☍ Opposition (180°) — Two planets facing each other. Creates awareness through contrast. Requires balance between opposing needs.</Text>

                            <Text style={styles.eduRefHeading}>ELEMENTS & MODALITIES</Text>
                            <Text style={styles.eduText}>🔥 Fire (Aries, Leo, Sagittarius) — Passion, energy, inspiration, courage{"\n"}🌍 Earth (Taurus, Virgo, Capricorn) — Practicality, stability, material mastery{"\n"}💨 Air (Gemini, Libra, Aquarius) — Intellect, communication, social connection{"\n"}💧 Water (Cancer, Scorpio, Pisces) — Emotion, intuition, depth, empathy{"\n\n"}Cardinal (Aries, Cancer, Libra, Capricorn) — Initiators who start new things{"\n"}Fixed (Taurus, Leo, Scorpio, Aquarius) — Sustainers who maintain and deepen{"\n"}Mutable (Gemini, Virgo, Sagittarius, Pisces) — Adapters who embrace change</Text>

                            <Text style={styles.eduRefHeading}>READING YOUR NATAL CHART</Text>
                            <Text style={styles.eduText}>1. Start with your "Big Three" — Sun sign (core identity), Moon sign (emotional nature), and Rising/Ascendant sign (how others see you).{"\n\n"}2. Look at which houses your planets fall in — this shows WHICH area of life that planet's energy expresses.{"\n\n"}3. Check the aspects between planets — these show how different parts of your personality interact with each other.{"\n\n"}4. Note planet clusters — if several planets are in one sign or house, that area is emphasized in your life.{"\n\n"}5. Your chart is a snapshot of the sky at the exact moment of your birth. It's unique to you — no two charts are identical.</Text>

                            <Text style={styles.eduNote}>Remember: Astrology is a symbolic language for understanding personality patterns. Your natal chart reveals tendencies and potentials, not fixed destiny. Free will always plays the most important role in your life story.</Text>
                        </View>
                    )}

                    {/* ── THE ASTROLOGICAL AGES ── */}
                    <TouchableOpacity style={styles.eduHeader} onPress={() => toggleEdu('ages')} activeOpacity={0.7}>
                        <Text style={styles.eduHeaderEmoji}>🌀</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.eduHeaderTitle}>The Astrological Ages</Text>
                            <Text style={styles.eduHeaderDesc}>The ~26,000-year cosmic clock that shapes civilizations</Text>
                        </View>
                        <Text style={styles.eduChevron}>{expandedEdu === 'ages' ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {expandedEdu === 'ages' && (
                        <View style={styles.eduBody}>
                            <Text style={styles.eduIntro}>
                                The Astrological Ages are one of the grandest cycles in astrology — a slow, majestic clock spanning roughly 26,000 years called the Great Year. Each "age" lasts about 2,160 years and is defined by which zodiac constellation the Sun rises in front of during the spring equinox (March 20–21).
                            </Text>

                            <Text style={styles.eduRefHeading}>HOW IT WORKS: PRECESSION OF THE EQUINOXES</Text>
                            <Text style={styles.eduText}>
                                Earth doesn't spin perfectly upright — it wobbles slowly like a top. This wobble, called axial precession, causes the point where the Sun crosses the celestial equator at the spring equinox to drift backward through the zodiac constellations at a rate of about 1° every 72 years.{"\n\n"}Because it moves backward (from Aries → Pisces → Aquarius rather than the usual Aries → Taurus → Gemini), the ages run in REVERSE zodiac order. One complete cycle through all 12 signs takes approximately 25,772 years — the Platonic Year or Great Year.{"\n\n"}This isn't astrology's invention — it's an observable astronomical phenomenon first documented by the Greek astronomer Hipparchus around 130 BC, though ancient Egyptians and Babylonians may have known about it even earlier.
                            </Text>

                            <Text style={styles.eduRefHeading}>THE AGES IN ORDER (Most Recent First)</Text>

                            <Text style={styles.eduSignName}>♒ Age of Aquarius (~2100 AD – ~4260 AD)</Text>
                            <Text style={styles.eduText}>
                                Status: Approaching — we are in the transition period{"\n\n"}The coming age. Aquarius is ruled by Uranus and associated with innovation, technology, humanitarianism, collective consciousness, and breaking from tradition. Many astrologers believe the shift is already underway, evidenced by the rise of the internet, social movements, space exploration, and the information age.{"\n\n"}Themes: Technology, equality, global networks, decentralization, individual freedom within collective unity, scientific breakthroughs, and humanitarian ideals.{"\n\n"}The famous song "Aquarius" from the 1967 musical Hair captured the cultural excitement about this dawning age.
                            </Text>

                            <Text style={styles.eduSignName}>♓ Age of Pisces (~1 AD – ~2100 AD)</Text>
                            <Text style={styles.eduText}>
                                Status: Current / ending{"\n\n"}The age we are living in — or transitioning out of. Pisces is ruled by Neptune and associated with faith, compassion, sacrifice, imagination, and spirituality. This age saw the rise of Christianity (the fish is a primary Christian symbol), Islam, and other major world religions. Art, music, and mysticism flourished.{"\n\n"}Themes: Faith, belief systems, organized religion, martyrdom, compassion, artistic expression, escapism, and the tension between spiritual transcendence and material suffering.{"\n\n"}It's no coincidence that the Christian era aligns almost exactly with the Age of Pisces — early Christians used the fish symbol (Ichthys) as their secret sign.
                            </Text>

                            <Text style={styles.eduSignName}>♈ Age of Aries (~2100 BC – ~1 AD)</Text>
                            <Text style={styles.eduText}>
                                The age of warriors, conquest, and individual heroism. Aries is ruled by Mars — the god of war. This period saw the rise of the Greek and Roman empires, the Iron Age, the spread of monotheism (Moses, the Ram), and the glorification of the warrior-hero archetype.{"\n\n"}Themes: War, conquest, empire-building, the individual hero, iron and fire, the shift from polytheism to monotheism.{"\n\n"}The symbolism is striking: Moses came down from Mount Sinai to find people worshipping the Golden Calf (Taurus — the previous age) and commanded them to stop, ushering in the Age of the Ram.
                            </Text>

                            <Text style={styles.eduSignName}>♉ Age of Taurus (~4260 BC – ~2100 BC)</Text>
                            <Text style={styles.eduText}>
                                The age of agriculture, earth worship, and material abundance. Taurus is ruled by Venus and associated with fertility, beauty, and the physical world. This era saw the birth of agriculture, the construction of the Egyptian pyramids, and widespread bull worship (Apis bull in Egypt, Minoan bull cults in Crete).{"\n\n"}Themes: Agriculture, fertility cults, earth goddesses, material wealth, construction of monuments, the birth of civilization as we know it.{"\n\n"}The reverence for the bull across multiple ancient cultures — from Egypt to Mesopotamia to the Indus Valley — reflects the zodiac age that defined the era.
                            </Text>

                            <Text style={styles.eduSignName}>♊ Age of Gemini (~6420 BC – ~4260 BC)</Text>
                            <Text style={styles.eduText}>
                                The age of communication and the written word. Gemini is ruled by Mercury — the messenger. This period saw the development of early writing systems (proto-cuneiform), the rise of trade and commerce, and the spread of knowledge through early record-keeping. Twin symbolism appeared widely in mythology.{"\n\n"}Themes: Writing, trade, communication, duality and twin mythology, the birth of language and record-keeping.
                            </Text>

                            <Text style={styles.eduSignName}>♋ Age of Cancer (~8580 BC – ~6420 BC)</Text>
                            <Text style={styles.eduText}>
                                The age of home, hearth, and the Mother Goddess. Cancer is ruled by the Moon and associated with nurturing, protection, and emotional bonds. This era saw the transition from nomadic hunter-gatherer life to settled communities. The first permanent homes and villages were built. Moon worship and mother goddess cults dominated spirituality.{"\n\n"}Themes: Settling down, building homes, domestication of animals, moon worship, the Mother Goddess, the birth of community.
                            </Text>

                            <Text style={styles.eduSignName}>♌ Age of Leo (~10,740 BC – ~8580 BC)</Text>
                            <Text style={styles.eduText}>
                                The age of the Sun, fire, and primal creativity. Leo is ruled by the Sun. This period corresponds to the end of the last Ice Age, when the warming Sun literally transformed the planet. Cave paintings from this era (Lascaux, Altamira) represent some of humanity's first creative expressions. Fire was central to survival and ritual.{"\n\n"}Themes: The Sun, fire, cave art, primal creativity, the end of the Ice Age, survival through warmth and light.{"\n\n"}Some researchers believe the Great Sphinx of Giza, with its lion body, was originally constructed or conceived during this age — facing the rising Sun on the equinox.
                            </Text>

                            <Text style={styles.eduRefHeading}>WHY AGES MATTER</Text>
                            <Text style={styles.eduText}>
                                Astrological ages provide a framework for understanding how collective human consciousness shifts over millennia. While individual natal charts describe a person's life, the ages describe civilization's journey.{"\n\n"}Key points to remember:{"\n"}• Ages last ~2,160 years each{"\n"}• They move BACKWARD through the zodiac{"\n"}• Transitions between ages are gradual (100-300 year overlap){"\n"}• A full cycle (Great Year) takes ~25,772 years{"\n"}• Each age carries the themes of its zodiac sign{"\n"}• We are currently in the Pisces-to-Aquarius transition{"\n\n"}The exact boundaries between ages are debated — there's no single moment when one age ends and another begins. Think of it like the gradual shift from winter to spring rather than a light switch.
                            </Text>

                            <Text style={styles.eduNote}>
                                The Astrological Ages remind us that we are part of something far larger than our individual lives. The same sky that shapes your natal chart has been slowly turning its grand wheel for tens of thousands of years, and each civilization has been colored by which constellation greeted the Sun on the first morning of spring.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back to Fun Facts</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Time Input Modal */}
            <Modal visible={showTimeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Birth Time</Text>
                        <Text style={styles.modalHint}>Format: HH:MM (24-hour)</Text>
                        <TextInput
                            style={styles.timeInput}
                            value={birthTime}
                            onChangeText={setBirthTime}
                            placeholder="12:00"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                        />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowTimeModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Location Input Modal */}
            <Modal visible={showLocationModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📍 Birth Location</Text>
                        <Text style={styles.modalHint}>Enter city and state (e.g., "Chicago, IL")</Text>
                        <TextInput
                            style={styles.locationInput}
                            value={birthLocation}
                            onChangeText={setBirthLocation}
                            placeholder="City, State"
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                        {birthLocation && (
                            <Text style={coordinates.found ? styles.coordsFound : styles.coordsNotFound}>
                                {coordinates.found
                                    ? `✓ Found: ${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W`
                                    : '✗ City not found - try "City, State" format'}
                            </Text>
                        )}
                        <Text style={styles.locationNote}>
                            Supports major US cities. Location affects Rising sign & house placements.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowLocationModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Birth Date Picker */}
            <ScrollableDatePicker
                visible={showDateModal}
                date={birthDate}
                onDateChange={(newDate) => {
                    setBirthDate(newDate);
                    originalBirthDateRef.current = newDate;
                    dayOffsetRef.current = 0;
                    setDayOffset(0);
                    spinAccum.current = 0;
                    solarSpinAccum.current = 0;
                }}
                onClose={() => setShowDateModal(false)}
                title="Select Birth Date"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    emoji: {
        fontSize: 55,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    subtitleLocation: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,215,0,0.85)',
        marginTop: 6,
    },
    inlineInputSection: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.4)',
    },
    inlineInputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffd54f',
        textAlign: 'center',
        marginBottom: 14,
    },
    compactEditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    compactEditButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    compactEditText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.85)',
    },
    timeButton: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    timeButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    timeButtonHint: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    locationFound: {
        borderWidth: 2,
        borderColor: '#4caf50',
    },
    locationFoundText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#81c784',
        marginTop: 4,
    },
    accuracyWarning: {
        backgroundColor: 'rgba(255,193,7,0.2)',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,193,7,0.4)',
    },
    accuracyWarningText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffd54f',
        textAlign: 'center',
        lineHeight: 18,
    },
    locationInput: {
        borderWidth: 2,
        borderColor: '#1a237e',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: 'center',
        width: '90%',
        marginBottom: 8,
    },
    coordsFound: {
        fontSize: 15,
        color: '#4caf50',
        marginBottom: 8,
        fontWeight: '600',
    },
    coordsNotFound: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 8,
    },
    locationNote: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionExplainer: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 21,
        paddingHorizontal: 8,
    },
    accuracyBanner: {
        backgroundColor: 'rgba(255,193,7,0.15)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#ffd54f',
        alignItems: 'center',
    },
    accuracyBannerIcon: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    accuracyBannerTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#ffd54f',
        marginBottom: 8,
        textAlign: 'center',
    },
    accuracyBannerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 21,
        textAlign: 'center',
    },
    educationCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    educationTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#ffd54f',
        marginBottom: 10,
        textAlign: 'center',
    },
    educationText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.95)',
        lineHeight: 23,
        textAlign: 'center',
    },
    bigThreeContainer: {
        marginBottom: 20,
    },
    bigThreeCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
    },
    bigThreeItem: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    bigThreeLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        letterSpacing: 1,
    },
    bigThreeSign: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a237e',
        marginVertical: 4,
    },
    bigThreeDesc: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        lineHeight: 20,
    },
    bigThreeDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    elementCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    elementTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#fff',
    },
    elementDesc: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    elementExplainer: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    chartContainer: {
        marginBottom: 20,
    },
    chartWrapper: {
        backgroundColor: '#1a237e',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 24,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        position: 'relative',
    },
    wheelRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    zodiacSidebar: {
        flex: 1,
        marginRight: 2,
        overflow: 'visible',
    },
    planetSidebar: {
        flex: 1,
        marginLeft: 2,
        overflow: 'visible',
    },
    planetSidebarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 1,
        paddingHorizontal: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 4,
        marginBottom: 1.5,
    },
    zodiacSidebarCols: {
        flexDirection: 'row',
        flex: 1,
        gap: 1,
        overflow: 'visible',
    },
    zodiacSidebarCol: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        overflow: 'visible',
    },
    sidebarHeader: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffd54f',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    sidebarZodiacItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 1,
        backgroundColor: 'rgba(106,13,173,0.35)',
        borderRadius: 4,
        overflow: 'visible',
    },
    sidebarPlanetItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 4,
        overflow: 'visible',
    },
    sidebarSym: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        includeFontPadding: false,
    },
    sidebarMiniLabel: {
        fontSize: 7,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        includeFontPadding: false,
    },
    sidebarMiniLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
    },
    spinHint: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginBottom: 10,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.4)',
    },
    spinHintText: {
        fontSize: 15,
        color: '#ffd54f',
        textAlign: 'center',
        fontWeight: '700',
    },
    spinHintDetail: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'left',
        lineHeight: 21,
        marginTop: 4,
    },
    spinOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        zIndex: 10,
        borderWidth: 1,
        borderColor: '#ffd700',
    },
    spinOverlayDate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffd700',
        textAlign: 'center',
    },
    spinOverlayDelta: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#ffd700',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffd700',
        textAlign: 'center',
    },
    legendContainer: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    legendTitle: {
        fontSize: 21,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 14,
    },
    legendTwoColumn: {
        flexDirection: 'row',
        gap: 10,
    },
    legendLeftCol: {
        flex: 1,
    },
    legendRightCol: {
        flex: 1.3,
    },
    legendSectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ffd54f',
        marginTop: 0,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    legendZodiacRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        backgroundColor: 'rgba(106,13,173,0.3)',
        borderRadius: 6,
        marginBottom: 3,
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        width: '48%' as any,
    },
    legendPlanetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 6,
        marginBottom: 3,
    },
    legendCardinalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 6,
        marginBottom: 3,
    },
    legendSymbol: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 8,
        width: 26,
        textAlign: 'center',
    },
    legendTextWrap: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    legendDesc: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    legendZodiacSym: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 6,
        width: 22,
        textAlign: 'center',
    },
    legendZodiacLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    legendColorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    planetsContainer: {
        marginBottom: 20,
    },
    solarSystemContainer: {
        marginBottom: 24,
    },
    solarSystemWheel: {
        backgroundColor: '#05051a',
        borderRadius: 16,
        padding: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        position: 'relative' as const,
    },
    solarSpinOverlay: {
        position: 'absolute' as const,
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        zIndex: 10,
        borderWidth: 1,
        borderColor: '#ffd700',
    },
    solarDateLabel: {
        position: 'absolute' as const,
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    solarDateText: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#FFD54F',
    },
    timeSliderContainer: {
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 8,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    timeSliderTitle: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: '#FFD54F',
        textAlign: 'center' as const,
        marginBottom: 8,
    },
    timeSliderRow: {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        gap: 6,
    },
    timeSliderBtn: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        minWidth: 38,
        alignItems: 'center' as const,
    },
    timeSliderResetBtn: {
        backgroundColor: 'rgba(255,213,79,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,213,79,0.4)',
    },
    timeSliderBtnText: {
        fontSize: 12,
        fontWeight: '700' as const,
        color: '#fff',
    },
    timeSliderOffset: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center' as const,
        marginTop: 6,
    },
    solarKeyGrid: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: 6,
        marginTop: 4,
    },
    solarKeySectionHeader: {
        fontSize: 15,
        fontWeight: '700' as const,
        color: '#ffd54f',
        marginTop: 14,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    solarKeyItem: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 8,
        width: '48%' as any,
    },
    solarKeyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    solarKeyName: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: '#fff',
        flex: 1,
    },
    solarKeyOrbit: {
        fontSize: 11,
        fontWeight: 'bold' as const,
        color: 'rgba(255,255,255,0.6)',
    },
    solarNote: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    solarNoteText: {
        fontSize: 12,
        fontWeight: 'bold' as const,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
        textAlign: 'center' as const,
    },
    housesContainer: {
        marginBottom: 20,
    },
    housesGrid: {
        gap: 10,
    },
    houseCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    houseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    houseEmoji: {
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 8,
    },
    houseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    houseTheme: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5c6bc0',
        marginBottom: 2,
    },
    houseSign: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7986cb',
        marginBottom: 6,
    },
    houseDesc: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        lineHeight: 20,
    },
    housesFallback: {
        marginTop: 8,
    },
    housesFallbackText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    planetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    planetCard: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 12,
        width: '48%',
        marginBottom: 10,
        alignItems: 'center',
    },
    planetSymbol: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    planetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a237e',
        marginTop: 4,
    },
    planetSign: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    planetMeaning: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 23,
        textAlign: 'center',
    },
    highlight: {
        color: '#ffd54f',
        fontWeight: 'bold',
    },
    disclaimer: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    backText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    // Educational content section
    eduSection: {
        marginTop: 24,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#ffd700',
    },
    eduSectionTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#ffd700',
        textAlign: 'center',
    },
    eduSectionSub: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 14,
    },
    eduHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    eduHeaderEmoji: { fontSize: 31, fontWeight: 'bold', marginRight: 12 },
    eduHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
    eduHeaderDesc: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    eduChevron: { fontSize: 16, fontWeight: 'bold', color: '#ffd700', marginLeft: 8 },
    eduBody: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 16,
        marginTop: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    eduIntro: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    eduSignName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ffd700',
        marginTop: 14,
        marginBottom: 4,
    },
    eduDecanGroup: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ffd700',
        marginTop: 18,
        marginBottom: 6,
        textAlign: 'center',
    },
    eduRefHeading: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ffd700',
        marginTop: 18,
        marginBottom: 6,
    },
    eduText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
        marginBottom: 4,
    },
    eduNote: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#a7c4e0',
        lineHeight: 20,
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ffd700',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 8,
    },
    modalHint: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 16,
    },
    timeInput: {
        borderWidth: 2,
        borderColor: '#1a237e',
        borderRadius: 8,
        padding: 12,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '60%',
        marginBottom: 16,
    },
    modalButton: {
        backgroundColor: '#1a237e',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    horoscopeButton: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    horoscopeButtonEmoji: {
        fontSize: 35,
        fontWeight: 'bold',
        marginRight: 12,
    },
    horoscopeButtonContent: {
        flex: 1,
    },
    horoscopeButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#311b92',
    },
    horoscopeButtonSubtitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 2,
    },
    horoscopeButtonArrow: {
        fontSize: 23,
        color: '#311b92',
        fontWeight: 'bold',
    },
});
