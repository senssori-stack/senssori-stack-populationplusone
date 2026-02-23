import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── TYPES ──────────────────────────────────────
interface Track {
    id: string;
    title: string;
    filename: string;
    duration: number;
}

// ─── MANIFEST (bundled) ─────────────────────────
const manifest: Track[] = require('../../assets/lullabies/manifest.json');

// ─── WAV ASSET MAP ──────────────────────────────
// expo-av needs require() for bundled assets.  Map each filename → require().
const wavAssets: Record<string, any> = {
    '01-twinkle-twinkle-little-star.wav': require('../../assets/lullabies/01-twinkle-twinkle-little-star.wav'),
    '02-brahms-lullaby.wav': require('../../assets/lullabies/02-brahms-lullaby.wav'),
    '03-rock-a-bye-baby.wav': require('../../assets/lullabies/03-rock-a-bye-baby.wav'),
    '04-hush-little-baby.wav': require('../../assets/lullabies/04-hush-little-baby.wav'),
    '05-mary-had-a-little-lamb.wav': require('../../assets/lullabies/05-mary-had-a-little-lamb.wav'),
    '06-frere-jacques.wav': require('../../assets/lullabies/06-frere-jacques.wav'),
    '07-baa-baa-black-sheep.wav': require('../../assets/lullabies/07-baa-baa-black-sheep.wav'),
    '08-london-bridge.wav': require('../../assets/lullabies/08-london-bridge.wav'),
    '09-row-row-row-your-boat.wav': require('../../assets/lullabies/09-row-row-row-your-boat.wav'),
    '10-old-macdonald.wav': require('../../assets/lullabies/10-old-macdonald.wav'),
    '11-itsy-bitsy-spider.wav': require('../../assets/lullabies/11-itsy-bitsy-spider.wav'),
    '12-hickory-dickory-dock.wav': require('../../assets/lullabies/12-hickory-dickory-dock.wav'),
    '13-three-blind-mice.wav': require('../../assets/lullabies/13-three-blind-mice.wav'),
    '14-this-old-man.wav': require('../../assets/lullabies/14-this-old-man.wav'),
    '15-hot-cross-buns.wav': require('../../assets/lullabies/15-hot-cross-buns.wav'),
    '16-lavenders-blue.wav': require('../../assets/lullabies/16-lavenders-blue.wav'),
    '17-golden-slumbers.wav': require('../../assets/lullabies/17-golden-slumbers.wav'),
    '18-all-the-pretty-horses.wav': require('../../assets/lullabies/18-all-the-pretty-horses.wav'),
    '19-oranges-and-lemons.wav': require('../../assets/lullabies/19-oranges-and-lemons.wav'),
    '20-jack-and-jill.wav': require('../../assets/lullabies/20-jack-and-jill.wav'),
    '21-sleep-baby-sleep.wav': require('../../assets/lullabies/21-sleep-baby-sleep.wav'),
    '22-twinkle-variation-gentle.wav': require('../../assets/lullabies/22-twinkle-variation-gentle.wav'),
    '23-humpty-dumpty.wav': require('../../assets/lullabies/23-humpty-dumpty.wav'),
    '24-ring-around-rosie.wav': require('../../assets/lullabies/24-ring-around-rosie.wav'),
    '25-star-light-star-bright.wav': require('../../assets/lullabies/25-star-light-star-bright.wav'),
};

const { width } = Dimensions.get('window');

