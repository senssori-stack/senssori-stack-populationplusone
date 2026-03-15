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
    const fixedDocWidth = 750;
    const fixedDocHeight = 1050;
    const scale = forceFullSize ? 1 : previewWidth ? (previewWidth / fixedDocWidth) : Math.min((width * 0.65) / fixedDocWidth, 1);
    const cardWidth = fixedDocWidth * scale;
    const cardHeight = fixedDocHeight * scale;

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

    return (
        <View style={[styles.card, styles.cardBack, { width: cardWidth, height: cardHeight }]}>
            {/* Header */}
            <View style={[styles.backHeader, { backgroundColor }]}>
                <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                    <Image source={US_FLAG_IMAGE} style={{ width: cardWidth * 0.084, height: cardWidth * 0.049, resizeMode: 'contain' }} />
                </View>
                <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
                    <Image source={AMERICA250_WHITE} style={{ width: cardWidth * 0.084, height: cardWidth * 0.049, resizeMode: 'contain' }} />
                </View>
                <Text style={[styles.backName, { fontSize: cardWidth * 0.0421 }, nameGold && { color: '#FFD700', textShadowColor: '#B8860B', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                    {fullName}
                </Text>
                <Text style={[styles.backPosition, { fontSize: cardWidth * 0.0207 }]}>
                    Position: MAIN CHARACTER
                </Text>
            </View>

            <View style={styles.statsTable}>
                <Text style={[styles.statsHeader, { fontSize: cardWidth * 0.0311 }]}>
                    VITAL STATS
                </Text>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Debut Date</Text>
                    <Text style={styles.statValue}>{birthDateStr}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Weight</Text>
                    <Text style={styles.statValue}>{weightOz ? `${weightLb} lbs ${weightOz} oz` : `${weightLb} lbs`}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Height</Text>
                    <Text style={styles.statValue}>{lengthIn.includes("'") ? lengthIn : `${lengthIn}"`}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Team</Text>
                    <Text style={styles.statValue}>{lastName || 'TBD'}  Family</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Hometown</Text>
                    <Text style={styles.statValue}>{hometown}</Text>
                </View>

                {heritage ? (
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Heritage</Text>
                        <Text style={styles.statValue}>{heritage}</Text>
                    </View>
                ) : null}
                {nationality ? (
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Nationality</Text>
                        <Text style={styles.statValue}>{nationality}</Text>
                    </View>
                ) : null}

                <Text style={[styles.statsHeader, { fontSize: cardWidth * 0.0296, marginTop: 3 }]}>
                    MAIN CHARACTER PROFILE
                </Text>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Zodiac</Text>
                    <Text style={styles.statValue}>{zodiacEmoji} {zodiac || 'Unknown'}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Birthstone</Text>
                    <Text style={styles.statValue}>{birthstone || 'Unknown'}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Moon Phase</Text>
                    <Text style={styles.statValue}>{moonPhaseData.emoji} {moonPhaseData.phase}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🔢 Life Path #</Text>
                    <Text style={styles.statValue}>{lifePathNumber || '—'}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Spirit Animal</Text>
                    <Text style={styles.statValue}>{spiritAnimal ? `${spiritAnimal.emoji} ${spiritAnimal.animal}` : '—'}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Element</Text>
                    <Text style={styles.statValue}>{westernElement || '—'}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Chinese Zodiac</Text>
                    <Text style={styles.statValue}>{chineseElement} {chineseZodiac}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Tarot Card</Text>
                    <Text style={styles.statValue}>{tarot.soul.symbol} {tarot.soul.name}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.backFooter}>
                <View style={styles.footerLeft}>
                    <Text style={styles.cardNumber}>#{cardNumber}{editionSize ? `/${editionSize}` : ''}</Text>
                    <TradingCardLogo size={cardWidth * 0.067} bgColor={backgroundColor} />
                    <Text style={styles.brand}>Population +1™</Text>
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
            <Text style={styles.url}>www.populationplusone.com</Text>
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
        paddingVertical: 8,
        paddingHorizontal: 12,
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
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statsHeader: {
        fontWeight: '900',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: 1,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
    },
    statLabel: {
        fontWeight: '700',
        color: '#555',
        fontSize: 8.5,
    },
    statValue: {
        fontWeight: '600',
        color: '#222',
        fontSize: 8.5,
    },
    backFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardNumber: {
        fontSize: 5.7,
        color: '#999',
        fontWeight: '700',
    },
    brand: {
        fontSize: 5.7,
        color: '#999',
        fontWeight: '700',
    },
    url: {
        fontSize: 5.9,
        color: '#bbb',
        textAlign: 'center',
        paddingBottom: 2,
    },
});
