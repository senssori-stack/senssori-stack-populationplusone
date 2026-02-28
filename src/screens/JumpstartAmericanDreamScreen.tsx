import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'JumpstartAmericanDream'>;

const RESOURCES = [
    {
        title: 'Trump Accounts',
        subtitle: 'Official government savings for every child',
        emoji: '🇺🇸',
        url: 'https://trumpaccounts.gov/',
        color: '#b71c1c',
    },
    {
        title: '529 College Savings Plan',
        subtitle: 'Tax-advantaged education savings',
        emoji: '🎓',
        url: 'https://www.savingforcollege.com/intro-to-529s/what-is-a-529-plan',
        color: '#0d47a1',
    },
    {
        title: 'Custodial Investment Account',
        subtitle: 'UGMA/UTMA accounts for minors',
        emoji: '📈',
        url: 'https://www.investor.gov/introduction-investing',
        color: '#000080',
    },
    {
        title: 'Savings Bonds for Baby',
        subtitle: 'U.S. Treasury bonds as gifts',
        emoji: '🏦',
        url: 'https://www.treasurydirect.gov/savings-bonds/',
        color: '#4a148c',
    },
    {
        title: 'First Bank Account',
        subtitle: 'Start their savings habit early',
        emoji: '💰',
        url: 'https://www.fdic.gov/resources/consumers/',
        color: '#bf360c',
    },
    {
        title: 'Life Insurance for Baby',
        subtitle: 'Lock in low rates for life',
        emoji: '🛡️',
        url: 'https://www.naic.org/consumer.htm',
        color: '#1a237e',
    },
    {
        title: 'Social Security Number',
        subtitle: 'Apply for your newborn\'s SSN',
        emoji: '🆔',
        url: 'https://www.ssa.gov/number-card/request-number-first-time',
        color: '#004d40',
    },
];

export default function JumpstartAmericanDreamScreen({ navigation }: Props) {
    const openLink = (url: string) => {
        Linking.openURL(url).catch(() => { });
    };

    return (
        <LinearGradient colors={['#001f3f', '#003366', '#001f3f']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>🇺🇸</Text>
                    <Text style={styles.headerTitle}>JUMPSTART THE{'\n'}AMERICAN DREAM</Text>
                    <Text style={styles.headerSub}>
                        Give your child a head start on financial freedom.{'\n'}
                        Explore resources to build their future today.
                    </Text>
                </View>

                {/* Resource cards */}
                <View style={styles.cardList}>
                    {RESOURCES.map((resource, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.featureCard}
                            onPress={() => openLink(resource.url)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: resource.color }]}>
                                <Text style={styles.featureEmoji}>{resource.emoji}</Text>
                            </View>
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureTitle}>{resource.title}</Text>
                                <Text style={styles.featureSub}>{resource.subtitle}</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color="#475569" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* CRITICAL STEPS */}
                <View style={styles.criticalSection}>
                    <Text style={styles.criticalHeader}>📋 CRITICAL STEPS</Text>
                    <Text style={styles.criticalSubheader}>Essential tasks for your new arrival</Text>

                    {[
                        { step: '1', title: 'Apply for Social Security Number', desc: 'Usually done at the hospital when filing the birth certificate' },
                        { step: '2', title: 'Get Birth Certificate', desc: 'Contact your county vital records office within 10 days' },
                        { step: '3', title: 'Add Baby to Health Insurance', desc: 'You have 30 days from birth to add your newborn' },
                        { step: '4', title: 'Add Baby to Life Insurance', desc: 'Update beneficiaries and consider a policy for baby' },
                        { step: '5', title: 'Set Up a Bank Account', desc: 'Start a savings or custodial account early' },
                        { step: '6', title: 'Start a 529 College Fund', desc: 'Tax-advantaged education savings — every dollar counts' },
                        { step: '7', title: 'Update Your Will & Guardianship', desc: 'Name a legal guardian in case of emergency' },
                        { step: '8', title: 'Register for Trump Accounts', desc: 'Visit trumpaccounts.gov for your child\'s government savings' },
                        { step: '9', title: 'Schedule First Pediatrician Visit', desc: 'Within 3-5 days after leaving the hospital' },
                        { step: '10', title: 'Update Tax Withholdings', desc: 'File a new W-4 to claim your new dependent' },
                    ].map((item) => (
                        <View key={item.step} style={styles.criticalStep}>
                            <View style={styles.criticalStepNumber}>
                                <Text style={styles.criticalStepNumberText}>{item.step}</Text>
                            </View>
                            <View style={styles.criticalStepInfo}>
                                <Text style={styles.criticalStepTitle}>{item.title}</Text>
                                <Text style={styles.criticalStepDesc}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Disclaimer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        These are informational resources only.{'\n'}
                        Consult a financial advisor for personalized advice. 💛
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    headerEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 8,
    },
    headerSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 20,
    },
    cardList: {
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    featureEmoji: {
        fontSize: 24,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    featureSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        lineHeight: 18,
        fontStyle: 'italic',
    },
    criticalSection: {
        marginTop: 28,
        padding: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    criticalHeader: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 4,
    },
    criticalSubheader: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 20,
    },
    criticalStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    criticalStepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1e3a5f',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    criticalStepNumberText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    criticalStepInfo: {
        flex: 1,
    },
    criticalStepTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: 2,
    },
    criticalStepDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 17,
    },
});
