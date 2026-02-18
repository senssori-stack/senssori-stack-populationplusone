/**
 * TRANSIT INTERPRETATIONS
 * Astrological meanings for planetary transits
 * Each transit planet + natal planet + aspect combination has a unique interpretation
 */

// Transit planet meanings (what energy is coming in)
export const TRANSIT_PLANET_THEMES: Record<string, {
    theme: string;
    keywords: string[];
    duration: string;
}> = {
    'Sun': {
        theme: 'Spotlight and vitality',
        keywords: ['identity', 'ego', 'self-expression', 'vitality', 'recognition'],
        duration: '1-3 days'
    },
    'Moon': {
        theme: 'Emotions and instincts',
        keywords: ['feelings', 'moods', 'needs', 'comfort', 'intuition'],
        duration: 'A few hours'
    },
    'Mercury': {
        theme: 'Communication and thinking',
        keywords: ['thoughts', 'conversations', 'learning', 'messages', 'decisions'],
        duration: '2-5 days'
    },
    'Venus': {
        theme: 'Love and values',
        keywords: ['relationships', 'pleasure', 'beauty', 'money', 'harmony'],
        duration: '3-7 days'
    },
    'Mars': {
        theme: 'Action and drive',
        keywords: ['energy', 'motivation', 'conflict', 'passion', 'courage'],
        duration: '1-2 weeks'
    },
    'Jupiter': {
        theme: 'Expansion and opportunity',
        keywords: ['growth', 'luck', 'optimism', 'abundance', 'wisdom'],
        duration: '2-4 weeks'
    },
    'Saturn': {
        theme: 'Structure and lessons',
        keywords: ['responsibility', 'discipline', 'limitations', 'maturity', 'karma'],
        duration: '2-4 weeks'
    },
    'Uranus': {
        theme: 'Change and liberation',
        keywords: ['surprise', 'breakthrough', 'rebellion', 'innovation', 'freedom'],
        duration: '1-3 months'
    },
    'Neptune': {
        theme: 'Dreams and spirituality',
        keywords: ['imagination', 'intuition', 'confusion', 'compassion', 'transcendence'],
        duration: '2-6 months'
    },
    'Pluto': {
        theme: 'Transformation and power',
        keywords: ['rebirth', 'intensity', 'secrets', 'healing', 'empowerment'],
        duration: '6-12 months'
    },
};

// Natal planet meanings (what area of life is activated)
export const NATAL_PLANET_AREAS: Record<string, {
    area: string;
    represents: string;
}> = {
    'Sun': { area: 'Your core identity', represents: 'ego, self-expression, life force, purpose' },
    'Moon': { area: 'Your emotional world', represents: 'feelings, needs, instincts, mother, home' },
    'Mercury': { area: 'Your mind', represents: 'thinking, communication, learning, siblings' },
    'Venus': { area: 'Your relationships & values', represents: 'love, beauty, pleasure, money, art' },
    'Mars': { area: 'Your drive & desires', represents: 'action, ambition, sexuality, anger, courage' },
    'Jupiter': { area: 'Your growth & beliefs', represents: 'expansion, faith, travel, higher learning' },
    'Saturn': { area: 'Your responsibilities', represents: 'structure, discipline, career, father, limits' },
    'Uranus': { area: 'Your uniqueness', represents: 'individuality, freedom, rebellion, innovation' },
    'Neptune': { area: 'Your spiritual side', represents: 'dreams, intuition, creativity, escapism' },
    'Pluto': { area: 'Your transformation', represents: 'power, death/rebirth, secrets, psychology' },
};

