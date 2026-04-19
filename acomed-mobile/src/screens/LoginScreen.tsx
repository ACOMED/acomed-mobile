import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';

// ─── What this screen does ───────────────────────────────────────────────────
// Shows the login form with Inspector ID + Password.
// When the user taps "Sign In", it navigates to the Home screen.
// The 'navigation' prop is passed automatically by React Navigation.
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }: any) {
  // useState stores values that can change — here the two input fields
  const [inspectorId, setInspectorId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Called when user taps "Sign In"
  function handleLogin() {
    // Simple validation — replace with real API call later
    if (!inspectorId || !password) {
      setError('Please enter your Inspector ID and password.');
      return;
    }
    setError('');
    // Navigate to the main tabs — 'MainTabs' is defined in your navigator
    navigation.replace('MainTabs');
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* KeyboardAvoidingView pushes content up when keyboard appears */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ── OFFLINE BADGE ── */}
          <View style={styles.topRow}>
            <Text style={styles.signInLabel}>Sign In</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>OFFLINE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── LOGO + TITLE ── */}
          <View style={styles.centerSection}>
            <View style={styles.logoCircle}>
              {/* Shield icon as text — replace with real SVG/image later */}
              <Text style={styles.logoIcon}>🛡</Text>
            </View>
            <Text style={styles.appTitle}>Hospital Inspection</Text>
            <Text style={styles.appSubtitle}>Secure access for authorized personnel</Text>
          </View>

          {/* ── LOGIN CARD ── */}
          <View style={styles.card}>
            <Text style={styles.credentialsLabel}>CREDENTIALS</Text>

            {/* Inspector ID Field */}
            <Text style={styles.fieldLabel}>Inspector ID</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MA-2024-88"
                placeholderTextColor={Colors.text3}
                value={inspectorId}
                onChangeText={setInspectorId}
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <View style={styles.passwordHeader}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder="Enter password"
                placeholderTextColor={Colors.text3}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {/* Error message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Sign In Button */}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnPrimaryText}>Sign In →</Text>
            </TouchableOpacity>

            {/* Security note */}
            <View style={styles.secureRow}>
              <Text style={styles.secureText}>🛡 Encrypted secure connection enabled</Text>
            </View>
          </View>

          {/* ── FOOTER ── */}
          <Text style={styles.footer}>V2.4.0 • MINISTRY OF HEALTH, MOROCCO</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  signInLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  offlineBadge: {
    backgroundColor: Colors.grayLight,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayBorder,
  },
  centerSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 34,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.text2,
    marginBottom: 0,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  credentialsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: '600',
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    fontSize: 16,
    color: Colors.text3,
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.red,
    marginBottom: 10,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secureRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  secureText: {
    fontSize: 12,
    color: Colors.text2,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.text3,
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
});