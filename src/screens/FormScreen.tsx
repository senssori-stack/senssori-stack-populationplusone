import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from "react-native";
import PhotoUploadGrid from '../../components/PhotoUploadGrid';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFormContext } from '../context/FormContext';
import { COLOR_SCHEMES } from "../data/utils/colors";
import { getPopulationForCity } from '../data/utils/populations';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import type { RootStackParamList, ThemeName } from '../types';

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
    // Get form context for persistence
    const { formData: savedFormData, updateFormData, hasFormData } = useFormContext();

    // Initialize state from context (or defaults for testing)
    const [theme, setTheme] = useState<ThemeName>(savedFormData.theme as ThemeName || "green");
    const [mode, setMode] = useState<'baby' | 'birthday'>(savedFormData.mode === 'birthday' ? 'birthday' : 'baby');

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

    // Load saved form data from context on mount (if user previously filled the form)
    const hasLoadedFromContext = useRef(false);
    useEffect(() => {
        if (!hasLoadedFromContext.current && hasFormData) {
            hasLoadedFromContext.current = true;
            // Load saved data from context
            if (savedFormData.babyFirst) setBabyFirst(savedFormData.babyFirst);
            if (savedFormData.babyMiddle) setBabyMiddle(savedFormData.babyMiddle);
            if (savedFormData.babyLast) setBabyLast(savedFormData.babyLast);
            if (savedFormData.babies && savedFormData.babies.length > 0) setBabies(savedFormData.babies);
            if (savedFormData.babyCount) setBabyCount(savedFormData.babyCount);
            if (savedFormData.motherName) setMotherName(savedFormData.motherName);
            if (savedFormData.fatherName) setFatherName(savedFormData.fatherName);
            if (savedFormData.email) setEmail(savedFormData.email);
            if (savedFormData.hometown) setHometown(savedFormData.hometown);
            if (savedFormData.dobDate) setDobDate(savedFormData.dobDate);
            if (savedFormData.birthTime) setBirthTime(savedFormData.birthTime);
            if (savedFormData.weightLb) setWeightLb(savedFormData.weightLb);
            if (savedFormData.weightOz) setWeightOz(savedFormData.weightOz);
            if (savedFormData.lengthIn) setLengthIn(savedFormData.lengthIn);
            if (savedFormData.photoUris !== undefined) setPhotoUris(savedFormData.photoUris);
            else if (savedFormData.photoUri !== undefined) setPhotoUris([savedFormData.photoUri, null, null]);
            if (savedFormData.snapshot && Object.keys(savedFormData.snapshot).length > 0) setSnapshot(savedFormData.snapshot);
            if (savedFormData.population !== null) setPopulation(savedFormData.population);
        }
    }, [hasFormData, savedFormData]);

    // TEST DATA - Prefilled for easy testing
    // ðŸ§ª For testing long names, uncomment these lines:
    // const [babyFirst, setBabyFirst] = useState("Bartholomew Christopher");
    // const [babyLast, setBabyLast] = useState("Montgomery-Williams-Henderson");
    // const [hometown, setHometown] = useState("San Francisco International Airport, California");

    const [babyFirst, setBabyFirst] = useState("Emily");
    const [babyMiddle, setBabyMiddle] = useState("Grace");
    const [babyLast, setBabyLast] = useState("Sample");
    const [babies, setBabies] = useState<Array<{ first: string; middle?: string; last?: string; photoUri?: string | null; photoUris?: (string | null)[]; gender?: 'boy' | 'girl' }>>([
        {
            first: 'Emily',
            middle: 'Grace',
            last: 'Sample',
            photoUri: null,
            photoUris: [null, null, null],
            gender: 'girl'
        },
    ]);
    const [babyCount, setBabyCount] = useState<number>(1); // Single
    const [motherName, setMotherName] = useState("Sarah Sample");
    const [fatherName, setFatherName] = useState("Jack Sample");
    const [email, setEmail] = useState(""); // For marketing
    const [hometown, setHometown] = useState("Kansas City, MO");
    const [dobDate, setDobDate] = useState<Date>(new Date(2026, 1, 14)); // Feb 14, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [birthTime, setBirthTime] = useState<Date>(new Date()); // Time of birth
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [weightLb, setWeightLb] = useState("7");
    const [weightOz, setWeightOz] = useState("8");
    const [lengthIn, setLengthIn] = useState("20");
    const [photoUris, setPhotoUris] = useState<(string | null)[]>([null, null, null]);

    const [touched, setTouched] = useState({ babyFirst: false, hometown: false });
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const [population, setPopulation] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Letter to Baby — show all names for twins/triplets
    const babyDisplayName = (() => {
        const names = babies.slice(0, babyCount).map(b => (b.first || '').trim()).filter(Boolean);
        if (names.length === 0) return 'Baby';
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]} & ${names[1]}`;
        return `${names[0]}, ${names[1]} & ${names[2]}`;
    })();
    const [letterToBaby, setLetterToBaby] = useState('');

    const canBuild = (babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0) && hometown.trim().length > 0;

    // Sync form data to context when fields change
    useEffect(() => {
        updateFormData({
            theme,
            mode,
            babyFirst,
            babyMiddle,
            babyLast,
            babies,
            babyCount,
            motherName,
            fatherName,
            email,
            hometown,
            dobDate,
            birthTime,
            weightLb,
            weightOz,
            lengthIn,
            photoUris,
            snapshot,
            population,
        });
    }, [theme, mode, babyFirst, babyMiddle, babyLast, babies, babyCount, motherName, fatherName, email, hometown, dobDate, birthTime, weightLb, weightOz, lengthIn, photoUris, snapshot, population]);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!hometown.trim() || hometown.length < 3) return;
            try {
                setLoading(true);
                console.log('ðŸ™ï¸  Fetching data for hometown:', hometown, 'birth year:', dobDate.getFullYear());
                console.log('ðŸ“± Device info - User Agent:', navigator.userAgent);
                console.log('ðŸŒ Network state:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

                // Fetch snapshot data from Google Sheets with timeout
                console.log('ðŸ“Š Starting snapshot fetch...');
                const snapshotPromise = getAllSnapshotValues();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout after 15 seconds')), 15000)
                );

                const snapshotData = await Promise.race([snapshotPromise, timeoutPromise]) as Record<string, string>;
                console.log('âœ… Snapshot data fetched:', Object.keys(snapshotData).length, 'entries');
                console.log('ðŸ“Š Sample data:', Object.keys(snapshotData).slice(0, 3));
                setSnapshot(snapshotData);

                // Fetch population for the entered hometown
                // âš ï¸ CRITICAL: Must pass DOB - if after 2020-01-01, uses Google Sheets CSV (mandatory)
                console.log('ðŸ‘¥ Starting population fetch for:', hometown);
                const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
                const cityPopulation = await getPopulationForCity(hometown, dobISO);
                console.log('âœ… Population result:', cityPopulation);
                setPopulation(cityPopulation);
            } catch (error) {
                console.error('âŒ MOBILE NETWORK ERROR:', error);
                const err = error as Error;
                console.error('Error type:', err.name || 'Unknown');
                console.error('Error message:', err.message || 'Unknown error');
                console.error('Network online status:', navigator.onLine);

                // Provide fallback data for offline/error scenarios
                console.log('ðŸ”„ Using fallback data...');
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
                // Add to first empty photoUris slot
                setPhotoUris(prev => {
                    const copy = [...prev];
                    const emptyIndex = copy.findIndex(p => !p);
                    if (emptyIndex !== -1) {
                        copy[emptyIndex] = uri;
                    } else {
                        copy[0] = uri;
                    }
                    return copy;
                });
            }
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    }

    // Pick photo into a specific slot (0, 1, or 2)
    async function pickPhotoSlot(slotIndex: number) {
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
            setPhotoUris(prev => {
                const copy = [...prev];
                copy[slotIndex] = uri;
                return copy;
            });
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    }

    function removePhotoSlot(slotIndex: number) {
        setPhotoUris(prev => {
            const copy = [...prev];
            copy[slotIndex] = null;
            return copy;
        });
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
            while (copy.length < babyCount) copy.push({ first: '', photoUris: [null, null, null] });
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
                // âš ï¸ CRITICAL: Must pass DOB - routes to HISTORICAL CSV (before 2020) or CURRENT CSV (after 2020)
                const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
                finalPopulation = await getPopulationForCity(hometown.trim(), dobISO);
                setPopulation(finalPopulation);

                /**
                 * âš ï¸ CRITICAL: CITY NOT FOUND - SHOW ERROR POPUP
                 * Do NOT use default fallback population - user must correct the city
                 */
                if (finalPopulation === null) {
                    Alert.alert(
                        'City Not Found',
                        'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                        [{ text: 'OK' }]
                    );
                    setLoading(false);
                    return;
                }
            } catch (error) {
                const err = error as Error;
                const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Network') || err.message?.includes('timeout');
                Alert.alert(
                    isNetworkError ? 'Network Error' : 'City Not Found',
                    isNetworkError
                        ? 'Unable to connect to population database. Please check your internet connection and try again.'
                        : 'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
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
            // Construct personName from ALL baby names for twins/triplets
            if (babyCount === 1) {
                const firstBaby = meaningfulBabies[0];
                const nameParts = [
                    (firstBaby.first || '').trim(),
                    (firstBaby.middle || '').trim(),
                    (firstBaby.last || '').trim()
                ].filter(Boolean);
                payload.personName = nameParts.join(' ');
            } else {
                // Join all baby first names: "Emma & Olivia" or "Emma, Olivia & Liam"
                const firstNames = meaningfulBabies.map(b => (b.first || '').trim()).filter(Boolean);
                if (firstNames.length === 2) {
                    payload.personName = firstNames.join(' & ');
                } else if (firstNames.length === 3) {
                    payload.personName = `${firstNames[0]}, ${firstNames[1]} & ${firstNames[2]}`;
                } else {
                    payload.personName = firstNames.join(', ');
                }
            }
            payload.babyCount = babyCount;
            // All modes use the shared photoUris state (single, twins, triplets all share one upload area)
            payload.photoUris = photoUris.filter(p => p !== null);
        } else {
            payload.babyFirst = babyFirst.trim();
            payload.babyMiddle = babyMiddle.trim();
            payload.babyLast = babyLast.trim();
            payload.photoUris = photoUris.filter(p => p !== null);
            // Construct personName from individual fields
            const nameParts = [babyFirst.trim(), babyMiddle.trim(), babyLast.trim()].filter(Boolean);
            payload.personName = nameParts.join(' ');
        }
        payload.mode = 'baby';
        payload.babyCount = payload.babyCount || babyCount;
        payload.frontOrientation = 'landscape';
        payload.timeCapsuleOrientation = 'landscape';
        payload.snapshot = snapshot;
        payload.population = finalPopulation;
        // Letter to Baby
        payload.jointLetter = letterToBaby;
        navigation.navigate('Preview', payload);
    }

    const C = COLOR_SCHEMES[theme as keyof typeof COLOR_SCHEMES];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{mode === 'baby' ? 'Newborn Baby Announcement' : 'Time Capsule Gift'}</Text>

            {/* Baby Count Toggle */}
            <Text style={styles.label}>{mode === 'baby' ? 'How many babies?' : 'How many people?'}</Text>
            <View style={styles.toggleGroup}>
                {(['Single', 'Twins', 'Triplets'] as const).map((lbl, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.toggleBtn, babyCount === idx + 1 && styles.toggleActive]}
                        onPress={() => setBabyCount(idx + 1)}
                    >
                        <Text style={[styles.toggleText, babyCount === idx + 1 && styles.toggleActiveText]}>
                            {mode === 'baby' ? lbl : (idx === 0 ? 'One' : idx === 1 ? 'Two' : 'Three')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Baby Input Fields */}
            {babies.map((b, idx) => (
                <View key={idx} style={styles.babySection}>
                    {mode === 'baby' && (
                        <View style={styles.babyHeaderRow}>
                            {babyCount > 1 && (
                                <Text style={styles.sectionTitle}>{`Baby ${idx + 1}`}</Text>
                            )}
                            <View style={styles.genderToggleGroup}>
                                <TouchableOpacity
                                    style={[styles.genderBtn, b.gender === 'boy' && styles.genderBtnBoy]}
                                    onPress={() => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], gender: 'boy' }; return copy; })}
                                >
                                    <Text style={[styles.genderBtnText, b.gender === 'boy' && styles.genderBtnTextActive]}>👦 Boy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.genderBtn, b.gender === 'girl' && styles.genderBtnGirl]}
                                    onPress={() => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], gender: 'girl' }; return copy; })}
                                >
                                    <Text style={[styles.genderBtnText, b.gender === 'girl' && styles.genderBtnTextActive]}>👧 Girl</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {mode !== 'baby' && babyCount > 1 && (
                        <Text style={styles.sectionTitle}>{`Person ${idx + 1}`}</Text>
                    )}

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={[styles.input, touched.babyFirst && !(b.first || '').trim() && styles.inputError]}
                        placeholder="First name"
                        placeholderTextColor="#999"
                        value={b.first}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], first: t }; return copy; })}
                    />

                    <Text style={styles.label}>Middle Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Middle name"
                        placeholderTextColor="#999"
                        value={b.middle || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], middle: t }; return copy; })}
                    />

                    <Text style={styles.label}>Last Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        placeholderTextColor="#999"
                        value={b.last || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], last: t }; return copy; })}
                    />

                    {/* Photo Upload - only show for single baby (twins/triplets share one below) */}
                    {babyCount === 1 && (
                        <PhotoUploadGrid
                            photos={photoUris}
                            onPhotosChange={(newPhotos) => setPhotoUris(newPhotos)}
                            maxPhotos={3}
                            label="Photos (Optional - up to 3)"
                        />
                    )}
                </View>
            ))}

            {/* Shared Photo Upload for Twins/Triplets */}
            {babyCount > 1 && (
                <View style={styles.babySection}>
                    <Text style={styles.sectionTitle}>📸 Photos</Text>
                    <PhotoUploadGrid
                        photos={photoUris}
                        onPhotosChange={(newPhotos) => setPhotoUris(newPhotos)}
                        maxPhotos={3}
                        label="Photos (Optional - up to 3)"
                    />
                </View>
            )}

            {/* Parents */}
            <Text style={styles.label}>Mother's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Mother's name"
                placeholderTextColor="#999"
                value={motherName}
                onChangeText={setMotherName}
            />

            <Text style={styles.label}>Father's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Father's name"
                placeholderTextColor="#999"
                value={fatherName}
                onChangeText={setFatherName}
            />

            {/* Hometown */}
            <Text style={styles.label}>Hometown (City, State) - required</Text>
            <TextInput
                style={[styles.input, touched.hometown && !hometown.trim() && styles.inputError]}
                placeholder="e.g., Springfield, MO"
                placeholderTextColor="#999"
                value={hometown}
                onChangeText={setHometown}
                autoCapitalize="words"
                onBlur={() => setTouched(t => ({ ...t, hometown: true }))}
            />
            {loading && (
                <Text style={styles.statusText}>Finding population data...</Text>
            )}
            {population && (
                <Text style={styles.statusText}>Population: {population.toLocaleString()}</Text>
            )}
            {touched.hometown && !hometown.trim() && (
                <Text style={styles.errorText}>Hometown is required</Text>
            )}

            {/* Date of Birth */}
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{mode === 'baby' ? 'Date of Birth' : 'Birthday'}</Text>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateBtnText}>
                            {dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
                        </Text>
                    </TouchableOpacity>
                    <ScrollableDatePicker
                        visible={showDatePicker}
                        date={dobDate}
                        onDateChange={(date) => setDobDate(date)}
                        onClose={() => setShowDatePicker(false)}
                        title={mode === 'baby' ? 'Date of Birth' : 'Birthday'}
                    />
                </View>
                {mode === 'baby' && (
                    <View style={{ width: 110 }}>
                        <Text style={styles.label}>Time of Birth</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateBtnText}>
                                {birthTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={birthTime}
                                onChange={(_e, t) => { setShowTimePicker(false); if (t) setBirthTime(t); }}
                                mode="time"
                                display="default"
                            />
                        )}
                    </View>
                )}
            </View>

            {/* Measurements (only for single baby) */}
            {mode === 'baby' && babyCount === 1 && (
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Weight (lbs)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="7"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={weightLb}
                            onChangeText={setWeightLb}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Weight (oz)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="8"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={weightOz}
                            onChangeText={setWeightOz}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Length (in)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="20"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={lengthIn}
                            onChangeText={setLengthIn}
                        />
                    </View>
                </View>
            )}

            {mode === 'baby' && babyCount > 1 && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Weight & Length not available for {babyCount === 2 ? 'twins' : 'triplets'}
                    </Text>
                </View>
            )}

            {/* 💌 Letter to Baby — Separate keepsake page */}
            {mode === 'baby' && (
                <View style={styles.messageSectionContainer}>
                    <Text style={styles.messageSectionTitle}>💌 Letter to {babyDisplayName}</Text>
                    <Text style={styles.messageSectionSubtitle}>
                        Write a heartfelt letter for {babyDisplayName} to read someday. Tap a sample below or write your own!
                    </Text>

                    <View style={styles.sampleBtnRow}>
                        <TouchableOpacity style={styles.sampleBtn} onPress={() => setLetterToBaby(`Dear ${babyDisplayName},\n\nFrom the moment we first heard your heartbeat, our lives changed forever. You are our greatest blessing, our sweetest dream come true, and the answer to every prayer we ever whispered. We spent so many nights imagining what you would look like, wondering who you would become, and dreaming about the life we would build together.\n\nNow that you're here, every single moment feels like magic. The way you curl your tiny fingers around ours, the soft sounds you make when you sleep, the way the whole room lights up just because you're in it — these are the moments we will treasure for the rest of our lives.\n\nWe promise to love you unconditionally, to protect you fiercely, to cheer you on through every triumph and hold you close through every challenge. We promise to read you stories, to answer your endless questions, to let you make messes and learn from your mistakes. We promise to be the kind of parents who listen, who laugh with you, and who always make sure you know just how extraordinary you are.\n\nWelcome to the world, little one. You are so deeply, completely, and endlessly loved.\n\nWith all our hearts,\nMom & Dad`)}>
                            <Text style={styles.sampleBtnText}>💑 From Mom & Dad</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sampleBtn} onPress={() => setLetterToBaby(`Dear ${babyDisplayName},\n\nI carried you beneath my heart for nine months, but I have loved you my whole life. Every flutter, every kick, every hiccup reminded me that the most incredible journey of my life was just beginning.\n\nThe moment they placed you in my arms, the whole world went quiet. Nothing else mattered — just you, your tiny perfect face, your little fingers, and the soft warmth of you against my chest. I cried the happiest tears I have ever cried.\n\nI want you to know that no matter where life takes you, no matter how big you grow, you will always be my baby. I will always be your safe place, your biggest fan, and the one who loves you more than words could ever say. I will sing to you, read to you, hold you when you're scared, and celebrate every little thing you do.\n\nYou have made me a mother, and that is the greatest gift I have ever received.\n\nI love you to the moon and back,\nMom`)}>
                            <Text style={styles.sampleBtnText}>👩 From Mom</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sampleBtn} onPress={() => setLetterToBaby(`Dear ${babyDisplayName},\n\nI never knew my heart could feel this full until I held you for the first time. In that moment, everything changed. Every dream I ever had suddenly had a new meaning — because now, everything I do, I do for you.\n\nI promise to be the dad who shows up — for every game, every recital, every scraped knee, and every bedtime story. I promise to teach you how to ride a bike, how to throw a ball, how to be brave, and how to be kind. I promise to make you laugh, to protect you, and to always be honest with you, even when it's hard.\n\nBut most of all, I promise to love you with everything I have. You are my greatest adventure, my proudest accomplishment, and my reason to be the best man I can be.\n\nThe world is a better place because you're in it, and I will spend every day making sure you know how loved you are.\n\nForever and always,\nDad`)}>
                            <Text style={styles.sampleBtnText}>👨 From Dad</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.messageInput}
                        placeholder={`Dear ${babyDisplayName},\n\nWrite your letter here...`}
                        placeholderTextColor="#999"
                        value={letterToBaby}
                        onChangeText={setLetterToBaby}
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            )}

            {/* Color Picker */}
            <Text style={[styles.label, { textAlign: 'center', marginTop: 20 }]}>Background Color</Text>
            <Text style={styles.colorHint}>Choose your announcement color (text will be white)</Text>

            {/* Color Grid - 5 rows x 5 columns with cascading animation */}
            <View style={{ alignSelf: 'center', marginTop: 12 }}>
                <View style={{ gap: 6 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
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
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
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
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
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
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
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
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
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

            {/* Spelling Reminder */}
            <View style={styles.spellingReminder}>
                <Text style={styles.spellingReminderEmoji}>{"\uD83D\uDC8E"}</Text>
                <Text style={styles.spellingReminderText}>
                    This is a keepsake your family will treasure for years to come. Please take a moment to double-check that every name, date, and detail is spelled exactly the way you want it to appear on your printed signs and cards.
                </Text>
            </View>

            {/* Build Button */}
            <TouchableOpacity
                style={[
                    styles.previewButton,
                    (!canBuild || loading) && styles.previewButtonDisabled
                ]}
                onPress={onBuild}
                disabled={!canBuild || loading}
            >
                <Text style={styles.previewButtonText}>
                    {loading
                        ? 'Loading...'
                        : mode === 'baby'
                            ? 'Preview Birth Announcement'
                            : 'Preview Time Capsule Gift'
                    }
                </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000080',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },

    // Title
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
        color: '#fff',
        textAlign: 'center'
    },

    // Labels
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 12,
        color: '#fff'
    },

    // Inputs - white background
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: '#e74c3c',
        borderWidth: 2,
    },

    // Baby sections
    babySection: { marginBottom: 16 },
    babyHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
        gap: 12,
    },
    genderToggleGroup: {
        flexDirection: 'row',
        gap: 6,
    },
    genderBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    genderBtnBoy: {
        backgroundColor: '#4A90D9',
        borderColor: '#4A90D9',
    },
    genderBtnGirl: {
        backgroundColor: '#E87BA8',
        borderColor: '#E87BA8',
    },
    genderBtnText: {
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    genderBtnTextActive: {
        color: '#fff',
    },

    // Upload button
    uploadBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.5)',
    },
    uploadBtnSelected: {
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderColor: '#fff',
        borderStyle: 'solid',
    },
    uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Toggle group for baby count
    toggleGroup: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: '#fff' },
    toggleText: { fontWeight: '700', color: '#fff', fontSize: 14 },
    toggleActiveText: { color: '#333' },

    // Date button
    dateBtn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dateBtnText: { fontSize: 16, color: '#333' },

    // Row layout
    row: { flexDirection: 'row', gap: 12 },

    // Spelling reminder
    spellingReminder: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 14,
        marginTop: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'flex-start',
    },
    spellingReminderEmoji: {
        fontSize: 22,
        marginRight: 10,
        marginTop: 2,
    },
    spellingReminderText: {
        flex: 1,
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
        fontWeight: '500',
    },

    // Preview button - white with dark green text (matches birthday/graduation forms)
    previewButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 14,
        alignItems: 'center',
    },
    previewButtonDisabled: {
        opacity: 0.6,
    },
    previewButtonText: {
        color: '#000080',
        fontSize: 18,
        fontWeight: '900',
    },

    // Info box
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
    },
    infoText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },

    // Status and error text
    statusText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    errorText: {
        color: '#ffcccc',
        marginTop: 6,
        fontSize: 13,
        fontWeight: '500',
    },
    colorHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Letter to Baby
    letterSection: {
        marginTop: 12,
    },
    letterSectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
    },
    messageSectionContainer: {
        marginTop: 28,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    messageSectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
    },
    messageSectionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 18,
    },
    sampleMessageLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 10,
    },
    sampleBtnRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    sampleBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sampleBtnActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    sampleBtnText: {
        fontWeight: '700',
        color: '#fff',
        fontSize: 13,
    },
    sampleBtnTextActive: {
        color: '#000080',
    },
    messageInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#333',
        minHeight: 180,
        lineHeight: 22,
    },
    clearMessageBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    clearMessageBtnText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontWeight: '600',
    },

});
