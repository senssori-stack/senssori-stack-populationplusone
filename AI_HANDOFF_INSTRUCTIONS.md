# AI Assistant Handoff Instructions - Birth Announcement Studio

## 🚨 CRITICAL: READ THIS FIRST BEFORE MAKING ANY CHANGES

This is a **production-ready React Native Expo app** that generates personalized birth announcements with historical "time capsule" data. **4 months of development work** - treat with extreme care.

## 🔒 GOLDEN RULES - NEVER BREAK THESE

1. **ALWAYS run `npx tsc --noEmit` before and after ANY code changes**
2. **NEVER edit files without reading the full context first** - use `read_file` extensively
3. **ALWAYS include 3-5 lines of context** when using `replace_string_in_file`
4. **TEST on both phone and tablet** after layout changes
5. **BACKUP before major changes** - this code is irreplaceable

## 📱 App Architecture Overview

### Core Value Proposition
- Generates birth announcements with historical data from baby's birth date
- Shows gas prices, population, presidential info, etc. from that exact time
- 4 layout variants: Front/TimeCapsule × Portrait/Landscape
- Professional print-ready output with precise sizing

### Data Flow (CRITICAL - Don't Break This)
```
Google Sheets (live data) → Historical Data (110 years) → Layout Components → Print Output
```

**Data Sources:**
- `src/data/utils/sheets.ts` - Google Sheets integration with CSV URLs
- `src/data/utils/comprehensive-historical-data.ts` - 110-year historical dataset
- `src/data/utils/historical-snapshot.ts` - Monthly data 2020+

### Key Components (Handle With Care)
1. **SignFrontLandscape.tsx** - Main announcement layout
2. **TimeCapsuleLandscape.tsx** - Historical data display
3. **SmartPhotoLayout.tsx** - Photo arrangements (single/twins/triplets)
4. **FormScreen.tsx** - User input form

## 🛠️ Safe Development Workflow

### Before Making Changes
1. Read the relevant files completely: `read_file` with large line ranges
2. Check current state: `npx tsc --noEmit`
3. Understand the data flow and component relationships
4. Test the current functionality first

### Making Changes
1. **Small, incremental changes only** - never large rewrites
2. **Always preserve existing functionality** - this is production code
3. **Include context** in `replace_string_in_file` - 3-5 lines before/after
4. **Test immediately** after each change

### After Changes
1. **Compile check**: `npx tsc --noEmit`
2. **Start app**: `npx expo start --clear`
3. **Test layouts**: Check all 4 variants (Front/TimeCapsule × Portrait/Landscape)
4. **Device testing**: Test on both phone and tablet if layout-related

## 📊 Recent Critical Fixes (DO NOT BREAK)

### Font Sizing System
- **SignFrontLandscape.tsx**: Applied 20% font reduction (baseFontSize * 0.8)
- **Critical**: Fonts are precisely tuned for readability across devices

### Photo Sizing Logic
- **SmartPhotoLayout.tsx**: Twin photos now same size as single baby photos
- **SignFrontLandscape.tsx**: Conservative photo sizing (28% max, 8% safety margin)
- **Critical**: Prevents photo border intersection issues

### Layout Positioning
- **TimeCapsuleLandscape.tsx**: Fixed positioning consistency between devices
- **Critical**: Uses flex-start with paddingTop, not center alignment

## 🚨 Common Pitfalls (AVOID THESE)

### Data Issues
- **NEVER** hardcode historical data - use the data utilities
- **NEVER** bypass the Google Sheets integration
- **ALWAYS** test with `scripts/checkSheets.js` if data issues occur

### Layout Issues
- **NEVER** change font sizing without testing on both devices
- **NEVER** modify photo sizing without understanding the border constraints
- **NEVER** change flex positioning without device testing

### TypeScript Issues
- **ALWAYS** fix TypeScript errors immediately - they cascade
- **NEVER** use `any` types - this is strictly typed code
- **ALWAYS** import types from `src/types.ts`

## 🔧 Debug Commands (Use These First)

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Test Google Sheets connectivity
node scripts/checkSheets.js

# Start app with clean cache
npx expo start --clear

# Debug historical data for specific dates
npx ts-node diagnose-timecapsule.ts
```

## 📁 File Modification Safety Levels

### 🟢 SAFE to modify (with care)
- Component styling (colors, spacing)
- New features that don't affect existing layouts
- Form validation logic
- Debug utilities

### 🟡 MODERATE RISK (expert level only)
- Font sizing calculations
- Photo sizing logic
- Layout positioning
- Data formatting

### 🔴 HIGH RISK (avoid unless critical)
- Data fetching utilities (`sheets.ts`, `snapshot.ts`)
- Historical data files
- Core layout components
- Navigation structure

## 💾 Emergency Recovery

If something breaks:

1. **Check git status**: `git status`
2. **Revert if needed**: `git checkout -- filename.tsx`
3. **Clean restart**: `npx expo start --clear`
4. **Check compilation**: `npx tsc --noEmit`

## 🎯 Current State (November 2, 2025)

### Recently Completed
- ✅ Front landscape font sizing (20% reduction)
- ✅ TimeCapsule positioning consistency
- ✅ Photo border intersection fix
- ✅ Twin photo sizing optimization

### Known Working State
- All 4 layouts tested and working on phone/tablet
- Google Sheets integration functional
- Historical data accurate and comprehensive
- Print system ready for production

### Active Development
- App is in final testing phase
- All core features complete and stable
- Focus on polish and optimization only

## 📞 If You Need Help

1. **Read the project documentation** in `.github/copilot-instructions.md`
2. **Check recent conversation history** for context
3. **Test small changes** before making larger ones
4. **Use the debug tools** before assuming data issues

## 🚀 Remember: This is Production Code

This app represents **4 months of development work** and is **ready for launch**. Every component has been carefully optimized, every layout has been tested, and every data source has been validated.

**Your job is to preserve and enhance, never to rebuild.**

When in doubt, make smaller changes and test thoroughly. This codebase is a work of art - treat it as such.

---

*Created November 2, 2025 - Preserve this knowledge for future AI assistants*