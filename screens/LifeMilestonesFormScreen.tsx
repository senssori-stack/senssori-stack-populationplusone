import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    useWindowDimensions,
    Alert,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import type { ThemeName } from '../src/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/types';
import { getPopulationForCity } from '../src/data/utils/populations';

type Props = NativeStackScreenProps<RootStackParamList, 'LifeMilestones'>;

const RECIPIENT_OPTIONS = {
    immediateFamily: [
        { id: 'daughter', label: 'Daughter' },
        { id: 'son', label: 'Son' },
        { id: 'mother', label: 'Mother' },
        { id: 'father', label: 'Father' },
        { id: 'husband', label: 'Husband' },
        { id: 'wife', label: 'Wife' },
        { id: 'sister', label: 'Sister' },
        { id: 'brother', label: 'Brother' },
    ],
    extendedFamily: [
        { id: 'grandmother', label: 'Grandmother' },
        { id: 'grandfather', label: 'Grandfather' },
        { id: 'granddaughter', label: 'Granddaughter' },
        { id: 'grandson', label: 'Grandson' },
        { id: 'aunt', label: 'Aunt' },
        { id: 'uncle', label: 'Uncle' },
        { id: 'niece', label: 'Niece' },
        { id: 'nephew', label: 'Nephew' },
        { id: 'cousin', label: 'Cousin' },
    ],
    children: [
        { id: 'baby', label: 'Baby' },
        { id: 'toddler', label: 'Toddler' },
        { id: 'child', label: 'Child' },
        { id: 'teen', label: 'Teen' },
    ],
    friendsRelationships: [
        { id: 'friend', label: 'Friend' },
        { id: 'bestfriend', label: 'Best Friend' },
        { id: 'girlfriend', label: 'Girlfriend' },
        { id: 'boyfriend', label: 'Boyfriend' },
        { id: 'partner', label: 'Partner' },
        { id: 'fiance', label: 'Fiancé' },
    ],
    professionalSocial: [
        { id: 'coworker', label: 'Coworker' },
        { id: 'boss', label: 'Boss' },
        { id: 'employee', label: 'Employee' },
        { id: 'teacher', label: 'Teacher' },
        { id: 'coach', label: 'Coach' },
    ],
};

