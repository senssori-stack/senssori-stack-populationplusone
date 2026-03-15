import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Defs, G, Line, Path, Rect, Stop, Svg, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';
import RisingStars from '../../components/RisingStars';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Astrocartography'>;

// ─── Planetary data ──────────────────────────────────────────
interface PlanetLine {
    planet: string;
    symbol: string;
    color: string;
    longitude: number; // ecliptic longitude 0-360
    declination: number; // degrees north/south of celestial equator
}

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function getZodiacSign(date: Date): string {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries';
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus';
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini';
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer';
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo';
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo';
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra';
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio';
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius';
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Capricorn';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius';
    return 'Pisces';
}

// Obliquity of the ecliptic (~23.44°)
const OBLIQUITY = 23.4393;

/**
 * Approximate planetary ecliptic longitudes for a given birth date.
 * Uses simplified Keplerian orbital elements — accurate enough for
 * astrocartography visualisation (within ~1-2° for inner planets).
 */
function calculatePlanetaryPositions(birthDate: Date): PlanetLine[] {
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const d = (birthDate.getTime() - J2000.getTime()) / 86400000; // days since J2000

    // Simplified mean longitude formulas (degrees)
    const sunL = (280.460 + 0.9856474 * d) % 360;
    const moonL = (218.316 + 13.176396 * d) % 360;
    const mercL = (252.251 + 4.0923344 * d) % 360;
    const venusL = (181.980 + 1.6021302 * d) % 360;
    const marsL = (355.433 + 0.5240208 * d) % 360;
    const jupL = (34.351 + 0.0830853 * d) % 360;
    const satL = (50.077 + 0.0334442 * d) % 360;
    const uraL = (314.055 + 0.0117173 * d) % 360;
    const nepL = (304.349 + 0.0060100 * d) % 360;
    const pluL = (238.929 + 0.0039780 * d) % 360;

    const norm = (v: number) => ((v % 360) + 360) % 360;

    // Approximate declination from ecliptic longitude: δ = arcsin(sin(ε) * sin(λ))
    const decl = (lon: number) => {
        const rad = Math.PI / 180;
        return (Math.asin(Math.sin(OBLIQUITY * rad) * Math.sin(lon * rad)) * 180) / Math.PI;
    };

    const planets: PlanetLine[] = [
        { planet: 'Sun', symbol: '☉', color: '#FFD700', longitude: norm(sunL), declination: decl(norm(sunL)) },
        { planet: 'Moon', symbol: '☽', color: '#C0C0C0', longitude: norm(moonL), declination: decl(norm(moonL)) },
        { planet: 'Mercury', symbol: '☿', color: '#A0E0FF', longitude: norm(mercL), declination: decl(norm(mercL)) },
        { planet: 'Venus', symbol: '♀', color: '#FF69B4', longitude: norm(venusL), declination: decl(norm(venusL)) },
        { planet: 'Mars', symbol: '♂', color: '#FF4500', longitude: norm(marsL), declination: decl(norm(marsL)) },
        { planet: 'Jupiter', symbol: '♃', color: '#FFA500', longitude: norm(jupL), declination: decl(norm(jupL)) },
        { planet: 'Saturn', symbol: '♄', color: '#DEB887', longitude: norm(satL), declination: decl(norm(satL)) },
        { planet: 'Uranus', symbol: '♅', color: '#40E0D0', longitude: norm(uraL), declination: decl(norm(uraL)) },
        { planet: 'Neptune', symbol: '♆', color: '#4169E1', longitude: norm(nepL), declination: decl(norm(nepL)) },
        { planet: 'Pluto', symbol: '♇', color: '#8B008B', longitude: norm(pluL), declination: decl(norm(pluL)) },
    ];

    return planets;
}

// ─── Line type definitions ───────────────────────────────────
type LineType = 'MC' | 'IC' | 'ASC' | 'DSC';

interface AstroLine {
    planet: PlanetLine;
    lineType: LineType;
    // MC/IC are vertical (longitude), ASC/DSC are curved (latitude-dependent)
}

const LINE_TYPE_INFO: Record<LineType, { label: string; dash: string; meaning: string }> = {
    MC: { label: 'Midheaven', dash: '', meaning: 'Career, public life, reputation, ambition. Places where this planet\'s energy propels your professional life and social standing. You may find fame, recognition, or your true calling here.' },
    IC: { label: 'Imum Coeli', dash: '6,4', meaning: 'Home, family, roots, inner security. Locations where this planet\'s energy creates a deep sense of belonging and emotional foundation. You build your sanctuary here.' },
    ASC: { label: 'Ascendant', dash: '2,3', meaning: 'Identity, first impressions, personal power. Places where this planet\'s energy becomes part of who you ARE. Others see this energy in you strongly at these locations.' },
    DSC: { label: 'Descendant', dash: '8,4,2,4', meaning: 'Relationships, partnerships, others. Locations where this planet\'s energy draws significant people into your life. Marriage, business partnerships, and deep bonds form here.' },
};

const PLANET_MEANINGS: Record<string, { keyword: string; energy: string }> = {
    Sun: { keyword: 'Identity & Vitality', energy: 'Where you shine brightest. Confidence, creativity, and life purpose are amplified. You feel most alive and authentic at these locations.' },
    Moon: { keyword: 'Emotions & Intuition', energy: 'Where your emotional life deepens. Intuition sharpens, nurturing instincts awaken, and you connect profoundly with others. Great for family and emotional healing.' },
    Mercury: { keyword: 'Communication & Mind', energy: 'Where your intellect sparks. Writing, speaking, learning, and networking thrive. Ideal for education, media careers, and making important connections.' },
    Venus: { keyword: 'Love & Beauty', energy: 'Where love finds you. Romance, beauty, art, pleasure, and financial luck bloom. Places of attraction, luxury, and harmonious relationships.' },
    Mars: { keyword: 'Drive & Courage', energy: 'Where your warrior spirit ignites. Ambition, physical energy, competition, and bold action are heightened. Great for athletic or entrepreneurial pursuits — but watch for conflicts.' },
    Jupiter: { keyword: 'Luck & Expansion', energy: 'Where fortune smiles on you. Abundance, generosity, optimism, and spiritual growth are magnified. Travel here for life-changing opportunities and wisdom.' },
    Saturn: { keyword: 'Discipline & Lessons', energy: 'Where life\'s toughest lessons build your greatest strength. Hard work pays off dramatically here, but expect challenges that forge character and lasting achievement.' },
    Uranus: { keyword: 'Revolution & Freedom', energy: 'Where the unexpected transforms you. Innovation, sudden changes, and radical self-discovery. Electric, unpredictable energy that breaks you free from old patterns.' },
    Neptune: { keyword: 'Dreams & Spirituality', energy: 'Where the veil between worlds thins. Creativity, spirituality, compassion, and mysticism flourish — but watch for illusion and escapism. Magic happens here.' },
    Pluto: { keyword: 'Transformation & Power', energy: 'Where you undergo profound rebirth. Deep psychological transformation, power dynamics, and phoenix-from-ashes experiences. Intense but ultimately empowering.' },
};

// ─── Simplified world map coastline (Mercator-projected SVG paths) ───
// Continents as simplified polygon paths for a clean look
const MAP_WIDTH = 800;
const MAP_HEIGHT = 440;

// Convert lat/lng to map x/y (simple equirectangular projection)
function geoToXY(lat: number, lng: number): { x: number; y: number } {
    const x = ((lng + 180) / 360) * MAP_WIDTH;
    const y = ((90 - lat) / 180) * MAP_HEIGHT;
    return { x, y };
}

