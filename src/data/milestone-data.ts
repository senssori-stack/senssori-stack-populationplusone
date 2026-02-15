// src/data/milestone-data.ts
// ═══════════════════════════════════════════════════════════════════
// CDC-aligned Baby Developmental Milestones (Birth → 5 years)
// Categories: Physical, Cognitive, Language, Social/Emotional, Fine Motor
// ═══════════════════════════════════════════════════════════════════

export type MilestoneCategory = 'physical' | 'cognitive' | 'language' | 'social' | 'fine_motor';

export interface Milestone {
    id: string;
    title: string;
    description: string;
    category: MilestoneCategory;
    /** Typical age range in months: [earliest, latest] */
    ageRangeMonths: [number, number];
    /** Month by which most children achieve this */
    typicalMonth: number;
    /** If not achieved by this month, flag for concern */
    concernMonth: number;
    /** Emoji icon */
    emoji: string;
    /** Tip for parents to encourage this milestone */
    parentTip: string;
    /** When to talk to the doctor */
    doctorNote: string;
    /** Fun fact or educational tidbit */
    funFact?: string;
}

export interface AgeGroup {
    id: string;
    label: string;
    monthRange: [number, number];
    emoji: string;
    color: string;
    description: string;
    milestones: Milestone[];
}

// ── Category metadata ────────────────────────────────────────────

export const CATEGORY_META: Record<MilestoneCategory, { label: string; emoji: string; color: string }> = {
    physical: { label: 'Physical', emoji: '🏃', color: '#FF6B6B' },
    cognitive: { label: 'Cognitive', emoji: '🧠', color: '#4ECDC4' },
    language: { label: 'Language', emoji: '🗣️', color: '#FFD93D' },
    social: { label: 'Social & Emotional', emoji: '💛', color: '#FF69B4' },
    fine_motor: { label: 'Fine Motor', emoji: '✋', color: '#6BCB77' },
};

// ── Badges & rewards system ──────────────────────────────────────

export interface Badge {
    id: string;
    name: string;
    emoji: string;
    description: string;
    requirement: string;
    /** Number of milestones or days required */
    threshold: number;
    color: string;
}

export const BADGES: Badge[] = [
    { id: 'first_step', name: 'First Step', emoji: '🌟', description: 'Logged your very first milestone!', requirement: 'milestones_logged', threshold: 1, color: '#FFD700' },
    { id: 'high_five', name: 'High Five', emoji: '🖐️', description: 'Logged 5 milestones!', requirement: 'milestones_logged', threshold: 5, color: '#FF6B6B' },
    { id: 'perfect_ten', name: 'Perfect 10', emoji: '🔟', description: '10 milestones tracked!', requirement: 'milestones_logged', threshold: 10, color: '#4ECDC4' },
    { id: 'quarter_century', name: 'Quarter Century', emoji: '🏅', description: '25 milestones — incredible!', requirement: 'milestones_logged', threshold: 25, color: '#9B59B6' },
    { id: 'half_century', name: 'Half Century', emoji: '🥇', description: '50 milestones logged!', requirement: 'milestones_logged', threshold: 50, color: '#E74C3C' },
    { id: 'century_club', name: 'Century Club', emoji: '💯', description: 'All 100+ milestones tracked!', requirement: 'milestones_logged', threshold: 100, color: '#1ABC9C' },
    { id: 'week_streak', name: 'Week Warrior', emoji: '🔥', description: '7-day check-in streak!', requirement: 'streak_days', threshold: 7, color: '#FF9800' },
    { id: 'month_streak', name: 'Monthly Maven', emoji: '📅', description: '30-day check-in streak!', requirement: 'streak_days', threshold: 30, color: '#E91E63' },
    { id: 'quarter_streak', name: 'Quarterly Champ', emoji: '🏆', description: '90-day streak — amazing dedication!', requirement: 'streak_days', threshold: 90, color: '#FFD700' },
    { id: 'physical_star', name: 'Physical Star', emoji: '⭐', description: 'All physical milestones for one age group completed!', requirement: 'category_complete', threshold: 1, color: '#FF6B6B' },
    { id: 'brainiac', name: 'Little Brainiac', emoji: '🧩', description: 'All cognitive milestones for one age group completed!', requirement: 'category_complete', threshold: 1, color: '#4ECDC4' },
    { id: 'chatterbox', name: 'Chatterbox', emoji: '💬', description: 'All language milestones for one age group completed!', requirement: 'category_complete', threshold: 1, color: '#FFD93D' },
    { id: 'social_butterfly', name: 'Social Butterfly', emoji: '🦋', description: 'All social milestones for one age group completed!', requirement: 'category_complete', threshold: 1, color: '#FF69B4' },
    { id: 'age_complete', name: 'Age Champion', emoji: '🎯', description: 'Completed ALL milestones in an age group!', requirement: 'age_group_complete', threshold: 1, color: '#2196F3' },
    { id: 'early_bird', name: 'Early Bird', emoji: '🐣', description: 'Logged a milestone before the typical age!', requirement: 'early_milestone', threshold: 1, color: '#8BC34A' },
    { id: 'photo_star', name: 'Photo Star', emoji: '📸', description: 'Added photos to 10 milestones!', requirement: 'photos_added', threshold: 10, color: '#00BCD4' },
];

// ── Weekly tips (rotating) ───────────────────────────────────────

