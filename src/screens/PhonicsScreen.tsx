/**
 * PhonicsScreen.tsx
 *
 * Phonics Challenge — 8 progressive levels of phonics exercises
 * Original educational content by Population +1
 *
 * Levels:
 *  1. Letter Sounds        — Hear a sound, pick the letter
 *  2. Beginning Sounds     — Which letter does the word start with?
 *  3. Ending Sounds        — Which letter does the word end with?
 *  4. Short Vowels         — Identify the short vowel in a word
 *  5. Consonant Blends     — Identify the blend at the start of a word
 *  6. Digraphs             — ch, sh, th, wh, ph
 *  7. Long Vowels          — Identify the long vowel pattern
 *  8. Word Families        — Match words to their rhyming family
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROGRESS_KEY = '@p1_phonics_progress';

// ─── TYPES ──────────────────────────────────────────

interface Question {
    prompt: string;          // What to display / speak
    speakText?: string;      // Override for TTS (defaults to prompt)
    choices: string[];       // 4 answer options
    correctIndex: number;    // Which option is correct
    explanation: string;     // Shown after answering
}

interface Level {
    id: number;
    title: string;
    emoji: string;
    description: string;
    color: string;
    ageRange: string;
    questions: Question[];
}

// ─── LEVEL DATA ─────────────────────────────────────

const LEVELS: Level[] = [
    // ── LEVEL 1: Letter Sounds ──────────────
    {
        id: 1,
        title: 'Letter Sounds',
        emoji: '🔊',
        description: 'Hear a phonic sound and pick the letter that makes it.',
        color: '#1565C0',
        ageRange: 'Ages 2–4',
        questions: [
            { prompt: 'Which letter says "ah" as in apple?', speakText: 'ah, as in apple', choices: ['A', 'E', 'O', 'U'], correctIndex: 0, explanation: 'The letter A makes the "ah" sound — Apple!' },
            { prompt: 'Which letter says "buh" as in ball?', speakText: 'buh, as in ball', choices: ['D', 'B', 'P', 'G'], correctIndex: 1, explanation: 'B says "buh" — Ball, Bear, Banana!' },
            { prompt: 'Which letter says "sss" as in sun?', speakText: 'sss, as in sun', choices: ['Z', 'C', 'S', 'X'], correctIndex: 2, explanation: 'S makes the "sss" sound — like a snake! Sun, Star, Snake!' },
            { prompt: 'Which letter says "mmm" as in moon?', speakText: 'mmm, as in moon', choices: ['N', 'W', 'M', 'R'], correctIndex: 2, explanation: 'M says "mmm" — Moon, Monkey, Milk!' },
            { prompt: 'Which letter says "tuh" as in tree?', speakText: 'tuh, as in tree', choices: ['T', 'D', 'K', 'P'], correctIndex: 0, explanation: 'T says "tuh" — Tree, Tiger, Train!' },
            { prompt: 'Which letter says "fff" as in fish?', speakText: 'fff, as in fish', choices: ['V', 'P', 'H', 'F'], correctIndex: 3, explanation: 'F makes the "fff" sound. Feel the air on your hand! Fish, Frog, Flower!' },
            { prompt: 'Which letter says "lll" as in lion?', speakText: 'lll, as in lion', choices: ['R', 'L', 'N', 'I'], correctIndex: 1, explanation: 'L makes the "lll" sound — Lion, Leaf, Lemon!' },
            { prompt: 'Which letter says "rrr" as in rain?', speakText: 'rrr, as in rain', choices: ['L', 'W', 'R', 'N'], correctIndex: 2, explanation: 'R makes the "rrr" sound — like a pirate! Rain, Rabbit, Rainbow!' },
            { prompt: 'Which letter says "kuh" as in cat?', speakText: 'kuh, as in cat', choices: ['G', 'K', 'C', 'Q'], correctIndex: 2, explanation: 'C can say "kuh" — Cat, Car, Cookie!' },
            { prompt: 'Which letter says "duh" as in dog?', speakText: 'duh, as in dog', choices: ['B', 'T', 'D', 'G'], correctIndex: 2, explanation: 'D says "duh" — Dog, Duck, Door!' },
        ],
    },

    // ── LEVEL 2: Beginning Sounds ───────────
    {
        id: 2,
        title: 'Beginning Sounds',
        emoji: '🅰️',
        description: 'What letter does the word start with?',
        color: '#2E7D32',
        ageRange: 'Ages 2–4',
        questions: [
            { prompt: '🐱 CAT starts with which letter?', speakText: 'cat', choices: ['K', 'S', 'C', 'T'], correctIndex: 2, explanation: 'CAT starts with C — "kuh, kuh, cat!"' },
            { prompt: '🐕 DOG starts with which letter?', speakText: 'dog', choices: ['B', 'D', 'G', 'P'], correctIndex: 1, explanation: 'DOG starts with D — "duh, duh, dog!"' },
            { prompt: '🐟 FISH starts with which letter?', speakText: 'fish', choices: ['F', 'S', 'H', 'V'], correctIndex: 0, explanation: 'FISH starts with F — "fff, fff, fish!"' },
            { prompt: '🏠 HOUSE starts with which letter?', speakText: 'house', choices: ['O', 'W', 'H', 'R'], correctIndex: 2, explanation: 'HOUSE starts with H — feel the breath when you say it!' },
            { prompt: '🌈 RAINBOW starts with which letter?', speakText: 'rainbow', choices: ['L', 'W', 'N', 'R'], correctIndex: 3, explanation: 'RAINBOW starts with R — "rrr, rrr, rainbow!"' },
            { prompt: '🐷 PIG starts with which letter?', speakText: 'pig', choices: ['B', 'D', 'G', 'P'], correctIndex: 3, explanation: 'PIG starts with P — feel the pop of air! "puh, puh, pig!"' },
            { prompt: '🌙 MOON starts with which letter?', speakText: 'moon', choices: ['N', 'M', 'W', 'O'], correctIndex: 1, explanation: 'MOON starts with M — "mmm, mmm, moon!"' },
            { prompt: '🦁 LION starts with which letter?', speakText: 'lion', choices: ['R', 'N', 'I', 'L'], correctIndex: 3, explanation: 'LION starts with L — "lll, lll, lion!"' },
            { prompt: '☀️ SUN starts with which letter?', speakText: 'sun', choices: ['Z', 'S', 'C', 'X'], correctIndex: 1, explanation: 'SUN starts with S — "sss, sss, sun!"' },
            { prompt: '🐻 BEAR starts with which letter?', speakText: 'bear', choices: ['P', 'D', 'B', 'G'], correctIndex: 2, explanation: 'BEAR starts with B — "buh, buh, bear!"' },
        ],
    },

    // ── LEVEL 3: Ending Sounds ──────────────
    {
        id: 3,
        title: 'Ending Sounds',
        emoji: '🔚',
        description: 'What letter does the word end with?',
        color: '#E65100',
        ageRange: 'Ages 3–5',
        questions: [
            { prompt: '🐱 CAT ends with which letter?', speakText: 'cat. What sound do you hear at the end? cat.', choices: ['C', 'A', 'T', 'S'], correctIndex: 2, explanation: 'CAT ends with T — "ca-T!" Listen to the "tuh" at the end.' },
            { prompt: '🐕 DOG ends with which letter?', speakText: 'dog. What sound is at the end? dog.', choices: ['D', 'O', 'B', 'G'], correctIndex: 3, explanation: 'DOG ends with G — "do-G!" The "guh" sound is at the end.' },
            { prompt: '🚌 BUS ends with which letter?', speakText: 'bus. What sound is at the end? bus.', choices: ['B', 'U', 'Z', 'S'], correctIndex: 3, explanation: 'BUS ends with S — "bu-S!" That "sss" sound at the end.' },
            { prompt: '🛏️ BED ends with which letter?', speakText: 'bed. What sound is at the end? bed.', choices: ['B', 'E', 'D', 'T'], correctIndex: 2, explanation: 'BED ends with D — "be-D!" Listen closely to the "duh" at the end.' },
            { prompt: '🏃 RUN ends with which letter?', speakText: 'run. What sound is at the end? run.', choices: ['R', 'U', 'M', 'N'], correctIndex: 3, explanation: 'RUN ends with N — "ru-N!" The "nnn" is at the end.' },
            { prompt: '🧢 HAT ends with which letter?', speakText: 'hat. What sound is at the end? hat.', choices: ['H', 'A', 'T', 'S'], correctIndex: 2, explanation: 'HAT ends with T — "ha-T!" Just like CAT!' },
            { prompt: '☀️ SUN ends with which letter?', speakText: 'sun. What sound is at the end? sun.', choices: ['S', 'U', 'N', 'M'], correctIndex: 2, explanation: 'SUN ends with N — "su-N!" The "nnn" ends the word.' },
            { prompt: '🐸 FROG ends with which letter?', speakText: 'frog. What sound is at the end? frog.', choices: ['F', 'R', 'O', 'G'], correctIndex: 3, explanation: 'FROG ends with G — "fro-G!" That "guh" at the end.' },
            { prompt: '📦 BOX ends with which letter?', speakText: 'box. What sound is at the end? box.', choices: ['B', 'O', 'X', 'S'], correctIndex: 2, explanation: 'BOX ends with X — "bo-X!" X makes a "ks" sound.' },
            { prompt: '🍎 JAM ends with which letter?', speakText: 'jam. What sound is at the end? jam.', choices: ['J', 'A', 'N', 'M'], correctIndex: 3, explanation: 'JAM ends with M — "ja-M!" The "mmm" sound at the end.' },
        ],
    },

    // ── LEVEL 4: Short Vowels ───────────────
    {
        id: 4,
        title: 'Short Vowels',
        emoji: '🗣️',
        description: 'Identify the short vowel sound you hear in the middle of the word.',
        color: '#7B1FA2',
        ageRange: 'Ages 3–5',
        questions: [
            { prompt: '🐱 What short vowel do you hear in CAT?', speakText: 'Cat. caaaat. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'o'], correctIndex: 0, explanation: 'CAT has the short A sound — "c-A-t!" Like apple.' },
            { prompt: '🐶 What short vowel do you hear in PET?', speakText: 'Pet. peeet. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'u'], correctIndex: 1, explanation: 'PET has the short E sound — "p-E-t!" Like egg.' },
            { prompt: '🐷 What short vowel do you hear in PIG?', speakText: 'Pig. piiig. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'o'], correctIndex: 2, explanation: 'PIG has the short I sound — "p-I-g!" Like igloo.' },
            { prompt: '🪵 What short vowel do you hear in LOG?', speakText: 'Log. loooog. What vowel sound is in the middle?', choices: ['a', 'e', 'o', 'u'], correctIndex: 2, explanation: 'LOG has the short O sound — "l-O-g!" Like octopus.' },
            { prompt: '🐛 What short vowel do you hear in BUG?', speakText: 'Bug. buuug. What vowel sound is in the middle?', choices: ['a', 'i', 'o', 'u'], correctIndex: 3, explanation: 'BUG has the short U sound — "b-U-g!" Like umbrella.' },
            { prompt: '🦊 What short vowel do you hear in FOX?', speakText: 'Fox. foooox. What vowel sound is in the middle?', choices: ['a', 'e', 'o', 'u'], correctIndex: 2, explanation: 'FOX has the short O sound — "f-O-x!"' },
            { prompt: '🏃 What short vowel do you hear in RUN?', speakText: 'Run. ruuun. What vowel sound is in the middle?', choices: ['a', 'i', 'o', 'u'], correctIndex: 3, explanation: 'RUN has the short U sound — "r-U-n!"' },
            { prompt: '🛏️ What short vowel do you hear in BED?', speakText: 'Bed. beeeed. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'u'], correctIndex: 1, explanation: 'BED has the short E sound — "b-E-d!"' },
            { prompt: '🗺️ What short vowel do you hear in MAP?', speakText: 'Map. maaap. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'o'], correctIndex: 0, explanation: 'MAP has the short A sound — "m-A-p!"' },
            { prompt: '🦶 What short vowel do you hear in HIT?', speakText: 'Hit. hiiit. What vowel sound is in the middle?', choices: ['a', 'e', 'i', 'u'], correctIndex: 2, explanation: 'HIT has the short I sound — "h-I-t!"' },
        ],
    },

    // ── LEVEL 5: Consonant Blends ───────────
    {
        id: 5,
        title: 'Consonant Blends',
        emoji: '🔗',
        description: 'Two consonants together at the start of a word — you can hear both sounds!',
        color: '#00838F',
        ageRange: 'Ages 4–5',
        questions: [
            { prompt: '🐸 FROG starts with which blend?', speakText: 'frog. Listen to the beginning: frrrrog.', choices: ['fl', 'fr', 'gr', 'br'], correctIndex: 1, explanation: 'FROG starts with FR — "fr, fr, frog!" You hear both the F and the R.' },
            { prompt: '⭐ STAR starts with which blend?', speakText: 'star. Listen to the beginning: sttttar.', choices: ['sp', 'sk', 'st', 'sl'], correctIndex: 2, explanation: 'STAR starts with ST — "st, st, star!" S and T work together.' },
            { prompt: '🧱 BLOCK starts with which blend?', speakText: 'block. Listen to the beginning: bllllock.', choices: ['bl', 'br', 'cl', 'fl'], correctIndex: 0, explanation: 'BLOCK starts with BL — "bl, bl, block!" B and L blend together.' },
            { prompt: '🦀 CRAB starts with which blend?', speakText: 'crab. Listen to the beginning: crrrrab.', choices: ['cl', 'cr', 'gr', 'tr'], correctIndex: 1, explanation: 'CRAB starts with CR — "cr, cr, crab!" C and R together.' },
            { prompt: '🍇 GRAPES starts with which blend?', speakText: 'grapes. Listen to the beginning: grrrapes.', choices: ['gl', 'gr', 'br', 'dr'], correctIndex: 1, explanation: 'GRAPES starts with GR — "gr, gr, grapes!" G and R blend together.' },
            { prompt: '🎺 DRUM starts with which blend?', speakText: 'drum. Listen to the beginning: drrrrum.', choices: ['dr', 'br', 'tr', 'gr'], correctIndex: 0, explanation: 'DRUM starts with DR — "dr, dr, drum!" D and R together.' },
            { prompt: '✋ CLAP starts with which blend?', speakText: 'clap. Listen to the beginning: clllap.', choices: ['cr', 'cl', 'bl', 'fl'], correctIndex: 1, explanation: 'CLAP starts with CL — "cl, cl, clap!" C and L blend.' },
            { prompt: '🏊 SWIM starts with which blend?', speakText: 'swim. Listen to the beginning: swwwim.', choices: ['sw', 'sl', 'sn', 'sp'], correctIndex: 0, explanation: 'SWIM starts with SW — "sw, sw, swim!" S and W together.' },
            { prompt: '🚂 TRAIN starts with which blend?', speakText: 'train. Listen to the beginning: trrrrain.', choices: ['dr', 'cr', 'tr', 'br'], correctIndex: 2, explanation: 'TRAIN starts with TR — "tr, tr, train!" T and R blend.' },
            { prompt: '❄️ SNOW starts with which blend?', speakText: 'snow. Listen to the beginning: snnnow.', choices: ['sl', 'sp', 'st', 'sn'], correctIndex: 3, explanation: 'SNOW starts with SN — "sn, sn, snow!" S and N blend.' },
        ],
    },

    // ── LEVEL 6: Digraphs ───────────────────
    {
        id: 6,
        title: 'Digraphs',
        emoji: '🤝',
        description: 'Two letters that team up to make ONE new sound — ch, sh, th, wh, ph.',
        color: '#AD1457',
        ageRange: 'Ages 4–5',
        questions: [
            { prompt: '🧀 CHEESE starts with which digraph?', speakText: 'cheese. Listen: chhhheese.', choices: ['sh', 'ch', 'th', 'wh'], correctIndex: 1, explanation: 'CHEESE starts with CH — C and H team up to make the "ch" sound!' },
            { prompt: '🐚 SHELL starts with which digraph?', speakText: 'shell. Listen: shhhell.', choices: ['sh', 'ch', 'th', 'ph'], correctIndex: 0, explanation: 'SHELL starts with SH — "shhh, shell!" Like telling someone to be quiet.' },
            { prompt: '👍 THUMB starts with which digraph?', speakText: 'thumb. Listen: thhhumb.', choices: ['ch', 'ph', 'sh', 'th'], correctIndex: 3, explanation: 'THUMB starts with TH — stick your tongue out a little to make the "th" sound!' },
            { prompt: '🐋 WHALE starts with which digraph?', speakText: 'whale. Listen: whhhhale.', choices: ['wh', 'sh', 'ch', 'th'], correctIndex: 0, explanation: 'WHALE starts with WH — "wh, wh, whale!" W and H make a breathy sound together.' },
            { prompt: '📱 PHONE starts with which digraph?', speakText: 'phone. Listen: phhhone.', choices: ['ch', 'th', 'sh', 'ph'], correctIndex: 3, explanation: 'PHONE starts with PH — P and H team up to sound like F!' },
            { prompt: '👟 SHOE starts with which digraph?', speakText: 'shoe. Listen: shhhhoe.', choices: ['ch', 'sh', 'th', 'wh'], correctIndex: 1, explanation: 'SHOE starts with SH — "shh, shoe!"' },
            { prompt: '🐔 CHICK starts with which digraph?', speakText: 'chick. Listen: chhhick.', choices: ['sh', 'th', 'ch', 'wh'], correctIndex: 2, explanation: 'CHICK starts with CH — "ch, ch, chick!"' },
            { prompt: '3️⃣ THREE starts with which digraph?', speakText: 'three. Listen: thhhree.', choices: ['sh', 'ch', 'wh', 'th'], correctIndex: 3, explanation: 'THREE starts with TH — tongue between your teeth! "th, th, three!"' },
            { prompt: '🌾 WHEAT starts with which digraph?', speakText: 'wheat. Listen: whhhheat.', choices: ['th', 'wh', 'ch', 'sh'], correctIndex: 1, explanation: 'WHEAT starts with WH — "wh, wh, wheat!"' },
            { prompt: '📷 PHOTO starts with which digraph?', speakText: 'photo. Listen: phhhhoto.', choices: ['th', 'sh', 'ph', 'ch'], correctIndex: 2, explanation: 'PHOTO starts with PH — PH sounds like F! "ph, ph, photo!"' },
        ],
    },

    // ── LEVEL 7: Long Vowels ────────────────
    {
        id: 7,
        title: 'Long Vowels',
        emoji: '📏',
        description: 'Long vowels say their own name! The magic "e" at the end often makes it happen.',
        color: '#F57F17',
        ageRange: 'Ages 4–5',
        questions: [
            { prompt: '🎂 CAKE — What long vowel do you hear?', speakText: 'cake. The vowel says its own name. Cake.', choices: ['long A', 'long E', 'long I', 'long O'], correctIndex: 0, explanation: 'CAKE has a long A — the A says its own name "AY!" The magic E at the end makes A say its name.' },
            { prompt: '🪁 KITE — What long vowel do you hear?', speakText: 'kite. The vowel says its own name. Kite.', choices: ['long A', 'long E', 'long I', 'long U'], correctIndex: 2, explanation: 'KITE has a long I — the I says its own name "EYE!" Magic E strikes again!' },
            { prompt: '🦴 BONE — What long vowel do you hear?', speakText: 'bone. The vowel says its own name. Bone.', choices: ['long A', 'long I', 'long O', 'long U'], correctIndex: 2, explanation: 'BONE has a long O — the O says its own name "OH!" The E at the end helps.' },
            { prompt: '🎵 TUNE — What long vowel do you hear?', speakText: 'tune. The vowel says its own name. Tune.', choices: ['long A', 'long I', 'long O', 'long U'], correctIndex: 3, explanation: 'TUNE has a long U — the U says its own name "YOO!" Magic E makes it long.' },
            { prompt: '🌳 TREE — What long vowel do you hear?', speakText: 'tree. The vowel says its own name. Tree.', choices: ['long A', 'long E', 'long I', 'long O'], correctIndex: 1, explanation: 'TREE has a long E — two E\'s together say "EE!" Double letters can make long vowels too.' },
            { prompt: '🐍 SNAKE — What long vowel do you hear?', speakText: 'snake. The vowel says its own name. Snake.', choices: ['long A', 'long E', 'long I', 'long O'], correctIndex: 0, explanation: 'SNAKE has a long A — "snAke!" The magic E makes A say its name.' },
            { prompt: '🚲 BIKE — What long vowel do you hear?', speakText: 'bike. The vowel says its own name. Bike.', choices: ['long A', 'long E', 'long I', 'long U'], correctIndex: 2, explanation: 'BIKE has a long I — "bIke!" I says its name thanks to magic E.' },
            { prompt: '🏠 HOME — What long vowel do you hear?', speakText: 'home. The vowel says its own name. Home.', choices: ['long A', 'long E', 'long O', 'long U'], correctIndex: 2, explanation: 'HOME has a long O — "hOme!" O says its name.' },
            { prompt: '🐝 BEE — What long vowel do you hear?', speakText: 'bee. The vowel says its own name. Bee.', choices: ['long A', 'long E', 'long I', 'long O'], correctIndex: 1, explanation: 'BEE has a long E — two E\'s together make the "EE" sound!' },
            { prompt: '🧊 CUBE — What long vowel do you hear?', speakText: 'cube. The vowel says its own name. Cube.', choices: ['long A', 'long I', 'long O', 'long U'], correctIndex: 3, explanation: 'CUBE has a long U — "cUbe!" Magic E makes U say its name.' },
        ],
    },

    // ── LEVEL 8: Word Families ──────────────
    {
        id: 8,
        title: 'Word Families',
        emoji: '👨‍👩‍👧‍👦',
        description: 'Words that rhyme belong to the same family! Match the word to its rhyming group.',
        color: '#4527A0',
        ageRange: 'Ages 4–5',
        questions: [
            { prompt: '🐱 CAT belongs to which word family?', speakText: 'Cat. Cat rhymes with bat, hat, mat. What family?', choices: ['-at', '-an', '-ig', '-op'], correctIndex: 0, explanation: 'CAT is in the -AT family! Cat, bat, hat, mat, sat — they all end in -AT and rhyme!' },
            { prompt: '🐷 PIG belongs to which word family?', speakText: 'Pig. Pig rhymes with big, dig, wig. What family?', choices: ['-ug', '-ig', '-og', '-ag'], correctIndex: 1, explanation: 'PIG is in the -IG family! Pig, big, dig, wig, fig — they all end in -IG!' },
            { prompt: '🔝 TOP belongs to which word family?', speakText: 'Top. Top rhymes with hop, mop, pop. What family?', choices: ['-ap', '-up', '-ip', '-op'], correctIndex: 3, explanation: 'TOP is in the -OP family! Top, hop, mop, pop, stop — they all end in -OP!' },
            { prompt: '🐛 BUG belongs to which word family?', speakText: 'Bug. Bug rhymes with hug, mug, rug. What family?', choices: ['-ag', '-ig', '-ug', '-og'], correctIndex: 2, explanation: 'BUG is in the -UG family! Bug, hug, mug, rug, tug — they all end in -UG!' },
            { prompt: '👨 MAN belongs to which word family?', speakText: 'Man. Man rhymes with can, fan, pan. What family?', choices: ['-at', '-an', '-in', '-en'], correctIndex: 1, explanation: 'MAN is in the -AN family! Man, can, fan, pan, van — they all end in -AN!' },
            { prompt: '🪣 MOP belongs to which word family?', speakText: 'Mop. Mop rhymes with hop, pop, top. What family?', choices: ['-op', '-ap', '-up', '-ip'], correctIndex: 0, explanation: 'MOP is in the -OP family! Mop, hop, pop, top, stop!' },
            { prompt: '🏃 RUN belongs to which word family?', speakText: 'Run. Run rhymes with fun, bun, sun. What family?', choices: ['-an', '-in', '-un', '-en'], correctIndex: 2, explanation: 'RUN is in the -UN family! Run, fun, bun, sun, gun — they all end in -UN!' },
            { prompt: '🐹 PET belongs to which word family?', speakText: 'Pet. Pet rhymes with get, let, net. What family?', choices: ['-at', '-it', '-et', '-ut'], correctIndex: 2, explanation: 'PET is in the -ET family! Pet, get, let, net, wet — they all end in -ET!' },
            { prompt: '🏊 DIP belongs to which word family?', speakText: 'Dip. Dip rhymes with hip, lip, tip. What family?', choices: ['-ap', '-ip', '-op', '-up'], correctIndex: 1, explanation: 'DIP is in the -IP family! Dip, hip, lip, tip, zip — they all end in -IP!' },
            { prompt: '🐸 LOG belongs to which word family?', speakText: 'Log. Log rhymes with dog, fog, hog. What family?', choices: ['-ag', '-ig', '-og', '-ug'], correctIndex: 2, explanation: 'LOG is in the -OG family! Log, dog, fog, hog, jog — they all end in -OG!' },
        ],
    },
];

// ─── COMPONENT ──────────────────────────────────────

export default function PhonicsScreen() {
    // ── State ────────────────────────────────
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);
    const [levelProgress, setLevelProgress] = useState<Record<number, { bestScore: number; completed: boolean }>>({});

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // ── Load Progress ────────────────────────
    useEffect(() => {
        loadProgress();
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const loadProgress = async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEY);
            if (data) setLevelProgress(JSON.parse(data));
        } catch (_e) { /* first load */ }
    };

    const saveProgress = async (updated: Record<number, { bestScore: number; completed: boolean }>) => {
        try {
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        } catch (_e) { /* silent */ }
    };

    // ── Speak helper ─────────────────────────
    const speak = useCallback((text: string) => {
        Speech.stop();
        Speech.speak(text, { language: 'en-US', rate: 0.8, pitch: 1.1 });
    }, []);

    // ── Start a level ────────────────────────
    const startLevel = useCallback((level: Level) => {
        setCurrentLevel(level);
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);
        setQuizComplete(false);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, [fadeAnim]);

    // ── Answer selection ─────────────────────
    const handleAnswer = useCallback((choiceIndex: number) => {
        if (selectedAnswer !== null || !currentLevel) return; // Already answered

        const question = currentLevel.questions[questionIndex];
        const correct = choiceIndex === question.correctIndex;

        setSelectedAnswer(choiceIndex);
        setIsCorrect(correct);
        setShowExplanation(true);

        if (correct) {
            setScore(prev => prev + 1);
            // Success animation
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            speak('Great job!');
        } else {
            // Shake animation
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
            speak('Oops! Let\'s learn this one.');
        }
    }, [selectedAnswer, currentLevel, questionIndex, scaleAnim, shakeAnim, speak]);

    // ── Next question ────────────────────────
    const nextQuestion = useCallback(() => {
        if (!currentLevel) return;
        if (questionIndex + 1 >= currentLevel.questions.length) {
            // Level complete!
            setQuizComplete(true);
            const pct = Math.round(((score + (isCorrect ? 0 : 0)) / currentLevel.questions.length) * 100);
            const updated = {
                ...levelProgress,
                [currentLevel.id]: {
                    bestScore: Math.max(levelProgress[currentLevel.id]?.bestScore || 0, pct),
                    completed: true,
                },
            };
            setLevelProgress(updated);
            saveProgress(updated);
        } else {
            setQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setShowExplanation(false);
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        }
    }, [currentLevel, questionIndex, score, isCorrect, levelProgress, fadeAnim]);

    // ── Back to level list ───────────────────
    const goBack = useCallback(() => {
        Speech.stop();
        setCurrentLevel(null);
        setQuizComplete(false);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, [fadeAnim]);

    // ── QUIZ COMPLETE VIEW ───────────────────
    if (currentLevel && quizComplete) {
        const total = currentLevel.questions.length;
        const pct = Math.round((score / total) * 100);
        const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
        const message =
            stars === 3 ? 'Perfect! You\'re a phonics star!' :
                stars === 2 ? 'Great job! Almost perfect!' :
                    stars === 1 ? 'Good try! Keep practicing!' :
                        'Let\'s try again — you\'ll get it!';

        return (
            <LinearGradient colors={['#000060', '#1e1b4b', '#000060']} style={styles.container}>
                <View style={styles.completeContainer}>
                    <Text style={styles.completeEmoji}>
                        {stars >= 3 ? '🏆' : stars >= 2 ? '⭐' : stars >= 1 ? '👏' : '💪'}
                    </Text>
                    <Text style={styles.completeTitle}>Level Complete!</Text>
                    <Text style={styles.completeLevelName}>{currentLevel.emoji} {currentLevel.title}</Text>

                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreNumber}>{score}/{total}</Text>
                        <Text style={styles.scorePct}>{pct}%</Text>
                    </View>

                    <View style={styles.starsRow}>
                        {[1, 2, 3].map(i => (
                            <Text key={i} style={[styles.star, i <= stars && styles.starEarned]}>
                                ★
                            </Text>
                        ))}
                    </View>

                    <Text style={styles.completeMessage}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.bigBtn, { backgroundColor: currentLevel.color }]}
                        onPress={() => startLevel(currentLevel)}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text style={styles.bigBtnText}>Try Again</Text>
                    </TouchableOpacity>

                    {currentLevel.id < LEVELS.length && (
                        <TouchableOpacity
                            style={[styles.bigBtn, { backgroundColor: '#22c55e', marginTop: 10 }]}
                            onPress={() => {
                                const next = LEVELS.find(l => l.id === currentLevel.id + 1);
                                if (next) startLevel(next);
                            }}
                        >
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                            <Text style={styles.bigBtnText}>Next Level</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.backLinkBtn} onPress={goBack}>
                        <Text style={styles.backLinkText}>← Back to All Levels</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // ── QUESTION VIEW ────────────────────────
    if (currentLevel) {
        const question = currentLevel.questions[questionIndex];
        const progress = (questionIndex + 1) / currentLevel.questions.length;

        return (
            <LinearGradient colors={['#000060', '#1e1b4b', '#000060']} style={styles.container}>
                {/* Header */}
                <View style={styles.quizHeader}>
                    <TouchableOpacity onPress={goBack} style={styles.quizBackBtn}>
                        <Ionicons name="arrow-back" size={22} color="#93c5fd" />
                        <Text style={styles.quizBackText}>Levels</Text>
                    </TouchableOpacity>
                    <Text style={styles.quizTitle}>{currentLevel.emoji} Level {currentLevel.id}</Text>
                    <Text style={styles.quizCounter}>
                        {questionIndex + 1}/{currentLevel.questions.length}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: currentLevel.color }]} />
                </View>

                {/* Score */}
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Score: {score}/{questionIndex + (selectedAnswer !== null ? 1 : 0)}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.quizBody} showsVerticalScrollIndicator={false}>
                    {/* Question */}
                    <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
                        <Text style={styles.questionText}>{question.prompt}</Text>
                        <TouchableOpacity
                            style={[styles.hearBtn, { borderColor: currentLevel.color }]}
                            onPress={() => speak(question.speakText || question.prompt)}
                        >
                            <Ionicons name="volume-high" size={18} color={currentLevel.color} />
                            <Text style={[styles.hearBtnText, { color: currentLevel.color }]}>Hear It</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Choices */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        {question.choices.map((choice, idx) => {
                            let bg = '#1e293b';
                            let borderColor = '#334155';
                            let textColor = '#e2e8f0';

                            if (selectedAnswer !== null) {
                                if (idx === question.correctIndex) {
                                    bg = '#14532d';
                                    borderColor = '#22c55e';
                                    textColor = '#86efac';
                                } else if (idx === selectedAnswer && !isCorrect) {
                                    bg = '#450a0a';
                                    borderColor = '#ef4444';
                                    textColor = '#fca5a5';
                                }
                            }

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.choiceBtn, { backgroundColor: bg, borderColor }]}
                                    onPress={() => handleAnswer(idx)}
                                    disabled={selectedAnswer !== null}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.choiceLetter, { borderColor }]}>
                                        <Text style={[styles.choiceLetterText, { color: textColor }]}>
                                            {String.fromCharCode(65 + idx)}
                                        </Text>
                                    </View>
                                    <Text style={[styles.choiceText, { color: textColor }]}>{choice}</Text>
                                    {selectedAnswer !== null && idx === question.correctIndex && (
                                        <Ionicons name="checkmark-circle" size={22} color="#22c55e" style={{ marginLeft: 'auto' }} />
                                    )}
                                    {selectedAnswer === idx && !isCorrect && (
                                        <Ionicons name="close-circle" size={22} color="#ef4444" style={{ marginLeft: 'auto' }} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </Animated.View>

                    {/* Explanation */}
                    {showExplanation && (
                        <View style={[styles.explanationBox, { borderLeftColor: isCorrect ? '#22c55e' : '#f59e0b' }]}>
                            <Text style={styles.explanationEmoji}>{isCorrect ? '✅' : '💡'}</Text>
                            <Text style={styles.explanationText}>{question.explanation}</Text>
                        </View>
                    )}

                    {/* Next button */}
                    {selectedAnswer !== null && (
                        <TouchableOpacity
                            style={[styles.nextBtn, { backgroundColor: currentLevel.color }]}
                            onPress={nextQuestion}
                        >
                            <Text style={styles.nextBtnText}>
                                {questionIndex + 1 >= currentLevel.questions.length ? 'See Results' : 'Next Question'}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>
        );
    }

    // ── LEVEL SELECT VIEW ────────────────────
    const totalStars = LEVELS.reduce((sum, level) => {
        const p = levelProgress[level.id];
        if (!p) return sum;
        const pct = p.bestScore;
        return sum + (pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0);
    }, 0);

    return (
        <LinearGradient colors={['#000060', '#1e1b4b', '#000060']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <Text style={styles.headerEmoji}>🔊</Text>
                    <Text style={styles.headerTitle}>Phonics Challenge</Text>
                    <Text style={styles.headerSub}>
                        Master letter sounds through 8 progressive levels
                    </Text>
                    {totalStars > 0 && (
                        <View style={styles.totalStars}>
                            <Text style={styles.totalStarsText}>⭐ {totalStars} / {LEVELS.length * 3} Stars Earned</Text>
                        </View>
                    )}
                </Animated.View>

                {/* How It Works */}
                <View style={styles.howItWorks}>
                    <Text style={styles.howTitle}>How It Works</Text>
                    <Text style={styles.howText}>
                        Each level has 10 questions. Tap "Hear It" to listen to the sound, then pick the correct answer.
                        Get 3 stars by scoring 90% or higher!
                    </Text>
                    <View style={styles.starGuide}>
                        <Text style={styles.starGuideItem}>★ 50%+</Text>
                        <Text style={styles.starGuideItem}>★★ 70%+</Text>
                        <Text style={styles.starGuideItem}>★★★ 90%+</Text>
                    </View>
                </View>

                {/* Level Cards */}
                {LEVELS.map((level, idx) => {
                    const progress = levelProgress[level.id];
                    const isLocked = idx > 0 && !levelProgress[LEVELS[idx - 1].id]?.completed;
                    const bestPct = progress?.bestScore || 0;
                    const stars = bestPct >= 90 ? 3 : bestPct >= 70 ? 2 : bestPct >= 50 ? 1 : 0;

                    return (
                        <TouchableOpacity
                            key={level.id}
                            style={[
                                styles.levelCard,
                                { borderLeftColor: level.color, borderLeftWidth: 4 },
                                isLocked && styles.levelCardLocked,
                            ]}
                            onPress={() => !isLocked && startLevel(level)}
                            activeOpacity={isLocked ? 1 : 0.7}
                        >
                            <View style={styles.levelCardLeft}>
                                <View style={[styles.levelNumCircle, { backgroundColor: isLocked ? '#334155' : level.color }]}>
                                    {isLocked ? (
                                        <Ionicons name="lock-closed" size={18} color="#64748b" />
                                    ) : (
                                        <Text style={styles.levelNum}>{level.id}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.levelCardCenter}>
                                <Text style={[styles.levelTitle, isLocked && styles.levelTitleLocked]}>
                                    {level.emoji} {level.title}
                                </Text>
                                <Text style={styles.levelDesc}>{level.description}</Text>
                                <Text style={styles.levelAge}>{level.ageRange}</Text>
                                {progress?.completed && (
                                    <View style={styles.levelStarsRow}>
                                        {[1, 2, 3].map(i => (
                                            <Text key={i} style={[styles.levelStar, i <= stars && styles.levelStarEarned]}>★</Text>
                                        ))}
                                        <Text style={styles.levelBest}>Best: {bestPct}%</Text>
                                    </View>
                                )}
                            </View>

                            <Ionicons
                                name={isLocked ? 'lock-closed' : progress?.completed ? 'checkmark-circle' : 'play-circle'}
                                size={28}
                                color={isLocked ? '#334155' : progress?.completed ? '#22c55e' : level.color}
                            />
                        </TouchableOpacity>
                    );
                })}

                {/* Educational note */}
                <View style={styles.footerNote}>
                    <Text style={styles.footerNoteTitle}>📋 About Phonics</Text>
                    <Text style={styles.footerNoteText}>
                        Phonics teaches the relationship between letters and the sounds they make.
                        It's one of the most effective methods for teaching children to read.
                        These exercises progress from simple letter sounds through blends, digraphs,
                        long vowels, and word families — the building blocks of reading!
                    </Text>
                    <Text style={styles.footerSource}>Content by Population +1 — Original Educational Material</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

// ─── STYLES ─────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 30 },

    // ── Header ──
    header: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 8 },
    headerEmoji: { fontSize: 48, marginBottom: 6 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },
    totalStars: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 },
    totalStarsText: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },

    // ── How It Works ──
    howItWorks: {
        margin: 16, padding: 16, backgroundColor: '#1a2744', borderRadius: 14,
        borderWidth: 1, borderColor: '#334155',
    },
    howTitle: { color: '#fbbf24', fontSize: 15, fontWeight: '800', marginBottom: 6 },
    howText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
    starGuide: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
    starGuideItem: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },

    // ── Level Cards ──
    levelCard: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10,
        backgroundColor: '#1e293b', borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: '#334155',
    },
    levelCardLocked: { opacity: 0.5 },
    levelCardLeft: { marginRight: 14 },
    levelNumCircle: {
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    },
    levelNum: { color: '#fff', fontSize: 18, fontWeight: '900' },
    levelCardCenter: { flex: 1 },
    levelTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    levelTitleLocked: { color: '#64748b' },
    levelDesc: { color: '#94a3b8', fontSize: 12, marginTop: 3, lineHeight: 17 },
    levelAge: { color: '#64748b', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
    levelStarsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    levelStar: { fontSize: 16, color: '#334155', marginRight: 2 },
    levelStarEarned: { color: '#fbbf24' },
    levelBest: { color: '#64748b', fontSize: 11, marginLeft: 8 },

    // ── Footer ──
    footerNote: {
        margin: 16, padding: 16, backgroundColor: '#000060', borderRadius: 12,
        borderWidth: 1, borderColor: '#1e293b',
    },
    footerNoteTitle: { color: '#fbbf24', fontSize: 14, fontWeight: '700', marginBottom: 6 },
    footerNoteText: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
    footerSource: { color: '#64748b', fontSize: 11, marginTop: 8, fontStyle: 'italic' },

    // ── Quiz Header ──
    quizHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingHorizontal: 16, paddingBottom: 8,
    },
    quizBackBtn: { flexDirection: 'row', alignItems: 'center' },
    quizBackText: { color: '#93c5fd', fontSize: 15, fontWeight: '600', marginLeft: 4 },
    quizTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    quizCounter: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    // ── Progress Bar ──
    progressBar: { height: 4, backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },

    // ── Score ──
    scoreRow: { alignItems: 'center', paddingVertical: 6 },
    scoreLabel: { color: '#64748b', fontSize: 13, fontWeight: '600' },

    // ── Quiz Body ──
    quizBody: { paddingHorizontal: 16 },

    // ── Question Card ──
    questionCard: {
        backgroundColor: 'rgba(30,41,59,0.6)', borderRadius: 16, padding: 22,
        marginBottom: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center',
    },
    questionText: { color: '#e2e8f0', fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
    hearBtn: {
        flexDirection: 'row', alignItems: 'center', marginTop: 14,
        paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20,
        borderWidth: 1.5, backgroundColor: 'rgba(147,197,253,0.08)',
    },
    hearBtnText: { fontSize: 14, fontWeight: '700', marginLeft: 6 },

    // ── Choices ──
    choiceBtn: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
        marginBottom: 10, borderWidth: 1.5,
    },
    choiceLetter: {
        width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    choiceLetterText: { fontSize: 14, fontWeight: '800' },
    choiceText: { fontSize: 17, fontWeight: '700', flex: 1 },

    // ── Explanation ──
    explanationBox: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#000060',
        borderRadius: 12, padding: 14, marginTop: 4, marginBottom: 8,
        borderWidth: 1, borderColor: '#334155', borderLeftWidth: 4,
    },
    explanationEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
    explanationText: { color: '#e2e8f0', fontSize: 14, lineHeight: 21, flex: 1 },

    // ── Next Button ──
    nextBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 14, marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },

    // ── Complete Screen ──
    completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    completeEmoji: { fontSize: 72, marginBottom: 12 },
    completeTitle: { fontSize: 32, fontWeight: '900', color: '#fff' },
    completeLevelName: { fontSize: 18, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
    scoreCard: {
        flexDirection: 'row', alignItems: 'baseline', marginTop: 20,
        backgroundColor: '#1e293b', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 30,
        borderWidth: 1, borderColor: '#334155', gap: 12,
    },
    scoreNumber: { fontSize: 36, fontWeight: '900', color: '#fff' },
    scorePct: { fontSize: 24, fontWeight: '700', color: '#93c5fd' },
    starsRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
    star: { fontSize: 36, color: '#334155' },
    starEarned: { color: '#fbbf24' },
    completeMessage: { fontSize: 16, color: '#94a3b8', marginTop: 12, textAlign: 'center', fontWeight: '600' },
    bigBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, paddingHorizontal: 30, borderRadius: 14, marginTop: 20, minWidth: 200,
    },
    bigBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    backLinkBtn: { marginTop: 20, padding: 10 },
    backLinkText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
});
