import React from 'react';
import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function SplashScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
            <Text style={[styles.populationText, { color: isDark ? '#ffffff' : '#4a8c5c' }]}>
                POPULATION<Text style={{ fontSize: 14, fontWeight: '400' }}>™</Text>
            </Text>
            <Image
                source={require('../assets/images/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={[styles.website, { color: isDark ? '#cccccc' : '#666666' }]}>
                www.PopulationPlusOne.com
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    populationText: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 6,
        marginBottom: 8,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    website: {
        fontSize: 16,
        fontWeight: '400',
    },
});
