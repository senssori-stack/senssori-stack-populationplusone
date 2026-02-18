# COMPLETE APP BACKUP - POPULATION PLUS ONE
## Backup Date: February 2, 2026
## Status: ALL LAYOUT RULES LOCKED AND WORKING

---

## 1. SignFrontLandscape.tsx (MAIN COMPONENT - FULLY LOCKED)

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ThemeName } from '../src/types';
import { COLOR_SCHEMES } from '../src/data/utils/colors';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
export const LANDSCAPE_WIDTH = 3300;
export const LANDSCAPE_HEIGHT = 2550;

type Props = {
    theme?: ThemeName;
    previewScale?: number;
    photoUris?: (string | null | undefined)[];
    hometown?: string;
    population?: number;
    personName?: string;
};

export default function SignFrontLandscape(props: Props) {
    const {
        theme = 'green' as ThemeName,
        previewScale = 0.2,
        photoUris = [],
        hometown = '',
        population,
        personName = '',
    } = props;

    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // ====== FIXED DIMENSIONS - LOCKED ======
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    // ====== WELCOME TO TEXT & SIZING ======
    const borderWidth = Math.round(displayWidth * 0.02);
    const padding = Math.round(displayWidth * 0.005);
    const baseFontSize = Math.round(displayWidth * 0.03375);
    const unifiedFontSize = Math.round(baseFontSize * 1.25);
    const welcomeToFontSize = Math.round(unifiedFontSize * 1.953125);

    // ====== EQUAL SPACING RULE - ALL FOUR GAPS MUST BE EQUAL ======
    // Gap value applied to: Welcome To→City/State, City/State→STABLE, STABLE→Person Name, Person Name→Photos
    const equalGapMultiplier = -0.12; // Single equal gap value for all transitions
    const equalGap = Math.round(welcomeToFontSize * equalGapMultiplier);

    // ====== LOCKED POSITIONS - NEVER CHANGE THESE VALUES ======
    // ====== WELCOME TO MARGIN - LOCKED - DO NOT MODIFY ======
    const welcomeToLockedMargin = Math.round(padding * 0.0009375); // LOCKED VALUE - DO NOT CHANGE

    // ====== PHOTO BOTTOM GAP - LOCKED - MUST EQUAL TOP GAP ======
    // Gap from photo bottom to white border - LOCKED IN POSITION
    const photoBottomGapLocked = welcomeToLockedMargin + Math.round(displayWidth * 0.02); // LOCKED VALUE - DO NOT CHANGE

    // ====== STABLE CENTERING RULE - LOCKED - PRIMARY RULE ======
    // Photo spacer reserves space so flex only works in area above photo
    const photoSpacerHeight = photoBottomGapLocked + (600 * previewScale);

    // Top spacer reserves space for Welcome To
    const welcomeToHeight = welcomeToFontSize * 1.2;
    const topSpacerHeight = welcomeToLockedMargin + welcomeToHeight;

    // ====== STABLE LOCKED POSITION CALCULATION ======
    // Calculate the exact center position for STABLE
    const availableHeight = displayHeight - topSpacerHeight - photoSpacerHeight;
    const stableTopPosition = topSpacerHeight + (availableHeight / 2) - (300 * previewScale);


    // ====== DYNAMIC FONT SIZING FOR CITY, ST AND PERSON NAME ======
    const cityStateLength = hometown.length;
    const personNameLength = personName.length;

    // City, ST font size based on character count (in points)
    const getCityStateFontSize = (length: number): number => {
        if (length <= 15) return 58;
        if (length <= 17) return 51;
        if (length <= 19) return 46;
        if (length <= 21) return 41;
        if (length <= 23) return 41;
        if (length <= 25) return 34;
        if (length <= 33) return 27;
        return 27; // Fallback
    };

    // Person Name font size based on character count (in points)
    const getPersonNameFontSize = (length: number): number => {
        if (length <= 18) return 48;
        if (length === 19) return 48;
        if (length === 20) return 44;
        if (length === 21) return 41;
        if (length === 22) return 38;
        if (length === 23) return 38;
        if (length <= 25) return 34;
        if (length <= 32) return 32;
        return 32; // Fallback
    };

    const cityStateFontSize = getCityStateFontSize(cityStateLength) * 4.1667 * previewScale;
    const personNameFontSize = getPersonNameFontSize(personNameLength) * 4.1667 * previewScale;

    // ====== PHOTO SIZING - 1.75 inches wide x 2 inches tall at 300 DPI ======
    // At 300 DPI: 1 inch = 300 pixels
    // 1.75 inches = 525 pixels (width), 2 inches = 600 pixels (height)
    // Gap between photos: 0.312 inches = 93.6 pixels
    const photoWidth = Math.round(525 * previewScale);
    const photoHeight = Math.round(600 * previewScale);
    const photoGap = Math.round(93.6 * previewScale); // Gap between multiple photos

    // Filter valid photo URIs and limit to 3
    const validPhotoUris = photoUris.filter((uri): uri is string => !!uri);
    const photoCount = Math.min(validPhotoUris.length, 3);

    // Calculate total width for all photos with gaps between them
    let totalPhotoWidth = photoWidth * photoCount;
    if (photoCount > 1) {
        totalPhotoWidth += photoGap * (photoCount - 1);
    }

    // Horizontal centering inside the border
    const borderInnerWidth = displayWidth * 0.95;
    const photoContainerStartX = (borderInnerWidth - totalPhotoWidth) / 2;

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
            {/* White outer border - LOCKED */}
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
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }]}>

                    {/* WELCOME TO - LOCKED POSITION AND SIZE - DO NOT CHANGE */}
                    <Text style={[styles.text, {
                        position: 'absolute',
                        top: welcomeToLockedMargin,
                        left: 0,
                        right: 0,
                        fontSize: welcomeToFontSize,
                        color: '#FFFFFF',
                        fontStyle: 'italic',
                        fontWeight: '700',
                        fontFamily: 'cursive',
                        transform: [{ scaleX: 1.25 }]
                    }]}>
                        Welcome To
                    </Text>

                    {/* CITY, ST - SECONDARY RULE: Centers between Welcome To bottom and POPULATION top */}
                    <Text style={[styles.text, {
                        position: 'absolute',
                        top: (topSpacerHeight + (stableTopPosition - (welcomeToFontSize * 0.69))) / 2 - (cityStateFontSize * 0.15),
                        left: 0,
                        right: 0,
                        fontSize: cityStateFontSize,
                        color: '#FFFFFF',
                        transform: [{ scaleX: 1.3 }, { translateY: -cityStateFontSize / 2 }]
                    }]}>
                        {hometown.toUpperCase()}
                    </Text>

                    {/* STABLE - LOCKED CENTER - PRIMARY RULE - ABSOLUTE POSITION */}
                    {population !== undefined && (
                        <View style={{
                            position: 'absolute',
                            top: stableTopPosition,
                            left: 0,
                            right: 0,
                            alignItems: 'center',
                            transform: [{ translateY: -welcomeToFontSize * 0.69 }]
                        }}>
                            <Text style={[styles.text, {
                                fontSize: Math.round(welcomeToFontSize * 0.69),
                                color: '#FFFFFF',
                                transform: [{ scaleX: 1.3 }]
                            }]}>
                                POPULATION
                            </Text>
                            <Text style={[styles.text, {
                                fontSize: Math.round(welcomeToFontSize * 0.72),
                                color: '#FFFFFF',
                                marginTop: Math.round(welcomeToFontSize * -0.14)
                            }]}>
                                {population.toLocaleString()}
                            </Text>
                            <Text style={[styles.text, {
                                fontSize: Math.round(welcomeToFontSize * 0.75),
                                color: '#FFFFFF',
                                marginTop: Math.round(welcomeToFontSize * -0.14)
                            }]}>
                                +1
                            </Text>
                        </View>
                    )}

                    {/* PERSON NAME - SECONDARY RULE: Centers between +1 bottom and photo top */}
                    <Text style={[styles.text, {
                        position: 'absolute',
                        top: stableTopPosition + (welcomeToFontSize * 0.75 * 2) + (displayHeight - photoBottomGapLocked - photoHeight - stableTopPosition - welcomeToFontSize * 0.75 * 2) / 2 - (personNameFontSize * 0.6),
                        left: 0,
                        right: 0,
                        fontSize: personNameFontSize,
                        color: '#FFFFFF',
                        transform: [{ translateY: -personNameFontSize / 2 }]
                    }]}>
                        {personName}
                    </Text>

                    {/* Photo spacer */}
                    <View style={{ height: photoSpacerHeight }} />

                    {/* PHOTO PLACEMENT - LOCKED POSITION - DO NOT CHANGE */}
                    {photoCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            bottom: photoBottomGapLocked,
                            left: photoContainerStartX,
                            flexDirection: 'row',
                            gap: photoGap
                        }}>
                            {validPhotoUris.slice(0, 3).map((uri, index) => (
                                <Image
                                    key={`photo-${index}`}
                                    source={{ uri }}
                                    resizeMode="cover"
                                    style={{
                                        width: photoWidth,
                                        height: photoHeight
                                    }}
                                />
                            ))}
                        </View>
                    )}

                </View>
            </View>
        </View >
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
});
```

---

## LAYOUT RULES LOCKED (DO NOT MODIFY)

### Primary Rule:
- **STABLE** (POPULATION, number, +1) is absolutely positioned and centered
- Position: `topSpacerHeight + (availableHeight / 2) - (300 * previewScale)`
- Container has absolute positioning with `top: stableTopPosition`
- Internal gaps reduced by 20% using negative marginTop

### Secondary Rules:
- **City, ST**: Absolutely positioned Text (NO container)
  - Centers between Welcome To bottom and POPULATION top
  - Position: `(topSpacerHeight + (stableTopPosition - (welcomeToFontSize * 0.69))) / 2 - (cityStateFontSize * 0.15)`
  - Font size: 27pt-58pt based on character count (1-33+ chars)
  
- **Person Name**: Absolutely positioned Text (NO container)
  - Centers between +1 bottom and photo top
  - Position: `stableTopPosition + (welcomeToFontSize * 0.75 * 2) + (displayHeight - photoBottomGapLocked - photoHeight - stableTopPosition - welcomeToFontSize * 0.75 * 2) / 2 - (personNameFontSize * 0.6)`
  - Font size: 32pt-48pt based on character count (1-32+ chars)

### Locked Values:
- Welcome To margin: `Math.round(padding * 0.0009375)` - NEVER CHANGE
- Photo bottom gap: `welcomeToLockedMargin + Math.round(displayWidth * 0.02)` - NEVER CHANGE
- STABLE position offset: `-300 * previewScale` from calculated center
- STABLE internal gaps: 20% reduction via `marginTop: Math.round(welcomeToFontSize * -0.14)`

---

## CRITICAL NOTES

1. **STABLE Container Structure**:
   - STABLE IS in an absolutely positioned View container
   - City, ST and Person Name are NOT in containers - just Text elements with absolute positioning

2. **Font Sizing**:
   - Dynamic sizing based on character count
   - Works independently for City/ST and Person Name
   - No container interference

3. **All positioning is locked** - manual adjustments have been made and confirmed working

4. **Test city prefilled**: Bellefontaine Neighbors, MO (long name for font size testing)

---

## END OF BACKUP
