import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getChineseElement, getChineseZodiac } from '../src/data/utils/astrology-utils';
import { birthstoneFromISO } from '../src/data/utils/birthstone';
import { ZODIAC_EMOJIS } from '../src/data/utils/emoji-links';
import { calculateLifePath } from '../src/data/utils/life-path-calculator';
import { getMoonPhase } from '../src/data/utils/transit-calculator';
import { getZodiacFromISO } from '../src/data/utils/zodiac';
import TradingCardLogo from './TradingCardLogo';

const US_FLAG_IMAGE = require('../assets/images/us-flag.png');
const AMERICA250_WHITE = require('../assets/images/america250-white.png');

const ZODIAC_SPIRIT_ANIMAL: Record<string, { animal: string; emoji: string }> = {
    Aries: { animal: 'Hawk', emoji: '🦅' },
    Taurus: { animal: 'Bear', emoji: '🐻' },
    Gemini: { animal: 'Dolphin', emoji: '🐬' },
    Cancer: { animal: 'Wolf', emoji: '🐺' },
    Leo: { animal: 'Lion', emoji: '🦁' },
    Virgo: { animal: 'Fox', emoji: '🦊' },
    Libra: { animal: 'Swan', emoji: '🦢' },
    Scorpio: { animal: 'Phoenix', emoji: '🔥' },
    Sagittarius: { animal: 'Horse', emoji: '🐴' },
    Capricorn: { animal: 'Mountain Goat', emoji: '🐐' },
    Aquarius: { animal: 'Owl', emoji: '🦉' },
    Pisces: { animal: 'Seahorse', emoji: '🐡' },
};

const ZODIAC_ELEMENT: Record<string, string> = {
    Aries: 'Fire 🔥', Taurus: 'Earth 🌍', Gemini: 'Air 💨', Cancer: 'Water 💧',
    Leo: 'Fire 🔥', Virgo: 'Earth 🌍', Libra: 'Air 💨', Scorpio: 'Water 💧',
    Sagittarius: 'Fire 🔥', Capricorn: 'Earth 🌍', Aquarius: 'Air 💨', Pisces: 'Water 💧',
};

const TAROT_NAMES: { name: string; symbol: string }[] = [
    { name: 'The Fool', symbol: '🃏' }, { name: 'The Magician', symbol: '🎩' },
    { name: 'The High Priestess', symbol: '🌙' }, { name: 'The Empress', symbol: '👑' },
    { name: 'The Emperor', symbol: '🏛️' }, { name: 'The Hierophant', symbol: '📿' },
    { name: 'The Lovers', symbol: '💕' }, { name: 'The Chariot', symbol: '🏎️' },
    { name: 'Strength', symbol: '🦁' }, { name: 'The Hermit', symbol: '🏔️' },
    { name: 'Wheel of Fortune', symbol: '🎡' }, { name: 'Justice', symbol: '⚖️' },
    { name: 'The Hanged Man', symbol: '🙃' }, { name: 'Death', symbol: '🦋' },
    { name: 'Temperance', symbol: '⚗️' }, { name: 'The Devil', symbol: '⛓️' },
    { name: 'The Tower', symbol: '⚡' }, { name: 'The Star', symbol: '⭐' },
    { name: 'The Moon', symbol: '🌕' }, { name: 'The Sun', symbol: '☀️' },
    { name: 'Judgement', symbol: '📯' }, { name: 'The World', symbol: '🌍' },
];

