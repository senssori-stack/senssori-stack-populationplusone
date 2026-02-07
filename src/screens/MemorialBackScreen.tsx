import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MemorialBack'>;

const { width: screenWidth } = Dimensions.get('window');
const SIGN_WIDTH = screenWidth - 40;

// Theme configurations (same as front)
const THEMES = {
    classic: {
        gradient: ['#1a1a1a', '#2d2d2d', '#1a1a1a'],
        accent: '#c9b037',
        text: '#ffffff',
        border: '#c9b037',
    },
    elegant: {
        gradient: ['#2c3e50', '#34495e', '#2c3e50'],
        accent: '#bdc3c7',
        text: '#ffffff',
        border: '#bdc3c7',
    },
    nature: {
        gradient: ['#1e3a29', '#2d5016', '#1e3a29'],
        accent: '#8fbc8f',
        text: '#ffffff',
        border: '#8fbc8f',
    },
    faith: {
        gradient: ['#1a1a2e', '#16213e', '#1a1a2e'],
        accent: '#e6d5b8',
        text: '#ffffff',
        border: '#e6d5b8',
    },
    military: {
        gradient: ['#2b3a2b', '#3d4d3d', '#2b3a2b'],
        accent: '#cd853f',
        text: '#ffffff',
        border: '#cd853f',
    },
};

