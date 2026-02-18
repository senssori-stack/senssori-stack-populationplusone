import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { getCurrentGovernor } from '../src/data/utils/current-governors';
import { BIRTHSTONE_EMOJIS, getBirthstoneLink, getLifePathLink, getSnapshotEmojiLink, getStateFlagLink, getZodiacLink, ZODIAC_EMOJIS } from '../src/data/utils/emoji-links';
import { formatSnapshotValue } from '../src/data/utils/formatSnapshot';
import { getSnapshotWithHistorical } from '../src/data/utils/historical-snapshot';
import { getFederalMinimumWage, getMinimumWage } from '../src/data/utils/minimum-wage';
import { extractStateFromHometown, getStateFlagImage } from '../src/data/utils/state-flags';
import { getCityCoordinatesAsync } from '../src/data/utils/town-coordinates';
import type { ThemeName } from '../src/types';

// US Flag image
const US_FLAG_IMAGE = require('../assets/images/us-flag.png');

// America 250 Anniversary logos - pick based on theme
const AMERICA250_WHITE = require('../assets/images/america250-white.png');
const AMERICA250_BLACK = require('../assets/images/america250-black.png');
const AMERICA250_COLOR = require('../assets/images/america250-color.png');

// Get the right America 250 logo based on theme background (white for dark themes, black for light)
function getAmerica250Logo(themeName: string): any {
    // Light backgrounds that need black logo
    const lightThemes = ['lightGray', 'silver', 'lavender', 'coral', 'gold', 'orange', 'limeGreen', 'mintGreen'];
    if (lightThemes.includes(themeName)) {
        return AMERICA250_BLACK;
    }
    // All other themes (dark backgrounds) use white logo
    return AMERICA250_WHITE;
}

// Landscape 11x8.5 at 300 DPI = 3300x2550 pixels
export const LANDSCAPE_WIDTH = 3300;
export const LANDSCAPE_HEIGHT = 2550;

type Props = {
    theme: ThemeName;
    babies?: Array<{ first?: string; middle?: string; last?: string; photoUri?: string | null }>;
    babyName?: string;
    dobISO: string;
    motherName: string;
    fatherName: string;
    weightLb: string;
    weightOz: string;
    lengthIn: string;
    hometown: string;
    snapshot: Record<string, string>;
    zodiac: string;
    birthstone: string;
    lifePathNumber?: number;
    previewScale?: number;
    mode?: 'baby' | 'milestone'; // 'baby' for birth announcement, 'milestone' for birthdays
    message?: string; // Prewritten message for milestone mode
};

/**
 * Convert hometown to Title Case (e.g., "NEW YORK, NY" -> "New York, NY")
 */
