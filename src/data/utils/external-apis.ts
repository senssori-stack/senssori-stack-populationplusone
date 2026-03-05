// src/data/utils/external-apis.ts
// Fetch real-time data from external APIs (metals, stocks, etc)
//
// Gold/Silver: max 3 fetches per day, spaced 8 hours apart.
// Between fetches the app uses stored prices from AsyncStorage.
// PRIMARY: GoldPrice.org (free, unlimited, no API key)
// FALLBACK: MetalsPriceAPI (paid, monthly quota)

import { API_KEYS } from './api-keys';
import { canFetchMetalsToday, recordMetalsFetch } from './sheets-writer';

/**
 * Fetch gold and silver prices (max 3 times/day, 8h apart).
 * Returns null if rate-limited — caller should use stored backup.
 * On success, returns { gold, silver, source } so caller can save with source info.
 */
export async function getMetalsPrices(): Promise<{ gold: string; silver: string; source: string } | null> {
    // ── CHECK RATE LIMIT (applies to ALL sources) ──────────────
    const canFetch = await canFetchMetalsToday();
    if (!canFetch) {
        // Rate-limited — caller will use stored/cached price
        return null;
    }

    // ── PRIMARY: GoldPrice.org (free, unlimited) ───────────────
    try {
        console.log('💰 Fetching metal prices from GoldPrice.org (primary)...');
        const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
        if (!response.ok) {
            throw new Error(`GoldPrice.org returned ${response.status}`);
        }

        const data = await response.json();
        const item = data.items?.[0];

        if (item?.xauPrice && item?.xagPrice) {
            const goldPrice = `$${item.xauPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const silverPrice = `$${item.xagPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            await recordMetalsFetch();
            console.log('✅ Metal prices from GoldPrice.org:', { goldPrice, silverPrice });
            return { gold: goldPrice, silver: silverPrice, source: 'GoldPrice.org' };
        }

        throw new Error('GoldPrice.org response missing xauPrice/xagPrice');
    } catch (primaryError) {
        console.warn('⚠️ GoldPrice.org failed:', primaryError);
    }

    // ── FALLBACK: MetalsPriceAPI (quota-limited) ──────────────
    try {
        console.log('💰 Trying MetalsPriceAPI (fallback)...');
        const url = `${API_KEYS.METALS_API.baseUrl}/latest?api_key=${API_KEYS.METALS_API.key}&base=USD&currencies=XAU,XAG`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`MetalsPriceAPI returned ${response.status}`);
        }

        const data = await response.json();

        if (data.success === false) {
            throw new Error(data.error?.message || 'MetalsPriceAPI quota exceeded or error');
        }

        // API returns rates as 1 USD = X ounces, so INVERT to get $/oz
        const goldRaw = data.rates?.USDXAU;
        const silverRaw = data.rates?.USDXAG;

        const goldPrice = goldRaw ? `$${(1 / goldRaw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
        const silverPrice = silverRaw ? `$${(1 / silverRaw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

        if (goldPrice && silverPrice) {
            await recordMetalsFetch();
            console.log('✅ Metal prices from MetalsPriceAPI (fallback):', { goldPrice, silverPrice });
            return { gold: goldPrice, silver: silverPrice, source: 'MetalsPriceAPI' };
        }

        return null;
    } catch (fallbackError) {
        console.warn('⚠️ MetalsPriceAPI fallback also failed:', fallbackError);
        return null;
    }
}

/**
 * Fetch Dow Jones closing price from Alpha Vantage
 */
export async function getDowJonesPrice(): Promise<string | null> {
    try {
        console.log('📈 Fetching Dow Jones from Alpha Vantage...');
        const url = `${API_KEYS.ALPHA_VANTAGE.baseUrl}?function=GLOBAL_QUOTE&symbol=^DJI&apikey=${API_KEYS.ALPHA_VANTAGE.key}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Extract Dow Jones price
        const price = data['Global Quote']?.['05. price'];
        if (price) {
            const formatted = `${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            console.log('✅ Dow Jones price:', formatted);
            return formatted;
        }

        return null;
    } catch (error) {
        console.warn('⚠️ Failed to fetch Dow Jones price:', error);
        return null;
    }
}

/**
 * Fetch current snapshot data from your custom API
 */
export async function getCurrentSnapshotFromAPI(): Promise<Record<string, string> | null> {
    try {
        console.log('🔗 Fetching current snapshot from custom API...');

        // This would call your actual API endpoint that aggregates all current data
        // For now, returning null to fall back to local data
        // Update with your actual API endpoint

        return null;
    } catch (error) {
        console.warn('⚠️ Failed to fetch from custom API:', error);
        return null;
    }
}

/**
 * Fetch historical snapshot data for a specific date
 */
export async function getHistoricalSnapshotFromAPI(dateISO: string): Promise<Record<string, string> | null> {
    try {
        console.log(`📊 Fetching historical snapshot for ${dateISO} from API...`);

        // This would call your API for historical data by date
        // Update with your actual API endpoint

        return null;
    } catch (error) {
        console.warn(`⚠️ Failed to fetch historical snapshot for ${dateISO}:`, error);
        return null;
    }
}
