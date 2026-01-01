import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ThemeName } from '../src/types';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import SmartPhotoLayout from './SmartPhotoLayout';

// Auto-fit text component for single-line, presentable text
function AutoFitText({
  text,
  style,
  maxWidth,
  minFontSize = 18,
  maxFontSize = 120,
}: {
  text: string;
  style?: any;
  maxWidth: number;
  minFontSize?: number;
  maxFontSize?: number;
}) {
  const [fontSize, setFontSize] = useState<number>(
    (style && style.fontSize) || maxFontSize
  );
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    setFontSize((style && style.fontSize) || maxFontSize);
  }, [text, style, maxFontSize]);

  useEffect(() => {
    if (
      containerWidth &&
      containerWidth > maxWidth &&
      fontSize > minFontSize
    ) {
      setFontSize((prev) => Math.max(minFontSize, prev - 2));
    }
  }, [containerWidth, maxWidth, fontSize, minFontSize]);

  return (
    <Text
      style={[style, { fontSize }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      numberOfLines={1}
      adjustsFontSizeToFit={false}
      ellipsizeMode="tail"
    >
      {text}
    </Text>
  );
}

export const PORTRAIT_WIDTH = 2550;
export const PORTRAIT_HEIGHT = 3300;

type Baby = {
  first?: string;
  middle?: string;
  last?: string;
  photoUri?: string | null;
};

type Props = {
  theme?: ThemeName;
  hometown?: string;
  population?: number | null;
  babies?: Baby[];
  babyName?: string;
  photoUri?: string | null;
  previewScale?: number;
};

export default function SignFrontPortrait(props: Props) {
  const {
    theme = 'green' as ThemeName,
    hometown = 'CITY, ST',
    population = null,
    babyName: explicitBabyName,
    babies,
    photoUri = null,
    previewScale = 0.2,
  } = props;

  // Smart baby name logic: use middle initial for long names
  // Smart name formatting for multiple babies - separate first names and last name
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
    
  // For backwards compatibility, create combined name for single babies
  const babyName = explicitBabyName && explicitBabyName.trim()
    ? explicitBabyName
    : babies && babies.length === 1 
      ? [nameParts.firstNames, nameParts.lastName].filter(Boolean).join(' ')
      : nameParts.firstNames;

  const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

  const displayWidth = PORTRAIT_WIDTH * previewScale;
  const displayHeight = PORTRAIT_HEIGHT * previewScale;

  // Reduced font scale to allow better spacing and fitting
  const fontScale = 0.8; // Reduced from 0.9 to make base text smaller

  // Base font sizes - ALL FONTS DECREASED BY 10% while maintaining hierarchy
  const baseFont = Math.round(displayWidth * 0.054 * fontScale * 1.17); // Base was 1.30, now 1.17 (10% reduction)
  const unifiedTextSize = Math.round(baseFont * 1.25 * 0.8 * 0.85 * 1.1); // 25% larger then 20% smaller then 15% smaller then 10% larger - WELCOME TO, POPULATION word, number, +1
  // City/State and baby name: 20% larger than population font size then 10% larger, equal to each other
  const cityMaxSize = Math.round(unifiedTextSize * 1.2 * 1.1); // 20% larger than population then 10% more
  const nameMaxSize = Math.round(unifiedTextSize * 1.2 * 1.1); // 20% larger than population then 10% more

  // Photo size - increased for twins by 50% and single babies
  const isMultipleBabies = babies && babies.length > 1;
  const photoSizeMultiplier = isMultipleBabies ? 1.65 : 1.95; // Increased: twins 1.1 -> 1.65 (+50%), singles 1.3 -> 1.95 (+50%)
  const photoSize = Math.round(displayWidth * 0.315 * photoSizeMultiplier);

  const borderWidth = Math.round(displayWidth * 0.015);
  const padding = Math.round(displayWidth * 0.01);

  const oneInch = 300 * previewScale;

  const resolvedPhotoUri =
    photoUri ??
    (Array.isArray(babies) && babies.length > 0
      ? babies[0].photoUri ?? null
      : null);

  const borderInnerHeight = displayHeight * 0.96;
  // Perfect centering between baby last name and bottom white border
  const welcomeToHeight = padding * 2; // WELCOME TO section height
  const mainTextHeight = oneInch * 5.1; // One more tad down from 5.0
  const contentEndY = welcomeToHeight + oneInch + mainTextHeight; // Where content ends
  const remainingSpace = borderInnerHeight - contentEndY; // Space from content end to bottom
  const photoTop = contentEndY + (remainingSpace - photoSize) / 2; // Center photos in remaining space
  const textAreaHeight = borderInnerHeight; // Full height since text area positioning is handled separately

  return (
    <View
      style={[
        styles.container,
        {
          width: displayWidth,
          height: displayHeight,
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View
        style={[
          styles.border,
          {
            borderWidth,
            borderColor: '#FFFFFF',
            width: displayWidth * 0.96,
            height: displayHeight * 0.96,
            margin: displayWidth * 0.02,
            borderRadius: Math.round(displayWidth * 0.03),
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
          },
        ]}
      >
        {/* WELCOME TO - positioned at top separately */}
        <View
          style={{
            position: 'absolute',
            top: padding * 2, // Position at top with small margin
            left: 0,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              styles.text,
              {
                fontSize: unifiedTextSize,
                color: '#FFFFFF',
                fontWeight: '700',
              },
            ]}
          >
            WELCOME TO
          </Text>
        </View>

        {/* Main text area - positioned 1 inch below WELCOME TO */}
        <View
          style={{
            position: 'absolute',
            top: padding * 2 + oneInch, // Start 1 inch below WELCOME TO
            left: 0,
            width: '100%',
            height: textAreaHeight - (padding * 2 + oneInch), // Adjust height accordingly
            justifyContent: 'flex-start', // Start from top instead of center
            alignItems: 'center',
            paddingHorizontal: padding * 0.8,
          }}
        >
          {/* City, State - auto-fit */}
          <AutoFitText
            text={(hometown || 'CITY, ST').toUpperCase()}
            style={[
              styles.text,
              {
                fontWeight: '900',
                color: '#FFFFFF',
                marginTop: padding * 0.6, // Increased from 0.3 to 0.6 for more space
              },
            ]}
            maxWidth={displayWidth * 0.85}
            minFontSize={18}
            maxFontSize={cityMaxSize}
          />

          {/* POPULATION label */}
          <Text
            style={[
              styles.text,
              {
                fontSize: unifiedTextSize,
                color: '#FFFFFF',
                fontWeight: '800',
                marginTop: padding * 0.3, // Increased from 0.15 to 0.3 for more space
              },
            ]}
          >
            POPULATION
          </Text>

          {/* Population Number */}
          <Text
            style={[
              styles.text,
              {
                fontSize: unifiedTextSize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.4, // Increased from 0.2 to 0.4 for more space
              },
            ]}
          >
            {population == null ? '0' : population.toLocaleString()}
          </Text>

          {/* +1 */}
          <Text
            style={[
              styles.text,
              {
                fontSize: unifiedTextSize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.6, // Increased from 0.4 to 0.6 for more space
              },
            ]}
          >
            +1
          </Text>

          {/* Baby Name - two lines for twins, single line for single babies */}
          {isMultipleBabies ? (
            <View style={{ alignItems: 'center', marginTop: padding * 0.3 }}> {/* Increased from 0.15 to 0.3 */}
              {/* First Names Line */}
              <AutoFitText
                text={nameParts.firstNames.toUpperCase()}
                style={[
                  styles.text,
                  {
                    fontWeight: '900',
                    color: '#FFFFFF',
                  },
                ]}
                maxWidth={displayWidth * 0.85}
                minFontSize={24}
                maxFontSize={nameMaxSize}
              />
              {/* Last Name Line */}
              {nameParts.lastName && nameParts.lastName.trim() && (
                <AutoFitText
                  text={nameParts.lastName.toUpperCase()}
                  style={[
                    styles.text,
                    {
                      fontWeight: '900',
                      color: '#FFFFFF',
                      marginTop: padding * 0.05,
                    },
                  ]}
                  maxWidth={displayWidth * 0.85}
                  minFontSize={20}
                  maxFontSize={Math.round(nameMaxSize * 0.9)} // Slightly smaller for last name
                />
              )}
            </View>
          ) : (
            <AutoFitText
              text={babyName.toUpperCase()}
              style={[
                styles.text,
                {
                  fontWeight: '900',
                  color: '#FFFFFF',
                  marginTop: padding * 0.3, // Increased from 0.15 to 0.3 for more space
                },
              ]}
              maxWidth={displayWidth * 0.85}
              minFontSize={24}
              maxFontSize={nameMaxSize}
            />
          )}
        </View>

        {/* Smart Multi-Photo Layout - centered horizontally, 1 inch above bottom border */}
        <View
          style={{
            position: 'absolute',
            left: (displayWidth * 0.96 - photoSize) / 2,
            top: photoTop,
            width: photoSize,
            height: photoSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SmartPhotoLayout
            babies={babies}
            fallbackPhotoUri={resolvedPhotoUri}
            totalPhotoSize={photoSize}
            containerWidth={displayWidth * 0.96}
            containerHeight={displayHeight * 0.96}
          />
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
    flex: 1,
  },
  text: {
    textAlign: 'center',
    fontWeight: '700',
  },
});