import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import CartModal from '../../components/CartModal';
import DownloadModal, { DownloadItem } from '../../components/DownloadModal';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MemorialPreview'>;

// Theme background colors (matching baby sign themes)
const THEME_COLORS: Record<string, string> = {
    classic: '#1a1a1a',      // Black
    elegant: '#2c3e50',      // Slate
    nature: '#1e3a29',       // Forest green (same as baby)
    faith: '#1a1a2e',        // Navy
    military: '#2b3a2b',     // Olive
};

export default function MemorialPreviewScreen({ navigation, route }: Props) {
    const {
        firstName = '',
        middleName = '',
        lastName = '',
        photoUri,
        dateOfBirth,
        dateOfDeath,
        hometown,
        theme = 'classic',
    } = route.params;

    const { width } = useWindowDimensions();
    const backgroundColor = THEME_COLORS[theme] || THEME_COLORS.classic;

    // Parse city and state from hometown (expected format: "City, ST")
    let city = '';
    let state = '';
    if (hometown && hometown.includes(',')) {
        const parts = hometown.split(',').map(p => p.trim());
        city = parts[0] || '';
        state = parts[1] || '';
    } else if (hometown) {
        city = hometown;
    }

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const displayDates = dateOfBirth && dateOfDeath
        ? `${dateOfBirth} — ${dateOfDeath}`
        : dateOfBirth || dateOfDeath || '';

    // Fixed physical dimensions matching SignFront exactly
    const fixedDocWidth = 3300;
    const fixedDocHeight = 2550;
    const scale = Math.min((width - 40) / fixedDocWidth, 1);
    const displayWidth = fixedDocWidth * scale;
    const displayHeight = fixedDocHeight * scale;
    const baseFontSize = displayWidth * 0.0675;

    const signRef = useRef<ViewShot | null>(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    const downloadItems: DownloadItem[] = [
        { id: 'memorial-front', label: 'Memorial Sign', ref: signRef },
    ];

    const handleCapture = async (itemId: string): Promise<string | null> => {
        if (itemId === 'memorial-front' && signRef.current) {
            return await (signRef.current as any).capture();
        }
        return null;
    };

    return (
        <View style={styles.screenContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* The Memorial Sign - matching SignFront layout exactly */}
                <View style={styles.signWrapper}>
                    <ViewShot ref={signRef} options={{ format: 'png', quality: 1 }}>
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor,
                                    width: displayWidth,
                                    height: displayHeight,
                                    padding: displayWidth * 0.024,
                                },
                            ]}
                        >
                            {/* Border frame */}
                            <View style={styles.border}>
                                <View style={styles.innerBorder}>
                                    {/* Content */}
                                    <View style={styles.content}>
                                        {/* "In Loving Memory" script (like "Welcome To") */}
                                        <Text style={[styles.script, { fontSize: baseFontSize * 0.9 }]}>
                                            In Loving Memory
                                        </Text>

                                        {/* City, State */}
                                        {(city || state) && (
                                            <Text style={[styles.cityState, { fontSize: baseFontSize * 2.5 }]}>
                                                {city.toUpperCase()}{state ? `, ${state.toUpperCase()}` : ''}
                                            </Text>
                                        )}

                                        {/* Population label */}
                                        <Text style={[styles.populationLabel, { fontSize: baseFontSize * 1.5 }]}>
                                            POPULATION
                                        </Text>

                                        {/* -1 indicator */}
                                        <Text style={[styles.minusOne, { fontSize: baseFontSize * 3.5 }]}>
                                            -1
                                        </Text>

                                        {/* Person's name */}
                                        <Text style={[styles.personName, { fontSize: baseFontSize * 1.8 }]}>
                                            {fullName.toUpperCase()}
                                        </Text>

                                        {/* Dates */}
                                        {displayDates && (
                                            <Text style={[styles.dates, { fontSize: baseFontSize * 0.8 }]}>
                                                {displayDates}
                                            </Text>
                                        )}

                                        {/* Photo */}
                                        {photoUri ? (
                                            <Image
                                                source={{ uri: photoUri }}
                                                style={[
                                                    styles.photo,
                                                    {
                                                        width: displayWidth * 0.24,
                                                        height: displayWidth * 0.24,
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <View
                                                style={[
                                                    styles.photoPlaceholder,
                                                    {
                                                        width: displayWidth * 0.24,
                                                        height: displayWidth * 0.24,
                                                    },
                                                ]}
                                            >
                                                <Text style={[styles.photoPlaceholderText, { fontSize: displayWidth * 0.06 }]}>🕊️</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ViewShot>
                </View>

                {/* Action Tiles */}
                <View style={styles.actionTileGrid}>
                    <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#6b7280' }]} onPress={() => navigation.goBack()}>
                        <Text style={styles.actionTileEmoji}>←</Text>
                        <Text style={styles.actionTileLabel}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#2563eb' }]} onPress={() => setShowDownloadModal(true)}>
                        <Text style={styles.actionTileEmoji}>📥</Text>
                        <Text style={styles.actionTileLabel}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#0000b3' }]} onPress={() => navigation.navigate('PrintService', route.params as any)}>
                        <Text style={styles.actionTileEmoji}>🖨️</Text>
                        <Text style={styles.actionTileLabel}>Print</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#d97706' }]} onPress={() => setShowCartModal(true)}>
                        <Text style={styles.actionTileEmoji}>🧾</Text>
                        <Text style={styles.actionTileLabel}>Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionTile, { backgroundColor: '#dc2626' }]} onPress={() => navigation.navigate('SendAsGift', route.params as any)}>
                        <Text style={styles.actionTileEmoji}>🎁</Text>
                        <Text style={styles.actionTileLabel}>Gift</Text>
                    </TouchableOpacity>
                </View>

                <DownloadModal
                    visible={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                    items={downloadItems}
                    onCapture={handleCapture}
                    babyName={firstName}
                />

                <CartModal
                    visible={showCartModal}
                    onClose={() => setShowCartModal(false)}
                />

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scrollView: {
        flex: 1,
    },
    signWrapper: {
        padding: 20,
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    border: {
        flex: 1,
        width: '100%',
        borderWidth: 8,
        borderColor: '#fff',
        borderRadius: 24,
        padding: 4,
    },
    innerBorder: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    script: {
        color: '#fff',
        fontStyle: 'italic',
        fontWeight: '300',
        marginBottom: 8,
    },
    cityState: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 2,
    },
    populationLabel: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        marginTop: 8,
    },
    minusOne: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 4,
    },
    personName: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 8,
    },
    dates: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        opacity: 0.9,
    },
    photo: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoPlaceholder: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        color: '#fff',
    },
    actionTileGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 16,
        gap: 6,
    },
    actionTile: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    actionTileEmoji: {
        fontSize: 18,
        marginBottom: 2,
    },
    actionTileLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 40,
    },
});
