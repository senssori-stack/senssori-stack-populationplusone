// src/data/utils/external-apis.ts
// Fetch real-time data from external APIs (metals, stocks, etc)
//
// TEMPORARY (Feb 2026): MetalsPriceAPI disabled — was being fetched way over
// the quota limit because rate-limiting was never wired up. Using GoldPrice.org
// (free, unlimited, no API key) as the sole source until MetalsPriceAPI is
// re-enabled with proper rate limiting.

import { API_KEYS } from './api-keys';

/**
 * Fetch gold and silver prices.
 * PRIMARY: GoldPrice.org — free, no API key, no rate limits, returns both metals in one call.
 * FALLBACK: MetalsPriceAPI — has monthly quota limits, used only if GoldPrice.org fails.
 */
export async function getMetalsPrices(): Promise<{ gold: string; silver: string } | null> {
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
            console.log('✅ Metal prices from GoldPrice.org:', { goldPrice, silverPrice });
            return { gold: goldPrice, silver: silverPrice };
        }

        throw new Error('GoldPrice.org response missing xauPrice/xagPrice');
    } catch (primaryError) {
        console.warn('⚠️ GoldPrice.org failed:', primaryError);
    }

    // ── FALLBACK: MetalsPriceAPI (quota-limited) ──────────────
    // TEMPORARILY DISABLED (Feb 2026): Was over-fetching and burning through
    // the monthly quota. GoldPrice.org is free & unlimited so we rely on it.
    // When ready to re-enable, uncomment the block below — rate limiting is
    // now wired up via canFetchMetalsToday() / recordMetalsFetch().
    //
    // To re-enable, uncomment the block below:
    /*
    try {
        // Check rate limit BEFORE calling the paid API
        const canFetch = await canFetchMetalsToday();
        if (!canFetch) {
            console.log('⚠️ MetalsPriceAPI daily limit reached, skipping fallback');
            return null;
        }

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

        const goldPrice = data.rates?.USDXAU ? `$${data.rates.USDXAU.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
        const silverPrice = data.rates?.USDXAG ? `$${data.rates.USDXAG.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

        if (goldPrice && silverPrice) {
            // Record the successful fetch so we don't exceed daily limit
            await recordMetalsFetch();
            console.log('✅ Metal prices from MetalsPriceAPI (fallback):', { goldPrice, silverPrice });
            return { gold: goldPrice, silver: silverPrice };
        }

        return null;
    } catch (fallbackError) {
        console.warn('⚠️ MetalsPriceAPI fallback also failed:', fallbackError);
        return null;
    }
    */
    console.log('ℹ️ MetalsPriceAPI fallback is temporarily disabled — using GoldPrice.org only');
    return null;
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
