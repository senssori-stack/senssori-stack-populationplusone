// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FormScreen from './src/screens/FormScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import LandingScreen from './src/screens/LandingScreen';
import SampleGalleryScreen from './src/screens/SampleGalleryScreen';
import DisplayIdeasScreen from './src/screens/DisplayIdeasScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import FramingIdeasScreen from './src/screens/FramingIdeasScreen';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="SampleGallery" component={SampleGalleryScreen} />
        <Stack.Screen name="DisplayIdeas" component={DisplayIdeasScreen} />
        <Stack.Screen name="PrintService" component={PrintServiceScreen} />
        <Stack.Screen name="FramingIdeas" component={FramingIdeasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
