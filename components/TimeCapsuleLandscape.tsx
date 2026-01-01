import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { formatSnapshotValue } from '../src/data/utils/formatSnapshot';
import { getSnapshotWithHistorical } from '../src/data/utils/historical-snapshot';
import type { ThemeName } from '../src/types';

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
export const LANDSCAPE_WIDTH = 3300;
export const LANDSCAPE_HEIGHT = 2550;

type Props = {
  theme: ThemeName;
  babies?: Array<{ first?: string; middle?: string; last?: string; photoUri?: string | null }>;
  babyName?: string;
  dobISO: string;
  motherName: string;
  fatherName: string;
  weightLb: string;
  weightOz: string;
  lengthIn: string;
  hometown: string;
  snapshot: Record<string, string>;
  zodiac: string;
  birthstone: string;
  previewScale?: number;
};

const SNAP_KEYS: { label: string; key: string }[] = [
  { label: 'Gas (Gallon) — National Avg', key: 'GALLON OF GASOLINE' },
  { label: 'Loaf of Bread', key: 'LOAF OF BREAD' },
  { label: 'Dozen Eggs', key: 'DOZEN EGGS' },
  { label: 'Milk (Gallon)', key: 'GALLON OF MILK' },
  { label: 'Electricity (kWh)', key: 'ELECTRICITY KWH' },
  { label: 'Gold (oz)', key: 'GOLD OZ' },
  { label: 'Silver (oz)', key: 'SILVER OZ' },
  { label: 'Bitcoin (1 BTC)', key: 'BITCOIN 1 BTC' },
  { label: 'Won Last Superbowl', key: 'WON LAST SUPERBOWL' },
  { label: 'Won Last World Series', key: 'WON LAST WORLD SERIES' },
  { label: '#1 Song', key: '#1 SONG' },
  { label: 'US Population', key: 'US POPULATION' },
  { label: 'World Population', key: 'WORLD POPULATION' },
  { label: 'President', key: 'PRESIDENT' },
  { label: 'Vice President', key: 'VICE PRESIDENT' },
];

