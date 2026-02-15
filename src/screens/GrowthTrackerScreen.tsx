// src/screens/GrowthTrackerScreen.tsx
// ═══════════════════════════════════════════════════════════════════
// POPULATION +1™ Baby Growth Chart Tracker
// CDC/WHO percentile curves • Pediatrician visit prep • Visual charts
// ═══════════════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    METRIC_META,
    PERCENTILE_LABELS,
    WELL_CHILD_VISITS,
    calculatePercentile,
    getGrowthTipForAge,
    getPercentileData,
    interpretPercentile,
    type GrowthEntry,
    type GrowthMetric,
    type PercentilePoint,
    type Sex
} from '../data/growth-chart-data';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GrowthTracker'>;

const { width: SW, height: SH } = Dimensions.get('window');
const GROWTH_KEY = '@p1_growth_entries';
const BABY_KEY = '@p1_baby_info';
const GROWTH_SEX_KEY = '@p1_baby_sex';

// ── Chart dimensions ─────────────────────────────────────────────
const CHART_WIDTH = SW - 48;
const CHART_HEIGHT = 220;
const CHART_PAD_LEFT = 40;
const CHART_PAD_RIGHT = 16;
const CHART_PAD_TOP = 12;
const CHART_PAD_BOTTOM = 28;
const PLOT_W = CHART_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
const PLOT_H = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;

// ── Mini SVG-like chart using Views ──────────────────────────────

