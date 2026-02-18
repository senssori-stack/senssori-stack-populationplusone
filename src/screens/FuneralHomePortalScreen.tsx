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

type Props = NativeStackScreenProps<RootStackParamList, 'FuneralHomePortal'>;

// Sample funeral home database
const FUNERAL_HOME_DATABASE = [
    {
        id: 'demo-funeral',
        name: 'Demo Funeral Home',
        code: 'DEMO-FH',
        city: 'Anytown',
        state: 'USA',
        tagline: 'Compassionate Care in Difficult Times',
        isActive: true,
    },
    {
        id: 'eternal-rest',
        name: 'Eternal Rest Funeral Services',
        code: 'ETERNAL26',
        city: 'Springfield',
        state: 'IL',
        primaryColor: '#2c3e50',
        tagline: 'Honoring Lives, Celebrating Memories',
        isActive: true,
    },
    {
        id: 'peaceful-gardens',
        name: 'Peaceful Gardens Memorial',
        code: 'PEACEFUL',
        city: 'Chicago',
        state: 'IL',
        primaryColor: '#1a472a',
        tagline: 'A Place of Peace and Remembrance',
        isActive: true,
    },
];

export default function FuneralHomePortalScreen({ navigation }: Props) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectedHome, setConnectedHome] = useState<typeof FUNERAL_HOME_DATABASE[0] | null>(null);

    const handleSubmit = () => {
        if (!code.trim()) {
            setError('Please enter an access code');
            return;
        }

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const normalizedCode = code.trim().toUpperCase();
            const found = FUNERAL_HOME_DATABASE.find(
                h => h.code.toUpperCase() === normalizedCode && h.isActive
            );

            setIsLoading(false);

            if (found) {
                setConnectedHome(found);
                Alert.alert(
                    '🕊️ Connected',
                    `Welcome to ${found.name}\n\n${found.tagline}`,
                    [{ text: 'OK' }]
                );
                setCode('');
            } else {
                setError('Invalid access code. Please contact your funeral home administrator.');
            }
        }, 500);
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect?',
            'Are you sure you want to disconnect from this funeral home?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: () => setConnectedHome(null),
                },
            ]
        );
    };

    return (
        <LinearGradient colors={['#1a1a2e', '#2d3436', '#1a1a2e']} style={styles.container}>
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
                        <Text style={styles.emoji}>🕊️</Text>
                        <Text style={styles.title}>Funeral Directors Portal</Text>
                        <Text style={styles.subtitle}>
                            Memorial announcement partner access
                        </Text>
                    </View>

                    {connectedHome ? (
                        <View style={styles.connectedCard}>
                            <Text style={styles.connectedEmoji}>✅</Text>
                            <Text style={styles.connectedTitle}>Connected</Text>
                            <Text style={styles.homeName}>{connectedHome.name}</Text>
                            <Text style={styles.homeLocation}>
                                {connectedHome.city}, {connectedHome.state}
                            </Text>

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => navigation.navigate('ObituaryForm')}
                            >
                                <Text style={styles.createButtonText}>Create Memorial Announcement</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnect}
                            >
                                <Text style={styles.disconnectButtonText}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.loginCard}>
                            <Text style={styles.loginTitle}>Enter Access Code</Text>
                            <Text style={styles.loginSubtitle}>
                                Contact your funeral home administrator for your partner code
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Enter code (e.g., ETERNAL26)"
                                placeholderTextColor="#999"
                                value={code}
                                onChangeText={(text) => {
                                    setCode(text.toUpperCase());
                                    setError('');
                                }}
                                autoCapitalize="characters"
                                autoCorrect={false}
                            />

                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isLoading ? 'Connecting...' : 'Connect'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Features */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>Partner Benefits</Text>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>📋</Text>
                            <Text style={styles.featureText}>Pre-filled funeral home information</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>🎨</Text>
                            <Text style={styles.featureText}>Custom branding on memorials</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>📊</Text>
                            <Text style={styles.featureText}>Usage analytics dashboard</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>💼</Text>
                            <Text style={styles.featureText}>Bulk pricing for families</Text>
                        </View>
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    connectedCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    connectedEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    connectedTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4ade80',
        marginBottom: 8,
    },
    homeName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    homeLocation: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: '#64b5f6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginBottom: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    disconnectButton: {
        paddingVertical: 12,
    },
    disconnectButtonText: {
        fontSize: 14,
        color: '#ff6b6b',
        fontWeight: '600',
    },
    loginCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 8,
    },
    loginSubtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 12,
        color: '#1a1a2e',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    featuresSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
});
