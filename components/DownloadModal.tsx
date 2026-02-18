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
};

export default function DownloadModal({ visible, onClose, items, onCapture, babyName = 'Baby', appMode = 'baby' }: Props) {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'download' | 'print'>('download');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Reset state when modal opens/closes to prevent stuck states
    useEffect(() => {
        if (visible) {
            setIsDownloading(false);
            setDownloadProgress(0);
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
        try {
            if (selectedItems.size === 0) {
                Alert.alert('No items selected', 'Please select at least one item to download.');
                return;
            }

            const itemsToSave = Array.from(selectedItems);
            setIsDownloading(true);
            setDownloadProgress(0);

            let successCount = 0;
            let failCount = 0;
            const savedUris: string[] = [];

            for (let i = 0; i < itemsToSave.length; i++) {
                const itemId = itemsToSave[i];
                setDownloadProgress((i + 1) / itemsToSave.length);
                try {
                    console.log(`📸 Capturing ${itemId}...`);
                    const uri = await onCapture(itemId);
                    console.log(`📸 Capture result for ${itemId}:`, uri ? 'SUCCESS' : 'NULL');

                    if (uri) {
                        // Use the ViewShot URI directly — no copy needed
                        savedUris.push(uri);
                        console.log(`✅ Captured ${itemId}: ${uri}`);
                        successCount++;
                    } else {
                        console.warn(`⚠️ Capture returned null for ${itemId}`);
                        failCount++;
                    }
                } catch (error: any) {
                    console.error(`❌ Failed to capture/save ${itemId}:`, error?.message || error);
                    failCount++;
                }
            }

            setIsDownloading(false);
            setDownloadProgress(0);

            if (successCount > 0 && savedUris.length > 0) {
                // Try MediaLibrary first (works in dev builds), fallback to sharing (works in Expo Go)
                let savedToLibrary = false;
                try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        for (const fileUri of savedUris) {
                            await MediaLibrary.saveToLibraryAsync(fileUri);
                        }
                        savedToLibrary = true;
                    }
                } catch (mediaErr: any) {
                    console.log('MediaLibrary save failed (expected in Expo Go), using share instead:', mediaErr?.message);
                }

                if (savedToLibrary) {
                    Alert.alert(
                        '✅ Download Complete!',
                        `${successCount} image${successCount > 1 ? 's' : ''} saved to your photo library!${failCount > 0 ? `\n${failCount} failed.` : ''}`,
                        [{ text: 'OK', onPress: onClose }]
                    );
                } else {
                    // Fallback: share via system share sheet
                    const canShare = await Sharing.isAvailableAsync();
                    if (canShare) {
                        Alert.alert(
                            '📥 Images Ready!',
                            `${successCount} image${successCount > 1 ? 's' : ''} captured! Tap OK to save/share ${successCount > 1 ? 'the first image' : 'it'}.\n\n(In Expo Go, images open via the share sheet — tap "Save Image" to save to your gallery)`,
                            [{
                                text: 'OK', onPress: async () => {
                                    try {
                                        // Share the first image (Android share sheet can only handle one at a time)
                                        await Sharing.shareAsync(savedUris[0], {
                                            mimeType: 'image/png',
                                            dialogTitle: `Save ${babyName}'s Birth Announcement`,
                                        });
                                        // If there are more images, share them one by one
                                        for (let i = 1; i < savedUris.length; i++) {
                                            await Sharing.shareAsync(savedUris[i], {
                                                mimeType: 'image/png',
                                                dialogTitle: `Save ${babyName}'s Birth Announcement (${i + 1}/${savedUris.length})`,
                                            });
                                        }
                                        onClose();
                                    } catch (shareErr) {
                                        console.log('Share cancelled or failed:', shareErr);
                                        onClose();
                                    }
                                }
                            }]
                        );
                    } else {
                        Alert.alert(
                            '✅ Images Captured!',
                            `${successCount} image${successCount > 1 ? 's' : ''} captured but sharing is not available on this device.\n\nImages saved to: ${savedUris[0]}`,
                            [{ text: 'OK', onPress: onClose }]
                        );
                    }
                }
            } else {
                Alert.alert(
                    'Download Failed',
                    'Could not capture images. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (err: any) {
            setIsDownloading(false);
            setDownloadProgress(0);
            console.error('CRASH in handleDownload:', err?.message || err);
            Alert.alert('Download Error', `Something went wrong: ${err?.message || String(err)}`);
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
                                        <Text style={styles.categoryTitle}>💌 Postcards</Text>
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
                                        <Text style={styles.categoryTitle}>⚾ Trading Cards</Text>
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
                                    <Text style={styles.downloadButtonText}>
                                        📥 Download {selectedItems.size > 0 ? `(${selectedItems.size})` : ''} to Device
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.freeText}>FREE - Print at home or local shop</Text>
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
        color: '#1a472a',
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
        borderBottomColor: '#1a472a',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
    },
    activeTabText: {
        color: '#1a472a',
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
        backgroundColor: '#1a472a',
        borderColor: '#1a472a',
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
        backgroundColor: '#1a472a',
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
        fontSize: 18,
        fontWeight: 'bold',
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
        color: '#1a472a',
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
        color: '#1a472a',
        marginBottom: 8,
    },
    comingSoonText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
