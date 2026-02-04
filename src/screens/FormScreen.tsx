import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    useWindowDimensions, Image, Alert, Platform,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, ThemeName } from '../types';
import { COLOR_SCHEMES } from "../data/utils/colors";
import { getAllSnapshotValues } from '../data/utils/snapshot';
import { getPopulationForCity } from '../data/utils/populations';
import { getSnapshotWithHistorical } from '../data/utils/historical-snapshot';

type Props = NativeStackScreenProps<RootStackParamList, "Form">;

export default function FormScreen({ navigation, route }: Props) {
    const [theme, setTheme] = useState<ThemeName>("green");
    const [mode, setMode] = useState<'baby' | 'birthday'>('baby'); // NEW: Mode toggle

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
    const [motherName, setMotherName] = useState("Sarah Johnson");
    const [fatherName, setFatherName] = useState("Michael Johnson");
    const [email, setEmail] = useState("sarah.johnson@email.com"); // For marketing
    const [hometown, setHometown] = useState("Bellefontaine Neighbors, MO");
    const [dobDate, setDobDate] = useState<Date>(new Date()); // Today's date
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

    function openDate() {
        if (Platform.OS === 'web') {
            // On web, prompt for date
            const currentDateStr = dobDate.toISOString().split('T')[0];
            const newDateStr = prompt('Enter date (YYYY-MM-DD):', currentDateStr);
            if (newDateStr) {
                const newDate = new Date(newDateStr);
                if (!isNaN(newDate.getTime())) {
                    setDobDate(newDate);
                }
            }
        } else {
            // On Android/iOS, use the native picker
            DateTimePickerAndroid.open({
                value: dobDate,
                onChange: (_e, d) => { if (d) setDobDate(d); },
                mode: "date",
                is24Hour: true,
            });
        }
    }

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

            {/* VERSION CHECK */}
            <View style={{ backgroundColor: 'lime', padding: 10, marginBottom: 10 }}>
                <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                    VERSION: Feb 3, 2026 - 9:15 PM - DATE INPUTS FIXED ✅
                </Text>
            </View>

            {/* Instructions */}
            <Text style={[styles.h1, { fontSize: 14, marginBottom: 20, textAlign: 'center', lineHeight: 20 }]}>
                FOR BEST RESULTS PLEASE FILL OUT ALL FIELDS ON THIS FORM IN ORDER TO SHOWCASE YOUR ABILITY AS A CREATOR & TO MAXIMIZE THE EMOTIONAL IMPACT ON THE PERSON YOU ARE CREATING THIS KEEPSAKE FOR.
            </Text>

            <Text style={styles.h1}>{mode === 'baby' ? 'How many babies?' : 'How many people?'}</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                {[1, 2, 3].map(n => (
                    <TouchableOpacity key={n} onPress={() => setBabyCount(n)} style={[styles.themeBtn, { paddingVertical: 10, borderWidth: 1, borderColor: babyCount === n ? '#fff' : '#666' }]}>
                        <Text style={[styles.themeText, { color: '#fff' }]}>
                            {mode === 'baby'
                                ? (n === 1 ? 'Single' : n === 2 ? 'Twins' : 'Triplets')
                                : (n === 1 ? 'One' : n === 2 ? 'Two' : 'Three')
                            }
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {babies.map((b, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                    <Text style={[styles.h1, { fontSize: 16 }]}>
                        {mode === 'baby' ? 'Baby First Name' : 'Person First Name'}
                    </Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: '#FFFFFF',
                            color: '#0a0a0a',
                            borderColor: touched.babyFirst && !(b.first || '').trim() ? '#ff6b6b' : 'rgba(255,255,255,0.8)'
                        }]}
                        placeholder="First name"
                        placeholderTextColor="#999"
                        value={b.first}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], first: t }; return copy; })}
                    />
                    <Text style={[styles.h1, { fontSize: 16 }]}>
                        {mode === 'baby' ? 'Baby Middle (optional)' : 'Person Middle (optional)'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Middle name (optional)"
                        placeholderTextColor="#999"
                        value={b.middle || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], middle: t }; return copy; })}
                    />
                    <Text style={[styles.h1, { fontSize: 16 }]}>
                        {mode === 'baby' ? 'Baby Last (optional)' : 'Person Last (optional)'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Last name (optional)"
                        placeholderTextColor="#999"
                        value={b.last || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], last: t }; return copy; })}
                    />

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

            <Text style={styles.h1}>Mother&apos;s Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Mother's name (optional)"
                placeholderTextColor="#999"
                value={motherName}
                onChangeText={setMotherName}
            />

            <Text style={styles.h1}>Father&apos;s Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Father's name (optional)"
                placeholderTextColor="#999"
                value={fatherName}
                onChangeText={setFatherName}
            />

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
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', marginBottom: 4, fontSize: 12 }}>Month (1-12)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a', textAlign: 'center' }]}
                        value={String(dobDate.getMonth() + 1)}
                        onChangeText={(text) => {
                            const month = parseInt(text);
                            if (month >= 1 && month <= 12) {
                                const newDate = new Date(dobDate);
                                newDate.setMonth(month - 1);
                                setDobDate(newDate);
                            }
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="MM"
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', marginBottom: 4, fontSize: 12 }}>Day (1-31)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a', textAlign: 'center' }]}
                        value={String(dobDate.getDate())}
                        onChangeText={(text) => {
                            const day = parseInt(text);
                            if (day >= 1 && day <= 31) {
                                const newDate = new Date(dobDate);
                                newDate.setDate(day);
                                setDobDate(newDate);
                            }
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="DD"
                        placeholderTextColor="#999"
                    />
                </View>
                <View style={{ flex: 1.5 }}>
                    <Text style={{ color: '#fff', marginBottom: 4, fontSize: 12 }}>Year</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#FFFFFF', color: '#0a0a0a', textAlign: 'center' }]}
                        value={String(dobDate.getFullYear())}
                        onChangeText={(text) => {
                            const year = parseInt(text);
                            if (year >= 1900 && year <= 2100) {
                                const newDate = new Date(dobDate);
                                newDate.setFullYear(year);
                                setDobDate(newDate);
                            }
                        }}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholder="YYYY"
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            {/* Weight and Length only shown for baby announcements */}
            {mode === 'baby' && (
                <>
                    <Text style={styles.h1}>Weight</Text>
                    {babyCount > 1 ? (
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: 20,
                            borderRadius: 12,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)'
                        }}>
                            <Text style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 8
                            }}>
                                ⚖️ Weight not available for {babyCount === 2 ? 'twins' : 'multiple babies'}
                            </Text>
                            <Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                textAlign: 'center',
                                fontSize: 14,
                                lineHeight: 20
                            }}>
                                Individual measurements would be confusing on the announcement
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.half]}
                                placeholder="7 lbs"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={weightLb}
                                onChangeText={setWeightLb}
                            />
                            <TextInput
                                style={[styles.input, styles.half]}
                                placeholder="8 oz"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={weightOz}
                                onChangeText={setWeightOz}
                            />
                        </View>
                    )}

                    <Text style={styles.h1}>Length (inches)</Text>
                    {babyCount > 1 ? (
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: 20,
                            borderRadius: 12,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)'
                        }}>
                            <Text style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 8
                            }}>
                                📏 Length not available for {babyCount === 2 ? 'twins' : 'multiple babies'}
                            </Text>
                            <Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                textAlign: 'center',
                                fontSize: 14,
                                lineHeight: 20
                            }}>
                                Individual measurements would be confusing on the announcement
                            </Text>
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="20 inches"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={lengthIn}
                            onChangeText={setLengthIn}
                        />
                    )}
                </>
            )}

            <Text style={styles.h1}>Background Color</Text>
            <Text style={{ color: '#000', marginBottom: 12, fontSize: 14 }}>
                Choose your announcement background color (all text will be white)
            </Text>

            {/* Color Grid - 5 rows x 5 columns */}
            <View style={{ alignSelf: 'center', width: '37.5%' }}>
                <View style={{ gap: 1.5, marginBottom: 4 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTheme(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: theme === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTheme(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: theme === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTheme(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: theme === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 4 - Reds/Oranges */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTheme(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: theme === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 5 - Grays */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTheme(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: theme === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Selected Color Label */}
            <View style={{
                backgroundColor: COLOR_SCHEMES[theme].bg,
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                alignItems: 'center',
            }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {theme.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
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

            <Text style={styles.h1}>Email Address (for order updates & special offers)</Text>
            <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
            />

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
    container: { padding: 20, paddingBottom: 40 },
    h1: {
        color: "#000000",
        fontSize: 18,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 12,
        letterSpacing: 0.5
    },
    input: {
        backgroundColor: "#FFFFFF",
        color: "#0a0a0a",
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    row: { flexDirection: "row", gap: 12 },
    half: { flex: 1 },
    btn: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)"
    },
    btnText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.3
    },
    buildBtn: {
        marginTop: 24,
        backgroundColor: "rgba(255,255,255,0.95)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6
    },
    buildText: {
        color: "#0a0a0a",
        fontWeight: "800",
        fontSize: 18,
        textAlign: "center",
        letterSpacing: 0.5
    },
    themeBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)"
    },
    themeText: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
        letterSpacing: 0.3
    },
    errorText: {
        color: '#ffcccc',
        marginTop: 8,
        fontSize: 14,
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
