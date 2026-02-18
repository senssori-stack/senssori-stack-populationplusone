import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { COLOR_SCHEMES } from '../data/utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChartReading'>;

// Zodiac descriptions for Sun sign
const ZODIAC_SUN_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'Bold, courageous, and pioneering. Aries babies are natural leaders with boundless energy and enthusiasm. They approach life with confidence and aren\'t afraid to take the first step into new adventures.',
    'Taurus': 'Stable, dependable, and grounded. Taurus children are known for their calm demeanor and love of comfort. They value loyalty and have a natural appreciation for beauty and the finer things.',
    'Gemini': 'Curious, communicative, and intellectually bright. Gemini babies are natural communicators who love learning and sharing ideas. They thrive on variety and new experiences.',
    'Cancer': 'Nurturing, intuitive, and emotionally intelligent. Cancer children are deeply connected to family and home. They possess strong emotional awareness and natural empathy for others.',
    'Leo': 'Creative, confident, and natural-born performers. Leo babies shine brightly with warmth and generosity. They love being the center of attention and inspire others with their passion.',
    'Virgo': 'Practical, analytical, and detail-oriented. Virgo children have a methodical approach to life and enjoy helping others. They notice the little things that make a big difference.',
    'Libra': 'Diplomatic, charming, and relationship-focused. Libra babies seek balance and harmony in all things. They have natural grace and an appreciation for fairness and justice.',
    'Scorpio': 'Intense, perceptive, and deeply transformative. Scorpio children possess remarkable resilience and emotional depth. They see through to the truth of situations with piercing clarity.',
    'Sagittarius': 'Optimistic, adventurous, and philosophical. Sagittarius babies are natural explorers with a love of learning. They inspire others with their enthusiasm and expansive vision.',
    'Capricorn': 'Disciplined, responsible, and goal-oriented. Capricorn children are mature beyond their years with a natural sense of purpose. They understand the value of hard work and patience.',
    'Aquarius': 'Progressive, independent, and humanitarian. Aquarius babies are innovative thinkers who see the world differently. They value friendship and are drawn to making a positive impact.',
    'Pisces': 'Imaginative, compassionate, and spiritually attuned. Pisces children are natural dreamers with deep intuition. They possess creativity and a beautiful sensitivity to the world around them.',
};

// Moon sign descriptions
const ZODIAC_MOON_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'An emotionally direct and spontaneous inner world. This moon brings quick reactions and a need for independence even in infancy. The child processes emotions through action and adventure.',
    'Taurus': 'A calm and grounded emotional foundation. This moon child seeks comfort and stability. They have steady feelings and prefer predictability in their emotional environment.',
    'Gemini': 'An intellectually curious emotional nature. This moon processes feelings through communication and mental activity. The child may have shifting moods but maintains curiosity.',
    'Cancer': 'A deeply feeling and protective emotional core. This moon child is naturally nurturing and needs strong emotional bonds. They are sensitive to family dynamics and atmospheres.',
    'Leo': 'A playful and emotionally generous inner world. This moon child expresses feelings openly and needs acknowledgment. Their emotions are warm and they naturally uplift others.',
    'Virgo': 'A thoughtful and detail-focused emotional processing style. This moon child analyzes their feelings carefully and appreciates order. They feel most secure when helping others.',
    'Libra': 'An emotionally balanced and people-oriented inner world. This moon child seeks harmony in their feelings and relationships. They are naturally diplomatic even in emotions.',
    'Scorpio': 'An intensely feeling and intuitive emotional nature. This moon child experiences emotions profoundly and remembers everything. They have strong instincts and hidden depths.',
    'Sagittarius': 'An optimistic and expansive emotional landscape. This moon child processes feelings through exploration and learning. They have a naturally uplifted spirit.',
    'Capricorn': 'A reserved and responsible emotional world. This moon child feels emotions deeply but keeps them private. They mature emotionally and value self-control.',
    'Aquarius': 'An unconventional and intellectually focused emotional nature. This moon child processes feelings through logic. They need emotional freedom and unique forms of expression.',
    'Pisces': 'A deeply intuitive and imaginative emotional realm. This moon child is sensitive to atmospheres and the emotions of others. They experience the world through feeling and imagination.',
};

