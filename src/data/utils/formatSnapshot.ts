// src/data/utils/formatSnapshot.ts
// Helpers to format snapshot values for display (currency, integers, etc.)

function parseNumber(s: string): number {
    if (!s) return NaN;
    // Remove common non-numeric characters (currency signs, commas, spaces)
    const cleaned = s.replace(/[^0-9.\-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
}

const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const usdNoDecimals = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const intFormatter = new Intl.NumberFormat('en-US');
const numberFormatter = (digits = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });

export function formatSnapshotValue(key: string, raw: string): string {
    const s = (raw ?? '').trim();
    if (!s) return '';
    const upperKey = (key ?? '').trim().toUpperCase();

    // Text-only fields: return as-is without numeric parsing
    const textOnlyKeywords = ['SONG', 'MOVIE', 'PRESIDENT', 'VICE PRESIDENT', 'SUPERBOWL', 'WORLD SERIES'];
    if (textOnlyKeywords.some(k => upperKey.includes(k))) {
        return s;
    }

    const n = parseNumber(s);

    // Currency-like items
    const currencyKeywords = [
        'GALLON OF GASOLINE',
        'LOAF OF BREAD',
        'DOZEN EGGS',
        'GALLON OF MILK',
        'GALLON OF MILK',
    ];
    if (currencyKeywords.some(k => upperKey.includes(k)) && !Number.isNaN(n)) {
        return usdFormatter.format(n);
    }

    // Gold / Silver per oz — show as currency with 2 decimals
    if ((upperKey.includes('GOLD') || upperKey.includes('SILVER')) && !Number.isNaN(n)) {
        return usdFormatter.format(n);
    }

    // Bitcoin: show as currency with no decimals (USD equivalent expected in CSV)
    if (upperKey.includes('BITCOIN') && !Number.isNaN(n)) {
        return usdNoDecimals.format(n);
    }

    // Population-like: integers
    if (upperKey.includes('POPULATION') && !Number.isNaN(n)) {
        return intFormatter.format(Math.round(n));
    }

    // Electricity / numeric measures: show with up to 2 decimals
    if ((upperKey.includes('ELECTRICITY') || upperKey.includes('KWH')) && !Number.isNaN(n)) {
        return numberFormatter(2).format(n);
    }

    // Fallback: if it's a plain number, show with up to 2 decimals (or integer if whole)
    if (!Number.isNaN(n)) {
        if (Number.isInteger(n)) return intFormatter.format(n);
        return numberFormatter(2).format(n);
    }

    // Otherwise return original string
    return s;
}

export default formatSnapshotValue;
