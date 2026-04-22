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
  Image,
} from 'react-native';
import { Colors } from '../theme/colors';

// ─── LoginScreen ─────────────────────────────────────────────────────────────
// Clean professional login — no emojis, ACOMED logo at top, green accents.
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }: any) {
  const [inspectorId, setInspectorId]     = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [idFocused, setIdFocused]         = useState(false);
  const [pwFocused, setPwFocused]         = useState(false);
  const [error, setError]                 = useState('');

  function handleLogin() {
    if (!inspectorId || !password) {
      setError('Please enter your Inspector ID and password.');
      return;
    }
    setError('');
    navigation.replace('MainTabs');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── LOGO ── */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/ACOMED_MEDICAL_SOLUTION.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Field Inspection Platform</Text>
            <View style={styles.divider} />
          </View>

          {/* ── LOGIN CARD ── */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign In</Text>
            <Text style={styles.cardSub}>Access your inspector account</Text>

            {/* Inspector ID */}
            <Text style={styles.fieldLabel}>Inspector ID</Text>
            <View style={[styles.inputWrap, idFocused && styles.inputWrapFocused]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. MA-2024-88"
                placeholderTextColor="#9CA3AF"
                value={inspectorId}
                onChangeText={setInspectorId}
                autoCapitalize="none"
                onFocus={() => setIdFocused(true)}
                onBlur={() => setIdFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={styles.passwordHeader}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrap, pwFocused && styles.inputWrapFocused]}>
              <TextInput
                style={[styles.input, { paddingRight: 52 }]}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Sign In Button */}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.btnPrimaryText}>Sign In</Text>
            </TouchableOpacity>

            {/* Security note */}
            <Text style={styles.secureText}>Encrypted secure connection enabled</Text>
          </View>

          {/* ── FOOTER ── */}
          <Text style={styles.footer}>Ministry of Health — Morocco</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  // ── Logo / header section ──
  logoWrap: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 220,
    height: 80,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    marginTop: 20,
    height: 1.5,
    width: '100%',
    backgroundColor: Colors.green,
    opacity: 0.25,
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 24,
  },

  // ── Fields ──
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
    marginBottom: 20,
  },
  inputWrapFocused: {
    borderBottomColor: Colors.green,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  eyeText: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '600',
  },

  // ── Error ──
  errorText: {
    fontSize: 13,
    color: Colors.red,
    marginBottom: 12,
    textAlign: 'center',
  },

  // ── Primary button ──
  btnPrimary: {
    backgroundColor: Colors.green,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Secure note ──
  secureText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginTop: 24,
    paddingBottom: 8,
  },
});