// Ascendant descriptions
const ASCENDANT_DESCRIPTIONS: Record<string, string> = {
    'Aries': 'This child presents as bold, direct, and energetic to the world. First impressions suggest independence and enthusiasm. People naturally see them as a leader and trailblazer.',
    'Taurus': 'This child appears calm, steady, and dependable. They present a grounded and approachable demeanor. People see them as reliable and naturally collected.',
    'Gemini': 'This child seems curious, talkative, and intellectually engaged. They appear youthful and animated. People perceive them as communicative and quick-minded.',
    'Cancer': 'This child comes across as gentle, protective, and home-loving. They appear sensitive and nurturing to others. People see them as approachable and emotionally aware.',
    'Leo': 'This child presents with natural confidence and warmth. They appear creative and magnetic. People are drawn to their presence and natural charisma.',
    'Virgo': 'This child seems thoughtful, helpful, and detail-oriented. They appear practical and intelligent. People perceive them as reliable and naturally organized.',
    'Libra': 'This child presents as charming, graceful, and peacekeeping. They appear balanced and pleasant. People see them as diplomatic and naturally sociable.',
    'Scorpio': 'This child comes across as intense, mysterious, and perceptive. They appear more mature than their age. People sense their depth and emotional intelligence.',
    'Sagittarius': 'This child presents as optimistic, adventurous, and expansive. They appear friendly and open-minded. People see them as naturally enthusiastic and philosophical.',
    'Capricorn': 'This child seems mature, responsible, and goal-focused. They appear serious and thoughtful. People recognize their natural wisdom and determination.',
    'Aquarius': 'This child presents as independent, unique, and intellectually different. They appear unconventional and innovative. People see them as interesting and original.',
    'Pisces': 'This child comes across as dreamy, artistic, and compassionate. They appear gentle and intuitive. People sense their sensitivity and imaginative nature.',
};

