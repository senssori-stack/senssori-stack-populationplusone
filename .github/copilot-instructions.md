# Birth Announcement Studio - AI Coding Agent Instructions

**Production React Native Expo app** (4+ months development). Generates personalized birth announcements + birthday "time capsule" gifts with historical data from Google Sheets and 110-year dataset.

## 🎯 Core Architecture

### Data Flow (Foundation - Understand First)
```
Google Sheets (live) → Historical Data (1914-2026) → Components → Print/Export
```

**Key Data Files:**
- [sheets.ts](../../src/data/utils/sheets.ts) - Google Sheets Apps Script endpoint + CSV URLs with override mechanism (`src/config/sheets-overrides.json`)
- [snapshot.ts](../../src/data/utils/snapshot.ts) - Current snapshot fetching with in-memory caching (`SNAP_CACHE`)
- [historical-snapshot.ts](../../src/data/utils/historical-snapshot.ts) - `getSnapshotWithHistorical(dateString)` merges historical + live data
- [comprehensive-historical-data.ts](../../src/data/utils/comprehensive-historical-data.ts) - 110-year dataset (yearly pre-2020, monthly 2020+)

**Route Structure:** `FormScreen`/`BirthdayFormScreen` → `PreviewScreen` → `PrintServiceScreen` (with optional Portrait/Landscape variants)

### Component Organization
- **Screens** (`src/screens/*Screen.tsx`): Form input + navigation
  - `FormScreen.tsx` (baby mode) → uses `getAllSnapshotValues()` + `getPopulationForCity()`
  - `BirthdayFormScreen.tsx` (birthday mode) → uses `getSnapshotWithHistorical()` + `getPopulationWithHistoricalContext()`
- **Display Components** (`src/components/`): `*Landscape.tsx` / `*Portrait.tsx` pairs
- **Data Utils** (`src/data/utils/*`): Stateless, kebab-case utilities
- **Types** (`src/types.ts`): `PreviewParams` typed route navigation, `MilestoneType` enum

## 🔧 Critical Patterns (See CRITICAL_PATTERNS.md for examples)

### Photo Sizing (SmartPhotoLayout.tsx)
- **Single/Twin photos**: Use same `totalPhotoSize` for both
- **Math**: `twinPhotoSize = totalPhotoSize` (not reduced)
- Twin gap: `totalPhotoSize * 0.08`

### Font Sizing (SignFrontLandscape.tsx)
- **Base calculation**: `Math.min(screenWidth, screenHeight) * 0.025 * 0.8` (20% reduction applied)
- **Hierarchy**: baseFontSize multipliers (2.2x title, 1.8x subtitle, 1.4x body, 1.0x small)
- Reason: Prevents overflow on smaller screens

### Component Positioning (TimeCapsuleLandscape.tsx)
- **Layout**: `flex: 1` + `justifyContent: 'flex-start'` (NOT 'center' - device inconsistency)
- **Spacing**: Explicit `paddingTop` (e.g., `screenHeight * 0.05`) over centering

## 📊 Data System Details

### Google Sheets Integration
- **Preferred endpoint**: Apps Script Web App URL (returns JSON directly with fallback to CSV)
- **Sheet format**: Must be "Published to web" as CSV (File → Share → "Publish to web")
- **URL pattern**: `docs.google.com/spreadsheets/d/e/{SHEET_ID}/pub?output=csv`
- **Override mechanism**: `src/config/sheets-overrides.json` (gitignored) for testing custom URLs
- **Verification**: Test URL directly in browser - should download raw CSV, not HTML error

### Historical Data Boundaries
- **2020+**: Monthly granular data in `historical-snapshot.ts`
- **Pre-2020**: Yearly data only in `comprehensive-historical-data.ts`
- **1971 cutoff**: Special handling for some datasets (electricity prices, etc.) - see `check-1971.ts`
- **Auto-selection**: `getSnapshotWithHistorical(dateString)` picks correct timeframe automatically

### Snapshot Caching
- First fetch cached in `SNAP_CACHE` (in-memory, `snapshot.ts`)
- Historical data uses static imports (no caching)
- **Clear cache**: Restart Metro dev server to reset

## 🚀 Development Workflows

### Before Any Changes
```bash
npx tsc --noEmit          # Always verify compilation first
git status                # Check what changed
```

### Essential Commands
```bash
npm run android           # Build to Android emulator/device
npx expo start           # Development with Expo Go + Metro
eas build -p android     # Production via EAS (recommended for testing)
npm run fresh            # Nuclear option: clear cache + restart
```

### Data Debugging
```bash
node scripts/checkSheets.js           # Verify Google Sheets connectivity
npx ts-node diagnose-timecapsule.ts  # Debug historical data by date
npx ts-node check-1971.ts            # Test 1971 boundary handling
```

## ⚠️ Danger Zones & How to Handle

### Modifying Data Utilities
**Pattern**: Never directly fetch in components. Always use canonical utilities:
- `getAllSnapshotValues()` → current/live data (baby mode)
- `getSnapshotWithHistorical(dateString)` → historical + current merged (birthday mode)
- `getPopulationForCity(cityName)` → city population lookup (current)
- `getPopulationWithHistoricalContext(city, dateString)` → historical city population (birthday mode)

### Layout/Photo Changes
**Requirement**: Test on BOTH phone and tablet after size changes. Verify:
- Photos don't intersect borders
- Text doesn't overflow container
- Spacing consistent across devices

### TypeScript Errors
**Rule**: NEVER ignore. Run `npx tsc --noEmit` after every edit. Typed route params in `src/types.ts` are strict by design.

## 📝 File Conventions
- **Screens**: `*Screen.tsx` in `src/screens/`
- **Components**: `{ComponentName}Portrait/Landscape.tsx` in `src/components/`
- **Utils**: `kebab-case.ts` in `src/data/utils/`
- **Debug scripts**: kebab-case root (prefix with `diagnose-`, `check-`, `test-`)

## 🔍 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Sheet data not updating | Run `node scripts/checkSheets.js` → verify "Publish to web" → check URL pattern |
| Historical data missing for date | Check if date before 1971 → fallback handled automatically |
| Photos too small/large | Verify photo size calculation includes all multipliers → see CRITICAL_PATTERNS.md |
| Layout breaks on tablet | Test `useWindowDimensions()` values → verify separate Landscape component exists |
| Cache stale after data change | Restart Metro dev server to clear `SNAP_CACHE` |

## 🎁 Project Variants (Know the Modes)

**Baby Mode** (`mode: 'baby'`):
- Single or multiple babies (twins/triplets)
- Uses `getAllSnapshotValues()` for current data
- SmartPhotoLayout handles 1-3 photos

**Birthday/Milestone Mode** (`mode: 'birthday'`):
- Single person with birthday date
- Uses `getSnapshotWithHistorical(dobISO)` for historical data
- Supports extended `milestoneType` options (graduation, wedding, anniversary, etc.)
- Up to 3 photos in grid

---

**Golden Rule**: Production code with precise layout. Understand component flow before changes. Always run `npx tsc --noEmit` before and after edits.
