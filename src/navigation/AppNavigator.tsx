import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// Import all screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AuditDetailScreen from '../screens/AuditDetailScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import { IssuesScreen, ProfileScreen } from '../screens/OtherScreens';
import SyncScreen from '../screens/SyncScreen';

// ─── What this file does ─────────────────────────────────────────────────────
// This is the navigation brain of the app.
// Stack = screens that slide over each other (Login → Home → Detail)
// Tabs  = bottom bar with Home, Issues, Sync, Profile
//
// Structure:
//   RootStack
//   ├── Login (no tabs)
//   └── MainTabs
//       ├── Home tab     → HomeScreen (+ AuditDetail, Checklist, ItemDetail stack)
//       ├── Issues tab   → IssuesScreen
//       ├── Sync tab     → SyncScreen
//       └── Profile tab  → ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_COLOR   = '#1A6B4A';   // filled icon color
const INACTIVE_COLOR = '#6B7280';   // outline icon color

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// The stack inside the Home tab — allows navigating to audit detail, checklist, etc.
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home"        component={HomeScreen} />
      <HomeStack.Screen name="AuditDetail" component={AuditDetailScreen} />
      <HomeStack.Screen name="Checklist"   component={ChecklistScreen} />
      <HomeStack.Screen name="ItemDetail"  component={ItemDetailScreen} />
    </HomeStack.Navigator>
  );
}

// Main tab bar — shown after login
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor:   ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: { paddingTop: 6 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Issues"
        component={IssuesScreen}
        options={{
          tabBarLabel: 'Issues',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'warning' : 'warning-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncScreen}
        options={{
          tabBarLabel: 'Sync',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'sync' : 'sync-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator — Login is separate, no tab bar
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"     component={LoginScreen} />
      <Stack.Screen name="MainTabs"  component={MainTabs} />
    </Stack.Navigator>
  );
}