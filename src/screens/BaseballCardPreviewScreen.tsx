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
import BaseballCard from '../../components/BaseballCard';
import BaseballCardBack from '../../components/BaseballCardBack';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import TradingCardLogo from '../../components/TradingCardLogo';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { getChineseElement, getChineseZodiac } from '../data/utils/astrology-utils';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { ZODIAC_EMOJIS } from '../data/utils/emoji-links';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getMoonPhase } from '../data/utils/transit-calculator';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

const ZODIAC_SPIRIT_ANIMAL: Record<string, { animal: string; emoji: string }> = {
    Aries: { animal: 'Hawk', emoji: '🦅' },
    Taurus: { animal: 'Bear', emoji: '🐻' },
    Gemini: { animal: 'Dolphin', emoji: '🐬' },
    Cancer: { animal: 'Wolf', emoji: '🐺' },
    Leo: { animal: 'Lion', emoji: '🦁' },
    Virgo: { animal: 'Fox', emoji: '🦊' },
    Libra: { animal: 'Swan', emoji: '🦢' },
    Scorpio: { animal: 'Phoenix', emoji: '🔥' },
    Sagittarius: { animal: 'Horse', emoji: '🐴' },
    Capricorn: { animal: 'Mountain Goat', emoji: '🐐' },
    Aquarius: { animal: 'Owl', emoji: '🦉' },
    Pisces: { animal: 'Seahorse', emoji: '🐡' },
};

const ZODIAC_ELEMENT: Record<string, string> = {
    Aries: 'Fire 🔥', Taurus: 'Earth 🌍', Gemini: 'Air 💨', Cancer: 'Water 💧',
    Leo: 'Fire 🔥', Virgo: 'Earth 🌍', Libra: 'Air 💨', Scorpio: 'Water 💧',
    Sagittarius: 'Fire 🔥', Capricorn: 'Earth 🌍', Aquarius: 'Air 💨', Pisces: 'Water 💧',
};

const TAROT_NAMES: { name: string; symbol: string }[] = [
    { name: 'The Fool', symbol: '🃏' }, { name: 'The Magician', symbol: '🎩' },
    { name: 'The High Priestess', symbol: '🌙' }, { name: 'The Empress', symbol: '👑' },
    { name: 'The Emperor', symbol: '🏛️' }, { name: 'The Hierophant', symbol: '📿' },
    { name: 'The Lovers', symbol: '💕' }, { name: 'The Chariot', symbol: '🏎️' },
    { name: 'Strength', symbol: '🦁' }, { name: 'The Hermit', symbol: '🏔️' },
    { name: 'Wheel of Fortune', symbol: '🎡' }, { name: 'Justice', symbol: '⚖️' },
    { name: 'The Hanged Man', symbol: '🙃' }, { name: 'Death', symbol: '🦋' },
    { name: 'Temperance', symbol: '⚗️' }, { name: 'The Devil', symbol: '⛓️' },
    { name: 'The Tower', symbol: '⚡' }, { name: 'The Star', symbol: '⭐' },
    { name: 'The Moon', symbol: '🌕' }, { name: 'The Sun', symbol: '☀️' },
    { name: 'Judgement', symbol: '📯' }, { name: 'The World', symbol: '🌍' },
];

