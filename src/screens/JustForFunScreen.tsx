import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'JustForFun'>;
type FeatureType = 'lifepath' | 'lucky' | 'roman' | 'birthstone' | 'zodiac' | 'famous' | 'onthisday' | 'thenandnow' | null;

const { width: screenWidth } = Dimensions.get('window');

// Life Path Number calculation
function calculateLifePathNumber(date: Date): { number: number; meaning: string } {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const reduceToSingle = (num: number): number => {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        }
        return num;
    };

    const monthNum = reduceToSingle(month);
    const dayNum = reduceToSingle(day);
    const yearNum = reduceToSingle(year);
    let lifePathNum = reduceToSingle(monthNum + dayNum + yearNum);

    const meanings: Record<number, string> = {
        1: "The Leader - Independent, ambitious, and driven. You're a natural pioneer who forges new paths.",
        2: "The Peacemaker - Diplomatic, intuitive, and cooperative. You bring harmony to relationships.",
        3: "The Communicator - Creative, expressive, and joyful. You inspire others with your artistic gifts.",
        4: "The Builder - Practical, organized, and hardworking. You create lasting foundations.",
        5: "The Freedom Seeker - Adventurous, dynamic, and versatile. You embrace change and new experiences.",
        6: "The Nurturer - Loving, responsible, and protective. You care deeply for family and community.",
        7: "The Seeker - Analytical, spiritual, and introspective. You search for deeper truths.",
        8: "The Powerhouse - Ambitious, authoritative, and successful. You manifest abundance.",
        9: "The Humanitarian - Compassionate, generous, and wise. You serve the greater good.",
        11: "The Master Intuitive - Highly intuitive and spiritually aware. You're a visionary and inspirer.",
        22: "The Master Builder - Capable of turning dreams into reality on a grand scale.",
        33: "The Master Teacher - A rare soul devoted to uplifting humanity through love and service."
    };

    return { number: lifePathNum, meaning: meanings[lifePathNum] || "A unique and special soul!" };
}

// Lucky Numbers generation (Lottery style: 6 numbers from 1-49)
function getLotteryNumbers(date: Date): number[] {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const today = new Date();
    const todayNum = today.getDate() + today.getMonth() + 1;

    const seed = (month * day * year + todayNum) % 100000;
    const numbers: number[] = [];
    let current = seed;

    for (let i = 0; i < 6; i++) {
        current = (current * 9301 + 49297) % 233280;
        numbers.push((current % 49) + 1);
    }

    const unique = [...new Set(numbers)];
    while (unique.length < 6) {
        unique.push((unique[unique.length - 1] * 7 % 49) + 1);
    }

    return unique.slice(0, 6).sort((a, b) => a - b);
}

// Keno Numbers generation (10 numbers from 1-80)
function getKenoNumbers(date: Date): number[] {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const today = new Date();
    const todayNum = today.getDate() + today.getMonth() + 1;

    // Different seed multiplier for keno to get different numbers
    const seed = (month * day * year * 3 + todayNum * 7) % 100000;
    const numbers: number[] = [];
    let current = seed;

    for (let i = 0; i < 10; i++) {
        current = (current * 7621 + 38729) % 293280;
        numbers.push((current % 80) + 1);
    }

    const unique = [...new Set(numbers)];
    while (unique.length < 10) {
        unique.push((unique[unique.length - 1] * 11 % 80) + 1);
    }

    return unique.slice(0, 10).sort((a, b) => a - b);
}

// Combined Lucky Numbers (returns both lottery and keno)
function getLuckyNumbers(date: Date): { lottery: number[]; keno: number[] } {
    return {
        lottery: getLotteryNumbers(date),
        keno: getKenoNumbers(date)
    };
}

