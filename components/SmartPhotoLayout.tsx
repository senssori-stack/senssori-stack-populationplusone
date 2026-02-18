import React from 'react';
import { View, Image } from 'react-native';

interface SmartPhotoLayoutProps {
    babies?: Array<{ first?: string; middle?: string; last?: string; photoUri?: string | null }>;
    fallbackPhotoUri?: string | null;
    totalPhotoSize: number; // The total area available for photos
    containerWidth: number;
    containerHeight: number;
}

export default function SmartPhotoLayout({
    babies,
    fallbackPhotoUri,
    totalPhotoSize,
    containerWidth,
    containerHeight
}: SmartPhotoLayoutProps) {

    // Create array of photos - use baby's photo if available, otherwise fallback
    const photos: string[] = [];
    const fallback = fallbackPhotoUri || 'https://via.placeholder.com/400x400/cccccc/999999';

    if (babies && babies.length > 0) {
        babies.forEach(baby => {
            // Use baby's photo if they have one, otherwise use fallback
            const photoToUse = baby.photoUri || fallback;
            photos.push(photoToUse);
        });
    } else {
        // No babies defined, use single fallback
        photos.push(fallback);
    }

    // Calculate layout based on number of photos
    const renderPhotos = () => {
        switch (photos.length) {
            case 1:
                // Single photo - use full size
                return (
                    <View style={{
                        width: totalPhotoSize,
                        height: totalPhotoSize,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image
                            source={{ uri: photos[0] }}
                            style={{
                                width: totalPhotoSize,
                                height: totalPhotoSize,
                                borderRadius: totalPhotoSize * 0.02
                            }}
                        />
                    </View>
                );

            case 2:
                // Two photos side by side - increased spacing and optimized sizing
                const twinPhotoSize = totalPhotoSize * 0.45; // Reduced from 0.48 to 0.45 to make room for larger gap
                const gap = totalPhotoSize * 0.10; // Increased from 0.04 to 0.10 for much more space between photos

                return (
                    <View style={{
                        width: totalPhotoSize,
                        height: totalPhotoSize,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image
                            source={{ uri: photos[0] }}
                            style={{
                                width: twinPhotoSize,
                                height: twinPhotoSize,
                                borderRadius: twinPhotoSize * 0.02,
                                marginRight: gap / 2
                            }}
                        />
                        <Image
                            source={{ uri: photos[1] }}
                            style={{
                                width: twinPhotoSize,
                                height: twinPhotoSize,
                                borderRadius: twinPhotoSize * 0.02,
                                marginLeft: gap / 2
                            }}
                        />
                    </View>
                );

            case 3:
                // Three photos in triangle arrangement
                const tripletPhotoSize = totalPhotoSize * 0.42; // Slightly smaller to fit 3
                const verticalGap = totalPhotoSize * 0.08;
                const tripletGap = totalPhotoSize * 0.04; // Define gap for triplets

                return (
                    <View style={{
                        width: totalPhotoSize,
                        height: totalPhotoSize,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Top row - 2 photos */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: verticalGap / 2
                        }}>
                            <Image
                                source={{ uri: photos[0] }}
                                style={{
                                    width: tripletPhotoSize,
                                    height: tripletPhotoSize,
                                    borderRadius: tripletPhotoSize * 0.02,
                                    marginRight: tripletGap / 2
                                }}
                            />
                            <Image
                                source={{ uri: photos[1] }}
                                style={{
                                    width: tripletPhotoSize,
                                    height: tripletPhotoSize,
                                    borderRadius: tripletPhotoSize * 0.02,
                                    marginLeft: tripletGap / 2
                                }}
                            />
                        </View>
                        {/* Bottom row - 1 photo centered */}
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: verticalGap / 2
                        }}>
                            <Image
                                source={{ uri: photos[2] }}
                                style={{
                                    width: tripletPhotoSize,
                                    height: tripletPhotoSize,
                                    borderRadius: tripletPhotoSize * 0.02
                                }}
                            />
                        </View>
                    </View>
                );

            default:
                // For 4+ babies, use 2x2 grid (can extend later if needed)
                const gridPhotoSize = totalPhotoSize * 0.45;
                const gridGap = totalPhotoSize * 0.05;

                return (
                    <View style={{
                        width: totalPhotoSize,
                        height: totalPhotoSize,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            marginBottom: gridGap / 2
                        }}>
                            <Image
                                source={{ uri: photos[0] }}
                                style={{
                                    width: gridPhotoSize,
                                    height: gridPhotoSize,
                                    borderRadius: gridPhotoSize * 0.02,
                                    marginRight: gridGap / 2
                                }}
                            />
                            <Image
                                source={{ uri: photos[1] || photos[0] }}
                                style={{
                                    width: gridPhotoSize,
                                    height: gridPhotoSize,
                                    borderRadius: gridPhotoSize * 0.02,
                                    marginLeft: gridGap / 2
                                }}
                            />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            marginTop: gridGap / 2
                        }}>
                            <Image
                                source={{ uri: photos[2] || photos[0] }}
                                style={{
                                    width: gridPhotoSize,
                                    height: gridPhotoSize,
                                    borderRadius: gridPhotoSize * 0.02,
                                    marginRight: gridGap / 2
                                }}
                            />
                            <Image
                                source={{ uri: photos[3] || photos[1] || photos[0] }}
                                style={{
                                    width: gridPhotoSize,
                                    height: gridPhotoSize,
                                    borderRadius: gridPhotoSize * 0.02,
                                    marginLeft: gridGap / 2
                                }}
                            />
                        </View>
                    </View>
                );
        }
    };

    return renderPhotos();
}
