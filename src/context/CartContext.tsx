import React, { createContext, ReactNode, useContext, useState } from 'react';

export type CartItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUri?: string;
    productType: 'front' | 'back' | 'natal' | 'natalback' | 'yardsign' | 'postcard' | 'babycard' | 'package';
    variant?: string;
    material?: string;   // e.g., 'cardstock', 'plastic', 'metal'
    size?: string;        // e.g., '8.5x11', '11x14'
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existingIndex = prev.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
                // Increase quantity if already in cart
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            }
            // Add new item with quantity 1
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotal,
            getItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// Product pricing — packages priced dynamically in PrintServiceScreen
// Individual view prices used by PreviewScreen "Add to Cart" quick-add
export const PRODUCT_PRICES: Record<string, { name: string; price: number }> = {
    // Single view quick-add (free digital saves, priced at $0)
    front: { name: 'Birth Announcement (Front)', price: 0.00 },
    back: { name: 'Time Capsule (Back)', price: 0.00 },
    natal: { name: 'Natal Chart', price: 0.00 },
    natalback: { name: 'Chart Reading Guide', price: 0.00 },
    letter: { name: 'Letter to Baby', price: 0.00 },
};

export default CartContext;
