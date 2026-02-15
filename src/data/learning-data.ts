/**
 * learning-data.ts
 * 
 * Original educational content by Population +1
 * Alphabet, Numbers, Shapes & Colors learning data
 * Age-appropriate activities for babies through preschool (0-5 years)
 * 
 * Content authored by Population +1 — no external licensing required.
 * Teaching letters, numbers, shapes, and colors is universal knowledge.
 */

// ─── TYPES ──────────────────────────────────────────

export interface LetterData {
    letter: string;
    uppercase: string;
    lowercase: string;
    phonicSound: string;
    words: string[];         // 3 example words
    emoji: string;           // visual association
    funFact: string;
    activity: string;        // parent-child activity
    traceHint: string;       // how to draw/trace the letter
    ageIntroduced: string;   // when kids typically learn this
}

export interface NumberData {
    number: number;
    word: string;
    emoji: string;
    countingActivity: string;
    realWorldExample: string;
    funFact: string;
    fingerShow: string;      // how to show on fingers
    ageIntroduced: string;
}

export interface ShapeData {
    name: string;
    sides: number | string;
    emoji: string;
    realWorldExamples: string[];
    drawingTip: string;
    funFact: string;
}

export interface ColorData {
    name: string;
    hex: string;
    emoji: string;
    realWorldExamples: string[];
    mixingTip: string;
    funFact: string;
}

export interface LearningMilestone {
    id: string;
    ageRange: string;
    title: string;
    description: string;
    category: 'letters' | 'numbers' | 'shapes' | 'colors';
    emoji: string;
}

export interface LearningTip {
    id: number;
    title: string;
    tip: string;
    ageRange: string;
    emoji: string;
}

// ─── ALPHABET DATA ──────────────────────────────────

