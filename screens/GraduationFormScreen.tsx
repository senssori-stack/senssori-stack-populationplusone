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
    useWindowDimensions,
    View,
} from 'react-native';
import PhotoUploadGrid from '../components/PhotoUploadGrid';
import ScrollableDatePicker from '../components/ScrollableDatePicker';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { getPopulationForCity } from '../src/data/utils/populations';
import type { RootStackParamList, ThemeName } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GraduationForm'>;

const GRADUATION_OPTIONS = [
    { id: 'highschool', label: '🎓 High School Graduation', emoji: '🎓' },
    { id: 'college', label: '🎓 College Graduation', emoji: '🎓' },
    { id: 'tradeschool', label: '🛠️ Technical/Trade School Graduation', emoji: '🛠️' },
    { id: 'masters', label: '📚 Master\'s Degree', emoji: '📚' },
    { id: 'doctorate', label: '🎓 Doctorate/PhD', emoji: '🎓' },
    { id: 'medical', label: '⚕️ Medical School Graduation', emoji: '⚕️' },
    { id: 'law', label: '⚖️ Law School Graduation', emoji: '⚖️' },
];

const MESSAGES: Record<string, { classic: string; celebration: string; heartfelt: string }> = {
    highschool: {
        classic: 'Congratulations on your high school graduation, {fullName}! This is just the beginning of an incredible journey. The world is full of opportunities waiting for you.',
        celebration: '{fullName} did it! High school is officially in the rearview mirror. Time to celebrate this amazing achievement and get ready for the exciting adventures ahead!',
        heartfelt: 'What an incredible milestone for {fullName}! All the hard work, dedication, and late nights have paid off. We are so proud of everything you have accomplished. The best is yet to come!',
    },
    college: {
        classic: 'Congratulations on your college graduation, {fullName}! Years of hard work and determination have led to this proud moment. Your future is bright and full of endless possibilities.',
        celebration: '{fullName} made it! College is complete and a whole new chapter is about to begin. Time to celebrate this huge accomplishment and all the success that lies ahead!',
        heartfelt: 'This diploma represents so much more than a degree for {fullName}. It represents perseverance, growth, and countless sacrifices. We could not be more proud of this achievement.',
    },
    tradeschool: {
        classic: 'Congratulations on completing your trade/technical program, {fullName}! Your dedication to your craft is inspiring. The skills you\'ve gained will serve you well throughout your career.',
        celebration: '{fullName} is a certified pro! All that hands-on training and hard work has paid off. Time to celebrate this achievement and show the world what you can do!',
        heartfelt: 'We are so proud of {fullName} for completing this program. The commitment to learning a valuable trade takes real dedication. Your future in this field is bright!',
    },
    masters: {
        classic: 'Congratulations on earning your Master\'s degree, {fullName}! This advanced achievement reflects your dedication to excellence and continued learning.',
        celebration: '{fullName} is now a Master! All those research papers, late nights, and hard work have culminated in this incredible achievement. Time to celebrate!',
        heartfelt: 'Earning a Master\'s degree is no small feat. {fullName}, your commitment to advancing your education and expertise is truly inspiring. We couldn\'t be prouder!',
    },
    doctorate: {
        classic: 'Congratulations, Dr. {fullName}! Earning a doctorate is one of the highest academic achievements possible. Your dedication to research and knowledge is remarkable.',
        celebration: 'Call them Doctor! {fullName} has reached the pinnacle of academic achievement. All those years of research, writing, and dedication have paid off spectacularly!',
        heartfelt: 'The journey to a doctorate is long and challenging, but {fullName} persevered. This achievement represents countless hours of work and unwavering dedication. We are beyond proud!',
    },
    medical: {
        classic: 'Congratulations, Dr. {fullName}! Your journey through medical school has prepared you to help heal and save lives. The world is lucky to have you as a physician.',
        celebration: 'The doctor is IN! {fullName} has completed medical school and is ready to change lives. What an incredible accomplishment worthy of celebration!',
        heartfelt: 'Medical school is one of the most challenging paths, and {fullName} conquered it. Your commitment to healing others is a gift to the world. We are so incredibly proud!',
    },
    law: {
        classic: 'Congratulations on graduating from law school, {fullName}! Your dedication to justice and the law will serve you well as you embark on your legal career.',
        celebration: '{fullName} passed the bar... well, law school at least! Time to celebrate this major milestone on the path to becoming a legal professional!',
        heartfelt: 'Law school demands excellence and {fullName} delivered. Your commitment to understanding and upholding the law is admirable. We couldn\'t be more proud!',
    },
};

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
                style={[{
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
                }]}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

type MessageKey = 'classic' | 'celebration' | 'heartfelt';

