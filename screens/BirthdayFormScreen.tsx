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

type Props = NativeStackScreenProps<RootStackParamList, 'BirthdayForm'>;

const BIRTHDAY_OPTIONS = [
    { id: 'birthday', label: '🎂 General Birthday', emoji: '🎂' },
    { id: 'sweet16', label: '🎀 Sweet 16th Birthday', emoji: '🎀' },
    { id: '21st', label: '🍾 21st Birthday', emoji: '🍾' },
    { id: 'overthehill', label: '⛰️ Over The Hill Birthday', emoji: '⛰️' },
    { id: '30th', label: '🎉 30th Birthday', emoji: '🎉' },
    { id: '40th', label: '🎊 40th Birthday', emoji: '🎊' },
    { id: '50th', label: '🥳 50th Birthday', emoji: '🥳' },
    { id: '60th', label: '🎈 60th Birthday', emoji: '🎈' },
    { id: '70th', label: '🎂 70th Birthday', emoji: '🎂' },
    { id: '80th', label: '🎁 80th Birthday', emoji: '🎁' },
    { id: '90th', label: '🌟 90th Birthday', emoji: '🌟' },
    { id: '100th', label: '💯 100th Birthday', emoji: '💯' },
];

const MESSAGES: Record<string, { classic: string; celebration: string; heartfelt: string }> = {
    birthday: {
        classic: 'Wishing {fullName} a year filled with belly laughs, surprise adventures, and way too much cake! {firstName} deserves every bit of happiness coming their way.',
        celebration: 'Another trip around the sun and {fullName} is still the coolest person we know! Here\'s to more inside jokes, spontaneous dance parties, and making memories we\'ll laugh about forever.',
        heartfelt: 'On this special day, we celebrate the amazing person {fullName} is. Their kindness, humor, and love light up our lives. We\'re so grateful {firstName} was born!',
    },
    sweet16: {
        classic: 'Sweet 16 and absolutely fabulous! This is {fullName}\'s year to shine, dream big, and make every moment count. The world is so lucky to have {firstName} in it!',
        celebration: 'Sixteen looks amazing on {fullName}! Get ready for new adventures, unforgettable moments, and all the fun that comes with this incredible milestone. Let\'s celebrate {firstName}!',
        heartfelt: 'Watching {fullName} grow into the incredible person they are today fills our hearts with so much love and pride. Happy Sweet 16 to someone truly special!',
    },
    '21st': {
        classic: 'Welcome to 21, {fullName}! The world is yours for the taking, and we can\'t wait to see all the amazing things you\'ll do. Cheers to this exciting new chapter!',
        celebration: '{fullName} is 21 and ready to take on the world! This is the year for big dreams, wild adventures, and making memories that\'ll last a lifetime. Let\'s celebrate!',
        heartfelt: 'Twenty-one years of {fullName} bringing joy to everyone around them. We\'re so proud of who they\'ve become and so excited for everything ahead. We love you to the moon and back!',
    },
    overthehill: {
        classic: '{fullName} has officially made it over the hill! It\'s all downhill from here... but at least the view is amazing!',
        celebration: 'Over the hill but still killing it! {fullName} is proof that age is just a number (and this number is getting pretty big!). Let\'s celebrate!',
        heartfelt: '{fullName} has reached a beautiful milestone. With age comes wisdom, and {firstName} has plenty of both! Here\'s to many more years of love and laughter.',
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

export default function BirthdayFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state - Prefilled with sample data
    const [selectedBirthday, setSelectedBirthday] = useState<string>('birthday');
    const [showBirthdayModal, setShowBirthdayModal] = useState(false);
    const [personName, setPersonName] = useState('Jessica Sample Doe');
    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
    const [hometown, setHometown] = useState('Bellefontaine Neighbors, MO');
    const [dobDate, setDobDate] = useState<Date>(new Date(2026, 1, 4)); // Feb 4, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('green');
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

    const getSelectedBirthdayLabel = () => {
        const found = BIRTHDAY_OPTIONS.find(opt => opt.id === selectedBirthday);
        return found ? found.label : 'Select Birthday Type';
    };

    const getFormattedMessage = () => {
        const messages = MESSAGES[selectedBirthday] || MESSAGES.birthday;
        let template = messages[selectedMessage] || messages.classic;

        const nameParts = personName.trim().split(' ');
        const firstName = nameParts[0] || 'Friend';
        const fullName = personName.trim() || 'Friend';

        return template
            .replace(/{fullName}/g, fullName)
            .replace(/{firstName}/g, firstName)
            .replace(/{name}/g, fullName);
    };

    useEffect(() => {
        if (!messageWasEdited) {
            setEditableMessage(getFormattedMessage());
        }
    }, [personName, selectedBirthday, selectedMessage]);

    const handlePreview = async () => {
        if (!personName.trim()) {
            Alert.alert('Missing Information', 'Please enter the person\'s name.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the hometown.');
            return;
        }

        setLoading(true);
        const finalMessage = editableMessage + ' Here is some interesting information surrounding your birthday.';
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
            <Text style={styles.title}>Birthday Announcement</Text>

            {/* Birthday Type Dropdown */}
            <Text style={styles.label}>Birthday Type</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowBirthdayModal(true)}
            >
                <Text style={styles.dropdownText}>{getSelectedBirthdayLabel()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Birthday Type Modal */}
            <Modal visible={showBirthdayModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Birthday Type</Text>
                        <ScrollView style={styles.modalScroll}>
                            {BIRTHDAY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.modalOption,
                                        selectedBirthday === option.id && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedBirthday(option.id);
                                        setShowBirthdayModal(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowBirthdayModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Person's Name */}
            <Text style={styles.label}>Birthday Person's Name</Text>
            <TextInput
                style={styles.input}
                value={personName}
                onChangeText={setPersonName}
                placeholder="Enter full name"
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
                title="Birth Date"
            />

            {/* Photos - Up to 3 */}
            <PhotoUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={3}
                label="Photos (Optional - up to 3)"
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
                placeholder="Your birthday message..."
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
                    {loading ? 'Loading...' : 'Preview Birthday Time Capsule'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a472a',
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
        backgroundColor: '#2d6a3f',
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
        backgroundColor: '#2d6a3f',
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
        color: '#1a472a',
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
        color: '#1a472a',
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
        backgroundColor: '#1a472a',
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
