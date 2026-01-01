import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { formatSnapshotValue } from '../src/data/utils/formatSnapshot';
import type { ThemeName } from '../src/types';

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

// Simple auto-fit text: reduces fontSize until measured width fits container
function AutoFitName({ text, style }: { text: string; style?: any }) {
  const [fontSize, setFontSize] = useState<number>((style && style.fontSize) || 22);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const minSize = 14;

  useEffect(() => {
    setFontSize((style && style.fontSize) || 22);
  }, [text, style]);

  return (
    <View style={{ width: '100%' }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit={false}
        onLayout={(e) => {
          if (!containerWidth) return;
          const measuredWidth = e.nativeEvent.layout.width;
          if (measuredWidth > containerWidth && fontSize > minSize) {
            setFontSize(s => Math.max(minSize, s - 2));
          }
        }}
        style={[style, { fontSize, textAlign: 'center' }]}
      >
        {text}
      </Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function TimeCapsuleBack(props: Props) {
  const C = COLOR_SCHEMES[props.theme];

  // Use fixed font sizes for both preview and export
  const S = useMemo(
    () =>
      StyleSheet.create({
        card: { borderWidth: 6, borderRadius: 28, padding: 10, borderColor: C.border, backgroundColor: C.bg },
        inner: { borderRadius: 22, padding: 16, backgroundColor: C.bg },
        title: { fontSize: 22, lineHeight: 27, fontWeight: '900', color: C.text, marginBottom: 10, textAlign: 'center' },
        body: { fontSize: 13, lineHeight: 19, color: C.text, marginTop: 10, textAlign: 'center' },
        hr: { height: 1, backgroundColor: C.border, marginVertical: 12, opacity: 0.9 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 6,
          borderBottomWidth: 0.8,
          borderColor: C.border,
        },
        tdLabel: { fontSize: 7, fontWeight: '800', color: C.text },
        tdValue: { fontSize: 7, fontWeight: '800', color: C.text },
        sources: { fontSize: 5, fontWeight: '400', color: C.text, textAlign: 'center', marginTop: 8, opacity: 0.7 },
      }),
    [C],
  );

  // Build baby names
  const babyNames: string[] = [];
  if (props.babies && props.babies.length > 0) {
    for (const b of props.babies) {
      const p = [b.first || '', b.middle || '', b.last || ''].filter(Boolean).join(' ');
      if (p) babyNames.push(p);
    }
  } else if (props.babyName) {
    babyNames.push(props.babyName);
  }

  // Determine a single-first-name to use for possessive/short references
  let babyFirstOnly = '';
  if (props.babies && props.babies.length > 0) {
    const f = props.babies[0].first || '';
    if (f && f.trim()) babyFirstOnly = f.trim();
  }
  if (!babyFirstOnly && props.babyName) {
    const tok = props.babyName.split(' ').map(t => t.trim()).filter(Boolean);
    if (tok.length > 0) babyFirstOnly = tok[0];
  }

  const parts: string[] = [];
  const namesForSentence = babyNames.join(' and ');
  const plural = babyNames.length > 1;

  // 1) Full-name intro
  parts.push(`${namesForSentence} ${plural ? 'were' : 'was'} born on ${formatDate(props.dobISO)}` + (props.hometown && props.hometown.trim() ? ` in ${props.hometown}` : ''));

  // 2) Parents sentence
  const parentParts: string[] = [];
  if (props.motherName && props.motherName.trim()) parentParts.push(`mother, ${props.motherName}`);
  if (props.fatherName && props.fatherName.trim()) parentParts.push(`father, ${props.fatherName}`);
  if (parentParts.length > 0) {
    const owner = babyFirstOnly || namesForSentence || 'The baby';
    parts.push(`${owner}'s parents are ${parentParts.join(' and ')}`);
  }

  // 3) At birth sentence
  const atName = babyFirstOnly || namesForSentence || 'The baby';
  parts.push(`At birth ${atName} weighed ${props.weightLb} lbs ${props.weightOz} oz and measured ${props.lengthIn} inches in length`);

  // 4) Additional lead-in sentence for the snapshot/data list
  const finalLead = babyFirstOnly
    ? `Here is some interesting information associated with this birthday.`
    : `Here is some interesting information associated with this birthday.`;
  parts.push(finalLead);

  // Ensure all parts are strings and filter out empty ones, and always end with a period
  const validParts = parts.filter(part => part && typeof part === 'string' && part.trim().length > 0);
  let intro = validParts.join('. ').replace(/\s+\./g, '.');
  if (intro && !intro.trim().endsWith('.')) {
    intro = intro.trim() + '.';
  }

  // Prepend Zodiac and Birthstone as the top rows
  const rows: [string, string][] = [
    ['Zodiac', props.zodiac],
    ['Birthstone', props.birthstone],
    ...SNAP_KEYS.map(({ label, key }) => [label, formatSnapshotValue(key, props.snapshot[key] ?? '')] as [string, string]),
  ];

  return (
    <View style={[S.card]}>
      <View style={S.inner}>
        {/* Two-line centered header: auto-fit name(s) above a fixed "Time Capsule" label */}
        <AutoFitName text={`${babyNames.join(' & ')}${babyNames.length ? "'s" : ''}`} style={S.title} />
        <Text style={[S.title, { marginTop: 2 }]}>Time Capsule</Text>
        <Text style={S.body}>{intro}</Text>
        <View style={S.hr} />
        {rows.map(([label, value]) => (
          <View key={label} style={S.row}>
            <Text style={S.tdLabel}>{label}</Text>
            <Text style={S.tdValue}>{value}</Text>
          </View>
        ))}
        <Text style={S.sources}>SOURCES: bls.gov, eia.gov, fred.stlouisfed.org, census.gov, archives.gov, billboard.com, wikipedia.org</Text>
      </View>
    </View>
  );
}