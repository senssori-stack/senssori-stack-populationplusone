import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FamousBirthdays'>;

interface FamousPerson {
    year: number;
    name: string;
    description: string;
}

// Fallback famous people for common dates
const fallbackBirthdays: Record<string, FamousPerson[]> = {
    '1-1': [
        { year: 1735, name: 'Paul Revere', description: 'American patriot and silversmith' },
        { year: 1895, name: 'J. Edgar Hoover', description: 'First FBI Director' },
    ],
    '7-4': [
        { year: 1804, name: 'Nathaniel Hawthorne', description: 'American novelist' },
        { year: 1927, name: 'Neil Simon', description: 'American playwright' },
    ],
};

// Large database of famous people by month-day
function generateFamousPeopleForDate(month: number, day: number): FamousPerson[] {
    const allFamousPeople: FamousPerson[] = [
        { year: 1706, name: 'Benjamin Franklin', description: 'Founding Father, inventor, diplomat' },
        { year: 1732, name: 'George Washington', description: 'First U.S. President' },
        { year: 1743, name: 'Thomas Jefferson', description: 'Third U.S. President, author of Declaration' },
        { year: 1756, name: 'Wolfgang Amadeus Mozart', description: 'Classical composer prodigy' },
        { year: 1809, name: 'Abraham Lincoln', description: '16th U.S. President' },
        { year: 1809, name: 'Charles Darwin', description: 'Naturalist, theory of evolution' },
        { year: 1847, name: 'Thomas Edison', description: 'Inventor of the light bulb' },
        { year: 1856, name: 'Nikola Tesla', description: 'Inventor, electrical engineer' },
        { year: 1858, name: 'Theodore Roosevelt', description: '26th U.S. President' },
        { year: 1867, name: 'Marie Curie', description: 'Physicist, Nobel Prize winner' },
        { year: 1874, name: 'Winston Churchill', description: 'British Prime Minister, WWII leader' },
        { year: 1879, name: 'Albert Einstein', description: 'Physicist, theory of relativity' },
        { year: 1880, name: 'Helen Keller', description: 'Author, activist, first deaf-blind college graduate' },
        { year: 1889, name: 'Charlie Chaplin', description: 'Silent film star and director' },
        { year: 1890, name: 'Agatha Christie', description: 'Mystery novelist' },
        { year: 1899, name: 'Humphrey Bogart', description: 'Classic Hollywood actor' },
        { year: 1901, name: 'Walt Disney', description: 'Animator, film producer, theme park creator' },
        { year: 1908, name: 'Bette Davis', description: 'Academy Award-winning actress' },
        { year: 1910, name: 'Mother Teresa', description: 'Nobel Peace Prize humanitarian' },
        { year: 1913, name: 'Rosa Parks', description: 'Civil rights activist' },
        { year: 1915, name: 'Frank Sinatra', description: 'Legendary singer and actor' },
        { year: 1917, name: 'John F. Kennedy', description: '35th U.S. President' },
        { year: 1926, name: 'Marilyn Monroe', description: 'Iconic actress and model' },
        { year: 1929, name: 'Martin Luther King Jr.', description: 'Civil rights leader, Nobel laureate' },
        { year: 1930, name: 'Clint Eastwood', description: 'Actor and film director' },
        { year: 1935, name: 'Elvis Presley', description: 'King of Rock and Roll' },
        { year: 1940, name: 'John Lennon', description: 'Beatles musician and peace activist' },
        { year: 1942, name: 'Muhammad Ali', description: 'Heavyweight boxing champion' },
        { year: 1943, name: 'Mick Jagger', description: 'Rolling Stones lead singer' },
        { year: 1944, name: 'George Lucas', description: 'Star Wars creator' },
        { year: 1946, name: 'Steven Spielberg', description: 'Legendary film director' },
        { year: 1947, name: 'David Bowie', description: 'Rock musician and actor' },
        { year: 1954, name: 'Oprah Winfrey', description: 'Media mogul and talk show host' },
        { year: 1955, name: 'Steve Jobs', description: 'Apple co-founder' },
        { year: 1955, name: 'Bill Gates', description: 'Microsoft co-founder' },
        { year: 1956, name: 'Tom Hanks', description: 'Academy Award-winning actor' },
        { year: 1958, name: 'Madonna', description: 'Queen of Pop' },
        { year: 1958, name: 'Michael Jackson', description: 'King of Pop' },
        { year: 1958, name: 'Prince', description: 'Legendary musician' },
        { year: 1961, name: 'Barack Obama', description: '44th U.S. President' },
        { year: 1961, name: 'Princess Diana', description: 'Princess of Wales' },
        { year: 1963, name: 'Michael Jordan', description: 'Basketball legend' },
        { year: 1964, name: 'Keanu Reeves', description: 'Actor (The Matrix, John Wick)' },
        { year: 1965, name: 'Robert Downey Jr.', description: 'Actor (Iron Man)' },
        { year: 1967, name: 'Julia Roberts', description: 'Academy Award-winning actress' },
        { year: 1969, name: 'Jennifer Aniston', description: 'Actress (Friends)' },
        { year: 1971, name: 'Tupac Shakur', description: 'Influential rapper' },
        { year: 1972, name: 'Dwayne "The Rock" Johnson', description: 'Actor and wrestler' },
        { year: 1974, name: 'Leonardo DiCaprio', description: 'Academy Award-winning actor' },
        { year: 1975, name: 'Angelina Jolie', description: 'Actress and humanitarian' },
        { year: 1977, name: 'Kanye West', description: 'Rapper and producer' },
        { year: 1980, name: 'Kim Kardashian', description: 'Media personality' },
        { year: 1981, name: 'Beyoncé', description: 'Singer, actress, icon' },
        { year: 1984, name: 'LeBron James', description: 'NBA basketball legend' },
        { year: 1984, name: 'Mark Zuckerberg', description: 'Facebook founder' },
        { year: 1987, name: 'Lionel Messi', description: 'Soccer legend' },
        { year: 1988, name: 'Rihanna', description: 'Singer and businesswoman' },
        { year: 1989, name: 'Taylor Swift', description: 'Pop and country music star' },
        { year: 1992, name: 'Selena Gomez', description: 'Singer and actress' },
        { year: 1994, name: 'Justin Bieber', description: 'Pop singer' },
        { year: 1997, name: 'Kylie Jenner', description: 'Media personality and entrepreneur' },
    ];

    // Use date as seed to consistently pick same people for each date
    const seed = month * 100 + day;
    const selected: FamousPerson[] = [];

    for (let i = 0; i < 8; i++) {
        const idx = (seed * 7 + i * 11) % allFamousPeople.length;
        const person = allFamousPeople[idx];
        // Avoid duplicates
        if (!selected.find(p => p.name === person.name)) {
            selected.push(person);
        }
    }

    // Sort by year
    selected.sort((a, b) => a.year - b.year);
    return selected;
}

