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
import { formatHeritageDisplay, HERITAGE_OPTIONS } from '../constants/heritage';
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
    '30th': {
        classic: 'Dirty thirty looks amazing on {fullName}! The twenties were just the warm-up — the real adventure starts now. Welcome to the best decade yet!',
        celebration: '{fullName} is 30! Three decades of being awesome, and {firstName} is just getting started. Time to celebrate this milestone in style!',
        heartfelt: 'Thirty years of {fullName} making the world brighter, kinder, and more fun. We\'re so proud of everything {firstName} has accomplished and can\'t wait to see what the next chapter brings.',
    },
    '40th': {
        classic: '{fullName} is 40 and absolutely fabulous! They say life begins at 40, and if that\'s true, {firstName} is about to have the time of their life!',
        celebration: 'Four decades of being incredible! {fullName} is proof that 40 is the new 30 — only better, wiser, and with way more confidence. Let\'s celebrate {firstName}!',
        heartfelt: 'At 40, {fullName} has built a life filled with love, laughter, and meaning. We admire {firstName}\'s strength, kindness, and the way they make everyone around them feel special. Happy 40th!',
    },
    '50th': {
        classic: 'Half a century of {fullName} being absolutely legendary! Fifty years young and still showing the rest of us how it\'s done. Cheers to the golden birthday!',
        celebration: '{fullName} hits the big 5-0! Fifty years of love, laughter, and memories — and {firstName} makes it all look effortless. This milestone calls for a legendary celebration!',
        heartfelt: 'Fifty years of {fullName} lighting up this world with their warmth, humor, and grace. {firstName} has touched so many lives in beautiful ways. We\'re honored to celebrate this incredible milestone with you.',
    },
    '60th': {
        classic: '{fullName} is 60 and still the life of the party! Six decades of wisdom, wit, and wonderful memories. The best is yet to come for {firstName}!',
        celebration: 'Sixty and sensational! {fullName} proves that age is just a number — and this number looks fantastic. Here\'s to celebrating 60 amazing years of {firstName}!',
        heartfelt: 'Sixty years of {fullName}\'s love, laughter, and legacy. The lives {firstName} has touched, the memories they\'ve created, and the love they\'ve shared — it all adds up to an extraordinary life. Happy 60th!',
    },
    '70th': {
        classic: '{fullName} is 70 and still going strong! Seven decades of amazing stories, incredible experiences, and a life well lived. We\'re so lucky to celebrate with {firstName}!',
        celebration: 'Seventy years young! {fullName} has lived, loved, and laughed through seven incredible decades. {firstName} is living proof that the best things really do get better with time!',
        heartfelt: 'Seventy years of {fullName}\'s beautiful spirit, unwavering love, and quiet strength. {firstName} has been a guiding light for so many of us. This milestone is a testament to a life filled with meaning and purpose. We love you!',
    },
    '80th': {
        classic: '{fullName} is 80 and still the most interesting person in every room! Eight decades of stories, wisdom, and a sparkle that never fades. Happy 80th, {firstName}!',
        celebration: 'Eighty years of being absolutely wonderful! {fullName} has seen the world change in incredible ways and has made it better just by being in it. Let\'s give {firstName} the celebration they deserve!',
        heartfelt: 'Eighty years of {fullName}\'s love, sacrifice, and devotion have shaped our family and our lives in ways words can\'t fully express. {firstName}, you are our treasure. Happy 80th birthday with all our love.',
    },
    '90th': {
        classic: '{fullName} is 90! Nine decades of living life to the fullest and still showing us all how it\'s done. {firstName} is a living legend and we are so blessed to celebrate this day!',
        celebration: 'Ninety years of {fullName}! Most people can only dream of reaching this incredible milestone, and {firstName} has done it with grace, humor, and style. What an achievement!',
        heartfelt: 'Ninety years of {fullName}\'s gentle wisdom, endless love, and the kind of strength that inspires everyone around them. {firstName}, you are a gift to this world and to all of us who love you. Happy 90th!',
    },
    '100th': {
        classic: '{fullName} is 100 years young! A whole century of life, love, and unforgettable memories. {firstName} has seen it all and done it all — and is still going strong. What an absolute legend!',
        celebration: 'ONE HUNDRED! {fullName} has reached the ultimate milestone! A century of incredible stories, historic moments, and a life that has inspired everyone who knows {firstName}. This calls for the celebration of a lifetime!',
        heartfelt: 'One hundred years of {fullName}\'s love, laughter, and legacy. {firstName}, you have lived through history, raised generations, and touched more hearts than you will ever know. You are a once-in-a-lifetime treasure. Happy 100th birthday with all our love and admiration.',
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
    const [selectedHeritages, setSelectedHeritages] = useState<string[]>([]);
    const [showHeritageModal, setShowHeritageModal] = useState(false);
    const [nationality, setNationality] = useState('');
    const [dobDate, setDobDate] = useState<Date>(new Date(2026, 1, 4)); // Feb 4, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('green');
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
        const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
        try {
            // Format date as YYYY-MM-DD (required by historical snapshot lookup)
            // ⚠️ CRITICAL: Must pass DOB - routes to HISTORICAL CSV (before 2020) or CURRENT CSV (after 2020)
            const pop = await getPopulationForCity(hometown.trim(), dobISO);
            setPopulation(pop);

            /**
             * ⚠️ CRITICAL: CITY NOT FOUND - SHOW ERROR POPUP
             * Do NOT navigate without population - user must correct the city
             */
            if (pop === null) {
                Alert.alert(
                    'City Not Found',
                    'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            navigation.navigate('Preview', {
                theme: selectedColor,
                personName: personName.trim(),
                motherName: personName.trim(),
                photoUris: photos.filter(p => p !== null) as string[],
                hometown: hometown.trim(),
                heritage: formatHeritageDisplay(selectedHeritages) || undefined,
                nationality: nationality.trim() || undefined,
                dobISO: dobISO,
                mode: 'milestone',
                message: finalMessage,
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
                        <Text style={styles.modalSubtitle}>
                            Represent your bloodlines — pick 1 to 4
                        </Text>
                        <Text style={styles.heritageCounter}>
                            {selectedHeritages.length} / 4 selected
                        </Text>
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
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setSelectedHeritages([])}
                            >
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.modalDone}
                            onPress={() => setShowHeritageModal(false)}
                        >
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
                    {loading ? 'Loading...' : 'Preview Birthday Time Capsule'}
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
        backgroundColor: '#1a1a9e',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalOptionSelected: {
        backgroundColor: '#000080',
    },
    modalOptionDisabled: {
        opacity: 0.35,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    modalOptionTextSelected: {
        color: '#fff',
    },
    modalOptionTextDisabled: {
        color: '#bbb',
    },
    checkmark: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '900',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 4,
    },
    heritageCounter: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000080',
        textAlign: 'center',
        marginBottom: 10,
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    clearButton: {
        marginTop: 8,
        padding: 10,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
    modalDone: {
        marginTop: 8,
        padding: 14,
        backgroundColor: '#000080',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalDoneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
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
