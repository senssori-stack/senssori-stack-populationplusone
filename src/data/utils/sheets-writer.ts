// src/data/utils/sheets-writer.ts
// Writes fetched metals prices (and other live data) back to the Google Sheet
// so ALL consumers of the snapshot CSV get fresh values.
//
// Uses a deployed Google Apps Script Web App as the write endpoint.
// The web app URL is set below — deploy your Apps Script as a web app
// (Execute as: Me, Who has access: Anyone) and paste the URL here.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIGURATION ───────────────────────────────────────────────
// After deploying the Apps Script web app (see GOOGLE_SHEETS_SETUP_COPY_PASTE.txt),
// paste the deployed URL here. It looks like:
// https://script.google.com/macros/s/AKfycb.../exec
const APPS_SCRIPT_WEB_APP_URL = '';  // ← PASTE YOUR DEPLOYED WEB APP URL HERE

// Rate-limit: max 2 Metals API fetches per calendar day
const METALS_FETCH_COUNT_KEY = 'metals_api_fetch_count';
const METALS_FETCH_DATE_KEY = 'metals_api_fetch_date';
const MAX_METALS_FETCHES_PER_DAY = 2;

// ─── RATE LIMITING ───────────────────────────────────────────────

/**
 * Check if we still have Metals API calls remaining today.
 * Returns true if we can fetch, false if we've hit the daily limit.
 */
export async function canFetchMetalsToday(): Promise<boolean> {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const savedDate = await AsyncStorage.getItem(METALS_FETCH_DATE_KEY);
        const savedCount = await AsyncStorage.getItem(METALS_FETCH_COUNT_KEY);

        if (savedDate !== today) {
            // New day — reset counter
            return true;
        }

        const count = parseInt(savedCount || '0', 10);
        return count < MAX_METALS_FETCHES_PER_DAY;
    } catch {
        // If AsyncStorage fails, allow the fetch (be optimistic)
        return true;
    }
}

/**
 * Record that we used one Metals API call today.
 */
export async function recordMetalsFetch(): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const savedDate = await AsyncStorage.getItem(METALS_FETCH_DATE_KEY);

        let count = 0;
        if (savedDate === today) {
            count = parseInt((await AsyncStorage.getItem(METALS_FETCH_COUNT_KEY)) || '0', 10);
        }

        count += 1;
        await AsyncStorage.setItem(METALS_FETCH_DATE_KEY, today);
        await AsyncStorage.setItem(METALS_FETCH_COUNT_KEY, count.toString());

        console.log(`📊 Metals API usage today: ${count}/${MAX_METALS_FETCHES_PER_DAY}`);
    } catch (error) {
        console.warn('⚠️ Failed to record metals fetch count:', error);
    }
}

/**
 * Get how many Metals API calls remain today.
 */
export async function getMetalsFetchesRemaining(): Promise<number> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const savedDate = await AsyncStorage.getItem(METALS_FETCH_DATE_KEY);

        if (savedDate !== today) return MAX_METALS_FETCHES_PER_DAY;

        const count = parseInt((await AsyncStorage.getItem(METALS_FETCH_COUNT_KEY)) || '0', 10);
        return Math.max(0, MAX_METALS_FETCHES_PER_DAY - count);
    } catch {
        return MAX_METALS_FETCHES_PER_DAY;
    }
}

// ─── GOOGLE SHEET WRITER ─────────────────────────────────────────

/**
 * Write updated field values to the Google Sheet via the Apps Script web app.
 * Accepts a map of field names to values, e.g.:
 *   { "GOLD OZ": "$2,650.00", "SILVER OZ": "$31.25" }
 *
 * The Apps Script doPost() handler will update matching rows in the sheet.
 */
export async function writeToGoogleSheet(updates: Record<string, string>): Promise<boolean> {
    if (!APPS_SCRIPT_WEB_APP_URL) {
        console.warn('⚠️ Google Sheet write skipped — APPS_SCRIPT_WEB_APP_URL is not configured.');
        console.warn('   Deploy the Apps Script web app and paste the URL in sheets-writer.ts');
        return false;
    }

    try {
        console.log('📝 Writing to Google Sheet:', Object.keys(updates).join(', '));

        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
            // Apps Script redirects on POST — follow it
        });

        // Apps Script web apps return a redirect, so check for 200 or 302
        if (response.ok || response.status === 302) {
            console.log('✅ Google Sheet updated successfully');
            return true;
        }

        // Try to read response text for debugging
        const text = await response.text().catch(() => '');
        console.warn(`⚠️ Google Sheet write got status ${response.status}:`, text);
        return false;
    } catch (error) {
        console.warn('⚠️ Failed to write to Google Sheet:', error);
        return false;
    }
}

/**
 * Convenience: write gold & silver prices to the Google Sheet.
 */
export async function writeMetalsPricesToSheet(gold: string, silver: string): Promise<boolean> {
    return writeToGoogleSheet({
        'GOLD OZ': gold,
        'SILVER OZ': silver,
    });
}
