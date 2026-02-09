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

type Props = NativeStackScreenProps<RootStackParamList, 'BabyRegistryPortal'>;

// Sample registry partner database
const REGISTRY_DATABASE = [
    {
        id: 'demo-registry',
        name: 'Demo Baby Registry',
        code: 'DEMO-REG',
        tagline: 'Your One-Stop Baby Shop',
        isActive: true,
    },
    {
        id: 'babylist',
        name: 'Babylist',
        code: 'BABYLIST26',
        tagline: 'The Baby Registry That Gets You',
        primaryColor: '#6fcf97',
        isActive: true,
    },
    {
        id: 'amazon-baby',
        name: 'Amazon Baby Registry',
        code: 'AMAZON26',
        tagline: 'Everything You Need',
        primaryColor: '#ff9900',
        isActive: true,
    },
    {
        id: 'target-baby',
        name: 'Target Baby Registry',
        code: 'TARGET26',
        tagline: 'Expect More. Pay Less.',
        primaryColor: '#cc0000',
        isActive: true,
    },
];

export default function BabyRegistryPortalScreen({ navigation }: Props) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectedRegistry, setConnectedRegistry] = useState<typeof REGISTRY_DATABASE[0] | null>(null);

    const handleSubmit = () => {
        if (!code.trim()) {
            setError('Please enter a partner code');
            return;
        }

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const normalizedCode = code.trim().toUpperCase();
            const found = REGISTRY_DATABASE.find(
                r => r.code.toUpperCase() === normalizedCode && r.isActive
            );

            setIsLoading(false);

            if (found) {
                setConnectedRegistry(found);
                Alert.alert(
                    '🎁 Connected!',
                    `Welcome, ${found.name} Partner!\n\n${found.tagline}`,
                    [{ text: 'Awesome!' }]
                );
                setCode('');
            } else {
                setError('Invalid partner code. Contact your registry representative.');
            }
        }, 500);
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect Registry?',
            'Registry linking features will be disabled.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: () => setConnectedRegistry(null),
                },
            ]
        );
    };

    return (
        <LinearGradient colors={['#ff9a9e', '#fad0c4', '#ffecd2']} style={styles.container}>
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
                        <Text style={styles.emoji}>🎁</Text>
                        <Text style={styles.title}>Baby Registry Portal</Text>
                        <Text style={styles.subtitle}>
                            Registry partner integration
                        </Text>
                    </View>

                    {connectedRegistry ? (
                        <View style={styles.connectedCard}>
                            <Text style={styles.connectedEmoji}>✅</Text>
                            <Text style={styles.connectedTitle}>Connected</Text>
                            <Text style={styles.registryName}>{connectedRegistry.name}</Text>
                            <Text style={styles.registryTagline}>{connectedRegistry.tagline}</Text>

                            <View style={styles.benefitsCard}>
                                <Text style={styles.benefitsTitle}>Active Integration</Text>
                                <Text style={styles.benefitsText}>
                                    • Registry link on announcements{'\n'}
                                    • QR code to registry{'\n'}
                                    • Custom branding options
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => navigation.navigate('Form')}
                            >
                                <Text style={styles.createButtonText}>Create Announcement</Text>
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
                            <Text style={styles.loginTitle}>Partner Access</Text>
                            <Text style={styles.loginSubtitle}>
                                Enter your registry partner code to enable integration features
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Enter code (e.g., BABYLIST26)"
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
                                    {isLoading ? 'Connecting...' : 'Connect Registry'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* How It Works */}
                    <View style={styles.howItWorks}>
                        <Text style={styles.howTitle}>How It Works</Text>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Connect Your Registry</Text>
                                <Text style={styles.stepDesc}>Enter your partner code above</Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Create Announcement</Text>
                                <Text style={styles.stepDesc}>Build your baby announcement</Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Share With QR Code</Text>
                                <Text style={styles.stepDesc}>Registry link included in your design</Text>
                            </View>
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
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    connectedCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    connectedEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    connectedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4ade80',
        marginBottom: 4,
    },
    registryName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    registryTagline: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    benefitsCard: {
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 20,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#166534',
        marginBottom: 8,
    },
    benefitsText: {
        fontSize: 13,
        color: '#166534',
        lineHeight: 22,
    },
    createButton: {
        backgroundColor: '#ff6b9d',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginBottom: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    disconnectButton: {
        paddingVertical: 12,
    },
    disconnectButtonText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '600',
    },
    loginCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
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
        color: '#333',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#ff6b9d',
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
    howItWorks: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    howTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ff6b9d',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    stepDesc: {
        fontSize: 13,
        color: '#666',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});
