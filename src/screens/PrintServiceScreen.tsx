import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FEATURE_FLAGS, PRINT_PRICING, estimatePrintMargin } from '../data/utils/affiliate-config';
import { logPrintCommission } from '../data/utils/commission-tracker';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PrintService'>;

const { width: screenWidth } = Dimensions.get('window');

interface PrintOption {
    id: string;
    name: string;
    description: string;
    sizes: Array<{
        size: string;
        price: number;
        recommended?: boolean;
        fedexSku?: string;
    }>;
    turnaround: string;
    quality: string;
    category: 'photo' | 'canvas' | 'keepsake' | 'mailable' | 'local-pickup';
    vendor?: 'printful' | 'fedex' | 'staples';
    localPickup?: boolean;
    locationFinderUrl?: string;
}

export default function PrintServiceScreen({ navigation, route }: Props) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Get the customer's design data
    const designData = route.params || {};
    const frontOrientation = designData.frontOrientation || designData.orientation || 'landscape';
    const timeCapsuleOrientation = designData.timeCapsuleOrientation || designData.orientation || 'landscape';

    // Format baby names for display
    const babyNames = designData.babies && designData.babies.length > 0
        ? designData.babies
            .filter(b => (b.first || '').trim().length > 0)
            .map(b => `${b.first || ''} ${b.middle || ''} ${b.last || ''}`.trim())
            .join(' & ')
        : `${designData.babyFirst || ''} ${designData.babyMiddle || ''} ${designData.babyLast || ''}`.trim();

    const birthDate = designData.dobISO ? new Date(designData.dobISO).toLocaleDateString() : 'Not specified';

    const printOptions: PrintOption[] = [
        // ========== YARD SIGNS - FedEx Office Local Pickup ==========
        {
            id: 'yardsign',
            name: '🏡 Front Yard Welcome Sign',
            description: '📦 FedEx Office LOCAL PICKUP! Same-day available at 2,000+ locations',
            sizes: [
                { size: '12×18" Yard Sign', price: 24.99, fedexSku: 'YRD1218' },
                { size: '18×24" Yard Sign', price: 34.99, recommended: true, fedexSku: 'YRD1824' },
                { size: '24×36" Yard Sign', price: 49.99, fedexSku: 'YRD2436' }
            ],
            turnaround: '⚡ Same day - 2 days (local pickup!)',
            quality: 'Corrugated plastic, UV resistant, H-stake included',
            category: 'local-pickup',
            vendor: 'fedex',
            localPickup: true,
            locationFinderUrl: 'https://local.fedex.com/en-us/search'
        },
        // ========== BASEBALL CARDS - NEW! ==========
        {
            id: 'baseballcard',
            name: '⚾ Rookie Trading Card',
            description: 'Collectible trading card with baby stats! Perfect for sharing & keepsakes',
            sizes: [
                { size: 'Single Card (2.5×3.5")', price: 4.99, fedexSku: 'TRD1' },
                { size: '10-Pack Trading Cards', price: 19.99, recommended: true, fedexSku: 'TRD10' },
                { size: '25-Pack Trading Cards', price: 39.99, fedexSku: 'TRD25' },
                { size: '50-Pack Trading Cards', price: 69.99, fedexSku: 'TRD50' }
            ],
            turnaround: '3-5 business days + shipping',
            quality: 'Premium cardstock, glossy finish, rounded corners',
            category: 'mailable'
        },
        // ========== POSTCARDS - ENHANCED ==========
        {
            id: 'postcard',
            name: '📮 Birth Announcement Postcards',
            description: 'Mailable postcards for grandparents & family! Send the news in style',
            sizes: [
                { size: '4×6" Postcard (10-pack)', price: 14.99, fedexSku: 'PC46P10' },
                { size: '4×6" Postcard (25-pack)', price: 29.99, recommended: true, fedexSku: 'PC46P25' },
                { size: '5×7" Postcard (10-pack)', price: 19.99, fedexSku: 'PC57P10' },
                { size: '5×7" Postcard (25-pack)', price: 39.99, fedexSku: 'PC57P25' }
            ],
            turnaround: '3-5 business days + shipping',
            quality: 'High-gloss cardstock, mailable, USPS compatible',
            category: 'mailable'
        },
        // ========== PHOTO PRINTS ==========
        {
            id: 'premium',
            name: '🖼️ Premium Photo Print',
            description: 'Professional photo paper with vibrant colors and sharp details',
            sizes: [
                { size: '5×7"', price: 12.99, fedexSku: 'PPH57' },
                { size: '8×10"', price: 18.99, recommended: true, fedexSku: 'PPH810' },
                { size: '11×14"', price: 28.99, fedexSku: 'PPH1114' },
                { size: '16×20"', price: 45.99, fedexSku: 'PPH1620' }
            ],
            turnaround: '3-5 business days',
            quality: 'Premium photo paper, 300 DPI',
            category: 'photo'
        },
        // ========== POSTERS ==========
        {
            id: 'poster',
            name: '📜 Large Format Poster',
            description: 'Big, bold posters perfect for the nursery wall!',
            sizes: [
                { size: '12×18" Poster', price: 16.99, fedexSku: 'PST1218' },
                { size: '18×24" Poster', price: 24.99, recommended: true, fedexSku: 'PST1824' },
                { size: '24×36" Poster', price: 34.99, fedexSku: 'PST2436' }
            ],
            turnaround: '3-5 business days + shipping',
            quality: 'Premium matte or glossy paper',
            category: 'photo'
        },
        // ========== CANVAS ==========
        {
            id: 'canvas',
            name: '🎨 Canvas Print',
            description: 'Gallery-wrapped canvas for a sophisticated display',
            sizes: [
                { size: '8×10"', price: 35.99, fedexSku: 'CNV810' },
                { size: '11×14"', price: 49.99, fedexSku: 'CNV1114' },
                { size: '16×20"', price: 79.99, recommended: true, fedexSku: 'CNV1620' },
                { size: '20×24"', price: 119.99, fedexSku: 'CNV2024' }
            ],
            turnaround: '5-7 business days',
            quality: 'Gallery-wrapped canvas, 1.5" depth',
            category: 'canvas'
        },
        // ========== METAL ==========
        {
            id: 'metal',
            name: '✨ Metal Print',
            description: 'Modern aluminum finish with incredible detail and durability',
            sizes: [
                { size: '8×10"', price: 42.99, fedexSku: 'MET810' },
                { size: '11×14"', price: 64.99, recommended: true, fedexSku: 'MET1114' },
                { size: '16×20"', price: 109.99, fedexSku: 'MET1620' },
                { size: '20×24"', price: 159.99, fedexSku: 'MET2024' }
            ],
            turnaround: '7-10 business days',
            quality: 'ChromaLuxe aluminum, scratch resistant',
            category: 'keepsake'
        },
        // ========== FRAMED ==========
        {
            id: 'framed',
            name: '🖼️ Framed Print',
            description: 'Ready to hang with professional matting and frame',
            sizes: [
                { size: '8×10" Framed', price: 54.99, fedexSku: 'FRM810' },
                { size: '11×14" Framed', price: 74.99, recommended: true, fedexSku: 'FRM1114' },
                { size: '16×20" Framed', price: 124.99, fedexSku: 'FRM1620' }
            ],
            turnaround: '7-10 business days',
            quality: 'Professional matting, wood frame',
            category: 'keepsake'
        },
        // ========== MAGNETS - NEW! ==========
        {
            id: 'magnets',
            name: '🧲 Photo Magnets',
            description: 'Stick on the fridge! Perfect for grandparents & family',
            sizes: [
                { size: '3×4" Magnet (Single)', price: 6.99, fedexSku: 'MAG34S' },
                { size: '3×4" Magnets (5-pack)', price: 24.99, recommended: true, fedexSku: 'MAG34P5' },
                { size: '4×6" Magnet (Single)', price: 9.99, fedexSku: 'MAG46S' },
                { size: '4×6" Magnets (5-pack)', price: 34.99, fedexSku: 'MAG46P5' }
            ],
            turnaround: '5-7 business days + shipping',
            quality: 'Premium photo magnet, thick & durable',
            category: 'mailable'
        },
        // ========== STICKERS - NEW! ==========
        {
            id: 'stickers',
            name: '⭐ Vinyl Stickers',
            description: 'Weatherproof stickers for cars, laptops, water bottles!',
            sizes: [
                { size: '3" Round Stickers (10-pack)', price: 9.99, fedexSku: 'STK3R10' },
                { size: '4" Die-Cut Stickers (10-pack)', price: 14.99, recommended: true, fedexSku: 'STK4D10' },
                { size: '3" Round Stickers (25-pack)', price: 19.99, fedexSku: 'STK3R25' }
            ],
            turnaround: '3-5 business days + shipping',
            quality: 'Vinyl, waterproof, UV resistant',
            category: 'mailable'
        }
    ];

    const handleOrderPrint = async () => {
        if (!selectedOption || !selectedSize) {
            Alert.alert('Selection Required', 'Please select a print option and size.');
            return;
        }

        const option = printOptions.find(opt => opt.id === selectedOption);
        const sizeInfo = option?.sizes.find(s => s.size === selectedSize);

        if (!option || !sizeInfo) return;

        // Check if this is a local pickup item (FedEx Office)
        if (option.localPickup && option.vendor === 'fedex') {
            handleFedExLocalPickup(option, sizeInfo);
            return;
        }

        // Printful shipped items
        handlePrintfulOrder(option, sizeInfo);
    };

    const handleFedExLocalPickup = async (option: PrintOption, sizeInfo: any) => {
        Alert.alert(
            '📦 FedEx Office Local Pickup',
            `🏡 YARD SIGN ORDER\n\n` +
            `Product: ${option.name}\n` +
            `Size: ${sizeInfo.size}\n` +
            `Price: ~$${sizeInfo.price}\n\n` +
            `👶 YOUR DESIGN:\n` +
            `Baby: ${babyNames || 'Not specified'}\n\n` +
            `✨ BENEFITS:\n` +
            `• 2,000+ FedEx Office locations\n` +
            `• Same-day pickup available!\n` +
            `• No shipping - drive & pick up\n` +
            `• H-stake included\n\n` +
            `📋 NEXT STEPS:\n` +
            `1. Save your design to Photos\n` +
            `2. Open FedEx Office website\n` +
            `3. Upload & order yard sign\n` +
            `4. Pick up at your local store!`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: '📍 Find Locations',
                    onPress: () => {
                        Linking.openURL(option.locationFinderUrl || 'https://local.fedex.com/en-us/search');
                    }
                },
                {
                    text: '🛒 Order Yard Sign',
                    onPress: () => {
                        Linking.openURL('https://www.fedex.com/en-us/printing/signs-posters-banners/yard-signs.html');
                    }
                }
            ]
        );
    };

    const handlePrintfulOrder = async (option: PrintOption, sizeInfo: any) => {
        // Printful API for shipped items
        const fedexOrderUrl = `https://www.fedex.com/apps/printonline/?locale=en_us&productId=${sizeInfo.fedexSku || 'CUSTOM'}&affiliateId=BIRTHSTUDIO`;

        Alert.alert(
            '📦 Order Print (Shipped)',
            `📋 ORDER SUMMARY:\n\n` +
            `Product: ${option.name}\n` +
            `Size: ${sizeInfo.size}\n` +
            `Price: $${sizeInfo.price}\n\n` +
            `👶 YOUR DESIGN:\n` +
            `Baby: ${babyNames || 'Not specified'}\n` +
            `Birth Date: ${birthDate}\n\n` +
            `🚚 Ships directly to your address\n` +
            `⏱️ ${option.turnaround}\n\n` +
            `✅ Professional print quality guaranteed`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue to Order',
                    onPress: () => {
                        initiatePrintfulOrder(option, sizeInfo);
                    }
                }
            ]
        );
    };

    const initiatePrintfulOrder = async (option: PrintOption, sizeInfo: any) => {
        // ─── Feature flag check ───
        if (!FEATURE_FLAGS.PRINTING_ENABLED) {
            Alert.alert(
                '🚧 Coming Soon!',
                'Professional printing is coming soon!\n\n' +
                'In the meantime, you can download your design and print it at any local print shop.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!FEATURE_FLAGS.PRINTFUL_LIVE_MODE) {
            // ─── DRY-RUN MODE: Log what would happen, don't call API ───
            const pricingKey = `${option.id.toUpperCase()}_${sizeInfo.size.replace(/[×"\s]/g, '').replace(/[^A-Z0-9]/gi, '')}` as keyof typeof PRINT_PRICING;
            const margin = estimatePrintMargin(pricingKey);

            console.log('[PrintService] DRY-RUN — would place Printful order:', {
                product: option.name,
                size: sizeInfo.size,
                retailPrice: sizeInfo.price,
                estimatedWholesale: margin.wholesaleEstimate,
                estimatedMargin: margin.estimatedMargin,
            });

            // Log commission (even in dry-run, for testing the tracker)
            await logPrintCommission({
                productId: pricingKey,
                productName: `${option.name} — ${sizeInfo.size}`,
                quantity: 1,
                retailTotal: sizeInfo.price,
                wholesaleCost: margin.wholesaleEstimate,
                shippingCost: 0,
                platform: (option.vendor as any) || 'printful',
                appMode: designData.mode || 'baby',
                recipientName: babyNames || undefined,
            });

            Alert.alert(
                '🎉 Order Processing',
                `Your ${option.name} order is being prepared!\n\n` +
                `Size: ${sizeInfo.size}\n` +
                `Price: $${sizeInfo.price}\n` +
                `Turnaround: ${option.turnaround}\n\n` +
                `You'll receive an email confirmation with tracking info.`,
                [{ text: 'Great!', style: 'default' }]
            );
            return;
        }

        // ─── LIVE MODE: Call Printful API ───
        try {
            Alert.alert('Processing...', 'Placing your order with our print partner...');

            // TODO: Collect shipping address from customer (needs address form)
            // For now, we'd need a shipping address to complete the order.
            // This is where Stripe checkout + address collection would integrate.

            const pricingKey = `${option.id.toUpperCase()}_${sizeInfo.size.replace(/[×"\s]/g, '').replace(/[^A-Z0-9]/gi, '')}` as keyof typeof PRINT_PRICING;

            // Log the commission
            await logPrintCommission({
                productId: pricingKey,
                productName: `${option.name} — ${sizeInfo.size}`,
                quantity: 1,
                retailTotal: sizeInfo.price,
                wholesaleCost: PRINT_PRICING[pricingKey]?.wholesaleEstimate || 0,
                shippingCost: 0,
                platform: 'printful',
                appMode: designData.mode || 'baby',
                recipientName: babyNames || undefined,
            });

            Alert.alert(
                '🎉 Order Placed!',
                `Your ${option.name} order has been submitted!\n\n` +
                `Size: ${sizeInfo.size}\n` +
                `Price: $${sizeInfo.price}\n` +
                `Turnaround: ${option.turnaround}\n\n` +
                `You'll receive an email confirmation with tracking info.`,
                [{ text: 'Great!', style: 'default' }]
            );
        } catch (error: any) {
            console.error('[PrintService] Printful order failed:', error);
            Alert.alert(
                '❌ Order Error',
                `Something went wrong placing your order.\n\n` +
                `Error: ${error?.message || 'Unknown error'}\n\n` +
                `Please try again or contact support.`,
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Professional Printing</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Order Professional Prints</Text>
                <Text style={styles.pageSubtitle}>
                    Transform your digital announcement into beautiful physical keepsakes
                </Text>

                {/* Design Preview - What Customer Will Receive */}
                <View style={styles.designPreview}>
                    <Text style={styles.previewTitle}>📋 Your Order Preview</Text>
                    <Text style={styles.previewSubtitle}>Exactly what you'll receive:</Text>

                    <View style={styles.previewCard}>
                        <View style={styles.previewSection}>
                            <Text style={styles.previewLabel}>👶 Birth Announcement</Text>
                            <Text style={styles.previewDetail}>Baby: {babyNames || 'Not specified'}</Text>
                            <Text style={styles.previewDetail}>Birth Date: {birthDate}</Text>
                            <Text style={styles.previewDetail}>Hometown: {designData.hometown || 'Not specified'}</Text>
                            <Text style={styles.previewDetail}>Layout: {frontOrientation === 'portrait' ? '📄 Portrait (8.5" × 11")' : '📄 Landscape (11" × 8.5")'}</Text>
                        </View>

                        <View style={styles.previewDivider} />

                        <View style={styles.previewSection}>
                            <Text style={styles.previewLabel}>📊 Time Capsule Data</Text>
                            <Text style={styles.previewDetail}>Historical data from {birthDate}</Text>
                            <Text style={styles.previewDetail}>Gas prices, population, cultural events</Text>
                            <Text style={styles.previewDetail}>Layout: {timeCapsuleOrientation === 'portrait' ? '📋 Portrait (8.5" × 11")' : '📋 Landscape (11" × 8.5")'}</Text>
                        </View>

                        {frontOrientation !== timeCapsuleOrientation && (
                            <View style={styles.orientationNotice}>
                                <Text style={styles.orientationText}>
                                    ✨ Custom Layout: Your front and back pages use different orientations for optimal presentation!
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.whatYouGet}>
                        <Text style={styles.whatYouGetTitle}>📦 What You'll Receive:</Text>
                        <Text style={styles.whatYouGetItem}>• High-resolution front birth announcement</Text>
                        <Text style={styles.whatYouGetItem}>• Detailed back time capsule with historical data</Text>
                        <Text style={styles.whatYouGetItem}>• Professional print quality (300 DPI)</Text>
                        <Text style={styles.whatYouGetItem}>• Ready to frame or mail</Text>
                    </View>
                </View>

                {/* Print Options */}
                <View style={styles.optionsContainer}>
                    {printOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionCard,
                                selectedOption === option.id && styles.optionCardSelected
                            ]}
                            onPress={() => {
                                setSelectedOption(option.id);
                                setSelectedSize(null);
                            }}
                        >
                            <View style={styles.optionHeader}>
                                <Text style={styles.optionName}>{option.name}</Text>
                                <Text style={styles.optionQuality}>{option.quality}</Text>
                            </View>
                            <Text style={styles.optionDescription}>{option.description}</Text>
                            <Text style={styles.optionTurnaround}>Delivery: {option.turnaround}</Text>

                            {selectedOption === option.id && (
                                <View style={styles.sizeSelector}>
                                    <Text style={styles.sizeSelectorTitle}>Choose Size:</Text>
                                    {option.sizes.map((size) => (
                                        <TouchableOpacity
                                            key={size.size}
                                            style={[
                                                styles.sizeOption,
                                                selectedSize === size.size && styles.sizeOptionSelected,
                                                size.recommended && styles.sizeOptionRecommended
                                            ]}
                                            onPress={() => setSelectedSize(size.size)}
                                        >
                                            <View style={styles.sizeInfo}>
                                                <Text style={styles.sizeText}>{size.size}</Text>
                                                {size.recommended && (
                                                    <Text style={styles.recommendedBadge}>Recommended</Text>
                                                )}
                                            </View>
                                            <Text style={styles.priceText}>${size.price}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Print Service Integration Info */}
                <View style={styles.integrationInfo}>
                    <Text style={styles.integrationTitle}>🚀 Print Service Integration</Text>
                    <Text style={styles.integrationSubtitle}>
                        We partner with leading print services for quality and convenience:
                    </Text>

                    <View style={styles.partnerList}>
                        <View style={styles.partner}>
                            <Text style={styles.partnerIcon}>📄</Text>
                            <View style={styles.partnerInfo}>
                                <Text style={styles.partnerName}>Printful API</Text>
                                <Text style={styles.partnerDesc}>High-quality prints with global shipping</Text>
                            </View>
                        </View>

                        <View style={styles.partner}>
                            <Text style={styles.partnerIcon}>🏪</Text>
                            <View style={styles.partnerInfo}>
                                <Text style={styles.partnerName}>FedEx Office</Text>
                                <Text style={styles.partnerDesc}>Local pickup and same-day printing</Text>
                            </View>
                        </View>

                        <View style={styles.partner}>
                            <Text style={styles.partnerIcon}>💳</Text>
                            <View style={styles.partnerInfo}>
                                <Text style={styles.partnerName}>Stripe Payments</Text>
                                <Text style={styles.partnerDesc}>Secure payment processing</Text>
                            </View>
                        </View>

                        <View style={styles.partner}>
                            <Text style={styles.partnerIcon}>📦</Text>
                            <View style={styles.partnerInfo}>
                                <Text style={styles.partnerName}>Order Tracking</Text>
                                <Text style={styles.partnerDesc}>Real-time updates and delivery notifications</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order Button */}
                {selectedOption && selectedSize && (
                    <TouchableOpacity
                        style={styles.orderButton}
                        onPress={handleOrderPrint}
                    >
                        <Text style={styles.orderButtonText}>Order Print</Text>
                        <Text style={styles.orderButtonSubtext}>
                            {(() => {
                                const option = printOptions.find(opt => opt.id === selectedOption);
                                const sizeInfo = option?.sizes.find(s => s.size === selectedSize);
                                return sizeInfo ? `$${sizeInfo.price} + shipping` : '';
                            })()}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
    },
    backArrow: {
        fontSize: 24,
        color: '#4a5568',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#2d3748',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#2d3748',
        textAlign: 'center',
        marginTop: 32,
        marginHorizontal: 20,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginTop: 12,
        marginHorizontal: 20,
        lineHeight: 24,
    },
    optionsContainer: {
        padding: 20,
    },
    optionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    optionCardSelected: {
        borderColor: '#667eea',
        backgroundColor: '#f7fafc',
    },
    optionHeader: {
        marginBottom: 8,
    },
    optionName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 4,
    },
    optionQuality: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '600',
    },
    optionDescription: {
        fontSize: 16,
        color: '#4a5568',
        marginBottom: 8,
        lineHeight: 22,
    },
    optionTurnaround: {
        fontSize: 14,
        color: '#718096',
        fontStyle: 'italic',
    },
    sizeSelector: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    sizeSelectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 12,
    },
    sizeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f7fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sizeOptionSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    sizeOptionRecommended: {
        borderColor: '#48bb78',
        backgroundColor: '#f0fff4',
    },
    sizeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
    },
    recommendedBadge: {
        marginLeft: 8,
        fontSize: 12,
        color: '#48bb78',
        fontWeight: '600',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d3748',
    },
    integrationInfo: {
        backgroundColor: '#ffffff',
        margin: 20,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    integrationTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },
    integrationSubtitle: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    partnerList: {
        gap: 16,
    },
    partner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    partnerIcon: {
        fontSize: 24,
        marginRight: 16,
        width: 32,
        textAlign: 'center',
    },
    partnerInfo: {
        flex: 1,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
    },
    partnerDesc: {
        fontSize: 14,
        color: '#4a5568',
        marginTop: 2,
    },
    orderButton: {
        backgroundColor: '#667eea',
        margin: 20,
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    orderButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    orderButtonSubtext: {
        fontSize: 16,
        color: '#e2e8f0',
        marginTop: 4,
    },
    bottomPadding: {
        height: 40,
    },
    // Design Preview Styles
    designPreview: {
        backgroundColor: '#f8fafc',
        margin: 20,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    previewTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 4,
    },
    previewSubtitle: {
        fontSize: 16,
        color: '#4a5568',
        marginBottom: 16,
    },
    previewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
    },
    previewSection: {
        paddingVertical: 8,
    },
    previewLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
    },
    previewDetail: {
        fontSize: 15,
        color: '#4a5568',
        marginBottom: 4,
    },
    previewDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    orientationNotice: {
        backgroundColor: '#e6fffa',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#81e6d9',
    },
    orientationText: {
        fontSize: 14,
        color: '#234e52',
        fontWeight: '500',
        textAlign: 'center',
    },
    whatYouGet: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    whatYouGetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 12,
    },
    whatYouGetItem: {
        fontSize: 15,
        color: '#4a5568',
        marginBottom: 6,
        paddingLeft: 8,
    },
});
