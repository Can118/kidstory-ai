import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSE = width === 375 && height === 667;

const STEPS = {
  START: 'start',
  APPEAR: 'appear',
  DOWN: 'down',
  TEXT: 'text',
  CLOUD: 'cloud',
  NAME: 'name',
  AGE: 'age',
  FINISH: 'finish',
};

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(STEPS.START);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState(4);

  // Animation values
  const arrowOffset = useRef(new Animated.Value(-3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsDownOpacity = useRef(new Animated.Value(0)).current;
  const cloudOpacity = useRef(new Animated.Value(0)).current;

  // Position values
  const cardsYOffset = useRef(new Animated.Value(100)).current;
  const cardsXOffset = useRef(new Animated.Value(500)).current;
  const cardsRotation = useRef(new Animated.Value(15)).current;
  const cardsDownYOffset = useRef(new Animated.Value(0)).current;
  const cardRotation = useRef(new Animated.Value(15)).current;
  const cardsCloudOffset = useRef(new Animated.Value(0)).current;
  const cardsUserDataOffset = useRef(new Animated.Value(0)).current;
  const finishRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial logo fade in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Button fade in
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Auto advance to appear
      setTimeout(() => {
        advanceStep();
      }, 500);
    }, 500);

    // Arrow animation
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
  }, []);

  const advanceStep = () => {
    let nextStep = step;

    switch (step) {
      case STEPS.START:
        nextStep = STEPS.APPEAR;
        animateToAppear();
        break;
      case STEPS.APPEAR:
        nextStep = STEPS.DOWN;
        animateToDown();
        break;
      case STEPS.DOWN:
        nextStep = STEPS.TEXT;
        animateToText();
        break;
      case STEPS.TEXT:
        nextStep = STEPS.CLOUD;
        animateToCloud();
        break;
      case STEPS.CLOUD:
        nextStep = STEPS.NAME;
        animateToName();
        break;
      case STEPS.NAME:
        nextStep = STEPS.AGE;
        animateToAge();
        break;
      case STEPS.AGE:
        nextStep = STEPS.FINISH;
        animateToFinish();
        break;
      case STEPS.FINISH:
        onComplete?.({ name: userName, age: userAge });
        break;
    }

    setStep(nextStep);
  };

  const animateToAppear = () => {
    Animated.parallel([
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsYOffset, {
        toValue: 15,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsXOffset, {
        toValue: 110,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsRotation, {
        toValue: -15,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToDown = () => {
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
      Animated.timing(cardsRotation, {
        toValue: 15,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(cardsDownOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 700);
  };

  const animateToText = () => {
    Animated.parallel([
      Animated.timing(cardsYOffset, {
        toValue: height / 1.5,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToCloud = () => {
    Animated.parallel([
      Animated.timing(cardsYOffset, {
        toValue: 200,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsDownYOffset, {
        toValue: 50,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsRotation, {
        toValue: -15,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsCloudOffset, {
        toValue: 150,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(cloudOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 700);
  };

  const animateToName = () => {
    Animated.parallel([
      Animated.timing(cardsYOffset, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsDownYOffset, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardsCloudOffset, {
        toValue: 0,
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

  const animateToAge = () => {
    Animated.parallel([
      Animated.timing(cardsRotation, {
        toValue: 15,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToFinish = () => {
    Animated.parallel([
      Animated.timing(cardsRotation, {
        toValue: 345,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(finishRotation, {
        toValue: 30,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderCard = (imageName, title, rotation, offsetX, offsetY, additionalRotation = 0) => {
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: offsetX },
              { translateY: offsetY },
              { rotate: rotation.interpolate({
                inputRange: [-360, 360],
                outputRange: ['-360deg', '360deg'],
              }) },
              { rotate: `${additionalRotation}deg` },
            ],
            opacity: cardsOpacity,
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImageText}>{imageName}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Finish Screen */}
      {step === STEPS.FINISH && (
        <View style={styles.finishContainer}>
          <Text style={styles.finishWelcome}>Welcome to</Text>
          <Text style={styles.finishAppName}>kidstory</Text>
          <Text style={styles.finishMessage}>{userName}'s magical journey begins!</Text>
        </View>
      )}

      {/* Text Step */}
      {step === STEPS.TEXT && (
        <View style={styles.textStepContainer}>
          <View style={styles.textHeader}>
            <Text style={styles.stepTitle}>Create magical stories</Text>
            <Text style={styles.stepSubtitle}>Powered by AI imagination</Text>
          </View>
          <ScrollView style={styles.textScroll} contentContainerStyle={styles.textScrollContent}>
            <Text style={styles.exampleText}>
              Upload your child's photo, describe what kind of story you want, and watch as AI creates
              a personalized magical tale just for them. Each story is unique, engaging, and perfect
              for bedtime reading.
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Down Step */}
      {step === STEPS.DOWN && (
        <Animated.View style={[styles.downStepContainer, { opacity: cardsDownOpacity }]}>
          <Text style={styles.stepTitle}>AI-Powered Stories</Text>
          <Animated.View style={{ opacity: cardsDownOpacity }}>
            <Text style={styles.stepSubtitle}>Create unique tales for your child</Text>
            <Text style={styles.poweredBy}>Powered by AI</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Cloud Step */}
      {step === STEPS.CLOUD && (
        <View style={styles.cloudStepContainer}>
          <Text style={[styles.cloudIcon, { fontSize: 50 }]}>☁️</Text>
          <Text style={styles.stepTitle}>Save to Cloud</Text>
          <Animated.View style={{ opacity: cloudOpacity }}>
            <Text style={styles.stepSubtitle}>Access your stories anywhere, anytime</Text>
          </Animated.View>
        </View>
      )}

      {/* Name Step */}
      {step === STEPS.NAME && (
        <View style={styles.nameStepContainer}>
          <Text style={styles.stepTitle}>What's your child's name?</Text>
          <TextInput
            style={styles.nameInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoFocus
          />
          <View style={styles.inputUnderline} />
        </View>
      )}

      {/* Age Step */}
      {step === STEPS.AGE && (
        <View style={styles.ageStepContainer}>
          <Text style={styles.stepTitle}>{userName}'s age?</Text>
          <Text style={styles.ageDisplay}>{userAge} years old</Text>
          <View style={styles.ageButtons}>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={() => setUserAge(Math.max(1, userAge - 1))}
            >
              <Text style={styles.ageButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={() => setUserAge(Math.min(12, userAge + 1))}
            >
              <Text style={styles.ageButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cards */}
      <View style={styles.cardsContainer}>
        <Animated.View
          style={{
            transform: [{ translateY: Animated.multiply(cardsUserDataOffset, -1) }],
          }}
        >
          {renderCard(
            '🎨',
            'Create',
            Animated.add(Animated.multiply(cardsRotation, -1), cardRotation),
            Animated.subtract(cardsXOffset, 0),
            Animated.subtract(Animated.subtract(cardsYOffset, 0), cardsCloudOffset)
          )}

          {renderCard(
            '✨',
            'Imagine',
            cardsRotation,
            Animated.multiply(cardsXOffset, -1),
            Animated.add(Animated.multiply(cardsYOffset, -1), Animated.multiply(cardsDownYOffset, 4))
          )}
        </Animated.View>
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Text style={styles.logoWelcome}>Welcome to</Text>
        <Text style={styles.logoName}>kidstory</Text>
      </Animated.View>

      {/* Bottom Cards */}
      <Animated.View
        style={[
          styles.bottomCardsContainer,
          {
            transform: [{ translateY: cardsUserDataOffset }],
          },
        ]}
      >
        {renderCard(
          '📚',
          'Library',
          Animated.subtract(Animated.multiply(cardsRotation, -1), finishRotation),
          cardsXOffset,
          Animated.subtract(
            Animated.subtract(cardsYOffset, cardsDownYOffset),
            Animated.multiply(cardsCloudOffset, 0.9)
          )
        )}

        {renderCard(
          '🌟',
          'Discover',
          Animated.add(cardsRotation, finishRotation),
          Animated.multiply(cardsXOffset, -1),
          Animated.add(
            Animated.add(Animated.multiply(cardsYOffset, -1), Animated.multiply(cardsDownYOffset, 3)),
            cardsCloudOffset
          )
        )}
      </Animated.View>

      {/* Next Button */}
      {step !== STEPS.NAME || userName !== '' ? (
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <TouchableOpacity style={styles.button} onPress={advanceStep} activeOpacity={0.8}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {step === STEPS.FINISH ? (
                <Text style={styles.buttonTextFinish}>Let's Start!</Text>
              ) : (
                <Animated.Text
                  style={[
                    styles.buttonText,
                    {
                      transform: [{ translateX: arrowOffset }],
                    },
                  ]}
                >
                  →
                </Animated.Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Cards
  cardsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCardsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  cardContainer: {
    position: 'absolute',
  },
  card: {
    width: 220,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Rounded-Bold',
    color: '#1E1145',
    marginBottom: 8,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageText: {
    fontSize: 60,
  },

  // Logo
  logoContainer: {
    position: 'absolute',
    top: height / 2 - 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoWelcome: {
    fontSize: 24,
    fontFamily: 'Rounded-Semibold',
    color: '#1E1145',
  },
  logoName: {
    fontSize: 48,
    fontFamily: 'Rounded-Black',
    color: '#8B5CF6',
    marginTop: 4,
  },

  // Text Step
  textStepContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: height / 8,
    paddingHorizontal: 24,
  },
  textHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  textScroll: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 16,
    maxHeight: height / 5,
  },
  textScrollContent: {
    paddingVertical: 8,
  },
  exampleText: {
    fontSize: 16,
    fontFamily: 'Rounded-Medium',
    color: '#1E1145',
    lineHeight: 24,
  },

  // Down Step
  downStepContainer: {
    position: 'absolute',
    top: height / 5,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Rounded-Black',
    color: '#1E1145',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepSubtitle: {
    fontSize: 18,
    fontFamily: 'Rounded-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  poweredBy: {
    fontSize: 14,
    fontFamily: 'Rounded-Semibold',
    color: '#8B5CF6',
    marginTop: 32,
    textAlign: 'center',
  },

  // Cloud Step
  cloudStepContainer: {
    position: 'absolute',
    top: height / 3,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cloudIcon: {
    marginBottom: 16,
  },

  // Name Step
  nameStepContainer: {
    position: 'absolute',
    top: height / 3,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nameInput: {
    fontSize: 40,
    fontFamily: 'Rounded-Black',
    color: '#1E1145',
    textAlign: 'center',
    marginTop: 16,
    minWidth: 200,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: 'rgba(30,17,69,0.5)',
    marginHorizontal: 64,
    marginTop: 8,
  },

  // Age Step
  ageStepContainer: {
    position: 'absolute',
    top: height / 3,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ageDisplay: {
    fontSize: 40,
    fontFamily: 'Rounded-Black',
    color: '#1E1145',
    marginTop: 16,
    marginBottom: 32,
  },
  ageButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  ageButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageButtonText: {
    fontSize: 32,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
  },

  // Finish Step
  finishContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  finishWelcome: {
    fontSize: 24,
    fontFamily: 'Rounded-Semibold',
    color: '#1E1145',
  },
  finishAppName: {
    fontSize: 52,
    fontFamily: 'Rounded-Black',
    color: '#8B5CF6',
    marginVertical: 8,
  },
  finishMessage: {
    fontSize: 20,
    fontFamily: 'Rounded-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },

  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: isSE ? 28 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  buttonText: {
    fontSize: 32,
    fontFamily: 'Rounded-Bold',
    color: '#FFFFFF',
  },
  buttonTextFinish: {
    fontSize: 18,
    fontFamily: 'Rounded-Black',
    color: '#FFFFFF',
  },
});
