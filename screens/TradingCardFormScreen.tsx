import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PhotoUploadGrid from '../components/PhotoUploadGrid';
import ScrollableDatePicker from '../components/ScrollableDatePicker';
import { formatHeritageDisplay, HERITAGE_OPTIONS } from '../constants/heritage';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { getPopulationForCity } from '../src/data/utils/populations';
import type { RootStackParamList, ThemeName } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TradingCardForm'>;

function AnimatedColorBox({ themeName, isSelected, onPress, glowAnim }: {
    themeName: ThemeName; isSelected: boolean; onPress: () => void; glowAnim: Animated.Value;
}) {
    const scheme = COLOR_SCHEMES[themeName];
    const bg = scheme?.bg || '#888';
    const glowOpacity = Animated.multiply(glowAnim, isSelected ? 0 : 0.5);
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Animated.View style={{
                width: 44, height: 44, borderRadius: 22, backgroundColor: bg,
                borderWidth: isSelected ? 3 : 1,
                borderColor: isSelected ? '#FFD700' : 'rgba(255,255,255,0.3)',
                shadowColor: '#FFD700', shadowOpacity: isSelected ? 0.8 : 0,
                shadowRadius: 8, elevation: isSelected ? 10 : 0,
                opacity: Animated.add(1, Animated.multiply(glowOpacity, -0.3)),
            }}>
                {isSelected && (
                    <View style={{
                        position: 'absolute', top: -2, right: -2, width: 16, height: 16,
                        borderRadius: 8, backgroundColor: '#FFD700',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Text style={{ fontSize: 10, color: '#000', fontWeight: '900' }}>✓</Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function TradingCardFormScreen({ navigation }: Props) {
    // Form state
    const [personName, setPersonName] = useState('');
    const [photos, setPhotos] = useState<(string | null)[]>([null]);
    const [hometown, setHometown] = useState('');
    const [selectedHeritages, setSelectedHeritages] = useState<string[]>([]);
    const [showHeritageModal, setShowHeritageModal] = useState(false);
    const [nationality, setNationality] = useState('');
    const [dobDate, setDobDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weightLb, setWeightLb] = useState('');
    const [weightOz, setWeightOz] = useState('');
    const [lengthIn, setLengthIn] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [weightLbs, setWeightLbs] = useState('');
    const [selectedColor, setSelectedColor] = useState<ThemeName>('royalBlue');

    // Born before Jan 1, 2020 = adult/older kid stats format
    const isBaby = dobDate >= new Date(2020, 0, 1);
    const [nameGold, setNameGold] = useState(true);
    const [loading, setLoading] = useState(false);

    // Cascading glow animation
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
            Animated.parallel(animations).start(() => { setTimeout(runCascade, 2000); });
        };
        runCascade();
    }, []);

    const handlePreview = async () => {
        if (!personName.trim()) {
            Alert.alert('Missing Information', 'Please enter their name.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the hometown (City, State).');
            return;
        }

        setLoading(true);
        const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;

        try {
            const pop = await getPopulationForCity(hometown.trim(), dobISO);

            if (pop === null) {
                Alert.alert(
                    'City Not Found',
                    'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // For babies: pass raw lb/oz and inches
            // For adults: pass formatted height and weight as strings
            const finalWeightLb = isBaby ? (weightLb.trim() || undefined) : (weightLbs.trim() || undefined);
            const finalWeightOz = isBaby ? (weightOz.trim() || undefined) : undefined;
            const finalLengthIn = isBaby
                ? (lengthIn.trim() || undefined)
                : (heightFt.trim() || heightIn.trim())
                    ? `${heightFt.trim() || '0'}'${heightIn.trim() || '0'}"`
                    : undefined;

            navigation.navigate('BaseballCardPreview', {
                theme: selectedColor,
                personName: personName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                heritage: formatHeritageDisplay(selectedHeritages) || undefined,
                nationality: nationality.trim() || undefined,
                dobISO,
                weightLb: finalWeightLb,
                weightOz: finalWeightOz,
                lengthIn: finalLengthIn,
                mode: 'milestone',
                population: pop,
                nameGold,
            });
        } catch (error) {
            console.error('Error fetching population:', error);
            const err = error as Error;
            const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Network') || err.message?.includes('timeout');
            Alert.alert(
                isNetworkError ? 'Network Error' : 'City Not Found',
                isNetworkError
                    ? 'Unable to connect to population database. Please check your internet connection and try again.'
                    : 'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const themes: ThemeName[] = [
        'lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal',
        'darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen',
        'lavender', 'hotPink', 'rose', 'purple', 'violet',
        'coral', 'red', 'maroon', 'orange', 'gold',
        'charcoal', 'slate', 'gray', 'silver', 'lightGray',
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚾ Trading Card Creator</Text>
            <Text style={styles.subtitle}>
                Create a collectible baseball-style trading card for anyone — babies, kids, adults, or anyone special!
            </Text>

            {/* Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={personName}
                onChangeText={setPersonName}
                placeholder="Enter full name"
                placeholderTextColor="#999"
            />

            {/* Heritage */}
            <Text style={styles.label}>Heritage (optional)</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowHeritageModal(true)}
            >
                <Text style={selectedHeritages.length > 0 ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {selectedHeritages.length > 0 ? formatHeritageDisplay(selectedHeritages) : 'Select 1–4 heritages...'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Heritage Multi-Select Modal */}
            <Modal visible={showHeritageModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Heritage(s)</Text>
                        <Text style={styles.modalSubtitle}>Represent your bloodlines — pick 1 to 4</Text>
                        <Text style={styles.heritageCounter}>{selectedHeritages.length} / 4 selected</Text>
                        <ScrollView style={styles.modalScroll}>
                            {HERITAGE_OPTIONS.map(option => {
                                const isSelected = selectedHeritages.includes(option.id);
                                const atLimit = selectedHeritages.length >= 4 && !isSelected;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.modalOption,
                                            isSelected && styles.modalOptionSelected,
                                            atLimit && styles.modalOptionDisabled,
                                        ]}
                                        onPress={() => {
                                            if (atLimit) return;
                                            setSelectedHeritages(prev =>
                                                isSelected
                                                    ? prev.filter(id => id !== option.id)
                                                    : [...prev, option.id]
                                            );
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalOptionText,
                                            isSelected && styles.modalOptionTextSelected,
                                            atLimit && styles.modalOptionTextDisabled,
                                        ]}>
                                            {option.symbol}  {option.label}
                                        </Text>
                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {selectedHeritages.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedHeritages([])}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.modalDone} onPress={() => setShowHeritageModal(false)}>
                            <Text style={styles.modalDoneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Nationality */}
            <Text style={styles.label}>Nationality (optional)</Text>
            <TextInput
                style={styles.input}
                value={nationality}
                onChangeText={setNationality}
                placeholder="e.g. American"
                placeholderTextColor="#999"
            />

            {/* Hometown */}
            <Text style={styles.label}>Hometown (City, State)</Text>
            <TextInput
                style={styles.input}
                value={hometown}
                onChangeText={setHometown}
                placeholder="e.g. St. Louis, MO"
                placeholderTextColor="#999"
            />

            {/* Birth Date */}
            <Text style={styles.label}>Birth Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{`${dobDate.getMonth() + 1}/${dobDate.getDate()}/${dobDate.getFullYear()}`}</Text>
            </TouchableOpacity>
            <ScrollableDatePicker
                visible={showDatePicker}
                date={dobDate}
                onDateChange={(date) => setDobDate(date)}
                onClose={() => setShowDatePicker(false)}
                title="Birth Date"
            />

            {/* Photos */}
            <PhotoUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={1}
                label="Photo (Optional)"
            />

            {/* Weight & Height/Length (optional) */}
            <Text style={styles.label}>Stats (optional{isBaby ? ' — great for babies!' : ''})</Text>
            {isBaby ? (
                <View style={styles.statsRow}>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Weight (lb)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={weightLb}
                            onChangeText={setWeightLb}
                            placeholder="7"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Weight (oz)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={weightOz}
                            onChangeText={setWeightOz}
                            placeholder="8"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Length (in)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={lengthIn}
                            onChangeText={setLengthIn}
                            placeholder="20"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.statsRow}>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Height (ft)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={heightFt}
                            onChangeText={setHeightFt}
                            placeholder="5"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Height (in)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={heightIn}
                            onChangeText={setHeightIn}
                            placeholder="10"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.statField}>
                        <Text style={styles.statLabel}>Weight (lbs)</Text>
                        <TextInput
                            style={styles.statInput}
                            value={weightLbs}
                            onChangeText={setWeightLbs}
                            placeholder="165"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            )}

            {/* Color Selection */}
            <Text style={styles.label}>Card Color</Text>
            <View style={styles.colorGrid}>
                {themes.map((themeName, index) => (
                    <AnimatedColorBox
                        key={themeName}
                        themeName={themeName}
                        isSelected={selectedColor === themeName}
                        onPress={() => setSelectedColor(themeName)}
                        glowAnim={glowAnims[index]}
                    />
                ))}
            </View>

            {/* Name Style */}
            <Text style={styles.label}>Name Style</Text>
            <View style={styles.toggleGroup}>
                <TouchableOpacity
                    style={[styles.toggleBtn, !nameGold && styles.toggleActive]}
                    onPress={() => setNameGold(false)}
                >
                    <Text style={[styles.toggleText, !nameGold && styles.toggleActiveText]}>White</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, nameGold && { backgroundColor: '#FFD700' }]}
                    onPress={() => setNameGold(true)}
                >
                    <Text style={[styles.toggleText, nameGold && { color: '#333' }]}>✨ Gold</Text>
                </TouchableOpacity>
            </View>

            {/* Preview Button */}
            <TouchableOpacity
                style={[styles.previewButton, loading && styles.previewButtonDisabled]}
                onPress={handlePreview}
                disabled={loading}
            >
                <Text style={styles.previewButtonText}>
                    {loading ? 'Loading...' : '⚾ Preview Trading Card'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000080' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '900', marginBottom: 4, color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 16, fontWeight: '600' },
    label: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
    dropdown: { backgroundColor: '#fff', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownText: { fontSize: 16, color: '#333' },
    dropdownPlaceholder: { fontSize: 16, color: '#999' },
    dropdownArrow: { fontSize: 12, color: '#666' },
    dateButton: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
    dateText: { fontSize: 16, color: '#333' },
    statsRow: { flexDirection: 'row', gap: 10 },
    statField: { flex: 1 },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
    statInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, color: '#333', textAlign: 'center' },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    toggleGroup: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
    toggleActive: { backgroundColor: '#fff' },
    toggleText: { fontWeight: '700', color: '#fff', fontSize: 14 },
    toggleActiveText: { color: '#333' },
    previewButton: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 24, alignItems: 'center' },
    previewButtonDisabled: { opacity: 0.6 },
    previewButtonText: { color: '#000080', fontSize: 18, fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%', maxHeight: '70%' },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#333', textAlign: 'center', marginBottom: 16 },
    modalSubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 4 },
    heritageCounter: { fontSize: 13, fontWeight: '700', color: '#000080', textAlign: 'center', marginBottom: 10 },
    modalScroll: { maxHeight: 300 },
    modalOption: { padding: 14, borderRadius: 8, marginBottom: 8, backgroundColor: '#f5f5f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalOptionSelected: { backgroundColor: '#000080' },
    modalOptionDisabled: { opacity: 0.35 },
    modalOptionText: { fontSize: 16, color: '#333', flex: 1 },
    modalOptionTextSelected: { color: '#fff' },
    modalOptionTextDisabled: { color: '#bbb' },
    checkmark: { fontSize: 18, color: '#fff', fontWeight: '900' },
    clearButton: { marginTop: 8, padding: 10, alignItems: 'center' },
    clearButtonText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
    modalDone: { marginTop: 8, padding: 14, backgroundColor: '#000080', borderRadius: 8, alignItems: 'center' },
    modalDoneText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