function GrowthChart({
    metric, sex, entries, maxMonth,
}: {
    metric: GrowthMetric;
    sex: Sex;
    entries: GrowthEntry[];
    maxMonth: number;
}) {
    const data = getPercentileData(metric, sex);
    const metaMeta = METRIC_META[metric];
    const displayMax = Math.max(maxMonth, 12);

    // Get Y range from percentile data
    const allVals = data.flatMap(p => [p.p3, p.p97]);
    const entryVals = entries
        .map(e => metric === 'weight' ? e.weight : metric === 'length' ? e.length : e.head)
        .filter((v): v is number => v !== undefined);
    const allPoints = [...allVals, ...entryVals];
    const yMin = Math.floor(Math.min(...allPoints) * 0.9);
    const yMax = Math.ceil(Math.max(...allPoints) * 1.05);

    const toX = (month: number) => CHART_PAD_LEFT + (month / displayMax) * PLOT_W;
    const toY = (val: number) => CHART_PAD_TOP + PLOT_H - ((val - yMin) / (yMax - yMin)) * PLOT_H;

    // Render percentile lines as dots connected visually
    const renderPercentileLine = (key: string, color: string, opacity: number) => {
        const points = data.filter(d => d.month <= displayMax);
        return points.map((point, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const x1 = toX(prev.month);
            const y1 = toY(prev[key as keyof PercentilePoint] as number);
            const x2 = toX(point.month);
            const y2 = toY(point[key as keyof PercentilePoint] as number);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
                <View
                    key={`${key}_${i}`}
                    style={{
                        position: 'absolute',
                        left: x1,
                        top: y1,
                        width: len,
                        height: key === 'p50' ? 2 : 1,
                        backgroundColor: color,
                        opacity,
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: 'left center',
                    }}
                />
            );
        });
    };

    // Render Y axis labels
    const ySteps = 5;
    const yLabels = [];
    for (let i = 0; i <= ySteps; i++) {
        const val = yMin + ((yMax - yMin) / ySteps) * i;
        yLabels.push(
            <Text
                key={`y_${i}`}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: toY(val) - 6,
                    fontSize: 9,
                    color: '#666',
                    width: CHART_PAD_LEFT - 4,
                    textAlign: 'right',
                }}
            >
                {val.toFixed(1)}
            </Text>
        );
    }

    // Render X axis labels
    const xMonths = [];
    const step = displayMax <= 12 ? 3 : displayMax <= 24 ? 6 : 12;
    for (let m = 0; m <= displayMax; m += step) {
        xMonths.push(
            <Text
                key={`x_${m}`}
                style={{
                    position: 'absolute',
                    left: toX(m) - 10,
                    top: CHART_HEIGHT - 18,
                    fontSize: 9,
                    color: '#666',
                    width: 20,
                    textAlign: 'center',
                }}
            >
                {m}mo
            </Text>
        );
    }

    // Render baby's data points
    const dataPoints = entries
        .map(e => {
            const val = metric === 'weight' ? e.weight : metric === 'length' ? e.length : e.head;
            if (val === undefined) return null;
            return { month: e.ageMonths + (e.ageDays % 30) / 30, val };
        })
        .filter(Boolean) as { month: number; val: number }[];

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{metaMeta.emoji} {metaMeta.label} ({metaMeta.unit})</Text>
            <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT, position: 'relative' }}>
                {/* Grid background */}
                <View style={{
                    position: 'absolute', left: CHART_PAD_LEFT, top: CHART_PAD_TOP,
                    width: PLOT_W, height: PLOT_H,
                    borderLeftWidth: 1, borderBottomWidth: 1,
                    borderColor: 'rgba(255,255,255,0.15)',
                }} />

                {/* Horizontal grid lines */}
                {[...Array(ySteps + 1)].map((_, i) => {
                    const val = yMin + ((yMax - yMin) / ySteps) * i;
                    return (
                        <View
                            key={`hg_${i}`}
                            style={{
                                position: 'absolute', left: CHART_PAD_LEFT,
                                top: toY(val), width: PLOT_W, height: 1,
                                backgroundColor: 'rgba(255,255,255,0.06)',
                            }}
                        />
                    );
                })}

                {/* Percentile bands (shaded area between p3 and p97) */}
                {data.filter(d => d.month <= displayMax).map((point, i) => {
                    if (i === 0) return null;
                    const prev = data.filter(d => d.month <= displayMax)[i - 1];
                    const x1 = toX(prev.month);
                    const x2 = toX(point.month);
                    const yTop = Math.min(toY(prev.p97), toY(point.p97));
                    const yBot = Math.max(toY(prev.p3), toY(point.p3));
                    return (
                        <View
                            key={`band_${i}`}
                            style={{
                                position: 'absolute', left: x1, top: yTop,
                                width: x2 - x1, height: yBot - yTop,
                                backgroundColor: `${metaMeta.color}10`,
                            }}
                        />
                    );
                })}

                {/* Percentile lines */}
                {renderPercentileLine('p3', '#FF5252', 0.4)}
                {renderPercentileLine('p10', '#FFD54F', 0.3)}
                {renderPercentileLine('p25', '#AED581', 0.3)}
                {renderPercentileLine('p50', metaMeta.color, 0.8)}
                {renderPercentileLine('p75', '#AED581', 0.3)}
                {renderPercentileLine('p90', '#FFD54F', 0.3)}
                {renderPercentileLine('p97', '#FF5252', 0.4)}

                {/* Percentile labels on right edge */}
                {(['p3', 'p50', 'p97'] as const).map(key => {
                    const lastVisible = data.filter(d => d.month <= displayMax).slice(-1)[0];
                    if (!lastVisible) return null;
                    const y = toY(lastVisible[key]);
                    return (
                        <Text
                            key={`label_${key}`}
                            style={{
                                position: 'absolute',
                                right: 0, top: y - 6,
                                fontSize: 8, color: key === 'p50' ? metaMeta.color : '#FF5252',
                                fontWeight: key === 'p50' ? '700' : '400',
                            }}
                        >
                            {PERCENTILE_LABELS[key]}
                        </Text>
                    );
                })}

                {/* Baby's data points */}
                {dataPoints.map((pt, i) => (
                    <View
                        key={`dp_${i}`}
                        style={{
                            position: 'absolute',
                            left: toX(pt.month) - 5,
                            top: toY(pt.val) - 5,
                            width: 10, height: 10,
                            borderRadius: 5,
                            backgroundColor: metaMeta.color,
                            borderWidth: 2, borderColor: '#fff',
                            zIndex: 10,
                        }}
                    />
                ))}

                {/* Connect data points with lines */}
                {dataPoints.map((pt, i) => {
                    if (i === 0) return null;
                    const prev = dataPoints[i - 1];
                    const x1 = toX(prev.month);
                    const y1 = toY(prev.val);
                    const x2 = toX(pt.month);
                    const y2 = toY(pt.val);
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    return (
                        <View
                            key={`line_${i}`}
                            style={{
                                position: 'absolute', left: x1, top: y1,
                                width: len, height: 2.5,
                                backgroundColor: metaMeta.color,
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                                zIndex: 5,
                            }}
                        />
                    );
                })}

                {/* Axis labels */}
                {yLabels}
                {xMonths}
            </View>
        </View>
    );
}

// ── Percentile Badge ─────────────────────────────────────────────

