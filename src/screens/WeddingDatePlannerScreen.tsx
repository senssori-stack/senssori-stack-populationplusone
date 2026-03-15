import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RisingStars from '../../components/RisingStars';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WeddingDatePlanner'>;

// ---------- Planetary Data for 2025-2026 ----------

interface RetrogradePeriod { planet: string; start: string; end: string }

const RETROGRADE_PERIODS: RetrogradePeriod[] = [
    // Mercury
    { planet: 'Mercury', start: '2025-03-15', end: '2025-04-07' },
    { planet: 'Mercury', start: '2025-07-18', end: '2025-08-11' },
    { planet: 'Mercury', start: '2025-11-09', end: '2025-11-29' },
    { planet: 'Mercury', start: '2026-03-03', end: '2026-03-26' },
    { planet: 'Mercury', start: '2026-07-02', end: '2026-07-25' },
    { planet: 'Mercury', start: '2026-10-24', end: '2026-11-13' },
    // Venus
    { planet: 'Venus', start: '2025-03-02', end: '2025-04-13' },
    // Mars
    { planet: 'Mars', start: '2024-12-06', end: '2025-02-24' },
    // Jupiter
    { planet: 'Jupiter', start: '2025-11-11', end: '2026-03-11' },
    // Saturn
    { planet: 'Saturn', start: '2025-07-13', end: '2025-11-28' },
];

// Venus-ruled favorable Fridays (Venus day) — marked as extra auspicious
const VENUS_SIGNS_FAVORABLE = [
    // Venus in Taurus or Libra periods (approximate 2025)
    { sign: 'Taurus', start: '2025-05-25', end: '2025-06-18' },
    { sign: 'Libra', start: '2025-10-14', end: '2025-11-07' },
    // 2026
    { sign: 'Taurus', start: '2026-05-20', end: '2026-06-13' },
];

// New/Full Moon dates (approximate 2025-2026) — waxing moon = between new & full
interface MoonPhase { date: string; type: 'new' | 'full' }
const MOON_PHASES: MoonPhase[] = [
    { date: '2025-01-29', type: 'new' }, { date: '2025-02-12', type: 'full' },
    { date: '2025-02-28', type: 'new' }, { date: '2025-03-14', type: 'full' },
    { date: '2025-03-29', type: 'new' }, { date: '2025-04-13', type: 'full' },
    { date: '2025-04-27', type: 'new' }, { date: '2025-05-12', type: 'full' },
    { date: '2025-05-27', type: 'new' }, { date: '2025-06-11', type: 'full' },
    { date: '2025-06-25', type: 'new' }, { date: '2025-07-10', type: 'full' },
    { date: '2025-07-24', type: 'new' }, { date: '2025-08-09', type: 'full' },
    { date: '2025-08-23', type: 'new' }, { date: '2025-09-07', type: 'full' },
    { date: '2025-09-21', type: 'new' }, { date: '2025-10-07', type: 'full' },
    { date: '2025-10-21', type: 'new' }, { date: '2025-11-05', type: 'full' },
    { date: '2025-11-20', type: 'new' }, { date: '2025-12-04', type: 'full' },
    { date: '2025-12-20', type: 'new' }, { date: '2026-01-03', type: 'full' },
    { date: '2026-01-18', type: 'new' }, { date: '2026-02-01', type: 'full' },
    { date: '2026-02-17', type: 'new' }, { date: '2026-03-03', type: 'full' },
    { date: '2026-03-19', type: 'new' }, { date: '2026-04-02', type: 'full' },
    { date: '2026-04-17', type: 'new' }, { date: '2026-05-01', type: 'full' },
    { date: '2026-05-17', type: 'new' }, { date: '2026-05-31', type: 'full' },
    { date: '2026-06-15', type: 'new' }, { date: '2026-06-30', type: 'full' },
];

// ---------- Scoring engine ----------

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function isInRange(date: Date, start: string, end: string): boolean {
    return date >= parseDate(start) && date <= parseDate(end);
}

