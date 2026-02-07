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

type Props = NativeStackScreenProps<RootStackParamList, 'LifeMilestones'>;

// Animated Color Box with cascading glow effect
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
    const birthdayEnding = ' Here is some interesting information surrounding your birthday.';
    const messages: Record<string, { classic: string; celebration: string; heartfelt: string }> = {
        birthday: {
            classic: 'Wishing {fullName} a year filled with belly laughs, surprise adventures, and way too much cake! {firstName} deserves every bit of happiness coming their way.' + birthdayEnding,
            celebration: 'Another trip around the sun and {fullName} is still the coolest person we know! Here\'s to more inside jokes, spontaneous dance parties, and making memories we\'ll laugh about forever.' + birthdayEnding,
            heartfelt: 'On this special day, we celebrate the amazing person {fullName} is. Their kindness, humor, and love light up our lives. We\'re so grateful {firstName} was born!' + birthdayEnding,
        },
        sweet16: {
            classic: 'Sweet 16 and absolutely fabulous! This is {fullName}\'s year to shine, dream big, and make every moment count. The world is so lucky to have {firstName} in it!' + birthdayEnding,
            celebration: 'Sixteen looks amazing on {fullName}! Get ready for new adventures, unforgettable moments, and all the fun that comes with this incredible milestone. Let\'s celebrate {firstName}!' + birthdayEnding,
            heartfelt: 'Watching {fullName} grow into the incredible person they are today fills our hearts with so much love and pride. Happy Sweet 16 to someone truly special!' + birthdayEnding,
        },
        '21st': {
            classic: 'Welcome to 21, {fullName}! The world is yours for the taking, and we can\'t wait to see all the amazing things you\'ll do. Cheers to this exciting new chapter!' + birthdayEnding,
            celebration: '{fullName} is 21 and ready to take on the world! This is the year for big dreams, wild adventures, and making memories that\'ll last a lifetime. Let\'s celebrate!' + birthdayEnding,
            heartfelt: 'Twenty-one years of {fullName} bringing joy to everyone around them. We\'re so proud of who they\'ve become and so excited for everything ahead. We love you to the moon and back!' + birthdayEnding,
        },
        highschool: {
            classic: 'Congratulations on your high school graduation! This is just the beginning of an incredible journey. The world is full of opportunities waiting for you. Here is some interesting information surrounding your graduation.',
            celebration: 'You did it! High school is officially in the rearview mirror. Time to celebrate this amazing achievement and get ready for the exciting adventures ahead! Here is some interesting information surrounding your graduation.',
            heartfelt: 'What an incredible milestone! All the hard work, dedication, and late nights have paid off. We are so proud of everything you have accomplished. The best is yet to come! Here is some interesting information surrounding your graduation.',
        },
        college: {
            classic: 'Congratulations on your college graduation! Years of hard work and determination have led to this proud moment. Your future is bright and full of endless possibilities. Here is some interesting information surrounding your graduation.',
            celebration: 'You made it! College is complete and a whole new chapter is about to begin. Time to celebrate this huge accomplishment and all the success that lies ahead! Here is some interesting information surrounding your graduation.',
            heartfelt: 'This diploma represents so much more than a degree. It represents perseverance, growth, and countless sacrifices. We could not be more proud of this achievement. Here is some interesting information surrounding your graduation.',
        },
        mothersday: {
            classic: 'We love you more than words can say. Happy Mother\'s Day!' + birthdayEnding,
            celebration: 'Thanks for everything you do! Today we celebrate YOU! Happy Mother\'s Day!' + birthdayEnding,
            heartfelt: 'We\'re so blessed to call you Mom. Happy Mother\'s Day!' + birthdayEnding,
        },
        fathersday: {
            classic: 'We\'re so lucky to have you. Happy Father\'s Day!' + birthdayEnding,
            celebration: 'Thanks for the bad jokes, the good advice, and always being there. Today is all about you! Happy Father\'s Day!' + birthdayEnding,
            heartfelt: 'We\'re grateful for every moment. Happy Father\'s Day to the best dad ever!' + birthdayEnding,
        },
    };

    // Anniversary messages (1st-60th)
    const anniversaryYears = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'];
    if (anniversaryYears.includes(milestoneId)) {
        return {
            classic: `{name}'s ${milestoneId} anniversary and still going strong! Your love story is one for the ages. Here's to many more years of happiness together.` + birthdayEnding,
            celebration: `${milestoneId} years of love, laughter, and putting up with each other! {name}, you two are relationship goals. Cheers to your amazing journey together!` + birthdayEnding,
            heartfelt: `${milestoneId} years of {name} building a beautiful life together. Your love inspires everyone around you. May your bond continue to grow stronger each day.` + birthdayEnding,
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
    const [spouse1, setSpouse1] = useState('');
    const [spouse2, setSpouse2] = useState('');
    const [lastName, setLastName] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [hometown, setHometown] = useState('Bellefontaine Neighbors, MO');
    const [dobDate, setDobDate] = useState<Date>(new Date(1970, 10, 15)); // November 15, 1970
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageKey>('classic');
    const [customMessage, setCustomMessage] = useState('');
    const [editableMessage, setEditableMessage] = useState('');
    const [messageWasEdited, setMessageWasEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ThemeName>('green');
    const [loading, setLoading] = useState(false);
    const [population, setPopulation] = useState<number | null>(null);

    // Cascading glow animation for color palette
    const glowAnims = useRef(
        Array.from({ length: 25 }, () => new Animated.Value(0))
    ).current;

    // Start cascading animation on mount
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

        // Build simple intro with age in greeting for birthdays
        const firstName = personName.split(' ')[0];
        const dobFormatted = `${month}/${day}/${birthDate.getFullYear()}`;

        // For birthdays, include age in the greeting
        let intro = '';

        function getOrdinalSuffix(n: number): string {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return (s[(v - 20) % 10] || s[v] || s[0]);
        }

        // Get the prewritten message
        const milestoneMessages = getMilestoneMessages(selectedMilestone);
        let msg = '';

        // For anniversaries, combine spouse names
        const isAnniversary = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'].includes(selectedMilestone);
        const displayName = isAnniversary ? `${spouse1} & ${spouse2}${lastName ? ' ' + lastName : ''}` : personName;

        if (selectedMessage === 'custom') {
            // Custom: complete control, no intro
            msg = customMessage;
        } else {
            msg = milestoneMessages[selectedMessage as keyof typeof milestoneMessages] || '';
            // Get first name only for {firstName} placeholder
            const firstNameOnly = (displayName || 'you').split(' ')[0];
            msg = msg.replace('{fullName}', displayName || 'you');
            msg = msg.replace('{firstName}', firstNameOnly);
            msg = msg.replace('{name}', displayName || 'you'); // For backwards compatibility

            // Prepend intro to prewritten message
            msg = intro + msg;

            // Append custom message if provided
            if (customMessage.trim()) {
                msg = `${msg} ${customMessage.trim()}`;
            }
        }

        return msg;
    };

    // Get the final message to use (edited or generated)
    const getMessageForPreview = () => {
        if (messageWasEdited) {
            return editableMessage;
        }
        return getFinalMessage();
    };

    const handleBuild = async () => {
        const isAnniversary = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'].includes(selectedMilestone);

        if (isAnniversary) {
            if (!spouse1.trim() || !spouse2.trim()) {
                Alert.alert('Required', 'Please enter both spouse names');
                return;
            }
        } else if (!personName.trim()) {
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

        // Get the final message (use edited version if customer modified it)
        let finalMessage = getMessageForPreview();
        if (selectedMilestone === 'birthday' || selectedMilestone === 'sweet16' || selectedMilestone === '21st') {
            finalMessage = `${finalMessage} Here is some interesting information surrounding your birthday.`;
        }

        // Split personName into first/middle/last for proper name handling
        const nameParts = personName.trim().split(' ').filter(Boolean);
        const firstNamePart = nameParts[0] || '';
        const lastNamePart = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleNamePart = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

        // Build babies array - always include at least one entry with the name, even without photos
        let babiesArray = [];
        if (photos.length > 0) {
            babiesArray = photos.slice(0, 3).map((photoUri, idx) => ({
                first: idx === 0 ? (isAnniversary ? spouse1.trim() : firstNamePart) : '',
                middle: idx === 0 ? (isAnniversary ? '' : middleNamePart) : '',
                last: isAnniversary ? lastName.trim() : lastNamePart,
                photoUri: photoUri
            }));
        } else {
            // No photos - still need the name data
            babiesArray = [{
                first: isAnniversary ? spouse1.trim() : firstNamePart,
                middle: isAnniversary ? '' : middleNamePart,
                last: isAnniversary ? lastName.trim() : lastNamePart,
                photoUri: null
            }];
        }

        const payload: any = {
            mode: 'milestone',
            theme: selectedColor,
            hometown: hometown.trim(),
            dobISO: dobISO,
            population: finalPopulation,
            personName: isAnniversary ? `${spouse1} & ${spouse2}${lastName ? ' ' + lastName : ''}` : personName.trim(),
            photoUri: photos[0] || null,
            babies: babiesArray,
            milestone: selectedMilestone,
            recipient: selectedRecipient,
            message: finalMessage,
            photos: photos,
            motherName: isAnniversary ? `${spouse1} & ${spouse2}${lastName ? ' ' + lastName : ''}` : personName.trim(),
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
            {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '15th', '20th', '25th', '30th', '40th', '50th', '60th'].includes(selectedMilestone) ? (
                <>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Spouse 1</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John"
                                value={spouse1}
                                onChangeText={setSpouse1}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Spouse 2</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Jane"
                                value={spouse2}
                                onChangeText={setSpouse2}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Smith"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.label}>{getPersonNameLabel(selectedMilestone)}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Patrick"
                        value={personName}
                        onChangeText={setPersonName}
                    />
                </>
            )}

            {/* Date */}
            <Text style={styles.label}>
                {milestoneCategory === 'anniversary' ? 'Date of Wedding/Marriage' : 'Date of Birth'}
            </Text>
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
                        style={styles.photoSlot}
                        onPress={() => (idx < photos.length ? removePhoto(idx) : addPhoto())}
                    >
                        {photos[idx] ? (
                            <>
                                <Image source={{ uri: photos[idx] }} style={styles.photoPreview} />
                                <View style={styles.removeButton}>
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.cameraIcon}>📷</Text>
                                <Text style={styles.photoSlotLabel}>Add Photo</Text>
                            </>
                        )}
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

            {/* Message Preview - EDITABLE */}
            <Text style={styles.label}>Your Message (Tap to Edit)</Text>
            <TextInput
                style={[styles.input, styles.messageInput, { minHeight: 120 }]}
                value={messageWasEdited ? editableMessage : getFinalMessage()}
                onChangeText={(text) => {
                    setEditableMessage(text);
                    setMessageWasEdited(true);
                }}
                multiline
                placeholder="Your message will appear here..."
            />

            {/* Color Picker */}
            <Text style={styles.label}>Background Color</Text>
            <View style={{ alignSelf: 'center', width: '45%' }}>
                <View style={{ gap: 4, marginBottom: 4 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={selectedColor === t}
                                onPress={() => setSelectedColor(t)}
                                glowAnim={glowAnims[0 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={selectedColor === t}
                                onPress={() => setSelectedColor(t)}
                                glowAnim={glowAnims[1 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={selectedColor === t}
                                onPress={() => setSelectedColor(t)}
                                glowAnim={glowAnims[2 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 4 - Reds/Oranges */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={selectedColor === t}
                                onPress={() => setSelectedColor(t)}
                                glowAnim={glowAnims[3 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 5 - Grays */}
                    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={selectedColor === t}
                                onPress={() => setSelectedColor(t)}
                                glowAnim={glowAnims[4 * 5 + colIndex]}
                            />
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
    content: { padding: 12, paddingBottom: 20 },
    title: { fontSize: 20, fontWeight: '900', marginBottom: 8, color: '#333' },
    label: { fontSize: 13, fontWeight: '700', color: '#333', marginTop: 6, marginBottom: 4 },
    hint: { fontSize: 11, color: '#666', marginBottom: 6 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    messageInput: { minHeight: 60, textAlignVertical: 'top' },
    toggleGroup: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#ddd',
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: '#007AFF' },
    toggleText: { fontWeight: '700', color: '#333', fontSize: 12 },
    toggleActiveText: { color: '#fff' },
    photoGrid: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    photoSlot: {
        flex: 1,
        height: 60,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraIcon: { fontSize: 24, marginBottom: 4 },
    photoSlotLabel: { fontSize: 11, color: '#999' },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    messageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    messageBtn: {
        width: '48%',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    messageBtnActive: { borderColor: '#007AFF', backgroundColor: '#E3F2FD' },
    messageBtnIcon: { fontSize: 20 },
    messageBtnLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, color: '#333' },
    messagePreview: {
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    messagePreviewText: { fontSize: 12, color: '#333', lineHeight: 16 },
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
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    buildBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
    dropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dropdownButtonText: {
        fontSize: 13,
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
