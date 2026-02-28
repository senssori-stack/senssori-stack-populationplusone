import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { G, Line, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RetrogradeTracker'>;

interface PlanetRetro {
    planet: string;
    symbol: string;
    color: string;
    frequency: string;
    duration: string;
    effects: string;
    survivalTips: string[];
    // 2024 retrogrades as example data
    periods: { start: string; end: string }[];
}

const RETROGRADES: PlanetRetro[] = [
    {
        planet: 'Mercury', symbol: '☿', color: '#FFC107',
        frequency: '3-4 times per year', duration: '~3 weeks each',
        effects: 'Communication breakdowns, tech glitches, travel delays, misunderstandings. Contracts and agreements may have hidden problems.',
        survivalTips: ['Double-check all messages before sending', 'Back up your devices', 'Avoid signing contracts', 'Reconnect with old friends', 'Review and revise, don\'t start new'],
        periods: [{ start: '2025-03-15', end: '2025-04-07' }, { start: '2025-07-18', end: '2025-08-11' }, { start: '2025-11-09', end: '2025-11-29' }],
    },
    {
        planet: 'Venus', symbol: '♀', color: '#E91E63',
        frequency: 'Every 18 months', duration: '~6 weeks',
        effects: 'Relationship reviews, ex returns, financial reassessments, beauty/aesthetic changes. Past loves and values resurface for examination.',
        survivalTips: ['Don\'t make drastic beauty changes', 'Reflect on what you truly value', 'Avoid major purchases', 'Work on self-love', 'Don\'t start new relationships'],
        periods: [{ start: '2025-03-02', end: '2025-04-13' }],
    },
    {
        planet: 'Mars', symbol: '♂', color: '#F44336',
        frequency: 'Every 2 years', duration: '~2.5 months',
        effects: 'Energy slumps, frustration, anger issues, stalled projects. Physical energy may feel blocked or redirected inward.',
        survivalTips: ['Don\'t force outcomes', 'Channel anger into exercise', 'Revisit old projects', 'Practice patience', 'Avoid confrontations'],
        periods: [{ start: '2024-12-06', end: '2025-02-24' }],
    },
    {
        planet: 'Jupiter', symbol: '♃', color: '#9C27B0',
        frequency: 'Every 13 months', duration: '~4 months',
        effects: 'Growth slowdowns, reassessing beliefs, philosophical shifts. Expansion pauses for internal review and course correction.',
        survivalTips: ['Review your goals', 'Study and learn', 'Don\'t overextend', 'Reflect on your beliefs', 'Practice gratitude'],
        periods: [{ start: '2025-11-11', end: '2026-03-11' }],
    },
    {
        planet: 'Saturn', symbol: '♄', color: '#607D8B',
        frequency: 'Every 12.5 months', duration: '~4.5 months',
        effects: 'Karmic reviews, responsibility checks, structural reassessments. Life lessons intensify and past efforts are tested.',
        survivalTips: ['Face responsibilities head-on', 'Build better habits', 'Accept accountability', 'Be patient with progress', 'Strengthen foundations'],
        periods: [{ start: '2025-07-13', end: '2025-11-28' }],
    },
    {
        planet: 'Uranus', symbol: '♅', color: '#00BCD4',
        frequency: 'Every year', duration: '~5 months',
        effects: 'Internal revolution, unexpected insights, technology disruptions. Innovation turns inward — breakthrough ideas incubate.',
        survivalTips: ['Embrace unconventional ideas', 'Be flexible', 'Expect the unexpected', 'Innovate internally', 'Journal breakthrough thoughts'],
        periods: [{ start: '2025-09-06', end: '2026-02-04' }],
    },
    {
        planet: 'Neptune', symbol: '♆', color: '#3F51B5',
        frequency: 'Every year', duration: '~5.5 months',
        effects: 'Spiritual recalibration, illusions revealed, creative blocks then breakthroughs. Dreams become more vivid and meaningful.',
        survivalTips: ['Meditate regularly', 'Pay attention to dreams', 'Avoid escapism', 'Create art', 'Stay grounded'],
        periods: [{ start: '2025-07-04', end: '2025-12-10' }],
    },
    {
        planet: 'Pluto', symbol: '♇', color: '#795548',
        frequency: 'Every year', duration: '~5-6 months',
        effects: 'Deep transformation, power dynamics shift, shadow work intensifies. Old patterns die to make room for profound rebirth.',
        survivalTips: ['Face your shadows', 'Release what no longer serves', 'Therapy and inner work', 'Don\'t resist transformation', 'Trust the process'],
        periods: [{ start: '2025-05-04', end: '2025-10-13' }],
    },
];

function isRetrograde(planet: PlanetRetro, date: Date): boolean {
    return planet.periods.some(p => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return date >= start && date <= end;
    });
}

