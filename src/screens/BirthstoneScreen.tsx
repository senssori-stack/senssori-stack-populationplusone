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

type Props = NativeStackScreenProps<RootStackParamList, 'Birthstone'>;

const { width: screenWidth } = Dimensions.get('window');

interface BirthstoneData {
    name: string;
    color: string;
    hex: string;
    meaning: string;
    properties: string[];
    history: string;
    caregivers: string;
    alternates: string[];
}

function getBirthstoneData(date: Date): BirthstoneData {
    const month = date.getMonth();

    const birthstones: BirthstoneData[] = [
        {
            name: 'Garnet',
            color: 'Deep Red',
            hex: '#7B2D26',
            meaning: 'Protection, friendship, trust, and commitment. Garnet is believed to keep travelers safe on their journeys.',
            properties: ['Protection', 'Friendship', 'Trust', 'Commitment', 'Safe Travel'],
            history: 'Garnets have been used since the Bronze Age. Egyptian pharaohs wore garnet necklaces, and Romans used garnet signet rings.',
            caregivers: 'Clean with warm soapy water and a soft brush. Avoid ultrasonic cleaners.',
            alternates: ['Rose Quartz']
        },
        {
            name: 'Amethyst',
            color: 'Purple',
            hex: '#9966CC',
            meaning: 'Peace, courage, and stability. Ancient Greeks believed it prevented intoxication and kept the wearer clear-headed.',
            properties: ['Peace', 'Courage', 'Stability', 'Clarity', 'Sobriety'],
            history: 'The word comes from Greek "amethystos" meaning "not drunk." It was once as valuable as diamonds.',
            caregivers: 'Avoid prolonged sun exposure which can fade the color. Clean with warm soapy water.',
            alternates: ['Bloodstone']
        },
        {
            name: 'Aquamarine',
            color: 'Light Blue',
            hex: '#7FFFD4',
            meaning: 'Youth, health, and hope. Sailors believed it would protect them and ensure safe voyages.',
            properties: ['Youth', 'Health', 'Hope', 'Courage', 'Communication'],
            history: 'Named from Latin "aqua marina" meaning "sea water." Ancient mariners carried it as a talisman against ocean dangers.',
            caregivers: 'Very durable. Clean with warm soapy water or ultrasonic cleaner.',
            alternates: ['Bloodstone']
        },
        {
            name: 'Diamond',
            color: 'Clear/White',
            hex: '#B9F2FF',
            meaning: 'Eternal love, strength, and invincibility. The hardest natural substance symbolizes unbreakable bonds.',
            properties: ['Eternal Love', 'Strength', 'Clarity', 'Abundance', 'Courage'],
            history: 'Diamonds were first discovered in India around 4th century BC. The tradition of diamond engagement rings began in 1477.',
            caregivers: 'Very durable but can chip. Clean with ammonia-based solutions or ultrasonic cleaners.',
            alternates: ['White Sapphire', 'Clear Quartz']
        },
        {
            name: 'Emerald',
            color: 'Green',
            hex: '#50C878',
            meaning: 'Rebirth, love, and wisdom. Cleopatra was known for her passion for emeralds.',
            properties: ['Rebirth', 'Love', 'Wisdom', 'Growth', 'Patience'],
            history: 'Emeralds have been mined since 330 BC in Egypt. The Incas used them in jewelry and religious ceremonies.',
            caregivers: 'Fragile - avoid ultrasonic cleaners. Clean gently with warm soapy water.',
            alternates: ['Chrysoprase']
        },
        {
            name: 'Pearl',
            color: 'White/Cream',
            hex: '#FDEEF4',
            meaning: 'Purity, innocence, and integrity. The only gem created by a living creature.',
            properties: ['Purity', 'Innocence', 'Integrity', 'Wisdom', 'Calming'],
            history: 'Pearls have been treasured for over 4,000 years. Ancient Romans considered them the ultimate status symbol.',
            caregivers: 'Very delicate - avoid chemicals, perfumes, and hairspray. Wipe with soft cloth after wearing.',
            alternates: ['Alexandrite', 'Moonstone']
        },
        {
            name: 'Ruby',
            color: 'Red',
            hex: '#E0115F',
            meaning: 'Passion, protection, and prosperity. Known as the "King of Gems" in ancient India.',
            properties: ['Passion', 'Protection', 'Prosperity', 'Courage', 'Vitality'],
            history: 'Ancient Hindus called rubies "ratnaraj" meaning king of precious stones. Warriors implanted rubies into their skin for protection.',
            caregivers: 'Very durable. Safe for ultrasonic cleaning unless heavily included.',
            alternates: ['Carnelian']
        },
        {
            name: 'Peridot',
            color: 'Lime Green',
            hex: '#9DC209',
            meaning: 'Strength, balance, and good fortune. Ancient Egyptians called it the "gem of the sun."',
            properties: ['Strength', 'Balance', 'Good Fortune', 'Healing', 'Protection'],
            history: 'Peridot was mined on a volcanic island in Egypt for over 3,500 years. Cleopatra\'s famous emeralds may have actually been peridots.',
            caregivers: 'Avoid rapid temperature changes. Clean with warm soapy water only.',
            alternates: ['Spinel', 'Sardonyx']
        },
        {
            name: 'Sapphire',
            color: 'Blue',
            hex: '#0F52BA',
            meaning: 'Wisdom, virtue, and good fortune. Royalty wore sapphires for protection from envy.',
            properties: ['Wisdom', 'Virtue', 'Truth', 'Sincerity', 'Faithfulness'],
            history: 'Ancient Persians believed the sky was painted blue by the reflection of sapphires. Princess Diana\'s engagement ring featured a sapphire.',
            caregivers: 'Very durable. Safe for ultrasonic and steam cleaning.',
            alternates: ['Lapis Lazuli']
        },
        {
            name: 'Opal',
            color: 'Multicolor/Iridescent',
            hex: '#A8C3BC',
            meaning: 'Hope, creativity, and innocence. Each opal is unique with its own play of colors.',
            properties: ['Hope', 'Creativity', 'Innocence', 'Imagination', 'Spontaneity'],
            history: 'Ancient Romans valued opals above all gems. The name comes from Sanskrit "upala" meaning precious stone.',
            caregivers: 'Delicate - avoid extreme temperatures and dryness. Clean with damp cloth only.',
            alternates: ['Tourmaline', 'Pink Sapphire']
        },
        {
            name: 'Citrine',
            color: 'Yellow/Orange',
            hex: '#E4D00A',
            meaning: 'Joy, abundance, and energy. Known as the "success stone" for its association with prosperity.',
            properties: ['Joy', 'Abundance', 'Energy', 'Success', 'Optimism'],
            history: 'Citrine has been used in jewelry for thousands of years. It was popular in ancient Greece during the Hellenistic Age.',
            caregivers: 'Avoid prolonged sun exposure. Clean with warm soapy water.',
            alternates: ['Topaz', 'Yellow Sapphire']
        },
        {
            name: 'Tanzanite',
            color: 'Blue-Violet',
            hex: '#4D5ADB',
            meaning: 'Transformation, spiritual growth, and new beginnings. One of the rarest gems on Earth.',
            properties: ['Transformation', 'Spiritual Growth', 'New Beginnings', 'Intuition', 'Perception'],
            history: 'Discovered in 1967 in Tanzania, it\'s found in only one place on Earth. Tiffany & Co. named it after its country of origin.',
            caregivers: 'Avoid ultrasonic cleaners and sudden temperature changes. Clean with warm soapy water.',
            alternates: ['Turquoise', 'Blue Zircon', 'Blue Topaz']
        }
    ];

    return birthstones[month];
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export default function BirthstoneScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const month = birthDate.getMonth();
    const stone = getBirthstoneData(birthDate);

    return (
        <LinearGradient colors={[stone.hex, adjustColor(stone.hex, 40), adjustColor(stone.hex, 80)]} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={stone.hex} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>💎</Text>
                    <Text style={styles.title}>Your Birthstone</Text>
                    <Text style={styles.subtitle}>{monthNames[month]}</Text>
                </View>

                {/* Stone Display */}
                <View style={styles.stoneCard}>
                    <View style={[styles.gemCircle, { backgroundColor: stone.hex }]}>
                        <Text style={styles.gemEmoji}>💎</Text>
                    </View>
                    <Text style={styles.stoneName}>{stone.name}</Text>
                    <Text style={styles.stoneColor}>{stone.color}</Text>
                </View>

                {/* Meaning */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meaning & Symbolism</Text>
                    <Text style={styles.meaningText}>{stone.meaning}</Text>
                </View>

                {/* Properties */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Properties</Text>
                    <View style={styles.propertiesContainer}>
                        {stone.properties.map((prop, index) => (
                            <View key={index} style={[styles.propertyBadge, { backgroundColor: stone.hex + '30' }]}>
                                <Text style={[styles.propertyText, { color: darkenColor(stone.hex) }]}>{prop}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📜 History & Lore</Text>
                    <Text style={styles.bodyText}>{stone.history}</Text>
                </View>

                {/* Care */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Care Instructions</Text>
                    <Text style={styles.bodyText}>{stone.caregivers}</Text>
                </View>

                {/* Alternates */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alternative Stones</Text>
                    <View style={styles.alternatesRow}>
                        {stone.alternates.map((alt, index) => (
                            <View key={index} style={styles.alternateBadge}>
                                <Text style={styles.alternateText}>{alt}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* All Birthstones */}
                <View style={styles.allStonesSection}>
                    <Text style={styles.sectionTitle}>All Birthstones by Month</Text>
                    <View style={styles.allStonesGrid}>
                        {monthNames.map((m, idx) => {
                            const s = getBirthstoneData(new Date(2000, idx, 1));
                            return (
                                <View key={idx} style={styles.monthStone}>
                                    <View style={[styles.miniGem, { backgroundColor: s.hex }]} />
                                    <Text style={styles.monthName}>{m.slice(0, 3)}</Text>
                                    <Text style={styles.miniStoneName}>{s.name}</Text>
                                </View>
                            );
                        })}
                    </View>
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

// Helper functions to adjust colors
function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function darkenColor(hex: string): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - 60);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - 60);
    const b = Math.max(0, (num & 0x0000FF) - 60);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
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
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    stoneCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    gemCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    gemEmoji: {
        fontSize: 50,
    },
    stoneName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    stoneColor: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
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
    meaningText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
    bodyText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    propertiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    propertyBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    propertyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    alternatesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    alternateBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    alternateText: {
        fontSize: 14,
        color: '#555',
    },
    allStonesSection: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    allStonesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthStone: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    miniGem: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginBottom: 4,
    },
    monthName: {
        fontSize: 12,
        color: '#888',
    },
    miniStoneName: {
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
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
