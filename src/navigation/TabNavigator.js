import React, { useRef, useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import CreateScreen from '../screens/CreateScreen';
import LibraryScreen from '../screens/LibraryScreen';
import colors from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TABS = [
  { name: 'Create',  activeIcon: 'sparkles',    outlineIcon: 'sparkles-outline', useEmoji: true },
  { name: 'Library', activeIcon: 'book',        outlineIcon: 'book-outline' },
];

// ── Main swipeable container holding both screens ────
function SwipeableScreens() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const lastPosition = useRef(0);

  // Enhanced resistance function for ultra-smooth edge behavior
  const applyResistance = (position, limit, isNegative = false) => {
    const resistance = 0.55;
    const maxResistance = 80; // Maximum pixels beyond edge

    if (isNegative) {
      const excess = Math.abs(position - limit);
      const resistedExcess = maxResistance * (1 - Math.exp(-excess / (SCREEN_WIDTH * resistance)));
      return limit - resistedExcess;
    } else {
      const excess = position;
      const resistedExcess = maxResistance * (1 - Math.exp(-excess / (SCREEN_WIDTH * resistance)));
      return resistedExcess;
    }
  };

  // Pan gesture with optimized configuration for smoothness
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement before activating
    .failOffsetY([-10, 10]) // Cancel if vertical movement exceeds 10px
    .enableTrackpadTwoFingerGesture(true)
    .onChange((event) => {
      if (isAnimating.current) return;

      const { translationX } = event;
      const baseOffset = -activeIndex * SCREEN_WIDTH;
      let newPosition = baseOffset + translationX;

      // Apply smooth resistance at edges with exponential curve
      if (newPosition > 0) {
        // Resistance when trying to go before first screen
        newPosition = applyResistance(translationX, 0, false);
      } else if (newPosition < -SCREEN_WIDTH) {
        // Resistance when trying to go after last screen
        newPosition = applyResistance(newPosition, -SCREEN_WIDTH, true);
      }

      translateX.setValue(newPosition);
      lastPosition.current = newPosition;
    })
    .onEnd((event) => {
      if (isAnimating.current) return;

      const { translationX, velocityX } = event;

      // Dynamic threshold based on velocity for ultra-responsive feel
      const baseThreshold = SCREEN_WIDTH * 0.2;
      const velocityThreshold = 800;
      const isQuickSwipe = Math.abs(velocityX) > velocityThreshold;
      const threshold = isQuickSwipe ? SCREEN_WIDTH * 0.15 : baseThreshold;

      let targetIndex = activeIndex;

      // Intelligent navigation decision
      if (translationX < -threshold || velocityX < -velocityThreshold) {
        // Swipe left
        if (activeIndex < 1) {
          targetIndex = 1;
        }
      } else if (translationX > threshold || velocityX > velocityThreshold) {
        // Swipe right
        if (activeIndex > 0) {
          targetIndex = 0;
        }
      }

      // Calculate optimal animation parameters based on velocity
      const targetPosition = -targetIndex * SCREEN_WIDTH;
      const distance = Math.abs(targetPosition - lastPosition.current);
      const absVelocity = Math.abs(velocityX);

      isAnimating.current = true;

      if (targetIndex !== activeIndex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Use velocity-aware spring for ultra-smooth completion
      const springConfig = {
        toValue: targetPosition,
        velocity: velocityX / 1000, // Normalize velocity
        useNativeDriver: true,
        tension: 80, // Higher tension for snappier response
        friction: 14, // Balanced friction for smooth deceleration
      };

      // For quick swipes or small distances, use timing for precision
      if (isQuickSwipe || distance < SCREEN_WIDTH * 0.3) {
        Animated.timing(translateX, {
          toValue: targetPosition,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          isAnimating.current = false;
          setActiveIndex(targetIndex);
        });
      } else {
        // Use spring for natural feel on slower swipes
        Animated.spring(translateX, springConfig).start(() => {
          isAnimating.current = false;
          setActiveIndex(targetIndex);
        });
      }
    })
    .runOnJS(true);

  // Navigate programmatically when tab is pressed
  useEffect(() => {
    const targetPosition = -activeIndex * SCREEN_WIDTH;

    if (!isAnimating.current) {
      isAnimating.current = true;

      Animated.spring(translateX, {
        toValue: targetPosition,
        velocity: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 14,
      }).start(() => {
        isAnimating.current = false;
      });
    }
  }, [activeIndex]);

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={pan}>
        <Animated.View style={{
          flexDirection: 'row',
          width: SCREEN_WIDTH * 2,
          flex: 1,
          transform: [{ translateX }],
        }}>
          <View style={{ width: SCREEN_WIDTH }}>
            <CreateScreen />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <LibraryScreen />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Tab bar at bottom */}
      <CustomTabBar activeIndex={activeIndex} onTabPress={setActiveIndex} />
    </View>
  );
}

// ── Custom tab bar (memoized for performance) ────────
const CustomTabBar = memo(function CustomTabBar({ activeIndex, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {TABS.map((tab, index) => {
        const isActive = activeIndex === index;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabPress(index);
            }}
            activeOpacity={0.6}
          >
            {/* Subtle pill behind active icon */}
            {isActive && <View style={styles.activePill} />}

            {tab.useEmoji ? (
              <Text style={[styles.tabEmoji, {
                color: isActive ? colors.tabActive : colors.tabInactive,
                zIndex: 1
              }]}>
                ✦
              </Text>
            ) : (
              <Ionicons
                name={isActive ? tab.activeIcon : tab.outlineIcon}
                size={34}
                color={isActive ? colors.tabActive : colors.tabInactive}
                style={{ zIndex: 1 }}
              />
            )}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default function TabNavigator() {
  return <SwipeableScreens />;
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
    backgroundColor: colors.tabBg,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.2)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 24,
    paddingVertical: 2,
  },
  activePill: {
    position: 'absolute',
    width: 64,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tabActivePill,
    top: -2,
  },
  tabEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 15,
    fontFamily: 'SFPro-Heavy',
    color: colors.tabInactive,
    marginTop: 3,
    zIndex: 1,
  },
  tabLabelActive: {
    color: colors.tabActive,
  },
});
