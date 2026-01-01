# Birth Announcement Studio - AI Coding Agent Instructions

## Project Overview
React Native Expo app that generates personalized birth announcements with historical "time capsule" data (gas prices, presidential info, population stats, etc.) from the baby's birth date. Supports both front-facing announcements and back-side time capsule displays in portrait/landscape orientations.

## Architecture & Data Flow

### Core Data Systems
- **Google Sheets Integration**: Live data via `src/data/utils/sheets.ts` with published CSV URLs
  - Current snapshot data: `SNAPSHOT_CSV_URL` (single row of current values)
  - Population data: `POPULATIONS_CSV_URL` (city population lookup)
  - Override system: `src/config/sheets-overrides.json` for custom URLs
- **Historical Data**: Comprehensive 110-year dataset in `src/data/utils/comprehensive-historical-data.ts`
  - Monthly data from Jan 2020 onwards in `historical-snapshot.ts`
  - Yearly data pre-2020
  - Auto-selects appropriate timeframe based on birth date

### Key Components Structure
- **Form-first flow**: `FormScreen.tsx` → `PreviewScreen.tsx` 
- **Responsive design**: Separate Portrait/Landscape components (`SignFrontPortrait.tsx`, `TimeCapsuleLandscape.tsx`, etc.)
- **Auto-fit text**: Custom `AutoFitText` component in sign components handles dynamic text sizing
- **Theme system**: Color schemes in `src/data/utils/colors.ts` (green/pink/blue themes)

## Development Workflows

### Debug & Testing Commands
```bash
# Check Google Sheets connectivity
node scripts/checkSheets.js

# Debug historical data for specific dates
npx ts-node diagnose-timecapsule.ts

# Test 1971 boundary data (important historical cutoff)
npx ts-node check-1971.ts
```

### Build & Run (Expo bare workflow)
```bash
npm run android          # Local Android build
npx expo start          # Development with Expo Go
eas build -p android    # Production build via EAS
```

## Critical Patterns & Conventions

### Data Fetching Pattern
Always use the canonical data utilities:
- `getAllSnapshotValues()` - current/live data from sheets
- `getSnapshotWithHistorical(dateString)` - historical data for birth date
- `getPopulationForCity(cityName)` - city population lookup

### Component Responsiveness
- Separate components for Portrait vs Landscape orientations
- Use `useWindowDimensions()` for screen-aware layouts
- AutoFitText component pattern for dynamic text sizing within fixed layouts

### Data Override System
- Production uses hardcoded URLs in `sheets.ts`
- Development can override via `src/config/sheets-overrides.json` (gitignored)
- Always test sheet connectivity with `scripts/checkSheets.js` before debugging data issues

### Historical Data Boundaries
- **2020+ boundary**: Monthly granular data available
- **Pre-2020**: Yearly data only
- **1971 boundary**: Special handling for some datasets (see `check-1971.ts`)
- Use `getSnapshotWithHistorical()` which automatically selects appropriate timeframe

## Integration Points

### Google Sheets Publication
- Sheets must be "Published to web" as CSV (not just shared)
- URLs follow pattern: `docs.google.com/spreadsheets/d/e/{SHEET_ID}/pub?output=csv`
- Test URLs directly in browser - should download/display raw CSV, not HTML error page

### Expo Dependencies
- Uses bare workflow (has `android/` folder) + Expo managed dependencies
- Key deps: `expo-print`, `expo-sharing`, `expo-image-picker` for export functionality
- Navigation: React Navigation 7 with typed route params in `src/types.ts`

### Print/Export System
- Components render to capture via `expo-print`
- Print service integration in `PrintServiceScreen.tsx`
- Multiple export formats (photo, canvas, metal, framed prints)

## Common Issues & Solutions

### Sheet Data Problems
1. Run `node scripts/checkSheets.js` first
2. Check if sheet is actually published (not just shared)
3. Verify CSV URL returns raw data, not HTML error page
4. Use overrides file for testing different sheet configurations

### Historical Data Gaps
- Always check date boundaries (1971, 2020) when adding new datasets
- Use fallback logic in `getSnapshotWithHistorical()` for missing data
- Comprehensive data is in multiple files - check both `comprehensive-historical-data.ts` and `historical-snapshot.ts`

### Performance & Caching
- Snapshot data is cached after first fetch (`SNAP_CACHE` in `snapshot.ts`)
- Historical data uses static imports (no caching needed)
- Clear cache by restarting Metro when debugging data issues

## File Naming Conventions
- Screens: `*Screen.tsx` in `src/screens/`
- Components: PascalCase in `components/` (separate Portrait/Landscape variants)
- Utils: kebab-case in `src/data/utils/`
- Debug tools: kebab-case in root (prefix with `diagnose-`, `check-`, `test-`)

When working on this project, prioritize understanding the data flow from Google Sheets → historical data merging → component rendering, as this is the core value proposition of the app.