import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import SplashScreen from './components/SplashScreen';
import AnniversaryFormScreen from './screens/AnniversaryFormScreen';
import BirthdayFormScreen from './screens/BirthdayFormScreen';
import GraduationFormScreen from './screens/GraduationFormScreen';
import HospitalLoginScreen from './screens/HospitalLoginScreen';
import LifeMilestonesFormScreen from './screens/LifeMilestonesFormScreen';
import { CartProvider } from './src/context/CartContext';
import { FormProvider } from './src/context/FormContext';
import { HospitalProvider } from './src/context/HospitalContext';
import AboutUsScreen from './src/screens/AboutUsScreen';
import BaseballCardPreviewScreen from './src/screens/BaseballCardPreviewScreen';
import BirthstoneScreen from './src/screens/BirthstoneScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import FamousBirthdaysScreen from './src/screens/FamousBirthdaysScreen';
import FormScreen from './src/screens/FormScreen';
import FullAstrologyScreen from './src/screens/FullAstrologyScreen';
import FuneralHomePortalScreen from './src/screens/FuneralHomePortalScreen';
import GenerationsScreen from './src/screens/GenerationsScreen';
import GiftSuggestionsScreen from './src/screens/GiftSuggestionsScreen';
import GrowthTrackerScreen from './src/screens/GrowthTrackerScreen';
import HoroscopeScreen from './src/screens/HoroscopeScreen';
import JustForFunScreen from './src/screens/JustForFunScreen';
import LandingScreen from './src/screens/LandingScreen';
import LearningScreen from './src/screens/LearningScreen';
import LifePathNumberScreen from './src/screens/LifePathNumberScreen';
import LuckyNumbersScreen from './src/screens/LuckyNumbersScreen';
import MemorialBackScreen from './src/screens/MemorialBackScreen';
import MemorialPreviewScreen from './src/screens/MemorialPreviewScreen';
import MilestoneTrackerScreen from './src/screens/MilestoneTrackerScreen';
import NatalChartWithReadingScreen from './src/screens/NatalChartWithReadingScreen';
import ObituaryFormScreen from './src/screens/ObituaryFormScreen';
import OnThisDayScreen from './src/screens/OnThisDayScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import PostcardPreviewScreen from './src/screens/PostcardPreviewScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import RabbitHoleScreen from './src/screens/RabbitHoleScreen';
import RomanNumeralsScreen from './src/screens/RomanNumeralsScreen';
import SampleGallery from './src/screens/SampleGallery';
import SourcesScreen from './src/screens/SourcesScreen';
import SurnameSearchScreen from './src/screens/SurnameSearchScreen';
import ThenAndNowScreen from './src/screens/ThenAndNowScreen';
import TipOfTheDayScreen from './src/screens/TipOfTheDayScreen';
import YardSignPreviewScreen from './src/screens/YardSignPreviewScreen';
import ZodiacSignScreen from './src/screens/ZodiacSignScreen';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Show splash screen for 2 seconds
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        return <SplashScreen />;
    }

    return (
        <CartProvider>
            <FormProvider>
                <HospitalProvider>
                    <NavigationContainer>
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
                                    headerStyle: { backgroundColor: '#0d1b2a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="GrowthTracker"
                                component={GrowthTrackerScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#0d1b2a' },
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
                                name="HospitalLogin"
                                component={HospitalLoginScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a472a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="Form"
                                component={FormScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a472a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="ObituaryForm"
                                component={ObituaryFormScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a1a2e' },
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
                                    headerStyle: { backgroundColor: '#2d5016' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="BirthdayForm"
                                component={BirthdayFormScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a472a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="GraduationForm"
                                component={GraduationFormScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a3a5c' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="AnniversaryForm"
                                component={AnniversaryFormScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#5c3a1a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen
                                name="ChartReading"
                                component={NatalChartWithReadingScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#2d5016' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen name="PrintService" component={PrintServiceScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="SampleGallery" component={SampleGallery} options={{ headerShown: false }} />
                            <Stack.Screen name="YardSignPreview" component={YardSignPreviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PostcardPreview" component={PostcardPreviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BaseballCardPreview" component={BaseballCardPreviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen
                                name="Checkout"
                                component={CheckoutScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#1a472a' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="OrderConfirmation"
                                component={OrderConfirmationScreen}
                                options={{
                                    headerTitle: 'Order Complete',
                                    headerStyle: { backgroundColor: '#1a472a' },
                                    headerTintColor: '#fff',
                                    headerTitleStyle: { fontWeight: 'bold' },
                                    headerBackVisible: false,
                                    headerLeft: () => null,
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
                                    headerStyle: { backgroundColor: '#2d5016' },
                                    headerTintColor: '#fff',
                                }}
                            />
                            <Stack.Screen
                                name="Sources"
                                component={SourcesScreen}
                                options={{
                                    headerStyle: { backgroundColor: '#2d5016' },
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
                        </Stack.Navigator>
                    </NavigationContainer>
                </HospitalProvider>
            </FormProvider>
        </CartProvider>
    );
}
