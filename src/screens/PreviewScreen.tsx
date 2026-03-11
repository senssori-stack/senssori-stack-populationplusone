import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import BaseballCard from '../../components/BaseballCard';
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
import { COLOR_SCHEMES } from '../data/utils/colors';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getPopulationForCity } from '../data/utils/populations';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation, route }: Props) {
    const params = route.params || {};
    const insets = useSafeAreaInsets();
    const [viewMode, setViewMode] = useState<'front' | 'back' | 'natal' | 'letter'>('front');
    const [showCelebration, setShowCelebration] = useState(true);

    // ⚠️ POPULATION SAFETY NET: If upstream form didn't pass population, fetch it here
    const [fetchedPopulation, setFetchedPopulation] = useState<number | null>(null);
    useEffect(() => {
        if (params.population != null) {
            // Population was provided by the form — use it directly
            setFetchedPopulation(typeof params.population === 'number' ? params.population : null);
            return;
        }
        // Population missing — try to fetch it from hometown + DOB
        if (params.hometown && params.dobISO) {
            console.log('⚠️ PreviewScreen: population missing from params, fetching for', params.hometown);
            getPopulationForCity(params.hometown, params.dobISO)
                .then(pop => {
                    if (pop !== null) {
                        console.log('✅ PreviewScreen: fetched population fallback:', pop);
                        setFetchedPopulation(pop);
                    }
                })
                .catch(err => console.warn('PreviewScreen: population fallback fetch failed:', err));
        }
    }, [params.population, params.hometown, params.dobISO]);

    // Compute zodiac sign for celebration overlay
    const celebrationZodiac = (() => {
        try {
            const dobISO = params.dobISO || new Date().toISOString().split('T')[0];
            return getZodiacFromISO(dobISO);
        } catch { return undefined; }
    })();

    // ViewShot refs for capturing
    const frontRef = useRef<ViewShot | null>(null);
    const backRef = useRef<ViewShot | null>(null);
    const natalRef = useRef<ViewShot | null>(null);
    const natalBackRef = useRef<ViewShot | null>(null);
    const letterRef = useRef<ViewShot | null>(null);

    // Offscreen capture refs for extra keepsakes
    const yardClassicRef = useRef<ViewShot | null>(null);
    const yardWelcomeRef = useRef<ViewShot | null>(null);
    const yardMinimalRef = useRef<ViewShot | null>(null);
    const postcardBackRef = useRef<ViewShot | null>(null);
    const baseballFrontRef = useRef<ViewShot | null>(null);

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

    // Download items — all keepsakes available from one place
    const downloadItems: DownloadItem[] = [
        { id: 'front', label: 'Birth Announcement (Front)', category: 'yardsign' },
        { id: 'back', label: 'Time Capsule (Back)', category: 'yardsign' },
        { id: 'natal', label: 'Natal Chart (Page 1)', category: 'yardsign' },
        { id: 'natalback', label: 'Chart Reading Guide (Page 2)', category: 'yardsign' },
        { id: 'letter', label: 'Letter to Baby', category: 'yardsign' },
        ...(params.mode !== 'milestone' ? [
            { id: 'yard-classic', label: 'Yard Sign — Classic', category: 'yardsign' as const },
            { id: 'yard-welcome', label: 'Yard Sign — Welcome', category: 'yardsign' as const },
            { id: 'yard-minimal', label: 'Yard Sign — Minimal', category: 'yardsign' as const },
        ] : []),
        ...(!params.hidePostcard ? [
            { id: 'postcard-back', label: 'Postcard Back (Invitation)', category: 'postcard' as const },
        ] : []),
        ...(params.mode !== 'milestone' ? [
            { id: 'baseball-front', label: 'Baseball Card (Front)', category: 'babycard' as const },
        ] : []),
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
            if (itemId === 'yard-classic') ref = yardClassicRef;
            if (itemId === 'yard-welcome') ref = yardWelcomeRef;
            if (itemId === 'yard-minimal') ref = yardMinimalRef;
            if (itemId === 'postcard-back') ref = postcardBackRef;
            if (itemId === 'baseball-front') ref = baseballFrontRef;

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
            // Offscreen items don't need viewMode switching — they're always mounted
            const offscreenIds = ['yard-classic', 'yard-welcome', 'yard-minimal', 'postcard-back', 'baseball-front'];
            if (offscreenIds.includes(itemId)) {
                await new Promise(r => setTimeout(r, 600));
                return await captureView(itemId);
            }
            if (itemId === 'natal' || itemId === 'natalback') {
                setViewMode('natal');
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
        heritage: params.heritage || '',
        heritageWithFlags: params.heritageWithFlags || '',
        nationality: params.nationality || '',
        dobDate: params.dobISO ? new Date(params.dobISO + 'T00:00:00') : new Date(),
        weightLb: params.weightLb || '',
        weightOz: params.weightOz || '',
        lengthIn: params.lengthIn || '',
        // Handle photo from babies array or individual photoUri
        photoUri: params.babies?.[0]?.photoUri || params.photoUri || null,
        snapshot: params.snapshot || {},
        population: (() => {
            const pop = fetchedPopulation ?? params.population ?? null;
            console.log('📊 PreviewScreen formData.population:', pop, '| fetchedPopulation:', fetchedPopulation, '| params.population:', params.population);
            return pop;
        })(),
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
            // Collect all photoUris - prioritize params.photoUris array (used for all modes now)
            let allPhotoUris: (string | null | undefined)[] = [];

            if (params.photoUris && params.photoUris.length > 0) {
                // Use photoUris array directly (all modes: single, twins, triplets, milestone)
                allPhotoUris = params.photoUris.filter(uri => uri);
            } else {
                // Fallback: collect from babies array
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
                            population={formData.population != null ? formData.population : undefined}
                            personName={params.personName || ''}
                            babyCount={params.babyCount || 1}
                            dobISO={dobISO}
                            hidePlusLabel={params.hidePlusLabel}
                            isMemorial={params.isMemorial}
                            nameGold={params.nameGold}
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
                            babyName={params.personName || ''}
                            dobISO={dobISO}
                            motherName={formData.motherName}
                            fatherName={formData.fatherName}
                            weightLb={formData.weightLb}
                            weightOz={formData.weightOz}
                            lengthIn={formData.lengthIn}
                            hometown={formData.hometown}
                            heritage={formData.heritage}
                            heritageWithFlags={formData.heritageWithFlags}
                            nationality={formData.nationality}
                            snapshot={formData.snapshot}
                            zodiac={zodiac}
                            birthstone={birthstone}
                            lifePathNumber={lifePathNumber}
                            previewScale={finalScale}
                            mode={formData.mode}
                            message={formData.message}
                            hideThenColumn={!!params.hidePlusLabel}
                            isMemorial={params.isMemorial}
                            dateOfBirthISO={params.dateOfBirthOriginal}
                            dateOfDeathISO={params.dateOfDeath}
                        />
                    </View>
                </ViewShot>
            );
        } else if (viewMode === 'natal') {
            // Natal Chart + Reading Guide — combined two-page document
            const babyName = `${formData.babyFirst} ${formData.babyMiddle ? formData.babyMiddle + ' ' : ''}${formData.babyLast}`.trim() || params.personName || 'Baby';
            return (
                <View style={{ alignItems: 'center' }}>
                    {/* Page 1: Natal Chart */}
                    <ViewShot ref={natalRef} options={{ format: 'png', quality: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <NatalChartPrintable
                                theme={formData.theme}
                                babyName={babyName}
                                dobISO={dobISO}
                                hometown={formData.hometown}
                                previewScale={finalScale}
                                isWedding={!!params.hidePlusLabel}
                            />
                        </View>
                    </ViewShot>

                    {/* Link to Interactive Deep Dive */}
                    <TouchableOpacity
                        style={styles.deepDiveLink}
                        onPress={() => navigation.navigate('FullAstrology', {
                            birthDate: dobISO ? new Date(dobISO + 'T12:00:00').toISOString() : new Date().toISOString(),
                            birthTime: params.timeOfBirth || undefined,
                            birthLocation: formData.hometown || undefined,
                            babyName: babyName || undefined,
                        })}
                    >
                        <Text style={styles.deepDiveLinkIcon}>🔮</Text>
                        <Text style={styles.deepDiveLinkText}>Link to Interactive Natal Chart Deep Dive</Text>
                        <Text style={styles.deepDiveLinkArrow}>→</Text>
                    </TouchableOpacity>

                    {/* Page divider */}
                    <View style={styles.pageDivider}>
                        <View style={styles.pageDividerLine} />
                        <Text style={styles.pageDividerText}>📖 Page 2 — Chart Reading Guide</Text>
                        <View style={styles.pageDividerLine} />
                    </View>

                    {/* Page 2: Chart Reading Guide */}
                    <ViewShot ref={natalBackRef} options={{ format: 'png', quality: 1 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <NatalChartBack
                                theme={formData.theme}
                                babyName={babyName}
                                zodiacSign={zodiac}
                                previewScale={finalScale}
                                isWedding={!!params.hidePlusLabel}
                            />
                        </View>
                    </ViewShot>
                </View>
            );
        } else if (viewMode === 'letter') {
            // Letter to Baby — standalone keepsake page (show all names for twins/triplets)
            const babyName = (() => {
                const names = babies.map(b => (b.first || '').trim()).filter(Boolean);
                if (names.length === 0) return params.personName || 'Baby';
                if (names.length === 1) return names[0];
                if (names.length === 2) return `${names[0]} & ${names[1]}`;
                return `${names[0]}, ${names[1]} & ${names[2]}`;
            })();
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
        if (msg.includes('wedding')) return 'wedding';
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
        wedding: { front: '💒 Wedding Announcement', capsule: '⏳ Time Capsule', letter: '💌 Wedding Letter', chart: '🔮 Wedding Chart', guide: '📖 Wedding Chart Guide' },
        milestone: { front: '🎉 Milestone Celebration', capsule: '⏳ Time Capsule', letter: '💌 Personal Letter', chart: '🔮 Natal Chart', guide: '📖 Chart Reading Guide' },
    };
    const labels = occasionLabels[occasionType];

    // Determine celebration message based on mode
    const celebrationMessage = params.mode === 'milestone'
        ? '🎉 Your creation is ready!'
        : '🎉 Congratulations On Your Creation!';

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <CelebrationOverlay
                visible={showCelebration}
                message={celebrationMessage}
                zodiacSign={celebrationZodiac}
                onComplete={() => setShowCelebration(false)}
            />
            <ScrollView style={{ flex: 1, paddingTop: 40 }} contentContainerStyle={{ flexGrow: 1 }} bounces={false} scrollEnabled={scrollEnabled}>
                {/* ═══ PREMIUM CONTROL PANEL ═══ */}
                <LinearGradient colors={['#000080', '#1a1a9e']} style={styles.controlPanel}>
                    {/* Dynamic Title */}
                    <Text style={styles.panelTitle}>
                        {viewMode === 'front' ? labels.front : viewMode === 'back' ? labels.capsule : viewMode === 'letter' ? labels.letter : `${labels.chart} + ${labels.guide}`}
                    </Text>
                    <Text style={styles.panelSubtitle}>
                        {viewMode === 'natal' ? '2-Page Document • 11" × 8.5" Landscape' : '11" × 8.5" Landscape'}
                    </Text>

                    {/* View toggle tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, { backgroundColor: '#0000b3' }, viewMode === 'front' && styles.tabActive]}
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
                            <Text style={styles.tabText}>Chart + Guide</Text>
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
                        {params.mode !== 'milestone' && (
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
                        )}
                        {!params.hidePostcard && (
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
                        )}
                        {params.mode !== 'milestone' && (
                            <TouchableOpacity
                                style={[styles.tab, { backgroundColor: '#dc2626' }]}
                                onPress={() => {
                                    const resolvedPhoto = params.photoUris?.find(u => u) || params.babies?.[0]?.photoUri || params.photoUri || null;
                                    navigation.navigate('BaseballCardPreview', { ...params, photoUri: resolvedPhoto });
                                }}
                            >
                                <Text style={styles.tabIcon}>{params.isMemorial ? '🕊️' : '⚾'}</Text>
                                <Text style={styles.tabText}>{params.isMemorial ? 'Memorial' : 'Cards'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>

                {/* Birth announcement preview with gesture handling */}
                <GestureHandlerRootView style={[styles.previewContainer, { height: viewMode === 'natal' ? screenHeight * 0.7 : screenHeight * 0.5 }]}>
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
                            style={[styles.tileButton, { backgroundColor: '#0000b3' }]}
                            onPress={() => navigation.navigate('PrintService', params as any)}
                        >
                            <Text style={styles.tileEmoji}>🖨️</Text>
                            <Text style={styles.tileLabel}>Print</Text>
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
                            onPress={() => navigation.navigate('SendAsGift', params as any)}
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
                    babyName={(() => {
                        const names = (params.babies || []).map((b: any) => (b.first || '').trim()).filter(Boolean);
                        if (names.length === 0) return params.babyFirst || params.personName || 'Baby';
                        if (names.length === 1) return names[0];
                        if (names.length === 2) return `${names[0]} & ${names[1]}`;
                        return `${names[0]}, ${names[1]} & ${names[2]}`;
                    })()}
                />

                <CartModal
                    visible={showCartModal}
                    onClose={() => setShowCartModal(false)}
                />

                {/* ═══ OFFSCREEN CAPTURE AREA ═══ */}
                {/* Hidden renderers for yard signs, postcard back, and baseball card */}
                <View style={styles.offscreen}>
                    {(() => {
                        const theme = formData.theme || 'green';
                        const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;
                        const babyFirst = formData.babyFirst || '';
                        const babyMiddle = formData.babyMiddle || '';
                        const babyLast = formData.babyLast || '';
                        const babyName = [babyFirst, babyMiddle].filter(Boolean).join(' ') || params.personName || 'Baby';
                        const fullName = [babyFirst, babyMiddle, babyLast].filter(Boolean).join(' ') || params.personName || 'Baby';
                        const plusLabel = `+${params.babyCount || 1}`;
                        const signWidth = 340;
                        const signHeight = 240;
                        const dobISO = formData.dobDate.toISOString().split('T')[0];
                        const zodiac = getZodiacFromISO(dobISO);
                        const birthstone = birthstoneFromISO(dobISO);
                        const lifePathResult = calculateLifePath(dobISO);
                        const birthDateStr = formData.dobDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const weight = formData.weightLb && formData.weightOz ? `${formData.weightLb} lbs ${formData.weightOz} oz` : '';
                        const length = formData.lengthIn ? `${formData.lengthIn}"` : '';
                        const parents = [formData.motherName, formData.fatherName].filter(Boolean).join(' & ');
                        const photoUri = formData.photoUri;
                        const cardWidth = 280;
                        const cardHeight = cardWidth * 1.4;
                        const isWedding = !!params.hidePlusLabel;

                        return (
                            <>
                                {/* Yard Sign — Classic */}
                                <ViewShot ref={yardClassicRef} options={{ format: 'png', quality: 1 }}>
                                    <View style={{ width: signWidth, height: signHeight, backgroundColor: colors.bg, borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontSize: signWidth * 0.28, fontWeight: '900', color: '#fff' }}>{plusLabel}</Text>
                                            <Text style={{ fontSize: signWidth * 0.09, fontWeight: '900', color: params.nameGold ? '#FFD700' : '#fff', letterSpacing: 2, textAlign: 'center' }}>{babyName.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                </ViewShot>

                                {/* Yard Sign — Welcome */}
                                <ViewShot ref={yardWelcomeRef} options={{ format: 'png', quality: 1 }}>
                                    <View style={{ width: signWidth, height: signHeight, backgroundColor: colors.bg, borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' }}>
                                        <Text style={{ fontSize: signWidth * 0.28, fontWeight: '900', color: '#fff', marginBottom: -10 }}>{plusLabel}</Text>
                                        <Text style={{ fontSize: signWidth * 0.065, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>Welcome To</Text>
                                        <Text style={{ fontSize: signWidth * 0.09, fontWeight: '900', color: params.nameGold ? '#FFD700' : '#fff', letterSpacing: 2, textAlign: 'center' }}>{babyName.toUpperCase()}</Text>
                                    </View>
                                </ViewShot>

                                {/* Yard Sign — Minimal */}
                                <ViewShot ref={yardMinimalRef} options={{ format: 'png', quality: 1 }}>
                                    <View style={{ width: signWidth, height: signHeight, backgroundColor: '#fff', borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.bg }}>
                                        <Text style={{ fontSize: signWidth * 0.28, fontWeight: '900', color: colors.bg }}>{plusLabel}</Text>
                                        <Text style={{ fontSize: signWidth * 0.065, fontWeight: '700', fontStyle: 'italic', color: colors.bg, marginTop: -10, marginBottom: 4 }}>Welcome To</Text>
                                        <Text style={{ fontSize: signWidth * 0.09, fontWeight: '900', color: params.nameGold ? '#FFD700' : colors.bg, letterSpacing: 2, textAlign: 'center' }}>{babyName.toUpperCase()}</Text>
                                    </View>
                                </ViewShot>

                                {/* Postcard Back — Invitation */}
                                <ViewShot ref={postcardBackRef} options={{ format: 'png', quality: 1 }}>
                                    <View style={{ width: cardWidth * 1.3, height: cardWidth * 0.92, backgroundColor: '#fff', borderRadius: 4, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', overflow: 'hidden' }}>
                                        {/* Left — Message */}
                                        <View style={{ flex: 1, padding: 14, justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 15, fontWeight: '900', color: colors.bg, marginBottom: 4 }}>{isWedding ? "You're Invited!" : "You're Invited!"}</Text>
                                            <Text style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{isWedding ? 'to the wedding celebration of' : 'to celebrate the arrival of'}</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: params.nameGold ? '#FFD700' : colors.bg, marginBottom: 6 }}>{fullName}</Text>
                                            <Text style={{ fontSize: 9, color: '#888' }}>{isWedding ? `Date: ${birthDateStr}` : `Born: ${birthDateStr}`}</Text>
                                            {!isWedding && weight ? <Text style={{ fontSize: 9, color: '#888' }}>{weight} • {length}</Text> : null}
                                            <View style={{ marginTop: 8 }}>
                                                <Text style={{ fontSize: 8, color: '#aaa', marginBottom: 2 }}>{isWedding ? 'Ceremony: ________________' : 'When: ________________'}</Text>
                                                <Text style={{ fontSize: 8, color: '#aaa', marginBottom: 2 }}>{isWedding ? 'Reception: ________________' : 'Where: ________________'}</Text>
                                                <Text style={{ fontSize: 8, color: '#aaa' }}>RSVP: ________________</Text>
                                            </View>
                                            {parents ? <Text style={{ fontSize: 8, color: '#999', marginTop: 6 }}>{isWedding ? 'Together with their families' : `Hosted by ${parents}`}</Text> : null}
                                        </View>
                                        {/* Divider */}
                                        <View style={{ width: 1, backgroundColor: '#ccc' }} />
                                        {/* Right — Address */}
                                        <View style={{ flex: 1, padding: 14, justifyContent: 'flex-end' }}>
                                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4, marginBottom: 8 }} />
                                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4, marginBottom: 8 }} />
                                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 }} />
                                        </View>
                                    </View>
                                </ViewShot>

                                {/* Baseball Card Front */}
                                <ViewShot ref={baseballFrontRef} options={{ format: 'png', quality: 1 }}>
                                    <BaseballCard
                                        babyName={fullName}
                                        birthDate={birthDateStr}
                                        birthTime={params.timeOfBirth || ''}
                                        weight={weight}
                                        length={length}
                                        city={formData.hometown.split(',')[0]?.trim() || ''}
                                        state={formData.hometown.split(',').slice(1).join(',')?.trim() || ''}
                                        zodiacSign={zodiac}
                                        birthstone={birthstone}
                                        lifePathNumber={String(lifePathResult.number)}
                                        photoUri={photoUri || undefined}
                                        backgroundColor={colors.bg}
                                        nameGold={params.nameGold}
                                    />
                                </ViewShot>
                            </>
                        );
                    })()}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    offscreen: {
        position: 'absolute',
        left: -9999,
        top: 0,
        opacity: 0,
    },
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
        fontSize: 30,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 2,
    },
    panelSubtitle: {
        fontSize: 18,
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
        fontSize: 27,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 2,
    },
    tabIconActive: {
        color: '#fff',
    },
    tabText: {
        fontSize: 15,
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
        fontSize: 15,
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
    pageDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 20,
        gap: 10,
    },
    pageDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(0,0,128,0.2)',
    },
    pageDividerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000080',
        letterSpacing: 0.5,
    },
    deepDiveLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,128,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,128,0.25)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginVertical: 10,
        gap: 8,
    },
    deepDiveLinkIcon: {
        fontSize: 20,
    },
    deepDiveLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000080',
        flex: 1,
    },
    deepDiveLinkArrow: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000080',
    },
    downloadButton: {
        backgroundColor: '#000080',
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
        backgroundColor: '#000080',
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
        backgroundColor: '#000080',
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