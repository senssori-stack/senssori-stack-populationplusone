import React from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import TimeCapsuleBack from '../../components/TimeCapsuleBack';
import { getZodiacFromISO } from '../data/utils/zodiac';
import { birthstoneFromISO } from '../data/utils/birthstone';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, PreviewParams } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Back'>;

export default function BackScreen({ route }: Props) {
  const params: Partial<PreviewParams> = route.params ?? {};

  const zodiac = getZodiacFromISO(params.dobISO ?? '');
  const birthstone = birthstoneFromISO(params.dobISO ?? '');

  return (
    <SafeAreaView style={S.container}>
      <ScrollView contentContainerStyle={S.scroll}>
        <TimeCapsuleBack
          theme={(params.theme as any) ?? 'green'}
          babies={params.babies}
          babyName={params.babyFirst ? [params.babyFirst, params.babyMiddle, params.babyLast].filter(Boolean).join(' ') : undefined}
          dobISO={params.dobISO ?? ''}
          motherName={params.motherName ?? ''}
          fatherName={params.fatherName ?? ''}
          weightLb={params.weightLb ?? ''}
          weightOz={params.weightOz ?? ''}
          lengthIn={params.lengthIn ?? ''}
          hometown={params.hometown ?? ''}
          snapshot={params.snapshot ?? {}}
          zodiac={zodiac}
          birthstone={birthstone}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#224c39' },
  scroll: { padding: 16, alignItems: 'center' },
});
