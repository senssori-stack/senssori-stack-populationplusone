import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Palettes: each firework picks one palette so its burst is color-coherent ──
const PALETTES = [
    ['#FF1744', '#FF5252', '#FF8A80', '#FFCDD2', '#FFFFFF'],           // Red hot
    ['#FFD700', '#FFC107', '#FFEB3B', '#FFF9C4', '#FFFFFF'],           // Gold
    ['#00E5FF', '#18FFFF', '#84FFFF', '#E0F7FA', '#FFFFFF'],           // Cyan electric
    ['#E040FB', '#EA80FC', '#CE93D8', '#F3E5F5', '#FFFFFF'],           // Purple magic
    ['#00E676', '#69F0AE', '#B9F6CA', '#E8F5E9', '#76FF03'],           // Green neon
    ['#FF6D00', '#FF9100', '#FFAB40', '#FFE0B2', '#FFFFFF'],           // Orange blaze
    ['#F50057', '#FF4081', '#FF80AB', '#FCE4EC', '#FFFFFF'],           // Hot pink
    ['#2979FF', '#448AFF', '#82B1FF', '#BBDEFB', '#FFFFFF'],           // Blue sky
    ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFFFFF'],           // Rainbow mix
    ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1', '#FFFFFF'],           // Baby pink
];

const EMOJIS = ['🎉', '🎊', '✨', '🌟', '⭐', '💫', '🎆', '🎇', '🥳', '👶', '🍼', '💖', '🎈', '🎀', '🦋'];

// ── Types ──
interface Particle {
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rotation: Animated.Value;
    color: string;
    size: number;
    isEmoji: boolean;
    emoji: string;
    shape: 'circle' | 'star' | 'diamond' | 'heart';
}

interface Rocket {
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    trailDots: { x: number; y: Animated.Value; opacity: Animated.Value }[];
    startX: number;
    targetY: number;
}

interface RingParticle {
    angle: number;
    radius: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    color: string;
    cx: number;
    cy: number;
}

interface FallingStar {
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
    color: string;
    size: number;
}

interface Sparkle {
    x: number;
    y: number;
    opacity: Animated.Value;
    scale: Animated.Value;
    color: string;
}

interface FireworkBurst {
    particles: Particle[];
    originX: number;
    originY: number;
}

// ── Helpers ──
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function createParticle(ox: number, oy: number, palette: string[], isEmoji = false): Particle {
    const shapes: Particle['shape'][] = ['circle', 'circle', 'circle', 'star', 'diamond', 'heart'];
    return {
        x: new Animated.Value(ox),
        y: new Animated.Value(oy),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        color: pick(palette),
        size: isEmoji ? 30 : rand(5, 14),
        isEmoji,
        emoji: pick(EMOJIS),
        shape: isEmoji ? 'circle' : pick(shapes),
    };
}

function createBurst(ox: number, oy: number, count = 28): { burst: FireworkBurst; palette: string[] } {
    const palette = pick(PALETTES);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        particles.push(createParticle(ox, oy, palette, Math.random() < 0.2));
    }
    return { burst: { particles, originX: ox, originY: oy }, palette };
}

