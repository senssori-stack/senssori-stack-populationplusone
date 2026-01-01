import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ThemeName } from '../src/types';
import { COLOR_SCHEMES } from '../src/data/utils/colors';

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

// Portrait 8.5x11 at 300 DPI = 2550x3300 pixels
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
    previewScale = 0.2, // Default scale for preview
  } = props;

  // Get baby name from props or babies array
  const babyFromArray =
    Array.isArray(babies) && babies.length > 0
      ? [babies[0].first, babies[0].middle, babies[0].last]
          .filter(Boolean)
          .join(' ')
      : '';
  const babyName =
    (explicitBabyName && explicitBabyName.trim())
      ? explicitBabyName
      : babyFromArray || 'BABY NAME';

  const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

  // Calculate dimensions
  const displayWidth = PORTRAIT_WIDTH * previewScale;
  const displayHeight = PORTRAIT_HEIGHT * previewScale;

  // 30% increase for all font sizes and photo size
  const scaleUp = 1.3;

  const welcomeSize = Math.round(displayWidth * 0.036 * scaleUp);
  const citySize = Math.round(displayWidth * 0.072 * scaleUp);
  const plusSize = Math.round(displayWidth * 0.0675 * scaleUp);
  const populationSize = Math.round(displayWidth * 0.054 * scaleUp);
  const nameSize = Math.round(displayWidth * 0.042 * scaleUp);

  const photoSize = Math.round(displayWidth * 0.315 * scaleUp);

  const borderWidth = Math.round(displayWidth * 0.015);
  const padding = Math.round(displayWidth * 0.01);

  // 1 inch in pixels at 300 DPI, scaled
  const oneInch = 300 * previewScale;

  // Resolve photo URI
  const resolvedPhotoUri =
    photoUri ??
    (Array.isArray(babies) && babies.length > 0
      ? babies[0].photoUri ?? null
      : null);

  // Calculate the bottom position for the photo (1 inch above bottom border)
  const borderInnerHeight = displayHeight * 0.96;
  const photoTop = borderInnerHeight - photoSize - oneInch;

  // The text area is from top border to top of photo
  const textAreaHeight = photoTop;

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
      {/* White outer border */}
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
        {/* Texts group, centered vertically between top and photo */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: textAreaHeight,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: padding * 0.8,
          }}
        >
          {/* WELCOME TO */}
          <Text
            style={[
              styles.text,
              {
                fontSize: welcomeSize,
                color: '#FFFFFF',
                marginTop: padding * 0.5,
              },
            ]}
          >
            WELCOME TO
          </Text>

          {/* City, State - auto-fit */}
          <AutoFitText
            text={(hometown || 'CITY, ST').toUpperCase()}
            style={[
              styles.text,
              {
                fontSize: citySize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.3,
              },
            ]}
            maxWidth={displayWidth * 0.85}
            minFontSize={24}
            maxFontSize={citySize}
          />

          {/* POPULATION label */}
          <Text
            style={[
              styles.text,
              {
                fontSize: Math.round(citySize * 0.7),
                color: '#FFFFFF',
                fontWeight: '800',
                marginTop: padding * 0.15,
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
                fontSize: populationSize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.2,
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
                fontSize: plusSize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.4,
              },
            ]}
          >
            +1
          </Text>

          {/* Baby Name - auto-fit */}
          <AutoFitText
            text={babyName.toUpperCase()}
            style={[
              styles.text,
              {
                fontSize: nameSize,
                color: '#FFFFFF',
                fontWeight: '900',
                marginTop: padding * 0.15,
              },
            ]}
            maxWidth={displayWidth * 0.85}
            minFontSize={24}
            maxFontSize={nameSize}
          />
        </View>

        {/* Photo - centered horizontally, 1 inch above bottom border */}
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
          {resolvedPhotoUri ? (
            <Image
              source={{ uri: resolvedPhotoUri }}
              style={{
                width: photoSize,
                height: photoSize,
                borderRadius: Math.round(photoSize * 0.1),
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: photoSize,
                height: photoSize,
                borderRadius: Math.round(photoSize * 0.1),
                backgroundColor: '#EEE',
              }}
            />
          )}
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