import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>['route'];

export default function OrderConfirmationScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp>();

    const { orderId, email, itemCount, total } = route.params || {
        orderId: 'UNKNOWN',
        email: '',
        itemCount: 0,
        total: 0,
    };

    const formatPrice = (price: number) => `$${price.toFixed(2)}`;

    const handleBackToHome = () => {
        // Reset to landing page
        navigation.reset({
            index: 0,
            routes: [{ name: 'Landing' }],
        });
    };

    const handleNewOrder = () => {
        navigation.navigate('Form');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Success Icon */}
                <View style={styles.successIcon}>
                    <Text style={styles.checkmark}>✓</Text>
                </View>

                <Text style={styles.title}>Order Confirmed!</Text>
                <Text style={styles.subtitle}>Thank you for your order</Text>

                {/* Order Details Card */}
                <View style={styles.orderCard}>
                    <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Order Number</Text>
                        <Text style={styles.orderValue}>{orderId}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Items</Text>
                        <Text style={styles.orderValue}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
                    </View>

                    <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Total</Text>
                        <Text style={[styles.orderValue, styles.totalValue]}>{formatPrice(total)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Confirmation sent to</Text>
                        <Text style={styles.emailValue}>{email}</Text>
                    </View>
                </View>

                {/* What's Next */}
                <View style={styles.nextStepsCard}>
                    <Text style={styles.nextStepsTitle}>What's Next?</Text>

                    <View style={styles.stepItem}>
                        <Text style={styles.stepNumber}>1</Text>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Order Processing</Text>
                            <Text style={styles.stepText}>
                                We'll prepare your custom prints with care
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <Text style={styles.stepNumber}>2</Text>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Shipping Notification</Text>
                            <Text style={styles.stepText}>
                                You'll receive an email when your order ships
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <Text style={styles.stepNumber}>3</Text>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Delivery</Text>
                            <Text style={styles.stepText}>
                                Expect delivery within 5-7 business days
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Beta Notice */}
                <View style={styles.betaNotice}>
                    <Text style={styles.betaEmoji}>🎉</Text>
                    <Text style={styles.betaTitle}>Beta Period</Text>
                    <Text style={styles.betaText}>
                        Your order has been recorded. Actual printing and shipping will begin once we finalize our printing partners. We'll notify you when your prints are on the way!
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleBackToHome}
                    >
                        <Text style={styles.primaryButtonText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleNewOrder}
                    >
                        <Text style={styles.secondaryButtonText}>Create Another Announcement</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1a472a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkmark: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a472a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    orderLabel: {
        fontSize: 14,
        color: '#666',
    },
    orderValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        color: '#1a472a',
        fontSize: 16,
    },
    emailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196f3',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 4,
    },
    nextStepsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
    },
    nextStepsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e8f5e9',
        color: '#1a472a',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 28,
        marginRight: 12,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    stepText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    betaNotice: {
        backgroundColor: '#fff9e6',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#ffd700',
        alignItems: 'center',
    },
    betaEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    betaTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#b8860b',
        marginBottom: 8,
    },
    betaText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1a472a',
    },
    secondaryButtonText: {
        color: '#1a472a',
        fontSize: 16,
        fontWeight: '600',
    },
});
