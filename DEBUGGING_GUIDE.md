# Debugging Guide - Birth Announcement App

## Reading the Console Logs in VS Code

When you run the app with `npx expo start`, all debug logs appear in the Terminal. Here's what to look for:

### Flow 1: App Startup → Form Screen
```
🔍 [Snapshot] getAllSnapshotValues() called
💡 [Snapshot] Cache MISS - fetching fresh data...
🔗 [Snapshot] Attempting Apps Script fetch first...
✓ [Snapshot] Apps Script SUCCESS - 30 data points loaded
📊 [Snapshot] Sample keys: GASOLINE PRICE, PRESIDENT, US POPULATION, ...
```

### Flow 2: User Enters Hometown
```
🏘️  [FormScreen] User entered hometown: Austin, Texas
⏳ [FormScreen] Loading snapshot and population data...
✓ [FormScreen] Snapshot data received: 30 keys
📊 [FormScreen] Population result: {
  hometown: "Austin, Texas",
  year: 2024,
  population: 982,456,
  notIncorporated: false
}
✓ [FormScreen] Data fetch complete
```

### Flow 3: Build & Navigate to Preview
```
🚀 NAVIGATING TO PREVIEW - population: 982456

🏙️  [FormScreen] Fetching city data for: "Austin, Texas"
✓ [FormScreen] City data result: {lat: 30.27, lng: -97.74, ...}
✓ [FormScreen] Coordinates added to payload: {lat: 30.27, lng: -97.74}

📤 [FormScreen] Full payload being sent to Preview:
{
  "theme": "green",
  "mode": "baby",
  "hometown": "Austin, Texas",
  "population": 982456,
  "babies": [...],
  "snapshot": {...}
}
```

### Flow 4: Preview Screen Loads
```
📸 [PreviewScreen] Mounted - fetching current snapshot for "Then vs Now"
📍 Route params: {
  hometown: "Austin, Texas",
  mode: "baby",
  personName: "Baby Smith"
}
✓ [PreviewScreen] Current snapshot fetched successfully
📊 [PreviewScreen] Snapshot contains: 30 keys
```

## Emoji Legend

| Emoji | Meaning |
|-------|---------|
| 🔍 | Starting a search/fetch operation |
| 💡 | Cache miss (fetching fresh data) |
| ✓ | Success |
| ⚠️  | Warning (non-critical issue) |
| ❌ | Error |
| 📊 | Data/statistics info |
| 🏘️  | Location/hometown related |
| ⏳ | Loading/waiting |
| 🔗 | Network request |
| 📸 | Screen/view related |
| 📍 | Navigation params |
| 🚀 | Navigation event |
| 🏙️  | City data |
| 📤 | Outgoing data |
| 📄 | File/CSV related |
| 📋 | Data structure/format |

## Common Issues & How to Debug

### Issue: "CACHE MISS" on every load
**Fix**: Restart the Metro server (`Ctrl+C` in terminal, then `npx expo start`)

### Issue: "Apps Script returned HTML instead of JSON"  
**Log**: `⚠️  [Snapshot] Apps Script returned HTML instead of JSON`
**Fix**: Check the Google Sheets endpoint URL in `src/data/utils/sheets.ts`

### Issue: City population shows as null/zero
**Log**: `📊 [FormScreen] Population result: ... "population": null`
**Fix**: Verify the city name format is "City, State" (e.g., "Austin, Texas")

### Issue: Coordinates not loading
**Log**: `⚠️  [FormScreen] Could not fetch city coordinates`
**Fix**: Check if `city-coordinates.csv` exists and is properly formatted

### Issue: Data not updating after changes
**Log**: `💡 [Snapshot] Cache MISS` should appear if cache is cleared
**Fix**: Look for this emoji - if you see "Cache HIT" instead, data is stale

## Pro Tips

1. **Search in Terminal**: Use `Ctrl+F` in VS Code terminal to search for `[PreviewScreen]` or `[FormScreen]`
2. **Filter by Log Level**: Search for `✓` (success), `❌` (errors), or `⚠️` (warnings)
3. **Track Full Data Flow**: Follow the emojis chronologically to see exactly what data is being passed
4. **Check Timestamps**: Metro shows timestamps - useful for spotting performance issues

## Sample Complete Debug Session

```
✓ [Snapshot] Apps Script SUCCESS - 30 data points loaded
  └─ Snapshot is cached and ready

🏘️  [FormScreen] User entered hometown: Austin, Texas
⏳ [FormScreen] Loading snapshot and population data...
✓ [FormScreen] Snapshot data received: 30 keys
📊 [FormScreen] Population result: {...year: 2024, population: 982456}
✓ [FormScreen] Data fetch complete
  └─ All hometown data loaded successfully

🚀 NAVIGATING TO PREVIEW
🏙️  [FormScreen] Fetching city data for: "Austin, Texas"
✓ [FormScreen] Coordinates added to payload: {lat: 30.27, lng: -97.74}
📤 [FormScreen] Full payload: {...}
  └─ Everything is ready to render

📸 [PreviewScreen] Mounted
✓ [PreviewScreen] Current snapshot fetched successfully
  └─ Preview screen rendering with all data
```
