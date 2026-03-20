import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { COLOR_SCHEMES } from '../data/utils/colors';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import type { RootStackParamList, ThemeName } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SampleGallery'>;

export default function SampleGallery({ navigation }: Props) {
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>('green');
    const [productIdx, setProductIdx] = useState(0);
    const [sampleIdx, setSampleIdx] = useState(0);
    const productListRef = useRef<FlatList>(null);

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const previewScale = Math.min(screenWidth / 3300, screenHeight / 2550) * 0.8;

    // ── Product types ──
    const PRODUCTS = [
        { key: 'sign', label: '+1 Sign', emoji: '📋' },
        { key: 'timecapsule', label: 'Time Capsule', emoji: '⏰' },
        { key: 'baseball', label: 'Baseball Card', emoji: '⚾' },
        { key: 'baseballBack', label: 'Card Back', emoji: '🔄' },
        { key: 'postcard', label: 'Postcard', emoji: '💌' },
        { key: 'yardsign', label: 'Yard Sign', emoji: '🏡' },
        { key: 'letter', label: 'Letter to Baby', emoji: '✉️' },
        { key: 'natal', label: 'Natal Chart', emoji: '🔮' },
    ] as const;

    // ── Sample baby datasets ──
    const SAMPLES = [
        {
            label: 'Emma',
            baby: { first: 'Emma', middle: 'Grace', last: 'Johnson' },
            dobISO: '2024-12-25',
            motherName: 'Sarah Johnson', fatherName: 'Michael Johnson',
            weightLb: '7', weightOz: '8', lengthIn: '20',
            hometown: 'Austin, Texas', city: 'Austin', state: 'Texas',
            population: 978908,
            zodiac: 'Capricorn', birthstone: 'Turquoise',
            theme: 'green' as ThemeName,
            motherLetter: 'Dear Emma, from the moment I first held you, the whole world changed. You are our greatest adventure and our sweetest dream come true. I promise to always be your biggest fan. Love, Mom',
            fatherLetter: 'Dear Emma, you are the best Christmas gift we ever received. I can\'t wait to show you the stars, teach you to ride a bike, and watch you become the incredible person you\'re meant to be. Love, Dad',
            snapshot: {
                'GALLON OF GASOLINE': '$3.21', 'LOAF OF BREAD': '$2.99', 'DOZEN EGGS': '$4.50',
                'GALLON OF MILK': '$3.79', 'GOLD OZ': '$2,738', 'SILVER OZ': '$31.45',
                'DOW JONES CLOSE': '43,729.93', 'US POPULATION': '341,814,420',
                'WORLD POPULATION': '8,118,835,999', 'PRESIDENT': 'Joe Biden',
                'VICE PRESIDENT': 'Kamala Harris', '#1 SONG': 'Sabrina Carpenter - Espresso',
                'WON LAST SUPERBOWL': 'Kansas City Chiefs', 'WON LAST WORLD SERIES': 'Los Angeles Dodgers',
            },
        },
        {
            label: 'Liam',
            baby: { first: 'Liam', middle: 'Alexander', last: 'Rivera' },
            dobISO: '2025-07-04',
            motherName: 'Isabella Rivera', fatherName: 'Carlos Rivera',
            weightLb: '8', weightOz: '2', lengthIn: '21',
            hometown: 'Miami, Florida', city: 'Miami', state: 'Florida',
            population: 449514,
            zodiac: 'Cancer', birthstone: 'Ruby',
            theme: 'royalBlue' as ThemeName,
            motherLetter: 'Dear Liam, you arrived with fireworks — literally on the 4th of July! You are our little firecracker, full of energy and light. We love you to the moon and back. Love, Mom',
            fatherLetter: 'Dear Liam, mi hijo, you carry the strength of two cultures and the love of a family that spans continents. Your story is just beginning, and it\'s already beautiful. Love, Dad',
            snapshot: {
                'GALLON OF GASOLINE': '$3.45', 'LOAF OF BREAD': '$3.15', 'DOZEN EGGS': '$4.89',
                'GALLON OF MILK': '$3.99', 'GOLD OZ': '$2,890', 'SILVER OZ': '$33.20',
                'DOW JONES CLOSE': '45,210.77', 'US POPULATION': '342,100,000',
                'WORLD POPULATION': '8,150,000,000', 'PRESIDENT': 'Donald Trump',
                'VICE PRESIDENT': 'JD Vance', '#1 SONG': 'Kendrick Lamar - Not Like Us',
                'WON LAST SUPERBOWL': 'Philadelphia Eagles', 'WON LAST WORLD SERIES': 'Los Angeles Dodgers',
            },
        },
        {
            label: 'Ava & Noah',
            baby: { first: 'Ava', middle: 'Rose & Noah James', last: 'Chen' },
            dobISO: '2025-03-15',
            motherName: 'Mei Chen', fatherName: 'David Chen',
            weightLb: '5', weightOz: '12', lengthIn: '18',
            hometown: 'San Francisco, California', city: 'San Francisco', state: 'California',
            population: 808437,
            zodiac: 'Pisces', birthstone: 'Aquamarine',
            theme: 'lavender' as ThemeName,
            motherLetter: 'Dear Ava & Noah, two hearts beating as one — you completed our family in the most magical way. Watching you grow together will be the joy of our lives. Love, Mom',
            fatherLetter: 'Dear Ava & Noah, twins! Double the love, double the adventure. I promise to teach you both that the world is full of wonder, and you\'ll always have each other. Love, Dad',
            snapshot: {
                'GALLON OF GASOLINE': '$3.35', 'LOAF OF BREAD': '$3.05', 'DOZEN EGGS': '$4.65',
                'GALLON OF MILK': '$3.89', 'GOLD OZ': '$2,810', 'SILVER OZ': '$32.10',
                'DOW JONES CLOSE': '44,850.33', 'US POPULATION': '341,950,000',
                'WORLD POPULATION': '8,140,000,000', 'PRESIDENT': 'Donald Trump',
                'VICE PRESIDENT': 'JD Vance', '#1 SONG': 'Lady Gaga - Die With A Smile',
                'WON LAST SUPERBOWL': 'Philadelphia Eagles', 'WON LAST WORLD SERIES': 'Los Angeles Dodgers',
            },
        },
        {
            label: 'Elijah',
            baby: { first: 'Elijah', middle: 'James', last: 'Washington' },
            dobISO: '2025-10-31',
            motherName: 'Jasmine Washington', fatherName: 'Marcus Washington',
            weightLb: '9', weightOz: '1', lengthIn: '22',
            hometown: 'Atlanta, Georgia', city: 'Atlanta', state: 'Georgia',
            population: 499127,
            zodiac: 'Scorpio', birthstone: 'Opal',
            theme: 'maroon' as ThemeName,
            motherLetter: 'Dear Elijah, you chose Halloween to make your grand entrance — already full of surprises! You are our little king, and this world is lucky to have you. Love, Mom',
            fatherLetter: 'Dear Elijah, son, you carry a name that means strength. I\'ll spend my life making sure you know just how powerful you are. Dream big, little man. Love, Dad',
            snapshot: {
                'GALLON OF GASOLINE': '$3.55', 'LOAF OF BREAD': '$3.25', 'DOZEN EGGS': '$5.10',
                'GALLON OF MILK': '$4.15', 'GOLD OZ': '$2,950', 'SILVER OZ': '$34.80',
                'DOW JONES CLOSE': '46,100.55', 'US POPULATION': '342,500,000',
                'WORLD POPULATION': '8,175,000,000', 'PRESIDENT': 'Donald Trump',
                'VICE PRESIDENT': 'JD Vance', '#1 SONG': 'Bruno Mars - APT.',
                'WON LAST SUPERBOWL': 'Philadelphia Eagles', 'WON LAST WORLD SERIES': 'Los Angeles Dodgers',
            },
        },
    ];

    const sample = SAMPLES[sampleIdx];
    const lifePathResult = calculateLifePath(sample.dobISO);
    const lifePathNumber = lifePathResult.number;
    const fullName = `${sample.baby.first} ${sample.baby.middle} ${sample.baby.last}`;
    const product = PRODUCTS[productIdx];

    // ── Render the selected product ──
    const renderProduct = () => {
        switch (product.key) {
            case 'sign':
                return (
                    <SignFrontLandscape
                        theme={selectedTheme} photoUris={[]} hometown={sample.hometown}
                        population={sample.population} personName={fullName} previewScale={previewScale}
                    />
                );
            case 'timecapsule':
                return (
                    <TimeCapsuleLandscape
                        theme={selectedTheme} babies={[sample.baby]} dobISO={sample.dobISO}
                        motherName={sample.motherName} fatherName={sample.fatherName}
                        weightLb={sample.weightLb} weightOz={sample.weightOz} lengthIn={sample.lengthIn}
                        hometown={sample.hometown} snapshot={sample.snapshot}
                        zodiac={sample.zodiac} birthstone={sample.birthstone}
                        lifePathNumber={lifePathNumber} previewScale={previewScale}
                    />
                );
            case 'baseball':
                return (
                    <BaseballCard
                        babyName={fullName} birthDate={sample.dobISO} weight={`${sample.weightLb} lbs ${sample.weightOz} oz`}
                        length={`${sample.lengthIn} in`} city={sample.city} state={sample.state}
                        zodiacSign={sample.zodiac} birthstone={sample.birthstone}
                        lifePathNumber={String(lifePathNumber)} backgroundColor={COLOR_SCHEMES[selectedTheme].bg}
                    />
                );
            case 'baseballBack':
                return (
                    <BaseballCardBack
                        fullName={fullName} lastName={sample.baby.last} dobISO={sample.dobISO}
                        weightLb={sample.weightLb} weightOz={sample.weightOz} lengthIn={sample.lengthIn}
                        hometown={sample.hometown} backgroundColor={COLOR_SCHEMES[selectedTheme].bg}
                    />
                );
            case 'postcard':
                return (
                    <PostcardSign
                        babyName={fullName} birthDate={sample.dobISO} city={sample.city} state={sample.state}
                        weight={`${sample.weightLb} lbs ${sample.weightOz} oz`} length={`${sample.lengthIn} in`}
                        parents={`${sample.motherName} & ${sample.fatherName}`}
                        backgroundColor={COLOR_SCHEMES[selectedTheme].bg}
                        message="Welcome to the world, little one! You are so loved."
                    />
                );
            case 'yardsign':
                return (
                    <YardSign
                        babyName={fullName} city={sample.city} state={sample.state}
                        birthDate={sample.dobISO} weight={`${sample.weightLb} lbs ${sample.weightOz} oz`}
                        length={`${sample.lengthIn} in`} population={String(sample.population)}
                        backgroundColor={COLOR_SCHEMES[selectedTheme].bg}
                    />
                );
            case 'letter':
                return (
                    <LetterToBaby
                        theme={selectedTheme} previewScale={previewScale} babyName={sample.baby.first}
                        dobISO={sample.dobISO} motherName={sample.motherName} fatherName={sample.fatherName}
                        motherLetter={sample.motherLetter} fatherLetter={sample.fatherLetter}
                    />
                );
            case 'natal':
                return (
                    <NatalChartPrintable
                        theme={selectedTheme} babyName={fullName} dobISO={sample.dobISO}
                        hometown={sample.hometown} previewScale={previewScale}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sample Gallery</Text>
                <Text style={styles.subtitle}>See what your announcements look like</Text>
            </View>

            {/* ── Sample Baby Selector ── */}
            <View style={styles.sampleRow}>
                {SAMPLES.map((s, i) => (
                    <TouchableOpacity key={s.label} onPress={() => { setSampleIdx(i); setSelectedTheme(s.theme); }}
                        style={[styles.sampleBtn, i === sampleIdx && styles.sampleBtnActive]}>
                        <Text style={[styles.sampleBtnText, i === sampleIdx && styles.sampleBtnTextActive]}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Product Type Tabs ── */}
            <FlatList
                ref={productListRef}
                horizontal showsHorizontalScrollIndicator={false}
                data={PRODUCTS}
                keyExtractor={(item) => item.key}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                style={{ marginBottom: 12 }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => setProductIdx(index)}
                        style={[styles.productTab, index === productIdx && styles.productTabActive]}>
                        <Text style={styles.productTabEmoji}>{item.emoji}</Text>
                        <Text style={[styles.productTabLabel, index === productIdx && styles.productTabLabelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* ── Theme Colors ── */}
            <View style={styles.controls}>
                <Text style={styles.colorLabel}>Theme Color</Text>
                <View style={{ alignSelf: 'center', width: '50%' }}>
                    {[
                        ['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'],
                        ['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'],
                        ['lavender', 'hotPink', 'rose', 'purple', 'violet'],
                        ['coral', 'red', 'maroon', 'orange', 'gold'],
                        ['charcoal', 'slate', 'gray', 'silver', 'lightGray'],
                    ].map((row, ri) => (
                        <View key={ri} style={{ flexDirection: 'row', gap: 2, marginBottom: 2 }}>
                            {row.map(t => (
                                <TouchableOpacity key={t} onPress={() => setSelectedTheme(t as ThemeName)}
                                    style={[styles.colorBox, {
                                        backgroundColor: COLOR_SCHEMES[t as keyof typeof COLOR_SCHEMES].bg,
                                        borderColor: selectedTheme === t ? '#fff' : 'rgba(255,255,255,0.3)',
                                        borderWidth: selectedTheme === t ? 2.5 : 1,
                                    }]} />
                            ))}
                        </View>
                    ))}
                </View>
            </View>

            {/* ── Preview ── */}
            <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>{product.emoji} {product.label} — {sample.label}</Text>
                <View style={styles.previewContainer}>
                    {renderProduct()}
                </View>
            </View>

            {/* ── Info Section ── */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>What You Get:</Text>
                {[
                    { e: '📋', t: 'Birth announcement sign — beautiful landscape 11" × 8.5"' },
                    { e: '⏰', t: 'Time capsule — snapshot of the world on birth date' },
                    { e: '⚾', t: 'Baseball trading card — front & back with stats' },
                    { e: '💌', t: 'Postcard announcement — share with family & friends' },
                    { e: '🏡', t: 'Yard sign — proudly announce your +1 to the neighborhood' },
                    { e: '✉️', t: 'Letter to baby — heartfelt keepsake from Mom & Dad' },
                    { e: '🔮', t: 'Natal chart — astrology birth chart with zodiac details' },
                    { e: '🎨', t: '25 color themes to match your nursery or style' },
                    { e: '🖨️', t: 'Print-ready files for professional printing' },
                ].map(item => (
                    <View key={item.e + item.t} style={styles.infoItem}>
                        <Text style={styles.infoBullet}>{item.e}</Text>
                        <Text style={styles.infoText}>{item.t}</Text>
                    </View>
                ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Form')}>
                <Text style={styles.ctaButtonText}>CREATE YOUR ANNOUNCEMENT</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e' },
    header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
    subtitle: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },

    // Sample baby selector
    sampleRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 16 },
    sampleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    sampleBtnActive: { backgroundColor: '#FFD54F', borderColor: '#FFD54F' },
    sampleBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    sampleBtnTextActive: { color: '#1a1a2e' },

    // Product tabs
    productTab: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minWidth: 80 },
    productTabActive: { backgroundColor: 'rgba(255,213,79,0.2)', borderColor: '#FFD54F' },
    productTabEmoji: { fontSize: 20, marginBottom: 2 },
    productTabLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
    productTabLabelActive: { color: '#FFD54F' },

    // Theme colors
    controls: { paddingHorizontal: 20, paddingBottom: 12 },
    colorLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 8, textAlign: 'center' },
    colorBox: { flex: 1, aspectRatio: 1, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },

    // Preview
    previewSection: { paddingHorizontal: 12, paddingBottom: 16 },
    previewLabel: { fontSize: 14, fontWeight: '800', color: '#FFD54F', textAlign: 'center', marginBottom: 8 },
    previewContainer: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 20, alignItems: 'center', minHeight: 350, justifyContent: 'center' },

    // Info
    infoSection: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 16, borderRadius: 16, marginBottom: 16 },
    infoTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 14 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    infoBullet: { fontSize: 20 },
    infoText: { flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', lineHeight: 20 },

    // CTA
    ctaButton: { marginHorizontal: 16, marginVertical: 10, backgroundColor: '#FFD54F', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    ctaButtonText: { color: '#1a1a2e', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
    backButton: { marginHorizontal: 16, marginVertical: 8, marginBottom: 40, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
    backButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
