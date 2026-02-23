import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Zodiac sign to emoji mapping
const ZODIAC_EMOJIS: Record<string, string> = {
    Aries: '\u2648',
    Taurus: '\u2649',
    Gemini: '\u264A',
    Cancer: '\u264B',
    Leo: '\u264C',
    Virgo: '\u264D',
    Libra: '\u264E',
    Scorpio: '\u264F',
    Sagittarius: '\u2650',
    Capricorn: '\u2651',
    Aquarius: '\u2652',
    Pisces: '\u2653',
};

const PLUS1_COLORS = ['#FFD700', '#FF69B4', '#00E5FF', '#76FF03', '#FF4081', '#FFAB40', '#E040FB', '#FFFFFF'];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface FloatingItem {
    x: number;
    y: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
    scale: Animated.Value;
    type: 'emoji' | 'plus1';
    value: string;
    color: string;
    size: number;
    delay: number;
}

function buildItems(zodiacSign?: string): FloatingItem[] {
    // Base items: +1 cubes, baby, hearts, clovers, stars
    const baseEmojis = ['\uD83D\uDC76', '\u2764\uFE0F', '\uD83C\uDF40', '\u2B50'];
    // Add zodiac emoji if we have a sign
    const zodiacEmoji = zodiacSign ? ZODIAC_EMOJIS[zodiacSign] : null;
    if (zodiacEmoji) baseEmojis.push(zodiacEmoji);

    const items: FloatingItem[] = [];
    for (let i = 0; i < 45; i++) {
        const isPlus1 = i % 5 === 0; // every 5th item is a +1 cube
        items.push({
            x: rand(10, SW - 40),
            y: new Animated.Value(SH + rand(20, 120)),
            opacity: new Animated.Value(0),
            rotation: new Animated.Value(0),
            scale: new Animated.Value(rand(0.6, 1.3)),
            type: isPlus1 ? 'plus1' : 'emoji',
            value: isPlus1 ? '+1' : baseEmojis[i % baseEmojis.length],
            color: isPlus1 ? pick(PLUS1_COLORS) : '#FFFFFF',
            size: isPlus1 ? rand(14, 22) : rand(18, 32),
            delay: i * 75 + rand(0, 180),
        });
    }
    return items;
}

function animateItems(items: FloatingItem[]) {
    items.forEach((item) => {
        const duration = rand(2500, 4500);
        Animated.sequence([
            Animated.delay(item.delay),
            Animated.parallel([
                Animated.timing(item.opacity, { toValue: rand(0.6, 1), duration: 300, useNativeDriver: true }),
                Animated.timing(item.y, { toValue: -80, duration, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(item.rotation, { toValue: rand(-2, 2), duration, easing: Easing.linear, useNativeDriver: true }),
            ]),
        ]).start();
    });
}

// ====== MAIN COMPONENT ======

interface CelebrationOverlayProps {
    visible: boolean;
    onComplete?: () => void;
    message?: string;
    zodiacSign?: string;
}

export default function CelebrationOverlay({ visible, onComplete, message = '\uD83C\uDF89 Your creation is ready!', zodiacSign }: CelebrationOverlayProps) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const messageScale = useRef(new Animated.Value(0)).current;
    const messageOpacity = useRef(new Animated.Value(0)).current;
    const messageGlow = useRef(new Animated.Value(0)).current;
    const itemsRef = useRef<FloatingItem[]>([]);
    const [renderKey, setRenderKey] = React.useState(0);

    useEffect(() => {
        if (!visible) return;

        overlayOpacity.setValue(1);
        messageScale.setValue(0);
        messageOpacity.setValue(0);
        messageGlow.setValue(0);

        itemsRef.current = buildItems(zodiacSign);
        setRenderKey(k => k + 1);

        animateItems(itemsRef.current);

        // Celebration message
        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.spring(messageScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.timing(messageOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();

        // Glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(messageGlow, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(messageGlow, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            { iterations: 4 }
        ).start();

        // Fade out
        Animated.sequence([
            Animated.delay(4000),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start(() => onComplete?.());
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View key={renderKey} style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
            {itemsRef.current.map((item, i) => (
                <Animated.View
                    key={`float-${i}`}
                    style={{
                        position: 'absolute',
                        left: item.x,
                        opacity: item.opacity,
                        transform: [
                            { translateY: item.y },
                            { scale: item.scale },
                            { rotate: item.rotation.interpolate({ inputRange: [-2, 2], outputRange: ['-180deg', '180deg'] }) },
                        ],
                    }}
                >
                    {item.type === 'plus1' ? (
                        <View style={[styles.plus1Box, { backgroundColor: item.color }]}>
                            <Text style={styles.plus1Text}>+1</Text>
                        </View>
                    ) : (
                        <Text style={{ fontSize: item.size }}>{item.value}</Text>
                    )}
                </Animated.View>
            ))}

            <Animated.View style={[styles.messageContainer, { transform: [{ scale: messageScale }], opacity: messageOpacity }]}>
                <Animated.View style={[styles.messageBg, {
                    opacity: messageGlow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.9] }),
                    transform: [{ scale: messageGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
                }]} />
                <Text style={styles.messageText}>{message}</Text>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999, elevation: 9999 },
    plus1Box: {
        width: 28, height: 28, borderRadius: 6,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
    },
    plus1Text: { fontSize: 12, fontWeight: '900', color: '#000' },
    messageContainer: {
        position: 'absolute', top: SH * 0.38, left: 20, right: 20, alignItems: 'center',
    },
    messageBg: {
        position: 'absolute', top: -12, left: -10, right: -10, bottom: -12,
        backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
    },
    messageText: {
        fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center',
        textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12, paddingHorizontal: 16, paddingVertical: 4,
    },
});
