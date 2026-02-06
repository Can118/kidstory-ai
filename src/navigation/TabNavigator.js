import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CreateScreen from '../screens/CreateScreen';
import LibraryScreen from '../screens/LibraryScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Create',  activeIcon: 'sparkles',    outlineIcon: 'sparkles-outline', useEmoji: true },
  { name: 'Library', activeIcon: 'book',        outlineIcon: 'book-outline' },
];

// ── Custom dark tab bar ──────────────────────────────
function CustomTabBar({ navigation, state }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 16 }]}>
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const tab = TABS.find((t) => t.name === route.name);

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={() => navigation.navigate(route.name)}
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
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Create"  component={CreateScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.tabBg,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.2)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 32,
    paddingVertical: 4,
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
    marginTop: 6,
    zIndex: 1,
  },
  tabLabelActive: {
    color: colors.tabActive,
  },
});
