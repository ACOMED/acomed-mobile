import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { isAuthenticated } from '../services/authService';
import { sync } from '../services/syncService';

// Import all screens
import LoginScreen            from '../screens/LoginScreen';
import HomeScreen             from '../screens/HomeScreen';
import AuditDetailScreen      from '../screens/AuditDetailScreen';
import ChecklistScreen        from '../screens/ChecklistScreen';
import ItemDetailScreen       from '../screens/ItemDetailScreen';
import NonConformitiesScreen  from '../screens/NonConformitiesScreen';
import { ProfileScreen }      from '../screens/OtherScreens';
import SyncScreen             from '../screens/SyncScreen';
import ReportScreen           from '../screens/ReportScreen';

// ─── Navigation structure ─────────────────────────────────────────────────────
// RootStack
// ├── Login (no tabs)
// └── MainTabs
//     ├── Home tab    → HomeStackNavigator (Home → AuditDetail → Checklist …)
//     ├── Audits tab  → HomeStackNavigator (same stack, separate instance)
//     ├── Report tab  → ReportScreen
//     ├── Sync tab    → SyncScreen
//     └── Profile tab → ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_COLOR   = '#0d1b3e';
const INACTIVE_COLOR = '#8a8f9e';

const Stack      = createNativeStackNavigator();
const Tab        = createBottomTabNavigator();
const HomeStack  = createNativeStackNavigator();
const AuditsStack = createNativeStackNavigator();
const ReportStack = createNativeStackNavigator();

// Stack inside the Home tab
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home"             component={HomeScreen} />
      <HomeStack.Screen name="AuditDetail"      component={AuditDetailScreen} />
      <HomeStack.Screen name="Checklist"        component={ChecklistScreen} />
      <HomeStack.Screen name="ItemDetail"       component={ItemDetailScreen} />
      <HomeStack.Screen name="NonConformities"  component={NonConformitiesScreen} />
    </HomeStack.Navigator>
  );
}

// Stack inside the Report tab — Reports list → AuditDetail → Checklist
function ReportStackNavigator() {
  return (
    <ReportStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportStack.Screen name="ReportHome"     component={ReportScreen} />
      <ReportStack.Screen name="AuditDetail"    component={AuditDetailScreen} />
      <ReportStack.Screen name="Checklist"      component={ChecklistScreen} />
    </ReportStack.Navigator>
  );
}

// Stack inside the Audits tab — same screens, separate navigator instance
function AuditsStackNavigator() {
  return (
    <AuditsStack.Navigator screenOptions={{ headerShown: false }}>
      <AuditsStack.Screen name="Home"            component={HomeScreen} />
      <AuditsStack.Screen name="AuditDetail"     component={AuditDetailScreen} />
      <AuditsStack.Screen name="Checklist"       component={ChecklistScreen} />
      <AuditsStack.Screen name="ItemDetail"      component={ItemDetailScreen} />
      <AuditsStack.Screen name="NonConformities" component={NonConformitiesScreen} />
    </AuditsStack.Navigator>
  );
}

// Main tab bar — shown after login
function MainTabs() {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

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
          borderTopColor: '#dde0e8',
          borderTopWidth: 0.5,
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

      {/* ── AUDITS ── */}
      <Tab.Screen
        name="AuditsTab"
        component={AuditsStackNavigator}
        options={{
          tabBarLabel: 'Audits',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      {/* ── REPORT ── */}
      <Tab.Screen
        name="ReportTab"
        component={ReportStackNavigator}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
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
        <ActivityIndicator size="large" color="#0d1b3e" />
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
