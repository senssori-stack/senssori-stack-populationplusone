import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AboutUs'>;

export default function AboutUsScreen({ navigation }: Props) {
    return (
        <LinearGradient colors={['#2d5016', '#3d6b1f']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d5016" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={styles.iconBox}>
                        <Text style={styles.iconText}>+1</Text>
                    </View>
                    <Text style={styles.title}>About Us</Text>
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome to Population +1</Text>
                        <Text style={styles.cardText}>
                            Population +1 helps you create beautiful, personalized announcements
                            for life's most precious moments. From welcoming a new baby to
                            celebrating major milestones, we make it easy to share your joy
                            with friends and family.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Our Mission</Text>
                        <Text style={styles.cardText}>
                            We believe every life event deserves to be celebrated and remembered.
                            Our app captures the world as it was on your special day - from
                            market prices to pop culture - creating a unique time capsule
                            that will be treasured for generations.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Contact Us</Text>
                        <Text style={styles.cardText}>
                            Have questions or feedback? We'd love to hear from you!
                        </Text>
                        <Text style={styles.email}>info@populationplusone.com</Text>
                    </View>
                </View>

                {/* Back Button */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>← Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2d5016',
    },
    scrollView: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#4a7c2c',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d5016',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    email: {
        fontSize: 14,
        color: '#2d5016',
        fontWeight: '600',
        marginTop: 8,
    },
    buttonSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d5016',
    },
});
