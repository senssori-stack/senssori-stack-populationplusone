import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, G, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LifeEventsTiming'>;

interface LifeEvent {
    emoji: string;
    title: string;
    house: string;
    rulers: string;
    overview: string;
    bestConditions: string[];
    avoid: string[];
    bestDay: string;
    bestMoon: string;
    bestSign: string;
    proTip: string;
}

const LIFE_EVENTS: LifeEvent[] = [
    {
        emoji: '💒',
        title: 'Wedding / Engagement',
        house: '7th House',
        rulers: 'Venus, Moon',
        overview: 'The 7th House governs partnerships and marriage. Venus — the planet of love, beauty, and harmony — is the key player. The chart cast at the moment you say "I do" becomes the birth chart of your marriage.',
        bestConditions: [
            'Venus direct and in a strong sign (Taurus, Libra, Pisces)',
            'Waxing Moon — your union grows with the light',
            'Benefic planets (Venus, Jupiter) in the 7th House',
            'Taurus or Libra rising for a Venus-ruled ceremony',
            'Moon making trines or sextiles, not squares',
        ],
        avoid: [
            'Venus retrograde — highest risk for weddings',
            'Mercury retrograde — vow mix-ups, travel delays, contract issues',
            'Mars retrograde — low passion, frustration, conflict',
            'Void-of-course Moon — nothing comes of the event',
            'Malefic planets (Mars, Saturn) on the Ascendant or Descendant',
        ],
        bestDay: 'Friday — Venus\'s day (named for Freya/Aphrodite)',
        bestMoon: 'Waxing crescent through full — growing love',
        bestSign: 'Taurus or Libra rising, Moon in Cancer or Pisces',
        proTip: 'The exact ceremony time matters — even a 30-minute shift can change the rising sign. Work with an astrologer to fine-tune the moment.',
    },
    {
        emoji: '🏠',
        title: 'Buying a Home / Signing a Lease',
        house: '4th House',
        rulers: 'Moon, Saturn',
        overview: 'The 4th House rules home, family, and foundations. The Moon governs domestic life while Saturn provides structure and longevity. A strong 4th House means your home will be a sanctuary.',
        bestConditions: [
            'Moon in a fixed sign (Taurus, Leo, Scorpio, Aquarius) for stability',
            'Saturn well-placed and not retrograde — lasting foundations',
            'Mercury direct — clear contracts and paperwork',
            'Jupiter aspecting the 4th House — space and abundance',
            'Waxing Moon for a growing household',
        ],
        avoid: [
            'Mercury retrograde — hidden defects in contracts, miscommunication with agents',
            'Saturn retrograde — structural problems, delays in closing',
            'Mars in the 4th — conflicts in the home, repairs needed',
            'Void-of-course Moon — the deal may fall through',
            'Eclipses on the IC/MC axis — destabilizing energy',
        ],
        bestDay: 'Monday — the Moon\'s day, ruler of home and family',
        bestMoon: 'Waxing Moon in Taurus or Cancer',
        bestSign: 'Cancer rising — the Moon rules, bringing nurturing home energy',
        proTip: 'Sign the final documents (not just the offer) during favorable conditions. The closing signature is the "birth moment" of your homeownership.',
    },
    {
        emoji: '💼',
        title: 'Starting a Business / New Job',
        house: '10th House',
        rulers: 'Sun, Saturn, Jupiter',
        overview: 'The 10th House (Midheaven) rules career, public reputation, and life direction. The Sun gives visibility, Saturn gives structure, and Jupiter brings growth and opportunity.',
        bestConditions: [
            'Sun or Jupiter conjunct the Midheaven — public success',
            'Mercury direct — clear communication, good first impressions',
            'Waxing Moon — momentum and growth from day one',
            'Benefic planets in the 10th or 1st House',
            'No planets retrograde in key positions',
        ],
        avoid: [
            'Mercury retrograde — emails lost, misunderstandings with new boss/clients',
            'Saturn retrograde — delays, extra red tape, blocked progress',
            'Mars retrograde — low energy, stalled projects',
            'Void-of-course Moon — your launch goes unnoticed',
            'Malefic planets on the Midheaven — obstacles to reputation',
        ],
        bestDay: 'Tuesday (Mars — ambition), Thursday (Jupiter — growth), or Sunday (Sun — visibility)',
        bestMoon: 'Waxing Moon in a cardinal sign (Aries, Cancer, Libra, Capricorn)',
        bestSign: 'Capricorn or Leo rising for authority and presence',
        proTip: 'Your first day, first email, or first transaction sets the chart. If you can\'t control the start date, control the first action you take that day.',
    },
    {
        emoji: '👶',
        title: 'Trying to Conceive',
        house: '5th House',
        rulers: 'Venus, Moon, Jupiter',
        overview: 'The 5th House governs children, creativity, and joy. Jupiter brings fertility and abundance, Venus adds love, and the Moon rules the body\'s cycles. Water signs are especially fertile.',
        bestConditions: [
            'Jupiter or Venus in the 5th House of children',
            'Waxing Moon — fertility energy is building',
            'Moon in a water sign (Cancer, Scorpio, Pisces) — nurturing and fertile',
            'Venus well-aspected — love and connection during conception',
            'No malefics afflicting the 5th House ruler',
        ],
        avoid: [
            'Saturn in the 5th — delays or difficulty conceiving',
            'Mars square or opposite Moon — physical stress',
            'Mercury retrograde — while not directly related, adds stress to timing',
            'Eclipses in the 5th/11th axis — unpredictable outcomes',
            'Moon in barren signs (Aries, Gemini, Leo, Virgo) — traditionally less fertile',
        ],
        bestDay: 'Friday (Venus) or Monday (Moon)',
        bestMoon: 'Waxing Moon in Cancer, Scorpio, or Pisces',
        bestSign: 'Cancer or Pisces rising — water energy supports fertility',
        proTip: 'The Jonas Method uses the Moon\'s return to its natal position as the most fertile moment each month — track your personal lunar cycle.',
    },
    {
        emoji: '✈️',
        title: 'Major Travel / Moving Abroad',
        house: '9th House',
        rulers: 'Jupiter, Mercury',
        overview: 'The 9th House rules long-distance travel, foreign lands, and expanding horizons. Jupiter provides protection and adventure, while Mercury manages the logistics — tickets, schedules, and directions.',
        bestConditions: [
            'Mercury and Jupiter both direct — smooth logistics and good fortune',
            'Mutable signs active (Gemini, Virgo, Sagittarius, Pisces) — flexible, adaptable energy',
            'Jupiter in the 9th or 1st House — protection while abroad',
            'Waxing Moon — journey expands and unfolds well',
            'No harsh aspects to the 3rd House ruler (short travel)',
        ],
        avoid: [
            'Mercury retrograde — lost luggage, missed flights, wrong directions',
            'Mars retrograde — accidents, road rage, mechanical breakdowns',
            'Saturn squaring the 9th — travel restrictions, visa problems',
            'Void-of-course Moon — the trip doesn\'t achieve its purpose',
            'Eclipses in the 3rd/9th axis — travel disruptions',
        ],
        bestDay: 'Wednesday (Mercury — logistics) or Thursday (Jupiter — adventure)',
        bestMoon: 'Waxing Moon in Sagittarius or Gemini',
        bestSign: 'Sagittarius rising — born to explore',
        proTip: 'The departure time sets the chart for the entire trip. If you can choose when to leave, pick a favorable departure window even if the flight is booked on a less ideal day.',
    },
    {
        emoji: '📝',
        title: 'Signing Contracts / Legal Matters',
        house: '7th & 9th House',
        rulers: 'Mercury, Jupiter',
        overview: 'Contracts fall under the 7th House (agreements between parties) and 9th House (the law and justice). Mercury governs the written word, while Jupiter rules the courts and fairness.',
        bestConditions: [
            'Mercury direct and well-aspected — clear terms, no hidden clauses',
            'Jupiter in the 9th House — justice and favorable legal outcomes',
            'Moon applying to beneficial aspects — events unfold as planned',
            'No planets retrograde in the 7th — the other party is straightforward',
            'Fixed signs prominent — the agreement holds',
        ],
        avoid: [
            'Mercury retrograde — the #1 rule: never sign contracts during Mercury Rx',
            'Neptune aspects to Mercury — deception, unclear terms, fine print traps',
            'Void-of-course Moon — the contract leads nowhere',
            'Mars in the 7th — the other party is combative',
            'Saturn retrograde — delayed outcomes, renegotiation later',
        ],
        bestDay: 'Wednesday (Mercury) or Thursday (Jupiter for legal)',
        bestMoon: 'Waxing Moon in a fixed sign (Taurus, Leo, Scorpio, Aquarius)',
        bestSign: 'Libra rising — the scales of justice and fair agreements',
        proTip: 'The moment of your signature (not the other party\'s) is what sets your chart for the contract. Have your pen hit the paper during the best window.',
    },
    {
        emoji: '🎓',
        title: 'Starting School / Taking Exams',
        house: '3rd & 9th House',
        rulers: 'Mercury',
        overview: 'The 3rd House governs communication, learning, and early education, while the 9th House rules higher education and philosophy. Mercury — planet of the mind — is the absolute ruler here.',
        bestConditions: [
            'Mercury in Gemini or Virgo — peak intellectual power',
            'Mercury direct and making favorable aspects',
            'Air signs prominent (Gemini, Libra, Aquarius) — mental clarity',
            'Jupiter in the 9th — expansion of knowledge, fortunate scholastic outcomes',
            'Waxing Moon — absorb and retain information',
        ],
        avoid: [
            'Mercury retrograde — brain fog, test errors, applications lost',
            'Neptune square Mercury — confusion, difficulty concentrating',
            'Mars in the 3rd — mental restlessness, arguments with classmates',
            'Void-of-course Moon — studying doesn\'t stick',
            'Saturn squaring Mercury — mental blocks, test anxiety',
        ],
        bestDay: 'Wednesday — Mercury\'s day, ruled by the intellect',
        bestMoon: 'Waxing Moon in Gemini or Virgo',
        bestSign: 'Gemini or Virgo rising, Mercury angular',
        proTip: 'For exams, the moment you turn over the test paper is the chart. Arrive early and start exactly when the cosmic window opens.',
    },
    {
        emoji: '💰',
        title: 'Financial Investments / Major Purchases',
        house: '2nd & 8th House',
        rulers: 'Venus, Jupiter, Pluto',
        overview: 'The 2nd House rules personal finances and what you own, while the 8th House governs shared resources, investments, and other people\'s money. Venus attracts wealth, Jupiter expands it, and Pluto transforms it.',
        bestConditions: [
            'Venus or Jupiter in the 2nd House — attracting and growing wealth',
            'Taurus energy prominent — stabilizes finances',
            'Jupiter making positive aspects — growth and good returns',
            'Waxing Moon — your investment grows',
            'No afflictions to the 8th House ruler — no hidden losses',
        ],
        avoid: [
            'Mars opposite Pluto — risky bets, power struggles over money',
            'Mercury retrograde — miscalculations, hidden fees, wrong account numbers',
            'Venus retrograde — overpaying, buyer\'s remorse, bad valuations',
            'Neptune in the 2nd — financial delusions, scams, unclear terms',
            'Uranus square the 2nd ruler — sudden unexpected losses',
        ],
        bestDay: 'Thursday (Jupiter — growth and prosperity) or Friday (Venus — value)',
        bestMoon: 'Waxing Moon in Taurus or Capricorn',
        bestSign: 'Taurus rising — Venus attracts abundance',
        proTip: 'The moment you click "buy" or sign the investment paperwork sets the chart. Wait for your optimal window, even if it means delaying by a day.',
    },
    {
        emoji: '🏥',
        title: 'Elective Surgery / Medical Procedures',
        house: '6th House',
        rulers: 'Mars, Moon',
        overview: 'The 6th House rules health and daily routines. Mars governs the surgeon\'s knife, and the Moon rules the body\'s fluids and healing response. Timing surgery correctly can improve recovery.',
        bestConditions: [
            'Mars direct — clean, precise cuts and procedures',
            'Waning Moon — reduces swelling, bleeding, and fluid retention',
            'Moon NOT in the sign ruling the affected body part',
            'No malefic aspects to the 6th House ruler',
            'Jupiter aspecting the Ascendant — protection and favorable outcomes',
        ],
        avoid: [
            'Moon in the sign of the body part being operated on (Leo = heart, Virgo = intestines, etc.)',
            'Mars retrograde — surgical complications, need for re-operation',
            'Full Moon — maximum fluid retention, more bleeding',
            'Mercury retrograde — miscommunication with medical team, wrong dosages',
            'Void-of-course Moon — the procedure may not achieve its purpose',
        ],
        bestDay: 'Saturday (Saturn — discipline, precision) or Tuesday (Mars — surgical skill)',
        bestMoon: 'Waning Moon, 3-7 days after Full Moon',
        bestSign: 'Virgo rising — health-focused, detail-oriented',
        proTip: 'If you can request a specific time slot, the first surgery of the day tends to have the best energy and the most alert surgical team.',
    },
    {
        emoji: '🚀',
        title: 'Launching a Project / App / Product',
        house: '1st & 10th House',
        rulers: 'Sun, Mercury, Jupiter',
        overview: 'A launch is a birth — the chart of that moment becomes the product\'s natal chart forever. The 1st House gives it identity, the 10th gives it public visibility, and Mercury ensures the message lands.',
        bestConditions: [
            'Strong Ascendant — the product makes a powerful first impression',
            'Mercury direct — marketing messages are clear and received',
            'Jupiter in the 10th or 1st — massive reach and positive reception',
            'Waxing Moon — momentum builds from launch day',
            'Sun well-placed — visibility and vitality',
        ],
        avoid: [
            'Mercury retrograde — messaging falls flat, bugs appear, PR misfires',
            'Venus retrograde — people don\'t connect with the product emotionally',
            'Mars retrograde — low energy, stalled momentum',
            'Void-of-course Moon — launch goes unnoticed',
            'Multiple retrograde planets — too much energy is turned inward',
        ],
        bestDay: 'Sunday (Sun — maximum visibility) or Thursday (Jupiter — reach)',
        bestMoon: 'Waxing Moon in a fire sign (Aries, Leo, Sagittarius)',
        bestSign: 'Leo or Aries rising for boldness and audience attention',
        proTip: 'Press "publish" or "go live" at the exact planned moment. Even sending the announcement email counts — the first public action sets the chart.',
    },
];