// Aspect interpretations by nature
export const ASPECT_INTERPRETATIONS: Record<string, {
    energy: string;
    advice: string;
}> = {
    'Conjunction': {
        energy: 'Intense merging of energies. A new beginning or powerful focus.',
        advice: 'Channel this concentrated energy purposefully.'
    },
    'Sextile': {
        energy: 'Opportunity knocking. Positive flow between energies.',
        advice: 'Take initiative to make the most of this opening.'
    },
    'Square': {
        energy: 'Tension requiring action. Internal or external friction.',
        advice: 'Face challenges directly. Growth comes through effort.'
    },
    'Trine': {
        energy: 'Natural harmony and flow. Talents come easily.',
        advice: 'Enjoy the ease but don\'t become complacent.'
    },
    'Opposition': {
        energy: 'Awareness through contrast. Others reflect your issues.',
        advice: 'Seek balance. Consider the other perspective.'
    },
};

// Detailed transit interpretations
// Format: transitingPlanet_natalPlanet_aspect
export const TRANSIT_MEANINGS: Record<string, {
    title: string;
    meaning: string;
    advice: string;
}> = {
    // SUN transits
    'Sun_Sun_Conjunction': {
        title: 'Solar Return Energy',
        meaning: 'This is your birthday season! The Sun returns to where it was when you were born, marking a new personal year.',
        advice: 'Set intentions for the year ahead. This is YOUR time to shine.'
    },
    'Sun_Moon_Conjunction': {
        title: 'Emotional Spotlight',
        meaning: 'Your emotional needs and feelings are highlighted. What you need to feel secure becomes clear.',
        advice: 'Honor your feelings. Nurture yourself today.'
    },
    'Sun_Mercury_Conjunction': {
        title: 'Mental Clarity',
        meaning: 'Your thinking and communication are energized. Ideas flow and you express yourself clearly.',
        advice: 'Great day for important conversations, writing, or learning.'
    },
    'Sun_Venus_Conjunction': {
        title: 'Love & Beauty Shine',
        meaning: 'Your charm and attractiveness are heightened. Relationships and creative pursuits are favored.',
        advice: 'Enjoy social activities, art, and connecting with loved ones.'
    },
    'Sun_Mars_Conjunction': {
        title: 'Energy Surge',
        meaning: 'Your drive and ambition are supercharged. You feel motivated and ready to take action.',
        advice: 'Channel this energy into productive activity. Avoid unnecessary conflicts.'
    },
    'Sun_Jupiter_Conjunction': {
        title: 'Lucky Day',
        meaning: 'Optimism and opportunity surround you. Things seem to go your way.',
        advice: 'Take a chance on something you\'ve been considering. Be generous.'
    },
    'Sun_Saturn_Conjunction': {
        title: 'Reality Check',
        meaning: 'Responsibilities demand attention. Authority figures or structures are in focus.',
        advice: 'Handle duties with maturity. Discipline pays off now.'
    },

    // MERCURY transits
    'Mercury_Sun_Conjunction': {
        title: 'Clear Self-Expression',
        meaning: 'Your words carry weight. Communication about who you are flows naturally.',
        advice: 'Speak up about your goals and identity. Others are listening.'
    },
    'Mercury_Moon_Conjunction': {
        title: 'Heart-Mind Connection',
        meaning: 'You can articulate your feelings clearly. Emotional conversations are productive.',
        advice: 'Write in a journal. Talk about how you really feel.'
    },
    'Mercury_Mercury_Conjunction': {
        title: 'Mental Peak',
        meaning: 'Your mind is sharp and quick. Learning and communication are enhanced.',
        advice: 'Perfect for studying, writing, negotiations, or important calls.'
    },
    'Mercury_Venus_Conjunction': {
        title: 'Sweet Words',
        meaning: 'Your communication is charming and diplomatic. Good for love letters and negotiations.',
        advice: 'Express affection. Discuss relationship matters.'
    },
    'Mercury_Mars_Conjunction': {
        title: 'Sharp Tongue',
        meaning: 'Your words are direct and forceful. Debates and arguments are likely.',
        advice: 'Think before speaking. Use assertiveness wisely.'
    },
    'Mercury_Jupiter_Conjunction': {
        title: 'Big Ideas',
        meaning: 'Your thinking expands. Optimistic ideas and plans for the future emerge.',
        advice: 'Dream big but check details. Great for planning and learning.'
    },
    'Mercury_Saturn_Conjunction': {
        title: 'Serious Thoughts',
        meaning: 'Your mind is focused on practical matters. Deep concentration is possible.',
        advice: 'Good for detailed work, contracts, and realistic planning.'
    },

    // VENUS transits
    'Venus_Sun_Conjunction': {
        title: 'Charming Day',
        meaning: 'You\'re more attractive and likeable. Social graces are enhanced.',
        advice: 'Enjoy socializing, romance, and creative self-expression.'
    },
    'Venus_Moon_Conjunction': {
        title: 'Emotional Harmony',
        meaning: 'You feel loved and loving. Comfort and pleasure are emphasized.',
        advice: 'Nurture relationships. Indulge in comfort and beauty.'
    },
    'Venus_Venus_Conjunction': {
        title: 'Venus Return',
        meaning: 'A cycle of love and values renews. Relationships and finances are refreshed.',
        advice: 'Reflect on what you truly value in love and life.'
    },
    'Venus_Mars_Conjunction': {
        title: 'Passionate Attraction',
        meaning: 'Romantic and creative energies are heightened. Strong attractions possible.',
        advice: 'Channel this into romance or creative projects.'
    },
    'Venus_Jupiter_Conjunction': {
        title: 'Love & Luck',
        meaning: 'One of the luckiest transits for love, money, and pleasure.',
        advice: 'Say yes to invitations. Generosity brings rewards.'
    },
    'Venus_Saturn_Conjunction': {
        title: 'Committed Love',
        meaning: 'Relationships become more serious. Lasting commitments are favored.',
        advice: 'Value stability over excitement. Invest in long-term bonds.'
    },

    // MARS transits
    'Mars_Sun_Conjunction': {
        title: 'Power Surge',
        meaning: 'Your energy and willpower are at a peak. You feel driven to assert yourself.',
        advice: 'Take bold action. Channel aggression into achievement.'
    },
    'Mars_Moon_Conjunction': {
        title: 'Emotional Intensity',
        meaning: 'Feelings are strong and reactions are quick. You may feel irritable or passionate.',
        advice: 'Find healthy outlets for emotional energy. Exercise helps.'
    },
    'Mars_Mars_Conjunction': {
        title: 'Mars Return',
        meaning: 'A new 2-year cycle of action and desire begins. Your approach to getting what you want renews.',
        advice: 'Set intentions for what you want to fight for.'
    },
    'Mars_Venus_Conjunction': {
        title: 'Passionate Desires',
        meaning: 'Romance is heated. Creative energy is strong. You want what you want NOW.',
        advice: 'Pursue romance or art with passion but avoid pushiness.'
    },
    'Mars_Jupiter_Conjunction': {
        title: 'Confident Action',
        meaning: 'You feel unstoppable. Energy combines with optimism for big moves.',
        advice: 'Go after what you want but don\'t overextend.'
    },
    'Mars_Saturn_Conjunction': {
        title: 'Frustrated Energy',
        meaning: 'Obstacles test your patience. Hard work is required but progress is slow.',
        advice: 'Persist through frustration. Discipline your energy.'
    },

    // JUPITER transits
    'Jupiter_Sun_Conjunction': {
        title: 'Year of Growth',
        meaning: 'One of the most fortunate transits. Expansion, luck, and confidence boost your life.',
        advice: 'Dream big. Opportunities abound. Don\'t hold back.'
    },
    'Jupiter_Moon_Conjunction': {
        title: 'Emotional Abundance',
        meaning: 'You feel optimistic and emotionally generous. Home and family expand.',
        advice: 'Nurture big dreams. Express feelings generously.'
    },
    'Jupiter_Venus_Conjunction': {
        title: 'Love Expansion',
        meaning: 'Extremely lucky for love, creativity, and money. Joy and pleasure multiply.',
        advice: 'Open your heart. Indulge (within reason). Celebrate love.'
    },
    'Jupiter_Mars_Conjunction': {
        title: 'Bold Moves',
        meaning: 'Courage and optimism combine. You feel capable of anything.',
        advice: 'Take calculated risks. Your energy is blessed with luck.'
    },
    'Jupiter_Saturn_Conjunction': {
        title: 'Realistic Expansion',
        meaning: 'Growth meets structure. You can build something lasting.',
        advice: 'Expand wisely. Ground your optimism in reality.'
    },

    // SATURN transits
    'Saturn_Sun_Conjunction': {
        title: 'Identity Restructuring',
        meaning: 'A serious period of self-examination. You\'re tested on who you really are.',
        advice: 'Embrace responsibility. Build authentic self-expression.'
    },
    'Saturn_Moon_Conjunction': {
        title: 'Emotional Maturity',
        meaning: 'Feelings are serious. You may feel lonely or burdened. Emotional boundaries form.',
        advice: 'Face difficult feelings. Create healthy emotional structures.'
    },
    'Saturn_Venus_Conjunction': {
        title: 'Love\'s Test',
        meaning: 'Relationships face reality checks. What\'s not working becomes clear.',
        advice: 'Commit to real love. Release superficial connections.'
    },
    'Saturn_Mars_Conjunction': {
        title: 'Controlled Energy',
        meaning: 'Your drive meets resistance. Frustration is possible but discipline builds.',
        advice: 'Work hard with patience. Don\'t force things.'
    },
    'Saturn_Jupiter_Conjunction': {
        title: 'Grounded Growth',
        meaning: 'Optimism meets reality. Sustainable expansion is possible.',
        advice: 'Build on solid foundations. Moderate excess.'
    },

    // URANUS transits
    'Uranus_Sun_Conjunction': {
        title: 'Identity Revolution',
        meaning: 'Sudden changes to who you are or how you express yourself. Liberation from old patterns.',
        advice: 'Embrace authenticity. Be open to reinventing yourself.'
    },
    'Uranus_Moon_Conjunction': {
        title: 'Emotional Awakening',
        meaning: 'Unexpected changes in your emotional life or home. Old patterns break.',
        advice: 'Allow feelings to flow freely. Expect the unexpected.'
    },
    'Uranus_Venus_Conjunction': {
        title: 'Love Revolution',
        meaning: 'Sudden attractions or changes in relationships. Freedom in love is needed.',
        advice: 'Be open to unconventional connections. Don\'t cling.'
    },

    // NEPTUNE transits
    'Neptune_Sun_Conjunction': {
        title: 'Spiritual Identity',
        meaning: 'Your sense of self becomes more fluid. Creativity and spirituality deepen.',
        advice: 'Explore imagination and spirit. Stay grounded in reality too.'
    },
    'Neptune_Moon_Conjunction': {
        title: 'Emotional Sensitivity',
        meaning: 'You\'re highly intuitive but also vulnerable. Dreams are vivid.',
        advice: 'Trust intuition but verify facts. Create, meditate, escape wisely.'
    },
    'Neptune_Venus_Conjunction': {
        title: 'Romantic Dreams',
        meaning: 'Love feels magical and idealized. Artistic inspiration flows.',
        advice: 'Enjoy the romance but stay realistic. Create beauty.'
    },

    // PLUTO transits
    'Pluto_Sun_Conjunction': {
        title: 'Total Transformation',
        meaning: 'A profound rebirth of identity. Old self dies, new self emerges.',
        advice: 'Surrender to deep change. You\'re becoming who you\'re meant to be.'
    },
    'Pluto_Moon_Conjunction': {
        title: 'Emotional Rebirth',
        meaning: 'Intense emotional processing. Old wounds surface for healing.',
        advice: 'Face your depths. Therapy and deep inner work are powerful now.'
    },
    'Pluto_Venus_Conjunction': {
        title: 'Love Transformation',
        meaning: 'Obsessive attractions or relationship power struggles. Values transform.',
        advice: 'Examine what you really desire. Let go of superficial wants.'
    },

    // Square aspects (challenging)
    'Saturn_Sun_Square': {
        title: 'Identity Challenge',
        meaning: 'External pressures test your sense of self. Responsibilities feel heavy.',
        advice: 'Rise to the challenge. Prove yourself through hard work.'
    },
    'Saturn_Moon_Square': {
        title: 'Emotional Pressure',
        meaning: 'Feelings of loneliness or emotional burden. You may feel unsupported.',
        advice: 'Set healthy boundaries. Seek mature emotional support.'
    },
    'Uranus_Sun_Square': {
        title: 'Restless Identity',
        meaning: 'You feel the urge to break free from restrictions. Sudden changes are possible.',
        advice: 'Make changes consciously. Don\'t just react.'
    },
    'Pluto_Sun_Square': {
        title: 'Power Struggles',
        meaning: 'Intense confrontations with power - your own or others\'.',
        advice: 'Don\'t try to control. Transform through surrender.'
    },

    // Opposition aspects (awareness)
    'Saturn_Sun_Opposition': {
        title: 'External Challenges',
        meaning: 'Others or circumstances block your path. Reality demands acknowledgment.',
        advice: 'Work with restrictions, not against them.'
    },
    'Jupiter_Sun_Opposition': {
        title: 'Over-Extension',
        meaning: 'Others may offer too much or expect too much. Balance giving and receiving.',
        advice: 'Stay humble. Don\'t promise more than you can deliver.'
    },

    // Trine aspects (harmonious)
    'Jupiter_Sun_Trine': {
        title: 'Natural Luck',
        meaning: 'Opportunities flow easily. Confidence and optimism attract good things.',
        advice: 'Ride the wave of good fortune. Share your blessings.'
    },
    'Jupiter_Venus_Trine': {
        title: 'Love Flows',
        meaning: 'One of the luckiest transits. Love, money, and joy come easily.',
        advice: 'Enjoy life\'s pleasures. Be generous with love.'
    },
    'Saturn_Sun_Trine': {
        title: 'Steady Progress',
        meaning: 'Hard work pays off naturally. Authority figures support you.',
        advice: 'Build on solid foundations. Your efforts are rewarded.'
    },
};

