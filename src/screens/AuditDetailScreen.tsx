import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_AUDITS } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

export default function AuditDetailScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { auditId } = route.params;
  const audit = MOCK_AUDITS.find(a => a.id === auditId) || MOCK_AUDITS[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Audit Detail</Text>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── HOSPITAL INFO CARD ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.hospitalRow}>
            <View style={[styles.hospitalIcon, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
              <Ionicons name="business-outline" size={26} color={Colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.levelTag}>
                <Text style={styles.levelTagText}>Level II Regional</Text>
              </View>
              <Text style={[styles.hospitalName, { color: theme.text }]}>{audit.hospitalName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Ionicons name="location-outline" size={12} color={theme.text2} />
                <Text style={[styles.hospitalLocation, { color: theme.text2 }]}>{audit.location}</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={[styles.infoCell, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
              <Text style={[styles.infoCellLabel, { color: theme.text3 }]}>CONTACT</Text>
              <Text style={[styles.infoCellValue, { color: theme.text }]}>+212 535-5211</Text>
            </View>
            <View style={[styles.infoCell, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
              <Text style={[styles.infoCellLabel, { color: theme.text3 }]}>UPDATED</Text>
              <Text style={[styles.infoCellValue, { color: theme.text }]}>Oct 24, 2024</Text>
            </View>
          </View>
        </View>

        {/* ── PROGRESS CARD ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Audit Progress</Text>
            <Text style={styles.progressPct}>{audit.progress}%</Text>
          </View>
          <View style={[styles.progressWrap, { backgroundColor: theme.borderColor }]}>
            <View style={[styles.progressFill, { width: `${audit.progress}%` as any }]} />
          </View>
          <View style={styles.progressFooter}>
            <View>
              <Text style={[styles.progressBig, { color: theme.text }]}>{audit.checkedItems} / {audit.totalItems}</Text>
              <Text style={[styles.progressSub, { color: theme.text2 }]}>Items Checked</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.progressBig, { color: theme.text }]}>In Progress</Text>
              <Text style={[styles.progressSub, { color: theme.text2 }]}>Status</Text>
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
              <View style={styles.issuesIcon}>
                <Ionicons name="warning" size={18} color={Colors.red} />
              </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="clipboard-outline" size={18} color={Colors.white} />
            <Text style={styles.btnPrimaryText}>Continue Checklist</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnOutline, { borderColor: Colors.green }]}
          onPress={() => navigation.navigate('Issues')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="warning-outline" size={16} color={Colors.green} />
            <Text style={styles.btnOutlineText}>Non-Conformities</Text>
          </View>
        </TouchableOpacity>

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
  backBtn: { fontSize: 28, lineHeight: 32 },
  topBarTitle: { fontSize: 17, fontWeight: '600' },
  offlineBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 14,
  },
  hospitalRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  hospitalIcon: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  levelTag: {
    backgroundColor: Colors.greenLight, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4,
  },
  levelTagText: { fontSize: 11, fontWeight: '600', color: Colors.greenDark },
  hospitalName: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  hospitalLocation: { fontSize: 12 },
  infoGrid: { flexDirection: 'row', gap: 8 },
  infoCell: {
    flex: 1, borderRadius: 10, padding: 10,
  },
  infoCellLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  infoCellValue: { fontSize: 13, fontWeight: '600' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: '600' },
  progressPct: { fontSize: 22, fontWeight: '700', color: Colors.green },
  progressWrap: { height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBig: { fontSize: 15, fontWeight: '700' },
  progressSub: { fontSize: 12 },
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
  issuesSub:   { fontSize: 12, color: Colors.red },
  btnPrimary: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  btnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5,
    borderRadius: 14,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnOutlineText: { color: Colors.green, fontSize: 15, fontWeight: '600' },
});