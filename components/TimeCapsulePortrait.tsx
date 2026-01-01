import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { formatSnapshotValue } from '../src/data/utils/formatSnapshot';
import { getSnapshotWithHistorical } from '../src/data/utils/historical-snapshot';
import type { ThemeName } from '../src/types';

export const PORTRAIT_WIDTH = 2550;
export const PORTRAIT_HEIGHT = 3300;

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
  { label: 'US Population', key: 'US POPULATION' },
  { label: 'World Population', key: 'WORLD POPULATION' },
  { label: 'President', key: 'PRESIDENT' },
  { label: 'Vice President', key: 'VICE PRESIDENT' },
  { label: '#1 Song', key: '#1 SONG' },
  { label: 'Won Last Superbowl', key: 'WON LAST SUPERBOWL' },
  { label: 'Won Last World Series', key: 'WON LAST WORLD SERIES' },
];

// Auto-fit text component for baby names
function AutoFitName({ text, style, maxWidth }: { text: string; style?: any; maxWidth: number }) {
  const [fontSize, setFontSize] = useState<number>((style && style.fontSize) || 28);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const minSize = 14;

  useEffect(() => {
    setFontSize((style && style.fontSize) || 28);
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

export default function TimeCapsulePortrait(props: Props) {
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
  const displayWidth = PORTRAIT_WIDTH * previewScale;
  const displayHeight = PORTRAIT_HEIGHT * previewScale;

  // Font sizes scaled to portrait dimensions
  const titleSize = Math.round(displayWidth * 0.027165); // Baby name size
  const timeCapsuleTitleSize = Math.round(titleSize * 1.25); // TIME CAPSULE: 25% larger
  const bodySize = Math.round(displayWidth * 0.020549);
  const labelSize = Math.round(displayWidth * 0.015);
  const valueSize = Math.round(displayWidth * 0.015);
  const sourcesSize = Math.round(displayWidth * 0.008058);

  // Border and padding
  const borderWidth = Math.round(displayWidth * 0.015);
  const padding = Math.round(displayWidth * 0.02);

  // Build baby names with smart middle initial logic
  const babyNames: string[] = [];
  if (babies && babies.length > 0) {
    for (const b of babies) {
      const first = b.first || '';
      const middle = b.middle || '';
      const last = b.last || '';
      // Use middle initial for longer names to prevent overflow
      const middleInitial = middle ? middle.charAt(0) + '.' : '';
      const p = [first, middleInitial, last].filter(Boolean).join(' ');
      if (p) babyNames.push(p);
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
  } catch (e) {
    // Fallback to original if date parsing fails
  }

  const parts: string[] = [];

  // "[Baby Name] was born on [DOB] in [City, State]."
  parts.push(`${namesForSentence} was born on ${formattedDate} in ${hometown}`);

  // "[Baby first name]'s parents are mother, [Mother's name] and [Father name]."
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

  // "Here is some interesting information associated with this birthday."
  parts.push(`Here is some interesting information associated with this birthday`);

  // Ensure all parts are strings and filter out empty ones
  const validParts = parts.filter(part => part && typeof part === 'string' && part.trim().length > 0);
  let intro = validParts.join('. ').replace(/\.\s*\./g, '.').replace(/\s+\./g, '.');
  // Ensure a period at the end
  if (intro && !intro.trim().endsWith('.')) {
    intro = intro.trim() + '.';
  }

  // Build data rows using historical snapshot data
  const rows: [string, string][] = [
    ['Zodiac', zodiac],
    ['Birthstone', birthstone],
    ...SNAP_KEYS.map(({ label, key }) => [label, formatSnapshotValue(key, historicalSnapshot[key] ?? '')] as [string, string]),
  ];

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight, backgroundColor: colors.bg }]}>
      {/* White outer border */}
      <View style={[styles.border, {
        borderWidth,
        borderColor: colors.border || '#FFFFFF',
        margin: padding,
        flex: 1,
        borderRadius: Math.round(displayWidth * 0.03)
      }]}>
        {/* Inner content area */}
        <View style={[styles.content, {
          backgroundColor: colors.bg,
          padding: padding * 0.8,
          paddingTop: padding * 0.8 - (450 * previewScale) + (300 * previewScale),
          borderRadius: Math.round(displayWidth * 0.02)
        }]}>
          {/* Header with baby name and "Time Capsule" */}
          <AutoFitName
            text={`${babyNames.join(' & ')}${babyNames.length ? "'s" : ''}`}
            style={[styles.title, { fontSize: titleSize, color: colors.text }]}
            maxWidth={displayWidth * 0.8}
          />
          <Text style={[styles.title, { fontSize: timeCapsuleTitleSize, color: colors.text, marginTop: titleSize * 0.2 }]}>
            Time Capsule
          </Text>

          {/* Body text */}
          <Text style={[styles.body, {
            fontSize: bodySize,
            color: colors.text,
            marginTop: padding * 0.5,
            textAlign: 'center',
            lineHeight: bodySize * 1.4
          }]}>
            {intro || 'Welcome to the world!'}
          </Text>

          {/* Divider line */}
          <View style={[styles.divider, {
            backgroundColor: colors.border || '#FFFFFF',
            marginVertical: padding * 0.4,
            height: 1
          }]} />

          {/* Data rows */}
          <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
            {rows.map(([label, value]) => (
              <View key={label} style={[styles.row, {
                paddingVertical: Math.round(displayWidth * 0.004), // Increased padding for better spacing
                marginVertical: Math.round(displayWidth * 0.002), // Added margin for even distribution
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

          {/* Sources */}
          <Text style={[styles.sources, {
            fontSize: sourcesSize,
            color: colors.text,
            marginTop: padding * 0.3
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
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    lineHeight: 19,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
});