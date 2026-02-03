# TYPOGRAPHY SPECIFICATION - LOCKED & IMMUTABLE

**Status:** ✅ LOCKED - DO NOT MODIFY UNLESS EXPLICITLY INSTRUCTED BY USER
**Last Updated:** February 1, 2026
**Preserved From:** Complex multi-day refinement session
**Critical Note:** This specification handles variable-length content (long city names, long baby names) while maintaining professional design across all devices.

---

## BASE CALCULATION SYSTEM

```
displayWidth = LANDSCAPE_WIDTH * previewScale
displayHeight = LANDSCAPE_HEIGHT * previewScale

baseFontSize = Math.round(displayHeight * 0.0675 * 0.5 * 1.15)
unifiedFontSize = Math.round(baseFontSize * 1.25)  // Tier 1 standard
citySize = Math.round(baseFontSize * 1.10)         // Tier 2 (city/baby names)
babyNameFontSize = citySize                        // Must match city size exactly
```

---

## TYPOGRAPHIC HIERARCHY - CURRENT SESSION OVERRIDES

### WELCOME TO
- **fontSize:** `Math.round(unifiedFontSize * 1.953125)`
- **fontWeight:** '700'
- **fontStyle:** 'italic'
- **fontFamily:** 'cursive'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.0009375`
- **transform:** `[{ scaleX: 1.25 }]` — 25% horizontal stretch
- **Purpose:** Lead text, eye-catching, script style for elegance

### CITY, STATE (AutoFitText)
- **fontSize:** `citySize` (= `baseFontSize * 1.10`)
- **fontWeight:** '900'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.00046875`
- **maxWidth:** `displayWidth * 0.85` — prevents overflow
- **AutoFitText behavior:** Reduces font size if text exceeds container (min 8px)
- **Purpose:** Variable-length accommodation for long city names

### POPULATION (Label)
- **fontSize:** `Math.round(unifiedFontSize * 1.625)`
- **fontWeight:** '800'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.000234375`
- **transform:** `[{ scaleX: 1.30 }]` — 30% horizontal stretch
- **letterSpacing:** 2.5
- **Purpose:** Emphasize demographic data with stretched lettering

### POPULATION (Number)
- **fontSize:** `Math.round(unifiedFontSize * 1.625)` — MATCHES POPULATION LABEL
- **fontWeight:** '900'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.00046875`
- **letterSpacing:** 2.5
- **format:** `population.toLocaleString()` (adds commas for readability)
- **Purpose:** Bold demographic number, consistent sizing with label

### +1
- **fontSize:** `Math.round(unifiedFontSize * 1.30)`
- **fontWeight:** '900'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.00046875`
- **Purpose:** Celebrate new arrival with emphasis

### BABY NAME (AutoFitText)
- **fontSize:** `babyNameFontSize` (= `citySize` = `baseFontSize * 1.10`)
- **fontWeight:** '900'
- **color:** '#FFFFFF'
- **marginTop:** `padding * 0.000703125`
- **maxWidth:** `displayWidth * 0.85` — prevents overflow
- **AutoFitText behavior:** Reduces font size for very long names (min 8px)
- **numberOfLines:** 1 with ellipsize tail for extreme cases
- **Purpose:** Feature baby/babies' names with accommodation for variable lengths

---

## CONTAINER & SPACING

### Parent Content View
- **padding:** `padding * 0.1` — **KEY CONTROL FOR OVERALL GAPS**
  - **History:** Reduced from 0.8 to 0.1 during session (critical fix)
  - **Note:** "Parent container padding controls overall spacing" — user discovery
- **justifyContent:** 'flex-start'
- **alignItems:** 'center'
- **width:** '100%'
- **height:** '100%'

### Calculated Values
```
padding = Math.round(displayWidth * 0.005)
borderWidth = Math.round(displayWidth * 0.02)
```

### Design Borders
- **Outer border:** White, width = `displayWidth * 0.95`, height = `displayHeight * 0.95`
- **Border width:** `borderWidth`, borderRadius: `displayWidth * 0.03`
- **Inner radius:** `displayWidth * 0.02`

---

## VARIABLE CONTENT HANDLING

### Long City Names (e.g., "Albuquerque, New Mexico")
- AutoFitText component reduces fontSize if exceeds `displayWidth * 0.85`
- Minimum font size floor: 8px
- Reduction rate: More aggressive for text > 50 chars (3px steps vs 2px)

### Long Baby Names (e.g., "Alexander Christopher Jackson-Smith")
- AutoFitText component with same responsive behavior
- maxWidth: `displayWidth * 0.85`
- Fallback: Truncates to 97 chars + "..." for extreme cases
- numberOfLines: 1 with ellipsizeMode: 'tail'

### Multiple Babies (2-5 children)
- Names combined with "&" separator: "Alexander & Benjamin"
- Pattern: "First & Second" (2 babies) or "First, Second & Third" (3+ babies)
- Formatted as single first-name line + shared last name (separate)

---

## PHOTO SIZING SYSTEM

Calculated dynamically based on available space after text:

```
welcomeTextHeight = unifiedFontSize * 1.3
babyNameHeight = babyNameFontSize * 1.4
cityTextHeight = citySize * 1.3
populationTextHeight = unifiedFontSize * 1.3

