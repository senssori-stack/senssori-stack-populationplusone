import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

const COLORS = [
    '#0066CC', '#0080FF', '#0099FF', '#00CCFF', '#00FFFF',
    '#1a472a', '#2d5a3d', '#3d7a4f', '#4CAF50', '#90EE90',
    '#FF1493', '#FF69B4', '#FFB6C1', '#DDA0DD', '#EE82EE',
    '#FF6B6B', '#FF0000', '#8B0000', '#FFA500', '#FFD700',
    '#2F4F4F', '#404040', '#696969', '#808080', '#A9A9A9',
];

type Baby = {
    first: string;
    middle: string;
    last: string;
    photoUri?: string | null;
};

export default function BabyAnnouncementFormScreen() {
    const { width } = useWindowDimensions();

    // Form state
    const [babyCount, setBabyCount] = useState<number>(1);
    const [babies, setBabies] = useState<Baby[]>([{ first: 'Emily', middle: 'Grace', last: 'Sample' }]);
    const [motherName, setMotherName] = useState('Sarah Sample');
    const [fatherName, setFatherName] = useState('Jack Sample');
    const [hometown, setHometown] = useState('Kansas City, MO');
    const [dobDate, setDobDate] = useState(new Date(2026, 1, 14));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weightLb, setWeightLb] = useState('7');
    const [weightOz, setWeightOz] = useState('4');
    const [lengthIn, setLengthIn] = useState('20');
    const [selectedColor, setSelectedColor] = useState('#1a472a');
    const frontOrientation = 'landscape'; // Only landscape supported
    const [loading, setLoading] = useState(false);

    // Message to Baby
    const SAMPLE_MESSAGES = [
        `Dear BABYNAME,\n\nThe day you were born was the most beautiful day of our lives. From the moment we first held you, we knew our world had changed forever. Mom and Dad promise to always protect you, provide for you, and love you with everything we have. You are our greatest blessing and we will spend every day making sure you know how loved you are.\n\nLove always,\nMom & Dad`,
        `To our precious BABYNAME,\n\nWe waited so long for you, and the moment you arrived, every dream we ever had came true. We promise to be there for every step, every smile, and every milestone. We will always keep you safe, guide you with love, and give you the world. No matter where life takes you, remember — you were wanted, you are cherished, and you will always be enough.\n\nWith all our love,\nMom & Dad`,
        `Sweet BABYNAME,\n\nOn the day you were born, the whole world got a little brighter. You are the answer to every prayer and the joy of our hearts. We promise to protect you, to provide for you, and to love you unconditionally — today, tomorrow, and forever. One day when you read this, we hope you know just how special that day was and how much you mean to us.\n\nAll our love,\nMom & Dad`,
    ];
    const babyDisplayName = babies[0]?.first?.trim() || 'Baby';
    const getSampleMessage = (idx: number) => SAMPLE_MESSAGES[idx].replace(/BABYNAME/g, babyDisplayName);
    const [messageToBaby, setMessageToBaby] = useState('');
    const [selectedMessageIdx, setSelectedMessageIdx] = useState<number | null>(null);

    const selectSampleMessage = (idx: number) => {
        setSelectedMessageIdx(idx);
        setMessageToBaby(getSampleMessage(idx));
    };

    // Update babies array when count changes
    useEffect(() => {
        const updated = [...babies];
        while (updated.length < babyCount) {
            updated.push({ first: '', middle: '', last: '' });
        }
        while (updated.length > babyCount) {
            updated.pop();
        }
        setBabies(updated);
    }, [babyCount]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDobDate(selectedDate);
        }
    };

    const pickPhoto = async (babyIndex: number) => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission required', 'Please allow access to your photo library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const updated = [...babies];
                updated[babyIndex].photoUri = result.assets[0].uri;
                setBabies(updated);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick photo');
        }
    };

    const removePhoto = (babyIndex: number) => {
        const updated = [...babies];
        updated[babyIndex].photoUri = null;
        setBabies(updated);
    };

    const updateBaby = (index: number, field: keyof Baby, value: string) => {
        const updated = [...babies];
        updated[index] = { ...updated[index], [field]: value };
        setBabies(updated);
    };

    const handleBuild = async () => {
        // Validation
        const hasBabyNames = babies.some(b => b.first.trim().length > 0);
        if (!hasBabyNames) {
            Alert.alert('Required', 'Please enter at least one baby first name');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Required', 'Please enter a hometown');
            return;
        }

        setLoading(true);
        // TODO: Fetch population data, create announcement, navigate to preview
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Building announcement...');
        }, 1000);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>POPULATION +1 Form Announcement</Text>

            {/* Baby Count Toggle */}
            <Text style={styles.label}>How many babies?</Text>
            <View style={styles.toggleGroup}>
                {(['Single', 'Twins', 'Triplets'] as const).map((label, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.toggleBtn, babyCount === idx + 1 && styles.toggleActive]}
                        onPress={() => setBabyCount(idx + 1)}
                    >
                        <Text style={[styles.toggleText, babyCount === idx + 1 && styles.toggleActiveText]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Baby Input Fields */}
            {babies.map((baby, idx) => (
                <View key={idx} style={styles.babySection}>
                    <Text style={styles.sectionTitle}>Baby {idx + 1}</Text>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="First name"
                        value={baby.first}
                        onChangeText={(text) => updateBaby(idx, 'first', text)}
                    />

                    <Text style={styles.label}>Middle Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Middle name"
                        value={baby.middle}
                        onChangeText={(text) => updateBaby(idx, 'middle', text)}
                    />

                    <Text style={styles.label}>Last Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        value={baby.last}
                        onChangeText={(text) => updateBaby(idx, 'last', text)}
                    />

                    <Text style={styles.label}>Photo (optional)</Text>
                    {baby.photoUri ? (
                        <TouchableOpacity style={styles.photoBtn} onPress={() => removePhoto(idx)}>
                            <Text style={styles.photoBtnText}>Remove Photo</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickPhoto(idx)}>
                            <Text style={styles.uploadBtnText}>📷 Upload Photo {idx + 1}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            {/* Parents */}
            <Text style={styles.label}>Mother's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Mother's name"
                value={motherName}
                onChangeText={setMotherName}
            />

            <Text style={styles.label}>Father's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Father's name"
                value={fatherName}
                onChangeText={setFatherName}
            />

            {/* Hometown */}
            <Text style={styles.label}>Hometown (City, State) — required</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Springfield, MO"
                value={hometown}
                onChangeText={setHometown}
            />

            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateBtnText}>{dobDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={dobDate} mode="date" display="default" onChange={handleDateChange} />
            )}

            {/* Measurements (only for single baby) */}
            {babyCount === 1 && (
                <>
                    <Text style={styles.label}>Weight (lbs)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 7"
                        value={weightLb}
                        onChangeText={setWeightLb}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Weight (oz)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 8"
                        value={weightOz}
                        onChangeText={setWeightOz}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Length (inches)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 20"
                        value={lengthIn}
                        onChangeText={setLengthIn}
                        keyboardType="numeric"
                    />
                </>
            )}

            {/* 💌 Message to Baby */}
            <View style={styles.messageSectionContainer}>
                <Text style={styles.messageSectionTitle}>💌 Message to {babyDisplayName}</Text>
                <Text style={styles.messageSectionSubtitle}>
                    Write a heartfelt message for {babyDisplayName} to read someday. Choose a sample below and make it your own, or write from scratch.
                </Text>

                {/* Sample Message Buttons */}
                <View style={styles.sampleBtnRow}>
                    {(['Sample 1', 'Sample 2', 'Sample 3'] as const).map((label, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.sampleBtn, selectedMessageIdx === idx && styles.sampleBtnActive]}
                            onPress={() => selectSampleMessage(idx)}
                        >
                            <Text style={[styles.sampleBtnText, selectedMessageIdx === idx && styles.sampleBtnTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Editable Message TextInput */}
                <TextInput
                    style={styles.messageInput}
                    placeholder={`Write your message to ${babyDisplayName} here...`}
                    placeholderTextColor="#999"
                    value={messageToBaby}
                    onChangeText={(text) => {
                        setMessageToBaby(text);
                        // If user edits, deselect the sample indicator
                        if (selectedMessageIdx !== null && text !== getSampleMessage(selectedMessageIdx)) {
                            setSelectedMessageIdx(null);
                        }
                    }}
                    multiline
                    textAlignVertical="top"
                />

                {messageToBaby.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearMessageBtn}
                        onPress={() => { setMessageToBaby(''); setSelectedMessageIdx(null); }}
                    >
                        <Text style={styles.clearMessageBtnText}>✕ Clear Message</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Color Picker */}
            <Text style={[styles.label, { textAlign: 'center' }]}>Background Color</Text>
            <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[styles.colorBox, { backgroundColor: color }, selectedColor === color && styles.colorBoxSelected]}
                        onPress={() => setSelectedColor(color)}
                    />
                ))}
            </View>

            {/* Build Button */}
            <TouchableOpacity style={styles.buildBtn} onPress={handleBuild} disabled={loading}>
                <Text style={styles.buildBtnText}>{loading ? 'Building...' : '🎉 Build Announcement'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a472a' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '900', marginBottom: 12, color: '#fff', textAlign: 'center' },
    populationHeader: { fontSize: 18, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 3, marginTop: 8, marginBottom: 2 },
    label: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 12, color: '#fff' },
    babySection: { marginBottom: 16 },
    uploadBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.5)',
    },
    uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    photoBtn: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    photoBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
    toggleActiveText: { color: '#1a472a' },
    dateBtn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dateBtnText: { fontSize: 16, color: '#333' },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    colorBox: { width: '18%', aspectRatio: 1, borderRadius: 8 },
    colorBoxSelected: { borderWidth: 3, borderColor: '#fff' },
    buildBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    buildBtnText: { color: '#1a472a', fontWeight: '900', fontSize: 18 },
    // Message to Baby styles
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
        color: '#1a472a',
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