// ─── HELPERS ────────────────────────────────────
function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── COMPONENT ──────────────────────────────────
export default function LullabyPlayerScreen() {
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const soundRef = useRef<any>(null);
    const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Lazy-load Audio from expo-av ─────────
    const AudioRef = useRef<typeof import('expo-av').Audio | null>(null);
    const getAudio = useCallback(async () => {
        if (!AudioRef.current) {
            const mod = await import('expo-av');
            AudioRef.current = mod.Audio;
            // Configure audio session for Bluetooth / background / silent-mode
            await mod.Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        }
        return AudioRef.current;
    }, []);

    // ── Cleanup on unmount ───────────────────
    useEffect(() => {
        return () => {
            if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
            soundRef.current?.unloadAsync?.();
        };
    }, []);

    // ── Stop position polling ────────────────
    const stopPolling = useCallback(() => {
        if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
            positionIntervalRef.current = null;
        }
    }, []);

    // ── Play a track ─────────────────────────
    const playTrack = useCallback(async (index: number) => {
        const Audio = await getAudio();
        stopPolling();

        // Unload previous
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }

        const track = manifest[index];
        const asset = wavAssets[track.filename];
        if (!asset) return;

        const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: true,
            isLooping,
        });

        soundRef.current = sound;
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        setPosition(0);
        setDuration(track.duration);

        // Poll position every 500ms
        positionIntervalRef.current = setInterval(async () => {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    setPosition(status.positionMillis / 1000);
                    if (status.durationMillis) {
                        setDuration(status.durationMillis / 1000);
                    }
                    // Track ended?
                    if (status.didJustFinish && !status.isLooping) {
                        handleTrackEnd(index);
                    }
                }
            } catch { /* sound may have been unloaded */ }
        }, 500);

        // Listen for playback end
        sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded && status.didJustFinish && !status.isLooping) {
                handleTrackEnd(index);
            }
        });
    }, [getAudio, isLooping, stopPolling]);

    // ── Handle track ending ──────────────────
    const handleTrackEnd = useCallback((finishedIndex: number) => {
        stopPolling();
        if (isShuffle) {
            let next = Math.floor(Math.random() * manifest.length);
            while (next === finishedIndex && manifest.length > 1) {
                next = Math.floor(Math.random() * manifest.length);
            }
            playTrack(next);
        } else if (finishedIndex < manifest.length - 1) {
            playTrack(finishedIndex + 1);
        } else {
            setIsPlaying(false);
            setPosition(0);
        }
    }, [isShuffle, stopPolling, playTrack]);

    // ── Toggle play/pause ────────────────────
    const togglePlayPause = useCallback(async () => {
        if (!soundRef.current) {
            if (currentTrackIndex !== null) playTrack(currentTrackIndex);
            else playTrack(0);
            return;
        }
        if (isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    }, [isPlaying, currentTrackIndex, playTrack]);

    // ── Skip next/prev ───────────────────────
    const skipNext = useCallback(() => {
        if (currentTrackIndex === null) { playTrack(0); return; }
        const next = isShuffle
            ? Math.floor(Math.random() * manifest.length)
            : (currentTrackIndex + 1) % manifest.length;
        playTrack(next);
    }, [currentTrackIndex, isShuffle, playTrack]);

    const skipPrev = useCallback(() => {
        if (currentTrackIndex === null) { playTrack(0); return; }
        // If >3s into the track, restart it
        if (position > 3) { playTrack(currentTrackIndex); return; }
        const prev = (currentTrackIndex - 1 + manifest.length) % manifest.length;
        playTrack(prev);
    }, [currentTrackIndex, position, playTrack]);

    // ── Toggle loop ──────────────────────────
    const toggleLoop = useCallback(async () => {
        const next = !isLooping;
        setIsLooping(next);
        if (soundRef.current) {
            await soundRef.current.setIsLoopingAsync(next);
        }
    }, [isLooping]);

    // ── Toggle shuffle ───────────────────────
    const toggleShuffle = useCallback(() => {
        setIsShuffle(s => !s);
    }, []);

    // ── Progress bar width ───────────────────
    const progress = duration > 0 ? position / duration : 0;

    // ── Current track info ───────────────────
    const currentTrack = currentTrackIndex !== null ? manifest[currentTrackIndex] : null;

    // ── Render a track row ───────────────────
    const renderTrack = ({ item, index }: { item: Track; index: number }) => {
        const active = index === currentTrackIndex;
        return (
            <TouchableOpacity
                style={[styles.trackRow, active && styles.trackRowActive]}
                onPress={() => playTrack(index)}
                activeOpacity={0.7}
            >
                <View style={styles.trackNumber}>
                    {active && isPlaying ? (
                        <Ionicons name="musical-notes" size={16} color="#93c5fd" />
                    ) : (
                        <Text style={[styles.trackNumText, active && styles.trackNumActive]}>
                            {index + 1}
                        </Text>
                    )}
                </View>
                <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, active && styles.trackTitleActive]} numberOfLines={1}>
                        {item.title}
                    </Text>
                </View>
                <Text style={styles.trackDuration}>{formatTime(item.duration)}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient colors={['#0a0e27', '#1a1040', '#0a0e27']} style={styles.container}>
            {/* ─ Header ─ */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🎵</Text>
                <Text style={styles.headerTitle}>Lullabies</Text>
                <Text style={styles.headerSub}>
                    Music-box melodies for your little one
                </Text>
                <Text style={styles.bluetoothNote}>
                    🔊 Works with Bluetooth speakers & headphones
                </Text>
            </View>

            {/* ─ Track list ─ */}
            <FlatList
                data={manifest}
                renderItem={renderTrack}
                keyExtractor={item => item.id}
                style={styles.trackList}
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
            />

            {/* ─ Now-Playing Bar ─ */}
            <View style={styles.playerBar}>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

                {/* Track title */}
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                    {currentTrack ? currentTrack.title : 'Select a lullaby'}
                </Text>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity onPress={toggleShuffle} style={styles.controlBtn}>
                        <Ionicons
                            name="shuffle"
                            size={22}
                            color={isShuffle ? '#93c5fd' : '#64748b'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={skipPrev} style={styles.controlBtn}>
                        <Ionicons name="play-skip-back" size={28} color="#e2e8f0" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={36}
                            color="#0a0e27"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={skipNext} style={styles.controlBtn}>
                        <Ionicons name="play-skip-forward" size={28} color="#e2e8f0" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleLoop} style={styles.controlBtn}>
                        <Ionicons
                            name="repeat"
                            size={22}
                            color={isLooping ? '#93c5fd' : '#64748b'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

// ─── STYLES ─────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { paddingTop: Platform.OS === 'ios' ? 60 : 20, paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' },
    headerEmoji: { fontSize: 40, marginBottom: 4 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
    bluetoothNote: { fontSize: 12, color: '#64748b', marginTop: 8, textAlign: 'center' },

    // Track list
    trackList: { flex: 1, paddingHorizontal: 16 },
    trackRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 12,
        borderRadius: 10, marginBottom: 2,
    },
    trackRowActive: { backgroundColor: 'rgba(147,197,253,0.1)' },
    trackNumber: { width: 32, alignItems: 'center' },
    trackNumText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
    trackNumActive: { color: '#93c5fd' },
    trackInfo: { flex: 1, marginHorizontal: 12 },
    trackTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
    trackTitleActive: { color: '#93c5fd' },
    trackDuration: { color: '#64748b', fontSize: 13 },

    // Player bar
    playerBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(15,23,42,0.97)',
        borderTopWidth: 1, borderColor: '#1e293b',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingHorizontal: 20, paddingTop: 8,
    },
    progressContainer: {
        height: 3, backgroundColor: '#1e293b', borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#93c5fd', borderRadius: 2 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    timeText: { color: '#64748b', fontSize: 11 },
    nowPlayingTitle: {
        color: '#fff', fontSize: 15, fontWeight: '700',
        textAlign: 'center', marginVertical: 6,
    },
    controls: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 4,
    },
    controlBtn: { padding: 12 },
    playBtn: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#93c5fd', justifyContent: 'center', alignItems: 'center',
        marginHorizontal: 16,
    },
});
