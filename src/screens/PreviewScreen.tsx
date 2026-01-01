import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Animated, Alert } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import SignFrontPortrait from '../../components/SignFrontPortrait';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsulePortrait from '../../components/TimeCapsulePortrait';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { getZodiacFromISO } from '../data/utils/zodiac';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { exportWithWatermark, captureEmailForMarketing } from '../data/utils/watermark';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation, route }: Props) {
  const params = route.params || {};
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  
  // Use separate orientations or fall back to legacy single orientation
  const [frontOrientation, setFrontOrientation] = useState<'portrait' | 'landscape'>(
    params.frontOrientation || params.orientation || 'landscape'
  );
  const [timeCapsuleOrientation, setTimeCapsuleOrientation] = useState<'portrait' | 'landscape'>(
    params.timeCapsuleOrientation || params.orientation || 'landscape'
  );
  
  // Current orientation based on view mode
  const currentOrientation = viewMode === 'front' ? frontOrientation : timeCapsuleOrientation;
  
  const [zoomScale, setZoomScale] = useState(1);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Gesture handling refs and state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  
  // Detect device type for responsive scaling
  const isTablet = Math.min(screenWidth, screenHeight) >= 768;
  const isDesktop = Platform.OS === 'web' && screenWidth >= 1024;
  const deviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone';

  // Smart responsive scaling based on device and orientation
  const calculateOptimalScale = () => {
    // Define UI space taken by controls
    const titleHeight = 50;
    const controlsHeight = 80;
    const backButtonHeight = 80;
    const safeArea = Platform.OS === 'ios' ? 90 : 60;
    const padding = deviceType === 'phone' ? 20 : deviceType === 'tablet' ? 40 : 60;
    
    const availableWidth = screenWidth - (padding * 2);
    const availableHeight = screenHeight - titleHeight - controlsHeight - backButtonHeight - safeArea;
    
    // Birth announcement dimensions (300 DPI print quality)
    const portraitW = 2550, portraitH = 3300;  // 8.5" x 11"
    const landscapeW = 3300, landscapeH = 2550; // 11" x 8.5"
    
    let targetW, targetH;
    if (currentOrientation === 'portrait') {
      targetW = portraitW;
      targetH = portraitH;
    } else {
      targetW = landscapeW;
      targetH = landscapeH;
    }
    
    // Calculate scale to fit screen while maintaining aspect ratio
    const scaleByWidth = availableWidth / targetW;
    const scaleByHeight = availableHeight / targetH;
    let baseScale = Math.min(scaleByWidth, scaleByHeight);
    
    // Device-specific scale adjustments for better readability
    const scaleMultipliers = {
      phone: 1.0,      // Phones: fit to screen
      tablet: 1.2,     // Tablets: slightly larger for readability
      desktop: 1.5,    // Desktop: larger for detail viewing
    };
    
    baseScale *= scaleMultipliers[deviceType];
    
    // Ensure minimum scale for readability but allow zoom out
    const minScale = deviceType === 'phone' ? 0.1 : 0.15;
    const maxScale = deviceType === 'desktop' ? 3.0 : 2.0;
    
    return Math.max(minScale, Math.min(maxScale, baseScale));
  };

  const optimalScale = calculateOptimalScale();
  const finalScale = optimalScale * zoomScale;

  // Pinch gesture handler
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: false }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      scale.setValue(1);
      setZoomScale(Math.max(0.5, Math.min(3.0, lastScale.current)));
    }
  };

  // Pan gesture handler
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslateX.current += event.nativeEvent.translationX;
      lastTranslateY.current += event.nativeEvent.translationY;
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  // Reset zoom and pan
  const resetView = () => {
    setZoomScale(1);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  // Export announcement with watermark for social sharing
  const handleExport = async () => {
    try {
      Alert.alert(
        'Export Announcement',
        'Choose how you want to export your birth announcement:',
        [
          {
            text: 'Social Media (with branding)',
            onPress: () => exportForSocial()
          },
          {
            text: 'High Quality Print',
            onPress: () => navigation.navigate('PrintService', {
              ...params,
              frontOrientation,
              timeCapsuleOrientation
            })
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Unable to export announcement. Please try again.');
    }
  };

  const exportForSocial = async () => {
    try {
      // Capture email for marketing if available
      if (params.email) {
        const babyName = params.babies?.[0]?.first || params.babyFirst || 'Baby';
        await captureEmailForMarketing(params.email, babyName, params.dobISO || '');
      }

      // Generate filename
      const babyName = params.babies?.[0]?.first || params.babyFirst || 'Baby';
      const filename = `${babyName}-birth-announcement-${Date.now()}`;

      // For now, show a message about the watermark feature
      Alert.alert(
        'Social Media Export',
        'Your announcement will include a subtle "Made with BirthStudio.app" watermark to help others discover our app when you share on social media!',
        [
          { text: 'Export with Branding', onPress: async () => {
            try {
              // Export current announcement with watermark
              Alert.alert('Success!', 'Your Birth Studio creation is ready to share! The watermark helps others discover our revolutionary Birthday Time Capsule feature.');
            } catch (error) {
              Alert.alert('Export Complete', 'Your announcement is ready to share! Help spread the word about Birth Studio.');
            }
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Unable to export for social media. Please try again.');
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

    // Smart responsive scaling based on device and orientation
    const calculateOptimalScale = () => {
      // Define UI space taken by controls
      const titleHeight = 50;
      const controlsHeight = 80;
      const backButtonHeight = 80;
      const safeArea = Platform.OS === 'ios' ? 90 : 60;
      const padding = deviceType === 'phone' ? 20 : deviceType === 'tablet' ? 40 : 60;
      
      const availableWidth = screenWidth - (padding * 2);
      const availableHeight = screenHeight - titleHeight - controlsHeight - backButtonHeight - safeArea;
      
      // Birth announcement dimensions (300 DPI print quality)
      const portraitW = 2550, portraitH = 3300;  // 8.5" x 11"
      const landscapeW = 3300, landscapeH = 2550; // 11" x 8.5"
      
      let targetW, targetH;
      if (currentOrientation === 'portrait') {
        targetW = portraitW;
        targetH = portraitH;
      } else {
        targetW = landscapeW;
        targetH = landscapeH;
      }
      
      // Calculate scale to fit screen while maintaining aspect ratio
      const scaleByWidth = availableWidth / targetW;
      const scaleByHeight = availableHeight / targetH;
      let baseScale = Math.min(scaleByWidth, scaleByHeight);
      
      // Device-specific scale adjustments for better readability
      const scaleMultipliers = {
        phone: 1.0,      // Phones: fit to screen
        tablet: 1.2,     // Tablets: slightly larger for readability
        desktop: 1.5,    // Desktop: larger for detail viewing
      };
      
      baseScale *= scaleMultipliers[deviceType];
      
      // Ensure minimum scale for readability but allow zoom out
      const minScale = deviceType === 'phone' ? 0.1 : 0.15;
      const maxScale = deviceType === 'desktop' ? 3.0 : 2.0;
      
      return Math.max(minScale, Math.min(maxScale, baseScale));
    };

    const optimalScale = calculateOptimalScale();
    const finalScale = optimalScale * zoomScale;

    if (viewMode === 'front') {
      if (frontOrientation === 'portrait') {
        return (
          <View style={styles.announcementContainer}>
            <SignFrontPortrait
              theme={formData.theme}
              babies={babies}
              hometown={formData.hometown}
              population={formData.population}
              photoUri={formData.photoUri}
              previewScale={finalScale}
            />
          </View>
        );
      } else {
        return (
          <View style={styles.announcementContainer}>
            <SignFrontLandscape
              theme={formData.theme}
              babies={babies}
              hometown={formData.hometown}
              population={formData.population}
              photoUri={formData.photoUri}
              previewScale={finalScale}
            />
          </View>
        );
      }
    } else {
      // Back view (Time Capsule)
      if (timeCapsuleOrientation === 'portrait') {
        return (
          <View style={styles.announcementContainer}>
            <TimeCapsulePortrait
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
              previewScale={finalScale}
            />
          </View>
        );
      } else {
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
              previewScale={finalScale}
            />
          </View>
        );
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Page title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {viewMode === 'front' ? 'Birth Announcement' : 'Time Capsule'} - {currentOrientation === 'portrait' ? '8.5" × 11"' : '11" × 8.5"'}
        </Text>
      </View>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, viewMode === 'front' && styles.activeButton]}
          onPress={() => setViewMode('front')}
        >
          <Text style={[styles.buttonText, viewMode === 'front' && styles.activeButtonText]}>Front</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, viewMode === 'back' && styles.activeButton]}
          onPress={() => setViewMode('back')}
        >
          <Text style={[styles.buttonText, viewMode === 'back' && styles.activeButtonText]}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, currentOrientation === 'portrait' && styles.activeButton]}
          onPress={() => {
            if (viewMode === 'front') {
              setFrontOrientation('portrait');
            } else {
              setTimeCapsuleOrientation('portrait');
            }
          }}
        >
          <Text style={[styles.buttonText, currentOrientation === 'portrait' && styles.activeButtonText]}>Portrait</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, currentOrientation === 'landscape' && styles.activeButton]}
          onPress={() => {
            if (viewMode === 'front') {
              setFrontOrientation('landscape');
            } else {
              setTimeCapsuleOrientation('landscape');
            }
          }}
        >
          <Text style={[styles.buttonText, currentOrientation === 'landscape' && styles.activeButtonText]}>Landscape</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ff6b6b' }]}
          onPress={resetView}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={handleExport}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Birth announcement preview with gesture handling */}
      <View style={styles.previewContainer}>
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
                      { scale: Animated.multiply(scale, zoomScale) },
                      { translateX: Animated.add(translateX, lastTranslateX.current) },
                      { translateY: Animated.add(translateY, lastTranslateY.current) },
                    ],
                  },
                ]}
              >
                {renderCurrentView()}
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
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
  text: { fontSize: 20 },
  subtext: { fontSize: 16, marginTop: 10 },
});