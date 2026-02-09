import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { getPopulationForCity } from '../src/data/utils/populations';
import type { RootStackParamList, ThemeName } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AnniversaryForm'>;

const ANNIVERSARY_OPTIONS = [
    { id: '1st', label: '💍 1st Anniversary - Paper', emoji: '💍', traditional: 'Paper' },
    { id: '2nd', label: '💍 2nd Anniversary - Cotton', emoji: '💍', traditional: 'Cotton' },
    { id: '3rd', label: '💍 3rd Anniversary - Leather', emoji: '💍', traditional: 'Leather' },
    { id: '4th', label: '💍 4th Anniversary - Fruit & Flowers', emoji: '💍', traditional: 'Fruit & Flowers' },
    { id: '5th', label: '💍 5th Anniversary - Wood', emoji: '💍', traditional: 'Wood' },
    { id: '6th', label: '💍 6th Anniversary - Candy/Iron', emoji: '💍', traditional: 'Candy/Iron' },
    { id: '7th', label: '💍 7th Anniversary - Wool/Copper', emoji: '💍', traditional: 'Wool/Copper' },
    { id: '8th', label: '💍 8th Anniversary - Pottery/Bronze', emoji: '💍', traditional: 'Pottery/Bronze' },
    { id: '9th', label: '💍 9th Anniversary - Willow/Pottery', emoji: '💍', traditional: 'Willow/Pottery' },
    { id: '10th', label: '💍 10th Anniversary - Tin/Aluminum', emoji: '💍', traditional: 'Tin/Aluminum' },
    { id: '11th', label: '💍 11th Anniversary - Steel', emoji: '💍', traditional: 'Steel' },
    { id: '12th', label: '💍 12th Anniversary - Silk/Linen', emoji: '💍', traditional: 'Silk/Linen' },
    { id: '13th', label: '💍 13th Anniversary - Lace', emoji: '💍', traditional: 'Lace' },
    { id: '14th', label: '💍 14th Anniversary - Ivory', emoji: '💍', traditional: 'Ivory' },
    { id: '15th', label: '💎 15th Anniversary - Crystal', emoji: '💎', traditional: 'Crystal' },
    { id: '20th', label: '🏺 20th Anniversary - China', emoji: '🏺', traditional: 'China' },
    { id: '25th', label: '🥈 25th Anniversary - Silver', emoji: '🥈', traditional: 'Silver' },
    { id: '30th', label: '🦪 30th Anniversary - Pearl', emoji: '🦪', traditional: 'Pearl' },
    { id: '35th', label: '💠 35th Anniversary - Coral', emoji: '💠', traditional: 'Coral' },
    { id: '40th', label: '❤️ 40th Anniversary - Ruby', emoji: '❤️', traditional: 'Ruby' },
    { id: '45th', label: '💙 45th Anniversary - Sapphire', emoji: '💙', traditional: 'Sapphire' },
    { id: '50th', label: '🥇 50th Anniversary - Gold', emoji: '🥇', traditional: 'Gold' },
    { id: '55th', label: '💚 55th Anniversary - Emerald', emoji: '💚', traditional: 'Emerald' },
    { id: '60th', label: '💎 60th Anniversary - Diamond', emoji: '💎', traditional: 'Diamond' },
    { id: '65th', label: '💜 65th Anniversary - Blue Sapphire', emoji: '💜', traditional: 'Blue Sapphire' },
    { id: '70th', label: '💍 70th Anniversary - Platinum', emoji: '💍', traditional: 'Platinum' },
    { id: '75th', label: '💎 75th Anniversary - Diamond/Gold', emoji: '💎', traditional: 'Diamond/Gold' },
];

