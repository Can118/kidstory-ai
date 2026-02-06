import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useStoryContext } from '../context/StoryContext';

export default function StoryDetailScreen({ route, navigation }) {
  const { storyId } = route.params;
  const { stories } = useStoryContext();
  const story = stories.find((s) => s.id === storyId);

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

  return (
    <View style={styles.container}>
      {/* Floating back button — dark circle, works over any illustration */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonInner}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Illustration + gradient fade ── */}
        <View style={styles.illustrationWrapper}>
          {story.illustrationUrl ? (
            <>
              <Image source={{ uri: story.illustrationUrl }} style={styles.illustration} />
              <LinearGradient
                colors={['transparent', colors.pageBg]}
                style={styles.fadeOverlay}
              />
            </>
          ) : (
            <LinearGradient
              colors={['#1E1145', '#6D28D9', colors.pageBg]}
              style={styles.illustration}
            >
              <View style={styles.placeholderCenter}>
                <Text style={styles.placeholderIcon}>🌟</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* ── Story "page" — warm cream book-page feel ── */}
        <View style={styles.storyPage}>
          <Text style={styles.storyTitle}>{story.title}</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.storyBody}>{story.body}</Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {new Date(story.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },

  // ── Back button ─────────────────────────────────────
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: 'rgba(18,8,41,0.58)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  // ── Scroll ──────────────────────────────────────────
  scroll: { flex: 1 },

  // ── Illustration ────────────────────────────────────
  illustrationWrapper: {
    position: 'relative',
    width: '100%',
  },
  illustration: {
    width: '100%',
    height: 340,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  placeholderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 80 },

  // ── Story page (book-page feel) ─────────────────────
  storyPage: {
    backgroundColor: colors.pageBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  storyTitle: {
    fontSize: 26,
    fontFamily: 'Rounded-Black',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },

  // ── Decorative divider — two short lines with a dot ─
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    width: 28,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.primary,
    opacity: 0.45,
  },
  dividerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    opacity: 0.6,
    marginHorizontal: 8,
  },

  storyBody: {
    fontSize: 17,
    fontFamily: 'Rounded-Medium',
    lineHeight: 28,
    color: colors.text,
  },
  footer: {
    marginTop: 36,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Rounded-Regular',
    color: colors.textLight,
    textAlign: 'center',
  },

  // ── Error fallback ────────────────────────────────────
  errorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Rounded-Bold',
    color: colors.text,
  },
  errorBack: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: colors.primary,
    marginTop: 12,
  },
});
