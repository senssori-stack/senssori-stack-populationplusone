import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { G, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TarotBirthCard'>;

interface TarotCard {
    number: number;
    name: string;
    symbol: string;
    upright: string[];
    reversed: string[];
    description: string;
    advice: string;
    element: string;
    planet: string;
    yesNo: string;
    affirmation: string;
}

const MAJOR_ARCANA: TarotCard[] = [
    { number: 0, name: 'The Fool', symbol: '🃏', upright: ['New beginnings', 'Innocence', 'Spontaneity', 'Free spirit'], reversed: ['Recklessness', 'Naivety', 'Poor judgment', 'Foolishness'], description: 'The Fool represents unlimited potential and the courage to embark on a new journey. You carry the energy of pure possibility — every path is open, every adventure awaits.', advice: 'Take that leap of faith. The universe has a net for you.', element: 'Air', planet: 'Uranus', yesNo: 'Yes', affirmation: 'I trust the journey and embrace the unknown with joy.' },
    { number: 1, name: 'The Magician', symbol: '🎩', upright: ['Manifestation', 'Willpower', 'Resourcefulness', 'Skill'], reversed: ['Manipulation', 'Trickery', 'Wasted talent', 'Illusion'], description: 'The Magician combines all four elements into powerful creation. You have every tool you need to manifest your desires. Your birth card indicates mastery of both the material and spiritual worlds.', advice: 'You already have everything you need. Use it.', element: 'Air', planet: 'Mercury', yesNo: 'Yes', affirmation: 'I am the creator of my reality. I manifest with purpose.' },
    { number: 2, name: 'The High Priestess', symbol: '🌙', upright: ['Intuition', 'Mystery', 'Subconscious', 'Inner voice'], reversed: ['Secrets', 'Withdrawal', 'Silence', 'Hidden agendas'], description: 'The High Priestess guards the veil between the conscious and unconscious mind. Your birth card speaks of deep wisdom, powerful intuition, and hidden knowledge waiting to be discovered.', advice: 'Listen to the whispers of your inner voice — it knows.', element: 'Water', planet: 'Moon', yesNo: 'Yes', affirmation: 'I trust my intuition to guide me toward truth.' },
    { number: 3, name: 'The Empress', symbol: '👑', upright: ['Abundance', 'Nurturing', 'Nature', 'Fertility'], reversed: ['Dependence', 'Smothering', 'Emptiness', 'Creative block'], description: 'The Empress is the ultimate mother figure — she creates, nurtures, and brings abundance wherever she goes. Your birth card indicates a life blessed with creativity, beauty, and the ability to nurture growth in all things.', advice: 'Create beauty in the world. Your nurturing energy heals.', element: 'Earth', planet: 'Venus', yesNo: 'Yes', affirmation: 'I am abundant, creative, and nurturing in all I do.' },
    { number: 4, name: 'The Emperor', symbol: '🏛️', upright: ['Authority', 'Structure', 'Control', 'Leadership'], reversed: ['Domination', 'Rigidity', 'Stubbornness', 'Tyranny'], description: 'The Emperor sits on his throne of authority, bringing order from chaos. Your birth card speaks of natural leadership, the ability to create structure, and the discipline to build empires.', advice: 'Lead with wisdom, not just power. Build to last.', element: 'Fire', planet: 'Mars/Aries', yesNo: 'Yes', affirmation: 'I lead with integrity and build structures that endure.' },
    { number: 5, name: 'The Hierophant', symbol: '📿', upright: ['Tradition', 'Spiritual wisdom', 'Teaching', 'Conformity'], reversed: ['Unconventional', 'Rebellion', 'New approaches', 'Freedom'], description: 'The Hierophant bridges the human and divine through tradition and teaching. Your birth card marks you as a keeper of wisdom who finds meaning in time-tested teachings and shared spiritual values.', advice: 'Honor tradition but know when to transcend it.', element: 'Earth', planet: 'Venus/Taurus', yesNo: 'Maybe', affirmation: 'I honor the wisdom of the past while forging my own path.' },
    { number: 6, name: 'The Lovers', symbol: '💕', upright: ['Love', 'Harmony', 'Partnership', 'Choices'], reversed: ['Disharmony', 'Imbalance', 'Misalignment', 'Indecision'], description: 'The Lovers represent divine union — of souls, of purpose, of heart and mind. Your birth card speaks of a life centered on relationships, meaningful choices, and the quest for perfect harmony.', advice: 'Choose with your heart and your head together.', element: 'Air', planet: 'Mercury/Gemini', yesNo: 'Yes', affirmation: 'I choose love in all its forms and trust in divine partnerships.' },
    { number: 7, name: 'The Chariot', symbol: '🏎️', upright: ['Victory', 'Determination', 'Willpower', 'Control'], reversed: ['Aggression', 'Lack of direction', 'Obstacles', 'Defeat'], description: 'The Chariot charges forward with unstoppable determination. Your birth card indicates a life of triumphs won through sheer willpower and the ability to harness opposing forces toward a single goal.', advice: 'Stay focused. Victory is already yours — claim it.', element: 'Water', planet: 'Moon/Cancer', yesNo: 'Yes', affirmation: 'I move forward with confidence and determination.' },
    { number: 8, name: 'Strength', symbol: '🦁', upright: ['Inner strength', 'Courage', 'Patience', 'Compassion'], reversed: ['Self-doubt', 'Weakness', 'Raw emotion', 'Insecurity'], description: 'Strength depicts the taming of a lion through gentle compassion — not brute force. Your birth card reveals that your greatest power lies in patience, courage, and the quiet strength of a compassionate heart.', advice: 'True strength whispers. Let your gentle power roar.', element: 'Fire', planet: 'Sun/Leo', yesNo: 'Yes', affirmation: 'My strength comes from compassion, patience, and inner courage.' },
    { number: 9, name: 'The Hermit', symbol: '🏔️', upright: ['Solitude', 'Wisdom', 'Inner guidance', 'Contemplation'], reversed: ['Isolation', 'Loneliness', 'Withdrawal', 'Lost'], description: 'The Hermit holds his lantern high, illuminating the path for seekers. Your birth card speaks of deep inner wisdom, the courage for solitary reflection, and the gift of lighting the way for others.', advice: 'Go within. The answers are already there.', element: 'Earth', planet: 'Mercury/Virgo', yesNo: 'Maybe', affirmation: 'In solitude I find wisdom. My inner light guides me.' },
    { number: 10, name: 'Wheel of Fortune', symbol: '🎡', upright: ['Destiny', 'Luck', 'Cycles', 'Turning points'], reversed: ['Bad luck', 'Resistance to change', 'Breaking cycles'], description: 'The Wheel of Fortune turns endlessly, bringing change and opportunity. Your birth card indicates a life of dramatic turning points, karmic cycles, and the understanding that change is the only constant.', advice: 'Embrace the turns. Fortune favors the adaptable.', element: 'Fire', planet: 'Jupiter', yesNo: 'Yes', affirmation: 'I trust the cycles of life and welcome each turning point.' },
    { number: 11, name: 'Justice', symbol: '⚖️', upright: ['Fairness', 'Truth', 'Cause and effect', 'Law'], reversed: ['Injustice', 'Dishonesty', 'Lack of accountability'], description: 'Justice holds the scales of truth and the sword of discernment. Your birth card marks you as a seeker of truth, a lover of fairness, and someone who understands that every action has consequences.', advice: 'Seek truth above comfort. Fairness is your superpower.', element: 'Air', planet: 'Venus/Libra', yesNo: 'Maybe', affirmation: 'I stand in truth and treat all beings with fairness.' },
    { number: 12, name: 'The Hanged Man', symbol: '🙃', upright: ['Surrender', 'New perspective', 'Sacrifice', 'Patience'], reversed: ['Stalling', 'Resistance', 'Martyrdom', 'Needless sacrifice'], description: 'The Hanged Man sees the world from a completely different angle. Your birth card indicates profound wisdom gained through surrender — the understanding that sometimes letting go is the most powerful action.', advice: 'Surrender to gain. The upside-down view reveals truth.', element: 'Water', planet: 'Neptune', yesNo: 'Maybe', affirmation: 'I release control and trust the process of transformation.' },
    { number: 13, name: 'Death', symbol: '🦋', upright: ['Transformation', 'Endings', 'New beginnings', 'Transition'], reversed: ['Resistance to change', 'Fear', 'Stagnation', 'Holding on'], description: 'Death is not an ending but the ultimate transformation — the butterfly emerging from the cocoon. Your birth card speaks of a life filled with powerful transformations, rebirth, and the courage to let go of what no longer serves you.', advice: 'Let the old die so the new can be born.', element: 'Water', planet: 'Pluto/Scorpio', yesNo: 'Yes (for change)', affirmation: 'I embrace transformation and trust in new beginnings.' },
    { number: 14, name: 'Temperance', symbol: '⚗️', upright: ['Balance', 'Moderation', 'Patience', 'Harmony'], reversed: ['Imbalance', 'Excess', 'Lack of patience', 'Discord'], description: 'Temperance blends opposing forces into perfect harmony. Your birth card marks you as a natural alchemist — someone who finds the middle path and creates gold from base materials through patience and balance.', advice: 'Find the middle way. Your balance creates miracles.', element: 'Fire', planet: 'Jupiter/Sagittarius', yesNo: 'Yes', affirmation: 'I find harmony in all things and practice the art of balance.' },
    { number: 15, name: 'The Devil', symbol: '⛓️', upright: ['Shadow self', 'Attachment', 'Materialism', 'Playfulness'], reversed: ['Release', 'Freedom', 'Reclaiming power', 'Detachment'], description: 'The Devil represents the shadow self and the chains of attachment — but look closer, the chains are loose. Your birth card indicates someone who must face their shadows to find true freedom and power.', advice: 'Acknowledge your shadows. They hold your greatest power.', element: 'Earth', planet: 'Saturn/Capricorn', yesNo: 'No', affirmation: 'I face my shadows with courage and find freedom within.' },
    { number: 16, name: 'The Tower', symbol: '⚡', upright: ['Sudden change', 'Upheaval', 'Revelation', 'Awakening'], reversed: ['Fear of change', 'Averting disaster', 'Delayed breakthrough'], description: 'The Tower shatters illusions with lightning strikes of truth. Your birth card speaks of a life punctuated by dramatic revelations and sudden changes that, while jarring, ultimately free you from false structures.', advice: 'Let the towers fall. Truth always rebuilds better.', element: 'Fire', planet: 'Mars', yesNo: 'No', affirmation: 'I welcome breakthroughs and trust that upheaval brings renewal.' },
    { number: 17, name: 'The Star', symbol: '⭐', upright: ['Hope', 'Inspiration', 'Serenity', 'Renewal'], reversed: ['Despair', 'Disconnection', 'Faithlessness', 'Discouragement'], description: 'The Star shines with pure hope and divine inspiration. Your birth card marks you as a beacon of light — someone whose very presence inspires hope and renewal in others. You are the calm after the storm.', advice: 'Shine your light. Hope is your gift to the world.', element: 'Air', planet: 'Uranus/Aquarius', yesNo: 'Yes', affirmation: 'I am a beacon of hope, and my light inspires the world.' },
    { number: 18, name: 'The Moon', symbol: '🌕', upright: ['Illusion', 'Intuition', 'Subconscious', 'Dreams'], reversed: ['Confusion', 'Fear', 'Misinterpretation', 'Deception'], description: 'The Moon illuminates the hidden realm of dreams, fears, and deep intuition. Your birth card speaks of a profound connection to the subconscious mind and the ability to navigate the mysterious waters of the psyche.', advice: 'Trust your dreams. The moonlight reveals hidden paths.', element: 'Water', planet: 'Neptune/Pisces', yesNo: 'Maybe', affirmation: 'I trust my dreams and navigate the unknown with grace.' },
    { number: 19, name: 'The Sun', symbol: '☀️', upright: ['Joy', 'Success', 'Vitality', 'Positivity'], reversed: ['Temporary setbacks', 'Inner child wounded', 'Lack of clarity'], description: 'The Sun radiates pure, golden joy and life-affirming energy. Your birth card marks you as someone destined for warmth, success, and the ability to bring light into the darkest corners of life.', advice: 'Be the sunshine. Your joy is contagious and healing.', element: 'Fire', planet: 'Sun', yesNo: 'Yes', affirmation: 'I radiate joy, vitality, and warmth wherever I go.' },
    { number: 20, name: 'Judgement', symbol: '📯', upright: ['Rebirth', 'Inner calling', 'Absolution', 'Reflection'], reversed: ['Self-doubt', 'Ignoring the call', 'Lack of self-awareness'], description: 'Judgement sounds the trumpet of awakening and spiritual rebirth. Your birth card indicates a life of profound self-reflection, answering your higher calling, and the courage to be reborn into your truest self.', advice: 'Answer the call. Your highest self is summoning you.', element: 'Fire', planet: 'Pluto', yesNo: 'Yes', affirmation: 'I answer my higher calling and embrace spiritual rebirth.' },
    { number: 21, name: 'The World', symbol: '🌍', upright: ['Completion', 'Achievement', 'Wholeness', 'Travel'], reversed: ['Incompletion', 'Shortcuts', 'Seeking closure'], description: 'The World represents the completion of a grand cycle — the ultimate achievement. Your birth card speaks of a life destined for wholeness, fulfillment, and the celebration of hard-won accomplishments.', advice: 'Celebrate your wholeness. You are complete.', element: 'Earth', planet: 'Saturn', yesNo: 'Yes', affirmation: 'I celebrate my completeness and honor every cycle of growth.' },
];

function calculateBirthCard(date: Date): { card1: TarotCard; card2: TarotCard | null } {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Sum all digits of birth date
    const dateStr = `${month}${day}${year}`;
    let sum = dateStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);

    // Keep reducing until we get 0-21
    while (sum > 21) {
        sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }

    const card1 = MAJOR_ARCANA[sum] || MAJOR_ARCANA[0];

    // Second card (personality card) is single-digit reduction
    let personality = sum;
    while (personality > 9 && personality !== 11 && personality !== 22) {
        personality = personality.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    if (personality === 22) personality = 0; // The Fool

    const card2 = personality !== sum ? (MAJOR_ARCANA[personality] || null) : null;

    return { card1, card2 };
}

export default function TarotBirthCardScreen({ route }: Props) {
    const birthDate = new Date(route.params.birthDate);
    const { card1, card2 } = calculateBirthCard(birthDate);

    const renderCard = (card: TarotCard, label: string) => (
        <View style={styles.tarotCard}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardSymbol}>{card.symbol}</Text>
            <Text style={styles.cardNumber}>{card.number === 0 ? '0' : card.number}</Text>
            <Text style={styles.cardName}>{card.name}</Text>
            <View style={styles.correspondenceRow}>
                <View style={styles.corresBadge}><Text style={styles.corresText}>{card.element}</Text></View>
                <View style={styles.corresBadge}><Text style={styles.corresText}>{card.planet}</Text></View>
                <View style={[styles.corresBadge, { backgroundColor: card.yesNo === 'Yes' ? 'rgba(76,175,80,0.2)' : card.yesNo === 'No' ? 'rgba(244,67,54,0.2)' : 'rgba(255,193,7,0.2)' }]}>
                    <Text style={[styles.corresText, { color: card.yesNo === 'Yes' ? '#4CAF50' : card.yesNo === 'No' ? '#F44336' : '#FFC107' }]}>{card.yesNo}</Text>
                </View>
            </View>
        </View>
    );

    const renderDetails = (card: TarotCard) => (
        <>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📖 Card Meaning</Text>
                <Text style={styles.bodyText}>{card.description}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📊 Upright vs Reversed</Text>
                <Svg width="100%" height={Math.max(card.upright.length, card.reversed.length) * 30 + 30} viewBox={`0 0 320 ${Math.max(card.upright.length, card.reversed.length) * 30 + 30}`}>
                    <SvgText x={80} y={15} fill="#4CAF50" fontSize={11} fontWeight="bold" textAnchor="middle">Upright ✓</SvgText>
                    <SvgText x={240} y={15} fill="#F44336" fontSize={11} fontWeight="bold" textAnchor="middle">Reversed ✗</SvgText>
                    {card.upright.map((u, i) => (
                        <G key={`u-${u}`}>
                            <Rect x={5} y={22 + i * 28} width={150} height={22} rx={6} fill="#4CAF50" opacity={0.15} />
                            <SvgText x={12} y={37 + i * 28} fill="#4CAF50" fontSize={10}>{u}</SvgText>
                        </G>
                    ))}
                    {card.reversed.map((r, i) => (
                        <G key={`r-${r}`}>
                            <Rect x={165} y={22 + i * 28} width={150} height={22} rx={6} fill="#F44336" opacity={0.15} />
                            <SvgText x={172} y={37 + i * 28} fill="#F44336" fontSize={10}>{r}</SvgText>
                        </G>
                    ))}
                </Svg>
            </View>

            <View style={[styles.card, { borderColor: '#FFD54F33', borderWidth: 2 }]}>
                <Text style={styles.sectionTitle}>💫 Life Advice</Text>
                <Text style={styles.adviceText}>"{card.advice}"</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>🙏 Daily Affirmation</Text>
                <Text style={styles.affirmation}>"{card.affirmation}"</Text>
            </View>
        </>
    );

    return (
        <LinearGradient colors={['#1a0a2a', '#2a0020', '#0d0d2b']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a0a2a" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.mainTitle}>🃏 Your Tarot Birth Cards</Text>
                <Text style={styles.subtitle}>
                    {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>

                {/* Cards Display */}
                <View style={styles.cardsRow}>
                    {renderCard(card1, 'Soul Card')}
                    {card2 && renderCard(card2, 'Personality Card')}
                </View>

                {/* Soul Card Details */}
                <Text style={styles.divider}>─── Soul Card: {card1.name} ───</Text>
                {renderDetails(card1)}

                {/* Personality Card Details */}
                {card2 && (
                    <>
                        <Text style={styles.divider}>─── Personality Card: {card2.name} ───</Text>
                        {renderDetails(card2)}
                    </>
                )}

                {/* Numerology Connection */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🔢 How Your Birth Card Is Calculated</Text>
                    <Text style={styles.bodyText}>
                        Your birth card is determined by adding all the digits of your birth date together and reducing to a Major Arcana number (0–21).{'\n\n'}
                        Birth date: {birthDate.getMonth() + 1}/{birthDate.getDate()}/{birthDate.getFullYear()}{'\n'}
                        Soul Card (full sum): {card1.name} ({card1.number}){'\n'}
                        {card2 ? `Personality Card (reduced): ${card2.name} (${card2.number})` : 'Your Soul and Personality cards are the same!'}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    mainTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 10 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 },
    cardsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 20 },
    tarotCard: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: 'rgba(255,213,79,0.3)', maxWidth: 160 },
    cardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    cardSymbol: { fontSize: 48, marginBottom: 4 },
    cardNumber: { fontSize: 22, fontWeight: '900', color: '#FFD54F' },
    cardName: { fontSize: 14, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 2 },
    correspondenceRow: { flexDirection: 'row', gap: 4, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
    corresBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    corresText: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    divider: { fontSize: 14, color: 'rgba(255,213,79,0.5)', textAlign: 'center', marginVertical: 16 },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
    bodyText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
    adviceText: { fontSize: 16, color: '#FFE082', fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
    affirmation: { fontSize: 15, color: '#CE93D8', fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
});
