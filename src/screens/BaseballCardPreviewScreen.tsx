import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import TradingCardLogo from '../../components/TradingCardLogo';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BaseballCardPreview'>;

/**
 * BaseballCardPreviewScreen - Collectible-style baby stats card
 * 
 * Design Philosophy:
 * - Classic baseball card format (2.5" x 3.5")
 * - Front: Photo with name banner
 * - Back: Stats like a sports card
 * - Fun collectible keepsake
 */
export default function BaseballCardPreviewScreen({ route, navigation }: Props) {
    const { width } = useWindowDimensions();
    const params = route.params || {};

    // Get baby info
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || 'Baby';
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';
    const babyLast = params.babies?.[0]?.last || params.babyLast || '';
    const fullName = [babyFirst, babyMiddle, babyLast].filter(Boolean).join(' ');
    // Resolve photo from all possible sources (photoUris array from 3-slot picker, babies array, or direct photoUri)
    const photoUri = params.photoUri || params.photoUris?.find((u: string | null) => u) || params.babies?.[0]?.photoUri || null;
    const hometown = params.hometown || 'Hometown, USA';
    const dobDate = params.dobISO ? new Date(params.dobISO) : new Date();
    const birthDateStr = dobDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dobISO = dobDate.toISOString().split('T')[0];
    const weightLb = params.weightLb || '7';
    const weightOz = params.weightOz || '8';
    const lengthIn = params.lengthIn || '20';

    // Fun stats
    const zodiac = getZodiacFromISO(dobISO);
    const birthstone = birthstoneFromISO(dobISO);

    const theme = params.theme || 'green';
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Baseball card dimensions (2.5x3.5" at preview scale)
    const cardWidth = Math.min(width * 0.65, 280);
    const cardHeight = cardWidth * (3.5 / 2.5);

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
        const productName = productInfo?.name || 'Trading Card';
        addToCart({
            id: `${productId}-${fullName}-${Date.now()}`,
            name: productName,
            description: `For ${fullName}`,
            productType: 'babycard',
            price,
        });
    };

    // Download items
    const downloadItems: DownloadItem[] = [
        { id: 'babycard-front', label: 'Card Front', category: 'babycard' },
        { id: 'babycard-back', label: 'Card Back (Stats)', category: 'babycard' },
    ];

    // Simple capture function for a single view
    const captureView = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'babycard-front') ref = frontRef;
            if (itemId === 'babycard-back') ref = backRef;

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

    // Capture for DownloadModal
    const handleCapture = async (itemId: string): Promise<string | null> => {
        return captureView(itemId);
    };

    // --- Zoom/Pan gesture state ---
    const { height: screenHeight } = useWindowDimensions();
    const zoomScale = useRef(new Animated.Value(1)).current;
    const baseScale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const baseTranslateX = useRef(new Animated.Value(0)).current;
    const baseTranslateY = useRef(new Animated.Value(0)).current;
    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);
    const doubleTapRef = useRef(null);
    const pinchRef = useRef(null);
    const panRef = useRef(null);
    const isZoomedIn = useRef(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const onPinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: zoomScale } }],
        { useNativeDriver: false }
    );
    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const newScale = lastScale.current * event.nativeEvent.scale;
            lastScale.current = Math.max(0.5, Math.min(4.0, newScale));
            baseScale.setValue(lastScale.current);
            zoomScale.setValue(1);
            setScrollEnabled(lastScale.current <= 1.05);
        }
    };
    const onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
    );
    const onPanHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            let newTX = lastTranslateX.current + event.nativeEvent.translationX;
            let newTY = lastTranslateY.current + event.nativeEvent.translationY;
            lastTranslateX.current = newTX;
            lastTranslateY.current = newTY;
            baseTranslateX.setValue(lastTranslateX.current);
            baseTranslateY.setValue(lastTranslateY.current);
            translateX.setValue(0);
            translateY.setValue(0);
        }
    };
    const onDoubleTap = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const target = isZoomedIn.current ? 1.0 : 2.0;
            zoomScale.setValue(1);
            baseScale.setValue(target);
            translateX.setValue(0);
            translateY.setValue(0);
            baseTranslateX.setValue(0);
            baseTranslateY.setValue(0);
            lastScale.current = target;
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
            isZoomedIn.current = !isZoomedIn.current;
            setScrollEnabled(target <= 1.05);
        }
    };
    const resetZoom = () => {
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        isZoomedIn.current = false;
        zoomScale.setValue(1);
        baseScale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
        setScrollEnabled(true);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
            <Text style={styles.title}>⚾ Trading Cards</Text>
            <Text style={styles.subtitle}>A collectible keepsake!</Text>

            {/* Zoomable card area */}
            <View style={{ width: '100%', minHeight: 300, alignItems: 'center' }}>
                <TouchableOpacity onPress={resetZoom} style={{ alignSelf: 'flex-end', marginBottom: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#ddd', borderRadius: 8 }}>
                    <Text style={{ fontSize: 13, color: '#333' }}>Reset Zoom</Text>
                </TouchableOpacity>
                <GestureHandlerRootView style={{ width: '100%', alignItems: 'center' }}>
                    <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
                        <Animated.View>
                            <PanGestureHandler
                                ref={panRef}
                                onGestureEvent={onPanGestureEvent}
                                onHandlerStateChange={onPanHandlerStateChange}
                                waitFor={doubleTapRef}
                                simultaneousHandlers={pinchRef}
                                minPointers={1}
                                maxPointers={1}
                            >
                                <Animated.View>
                                    <PinchGestureHandler
                                        ref={pinchRef}
                                        onGestureEvent={onPinchGestureEvent}
                                        onHandlerStateChange={onPinchHandlerStateChange}
                                    >
                                        <Animated.View style={{
                                            transform: [
                                                { scale: Animated.multiply(baseScale, zoomScale) },
                                                { translateX: Animated.add(baseTranslateX, translateX) },
                                                { translateY: Animated.add(baseTranslateY, translateY) },
                                            ],
                                        }}>

                                            {/* Card Front */}
                                            <View style={styles.cardSection}>
                                                <Text style={styles.sideLabel}>Front</Text>
                                                <ViewShot ref={frontRef} options={{ format: 'png', quality: 1 }}>
                                                    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                                                        {/* Card border effect */}
                                                        <View style={[styles.cardInner, { borderColor: colors.bg }]}>
                                                            {/* Photo area */}
                                                            <View style={styles.photoContainer}>
                                                                {photoUri ? (
                                                                    <Image source={{ uri: photoUri }} style={styles.photo} />
                                                                ) : (
                                                                    <View style={[styles.photoPlaceholder, { backgroundColor: colors.bg }]}>
                                                                        <Text style={styles.placeholderEmoji}>👶</Text>
                                                                    </View>
                                                                )}
                                                            </View>

                                                            {/* Name banner */}
                                                            <View style={[styles.nameBanner, { backgroundColor: colors.bg }]}>
                                                                <Text style={[styles.firstName, { fontSize: cardWidth * 0.06 }]}>
                                                                    {babyFirst.toUpperCase()}{babyLast ? ` ${babyLast.toUpperCase()}` : ''}
                                                                </Text>
                                                            </View>

                                                            {/* Team/Location */}
                                                            <View style={styles.teamBar}>
                                                                <Text style={[styles.teamText, { fontSize: cardWidth * 0.04 }]}>
                                                                    🏠 TEAM {(babyLast || 'BABY').toUpperCase()} FAMILY
                                                                </Text>
                                                            </View>

                                                            {/* Rookie badge */}
                                                            <View style={[styles.rookieBadge, { backgroundColor: colors.bg }]}>
                                                                <Text style={styles.rookieText}>ROOKIE</Text>
                                                            </View>

                                                            {/* Brand logo - top left like Topps */}
                                                            <View style={styles.brandLogo}>
                                                                <TradingCardLogo size={cardWidth * 0.107} bgColor={colors.bg} />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                            </View>

                                            {/* Card Back */}
                                            <View style={styles.cardSection}>
                                                <Text style={styles.sideLabel}>Back</Text>
                                                <ViewShot ref={backRef} options={{ format: 'png', quality: 1 }}>
                                                    <View style={[styles.card, styles.cardBack, { width: cardWidth, height: cardHeight }]}>
                                                        {/* Header */}
                                                        <View style={[styles.backHeader, { backgroundColor: colors.bg }]}>
                                                            <Text style={[styles.backName, { fontSize: cardWidth * 0.08 }]}>
                                                                {fullName}
                                                            </Text>
                                                            <Text style={[styles.backPosition, { fontSize: cardWidth * 0.04 }]}>
                                                                Position: NEWEST FAMILY MEMBER
                                                            </Text>
                                                        </View>

                                                        {/* Stats table */}
                                                        <View style={styles.statsTable}>
                                                            <Text style={[styles.statsHeader, { fontSize: cardWidth * 0.05 }]}>
                                                                VITAL STATS
                                                            </Text>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Debut Date</Text>
                                                                <Text style={styles.statValue}>{birthDateStr}</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Weight</Text>
                                                                <Text style={styles.statValue}>{weightLb} lbs {weightOz} oz</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Height</Text>
                                                                <Text style={styles.statValue}>{lengthIn}"</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Birthstone</Text>
                                                                <Text style={styles.statValue}>{birthstone || 'Unknown'}</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Zodiac</Text>
                                                                <Text style={styles.statValue}>{zodiac || 'Unknown'}</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Team</Text>
                                                                <Text style={styles.statValue}>{babyLast || 'TBD'} Family</Text>
                                                            </View>

                                                            <View style={styles.statRow}>
                                                                <Text style={styles.statLabel}>Hometown</Text>
                                                                <Text style={styles.statValue}>{hometown}</Text>
                                                            </View>
                                                        </View>

                                                        {/* Footer */}
                                                        <View style={styles.backFooter}>
                                                            <Text style={styles.cardNumber}>#001</Text>
                                                            <TradingCardLogo size={cardWidth * 0.067} bgColor={colors.bg} />
                                                            <Text style={styles.brand}>Population +1™</Text>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                            </View>

                                        </Animated.View>
                                    </PinchGestureHandler>
                                </Animated.View>
                            </PanGestureHandler>
                        </Animated.View>
                    </TapGestureHandler>
                </GestureHandlerRootView>
            </View>

            {/* Cart Actions */}
            <View style={styles.cartActions}>
                <Text style={styles.cartTitle}>Add to Cart:</Text>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('babycard-front')}
                >
                    <Text style={styles.addToCartButtonText}>+ Card Front</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('babycard-back')}
                >
                    <Text style={styles.addToCartButtonText}>+ Card Back (Stats)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('babycard-bundle-10')}
                >
                    <Text style={styles.addToCartButtonText}>+ 10 Cards Bundle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('babycard-bundle-25')}
                >
                    <Text style={styles.addToCartButtonText}>+ 25 Cards Bundle</Text>
                </TouchableOpacity>
            </View>

            {/* Action Tiles */}
            <View style={styles.actionTileGrid}>
                <TouchableOpacity
                    style={[styles.actionTile, { backgroundColor: '#2563eb' }]}
                    onPress={() => setShowDownloadModal(true)}
                >
                    <Text style={styles.actionTileEmoji}>📥</Text>
                    <Text style={styles.actionTileLabel}>Save / Print</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionTile, { backgroundColor: '#d97706' }]}
                    onPress={() => setShowCartModal(true)}
                >
                    <Text style={styles.actionTileEmoji}>🛒</Text>
                    <Text style={styles.actionTileLabel}>View Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionTile, { backgroundColor: '#dc2626' }]}
                    onPress={() => navigation.navigate('GiftSuggestions', { occasion: 'newborn' })}
                >
                    <Text style={styles.actionTileEmoji}>🎁</Text>
                    <Text style={styles.actionTileLabel}>Find a Gift</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionTile, { backgroundColor: '#455a64' }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.actionTileEmoji}>←</Text>
                    <Text style={styles.actionTileLabel}>Go Back</Text>
                </TouchableOpacity>
            </View>

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
        backgroundColor: '#f0f0f0',
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
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    cardInner: {
        flex: 1,
        borderWidth: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    photoContainer: {
        flex: 1,
        backgroundColor: '#eee',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 60,
    },
    nameBanner: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    firstName: {
        color: '#ffffff',
        fontWeight: '900',
        letterSpacing: 2,
    },
    lastName: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    teamBar: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 6,
        alignItems: 'center',
    },
    teamText: {
        color: '#666',
    },
    rookieBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        transform: [{ rotate: '15deg' }],
    },
    brandLogo: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
    },
    rookieText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBack: {
        padding: 0,
    },
    backHeader: {
        padding: 12,
        alignItems: 'center',
    },
    backName: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    backPosition: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    statsTable: {
        flex: 1,
        padding: 12,
    },
    statsHeader: {
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
        paddingBottom: 8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statLabel: {
        color: '#666',
        fontSize: 12,
    },
    statValue: {
        color: '#333',
        fontWeight: '600',
        fontSize: 12,
    },
    backFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f5f5f5',
    },
    cardNumber: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
    },
    brand: {
        fontSize: 10,
        color: '#999',
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
        backgroundColor: '#2e8b57',
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
        borderColor: '#1a472a',
    },
    orderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    orderButtonTextSecondary: {
        color: '#1a472a',
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
    actionTileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    actionTile: {
        width: '47%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 90,
    },
    actionTileEmoji: {
        fontSize: 32,
        marginBottom: 6,
        color: '#fff',
    },
    actionTileLabel: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
