import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCart } from '../src/context/CartContext';
import type { RootStackParamList } from '../src/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function CartModal({ visible, onClose }: Props) {
    const navigation = useNavigation<NavigationProp>();
    const { items, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } = useCart();

    const handleCheckout = () => {
        onClose(); // Close the modal first
        navigation.navigate('Checkout');
    };

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart?',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearCart },
            ]
        );
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>🛒 Your Cart</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {items.length === 0 ? (
                        <View style={styles.emptyCart}>
                            <Text style={styles.emptyEmoji}>🛒</Text>
                            <Text style={styles.emptyText}>Your cart is empty</Text>
                            <Text style={styles.emptySubtext}>
                                Add items from the preview screens
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <ScrollView style={styles.itemsList}>
                                {items.map((item) => (
                                    <View key={item.id} style={styles.cartItem}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            {item.description && (
                                                <Text style={styles.itemDescription}>{item.description}</Text>
                                            )}
                                            <Text style={styles.itemPrice}>
                                                {formatPrice(item.price)} each
                                            </Text>
                                        </View>

                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Text style={styles.quantityButtonText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeFromCart(item.id)}
                                        >
                                            <Text style={styles.removeText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Summary */}
                            <View style={styles.summary}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Items:</Text>
                                    <Text style={styles.summaryValue}>{getItemCount()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                                    <Text style={styles.summaryValue}>{formatPrice(getTotal())}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Shipping:</Text>
                                    <Text style={styles.summaryValue}>TBD</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total:</Text>
                                    <Text style={styles.totalValue}>{formatPrice(getTotal())}</Text>
                                </View>
                            </View>

                            {/* Pricing Notice */}
                            <View style={styles.notice}>
                                <Text style={styles.noticeText}>
                                    💡 Prices shown as $0.00 - final pricing will be set once printing partners are finalized.
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={handleClearCart}
                                >
                                    <Text style={styles.clearButtonText}>Clear Cart</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.checkoutButton}
                                    onPress={handleCheckout}
                                >
                                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a472a',
    },
    closeButton: {
        padding: 8,
    },
    closeText: {
        fontSize: 24,
        color: '#666',
    },
    emptyCart: {
        padding: 60,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    itemsList: {
        maxHeight: 300,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 14,
        color: '#1a472a',
        fontWeight: '500',
        marginTop: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        padding: 8,
    },
    removeText: {
        fontSize: 18,
    },
    summary: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a472a',
    },
    notice: {
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#fff9e6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffd700',
    },
    noticeText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#dc3545',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#dc3545',
        fontSize: 16,
        fontWeight: '600',
    },
    checkoutButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#1a472a',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
