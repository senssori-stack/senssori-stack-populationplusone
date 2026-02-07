import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LifeMilestonesFormScreen from './screens/LifeMilestonesFormScreen';
import AboutUsScreen from './src/screens/AboutUsScreen';
import BirthstoneScreen from './src/screens/BirthstoneScreen';
import FamousBirthdaysScreen from './src/screens/FamousBirthdaysScreen';
import FormScreen from './src/screens/FormScreen';
import FullAstrologyScreen from './src/screens/FullAstrologyScreen';
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
import RomanNumeralsScreen from './src/screens/RomanNumeralsScreen';
import SampleGallery from './src/screens/SampleGallery';
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
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Landing"
                screenOptions={{ headerShown: true }}
            >
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
