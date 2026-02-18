/**
 * GiftSuggestionsPanel — Affiliate gift recommendations
 * ======================================================
 * 
 * Shown when a customer shares/sends their announcement via mail,
 * social media, or hand-delivery. Offers curated gift suggestions
 * with affiliate-tagged purchase links.
 * 
 * Revenue: Commission on each sale made through our affiliate links.
 * 
 * SWITCH: Only renders when FEATURE_FLAGS.GIFTING_ENABLED is true.
 * All links only open when FEATURE_FLAGS.AFFILIATE_LINKS_LIVE is true.
 */

import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    buildAffiliateUrl,
    COMMISSION_RATES,
    FEATURE_FLAGS,
    getGiftSuggestions,
    type GiftSuggestion,
} from '../src/data/utils/affiliate-config';
import { logGiftAffiliateClick } from '../src/data/utils/commission-tracker';

interface GiftSuggestionsPanelProps {
    /** App mode — determines which gifts to show */
    mode: 'baby' | 'birthday' | 'graduation' | 'anniversary' | 'milestone' | 'memorial';
    /** Name of the person receiving the announcement */
    recipientName?: string;
    /** Optional: limit to specific category */
    category?: GiftSuggestion['category'];
    /** Whether to show in compact mode (e.g., inside a modal) */
    compact?: boolean;
}

export default function GiftSuggestionsPanel({
    mode,
    recipientName,
    category,
    compact = false,
}: GiftSuggestionsPanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ─── Feature flag gate ───
    if (!FEATURE_FLAGS.GIFTING_ENABLED) {
        return null; // Don't render anything when gifting is off
    }

    const suggestions = getGiftSuggestions(mode, category);

    // If no suggestions have product IDs filled in yet, show nothing
    if (suggestions.length === 0) {
        return null;
    }

    const handleGiftTap = async (gift: GiftSuggestion) => {
        // Log the affiliate click for commission tracking
        const commissionRate = COMMISSION_RATES.GIFTING[
            gift.platform.toUpperCase() as keyof typeof COMMISSION_RATES.GIFTING
        ] || 0.03;

        await logGiftAffiliateClick({
            productId: gift.id,
            productName: gift.name,
            platform: gift.platform,
            estimatedCommissionRate: commissionRate,
            estimatedProductPrice: parseFloat(gift.priceRange.replace(/[^0-9.]/g, '')) || 0,
            appMode: mode,
            recipientName,
        });

        // Build the affiliate URL
        const url = buildAffiliateUrl(gift);

        if (url && FEATURE_FLAGS.AFFILIATE_LINKS_LIVE) {
            // Open the affiliate link
            try {
                await Linking.openURL(url);
            } catch (error) {
                console.error('[GiftPanel] Failed to open URL:', error);
                Alert.alert('Oops', 'Could not open the link. Please try again.');
            }
        } else {
            // Links not live yet — show info
            Alert.alert(
                `${gift.emoji} ${gift.name}`,
                `${gift.description}\n\nPrice: ${gift.priceRange}\nAvailable on: ${gift.platform.charAt(0).toUpperCase() + gift.platform.slice(1)}\n\n🔜 Direct purchase links coming soon!`,
                [{ text: 'OK' }]
            );
        }
    };

    const platformLabel = (platform: string) => {
        switch (platform) {
            case 'amazon': return '🛒 Amazon';
            case 'etsy': return '🧶 Etsy';
            case 'babylist': return '🍼 Babylist';
            case 'target': return '🎯 Target';
            default: return platform;
        }
    };

    const modeTitle = () => {
        switch (mode) {
            case 'baby': return 'Perfect Gifts for Baby';
            case 'birthday': return 'Birthday Gift Ideas';
            case 'graduation': return 'Graduation Gifts';
            case 'anniversary': return 'Anniversary Gifts';
            case 'milestone': return 'Celebration Gifts';
            case 'memorial': return 'Sympathy Gifts';
            default: return 'Gift Ideas';
        }
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactTitle}>🎁 Send a Gift Too?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compactScroll}>
                    {suggestions.map(gift => (
                        <TouchableOpacity
                            key={gift.id}
                            style={styles.compactCard}
                            onPress={() => handleGiftTap(gift)}
                        >
                            <Text style={styles.compactEmoji}>{gift.emoji}</Text>
                            <Text style={styles.compactName} numberOfLines={2}>{gift.name}</Text>
                            <Text style={styles.compactPrice}>{gift.priceRange}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🎁</Text>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{modeTitle()}</Text>
                    <Text style={styles.subtitle}>
                        {recipientName
                            ? `Add a special gift for ${recipientName}!`
                            : 'Add a thoughtful gift to go with your announcement!'}
                    </Text>
                </View>
            </View>

            {suggestions.map(gift => (
                <TouchableOpacity
                    key={gift.id}
                    style={styles.giftCard}
                    onPress={() => handleGiftTap(gift)}
                    activeOpacity={0.7}
                >
                    <View style={styles.giftRow}>
                        <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                        <View style={styles.giftInfo}>
                            <Text style={styles.giftName}>{gift.name}</Text>
                            <Text style={styles.giftDescription} numberOfLines={2}>{gift.description}</Text>
                            <View style={styles.giftMeta}>
                                <Text style={styles.giftPlatform}>{platformLabel(gift.platform)}</Text>
                                <Text style={styles.giftPrice}>{gift.priceRange}</Text>
                            </View>
                        </View>
                        <Text style={styles.giftArrow}>›</Text>
                    </View>
                </TouchableOpacity>
            ))}

            <Text style={styles.disclaimer}>
                Purchases help support our app. Prices and availability may vary.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // ─── Full panel ───
    container: {
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff9f0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    headerEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#92400e',
    },
    subtitle: {
        fontSize: 13,
        color: '#a16207',
        marginTop: 2,
    },

    // ─── Gift cards ───
    giftCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 10,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    giftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    giftEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    giftInfo: {
        flex: 1,
    },
    giftName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    giftDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    giftMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    giftPlatform: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    giftPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a472a',
    },
    giftArrow: {
        fontSize: 24,
        color: '#ccc',
        marginLeft: 8,
    },

    disclaimer: {
        fontSize: 10,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },

    // ─── Compact mode ───
    compactContainer: {
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    compactTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 8,
    },
    compactScroll: {
        flexDirection: 'row',
    },
    compactCard: {
        backgroundColor: '#fff9f0',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        width: 110,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    compactEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    compactName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    compactPrice: {
        fontSize: 10,
        color: '#1a472a',
        fontWeight: '700',
        marginTop: 4,
    },
});
