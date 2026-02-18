import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import CelebrationOverlay from '../../components/CelebrationOverlay';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import LetterToBaby from '../../components/LetterToBaby';
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
    const insets = useSafeAreaInsets();
    const [viewMode, setViewMode] = useState<'front' | 'back' | 'natal' | 'guide' | 'letter'>('front');
    const [showCelebration, setShowCelebration] = useState(true);

    // ViewShot refs for capturing
    const frontRef = useRef<ViewShot | null>(null);
    const backRef = useRef<ViewShot | null>(null);
    const natalRef = useRef<ViewShot | null>(null);
    const natalBackRef = useRef<ViewShot | null>(null);
    const letterRef = useRef<ViewShot | null>(null);

    // Download modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    // Cart functionality
    const { addToCart, getItemCount } = useCart();
    const [showCartModal, setShowCartModal] = useState(false);

    // Add current view to cart
    const handleAddToCart = () => {
        const productKey = (viewMode === 'guide' ? 'natal' : viewMode) as 'front' | 'back' | 'natal';
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
        { id: 'letter', label: 'Letter to Baby', category: 'yardsign' },
    ];

    // Capture a single view by ref
    const captureView = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'front') ref = frontRef;
            if (itemId === 'back') ref = backRef;
            if (itemId === 'natal') ref = natalRef;
            if (itemId === 'natalback') ref = natalBackRef;
            if (itemId === 'letter') ref = letterRef;

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
            if (itemId === 'natal') {
                setViewMode('natal');
            } else if (itemId === 'natalback') {
                setViewMode('guide');
            } else if (itemId === 'letter') {
                setViewMode('letter');
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
    const isZoomedIn = useRef(false); // Track zoom state for double-tap toggle
    const [scrollEnabled, setScrollEnabled] = useState(true);

    // Detect device type for responsive scaling
    const isTablet = Math.min(screenWidth, screenHeight) >= 768;
    const isDesktop = Platform.OS === 'web' && screenWidth >= 1024;
    const deviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone';

    // Calculate what scale makes the image FILL THE SCREEN (this is 100%)
    const calculateFullScreenScale = () => {
        const availableWidth = screenWidth;
        const availableHeight = screenHeight - 120; // Space for buttons and padding

        if (viewMode === 'guide') {
            // Guide is portrait layout
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
        baseScale.setValue(1);
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
            baseScale.setValue(lastScale.current);
            scale.setValue(1);
            isZoomedIn.current = lastScale.current > 1.1;
            setZoomScale(lastScale.current);
            setScrollEnabled(lastScale.current <= 1.05);
        }
    };

    // Pan gesture handler - allow panning at any zoom level
    const onPanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
    );

    const onPanHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            let newTranslateX = lastTranslateX.current + event.nativeEvent.translationX;
            let newTranslateY = lastTranslateY.current + event.nativeEvent.translationY;

            lastTranslateX.current = newTranslateX;
            lastTranslateY.current = newTranslateY;

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
        baseScale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        baseTranslateX.setValue(0);
        baseTranslateY.setValue(0);
        setScrollEnabled(true);
    };

    // Initialize at 100% of full screen whenever view changes
    useEffect(() => {
        lastScale.current = 1.0;
        setZoomScale(1.0);
        isZoomedIn.current = false;
        scale.setValue(1);
        baseScale.setValue(1);
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
            baseScale.setValue(targetZoom);
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
            setScrollEnabled(targetZoom <= 1.05);
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
            // Natal Chart front only
            const babyName = `${formData.babyFirst} ${formData.babyMiddle ? formData.babyMiddle + ' ' : ''}${formData.babyLast}`.trim() || params.personName || 'Baby';
            return (
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
            );
        } else if (viewMode === 'guide') {
            // Chart Reading Guide back only
            const babyName = `${formData.babyFirst} ${formData.babyMiddle ? formData.babyMiddle + ' ' : ''}${formData.babyLast}`.trim() || params.personName || 'Baby';
            return (
                <ViewShot ref={natalBackRef} options={{ format: 'png', quality: 1 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <NatalChartBack
                            theme={formData.theme}
                            babyName={babyName}
                            zodiacSign={zodiac}
                            previewScale={finalScale}
                        />
                    </View>
                </ViewShot>
            );
        } else if (viewMode === 'letter') {
            // Letter to Baby — standalone keepsake page
            const babyName = babies[0]?.first || params.personName || 'Baby';
            return (
                <ViewShot ref={letterRef} options={{ format: 'png', quality: 1 }}>
                    <View style={styles.announcementContainer}>
                        <LetterToBaby
                            theme={formData.theme}
                            babyName={babyName}
                            dobISO={dobISO}
                            motherName={formData.motherName}
                            fatherName={formData.fatherName}
                            motherLetter={params.motherLetter}
                            fatherLetter={params.fatherLetter}
                            jointLetter={params.jointLetter}
                            previewScale={finalScale}
                        />
                    </View>
                </ViewShot>
            );
        }
    };

    // Determine occasion type from message or mode for dynamic headers
    const occasionType = (() => {
        if (params.mode !== 'milestone') return 'baby';
        const msg = (params.message || '').toLowerCase();
        if (msg.includes('graduation')) return 'graduation';
        if (msg.includes('anniversary')) return 'anniversary';
        if (msg.includes('birthday')) return 'birthday';
        return 'milestone';
    })();

    const occasionLabels = {
        baby: { front: '📜 Birth Announcement', capsule: '⏳ Time Capsule', letter: '💌 Letter to Baby', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
        birthday: { front: '🎂 Birthday Celebration', capsule: '⏳ Time Capsule', letter: '💌 Birthday Letter', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
        graduation: { front: '🎓 Graduation Celebration', capsule: '⏳ Time Capsule', letter: '💌 Graduation Letter', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
        anniversary: { front: '💍 Anniversary Celebration', capsule: '⏳ Time Capsule', letter: '💌 Anniversary Letter', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
        milestone: { front: '🎉 Milestone Celebration', capsule: '⏳ Time Capsule', letter: '💌 Personal Letter', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
    };
    const labels = occasionLabels[occasionType];

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
            <ScrollView style={{ flex: 1, paddingTop: 40 }} contentContainerStyle={{ flexGrow: 1 }} bounces={false} scrollEnabled={scrollEnabled}>
                {/* ═══ PREMIUM CONTROL PANEL ═══ */}
                <LinearGradient colors={['#1a472a', '#2d6b3f']} style={styles.controlPanel}>
                    {/* Dynamic Title */}
                    <Text style={styles.panelTitle}>
                        {viewMode === 'front' ? labels.front : viewMode === 'back' ? labels.capsule : viewMode === 'letter' ? labels.letter : viewMode === 'natal' ? labels.chart : labels.guide}
                    </Text>
                    <Text style={styles.panelSubtitle}>
                        {viewMode === 'guide' ? '8.5" × 11" Portrait' : '11" × 8.5" Landscape'}
                    </Text>

                    {/* View toggle tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#2e8b57' }, viewMode === 'front' && styles.tabActive]}
                            onPress={() => { setViewMode('front'); resetView(); }}
                        >
                            <Text style={styles.tabIcon}>+1</Text>
                            <Text style={styles.tabText}>Sign</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#2563eb' }, viewMode === 'back' && styles.tabActive]}
                            onPress={() => { setViewMode('back'); resetView(); }}
                        >
                            <Text style={styles.tabIcon}>🕐</Text>
                            <Text style={styles.tabText}>Capsule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#7c3aed' }, viewMode === 'natal' && styles.tabActive]}
                            onPress={() => { setViewMode('natal'); resetView(); }}
                        >
                            <Text style={styles.tabIcon}>✨</Text>
                            <Text style={styles.tabText}>Chart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#6366f1' }, viewMode === 'guide' && styles.tabActive]}
                            onPress={() => { setViewMode('guide'); resetView(); }}
                        >
                            <Text style={styles.tabIcon}>📖</Text>
                            <Text style={styles.tabText}>Guide</Text>
                        </TouchableOpacity>
                        {(params.motherLetter || params.fatherLetter || params.jointLetter) && (
                            <TouchableOpacity
                                style={[styles.tab, { backgroundColor: '#dc2626' }, viewMode === 'letter' && styles.tabActive]}
                                onPress={() => { setViewMode('letter'); resetView(); }}
                            >
                                <Text style={styles.tabIcon}>💌</Text>
                                <Text style={styles.tabText}>Letter</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Add-on keepsakes */}
                    <View style={styles.addOnDivider} />
                    <Text style={styles.addOnLabel}>ALSO INCLUDED WITH YOUR +1</Text>
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#d97706' }]}
                            onPress={() => {
                                const resolvedPhoto = params.photoUris?.find(u => u) || params.babies?.[0]?.photoUri || params.photoUri || null;
                                navigation.navigate('YardSignPreview', { ...params, photoUri: resolvedPhoto });
                            }}
                        >
                            <Text style={styles.tabIcon}>🏡</Text>
                            <Text style={styles.tabText}>Yard Signs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#0ea5e9' }]}
                            onPress={() => {
                                const resolvedPhoto = params.photoUris?.find(u => u) || params.babies?.[0]?.photoUri || params.photoUri || null;
                                navigation.navigate('PostcardPreview', { ...params, photoUri: resolvedPhoto });
                            }}
                        >
                            <Text style={styles.tabIcon}>✉️</Text>
                            <Text style={styles.tabText}>Postcards</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#dc2626' }]}
                            onPress={() => {
                                const resolvedPhoto = params.photoUris?.find(u => u) || params.babies?.[0]?.photoUri || params.photoUri || null;
                                navigation.navigate('BaseballCardPreview', { ...params, photoUri: resolvedPhoto });
                            }}
                        >
                            <Text style={styles.tabIcon}>⚾</Text>
                            <Text style={styles.tabText}>Cards</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Birth announcement preview with gesture handling */}
                <GestureHandlerRootView style={[styles.previewContainer, { height: viewMode === 'guide' ? screenHeight * 0.65 : screenHeight * 0.5 }]}>
                    <TapGestureHandler
                        ref={doubleTapRef}
                        onHandlerStateChange={onDoubleTap}
                        numberOfTaps={2}
                    >
                        <Animated.View style={{ flex: 1 }}>
                            <PanGestureHandler
                                ref={panRef}
                                onGestureEvent={onPanGestureEvent}
                                onHandlerStateChange={onPanHandlerStateChange}
                                waitFor={doubleTapRef}
                                simultaneousHandlers={pinchRef}
                                minPointers={1}
                                maxPointers={1}
                            >
                                <Animated.View style={{ flex: 1 }}>
                                    <PinchGestureHandler
                                        ref={pinchRef}
                                        onGestureEvent={onPinchGestureEvent}
                                        onHandlerStateChange={onPinchHandlerStateChange}
                                    >
                                        <Animated.View
                                            style={[
                                                styles.gestureContainer,
                                                {
                                                    transform: [
                                                        { scale: Animated.multiply(baseScale, scale) },
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

                {/* Bottom action bar - Tile buttons */}
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
                    <View style={styles.bottomBarRow}>
                        <TouchableOpacity style={[styles.tileButton, { backgroundColor: '#6b7280' }]} onPress={() => navigation.goBack()}>
                            <Text style={styles.tileEmoji}>←</Text>
                            <Text style={styles.tileLabel}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tileButton, { backgroundColor: '#2563eb' }]}
                            onPress={() => setShowDownloadModal(true)}
                        >
                            <Text style={styles.tileEmoji}>📥</Text>
                            <Text style={styles.tileLabel}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tileButton, { backgroundColor: '#2e8b57' }]}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.tileEmoji}>🛒</Text>
                            <Text style={styles.tileLabel}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tileButton, { backgroundColor: '#d97706' }]}
                            onPress={() => setShowCartModal(true)}
                        >
                            <Text style={styles.tileEmoji}>🧾</Text>
                            <Text style={styles.tileLabel}>Cart{getItemCount() > 0 ? ` (${getItemCount()})` : ''}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tileButton, { backgroundColor: '#dc2626' }]}
                            onPress={() => navigation.navigate('GiftSuggestions', { occasion: params.mode === 'milestone' ? 'milestone' : 'newborn' })}
                        >
                            <Text style={styles.tileEmoji}>🎁</Text>
                            <Text style={styles.tileLabel}>Gift</Text>
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
    // ══════ PREMIUM CONTROL PANEL ══════
    controlPanel: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 2,
    },
    panelSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: 0.5,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 3,
        marginBottom: 14,
        gap: 6,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        opacity: 0.75,
    },
    tabActive: {
        opacity: 1,
        borderWidth: 2,
        borderColor: '#fff',
    },
    tabIcon: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 2,
    },
    tabIconActive: {
        color: '#fff',
    },
    tabText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: '800',
    },
    addOnDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginBottom: 10,
    },
    addOnLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1.5,
        textAlign: 'center',
        marginBottom: 6,
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
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    bottomBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
    },
    tileButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tileEmoji: {
        fontSize: 18,
        marginBottom: 2,
    },
    tileLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
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