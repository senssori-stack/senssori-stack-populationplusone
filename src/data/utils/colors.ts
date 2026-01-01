// src/data/utils/colors.ts
import type { ThemeName } from '../../types';

export const COLOR_SCHEMES: Record<ThemeName, {
  bg: string; card: string; text: string; accent: string; border: string;
}> = {
  // Theme background is a solid color; text should be white. Cards use a semi-opaque dark overlay
  green: {
    bg: '#224c39',
    card: 'rgba(0,0,0,0.18)',
    text: '#FFFFFF',
    accent: '#2e8b57',
    border: '#FFFFFF',
  },
  pink: {
    // updated to match the provided "Orchid" swatch (#ED80E9) and soft supporting tones
    bg: '#ED80E9',
    card: 'rgba(0,0,0,0.06)',
    text: '#FFFFFF',
    // light supporting accent taken from the lighter swatches in the screenshot
    accent: '#FCEAFD',
    border: '#FFFFFF',
  },
  blue: {
    // updated to a Dodger-style blue (inferred from the screenshot)
    bg: '#1E90FF',
    card: 'rgba(0,0,0,0.06)',
    text: '#FFFFFF',
    accent: '#66B3FF',
    border: '#FFFFFF',
  },
};
