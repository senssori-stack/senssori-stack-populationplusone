import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import PhotoUploadGrid from '../../components/PhotoUploadGrid';
import SignFrontLandscape from '../../components/SignFrontLandscape';

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLOR_SCHEMES } from "../data/utils/colors";
import { getPopulationForCity } from '../data/utils/populations';
import type { RootStackParamList, ThemeName } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, "DeathAnnouncementForm">;

// Death notice message presets
const DEATH_MESSAGE_PRESETS = [
    {
        label: '🕊️ Loving Memory',
        text: (name: string) =>
            `In loving memory of ${name}. A beautiful soul who touched the lives of everyone they knew. Though you are gone from our sight, you will never be gone from our hearts. Rest in eternal peace.`,
    },
    {
        label: '🌹 Celebration of Life',
        text: (name: string) =>
            `Today we celebrate the extraordinary life of ${name}. Your kindness, laughter, and love enriched the lives of all who were blessed to know you. May your memory be a blessing to all who carry it.`,
    },
    {
        label: '✝️ Faith & Peace',
        text: (name: string) =>
            `${name} has been called home to rest in the arms of the Lord. "Blessed are those who mourn, for they shall be comforted." We find peace knowing you are at rest, and we will carry your light with us always.`,
    },
    {
        label: '🌅 Farewell',
        text: (name: string) =>
            `With heavy hearts, we announce the passing of ${name}. Your presence was a gift, your memory a treasure. You are loved beyond words and missed beyond measure. Until we meet again.`,
    },
    {
        label: '⭐ Legacy',
        text: (name: string) =>
            `${name} leaves behind a legacy of love, strength, and grace. The world was made brighter by your presence in it. Your spirit will live on in every life you touched. Gone from our arms, forever in our hearts.`,
    },
];

// Prayer/poem presets for memorial card back
const PRAYER_PRESETS = [
    {
        label: '🙏 Dearest Prayer',
        text: (name: string) =>
            `Pray for us O dearest ${name},\nTo Jesus Christ our King\nThat he may bless our lonely home\nWhere thou once dwelt therein\nAnd pray that God may give\nus strength\nTo bear our heavy cross;\nFor no one knows but only He\nThe treasure we have lost.`,
    },
    {
        label: '🕊️ Road of Suffering',
        text: (name: string) =>
            `Along the road of Suffering\nYou found a little lane;\nThat took you up to heaven,\nAnd ended all your pain.\nYou may be out of sight,\nWe may be worlds apart;\nBut you are always\nin our prayers,\nAnd forever in our hearts.\n\n— In memory of ${name}`,
    },
    {
        label: '🌹 A Void Filled',
        text: (name: string) =>
            `If my parting has left a void,\nthen fill it with remembered joys.\nA friendship shared, a laugh, a kiss,\nOh yes, these things I too will miss.\n\nBe not burdened with times of sorrow,\nlook for the sunrise of each tomorrow.\nMy life's been full, I've savored much,\ngood friends, good times,\na loved one's touch.\n\n— ${name}`,
    },
    {
        label: '✝️ God\'s Garden',
        text: (name: string) =>
            `God looked around his garden\nAnd found an empty place.\nHe then looked down upon the earth\nAnd saw your tired face.\n\nHe put his arms around you\nAnd lifted you to rest.\nGod's garden must be beautiful,\nHe always takes the best.\n\n— In loving memory of ${name}`,
    },
    {
        label: '☘️ Irish Blessing',
        text: (name: string) =>
            `May the road rise to meet you,\nMay the wind be always at your back,\nMay the sun shine warm upon your face,\nAnd until we meet again,\nMay God hold you in the palm of His hand.\n\n— For ${name}`,
    },
    {
        label: '💫 23rd Psalm',
        text: (name: string) =>
            `The Lord is my shepherd;\nI shall not want.\nHe maketh me to lie down\nin green pastures.\nHe leadeth me beside\nthe still waters.\nHe restoreth my soul.\n\nRest in peace, ${name}.`,
    },
    {
        label: '🌿 Do Not Weep',
        text: (name: string) =>
            `Do not stand at my grave and weep,\nI am not there, I do not sleep.\nI am a thousand winds that blow,\nI am the diamond glints on snow.\nI am the sunlight on ripened grain,\nI am the gentle autumn rain.\n\nIn memory of ${name}.`,
    },
    {
        label: '🕊️ Footprints',
        text: (name: string) =>
            `One night I dreamed a dream.\nAs I was walking along the beach\nwith my Lord.\nAcross the dark sky flashed\nscenes from my life.\nFor each scene, I noticed two sets\nof footprints in the sand.\nWhen the last scene of my life\nshot before me\nI looked back at the footprints\nin the sand.\n\n— For ${name}`,
    },
];

