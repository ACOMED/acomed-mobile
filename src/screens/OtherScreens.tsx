import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_ISSUES } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

import * as authService from '../services/authService';
import { fetchAudits } from '../services/auditService';




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
  const [user, setUser] = React.useState<any>(null);
  const [audits, setAudits] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    authService.getUser().then(setUser);
  }, []);

  React.useEffect(() => {
    fetchAudits().then(setAudits).catch(() => {});
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')
    : null;

  return (
    <SafeAreaView style={[styles.profileSafe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.profileTopBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View>
          <Text style={[styles.profileTopLabel, { color: theme.text2 }]}>ACOMED</Text>
          <Text style={[styles.profileTopTitle, { color: theme.text }]}>Profil</Text>
        </View>
        <Ionicons name="settings-outline" size={20} color={theme.text2} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── AVATAR HERO ── */}
        <View style={[styles.avatarHero, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
          <View style={[styles.avatarCircle, { borderColor: theme.borderColor }]}>
            {initials ? (
              <Text style={[styles.avatarInitials, { color: theme.text }]}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={30} color={theme.text2} />
            )}
            <View style={styles.avatarOnlineDot} />
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>{user?.full_name || '—'}</Text>
          <Text style={[styles.profileRole, { color: theme.text2 }]}>Inspecteur sanitaire — Ministère de la Santé</Text>
          <View style={styles.idPill}>
            <Text style={styles.idPillText}>ID : {user?.id?.slice(0, 8) || '—'}</Text>
          </View>
        </View>

        {/* ── STATS GRID ── */}
        <View style={[styles.statsGrid, { backgroundColor: theme.background }]}>
          <View style={[styles.statCard, { backgroundColor: theme.white }]}>
            <Text style={[styles.statVal, { color: theme.text }]}>
              {audits !== null ? audits.length : '—'}
            </Text>
            <Text style={[styles.statLbl, { color: theme.text2 }]}>Total audits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.white }]}>
            <Text style={[styles.statVal, { color: theme.text }]}>
              {audits !== null ? audits.filter((a: any) => a.status === 'soumis').length : '—'}
            </Text>
            <Text style={[styles.statLbl, { color: theme.text2 }]}>Audits soumis</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.white }]}>
            <Text style={[styles.statVal, { color: theme.text }]}>
              {audits !== null ? audits.filter((a: any) => a.status === 'brouillon' || a.status === 'en cours').length : '—'}
            </Text>
            <Text style={[styles.statLbl, { color: theme.text2 }]}>En cours</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.white }]}>
            <Text style={[styles.statVal, { fontSize: 16, color: theme.text }]}>{user?.role || 'Inspector'}</Text>
            <Text style={[styles.statLbl, { color: theme.text2 }]}>Role</Text>
          </View>
        </View>

        {/* ── ACCOUNT DETAILS ── */}
        <Text style={[styles.profileSectionLabel, { color: theme.text2 }]}>Account details</Text>
        <View style={[styles.profileCard, { borderColor: theme.borderColor, backgroundColor: theme.white }]}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email || '—'} theme={theme} />
          <InfoRow icon="person-outline" label="Role" value={user?.role || '—'} isLast theme={theme} />
        </View>

        {/* ── PREFERENCES ── */}
        <Text style={[styles.profileSectionLabel, { color: theme.text2 }]}>Preferences</Text>
        <View style={[styles.profileCard, { borderColor: theme.borderColor, backgroundColor: theme.white }]}>
          {/* Dark mode row */}
          <View style={[styles.prefRow, { borderBottomColor: theme.borderColor }]}>
            <View style={styles.prefLeft}>
              <View style={[styles.prefIconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="moon-outline" size={16} color={theme.text2} />
              </View>
              <View>
                <Text style={[styles.prefLabel, { color: theme.text }]}>Mode sombre</Text>
                <Text style={[styles.prefSub, { color: theme.text2 }]}>Light / Dark</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E7EB', true: Colors.green }}
              thumbColor="#FFFFFF"
            />
          </View>
          {/* Language row */}
          <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
            <View style={styles.prefLeft}>
              <View style={[styles.prefIconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="language-outline" size={16} color={theme.text2} />
              </View>
              <View>
                <Text style={[styles.prefLabel, { color: theme.text }]}>Language</Text>
                <Text style={[styles.prefSub, { color: theme.text2 }]}>Français</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.text3} />
          </View>
        </View>

        {/* ── SIGN OUT ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => {
            await authService.logout();
            navigation.replace('Login');
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="log-out-outline" size={18} color="#991b1b" />
            <Text style={styles.signOutText}>Déconnexion</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.appVersion}>ACOMED v1.0.0 — Ministère de la Santé du Maroc</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — icon box left, label+value stack middle, chevron right
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, isLast, theme }: any) {
  return (
    <View style={[
      styles.infoRow,
      isLast && { borderBottomWidth: 0 },
      { borderBottomColor: theme?.borderColor },
    ]}>
      <View style={styles.infoLeft}>
        <View style={[styles.infoIconBox, { backgroundColor: theme?.background }]}>
          <Ionicons name={icon} size={16} color={theme?.text2 || '#8a8f9e'} />
        </View>
        <View>
          <Text style={[styles.infoLabel, { color: theme?.text2 }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: theme?.text }]}>{value}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme?.text3 || '#c0c4d0'} />
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

  // Top bar
  profileTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#dde0e8',
  },
  profileTopLabel: {
    fontSize: 11, fontWeight: '500', color: '#8a8f9e',
    letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 2,
  },
  profileTopTitle: { fontSize: 22, fontWeight: '500', color: '#0d1b3e' },

  // Avatar hero
  avatarHero: {
    alignItems: 'center', paddingVertical: 24,
    borderBottomWidth: 0.5, borderBottomColor: '#dde0e8',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#e8eaf0', borderWidth: 2, borderColor: '#dde0e8',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarInitials: { fontSize: 24, fontWeight: '500', color: '#0d1b3e' },
  avatarOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#ffffff',
  },
  profileName: { fontSize: 20, fontWeight: '500', color: '#0d1b3e', marginBottom: 4 },
  profileRole: { fontSize: 13, color: '#8a8f9e', marginBottom: 10 },
  idPill: {
    flexDirection: 'row', gap: 6,
    borderWidth: 1, borderColor: '#b5d4f4',
    backgroundColor: '#e6f1fb',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
  },
  idPillText: { fontSize: 12, fontWeight: '500', color: '#185fa5' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: 16, backgroundColor: '#f9fafb',
  },
  statCard: {
    width: '47%', backgroundColor: '#f5f6f9',
    borderRadius: 10, padding: 14, alignItems: 'center',
  },
  statVal: { fontSize: 22, fontWeight: '500', color: '#0d1b3e' },
  statLbl: { fontSize: 11, color: '#8a8f9e', marginTop: 4, textAlign: 'center' },

  // Section label
  profileSectionLabel: {
    fontSize: 11, fontWeight: '500', color: '#8a8f9e',
    letterSpacing: 0.07, textTransform: 'uppercase',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },

  // Info card
  profileCard: {
    marginHorizontal: 16, marginBottom: 16,
    borderWidth: 0.5, borderRadius: 14, overflow: 'hidden',
  },

  // InfoRow
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#eef0f5',
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f5f6f9', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 12, color: '#8a8f9e' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#0d1b3e', marginTop: 1 },

  // Preferences rows
  prefRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#eef0f5',
  },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f5f6f9', alignItems: 'center', justifyContent: 'center',
  },
  prefLabel: { fontSize: 14, fontWeight: '500', color: '#0d1b3e' },
  prefSub: { fontSize: 12, color: '#8a8f9e', marginTop: 1 },

  // Sign out
  signOutBtn: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  signOutText: { color: '#991b1b', fontSize: 15, fontWeight: '500' },

  // Version
  appVersion: {
    fontSize: 11, color: '#c0c4d0',
    textAlign: 'center', paddingBottom: 16, marginTop: 4,
  },
});
