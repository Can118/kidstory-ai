import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useStoryContext } from '../context/StoryContext';

export default function StoryDetailScreen({ route, navigation }) {
  const { storyId } = route.params;
  const { stories } = useStoryContext();
  const story = stories.find((s) => s.id === storyId);
  const [currentPage, setCurrentPage] = useState(0);

  if (!story) {
    return (
      <View style={[styles.container, styles.errorWrapper]}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.errorBack}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Support both old stories (with body) and new stories (with pages array)
  const pages = story.pages || [story.body];
  const totalPages = pages.length;
  const currentPageText = pages[currentPage] || '';

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `Check out "${story.title}" - my personalized story where I'm the hero! ✨\n\nhttps://apps.apple.com/app/kidstory-ai/id123456789`;

      await Share.share({
        message: shareMessage,
        title: story.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonInner}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Floating share button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <View style={styles.shareButtonInner}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Image Section - takes up ~50% of screen */}
      <View style={styles.imageSection}>
        {story.illustrationUrl ? (
          <Image source={{ uri: story.illustrationUrl }} style={styles.illustration} />
        ) : (
          <LinearGradient
            colors={['#1E1145', '#6D28D9', '#8B5CF6']}
            style={styles.illustration}
          >
            <View style={styles.placeholderCenter}>
              <Text style={styles.placeholderIcon}>🌟</Text>
            </View>
          </LinearGradient>
        )}
      </View>

      {/* Progress Indicator - minimalist page dots */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentPage && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Story Content Section - scrollable */}
      <ScrollView
        style={styles.storyScrollView}
        contentContainerStyle={styles.storyContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Title shown only on first page */}
        {currentPage === 0 && (
          <Text style={styles.storyTitle}>{story.title}</Text>
        )}

        {/* Story text - larger font size */}
        <Text style={styles.storyBody}>{currentPageText}</Text>
      </ScrollView>

      {/* Sleek navigation buttons at bottom */}
      <View style={styles.navigationControls} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.navButtonWrapper, currentPage === 0 && styles.navButtonDisabled]}
          onPress={handlePrevPage}
          disabled={currentPage === 0}
          activeOpacity={0.7}
        >
          <View style={[styles.navButton, currentPage === 0 && styles.navButtonInactive]}>
            <Ionicons
              name="chevron-back"
              size={28}
              color={currentPage === 0 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButtonWrapper, currentPage === totalPages - 1 && styles.navButtonDisabled]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages - 1}
          activeOpacity={0.7}
        >
          <View style={[styles.navButton, currentPage === totalPages - 1 && styles.navButtonInactive]}>
            <Ionicons
              name="chevron-forward"
              size={28}
              color={currentPage === totalPages - 1 ? 'rgba(255,255,255,0.4)' : '#FFFFFF'}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f3d', // Deep purple background
  },

  // ── Floating buttons (over image) ─────────────────────
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: 'rgba(26,15,61,0.75)',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  shareButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  shareButtonInner: {
    backgroundColor: 'rgba(26,15,61,0.75)',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // ── Image Section (top ~45% for balanced layout) ──────
  imageSection: {
    height: '45%',
    width: '100%',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  placeholderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 80
  },

  // ── Progress Indicator (minimalist dots) ─────────────
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#1a0f3d',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(139,92,246,0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#8B5CF6',
  },

  // ── Story Content Section (scrollable) ────────────────
  storyScrollView: {
    flex: 1,
    backgroundColor: '#1a0f3d',
  },
  storyContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 140, // Space for nav buttons
  },
  storyTitle: {
    fontSize: 38,
    fontFamily: 'Baloo-ExtraBold',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 46,
    letterSpacing: 0.2,
  },
  storyBody: {
    fontSize: 22,
    fontFamily: 'Baloo-Medium',
    lineHeight: 36,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Sleek Navigation Buttons (bottom) ─────────────────
  navigationControls: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    zIndex: 100,
  },
  navButtonWrapper: {
    // No wrapper styles needed now
  },
  navButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  navButtonInactive: {
    backgroundColor: 'rgba(139,92,246,0.25)',
    shadowOpacity: 0.15,
  },
  navButtonDisabled: {
    // No additional styles needed
  },

  // ── Error fallback ────────────────────────────────────
  errorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
  },
  errorBack: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: '#8B5CF6',
    marginTop: 12,
  },
});
