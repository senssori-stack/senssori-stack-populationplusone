import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AstrologyEducation'>;

// ─── Section data ───────────────────────────────────────────────────────────

interface Section {
    emoji: string;
    title: string;
    body: string;
}

const SECTIONS: Section[] = [
    {
        emoji: '🌌',
        title: 'What Is Astrology?',
        body:
            'Astrology is an ancient belief system that studies the positions and movements of celestial bodies — the Sun, Moon, planets, and stars — and interprets how they may influence human life, personality, and events on Earth.\n\n' +
            'It is not a single practice but a broad framework that encompasses many branches: natal astrology (birth charts), mundane astrology (world events), horary astrology (answering specific questions), and electional astrology (choosing favorable times for actions).\n\n' +
            'While millions of people around the world find personal meaning in astrology, it is important to note that modern science does not classify astrology as a science. No peer-reviewed studies have reliably demonstrated that planetary positions at birth predict personality traits or life events.',
    },
    {
        emoji: '♈',
        title: 'What Is the Zodiac?',
        body:
            'The zodiac is a belt of sky extending roughly 8° on either side of the ecliptic — the apparent path the Sun traces across the sky over the course of a year. Ancient astronomers divided this belt into 12 equal sections of 30° each, and each section was named after the constellation that occupied it roughly 2,000 years ago.\n\n' +
            'The 12 signs are: Aries ♈, Taurus ♉, Gemini ♊, Cancer ♋, Leo ♌, Virgo ♍, Libra ♎, Scorpio ♏, Sagittarius ♐, Capricorn ♑, Aquarius ♒, and Pisces ♓.\n\n' +
            'Each sign is associated with an element (Fire, Earth, Air, or Water) and a modality (Cardinal, Fixed, or Mutable), creating a rich symbolic system.\n\n' +
            'Your "Sun sign" — the one most people know — is determined by which section of the zodiac the Sun occupied on the day you were born.',
    },
    {
        emoji: '🔮',
        title: 'What Is a Horoscope?',
        body:
            'A horoscope is an astrological chart or interpretation, typically based on the positions of celestial bodies at a specific moment in time — most commonly the time of a person\'s birth.\n\n' +
            'The daily, weekly, or monthly horoscopes found in newspapers and apps are generalized forecasts written for each Sun sign. Because they only account for one factor (the Sun sign) out of dozens in a full birth chart, professional astrologers consider them extremely simplified.\n\n' +
            'A full natal horoscope (birth chart) maps the exact positions of the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto at the precise moment and location of birth, along with the Ascendant (rising sign), 12 houses, and the angular relationships (aspects) between all bodies.',
    },
    {
        emoji: '📜',
        title: 'The History of Astrology',
        body:
            'Astrology\'s roots stretch back over 4,000 years to ancient Mesopotamia (modern-day Iraq). The Babylonians were among the first to systematically record celestial observations on clay tablets, believing the gods communicated through the sky.\n\n' +
            '• ~2000 BC — Babylonian priests began recording omens linked to celestial events.\n' +
            '• ~500 BC — The Babylonians formalized the 12-sign zodiac, dividing the ecliptic into equal 30° segments.\n' +
            '• ~300 BC — Greek scholars, especially after Alexander the Great\'s conquests, absorbed Babylonian astrology and merged it with Greek philosophy. Ptolemy\'s "Tetrabiblos" (~150 AD) became the foundational Western astrology text for over 1,000 years.\n' +
            '• ~500 AD–1200 AD — Islamic scholars preserved and expanded astrological knowledge during Europe\'s Middle Ages, translating key Greek texts into Arabic.\n' +
            '• Renaissance — Astrology regained prominence in Europe. Figures like Johannes Kepler practiced astrology while making groundbreaking astronomical discoveries.\n' +
            '• 1600s onward — The Scientific Revolution gradually separated astronomy (the observational science of celestial bodies) from astrology (the interpretive belief system). Today, astronomy is a recognized natural science; astrology is considered a pseudoscience by the scientific community.\n\n' +
            'Despite this, astrology has experienced a significant cultural revival in the 21st century, particularly among younger generations, driven by social media and wellness culture.',
    },
    {
        emoji: '🗺️',
        title: 'The Full Birth Chart — Beyond Your Sun Sign',
        body:
            'Most people only know their Sun sign, but a complete astrological chart includes many more components:\n\n' +
            '☉ Sun Sign — Your core identity and ego; determined by the Sun\'s zodiac position at birth.\n' +
            '☽ Moon Sign — Your emotional inner world; determined by the Moon\'s position.\n' +
            '↑ Rising Sign (Ascendant) — The zodiac sign on the eastern horizon at your birth moment; shapes first impressions and outward personality.\n' +
            '☿♀♂♃♄ Planetary Placements — Each planet occupies a sign and house, influencing different aspects of life (Mercury = communication, Venus = love, Mars = drive, Jupiter = luck, Saturn = discipline).\n' +
            '♅♆♇ Outer Planets — Uranus, Neptune, and Pluto move slowly and define generational themes.\n' +
            '🏠 The 12 Houses — Twelve life areas (self, money, communication, home, creativity, health, partnerships, transformation, philosophy, career, community, and spirituality).\n' +
            '📐 Aspects — Angles between planets that reveal how energies interact: conjunctions (0°), sextiles (60°), squares (90°), trines (120°), and oppositions (180°).\n\n' +
            'This is why two people with the same Sun sign can have very different personalities — the rest of their chart may look completely different.',
    },
    {
        emoji: '⛎',
        title: 'The 13th Zodiac Sign — Ophiuchus',
        body:
            'One of the most debated topics in astrology is the existence of a 13th constellation along the ecliptic: Ophiuchus (pronounced oh-fee-YOO-kus), the "Serpent Bearer."\n\n' +
            'Astronomically, this is a fact: the Sun passes through 13 constellations, not 12. The Sun travels through Ophiuchus roughly from November 29 to December 17, between Scorpio and Sagittarius. NASA confirmed this in 2016, stating that the Babylonians knew about Ophiuchus but deliberately excluded it to maintain a tidy 12-sign system that matched their 12-month calendar.\n\n' +
            'However, most Western astrologers reject Ophiuchus as a zodiac sign for an important reason: Western astrology uses the "tropical zodiac," which is based on the seasons (equinoxes and solstices), not the actual constellations. The tropical zodiac divides the ecliptic into 12 equal 30° segments starting from the spring equinox point, regardless of where the constellations physically sit today.\n\n' +
            'Vedic (Indian) astrology, by contrast, uses the "sidereal zodiac," which tracks the actual positions of the constellations. Even sidereal astrology does not traditionally include Ophiuchus.\n\n' +
            'So while Ophiuchus is a real constellation the Sun passes through, it has never been part of traditional astrology in any major system.',
    },
    {
        emoji: '🔬',
        title: 'What Does Science Say?',
        body:
            'The scientific community has extensively studied astrology\'s claims. Here is what the research shows:\n\n' +
            '• The Shawn Carlson Study (1985) — Published in the prestigious journal Nature, this double-blind experiment asked professional astrologers to match natal charts to personality profiles. The astrologers performed no better than random chance.\n' +
            '• The Mars Effect — French psychologist Michel Gauquelin claimed in 1955 that top athletes were more likely to be born when Mars was in a prominent position. Subsequent replication attempts by independent researchers failed to confirm the finding.\n' +
            '• Time-Twin Studies — Researchers have studied people born at the same time and place ("time twins") and found no significant similarities in personality, career, or life events beyond what chance would predict.\n' +
            '• Geoffrey Dean Study (2003) — Tracked over 2,000 people born within minutes of each other in London. After decades of follow-up, there were no meaningful correlations in personality, occupation, IQ, or anxiety levels.\n\n' +
            'Why do horoscopes feel accurate?\n\n' +
            '🧠 The Barnum Effect (also called the Forer Effect) — People tend to accept vague, general personality descriptions as uniquely applicable to themselves. "You have a need for others to like and admire you" feels true to almost everyone.\n' +
            '🧠 Confirmation Bias — We naturally notice and remember the times a horoscope seems right and forget the times it doesn\'t.\n' +
            '🧠 Self-Fulfilling Prophecy — If you read "today is a good day for bold decisions," you may act more boldly, making the prediction appear to come true.\n\n' +
            'None of this means astrology cannot be personally meaningful, enjoyable, or useful for self-reflection. Many people find value in it as a framework for introspection — similar to personality tests or journaling prompts. The key distinction is between personal meaning and empirical proof.',
    },
    {
        emoji: '🌍',
        title: 'Astrology Around the World',
        body:
            'Astrology is not a single system — different cultures developed their own celestial frameworks:\n\n' +
            '🐉 Chinese Astrology — Based on a 12-year cycle of animal signs (Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig) combined with five elements (Wood, Fire, Earth, Metal, Water) and Yin/Yang polarity. Born from ancient Chinese philosophy, it emphasizes cycles, compatibility, and fortune.\n\n' +
            '🕉️ Vedic (Jyotish) Astrology — Originated in ancient India and uses the sidereal zodiac (actual constellation positions). It places great emphasis on the Moon sign, the lunar mansion system (Nakshatras), and planetary periods (Dashas). Vedic astrology is deeply integrated with Hindu philosophy and Ayurvedic medicine.\n\n' +
            '🏛️ Western Astrology — The system most familiar to Americans and Europeans, rooted in Greco-Roman tradition. Uses the tropical zodiac (season-based). Emphasizes the Sun sign, psychological interpretation, and individual free will.\n\n' +
            '🌙 Islamic Astrology — Medieval Islamic scholars made major contributions including the astrolabe and refined mathematical techniques for casting charts. Many star names in use today (Aldebaran, Betelgeuse, Altair) come from Arabic.\n\n' +
            '🦅 Mesoamerican Astrology — The Maya and Aztec civilizations developed sophisticated calendrical systems, including the Tzolk\'in (260-day sacred calendar) with 20 day-signs and 13 numbers, used for divination and timing of events.',
    },
    {
        emoji: '💡',
        title: 'The Bottom Line',
        body:
            'Astrology, the zodiac, and horoscopes are related but distinct concepts:\n\n' +
            '• Astrology is the overarching belief system.\n' +
            '• The zodiac is the framework of 12 sky divisions used within astrology.\n' +
            '• A horoscope is an interpretation or prediction derived from astrology.\n\n' +
            'There is no scientific evidence that celestial positions determine personality or predict the future. However, astrology has deep historical roots spanning over 4,000 years and remains culturally significant to billions of people worldwide.\n\n' +
            'Whether you view it as ancient wisdom, a tool for self-reflection, or simply entertaining, understanding its history and how it works allows you to engage with it on your own terms — informed and empowered.\n\n' +
            'The features in this app — birth charts, moon phases, spirit animals, and more — are presented for educational and entertainment purposes. We encourage curiosity, self-exploration, and, above all, critical thinking. ✨',
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AstrologyEducationScreen({ }: Props) {
    return (
        <LinearGradient colors={['#0d0d2b', '#1a1a3e', '#2c1654']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0d2b" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>📚</Text>
                    <Text style={styles.mainTitle}>Understanding Astrology</Text>
                    <Text style={styles.subtitle}>
                        A truthful, educational guide to astrology, the zodiac, horoscopes, and what science says about them.
                    </Text>
                </View>

                {/* Sections */}
                {SECTIONS.map((section, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardEmoji}>{section.emoji}</Text>
                            <Text style={styles.cardTitle}>{section.title}</Text>
                        </View>
                        <Text style={styles.cardBody}>{section.body}</Text>
                    </View>
                ))}

                {/* Disclaimer */}
                <View style={styles.disclaimerCard}>
                    <Text style={styles.disclaimerText}>
                        ⚠️ Disclaimer: The astrological features in this app are provided for educational and entertainment purposes only. They are not intended as scientific claims, medical advice, or professional guidance. Always make important life decisions based on evidence, professional counsel, and your own sound judgment.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 12,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        flex: 1,
    },
    cardBody: {
        fontSize: 14,
        color: '#ddd',
        lineHeight: 22,
    },
    disclaimerCard: {
        backgroundColor: 'rgba(255,200,0,0.1)',
        borderRadius: 12,
        padding: 14,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,200,0,0.25)',
    },
    disclaimerText: {
        fontSize: 12,
        color: '#e0c060',
        lineHeight: 18,
        textAlign: 'center',
    },
});
