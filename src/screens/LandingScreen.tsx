import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LandingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroPreTitle}>Welcome to</Text>
            <Text style={styles.heroTitle}>Birth Announcement Studio</Text>
            <Text style={styles.heroSubtitle}>
              Create stunning birth announcements with historical "time capsule" data
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Form')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Create Your Announcement</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What Makes Us Special</Text>
          
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Historical Time Capsule</Text>
              <Text style={styles.featureText}>
                110+ years of authentic data - prices, world events, and culture from your baby's birth date
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureTitle}>Professional Designs</Text>
              <Text style={styles.featureText}>
                Portrait & landscape formats, multiple themes, print-ready quality
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>👶</Text>
              <Text style={styles.featureTitle}>Twins & Multiples</Text>
              <Text style={styles.featureText}>
                Perfect support for twins, triplets, or more with smart layouts
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🖨️</Text>
              <Text style={styles.featureTitle}>Easy Printing</Text>
              <Text style={styles.featureText}>
                Professional quality prints through FedEx Office integration
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SampleGallery')}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🎨</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>View Sample Gallery</Text>
                <Text style={styles.actionSubtitle}>See beautiful examples</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Form')}
          >
            <LinearGradient
              colors={['#fa709a', '#fee140']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>✨</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Start Creating</Text>
                <Text style={styles.actionSubtitle}>Make your announcement now</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    minHeight: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  heroPreTitle: {
    fontSize: 16,
    color: '#a0a0a0',
    fontWeight: '500',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#c0c0c0',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
    lineHeight: 26,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 32,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#ffffff90',
  },
  actionArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
});