function PercentileBadge({ value, metric }: { value: number; metric: GrowthMetric }) {
    const interp = interpretPercentile(value);
    return (
        <View style={[styles.percentileBadge, { backgroundColor: interp.color + '25', borderColor: interp.color }]}>
            <Text style={[styles.percentileValue, { color: interp.color }]}>{interp.emoji} {value}th</Text>
            <Text style={[styles.percentileLabel, { color: interp.color }]}>{interp.label}</Text>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════

export default function GrowthTrackerScreen({ navigation }: Props) {
    // ── State ────────────────────────────────────────────────────
    const [entries, setEntries] = useState<GrowthEntry[]>([]);
    const [babySex, setBabySex] = useState<Sex>('boy');
    const [babyName, setBabyName] = useState('Baby');
    const [babyDob, setBabyDob] = useState('');
    const [activeMetric, setActiveMetric] = useState<GrowthMetric>('weight');
    const [showAddEntry, setShowAddEntry] = useState(false);
    const [showVisitPrep, setShowVisitPrep] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSexPicker, setShowSexPicker] = useState(false);

    // Add entry form
    const [entryWeight, setEntryWeight] = useState('');
    const [entryLength, setEntryLength] = useState('');
    const [entryHead, setEntryHead] = useState('');
    const [entryNote, setEntryNote] = useState('');
    const [entryMonth, setEntryMonth] = useState('');
    const [entryDay, setEntryDay] = useState('');
    const [entryYear, setEntryYear] = useState('');

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ── Load data ────────────────────────────────────────────────
    useEffect(() => {
        loadData();
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, []);

    const loadData = async () => {
        try {
            const [babyStr, growthStr, sexStr] = await Promise.all([
                AsyncStorage.getItem(BABY_KEY),
                AsyncStorage.getItem(GROWTH_KEY),
                AsyncStorage.getItem(GROWTH_SEX_KEY),
            ]);
            if (babyStr) {
                const info = JSON.parse(babyStr);
                setBabyName(info.name || 'Baby');
                setBabyDob(info.dateOfBirth || '');
            }
            if (growthStr) setEntries(JSON.parse(growthStr));
            if (sexStr) setBabySex(sexStr as Sex);
            else setShowSexPicker(true); // First time — ask sex for percentile curves
        } catch (e) {
            console.warn('Failed to load growth data:', e);
        }
    };

    // ── Baby age ─────────────────────────────────────────────────
    const babyAgeMonths = useMemo(() => {
        if (!babyDob) return 0;
        const dob = new Date(babyDob);
        const now = new Date();
        return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    }, [babyDob]);

    const babyAgeDays = useMemo(() => {
        if (!babyDob) return 0;
        return Math.floor((Date.now() - new Date(babyDob).getTime()) / 86400000);
    }, [babyDob]);

    // ── Max month for chart display ──────────────────────────────
    const maxChartMonth = useMemo(() => {
        const entryMax = entries.length > 0 ? Math.max(...entries.map(e => e.ageMonths)) : 0;
        return Math.max(entryMax + 3, babyAgeMonths + 3, 12);
    }, [entries, babyAgeMonths]);

    // ── Latest measurements & percentiles ────────────────────────
    const latestEntry = useMemo(() => entries[entries.length - 1], [entries]);

    const latestPercentiles = useMemo(() => {
        if (!latestEntry) return null;
        const result: Record<GrowthMetric, number | null> = { weight: null, length: null, head: null };
        if (latestEntry.weight) {
            result.weight = calculatePercentile(latestEntry.weight, latestEntry.ageMonths, 'weight', babySex);
        }
        if (latestEntry.length) {
            result.length = calculatePercentile(latestEntry.length, latestEntry.ageMonths, 'length', babySex);
        }
        if (latestEntry.head) {
            result.head = calculatePercentile(latestEntry.head, latestEntry.ageMonths, 'head', babySex);
        }
        return result;
    }, [latestEntry, babySex]);

    // ── Growth velocity (weight gain per month) ──────────────────
    const growthVelocity = useMemo(() => {
        if (entries.length < 2) return null;
        const sorted = [...entries].sort((a, b) => a.ageDays - b.ageDays);
        const last = sorted[sorted.length - 1];
        const prev = sorted[sorted.length - 2];
        if (!last.weight || !prev.weight) return null;
        const monthDiff = (last.ageDays - prev.ageDays) / 30.44;
        if (monthDiff < 0.1) return null;
        return {
            lbsPerMonth: (last.weight - prev.weight) / monthDiff,
            period: `Last ${Math.round(monthDiff)} month${Math.round(monthDiff) !== 1 ? 's' : ''}`,
        };
    }, [entries]);

    // ── Current growth tip ───────────────────────────────────────
    const growthTip = useMemo(() => getGrowthTipForAge(babyAgeMonths), [babyAgeMonths]);

    // ── Next well-child visit ────────────────────────────────────
    const nextVisit = useMemo(() => {
        return WELL_CHILD_VISITS.find(v => v.month >= babyAgeMonths) || WELL_CHILD_VISITS[WELL_CHILD_VISITS.length - 1];
    }, [babyAgeMonths]);

    // ── Save sex ─────────────────────────────────────────────────
    const saveSex = async (sex: Sex) => {
        setBabySex(sex);
        await AsyncStorage.setItem(GROWTH_SEX_KEY, sex);
        setShowSexPicker(false);
    };

    // ── Add entry ────────────────────────────────────────────────
    const saveEntry = useCallback(async () => {
        const m = parseInt(entryMonth, 10);
        const d = parseInt(entryDay, 10);
        const y = parseInt(entryYear, 10);
        if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 2020 || y > 2030) {
            Alert.alert('Invalid Date', 'Please enter the date of this measurement.');
            return;
        }

        const weight = entryWeight ? parseFloat(entryWeight) : undefined;
        const length = entryLength ? parseFloat(entryLength) : undefined;
        const head = entryHead ? parseFloat(entryHead) : undefined;

        if (!weight && !length && !head) {
            Alert.alert('No Measurements', 'Please enter at least one measurement (weight, length, or head).');
            return;
        }

        // Validate ranges
        if (weight !== undefined && (weight < 1 || weight > 80)) {
            Alert.alert('Check Weight', 'Weight should be between 1–80 lbs. Did you enter correctly?');
            return;
        }
        if (length !== undefined && (length < 10 || length > 50)) {
            Alert.alert('Check Length', 'Length should be between 10–50 inches. Did you enter correctly?');
            return;
        }
        if (head !== undefined && (head < 10 || head > 25)) {
            Alert.alert('Check Head', 'Head circumference should be between 10–25 inches. Did you enter correctly?');
            return;
        }

        const measureDate = new Date(y, m - 1, d);
        const dobDate = babyDob ? new Date(babyDob) : new Date();
        const ageDays = Math.max(0, Math.floor((measureDate.getTime() - dobDate.getTime()) / 86400000));
        const ageMonths = Math.floor(ageDays / 30.44);

        const entry: GrowthEntry = {
            id: `growth_${Date.now()}`,
            date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            ageMonths,
            ageDays,
            weight,
            length,
            head,
            note: entryNote.trim() || undefined,
        };

        const updated = [...entries, entry].sort((a, b) => a.ageDays - b.ageDays);
        setEntries(updated);
        await AsyncStorage.setItem(GROWTH_KEY, JSON.stringify(updated));

        // Reset form
        setEntryWeight('');
        setEntryLength('');
        setEntryHead('');
        setEntryNote('');
        setEntryMonth('');
        setEntryDay('');
        setEntryYear('');
        setShowAddEntry(false);

        // Show percentile feedback
        if (weight) {
            const pct = calculatePercentile(weight, ageMonths, 'weight', babySex);
            const interp = interpretPercentile(pct);
            Alert.alert(
                `${interp.emoji} Weight: ${pct}th Percentile`,
                `${babyName} is at the ${pct}th percentile for weight.\n\n${interp.description}`,
                [{ text: 'Great!', style: 'default' }]
            );
        }
    }, [entryMonth, entryDay, entryYear, entryWeight, entryLength, entryHead, entryNote, entries, babyDob, babySex, babyName]);

    // ── Delete entry ─────────────────────────────────────────────
    const deleteEntry = useCallback(async (id: string) => {
        Alert.alert('Delete Measurement?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const updated = entries.filter(e => e.id !== id);
                    setEntries(updated);
                    await AsyncStorage.setItem(GROWTH_KEY, JSON.stringify(updated));
                }
            },
        ]);
    }, [entries]);

    // ── Generate visit prep summary ──────────────────────────────
    const visitPrepSummary = useMemo(() => {
        if (entries.length === 0) return 'No measurements recorded yet. Start tracking to generate a visit summary!';

        const sorted = [...entries].sort((a, b) => a.ageDays - b.ageDays);
        const latest = sorted[sorted.length - 1];
        const lines: string[] = [];

        lines.push(`📋 VISIT PREP FOR ${babyName.toUpperCase()}`);
        lines.push(`📅 As of: ${new Date().toLocaleDateString()}`);
        lines.push(`👶 Age: ${babyAgeMonths} months (${babySex === 'boy' ? 'Boy' : 'Girl'})`);
        lines.push('');

        if (latest.weight) {
            const pct = calculatePercentile(latest.weight, latest.ageMonths, 'weight', babySex);
            lines.push(`⚖️ Weight: ${latest.weight} lbs (${pct}th percentile)`);
        }
        if (latest.length) {
            const pct = calculatePercentile(latest.length, latest.ageMonths, 'length', babySex);
            lines.push(`📏 Length: ${latest.length} in (${pct}th percentile)`);
        }
        if (latest.head) {
            const pct = calculatePercentile(latest.head, latest.ageMonths, 'head', babySex);
            lines.push(`🧠 Head: ${latest.head} in (${pct}th percentile)`);
        }

        if (growthVelocity) {
            lines.push('');
            lines.push(`📈 Growth Rate: ${growthVelocity.lbsPerMonth > 0 ? '+' : ''}${growthVelocity.lbsPerMonth.toFixed(1)} lbs/month (${growthVelocity.period})`);
        }

        lines.push('');
        lines.push(`📊 Total Measurements Logged: ${entries.length}`);
        lines.push(`📅 Last Measured: ${new Date(latest.date).toLocaleDateString()}`);

        // Any concerns
        const concerns: string[] = [];
        if (latest.weight) {
            const pct = calculatePercentile(latest.weight, latest.ageMonths, 'weight', babySex);
            if (pct < 3 || pct > 97) concerns.push(`Weight is at ${pct}th percentile`);
        }
        if (latest.head) {
            const pct = calculatePercentile(latest.head, latest.ageMonths, 'head', babySex);
            if (pct < 3 || pct > 97) concerns.push(`Head circumference is at ${pct}th percentile`);
        }
        if (concerns.length > 0) {
            lines.push('');
            lines.push('⚠️ ITEMS TO DISCUSS:');
            concerns.forEach(c => lines.push(`  • ${c}`));
        }

        return lines.join('\n');
    }, [entries, babyName, babyAgeMonths, babySex, growthVelocity]);

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ── HERO ─────────────────────────────────────────── */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <LinearGradient colors={['#1a237e', '#283593', '#3949ab']} style={styles.heroGradient}>
                        <View style={styles.heroTop}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.heroTitle}>📈 {babyName}'s Growth</Text>
                                <Text style={styles.heroSubtitle}>
                                    {babySex === 'boy' ? '👦' : '👧'} {babySex === 'boy' ? 'Boy' : 'Girl'} • {babyAgeMonths} months old
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowSexPicker(true)} style={styles.sexToggle}>
                                <Text style={styles.sexToggleText}>{babySex === 'boy' ? '👦' : '👧'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Latest percentiles summary */}
                        {latestPercentiles && (
                            <View style={styles.percentileRow}>
                                {latestPercentiles.weight !== null && (
                                    <PercentileBadge value={latestPercentiles.weight} metric="weight" />
                                )}
                                {latestPercentiles.length !== null && (
                                    <PercentileBadge value={latestPercentiles.length} metric="length" />
                                )}
                                {latestPercentiles.head !== null && (
                                    <PercentileBadge value={latestPercentiles.head} metric="head" />
                                )}
                            </View>
                        )}

                        {/* Growth velocity */}
                        {growthVelocity && (
                            <View style={styles.velocityBox}>
                                <Text style={styles.velocityText}>
                                    📈 {growthVelocity.lbsPerMonth > 0 ? '+' : ''}{growthVelocity.lbsPerMonth.toFixed(1)} lbs/month
                                </Text>
                                <Text style={styles.velocityPeriod}>{growthVelocity.period}</Text>
                            </View>
                        )}

                        {/* Add measurement button */}
                        <TouchableOpacity style={styles.addButton} onPress={() => {
                            const now = new Date();
                            setEntryMonth(String(now.getMonth() + 1));
                            setEntryDay(String(now.getDate()));
                            setEntryYear(String(now.getFullYear()));
                            setShowAddEntry(true);
                        }}>
                            <Text style={styles.addButtonText}>+ Add New Measurement</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* ── METRIC TABS ───────────────────────────────────── */}
                <View style={styles.tabRow}>
                    {(['weight', 'length', 'head'] as GrowthMetric[]).map(metric => {
                        const meta = METRIC_META[metric];
                        const isActive = activeMetric === metric;
                        return (
                            <TouchableOpacity
                                key={metric}
                                style={[styles.tab, isActive && { backgroundColor: meta.color + '30', borderColor: meta.color }]}
                                onPress={() => setActiveMetric(metric)}
                            >
                                <Text style={[styles.tabText, isActive && { color: meta.color }]}>
                                    {meta.emoji} {meta.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── GROWTH CHART ──────────────────────────────────── */}
                <GrowthChart
                    metric={activeMetric}
                    sex={babySex}
                    entries={entries}
                    maxMonth={maxChartMonth}
                />

                {/* Chart legend */}
                <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: METRIC_META[activeMetric].color }]} />
                        <Text style={styles.legendText}>{babyName}'s measurements</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendLine, { backgroundColor: METRIC_META[activeMetric].color, opacity: 0.5 }]} />
                        <Text style={styles.legendText}>50th percentile (median)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendLine, { backgroundColor: '#FF5252', opacity: 0.4 }]} />
                        <Text style={styles.legendText}>3rd / 97th percentile</Text>
                    </View>
                </View>

                {/* ── WHAT PERCENTILES MEAN ─────────────────────────── */}
                <TouchableOpacity
                    style={styles.infoCard}
                    onPress={() => Alert.alert(
                        '📊 Understanding Percentiles',
                        'Percentiles compare your baby to other babies of the same age and sex.\n\n'
                        + '• 50th percentile = average\n'
                        + '• 25th-75th = typical range\n'
                        + '• Below 3rd or above 97th = discuss with pediatrician\n\n'
                        + '📌 IMPORTANT: A lower or higher percentile is NOT automatically bad. What matters most is that your baby follows a CONSISTENT growth curve.\n\n'
                        + '📉 Crossing percentile lines (jumping from 75th to 25th) is more concerning than being at a low or high percentile consistently.\n\n'
                        + '🧬 Genetics play a huge role — tall parents tend to have tall babies!\n\n'
                        + 'Source: CDC, WHO, AAP',
                        [{ text: 'Got It!', style: 'default' }]
                    )}
                >
                    <Text style={styles.infoCardText}>📊 What Do Percentiles Mean? → Tap to Learn</Text>
                </TouchableOpacity>

                {/* ── GROWTH TIP ────────────────────────────────────── */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipHeader}>🍼 Feeding & Growth Tip</Text>
                    <Text style={styles.tipText}>{growthTip.tip}</Text>
                    <Text style={styles.tipSource}>Source: {growthTip.source}</Text>
                </View>

                {/* ── NEXT WELL-CHILD VISIT ─────────────────────────── */}
                {nextVisit && (
                    <View style={styles.visitCard}>
                        <Text style={styles.visitHeader}>🩺 Next Well-Child Visit</Text>
                        <Text style={styles.visitTitle}>{nextVisit.label}</Text>
                        <Text style={styles.visitMeasurements}>{nextVisit.measurements}</Text>
                        <TouchableOpacity
                            style={styles.visitPrepBtn}
                            onPress={() => setShowVisitPrep(true)}
                        >
                            <Text style={styles.visitPrepBtnText}>📋 Generate Visit Prep Sheet</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── MEASUREMENT HISTORY ───────────────────────────── */}
                <View style={{ marginHorizontal: 16, marginTop: 16 }}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => setShowHistory(!showHistory)}
                    >
                        <Text style={styles.sectionLabel}>📋 Measurement History ({entries.length})</Text>
                        <Text style={styles.sectionArrow}>{showHistory ? '▼' : '▶'}</Text>
                    </TouchableOpacity>

                    {showHistory && entries.length === 0 && (
                        <Text style={styles.emptyText}>No measurements yet. Tap "Add New Measurement" above to start!</Text>
                    )}

                    {showHistory && [...entries].reverse().map(entry => {
                        const weightPct = entry.weight ? calculatePercentile(entry.weight, entry.ageMonths, 'weight', babySex) : null;
                        const lengthPct = entry.length ? calculatePercentile(entry.length, entry.ageMonths, 'length', babySex) : null;
                        const headPct = entry.head ? calculatePercentile(entry.head, entry.ageMonths, 'head', babySex) : null;
                        return (
                            <View key={entry.id} style={styles.historyRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyDate}>
                                        {new Date(entry.date).toLocaleDateString()} — {entry.ageMonths} months
                                    </Text>
                                    <View style={styles.historyMeasurements}>
                                        {entry.weight && (
                                            <Text style={styles.historyValue}>⚖️ {entry.weight} lbs ({weightPct}th)</Text>
                                        )}
                                        {entry.length && (
                                            <Text style={styles.historyValue}>📏 {entry.length} in ({lengthPct}th)</Text>
                                        )}
                                        {entry.head && (
                                            <Text style={styles.historyValue}>🧠 {entry.head} in ({headPct}th)</Text>
                                        )}
                                    </View>
                                    {entry.note && <Text style={styles.historyNote}>📝 {entry.note}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => deleteEntry(entry.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Text style={{ color: '#FF5252', fontSize: 16 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                {/* ── WELL-CHILD VISIT SCHEDULE ─────────────────────── */}
                <View style={{ marginHorizontal: 16, marginTop: 20 }}>
                    <Text style={styles.sectionLabel}>🗓️ AAP Well-Child Visit Schedule</Text>
                    {WELL_CHILD_VISITS.map(visit => {
                        const isPast = babyAgeMonths > visit.month;
                        const isCurrent = visit === nextVisit;
                        return (
                            <View key={visit.month} style={[styles.visitRow, isCurrent && styles.visitRowCurrent]}>
                                <View style={[styles.visitDot, {
                                    backgroundColor: isPast ? '#4CAF50' : isCurrent ? '#FFD700' : 'rgba(255,255,255,0.2)',
                                }]}>
                                    <Text style={{ fontSize: 10, color: '#fff' }}>{isPast ? '✓' : ''}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.visitRowLabel, isPast && { color: '#888' }]}>{visit.label}</Text>
                                    <Text style={styles.visitRowMeasurements}>{visit.measurements}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ── DISCLAIMER ────────────────────────────────────── */}
                <View style={styles.disclaimer}>
                    <View style={{ backgroundColor: 'rgba(26,35,126,0.15)', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: 'rgba(130,177,255,0.2)' }}>
                        <Text style={{ color: '#82b1ff', fontWeight: '800', fontSize: 13, marginBottom: 6 }}>
                            ⚕️ MEDICAL DISCLAIMER
                        </Text>
                        <Text style={styles.disclaimerText}>
                            Growth data based on CDC Clinical Growth Charts (2000) and WHO Child Growth Standards (2006).
                            This growth tracker is an educational tool designed to support — not replace — the guidance of qualified healthcare professionals.
                        </Text>
                        <Text style={{ color: '#e0e0e0', fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 8 }}>
                            ⚠️ This app does not provide medical diagnoses, treatment plans, or prescriptions.
                        </Text>
                        <Text style={[styles.disclaimerText, { marginTop: 6 }]}>
                            Percentile values are general population references. Your child's individual growth pattern should be interpreted by your pediatrician who knows your child's full health history, genetics, and feeding patterns.
                        </Text>
                        <Text style={{ color: '#e0e0e0', fontSize: 11, lineHeight: 17, fontWeight: '600', marginTop: 6 }}>
                            A lower or higher percentile is NOT automatically concerning — consistency along a growth curve matters more than the number itself.
                        </Text>
                        <Text style={{ color: '#ff8a80', fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 8 }}>
                            Always discuss growth concerns with your pediatrician. In a medical emergency, call 911.
                        </Text>
                    </View>
                    <Text style={[styles.disclaimerText, { marginTop: 12, textAlign: 'center' }]}>
                        Trusted sources: CDC • WHO • AAP Bright Futures • HealthyChildren.org
                    </Text>
                </View>
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ADD ENTRY MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={showAddEntry} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>📊 New Measurement</Text>
                            <Text style={styles.modalDesc}>Enter the measurements from your latest checkup or home measurement.</Text>

                            {/* Date */}
                            <Text style={styles.inputLabel}>📅 Date of Measurement</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM" placeholderTextColor="#666"
                                    value={entryMonth} onChangeText={setEntryMonth} keyboardType="number-pad" maxLength={2} />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="DD" placeholderTextColor="#666"
                                    value={entryDay} onChangeText={setEntryDay} keyboardType="number-pad" maxLength={2} />
                                <TextInput style={[styles.input, { flex: 2 }]} placeholder="YYYY" placeholderTextColor="#666"
                                    value={entryYear} onChangeText={setEntryYear} keyboardType="number-pad" maxLength={4} />
                            </View>

                            {/* Weight */}
                            <Text style={styles.inputLabel}>⚖️ Weight (lbs)</Text>
                            <TextInput style={styles.input} placeholder="e.g., 14.5" placeholderTextColor="#666"
                                value={entryWeight} onChangeText={setEntryWeight} keyboardType="decimal-pad" />

                            {/* Length */}
                            <Text style={styles.inputLabel}>📏 Length/Height (inches)</Text>
                            <TextInput style={styles.input} placeholder="e.g., 24.5" placeholderTextColor="#666"
                                value={entryLength} onChangeText={setEntryLength} keyboardType="decimal-pad" />

                            {/* Head */}
                            <Text style={styles.inputLabel}>🧠 Head Circumference (inches)</Text>
                            <TextInput style={styles.input} placeholder="e.g., 16.0" placeholderTextColor="#666"
                                value={entryHead} onChangeText={setEntryHead} keyboardType="decimal-pad" />

                            {/* Note */}
                            <Text style={styles.inputLabel}>📝 Note (optional)</Text>
                            <TextInput style={[styles.input, { minHeight: 60 }]} placeholder="e.g., 4-month checkup"
                                placeholderTextColor="#666" value={entryNote} onChangeText={setEntryNote} multiline />

                            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
                                <Text style={styles.saveButtonText}>💾 Save Measurement</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddEntry(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* VISIT PREP MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={showVisitPrep} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>📋 Visit Prep Sheet</Text>
                            <Text style={[styles.modalDesc, { marginBottom: 16 }]}>
                                Show this summary to your pediatrician at your next visit.
                            </Text>

                            <View style={styles.prepSheet}>
                                <Text style={styles.prepText}>{visitPrepSummary}</Text>
                            </View>

                            <Text style={[styles.modalDesc, { marginTop: 12, fontStyle: 'italic', textAlign: 'center' }]}>
                                💡 Tip: Screenshot this page to have it ready at your appointment!
                            </Text>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowVisitPrep(false)}>
                                <Text style={styles.cancelButtonText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SEX PICKER MODAL */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal visible={showSexPicker} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: SH * 0.4 }]}>
                        <Text style={styles.modalTitle}>👶 Choose Growth Chart</Text>
                        <Text style={styles.modalDesc}>
                            CDC/WHO growth charts differ for boys and girls. Select to show the correct percentile curves.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 20, justifyContent: 'center' }}>
                            <TouchableOpacity
                                style={[styles.sexOption, babySex === 'boy' && styles.sexOptionActive]}
                                onPress={() => saveSex('boy')}
                            >
                                <Text style={{ fontSize: 48 }}>👦</Text>
                                <Text style={styles.sexOptionLabel}>Boy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sexOption, babySex === 'girl' && styles.sexOptionActive]}
                                onPress={() => saveSex('girl')}
                            >
                                <Text style={{ fontSize: 48 }}>👧</Text>
                                <Text style={styles.sexOptionLabel}>Girl</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroGradient: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 10, paddingBottom: 16 },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
    heroSubtitle: { fontSize: 15, color: '#b3c6e6', marginTop: 2, fontWeight: '600' },
    sexToggle: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
    sexToggleText: { fontSize: 22 },

    percentileRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
    percentileBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 4 },
    percentileValue: { fontSize: 14, fontWeight: '800' },
    percentileLabel: { fontSize: 11, fontWeight: '600' },

    velocityBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 8, marginBottom: 12 },
    velocityText: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
    velocityPeriod: { fontSize: 12, color: '#888' },

    addButton: { backgroundColor: '#4CAF50', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    // Tabs
    tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
    tabText: { fontSize: 11, fontWeight: '700', color: '#888' },

    // Chart
    chartContainer: { marginHorizontal: 16, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    chartTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
    chartLegend: { marginHorizontal: 16, marginTop: 8, gap: 4 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendLine: { width: 16, height: 2, borderRadius: 1 },
    legendText: { fontSize: 11, color: '#666' },

    // Info card
    infoCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#1a237e', borderRadius: 12, padding: 14 },
    infoCardText: { fontSize: 13, color: '#82b1ff', fontWeight: '700', textAlign: 'center' },

    // Tip
    tipCard: { margin: 16, backgroundColor: '#1a3a2a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2d6a4f' },
    tipHeader: { fontSize: 14, fontWeight: '800', color: '#4CAF50', marginBottom: 6 },
    tipText: { fontSize: 14, color: '#e0e0e0', lineHeight: 22 },
    tipSource: { fontSize: 11, color: '#888', marginTop: 6, fontStyle: 'italic' },

    // Visit card
    visitCard: { margin: 16, backgroundColor: '#162447', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1f4068' },
    visitHeader: { fontSize: 12, fontWeight: '700', color: '#82b1ff', marginBottom: 4 },
    visitTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
    visitMeasurements: { fontSize: 13, color: '#a0a0a0', marginBottom: 12 },
    visitPrepBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, alignItems: 'center' },
    visitPrepBtnText: { fontSize: 14, fontWeight: '700', color: '#FFD700' },

    // Section
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionLabel: { fontSize: 16, fontWeight: '800', color: '#fff' },
    sectionArrow: { fontSize: 14, color: '#888' },
    emptyText: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 20 },

    // History
    historyRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    historyDate: { fontSize: 13, fontWeight: '700', color: '#a0a0a0' },
    historyMeasurements: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    historyValue: { fontSize: 13, color: '#fff', fontWeight: '600' },
    historyNote: { fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' },

    // Visit schedule
    visitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    visitRowCurrent: { backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 10, paddingHorizontal: 10, marginHorizontal: -10 },
    visitDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    visitRowLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
    visitRowMeasurements: { fontSize: 11, color: '#888', marginTop: 2 },

    // Disclaimer
    disclaimer: { margin: 16, marginTop: 24 },
    disclaimerText: { fontSize: 12, color: '#555', lineHeight: 18, fontStyle: 'italic' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, maxHeight: SH * 0.85, paddingBottom: 40,
    },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 4 },
    modalDesc: { fontSize: 14, color: '#a0a0a0', textAlign: 'center', lineHeight: 20, marginTop: 4 },

    inputLabel: { color: '#a0a0a0', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 14,
        color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },

    saveButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    cancelButton: { alignSelf: 'center', marginTop: 12, paddingVertical: 12, paddingHorizontal: 30 },
    cancelButtonText: { color: '#888', fontSize: 15, fontWeight: '600' },

    // Prep sheet
    prepSheet: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    prepText: { fontSize: 13, color: '#e0e0e0', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    // Sex picker
    sexOption: {
        width: 120, height: 130, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
    },
    sexOptionActive: { borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.15)' },
    sexOptionLabel: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 8 },
});
