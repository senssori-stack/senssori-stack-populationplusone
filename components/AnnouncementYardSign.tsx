import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';

/**
 * AnnouncementYardSign - Full announcement design adapted for yard sign format
 * 
 * Same layout as SignFrontLandscape (the main birth announcement),
 * but sized for 24×18" corrugated plastic outdoor yard signs at 150 DPI.
 * 
 * 24" × 18" at 150 DPI = 3600 × 2700 pixels
 * 
 * Designed for roadside visibility — larger text, bolder weights.
 * No time capsule data — just the announcement facing the street.
 */

// 24×18 inches at 150 DPI (outdoor print quality)  
export const YARD_SIGN_WIDTH = 3600;
export const YARD_SIGN_HEIGHT = 2700;

type Props = {
    theme?: ThemeName;
    previewScale?: number;
    photoUris?: (string | null | undefined)[];
    hometown?: string;
    population?: number;
    personName?: string;
};

export default function AnnouncementYardSign(props: Props) {
    const {
        theme = 'green' as ThemeName,
        previewScale = 0.1,
        photoUris = [],
        hometown = '',
        population,
        personName = '',
    } = props;

    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // ====== FIXED DIMENSIONS ======
    const displayWidth = YARD_SIGN_WIDTH * previewScale;
    const displayHeight = YARD_SIGN_HEIGHT * previewScale;

    // ====== SIZING ======
    const borderWidth = Math.round(displayWidth * 0.022);
    const padding = Math.round(displayWidth * 0.005);
    const baseFontSize = Math.round(displayWidth * 0.035);
    const unifiedFontSize = Math.round(baseFontSize * 1.25);
    const welcomeToFontSize = Math.round(unifiedFontSize * 1.95);

    // ====== SPACING ======
    const welcomeToLockedMargin = Math.round(padding * 0.001);

    // ====== PHOTO BOTTOM GAP ======
    const photoBottomGapLocked = welcomeToLockedMargin + Math.round(displayWidth * 0.02);

    // ====== STABLE CENTERING ======
    const photoWidth = Math.round(525 * previewScale * (YARD_SIGN_WIDTH / 3300));
    const photoHeight = Math.round(600 * previewScale * (YARD_SIGN_HEIGHT / 2550));
    const photoSpacerHeight = photoBottomGapLocked + photoHeight;
    const welcomeToHeight = welcomeToFontSize * 1.2;
    const topSpacerHeight = welcomeToLockedMargin + welcomeToHeight;
    const availableHeight = displayHeight - topSpacerHeight - photoSpacerHeight;
    const stableTopPosition = topSpacerHeight + (availableHeight / 2) - (300 * previewScale * (YARD_SIGN_HEIGHT / 2550));

    // ====== DYNAMIC FONT SIZING ======
    const cityStateLength = hometown.length;
    const personNameLength = personName.length;

    const getCityStateFontSize = (length: number): number => {
        if (length <= 15) return 58;
        if (length <= 17) return 51;
        if (length <= 19) return 46;
        if (length <= 21) return 41;
        if (length <= 23) return 41;
        if (length <= 25) return 34;
        if (length <= 33) return 27;
        return 27;
    };

    const getPersonNameFontSize = (length: number): number => {
        if (length <= 18) return 48;
        if (length === 19) return 48;
        if (length === 20) return 44;
        if (length === 21) return 41;
        if (length === 22) return 38;
        if (length === 23) return 38;
        if (length <= 25) return 34;
        if (length <= 32) return 32;
        return 32;
    };

    // Scale factor adjusted for yard sign DPI (150 vs 300)
    const dpiFactor = YARD_SIGN_WIDTH / 3300;
    const cityStateFontSize = getCityStateFontSize(cityStateLength) * 4.1667 * previewScale * dpiFactor;
    const personNameFontSize = getPersonNameFontSize(personNameLength) * 4.1667 * previewScale * dpiFactor;

    // ====== PHOTO SIZING ======
    const photoGap = Math.round(93.6 * previewScale * dpiFactor);
    const validPhotoUris = photoUris.filter((uri): uri is string => !!uri);
    const photoCount = Math.min(validPhotoUris.length, 3);

    let totalPhotoWidth = photoWidth * photoCount;
    if (photoCount > 1) {
        totalPhotoWidth += photoGap * (photoCount - 1);
    }

    const borderInnerWidth = displayWidth * 0.95;
    const photoContainerStartX = (borderInnerWidth - totalPhotoWidth) / 2;

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
                <View style={[styles.content, {
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }]}>

                    {/* WELCOME TO */}
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

                    {/* CITY, ST */}
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

                    {/* POPULATION / count / +1 */}
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

                    {/* PERSON NAME */}
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

                    {/* PHOTOS */}
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

            {/* Watermark */}
            <Text style={[styles.text, {
                position: 'absolute',
                bottom: Math.round(displayHeight * 0.004),
                right: Math.round(displayWidth * 0.015),
                fontSize: Math.round(baseFontSize * 0.22),
                color: '#FFFFFF',
                fontWeight: '400',
                transform: [{ scaleX: 1.25 }],
            }]}>
                Population +1™
            </Text>
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
});