function daysBetween(a: Date, b: Date): number {
    return Math.round(Math.abs(a.getTime() - b.getTime()) / 86400000);
}

interface DateScore {
    date: Date;
    score: number;
    factors: { label: string; emoji: string; good: boolean }[];
}

function scoreDateRange(startDate: Date, endDate: Date): DateScore[] {
    const results: DateScore[] = [];
    const d = new Date(startDate);
    while (d <= endDate) {
        const current = new Date(d);
        let score = 50; // base score
        const factors: DateScore['factors'] = [];

        // Check retrogrades
        const activeRetros = RETROGRADE_PERIODS.filter(r => isInRange(current, r.start, r.end));
        const venusRetro = activeRetros.some(r => r.planet === 'Venus');
        const mercuryRetro = activeRetros.some(r => r.planet === 'Mercury');
        const marsRetro = activeRetros.some(r => r.planet === 'Mars');

        if (venusRetro) {
            score -= 30;
            factors.push({ label: 'Venus Retrograde — avoid for love', emoji: '♀️', good: false });
        } else {
            score += 10;
            factors.push({ label: 'Venus direct — love energy flows', emoji: '♀️', good: true });
        }

        if (mercuryRetro) {
            score -= 15;
            factors.push({ label: 'Mercury Retrograde — communication hiccups', emoji: '☿', good: false });
        } else {
            score += 5;
        }

        if (marsRetro) {
            score -= 10;
            factors.push({ label: 'Mars Retrograde — low energy', emoji: '♂️', good: false });
        }

        if (activeRetros.length === 0) {
            score += 8;
            factors.push({ label: 'No retrogrades active', emoji: '✅', good: true });
        }

        // Venus in domicile (Taurus or Libra)
        const venusHome = VENUS_SIGNS_FAVORABLE.some(v => isInRange(current, v.start, v.end));
        if (venusHome) {
            score += 15;
            factors.push({ label: 'Venus in domicile — peak romance', emoji: '💕', good: true });
        }

        // Moon phase — waxing is preferred (between new & full)
        let isWaxing = false;
        for (let i = 0; i < MOON_PHASES.length - 1; i++) {
            const phaseDate = parseDate(MOON_PHASES[i].date);
            const nextPhaseDate = parseDate(MOON_PHASES[i + 1].date);
            if (current >= phaseDate && current < nextPhaseDate) {
                if (MOON_PHASES[i].type === 'new') {
                    isWaxing = true;
                }
                // Close to full moon = strong energy
                if (MOON_PHASES[i + 1].type === 'full' && daysBetween(current, nextPhaseDate) <= 2) {
                    score += 5;
                    factors.push({ label: 'Near Full Moon — heightened emotion', emoji: '🌕', good: true });
                }
                break;
            }
        }
        if (isWaxing) {
            score += 10;
            factors.push({ label: 'Waxing Moon — new beginnings grow', emoji: '🌙', good: true });
        } else {
            score -= 5;
            factors.push({ label: 'Waning Moon — release energy', emoji: '🌘', good: false });
        }

        // Friday = Venus day, Saturday = Saturn day (commitment)
        const dow = current.getDay();
        if (dow === 5) { // Friday
            score += 8;
            factors.push({ label: 'Friday — Venus\'s day of love', emoji: '💍', good: true });
        } else if (dow === 6) { // Saturday
            score += 5;
            factors.push({ label: 'Saturday — Saturn\'s day of commitment', emoji: '🪐', good: true });
        } else if (dow === 0) { // Sunday
            score += 3;
            factors.push({ label: 'Sunday — joy and celebration', emoji: '☀️', good: true });
        }

        // Jupiter retrograde is mild negative
        const jupiterRetro = activeRetros.some(r => r.planet === 'Jupiter');
        if (jupiterRetro) {
            score -= 5;
            factors.push({ label: 'Jupiter Retrograde — luck turns inward', emoji: '♃', good: false });
        }

        results.push({ date: current, score: Math.max(0, Math.min(100, score)), factors });
        d.setDate(d.getDate() + 1);
    }
    return results;
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#4CAF50';
    if (score >= 65) return '#8BC34A';
    if (score >= 50) return '#FFC107';
    if (score >= 35) return '#FF9800';
    return '#F44336';
}

