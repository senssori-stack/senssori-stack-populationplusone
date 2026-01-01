import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, ImageSourcePropType } from 'react-native';
import FitText from './FitText';
import SyncFitGroup from './SyncFitGroup';
import type { ThemeName } from '../src/types';
import { COLOR_SCHEMES } from '../src/data/utils/colors';

export const FRONT_BASE_WIDTH = 900;

type Baby = { first?: string; middle?: string; last?: string; photoUri?: string | null };

type Props = {
  theme?: ThemeName;
  hometown?: string;
  population?: number | null;
  babies?: Baby[];
  babyName?: string;
  photoUri?: string | null;
  forceOrientation?: 'landscape' | 'portrait';
  previewScale?: number;
};

export default function SignFront(props: Props) {
  const { width } = useWindowDimensions();
  const {
    theme = 'green' as ThemeName,
    hometown = 'CITY, ST',
    population = null,
    babyName: explicitBabyName,
    babies,
    photoUri = null,
    previewScale,
  } = props;

  // Prefer explicit babyName from the form; fallback to first baby object in babies[]
  const babyFromArray = Array.isArray(babies) && babies.length > 0 ? [babies[0].first, babies[0].middle, babies[0].last].filter(Boolean).join(' ') : '';
  const babyName = (explicitBabyName && explicitBabyName.trim()) ? explicitBabyName : (babyFromArray || 'BABY NAME');

  const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

  const artWidth = typeof previewScale === 'number' ? Math.floor(FRONT_BASE_WIDTH * previewScale) : Math.floor(Math.min(FRONT_BASE_WIDTH, width * 0.94));
  const base = Math.max(300, artWidth);
  const cityFont = Math.floor(base / 6);
  const populationFont = Math.floor(base / 8);
  const nameFont = Math.floor(base / 9);
  const photoSize = Math.floor(base * 0.42);

  // Adjustments per request:
  // - decrease city/state size (interpreted as 50% of cityFont) but keep visible
  // - make POPULATION label the same size as the numeric population
  // - make +1 the same size as POPULATION (and numeric population)
  // - keep actual population number and baby name sizes unchanged
  const cityDisplayFont = Math.max(10, Math.round(cityFont * 0.5));
  const populationLabelFont = populationFont;
  const plusFont = populationFont;

  // Resolve photo URI: prefer explicit photoUri prop, then first baby's photoUri
  const resolvedPhotoUri = photoUri ?? (Array.isArray(babies) && babies.length > 0 ? babies[0].photoUri ?? null : null);
  const imgSource: ImageSourcePropType | undefined = resolvedPhotoUri ? ({ uri: resolvedPhotoUri } as ImageSourcePropType) : undefined;

  const borderRadius = Math.max(18, Math.round(base * 0.04));
  // Use separate horizontal and vertical padding so left/right white borders
  // can be tightened while preserving top/bottom spacing. Reduce horizontal
  // padding but enforce a textHorizontalMargin so text never touches the border.
  // Further tighten horizontal padding per user request, keep a tiny safety margin
  const borderPaddingHorizontal = Math.max(2, Math.round(base * 0.012));
  const borderPaddingVertical = Math.max(10, Math.round(base * 0.03));
  const textHorizontalMargin = Math.max(6, Math.round(base * 0.008));

  return (
    <View style={[styles.screen, { backgroundColor: colors.card || colors.bg }]}> 
      <View style={[styles.cardOuter, { width: artWidth }]}> 
        {/* White rounded stroke around a theme-colored inner area */}
        <View style={[styles.innerBorder, { borderRadius, paddingHorizontal: borderPaddingHorizontal, paddingVertical: borderPaddingVertical, backgroundColor: '#FFFFFF' }]}> 
          <View style={[styles.innerContent, { borderRadius: Math.max(8, borderRadius - 6), backgroundColor: colors.bg, paddingHorizontal: borderPaddingHorizontal, paddingVertical: borderPaddingVertical, overflow: 'hidden' }]}> 

            <Text style={[styles.welcome, { color: '#FFFFFF', fontSize: Math.max(12, Math.round(cityFont * 0.22)), marginHorizontal: textHorizontalMargin }]}>Welcome to</Text>

            <SyncFitGroup
              items={[
                (hometown || 'CITY, ST').toUpperCase(),
                'POPULATION',
                population == null ? '0' : population.toLocaleString(),
                '+1',
                babyName,
              ]}
              maxFontSize={cityDisplayFont}
              minFontSize={10}
              step={1}
              style={{ color: '#FFFFFF', fontWeight: '800', textAlign: 'center' }}
              textHorizontalMargin={textHorizontalMargin}
              itemGap={6}
            />

            <View style={{ height: 12 }} />

            {/* Photo area: persistent shadow (correct size) with photo/content above it */}
            <View style={[styles.photoContainer, { width: photoSize, height: photoSize }]}> 
              <View style={[styles.photoShadow, { width: photoSize, height: photoSize, borderRadius: Math.round(photoSize * 0.06) }]} pointerEvents="none" />
              <View style={[styles.photoWrap, { width: photoSize, height: photoSize, borderRadius: Math.round(photoSize * 0.06) }]}> 
                {imgSource ? (
                  <Image source={imgSource} style={{ width: photoSize, height: photoSize, borderRadius: Math.round(photoSize * 0.06) }} resizeMode="cover" />
                ) : (
                  <View style={[styles.photoPlaceholder, { width: photoSize, height: photoSize, borderRadius: Math.round(photoSize * 0.06) }]} />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center' },
  cardOuter: { alignItems: 'center', justifyContent: 'center' },
  innerBorder: { alignItems: 'center', justifyContent: 'center' },
  whiteBorder: { width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  innerContent: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  welcome: { fontWeight: '700', marginTop: 8 },
  city: { fontWeight: '900', textAlign: 'center', marginTop: 6 },
  populationLabel: { fontWeight: '800', marginTop: 10 },
  population: { fontWeight: '900', marginTop: 6 },
  plus: { fontWeight: '900', marginTop: 6 },
  babyName: { fontWeight: '900', marginTop: 14 },
  photoWrap: { marginTop: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoPlaceholder: { backgroundColor: '#EEE' },
  photoContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  photoShadow: { position: 'absolute', backgroundColor: '#00000022', transform: [{ scale: 1 }], shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6, zIndex: 0 },
});
