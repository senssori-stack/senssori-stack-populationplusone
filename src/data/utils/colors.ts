// src/data/utils/colors.ts
import type { ThemeName } from '../../types';

export const COLOR_SCHEMES: Record<ThemeName, {
    bg: string; card: string; text: string; accent: string; border: string;
}> = {
    // Blues - Row 1
    lightBlue: { bg: '#1E90FF', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#66B3FF', border: '#FFFFFF' },
    royalBlue: { bg: '#4169E1', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#6A8FFF', border: '#FFFFFF' },
    mediumBlue: { bg: '#0066CC', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#3399FF', border: '#FFFFFF' },
    navyBlue: { bg: '#000080', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#4040C0', border: '#FFFFFF' },
    teal: { bg: '#2C5F63', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#3C8F93', border: '#FFFFFF' },

    // Greens - Row 2
    darkGreen: { bg: '#1C3D32', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#2C5D42', border: '#FFFFFF' },
    forestGreen: { bg: '#1E5B3D', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#2E8B57', border: '#FFFFFF' },
    green: { bg: '#228B22', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#32BB32', border: '#FFFFFF' },
    limeGreen: { bg: '#32CD32', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#52ED52', border: '#FFFFFF' },
    mintGreen: { bg: '#40C896', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#60E8B6', border: '#FFFFFF' },

    // Pinks/Purples - Row 3
    lavender: { bg: '#E89FE8', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#F8BFFF', border: '#FFFFFF' },
    hotPink: { bg: '#FF69B4', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FF89D4', border: '#FFFFFF' },
    rose: { bg: '#C46088', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#E480A8', border: '#FFFFFF' },
    purple: { bg: '#9370DB', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#B390FB', border: '#FFFFFF' },
    violet: { bg: '#8B00FF', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#AB20FF', border: '#FFFFFF' },

    // Reds/Oranges - Row 4
    coral: { bg: '#FF7F66', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FF9F86', border: '#FFFFFF' },
    red: { bg: '#DC143C', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FC345C', border: '#FFFFFF' },
    maroon: { bg: '#800020', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#A02040', border: '#FFFFFF' },
    orange: { bg: '#FF8C00', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FFAC20', border: '#FFFFFF' },
    gold: { bg: '#DAA520', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FAC540', border: '#FFFFFF' },

    // Grays - Row 5
    charcoal: { bg: '#2F4F4F', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#4F6F6F', border: '#FFFFFF' },
    slate: { bg: '#3C4C5C', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#5C6C7C', border: '#FFFFFF' },
    gray: { bg: '#4A4A4A', card: 'rgba(0,0,0,0.18)', text: '#FFFFFF', accent: '#6A6A6A', border: '#FFFFFF' },
    silver: { bg: '#808080', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#A0A0A0', border: '#FFFFFF' },
    lightGray: { bg: '#A0A0A0', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#C0C0C0', border: '#FFFFFF' },

    // Legacy compatibility
    pink: { bg: '#ED80E9', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#FCEAFD', border: '#FFFFFF' },
    blue: { bg: '#1E90FF', card: 'rgba(0,0,0,0.06)', text: '#FFFFFF', accent: '#66B3FF', border: '#FFFFFF' },
};