export const ALPHABET: LetterData[] = [
    {
        letter: 'A', uppercase: 'A', lowercase: 'a',
        phonicSound: 'ah (as in apple)',
        words: ['Apple', 'Ant', 'Airplane'],
        emoji: '🍎',
        funFact: 'A is the first letter of the alphabet and one of the first letters most children learn!',
        activity: 'Go on an "A Hunt" — walk around your home and find things that start with A.',
        traceHint: 'Two diagonal lines meeting at the top, with a bridge across the middle.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'B', uppercase: 'B', lowercase: 'b',
        phonicSound: 'buh (as in ball)',
        words: ['Ball', 'Bear', 'Banana'],
        emoji: '🏀',
        funFact: 'B is the first consonant in the alphabet. "Ba-ba" is often one of baby\'s first sounds!',
        activity: 'Bounce a ball and say "B-B-Ball!" each time it bounces.',
        traceHint: 'One straight line down, then two bumps on the right side.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'C', uppercase: 'C', lowercase: 'c',
        phonicSound: 'kuh (as in cat)',
        words: ['Cat', 'Car', 'Cookie'],
        emoji: '🐱',
        funFact: 'C can make two sounds — a hard "k" sound (cat) and a soft "s" sound (city).',
        activity: 'Draw a big C in the air with your finger. It looks like a moon!',
        traceHint: 'A curved line that opens to the right — like a half circle.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'D', uppercase: 'D', lowercase: 'd',
        phonicSound: 'duh (as in dog)',
        words: ['Dog', 'Duck', 'Door'],
        emoji: '🐕',
        funFact: '"Da-da" is one of the first words many babies say! D is a very important letter.',
        activity: 'Draw a D and turn it sideways — it looks like a smile!',
        traceHint: 'One straight line down, then one big bump on the right.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'E', uppercase: 'E', lowercase: 'e',
        phonicSound: 'eh (as in egg)',
        words: ['Egg', 'Elephant', 'Eye'],
        emoji: '🥚',
        funFact: 'E is the most commonly used letter in the English language!',
        activity: 'Find 5 things in your kitchen that have the letter E on them.',
        traceHint: 'One line down, then three lines sticking out to the right — top, middle, bottom.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'F', uppercase: 'F', lowercase: 'f',
        phonicSound: 'fff (as in fish)',
        words: ['Fish', 'Frog', 'Flower'],
        emoji: '🐟',
        funFact: 'F looks like E but without the bottom line — they are letter cousins!',
        activity: 'Make the "fff" sound and blow like a fan. Feel the air on your hand!',
        traceHint: 'One line down, then two lines to the right — at the top and middle.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'G', uppercase: 'G', lowercase: 'g',
        phonicSound: 'guh (as in goat)',
        words: ['Goat', 'Grapes', 'Guitar'],
        emoji: '🍇',
        funFact: 'G can make two sounds — a hard "g" (goat) and a soft "j" (giraffe).',
        activity: 'Growl like a bear — "Grrr!" That\'s the G sound!',
        traceHint: 'Like a C, but with a little shelf sticking inward at the middle.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'H', uppercase: 'H', lowercase: 'h',
        phonicSound: 'huh (as in hat)',
        words: ['Hat', 'House', 'Horse'],
        emoji: '🏠',
        funFact: 'H is a "breathy" letter — you can feel the air when you say it!',
        activity: 'Put your hand in front of your mouth and say "H" — feel the warm breath!',
        traceHint: 'Two lines standing tall with a bridge connecting them in the middle.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'I', uppercase: 'I', lowercase: 'i',
        phonicSound: 'ih (as in igloo)',
        words: ['Ice cream', 'Igloo', 'Insect'],
        emoji: '🍦',
        funFact: 'I is the thinnest uppercase letter — just one straight line with a hat and shoes!',
        activity: 'Stack blocks in a tower — it looks like the letter I!',
        traceHint: 'One straight line up and down, with short lines across the top and bottom.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'J', uppercase: 'J', lowercase: 'j',
        phonicSound: 'juh (as in jump)',
        words: ['Jump', 'Juice', 'Jellyfish'],
        emoji: '🧃',
        funFact: 'J was the last letter added to the alphabet! It wasn\'t used until the 1500s.',
        activity: 'Jump! Jump! Jump! Every time you jump, shout "J!"',
        traceHint: 'A curved line that hooks at the bottom, like a fishhook, with a dot on top for lowercase.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'K', uppercase: 'K', lowercase: 'k',
        phonicSound: 'kuh (as in kite)',
        words: ['Kite', 'King', 'Kangaroo'],
        emoji: '🪁',
        funFact: 'K and C often make the same sound! They are sound twins.',
        activity: 'Kick a ball and say "K-K-Kick!" to practice the K sound.',
        traceHint: 'One line down, then two angled lines meeting at the middle — like an arrow pointing right.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'L', uppercase: 'L', lowercase: 'l',
        phonicSound: 'lll (as in lion)',
        words: ['Lion', 'Leaf', 'Lemon'],
        emoji: '🦁',
        funFact: 'L is one of the easiest letters to write — it\'s just two lines!',
        activity: 'Stick your tongue out and say "La la la!" — feel where the L sound comes from.',
        traceHint: 'One line straight down, then one line going right at the bottom — like a corner.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'M', uppercase: 'M', lowercase: 'm',
        phonicSound: 'mmm (as in moon)',
        words: ['Moon', 'Monkey', 'Milk'],
        emoji: '🌙',
        funFact: '"Ma-ma" is one of the very first words babies speak around the world!',
        activity: 'Hum "Mmmmm!" like you\'re eating something delicious — that\'s the M sound!',
        traceHint: 'Two tall mountains side by side — down-up-down-up-down.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'N', uppercase: 'N', lowercase: 'n',
        phonicSound: 'nnn (as in nose)',
        words: ['Nose', 'Nest', 'Night'],
        emoji: '👃',
        funFact: 'N is M\'s little sibling — M has two humps, N has just one!',
        activity: 'Touch your nose and say "N-N-Nose!" — feel the vibration in your nose.',
        traceHint: 'One line down, a diagonal line going up, then another line down.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'O', uppercase: 'O', lowercase: 'o',
        phonicSound: 'ah (as in octopus)',
        words: ['Octopus', 'Orange', 'Owl'],
        emoji: '🐙',
        funFact: 'O is the oldest letter — it has looked almost the same for over 3,000 years!',
        activity: 'Make your mouth into an O shape and say "Ooooh!" Look in the mirror!',
        traceHint: 'A round circle — start at the top and curve all the way around.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'P', uppercase: 'P', lowercase: 'p',
        phonicSound: 'puh (as in pig)',
        words: ['Pig', 'Pizza', 'Penguin'],
        emoji: '🐷',
        funFact: 'P is a "popping" letter — put your hand in front of your lips and feel the pop of air!',
        activity: 'Pop bubbles and say "P!" every time one pops.',
        traceHint: 'One line straight down, with a bump at the top right.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'Q', uppercase: 'Q', lowercase: 'q',
        phonicSound: 'kwuh (as in queen)',
        words: ['Queen', 'Quilt', 'Question'],
        emoji: '👑',
        funFact: 'Q is almost always followed by the letter U — they are best friends!',
        activity: 'Wrap up in a blanket like a quilt and talk about the letter Q!',
        traceHint: 'Like an O, but with a little tail at the bottom right.',
        ageIntroduced: '4-5 years',
    },
    {
        letter: 'R', uppercase: 'R', lowercase: 'r',
        phonicSound: 'rrr (as in rain)',
        words: ['Rain', 'Rabbit', 'Rainbow'],
        emoji: '🌈',
        funFact: 'R is the "growling" letter — dogs say "Rrruff!" with an R sound!',
        activity: 'Pretend to be a pirate and say "Arrrr!" to practice the R sound.',
        traceHint: 'Like P (line and bump), but with a leg kicking out at the bottom right.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'S', uppercase: 'S', lowercase: 's',
        phonicSound: 'sss (as in sun)',
        words: ['Sun', 'Star', 'Snake'],
        emoji: '☀️',
        funFact: 'S is the "snake" letter — snakes hiss "Ssssss!"',
        activity: 'Slither on the floor like a snake and hiss "Sssss!"',
        traceHint: 'A curvy line — like a snake! Curve right at the top, then curve left at the bottom.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'T', uppercase: 'T', lowercase: 't',
        phonicSound: 'tuh (as in tree)',
        words: ['Tree', 'Tiger', 'Train'],
        emoji: '🌳',
        funFact: 'T looks like a tree! One trunk going up with branches across the top.',
        activity: 'Stand up straight with arms out wide — you are the letter T!',
        traceHint: 'One line going across the top, then one line going straight down from the middle.',
        ageIntroduced: '2-3 years',
    },
    {
        letter: 'U', uppercase: 'U', lowercase: 'u',
        phonicSound: 'uh (as in umbrella)',
        words: ['Umbrella', 'Unicorn', 'Up'],
        emoji: '☂️',
        funFact: 'U is shaped like a cup — it can "hold" things inside it!',
        activity: 'Hold a cup and say "U looks like my cup!"',
        traceHint: 'Go down, curve at the bottom, and come back up — like a smile.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'V', uppercase: 'V', lowercase: 'v',
        phonicSound: 'vvv (as in van)',
        words: ['Van', 'Violin', 'Vegetables'],
        emoji: '🚐',
        funFact: 'V is like a valley between two mountains! Look at W — it\'s a double V!',
        activity: 'Make a V with two fingers — that also means "peace" or "victory!"',
        traceHint: 'One line going down to the right, then one line going back up to the right — like a checkmark.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'W', uppercase: 'W', lowercase: 'w',
        phonicSound: 'wuh (as in water)',
        words: ['Water', 'Whale', 'Worm'],
        emoji: '🐋',
        funFact: 'W is the only letter with 3 syllables in its name (dub-ul-you)! Every other letter has just 1.',
        activity: 'Wiggle like a worm and say "W-W-Wiggle!"',
        traceHint: 'Like two V\'s side by side — down-up-down-up.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'X', uppercase: 'X', lowercase: 'x',
        phonicSound: 'ks (as in fox)',
        words: ['X-ray', 'Xylophone', 'Fox'],
        emoji: '🦴',
        funFact: 'X marks the spot! On treasure maps, X shows where the treasure is buried.',
        activity: 'Cross two sticks or crayons to make an X and go on a treasure hunt!',
        traceHint: 'Two lines that cross in the middle — like a plus sign tilted sideways.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'Y', uppercase: 'Y', lowercase: 'y',
        phonicSound: 'yuh (as in yellow)',
        words: ['Yellow', 'Yogurt', 'Yarn'],
        emoji: '💛',
        funFact: 'Y can be a vowel OR a consonant — it\'s the shape-shifter of the alphabet!',
        activity: 'Raise both arms up in a V, then bring them together — you just made a Y!',
        traceHint: 'Two lines meeting at a point in the middle, then one line going straight down.',
        ageIntroduced: '3-4 years',
    },
    {
        letter: 'Z', uppercase: 'Z', lowercase: 'z',
        phonicSound: 'zzz (as in zebra)',
        words: ['Zebra', 'Zoo', 'Zipper'],
        emoji: '🦓',
        funFact: 'Z is the last letter of the alphabet — the grand finale! Zzzzz is also the sound of sleeping!',
        activity: 'Zip and unzip a zipper while saying "Zzzzip!"',
        traceHint: 'A line going right, then a diagonal going down-left, then another line going right.',
        ageIntroduced: '3-4 years',
    },
];

