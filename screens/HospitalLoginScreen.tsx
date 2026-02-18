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
import { useHospital } from '../src/context/HospitalContext';
import type { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalLogin'>;

export default function HospitalLoginScreen({ navigation }: Props) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithCode, hospital, logout, isPartnerSession } = useHospital();

    const handleSubmit = () => {
        if (!code.trim()) {
            setError('Please enter an access code');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate brief loading for better UX
        setTimeout(() => {
            const result = loginWithCode(code);
            setIsLoading(false);

            if (result.success && result.hospital) {
                Alert.alert(
                    '🎉 Welcome!',
                    `You're now connected to ${result.hospital.name}!\n\n${result.hospital.tagline || 'Thank you for partnering with us.'}`,
                    [
                        {
                            text: 'Start Creating!',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
                setCode('');
            } else {
                setError(result.error || 'Invalid code');
            }
        }, 500);
    };

    const handleLogout = () => {
        Alert.alert(
            'Disconnect Hospital?',
            'You can still use the app, but hospital branding will be removed from your announcements.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        setCode('');
                    },
                },
            ]
        );
    };

    return (
        <LinearGradient colors={['#1a472a', '#2d6a3f', '#3d8b4f']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🏥</Text>
                        <Text style={styles.title}>Hospital Partner Portal</Text>
                        <Text style={styles.subtitle}>
                            For maternity staff & new parents
                        </Text>
                    </View>

                    {isPartnerSession && hospital ? (
                        // Already connected - show status
                        <View style={styles.connectedCard}>
                            <Text style={styles.connectedEmoji}>✅</Text>
                            <Text style={styles.connectedTitle}>Connected!</Text>
                            <Text style={styles.hospitalName}>{hospital.name}</Text>
                            <Text style={styles.hospitalLocation}>
                                {hospital.city}, {hospital.state}
                            </Text>
                            {hospital.tagline && (
                                <Text style={styles.hospitalTagline}>"{hospital.tagline}"</Text>
                            )}

                            <View style={styles.connectedInfo}>
                                <Text style={styles.connectedInfoText}>
                                    🎨 Hospital branding will appear on your announcements
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.createButtonText}>
                                    ← Back to Create
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleLogout}
                            >
                                <Text style={styles.disconnectButtonText}>
                                    Disconnect Hospital
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Not connected - show login form
                        <>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Enter Access Code</Text>
                                <Text style={styles.cardDescription}>
                                    Hospital staff provides this code to new parents.
                                    Enter it below to add your hospital's branding to announcements!
                                </Text>

                                <TextInput
                                    style={[styles.input, error ? styles.inputError : null]}
                                    placeholder="e.g., MERCY2026"
                                    placeholderTextColor="#999"
                                    value={code}
                                    onChangeText={(text) => {
                                        setCode(text.toUpperCase());
                                        setError('');
                                    }}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    returnKeyType="go"
                                    onSubmitEditing={handleSubmit}
                                />

                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isLoading ? 'Connecting...' : '🔗 Connect Hospital'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Info Section */}
                            <View style={styles.infoSection}>
                                <Text style={styles.infoTitle}>Why Connect?</Text>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoEmoji}>🏥</Text>
                                    <Text style={styles.infoText}>
                                        Your hospital's name & logo appear on announcements
                                    </Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoEmoji}>🎁</Text>
                                    <Text style={styles.infoText}>
                                        Special keepsake celebrating where your baby was born
                                    </Text>
                                </View>

                                <View style={styles.infoItem}>
                                    <Text style={styles.infoEmoji}>❤️</Text>
                                    <Text style={styles.infoText}>
                                        Share the love with the care team that helped you
                                    </Text>
                                </View>
                            </View>

                            {/* No Code Section */}
                            <View style={styles.noCodeSection}>
                                <Text style={styles.noCodeTitle}>Don't have a code?</Text>
                                <Text style={styles.noCodeText}>
                                    No problem! You can still create beautiful announcements.
                                    Ask your nurse if your hospital partners with Population +1™.
                                </Text>

                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.skipButtonText}>
                                        Continue Without Code →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a472a',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
        color: '#333',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButtonLoading: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    infoEmoji: {
        fontSize: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
    },
    noCodeSection: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    noCodeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    noCodeText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    skipButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Connected state styles
    connectedCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    connectedEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    connectedTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#27ae60',
        marginBottom: 16,
    },
    hospitalName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a472a',
        textAlign: 'center',
    },
    hospitalLocation: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    hospitalTagline: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
        marginTop: 12,
        textAlign: 'center',
    },
    connectedInfo: {
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 20,
    },
    connectedInfoText: {
        fontSize: 14,
        color: '#2e7d32',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginBottom: 12,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    disconnectButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    disconnectButtonText: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: '600',
    },
});
