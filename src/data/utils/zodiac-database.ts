// Complete zodiac sign information database

export interface ZodiacInfo {
    sign: string;
    dates: string;
    element: string;
    color: string;
    quality: string;
    day: string;
    ruler: string;
    compatibility: string;
    luckyNumbers: string;
    strengths: string;
    weaknesses: string;
    likes: string;
    dislikes: string;
    loveLife: string;
    personality: string;
}

export const ZODIAC_DATABASE: Record<string, ZodiacInfo> = {
    'Aries': {
        sign: 'Aries',
        dates: 'March 21 - April 19',
        element: 'Fire',
        color: 'Red',
        quality: 'Cardinal',
        day: 'Tuesday',
        ruler: 'Mars',
        compatibility: 'Leo, Sagittarius',
        luckyNumbers: '1, 8, 17',
        strengths: 'Courageous, determined, confident, enthusiastic, optimistic, honest, passionate',
        weaknesses: 'Impatient, moody, short-tempered, impulsive, aggressive',
        likes: 'Comfortable clothes, taking on leadership roles, physical challenges, individual sports',
        dislikes: 'Inactivity, delays, work that does not use one\'s talents',
        loveLife: 'Aries is passionate and energetic in relationships, often taking the lead. They seek adventure and excitement, valuing honesty and directness in their partners.',
        personality: 'Aries are natural-born leaders with a pioneering spirit. They are enthusiastic, dynamic, and quick to act on their impulses.'
    },
    'Taurus': {
        sign: 'Taurus',
        dates: 'April 20 - May 20',
        element: 'Earth',
        color: 'Green, Pink',
        quality: 'Fixed',
        day: 'Friday',
        ruler: 'Venus',
        compatibility: 'Cancer, Virgo, Capricorn',
        luckyNumbers: '2, 6, 9, 12, 24',
        strengths: 'Reliable, patient, practical, devoted, responsible, stable',
        weaknesses: 'Stubborn, possessive, uncompromising',
        likes: 'Gardening, cooking, music, romance, high quality clothes, working with hands',
        dislikes: 'Sudden changes, complications, insecurity of any kind, synthetic fabrics',
        loveLife: 'Taurus seeks stability and sensuality in love. They are devoted partners who value physical affection and building a comfortable, secure home life.',
        personality: 'Taurus is known for being reliable and grounded. They appreciate the finer things in life and work hard to achieve comfort and security.'
    },
    'Gemini': {
        sign: 'Gemini',
        dates: 'May 21 - June 20',
        element: 'Air',
        color: 'Yellow',
        quality: 'Mutable',
        day: 'Wednesday',
        ruler: 'Mercury',
        compatibility: 'Libra, Aquarius',
        luckyNumbers: '5, 7, 14, 23',
        strengths: 'Gentle, affectionate, curious, adaptable, ability to learn quickly and exchange ideas',
        weaknesses: 'Nervous, inconsistent, indecisive',
        likes: 'Music, books, magazines, chats with nearly anyone, short trips around the town',
        dislikes: 'Being alone, being confined, repetition and routine',
        loveLife: 'Gemini brings excitement and intellectual stimulation to relationships. They need mental connection and variety, enjoying witty banter and social activities with their partner.',
        personality: 'Gemini is expressive, quick-witted, and sociable. They are natural communicators who thrive on variety and intellectual stimulation.'
    },
    'Cancer': {
        sign: 'Cancer',
        dates: 'June 21 - July 22',
        element: 'Water',
        color: 'White',
        quality: 'Cardinal',
        day: 'Monday',
        ruler: 'Moon',
        compatibility: 'Taurus, Virgo, Scorpio, Pisces',
        luckyNumbers: '2, 3, 15, 20',
        strengths: 'Tenacious, highly imaginative, loyal, emotional, sympathetic, persuasive',
        weaknesses: 'Moody, pessimistic, suspicious, manipulative, insecure',
        likes: 'Art, home-based hobbies, relaxing near or in water, helping loved ones, a good meal with friends',
        dislikes: 'Strangers, any criticism of Mom, revealing of personal life',
        loveLife: 'Cancer is deeply emotional and nurturing in love. They seek emotional security and are devoted to creating a warm, loving home environment for their partner.',
        personality: 'Cancer is intuitive and emotional, with a strong attachment to family and home. They are protective and caring, often putting others\' needs before their own.'
    },
    'Leo': {
        sign: 'Leo',
        dates: 'July 23 - August 22',
        element: 'Fire',
        color: 'Gold, Yellow, Orange',
        quality: 'Fixed',
        day: 'Sunday',
        ruler: 'Sun',
        compatibility: 'Aries, Sagittarius',
        luckyNumbers: '1, 3, 10, 19',
        strengths: 'Creative, passionate, generous, warm-hearted, cheerful, humorous',
        weaknesses: 'Arrogant, stubborn, self-centered, lazy, inflexible',
        likes: 'Theater, taking holidays, being admired, expensive things, bright colors, fun with friends',
        dislikes: 'Being ignored, facing difficult reality, not being treated like a king or queen',
        loveLife: 'Leo loves with passion and drama. They are generous and loyal partners who enjoy grand romantic gestures and need admiration and appreciation from their loved ones.',
        personality: 'Leo is confident, ambitious, and natural performers. They have magnetic personalities and love being the center of attention.'
    },
    'Virgo': {
        sign: 'Virgo',
        dates: 'August 23 - September 22',
        element: 'Earth',
        color: 'Grey, Beige, Pale Yellow',
        quality: 'Mutable',
        day: 'Wednesday',
        ruler: 'Mercury',
        compatibility: 'Taurus, Cancer, Capricorn',
        luckyNumbers: '5, 14, 15, 23, 32',
        strengths: 'Loyal, analytical, kind, hardworking, practical',
        weaknesses: 'Shyness, worry, overly critical of self and others, all work and no play',
        likes: 'Animals, healthy food, books, nature, cleanliness',
        dislikes: 'Rudeness, asking for help, taking center stage',
        loveLife: 'Virgo approaches love with care and practicality. They are devoted partners who show love through acts of service and appreciate partners who value their attention to detail.',
        personality: 'Virgo is meticulous, analytical, and service-oriented. They have high standards and are always striving for perfection in everything they do.'
    },
    'Libra': {
        sign: 'Libra',
        dates: 'September 23 - October 22',
        element: 'Air',
        color: 'Pink, Green',
        quality: 'Cardinal',
        day: 'Friday',
        ruler: 'Venus',
        compatibility: 'Gemini, Leo, Sagittarius',
        luckyNumbers: '4, 6, 13, 15, 24',
        strengths: 'Cooperative, diplomatic, gracious, fair-minded, social',
        weaknesses: 'Indecisive, avoids confrontations, will carry a grudge, self-pity',
        likes: 'Harmony, gentleness, sharing with others, the outdoors',
        dislikes: 'Violence, injustice, loudmouths, conformity',
        loveLife: 'Libra seeks balance and harmony in relationships. They are romantic and fair-minded partners who value equality and open communication in their love life.',
        personality: 'Libra is diplomatic, charming, and seeks balance in all aspects of life. They are natural peacemakers who value justice and harmony.'
    },
    'Scorpio': {
        sign: 'Scorpio',
        dates: 'October 23 - November 21',
        element: 'Water',
        color: 'Scarlet, Red, Rust',
        quality: 'Fixed',
        day: 'Tuesday',
        ruler: 'Pluto, Mars',
        compatibility: 'Cancer, Pisces',
        luckyNumbers: '8, 11, 18, 22',
        strengths: 'Resourceful, powerful, brave, passionate, a true friend',
        weaknesses: 'Distrusting, jealous, manipulative, violent',
        likes: 'Truth, facts, being right, talents, teasing, passion',
        dislikes: 'Dishonesty, revealing secrets, superficiality, small talk',
        loveLife: 'Scorpio loves intensely and deeply. They seek transformative, soul-deep connections and are fiercely loyal once committed. Passion and emotional intimacy are essential.',
        personality: 'Scorpio is intense, mysterious, and emotionally deep. They possess strong willpower and are known for their determination and ability to transform themselves.'
    },
    'Sagittarius': {
        sign: 'Sagittarius',
        dates: 'November 22 - December 21',
        element: 'Fire',
        color: 'Blue',
        quality: 'Mutable',
        day: 'Thursday',
        ruler: 'Jupiter',
        compatibility: 'Aries, Leo, Libra',
        luckyNumbers: '3, 7, 9, 12, 21',
        strengths: 'Generous, idealistic, great sense of humor',
        weaknesses: 'Promises more than can deliver, very impatient, will say anything no matter how undiplomatic',
        likes: 'Freedom, travel, philosophy, being outdoors',
        dislikes: 'Clingy people, being constrained, off-the-wall theories, details',
        loveLife: 'Sagittarius needs freedom and adventure in relationships. They are optimistic and fun-loving partners who value honesty and philosophical connection with their loved ones.',
        personality: 'Sagittarius is adventurous, optimistic, and freedom-loving. They are natural philosophers who seek knowledge and new experiences.'
    },
    'Capricorn': {
        sign: 'Capricorn',
        dates: 'December 22 - January 19',
        element: 'Earth',
        color: 'Brown, Black',
        quality: 'Cardinal',
        day: 'Saturday',
        ruler: 'Saturn',
        compatibility: 'Taurus, Virgo',
        luckyNumbers: '4, 8, 13, 22',
        strengths: 'Responsible, disciplined, self-control, good managers',
        weaknesses: 'Know-it-all, unforgiving, condescending, expecting the worst',
        likes: 'Family, tradition, music, understated status, quality craftsmanship',
        dislikes: 'Almost everything at some point',
        loveLife: 'Capricorn takes relationships seriously and commits for the long term. They show love through providing security and building a solid foundation for the future.',
        personality: 'Capricorn is ambitious, disciplined, and practical. They are natural achievers who value tradition and work tirelessly toward their goals.'
    },
    'Aquarius': {
        sign: 'Aquarius',
        dates: 'January 20 - February 18',
        element: 'Air',
        color: 'Light Blue, Silver',
        quality: 'Fixed',
        day: 'Saturday',
        ruler: 'Uranus, Saturn',
        compatibility: 'Gemini, Libra',
        luckyNumbers: '4, 7, 11, 22, 29',
        strengths: 'Progressive, original, independent, humanitarian',
        weaknesses: 'Runs from emotional expression, temperamental, uncompromising, aloof',
        likes: 'Fun with friends, helping others, fighting for causes, intellectual conversation, a good listener',
        dislikes: 'Limitations, broken promises, being lonely, dull or boring situations, people who disagree with them',
        loveLife: 'Aquarius values intellectual connection and friendship in love. They need independence and are attracted to unique, unconventional partners who respect their need for freedom.',
        personality: 'Aquarius is innovative, humanitarian, and independent. They are visionaries who march to the beat of their own drum and value authenticity.'
    },
    'Pisces': {
        sign: 'Pisces',
        dates: 'February 19 - March 20',
        element: 'Water',
        color: 'Mauve, Lilac, Purple, Violet, Sea green',
        quality: 'Mutable',
        day: 'Thursday',
        ruler: 'Neptune, Jupiter',
        compatibility: 'Cancer, Scorpio',
        luckyNumbers: '3, 9, 12, 15, 18, 24',
        strengths: 'Compassionate, artistic, intuitive, gentle, wise, musical',
        weaknesses: 'Fearful, overly trusting, sad, desire to escape reality, can be a victim or a martyr',
        likes: 'Being alone, sleeping, music, romance, visual media, swimming, spiritual themes',
        dislikes: 'Know-it-all, being criticized, the past coming back to haunt, cruelty of any kind',
        loveLife: 'Pisces is deeply romantic and empathetic in love. They seek spiritual and emotional connection, offering unconditional love and compassion to their partners.',
        personality: 'Pisces is intuitive, compassionate, and artistic. They are dreamers with deep emotional sensitivity and a strong connection to the spiritual realm.'
    }
};

export function getZodiacInfo(zodiacSign: string): ZodiacInfo | null {
    return ZODIAC_DATABASE[zodiacSign] || null;
}

// Get zodiac sign from month and day
export function getZodiacSign(month: number, day: number): string {
    // month is 1-12, day is 1-31
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces'; // Feb 19 - Mar 20
}

export type ZodiacSign = keyof typeof ZODIAC_DATABASE;
