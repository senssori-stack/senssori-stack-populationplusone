import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DisplayIdeas'>;

const { width: screenWidth } = Dimensions.get('window');

export default function DisplayIdeasScreen({ navigation }: Props) {
  const displayIdeas = [
    {
      id: 1,
      title: 'Nursery Gallery Wall',
      description: 'Create a beautiful focal point above the crib with multiple announcements and family photos',
      image: 'https://via.placeholder.com/600x400/4facfe/ffffff?text=Nursery+Gallery+Wall',
      tips: [
        'Use matching frames for cohesive look',
        'Include ultrasound photos',
        'Add baby\'s first photo',
        'Consider LED strip lighting'
      ]
    },
    {
      id: 2,
      title: 'Living Room Statement',
      description: 'Make a bold statement in your main living space where guests will see and admire',
      image: 'https://via.placeholder.com/600x400/43e97b/ffffff?text=Living+Room+Display',
      tips: [
        'Choose larger formats (16×20" or 20×24")',
        'Use floating shelves for dimension',
        'Coordinate with existing decor',
        'Add soft lighting for ambiance'
      ]
    },
    {
      id: 3,
      title: 'Hallway Timeline',
      description: 'Create a timeline of milestones along your hallway or staircase',
      image: 'https://via.placeholder.com/600x400/fa709a/ffffff?text=Hallway+Timeline',
      tips: [
        'Use consistent sizing',
        'Space evenly for rhythm',
        'Include milestone markers',
        'Consider growth chart integration'
      ]
    },
    {
      id: 4,
      title: 'Grandparents\' Display',
      description: 'Perfect gift for grandparents to showcase in their home',
      image: 'https://via.placeholder.com/600x400/f093fb/ffffff?text=Grandparents+Display',
      tips: [
        'Choose traditional frames',
        'Include family tree elements',
        'Add personalized message',
        'Consider tabletop easels'
      ]
    },
    {
      id: 5,
      title: 'Office Pride Wall',
      description: 'Show off your growing family in your workspace',
      image: 'https://via.placeholder.com/600x400/667eea/ffffff?text=Office+Display',
      tips: [
        'Use smaller, professional frames',
        'Keep it tasteful and minimal',
        'Consider desk frames too',
        'Update with new milestones'
      ]
    },
    {
      id: 6,
      title: 'Memory Book Integration',
      description: 'Incorporate prints into baby books and family albums',
      image: 'https://via.placeholder.com/600x400/764ba2/ffffff?text=Memory+Books',
      tips: [
        'Print multiple sizes',
        'Use photo-safe materials',
        'Create themed sections',
        'Include handwritten notes'
      ]
    }
  ];

  const hangingTips = [
    {
      icon: '📏',
      title: 'Perfect Height',
      tip: 'Hang artwork 57-60 inches from floor to center of frame'
    },
    {
      icon: '📐',
      title: 'Proper Spacing',
      tip: 'Leave 2-3 inches between multiple frames in a gallery wall'
    },
    {
      icon: '💡',
      title: 'Lighting Matters',
      tip: 'Avoid direct sunlight; use picture lights or ambient lighting'
    },
    {
      icon: '🔧',
      title: 'Secure Mounting',
      tip: 'Use appropriate wall anchors for your wall type and frame weight'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Display Ideas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Beautiful Display Ideas</Text>
        <Text style={styles.pageSubtitle}>
          Get inspired by these creative ways to showcase your birth announcements
        </Text>

        {/* Display Ideas Gallery */}
        <View style={styles.ideasContainer}>
          {displayIdeas.map((idea) => (
            <View key={idea.id} style={styles.ideaCard}>
              <Image
                source={{ uri: idea.image }}
                style={styles.ideaImage}
                resizeMode="cover"
              />
              
              <View style={styles.ideaContent}>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                <Text style={styles.ideaDescription}>{idea.description}</Text>
                
                <Text style={styles.tipsTitle}>Pro Tips:</Text>
                {idea.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Hanging Tips Section */}
        <View style={styles.hangingSection}>
          <Text style={styles.hangingTitle}>Professional Hanging Tips</Text>
          <Text style={styles.hangingSubtitle}>
            Follow these expert tips for perfect presentation
          </Text>
          
          {hangingTips.map((tip, index) => (
            <View key={index} style={styles.hangingTip}>
              <Text style={styles.hangingIcon}>{tip.icon}</Text>
              <View style={styles.hangingContent}>
                <Text style={styles.hangingTipTitle}>{tip.title}</Text>
                <Text style={styles.hangingTipText}>{tip.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tools & Supplies */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsTitle}>🛠️ Recommended Tools & Supplies</Text>
          
          <View style={styles.toolsList}>
            <View style={styles.toolCategory}>
              <Text style={styles.toolCategoryTitle}>For Wall Hanging:</Text>
              <Text style={styles.toolItem}>• Picture hanging strips (Command strips)</Text>
              <Text style={styles.toolItem}>• Wall anchors and screws</Text>
              <Text style={styles.toolItem}>• Level tool</Text>
              <Text style={styles.toolItem}>• Measuring tape</Text>
              <Text style={styles.toolItem}>• Pencil for marking</Text>
            </View>

            <View style={styles.toolCategory}>
              <Text style={styles.toolCategoryTitle}>For Framing:</Text>
              <Text style={styles.toolItem}>• Acid-free matting</Text>
              <Text style={styles.toolItem}>• UV-protective glass</Text>
              <Text style={styles.toolItem}>• Quality frame materials</Text>
              <Text style={styles.toolItem}>• Backing board</Text>
              <Text style={styles.toolItem}>• Corner protectors</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Display Your Announcement?</Text>
          <Text style={styles.ctaSubtitle}>
            Create your beautiful announcement and order professional prints
          </Text>
          
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Form')}
            >
              <Text style={styles.ctaButtonText}>Create Announcement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={() => navigation.navigate('FramingIdeas')}
            >
              <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>
                Framing Ideas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={() => navigation.navigate('PrintService', {})}
            >
              <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>
                Order Prints
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#4a5568',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2d3748',
    textAlign: 'center',
    marginTop: 32,
    marginHorizontal: 20,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    lineHeight: 24,
  },
  ideasContainer: {
    padding: 20,
  },
  ideaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  ideaImage: {
    width: '100%',
    height: 200,
  },
  ideaContent: {
    padding: 20,
  },
  ideaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  ideaDescription: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 16,
    color: '#667eea',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#4a5568',
    flex: 1,
    lineHeight: 20,
  },
  hangingSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hangingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  hangingSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  hangingTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hangingIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  hangingContent: {
    flex: 1,
  },
  hangingTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  hangingTipText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  toolsSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 20,
  },
  toolsList: {
    gap: 20,
  },
  toolCategory: {
    marginBottom: 16,
  },
  toolCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  toolItem: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaButtonTextSecondary: {
    color: '#667eea',
  },
  bottomPadding: {
    height: 40,
  },
});