export default function ChartReadingScreen({ navigation, route }: Props) {
    const params = route.params || {};

    // Parse date from ISO string if provided
    const birthDate = params.dobISO ? new Date(params.dobISO) : new Date();
    const babyName = params.babyFirst ? `${params.babyFirst}${params.babyMiddle ? ' ' + params.babyMiddle : ''}` : 'Baby';
    const hometown = params.hometown || 'their birthplace';
    const theme = params.theme || 'green';
    const latitude = params.latitude || 40.7128;
    const longitude = params.longitude || -74.0060;

    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;
    const { width: screenWidth } = useWindowDimensions();
    const isTablet = screenWidth >= 768;

    const natalChart = useMemo(() => {
        return calculateNatalChart(birthDate, latitude, longitude);
    }, [birthDate, latitude, longitude]);

    const sunSign = natalChart.planets[0]?.zodiac || 'Unknown';
    const moonSign = natalChart.planets[1]?.zodiac || 'Unknown';
    const ascendantSign = natalChart.ascendantZodiac || 'Unknown';

    const sunDescription = ZODIAC_SUN_DESCRIPTIONS[sunSign] || 'A unique individual with special gifts.';
    const moonDescription = ZODIAC_MOON_DESCRIPTIONS[moonSign] || 'Rich emotional depths and sensitivity.';
    const ascendantDescription = ASCENDANT_DESCRIPTIONS[ascendantSign] || 'A natural presence that draws others in.';

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Header */}
            <View style={styles.headerSection}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {babyName}'s Astrological Profile
                </Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    {birthDate.toLocaleDateString()} • {hometown}
                </Text>
            </View>

            {/* Introduction */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    ✨ A Celestial Snapshot
                </Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    The moment {babyName} was born, the Sun, Moon, and planets were positioned in a unique pattern. This natal chart reveals natural talents, emotional nature, and the personality {babyName} presents to the world. These placements grow and evolve throughout life, but they represent the essence at birth.
                </Text>
            </View>

            {/* Sun Sign */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <View style={styles.signHeader}>
                    <Text style={[styles.signSymbol, { color: colors.accent }]}>☉</Text>
                    <View style={styles.signInfo}>
                        <Text style={[styles.signTitle, { color: colors.text }]}>Sun Sign: {sunSign}</Text>
                        <Text style={[styles.signSubtitle, { color: colors.text }]}>Core Identity & Life Purpose</Text>
                    </View>
                </View>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    {sunDescription}
                </Text>
            </View>

            {/* Moon Sign */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <View style={styles.signHeader}>
                    <Text style={[styles.signSymbol, { color: colors.accent }]}>☽</Text>
                    <View style={styles.signInfo}>
                        <Text style={[styles.signTitle, { color: colors.text }]}>Moon Sign: {moonSign}</Text>
                        <Text style={[styles.signSubtitle, { color: colors.text }]}>Emotional Inner World</Text>
                    </View>
                </View>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    {moonDescription}
                </Text>
            </View>

            {/* Ascendant */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <View style={styles.signHeader}>
                    <Text style={[styles.signSymbol, { color: colors.accent }]}>↑</Text>
                    <View style={styles.signInfo}>
                        <Text style={[styles.signTitle, { color: colors.text }]}>Ascendant: {ascendantSign}</Text>
                        <Text style={[styles.signSubtitle, { color: colors.text }]}>How They Appear to the World</Text>
                    </View>
                </View>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    {ascendantDescription}
                </Text>
            </View>

            {/* Horoscope Section */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    🌙 Year Ahead Themes
                </Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    As {babyName} grows, their sun sign will experience challenges and opportunities that help develop their natural gifts. The moon sign will guide emotional growth, while the ascendant becomes more refined as they develop their social presence.
                </Text>
            </View>

            {/* Understanding the Chart */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    📚 Understanding This Reading
                </Text>
                <View style={styles.bulletPoints}>
                    <BulletPoint
                        icon="☉"
                        title="Sun Sign"
                        description="Your core identity, ego, and life purpose"
                        textColor={colors.text}
                        accentColor={colors.accent}
                    />
                    <BulletPoint
                        icon="☽"
                        title="Moon Sign"
                        description="Your emotional nature and inner world"
                        textColor={colors.text}
                        accentColor={colors.accent}
                    />
                    <BulletPoint
                        icon="↑"
                        title="Ascendant (Rising Sign)"
                        description="How you appear to others and first impressions"
                        textColor={colors.text}
                        accentColor={colors.accent}
                    />
                </View>
            </View>

            {/* About the Natal Chart */}
            <View style={[styles.card, { borderColor: colors.accent }]}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    ⭐ The Natal Chart
                </Text>
                <Text style={[styles.bodyText, { color: colors.text }]}>
                    A natal chart is a snapshot of the sky at the exact moment of birth. It shows where all the planets were positioned, which zodiac sign was on the eastern horizon (the ascendant), and more. Unlike a Sun sign which only requires a birth date, an accurate natal chart requires a birth time and location.
                </Text>
                <Text style={[styles.bodyText, { color: colors.text, marginTop: 12 }]}>
                    This personal profile celebrates the unique planetary influences at {babyName}'s moment of arrival—a cosmic keepsake for a lifetime of growth and discovery.
                </Text>
            </View>

            {/* Spacing */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

interface BulletPointProps {
    icon: string;
    title: string;
    description: string;
    textColor: string;
    accentColor: string;
}

function BulletPoint({ icon, title, description, textColor, accentColor }: BulletPointProps) {
    return (
        <View style={styles.bulletItem}>
            <Text style={[styles.bulletIcon, { color: accentColor }]}>{icon}</Text>
            <View style={styles.bulletContent}>
                <Text style={[styles.bulletTitle, { color: textColor }]}>{title}</Text>
                <Text style={[styles.bulletDescription, { color: textColor }]}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    headerSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
        fontWeight: '500',
    },
    card: {
        marginBottom: 20,
        padding: 18,
        borderRadius: 12,
        borderLeftWidth: 5,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    signHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    signSymbol: {
        fontSize: 40,
        marginRight: 16,
        marginTop: -4,
    },
    signInfo: {
        flex: 1,
    },
    signTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    signSubtitle: {
        fontSize: 12,
        opacity: 0.7,
        fontStyle: 'italic',
    },
    bodyText: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    bulletPoints: {
        marginTop: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    bulletIcon: {
        fontSize: 28,
        marginRight: 12,
        marginTop: 2,
        minWidth: 32,
    },
    bulletContent: {
        flex: 1,
    },
    bulletTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    bulletDescription: {
        fontSize: 13,
        lineHeight: 20,
        opacity: 0.85,
    },
});
