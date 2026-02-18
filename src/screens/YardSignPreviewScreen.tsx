import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    Animated,
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
import SignFrontLandscape from '../../components/SignFrontLandscape';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { COLOR_SCHEMES } from '../data/utils/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'YardSignPreview'>;

/**
 * YardSignPreviewScreen - Simple, bold yard sign designs
 * 
 * Design Philosophy:
 * - Large +1 as focal point
 * - Baby name prominently displayed
 * - Visible from the road
 * - Multiple style options to choose from
 */
export default function YardSignPreviewScreen({ route, navigation }: Props) {
    const { width } = useWindowDimensions();
    const params = route.params || {};

    // Get baby count (1=single, 2=twins, 3=triplets)
    const babyCount = params.babyCount || 1;
    const plusLabel = `+${babyCount}`;

    // Get baby name(s)
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || params.personName || 'Baby';
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';

    // Build display name: single uses first+middle, twins/triplets uses personName (already "Emma & Olivia" etc.)
    let babyName: string;
    if (babyCount > 1 && params.personName) {
        babyName = params.personName; // Already formatted as "Emma & Olivia" or "Emma, Olivia & Liam"
    } else {
        babyName = [babyFirst, babyMiddle].filter(Boolean).join(' ');
    }
    const theme = params.theme || 'green';
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Extract city/state from hometown
    const hometown = params.hometown || '';
    const [city, state] = hometown.includes(',')
        ? [hometown.split(',')[0].trim(), hometown.split(',').slice(1).join(',').trim()]
        : [hometown, ''];
    const population = params.population || undefined;

    // Collect photoUris same way as PreviewScreen
    const babies = params.babies || [{ first: babyFirst, middle: babyMiddle, photoUri: params.photoUri }];
    let photoUris: (string | null | undefined)[] = [];
    if (params.photoUris && params.photoUris.length > 0) {
        photoUris = params.photoUris.filter(uri => uri);
    } else {
        photoUris = babies.filter(b => b.photoUri).map(b => b.photoUri);
    }
    photoUris = photoUris.slice(0, 3);

    // Preview scale for SignFrontLandscape
    const signFrontPreviewScale = (width * 0.92) / 3300;

    // Refs for capturing
    const signFrontRef = useRef<ViewShot | null>(null);
    const classicRef = useRef<ViewShot | null>(null);
    const welcomeRef = useRef<ViewShot | null>(null);
    const minimalRef = useRef<ViewShot | null>(null);

    // Modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    // Cart
    const { addToCart } = useCart();

    const handleAddToCart = (styleId: string, styleName: string, doubleSided: boolean = false) => {
        const productInfo = PRODUCT_PRICES[styleId as keyof typeof PRODUCT_PRICES];
        const basePrice = productInfo?.price || 0;
        const price = doubleSided ? basePrice * 1.5 : basePrice; // 50% more for double-sided
        const sidedLabel = doubleSided ? 'Double-Sided' : 'Single-Sided';
        const productName = productInfo?.name || `Yard Sign - ${styleName}`;
        addToCart({
            id: `${styleId}-${doubleSided ? '2side' : '1side'}-${babyName}-${Date.now()}`,
            name: `${productName} (${sidedLabel})`,
            description: `${sidedLabel} for ${babyName}`,
            productType: 'yardsign',
            price,
            variant: `${styleName.toLowerCase()}-${doubleSided ? 'double' : 'single'}`,
        });
    };

    // Download items
    const downloadItems: DownloadItem[] = [
        { id: 'yardsign-signfront', label: 'Sign Front (Full)', category: 'yardsign' },
        { id: 'yardsign-classic', label: 'Classic Style', category: 'yardsign' },
        { id: 'yardsign-welcome', label: 'Welcome Style', category: 'yardsign' },
        { id: 'yardsign-minimal', label: 'Minimal Style', category: 'yardsign' },
    ];

    // Capture a single view
    const captureView = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'yardsign-signfront') ref = signFrontRef;
            if (itemId === 'yardsign-classic') ref = classicRef;
            if (itemId === 'yardsign-welcome') ref = welcomeRef;
            if (itemId === 'yardsign-minimal') ref = minimalRef;

            if (ref?.current?.capture) {
                return await ref.current.capture();
            }
            return null;
        } catch (error) {
            console.error('Capture error:', error);
            return null;
        }
    };

    const handleCapture = async (itemId: string): Promise<string | null> => captureView(itemId);

    // Yard sign dimensions (24x18" landscape at preview scale)
    const signWidth = Math.min(width * 0.92, 380);
    const signHeight = signWidth * (18 / 24); // 24x18 landscape ratio

    // Scale factor to shrink SignFront (renders at screen width) into yard sign box
    const signFrontNaturalWidth = width; // SignFront uses useWindowDimensions width
    const signFrontNaturalHeight = signFrontNaturalWidth * (2550 / 3300);
    const signFrontScale = Math.min(signWidth / signFrontNaturalWidth, signHeight / signFrontNaturalHeight);

    // --- Zoom/Pan gesture state ---
    const scale = useRef(new Animated.Value(1)).current;
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

    const { height: screenHeight } = useWindowDimensions();

    const onPinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: scale } }],
        { useNativeDriver: false }
    );

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const newScale = lastScale.current * event.nativeEvent.scale;
            lastScale.current = Math.max(0.5, Math.min(4.0, newScale));
            baseScale.setValue(lastScale.current);
            scale.setValue(1);
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
            scale.setValue(1);
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
        scale.setValue(1);
        baseScale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
        setScrollEnabled(true);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
            <Text style={styles.title}>🏡 Yard Sign Options</Text>
            <Text style={styles.subtitle}>Perfect for the front lawn!</Text>

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
                                                { scale: Animated.multiply(baseScale, scale) },
                                                { translateX: Animated.add(baseTranslateX, translateX) },
                                                { translateY: Animated.add(baseTranslateY, translateY) },
                                            ],
                                        }}>

                                            {/* Option 0: Full Announcement - Same as main preview SignFrontLandscape */}
                                            <View style={styles.optionContainer}>
                                                <Text style={styles.optionLabel}>Style: Full Announcement</Text>
                                                <ViewShot ref={signFrontRef} options={{ format: 'png', quality: 1 }}>
                                                    <SignFrontLandscape
                                                        theme={theme}
                                                        photoUris={photoUris}
                                                        previewScale={signFrontPreviewScale}
                                                        hometown={hometown}
                                                        population={population}
                                                        personName={params.personName || ''}
                                                    />
                                                </ViewShot>
                                                {/* Ground stakes */}
                                                <View style={styles.stakesRow}>
                                                    <View style={styles.stake} />
                                                    <View style={styles.stake} />
                                                </View>
                                            </View>

                                            {/* Option 1: Simple +1 */}}
                                            <View style={styles.optionContainer}>
                                                <Text style={styles.optionLabel}>Style 1: Classic</Text>
                                                <ViewShot ref={classicRef} options={{ format: 'png', quality: 1 }}>
                                                    <View style={[
                                                        styles.yardSign,
                                                        {
                                                            width: signWidth,
                                                            height: signHeight,
                                                            backgroundColor: colors.bg,
                                                        }
                                                    ]}>
                                                        <View style={styles.signBorder}>
                                                            <View style={{ marginTop: -15, alignItems: 'center' }}>
                                                                <Text style={[styles.plusOne, { fontSize: signWidth * 0.28, marginBottom: -10, textAlign: 'center' }]}>
                                                                    {plusLabel}
                                                                </Text>
                                                                <Text style={[styles.babyName, { fontSize: signWidth * 0.09 }]}>
                                                                    {babyName.toUpperCase()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                                {/* Ground stakes */}
                                                <View style={styles.stakesRow}>
                                                    <View style={styles.stake} />
                                                    <View style={styles.stake} />
                                                </View>
                                            </View>

                                            {/* Option 2: Welcome Style */}}
                                            <View style={styles.optionContainer}>
                                                <Text style={styles.optionLabel}>Style 2: Welcome</Text>
                                                <ViewShot ref={welcomeRef} options={{ format: 'png', quality: 1 }}>
                                                    <View style={[
                                                        styles.yardSign,
                                                        {
                                                            width: signWidth,
                                                            height: signHeight,
                                                            backgroundColor: colors.bg,
                                                        }
                                                    ]}>
                                                        <View style={styles.signBorder}>
                                                            <Text style={[styles.plusOne, { fontSize: signWidth * 0.28, marginBottom: 4 }]}>
                                                                {plusLabel}
                                                            </Text>
                                                            <View style={{ marginTop: -20, alignItems: 'center' }}>
                                                                <Text style={[styles.welcomeText, { fontSize: signWidth * 0.078, marginBottom: 4, textAlign: 'center' }]}>
                                                                    Welcome To
                                                                </Text>
                                                                <Text style={[styles.babyName, { fontSize: signWidth * 0.09 }]}>
                                                                    {babyName.toUpperCase()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                                {/* Ground stakes */}
                                                <View style={styles.stakesRow}>
                                                    <View style={styles.stake} />
                                                    <View style={styles.stake} />
                                                </View>
                                            </View>

                                            {/* Option 3: Minimal */}}
                                            <View style={styles.optionContainer}>
                                                <Text style={styles.optionLabel}>Style 3: Minimal</Text>
                                                <ViewShot ref={minimalRef} options={{ format: 'png', quality: 1 }}>
                                                    <View style={[
                                                        styles.yardSign,
                                                        {
                                                            width: signWidth,
                                                            height: signHeight,
                                                            backgroundColor: '#ffffff',
                                                        }
                                                    ]}>
                                                        <View style={[styles.signBorder, { borderColor: colors.bg }]}>
                                                            <Text style={[styles.plusOneOutline, { fontSize: signWidth * 0.28, color: colors.bg, marginBottom: 4 }]}>
                                                                {plusLabel}
                                                            </Text>
                                                            <View style={{ marginTop: -20, alignItems: 'center' }}>
                                                                <Text style={[styles.welcomeText, { fontSize: signWidth * 0.078, marginBottom: 4, textAlign: 'center', color: colors.bg, fontStyle: 'italic' }]}>
                                                                    Welcome To
                                                                </Text>
                                                                <Text style={[styles.babyNameMinimal, { fontSize: signWidth * 0.09, color: colors.bg }]}>
                                                                    {babyName.toUpperCase()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                                {/* Ground stakes */}
                                                <View style={styles.stakesRow}>
                                                    <View style={styles.stake} />
                                                    <View style={styles.stake} />
                                                </View>
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

                <Text style={styles.cartSectionLabel}>Full Announcement</Text>
                <View style={styles.sidedRow}>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-signfront', 'Sign Front', false)}
                    >
                        <Text style={styles.addToCartButtonText}>1-Sided</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-signfront', 'Sign Front', true)}
                    >
                        <Text style={styles.addToCartButtonText}>2-Sided</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.cartSectionLabel}>Classic</Text>
                <View style={styles.sidedRow}>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-classic', 'Classic', false)}
                    >
                        <Text style={styles.addToCartButtonText}>1-Sided</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-classic', 'Classic', true)}
                    >
                        <Text style={styles.addToCartButtonText}>2-Sided</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.cartSectionLabel}>Welcome</Text>
                <View style={styles.sidedRow}>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-welcome', 'Welcome', false)}
                    >
                        <Text style={styles.addToCartButtonText}>1-Sided</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-welcome', 'Welcome', true)}
                    >
                        <Text style={styles.addToCartButtonText}>2-Sided</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.cartSectionLabel}>Minimal</Text>
                <View style={styles.sidedRow}>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-minimal', 'Minimal', false)}
                    >
                        <Text style={styles.addToCartButtonText}>1-Sided</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addToCartButtonHalf}
                        onPress={() => handleAddToCart('yardsign-minimal', 'Minimal', true)}
                    >
                        <Text style={styles.addToCartButtonText}>2-Sided</Text>
                    </TouchableOpacity>
                </View>
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
                babyName={babyName}
            />

            <CartModal
                visible={showCartModal}
                onClose={() => setShowCartModal(false)}
            />
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a472a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    optionContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    stakesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 60,
        marginTop: -2,
    },
    stake: {
        width: 6,
        height: 40,
        backgroundColor: '#888',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    yardSign: {
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
        padding: 8,
    },
    signBorder: {
        flex: 1,
        width: '100%',
        borderWidth: 8,
        borderColor: '#fff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        color: '#ffffff',
        fontFamily: 'serif',
        fontStyle: 'italic',
        marginBottom: 0,
    },
    plusOne: {
        color: '#ffffff',
        fontWeight: '900',
        letterSpacing: -2,
    },
    plusOneOutline: {
        fontWeight: '900',
        letterSpacing: -2,
    },
    nameBanner: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 4,
        marginTop: -4,
    },
    babyName: {
        color: '#ffffff',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    babyNameLarge: {
        color: '#ffffff',
        fontWeight: '700',
        fontFamily: 'serif',
    },
    babyNameMinimal: {
        fontWeight: '600',
        marginTop: 0,
    },
    populationLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        letterSpacing: 4,
        marginBottom: -10,
    },
    divider: {
        width: '60%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginVertical: 16,
    },
    tagline: {
        color: 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
        marginTop: 4,
    },
    downloadButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 16,
    },
    downloadButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
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
    addToCartButtonHalf: {
        backgroundColor: '#2e8b57',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    sidedRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
        width: '100%',
        paddingHorizontal: 20,
    },
    cartSectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
        marginTop: 4,
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
    orderButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
        marginBottom: 12,
    },
    orderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
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
    },
});
