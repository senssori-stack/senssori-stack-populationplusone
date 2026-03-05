// src/data/utils/metals-backup.ts
// Persistent backup storage for gold/silver prices
// Stores BOTH:
//   1) Latest backup (for between-fetch use)
//   2) Date-stamped historical record (for future historical lookups)
// The last fetch each day becomes the permanent record for that date.

import AsyncStorage from '@react-native-async-storage/async-storage';

const METALS_BACKUP_KEY = 'metals_backup_permanent';
const METALS_HISTORY_PREFIX = 'metals_history_';   // + YYYY-MM-DD

interface MetalsBackup {
    gold: string;
    silver: string;
    fetchedAt: string;  // ISO timestamp
    source: string;     // Where the data came from
}

/**
 * Save gold/silver prices to:
 *   1) Permanent "latest" backup (used between fetches)
 *   2) Date-stamped historical record (last fetch of the day wins)
 */
export async function saveMetalsBackup(gold: string, silver: string, source: string = 'API'): Promise<void> {
    try {
        const now = new Date();
        const backup: MetalsBackup = {
            gold,
            silver,
            fetchedAt: now.toISOString(),
            source,
        };

        // 1) Save as "latest" backup
        await AsyncStorage.setItem(METALS_BACKUP_KEY, JSON.stringify(backup));

        // 2) Save as historical record for today's date (overwrites previous fetch today)
        const dateKey = METALS_HISTORY_PREFIX + now.toISOString().split('T')[0];
        await AsyncStorage.setItem(dateKey, JSON.stringify(backup));

        console.log(`💾 Metals saved: Gold=${gold}, Silver=${silver} (${source}) — stored as latest + ${dateKey}`);
    } catch (error) {
        console.warn('⚠️ Failed to save metals backup:', error);
    }
}

/**
 * Get last known good gold/silver prices from backup
 * Returns null only if no backup has ever been saved
 */
export async function getMetalsBackup(): Promise<{ gold: string; silver: string; fetchedAt: string } | null> {
    try {
        const backupStr = await AsyncStorage.getItem(METALS_BACKUP_KEY);
        if (!backupStr) {
            console.log('⚠️ No metals backup found');
            return null;
        }

        const backup: MetalsBackup = JSON.parse(backupStr);
        console.log(`📁 Metals backup loaded: Gold=${backup.gold}, Silver=${backup.silver} (from ${backup.fetchedAt})`);
        return {
            gold: backup.gold,
            silver: backup.silver,
            fetchedAt: backup.fetchedAt,
        };
    } catch (error) {
        console.warn('⚠️ Failed to read metals backup:', error);
        return null;
    }
}

/**
 * Get historical gold/silver prices for a specific date (YYYY-MM-DD).
 * Returns the last fetched prices from that day, or null if no record exists.
 */
export async function getMetalsForDate(dateISO: string): Promise<{ gold: string; silver: string } | null> {
    try {
        const dateKey = METALS_HISTORY_PREFIX + dateISO;
        const stored = await AsyncStorage.getItem(dateKey);
        if (!stored) return null;

        const backup: MetalsBackup = JSON.parse(stored);
        console.log(`📅 Historical metals for ${dateISO}: Gold=${backup.gold}, Silver=${backup.silver}`);
        return { gold: backup.gold, silver: backup.silver };
    } catch {
        return null;
    }
}

/**
 * Check if metals backup exists
 */
export async function hasMetalsBackup(): Promise<boolean> {
    try {
        const backupStr = await AsyncStorage.getItem(METALS_BACKUP_KEY);
        return backupStr !== null;
    } catch {
        return false;
    }
}

/**
 * Clear metals backup (for testing only)
 */
export async function clearMetalsBackup(): Promise<void> {
    try {
        await AsyncStorage.removeItem(METALS_BACKUP_KEY);
        console.log('🗑️ Metals backup cleared');
    } catch (error) {
        console.warn('⚠️ Failed to clear metals backup:', error);
    }
}
