import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import IntroVideoScreen from './components/IntroVideoScreen';
import SplashScreen from './components/SplashScreen';
import AnniversaryFormScreen from './screens/AnniversaryFormScreen';
import BirthdayFormScreen from './screens/BirthdayFormScreen';
import BusinessAnniversaryFormScreen from './screens/BusinessAnniversaryFormScreen';
import FamilyTreeFormScreen from './screens/FamilyTreeFormScreen';
import FamilyTreeIntroScreen from './screens/FamilyTreeIntroScreen';
import GraduationFormScreen from './screens/GraduationFormScreen';
import HospitalLoginScreen from './screens/HospitalLoginScreen';
import LifeMilestonesFormScreen from './screens/LifeMilestonesFormScreen';
import TradingCardFormScreen from './screens/TradingCardFormScreen';
import WeddingAnnouncementFormScreen from './screens/WeddingAnnouncementFormScreen';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/stripe';
import { CartProvider } from './src/context/CartContext';
import { FormProvider } from './src/context/FormContext';
import { HospitalProvider } from './src/context/HospitalContext';
import AboutUsScreen from './src/screens/AboutUsScreen';
import AllThingsBabyScreen from './src/screens/AllThingsBabyScreen';
import AstrocartographyScreen from './src/screens/AstrocartographyScreen';
import AstrologyEducationScreen from './src/screens/AstrologyEducationScreen';
import BaseballCardPreviewScreen from './src/screens/BaseballCardPreviewScreen';
import BiblicalWheelsScreen from './src/screens/BiblicalWheelsScreen';
import BirthMoonPhaseScreen from './src/screens/BirthMoonPhaseScreen';
import BirthSunPositionScreen from './src/screens/BirthSunPositionScreen';
import BirthstoneScreen from './src/screens/BirthstoneScreen';
import ChakraScreen from './src/screens/ChakraScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import ChineseZodiacScreen from './src/screens/ChineseZodiacScreen';
import DaysAliveScreen from './src/screens/DaysAliveScreen';
import DeathAnnouncementFormScreen from './src/screens/DeathAnnouncementFormScreen';
import ElementScreen from './src/screens/ElementScreen';
import EventRSVPDashboardScreen from './src/screens/EventRSVPDashboardScreen';
import EventRSVPScreen from './src/screens/EventRSVPScreen';
import FamousBirthdaysScreen from './src/screens/FamousBirthdaysScreen';
import FormScreen from './src/screens/FormScreen';
import FriendCompatibilityScreen from './src/screens/FriendCompatibilityScreen';
import FullAstrologyScreen from './src/screens/FullAstrologyScreen';
import FuneralHomePortalScreen from './src/screens/FuneralHomePortalScreen';
import GalaxyWheelScreen from './src/screens/GalaxyWheelScreen';
import GenerationsScreen from './src/screens/GenerationsScreen';
import GiftSuggestionsScreen from './src/screens/GiftSuggestionsScreen';
import GrowthTrackerScreen from './src/screens/GrowthTrackerScreen';
import HoroscopeScreen from './src/screens/HoroscopeScreen';
import JumpstartAmericanDreamScreen from './src/screens/JumpstartAmericanDreamScreen';
import JustForFunScreen from './src/screens/JustForFunScreen';
import LandingScreen from './src/screens/LandingScreen';
import LearningScreen from './src/screens/LearningScreen';
import LifeEventsTimingScreen from './src/screens/LifeEventsTimingScreen';
import LifePathNumberScreen from './src/screens/LifePathNumberScreen';
import LuckyNumbersScreen from './src/screens/LuckyNumbersScreen';
import LullabyPlayerScreen from './src/screens/LullabyPlayerScreen';
import MemorialBackScreen from './src/screens/MemorialBackScreen';
import MemorialPreviewScreen from './src/screens/MemorialPreviewScreen';
import MilestoneTrackerScreen from './src/screens/MilestoneTrackerScreen';
import NatalChartWithReadingScreen from './src/screens/NatalChartWithReadingScreen';
import ObituaryFormScreen from './src/screens/ObituaryFormScreen';
import OnThisDayScreen from './src/screens/OnThisDayScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import PhonicsScreen from './src/screens/PhonicsScreen';
import PostcardPreviewScreen from './src/screens/PostcardPreviewScreen';
import PragueClockScreen from './src/screens/PragueClockScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import RabbitHoleScreen from './src/screens/RabbitHoleScreen';
import RetrogradeTrackerScreen from './src/screens/RetrogradeTrackerScreen';
import RomanNumeralsScreen from './src/screens/RomanNumeralsScreen';
import SampleGallery from './src/screens/SampleGallery';
import SendAsGiftScreen from './src/screens/SendAsGiftScreen';
import SkyWheelsScreen from './src/screens/SkyWheelsScreen';
import SolarSystemTimeCapsuleScreen from './src/screens/SolarSystemTimeCapsuleScreen';
import SourcesScreen from './src/screens/SourcesScreen';
import SpiritAnimalScreen from './src/screens/SpiritAnimalScreen';
import StoryReaderScreen from './src/screens/StoryReaderScreen';
import SurnameSearchScreen from './src/screens/SurnameSearchScreen';
import TarotBirthCardScreen from './src/screens/TarotBirthCardScreen';
import ThenAndNowScreen from './src/screens/ThenAndNowScreen';
import TipOfTheDayScreen from './src/screens/TipOfTheDayScreen';
import WeddingDatePlannerScreen from './src/screens/WeddingDatePlannerScreen';
import WeddingRSVPDashboardScreen from './src/screens/WeddingRSVPDashboardScreen';
import WeddingRSVPScreen from './src/screens/WeddingRSVPScreen';
import WrittenInTheStarsScreen from './src/screens/WrittenInTheStarsScreen';
import YardSignPreviewScreen from './src/screens/YardSignPreviewScreen';
import ZodiacCompatibilityScreen from './src/screens/ZodiacCompatibilityScreen';
import ZodiacSignScreen from './src/screens/ZodiacSignScreen';
import type { RootStackParamList } from './src/types';

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

