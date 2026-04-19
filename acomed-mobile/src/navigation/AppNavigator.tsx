import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Colors } from '../theme/colors';

// Import all screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AuditDetailScreen from '../screens/AuditDetailScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import { IssuesScreen, ProfileScreen } from '../screens/OtherScreens';

// ─── What this file does ─────────────────────────────────────────────────────
// This is the navigation brain of the app.
// Stack = screens that slide over each other (Login → Home → Detail)
// Tabs  = bottom bar with Home, Audits, Issues, Profile
//
// Structure:
//   RootStack
//   ├── Login (no tabs)
//   └── MainTabs
//       ├── Home tab → HomeScreen
//       │   (+ AuditDetail and Checklist stack on top)
//       ├── Issues tab → IssuesScreen
//       └── Profile tab → ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// The stack inside the Home tab — allows navigating to audit detail, checklist, etc.
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="AuditDetail" component={AuditDetailScreen} />
      <HomeStack.Screen name="Checklist" component={ChecklistScreen} />
      <HomeStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </HomeStack.Navigator>
  );
}

// Tab icon helper — returns a simple emoji icon
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? Colors.green : Colors.text2, fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
    </View>
  );
}

// Main tab bar — shown after login
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarShowLabel: false }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Issues"
        component={IssuesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚠" label="Issues" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator — Login is separate, no tab bar
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}