function getScoreLabel(score: number): string {
    if (score >= 80) return '✨ Excellent';
    if (score >= 65) return '💚 Good';
    if (score >= 50) return '👍 Fair';
    if (score >= 35) return '⚠️ Caution';
    return '🚫 Avoid';
}

// ---------- Component ----------

export default function WeddingDatePlannerScreen({ route }: Props) {
    const [rangeStart, setRangeStart] = useState<Date>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        return d;
    });
    const [rangeEnd, setRangeEnd] = useState<Date>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 4);
        d.setDate(0);
        return d;
    });
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const scored = useMemo(() => {
        const effectiveEnd = new Date(Math.min(rangeEnd.getTime(), rangeStart.getTime() + 365 * 86400000));
        return scoreDateRange(rangeStart, effectiveEnd);
    }, [rangeStart, rangeEnd]);

    const topDates = useMemo(() => {
        return [...scored].sort((a, b) => b.score - a.score).slice(0, 20);
    }, [scored]);

    const displayDates = showAll ? topDates : topDates.slice(0, 8);

    const bestDate = topDates[0];

    return (
        <LinearGradient colors={['#1a0030', '#2d1b4e', '#1b2838']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0030" />
            <RisingStars />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>💍</Text>
                    <Text style={styles.mainTitle}>Wedding Date Planner</Text>
                    <Text style={styles.subtitle}>
                        Find the most auspicious day to say "I do" based on planetary alignments, moon phases, and Venus energy.
                    </Text>
                </View>

                {/* How It Works */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔮 How It Works</Text>
                    <Text style={styles.cardText}>
                        Using electional astrology — the ancient art of choosing the best time to begin something important — we analyze:
                    </Text>
                    <View style={styles.factorList}>
                        <Text style={styles.factorItem}>♀️  <Text style={styles.factorBold}>Venus position</Text> — the planet of love and harmony</Text>
                        <Text style={styles.factorItem}>☿  <Text style={styles.factorBold}>Mercury status</Text> — clear communication for vows</Text>
                        <Text style={styles.factorItem}>🌙  <Text style={styles.factorBold}>Moon phase</Text> — waxing moon = growing love</Text>
                        <Text style={styles.factorItem}>♂️  <Text style={styles.factorBold}>Mars energy</Text> — passion without conflict</Text>
                        <Text style={styles.factorItem}>♃  <Text style={styles.factorBold}>Jupiter blessings</Text> — expansion and good fortune</Text>
                        <Text style={styles.factorItem}>📅  <Text style={styles.factorBold}>Day of the week</Text> — Friday = Venus's day</Text>
                    </View>
                    <View style={styles.personalizeNote}>
                        <Text style={styles.personalizeNoteText}>🌟 This planner scores dates using universal planetary positions. For results personalized to your unique natal chart, spin the chart wheel in Full Natal Chart — it detects YOUR Prime Time windows based on your birth time and city.</Text>
                    </View>
                </View>

                {/* Date Range Selector */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📅 Choose Your Date Range</Text>
                    <Text style={styles.rangeLabel}>From:</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.dateButtonText}>
                            {rangeStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.rangeLabel}>To:</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                        <Text style={styles.dateButtonText}>
                            {rangeEnd.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.rangeNote}>
                        Analyzing {scored.length} days in your selected range
                    </Text>
                </View>

                {/* Best Date Highlight */}
                {bestDate && (
                    <View style={[styles.card, styles.bestCard]}>
                        <Text style={styles.bestLabel}>🏆 #1 Most Auspicious Date</Text>
                        <Text style={styles.bestDate}>
                            {bestDate.date.toLocaleDateString(undefined, {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                            })}
                        </Text>
                        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(bestDate.score) }]}>
                            <Text style={styles.scoreBadgeText}>{bestDate.score}/100</Text>
                        </View>
                        {bestDate.factors.filter(f => f.good).map((f, i) => (
                            <Text key={i} style={styles.bestFactor}>
                                {f.emoji}  {f.label}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Top Dates List */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🌟 Top Auspicious Dates</Text>
                    {displayDates.map((item, idx) => (
                        <View key={idx} style={styles.dateRow}>
                            <View style={styles.dateRowLeft}>
                                <Text style={styles.dateRank}>#{idx + 1}</Text>
                                <View>
                                    <Text style={styles.dateRowDate}>
                                        {item.date.toLocaleDateString(undefined, {
                                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </Text>
                                    <Text style={styles.dateRowLabel}>{getScoreLabel(item.score)}</Text>
                                </View>
                            </View>
                            <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(item.score) }]}>
                                <Text style={styles.scoreCircleText}>{item.score}</Text>
                            </View>
                        </View>
                    ))}
                    {!showAll && topDates.length > 8 && (
                        <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAll(true)}>
                            <Text style={styles.showMoreText}>Show More Dates</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Dates to Avoid */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚫 Dates to Avoid</Text>
                    <Text style={styles.cardText}>
                        These retrograde periods bring challenging energy for weddings:
                    </Text>
                    {RETROGRADE_PERIODS
                        .filter(r => ['Venus', 'Mercury', 'Mars'].includes(r.planet))
                        .filter(r => parseDate(r.end) >= new Date())
                        .map((r, i) => (
                            <View key={i} style={styles.avoidRow}>
                                <Text style={styles.avoidPlanet}>
                                    {r.planet === 'Venus' ? '♀️' : r.planet === 'Mercury' ? '☿' : '♂️'} {r.planet} Retrograde
                                </Text>
                                <Text style={styles.avoidDates}>
                                    {parseDate(r.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {parseDate(r.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                                <Text style={styles.avoidReason}>
                                    {r.planet === 'Venus' ? 'Love planet reversed — highest risk for weddings'
                                        : r.planet === 'Mercury' ? 'Communication snags, vow mix-ups, travel delays'
                                            : 'Low passion, frustration, conflict energy'}
                                </Text>
                            </View>
                        ))}
                </View>

                {/* Quick Tips */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Electional Astrology Tips</Text>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>🌙</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Waxing Moon</Text> — Choose a date between the New and Full Moon so your marriage "grows" with the light.
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>♀️</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Venus in Taurus or Libra</Text> — Venus is strongest in her home signs, amplifying love and beauty.
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>📅</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Friday Weddings</Text> — Friday is named for Venus (Freya/Aphrodite). It's traditionally the luckiest day to marry.
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>♃</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Jupiter Direct</Text> — Jupiter brings luck and expansion. Avoid scheduling while Jupiter is retrograde for maximum blessings.
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>☿</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Mercury Direct</Text> — Keep Mercury moving forward to ensure smooth planning, travel, and contracts.
                        </Text>
                    </View>
                </View>

                {/* Synastry Section */}
                <View style={[styles.card, styles.synastryCard]}>
                    <Text style={styles.cardTitle}>💞 Synastry — Your Charts Combined</Text>
                    <Text style={styles.cardText}>
                        Synastry compares two natal charts to reveal cosmic compatibility. When choosing a wedding date, your combined chart matters as much as the sky that day.
                    </Text>

                    <Text style={styles.sectionSubhead}>Key Synastry Aspects for Marriage</Text>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>☀️↔🌙</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Sun–Moon Connections</Text>
                            <Text style={styles.synDesc}>One partner's Sun conjunct the other's Moon is the classic "soulmate" aspect — you feel seen and understood instinctively.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>♀️↔♂️</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Venus–Mars Chemistry</Text>
                            <Text style={styles.synDesc}>Venus conjunct, trine, or sextile Mars creates magnetic attraction and passion that sustains long-term.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>♀️↔♀️</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Venus–Venus Harmony</Text>
                            <Text style={styles.synDesc}>When your Venus signs are compatible, you share the same love language, aesthetic taste, and values.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>🌙↔🌙</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Moon–Moon Emotional Bond</Text>
                            <Text style={styles.synDesc}>Compatible Moons mean you process emotions similarly — crucial for weathering life's storms together.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>♃↔☀️</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Jupiter Blessings</Text>
                            <Text style={styles.synDesc}>Jupiter touching your partner's Sun, Moon, or Venus expands joy and brings mutual growth and generosity.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>♄↔♀️</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Saturn Commitment</Text>
                            <Text style={styles.synDesc}>Saturn aspects add longevity and durability. Not the most romantic, but Saturn keeps the marriage standing.</Text>
                        </View>
                    </View>

                    <View style={styles.synRow}>
                        <Text style={styles.synEmoji}>⚠️</Text>
                        <View style={styles.synContent}>
                            <Text style={styles.synTitle}>Challenging Aspects</Text>
                            <Text style={styles.synDesc}>Mars square Mars or Venus square Saturn can signal friction. Awareness lets you work through these consciously rather than being blindsided.</Text>
                        </View>
                    </View>

                    <Text style={styles.synTip}>
                        💡 Tip: The best wedding date activates your strongest synastry connections — schedule your ceremony when the transiting planets echo your most harmonious natal aspects.
                    </Text>
                </View>

                {/* Electional Astrology Deep Dive */}
                <View style={[styles.card, styles.electionalCard]}>
                    <Text style={styles.cardTitle}>🏛️ Electional Astrology — Choosing Your Moment</Text>
                    <Text style={styles.cardText}>
                        Electional astrology is the art of selecting the optimal moment to begin any important endeavor. The chart cast for the moment an event begins becomes that event's "birth chart" — shaping its entire life.
                    </Text>

                    <Text style={styles.sectionSubhead}>The Rules of Electional Astrology</Text>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>1</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Strengthen the Ascendant</Text>
                            <Text style={styles.ruleDesc}>The rising sign at the moment of the event sets its identity. For a wedding, choose a Venus-ruled Ascendant (Taurus or Libra) for love and beauty.</Text>
                        </View>
                    </View>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>2</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Empower the Ruling Planet</Text>
                            <Text style={styles.ruleDesc}>The ruler of the Ascendant should be well-placed — not retrograde, not in detriment, and ideally in an angular house (1st, 4th, 7th, or 10th).</Text>
                        </View>
                    </View>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>3</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Fortify the Moon</Text>
                            <Text style={styles.ruleDesc}>The Moon is the co-ruler of every election. It should be waxing (growing), making harmonious aspects (trines, sextiles), and not void-of-course.</Text>
                        </View>
                    </View>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>4</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Activate the Relevant House</Text>
                            <Text style={styles.ruleDesc}>Each life event has a house: 7th for marriage, 2nd/8th for finances, 10th for career, 9th for travel, 5th for children. Place benefic planets there.</Text>
                        </View>
                    </View>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>5</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Avoid Malefics on Angles</Text>
                            <Text style={styles.ruleDesc}>Keep Mars and Saturn away from the Ascendant and Midheaven. Their presence on angles can bring obstacles and delays.</Text>
                        </View>
                    </View>

                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>6</Text>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>No Retrograde Key Planets</Text>
                            <Text style={styles.ruleDesc}>The planet most relevant to your event should be moving direct. For weddings, that's Venus. For business, Mercury. For legal matters, Jupiter.</Text>
                        </View>
                    </View>
                </View>

                {/* Key Life Events to Plan */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Key Life Events to Time by the Stars</Text>
                    <Text style={styles.cardText}>
                        Electional astrology isn't just for weddings. Every major milestone has an ideal cosmic window:
                    </Text>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>💒</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Wedding / Engagement</Text>
                            <Text style={styles.eventHouse}>7th House — Venus, Moon</Text>
                            <Text style={styles.eventDesc}>Venus direct and dignified, waxing Moon, benefics in the 7th. Avoid Venus or Mercury retrograde. Friday is the ideal day.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>🏠</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Buying a Home / Signing a Lease</Text>
                            <Text style={styles.eventHouse}>4th House — Moon, Saturn</Text>
                            <Text style={styles.eventDesc}>Strong Moon in a fixed sign (Taurus, Leo, Scorpio, Aquarius) for stability. Saturn well-placed for lasting foundations. Avoid Mercury retrograde for contracts.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>💼</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Starting a Business / New Job</Text>
                            <Text style={styles.eventHouse}>10th House — Sun, Saturn, Jupiter</Text>
                            <Text style={styles.eventDesc}>Sun or Jupiter on the Midheaven. Mercury direct for contracts and communication. Waxing Moon for growth. Tuesday (Mars day) for ambition.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>👶</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Trying to Conceive</Text>
                            <Text style={styles.eventHouse}>5th House — Venus, Moon, Jupiter</Text>
                            <Text style={styles.eventDesc}>Jupiter or Venus in the 5th house of children. Waxing Moon for fertility. Moon in a water sign (Cancer, Scorpio, Pisces) for nurturing energy.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>✈️</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Major Travel / Moving</Text>
                            <Text style={styles.eventHouse}>9th House — Jupiter, Mercury</Text>
                            <Text style={styles.eventDesc}>Mercury and Jupiter both direct. Avoid Mars retrograde (delays, accidents). Mutable signs (Gemini, Virgo, Sagittarius, Pisces) favor movement.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>📝</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Signing Contracts / Legal Matters</Text>
                            <Text style={styles.eventHouse}>7th &amp; 9th House — Mercury, Jupiter</Text>
                            <Text style={styles.eventDesc}>Mercury must be direct and well-aspected. Jupiter in the 9th favors legal outcomes. Avoid void-of-course Moon — nothing comes of it.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>🎓</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Starting School / Exams</Text>
                            <Text style={styles.eventHouse}>3rd &amp; 9th House — Mercury</Text>
                            <Text style={styles.eventDesc}>Mercury strong (in Gemini or Virgo) and direct. Wednesday (Mercury's day) is ideal. Air signs on the Ascendant favor intellectual pursuits.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>💰</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Financial Investments</Text>
                            <Text style={styles.eventHouse}>2nd &amp; 8th House — Venus, Jupiter, Pluto</Text>
                            <Text style={styles.eventDesc}>Venus or Jupiter in the 2nd house of wealth. Avoid Mars opposite Pluto (risky bets). Taurus energy stabilizes finances. Thursday (Jupiter's day) for growth.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>🏥</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Elective Surgery / Medical</Text>
                            <Text style={styles.eventHouse}>6th House — Mars, Moon</Text>
                            <Text style={styles.eventDesc}>Avoid surgery when the Moon is in the sign ruling the body part (e.g., no heart surgery with Moon in Leo). Waning Moon reduces swelling. Mars direct for clean cuts.</Text>
                        </View>
                    </View>

                    <View style={styles.eventRow}>
                        <Text style={styles.eventEmoji}>🚀</Text>
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle}>Launching a Project / App / Product</Text>
                            <Text style={styles.eventHouse}>1st &amp; 10th House — Sun, Mercury, Jupiter</Text>
                            <Text style={styles.eventDesc}>Strong Ascendant, Mercury direct for messaging, Jupiter for reach. Waxing Moon for momentum. Avoid all retrograde periods — you want the world to see it clearly.</Text>
                        </View>
                    </View>
                </View>

                {/* Synastry + Electional Combined */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔗 Combining Synastry &amp; Electional</Text>
                    <Text style={styles.cardText}>
                        The most powerful approach uses both techniques together:
                    </Text>

                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>1️⃣</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Map your synastry</Text> — Identify your strongest connections (Venus-Mars trines, Sun-Moon conjunctions, etc.)
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>2️⃣</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Find transit echoes</Text> — Choose a date when transiting planets activate those same degrees, amplifying your natural chemistry
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>3️⃣</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Set the Ascendant</Text> — Pick a ceremony time that places Venus or Jupiter on an angle of the electional chart
                        </Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>4️⃣</Text>
                        <Text style={styles.tipText}>
                            <Text style={styles.tipBold}>Check the composite</Text> — Your composite chart (midpoints of both charts) should also be supported by the day's transits
                        </Text>
                    </View>

                    <Text style={styles.synTip}>
                        ✨ The wedding chart becomes a third chart in your relationship — the "birth chart" of your marriage. Choose wisely, and it works for you for a lifetime.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Date Pickers */}
            <ScrollableDatePicker
                visible={showStartPicker}
                date={rangeStart}
                onDateChange={(d) => {
                    setRangeStart(d);
                    if (d > rangeEnd) {
                        const newEnd = new Date(d);
                        newEnd.setMonth(newEnd.getMonth() + 3);
                        setRangeEnd(newEnd);
                    }
                }}
                onClose={() => setShowStartPicker(false)}
                title="Range Start Date"
                minimumDate={new Date()}
                maximumDate={new Date(2027, 11, 31)}
            />
            <ScrollableDatePicker
                visible={showEndPicker}
                date={rangeEnd}
                onDateChange={setRangeEnd}
                onClose={() => setShowEndPicker(false)}
                title="Range End Date"
                minimumDate={rangeStart}
                maximumDate={new Date(2027, 11, 31)}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
    headerEmoji: { fontSize: 48, marginBottom: 8 },
    mainTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bestCard: {
        borderColor: '#FFD700',
        borderWidth: 2,
        backgroundColor: 'rgba(255,215,0,0.08)',
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
    cardText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 12 },

    factorList: { gap: 8 },
    factorItem: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
    factorBold: { fontWeight: '700', color: '#fff' },

    rangeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4, marginTop: 8 },
    dateButton: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    dateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    rangeNote: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 10 },

    bestLabel: { fontSize: 14, fontWeight: '700', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
    bestDate: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 10 },
    scoreBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    scoreBadgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    bestFactor: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4 },

    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    dateRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    dateRank: { fontSize: 14, fontWeight: '800', color: '#FFD700', width: 32 },
    dateRowDate: { fontSize: 14, fontWeight: '600', color: '#fff' },
    dateRowLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    scoreCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreCircleText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    showMoreBtn: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
    },
    showMoreText: { color: '#FFD700', fontWeight: '700', fontSize: 14 },

    avoidRow: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    avoidPlanet: { fontSize: 15, fontWeight: '700', color: '#F44336', marginBottom: 2 },
    avoidDates: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    avoidReason: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic' },

    tipRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
    tipEmoji: { fontSize: 20, width: 28 },
    tipText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 20 },
    tipBold: { fontWeight: '700', color: '#fff' },

    // Synastry
    synastryCard: { borderColor: '#E91E63', borderWidth: 1.5, backgroundColor: 'rgba(233,30,99,0.06)' },
    sectionSubhead: { fontSize: 15, fontWeight: '700', color: '#FFD700', marginBottom: 12, marginTop: 4 },
    synRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
    synEmoji: { fontSize: 18, width: 44, textAlign: 'center' },
    synContent: { flex: 1 },
    synTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
    synDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
    synTip: { fontSize: 13, color: '#FFD700', fontStyle: 'italic', marginTop: 12, lineHeight: 20, textAlign: 'center' },

    // Electional
    electionalCard: { borderColor: '#9C27B0', borderWidth: 1.5, backgroundColor: 'rgba(156,39,176,0.06)' },
    ruleRow: { flexDirection: 'row', marginBottom: 14, gap: 12 },
    ruleNum: { fontSize: 18, fontWeight: '900', color: '#9C27B0', width: 24, textAlign: 'center' },
    ruleContent: { flex: 1 },
    ruleTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
    ruleDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },

    // Key Life Events
    eventRow: { flexDirection: 'row', marginBottom: 16, gap: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    eventEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
    eventContent: { flex: 1 },
    eventTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
    eventHouse: { fontSize: 12, fontWeight: '600', color: '#9C27B0', marginBottom: 4 },
    eventDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
    personalizeNote: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    personalizeNoteText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        lineHeight: 18,
        textAlign: 'center',
    },
});
