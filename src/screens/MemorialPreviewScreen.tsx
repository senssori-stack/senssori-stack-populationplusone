import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    Image,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
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

    const handleShare = async () => {
        try {
            const message = `In Loving Memory of\n${fullName}\n${displayDates}${hometown ? `\nof ${hometown}` : ''}`;
            await Share.share({
                message,
                title: `In Memory of ${fullName}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    return (
        <View style={styles.screenContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* The Memorial Sign - matching SignFront layout exactly */}
                <View style={styles.signWrapper}>
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
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Text style={styles.shareButtonText}>📤 Share on Social Media</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backSideButton}
                        onPress={() => navigation.navigate('MemorialBack', route.params)}
                    >
                        <Text style={styles.backSideButtonText}>View Arrangements →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.editButtonText}>← Edit Details</Text>
                    </TouchableOpacity>
                </View>

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
    actions: {
        padding: 20,
    },
    shareButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    backSideButton: {
        backgroundColor: '#f59e0b',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    backSideButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    editButton: {
        backgroundColor: '#1a472a',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    bottomSpacer: {
        height: 40,
    },
});
