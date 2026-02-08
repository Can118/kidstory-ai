import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import colors from '../theme/colors';

export default function SettingsScreen() {
  // Placeholder App Store link - will be updated after app release
  const APP_STORE_LINK = 'https://apps.apple.com/app/kidstory-ai/id123456789';

  const handleLeaveReview = async () => {
    try {
      // Check if StoreReview is available on this device
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        // Opens native iOS rating dialog (fastest way)
        await StoreReview.requestReview();
      } else {
        // Fallback: open App Store page directly
        Alert.alert(
          'Review in App Store',
          'Would you like to open the App Store to leave a review?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open App Store',
              onPress: () => {
                // This will open the App Store app
                StoreReview.requestReview();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      Alert.alert('Error', 'Unable to open review dialog. Please try again later.');
    }
  };

  const handleShareWithFriends = async () => {
    try {
      const message = `Check out kidstory ai - where your child becomes the hero of their own personalized stories! ✨\n\n${APP_STORE_LINK}`;

      const result = await Share.share({
        message: message,
        title: 'kidstory ai - Personalized Stories',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Unable to share. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#2D1B69', '#1E1145', '#1a0f3d']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your kidstory ai experience</Text>
        </View>

        {/* Settings Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>

            {/* Leave a Review */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLeaveReview}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconWrapper}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Leave a Review</Text>
                <Text style={styles.settingDescription}>
                  Rate us on the App Store
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            {/* Share with Friends */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleShareWithFriends}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconWrapper}>
                <Ionicons name="share-social" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Share with Friends</Text>
                <Text style={styles.settingDescription}>
                  Tell others about kidstory ai
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            {/* App Version */}
            <View style={styles.settingItem}>
              <View style={styles.settingIconWrapper}>
                <Ionicons name="information-circle" size={24} color="#A78BFA" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Version</Text>
                <Text style={styles.settingDescription}>
                  1.0.0 (Build 3)
                </Text>
              </View>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                // TODO: Open privacy policy
                Alert.alert('Privacy Policy', 'Privacy policy will be available here.');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconWrapper}>
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>
                  Your photos never leave your device
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ✨ for magical storytelling
            </Text>
            <Text style={styles.footerSubtext}>
              kidstory ai © 2026
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f3d',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: 'Baloo-ExtraBold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Rounded-Bold',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },
  settingIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 15,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 13,
    fontFamily: 'Rounded-Medium',
    color: 'rgba(255,255,255,0.35)',
  },
});
