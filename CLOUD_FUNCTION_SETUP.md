# Firebase Cloud Function Setup

## Overview
The Cloud Function automatically fetches snapshot data daily and stores it in Firebase, eliminating slow API calls from the app.

## What It Does
- Fetches gold/silver prices from Metals API
- Fetches Dow Jones from Alpha Vantage
- Fetches #1 song from Last.fm
- Fetches #1 movie from TMDB
- Stores everything in Firebase Firestore at `snapshots/YYYY-MM-DD`
- App reads from Firebase (fast!) instead of calling external APIs

## Deployment Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Navigate to functions folder
```bash
cd functions
npm install
```

### 4. Deploy the function
```bash
firebase deploy --only functions
```

### 5. Set up daily scheduling (in Google Cloud Console)
1. Go to https://console.cloud.google.com/cloudscheduler
2. Create a new job:
   - **Name**: daily-snapshot-fetch
   - **Frequency**: `0 6 * * *` (every day at 6 AM UTC)
   - **Target**: Pub/Sub
   - **Topic**: fetch-daily-snapshots
   - **Payload**: `{}`

## Manual Testing

After deployment, you can manually trigger the function via HTTP:

```bash
# The URL will be shown after deployment, but it looks like:
# https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/manualFetchSnapshot

curl https://us-central1-populationplusone-a419c.cloudfunctions.net/manualFetchSnapshot
```

Or visit the URL in your browser to trigger a fetch immediately.

## Verify It's Working

1. Check Firebase Console → Firestore
2. Look for collection: `snapshots`
3. Look for document with today's date: `2026-02-03`
4. Should contain all fields: gold_price, silver_price, dow_jones, top_song, top_movie, etc.

## Speed Improvement

**Before**: App calls 4 external APIs → 30-60 seconds load time
**After**: App reads from Firebase → 1-2 seconds load time

The function runs once daily at 6 AM, so data is always fresh and ready instantly.

## Updating Static Data

For fields that don't change daily (president, minimum wage, gas prices), update them manually:
1. Go to Firebase Console → Firestore
2. Edit today's snapshot document
3. Update the fields you need

Or update the default values in `functions/index.js` lines 30-40.

## Cost
- Cloud Functions: Free tier covers this (runs once per day)
- Cloud Scheduler: $0.10/month (one job)
- Firestore: Minimal (one write per day)

## Troubleshooting

If data isn't appearing:
1. Check Cloud Scheduler is enabled and running
2. Check Function logs: Firebase Console → Functions → Logs
3. Manually trigger via HTTP endpoint to test
4. Verify API keys in `functions/index.js` are valid
