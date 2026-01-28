// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, MonteCarlo_400Regular } from '@expo-google-fonts/montecarlo';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './src/components/ErrorBoundary';
import WelcomeScreen from './src/screens/WelcomeScreen';
import IntroScreen from './src/screens/IntroScreen';
import FormScreen from './src/screens/FormScreen';
import LifeMilestonesFormScreen from './src/screens/LifeMilestonesFormScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import LandingScreen from './src/screens/LandingScreen';
import SampleGalleryScreen from './src/screens/SampleGalleryScreen';
import DisplayIdeasScreen from './src/screens/DisplayIdeasScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import FramingIdeasScreen from './src/screens/FramingIdeasScreen';
import GiftShopScreen from './src/screens/GiftShopScreen';
import SendGiftCardScreen from './src/screens/SendGiftCardScreen';
import DataSourcesScreen from './src/screens/DataSourcesScreen';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  const [fontsLoaded] = useFonts({
    MonteCarlo_400Regular,
  });

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    // Hide splash screen when fonts are loaded and first launch check is done
    if (fontsLoaded && isFirstLaunch !== null) {
      console.log('[App] Fonts loaded successfully! MonteCarlo_400Regular is ready');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isFirstLaunch]);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      setIsFirstLaunch(hasSeenWelcome === null);
    } catch (error) {
      setIsFirstLaunch(false);
    }
  };

  // Show nothing while loading
  if (!fontsLoaded || isFirstLaunch === null) {
    return null;
  }

  return (
    <ErrorBoundary>
    <NavigationContainer>
            <Stack.Navigator initialRouteName={isFirstLaunch ? "Welcome" : "Intro"}>
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Intro" 
          component={IntroScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="LifeMilestones" component={LifeMilestonesFormScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="SampleGallery" component={SampleGalleryScreen} />
        <Stack.Screen name="DisplayIdeas" component={DisplayIdeasScreen} />
        <Stack.Screen name="PrintService" component={PrintServiceScreen} />
        <Stack.Screen name="FramingIdeas" component={FramingIdeasScreen} />
        <Stack.Screen name="GiftShop" component={GiftShopScreen} />
        <Stack.Screen name="SendGiftCard" component={SendGiftCardScreen} />
        <Stack.Screen name="DataSources" component={DataSourcesScreen} options={{ title: 'About Our Data' }} />
      </Stack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
}
