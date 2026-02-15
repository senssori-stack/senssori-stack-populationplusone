// src/data/growth-chart-data.ts
// ═══════════════════════════════════════════════════════════════════
// CDC/WHO Growth Percentile Data (Birth → 36 months)
// Sources: CDC Growth Charts (2000), WHO Child Growth Standards (2006)
// LMS parameters simplified to key percentile values
// ═══════════════════════════════════════════════════════════════════

export type GrowthMetric = 'weight' | 'length' | 'head';
export type Sex = 'boy' | 'girl';

export interface GrowthEntry {
    id: string;
    date: string;       // ISO date of measurement
    ageMonths: number;   // Calculated from DOB
    ageDays: number;
    weight?: number;     // pounds
    length?: number;     // inches
    head?: number;       // inches (head circumference)
    note?: string;       // e.g., "2-month checkup"
}

export interface PercentilePoint {
    month: number;
    p3: number;
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p97: number;
}

// ── METRIC METADATA ──────────────────────────────────────────────

export const METRIC_META: Record<GrowthMetric, {
    label: string;
    unit: string;
    emoji: string;
    color: string;
    colorLight: string;
    description: string;
}> = {
    weight: {
        label: 'Weight',
        unit: 'lbs',
        emoji: '⚖️',
        color: '#4ECDC4',
        colorLight: '#4ECDC430',
        description: 'Track weight gain over time',
    },
    length: {
        label: 'Length/Height',
        unit: 'in',
        emoji: '📏',
        color: '#FF6B6B',
        colorLight: '#FF6B6B30',
        description: 'Track length (lying) or height (standing)',
    },
    head: {
        label: 'Head Circumference',
        unit: 'in',
        emoji: '🧠',
        color: '#A78BFA',
        colorLight: '#A78BFA30',
        description: 'Important indicator of brain growth',
    },
};

// ── PERCENTILE LINE COLORS ───────────────────────────────────────

export const PERCENTILE_COLORS: Record<string, string> = {
    p3: '#FF5252',   // Concern zone
    p5: '#FF8A65',
    p10: '#FFD54F',
    p25: '#AED581',
    p50: '#4CAF50',  // Median — bold
    p75: '#AED581',
    p90: '#FFD54F',
    p95: '#FF8A65',
    p97: '#FF5252',  // High concern
};

export const PERCENTILE_LABELS: Record<string, string> = {
    p3: '3rd',
    p5: '5th',
    p10: '10th',
    p25: '25th',
    p50: '50th',
    p75: '75th',
    p90: '90th',
    p95: '95th',
    p97: '97th',
};

// ═══════════════════════════════════════════════════════════════════
// CDC/WHO WEIGHT-FOR-AGE DATA (pounds, 0-36 months)
// Source: CDC Clinical Growth Charts, published 2000, revised 2010
// These are smoothed percentile values at each month
// ═══════════════════════════════════════════════════════════════════

