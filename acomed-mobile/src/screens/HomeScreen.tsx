import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MOCK_USER, MOCK_AUDITS } from '../mocks/data';

// ─── What this screen does ───────────────────────────────────────────────────
// Shows the inspector's dashboard: welcome card, 3 metrics, list of audits.
// Tapping an audit card navigates to AuditDetail.
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: any) {
  // Map status to a tag style
  function getStatusTag(status: string) {
    if (status === 'in_progress') return { bg: Colors.greenLight, color: Colors.greenDark, label: 'In Progress' };
    if (status === 'completed')   return { bg: '#D1FAE5', color: '#065F46', label: 'Completed' };
    return { bg: Colors.grayLight, color: Colors.gray, label: 'Pending' };
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoSmall}>
            <Text>🛡</Text>
          </View>
          <Text style={styles.topBarTitle}>Dashboard</Text>
        </View>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── WELCOME CARD ── */}
        <View style={styles.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeSub}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{MOCK_USER.name}</Text>
            <Text style={styles.welcomeId}>Inspector ID: {MOCK_USER.inspectorId}</Text>
          </View>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 20 }}>👤</Text>
            <View style={styles.avatarDot} />
          </View>
        </View>

        {/* ── METRICS ROW ── */}
        <View style={styles.metricsCard}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>12</Text>
            <Text style={styles.metricLbl}>ASSIGNED</Text>
          </View>
          <View style={[styles.metricItem, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.metricVal, { color: Colors.red }]}>24</Text>
            <Text style={styles.metricLbl}>ISSUES</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { fontSize: 18 }]}>98%</Text>
            <Text style={styles.metricLbl}>SYNCED</Text>
          </View>
        </View>

        {/* ── AUDIT LIST ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Active Audits</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_AUDITS.map((audit) => {
          const tag = getStatusTag(audit.status);
          return (
            <TouchableOpacity
              key={audit.id}
              style={styles.auditCard}
              onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
            >
              {/* Card header */}
              <View style={styles.auditCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.auditType}>{audit.hospitalType}</Text>
                  <Text style={styles.auditName}>{audit.hospitalName}</Text>
                  <Text style={styles.auditLocation}>📍 {audit.location}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressWrap}>
                <View style={[styles.progressFill, { width: `${audit.progress}%` }]} />
              </View>

              {/* Footer */}
              <View style={styles.auditFooter}>
                <Text style={styles.footerText}>
                  {audit.lastSync ? `⏱ Last sync: ${audit.lastSync}` : 'Audit Progress'}
                </Text>
                <Text style={styles.footerLink}>
                  {audit.status === 'completed' ? 'View Report ›' : audit.status === 'in_progress' ? 'Continue ›' : `${audit.progress}%`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.tagline}>"Ensuring healthcare excellence across Morocco."</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.grayBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  offlineBadge: {
    backgroundColor: Colors.grayLight, borderWidth: 1,
    borderColor: Colors.grayBorder, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700', color: Colors.text2 },
  body: { flex: 1, padding: 16 },
  welcomeCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  welcomeSub: { fontSize: 13, color: Colors.text2, marginBottom: 2 },
  welcomeName: { fontSize: 20, fontWeight: '700', color: Colors.text },
  welcomeId: { fontSize: 12, color: Colors.green, fontWeight: '600', marginTop: 2 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.grayLight, borderWidth: 2,
    borderColor: Colors.grayBorder,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E', borderWidth: 1.5, borderColor: Colors.white,
  },
  metricsCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.grayBorder,
    flexDirection: 'row', padding: 16, gap: 10, marginBottom: 16,
  },
  metricItem: {
    flex: 1, backgroundColor: Colors.grayLight,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  metricVal: { fontSize: 22, fontWeight: '700', color: Colors.text },
  metricLbl: {
    fontSize: 10, fontWeight: '600', color: Colors.text2,
    letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase',
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  viewAll: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  auditCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 16, marginBottom: 12,
  },
  auditCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  auditType: { fontSize: 11, fontWeight: '600', color: Colors.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  auditName: { fontSize: 16, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  auditLocation: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  progressWrap: { height: 8, backgroundColor: Colors.grayBorder, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  auditFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footerText: { fontSize: 12, color: Colors.text2 },
  footerLink: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  tagline: { textAlign: 'center', fontSize: 13, color: Colors.text3, fontStyle: 'italic', marginTop: 8, paddingBottom: 8 },
});