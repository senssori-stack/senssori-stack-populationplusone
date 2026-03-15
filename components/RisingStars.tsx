import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const STAR_COUNT = 7;
const HEADER_HEIGHT = 180; // Stars confined to header area only

export default function RisingStars() {
    const stars = useRef(
        Array.from({ length: STAR_COUNT }, () => ({
            y: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }))
    ).current;
    const configs = useRef(
        Array.from({ length: STAR_COUNT }, () => ({
            left: `${8 + Math.random() * 84}%`,
            size: 12 + Math.random() * 12,
            delay: Math.random() * 800,
            travel: -60 - Math.random() * 80,
            duration: 1800 + Math.random() * 600,
        }))
    ).current;

    useEffect(() => {
        stars.forEach((star, i) => {
            Animated.sequence([
                Animated.delay(configs[i].delay),
                Animated.parallel([
                    Animated.timing(star.y, {
                        toValue: configs[i].travel,
                        duration: configs[i].duration,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(star.opacity, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.delay(800),
                        Animated.timing(star.opacity, {
                            toValue: 0.6,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start();
        });
    }, []);

    return (
        <View style={styles.container} pointerEvents="none">
            {stars.map((star, i) => (
                <Animated.Text
                    key={`rs-${i}`}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: configs[i].left as any,
                        fontSize: configs[i].size,
                        color: '#FFD700',
                        opacity: star.opacity,
                        transform: [{ translateY: star.y }],
                    }}
                >
                    ✦
                </Animated.Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        overflow: 'hidden',
        zIndex: 10,
    },
});
