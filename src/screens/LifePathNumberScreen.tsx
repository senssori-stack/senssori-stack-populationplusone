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

type Props = NativeStackScreenProps<RootStackParamList, 'LifePathNumber'>;

const { width: screenWidth } = Dimensions.get('window');

// Life Path Number calculation
function calculateLifePathNumber(date: Date): { number: number; meaning: string; traits: string[]; challenges: string; career: string; compatibility: number[] } {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const reduceToSingle = (num: number): number => {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        return num;
    };

    const monthNum = reduceToSingle(month);
    const dayNum = reduceToSingle(day);
    const yearNum = reduceToSingle(year);
    let lifePathNum = reduceToSingle(monthNum + dayNum + yearNum);

    const data: Record<number, { meaning: string; traits: string[]; challenges: string; career: string; compatibility: number[] }> = {
        1: {
            meaning: "The Leader - Independent, ambitious, and driven. You're a natural pioneer who forges new paths and inspires others to follow.",
            traits: ["Independent", "Ambitious", "Innovative", "Confident", "Determined", "Original"],
            challenges: "Learning to collaborate with others and accepting help. Avoiding arrogance and impatience.",
            career: "Entrepreneur, CEO, Inventor, Director, Freelancer, Military Leader",
            compatibility: [3, 5, 6]
        },
        2: {
            meaning: "The Peacemaker - Diplomatic, intuitive, and cooperative. You bring harmony to relationships and excel at understanding others' needs.",
            traits: ["Diplomatic", "Intuitive", "Sensitive", "Cooperative", "Patient", "Supportive"],
            challenges: "Standing up for yourself and avoiding being taken advantage of. Building self-confidence.",
            career: "Mediator, Counselor, Diplomat, Teacher, Healer, Artist",
            compatibility: [4, 6, 8]
        },
        3: {
            meaning: "The Communicator - Creative, expressive, and joyful. You inspire others with your artistic gifts and bring light wherever you go.",
            traits: ["Creative", "Expressive", "Optimistic", "Sociable", "Artistic", "Charming"],
            challenges: "Focusing your talents and following through on projects. Avoiding superficiality.",
            career: "Writer, Actor, Artist, Musician, Designer, Entertainer, Speaker",
            compatibility: [1, 5, 9]
        },
        4: {
            meaning: "The Builder - Practical, organized, and hardworking. You create lasting foundations and bring dreams into physical reality.",
            traits: ["Practical", "Organized", "Loyal", "Hardworking", "Reliable", "Disciplined"],
            challenges: "Being more flexible and open to change. Avoiding stubbornness and rigidity.",
            career: "Architect, Engineer, Accountant, Manager, Contractor, Scientist",
            compatibility: [2, 6, 7]
        },
        5: {
            meaning: "The Freedom Seeker - Adventurous, dynamic, and versatile. You embrace change and new experiences with enthusiasm.",
            traits: ["Adventurous", "Versatile", "Dynamic", "Curious", "Adaptable", "Freedom-loving"],
            challenges: "Developing commitment and discipline. Avoiding restlessness and overindulgence.",
            career: "Travel Writer, Sales, Marketing, Pilot, Journalist, Entrepreneur",
            compatibility: [1, 3, 7]
        },
        6: {
            meaning: "The Nurturer - Loving, responsible, and protective. You care deeply for family and community and create harmony in your environment.",
            traits: ["Loving", "Responsible", "Nurturing", "Protective", "Compassionate", "Domestic"],
            challenges: "Setting healthy boundaries and avoiding being overly controlling or self-sacrificing.",
            career: "Teacher, Nurse, Therapist, Chef, Interior Designer, Social Worker",
            compatibility: [1, 2, 4, 9]
        },
        7: {
            meaning: "The Seeker - Analytical, spiritual, and introspective. You search for deeper truths and possess profound inner wisdom.",
            traits: ["Analytical", "Spiritual", "Introspective", "Wise", "Intuitive", "Mysterious"],
            challenges: "Opening up emotionally and connecting with others. Avoiding isolation and skepticism.",
            career: "Researcher, Scientist, Philosopher, Writer, Analyst, Spiritual Teacher",
            compatibility: [4, 5, 9]
        },
        8: {
            meaning: "The Powerhouse - Ambitious, authoritative, and successful. You have the ability to manifest abundance and lead large endeavors.",
            traits: ["Ambitious", "Authoritative", "Successful", "Practical", "Business-minded", "Powerful"],
            challenges: "Balancing material and spiritual goals. Avoiding workaholism and power struggles.",
            career: "Executive, Banker, Lawyer, Real Estate, Business Owner, Politician",
            compatibility: [2, 4, 6]
        },
        9: {
            meaning: "The Humanitarian - Compassionate, generous, and wise. You serve the greater good and have a universal love for humanity.",
            traits: ["Compassionate", "Generous", "Wise", "Creative", "Romantic", "Humanitarian"],
            challenges: "Letting go of the past and personal attachments. Avoiding resentment and self-pity.",
            career: "Doctor, Humanitarian, Artist, Philanthropist, Counselor, Educator",
            compatibility: [3, 6, 7]
        },
        11: {
            meaning: "The Master Intuitive - Highly intuitive and spiritually aware. You're a visionary who inspires others and channels higher wisdom.",
            traits: ["Intuitive", "Visionary", "Inspirational", "Sensitive", "Idealistic", "Charismatic"],
            challenges: "Managing nervous energy and high sensitivity. Grounding your visions in reality.",
            career: "Spiritual Leader, Inventor, Artist, Counselor, Healer, Motivational Speaker",
            compatibility: [2, 4, 6]
        },
        22: {
            meaning: "The Master Builder - You have the rare ability to turn dreams into reality on a grand scale. You can manifest large-scale projects that benefit humanity.",
            traits: ["Visionary", "Practical", "Ambitious", "Disciplined", "Powerful", "Masterful"],
            challenges: "Handling immense pressure and expectations. Avoiding becoming overwhelmed by your potential.",
            career: "Architect, CEO, Leader, Inventor, Diplomat, International Business",
            compatibility: [4, 6, 8]
        },
        33: {
            meaning: "The Master Teacher - The rarest life path. You're a highly evolved soul devoted to uplifting humanity through unconditional love and selfless service.",
            traits: ["Selfless", "Loving", "Wise", "Nurturing", "Devoted", "Spiritual"],
            challenges: "Maintaining boundaries while serving others. Avoiding martyrdom and burnout.",
            career: "Spiritual Teacher, Healer, Humanitarian Leader, Counselor, Artist",
            compatibility: [6, 9, 11]
        }
    };

    const result = data[lifePathNum] || {
        meaning: "A unique and special soul with your own special path!",
        traits: ["Unique", "Special", "Gifted"],
        challenges: "Discovering and embracing your unique gifts.",
        career: "Anything you set your mind to!",
        compatibility: [1, 2, 3]
    };

    return { number: lifePathNum, ...result };
}

