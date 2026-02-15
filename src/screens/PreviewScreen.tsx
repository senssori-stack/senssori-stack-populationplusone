import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import CelebrationOverlay from '../../components/CelebrationOverlay';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import NatalChartBack from '../../components/NatalChartBack';
import NatalChartPrintable from '../../components/NatalChartPrintable';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation, route }: Props) {
    const params = route.params || {};
    const [viewMode, setViewMode] = useState<'front' | 'back' | 'natal'>('front');
    const [showCelebration, setShowCelebration] = useState(true);

    // ViewShot refs for capturing
    const frontRef = useRef<ViewShot | null>(null);
    const backRef = useRef<ViewShot | null>(null);
    const natalRef = useRef<ViewShot | null>(null);
    const natalBackRef = useRef<ViewShot | null>(null);

    // Download modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    // Cart functionality
    const { addToCart, getItemCount } = useCart();
    const [showCartModal, setShowCartModal] = useState(false);

    // Add current view to cart
    const handleAddToCart = () => {
        const productKey = viewMode as 'front' | 'back' | 'natal';
        const product = PRODUCT_PRICES[productKey];
        const babyName = params.babies?.[0]?.first || params.babyFirst || params.personName || 'Baby';

        addToCart({
            id: `${productKey}-${Date.now()}`,
            name: product.name,
            description: `For ${babyName}`,
            price: product.price,
            productType: productKey,
        });
    };

    // Download items
    const downloadItems: DownloadItem[] = [
        { id: 'front', label: 'Birth Announcement (Front)', category: 'yardsign' },
        { id: 'back', label: 'Time Capsule (Back)', category: 'yardsign' },
        { id: 'natal', label: 'Natal Chart', category: 'yardsign' },
        { id: 'natalback', label: 'Natal Chart Guide (Back)', category: 'yardsign' },
    ];

    // Capture a single view by ref
    const captureView = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'front') ref = frontRef;
            if (itemId === 'back') ref = backRef;
            if (itemId === 'natal') ref = natalRef;
            if (itemId === 'natalback') ref = natalBackRef;

            if (ref?.current?.capture) {
                return await ref.current.capture();
            }
            return null;
        } catch (error) {
            console.error('Capture error:', error);
            return null;
        }
    };

    // Handle capture — switches viewMode if needed, waits for render, then captures
    const handleCapture = async (itemId: string): Promise<string | null> => {
        try {
            // For natal/natalback, both are rendered in 'natal' view
            if (itemId === 'natal' || itemId === 'natalback') {
                setViewMode('natal');
            } else {
                setViewMode(itemId as 'front' | 'back');
            }
            resetView();
            // Wait for React to re-render and mount the ViewShot
            // (longer delay to ensure complex components like NatalChart are fully rendered)
            await new Promise(r => setTimeout(r, 1200));
            return await captureView(itemId);
        } catch (error) {
            console.error(`Capture error for ${itemId}:`, error);
            return null;
        }
    };

    // Always landscape for this app
    const currentOrientation = 'landscape';

    const [zoomScale, setZoomScale] = useState(1);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    // Gesture handling refs and state
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const baseTranslateX = useRef(new Animated.Value(0)).current;
    const baseTranslateY = useRef(new Animated.Value(0)).current;
    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);
    const doubleTapRef = useRef(null);
    const isZoomedIn = useRef(false); // Track zoom state for double-tap toggle

    // Detect device type for responsive scaling
    const isTablet = Math.min(screenWidth, screenHeight) >= 768;
    const isDesktop = Platform.OS === 'web' && screenWidth >= 1024;
    const deviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone';

    // Calculate what scale makes the image FILL THE SCREEN (this is 100%)
    const calculateFullScreenScale = () => {
        const availableWidth = screenWidth;
        const availableHeight = screenHeight - 120; // Space for buttons and padding

        if (viewMode === 'natal') {
            // Natal view shows both chart (landscape) and guide (portrait) stacked
            // Scale guide to fit roughly half the container width
            const portraitW = 2550, portraitH = 3300;
            const guideWidth = availableWidth * 0.85;
            return guideWidth / portraitW;
        }

        // Birth announcement & natal chart dimensions (all landscape)
        const landscapeW = 3300, landscapeH = 2550;

        // Scale to fit screen without cropping
        const scaleByWidth = availableWidth / landscapeW;
        const scaleByHeight = availableHeight / landscapeH;

        return Math.min(scaleByWidth, scaleByHeight);
    };

    const fullScreenScale = calculateFullScreenScale();
    const finalScale = fullScreenScale * zoomScale;

    // Handle screen rotation - reset to full screen when dimensions change
    useEffect(() => {
        lastScale.current = 1.0;
        setZoomScale(1.0);
        isZoomedIn.current = false;
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
    }, [screenWidth, screenHeight]);

    // Pinch gesture handler - respond in real-time as user pinches
    const onPinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: scale } }],
        { useNativeDriver: false }
    );

    const onPinchHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const newScale = lastScale.current * event.nativeEvent.scale;
            const minScale = 0.3;
            const maxScale = 4.0;

            lastScale.current = Math.max(minScale, Math.min(maxScale, newScale));
            scale.setValue(1);
            setZoomScale(lastScale.current);
        }
    };

    // Pan gesture handler - only allow panning when zoomed in
    const onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
    );

    const onPanHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            if (lastScale.current > 1.1) {
                // Calculate max pan based on current zoom level
                const actualScale = fullScreenScale * lastScale.current;
                // Birth announcement is 3300x2550
                const contentWidth = 3300 * actualScale;
                const contentHeight = 2550 * actualScale;

                const maxX = Math.max(0, (contentWidth - screenWidth) / 2);
                const maxY = Math.max(0, (contentHeight - screenHeight) / 2);

                // Apply pan with bounds
                let newTranslateX = lastTranslateX.current + event.nativeEvent.translationX;
                let newTranslateY = lastTranslateY.current + event.nativeEvent.translationY;

                newTranslateX = Math.max(-maxX, Math.min(maxX, newTranslateX));
                newTranslateY = Math.max(-maxY, Math.min(maxY, newTranslateY));

                lastTranslateX.current = newTranslateX;
                lastTranslateY.current = newTranslateY;
            } else {
                // Not zoomed enough to pan, reset to center
                lastTranslateX.current = 0;
                lastTranslateY.current = 0;
            }

            // Commit the accumulated offset to the base and reset the gesture delta
            baseTranslateX.setValue(lastTranslateX.current);
            baseTranslateY.setValue(lastTranslateY.current);
            translateX.setValue(0);
            translateY.setValue(0);
        }
    };

    // Reset zoom and pan
    const resetView = () => {
        setZoomScale(1.0);
        lastScale.current = 1.0;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        isZoomedIn.current = false;
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
    };

    // Initialize at 100% of full screen whenever view changes
    useEffect(() => {
        lastScale.current = 1.0;
        setZoomScale(1.0);
        isZoomedIn.current = false;
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
    }, [viewMode, fullScreenScale]);

    // Double-tap toggles between 100% and 150%
    const onDoubleTap = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            const targetZoom = isZoomedIn.current ? 1.0 : 1.5;

            // Reset animated values
            scale.setValue(1);
            translateX.setValue(0);
            translateY.setValue(0);
            baseTranslateX.setValue(0);
            baseTranslateY.setValue(0);

            // Update scale and zoom state
            lastScale.current = targetZoom;
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
            isZoomedIn.current = !isZoomedIn.current;
            setZoomScale(targetZoom);
        }
    };

    // Extract data for the components
    const formData = {
        theme: params.theme || 'green',
        // Handle both babies array and individual baby fields
        babyFirst: params.babies?.[0]?.first || params.babyFirst || '',
        babyMiddle: params.babies?.[0]?.middle || params.babyMiddle || '',
        babyLast: params.babies?.[0]?.last || params.babyLast || '',
        motherName: params.motherName || '',
        fatherName: params.fatherName || '',
        hometown: params.hometown || '',
        dobDate: params.dobISO ? new Date(params.dobISO) : new Date(),
        weightLb: params.weightLb || '',
        weightOz: params.weightOz || '',
        lengthIn: params.lengthIn || '',
        // Handle photo from babies array or individual photoUri
        photoUri: params.babies?.[0]?.photoUri || params.photoUri || null,
        snapshot: params.snapshot || {},
        population: params.population || null,
        mode: params.mode || 'baby',
        message: params.message || '',
        // Keep the original babies array if it exists
        babies: params.babies || null,
    };

    const renderCurrentView = () => {
        // Create babies array for components - use existing babies array or create from individual fields
        const babies = formData.babies || [{
            first: formData.babyFirst,
            middle: formData.babyMiddle,
            last: formData.babyLast,
            photoUri: formData.photoUri
        }];

        const dobISO = formData.dobDate.toISOString().split('T')[0];
        const zodiac = getZodiacFromISO(dobISO);
        const birthstone = birthstoneFromISO(dobISO);
        const lifePathResult = calculateLifePath(dobISO);
        const lifePathNumber = lifePathResult.number;

        if (viewMode === 'front') {
            // Collect all photoUris - prioritize params.photoUris for milestone mode
            let allPhotoUris: (string | null | undefined)[] = [];

            if (params.photoUris && params.photoUris.length > 0) {
                // Use photoUris array directly (milestone mode)
                allPhotoUris = params.photoUris.filter(uri => uri);
            } else {
                // Collect from babies array (baby mode)
                allPhotoUris = babies
                    .filter(baby => baby.photoUri)
                    .map(baby => baby.photoUri);
            }
            allPhotoUris = allPhotoUris.slice(0, 3); // Limit to 3 photos

            return (
                <ViewShot ref={frontRef} options={{ format: 'png', quality: 1 }}>
                    <View style={styles.announcementContainer}>
                        <SignFrontLandscape
                            theme={formData.theme}
                            photoUris={allPhotoUris}
                            previewScale={finalScale}
                            hometown={formData.hometown}
                            population={formData.population ?? undefined}
                            personName={params.personName || ''}
                            babyCount={params.babyCount || 1}
                        />
                    </View>
                </ViewShot>
            );
        } else if (viewMode === 'back') {
            // Back view (Time Capsule)
            return (
                <ViewShot ref={backRef} options={{ format: 'png', quality: 1 }}>
                    <View style={styles.announcementContainer}>
                        <TimeCapsuleLandscape
                            theme={formData.theme}
                            babies={babies}
                            dobISO={dobISO}
                            motherName={formData.motherName}
                            fatherName={formData.fatherName}
                            weightLb={formData.weightLb}
                            weightOz={formData.weightOz}
                            lengthIn={formData.lengthIn}
                            hometown={formData.hometown}
                            snapshot={formData.snapshot}
                            zodiac={zodiac}
                            birthstone={birthstone}
                            lifePathNumber={lifePathNumber}
                            previewScale={finalScale}
                            mode={formData.mode}
                            message={formData.message}
                        />
                    </View>
                </ViewShot>
            );
        } else if (viewMode === 'natal') {
            // Natal Chart (front) + Chart Reading Guide (back) — shown together like postcards
            const babyName = `${formData.babyFirst} ${formData.babyMiddle ? formData.babyMiddle + ' ' : ''}${formData.babyLast}`.trim() || params.personName || 'Baby';
            return (
                <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
                    {/* Natal Chart Front */}
                    <Text style={{ color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 }}>Front — Natal Chart (11" × 8.5")</Text>
                    <ViewShot ref={natalRef} options={{ format: 'png', quality: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <NatalChartPrintable
                                theme={formData.theme}
                                babyName={babyName}
                                dobISO={dobISO}
                                hometown={formData.hometown}
                                previewScale={finalScale}
                            />
                        </View>
                    </ViewShot>

                    {/* Chart Reading Guide Back */}
                    <Text style={{ color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 }}>Back — Chart Reading Guide (8.5" × 11")</Text>
                    <ViewShot ref={natalBackRef} options={{ format: 'png', quality: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <NatalChartBack
                                theme={formData.theme}
                                babyName={babyName}
                                previewScale={finalScale}
                            />
                        </View>
                    </ViewShot>
                </View>
            );
        }
    };

    // Determine celebration message based on mode
    const celebrationMessage = params.mode === 'milestone'
        ? '🎉 Your creation is ready!'
        : '🎉 Welcome to the world!';

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <CelebrationOverlay
                visible={showCelebration}
                message={celebrationMessage}
                onComplete={() => setShowCelebration(false)}
            />
            <ScrollView style={{ flex: 1, paddingTop: 40 }} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                {/* Page title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {viewMode === 'front' ? 'Birth Announcement' : viewMode === 'back' ? 'Time Capsule' : 'Natal Chart & Guide'} - {viewMode === 'natal' ? 'Front & Back' : '11" × 8.5"'}
                    </Text>
                </View>

                {/* Control buttons */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.button, viewMode === 'front' && styles.activeButton]}
                        onPress={() => { setViewMode('front'); resetView(); }}
                    >
                        <Text style={[styles.buttonText, viewMode === 'front' && styles.activeButtonText]}>Front</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, viewMode === 'back' && styles.activeButton]}
                        onPress={() => { setViewMode('back'); resetView(); }}
                    >
                        <Text style={[styles.buttonText, viewMode === 'back' && styles.activeButtonText]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, viewMode === 'natal' && styles.activeButton]}
                        onPress={() => { setViewMode('natal'); resetView(); }}
                    >
                        <Text style={[styles.buttonText, viewMode === 'natal' && styles.activeButtonText]}>Natal Chart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button]}
                        onPress={resetView}
                    >
                        <Text style={[styles.buttonText]}>Reset</Text>
                    </TouchableOpacity>
                </View>

                {/* Add-on Product Buttons */}
                <View style={styles.productButtons}>
                    <TouchableOpacity
                        style={styles.productButton}
                        onPress={() => navigation.navigate('YardSignPreview', params)}
                    >
                        <Text style={styles.productButtonText}>🏡 Yard Signs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.productButton}
                        onPress={() => navigation.navigate('PostcardPreview', params)}
                    >
                        <Text style={styles.productButtonText}>💌 Postcards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.productButton}
                        onPress={() => navigation.navigate('BaseballCardPreview', params)}
                    >
                        <Text style={styles.productButtonText}>⚾ Trading Cards</Text>
                    </TouchableOpacity>
                </View>

                {/* Birth announcement preview with gesture handling */}
                <GestureHandlerRootView style={[styles.previewContainer, { height: viewMode === 'natal' ? screenHeight * 0.65 : screenHeight * 0.5 }]}>
                    <TapGestureHandler
                        ref={doubleTapRef}
                        onHandlerStateChange={onDoubleTap}
                        numberOfTaps={2}
                    >
                        <Animated.View style={{ flex: 1 }}>
                            <PanGestureHandler
                                onGestureEvent={onPanGestureEvent}
                                onHandlerStateChange={onPanHandlerStateChange}
                            >
                                <Animated.View style={{ flex: 1 }}>
                                    <PinchGestureHandler
                                        onGestureEvent={onPinchGestureEvent}
                                        onHandlerStateChange={onPinchHandlerStateChange}
                                    >
                                        <Animated.View
                                            style={[
                                                styles.gestureContainer,
                                                {
                                                    transform: [
                                                        { scale: scale },
                                                        { translateX: Animated.add(baseTranslateX, translateX) },
                                                        { translateY: Animated.add(baseTranslateY, translateY) },
                                                    ],
                                                },
                                            ]}
                                        >
                                            {renderCurrentView()}
                                        </Animated.View>
                                    </PinchGestureHandler>
                                </Animated.View>
                            </PanGestureHandler>
                        </Animated.View>
                    </TapGestureHandler>
                </GestureHandlerRootView>

                {/* Bottom action bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarRow}>
                        <TouchableOpacity style={styles.backButtonSmall} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonSmallText}>← Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.downloadButtonSmall}
                            onPress={() => setShowDownloadModal(true)}
                        >
                            <Text style={styles.downloadButtonSmallText}>📥 Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addToCartButtonSmall}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.addToCartButtonSmallText}>🛒 Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.viewCartButtonSmall}
                            onPress={() => setShowCartModal(true)}
                        >
                            <Text style={styles.viewCartButtonSmallText}>
                                🛒 {getItemCount() > 0 ? `(${getItemCount()})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <DownloadModal
                    visible={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                    items={downloadItems}
                    onCapture={handleCapture}
                    babyName={params.babies?.[0]?.first || params.babyFirst || params.personName || 'Baby'}
                />

                <CartModal
                    visible={showCartModal}
                    onClose={() => setShowCartModal(false)}
                />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    controls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    button: {
        backgroundColor: '#1a472a',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    activeButton: {
        backgroundColor: '#f59e0b',
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    activeButtonText: {
        color: '#fff',
    },
    previewContainer: {
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
    },
    gestureContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
    },
    announcementContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    downloadButton: {
        backgroundColor: '#1a472a',
        paddingHorizontal: 24,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: '#1a472a',
        paddingHorizontal: 24,
        paddingVertical: 14,
        margin: 20,
        marginTop: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingHorizontal: 10,
        paddingVertical: 8,
        paddingBottom: 20,
    },
    bottomBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
    },
    backButtonSmall: {
        backgroundColor: '#555',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    backButtonSmallText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    downloadButtonSmall: {
        backgroundColor: '#1a472a',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    downloadButtonSmallText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    addToCartButtonSmall: {
        backgroundColor: '#1a472a',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    addToCartButtonSmallText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    viewCartButtonSmall: {
        backgroundColor: '#f59e0b',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    viewCartButtonSmallText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    pdfButton: {
        backgroundColor: '#ffd700',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 4,
    },
    pdfButtonText: {
        fontSize: 18,
    },
    productButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    productButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    productButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});