export default function MemorialBackScreen({ navigation, route }: Props) {
    const {
        firstName = '',
        lastName = '',
        theme = 'classic',
        viewingDate,
        viewingTime,
        viewingLocation,
        viewingAddress,
        serviceType,
        serviceDate,
        serviceTime,
        serviceLocation,
        serviceAddress,
        burialLocation,
        burialAddress,
        receptionInfo,
        pallbearers,
        honoraryPallbearers,
        flowerBearers,
        clergyName,
        musicSelections,
        donationInfo,
        specialThanks,
    } = route.params;

    const themeConfig = THEMES[theme] || THEMES.classic;
    const fullName = `${firstName} ${lastName}`;

    const SERVICE_LABELS: Record<string, string> = {
        funeral: 'Funeral Service',
        celebration: 'Celebration of Life',
        memorial: 'Memorial Service',
        private: 'Private Service',
    };

    const hasViewing = viewingDate || viewingTime || viewingLocation;
    const hasService = serviceDate || serviceTime || serviceLocation;
    const hasBurial = burialLocation || burialAddress;
    const hasPallbearers = pallbearers || honoraryPallbearers;

    const Section = ({ title, children, show = true }: { title: string; children: React.ReactNode; show?: boolean }) => {
        if (!show) return null;
        return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeConfig.accent }]}>{title}</Text>
                {children}
            </View>
        );
    };

    return (
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* The Memorial Back Sign */}
                <View style={styles.signContainer}>
                    <LinearGradient
                        colors={themeConfig.gradient as [string, string, ...string[]]}
                        style={[styles.sign, { borderColor: themeConfig.border }]}
                    >
                        {/* Header */}
                        <Text style={[styles.header, { color: themeConfig.accent }]}>
                            Order of Service
                        </Text>
                        <Text style={[styles.subHeader, { color: themeConfig.text }]}>
                            In Loving Memory of {fullName}
                        </Text>

                        <View style={[styles.divider, { backgroundColor: themeConfig.accent }]} />

                        {/* Viewing/Visitation */}
                        <Section title="👁️ Viewing / Visitation" show={!!hasViewing}>
                            {(viewingDate || viewingTime) && (
                                <Text style={[styles.infoText, { color: themeConfig.text }]}>
                                    {viewingDate}{viewingTime ? ` • ${viewingTime}` : ''}
                                </Text>
                            )}
                            {viewingLocation && (
                                <Text style={[styles.infoText, { color: themeConfig.text }]}>{viewingLocation}</Text>
                            )}
                            {viewingAddress && (
                                <Text style={[styles.addressText, { color: 'rgba(255,255,255,0.7)' }]}>{viewingAddress}</Text>
                            )}
                        </Section>

                        {/* Service */}
                        <Section title={`🕊️ ${serviceType ? SERVICE_LABELS[serviceType] : 'Service'}`} show={!!hasService}>
                            {(serviceDate || serviceTime) && (
                                <Text style={[styles.infoText, { color: themeConfig.text }]}>
                                    {serviceDate}{serviceTime ? ` at ${serviceTime}` : ''}
                                </Text>
                            )}
                            {serviceLocation && (
                                <Text style={[styles.infoText, { color: themeConfig.text }]}>{serviceLocation}</Text>
                            )}
                            {serviceAddress && (
                                <Text style={[styles.addressText, { color: 'rgba(255,255,255,0.7)' }]}>{serviceAddress}</Text>
                            )}
                        </Section>

                        {/* Officiant */}
                        <Section title="⛪ Officiant" show={!!clergyName}>
                            <Text style={[styles.infoText, { color: themeConfig.text }]}>{clergyName}</Text>
                        </Section>

                        {/* Music */}
                        <Section title="🎵 Music" show={!!musicSelections}>
                            <Text style={[styles.infoText, { color: themeConfig.text }]}>{musicSelections}</Text>
                        </Section>

                        {/* Pallbearers */}
                        <Section title="🤝 Pallbearers" show={!!hasPallbearers}>
                            {pallbearers && (
                                <Text style={[styles.nameList, { color: themeConfig.text }]}>{pallbearers}</Text>
                            )}
                            {honoraryPallbearers && (
                                <>
                                    <Text style={[styles.subSectionTitle, { color: themeConfig.accent }]}>Honorary</Text>
                                    <Text style={[styles.nameList, { color: themeConfig.text }]}>{honoraryPallbearers}</Text>
                                </>
                            )}
                        </Section>

                        {/* Flower Bearers */}
                        <Section title="💐 Flower Bearers" show={!!flowerBearers}>
                            <Text style={[styles.nameList, { color: themeConfig.text }]}>{flowerBearers}</Text>
                        </Section>

                        {/* Burial */}
                        <Section title="⚰️ Interment" show={!!hasBurial}>
                            {burialLocation && (
                                <Text style={[styles.infoText, { color: themeConfig.text }]}>{burialLocation}</Text>
                            )}
                            {burialAddress && (
                                <Text style={[styles.addressText, { color: 'rgba(255,255,255,0.7)' }]}>{burialAddress}</Text>
                            )}
                        </Section>

                        {/* Reception */}
                        <Section title="🍽️ Repast" show={!!receptionInfo}>
                            <Text style={[styles.infoText, { color: themeConfig.text }]}>{receptionInfo}</Text>
                        </Section>

                        {/* Donations */}
                        <Section title="💝 In Lieu of Flowers" show={!!donationInfo}>
                            <Text style={[styles.infoText, { color: themeConfig.text }]}>{donationInfo}</Text>
                        </Section>

                        {/* Acknowledgements */}
                        <Section title="🙏 Acknowledgements" show={!!specialThanks}>
                            <Text style={[styles.thanksText, { color: themeConfig.text }]}>{specialThanks}</Text>
                        </Section>

                        <View style={[styles.divider, { backgroundColor: themeConfig.accent }]} />

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: themeConfig.accent }]}>
                                🕊️ Forever in Our Hearts 🕊️
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.frontButton}
                        onPress={() => navigation.navigate('MemorialPreview', route.params)}
                    >
                        <Text style={styles.frontButtonText}>← View Front</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('ObituaryForm')}
                    >
                        <Text style={styles.editButtonText}>✏️ Edit Details</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    signContainer: {
        padding: 20,
        alignItems: 'center',
    },
    sign: {
        width: SIGN_WIDTH,
        borderRadius: 16,
        borderWidth: 3,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 16,
        opacity: 0.5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    subSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 22,
    },
    addressText: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 2,
    },
    nameList: {
        fontSize: 13,
        lineHeight: 20,
    },
    thanksText: {
        fontSize: 13,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    footer: {
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        fontSize: 14,
        letterSpacing: 1,
    },
    actions: {
        padding: 20,
        flexDirection: 'row',
        gap: 12,
    },
    frontButton: {
        flex: 1,
        backgroundColor: '#64b5f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    frontButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    editButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    bottomSpacer: {
        height: 40,
    },
});