export const WEEKLY_TIPS: { ageMonths: number; tip: string; source: string }[] = [
    { ageMonths: 0, tip: 'Tummy time! Start with 3-5 minutes, 2-3 times daily. It builds neck and shoulder muscles.', source: 'AAP' },
    { ageMonths: 0, tip: 'Skin-to-skin contact helps regulate your baby\'s temperature, heart rate, and breathing.', source: 'WHO' },
    { ageMonths: 1, tip: 'Talk to your baby constantly — narrate your day! This builds neural pathways for language.', source: 'CDC' },
    { ageMonths: 2, tip: 'Black and white patterns fascinate newborns. Hold high-contrast images 8-12 inches from their face.', source: 'AAP' },
    { ageMonths: 3, tip: 'Your baby can now see color! Introduce colorful toys and watch their eyes track movement.', source: 'CDC' },
    { ageMonths: 4, tip: 'Read aloud every day — even if it\'s the newspaper! Babies absorb language rhythm and tone.', source: 'AAP' },
    { ageMonths: 5, tip: 'Offer safe objects to grasp and mouth. This is how babies explore and learn about textures.', source: 'CDC' },
    { ageMonths: 6, tip: 'Introducing solid foods? Start with iron-fortified cereals or pureed veggies. One new food every 3-5 days.', source: 'AAP' },
    { ageMonths: 7, tip: 'Play peekaboo! It teaches object permanence — that things still exist when hidden.', source: 'CDC' },
    { ageMonths: 8, tip: 'Stranger anxiety is normal at this age. It means your baby has formed healthy attachments.', source: 'AAP' },
    { ageMonths: 9, tip: 'Point at things and name them. "Look, a dog!" This builds vocabulary even before they can speak.', source: 'CDC' },
    { ageMonths: 10, tip: 'Let your baby help turn pages during reading time. It builds fine motor skills and love of books.', source: 'AAP' },
    { ageMonths: 11, tip: 'Wave bye-bye and clap hands with your baby. Imitation is a powerful learning tool.', source: 'CDC' },
    { ageMonths: 12, tip: 'First birthday! Your baby\'s brain has doubled in size. Every interaction has been building connections.', source: 'AAP' },
    { ageMonths: 15, tip: 'Toddlers learn by watching you. Model behaviors you want to see — manners, gentle touch, kindness.', source: 'CDC' },
    { ageMonths: 18, tip: 'Vocabulary explosion time! Most toddlers know 10-50 words. Keep naming everything around them.', source: 'AAP' },
    { ageMonths: 24, tip: 'Two-word phrases starting! "More milk," "Daddy go." Repeat and expand: "Yes, Daddy is going to work!"', source: 'CDC' },
    { ageMonths: 30, tip: 'Imaginative play blooms now. Join in! "Is that a pirate ship? Where are we sailing?"', source: 'AAP' },
    { ageMonths: 36, tip: 'Your child can follow 2-3 step instructions now. "Pick up the book AND put it on the shelf."', source: 'CDC' },
    { ageMonths: 48, tip: 'Pre-reading skills are forming. Point to words as you read, let them "read" familiar books to you.', source: 'AAP' },
    { ageMonths: 60, tip: 'Your child is ready for kindergarten concepts! Count objects, practice writing their name, sort by color.', source: 'CDC' },
];

// ── The milestone database ──────────────────────────────────────