// ─── NUMBERS DATA ───────────────────────────────────

export const NUMBERS: NumberData[] = [
    {
        number: 0, word: 'Zero', emoji: '🔘',
        countingActivity: 'Show your child an empty bowl. "How many apples? Zero! Nothing inside!"',
        realWorldExample: 'An empty plate, an empty basket, nothing left after eating all the snacks.',
        funFact: 'Zero means nothing is there! It took thousands of years for people to invent the number zero.',
        fingerShow: 'Make a fist — no fingers showing.',
        ageIntroduced: '3-4 years',
    },
    {
        number: 1, word: 'One', emoji: '☝️',
        countingActivity: 'Hold up one finger. "How many noses do you have? One!"',
        realWorldExample: 'One sun in the sky, one nose on your face, one moon at night.',
        funFact: 'One is the loneliest number, but it\'s also the first! Everything starts with one.',
        fingerShow: 'Hold up your pointer finger.',
        ageIntroduced: '1-2 years',
    },
    {
        number: 2, word: 'Two', emoji: '✌️',
        countingActivity: 'Point to your eyes. "One eye, two eyes! You have two!"',
        realWorldExample: 'Two eyes, two ears, two hands, two feet — your body loves the number 2!',
        funFact: 'Two is the only even prime number! Twins are two babies born at the same time.',
        fingerShow: 'Hold up your pointer and middle finger (peace sign).',
        ageIntroduced: '1-2 years',
    },
    {
        number: 3, word: 'Three', emoji: '🔺',
        countingActivity: 'Stack 3 blocks and count them together. "One, two, three blocks!"',
        realWorldExample: 'A triangle has 3 sides. Traffic lights have 3 colors. Three Little Pigs!',
        funFact: 'The number 3 appears everywhere in stories — three wishes, three bears, three little pigs!',
        fingerShow: 'Hold up your pointer, middle, and ring finger.',
        ageIntroduced: '2-3 years',
    },
    {
        number: 4, word: 'Four', emoji: '🍀',
        countingActivity: 'Find a chair. "Let\'s count the legs — one, two, three, four!"',
        realWorldExample: 'Dogs have 4 legs. Cars have 4 wheels. A square has 4 sides.',
        funFact: 'A four-leaf clover is special because most clovers only have three leaves — finding one is lucky!',
        fingerShow: 'Hold up four fingers (tuck your thumb in).',
        ageIntroduced: '2-3 years',
    },
    {
        number: 5, word: 'Five', emoji: '🖐️',
        countingActivity: 'High five! "Count my fingers — one, two, three, four, five!"',
        realWorldExample: 'Five fingers on each hand, a starfish has 5 arms, 5 toes on each foot.',
        funFact: 'Humans have used 5 fingers to count since ancient times — that\'s why we count by fives and tens!',
        fingerShow: 'Show all five fingers on one hand.',
        ageIntroduced: '2-3 years',
    },
    {
        number: 6, word: 'Six', emoji: '🎲',
        countingActivity: 'Roll a die and find the side with 6 dots. Count them together!',
        realWorldExample: 'A dice has 6 sides. Insects have 6 legs. Half a dozen eggs is 6.',
        funFact: 'A honeybee\'s honeycomb is made of 6-sided shapes called hexagons — nature loves the number 6!',
        fingerShow: 'Show all five fingers on one hand plus one on the other.',
        ageIntroduced: '3-4 years',
    },
    {
        number: 7, word: 'Seven', emoji: '🌈',
        countingActivity: 'Look at a rainbow picture and count the colors: red, orange, yellow, green, blue, indigo, violet!',
        realWorldExample: 'Rainbows have 7 colors. There are 7 days in a week.',
        funFact: 'Seven is often called the luckiest number in many cultures around the world!',
        fingerShow: 'Five fingers on one hand plus two on the other.',
        ageIntroduced: '3-4 years',
    },
    {
        number: 8, word: 'Eight', emoji: '🐙',
        countingActivity: 'Draw an octopus and count the legs — "One, two, three... eight legs!"',
        realWorldExample: 'An octopus has 8 arms. A stop sign has 8 sides. Spiders have 8 legs.',
        funFact: 'If you turn the number 8 on its side, it becomes the infinity symbol ∞ — meaning forever!',
        fingerShow: 'Five fingers on one hand plus three on the other.',
        ageIntroduced: '3-4 years',
    },
    {
        number: 9, word: 'Nine', emoji: '🎯',
        countingActivity: 'Lay out 9 small toys in a line and count them one by one.',
        realWorldExample: 'A baseball team has 9 players. A cat supposedly has 9 lives!',
        funFact: 'Nine is the biggest single digit number — the next one needs TWO digits!',
        fingerShow: 'Five fingers on one hand plus four on the other.',
        ageIntroduced: '3-4 years',
    },
    {
        number: 10, word: 'Ten', emoji: '🙌',
        countingActivity: 'Count all 10 fingers together! "One, two, three... TEN!"',
        realWorldExample: 'You have 10 fingers and 10 toes. A bowling lane has 10 pins.',
        funFact: 'We use a base-10 number system (counting by tens) because humans have 10 fingers!',
        fingerShow: 'Show all 10 fingers — both hands open!',
        ageIntroduced: '2-3 years',
    },
    {
        number: 11, word: 'Eleven', emoji: '⚽',
        countingActivity: 'Have 11 objects? Line them up and count. "We passed 10 — we\'re in the teens now!"',
        realWorldExample: 'A soccer team has 11 players on the field.',
        funFact: 'Eleven is the first "double digit" number that repeats a digit — 1 and 1!',
        fingerShow: 'All 10 fingers, then say "plus one more!"',
        ageIntroduced: '3-4 years',
    },
    {
        number: 12, word: 'Twelve', emoji: '🕛',
        countingActivity: 'Look at a clock! Count the numbers around it — "One, two, three... twelve!"',
        realWorldExample: 'A clock has 12 hours. A year has 12 months. Eggs come in dozens (12).',
        funFact: 'Twelve is called a "dozen" — when you buy a dozen donuts, you get 12!',
        fingerShow: 'All 10 fingers, then say "plus two more!"',
        ageIntroduced: '3-4 years',
    },
    {
        number: 13, word: 'Thirteen', emoji: '🔢',
        countingActivity: 'Count 13 steps as you walk — bonus points if your stairs have exactly 13!',
        realWorldExample: 'A baker\'s dozen is 13 — one extra for good luck!',
        funFact: 'The number 13 is considered lucky in some cultures and unlucky in others!',
        fingerShow: 'All 10 fingers, then add "plus three!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 14, word: 'Fourteen', emoji: '💝',
        countingActivity: 'Count 14 small objects (cereal pieces, building blocks, crayons).',
        realWorldExample: 'Valentine\'s Day is on the 14th of February! Two weeks equals 14 days.',
        funFact: 'A fortnight means 14 days — that\'s an old English word for two weeks!',
        fingerShow: 'All 10 fingers, then add "plus four!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 15, word: 'Fifteen', emoji: '⏰',
        countingActivity: 'Count by fives: "Five, ten, fifteen!" Then count 15 individual items.',
        realWorldExample: 'A quarter of an hour is 15 minutes. When the clock says :15, that\'s fifteen minutes past.',
        funFact: 'Fifteen is special — you can get to it by counting by 3s (3, 6, 9, 12, 15) OR by 5s (5, 10, 15)!',
        fingerShow: 'All 10 fingers, then add "plus five on the other hand!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 16, word: 'Sixteen', emoji: '🧊',
        countingActivity: 'Line up 16 items in 4 rows of 4. "Look — a perfect square of 16!"',
        realWorldExample: '16 ounces make one pound. A chessboard has 16 pieces per player.',
        funFact: 'Sixteen is a perfect square — 4 times 4 equals 16!',
        fingerShow: 'All 10 fingers, then add "plus six!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 17, word: 'Seventeen', emoji: '🎵',
        countingActivity: 'Count 17 claps together while singing a song!',
        realWorldExample: 'Cicadas emerge every 17 years — that\'s how long one type stays underground!',
        funFact: 'Seventeen is a prime number — it can only be divided by 1 and itself!',
        fingerShow: 'All 10 fingers, then add "plus seven!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 18, word: 'Eighteen', emoji: '🎂',
        countingActivity: 'Count to 18 by twos: "Two, four, six, eight, ten, twelve, fourteen, sixteen, eighteen!"',
        realWorldExample: 'A golf course has 18 holes. In many places, you become an adult at 18!',
        funFact: 'In some cultures, 18 is the luckiest number — it means "life" in Hebrew!',
        fingerShow: 'All 10 fingers, then add "plus eight!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 19, word: 'Nineteen', emoji: '🔟',
        countingActivity: 'Almost to 20! Count 19 items and notice you need just one more for 20.',
        realWorldExample: 'Nineteen is the last "teen" number before twenty!',
        funFact: 'Nineteen is the biggest teen number — after this we enter the twenties!',
        fingerShow: 'All 10 fingers, then add "plus nine!"',
        ageIntroduced: '4-5 years',
    },
    {
        number: 20, word: 'Twenty', emoji: '🎉',
        countingActivity: 'Count all 20 fingers and toes! "Ten fingers plus ten toes equals twenty!"',
        realWorldExample: 'You have 20 fingers and toes combined! A score equals 20.',
        funFact: 'The word "score" means 20 — President Lincoln\'s "Four score and seven years ago" meant 87 years!',
        fingerShow: 'All 10 fingers plus "all 10 toes!" — wiggle them!',
        ageIntroduced: '3-4 years',
    },
];