// Roman Numerals
function toRomanNumerals(date: Date): { month: string; day: string; year: string; full: string } {
    const romanize = (num: number): string => {
        const romanNumerals: [number, string][] = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
            [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
            [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];

        let result = '';
        for (const [value, symbol] of romanNumerals) {
            while (num >= value) {
                result += symbol;
                num -= value;
            }
        }
        return result;
    };

    const month = romanize(date.getMonth() + 1);
    const day = romanize(date.getDate());
    const year = romanize(date.getFullYear());

    return { month, day, year, full: `${month}•${day}•${year}` };
}

// Birthstone data
function getBirthstone(date: Date): { name: string; color: string; meaning: string; emoji: string } {
    const month = date.getMonth();
    const birthstones = [
        { name: 'Garnet', color: '#8B0000', meaning: 'Protection, friendship, and trust. Garnets inspire love and devotion.', emoji: '❤️' },
        { name: 'Amethyst', color: '#9966CC', meaning: 'Peace, courage, and stability. Amethyst calms the mind and spirit.', emoji: '💜' },
        { name: 'Aquamarine', color: '#7FFFD4', meaning: 'Serenity, clarity, and harmony. Aquamarine soothes and cleanses.', emoji: '💎' },
        { name: 'Diamond', color: '#B9F2FF', meaning: 'Eternal love, strength, and invincibility. The king of gems.', emoji: '💍' },
        { name: 'Emerald', color: '#50C878', meaning: 'Rebirth, love, and wisdom. Emeralds bring good fortune.', emoji: '💚' },
        { name: 'Pearl', color: '#FDEEF4', meaning: 'Purity, innocence, and integrity. Pearls symbolize new beginnings.', emoji: '🦪' },
        { name: 'Ruby', color: '#E0115F', meaning: 'Passion, protection, and prosperity. Rubies ignite the fire within.', emoji: '❣️' },
        { name: 'Peridot', color: '#AAFF00', meaning: 'Strength, healing, and harmony. Peridot brings good health.', emoji: '💚' },
        { name: 'Sapphire', color: '#0F52BA', meaning: 'Wisdom, virtue, and good fortune. Sapphires protect loved ones.', emoji: '💙' },
        { name: 'Opal', color: '#A8C3BC', meaning: 'Hope, creativity, and innocence. Opals amplify emotions.', emoji: '🌈' },
        { name: 'Topaz', color: '#FFC87C', meaning: 'Love, affection, and strength. Topaz brings joy and abundance.', emoji: '🧡' },
        { name: 'Turquoise', color: '#40E0D0', meaning: 'Luck, success, and protection. Turquoise is a master healer.', emoji: '💠' }
    ];
    return birthstones[month];
}

// Zodiac Sign
function getZodiacSign(date: Date): { sign: string; symbol: string; element: string; traits: string; dates: string } {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiacSigns = [
        { sign: 'Capricorn', symbol: '♑', element: 'Earth', traits: 'Ambitious, disciplined, patient, and practical', dates: 'Dec 22 - Jan 19' },
        { sign: 'Aquarius', symbol: '♒', element: 'Air', traits: 'Independent, original, humanitarian, and inventive', dates: 'Jan 20 - Feb 18' },
        { sign: 'Pisces', symbol: '♓', element: 'Water', traits: 'Compassionate, artistic, intuitive, and gentle', dates: 'Feb 19 - Mar 20' },
        { sign: 'Aries', symbol: '♈', element: 'Fire', traits: 'Courageous, energetic, confident, and enthusiastic', dates: 'Mar 21 - Apr 19' },
        { sign: 'Taurus', symbol: '♉', element: 'Earth', traits: 'Reliable, patient, devoted, and responsible', dates: 'Apr 20 - May 20' },
        { sign: 'Gemini', symbol: '♊', element: 'Air', traits: 'Gentle, curious, adaptable, and quick learner', dates: 'May 21 - Jun 20' },
        { sign: 'Cancer', symbol: '♋', element: 'Water', traits: 'Tenacious, loyal, emotional, and sympathetic', dates: 'Jun 21 - Jul 22' },
        { sign: 'Leo', symbol: '♌', element: 'Fire', traits: 'Creative, passionate, generous, and warm-hearted', dates: 'Jul 23 - Aug 22' },
        { sign: 'Virgo', symbol: '♍', element: 'Earth', traits: 'Loyal, analytical, kind, and hardworking', dates: 'Aug 23 - Sep 22' },
        { sign: 'Libra', symbol: '♎', element: 'Air', traits: 'Cooperative, diplomatic, fair, and social', dates: 'Sep 23 - Oct 22' },
        { sign: 'Scorpio', symbol: '♏', element: 'Water', traits: 'Resourceful, brave, passionate, and stubborn', dates: 'Oct 23 - Nov 21' },
        { sign: 'Sagittarius', symbol: '♐', element: 'Fire', traits: 'Generous, idealistic, great humor, and adventurous', dates: 'Nov 22 - Dec 21' }
    ];

    // Determine zodiac based on month and day
    if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return zodiacSigns[0]; // Capricorn
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[1]; // Aquarius
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return zodiacSigns[2]; // Pisces
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[3]; // Aries
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[4]; // Taurus
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[5]; // Gemini
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[6]; // Cancer
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[7]; // Leo
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[8]; // Virgo
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[9]; // Libra
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[10]; // Scorpio
    return zodiacSigns[11]; // Sagittarius
}

// Famous Birthdays
function getFamousBirthdays(date: Date): { name: string; profession: string; year: number }[] {
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    const famousPeople: Record<string, { name: string; profession: string; year: number }[]> = {
        '1-1': [{ name: 'J.D. Salinger', profession: 'Author', year: 1919 }, { name: 'Betsy Ross', profession: 'Seamstress/Flag Maker', year: 1752 }],
        '1-15': [{ name: 'Martin Luther King Jr.', profession: 'Civil Rights Leader', year: 1929 }],
        '2-4': [{ name: 'Rosa Parks', profession: 'Civil Rights Activist', year: 1913 }, { name: 'Alice Cooper', profession: 'Rock Musician', year: 1948 }],
        '2-12': [{ name: 'Abraham Lincoln', profession: '16th US President', year: 1809 }],
        '2-22': [{ name: 'George Washington', profession: '1st US President', year: 1732 }],
        '3-14': [{ name: 'Albert Einstein', profession: 'Physicist', year: 1879 }, { name: 'Stephen Curry', profession: 'NBA Player', year: 1988 }],
        '4-15': [{ name: 'Leonardo da Vinci', profession: 'Artist/Inventor', year: 1452 }, { name: 'Emma Watson', profession: 'Actress', year: 1990 }],
        '5-4': [{ name: 'Audrey Hepburn', profession: 'Actress', year: 1929 }],
        '6-14': [{ name: 'Donald Trump', profession: '45th US President', year: 1946 }],
        '7-4': [{ name: 'Calvin Coolidge', profession: '30th US President', year: 1872 }],
        '8-4': [{ name: 'Barack Obama', profession: '44th US President', year: 1961 }],
        '9-9': [{ name: 'Adam Sandler', profession: 'Actor/Comedian', year: 1966 }],
        '10-31': [{ name: 'Vanilla Ice', profession: 'Rapper', year: 1967 }],
        '11-11': [{ name: 'Leonardo DiCaprio', profession: 'Actor', year: 1974 }],
        '12-25': [{ name: 'Isaac Newton', profession: 'Physicist', year: 1642 }, { name: 'Jimmy Buffett', profession: 'Musician', year: 1946 }]
    };

    // Generate some random famous people if not in the list
    const defaults = [
        { name: 'A Notable Author', profession: 'Writer', year: 1950 },
        { name: 'A Famous Musician', profession: 'Entertainer', year: 1965 },
        { name: 'A Celebrated Scientist', profession: 'Researcher', year: 1940 }
    ];

    return famousPeople[key] || defaults;
}

// On This Day events
function getOnThisDay(date: Date): { year: number; event: string }[] {
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    const events: Record<string, { year: number; event: string }[]> = {
        '1-1': [{ year: 1863, event: 'Emancipation Proclamation takes effect' }, { year: 1959, event: 'Cuban Revolution succeeds' }],
        '2-4': [{ year: 2004, event: 'Facebook is launched by Mark Zuckerberg' }, { year: 1789, event: 'George Washington elected 1st US President' }],
        '2-14': [{ year: 1929, event: "St. Valentine's Day Massacre in Chicago" }],
        '3-14': [{ year: 2018, event: 'Stephen Hawking passes away' }],
        '4-12': [{ year: 1961, event: 'Yuri Gagarin becomes first human in space' }],
        '4-15': [{ year: 1912, event: 'Titanic sinks after hitting iceberg' }],
        '6-6': [{ year: 1944, event: 'D-Day: Allied forces invade Normandy' }],
        '7-4': [{ year: 1776, event: 'Declaration of Independence signed' }],
        '7-20': [{ year: 1969, event: 'Apollo 11 lands on the Moon' }],
        '8-6': [{ year: 1945, event: 'Atomic bomb dropped on Hiroshima' }],
        '9-11': [{ year: 2001, event: 'September 11 attacks on World Trade Center' }],
        '10-29': [{ year: 1929, event: 'Black Tuesday - Stock Market crashes' }],
        '11-9': [{ year: 1989, event: 'Berlin Wall falls' }],
        '12-7': [{ year: 1941, event: 'Attack on Pearl Harbor' }],
        '12-25': [{ year: 1991, event: 'Soviet Union officially dissolves' }]
    };

    const defaults = [
        { year: 1900 + (date.getDate() * 3) % 100, event: 'A significant historical event occurred' },
        { year: 1850 + (date.getMonth() * 7) % 150, event: 'An important discovery was made' }
    ];

    return events[key] || defaults;
}

// Then and Now comparison - uses LIVE snapshot data from Google Sheets for "now" values
function getThenAndNow(birthYear: number, snapshot: Record<string, string>): { category: string; then: string; now: string }[] {
    // Historical data by decade (for "then" values only)
    const historicalData: Record<string, Record<number, string>> = {
        'gas': { 1950: '$0.27', 1960: '$0.31', 1970: '$0.36', 1980: '$1.19', 1990: '$1.15', 2000: '$1.51', 2010: '$2.79', 2020: '$2.17' },
        'minwage': { 1950: '$0.75', 1960: '$1.00', 1970: '$1.60', 1980: '$3.10', 1990: '$3.80', 2000: '$5.15', 2010: '$7.25', 2020: '$7.25' },
        'bread': { 1950: '$0.14', 1960: '$0.20', 1970: '$0.24', 1980: '$0.50', 1990: '$0.70', 2000: '$0.99', 2010: '$1.98', 2020: '$2.50' },
        'eggs': { 1950: '$0.60', 1960: '$0.57', 1970: '$0.61', 1980: '$0.84', 1990: '$1.00', 2000: '$0.96', 2010: '$1.79', 2020: '$1.48' },
        'milk': { 1950: '$0.83', 1960: '$0.95', 1970: '$1.15', 1980: '$1.60', 1990: '$2.15', 2000: '$2.78', 2010: '$3.32', 2020: '$3.54' },
        'gold': { 1950: '$35', 1960: '$35', 1970: '$38', 1980: '$615', 1990: '$386', 2000: '$279', 2010: '$1,225', 2020: '$1,770' },
        'silver': { 1950: '$0.74', 1960: '$0.91', 1970: '$1.63', 1980: '$16.39', 1990: '$4.83', 2000: '$4.95', 2010: '$20.19', 2020: '$20.55' },
        'dow': { 1950: '235', 1960: '616', 1970: '839', 1980: '964', 1990: '2,753', 2000: '10,787', 2010: '11,578', 2020: '30,606' },
        'uspop': { 1950: '151M', 1960: '180M', 1970: '205M', 1980: '227M', 1990: '250M', 2000: '282M', 2010: '309M', 2020: '331M' },
        'worldpop': { 1950: '2.5B', 1960: '3.0B', 1970: '3.7B', 1980: '4.4B', 1990: '5.3B', 2000: '6.1B', 2010: '6.9B', 2020: '7.8B' },
        'president': { 1950: 'Harry Truman', 1960: 'Dwight Eisenhower', 1970: 'Richard Nixon', 1980: 'Jimmy Carter', 1990: 'George H.W. Bush', 2000: 'Bill Clinton', 2010: 'Barack Obama', 2020: 'Donald Trump' },
    };

    // "Now" values come LIVE from Google Sheets (which fetches from metals-api.com)
    const nowFromSnapshot: Record<string, string> = {
        'gas': snapshot['GALLON OF GASOLINE'] || '$3.15',
        'minwage': snapshot['MINIMUM WAGE'] || '$7.25',
        'bread': snapshot['LOAF OF BREAD'] || '$2.50',
        'eggs': snapshot['DOZEN EGGS'] || '$3.75',
        'milk': snapshot['GALLON OF MILK'] || '$3.89',
        'gold': snapshot['GOLD OZ'] || 'Loading...',
        'silver': snapshot['SILVER OZ'] || 'Loading...',
        'dow': snapshot['DOW JONES CLOSE'] || '43,250',
        'uspop': snapshot['US POPULATION'] || '340M',
        'worldpop': snapshot['WORLD POPULATION'] || '8.2B',
        'president': snapshot['PRESIDENT'] || 'Donald Trump',
    };

    const getData = (category: string): { then: string; now: string } => {
        const categoryData = historicalData[category] || {};
        const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
        let thenValue = categoryData[2020] || 'N/A';

        for (const decade of decades) {
            if (birthYear <= decade + 9) {
                thenValue = categoryData[decade] || thenValue;
                break;
            }
        }

        return { then: thenValue, now: nowFromSnapshot[category] || 'N/A' };
    };

    const comparisons = [
        { category: '⛽ Gas (Gallon)', ...getData('gas') },
        { category: '💵 Minimum Wage', ...getData('minwage') },
        { category: '🍞 Loaf of Bread', ...getData('bread') },
        { category: '🥚 Dozen Eggs', ...getData('eggs') },
        { category: '🥛 Milk (Gallon)', ...getData('milk') },
        { category: '🪙 Gold (oz)', ...getData('gold') },
        { category: '💍 Silver (oz)', ...getData('silver') },
        { category: '📈 Dow Jones', ...getData('dow') },
        { category: '🇺🇸 US Population', ...getData('uspop') },
        { category: '🌍 World Population', ...getData('worldpop') },
        { category: '🏛️ President', ...getData('president') },
    ];

    return comparisons;
}

export default function JustForFunScreen({ navigation }: Props) {
    const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null);
    const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [birthLocation, setBirthLocation] = useState('');
    const [result, setResult] = useState<any>(null);
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const currentFeatureRef = useRef<FeatureType>(null);

    // Fetch live snapshot from Google Sheets on mount
    useEffect(() => {
        (async () => {
            try {
                const data = await getAllSnapshotValues();
                console.log('📊 JustForFun: Gold from Google Sheets =', data['GOLD OZ'], 'Silver =', data['SILVER OZ']);
                setSnapshot(data);
            } catch (error) {
                console.warn('⚠️ JustForFun: Failed to fetch snapshot:', error);
            }
        })();
    }, []);

    const selectFeature = (feature: FeatureType) => {
        setSelectedFeature(feature);
        currentFeatureRef.current = feature;
        // Calculate immediately with current birthDate
        handleCalculate(birthDate, feature);
    };

    const handleCalculate = (date?: Date, feature?: FeatureType) => {
        const dateToUse = date || birthDate;
        const featureToUse = feature || currentFeatureRef.current || selectedFeature;

        if (featureToUse === 'lifepath') {
            setResult(calculateLifePathNumber(dateToUse));
        } else if (featureToUse === 'lucky') {
            setResult(getLuckyNumbers(dateToUse));
        } else if (featureToUse === 'roman') {
            setResult(toRomanNumerals(dateToUse));
        } else if (featureToUse === 'birthstone') {
            setResult(getBirthstone(dateToUse));
        } else if (featureToUse === 'zodiac') {
            setResult(getZodiacSign(dateToUse));
        } else if (featureToUse === 'famous') {
            setResult(getFamousBirthdays(dateToUse));
        } else if (featureToUse === 'onthisday') {
            setResult(getOnThisDay(dateToUse));
        } else if (featureToUse === 'thenandnow') {
            // Pass snapshot for LIVE gold/silver prices from Google Sheets
            setResult(getThenAndNow(dateToUse.getFullYear(), snapshot));
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (selectedFeature === 'lifepath') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>🔢 Your Life Path Number</Text>
                    <Text style={styles.bigNumber}>{result.number}</Text>
                    <Text style={styles.resultMeaning}>{result.meaning}</Text>

                    <View style={{ backgroundColor: '#f0e6ff', padding: 16, borderRadius: 12, marginTop: 20, width: '100%' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4a148c', marginBottom: 8 }}>
                            What is a Life Path Number?
                        </Text>
                        <Text style={{ fontSize: 14, color: '#333', lineHeight: 22 }}>
                            Your Life Path Number is the most important number in numerology. It's calculated from your birth date and reveals your life's purpose, natural talents, and the lessons you're here to learn.
                        </Text>
                        <Text style={{ fontSize: 14, color: '#333', lineHeight: 22, marginTop: 12 }}>
                            Think of it as your spiritual blueprint - a guide to understanding who you are at your core and what path will bring you the greatest fulfillment.
                        </Text>

                        <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#d0c0e0' }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#7b1fa2' }}>How It's Calculated:</Text>
                            <Text style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                                Add all digits of your birth date until you get a single digit (or master number 11, 22, 33).
                            </Text>
                            <Text style={{ fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' }}>
                                Your birthday: {birthDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (selectedFeature === 'lucky') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>Your Lucky Numbers Today</Text>

                    {/* Lottery Numbers (1-49) */}
                    <Text style={[styles.resultNote, { marginTop: 12, fontWeight: '700', fontSize: 14 }]}>Lottery (1-49)</Text>
                    <View style={styles.numbersRow}>
                        {result.lottery.map((num: number, idx: number) => (
                            <View key={idx} style={styles.luckyBall}>
                                <Text style={styles.luckyNumber}>{num}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Keno Numbers (1-80) */}
                    <Text style={[styles.resultNote, { marginTop: 20, fontWeight: '700', fontSize: 14 }]}>Keno (1-80)</Text>
                    <View style={[styles.numbersRow, { flexWrap: 'wrap', justifyContent: 'center' }]}>
                        {result.keno.map((num: number, idx: number) => (
                            <View key={idx} style={[styles.luckyBall, { backgroundColor: '#10b981', margin: 4 }]}>
                                <Text style={styles.luckyNumber}>{num}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.resultNote, { marginTop: 16 }]}>Based on your birthday energy + today's date</Text>
                </View>
            );
        }

        if (selectedFeature === 'roman') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>Your Birthday in Roman Numerals</Text>
                    <Text style={styles.romanFull}>{result.full}</Text>
                    <View style={styles.romanDetails}>
                        <Text style={styles.romanLabel}>Month: <Text style={styles.romanValue}>{result.month}</Text></Text>
                        <Text style={styles.romanLabel}>Day: <Text style={styles.romanValue}>{result.day}</Text></Text>
                        <Text style={styles.romanLabel}>Year: <Text style={styles.romanValue}>{result.year}</Text></Text>
                    </View>
                </View>
            );
        }

        if (selectedFeature === 'birthstone') {
            return (
                <View style={[styles.resultBox, { borderLeftWidth: 6, borderLeftColor: result.color }]}>
                    <Text style={styles.resultTitle}>Your Birthstone</Text>
                    <Text style={{ fontSize: 48 }}>{result.emoji}</Text>
                    <Text style={[styles.bigNumber, { fontSize: 36, color: result.color }]}>{result.name}</Text>
                    <Text style={styles.resultMeaning}>{result.meaning}</Text>
                </View>
            );
        }

        if (selectedFeature === 'zodiac') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>Your Zodiac Sign</Text>
                    <Text style={{ fontSize: 64 }}>{result.symbol}</Text>
                    <Text style={[styles.bigNumber, { fontSize: 32 }]}>{result.sign}</Text>
                    <Text style={styles.resultNote}>{result.dates}</Text>
                    <View style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginTop: 12 }}>
                        <Text style={{ fontWeight: 'bold', color: '#4a148c' }}>Element: {result.element}</Text>
                        <Text style={{ marginTop: 8, color: '#333' }}>{result.traits}</Text>
                    </View>
                </View>
            );
        }

        if (selectedFeature === 'famous') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>Famous People Who Share Your Birthday</Text>
                    {result.map((person: any, idx: number) => (
                        <View key={idx} style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8, width: '100%' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4a148c' }}>{person.name}</Text>
                            <Text style={{ color: '#666' }}>{person.profession}</Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Born {person.year}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        if (selectedFeature === 'onthisday') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>📅 On This Day in History</Text>
                    {result.map((event: any, idx: number) => (
                        <View key={idx} style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8, width: '100%' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4a148c' }}>{event.year}</Text>
                            <Text style={{ color: '#333', marginTop: 4 }}>{event.event}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        if (selectedFeature === 'thenandnow') {
            return (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>⏰ Then & Now Time Capsule</Text>
                    <Text style={styles.resultNote}>When you were born vs. today</Text>
                    {result.map((item: any, idx: number) => (
                        <View key={idx} style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8, width: '100%' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4a148c' }}>{item.category}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#999' }}>THEN</Text>
                                    <Text style={{ fontSize: 16, color: '#333' }}>{item.then}</Text>
                                </View>
                                <Text style={{ fontSize: 20, color: '#ccc' }}>→</Text>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12, color: '#999' }}>NOW</Text>
                                    <Text style={{ fontSize: 16, color: '#333' }}>{item.now}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                    <Text style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 12, textAlign: 'center' }}>
                        *Minimum wage shown is federal rate ($7.25). Your actual rate may be higher based on state or local laws.
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <LinearGradient colors={['#4a148c', '#7b1fa2']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4a148c" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>🎲 Just For Fun!</Text>
                    <Text style={styles.subtitle}>Discover fun facts about your birthday</Text>
                </View>

                {/* Date Picker Section - Always visible at top */}
                <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>🎂 Enter Your Birthday:</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {birthDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.timeText}>
                                🕒 {birthDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollableDatePicker
                        visible={showDatePicker}
                        date={birthDate}
                        onDateChange={(date) => {
                            setBirthDate(date);
                            if (currentFeatureRef.current) {
                                handleCalculate(date, currentFeatureRef.current);
                            }
                        }}
                        onClose={() => setShowDatePicker(false)}
                        title="Enter Your Birthday"
                    />

                    {showTimePicker && (
                        <DateTimePicker
                            value={birthDate}
                            mode="time"
                            display="default"
                            is24Hour={false}
                            onChange={(_, date) => {
                                setShowTimePicker(false);
                                if (date) {
                                    // Preserve existing date, update time
                                    const newDate = new Date(birthDate);
                                    newDate.setHours(date.getHours(), date.getMinutes());
                                    setBirthDate(newDate);
                                    if (currentFeatureRef.current) {
                                        handleCalculate(newDate, currentFeatureRef.current);
                                    }
                                }
                            }}
                        />
                    )}

                    {/* Location Input */}
                    <Text style={styles.locationLabel}>📍 Birth Location (City, State):</Text>
                    <TextInput
                        style={styles.locationInput}
                        value={birthLocation}
                        onChangeText={setBirthLocation}
                        placeholder="e.g., Los Angeles, CA"
                        placeholderTextColor="rgba(74, 20, 140, 0.5)"
                    />
                </View>

                {/* Feature Buttons */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'lifepath' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('LifePathNumber', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Find Your Life Path Number</Text>
                        <Text style={styles.featureDesc}>Discover your numerology destiny</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'lucky' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('LuckyNumbers', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🔢</Text>
                        <Text style={styles.featureTitle}>Your Numerology Numbers</Text>
                        <Text style={styles.featureDesc}>Life Path, Birthday, &amp; Personal Year</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Horoscope', {
                            birthDate: birthDate.toISOString(),
                            birthTime: birthDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }),
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🔮</Text>
                        <Text style={styles.featureTitle}>View Your Daily Horoscope</Text>
                        <Text style={styles.featureDesc}>Real-time planetary transits to your chart</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for accurate results</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('TipOfTheDay', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>💫</Text>
                        <Text style={styles.featureTitle}>Tip of the Day</Text>
                        <Text style={styles.featureDesc}>A daily astrology tip just for your sign</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'roman' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('RomanNumerals', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🏛️</Text>
                        <Text style={styles.featureTitle}>Birthday in Roman Numerals</Text>
                        <Text style={styles.featureDesc}>See your birthday the ancient way</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'birthstone' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('Birthstone', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>💎</Text>
                        <Text style={styles.featureTitle}>What is Your Birthstone?</Text>
                        <Text style={styles.featureDesc}>Discover your gem and its meaning</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'zodiac' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('ZodiacSign', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>⭐</Text>
                        <Text style={styles.featureTitle}>What is Your Zodiac Sign?</Text>
                        <Text style={styles.featureDesc}>Learn your astrological profile</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for Rising sign accuracy</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'famous' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('FamousBirthdays', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>🌟</Text>
                        <Text style={styles.featureTitle}>Famous Birthday Twins</Text>
                        <Text style={styles.featureDesc}>Celebrities who share your day</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'onthisday' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('OnThisDay', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>📅</Text>
                        <Text style={styles.featureTitle}>On This Day in History</Text>
                        <Text style={styles.featureDesc}>What happened on your birthday</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.featureButton, selectedFeature === 'thenandnow' && styles.featureButtonActive]}
                        onPress={() => navigation.navigate('ThenAndNow', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>⏰</Text>
                        <Text style={styles.featureTitle}>Then & Now Time Capsule</Text>
                        <Text style={styles.featureDesc}>Compare prices & facts from your birth year</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('SurnameSearch', {})}
                    >
                        <Text style={styles.featureEmoji}>🔍</Text>
                        <Text style={styles.featureTitle}>Surname Origin Search</Text>
                        <Text style={styles.featureDesc}>Discover the history of your last name</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('FullAstrology', {
                            birthDate: birthDate.toISOString(),
                            birthTime: birthDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }),
                            birthLocation: birthLocation || undefined,
                        })}
                    >
                        <Text style={styles.featureEmoji}>🔮</Text>
                        <Text style={styles.featureTitle}>Full Natal Chart</Text>
                        <Text style={styles.featureDesc}>Your complete astrological birth chart</Text>
                        {!birthLocation && (
                            <Text style={styles.recommendNotice}>💡 Enter birth time & location above for best results</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => navigation.navigate('Generations', { birthDate: birthDate.toISOString() })}
                    >
                        <Text style={styles.featureEmoji}>👨‍👩‍👧‍👦</Text>
                        <Text style={styles.featureTitle}>What Generation Am I?</Text>
                        <Text style={styles.featureDesc}>Greatest to Alpha - explore all 7 generations!</Text>
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {renderResult()}

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back to Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    buttonSection: {
        gap: 12,
    },
    featureButton: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    featureButtonActive: {
        borderColor: '#ffeb3b',
        backgroundColor: 'rgba(255,235,59,0.2)',
    },
    featureEmoji: {
        fontSize: 36,
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    recommendNotice: {
        fontSize: 12,
        color: '#ffd700',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    dateSection: {
        marginTop: 24,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    dateButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#4a148c',
        fontWeight: '600',
    },
    timeButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 16,
        color: '#4a148c',
        fontWeight: '600',
    },
    locationLabel: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        marginTop: 8,
    },
    locationInput: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        color: '#4a148c',
        fontWeight: '500',
        width: '90%',
        textAlign: 'center',
    },
    calculateButton: {
        backgroundColor: '#ffeb3b',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
    },
    calculateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a148c',
    },
    resultBox: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 24,
        marginTop: 24,
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a148c',
        marginBottom: 16,
    },
    bigNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#7b1fa2',
    },
    resultMeaning: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    numbersRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    luckyBall: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#7b1fa2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    luckyNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    resultNote: {
        fontSize: 12,
        color: '#666',
        marginTop: 16,
        fontStyle: 'italic',
    },
    romanFull: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#7b1fa2',
        letterSpacing: 2,
        marginBottom: 16,
    },
    romanDetails: {
        gap: 8,
    },
    romanLabel: {
        fontSize: 16,
        color: '#333',
    },
    romanValue: {
        fontWeight: 'bold',
        color: '#7b1fa2',
    },
    backButton: {
        marginTop: 30,
        marginBottom: 40,
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
});
