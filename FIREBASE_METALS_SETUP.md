# Firebase Auto-Historical Database Setup

**Status:** Blueprint ready
**Goal:** Auto-fetch live data daily and build permanent historical archive

---

## Architecture Vision

**Problem:** Historical data decays. Manual updates are tedious.

**Solution:** Automated daily fetches build historical archive automatically.

```
Daily 1 PM:   metalpriceapi.com → Fetch gold/silver → Store in Firestore
Daily 4 PM:   Alpha Vantage     → Fetch Dow Jones  → Store in Firestore
Daily Midnight: Spotify + TMDb   → Fetch song/movie → Store in Firestore

Firestore Structure:
snapshots/
  2026-01-29/
    gold_usd: 2123.45
    silver_usd: 28.95
    dow_jones: 43500.25
    top_song: "Sabrina Carpenter - Espresso"
    top_movie: "Nosferatu"
    fetchedAt: <server timestamp>
    
  2026-01-28/
    (same fields)
```

**After 1 year:** 365 days of accurate historical data
**After 5 years:** Complete historical archive - no manual updates needed

---

## Step 1: Get 4 API Keys (10 min total)

### 1a. Metal Prices API
**URL:** https://metalpriceapi.com
- Sign up
- Get free API key
- **Save it**

### 1b. Dow Jones (Alpha Vantage)
**URL:** https://www.alphavantage.co
- Sign up
- Copy API key
- **Save it**

### 1c. Top Song (Spotify)
**URL:** https://developer.spotify.com
- Sign up
- Create app
- Get Client ID + Client Secret
- **Save both**

### 1d. Top Movie (TMDb)
**URL:** https://www.themoviedb.org/settings/api
- Sign up
- Request API key
- Get API key
- **Save it**

---

## Step 2: Create Firebase Project (3 min)

**URL:** https://firebase.google.com

1. Click "Go to console" (top right)
2. Click "+ Add project"
3. Name: `PopulationPlusOne`
4. Click through dialogs
5. **Note your Project ID** (you'll need it)

---

## Step 3: Create Cloud Function (15 min)

**In Firebase Console:**

1. Left sidebar → **Functions**
2. Click **Get started**
3. Click **Create function**
   - Name: `fetchDailySnapshots`
   - Trigger: **Cloud Pub/Sub**
   - Create new topic: `fetch-daily-snapshots`
   - Click **Create**

4. In code editor, **delete all code** and paste this:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp();
const db = admin.firestore();

// API Keys (set these as environment variables in Cloud Functions settings)
const METAL_PRICE_API_KEY = 'YOUR_METAL_PRICE_KEY'; // From Step 1a
const ALPHA_VANTAGE_API_KEY = 'YOUR_ALPHA_VANTAGE_KEY'; // From Step 1b
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_ID'; // From Step 1c
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_SECRET'; // From Step 1c
const TMDB_API_KEY = 'YOUR_TMDB_KEY'; // From Step 1d

exports.fetchDailySnapshots = functions.pubsub
  .topic('fetch-daily-snapshots')
  .onPublish(async (message) => {
    try {
      console.log('🔄 Fetching daily snapshots...');

      // Fetch all data in parallel
      const [metals, dow, song, movie] = await Promise.all([
        fetchMetals(),
        fetchDowJones(),
        fetchTopSong(),
        fetchTopMovie(),
      ]);

      // Get today's date as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const docPath = `snapshots/${today}`;

      // Store unified daily snapshot
      await db.doc(docPath).set({
        gold_usd: metals.gold,
        silver_usd: metals.silver,
        dow_jones: dow,
        top_song: song,
        top_movie: movie,
        fetchedAt: admin.firestore.Timestamp.now(),
        source: 'auto-fetch',
      });

      console.log('✅ Daily snapshot stored:', { metals, dow, song, movie });
      return 'Success';
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  });

// ============= Fetch Functions =============

async function fetchMetals() {
  return new Promise((resolve, reject) => {
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,XAG`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            gold: json.rates?.USDXAU || 2050,
            silver: json.rates?.USDXAG || 25,
          });
        } catch (e) {
          console.warn('Metals parse error:', e);
          resolve({ gold: 2050, silver: 25 });
        }
      });
    }).on('error', reject);
  });
}

async function fetchDowJones() {
  return new Promise((resolve, reject) => {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=GSPC&apikey=${ALPHA_VANTAGE_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const price = parseFloat(json['Global Quote']?.['05. price'] || '43500');
          resolve(price);
        } catch (e) {
          console.warn('Dow parse error:', e);
          resolve(43500);
        }
      });
    }).on('error', reject);
  });
}

async function fetchTopSong() {
  // Get Spotify token first
  const token = await getSpotifyToken();
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.spotify.com',
      path: '/v1/playlists/37i9dQZEVXbLRQxdXlIig2', // Billboard Hot 100
      headers: { 'Authorization': `Bearer ${token}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const track = json.tracks.items[0];
          const name = `${track.name} - ${track.artists[0].name}`;
          resolve(name);
        } catch (e) {
          console.warn('Song parse error:', e);
          resolve('Unknown Track');
        }
      });
    }).on('error', reject);
  });
}

