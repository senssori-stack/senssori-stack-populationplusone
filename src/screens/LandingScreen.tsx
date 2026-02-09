import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LandingScreen({ navigation }: Props) {
    const tapCountRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleIconTap = () => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        tapCountRef.current += 1;

        if (tapCountRef.current >= 7) {
            tapCountRef.current = 0;
            navigation.navigate('RabbitHole');
            return;
        }

        // Reset tap count after 2 seconds of inactivity
        timeoutRef.current = setTimeout(() => {
            tapCountRef.current = 0;
        }, 2000);
    };

    return (
        <LinearGradient colors={['#1a3a5c', '#2a5a8c']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a3a5c" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Logo & Title Section */}
                <View style={styles.heroSection}>
                    {/* +1 Icon - Tap 7 times to go down the rabbit hole! */}
                    <TouchableOpacity onPress={handleIconTap} activeOpacity={0.8}>
                        <View style={styles.iconBox}>
                            <Text style={styles.iconText}>+1</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.mainTitle}>Population +1</Text>

                    {/* Tagline */}
                    <Text style={[styles.tagline, { marginTop: 12 }]}>Welcome To......</Text>
                    <Text style={[styles.tagline]}>The +1 Announcement App Creator Studio!</Text>
                    <Text style={[styles.taglineSecond, { marginTop: 12 }]}>CREATE • EDUCATE • GIFT • REMINISCE</Text>
                    <Text style={[styles.taglineSecond, { marginTop: 12 }]}>ENCAPSULATE MAJOR LIFE MILESTONES THAT WILL ENDURE THE TEST OF TIME!</Text>
                </View>

                {/* What Would You Like Section */}
                <View style={styles.contentSection}>
                    {/* Card 0: Sample Signs Gallery - Above section title */}
                    <TouchableOpacity
                        style={[styles.cardButton, { marginBottom: 24 }]}
                        onPress={() => navigation.navigate('SampleGallery')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>👁️</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>SEE SAMPLE SIGNS</Text>
                                <Text style={styles.cardDescription}>View actual examples of how your signs will look!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>What would you like to create?</Text>

                    {/* Card 1: New Baby Announcement */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('Form')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>👶</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>+1 New Baby Announcement</Text>
                                <Text style={styles.cardDescription}>Welcome your +1 to friends & family with a custom announcement!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 2: Birthday Announcement */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('BirthdayForm')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>🎂</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>Create A Birthday Announcement</Text>
                                <Text style={styles.cardDescription}>Sweet 16, 21st Birthday, Over the Hill & more!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 3: Graduation Announcement */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('GraduationForm')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>🎓</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>Create A Graduation Announcement</Text>
                                <Text style={styles.cardDescription}>High School, College, Technical/Trade School!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 4: Anniversary Announcement */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('AnniversaryForm')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>💍</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>Create An Anniversary Announcement</Text>
                                <Text style={styles.cardDescription}>Celebrate your special milestones together!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 5: Life Milestones */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('LifeMilestones')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>🎉</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>Other Life Milestones</Text>
                                <Text style={styles.cardDescription}>Mother's Day, Father's Day & more!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 6: Population -1 (Obituary) - Coming March 1, 2026 */}
                    {/* TODO: Enable navigation when ready: onPress={() => navigation.navigate('ObituaryForm')} */}
                    <View style={styles.cardButton}>
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>🕊️</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>-1 Memorial Announcements Coming March 1, 2026</Text>
                            </View>
                        </View>
                    </View>

                    {/* Divider Gap */}
                    <View style={styles.sectionGap} />

                    {/* Card 4: Just For Fun */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('JustForFun')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>🎲</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>Just For Fun!</Text>
                                <Text style={styles.cardDescription}>Life Path Numbers, Lucky Numbers, Roman Numerals & more!</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 5: About Us */}
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => navigation.navigate('AboutUs')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardIconBox}>
                                <Text style={styles.cardEmoji}>ℹ️</Text>
                            </View>
                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>About Us</Text>
                                <Text style={styles.cardDescription}>Learn more about Population +1</Text>
                            </View>
                            <Text style={styles.cardArrow}>→</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footerSection}>
                    <Text style={styles.footerText}>WWW.POPULATIONPLUSONE.COM</Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a3a5c',
    },
    scrollView: {
        flex: 1,
    },
    heroSection: {
        minHeight: screenHeight * 0.52,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 50,
    },
    iconBox: {
        width: 130,
        height: 130,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    iconText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    mainTitle: {
        fontSize: 52,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    tagline: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    taglineSecond: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingVertical: 36,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 28,
    },
    cardButton: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    cardIconBox: {
        width: 54,
        height: 54,
        backgroundColor: '#1a3a5c',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardEmoji: {
        fontSize: 28,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1a3a5c',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    cardArrow: {
        fontSize: 22,
        color: '#1a3a5c',
        fontWeight: '800',
        marginLeft: 10,
    },
    footerSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    cardButtonDimmed: {
        opacity: 0.6,
    },
    cardIconBoxDimmed: {
        backgroundColor: '#ccc',
    },
    cardTitleDimmed: {
        color: '#888',
    },
    cardDescriptionDimmed: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 12,
        fontWeight: '500',
    },
    sectionGap: {
        height: 24,
    },
});