export const AGE_GROUPS: AgeGroup[] = [
    // ════════════════════════════════════
    // 0-2 MONTHS
    // ════════════════════════════════════
    {
        id: 'newborn',
        label: 'Newborn (0-2 months)',
        monthRange: [0, 2],
        emoji: '🍼',
        color: '#FFB6C1',
        description: 'Your baby is discovering the world! Focus on bonding, feeding, and lots of snuggles.',
        milestones: [
            {
                id: 'nb_lift_head', title: 'Lifts Head Briefly', description: 'Can lift head momentarily when on tummy',
                category: 'physical', ageRangeMonths: [0, 2], typicalMonth: 1, concernMonth: 3,
                emoji: '💪', parentTip: 'Daily tummy time (even just a few minutes) helps build neck muscles!',
                doctorNote: 'If baby cannot lift head at all by 3 months, mention to your pediatrician.',
                funFact: 'A newborn\'s head is about 1/4 of their total body length!'
            },
            {
                id: 'nb_reflex_grip', title: 'Reflexive Grip', description: 'Grasps your finger when placed in palm',
                category: 'fine_motor', ageRangeMonths: [0, 1], typicalMonth: 0, concernMonth: 2,
                emoji: '🤝', parentTip: 'Place your finger in baby\'s palm — they\'ll grip automatically. It\'s a beautiful reflex!',
                doctorNote: 'This reflex is present at birth. If absent, your pediatrician will check at the newborn visit.',
            },
            {
                id: 'nb_focus_face', title: 'Focuses on Faces', description: 'Can focus on a face within 8-12 inches',
                category: 'cognitive', ageRangeMonths: [0, 1], typicalMonth: 0, concernMonth: 2,
                emoji: '👀', parentTip: 'Hold your face close (8-12 inches) and make slow, exaggerated expressions. Baby loves it!',
                doctorNote: 'If baby doesn\'t seem to look at faces or make eye contact by 2 months, bring it up at your visit.',
            },
            {
                id: 'nb_coos', title: 'Makes Sounds (Cooing)', description: 'Starts making "ooh" and "aah" sounds',
                category: 'language', ageRangeMonths: [1, 3], typicalMonth: 2, concernMonth: 4,
                emoji: '🗣️', parentTip: 'When baby coos, coo back! This "conversation" teaches them about turn-taking in communication.',
                doctorNote: 'If baby is completely silent (no sounds at all) by 3-4 months, let your doctor know.',
            },
            {
                id: 'nb_social_smile', title: 'First Social Smile', description: 'Smiles in response to your voice or face',
                category: 'social', ageRangeMonths: [1, 3], typicalMonth: 2, concernMonth: 4,
                emoji: '😊', parentTip: 'Smile and talk to your baby — that first real smile back is one of parenting\'s greatest moments!',
                doctorNote: 'Most babies smile socially by 2-3 months. If no smiling by 4 months, discuss with your pediatrician.',
                funFact: 'Babies can distinguish their mother\'s voice from other voices within days of birth!'
            },
            {
                id: 'nb_tracks_objects', title: 'Tracks Moving Objects', description: 'Eyes follow a slow-moving object or face',
                category: 'cognitive', ageRangeMonths: [1, 3], typicalMonth: 2, concernMonth: 4,
                emoji: '🎯', parentTip: 'Slowly move a colorful toy across baby\'s field of vision. Watch those eyes follow!',
                doctorNote: 'If baby doesn\'t track objects or faces with eyes by 4 months, mention to your doctor.',
            },
            {
                id: 'nb_startles_sound', title: 'Startles to Loud Sounds', description: 'Reacts to loud noises with a startle reflex',
                category: 'cognitive', ageRangeMonths: [0, 1], typicalMonth: 0, concernMonth: 1,
                emoji: '🔊', parentTip: 'A healthy startle reflex means hearing is developing normally. Don\'t worry — it\'s a good sign!',
                doctorNote: 'If baby doesn\'t react to loud sounds at all, a hearing screening should be done.',
            },
        ]
    },

    // ════════════════════════════════════
    // 3-4 MONTHS
    // ════════════════════════════════════
    {
        id: 'infant_early',
        label: 'Early Infant (3-4 months)',
        monthRange: [3, 4],
        emoji: '👶',
        color: '#87CEEB',
        description: 'Baby is becoming more alert and interactive! Lots of smiles, sounds, and reaching ahead.',
        milestones: [
            {
                id: '3m_holds_head', title: 'Holds Head Steady', description: 'Holds head upright and steady when held',
                category: 'physical', ageRangeMonths: [3, 4], typicalMonth: 3, concernMonth: 5,
                emoji: '🦒', parentTip: 'Hold baby upright against your shoulder — they\'re practicing head control!',
                doctorNote: 'If head is still very floppy and unsupported by 5 months, talk to your pediatrician.',
            },
            {
                id: '3m_pushes_up', title: 'Pushes Up on Arms', description: 'Raises head and chest when on tummy',
                category: 'physical', ageRangeMonths: [3, 5], typicalMonth: 4, concernMonth: 6,
                emoji: '💪', parentTip: 'Place a small mirror in front of baby during tummy time — they love looking at "the other baby"!',
                doctorNote: 'If baby cannot push up on arms during tummy time by 6 months, discuss with your doctor.',
            },
            {
                id: '3m_reaches', title: 'Reaches for Toys', description: 'Reaches out to grab nearby objects',
                category: 'fine_motor', ageRangeMonths: [3, 5], typicalMonth: 4, concernMonth: 6,
                emoji: '🧸', parentTip: 'Dangle interesting toys within reach. Let them bat at objects hanging from a play gym!',
                doctorNote: 'If baby shows no interest in reaching for objects by 5-6 months, let your doctor know.',
            },
            {
                id: '3m_laughs', title: 'Laughs Out Loud', description: 'First real belly laugh!',
                category: 'social', ageRangeMonths: [3, 5], typicalMonth: 4, concernMonth: 6,
                emoji: '😂', parentTip: 'Make funny faces, play peekaboo, or gently tickle their tummy. That first laugh is pure magic!',
                doctorNote: 'If baby hasn\'t laughed or shown joyful reactions by 6 months, mention it at your next visit.',
                funFact: 'Babies laugh about 300 times a day — adults only about 20!'
            },
            {
                id: '3m_babbles', title: 'Babbling Begins', description: 'Makes consonant-vowel sounds like "ba" and "ga"',
                category: 'language', ageRangeMonths: [3, 6], typicalMonth: 4, concernMonth: 7,
                emoji: '💬', parentTip: 'Babble back! When baby says "ba ba," repeat it and add: "Ba ba! Ball! Do you see the ball?"',
                doctorNote: 'If baby isn\'t making any babbling sounds by 7 months, a speech evaluation may be helpful.',
            },
            {
                id: '3m_brings_hands', title: 'Brings Hands Together', description: 'Puts hands together at midline',
                category: 'fine_motor', ageRangeMonths: [3, 5], typicalMonth: 3, concernMonth: 5,
                emoji: '👏', parentTip: 'Gently guide baby\'s hands together and play patty-cake!',
                doctorNote: 'If baby keeps hands fisted and doesn\'t bring them together by 5 months, discuss with your doctor.',
            },
            {
                id: '3m_recognizes_parents', title: 'Recognizes Parents', description: 'Shows excitement when seeing familiar people',
                category: 'social', ageRangeMonths: [3, 5], typicalMonth: 3, concernMonth: 5,
                emoji: '❤️', parentTip: 'Notice how baby kicks and coos when they see you? That\'s recognition and love forming!',
                doctorNote: 'If baby shows no difference in response between familiar and unfamiliar people by 5 months, mention it.',
            },
        ]
    },

    // ════════════════════════════════════
    // 5-6 MONTHS
    // ════════════════════════════════════
    {
        id: 'infant_mid',
        label: 'Infant (5-6 months)',
        monthRange: [5, 6],
        emoji: '🌸',
        color: '#DDA0DD',
        description: 'Rolling, sitting, and exploring! Baby is becoming much more mobile and curious.',
        milestones: [
            {
                id: '5m_rolls', title: 'Rolls Over', description: 'Rolls from tummy to back (and back to tummy)',
                category: 'physical', ageRangeMonths: [4, 7], typicalMonth: 5, concernMonth: 7,
                emoji: '🔄', parentTip: 'Always place baby on their back to sleep, but give lots of free floor time for rolling practice!',
                doctorNote: 'If baby cannot roll in either direction by 7 months, discuss with your pediatrician.',
                funFact: 'Most babies roll tummy-to-back first because it\'s easier!'
            },
            {
                id: '5m_sits_support', title: 'Sits with Support', description: 'Can sit upright with hands or pillow support',
                category: 'physical', ageRangeMonths: [4, 7], typicalMonth: 5, concernMonth: 7,
                emoji: '🪑', parentTip: 'Prop baby with pillows and play in front of them. This view of the world is brand new and exciting!',
                doctorNote: 'If baby can\'t sit with support by 7 months, talk to your doctor about core strength.',
            },
            {
                id: '5m_transfers', title: 'Transfers Objects', description: 'Passes a toy from one hand to the other',
                category: 'fine_motor', ageRangeMonths: [5, 7], typicalMonth: 6, concernMonth: 8,
                emoji: '🔀', parentTip: 'Give baby a block in each hand. Watch them figure out how to hold one and grab another!',
                doctorNote: 'If baby only uses one hand and ignores the other by 8 months, mention it to your doctor.',
            },
            {
                id: '5m_responds_name', title: 'Responds to Name', description: 'Turns head when you call their name',
                category: 'language', ageRangeMonths: [5, 8], typicalMonth: 6, concernMonth: 9,
                emoji: '📢', parentTip: 'Use baby\'s name frequently throughout the day. "Good morning, Emma! Emma is hungry!"',
                doctorNote: 'If baby consistently doesn\'t respond to their name by 9 months, a developmental screen may be warranted.',
            },
            {
                id: '5m_stranger_anxiety', title: 'Stranger Awareness', description: 'Shows caution around unfamiliar people',
                category: 'social', ageRangeMonths: [5, 9], typicalMonth: 7, concernMonth: 10,
                emoji: '🫣', parentTip: 'Stranger anxiety is healthy! It means baby has formed a strong attachment to you. Be patient with it.',
                doctorNote: 'This is normal and expected. No concern unless baby shows zero difference between strangers and parents.',
                funFact: 'Stranger anxiety peaks around 12-18 months and gradually decreases.'
            },
            {
                id: '5m_object_permanence', title: 'Object Permanence', description: 'Looks for a partially hidden toy',
                category: 'cognitive', ageRangeMonths: [5, 8], typicalMonth: 6, concernMonth: 9,
                emoji: '🎩', parentTip: 'Play peekaboo and hide toys under a blanket. This teaches that things exist even when you can\'t see them!',
                doctorNote: 'If baby shows no interest in hidden objects by 9 months, bring it up with your doctor.',
            },
        ]
    },

    // ════════════════════════════════════
    // 7-9 MONTHS
    // ════════════════════════════════════
    {
        id: 'infant_late',
        label: 'Older Infant (7-9 months)',
        monthRange: [7, 9],
        emoji: '🌻',
        color: '#FFD700',
        description: 'Crawling, pulling up, and maybe first words! Baby is on the move and super curious.',
        milestones: [
            {
                id: '7m_sits_alone', title: 'Sits Without Support', description: 'Sits independently without toppling',
                category: 'physical', ageRangeMonths: [6, 9], typicalMonth: 7, concernMonth: 10,
                emoji: '🧘', parentTip: 'Sitting opens up a whole new world! Place interesting toys just out of reach to encourage movement.',
                doctorNote: 'If baby cannot sit unsupported by 10 months, talk to your doctor about motor development.',
            },
            {
                id: '7m_crawls', title: 'Crawls', description: 'Moves across the floor on hands and knees (or scoots/army crawls)',
                category: 'physical', ageRangeMonths: [6, 10], typicalMonth: 8, concernMonth: 12,
                emoji: '🐛', parentTip: 'Baby-proof everything now! Get down on their level to spot hazards. Place toys across the room for motivation.',
                doctorNote: 'Some babies skip crawling entirely and go straight to walking. Discuss with your doctor if baby isn\'t mobile in any way by 12 months.',
                funFact: 'Not all babies crawl the same way — some scoot on their bottom, roll, or bear-walk!'
            },
            {
                id: '7m_pulls_up', title: 'Pulls to Stand', description: 'Pulls up to standing using furniture',
                category: 'physical', ageRangeMonths: [7, 12], typicalMonth: 9, concernMonth: 13,
                emoji: '🧗', parentTip: 'Make sure furniture is anchored! Baby will pull on everything. Offer sturdy, safe surfaces.',
                doctorNote: 'If baby shows no interest in standing or pulling up by 13 months, share your concern with your pediatrician.',
            },
            {
                id: '7m_pincer_grasp', title: 'Pincer Grasp Develops', description: 'Picks up small objects with thumb and forefinger',
                category: 'fine_motor', ageRangeMonths: [7, 10], typicalMonth: 9, concernMonth: 12,
                emoji: '🤏', parentTip: 'Cheerios or puffs on a high chair tray are perfect pincer grasp practice (and a tasty snack!).',
                doctorNote: 'If baby can\'t pick up small objects with two fingers by 12 months, mention it at your visit.',
            },
            {
                id: '7m_gestures', title: 'Uses Gestures', description: 'Waves bye-bye, reaches to be picked up',
                category: 'language', ageRangeMonths: [7, 12], typicalMonth: 9, concernMonth: 12,
                emoji: '👋', parentTip: 'Wave and say "bye-bye" every time someone leaves. Baby will learn to imitate these social gestures!',
                doctorNote: 'If baby uses no gestures (pointing, waving, reaching) by 12 months, talk to your doctor.',
            },
            {
                id: '7m_cause_effect', title: 'Understands Cause & Effect', description: 'Drops toys to see what happens, pushes buttons',
                category: 'cognitive', ageRangeMonths: [7, 10], typicalMonth: 8, concernMonth: 12,
                emoji: '🔘', parentTip: '"Uh oh!" games are learning games. When baby drops a spoon, they\'re experimenting with gravity!',
                doctorNote: 'If baby shows no interest in how objects work (pressing, banging) by 12 months, discuss with your doctor.',
            },
            {
                id: '7m_separation_anxiety', title: 'Separation Anxiety', description: 'Clings to familiar caregivers, cries when parent leaves',
                category: 'social', ageRangeMonths: [7, 12], typicalMonth: 8, concernMonth: 14,
                emoji: '🥺', parentTip: 'Always say goodbye (even if baby cries). Sneaking out makes anxiety worse. They need to learn you always come back.',
                doctorNote: 'Separation anxiety is normal and healthy. It usually peaks at 12-18 months and resolves by 3-4 years.',
            },
        ]
    },

    // ════════════════════════════════════
    // 10-12 MONTHS
    // ════════════════════════════════════
    {
        id: 'pre_toddler',
        label: 'Pre-Toddler (10-12 months)',
        monthRange: [10, 12],
        emoji: '🎂',
        color: '#FF69B4',
        description: 'Almost a toddler! First steps, first words, and a tiny personality is shining through.',
        milestones: [
            {
                id: '10m_cruises', title: 'Cruises Along Furniture', description: 'Walks while holding onto furniture',
                category: 'physical', ageRangeMonths: [9, 13], typicalMonth: 10, concernMonth: 14,
                emoji: '🚶', parentTip: 'Arrange furniture in a path so baby can "cruise" from one piece to the next!',
                doctorNote: 'If baby isn\'t cruising or showing interest in standing/walking by 14 months, discuss with your doctor.',
            },
            {
                id: '10m_first_steps', title: 'First Steps! 🎉', description: 'Takes first independent steps',
                category: 'physical', ageRangeMonths: [9, 15], typicalMonth: 12, concernMonth: 18,
                emoji: '👣', parentTip: 'Get low and open your arms. Place baby\'s hands on a walker toy. Let them set the pace — every baby is different!',
                doctorNote: 'The range for first steps is wide (9-18 months). If no walking by 18 months, your pediatrician will want to evaluate.',
                funFact: 'The average toddler takes 2,368 steps per hour and falls 17 times per hour when learning to walk!'
            },
            {
                id: '10m_first_words', title: 'First Words', description: 'Says "mama," "dada," or another meaningful word',
                category: 'language', ageRangeMonths: [9, 14], typicalMonth: 12, concernMonth: 15,
                emoji: '🎤', parentTip: 'Repeat single words clearly and often. "Ball. That\'s a ball. Do you want the ball?"',
                doctorNote: 'If baby has no words at all by 15 months (not even "mama" or "dada"), request a speech evaluation.',
                funFact: 'Babies understand about 50 words before they say their first one!'
            },
            {
                id: '10m_points', title: 'Points at Things', description: 'Points to show you something interesting',
                category: 'language', ageRangeMonths: [9, 14], typicalMonth: 12, concernMonth: 15,
                emoji: '👆', parentTip: 'When baby points, respond enthusiastically! "You see the bird! Yes, that\'s a bird!" This builds vocabulary.',
                doctorNote: 'Pointing is a critical communication milestone. If absent by 15 months, talk to your pediatrician.',
            },
            {
                id: '10m_follows_simple', title: 'Follows Simple Instructions', description: 'Understands "give me" or "come here"',
                category: 'cognitive', ageRangeMonths: [10, 14], typicalMonth: 12, concernMonth: 15,
                emoji: '📋', parentTip: 'Give simple, one-step directions: "Give me the cup." Celebrate when they do it!',
                doctorNote: 'If baby doesn\'t seem to understand any simple commands by 15 months, discuss with your doctor.',
            },
            {
                id: '10m_claps', title: 'Claps Hands', description: 'Claps hands when excited or to copy you',
                category: 'social', ageRangeMonths: [9, 12], typicalMonth: 10, concernMonth: 14,
                emoji: '👏', parentTip: 'Celebrate EVERYTHING with clapping. Baby scored a puff into their mouth? Clap! It builds joy and imitation.',
                doctorNote: 'If baby doesn\'t imitate any actions by 12 months, mention it at your well-child visit.',
            },
            {
                id: '10m_stacks', title: 'Stacks 2 Blocks', description: 'Can stack one block on top of another',
                category: 'fine_motor', ageRangeMonths: [10, 15], typicalMonth: 12, concernMonth: 16,
                emoji: '🧱', parentTip: 'Start with big, soft blocks. Stack them up, let baby knock them down. Then encourage them to stack!',
                doctorNote: 'If baby can\'t stack even 2 objects by 16 months, discuss fine motor skills with your doctor.',
            },
        ]
    },

    // ════════════════════════════════════
    // 13-18 MONTHS
    // ════════════════════════════════════
    {
        id: 'young_toddler',
        label: 'Young Toddler (13-18 months)',
        monthRange: [13, 18],
        emoji: '🌈',
        color: '#98FB98',
        description: 'Walking, talking, and asserting independence! The toddler adventure begins.',
        milestones: [
            {
                id: '13m_walks_well', title: 'Walks Well', description: 'Walks independently with good balance',
                category: 'physical', ageRangeMonths: [12, 18], typicalMonth: 14, concernMonth: 18,
                emoji: '🚶', parentTip: 'Shoes aren\'t needed indoors! Barefoot walking helps develop foot muscles and balance.',
                doctorNote: 'If not walking independently by 18 months, your pediatrician will want to evaluate.',
            },
            {
                id: '13m_climbs', title: 'Climbs on Furniture', description: 'Climbs onto chairs, sofas, and low structures',
                category: 'physical', ageRangeMonths: [12, 18], typicalMonth: 15, concernMonth: 20,
                emoji: '🧗', parentTip: 'You can\'t stop the climbing — redirect it! Provide safe climbing structures or use sofa cushions on the floor.',
                doctorNote: 'Climbing is normal and healthy. Focus on making the environment safe for exploration.',
            },
            {
                id: '13m_10_words', title: 'Uses 10+ Words', description: 'Has a vocabulary of at least 10 words',
                category: 'language', ageRangeMonths: [13, 20], typicalMonth: 18, concernMonth: 21,
                emoji: '📖', parentTip: 'Words like "ba" for bottle count! Name everything. Read together daily. Sing simple songs.',
                doctorNote: 'If your child has fewer than 5 words by 18 months, request a speech-language evaluation. Early intervention works!',
            },
            {
                id: '13m_scribbles', title: 'Scribbles with Crayon', description: 'Makes marks on paper with a crayon',
                category: 'fine_motor', ageRangeMonths: [13, 18], typicalMonth: 15, concernMonth: 20,
                emoji: '🖍️', parentTip: 'Tape paper to the table and give chunky crayons. Let them go wild! This is the start of writing.',
                doctorNote: 'If toddler shows no interest in making marks or holding implements by 20 months, discuss with your doctor.',
            },
            {
                id: '13m_pretend_play', title: 'Pretend Play Begins', description: 'Pretends to feed a doll or talk on a phone',
                category: 'cognitive', ageRangeMonths: [14, 20], typicalMonth: 16, concernMonth: 22,
                emoji: '🎭', parentTip: 'Give baby a toy phone, a doll, or toy food. Model pretend play: "Let\'s feed the teddy!"',
                doctorNote: 'If no pretend or symbolic play by 22 months, this is worth discussing with your pediatrician.',
            },
            {
                id: '13m_uses_spoon', title: 'Uses Spoon/Fork', description: 'Attempts to feed self with utensils',
                category: 'fine_motor', ageRangeMonths: [12, 18], typicalMonth: 15, concernMonth: 20,
                emoji: '🥄', parentTip: 'Yes, it will be messy! Let them practice. Pre-load the spoon with food and hand it to them.',
                doctorNote: 'If toddler shows no interest in self-feeding or holding utensils by 20 months, mention it.',
            },
            {
                id: '13m_shows_empathy', title: 'Shows Early Empathy', description: 'Looks concerned when someone cries, may try to comfort',
                category: 'social', ageRangeMonths: [14, 20], typicalMonth: 16, concernMonth: 22,
                emoji: '🤗', parentTip: 'Model empathy: "Oh no, your friend is sad. Let\'s give them a hug." This builds emotional intelligence.',
                doctorNote: 'If toddler shows no recognition of others\' emotions by 22 months, discuss at your next visit.',
            },
        ]
    },

    // ════════════════════════════════════
    // 19-24 MONTHS
    // ════════════════════════════════════
    {
        id: 'toddler',
        label: 'Toddler (19-24 months)',
        monthRange: [19, 24],
        emoji: '⭐',
        color: '#FF7F50',
        description: 'Two-word sentences, running, and a growing sense of self. Welcome to the "terrible twos" (they\'re actually terrific!).',
        milestones: [
            {
                id: '19m_runs', title: 'Runs', description: 'Can run (though may still be wobbly!)',
                category: 'physical', ageRangeMonths: [18, 24], typicalMonth: 20, concernMonth: 26,
                emoji: '🏃', parentTip: 'Chase games in a safe space are perfect for burning energy and building coordination!',
                doctorNote: 'If toddler can\'t run or jog by 26 months, discuss gross motor development with your doctor.',
            },
            {
                id: '19m_kicks_ball', title: 'Kicks a Ball', description: 'Can kick a ball forward',
                category: 'physical', ageRangeMonths: [18, 26], typicalMonth: 22, concernMonth: 28,
                emoji: '⚽', parentTip: 'Roll a ball to your toddler and show them how to kick it. Make it a fun game!',
                doctorNote: 'If your child can\'t kick a ball forward by 28 months, mention it at your next appointment.',
            },
            {
                id: '19m_two_words', title: 'Two-Word Phrases', description: 'Combines two words like "more milk" or "daddy go"',
                category: 'language', ageRangeMonths: [18, 26], typicalMonth: 22, concernMonth: 27,
                emoji: '💬', parentTip: 'Expand on their phrases: "More milk? You want MORE MILK? Here\'s your milk!"',
                doctorNote: 'If your child isn\'t combining any words by 24-27 months, ask for a speech-language evaluation.',
                funFact: 'Between 18-24 months, toddlers learn an average of 1-2 new words per day!'
            },
            {
                id: '19m_50_words', title: '50+ Word Vocabulary', description: 'Uses at least 50 words',
                category: 'language', ageRangeMonths: [18, 26], typicalMonth: 24, concernMonth: 27,
                emoji: '📚', parentTip: 'Keep a list of all the words your toddler uses — you\'ll be amazed how quickly it grows!',
                doctorNote: 'If fewer than 20 words by 24 months, early speech intervention can make a huge difference.',
            },
            {
                id: '19m_sorts_shapes', title: 'Sorts Shapes & Colors', description: 'Can match shapes in a sorter, sorts by color',
                category: 'cognitive', ageRangeMonths: [18, 26], typicalMonth: 22, concernMonth: 28,
                emoji: '🔺', parentTip: 'Shape sorters, stacking rings, and color-matching games are perfect for this age!',
                doctorNote: 'If toddler can\'t match any shapes by 28 months, let your doctor know.',
            },
            {
                id: '19m_parallel_play', title: 'Parallel Play', description: 'Plays alongside other children (not yet with them)',
                category: 'social', ageRangeMonths: [18, 26], typicalMonth: 22, concernMonth: 30,
                emoji: '👫', parentTip: 'Don\'t force sharing yet — parallel play (playing near but not with) is developmentally normal!',
                doctorNote: 'If toddler shows no awareness of other children at all by 30 months, discuss with your pediatrician.',
            },
            {
                id: '19m_builds_tower', title: 'Builds 4-6 Block Tower', description: 'Stacks 4-6 blocks into a tower',
                category: 'fine_motor', ageRangeMonths: [18, 26], typicalMonth: 22, concernMonth: 28,
                emoji: '🏗️', parentTip: 'Build towers together, then let them knock it down! Rebuilding practices patience and fine motor skills.',
                doctorNote: 'If your child can\'t stack 3+ blocks by 28 months, mention fine motor development to your doctor.',
            },
        ]
    },

    // ════════════════════════════════════
    // 2-3 YEARS
    // ════════════════════════════════════
    {
        id: 'older_toddler',
        label: 'Older Toddler (2-3 years)',
        monthRange: [25, 36],
        emoji: '🌟',
        color: '#9B59B6',
        description: 'Complex sentences, imaginative play, potty training, and BIG emotions. Your toddler is becoming a little person!',
        milestones: [
            {
                id: '2y_jumps', title: 'Jumps with Both Feet', description: 'Can jump and land on both feet',
                category: 'physical', ageRangeMonths: [24, 30], typicalMonth: 26, concernMonth: 33,
                emoji: '🦘', parentTip: 'Jump on cushions, jump over lines on the ground. Make it a game!',
                doctorNote: 'If your child can\'t jump by 33 months, discuss gross motor development.',
            },
            {
                id: '2y_climbs_stairs', title: 'Climbs Stairs Alternating', description: 'Goes up stairs one foot per step',
                category: 'physical', ageRangeMonths: [24, 36], typicalMonth: 30, concernMonth: 38,
                emoji: '🪜', parentTip: 'Hold hands and practice going up and down stairs, one step at a time.',
                doctorNote: 'If still using same foot on every step by 38 months, mention to your doctor.',
            },
            {
                id: '2y_sentences', title: 'Speaks in Sentences', description: 'Uses 3-4 word sentences consistently',
                category: 'language', ageRangeMonths: [24, 36], typicalMonth: 30, concernMonth: 36,
                emoji: '🗣️', parentTip: 'Have conversations! Ask open-ended questions: "What did you do at the park?"',
                doctorNote: 'If not using 3+ word phrases by 36 months, speech therapy can help significantly.',
            },
            {
                id: '2y_potty_interest', title: 'Shows Potty Interest', description: 'Tells you about wet/dirty diaper, shows interest in toilet',
                category: 'cognitive', ageRangeMonths: [24, 36], typicalMonth: 28, concernMonth: 42,
                emoji: '🚽', parentTip: 'Let them watch you use the bathroom. Read potty books. Put a small potty in the bathroom. Don\'t force it!',
                doctorNote: 'Every child potty trains on their own timeline. Average is 2.5-3.5 years. Talk to your doctor if no interest by 3.5.',
                funFact: 'Girls typically potty train 2-3 months earlier than boys on average.'
            },
            {
                id: '2y_imaginative_play', title: 'Rich Imaginative Play', description: 'Creates elaborate pretend scenarios',
                category: 'cognitive', ageRangeMonths: [24, 36], typicalMonth: 30, concernMonth: 38,
                emoji: '🦸', parentTip: 'Enter their imaginative world! If they\'re a superhero, be their sidekick. Play is how children process the world.',
                doctorNote: 'If child shows no imaginative or pretend play by 38 months, discuss with your pediatrician.',
            },
            {
                id: '2y_names_colors', title: 'Names Colors', description: 'Can name at least 4-6 colors',
                category: 'cognitive', ageRangeMonths: [24, 36], typicalMonth: 30, concernMonth: 40,
                emoji: '🎨', parentTip: 'Point out colors everywhere! "Look at the RED fire truck!" "What color is YOUR cup?"',
                doctorNote: 'If child can\'t name any colors by 40 months, it may be worth checking for color vision issues.',
            },
            {
                id: '2y_plays_with_others', title: 'Plays WITH Other Kids', description: 'Engages in cooperative play, takes turns',
                category: 'social', ageRangeMonths: [27, 36], typicalMonth: 30, concernMonth: 40,
                emoji: '🤝', parentTip: 'Playdates with 1-2 kids at a time work best. Coach turn-taking: "First your turn, then their turn!"',
                doctorNote: 'If child shows no interest in playing with peers by 40 months, mention it.',
            },
            {
                id: '2y_manages_emotions', title: 'Begins Managing Emotions', description: 'Starts to calm down after tantrums with help',
                category: 'social', ageRangeMonths: [24, 36], typicalMonth: 30, concernMonth: 42,
                emoji: '🧘', parentTip: 'Name their emotions: "You\'re frustrated because you can\'t have a cookie. I understand." Validation is powerful.',
                doctorNote: 'If tantrums are extremely frequent (10+/day), last 30+ minutes, or are violent, talk to your pediatrician.',
            },
            {
                id: '2y_draws_circle', title: 'Draws a Circle', description: 'Can draw a rough circle shape',
                category: 'fine_motor', ageRangeMonths: [27, 36], typicalMonth: 30, concernMonth: 38,
                emoji: '⭕', parentTip: 'Draw circles together! "Can you draw a sun? A ball?" Celebrate their attempts.',
                doctorNote: 'If child can\'t make any circular marks by 38 months, discuss fine motor skills with your doctor.',
            },
        ]
    },

    // ════════════════════════════════════
    // 3-4 YEARS
    // ════════════════════════════════════
    {
        id: 'preschool_early',
        label: 'Early Preschool (3-4 years)',
        monthRange: [37, 48],
        emoji: '🎨',
        color: '#2196F3',
        description: 'Preschool-ready! Complex thinking, social skills blossoming, and motor skills becoming refined.',
        milestones: [
            {
                id: '3y_pedals_trike', title: 'Pedals Tricycle', description: 'Can ride a tricycle with pedals',
                category: 'physical', ageRangeMonths: [36, 48], typicalMonth: 36, concernMonth: 48,
                emoji: '🚲', parentTip: 'Start with a balance bike or tricycle. Let them practice in a safe, flat area.',
                doctorNote: 'If child can\'t pedal by 4 years, discuss coordination development.',
            },
            {
                id: '3y_hops', title: 'Hops on One Foot', description: 'Can hop on one foot a few times',
                category: 'physical', ageRangeMonths: [36, 48], typicalMonth: 42, concernMonth: 50,
                emoji: '🦩', parentTip: 'Make a hopping game! "Can you hop like a bunny? How many hops can you do?"',
                doctorNote: 'If child can\'t hop at all by 50 months, mention balance and coordination to your doctor.',
            },
            {
                id: '3y_tells_stories', title: 'Tells Stories', description: 'Can narrate a simple story or recount events',
                category: 'language', ageRangeMonths: [36, 48], typicalMonth: 40, concernMonth: 48,
                emoji: '📖', parentTip: 'Ask: "Tell me about your day!" or "What happened in that book?" Be an enthusiastic audience.',
                doctorNote: 'If child can\'t form multi-sentence narratives by 4 years, a speech eval may be helpful.',
            },
            {
                id: '3y_counts_10', title: 'Counts to 10', description: 'Can count objects up to 10',
                category: 'cognitive', ageRangeMonths: [36, 48], typicalMonth: 40, concernMonth: 50,
                emoji: '🔢', parentTip: 'Count everything! Steps, crackers, blocks, toes. Make counting part of everyday routines.',
                doctorNote: 'If child shows no interest in numbers or can\'t count to 5 by 50 months, mention it.',
            },
            {
                id: '3y_understands_mine', title: 'Understands "Mine" vs "Theirs"', description: 'Grasps the concept of ownership',
                category: 'social', ageRangeMonths: [36, 48], typicalMonth: 38, concernMonth: 48,
                emoji: '🎁', parentTip: 'Help them practice: "This is YOUR toy. This is Mommy\'s phone." Ownership understanding helps with sharing.',
                doctorNote: 'If child has no concept of personal property by 4 years, discuss with your doctor.',
            },
            {
                id: '3y_uses_scissors', title: 'Uses Scissors', description: 'Can cut paper with child-safe scissors',
                category: 'fine_motor', ageRangeMonths: [36, 48], typicalMonth: 40, concernMonth: 50,
                emoji: '✂️', parentTip: 'Start with child-safe scissors and playdough. Then move to cutting lines on paper.',
                doctorNote: 'If child can\'t snip with scissors by 50 months, fine motor therapy might help.',
            },
            {
                id: '3y_empathy_complex', title: 'Complex Empathy', description: 'Comforts upset friends, understands feelings of others',
                category: 'social', ageRangeMonths: [36, 48], typicalMonth: 42, concernMonth: 50,
                emoji: '❤️‍🩹', parentTip: 'Read books about feelings. Ask: "How do you think that character feels? Why?"',
                doctorNote: 'If child shows no understanding of others\' emotions by 50 months, bring it up at your visit.',
            },
        ]
    },

    // ════════════════════════════════════
    // 4-5 YEARS
    // ════════════════════════════════════
    {
        id: 'preschool_late',
        label: 'Late Preschool (4-5 years)',
        monthRange: [49, 60],
        emoji: '🎓',
        color: '#E91E63',
        description: 'Kindergarten-ready! Reading readiness, complex friendships, and growing independence.',
        milestones: [
            {
                id: '4y_catches_ball', title: 'Catches a Ball', description: 'Can catch a bounced ball most of the time',
                category: 'physical', ageRangeMonths: [48, 60], typicalMonth: 50, concernMonth: 60,
                emoji: '🥎', parentTip: 'Start with a big, soft ball from close range. Gradually increase distance.',
                doctorNote: 'If child can\'t catch a large ball at all by 5 years, discuss coordination with your doctor.',
            },
            {
                id: '4y_writes_name', title: 'Writes First Name', description: 'Can write their first name (may not be perfect!)',
                category: 'fine_motor', ageRangeMonths: [48, 60], typicalMonth: 52, concernMonth: 65,
                emoji: '✍️', parentTip: 'Practice writing their name on everything — art projects, birthday cards, the grocery list.',
                doctorNote: 'If child shows no interest in or ability to write any letters by 5.5 years, discuss with your doctor.',
            },
            {
                id: '4y_recognizes_letters', title: 'Recognizes Letters', description: 'Can identify most letters of the alphabet',
                category: 'cognitive', ageRangeMonths: [48, 60], typicalMonth: 52, concernMonth: 66,
                emoji: '🔤', parentTip: 'Letter magnets, alphabet puzzles, pointing out letters on signs. Make it a daily game!',
                doctorNote: 'If child can\'t recognize any letters by 5 years, mention it. Some children benefit from early literacy support.',
            },
            {
                id: '4y_rhyming', title: 'Understands Rhyming', description: 'Can identify and create simple rhymes',
                category: 'language', ageRangeMonths: [48, 60], typicalMonth: 52, concernMonth: 66,
                emoji: '🎶', parentTip: 'Sing nursery rhymes! Play the rhyming game: "What rhymes with cat? Hat, bat, mat!"',
                doctorNote: 'Difficulty with rhyming by ~5.5 years can sometimes indicate a reading difficulty. Mention it to your pediatrician.',
            },
            {
                id: '4y_complex_sentences', title: 'Uses Complex Sentences', description: 'Speaks in full, grammatically correct sentences using "because," "if," "when"',
                category: 'language', ageRangeMonths: [48, 60], typicalMonth: 50, concernMonth: 60,
                emoji: '🗣️', parentTip: 'Model complex sentences: "We\'re going inside BECAUSE it\'s raining." Ask "Why?" and "What if?" questions.',
                doctorNote: 'If speech is very difficult to understand by 4-5 years, a speech evaluation is recommended.',
            },
            {
                id: '4y_resolves_conflicts', title: 'Resolves Conflicts', description: 'Can negotiate or compromise with friends',
                category: 'social', ageRangeMonths: [48, 60], typicalMonth: 54, concernMonth: 66,
                emoji: '🕊️', parentTip: 'Coach problem-solving: "You both want the truck. What could you do?" Let them brainstorm solutions.',
                doctorNote: 'If child can\'t navigate any social conflicts by 5.5 years, social-emotional support may help.',
            },
            {
                id: '4y_dresses_self', title: 'Dresses Independently', description: 'Can put on most clothing with little help',
                category: 'fine_motor', ageRangeMonths: [48, 60], typicalMonth: 50, concernMonth: 62,
                emoji: '👕', parentTip: 'Lay out clothes the night before. Velcro shoes are great for independence! Let them pick outfits.',
                doctorNote: 'If child needs full help dressing by 5 years, discuss fine motor and independence skills.',
            },
            {
                id: '4y_understands_time', title: 'Understands Time Concepts', description: 'Knows yesterday/today/tomorrow, morning/afternoon/night',
                category: 'cognitive', ageRangeMonths: [48, 60], typicalMonth: 52, concernMonth: 66,
                emoji: '⏰', parentTip: 'Use time words in daily life: "TOMORROW we\'re going to the park. YESTERDAY we went to the store."',
                doctorNote: 'If child has no concept of time progression by 5.5 years, mention it at your next visit.',
            },
        ]
    },
];

