# POPULATION FETCH RULES - CRITICAL REFERENCE
## Created: February 7, 2026

---

## SUMMARY OF CHANGES MADE

### RULE 1: DOB BEFORE 01-01-2020
- City, ST population → fetch from **HISTORICAL CSV**
- URL: `https://docs.google.com/spreadsheets/d/e/2PACX-1vRtWWqA_QoLH3ifffZjlUTdKSBZfpqQ_ATbMj9S9InIVP0aAwMMgLp22GuIXbm0E2IM03vb3qifSrgc/pub?output=csv`
- Used for: **Front Sign population** + **Time Capsule "THEN" section**

### RULE 2: DOB ON OR AFTER 01-01-2020
- City, ST population → fetch from **CURRENT CSV**
- URL: `https://docs.google.com/spreadsheets/d/e/2PACX-1vRq_reAOPvE4ViNdG9ke2iu4oFRqKmFt3CAet1vJCMVzz3-KcpZHsAYJvipPU1AV7A10hzhHjQ5bo97/pub?gid=784058427&single=true&output=csv`
- Used for: **Front Sign population**

### RULE 3: TIME CAPSULE "NOW" SECTION
- ALWAYS use **CURRENT CSV** regardless of DOB
- Function: `getCurrentPopulationForCity(hometown)`

### RULE 4: CITY NOT FOUND
- Returns `null` (no fake/smart fallback)
- Shows popup: "OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT."

---

## FILES MODIFIED

| File | Purpose |
|------|---------|
| `src/data/utils/populations.ts` | Main routing logic - `getPopulationForCity()` and `getCurrentPopulationForCity()` |
| `src/data/utils/historical-populations.ts` | Historical CSV fetch - `getHistoricalPopulationForCity()` |
| `src/screens/FormScreen.tsx` | Baby form - error popup when city not found |
| `screens/LifeMilestonesFormScreen.tsx` | Milestone form - error popup when city not found |
| `components/TimeCapsuleLandscape.tsx` | THEN uses historical, NOW uses current CSV |

---

## KEY FUNCTIONS

```typescript
// For form screens (routes based on DOB):
getPopulationForCity(hometown, dobISO)

// For Time Capsule NOW section (always current):
getCurrentPopulationForCity(hometown)

// For Time Capsule THEN section (historical by year):
getHistoricalPopulationForCity(hometown, birthYear)
```

---

## CSV SOURCES

| Name | Variable | Use Case |
|------|----------|----------|
| CURRENT | `POPULATIONS_CSV_URL` | DOB >= 2020-01-01, Time Capsule NOW |
| HISTORICAL | `HISTORICAL_POPULATIONS_CSV_URL` | DOB < 2020-01-01, Time Capsule THEN |

Both defined in: `src/data/utils/sheets.ts`

---

## IMPORTANT NOTES

1. **DO NOT USE** local `FALLBACK_POPULATIONS` array - causes false results
2. **DO NOT USE** `generateSmartFallback` - removed, causes incorrect data
3. All populations MUST come from Google Sheets CSV
4. If city not found → return `null` and show error popup to user

---

## IF SOMETHING BREAKS

1. Check `src/data/utils/populations.ts` for the routing logic
2. Check if Google Sheets CSV URLs are still valid in `src/data/utils/sheets.ts`
3. Check console logs - they show which CSV source is being used:
   - 🟡 = HISTORICAL CSV (DOB before 2020)
   - 🔵 = CURRENT CSV (DOB on/after 2020)
