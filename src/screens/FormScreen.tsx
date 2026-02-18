import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from "react-native";
import PhotoUploadGrid from '../../components/PhotoUploadGrid';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFormContext } from '../context/FormContext';
import { COLOR_SCHEMES } from "../data/utils/colors";
import { getPopulationForCity } from '../data/utils/populations';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import type { RootStackParamList, ThemeName } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, "Form">;

// Animated Color Box with cascading glow effect
const AnimatedColorBox = ({
    themeName,
    isSelected,
    onPress,
    delay,
    glowAnim
}: {
    themeName: ThemeName;
    isSelected: boolean;
    onPress: () => void;
    delay: number;
    glowAnim: Animated.Value;
}) => {
    const bgColor = COLOR_SCHEMES[themeName].bg;

    // Create interpolated glow based on delay offset
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
                style={[
                    {
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
                    }
                ]}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+1</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function FormScreen({ navigation, route }: Props) {
    // Get form context for persistence
    const { formData: savedFormData, updateFormData, hasFormData } = useFormContext();

    // Initialize state from context (or defaults for testing)
    const [theme, setTheme] = useState<ThemeName>(savedFormData.theme as ThemeName || "green");
    const [mode, setMode] = useState<'baby' | 'birthday'>(savedFormData.mode === 'birthday' ? 'birthday' : 'baby');

    // Cascading glow animation for color palette
    const glowAnims = useRef(
        Array.from({ length: 25 }, () => new Animated.Value(0))
    ).current;

    // Start cascading animation on mount
    useEffect(() => {
        const runCascade = () => {
            // Reset all animations
            glowAnims.forEach(anim => anim.setValue(0));

            // 5x5 grid: column by column, top to bottom
            const animations: Animated.CompositeAnimation[] = [];

            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 5; row++) {
                    const index = row * 5 + col; // Grid index
                    const delay = (col * 5 + row) * 80; // 80ms stagger

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
                // Repeat after a pause
                setTimeout(runCascade, 2000);
            });
        };

        runCascade();
    }, []);

    // Load saved form data from context on mount (if user previously filled the form)
    const hasLoadedFromContext = useRef(false);
    useEffect(() => {
        if (!hasLoadedFromContext.current && hasFormData) {
            hasLoadedFromContext.current = true;
            // Load saved data from context
            if (savedFormData.babyFirst) setBabyFirst(savedFormData.babyFirst);
            if (savedFormData.babyMiddle) setBabyMiddle(savedFormData.babyMiddle);
            if (savedFormData.babyLast) setBabyLast(savedFormData.babyLast);
            if (savedFormData.babies && savedFormData.babies.length > 0) setBabies(savedFormData.babies);
            if (savedFormData.babyCount) setBabyCount(savedFormData.babyCount);
            if (savedFormData.motherName) setMotherName(savedFormData.motherName);
            if (savedFormData.fatherName) setFatherName(savedFormData.fatherName);
            if (savedFormData.email) setEmail(savedFormData.email);
            if (savedFormData.hometown) setHometown(savedFormData.hometown);
            if (savedFormData.dobDate) setDobDate(savedFormData.dobDate);
            if (savedFormData.birthTime) setBirthTime(savedFormData.birthTime);
            if (savedFormData.weightLb) setWeightLb(savedFormData.weightLb);
            if (savedFormData.weightOz) setWeightOz(savedFormData.weightOz);
            if (savedFormData.lengthIn) setLengthIn(savedFormData.lengthIn);
            if (savedFormData.photoUris !== undefined) setPhotoUris(savedFormData.photoUris);
            else if (savedFormData.photoUri !== undefined) setPhotoUris([savedFormData.photoUri, null, null]);
            if (savedFormData.snapshot && Object.keys(savedFormData.snapshot).length > 0) setSnapshot(savedFormData.snapshot);
            if (savedFormData.population !== null) setPopulation(savedFormData.population);
        }
    }, [hasFormData, savedFormData]);

    // TEST DATA - Prefilled for easy testing
    // ðŸ§ª For testing long names, uncomment these lines:
    // const [babyFirst, setBabyFirst] = useState("Bartholomew Christopher");
    // const [babyLast, setBabyLast] = useState("Montgomery-Williams-Henderson");
    // const [hometown, setHometown] = useState("San Francisco International Airport, California");

    const [babyFirst, setBabyFirst] = useState("Emily");
    const [babyMiddle, setBabyMiddle] = useState("Grace");
    const [babyLast, setBabyLast] = useState("Sample");
    const [babies, setBabies] = useState<Array<{ first: string; middle?: string; last?: string; photoUri?: string | null }>>([
        {
            first: 'Emily',
            middle: 'Grace',
            last: 'Sample',
            photoUri: null
        },
        {
            first: 'Jimmy',
            middle: 'Bobby',
            last: 'Sample',
            photoUri: null
        },
    ]);
    const [babyCount, setBabyCount] = useState<number>(2); // Twins
    const [motherName, setMotherName] = useState("Sarah Sample");
    const [fatherName, setFatherName] = useState("Jack Sample");
    const [email, setEmail] = useState(""); // For marketing
    const [hometown, setHometown] = useState("Kansas City, MO");
    const [dobDate, setDobDate] = useState<Date>(new Date(2026, 1, 14)); // Feb 14, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [birthTime, setBirthTime] = useState<Date>(new Date()); // Time of birth
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [weightLb, setWeightLb] = useState("7");
    const [weightOz, setWeightOz] = useState("8");
    const [lengthIn, setLengthIn] = useState("20");
    const [photoUris, setPhotoUris] = useState<(string | null)[]>([null, null, null]);

    const [touched, setTouched] = useState({ babyFirst: false, hometown: false });
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const [population, setPopulation] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Letter to Baby — separate letters from Mom and Dad
    const babyDisplayName = babies[0]?.first?.trim() || 'Baby';

    const MOM_SAMPLE_LETTERS = [
        `Dear BABYNAME,\n\nI still remember the moment they placed you in my arms for the very first time. You were so tiny, so perfect, and I couldn't stop crying — happy tears, the best kind. The whole world just stopped. Nothing else mattered except you.\n\nThe ride to the hospital was a blur of excitement and nerves. Your dad was trying so hard to stay calm, but I could see his hands shaking on the steering wheel. We'd been waiting for you for so long, and suddenly it was really happening.\n\nThe doctor said you were perfect — and I already knew. I'd been talking to you for months, feeling you kick, wondering what you'd look like. And there you were. Ten tiny fingers, ten tiny toes, the softest skin I'd ever touched.\n\nWe were up all night that first night — just staring at you, counting your breaths, making sure you were real. I whispered promises to you in the dark: that I would always protect you, that I would always be there, that you would always know how deeply you are loved.\n\nIf you're reading this years from now, I hope you know that nothing in my life has ever come close to the joy of being your mother. You made me braver, stronger, and more grateful than I ever thought possible.\n\nI love you more than words could ever say.\n\nForever yours,\nMom 💕`,
        `My sweet BABYNAME,\n\nThe night before you were born, I couldn't sleep. Not because I was uncomfortable — well, maybe a little — but because I was so excited to finally meet you. I'd been dreaming about your face for nine months.\n\nWhen we got to the hospital, everything felt surreal. The nurses were so kind, your dad held my hand the entire time, and the doctor kept saying everything was going beautifully. And then — there you were. The most incredible sound I've ever heard was your first cry.\n\nI held you against my chest and time just stopped. Your tiny hand wrapped around my finger and I knew — I knew right then — that I would move mountains for you. I would walk through fire. I would do anything and everything to give you a beautiful life.\n\nYour dad and I barely slept those first few days, but we didn't care. We just wanted to watch you — every yawn, every stretch, every little sound you made. You were our miracle.\n\nSomeday when you read this, I want you to know: from the very first second, you were wanted. You were celebrated. You were the answer to every prayer I ever whispered.\n\nAll my love, always,\nMom 💕`,
        `To my beautiful BABYNAME,\n\nI want to tell you about the day that changed everything — the day you arrived.\n\nWe rushed to the hospital early that morning. I remember the sunrise through the car window, all gold and pink, like the sky already knew something wonderful was about to happen. Your dad drove so carefully, checking on me at every red light.\n\nThe hours in that hospital room were long, but I wasn't scared. I just kept thinking about you — who you'd look like, what your laugh would sound like, all the adventures we'd have together.\n\nAnd then the doctor placed you on my chest. BABYNAME, I have never felt anything like that moment. Pure, overwhelming love. I looked at your face and thought, "There you are. I've been waiting my whole life for you."\n\nThat first night, I held you while the whole world slept. I promised you the moon and the stars. I promised you safety, warmth, and a home full of love. I promised you that no matter what life brings, I will always, always be in your corner.\n\nYou are my greatest gift. You are my reason for everything.\n\nWith all the love in my heart,\nMom 💕`,
    ];

    const DAD_SAMPLE_LETTERS = [
        `Dear BABYNAME,\n\nI'm going to be honest with you — the day you were born, I was terrified. Not of you, of course. I was terrified of messing this up. Being someone's dad? That's the biggest job in the world, and I wanted to get it right from the very first second.\n\nThe drive to the hospital was the longest drive of my life. My hands were shaking. Your mom was so strong, so calm — way calmer than me. I kept thinking, "We're really doing this. We're about to meet our baby."\n\nWhen the doctor held you up and I heard your first cry, something inside me changed forever. I can't explain it. It was like my whole life suddenly made sense. Every decision, every path I'd ever taken — it all led to this moment. To you.\n\nI held you for the first time and you were so small. Your whole hand barely wrapped around my finger. I looked down at you and made you a promise right then: I will protect you. I will provide for you. I will be there — for every game, every scraped knee, every bad day, every celebration. I will show up. Every single time.\n\nWe were up all night that first night. Your mom and I just took turns holding you, staring at you, wondering how we got so lucky. The nurses probably thought we were crazy — but we didn't care. We had you.\n\nIf you're reading this someday, know this: you are the best thing I have ever done. Being your dad is my greatest honor.\n\nI love you, kid. More than you'll ever know.\n\nDad 💙`,
        `BABYNAME,\n\nLet me tell you something — nothing prepares you for the moment you become a dad. You can read all the books, watch all the videos, get all the advice from friends. But nothing comes close to the real thing.\n\nI remember pacing the hospital hallway, nervous out of my mind. Your mom was incredible — she's the toughest person I know. The doctors and nurses were amazing. And then it happened. You were here.\n\nThey put you in my arms and I just froze. I couldn't speak. I couldn't move. I just stared at you. This tiny little person, looking up at me, trusting me completely. And I thought, "I will never let you down."\n\nThat first night was chaos in the best way. You fussed, we figured it out. You cried, we figured it out. We were a team from day one — you, me, and your mom. And I realized that's what family is. You don't have to know all the answers. You just have to show up and love each other through it.\n\nI want you to know that I will work every single day to give you a life full of joy, safety, and opportunity. I will be at every game, every recital, every parent-teacher conference. I will teach you to ride a bike, throw a ball, and stand up for what's right.\n\nYou are my purpose, BABYNAME. You always will be.\n\nLove,\nDad 💙`,
        `Hey BABYNAME,\n\nIf you're reading this, it means you're old enough to understand how much this day meant to me. So let me take you back.\n\nThe morning you were born started with your mom waking me up at 3 AM. "It's time," she said. I jumped out of bed so fast I almost tripped over the hospital bag we'd packed three weeks early. We'd been ready for you for a long time.\n\nThe hospital was quiet that early in the morning. The hallway lights were dim, the nurses were calm, and everything felt like it was moving in slow motion. Your mom was a warrior — I've never been more proud of anyone.\n\nAnd then you arrived. The doctor lifted you up, you let out your first cry, and I completely lost it. Tears just streaming down my face. I didn't care who saw. My baby was here.\n\nI cut the cord. They cleaned you up. And then they handed you to me. BABYNAME, I looked at your face and I saw the future. I saw birthday parties and first days of school. I saw teaching you to drive and watching you graduate. I saw every moment that mattered, and I promised myself I would be there for all of them.\n\nYour mom and I didn't sleep that night. We just held you, talked about your future, and thanked God for the gift of you. The best gift either of us has ever received.\n\nI love you more than I'll ever be able to put into words. But I'll spend my whole life trying.\n\nYour biggest fan,\nDad 💙`,
    ];

    const getMomSample = (idx: number) => MOM_SAMPLE_LETTERS[idx].replace(/BABYNAME/g, babyDisplayName);
    const getDadSample = (idx: number) => DAD_SAMPLE_LETTERS[idx].replace(/BABYNAME/g, babyDisplayName);

    const JOINT_SAMPLE_LETTERS = [
        `Dear BABYNAME,\n\nWe're writing this letter together, side by side, just hours after you arrived — and we still can't believe you're really here.\n\nThe ride to the hospital felt like the longest drive of our lives. We held hands the whole way, barely speaking, just knowing that everything was about to change. And then it did.\n\nWhen the doctor placed you in our arms for the first time, we both cried. There's no other way to say it. You were so small, so perfect, and so completely ours. We counted your fingers and your toes. We studied your face. We whispered your name over and over because it finally belonged to someone real.\n\nThe nurses checked on us all night, but we barely slept. We just took turns holding you, watching you breathe, marveling at every tiny sound you made. At one point we looked at each other and said, "We made this incredible person."\n\nBABYNAME, we want you to know something we promised each other the night you were born: we will always put you first. We will protect you from everything we can, prepare you for everything we can't, and love you through all of it. We will build a life for you that is safe, warm, full of laughter, and overflowing with love.\n\nWe don't know exactly what the future holds, but we know this — we will face it together, as a family. And that family started the moment we met you.\n\nYou are our greatest adventure. You are our whole heart.\n\nWith all the love in the world,\nMom & Dad 💕💙`,
        `Our precious BABYNAME,\n\nAs we sit here writing this together, you're sleeping peacefully in the hospital bassinet beside us, and we're still trying to catch our breath after the most incredible day of our lives.\n\nWe'd been planning for you for so long — putting the crib together, washing the tiny clothes, arguing over names (in the best way). But nothing could have prepared us for this.\n\nYour mom was a warrior today. The bravest, strongest person in any room. And your dad? Well, he tried to be brave too — but honestly, the tears came the moment we heard your first cry. No shame in that.\n\nThe doctor said everything went beautifully. And when they handed you to us, the whole world went quiet. It was just you, and us, and this overwhelming feeling that life would never be the same — and we wouldn't want it to be.\n\nWe stayed up all that first night. Not because we had to, but because we couldn't look away. Every time you moved, we smiled. Every time you yawned, we melted. We took turns whispering our promises to you: We will always be here. We will always show up. We will always choose you.\n\nIf you're reading this years from now, we want you to know — you were the most wanted, most celebrated, most loved baby on the planet. And nothing will ever change that.\n\nForever and always yours,\nMom & Dad 💕💙`,
        `To our darling BABYNAME,\n\nWe're writing this letter together because that's how we want to do everything from now on — together, with you.\n\nLet us tell you about the day we became a family.\n\nIt started early — before the sun came up. We grabbed the hospital bag, double-checked the car seat (for the third time), and headed out. The streets were empty, the sky was still dark, and somewhere between the house and the hospital, the reality hit us both at the same time: this was really happening.\n\nThe hours that followed were intense, beautiful, and unforgettable. We leaned on the doctors and nurses, we leaned on each other, and we kept reminding ourselves that you were worth every single second.\n\nAnd then — there you were. BABYNAME. Our baby. The most perfect thing we'd ever seen. We held you between us and just cried — happy, grateful, overwhelmed tears. The doctor smiled at us and said, "Congratulations, you have a beautiful baby." We already knew.\n\nThat night in the hospital was magical. We barely slept, but we didn't care. We talked about your future — where you'd go to school, what sports you'd play, whether you'd like chocolate or vanilla. We dreamed big dreams for you while you slept small in our arms.\n\nBABYNAME, here is our promise: we will provide for you, protect you, and pour everything we have into giving you the life you deserve. We will be your biggest fans, your safest place, and your loudest cheerleaders. Always.\n\nYou completed us. You really did.\n\nAll our love, today and every day,\nMom & Dad 💕💙`,
    ];

    const getJointSample = (idx: number) => JOINT_SAMPLE_LETTERS[idx].replace(/BABYNAME/g, babyDisplayName);

    const [motherLetter, setMotherLetter] = useState('');
    const [fatherLetter, setFatherLetter] = useState('');
    const [jointLetter, setJointLetter] = useState('');
    const [selectedMomIdx, setSelectedMomIdx] = useState<number | null>(null);
    const [selectedDadIdx, setSelectedDadIdx] = useState<number | null>(null);
    const [selectedJointIdx, setSelectedJointIdx] = useState<number | null>(null);

    const selectMomSample = (idx: number) => {
        setSelectedMomIdx(idx);
        setMotherLetter(getMomSample(idx));
    };
    const selectDadSample = (idx: number) => {
        setSelectedDadIdx(idx);
        setFatherLetter(getDadSample(idx));
    };
    const selectJointSample = (idx: number) => {
        setSelectedJointIdx(idx);
        setJointLetter(getJointSample(idx));
    };

    const canBuild = (babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0) && hometown.trim().length > 0;

    // Sync form data to context when fields change
    useEffect(() => {
        updateFormData({
            theme,
            mode,
            babyFirst,
            babyMiddle,
            babyLast,
            babies,
            babyCount,
            motherName,
            fatherName,
            email,
            hometown,
            dobDate,
            birthTime,
            weightLb,
            weightOz,
            lengthIn,
            photoUris,
            snapshot,
            population,
        });
    }, [theme, mode, babyFirst, babyMiddle, babyLast, babies, babyCount, motherName, fatherName, email, hometown, dobDate, birthTime, weightLb, weightOz, lengthIn, photoUris, snapshot, population]);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!hometown.trim() || hometown.length < 3) return;
            try {
                setLoading(true);
                console.log('ðŸ™ï¸  Fetching data for hometown:', hometown, 'birth year:', dobDate.getFullYear());
                console.log('ðŸ“± Device info - User Agent:', navigator.userAgent);
                console.log('ðŸŒ Network state:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

                // Fetch snapshot data from Google Sheets with timeout
                console.log('ðŸ“Š Starting snapshot fetch...');
                const snapshotPromise = getAllSnapshotValues();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout after 15 seconds')), 15000)
                );

                const snapshotData = await Promise.race([snapshotPromise, timeoutPromise]) as Record<string, string>;
                console.log('âœ… Snapshot data fetched:', Object.keys(snapshotData).length, 'entries');
                console.log('ðŸ“Š Sample data:', Object.keys(snapshotData).slice(0, 3));
                setSnapshot(snapshotData);

                // Fetch population for the entered hometown
                // âš ï¸ CRITICAL: Must pass DOB - if after 2020-01-01, uses Google Sheets CSV (mandatory)
                console.log('ðŸ‘¥ Starting population fetch for:', hometown);
                const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
                const cityPopulation = await getPopulationForCity(hometown, dobISO);
                console.log('âœ… Population result:', cityPopulation);
                setPopulation(cityPopulation);
            } catch (error) {
                console.error('âŒ MOBILE NETWORK ERROR:', error);
                const err = error as Error;
                console.error('Error type:', err.name || 'Unknown');
                console.error('Error message:', err.message || 'Unknown error');
                console.error('Network online status:', navigator.onLine);

                // Provide fallback data for offline/error scenarios
                console.log('ðŸ”„ Using fallback data...');
                setSnapshot({
                    'GALLON OF GASOLINE': '$3.07',
                    'US POPULATION': '342,651,000',
                    'PRESIDENT': 'Historical data temporarily unavailable'
                });
                setPopulation(null);

                // Show user-friendly error if needed
                Alert.alert(
                    'Network Issue',
                    'Having trouble loading latest data. Using cached information. Please check your internet connection.',
                    [{ text: 'OK' }]
                );
            } finally {
                setLoading(false);
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [hometown, dobDate]);

    async function pickPhotoForBaby(index?: number) {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const granted = (perm as any).status === 'granted' || (perm as any).granted === true;
            if (!granted) {
                alert('Permission required to pick a photo. Please enable Photos/Media access in Settings.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, quality: 1,
            });
            const cancelled = (result as any).canceled === true || (result as any).cancelled === true;
            const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri ?? null;
            if (cancelled) return;
            if (!uri) {
                alert('Failed to pick a photo. Please try again.');
                return;
            }
            if (typeof index === 'number') {
                setBabies(bs => {
                    const copy = [...bs];
                    copy[index] = { ...copy[index], photoUri: uri };
                    return copy;
                });
            } else {
                // Add to first empty photoUris slot
                setPhotoUris(prev => {
                    const copy = [...prev];
                    const emptyIndex = copy.findIndex(p => !p);
                    if (emptyIndex !== -1) {
                        copy[emptyIndex] = uri;
                    } else {
                        copy[0] = uri;
                    }
                    return copy;
                });
            }
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    }

    // Pick photo into a specific slot (0, 1, or 2)
    async function pickPhotoSlot(slotIndex: number) {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const granted = (perm as any).status === 'granted' || (perm as any).granted === true;
            if (!granted) {
                alert('Permission required to pick a photo. Please enable Photos/Media access in Settings.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, quality: 1,
            });
            const cancelled = (result as any).canceled === true || (result as any).cancelled === true;
            const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri ?? null;
            if (cancelled) return;
            if (!uri) {
                alert('Failed to pick a photo. Please try again.');
                return;
            }
            setPhotoUris(prev => {
                const copy = [...prev];
                copy[slotIndex] = uri;
                return copy;
            });
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    }

    function removePhotoSlot(slotIndex: number) {
        setPhotoUris(prev => {
            const copy = [...prev];
            copy[slotIndex] = null;
            return copy;
        });
    }

    function removePhotoForBaby(index: number) {
        setBabies(bs => {
            const copy = [...bs];
            copy[index] = { ...copy[index], photoUri: null };
            return copy;
        });
    }

    useEffect(() => {
        setBabies(bs => {
            const copy = [...bs];
            while (copy.length < babyCount) copy.push({ first: '' });
            while (copy.length > babyCount) copy.pop();
            return copy;
        });
    }, [babyCount]);

    async function onBuild() {
        const hasBabyNames = babies.some(b => (b.first || '').trim().length > 0) || babyFirst.trim().length > 0;
        if (!hasBabyNames || !hometown.trim()) {
            setTouched(t => ({ ...t, babyFirst: true, hometown: true }));
            alert("Please complete the required fields: Baby first name and Hometown.");
            return;
        }
        let finalPopulation = population;
        if (!finalPopulation) {
            try {
                setLoading(true);
                // âš ï¸ CRITICAL: Must pass DOB - routes to HISTORICAL CSV (before 2020) or CURRENT CSV (after 2020)
                const dobISO = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
                finalPopulation = await getPopulationForCity(hometown.trim(), dobISO);
                setPopulation(finalPopulation);

                /**
                 * âš ï¸ CRITICAL: CITY NOT FOUND - SHOW ERROR POPUP
                 * Do NOT use default fallback population - user must correct the city
                 */
                if (finalPopulation === null) {
                    Alert.alert(
                        'City Not Found',
                        'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                        [{ text: 'OK' }]
                    );
                    setLoading(false);
                    return;
                }
            } catch (error) {
                const err = error as Error;
                const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Network') || err.message?.includes('timeout');
                Alert.alert(
                    isNetworkError ? 'Network Error' : 'City Not Found',
                    isNetworkError
                        ? 'Unable to connect to population database. Please check your internet connection and try again.'
                        : 'OUR RECORDS INDICATE THAT THIS CITY, ST DOES NOT EXIST, WAS NOT INCORPORATED AT THE DATE OF BIRTH OR THE SPELLING OF CITY, ST IS INCORRECT.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        }
        const meaningfulBabies = babies.filter(b => (b.first || '').trim().length > 0);
        const payload: any = {
            theme,
            motherName: motherName.trim(),
            fatherName: fatherName.trim(),
            email: email.trim(),
            hometown: hometown.trim(),
            dobISO: `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`,
            // Only include weight/length for single babies
            weightLb: babyCount === 1 ? weightLb.trim() : '',
            weightOz: babyCount === 1 ? weightOz.trim() : '',
            lengthIn: babyCount === 1 ? lengthIn.trim() : '',
        };
        if (meaningfulBabies.length > 0) {
            payload.babies = meaningfulBabies.map(b => ({
                first: (b.first || '').trim(),
                middle: (b.middle || '').trim(),
                last: (b.last || '').trim(),
                photoUri: b.photoUri ?? null
            }));
            // Construct personName from ALL baby names for twins/triplets
            if (babyCount === 1) {
                const firstBaby = meaningfulBabies[0];
                const nameParts = [
                    (firstBaby.first || '').trim(),
                    (firstBaby.middle || '').trim(),
                    (firstBaby.last || '').trim()
                ].filter(Boolean);
                payload.personName = nameParts.join(' ');
            } else {
                // Join all baby first names: "Emma & Olivia" or "Emma, Olivia & Liam"
                const firstNames = meaningfulBabies.map(b => (b.first || '').trim()).filter(Boolean);
                if (firstNames.length === 2) {
                    payload.personName = firstNames.join(' & ');
                } else if (firstNames.length === 3) {
                    payload.personName = `${firstNames[0]}, ${firstNames[1]} & ${firstNames[2]}`;
                } else {
                    payload.personName = firstNames.join(', ');
                }
            }
            payload.babyCount = babyCount;
            // For single baby, use the photoUris state (3-slot picker); for twins/triplets, use individual baby photos
            if (babyCount === 1) {
                payload.photoUris = photoUris.filter(p => p !== null);
            } else {
                payload.photoUris = meaningfulBabies.map(b => b.photoUri ?? null);
            }
        } else {
            payload.babyFirst = babyFirst.trim();
            payload.babyMiddle = babyMiddle.trim();
            payload.babyLast = babyLast.trim();
            payload.photoUris = photoUris.filter(p => p !== null);
            // Construct personName from individual fields
            const nameParts = [babyFirst.trim(), babyMiddle.trim(), babyLast.trim()].filter(Boolean);
            payload.personName = nameParts.join(' ');
        }
        payload.mode = 'baby';
        payload.babyCount = payload.babyCount || babyCount;
        payload.frontOrientation = 'landscape';
        payload.timeCapsuleOrientation = 'landscape';
        payload.snapshot = snapshot;
        payload.population = finalPopulation;
        // Letter to Baby
        payload.motherLetter = motherLetter;
        payload.fatherLetter = fatherLetter;
        payload.jointLetter = jointLetter;
        navigation.navigate('Preview', payload);
    }

    const C = COLOR_SCHEMES[theme as keyof typeof COLOR_SCHEMES];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{mode === 'baby' ? 'Newborn Baby Announcement' : 'Time Capsule Gift'}</Text>

            {/* Baby Count Toggle */}
            <Text style={styles.label}>{mode === 'baby' ? 'How many babies?' : 'How many people?'}</Text>
            <View style={styles.toggleGroup}>
                {(['Single', 'Twins', 'Triplets'] as const).map((lbl, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.toggleBtn, babyCount === idx + 1 && styles.toggleActive]}
                        onPress={() => setBabyCount(idx + 1)}
                    >
                        <Text style={[styles.toggleText, babyCount === idx + 1 && styles.toggleActiveText]}>
                            {mode === 'baby' ? lbl : (idx === 0 ? 'One' : idx === 1 ? 'Two' : 'Three')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Baby Input Fields */}
            {babies.map((b, idx) => (
                <View key={idx} style={styles.babySection}>
                    {babyCount > 1 && (
                        <Text style={styles.sectionTitle}>{mode === 'baby' ? `Baby ${idx + 1}` : `Person ${idx + 1}`}</Text>
                    )}

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={[styles.input, touched.babyFirst && !(b.first || '').trim() && styles.inputError]}
                        placeholder="First name"
                        placeholderTextColor="#999"
                        value={b.first}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], first: t }; return copy; })}
                    />

                    <Text style={styles.label}>Middle Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Middle name"
                        placeholderTextColor="#999"
                        value={b.middle || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], middle: t }; return copy; })}
                    />

                    <Text style={styles.label}>Last Name (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        placeholderTextColor="#999"
                        value={b.last || ''}
                        onChangeText={t => setBabies(bs => { const copy = [...bs]; copy[idx] = { ...copy[idx], last: t }; return copy; })}
                    />

                    {/* Photo Upload - 3 slots for single baby, 1 per baby for twins/triplets */}
                    {babyCount === 1 ? (
                        <PhotoUploadGrid
                            photos={photoUris}
                            onPhotosChange={setPhotoUris}
                            maxPhotos={3}
                            label="Photos (Optional - up to 3)"
                        />
                    ) : (
                        <>
                            <Text style={styles.label}>Photo (optional)</Text>
                            <TouchableOpacity
                                style={[styles.uploadBtn, b.photoUri && styles.uploadBtnSelected]}
                                onPress={() => pickPhotoForBaby(idx)}
                            >
                                <Text style={styles.uploadBtnText}>
                                    {b.photoUri ? '✓ Photo Selected' : '📷 Upload Photo'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ))}

            {/* Parents */}
            <Text style={styles.label}>Mother's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Mother's name"
                placeholderTextColor="#999"
                value={motherName}
                onChangeText={setMotherName}
            />

            <Text style={styles.label}>Father's Name (optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Father's name"
                placeholderTextColor="#999"
                value={fatherName}
                onChangeText={setFatherName}
            />

            {/* Hometown */}
            <Text style={styles.label}>Hometown (City, State) - required</Text>
            <TextInput
                style={[styles.input, touched.hometown && !hometown.trim() && styles.inputError]}
                placeholder="e.g., Springfield, MO"
                placeholderTextColor="#999"
                value={hometown}
                onChangeText={setHometown}
                autoCapitalize="words"
                onBlur={() => setTouched(t => ({ ...t, hometown: true }))}
            />
            {loading && (
                <Text style={styles.statusText}>Finding population data...</Text>
            )}
            {population && (
                <Text style={styles.statusText}>Population: {population.toLocaleString()}</Text>
            )}
            {touched.hometown && !hometown.trim() && (
                <Text style={styles.errorText}>Hometown is required</Text>
            )}

            {/* Date of Birth */}
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{mode === 'baby' ? 'Date of Birth' : 'Birthday'}</Text>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateBtnText}>
                            {dobDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
                        </Text>
                    </TouchableOpacity>
                    <ScrollableDatePicker
                        visible={showDatePicker}
                        date={dobDate}
                        onDateChange={(date) => setDobDate(date)}
                        onClose={() => setShowDatePicker(false)}
                        title={mode === 'baby' ? 'Date of Birth' : 'Birthday'}
                    />
                </View>
                {mode === 'baby' && (
                    <View style={{ width: 110 }}>
                        <Text style={styles.label}>Time of Birth</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateBtnText}>
                                {birthTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={birthTime}
                                onChange={(_e, t) => { setShowTimePicker(false); if (t) setBirthTime(t); }}
                                mode="time"
                                display="default"
                            />
                        )}
                    </View>
                )}
            </View>

            {/* Measurements (only for single baby) */}
            {mode === 'baby' && babyCount === 1 && (
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Weight (lbs)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="7"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={weightLb}
                            onChangeText={setWeightLb}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Weight (oz)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="8"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={weightOz}
                            onChangeText={setWeightOz}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Length (in)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="20"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={lengthIn}
                            onChangeText={setLengthIn}
                        />
                    </View>
                </View>
            )}

            {mode === 'baby' && babyCount > 1 && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Weight & Length not available for {babyCount === 2 ? 'twins' : 'triplets'}
                    </Text>
                </View>
            )}

            {/* 💌 Letter to Baby — Separate keepsake page */}
            {mode === 'baby' && (
                <View style={styles.messageSectionContainer}>
                    <Text style={styles.messageSectionTitle}>💌 Letter to {babyDisplayName}</Text>
                    <Text style={styles.messageSectionSubtitle}>
                        Write a heartfelt letter for {babyDisplayName} to read someday. This will be its own keepsake page — separate from the announcement and time capsule. Choose a sample and make it your own, or write from scratch.
                    </Text>

                    {/* Mom's Letter */}
                    <View style={styles.letterSection}>
                        <Text style={styles.letterSectionHeader}>From {motherName || 'Mom'} 💕</Text>
                        <View style={styles.sampleBtnRow}>
                            {(['Sample 1', 'Sample 2', 'Sample 3'] as const).map((label, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.sampleBtn, selectedMomIdx === idx && styles.sampleBtnActive]}
                                    onPress={() => selectMomSample(idx)}
                                >
                                    <Text style={[styles.sampleBtnText, selectedMomIdx === idx && styles.sampleBtnTextActive]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.messageInput}
                            placeholder={`${motherName || 'Mom'}'s letter to ${babyDisplayName}...`}
                            placeholderTextColor="#999"
                            value={motherLetter}
                            onChangeText={(text) => {
                                setMotherLetter(text);
                                if (selectedMomIdx !== null && text !== getMomSample(selectedMomIdx)) {
                                    setSelectedMomIdx(null);
                                }
                            }}
                            multiline
                            textAlignVertical="top"
                        />
                        {motherLetter.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearMessageBtn}
                                onPress={() => { setMotherLetter(''); setSelectedMomIdx(null); }}
                            >
                                <Text style={styles.clearMessageBtnText}>✕ Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Dad's Letter */}
                    <View style={[styles.letterSection, { marginTop: 20 }]}>
                        <Text style={styles.letterSectionHeader}>From {fatherName || 'Dad'} 💙</Text>
                        <View style={styles.sampleBtnRow}>
                            {(['Sample 1', 'Sample 2', 'Sample 3'] as const).map((label, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.sampleBtn, selectedDadIdx === idx && styles.sampleBtnActive]}
                                    onPress={() => selectDadSample(idx)}
                                >
                                    <Text style={[styles.sampleBtnText, selectedDadIdx === idx && styles.sampleBtnTextActive]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.messageInput}
                            placeholder={`${fatherName || 'Dad'}'s letter to ${babyDisplayName}...`}
                            placeholderTextColor="#999"
                            value={fatherLetter}
                            onChangeText={(text) => {
                                setFatherLetter(text);
                                if (selectedDadIdx !== null && text !== getDadSample(selectedDadIdx)) {
                                    setSelectedDadIdx(null);
                                }
                            }}
                            multiline
                            textAlignVertical="top"
                        />
                        {fatherLetter.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearMessageBtn}
                                onPress={() => { setFatherLetter(''); setSelectedDadIdx(null); }}
                            >
                                <Text style={styles.clearMessageBtnText}>✕ Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Joint Letter from Both Parents */}
                    <View style={[styles.letterSection, { marginTop: 20 }]}>
                        <Text style={styles.letterSectionHeader}>From Both of Us Together 💕💙</Text>
                        <Text style={[styles.messageSectionSubtitle, { marginBottom: 10 }]}>
                            A single letter from both parents, written as one voice.
                        </Text>
                        <View style={styles.sampleBtnRow}>
                            {(['Sample 1', 'Sample 2', 'Sample 3'] as const).map((label, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.sampleBtn, selectedJointIdx === idx && styles.sampleBtnActive]}
                                    onPress={() => selectJointSample(idx)}
                                >
                                    <Text style={[styles.sampleBtnText, selectedJointIdx === idx && styles.sampleBtnTextActive]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.messageInput}
                            placeholder={`A joint letter from ${motherName || 'Mom'} & ${fatherName || 'Dad'} to ${babyDisplayName}...`}
                            placeholderTextColor="#999"
                            value={jointLetter}
                            onChangeText={(text) => {
                                setJointLetter(text);
                                if (selectedJointIdx !== null && text !== getJointSample(selectedJointIdx)) {
                                    setSelectedJointIdx(null);
                                }
                            }}
                            multiline
                            textAlignVertical="top"
                        />
                        {jointLetter.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearMessageBtn}
                                onPress={() => { setJointLetter(''); setSelectedJointIdx(null); }}
                            >
                                <Text style={styles.clearMessageBtnText}>✕ Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Color Picker */}
            <Text style={[styles.label, { textAlign: 'center', marginTop: 20 }]}>Background Color</Text>
            <Text style={styles.colorHint}>Choose your announcement color (text will be white)</Text>

            {/* Color Grid - 5 rows x 5 columns with cascading animation */}
            <View style={{ alignSelf: 'center', marginTop: 12 }}>
                <View style={{ gap: 6 }}>
                    {/* Row 1 - Blues */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['lightBlue', 'royalBlue', 'mediumBlue', 'navyBlue', 'teal'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={colIndex * 80}
                                glowAnim={glowAnims[0 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 2 - Greens */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['darkGreen', 'forestGreen', 'green', 'limeGreen', 'mintGreen'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(5 + colIndex) * 80}
                                glowAnim={glowAnims[1 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 3 - Pinks/Purples */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['lavender', 'hotPink', 'rose', 'purple', 'violet'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(10 + colIndex) * 80}
                                glowAnim={glowAnims[2 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 4 - Reds/Oranges */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['coral', 'red', 'maroon', 'orange', 'gold'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(15 + colIndex) * 80}
                                glowAnim={glowAnims[3 * 5 + colIndex]}
                            />
                        ))}
                    </View>

                    {/* Row 5 - Grays */}
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                        {(['charcoal', 'slate', 'gray', 'silver', 'lightGray'] as ThemeName[]).map((t, colIndex) => (
                            <AnimatedColorBox
                                key={t}
                                themeName={t}
                                isSelected={theme === t}
                                onPress={() => setTheme(t)}
                                delay={(20 + colIndex) * 80}
                                glowAnim={glowAnims[4 * 5 + colIndex]}
                            />
                        ))}
                    </View>
                </View>
            </View>

            {/* Build Button */}
            <TouchableOpacity
                style={[
                    styles.previewButton,
                    (!canBuild || loading) && styles.previewButtonDisabled
                ]}
                onPress={onBuild}
                disabled={!canBuild || loading}
            >
                <Text style={styles.previewButtonText}>
                    {loading
                        ? 'Loading...'
                        : mode === 'baby'
                            ? 'Preview Birth Announcement'
                            : 'Preview Time Capsule Gift'
                    }
                </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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

    // Title
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
        color: '#fff',
        textAlign: 'center'
    },

    // Labels
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 12,
        color: '#fff'
    },

    // Inputs - white background
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: '#e74c3c',
        borderWidth: 2,
    },

    // Baby sections
    babySection: { marginBottom: 16 },

    // Upload button
    uploadBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.5)',
    },
    uploadBtnSelected: {
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderColor: '#fff',
        borderStyle: 'solid',
    },
    uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Toggle group for baby count
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
    toggleActiveText: { color: '#333' },

    // Date button
    dateBtn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dateBtnText: { fontSize: 16, color: '#333' },

    // Row layout
    row: { flexDirection: 'row', gap: 12 },

    // Preview button - white with dark green text (matches birthday/graduation forms)
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

    // Info box
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
    },
    infoText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },

    // Status and error text
    statusText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    errorText: {
        color: '#ffcccc',
        marginTop: 6,
        fontSize: 13,
        fontWeight: '500',
    },
    colorHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },

    // Letter to Baby
    letterSection: {
        marginTop: 12,
    },
    letterSectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
    },
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