// ── Helper: Get all milestones flat ──────────────────────────────

export function getAllMilestones(): Milestone[] {
    return AGE_GROUPS.flatMap(g => g.milestones);
}

// ── Helper: Get milestones for a baby's current age ──────────────

export function getMilestonesForAge(ageMonths: number): { current: AgeGroup | null; upcoming: AgeGroup | null; past: AgeGroup[] } {
    const sorted = [...AGE_GROUPS].sort((a, b) => a.monthRange[0] - b.monthRange[0]);
    let current: AgeGroup | null = null;
    let upcoming: AgeGroup | null = null;
    const past: AgeGroup[] = [];

    for (const group of sorted) {
        if (ageMonths >= group.monthRange[0] && ageMonths <= group.monthRange[1]) {
            current = group;
        } else if (ageMonths < group.monthRange[0] && !upcoming) {
            upcoming = group;
        } else if (ageMonths > group.monthRange[1]) {
            past.push(group);
        }
    }

    return { current, upcoming, past };
}

// ── Helper: Get tip for baby's age ───────────────────────────────

export function getTipForAge(ageMonths: number): { tip: string; source: string } {
    // Find the closest tip for this age
    const sorted = [...WEEKLY_TIPS].sort((a, b) => Math.abs(a.ageMonths - ageMonths) - Math.abs(b.ageMonths - ageMonths));
    return sorted[0] || { tip: 'Every moment with your baby is a learning opportunity!', source: 'P+1' };
}

// Total milestone count for progress tracking
export const TOTAL_MILESTONES = getAllMilestones().length;
