# Birth Announcement Studio - Typography Rules

## Established Font Hierarchy (Based on Perfected Front Landscape)

### Base Font Calculation
```typescript
const baseFontSize = Math.round(displayHeight * 0.0675 * 0.5 * 1.15);
```

### Font Size Hierarchy - LOCKED RULES

#### **Tier 1: Standard Text Elements** (25% larger than base)
```typescript
const unifiedFontSize = Math.round(baseFontSize * 1.25); // 25% increase
```
**Elements using this size:**
- "WELCOME TO" text
- "POPULATION" label  
- Population number
- "+1" addition text
- Other supplementary text

#### **Tier 2: Prominent Text Elements** (25% larger than base - SAME as Tier 1)
```typescript
const citySize = Math.round(baseFontSize * 1.25); // 25% increase
const babyNameFontSize = citySize; // Matches city size exactly
```
**Elements using this size:**
- City, State text
- Baby name
- Other primary location/name elements

### Key Design Principle
**UNIFORM PROMINENCE**: Both tiers use the exact same 25% increase, creating a balanced, professional hierarchy where no single element dominates the design.

## Implementation Guidelines

## FINAL LOCKED FONT HIERARCHIES ✅

### Front Landscape (SignFrontLandscape.tsx) - ✅ LOCKED FINAL
- Base calculation: `displayHeight * 0.0675 * 0.5 * 1.15`
- **Standard text**: `baseFontSize * 1.25` (25% larger) - WELCOME TO, POPULATION, number, +1
- **City/Baby name**: `baseFontSize * 1.10` (10% larger) - City/State, Baby Name
- **HIERARCHY RULE**: Standard text 15 percentage points larger than city/baby name
- Status: **LOCKED FINAL - DO NOT CHANGE**

### Front Portrait (SignFrontPortrait.tsx) - ✅ LOCKED FINAL
- Base calculation: `displayWidth * 0.054 * fontScale * 1.17`
- **Standard text**: `baseFont * 1.25` (25% larger) - WELCOME TO, POPULATION, number, +1
- **City/Baby name**: `baseFont * 1.60` (60% larger) - City/State, Baby Name
- **HIERARCHY RULE**: City/Baby name 35 percentage points larger than standard text
- Status: **LOCKED FINAL - DO NOT CHANGE**

## CONSISTENCY RULES FOR VARYING TEXT LENGTHS

### AutoFitText Implementation Pattern:
```typescript
// For City/State text
<AutoFitText 
  text={cityText.toUpperCase()}
  style={[styles.text, { fontWeight: '900', color: '#FFFFFF' }]}
  maxWidth={displayWidth * 0.85}  // 85% of display width
  minFontSize={18}                // Minimum readable size
  maxFontSize={cityMaxSize}       // Calculated hierarchy size
/>

// For Baby Name text  
<AutoFitText 
  text={babyName.toUpperCase()}
  style={[styles.text, { fontWeight: '900', color: '#FFFFFF' }]}
  maxWidth={displayWidth * 0.85}  // 85% of display width
  minFontSize={24}                // Minimum readable size (larger for names)
  maxFontSize={nameMaxSize}       // Calculated hierarchy size
/>
```

### Consistency Guidelines:
1. **maxWidth**: Always 85% of display width for both city and baby name
2. **minFontSize**: 18px for city/state, 24px for baby names (better readability)
3. **maxFontSize**: Use calculated hierarchy sizes (locked ratios above)
4. **Text Transform**: Always `.toUpperCase()` for consistency
5. **Font Weight**: '900' for prominent text, maintains visual impact even when scaled down
6. **Smart Name Logic**: Use middle initial (not full middle name) to prevent overflow on all pages

### Dynamic Scaling Logic:
- **Short text**: Uses full `maxFontSize` (hierarchy maintained)
- **Long text**: Scales down to fit within `maxWidth`, never below `minFontSize`
- **Very long text**: Hits `minFontSize` limit, ensuring readability over hierarchy
- **Long baby names**: Automatically uses middle initial instead of full middle name

