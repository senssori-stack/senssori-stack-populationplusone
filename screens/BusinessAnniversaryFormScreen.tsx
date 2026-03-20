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

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessAnniversaryForm'>;

const getBusinessMessage = (style: 'classic' | 'celebration' | 'heartfelt', years: number) => {
    const yearsText = years === 1 ? '1 year' : `${years} years`;
    const messages = {
        classic: `Cheers to ${yearsText} of excellence! From our very first day to today, we've been proud to serve this community. Thank you for being part of our journey — here's to many more years together.`,
        celebration: `${yearsText} strong and still going! 🎉 Pop the confetti — we're celebrating this incredible milestone with the community that made it all possible. Thank you for your loyalty and support!`,
        heartfelt: `${yearsText} ago, a dream became reality. Through every challenge and triumph, our doors stayed open because of YOU — our amazing customers, neighbors, and friends. From the bottom of our hearts, thank you.`,
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

export default function BusinessAnniversaryFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState<'bar' | 'restaurant' | 'business'>('restaurant');
    const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
    const [hometown, setHometown] = useState('');
    const [establishedDate, setEstablishedDate] = useState<Date>(new Date(2016, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('gold');
    const [nameGold, setNameGold] = useState(false);
    const [loading, setLoading] = useState(false);
    const [population, setPopulation] = useState<number | null>(null);

    // Calculate years
    const getYears = () => {
        const now = new Date();
        return Math.max(1, now.getFullYear() - establishedDate.getFullYear());
    };

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

    const getFormattedMessage = () => {
        const template = getBusinessMessage(selectedMessage, getYears());
        return template.replace(/{businessName}/g, businessName.trim() || 'Our Business');
    };

    useEffect(() => {
        if (!messageWasEdited) {
            setEditableMessage(getFormattedMessage());
        }
    }, [businessName, selectedMessage, establishedDate]);

    const handlePreview = async () => {
        if (!businessName.trim()) {
            Alert.alert('Missing Information', 'Please enter the business name.');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Missing Information', 'Please enter the location.');
            return;
        }

        setLoading(true);
        const finalMessage = editableMessage + ' Here is some interesting information surrounding your anniversary.';
        try {
            const dobISO = `${establishedDate.getFullYear()}-${String(establishedDate.getMonth() + 1).padStart(2, '0')}-${String(establishedDate.getDate()).padStart(2, '0')}`;
            const pop = await getPopulationForCity(hometown.trim(), dobISO);
            setPopulation(pop);

            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: businessName.trim(),
                motherName: businessName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: dobISO,
                mode: 'milestone',
                message: finalMessage,
                population: pop || undefined,
                babyCount: 2,
                hidePlusLabel: true,
                hidePostcard: true,
                nameGold,
            });
        } catch (error) {
            console.error('Error fetching population:', error);
            const fallbackDobISO = `${establishedDate.getFullYear()}-${String(establishedDate.getMonth() + 1).padStart(2, '0')}-${String(establishedDate.getDate()).padStart(2, '0')}`;
            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: businessName.trim(),
                motherName: businessName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                dobISO: fallbackDobISO,
                mode: 'milestone',
                message: finalMessage,
                babyCount: 2,
                hidePlusLabel: true,
                hidePostcard: true,
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

    const businessTypeLabels: Record<typeof businessType, string> = {
        bar: '🍺 Bar / Pub',
        restaurant: '🍽️ Restaurant',
        business: '🏢 Business',
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Business Anniversary</Text>

            {/* Business Type */}
            <Text style={styles.label}>Type of Business</Text>
            <View style={styles.typeButtons}>
                {(['bar', 'restaurant', 'business'] as const).map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.typeButton,
                            businessType === type && styles.typeButtonSelected,
                        ]}
                        onPress={() => setBusinessType(type)}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            businessType === type && styles.typeButtonTextSelected,
                        ]}>
                            {businessTypeLabels[type]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Business Name */}
            <Text style={styles.label}>Business Name</Text>
            <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Joe's Bar & Grill"
                placeholderTextColor="#999"
            />

            {/* Location */}
            <Text style={styles.label}>Location (City, State)</Text>
            <TextInput
                style={styles.input}
                value={hometown}
                onChangeText={(t) => setHometown(t.toUpperCase())}
                                autoCapitalize="characters"
                placeholder="e.g. St. Louis, MO"
                placeholderTextColor="#999"
            />

            {/* Established Date */}
            <Text style={styles.label}>Established Date</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateText}>
                    {establishedDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            <ScrollableDatePicker
                visible={showDatePicker}
                date={establishedDate}
                onDateChange={(date) => setEstablishedDate(date)}
                onClose={() => setShowDatePicker(false)}
                title="Established Date"
            />

            {/* Photos - Up to 3 */}
            <PhotoUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={3}
                label="Business Photos (Optional - up to 3)"
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
                    {loading ? 'Loading...' : 'Preview Anniversary Time Capsule'}
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
    typeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        backgroundColor: '#1a1a9e',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    typeButtonSelected: {
        backgroundColor: '#fff',
    },
    typeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    typeButtonTextSelected: {
        color: '#000080',
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
