import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Circle, G, Line, Svg, Text as SvgText } from 'react-native-svg';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getAllPDFResources, openPDF } from '../data/utils/pdf-helper';
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
    const birthDate = new Date(route.params.birthDate);
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

    // Simple natal chart rendering
    const svgSize = 280;
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
        <LinearGradient colors={['#1a237e', '#283593', '#3949ab']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔮</Text>
                    <Text style={styles.title}>Your Natal Chart</Text>
                    <Text style={styles.subtitle}>{formattedDate}</Text>
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

                {/* Birth Time Input */}
                <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimeModal(true)}
                >
                    <Text style={styles.timeButtonText}>🕐 Birth Time: {birthTime}</Text>
                    <Text style={styles.timeButtonHint}>Tap to change for accurate Rising sign</Text>
                </TouchableOpacity>

                {/* Birth Location Input */}
                <TouchableOpacity
                    style={[styles.timeButton, coordinates.found && styles.locationFound]}
                    onPress={() => setShowLocationModal(true)}
                >
                    <Text style={styles.timeButtonText}>📍 Birth Location: {birthLocation || 'Not Set'}</Text>
                    {coordinates.found ? (
                        <Text style={styles.locationFoundText}>✓ Coordinates found: {latitude.toFixed(2)}°N, {Math.abs(longitude).toFixed(2)}°W</Text>
                    ) : (
                        <Text style={styles.timeButtonHint}>Enter city for accurate house placements</Text>
                    )}
                </TouchableOpacity>

                {/* Accuracy indicator */}
                {(!birthLocation || !coordinates.found) && (
                    <View style={styles.accuracyWarning}>
                        <Text style={styles.accuracyWarningText}>
                            ⚠️ Chart shown uses default location (New York). For accurate Rising sign and houses, enter your birth city above.
                        </Text>
                    </View>
                )}

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

                {/* Natal Chart Wheel */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>🌌 Your Birth Chart</Text>
                    <Text style={styles.sectionExplainer}>
                        This wheel shows where each planet was at your birth. The outer ring shows the 12 zodiac signs (♈♉♊ etc.), and the symbols inside (☉☽♂ etc.) show where each planet was positioned. The dot at the center represents YOU - you are at the center of your own cosmic map.
                    </Text>
                    <View style={styles.chartWrapper}>
                        <Svg width={svgSize} height={svgSize}>
                            {/* Outer circle */}
                            <Circle cx={cx} cy={cy} r={r_outer} stroke="#fff" strokeWidth={2} fill="rgba(255,255,255,0.1)" />
                            <Circle cx={cx} cy={cy} r={r_sign} stroke="rgba(255,255,255,0.3)" strokeWidth={1} fill="none" />

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
                                            fill={sign === sunSign ? '#ffd54f' : '#fff'}
                                            fontSize={14}
                                            fontWeight={sign === sunSign ? 'bold' : 'normal'}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                        >
                                            {signSymbols[i]}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Planet positions */}
                            {natalChart.planets.slice(0, 10).map((planet, i) => {
                                const pos = positionOnCircle(planet.longitude, r_planet);
                                const symbol = planetSymbols[planet.name] || '●';
                                return (
                                    <SvgText
                                        key={planet.name}
                                        x={pos.x}
                                        y={pos.y}
                                        fill={planet.name === 'Sun' ? '#ffd54f' : planet.name === 'Moon' ? '#b0bec5' : '#fff'}
                                        fontSize={16}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                    >
                                        {symbol}
                                    </SvgText>
                                );
                            })}

                            {/* Center dot */}
                            <Circle cx={cx} cy={cy} r={4} fill="#fff" />
                        </Svg>
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

                {/* FREE Educational Downloadable PDFs */}
                <View style={styles.pdfSection}>
                    <Text style={styles.pdfSectionTitle}>📚 FREE EDUCATIONAL DOWNLOADABLE</Text>
                    <Text style={styles.pdfSectionSubtitle}>NATAL CHART DOCUMENTS WITH ILLUSTRATIONS</Text>
                    {getAllPDFResources().map((pdf) => (
                        <TouchableOpacity
                            key={pdf.key}
                            style={styles.pdfDownloadButton}
                            onPress={() => openPDF(pdf.key)}
                        >
                            <Text style={styles.pdfIcon}>📄</Text>
                            <View style={styles.pdfTextContainer}>
                                <Text style={styles.pdfName}>{pdf.name}</Text>
                                <Text style={styles.pdfDescription}>{pdf.description}</Text>
                            </View>
                            <Text style={styles.pdfDownloadIcon}>⬇️</Text>
                        </TouchableOpacity>
                    ))}
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
        fontSize: 50,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    timeButton: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    timeButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    timeButtonHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    locationFound: {
        borderWidth: 2,
        borderColor: '#4caf50',
    },
    locationFoundText: {
        fontSize: 12,
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
        fontSize: 12,
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
        fontSize: 13,
        color: '#4caf50',
        marginBottom: 8,
        fontWeight: '600',
    },
    coordsNotFound: {
        fontSize: 13,
        color: '#f44336',
        marginBottom: 8,
    },
    locationNote: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionExplainer: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 19,
        paddingHorizontal: 8,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffd54f',
        marginBottom: 10,
        textAlign: 'center',
    },
    educationText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.95)',
        lineHeight: 22,
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
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        letterSpacing: 1,
    },
    bigThreeSign: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
        marginVertical: 4,
    },
    bigThreeDesc: {
        fontSize: 13,
        color: '#555',
        textAlign: 'center',
        lineHeight: 18,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    elementDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    elementExplainer: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    chartContainer: {
        marginBottom: 20,
    },
    chartWrapper: {
        backgroundColor: '#1E5B3D',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    planetsContainer: {
        marginBottom: 20,
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
        fontSize: 20,
        marginRight: 8,
    },
    houseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    houseTheme: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5c6bc0',
        marginBottom: 2,
    },
    houseSign: {
        fontSize: 13,
        color: '#7986cb',
        marginBottom: 6,
    },
    houseDesc: {
        fontSize: 12,
        color: '#555',
        lineHeight: 18,
    },
    housesFallback: {
        marginTop: 8,
    },
    housesFallbackText: {
        fontSize: 13,
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
        fontSize: 24,
    },
    planetName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a237e',
        marginTop: 4,
    },
    planetSign: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    planetMeaning: {
        fontSize: 10,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
        textAlign: 'center',
    },
    highlight: {
        color: '#ffd54f',
        fontWeight: 'bold',
    },
    disclaimer: {
        fontSize: 11,
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
        fontSize: 16,
        fontWeight: '600',
    },
    // PDF Download Section Styles
    pdfSection: {
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#ffd700',
    },
    pdfSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffd700',
        textAlign: 'center',
    },
    pdfSectionSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    pdfDownloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    pdfIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    pdfTextContainer: {
        flex: 1,
    },
    pdfName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    pdfDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    pdfDownloadIcon: {
        fontSize: 20,
        marginLeft: 8,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 8,
    },
    modalHint: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
    },
    timeInput: {
        borderWidth: 2,
        borderColor: '#1a237e',
        borderRadius: 8,
        padding: 12,
        fontSize: 24,
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
        fontSize: 16,
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
        fontSize: 32,
        marginRight: 12,
    },
    horoscopeButtonContent: {
        flex: 1,
    },
    horoscopeButtonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#311b92',
    },
    horoscopeButtonSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    horoscopeButtonArrow: {
        fontSize: 20,
        color: '#311b92',
        fontWeight: 'bold',
    },
});
