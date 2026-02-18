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
import { useCustomerAuth } from '../src/context/CustomerAuthContext';
import type { RootStackParamList } from '../src/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerLogin'>;

export default function CustomerLoginScreen({ navigation }: Props) {
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isLoggedIn, user, profile, logIn, signUp, logOut, resetPassword } = useCustomerAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please enter your email and password');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await logIn(email.trim(), password);
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Welcome Back!', 'You\'re logged in.', [
                { text: 'Continue', onPress: () => navigation.goBack() },
            ]);
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim() || !displayName.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await signUp(email.trim(), password, displayName.trim());
        setIsLoading(false);

        if (result.success) {
            Alert.alert(
                '🎉 Account Created!',
                'Welcome to Population +1™! Your keepsakes and milestones will be saved here.',
                [{ text: 'Get Started', onPress: () => navigation.goBack() }]
            );
        } else {
            setError(result.error || 'Sign up failed');
        }
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await resetPassword(email.trim());
        setIsLoading(false);

        if (result.success) {
            Alert.alert(
                'Email Sent',
                'Check your inbox for a password reset link.',
                [{ text: 'OK', onPress: () => setMode('login') }]
            );
        } else {
            setError(result.error || 'Could not send reset email');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out?',
            'You can still use the app, but your saved keepsakes won\'t sync.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: () => logOut() },
            ]
        );
    };

    // ─── Logged In View ──────────────────────────────────────────

    if (isLoggedIn && user) {
        return (
            <LinearGradient colors={['#1a472a', '#2d6a3f', '#3d8b4f']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.emoji}>👤</Text>
                        <Text style={styles.title}>My Account</Text>
                    </View>

                    <View style={styles.connectedCard}>
                        <Text style={styles.connectedEmoji}>✅</Text>
                        <Text style={styles.connectedTitle}>Logged In</Text>
                        <Text style={styles.userName}>{profile?.displayName || user.displayName || 'Parent'}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>

                        {profile && (
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{profile.keepsakeCount || 0}</Text>
                                    <Text style={styles.statLabel}>Keepsakes</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{profile.children?.length || 0}</Text>
                                    <Text style={styles.statLabel}>Children</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.comingSoonSection}>
                            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                            <Text style={styles.comingSoonItem}>📁 My Keepsakes — saved designs & purchases</Text>
                            <Text style={styles.comingSoonItem}>📸 Milestone Vault — photos, videos & firsts</Text>
                            <Text style={styles.comingSoonItem}>🎁 Baby Registry — share with family</Text>
                            <Text style={styles.comingSoonItem}>📊 Year in Review — auto-generated prints</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.createButtonText}>← Back to App</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        );
    }

    // ─── Login / Sign Up / Reset Forms ───────────────────────────

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
                        <Text style={styles.emoji}>
                            {mode === 'reset' ? '🔑' : '👤'}
                        </Text>
                        <Text style={styles.title}>
                            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === 'login'
                                ? 'Log in to access your saved keepsakes'
                                : mode === 'signup'
                                    ? 'Save your keepsakes & track milestones'
                                    : 'We\'ll send you a reset link'}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        {mode === 'signup' && (
                            <>
                                <Text style={styles.inputLabel}>Your Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Sarah Johnson"
                                    placeholderTextColor="#999"
                                    value={displayName}
                                    onChangeText={(text) => { setDisplayName(text); setError(''); }}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </>
                        )}

                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setError(''); }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            textContentType="emailAddress"
                        />

                        {mode !== 'reset' && (
                            <>
                                <Text style={styles.inputLabel}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={(text) => { setPassword(text); setError(''); }}
                                    secureTextEntry
                                    textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                                />
                            </>
                        )}

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Primary Action */}
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
                            onPress={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignUp : handleResetPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading
                                    ? 'Please wait...'
                                    : mode === 'login'
                                        ? 'Log In'
                                        : mode === 'signup'
                                            ? 'Create Account'
                                            : 'Send Reset Email'}
                            </Text>
                        </TouchableOpacity>

                        {/* Toggle login/signup */}
                        {mode === 'login' && (
                            <>
                                <TouchableOpacity style={styles.toggleButton} onPress={() => { setMode('signup'); setError(''); }}>
                                    <Text style={styles.toggleText}>Don't have an account? <Text style={styles.toggleBold}>Sign Up</Text></Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.forgotButton} onPress={() => { setMode('reset'); setError(''); }}>
                                    <Text style={styles.forgotText}>Forgot password?</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {mode === 'signup' && (
                            <TouchableOpacity style={styles.toggleButton} onPress={() => { setMode('login'); setError(''); }}>
                                <Text style={styles.toggleText}>Already have an account? <Text style={styles.toggleBold}>Log In</Text></Text>
                            </TouchableOpacity>
                        )}

                        {mode === 'reset' && (
                            <TouchableOpacity style={styles.toggleButton} onPress={() => { setMode('login'); setError(''); }}>
                                <Text style={styles.toggleText}>← Back to Login</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Why Create an Account */}
                    {mode !== 'reset' && (
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>Why Create an Account?</Text>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoEmoji}>💾</Text>
                                <Text style={styles.infoText}>Save your designs and come back anytime</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoEmoji}>🛒</Text>
                                <Text style={styles.infoText}>Track your orders and print history</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoEmoji}>📸</Text>
                                <Text style={styles.infoText}>Store milestone photos & videos (coming soon)</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoEmoji}>🎁</Text>
                                <Text style={styles.infoText}>Create a baby registry for family & friends</Text>
                            </View>
                        </View>
                    )}

                    {/* Skip option */}
                    <View style={styles.skipSection}>
                        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.skipButtonText}>Continue Without Account →</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    // Header
    header: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
    emoji: { fontSize: 60, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },

    // Card
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

    // Inputs
    inputLabel: { fontSize: 14, fontWeight: '700', color: '#1a472a', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    errorText: { color: '#e74c3c', fontSize: 14, textAlign: 'center', marginTop: 12 },

    // Buttons
    submitButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButtonLoading: { opacity: 0.7 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    toggleButton: { alignItems: 'center', marginTop: 16 },
    toggleText: { fontSize: 14, color: '#666' },
    toggleBold: { fontWeight: '700', color: '#1a472a' },

    forgotButton: { alignItems: 'center', marginTop: 8 },
    forgotText: { fontSize: 13, color: '#999' },

    // Info section
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16, textAlign: 'center' },
    infoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
    infoEmoji: { fontSize: 24 },
    infoText: { flex: 1, fontSize: 15, color: '#fff', lineHeight: 22 },

    // Skip
    skipSection: { alignItems: 'center' },
    skipButton: { paddingVertical: 12, paddingHorizontal: 24 },
    skipButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Logged in state
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
    connectedEmoji: { fontSize: 48, marginBottom: 12 },
    connectedTitle: { fontSize: 24, fontWeight: '800', color: '#27ae60', marginBottom: 16 },
    userName: { fontSize: 22, fontWeight: '700', color: '#1a472a', textAlign: 'center' },
    userEmail: { fontSize: 14, color: '#666', marginTop: 4 },

    statsRow: { flexDirection: 'row', gap: 24, marginTop: 20, marginBottom: 20 },
    statBox: { alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 12, padding: 16, minWidth: 100 },
    statNumber: { fontSize: 28, fontWeight: '900', color: '#1a472a' },
    statLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 4 },

    comingSoonSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        width: '100%',
    },
    comingSoonTitle: { fontSize: 16, fontWeight: '800', color: '#1a472a', marginBottom: 10, textAlign: 'center' },
    comingSoonItem: { fontSize: 13, color: '#555', lineHeight: 22 },

    createButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginBottom: 12,
    },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    logoutButton: { paddingVertical: 12, paddingHorizontal: 24 },
    logoutButtonText: { color: '#e74c3c', fontSize: 14, fontWeight: '600' },
});