export const WEIGHT_BOYS: PercentilePoint[] = [
    { month: 0, p3: 5.3, p5: 5.5, p10: 5.9, p25: 6.5, p50: 7.2, p75: 7.9, p90: 8.6, p95: 9.0, p97: 9.3 },
    { month: 1, p3: 7.0, p5: 7.3, p10: 7.8, p25: 8.6, p50: 9.6, p75: 10.6, p90: 11.5, p95: 12.1, p97: 12.5 },
    { month: 2, p3: 8.8, p5: 9.2, p10: 9.8, p25: 10.8, p50: 11.9, p75: 13.1, p90: 14.2, p95: 14.9, p97: 15.4 },
    { month: 3, p3: 10.1, p5: 10.6, p10: 11.2, p25: 12.4, p50: 13.7, p75: 15.0, p90: 16.2, p95: 17.0, p97: 17.5 },
    { month: 4, p3: 11.2, p5: 11.7, p10: 12.4, p25: 13.6, p50: 15.0, p75: 16.5, p90: 17.8, p95: 18.7, p97: 19.2 },
    { month: 5, p3: 12.0, p5: 12.6, p10: 13.3, p25: 14.7, p50: 16.1, p75: 17.7, p90: 19.2, p95: 20.1, p97: 20.7 },
    { month: 6, p3: 12.7, p5: 13.3, p10: 14.1, p25: 15.5, p50: 17.1, p75: 18.8, p90: 20.3, p95: 21.3, p97: 21.9 },
    { month: 7, p3: 13.3, p5: 13.9, p10: 14.7, p25: 16.2, p50: 17.9, p75: 19.6, p90: 21.2, p95: 22.3, p97: 22.9 },
    { month: 8, p3: 13.8, p5: 14.4, p10: 15.3, p25: 16.8, p50: 18.6, p75: 20.4, p90: 22.1, p95: 23.2, p97: 23.8 },
    { month: 9, p3: 14.2, p5: 14.9, p10: 15.8, p25: 17.4, p50: 19.2, p75: 21.1, p90: 22.8, p95: 23.9, p97: 24.6 },
    { month: 10, p3: 14.6, p5: 15.3, p10: 16.2, p25: 17.9, p50: 19.7, p75: 21.7, p90: 23.5, p95: 24.6, p97: 25.3 },
    { month: 11, p3: 15.0, p5: 15.7, p10: 16.6, p25: 18.3, p50: 20.2, p75: 22.2, p90: 24.1, p95: 25.3, p97: 26.0 },
    { month: 12, p3: 15.3, p5: 16.0, p10: 17.0, p25: 18.8, p50: 20.7, p75: 22.8, p90: 24.7, p95: 25.9, p97: 26.6 },
    { month: 15, p3: 16.2, p5: 17.0, p10: 18.0, p25: 19.9, p50: 22.0, p75: 24.2, p90: 26.3, p95: 27.6, p97: 28.4 },
    { month: 18, p3: 17.0, p5: 17.8, p10: 18.9, p25: 21.0, p50: 23.2, p75: 25.5, p90: 27.8, p95: 29.2, p97: 30.0 },
    { month: 21, p3: 17.8, p5: 18.6, p10: 19.8, p25: 22.0, p50: 24.3, p75: 26.8, p90: 29.2, p95: 30.7, p97: 31.6 },
    { month: 24, p3: 18.5, p5: 19.4, p10: 20.7, p25: 23.0, p50: 25.4, p75: 28.0, p90: 30.5, p95: 32.1, p97: 33.1 },
    { month: 27, p3: 19.3, p5: 20.2, p10: 21.5, p25: 23.9, p50: 26.5, p75: 29.2, p90: 31.9, p95: 33.5, p97: 34.5 },
    { month: 30, p3: 20.0, p5: 20.9, p10: 22.3, p25: 24.8, p50: 27.5, p75: 30.3, p90: 33.2, p95: 34.9, p97: 35.9 },
    { month: 33, p3: 20.7, p5: 21.7, p10: 23.1, p25: 25.7, p50: 28.5, p75: 31.5, p90: 34.4, p95: 36.2, p97: 37.3 },
    { month: 36, p3: 21.4, p5: 22.4, p10: 23.9, p25: 26.6, p50: 29.5, p75: 32.6, p90: 35.7, p95: 37.5, p97: 38.7 },
];

