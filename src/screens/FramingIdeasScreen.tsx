import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FramingIdeas'>;

const { width } = Dimensions.get('window');

export default function FramingIdeasScreen({ navigation }: Props) {
  const framingIdeas = [
    {
      id: 1,
      title: 'Classic Matted Frame',
      description: 'Traditional white or cream mat with elegant wooden frame',
      tips: ['Use museum-quality matting', 'Choose frame width proportional to print size', 'Consider UV-protective glass'],
      image: null, // Placeholder for future image
    },
    {
      id: 2,
      title: 'Modern Floating Frame',
      description: 'Contemporary acrylic or metal floating frame for clean look',
      tips: ['No matting needed', 'Great for modern nursery decor', 'Creates depth and dimension'],
      image: null,
    },
    {
      id: 3,
      title: 'Shadow Box Display',
      description: 'Deep frame perfect for adding keepsakes alongside the announcement',
      tips: ['Include hospital bracelet', 'Add first photos', 'Perfect for 3D mementos'],
      image: null,
    },
    {
      id: 4,
      title: 'Gallery Wall Collection',
      description: 'Multiple frames in coordinating styles for impact wall',
      tips: ['Mix sizes and orientations', 'Keep consistent color palette', 'Plan layout before hanging'],
      image: null,
    },
    {
      id: 5,
      title: 'Vintage Ornate Frame',
      description: 'Decorative vintage or ornate frame for classic elegance',
      tips: ['Perfect for formal living spaces', 'Choose antique gold or silver', 'Great for heirloom piece'],
      image: null,
    },
    {
      id: 6,
      title: 'DIY Creative Frames',
      description: 'Handmade or customized frames for personal touch',
      tips: ['Use scrapbook materials', 'Add baby-themed decorations', 'Include birth date in frame design'],
      image: null,
    },
  ];

  const placementIdeas = [
    {
      room: 'Nursery',
      suggestions: [
        'Above the crib (ensure secure mounting)',
        'On dresser or changing table',
        'Part of gallery wall with other baby art',
      ],
    },
    {
      room: 'Living Room',
      suggestions: [
        'Mantel display with family photos',
        'Console table arrangement',
        'Built-in bookshelf showcase',
      ],
    },
    {
      room: 'Hallway',
      suggestions: [
        'Timeline wall with family milestones',
        'Entrance way welcome display',
        'Stairway gallery collection',
      ],
    },
    {
      room: 'Bedroom',
      suggestions: [
        'Nightstand display for parents',
        'Dresser top arrangement',
        'Wall above bed headboard',
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Framing & Display Ideas</Text>
        <Text style={styles.headerSubtitle}>
          Make your birth announcement a beautiful part of your home
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frame Styles</Text>
          <Text style={styles.sectionDescription}>
            Choose the perfect frame to complement your home decor and showcase your precious announcement.
          </Text>

          {framingIdeas.map((idea) => (
            <View key={idea.id} style={styles.ideaCard}>
              <View style={styles.ideaHeader}>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
              </View>
              <Text style={styles.ideaDescription}>{idea.description}</Text>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Pro Tips:</Text>
                {idea.tips.map((tip, index) => (
                  <Text key={index} style={styles.tip}>• {tip}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Placement Ideas</Text>
          <Text style={styles.sectionDescription}>
            Discover perfect spots in your home to display your framed birth announcement.
          </Text>

          {placementIdeas.map((room, index) => (
            <View key={index} style={styles.roomCard}>
              <Text style={styles.roomTitle}>{room.room}</Text>
              {room.suggestions.map((suggestion, idx) => (
                <Text key={idx} style={styles.suggestion}>• {suggestion}</Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size & Proportion Guide</Text>
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>8.5" x 11" Portrait (Standard)</Text>
            <Text style={styles.guideText}>• Frame size: 11" x 14" with mat, or 8.5" x 11" without mat</Text>
            <Text style={styles.guideText}>• Perfect for standard wall spaces</Text>
            <Text style={styles.guideText}>• Great for tabletop display</Text>
          </View>
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>11" x 8.5" Landscape</Text>
            <Text style={styles.guideText}>• Frame size: 14" x 11" with mat, or 11" x 8.5" without mat</Text>
            <Text style={styles.guideText}>• Ideal for wide wall spaces</Text>
            <Text style={styles.guideText}>• Perfect for shelf or mantel display</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PrintService', {})}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Order Professional Printing</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Form')}
        >
          <Text style={styles.secondaryButtonText}>Create Your Announcement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 20,
    lineHeight: 24,
  },
  ideaCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ideaHeader: {
    marginBottom: 10,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  ideaDescription: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 15,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#f1f3f4',
    padding: 15,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 4,
    lineHeight: 18,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  suggestion: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 6,
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  guideText: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButton: {
    marginVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});