totalTextHeight = sum of above
totalTextAreaWithMargins = totalTextHeight + (padding * 2) + (padding * 1.5)

availablePhotoSpace = (displayHeight * 0.95) - totalTextAreaWithMargins
maxPhotoSpace = availablePhotoSpace - (displayHeight * 0.05)

calculatedPhotoSize = Math.round(maxPhotoSpace * 0.8 * 0.7)
photoSize = Math.max(minPhotoSize, Math.min(maxPhotoSize, calculatedPhotoSize))

minPhotoSize = displayHeight * 0.15 (15% of height)
maxPhotoSize = displayHeight * 0.35 (35% of height)
```

---

## DEVICE-INDEPENDENT RENDERING

**Target Output:** 3300×2550px landscape (11"×8.5" @ 300 DPI)

**Requirement:** Identical visual output across all device sizes
- Phone (small previewScale)
- Tablet (medium previewScale)
- Desktop/Web (large previewScale)

**Mechanism:** All values derived from `displayHeight` and `displayWidth` (calculated from LANDSCAPE_WIDTH/HEIGHT × previewScale)

**No fixed pixels:** Everything scales proportionally

---

## COLOR SCHEME INTEGRATION

```
colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green
backgroundColor: colors.bg
textColor: '#FFFFFF' (all text)
borderColor: '#FFFFFF' (outer border)
```

---

## KNOWN BEHAVIOR & CONSTRAINTS

✅ **What works:**
- Long city names handled gracefully with AutoFitText
- Long baby names scale down appropriately
- Multiple babies properly formatted
- Professional appearance maintained across all variations
- Spacing controlled by parent padding (0.1) not individual marginTop

⚠️ **Edge cases:**
- Extremely long names (>100 chars) truncated with ellipsis
- lineHeight property should NOT be modified (attempted fix failed)
- marginTop values are minimal (near-zero); gaps controlled by parent padding

---

## MODIFICATION HISTORY

**This Session (Feb 1, 2026):**
1. Welcome To: Increased from 1.5625 → 1.953125 (56% larger)
2. POPULATION & +1: Increased 1.30 → 1.625 (30% larger)
3. Added width stretches (Welcome To 25%, POPULATION 30%)
4. Added letterSpacing: 2.5 to POPULATION and number
5. Reduced all marginTop values to near-zero
6. **Critical Discovery:** Parent padding (0.1) is primary gap controller
7. Attempted lineHeight: 1 fix → REVERTED (failed approach)

**Previous Sessions:**
- Initial base calculation system established
- AutoFitText component created for variable content
- Photo sizing algorithm developed
- Color scheme integration

---

## FUTURE MODIFICATIONS - PROCESS

**IF you need to adjust typography in future:**

1. **Identify the element** (Welcome To, POPULATION, etc.)
2. **Understand the constraint:** What problem are you solving?
3. **Document baseline:** Current multiplier value
4. **Test systematically:** One change at a time
5. **Reload & verify:** Check on tablet/preview
6. **Update this spec:** If change is intentional, document here
7. **Preserve multiplier:** Keep multiplier values in code comments

**CRITICAL:** Do not remove values. Comment changes with reason.

---

## QUESTIONS FOR USER VALIDATION

- [ ] Is current visual appearance locked/approved?
- [ ] Are there specific customer scenarios to test (longest names, etc.)?
- [ ] Any adjustments still needed before final lock?

---

**THIS SPECIFICATION IS IMMUTABLE**
Do not suggest modifications without explicit user request.
All values represent carefully balanced design decisions from multi-day refinement.
