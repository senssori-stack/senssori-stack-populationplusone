import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
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

type Props = NativeStackScreenProps<RootStackParamList, 'WeddingForm'>;

const getWeddingMessage = (style: 'classic' | 'celebration' | 'heartfelt') => {
    const messages = {
        classic: `{coupleNames} are officially married! Two hearts, one love, one beautiful journey ahead. Here's to a lifetime of love, laughter, and happily ever after.`,
        celebration: `It's official — {coupleNames} just tied the knot! Pop the champagne, hit the dance floor, and celebrate the newlyweds! Let the adventure begin!`,
        heartfelt: `Today, {coupleNames} became one. Surrounded by love, they made a promise to cherish each other for all the days to come. May their love story be the greatest one ever told.`,
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

export default function WeddingAnnouncementFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state - Prefilled with sample data
    const [spouse1Name, setSpouse1Name] = useState('Jane Doe');
    const [spouse2Name, setSpouse2Name] = useState('John Doe');
    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
    const [hometown, setHometown] = useState('BELLEFONTAINE NEIGHBORS, MO');
    const [weddingDate, setWeddingDate] = useState<Date>(new Date(2026, 1, 4)); // Feb 4, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('gold');
    const [nameGold, setNameGold] = useState(false);
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

    const getCoupleNames = () => {
        if (spouse1Name.trim() && spouse2Name.trim()) {
            const firstName1 = spouse1Name.trim().split(' ')[0];
            return `${firstName1} and ${spouse2Name.trim()}`;
        }
        return spouse1Name.trim() || spouse2Name.trim() || 'The Happy Couple';
    };

    const getFormattedMessage = () => {
        const template = getWeddingMessage(selectedMessage);
        const coupleNames = getCoupleNames();
        return template.replace(/{coupleNames}/g, coupleNames);
    };

    useEffect(() => {
        if (!messageWasEdited) {
            setEditableMessage(getFormattedMessage());
        }
    }, [spouse1Name, spouse2Name, selectedMessage]);

    const handlePreview = async () => {
        if (!spouse1Name.trim() || !spouse2Name.trim()) {
            Alert.alert('Missing Information', 'Please enter both names.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the hometown.');
            return;
        }

        setLoading(true);
        const finalMessage = editableMessage + ' Here is some interesting information surrounding your wedding day.';
        try {
            const dobISO = `${weddingDate.getFullYear()}-${String(weddingDate.getMonth() + 1).padStart(2, '0')}-${String(weddingDate.getDate()).padStart(2, '0')}`;
            const pop = await getPopulationForCity(hometown.trim(), dobISO);
            setPopulation(pop);

            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: getCoupleNames(),
                motherName: getCoupleNames(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: dobISO,
                mode: 'milestone',
                message: finalMessage,
                population: pop || undefined,
                babyCount: 2,
                hidePlusLabel: true,
                nameGold,
            });
        } catch (error) {
            console.error('Error fetching population:', error);
            const dobISO = `${weddingDate.getFullYear()}-${String(weddingDate.getMonth() + 1).padStart(2, '0')}-${String(weddingDate.getDate()).padStart(2, '0')}`;
            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: getCoupleNames(),
                motherName: getCoupleNames(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: dobISO,
                mode: 'milestone',
                message: finalMessage,
                babyCount: 2,
                hidePlusLabel: true,
                nameGold,
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
            <Text style={styles.title}>Wedding Announcement</Text>

            {/* Spouse/Partner 1 Name */}
            <Text style={styles.label}>Spouse/Partner 1 Name</Text>
            <TextInput
                style={styles.input}
                value={spouse1Name}
                onChangeText={setSpouse1Name}
                placeholder="Enter first spouse's name"
                placeholderTextColor="#999"
            />

            {/* Spouse/Partner 2 Name */}
            <Text style={styles.label}>Spouse/Partner 2 Name</Text>
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
                onChangeText={(t) => setHometown(t.toUpperCase())}
                                autoCapitalize="characters"
                placeholder="e.g. St. Louis, MO"
                placeholderTextColor="#999"
            />

            {/* Wedding Date */}
            <Text style={styles.label}>Wedding Date</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {weddingDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            <ScrollableDatePicker
                visible={showDatePicker}
                date={weddingDate}
                onDateChange={(date) => setWeddingDate(date)}
                onClose={() => setShowDatePicker(false)}
                title="Wedding Date"
            />

            {/* Photos - Up to 3 */}
            <PhotoUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={3}
                label="Wedding Photos (Optional - up to 3)"
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
                placeholder="Your wedding message..."
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
                    {loading ? 'Loading...' : 'Preview Wedding Time Capsule'}
                </Text>
            </TouchableOpacity>
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
    dateButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    messageButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    messageButton: {
        flex: 1,
        backgroundColor: '#1a1a9e',
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
        color: '#000080',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    toggleGroup: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
    toggleActive: { backgroundColor: '#fff' },
    toggleText: { fontWeight: '700', color: '#fff', fontSize: 14 },
    toggleActiveText: { color: '#333' },
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
        color: '#000080',
        fontSize: 18,
        fontWeight: '900',
    },
});