const getAnniversaryMessage = (anniversaryId: string, style: 'classic' | 'celebration' | 'heartfelt') => {
    const option = ANNIVERSARY_OPTIONS.find(o => o.id === anniversaryId);
    const traditional = option?.traditional || '';

    const messages = {
        classic: `{coupleNames}'s ${anniversaryId} anniversary and still going strong! Your love story is one for the ages. The traditional gift is ${traditional}. Here's to many more years of happiness together. Here is some interesting information surrounding your anniversary.`,
        celebration: `${anniversaryId} years of love, laughter, and putting up with each other! {coupleNames}, you two are relationship goals. Time to celebrate with something ${traditional}! Here is some interesting information surrounding your anniversary.`,
        heartfelt: `${anniversaryId} years of building a beautiful life together. {coupleNames}, your love inspires everyone around you. May your bond continue to grow stronger each day. Here is some interesting information surrounding your anniversary.`,
    };

    return messages[style] || messages.classic;
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

export default function AnniversaryFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state
    const [selectedAnniversary, setSelectedAnniversary] = useState<string>('25th');
    const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
    const [spouse1Name, setSpouse1Name] = useState('');
    const [spouse2Name, setSpouse2Name] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [hometown, setHometown] = useState('');
    const [anniversaryDate, setAnniversaryDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('gold');
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

    const getSelectedAnniversaryLabel = () => {
        const found = ANNIVERSARY_OPTIONS.find(opt => opt.id === selectedAnniversary);
        return found ? found.label : 'Select Anniversary';
    };

    const getCoupleNames = () => {
        if (spouse1Name.trim() && spouse2Name.trim()) {
            return `${spouse1Name.trim()} & ${spouse2Name.trim()}`;
        }
        return spouse1Name.trim() || spouse2Name.trim() || 'The Happy Couple';
    };

    const getFormattedMessage = () => {
        let template = getAnniversaryMessage(selectedAnniversary, selectedMessage);
        const coupleNames = getCoupleNames();

        return template.replace(/{coupleNames}/g, coupleNames);
    };

    useEffect(() => {
        if (!messageWasEdited) {
            setEditableMessage(getFormattedMessage());
        }
    }, [spouse1Name, spouse2Name, selectedAnniversary, selectedMessage]);

    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 4,
        });

        if (!result.canceled && result.assets) {
            setPhotos(result.assets.map(a => a.uri));
        }
    };

    const handlePreview = async () => {
        if (!spouse1Name.trim() || !spouse2Name.trim()) {
            Alert.alert('Missing Information', 'Please enter both spouse names.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the hometown.');
            return;
        }

        setLoading(true);
        try {
            const pop = await getPopulationForCity(hometown.trim());
            setPopulation(pop);

            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: getCoupleNames(),
                photoUri: photos[0] || null,
                hometown: hometown.trim(),
                dobISO: anniversaryDate.toISOString(),
                mode: 'milestone',
                message: editableMessage,
                population: pop || undefined,
            });
        } catch (error) {
            console.error('Error fetching population:', error);
            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: getCoupleNames(),
                photoUri: photos[0] || null,
                hometown: hometown.trim(),
                dobISO: anniversaryDate.toISOString(),
                mode: 'milestone',
                message: editableMessage,
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
            {/* Anniversary Type Dropdown */}
            <Text style={styles.label}>Anniversary</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowAnniversaryModal(true)}
            >
                <Text style={styles.dropdownText}>{getSelectedAnniversaryLabel()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Anniversary Type Modal */}
            <Modal visible={showAnniversaryModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Anniversary</Text>
                        <ScrollView style={styles.modalScroll}>
                            {ANNIVERSARY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.modalOption,
                                        selectedAnniversary === option.id && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedAnniversary(option.id);
                                        setShowAnniversaryModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedAnniversary === option.id && styles.modalOptionTextSelected
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowAnniversaryModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Spouse 1 Name */}
            <Text style={styles.label}>Spouse 1 Name</Text>
            <TextInput
                style={styles.input}
                value={spouse1Name}
                onChangeText={setSpouse1Name}
                placeholder="Enter first spouse's name"
                placeholderTextColor="#999"
            />

            {/* Spouse 2 Name */}
            <Text style={styles.label}>Spouse 2 Name</Text>
            <TextInput
                style={styles.input}
                value={spouse2Name}
                onChangeText={setSpouse2Name}
                placeholder="Enter second spouse's name"
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

            {/* Anniversary Date */}
            <Text style={styles.label}>Wedding Date</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {anniversaryDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={anniversaryDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setAnniversaryDate(date);
                    }}
                />
            )}

            {/* Photo */}
            <Text style={styles.label}>Photo (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
                {photos.length > 0 ? (
                    <Image source={{ uri: photos[0] }} style={styles.photoPreview} />
                ) : (
                    <Text style={styles.photoButtonText}>+ Add Photo</Text>
                )}
            </TouchableOpacity>

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
                placeholder="Your anniversary message..."
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
                    {loading ? 'Loading...' : 'Preview Anniversary Time Capsule'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5c3a1a',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
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
        backgroundColor: '#785030',
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
        backgroundColor: '#785030',
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
        color: '#5c3a1a',
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
        color: '#5c3a1a',
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
        backgroundColor: '#5c3a1a',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextSelected: {
        color: '#fff',
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
