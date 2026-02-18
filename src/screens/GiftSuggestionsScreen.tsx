import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftSuggestions'>;

const AMAZON_TAG = 'populationplu-20';

type OccasionKey = 'newborn' | 'birthday' | 'graduation' | 'anniversary' | 'milestone';

interface GiftCategory {
    id: string;
    name: string;
    emoji: string;
    searchTerm: string;
    color: string;
}

interface Occasion {
    key: OccasionKey;
    label: string;
    emoji: string;
    color: string;
    categories: GiftCategory[];
}

const OCCASIONS: Occasion[] = [
    {
        key: 'newborn',
        label: 'Newborn Baby',
        emoji: '\uD83D\uDC76',
        color: '#e91e63',
        categories: [
            { id: 'nb1', name: 'Baby Gift Sets', emoji: '\uD83C\uDF81', searchTerm: 'newborn+baby+gift+set', color: '#e91e63' },
            { id: 'nb2', name: 'Baby Clothes', emoji: '\uD83D\uDC5A', searchTerm: 'newborn+baby+clothes+outfit', color: '#f06292' },
            { id: 'nb3', name: 'Diapers & Essentials', emoji: '\uD83E\uDDF7', searchTerm: 'baby+diaper+gift+basket', color: '#ec407a' },
            { id: 'nb4', name: 'Baby Blankets', emoji: '\uD83E\uDDE3', searchTerm: 'baby+blanket+gift', color: '#ad1457' },
            { id: 'nb5', name: 'Baby Toys', emoji: '\uD83E\uDDF8', searchTerm: 'newborn+baby+toy+gift', color: '#c2185b' },
            { id: 'nb6', name: 'Nursery Decor', emoji: '\uD83C\uDF1F', searchTerm: 'baby+nursery+decor+gift', color: '#880e4f' },
            { id: 'nb7', name: 'Mom & Baby Care', emoji: '\u2764\uFE0F', searchTerm: 'new+mom+gift+basket', color: '#d81b60' },
            { id: 'nb8', name: 'Baby Carriers', emoji: '\uD83D\uDC23', searchTerm: 'baby+carrier+wrap', color: '#f48fb1' },
        ],
    },
    {
        key: 'birthday',
        label: 'Birthday',
        emoji: '\uD83C\uDF82',
        color: '#ff9800',
        categories: [
            { id: 'bd1', name: 'Birthday Gift Baskets', emoji: '\uD83C\uDF81', searchTerm: 'birthday+gift+basket', color: '#ff9800' },
            { id: 'bd2', name: 'Personalized Gifts', emoji: '\u2728', searchTerm: 'personalized+birthday+gift', color: '#fb8c00' },
            { id: 'bd3', name: 'Birthday Flowers', emoji: '\uD83C\uDF3B', searchTerm: 'birthday+flower+bouquet+delivery', color: '#f57c00' },
            { id: 'bd4', name: 'Chocolate & Treats', emoji: '\uD83C\uDF6B', searchTerm: 'birthday+chocolate+gift+box', color: '#ef6c00' },
            { id: 'bd5', name: 'Kids Birthday Gifts', emoji: '\uD83C\uDF88', searchTerm: 'kids+birthday+gift', color: '#e65100' },
            { id: 'bd6', name: 'Gift Cards', emoji: '\uD83D\uDCB3', searchTerm: 'gift+card+birthday', color: '#ff6d00' },
            { id: 'bd7', name: 'Experience Gifts', emoji: '\uD83C\uDFAD', searchTerm: 'experience+gift+box', color: '#ffa726' },
            { id: 'bd8', name: 'Jewelry', emoji: '\uD83D\uDC8E', searchTerm: 'birthday+jewelry+gift+women', color: '#ffb74d' },
        ],
    },
    {
        key: 'graduation',
        label: 'Graduation',
        emoji: '\uD83C\uDF93',
        color: '#2196f3',
        categories: [
            { id: 'gr1', name: 'Graduation Gift Sets', emoji: '\uD83C\uDF81', searchTerm: 'graduation+gift+set', color: '#2196f3' },
            { id: 'gr2', name: 'Personalized Keepsakes', emoji: '\uD83C\uDFC6', searchTerm: 'personalized+graduation+keepsake', color: '#1e88e5' },
            { id: 'gr3', name: 'Tech & Gadgets', emoji: '\uD83D\uDCF1', searchTerm: 'graduation+gift+tech+gadget', color: '#1976d2' },
            { id: 'gr4', name: 'Money & Card Holders', emoji: '\uD83D\uDCB0', searchTerm: 'graduation+money+gift+card+holder', color: '#1565c0' },
            { id: 'gr5', name: 'Dorm Essentials', emoji: '\uD83C\uDFE0', searchTerm: 'college+dorm+essentials+gift', color: '#0d47a1' },
            { id: 'gr6', name: 'Professional Gifts', emoji: '\uD83D\uDCBC', searchTerm: 'professional+graduation+gift', color: '#42a5f5' },
            { id: 'gr7', name: 'Books & Journals', emoji: '\uD83D\uDCDA', searchTerm: 'graduation+inspirational+book+journal', color: '#64b5f6' },
            { id: 'gr8', name: 'Watches & Accessories', emoji: '\u231A', searchTerm: 'graduation+watch+gift', color: '#90caf9' },
        ],
    },
    {
        key: 'anniversary',
        label: 'Anniversary',
        emoji: '\uD83D\uDC8D',
        color: '#9c27b0',
        categories: [
            { id: 'an1', name: 'Anniversary Gift Sets', emoji: '\uD83C\uDF81', searchTerm: 'anniversary+gift+set+couple', color: '#9c27b0' },
            { id: 'an2', name: 'Jewelry & Watches', emoji: '\uD83D\uDC8E', searchTerm: 'anniversary+jewelry+gift', color: '#8e24aa' },
            { id: 'an3', name: 'Flowers & Roses', emoji: '\uD83C\uDF39', searchTerm: 'anniversary+roses+flower+delivery', color: '#7b1fa2' },
            { id: 'an4', name: 'Personalized Couple Gifts', emoji: '\u2764\uFE0F', searchTerm: 'personalized+anniversary+gift+couple', color: '#6a1b9a' },
            { id: 'an5', name: 'Spa & Relaxation', emoji: '\uD83E\uDDD6', searchTerm: 'spa+gift+set+couple+anniversary', color: '#4a148c' },
            { id: 'an6', name: 'Wine & Champagne', emoji: '\uD83C\uDF77', searchTerm: 'anniversary+wine+champagne+gift', color: '#ab47bc' },
            { id: 'an7', name: 'Photo Frames & Albums', emoji: '\uD83D\uDDBC\uFE0F', searchTerm: 'anniversary+photo+frame+album', color: '#ce93d8' },
            { id: 'an8', name: 'Date Night Gifts', emoji: '\uD83C\uDF1F', searchTerm: 'date+night+gift+box+couple', color: '#ba68c8' },
        ],
    },
    {
        key: 'milestone',
        label: 'Life Milestones',
        emoji: '\u2B50',
        color: '#4caf50',
        categories: [
            { id: 'lm1', name: 'Congratulations Gifts', emoji: '\uD83C\uDF89', searchTerm: 'congratulations+gift+basket', color: '#4caf50' },
            { id: 'lm2', name: 'Achievement Awards', emoji: '\uD83C\uDFC6', searchTerm: 'achievement+award+trophy+plaque', color: '#43a047' },
            { id: 'lm3', name: 'Retirement Gifts', emoji: '\uD83C\uDF34', searchTerm: 'retirement+gift', color: '#388e3c' },
            { id: 'lm4', name: 'New Home Gifts', emoji: '\uD83C\uDFE1', searchTerm: 'housewarming+gift+basket', color: '#2e7d32' },
            { id: 'lm5', name: 'Promotion Gifts', emoji: '\uD83D\uDCBC', searchTerm: 'job+promotion+congratulations+gift', color: '#1b5e20' },
            { id: 'lm6', name: 'Thank You Gifts', emoji: '\uD83D\uDE4F', searchTerm: 'thank+you+gift+basket', color: '#66bb6a' },
            { id: 'lm7', name: 'Memorial & Sympathy', emoji: '\uD83D\uDD4A\uFE0F', searchTerm: 'sympathy+memorial+gift', color: '#81c784' },
            { id: 'lm8', name: 'Religious Milestones', emoji: '\u271D\uFE0F', searchTerm: 'baptism+communion+confirmation+gift', color: '#a5d6a7' },
        ],
    },
];

