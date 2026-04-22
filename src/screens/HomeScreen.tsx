import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_USER, MOCK_AUDITS } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  function getStatusTag(status: string) {
    if (status === 'in_progress') return { bg: Colors.greenLight, color: Colors.greenDark, label: 'In Progress' };
    if (status === 'completed')   return { bg: '#D1FAE5', color: '#065F46', label: 'Completed' };
    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Pending' };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.logoSmall, { borderColor: theme.borderColor }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.green} />
          </View>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Dashboard</Text>
        </View>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── WELCOME CARD ── */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeSub, { color: theme.text2 }]}>Welcome back,</Text>
            <Text style={[styles.welcomeName, { color: theme.text }]}>{MOCK_USER.name}</Text>
            <Text style={styles.welcomeId}>Inspector ID: {MOCK_USER.inspectorId}</Text>
          </View>
          <View style={[styles.avatarWrap, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
            <Ionicons name="person" size={22} color={Colors.green} />
            <View style={styles.avatarDot} />
          </View>
        </View>

        {/* ── METRICS ROW ── */}
        <View style={[styles.metricsCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={[styles.metricItem, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
            <Text style={[styles.metricVal, { color: theme.text }]}>12</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>ASSIGNED</Text>
          </View>
          <View style={[styles.metricItem, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.metricVal, { color: Colors.red }]}>24</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>ISSUES</Text>
          </View>
          <View style={[styles.metricItem, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
            <Text style={[styles.metricVal, { fontSize: 18, color: theme.text }]}>98%</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>SYNCED</Text>
          </View>
        </View>

        {/* ── AUDIT LIST ── */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text }]}>Active Audits</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_AUDITS.map((audit) => {
          const tag = getStatusTag(audit.status);
          return (
            <TouchableOpacity
              key={audit.id}
              style={[styles.auditCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
              onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
            >
              <View style={styles.auditCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.auditType, { color: theme.text2 }]}>{audit.hospitalType}</Text>
                  <Text style={[styles.auditName, { color: theme.text }]}>{audit.hospitalName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Ionicons name="location-outline" size={12} color={theme.text2} />
                    <Text style={[styles.auditLocation, { color: theme.text2 }]}>{audit.location}</Text>
                  </View>
                </View>
                <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={[styles.progressWrap, { backgroundColor: theme.borderColor }]}>
                <View style={[styles.progressFill, { width: `${audit.progress}%` as any }]} />
              </View>

              {/* Footer */}
              <View style={styles.auditFooter}>
                <Text style={[styles.footerText, { color: theme.text2 }]}>
                  {audit.lastSync ? `Last sync: ${audit.lastSync}` : 'Audit Progress'}
                </Text>
                <Text style={styles.footerLink}>
                  {audit.status === 'completed' ? 'View Report ›' : audit.status === 'in_progress' ? 'Continue ›' : `${audit.progress}%`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.tagline, { color: theme.text3 }]}>"Ensuring healthcare excellence across Morocco."</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600' },
  offlineBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  welcomeCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  welcomeSub: { fontSize: 13, marginBottom: 2 },
  welcomeName: { fontSize: 20, fontWeight: '700' },
  welcomeId: { fontSize: 12, color: Colors.green, fontWeight: '600', marginTop: 2 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E', borderWidth: 1.5, borderColor: Colors.white,
  },
  metricsCard: {
    borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', padding: 16, gap: 10, marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  metricVal: { fontSize: 22, fontWeight: '700' },
  metricLbl: {
    fontSize: 10, fontWeight: '600',
    letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase',
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  viewAll: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  auditCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 12,
  },
  auditCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  auditType: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  auditName: { fontSize: 16, fontWeight: '700', lineHeight: 20 },
  auditLocation: { fontSize: 12 },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  progressWrap: { height: 8, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  auditFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  tagline: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginTop: 8, paddingBottom: 8 },
});