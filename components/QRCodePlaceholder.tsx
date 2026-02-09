import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QRCodePlaceholderProps {
    size?: number;
    value?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    label?: string;
}

/**
 * QR Code Placeholder Component
 * 
 * This creates a visual QR code placeholder pattern.
 * Replace with actual QR code library (react-native-qrcode-svg) when ready.
 * 
 * Usage:
 *   <QRCodePlaceholder size={150} value="https://populationplusone.com" label="Scan Me!" />
 */
export default function QRCodePlaceholder({
    size = 120,
    value = 'https://populationplusone.com',
    backgroundColor = '#fff',
    foregroundColor = '#000',
    label,
}: QRCodePlaceholderProps) {
    const cellSize = size / 25;

    // Generate a pseudo-random pattern based on the value string
    const generatePattern = () => {
        const pattern: boolean[][] = [];
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash) + value.charCodeAt(i);
            hash = hash & hash;
        }

        for (let row = 0; row < 25; row++) {
            pattern[row] = [];
            for (let col = 0; col < 25; col++) {
                // Always draw finder patterns in corners
                if (isFinderPattern(row, col)) {
                    pattern[row][col] = true;
                } else if (isFinderBorder(row, col)) {
                    pattern[row][col] = false;
                } else {
                    // Pseudo-random fill based on position and hash
                    const seed = (hash + row * 31 + col * 17) % 100;
                    pattern[row][col] = seed > 45;
                }
            }
        }
        return pattern;
    };

    // Check if position is part of a finder pattern (the 3 corner squares)
    const isFinderPattern = (row: number, col: number): boolean => {
        // Top-left finder
        if (row < 7 && col < 7) {
            if (row === 0 || row === 6 || col === 0 || col === 6) return true;
            if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
        }
        // Top-right finder
        if (row < 7 && col >= 18) {
            const c = col - 18;
            if (row === 0 || row === 6 || c === 0 || c === 6) return true;
            if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
        }
        // Bottom-left finder
        if (row >= 18 && col < 7) {
            const r = row - 18;
            if (r === 0 || r === 6 || col === 0 || col === 6) return true;
            if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
        }
        return false;
    };

    // Check if position is the white border around finder patterns
    const isFinderBorder = (row: number, col: number): boolean => {
        // Border around top-left
        if ((row === 7 && col < 8) || (col === 7 && row < 8)) return true;
        // Border around top-right
        if ((row === 7 && col >= 17) || (col === 17 && row < 8)) return true;
        // Border around bottom-left
        if ((row === 17 && col < 8) || (col === 7 && row >= 17)) return true;
        return false;
    };

    const pattern = generatePattern();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.qrContainer,
                    {
                        width: size,
                        height: size,
                        backgroundColor,
                        padding: cellSize * 2,
                    }
                ]}
            >
                <View style={styles.grid}>
                    {pattern.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((cell, colIndex) => (
                                <View
                                    key={colIndex}
                                    style={[
                                        styles.cell,
                                        {
                                            width: cellSize,
                                            height: cellSize,
                                            backgroundColor: cell ? foregroundColor : backgroundColor,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
            {label && <Text style={styles.label}>{label}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    qrContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    grid: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        // Size set dynamically
    },
    label: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
});