### Smart Middle Initial Implementation:
```typescript
const first = baby.first || '';
const middle = baby.middle || '';
const last = baby.last || '';
const middleInitial = middle ? middle.charAt(0) + '.' : '';
const babyName = [first, middleInitial, last].filter(Boolean).join(' ');
```

## TWINS & TRIPLETS SUPPORT ✅

### Smart Photo Layout System
**All text sizes remain unchanged** - only photo arrangements adapt:

#### **Single Baby** 
- Full photo size maintained
- Standard layout unchanged

#### **Twins (2 babies)**
- **Layout**: Side-by-side photos
- **Size**: Each photo 48% of total area
- **Gap**: 4% spacing between photos

#### **Triplets (3 babies)**
- **Layout**: Triangle arrangement (2 top, 1 bottom centered)
- **Size**: Each photo 42% of total area  
- **Gap**: 8% vertical, 4% horizontal spacing

#### **Quadruplets+ (4+ babies)**
- **Layout**: 2x2 grid arrangement
- **Size**: Each photo 45% of total area
- **Gap**: 5% spacing between photos

### Implementation Features:
- ✅ **Individual photos** for each baby (customer uploads separate images)
- ✅ **Smart scaling** maintains proportions within white border
- ✅ **Text unchanged** - all typography hierarchies preserved
- ✅ **Centered layouts** - photos distributed evenly in available space
- ✅ **Fallback support** - uses single photo if only one provided

### Component Integration:
- **Front Portrait**: `SmartPhotoLayout` component replaces single Image
- **Front Landscape**: `SmartPhotoLayout` component replaces single Image  
- **Time Capsule**: Text already supports multiples ("Emma & Grace's Time Capsule")

**Customer Experience**: Upload individual photos for twins/triplets → automatic professional layout!

### To Apply to Other Components:
1. ⏳ **Time Capsule Portrait** (TimeCapsulePortrait.tsx) 
2. ✅ **Time Capsule Landscape** (TimeCapsuleLandscape.tsx) - UPDATED

## Time Capsule Pages - Custom Hierarchy

### Time Capsule Portrait (TimeCapsulePortrait.tsx) - ✅ UPDATED
- **"TIME CAPSULE" text**: `titleSize * 1.25` (25% larger than baby name)
- **Baby name**: `titleSize` (standard)
- **Stats spacing**: Improved with `justifyContent: 'space-evenly'`
- Status: **UPDATED WITH IMPROVED SPACING**

### Time Capsule Landscape (TimeCapsuleLandscape.tsx) - ✅ UPDATED  
- **Baby name**: `displayHeight * 0.0354 * 2.0 * 0.8` (decreased by 20%)
- **"TIME CAPSULE"**: `displayHeight * 0.01654 * 4.0 * 0.8` (decreased by 20%)
- **Body, labels, values, sources**: All increased by 20% (`* 1.2` multiplier)
- Status: **UPDATED - BALANCED HIERARCHY**

### Migration Pattern:
```typescript
// Replace existing font calculations with:
const baseFontSize = Math.round(displayHeight * 0.0675 * 0.5 * 1.15);
const standardFontSize = Math.round(baseFontSize * 1.25); // For ALL text elements

// Use standardFontSize for:
// - Labels (WELCOME TO, POPULATION, etc.)
// - Primary content (city, baby name, numbers)
// - Secondary content (+1, dates, etc.)
```

## Visual Balance Achieved
- **Equal prominence** between location and baby name
- **Consistent hierarchy** across all text elements
- **Professional appearance** suitable for commercial printing
- **Optimized readability** at print resolution (300 DPI)

## Testing Status
- ✅ Front Landscape: Visually perfect, locked
- ⏳ Other components: Awaiting consistent rule application

---
**Date Established**: November 1, 2025  
**Status**: PRODUCTION READY - LOCKED TYPOGRAPHY RULES