// ─── SHAPES DATA ────────────────────────────────────

export const SHAPES: ShapeData[] = [
    {
        name: 'Circle', sides: 0, emoji: '⭕',
        realWorldExamples: ['Clock', 'Pizza', 'Wheel', 'Moon', 'Cookie'],
        drawingTip: 'Start at the top and draw all the way around back to the start — no corners!',
        funFact: 'A circle has no beginning and no end. Wheels changed the world because of circles!',
    },
    {
        name: 'Square', sides: 4, emoji: '🟦',
        realWorldExamples: ['Window', 'Cracker', 'Block', 'Tile', 'Napkin'],
        drawingTip: 'Four equal sides and four 90° corners. Every side is the same length!',
        funFact: 'A square is a special rectangle where ALL sides are equal. A city block is often square-shaped!',
    },
    {
        name: 'Triangle', sides: 3, emoji: '🔺',
        realWorldExamples: ['Pizza slice', 'Roof', 'Yield sign', 'Sailboat sail', 'Mountain peak'],
        drawingTip: 'Three lines and three corners. Start at the bottom left, go up to a point, then back down!',
        funFact: 'Triangles are the strongest shape in engineering — bridges and buildings are reinforced with triangles!',
    },
    {
        name: 'Rectangle', sides: 4, emoji: '📱',
        realWorldExamples: ['Book', 'Door', 'Phone', 'TV screen', 'Dollar bill'],
        drawingTip: 'Like a stretched-out square — two long sides and two short sides.',
        funFact: 'Almost all screens (phones, tablets, TVs) are rectangles! Look around — rectangles are everywhere.',
    },
    {
        name: 'Star', sides: 5, emoji: '⭐',
        realWorldExamples: ['Stars in the sky', 'Starfish', 'Sheriff badge', 'Star sticker', 'Christmas tree topper'],
        drawingTip: 'Five points sticking out. Try drawing a 5-pointed star without lifting your pencil!',
        funFact: 'Real stars in space are actually round like balls, but they look pointy because of how their light reaches our eyes!',
    },
    {
        name: 'Heart', sides: 'Curved', emoji: '❤️',
        realWorldExamples: ['Valentine card', 'Love symbol', 'Heart emoji', 'Heart-shaped candy', 'Playing cards'],
        drawingTip: 'Draw two bumps at the top, then bring them together to a point at the bottom.',
        funFact: 'Your real heart doesn\'t look like the heart shape — it looks more like a fist! But the shape means love.',
    },
    {
        name: 'Oval', sides: 0, emoji: '🥚',
        realWorldExamples: ['Egg', 'Football', 'Race track', 'Face shape', 'Mirror'],
        drawingTip: 'Like a stretched circle — taller or wider, but no corners.',
        funFact: 'An oval is also called an "ellipse." Earth\'s orbit around the sun is an oval, not a perfect circle!',
    },
    {
        name: 'Diamond', sides: 4, emoji: '💎',
        realWorldExamples: ['Kite', 'Baseball diamond', 'Playing cards', 'Jewelry', 'Road signs'],
        drawingTip: 'It\'s a square standing on one corner! Four sides, four points.',
        funFact: 'A diamond shape is technically called a "rhombus." A baseball infield is shaped like a diamond!',
    },
    {
        name: 'Pentagon', sides: 5, emoji: '⬠',
        realWorldExamples: ['The Pentagon building', 'Some soccer ball patches', 'Home plate in baseball'],
        drawingTip: 'Five equal sides and five corners. A little tricky — take your time!',
        funFact: 'The Pentagon in Washington D.C. is the world\'s largest office building — and it has 5 sides!',
    },
    {
        name: 'Hexagon', sides: 6, emoji: '🐝',
        realWorldExamples: ['Honeycomb', 'Nuts and bolts', 'Some floor tiles', 'Snowflakes'],
        drawingTip: 'Six sides — like a circle with flat edges. Look at honeycomb for the perfect example!',
        funFact: 'Bees build hexagonal honeycombs because hexagons use the least wax while holding the most honey!',
    },
    {
        name: 'Octagon', sides: 8, emoji: '🛑',
        realWorldExamples: ['Stop sign', 'Some umbrellas from above', 'Some gazebos'],
        drawingTip: 'Eight sides — start with a square and cut off all four corners.',
        funFact: 'Stop signs are octagons so drivers can recognize them even from behind — no other sign shape has 8 sides!',
    },
    {
        name: 'Crescent', sides: 'Curved', emoji: '🌙',
        realWorldExamples: ['Crescent moon', 'Croissant', 'Banana', 'Some country flags'],
        drawingTip: 'Two curved lines — one bigger curve and one smaller curve inside it.',
        funFact: 'The crescent moon appears when the sun lights up just a sliver of the moon\'s surface!',
    },
];

