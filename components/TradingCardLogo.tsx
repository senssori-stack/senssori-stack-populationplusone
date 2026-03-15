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
 * "POPULATION" arched around the top of the circle, "+1" centered big.
 * Designed to be overlaid on trading card corners.
 */
export default function TradingCardLogo({
    size = 40,
    bgColor = '#DAA520',
    textColor = '#fff',
}: TradingCardLogoProps) {
    const borderWidth = Math.max(1.5, size * 0.06);
    const plusOneSize = size * 0.294;
    const populationSize = size * 0.145;
    const tmSize = size * 0.11;

    // Arch layout for POPULATION letters
    const innerSize = size - 2 * borderWidth;
    const cx = innerSize / 2;
    const cy = innerSize / 2;
    const letters = 'POPULATION'.split('');
    const numLetters = letters.length;
    const textArcRadius = innerSize * 0.37;
    const totalArcDeg = 150;
    const charW = populationSize * 0.85;
    const charH = populationSize * 1.2;

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
            {/* POPULATION text arched around the top */}
            {letters.map((letter, i) => {
                const angleDeg = -90 - totalArcDeg / 2 + (i / (numLetters - 1)) * totalArcDeg;
                const angleRad = (angleDeg * Math.PI) / 180;
                const lx = cx + textArcRadius * Math.cos(angleRad);
                const ly = cy + textArcRadius * Math.sin(angleRad);
                return (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: lx - charW / 2,
                            top: ly - charH / 2,
                            width: charW,
                            height: charH,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [{ rotate: `${angleDeg + 90}deg` }],
                        }}
                    >
                        <Text
                            style={{
                                fontSize: populationSize,
                                fontWeight: '900',
                                color: textColor,
                            }}
                        >
                            {letter}
                        </Text>
                    </View>
                );
            })}

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