/**
 * Get interpretation for a specific transit
 */
export function getTransitInterpretation(
    transitingPlanet: string,
    natalPlanet: string,
    aspectName: string
): { title: string; meaning: string; advice: string } | null {
    // Try exact match first
    const key = `${transitingPlanet}_${natalPlanet}_${aspectName}`;
    if (TRANSIT_MEANINGS[key]) {
        return TRANSIT_MEANINGS[key];
    }

    // Generate generic interpretation
    const transitTheme = TRANSIT_PLANET_THEMES[transitingPlanet];
    const natalArea = NATAL_PLANET_AREAS[natalPlanet];
    const aspectEnergy = ASPECT_INTERPRETATIONS[aspectName];

    if (transitTheme && natalArea && aspectEnergy) {
        return {
            title: `${transitingPlanet} ${aspectName} ${natalPlanet}`,
            meaning: `${transitTheme.theme} energy is ${aspectName === 'Conjunction' ? 'merging with' : 'activating'} ${natalArea.area.toLowerCase()}. This brings ${transitTheme.keywords[0]} and ${transitTheme.keywords[1]} to matters of ${natalArea.represents.split(',')[0]}.`,
            advice: aspectEnergy.advice
        };
    }

    return null;
}

/**
 * Get general theme for a transiting planet
 */
export function getTransitPlanetTheme(planet: string): typeof TRANSIT_PLANET_THEMES[string] | null {
    return TRANSIT_PLANET_THEMES[planet] || null;
}
