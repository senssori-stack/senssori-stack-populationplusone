import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Keyboard,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SurnameSearch'>;

const { width: screenWidth } = Dimensions.get('window');

interface SurnameResult {
    surname: string;
    origin: string;
    meaning: string;
    region: string;
    facts: string[];
    flag: string;
}

// Surname suffix patterns and their origins
const SURNAME_PATTERNS: { pattern: RegExp; origin: string; region: string; meaning: string; flag: string }[] = [
    // Patronymic suffixes
    { pattern: /son$/i, origin: 'Scandinavian/English', region: 'Northern Europe', meaning: 'Son of (father\'s name)', flag: '🇸🇪' },
    { pattern: /sen$/i, origin: 'Danish/Norwegian', region: 'Scandinavia', meaning: 'Son of (father\'s name)', flag: '🇩🇰' },
    { pattern: /sson$/i, origin: 'Swedish/Icelandic', region: 'Scandinavia', meaning: 'Son of (father\'s name)', flag: '🇸🇪' },
    { pattern: /dottir$/i, origin: 'Icelandic', region: 'Iceland', meaning: 'Daughter of (father\'s name)', flag: '🇮🇸' },
    { pattern: /ski$/i, origin: 'Polish', region: 'Eastern Europe', meaning: 'From a place or noble family', flag: '🇵🇱' },
    { pattern: /sky$/i, origin: 'Polish/Ukrainian', region: 'Eastern Europe', meaning: 'From a place or noble family', flag: '🇵🇱' },
    { pattern: /wicz$/i, origin: 'Polish', region: 'Poland', meaning: 'Son of (father\'s name)', flag: '🇵🇱' },
    { pattern: /ovic$/i, origin: 'Serbian/Croatian', region: 'Balkans', meaning: 'Son of (father\'s name)', flag: '🇷🇸' },
    { pattern: /ovich$/i, origin: 'Russian/Ukrainian', region: 'Eastern Europe', meaning: 'Son of (father\'s name)', flag: '🇷🇺' },
    { pattern: /vich$/i, origin: 'Slavic', region: 'Eastern Europe', meaning: 'Son of (father\'s name)', flag: '🇷🇺' },
    { pattern: /enko$/i, origin: 'Ukrainian', region: 'Ukraine', meaning: 'Son of or little (diminutive)', flag: '🇺🇦' },
    { pattern: /uk$/i, origin: 'Ukrainian', region: 'Ukraine', meaning: 'Son of (father\'s name)', flag: '🇺🇦' },
    { pattern: /ko$/i, origin: 'Ukrainian/Slavic', region: 'Eastern Europe', meaning: 'Diminutive or son of', flag: '🇺🇦' },
    { pattern: /ov$/i, origin: 'Russian/Bulgarian', region: 'Eastern Europe', meaning: 'Of or belonging to (father)', flag: '🇷🇺' },
    { pattern: /ev$/i, origin: 'Russian/Bulgarian', region: 'Eastern Europe', meaning: 'Of or belonging to (father)', flag: '🇷🇺' },
    { pattern: /in$/i, origin: 'Russian', region: 'Russia', meaning: 'Of or belonging to (often mother)', flag: '🇷🇺' },

    // Celtic
    { pattern: /^O'/i, origin: 'Irish', region: 'Ireland', meaning: 'Grandson/Descendant of', flag: '🇮🇪' },
    { pattern: /^Mc/i, origin: 'Irish/Scottish', region: 'Celtic', meaning: 'Son of', flag: '🇮🇪' },
    { pattern: /^Mac/i, origin: 'Scottish/Irish', region: 'Celtic', meaning: 'Son of', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { pattern: /^Fitz/i, origin: 'Norman-Irish', region: 'Ireland', meaning: 'Son of (Anglo-Norman)', flag: '🇮🇪' },

    // Germanic
    { pattern: /berg$/i, origin: 'German/Scandinavian', region: 'Central Europe', meaning: 'Mountain or hill', flag: '🇩🇪' },
    { pattern: /burg$/i, origin: 'German', region: 'Germany', meaning: 'Castle or fortified place', flag: '🇩🇪' },
    { pattern: /stein$/i, origin: 'German/Jewish', region: 'Central Europe', meaning: 'Stone', flag: '🇩🇪' },
    { pattern: /mann$/i, origin: 'German', region: 'Germany', meaning: 'Man or person from', flag: '🇩🇪' },
    { pattern: /man$/i, origin: 'German/Dutch', region: 'Central Europe', meaning: 'Man or person from', flag: '🇩🇪' },
    { pattern: /baum$/i, origin: 'German/Jewish', region: 'Central Europe', meaning: 'Tree', flag: '🇩🇪' },
    { pattern: /feld$/i, origin: 'German/Jewish', region: 'Central Europe', meaning: 'Field', flag: '🇩🇪' },
    { pattern: /witz$/i, origin: 'German/Slavic', region: 'Central Europe', meaning: 'Place or settlement', flag: '🇩🇪' },
    { pattern: /hoff$/i, origin: 'German/Dutch', region: 'Central Europe', meaning: 'Farm or courtyard', flag: '🇩🇪' },
    { pattern: /meyer$/i, origin: 'German', region: 'Germany', meaning: 'Steward or farmer', flag: '🇩🇪' },
    { pattern: /meier$/i, origin: 'German', region: 'Germany', meaning: 'Steward or farmer', flag: '🇩🇪' },
    { pattern: /müller$/i, origin: 'German', region: 'Germany', meaning: 'Miller', flag: '🇩🇪' },
    { pattern: /muller$/i, origin: 'German', region: 'Germany', meaning: 'Miller', flag: '🇩🇪' },

    // Romance languages
    { pattern: /ez$/i, origin: 'Spanish', region: 'Spain/Latin America', meaning: 'Son of (patronymic)', flag: '🇪🇸' },
    { pattern: /es$/i, origin: 'Spanish/Portuguese', region: 'Iberia', meaning: 'Son of or from a place', flag: '🇪🇸' },
    { pattern: /os$/i, origin: 'Greek/Portuguese', region: 'Mediterranean', meaning: 'Son of or plural form', flag: '🇬🇷' },
    { pattern: /ini$/i, origin: 'Italian', region: 'Italy', meaning: 'Little or descendant of', flag: '🇮🇹' },
    { pattern: /ino$/i, origin: 'Italian', region: 'Italy', meaning: 'Little or young', flag: '🇮🇹' },
    { pattern: /etti$/i, origin: 'Italian', region: 'Italy', meaning: 'Little (diminutive)', flag: '🇮🇹' },
    { pattern: /elli$/i, origin: 'Italian', region: 'Italy', meaning: 'Descendant of', flag: '🇮🇹' },
    { pattern: /ucci$/i, origin: 'Italian', region: 'Italy', meaning: 'Descendant of', flag: '🇮🇹' },
    { pattern: /acci$/i, origin: 'Italian', region: 'Italy', meaning: 'Descendant of (sometimes pejorative)', flag: '🇮🇹' },
    { pattern: /one$/i, origin: 'Italian', region: 'Italy', meaning: 'Big or the great', flag: '🇮🇹' },
    { pattern: /eau$/i, origin: 'French', region: 'France', meaning: 'Water or diminutive', flag: '🇫🇷' },
    { pattern: /ault$/i, origin: 'French', region: 'France', meaning: 'Bold or ruler', flag: '🇫🇷' },
    { pattern: /oux$/i, origin: 'French', region: 'France', meaning: 'Belonging to', flag: '🇫🇷' },

    // Dutch
    { pattern: /^Van /i, origin: 'Dutch', region: 'Netherlands', meaning: 'From (a place)', flag: '🇳🇱' },
    { pattern: /^Van$/i, origin: 'Dutch', region: 'Netherlands', meaning: 'From (a place)', flag: '🇳🇱' },
    { pattern: /^De /i, origin: 'Dutch/French', region: 'Western Europe', meaning: 'The or of', flag: '🇳🇱' },
    { pattern: /stra$/i, origin: 'Frisian/Dutch', region: 'Netherlands', meaning: 'From a place', flag: '🇳🇱' },
    { pattern: /sma$/i, origin: 'Frisian', region: 'Netherlands', meaning: 'Son of', flag: '🇳🇱' },
    { pattern: /inga$/i, origin: 'Frisian', region: 'Netherlands', meaning: 'Belonging to (family)', flag: '🇳🇱' },

    // Jewish
    { pattern: /witz$/i, origin: 'Ashkenazi Jewish', region: 'Eastern Europe', meaning: 'Son of', flag: '✡️' },
    { pattern: /berg$/i, origin: 'German/Jewish', region: 'Central Europe', meaning: 'Mountain', flag: '🇩🇪' },
    { pattern: /gold$/i, origin: 'Jewish', region: 'Central Europe', meaning: 'Gold (often occupational)', flag: '✡️' },
    { pattern: /silver$/i, origin: 'Jewish/English', region: 'Europe', meaning: 'Silver (often occupational)', flag: '✡️' },

    // Arabic/Middle Eastern
    { pattern: /^Al-/i, origin: 'Arabic', region: 'Middle East', meaning: 'The (definite article)', flag: '🇸🇦' },
    { pattern: /^El-/i, origin: 'Arabic', region: 'Middle East', meaning: 'The (definite article)', flag: '🇪🇬' },
    { pattern: /^Ben /i, origin: 'Hebrew/Arabic', region: 'Middle East', meaning: 'Son of', flag: '🇮🇱' },
    { pattern: /^Ibn /i, origin: 'Arabic', region: 'Middle East', meaning: 'Son of', flag: '🇸🇦' },
    { pattern: /zadeh$/i, origin: 'Persian', region: 'Iran', meaning: 'Born of or descendant', flag: '🇮🇷' },
    { pattern: /pour$/i, origin: 'Persian', region: 'Iran', meaning: 'Son of', flag: '🇮🇷' },
    { pattern: /nejad$/i, origin: 'Persian', region: 'Iran', meaning: 'Race or lineage of', flag: '🇮🇷' },

    // Asian
    { pattern: /moto$/i, origin: 'Japanese', region: 'Japan', meaning: 'Origin or base', flag: '🇯🇵' },
    { pattern: /yama$/i, origin: 'Japanese', region: 'Japan', meaning: 'Mountain', flag: '🇯🇵' },
    { pattern: /kawa$/i, origin: 'Japanese', region: 'Japan', meaning: 'River', flag: '🇯🇵' },
    { pattern: /mura$/i, origin: 'Japanese', region: 'Japan', meaning: 'Village', flag: '🇯🇵' },
    { pattern: /ta$/i, origin: 'Japanese', region: 'Japan', meaning: 'Rice field', flag: '🇯🇵' },

    // English occupational/place
    { pattern: /wright$/i, origin: 'English', region: 'England', meaning: 'Craftsman or maker', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /smith$/i, origin: 'English', region: 'England', meaning: 'Metalworker', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /ton$/i, origin: 'English', region: 'England', meaning: 'Town or settlement', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /ham$/i, origin: 'English', region: 'England', meaning: 'Homestead or village', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /ford$/i, origin: 'English', region: 'England', meaning: 'River crossing', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /wood$/i, origin: 'English', region: 'England', meaning: 'Forest or woodland', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /field$/i, origin: 'English', region: 'England', meaning: 'Open land or field', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /ley$/i, origin: 'English', region: 'England', meaning: 'Clearing or meadow', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { pattern: /leigh$/i, origin: 'English', region: 'England', meaning: 'Clearing or meadow', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
];

// Common surnames with specific meanings
const SPECIFIC_SURNAMES: Record<string, SurnameResult> = {
    'smith': { surname: 'Smith', origin: 'English', meaning: 'One who works with metal; blacksmith', region: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Most common surname in English-speaking countries', 'Dates back to Anglo-Saxon times', 'Over 2.4 million people in the US have this surname'] },
    'johnson': { surname: 'Johnson', origin: 'English', meaning: 'Son of John', region: 'England/Scandinavia', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Second most common surname in the US', 'John means "God is gracious"', 'Common in both England and Scandinavia'] },
    'williams': { surname: 'Williams', origin: 'English/Welsh', meaning: 'Son of William', region: 'England/Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', facts: ['Third most common surname in the US', 'William means "resolute protector"', 'Very common in Wales'] },
    'brown': { surname: 'Brown', origin: 'English/Scottish', meaning: 'Person with brown hair or complexion', region: 'British Isles', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Fourth most common surname in the US', 'One of the oldest color-based surnames', 'Common across English-speaking world'] },
    'jones': { surname: 'Jones', origin: 'Welsh', meaning: 'Son of John', region: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', facts: ['Most common surname in Wales', 'Fifth most common in the US', 'Originated in medieval Wales'] },
    'garcia': { surname: 'Garcia', origin: 'Spanish/Basque', meaning: 'Young or bear', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Most common surname in Spain', 'Very common throughout Latin America', 'May derive from Basque word for "young"'] },
    'miller': { surname: 'Miller', origin: 'English/German', meaning: 'One who grinds grain', region: 'Central/Western Europe', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Occupational surname dating to Middle Ages', 'German equivalent is Müller', 'One of the most common surnames worldwide'] },
    'davis': { surname: 'Davis', origin: 'Welsh', meaning: 'Son of David', region: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', facts: ['David means "beloved"', 'Common in Wales and English-speaking countries', 'Biblical name origin'] },
    'rodriguez': { surname: 'Rodriguez', origin: 'Spanish', meaning: 'Son of Rodrigo', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Most common Hispanic surname in the US', 'Rodrigo means "famous ruler"', 'Germanic origin via Visigoths'] },
    'martinez': { surname: 'Martinez', origin: 'Spanish', meaning: 'Son of Martin', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Martin comes from Mars, Roman god of war', 'Very common in Spanish-speaking countries', 'Saint Martin of Tours popularized the name'] },
    'hernandez': { surname: 'Hernandez', origin: 'Spanish', meaning: 'Son of Hernando/Fernando', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Fernando means "bold voyager"', 'Germanic origin through Visigoths', 'Common throughout Latin America'] },
    'lopez': { surname: 'Lopez', origin: 'Spanish', meaning: 'Son of Lope (wolf)', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Lope derives from Latin "lupus" (wolf)', 'One of the oldest Spanish surnames', 'Very common in Latin America'] },
    'gonzalez': { surname: 'Gonzalez', origin: 'Spanish', meaning: 'Son of Gonzalo', region: 'Spain/Latin America', flag: '🇪🇸', facts: ['Gonzalo means "battle" or "war"', 'Germanic origin via Visigoths', 'Common in all Spanish-speaking countries'] },
    'wilson': { surname: 'Wilson', origin: 'English/Scottish', meaning: 'Son of Will/William', region: 'British Isles', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', facts: ['Very common in Scotland', 'William means "resolute protector"', 'Eighth most common surname in the US'] },
    'anderson': { surname: 'Anderson', origin: 'Scottish/Scandinavian', meaning: 'Son of Andrew', region: 'Northern Europe', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', facts: ['Andrew means "manly" or "brave"', 'Common in Scotland and Scandinavia', 'Saint Andrew is patron saint of Scotland'] },
    'thomas': { surname: 'Thomas', origin: 'English/Welsh', meaning: 'Son of Thomas (twin)', region: 'Wales/England', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', facts: ['Aramaic origin meaning "twin"', 'Biblical name from apostle Thomas', 'Very common in Wales'] },
    'taylor': { surname: 'Taylor', origin: 'English/French', meaning: 'One who makes or mends clothes', region: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Occupational surname from Norman French', 'Fourth most common in England', 'Dates to medieval period'] },
    'moore': { surname: 'Moore', origin: 'English/Irish', meaning: 'Person living near a moor or marsh', region: 'British Isles', flag: '🇮🇪', facts: ['Can also derive from Irish Ó Mórdha', 'Irish meaning: "proud" or "stately"', 'Common in both England and Ireland'] },
    'jackson': { surname: 'Jackson', origin: 'English', meaning: 'Son of Jack', region: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', facts: ['Jack is a medieval diminutive of John', 'Popularized in medieval England', 'Common in the American South'] },
    'martin': { surname: 'Martin', origin: 'Latin/French', meaning: 'Of Mars; warlike', region: 'Western Europe', flag: '🇫🇷', facts: ['From Roman god of war Mars', 'Saint Martin of Tours popularized it', 'Common across Europe and Americas'] },
    'lee': { surname: 'Lee', origin: 'English/Chinese/Korean', meaning: 'Clearing or meadow (English) / Plum tree (Chinese)', region: 'Multiple', flag: '🌍', facts: ['One of the most multicultural surnames', 'Most common surname in China and Korea (李)', 'English version refers to woodland clearing'] },
    'nguyen': { surname: 'Nguyen', origin: 'Vietnamese', meaning: 'Musical instrument', region: 'Vietnam', flag: '🇻🇳', facts: ['Most common Vietnamese surname', 'About 40% of Vietnamese have this surname', 'Historically the royal family name'] },
    'kim': { surname: 'Kim', origin: 'Korean', meaning: 'Gold or metal', region: 'Korea', flag: '🇰🇷', facts: ['Most common Korean surname', 'About 20% of Koreans are named Kim', 'Written as 金 (gold)'] },
    'patel': { surname: 'Patel', origin: 'Indian (Gujarati)', meaning: 'Village headman', region: 'India', flag: '🇮🇳', facts: ['Most common Indian surname in diaspora', 'Originated in Gujarat state', 'Title for landowners and village chiefs'] },
    'cohen': { surname: 'Cohen', origin: 'Hebrew', meaning: 'Priest', region: 'Israel/Jewish diaspora', flag: '🇮🇱', facts: ['Indicates descent from biblical priests', 'One of the oldest hereditary surnames', 'Also spelled Kohn, Cohn, Kohen'] },
    'murphy': { surname: 'Murphy', origin: 'Irish', meaning: 'Sea warrior', region: 'Ireland', flag: '🇮🇪', facts: ['Most common surname in Ireland', 'From Gaelic Ó Murchadha', 'Murchu means "sea battler"'] },
    'kelly': { surname: 'Kelly', origin: 'Irish', meaning: 'Warrior or bright-headed', region: 'Ireland', flag: '🇮🇪', facts: ['Second most common in Ireland', 'From Gaelic Ó Ceallaigh', 'Can mean "war" or "strife"'] },
    'sullivan': { surname: 'Sullivan', origin: 'Irish', meaning: 'Dark-eyed one', region: 'Ireland', flag: '🇮🇪', facts: ['From Gaelic Ó Súilleabháin', 'Common in County Cork', 'Súil means "eye"'] },
};

function analyzeSurname(surname: string): SurnameResult {
    const normalized = surname.trim().toLowerCase();

    // Check specific surnames first
    if (SPECIFIC_SURNAMES[normalized]) {
        return { ...SPECIFIC_SURNAMES[normalized], surname: surname };
    }

    // Check patterns
    for (const pattern of SURNAME_PATTERNS) {
        if (pattern.pattern.test(surname)) {
            return {
                surname: surname,
                origin: pattern.origin,
                meaning: pattern.meaning,
                region: pattern.region,
                flag: pattern.flag,
                facts: [
                    `Names ending in this pattern typically indicate ${pattern.origin} heritage`,
                    `Common in ${pattern.region}`,
                    'Many families with this surname pattern emigrated to the Americas'
                ]
            };
        }
    }

    // Default response for unknown surnames
    return {
        surname: surname,
        origin: 'Unknown/Mixed',
        meaning: 'Origin requires further research',
        region: 'Various',
        flag: '🌍',
        facts: [
            'This surname may have unique or localized origins',
            'Consider researching family records or genealogy databases',
            'Some surnames evolved from nicknames or occupations specific to a small region'
        ]
    };
}

export default function SurnameSearchScreen({ navigation, route }: Props) {
    const [surname, setSurname] = useState(route.params?.surname || '');
    const [result, setResult] = useState<SurnameResult | null>(null);

    const handleSearch = () => {
        Keyboard.dismiss();
        if (surname.trim()) {
            setResult(analyzeSurname(surname.trim()));
        }
    };

    return (
        <LinearGradient colors={['#5d4037', '#795548', '#8d6e63']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5d4037" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔍</Text>
                    <Text style={styles.title}>Surname Search</Text>
                    <Text style={styles.subtitle}>Discover Your Name's Origin</Text>
                    <Text style={styles.explainer}>
                        Enter your last name to learn about its history, meaning, and geographic origins.
                    </Text>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter your surname..."
                        placeholderTextColor="#999"
                        value={surname}
                        onChangeText={setSurname}
                        onSubmitEditing={handleSearch}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {result && (
                    <View style={styles.resultContainer}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultFlag}>{result.flag}</Text>
                            <Text style={styles.resultSurname}>{result.surname}</Text>
                        </View>

                        <View style={styles.resultCard}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Origin</Text>
                                <Text style={styles.resultValue}>{result.origin}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Region</Text>
                                <Text style={styles.resultValue}>{result.region}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Meaning</Text>
                                <Text style={styles.resultValue}>{result.meaning}</Text>
                            </View>
                        </View>

                        <View style={styles.factsCard}>
                            <Text style={styles.factsTitle}>📜 Interesting Facts</Text>
                            {result.facts.map((fact, idx) => (
                                <View key={idx} style={styles.factRow}>
                                    <Text style={styles.factBullet}>•</Text>
                                    <Text style={styles.factText}>{fact}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.disclaimerBox}>
                            <Text style={styles.disclaimerText}>
                                Note: Surname origins can be complex. Many surnames have multiple possible origins, and spelling variations can affect interpretation. For definitive ancestry information, consider professional genealogy research.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back</Text>
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
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    explainer: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 18,
        color: '#333',
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#3e2723',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        marginTop: 10,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultFlag: {
        fontSize: 50,
        marginBottom: 8,
    },
    resultSurname: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'capitalize',
    },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        flex: 1,
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5d4037',
        flex: 2,
        textAlign: 'right',
    },
    factsCard: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    factsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#5d4037',
        marginBottom: 12,
    },
    factRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    factBullet: {
        fontSize: 16,
        color: '#795548',
        marginRight: 8,
        lineHeight: 22,
    },
    factText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    disclaimerBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    disclaimerText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 16,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 40,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
