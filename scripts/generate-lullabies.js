// generate-lullabies.js
// Generates original music-box style WAV renditions of 25 public domain lullabies
// These are programmatically generated — 100% original recordings, legally yours.

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'lullabies');
const SAMPLE_RATE = 44100;
const BPM_DEFAULT = 100;

// ── Note frequency map ────────────────────────────────────────
const NOTE_FREQ = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51,
    'R': 0, // rest
};

// ── Music box tone synthesis ──────────────────────────────────
function musicBoxTone(freq, duration, sampleRate) {
    const samples = Math.floor(sampleRate * duration);
    const buf = new Float32Array(samples);
    if (freq === 0) return buf; // rest

    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        // Sharp attack, fast decay like a music box
        const envelope = Math.exp(-t * 4.0) * 0.7 + Math.exp(-t * 0.8) * 0.3;
        // Fundamental + harmonics for music box timbre
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const harmonic2 = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
        const harmonic3 = 0.15 * Math.sin(2 * Math.PI * freq * 3 * t);
        const harmonic5 = 0.05 * Math.sin(2 * Math.PI * freq * 5 * t);
        buf[i] = envelope * (fundamental + harmonic2 + harmonic3 + harmonic5) * 0.4;
    }
    return buf;
}

// ── Build melody from notes ───────────────────────────────────
function buildMelody(notes, bpm) {
    const beatDuration = 60.0 / bpm;
    let totalSamples = 0;
    const segments = [];

    for (const [noteName, beats] of notes) {
        const freq = NOTE_FREQ[noteName] || 0;
        const duration = beats * beatDuration;
        const segment = musicBoxTone(freq, duration, SAMPLE_RATE);
        segments.push(segment);
        totalSamples += segment.length;
    }

    // Loop melody 2x for longer playtime
    const singlePass = new Float32Array(totalSamples);
    let offset = 0;
    for (const seg of segments) {
        singlePass.set(seg, offset);
        offset += seg.length;
    }

    // Fade between loops
    const loopCount = 2;
    const finalBuf = new Float32Array(totalSamples * loopCount);
    for (let l = 0; l < loopCount; l++) {
        const vol = l === loopCount - 1 ? 0.7 : 1.0; // softer on repeat
        for (let i = 0; i < totalSamples; i++) {
            finalBuf[l * totalSamples + i] = singlePass[i] * vol;
        }
    }

    // Fade out last 2 seconds
    const fadeLen = Math.min(SAMPLE_RATE * 2, finalBuf.length);
    for (let i = 0; i < fadeLen; i++) {
        finalBuf[finalBuf.length - fadeLen + i] *= (fadeLen - i) / fadeLen;
    }

    return finalBuf;
}

// ── Write WAV file ────────────────────────────────────────────
function writeWav(filePath, samples) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = samples.length * (bitsPerSample / 8);
    const fileSize = 36 + dataSize;

    const buffer = Buffer.alloc(44 + dataSize);
    let o = 0;

    // RIFF header
    buffer.write('RIFF', o); o += 4;
    buffer.writeUInt32LE(fileSize, o); o += 4;
    buffer.write('WAVE', o); o += 4;

    // fmt chunk
    buffer.write('fmt ', o); o += 4;
    buffer.writeUInt32LE(16, o); o += 4;
    buffer.writeUInt16LE(1, o); o += 2; // PCM
    buffer.writeUInt16LE(numChannels, o); o += 2;
    buffer.writeUInt32LE(SAMPLE_RATE, o); o += 4;
    buffer.writeUInt32LE(byteRate, o); o += 4;
    buffer.writeUInt16LE(blockAlign, o); o += 2;
    buffer.writeUInt16LE(bitsPerSample, o); o += 2;

    // data chunk
    buffer.write('data', o); o += 4;
    buffer.writeUInt32LE(dataSize, o); o += 4;

    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.floor(s * 32767), o);
        o += 2;
    }

    fs.writeFileSync(filePath, buffer);
}

// ═══════════════════════════════════════════════════════════════
// 25 PUBLIC DOMAIN LULLABY MELODIES
// ═══════════════════════════════════════════════════════════════