export const WEIGHT_GIRLS: PercentilePoint[] = [
    { month: 0, p3: 5.0, p5: 5.2, p10: 5.5, p25: 6.1, p50: 6.8, p75: 7.5, p90: 8.1, p95: 8.5, p97: 8.8 },
    { month: 1, p3: 6.4, p5: 6.7, p10: 7.1, p25: 7.9, p50: 8.8, p75: 9.7, p90: 10.6, p95: 11.1, p97: 11.5 },
    { month: 2, p3: 7.7, p5: 8.1, p10: 8.6, p25: 9.5, p50: 10.6, p75: 11.8, p90: 12.8, p95: 13.5, p97: 13.9 },
    { month: 3, p3: 8.8, p5: 9.2, p10: 9.8, p25: 10.8, p50: 12.1, p75: 13.4, p90: 14.6, p95: 15.3, p97: 15.8 },
    { month: 4, p3: 9.7, p5: 10.1, p10: 10.8, p25: 11.9, p50: 13.2, p75: 14.7, p90: 16.0, p95: 16.8, p97: 17.3 },
    { month: 5, p3: 10.4, p5: 10.9, p10: 11.6, p25: 12.8, p50: 14.2, p75: 15.8, p90: 17.1, p95: 18.0, p97: 18.6 },
    { month: 6, p3: 11.0, p5: 11.5, p10: 12.2, p25: 13.5, p50: 15.0, p75: 16.7, p90: 18.1, p95: 19.0, p97: 19.6 },
    { month: 7, p3: 11.5, p5: 12.0, p10: 12.8, p25: 14.1, p50: 15.7, p75: 17.4, p90: 18.9, p95: 19.9, p97: 20.5 },
    { month: 8, p3: 11.9, p5: 12.5, p10: 13.3, p25: 14.7, p50: 16.3, p75: 18.1, p90: 19.7, p95: 20.7, p97: 21.3 },
    { month: 9, p3: 12.3, p5: 12.9, p10: 13.7, p25: 15.2, p50: 16.9, p75: 18.7, p90: 20.3, p95: 21.4, p97: 22.0 },
    { month: 10, p3: 12.7, p5: 13.3, p10: 14.1, p25: 15.6, p50: 17.4, p75: 19.3, p90: 20.9, p95: 22.0, p97: 22.7 },
    { month: 11, p3: 13.0, p5: 13.6, p10: 14.5, p25: 16.1, p50: 17.9, p75: 19.8, p90: 21.5, p95: 22.6, p97: 23.3 },
    { month: 12, p3: 13.3, p5: 14.0, p10: 14.9, p25: 16.5, p50: 18.3, p75: 20.3, p90: 22.1, p95: 23.2, p97: 23.9 },
    { month: 15, p3: 14.2, p5: 14.9, p10: 15.8, p25: 17.6, p50: 19.5, p75: 21.7, p90: 23.6, p95: 24.8, p97: 25.6 },
    { month: 18, p3: 15.0, p5: 15.7, p10: 16.7, p25: 18.6, p50: 20.7, p75: 23.0, p90: 25.1, p95: 26.3, p97: 27.2 },
    { month: 21, p3: 15.8, p5: 16.5, p10: 17.6, p25: 19.6, p50: 21.8, p75: 24.3, p90: 26.5, p95: 27.8, p97: 28.7 },
    { month: 24, p3: 16.5, p5: 17.3, p10: 18.5, p25: 20.6, p50: 22.9, p75: 25.5, p90: 27.8, p95: 29.3, p97: 30.2 },
    { month: 27, p3: 17.2, p5: 18.1, p10: 19.3, p25: 21.5, p50: 24.0, p75: 26.7, p90: 29.2, p95: 30.7, p97: 31.7 },
    { month: 30, p3: 17.9, p5: 18.8, p10: 20.1, p25: 22.4, p50: 25.0, p75: 27.9, p90: 30.5, p95: 32.1, p97: 33.1 },
    { month: 33, p3: 18.6, p5: 19.5, p10: 20.9, p25: 23.3, p50: 26.0, p75: 29.0, p90: 31.8, p95: 33.5, p97: 34.5 },
    { month: 36, p3: 19.3, p5: 20.3, p10: 21.7, p25: 24.2, p50: 27.1, p75: 30.2, p90: 33.1, p95: 34.8, p97: 35.9 },
];

// ═══════════════════════════════════════════════════════════════════
// CDC/WHO LENGTH/HEIGHT-FOR-AGE DATA (inches, 0-36 months)
// ═══════════════════════════════════════════════════════════════════

export const LENGTH_BOYS: PercentilePoint[] = [
    { month: 0, p3: 17.9, p5: 18.1, p10: 18.5, p25: 19.1, p50: 19.7, p75: 20.3, p90: 20.9, p95: 21.3, p97: 21.5 },
    { month: 1, p3: 19.4, p5: 19.6, p10: 20.0, p25: 20.7, p50: 21.4, p75: 22.1, p90: 22.7, p95: 23.1, p97: 23.3 },
    { month: 2, p3: 20.7, p5: 21.0, p10: 21.4, p25: 22.1, p50: 22.8, p75: 23.6, p90: 24.2, p95: 24.6, p97: 24.9 },
    { month: 3, p3: 21.8, p5: 22.1, p10: 22.5, p25: 23.3, p50: 24.0, p75: 24.8, p90: 25.5, p95: 25.9, p97: 26.2 },
    { month: 4, p3: 22.7, p5: 23.0, p10: 23.4, p25: 24.2, p50: 25.0, p75: 25.8, p90: 26.5, p95: 26.9, p97: 27.2 },
    { month: 5, p3: 23.4, p5: 23.7, p10: 24.2, p25: 25.0, p50: 25.8, p75: 26.6, p90: 27.4, p95: 27.8, p97: 28.1 },
    { month: 6, p3: 24.0, p5: 24.3, p10: 24.8, p25: 25.6, p50: 26.5, p75: 27.3, p90: 28.1, p95: 28.5, p97: 28.8 },
    { month: 7, p3: 24.5, p5: 24.8, p10: 25.3, p25: 26.2, p50: 27.0, p75: 27.9, p90: 28.7, p95: 29.1, p97: 29.4 },
    { month: 8, p3: 25.0, p5: 25.3, p10: 25.8, p25: 26.6, p50: 27.5, p75: 28.4, p90: 29.2, p95: 29.7, p97: 30.0 },
    { month: 9, p3: 25.4, p5: 25.7, p10: 26.2, p25: 27.1, p50: 28.0, p75: 28.9, p90: 29.7, p95: 30.2, p97: 30.5 },
    { month: 10, p3: 25.8, p5: 26.1, p10: 26.6, p25: 27.5, p50: 28.4, p75: 29.3, p90: 30.1, p95: 30.6, p97: 30.9 },
    { month: 11, p3: 26.1, p5: 26.4, p10: 27.0, p25: 27.9, p50: 28.8, p75: 29.7, p90: 30.5, p95: 31.0, p97: 31.4 },
    { month: 12, p3: 26.5, p5: 26.8, p10: 27.3, p25: 28.2, p50: 29.2, p75: 30.1, p90: 31.0, p95: 31.5, p97: 31.8 },
    { month: 15, p3: 27.4, p5: 27.7, p10: 28.3, p25: 29.2, p50: 30.2, p75: 31.2, p90: 32.1, p95: 32.7, p97: 33.0 },
    { month: 18, p3: 28.2, p5: 28.6, p10: 29.2, p25: 30.2, p50: 31.2, p75: 32.2, p90: 33.2, p95: 33.7, p97: 34.1 },
    { month: 21, p3: 29.0, p5: 29.4, p10: 30.0, p25: 31.0, p50: 32.1, p75: 33.2, p90: 34.2, p95: 34.7, p97: 35.1 },
    { month: 24, p3: 29.8, p5: 30.2, p10: 30.8, p25: 31.9, p50: 33.0, p75: 34.1, p90: 35.1, p95: 35.7, p97: 36.1 },
    { month: 27, p3: 30.5, p5: 30.9, p10: 31.6, p25: 32.7, p50: 33.8, p75: 35.0, p90: 36.0, p95: 36.6, p97: 37.0 },
    { month: 30, p3: 31.1, p5: 31.6, p10: 32.3, p25: 33.4, p50: 34.6, p75: 35.8, p90: 36.9, p95: 37.5, p97: 37.9 },
    { month: 33, p3: 31.8, p5: 32.2, p10: 32.9, p25: 34.1, p50: 35.4, p75: 36.6, p90: 37.7, p95: 38.3, p97: 38.7 },
    { month: 36, p3: 32.4, p5: 32.8, p10: 33.6, p25: 34.8, p50: 36.1, p75: 37.3, p90: 38.5, p95: 39.1, p97: 39.5 },
];

