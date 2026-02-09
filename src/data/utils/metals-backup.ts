// src/data/utils/metals-backup.ts
// Persistent backup storage for gold/silver prices
// This backup NEVER expires - always preserves last known good values

import AsyncStorage from '@react-native-async-storage/async-storage';

const METALS_BACKUP_KEY = 'metals_backup_permanent';

interface MetalsBackup {
    gold: string;
    silver: string;
    fetchedAt: string;  // ISO timestamp
    source: string;     // Where the data came from
}

/**
 * Save gold/silver prices to permanent backup after successful fetch
 */
export async function saveMetalsBackup(gold: string, silver: string, source: string = 'Google Sheets'): Promise<void> {
    try {
        const backup: MetalsBackup = {
            gold,
            silver,
            fetchedAt: new Date().toISOString(),
            source,
        };
        await AsyncStorage.setItem(METALS_BACKUP_KEY, JSON.stringify(backup));
        console.log(`💾 Metals backup saved: Gold=${gold}, Silver=${silver} (from ${source})`);
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