// ─── COLORS DATA ────────────────────────────────────

export const COLORS: ColorData[] = [
    {
        name: 'Red', hex: '#FF0000', emoji: '🔴',
        realWorldExamples: ['Fire truck', 'Apple', 'Strawberry', 'Stop sign', 'Ladybug'],
        mixingTip: 'Red is a primary color — you can\'t mix other colors to make it!',
        funFact: 'Red is the first color babies can see after black and white! It\'s also the color of love.',
    },
    {
        name: 'Blue', hex: '#0000FF', emoji: '🔵',
        realWorldExamples: ['Sky', 'Ocean', 'Blueberry', 'Jeans', 'Rain puddle'],
        mixingTip: 'Blue is a primary color. Mix blue + yellow to make green!',
        funFact: 'Blue is the world\'s most popular favorite color! The sky looks blue because of how sunlight bounces around.',
    },
    {
        name: 'Yellow', hex: '#FFFF00', emoji: '🟡',
        realWorldExamples: ['Sun', 'Banana', 'School bus', 'Rubber duck', 'Lemon'],
        mixingTip: 'Yellow is a primary color. Mix yellow + red to make orange!',
        funFact: 'Yellow is the most visible color from far away — that\'s why school buses and taxis are yellow!',
    },
    {
        name: 'Green', hex: '#00FF00', emoji: '🟢',
        realWorldExamples: ['Grass', 'Frog', 'Leaves', 'Broccoli', 'Christmas tree'],
        mixingTip: 'Green = Blue + Yellow! Mix those two primary colors together.',
        funFact: 'Green means "go" in traffic lights! Plants are green because of chlorophyll, which helps them eat sunlight.',
    },
    {
        name: 'Orange', hex: '#FFA500', emoji: '🟠',
        realWorldExamples: ['Orange (fruit)', 'Pumpkin', 'Carrot', 'Basketball', 'Goldfish'],
        mixingTip: 'Orange = Red + Yellow! It\'s named after the fruit, not the other way around.',
        funFact: 'Orange is the color of sunsets because light travels farther through the atmosphere and scatters!',
    },
    {
        name: 'Purple', hex: '#800080', emoji: '🟣',
        realWorldExamples: ['Grapes', 'Eggplant', 'Lavender flowers', 'Amethyst gem', 'Plum'],
        mixingTip: 'Purple = Red + Blue! Use more red for reddish-purple or more blue for bluish-purple.',
        funFact: 'In ancient times, purple dye was so expensive that only kings and queens could wear purple clothes!',
    },
    {
        name: 'Pink', hex: '#FFC0CB', emoji: '💗',
        realWorldExamples: ['Flamingo', 'Cotton candy', 'Pig', 'Rose', 'Bubblegum'],
        mixingTip: 'Pink = Red + White! Add more white for lighter pink, more red for deeper pink.',
        funFact: 'Flamingos are born white and turn pink from eating tiny pink shrimp!',
    },
    {
        name: 'Brown', hex: '#8B4513', emoji: '🟤',
        realWorldExamples: ['Chocolate', 'Tree bark', 'Teddy bear', 'Dirt', 'Puppy'],
        mixingTip: 'Brown = Red + Blue + Yellow! Mix all three primary colors together.',
        funFact: 'Brown is the color of the earth beneath our feet — that\'s why we call it an "earthy" color!',
    },
    {
        name: 'Black', hex: '#000000', emoji: '⚫',
        realWorldExamples: ['Night sky', 'Bat', 'Tire', 'Spider', 'Piano keys'],
        mixingTip: 'Mix all paint colors together and you get very dark brown/black!',
        funFact: 'In space, the sky is always black because there\'s no air to scatter sunlight!',
    },
    {
        name: 'White', hex: '#FFFFFF', emoji: '⚪',
        realWorldExamples: ['Snow', 'Cloud', 'Milk', 'Polar bear', 'Cotton ball'],
        mixingTip: 'White can\'t be mixed from other colors in paint, but all colors of LIGHT make white!',
        funFact: 'Sunlight looks white but is actually ALL the colors of the rainbow mixed together!',
    },
    {
        name: 'Gray', hex: '#808080', emoji: '🩶',
        realWorldExamples: ['Elephant', 'Rain cloud', 'Dolphin', 'Rock', 'Mouse'],
        mixingTip: 'Gray = Black + White! More white for light gray, more black for dark gray.',
        funFact: 'A gray dolphin\'s skin is smooth like rubber — and their gray color helps them blend with the ocean!',
    },
    {
        name: 'Gold', hex: '#FFD700', emoji: '🥇',
        realWorldExamples: ['Gold medal', 'Crown', 'Honey', 'Sunflower', 'Gold coin'],
        mixingTip: 'Gold = Yellow + a touch of Orange + a tiny bit of Brown.',
        funFact: 'Real gold is one of the rarest elements on Earth — all the gold ever mined would fill just 3 swimming pools!',
    },
];

