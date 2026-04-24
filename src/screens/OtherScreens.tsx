import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_ISSUES } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// IssuesScreen — dark-mode aware + Ionicons
// ─────────────────────────────────────────────────────────────────────────────
export function IssuesScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  function getSeverityStyle(severity: string) {
    if (severity === 'high') return { bg: Colors.red, color: Colors.white, label: 'High' };
    if (severity === 'medium') return { bg: Colors.orangeLight, color: '#92400E', label: 'Medium' };
    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Low' };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Non-Conformities</Text>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      {/* Summary metrics */}
      <View style={[styles.summaryRow, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={[styles.summaryItem, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.summaryVal, { color: Colors.red }]}>{MOCK_ISSUES.filter(i => i.severity === 'high').length}</Text>
          <Text style={[styles.summaryLbl, { color: theme.text2 }]}>HIGH</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: Colors.orangeLight }]}>
          <Text style={[styles.summaryVal, { color: '#92400E' }]}>{MOCK_ISSUES.filter(i => i.severity === 'medium').length}</Text>
          <Text style={[styles.summaryLbl, { color: theme.text2 }]}>MEDIUM</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
          <Text style={[styles.summaryVal, { color: theme.text }]}>{MOCK_ISSUES.length}</Text>
          <Text style={[styles.summaryLbl, { color: theme.text2 }]}>TOTAL</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {MOCK_ISSUES.map(issue => {
          const sev = getSeverityStyle(issue.severity);
          return (
            <View key={issue.id} style={[styles.issueCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <View style={styles.issueCardHeader}>
                <Text style={styles.issueCode}>{issue.code}</Text>
                <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="warning-outline" size={11} color={sev.color} />
                    <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.issueTitle, { color: theme.text }]}>{issue.title}</Text>
              <View style={styles.issueFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="clipboard-outline" size={12} color={theme.text2} />
                  <Text style={[styles.issueSectionText, { color: theme.text2 }]}>{issue.section}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                  <Text style={[styles.statusText, { color: theme.text2 }]}>
                    {issue.status === 'open' ? 'Open' : 'In Progress'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileScreen — dark-mode aware + Ionicons
// ─────────────────────────────────────────────────────────────────────────────
export function ProfileScreen({ navigation }: any) {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  return (
    <SafeAreaView style={[styles.profileSafe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TEAL HEADER ── */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white', fontSize: 28 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>My Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── AVATAR SECTION ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={38} color={Colors.teal} />
          </View>
          <Text style={styles.profileName}>Mohamed Ouazzag</Text>
          <Text style={styles.profileInspectorId}>Inspector ID: #44021</Text>
          <Text style={styles.profileRegion}>Region: Zone 4</Text>
        </View>

        <View style={{ padding: 16 }}>

          {/* ── ACCOUNT INFORMATION ── */}
          <Text style={[styles.sectionLabel, { color: theme.text2 }]}>ACCOUNT INFORMATION</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <InfoRow icon="mail-outline" label="Email" value="m.ouazzag@sante.gov.ma" valueColor={Colors.teal} theme={theme} />
            <InfoRow icon="call-outline" label="Phone" value="+212 661-234-567" theme={theme} />
            <InfoRow icon="business-outline" label="Department" value="Infrastructure & Safety" theme={theme} />
            <InfoRow icon="person-outline" label="Role" value="Field Inspector" isLast theme={theme} />
          </View>

          {/* ── DEVICE STATUS ── */}
          <Text style={[styles.sectionLabel, { color: theme.text2 }]}>DEVICE STATUS</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <InfoRow icon="sync-outline" label="Last Sync" value="Oct 24, 09:41 AM" theme={theme} />
            <InfoRow icon="clipboard-outline" label="Pending Audits" value="12 Pending" valueBg={Colors.orangeLight} valueColor="#92400E" theme={theme} />
            <InfoRow icon="save-outline" label="Offline Data" value="142.5 MB" isLast theme={theme} />
          </View>

          {/* ── PREFERENCES ── */}
          <Text style={[styles.sectionLabel, { color: theme.text2 }]}>PREFERENCES</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="moon-outline" size={16} color={theme.text2} />
                <Text style={[styles.infoRowLabel, { color: theme.text2 }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E7EB', true: Colors.green }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ── SIGN OUT ── */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => navigation.replace('Login')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="log-out-outline" size={18} color={Colors.white} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.appVersion, { color: theme.text3 }]}>APP VERSION 4.2.1-STABLE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — theme-aware row with Ionicon prefix
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, isLast, valueColor, valueBg, theme }: any) {
  return (
    <View style={[
      styles.infoRow,
      { borderBottomColor: theme.borderColor },
      isLast && { borderBottomWidth: 0 },
    ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={16} color={theme.text2} />
        <Text style={[styles.infoRowLabel, { color: theme.text2 }]}>{label}</Text>
      </View>
      <View style={valueBg ? [styles.valuePill, { backgroundColor: valueBg }] : null}>
        <Text style={[
          styles.infoRowValue,
          { color: theme.text },
          valueColor && { color: valueColor },
          valueBg && { fontWeight: '700', fontSize: 12 },
        ]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── IssuesScreen ──
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { fontSize: 28, lineHeight: 32 },
  topBarTitle: { fontSize: 17, fontWeight: '600' },
  offlineBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderBottomWidth: 1,
  },
  summaryItem: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
  },
  summaryVal: { fontSize: 22, fontWeight: '700' },
  summaryLbl: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  body: { flex: 1, padding: 16 },
  issueCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  issueCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  issueCode: { fontSize: 11, fontWeight: '700', color: Colors.green },
  severityBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  severityText: { fontSize: 11, fontWeight: '700' },
  issueTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  issueFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  issueSectionText: { fontSize: 12 },
  statusBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },

  // ── ProfileScreen ──
  profileSafe: { flex: 1 },
  profileHeader: {
    backgroundColor: Colors.teal,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  profileHeaderTitle: { fontSize: 17, fontWeight: '600', color: 'white' },
  avatarSection: {
    backgroundColor: Colors.teal, alignItems: 'center', paddingBottom: 24,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E0F2FE', borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  profileName: { fontSize: 20, fontWeight: '700', color: 'white' },
  profileInspectorId: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  profileRegion: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    marginBottom: 10, marginTop: 4,
  },
  infoCard: {
    borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  infoRowLabel: { fontSize: 13 },
  infoRowValue: { fontSize: 13, fontWeight: '500' },
  valuePill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  signOutBtn: {
    backgroundColor: Colors.red, borderRadius: 14,
    padding: 15, alignItems: 'center', marginBottom: 10,
  },
  signOutText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  appVersion: {
    textAlign: 'center', fontSize: 11,
    marginTop: 4, paddingBottom: 16,
  },
});