// QUICK REFERENCE: How to Access Snapshot Data in Your Components
// Place this file in src/data/utils/README.md or keep as reference

## IMPORT SNAPSHOT DATA IN ANY COMPONENT

```typescript
import { getAllSnapshotValues, getSnapshotForBirthDate } from '@/src/data/utils/snapshot';
```

## EXAMPLE 1: Get Current Snapshot (Today's Data)

```typescript
const snapshot = await getAllSnapshotValues();

// Access any field
console.log(snapshot['GAS_PRICE']);      // "$2.82"
console.log(snapshot['BREAD']);          // "$2.75"
console.log(snapshot['GOLD']);           // "$4,633.74" (LIVE from Metals API)
console.log(snapshot['SILVER']);         // "$90.10" (LIVE from Metals API)
console.log(snapshot['DOW_JONES']);      // "43,500.25" (LIVE from Alpha Vantage)
console.log(snapshot['US_POPULATION']);  // "343,065,849"
console.log(snapshot['WORLD_POPULATION']); // "8,200,000,000"
console.log(snapshot['PRESIDENT']);      // "Donald J Trump"
console.log(snapshot['VP']);             // "JD Vance"
console.log(snapshot['NUMBER_1_SONG']);  // "Thats So True by Gracie Abrams"
console.log(snapshot['NUMBER_1_MOVIE']); // "Mufasa The Lion King"
```

## EXAMPLE 2: Get Historical Snapshot (Birth Date Data)

```typescript
const birthSnapshot = await getSnapshotForBirthDate('1990-05-15');

// Access birth date data
console.log(birthSnapshot['GAS_PRICE']);      // "$1.45" (1990 price)
console.log(birthSnapshot['US_POPULATION']);  // "249,623,000" (1990 population)
console.log(birthSnapshot['NUMBER_1_SONG']);  // "Vision of Love by Mariah Carey"
```

## DATA SOURCES

| Field | Source | Updates |
|-------|--------|---------|
| GAS_PRICE | Firebase or Google Sheets | Daily |
| BREAD | Firebase or Google Sheets | Daily |
| EGGS | Firebase or Google Sheets | Daily |
| MILK | Firebase or Google Sheets | Daily |
| MINIMUM_WAGE | Firebase or Google Sheets | Varies (federal/state) |
| GOLD | **Metals API (real-time)** | Every minute |
| SILVER | **Metals API (real-time)** | Every minute |
| DOW_JONES | **Alpha Vantage (real-time)** | During market hours |
| US_POPULATION | Firebase or Google Sheets | Yearly |
| WORLD_POPULATION | Firebase or Google Sheets | Yearly |
| PRESIDENT | Firebase or Google Sheets | On election |
| VP | Firebase or Google Sheets | On election |
| NUMBER_1_SONG | Firebase or Google Sheets | Weekly |
| NUMBER_1_MOVIE | Firebase or Google Sheets | Weekly |
| HOUSING_COST | Firebase or Google Sheets | Monthly |
| CAR_COST | Firebase or Google Sheets | Monthly |

## FALLBACK CHAIN (What happens if something fails)

1. **Firebase** fetches from Firestore
   ↓ If Firebase is down or empty...
   
2. **Google Sheets** fetches from your CSV
   ↓ If Google Sheets is down or broken...
   
3. **Local JSON** uses built-in fallback data (January 2026)
   ↓ User sees slightly stale data but app never crashes

**At EVERY level**, the system also tries to fetch:
- Real-time GOLD price from Metals API
- Real-time SILVER price from Metals API
- Real-time DOW_JONES from Alpha Vantage

This ensures even with stale data, live prices are current.

## CACHE BEHAVIOR

By default, snapshot data is cached in memory for the session:
```typescript
// First call: Fetches from database
const snapshot1 = await getAllSnapshotValues(); // API call

// Second call: Returns cached data (instant)
const snapshot2 = await getAllSnapshotValues(); // No API call

// Clear cache to force re-fetch
import { clearSnapshotCache } from '@/src/data/utils/snapshot';
clearSnapshotCache();
const snapshot3 = await getAllSnapshotValues(); // API call (cache cleared)
```

## DEBUG LOGGING

All data operations log to console with emoji prefixes:
- 🔥 Firebase operations
- 📊 Google Sheets operations
- 📱 Local fallback operations
- 💰 Metals API operations
- 📈 Alpha Vantage operations

Enable console in your dev tools to see data source selection.

## USING IN REACT COMPONENTS

```typescript
import { getAllSnapshotValues } from '@/src/data/utils/snapshot';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [snapshot, setSnapshot] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSnapshotValues()
      .then(data => {
        setSnapshot(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load snapshot:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (!snapshot) return <Text>No data</Text>;

  return (
    <View>
      <Text>Gold: {snapshot['GOLD']}</Text>
      <Text>Dow: {snapshot['DOW_JONES']}</Text>
      <Text>Population: {snapshot['US_POPULATION']}</Text>
    </View>
  );
}
```

## USING IN TIMECAPSULE DISPLAY

TimeCapsule shows THEN vs NOW:

```typescript
const birthSnapshot = await getSnapshotForBirthDate(babyBirthDate);
const currentSnapshot = await getAllSnapshotValues();

// Display THEN (at birth)
<Text>Then (at birth): Gas was {birthSnapshot['GAS_PRICE']}</Text>

// Display NOW (today)
<Text>Now (today): Gas is {currentSnapshot['GAS_PRICE']}</Text>
```

## API KEYS & CONFIGURATION

All API keys are stored in: `src/data/utils/api-keys.ts`

Never commit this file to Git! Add to .gitignore:
```
src/data/utils/api-keys.ts
```

For production, use environment variables instead:
```typescript
// Instead of hardcoding in api-keys.ts, use:
const METALS_API_KEY = process.env.METALS_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
```

## MONITORING & ANALYTICS

To track which data source is being used:

```typescript
import { LAST_SNAPSHOT_MAPPINGS } from '@/src/data/utils/snapshot';

// After calling getAllSnapshotValues():
console.log('Field mappings used:', LAST_SNAPSHOT_MAPPINGS);
// Tells you which fields came from where
```

## COMMON ISSUES & SOLUTIONS

**Issue:** Gold/Silver showing stale price
**Solution:** Metals API might be rate-limited. Check console for 💰 messages.

**Issue:** Dow Jones showing "undefined"
**Solution:** Market might be closed or API rate limit hit. Check console for 📈 messages.

**Issue:** Birth date data is empty
**Solution:** Firebase might not have data for that date. Check Firestore collections.

**Issue:** All prices blank (only fallback showing)
**Solution:** Both Firebase and Google Sheets unavailable. Check network connectivity.

## PRODUCTION CHECKLIST

Before launching with this data system:
- [ ] Set up Firebase Firestore collections
- [ ] Populate daily snapshot documents
- [ ] Test with DataIntegrationTestScreen
- [ ] Monitor API rate limits and usage
- [ ] Set up alerts for API failures
- [ ] Cache results to minimize API costs
- [ ] Move API keys to environment variables
- [ ] Configure Firestore security rules
- [ ] Test fallback scenarios (turn off APIs, verify fallback works)
- [ ] Monitor console logs in production
- [ ] Set up error tracking (Sentry, Datadog, etc.)

## SUPPORT

For issues or questions:
1. Check console logs (look for emoji prefixes: 🔥 📊 💰 📈)
2. Enable DataIntegrationTestScreen to test all APIs
3. Verify API keys in api-keys.ts are correct
4. Check Firebase Firestore collections are populated
5. Verify Google Sheets URL is public and accessible
6. Check network connectivity in dev environment
