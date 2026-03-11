import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../context/CartContext';
import { app } from '../data/utils/firebase-config';
import { saveOrderRecord } from '../services/orderService';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ShippingAddress = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
};

export default function CheckoutScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { items, getTotal, getItemCount, clearCart } = useCart();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [shipping, setShipping] = useState<ShippingAddress>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const formatPrice = (price: number) => `$${price.toFixed(2)}`;

    const validateForm = (): boolean => {
        if (!shipping.firstName.trim()) {
            Alert.alert('Missing Information', 'Please enter your first name.');
            return false;
        }
        if (!shipping.lastName.trim()) {
            Alert.alert('Missing Information', 'Please enter your last name.');
            return false;
        }
        if (!shipping.email.trim() || !shipping.email.includes('@')) {
            Alert.alert('Missing Information', 'Please enter a valid email address.');
            return false;
        }
        if (!shipping.address1.trim()) {
            Alert.alert('Missing Information', 'Please enter your street address.');
            return false;
        }
        if (!shipping.city.trim()) {
            Alert.alert('Missing Information', 'Please enter your city.');
            return false;
        }
        if (!shipping.state.trim()) {
            Alert.alert('Missing Information', 'Please enter your state.');
            return false;
        }
        if (!shipping.zipCode.trim() || shipping.zipCode.length < 5) {
            Alert.alert('Missing Information', 'Please enter a valid ZIP code.');
            return false;
        }
        if (!termsAccepted) {
            Alert.alert('Terms Required', 'Please confirm that all details are correct and accept the Terms of Service to continue.');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);

        try {
            // Generate order ID
            const orderId = `PP1-${Date.now().toString(36).toUpperCase()}`;

            // 1. Call Cloud Function to create PaymentIntent
            const functions = getFunctions(app);
            const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
            const { data: paymentData } = await createPaymentIntent({
                amount: Math.round(total * 100), // convert to cents
                currency: 'usd',
                orderId,
                customerEmail: shipping.email.trim(),
            }) as { data: { clientSecret: string; paymentIntentId: string } };

            // 2. Initialize PaymentSheet
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: paymentData.clientSecret,
                merchantDisplayName: 'Population Plus One',
                defaultBillingDetails: {
                    name: `${shipping.firstName} ${shipping.lastName}`.trim(),
                    email: shipping.email.trim(),
                    phone: shipping.phone.trim() || undefined,
                    address: {
                        line1: shipping.address1.trim(),
                        line2: shipping.address2.trim() || undefined,
                        city: shipping.city.trim(),
                        state: shipping.state.trim(),
                        postalCode: shipping.zipCode.trim(),
                        country: 'US',
                    },
                },
            });

            if (initError) {
                Alert.alert('Payment Error', initError.message);
                setIsProcessing(false);
                return;
            }

            // 3. Present PaymentSheet to user
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    // User dismissed — not an error
                    setIsProcessing(false);
                    return;
                }
                Alert.alert('Payment Failed', paymentError.message);
                setIsProcessing(false);
                return;
            }

            // 4. Payment succeeded!

            // Save order record to Firebase
            await saveOrderRecord({
                orderId,
                status: 'pending',
                customer: {
                    firstName: shipping.firstName.trim(),
                    lastName: shipping.lastName.trim(),
                    email: shipping.email.trim(),
                    phone: shipping.phone.trim() || undefined,
                },
                shipping: {
                    address1: shipping.address1.trim(),
                    address2: shipping.address2.trim() || undefined,
                    city: shipping.city.trim(),
                    state: shipping.state.trim(),
                    zipCode: shipping.zipCode.trim(),
                },
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
                pricing: {
                    subtotal,
                    shipping: shipping_cost,
                    tax,
                    total,
                },
                termsAccepted: true,
                termsAcceptedAt: new Date().toISOString(),
                createdAt: null, // Set by serverTimestamp() in orderService
            });

            // Navigate to confirmation
            clearCart();
            navigation.navigate('OrderConfirmation', {
                orderId,
                email: shipping.email,
                itemCount: getItemCount(),
                total: getTotal(),
            });
        } catch (error) {
            Alert.alert('Order Failed', 'There was an issue processing your order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = getTotal();
    const shipping_cost = 0.00; // TBD - pricing not finalized
    const tax = 0.00; // TBD - calculated based on location
    const total = subtotal + shipping_cost + tax;

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.continueShoppingButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.orderSummary}>
                        {items.map((item) => (
                            <View key={item.id} style={styles.summaryItem}>
                                <View style={styles.summaryItemInfo}>
                                    <Text style={styles.summaryItemName}>{item.name}</Text>
                                    {item.description ? (
                                        <Text style={styles.summaryItemDesc}>{item.description}</Text>
                                    ) : null}
                                    <Text style={styles.summaryItemQty}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={styles.summaryItemPrice}>
                                    {formatPrice(item.price * item.quantity)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>First Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={shipping.firstName}
                                onChangeText={(text) => setShipping({ ...shipping, firstName: text })}
                                placeholder="John"
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Last Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={shipping.lastName}
                                onChangeText={(text) => setShipping({ ...shipping, lastName: text })}
                                placeholder="Smith"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        value={shipping.email}
                        onChangeText={(text) => setShipping({ ...shipping, email: text })}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Phone (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={shipping.phone}
                        onChangeText={(text) => setShipping({ ...shipping, phone: text })}
                        placeholder="(555) 123-4567"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Street Address *</Text>
                    <TextInput
                        style={styles.input}
                        value={shipping.address1}
                        onChangeText={(text) => setShipping({ ...shipping, address1: text })}
                        placeholder="123 Main Street"
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Apt, Suite, Unit (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={shipping.address2}
                        onChangeText={(text) => setShipping({ ...shipping, address2: text })}
                        placeholder="Apt 4B"
                        autoCapitalize="words"
                    />

                    <View style={styles.row}>
                        <View style={styles.cityInput}>
                            <Text style={styles.label}>City *</Text>
                            <TextInput
                                style={styles.input}
                                value={shipping.city}
                                onChangeText={(text) => setShipping({ ...shipping, city: text })}
                                placeholder="New York"
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={styles.stateInput}>
                            <Text style={styles.label}>State *</Text>
                            <TextInput
                                style={styles.input}
                                value={shipping.state}
                                onChangeText={(text) => setShipping({ ...shipping, state: text.toUpperCase() })}
                                placeholder="NY"
                                maxLength={2}
                                autoCapitalize="characters"
                            />
                        </View>
                        <View style={styles.zipInput}>
                            <Text style={styles.label}>ZIP *</Text>
                            <TextInput
                                style={styles.input}
                                value={shipping.zipCode}
                                onChangeText={(text) => setShipping({ ...shipping, zipCode: text })}
                                placeholder="10001"
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment</Text>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentInfoIcon}>🔒</Text>
                        <Text style={styles.paymentInfoText}>
                            Secure payment via Stripe. Your card will be collected when you tap "Place Order" below.
                        </Text>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Total</Text>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal ({getItemCount()} items)</Text>
                            <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Shipping</Text>
                            <Text style={styles.priceValue}>
                                {shipping_cost === 0 ? 'TBD' : formatPrice(shipping_cost)}
                            </Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tax</Text>
                            <Text style={styles.priceValue}>
                                {tax === 0 ? 'TBD' : formatPrice(tax)}
                            </Text>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                        </View>
                    </View>
                </View>



                {/* Terms Acceptance */}
                <View style={styles.termsSection}>
                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.termsText}>
                            I confirm all names, dates, and details are correct. I agree to the{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => Linking.openURL('https://populationplusone.com/terms-of-service.html')}
                            >
                                Terms of Service
                            </Text>
                            {' '}and{' '}
                            <Text
                                style={styles.termsLink}
                                onPress={() => Linking.openURL('https://populationplusone.com/privacy-policy.html')}
                            >
                                Privacy Policy
                            </Text>.
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, (isProcessing || !termsAccepted) && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.placeOrderText}>Place Order — {formatPrice(total)}</Text>
                    )}
                </TouchableOpacity>
                <Text style={styles.secureText}>🔒 Your information is secure</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    orderSummary: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    summaryItemInfo: {
        flex: 1,
    },
    summaryItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    summaryItemQty: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    summaryItemDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    summaryItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000080',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    cityInput: {
        flex: 2,
    },
    stateInput: {
        flex: 1,
    },
    zipInput: {
        flex: 1.5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginTop: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#667eea',
    },
    paymentInfoIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    paymentInfoText: {
        flex: 1,
        fontSize: 14,
        color: '#4a5568',
        lineHeight: 20,
    },
    priceBreakdown: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000080',
    },

    bottomAction: {
        backgroundColor: '#fff',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    placeOrderButton: {
        backgroundColor: '#000080',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    secureText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 24,
    },
    continueShoppingButton: {
        backgroundColor: '#000080',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    continueShoppingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    termsSection: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    checkboxChecked: {
        backgroundColor: '#000080',
        borderColor: '#000080',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    termsText: {
        flex: 1,
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
    },
    termsLink: {
        color: '#000080',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