function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(/\b/)
        .map(word => {
            // Capitalize first letter of each word, but preserve state abbreviations
            if (word.match(/^[a-z]{2}$/)) {
                // State abbreviation (2 letters after comma)
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}

const SNAP_KEYS: { label: string; key: string; emoji: string }[] = [
    { label: 'Gas (Gallon) — National Avg', key: 'GALLON OF GASOLINE', emoji: '⛽' },
    { label: 'Minimum Wage', key: 'MINIMUM WAGE', emoji: '💵' },
    { label: 'Loaf of Bread', key: 'LOAF OF BREAD', emoji: '🍞' },
    { label: 'Dozen Eggs', key: 'DOZEN EGGS', emoji: '🥚' },
    { label: 'Milk (Gallon)', key: 'GALLON OF MILK', emoji: '🥛' },
    { label: 'Gold (oz)', key: 'GOLD OZ', emoji: '🪙' },
    { label: 'Silver (oz)', key: 'SILVER OZ', emoji: '💍' },
    { label: 'Dow Jones', key: 'DOW JONES CLOSE', emoji: '📈' },
    { label: '#1 Song', key: '#1 SONG', emoji: '🎵' },
    { label: '#1 Movie', key: '#1 MOVIE', emoji: '🎬' },
    { label: 'Superbowl Champs', key: 'WON LAST SUPERBOWL', emoji: '🏈' },
    { label: 'World Series Champs', key: 'WON LAST WORLD SERIES', emoji: '⚾' },
    { label: 'US Population', key: 'US POPULATION', emoji: '🇺🇸' },
    { label: 'World Population', key: 'WORLD POPULATION', emoji: '🌍' },
    { label: 'President', key: 'PRESIDENT', emoji: '🏛️' },
    { label: 'Vice President', key: 'VICE PRESIDENT', emoji: '🏛️' },
];

// Auto-fit text component for baby names
function AutoFitName({ text, style, maxWidth }: { text: string; style?: any; maxWidth: number }) {
    const initialSize = (style && style.fontSize) ? style.fontSize : 14;
    const [fontSize, setFontSize] = useState<number>(initialSize);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);
    const minSize = 8;

    useEffect(() => {
        const newSize = (style && style.fontSize) ? style.fontSize : 14;
        setFontSize(newSize);
    }, [text, style]);

    useEffect(() => {
        if (containerWidth && containerWidth > maxWidth && fontSize > minSize) {
            setFontSize(prev => Math.max(minSize, prev - 1));
        }
    }, [containerWidth, maxWidth, fontSize, minSize]);

    return (
        <Text
            style={[style, { fontSize }]}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {text}
        </Text>
    );
}

// Clickable emoji component that opens links
interface ClickableEmojiProps {
    emoji: string;
    url?: string | null;
    style?: any;
    tooltip?: string;
}

function ClickableEmoji({ emoji, url, style, tooltip }: ClickableEmojiProps) {
    const [showTooltip, setShowTooltip] = React.useState(false);

    if (!url) {
        return <Text style={style}>{emoji}</Text>;
    }

    const handlePress = async () => {
        if (tooltip) {
            // Show tooltip briefly before opening URL
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 1500);
        }

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.warn('Failed to open URL:', error);
        }
    };

    return (
        <View style={{ position: 'relative', alignItems: 'center' }}>
            {showTooltip && tooltip && (
                <View style={{
                    position: 'absolute',
                    bottom: 30,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 6,
                    marginBottom: 4,
                    zIndex: 1000,
                }}>
                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: '600',
                    }}>
                        {tooltip}
                    </Text>
                </View>
            )}
            <Pressable onPress={handlePress} style={({ pressed }) => [
                style,
                { opacity: pressed ? 0.7 : 1 }
            ]}>
                <Text style={style}>{emoji}</Text>
            </Pressable>
        </View>
    );
}

