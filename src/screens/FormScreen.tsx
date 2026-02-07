import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    useWindowDimensions, Image, Alert, Platform, Modal, Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, ThemeName } from '../types';
import { COLOR_SCHEMES } from "../data/utils/colors";
import { getAllSnapshotValues } from '../data/utils/snapshot';
import { getPopulationForCity } from '../data/utils/populations';
import { getSnapshotWithHistorical } from '../data/utils/historical-snapshot';

type Props = NativeStackScreenProps<RootStackParamList, "Form">;

// Animated Color Box with cascading glow effect
const AnimatedColorBox = ({
    themeName,
    isSelected,
    onPress,
    delay,
    glowAnim
}: {
    themeName: ThemeName;
    isSelected: boolean;
    onPress: () => void;
    delay: number;
    glowAnim: Animated.Value;
}) => {
    const bgColor = COLOR_SCHEMES[themeName].bg;

    // Create interpolated glow based on delay offset
    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 1, 0.3],
    });

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.15, 1],
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Animated.View
                style={[
                    {
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: bgColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
                        transform: [{ scale: glowScale }],
                        shadowColor: bgColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: glowOpacity as any,
                        shadowRadius: 8,
                        elevation: 8,
                    }
                ]}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function FormScreen({ navigation, route }: Props) {
    const [theme, setTheme] = useState<ThemeName>("green");
    const [mode, setMode] = useState<'baby' | 'birthday'>('baby'); // NEW: Mode toggle

    // Cascading glow animation for color palette
    const glowAnims = useRef(
        Array.from({ length: 25 }, () => new Animated.Value(0))
    ).current;

    // Start cascading animation on mount
    useEffect(() => {
        const runCascade = () => {
            // Reset all animations
            glowAnims.forEach(anim => anim.setValue(0));

            // 5x5 grid: column by column, top to bottom
            const animations: Animated.CompositeAnimation[] = [];

            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 5; row++) {
                    const index = row * 5 + col; // Grid index
                    const delay = (col * 5 + row) * 80; // 80ms stagger

                    animations.push(
                        Animated.sequence([
                            Animated.delay(delay),
                            Animated.timing(glowAnims[index], {
                                toValue: 1,
                                duration: 400,
                                useNativeDriver: true,
                            }),
                            Animated.timing(glowAnims[index], {
                                toValue: 0,
                                duration: 400,
                                useNativeDriver: true,
                            }),
                        ])
                    );
                }
            }

            Animated.parallel(animations).start(() => {
                // Repeat after a pause
                setTimeout(runCascade, 2000);
            });
        };

        runCascade();
    }, []);

    // TEST DATA - Prefilled for easy testing
    // 🧪 For testing long names, uncomment these lines:
    // const [babyFirst, setBabyFirst] = useState("Bartholomew Christopher");
    // const [babyLast, setBabyLast] = useState("Montgomery-Williams-Henderson");
    // const [hometown, setHometown] = useState("San Francisco International Airport, California");

    const [babyFirst, setBabyFirst] = useState("Emma");
    const [babyMiddle, setBabyMiddle] = useState("Grace");
    const [babyLast, setBabyLast] = useState("Johnson");
    const [babies, setBabies] = useState<Array<{ first: string; middle?: string; last?: string; photoUri?: string | null }>>([
        {
            first: 'Emma',
            middle: 'Grace',
            last: 'Johnson',
            photoUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face' // Test photo for Twin 1
        },
        {
            first: 'Ethan',
            middle: 'James',
            last: 'Johnson',
            photoUri: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=face' // Test photo for Twin 2
        },
    ]);
    const [babyCount, setBabyCount] = useState<number>(1); // Default to single baby
    const [showBabyCountModal, setShowBabyCountModal] = useState(false);
    const [motherName, setMotherName] = useState("Sarah Johnson");
    const [fatherName, setFatherName] = useState("Michael Johnson");
    const [email, setEmail] = useState("sarah.johnson@email.com"); // For marketing
    const [hometown, setHometown] = useState("Bellefontaine Neighbors, MO");
    const [dobDate, setDobDate] = useState<Date>(new Date()); // Today's date
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weightLb, setWeightLb] = useState("7");
    const [weightOz, setWeightOz] = useState("8");
    const [lengthIn, setLengthIn] = useState("20");
    const [photoUri, setPhotoUri] = useState<string | null>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face');

    const [touched, setTouched] = useState({ babyFirst: false, hometown: false });
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const [population, setPopulation] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const { width: screenWidth } = useWindowDimensions();

    const canBuild = (babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0) && hometown.trim().length > 0;

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!hometown.trim() || hometown.length < 3) return;
            try {
                setLoading(true);
                console.log('🏙️  Fetching data for hometown:', hometown, 'birth year:', dobDate.getFullYear());
                console.log('📱 Device info - User Agent:', navigator.userAgent);
                console.log('🌐 Network state:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

                // Fetch snapshot data from Google Sheets with timeout
                console.log('📊 Starting snapshot fetch...');
                const snapshotPromise = getAllSnapshotValues();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout after 15 seconds')), 15000)
                );

                const snapshotData = await Promise.race([snapshotPromise, timeoutPromise]) as Record<string, string>;
                console.log('✅ Snapshot data fetched:', Object.keys(snapshotData).length, 'entries');
                console.log('📊 Sample data:', Object.keys(snapshotData).slice(0, 3));
                setSnapshot(snapshotData);

                // Fetch population for the entered hometown
                console.log('👥 Starting population fetch for:', hometown);
                const cityPopulation = await getPopulationForCity(hometown);
                console.log('✅ Population result:', cityPopulation);
                setPopulation(cityPopulation);
            } catch (error) {
                console.error('❌ MOBILE NETWORK ERROR:', error);
                const err = error as Error;
                console.error('Error type:', err.name || 'Unknown');
                console.error('Error message:', err.message || 'Unknown error');
                console.error('Network online status:', navigator.onLine);

                // Provide fallback data for offline/error scenarios
                console.log('🔄 Using fallback data...');
                setSnapshot({
                    'GALLON OF GASOLINE': '$3.07',
                    'US POPULATION': '342,651,000',
                    'PRESIDENT': 'Historical data temporarily unavailable'
                });
                setPopulation(null);

                // Show user-friendly error if needed
                Alert.alert(
                    'Network Issue',
                    'Having trouble loading latest data. Using cached information. Please check your internet connection.',
                    [{ text: 'OK' }]
                );
            } finally {
                setLoading(false);
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [hometown, dobDate]);

    async function pickPhotoForBaby(index?: number) {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const granted = (perm as any).status === 'granted' || (perm as any).granted === true;
            if (!granted) {
                alert('Permission required to pick a photo. Please enable Photos/Media access in Settings.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, quality: 1,
            });
            const cancelled = (result as any).canceled === true || (result as any).cancelled === true;
            const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri ?? null;
            if (cancelled) return;
            if (!uri) {
                alert('Failed to pick a photo. Please try again.');
                return;
            }
            if (typeof index === 'number') {
                setBabies(bs => {
                    const copy = [...bs];
                    copy[index] = { ...copy[index], photoUri: uri };
                    return copy;
                });
            } else {
                setPhotoUri(uri);
                setBabies(bs => {
                    const copy = [...bs];
                    if (copy.length > 0) copy[copy.length - 1].photoUri = uri;
                    return copy;
                });
            }
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    }

    function removePhotoForBaby(index: number) {
        setBabies(bs => {
            const copy = [...bs];
            copy[index] = { ...copy[index], photoUri: null };
            return copy;
        });
    }

    useEffect(() => {
        setBabies(bs => {
            const copy = [...bs];
            while (copy.length < babyCount) copy.push({ first: '' });
            while (copy.length > babyCount) copy.pop();
            return copy;
        });
    }, [babyCount]);

    async function onBuild() {
        const hasBabyNames = babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0;
        if (!hasBabyNames || !hometown.trim()) {
            setTouched(t => ({ ...t, babyFirst: true, hometown: true }));
            alert("Please complete the required fields: Baby first name and Hometown.");
            return;
        }
        let finalPopulation = population;
        if (!finalPopulation) {
            try {
                setLoading(true);
                finalPopulation = await getPopulationForCity(hometown.trim());
                setPopulation(finalPopulation);
                if (!finalPopulation) finalPopulation = 100000;
            } catch (error) {
                finalPopulation = 100000;
            } finally {
                setLoading(false);
            }
        }
        const meaningfulBabies = babies.filter(b => (b.first || '').trim().length > 0);
        const payload: any = {
            theme,
            motherName: motherName.trim(),
            fatherName: fatherName.trim(),
            email: email.trim(),
            hometown: hometown.trim(),
            dobISO: `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`,
            // Only include weight/length for single babies
            weightLb: babyCount === 1 ? weightLb.trim() : '',
            weightOz: babyCount === 1 ? weightOz.trim() : '',
            lengthIn: babyCount === 1 ? lengthIn.trim() : '',
        };
        if (meaningfulBabies.length > 0) {
            payload.babies = meaningfulBabies.map(b => ({
                first: (b.first || '').trim(),
                middle: (b.middle || '').trim(),
                last: (b.last || '').trim(),
                photoUri: b.photoUri ?? null
            }));
        } else {
            payload.babyFirst = babyFirst.trim();
            payload.babyMiddle = babyMiddle.trim();
            payload.babyLast = babyLast.trim();
            payload.photoUri = photoUri;
        }
        payload.frontOrientation = 'landscape';
        payload.timeCapsuleOrientation = 'landscape';
        payload.snapshot = snapshot;
        payload.population = finalPopulation;
        navigation.navigate('Preview', payload);
    }

    const C = COLOR_SCHEMES[theme as keyof typeof COLOR_SCHEMES];

    return (
        <ScrollView style={[styles.page, { backgroundColor: '#f5f5f5' }]} contentContainerStyle={styles.container}>

            <Text style={styles.h1}>{mode === 'baby' ? 'Please choose Single, Twins or Triplets' : 'How many people?'}</Text>
            <TouchableOpacity
                onPress={() => setShowBabyCountModal(true)}
                style={[styles.input, { backgroundColor: '#FFFFFF', justifyContent: 'center', marginBottom: 8 }]}
            >
                <Text style={{ color: '#0a0a0a', fontSize: 14 }}>
                    {mode === 'baby'
                        ? (babyCount === 1 ? 'Single' : babyCount === 2 ? 'Twins' : 'Triplets')
                        : (babyCount === 1 ? 'One' : babyCount === 2 ? 'Two' : 'Three')
                    }
                </Text>
            </TouchableOpacity>

            <Modal visible={showBabyCountModal} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
                            {mode === 'baby' ? 'Select Number of Babies' : 'Select Number of People'}
                        </Text>
                        {[1, 2, 3].map(n => (
                            <TouchableOpacity
                                key={n}
                                onPress={() => { setBabyCount(n); setShowBabyCountModal(false); }}
                                style={{ paddingVertical: 12, borderBottomWidth: n < 3 ? 1 : 0, borderBottomColor: '#eee' }}
                            >
                                <Text style={{ fontSize: 16, textAlign: 'center', color: babyCount === n ? '#007AFF' : '#333' }}>
                                    {mode === 'baby'
                                        ? (n === 1 ? 'Single' : n === 2 ? 'Twins' : 'Triplets')
                                        : (n === 1 ? 'One' : n === 2 ? 'Two' : 'Three')
                                    }
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setShowBabyCountModal(false)} style={{ marginTop: 16, paddingVertical: 10 }}>
                            <Text style={{ textAlign: 'center', color: '#999' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {babies.map((b, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                    {babyCount > 1 && (
                        <Text style={[styles.h1, { fontSize: 14, marginBottom: 4 }]}>
                            {mode === 'baby' ? `Baby ${idx + 1}` : `Person ${idx + 1}`}
                        </Text>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.h1, { fontSize: 12 }]}>First</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: '#FFFFFF',
                                    color: '#0a0a0a',
                                    borderColor: touched.babyFirst && !(b.first || '').trim() ? '#ff6b6b' : 'rgba(255,255,255,0.8)'
                                }]}
                                placeholder="First"
                                placeholderTextColor="#999"
                                value={b.first}
                                onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], first: t }; return copy; })}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.h1, { fontSize: 12 }]}>Middle</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                                placeholder="Middle"
                                placeholderTextColor="#999"
                                value={b.middle || ''}
                                onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], middle: t }; return copy; })}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.h1, { fontSize: 12 }]}>Last</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                                placeholder="Last"
                                placeholderTextColor="#999"
                                value={b.last || ''}
                                onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], last: t }; return copy; })}
                            />
                        </View>
                    </View>

                    {/* Individual Photo Upload */}
                    <Text style={[styles.h1, { fontSize: 16 }]}>
                        {mode === 'baby' ? 'Baby Photo (optional)' : 'Person Photo (optional)'}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.btn,
                            styles.whiteBtn,
                            {
                                backgroundColor: b.photoUri ? '#e8f5e8' : '#FFFFFF',
                                borderWidth: 2,
                                borderColor: b.photoUri ? '#4CAF50' : 'rgba(255,255,255,0.8)'
                            }
                        ]}
                        onPress={() => pickPhotoForBaby(idx)}
                    >
                        <Text style={[
                            styles.btnText,
                            styles.darkText,
                            { color: b.photoUri ? '#2E7D32' : '#0a0a0a' }
                        ]}>
                            {b.photoUri ? `✓ Photo ${idx + 1} Selected` : `📷 Upload Photo ${idx + 1}`}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                        {babies.length > 1 && (
                            <TouchableOpacity
                                style={[
                                    styles.btn,
                                    {
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    }
                                ]}
                                onPress={() => setBabies(bs => bs.filter((_, i) => i !== idx))}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Remove {mode === 'baby' ? 'Baby' : 'Person'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.h1, { fontSize: 12 }]}>Mother&apos;s Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                        placeholder="Mother's name"
                        placeholderTextColor="#999"
                        value={motherName}
                        onChangeText={setMotherName}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.h1, { fontSize: 12 }]}>Father&apos;s Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                        placeholder="Father's name"
                        placeholderTextColor="#999"
                        value={fatherName}
                        onChangeText={setFatherName}
                    />
                </View>
            </View>

            <Text style={styles.h1}>Hometown (City, State) — required</Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: '#FFFFFF',
                        color: '#0a0a0a',
                        borderColor: touched.hometown && !hometown.trim() ? '#ff6b6b' : 'rgba(255,255,255,0.8)',
                        borderWidth: touched.hometown && !hometown.trim() ? 2 : 1
                    }
                ]}
                placeholder="City, State (e.g., Springfield, MO)"
                placeholderTextColor="#999"
                value={hometown}
                onChangeText={setHometown}
                autoCapitalize="words"
                onBlur={() => setTouched(t => ({ ...t, hometown: true }))}
            />
            {loading && (
                <Text style={{
                    color: '#90EE90',
                    fontSize: 14,
                    marginTop: 8,
                    textAlign: 'center',
                    fontWeight: '500'
                }}>🔍 Finding population data...</Text>
            )}
            {population && (
                <Text style={{
                    color: '#90EE90',
                    fontSize: 14,
                    marginTop: 8,
                    textAlign: 'center',
                    fontWeight: '600'
                }}>✅ Population found: {population.toLocaleString()}</Text>
            )}
            {touched.hometown && !hometown.trim() ? (
                <Text style={[styles.errorText, { color: '#ffcccc' }]}>Hometown is required (e.g. "Austin, Texas").</Text>
            ) : touched.hometown && hometown.trim() && hometown.includes(',') && !population && !loading ? (
                <Text style={[styles.errorText, { color: '#ffdddd' }]}>Population not found. Try "Chicago, Illinois" or "Miami, Florida"</Text>
            ) : null}

            <Text style={styles.h1}>
                {mode === 'baby' ? 'Date of Birth' : 'Birthday Date'}
            </Text>
            <TouchableOpacity
                style={[styles.input, { backgroundColor: '#FFFFFF', paddingVertical: 12 }]}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={{ color: '#0a0a0a', fontSize: 14 }}>
                    {dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={dobDate}
                    onChange={(_e, d) => {
                        setShowDatePicker(false);
                        if (d) setDobDate(d);
                    }}
                    mode="date"
                    display="default"
                />
            )}

            {/* Weight and Length only shown for baby announcements */}
            {mode === 'baby' && (
                <>
                    {babyCount > 1 ? (
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)'
                        }}>
                            <Text style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: 14,
                                fontWeight: '600'
                            }}>
                                ⚖️📏 Weight & Length not available for {babyCount === 2 ? 'twins' : 'multiple babies'}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.h1, { fontSize: 12 }]}>Weight (lbs)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                                    placeholder="7"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={weightLb}
                                    onChangeText={setWeightLb}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.h1, { fontSize: 12 }]}>Weight (oz)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                                    placeholder="8"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={weightOz}
                                    onChangeText={setWeightOz}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.h1, { fontSize: 12 }]}>Length (in)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a' }]}
                                    placeholder="20"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={lengthIn}
                                    onChangeText={setLengthIn}
                                />
                            </View>
                        </View>
                    )}
                </>
            )}

            <Text style={styles.h1}>Background Color</Text>
            <Text style={{ color: '#000', marginBottom: 12, fontSize: 14 }}>
                Choose your announcement background color (all text will be white)
            </Text>

            {/* Color Grid - 5 rows x 5 columns with cascading animation */}
            <View style={{ alignSelf: 'center', width: '45%' }}>
                <View style={{ gap: 4, marginBottom: 4 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={colIndex * 80}
                                glowAnim={glowAnims[0 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(5 + colIndex) * 80}
                                glowAnim={glowAnims[1 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(10 + colIndex) * 80}
                                glowAnim={glowAnims[2 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 4 - Reds/Oranges */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(15 + colIndex) * 80}
                                glowAnim={glowAnims[3 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 5 - Grays */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(20 + colIndex) * 80}
                                glowAnim={glowAnims[4 * 5 + colIndex]}
                            />
                        ))}
                    </View>
                </View>
            </View>

            {loading && hometown.trim() && (
                <View style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: 16,
                    borderRadius: 12,
                    marginTop: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)'
                }}>
                    <Text style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        🔍 Loading data from Google Sheets...
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.btn,
                    styles.buildBtn,
                    { backgroundColor: COLOR_SCHEMES[theme].bg },
                    (!canBuild || loading) && styles.btnDisabled
                ]}
                onPress={onBuild}
                disabled={!canBuild || loading}
            >
                <Text style={[styles.buildText, { color: '#FFFFFF' }]}>
                    {loading
                        ? 'LOADING...'
                        : mode === 'baby'
                            ? 'BUILD MY BIRTH ANNOUNCEMENT'
                            : 'BUILD MY TIME CAPSULE GIFT'
                    }
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1 },
    container: { padding: 12, paddingBottom: 24 },
    h1: {
        color: "#000000",
        fontSize: 13,
        fontWeight: "700",
        marginTop: 8,
        marginBottom: 4,
        letterSpacing: 0.3
    },
    input: {
        backgroundColor: "#FFFFFF",
        color: "#0a0a0a",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    row: { flexDirection: "row", gap: 8 },
    half: { flex: 1 },
    btn: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)"
    },
    btnText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.2
    },
    buildBtn: {
        marginTop: 16,
        backgroundColor: "rgba(255,255,255,0.95)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4
    },
    buildText: {
        color: "#0a0a0a",
        fontWeight: "800",
        fontSize: 15,
        textAlign: "center",
        letterSpacing: 0.3
    },
    themeBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)"
    },
    themeText: {
        color: "white",
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.2
    },
    errorText: {
        color: '#ffcccc',
        marginTop: 4,
        fontSize: 12,
        fontStyle: 'italic'
    },
    btnDisabled: { opacity: 0.6 },
    whiteBtn: {
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4
    },
    darkText: { color: '#0a0a0a' },
    colorBox: {
        flex: 1,
        aspectRatio: 1,
        height: 12.5,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#ffffff',
        padding: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
});