export default function GiftSuggestionsScreen({ navigation, route }: Props) {
    const initialOccasion = (route.params?.occasion as OccasionKey) || 'newborn';
    const [selectedOccasion, setSelectedOccasion] = useState<OccasionKey>(initialOccasion);

    const currentOccasion = OCCASIONS.find((o) => o.key === selectedOccasion) || OCCASIONS[0];

    const openAmazon = (searchTerm: string) => {
        const url = `https://www.amazon.com/s?k=${searchTerm}&tag=${AMAZON_TAG}`;
        Linking.openURL(url).catch(() => {});
    };

    return (
        <LinearGradient colors={['#1a472a', '#2d6a3f', '#1a472a']} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>{'\uD83C\uDF81'}</Text>
                    <Text style={styles.title}>Gift Suggestions</Text>
                    <Text style={styles.subtitle}>
                        Find the perfect gift for every occasion.{' '}
                        Tap any category to browse on Amazon.
                    </Text>
                </View>

                {/* Occasion Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabScrollView}
                    contentContainerStyle={styles.tabContainer}
                >
                    {OCCASIONS.map((occasion) => (
                        <TouchableOpacity
                            key={occasion.key}
                            style={[
                                styles.occasionTab,
                                selectedOccasion === occasion.key && {
                                    backgroundColor: occasion.color,
                                    borderColor: occasion.color,
                                },
                            ]}
                            onPress={() => setSelectedOccasion(occasion.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.tabEmoji}>{occasion.emoji}</Text>
                            <Text
                                style={[
                                    styles.tabLabel,
                                    selectedOccasion === occasion.key && styles.tabLabelActive,
                                ]}
                            >
                                {occasion.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Category Grid */}
                <View style={styles.categoryGrid}>
                    {currentOccasion.categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryCard}
                            onPress={() => openAmazon(cat.searchTerm)}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.categoryEmojiCircle, { backgroundColor: cat.color + '20' }]}>
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            </View>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                            <View style={[styles.shopButton, { backgroundColor: cat.color }]}>
                                <Text style={styles.shopButtonText}>Shop</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Shopping Tips</Text>
                    <Text style={styles.tipItem}>{'\uD83D\uDCB0'}  Check for coupons and deals on the product page</Text>
                    <Text style={styles.tipItem}>{'\u2B50'}  Read reviews and look for 4+ star ratings</Text>
                    <Text style={styles.tipItem}>{'\uD83D\uDE9A'}  Prime members get free 2-day shipping on eligible items</Text>
                    <Text style={styles.tipItem}>{'\uD83C\uDF81'}  Select gift wrapping at checkout for a special touch</Text>
                    <Text style={styles.tipItem}>{'\uD83D\uDCE6'}  Ship directly to the recipient with a gift message</Text>
                </View>

                <Text style={styles.disclosure}>
                    As an Amazon Associate, Population +1 earns from qualifying purchases.{' '}
                    Prices and availability are subject to change.
                </Text>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    // Occasion Tabs
    tabScrollView: {
        marginBottom: 20,
    },
    tabContainer: {
        paddingHorizontal: 4,
        gap: 8,
    },
    occasionTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    tabEmoji: {
        fontSize: 18,
        marginRight: 6,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
    },
    tabLabelActive: {
        color: '#fff',
    },
    // Category Grid
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        width: '47%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryEmojiCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryEmoji: {
        fontSize: 26,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    shopButton: {
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    shopButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    // Tips
    tipsCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 14,
        textAlign: 'center',
    },
    tipItem: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
        marginBottom: 8,
    },
    disclosure: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
});