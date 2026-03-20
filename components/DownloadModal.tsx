import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import GiftSuggestionsPanel from './GiftSuggestionsPanel';

export type DownloadItem = {
    id: string;
    label: string;
    category: 'yardsign' | 'postcard' | 'babycard';
    captureRef?: React.RefObject<any>;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    items: DownloadItem[];
    onCapture: (itemId: string) => Promise<string | null>;
    babyName?: string;
    /** App mode for gift suggestions (default: 'baby') */
    appMode?: 'baby' | 'birthday' | 'graduation' | 'anniversary' | 'milestone' | 'memorial';
    /** Callback to navigate to the print page */
    onPrintPress?: () => void;
};

export default function DownloadModal({ visible, onClose, items, onCapture, babyName = 'Baby', appMode = 'baby', onPrintPress }: Props) {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'download' | 'print'>('download');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Reset state when modal opens — auto-select all items
    useEffect(() => {
        if (visible) {
            setIsDownloading(false);
            setDownloadProgress(0);
            setSelectedItems(new Set(items.map(i => i.id)));
        }
    }, [visible]);

    const toggleItem = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedItems(newSet);
    };

    const selectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(i => i.id)));
        }
    };

    const handleDownload = async () => {
        if (selectedItems.size === 0) {
            Alert.alert('No items selected', 'Please select at least one item to download.');
            return;
        }

        setIsDownloading(true);
        setDownloadProgress(0);

        const itemsToSave = Array.from(selectedItems);

        // Capture all images first
        const capturedUris: string[] = [];
        for (let i = 0; i < itemsToSave.length; i++) {
            const itemId = itemsToSave[i];
            setDownloadProgress((i + 0.5) / itemsToSave.length);
            try {
                const uri = await onCapture(itemId);
                if (uri) capturedUris.push(uri);
            } catch {
                // skip failed capture
            }
        }

        if (capturedUris.length === 0) {
            setIsDownloading(false);
            setDownloadProgress(0);
            Alert.alert('Download Failed', 'Could not capture images. Please try again.', [{ text: 'OK' }]);
            return;
        }

        // Try saving to photo library
        let savedCount = 0;
        try {
            const perm = await MediaLibrary.requestPermissionsAsync();
            if (perm?.status === 'granted') {
                for (let i = 0; i < capturedUris.length; i++) {
                    setDownloadProgress((i + 1) / capturedUris.length);
                    try {
                        await MediaLibrary.saveToLibraryAsync(capturedUris[i]);
                        savedCount++;
                    } catch {
                        // individual save failed
                    }
                }
            }
        } catch {
            // MediaLibrary not available
        }

        setIsDownloading(false);
        setDownloadProgress(0);

        if (savedCount > 0) {
            Alert.alert(
                '✅ Saved to Photos!',
                `${savedCount} image${savedCount > 1 ? 's' : ''} saved to your photo library!`,
                [{ text: 'OK', onPress: onClose }]
            );
        } else {
            // Fallback to sharing
            for (const fileUri of capturedUris) {
                try {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'image/png',
                        dialogTitle: 'Save image',
                    });
                } catch {
                    // user cancelled
                }
            }
            onClose();
        }
    };

    const handlePrintful = () => {
        Alert.alert(
            'Printful',
            'Professional printing coming soon!\n\nWe\'re setting up direct integration with Printful for:\n• Yard Signs\n• Postcards\n• Trading Cards\n\nShipped directly to your door.',
            [{ text: 'OK' }]
        );
    };

    const handleUPSStore = () => {
        Alert.alert(
            'UPS Store Printing',
            'Would you like to find a UPS Store near you for printing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Find Store',
                    onPress: () => Linking.openURL('https://www.theupsstore.com/tools/find-a-store')
                }
            ]
        );
    };

    const handleLocalPrintShop = () => {
        Alert.alert(
            'Find Local Print Shop',
            'Search for print shops near you?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Search',
                    onPress: () => Linking.openURL('https://www.google.com/maps/search/print+shop+near+me')
                }
            ]
        );
    };

    const groupedItems = {
        yardsign: items.filter(i => i.category === 'yardsign'),
        postcard: items.filter(i => i.category === 'postcard'),
        babycard: items.filter(i => i.category === 'babycard'),
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Get Your Prints</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'download' && styles.activeTab]}
                            onPress={() => setActiveTab('download')}
                        >
                            <Text style={[styles.tabText, activeTab === 'download' && styles.activeTabText]}>
                                📱 Download
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'print' && styles.activeTab]}
                            onPress={() => setActiveTab('print')}
                        >
                            <Text style={[styles.tabText, activeTab === 'print' && styles.activeTabText]}>
                                🖨️ Print & Ship
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'download' ? (
                        <>
                            {/* Select All */}
                            <TouchableOpacity style={styles.selectAll} onPress={selectAll}>
                                <View style={[styles.checkbox, selectedItems.size === items.length && styles.checkboxChecked]}>
                                    {selectedItems.size === items.length && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.selectAllText}>Select All</Text>
                            </TouchableOpacity>

                            {/* Items List */}
                            <ScrollView style={styles.itemsList}>
                                {/* Yard Signs */}
                                {groupedItems.yardsign.length > 0 && (
                                    <View style={styles.category}>
                                        <Text style={styles.categoryTitle}>🏡 Yard Signs</Text>
                                        {groupedItems.yardsign.map(item => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.item}
                                                onPress={() => toggleItem(item.id)}
                                            >
                                                <View style={[styles.checkbox, selectedItems.has(item.id) && styles.checkboxChecked]}>
                                                    {selectedItems.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.itemText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Postcards */}
                                {groupedItems.postcard.length > 0 && (
                                    <View style={styles.category}>
                                        <Text style={styles.categoryTitle}>💌 Postcards (Double-Sided — Front & Back)</Text>
                                        <Text style={{ fontSize: 11, color: '#888', marginBottom: 8, paddingHorizontal: 4 }}>Print front and back on opposite sides of the same card, like a standard mailable postcard.</Text>
                                        {groupedItems.postcard.map(item => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.item}
                                                onPress={() => toggleItem(item.id)}
                                            >
                                                <View style={[styles.checkbox, selectedItems.has(item.id) && styles.checkboxChecked]}>
                                                    {selectedItems.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.itemText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Trading Cards */}
                                {groupedItems.babycard.length > 0 && (
                                    <View style={styles.category}>
                                        <Text style={styles.categoryTitle}>⚾ Trading Cards (Double-Sided — Front & Back)</Text>
                                        <Text style={{ fontSize: 11, color: '#888', marginBottom: 8, paddingHorizontal: 4 }}>Print front and back on opposite sides of the same card, like a standard baseball trading card.</Text>
                                        {groupedItems.babycard.map(item => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.item}
                                                onPress={() => toggleItem(item.id)}
                                            >
                                                <View style={[styles.checkbox, selectedItems.has(item.id) && styles.checkboxChecked]}>
                                                    {selectedItems.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.itemText}>{item.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>

                            {/* Download Button */}
                            <TouchableOpacity
                                style={[styles.downloadButton, selectedItems.size === 0 && styles.downloadButtonDisabled]}
                                onPress={handleDownload}
                                disabled={isDownloading || selectedItems.size === 0}
                            >
                                {isDownloading ? (
                                    <View style={styles.downloadingRow}>
                                        <ActivityIndicator color="#fff" />
                                        <Text style={styles.downloadButtonText}>
                                            Saving... {Math.round(downloadProgress * 100)}%
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.downloadButtonText} numberOfLines={1} adjustsFontSizeToFit>
                                        📥 Download ({selectedItems.size}) to Device
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.freeText}>FREE - Print at home</Text>
                            <TouchableOpacity onPress={() => setActiveTab('print')} activeOpacity={0.7}>
                                <Text style={styles.printCtaText}>
                                    For high quality printing needs{' '}
                                    <Text style={styles.printCtaLink}>click here</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* Print & Ship Tab */
                        <ScrollView style={styles.printOptions}>
                            <TouchableOpacity style={styles.printOption} onPress={handlePrintful}>
                                <View style={styles.printIconContainer}>
                                    <Text style={styles.printIcon}>📦</Text>
                                </View>
                                <View style={styles.printInfo}>
                                    <Text style={styles.printTitle}>Printful</Text>
                                    <Text style={styles.printDesc}>Professional quality, shipped to your door</Text>
                                    <Text style={styles.printPrice}>Starting at $12.99</Text>
                                </View>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.printOption} onPress={handleUPSStore}>
                                <View style={styles.printIconContainer}>
                                    <Text style={styles.printIcon}>🏪</Text>
                                </View>
                                <View style={styles.printInfo}>
                                    <Text style={styles.printTitle}>UPS Store</Text>
                                    <Text style={styles.printDesc}>Print & pickup at your local store</Text>
                                    <Text style={styles.printPrice}>Prices vary by location</Text>
                                </View>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.printOption} onPress={handleLocalPrintShop}>
                                <View style={styles.printIconContainer}>
                                    <Text style={styles.printIcon}>🗺️</Text>
                                </View>
                                <View style={styles.printInfo}>
                                    <Text style={styles.printTitle}>Find Local Print Shop</Text>
                                    <Text style={styles.printDesc}>Search for print shops near you</Text>
                                    <Text style={styles.printPrice}>Support local business</Text>
                                </View>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>

                            <View style={styles.comingSoon}>
                                <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
                                <Text style={styles.comingSoonText}>
                                    Direct ordering with automatic shipping!{'\n'}
                                    No file downloads needed - we handle everything.
                                </Text>
                            </View>

                            {/* Gift Suggestions — affiliate revenue */}
                            <GiftSuggestionsPanel
                                mode={appMode}
                                recipientName={babyName}
                                compact
                            />
                        </ScrollView>
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
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000080',
    },
    closeButton: {
        padding: 8,
    },
    closeText: {
        fontSize: 24,
        color: '#999',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#000080',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
    },
    activeTabText: {
        color: '#000080',
        fontWeight: '600',
    },
    selectAll: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectAllText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemsList: {
        maxHeight: 300,
    },
    category: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#000080',
        borderColor: '#000080',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    downloadButton: {
        backgroundColor: '#000080',
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    downloadButtonDisabled: {
        backgroundColor: '#ccc',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    downloadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    freeText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    printCtaText: {
        textAlign: 'center',
        color: '#555',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 8,
    },
    printCtaLink: {
        color: '#0000cc',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    printOptions: {
        padding: 16,
    },
    printOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    printIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    printIcon: {
        fontSize: 28,
    },
    printInfo: {
        flex: 1,
    },
    printTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    printDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    printPrice: {
        fontSize: 13,
        color: '#000080',
        fontWeight: '500',
        marginTop: 4,
    },
    arrow: {
        fontSize: 24,
        color: '#ccc',
    },
    comingSoon: {
        backgroundColor: '#f0f8f0',
        padding: 20,
        borderRadius: 12,
        marginTop: 8,
        alignItems: 'center',
    },
    comingSoonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000080',
        marginBottom: 8,
    },
    comingSoonText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