/** Extract house numbers from a string like '7th House' or '1st & 10th House' */
function parseHouseNumbers(houseStr: string): number[] {
    const matches = houseStr.match(/(\d+)/g);
    return matches ? matches.map(Number) : [];
}

/** Mini house wheel — 150px circle with 12 numbered slices, active houses glow gold */
function MiniHouseWheel({ activeHouses, rulers }: { activeHouses: number[]; rulers: string }) {
    const size = 150;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 65;
    const innerR = 24;
    const labelR = 46;

    return (
        <View style={miniStyles.container}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <Circle cx={cx} cy={cy} r={outerR} fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                <Circle cx={cx} cy={cy} r={innerR} fill="rgba(156,39,176,0.15)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />

                {/* 12 house slices */}
                {Array.from({ length: 12 }, (_, i) => {
                    const houseNum = i + 1;
                    const isActive = activeHouses.includes(houseNum);
                    // Houses go counter-clockwise from ASC (left = house 1)
                    // Each house = 30° slice
                    const startAngle = 180 - (houseNum * 30);
                    const endAngle = startAngle + 30;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const midRad = ((startAngle + 15) * Math.PI) / 180;

                    // Divider line
                    const x1 = cx + innerR * Math.cos(startRad);
                    const y1 = cy - innerR * Math.sin(startRad);
                    const x2 = cx + outerR * Math.cos(startRad);
                    const y2 = cy - outerR * Math.sin(startRad);

                    // Label position
                    const lx = cx + labelR * Math.cos(midRad);
                    const ly = cy - labelR * Math.sin(midRad);

                    // Active house glow wedge
                    const wedgeX1 = cx + innerR * Math.cos(startRad);
                    const wedgeY1 = cy - innerR * Math.sin(startRad);
                    const wedgeX2 = cx + outerR * Math.cos(startRad);
                    const wedgeY2 = cy - outerR * Math.sin(startRad);
                    const wedgeX3 = cx + outerR * Math.cos(endRad);
                    const wedgeY3 = cy - outerR * Math.sin(endRad);
                    const wedgeX4 = cx + innerR * Math.cos(endRad);
                    const wedgeY4 = cy - innerR * Math.sin(endRad);

                    return (
                        <G key={houseNum}>
                            {isActive && (
                                <Path
                                    d={`M${wedgeX1},${wedgeY1} A${innerR},${innerR} 0 0,1 ${wedgeX4},${wedgeY4} L${wedgeX3},${wedgeY3} A${outerR},${outerR} 0 0,0 ${wedgeX2},${wedgeY2} Z`}
                                    fill="rgba(255,215,0,0.25)"
                                    stroke="rgba(255,215,0,0.6)"
                                    strokeWidth={1}
                                />
                            )}
                            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
                            <SvgText
                                x={lx}
                                y={ly + 4}
                                fill={isActive ? '#FFD700' : 'rgba(255,255,255,0.35)'}
                                fontSize={isActive ? 11 : 9}
                                fontWeight={isActive ? '800' : '400'}
                                textAnchor="middle"
                            >
                                {houseNum}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Center label */}
                <SvgText x={cx} y={cy + 1} fill="rgba(255,255,255,0.5)" fontSize={7} fontWeight="600" textAnchor="middle">HOUSES</SvgText>

                {/* ASC marker */}
                <SvgText x={cx - outerR - 4} y={cy + 4} fill="#4CAF50" fontSize={7} fontWeight="700" textAnchor="end">ASC</SvgText>
            </Svg>
            <Text style={miniStyles.rulerText}>Ruled by {rulers}</Text>
        </View>
    );
}

const miniStyles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 12 },
    rulerText: { fontSize: 11, color: 'rgba(255,215,0,0.7)', fontWeight: '600', marginTop: 4 },
});