export default function TimeCapsuleLandscape(props: Props) {
    const {
        theme,
        babies,
        babyName,
        dobISO,
        motherName,
        fatherName,
        weightLb,
        weightOz,
        lengthIn,
        hometown,
        zodiac,
        birthstone,
        lifePathNumber,
        snapshot,
        previewScale = 0.2,
        mode,
        message,
    } = props;

    // Get historical snapshot data based on birth date
    const [historicalSnapshot, setHistoricalSnapshot] = useState<Record<string, string>>(snapshot || {});
    const [currentSnapshot, setCurrentSnapshot] = useState<Record<string, string>>({});
    const [cityPopThen, setCityPopThen] = useState<string>('N/A');
    const [cityPopNow, setCityPopNow] = useState<string>('N/A');
    const [cityNotFound, setCityNotFound] = useState<boolean>(false);

    // Get current governor based on state code
    const stateCode = extractStateFromHometown(hometown);
    const currentGovernor = stateCode ? getCurrentGovernor(stateCode) : 'Governor';

    useEffect(() => {
        const loadHistoricalData = async () => {
            try {
                // Get THEN data (birth date)
                const historicalData = await getSnapshotWithHistorical(dobISO);
                setHistoricalSnapshot(historicalData);
                console.log('Historical (THEN) data loaded:', Object.keys(historicalData).length, 'keys');

                // Get NOW data (current/live data - don't pass date to get fresh data)
                const { getAllSnapshotValues } = await import('../src/data/utils/snapshot');
                const currentData = await getAllSnapshotValues();
                setCurrentSnapshot(currentData);
                console.log('Current (NOW) data loaded:', Object.keys(currentData).length, 'keys');
                console.log('NOW data keys:', Object.keys(currentData));
                console.log('Sample NOW data - Gas:', currentData['GALLON OF GASOLINE']);
                console.log('Sample NOW data - President:', currentData['PRESIDENT']);

                // Fetch city population data separately
                if (hometown && hometown.trim()) {
                    const { getHistoricalPopulationForCity } = await import('../src/data/utils/historical-populations');
                    const { getCurrentPopulationForCity } = await import('../src/data/utils/populations');

                    // Get birth year from dobISO
                    const birthYear = new Date(dobISO).getFullYear();

                    console.log(`📍 Fetching city population for ${hometown}`);
                    console.log(`   Birth year: ${birthYear}`);

                    /**
                     * ⚠️ CRITICAL POPULATION FETCH RULES:
                     * THEN section → HISTORICAL CSV (getHistoricalPopulationForCity)
                     * NOW section → CURRENT CSV (getCurrentPopulationForCity)
                     */

                    // Fetch historical (THEN) city population - HISTORICAL CSV
                    const popThen = await getHistoricalPopulationForCity(hometown, birthYear);

                    // Fetch current (NOW) city population - CURRENT CSV  
                    const popNow = await getCurrentPopulationForCity(hometown);

                    console.log(`📊 Population results - THEN: ${popThen}, NOW: ${popNow}`);

                    if (popThen === null && popNow === null) {
                        // City not found at all
                        console.warn(`⚠️ City not found in database: ${hometown}`);
                        setCityNotFound(true);
                        setCityPopThen('CITY NOT FOUND');
                        setCityPopNow('CITY NOT FOUND');
                    } else {
                        // City found - format populations (NO ALERT)
                        setCityNotFound(false);
                        setCityPopThen(popThen !== null ? popThen.toLocaleString() : 'N/A');
                        setCityPopNow(popNow !== null ? popNow.toLocaleString() : 'N/A');
                        console.log(`✅ City found: ${hometown} - THEN: ${popThen?.toLocaleString()}, NOW: ${popNow?.toLocaleString()}`);
                    }
                } else {
                    setCityPopThen('N/A');
                    setCityPopNow('N/A');
                }
            } catch (error) {
                console.warn('Failed to load historical data:', error);
                setHistoricalSnapshot(snapshot || {});
            }
        };

        if (dobISO) {
            loadHistoricalData();
        } else {
            setHistoricalSnapshot(snapshot || {});
        }
    }, [dobISO, snapshot, hometown]);

    const colors = COLOR_SCHEMES[theme];

    // Calculate dimensions
    const displayWidth = LANDSCAPE_WIDTH * previewScale;
    const displayHeight = LANDSCAPE_HEIGHT * previewScale;

    // Font sizes - ALL fonts reduced by 20% for better spacing
    const titleSize = Math.round(displayHeight * 0.0354 * 2.0 * 0.8 * 0.8); // Baby name: reduced by 20% more
    const timeCapsuleSize = Math.round(displayHeight * 0.01654 * 4.0 * 0.68 * 0.8); // TIME CAPSULE: reduced by 20% more
    const bodySize = Math.round(displayHeight * 0.0152 * 1.32 * 0.8); // Body text: reduced by 20%
    const labelSize = Math.round(displayHeight * 0.016 * 1.2 * 0.8); // Labels: reduced by 20%
    const valueSize = Math.round(displayHeight * 0.016 * 1.2 * 0.8); // Values: reduced by 20%
    const sourcesSize = Math.round(displayHeight * 0.01107421875 * 1.2 * 0.8); // Sources: reduced by 20%

    // Border and padding
    const borderWidth = Math.round(displayHeight * 0.02);
    const padding = Math.round(displayHeight * 0.02);

    // Build baby names with smart middle initial logic - for twins, no last name on first baby
    const babyNames: string[] = [];
    const babyFullNames: string[] = []; // Full names for milestone mode (no middle initial)
    if (babies && babies.length > 0) {
        for (let i = 0; i < babies.length; i++) {
            const b = babies[i];
            const first = b.first || '';
            const middle = b.middle || '';
            const last = b.last || '';
            // Use middle initial for longer names to prevent overflow
            const middleInitial = middle ? middle.charAt(0) + '.' : '';

            // Build full name (for milestones - use complete middle name)
            const fullName = [first, middle, last].filter(Boolean).join(' ');
            if (fullName) babyFullNames.push(fullName);

            // For the first baby in twins/multiples, skip the last name to save space
            if (i === 0 && babies.length > 1) {
                const p = [first, middleInitial].filter(Boolean).join(' ');
                if (p) babyNames.push(p);
            } else {
                const p = [first, middleInitial, last].filter(Boolean).join(' ');
                if (p) babyNames.push(p);
            }
        }
    } else if (babyName) {
        babyNames.push(babyName);
        babyFullNames.push(babyName);
    }

    // Get first name for possessive references
    let babyFirstOnly = '';
    if (babies && babies.length > 0) {
        const f = babies[0].first || '';
        if (f && f.trim()) babyFirstOnly = f.trim();
    }
    if (!babyFirstOnly && babyName) {
        const tok = babyName.split(' ').map(t => t.trim()).filter(Boolean);
        if (tok.length > 0) babyFirstOnly = tok[0];
    }

    // Build intro text with new verbiage
    const namesForSentence = babyNames.length > 0 ? babyNames.join(' & ') : 'Baby';
    const fullNamesForSentence = babyFullNames.length > 0 ? babyFullNames.join(' & ') : 'Baby';

    // Format date from dobISO (YYYY-MM-DD)
    let formattedDate = dobISO;
    try {
        const dateObj = new Date(dobISO + 'T00:00:00');
        formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) { }

    const parts: string[] = [];

    // Calculate age from DOB
    const birthDate = new Date(dobISO + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Get zodiac and birthstone emojis
    const zodiacEmoji = ZODIAC_EMOJIS[zodiac] || '♈';
    const birthstoneEmoji = BIRTHSTONE_EMOJIS[birthstone] || '💎';
    const lifepathEmoji = '🎱'; // Ping pong ball emoji for life path numbers

    // Check if this is a milestone (birthday) or baby announcement
    // Detect milestone mode: either explicit mode prop OR no birth measurements (weight/length)
    const isMilestoneMode = mode === 'milestone' || (!weightLb && !weightOz && !lengthIn && !fatherName);

    if (isMilestoneMode) {
        // BIRTHDAY MILESTONE FORMAT:
        // "[full name] was born on [date] in [city, st] and is now [age] years old. 
        // [first name]'s zodiac sign is [sign] [emoji] their birthstone is [birthstone] 
        // have a life path number of [number] [emoji]"
        parts.push(`${fullNamesForSentence} was born on ${formattedDate} in ${toTitleCase(hometown)} and is now ${age} years old`);

        let attributeText = `${babyFirstOnly}'s zodiac sign is ${zodiac} ${zodiacEmoji} their birthstone is ${birthstone} ${birthstoneEmoji}`;
        if (lifePathNumber) {
            attributeText += ` have a life path number of ${lifePathNumber} ${lifepathEmoji}`;
        }
        parts.push(attributeText);
    } else {
        // BABY ANNOUNCEMENT FORMAT:
        // "[Baby full name] was born on [date of birth] in [city, st] and weighed [weight lbs] [ounces] and was [length] in length.
        // and the parents are mother, [mother's name] and father [father's name]"
        // The zodiac, birthstone, and life path info will be shown separately with clickable emojis

        // Build the birth details sentence
        let birthSentence = `${fullNamesForSentence} was born on ${formattedDate} in ${toTitleCase(hometown)}`;

        // Add weight and length if available
        if (weightLb && weightOz && lengthIn && weightLb.trim() && weightOz.trim() && lengthIn.trim()) {
            birthSentence += ` and weighed ${weightLb} lbs ${weightOz} oz and was ${lengthIn} inches in length`;
        } else if (weightLb && weightOz && weightLb.trim() && weightOz.trim()) {
            birthSentence += ` and weighed ${weightLb} lbs ${weightOz} oz`;
        } else if (lengthIn && lengthIn.trim()) {
            birthSentence += ` and was ${lengthIn} inches in length`;
        }

        // Add parents' names
        const hasMotherName = motherName && motherName.trim();
        const hasFatherName = fatherName && fatherName.trim();
        if (hasMotherName && hasFatherName) {
            birthSentence += ` and the parents are mother, ${motherName.trim()} and father, ${fatherName.trim()}`;
        } else if (hasMotherName) {
            birthSentence += ` and the parent is mother, ${motherName.trim()}`;
        } else if (hasFatherName) {
            birthSentence += ` and the parent is father, ${fatherName.trim()}`;
        }

        parts.push(birthSentence);
        // Note: Zodiac, birthstone, and life path will be rendered separately with clickable emojis below
    }
    const validParts = parts.filter(part => part && typeof part === 'string' && part.trim().length > 0);
    const intro = validParts.join('. ').replace(/\.\s*\./g, '.').replace(/\s+\./g, '.');

    // Use the prewritten message as-is for milestone mode
    // The "Here is some interesting information" sentence is appended at form completion
    // and stays as the last sentence of the customer's message paragraph
    let milestoneMessage = '';
    if (isMilestoneMode && message) {
        milestoneMessage = message.trim();
    }

    // State for coordinates (fetched from Google Sheets)
    const [coordinates, setCoordinates] = useState<string>('');

    // Fetch coordinates from Google Sheets
    useEffect(() => {
        if (hometown && hometown.trim()) {
            getCityCoordinatesAsync(hometown).then(coords => {
                if (coords) {
                    const latDir = coords.lat >= 0 ? 'N' : 'S';
                    const lngDir = coords.lng >= 0 ? 'E' : 'W';
                    setCoordinates(`${Math.abs(coords.lat).toFixed(4)}° ${latDir}, ${Math.abs(coords.lng).toFixed(4)}° ${lngDir}`);
                }
            }).catch(err => {
                console.error('Failed to fetch coordinates:', err);
            });
        }
    }, [hometown]);

    // Get birth year for historical minimum wage lookup
    const birthYear = dobISO ? new Date(dobISO + 'T00:00:00').getFullYear() : new Date().getFullYear();

    // For THEN: Use FEDERAL minimum wage for historical accuracy (we don't have historical state data)
    // For NOW: Use geolocation-aware minimum wage (highest of federal, state, or local)
    const historicalFederalMinWage = getFederalMinimumWage(birthYear);
    const currentMinWage = getMinimumWage(hometown, new Date().getFullYear());

    // Build data rows with THEN and NOW columns (no zodiac/birthstone in table)
    let rows: [string, string, string, string][] = SNAP_KEYS.map(({ label, key, emoji }) => {
        // Override minimum wage with accurate values
        if (key === 'MINIMUM WAGE') {
            return [
                `${label} ${emoji}`,
                `${historicalFederalMinWage.toFixed(2)}`,  // THEN: Federal rate for birth year
                `${currentMinWage.wage.toFixed(2)}`,      // NOW: Geolocation-aware current rate
                emoji
            ];
        }
        // Gold and silver prices come from Google Sheets CSV (via currentSnapshot)
        return [
            `${label} ${emoji}`,
            formatSnapshotValue(key, historicalSnapshot[key] ?? ''),
            formatSnapshotValue(key, currentSnapshot[key] ?? ''),
            emoji
        ];
    });

    // Debug: log first few rows to check NOW values
    console.log('Row sample - Gas:', rows[0]);
    console.log('Row sample - Dow Jones:', rows.find(r => r[0].includes('Dow Jones')));
    console.log('Current snapshot keys:', Object.keys(currentSnapshot).length);
    console.log('Historical snapshot keys:', Object.keys(historicalSnapshot).length);

    // City population is now loaded via state (cityPopThen, cityPopNow)
    console.log('City Population THEN:', cityPopThen);
    console.log('City Population NOW:', cityPopNow);
    console.log('City not found:', cityNotFound);

    // Insert city population row just before US Population
    // Find the index of US Population row
    const usPopIndex = rows.findIndex(row => row[3] === '🇺🇸');
    if (usPopIndex > -1) {
        // Insert city population row before US population
        rows.splice(usPopIndex, 0, [
            `${toTitleCase(hometown)} Population 📍`,
            cityPopThen,
            cityPopNow,
            '📍'
        ]);
    }

    // ====== GREEN: Center all main content vertically and horizontally, exclude sources ======
    return (
        <View style={[styles.container, {
            width: displayWidth,
            height: displayHeight,
            backgroundColor: colors.bg,
            overflow: 'hidden',
            position: 'relative'
        }]}>
            {/* White outer border */}
            <View style={[styles.border, {
                borderWidth,
                borderColor: colors.border || '#FFFFFF',
                margin: padding,
                flex: 1,
                borderRadius: Math.round(displayHeight * 0.04)
            }]}>
                {/* Main content centered vertically and horizontally */}
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-start', // Move content to top
                    alignItems: 'center',     // GREEN: center horizontally
                    width: '100%',
                    padding: padding * 0.8,
                    paddingTop: padding * 0.3, // Reduce top padding (0.5 inches at 300 DPI = 150px)
                    borderRadius: Math.round(displayHeight * 0.03),
                }}>
                    {/* Header Row - Flag on left, name/title always centered on page */}
                    <View style={{
                        width: '100%',
                        marginBottom: padding * 0.1,
                        position: 'relative',
                    }}>
                        {/* American Flag - Close to left border */}
                        <View style={{
                            position: 'absolute',
                            left: '-22%',
                            top: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                        }}>
                            <Image
                                source={US_FLAG_IMAGE}
                                style={{
                                    width: titleSize * 3.12,
                                    height: titleSize * 1.66,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>

                        {/* Center: Name and Time Capsule - always centered on page */}
                        <View style={{
                            alignItems: 'center',
                            width: '100%',
                        }}>
                            {/* Customer Name Header - Baby mode shows baby name, Milestone shows parent names */}
                            {mode === 'baby' ? (
                                babyNames.length > 0 && (
                                    <Text style={[styles.title, {
                                        fontSize: titleSize * 0.7 * 1.4,
                                        color: colors.text,
                                        textAlign: 'center',
                                        marginBottom: 0,
                                        fontWeight: '900'
                                    }]}>
                                        {babyNames.join(' & ')}
                                    </Text>
                                )
                            ) : (
                                (motherName || fatherName) ? (
                                    <Text style={[styles.title, {
                                        fontSize: titleSize * 0.7 * 1.4,
                                        color: colors.text,
                                        textAlign: 'center',
                                        marginBottom: 0,
                                        fontWeight: '900'
                                    }]}>
                                        {[motherName, fatherName].filter(Boolean).join(' & ')}
                                    </Text>
                                ) : null
                            )}

                            {/* "Time Capsule" title */}
                            <Text style={[styles.title, { fontSize: timeCapsuleSize * 0.75 * 1.4, color: colors.text, marginTop: 0 }]}>
                                Time Capsule
                            </Text>
                        </View>

                        {/* America 250 Logo - Right Side */}
                        <View style={{
                            position: 'absolute',
                            right: '-22%',
                            top: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                        }}>
                            <Image
                                source={getAmerica250Logo(theme)}
                                style={{
                                    width: titleSize * 3.12,
                                    height: titleSize * 1.66,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>
                    </View>

                    {/* Body text - First Paragraph */}
                    <Text style={[styles.body, {
                        fontSize: bodySize,
                        color: colors.text,
                        marginTop: padding * 0.2,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: bodySize * 1.1
                    }]}>
                        {intro || 'Welcome to the world!'}
                    </Text>

                    {/* Second Paragraph - Prewritten Message (milestone mode only) */}
                    {isMilestoneMode && milestoneMessage ? (
                        <Text style={[styles.body, {
                            fontSize: bodySize,
                            color: colors.text,
                            marginTop: padding * 0.15,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            lineHeight: bodySize * 1.1
                        }]}>
                            {milestoneMessage}
                        </Text>
                    ) : null}

                    {/* Zodiac, Birthstone, and Life Path Info with Clickable Emojis - BABY MODE ONLY */}
                    {!isMilestoneMode && (
                        <View style={{ width: '100%', alignItems: 'center', marginTop: padding * 0.1 }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: bodySize, color: colors.text, marginRight: 4, fontWeight: 'bold' }}>
                                    {`${babyFirstOnly || namesForSentence}'s zodiac sign is ${zodiac}`}
                                </Text>
                                <ClickableEmoji
                                    emoji={zodiacEmoji}
                                    url={getZodiacLink(zodiac, dobISO)}
                                    tooltip="ABOUT YOUR SIGN AND HOROSCOPES"
                                    style={{ fontSize: bodySize, color: colors.text, marginRight: 4 }}
                                />
                                <Text style={{ fontSize: bodySize, color: colors.text, marginRight: 4, fontWeight: 'bold' }}>
                                    {'birthstone is ' + birthstone}
                                </Text>
                                <ClickableEmoji
                                    emoji={birthstoneEmoji}
                                    url={getBirthstoneLink(birthstone)}
                                    style={{ fontSize: bodySize, color: colors.text, marginRight: 4 }}
                                />
                                {lifePathNumber != null && lifePathNumber > 0 ? (
                                    <>
                                        <Text style={{ fontSize: bodySize, color: colors.text, marginRight: 4, fontWeight: 'bold' }}>
                                            {'and has a life path number of ' + lifePathNumber}
                                        </Text>
                                        <ClickableEmoji
                                            emoji="🎱"
                                            url={getLifePathLink(lifePathNumber)}
                                            style={{ fontSize: bodySize, color: colors.text }}
                                        />
                                    </>
                                ) : null}
                            </View>
                            <Text style={{ fontSize: bodySize, color: colors.text, marginTop: padding * 0.15, fontWeight: 'bold', textAlign: 'center' }}>
                                {`Here are some interesting facts surrounding ${babyFirstOnly || namesForSentence}'s birthday.`}
                            </Text>
                        </View>
                    )}

                    {/* Data rows with THEN and NOW columns */}
                    <View style={{ width: '100%', alignSelf: 'center', marginTop: padding * 1.6, paddingHorizontal: padding * 0.3 }}>
                        {/* Row with City, ST | Coordinates | Flag (over THEN) | Governor */}
                        <View style={[styles.row, {
                            paddingVertical: Math.round(displayHeight * 0.003),
                            borderBottomWidth: 1.5,
                            borderBottomColor: colors.border || '#FFFFFF',
                            backgroundColor: 'transparent'
                        }]}>
                            {/* City, ST + Coordinates on left - aligned with label column */}
                            <View style={{ width: '40%', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: labelSize * 0.85, color: colors.text, fontWeight: '700' }}>
                                    {toTitleCase(hometown)}
                                </Text>
                                {coordinates ? (
                                    <Text style={{ fontSize: labelSize * 0.7, color: colors.text, fontWeight: '700', marginLeft: 12 }}>
                                        {coordinates}
                                    </Text>
                                ) : null}
                            </View>
                            {/* Flag centered over THEN column (or where THEN would be for baby mode) */}
                            <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                                {stateCode ? (
                                    <Pressable
                                        onPress={() => {
                                            const url = getStateFlagLink(stateCode);
                                            if (url) Linking.openURL(url);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: getStateFlagImage(stateCode) || '' }}
                                            style={{
                                                width: labelSize * 3.75,
                                                height: labelSize * 2.55,
                                                resizeMode: 'contain'
                                            }}
                                        />
                                    </Pressable>
                                ) : null}
                            </View>
                            {/* Governor on far right - aligned with NOW column */}
                            <View style={{ width: '40%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={{ fontSize: labelSize, color: colors.text, fontWeight: '500' }}>
                                    Gov {currentGovernor}
                                </Text>
                            </View>
                        </View>

                        {/* Column Headers */}
                        <View style={[styles.row, {
                            paddingVertical: Math.round(displayHeight * 0.003),
                            borderBottomWidth: 1.2,
                            borderBottomColor: colors.border || '#FFFFFF',
                            backgroundColor: 'transparent'
                        }]}>
                            <Text style={[styles.label, { fontSize: labelSize * 0.9, color: colors.text, width: '40%', fontWeight: '900' }]}>
                                {/* Empty space for label column */}
                            </Text>
                            {mode !== 'baby' && (
                                <Text style={[styles.value, { fontSize: labelSize * 0.8, color: colors.text, width: '20%', textAlign: 'center', fontWeight: '900' }]}>
                                    THEN
                                </Text>
                            )}
                            {mode === 'baby' && (
                                <View style={{ width: '20%' }} />
                            )}
                            <Text style={[styles.value, { fontSize: labelSize * 0.8, color: colors.text, width: '40%', textAlign: 'right', fontWeight: '900' }]}>
                                NOW
                            </Text>
                        </View>

                        {rows.map(([label, thenValue, nowValue, emoji]) => {
                            const emojiUrl = getSnapshotEmojiLink(emoji);
                            // Extract the label text without emoji for display
                            const labelText = label.replace(/\s+[^\s]*$/g, '').trim();

                            // Extract Roman numerals for Super Bowl and World Series from THEN and NOW values
                            let thenRomanNumeral = '';
                            let nowRomanNumeral = '';
                            if (emoji === '🏈' || emoji === '⚾') {
                                // Extract Roman numeral from value like "Kansas City Chiefs (LVIII)"
                                const thenMatch = thenValue.match(/\(([IVXLCDM]+)\)/);
                                const nowMatch = nowValue.match(/\(([IVXLCDM]+)\)/);
                                if (thenMatch) thenRomanNumeral = thenMatch[1];
                                if (nowMatch) nowRomanNumeral = nowMatch[1];
                            }

                            return (
                                <View key={label} style={[styles.row, {
                                    paddingVertical: Math.round(displayHeight * 0.004),
                                    borderBottomWidth: 0.8,
                                    borderBottomColor: colors.border || '#FFFFFF'
                                }]}>
                                    <View style={[styles.label, { width: '40%', flexDirection: 'row', alignItems: 'center' }]}>
                                        <Text style={{ fontSize: labelSize, color: colors.text }}>
                                            {labelText}
                                        </Text>
                                        <ClickableEmoji
                                            emoji={emoji}
                                            url={emojiUrl}
                                            style={{ fontSize: labelSize, color: colors.text, marginLeft: 4 }}
                                        />
                                    </View>
                                    {mode !== 'baby' && (
                                        <Text
                                            style={[styles.value, {
                                                fontSize: valueSize,
                                                color: colors.text,
                                                width: '20%',
                                                textAlign: 'center'
                                            }]}
                                            numberOfLines={1}
                                        >
                                            {thenRomanNumeral ? `${thenRomanNumeral} ` : ''}{thenValue}
                                        </Text>
                                    )}
                                    {mode === 'baby' && (
                                        <View style={{ width: '20%' }} />
                                    )}
                                    <Text style={[styles.value, { fontSize: valueSize, color: colors.text, width: '40%', textAlign: 'right' }]} numberOfLines={1}>
                                        {nowRomanNumeral ? `${nowRomanNumeral} ` : ''}{nowValue}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Sources/info at the bottom, not centered */}
                <View style={{
                    width: '100%',
                    position: 'absolute',
                    bottom: padding * 2,
                    left: 0,
                    alignItems: 'center',
                }}>
                    <Text style={[styles.sources, {
                        fontSize: sourcesSize,
                        color: colors.text,
                        marginTop: padding * 0.2
                    }]}>
                        SOURCES: gasprices.aaa.com, bls.gov, kitco.com, marketwatch.com, census.gov, espn.com, billboard.com, themoviedb.org, usa.gov
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    border: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        // flex, justifyContent, alignItems set inline above
    },
    title: {
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 2,
    },
    body: {
        lineHeight: 16,
    },
    divider: {
        width: '100%',
        opacity: 0.9,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
        gap: 8,
    },
    label: {
        fontWeight: '800',
        paddingRight: 8,
    },
    value: {
        fontWeight: '800',
    },
    sources: {
        textAlign: 'center',
        opacity: 0.7,
        fontWeight: '400',
    },
});