// Auto-fit text component for baby names
function AutoFitName({ text, style, maxWidth }: { text: string; style?: any; maxWidth: number }) {
  const initialSize = (style && style.fontSize) ? style.fontSize : 14;
  const [fontSize, setFontSize] = useState<number>(initialSize);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const minSize = 8;

  useEffect(() => {
    const newSize = (style && style.fontSize) ? style.fontSize : 14;
    setFontSize(newSize);
  }, [text, style]);

  useEffect(() => {
    if (containerWidth && containerWidth > maxWidth && fontSize > minSize) {
      setFontSize(prev => Math.max(minSize, prev - 1));
    }
  }, [containerWidth, maxWidth, fontSize, minSize]);

  return (
    <Text
      style={[style, { fontSize }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {text}
    </Text>
  );
}

export default function TimeCapsuleLandscape(props: Props) {
  const {
    theme,
    babies,
    babyName,
    dobISO,
    motherName,
    fatherName,
    weightLb,
    weightOz,
    lengthIn,
    hometown,
    zodiac,
    birthstone,
    snapshot,
    previewScale = 0.2,
  } = props;

  // Get historical snapshot data based on birth date
  const [historicalSnapshot, setHistoricalSnapshot] = useState<Record<string, string>>(snapshot || {});

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const historicalData = await getSnapshotWithHistorical(dobISO);
        setHistoricalSnapshot(historicalData);
      } catch (error) {
        console.warn('Failed to load historical data:', error);
        setHistoricalSnapshot(snapshot || {});
      }
    };

    if (dobISO) {
      loadHistoricalData();
    } else {
      setHistoricalSnapshot(snapshot || {});
    }
  }, [dobISO, snapshot]);

  const colors = COLOR_SCHEMES[theme];

  // Calculate dimensions
  const displayWidth = LANDSCAPE_WIDTH * previewScale;
  const displayHeight = LANDSCAPE_HEIGHT * previewScale;

  // Font sizes - ALL fonts reduced by 20% for better spacing
  const titleSize = Math.round(displayHeight * 0.0354 * 2.0 * 0.8 * 0.8); // Baby name: reduced by 20% more
  const timeCapsuleSize = Math.round(displayHeight * 0.01654 * 4.0 * 0.68 * 0.8); // TIME CAPSULE: reduced by 20% more
  const bodySize = Math.round(displayHeight * 0.0152 * 1.32 * 0.8); // Body text: reduced by 20%
  const labelSize = Math.round(displayHeight * 0.016 * 1.2 * 0.8); // Labels: reduced by 20%
  const valueSize = Math.round(displayHeight * 0.016 * 1.2 * 0.8); // Values: reduced by 20%
  const sourcesSize = Math.round(displayHeight * 0.01107421875 * 1.2 * 0.8); // Sources: reduced by 20%

  // Border and padding
  const borderWidth = Math.round(displayHeight * 0.02);
  const padding = Math.round(displayHeight * 0.02);

  // Build baby names with smart middle initial logic - for twins, no last name on first baby
  const babyNames: string[] = [];
  if (babies && babies.length > 0) {
    for (let i = 0; i < babies.length; i++) {
      const b = babies[i];
      const first = b.first || '';
      const middle = b.middle || '';
      const last = b.last || '';
      // Use middle initial for longer names to prevent overflow
      const middleInitial = middle ? middle.charAt(0) + '.' : '';
      
      // For the first baby in twins/multiples, skip the last name to save space
      if (i === 0 && babies.length > 1) {
        const p = [first, middleInitial].filter(Boolean).join(' ');
        if (p) babyNames.push(p);
      } else {
        const p = [first, middleInitial, last].filter(Boolean).join(' ');
        if (p) babyNames.push(p);
      }
    }
  } else if (babyName) {
    babyNames.push(babyName);
  }

  // Get first name for possessive references
  let babyFirstOnly = '';
  if (babies && babies.length > 0) {
    const f = babies[0].first || '';
    if (f && f.trim()) babyFirstOnly = f.trim();
  }
  if (!babyFirstOnly && babyName) {
    const tok = babyName.split(' ').map(t => t.trim()).filter(Boolean);
    if (tok.length > 0) babyFirstOnly = tok[0];
  }

  // Build intro text with new verbiage
  const namesForSentence = babyNames.length > 0 ? babyNames.join(' & ') : 'Baby';

  // Format date from dobISO (YYYY-MM-DD)
  let formattedDate = dobISO;
  try {
    const dateObj = new Date(dobISO + 'T00:00:00');
    formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {}

  const parts: string[] = [];
  parts.push(`${namesForSentence} was born on ${formattedDate} in ${hometown}`);
  const parentParts: string[] = [];
  if (motherName && motherName.trim()) parentParts.push(motherName.trim());
  if (fatherName && fatherName.trim()) parentParts.push(fatherName.trim());
  if (parentParts.length > 0) {
    let parentText = `${babyFirstOnly || namesForSentence}'s parents are `;
    if (motherName && motherName.trim() && fatherName && fatherName.trim()) {
      parentText += `mother, ${motherName.trim()} and father, ${fatherName.trim()}`;
    } else if (motherName && motherName.trim()) {
      parentText += `mother, ${motherName.trim()}`;
    } else if (fatherName && fatherName.trim()) {
      parentText += `father, ${fatherName.trim()}`;
    }
    parts.push(parentText);
  }
  // "At birth [baby first name] weighed [weight] lbs and [weight ounces] oz and measured [length] inches."
  // Skip this line for twins/triplets if measurements aren't provided
  if (weightLb && weightOz && lengthIn && weightLb.trim() && weightOz.trim() && lengthIn.trim()) {
    parts.push(`At birth ${babyFirstOnly || namesForSentence} weighed ${weightLb} lbs and ${weightOz} oz and measured ${lengthIn} inches`);
  }
  parts.push(`Here is some interesting information associated with this birthday`);
  const validParts = parts.filter(part => part && typeof part === 'string' && part.trim().length > 0);
  const intro = validParts.join('. ').replace(/\.\s*\./g, '.').replace(/\s+\./g, '.');

  // Build data rows
  const rows: [string, string][] = [
    ['Zodiac', zodiac],
    ['Birthstone', birthstone],
    ...SNAP_KEYS.map(({ label, key }) => [label, formatSnapshotValue(key, historicalSnapshot[key] ?? '')] as [string, string]),
  ];

  // ====== GREEN: Center all main content vertically and horizontally, exclude sources ======
  return (
    <View style={[styles.container, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: colors.bg,
      overflow: 'hidden',
      position: 'relative'
    }]}>
      {/* White outer border */}
      <View style={[styles.border, {
        borderWidth,
        borderColor: colors.border || '#FFFFFF',
        margin: padding,
        flex: 1,
        borderRadius: Math.round(displayHeight * 0.04)
      }]}>
        {/* Main content centered vertically and horizontally */}
        <View style={{
          flex: 1,
          justifyContent: 'center', // GREEN: center vertically
          alignItems: 'center',     // GREEN: center horizontally
          width: '100%',
          padding: padding * 0.8,
          borderRadius: Math.round(displayHeight * 0.03),
        }}>
          {/* Header with baby name and "Time Capsule" */}
          <Text style={[styles.title, { fontSize: titleSize, color: colors.text, textAlign: 'center' }]}>
            {`${babyNames.join(' & ')}${babyNames.length ? "'s" : ''}`}
          </Text>
          <Text style={[styles.title, { fontSize: timeCapsuleSize * 0.75, color: colors.text, marginTop: timeCapsuleSize * 0.05 }]}>
            Time Capsule
          </Text>

          {/* Body text */}
          <Text style={[styles.body, {
            fontSize: bodySize,
            color: colors.text,
            marginTop: padding * 0.2,  // Reduced from 0.3 for tighter spacing
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: bodySize * 1.1  // Reduced from 1.4 to 1.1 for tighter spacing
          }]}>
            {intro || 'Welcome to the world!'}
          </Text>

          {/* Divider line */}
          <View style={[styles.divider, {
            backgroundColor: colors.border || '#FFFFFF',
            marginVertical: padding * 0.3,
            height: 1
          }]} />

          {/* Data rows */}
          <View style={{ width: '100%' }}>
            {rows.map(([label, value]) => (
              <View key={label} style={[styles.row, {
                paddingVertical: Math.round(displayHeight * 0.0001),
                borderBottomWidth: 0.8,
                borderBottomColor: colors.border || '#FFFFFF'
              }]}>
                <Text style={[styles.label, { fontSize: labelSize, color: colors.text }]}>
                  {label}
                </Text>
                <Text style={[styles.value, { fontSize: valueSize, color: colors.text }]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sources/info at the bottom, not centered */}
        <View style={{
          width: '100%',
          position: 'absolute',
          bottom: padding * 2,
          left: 0,
          alignItems: 'center',
        }}>
          <Text style={[styles.sources, {
            fontSize: sourcesSize,
            color: colors.text,
            marginTop: padding * 0.2
          }]}>
            SOURCES: bls.gov, eia.gov, fred.stlouisfed.org, census.gov, archives.gov, billboard.com, wikipedia.org
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    // flex, justifyContent, alignItems set inline above
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    lineHeight: 16,
  },
  divider: {
    width: '100%',
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '800',
    flex: 1,
    paddingRight: 8,
  },
  value: {
    fontWeight: '800',
    textAlign: 'right',
    minWidth: '40%',
  },
  sources: {
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '400',
  },
});