const ZODIAC_BODY_MAP = [
    { sign: 'Aries ♈', body: 'Head, face, brain', color: '#F44336' },
    { sign: 'Taurus ♉', body: 'Throat, neck, thyroid', color: '#4CAF50' },
    { sign: 'Gemini ♊', body: 'Arms, hands, lungs', color: '#FFC107' },
    { sign: 'Cancer ♋', body: 'Chest, stomach, breasts', color: '#9E9E9E' },
    { sign: 'Leo ♌', body: 'Heart, spine, upper back', color: '#FF9800' },
    { sign: 'Virgo ♍', body: 'Intestines, digestive system', color: '#8BC34A' },
    { sign: 'Libra ♎', body: 'Kidneys, lower back, skin', color: '#E91E63' },
    { sign: 'Scorpio ♏', body: 'Reproductive organs, bladder', color: '#9C27B0' },
    { sign: 'Sagittarius ♐', body: 'Hips, thighs, liver', color: '#3F51B5' },
    { sign: 'Capricorn ♑', body: 'Knees, bones, joints, teeth', color: '#607D8B' },
    { sign: 'Aquarius ♒', body: 'Ankles, calves, circulation', color: '#00BCD4' },
    { sign: 'Pisces ♓', body: 'Feet, lymphatic system', color: '#7C4DFF' },
];

