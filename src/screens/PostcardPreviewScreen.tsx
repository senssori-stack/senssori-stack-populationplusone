import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { db } from '../data/utils/firebase-config';
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

    // Get baby info (fall back to personName for milestone/anniversary mode)
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || '';
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';
    const babyLast = params.babies?.[0]?.last || params.babyLast || '';
    const fullName = [babyFirst, babyMiddle, babyLast].filter(Boolean).join(' ') || params.personName || 'Baby';
    const photoUri = params.babies?.[0]?.photoUris?.find((u: string | null | undefined) => u) || params.babies?.[0]?.photoUri || params.photoUri;
    const photoUris = params.photoUris || params.babies?.[0]?.photoUris?.filter((u: string | null | undefined) => u) as string[] || (photoUri ? [photoUri] : []);
    const motherName = params.motherName || '';
    const fatherName = params.fatherName || '';
    const parents = [motherName, fatherName].filter(Boolean).join(' & ');
    const hometown = params.hometown || '';
    const population = params.population;
    const dobDate = params.dobISO ? new Date(params.dobISO + 'T00:00:00') : new Date();
    const birthDateStr = dobDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const weightLb = params.weightLb || '';
    const weightOz = params.weightOz || '';
    const lengthIn = params.lengthIn || '';
    const weight = weightLb && weightOz ? `${weightLb} lbs ${weightOz} oz` : '';
    const length = lengthIn ? `${lengthIn}"` : '';

    const isWedding = !!params.hidePlusLabel;
    const isBirthday = params.mode === 'milestone' && (params.message || '').toLowerCase().includes('birthday');

    // Determine event type for RSVP
    const eventType = isWedding ? 'wedding' : isBirthday ? 'birthday' : 'baby-shower';
    const hasRSVP = isWedding || isBirthday;

    // Generate a stable event ID for RSVP
    const [eventId] = useState(() => {
        if (!hasRSVP) return '';
        const prefix = isBirthday ? 'bday' : 'wedding';
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    });
    const rsvpUrl = eventId ? `https://populationplusone.com/rsvp/${eventId}` : '';

    // Create event document in Firebase when postcard is generated
    useEffect(() => {
        if (!hasRSVP || !eventId || !db) return;
        const createEventDoc = async () => {
            try {
                if (isWedding) {
                    // Keep backward compat: also write to weddings collection
                    await setDoc(doc(db, 'weddings', eventId), {
                        coupleName: fullName,
                        weddingDate: birthDateStr,
                        hometown,
                        theme,
                        createdAt: serverTimestamp(),
                    });
                }
                await setDoc(doc(db, 'events', eventId), {
                    eventType,
                    honoree: fullName,
                    hostName: parents || '',
                    eventDate: birthDateStr,
                    hometown,
                    theme,
                    createdAt: serverTimestamp(),
                });
            } catch (error) {
                console.error('Error creating event doc:', error);
            }
        };
        createEventDoc();
    }, [hasRSVP, eventId]);

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
        { id: 'postcard-front', label: 'Postcard Front (Side 1)', category: 'postcard' },
        { id: 'postcard-back', label: 'Postcard Back (Side 2 — Invitation)', category: 'postcard' },
    ];

    // Simple capture function for a single view
    const captureView = async (itemId: string): Promise<string | null> => {
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

    // Capture for DownloadModal
    const handleCapture = async (itemId: string): Promise<string | null> => {
        return captureView(itemId);
    };

    // Card dimensions - landscape 6x4 ratio
    const cardWidth = Math.min(width * 0.92, 420);
    const cardHeight = cardWidth * (4 / 6);
    const previewScale = cardWidth / 3300; // Scale from SignFrontLandscape dimensions

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
            <Text style={styles.title}>{isWedding ? '💒 Wedding Invitations' : '💌 Invitation Cards'}</Text>
            <Text style={styles.subtitle}>{isWedding ? 'Share the joy with family & friends!' : 'Mail or share with family & friends!'}</Text>

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
                                                            babyCount={params.babyCount || 1}
                                                            dobISO={params.dobISO}
                                                            hidePlusLabel={params.hidePlusLabel}
                                                            nameGold={params.nameGold}
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
                                                                {isBirthday ? '🎂 You\'re Invited!' : 'You\'re Invited!'}
                                                            </Text>
                                                            <Text style={[styles.inviteSubheader, { fontSize: cardWidth * 0.025 }]}>
                                                                {isWedding ? 'to the wedding celebration of' : isBirthday ? 'to celebrate the birthday of' : 'to celebrate the arrival of'}
                                                            </Text>
                                                            <Text style={[styles.inviteBabyName, { color: params.nameGold ? '#FFD700' : colors.bg, fontSize: cardWidth * 0.04 }, params.nameGold && { textShadowColor: '#B8860B', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                                                                {fullName}
                                                            </Text>

                                                            {/* Stats - Compact */}
                                                            <View style={styles.statsCompact}>
                                                                <Text style={[styles.statLine, { fontSize: cardWidth * 0.022 }]}>
                                                                    {isWedding ? `Date: ${birthDateStr}` : isBirthday ? `Birthday: ${birthDateStr}` : `Born: ${birthDateStr}`}
                                                                </Text>
                                                                {!isWedding && !isBirthday && weight ? (
                                                                    <Text style={[styles.statLine, { fontSize: cardWidth * 0.022 }]}>
                                                                        {weight} • {length}
                                                                    </Text>
                                                                ) : null}
                                                                {isWedding && hometown ? (
                                                                    <Text style={[styles.statLine, { fontSize: cardWidth * 0.022 }]}>
                                                                        {hometown}
                                                                    </Text>
                                                                ) : null}
                                                            </View>

                                                            {/* Party Details */}
                                                            <View style={styles.partyCompact}>
                                                                <View style={styles.detailRowCompact}>
                                                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>{isWedding ? 'Ceremony:' : 'When:'}</Text>
                                                                    <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                                                </View>
                                                                <View style={styles.detailRowCompact}>
                                                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>{isWedding ? 'Reception:' : 'Where:'}</Text>
                                                                    <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                                                </View>
                                                                <View style={styles.detailRowCompact}>
                                                                    <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.02 }]}>RSVP:</Text>
                                                                    {hasRSVP ? (
                                                                        <Text style={[styles.detailLabelCompact, { fontSize: cardWidth * 0.017, color: '#666', flex: 1 }]}>Scan QR →</Text>
                                                                    ) : (
                                                                        <View style={[styles.blankLineCompact, { borderBottomColor: colors.bg }]} />
                                                                    )}
                                                                </View>
                                                            </View>

                                                            {parents && (
                                                                <Text style={[styles.hostedBy, { fontSize: cardWidth * 0.018 }]}>
                                                                    {isWedding ? `Together with their families` : isBirthday ? `Celebrating with ${parents}` : `Hosted by ${parents}`}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {/* VERTICAL DIVIDER LINE (USPS requirement) */}
                                                        <View style={styles.postalDivider} />

                                                        {/* RIGHT SIDE - Address Area (per USPS rules) */}
                                                        <View style={styles.addressHalf}>
                                                            {hasRSVP ? (
                                                                <>
                                                                    {/* QR Code for RSVP */}
                                                                    <View style={styles.qrSection}>
                                                                        <QRCode
                                                                            value={rsvpUrl || 'https://populationplusone.com'}
                                                                            size={cardWidth * 0.18}
                                                                            backgroundColor="#fff"
                                                                            color="#000"
                                                                        />
                                                                        <Text style={[styles.qrLabel, { fontSize: cardWidth * 0.016 }]}>
                                                                            Scan to RSVP
                                                                        </Text>
                                                                    </View>

                                                                    {/* Address Lines */}
                                                                    <View style={styles.addressArea}>
                                                                        <View style={styles.addressLine} />
                                                                        <View style={styles.addressLine} />
                                                                        <View style={styles.addressLine} />
                                                                    </View>

                                                                    {/* Brand watermark */}
                                                                    <Text style={[styles.brandText, { fontSize: cardWidth * 0.016 }]}>
                                                                        PopulationPlusOne.com
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                <>
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
                                                                </>
                                                            )}
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
                {hasRSVP && (
                    <TouchableOpacity
                        style={[styles.actionTile, { backgroundColor: '#7c3aed' }]}
                        onPress={() => navigation.navigate('EventRSVPDashboard' as any, { eventId, eventName: fullName, eventType })}
                    >
                        <Text style={styles.actionTileEmoji}>📋</Text>
                        <Text style={styles.actionTileLabel}>RSVPs</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Share RSVP Link (for text/social sharing) */}
            {hasRSVP && (
                <View style={{ paddingHorizontal: 10, marginBottom: 12 }}>
                    <TouchableOpacity
                        style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                        onPress={() => Share.share({
                            message: `You're invited to ${fullName}'s ${isBirthday ? 'birthday' : isWedding ? 'wedding' : 'celebration'}! RSVP here: ${rsvpUrl}`,
                        })}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>📤 Share RSVP Link via Text / Social</Text>
                    </TouchableOpacity>
                </View>
            )}

            <DownloadModal
                visible={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                items={downloadItems}
                onCapture={handleCapture}
                onPrintPress={() => navigation.navigate('PrintService', params as any)}
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
    qrSection: {
        alignItems: 'center',
        marginBottom: 4,
    },
    qrLabel: {
        color: '#555',
        fontWeight: '700',
        marginTop: 2,
        textAlign: 'center',
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
