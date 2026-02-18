// src/data/utils/metals-api.ts
// Fetch live gold/silver prices from Metals API
// Free tier: ~100 requests/day, updates throughout the day

const METALS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your key from metals-api.com
const METALS_API_URL = 'https://metals-api.com/api/latest';
const CACHE_KEY = 'metals_prices_cache';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export interface MetalsPrices {
    goldUSD: string; // e.g., "$2,123.45"
    silverUSD: string; // e.g., "$28.95"
    timestamp: number;
}

/**
 * Fetch current gold and silver prices from Metals API
 * Returns cached data if available and fresh, otherwise fetches live
 */
export async function getMetalsPrices(): Promise<MetalsPrices> {
    try {
        // Check cache first
        const cached = getCachedPrices();
        if (cached) {
            console.log('✅ Using cached metal prices');
            return cached;
        }

        // Fetch from Metals API
        if (!METALS_API_KEY || METALS_API_KEY === 'YOUR_API_KEY_HERE') {
            console.warn('⚠️ Metals API key not configured, using fallback prices');
            return getFallbackPrices();
        }

        console.log('🔄 Fetching live metal prices from Metals API...');
        const response = await fetch(
            `${METALS_API_URL}?access_key=${METALS_API_KEY}&base=USD&symbols=XAU,XAG`,
            { method: 'GET', headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) {
            console.warn(`⚠️ Metals API error (${response.status}), using fallback`);
            return getFallbackPrices();
        }

        const data = await response.json();

        // Parse response: Metals API returns rates as XAU (gold) and XAG (silver) per USD
        // We need to convert to price per ounce
        if (data.rates && data.rates.XAU && data.rates.XAG) {
            const goldPrice = (1 / data.rates.XAU) * 31.1035; // Convert to USD per troy ounce
            const silverPrice = (1 / data.rates.XAG) * 31.1035;

            const prices: MetalsPrices = {
                goldUSD: formatPrice(goldPrice),
                silverUSD: formatPrice(silverPrice),
                timestamp: Date.now(),
            };

            // Cache the result
            cacheMetalsPrices(prices);
            console.log('✅ Live prices fetched:', prices);
            return prices;
        }

        console.warn('⚠️ Unexpected API response format, using fallback');
        return getFallbackPrices();
    } catch (error) {
        console.error('❌ Error fetching metal prices:', error);
        return getFallbackPrices();
    }
}

/**
 * Get cached prices if they're still fresh
 */
function getCachedPrices(): MetalsPrices | null {
    try {
        if (typeof localStorage === 'undefined') return null; // Not in browser

        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const prices: MetalsPrices = JSON.parse(cached);
        const age = Date.now() - prices.timestamp;

        if (age < CACHE_DURATION) {
            return prices;
        }

        localStorage.removeItem(CACHE_KEY); // Clear stale cache
        return null;
    } catch (error) {
        console.warn('Cache retrieval failed:', error);
        return null;
    }
}

/**
 * Store prices in local storage
 */
function cacheMetalsPrices(prices: MetalsPrices): void {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify(prices));
        }
    } catch (error) {
        console.warn('Cache storage failed:', error);
    }
}

/**
 * Format price as "$X,XXX.XX"
 */
function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

/**
 * Fallback prices (last known approximate values)
 * Used when API is unavailable
 */
function getFallbackPrices(): MetalsPrices {
    return {
        goldUSD: '$2,650.00',
        silverUSD: '$30.25',
        timestamp: Date.now(),
    };
}
