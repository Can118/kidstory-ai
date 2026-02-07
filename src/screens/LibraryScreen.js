import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

export default function LibraryScreen({ navigation, onNavigateToCreate }) {
  const { stories, loading } = useStoryContext();
  const [settingsVisible, setSettingsVisible] = useState(false);

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

  const openSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettingsVisible(true);
  };

  const closeSettings = () => {
    setSettingsVisible(false);
  };

  const handleDeleteAllPhotos = () => {
    closeSettings();
    Alert.alert(
      'Delete All Photos',
      'This will delete all your stories and photos. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Done!', 'All photos and stories have been deleted.');
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      icon: 'star-outline',
      title: 'Leave a review',
      onPress: () => {
        closeSettings();
        Alert.alert('Leave a Review', 'Thank you for your support!');
      },
    },
    {
      icon: 'share-social-outline',
      title: 'Share with friends',
      onPress: () => {
        closeSettings();
        Alert.alert('Share', 'Share this app with your friends!');
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'I need help',
      onPress: () => {
        closeSettings();
        Alert.alert('Help', 'Contact us at support@kidstory.ai');
      },
    },
    {
      icon: 'card-outline',
      title: 'Manage subscription',
      onPress: () => {
        closeSettings();
        Alert.alert('Subscription', 'Subscription management will be available soon!');
      },
    },
    {
      icon: 'trash-outline',
      title: 'Delete all photos',
      onPress: handleDeleteAllPhotos,
      destructive: true,
    },
    {
      icon: 'close-circle-outline',
      title: 'Delete account',
      onPress: async () => {
        closeSettings();
        Alert.alert(
          'Delete Account',
          'This will reset everything and show onboarding again.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.clear();
                Alert.alert('Done', 'Please close and reopen the app.');
              },
            },
          ]
        );
      },
      destructive: true,
    },
  ];

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
      <>
        <LinearGradient colors={colors.mainBg} style={styles.container}>
          {/* Settings button (top right) */}
          <TouchableOpacity style={styles.resetButton} onPress={openSettings} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <Text style={styles.pageTitle}>My Stories</Text>
          <View style={styles.emptyWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (onNavigateToCreate) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onNavigateToCreate();
                }
              }}
            >
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
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Settings Modal ── */}
        <Modal
          visible={settingsVisible}
          transparent
          animationType="fade"
          onRequestClose={closeSettings}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeSettings}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
                {settingsOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.settingItem}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingLeft}>
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={option.destructive ? '#EF4444' : '#A78BFA'}
                      />
                      <Text style={[styles.settingText, option.destructive && styles.settingTextDestructive]}>
                        {option.title}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </>
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
    <>
      <LinearGradient colors={colors.mainBg} style={styles.container}>
        {/* subtle background sparkles */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Sparkle style={{ top: 105, right: 34 }}  size={7} color="rgba(255,255,255,0.1)" />
          <Sparkle style={{ top: 260, left: 20 }}   size={5} color="rgba(196,181,253,0.18)" />
          <Sparkle style={{ bottom: 160, right: 52 }} size={6} color="rgba(251,191,36,0.14)" />
        </View>

        {/* Settings button (top right) */}
        <TouchableOpacity style={styles.resetButton} onPress={openSettings} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.6)" />
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

      {/* ── Settings Modal ── */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSettings}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeSettings}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={closeSettings} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
              {settingsOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.settingItem}
                  onPress={option.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={option.destructive ? '#EF4444' : '#A78BFA'}
                    />
                    <Text style={[styles.settingText, option.destructive && styles.settingTextDestructive]}>
                      {option.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
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
    fontSize: 36,
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

  // ── Settings Modal ────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E1145',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,92,246,0.2)',
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsList: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingText: {
    fontSize: 17,
    fontFamily: 'Rounded-Semibold',
    color: '#FFFFFF',
  },
  settingTextDestructive: {
    color: '#EF4444',
  },
});
