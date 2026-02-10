import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import { PRODUCT_PRICES, useCart } from '../context/CartContext';
import { COLOR_SCHEMES } from '../data/utils/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'YardSignPreview'>;

/**
 * YardSignPreviewScreen - Simple, bold yard sign designs
 * 
 * Design Philosophy:
 * - Large +1 as focal point
 * - Baby name prominently displayed
 * - Visible from the road
 * - Multiple style options to choose from
 */
export default function YardSignPreviewScreen({ route, navigation }: Props) {
    const { width } = useWindowDimensions();
    const params = route.params || {};

    // Get baby name with middle
    const babyFirst = params.babies?.[0]?.first || params.babyFirst || params.personName || 'Baby';
    const babyMiddle = params.babies?.[0]?.middle || params.babyMiddle || '';
    const babyName = [babyFirst, babyMiddle].filter(Boolean).join(' ');
    const theme = params.theme || 'green';
    const colors = COLOR_SCHEMES[theme] || COLOR_SCHEMES.green;

    // Refs for capturing
    const classicRef = useRef<ViewShot | null>(null);
    const welcomeRef = useRef<ViewShot | null>(null);
    const minimalRef = useRef<ViewShot | null>(null);

    // Modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    // Cart
    const { addToCart } = useCart();

    const handleAddToCart = (styleId: string, styleName: string) => {
        const productInfo = PRODUCT_PRICES[styleId as keyof typeof PRODUCT_PRICES];
        const price = productInfo?.price || 0;
        const productName = productInfo?.name || `Yard Sign - ${styleName}`;
        addToCart({
            id: `${styleId}-${babyName}-${Date.now()}`,
            name: productName,
            description: `For ${babyName}`,
            productType: 'yardsign',
            price,
            variant: styleName.toLowerCase(),
        });
    };

    // Download items
    const downloadItems: DownloadItem[] = [
        { id: 'yardsign-classic', label: 'Classic Style', category: 'yardsign' },
        { id: 'yardsign-welcome', label: 'Welcome Style', category: 'yardsign' },
        { id: 'yardsign-minimal', label: 'Minimal Style', category: 'yardsign' },
    ];

    // Capture function
    const handleCapture = async (itemId: string): Promise<string | null> => {
        try {
            let ref: React.RefObject<ViewShot | null> | null = null;
            if (itemId === 'yardsign-classic') ref = classicRef;
            if (itemId === 'yardsign-welcome') ref = welcomeRef;
            if (itemId === 'yardsign-minimal') ref = minimalRef;

            if (ref?.current?.capture) {
                const uri = await ref.current.capture();
                return uri;
            }
            return null;
        } catch (error) {
            console.error('Capture error:', error);
            return null;
        }
    };

    // Yard sign dimensions (24x18" landscape at preview scale)
    const signWidth = Math.min(width * 0.92, 380);
    const signHeight = signWidth * (18 / 24); // 24x18 landscape ratio

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🏡 Yard Sign Options</Text>
            <Text style={styles.subtitle}>Perfect for the front lawn!</Text>

            {/* Option 1: Simple +1 */}
            <View style={styles.optionContainer}>
                <Text style={styles.optionLabel}>Style 1: Classic</Text>
                <ViewShot ref={classicRef} options={{ format: 'png', quality: 1 }}>
                    <View style={[
                        styles.yardSign,
                        {
                            width: signWidth,
                            height: signHeight,
                            backgroundColor: colors.bg,
                        }
                    ]}>
                        <View style={styles.signBorder}>
                            <View style={{ marginTop: -15, alignItems: 'center' }}>
                                <Text style={[styles.plusOne, { fontSize: signWidth * 0.28, marginBottom: -10, textAlign: 'center' }]}>
                                    +1
                                </Text>
                                <Text style={[styles.babyName, { fontSize: signWidth * 0.09 }]}>
                                    {babyName.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </View>

            {/* Option 2: Welcome Style */}
            <View style={styles.optionContainer}>
                <Text style={styles.optionLabel}>Style 2: Welcome</Text>
                <ViewShot ref={welcomeRef} options={{ format: 'png', quality: 1 }}>
                    <View style={[
                        styles.yardSign,
                        {
                            width: signWidth,
                            height: signHeight,
                            backgroundColor: colors.bg,
                        }
                    ]}>
                        <View style={styles.signBorder}>
                            <Text style={[styles.plusOne, { fontSize: signWidth * 0.28, marginBottom: 4 }]}>
                                +1
                            </Text>
                            <View style={{ marginTop: -20, alignItems: 'center' }}>
                                <Text style={[styles.welcomeText, { fontSize: signWidth * 0.078, marginBottom: 4, textAlign: 'center' }]}>
                                    Welcome To
                                </Text>
                                <Text style={[styles.babyName, { fontSize: signWidth * 0.09 }]}>
                                    {babyName.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </View>

            {/* Option 3: Minimal */}
            <View style={styles.optionContainer}>
                <Text style={styles.optionLabel}>Style 3: Minimal</Text>
                <ViewShot ref={minimalRef} options={{ format: 'png', quality: 1 }}>
                    <View style={[
                        styles.yardSign,
                        {
                            width: signWidth,
                            height: signHeight,
                            backgroundColor: '#ffffff',
                        }
                    ]}>
                        <View style={[styles.signBorder, { borderColor: colors.bg }]}>
                            <Text style={[styles.plusOneOutline, { fontSize: signWidth * 0.28, color: colors.bg, marginBottom: 4 }]}>
                                +1
                            </Text>
                            <View style={{ marginTop: -20, alignItems: 'center' }}>
                                <Text style={[styles.welcomeText, { fontSize: signWidth * 0.078, marginBottom: 4, textAlign: 'center', color: colors.bg, fontStyle: 'italic' }]}>
                                    Welcome To
                                </Text>
                                <Text style={[styles.babyNameMinimal, { fontSize: signWidth * 0.09, color: colors.bg }]}>
                                    {babyName.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </View>

            {/* Download Button */}
            <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => setShowDownloadModal(true)}
            >
                <Text style={styles.downloadButtonText}>📥 Download / Print Options</Text>
            </TouchableOpacity>

            {/* Cart Actions */}
            <View style={styles.cartActions}>
                <Text style={styles.cartTitle}>Add to Cart:</Text>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('yardsign-classic', 'Classic')}
                >
                    <Text style={styles.addToCartButtonText}>+ Style 1 (Classic)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('yardsign-welcome', 'Welcome')}
                >
                    <Text style={styles.addToCartButtonText}>+ Style 2 (Welcome)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart('yardsign-minimal', 'Minimal')}
                >
                    <Text style={styles.addToCartButtonText}>+ Style 3 (Minimal)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.viewCartButton}
                    onPress={() => setShowCartModal(true)}
                >
                    <Text style={styles.viewCartButtonText}>🛒 View Cart</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.description}>
                24" × 18" weatherproof corrugated plastic{'\n'}
                Includes H-stake for easy installation
            </Text>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Preview</Text>
            </TouchableOpacity>

            <DownloadModal
                visible={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                items={downloadItems}
                onCapture={handleCapture}
                babyName={babyName}
            />

            <CartModal
                visible={showCartModal}
                onClose={() => setShowCartModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a472a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    optionContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    yardSign: {
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
        padding: 8,
    },
    signBorder: {
        flex: 1,
        width: '100%',
        borderWidth: 8,
        borderColor: '#fff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        color: '#ffffff',
        fontFamily: 'serif',
        fontStyle: 'italic',
        marginBottom: 0,
    },
    plusOne: {
        color: '#ffffff',
        fontWeight: '900',
        letterSpacing: -2,
    },
    plusOneOutline: {
        fontWeight: '900',
        letterSpacing: -2,
    },
    nameBanner: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 4,
        marginTop: -4,
    },
    babyName: {
        color: '#ffffff',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    babyNameLarge: {
        color: '#ffffff',
        fontWeight: '700',
        fontFamily: 'serif',
    },
    babyNameMinimal: {
        fontWeight: '600',
        marginTop: 0,
    },
    populationLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        letterSpacing: 4,
        marginBottom: -10,
    },
    divider: {
        width: '60%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginVertical: 16,
    },
    tagline: {
        color: 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
        marginTop: 4,
    },
    downloadButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 16,
    },
    downloadButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cartActions: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    addToCartButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 10,
        minWidth: 200,
        alignItems: 'center',
    },
    addToCartButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    viewCartButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 8,
    },
    viewCartButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    orderButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
        marginBottom: 12,
    },
    orderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#1a472a',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        margin: 20,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