const Stack = createNativeStackNavigator<RootStackParamList>();

// Temporary error catcher — shows real error on screen
class DebugErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: '' };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.toString() + '\n\n' + (error.stack || '') };
    }
    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, backgroundColor: '#1a0000', padding: 40, paddingTop: 80 }}>
                    <Text style={{ color: '#ff4444', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>
                        CRASH LOG — Copy this:
                    </Text>
                    <ScrollView>
                        <Text selectable style={{ color: '#ffcccc', fontSize: 13, fontFamily: 'monospace' }}>
                            {this.state.error}
                        </Text>
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

    useEffect(() => {
        // Show splash screen for 2 seconds
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 2000);

        // Check if intro was dismissed
        AsyncStorage.getItem('ppo_intro_dismissed').then(val => {
            setShowIntro(val !== 'true');
        });

        return () => clearTimeout(timer);
    }, []);

    // Navigate to Horoscope when user taps the daily reminder notification
    useEffect(() => {
        if (isExpoGo) return;
        const sub = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.screen === 'Horoscope' && data?.birthDate && navigationRef.current) {
                navigationRef.current.navigate('Horoscope' as any, {
                    birthDate: data.birthDate,
                    birthTime: data.birthTime,
                    birthLocation: data.birthLocation,
                });
            }
        });
        return () => sub.remove();
    }, []);

    if (!isReady || showIntro === null) {
        return <SplashScreen />;
    }

    if (showIntro) {
        return <IntroVideoScreen onFinish={() => setShowIntro(false)} />;
    }

    return (
        <DebugErrorBoundary>
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
                <CartProvider>
                    <FormProvider>
                        <HospitalProvider>
                            <NavigationContainer ref={navigationRef}>
                                <Stack.Navigator
                                    initialRouteName="Landing"
                                    screenOptions={({ navigation }) => ({
                                        headerShown: true,
                                        headerTitle: '',
                                        headerBackTitle: 'BACK TO HOME SCREEN',
                                        headerLeft: () => (
                                            <TouchableOpacity
                                                onPress={() => navigation.goBack()}
                                                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -4 }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 22, marginRight: 4 }}>‹</Text>
                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>BACK TO HOME SCREEN</Text>
                                            </TouchableOpacity>
                                        ),
                                    })}
                                >
                                    <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="MilestoneTracker"
                                        component={MilestoneTrackerScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="GrowthTracker"
                                        component={GrowthTrackerScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="LearningCenter"
                                        component={LearningScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0e27' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Lullabies"
                                        component={LullabyPlayerScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0e27' },
                                            headerTintColor: '#fff',
                                            title: 'Lullabies',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="PhonicsChallenge"
                                        component={PhonicsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Phonics Challenge',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BedtimeStories"
                                        component={StoryReaderScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Bedtime Stories',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="AllThingsBaby"
                                        component={AllThingsBabyScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0e27' },
                                            headerTintColor: '#fff',
                                            title: 'All Things Baby',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="JumpstartAmericanDream"
                                        component={JumpstartAmericanDreamScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#001f3f' },
                                            headerTintColor: '#fff',
                                            title: 'American Dream',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FamilyTreeIntro"
                                        component={FamilyTreeIntroScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            title: 'Family Tree',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FamilyTreeForm"
                                        component={FamilyTreeFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            title: 'Build Your Family Tree',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="HospitalLogin"
                                        component={HospitalLoginScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Form"
                                        component={FormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ObituaryForm"
                                        component={ObituaryFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="DeathAnnouncementForm"
                                        component={DeathAnnouncementFormScreen}
                                        options={{
                                            title: 'Death Announcement',
                                            headerStyle: { backgroundColor: '#0a0a0a' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="MemorialPreview"
                                        component={MemorialPreviewScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0a0a' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="MemorialBack"
                                        component={MemorialBackScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0a0a' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="LifeMilestones"
                                        component={LifeMilestonesFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BirthdayForm"
                                        component={BirthdayFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="GraduationForm"
                                        component={GraduationFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="AnniversaryForm"
                                        component={AnniversaryFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="WeddingForm"
                                        component={WeddingAnnouncementFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BusinessAnniversaryForm"
                                        component={BusinessAnniversaryFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="TradingCardForm"
                                        component={TradingCardFormScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="ChartReading"
                                        component={NatalChartWithReadingScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen name="PrintService" component={PrintServiceScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="SendAsGift" component={SendAsGiftScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="SampleGallery" component={SampleGallery} options={{ headerShown: false }} />
                                    <Stack.Screen name="YardSignPreview" component={YardSignPreviewScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="PostcardPreview" component={PostcardPreviewScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="BaseballCardPreview" component={BaseballCardPreviewScreen} options={{ headerShown: false }} />
                                    <Stack.Screen
                                        name="Checkout"
                                        component={CheckoutScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="OrderConfirmation"
                                        component={OrderConfirmationScreen}
                                        options={{
                                            headerTitle: 'Order Complete',
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            headerTitleStyle: { fontWeight: 'bold' },
                                            headerBackVisible: false,
                                            headerLeft: () => null,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="WrittenInTheStars"
                                        component={WrittenInTheStarsScreen}
                                        options={{
                                            headerTitle: '',
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="JustForFun"
                                        component={JustForFunScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#4a148c' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Generations"
                                        component={GenerationsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#4a5568' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="DaysAlive"
                                        component={DaysAliveScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            title: 'Days Alive',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="LifePathNumber"
                                        component={LifePathNumberScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#4a148c' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="LuckyNumbers"
                                        component={LuckyNumbersScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a5f2a' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="RomanNumerals"
                                        component={RomanNumeralsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#5d4037' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Birthstone"
                                        component={BirthstoneScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#7B2D26' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ZodiacSign"
                                        component={ZodiacSignScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1565c0' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="OnThisDay"
                                        component={OnThisDayScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a237e' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FamousBirthdays"
                                        component={FamousBirthdaysScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#ad1457' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ThenAndNow"
                                        component={ThenAndNowScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a5f2a' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="SurnameSearch"
                                        component={SurnameSearchScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#5d4037' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FullAstrology"
                                        component={FullAstrologyScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a237e' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Horoscope"
                                        component={HoroscopeScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#311b92' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="TipOfTheDay"
                                        component={TipOfTheDayScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#4a148c' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="AboutUs"
                                        component={AboutUsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Sources"
                                        component={SourcesScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FuneralHomePortal"
                                        component={FuneralHomePortalScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a1a2e' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="GiftSuggestions"
                                        component={GiftSuggestionsScreen}
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="RabbitHole"
                                        component={RabbitHoleScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#302b63' },
                                            headerTintColor: '#fff',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ChineseZodiac"
                                        component={ChineseZodiacScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Chinese Zodiac',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ZodiacCompatibility"
                                        component={ZodiacCompatibilityScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Zodiac Compatibility',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="FriendCompatibility"
                                        component={FriendCompatibilityScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a0033' },
                                            headerTintColor: '#fff',
                                            title: 'Friend Compatibility',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BirthMoonPhase"
                                        component={BirthMoonPhaseScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Birth Moon Phase',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BirthSunPosition"
                                        component={BirthSunPositionScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a0a00' },
                                            headerTintColor: '#fff',
                                            title: 'Birth Sun Position',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="SpiritAnimal"
                                        component={SpiritAnimalScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Spirit Animal',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="AstrologyEducation"
                                        component={AstrologyEducationScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0d0d2b' },
                                            headerTintColor: '#fff',
                                            title: 'Understanding Astrology',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Chakra"
                                        component={ChakraScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Chakra Profile',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Element"
                                        component={ElementScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Your Element',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="TarotBirthCard"
                                        component={TarotBirthCardScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Tarot Birth Card',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="RetrogradeTracker"
                                        component={RetrogradeTrackerScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Retrograde Tracker',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="SkyWheels"
                                        component={SkyWheelsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Sky Wheels',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="GalaxyWheel"
                                        component={GalaxyWheelScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#020010' },
                                            headerTintColor: '#fff',
                                            title: 'Milky Way Galaxy',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="SolarSystemTimeCapsule"
                                        component={SolarSystemTimeCapsuleScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0d0d2b' },
                                            headerTintColor: '#fff',
                                            title: 'Solar System Time Capsule',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BiblicalWheels"
                                        component={BiblicalWheelsScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a0a2e' },
                                            headerTintColor: '#fff',
                                            title: 'Biblical Wheels',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="PragueClock"
                                        component={PragueClockScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#1a0f0a' },
                                            headerTintColor: '#fff',
                                            title: 'Prague Orloj',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="Astrocartography"
                                        component={AstrocartographyScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#0a0a2e' },
                                            headerTintColor: '#fff',
                                            title: 'Astrocartography',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="WeddingDatePlanner"
                                        component={WeddingDatePlannerScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Wedding Date Planner',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="LifeEventsTiming"
                                        component={LifeEventsTimingScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000060' },
                                            headerTintColor: '#fff',
                                            title: 'Life Events Timing',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="WeddingRSVP"
                                        component={WeddingRSVPScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            title: 'Wedding RSVP',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="WeddingRSVPDashboard"
                                        component={WeddingRSVPDashboardScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#000080' },
                                            headerTintColor: '#fff',
                                            title: 'RSVP Dashboard',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="EventRSVP"
                                        component={EventRSVPScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#7c3aed' },
                                            headerTintColor: '#fff',
                                            title: 'RSVP',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="EventRSVPDashboard"
                                        component={EventRSVPDashboardScreen}
                                        options={{
                                            headerStyle: { backgroundColor: '#7c3aed' },
                                            headerTintColor: '#fff',
                                            title: 'RSVP Dashboard',
                                        }}
                                    />
                                </Stack.Navigator>
                            </NavigationContainer>
                        </HospitalProvider>
                    </FormProvider>
                </CartProvider>
            </StripeProvider>
        </DebugErrorBoundary>
    );
}
