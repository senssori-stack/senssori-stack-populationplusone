import React from 'react';
import { View, Text } from 'react-native';

export default function TestApp() {
    return (
        <View style={{ flex: 1, backgroundColor: '#2d5016', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>+1</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 20 }}>
                Population +1
            </Text>
            <Text style={{ fontSize: 16, color: '#fff', marginTop: 16 }}>
                ✅ App is loading!
            </Text>
        </View>
    );
}