function getTarotBirthCard(date: Date): { soul: typeof TAROT_NAMES[0]; personality: typeof TAROT_NAMES[0] | null } {
    const dateStr = `${date.getMonth() + 1}${date.getDate()}${date.getFullYear()}`;
    let sum = dateStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    while (sum > 21) {
        sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    const soul = TAROT_NAMES[sum] || TAROT_NAMES[0];
    let p = sum;
    while (p > 9 && p !== 11 && p !== 22) {
        p = p.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    if (p === 22) p = 0;
    const personality = p !== sum ? (TAROT_NAMES[p] || null) : null;
    return { soul, personality };
}

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
    const isMemorial = !!params.isMemorial;

    // Get baby info
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || (isMemorial ? '' : 'Baby');
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';
    const babyLast = params.babies?.[0]?.last || params.babyLast || '';
    const fullName = params.personName || [babyFirst, babyMiddle, babyLast].filter(Boolean).join(' ');
    // Resolve photo from all possible sources (photoUris array from 3-slot picker, babies array, or direct photoUri)
    const photoUri = params.photoUri || params.photoUris?.find((u: string | null) => u) || params.babies?.[0]?.photoUris?.find((u: string | null | undefined) => u) || params.babies?.[0]?.photoUri || null;
    const hometown = params.hometown || 'Hometown, USA';
    const heritage = params.heritage || '';
    const nationality = params.nationality || '';
    const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dobParts = params.dobISO ? params.dobISO.split('-').map(Number) : null;
    const dobYear = dobParts ? dobParts[0] : new Date().getFullYear();
    const dobMonth = dobParts ? dobParts[1] : new Date().getMonth() + 1;
    const dobDay = dobParts ? dobParts[2] : new Date().getDate();
    const dobDate = new Date(dobYear, dobMonth - 1, dobDay);
    const birthDateStr = `${MONTH_SHORT[dobMonth - 1]} ${dobDay}, ${dobYear}`;
    const dobISO = params.dobISO || `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
    const weightLb = params.weightLb || '';
    const weightOz = params.weightOz || '';
    const lengthIn = params.lengthIn || '';

    // Fun stats
    const zodiac = getZodiacFromISO(dobISO);
    const birthstone = birthstoneFromISO(dobISO);
    const birthYear = dobDate.getFullYear();
    const moonPhaseData = getMoonPhase(dobDate);
    const chineseZodiac = getChineseZodiac(birthYear);
    const chineseElement = getChineseElement(birthYear);
    const spiritAnimal = zodiac ? ZODIAC_SPIRIT_ANIMAL[zodiac] : null;
    const westernElement = zodiac ? ZODIAC_ELEMENT[zodiac] : null;
    const lifePathResult = calculateLifePath(dobISO);
    const lifePathNumber = lifePathResult.number.toString();
    const zodiacEmoji = zodiac ? ZODIAC_EMOJIS[zodiac] || '' : '';
    const tarot = getTarotBirthCard(dobDate);

    // Memorial-specific data
    const actualDobParts = params.dateOfBirthOriginal ? params.dateOfBirthOriginal.split('-').map(Number) : [dobYear, dobMonth, dobDay];
    const actualDobStr = `${MONTH_SHORT[actualDobParts[1] - 1]} ${actualDobParts[2]}, ${actualDobParts[0]}`;
    const dodParts = params.dateOfDeath ? params.dateOfDeath.split('-').map(Number) : null;
    const dodStr = dodParts ? `${MONTH_SHORT[dodParts[1] - 1]} ${dodParts[2]}, ${dodParts[0]}` : '';
    const memorialPrayer = params.memorialPrayer || params.jointLetter || '';
    // Parse first name from fullName for memorial display
    const firstNameOnly = fullName.split(' ')[0] || fullName;

    // Memorial card style selector
    const [cardStyle, setCardStyle] = useState<'classic' | 'dove' | 'floral' | 'simple' | 'cross'>(
        params.memorialCardStyle || 'classic'
    );

    const MEMORIAL_STYLES = [
        { id: 'classic' as const, label: '✨ Classic Gold', emoji: '✨' },
        { id: 'dove' as const, label: '🕊️ Dove & Sky', emoji: '🕊️' },
        { id: 'floral' as const, label: '🌿 Floral', emoji: '🌿' },
        { id: 'simple' as const, label: '☁️ Peaceful', emoji: '☁️' },
        { id: 'cross' as const, label: '✝️ Cross', emoji: '✝️' },
    ];

    const theme = params.theme || 'green';
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Baseball card dimensions (2.5x3.5" at preview scale)
    const cardWidth = Math.min(width * 0.65, 280);
    const cardHeight = cardWidth * (3.5 / 2.5);

    // Refs for capturing
    const frontRef = useRef<ViewShot | null>(null);
    const backRef = useRef<ViewShot | null>(null);
    // Offscreen full-size refs for high-res download
    const downloadFrontRef = useRef<ViewShot | null>(null);
    const downloadBackRef = useRef<ViewShot | null>(null);

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
        { id: 'babycard-front', label: isMemorial ? 'Memorial Card Front' : 'Card Front', category: 'babycard' },
        { id: 'babycard-back', label: isMemorial ? 'Memorial Card Back (Prayer)' : 'Card Back (Stats)', category: 'babycard' },
    ];

    // Simple capture function — use offscreen full-size refs for download
    const captureView = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'babycard-front') ref = downloadFrontRef;
            if (itemId === 'babycard-back') ref = downloadBackRef;

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

    // --- Zoom/Pan gesture helpers ---
    function useZoomGesture() {
        const zoomScale = useRef(new Animated.Value(1)).current;
        const baseScale = useRef(new Animated.Value(1)).current;
        const tX = useRef(new Animated.Value(0)).current;
        const tY = useRef(new Animated.Value(0)).current;
        const baseTX = useRef(new Animated.Value(0)).current;
        const baseTY = useRef(new Animated.Value(0)).current;
        const lastScale = useRef(1);
        const lastTX = useRef(0);
        const lastTY = useRef(0);
        const doubleTapRef = useRef(null);
        const pinchRef = useRef(null);
        const panRef = useRef(null);
        const isZoomedIn = useRef(false);

        const onPinchEvent = Animated.event([{ nativeEvent: { scale: zoomScale } }], { useNativeDriver: false });
        const onPinchStateChange = (e: any) => {
            if (e.nativeEvent.oldState === State.ACTIVE) {
                const s = Math.max(0.5, Math.min(4.0, lastScale.current * e.nativeEvent.scale));
                lastScale.current = s;
                baseScale.setValue(s);
                zoomScale.setValue(1);
                updateScroll();
            }
        };
        const onPanEvent = Animated.event([{ nativeEvent: { translationX: tX, translationY: tY } }], { useNativeDriver: false });
        const onPanStateChange = (e: any) => {
            if (e.nativeEvent.oldState === State.ACTIVE) {
                lastTX.current += e.nativeEvent.translationX;
                lastTY.current += e.nativeEvent.translationY;
                baseTX.setValue(lastTX.current);
                baseTY.setValue(lastTY.current);
                tX.setValue(0);
                tY.setValue(0);
            }
        };
        const onDoubleTap = (e: any) => {
            if (e.nativeEvent.state === State.ACTIVE) {
                const target = isZoomedIn.current ? 1.0 : 2.0;
                zoomScale.setValue(1); baseScale.setValue(target);
                tX.setValue(0); tY.setValue(0); baseTX.setValue(0); baseTY.setValue(0);
                lastScale.current = target; lastTX.current = 0; lastTY.current = 0;
                isZoomedIn.current = !isZoomedIn.current;
                updateScroll();
            }
        };
        const reset = () => {
            lastScale.current = 1; lastTX.current = 0; lastTY.current = 0; isZoomedIn.current = false;
            zoomScale.setValue(1); baseScale.setValue(1);
            tX.setValue(0); tY.setValue(0); baseTX.setValue(0); baseTY.setValue(0);
            updateScroll();
        };
        const transform = [
            { scale: Animated.multiply(baseScale, zoomScale) },
            { translateX: Animated.add(baseTX, tX) },
            { translateY: Animated.add(baseTY, tY) },
        ];
        return { doubleTapRef, pinchRef, panRef, onPinchEvent, onPinchStateChange, onPanEvent, onPanStateChange, onDoubleTap, reset, transform, lastScale };
    }

    const [scrollEnabled, setScrollEnabled] = useState(true);
    const updateScroll = () => {
        setScrollEnabled(frontZoom.lastScale.current <= 1.05 && backZoom.lastScale.current <= 1.05);
    };
    const frontZoom = useZoomGesture();
    const backZoom = useZoomGesture();
    const resetAllZoom = () => { frontZoom.reset(); backZoom.reset(); };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
            <Text style={styles.title}>{isMemorial ? '🕊️ Memorial Cards' : '⚾ Trading Cards'}</Text>
            <Text style={styles.subtitle}>{isMemorial ? 'A dignified keepsake to honor their memory' : 'A collectible keepsake!'}</Text>

            {/* Memorial style picker */}
            {isMemorial && (
                <View style={{ width: '100%', marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 }}>Choose a style:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}>
                        {MEMORIAL_STYLES.map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setCardStyle(s.id)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: cardStyle === s.id ? '#333' : '#e8e8e8',
                                    borderWidth: cardStyle === s.id ? 2 : 1,
                                    borderColor: cardStyle === s.id ? '#FFD700' : '#ccc',
                                }}
                            >
                                <Text style={{ fontSize: 13, color: cardStyle === s.id ? '#fff' : '#333', fontWeight: cardStyle === s.id ? '700' : '400' }}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Zoomable card area */}
            <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity onPress={resetAllZoom} style={{ alignSelf: 'flex-end', marginBottom: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#ddd', borderRadius: 8 }}>
                    <Text style={{ fontSize: 13, color: '#333' }}>Reset Zoom</Text>
                </TouchableOpacity>

                {/* Card Front — independent zoom */}
                <View style={styles.cardSection}>
                    <Text style={styles.sideLabel}>Front</Text>
                    <GestureHandlerRootView style={{ alignItems: 'center' }}>
                        <TapGestureHandler ref={frontZoom.doubleTapRef} onHandlerStateChange={frontZoom.onDoubleTap} numberOfTaps={2}>
                            <Animated.View>
                                <PanGestureHandler
                                    ref={frontZoom.panRef}
                                    onGestureEvent={frontZoom.onPanEvent}
                                    onHandlerStateChange={frontZoom.onPanStateChange}
                                    waitFor={frontZoom.doubleTapRef}
                                    simultaneousHandlers={frontZoom.pinchRef}
                                    minPointers={1}
                                    maxPointers={1}
                                >
                                    <Animated.View>
                                        <PinchGestureHandler
                                            ref={frontZoom.pinchRef}
                                            onGestureEvent={frontZoom.onPinchEvent}
                                            onHandlerStateChange={frontZoom.onPinchStateChange}
                                        >
                                            <Animated.View style={{ transform: frontZoom.transform }}>
                                                <ViewShot ref={frontRef} options={{ format: 'png', quality: 1 }}>
                                                    {isMemorial ? (
                                                        /* ========== MEMORIAL CARD FRONT ========== */
                                                        <View style={[styles.card, { width: cardWidth, height: cardHeight, overflow: 'hidden' }]}>
                                                            {cardStyle === 'classic' && (
                                                                /* Classic Gold: cream bg, gold ornate corners, Celtic heart */
                                                                <View style={{ flex: 1, backgroundColor: '#FAF3E0', borderWidth: 3, borderColor: '#C5A55A', borderRadius: 10, padding: 2 }}>
                                                                    {/* Ornate corner decorations */}
                                                                    <Text style={{ position: 'absolute', top: 2, left: 4, fontSize: cardWidth * 0.07, color: '#C5A55A' }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', top: 2, right: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleX: -1 }] }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', bottom: 2, left: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleY: -1 }] }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', bottom: 2, right: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleX: -1 }, { scaleY: -1 }] }}>❧</Text>
                                                                    {/* Inner gold border */}
                                                                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#D4AF37', borderRadius: 6, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                                                        {/* Photo */}
                                                                        <View style={{ width: cardWidth * 0.55, height: cardWidth * 0.55, borderWidth: 1, borderColor: '#C5A55A', backgroundColor: '#E8E0D0', marginTop: 8, justifyContent: 'center', alignItems: 'center' }}>
                                                                            {photoUri ? (
                                                                                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                                                            ) : (
                                                                                <Text style={{ fontSize: cardWidth * 0.12, color: '#C5A55A' }}>🕊️</Text>
                                                                            )}
                                                                        </View>
                                                                        {/* Name */}
                                                                        <Text style={{ fontSize: cardWidth * 0.065, fontWeight: '700', color: '#333', marginTop: 10, textAlign: 'center' }}>{fullName}</Text>
                                                                        {/* Dates */}
                                                                        <Text style={{ fontSize: cardWidth * 0.033, color: '#777', marginTop: 4 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                        {/* Celtic heart */}
                                                                        <Text style={{ fontSize: cardWidth * 0.1, color: '#C5A55A', marginTop: 8 }}>♡</Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'dove' && (
                                                                /* Dove & Sky: blue gradient bg, dove imagery */
                                                                <View style={{ flex: 1, backgroundColor: '#B8D4E8', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                                                    {/* Sky gradient overlay */}
                                                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: '#8FB8D8', borderTopLeftRadius: 10, borderTopRightRadius: 10, opacity: 0.5 }} />
                                                                    {/* Dove */}
                                                                    <Text style={{ fontSize: cardWidth * 0.15, marginBottom: 4, zIndex: 1 }}>🕊️</Text>
                                                                    {/* Photo */}
                                                                    <View style={{ width: cardWidth * 0.5, height: cardWidth * 0.5, borderRadius: 8, borderWidth: 2, borderColor: '#fff', backgroundColor: '#d0e4f0', overflow: 'hidden', zIndex: 1 }}>
                                                                        {photoUri ? (
                                                                            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                                                        ) : (
                                                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                <Text style={{ fontSize: cardWidth * 0.1, color: '#8FB8D8' }}>📷</Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    {/* In Loving Memory */}
                                                                    <Text style={{ fontSize: cardWidth * 0.042, fontStyle: 'italic', color: '#2C3E50', marginTop: 10, zIndex: 1 }}>In Loving Memory of</Text>
                                                                    {/* Name */}
                                                                    <Text style={{ fontSize: cardWidth * 0.065, fontWeight: '800', color: '#1a3050', marginTop: 4, textAlign: 'center', zIndex: 1 }}>{fullName}</Text>
                                                                    {/* Dates */}
                                                                    <Text style={{ fontSize: cardWidth * 0.032, color: '#4a6a8a', marginTop: 4, zIndex: 1 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                    {/* Rest In Peace */}
                                                                    <Text style={{ fontSize: cardWidth * 0.038, fontStyle: 'italic', color: '#2C3E50', marginTop: 8, zIndex: 1 }}>Rest In Peace</Text>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'floral' && (
                                                                /* Floral Botanical: white with green leaf accents, elegant script */
                                                                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                                                    {/* Top floral accents */}
                                                                    <View style={{ position: 'absolute', top: 6, right: 6, flexDirection: 'row' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.06, opacity: 0.6 }}>🌿</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.05, opacity: 0.4, marginLeft: -4 }}>🍃</Text>
                                                                    </View>
                                                                    <View style={{ position: 'absolute', bottom: 6, left: 6, flexDirection: 'row' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.05, opacity: 0.4 }}>🍃</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.06, opacity: 0.6, marginLeft: -4 }}>🌿</Text>
                                                                    </View>
                                                                    {/* In Loving Memory */}
                                                                    <Text style={{ fontSize: cardWidth * 0.048, fontStyle: 'italic', color: '#556B2F', marginBottom: 8 }}>In Loving Memory</Text>
                                                                    {/* Photo */}
                                                                    <View style={{ width: cardWidth * 0.52, height: cardWidth * 0.58, borderRadius: 4, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
                                                                        {photoUri ? (
                                                                            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                                                        ) : (
                                                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                <Text style={{ fontSize: cardWidth * 0.1, color: '#bbb' }}>📷</Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    {/* Name */}
                                                                    <Text style={{ fontSize: cardWidth * 0.058, fontWeight: '700', color: '#2E2E2E', marginTop: 10, textAlign: 'center' }}>{fullName.toUpperCase()}</Text>
                                                                    {/* Dates */}
                                                                    <Text style={{ fontSize: cardWidth * 0.032, color: '#888', marginTop: 4 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'simple' && (
                                                                /* Simple/Peaceful: soft gradient, dove, clean layout */
                                                                <View style={{ flex: 1, backgroundColor: '#E8EFF5', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                                                    {/* Subtle doves in background */}
                                                                    <Text style={{ position: 'absolute', top: '15%', right: '8%', fontSize: cardWidth * 0.12, opacity: 0.12 }}>🕊️</Text>
                                                                    <Text style={{ position: 'absolute', bottom: '20%', left: '5%', fontSize: cardWidth * 0.09, opacity: 0.08 }}>🕊️</Text>
                                                                    {/* Photo */}
                                                                    <View style={{ width: cardWidth * 0.48, height: cardWidth * 0.48, borderRadius: cardWidth * 0.24, borderWidth: 3, borderColor: '#fff', backgroundColor: '#dde5ee', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}>
                                                                        {photoUri ? (
                                                                            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                                                        ) : (
                                                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                <Text style={{ fontSize: cardWidth * 0.12, color: '#aabbcc' }}>🕊️</Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                    {/* In Loving Memory */}
                                                                    <Text style={{ fontSize: cardWidth * 0.042, fontStyle: 'italic', color: '#5a6a7a', marginTop: 12 }}>In Loving Memory of</Text>
                                                                    {/* Name */}
                                                                    <Text style={{ fontSize: cardWidth * 0.06, fontWeight: '800', color: '#1C2833', marginTop: 4, textAlign: 'center' }}>{fullName}</Text>
                                                                    {/* Dates */}
                                                                    <Text style={{ fontSize: cardWidth * 0.032, color: '#6a7a8a', marginTop: 6 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                    {/* Rest In Peace */}
                                                                    <Text style={{ fontSize: cardWidth * 0.036, fontStyle: 'italic', color: '#5a6a7a', marginTop: 10 }}>Rest In Peace</Text>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'cross' && (
                                                                /* Cross & Border: gold vine border, cross with dove at top */
                                                                <View style={{ flex: 1, backgroundColor: '#FFF9F0', borderWidth: 2, borderColor: '#C5A55A', borderRadius: 10, padding: 4 }}>
                                                                    {/* Decorative vine border */}
                                                                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#D4B96A', borderRadius: 6, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                                                        {/* Corner vines */}
                                                                        <Text style={{ position: 'absolute', top: 0, left: 2, fontSize: cardWidth * 0.055, color: '#C5A55A' }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', top: 0, right: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleX: -1 }] }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', bottom: 0, left: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleY: -1 }] }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', bottom: 0, right: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleX: -1 }, { scaleY: -1 }] }}>❦</Text>
                                                                        {/* Cross */}
                                                                        <Text style={{ fontSize: cardWidth * 0.12, color: '#8B7D3C', marginBottom: 4 }}>✝️</Text>
                                                                        {/* Photo */}
                                                                        <View style={{ width: cardWidth * 0.5, height: cardWidth * 0.5, borderWidth: 2, borderColor: '#D4B96A', backgroundColor: '#F0EBE0', overflow: 'hidden' }}>
                                                                            {photoUri ? (
                                                                                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                                                            ) : (
                                                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                    <Text style={{ fontSize: cardWidth * 0.1, color: '#C5A55A' }}>📷</Text>
                                                                                </View>
                                                                            )}
                                                                        </View>
                                                                        {/* Name */}
                                                                        <Text style={{ fontSize: cardWidth * 0.06, fontWeight: '700', color: '#3D3424', marginTop: 8, textAlign: 'center' }}>{fullName}</Text>
                                                                        {/* Dates */}
                                                                        <Text style={{ fontSize: cardWidth * 0.032, color: '#8B7D5C', marginTop: 4 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                        {/* Rest In Peace */}
                                                                        <Text style={{ fontSize: cardWidth * 0.036, fontStyle: 'italic', color: '#6B5D3C', marginTop: 6 }}>Rest In Peace</Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                        </View>
                                                    ) : (
                                                        /* ========== BABY CARD FRONT ========== */
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
                                                                    <Text style={[styles.firstName, { fontSize: cardWidth * 0.06 }, params.nameGold && { color: '#FFD700', textShadowColor: '#B8860B', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                                                                        {fullName.toUpperCase()}
                                                                    </Text>
                                                                </View>

                                                                {/* Team/Location */}
                                                                <View style={styles.teamBar}>
                                                                    <Text style={[styles.teamText, { fontSize: cardWidth * 0.04 }]}>
                                                                        +1 TEAM {(babyLast || fullName.split(' ').pop() || '').toUpperCase()}
                                                                    </Text>
                                                                </View>

                                                                {/* Rookie badge */}
                                                                <View style={[styles.rookieBadge, { backgroundColor: colors.bg }]}>
                                                                    <Text style={styles.rookieText}>ROOKIE</Text>
                                                                </View>

                                                                {/* Brand logo - top left */}
                                                                <View style={styles.brandLogo}>
                                                                    <TradingCardLogo size={cardWidth * 0.107} bgColor={colors.bg} />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    )}
                                                </ViewShot>
                                            </Animated.View>
                                        </PinchGestureHandler>
                                    </Animated.View>
                                </PanGestureHandler>
                            </Animated.View>
                        </TapGestureHandler>
                    </GestureHandlerRootView>
                </View>

                {/* Card Back — independent zoom */}
                <View style={styles.cardSection}>
                    <Text style={styles.sideLabel}>Back</Text>
                    <GestureHandlerRootView style={{ alignItems: 'center' }}>
                        <TapGestureHandler ref={backZoom.doubleTapRef} onHandlerStateChange={backZoom.onDoubleTap} numberOfTaps={2}>
                            <Animated.View>
                                <PanGestureHandler
                                    ref={backZoom.panRef}
                                    onGestureEvent={backZoom.onPanEvent}
                                    onHandlerStateChange={backZoom.onPanStateChange}
                                    waitFor={backZoom.doubleTapRef}
                                    simultaneousHandlers={backZoom.pinchRef}
                                    minPointers={1}
                                    maxPointers={1}
                                >
                                    <Animated.View>
                                        <PinchGestureHandler
                                            ref={backZoom.pinchRef}
                                            onGestureEvent={backZoom.onPinchEvent}
                                            onHandlerStateChange={backZoom.onPinchStateChange}
                                        >
                                            <Animated.View style={{ transform: backZoom.transform }}>
                                                <ViewShot ref={backRef} options={{ format: 'png', quality: 1 }}>
                                                    {isMemorial ? (
                                                        /* ========== MEMORIAL CARD BACK ========== */
                                                        <View style={[styles.card, { width: cardWidth, height: cardHeight, overflow: 'hidden' }]}>
                                                            {cardStyle === 'classic' && (
                                                                /* Classic Gold back: cream, gold ornate border, prayer */
                                                                <View style={{ flex: 1, backgroundColor: '#FAF3E0', borderWidth: 3, borderColor: '#C5A55A', borderRadius: 10, padding: 2 }}>
                                                                    <Text style={{ position: 'absolute', top: 2, left: 4, fontSize: cardWidth * 0.07, color: '#C5A55A' }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', top: 2, right: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleX: -1 }] }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', bottom: 2, left: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleY: -1 }] }}>❧</Text>
                                                                    <Text style={{ position: 'absolute', bottom: 2, right: 4, fontSize: cardWidth * 0.07, color: '#C5A55A', transform: [{ scaleX: -1 }, { scaleY: -1 }] }}>❧</Text>
                                                                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#D4AF37', borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.08, color: '#C5A55A', marginBottom: 6 }}>♡</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.036, fontStyle: 'italic', color: '#555', textAlign: 'center', lineHeight: cardWidth * 0.058, paddingHorizontal: 4 }}>
                                                                            {memorialPrayer || `Pray for us O dearest ${firstNameOnly},\nTo Jesus Christ our King\nThat he may bless our lonely home\nWhere thou once dwelt therein\nAnd pray that God may give\nus strength\nTo bear our heavy cross;\nFor no one knows but only He\nThe treasure we have lost.`}
                                                                        </Text>
                                                                        <View style={{ marginTop: 10, alignItems: 'center' }}>
                                                                            <Text style={{ fontSize: cardWidth * 0.03, color: '#999' }}>{actualDobStr}  —  {dodStr}</Text>
                                                                            <Text style={{ fontSize: cardWidth * 0.028, color: '#aaa', marginTop: 2 }}>Rest In Peace</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'dove' && (
                                                                /* Dove & Sky back: blue gradient, cross, dove, prayer */
                                                                <View style={{ flex: 1, backgroundColor: '#B8D4E8', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
                                                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', backgroundColor: '#8FB8D8', borderTopLeftRadius: 10, borderTopRightRadius: 10, opacity: 0.4 }} />
                                                                    {/* Dove background */}
                                                                    <Text style={{ position: 'absolute', top: '12%', right: '10%', fontSize: cardWidth * 0.2, opacity: 0.08 }}>🕊️</Text>
                                                                    <Text style={{ position: 'absolute', bottom: '15%', left: '5%', fontSize: cardWidth * 0.15, opacity: 0.06 }}>🕊️</Text>
                                                                    {/* Cross */}
                                                                    <Text style={{ fontSize: cardWidth * 0.1, color: '#5A7A9A', marginBottom: 6, zIndex: 1 }}>✝️</Text>
                                                                    <Text style={{ fontSize: cardWidth * 0.036, fontStyle: 'italic', color: '#2C3E50', textAlign: 'center', lineHeight: cardWidth * 0.058, paddingHorizontal: 4, zIndex: 1 }}>
                                                                        {memorialPrayer || `Along the road of Suffering\nYou found a little lane;\nThat took you up to heaven,\nAnd ended all your pain.\nYou may be out of sight,\nWe may be worlds apart;\nBut you are always\nin our prayers,\nAnd forever in our hearts.`}
                                                                    </Text>
                                                                    <View style={{ marginTop: 10, alignItems: 'center', zIndex: 1 }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.03, color: '#4a6a8a' }}>{actualDobStr}  —  {dodStr}</Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'floral' && (
                                                                /* Floral back: white with leaf accents, prayer */
                                                                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
                                                                    <View style={{ position: 'absolute', top: 6, right: 6, flexDirection: 'row' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.06, opacity: 0.6 }}>🌿</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.05, opacity: 0.4, marginLeft: -4 }}>🍃</Text>
                                                                    </View>
                                                                    <View style={{ position: 'absolute', bottom: 6, left: 6, flexDirection: 'row' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.05, opacity: 0.4 }}>🍃</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.06, opacity: 0.6, marginLeft: -4 }}>🌿</Text>
                                                                    </View>
                                                                    <Text style={{ fontSize: cardWidth * 0.042, fontStyle: 'italic', color: '#556B2F', marginBottom: 8 }}>In Loving Memory</Text>
                                                                    <View style={{ width: '100%', height: 1, backgroundColor: '#D4E0C8', marginBottom: 8 }} />
                                                                    <Text style={{ fontSize: cardWidth * 0.034, fontStyle: 'italic', color: '#444', textAlign: 'center', lineHeight: cardWidth * 0.055, paddingHorizontal: 4 }}>
                                                                        {memorialPrayer || `If my parting has left a void,\nthen fill it with remembered joys.\nA friendship shared, a laugh, a kiss,\nOh yes, these things I too will miss.\n\nBe not burdened with times of sorrow,\nlook for the sunrise of each tomorrow.\nMy life's been full, I've savored much,\ngood friends, good times,\na loved one's touch.`}
                                                                    </Text>
                                                                    <View style={{ width: '100%', height: 1, backgroundColor: '#D4E0C8', marginTop: 8 }} />
                                                                    <View style={{ marginTop: 8, alignItems: 'center' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.048, fontWeight: '600', color: '#333' }}>{fullName}</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.03, color: '#888', marginTop: 2 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'simple' && (
                                                                /* Peaceful back: soft blue-gray, prayer centered */
                                                                <View style={{ flex: 1, backgroundColor: '#E8EFF5', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
                                                                    <Text style={{ position: 'absolute', top: '10%', left: '8%', fontSize: cardWidth * 0.12, opacity: 0.08 }}>🕊️</Text>
                                                                    <Text style={{ position: 'absolute', bottom: '12%', right: '6%', fontSize: cardWidth * 0.1, opacity: 0.06 }}>🕊️</Text>
                                                                    <Text style={{ fontSize: cardWidth * 0.042, fontStyle: 'italic', color: '#5a6a7a', marginBottom: 6 }}>A Prayer for {firstNameOnly}</Text>
                                                                    <View style={{ width: '60%', height: 1, backgroundColor: '#c0ccd8', marginBottom: 8 }} />
                                                                    <Text style={{ fontSize: cardWidth * 0.034, fontStyle: 'italic', color: '#3a4a5a', textAlign: 'center', lineHeight: cardWidth * 0.056, paddingHorizontal: 4 }}>
                                                                        {memorialPrayer || `God looked around his garden\nAnd found an empty place.\nHe then looked down upon the earth\nAnd saw your tired face.\n\nHe put his arms around you\nAnd lifted you to rest.\nGod's garden must be beautiful,\nHe always takes the best.`}
                                                                    </Text>
                                                                    <View style={{ width: '60%', height: 1, backgroundColor: '#c0ccd8', marginTop: 8 }} />
                                                                    <View style={{ marginTop: 8, alignItems: 'center' }}>
                                                                        <Text style={{ fontSize: cardWidth * 0.048, fontWeight: '700', color: '#1C2833' }}>{fullName}</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.03, color: '#6a7a8a', marginTop: 2 }}>{actualDobStr}  —  {dodStr}</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.028, fontStyle: 'italic', color: '#8a9aaa', marginTop: 4 }}>Forever In Our Hearts</Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                            {cardStyle === 'cross' && (
                                                                /* Cross back: gold vine border, cross at top, prayer */
                                                                <View style={{ flex: 1, backgroundColor: '#FFF9F0', borderWidth: 2, borderColor: '#C5A55A', borderRadius: 10, padding: 4 }}>
                                                                    <View style={{ flex: 1, borderWidth: 1, borderColor: '#D4B96A', borderRadius: 6, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
                                                                        <Text style={{ position: 'absolute', top: 0, left: 2, fontSize: cardWidth * 0.055, color: '#C5A55A' }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', top: 0, right: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleX: -1 }] }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', bottom: 0, left: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleY: -1 }] }}>❦</Text>
                                                                        <Text style={{ position: 'absolute', bottom: 0, right: 2, fontSize: cardWidth * 0.055, color: '#C5A55A', transform: [{ scaleX: -1 }, { scaleY: -1 }] }}>❦</Text>
                                                                        {/* Cross with dove */}
                                                                        <Text style={{ fontSize: cardWidth * 0.1, color: '#8B7D3C', marginBottom: 4 }}>✝️</Text>
                                                                        <Text style={{ fontSize: cardWidth * 0.035, fontStyle: 'italic', color: '#4A4030', textAlign: 'center', lineHeight: cardWidth * 0.056, paddingHorizontal: 2 }}>
                                                                            {memorialPrayer || `Pray for us O dearest ${firstNameOnly},\nTo Jesus Christ our King\nThat he may bless our lonely home\nWhere thou once dwelt therein\nAnd pray that God may give\nus strength\nTo bear our heavy cross;\nFor no one knows but only He\nThe treasure we have lost.`}
                                                                        </Text>
                                                                        <View style={{ marginTop: 8, alignItems: 'center' }}>
                                                                            <Text style={{ fontSize: cardWidth * 0.03, color: '#8B7D5C' }}>{actualDobStr}  —  {dodStr}</Text>
                                                                            <Text style={{ fontSize: cardWidth * 0.028, fontStyle: 'italic', color: '#6B5D3C', marginTop: 2 }}>Rest In Peace</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            )}
                                                        </View>
                                                    ) : (
                                                        /* ========== BABY CARD BACK ========== */
                                                        <BaseballCardBack
                                                            fullName={fullName}
                                                            lastName={babyLast}
                                                            dobISO={dobISO}
                                                            weightLb={weightLb}
                                                            weightOz={weightOz}
                                                            lengthIn={lengthIn}
                                                            hometown={hometown}
                                                            heritage={heritage}
                                                            nationality={nationality}
                                                            backgroundColor={colors.bg}
                                                            nameGold={params.nameGold}
                                                            previewWidth={cardWidth}
                                                        />
                                                    )}
                                                </ViewShot>
                                            </Animated.View>
                                        </PinchGestureHandler>
                                    </Animated.View>
                                </PanGestureHandler>
                            </Animated.View>
                        </TapGestureHandler>
                    </GestureHandlerRootView>
                </View>
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
                <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#6b7280' }]} onPress={() => navigation.goBack()}>
                    <Text style={styles.actionTileEmoji}>←</Text>
                    <Text style={styles.actionTileLabel}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#2563eb' }]} onPress={() => setShowDownloadModal(true)}>
                    <Text style={styles.actionTileEmoji}>📥</Text>
                    <Text style={styles.actionTileLabel}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#0000b3' }]} onPress={() => navigation.navigate('PrintService', params as any)}>
                    <Text style={styles.actionTileEmoji}>🖨️</Text>
                    <Text style={styles.actionTileLabel}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#d97706' }]} onPress={() => setShowCartModal(true)}>
                    <Text style={styles.actionTileEmoji}>🧾</Text>
                    <Text style={styles.actionTileLabel}>Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#dc2626' }]} onPress={() => navigation.navigate('SendAsGift', params as any)}>
                    <Text style={styles.actionTileEmoji}>🎁</Text>
                    <Text style={styles.actionTileLabel}>Gift</Text>
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

            {/* Offscreen full-size cards for high-res download */}
            <View style={{ position: 'absolute', left: -9999, top: 0, opacity: 0 }}>
                <ViewShot ref={downloadFrontRef} options={{ format: 'png', quality: 1 }}>
                    <BaseballCard
                        babyName={fullName}
                        birthDate={birthDateStr}
                        birthTime={params.timeOfBirth || ''}
                        weight={weightLb && weightOz ? `${weightLb} lbs ${weightOz} oz` : weightLb ? `${weightLb} lbs` : ''}
                        length={lengthIn || ''}
                        city={hometown.split(',')[0]?.trim() || ''}
                        state={hometown.split(',').slice(1).join(',')?.trim() || ''}
                        zodiacSign={zodiac}
                        birthstone={birthstone}
                        lifePathNumber={lifePathNumber}
                        photoUri={photoUri || undefined}
                        backgroundColor={colors.bg}
                        nameGold={params.nameGold}
                        forceFullSize
                    />
                </ViewShot>
                <ViewShot ref={downloadBackRef} options={{ format: 'png', quality: 1 }}>
                    <BaseballCardBack
                        fullName={fullName}
                        lastName={babyLast}
                        dobISO={dobISO}
                        weightLb={weightLb}
                        weightOz={weightOz}
                        lengthIn={lengthIn}
                        hometown={hometown}
                        heritage={heritage}
                        nationality={nationality}
                        backgroundColor={colors.bg}
                        nameGold={params.nameGold}
                        forceFullSize
                    />
                </ViewShot>
            </View>
        </ScrollView >
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
        color: '#000080',
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
        paddingVertical: 5,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    backName: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    backPosition: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 1,
    },
    statsTable: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statsHeader: {
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 3,
        borderBottomWidth: 1.5,
        borderBottomColor: '#ddd',
        paddingBottom: 2,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2.5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    statLabel: {
        color: '#666',
        fontSize: 9,
    },
    statValue: {
        color: '#333',
        fontWeight: '600',
        fontSize: 9,
        flexShrink: 1,
        textAlign: 'right',
    },
    backFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 6,
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
        backgroundColor: '#000080',
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
        backgroundColor: '#0000b3',
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
        backgroundColor: '#000080',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    orderButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#000080',
    },
    orderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    orderButtonTextSecondary: {
        color: '#000080',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 16,
        gap: 6,
    },
    actionTile: {
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
    actionTileEmoji: {
        fontSize: 18,
        marginBottom: 2,
    },
    actionTileLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});