// ─── LEARNING MILESTONES BY AGE ─────────────────────

export const LEARNING_MILESTONES: LearningMilestone[] = [
    // 0-12 months
    { id: 'lm1', ageRange: '0-12 months', title: 'Responds to colorful objects', description: 'Baby turns head toward bright, high-contrast colors (red, black, white).', category: 'colors', emoji: '👀' },
    { id: 'lm2', ageRange: '0-12 months', title: 'Reaches for shapes', description: 'Baby reaches for and grasps toys of different shapes.', category: 'shapes', emoji: '🤲' },
    { id: 'lm3', ageRange: '0-12 months', title: 'Listens to counting songs', description: 'Baby enjoys and responds to songs with counting ("1, 2, 3...").', category: 'numbers', emoji: '🎶' },

    // 1-2 years
    { id: 'lm4', ageRange: '1-2 years', title: 'Points to named colors', description: 'Can point to a red or blue object when named: "Where\'s the red ball?"', category: 'colors', emoji: '👆' },
    { id: 'lm5', ageRange: '1-2 years', title: 'Sorts by shape', description: 'Can match shapes in a simple shape sorter (circle, square, triangle).', category: 'shapes', emoji: '🧩' },
    { id: 'lm6', ageRange: '1-2 years', title: 'Says "one" or "two"', description: 'Begins to say number words, especially "one" and "two."', category: 'numbers', emoji: '✌️' },
    { id: 'lm7', ageRange: '1-2 years', title: 'Recognizes letter shapes', description: 'Shows interest in letter shapes in books without knowing names yet.', category: 'letters', emoji: '📖' },

    // 2-3 years
    { id: 'lm8', ageRange: '2-3 years', title: 'Names 2-3 colors', description: 'Can correctly name at least 2-3 colors (usually red, blue, yellow first).', category: 'colors', emoji: '🎨' },
    { id: 'lm9', ageRange: '2-3 years', title: 'Identifies basic shapes', description: 'Can name circle, square, and triangle when shown.', category: 'shapes', emoji: '🔺' },
    { id: 'lm10', ageRange: '2-3 years', title: 'Counts to 5', description: 'Can say numbers 1-5 in order (may not fully understand quantity yet).', category: 'numbers', emoji: '🖐️' },
    { id: 'lm11', ageRange: '2-3 years', title: 'Sings ABC song', description: 'Can sing or hum along with the alphabet song, recognizing the tune.', category: 'letters', emoji: '🎵' },
    { id: 'lm12', ageRange: '2-3 years', title: 'Recognizes first letter of name', description: 'Recognizes and may point to the first letter of their own name.', category: 'letters', emoji: '✨' },

    // 3-4 years
    { id: 'lm13', ageRange: '3-4 years', title: 'Names 8+ colors', description: 'Can name most basic colors including pink, orange, purple, brown.', category: 'colors', emoji: '🌈' },
    { id: 'lm14', ageRange: '3-4 years', title: 'Identifies 6+ shapes', description: 'Knows circle, square, triangle, rectangle, star, heart, and maybe more.', category: 'shapes', emoji: '💎' },
    { id: 'lm15', ageRange: '3-4 years', title: 'Counts to 10', description: 'Can count to 10 and begins understanding that numbers mean quantities.', category: 'numbers', emoji: '🔟' },
    { id: 'lm16', ageRange: '3-4 years', title: 'Recognizes 10+ letters', description: 'Can identify at least 10 uppercase letters by sight.', category: 'letters', emoji: '🔤' },
    { id: 'lm17', ageRange: '3-4 years', title: 'Understands "more" and "less"', description: 'Can compare two groups and tell which has more or fewer items.', category: 'numbers', emoji: '⚖️' },

    // 4-5 years
    { id: 'lm18', ageRange: '4-5 years', title: 'Knows all basic colors', description: 'Can name and identify all 12 common colors confidently.', category: 'colors', emoji: '🎯' },
    { id: 'lm19', ageRange: '4-5 years', title: 'Draws basic shapes', description: 'Can draw circles, squares, and triangles from memory.', category: 'shapes', emoji: '✏️' },
    { id: 'lm20', ageRange: '4-5 years', title: 'Counts to 20+', description: 'Can count to 20 or beyond and understands one-to-one counting.', category: 'numbers', emoji: '🎉' },
    { id: 'lm21', ageRange: '4-5 years', title: 'Knows most letters', description: 'Can identify most uppercase and some lowercase letters and their sounds.', category: 'letters', emoji: '📝' },
    { id: 'lm22', ageRange: '4-5 years', title: 'Writes own name', description: 'Can write their first name (may be in all uppercase letters).', category: 'letters', emoji: '✍️' },
    { id: 'lm23', ageRange: '4-5 years', title: 'Simple addition', description: 'Begins to understand that putting groups together makes more: "2 + 1 = 3."', category: 'numbers', emoji: '➕' },
];