export const LENGTH_GIRLS: PercentilePoint[] = [
    { month: 0, p3: 17.5, p5: 17.7, p10: 18.1, p25: 18.6, p50: 19.3, p75: 19.8, p90: 20.4, p95: 20.8, p97: 21.0 },
    { month: 1, p3: 18.9, p5: 19.2, p10: 19.5, p25: 20.2, p50: 20.9, p75: 21.5, p90: 22.2, p95: 22.5, p97: 22.8 },
    { month: 2, p3: 20.2, p5: 20.4, p10: 20.8, p25: 21.6, p50: 22.3, p75: 23.0, p90: 23.7, p95: 24.1, p97: 24.3 },
    { month: 3, p3: 21.2, p5: 21.5, p10: 21.9, p25: 22.7, p50: 23.5, p75: 24.2, p90: 24.9, p95: 25.4, p97: 25.6 },
    { month: 4, p3: 22.0, p5: 22.3, p10: 22.8, p25: 23.6, p50: 24.4, p75: 25.2, p90: 25.9, p95: 26.4, p97: 26.6 },
    { month: 5, p3: 22.7, p5: 23.0, p10: 23.5, p25: 24.3, p50: 25.2, p75: 26.0, p90: 26.8, p95: 27.2, p97: 27.5 },
    { month: 6, p3: 23.3, p5: 23.6, p10: 24.1, p25: 24.9, p50: 25.8, p75: 26.6, p90: 27.5, p95: 27.9, p97: 28.2 },
    { month: 7, p3: 23.8, p5: 24.1, p10: 24.6, p25: 25.5, p50: 26.4, p75: 27.2, p90: 28.1, p95: 28.5, p97: 28.8 },
    { month: 8, p3: 24.2, p5: 24.6, p10: 25.1, p25: 26.0, p50: 26.9, p75: 27.8, p90: 28.6, p95: 29.1, p97: 29.4 },
    { month: 9, p3: 24.7, p5: 25.0, p10: 25.5, p25: 26.4, p50: 27.4, p75: 28.3, p90: 29.1, p95: 29.6, p97: 29.9 },
    { month: 10, p3: 25.0, p5: 25.4, p10: 25.9, p25: 26.8, p50: 27.8, p75: 28.7, p90: 29.6, p95: 30.1, p97: 30.4 },
    { month: 11, p3: 25.4, p5: 25.7, p10: 26.3, p25: 27.2, p50: 28.2, p75: 29.2, p90: 30.0, p95: 30.5, p97: 30.9 },
    { month: 12, p3: 25.7, p5: 26.1, p10: 26.7, p25: 27.6, p50: 28.6, p75: 29.6, p90: 30.5, p95: 31.0, p97: 31.3 },
    { month: 15, p3: 26.6, p5: 27.0, p10: 27.6, p25: 28.6, p50: 29.6, p75: 30.7, p90: 31.6, p95: 32.2, p97: 32.5 },
    { month: 18, p3: 27.4, p5: 27.9, p10: 28.5, p25: 29.6, p50: 30.7, p75: 31.8, p90: 32.8, p95: 33.3, p97: 33.7 },
    { month: 21, p3: 28.2, p5: 28.7, p10: 29.3, p25: 30.4, p50: 31.6, p75: 32.7, p90: 33.8, p95: 34.4, p97: 34.8 },
    { month: 24, p3: 29.0, p5: 29.4, p10: 30.1, p25: 31.3, p50: 32.5, p75: 33.7, p90: 34.8, p95: 35.4, p97: 35.8 },
    { month: 27, p3: 29.7, p5: 30.2, p10: 30.9, p25: 32.1, p50: 33.3, p75: 34.6, p90: 35.7, p95: 36.3, p97: 36.8 },
    { month: 30, p3: 30.4, p5: 30.9, p10: 31.6, p25: 32.8, p50: 34.1, p75: 35.4, p90: 36.6, p95: 37.2, p97: 37.7 },
    { month: 33, p3: 31.0, p5: 31.5, p10: 32.3, p25: 33.6, p50: 34.9, p75: 36.2, p90: 37.4, p95: 38.1, p97: 38.5 },
    { month: 36, p3: 31.6, p5: 32.2, p10: 33.0, p25: 34.3, p50: 35.6, p75: 37.0, p90: 38.2, p95: 38.9, p97: 39.3 },
];

