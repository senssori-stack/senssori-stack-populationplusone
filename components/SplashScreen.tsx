import React from 'react';
import { View, Image, Text, StyleSheet, useColorScheme } from 'react-native';

export default function SplashScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
            <Image
                source={require('../assets/images/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                PopulationPlusOne
            </Text>
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
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 8,
    },
    website: {
        fontSize: 16,
        fontWeight: '400',
    },
});