// Real-world country outlines from GeoJSON (equirectangular projection)
const CONTINENTS = [
    'M536,132.9L540,133.5L546.1,127.9L553.8,129.2L557.3,125.9L559.7,130.2L567,129.2L558.4,131.8L554,142L542.6,148.3L535.3,147.1L536,132.9Z',
    'M436.3,234.4L438.8,239.7L448.3,237.8L449.2,247.1L453.1,246.7L453.4,251.6L448.7,251.5L448.6,259.3L451.6,262.8L426.1,262.3L430.5,247.6L427.2,235.4L436.3,234.4Z',
    'M445.8,117.7L444.8,123.1L442.9,116.9L445.8,117.7Z',
    'M514.6,160.7L520,161L525,157.1L522.2,165L515.6,163.8L514.6,160.7Z',
    'M254.4,354.9L247.5,354.1L247.5,348.7L254.4,354.9Z',
    'M255.6,274L260.3,273.9L271.6,281.5L269.7,286.3L276.2,286.9L279.7,282.4L280.8,285.8L271.9,293.9L270,304.2L273.8,310.2L268.4,314.6L261.5,314.9L260.6,320.3L255.3,320.4L259,324L250.5,331.3L254.1,335.5L246.4,344L248.6,348L240.2,347.1L236.9,340.6L241.7,329.5L239.7,323.3L244.9,303.6L243.3,296.7L248,279.9L252.7,273.4L255.6,274Z',
    'M496.9,119.6L501.2,120.2L503.3,125.2L496.9,119.6Z',
    'M723.1,319.7L729.5,319.9L728.7,325.6L724.6,326.5L723.1,319.7Z',
    'M719,253.6L723.1,256.6L725.3,266.3L740.3,283.7L739.8,297.3L733.3,311.5L725.2,315.4L722.3,312.6L719.1,314.9L712.5,312.9L707.1,304.1L704.1,306.2L706.2,300.4L702.2,305.3L698.4,299.7L691.8,297L662.3,305.7L655.6,303.6L657.1,297.3L651.9,283.8L653.9,284.3L653.7,273.2L668.6,268.1L679.3,254.8L688,256.6L694.1,247.2L703.3,249L701.1,256.7L711.6,263.3L716.7,246.1L719,253.6Z',
    'M437.7,102.4L432.5,106.5L421.1,104.9L428.7,104L430.2,100.5L437.7,102.4Z',
    'M505.3,119.2L508,117.8L512,121.6L508.6,126.3L506.8,123.2L503.3,125.2L499.9,119.2L505.3,119.2Z',
    'M407.4,94.5L413.7,95.8L412.6,98.9L407.4,94.5Z',
    'M406,204.7L401.7,194.4L405.5,190.1L408.4,193.8L406,204.7Z',
    'M393.7,196.4L389.4,196L388.4,191.4L391.1,187.1L400.8,183.5L404.8,190.8L393.5,193.2L393.7,196.4Z',
    'M605.9,166.1L605.3,169.5L603.1,164.4L597.8,166.1L596.8,155.4L605.3,158.9L602.6,162.5L605.9,166.1Z',
    'M450.3,111.9L463.5,113.2L462.2,117.3L451,119L450.3,111.9Z',
    'M442.2,110.3L441.2,115.7L435,110.4L442.2,110.3Z',
    'M452.2,88.2L462.6,82.7L468.6,84.2L472.7,89.6L467.9,94.6L452.3,93.9L452.2,88.2Z',
    'M260.3,273.9L249.3,275.9L245.4,263L245.5,246.8L254.8,243.9L254.7,248.3L265.5,253.7L266.3,259.7L270.6,259.8L271.4,268.8L262.7,268L260.3,273.9Z',
    'M271.9,293.9L280.8,283.9L276,274.7L271.3,274L270.6,259.8L266.3,259.7L265.5,253.7L254.7,248.3L254.8,243.9L244.2,247.2L243.4,243.2L239.6,244.6L235.6,238.4L238,232.9L244.7,230.5L244.9,215.8L254.3,218.1L259.2,214.6L256,210.1L266.2,207.2L268.8,216.8L282.4,214.8L286,209.7L288,220.2L300.2,223.8L300.9,226.6L311.2,227L320.9,232.6L322.8,238L313.4,253.7L309,273.6L294.1,280.8L291.4,290.1L281.4,302.5L280.5,298.3L271.9,293.9Z',
    'M603.8,152.1L604.5,154.4L597.4,153.8L600,150.8L603.8,152.1Z',
    'M457,265.3L465.4,274L457,282.3L451.8,281.8L446.4,285.6L444.2,273.4L446.4,273.3L446.5,264.6L455.7,263.2L457,265.3Z',
    'M434,201.9L450.8,192.8L460.8,207.2L449.8,210.2L443.3,207.7L435.6,214.5L432.2,208.4L434,201.9Z',
    'M125.5,101.4L114.8,95.9L125.5,101.4Z',
    'M275.3,96.1L273.8,98.2L281.2,99.6L282.1,106L279.5,103.3L276.9,105.4L268.3,103.6L276.9,93.9L275.3,96.1Z',
    'M210.8,59.5L222,64.2L206.2,64.7L210.8,59.5Z',
    'M187.4,51.1L178.2,50.4L181.7,48.5L187.4,51.1Z',
    'M198.8,50.1L205.9,55.7L210,49.2L216.4,49.7L219.4,54.8L209.4,57.3L193,68.4L189.6,75.9L194.9,80.5L217.2,85.2L222.4,94.8L225.3,91.5L222.6,86.4L229.9,81.8L225.5,76.3L228.1,73.7L226.4,67.7L245.4,70.7L246,75.9L249.7,77.7L256.5,72.5L262.7,82.3L272.6,86.5L276.3,92.5L266.6,97.2L252.4,97.2L242,105.5L255.4,99.7L256.7,107L263.3,107.8L265.5,105.1L267.1,107.8L253.1,113.4L256.8,109.3L250.8,109.7L246.1,104L241.1,110L233.6,110L216.2,118.1L216.6,109.2L203.6,101.9L189.3,99.3L126.7,100.2L116.8,95.7L110,87.3L111.1,83.3L103.7,77.2L86.7,72.6L86.7,49.6L96.7,51.6L115.2,47.7L143.9,51.6L147.8,54.5L158,55.3L164.1,51.8L174.5,54.6L183,52.4L186.4,55.5L190.6,51.2L185.6,48.7L188.4,44.2L198.8,50.1Z',
    'M146.3,41.3L155.7,41.7L159.6,44.9L159.1,41.3L163.3,41.4L175.4,49.9L148.2,52.5L139.2,49L150.2,48L134.7,45.1L146.3,41.3Z',
    'M230.4,41.3L220.3,40.7L230.4,41.3Z',
    'M207.6,41.2L217.1,39.7L220.6,43.8L227.1,42.2L239.5,45.1L251.2,50.9L247.1,52L262.6,56.6L258,61.1L248.9,58L256.3,65L247.1,64.2L253,68.6L233.7,61.9L227.3,63L226.9,60.4L235.6,60L237.9,54.4L224.5,48.5L200.2,45.9L201.3,41.2L209.3,39.6L207.6,41.2Z',
    'M177,39.5L183.6,39.7L185.1,44.8L172.2,42.8L176.8,42.3L174.4,40.7L177,39.5Z',
    'M192.9,42.1L188,43.8L186.6,40.5L198.9,39.5L192.9,42.1Z',
    'M132.3,45.5L120.2,44.3L124.6,39.9L122.4,38.4L143.3,40.4L132.3,45.5Z',
    'M181.1,32.5L181.9,36.7L172.2,35.3L181.1,32.5Z',
    'M159.5,33.7L165.1,35.5L150.6,38.1L147,37.4L151.6,36.3L138.4,36.1L143.5,33.1L159.5,33.7Z',
    'M189.6,31.5L222.6,36.9L200.5,37.9L184.2,32.4L189.6,31.5Z',
    'M141.8,30.2L139.8,32.9L127,33.9L141.8,30.2Z',
    'M177.6,28.5L166.3,28.4L168.4,27.7L165.6,26.2L177.6,28.5Z',
    'M206.6,25.3L209.3,26.1L198.2,28.8L185.1,24.1L194.6,21.4L206.6,25.3Z',
    'M247.8,16.9L262.6,18L229.1,26.1L232.5,28L221,33.8L201.1,33.1L203.9,29.6L211.2,30.5L204.5,28.4L210.9,26L206.8,23.8L218.1,23.3L196.5,19.8L247.8,16.9Z',
    'M421.3,103.8L423,106.4L413.4,106.9L415,103.8L421.3,103.8Z',
    'M247.5,348.7L247.5,354.1L251.2,354.2L248.6,355.9L234.1,349.2L242,352.2L247.5,348.7Z',
    'M248.4,272.5L251.1,276.2L243.3,296.7L244.9,303.6L239.7,323.3L241.7,329.5L236.9,340.6L240.2,347.1L247.6,347.8L241.3,351.6L233.5,347.8L232,339L235.3,334.7L231.9,334L238.4,323.6L234.8,325.7L245.4,263L248.4,272.5Z',
    'M645.2,174.3L641.4,172.7L646.2,170.9L645.2,174.3Z',
    'M683.7,98.4L691.1,103.2L700.1,101.5L695.8,109.6L691.2,110.1L690.3,116.4L669,124.9L670.3,119.9L661.2,125.3L666,129.2L671.9,128.4L664.8,134.7L670.9,142.5L670.4,151L663.7,160L645.4,170.3L634.1,162.9L625.9,165.4L626.2,168.2L620.5,165.9L619.2,161.2L616.9,161.6L619.3,152.8L613.6,148L597.4,153.3L577.2,144.5L575.4,136.1L563.7,123.6L578,117L577.7,110.2L595,99.5L602.2,105.4L602.1,109.3L611.8,111.9L614.1,115.6L633.3,118.3L645.4,115.2L648.6,109.8L665.9,105.9L656.6,102.3L659.3,98.1L665.1,97.4L668.9,89.8L679.9,91L683.7,98.4Z',
    'M393.7,207.8L382.9,209.3L381.7,195.2L393.7,196.4L393.7,207.8Z',
    'M429.1,214.5L421.4,214.4L418.9,208.3L420.5,204.2L426.1,202.9L432.2,188.6L434.4,195.6L431,196.7L434.3,201.2L432.2,208.4L435.6,214.5L429.1,214.5Z',
    'M468.5,211.4L464.5,226.9L468.3,240.4L463.2,242.4L466,252.4L460.4,248.4L449.2,247.1L448.3,237.8L438.8,239.7L436.3,234.4L427.4,234.9L435.6,228.6L443.3,207.7L449.8,210.2L460.8,207.2L468.5,211.4Z',
    'M428.9,231.7L424.7,229.7L427.9,224.8L431.8,224.9L429.1,214.5L435.4,215.8L438.1,210.9L441,211.4L435.6,228.6L428.9,231.7Z',
    'M232.5,220.4L224.5,215.9L228.6,210.6L227.2,201.2L233.5,192.9L241.3,189.7L237.1,197.6L240.1,202.9L250.4,205.1L251.4,216.9L244.9,215.8L244.7,230.5L244.3,226.7L237.6,225.6L232.5,220.4Z',
    'M215.6,199.9L209.5,192.9L214.1,193.3L215.6,199.9Z',
    'M217.2,163.3L235.2,170.4L227.2,171.5L225.1,167.2L218.2,164.7L211.2,166.5L217.2,163.3Z',
    'M437.7,101.2L431.9,101.3L427.2,97.1L433.4,95.1L441.9,99L437.7,101.2Z',
    'M422,85.6L431.9,89.8L433.4,95.1L427.2,97.1L430.2,100.5L428.7,104L416.6,103.6L418,100.2L413.7,99.1L415.3,89.3L422,85.6Z',
    'M424.2,82L422,85.6L418,84.3L419,80.4L423.5,78.9L424.2,82Z',
    'M240.6,171.8L248.2,174.5L241.3,177L240.6,171.8Z',
    'M426.7,162.6L407,173.4L380.7,153L380.7,149.5L397.1,141.1L395.2,134L397.3,132.7L418.7,129.7L416.7,136.7L421.8,148.1L420.7,156.2L426.7,162.6Z',
    'M221.5,228.3L222,218.1L224.8,216.6L232.5,220.4L224,232.1L221.5,228.3Z',
    'M477.6,147.9L475.4,152.4L471.8,147.3L481.9,166.2L455.6,166.2L455.9,142.8L476.1,143.7L477.6,147.9Z',
    'M494.1,189.3L488.9,184.5L481,184.7L482.6,177.8L485.4,176L494.1,189.3Z',
    'M379.9,117.6L379.1,114.8L382.3,113.1L406.8,117.6L401.8,119.7L398.5,128L388.1,132.1L383.4,129.3L385.2,117.6L379.9,117.6Z',
    'M454,78.7L451.9,75.3L462.5,75L460.6,79.5L454,78.7Z',
    'M484.2,183.4L492.4,187.1L492.8,193L497.1,197.6L506.2,200.4L499.9,207.8L484.7,211.2L473.2,201L481,184.7L484.2,183.4Z',
    'M463.5,51.2L469.2,67.6L462.4,72.1L447.4,71.6L447.9,65.5L456.4,60.8L452.3,53.9L445.9,51.1L455,52.2L461.6,48.5L463.5,51.2Z',
    'M408,96.9L418,100.2L413.4,105.8L416.5,113.2L404.1,116.5L396.7,114.8L397.3,107.5L389.8,101L396.4,101.1L395.7,98.3L405.6,95L408,96.9Z',
    'M424.7,229.7L419.6,221.9L421.1,217.5L428.8,214.3L431.7,217.1L431.8,224.9L427.9,224.8L424.7,229.7Z',
    'M393.3,76.7L390.9,79.3L395.6,79L393.1,83.2L403.7,91.1L403.2,94.6L388.3,97.9L392.4,94.3L388.3,92.9L389.8,89.2L393.5,88L386.3,81.2L388.9,76.7L393.3,76.7Z',
    'M492.3,118.5L489.1,113.5L501,116.1L503.6,119.3L492.3,118.5Z',
    'M402.4,205.5L393.7,207.8L393.5,193.2L400.1,193.1L402.4,205.5Z',
    'M381.2,201.2L376.7,199.6L375.3,195.4L370.6,198.2L366.4,193L369.6,189.2L379.7,189.9L381.2,201.2Z',
    'M366.4,193L362.9,189.7L369.6,189.2L366.4,193Z',
    'M459.1,118.4L450.7,121.1L453.4,128L451.4,127.3L451.5,131L448.2,129.9L444.9,123.8L446.7,120.2L459.1,118.4Z',
    'M296.1,18L339.8,15.8L353.7,17.8L329.1,19.1L372.9,21.3L355.5,24L360.6,24.1L356.2,27.5L358.9,31.8L351.8,32.7L355.9,34L354.1,36.3L356.9,38.4L347.6,40.8L350.4,43.6L344.9,43.2L351.7,47.3L343.2,45.4L341.4,48.3L350.3,48.6L311.5,60L304.8,66.8L303.6,73.1L292.7,71.2L285.3,64.5L280.1,55.8L287,49.1L278.5,49.8L279.2,46.9L285.8,47.5L275.9,44.8L278.4,42.6L269.8,35.4L247.8,34.1L241.3,31.8L251.6,30.9L237.1,29.2L254,25.9L248.8,24.2L260.8,20.1L301.1,20.4L296.1,18Z',
    'M199.8,186.4L195,184.5L199,180.7L197.8,176.4L201.9,176.5L203.9,181.6L199.8,186.4Z',
    'M283.2,213.9L278.8,214.3L280.1,205.9L285.2,209.8L283.2,213.9Z',
    'M267.2,199.5L273,205.4L271,210.1L274.4,215.4L269.9,216.9L263.5,205.4L267.2,199.5Z',
    'M206,188.3L201.4,184.7L203.9,181.6L215.2,183.3L206,188.3Z',
    'M441.8,107.8L442.2,110.3L435,110.4L441,116.2L430.3,109.7L436.8,106.3L441.8,107.8Z',
    'M436,105.5L437.7,102.4L450.5,103L441,108.1L436,105.5Z',
    'M641.4,236.6L657.1,240.5L634.1,236.7L635.7,234.4L641.4,236.6Z',
    'M698.1,222.8L701,228.2L705.4,224.2L713.3,226.4L713.4,242.3L705.8,240.6L708.2,237.9L706.5,233.2L695.5,230.1L693.3,226.9L697.1,225.4L690,222.3L698.1,222.8Z',
    'M678.3,216.5L667.1,219.4L668.7,223.4L674.1,221.5L670,224.7L673.7,233.1L668.8,226.4L666.2,233.9L663.9,226.8L666.7,218.6L678.3,216.5Z',
    'M661.9,215.5L664.4,217.8L661.8,218.1L658.1,229.8L644.9,227.2L643.7,215.1L645.6,218.1L654.7,216.5L660,209.5L661.9,215.5Z',
    'M635.2,234.3L628,230.3L611.8,206.6L616.6,207.2L630.8,219.7L635.8,227.5L635.2,234.3Z',
    'M573,133.2L575,143L580.2,146.2L578,149.6L585.1,153.1L595.7,155.4L597.2,151.3L599.4,154.7L604.5,154.4L603.8,152.1L613.6,148L616.5,151.8L611.4,155L605.9,166.1L602.6,162.5L605.3,158.9L596.8,155.4L597.5,167L593.3,167.5L578.5,181.1L577.5,194.7L572.3,200.5L563.4,180.9L561.4,167.8L556.6,169L551.5,162.1L557.9,160.5L554.5,154.1L567.2,141.1L563.9,136.1L573,133.2Z',
    'M386.2,88.3L384.9,92.3L377.8,93.3L378.5,88.3L383.2,85.2L386.2,88.3Z',
    'M519.8,129.1L525.8,126.8L535.8,130.8L535.3,147.1L540.7,154.6L536.7,158.7L527.5,157.1L525.5,153.6L518.9,154.5L511.4,146.3L507.9,146.8L500.9,137L502.4,132.8L498,123.6L506.8,123.2L513,129.9L519.8,129.1Z',
    'M500.9,132.1L500.9,137L507.9,146.8L503.5,148.9L487.1,141.4L486.2,138.4L491.1,135.9L494.1,129L499.5,129.1L500.9,132.1Z',
    'M367.8,57.6L369.8,60.8L358.5,64.8L349.4,63.7L351.6,62.6L346.8,61.4L350.6,60.2L345.9,59.6L367.8,57.6Z',
    'M434.5,126.5L433.6,130.5L427.6,128.1L434.5,126.5Z',
    'M427.5,105.7L431,108.6L427.4,109.1L428,112.2L441.1,121.8L437.5,121.1L435.8,127.1L434.3,122.1L422.7,112.6L415.6,111.8L415.2,107.6L427.5,105.7Z',
    'M479,140.8L486.2,138.4L487.1,141.4L482.2,143L484.4,145.4L480.2,148.6L477.6,147.9L479,140.8Z',
    'M713.3,129.2L711.7,134.1L701.8,138.2L700.2,135.4L691.1,137.2L693.3,139L689.3,143.2L687.6,138.6L694.7,133.4L701.5,133.2L714.2,118.9L713.3,129.2Z',
    'M719.8,112L722.9,111.5L723.4,114.2L711,118.4L715.5,108.7L719.8,112Z',
    'M557.7,116.7L551.7,120.6L544.2,113.1L537.8,113.7L530,108.6L524.3,110L524.4,119L516.7,117.9L511.8,111L517.9,109.4L517.9,105.5L508,106.2L503.9,99.4L512.8,93.6L536.3,95.8L533.3,93L536.5,88L553.5,84.6L563.2,89.2L570.9,86.8L577.9,95.7L585.3,95.2L594.1,99.7L577.7,110.2L578.4,116.5L564.9,114.2L557.7,116.7Z',
    'M491.1,222.1L487.1,231.4L475.3,222.3L477.9,215.3L475.6,209.6L478.4,206.5L484.7,211.2L493,210.4L491.1,222.1Z',
    'M557.7,116.7L564.9,114.2L578.4,116.5L563.7,123.6L554.4,123.4L562.3,120.1L556.5,118.5L557.7,116.7Z',
    'M630,194L628.9,185.2L638.6,185.3L636.1,193.2L630,194Z',
    'M685.2,125.6L687.7,132.9L681.1,135.9L680.4,127.7L685.2,125.6Z',
    'M633.8,185.1L631,175.4L624.6,177.2L622.5,170.1L625.9,165.4L632.1,169.3L630.9,172.9L638.5,181.1L638.6,185.3L633.8,185.1Z',
    'M382.9,209.3L374.6,203.4L377.3,199.5L381.2,201.2L382.9,209.3Z',
    'M433,164.1L422.9,160.4L420.7,156.2L421.1,145.9L425.5,139L442.4,146L446.3,140.1L455.4,142L455.6,171.1L433,164.1Z',
    'M581.8,201.6L578.6,205.4L578.1,196L581.8,201.6Z',
    'M450.5,87.2L446.8,83L458.9,84.1L454.3,88.2L450.5,87.2Z',
    'M446.8,83L448,79.7L455.9,78.3L462.6,82.7L446.8,83Z',
    'M388.5,132.6L395.2,134L397.1,141.1L380.7,149.5L380.5,153.7L374.7,154.3L367.2,167.4L362.2,167.6L367.9,155.8L378.7,146.8L379.3,140.4L388.5,132.6Z',
    'M459.2,102.1L463.7,102.4L466.7,106.5L462.7,108.8L459.2,102.1Z',
    'M510.1,250.5L511.9,258.4L504.7,281L500.9,282.6L496.3,275.7L497.7,262.6L510.1,250.5Z',
    'M184.1,156.8L182.9,166.5L190.2,175.6L196.9,173.9L200.9,168L207.1,167.9L204.8,175.4L197.8,176.4L199,180.7L195,184.5L166.7,172.8L164.4,164.3L144.9,142.3L155.5,164.2L144.3,152.2L146.3,150.2L139.7,140.5L163.3,142.4L169,148.5L175.6,148.2L180,155.5L184.1,156.8Z',
    'M373,184.3L387.7,182.1L385.7,159L409.5,173.2L408.1,181.9L391.1,187.1L386.6,195.3L382.2,195.1L379.7,189.9L374.5,190.5L373,184.3Z',
    'M621.2,170.7L616.4,174.9L621.3,190.9L619,195.7L616.9,180.6L615.9,178.6L609.3,180.8L605.1,167.5L616.3,150.9L619.3,152.8L616.9,161.6L624.8,166.6L621.2,170.7Z',
    'M595,99.5L605,95.8L616.1,98.4L619.7,92.8L641.1,99.5L659.3,98.1L657.2,103.3L666.2,105L648.6,109.8L645.4,115.2L633.3,118.3L614.1,115.6L611.8,111.9L602.1,109.3L602.2,105.4L595,99.5Z',
    'M476.8,248.2L489.6,245.2L490.6,255.9L477.3,268.4L478.8,279L471.3,285.3L469.3,274.4L473,260.9L467.1,256.2L473.8,254.2L477.9,261.1L476.8,248.2Z',
    'M373,184.3L367.6,179.4L363.4,180.6L362.1,168.7L371.3,167.9L373.4,156.6L380.7,156.7L380.7,153L389.1,159L385.7,159L388.2,180.4L373,184.3Z',
    'M476.8,248.2L477.9,261.1L476.6,255.7L472.6,253.5L472.8,242.6L476.8,248.2Z',
    'M624.6,204.8L628.8,206.5L631.6,216.8L625.3,213.3L622.4,204.2L624.6,204.8Z',
    'M663.6,209.1L657.5,209.5L654.7,216.5L644.1,216.7L656.3,209.4L659.4,203.1L664.8,206.8L663.6,209.1Z',
    'M436.3,289.9L426.1,262.3L455.7,263L446.5,264.6L444.2,289.6L436.3,289.9Z',
    'M404.8,190.8L400.8,183.5L408.1,181.9L409.5,173.2L426.7,162.6L433,164.1L435.3,170.2L430.1,184.9L431.5,189.5L429.1,186.8L420,188.6L412.1,186.1L408,191.5L404.8,190.8Z',
    'M418.9,208.3L413.1,209.6L409.6,204.7L406,204.7L409.1,186.9L429.6,186.9L432,191.7L426.1,202.9L420.5,204.2L418.9,208.3Z',
    'M209.5,192.9L205.2,188.4L215.2,183.3L214.1,193.3L209.5,192.9Z',
    'M413.5,89.2L415.8,90.1L413.7,95.8L407.4,94.5L413.5,89.2Z',
    'M462.6,46L469.5,47.8L466.7,48.4L469.1,50L463.5,51.2L461.6,48.5L455,52.2L440,52.4L428,63.4L424.5,76.1L412.6,76.8L411.1,68.5L432.8,54.2L442.6,49.3L462.6,46Z',
    'M440.6,25.2L447.9,27L435.4,32.3L423.2,25.3L440.6,25.2Z',
    'M456.6,23.4L460.9,24.3L438.6,23.7L456.6,23.4Z',
    'M595.8,151.9L593.8,155.5L578,149.6L581.2,145.6L595.8,151.9Z',
    'M784.5,320L787.2,321.1L784.6,327.2L776.3,334L770.4,333L784.5,320Z',
    'M788,308.4L796.7,312.1L789.4,321.9L786.3,316.6L788.2,311.4L783.6,304.4L788,308.4Z',
    'M530.8,168.4L528.2,173.7L518,179.3L515.6,173.6L522.2,171.1L524.2,159.1L532.9,164.9L530.8,168.4Z',
    'M567,129.2L573,133.2L563.9,136.1L567.2,141.1L554.5,154.1L557.9,160.5L551.5,162.1L547.5,157.8L536.7,158.7L540.7,154.6L535.3,147.1L547.4,146.9L554,142L558.4,131.8L567,129.2Z',
    'M226.9,202.3L224.2,198L221.3,202.2L215.9,200.3L215.7,196.8L226.5,197.4L226.9,202.3Z',
    'M245.4,263L243.6,264.9L231.1,255.8L219.4,235L219.8,229.9L221.5,228.3L224,232.1L233.1,220.1L237.6,225.6L244.3,226.7L244.7,230.5L238,232.9L235.6,238.4L239.6,244.6L243.4,243.2L247.4,250.7L245.4,263Z',
    'M680.8,199.4L678.7,206.4L674.7,200.9L670.9,202.4L678.7,196.1L680.8,199.4Z',
    'M669.6,174.8L672.3,178.2L670.5,185L675.4,186.3L675.7,189.4L666.8,183.4L669.6,174.8Z',
    'M737.7,233.4L729.6,234L738.1,230.1L737.7,233.4Z',
    'M727.1,238.1L734.9,245.9L728.7,244.8L721.7,238.7L713.4,242.3L713.3,226.4L728.1,234.9L727.1,238.1Z',
    'M433.4,95.1L431.4,88.6L439.2,85.9L451.7,87.5L452.9,90.2L450.6,100.2L433.4,95.1Z',
    'M690.3,116.4L683.4,122.8L684.9,126.2L677.1,126.8L678,120.8L690.3,116.4Z',
    'M379.9,117.6L385.8,118.8L382.5,130L378.8,125.3L379.9,117.6Z',
    'M260.7,274.4L262.7,268L268.6,267.3L271.3,274L279.3,278.7L278.2,285.1L269.7,286.3L271.6,281.5L260.7,274.4Z',
    'M450.5,103L459.2,102.1L465.8,109.9L463.5,113.2L451,112.9L444.9,107.2L450.5,103Z',
    'M719.2,96L721.5,100.3L718.2,99.5L718.9,107.2L715.8,107.6L716,87.4L719.2,96Z',
    'M11.1,57.2L22.4,58.7L15.7,62.9L2.9,58.4L0,61.2L0,51.4L11.1,57.2Z',
    'M722.4,35.3L704.4,36L722.4,35.3Z',
    'M527.9,47.1L514.3,44L523.6,36.5L553,32.9L529.9,38.4L523.2,43.1L527.9,47.1Z',
    'M637.7,31.8L653.6,34.6L643.1,38.7L682.2,40.2L691.8,47L693.9,44.4L710.8,45.3L709.2,43L712.2,41.9L753.3,46.8L757.6,50.3L796.9,50.4L800,51.4L800,61.2L794.2,62.1L798.9,67.1L778.5,73.6L763.4,73.7L760,77.6L762.6,79.2L760.3,85.9L748.4,95.3L746.5,81.2L765.5,67.1L755.8,72L754,69L748.3,69.8L742.7,73.9L744.5,75.4L716,75.7L700.3,86.2L714.1,90.2L711.2,101.6L699.7,113.9L690.6,116.8L691.2,110.1L695.8,109.6L700.1,101.5L691.1,103.2L683.7,98.4L679.9,91L674.6,89.3L667.1,91L668.3,93L662,99L641.1,99.5L619.7,92.8L616.1,98.4L605,95.8L594.1,99.7L585.3,95.2L577.9,95.7L570.9,86.8L563.2,89.2L553.5,84.6L536.5,88L533.3,93L536.3,95.8L512.8,93.6L508,98.1L505.7,96.7L503.3,101.7L509.1,106.6L503.7,111L508,117.8L506.3,119.4L481.5,109.4L489,98.8L470.6,92.6L469.6,90.3L472.7,89.6L468.6,84.2L460.6,79.5L464.7,73.3L462.4,72.1L470,66.3L466.7,64.6L464.6,56.4L466.6,54.5L463.5,51.2L471.4,49.1L491.2,55.1L485.3,58.7L473.7,57.1L482.3,63.9L482.6,60.8L488,62.3L493.5,57.5L497.7,58.5L496.6,52.4L502.8,53.2L503,57L519.4,51.7L533.2,53.1L534.6,49.3L552.2,53.6L548.2,46.4L555.4,41.5L561.8,43.5L559.7,45.4L563.7,52.8L558.4,57.9L560.9,58.2L566.8,54.4L562.4,45.4L565.9,42L569.7,46.1L572.4,43.3L581.1,44.6L578.9,40L592.9,39.3L591.1,38L593.7,36.4L631.9,30.1L637.7,31.8Z',
    'M633.5,28.6L621,29.5L626.9,26L633.5,28.6Z',
    'M622.1,27.2L602.6,23.6L613.2,21.4L622.6,25L622.1,27.2Z',
    'M380.5,153.7L380.7,156.7L373.4,156.6L371.3,167.9L362.1,168.7L367.2,167.4L374.7,154.3L380.5,153.7Z',
    'M495.1,180L477,151.4L477.7,148.2L484.4,145.4L482.2,143L487.1,141.4L507.6,150.2L515.6,163.8L523.7,166.2L522.2,171.1L504.4,178.6L496.4,177L495.1,180Z',
    'M475.5,196.9L472.8,190.1L469.7,196L459.4,196.9L457.3,194.6L452.1,198.1L448.7,189.2L453.1,181.8L455.6,166.2L481.9,166.2L485.4,176L481.9,178.6L475.5,196.9Z',
    'M475.5,196.9L473.2,201L478.4,206.5L470.8,211.3L462.2,209.2L453.1,198.9L457.3,194.6L459.4,196.9L469.7,196L472.8,190.1L475.5,196.9Z',
    'M362.9,186.8L360.8,184L367.6,179.4L374.4,189.6L362.9,189.7L369.2,187L362.9,186.8Z',
    'M374.6,203.4L370.8,200L373.5,195.4L377.3,199.5L374.6,203.4Z',
    'M508.8,196.9L504.3,200.5L494.6,194.2L508.8,192.1L508.8,196.9Z',
    'M510.5,191.7L513.6,190.6L508,206.9L492.4,224.1L491.1,213.2L499.9,207.8L510.5,191.7Z',
    'M446.4,109L450.5,111L449.7,116.6L442.7,113.6L441.8,107.8L446.4,109Z',
    'M273,205.4L280.1,205.9L278.8,214.3L274.4,215.4L272,211.8L273,205.4Z',
    'M441.9,99L450.1,100L437.7,102.4L441.9,99Z',
    'M449.3,59.3L439.7,66.6L438,70.1L441.8,73.1L435.3,82.9L428.8,84.7L424.5,76.1L428,63.4L437.3,53.7L444.5,51.2L452.3,53.9L453.1,58.6L449.3,59.3Z',
    'M486.2,138.4L479.3,140L481.6,130L494.1,129L491.1,135.9L486.2,138.4Z',
    'M432.2,188.6L430.1,184.9L435.3,170.2L433,164.1L435.2,162.8L453,172.1L453.1,181.8L448.7,189.2L450.8,192.8L446.7,196.8L434,201.9L431,196.7L434.4,195.6L432.2,188.6Z',
    'M404.1,205L401.3,203.1L400.1,193.1L403.2,196L404.1,205Z',
    'M628,190.2L622.4,187.2L620.3,195.6L627,204.8L624.8,206.1L618.1,199.6L621.3,190.9L616.4,174.9L622.5,170.1L624.6,177.2L631,175.4L634.6,181.9L633.8,185.1L628.9,185.2L628,190.2Z',
    'M557.8,121.6L554.4,123.4L563.7,123.6L566.6,128.5L559.7,130.2L557.3,125.9L550.7,129.2L550.4,123.2L557.8,121.6Z',
    'M536,132.9L527.4,127L519.8,129.1L517.1,122.1L521.6,119.9L516.7,117.9L526.9,119L530.3,115.5L547.9,127.2L540,133.5L536,132.9Z',
    'M421.1,145.9L416.7,136.7L421.1,128.7L424.5,129.3L422.6,136.1L425.5,139L421.1,145.9Z',
    'M482,119L496.9,119.6L499.5,129.1L466,131.6L458.5,126.6L458.2,123.5L465,119.2L482,119Z',
    'M460.4,120.5L458.6,121.9L458,117.8L464.4,119L460.4,120.5Z',
    'M670.6,160.4L668.3,166.3L666.9,162.4L670,158.2L670.6,160.4Z',
    'M475.3,222.3L487.1,231.4L487.8,246.6L476.8,248.2L475,243L468.3,240.4L465.8,235.9L467.6,222.8L475.3,222.3Z',
    'M470.8,222.5L465.7,223.3L468.5,211.4L475.6,209.6L477.9,215.3L475.3,222.3L470.8,222.5Z',
    'M470.6,92.6L489,98.8L488.3,102.9L477.7,106.9L481.2,108.9L475.3,111.6L470.4,105.8L462.7,108.8L466.7,106.5L463.7,102.4L449.1,101.6L452.3,93.9L470.6,92.6Z',
    'M271.9,293.9L280.5,298.3L280.4,304.1L270.2,302.9L271.9,293.9Z',
    'M189.3,99.3L213,106.3L216.6,109.2L216.2,118.1L233.6,110L241.1,110L246.1,104L249.4,104.9L251.2,110.5L244.2,113.2L244.5,118.2L232.2,123.4L231.2,129L230.3,124.3L231.7,133.1L219.3,143.1L221.4,158.4L213.1,146.4L189.6,147.9L184.1,152L183.3,156.8L175.6,148.2L169,148.5L163.3,142.4L139.7,140.5L131.9,135.4L123.6,121.5L122.9,102.2L127.6,104.9L127,100.2L189.3,99.3Z',
    'M55.4,46.1L86.7,49.6L86.7,72.6L94.6,76L98.9,73.9L111.2,84.9L106.7,84.3L102,77.9L83.2,73.1L73.1,71.2L62.9,75.4L65.3,70.2L47.9,83.1L33.8,87L51,76L40.1,76.6L40.3,74.2L32.6,72.1L31.7,68.3L42.7,64.1L42.7,61.6L33.4,62.5L26.4,59.5L40.7,58.4L29.4,52.9L55.4,46.1Z',
    'M547.8,128.7L530.3,115.5L524.4,119L524.3,110L530,108.6L537.8,113.7L544.2,113.1L551.7,120.6L557.7,116.7L556.5,118.5L562.3,120.1L554.1,120.4L549.9,124.3L550.7,129.2L547.8,128.7Z',
    'M241.5,191.2L240.7,197.8L244.6,190.3L248.5,194.2L262.5,193.8L261.4,195.7L267.2,199.5L263.5,205.4L265.3,208L256,210.1L259.2,214.6L254.3,218.1L249.3,213.1L250.4,205.1L239,201.9L237.1,197.6L241.5,191.2Z',
    'M640.1,167.3L634.8,173.4L641.9,182.7L642.7,191.5L633.7,199L631.9,194.4L638.9,189.8L639,182.8L627,165.1L634.1,162.9L640.1,167.3Z',
    'M518,179.3L500,189L496.6,189.1L494.7,182.8L496.4,177L504.4,178.6L509.1,174.5L515.6,173.6L518,179.3Z',
    'M470,291.5L461,301.2L443.6,305.1L436.3,289.9L444.2,289.6L444.2,280.5L448,285.3L451.8,281.8L457,282.3L466.3,274L469.3,274.4L471,279.6L468.2,285.4L473,285.4L470,291.5Z',
    'M472.8,242.6L473.8,254.2L467.1,256.2L460.1,263.8L450.1,261.3L448.7,251.5L453.4,251.6L453.1,246.7L466,252.4L463,248.8L463.9,240.8L472.8,242.6Z',
    'M469.3,274.4L462.3,272.5L456.1,263.4L460.1,263.8L467.3,257.9L473,260.9L469.3,274.4Z',
];

