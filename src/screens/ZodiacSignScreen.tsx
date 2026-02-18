import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ZodiacSign'>;

const { width: screenWidth } = Dimensions.get('window');

interface ZodiacData {
    sign: string;
    symbol: string;
    emoji: string;
    element: string;
    elementEmoji: string;
    quality: string;
    rulingPlanet: string;
    planetEmoji: string;
    dates: string;
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    compatibility: string[];
    luckyNumbers: number[];
    luckyColors: string[];
    description: string;
}

function getZodiacData(date: Date): ZodiacData {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiacSigns: ZodiacData[] = [
        {
            sign: 'Aries',
            symbol: 'Ram',
            emoji: '♈',
            element: 'Fire',
            elementEmoji: '🔥',
            quality: 'Cardinal',
            rulingPlanet: 'Mars',
            planetEmoji: '♂️',
            dates: 'March 21 - April 19',
            traits: ['Bold', 'Ambitious', 'Energetic', 'Pioneering', 'Competitive'],
            strengths: ['Courageous', 'Determined', 'Confident', 'Enthusiastic', 'Optimistic'],
            weaknesses: ['Impatient', 'Moody', 'Short-tempered', 'Impulsive', 'Aggressive'],
            compatibility: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
            luckyNumbers: [1, 8, 17],
            luckyColors: ['Red', 'Orange'],
            description: 'Aries is the first sign of the zodiac, and those born under this sign are natural-born leaders. They dive headfirst into challenging situations and are always ready for action.'
        },
        {
            sign: 'Taurus',
            symbol: 'Bull',
            emoji: '♉',
            element: 'Earth',
            elementEmoji: '🌍',
            quality: 'Fixed',
            rulingPlanet: 'Venus',
            planetEmoji: '♀️',
            dates: 'April 20 - May 20',
            traits: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Sensual'],
            strengths: ['Dependable', 'Persistent', 'Loyal', 'Generous', 'Artistic'],
            weaknesses: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic'],
            compatibility: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
            luckyNumbers: [2, 6, 9, 12, 24],
            luckyColors: ['Green', 'Pink'],
            description: 'Taurus is an earth sign represented by the bull. Like their celestial spirit animal, Taureans enjoy relaxing in serene, bucolic environments surrounded by soft sounds, soothing aromas, and succulent flavors.'
        },
        {
            sign: 'Gemini',
            symbol: 'Twins',
            emoji: '♊',
            element: 'Air',
            elementEmoji: '💨',
            quality: 'Mutable',
            rulingPlanet: 'Mercury',
            planetEmoji: '☿️',
            dates: 'May 21 - June 20',
            traits: ['Adaptable', 'Curious', 'Witty', 'Expressive', 'Social'],
            strengths: ['Gentle', 'Affectionate', 'Quick learners', 'Versatile'],
            weaknesses: ['Nervous', 'Inconsistent', 'Indecisive', 'Superficial'],
            compatibility: ['Libra', 'Aquarius', 'Aries', 'Leo'],
            luckyNumbers: [5, 7, 14, 23],
            luckyColors: ['Yellow', 'Light Green'],
            description: 'Gemini is represented by the celestial twins, symbolizing their dual nature. These quick-witted signs love to talk and are masters of communication, always juggling multiple passions and hobbies.'
        },
        {
            sign: 'Cancer',
            symbol: 'Crab',
            emoji: '♋',
            element: 'Water',
            elementEmoji: '💧',
            quality: 'Cardinal',
            rulingPlanet: 'Moon',
            planetEmoji: '🌙',
            dates: 'June 21 - July 22',
            traits: ['Intuitive', 'Sentimental', 'Compassionate', 'Protective', 'Nurturing'],
            strengths: ['Tenacious', 'Loyal', 'Emotional', 'Sympathetic', 'Persuasive'],
            weaknesses: ['Moody', 'Pessimistic', 'Suspicious', 'Manipulative', 'Insecure'],
            compatibility: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
            luckyNumbers: [2, 3, 15, 20],
            luckyColors: ['White', 'Silver'],
            description: 'Cancer is a cardinal water sign. Represented by the crab, this oceanic crustacean seamlessly weaves between the sea and shore representing Cancer\'s ability to exist in both emotional and material realms.'
        },
        {
            sign: 'Leo',
            symbol: 'Lion',
            emoji: '♌',
            element: 'Fire',
            elementEmoji: '🔥',
            quality: 'Fixed',
            rulingPlanet: 'Sun',
            planetEmoji: '☀️',
            dates: 'July 23 - August 22',
            traits: ['Creative', 'Passionate', 'Generous', 'Warm-hearted', 'Cheerful'],
            strengths: ['Creative', 'Passionate', 'Generous', 'Warm-hearted', 'Humorous'],
            weaknesses: ['Arrogant', 'Stubborn', 'Self-centered', 'Lazy', 'Inflexible'],
            compatibility: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
            luckyNumbers: [1, 3, 10, 19],
            luckyColors: ['Gold', 'Orange', 'Yellow'],
            description: 'Leo is represented by the lion, and these spirited fire signs are the kings and queens of the celestial jungle. They\'re delighted to embrace their royal status: vivacious, theatrical, and passionate.'
        },
        {
            sign: 'Virgo',
            symbol: 'Virgin',
            emoji: '♍',
            element: 'Earth',
            elementEmoji: '🌍',
            quality: 'Mutable',
            rulingPlanet: 'Mercury',
            planetEmoji: '☿️',
            dates: 'August 23 - September 22',
            traits: ['Analytical', 'Practical', 'Diligent', 'Modest', 'Reliable'],
            strengths: ['Loyal', 'Analytical', 'Kind', 'Hardworking', 'Practical'],
            weaknesses: ['Shyness', 'Worry', 'Overly critical', 'All work and no play'],
            compatibility: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
            luckyNumbers: [5, 14, 15, 23, 32],
            luckyColors: ['Grey', 'Beige', 'Pale Yellow'],
            description: 'Virgo is an earth sign historically represented by the goddess of wheat and agriculture. This connection speaks to Virgo\'s deep-rooted presence in the material world and approach to life as systematic.'
        },
        {
            sign: 'Libra',
            symbol: 'Scales',
            emoji: '♎',
            element: 'Air',
            elementEmoji: '💨',
            quality: 'Cardinal',
            rulingPlanet: 'Venus',
            planetEmoji: '♀️',
            dates: 'September 23 - October 22',
            traits: ['Diplomatic', 'Fair', 'Social', 'Cooperative', 'Gracious'],
            strengths: ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded', 'Social'],
            weaknesses: ['Indecisive', 'Avoids confrontations', 'Self-pity', 'Carries grudges'],
            compatibility: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
            luckyNumbers: [4, 6, 13, 15, 24],
            luckyColors: ['Pink', 'Blue'],
            description: 'Libra is an air sign represented by the scales, an association that reflects Libra\'s fixation on balance and harmony. Libra is obsessed with symmetry and strives to create equilibrium in all areas of life.'
        },
        {
            sign: 'Scorpio',
            symbol: 'Scorpion',
            emoji: '♏',
            element: 'Water',
            elementEmoji: '💧',
            quality: 'Fixed',
            rulingPlanet: 'Pluto & Mars',
            planetEmoji: '♇',
            dates: 'October 23 - November 21',
            traits: ['Passionate', 'Resourceful', 'Brave', 'Mysterious', 'Determined'],
            strengths: ['Resourceful', 'Brave', 'Passionate', 'Stubborn', 'True friend'],
            weaknesses: ['Distrusting', 'Jealous', 'Secretive', 'Violent', 'Manipulative'],
            compatibility: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
            luckyNumbers: [8, 11, 18, 22],
            luckyColors: ['Scarlet', 'Rust', 'Red'],
            description: 'Scorpio is one of the most misunderstood signs of the zodiac. Because of its incredible passion and power, Scorpio is often mistaken for a fire sign. In fact, Scorpio is a water sign that derives its strength from the psychic, emotional realm.'
        },
        {
            sign: 'Sagittarius',
            symbol: 'Archer',
            emoji: '♐',
            element: 'Fire',
            elementEmoji: '🔥',
            quality: 'Mutable',
            rulingPlanet: 'Jupiter',
            planetEmoji: '♃',
            dates: 'November 22 - December 21',
            traits: ['Optimistic', 'Adventurous', 'Honest', 'Philosophical', 'Generous'],
            strengths: ['Generous', 'Idealistic', 'Great sense of humor'],
            weaknesses: ['Promises more than can deliver', 'Impatient', 'Says anything'],
            compatibility: ['Aries', 'Leo', 'Libra', 'Aquarius'],
            luckyNumbers: [3, 7, 9, 12, 21],
            luckyColors: ['Blue', 'Purple'],
            description: 'Represented by the archer, Sagittarians are always on a quest for knowledge. The last fire sign of the zodiac, Sagittarius launches its many pursuits like blazing arrows, chasing after geographical, intellectual, and spiritual adventures.'
        },
        {
            sign: 'Capricorn',
            symbol: 'Sea-Goat',
            emoji: '♑',
            element: 'Earth',
            elementEmoji: '🌍',
            quality: 'Cardinal',
            rulingPlanet: 'Saturn',
            planetEmoji: '♄',
            dates: 'December 22 - January 19',
            traits: ['Disciplined', 'Responsible', 'Self-controlled', 'Ambitious', 'Practical'],
            strengths: ['Responsible', 'Disciplined', 'Self-control', 'Good managers'],
            weaknesses: ['Know-it-all', 'Unforgiving', 'Condescending', 'Expecting the worst'],
            compatibility: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
            luckyNumbers: [4, 8, 13, 22],
            luckyColors: ['Brown', 'Black', 'Dark Green'],
            description: 'The last earth sign of the zodiac, Capricorn is represented by the sea goat, a mythological creature with the body of a goat and tail of a fish. Capricorns are skilled at navigating both the material and emotional realms.'
        },
        {
            sign: 'Aquarius',
            symbol: 'Water Bearer',
            emoji: '♒',
            element: 'Air',
            elementEmoji: '💨',
            quality: 'Fixed',
            rulingPlanet: 'Uranus & Saturn',
            planetEmoji: '♅',
            dates: 'January 20 - February 18',
            traits: ['Progressive', 'Original', 'Independent', 'Humanitarian', 'Intellectual'],
            strengths: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
            weaknesses: ['Runs from emotional expression', 'Temperamental', 'Uncompromising', 'Aloof'],
            compatibility: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
            luckyNumbers: [4, 7, 11, 22, 29],
            luckyColors: ['Blue', 'Blue-Green', 'Grey'],
            description: 'Despite the "aqua" in its name, Aquarius is actually the last air sign of the zodiac. Aquarius is represented by the water bearer, the mystical healer who bestows water, or life, upon the land.'
        },
        {
            sign: 'Pisces',
            symbol: 'Fish',
            emoji: '♓',
            element: 'Water',
            elementEmoji: '💧',
            quality: 'Mutable',
            rulingPlanet: 'Neptune & Jupiter',
            planetEmoji: '♆',
            dates: 'February 19 - March 20',
            traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Wise'],
            strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Wise', 'Musical'],
            weaknesses: ['Fearful', 'Overly trusting', 'Sad', 'Desire to escape reality'],
            compatibility: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
            luckyNumbers: [3, 9, 12, 15, 18, 24],
            luckyColors: ['Mauve', 'Lilac', 'Purple', 'Violet', 'Sea Green'],
            description: 'Pisces, a water sign, is the last constellation of the zodiac. It\'s symbolized by two fish swimming in opposite directions, representing the constant division of Pisces\'s attention between fantasy and reality.'
        }
    ];

    // Determine zodiac sign based on date
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0]; // Aries
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1]; // Taurus
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2]; // Gemini
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3]; // Cancer
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4]; // Leo
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5]; // Virgo
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6]; // Libra
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7]; // Scorpio
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8]; // Sagittarius
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9]; // Capricorn
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10]; // Aquarius
    return zodiacSigns[11]; // Pisces
}

