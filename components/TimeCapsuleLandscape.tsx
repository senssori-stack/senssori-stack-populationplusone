import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Image, Alert } from 'react-native';
import { COLOR_SCHEMES } from '../src/data/utils/colors';
import { formatSnapshotValue } from '../src/data/utils/formatSnapshot';
import { getSnapshotWithHistorical } from '../src/data/utils/historical-snapshot';
import { calculateLifePath } from '../src/data/utils/life-path-calculator';
import { extractStateFromHometown, getStateFlagImage } from '../src/data/utils/state-flags';
import { getBirthstoneLink, getZodiacLink, getLifePathLink, getSnapshotEmojiLink, getStateFlagLink, ZODIAC_EMOJIS, BIRTHSTONE_EMOJIS } from '../src/data/utils/emoji-links';
import { getMinimumWage, getFederalMinimumWage } from '../src/data/utils/minimum-wage';
import { getCurrentGovernor } from '../src/data/utils/current-governors';
import { CITY_COORDINATES, getCityCoordinatesAsync } from '../src/data/utils/town-coordinates';
import type { ThemeName } from '../src/types';

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

                    // Get birth year from dobISO
                    const birthYear = new Date(dobISO).getFullYear();
                    const currentYear = new Date().getFullYear();

                    console.log(`📍 Fetching city population for ${hometown}`);
                    console.log(`   Birth year: ${birthYear}, Current year: ${currentYear}`);

                    // Fetch historical (THEN) city population
                    const popThen = await getHistoricalPopulationForCity(hometown, birthYear);

                    // Fetch current (NOW) city population  
                    const popNow = await getHistoricalPopulationForCity(hometown, currentYear);

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
        // have a life path number of [number] [emoji] Here is some interesting information 
        // surrounding your birthday."
        parts.push(`${fullNamesForSentence} was born on ${formattedDate} in ${toTitleCase(hometown)} and is now ${age} years old`);

        let attributeText = `${babyFirstOnly}'s zodiac sign is ${zodiac} ${zodiacEmoji} their birthstone is ${birthstone} ${birthstoneEmoji}`;
        if (lifePathNumber) {
            attributeText += ` have a life path number of ${lifePathNumber} ${lifepathEmoji}`;
        }
        parts.push(attributeText);

        parts.push(`Here is some interesting information surrounding your birthday`);
    } else {
        // BABY ANNOUNCEMENT FORMAT (original):
        // NEW FORMAT: Full name turned [age] years old on [DOB]
        parts.push(`${namesForSentence} turned ${age} years old on ${formattedDate}`);

        // Zodiac sign with emoji
        parts.push(`${babyFirstOnly || namesForSentence}'s zodiac sign is ${zodiac} ${zodiacEmoji}`);

        // Life path number with emoji (if provided)
        if (lifePathNumber) {
            parts.push(`${babyFirstOnly || 'They'} has a life path number of ${lifePathNumber} ${lifepathEmoji}`);
        }

        // Birthstone with emoji
        parts.push(`Their birthstone is ${birthstone} ${birthstoneEmoji}`);

        // Add: "Below are some interesting facts surrounding your birthday"
        parts.push(`Below are some interesting facts surrounding your birthday`);

        // Keep existing content (parents, birth weight, location)
        parts.push(`${namesForSentence} was born in ${toTitleCase(hometown)}`);

        const parentParts: string[] = [];
        if (motherName && motherName.trim()) parentParts.push(motherName.trim());
        if (fatherName && fatherName.trim()) parentParts.push(fatherName.trim());
        if (parentParts.length > 0) {
            let parentText = `${babyFirstOnly || namesForSentence}'s parents are `;
            if (motherName && motherName.trim() && fatherName && fatherName.trim()) {
                parentText += `mother, ${motherName.trim()} and father, ${fatherName.trim()}`;
            } else if (motherName && motherName.trim()) {
                parentText += `mother, ${motherName.trim()}`;
            } else if (fatherName && fatherName.trim()) {
                parentText += `father, ${fatherName.trim()}`;
            }
            parts.push(parentText);
        }
        // "At birth [baby first name] weighed [weight] lbs and [weight ounces] oz and measured [length] inches."
        // Skip this line for twins/triplets if measurements aren't provided
        if (weightLb && weightOz && lengthIn && weightLb.trim() && weightOz.trim() && lengthIn.trim()) {
            parts.push(`At birth ${babyFirstOnly || namesForSentence} weighed ${weightLb} lbs and ${weightOz} oz and measured ${lengthIn} inches`);
        }
    }
    const validParts = parts.filter(part => part && typeof part === 'string' && part.trim().length > 0);
    const intro = validParts.join('. ').replace(/\.\s*\./g, '.').replace(/\s+\./g, '.');

    // Clean up the prewritten message for milestone mode - remove the "Here is some interesting information" part
    // since it's already in the first paragraph
    let milestoneMessage = '';
    if (isMilestoneMode && message) {
        milestoneMessage = message
            .replace(/\s*Here is some interesting information surrounding your birthday\.?\s*/gi, '')
            .trim();
    }

    // State for coordinates (fetched from Google Sheets)
    const [coordinates, setCoordinates] = useState<string>('');

    // Fetch coordinates from Google Sheets
    useEffect(() => {
        if (hometown && hometown.trim()) {
            getCityCoordinatesAsync(hometown).then(coords => {
                if (coords) {
                    setCoordinates(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
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
                    {/* Customer Name Header */}
                    {(motherName || fatherName) && (
                        <Text style={[styles.title, {
                            fontSize: titleSize * 0.7 * 1.4,
                            color: colors.text,
                            textAlign: 'center',
                            marginBottom: padding * 0.1,
                            fontWeight: '900'
                        }]}>
                            {[motherName, fatherName].filter(Boolean).join(' & ')}
                        </Text>
                    )}

                    {/* "Time Capsule" title */}
                    <Text style={[styles.title, { fontSize: timeCapsuleSize * 0.75 * 1.4, color: colors.text, marginTop: 0 }]}>
                        Time Capsule
                    </Text>

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
                                <Text style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 4 }}>
                                    {`${babyFirstOnly || namesForSentence}'s zodiac sign is `}
                                </Text>
                                <ClickableEmoji
                                    emoji="♈"
                                    url={getZodiacLink(zodiac, dobISO)}
                                    tooltip="ABOUT YOUR SIGN AND HOROSCOPES"
                                    style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 2 }}
                                />
                                <Text style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 4 }}>
                                    {zodiac}
                                </Text>
                                <Text style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 4 }}>
                                    {', their birthstone is '}
                                </Text>
                                <ClickableEmoji
                                    emoji="💎"
                                    url={getBirthstoneLink(birthstone)}
                                    style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 2 }}
                                />
                                <Text style={{ fontSize: bodySize * 0.8, color: colors.text }}>
                                    {birthstone}
                                </Text>
                                {lifePathNumber && (
                                    <>
                                        <Text style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 4 }}>
                                            {', and has a life path number of '}
                                        </Text>
                                        <ClickableEmoji
                                            emoji="🎱"
                                            url={getLifePathLink(lifePathNumber)}
                                            style={{ fontSize: bodySize * 0.8, color: colors.text, marginRight: 2 }}
                                        />
                                        <Text style={{ fontSize: bodySize * 0.8, color: colors.text }}>
                                            {lifePathNumber}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Data rows with THEN and NOW columns */}
                    <View style={{ width: '100%', alignSelf: 'center', marginTop: padding * 1.6, paddingHorizontal: padding * 0.3 }}>
                        {/* Row with City, ST | Coordinates | Flag | Governor */}
                        <View style={{
                            width: '100%',
                            paddingVertical: Math.round(displayHeight * 0.003),
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottomWidth: 1.5,
                            borderBottomColor: colors.border || '#FFFFFF'
                        }}>
                            {/* City, ST on far left */}
                            <View style={{ alignItems: 'flex-start', width: '25%' }}>
                                <Text style={{ fontSize: labelSize * 0.85, color: colors.text, fontWeight: '700' }}>
                                    {toTitleCase(hometown)}
                                </Text>
                            </View>
                            {/* Coordinates between city and flag */}
                            <View style={{ alignItems: 'center', width: '20%' }}>
                                {coordinates ? (
                                    <Text style={{ fontSize: labelSize * 0.65, color: colors.text, opacity: 0.8 }}>
                                        {coordinates}
                                    </Text>
                                ) : null}
                            </View>
                            {/* Flag in center */}
                            <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                                {stateCode && (
                                    <Pressable
                                        onPress={() => {
                                            const url = getStateFlagLink(stateCode);
                                            if (url) Linking.openURL(url);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: getStateFlagImage(stateCode) || '' }}
                                            style={{
                                                width: labelSize * 2.5,
                                                height: labelSize * 1.7,
                                                resizeMode: 'contain'
                                            }}
                                        />
                                    </Pressable>
                                )}
                            </View>
                            {/* Governor on far right */}
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
                            <Text style={[styles.value, { fontSize: labelSize * 0.8, color: colors.text, width: '20%', textAlign: 'center', fontWeight: '900' }]}>
                                THEN
                            </Text>
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

                            // Shrink font for rows with long text (like #1 Song)
                            const isSongRow = emoji === '🎵';
                            const maxTextLength = Math.max(thenValue.length, nowValue.length);
                            let rowValueSize = valueSize;
                            if (isSongRow || maxTextLength > 30) {
                                rowValueSize = valueSize * 0.7;
                            } else if (maxTextLength > 25) {
                                rowValueSize = valueSize * 0.85;
                            }

                            return (
                                <View key={label} style={[styles.row, {
                                    paddingVertical: Math.round(displayHeight * 0.004),
                                    borderBottomWidth: 0.8,
                                    borderBottomColor: colors.border || '#FFFFFF'
                                }]}>
                                    <View style={[styles.label, { fontSize: labelSize, color: colors.text, width: '40%', flexDirection: 'row', alignItems: 'center' }]}>
                                        <Text style={{ fontSize: labelSize, color: colors.text }}>
                                            {labelText}
                                        </Text>
                                        <ClickableEmoji
                                            emoji={emoji}
                                            url={emojiUrl}
                                            style={{ fontSize: labelSize, color: colors.text, marginLeft: 4 }}
                                        />
                                    </View>
                                    <Text style={[styles.value, { fontSize: rowValueSize, color: colors.text, width: '20%', textAlign: 'center' }]} numberOfLines={1} adjustsFontSizeToFit>
                                        {thenRomanNumeral ? `${thenRomanNumeral} ` : ''}{thenValue}
                                    </Text>
                                    <Text style={[styles.value, { fontSize: rowValueSize, color: colors.text, width: '40%', textAlign: 'right' }]} numberOfLines={1} adjustsFontSizeToFit>
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
                        SOURCES: bls.gov, eia.gov, fred.stlouisfed.org, census.gov, archives.gov, billboard.com, wikipedia.org
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
