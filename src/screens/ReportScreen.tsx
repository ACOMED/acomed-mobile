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

export default function ReportScreen({ navigation }: any) {
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
        .then((all) => setAudits(all.filter((a) => a.status === 'soumis')))
        .catch((err) => setError(err.message ?? 'Failed to load reports.'))
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white }]}>
        <View>
          <Text style={styles.topBarLabel}>ACOMED</Text>
          <Text style={styles.topBarTitle}>Reports</Text>
        </View>
        <Ionicons name="bar-chart-outline" size={20} color="#8a8f9e" />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0d1b3e" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color="#C0392B" />
          <Text style={[styles.errorText, { color: '#C0392B' }]}>{error}</Text>
        </View>
      ) : audits.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={48} color="#c0c4d0" />
          <Text style={styles.emptyText}>No submitted audits yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Submitted Audits</Text>
          {audits.map((audit) => (
            <TouchableOpacity
              key={audit.id}
              style={styles.auditCard}
              onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.facilityName} numberOfLines={1}>{audit.facility}</Text>
                <View style={styles.submittedPill}>
                  <Text style={styles.submittedPillText}>SUBMITTED</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.refText}>{audit.ref}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={12} color="#8a8f9e" />
                  <Text style={styles.dateText}>{formatDate(audit.date)}</Text>
                </View>
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

  sectionHeader: {
    fontSize: 13, fontWeight: '600', color: '#8a8f9e',
    letterSpacing: 0.07, textTransform: 'uppercase',
    paddingHorizontal: 4, marginBottom: 12,
  },

  auditCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  facilityName: { fontSize: 15, fontWeight: '600', color: '#0d1b3e', flex: 1, marginRight: 8 },
  submittedPill: {
    borderWidth: 1, borderColor: '#1A6B4A', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  submittedPillText: { fontSize: 11, fontWeight: '600', color: '#1A6B4A' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refText: { fontSize: 11, color: '#8a8f9e' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#8a8f9e' },
});
