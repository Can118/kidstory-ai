import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';
import { useStoryContext } from '../context/StoryContext';

// ── 4-pointed sparkle star ────────────────────────────
function Sparkle({ style, size = 7, color = '#C4B5FD' }) {
  const arm = Math.max(1.5, size * 0.2);
  return (
    <View style={[styles.sparkleBase, { width: size, height: size }, style]}>
      <View style={{
        position: 'absolute',
        left: (size - arm) / 2,
        top: 0,
        width: arm,
        height: size,
        borderRadius: arm / 2,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute',
        left: 0,
        top: (size - arm) / 2,
        width: size,
        height: arm,
        borderRadius: arm / 2,
        backgroundColor: color,
      }} />
    </View>
  );
}

export default function LibraryScreen({ navigation }) {
  const { stories, loading } = useStoryContext();

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear all data and show the onboarding again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Done!', 'Please close and reopen the app to see onboarding.');
          },
        },
      ]
    );
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={colors.mainBg} style={styles.container}>
        <Text style={styles.pageTitle}>My Stories</Text>
        <Text style={styles.loadingText}>Loading…</Text>
      </LinearGradient>
    );
  }

  // ── Empty state ──────────────────────────────────────
  if (stories.length === 0) {
    return (
      <LinearGradient colors={colors.mainBg} style={styles.container}>
        {/* Reset button (top right) */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding} delayPressIn={70}>
          <Ionicons name="refresh" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>My Stories</Text>
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyCard}>
            {/* sparkles inside empty card */}
            <Sparkle style={{ top: 20,  right: 26 }}  size={9} color="rgba(196,181,253,0.4)" />
            <Sparkle style={{ top: 60,  left: 22 }}   size={5} color="rgba(255,255,255,0.22)" />
            <Sparkle style={{ bottom: 34, left: 42 }} size={7} color="rgba(196,181,253,0.32)" />
            <Sparkle style={{ bottom: 18, right: 58 }} size={4} color="rgba(251,191,36,0.28)" />

            <View style={styles.emptyIconCircle}>
              <Ionicons name="book-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No stories yet!</Text>
            <Text style={styles.emptySubtext}>Create your first magical story</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // ── Story card ───────────────────────────────────────
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
      activeOpacity={0.85}
      delayPressIn={70}
    >
      {item.illustrationUrl ? (
        <Image source={{ uri: item.illustrationUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardPlaceholder}>
          {/* sparkles inside placeholder */}
          <Sparkle style={{ top: 14, right: 16 }}  size={8} color="rgba(196,181,253,0.42)" />
          <Sparkle style={{ top: 50, left: 12 }}   size={5} color="rgba(255,255,255,0.22)" />
          <Sparkle style={{ bottom: 26, left: 34 }} size={6} color="rgba(251,191,36,0.28)" />
          <Sparkle style={{ bottom: 12, right: 42 }} size={3} color="rgba(196,181,253,0.3)" />

          <View style={styles.placeholderIconWrap}>
            <Ionicons name="book-outline" size={26} color="rgba(139,92,246,0.6)" />
          </View>
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ── List ──────────────────────────────────────────────
  return (
    <LinearGradient colors={colors.mainBg} style={styles.container}>
      {/* subtle background sparkles */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Sparkle style={{ top: 105, right: 34 }}  size={7} color="rgba(255,255,255,0.1)" />
        <Sparkle style={{ top: 260, left: 20 }}   size={5} color="rgba(196,181,253,0.18)" />
        <Sparkle style={{ bottom: 160, right: 52 }} size={6} color="rgba(251,191,36,0.14)" />
      </View>

      {/* Reset button (top right) */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
        <Ionicons name="refresh" size={24} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>My Stories</Text>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── sparkle base ──────────────────────────────────
  sparkleBase: {
    position: 'absolute',
  },

  // ── Reset Button ──────────────────────────────────
  resetButton: {
    position: 'absolute',
    top: 78,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Title ─────────────────────────────────────────
  pageTitle: {
    fontSize: 32,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 78,
    marginBottom: 24,
  },

  // ── Grid ──────────────────────────────────────────
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  // ── Card ──────────────────────────────────────────
  card: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,17,69,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(18,8,41,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 3,
  },

  // ── Empty state ───────────────────────────────────
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  emptyCard: {
    width: '100%',
    borderRadius: 48,
    padding: 44,
    alignItems: 'center',
    backgroundColor: 'rgba(30,17,69,0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.25)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 21,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 6,
  },

  // ── Loading ───────────────────────────────────────
  loadingText: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 80,
  },
});
