// src/data/utils/firebase-snapshot.ts
// Fetch current snapshot data from Firebase Firestore

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase-config';
import { CURRENT_SNAPSHOT_DATA } from './current-snapshot';
import { getFromCache, saveToCache } from './cache-manager';

/**
 * Fetch current snapshot from Firebase Firestore
 * Falls back to local data if Firebase is unavailable
 * Uses cache to speed up repeated loads
 */
export async function getSnapshotFromFirebase(): Promise<Record<string, string>> {
    // First, try cache for instant load
    const cached = await getFromCache();
    if (cached) {
        return cached;
    }

    if (!db) {
        console.warn('⚠️ Firebase not initialized, using local snapshot data');
        return CURRENT_SNAPSHOT_DATA;
    }

    try {
        console.log('📱 Fetching snapshot from Firebase Firestore...');

        // Get today's snapshot document from Firestore
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const docRef = doc(db, 'snapshots', dateStr);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Record<string, string>;
            console.log('✅ Snapshot loaded from Firebase:', dateStr);

            // Ensure all required keys are present, use fallback for missing data
            const snapshot = {
                'GALLON OF GASOLINE': data['gas_price'] || CURRENT_SNAPSHOT_DATA['GALLON OF GASOLINE'],
                'MINIMUM WAGE': data['minimum_wage'] || CURRENT_SNAPSHOT_DATA['MINIMUM WAGE'],
                'LOAF OF BREAD': data['bread_price'] || CURRENT_SNAPSHOT_DATA['LOAF OF BREAD'],
                'DOZEN EGGS': data['eggs_price'] || CURRENT_SNAPSHOT_DATA['DOZEN EGGS'],
                'GALLON OF MILK': data['milk_price'] || CURRENT_SNAPSHOT_DATA['GALLON OF MILK'],
                'GOLD OZ': data['gold_price'] || CURRENT_SNAPSHOT_DATA['GOLD OZ'],
                'SILVER OZ': data['silver_price'] || CURRENT_SNAPSHOT_DATA['SILVER OZ'],
                'DOW JONES CLOSE': data['dow_jones'] || CURRENT_SNAPSHOT_DATA['DOW JONES CLOSE'],
                '#1 SONG': data['top_song'] || CURRENT_SNAPSHOT_DATA['#1 SONG'],
                '#1 MOVIE': data['top_movie'] || CURRENT_SNAPSHOT_DATA['#1 MOVIE'],
                'WON LAST SUPERBOWL': data['superbowl_champ'] || CURRENT_SNAPSHOT_DATA['WON LAST SUPERBOWL'],
                'WON LAST WORLD SERIES': data['world_series_champ'] || CURRENT_SNAPSHOT_DATA['WON LAST WORLD SERIES'],
                'US POPULATION': data['us_population'] || CURRENT_SNAPSHOT_DATA['US POPULATION'],
                'WORLD POPULATION': data['world_population'] || CURRENT_SNAPSHOT_DATA['WORLD POPULATION'],
                'PRESIDENT': data['president'] || CURRENT_SNAPSHOT_DATA['PRESIDENT'],
                'VICE PRESIDENT': data['vice_president'] || CURRENT_SNAPSHOT_DATA['VICE PRESIDENT'],
            };

            // Cache for next time
            await saveToCache(snapshot);
            return snapshot;
        } else {
            console.warn(`⚠️ No snapshot found for ${dateStr}, using local data`);
            return CURRENT_SNAPSHOT_DATA;
        }
    } catch (error) {
        console.warn('⚠️ Failed to fetch from Firebase, using local snapshot data:', error);
        return CURRENT_SNAPSHOT_DATA;
    }
}