function getNextRetrograde(planet: PlanetRetro, date: Date): { start: Date; daysUntil: number } | null {
    for (const p of planet.periods) {
        const start = new Date(p.start);
        if (start > date) {
            const daysUntil = Math.ceil((start.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            return { start, daysUntil };
        }
    }
    return null;
}

export default function RetrogradeTrackerScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const today = new Date();

    const statusData = useMemo(() => {
        return RETROGRADES.map(r => ({
            ...r,
            isRetro: isRetrograde(r, today),
            next: getNextRetrograde(r, today),
            wasBirthRetro: isRetrograde(r, birthDate),
        }));
    }, [today.toDateString(), birthDate.toISOString()]);

    const activeCount = statusData.filter(s => s.isRetro).length;
    const birthRetroCount = statusData.filter(s => s.wasBirthRetro).length;

    // Timeline visualization (next 12 months)
    const timelineMonths = 12;
    const timelineStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return (
        <LinearGradient colors={['#0a0a1a', '#1a0020', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>☿℞ Retrograde Tracker</Text>

                {/* Current Status Summary */}
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusBox}>
                            <Text style={[styles.statusNumber, { color: activeCount > 0 ? '#F44336' : '#4CAF50' }]}>{activeCount}</Text>
                            <Text style={styles.statusLabel}>Planets{'\n'}Retrograde Now</Text>
                        </View>
                        <View style={styles.statusBox}>
                            <Text style={[styles.statusNumber, { color: '#FFC107' }]}>{birthRetroCount}</Text>
                            <Text style={styles.statusLabel}>Retrograde{'\n'}At Your Birth</Text>
                        </View>
                    </View>
                    {activeCount === 0 ? (
                        <Text style={styles.allClear}>✨ All clear! No planets are currently retrograde.</Text>
                    ) : (
                        <Text style={styles.warning}>⚠️ {statusData.filter(s => s.isRetro).map(s => s.planet).join(', ')} {activeCount > 1 ? 'are' : 'is'} currently retrograde</Text>
                    )}
                </View>

                {/* Timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📅 12-Month Retrograde Timeline</Text>
                    <Svg width="100%" height={RETROGRADES.length * 32 + 40} viewBox={`0 0 340 ${RETROGRADES.length * 32 + 40}`}>
                        {/* Month labels */}
                        {Array.from({ length: timelineMonths }, (_, i) => {
                            const m = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + i, 1);
                            const x = 60 + (i / timelineMonths) * 270;
                            return (
                                <SvgText key={`m-${i}`} x={x} y={12} fill="rgba(255,255,255,0.4)" fontSize={7} textAnchor="middle">
                                    {m.toLocaleString('en', { month: 'short' })}
                                </SvgText>
                            );
                        })}
                        {/* Grid lines */}
                        {Array.from({ length: timelineMonths }, (_, i) => {
                            const x = 60 + (i / timelineMonths) * 270;
                            return <Line key={`g-${i}`} x1={x} y1={18} x2={x} y2={RETROGRADES.length * 32 + 25} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />;
                        })}
                        {/* Retrograde bars */}
                        {RETROGRADES.map((r, ri) => {
                            const y = 22 + ri * 32;
                            return (
                                <G key={r.planet}>
                                    <SvgText x={0} y={y + 14} fill={r.color} fontSize={9} fontWeight="bold">{r.symbol} {r.planet}</SvgText>
                                    {r.periods.map((p, pi) => {
                                        const start = new Date(p.start);
                                        const end = new Date(p.end);
                                        const timelineEnd = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + timelineMonths, 1);

                                        if (end < timelineStart || start > timelineEnd) return null;

                                        const clampStart = start < timelineStart ? timelineStart : start;
                                        const clampEnd = end > timelineEnd ? timelineEnd : end;

                                        const totalMs = timelineEnd.getTime() - timelineStart.getTime();
                                        const x1 = 60 + ((clampStart.getTime() - timelineStart.getTime()) / totalMs) * 270;
                                        const x2 = 60 + ((clampEnd.getTime() - timelineStart.getTime()) / totalMs) * 270;

                                        return (
                                            <G key={`${r.planet}-${pi}`}>
                                                <Rect x={x1} y={y + 2} width={Math.max(x2 - x1, 4)} height={18} rx={4} fill={r.color} opacity={0.6} />
                                                <SvgText x={x1 + 3} y={y + 14} fill="#fff" fontSize={6}>℞</SvgText>
                                            </G>
                                        );
                                    })}
                                </G>
                            );
                        })}
                        {/* Today marker */}
                        {(() => {
                            const timelineEnd = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + timelineMonths, 1);
                            const totalMs = timelineEnd.getTime() - timelineStart.getTime();
                            const x = 60 + ((today.getTime() - timelineStart.getTime()) / totalMs) * 270;
                            return (
                                <G>
                                    <Line x1={x} y1={16} x2={x} y2={RETROGRADES.length * 32 + 25} stroke="#FFD54F" strokeWidth={1.5} strokeDasharray="3,3" />
                                    <SvgText x={x} y={RETROGRADES.length * 32 + 36} fill="#FFD54F" fontSize={7} fontWeight="bold" textAnchor="middle">TODAY</SvgText>
                                </G>
                            );
                        })()}
                    </Svg>
                </View>

                {/* Birth Retrogrades */}
                {birthRetroCount > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>👶 Planets Retrograde At Your Birth</Text>
                        <Text style={styles.bodyText}>
                            Having planets retrograde at birth means their energy works differently for you — turned inward, intensified, and often gifting you with unique abilities.
                        </Text>
                        {statusData.filter(s => s.wasBirthRetro).map(s => (
                            <View key={`birth-${s.planet}`} style={[styles.birthRetroRow, { borderLeftColor: s.color }]}>
                                <Text style={[styles.birthPlanet, { color: s.color }]}>{s.symbol} {s.planet} ℞</Text>
                                <Text style={styles.birthEffect}>
                                    {s.planet === 'Mercury' ? 'You may think differently than most — a unique communicator with a gift for reviewing and revising ideas.' :
                                        s.planet === 'Venus' ? 'Your approach to love and beauty is unconventional. You may find value where others overlook.' :
                                            s.planet === 'Mars' ? 'Your drive works differently — you may be more strategic than impulsive, with hidden reserves of energy.' :
                                                s.planet === 'Jupiter' ? 'Growth comes through internal expansion. Your wisdom develops through reflection rather than external seeking.' :
                                                    s.planet === 'Saturn' ? 'You may feel an old-soul quality. Responsibility comes naturally, and you build on inner foundations.' :
                                                        `${s.planet}'s energy works internally for you, creating depth and insight others may not understand.`}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Individual Planet Details */}
                {statusData.map(s => (
                    <View key={s.planet} style={[styles.card, s.isRetro && { borderColor: s.color + '66', borderWidth: 2 }]}>
                        <View style={styles.planetHeader}>
                            <Text style={[styles.planetSymbol, { color: s.color }]}>{s.symbol}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.planetName}>{s.planet}</Text>
                                <Text style={styles.freq}>{s.frequency} • {s.duration}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: s.isRetro ? '#F4433622' : '#4CAF5022' }]}>
                                <Text style={[styles.statusBadgeText, { color: s.isRetro ? '#F44336' : '#4CAF50' }]}>
                                    {s.isRetro ? '℞ RETRO' : '✓ DIRECT'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.effectText}>{s.effects}</Text>
                        {s.next && !s.isRetro && (
                            <Text style={styles.nextText}>
                                ⏰ Next retrograde: {s.next.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({s.next.daysUntil} days away)
                            </Text>
                        )}
                        <Text style={styles.tipsLabel}>🛡️ Survival Tips:</Text>
                        {s.survivalTips.map(tip => (
                            <Text key={tip} style={styles.tipItem}>• {tip}</Text>
                        ))}
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10, marginBottom: 20 },
    statusCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
    statusBox: { alignItems: 'center' },
    statusNumber: { fontSize: 36, fontWeight: '900' },
    statusLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
    allClear: { fontSize: 14, color: '#4CAF50', textAlign: 'center', fontWeight: '600' },
    warning: { fontSize: 14, color: '#FFC107', textAlign: 'center', fontWeight: '600' },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    bodyText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 10 },
    planetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    planetSymbol: { fontSize: 28, fontWeight: '900' },
    planetName: { fontSize: 16, fontWeight: '800', color: '#fff' },
    freq: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    statusBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    effectText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 8 },
    nextText: { fontSize: 12, color: '#FFC107', marginBottom: 8, fontWeight: '600' },
    tipsLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    tipItem: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginLeft: 8, marginBottom: 3, lineHeight: 18 },
    birthRetroRow: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 10 },
    birthPlanet: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
    birthEffect: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },
});
