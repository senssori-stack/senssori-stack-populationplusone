import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SendAsGift'>;

// Gift card denominations
const GIFT_CARD_AMOUNTS = [25, 50, 75, 100, 150, 200];

export default function SendAsGiftScreen({ navigation, route }: Props) {
    const designData = route.params || {};

    // Recipient info
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [senderName, setSenderName] = useState('');
    const [personalMessage, setPersonalMessage] = useState('');

    // Delivery scheduling
    const [sendNow, setSendNow] = useState(true);

    // Gift card options
    const [includeGiftCard, setIncludeGiftCard] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    // Baby names for display
    const babyNames = designData.babies && designData.babies.length > 0
        ? designData.babies
            .filter(b => (b.first || '').trim().length > 0)
            .map(b => `${b.first || ''} ${b.middle || ''} ${b.last || ''}`.trim())
            .join(' & ')
        : `${designData.babyFirst || ''} ${designData.babyMiddle || ''} ${designData.babyLast || ''}`.trim() || 'Baby';

    const giftCardTotal = includeGiftCard && selectedAmount ? selectedAmount : 0;

    const formatPrice = (price: number) => `$${price.toFixed(2)}`;

    const handleSendGift = () => {
        // Validation
        if (!recipientName.trim()) {
            Alert.alert('Missing Info', 'Please enter the recipient\'s name.');
            return;
        }
        if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
            Alert.alert('Missing Info', 'Please enter a valid email for the recipient.');
            return;
        }
        if (!senderName.trim()) {
            Alert.alert('Missing Info', 'Please enter your name so they know who it\'s from.');
            return;
        }
        if (includeGiftCard && !selectedAmount) {
            Alert.alert('Missing Info', 'Please select a gift card amount or turn off the gift card option.');
            return;
        }

        // TODO: Process gift order — integrate with gift card API (Tango/Tremendous) and email delivery
        Alert.alert(
            '\uD83C\uDF81 Gift Sending Coming Soon!',
            `We're putting the finishing touches on gift delivery.\n\n` +
            `Your gift for ${recipientName} will include:\n` +
            `\u2022 Digital birth announcement signs for ${babyNames}\n` +
            (includeGiftCard ? `\u2022 ${formatPrice(selectedAmount!)} gift card\n` : '') +
            `\nWe'll notify you when this feature goes live!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <LinearGradient colors={['#9a3412', '#ea580c']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>{'\u2190'} Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'\uD83C\uDF81'} Send as Gift</Text>
                <View style={{ width: 60 }} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* What they'll receive */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{'\uD83D\uDCE8'} What They'll Receive</Text>
                    <Text style={styles.cardDescription}>
                        A beautiful email with the birth announcement designs for{' '}
                        <Text style={{ fontWeight: '800' }}>{babyNames}</Text>, including:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>{'\u2022'} Birth Announcement (Sign Front)</Text>
                        <Text style={styles.bullet}>{'\u2022'} Time Capsule</Text>
                        <Text style={styles.bullet}>{'\u2022'} Natal Chart</Text>
                        <Text style={styles.bullet}>{'\u2022'} Chart Reading Guide</Text>
                        <Text style={styles.bullet}>{'\u2022'} Letter to Baby</Text>
                    </View>
                    <Text style={styles.cardNote}>
                        Recipients can view, save, and order prints directly from the email.
                    </Text>
                </View>

                {/* Recipient Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{'\uD83D\uDC64'} Who's It For?</Text>

                    <Text style={styles.label}>Recipient's Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={recipientName}
                        onChangeText={setRecipientName}
                        placeholder="e.g., Sarah & Mike Johnson"
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Recipient's Email *</Text>
                    <TextInput
                        style={styles.input}
                        value={recipientEmail}
                        onChangeText={setRecipientEmail}
                        placeholder="recipient@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Sender Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{'\u2764\uFE0F'} From You</Text>

                    <Text style={styles.label}>Your Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={senderName}
                        onChangeText={setSenderName}
                        placeholder="e.g., Aunt Lisa"
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Personal Message (optional)</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        value={personalMessage}
                        onChangeText={setPersonalMessage}
                        placeholder="Congratulations on your little one! So happy for your family..."
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{personalMessage.length}/500</Text>
                </View>

                {/* Delivery Timing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{'\u23F0'} When to Send</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, sendNow && styles.toggleBtnActive]}
                            onPress={() => setSendNow(true)}
                        >
                            <Text style={[styles.toggleBtnText, sendNow && styles.toggleBtnTextActive]}>
                                Send Now
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, !sendNow && styles.toggleBtnActive]}
                            onPress={() => {
                                setSendNow(false);
                                Alert.alert('Coming Soon', 'Scheduled delivery will be available soon!');
                                setSendNow(true); // Reset for now
                            }}
                        >
                            <Text style={[styles.toggleBtnText, !sendNow && styles.toggleBtnTextActive]}>
                                Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gift Card Toggle */}
                <View style={styles.section}>
                    <View style={styles.giftCardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.sectionTitle}>{'\uD83C\uDF1F'} Add a Gift Card?</Text>
                            <Text style={styles.giftCardSubtitle}>
                                Include a digital gift card they can use at popular retailers
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.giftToggle, includeGiftCard && styles.giftToggleActive]}
                            onPress={() => {
                                setIncludeGiftCard(!includeGiftCard);
                                if (includeGiftCard) setSelectedAmount(null);
                            }}
                        >
                            <View style={[styles.giftToggleKnob, includeGiftCard && styles.giftToggleKnobActive]} />
                        </TouchableOpacity>
                    </View>

                    {includeGiftCard && (
                        <View style={styles.amountGrid}>
                            {GIFT_CARD_AMOUNTS.map(amount => (
                                <TouchableOpacity
                                    key={amount}
                                    style={[styles.amountBtn, selectedAmount === amount && styles.amountBtnActive]}
                                    onPress={() => setSelectedAmount(amount)}
                                >
                                    <Text style={[styles.amountBtnText, selectedAmount === amount && styles.amountBtnTextActive]}>
                                        ${amount}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.giftCardNote}>
                                {'\uD83C\uDF10'} Powered by our gift card partner. Redeemable at 100+ retailers.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Gift Summary</Text>

                    <View style={styles.summaryLine}>
                        <Text style={styles.summaryLabel}>{'\uD83D\uDCE8'} Digital Signs Email</Text>
                        <Text style={styles.summaryValue}>FREE</Text>
                    </View>

                    {includeGiftCard && selectedAmount && (
                        <View style={styles.summaryLine}>
                            <Text style={styles.summaryLabel}>{'\uD83C\uDF81'} Gift Card</Text>
                            <Text style={styles.summaryValue}>{formatPrice(selectedAmount)}</Text>
                        </View>
                    )}

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryLine}>
                        <Text style={styles.summaryTotalLabel}>Total</Text>
                        <Text style={styles.summaryTotalValue}>
                            {giftCardTotal > 0 ? formatPrice(giftCardTotal) : 'FREE'}
                        </Text>
                    </View>
                </View>

                {/* Send Button */}
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendGift}>
                    <Text style={styles.sendBtnText}>
                        {giftCardTotal > 0
                            ? `Send Gift \u2014 ${formatPrice(giftCardTotal)}`
                            : 'Send Gift \u2014 Free!'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    {'\uD83D\uDD12'} Your recipient's information is kept private and only used for delivery.
                </Text>

                <View style={{ height: 60 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fef7f0' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backBtn: { padding: 8 },
    backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '800' },

    content: { flex: 1 },

    // What they'll receive card
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
    cardDescription: { fontSize: 14, color: '#4a5568', lineHeight: 20 },
    bulletList: { marginTop: 12, marginLeft: 8 },
    bullet: { fontSize: 14, color: '#2d3748', lineHeight: 24, fontWeight: '500' },
    cardNote: { fontSize: 12, color: '#667eea', fontWeight: '600', marginTop: 12 },

    // Sections
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },

    // Form inputs
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 14, marginBottom: 6 },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    messageInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: { fontSize: 12, color: '#a0aec0', textAlign: 'right', marginTop: 4 },

    // Delivery toggle
    toggleRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    toggleBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    toggleBtnActive: { borderColor: '#ea580c', backgroundColor: '#fff7ed' },
    toggleBtnText: { fontSize: 16, fontWeight: '700', color: '#718096' },
    toggleBtnTextActive: { color: '#ea580c' },

    // Gift card toggle
    giftCardHeader: { flexDirection: 'row', alignItems: 'center' },
    giftCardSubtitle: { fontSize: 13, color: '#718096', marginTop: 2 },
    giftToggle: {
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        paddingHorizontal: 3,
        marginLeft: 12,
    },
    giftToggleActive: { backgroundColor: '#ea580c' },
    giftToggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    giftToggleKnobActive: { alignSelf: 'flex-end' },

    // Gift card amounts
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    amountBtn: {
        width: '30%',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    amountBtnActive: { borderColor: '#ea580c', backgroundColor: '#fff7ed' },
    amountBtnText: { fontSize: 18, fontWeight: '700', color: '#4a5568' },
    amountBtnTextActive: { color: '#ea580c' },
    giftCardNote: {
        fontSize: 12,
        color: '#a0aec0',
        marginTop: 8,
        width: '100%',
        textAlign: 'center',
    },

    // Summary
    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
    summaryLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: { fontSize: 15, color: '#4a5568' },
    summaryValue: { fontSize: 15, fontWeight: '700', color: '#2d3748' },
    summaryDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
    summaryTotalLabel: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
    summaryTotalValue: { fontSize: 22, fontWeight: '900', color: '#ea580c' },

    // Send button
    sendBtn: {
        backgroundColor: '#ea580c',
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#ea580c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },

    disclaimer: {
        fontSize: 12,
        color: '#a0aec0',
        textAlign: 'center',
        marginTop: 14,
        marginHorizontal: 16,
    },
});