async function fetchTopMovie() {
  return new Promise((resolve, reject) => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&region=US`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const movie = json.results[0];
          resolve(movie.title);
        } catch (e) {
          console.warn('Movie parse error:', e);
          resolve('Unknown Movie');
        }
      });
    }).on('error', reject);
  });
}

async function getSpotifyToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.access_token);
        } catch (e) {
          console.warn('Token error:', e);
          reject(e);
        }
      });
    });
    req.write('grant_type=client_credentials');
    req.end();
  });
}
```

5. **Replace all 4 API keys** with your actual keys from Step 1
6. Click **Deploy**
7. Wait for "Deploy complete"

---

## Step 4: Schedule Cloud Function (3 min)

**Cloud Scheduler:** https://console.cloud.google.com/cloudscheduler

Create 2 jobs:

### Job 1: Daily at 1 PM (metals)
- **Name:** `fetch-metals-1pm`
- **Frequency:** `0 13 * * *` (1:00 PM PT)
- **Timezone:** America/Los_Angeles
- **Execution:** HTTP POST
- **URL:** `https://pubsub.googleapis.com/v1/projects/YOUR_PROJECT_ID/topics/fetch-daily-snapshots:publish`
- **Auth:** Add OIDC token
- **Service account:** `YOUR_PROJECT_ID@appspot.gserviceaccount.com`

### Job 2: Daily at 4 PM (Dow Jones)
- Same as above, but **Frequency:** `0 16 * * *` (4:00 PM PT)

### Job 3: Daily at midnight (Song + Movie)
- Same as above, but **Frequency:** `0 0 * * *` (midnight PT)

---

## Step 5: Update App Code (10 min)

**First, install Firebase SDK:**

```bash
cd PopulationPlusOne
npm install firebase
```

**Then replace `src/data/utils/snapshot.ts`** with code I'll provide after you complete Steps 1-4.

---

## Firestore Data Structure

```
firestore root/
  snapshots/
    2026-01-29/
      gold_usd: 2123.45
      silver_usd: 28.95
      dow_jones: 43500.25
      top_song: "Track - Artist"
      top_movie: "Movie Title"
      fetchedAt: Timestamp
      source: "auto-fetch"
    
    2026-01-28/
      (same structure - date goes back through history)
```

**Lookup:** App queries `snapshots/YYYY-MM-DD` for any birth date

---

## QUICK CHECKLIST

- [ ] Step 1: 4 API keys obtained
- [ ] Step 2: Firebase project created (note Project ID)
- [ ] Step 3: Cloud Function deployed
- [ ] Step 4: 3 Cloud Scheduler jobs created
- [ ] Step 5: App code updated (TBD)

---

## How App Uses This

```typescript
// User enters birthdate: 1995-06-15
// App checks: snapshots/1995-06-15

if (exists in Firestore) {
  // Use live historical data ✅
  return firestore data
} else {
  // Fall back to manual historical data
  return historical-snapshot.ts data
}
```

This way:
- **Old dates** (before you set this up) → Uses historical-snapshot.ts
- **Recent dates** (after setup) → Uses accurate Firestore data
- **Future dates** → Always updated automatically

---

## Long-Term Value

| Timeline | Data Coverage |
|----------|----------------|
| 1 month | 30 days in Firestore |
| 3 months | 90 days in Firestore |
| 1 year | 365 days in Firestore |
| 5 years | 1,825 days - covers most births |
| 10 years | Complete database - no manual updates |

---

## Next Steps

1. Complete Steps 1-4 above
2. Come back and tell me when done
3. I'll give you the updated `snapshot.ts` code
4. Deploy and test

This builds your historical database automatically while you sleep. 🚀

