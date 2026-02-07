import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Alert,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, MemorialParams } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ObituaryForm'>;

type ServiceType = 'funeral' | 'celebration' | 'memorial' | 'private' | '';
type ThemeType = 'classic' | 'elegant' | 'nature' | 'faith' | 'military';

export default function ObituaryFormScreen({ navigation }: Props) {
    // Basic Info
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    // Dates
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [dateOfDeath, setDateOfDeath] = useState('');
    const [age, setAge] = useState('');

    // Location
    const [hometown, setHometown] = useState('');

    // Service Info
    const [serviceType, setServiceType] = useState<ServiceType>('');
    const [serviceDate, setServiceDate] = useState('');
    const [serviceTime, setServiceTime] = useState('');
    const [serviceLocation, setServiceLocation] = useState('');
    const [serviceAddress, setServiceAddress] = useState('');

    // Donations & Message
    const [donationInfo, setDonationInfo] = useState('');
    const [shortMessage, setShortMessage] = useState('');

    // Theme
    const [theme, setTheme] = useState<ThemeType>('classic');

    // Back side - Arrangements
    const [viewingDate, setViewingDate] = useState('');
    const [viewingTime, setViewingTime] = useState('');
    const [viewingLocation, setViewingLocation] = useState('');
    const [viewingAddress, setViewingAddress] = useState('');
    const [burialLocation, setBurialLocation] = useState('');
    const [burialAddress, setBurialAddress] = useState('');
    const [receptionInfo, setReceptionInfo] = useState('');
    const [pallbearers, setPallbearers] = useState('');
    const [honoraryPallbearers, setHonoraryPallbearers] = useState('');
    const [flowerBearers, setFlowerBearers] = useState('');
    const [clergyName, setClergyName] = useState('');
    const [musicSelections, setMusicSelections] = useState('');
    const [specialThanks, setSpecialThanks] = useState('');

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access to upload a photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handlePreview = () => {
        if (!firstName || !lastName) {
            Alert.alert('Required Fields', 'Please enter at least a first and last name.');
            return;
        }

        const params: MemorialParams = {
            firstName,
            middleName,
            lastName,
            photoUri,
            dateOfBirth,
            dateOfDeath,
            age,
            hometown,
            serviceType: serviceType || undefined,
            serviceDate,
            serviceTime,
            serviceLocation,
            serviceAddress,
            donationInfo,
            shortMessage,
            theme,
            // Back side arrangements
            viewingDate,
            viewingTime,
            viewingLocation,
            viewingAddress,
            burialLocation,
            burialAddress,
            receptionInfo,
            pallbearers,
            honoraryPallbearers,
            flowerBearers,
            clergyName,
            musicSelections,
            specialThanks,
        };

        navigation.navigate('MemorialPreview', params);
    };

    const ThemeButton = ({ value, label, emoji }: { value: ThemeType; label: string; emoji: string }) => (
        <TouchableOpacity
            style={[styles.themeButton, theme === value && styles.themeButtonSelected]}
            onPress={() => setTheme(value)}
        >
            <Text style={styles.themeEmoji}>{emoji}</Text>
            <Text style={[styles.themeLabel, theme === value && styles.themeLabelSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    const ServiceButton = ({ value, label }: { value: ServiceType; label: string }) => (
        <TouchableOpacity
            style={[styles.serviceButton, serviceType === value && styles.serviceButtonSelected]}
            onPress={() => setServiceType(value)}
        >
            <Text style={[styles.serviceLabel, serviceType === value && styles.serviceLabelSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconBox}>
                            <Text style={styles.iconText}>-1</Text>
                        </View>
                        <Text style={styles.headerTitle}>Memorial Announcement</Text>
                        <Text style={styles.headerSubtitle}>
                            Share with friends & family on social media
                        </Text>
                    </View>

                    {/* Photo Upload */}
                    <TouchableOpacity style={styles.photoSection} onPress={pickImage}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoIcon}>📷</Text>
                                <Text style={styles.photoText}>Tap to add photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Name Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👤 Name</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.flex]}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First *"
                                placeholderTextColor="#888"
                            />
                            <TextInput
                                style={[styles.input, styles.flex]}
                                value={middleName}
                                onChangeText={setMiddleName}
                                placeholder="Middle"
                                placeholderTextColor="#888"
                            />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last Name *"
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Dates Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Dates</Text>
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Born</Text>
                                <TextInput
                                    style={styles.input}
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#888"
                                />
                            </View>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Passed</Text>
                                <TextInput
                                    style={styles.input}
                                    value={dateOfDeath}
                                    onChangeText={setDateOfDeath}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#888"
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={{ width: 100 }}>
                                <Text style={styles.inputLabel}>Age</Text>
                                <TextInput
                                    style={styles.input}
                                    value={age}
                                    onChangeText={setAge}
                                    placeholder="Age"
                                    placeholderTextColor="#888"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Hometown</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hometown}
                                    onChangeText={setHometown}
                                    placeholder="City, State"
                                    placeholderTextColor="#888"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Service Type */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🕊️ Service Type</Text>
                        <View style={styles.serviceGrid}>
                            <ServiceButton value="funeral" label="Funeral" />
                            <ServiceButton value="celebration" label="Celebration of Life" />
                            <ServiceButton value="memorial" label="Memorial Service" />
                            <ServiceButton value="private" label="Private Service" />
                        </View>
                    </View>

                    {/* Service Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Service Details</Text>
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={serviceDate}
                                    onChangeText={setServiceDate}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#888"
                                />
                            </View>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Time</Text>
                                <TextInput
                                    style={styles.input}
                                    value={serviceTime}
                                    onChangeText={setServiceTime}
                                    placeholder="2:00 PM"
                                    placeholderTextColor="#888"
                                />
                            </View>
                        </View>
                        <Text style={styles.inputLabel}>Location Name</Text>
                        <TextInput
                            style={styles.input}
                            value={serviceLocation}
                            onChangeText={setServiceLocation}
                            placeholder="Church, Funeral Home, etc."
                            placeholderTextColor="#888"
                        />
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={serviceAddress}
                            onChangeText={setServiceAddress}
                            placeholder="123 Main St, City, State"
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Donations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💝 In Lieu of Flowers</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={donationInfo}
                            onChangeText={setDonationInfo}
                            placeholder="Donations may be made to..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Short Message */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💬 Short Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={shortMessage}
                            onChangeText={setShortMessage}
                            placeholder="Gone but never forgotten..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={2}
                            maxLength={100}
                        />
                        <Text style={styles.charCount}>{shortMessage.length}/100</Text>
                    </View>

                    {/* Theme Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎨 Design Theme</Text>
                        <View style={styles.themeGrid}>
                            <ThemeButton value="classic" label="Classic" emoji="🖤" />
                            <ThemeButton value="elegant" label="Elegant" emoji="✨" />
                            <ThemeButton value="nature" label="Nature" emoji="🌿" />
                            <ThemeButton value="faith" label="Faith" emoji="✝️" />
                            <ThemeButton value="military" label="Military" emoji="🎖️" />
                        </View>
                    </View>

                    {/* BACK SIDE - ARRANGEMENTS SECTION */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>📄 BACK SIDE - ARRANGEMENTS</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Viewing/Visitation */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👁️ Viewing / Visitation</Text>
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={viewingDate}
                                    onChangeText={setViewingDate}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#888"
                                />
                            </View>
                            <View style={styles.flex}>
                                <Text style={styles.inputLabel}>Time</Text>
                                <TextInput
                                    style={styles.input}
                                    value={viewingTime}
                                    onChangeText={setViewingTime}
                                    placeholder="5:00 PM - 8:00 PM"
                                    placeholderTextColor="#888"
                                />
                            </View>
                        </View>
                        <Text style={styles.inputLabel}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={viewingLocation}
                            onChangeText={setViewingLocation}
                            placeholder="Funeral Home Name"
                            placeholderTextColor="#888"
                        />
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={viewingAddress}
                            onChangeText={setViewingAddress}
                            placeholder="123 Main St, City, State"
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Burial / Interment */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚰️ Burial / Interment</Text>
                        <Text style={styles.inputLabel}>Cemetery Name</Text>
                        <TextInput
                            style={styles.input}
                            value={burialLocation}
                            onChangeText={setBurialLocation}
                            placeholder="Cemetery or Memorial Park"
                            placeholderTextColor="#888"
                        />
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={burialAddress}
                            onChangeText={setBurialAddress}
                            placeholder="Address"
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Reception */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🍽️ Reception / Repast</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={receptionInfo}
                            onChangeText={setReceptionInfo}
                            placeholder="Reception to follow at..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Officiants */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⛪ Officiant / Clergy</Text>
                        <TextInput
                            style={styles.input}
                            value={clergyName}
                            onChangeText={setClergyName}
                            placeholder="Pastor, Rev., Father, Rabbi..."
                            placeholderTextColor="#888"
                        />
                    </View>

                    {/* Pallbearers */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🤝 Pallbearers</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={pallbearers}
                            onChangeText={setPallbearers}
                            placeholder="Names separated by commas..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={2}
                        />
                        <Text style={styles.inputLabel}>Honorary Pallbearers</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={honoraryPallbearers}
                            onChangeText={setHonoraryPallbearers}
                            placeholder="Names separated by commas..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Flower Bearers */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💐 Flower Bearers</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={flowerBearers}
                            onChangeText={setFlowerBearers}
                            placeholder="Names separated by commas..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    {/* Music */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎵 Music Selections</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={musicSelections}
                            onChangeText={setMusicSelections}
                            placeholder="Songs, hymns, performers..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Special Thanks */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🙏 Acknowledgements</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={specialThanks}
                            onChangeText={setSpecialThanks}
                            placeholder="The family wishes to thank..."
                            placeholderTextColor="#888"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Preview Button */}
                    <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
                        <Text style={styles.previewButtonText}>Preview Announcement →</Text>
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 10,
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#2d3a4f',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#64b5f6',
        marginBottom: 12,
    },
    iconText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#64b5f6',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photo: {
        width: 160,
        height: 200,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#64b5f6',
    },
    photoPlaceholder: {
        width: 160,
        height: 200,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    photoText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#1a1a2e',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'right',
        marginTop: -8,
    },
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    serviceButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceButtonSelected: {
        backgroundColor: 'rgba(100,181,246,0.2)',
        borderColor: '#64b5f6',
    },
    serviceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    serviceLabelSelected: {
        color: '#64b5f6',
        fontWeight: 'bold',
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    themeButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        minWidth: 80,
    },
    themeButtonSelected: {
        backgroundColor: 'rgba(100,181,246,0.2)',
        borderColor: '#64b5f6',
    },
    themeEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    themeLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    themeLabelSelected: {
        color: '#64b5f6',
        fontWeight: 'bold',
    },
    previewButton: {
        backgroundColor: '#64b5f6',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    previewButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    bottomSpacer: {
        height: 40,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        paddingVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(100,181,246,0.3)',
    },
    dividerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64b5f6',
        marginHorizontal: 12,
        letterSpacing: 1,
    },
});
