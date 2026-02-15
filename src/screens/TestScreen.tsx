import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SignFrontLandscape from '../../components/SignFrontLandscape';
import TimeCapsuleLandscape from '../../components/TimeCapsuleLandscape';
import { calculateLifePath } from '../data/utils/life-path-calculator';
import { getPopulationForCity } from '../data/utils/populations';
import { getAllSnapshotValues } from '../data/utils/snapshot';
import type { RootStackParamList } from '../types';

type TestMode = 'front-landscape' | 'back-landscape';
type Props = NativeStackScreenProps<RootStackParamList, 'Test'>;

export default function TestScreen({ navigation }: Props) {
    const [mode, setMode] = useState<TestMode>('front-landscape');
    const [snapshot, setSnapshot] = useState<Record<string, string>>({});
    const [population, setPopulation] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data from Google Sheets on component mount
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch snapshot data from Google Sheets
                const snapshotData = await getAllSnapshotValues();
                setSnapshot(snapshotData);

                // Fetch population for Chicago
                const chicagoPopulation = await getPopulationForCity('CHICAGO, IL');
                setPopulation(chicagoPopulation);
            } catch (error) {
                console.error('Error fetching data from Google Sheets:', error);
                // Fallback to mock data if fetch fails
                setSnapshot({
                    'GALLON OF GASOLINE': '3.45',
                    'LOAF OF BREAD': '2.85',
                    'DOZEN EGGS': '3.12',
                    'GALLON OF MILK': '3.89',
                    'GOLD OZ': '2045.50',
                    'SILVER OZ': '24.75',
                    'DOW JONES CLOSE': '43500.25',
                    'US POPULATION': '335000000',
                    'WORLD POPULATION': '8100000000',
                    'PRESIDENT': 'Joe Biden',
                    'VICE PRESIDENT': 'Kamala Harris',
                    '#1 SONG': 'Test Song - Test Artist',
                    'WON LAST SUPERBOWL': 'Kansas City Chiefs',
                    'WON LAST WORLD SERIES': 'Texas Rangers',
                });
                setPopulation(2746388); // Chicago fallback
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Sample data for testing
    const testDobISO = '2024-10-20';
    const lifePathResult = calculateLifePath(testDobISO);
    const lifePathNumber = lifePathResult.number;

    const testProps = {
        theme: 'green' as const,
        hometown: 'CHICAGO, IL',
        population: population ?? undefined,
        babies: [{ first: 'Emma', middle: 'Grace', last: 'Smith', photoUri: null }],
        babyName: 'Emma Grace Smith',
        photoUri: null,
        dobISO: testDobISO,
        motherName: 'Sarah Smith',
        fatherName: 'John Smith',
        weightLb: '7',
        weightOz: '8',
        lengthIn: '20',
        snapshot,
        zodiac: 'Libra',
        birthstone: 'Opal',
        lifePathNumber,
        previewScale: 0.25, // Default smaller scale
    };

    // Fit-to-screen preview scales to see full 8.5x11 pages
    const landscapeProps = {
        ...testProps,
        previewScale: 0.18, // Smaller scale to fit full landscape page on screen
    };

    const renderComponent = () => {
        switch (mode) {
            case 'front-landscape':
                return <SignFrontLandscape {...landscapeProps} />;
            case 'back-landscape':
                return <TimeCapsuleLandscape {...landscapeProps} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading data from Google Sheets...</Text>
                </View>
            ) : (
                <>
                    {/* Mode selector */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, mode === 'front-landscape' && styles.activeButton]}
                            onPress={() => setMode('front-landscape')}
                        >
                            <Text style={[styles.buttonText, mode === 'front-landscape' && styles.activeButtonText]}>
                                Front Landscape
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, mode === 'back-landscape' && styles.activeButton]}
                            onPress={() => setMode('back-landscape')}
                        >
                            <Text style={[styles.buttonText, mode === 'back-landscape' && styles.activeButtonText]}>
                                Back Landscape
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Navigation to Form Screen */}
                    <View style={styles.formButtonContainer}>
                        <TouchableOpacity
                            style={styles.formButton}
                            onPress={() => navigation.navigate('Form')}
                        >
                            <Text style={styles.formButtonText}>
                                🍼 GO TO ONLINE SUBMISSION FORM
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Component display */}
                    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>
                            {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - 8.5x11 Preview
                        </Text>
                        {renderComponent()}
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50,
    },
    buttons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 8,
    },
    button: {
        backgroundColor: '#ddd',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        minWidth: '45%',
    },
    activeButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    activeButtonText: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formButtonContainer: {
        padding: 15,
        paddingTop: 10,
    },
    formButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    formButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
