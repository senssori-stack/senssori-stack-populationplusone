import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import SignFrontLandscape, { LANDSCAPE_HEIGHT, LANDSCAPE_WIDTH } from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { useCart } from '../context/CartContext';
import { birthstoneFromISO } from '../data/utils/birthstone';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getZodiacFromISO } from '../data/utils/zodiac';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PrintService'>;

// --- MATERIAL OPTIONS ---
type MaterialId = 'cardstock' | 'plastic' | 'metal';

interface MaterialOption {
    id: MaterialId;
    name: string;
    emoji: string;
    description: string;
    priceMultiplier: number;
}

const MATERIALS: MaterialOption[] = [
    {
        id: 'cardstock',
        name: 'Premium Cardstock',
        emoji: '\uD83D\uDCC4',
        description: '16pt high-gloss cardstock \u2014 thick, vibrant, fade-resistant. Looks stunning for 10+ years when framed.',
        priceMultiplier: 1.0,
    },
    {
        id: 'plastic',
        name: 'Rigid Plastic (PVC)',
        emoji: '\uD83D\uDEE1\uFE0F',
        description: 'Glossy rigid PVC \u2014 waterproof, UV-resistant, built to last 15+ years indoors or outdoors.',
        priceMultiplier: 2.2,
    },
    {
        id: 'metal',
        name: 'Aluminum Metal',
        emoji: '\u2728',
        description: 'HD aluminum sublimation \u2014 museum-grade, scratch-proof, fade-proof. A lifetime keepsake that lasts 25+ years.',
        priceMultiplier: 4.5,
    },
];

// --- SIZE OPTIONS ---
type SizeId = '8.5x11' | '11x14' | '18x24' | '24x36';

interface SizeOption {
    id: SizeId;
    name: string;
    description: string;
    basePrice: number;
    tag?: string;
}

const SIZES: SizeOption[] = [
    { id: '8.5x11', name: '11" \u00D7 8.5"', description: 'Standard letter size', basePrice: 5.99 },
    { id: '11x14', name: '14" \u00D7 11"', description: 'Large \u2014 great for framing', basePrice: 8.99, tag: 'Popular' },
    { id: '18x24', name: '24" \u00D7 18"', description: 'Poster \u2014 real statement piece', basePrice: 14.99 },
    { id: '24x36', name: '36" \u00D7 24"', description: 'Jumbo \u2014 maximum wow factor', basePrice: 22.99 },
];

// --- MAIN PACKAGE ITEMS ---
interface PackageItem {
    id: string;
    name: string;
    emoji: string;
    included: boolean;
    optional?: boolean;
    orientation: 'landscape' | 'portrait';
}

const PACKAGE_ITEMS: PackageItem[] = [
    { id: 'sign-front', name: 'Birth Announcement (Sign Front)', emoji: '\uD83C\uDFE0', included: true, orientation: 'landscape' },
    { id: 'time-capsule', name: 'Time Capsule', emoji: '\u23F3', included: true, orientation: 'landscape' },
    { id: 'natal-chart', name: 'Natal Chart', emoji: '\uD83D\uDD2E', included: true, orientation: 'portrait' },
    { id: 'chart-guide', name: 'Chart Reading Guide', emoji: '\uD83D\uDCD6', included: true, orientation: 'portrait' },
    { id: 'letter', name: 'Letter to Baby', emoji: '\uD83D\uDC8C', included: false, optional: true, orientation: 'portrait' },
];

// --- ADD-ON PRODUCTS ---
interface AddOn {
    id: string;
    name: string;
    emoji: string;
    description: string;
    options: { label: string; quantity: string; price: number }[];
    material: string;
}

const ADD_ONS: AddOn[] = [
    {
        id: 'baseball-cards',
        name: 'Rookie Trading Cards',
        emoji: '\u26BE',
        description: 'Double-sided, 32pt ultra-thick glossy cardstock. Rigid, collector-grade quality that won\u2019t bend, fade, or wear \u2014 built to survive decades in a wallet, scrapbook, or display case.',
        material: '32pt Ultra-Thick Cardstock (collector grade)',
        options: [
            { label: '1 Sheet (9 cards)', quantity: '9', price: 12.99 },
            { label: '2 Sheets (18 cards)', quantity: '18', price: 22.99 },
            { label: '3 Sheets (27 cards)', quantity: '27', price: 29.99 },
            { label: '5 Sheets (45 cards)', quantity: '45', price: 44.99 },
            { label: '10 Sheets (90 cards)', quantity: '90', price: 79.99 },
        ],
    },
    {
        id: 'postcards',
        name: 'Announcement Postcards',
        emoji: '\uD83D\uDCEE',
        description: 'Double-sided, 16pt high-gloss cardstock. Thick, rigid, and vibrant \u2014 the kind people save in keepsake boxes for years, not toss in the recycling.',
        material: '16pt High-Gloss Cardstock (archival quality)',
        options: [
            { label: '10 Postcards (4\u00D76")', quantity: '10', price: 14.99 },
            { label: '25 Postcards (4\u00D76")', quantity: '25', price: 29.99 },
            { label: '50 Postcards (4\u00D76")', quantity: '50', price: 49.99 },
            { label: '100 Postcards (4\u00D76")', quantity: '100', price: 79.99 },
            { label: '250 Postcards (4\u00D76")', quantity: '250', price: 159.99 },
        ],
    },
    {
        id: 'yard-sign',
        name: 'Front Yard Welcome Sign',
        emoji: '\uD83C\uDFE1',
        description: 'Corrugated plastic (Coroplast), fully weatherproof and UV-resistant. Holds up in sun, rain, and wind \u2014 then bring it inside as a lasting keepsake.',
        material: '4mm Corrugated Plastic (weatherproof)',
        options: [
            { label: '18" \u00D7 24" Yard Sign', quantity: '1', price: 34.99 },
            { label: '24" \u00D7 36" Yard Sign', quantity: '1', price: 49.99 },
        ],
    },
];

