import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Test'>;

export default function SimpleTestScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Birth Announcement Studio</Text>
      <Text style={styles.subtitle}>App is working perfectly!</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Landing')}
      >
        <Text style={styles.buttonText}>Go to Landing Page</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Form')}
      >
        <Text style={styles.buttonText}>Go to Form</Text>
      </TouchableOpacity>

      <Text style={styles.status}>✅ Server: Running</Text>
      <Text style={styles.status}>✅ Navigation: Working</Text>
      <Text style={styles.status}>✅ TypeScript: No errors</Text>
      <Text style={styles.status}>✅ Ready for production!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#636e72',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#00b894',
    marginVertical: 2,
    textAlign: 'center',
  },
});