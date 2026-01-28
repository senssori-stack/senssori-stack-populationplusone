# Birth Announcement Studio - Quick Reference for AI Assistants

## EMERGENCY COMMANDS (Use These First)
```bash
# Check if code compiles (ALWAYS run after changes)
npx tsc --noEmit

# Start app fresh (if things break)
npx expo start --clear

# Test Google Sheets (if data issues)
node scripts/checkSheets.js

# Check git status (if need to revert)
git status
```

## CRITICAL FILES (Handle With Extreme Care)
- `components/SignFrontLandscape.tsx` - Main announcement layout
- `components/TimeCapsuleLandscape.tsx` - Historical data display  
- `components/SmartPhotoLayout.tsx` - Photo arrangements
- `src/data/utils/sheets.ts` - Google Sheets integration
- `src/data/utils/comprehensive-historical-data.ts` - Historical data

## RECENT FIXES (DO NOT BREAK)
1. **Font sizing**: SignFrontLandscape uses `baseFontSize * 0.8` (20% reduction)
2. **Photo sizing**: Conservative calculations prevent border intersection
3. **Twin photos**: Now same size as single baby (not reduced)
4. **TimeCapsule positioning**: Uses flex-start with paddingTop

## SAFE WORKFLOW
1. `read_file` extensively before changes
2. `npx tsc --noEmit` before editing
3. Small incremental changes only
4. Include 3-5 lines context in replacements
5. `npx tsc --noEmit` after editing
6. Test on phone and tablet

## DANGER ZONES
- Never modify data utilities without deep understanding
- Never change layout math without device testing
- Never ignore TypeScript errors
- Never make large rewrites

This is **production-ready code** with **4 months of work**. Preserve and enhance, never rebuild.