import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ThemeName } from '../src/types';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import SmartPhotoLayout from './SmartPhotoLayout';

// Auto-fit text component to prevent line breaks - Enhanced for better long name handling
function AutoFitText({ text, style, maxWidth }: { text: string; style?: any; maxWidth: number }) {
  const [fontSize, setFontSize] = useState<number>((style && style.fontSize) || 28);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const minSize = 8; // Reduced minimum to handle very long names

  useEffect(() => {
    const initialSize = (style && style.fontSize) ? style.fontSize : 28;
    setFontSize(initialSize);
  }, [text, style]);

  useEffect(() => {
    if (containerWidth && containerWidth > maxWidth && fontSize > minSize) {
      // More aggressive font reduction for very long text
      const reductionStep = text.length > 50 ? 3 : 2;
      setFontSize(prev => Math.max(minSize, prev - reductionStep));
    }
  }, [containerWidth, maxWidth, fontSize, minSize, text.length]);

  // Add text truncation as ultimate fallback for extremely long names
  const displayText = text.length > 100 ? text.substring(0, 97) + '...' : text;

  return (
    <Text
      style={[style, { fontSize }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {displayText}
    </Text>
  );
}

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
export const LANDSCAPE_WIDTH = 3300;
export const LANDSCAPE_HEIGHT = 2550;

type Baby = { first?: string; middle?: string; last?: string; photoUri?: string | null };

type Props = {
  theme?: ThemeName;
  hometown?: string;
  population?: number | null;
  babies?: Baby[];
  babyName?: string;
  photoUri?: string | null;
  previewScale?: number;
};

export default function SignFrontLandscape(props: Props) {
  // ====== GREEN: props destructure and defaults ======
  const {
    theme = 'green' as ThemeName,
    hometown = 'CITY, ST',
    population = null,
    babyName: explicitBabyName,
    babies,
    photoUri = null,
    previewScale = 0.2, // Default scale for preview
  } = props;

  // ====== GREEN: smart baby name logic for multiple babies - separate first names and last name ======
  const getNameParts = (babies: Array<{ first?: string; middle?: string; last?: string }>) => {
    if (!babies || babies.length === 0) return { firstNames: 'BABY NAME', lastName: '' };
    
    // Get all first names
    const firstNames = babies.map(baby => baby.first || '').filter(Boolean);
    // Get the last name from the first baby (assuming all siblings share last name)
    const lastName = babies[0].last || '';
    
    if (firstNames.length === 0) return { firstNames: 'BABY NAME', lastName: '' };
    if (firstNames.length === 1) {
      // Single baby - include middle initial with first name
      const middleInitial = babies[0].middle ? babies[0].middle.charAt(0) + '.' : '';
      const fullFirstName = [firstNames[0], middleInitial].filter(Boolean).join(' ');
      return { firstNames: fullFirstName, lastName };
    }
    
    // Multiple babies - combine first names, separate last name
    if (firstNames.length === 2) {
      return { firstNames: `${firstNames[0]} & ${firstNames[1]}`, lastName };
    } else {
      // 3+ babies - comma separated with & before last
      const allButLast = firstNames.slice(0, -1).join(', ');
      const lastFirst = firstNames[firstNames.length - 1];
      return { firstNames: `${allButLast} & ${lastFirst}`, lastName };
    }
  };

  const nameParts = Array.isArray(babies) && babies.length > 0 
    ? getNameParts(babies)
    : { firstNames: 'BABY NAME', lastName: '' };
    
  // For backwards compatibility and landscape layout, keep compact format
  const babyName = explicitBabyName && explicitBabyName.trim()
    ? explicitBabyName
    : babies && babies.length === 1 
      ? [nameParts.firstNames, nameParts.lastName].filter(Boolean).join(' ')
      : [nameParts.firstNames, nameParts.lastName].filter(Boolean).join(' '); // Landscape keeps compact format

  const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

  // ====== GREEN: calculated dimensions ======
  const displayWidth = LANDSCAPE_WIDTH * previewScale;
  const displayHeight = LANDSCAPE_HEIGHT * previewScale;

  // ====== GREEN: all text reduced by 10% while maintaining relative differences, then 20% more ======
  const baseFontSize = Math.round(displayHeight * 0.0675 * 0.5 * 1.15 * 0.8); // Base calculation * 20% reduction
  const unifiedFontSize = Math.round(baseFontSize * 1.25); // 25% larger for WELCOME TO, POPULATION, number, +1 (reduced from 35%)

  // ====== GREEN: city and baby name reduced by 25% more for twin names, then 20% smaller, then 10% smaller, then 20% more ======
  const citySize = Math.round(baseFontSize * 0.701 * 0.8 * 0.9); // Additional 30% total reduction for readability
  const babyNameFontSize = citySize; // Baby name matches city size exactly

  // ====== Calculate basic layout values first ======
  const borderWidth = Math.round(displayWidth * 0.02);
  const padding = Math.round(displayWidth * 0.005);

  // ====== ADAPTIVE PHOTO SIZING: Calculate available space dynamically ======
  
  // Calculate estimated text heights with proper line spacing
  const welcomeTextHeight = unifiedFontSize * 1.3; // Height + line spacing
  const babyNameHeight = babyNameFontSize * 1.4; // Slightly more space for baby names
  const cityTextHeight = citySize * 1.3;
  const populationTextHeight = unifiedFontSize * 1.3;
  
  // Calculate total text area needed
  const totalTextHeight = welcomeTextHeight + babyNameHeight + cityTextHeight + populationTextHeight;
  
  // Add padding and margins
  const verticalPadding = padding * 2; // Top and bottom padding
  const textMargins = padding * 1.5; // Margins between text elements
  const totalTextAreaWithMargins = totalTextHeight + verticalPadding + textMargins;
  
  // Available space for photo (with safety margin)
  const availablePhotoSpace = (displayHeight * 0.95) - totalTextAreaWithMargins;
  const safetyMargin = displayHeight * 0.05; // 5% safety margin
  const maxPhotoSpace = availablePhotoSpace - safetyMargin;
  
  // Calculate adaptive photo size - ensure it never exceeds available space
  const minPhotoSize = Math.round(displayHeight * 0.15); // Minimum 15% of height
  const maxPhotoSize = Math.round(displayHeight * 0.35); // Maximum 35% of height
  const calculatedPhotoSize = Math.round(maxPhotoSpace * 0.8 * 0.7); // Use 80% of available space, reduced by 30%
  
  // Clamp photo size within reasonable bounds
  const photoSize = Math.max(minPhotoSize, Math.min(maxPhotoSize, calculatedPhotoSize));
  
  console.log('🔍 Layout Debug:', {
    displayHeight,
    totalTextHeight,
    availablePhotoSpace,
    calculatedPhotoSize,
    finalPhotoSize: photoSize,
    babyName: babyName.substring(0, 20) + (babyName.length > 20 ? '...' : ''),
    hometown: hometown.substring(0, 15) + (hometown.length > 15 ? '...' : '')
  });

  // ====== GREEN: resolve photo URI ======
  const resolvedPhotoUri = photoUri ?? (Array.isArray(babies) && babies.length > 0 ? babies[0].photoUri ?? null : null);

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
      {/* White outer border */}
      <View style={[styles.border, { 
        borderWidth, 
        borderColor: '#FFFFFF',
        width: displayWidth * 0.95,
        height: displayHeight * 0.95,
        margin: displayWidth * 0.025,
        borderRadius: Math.round(displayWidth * 0.03)
      }]}>
        {/* Inner content area */}
        <View style={[styles.content, { 
          backgroundColor: colors.bg,
          padding: padding * 0.8,
          borderRadius: Math.round(displayWidth * 0.02),
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start', // GREEN: align content to top
          alignItems: 'center'
        }]}>
          
          {/* WELCOME TO */}
          <Text style={[styles.text, { 
            fontSize: unifiedFontSize, // GREEN: unified font size
            color: '#FFFFFF',
            marginTop: padding * 0.3
          }]}>
            WELCOME TO
          </Text>

          {/* City, State */}
          <AutoFitText 
            text={(hometown || 'CITY, ST').toUpperCase()}
            style={[styles.text, { 
              fontSize: citySize, 
              color: '#FFFFFF',
              fontWeight: '900',
              marginTop: padding * 0.2
            }]}
            maxWidth={displayWidth * 0.85}
          />

          {/* POPULATION label */}
          <Text style={[styles.text, { 
            fontSize: unifiedFontSize, // GREEN: unified font size
            color: '#FFFFFF',
            fontWeight: '800',
            marginTop: padding * 0.1
          }]}>
            POPULATION
          </Text>

          {/* Population Number */}
          <Text style={[styles.text, { 
            fontSize: unifiedFontSize, // GREEN: unified font size
            color: '#FFFFFF',
            fontWeight: '900',
            marginTop: padding * 0.2
          }]}>
            {population == null ? '0' : population.toLocaleString()}
          </Text>

          {/* +1 */}
          <Text style={[styles.text, { 
            fontSize: unifiedFontSize, // GREEN: unified font size
            color: '#FFFFFF',
            fontWeight: '900',
            marginTop: padding * 0.3
          }]}>
            +1
          </Text>

          {/* Baby Name - matching city font size exactly */}
          <AutoFitText 
            text={babyName.toUpperCase()}
            style={[styles.text, { 
              fontSize: citySize, // GREEN: exactly match city size
              color: '#FFFFFF',
              fontWeight: '900',
              marginTop: padding * 0.3
            }]}
            maxWidth={displayWidth * 0.95}
          />

          {/* GREEN: Smart Multi-Photo Layout - Center between baby name and bottom border */}
          <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {/* Only render photos if we have reasonable space */}
            {photoSize >= minPhotoSize && (
              <View style={[styles.photoContainer, { width: photoSize, height: photoSize }]}>
                <SmartPhotoLayout
                  babies={babies}
                  fallbackPhotoUri={resolvedPhotoUri}
                  totalPhotoSize={photoSize}
                  containerWidth={displayWidth * 0.95}
                  containerHeight={displayHeight * 0.95}
                />
              </View>
            )}
            {/* Show warning for extremely long text that breaks layout */}
            {photoSize < minPhotoSize && __DEV__ && (
              <View style={{
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                padding: 8,
                borderRadius: 4,
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>
                  ⚠️ Photo hidden{'\n'}Names too long
                </Text>
              </View>
            )}
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    textAlign: 'center',
    fontWeight: '700',
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    // Image styles applied inline
  },
  photoPlaceholder: {
    backgroundColor: '#EEE',
  },
});