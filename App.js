import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoryProvider } from './src/context/StoryContext';
import TabNavigator from './src/navigation/TabNavigator';
import StoryDetailScreen from './src/screens/StoryDetailScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const [fontsLoaded] = Font.useFonts({
    'Rounded-Regular': require('./assets/fonts/SF-Pro-Rounded-Regular.otf'),
    'Rounded-Medium': require('./assets/fonts/SF-Pro-Rounded-Medium.otf'),
    'Rounded-Semibold': require('./assets/fonts/SF-Pro-Rounded-Semibold.otf'),
    'Rounded-Bold': require('./assets/fonts/SF-Pro-Rounded-Bold.otf'),
    'Rounded-Heavy': require('./assets/fonts/SF-Pro-Rounded-Heavy.otf'),
    'Rounded-Black': require('./assets/fonts/SF-Pro-Rounded-Black.otf'),
    'SFPro-Heavy': require('./assets/fonts/SF-Pro-Heavy.otf'),
  });

  useEffect(() => {
    checkOnboardingStatus();
    preloadAssets();
  }, []);

  const preloadAssets = async () => {
    try {
      // Preload images to prevent loading delays
      await Asset.fromModule(require('./assets/images/imageicon.png')).downloadAsync();
      setAssetsLoaded(true);
    } catch (error) {
      console.warn('Error preloading assets:', error);
      setAssetsLoaded(true); // Continue anyway
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('onboarding_completed');
      setShowOnboarding(hasCompletedOnboarding !== 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData) => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  if (!fontsLoaded || !assetsLoaded || isLoading) return null;

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <StoryProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </StoryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