function getTarotBirthCard(date: Date): { soul: typeof TAROT_NAMES[0]; personality: typeof TAROT_NAMES[0] | null } {
    const dateStr = `${date.getMonth() + 1}${date.getDate()}${date.getFullYear()}`;
    let sum = dateStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    while (sum > 21) {
        sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    const soul = TAROT_NAMES[sum] || TAROT_NAMES[0];
    let p = sum;
    while (p > 9 && p !== 11 && p !== 22) {
        p = p.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    if (p === 22) p = 0;
    const personality = p !== sum ? (TAROT_NAMES[p] || null) : null;
    return { soul, personality };
}

interface BaseballCardBackProps {
    fullName: string;
    lastName: string;
    dobISO: string;
    weightLb: string;
    weightOz: string;
    lengthIn: string;
    hometown: string;
    heritage?: string;
    nationality?: string;
    backgroundColor?: string;
    nameGold?: boolean;
    forceFullSize?: boolean;
    cardNumber?: number;
    editionSize?: number;
    previewWidth?: number;
}

export default function BaseballCardBack({
    fullName,
    lastName,
    dobISO,
    weightLb,
    weightOz,
    lengthIn,
    hometown,
    heritage = '',
    nationality = '',
    backgroundColor = '#000080',
    nameGold = false,
    forceFullSize = false,
    cardNumber = 1,
    editionSize,
    previewWidth,
}: BaseballCardBackProps) {
    const { width } = useWindowDimensions();

    // Standard trading card: 2.5" x 3.5" at 300 DPI = 750 x 1050 pixels
    // Hi-res multiplier for download: 3× → 2250 x 3150 pixels
    const baseDocWidth = 750;
    const baseDocHeight = 1050;
    const hiRes = forceFullSize ? 3 : 1;
    const fixedDocWidth = baseDocWidth * hiRes;
    const fixedDocHeight = baseDocHeight * hiRes;
    const scale = forceFullSize ? 1 : previewWidth ? (previewWidth / baseDocWidth) : Math.min((width * 0.65) / baseDocWidth, 1);
    const cardWidth = fixedDocWidth * scale;
    const cardHeight = fixedDocHeight * scale;

    // Proportional spacing — keeps preview & hi-res download visually identical
    const sp = (px: number) => cardWidth * (px / 750);

    // Extract lastName from fullName when not provided directly
    const resolvedLastName = lastName || fullName.trim().split(/\s+/).pop() || '';

    // Compute stats from DOB — parse directly from ISO string, no timezone-sensitive Date methods
    const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const _dobParts = dobISO ? dobISO.split('-').map(Number) : null;
    const _dobYear = _dobParts ? _dobParts[0] : new Date().getFullYear();
    const _dobMonth = _dobParts ? _dobParts[1] : new Date().getMonth() + 1;
    const _dobDay = _dobParts ? _dobParts[2] : new Date().getDate();
    const dobDate = new Date(_dobYear, _dobMonth - 1, _dobDay);
    const birthDateStr = `${MONTH_SHORT[_dobMonth - 1]} ${_dobDay}, ${_dobYear}`;
    const zodiac = getZodiacFromISO(dobISO);
    const birthstone = birthstoneFromISO(dobISO);
    const birthYear = dobDate.getFullYear();
    const moonPhaseData = getMoonPhase(dobDate);
    const chineseZodiac = getChineseZodiac(birthYear);
    const chineseElement = getChineseElement(birthYear);
    const spiritAnimal = zodiac ? ZODIAC_SPIRIT_ANIMAL[zodiac] : null;
    const westernElement = zodiac ? ZODIAC_ELEMENT[zodiac] : null;
    const lifePathResult = calculateLifePath(dobISO);
    const lifePathNumber = lifePathResult.number.toString();
    const zodiacEmoji = zodiac ? ZODIAC_EMOJIS[zodiac] || '' : '';
    const tarot = getTarotBirthCard(dobDate);

    // Scaled font sizes — everything proportional to card width
    const fs = {
        statLabel: cardWidth * 0.0273,   // ~7.6px at 280, ~20.5px at 750
        statValue: cardWidth * 0.0273,
        sectionHeader: cardWidth * 0.0311,
        profileHeader: cardWidth * 0.0296,
        cardNumber: cardWidth * 0.019,
        brand: cardWidth * 0.019,
        url: cardWidth * 0.02,
    };

    // Build QR code URL with card data encoded as params
    const qrParams = new URLSearchParams({
        n: fullName,
        d: dobISO,
        wl: weightLb,
        wo: weightOz || '',
        l: lengthIn,
        h: hometown,
        ...(heritage ? { hr: heritage } : {}),
        ...(nationality ? { nt: nationality } : {}),
    });
    const qrValue = `https://populationplusone.com/card?${qrParams.toString()}`;
    const qrSize = cardWidth * 0.1;

    // Format weight display
    const weightDisplay = weightLb
        ? (weightOz ? `${weightLb} lbs ${weightOz} oz` : `${weightLb} lbs`)
        : '';

    // Format height display
    const heightDisplay = lengthIn
        ? (lengthIn.includes("'") ? lengthIn : `${lengthIn}"`)
        : '';

    return (
        <View style={[styles.card, styles.cardBack, { width: cardWidth, height: cardHeight, borderRadius: sp(30) }]}>
            {/* Header */}
            <View style={[styles.backHeader, { backgroundColor, paddingVertical: cardWidth * 0.027, paddingHorizontal: cardWidth * 0.04 }]}>
                <View style={{ position: 'absolute', left: cardWidth * 0.04, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                    <Image source={US_FLAG_IMAGE} style={{ width: cardWidth * 0.084, height: cardWidth * 0.049, resizeMode: 'contain' }} />
                </View>
                <View style={{ position: 'absolute', right: cardWidth * 0.04, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                    <Image source={AMERICA250_WHITE} style={{ width: cardWidth * 0.084, height: cardWidth * 0.049, resizeMode: 'contain' }} />
                </View>
                <Text style={[styles.backName, { fontSize: cardWidth * 0.0421, letterSpacing: sp(3) }, nameGold && { color: '#FFD700', textShadowColor: '#B8860B', textShadowOffset: { width: sp(2), height: sp(2) }, textShadowRadius: sp(7) }]}>
                    {fullName}
                </Text>
                <Text style={[styles.backPosition, { fontSize: cardWidth * 0.0207 }]}>
                    Position: MAIN CHARACTER
                </Text>
            </View>

            <View style={[styles.statsTable, { paddingHorizontal: cardWidth * 0.04, paddingVertical: cardWidth * 0.02 }]}>
                <Text style={[styles.statsHeader, { fontSize: fs.sectionHeader, marginBottom: cardWidth * 0.013, letterSpacing: sp(3) }]}>
                    VITAL STATS
                </Text>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Debut Date</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{birthDateStr}</Text>
                </View>

                {weightDisplay ? (
                    <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                        <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Weight</Text>
                        <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{weightDisplay}</Text>
                    </View>
                ) : null}

                {heightDisplay ? (
                    <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                        <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Height</Text>
                        <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{heightDisplay}</Text>
                    </View>
                ) : null}

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Team</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{resolvedLastName} Family</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Hometown</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{hometown}</Text>
                </View>

                {heritage ? (
                    <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                        <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Heritage</Text>
                        <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{heritage}</Text>
                    </View>
                ) : null}
                {nationality ? (
                    <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                        <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Nationality</Text>
                        <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{nationality}</Text>
                    </View>
                ) : null}

                <Text style={[styles.statsHeader, { fontSize: fs.profileHeader, marginTop: cardWidth * 0.013, marginBottom: cardWidth * 0.013, letterSpacing: sp(3) }]}>
                    MAIN CHARACTER PROFILE
                </Text>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Zodiac</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{zodiacEmoji} {zodiac || 'Unknown'}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Birthstone</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{birthstone || 'Unknown'}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Moon Phase</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{moonPhaseData.emoji} {moonPhaseData.phase}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>🔢 Life Path #</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{lifePathNumber || '—'}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Spirit Animal</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{spiritAnimal ? `${spiritAnimal.emoji} ${spiritAnimal.animal}` : '—'}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Element</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{westernElement || '—'}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Chinese Zodiac</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{chineseElement} {chineseZodiac}</Text>
                </View>

                <View style={[styles.statRow, { paddingVertical: cardWidth * 0.008, borderBottomWidth: 0 }]}>
                    <Text style={[styles.statLabel, { fontSize: fs.statLabel }]}>Tarot Card</Text>
                    <Text style={[styles.statValue, { fontSize: fs.statValue }]}>{tarot.soul.symbol} {tarot.soul.name}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={[styles.backFooter, { paddingVertical: cardWidth * 0.02, paddingHorizontal: cardWidth * 0.033 }]}>
                <View style={[styles.footerLeft, { gap: cardWidth * 0.02 }]}>
                    <Text style={[styles.cardNumber, { fontSize: fs.cardNumber }]}>#{cardNumber}{editionSize ? `/${editionSize}` : ''}</Text>
                    <TradingCardLogo size={cardWidth * 0.067} bgColor={backgroundColor} />
                    <Text style={[styles.brand, { fontSize: fs.brand }]}>Population +1™</Text>
                </View>
                <View style={styles.qrContainer}>
                    <QRCode
                        value={qrValue}
                        size={qrSize}
                        backgroundColor="#f8f8f8"
                        color="#333"
                    />
                </View>
            </View>
            <Text style={[styles.url, { fontSize: fs.url, paddingBottom: cardWidth * 0.007 }]}>www.populationplusone.com</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    cardBack: {
        backgroundColor: '#f8f8f8',
    },
    backHeader: {
        alignItems: 'center',
    },
    backName: {
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    backPosition: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    statsTable: {
        flex: 1,
        justifyContent: 'center',
    },
    statsHeader: {
        fontWeight: '900',
        color: '#333',
        textAlign: 'center',
        letterSpacing: 1,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    statLabel: {
        fontWeight: '700',
        color: '#555',
    },
    statValue: {
        fontWeight: '600',
        color: '#222',
    },
    backFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardNumber: {
        color: '#999',
        fontWeight: '700',
    },
    brand: {
        color: '#999',
        fontWeight: '700',
    },
    url: {
        color: '#bbb',
        textAlign: 'center',
    },
});