const LULLABIES = [
    {
        name: '01-twinkle-twinkle-little-star',
        title: 'Twinkle Twinkle Little Star',
        bpm: 100,
        notes: [
            ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
            ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
        ]
    },
    {
        name: '02-brahms-lullaby',
        title: "Brahms' Lullaby",
        bpm: 80,
        notes: [
            ['E4', 1], ['E4', 0.5], ['E4', 1.5], ['G4', 1], ['E4', 0.5], ['E4', 1.5],
            ['G4', 1], ['E4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
            ['D4', 1], ['D4', 0.5], ['D4', 1.5], ['F4', 1], ['D4', 0.5], ['D4', 1.5],
            ['F4', 1], ['D4', 1], ['F4', 1], ['B4', 1], ['A4', 2],
            ['E4', 1], ['E4', 0.5], ['E4', 1.5], ['G4', 1], ['E4', 0.5], ['E4', 1.5],
            ['G4', 1], ['E4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
            ['D5', 1], ['D5', 1], ['B4', 1], ['G4', 1], ['A4', 1], ['B4', 1], ['C5', 2],
        ]
    },
    {
        name: '03-rock-a-bye-baby',
        title: 'Rock-a-Bye Baby',
        bpm: 90,
        notes: [
            ['E4', 1], ['E4', 0.5], ['F4', 0.5], ['G4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 2],
            ['D4', 1], ['D4', 0.5], ['E4', 0.5], ['F4', 1], ['D4', 1], ['F4', 2], ['R', 1],
            ['E4', 1], ['E4', 0.5], ['F4', 0.5], ['G4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 2],
            ['D4', 1], ['E4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2], ['R', 1],
        ]
    },
    {
        name: '04-hush-little-baby',
        title: 'Hush Little Baby (Mockingbird)',
        bpm: 100,
        notes: [
            ['C4', 1], ['C4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 2],
            ['F4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 1], ['E4', 2],
            ['C4', 1], ['C4', 1], ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 2],
            ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '05-mary-had-a-little-lamb',
        title: 'Mary Had a Little Lamb',
        bpm: 110,
        notes: [
            ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['E4', 2],
            ['D4', 1], ['D4', 1], ['D4', 2], ['E4', 1], ['G4', 1], ['G4', 2],
            ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['E4', 1], ['E4', 1],
            ['D4', 1], ['D4', 1], ['E4', 1], ['D4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '06-frere-jacques',
        title: 'Frère Jacques (Are You Sleeping)',
        bpm: 110,
        notes: [
            ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1],
            ['E4', 1], ['F4', 1], ['G4', 2], ['E4', 1], ['F4', 1], ['G4', 2],
            ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1], ['C4', 1],
            ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1], ['C4', 1],
            ['C4', 1], ['G3', 1], ['C4', 2], ['C4', 1], ['G3', 1], ['C4', 2],
        ]
    },
    {
        name: '07-baa-baa-black-sheep',
        title: 'Baa Baa Black Sheep',
        bpm: 105,
        notes: [
            ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
            ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['G4', 1], ['G4', 0.5], ['G4', 0.5], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
        ]
    },
    {
        name: '08-london-bridge',
        title: 'London Bridge Is Falling Down',
        bpm: 110,
        notes: [
            ['G4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['F4', 1], ['G4', 2],
            ['D4', 1], ['E4', 1], ['F4', 2], ['E4', 1], ['F4', 1], ['G4', 2],
            ['G4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['F4', 1], ['G4', 2],
            ['D4', 2], ['G4', 1], ['E4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '09-row-row-row-your-boat',
        title: 'Row Row Row Your Boat',
        bpm: 100,
        notes: [
            ['C4', 1], ['C4', 1], ['C4', 0.75], ['D4', 0.25], ['E4', 1],
            ['E4', 0.75], ['D4', 0.25], ['E4', 0.75], ['F4', 0.25], ['G4', 2],
            ['C5', 0.33], ['C5', 0.33], ['C5', 0.34], ['G4', 0.33], ['G4', 0.33], ['G4', 0.34],
            ['E4', 0.33], ['E4', 0.33], ['E4', 0.34], ['C4', 0.33], ['C4', 0.33], ['C4', 0.34],
            ['G4', 0.75], ['F4', 0.25], ['E4', 0.75], ['D4', 0.25], ['C4', 2],
        ]
    },
    {
        name: '10-old-macdonald',
        title: 'Old MacDonald Had a Farm',
        bpm: 115,
        notes: [
            ['G4', 1], ['G4', 1], ['G4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['B4', 1], ['B4', 1], ['A4', 1], ['A4', 1], ['G4', 2], ['R', 1], ['D4', 1],
            ['G4', 1], ['G4', 1], ['G4', 1], ['D4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
            ['B4', 1], ['B4', 1], ['A4', 1], ['A4', 1], ['G4', 2], ['R', 2],
        ]
    },
    {
        name: '11-itsy-bitsy-spider',
        title: 'Itsy Bitsy Spider',
        bpm: 105,
        notes: [
            ['G4', 0.5], ['C5', 1], ['C5', 0.5], ['C5', 1], ['D5', 0.5], ['E5', 1.5],
            ['E5', 1], ['D5', 0.5], ['C5', 1], ['D5', 0.5], ['E5', 1], ['C5', 2],
            ['E5', 1], ['E5', 0.5], ['F5', 1.5], ['G5', 2],
            ['F5', 1], ['F5', 0.5], ['E5', 1.5], ['F5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 2],
        ]
    },
    {
        name: '12-hickory-dickory-dock',
        title: 'Hickory Dickory Dock',
        bpm: 110,
        notes: [
            ['G4', 1], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 1], ['E4', 1], ['C4', 2],
            ['D4', 1], ['E4', 1], ['F4', 1], ['D4', 1], ['G4', 2], ['R', 1],
            ['G4', 1], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 1], ['E4', 1], ['C4', 2],
        ]
    },
    {
        name: '13-three-blind-mice',
        title: 'Three Blind Mice',
        bpm: 110,
        notes: [
            ['E4', 1], ['D4', 1], ['C4', 2], ['E4', 1], ['D4', 1], ['C4', 2],
            ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 2], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 2],
            ['G4', 0.5], ['G4', 0.5], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2],
        ]
    },
    {
        name: '14-this-old-man',
        title: 'This Old Man',
        bpm: 110,
        notes: [
            ['G4', 1], ['E4', 1], ['G4', 2], ['A4', 1], ['G4', 1], ['E4', 2],
            ['C4', 1], ['D4', 1], ['E4', 1], ['F4', 1], ['G4', 2], ['R', 2],
            ['G4', 0.5], ['G4', 0.5], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 1],
            ['D4', 1], ['E4', 1], ['F4', 1], ['D4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '15-hot-cross-buns',
        title: 'Hot Cross Buns',
        bpm: 100,
        notes: [
            ['E4', 1], ['D4', 1], ['C4', 2], ['E4', 1], ['D4', 1], ['C4', 2],
            ['C4', 0.5], ['C4', 0.5], ['C4', 0.5], ['C4', 0.5], ['D4', 0.5], ['D4', 0.5], ['D4', 0.5], ['D4', 0.5],
            ['E4', 1], ['D4', 1], ['C4', 2],
        ]
    },
    {
        name: '16-lavenders-blue',
        title: "Lavender's Blue",
        bpm: 85,
        notes: [
            ['C4', 1], ['D4', 1], ['E4', 1], ['G4', 1], ['E4', 1], ['C5', 2], ['A4', 1],
            ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2], ['R', 1],
            ['C4', 1], ['D4', 1], ['E4', 1], ['G4', 1], ['E4', 1], ['C5', 2], ['A4', 1],
            ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2], ['R', 1],
        ]
    },
    {
        name: '17-golden-slumbers',
        title: 'Golden Slumbers',
        bpm: 75,
        notes: [
            ['E4', 2], ['D4', 1], ['C4', 1], ['E4', 2], ['D4', 1], ['C4', 1],
            ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['D4', 2], ['R', 2],
            ['E4', 2], ['D4', 1], ['C4', 1], ['E4', 1], ['F4', 1], ['G4', 2],
            ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '18-all-the-pretty-horses',
        title: 'All the Pretty Horses',
        bpm: 80,
        notes: [
            ['A4', 1.5], ['G4', 0.5], ['A4', 1], ['C5', 1], ['A4', 1], ['G4', 1], ['E4', 2],
            ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 1], ['E4', 2],
            ['A4', 1.5], ['G4', 0.5], ['A4', 1], ['C5', 1], ['A4', 1], ['G4', 1], ['E4', 2],
            ['E4', 1], ['G4', 1], ['A4', 0.5], ['G4', 0.5], ['E4', 1], ['D4', 1], ['C4', 2], ['R', 1],
        ]
    },
    {
        name: '19-oranges-and-lemons',
        title: 'Oranges and Lemons',
        bpm: 100,
        notes: [
            ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['E4', 1], ['D4', 1], ['E4', 1], ['F4', 2], ['R', 2],
            ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['G4', 2],
            ['F4', 1], ['E4', 1], ['D4', 1], ['E4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '20-jack-and-jill',
        title: 'Jack and Jill',
        bpm: 110,
        notes: [
            ['C4', 0.5], ['D4', 0.5], ['E4', 0.5], ['F4', 0.5], ['G4', 1], ['G4', 1],
            ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 1], ['D4', 1],
            ['E4', 0.5], ['D4', 0.5], ['C4', 0.5], ['D4', 0.5], ['E4', 1], ['C4', 2],
            ['D4', 1], ['E4', 1], ['F4', 1], ['D4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '21-sleep-baby-sleep',
        title: 'Sleep Baby Sleep',
        bpm: 75,
        notes: [
            ['G4', 2], ['E4', 1], ['E4', 1], ['G4', 2], ['E4', 2],
            ['D4', 1], ['E4', 1], ['F4', 1], ['D4', 1], ['C4', 2], ['R', 2],
            ['G4', 2], ['E4', 1], ['E4', 1], ['G4', 2], ['E4', 2],
            ['D4', 1], ['E4', 1], ['F4', 1], ['D4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '22-twinkle-variation-gentle',
        title: 'Twinkle Twinkle (Gentle)',
        bpm: 72,
        notes: [
            ['C5', 1.5], ['C5', 0.5], ['G5', 1.5], ['G5', 0.5], ['A5', 1.5], ['A5', 0.5], ['G5', 2],
            ['F5', 1.5], ['F5', 0.5], ['E5', 1.5], ['E5', 0.5], ['D5', 1.5], ['D5', 0.5], ['C5', 2],
            ['G5', 1.5], ['G5', 0.5], ['F5', 1.5], ['F5', 0.5], ['E5', 1.5], ['E5', 0.5], ['D5', 2],
            ['G5', 1.5], ['G5', 0.5], ['F5', 1.5], ['F5', 0.5], ['E5', 1.5], ['E5', 0.5], ['D5', 2],
            ['C5', 1.5], ['C5', 0.5], ['G5', 1.5], ['G5', 0.5], ['A5', 1.5], ['A5', 0.5], ['G5', 2],
            ['F5', 1.5], ['F5', 0.5], ['E5', 1.5], ['E5', 0.5], ['D5', 1.5], ['D5', 0.5], ['C5', 2],
        ]
    },
    {
        name: '23-humpty-dumpty',
        title: 'Humpty Dumpty',
        bpm: 100,
        notes: [
            ['E4', 1], ['F4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 2],
            ['D4', 1], ['E4', 1], ['F4', 2], ['G4', 2], ['R', 2],
            ['E4', 1], ['F4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['F4', 1], ['E4', 2],
            ['D4', 1], ['G4', 1], ['E4', 1], ['C4', 1], ['C4', 2], ['R', 2],
        ]
    },
    {
        name: '24-ring-around-rosie',
        title: 'Ring Around the Rosie',
        bpm: 105,
        notes: [
            ['E4', 1], ['G4', 1], ['G4', 1], ['E4', 1], ['G4', 1], ['G4', 1],
            ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 2],
            ['D4', 1], ['F4', 1], ['F4', 1], ['D4', 1], ['F4', 1], ['F4', 1],
            ['D4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2],
        ]
    },
    {
        name: '25-star-light-star-bright',
        title: 'Star Light Star Bright',
        bpm: 90,
        notes: [
            ['G4', 1], ['G4', 1], ['A4', 2], ['G4', 1], ['G4', 1], ['E4', 2],
            ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2], ['R', 2],
            ['A4', 1], ['A4', 1], ['B4', 2], ['A4', 1], ['A4', 1], ['G4', 2],
            ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1], ['E4', 1], ['D4', 1], ['C4', 2],
        ]
    },
];

// ═══════════════════════════════════════════════════════════════
// GENERATE ALL FILES
// ═══════════════════════════════════════════════════════════════

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎵 Generating 25 lullaby music box melodies...\n');

const manifest = [];

for (const lullaby of LULLABIES) {
    const filename = `${lullaby.name}.wav`;
    const filePath = path.join(OUTPUT_DIR, filename);

    console.log(`  ♪ ${lullaby.title}...`);
    const samples = buildMelody(lullaby.notes, lullaby.bpm);
    writeWav(filePath, samples);

    const duration = (samples.length / SAMPLE_RATE).toFixed(1);
    const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(0);
    console.log(`    → ${filename} (${duration}s, ${sizeKB} KB)`);

    manifest.push({
        id: lullaby.name,
        title: lullaby.title,
        filename,
        duration: parseFloat(duration),
    });
}

// Write manifest JSON
const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\n✅ Done! Generated ${LULLABIES.length} lullabies in ${OUTPUT_DIR}`);
console.log(`📋 Manifest written to ${manifestPath}`);
