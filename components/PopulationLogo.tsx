import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
    /** Overall scale multiplier (default 1) */
    scale?: number;
    /** Show website URL below logo (default true) */
    showWebsite?: boolean;
    /** Light text on dark background (default false) */
    darkMode?: boolean;
};

/**
 * PopulationLogo - Reusable brand logo component
 * Renders "POPULATION™" text above the +1 icon with optional website.
 * Use `scale` prop to resize for different contexts (affiliate banners, headers, footers, etc.)
 */
export default function PopulationLogo({ scale = 1, showWebsite = true, darkMode = false }: Props) {
    const textColor = darkMode ? '#ffffff' : '#4a8c5c';
    const subColor = darkMode ? '#cccccc' : '#666666';

    return (
        <View style={styles.container}>
            <Text style={[styles.populationText, { color: textColor, fontSize: 36 * scale, letterSpacing: 6 * scale }]}>
                POPULATION<Text style={{ fontSize: 14 * scale, fontWeight: '400' }}>™</Text>
            </Text>
            <Image
                source={require('../assets/images/splash-icon.png')}
                style={{ width: 200 * scale, height: 200 * scale, marginBottom: 12 * scale }}
                resizeMode="contain"
            />
            {showWebsite && (
                <Text style={[styles.website, { color: subColor, fontSize: 16 * scale }]}>
                    www.PopulationPlusOne.com
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    populationText: {
        fontWeight: '900',
        marginBottom: 8,
    },
    website: {
        fontWeight: '400',
    },
});