export default function LifePathNumberScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const result = calculateLifePathNumber(birthDate);

    const formattedDate = birthDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <LinearGradient colors={['#4a148c', '#7b1fa2', '#9c27b0']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4a148c" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔢</Text>
                    <Text style={styles.title}>Your Life Path Number</Text>
                    <Text style={styles.subtitle}>{formattedDate}</Text>
                </View>

                {/* Big Number Display */}
                <View style={styles.numberContainer}>
                    <LinearGradient
                        colors={['#fff', '#f0e6ff']}
                        style={styles.numberCircle}
                    >
                        <Text style={styles.bigNumber}>{result.number}</Text>
                        {(result.number === 11 || result.number === 22 || result.number === 33) && (
                            <Text style={styles.masterLabel}>✨ Master Number ✨</Text>
                        )}
                    </LinearGradient>
                </View>

                {/* Meaning */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Path</Text>
                    <Text style={styles.meaningText}>{result.meaning}</Text>
                </View>

                {/* Traits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Traits</Text>
                    <View style={styles.traitsContainer}>
                        {result.traits.map((trait, index) => (
                            <View key={index} style={styles.traitBadge}>
                                <Text style={styles.traitText}>{trait}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Challenges */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Life Challenges</Text>
                    <Text style={styles.bodyText}>{result.challenges}</Text>
                </View>

                {/* Career */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Career Paths</Text>
                    <Text style={styles.bodyText}>{result.career}</Text>
                </View>

                {/* Compatibility */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compatible Life Paths</Text>
                    <View style={styles.compatContainer}>
                        {result.compatibility.map((num, index) => (
                            <View key={index} style={styles.compatBadge}>
                                <Text style={styles.compatText}>{num}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* What is a Life Path Number? */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>What is a Life Path Number?</Text>
                    <Text style={styles.infoText}>
                        In numerology, your Life Path Number is the most important number in your chart.
                        It's calculated from your complete birth date and reveals your life's purpose,
                        natural talents, and the challenges you may face.
                    </Text>
                    <Text style={styles.infoText}>
                        Think of it as a roadmap for your life journey. While it doesn't predict your future,
                        it illuminates the themes, energies, and opportunities that will shape your path.
                    </Text>

                    <Text style={styles.infoSubtitle}>How It's Calculated:</Text>
                    <Text style={styles.infoText}>
                        Your birth date is reduced to a single digit (or Master Number 11, 22, or 33)
                        by adding all the digits together repeatedly until you get a single digit.
                    </Text>
                    <Text style={styles.calcExample}>
                        {birthDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} → {result.number}
                    </Text>

                    <Text style={styles.infoSubtitle}>The Numbers:</Text>
                    <View style={styles.numberGuide}>
                        <Text style={styles.guideItem}>1 - The Leader</Text>
                        <Text style={styles.guideItem}>2 - The Peacemaker</Text>
                        <Text style={styles.guideItem}>3 - The Communicator</Text>
                        <Text style={styles.guideItem}>4 - The Builder</Text>
                        <Text style={styles.guideItem}>5 - The Freedom Seeker</Text>
                        <Text style={styles.guideItem}>6 - The Nurturer</Text>
                        <Text style={styles.guideItem}>7 - The Seeker</Text>
                        <Text style={styles.guideItem}>8 - The Powerhouse</Text>
                        <Text style={styles.guideItem}>9 - The Humanitarian</Text>
                        <Text style={styles.guideItemMaster}>11 - Master Intuitive</Text>
                        <Text style={styles.guideItemMaster}>22 - Master Builder</Text>
                        <Text style={styles.guideItemMaster}>33 - Master Teacher</Text>
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
        marginBottom: 20,
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
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    numberContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    numberCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bigNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#4a148c',
    },
    masterLabel: {
        fontSize: 12,
        color: '#7b1fa2',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 15,
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
        color: '#4a148c',
        marginBottom: 12,
    },
    meaningText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    bodyText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    traitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    traitBadge: {
        backgroundColor: '#e1bee7',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    traitText: {
        fontSize: 14,
        color: '#4a148c',
        fontWeight: '600',
    },
    compatContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    compatBadge: {
        backgroundColor: '#4a148c',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compatText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4a148c',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7b1fa2',
        marginTop: 16,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        marginBottom: 8,
    },
    calcExample: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a148c',
        textAlign: 'center',
        padding: 12,
        backgroundColor: '#f0e6ff',
        borderRadius: 8,
        marginTop: 8,
    },
    numberGuide: {
        marginTop: 8,
    },
    guideItem: {
        fontSize: 14,
        color: '#555',
        paddingVertical: 4,
    },
    guideItemMaster: {
        fontSize: 14,
        color: '#7b1fa2',
        fontWeight: 'bold',
        paddingVertical: 4,
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
    },
});
