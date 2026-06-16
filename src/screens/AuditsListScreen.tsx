import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { fetchAudits, Audit } from '../services/auditService';
import { mergeAuditStatuses } from '../services/auditStatusService';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AuditsListScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [audits, setAudits]     = useState<Audit[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(null);
      fetchAudits()
        .then(mergeAuditStatuses)
        .then((all) => setAudits(all.filter((a) => a.status === 'en cours' || a.status === 'brouillon')))
        .catch((err) => setError(err.message ?? 'Failed to load audits.'))
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View>
          <Text style={[styles.topBarLabel, { color: theme.text2 }]}>ACOMED</Text>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Active Audits</Text>
        </View>
        <Ionicons name="document-text-outline" size={20} color={theme.text2} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color="#C0392B" />
          <Text style={[styles.errorText, { color: '#C0392B' }]}>{error}</Text>
        </View>
      ) : audits.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="clipboard-outline" size={48} color={theme.text3} />
          <Text style={[styles.emptyText, { color: theme.text2 }]}>No audits in progress</Text>
        </View>
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {audits.map((audit) => (
            <TouchableOpacity
              key={audit.id}
              style={[styles.auditCard, { backgroundColor: theme.white, borderColor: theme.borderColor }]}
              onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
            >
              <Text style={[styles.auditFacility, { color: theme.text }]} numberOfLines={1}>{audit.facility}</Text>
              <View style={styles.auditMeta}>
                <Text style={[styles.auditRef, { color: theme.text2 }]}>{audit.ref}</Text>
                <View style={[styles.metaSep, { backgroundColor: theme.borderColor }]} />
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>IN PROGRESS</Text>
                </View>
              </View>
              <View style={styles.auditFooter}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={13} color={theme.text2} />
                  <Text style={[styles.dateText, { color: theme.text2 }]}>{formatDate(audit.date)}</Text>
                </View>
                <Text style={[styles.actionLink, { color: theme.text }]}>Continue ›</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#dde0e8',
  },
  topBarLabel: {
    fontSize: 11, fontWeight: '500', color: '#8a8f9e',
    letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 2,
  },
  topBarTitle: { fontSize: 22, fontWeight: '500', color: '#0d1b3e' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 14, color: '#8a8f9e', marginTop: 8 },

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  auditCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  auditFacility: { fontSize: 15, fontWeight: '600', color: '#0d1b3e' },
  auditMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  auditRef: { fontSize: 11, color: '#8a8f9e' },
  metaSep: { width: 1, height: 12, backgroundColor: '#dde0e8' },
  statusPill: {
    borderWidth: 1, borderColor: '#185fa5', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  statusPillText: { fontSize: 11, fontWeight: '600', color: '#185fa5' },
  auditFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 14,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#8a8f9e' },
  actionLink: { fontSize: 13, fontWeight: '600', color: '#0d1b3e' },
});
