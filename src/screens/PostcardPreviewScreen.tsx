import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { COLOR_SCHEMES } from '../data/utils/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PostcardPreview'>;

/**
 * PostcardPreviewScreen - Mailable/Shareable birth announcement invitations
 * 
 * Design Philosophy:
 * - Front: Identical to SignFrontLandscape
 * - Back: Formal party invitation with baby stats
 * - Perfect for welcome baby parties & celebrations
 */
export default function PostcardPreviewScreen({ route, navigation }: Props) {
    const { width } = useWindowDimensions();
    const params = route.params || {};

    // Get baby info
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || 'Baby';
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';
    const babyLast = params.babies?.[0]?.last || params.babyLast || '';
    const fullName = [babyFirst, babyMiddle, babyLast].filter(Boolean).join(' ');
    const photoUri = params.babies?.[0]?.photoUri || params.photoUri;
    const photoUris = params.photoUris || (photoUri ? [photoUri] : []);
    const motherName = params.motherName || '';
    const fatherName = params.fatherName || '';
    const parents = [motherName, fatherName].filter(Boolean).join(' & ');
    const hometown = params.hometown || '';
    const population = params.population;
    const dobDate = params.dobISO ? new Date(params.dobISO) : new Date();
    const birthDateStr = dobDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const weightLb = params.weightLb || '';
    const weightOz = params.weightOz || '';
    const lengthIn = params.lengthIn || '';
    const weight = weightLb && weightOz ? `${weightLb} lbs ${weightOz} oz` : '';
    const length = lengthIn ? `${lengthIn}"` : '';

    const theme = params.theme || 'green';
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Refs for capturing
    const frontRef = useRef<ViewShot | null>(null);
    const backRef = useRef<ViewShot | null>(null);

    // Modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    // Cart
    const { addToCart } = useCart();

    const handleAddToCart = (productId: string) => {
        const productInfo = PRODUCT_PRICES[productId as keyof typeof PRODUCT_PRICES];
        const price = productInfo?.price || 0;
        const productName = productInfo?.name || 'Postcard';
        addToCart({
            id: `${productId}-${fullName}-${Date.now()}`,
            name: productName,
            description: `For ${fullName}`,
            productType: 'postcard',
            price,
        });
    };

    // Download items
    const downloadItems: DownloadItem[] = [
        { id: 'postcard-front', label: 'Postcard Front', category: 'postcard' },
        { id: 'postcard-back', label: 'Postcard Back (Invitation)', category: 'postcard' },
    ];

    // Capture function
    const handleCapture = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'postcard-front') ref = frontRef;
            if (itemId === 'postcard-back') ref = backRef;

            if (ref?.current?.capture) {
                const uri = await ref.current.capture();
                return uri;
            }
            return null;
        } catch (error) {
            console.error('Capture error:', error);
            return null;
        }
    };

    // Card dimensions - landscape 6x4 ratio
    const cardWidth = Math.min(width * 0.92, 420);
    const cardHeight = cardWidth * (4 / 6);
    const previewScale = cardWidth / 3300; // Scale from SignFrontLandscape dimensions

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>💌 Invitation Cards</Text>
            <Text style={styles.subtitle}>Mail or share with family & friends!</Text>

            {/* Card Front - SignFrontLandscape */}
            <View style={styles.cardSection}>
                <Text style={styles.sideLabel}>Front</Text>
                <ViewShot ref={frontRef} options={{ format: 'png', quality: 1 }}>
                    <View style={styles.cardShadow}>
                        <SignFrontLandscape
                            theme={theme}
                            previewScale={previewScale}
                            photoUris={photoUris}
                            hometown={hometown}
                            population={population}
                            personName={fullName}
                        />
                    </View>
                </ViewShot>
            </View>

            {/* Card Back - USPS Compliant Postcard */}
            <View style={styles.cardSection}>
                <Text style={styles.sideLabel}>Back (Mailable)</Text>
                <ViewShot ref={backRef} options={{ format: 'png', quality: 1 }}>
                    <View style={[styles.postcardBack, { width: cardWidth, height: cardHeight }]}>
                        {/* LEFT SIDE - Message/Content Area (per USPS rules) */}
                        <View style={styles.messageHalf}>
                            <Text style={[styles.inviteHeader, { color: colors.bg, fontSize: cardWidth * 0.045 }]}>
                                You're Invited!
                            </Text>
                            <Text style={[styles.inviteSubheader, { fontSize: cardWidth * 0.025 }]}>
                                to celebrate the arrival of
                            </Text>
                            <Text style={[styles.inviteBabyName, { color: colors.bg, fontSize: cardWidth * 0.04 }]}>
                                {fullName}
                            </Text>

                            {/* Baby Stats - Compact */}
                            <View style={styles.statsCompact}>
                                <Text style={[styles.statLine, { fontSize: cardWidth * 0.022 }]}>
                                    Born: {birthDateStr}
                                </Text>
                                {weight && (
                                    <Text style={[styles.statLine, { fontSize: cardWidth * 0.022 }]}>
                                        {weight} • {length}
                                    </Text>
                                )}
                            </View>

                            {/* Party Details */}
                            <View style={styles.partyCompact}>
                                <View style={styles.detailRowCompact}>
                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>When:</Text>
                                    <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                </View>
                                <View style={styles.detailRowCompact}>
                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>Where:</Text>
                                    <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                </View>
                                <View style={styles.detailRowCompact}>
                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>RSVP:</Text>
                                    <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                </View>
                            </View>

                            {parents && (
                                <Text style={[styles.hostedBy, { fontSize: cardWidth * 0.018 }]}>
                                    Hosted by {parents}
                                </Text>
                            )}
                        </View>

                        {/* VERTICAL DIVIDER LINE (USPS requirement) */}
                        <View style={styles.postalDivider} />

                        {/* RIGHT SIDE - Address Area (per USPS rules) */}
                        <View style={styles.addressHalf}>
                            {/* Stamp Box - Upper Right */}
                            <View style={styles.stampBox}>
                                <Text style={styles.stampText}>PLACE</Text>
                                <Text style={styles.stampText}>STAMP</Text>
                                <Text style={styles.stampText}>HERE</Text>
                            </View>

                            {/* Address Lines */}
                            <View style={styles.addressArea}>
                                <View style={styles.addressLine} />
                                <View style={styles.addressLine} />
                                <View style={styles.addressLine} />
                                <View style={styles.addressLine} />
                            </View>

                            {/* Brand watermark */}
                            <Text style={[styles.brandText, { fontSize: cardWidth * 0.016 }]}>
                                PopulationPlusOne.com
                            </Text>
                        </View>
                    </View>
                </ViewShot>
            </View>

            {/* Download Button */}
            <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: '#2563eb' }]}
                onPress={() => setShowDownloadModal(true)}
            >
                <Text style={styles.downloadButtonText}>📥 Download / Print Options</Text>
            </TouchableOpacity>

            {/* Cart Actions */}
            <View style={styles.cartActions}>
                <Text style={styles.cartTitle}>Add to Cart:</Text>
                <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: colors.bg }]}
                    onPress={() => handleAddToCart('postcard-front')}
                >
                    <Text style={styles.addToCartButtonText}>+ Postcard Front</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: colors.bg }]}
                    onPress={() => handleAddToCart('postcard-back')}
                >
                    <Text style={styles.addToCartButtonText}>+ Postcard Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.addToCartButton, { backgroundColor: colors.bg }]}
                    onPress={() => handleAddToCart('postcard-bundle-25')}
                >
                    <Text style={styles.addToCartButtonText}>+ 25 Mailable Cards</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.viewCartButton}
                    onPress={() => setShowCartModal(true)}
                >
                    <Text style={styles.viewCartButtonText}>🛒 View Cart</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.description}>
                Premium 6×4" invitation cards on thick cardstock{'\n'}
                Includes envelopes • USPS ready
            </Text>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Preview</Text>
            </TouchableOpacity>

            <DownloadModal
                visible={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                items={downloadItems}
                onCapture={handleCapture}
                babyName={babyFirst}
            />

            <CartModal
                visible={showCartModal}
                onClose={() => setShowCartModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f4f0',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a472a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    cardSection: {
        marginBottom: 28,
        alignItems: 'center',
    },
    sideLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderRadius: 8,
        overflow: 'hidden',
    },
    postcardBack: {
        backgroundColor: '#fffef8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    messageHalf: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    postalDivider: {
        width: 1,
        backgroundColor: '#ccc',
        marginVertical: 8,
    },
    addressHalf: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    inviteHeader: {
        fontWeight: '700',
        fontFamily: 'serif',
        marginBottom: 0,
    },
    inviteSubheader: {
        fontStyle: 'italic',
        color: '#555',
    },
    inviteBabyName: {
        fontWeight: 'bold',
        marginTop: 2,
        marginBottom: 6,
    },
    statsCompact: {
        marginBottom: 6,
    },
    statLine: {
        color: '#555',
    },
    partyCompact: {
        width: '100%',
        gap: 4,
    },
    detailRowCompact: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabelCompact: {
        fontWeight: '600',
        color: '#555',
        width: 45,
    },
    blankLineCompact: {
        flex: 1,
        borderBottomWidth: 1,
        marginLeft: 4,
    },
    hostedBy: {
        color: '#777',
        fontStyle: 'italic',
        marginTop: 4,
    },
    stampBox: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stampText: {
        fontSize: 8,
        color: '#aaa',
        textAlign: 'center',
    },
    addressArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        gap: 10,
        paddingTop: 12,
    },
    addressLine: {
        height: 1,
        backgroundColor: '#ccc',
        width: '100%',
    },
    brandText: {
        color: '#bbb',
    },
    downloadButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    downloadButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600' as const,
    },
    cartActions: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    addToCartButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 10,
        minWidth: 200,
        alignItems: 'center',
    },
    addToCartButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    viewCartButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
    },
    viewCartButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    orderOptions: {
        gap: 12,
        marginTop: 8,
    },
    orderButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    orderButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    orderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    orderButtonTextSecondary: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        margin: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
