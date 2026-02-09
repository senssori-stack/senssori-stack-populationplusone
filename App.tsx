import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import AnniversaryFormScreen from './screens/AnniversaryFormScreen';
import BirthdayFormScreen from './screens/BirthdayFormScreen';
import GraduationFormScreen from './screens/GraduationFormScreen';
import HospitalLoginScreen from './screens/HospitalLoginScreen';
import LifeMilestonesFormScreen from './screens/LifeMilestonesFormScreen';
import { HospitalProvider } from './src/context/HospitalContext';
import AboutUsScreen from './src/screens/AboutUsScreen';
import BabyRegistryPortalScreen from './src/screens/BabyRegistryPortalScreen';
import BirthstoneScreen from './src/screens/BirthstoneScreen';
import FamousBirthdaysScreen from './src/screens/FamousBirthdaysScreen';
import FormScreen from './src/screens/FormScreen';
import FullAstrologyScreen from './src/screens/FullAstrologyScreen';
import FuneralHomePortalScreen from './src/screens/FuneralHomePortalScreen';
import GenerationsScreen from './src/screens/GenerationsScreen';
import HoroscopeScreen from './src/screens/HoroscopeScreen';
import JustForFunScreen from './src/screens/JustForFunScreen';
import LandingScreen from './src/screens/LandingScreen';
import LifePathNumberScreen from './src/screens/LifePathNumberScreen';
import LuckyNumbersScreen from './src/screens/LuckyNumbersScreen';
import MemorialBackScreen from './src/screens/MemorialBackScreen';
import MemorialPreviewScreen from './src/screens/MemorialPreviewScreen';
import NatalChartWithReadingScreen from './src/screens/NatalChartWithReadingScreen';
import ObituaryFormScreen from './src/screens/ObituaryFormScreen';
import OnThisDayScreen from './src/screens/OnThisDayScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import RabbitHoleScreen from './src/screens/RabbitHoleScreen';
import RomanNumeralsScreen from './src/screens/RomanNumeralsScreen';
import SampleGallery from './src/screens/SampleGallery';
import SourcesScreen from './src/screens/SourcesScreen';
import SurnameSearchScreen from './src/screens/SurnameSearchScreen';
import ThenAndNowScreen from './src/screens/ThenAndNowScreen';
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
        <HospitalProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Landing"
                    screenOptions={{ headerShown: true }}
                >
                    <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="HospitalLogin"
                        component={HospitalLoginScreen}
                        options={{
                            headerTitle: 'Hospital Partner',
                            headerStyle: { backgroundColor: '#1a472a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="Form"
                        component={FormScreen}
                        options={{
                            headerTitle: 'New Baby Announcement',
                            headerStyle: { backgroundColor: '#2d5016' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="ObituaryForm"
                        component={ObituaryFormScreen}
                        options={{
                            headerTitle: 'Memorial Information',
                            headerStyle: { backgroundColor: '#1a1a2e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="MemorialPreview"
                        component={MemorialPreviewScreen}
                        options={{
                            headerTitle: 'Memorial Announcement',
                            headerStyle: { backgroundColor: '#0a0a0a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="MemorialBack"
                        component={MemorialBackScreen}
                        options={{
                            headerTitle: 'Service Arrangements',
                            headerStyle: { backgroundColor: '#0a0a0a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="LifeMilestones"
                        component={LifeMilestonesFormScreen}
                        options={{
                            headerTitle: 'LifeMilestones',
                            headerStyle: { backgroundColor: '#2d5016' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="BirthdayForm"
                        component={BirthdayFormScreen}
                        options={{
                            headerTitle: 'Birthday Announcement',
                            headerStyle: { backgroundColor: '#1a472a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="GraduationForm"
                        component={GraduationFormScreen}
                        options={{
                            headerTitle: 'Graduation Announcement',
                            headerStyle: { backgroundColor: '#1a3a5c' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="AnniversaryForm"
                        component={AnniversaryFormScreen}
                        options={{
                            headerTitle: 'Anniversary Announcement',
                            headerStyle: { backgroundColor: '#5c3a1a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="ChartReading"
                        component={NatalChartWithReadingScreen}
                        options={{
                            headerTitle: 'Natal Chart & Reading',
                            headerStyle: { backgroundColor: '#2d5016' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen name="PrintService" component={PrintServiceScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SampleGallery" component={SampleGallery} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="JustForFun"
                        component={JustForFunScreen}
                        options={{
                            headerTitle: 'Just For Fun',
                            headerStyle: { backgroundColor: '#4a148c' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="Generations"
                        component={GenerationsScreen}
                        options={{
                            headerTitle: 'The Living Generations',
                            headerStyle: { backgroundColor: '#4a5568' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="LifePathNumber"
                        component={LifePathNumberScreen}
                        options={{
                            headerTitle: 'Life Path Number',
                            headerStyle: { backgroundColor: '#4a148c' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="LuckyNumbers"
                        component={LuckyNumbersScreen}
                        options={{
                            headerTitle: 'Lucky Numbers',
                            headerStyle: { backgroundColor: '#1a5f2a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="RomanNumerals"
                        component={RomanNumeralsScreen}
                        options={{
                            headerTitle: 'Roman Numerals',
                            headerStyle: { backgroundColor: '#5d4037' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="Birthstone"
                        component={BirthstoneScreen}
                        options={{
                            headerTitle: 'Your Birthstone',
                            headerStyle: { backgroundColor: '#7B2D26' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="ZodiacSign"
                        component={ZodiacSignScreen}
                        options={{
                            headerTitle: 'Your Zodiac Sign',
                            headerStyle: { backgroundColor: '#1565c0' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="OnThisDay"
                        component={OnThisDayScreen}
                        options={{
                            headerTitle: 'On This Day',
                            headerStyle: { backgroundColor: '#1a237e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="FamousBirthdays"
                        component={FamousBirthdaysScreen}
                        options={{
                            headerTitle: 'Famous Birthday Twins',
                            headerStyle: { backgroundColor: '#ad1457' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="ThenAndNow"
                        component={ThenAndNowScreen}
                        options={{
                            headerTitle: 'Then & Now',
                            headerStyle: { backgroundColor: '#1a5f2a' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="SurnameSearch"
                        component={SurnameSearchScreen}
                        options={{
                            headerTitle: 'Surname Search',
                            headerStyle: { backgroundColor: '#5d4037' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="FullAstrology"
                        component={FullAstrologyScreen}
                        options={{
                            headerTitle: 'Your Natal Chart',
                            headerStyle: { backgroundColor: '#1a237e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="Horoscope"
                        component={HoroscopeScreen}
                        options={{
                            headerTitle: 'Daily Horoscope',
                            headerStyle: { backgroundColor: '#311b92' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="AboutUs"
                        component={AboutUsScreen}
                        options={{
                            headerTitle: 'About Us',
                            headerStyle: { backgroundColor: '#2d5016' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="Sources"
                        component={SourcesScreen}
                        options={{
                            headerTitle: 'Data Sources',
                            headerStyle: { backgroundColor: '#2d5016' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="FuneralHomePortal"
                        component={FuneralHomePortalScreen}
                        options={{
                            headerTitle: 'Funeral Directors Portal',
                            headerStyle: { backgroundColor: '#1a1a2e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="BabyRegistryPortal"
                        component={BabyRegistryPortalScreen}
                        options={{
                            headerTitle: 'Baby Registry Portal',
                            headerStyle: { backgroundColor: '#ff9a9e' },
                            headerTintColor: '#333',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                    <Stack.Screen
                        name="RabbitHole"
                        component={RabbitHoleScreen}
                        options={{
                            headerTitle: '🐰 Rabbit Hole',
                            headerStyle: { backgroundColor: '#302b63' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' }
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </HospitalProvider>
    );
}
