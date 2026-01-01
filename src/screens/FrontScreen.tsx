import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import SignFront, { FRONT_BASE_WIDTH } from '../../components/SignFront';
import TimeCapsuleBack from '../../components/TimeCapsuleBack';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import { getPopulationForCity } from '../data/utils/populations';
import { getZodiacFromISO } from '../data/utils/zodiac';
import { birthstoneFromISO } from '../data/utils/birthstone';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, PreviewParams } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Front'>;

export default function FrontScreen({ route }: Props) {
  const params: Partial<PreviewParams> = route.params ?? {};
  const [mode, setMode] = React.useState<'front' | 'back'>('front');
  const { width } = useWindowDimensions();
  const [population, setPopulation] = React.useState<number | null>(null);
  const [snapshot, setSnapshot] = React.useState<Record<string, string> | null>(null);
  const [loadingData, setLoadingData] = React.useState<boolean>(true);

  // Calculate a previewScale so the FRONT_BASE_WIDTH content scales to fit within
  // the portrait device width while remaining readable. We keep a small margin.
  const maxDisplayWidth = Math.max(320, width - 32);
  // Use a slightly smaller effective base so the front appears a bit larger on device
  // while still fitting inside the visible white border. Cap at 1 (no upscale beyond design).
  const effectiveBase = (FRONT_BASE_WIDTH || 900) * 0.9;
  const previewScale = Math.min(1, maxDisplayWidth / effectiveBase);

  // Load external data (snapshot + population) when params.hometown changes
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingData(true);
      try {
        const snap = await getAllSnapshotValues();
        let pop: number | null = null;
        if (params.hometown && params.hometown.trim()) {
          try { pop = await getPopulationForCity(params.hometown as string); } catch (e) { console.warn('population lookup failed', e); }
        }
        if (!mounted) return;
        setSnapshot(snap ?? {});
        setPopulation(pop ?? null);
      } catch (err) {
        console.warn('Failed to load snapshot/population', err);
        if (mounted) {
          setSnapshot({});
          setPopulation(null);
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [params.hometown]);

  // derive zodiac and birthstone from DOB ISO
  const zodiac = React.useMemo(() => getZodiacFromISO(params.dobISO ?? ''), [params.dobISO]);
  const birthstone = React.useMemo(() => birthstoneFromISO(params.dobISO ?? ''), [params.dobISO]);

  return (
    <SafeAreaView style={S.container}>
      <View style={S.toggleRow}>
        <TouchableOpacity onPress={() => setMode('front')} style={[S.toggleBtn, mode === 'front' && S.toggleActive]}>
          <Text style={[S.toggleText, mode === 'front' && S.toggleTextActive]}>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('back')} style={[S.toggleBtn, mode === 'back' && S.toggleActive]}>
          <Text style={[S.toggleText, mode === 'back' && S.toggleTextActive]}>Time Capsule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={S.scroll}>
        {mode === 'front' ? (
          <SignFront
            theme={(params.theme as any) ?? 'green'}
            hometown={params.hometown ?? ''}
            population={population}
            // force portrait layout — vertical-only signfront per request
            forceOrientation={'portrait'}
            babies={params.babies as any}
            babyName={params.babyFirst ? [params.babyFirst, params.babyMiddle, params.babyLast].filter(Boolean).join(' ') : undefined}
            photoUri={params.photoUri ?? null}
            previewScale={previewScale}
          />
        ) : (
          <TimeCapsuleBack
            theme={(params.theme as any) ?? 'green'}
            babies={params.babies as any}
            babyName={params.babyFirst ? [params.babyFirst, params.babyMiddle, params.babyLast].filter(Boolean).join(' ') : undefined}
            dobISO={params.dobISO ?? ''}
            motherName={params.motherName ?? ''}
            fatherName={params.fatherName ?? ''}
            weightLb={params.weightLb ?? ''}
            weightOz={params.weightOz ?? ''}
            lengthIn={params.lengthIn ?? ''}
            hometown={params.hometown ?? ''}
            snapshot={snapshot ?? {}}
            zodiac={zodiac}
            birthstone={birthstone}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#224c39' },
  scroll: { padding: 16, alignItems: 'center' },
  toggleRow: { flexDirection: 'row', padding: 12, justifyContent: 'center', gap: 12 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'transparent' },
  toggleActive: { backgroundColor: '#ffffff22' },
  toggleText: { color: '#fff', fontWeight: '800' },
  toggleTextActive: { color: '#fff' },
});
