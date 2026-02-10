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

    const [babyFirst, setBabyFirst] = useState("Emma");
    const [babyMiddle, setBabyMiddle] = useState("Grace");
    const [babyLast, setBabyLast] = useState("Johnson");
    const [babies, setBabies] = useState<Array<{ first: string; middle?: string; last?: string; photoUri?: string | null }>>([
        {
            first: 'Emma',
            middle: 'Grace',
            last: 'Johnson',
            photoUri: null
        },
    ]);
    const [babyCount, setBabyCount] = useState<number>(1); // Default to single baby
    const [motherName, setMotherName] = useState("Sarah Johnson");
    const [fatherName, setFatherName] = useState("Michael Johnson");
    const [email, setEmail] = useState("sarah.johnson@email.com"); // For marketing
    const [hometown, setHometown] = useState("Bellefontaine Neighbors, MO");
    const [dobDate, setDobDate] = useState<Date>(new Date()); // Today's date
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
                Alert.alert(
                    'City Not Found',
                    'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
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
            // Construct personName from first baby's name (matching milestone form structure)
            const firstBaby = meaningfulBabies[0];
            const nameParts = [
                (firstBaby.first || '').trim(),
                (firstBaby.middle || '').trim(),
                (firstBaby.last || '').trim()
            ].filter(Boolean);
            payload.personName = nameParts.join(' ');
            // For single baby, use the photoUris state (3-slot picker); for twins/triplets, use individual baby photos
            if (babyCount === 1) {
                payload.photoUris = photoUris.filter(p => p !== null);
            } else {
                payload.photoUris = meaningfulBabies.map(b => b.photoUri ?? null);
            }
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
        payload.frontOrientation = 'landscape';
        payload.timeCapsuleOrientation = 'landscape';
        payload.snapshot = snapshot;
        payload.population = finalPopulation;
        navigation.navigate('Preview', payload);
    }

    const C = COLOR_SCHEMES[theme as keyof typeof COLOR_SCHEMES];

    return (
        <ScrollView style={[styles.container, { backgroundColor: C.bg }]} contentContainerStyle={styles.content}>
            <Text style={styles.title}>+1 {mode === 'baby' ? 'Birth Announcement' : 'Time Capsule Gift'}</Text>

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
                    {babyCount > 1 && (
                        <Text style={styles.sectionTitle}>{mode === 'baby' ? `Baby ${idx + 1}` : `Person ${idx + 1}`}</Text>
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

                    {/* Photo Upload - 3 slots for single baby, 1 per baby for twins/triplets */}
                    {babyCount === 1 ? (
                        <>
                            <Text style={styles.label}>Photos (up to 3, optional)</Text>
                            <View style={styles.photoSlotsRow}>
                                {[0, 1, 2].map(slotIdx => (
                                    <View key={slotIdx} style={styles.photoSlotContainer}>
                                        <TouchableOpacity
                                            style={[styles.photoSlot, photoUris[slotIdx] && styles.photoSlotFilled]}
                                            onPress={() => pickPhotoSlot(slotIdx)}
                                        >
                                            <Text style={styles.photoSlotText}>
                                                {photoUris[slotIdx] ? '✓' : `${slotIdx + 1}`}
                                            </Text>
                                        </TouchableOpacity>
                                        {photoUris[slotIdx] && (
                                            <TouchableOpacity
                                                style={styles.photoRemoveBtn}
                                                onPress={() => removePhotoSlot(slotIdx)}
                                            >
                                                <Text style={styles.photoRemoveText}>✕</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.photoHint}>
                                {photoUris.filter(p => p).length}/3 photos selected
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Photo (optional)</Text>
                            <TouchableOpacity
                                style={[styles.uploadBtn, b.photoUri && styles.uploadBtnSelected]}
                                onPress={() => pickPhotoForBaby(idx)}
                            >
                                <Text style={styles.uploadBtnText}>
                                    {b.photoUri ? '✓ Photo Selected' : '📷 Upload Photo'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ))}

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
            <Text style={styles.label}>Hometown (City, State) â€” required</Text>
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
                <Text style={styles.statusText}>ðŸ” Finding population data...</Text>
            )}
            {population && (
                <Text style={styles.statusText}>âœ… Population: {population.toLocaleString()}</Text>
            )}
            {touched.hometown && !hometown.trim() && (
                <Text style={styles.errorText}>Hometown is required</Text>
            )}

            {/* Date of Birth */}
            <View style={styles.row}>
                <View style={{ flex: 2 }}>
                    <Text style={styles.label}>{mode === 'baby' ? 'Date of Birth' : 'Birthday'}</Text>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateBtnText}>
                            {dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dobDate}
                            onChange={(_e, d) => { setShowDatePicker(false); if (d) setDobDate(d); }}
                            mode="date"
                            display="default"
                        />
                    )}
                </View>
                {mode === 'baby' && (
                    <View style={{ flex: 1 }}>
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
                        âš–ï¸ðŸ“ Weight & Length not available for {babyCount === 2 ? 'twins' : 'triplets'}
                    </Text>
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

            {/* Build Button */}
            <TouchableOpacity
                style={[
                    styles.buildBtn,
                    { backgroundColor: C.bg },
                    (!canBuild || loading) && styles.btnDisabled
                ]}
                onPress={onBuild}
                disabled={!canBuild || loading}
            >
                <Text style={styles.buildText}>
                    {loading
                        ? '⏳ LOADING...'
                        : mode === 'baby'
                            ? '✨ BUILD MY BIRTH ANNOUNCEMENT'
                            : '✨ BUILD MY TIME CAPSULE GIFT'
                    }
                </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Main container - colored background  
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },

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

    // Build button
    buildBtn: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    buildText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 17,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    btnDisabled: { opacity: 0.5 },

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

    // Photo slots for multi-photo upload
    photoSlotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 8,
    },
    photoSlotContainer: {
        position: 'relative',
    },
    photoSlot: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoSlotFilled: {
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderColor: '#fff',
        borderStyle: 'solid',
    },
    photoSlotText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    photoRemoveBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoRemoveText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    photoHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
