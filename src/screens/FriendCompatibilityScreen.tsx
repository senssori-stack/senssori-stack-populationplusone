import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ScrollableDatePicker from '../../components/ScrollableDatePicker';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendCompatibility'>;

const STORAGE_KEY = '@friend_compatibility_list';
const TOGGLE_KEY = '@friend_compatibility_enabled';

interface Friend {
    id: string;
    name: string;
    birthday: string; // ISO string
}

// ─── Zodiac Data ────────────────────────────────────────────
const SIGNS = [
    { name: 'Aries', symbol: '♈', element: 'Fire', color: '#F44336' },
    { name: 'Taurus', symbol: '♉', element: 'Earth', color: '#8BC34A' },
    { name: 'Gemini', symbol: '♊', element: 'Air', color: '#FFC107' },
    { name: 'Cancer', symbol: '♋', element: 'Water', color: '#90CAF9' },
    { name: 'Leo', symbol: '♌', element: 'Fire', color: '#FF9800' },
    { name: 'Virgo', symbol: '♍', element: 'Earth', color: '#795548' },
    { name: 'Libra', symbol: '♎', element: 'Air', color: '#E91E63' },
    { name: 'Scorpio', symbol: '♏', element: 'Water', color: '#9C27B0' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire', color: '#7C4DFF' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth', color: '#607D8B' },
    { name: 'Aquarius', symbol: '♒', element: 'Air', color: '#00BCD4' },
    { name: 'Pisces', symbol: '♓', element: 'Water', color: '#3F51B5' },
];

const COMPAT_MATRIX: number[][] = [
    [50, 38, 83, 42, 97, 63, 85, 50, 93, 47, 78, 67],
    [38, 50, 33, 97, 73, 90, 65, 88, 30, 95, 58, 85],
    [83, 33, 50, 25, 88, 68, 93, 28, 85, 60, 95, 53],
    [42, 97, 25, 50, 35, 78, 43, 94, 53, 60, 25, 98],
    [97, 73, 88, 35, 50, 55, 97, 58, 93, 35, 68, 48],
    [63, 90, 68, 78, 55, 50, 28, 77, 48, 95, 40, 88],
    [85, 65, 93, 43, 97, 28, 50, 35, 73, 40, 90, 68],
    [50, 88, 28, 94, 58, 77, 35, 50, 28, 80, 53, 97],
    [93, 30, 85, 53, 93, 48, 73, 28, 50, 35, 88, 63],
    [47, 95, 60, 60, 35, 95, 40, 80, 35, 50, 68, 78],
    [78, 58, 95, 25, 68, 40, 90, 53, 88, 68, 50, 45],
    [67, 85, 53, 98, 48, 88, 68, 97, 63, 78, 45, 50],
];

const COMPAT_DESCRIPTIONS: Record<string, string> = {
    'Fire-Fire': 'Explosive passion! You push each other to be your best. This pairing burns bright — just give each other space.',
    'Fire-Earth': 'Fire inspires while Earth grounds. Ambition meets practicality — a stabilizing partnership.',
    'Fire-Air': 'Dynamic and exciting! Air fans Fire\'s flames — great intellectual and physical chemistry.',
    'Fire-Water': 'Steam! Intensity meets depth. Can be transformative but requires patience from both sides.',
    'Earth-Earth': 'Two grounded souls building something lasting. Great for long-term security and shared goals.',
    'Earth-Air': 'Air brings fresh ideas, Earth provides structure. Balance freedom and stability for the best results.',
    'Earth-Water': 'A natural, nurturing combination. One of the most compatible element pairings for lasting connection.',
    'Air-Air': 'Brilliant minds that never run out of conversation. Socially vibrant — intellectual soulmates.',
    'Air-Water': 'Logic meets emotion — challenging but growth-oriented. When balanced, creates profound understanding.',
    'Water-Water': 'Deep emotional connection and intuitive understanding. A psychic bond — just watch the emotional tides.',
};

const CATEGORIES = [
    { name: 'Love & Romance', icon: '❤️', m1: 3, m2: 7, mod: 15, off: 5 },
    { name: 'Communication', icon: '💬', m1: 5, m2: 3, mod: 20, off: 8 },
    { name: 'Trust', icon: '🤝', m1: 7, m2: 5, mod: 18, off: 7 },
    { name: 'Shared Values', icon: '🎯', m1: 2, m2: 9, mod: 16, off: 6 },
    { name: 'Emotional Bond', icon: '💫', m1: 4, m2: 6, mod: 14, off: 4 },
];

function getSign(date: Date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 0;
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 1;
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 2;
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 3;
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 4;
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 5;
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 6;
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 7;
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 8;
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 9;
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 10;
    return 11;
}

function getScoreLabel(score: number) {
    if (score >= 80) return { text: 'Soulmates!', color: '#4CAF50' };
    if (score >= 60) return { text: 'Great Match', color: '#FFC107' };
    if (score >= 40) return { text: 'With Effort', color: '#FF9800' };
    return { text: 'Challenging', color: '#F44336' };
}

function getElementPairKey(e1: string, e2: string): string {
    return [e1, e2].sort().join('-');
}

// ─── Component ──────────────────────────────────────────────
export default function FriendCompatibilityScreen({ route }: Props) {
    const userBirthDate = new Date(route.params.birthDate);
    const userSignIdx = getSign(userBirthDate);
    const userSign = SIGNS[userSignIdx];

    const [enabled, setEnabled] = useState(true);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailIdx, setShowDetailIdx] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const [newBirthday, setNewBirthday] = useState(new Date(1995, 5, 15));
    const [showPicker, setShowPicker] = useState(false);

    // Load from storage
    useEffect(() => {
        AsyncStorage.getItem(TOGGLE_KEY).then(val => {
            if (val !== null) setEnabled(val === 'true');
        });
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val) setFriends(JSON.parse(val));
        });
    }, []);

    const saveFriends = useCallback(async (list: Friend[]) => {
        setFriends(list);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }, []);

    const toggleEnabled = useCallback(async (val: boolean) => {
        setEnabled(val);
        await AsyncStorage.setItem(TOGGLE_KEY, val.toString());
    }, []);

    const addFriend = useCallback(() => {
        const trimmed = newName.trim();
        if (!trimmed) {
            Alert.alert('Name Required', 'Please enter your friend\'s name.');
            return;
        }
        const friend: Friend = {
            id: Date.now().toString(),
            name: trimmed,
            birthday: newBirthday.toISOString(),
        };
        saveFriends([...friends, friend]);
        setNewName('');
        setNewBirthday(new Date(1995, 5, 15));
        setShowAddModal(false);
    }, [newName, newBirthday, friends, saveFriends]);

    const removeFriend = useCallback((id: string) => {
        Alert.alert('Remove Friend', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => saveFriends(friends.filter(f => f.id !== id)) },
        ]);
    }, [friends, saveFriends]);

    const shareFriend = useCallback(async (friend: Friend, score: number) => {
        const friendSign = SIGNS[getSign(new Date(friend.birthday))];
        await Share.share({
            message: `I just found out ${friend.name} and I are ${score}% cosmically compatible! (${userSign.symbol} ${userSign.name} + ${friendSign.symbol} ${friendSign.name}). Check your cosmic profile on Population Plus One! 🌟`,
        });
    }, [userSign]);

    // Compute ranked list
    const ranked = friends
        .map(f => {
            const fIdx = getSign(new Date(f.birthday));
            const score = COMPAT_MATRIX[userSignIdx][fIdx];
            return { friend: f, signIdx: fIdx, score };
        })
        .sort((a, b) => b.score - a.score);

    const detailItem = showDetailIdx !== null ? ranked[showDetailIdx] : null;

    return (
        <LinearGradient colors={['#1a0033', '#0d1b2a', '#1b2838']} style={styles.gradient}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <Text style={styles.title}>👫 Friend Compatibility</Text>
                <Text style={styles.subtitle}>
                    You are {userSign.symbol} {userSign.name} — see how you match with your friends!
                </Text>

                {/* ON/OFF toggle */}
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Show Friend Rankings</Text>
                    <Switch
                        value={enabled}
                        onValueChange={toggleEnabled}
                        trackColor={{ false: '#555', true: 'rgba(100,181,246,0.5)' }}
                        thumbColor={enabled ? '#64B5F6' : '#999'}
                    />
                </View>

                {enabled && (
                    <>
                        {/* Add friend button */}
                        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.addBtnText}>+ Add a Friend</Text>
                        </TouchableOpacity>

                        {/* Ranked list */}
                        {ranked.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyEmoji}>🌟</Text>
                                <Text style={styles.emptyText}>Add friends to see who you're most compatible with!</Text>
                            </View>
                        ) : (
                            ranked.map((item, idx) => {
                                const sign = SIGNS[item.signIdx];
                                const label = getScoreLabel(item.score);
                                return (
                                    <TouchableOpacity
                                        key={item.friend.id}
                                        style={styles.friendCard}
                                        onPress={() => setShowDetailIdx(idx)}
                                        onLongPress={() => removeFriend(item.friend.id)}
                                    >
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>#{idx + 1}</Text>
                                        </View>
                                        <View style={styles.friendInfo}>
                                            <Text style={styles.friendName}>{item.friend.name}</Text>
                                            <Text style={styles.friendSign}>
                                                {sign.symbol} {sign.name} • {sign.element}
                                            </Text>
                                        </View>
                                        <View style={styles.scoreCol}>
                                            <Text style={[styles.scoreNum, { color: label.color }]}>{item.score}%</Text>
                                            <Text style={[styles.scoreLabel, { color: label.color }]}>{label.text}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}

                        {friends.length > 0 && (
                            <Text style={styles.hintText}>Long press a friend to remove them</Text>
                        )}
                    </>
                )}
            </ScrollView>

            {/* ─── Add Friend Modal ──────────────────────────── */}
            <Modal visible={showAddModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add a Friend</Text>

                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Friend's name"
                            placeholderTextColor="#888"
                            value={newName}
                            onChangeText={setNewName}
                            maxLength={40}
                        />

                        <Text style={styles.inputLabel}>Birthday</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
                            <Text style={styles.dateBtnText}>
                                {newBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddModal(false); setNewName(''); }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addFriend}>
                                <Text style={styles.saveBtnText}>Add Friend</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ─── Date Picker Modal ─────────────────────────── */}
            <ScrollableDatePicker
                visible={showPicker}
                date={newBirthday}
                onDateChange={setNewBirthday}
                onClose={() => setShowPicker(false)}
                title="Pick Birthday"
            />

            {/* ─── Detail Modal ──────────────────────────────── */}
            <Modal visible={detailItem !== null} transparent animationType="fade">
                {detailItem && (() => {
                    const sign = SIGNS[detailItem.signIdx];
                    const label = getScoreLabel(detailItem.score);
                    const elementKey = getElementPairKey(userSign.element, sign.element);
                    const elementDesc = COMPAT_DESCRIPTIONS[elementKey] || '';
                    const cats = CATEGORIES.map(c => ({
                        ...c,
                        score: Math.min(100, detailItem.score + Math.round((userSignIdx * c.m1 + detailItem.signIdx * c.m2) % c.mod) - c.off),
                    }));
                    return (
                        <View style={styles.modalOverlay}>
                            <View style={styles.detailCard}>
                                <ScrollView>
                                    <Text style={styles.detailHeader}>
                                        {userSign.symbol} {userSign.name}  ×  {sign.symbol} {sign.name}
                                    </Text>
                                    <Text style={styles.detailName}>{detailItem.friend.name}</Text>
                                    <View style={styles.detailScoreRow}>
                                        <Text style={[styles.detailScore, { color: label.color }]}>{detailItem.score}%</Text>
                                        <Text style={[styles.detailLabel, { color: label.color }]}>{label.text}</Text>
                                    </View>

                                    <Text style={styles.detailElementTitle}>
                                        {userSign.element} + {sign.element}
                                    </Text>
                                    <Text style={styles.detailElementDesc}>{elementDesc}</Text>

                                    {/* Category bars */}
                                    {cats.map(c => (
                                        <View key={c.name} style={styles.catRow}>
                                            <Text style={styles.catLabel}>{c.icon} {c.name}</Text>
                                            <View style={styles.catBarBg}>
                                                <View style={[styles.catBarFill, {
                                                    width: `${c.score}%`,
                                                    backgroundColor: c.score >= 70 ? '#4CAF50' : c.score >= 50 ? '#FFC107' : '#FF9800',
                                                }]} />
                                            </View>
                                            <Text style={styles.catScore}>{c.score}%</Text>
                                        </View>
                                    ))}

                                    {/* Share button */}
                                    <TouchableOpacity
                                        style={styles.shareBtn}
                                        onPress={() => shareFriend(detailItem.friend, detailItem.score)}
                                    >
                                        <Text style={styles.shareBtnText}>📤 Share with {detailItem.friend.name}</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDetailIdx(null)}>
                                    <Text style={styles.closeBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })()}
            </Modal>
        </LinearGradient>
    );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 10 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 6, marginBottom: 16 },
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 16,
    },
    toggleLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
    addBtn: {
        backgroundColor: 'rgba(100,181,246,0.25)', borderRadius: 12, padding: 14,
        alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(100,181,246,0.4)',
    },
    addBtnText: { fontSize: 16, fontWeight: '700', color: '#64B5F6' },
    emptyBox: {
        alignItems: 'center', padding: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    friendCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 14, marginBottom: 10,
    },
    rankBadge: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,213,79,0.2)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    rankText: { fontSize: 14, fontWeight: '800', color: '#FFD54F' },
    friendInfo: { flex: 1 },
    friendName: { fontSize: 16, fontWeight: '700', color: '#fff' },
    friendSign: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    scoreCol: { alignItems: 'flex-end' },
    scoreNum: { fontSize: 22, fontWeight: '800' },
    scoreLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
    hintText: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 4, marginBottom: 12 },

    // Modals
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
    },
    modalCard: {
        width: '88%', backgroundColor: '#1e1e2e', borderRadius: 20, padding: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 6, marginTop: 10 },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12,
        color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    dateBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    dateBtnText: { color: '#fff', fontSize: 15, textAlign: 'center' },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
    cancelBtn: {
        flex: 1, padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
    },
    cancelBtnText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
    saveBtn: {
        flex: 1, padding: 14, borderRadius: 12, backgroundColor: 'rgba(100,181,246,0.3)',
        alignItems: 'center', borderWidth: 1, borderColor: '#64B5F6',
    },
    saveBtnText: { color: '#64B5F6', fontSize: 15, fontWeight: '700' },

    // Detail modal
    detailCard: {
        width: '92%', maxHeight: '85%', backgroundColor: '#1e1e2e', borderRadius: 20, padding: 24,
    },
    detailHeader: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
    detailName: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4, marginBottom: 12 },
    detailScoreRow: { alignItems: 'center', marginBottom: 16 },
    detailScore: { fontSize: 48, fontWeight: '900' },
    detailLabel: { fontSize: 16, fontWeight: '700', marginTop: 2 },
    detailElementTitle: {
        fontSize: 14, fontWeight: '700', color: '#FFD54F', textAlign: 'center', marginBottom: 6,
    },
    detailElementDesc: {
        fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20,
        marginBottom: 20, paddingHorizontal: 8,
    },
    catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    catLabel: { width: 130, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    catBarBg: {
        flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden',
    },
    catBarFill: { height: '100%', borderRadius: 5 },
    catScore: { width: 38, fontSize: 12, color: '#fff', fontWeight: '700', textAlign: 'right' },
    shareBtn: {
        marginTop: 20, padding: 14, borderRadius: 12, backgroundColor: 'rgba(100,181,246,0.2)',
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(100,181,246,0.4)',
    },
    shareBtnText: { color: '#64B5F6', fontSize: 15, fontWeight: '700' },
    closeBtn: {
        marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center',
    },
    closeBtnText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
});
