import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LandingScreen({ navigation }: Props) {
    return (
        <LinearGradient colors={['#2d5016', '#3d6b1f']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d5016" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Logo & Title Section */}
                <View style={styles.heroSection}>
                    {/* +1 Icon */}
                    <View style={styles.iconBox}>
                        <Text style={styles.iconText}>+1</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.mainTitle}>Population +1</Text>

                    {/* Tagline */}
                    <Text style={[styles.tagline, { marginTop: 12 }]}>Welcome to The +1 Announcemet App Creator Stiudio!</Text>
                    <Text style={[styles.taglineSecond, { marginTop: 12 }]}>CREATE • EDUCATE • GIFT • REMINISCE</Text>
                    <Text style={[styles.taglineSecond, { marginTop: 12 }]}>ENCAPSULATE MAJOR LIFE MILESTONES THAT WILL ENDURE THE TEST OF TIME!</Text>
                </View>

                {/* What Would You Like Section */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>What would you like to create?</Text>

                    {/* Card 0: Sample Signs Gallery */}
                    <TouchableOpacity
                        style={styles.cardButton}
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

                    {/* Card 2: Life Milestones */}
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
                                <Text style={styles.cardTitle}>Life Milestones</Text>
                                <Text style={styles.cardDescription}>Birthday, Sweet 16, Graduation, Anniversary & more!</Text>
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
        backgroundColor: '#2d5016',
    },
    scrollView: {
        flex: 1,
    },
    heroSection: {
        minHeight: screenHeight * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    iconBox: {
        width: 120,
        height: 120,
        backgroundColor: '#4a7c2c',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 56,
        fontWeight: '700',
        color: '#fff',
    },
    mainTitle: {
        fontSize: 38,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    tagline: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    taglineSecond: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '500',
    },
    contentSection: {
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    cardButton: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 13,
    },
    cardIconBox: {
        width: 46,
        height: 46,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardEmoji: {
        fontSize: 23,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2d5016',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 9,
        color: '#666',
        lineHeight: 13,
    },
    cardArrow: {
        fontSize: 13,
        color: '#2d5016',
        fontWeight: '700',
        marginLeft: 5,
    },
    footerSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#ffffff80',
        fontWeight: '500',
    },
});
