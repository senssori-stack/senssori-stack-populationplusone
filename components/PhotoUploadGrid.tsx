import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    photos: (string | null)[];
    onPhotosChange: (photos: (string | null)[]) => void;
    maxPhotos?: number;
    label?: string;
};

/**
 * PhotoUploadGrid - A 3-slot photo upload component
 * 
 * Displays a row of photo slots where users can:
 * - Tap an empty slot to add a photo
 * - Tap a filled slot to replace the photo
 * - Tap the X button to remove a photo
 */
export default function PhotoUploadGrid({
    photos,
    onPhotosChange,
    maxPhotos = 3,
    label = 'Photos (up to 3)',
}: Props) {
    // Ensure we always have exactly maxPhotos slots
    const photoSlots = [...photos];
    while (photoSlots.length < maxPhotos) {
        photoSlots.push(null);
    }

    const pickPhoto = async (index: number) => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const granted = (perm as any).status === 'granted' || (perm as any).granted === true;
            if (!granted) {
                alert('Permission required to pick a photo. Please enable Photos/Media access in Settings.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            const cancelled = (result as any).canceled === true || (result as any).cancelled === true;
            if (cancelled) return;

            const uri = (result as any).assets?.[0]?.uri ?? (result as any).uri ?? null;
            if (uri) {
                const newPhotos = [...photoSlots];
                newPhotos[index] = uri;
                onPhotosChange(newPhotos.slice(0, maxPhotos));
            }
        } catch (e) {
            alert('Unable to pick a photo — an unexpected error occurred.');
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photoSlots];
        newPhotos[index] = null;
        onPhotosChange(newPhotos.slice(0, maxPhotos));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.grid}>
                {photoSlots.slice(0, maxPhotos).map((photo, index) => (
                    <View key={index} style={styles.slotContainer}>
                        <TouchableOpacity
                            style={[
                                styles.slot,
                                photo ? styles.slotFilled : styles.slotEmpty
                            ]}
                            onPress={() => pickPhoto(index)}
                            activeOpacity={0.7}
                        >
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.image} />
                            ) : (
                                <View style={styles.emptyContent}>
                                    <Text style={styles.plusIcon}>+</Text>
                                    <Text style={styles.slotLabel}>Photo {index + 1}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {photo && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removePhoto(index)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.removeButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
    },
    slotContainer: {
        flex: 1,
        position: 'relative',
    },
    slot: {
        aspectRatio: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    slotEmpty: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderStyle: 'dashed',
    },
    slotFilled: {
        backgroundColor: '#e8f5e8',
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    emptyContent: {
        alignItems: 'center',
    },
    plusIcon: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    slotLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
