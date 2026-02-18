import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface TimeCapsuleData {
    label: string;
    emoji: string;
    current: string;
    historical?: string;
}

interface TimeCapsuleProps {
    personName: string;
    birthDate: string;
    zodiacSign?: string;
    birthstone?: string;
    message: string;
    dataPoints: TimeCapsuleData[];
    backgroundColor?: string;
}

export default function TimeCapsule({
    personName,
    birthDate,
    zodiacSign = 'Aquarius',
    birthstone = 'Garnet',
    message,
    dataPoints,
    backgroundColor = '#1a472a',
}: TimeCapsuleProps) {
    const { width, height } = useWindowDimensions();

    const isLandscape = width > height;

    // Responsive font sizing
    const baseFontSize = height * 0.0675 * 0.5 * 1.15 * 0.8;
    const titleSize = baseFontSize * 1.25 * 1.3;
    const messageSize = baseFontSize * 0.7;
    const rowLabelSize = baseFontSize * 0.75;
    const rowDataSize = baseFontSize * 0.8;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                    aspectRatio: isLandscape ? 11 / 8.5 : 8.5 / 11,
                    padding: height * 0.03,
                },
            ]}
        >
            {/* Border frame */}
            <View style={styles.border}>
                <View style={styles.innerBorder}>
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentInner}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Title */}
                        <Text style={[styles.title, { fontSize: titleSize }]}>
                            {personName}'s Time Capsule
                        </Text>

                        {/* Message with zodiac and birthstone */}
                        <Text style={[styles.message, { fontSize: messageSize, lineHeight: messageSize * 1.4 }]}>
                            {message} {zodiacSign && `♒ ${zodiacSign}`} and their birthstone is 💎 {birthstone}
                            and below are interesting facts associated with your birth {birthDate}.
                        </Text>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Data table */}
                        {dataPoints.map((point, index) => (
                            <View key={index} style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <Text style={[styles.rowLabel, { fontSize: rowLabelSize }]}>
                                        {point.emoji} {point.label}
                                    </Text>
                                </View>
                                <View style={styles.rowRight}>
                                    <Text style={[styles.rowData, { fontSize: rowDataSize }]}>
                                        {point.current}
                                    </Text>
                                    {point.historical && (
                                        <Text style={[styles.rowData, { fontSize: rowDataSize }]}>
                                            {point.historical}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Footer */}
                        <Text style={[styles.footer, { fontSize: messageSize * 0.8 }]}>
                            *City population reflects current estimate; historical Census data not available for this year.
                            SOURCES: bls.gov, eia.gov, fred.stlouisfed.org, census.gov, archives.gov, billboard.com, wikipedia.org
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        padding: 0,
    },
    innerBorder: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        padding: 0,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: 8,
        paddingTop: 0,
        paddingBottom: 4,
    },
    title: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 2,
        marginTop: 0,
    },
    message: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#fff',
        marginTop: 8,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
    },
    rowLeft: {
        flex: 0.5,
        paddingRight: 8,
    },
    rowRight: {
        flex: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowLabel: {
        color: '#fff',
        fontWeight: '900',
    },
    rowData: {
        color: '#fff',
        fontWeight: '500',
        textAlign: 'right',
    },
    footer: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
