import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    useWindowDimensions,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

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
    const [babies, setBabies] = useState<Baby[]>([{ first: '', middle: '', last: '' }]);
    const [motherName, setMotherName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [hometown, setHometown] = useState('');
    const [dobDate, setDobDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weightLb, setWeightLb] = useState('');
    const [weightOz, setWeightOz] = useState('');
    const [lengthIn, setLengthIn] = useState('');
    const [selectedColor, setSelectedColor] = useState('#1a472a');
    const frontOrientation = 'landscape'; // Only landscape supported
    const [loading, setLoading] = useState(false);

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
            <Text style={styles.title}>+1 New Baby Announcement</Text>

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

            {/* Color Picker */}
            <Text style={styles.label}>Background Color</Text>
            <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[styles.colorBox, { backgroundColor: color }, selectedColor === color && styles.colorBoxSelected]}
                        onPress={() => setSelectedColor(color)}
                    />
                ))}
            </View>

            {/* Layout Options */}
            <Text style={styles.label}>Front Layout</Text>
            <View style={styles.toggleGroup}>

            </View>

            {/* Build Button */}
            <TouchableOpacity style={styles.buildBtn} onPress={handleBuild} disabled={loading}>
                <Text style={styles.buildBtnText}>{loading ? 'Building...' : '🎉 Build Announcement'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '900', marginBottom: 20, color: '#333' },
    label: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 12, color: '#333' },
    babySection: { marginBottom: 20 },
    uploadBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    photoBtn: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    photoBtnText: { color: '#fff', fontWeight: '700' },
    toggleGroup: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#ddd',
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: '#007AFF' },
    toggleText: { fontWeight: '700', color: '#333' },
    toggleActiveText: { color: '#fff' },
    dateBtn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dateBtnText: { fontSize: 14, color: '#333' },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    colorBox: { width: '18%', aspectRatio: 1, borderRadius: 8 },
    colorBoxSelected: { borderWidth: 3, borderColor: '#333' },
    buildBtn: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buildBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