// ═══════════════════════════════════════════════════════════════════
// CDC/WHO HEAD CIRCUMFERENCE-FOR-AGE DATA (inches, 0-36 months)
// ═══════════════════════════════════════════════════════════════════

export const HEAD_BOYS: PercentilePoint[] = [
    { month: 0, p3: 12.6, p5: 12.8, p10: 13.0, p25: 13.4, p50: 13.8, p75: 14.2, p90: 14.6, p95: 14.8, p97: 15.0 },
    { month: 1, p3: 13.5, p5: 13.7, p10: 13.9, p25: 14.3, p50: 14.7, p75: 15.2, p90: 15.6, p95: 15.8, p97: 16.0 },
    { month: 2, p3: 14.1, p5: 14.3, p10: 14.6, p25: 15.0, p50: 15.5, p75: 15.9, p90: 16.3, p95: 16.6, p97: 16.7 },
    { month: 3, p3: 14.6, p5: 14.8, p10: 15.1, p25: 15.5, p50: 16.0, p75: 16.5, p90: 16.9, p95: 17.1, p97: 17.3 },
    { month: 4, p3: 15.0, p5: 15.2, p10: 15.5, p25: 15.9, p50: 16.4, p75: 16.9, p90: 17.3, p95: 17.5, p97: 17.7 },
    { month: 5, p3: 15.3, p5: 15.5, p10: 15.8, p25: 16.2, p50: 16.7, p75: 17.2, p90: 17.6, p95: 17.8, p97: 18.0 },
    { month: 6, p3: 15.5, p5: 15.7, p10: 16.0, p25: 16.5, p50: 17.0, p75: 17.5, p90: 17.9, p95: 18.1, p97: 18.3 },
    { month: 7, p3: 15.8, p5: 16.0, p10: 16.3, p25: 16.7, p50: 17.2, p75: 17.7, p90: 18.1, p95: 18.3, p97: 18.5 },
    { month: 8, p3: 15.9, p5: 16.1, p10: 16.4, p25: 16.9, p50: 17.4, p75: 17.9, p90: 18.3, p95: 18.5, p97: 18.7 },
    { month: 9, p3: 16.1, p5: 16.3, p10: 16.6, p25: 17.1, p50: 17.5, p75: 18.0, p90: 18.5, p95: 18.7, p97: 18.9 },
    { month: 10, p3: 16.2, p5: 16.4, p10: 16.7, p25: 17.2, p50: 17.7, p75: 18.2, p90: 18.6, p95: 18.8, p97: 19.0 },
    { month: 11, p3: 16.3, p5: 16.5, p10: 16.8, p25: 17.3, p50: 17.8, p75: 18.3, p90: 18.7, p95: 18.9, p97: 19.1 },
    { month: 12, p3: 16.4, p5: 16.6, p10: 16.9, p25: 17.4, p50: 17.9, p75: 18.4, p90: 18.8, p95: 19.1, p97: 19.3 },
    { month: 15, p3: 16.7, p5: 16.9, p10: 17.2, p25: 17.7, p50: 18.2, p75: 18.7, p90: 19.1, p95: 19.4, p97: 19.5 },
    { month: 18, p3: 16.9, p5: 17.1, p10: 17.4, p25: 17.9, p50: 18.4, p75: 18.9, p90: 19.3, p95: 19.6, p97: 19.7 },
    { month: 21, p3: 17.1, p5: 17.3, p10: 17.6, p25: 18.1, p50: 18.6, p75: 19.1, p90: 19.5, p95: 19.8, p97: 19.9 },
    { month: 24, p3: 17.2, p5: 17.4, p10: 17.7, p25: 18.2, p50: 18.7, p75: 19.2, p90: 19.7, p95: 19.9, p97: 20.1 },
    { month: 27, p3: 17.3, p5: 17.5, p10: 17.8, p25: 18.3, p50: 18.9, p75: 19.4, p90: 19.8, p95: 20.0, p97: 20.2 },
    { month: 30, p3: 17.4, p5: 17.6, p10: 17.9, p25: 18.4, p50: 19.0, p75: 19.5, p90: 19.9, p95: 20.1, p97: 20.3 },
    { month: 33, p3: 17.5, p5: 17.7, p10: 18.0, p25: 18.5, p50: 19.0, p75: 19.5, p90: 20.0, p95: 20.2, p97: 20.4 },
    { month: 36, p3: 17.5, p5: 17.7, p10: 18.1, p25: 18.6, p50: 19.1, p75: 19.6, p90: 20.1, p95: 20.3, p97: 20.5 },
];

