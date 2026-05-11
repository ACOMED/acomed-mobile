import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { isAuthenticated } from '../services/authService';
import { sync } from '../services/syncService';

// Import all screens
import LoginScreen           from '../screens/LoginScreen';
import HomeScreen            from '../screens/HomeScreen';
import AuditDetailScreen     from '../screens/AuditDetailScreen';
import ChecklistScreen       from '../screens/ChecklistScreen';
import ItemDetailScreen      from '../screens/ItemDetailScreen';
import { ProfileScreen }     from '../screens/OtherScreens';
import SyncScreen            from '../screens/SyncScreen';
import NotificationsScreen   from '../screens/NotificationsScreen';

// ─── What this file does ─────────────────────────────────────────────────────
// This is the navigation brain of the app.
// Stack = screens that slide over each other (Login → Home → Detail)
// Tabs  = bottom bar with Home, Notifications, Sync, Profile
//
// Structure:
//   RootStack
//   ├── Login (no tabs)
//   └── MainTabs
//       ├── Home tab          → HomeScreen (+ AuditDetail, Checklist, ItemDetail stack)
//       ├── Notifications tab → NotificationsScreen (badge: 3)
//       ├── Sync tab          → SyncScreen
//       └── Profile tab       → ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_COLOR   = '#1A6B4A';
const INACTIVE_COLOR = '#6B7280';

const Stack     = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();
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
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  // Live badge count — updated by NotificationsScreen via onUnreadChange
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor:   ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          paddingTop: 6,
          backgroundColor: theme.white,
          borderTopColor: theme.borderColor,
          borderTopWidth: 1,
        },
      }}
    >
      {/* ── HOME ── */}
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

      {/* ── NOTIFICATIONS (badge) ── */}
<Tab.Screen
  name="Notifications"
  component={({ navigation }) => (
  <NotificationsScreen navigation={navigation} onUnreadChange={setUnreadCount} />
)}
  options={{
    tabBarLabel: 'Notifications',
    tabBarIcon: ({ focused, size }) => (
      <View style={{ position: 'relative' }}>
        <Ionicons
          name={focused ? 'notifications' : 'notifications-outline'}
          size={size}
          color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              backgroundColor: '#EF4444',
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700' }}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>
    ),
  }}
/>

      {/* ── SYNC ── */}
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

      {/* ── PROFILE ── */}
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
  const [initialScreen, setInitialScreen] = useState<'Login' | 'MainTabs' | null>(null);

  useEffect(() => {
    isAuthenticated().then((authed) => {
      setInitialScreen(authed ? 'MainTabs' : 'Login');
    });
  }, []);

  useEffect(() => {
    let wasOffline = false;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      if (wasOffline && online) {
        console.log('[AppNavigator] Reconnected — triggering sync');
        sync();
      }
      wasOffline = !online;
    });
    return unsubscribe;
  }, []);

  // Blank loading view while AsyncStorage token check runs
  if (initialScreen === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#1A6B4A" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}