export default function GraduationFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state - Prefilled with sample data
    const [selectedGraduation, setSelectedGraduation] = useState<string>('highschool');
    const [showGraduationModal, setShowGraduationModal] = useState(false);
    const [personName, setPersonName] = useState('Jessica Sample Doe');
    const [schoolName, setSchoolName] = useState('Sample High School');
    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
    const [hometown, setHometown] = useState('Bellefontaine Neighbors, MO');
    const [dobDate, setDobDate] = useState<Date>(new Date(2026, 1, 4)); // Feb 4, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('navyBlue');
    const [loading, setLoading] = useState(false);
    const [population, setPopulation] = useState<number | null>(null);

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
                setTimeout(runCascade, 2000);
            });
        };

        runCascade();
    }, []);

    const getSelectedGraduationLabel = () => {
        const found = GRADUATION_OPTIONS.find(opt => opt.id === selectedGraduation);
        return found ? found.label : 'Select Graduation Type';
    };

    const getFormattedMessage = () => {
        const messages = MESSAGES[selectedGraduation] || MESSAGES.highschool;
        let template = messages[selectedMessage] || messages.classic;

        const nameParts = personName.trim().split(' ');
        const firstName = nameParts[0] || 'Graduate';
        const fullName = personName.trim() || 'Graduate';

        return template
            .replace(/{fullName}/g, fullName)
            .replace(/{firstName}/g, firstName)
            .replace(/{name}/g, fullName);
    };

    useEffect(() => {
        if (!messageWasEdited) {
            setEditableMessage(getFormattedMessage());
        }
    }, [personName, selectedGraduation, selectedMessage]);

    const handlePreview = async () => {
        if (!personName.trim()) {
            Alert.alert('Missing Information', 'Please enter the graduate\'s name.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the hometown.');
            return;
        }

        setLoading(true);
        const finalMessage = editableMessage + ' Here is some interesting information surrounding your graduation.';
        try {
            const pop = await getPopulationForCity(hometown.trim());
            setPopulation(pop);

            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: personName.trim(),
                motherName: personName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: dobDate.toISOString(),
                mode: 'milestone',
                message: finalMessage,
                population: pop || undefined,
            });
        } catch (error) {
            console.error('Error fetching population:', error);
            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: personName.trim(),
                motherName: personName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: dobDate.toISOString(),
                mode: 'milestone',
                message: finalMessage,
            });
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
            <Text style={styles.title}>Graduation Announcement</Text>

            {/* Graduation Type Dropdown */}
            <Text style={styles.label}>Graduation Type</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowGraduationModal(true)}
            >
                <Text style={styles.dropdownText}>{getSelectedGraduationLabel()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Graduation Type Modal */}
            <Modal visible={showGraduationModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Graduation Type</Text>
                        <ScrollView style={styles.modalScroll}>
                            {GRADUATION_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.modalOption,
                                        selectedGraduation === option.id && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedGraduation(option.id);
                                        setShowGraduationModal(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowGraduationModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Graduate's Name */}
            <Text style={styles.label}>Graduate's Name</Text>
            <TextInput
                style={styles.input}
                value={personName}
                onChangeText={setPersonName}
                placeholder="Enter graduate's full name"
                placeholderTextColor="#999"
            />

            {/* School Name */}
            <Text style={styles.label}>School/Institution Name (Optional)</Text>
            <TextInput
                style={styles.input}
                value={schoolName}
                onChangeText={setSchoolName}
                placeholder="e.g. University of Missouri"
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

            {/* Graduation Date */}
            <Text style={styles.label}>Graduation Date</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {dobDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            <ScrollableDatePicker
                visible={showDatePicker}
                date={dobDate}
                onDateChange={(date) => setDobDate(date)}
                onClose={() => setShowDatePicker(false)}
                title="Graduation Date"
            />

            {/* Photos - Up to 3 */}
            <PhotoUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={3}
                label="Graduation Photos (Optional - up to 3)"
            />

            {/* Message Style */}
            <Text style={styles.label}>Message Style</Text>
            <View style={styles.messageButtons}>
                {(['classic', 'celebration', 'heartfelt'] as MessageKey[]).map(key => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.messageButton,
                            selectedMessage === key && styles.messageButtonSelected
                        ]}
                        onPress={() => {
                            setSelectedMessage(key);
                            setMessageWasEdited(false);
                        }}
                    >
                        <Text style={[
                            styles.messageButtonText,
                            selectedMessage === key && styles.messageButtonTextSelected
                        ]}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Editable Message */}
            <Text style={styles.label}>Message (Editable)</Text>
            <TextInput
                style={[styles.input, styles.messageInput]}
                value={editableMessage}
                onChangeText={(text) => {
                    setEditableMessage(text);
                    setMessageWasEdited(true);
                }}
                multiline
                numberOfLines={4}
                placeholder="Your graduation message..."
                placeholderTextColor="#999"
            />

            {/* Color Selection */}
            <Text style={styles.label}>Theme Color</Text>
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

            {/* Preview Button */}
            <TouchableOpacity
                style={[styles.previewButton, loading && styles.previewButtonDisabled]}
                onPress={handlePreview}
                disabled={loading}
            >
                <Text style={styles.previewButtonText}>
                    {loading ? 'Loading...' : 'Preview Graduation Time Capsule'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a3a5c',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
        color: '#fff',
        textAlign: 'center',
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    messageInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
    },
    dateButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    photoButton: {
        backgroundColor: '#2d5078',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        borderStyle: 'dashed',
    },
    photoButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    messageButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    messageButton: {
        flex: 1,
        backgroundColor: '#2d5078',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    messageButtonSelected: {
        backgroundColor: '#fff',
    },
    messageButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    messageButtonTextSelected: {
        color: '#1a3a5c',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    previewButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        alignItems: 'center',
    },
    previewButtonDisabled: {
        opacity: 0.6,
    },
    previewButtonText: {
        color: '#1a3a5c',
        fontSize: 18,
        fontWeight: '900',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '85%',
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalScroll: {
        maxHeight: 300,
    },
    modalOption: {
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    modalOptionSelected: {
        backgroundColor: '#1a3a5c',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalClose: {
        marginTop: 16,
        padding: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#666',
        fontSize: 16,
    },
});