export default function LifeEventsTimingScreen({ route }: Props) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <LinearGradient colors={['#0a0a2e', '#1a1a4e', '#1b2838']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a2e" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>📋</Text>
                    <Text style={styles.mainTitle}>Life Events{'\n'}Timed by the Stars</Text>
                    <Text style={styles.subtitle}>
                        Electional astrology — the art of choosing the best moment for life's biggest milestones. Tap any event for a full cosmic breakdown.
                    </Text>
                </View>

                {/* What Is Electional Astrology */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏛️ What Is Electional Astrology?</Text>
                    <Text style={styles.cardText}>
                        Every event has a birth chart — the moment something begins shapes its entire trajectory. Electional astrology analyzes planetary positions to find the optimal window for action.
                    </Text>
                    <Text style={styles.cardText}>
                        Think of it as choosing the best soil, season, and weather conditions before planting a seed. The seed is your intention — the sky is the garden.
                    </Text>
                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>☽</Text>
                        <Text style={styles.ruleText}><Text style={styles.bold}>Moon phase</Text> — Waxing for growth, waning for release</Text>
                    </View>
                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>↻</Text>
                        <Text style={styles.ruleText}><Text style={styles.bold}>Retrogrades</Text> — Key planet must be moving forward</Text>
                    </View>
                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>⬡</Text>
                        <Text style={styles.ruleText}><Text style={styles.bold}>House ruler</Text> — The planet that rules the relevant house should be strong</Text>
                    </View>
                    <View style={styles.ruleRow}>
                        <Text style={styles.ruleNum}>△</Text>
                        <Text style={styles.ruleText}><Text style={styles.bold}>Aspects</Text> — Trines and sextiles = flow; squares and oppositions = friction</Text>
                    </View>
                    <View style={styles.personalizeNote}>
                        <Text style={styles.personalizeNoteText}>🌟 These are universal electional guidelines. For personalized detection based on YOUR birth chart, spin the natal chart wheel in Full Natal Chart — it analyzes your unique house placements and lights up when Prime Time windows are active for you.</Text>
                    </View>
                </View>

                {/* Life Events */}
                {LIFE_EVENTS.map((event, idx) => {
                    const isExpanded = expandedIdx === idx;
                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.eventCard, isExpanded && styles.eventCardExpanded]}
                            onPress={() => setExpandedIdx(isExpanded ? null : idx)}
                            activeOpacity={0.8}
                        >
                            {/* Header row */}
                            <View style={styles.eventHeader}>
                                <Text style={styles.eventEmoji}>{event.emoji}</Text>
                                <View style={styles.eventHeaderText}>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventHouse}>{event.house} — {event.rulers}</Text>
                                </View>
                                <Text style={styles.expandArrow}>{isExpanded ? '▼' : '▶'}</Text>
                            </View>

                            {/* Overview always visible */}
                            <Text style={styles.eventOverview}>{event.overview}</Text>

                            {/* Expanded content */}
                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    {/* Best Conditions */}
                                    <Text style={styles.sectionLabel}>✅ Best Conditions</Text>
                                    {event.bestConditions.map((c, i) => (
                                        <View key={i} style={styles.bulletRow}>
                                            <Text style={styles.bulletGood}>•</Text>
                                            <Text style={styles.bulletText}>{c}</Text>
                                        </View>
                                    ))}

                                    {/* Avoid */}
                                    <Text style={[styles.sectionLabel, { color: '#F44336' }]}>🚫 Avoid</Text>
                                    {event.avoid.map((a, i) => (
                                        <View key={i} style={styles.bulletRow}>
                                            <Text style={styles.bulletBad}>•</Text>
                                            <Text style={styles.bulletText}>{a}</Text>
                                        </View>
                                    ))}

                                    {/* Quick Reference */}
                                    <View style={styles.quickRef}>
                                        <View style={styles.quickRefRow}>
                                            <Text style={styles.quickRefLabel}>📅 Best Day:</Text>
                                            <Text style={styles.quickRefValue}>{event.bestDay}</Text>
                                        </View>
                                        <View style={styles.quickRefRow}>
                                            <Text style={styles.quickRefLabel}>🌙 Best Moon:</Text>
                                            <Text style={styles.quickRefValue}>{event.bestMoon}</Text>
                                        </View>
                                        <View style={styles.quickRefRow}>
                                            <Text style={styles.quickRefLabel}>⭐ Best Sign:</Text>
                                            <Text style={styles.quickRefValue}>{event.bestSign}</Text>
                                        </View>
                                    </View>

                                    {/* Pro Tip */}
                                    <View style={styles.proTip}>
                                        <Text style={styles.proTipLabel}>💡 Pro Tip</Text>
                                        <Text style={styles.proTipText}>{event.proTip}</Text>
                                    </View>

                                    {/* Mini House Wheel */}
                                    <MiniHouseWheel activeHouses={parseHouseNumbers(event.house)} rulers={event.rulers} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Zodiac Body Map for Surgery */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏥 Moon Sign &amp; Body Part Map</Text>
                    <Text style={styles.cardText}>
                        For elective surgery, avoid scheduling when the Moon is in the sign that rules the body part being treated:
                    </Text>
                    {ZODIAC_BODY_MAP.map((item, i) => (
                        <View key={i} style={styles.bodyMapRow}>
                            <Text style={[styles.bodyMapSign, { color: item.color }]}>{item.sign}</Text>
                            <Text style={styles.bodyMapBody}>{item.body}</Text>
                        </View>
                    ))}
                </View>

                {/* Day of the Week Guide */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📅 Planetary Day of the Week</Text>
                    <Text style={styles.cardText}>
                        Each day is ruled by a planet — choose the day that matches your event's energy:
                    </Text>
                    {[
                        { day: 'Monday', planet: '🌙 Moon', best: 'Home, family, emotions, nurturing' },
                        { day: 'Tuesday', planet: '♂️ Mars', best: 'Action, competition, ambition, surgery' },
                        { day: 'Wednesday', planet: '☿ Mercury', best: 'Communication, exams, contracts, travel' },
                        { day: 'Thursday', planet: '♃ Jupiter', best: 'Growth, investments, legal, education' },
                        { day: 'Friday', planet: '♀️ Venus', best: 'Love, weddings, beauty, art, finances' },
                        { day: 'Saturday', planet: '♄ Saturn', best: 'Structure, discipline, long-term commitments' },
                        { day: 'Sunday', planet: '☀️ Sun', best: 'Visibility, launches, leadership, vitality' },
                    ].map((item, i) => (
                        <View key={i} style={styles.dayRow}>
                            <View style={styles.dayLeft}>
                                <Text style={styles.dayName}>{item.day}</Text>
                                <Text style={styles.dayPlanet}>{item.planet}</Text>
                            </View>
                            <Text style={styles.dayBest}>{item.best}</Text>
                        </View>
                    ))}
                </View>

                {/* See YOUR Prime Times CTA */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('FullAstrology', {
                        birthDate: route.params?.birthDate || new Date().toISOString(),
                        birthTime: route.params?.birthTime,
                        birthLocation: route.params?.birthLocation,
                    })}
                >
                    <Text style={styles.ctaEmoji}>⭐</Text>
                    <Text style={styles.ctaTitle}>See YOUR Prime Times</Text>
                    <Text style={styles.ctaSubtitle}>Spin the natal chart wheel to detect personalized Prime Time windows based on your birth chart</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, padding: 20 },
    header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
    headerEmoji: { fontSize: 48, marginBottom: 8 },
    mainTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
    cardText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 12 },
    bold: { fontWeight: '700', color: '#fff' },

    ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    ruleNum: { fontSize: 16, color: '#9C27B0', width: 24, textAlign: 'center', fontWeight: '800' },
    ruleText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 19 },

    // Event cards
    eventCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    eventCardExpanded: {
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156,39,176,0.06)',
    },
    eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    eventEmoji: { fontSize: 28, width: 40 },
    eventHeaderText: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
    eventHouse: { fontSize: 12, fontWeight: '600', color: '#9C27B0', marginTop: 2 },
    expandArrow: { fontSize: 14, color: 'rgba(255,255,255,0.4)', width: 20, textAlign: 'center' },
    eventOverview: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19, marginTop: 4 },

    // Expanded
    expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#4CAF50', marginBottom: 8, marginTop: 4 },
    bulletRow: { flexDirection: 'row', marginBottom: 6, paddingLeft: 4 },
    bulletGood: { color: '#4CAF50', fontSize: 14, width: 16, fontWeight: '700' },
    bulletBad: { color: '#F44336', fontSize: 14, width: 16, fontWeight: '700' },
    bulletText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 19 },

    quickRef: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        gap: 8,
    },
    quickRefRow: { flexDirection: 'row', alignItems: 'flex-start' },
    quickRefLabel: { fontSize: 12, fontWeight: '700', color: '#FFD700', width: 90 },
    quickRefValue: { fontSize: 12, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 18 },

    proTip: {
        backgroundColor: 'rgba(255,215,0,0.08)',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
    },
    proTipLabel: { fontSize: 13, fontWeight: '700', color: '#FFD700', marginBottom: 4 },
    proTipText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19, fontStyle: 'italic' },

    // Body map
    bodyMapRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    bodyMapSign: { fontSize: 14, fontWeight: '700', width: 120 },
    bodyMapBody: { fontSize: 13, color: 'rgba(255,255,255,0.75)', flex: 1 },

    // Day of week
    dayRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    dayLeft: { width: 110 },
    dayName: { fontSize: 14, fontWeight: '700', color: '#fff' },
    dayPlanet: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    dayBest: { fontSize: 12, color: 'rgba(255,255,255,0.75)', flex: 1, lineHeight: 18 },
    personalizeNote: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    personalizeNoteText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        lineHeight: 18,
        textAlign: 'center',
    },
    ctaButton: {
        backgroundColor: 'rgba(255,215,0,0.12)',
        borderRadius: 16,
        padding: 24,
        marginTop: 8,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,215,0,0.35)',
    },
    ctaEmoji: { fontSize: 32, marginBottom: 8 },
    ctaTitle: { fontSize: 18, fontWeight: '800', color: '#FFD700', marginBottom: 6 },
    ctaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 19 },
});