const MILESTONE_OPTIONS = {
    birthday: [
        { id: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
        { id: 'sweet16', label: '🎀 Sweet 16th Birthday', emoji: '🎀' },
        { id: '21st', label: '🍾 21st Birthday', emoji: '🍾' },
    ],
    graduation: [
        { id: 'highschool', label: '🎓 High School Graduation', emoji: '🎓' },
        { id: 'college', label: '🎓 College Graduation', emoji: '🎓' },
    ],
    anniversary: [
        { id: '1st', label: '1st: Paper', emoji: '💍' },
        { id: '2nd', label: '2nd: Cotton', emoji: '💍' },
        { id: '3rd', label: '3rd: Leather', emoji: '💍' },
        { id: '4th', label: '4th: Fruit & Flowers', emoji: '💍' },
        { id: '5th', label: '5th: Wood', emoji: '💍' },
        { id: '6th', label: '6th: Candy/Iron', emoji: '💍' },
        { id: '7th', label: '7th: Wool/Copper', emoji: '💍' },
        { id: '8th', label: '8th: Pottery/Bronze', emoji: '💍' },
        { id: '9th', label: '9th: Willow/Pottery', emoji: '💍' },
        { id: '10th', label: '10th: Tin/Aluminum', emoji: '💍' },
        { id: '11th', label: '11th: Steel', emoji: '💍' },
        { id: '12th', label: '12th: Silk/Linen', emoji: '💍' },
        { id: '15th', label: '15th: Crystal', emoji: '💍' },
        { id: '20th', label: '20th: China', emoji: '💍' },
        { id: '25th', label: '25th: Silver', emoji: '💍' },
        { id: '30th', label: '30th: Pearl', emoji: '💍' },
        { id: '40th', label: '40th: Ruby', emoji: '💍' },
        { id: '50th', label: '50th: Gold', emoji: '💍' },
        { id: '60th', label: '60th: Diamond', emoji: '💍' },
    ],
    special: [
        { id: 'mothersday', label: '💐 Mother\'s Day', emoji: '💐' },
        { id: 'fathersday', label: '👔 Father\'s Day', emoji: '👔' },
    ],
};

const MESSAGES = {
    classic: 'Wishing {name} a wonderful {milestone} filled with love, laughter, and cherished memories.',
    celebration: 'Another year of amazing memories for {name}! Here\'s to celebrating all the incredible moments that make {name} who they are.',
    heartfelt: 'Happy {milestone}, {name}! May this special day bring as much joy and happiness as you bring to everyone around you.',
    custom: '',
};

// Milestone-specific messages
const getMilestoneMessages = (milestoneId: string) => {
    const messages: Record<string, { classic: string; celebration: string; heartfelt: string }> = {
        birthday: {
            classic: 'Wishing {name} a wonderful birthday filled with love, laughter, and cherished memories.',
            celebration: 'Another year of amazing memories for {name}! Here\'s to celebrating all the incredible moments that make {name} who they are.',
            heartfelt: 'Happy Birthday, {name}! May this special day bring as much joy and happiness as you bring to everyone around you.',
        },
        sweet16: {
            classic: 'Happy Sweet 16, {name}! Wishing you a day as amazing as this milestone moment.',
            celebration: 'Sweet 16 and never been more fabulous! Here\'s to celebrating {name} and all the adventures ahead!',
            heartfelt: 'Happy Sweet 16, {name}! May this special year be filled with dreams coming true and memories that last forever.',
        },
        '21st': {
            classic: 'Happy 21st Birthday, {name}! Cheers to this milestone and all the exciting moments ahead!',
            celebration: 'Celebrating 21 years of {name}! Here\'s to new adventures, unforgettable memories, and endless possibilities!',
            heartfelt: 'Happy 21st, {name}! May this year bring you joy, success, and all the happiness you deserve.',
        },
        highschool: {
            classic: 'Congratulations on your high school graduation, {name}! Your future is bright!',
            celebration: 'You did it! Celebrating {name}\'s high school graduation and the amazing journey ahead!',
            heartfelt: 'So proud of you, {name}! Your hard work and dedication have brought you to this incredible milestone. The world awaits!',
        },
        college: {
            classic: 'Congratulations on your college graduation, {name}! This is just the beginning of your amazing story!',
            celebration: 'College grad! Celebrating {name} and all the incredible achievements that got you here!',
            heartfelt: 'Congratulations, {name}! Your dedication and perseverance have paid off. May your future be filled with success and happiness!',
        },
        mothersday: {
            classic: 'Happy Mother\'s Day to the most wonderful mom! Thank you for everything you do.',
            celebration: 'Celebrating the amazing mother you are! Your love and care make every day brighter.',
            heartfelt: 'To the best mom in the world: Your love, strength, and kindness inspire us every single day. Happy Mother\'s Day!',
        },
        fathersday: {
            classic: 'Happy Father\'s Day to an incredible dad! Thank you for all you do.',
            celebration: 'Celebrating the amazing father you are! Your guidance and love mean the world to us.',
            heartfelt: 'To the best dad: Your wisdom, humor, and unwavering support have shaped who we are. Happy Father\'s Day!',
        },
    };

    // Anniversary messages (1st-60th)
    const anniversaryYears = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'];
    if (anniversaryYears.includes(milestoneId)) {
        return {
            classic: `Happy ${milestoneId} Anniversary! Wishing you continued love, joy, and many more years of happiness together.`,
            celebration: `Celebrating ${milestoneId} years of love and partnership! Here's to the memories you've made and the adventures still to come!`,
            heartfelt: `Happy ${milestoneId} Anniversary! Your love story continues to inspire us all. May your bond grow stronger with each passing year.`,
        };
    }

    return messages[milestoneId] || messages.birthday;
};

const getMilestoneHeaderText = (milestoneId: string) => {
    const headers: Record<string, string> = {
        birthday: 'Birthday Message',
        sweet16: 'Sweet 16th Message',
        '21st': '21st Birthday Message',
        highschool: 'High School Graduation Message',
        college: 'College Graduation Message',
        mothersday: 'Mother\'s Day Message',
        fathersday: 'Father\'s Day Message',
    };

    // Anniversary headers
    const anniversaryYears = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'];
    if (anniversaryYears.includes(milestoneId)) {
        return `${milestoneId} Anniversary Message`;
    }

    return headers[milestoneId] || 'Message';
};

const getPersonNameLabel = (milestoneId: string) => {
    const labels: Record<string, string> = {
        birthday: 'Person\'s Name',
        sweet16: 'Birthday Person\'s Name',
        '21st': 'Birthday Person\'s Name',
        highschool: 'Graduate\'s Name',
        college: 'Graduate\'s Name',
        mothersday: 'Mother\'s Name',
        fathersday: 'Father\'s Name',
    };

    // Anniversary - Couple's Names
    const anniversaryYears = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'];
    if (anniversaryYears.includes(milestoneId)) {
        return 'Couple\'s Names';
    }

    return labels[milestoneId] || 'Person\'s Name';
};

type MessageKey = keyof typeof MESSAGES;

export default function LifeMilestonesFormScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();

    // Form state
    const [milestoneCategory, setMilestoneCategory] = useState<'birthday' | 'graduation' | 'anniversary' | 'special'>('birthday');
    const [selectedMilestone, setSelectedMilestone] = useState<string>('birthday');
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<string>('');
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [personName, setPersonName] = useState('Patrick McCullen');
    const [photos, setPhotos] = useState<string[]>([]);
    const [hometown, setHometown] = useState('Bellefontaine Neighbors, MO');
    const [dobDate, setDobDate] = useState<Date>(new Date(1970, 10, 15)); // November 15, 1970
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [selectedColor, setSelectedColor] = useState<ThemeName>('green');
    const [loading, setLoading] = useState(false);
    const [population, setPopulation] = useState<number | null>(null);

    const getSelectedMilestoneLabel = () => {
        const allOptions = [...MILESTONE_OPTIONS.birthday, ...MILESTONE_OPTIONS.graduation, ...MILESTONE_OPTIONS.anniversary, ...MILESTONE_OPTIONS.special];
        const found = allOptions.find(opt => opt.id === selectedMilestone);
        return found ? found.label : 'Select Milestone';
    };

    const getSelectedRecipientLabel = () => {
        const allRecipients = [
            ...RECIPIENT_OPTIONS.immediateFamily,
            ...RECIPIENT_OPTIONS.extendedFamily,
            ...RECIPIENT_OPTIONS.children,
            ...RECIPIENT_OPTIONS.friendsRelationships,
            ...RECIPIENT_OPTIONS.professionalSocial
        ];
        const found = allRecipients.find(opt => opt.id === selectedRecipient);
        return found ? found.label : 'Select Recipient (Optional)';
    };

    const pickPhoto = async (index: number) => {
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
                const updated = [...photos];
                updated[index] = result.assets[0].uri;
                setPhotos(updated.filter(p => p)); // Remove empty slots
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick photo');
        }
    };

    const removePhoto = (index: number) => {
        const updated = photos.filter((_, i) => i !== index);
        setPhotos(updated);
    };

    const addPhoto = () => {
        if (photos.length < 3) {
            pickPhoto(photos.length);
        }
    };

    const getFinalMessage = () => {
        // Calculate age from DOB
        const today = new Date();
        const birthDate = dobDate;
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Get zodiac sign (simplified)
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        let zodiac = '';
        let zodiacEmoji = '';
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { zodiac = 'Aries'; zodiacEmoji = '♈'; }
        else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { zodiac = 'Taurus'; zodiacEmoji = '♉'; }
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { zodiac = 'Gemini'; zodiacEmoji = '♊'; }
        else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { zodiac = 'Cancer'; zodiacEmoji = '♋'; }
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { zodiac = 'Leo'; zodiacEmoji = '♌'; }
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { zodiac = 'Virgo'; zodiacEmoji = '♍'; }
        else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { zodiac = 'Libra'; zodiacEmoji = '♎'; }
        else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { zodiac = 'Scorpio'; zodiacEmoji = '♏'; }
        else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { zodiac = 'Sagittarius'; zodiacEmoji = '♐'; }
        else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { zodiac = 'Capricorn'; zodiacEmoji = '♑'; }
        else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { zodiac = 'Aquarius'; zodiacEmoji = '♒'; }
        else { zodiac = 'Pisces'; zodiacEmoji = '♓'; }

        // Get birthstone
        const birthstones = ['Garnet 💎', 'Amethyst 💜', 'Aquamarine 💙', 'Diamond 💎', 'Emerald 💚', 'Pearl 🤍', 'Ruby ❤️', 'Peridot 💚', 'Sapphire 💙', 'Opal 🤍', 'Topaz 🧡', 'Turquoise 💙'];
        const birthstone = birthstones[month - 1] || 'Gemstone';

        // Calculate life path number
        const dateStr = `${birthDate.getMonth() + 1}${birthDate.getDate()}${birthDate.getFullYear()}`;
        let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        }
        const lifePathNumber = sum;

        // Build intro text
        const firstName = personName.split(' ')[0];
        const dobFormatted = `${month}/${day}/${birthDate.getFullYear()}`;
        const intro = `${personName} turned ${age} years old on ${dobFormatted}. ${firstName}'s zodiac sign is ${zodiac} ${zodiacEmoji} and has a life path number of ${lifePathNumber} 🎱. Their birthstone is ${birthstone}. Below are some interesting facts surrounding your birthday. `;

        // If custom message, prepend intro and return
        if (selectedMessage === 'custom') {
            return intro + customMessage;
        }

        // For prewritten messages, get the message and prepend intro
        const milestoneMessages = getMilestoneMessages(selectedMilestone);
        let msg = milestoneMessages[selectedMessage as keyof typeof milestoneMessages] || '';
        msg = msg.replace('{name}', personName || 'you');

        // Prepend intro to prewritten message
        msg = intro + msg;

        // Append custom message if provided
        if (customMessage.trim()) {
            msg = `${msg} ${customMessage.trim()}`;
        }

        return msg;
    };

    const handleBuild = async () => {
        if (!personName.trim()) {
            Alert.alert('Required', 'Please enter a person name');
            return;
        }
        if (!hometown.trim()) {
            Alert.alert('Required', 'Please enter a hometown');
            return;
        }
        if (selectedMessage === 'custom' && !customMessage.trim()) {
            Alert.alert('Required', 'Please enter a custom message');
            return;
        }

        setLoading(true);

        // Fetch population if not already loaded
        let finalPopulation = population;
        if (!finalPopulation) {
            try {
                finalPopulation = await getPopulationForCity(hometown.trim());
                setPopulation(finalPopulation);
            } catch (error) {
                finalPopulation = 100000;
            }
        }

        // Navigate to Preview with milestone data formatted like baby announcement
        const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;

        const payload: any = {
            mode: 'milestone',
            theme: selectedColor,
            hometown: hometown.trim(),
            dobISO: dobISO,
            population: finalPopulation,
            personName: personName.trim(),
            photoUri: photos[0] || null,
            babies: photos.slice(0, 3).map((photoUri, idx) => ({
                first: idx === 0 ? personName.trim() : '',
                middle: '',
                last: '',
                photoUri: photoUri
            })),
            milestone: selectedMilestone,
            recipient: selectedRecipient,
            message: getFinalMessage(),
            photos: photos,
            motherName: personName.trim(), // Use personName as the header for milestones
            fatherName: '',
            weightLb: '',
            weightOz: '',
            lengthIn: '',
            snapshot: {},
            frontOrientation: 'landscape',
            timeCapsuleOrientation: 'landscape'
        };

        setLoading(false);
        navigation.navigate('Preview', payload);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🎉 Life Milestones</Text>
            <Text style={styles.hint}>Create a time capsule for life's special moments</Text>

            {/* Milestone Type Dropdown */}
            <Text style={styles.label}>Milestone Type</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMilestoneModal(true)}
            >
                <Text style={styles.dropdownButtonText}>{getSelectedMilestoneLabel()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Milestone Selection Modal */}
            <Modal
                visible={showMilestoneModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMilestoneModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Milestone</Text>

                        <ScrollView style={styles.modalScroll}>
                            {/* Birthday Options */}
                            {MILESTONE_OPTIONS.birthday.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.milestoneOption,
                                        selectedMilestone === option.id && styles.milestoneOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedMilestone(option.id);
                                        setMilestoneCategory('birthday');
                                        setShowMilestoneModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.milestoneOptionText,
                                        selectedMilestone === option.id && styles.milestoneOptionTextSelected
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* Graduation Options */}
                            {MILESTONE_OPTIONS.graduation.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.milestoneOption,
                                        selectedMilestone === option.id && styles.milestoneOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedMilestone(option.id);
                                        setMilestoneCategory('graduation');
                                        setShowMilestoneModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.milestoneOptionText,
                                        selectedMilestone === option.id && styles.milestoneOptionTextSelected
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* Special Days */}
                            {MILESTONE_OPTIONS.special.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.milestoneOption,
                                        selectedMilestone === option.id && styles.milestoneOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedMilestone(option.id);
                                        setMilestoneCategory('special');
                                        setShowMilestoneModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.milestoneOptionText,
                                        selectedMilestone === option.id && styles.milestoneOptionTextSelected
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* Anniversary Options */}
                            <Text style={styles.modalSectionTitle}>Wedding Anniversary</Text>
                            {MILESTONE_OPTIONS.anniversary.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.milestoneOption,
                                        selectedMilestone === option.id && styles.milestoneOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedMilestone(option.id);
                                        setMilestoneCategory('anniversary');
                                        setShowMilestoneModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.milestoneOptionText,
                                        selectedMilestone === option.id && styles.milestoneOptionTextSelected
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowMilestoneModal(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Recipient Dropdown (Only for Birthday) */}
            {milestoneCategory === 'birthday' && (
                <>
                    <Text style={styles.label}>Recipient (Optional)</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowRecipientModal(true)}
                    >
                        <Text style={styles.dropdownButtonText}>{getSelectedRecipientLabel()}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    {/* Recipient Selection Modal */}
                    <Modal
                        visible={showRecipientModal}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowRecipientModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Recipient</Text>

                                <ScrollView style={styles.modalScroll}>
                                    {/* Immediate Family */}
                                    <Text style={styles.modalSectionTitle}>Immediate Family</Text>
                                    {RECIPIENT_OPTIONS.immediateFamily.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.milestoneOption,
                                                selectedRecipient === option.id && styles.milestoneOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedRecipient(option.id);
                                                setShowRecipientModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.milestoneOptionText,
                                                selectedRecipient === option.id && styles.milestoneOptionTextSelected
                                            ]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Extended Family */}
                                    <Text style={styles.modalSectionTitle}>Extended Family</Text>
                                    {RECIPIENT_OPTIONS.extendedFamily.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.milestoneOption,
                                                selectedRecipient === option.id && styles.milestoneOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedRecipient(option.id);
                                                setShowRecipientModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.milestoneOptionText,
                                                selectedRecipient === option.id && styles.milestoneOptionTextSelected
                                            ]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Children */}
                                    <Text style={styles.modalSectionTitle}>Children</Text>
                                    {RECIPIENT_OPTIONS.children.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.milestoneOption,
                                                selectedRecipient === option.id && styles.milestoneOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedRecipient(option.id);
                                                setShowRecipientModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.milestoneOptionText,
                                                selectedRecipient === option.id && styles.milestoneOptionTextSelected
                                            ]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Friends/Relationships */}
                                    <Text style={styles.modalSectionTitle}>Friends/Relationships</Text>
                                    {RECIPIENT_OPTIONS.friendsRelationships.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.milestoneOption,
                                                selectedRecipient === option.id && styles.milestoneOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedRecipient(option.id);
                                                setShowRecipientModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.milestoneOptionText,
                                                selectedRecipient === option.id && styles.milestoneOptionTextSelected
                                            ]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Professional/Social */}
                                    <Text style={styles.modalSectionTitle}>Professional/Social</Text>
                                    {RECIPIENT_OPTIONS.professionalSocial.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.milestoneOption,
                                                selectedRecipient === option.id && styles.milestoneOptionSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedRecipient(option.id);
                                                setShowRecipientModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.milestoneOptionText,
                                                selectedRecipient === option.id && styles.milestoneOptionTextSelected
                                            ]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Clear Selection Option */}
                                    <TouchableOpacity
                                        style={[styles.milestoneOption, { backgroundColor: '#f9f9f9', marginTop: 12 }]}
                                        onPress={() => {
                                            setSelectedRecipient('');
                                            setShowRecipientModal(false);
                                        }}
                                    >
                                        <Text style={styles.milestoneOptionText}>✕ Clear Selection</Text>
                                    </TouchableOpacity>
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowRecipientModal(false)}
                                >
                                    <Text style={styles.modalCloseButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {/* Person Name */}
            <Text style={styles.label}>{getPersonNameLabel(selectedMilestone)}</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Patrick"
                value={personName}
                onChangeText={setPersonName}
            />

            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
            >
                <Text>{dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={dobDate}
                    onChange={(_e, d) => {
                        setShowDatePicker(false);
                        if (d) setDobDate(d);
                    }}
                    mode="date"
                    display="default"
                />
            )}

            {/* Photos */}
            <Text style={styles.label}>Photos (up to 3)</Text>
            <View style={styles.photoGrid}>
                {[0, 1, 2].map((idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.photoSlot, { opacity: idx < photos.length ? 1 : 0.5 }]}
                        onPress={() => (idx < photos.length ? removePhoto(idx) : addPhoto())}
                    >
                        <Text style={styles.photoSlotText}>{idx < photos.length ? '✕' : '+'}</Text>
                        <Text style={styles.photoSlotLabel}>{idx < photos.length ? 'Remove' : 'Add Photo'}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Hometown */}
            <Text style={styles.label}>Hometown (City, State)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Springfield, MO"
                value={hometown}
                onChangeText={setHometown}
            />

            {/* Message Selection */}
            <Text style={styles.label}>{getMilestoneHeaderText(selectedMilestone)}</Text>
            <Text style={styles.hint}>Choose a pre-written message or write your own:</Text>

            <View style={styles.messageGrid}>
                <TouchableOpacity
                    style={[styles.messageBtn, selectedMessage === 'classic' && styles.messageBtnActive]}
                    onPress={() => setSelectedMessage('classic')}
                >
                    <Text style={styles.messageBtnIcon}>🎂</Text>
                    <Text style={styles.messageBtnLabel}>Classic Wish</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.messageBtn, selectedMessage === 'celebration' && styles.messageBtnActive]}
                    onPress={() => setSelectedMessage('celebration')}
                >
                    <Text style={styles.messageBtnIcon}>✨</Text>
                    <Text style={styles.messageBtnLabel}>Celebration</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.messageBtn, selectedMessage === 'heartfelt' && styles.messageBtnActive]}
                    onPress={() => setSelectedMessage('heartfelt')}
                >
                    <Text style={styles.messageBtnIcon}>💖</Text>
                    <Text style={styles.messageBtnLabel}>Heartfelt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.messageBtn, selectedMessage === 'custom' && styles.messageBtnActive]}
                    onPress={() => setSelectedMessage('custom')}
                >
                    <Text style={styles.messageBtnIcon}>✏️</Text>
                    <Text style={styles.messageBtnLabel}>Custom</Text>
                </TouchableOpacity>
            </View>

            {/* Message Preview */}
            <View style={styles.messagePreview}>
                <Text style={styles.messagePreviewText}>{getFinalMessage()}</Text>
            </View>

            {/* Custom Message Input */}
            <Text style={styles.label}>Add Custom Message (Optional)</Text>
            <Text style={styles.hint}>
                {selectedMessage === 'custom'
                    ? 'Write your own message from scratch'
                    : 'Add additional text to the pre-written message above'}
            </Text>
            <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder={selectedMessage === 'custom'
                    ? "Enter your custom message..."
                    : "Add your own personal touch..."}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
            />

            {/* Color Picker */}
            <Text style={styles.label}>Background Color</Text>
            <View style={{ alignSelf: 'center', width: '37.5%' }}>
                <View style={{ gap: 1.5, marginBottom: 4 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setSelectedColor(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: selectedColor === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setSelectedColor(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: selectedColor === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setSelectedColor(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: selectedColor === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 4 - Reds/Oranges */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setSelectedColor(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: selectedColor === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Row 5 - Grays */}
                    <View style={{ flexDirection: 'row', gap: 1.5 }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setSelectedColor(t)}
                                style={[
                                    styles.colorBox,
                                    {
                                        backgroundColor: COLOR_SCHEMES[t].bg,
                                        opacity: selectedColor === t ? 1 : 0.85,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: COLOR_SCHEMES[t].bg,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 6,
                                    }
                                ]}
                            >
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Build Button */}
            <TouchableOpacity
                style={[
                    styles.buildBtn,
                    { backgroundColor: COLOR_SCHEMES[selectedColor].bg }
                ]}
                onPress={handleBuild}
                disabled={loading}
            >
                <Text style={styles.buildBtnText}>{loading ? 'Building...' : 'Preview Birthday Time Capsule'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '900', marginBottom: 20, color: '#333' },
    label: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
    hint: { fontSize: 13, color: '#666', marginBottom: 12 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    messageInput: { minHeight: 100, textAlignVertical: 'top' },
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
    photoGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    photoSlot: {
        flex: 1,
        aspectRatio: 1,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoSlotText: { fontSize: 28, color: '#999' },
    photoSlotLabel: { fontSize: 12, color: '#999', marginTop: 4 },
    messageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    messageBtn: {
        width: '48%',
        paddingVertical: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    messageBtnActive: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
    messageBtnIcon: { fontSize: 28 },
    messageBtnLabel: { fontSize: 12, fontWeight: '700', marginTop: 4, color: '#333' },
    messagePreview: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    messagePreviewText: { fontSize: 14, color: '#333', lineHeight: 20 },
    colorBox: {
        flex: 1,
        aspectRatio: 1,
        height: 12.5,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#ffffff',
        padding: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    buildBtn: {
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buildBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
    dropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
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
        width: '85%',
        maxHeight: '80%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalScroll: {
        maxHeight: 400,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        color: '#666',
    },
    milestoneOption: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    milestoneOptionSelected: {
        backgroundColor: '#007AFF',
    },
    milestoneOptionText: {
        fontSize: 16,
        color: '#333',
    },
    milestoneOptionTextSelected: {
        color: '#fff',
    },
    modalCloseButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
