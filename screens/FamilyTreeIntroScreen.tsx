import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyTreeIntro'>;

export default function FamilyTreeIntroScreen({ navigation }: Props) {
    return (
        <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEmoji}>🌳</Text>
                    <Text style={styles.heroTitle}>Build Your Family Tree</Text>
                    <Text style={styles.heroSubtitle}>
                        Preserve your family legacy for generations to come
                    </Text>
                </View>

                {/* What is it */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏠 What Is This?</Text>
                    <Text style={styles.cardText}>
                        A beautifully designed, printable family tree that captures your family's
                        history across multiple generations. Perfect as a keepsake, a gift for
                        grandparents, or a meaningful addition to your baby's announcement package.
                    </Text>
                </View>

                {/* How it works */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 How It Works</Text>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Start with the <Text style={styles.bold}>root person</Text> — this is
                            typically the newborn, birthday person, or whoever the tree centers on.
                        </Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Add <Text style={styles.bold}>parents and grandparents</Text> — we'll
                            walk you through each generation, one branch at a time.
                        </Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Optionally add <Text style={styles.bold}>great-grandparents</Text> —
                            go back as far as you know! Every detail you add makes the tree richer.
                        </Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Add <Text style={styles.bold}>siblings, aunts, uncles, and cousins</Text> —
                            fill in as many branches as you'd like.
                        </Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>5</Text>
                        </View>
                        <Text style={styles.stepText}>
                            We generate a <Text style={styles.bold}>beautiful family tree</Text> you
                            can preview, print, and share with your family.
                        </Text>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Tips For Best Results</Text>
                    <Text style={styles.tipText}>
                        • <Text style={styles.bold}>Gather info first</Text> — Ask older relatives
                        for full names, maiden names, birth dates, and birthplaces before you start.
                    </Text>
                    <Text style={styles.tipText}>
                        • <Text style={styles.bold}>Maiden names matter</Text> — Include maiden
                        names where applicable to preserve the full family history.
                    </Text>
                    <Text style={styles.tipText}>
                        • <Text style={styles.bold}>Don't worry about gaps</Text> — If you don't
                        know a date or place, leave it blank. You can always come back and update.
                    </Text>
                    <Text style={styles.tipText}>
                        • <Text style={styles.bold}>Include living & deceased</Text> — Mark family
                        members who have passed so the tree reflects your full lineage.
                    </Text>
                    <Text style={styles.tipText}>
                        • <Text style={styles.bold}>Photos optional</Text> — You can upload small
                        photos for each person to make the tree even more personal.
                    </Text>
                </View>

                {/* What you'll need */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📝 What You'll Need</Text>
                    <Text style={styles.checkItem}>✅ Full names (first, middle, last/maiden)</Text>
                    <Text style={styles.checkItem}>✅ Birth dates (or approximate years)</Text>
                    <Text style={styles.checkItem}>✅ Birthplaces (city, state — optional)</Text>
                    <Text style={styles.checkItem}>✅ Relationship details (spouse, children)</Text>
                    <Text style={styles.checkItem}>⭐ Photos of family members (optional)</Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => navigation.navigate('FamilyTreeForm')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.ctaText}>🌳 Let's Build Your Tree</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 36,
    },
    heroEmoji: {
        fontSize: 72,
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 17,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 14,
    },
    cardText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000080',
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    bold: {
        fontWeight: '800',
        color: '#fff',
    },
    tipText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
        marginBottom: 10,
    },
    checkItem: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 26,
    },
    ctaButton: {
        backgroundColor: '#FFD700',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000080',
    },
});
