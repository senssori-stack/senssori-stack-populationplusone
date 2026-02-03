import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './src/screens/LandingScreen';
import FormScreen from './src/screens/FormScreen';
import LifeMilestonesFormScreen from './screens/LifeMilestonesFormScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import NatalChartWithReadingScreen from './src/screens/NatalChartWithReadingScreen';
import PrintServiceScreen from './src/screens/PrintServiceScreen';
import SampleGallery from './src/screens/SampleGallery';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