const elementColors: Record<string, string[]> = {
    'Fire': ['#ff6b35', '#f7931e', '#fbb03b'],
    'Earth': ['#5d4037', '#795548', '#8d6e63'],
    'Air': ['#64b5f6', '#90caf9', '#bbdefb'],
    'Water': ['#1565c0', '#1976d2', '#42a5f5']
};

export default function ZodiacSignScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const zodiac = getZodiacData(birthDate);
    const colors = elementColors[zodiac.element];

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <LinearGradient colors={colors} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors[0]} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.signEmoji}>{zodiac.emoji}</Text>
                    <Text style={styles.signName}>{zodiac.sign}</Text>
                    <Text style={styles.signSymbol}>The {zodiac.symbol}</Text>
                    <Text style={styles.signDates}>{zodiac.dates}</Text>
                </View>

                {/* Element & Planet */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoEmoji}>{zodiac.elementEmoji}</Text>
                        <Text style={styles.infoLabel}>Element</Text>
                        <Text style={styles.infoValue}>{zodiac.element}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoEmoji}>{zodiac.planetEmoji}</Text>
                        <Text style={styles.infoLabel}>Ruling Planet</Text>
                        <Text style={styles.infoValue}>{zodiac.rulingPlanet}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoEmoji}>🔄</Text>
                        <Text style={styles.infoLabel}>Quality</Text>
                        <Text style={styles.infoValue}>{zodiac.quality}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About {zodiac.sign}</Text>
                    <Text style={styles.descriptionText}>{zodiac.description}</Text>
                </View>

                {/* Traits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Traits</Text>
                    <View style={styles.traitsContainer}>
                        {zodiac.traits.map((trait, index) => (
                            <View key={index} style={styles.traitBadge}>
                                <Text style={styles.traitText}>{trait}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Strengths & Weaknesses */}
                <View style={styles.strengthsRow}>
                    <View style={[styles.halfSection, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                        <Text style={[styles.sectionTitle, { color: '#2e7d32' }]}>💪 Strengths</Text>
                        {zodiac.strengths.map((s, i) => (
                            <Text key={i} style={styles.listItem}>• {s}</Text>
                        ))}
                    </View>
                    <View style={[styles.halfSection, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
                        <Text style={[styles.sectionTitle, { color: '#c62828' }]}>⚠️ Challenges</Text>
                        {zodiac.weaknesses.map((w, i) => (
                            <Text key={i} style={styles.listItem}>• {w}</Text>
                        ))}
                    </View>
                </View>

                {/* Compatibility */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💕 Best Compatibility</Text>
                    <View style={styles.compatRow}>
                        {zodiac.compatibility.map((sign, index) => (
                            <View key={index} style={styles.compatBadge}>
                                <Text style={styles.compatText}>{sign}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Lucky Numbers & Colors */}
                <View style={styles.luckyRow}>
                    <View style={styles.luckyCard}>
                        <Text style={styles.luckyTitle}>🔢 Lucky Numbers</Text>
                        <Text style={styles.luckyValue}>{zodiac.luckyNumbers.join(', ')}</Text>
                    </View>
                    <View style={styles.luckyCard}>
                        <Text style={styles.luckyTitle}>🎨 Lucky Colors</Text>
                        <Text style={styles.luckyValue}>{zodiac.luckyColors.join(', ')}</Text>
                    </View>
                </View>

                {/* Your Birthday */}
                <View style={styles.birthdayCard}>
                    <Text style={styles.birthdayLabel}>Your Birthday</Text>
                    <Text style={styles.birthdayDate}>{formattedDate}</Text>
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back to Fun Facts</Text>
                </TouchableOpacity>
            </ScrollView>
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
        marginTop: 20,
        marginBottom: 24,
    },
    signEmoji: {
        fontSize: 80,
        marginBottom: 10,
    },
    signName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    signSymbol: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    signDates: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    infoCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    infoEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 11,
        color: '#888',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 24,
    },
    traitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    traitBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    traitText: {
        fontSize: 14,
        color: '#1565c0',
        fontWeight: '600',
    },
    strengthsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    halfSection: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
    },
    listItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    compatRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    compatBadge: {
        backgroundColor: '#fce4ec',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    compatText: {
        fontSize: 15,
        color: '#c2185b',
        fontWeight: '600',
    },
    luckyRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    luckyCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    luckyTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    luckyValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    birthdayCard: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    birthdayLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    birthdayDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
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
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
