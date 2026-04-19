import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MOCK_AUDITS } from '../mocks/data';

export default function AuditDetailScreen({ route, navigation }: any) {
  // route.params carries what was passed from the previous screen
  const { auditId } = route.params;
  const audit = MOCK_AUDITS.find(a => a.id === auditId) || MOCK_AUDITS[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Audit Detail</Text>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── HOSPITAL INFO CARD ── */}
        <View style={styles.card}>
          <View style={styles.hospitalRow}>
            <View style={styles.hospitalIcon}><Text style={{ fontSize: 24 }}>🏥</Text></View>
            <View style={{ flex: 1 }}>
              <View style={styles.levelTag}>
                <Text style={styles.levelTagText}>Level II Regional</Text>
              </View>
              <Text style={styles.hospitalName}>{audit.hospitalName}</Text>
              <Text style={styles.hospitalLocation}>📍 {audit.location}</Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>CONTACT</Text>
              <Text style={styles.infoCellValue}>+212 535-5211</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>UPDATED</Text>
              <Text style={styles.infoCellValue}>Oct 24, 2024</Text>
            </View>
          </View>
        </View>

        {/* ── PROGRESS CARD ── */}
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>⏱ Audit Progress</Text>
            <Text style={styles.progressPct}>{audit.progress}%</Text>
          </View>
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${audit.progress}%` as any }]} />
          </View>
          <View style={styles.progressFooter}>
            <View>
              <Text style={styles.progressBig}>{audit.checkedItems} / {audit.totalItems}</Text>
              <Text style={styles.progressSub}>Items Checked</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.progressBig}>In Progress</Text>
              <Text style={styles.progressSub}>Status</Text>
            </View>
          </View>
        </View>

        {/* ── ISSUES BANNER ── */}
        {audit.issuesCount > 0 && (
          <TouchableOpacity
            style={styles.issuesBanner}
            onPress={() => navigation.navigate('Issues')}
          >
            <View style={styles.issuesLeft}>
              <View style={styles.issuesIcon}><Text>⚠️</Text></View>
              <View>
                <Text style={styles.issuesTitle}>Issues Detected</Text>
                <Text style={styles.issuesSub}>{audit.issuesCount} non-conformities found</Text>
              </View>
            </View>
            <Text style={{ color: Colors.red, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── ACTION BUTTONS ── */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Checklist', { auditId: audit.id })}
        >
          <Text style={styles.btnPrimaryText}>📋 Continue Checklist ›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('Issues')}
        >
          <Text style={styles.btnOutlineText}>⚠ Non-Conformities ›</Text>
        </TouchableOpacity>

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
  backBtn: { fontSize: 28, color: Colors.text, lineHeight: 32 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  offlineBadge: {
    backgroundColor: Colors.grayLight, borderWidth: 1,
    borderColor: Colors.grayBorder, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700', color: Colors.text2 },
  body: { flex: 1, padding: 16 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 16, marginBottom: 14,
  },
  hospitalRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  hospitalIcon: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  levelTag: {
    backgroundColor: Colors.greenLight, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4,
  },
  levelTagText: { fontSize: 11, fontWeight: '600', color: Colors.greenDark },
  hospitalName: { fontSize: 18, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  hospitalLocation: { fontSize: 12, color: Colors.text2, marginTop: 3 },
  infoGrid: { flexDirection: 'row', gap: 8 },
  infoCell: {
    flex: 1, backgroundColor: Colors.grayLight,
    borderRadius: 10, padding: 10,
  },
  infoCellLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3, letterSpacing: 0.5, marginBottom: 2 },
  infoCellValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  progressPct: { fontSize: 22, fontWeight: '700', color: Colors.green },
  progressWrap: { height: 10, backgroundColor: Colors.grayBorder, borderRadius: 99, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBig: { fontSize: 15, fontWeight: '700', color: Colors.text },
  progressSub: { fontSize: 12, color: Colors.text2 },
  issuesBanner: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  issuesLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  issuesIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
  },
  issuesTitle: { fontSize: 14, fontWeight: '700', color: Colors.red },
  issuesSub: { fontSize: 12, color: '#EF4444' },
  btnPrimary: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  btnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5,
    borderColor: Colors.green, borderRadius: 14,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnOutlineText: { color: Colors.green, fontSize: 15, fontWeight: '600' },
});