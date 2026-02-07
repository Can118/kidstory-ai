import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSE = width === 375 && height === 667;

const STEPS = {
  START: 'start',
  APPEAR: 'appear',
  NAME: 'name',
};

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(STEPS.START);
  const [userName, setUserName] = useState('');

  // Animation values - simplified based on reference
  const arrowOffset = useRef(new Animated.Value(-3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const starTwinkle = useRef(new Animated.Value(0.6)).current;

  // Position values - following reference implementation
  const cardsXOffset = useRef(new Animated.Value(500)).current; // Start: 500, Appear: 110
  const cardsYOffset = useRef(new Animated.Value(100)).current; // Start: 100, Appear: 15
  const cardsRotation = useRef(new Animated.Value(15)).current; // Start: 15, Appear: -15
  const cardsDownYOffset = useRef(new Animated.Value(0)).current;
  const cardsUserDataOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial logo fade in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Auto advance to appear after logo appears
    setTimeout(() => {
      advanceStep();
    }, 800);

    // Arrow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowOffset, {
          toValue: 3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOffset, {
          toValue: -3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Star twinkling animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(starTwinkle, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starTwinkle, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const advanceStep = () => {
    switch (step) {
      case STEPS.START:
        setStep(STEPS.APPEAR);
        animateToAppear();
        break;
      case STEPS.APPEAR:
        setStep(STEPS.NAME);
        animateToName();
        break;
      case STEPS.NAME:
        onComplete?.({ name: userName });
        break;
    }
  };

  const animateToAppear = () => {
    Animated.parallel([
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsXOffset, {
        toValue: 110,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsYOffset, {
        toValue: 15,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsRotation, {
        toValue: -15,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in button after cards have appeared
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateToName = () => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsYOffset, {
        toValue: height / 1.5,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsDownYOffset, {
        toValue: height / 3,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsUserDataOffset, {
        toValue: 150,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderCard = (emoji, title, style, cornerPosition) => {
    return (
      <Animated.View style={[styles.cardContainer, cornerPosition, style]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImageText}>{emoji}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Calculate card positions based on current state
  // Card 1: Top-left corner
  const getCard1Transform = () => ({
    opacity: cardsOpacity,
    transform: [
      {
        translateX: cardsXOffset.interpolate({
          inputRange: [110, 500],
          outputRange: [0, -300], // Start off-screen left, end at corner
        }),
      },
      {
        translateY: cardsYOffset.interpolate({
          inputRange: [15, 100, height / 1.5],
          outputRange: [0, -50, -80], // Stay at top, move up slightly for name step
        }),
      },
      {
        rotate: cardsRotation.interpolate({
          inputRange: [-15, 15],
          outputRange: ['-15deg', '15deg'],
        }),
      },
    ],
  });

  // Card 2: Top-right corner
  const getCard2Transform = () => ({
    opacity: cardsOpacity,
    transform: [
      {
        translateX: cardsXOffset.interpolate({
          inputRange: [110, 500],
          outputRange: [0, 300], // Start off-screen right, end at corner
        }),
      },
      {
        translateY: cardsYOffset.interpolate({
          inputRange: [15, 100, height / 1.5],
          outputRange: [0, -50, -80], // Stay at top, move up slightly for name step
        }),
      },
      {
        rotate: cardsRotation.interpolate({
          inputRange: [-15, 15],
          outputRange: ['15deg', '-15deg'],
        }),
      },
    ],
  });

  // Card 3: Bottom-left corner
  const getCard3Transform = () => ({
    opacity: cardsOpacity,
    transform: [
      {
        translateX: cardsXOffset.interpolate({
          inputRange: [110, 500],
          outputRange: [0, -300], // Start off-screen left, end at corner
        }),
      },
      {
        translateY: cardsYOffset.interpolate({
          inputRange: [15, 100, height / 1.5],
          outputRange: [0, 50, 120], // Slight down movement, then move down more for name step to stay at bottom
        }),
      },
      {
        rotate: cardsRotation.interpolate({
          inputRange: [-15, 15],
          outputRange: ['15deg', '-15deg'],
        }),
      },
    ],
  });

  // Card 4: Bottom-right corner
  const getCard4Transform = () => ({
    opacity: cardsOpacity,
    transform: [
      {
        translateX: cardsXOffset.interpolate({
          inputRange: [110, 500],
          outputRange: [0, 300], // Start off-screen right, end at corner
        }),
      },
      {
        translateY: cardsYOffset.interpolate({
          inputRange: [15, 100, height / 1.5],
          outputRange: [0, 50, 120], // Slight down movement, then move down more for name step to stay at bottom
        }),
      },
      {
        rotate: cardsRotation.interpolate({
          inputRange: [-15, 15],
          outputRange: ['-15deg', '15deg'],
        }),
      },
    ],
  });

  return (
    <LinearGradient colors={['#0F0621', '#1A0F3D', '#2D1B69', '#1E1145']} style={styles.container} locations={[0, 0.3, 0.7, 1]}>
      {/* Decorative Background Elements */}
      <View style={styles.backgroundDecorations}>
        <Animated.View style={[styles.star, { top: '15%', left: '10%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.star, { top: '25%', right: '15%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.star, { top: '60%', left: '20%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.star, { bottom: '20%', right: '25%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.starSmall, { top: '35%', left: '80%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.starSmall, { top: '70%', right: '10%', opacity: starTwinkle }]} />
        <Animated.View style={[styles.starSmall, { bottom: '35%', left: '15%', opacity: starTwinkle }]} />
      </View>

      {/* Radial glow overlay for depth */}
      <View style={styles.radialGlow} />

      {/* Name Step */}
      {step === STEPS.NAME && (
        <View style={styles.nameStepContainer}>
          <Text style={styles.stepTitle}>Who is the Hero of Stories</Text>
          <TextInput
            style={styles.nameInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Kid's name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoFocus
          />
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.inputUnderline}
          />
        </View>
      )}

      {/* Cards Group 1 */}
      <Animated.View
        style={[
          styles.cardsContainer,
          {
            transform: [
              {
                translateY: Animated.multiply(cardsUserDataOffset, -1),
              },
            ],
          },
        ]}
      >
        {renderCard('✏️', 'Create', getCard1Transform(), styles.topLeftCorner)}
        {renderCard('💭', 'Imagine', getCard2Transform(), styles.topRightCorner)}
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Text style={styles.logoWelcome}>Welcome to</Text>
        <Text style={styles.logoName}>kidstory</Text>
        <Text style={styles.logoTagline}>Your Kid. The Hero of the Story.</Text>
      </Animated.View>

      {/* Cards Group 2 */}
      <Animated.View
        style={[
          styles.bottomCardsContainer,
          {
            transform: [{ translateY: cardsUserDataOffset }],
          },
        ]}
      >
        {renderCard('📖', 'Library', getCard3Transform(), styles.bottomLeftCorner)}
        {renderCard('🚀', 'Discover', getCard4Transform(), styles.bottomRightCorner)}
      </Animated.View>

      {/* Next Button */}
      {step !== STEPS.NAME || userName !== '' ? (
        <Animated.View
          style={[
            step === STEPS.NAME && userName !== ''
              ? styles.buttonContainerNameStep
              : styles.buttonContainer,
            { opacity: buttonOpacity }
          ]}
        >
          <TouchableOpacity style={styles.button} onPress={advanceStep} activeOpacity={0.8}>
            <LinearGradient
              colors={['#7C3AED', '#8B5CF6', '#A78BFA']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.5, 1]}
            >
              {step === STEPS.NAME && userName !== '' ? (
                <Text style={styles.buttonTextFinish}>Let's Start!</Text>
              ) : (
                <Animated.View
                  style={{
                    transform: [{ translateX: arrowOffset }],
                  }}
                >
                  <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
                </Animated.View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Background decorations
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  starSmall: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C4B5FD',
  },
  radialGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 0,
    opacity: 0.3,
  },

  // Cards
  cardsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  bottomCardsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  cardContainer: {
    position: 'absolute',
  },
  // Corner positions for cards
  topLeftCorner: {
    top: 110,
    left: -30,
  },
  topRightCorner: {
    top: 110,
    right: -30,
  },
  bottomLeftCorner: {
    bottom: 160,
    left: -30,
  },
  bottomRightCorner: {
    bottom: 160,
    right: -30,
  },
  card: {
    width: 220,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.15)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Rounded-Bold',
    color: '#2D1B69',
    marginBottom: 8,
    textShadowColor: 'rgba(139, 92, 246, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.1)',
  },
  cardImageText: {
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Logo
  logoContainer: {
    position: 'absolute',
    top: height / 2 - 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  logoWelcome: {
    fontSize: 24,
    fontFamily: 'Rounded-Semibold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoName: {
    fontSize: 48,
    fontFamily: 'Rounded-Black',
    color: '#A78BFA',
    marginTop: 4,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoTagline: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: '#E9D5FF',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Name Step
  nameStepContainer: {
    position: 'absolute',
    top: height / 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 50,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Rounded-Semibold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 0.3,
  },
  nameInput: {
    fontSize: 38,
    fontFamily: 'Rounded-Black',
    color: '#E9D5FF',
    textAlign: 'center',
    marginTop: 20,
    minWidth: 200,
    textShadowColor: 'rgba(167, 139, 250, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  inputUnderline: {
    height: 3,
    marginHorizontal: 64,
    marginTop: 12,
    borderRadius: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: isSE ? 28 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  buttonContainerNameStep: {
    position: 'absolute',
    top: height / 4 + 170,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 140,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonTextFinish: {
    fontSize: 18,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
