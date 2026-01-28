# Critical Code Patterns - Birth Announcement Studio

## Photo Sizing Pattern (SmartPhotoLayout.tsx)
```typescript
// CORRECT - Twin photos same size as single baby
case 2:
  const twinPhotoSize = totalPhotoSize; // Full size, same as single baby
  const twinGap = totalPhotoSize * 0.08; // Gap between twin photos
  
  return (
    <View style={{
      width: totalPhotoSize * 2 + twinGap, // Width for two full photos plus gap
      height: totalPhotoSize,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
```

## Font Sizing Pattern (SignFrontLandscape.tsx)
```typescript
// CORRECT - 20% font reduction applied
const baseFontSize = Math.min(screenWidth, screenHeight) * 0.025 * 0.8; // 20% reduction

// Font hierarchy (all based on baseFontSize * 0.8)
fontSize: baseFontSize * 2.2,    // Main title
fontSize: baseFontSize * 1.8,    // Subtitle  
fontSize: baseFontSize * 1.4,    // Body text
fontSize: baseFontSize * 1.0,    // Small text
```

## Photo Container Pattern (SignFrontLandscape.tsx)  
```typescript
// CORRECT - Conservative sizing prevents border intersection
const availablePhotoSpace = containerHeight * 0.85; // Reduced from 95%
const maxPhotoSize = Math.min(
  screenWidth * 0.28,  // Reduced from 35%
  availablePhotoSpace * 0.70 * 0.65  // More conservative calculation
);
const safetyMargin = containerHeight * 0.08; // Increased from 5%
```

## TimeCapsule Positioning Pattern (TimeCapsuleLandscape.tsx)
```typescript
// CORRECT - Consistent positioning across devices
<View style={{
  flex: 1,
  justifyContent: 'flex-start', // NOT 'center' - causes device inconsistency
  paddingTop: screenHeight * 0.05, // Fixed positioning
  paddingHorizontal: screenWidth * 0.08,
}}>
```

## Data Fetching Pattern
```typescript
// CORRECT - Always use these utilities
import { getAllSnapshotValues } from '../data/utils/snapshot';
import { getSnapshotWithHistorical } from '../data/utils/comprehensive-historical-data';

// For current data
const currentData = await getAllSnapshotValues();

// For historical data by birth date
const historicalData = getSnapshotWithHistorical(birthDate);
```

## NEVER DO THESE:
- ❌ `const twinPhotoSize = totalPhotoSize * 0.45;` (makes twins too small)
- ❌ `justifyContent: 'center'` in TimeCapsule (device inconsistency)
- ❌ `baseFontSize` without `* 0.8` (fonts too large)
- ❌ `availablePhotoSpace * 0.95` (causes border intersection)
- ❌ Direct hardcoded data instead of utilities