// ─── PARENT TIPS ────────────────────────────────────

export const LEARNING_TIPS: LearningTip[] = [
    {
        id: 1, title: 'Make It Playful, Not Pressured',
        tip: 'Learning should feel like play, not work. If your child resists, stop and try later. Short, joyful moments beat long, forced sessions every time.',
        ageRange: 'All ages', emoji: '🎮',
    },
    {
        id: 2, title: 'Read Every Day',
        tip: 'Reading aloud is the single most powerful thing you can do for early learning. Point to letters, count objects in pictures, and name colors as you read.',
        ageRange: 'All ages', emoji: '📚',
    },
    {
        id: 3, title: 'Use the Real World',
        tip: 'The grocery store, car rides, and walks are classrooms. "Can you find something red? How many trees do you see? What shape is that sign?"',
        ageRange: 'All ages', emoji: '🌍',
    },
    {
        id: 4, title: 'Narrate Everything',
        tip: 'For babies and toddlers, narrate your day: "I\'m cutting 3 pieces of banana. Look, it\'s yellow! The plate is a circle." Every moment is a lesson.',
        ageRange: '0-2 years', emoji: '🗣️',
    },
    {
        id: 5, title: 'Repetition Is Their Friend',
        tip: 'Kids learn through repetition. Reading the same book 50 times isn\'t boring to them — it\'s mastery. Celebrate it!',
        ageRange: '0-3 years', emoji: '🔄',
    },
    {
        id: 6, title: 'Sing Songs and Rhymes',
        tip: 'Songs wire the brain for learning. The ABC song, counting songs, and color songs teach without the child even realizing it.',
        ageRange: '0-3 years', emoji: '🎶',
    },
    {
        id: 7, title: 'Follow Their Interest',
        tip: 'If your child loves trucks, teach letters on trucks. If they love animals, count animals. Build learning around what excites them.',
        ageRange: '1-3 years', emoji: '🚂',
    },
    {
        id: 8, title: 'Don\'t Correct — Redirect',
        tip: 'Instead of saying "No, that\'s not a B," try "That\'s a D! D looks like B\'s cousin. Let\'s look at them together." Keep it positive.',
        ageRange: '2-4 years', emoji: '💡',
    },
    {
        id: 9, title: 'Multi-Sensory Learning',
        tip: 'Write letters in sand, form numbers with play-dough, sort colorful buttons, trace shapes with fingers. The more senses involved, the deeper the learning.',
        ageRange: '2-4 years', emoji: '🎨',
    },
    {
        id: 10, title: 'Celebrate Effort, Not Perfection',
        tip: '"You worked so hard on that E!" matters more than "That\'s perfect!" Praising effort builds resilience and a love of learning.',
        ageRange: 'All ages', emoji: '🏆',
    },
    {
        id: 11, title: 'Name Letters in Their Name First',
        tip: 'Kids are most motivated to learn letters in their OWN name. Start there — it\'s personal and meaningful to them.',
        ageRange: '2-3 years', emoji: '✨',
    },
    {
        id: 12, title: 'Limit Screen Time for Under 2',
        tip: 'The AAP recommends no screen time for children under 18-24 months (except video chatting). Hands-on play is the best teacher for babies.',
        ageRange: '0-2 years', emoji: '📵',
    },
    {
        id: 13, title: 'Don\'t Rush the Milestones',
        tip: 'Every child learns at their own pace. A child who learns letters at 4 is just as likely to be an avid reader as one who learns at 3. Be patient.',
        ageRange: 'All ages', emoji: '🌱',
    },
    {
        id: 14, title: 'Use Comparison for Numbers',
        tip: '"You have MORE grapes than me. Who has FEWER crackers?" Real comparisons make numbers click faster than rote counting.',
        ageRange: '2-4 years', emoji: '⚖️',
    },
    {
        id: 15, title: 'Point to Print Everywhere',
        tip: 'Point to words on cereal boxes, street signs, and menus. This teaches kids that letters make words and words mean something — that\'s pre-reading!',
        ageRange: '2-4 years', emoji: '👉',
    },
    {
        id: 16, title: 'Make Mistakes On Purpose',
        tip: '"Is this letter called Z? No wait, that\'s an A!" Kids love correcting you. Helping you "learn" makes them feel confident and reinforces their knowledge.',
        ageRange: '3-5 years', emoji: '🤪',
    },
];

