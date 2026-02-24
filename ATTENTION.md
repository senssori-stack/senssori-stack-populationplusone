# ATTENTION — FIX BEFORE LAUNCH

---

## 1. UPDATE YOUR GOOGLE APPS SCRIPT (Required)
**Status:** New code needs to be pasted into your Google Sheet's Apps Script  
**Problem:** The old Apps Script did NOT fetch gold/silver — the app was doing it and burning through MetalsPriceAPI quota.  
**What to do:**
1. Open your Google Sheet → Extensions → Apps Script
2. Replace ALL the code with the updated version from `GOOGLE_SHEETS_SETUP_COPY_PASTE.txt`
3. The new script fetches gold/silver from GoldPrice.org (free, unlimited) on the timer
4. Run `updateLiveData` manually once to verify gold/silver populate
5. Make sure the timer trigger is set (every 3 hours)

---

## 2. GoldPrice.org Is a Temporary Solution
**Status:** Working, but not a guaranteed long-term source  
**Risk:** GoldPrice.org is undocumented/unofficial — could change or go down without notice.  
**What to do:**
- Before launch, confirm GoldPrice.org is still returning data.
- Long-term: consider a paid metals API. If you re-enable MetalsPriceAPI:
  - Uncomment the fallback block in `src/data/utils/external-apis.ts`
  - Rate limiting (max 2 calls/day) is already wired in.
  - Verify your API key still has quota or get a new one.

---

## 3. App No Longer Calls Any Metals API
**Status:** DONE — architecture changed  
**New flow:** Google Sheet timer fetches gold/silver → app reads the sheet CSV  
**What this means:**
- The app does NOT call GoldPrice.org or MetalsPriceAPI directly anymore.
- `src/data/utils/snapshot.ts` simply reads whatever is in the Google Sheet.
- If gold/silver are blank in the sheet, they'll be blank in the app.
- Make sure your Google Apps Script timer is running (Step 1 above).

---

## 4. President / Vice President Are Hardcoded
**File:** `src/data/utils/snapshot.ts`  
**Current values:** Joe Biden / Kamala Harris  
**What to do:**
- Update if there's been a change in office before launch.
- These are intentionally hardcoded (not pulled from Google Sheets) to prevent tampering.

---

## 5. Static Snapshot Values in Cloud Function
**File:** `functions/index.js`  
**Problem:** Gas price, bread, eggs, milk, Super Bowl champ, World Series champ, president, VP are all hardcoded in the Cloud Function.  
**What to do:**
- Update all static values to current numbers before launch.
- Consider pulling these from Firestore or Google Sheets instead of hardcoding.

---

## 6. Cache Duration Is 30 Minutes
**File:** `src/data/utils/cache-manager.ts`  
**Current:** `CACHE_DURATION = 30 * 60 * 1000` (30 min)  
**What to do:**
- Decide if 30 minutes is the right interval for production. Shorter = fresher data but more API calls. Longer = fewer calls but staler prices.
- For metals prices that update throughout the trading day, 30 min is reasonable.

---

## 7. API Keys Are in Source Code
**Files:** `src/data/utils/api-keys.ts`, `functions/index.js`  
**Problem:** API keys and Stripe publishable key are hardcoded in source files.  
**What to do:**
- Move sensitive keys to environment variables or Firebase config before going public.
- The Stripe secret key is already in Firebase config (good), but other keys are exposed.

---

## 8. Deploy Cloud Function After Changes
**What to do:**
- After making any fixes above, redeploy the Cloud Function:
  ```
  cd functions
  npm install
  firebase deploy --only functions
  ```
- Test `manualFetchSnapshot` HTTP endpoint to verify metals fetch works.

---

*Last updated: February 23, 2026*
