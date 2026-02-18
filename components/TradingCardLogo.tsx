import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TradingCardLogoProps {
    /** Diameter of the logo circle */
    size?: number;
    /** Background color of the circle */
    bgColor?: string;
    /** Color of the text */
    textColor?: string;
}

/**
 * TradingCardLogo — Topps-style circular brand stamp
 * "POPULATION" wrapped around the top of the circle, "+1" centered big.
 * Designed to be overlaid on trading card corners.
 */
export default function TradingCardLogo({
    size = 40,
    bgColor = '#DAA520',
    textColor = '#fff',
}: TradingCardLogoProps) {
    const borderWidth = Math.max(1.5, size * 0.06);
    const plusOneSize = size * 0.42;
    const populationSize = size * 0.145;
    const tmSize = size * 0.11;

    return (
        <View
            style={[
                styles.circle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: bgColor,
                    borderWidth,
                    borderColor: '#fff',
                },
            ]}
        >
            {/* POPULATION text curved at the top */}
            <Text
                style={[
                    styles.populationText,
                    {
                        fontSize: populationSize,
                        color: textColor,
                        top: size * 0.08,
                    },
                ]}
                numberOfLines={1}
            >
                POPULATION
            </Text>

            {/* +1 centered */}
            <Text
                style={[
                    styles.plusOne,
                    {
                        fontSize: plusOneSize,
                        color: textColor,
                        marginTop: size * 0.02,
                    },
                ]}
            >
                +1
            </Text>

            {/* ™ tiny at bottom */}
            <Text
                style={[
                    styles.tm,
                    {
                        fontSize: tmSize,
                        color: textColor,
                        bottom: size * 0.08,
                    },
                ]}
            >
                ™
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    populationText: {
        fontWeight: '900',
        letterSpacing: 0.5,
        position: 'absolute',
        textAlign: 'center',
    },
    plusOne: {
        fontWeight: '900',
        letterSpacing: -0.5,
        textAlign: 'center',
        lineHeight: undefined,
    },
    tm: {
        fontWeight: '700',
        position: 'absolute',
        textAlign: 'center',
    },
});
