import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { fetchAudit, AuditDetail } from '../services/auditService';

function fmtScore(val: number | null): string {
  return val !== null && val !== undefined ? `${val}%` : '—';
}

export default function AuditDetailScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { auditId } = route.params as { auditId: string };

  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudit(auditId)
      .then(setAudit)
      .catch((err) => setError(err.message ?? 'Failed to load audit.'))
      .finally(() => setLoading(false));
  }, [auditId]);

  function getStatusTag(status: string) {
    if (status === 'in_progress') return { bg: Colors.greenLight, color: Colors.greenDark, label: 'In Progress' };
    if (status === 'completed')   return { bg: '#D1FAE5',         color: '#065F46',        label: 'Completed'   };
    if (status === 'assigned')    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Assigned' };
    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Pending' };
  }

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.red} />
          <Text style={[styles.errorText, { color: Colors.red }]}>{error}</Text>
        </View>
      ) : audit ? (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

          {/* ── FACILITY CARD ── */}
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <View style={styles.facilityRow}>
              <View style={[styles.facilityIcon, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                <Ionicons name="business-outline" size={26} color={Colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.refTag, { backgroundColor: Colors.greenLight }]}>
                  <Text style={styles.refTagText}>{audit.ref}</Text>
                </View>
                <Text style={[styles.facilityName, { color: theme.text }]}>{audit.facility_name || audit.facility}</Text>
                {(() => { const tag = getStatusTag(audit.status); return (
                  <View style={[styles.statusTag, { backgroundColor: tag.bg, marginTop: 4 }]}>
                    <Text style={[styles.statusTagText, { color: tag.color }]}>{tag.label}</Text>
                  </View>
                ); })()}
              </View>
            </View>
            <View style={styles.infoGrid}>
              <View style={[styles.infoCell, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                <Text style={[styles.infoCellLabel, { color: theme.text3 }]}>COMPLIANCE</Text>
                <Text style={[styles.infoCellValue, { color: theme.text }]}>{fmtScore(audit.compliance_score)}</Text>
              </View>
              <View style={[styles.infoCell, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                <Text style={[styles.infoCellLabel, { color: theme.text3 }]}>MATURITY</Text>
                <Text style={[styles.infoCellValue, { color: theme.text }]}>{fmtScore(audit.maturity_score)}</Text>
              </View>
            </View>
          </View>

          {/* ── INSPECTOR CARD ── */}
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <View style={styles.inspectorRow}>
              <View style={[styles.inspectorIcon, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                <Ionicons name="person-outline" size={18} color={Colors.green} />
              </View>
              <View>
                <Text style={[styles.inspectorLabel, { color: theme.text3 }]}>ASSIGNED INSPECTOR</Text>
                <Text style={[styles.inspectorName, { color: theme.text }]}>{audit.inspector || '—'}</Text>
              </View>
            </View>
            <View style={[styles.dateRow, { borderTopColor: theme.borderColor }]}>
              <Ionicons name="calendar-outline" size={14} color={theme.text3} />
              <Text style={[styles.dateText, { color: theme.text2 }]}>{audit.date}</Text>
            </View>
          </View>

          {/* ── ACTION BUTTONS ── */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Checklist', { auditId })}
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
      ) : null}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  body: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 14,
  },
  facilityRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  facilityIcon: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  refTag: {
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 4,
  },
  refTagText: { fontSize: 11, fontWeight: '700', color: Colors.green },
  facilityName: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  statusTag: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  statusTagText: { fontSize: 11, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: 8 },
  infoCell: { flex: 1, borderRadius: 10, padding: 10 },
  infoCellLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  infoCellValue: { fontSize: 18, fontWeight: '700' },
  inspectorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  inspectorIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  inspectorLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  inspectorName: { fontSize: 14, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderTopWidth: 1, paddingTop: 10,
  },
  dateText: { fontSize: 13 },
  btnPrimary: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  btnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5,
    borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnOutlineText: { color: Colors.green, fontSize: 15, fontWeight: '600' },
});
