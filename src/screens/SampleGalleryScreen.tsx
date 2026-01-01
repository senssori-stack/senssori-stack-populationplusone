import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SampleGallery'>;

const { width: screenWidth } = Dimensions.get('window');

// Sample data with licensed baby photos from Unsplash
const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 'single-baby-pink',
    title: 'Single Baby - Pink Theme',
    description: 'Beautiful pink theme perfect for baby girls',
    image: 'https://images.unsplash.com/photo-1544968503-f45c2175e1e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    babyName: 'Emma Rose Williams',
    birthDate: 'March 15, 2024',
    city: 'Denver, CO'
  },
  {
    id: 'twins-blue',
    title: 'Twins - Blue Theme',
    description: 'Elegant blue design for twin boys',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    babyName: 'Liam & Noah Johnson',
    birthDate: 'January 22, 2024',
    city: 'Austin, TX'
  },
  {
    id: 'single-baby-green',
    title: 'Single Baby - Green Theme',
    description: 'Fresh green theme for any baby',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    babyName: 'Sophia Grace Davis',
    birthDate: 'December 8, 2023',
    city: 'Portland, OR'
  }
];

export default function SampleGalleryScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sample Gallery</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Explore beautiful birth announcements with historical time capsule data. Each design showcases authentic details from your baby's birth date.
        </Text>

        {SAMPLE_ANNOUNCEMENTS.map((sample) => (
          <View key={sample.id} style={styles.sampleCard}>
            <Image source={{ uri: sample.image }} style={styles.sampleImage} />
            <View style={styles.sampleContent}>
              <Text style={styles.sampleTitle}>{sample.title}</Text>
              <Text style={styles.sampleDescription}>{sample.description}</Text>
              <View style={styles.sampleDetails}>
                <Text style={styles.sampleBaby}>{sample.babyName}</Text>
                <Text style={styles.sampleInfo}>{sample.birthDate} • {sample.city}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Create Your Own?</Text>
          <Text style={styles.ctaText}>
            Start creating your personalized birth announcement with historical time capsule data
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Form')}
          >
            <Text style={styles.ctaButtonText}>Create My Announcement</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3182ce',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sampleCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sampleImage: {
    width: '100%',
    height: 200,
  },
  sampleContent: {
    padding: 20,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  sampleDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  sampleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  sampleBaby: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  sampleInfo: {
    fontSize: 14,
    color: '#4a5568',
  },
  ctaSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomPadding: {
    height: 40,
  },
});