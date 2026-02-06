import React, { useRef, useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
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
function SwipeableScreens({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const currentAnimation = useRef(null);
  const activeIndexRef = useRef(0); // Track current index without state delays
  const isGestureDriven = useRef(false); // Flag to distinguish gesture vs tab press

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
    .activeOffsetX([-3, 3]) // Require only 3px horizontal movement before activating
    .failOffsetY([-20, 20]) // Cancel if vertical movement exceeds 20px
    .enableTrackpadTwoFingerGesture(true)
    .maxPointers(1) // Only allow single finger gestures
    .onStart(() => {
      // Cancel any ongoing animation when new gesture starts
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }
      isAnimating.current = false;
      isGestureDriven.current = true;
    })
    .onChange((event) => {
      const { translationX } = event;
      const baseOffset = -activeIndexRef.current * SCREEN_WIDTH;
      let newPosition = baseOffset + translationX;

      // Completely block movement beyond boundaries
      if (newPosition > 0) {
        // Block swiping right on first screen (Create)
        newPosition = 0;
      } else if (newPosition < -SCREEN_WIDTH) {
        // Block swiping left on last screen (Library)
        newPosition = -SCREEN_WIDTH;
      }

      translateX.setValue(newPosition);
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // Dynamic threshold based on velocity for ultra-responsive feel
      const baseThreshold = SCREEN_WIDTH * 0.2;
      const velocityThreshold = 800;
      const isQuickSwipe = Math.abs(velocityX) > velocityThreshold;
      const threshold = isQuickSwipe ? SCREEN_WIDTH * 0.15 : baseThreshold;

      let targetIndex = activeIndexRef.current;

      // Intelligent navigation decision
      if (translationX < -threshold || velocityX < -velocityThreshold) {
        // Swipe left
        if (activeIndexRef.current < 1) {
          targetIndex = 1;
        }
      } else if (translationX > threshold || velocityX > velocityThreshold) {
        // Swipe right
        if (activeIndexRef.current > 0) {
          targetIndex = 0;
        }
      }

      // Calculate optimal animation parameters based on velocity
      const targetPosition = -targetIndex * SCREEN_WIDTH;
      const currentPosition = translateX._value;
      const distance = Math.abs(targetPosition - currentPosition);

      // Update ref immediately for next gesture
      activeIndexRef.current = targetIndex;

      if (targetIndex !== activeIndex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Use timing animation for consistent, smooth behavior
      const animation = Animated.timing(translateX, {
        toValue: targetPosition,
        duration: Math.max(200, Math.min(300, distance * 0.8)), // Duration based on distance
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      currentAnimation.current = animation;

      animation.start(({ finished }) => {
        if (finished) {
          currentAnimation.current = null;
          isGestureDriven.current = false;
          setActiveIndex(targetIndex); // Update state after animation
        }
      });
    })
    .runOnJS(true);

  // Navigate programmatically when tab is pressed (not during gestures)
  useEffect(() => {
    // Skip if this state change was triggered by gesture
    if (isGestureDriven.current) {
      isGestureDriven.current = false;
      return;
    }

    const targetPosition = -activeIndex * SCREEN_WIDTH;
    activeIndexRef.current = activeIndex;

    // Cancel any ongoing animation
    if (currentAnimation.current) {
      currentAnimation.current.stop();
    }

    const animation = Animated.spring(translateX, {
      toValue: targetPosition,
      velocity: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    });

    currentAnimation.current = animation;
    animation.start(() => {
      currentAnimation.current = null;
    });
  }, [activeIndex]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgLight }}>
      <GestureDetector gesture={pan}>
        <Animated.View style={{
          flexDirection: 'row',
          width: SCREEN_WIDTH * 2,
          flex: 1,
          transform: [{ translateX }],
        }}>
          <View style={{ width: SCREEN_WIDTH }}>
            <CreateScreen navigation={navigation} />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <LibraryScreen navigation={navigation} onNavigateToCreate={() => setActiveIndex(0)} />
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
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
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
            delayPressIn={70}
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

export default function TabNavigator({ navigation }) {
  return <SwipeableScreens navigation={navigation} />;
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
    backgroundColor: colors.tabBg,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
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