// Major cities for reference dots
const CITIES: { name: string; lat: number; lng: number }[] = [
    { name: 'New York', lat: 40.71, lng: -74.01 },
    { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
    { name: 'London', lat: 51.51, lng: -0.13 },
    { name: 'Paris', lat: 48.86, lng: 2.35 },
    { name: 'Tokyo', lat: 35.68, lng: 139.69 },
    { name: 'Sydney', lat: -33.87, lng: 151.21 },
    { name: 'Dubai', lat: 25.20, lng: 55.27 },
    { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17 },
    { name: 'Mumbai', lat: 19.08, lng: 72.88 },
    { name: 'Cairo', lat: 30.04, lng: 31.24 },
    { name: 'Mexico City', lat: 19.43, lng: -99.13 },
    { name: 'Berlin', lat: 52.52, lng: 13.41 },
    { name: 'Rome', lat: 41.90, lng: 12.50 },
    { name: 'Beijing', lat: 39.90, lng: 116.40 },
    { name: 'Toronto', lat: 43.65, lng: -79.38 },
    { name: 'Cape Town', lat: -33.93, lng: 18.42 },
    { name: 'Bangkok', lat: 13.76, lng: 100.50 },
    { name: 'Moscow', lat: 55.76, lng: 37.62 },
    { name: 'São Paulo', lat: -23.55, lng: -46.63 },
    { name: 'Istanbul', lat: 41.01, lng: 28.98 },
    { name: 'Seoul', lat: 37.57, lng: 126.98 },
    { name: 'Lagos', lat: 6.45, lng: 3.40 },
    { name: 'Nairobi', lat: -1.29, lng: 36.82 },
    { name: 'Buenos Aires', lat: -34.60, lng: -58.38 },
    { name: 'Chicago', lat: 41.88, lng: -87.63 },
    { name: 'Honolulu', lat: 21.31, lng: -157.86 },
    { name: 'Anchorage', lat: 61.22, lng: -149.90 },
    { name: 'Reykjavik', lat: 64.15, lng: -21.94 },
    { name: 'Singapore', lat: 1.35, lng: 103.82 },
    { name: 'Athens', lat: 37.98, lng: 23.73 },
    { name: 'Lima', lat: -12.05, lng: -77.04 },
    { name: 'Denver', lat: 39.74, lng: -104.99 },
];

/**
 * For a planet, calculate the MC (Midheaven) longitude on Earth.
 * This is the Earth longitude where the planet culminates (transits the meridian).
 * MC longitude = -(GMST + planet RA) mapped to [-180, 180].
 * Simplified: we convert ecliptic longitude to RA and offset by sidereal time.
 */
function getMCLongitude(planet: PlanetLine, birthDate: Date): number {
    // Approximate Greenwich Mean Sidereal Time at birth (degrees)
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const d = (birthDate.getTime() - J2000.getTime()) / 86400000;
    const GMST = (280.46061837 + 360.98564736629 * d) % 360;

    // Convert ecliptic longitude to right ascension (simplified)
    const rad = Math.PI / 180;
    const lambda = planet.longitude * rad;
    const eps = OBLIQUITY * rad;
    const alpha = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / rad;
    const RA = ((alpha % 360) + 360) % 360;

    // MC is where RA = local sidereal time, so geo longitude = -(GMST - RA)
    let mcLng = -(GMST - RA);
    mcLng = ((mcLng + 180) % 360 + 360) % 360 - 180;
    return mcLng;
}

function getICLongitude(mcLng: number): number {
    let ic = mcLng + 180;
    if (ic > 180) ic -= 360;
    return ic;
}

// ─── Main screen component ──────────────────────────────────

export default function AstrocartographyScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const { width: screenWidth } = Dimensions.get('window');
    const mapScale = screenWidth / MAP_WIDTH;
    const scaledHeight = MAP_HEIGHT * mapScale;

    const planets = useMemo(() => calculatePlanetaryPositions(birthDate), []);

    // Visibility toggles per planet
    const [visiblePlanets, setVisiblePlanets] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        planets.forEach(p => { init[p.planet] = true; });
        return init;
    });

    // Visible line types
    const [visibleLines, setVisibleLines] = useState<Record<LineType, boolean>>({
        MC: true, IC: true, ASC: true, DSC: true,
    });

    // Selected line detail modal
    const [selectedLine, setSelectedLine] = useState<{ planet: PlanetLine; lineType: LineType } | null>(null);
    // Selected city info
    const [selectedCity, setSelectedCity] = useState<{ city: typeof CITIES[0]; nearestLines: { planet: string; lineType: LineType; distance: number }[] } | null>(null);

    const zodiacSign = getZodiacSign(birthDate);

    // Generate the 4 line types for each planet
    const astroLines = useMemo(() => {
        const lines: AstroLine[] = [];
        planets.forEach(planet => {
            (['MC', 'IC', 'ASC', 'DSC'] as LineType[]).forEach(lineType => {
                lines.push({ planet, lineType });
            });
        });
        return lines;
    }, [planets]);

    // Calculate MC longitudes
    const mcLongitudes = useMemo(() => {
        const map: Record<string, number> = {};
        planets.forEach(p => {
            map[p.planet] = getMCLongitude(p, birthDate);
        });
        return map;
    }, [planets]);

    const togglePlanet = (name: string) => {
        setVisiblePlanets(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleLine = (lt: LineType) => {
        setVisibleLines(prev => ({ ...prev, [lt]: !prev[lt] }));
    };

    // ── Zoom / Pan state ────────────────────────────────────
    const mapContainerWidth = screenWidth - 16;
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            'worklet';
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
            scale.value = newScale;
            const maxTx = (mapContainerWidth * (newScale - 1)) / 2;
            const maxTy = (scaledHeight * (newScale - 1)) / 2;
            translateX.value = Math.max(-maxTx, Math.min(maxTx, savedTranslateX.value));
            translateY.value = Math.max(-maxTy, Math.min(maxTy, savedTranslateY.value));
        })
        .onEnd(() => {
            'worklet';
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const panGesture = Gesture.Pan()
        .minPointers(1)
        .maxPointers(2)
        .onUpdate((e) => {
            'worklet';
            const s = scale.value;
            const maxTx = (mapContainerWidth * (s - 1)) / 2;
            const maxTy = (scaledHeight * (s - 1)) / 2;
            translateX.value = Math.max(-maxTx, Math.min(maxTx, savedTranslateX.value + e.translationX));
            translateY.value = Math.max(-maxTy, Math.min(maxTy, savedTranslateY.value + e.translationY));
        })
        .onEnd(() => {
            'worklet';
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            'worklet';
            if (scale.value > 1.5) {
                scale.value = withTiming(1, { duration: 300 });
                translateX.value = withTiming(0, { duration: 300 });
                translateY.value = withTiming(0, { duration: 300 });
                savedScale.value = 1;
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                scale.value = withTiming(3, { duration: 300 });
                savedScale.value = 3;
            }
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    const animatedMapStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Find nearest lines to a city
    const findNearestLines = (city: typeof CITIES[0]) => {
        const results: { planet: string; lineType: LineType; distance: number }[] = [];
        planets.forEach(p => {
            if (!visiblePlanets[p.planet]) return;
            const mcLng = mcLongitudes[p.planet];
            const icLng = getICLongitude(mcLng);

            // MC distance (longitude only)
            if (visibleLines.MC) {
                const dist = Math.abs(city.lng - mcLng);
                const wrapped = Math.min(dist, 360 - dist);
                if (wrapped < 15) results.push({ planet: p.planet, lineType: 'MC', distance: wrapped });
            }
            // IC distance
            if (visibleLines.IC) {
                const dist = Math.abs(city.lng - icLng);
                const wrapped = Math.min(dist, 360 - dist);
                if (wrapped < 15) results.push({ planet: p.planet, lineType: 'IC', distance: wrapped });
            }
            // ASC/DSC approximate (based on latitude proximity to declination curves)
            if (visibleLines.ASC) {
                const ascLat = p.declination;
                const latDist = Math.abs(city.lat - ascLat);
                const lngDist = Math.abs(city.lng - (mcLng - 90));
                const totalDist = Math.sqrt(latDist * latDist + Math.min(lngDist, 360 - lngDist) * lngDist * 0.1);
                if (totalDist < 20) results.push({ planet: p.planet, lineType: 'ASC', distance: totalDist });
            }
            if (visibleLines.DSC) {
                const dscLat = -p.declination;
                const latDist = Math.abs(city.lat - dscLat);
                const lngDist = Math.abs(city.lng - (mcLng + 90));
                const totalDist = Math.sqrt(latDist * latDist + Math.min(lngDist, 360 - lngDist) * lngDist * 0.1);
                if (totalDist < 20) results.push({ planet: p.planet, lineType: 'DSC', distance: totalDist });
            }
        });
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, 5);
    };

    const handleCityPress = (city: typeof CITIES[0]) => {
        const nearestLines = findNearestLines(city);
        setSelectedCity({ city, nearestLines });
    };

    // Render ASC/DSC curved lines (sine-wave approximation across longitudes)
    const renderCurvedLine = (planet: PlanetLine, lineType: 'ASC' | 'DSC', key: string) => {
        if (!visiblePlanets[planet.planet] || !visibleLines[lineType]) return null;

        const mcLng = mcLongitudes[planet.planet];
        const points: string[] = [];
        const peakLat = lineType === 'ASC' ? planet.declination : -planet.declination;
        const centerLng = lineType === 'ASC' ? mcLng - 90 : mcLng + 90;

        for (let i = -180; i <= 180; i += 3) {
            const lng = centerLng + i;
            // Sine curve peaking at centerLng with amplitude = declination
            const lat = peakLat * Math.cos((i / 180) * Math.PI);
            const { x, y } = geoToXY(lat, lng);
            if (x >= 0 && x <= MAP_WIDTH) {
                points.push(`${points.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
            }
        }

        if (points.length < 2) return null;

        return (
            <Path
                key={key}
                d={points.join(' ')}
                stroke={planet.color}
                strokeWidth={1.5}
                strokeDasharray={LINE_TYPE_INFO[lineType].dash || undefined}
                fill="none"
                opacity={0.7}
                onPress={() => setSelectedLine({ planet, lineType })}
            />
        );
    };

    return (
        <LinearGradient colors={['#0a0a2e', '#0d1b3e', '#0a0a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a2e" />
            <RisingStars />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroEmoji}>🌍</Text>
                    <Text style={styles.heroTitle}>Astrocartography</Text>
                    <Text style={styles.heroSubtitle}>Your Birth Chart Mapped Onto the Globe</Text>
                </View>

                {/* Explanation Card */}
                <View style={styles.explanationCard}>
                    <Text style={styles.explanationTitle}>✨ What is Astrocartography?</Text>
                    <Text style={styles.explanationText}>
                        At the exact moment you were born, each planet was rising, setting, or culminating at specific locations around the world. Astrocartography maps these planetary lines onto the globe, revealing where on Earth each planet's energy is strongest for YOU personally.
                    </Text>
                    <Text style={styles.explanationText}>
                        Moving to or visiting a <Text style={styles.bold}>Venus line</Text> could ignite romance and creativity. A <Text style={styles.bold}>Jupiter line</Text> might bring unexpected luck and abundance. Your <Text style={styles.bold}>Sun line</Text> is where you feel most alive and confident — your power zone.
                    </Text>
                    <Text style={styles.explanationText}>
                        Each planet projects four lines across the map:
                    </Text>
                    <View style={styles.lineTypeList}>
                        <Text style={styles.lineTypeItem}>
                            <Text style={styles.bold}>MC (Midheaven)</Text> — Career, fame, public standing
                        </Text>
                        <Text style={styles.lineTypeItem}>
                            <Text style={styles.bold}>IC (Imum Coeli)</Text> — Home, family, emotional roots
                        </Text>
                        <Text style={styles.lineTypeItem}>
                            <Text style={styles.bold}>ASC (Ascendant)</Text> — Identity, personal power, first impressions
                        </Text>
                        <Text style={styles.lineTypeItem}>
                            <Text style={styles.bold}>DSC (Descendant)</Text> — Relationships, partnerships, soulmates
                        </Text>
                    </View>
                    <Text style={styles.explanationText}>
                        Tap any line to learn what that planet's energy means at that location. Tap any city to discover which planetary lines run closest to it and what gifts — or challenges — await you there.
                    </Text>
                    <Text style={[styles.explanationText, { fontStyle: 'italic', marginTop: 8 }]}>
                        Whether you're choosing a vacation, relocation, or just curious why certain places "feel" different — your astrocartography map holds the answers.
                    </Text>
                </View>

                {/* Birth info */}
                <View style={styles.birthInfo}>
                    <Text style={styles.birthInfoText}>
                        🎂 {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  •  {zodiacSign}
                    </Text>
                </View>

                {/* Planet toggles */}
                <Text style={styles.filterLabel}>Tap planets to show/hide their lines:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toggleRow}>
                    {planets.map(p => (
                        <TouchableOpacity
                            key={p.planet}
                            style={[styles.planetToggle, visiblePlanets[p.planet] && { borderColor: p.color, backgroundColor: `${p.color}22` }]}
                            onPress={() => togglePlanet(p.planet)}
                        >
                            <Text style={[styles.planetToggleSymbol, { color: visiblePlanets[p.planet] ? p.color : '#666' }]}>{p.symbol}</Text>
                            <Text style={[styles.planetToggleName, { color: visiblePlanets[p.planet] ? '#fff' : '#666' }]}>{p.planet}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Line type toggles */}
                <View style={styles.lineToggles}>
                    {(['MC', 'IC', 'ASC', 'DSC'] as LineType[]).map(lt => (
                        <TouchableOpacity
                            key={lt}
                            style={[styles.lineToggle, visibleLines[lt] && styles.lineToggleActive]}
                            onPress={() => toggleLine(lt)}
                        >
                            <Text style={[styles.lineToggleText, visibleLines[lt] && styles.lineToggleTextActive]}>
                                {lt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Interactive Map — Pinch to zoom, drag to pan, double-tap to reset */}
                <GestureHandlerRootView style={[styles.mapContainer, { height: scaledHeight }]}>
                    <GestureDetector gesture={composedGesture}>
                        <Animated.View style={[{ width: mapContainerWidth, height: scaledHeight }, animatedMapStyle]}>
                            <Svg width={mapContainerWidth} height={scaledHeight} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
                                <Defs>
                                    <SvgLinearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#0a1628" />
                                        <Stop offset="0.5" stopColor="#0d2040" />
                                        <Stop offset="1" stopColor="#0a1628" />
                                    </SvgLinearGradient>
                                </Defs>

                                {/* Ocean background */}
                                <Rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGrad)" />

                                {/* Grid lines */}
                                {[-60, -30, 0, 30, 60].map(lat => {
                                    const { y } = geoToXY(lat, 0);
                                    return <Line key={`lat${lat}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />;
                                })}
                                {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map(lng => {
                                    const { x } = geoToXY(0, lng);
                                    return <Line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />;
                                })}

                                {/* Equator */}
                                <Line x1={0} y1={MAP_HEIGHT / 2} x2={MAP_WIDTH} y2={MAP_HEIGHT / 2} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} strokeDasharray="4,4" />

                                {/* Continents */}
                                {CONTINENTS.map((d, i) => (
                                    <Path key={`cont${i}`} d={d} fill="rgba(40,70,50,0.6)" stroke="rgba(100,180,120,0.3)" strokeWidth={0.5} />
                                ))}

                                {/* ─── Planetary Lines ─── */}
                                {planets.map(p => {
                                    if (!visiblePlanets[p.planet]) return null;
                                    const mcLng = mcLongitudes[p.planet];
                                    const icLng = getICLongitude(mcLng);
                                    const mcX = geoToXY(0, mcLng).x;
                                    const icX = geoToXY(0, icLng).x;

                                    return (
                                        <G key={p.planet}>
                                            {/* MC line (vertical) */}
                                            {visibleLines.MC && (
                                                <G onPress={() => setSelectedLine({ planet: p, lineType: 'MC' })}>
                                                    <Line
                                                        x1={mcX} y1={0} x2={mcX} y2={MAP_HEIGHT}
                                                        stroke={p.color} strokeWidth={2} opacity={0.8}
                                                    />
                                                    <SvgText x={mcX + 3} y={14} fill={p.color} fontSize={8} fontWeight="bold">{p.symbol} MC</SvgText>
                                                </G>
                                            )}
                                            {/* IC line (vertical, dashed) */}
                                            {visibleLines.IC && (
                                                <G onPress={() => setSelectedLine({ planet: p, lineType: 'IC' })}>
                                                    <Line
                                                        x1={icX} y1={0} x2={icX} y2={MAP_HEIGHT}
                                                        stroke={p.color} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.6}
                                                    />
                                                    <SvgText x={icX + 3} y={MAP_HEIGHT - 6} fill={p.color} fontSize={7} opacity={0.7}>{p.symbol} IC</SvgText>
                                                </G>
                                            )}
                                        </G>
                                    );
                                })}

                                {/* ASC / DSC curved lines */}
                                {planets.map(p => (
                                    <G key={`curves_${p.planet}`}>
                                        {renderCurvedLine(p, 'ASC', `asc_${p.planet}`)}
                                        {renderCurvedLine(p, 'DSC', `dsc_${p.planet}`)}
                                    </G>
                                ))}

                                {/* City dots */}
                                {CITIES.map((city, i) => {
                                    const { x, y } = geoToXY(city.lat, city.lng);
                                    return (
                                        <G key={`city${i}`} onPress={() => handleCityPress(city)}>
                                            <Circle cx={x} cy={y} r={3} fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} />
                                            <SvgText x={x + 5} y={y + 3} fill="rgba(255,255,255,0.5)" fontSize={5}>{city.name}</SvgText>
                                        </G>
                                    );
                                })}
                            </Svg>
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>

                {/* Zoom hint */}
                <Text style={styles.zoomHint}>Pinch to zoom  •  Double-tap to reset</Text>

                {/* Map Legend */}
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Map Legend</Text>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendLine, { backgroundColor: '#fff' }]} />
                        <Text style={styles.legendText}>Solid = MC (Midheaven)</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendLine, { backgroundColor: '#fff', opacity: 0.5 }]} />
                        <Text style={styles.legendText}>Dashed = IC (Nadir)</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendLine, { backgroundColor: '#fff', borderRadius: 2, height: 1 }]} />
                        <Text style={styles.legendText}>Curved dotted = ASC (Rising)</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendLine, { backgroundColor: '#fff', borderRadius: 2, height: 1, opacity: 0.5 }]} />
                        <Text style={styles.legendText}>Curved dashed = DSC (Setting)</Text>
                    </View>
                </View>

                {/* Planet Energy Guide */}
                <View style={styles.guideSection}>
                    <Text style={styles.guideTitle}>🌟 Planetary Energy Guide</Text>
                    <Text style={styles.guideSubtitle}>Tap any planet to learn what its lines mean for you</Text>
                    {planets.map(p => (
                        <TouchableOpacity
                            key={p.planet}
                            style={[styles.guideCard, { borderLeftColor: p.color }]}
                            onPress={() => setSelectedLine({ planet: p, lineType: 'MC' })}
                        >
                            <View style={styles.guideHeader}>
                                <Text style={[styles.guideSymbol, { color: p.color }]}>{p.symbol}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.guidePlanet}>{p.planet}</Text>
                                    <Text style={styles.guideKeyword}>{PLANET_MEANINGS[p.planet]?.keyword}</Text>
                                </View>
                                <Text style={styles.guideDegree}>
                                    {Math.floor(p.longitude / 30 === 0 ? p.longitude % 30 : p.longitude % 30)}° {ZODIAC_SIGNS[Math.floor(p.longitude / 30)]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* How to use */}
                <View style={styles.howTo}>
                    <Text style={styles.howToTitle}>🧭 How to Use Your Map</Text>
                    <Text style={styles.howToStep}>1️⃣  <Text style={styles.bold}>Find your power zones</Text> — Look where your Sun and Jupiter MC lines cross populated areas. These are your "lucky" cities.</Text>
                    <Text style={styles.howToStep}>2️⃣  <Text style={styles.bold}>Plan travel with intention</Text> — Visiting a Venus line? Expect romance and beauty. Mars line? Expect action and competition.</Text>
                    <Text style={styles.howToStep}>3️⃣  <Text style={styles.bold}>Understand relocations</Text> — Moving near a Saturn line builds character but brings challenges. A Jupiter line brings expansion and opportunity.</Text>
                    <Text style={styles.howToStep}>4️⃣  <Text style={styles.bold}>Crossings are powerful</Text> — Where two lines intersect, both planetary energies combine. A Venus-Jupiter crossing? Pure magic.</Text>
                    <Text style={styles.howToStep}>5️⃣  <Text style={styles.bold}>Lines have an orb of ~300 miles</Text> — You don't have to be exactly on the line. Being within a few hundred miles still activates its energy.</Text>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* ─── Line Detail Modal ─── */}
            <Modal visible={!!selectedLine} transparent animationType="slide" onRequestClose={() => setSelectedLine(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedLine && (
                            <>
                                <View style={[styles.modalHeader, { backgroundColor: selectedLine.planet.color + '20' }]}>
                                    <Text style={[styles.modalPlanetSymbol, { color: selectedLine.planet.color }]}>{selectedLine.planet.symbol}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalTitle}>{selectedLine.planet.planet} {selectedLine.lineType} Line</Text>
                                        <Text style={styles.modalSubtitle}>{LINE_TYPE_INFO[selectedLine.lineType].label}</Text>
                                    </View>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    <Text style={styles.modalSectionTitle}>🌍 The Line</Text>
                                    <Text style={styles.modalText}>{LINE_TYPE_INFO[selectedLine.lineType].meaning}</Text>

                                    <Text style={styles.modalSectionTitle}>{selectedLine.planet.symbol} {selectedLine.planet.planet} Energy</Text>
                                    <Text style={styles.modalKeyword}>{PLANET_MEANINGS[selectedLine.planet.planet]?.keyword}</Text>
                                    <Text style={styles.modalText}>{PLANET_MEANINGS[selectedLine.planet.planet]?.energy}</Text>

                                    <Text style={styles.modalSectionTitle}>✨ Combined Reading</Text>
                                    <Text style={styles.modalText}>
                                        {getCombinedReading(selectedLine.planet.planet, selectedLine.lineType)}
                                    </Text>

                                    <Text style={styles.modalPosition}>
                                        {selectedLine.planet.planet} at {Math.floor(selectedLine.planet.longitude % 30)}° {ZODIAC_SIGNS[Math.floor(selectedLine.planet.longitude / 30)]}
                                    </Text>
                                </ScrollView>

                                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedLine(null)}>
                                    <Text style={styles.modalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ─── City Detail Modal ─── */}
            <Modal visible={!!selectedCity} transparent animationType="slide" onRequestClose={() => setSelectedCity(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCity && (
                            <>
                                <View style={[styles.modalHeader, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Text style={styles.modalPlanetSymbol}>📍</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalTitle}>{selectedCity.city.name}</Text>
                                        <Text style={styles.modalSubtitle}>
                                            {selectedCity.city.lat.toFixed(1)}°{selectedCity.city.lat >= 0 ? 'N' : 'S'}, {selectedCity.city.lng.toFixed(1)}°{selectedCity.city.lng >= 0 ? 'E' : 'W'}
                                        </Text>
                                    </View>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    {selectedCity.nearestLines.length > 0 ? (
                                        <>
                                            <Text style={styles.modalSectionTitle}>🌟 Nearest Planetary Lines</Text>
                                            {selectedCity.nearestLines.map((line, i) => {
                                                const p = planets.find(pl => pl.planet === line.planet)!;
                                                return (
                                                    <View key={i} style={[styles.cityLineCard, { borderLeftColor: p.color }]}>
                                                        <Text style={[styles.cityLineSymbol, { color: p.color }]}>{p.symbol}</Text>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.cityLineName}>{p.planet} {line.lineType}</Text>
                                                            <Text style={styles.cityLineDistance}>{line.distance < 5 ? '⚡ Very close!' : `~${Math.round(line.distance)}° away`}</Text>
                                                            <Text style={styles.cityLineReading}>
                                                                {getCombinedReading(p.planet, line.lineType).substring(0, 120)}...
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <View style={styles.noPlanetCard}>
                                            <Text style={styles.noPlanetText}>No strong planetary lines near this city for your birth chart.</Text>
                                            <Text style={styles.noPlanetHint}>This can mean a neutral influence — neither strongly positive nor challenging. It's a blank canvas.</Text>
                                        </View>
                                    )}
                                </ScrollView>

                                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedCity(null)}>
                                    <Text style={styles.modalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

// ─── Combined reading generator ──────────────────────────────
function getCombinedReading(planet: string, lineType: LineType): string {
    const readings: Record<string, Record<LineType, string>> = {
        Sun: {
            MC: 'Your Sun MC line marks cities where your career and public identity blaze brightest. You\'ll be seen, recognized, and celebrated here. Leadership roles come naturally, and your creative ambitions find their biggest stage.',
            IC: 'Your Sun IC line reveals where you\'ll build the most radiant home life. Family connections deepen, and you discover where your roots truly belong. A profound sense of "this is where I\'m meant to be."',
            ASC: 'Your Sun Ascendant line is your ultimate power zone. Here, your confidence, charisma, and vitality are amplified. People are drawn to your energy. You feel unstoppable and authentically yourself.',
            DSC: 'Your Sun Descendant line attracts powerful, charismatic partners. Relationships formed here tend to be significant and transformative. You attract people who reflect your best qualities.',
        },
        Moon: {
            MC: 'Your Moon MC line makes your emotional intelligence your greatest career asset. Public roles involving care, nurturing, or intuition thrive here. You connect with audiences on a deep emotional level.',
            IC: 'Your Moon IC line is perhaps the most powerful "home" indicator in astrocartography. This is where you feel most emotionally safe, nurtured, and at peace. A perfect place to raise a family.',
            ASC: 'Your Moon Ascendant line makes you deeply emotionally present. Others sense your empathy immediately. Your intuition is razor-sharp here, and emotional connections form quickly.',
            DSC: 'Your Moon Descendant line draws emotionally deep, nurturing partners into your life. Relationships here are caring and intuitive, built on emotional safety and mutual understanding.',
        },
        Mercury: {
            MC: 'Your Mercury MC line supercharges your communication in professional settings. Writing, speaking, teaching, and media careers flourish here. Your ideas get heard and your words carry weight.',
            IC: 'Your Mercury IC line creates a home environment buzzing with intellectual stimulation. Great for writers, lifelong learners, and anyone who needs mental clarity in their personal life.',
            ASC: 'Your Mercury Ascendant line sharpens your wit and communication style. You come across as intelligent, articulate, and engaging. Perfect for networking and making brilliant first impressions.',
            DSC: 'Your Mercury Descendant line attracts intellectually stimulating partners. Relationships here thrive on conversation, shared curiosity, and mental connection.',
        },
        Venus: {
            MC: 'Your Venus MC line is where beauty, art, and love intersect with your career. Creative professions thrive, financial opportunities flow more easily, and you\'re seen as charming and attractive in professional settings.',
            IC: 'Your Venus IC line creates a beautiful, harmonious home life. This is where you\'ll build your most aesthetically pleasing sanctuary. Love within the family deepens and domestic bliss prevails.',
            ASC: 'Your Venus Ascendant line is the ultimate romance magnet. Your attractiveness — both physical and energetic — is amplified. Love finds you more easily here, and you radiate beauty and grace.',
            DSC: 'Your Venus Descendant line is the love line. Soulmate-level romantic connections are more likely here. Partnerships of all kinds are harmonious, loving, and mutually beneficial.',
        },
        Mars: {
            MC: 'Your Mars MC line fuels ambitious career moves. You\'ll be driven, competitive, and willing to fight for what you want professionally. Entrepreneurial energy is strong, but watch for workplace conflicts.',
            IC: 'Your Mars IC line brings intense energy to home life. You\'ll pour passion into building your personal world, but domestic tensions can flare. Channel this energy into home renovation or physical projects.',
            ASC: 'Your Mars Ascendant line makes you bold, assertive, and physically energized. You come across as a force of nature here. Great for athletic pursuits, but watch for aggression or impatience.',
            DSC: 'Your Mars Descendant line attracts passionate, assertive partners. Relationships are intense and physically charged, but arguments can be fiercer too. Great chemistry, just manage the fire.',
        },
        Jupiter: {
            MC: 'Your Jupiter MC line is the golden ticket for career success. Opportunities expand, luck finds you in professional settings, and your reputation grows effortlessly. The universe opens doors here.',
            IC: 'Your Jupiter IC line blesses your home life with abundance and generosity. Family connections are warm, your living space expands (literally and figuratively), and a sense of gratitude fills your personal world.',
            ASC: 'Your Jupiter Ascendant line is a luck magnet. You attract good fortune, meet generous people, and your optimism is contagious. Life feels bigger, brighter, and full of possibility.',
            DSC: 'Your Jupiter Descendant line brings generous, optimistic, and wise partners into your life. Relationships here expand your horizons — through travel, philosophy, or shared adventures.',
        },
        Saturn: {
            MC: 'Your Saturn MC line brings serious career responsibilities and the potential for lasting professional achievement. Success comes through discipline and hard work, not shortcuts. The payoff is enduring legacy.',
            IC: 'Your Saturn IC line can feel heavy domestically — responsibilities pile up, and home life requires maturity. But the structures you build here last a lifetime. Delayed gratification leads to deep security.',
            ASC: 'Your Saturn Ascendant line brings a sense of gravity and responsibility. Others see you as mature and reliable. Life here may feel harder, but the character you build is unshakeable.',
            DSC: 'Your Saturn Descendant line attracts mature, stable, but possibly controlling partners. Relationships here teach lessons about commitment, boundaries, and the deeper meaning of partnership.',
        },
        Uranus: {
            MC: 'Your Uranus MC line brings sudden, unexpected career shifts. Innovation, technology, and unconventional paths thrive here. You may reinvent your professional identity entirely — embrace the disruption.',
            IC: 'Your Uranus IC line shakes up home life with unpredictability. Living situations change unexpectedly, but liberation from old domestic patterns is the gift. Freedom in your personal world.',
            ASC: 'Your Uranus Ascendant line electrifies your personality. You come across as unique, eccentric, and ahead of your time. Expect sudden life changes and a powerful urge for personal freedom.',
            DSC: 'Your Uranus Descendant line attracts unusual, free-spirited partners. Relationships here are exciting and unpredictable but may resist conventional commitment. Freedom-loving love.',
        },
        Neptune: {
            MC: 'Your Neptune MC line brings a dreamy, creative, and possibly confusing quality to your career. Artistic and spiritual pursuits flourish, but watch for unclear professional boundaries or deception.',
            IC: 'Your Neptune IC line creates an almost mystical home environment. Creativity and spirituality seep into daily life. Beautiful for artists and healers, but be cautious of escapism or boundary issues.',
            ASC: 'Your Neptune Ascendant line gives you an ethereal, mysterious quality. Others are captivated by your presence but may project fantasies onto you. Spiritual awareness deepens, but stay grounded.',
            DSC: 'Your Neptune Descendant line attracts soulful, artistic, or spiritual partners — but also potential for illusion in relationships. Use discernment. The genuine connections here are profoundly healing.',
        },
        Pluto: {
            MC: 'Your Pluto MC line brings intense transformation to your career. Power dynamics are amplified — you may rise to incredible heights or face deep professional crises that ultimately reshape you. Nothing stays surface-level.',
            IC: 'Your Pluto IC line transforms your relationship with home, family, and personal security at the deepest level. Buried family patterns surface for healing. Extremely powerful for psychological breakthroughs.',
            ASC: 'Your Pluto Ascendant line gives you an intense, magnetic, and somewhat intimidating presence. You undergo profound personal transformations here. Others sense your depth and power immediately.',
            DSC: 'Your Pluto Descendant line attracts deeply transformative relationships. Partnerships here are intense, psychological, and life-changing — for better or worse. Nothing is casual on a Pluto line.',
        },
    };
    return readings[planet]?.[lineType] || `The ${planet} ${lineType} line brings the energy of ${planet} to your ${LINE_TYPE_INFO[lineType].label.toLowerCase()}.`;
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 30 },
    hero: { alignItems: 'center', marginTop: 16, marginBottom: 12 },
    heroEmoji: { fontSize: 60 },
    heroTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff', letterSpacing: 1, marginTop: 4 },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },

    explanationCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    explanationTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    explanationText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21, marginBottom: 8 },
    bold: { fontWeight: 'bold', color: '#fff' },
    lineTypeList: { marginLeft: 8, marginBottom: 8 },
    lineTypeItem: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },

    birthInfo: { alignItems: 'center', marginBottom: 12 },
    birthInfoText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },

    filterLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, marginBottom: 6 },
    toggleRow: { paddingHorizontal: 12, marginBottom: 10 },
    planetToggle: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 3,
        minWidth: 58,
    },
    planetToggleSymbol: { fontSize: 20 },
    planetToggleName: { fontSize: 9, marginTop: 2 },

    lineToggles: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 16 },
    lineToggle: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    lineToggleActive: { borderColor: '#6C63FF', backgroundColor: 'rgba(108,99,255,0.15)' },
    lineToggleText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
    lineToggleTextActive: { color: '#6C63FF' },

    mapContainer: {
        marginHorizontal: 8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    zoomHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 2,
    },

    legend: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 4,
    },
    legendTitle: { fontSize: 13, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendLine: { width: 24, height: 2, borderRadius: 1 },
    legendText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

    guideSection: { paddingHorizontal: 16, marginTop: 16 },
    guideTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    guideSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
    guideCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
    },
    guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    guideSymbol: { fontSize: 28 },
    guidePlanet: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    guideKeyword: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    guideDegree: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'right' },

    howTo: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 16,
        marginTop: 20,
    },
    howToTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    howToStep: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 10 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#1a1a3e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalPlanetSymbol: { fontSize: 36 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    modalSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    modalBody: { paddingHorizontal: 20, paddingBottom: 10 },
    modalSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 16, marginBottom: 6 },
    modalKeyword: { fontSize: 14, color: '#6C63FF', fontWeight: '600', marginBottom: 4 },
    modalText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21, marginBottom: 8 },
    modalPosition: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 12, marginBottom: 8 },
    modalClose: {
        margin: 16,
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(108,99,255,0.2)',
        alignItems: 'center',
    },
    modalCloseText: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },

    // City modal
    cityLineCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    cityLineSymbol: { fontSize: 24, marginTop: 2 },
    cityLineName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
    cityLineDistance: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    cityLineReading: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18, marginTop: 4 },
    noPlanetCard: { padding: 20, alignItems: 'center' },
    noPlanetText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    noPlanetHint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