function animateBurst(burst: FireworkBurst, delay = 0) {
    burst.particles.forEach((p, i) => {
        const angle = (i / burst.particles.length) * Math.PI * 2 + rand(-0.3, 0.3);
        const dist = rand(60, 220);
        const tx = burst.originX + Math.cos(angle) * dist;
        const ty = burst.originY + Math.sin(angle) * dist + rand(30, 80);
        const dur = rand(800, 1400);

        Animated.sequence([
            Animated.delay(delay + i * 12),
            Animated.parallel([
                // Flash in then expand
                Animated.sequence([
                    Animated.timing(p.scale, { toValue: p.isEmoji ? 1.4 : rand(1.2, 2.0), duration: 150, useNativeDriver: true }),
                    Animated.timing(p.scale, { toValue: 0, duration: dur - 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                ]),
                // Move outward
                Animated.timing(p.x, { toValue: tx, duration: dur, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                // Rise then fall (gravity arc)
                Animated.sequence([
                    Animated.timing(p.y, { toValue: burst.originY - rand(80, 160), duration: dur * 0.3, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                    Animated.timing(p.y, { toValue: ty, duration: dur * 0.7, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                ]),
                // Fade
                Animated.timing(p.opacity, { toValue: 0, duration: dur, useNativeDriver: true }),
                // Spin
                Animated.timing(p.rotation, { toValue: rand(-4, 4), duration: dur, useNativeDriver: true }),
            ]),
        ]).start();
    });
}

// ── Rocket trail (shoots up from bottom) ──
function createRocket(startX: number, targetY: number): Rocket {
    const trailDots = Array.from({ length: 8 }, (_, i) => ({
        x: startX + rand(-3, 3),
        y: new Animated.Value(SH + 20),
        opacity: new Animated.Value(0),
    }));
    return {
        x: new Animated.Value(startX),
        y: new Animated.Value(SH + 20),
        opacity: new Animated.Value(1),
        trailDots,
        startX,
        targetY,
    };
}

function animateRocket(rocket: Rocket, delay: number, onExplode: () => void) {
    const riseDuration = rand(500, 800);
    // Trail dots follow behind
    rocket.trailDots.forEach((dot, i) => {
        Animated.sequence([
            Animated.delay(delay + i * 25),
            Animated.parallel([
                Animated.timing(dot.opacity, { toValue: 0.7 - i * 0.08, duration: 100, useNativeDriver: true }),
                Animated.timing(dot.y, { toValue: rocket.targetY + i * 18, duration: riseDuration - i * 20, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            ]),
            Animated.timing(dot.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    });

    // Main rocket head
    Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rocket.y, { toValue: rocket.targetY, duration: riseDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(rocket.opacity, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => onExplode());
}

// ── Expanding ring effect ──
function createRing(cx: number, cy: number, count = 16): { ring: RingParticle[]; palette: string[] } {
    const palette = pick(PALETTES);
    const ring = Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        radius: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
        color: palette[i % palette.length],
        cx,
        cy,
    }));
    return { ring, palette };
}

function animateRing(ring: RingParticle[], delay: number) {
    ring.forEach((p, i) => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(p.radius, { toValue: rand(100, 180), duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.sequence([
                    Animated.delay(400),
                    Animated.timing(p.opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
                ]),
                Animated.timing(p.scale, { toValue: 0.3, duration: 900, useNativeDriver: true }),
            ]),
        ]).start();
    });
}

// ── Falling stars / confetti streamers ──
function createFallingStars(count: number): FallingStar[] {
    return Array.from({ length: count }, () => ({
        x: new Animated.Value(rand(0, SW)),
        y: new Animated.Value(rand(-100, -40)),
        opacity: new Animated.Value(0),
        rotation: new Animated.Value(0),
        color: pick(pick(PALETTES)),
        size: rand(8, 18),
    }));
}

function animateFallingStars(stars: FallingStar[]) {
    stars.forEach((s, i) => {
        const drift = rand(-60, 60);
        Animated.sequence([
            Animated.delay(rand(600, 2500)),
            Animated.parallel([
                Animated.timing(s.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(s.y, { toValue: SH + 40, duration: rand(2000, 3500), easing: Easing.in(Easing.quad), useNativeDriver: true }),
                Animated.timing(s.x, { toValue: (s.x as any)._value + drift, duration: rand(2000, 3500), useNativeDriver: true }),
                Animated.timing(s.rotation, { toValue: rand(-8, 8), duration: rand(2000, 3500), useNativeDriver: true }),
            ]),
        ]).start();
    });
}

// ── Sparkles (twinkling) ──
function createSparkles(count: number): Sparkle[] {
    return Array.from({ length: count }, () => ({
        x: rand(0, SW),
        y: rand(0, SH * 0.7),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        color: pick(['#FFD700', '#FFFFFF', '#00E5FF', '#FF4081', '#76FF03', '#FFAB40']),
    }));
}

function animateSparkles(sparkles: Sparkle[]) {
    sparkles.forEach((s) => {
        const pulse = () => {
            Animated.sequence([
                Animated.delay(rand(0, 2000)),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(s.opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
                        Animated.timing(s.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.spring(s.scale, { toValue: rand(1.0, 2.0), friction: 3, useNativeDriver: true }),
                        Animated.timing(s.scale, { toValue: 0, duration: 300, useNativeDriver: true }),
                    ]),
                ]),
            ]).start();
        };
        pulse();
        // Pulse again for a second twinkle
        setTimeout(pulse, rand(800, 1800));
    });
}

// ── Shape renderers ──
function ShapeView({ shape, color, size }: { shape: string; color: string; size: number }) {
    if (shape === 'diamond') {
        return (
            <View style={{
                width: size, height: size, backgroundColor: color,
                transform: [{ rotate: '45deg' }],
            }} />
        );
    }
    if (shape === 'heart') {
        return (
            <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>♥</Text>
        );
    }
    if (shape === 'star') {
        return (
            <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>★</Text>
        );
    }
    // circle (default)
    return (
        <View style={{
            width: size, height: size, borderRadius: size / 2, backgroundColor: color,
        }} />
    );
}

// ══════════════════════════════════════════════════════
// ██  MAIN COMPONENT
// ══════════════════════════════════════════════════════

interface CelebrationOverlayProps {
    visible: boolean;
    onComplete?: () => void;
    message?: string;
}

export default function CelebrationOverlay({ visible, onComplete, message = '🎉 Your creation is ready!' }: CelebrationOverlayProps) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const flashOpacity = useRef(new Animated.Value(0)).current;
    const messageScale = useRef(new Animated.Value(0)).current;
    const messageOpacity = useRef(new Animated.Value(0)).current;
    const messageGlow = useRef(new Animated.Value(0)).current;

    const burstsRef = useRef<FireworkBurst[]>([]);
    const rocketsRef = useRef<Rocket[]>([]);
    const ringsRef = useRef<RingParticle[][]>([]);
    const starsRef = useRef<FallingStar[]>([]);
    const sparklesRef = useRef<Sparkle[]>([]);
    const [renderKey, setRenderKey] = React.useState(0);

    useEffect(() => {
        if (!visible) return;

        // Reset all
        overlayOpacity.setValue(1);
        flashOpacity.setValue(0);
        messageScale.setValue(0);
        messageOpacity.setValue(0);
        messageGlow.setValue(0);

        // ── Build everything ──
        const allBursts: FireworkBurst[] = [];
        const allRings: RingParticle[][] = [];

        // Rocket positions: shoot up from bottom, then explode
        const rocketConfigs = [
            { x: SW * 0.5, targetY: SH * 0.18, delay: 0 },
            { x: SW * 0.2, targetY: SH * 0.28, delay: 300 },
            { x: SW * 0.8, targetY: SH * 0.22, delay: 500 },
            { x: SW * 0.35, targetY: SH * 0.12, delay: 900 },
            { x: SW * 0.65, targetY: SH * 0.32, delay: 700 },
            { x: SW * 0.5, targetY: SH * 0.42, delay: 1200 },
            { x: SW * 0.15, targetY: SH * 0.15, delay: 1500 },
            { x: SW * 0.85, targetY: SH * 0.25, delay: 1700 },
        ];

        const rockets = rocketConfigs.map(c => createRocket(c.x, c.targetY));
        rocketsRef.current = rockets;

        // Each rocket creates a burst + ring on explosion
        rocketConfigs.forEach((config, idx) => {
            const { burst } = createBurst(config.x, config.targetY, 30);
            allBursts.push(burst);

            // Every other rocket also gets an expanding ring
            if (idx % 2 === 0) {
                const { ring } = createRing(config.x, config.targetY, 14);
                allRings.push(ring);
            }
        });

        burstsRef.current = allBursts;
        ringsRef.current = allRings;

        // Falling confetti stars
        starsRef.current = createFallingStars(40);

        // Background sparkles
        sparklesRef.current = createSparkles(50);

        setRenderKey(k => k + 1);

        // ── Animate rockets → explosions ──
        rocketConfigs.forEach((config, idx) => {
            animateRocket(rockets[idx], config.delay, () => {
                // Flash on explosion
                Animated.sequence([
                    Animated.timing(flashOpacity, { toValue: 0.3, duration: 60, useNativeDriver: true }),
                    Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                ]).start();

                // Burst
                animateBurst(allBursts[idx], 0);

                // Ring (if exists for this index)
                if (idx % 2 === 0 && allRings[idx / 2]) {
                    animateRing(allRings[idx / 2], 50);
                }
            });
        });

        // Falling stars start a bit after first explosions
        setTimeout(() => animateFallingStars(starsRef.current), 400);

        // Sparkles throughout
        animateSparkles(sparklesRef.current);

        // ── Celebration message with glow pulse ──
        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.spring(messageScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.timing(messageOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();

        // Glow pulse on message
        Animated.loop(
            Animated.sequence([
                Animated.timing(messageGlow, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(messageGlow, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            { iterations: 4 }
        ).start();

        // ── Fade out entire overlay ──
        Animated.sequence([
            Animated.delay(4000),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start(() => onComplete?.());

    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View key={renderKey} style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">

            {/* Screen flash on explosion */}
            <Animated.View style={[styles.flash, { opacity: flashOpacity }]} />

            {/* Background sparkles */}
            {sparklesRef.current.map((s, i) => (
                <Animated.View key={`sp-${i}`} style={[styles.sparkle, {
                    left: s.x, top: s.y, backgroundColor: s.color,
                    shadowColor: s.color,
                    opacity: s.opacity,
                    transform: [{ scale: s.scale }],
                }]} />
            ))}

            {/* Rocket trails */}
            {rocketsRef.current.map((r, rIdx) => (
                <React.Fragment key={`r-${rIdx}`}>
                    {/* Trail dots */}
                    {r.trailDots.map((dot, dIdx) => (
                        <Animated.View key={`rd-${rIdx}-${dIdx}`} style={{
                            position: 'absolute', left: dot.x - 2, width: 4, height: 4,
                            borderRadius: 2, backgroundColor: '#FFD700',
                            opacity: dot.opacity,
                            transform: [{ translateY: dot.y }],
                            shadowColor: '#FFD700', shadowOpacity: 1, shadowRadius: 4,
                            shadowOffset: { width: 0, height: 0 },
                        }} />
                    ))}
                    {/* Rocket head */}
                    <Animated.View style={{
                        position: 'absolute', left: r.startX - 4, width: 8, height: 8,
                        borderRadius: 4, backgroundColor: '#FFFFFF',
                        opacity: r.opacity,
                        transform: [{ translateY: r.y }],
                        shadowColor: '#FFFFFF', shadowOpacity: 1, shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },
                    }} />
                </React.Fragment>
            ))}

            {/* Expanding rings */}
            {ringsRef.current.map((ring, ringIdx) =>
                ring.map((p, pIdx) => (
                    <Animated.View key={`ring-${ringIdx}-${pIdx}`} style={{
                        position: 'absolute', width: 8, height: 8, borderRadius: 4,
                        backgroundColor: p.color,
                        opacity: p.opacity,
                        transform: [
                            { translateX: Animated.add(p.cx, Animated.multiply(p.radius, Math.cos(p.angle))) as any },
                            { translateY: Animated.add(p.cy, Animated.multiply(p.radius, Math.sin(p.angle))) as any },
                            { scale: p.scale },
                        ],
                        shadowColor: p.color, shadowOpacity: 0.8, shadowRadius: 6,
                        shadowOffset: { width: 0, height: 0 },
                    }} />
                ))
            )}

            {/* Firework burst particles */}
            {burstsRef.current.map((burst, bIdx) =>
                burst.particles.map((p, pIdx) => (
                    <Animated.View key={`p-${bIdx}-${pIdx}`} style={[styles.particle, {
                        opacity: p.opacity,
                        transform: [
                            { translateX: p.x }, { translateY: p.y },
                            { scale: p.scale },
                            { rotate: p.rotation.interpolate({ inputRange: [-4, 4], outputRange: ['-360deg', '360deg'] }) },
                        ],
                    }]}>
                        {p.isEmoji ? (
                            <Text style={{ fontSize: p.size }}>{p.emoji}</Text>
                        ) : (
                            <ShapeView shape={p.shape} color={p.color} size={p.size} />
                        )}
                    </Animated.View>
                ))
            )}

            {/* Falling confetti stars */}
            {starsRef.current.map((s, i) => (
                <Animated.View key={`fs-${i}`} style={{
                    position: 'absolute',
                    opacity: s.opacity,
                    transform: [
                        { translateX: s.x }, { translateY: s.y },
                        { rotate: s.rotation.interpolate({ inputRange: [-8, 8], outputRange: ['-720deg', '720deg'] }) },
                    ],
                }}>
                    <View style={{
                        width: s.size, height: s.size * 0.4, borderRadius: 2,
                        backgroundColor: s.color,
                        shadowColor: s.color, shadowOpacity: 0.6, shadowRadius: 3,
                        shadowOffset: { width: 0, height: 0 },
                    }} />
                </Animated.View>
            ))}

            {/* Celebration message */}
            <Animated.View style={[styles.messageContainer, {
                transform: [{ scale: messageScale }],
                opacity: messageOpacity,
            }]}>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999,
    },
    flash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
    },
    particle: {
        position: 'absolute',
    },
    sparkle: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    messageContainer: {
        position: 'absolute',
        top: SH * 0.38,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    messageBg: {
        position: 'absolute',
        top: -12,
        left: -10,
        right: -10,
        bottom: -12,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
    },
    messageText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: '#FFD700',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
});