// Animated Color Box
const AnimatedColorBox = ({
    themeName,
    isSelected,
    onPress,
    glowAnim
}: {
    themeName: ThemeName;
    isSelected: boolean;
    onPress: () => void;
    glowAnim: Animated.Value;
}) => {
    const bgColor = COLOR_SCHEMES[themeName].bg;
    const glowScale = glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.15, 1],
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Animated.View
                style={{
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
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>-1</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function DeathAnnouncementFormScreen({ navigation }: Props) {
    const [theme, setTheme] = useState<ThemeName>("charcoal");
    const [nameGold, setNameGold] = useState(false);

    // Cascading glow animation for color palette
    const glowAnims = useRef(
        Array.from({ length: 25 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const runCascade = () => {
            glowAnims.forEach(anim => anim.setValue(0));
            const animations: Animated.CompositeAnimation[] = [];
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 5; row++) {
                    const index = row * 5 + col;
                    const delay = (col * 5 + row) * 80;
                    animations.push(
                        Animated.sequence([
                            Animated.delay(delay),
                            Animated.timing(glowAnims[index], { toValue: 1, duration: 400, useNativeDriver: true }),
                            Animated.timing(glowAnims[index], { toValue: 0, duration: 400, useNativeDriver: true }),
                        ])
                    );
                }
            }
            Animated.parallel(animations).start(() => setTimeout(runCascade, 2000));
        };
        runCascade();
    }, []);

    // Name fields
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");

    // Dates
    const [dobDate, setDobDate] = useState<Date>(new Date(1950, 0, 1));
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [dodDate, setDodDate] = useState<Date>(new Date());
    const [showDodPicker, setShowDodPicker] = useState(false);

    // Location
    const [hometown, setHometown] = useState("");

    // Service details
    const [serviceLocation, setServiceLocation] = useState("");
    const [serviceTime, setServiceTime] = useState("");

    // Photos
    const [photoUris, setPhotoUris] = useState<(string | null)[]>([null, null, null]);

    // Message
    const [message, setMessage] = useState("");

    // Prayer/Poem for memorial card back
    const [prayer, setPrayer] = useState("");

    // Population & loading
    const [population, setPopulation] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ firstName: false, hometown: false });

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const canBuild = firstName.trim().length > 0 && hometown.trim().length > 0;

    // Auto-fetch population when hometown changes
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!hometown.trim() || hometown.length < 3) return;
            try {
                setLoading(true);
                const dodISO = `${dodDate.getFullYear()}-${String(dodDate.getMonth() + 1).padStart(2, '0')}-${String(dodDate.getDate()).padStart(2, '0')}`;
                const cityPopulation = await getPopulationForCity(hometown, dodISO);
                setPopulation(cityPopulation);
            } catch (error) {
                console.warn('Population fetch error:', error);
            } finally {
                setLoading(false);
            }
        }, 800);
        return () => clearTimeout(timeoutId);
    }, [hometown, dodDate]);

    async function onBuild() {
        if (!firstName.trim() || !hometown.trim()) {
            setTouched({ firstName: true, hometown: true });
            alert("Please complete the required fields: First name and Hometown.");
            return;
        }

        let finalPopulation = population;
        if (!finalPopulation) {
            try {
                setLoading(true);
                const dodISO = `${dodDate.getFullYear()}-${String(dodDate.getMonth() + 1).padStart(2, '0')}-${String(dodDate.getDate()).padStart(2, '0')}`;
                finalPopulation = await getPopulationForCity(hometown.trim(), dodISO);
                setPopulation(finalPopulation);

                if (finalPopulation === null) {
                    Alert.alert(
                        'City Not Found',
                        'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST OR THE SPELLING IS INCORRECT.',
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
                        : 'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST OR THE SPELLING IS INCORRECT.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        }

        const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
        const dodISO = `${dodDate.getFullYear()}-${String(dodDate.getMonth() + 1).padStart(2, '0')}-${String(dodDate.getDate()).padStart(2, '0')}`;
        const personName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');

        navigation.navigate('Preview', {
            theme,
            hometown: hometown.trim(),
            dobISO: dodISO, // Use date of death for population routing
            photoUris: photoUris.filter(p => p !== null) as string[],
            personName,
            population: finalPopulation,
            isMemorial: true,
            dateOfDeath: dodISO,
            dateOfBirthOriginal: dobISO,
            memorialPrayer: prayer || undefined,
            babyCount: 1,
            mode: 'baby',
            frontOrientation: 'landscape',
            timeCapsuleOrientation: 'landscape',
            nameGold,
            jointLetter: message || undefined,
            serviceLocation: serviceLocation.trim() || undefined,
            serviceTime: serviceTime.trim() || undefined,
        });
    }

    const formatDate = (d: Date) =>
        `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;

    const { width: screenWidth } = useWindowDimensions();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Death Announcement</Text>
            <Text style={styles.subtitle}>Create a dignified memorial to share on social media</Text>

            {/* Name Section */}
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.flex, touched.firstName && !firstName.trim() && styles.inputError]}
                    placeholder="First *"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                    onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
                />
                <TextInput
                    style={[styles.input, styles.flex]}
                    placeholder="Middle"
                    placeholderTextColor="#999"
                    value={middleName}
                    onChangeText={setMiddleName}
                />
            </View>
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
            />

            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDobPicker(true)}>
                <Text style={styles.dateButtonText}>📅 {formatDate(dobDate)}</Text>
            </TouchableOpacity>
            {showDobPicker && (
                <DateTimePicker
                    value={dobDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selected) => {
                        setShowDobPicker(Platform.OS === 'ios');
                        if (selected) setDobDate(selected);
                    }}
                    maximumDate={new Date()}
                />
            )}

            {/* Date of Passing */}
            <Text style={styles.label}>Date of Passing</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDodPicker(true)}>
                <Text style={styles.dateButtonText}>🕊️ {formatDate(dodDate)}</Text>
            </TouchableOpacity>
            {showDodPicker && (
                <DateTimePicker
                    value={dodDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selected) => {
                        setShowDodPicker(Platform.OS === 'ios');
                        if (selected) setDodDate(selected);
                    }}
                    maximumDate={new Date()}
                />
            )}

            {/* Hometown */}
            <Text style={styles.label}>Hometown *</Text>
            <TextInput
                style={[styles.input, touched.hometown && !hometown.trim() && styles.inputError]}
                placeholder="City, State (e.g., Springfield, IL)"
                placeholderTextColor="#999"
                value={hometown}
                onChangeText={(t) => setHometown(t.toUpperCase())}
                autoCapitalize="characters"
                onBlur={() => setTouched(t => ({ ...t, hometown: true }))}
            />
            {loading && <Text style={styles.loadingText}>Looking up population...</Text>}
            {population !== null && (
                <Text style={styles.populationText}>Population: {population.toLocaleString()}</Text>
            )}

            {/* Service Location */}
            <Text style={styles.label}>Location of Services</Text>
            <TextInput
                style={styles.input}
                placeholder="Church, funeral home, or venue name & address"
                placeholderTextColor="#999"
                value={serviceLocation}
                onChangeText={setServiceLocation}
            />

            {/* Service Time */}
            <Text style={styles.label}>Time of Services</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Saturday, March 22 at 11:00 AM"
                placeholderTextColor="#999"
                value={serviceTime}
                onChangeText={setServiceTime}
            />

            {/* Photo Upload */}
            <Text style={styles.label}>Photo</Text>
            <Text style={styles.hint}>Upload a photo of your loved one</Text>
            <PhotoUploadGrid
                photos={photoUris}
                onPhotosChange={setPhotoUris}
                maxPhotos={1}
            />

            {/* Death Notice Message */}
            <View style={styles.messageSectionContainer}>
                <Text style={styles.messageSectionTitle}>🕊️ Memorial Message</Text>
                <Text style={styles.messageSectionSubtitle}>
                    Choose a preset message or write your own heartfelt tribute
                </Text>

                <View style={styles.presetRow}>
                    {DEATH_MESSAGE_PRESETS.map((preset, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.presetBtn}
                            onPress={() => setMessage(preset.text(fullName || 'your loved one'))}
                        >
                            <Text style={styles.presetBtnText}>{preset.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.messageInput}
                    placeholder="Write a memorial message..."
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* Prayer/Poem for Memorial Card Back */}
            <View style={styles.messageSectionContainer}>
                <Text style={styles.messageSectionTitle}>🙏 Card Prayer / Poem</Text>
                <Text style={styles.messageSectionSubtitle}>
                    This will appear on the back of the memorial card
                </Text>

                <View style={styles.presetRow}>
                    {PRAYER_PRESETS.map((preset, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.presetBtn}
                            onPress={() => setPrayer(preset.text(fullName || 'your loved one'))}
                        >
                            <Text style={styles.presetBtnText}>{preset.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.messageInput}
                    placeholder="Write a prayer or poem..."
                    placeholderTextColor="#999"
                    value={prayer}
                    onChangeText={setPrayer}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* Gift / Send Money Section */}
            <View style={styles.messageSectionContainer}>
                <Text style={styles.messageSectionTitle}>💝 Send Gifts or Donations</Text>
                <Text style={styles.messageSectionSubtitle}>
                    Help the family with funeral expenses. Gift cards with cash are available after the announcement is created.
                </Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginTop: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 }}>After you build the announcement:</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>• Tap the 🎁 Gift tile to send a gift card</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>• Share the announcement with family & friends</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>• Recipients can send cash donations via gift card to help with services</Text>
                </View>
            </View>

            {/* Color Picker */}
            <Text style={[styles.label, { textAlign: 'center', marginTop: 20 }]}>Background Color</Text>
            <Text style={styles.hint}>Choose your announcement color (text will be white)</Text>

            <View style={{ alignSelf: 'center', marginTop: 12 }}>
                <View style={{ gap: 6 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map((t, i) => (
                            <AnimatedColorBox key={t} themeName={t} isSelected={theme === t} onPress={() => setTheme(t)} glowAnim={glowAnims[0 * 5 + i]} />
                        ))}
                    </View>
                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map((t, i) => (
                            <AnimatedColorBox key={t} themeName={t} isSelected={theme === t} onPress={() => setTheme(t)} glowAnim={glowAnims[1 * 5 + i]} />
                        ))}
                    </View>
                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map((t, i) => (
                            <AnimatedColorBox key={t} themeName={t} isSelected={theme === t} onPress={() => setTheme(t)} glowAnim={glowAnims[2 * 5 + i]} />
                        ))}
                    </View>
                    {/* Row 4 - Warm */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map((t, i) => (
                            <AnimatedColorBox key={t} themeName={t} isSelected={theme === t} onPress={() => setTheme(t)} glowAnim={glowAnims[3 * 5 + i]} />
                        ))}
                    </View>
                    {/* Row 5 - Neutrals */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map((t, i) => (
                            <AnimatedColorBox key={t} themeName={t} isSelected={theme === t} onPress={() => setTheme(t)} glowAnim={glowAnims[4 * 5 + i]} />
                        ))}
                    </View>
                </View>
            </View>

            {/* Name Style Toggle */}
            <Text style={[styles.label, { textAlign: 'center', marginTop: 20 }]}>Name Style</Text>
            <View style={styles.nameStyleRow}>
                <TouchableOpacity
                    style={[styles.nameStyleBtn, !nameGold && styles.nameStyleBtnActive]}
                    onPress={() => setNameGold(false)}
                >
                    <Text style={[styles.nameStyleText, !nameGold && styles.nameStyleTextActive]}>White</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.nameStyleBtn, nameGold && styles.nameStyleBtnActive]}
                    onPress={() => setNameGold(true)}
                >
                    <Text style={[styles.nameStyleText, nameGold && { color: '#FFD700', fontWeight: '900' }]}>Gold</Text>
                </TouchableOpacity>
            </View>

            {/* Preview — uses same SignFrontLandscape as the birthday preview page */}
            <View style={{ alignItems: 'center', marginTop: 24 }}>
                <SignFrontLandscape
                    theme={theme}
                    previewScale={screenWidth * 0.85 / 3300}
                    photoUris={photoUris.filter((p): p is string => !!p)}
                    hometown={hometown.trim() || 'CITY, ST'}
                    population={population ?? undefined}
                    personName={fullName.toUpperCase() || 'FULL NAME'}
                    isMemorial
                    nameGold={nameGold}
                    dateOfBirthOriginal={`${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`}
                    dateOfDeath={`${dodDate.getFullYear()}-${String(dodDate.getMonth() + 1).padStart(2, '0')}-${String(dodDate.getDate()).padStart(2, '0')}`}
                />
            </View>

            {/* Build Button */}
            <TouchableOpacity
                style={[styles.buildButton, !canBuild && styles.buildButtonDisabled]}
                onPress={onBuild}
                disabled={!canBuild || loading}
            >
                <Text style={styles.buildButtonText}>
                    {loading ? 'Loading...' : '🕊️ Create Memorial'}
                </Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    content: { padding: 20, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 6 },
    hint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textAlign: 'center' },
    row: { flexDirection: 'row', gap: 8 },
    flex: { flex: 1 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#222',
        marginBottom: 8,
    },
    inputError: { borderWidth: 2, borderColor: '#ff4444' },
    dateButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 8,
    },
    dateButtonText: { fontSize: 16, color: '#fff' },
    loadingText: { fontSize: 12, color: '#64b5f6', marginTop: 4 },
    populationText: { fontSize: 13, color: '#4ade80', marginTop: 4, fontWeight: '600' },
    messageSectionContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    messageSectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
    messageSectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    presetBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    presetBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
    messageInput: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#222',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    nameStyleRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 },
    nameStyleBtn: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    nameStyleBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: '#fff' },
    nameStyleText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    nameStyleTextActive: { color: '#fff', fontWeight: '800' },

    buildButton: {
        backgroundColor: '#000080',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 24,
    },
    buildButtonDisabled: { opacity: 0.4 },
    buildButtonText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
