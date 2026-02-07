import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import NatalChartPrintable from '../../components/NatalChartPrintable';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation, route }: Props) {
    const params = route.params || {};
    const [viewMode, setViewMode] = useState<'front' | 'back' | 'natal'>('front');

    // Always landscape for this app
    const currentOrientation = 'landscape';

    const [zoomScale, setZoomScale] = useState(1);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    // Gesture handling refs and state
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
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

        // Birth announcement dimensions
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
    };

    // Initialize at 100% of full screen whenever view changes
    useEffect(() => {
        lastScale.current = 1.0;
        setZoomScale(1.0);
        isZoomedIn.current = false;
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
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
            // Collect all photoUris from babies array
            const allPhotoUris = babies
                .filter(baby => baby.photoUri)
                .map(baby => baby.photoUri)
                .slice(0, 3); // Limit to 3 photos

            return (
                <View style={styles.announcementContainer}>
                    <SignFrontLandscape
                        theme={formData.theme}
                        photoUris={allPhotoUris}
                        previewScale={finalScale}
                        hometown={formData.hometown}
                        population={formData.population}
                        personName={params.personName || ''}
                    />
                </View>
            );
        } else if (viewMode === 'back') {
            // Back view (Time Capsule)
            return (
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
            );
        } else if (viewMode === 'natal') {
            // Natal Chart view
            const babyName = `${formData.babyFirst} ${formData.babyMiddle ? formData.babyMiddle + ' ' : ''}${formData.babyLast}`.trim() || params.personName || 'Baby';
            return (
                <View style={styles.announcementContainer}>
                    <NatalChartPrintable
                        theme={formData.theme}
                        babyName={babyName}
                        dobISO={dobISO}
                        hometown={formData.hometown}
                        previewScale={finalScale}
                    />
                </View>
            );
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Page title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                    {viewMode === 'front' ? 'Birth Announcement' : viewMode === 'back' ? 'Time Capsule' : 'Natal Chart'} - 11" × 8.5"
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

            {/* Birth announcement preview with gesture handling */}
            <View style={styles.previewContainer}>
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
                                                    { translateX: translateX },
                                                    { translateY: translateY },
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
            </View>

            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back to Form</Text>
            </TouchableOpacity>
        </GestureHandlerRootView>
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    button: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        marginVertical: 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    activeButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    activeButtonText: {
        color: '#fff',
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
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
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});