// --- PRICE CALCULATOR ---
function calculatePackagePrice(size: SizeId, material: MaterialId, includesLetter: boolean): number {
    const sizeOption = SIZES.find(s => s.id === size)!;
    const materialOption = MATERIALS.find(m => m.id === material)!;
    const sheetCount = includesLetter ? 5 : 4;
    return Math.round(sizeOption.basePrice * materialOption.priceMultiplier * sheetCount * 100) / 100;
}

function formatPrice(price: number): string {
    return '$' + price.toFixed(2);
}

// --- COMPONENT ---
export default function PrintServiceScreen({ navigation, route }: Props) {
    const designData = route.params || {};
    const { addToCart } = useCart();

    const [selectedSize, setSelectedSize] = useState<SizeId | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialId | null>(null);
    const [includeLetter, setIncludeLetter] = useState(true);
    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
    const [previewTab, setPreviewTab] = useState<'front' | 'back'>('front');
    const { width: screenWidth } = useWindowDimensions();

    const babyFirstNames: string[] = designData.babies && designData.babies.length > 0
        ? designData.babies
            .filter((b: any) => (b.first || '').trim().length > 0)
            .map((b: any) => (b.first || '').trim())
        : [(designData.babyFirst || '').trim()].filter(Boolean);

    const babyNames = designData.babies && designData.babies.length > 0
        ? designData.babies
            .filter((b: any) => (b.first || '').trim().length > 0)
            .map((b: any) => (b.first + ' ' + (b.middle || '') + ' ' + (b.last || '')).trim())
            .join(' & ')
        : ((designData.babyFirst || '') + ' ' + (designData.babyMiddle || '') + ' ' + (designData.babyLast || '')).trim() || 'Baby';

    const birthDate = designData.dobISO ? new Date(designData.dobISO).toLocaleDateString() : '';

    const babyCount = designData.babyCount || babyFirstNames.length || 1;

    // Count uploaded photos
    const uploadedPhotos = (designData.photoUris || []).filter((u): u is string => u != null && typeof u === 'string');
    const photoCount = uploadedPhotos.length;

    // --- DYNAMIC ADD-ONS: Expand per-photo/per-baby designs ---
    const effectiveAddOns: AddOn[] = React.useMemo(() => {
        const babyName = babyFirstNames[0] || 'Baby';

        // --- SINGLES with multiple photos: per-photo design options ---
        if (babyCount <= 1 && photoCount > 1) {
            const result: AddOn[] = [];
            for (const addOn of ADD_ONS) {
                if (addOn.id === 'yard-sign') {
                    result.push(addOn);
                } else if (addOn.id === 'baseball-cards') {
                    // Per-photo trading card designs
                    for (let p = 0; p < photoCount; p++) {
                        result.push({
                            ...addOn,
                            id: `baseball-cards-photo-${p}`,
                            name: `Photo ${p + 1} Rookie Cards`,
                            emoji: '\u26BE',
                            description: `${babyName}'s trading cards using photo ${p + 1}. Double-sided, 32pt ultra-thick glossy cardstock. 9 cards per sheet.`,
                        });
                    }
                    // Mix & Match bundle — all photo designs, ~15% off
                    result.push({
                        ...addOn,
                        id: 'baseball-cards-bundle',
                        name: '\uD83C\uDF1F Mix & Match Bundle',
                        emoji: '\u26BE',
                        description: `${photoCount} unique card designs — one per photo. Mix and match ${babyName}'s best shots! Save ~15% vs. buying each separately.`,
                        options: photoCount === 2 ? [
                            { label: '2 Sheets (18 cards, 1 per design)', quantity: '18', price: 21.99 },
                            { label: '4 Sheets (36 cards, 2 per design)', quantity: '36', price: 38.99 },
                            { label: '6 Sheets (54 cards, 3 per design)', quantity: '54', price: 49.99 },
                            { label: '10 Sheets (90 cards, 5 per design)', quantity: '90', price: 74.99 },
                        ] : [
                            { label: '3 Sheets (27 cards, 1 per design)', quantity: '27', price: 29.99 },
                            { label: '6 Sheets (54 cards, 2 per design)', quantity: '54', price: 54.99 },
                            { label: '9 Sheets (81 cards, 3 per design)', quantity: '81', price: 69.99 },
                            { label: '15 Sheets (135 cards, 5 per design)', quantity: '135', price: 109.99 },
                        ],
                    });
                } else if (addOn.id === 'postcards') {
                    // Per-photo postcard designs
                    for (let p = 0; p < photoCount; p++) {
                        result.push({
                            ...addOn,
                            id: `postcards-photo-${p}`,
                            name: `Photo ${p + 1} Postcards`,
                            emoji: '\uD83D\uDCEE',
                            description: `Announcement postcards featuring ${babyName}'s photo ${p + 1}. Double-sided, 16pt high-gloss cardstock. USPS-ready.`,
                        });
                    }
                    // Mix & Match bundle — all photo designs, ~15% off
                    result.push({
                        ...addOn,
                        id: 'postcards-bundle',
                        name: '\uD83C\uDF1F Mix & Match Bundle',
                        emoji: '\uD83D\uDCEE',
                        description: `${photoCount} unique postcard designs — one per photo. Share different looks with family & friends! Save ~15% vs. buying each separately.`,
                        options: photoCount === 2 ? [
                            { label: '20 Postcards (2 designs \u00D7 10 each)', quantity: '20', price: 24.99 },
                            { label: '50 Postcards (2 designs \u00D7 25 each)', quantity: '50', price: 49.99 },
                            { label: '100 Postcards (2 designs \u00D7 50 each)', quantity: '100', price: 84.99 },
                            { label: '200 Postcards (2 designs \u00D7 100 each)', quantity: '200', price: 134.99 },
                        ] : [
                            { label: '30 Postcards (3 designs \u00D7 10 each)', quantity: '30', price: 34.99 },
                            { label: '75 Postcards (3 designs \u00D7 25 each)', quantity: '75', price: 74.99 },
                            { label: '150 Postcards (3 designs \u00D7 50 each)', quantity: '150', price: 124.99 },
                            { label: '300 Postcards (3 designs \u00D7 100 each)', quantity: '300', price: 199.99 },
                        ],
                    });
                } else {
                    result.push(addOn);
                }
            }
            return result;
        }

        // --- SINGLES with 0-1 photos: standard add-ons ---
        if (babyCount <= 1) return ADD_ONS;

        // --- TWINS / TRIPLETS: per-baby design options ---
        const result: AddOn[] = [];
        for (const addOn of ADD_ONS) {
            if (addOn.id === 'yard-sign') {
                result.push(addOn);
            } else if (addOn.id === 'baseball-cards') {
                babyFirstNames.forEach((name, i) => {
                    result.push({
                        ...addOn,
                        id: `baseball-cards-${i}`,
                        name: `${name}'s Rookie Cards`,
                        emoji: '\u26BE',
                        description: `Personalized trading cards featuring ${name}. Double-sided, 32pt ultra-thick glossy cardstock. 9 cards per sheet.`,
                    });
                });
                const allNames = babyFirstNames.length === 2
                    ? `${babyFirstNames[0]} & ${babyFirstNames[1]}`
                    : `${babyFirstNames[0]}, ${babyFirstNames[1]} & ${babyFirstNames[2]}`;
                result.push({
                    ...addOn,
                    id: 'baseball-cards-bundle',
                    name: '\uD83C\uDF1F All Designs Bundle',
                    emoji: '\u26BE',
                    description: `${babyCount} unique card designs (one per baby: ${allNames}). Save ~15% vs. buying each separately!`,
                    options: [
                        { label: `${babyCount} Sheets (${babyCount * 9} cards, 1 per design)`, quantity: String(babyCount * 9), price: babyCount === 2 ? 21.99 : 29.99 },
                        { label: `${babyCount * 2} Sheets (${babyCount * 2 * 9} cards, 2 per design)`, quantity: String(babyCount * 2 * 9), price: babyCount === 2 ? 38.99 : 54.99 },
                        { label: `${babyCount * 3} Sheets (${babyCount * 3 * 9} cards, 3 per design)`, quantity: String(babyCount * 3 * 9), price: babyCount === 2 ? 49.99 : 69.99 },
                        { label: `${babyCount * 5} Sheets (${babyCount * 5 * 9} cards, 5 per design)`, quantity: String(babyCount * 5 * 9), price: babyCount === 2 ? 74.99 : 109.99 },
                    ],
                });
            } else if (addOn.id === 'postcards') {
                babyFirstNames.forEach((name, i) => {
                    result.push({
                        ...addOn,
                        id: `postcards-${i}`,
                        name: `${name}'s Postcards`,
                        emoji: '\uD83D\uDCEE',
                        description: `Announcement postcards featuring ${name}'s photo. Double-sided, 16pt high-gloss cardstock. USPS-ready.`,
                    });
                });
                const allNames = babyFirstNames.length === 2
                    ? `${babyFirstNames[0]} & ${babyFirstNames[1]}`
                    : `${babyFirstNames[0]}, ${babyFirstNames[1]} & ${babyFirstNames[2]}`;
                result.push({
                    ...addOn,
                    id: 'postcards-bundle',
                    name: '\uD83C\uDF1F All Designs Bundle',
                    emoji: '\uD83D\uDCEE',
                    description: `${babyCount} unique postcard designs (one per baby: ${allNames}). Save ~15% vs. buying each separately!`,
                    options: [
                        { label: `${babyCount * 10} Postcards (${babyCount} designs \u00D7 10 each)`, quantity: String(babyCount * 10), price: babyCount === 2 ? 24.99 : 34.99 },
                        { label: `${babyCount * 25} Postcards (${babyCount} designs \u00D7 25 each)`, quantity: String(babyCount * 25), price: babyCount === 2 ? 49.99 : 74.99 },
                        { label: `${babyCount * 50} Postcards (${babyCount} designs \u00D7 50 each)`, quantity: String(babyCount * 50), price: babyCount === 2 ? 84.99 : 124.99 },
                        { label: `${babyCount * 100} Postcards (${babyCount} designs \u00D7 100 each)`, quantity: String(babyCount * 100), price: babyCount === 2 ? 134.99 : 199.99 },
                    ],
                });
            } else {
                result.push(addOn);
            }
        }
        return result;
    }, [babyCount, photoCount, babyFirstNames.join(',')]);

    const packagePrice = selectedSize && selectedMaterial
        ? calculatePackagePrice(selectedSize, selectedMaterial, includeLetter)
        : 0;

    const addOnTotal = Object.entries(selectedAddOns).reduce((sum, [addOnId, optionIndex]) => {
        if (optionIndex < 0) return sum;
        const addOn = effectiveAddOns.find(a => a.id === addOnId);
        if (!addOn) return sum;
        return sum + addOn.options[optionIndex].price;
    }, 0);

    const orderTotal = packagePrice + addOnTotal;

    const toggleAddOn = (addOnId: string, optionIndex: number) => {
        setSelectedAddOns(prev => {
            if (prev[addOnId] === optionIndex) {
                const copy = { ...prev };
                delete copy[addOnId];
                return copy;
            }
            return { ...prev, [addOnId]: optionIndex };
        });
    };

    const handleAddToCart = () => {
        if (!selectedSize || !selectedMaterial) {
            Alert.alert('Selection Required', 'Please select a size and material for your print package.');
            return;
        }

        const sizeLabel = SIZES.find(s => s.id === selectedSize)!.name;
        const materialLabel = MATERIALS.find(m => m.id === selectedMaterial)!.name;
        const sheetCount = includeLetter ? 5 : 4;

        // Spelling confirmation before adding to cart
        Alert.alert(
            '\uD83D\uDC8E Quick Spelling Check',
            'Your prints will read exactly as entered:\n\n' +
            '\uD83D\uDC76 ' + babyNames + '\n' +
            (birthDate ? '\uD83D\uDCC5 ' + birthDate + '\n' : '') +
            (designData.hometown ? '\uD83D\uDCCD ' + designData.hometown + '\n' : '') +
            '\nThese keepsakes are meant to last a lifetime. Please verify every name and detail is spelled correctly before placing your order.',
            [
                { text: 'Go Back & Edit', style: 'cancel' },
                { text: 'Looks Perfect!', onPress: () => confirmAddToCart(sizeLabel, materialLabel, sheetCount) },
            ]
        );
    };

    const confirmAddToCart = (sizeLabel: string, materialLabel: string, sheetCount: number) => {
        addToCart({
            id: 'pkg-' + selectedSize + '-' + selectedMaterial + '-' + Date.now(),
            name: 'Print Package (' + sheetCount + ' Sheets)',
            description: sizeLabel + ' \u2022 ' + materialLabel + ' \u2022 ' + babyNames,
            price: packagePrice,
            productType: 'front',
        });

        Object.entries(selectedAddOns).forEach(([addOnId, optionIndex]) => {
            if (optionIndex < 0) return;
            const addOn = effectiveAddOns.find(a => a.id === addOnId)!;
            const option = addOn.options[optionIndex];
            addToCart({
                id: addOnId + '-' + optionIndex + '-' + Date.now(),
                name: addOn.emoji + ' ' + addOn.name,
                description: option.label,
                price: option.price,
                productType: addOnId.startsWith('baseball-cards') ? 'babycard' :
                    addOnId.startsWith('postcards') ? 'postcard' : 'yardsign',
            });
        });

        Alert.alert(
            '\uD83D\uDED2 Added to Cart!',
            'Your print order has been added to your cart.\n\n' +
            sheetCount + '-Sheet Package: ' + formatPrice(packagePrice) + '\n' +
            (addOnTotal > 0 ? 'Add-ons: ' + formatPrice(addOnTotal) + '\n' : '') +
            '\nTotal: ' + formatPrice(orderTotal),
            [
                { text: 'Continue Shopping', style: 'cancel' },
                {
                    text: 'Go to Checkout',
                    onPress: () => navigation.navigate('Checkout'),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>{'\u2190'} Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'\uD83D\uDDA8\uFE0F'} Print & Order</Text>
                <View style={{ width: 60 }} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.summaryBanner}>
                    <Text style={styles.summaryTitle}>Your Design for {babyNames}</Text>
                    {birthDate ? <Text style={styles.summaryDetail}>Born: {birthDate}</Text> : null}
                    <Text style={styles.summaryDetail}>{'\uD83D\uDCCD'} {designData.hometown || 'Hometown'}</Text>
                    <View style={styles.verifyNote}>
                        <Text style={styles.verifyNoteText}>
                            {'\uD83D\uDC8E'} These details will be permanently printed on your keepsake.{' '}
                            If anything above needs correcting, go back and update it before ordering.
                        </Text>
                    </View>
                </View>

                <View style={styles.qualityBanner}>
                    <Text style={styles.qualityBannerTitle}>{'\uD83C\uDFC6'} Professional-Grade Prints, Built to Last</Text>
                    <Text style={styles.qualityBannerText}>
                        Every item is printed on premium, commercial-grade materials with vivid, fade-resistant inks.
                        These are heirloom-quality keepsakes designed to look as stunning in 20 years as the day they arrive at your door.
                    </Text>
                    <View style={styles.qualityBadges}>
                        <View style={styles.qualityBadge}>
                            <Text style={styles.qualityBadgeEmoji}>{'\uD83D\uDEE1\uFE0F'}</Text>
                            <Text style={styles.qualityBadgeText}>Fade-Resistant</Text>
                        </View>
                        <View style={styles.qualityBadge}>
                            <Text style={styles.qualityBadgeEmoji}>{'\u2728'}</Text>
                            <Text style={styles.qualityBadgeText}>High-Gloss Finish</Text>
                        </View>
                        <View style={styles.qualityBadge}>
                            <Text style={styles.qualityBadgeEmoji}>{'\uD83D\uDCAA'}</Text>
                            <Text style={styles.qualityBadgeText}>Thick & Rigid</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{'\uD83D\uDCE6'} Print Package</Text>
                <Text style={styles.sectionSubtitle}>
                    {includeLetter ? '5' : '4'} sheets (1 of each), single-sided, all high-gloss finish
                </Text>

                <View style={styles.card}>
                    {PACKAGE_ITEMS.map(item => {
                        const isIncluded = item.included || (item.optional === true && includeLetter);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.checklistItem}
                                disabled={!item.optional}
                                onPress={() => item.optional && setIncludeLetter(!includeLetter)}
                            >
                                <Text style={styles.checkEmoji}>
                                    {isIncluded ? '\u2705' : '\u2B1C'}
                                </Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.checkLabel, !isIncluded && styles.checkLabelDim]}>
                                        {item.emoji} {item.name}
                                    </Text>
                                    <Text style={styles.orientationLabel}>
                                        {item.orientation === 'landscape' ? '\u2194\uFE0F Landscape' : '\u2195\uFE0F Portrait'}
                                    </Text>
                                </View>
                                {item.optional && (
                                    <Text style={styles.optionalBadge}>tap to {includeLetter ? 'remove' : 'add'}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>{'\uD83D\uDCD0'} Choose Size</Text>
                <Text style={styles.sectionSubtitle}>
                    Printed like a photo {'\u2014'} scaled proportionally, never stretched or cropped
                </Text>
                <View style={styles.sizeGrid}>
                    {SIZES.map(size => (
                        <TouchableOpacity
                            key={size.id}
                            style={[styles.optionBtn, selectedSize === size.id && styles.optionBtnActive]}
                            onPress={() => setSelectedSize(size.id)}
                        >
                            {size.tag ? (
                                <View style={styles.sizeTag}>
                                    <Text style={styles.sizeTagText}>{size.tag}</Text>
                                </View>
                            ) : null}
                            <Text style={[styles.optionBtnTitle, selectedSize === size.id && styles.optionBtnTitleActive]}>
                                {size.name}
                            </Text>
                            <Text style={[styles.optionBtnDesc, selectedSize === size.id && styles.optionBtnDescActive]}>
                                {size.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- SIZE PREVIEW: Show actual sign at selected aspect ratio --- */}
                {selectedSize && (() => {
                    // Physical dimensions in inches (landscape orientation)
                    const sizeMap: Record<SizeId, { w: number; h: number }> = {
                        '8.5x11': { w: 11, h: 8.5 },
                        '11x14': { w: 14, h: 11 },
                        '18x24': { w: 24, h: 18 },
                        '24x36': { w: 36, h: 24 },
                    };
                    const dims = sizeMap[selectedSize];
                    const printAspect = dims.w / dims.h; // target print aspect ratio
                    const nativeAspect = LANDSCAPE_WIDTH / LANDSCAPE_HEIGHT; // 3300/2550 = 1.294

                    // Container: fill screen width - margins, height from print aspect ratio
                    const containerW = screenWidth - 32;
                    const containerH = containerW / printAspect;

                    // Scale the component to fit inside the container proportionally (no stretch)
                    const scaleByW = containerW / LANDSCAPE_WIDTH;
                    const scaleByH = containerH / LANDSCAPE_HEIGHT;
                    const fitScale = Math.min(scaleByW, scaleByH);

                    // Rendered pixel size of the component
                    const renderedW = LANDSCAPE_WIDTH * fitScale;
                    const renderedH = LANDSCAPE_HEIGHT * fitScale;

                    // Check if aspect ratios differ enough to show a warning
                    const aspectDiff = Math.abs(printAspect - nativeAspect) / nativeAspect * 100;
                    const isNative = aspectDiff < 1; // < 1% difference = essentially the same

                    // Collect photos for preview
                    let allPhotoUris: (string | null | undefined)[] = [];
                    if (designData.photoUris && designData.photoUris.length > 0) {
                        allPhotoUris = designData.photoUris.filter((uri: any) => uri);
                    } else if (designData.babies) {
                        allPhotoUris = designData.babies.filter((b: any) => b.photoUri).map((b: any) => b.photoUri);
                    }

                    // Build babies array for TimeCapsule
                    const tcBabies = designData.babies || [{
                        first: designData.babyFirst || '',
                        middle: designData.babyMiddle || '',
                        last: designData.babyLast || '',
                        photoUri: designData.photoUri || null,
                    }];
                    const dobISO = designData.dobISO || new Date().toISOString().split('T')[0];
                    const zodiac = getZodiacFromISO(dobISO);
                    const birthstone = birthstoneFromISO(dobISO);
                    const lifePathResult = calculateLifePath(dobISO);

                    return (
                        <View style={styles.previewSection}>
                            <Text style={styles.previewSectionTitle}>
                                {'\uD83D\uDD0D'} Size Preview {'\u2014'} {SIZES.find(s => s.id === selectedSize)!.name}
                            </Text>
                            <Text style={styles.previewSectionSubtitle}>
                                See exactly how your design fits this print size
                            </Text>

                            {/* Tab switcher */}
                            <View style={styles.previewTabs}>
                                <TouchableOpacity
                                    style={[styles.previewTab, previewTab === 'front' && styles.previewTabActive]}
                                    onPress={() => setPreviewTab('front')}
                                >
                                    <Text style={[styles.previewTabText, previewTab === 'front' && styles.previewTabTextActive]}>
                                        {'\uD83C\uDFE0'} Sign Front
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.previewTab, previewTab === 'back' && styles.previewTabActive]}
                                    onPress={() => setPreviewTab('back')}
                                >
                                    <Text style={[styles.previewTabText, previewTab === 'back' && styles.previewTabTextActive]}>
                                        {'\u23F3'} Time Capsule
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Aspect ratio info badge */}
                            {isNative ? (
                                <View style={styles.previewBadgeGood}>
                                    <Text style={styles.previewBadgeGoodText}>
                                        {'\u2705'} Native ratio {'\u2014'} this is the exact aspect ratio the design was built for. Perfect fit.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.previewBadgeWarn}>
                                    <Text style={styles.previewBadgeWarnText}>
                                        {'\u26A0\uFE0F'} Aspect ratio differs by {aspectDiff.toFixed(1)}% from native 11{'\u00D7'}8.5. The grey area shows unused print space.
                                    </Text>
                                </View>
                            )}

                            {/* Preview container: sized to match print proportions */}
                            <View style={[
                                styles.previewContainer,
                                { width: containerW, height: containerH }
                            ]}>
                                {/* Centered component at the correct scale */}
                                <View style={{
                                    width: renderedW,
                                    height: renderedH,
                                    overflow: 'hidden',
                                }}>
                                    {previewTab === 'front' ? (
                                        <SignFrontLandscape
                                            theme={designData.theme || 'green'}
                                            photoUris={allPhotoUris}
                                            previewScale={fitScale}
                                            hometown={designData.hometown}
                                            population={designData.population ?? undefined}
                                            personName={designData.personName || babyNames}
                                            babyCount={babyCount}
                                            dobISO={dobISO}
                                        />
                                    ) : (
                                        <TimeCapsuleLandscape
                                            theme={designData.theme || 'green'}
                                            babies={tcBabies}
                                            dobISO={dobISO}
                                            motherName={designData.motherName || ''}
                                            fatherName={designData.fatherName || ''}
                                            weightLb={designData.weightLb || ''}
                                            weightOz={designData.weightOz || ''}
                                            lengthIn={designData.lengthIn || ''}
                                            hometown={designData.hometown || ''}
                                            snapshot={designData.snapshot || {}}
                                            zodiac={zodiac}
                                            birthstone={birthstone}
                                            lifePathNumber={lifePathResult.number}
                                            previewScale={fitScale}
                                            mode={designData.mode || 'baby'}
                                            message={designData.message || ''}
                                        />
                                    )}
                                </View>
                            </View>

                            <Text style={styles.previewDimsLabel}>
                                Print: {dims.w}{'\u2033'} {'\u00D7'} {dims.h}{'\u2033'} {'  '}|{'  '}Design: 11{'\u2033'} {'\u00D7'} 8.5{'\u2033'}
                            </Text>
                        </View>
                    );
                })()}

                <Text style={styles.sectionTitle}>{'\uD83C\uDFA8'} Choose Material</Text>
                {MATERIALS.map(mat => (
                    <TouchableOpacity
                        key={mat.id}
                        style={[styles.materialCard, selectedMaterial === mat.id && styles.materialCardActive]}
                        onPress={() => setSelectedMaterial(mat.id)}
                    >
                        <View style={styles.materialHeader}>
                            <Text style={styles.materialEmoji}>{mat.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.materialName, selectedMaterial === mat.id && styles.materialNameActive]}>
                                    {mat.name}
                                </Text>
                                <Text style={[styles.materialDesc, selectedMaterial === mat.id && styles.materialDescActive]}>
                                    {mat.description}
                                </Text>
                            </View>
                            {selectedSize && (
                                <Text style={[styles.materialPrice, selectedMaterial === mat.id && styles.materialPriceActive]}>
                                    {formatPrice(calculatePackagePrice(selectedSize, mat.id, includeLetter))}
                                </Text>
                            )}
                        </View>
                        {selectedMaterial === mat.id && (
                            <View style={styles.selectedIndicator}>
                                <Text style={styles.selectedIndicatorText}>{'\u2713'} Selected</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {selectedSize && selectedMaterial && (
                    <View style={styles.subtotalBar}>
                        <Text style={styles.subtotalLabel}>
                            Package ({includeLetter ? '5' : '4'} sheets):
                        </Text>
                        <Text style={styles.subtotalPrice}>{formatPrice(packagePrice)}</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>{'\uD83C\uDF81'} Add-Ons (Optional)</Text>
                <Text style={styles.sectionSubtitle}>Enhance your order with these extras</Text>

                {effectiveAddOns.map(addOn => (
                    <View key={addOn.id} style={styles.addOnCard}>
                        <View style={styles.addOnHeader}>
                            <Text style={styles.addOnEmoji}>{addOn.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addOnName}>{addOn.name}</Text>
                                <Text style={styles.addOnDesc}>{addOn.description}</Text>
                                <Text style={styles.addOnMaterial}>Material: {addOn.material}</Text>
                            </View>
                        </View>
                        <View style={styles.addOnOptions}>
                            {addOn.options.map((opt, idx) => {
                                const isSelected = selectedAddOns[addOn.id] === idx;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.addOnOption, isSelected && styles.addOnOptionActive]}
                                        onPress={() => toggleAddOn(addOn.id, idx)}
                                    >
                                        <Text style={[styles.addOnOptionLabel, isSelected && styles.addOnOptionLabelActive]}>
                                            {isSelected ? '\u2713 ' : ''}{opt.label}
                                        </Text>
                                        <Text style={[styles.addOnOptionPrice, isSelected && styles.addOnOptionPriceActive]}>
                                            {formatPrice(opt.price)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

                <View style={styles.giftBanner}>
                    <Text style={styles.giftBannerEmoji}>{'\uD83C\uDF81'}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.giftBannerTitle}>Send as a Gift?</Text>
                        <Text style={styles.giftBannerDesc}>
                            Email the signs + a gift card to a friend or family member
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.giftBannerBtn}
                        onPress={() => navigation.navigate('SendAsGift', designData as any)}
                    >
                        <Text style={styles.giftBannerBtnText}>Gift {'\u2192'}</Text>
                    </TouchableOpacity>
                </View>

                {selectedSize && selectedMaterial && (
                    <View style={styles.orderSummary}>
                        <Text style={styles.orderSummaryTitle}>Order Summary</Text>

                        <View style={styles.orderLine}>
                            <Text style={styles.orderLineLabel}>
                                {includeLetter ? '5' : '4'}-Sheet Package ({SIZES.find(s => s.id === selectedSize)!.name}, {MATERIALS.find(m => m.id === selectedMaterial)!.name})
                            </Text>
                            <Text style={styles.orderLinePrice}>{formatPrice(packagePrice)}</Text>
                        </View>

                        {Object.entries(selectedAddOns).map(([addOnId, optionIndex]) => {
                            if (optionIndex < 0) return null;
                            const addOn = effectiveAddOns.find(a => a.id === addOnId)!;
                            const opt = addOn.options[optionIndex];
                            return (
                                <View key={addOnId} style={styles.orderLine}>
                                    <Text style={styles.orderLineLabel}>{addOn.emoji} {opt.label}</Text>
                                    <Text style={styles.orderLinePrice}>{formatPrice(opt.price)}</Text>
                                </View>
                            );
                        })}

                        <View style={styles.orderDivider} />

                        <View style={styles.orderLine}>
                            <Text style={styles.orderTotalLabel}>Subtotal</Text>
                            <Text style={styles.orderTotalPrice}>{formatPrice(orderTotal)}</Text>
                        </View>
                        <Text style={styles.shippingNote}>+ Shipping calculated at checkout</Text>

                        <TouchableOpacity style={styles.checkoutBtn} onPress={handleAddToCart}>
                            <Text style={styles.checkoutBtnText}>Add to Cart {'\u2014'} {formatPrice(orderTotal)}</Text>
                        </TouchableOpacity>

                        <Text style={styles.printDisclaimer}>
                            {'\uD83D\uDDA8\uFE0F'} Professionally printed on commercial-grade equipment by our print partner.{'\n'}
                            Every order is quality-inspected before shipping.{'\n'}
                            Turnaround: 2{'-'}5 business days + shipping.
                        </Text>

                        <View style={styles.qualityPromise}>
                            <Text style={styles.qualityPromiseTitle}>{'\uD83C\uDF1F'} Our Quality Promise</Text>
                            <Text style={styles.qualityPromiseText}>
                                These aren{"'"}t flimsy paper printouts from a home printer. Every sign, card, and postcard is produced on thick, professional-grade materials with rich, true-to-life colors that won{"'"}t fade, crack, or peel. Frame them, display them, hand them out {"\u2014"} they{"'"}re built to be treasured for years and decades to come.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backBtn: { padding: 8 },
    backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '800' },
    content: { flex: 1 },
    summaryBanner: {
        backgroundColor: '#1a1a2e',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    summaryTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    summaryDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
    verifyNote: {
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    verifyNoteText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a2e',
        marginTop: 28,
        marginBottom: 4,
        marginHorizontal: 20,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 20,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    checkEmoji: { fontSize: 18, marginRight: 12, width: 28 },
    checkLabel: { fontSize: 16, fontWeight: '600', color: '#2d3748' },
    checkLabelDim: { color: '#a0aec0' },
    orientationLabel: { fontSize: 11, color: '#a0aec0', marginTop: 2 },
    optionalBadge: {
        fontSize: 11,
        color: '#667eea',
        fontWeight: '600',
        backgroundColor: '#ebf4ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginHorizontal: 16,
    },
    sizeTag: {
        position: 'absolute',
        top: -1,
        right: -1,
        backgroundColor: '#667eea',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 8,
    },
    sizeTagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    optionRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
    },
    optionBtn: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        overflow: 'hidden',
    },
    optionBtnActive: {
        borderColor: '#667eea',
        backgroundColor: '#f0f4ff',
    },
    optionBtnTitle: { fontSize: 17, fontWeight: '700', color: '#2d3748' },
    optionBtnTitleActive: { color: '#667eea' },
    optionBtnDesc: { fontSize: 12, color: '#718096', marginTop: 4, textAlign: 'center' },
    optionBtnDescActive: { color: '#667eea' },
    materialCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 14,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    materialCardActive: {
        borderColor: '#667eea',
        backgroundColor: '#f0f4ff',
    },
    materialHeader: { flexDirection: 'row', alignItems: 'center' },
    materialEmoji: { fontSize: 28, marginRight: 14 },
    materialName: { fontSize: 16, fontWeight: '700', color: '#2d3748' },
    materialNameActive: { color: '#667eea' },
    materialDesc: { fontSize: 13, color: '#718096', marginTop: 2 },
    materialDescActive: { color: '#4c63b6' },
    materialPrice: { fontSize: 18, fontWeight: '800', color: '#2d3748', marginLeft: 8 },
    materialPriceActive: { color: '#667eea' },
    selectedIndicator: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#667eea',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    selectedIndicatorText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    subtotalBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#e8ecf4',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    subtotalLabel: { fontSize: 16, fontWeight: '600', color: '#2d3748' },
    subtotalPrice: { fontSize: 20, fontWeight: '800', color: '#667eea' },
    addOnCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 14,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    addOnHeader: { flexDirection: 'row', marginBottom: 12 },
    addOnEmoji: { fontSize: 32, marginRight: 14 },
    addOnName: { fontSize: 17, fontWeight: '700', color: '#2d3748' },
    addOnDesc: { fontSize: 13, color: '#718096', marginTop: 3, lineHeight: 18 },
    addOnMaterial: { fontSize: 12, color: '#667eea', fontWeight: '600', marginTop: 4 },
    addOnOptions: { gap: 8 },
    addOnOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: '#f7fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    addOnOptionActive: {
        backgroundColor: '#ebf4ff',
        borderColor: '#667eea',
    },
    addOnOptionLabel: { fontSize: 15, fontWeight: '600', color: '#4a5568' },
    addOnOptionLabelActive: { color: '#667eea' },
    addOnOptionPrice: { fontSize: 15, fontWeight: '700', color: '#4a5568' },
    addOnOptionPriceActive: { color: '#667eea' },
    giftBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff7ed',
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#fed7aa',
    },
    giftBannerEmoji: { fontSize: 36, marginRight: 14 },
    giftBannerTitle: { fontSize: 17, fontWeight: '700', color: '#9a3412' },
    giftBannerDesc: { fontSize: 13, color: '#c2410c', marginTop: 2, lineHeight: 18 },
    giftBannerBtn: {
        backgroundColor: '#ea580c',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginLeft: 8,
    },
    giftBannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    orderSummary: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
    orderSummaryTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
    orderLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    orderLineLabel: { fontSize: 14, color: '#4a5568', flex: 1, marginRight: 8 },
    orderLinePrice: { fontSize: 15, fontWeight: '700', color: '#2d3748' },
    orderDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
    orderTotalLabel: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
    orderTotalPrice: { fontSize: 22, fontWeight: '900', color: '#667eea' },
    shippingNote: { fontSize: 13, color: '#718096', marginTop: 4 },
    checkoutBtn: {
        backgroundColor: '#667eea',
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
    },
    checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    printDisclaimer: {
        fontSize: 12,
        color: '#a0aec0',
        textAlign: 'center',
        marginTop: 14,
        lineHeight: 18,
    },
    qualityBanner: {
        backgroundColor: '#f0fdf4',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 14,
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#bbf7d0',
    },
    qualityBannerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#166534',
        marginBottom: 8,
    },
    qualityBannerText: {
        fontSize: 14,
        color: '#15803d',
        lineHeight: 21,
    },
    qualityBadges: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 14,
    },
    qualityBadge: {
        alignItems: 'center',
    },
    qualityBadgeEmoji: {
        fontSize: 22,
    },
    qualityBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#166534',
        marginTop: 4,
    },
    qualityPromise: {
        backgroundColor: '#fffbeb',
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    qualityPromiseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#92400e',
        marginBottom: 6,
    },
    qualityPromiseText: {
        fontSize: 13,
        color: '#78350f',
        lineHeight: 20,
    },
    previewSection: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
    },
    previewSectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    previewSectionSubtitle: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 12,
    },
    previewTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    previewTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
    },
    previewTabActive: {
        backgroundColor: '#667eea',
    },
    previewTabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4a5568',
    },
    previewTabTextActive: {
        color: '#fff',
    },
    previewBadgeGood: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    previewBadgeGoodText: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '600',
        lineHeight: 17,
    },
    previewBadgeWarn: {
        backgroundColor: '#fffbeb',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    previewBadgeWarnText: {
        fontSize: 12,
        color: '#92400e',
        fontWeight: '600',
        lineHeight: 17,
    },
    previewContainer: {
        backgroundColor: '#d1d5db',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#9ca3af',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
    },
    previewDimsLabel: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '600',
    },
});
