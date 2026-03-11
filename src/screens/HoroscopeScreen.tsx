import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { calculateNatalChart } from '../data/utils/natal-chart-calculator';
import { getCityCoordinates } from '../data/utils/town-coordinates';
import {
    calculateTransitAspects,
    getMoonPhase,
    getRetrogradePlanets,
    getSignificantTransits,
    getTransitDuration,
    Transit
} from '../data/utils/transit-calculator';
import {
    getTransitInterpretation
} from '../data/utils/transit-interpretations';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Horoscope'>;

// ─── Zodiac sign data for rich readings ─────────────────────
const ZODIAC_DATA: Record<string, {
    symbol: string; element: string; modality: string; ruler: string;
    colors: string[]; numbers: number[]; compatible: string[];
    bodyPart: string; dayOfWeek: string;
}> = {
    Aries: { symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', colors: ['Red', 'Orange'], numbers: [1, 9], compatible: ['Leo', 'Sagittarius', 'Gemini'], bodyPart: 'Head', dayOfWeek: 'Tuesday' },
    Taurus: { symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', colors: ['Green', 'Pink'], numbers: [2, 6], compatible: ['Virgo', 'Capricorn', 'Cancer'], bodyPart: 'Throat', dayOfWeek: 'Friday' },
    Gemini: { symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', colors: ['Yellow', 'Light Blue'], numbers: [3, 5], compatible: ['Libra', 'Aquarius', 'Aries'], bodyPart: 'Hands & Arms', dayOfWeek: 'Wednesday' },
    Cancer: { symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', colors: ['Silver', 'White'], numbers: [2, 7], compatible: ['Scorpio', 'Pisces', 'Taurus'], bodyPart: 'Chest & Stomach', dayOfWeek: 'Monday' },
    Leo: { symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', colors: ['Gold', 'Orange'], numbers: [1, 4], compatible: ['Aries', 'Sagittarius', 'Libra'], bodyPart: 'Heart & Spine', dayOfWeek: 'Sunday' },
    Virgo: { symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', colors: ['Navy', 'Green'], numbers: [5, 3], compatible: ['Taurus', 'Capricorn', 'Scorpio'], bodyPart: 'Digestive System', dayOfWeek: 'Wednesday' },
    Libra: { symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', colors: ['Pink', 'Light Blue'], numbers: [6, 7], compatible: ['Gemini', 'Aquarius', 'Leo'], bodyPart: 'Lower Back & Kidneys', dayOfWeek: 'Friday' },
    Scorpio: { symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto', colors: ['Crimson', 'Black'], numbers: [8, 4], compatible: ['Cancer', 'Pisces', 'Virgo'], bodyPart: 'Reproductive System', dayOfWeek: 'Tuesday' },
    Sagittarius: { symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', colors: ['Purple', 'Turquoise'], numbers: [3, 9], compatible: ['Aries', 'Leo', 'Aquarius'], bodyPart: 'Hips & Thighs', dayOfWeek: 'Thursday' },
    Capricorn: { symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', colors: ['Brown', 'Dark Green'], numbers: [4, 8], compatible: ['Taurus', 'Virgo', 'Pisces'], bodyPart: 'Knees & Bones', dayOfWeek: 'Saturday' },
    Aquarius: { symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus', colors: ['Electric Blue', 'Silver'], numbers: [7, 4], compatible: ['Gemini', 'Libra', 'Sagittarius'], bodyPart: 'Ankles & Circulation', dayOfWeek: 'Saturday' },
    Pisces: { symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune', colors: ['Sea Green', 'Lavender'], numbers: [3, 7], compatible: ['Cancer', 'Scorpio', 'Capricorn'], bodyPart: 'Feet & Immune System', dayOfWeek: 'Thursday' },
};

// ─── Narrative horoscope generator ──────────────────────────

function getZodiacFromDate(date: Date): string {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries';
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus';
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini';
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer';
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo';
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo';
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra';
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio';
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius';
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Capricorn';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius';
    return 'Pisces';
}

// Deterministic daily seed — reading changes each day but stays consistent within it
function getDailySeed(date: Date, sign: string): number {
    const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${sign}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)];
}

interface DailyReading {
    overview: string;
    love: string;
    career: string;
    wellness: string;
    energyLevel: number;
    luckyNumbers: number[];
    luckyColor: string;
    luckyTime: string;
    power: string;
    caution: string;
    affirmation: string;
}

function generateDailyReading(
    sign: string,
    transits: Transit[],
    moonPhaseInfo: { phase: string; emoji: string },
    retrogrades: { name: string }[],
    birthDate: Date,
): DailyReading {
    const today = new Date();
    const seed = getDailySeed(today, sign);
    const rng = seededRandom(seed);
    const zData = ZODIAC_DATA[sign] || ZODIAC_DATA.Aries;

    let harmoniousCount = 0;
    let challengingCount = 0;
    let hasVenusTransit = false;
    let hasMarsTransit = false;
    let hasJupiterTransit = false;
    let hasSaturnTransit = false;
    let hasMercuryTransit = false;
    let dominantTheme = '';

    for (const t of transits) {
        if (t.aspectType.influence === 'harmonious') harmoniousCount++;
        if (t.aspectType.influence === 'challenging') challengingCount++;
        if (t.transitingPlanet === 'Venus') hasVenusTransit = true;
        if (t.transitingPlanet === 'Mars') hasMarsTransit = true;
        if (t.transitingPlanet === 'Jupiter') hasJupiterTransit = true;
        if (t.transitingPlanet === 'Saturn') hasSaturnTransit = true;
        if (t.transitingPlanet === 'Mercury') hasMercuryTransit = true;
    }

    if (hasJupiterTransit) dominantTheme = 'expansion';
    else if (hasSaturnTransit) dominantTheme = 'discipline';
    else if (hasVenusTransit) dominantTheme = 'love';
    else if (hasMarsTransit) dominantTheme = 'action';
    else if (hasMercuryTransit) dominantTheme = 'communication';
    else dominantTheme = 'balance';

    const isRetrograde = retrogrades.length > 0;
    const retroNames = retrogrades.map(r => r.name);
    const isMercuryRx = retroNames.includes('Mercury');

    const baseEnergy = 5 + (harmoniousCount * 0.8) - (challengingCount * 0.5);
    const energyLevel = Math.max(1, Math.min(10, Math.round(baseEnergy + (rng() * 2 - 1))));

    // ─── OVERVIEW ─────────────────────
    const overviewOpenings: Record<string, string[]> = {
        expansion: [
            `The cosmos is feeling generous today, ${sign}. Jupiter's expansive energy is touching your natal chart, and it's bringing a sense of possibility that you haven't felt in a while. Whatever you've been dreaming about — now's the time to start making moves.`,
            `Big energy surrounds you today, ${sign}. The Jupiter influence washing over your chart is like a cosmic green light. Doors that seemed stuck are starting to swing open. Trust the momentum.`,
            `Something beautiful is unfolding in the stars for you today. Jupiter's blessing on your chart amplifies everything — your confidence, your luck, your ability to attract good things. Lean into it.`,
        ],
        discipline: [
            `Today asks for patience, ${sign}. Saturn's presence in your sky isn't punishing you — it's sculpting you. The pressure you feel? That's the universe making a diamond. Stay steady and the reward will be worth it.`,
            `Saturn is knocking on your cosmic door today, ${sign}. This isn't a day for shortcuts or skipping steps. It's a day for doing the work that your future self will thank you for. Structure brings freedom right now.`,
            `The universe is in "tough love" mode today, ${sign}. Saturn's influence means the path of least resistance won't actually lead anywhere good. Choose the harder right over the easier wrong.`,
        ],
        love: [
            `Venus is weaving her magic through your chart today, ${sign}. There's a softness in the air — a gentleness that makes everything feel a little more beautiful. Whether you're in a relationship or flying solo, your heart is open and magnetic.`,
            `Your charm is absolutely through the roof today, ${sign}. Venus is lighting up your birth chart, and people can feel it. Conversations flow easier, smiles come quicker, and connections feel deeper than usual.`,
            `Love is in the air — and we mean that literally for you today, ${sign}. Venus is making a direct hit to your chart, amplifying everything related to beauty, pleasure, and human connection.`,
        ],
        action: [
            `You woke up with that fire today, didn't you, ${sign}? Mars is energizing your chart, and you can feel it in your bones. This is a day for bold moves, not careful deliberation. Trust your instincts and go after what you want.`,
            `The cosmic tempo picks up for you today, ${sign}. Mars is injecting your chart with raw energy and ambition. You might feel restless if you don't channel it — so channel it. Start something. Finish something. Move.`,
            `Today has "main character energy" written all over it for you, ${sign}. Mars is firing up your chart, giving you the kind of drive that makes things happen. Don't waste this fuel sitting on the sideline.`,
        ],
        communication: [
            `Your words carry extra weight today, ${sign}. Mercury is activating your birth chart, sharpening your mind and making your communication irresistible. Whether it's a tough conversation, a presentation, or just catching up with someone — you'll say exactly the right thing.`,
            `Your mind is a razor today, ${sign}. Mercury's transit to your chart means ideas flow fast, connections click instantly, and you can talk your way into (or out of) just about anything. Use this superpower wisely.`,
            `The mental clarity you're feeling today? That's Mercury lit up in your chart, ${sign}. It's like someone wiped the fog off your windshield. Everything looks sharper, cleaner, more obvious.`,
        ],
        balance: [
            `Today is one of those quiet but meaningful days, ${sign}. The cosmos isn't demanding anything dramatic from you — instead, it's inviting you to find your center. Pay attention to the small moments. That's where the magic lives today.`,
            `The stars are giving you breathing room today, ${sign}. There's no major cosmic push or pull — which makes this a perfect day to check in with yourself. What do you actually want? Not what you should want. What you WANT.`,
            `A calm energy settles over your chart today, ${sign}. Think of it as the universe pressing pause between big scenes. Use this interlude to rest, reflect, and prepare. Something bigger is building.`,
        ],
    };

    const overview = pickRandom(overviewOpenings[dominantTheme] || overviewOpenings.balance, rng);

    const moonContext = moonPhaseInfo.phase.includes('New')
        ? ` The ${moonPhaseInfo.emoji} New Moon amplifies new beginnings — plant a seed today and watch it grow.`
        : moonPhaseInfo.phase.includes('Full')
            ? ` Under tonight's ${moonPhaseInfo.emoji} Full Moon, emotions run high and truths come to light. Don't fight it — let clarity wash over you.`
            : moonPhaseInfo.phase.includes('Waxing')
                ? ` The ${moonPhaseInfo.emoji} ${moonPhaseInfo.phase} builds momentum in your favor. Things are growing, building, accelerating.`
                : ` The ${moonPhaseInfo.emoji} ${moonPhaseInfo.phase} asks you to release what no longer serves you. Let go gracefully.`;

    const retroContext = isMercuryRx
        ? ` Mercury is retrograde right now, so double-check texts before sending, re-read emails, and don't sign anything without reading the fine print.`
        : isRetrograde
            ? ` With ${retroNames.join(' and ')} in retrograde, some things may feel like they're moving in slow motion. That's not a bug — it's a feature. Revisit and revise.`
            : '';

    const fullOverview = overview + moonContext + retroContext;

    // ─── LOVE ─────────────────────
    const loveReadings = hasVenusTransit ? [
        `Venus is absolutely showering your love life with blessings today. If you're in a relationship, tonight is date-night worthy — put the phone down and just be present with your person. If you're single, keep your eyes open. Someone might catch your attention in the most unexpected place.`,
        `Your romantic energy is magnetic today. Venus is making direct contact with your natal chart, which means attraction works both ways — you're drawn to beauty and beauty is drawn to you. Express how you feel. Today, vulnerability is your superpower.`,
        `This is one of those days where love doesn't feel complicated, ${sign}. It just feels warm. Venus smooths out the rough edges in your closest relationships and reminds you why you chose your people. Lean in.`,
    ] : hasMarsTransit ? [
        `Passion runs hot today, ${sign}. Mars is stirring up your romantic energy, which could mean sparks flying with someone new OR a heated moment with someone close. The key? Don't confuse intensity with incompatibility. Sometimes the best relationships challenge you.`,
        `Your love life gets a jolt of electricity today. Mars doesn't do "chill" — so if there's been tension in a relationship, it might bubble up. But here's the thing: sometimes a good argument clears the air like a thunderstorm. Let it rain if it needs to.`,
    ] : [
        `Love takes a back seat to other themes today, but that doesn't mean it disappears. The small gestures matter most right now — a random text saying "thinking of you," making coffee for your partner, or simply being fully present when someone is talking. That's where love lives today.`,
        `Today isn't about grand romantic gestures, ${sign}. It's about the quiet truth of who shows up for you consistently. If someone keeps choosing you in the small moments, that's the real love story. Appreciate them today.`,
        `Your heart knows what it wants, ${sign} — even if your head is overcomplicating things. Trust the feeling in your chest, not the arguments in your mind. Love, at its best, is simple.`,
    ];
    const love = pickRandom(loveReadings, rng);

    // ─── CAREER ─────────────────────
    const careerReadings = hasJupiterTransit ? [
        `Professionally, this is YOUR day, ${sign}. Jupiter is expanding your potential in a way that could open doors you didn't even know existed. If someone offers you an opportunity — even if it scares you — say yes first and figure it out later. Growth lives outside your comfort zone.`,
        `The career gods are smiling today. Jupiter's influence on your chart means abundance flows toward your professional life. A raise, a promotion, a new client, or simply a breakthrough idea — something is expanding. Position yourself to catch it.`,
    ] : hasSaturnTransit ? [
        `Work requires extra focus today. Saturn is demanding accountability, and you might feel like your to-do list is judging you. Here's the truth: you don't have to do everything. You just have to do the most important thing really well. Prioritize ruthlessly.`,
        `Saturn is testing your professional patience today. A project might hit a snag, a colleague might be difficult, or a deadline might feel impossible. But ${sign}, you've handled harder. Put your head down and push through. The obstacle IS the path.`,
    ] : [
        `Your career energy is steady today, ${sign}. No major breakthroughs, no major setbacks — just the kind of consistent forward motion that actually builds empires over time. Don't underestimate the power of another good day's work.`,
        `At work today, trust your instincts over your inbox. The answers you're looking for won't come from refreshing your email — they'll come from that quiet voice inside that already knows the right move. Listen to it.`,
        `Today is a great day to work on something you've been putting off. Not the urgent stuff — the important stuff that keeps getting pushed to "later." Later is now, ${sign}. Even 30 minutes of focused effort will shift the energy.`,
    ];
    const career = pickRandom(careerReadings, rng);

    // ─── WELLNESS ─────────────────────
    const wellnessReadings: string[] = [];
    const bodyFocus = zData.bodyPart;

    if (energyLevel >= 7) {
        wellnessReadings.push(
            `Your energy tank is full today, ${sign}. Your body wants to move. If you've been skipping workouts, today is the day to get back in the groove. Even a 20-minute walk will feel incredible. Pay special attention to your ${bodyFocus} — that's your zodiac's sensitive area.`,
            `You're buzzing with vitality today. Channel that energy into something physical — a workout, a dance in the kitchen, a long walk with your thoughts. Your ${bodyFocus} might need extra attention, so stretch it, strengthen it, or simply be aware of it.`,
        );
    } else if (energyLevel >= 4) {
        wellnessReadings.push(
            `Your energy is moderate today — enough to function, not enough to conquer the world. And that's perfectly fine. Hydrate more than you think you need to, and give your ${bodyFocus} some love. A warm bath, some gentle stretching, or simply sitting in the sun for 10 minutes can work wonders.`,
            `Today is a "maintenance day" for your body, ${sign}. You don't need to push hard — you need to replenish. Eat something nourishing, drink your water, and if your ${bodyFocus} feels tight or achy, listen to it. Your body is always talking; today, try actually listening.`,
        );
    } else {
        wellnessReadings.push(
            `Okay, ${sign}, today is a REST day and the cosmos is not taking no for an answer. Your energy is low, and that's not weakness — it's wisdom. Your body is recharging. Cancel what you can, sleep an extra hour if possible, and pamper your ${bodyFocus}. Tomorrow you'll bounce back stronger.`,
            `The universe is telling you to slow down today, ${sign}. If you push through exhaustion, you'll pay for it later. Instead, be gentle with yourself. Take it easy, eat comfort food, and give your ${bodyFocus} some extra TLC. Recovery IS productivity.`,
        );
    }
    const wellness = pickRandom(wellnessReadings, rng);

    // ─── Lucky details ─────────────────────
    const luckyNums = [
        zData.numbers[0],
        Math.floor(rng() * 30) + 1,
        Math.floor(rng() * 50) + 10,
    ].sort((a, b) => a - b);

    const allColors = ['Red', 'Blue', 'Green', 'Gold', 'Purple', 'Silver', 'Coral', 'Teal', 'Ivory', 'Rose', 'Amber', 'Jade'];
    const luckyColor = pickRandom([...zData.colors, pickRandom(allColors, rng)], rng);

    const hours = ['7:00 AM', '8:30 AM', '10:00 AM', '11:11 AM', '12:30 PM', '2:00 PM', '3:33 PM', '4:44 PM', '5:55 PM', '7:00 PM', '9:00 PM'];
    const luckyTime = pickRandom(hours, rng);

    const powers = ['Patience', 'Confidence', 'Intuition', 'Creativity', 'Resilience', 'Charm', 'Focus', 'Empathy', 'Courage', 'Adaptability', 'Wisdom', 'Humor'];
    const cautions = ['Overthinking', 'Impatience', 'People-pleasing', 'Procrastination', 'Self-doubt', 'Stubbornness', 'Scattered energy', 'Overcommitting', 'Perfectionism', 'Avoidance'];

    const affirmations = [
        `I am exactly where I need to be, and everything is working in my favor.`,
        `I trust the timing of my life. What's meant for me will never miss me.`,
        `I release what I can't control and focus on what I can create.`,
        `I am worthy of all the good things coming my way today.`,
        `My energy is magnetic, and I attract exactly what I need.`,
        `I choose peace over worry, action over fear, and love over everything.`,
        `Today, I give myself permission to shine without apology.`,
        `I am growing, healing, and becoming the person I'm meant to be.`,
        `The universe has my back. I can relax and trust the process.`,
        `I am powerful enough to handle anything this day brings.`,
        `My potential is limitless. Today, I take one step closer to my dreams.`,
        `I honor my feelings, trust my journey, and celebrate my progress.`,
    ];

    return {
        overview: fullOverview,
        love,
        career,
        wellness,
        energyLevel,
        luckyNumbers: luckyNums,
        luckyColor,
        luckyTime,
        power: pickRandom(powers, rng),
        caution: pickRandom(cautions, rng),
        affirmation: pickRandom(affirmations, rng),
    };
}

// ─── Notification helpers ───────────────────────────────────
const REMINDER_STORAGE_KEY = '@horoscope_reminder';

async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

async function scheduleDailyReminder(hour: number, minute: number, birthDate: string, birthTime?: string, birthLocation?: string) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '✨ Your Daily Horoscope is Ready',
            body: 'The stars have aligned — tap to see what the cosmos has in store for you today!',
            sound: true,
            data: { screen: 'Horoscope', birthDate, birthTime, birthLocation },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
}

async function cancelDailyReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Component ──────────────────────────────────────────────
export default function HoroscopeScreen({ navigation, route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const [birthTime, setBirthTime] = useState(route.params.birthTime || '12:00');
    const [birthLocation, setBirthLocation] = useState(route.params.birthLocation || '');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showDetailedTransits, setShowDetailedTransits] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderHour, setReminderHour] = useState(8);
    const [reminderMinute, setReminderMinute] = useState(0);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [tempHour, setTempHour] = useState('8');
    const [tempMinute, setTempMinute] = useState('00');
    const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>('AM');

    // Load reminder state
    useEffect(() => {
        AsyncStorage.getItem(REMINDER_STORAGE_KEY).then(val => {
            if (val) {
                const parsed = JSON.parse(val);
                setReminderEnabled(parsed.enabled);
                setReminderHour(parsed.hour ?? 8);
                setReminderMinute(parsed.minute ?? 0);
            }
        }).catch(() => { });
    }, []);

    // Get coordinates
    const coordinates = useMemo(() => {
        if (birthLocation) {
            const coords = getCityCoordinates(birthLocation);
            if (coords) return { lat: coords.lat, lng: coords.lng, found: true };
        }
        return { lat: 40.7128, lng: -74.0060, found: false };
    }, [birthLocation]);

    // Parse birth time
    const [hrs, mins] = birthTime.split(':').map(Number);
    const adjustedBirthDate = useMemo(() => {
        const d = new Date(birthDate);
        d.setHours(hrs || 12, mins || 0, 0, 0);
        return d;
    }, [birthDate, hrs, mins]);

    // Calculate natal chart
    const natalChart = useMemo(() => {
        return calculateNatalChart(adjustedBirthDate, coordinates.lat, coordinates.lng);
    }, [adjustedBirthDate, coordinates]);

    // Calculate today's transits
    const allTransits = useMemo(() => {
        return calculateTransitAspects(natalChart, new Date());
    }, [natalChart]);

    const significantTransits = useMemo(() => {
        return getSignificantTransits(allTransits, 6);
    }, [allTransits]);

    // Moon phase & retrogrades
    const moonPhaseInfo = useMemo(() => getMoonPhase(new Date()), []);
    const retrogrades = useMemo(() => getRetrogradePlanets(new Date()), []);

    // Zodiac sign
    const sunSign = natalChart.planets?.[0]?.zodiac || getZodiacFromDate(birthDate);
    const zData = ZODIAC_DATA[sunSign] || ZODIAC_DATA.Aries;

    // Generate the narrative reading
    const reading = useMemo(() => {
        return generateDailyReading(sunSign, significantTransits, moonPhaseInfo, retrogrades, birthDate);
    }, [sunSign, significantTransits, moonPhaseInfo, retrogrades, birthDate]);

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Reminder toggle handler
    const handleReminderToggle = useCallback(async (value: boolean) => {
        if (value) {
            const granted = await requestNotificationPermissions();
            if (!granted) {
                Alert.alert('Permissions Needed', 'Please enable notifications in your device settings to receive daily horoscope reminders.');
                return;
            }
            setShowReminderModal(true);
        } else {
            setReminderEnabled(false);
            await cancelDailyReminder();
            await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify({ enabled: false }));
        }
    }, []);

    const saveReminder = useCallback(async () => {
        let h = parseInt(tempHour, 10) || 8;
        const m = parseInt(tempMinute, 10) || 0;
        if (tempAmPm === 'PM' && h !== 12) h += 12;
        if (tempAmPm === 'AM' && h === 12) h = 0;

        setReminderHour(h);
        setReminderMinute(m);
        setReminderEnabled(true);
        setShowReminderModal(false);

        const bdISO = route.params.birthDate;
        const bt = route.params.birthTime;
        const bl = route.params.birthLocation;
        await scheduleDailyReminder(h, m, bdISO, bt, bl);
        await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify({ enabled: true, hour: h, minute: m, birthDate: bdISO, birthTime: bt, birthLocation: bl }));

        const displayH = h % 12 || 12;
        const displayM = m.toString().padStart(2, '0');
        const displayAmPm = h >= 12 ? 'PM' : 'AM';
        Alert.alert('✨ Reminder Set!', `You'll get a daily horoscope nudge at ${displayH}:${displayM} ${displayAmPm}.`);
    }, [tempHour, tempMinute, tempAmPm]);

    const formatReminderTime = () => {
        const h = reminderHour % 12 || 12;
        const m = reminderMinute.toString().padStart(2, '0');
        const ampm = reminderHour >= 12 ? 'PM' : 'AM';
        return `${h}:${m} ${ampm}`;
    };

    // Energy bar
    const energySegments = Array.from({ length: 10 }, (_, i) => i < reading.energyLevel);

    const getEnergyColor = (level: number) => {
        if (level >= 8) return '#4caf50';
        if (level >= 6) return '#8bc34a';
        if (level >= 4) return '#ffc107';
        if (level >= 2) return '#ff9800';
        return '#f44336';
    };

    const getEnergyLabel = (level: number) => {
        if (level >= 9) return 'On Fire 🔥';
        if (level >= 7) return 'Energized ⚡';
        if (level >= 5) return 'Steady ☀️';
        if (level >= 3) return 'Low Key 🌤️';
        return 'Recharging 🌙';
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.signSymbol}>{zData.symbol}</Text>
                    <Text style={styles.signName}>{sunSign}</Text>
                    <Text style={styles.title}>Your Daily Horoscope</Text>
                    <Text style={styles.subtitle}>{today}</Text>
                </View>

                {/* ── Energy Level Bar ── */}
                <View style={styles.energyCard}>
                    <View style={styles.energyHeader}>
                        <Text style={styles.energyTitle}>Today's Energy</Text>
                        <Text style={styles.energyLabel}>{getEnergyLabel(reading.energyLevel)}</Text>
                    </View>
                    <View style={styles.energyBar}>
                        {energySegments.map((filled, i) => (
                            <View key={i} style={[
                                styles.energySegment,
                                { backgroundColor: filled ? getEnergyColor(reading.energyLevel) : 'rgba(255,255,255,0.1)' }
                            ]} />
                        ))}
                    </View>
                </View>

                {/* ── Moon Phase ── */}
                <View style={styles.moonRow}>
                    <Text style={styles.moonIcon}>{moonPhaseInfo.emoji}</Text>
                    <View style={styles.moonTextCol}>
                        <Text style={styles.moonPhaseName}>{moonPhaseInfo.phase}</Text>
                        <Text style={styles.moonDesc}>{moonPhaseInfo.description}</Text>
                    </View>
                </View>

                {/* ── Retrograde Alert ── */}
                {retrogrades.length > 0 && (
                    <View style={styles.retroBanner}>
                        <Text style={styles.retroText}>
                            ⟲ {retrogrades.map(r => r.name).join(', ')} {retrogrades.length === 1 ? 'is' : 'are'} retrograde
                        </Text>
                    </View>
                )}

                {/* ── THE READING ── */}
                <View style={styles.readingSection}>
                    <View style={styles.readingHeader}>
                        <Text style={styles.readingIcon}>🌟</Text>
                        <Text style={styles.readingLabel}>Today's Overview</Text>
                    </View>
                    <Text style={styles.readingText}>{reading.overview}</Text>
                </View>

                <View style={styles.readingSection}>
                    <View style={styles.readingHeader}>
                        <Text style={styles.readingIcon}>💕</Text>
                        <Text style={styles.readingLabel}>Love & Relationships</Text>
                    </View>
                    <Text style={styles.readingText}>{reading.love}</Text>
                </View>

                <View style={styles.readingSection}>
                    <View style={styles.readingHeader}>
                        <Text style={styles.readingIcon}>💼</Text>
                        <Text style={styles.readingLabel}>Career & Money</Text>
                    </View>
                    <Text style={styles.readingText}>{reading.career}</Text>
                </View>

                <View style={styles.readingSection}>
                    <View style={styles.readingHeader}>
                        <Text style={styles.readingIcon}>🧘</Text>
                        <Text style={styles.readingLabel}>Health & Wellness</Text>
                    </View>
                    <Text style={styles.readingText}>{reading.wellness}</Text>
                </View>

                {/* ── Lucky Box ── */}
                <View style={styles.luckyCard}>
                    <Text style={styles.luckyTitle}>✨ Today's Cosmic Extras</Text>
                    <View style={styles.luckyGrid}>
                        <View style={styles.luckyItem}>
                            <Text style={styles.luckyItemLabel}>Lucky Numbers</Text>
                            <Text style={styles.luckyItemValue}>{reading.luckyNumbers.join(', ')}</Text>
                        </View>
                        <View style={styles.luckyItem}>
                            <Text style={styles.luckyItemLabel}>Lucky Color</Text>
                            <Text style={styles.luckyItemValue}>{reading.luckyColor}</Text>
                        </View>
                        <View style={styles.luckyItem}>
                            <Text style={styles.luckyItemLabel}>Peak Hour</Text>
                            <Text style={styles.luckyItemValue}>{reading.luckyTime}</Text>
                        </View>
                        <View style={styles.luckyItem}>
                            <Text style={styles.luckyItemLabel}>Best Match Today</Text>
                            <Text style={styles.luckyItemValue}>{pickRandom(zData.compatible, () => getDailySeed(new Date(), sunSign) / 2147483647)}</Text>
                        </View>
                    </View>
                    <View style={styles.luckyDivider} />
                    <View style={styles.powerRow}>
                        <View style={styles.powerItem}>
                            <Text style={styles.powerLabel}>🔋 Your Power</Text>
                            <Text style={styles.powerValue}>{reading.power}</Text>
                        </View>
                        <View style={styles.powerItem}>
                            <Text style={styles.powerLabel}>⚠️ Watch For</Text>
                            <Text style={styles.powerValue}>{reading.caution}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Daily Affirmation ── */}
                <View style={styles.affirmationCard}>
                    <Text style={styles.affirmationLabel}>🪷 Today's Affirmation</Text>
                    <Text style={styles.affirmationText}>"{reading.affirmation}"</Text>
                </View>

                {/* ── Daily Reminder Toggle ── */}
                <View style={styles.reminderCard}>
                    <View style={styles.reminderRow}>
                        <View>
                            <Text style={styles.reminderTitle}>🔔 Daily Horoscope Reminder</Text>
                            <Text style={styles.reminderSubtitle}>
                                {reminderEnabled
                                    ? `Set for ${formatReminderTime()} every day`
                                    : 'Get notified when your reading is ready'}
                            </Text>
                        </View>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={handleReminderToggle}
                            trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#7c4dff' }}
                            thumbColor={reminderEnabled ? '#fff' : '#999'}
                        />
                    </View>
                    {reminderEnabled && (
                        <TouchableOpacity style={styles.changeTimeBtn} onPress={() => {
                            const h12 = reminderHour % 12 || 12;
                            setTempHour(h12.toString());
                            setTempMinute(reminderMinute.toString().padStart(2, '0'));
                            setTempAmPm(reminderHour >= 12 ? 'PM' : 'AM');
                            setShowReminderModal(true);
                        }}>
                            <Text style={styles.changeTimeText}>Change Time</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Detailed Transits (expandable) ── */}
                <TouchableOpacity
                    style={styles.detailToggle}
                    onPress={() => setShowDetailedTransits(!showDetailedTransits)}
                >
                    <Text style={styles.detailToggleText}>
                        {showDetailedTransits ? '▼' : '▶'} The Astrology Behind Today's Reading
                    </Text>
                </TouchableOpacity>

                {showDetailedTransits && (
                    <View style={styles.detailSection}>
                        <Text style={styles.detailExplainer}>
                            These are the actual planetary transits influencing your birth chart right now — the data that powers your daily reading above.
                        </Text>
                        {significantTransits.length > 0 ? (
                            significantTransits.map((transit, i) => {
                                const interp = getTransitInterpretation(transit.transitingPlanet, transit.natalPlanet, transit.aspectType.name);
                                const duration = getTransitDuration(transit.transitingPlanet);
                                return (
                                    <View key={i} style={styles.transitCard}>
                                        <Text style={styles.transitTitle}>
                                            {transit.transitingPlanet} {transit.aspectType.symbol} {transit.natalPlanet}
                                        </Text>
                                        <Text style={styles.transitMeta}>
                                            {transit.aspectType.name} · {transit.exactOrb < 1 ? 'Nearly Exact' : `${transit.exactOrb.toFixed(1)}° orb`} · {duration}
                                        </Text>
                                        {interp && <Text style={styles.transitInterp}>{interp.meaning}</Text>}
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.noTransitsText}>No major exact transits today.</Text>
                        )}
                    </View>
                )}

                {/* ── Birth Data ── */}
                <View style={styles.birthDataCard}>
                    <TouchableOpacity style={styles.birthDataItem} onPress={() => setShowTimeModal(true)}>
                        <Text style={styles.birthDataLabel}>🕐 Birth Time</Text>
                        <Text style={styles.birthDataValue}>{birthTime} ›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.birthDataItem} onPress={() => setShowLocationModal(true)}>
                        <Text style={styles.birthDataLabel}>📍 Location</Text>
                        <Text style={styles.birthDataValue}>{birthLocation || 'Tap to set'} ›</Text>
                    </TouchableOpacity>
                    {!coordinates.found && (
                        <Text style={styles.accuracyNote}>Setting your birth city makes this reading more accurate</Text>
                    )}
                </View>

                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Time Modal ── */}
            <Modal visible={showTimeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🕐 Birth Time</Text>
                        <Text style={styles.modalHint}>Format: HH:MM (24-hour)</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={birthTime}
                            onChangeText={setBirthTime}
                            placeholder="12:00"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowTimeModal(false)}>
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Location Modal ── */}
            <Modal visible={showLocationModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📍 Birth Location</Text>
                        <Text style={styles.modalHint}>Enter city and state (e.g., "Chicago, IL")</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={birthLocation}
                            onChangeText={setBirthLocation}
                            placeholder="City, State"
                            autoCapitalize="words"
                        />
                        {birthLocation && (
                            <Text style={coordinates.found ? styles.coordsFound : styles.coordsNotFound}>
                                {coordinates.found ? '✓ Location found' : '✗ City not found'}
                            </Text>
                        )}
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowLocationModal(false)}>
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Reminder Time Picker Modal ── */}
            <Modal visible={showReminderModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🔔 Set Reminder Time</Text>
                        <Text style={styles.modalHint}>What time should we nudge you each day?</Text>
                        <View style={styles.timePickerRow}>
                            <TextInput
                                style={[styles.modalInput, styles.timePickerInput]}
                                value={tempHour}
                                onChangeText={setTempHour}
                                placeholder="8"
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <Text style={styles.timePickerColon}>:</Text>
                            <TextInput
                                style={[styles.modalInput, styles.timePickerInput]}
                                value={tempMinute}
                                onChangeText={setTempMinute}
                                placeholder="00"
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                            <TouchableOpacity
                                style={[styles.amPmButton, tempAmPm === 'AM' && styles.amPmActive]}
                                onPress={() => setTempAmPm('AM')}
                            >
                                <Text style={[styles.amPmText, tempAmPm === 'AM' && styles.amPmTextActive]}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.amPmButton, tempAmPm === 'PM' && styles.amPmActive]}
                                onPress={() => setTempAmPm('PM')}
                            >
                                <Text style={[styles.amPmText, tempAmPm === 'PM' && styles.amPmTextActive]}>PM</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowReminderModal(false)}>
                                <Text style={[styles.modalButtonText, { color: '#666' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={saveReminder}>
                                <Text style={styles.modalButtonText}>Set Reminder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, padding: 20 },

    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    signSymbol: { fontSize: 60, marginBottom: 4 },
    signName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2, textTransform: 'uppercase' },
    title: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

    energyCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 },
    energyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    energyTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
    energyLabel: { fontSize: 14, fontWeight: '700', color: '#fff' },
    energyBar: { flexDirection: 'row', gap: 4 },
    energySegment: { flex: 1, height: 8, borderRadius: 4 },

    moonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, marginBottom: 12 },
    moonIcon: { fontSize: 36, marginRight: 14 },
    moonTextCol: { flex: 1 },
    moonPhaseName: { fontSize: 16, fontWeight: '700', color: '#fff' },
    moonDesc: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

    retroBanner: { backgroundColor: 'rgba(244,67,54,0.15)', borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(244,67,54,0.3)' },
    retroText: { fontSize: 13, fontWeight: '600', color: '#ffcdd2', textAlign: 'center' },

    readingSection: { marginBottom: 20 },
    readingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    readingIcon: { fontSize: 22, marginRight: 8 },
    readingLabel: { fontSize: 18, fontWeight: '800', color: '#fff' },
    readingText: { fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 24, letterSpacing: 0.2 },

    luckyCard: { backgroundColor: 'rgba(124,77,255,0.15)', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(124,77,255,0.3)' },
    luckyTitle: { fontSize: 16, fontWeight: '800', color: '#e0d0ff', textAlign: 'center', marginBottom: 14 },
    luckyGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    luckyItem: { width: '50%', paddingVertical: 8 },
    luckyItemLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
    luckyItemValue: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 2 },
    luckyDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
    powerRow: { flexDirection: 'row' },
    powerItem: { flex: 1 },
    powerLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    powerValue: { fontSize: 15, fontWeight: '700', color: '#fff', marginTop: 2 },

    affirmationCard: { backgroundColor: 'rgba(255,215,0,0.12)', borderRadius: 14, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)' },
    affirmationLabel: { fontSize: 14, fontWeight: '700', color: '#ffd54f', marginBottom: 8 },
    affirmationText: { fontSize: 16, fontWeight: '600', color: '#fff', fontStyle: 'italic', lineHeight: 24, textAlign: 'center' },

    reminderCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 20 },
    reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reminderTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    reminderSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    changeTimeBtn: { marginTop: 10, alignSelf: 'flex-start' },
    changeTimeText: { fontSize: 13, fontWeight: '600', color: '#7c4dff', textDecorationLine: 'underline' },

    detailToggle: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 12 },
    detailToggleText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    detailSection: { marginBottom: 20 },
    detailExplainer: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
    transitCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 8 },
    transitTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    transitMeta: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    transitInterp: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 19 },
    noTransitsText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 },

    birthDataCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 16 },
    birthDataItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    birthDataLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    birthDataValue: { fontSize: 14, color: '#fff', fontWeight: '600' },
    accuracyNote: { fontSize: 11, color: '#ffd54f', textAlign: 'center', marginTop: 4 },

    backButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
    backText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, width: '85%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    modalHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 },
    modalInput: { borderWidth: 2, borderColor: '#7c4dff', borderRadius: 8, padding: 12, fontSize: 18, fontWeight: '700', color: '#fff', width: '100%', textAlign: 'center', marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
    modalButton: { backgroundColor: '#7c4dff', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
    modalButtonCancel: { backgroundColor: 'rgba(255,255,255,0.1)' },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalButtonRow: { flexDirection: 'row', gap: 12 },
    coordsFound: { fontSize: 12, color: '#4caf50', marginBottom: 12 },
    coordsNotFound: { fontSize: 12, color: '#ff9800', marginBottom: 12 },

    timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    timePickerInput: { width: 60, marginBottom: 0 },
    timePickerColon: { fontSize: 24, fontWeight: '900', color: '#fff' },
    amPmButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    amPmActive: { backgroundColor: '#7c4dff', borderColor: '#7c4dff' },
    amPmText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
    amPmTextActive: { color: '#fff' },
});
