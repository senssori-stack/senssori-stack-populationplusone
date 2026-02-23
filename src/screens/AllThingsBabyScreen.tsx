import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AllThingsBaby'>;

const FEATURES = [
    {
        title: 'JUMPSTART THE AMERICAN DREAM',
        subtitle: 'Build your child\'s financial future',
        emoji: '🇺🇸',
        route: 'JumpstartAmericanDream' as const,
        color: '#001f3f',
    },
    {
        title: 'Baby Milestone Tracker',
        subtitle: 'Track developmental milestones by age',
        emoji: '📊',
        route: 'MilestoneTracker' as const,
        color: '#0d1b2a',
    },
    {
        title: 'Baby Growth Chart',
        subtitle: 'Height, weight & head circumference',
        emoji: '📈',
        route: 'GrowthTracker' as const,
        color: '#1a237e',
    },
    {
        title: 'Learning Center',
        subtitle: 'Letters, numbers, shapes & colors',
        emoji: '📚',
        route: 'LearningCenter' as const,
        color: '#4a148c',
    },
    {
        title: 'Lullabies',
        subtitle: 'Music-box melodies for your little one',
        emoji: '🎵',
        route: 'Lullabies' as const,
        color: '#1a1040',
    },
    {
        title: 'Bedtime Stories',
        subtitle: '25 classic tales read aloud',
        emoji: '📖',
        route: 'BedtimeStories' as const,
        color: '#1e1b4b',
    },
];

export default function AllThingsBabyScreen({ navigation }: Props) {
    return (
        <LinearGradient colors={['#0a0e27', '#1a1040', '#0a0e27']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>👶</Text>
                    <Text style={styles.headerTitle}>All Things Baby</Text>
                    <Text style={styles.headerSub}>
                        Everything you need for your little one
                    </Text>
                </View>

                {/* Feature cards */}
                <View style={styles.cardList}>
                    {FEATURES.map((feature) => (
                        <TouchableOpacity
                            key={feature.route}
                            style={styles.featureCard}
                            onPress={() => navigation.navigate(feature.route)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                            </View>
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureSub}>{feature.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="#475569" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer note */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        All data is stored locally on your device.{'\n'}
                        No account or internet connection required. 💛
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    // Header
    header: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerEmoji: { fontSize: 52, marginBottom: 8 },
    headerTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 15,
        color: '#94a3b8',
        marginTop: 6,
        textAlign: 'center',
    },

    // Cards
    cardList: { paddingHorizontal: 16 },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30,41,59,0.6)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    featureIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    featureEmoji: { fontSize: 28 },
    featureInfo: { flex: 1 },
    featureTitle: {
        color: '#e2e8f0',
        fontSize: 17,
        fontWeight: '700',
    },
    featureSub: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 3,
    },

    // Footer
    footer: {
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        backgroundColor: '#0f172a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    footerText: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },

});
