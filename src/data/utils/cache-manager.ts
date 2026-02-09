// src/data/utils/cache-manager.ts
// Cache snapshot data to speed up loading

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'snapshot_cache';
const CACHE_VERSION = 'v7'; // Feb 8: Gold $4,900, Silver $78 - Google Sheets Apps Script needs fixing
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes - shorter cache to get fresher metals prices

interface CachedData {
    data: Record<string, string>;
    timestamp: number;
    version?: string;
}

/**
 * Save snapshot data to cache
 */
export async function saveToCache(data: Record<string, string>): Promise<void> {
    try {
        const cached: CachedData = {
            data,
            timestamp: Date.now(),
            version: CACHE_VERSION,
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
        console.log('✅ Snapshot cached successfully');
    } catch (error) {
        console.warn('⚠️ Failed to cache snapshot:', error);
    }
}

/**
 * Get snapshot data from cache if still valid
 */
export async function getFromCache(): Promise<Record<string, string> | null> {
    try {
        const cachedStr = await AsyncStorage.getItem(CACHE_KEY);
        if (!cachedStr) {
            return null;
        }

        const cached: CachedData = JSON.parse(cachedStr);

        // Check version - invalidate old format cache
        if (cached.version !== CACHE_VERSION) {
            console.log('🔄 Cache version mismatch, invalidating old cache');
            await AsyncStorage.removeItem(CACHE_KEY);
            return null;
        }

        const age = Date.now() - cached.timestamp;

        if (age < CACHE_DURATION) {
            console.log(`✅ Using cached snapshot (${Math.round(age / 1000 / 60)} minutes old)`);
            return cached.data;
        } else {
            console.log('⏰ Cache expired, fetching fresh data');
            return null;
        }
    } catch (error) {
        console.warn('⚠️ Failed to read cache:', error);
        return null;
    }
}

/**
 * Clear cache (useful for manual refresh)
 */
export async function clearCache(): Promise<void> {
    try {
        await AsyncStorage.removeItem(CACHE_KEY);
        console.log('🗑️ Cache cleared');
    } catch (error) {
        console.warn('⚠️ Failed to clear cache:', error);
    }
}