export const HEAD_GIRLS: PercentilePoint[] = [
    { month: 0, p3: 12.4, p5: 12.5, p10: 12.8, p25: 13.2, p50: 13.5, p75: 13.9, p90: 14.3, p95: 14.5, p97: 14.7 },
    { month: 1, p3: 13.2, p5: 13.4, p10: 13.6, p25: 14.0, p50: 14.4, p75: 14.9, p90: 15.3, p95: 15.5, p97: 15.7 },
    { month: 2, p3: 13.8, p5: 14.0, p10: 14.2, p25: 14.7, p50: 15.1, p75: 15.6, p90: 16.0, p95: 16.3, p97: 16.4 },
    { month: 3, p3: 14.2, p5: 14.4, p10: 14.7, p25: 15.2, p50: 15.6, p75: 16.1, p90: 16.5, p95: 16.8, p97: 17.0 },
    { month: 4, p3: 14.6, p5: 14.8, p10: 15.1, p25: 15.5, p50: 16.0, p75: 16.5, p90: 16.9, p95: 17.2, p97: 17.4 },
    { month: 5, p3: 14.9, p5: 15.1, p10: 15.3, p25: 15.8, p50: 16.3, p75: 16.8, p90: 17.2, p95: 17.5, p97: 17.6 },
    { month: 6, p3: 15.1, p5: 15.3, p10: 15.6, p25: 16.0, p50: 16.5, p75: 17.0, p90: 17.5, p95: 17.7, p97: 17.9 },
    { month: 7, p3: 15.3, p5: 15.5, p10: 15.8, p25: 16.2, p50: 16.7, p75: 17.2, p90: 17.7, p95: 17.9, p97: 18.1 },
    { month: 8, p3: 15.5, p5: 15.6, p10: 15.9, p25: 16.4, p50: 16.9, p75: 17.4, p90: 17.8, p95: 18.1, p97: 18.3 },
    { month: 9, p3: 15.6, p5: 15.8, p10: 16.1, p25: 16.5, p50: 17.1, p75: 17.5, p90: 18.0, p95: 18.2, p97: 18.4 },
    { month: 10, p3: 15.7, p5: 15.9, p10: 16.2, p25: 16.7, p50: 17.2, p75: 17.7, p90: 18.1, p95: 18.4, p97: 18.5 },
    { month: 11, p3: 15.8, p5: 16.0, p10: 16.3, p25: 16.8, p50: 17.3, p75: 17.8, p90: 18.2, p95: 18.5, p97: 18.7 },
    { month: 12, p3: 15.9, p5: 16.1, p10: 16.4, p25: 16.9, p50: 17.4, p75: 17.9, p90: 18.4, p95: 18.6, p97: 18.8 },
    { month: 15, p3: 16.1, p5: 16.3, p10: 16.7, p25: 17.2, p50: 17.7, p75: 18.2, p90: 18.6, p95: 18.9, p97: 19.1 },
    { month: 18, p3: 16.3, p5: 16.5, p10: 16.9, p25: 17.4, p50: 17.9, p75: 18.4, p90: 18.9, p95: 19.1, p97: 19.3 },
    { month: 21, p3: 16.5, p5: 16.7, p10: 17.0, p25: 17.5, p50: 18.1, p75: 18.6, p90: 19.0, p95: 19.3, p97: 19.5 },
    { month: 24, p3: 16.6, p5: 16.8, p10: 17.1, p25: 17.7, p50: 18.2, p75: 18.7, p90: 19.2, p95: 19.4, p97: 19.6 },
    { month: 27, p3: 16.7, p5: 16.9, p10: 17.2, p25: 17.8, p50: 18.3, p75: 18.8, p90: 19.3, p95: 19.5, p97: 19.7 },
    { month: 30, p3: 16.8, p5: 17.0, p10: 17.3, p25: 17.9, p50: 18.4, p75: 18.9, p90: 19.4, p95: 19.6, p97: 19.8 },
    { month: 33, p3: 16.9, p5: 17.1, p10: 17.4, p25: 17.9, p50: 18.5, p75: 19.0, p90: 19.5, p95: 19.7, p97: 19.9 },
    { month: 36, p3: 16.9, p5: 17.1, p10: 17.5, p25: 18.0, p50: 18.6, p75: 19.1, p90: 19.6, p95: 19.8, p97: 20.0 },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get the correct percentile dataset based on metric and sex
 */
export function getPercentileData(metric: GrowthMetric, sex: Sex): PercentilePoint[] {
    const lookup: Record<string, PercentilePoint[]> = {
        weight_boy: WEIGHT_BOYS,
        weight_girl: WEIGHT_GIRLS,
        length_boy: LENGTH_BOYS,
        length_girl: LENGTH_GIRLS,
        head_boy: HEAD_BOYS,
        head_girl: HEAD_GIRLS,
    };
    return lookup[`${metric}_${sex}`] || WEIGHT_BOYS;
}

/**
 * Calculate which percentile a measurement falls on
 * Returns approximate percentile (0-100)
 */
export function calculatePercentile(
    value: number,
    ageMonths: number,
    metric: GrowthMetric,
    sex: Sex
): number {
    const data = getPercentileData(metric, sex);

    // Find the two surrounding data points for interpolation
    let lower = data[0];
    let upper = data[data.length - 1];
    for (let i = 0; i < data.length - 1; i++) {
        if (data[i].month <= ageMonths && data[i + 1].month >= ageMonths) {
            lower = data[i];
            upper = data[i + 1];
            break;
        }
    }

    // Interpolate percentile values at this age
    const ratio = upper.month === lower.month ? 0 :
        (ageMonths - lower.month) / (upper.month - lower.month);

    const interpolate = (key: keyof PercentilePoint) => {
        const lv = lower[key] as number;
        const uv = upper[key] as number;
        return lv + (uv - lv) * ratio;
    };

    const p3 = interpolate('p3');
    const p5 = interpolate('p5');
    const p10 = interpolate('p10');
    const p25 = interpolate('p25');
    const p50 = interpolate('p50');
    const p75 = interpolate('p75');
    const p90 = interpolate('p90');
    const p95 = interpolate('p95');
    const p97 = interpolate('p97');

    // Map value to percentile
    if (value <= p3) return Math.max(1, Math.round(3 * (value / p3)));
    if (value <= p5) return 3 + Math.round(2 * ((value - p3) / (p5 - p3)));
    if (value <= p10) return 5 + Math.round(5 * ((value - p5) / (p10 - p5)));
    if (value <= p25) return 10 + Math.round(15 * ((value - p10) / (p25 - p10)));
    if (value <= p50) return 25 + Math.round(25 * ((value - p25) / (p50 - p25)));
    if (value <= p75) return 50 + Math.round(25 * ((value - p50) / (p75 - p50)));
    if (value <= p90) return 75 + Math.round(15 * ((value - p75) / (p90 - p75)));
    if (value <= p95) return 90 + Math.round(5 * ((value - p90) / (p95 - p90)));
    if (value <= p97) return 95 + Math.round(2 * ((value - p95) / (p97 - p95)));
    return Math.min(99, 97 + Math.round(2 * ((value - p97) / (p97 * 0.05))));
}

/**
 * Get a human-friendly interpretation of a percentile
 */
export function interpretPercentile(percentile: number): {
    label: string;
    color: string;
    emoji: string;
    description: string;
    concern: boolean;
} {
    if (percentile < 3) {
        return {
            label: 'Well Below Average',
            color: '#FF5252',
            emoji: '⚠️',
            description: 'This measurement is below the 3rd percentile. Discuss with your pediatrician at your next visit.',
            concern: true,
        };
    }
    if (percentile < 10) {
        return {
            label: 'Below Average',
            color: '#FF8A65',
            emoji: '📉',
            description: 'This is on the lower side but may be perfectly normal for your baby. Monitor the trend over time.',
            concern: false,
        };
    }
    if (percentile < 25) {
        return {
            label: 'Lower Normal',
            color: '#FFD54F',
            emoji: '📊',
            description: 'Within the normal range, on the smaller side. Consistency in growth pattern matters most.',
            concern: false,
        };
    }
    if (percentile < 75) {
        return {
            label: 'Average',
            color: '#4CAF50',
            emoji: '✅',
            description: 'Right in the typical range! Your baby is growing well.',
            concern: false,
        };
    }
    if (percentile < 90) {
        return {
            label: 'Above Average',
            color: '#4CAF50',
            emoji: '📊',
            description: 'Within the normal range, on the larger side. Healthy growth!',
            concern: false,
        };
    }
    if (percentile < 97) {
        return {
            label: 'Well Above Average',
            color: '#FFD54F',
            emoji: '📈',
            description: 'On the higher end. Usually normal, especially if parents are tall/large. Monitor the trend.',
            concern: false,
        };
    }
    return {
        label: 'Very High',
        color: '#FF8A65',
        emoji: '⚠️',
        description: 'Above the 97th percentile. Discuss with your pediatrician to ensure healthy growth.',
        concern: true,
    };
}

/**
 * Get feeding/nutrition guidance based on age
 */
export const GROWTH_TIPS: { minMonth: number; maxMonth: number; tip: string; source: string }[] = [
    { minMonth: 0, maxMonth: 3, tip: 'Newborns should eat 8-12 times per day. Expect your baby to regain birth weight by 10-14 days old, then gain about 1 oz per day.', source: 'AAP' },
    { minMonth: 3, maxMonth: 6, tip: 'Babies typically double their birth weight by 4-5 months. Growth may seem to slow — that\'s normal! They\'re becoming more efficient eaters.', source: 'CDC' },
    { minMonth: 6, maxMonth: 9, tip: 'Starting solids? Begin with iron-fortified cereal or pureed meats, then fruits and vegetables. Breast milk or formula is still the primary nutrition source.', source: 'AAP' },
    { minMonth: 9, maxMonth: 12, tip: 'Most babies triple their birth weight by 12 months. Introduce a variety of textures — soft chunks, mashed foods, and finger foods.', source: 'WHO' },
    { minMonth: 12, maxMonth: 18, tip: 'Growth rate naturally slows in the second year. Toddlers need about 1,000 calories per day. Expect pickier eating — this is normal!', source: 'AAP' },
    { minMonth: 18, maxMonth: 24, tip: 'Offer 3 meals and 2-3 healthy snacks daily. Whole milk is recommended until age 2 for brain development. Avoid juice before age 1.', source: 'AAP' },
    { minMonth: 24, maxMonth: 36, tip: 'By age 2, most children are 4x their birth weight. Focus on a balanced diet with all food groups. Let your child self-regulate portions.', source: 'CDC' },
];

/**
 * Get growth tip for baby's current age
 */
export function getGrowthTipForAge(ageMonths: number): { tip: string; source: string } {
    const tip = GROWTH_TIPS.find(t => ageMonths >= t.minMonth && ageMonths <= t.maxMonth);
    return tip || { tip: 'Every child grows at their own pace. Consistent growth along their curve is what matters most.', source: 'AAP' };
}

/**
 * Well-child visit schedule (AAP recommended)
 */
export const WELL_CHILD_VISITS = [
    { month: 0, label: 'Newborn (3-5 days)', measurements: 'Weight, Length, Head' },
    { month: 1, label: '1 Month', measurements: 'Weight, Length, Head' },
    { month: 2, label: '2 Months', measurements: 'Weight, Length, Head + Vaccines' },
    { month: 4, label: '4 Months', measurements: 'Weight, Length, Head + Vaccines' },
    { month: 6, label: '6 Months', measurements: 'Weight, Length, Head + Vaccines' },
    { month: 9, label: '9 Months', measurements: 'Weight, Length, Head + Screening' },
    { month: 12, label: '12 Months', measurements: 'Weight, Length, Head + Vaccines' },
    { month: 15, label: '15 Months', measurements: 'Weight, Length, Head + Vaccines' },
    { month: 18, label: '18 Months', measurements: 'Weight, Length, Head + Screening' },
    { month: 24, label: '24 Months', measurements: 'Weight, Height, Head + Screening' },
    { month: 30, label: '30 Months', measurements: 'Weight, Height + Screening' },
    { month: 36, label: '36 Months', measurements: 'Weight, Height + Vision' },
];
