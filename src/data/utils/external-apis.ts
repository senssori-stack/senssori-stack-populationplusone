// src/data/utils/external-apis.ts
// Fetch real-time data from external APIs (metals, stocks, etc)

import { API_KEYS } from './api-keys';

/**
 * Fetch gold and silver prices from Metals API
 */
export async function getMetalsPrices(): Promise<{ gold: string; silver: string } | null> {
    try {
        console.log('💰 Fetching metal prices from Metals API...');
        const url = `${API_KEYS.METALS_API.baseUrl}/latest?api_key=${API_KEYS.METALS_API.key}&base=USD&currencies=XAU,XAG`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Extract prices - API returns USDXAU (gold) and USDXAG (silver) as price per oz
        const goldPrice = data.rates?.USDXAU ? `$${data.rates.USDXAU.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
        const silverPrice = data.rates?.USDXAG ? `$${data.rates.USDXAG.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

        if (goldPrice && silverPrice) {
            console.log('✅ Metal prices fetched:', { goldPrice, silverPrice });
            return { gold: goldPrice, silver: silverPrice };
        }

        return null;
    } catch (error) {
        console.warn('⚠️ Failed to fetch metal prices:', error);
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