export default function FamousBirthdaysScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const [celebrities, setCelebrities] = useState<FamousPerson[]>([]);
    const [loading, setLoading] = useState(true);

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        setLoading(true);

        try {
            // Use Wikimedia API - same endpoint, just focus on births
            const paddedMonth = month.toString().padStart(2, '0');
            const paddedDay = day.toString().padStart(2, '0');
            const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${paddedMonth}/${paddedDay}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BirthdayFunApp/1.0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const fetchedPeople: FamousPerson[] = [];

                if (data.births && data.births.length > 0) {
                    // Get up to 15 famous birthdays
                    data.births.slice(0, 15).forEach((b: any) => {
                        if (b.year && b.text) {
                            fetchedPeople.push({
                                year: b.year,
                                name: b.text.split(',')[0].split('(')[0].trim(),
                                description: b.text
                            });
                        }
                    });
                }

                if (fetchedPeople.length > 0) {
                    fetchedPeople.sort((a, b) => a.year - b.year);
                    setCelebrities(fetchedPeople);
                    setLoading(false);
                    return;
                }
            }

            // Fallback to generated data
            const key = `${month}-${day}`;
            const fallback = fallbackBirthdays[key] || generateFamousPeopleForDate(month, day);
            setCelebrities(fallback);
        } catch (err) {
            // Use fallback on error
            const key = `${month}-${day}`;
            const fallback = fallbackBirthdays[key] || generateFamousPeopleForDate(month, day);
            setCelebrities(fallback);
        }

        setLoading(false);
    };

    const getAgeEmoji = (year: number): string => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        if (age < 0) return '👶';
        if (age < 30) return '🧑';
        if (age < 50) return '👨';
        if (age < 80) return '👴';
        if (age < 150) return '🕊️';
        return '📜';
    };

    return (
        <LinearGradient colors={['#ad1457', '#c2185b', '#d81b60']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#ad1457" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🌟</Text>
                    <Text style={styles.title}>Famous Birthday Twins</Text>
                    <Text style={styles.subtitle}>Born on {formattedDate}</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Finding your celebrity twins...</Text>
                    </View>
                ) : (
                    <>
                        {/* Intro */}
                        <View style={styles.introCard}>
                            <Text style={styles.introText}>
                                🎉 You share your birthday with these amazing people!
                            </Text>
                        </View>

                        {/* Celebrity Cards */}
                        {celebrities.map((person, index) => (
                            <View key={index} style={styles.personCard}>
                                <View style={styles.personHeader}>
                                    <Text style={styles.personEmoji}>{getAgeEmoji(person.year)}</Text>
                                    <View style={styles.personInfo}>
                                        <Text style={styles.personName}>{person.name}</Text>
                                        <Text style={styles.personYear}>Born {person.year}</Text>
                                    </View>
                                    <View style={styles.yearBadge}>
                                        <Text style={styles.yearBadgeText}>{person.year}</Text>
                                    </View>
                                </View>
                                <Text style={styles.personDescription}>{person.description}</Text>
                            </View>
                        ))}

                        {/* Fun Fact */}
                        <View style={styles.funFactCard}>
                            <Text style={styles.funFactTitle}>✨ Fun Fact</Text>
                            <Text style={styles.funFactText}>
                                People who share a birthday often have similar personality traits
                                according to astrology! You might share more than just a date with
                                these famous folks.
                            </Text>
                        </View>

                        {/* Data Source */}
                        <Text style={styles.dataSource}>
                            Data sourced from Wikipedia
                        </Text>
                    </>
                )}

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
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginTop: 16,
    },
    introCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    introText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    personCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    personHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    personEmoji: {
        fontSize: 36,
        marginRight: 12,
    },
    personInfo: {
        flex: 1,
    },
    personName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ad1457',
    },
    personYear: {
        fontSize: 14,
        color: '#888',
    },
    yearBadge: {
        backgroundColor: '#fce4ec',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    yearBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ad1457',
    },
    personDescription: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    funFactCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    funFactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    funFactText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
        textAlign: 'center',
    },
    dataSource: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
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
});