// ─── HELPER FUNCTIONS ───────────────────────────────

export function getLetterByChar(char: string): LetterData | undefined {
    return ALPHABET.find(l => l.letter === char.toUpperCase());
}

export function getNumberByValue(num: number): NumberData | undefined {
    return NUMBERS.find(n => n.number === num);
}

export function getShapeByName(name: string): ShapeData | undefined {
    return SHAPES.find(s => s.name.toLowerCase() === name.toLowerCase());
}

export function getColorByName(name: string): ColorData | undefined {
    return COLORS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getMilestonesByAge(ageRange: string): LearningMilestone[] {
    return LEARNING_MILESTONES.filter(m => m.ageRange === ageRange);
}

export function getMilestonesByCategory(category: LearningMilestone['category']): LearningMilestone[] {
    return LEARNING_MILESTONES.filter(m => m.category === category);
}

export function getTipsByAge(ageRange: string): LearningTip[] {
    return LEARNING_TIPS.filter(t => t.ageRange === ageRange || t.ageRange === 'All ages');
}

// Content summary for reference
export const LEARNING_SUMMARY = {
    totalLetters: ALPHABET.length,        // 26
    totalNumbers: NUMBERS.length,         // 21 (0-20)
    totalShapes: SHAPES.length,           // 12
    totalColors: COLORS.length,           // 12
    totalMilestones: LEARNING_MILESTONES.length,  // 23
    totalTips: LEARNING_TIPS.length,      // 16
    ageGroups: ['0-12 months', '1-2 years', '2-3 years', '3-4 years', '4-5 years'],
    categories: ['letters', 'numbers', 'shapes', 'colors'] as const,
    author: 'Population +1 — Original Content',
};
