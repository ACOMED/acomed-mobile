import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { getUser, AuthUser } from '../services/authService';
import { fetchAudits, Audit } from '../services/auditService';
import { mergeAuditStatuses } from '../services/auditStatusService';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => { getUser().then(setUser); }, []);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoadingAudits(true);
      setFetchError(null);
      fetchAudits()
        .then(mergeAuditStatuses)
        .then((all) => setAudits(all.filter((a) => a.status === 'brouillon' || a.status === 'en cours')))
        .catch((err) => setFetchError(err.message ?? 'Failed to load audits.'))
        .finally(() => setLoadingAudits(false));
    }, [])
  );

  function getActionLabel(status: string): string {
    if (status === 'en cours')                              return 'Continue ›';
    if (status === 'soumis' || status === 'cloture' || status === 'planifie') return 'View ›';
    return 'Start Audit ›';
  }

  function getStatusPill(status: string): { borderColor: string; color: string; label: string } {
    if (status === 'en cours')  return { borderColor: '#185fa5', color: '#185fa5', label: 'IN PROGRESS' };
    if (status === 'soumis')    return { borderColor: '#1A6B4A', color: '#1A6B4A', label: 'SUBMITTED'   };
    if (status === 'cloture')   return { borderColor: '#8a8f9e', color: '#8a8f9e', label: 'CLOSED'      };
    if (status === 'planifie')  return { borderColor: '#7c3aed', color: '#7c3aed', label: 'PLANNED'     };
    return { borderColor: '#b45309', color: '#b45309', label: 'ASSIGNED' };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: '#dde0e8' }]}>
        <View>
          <Text style={[styles.greetingSub, { color: theme.text2 }]}>Good morning,</Text>
          <Text style={styles.greetingName}>{user?.full_name || '—'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#0d1b3e" />
        </TouchableOpacity>
      </View>

      {/* ── STATS ROW ── */}
      <View style={[styles.statsRow, { backgroundColor: theme.white, borderBottomColor: '#dde0e8' }]}>
        <View style={styles.statItem}>
          <View style={[styles.statAccent, { backgroundColor: '#185fa5' }]} />
          <View>
            <Text style={styles.statNumber}>{audits.length}</Text>
            <Text style={styles.statLabel}>Audits Assigned</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statAccent, { backgroundColor: '#b45309' }]} />
          <View>
            <Text style={styles.statNumber}>{audits.filter(a => a.status === 'en cours').length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statAccent, { backgroundColor: '#1A6B4A' }]} />
          <View>
            <Text style={styles.statNumber}>{audits.filter(a => a.status === 'soumis').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── SECTION HEADER ── */}
        <Text style={styles.sectionHeader}>Active Audits</Text>

        {loadingAudits ? (
          <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 32 }} />
        ) : fetchError ? (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.red} />
            <Text style={[styles.errorText, { color: Colors.red }]}>{fetchError}</Text>
          </View>
        ) : audits.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text2 }]}>No audits assigned.</Text>
        ) : (
          audits.map((audit) => {
            const pill = getStatusPill(audit.status);
            return (
              <TouchableOpacity
                key={audit.id}
                style={styles.auditCard}
                onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
              >
                <Text style={styles.auditFacility} numberOfLines={1}>{audit.facility}</Text>
                <View style={styles.auditMeta}>
                  <Text style={styles.auditRef}>{audit.ref}</Text>
                  <View style={styles.metaSep} />
                  <View style={[styles.statusPill, { borderColor: pill.borderColor }]}>
                    <Text style={[styles.statusPillText, { color: pill.color }]}>{pill.label}</Text>
                  </View>
                </View>
                <View style={styles.auditFooter}>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color="#8a8f9e" />
                    <Text style={styles.dateText}>{formatDate(audit.date)}</Text>
                  </View>
                  <Text style={styles.actionLink}>{getActionLabel(audit.status)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  greetingSub: { fontSize: 13 },
  greetingName: { fontSize: 20, fontWeight: '600', color: '#0d1b3e' },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 0.5,
    marginBottom: 16,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statAccent: { width: 3, height: 28, borderRadius: 2 },
  statNumber: { fontSize: 28, fontWeight: '600', color: '#0d1b3e' },
  statLabel: { fontSize: 12, color: '#8a8f9e', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: '#dde0e8', marginHorizontal: 4 },

  // Body
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 0 },

  // Section header
  sectionHeader: {
    fontSize: 13, fontWeight: '600', color: '#8a8f9e',
    letterSpacing: 0.07, textTransform: 'uppercase',
    paddingHorizontal: 4, marginBottom: 12,
  },

  // Audit card
  auditCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 14,
    padding: 16, marginBottom: 12,
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  auditFacility: { fontSize: 15, fontWeight: '600', color: '#0d1b3e', flex: 1 },
  auditMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  auditRef: { fontSize: 11, color: '#8a8f9e' },
  metaSep: { width: 1, height: 12, backgroundColor: '#dde0e8' },
  statusPill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  auditFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 14,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#8a8f9e' },
  actionLink: { fontSize: 13, fontWeight: '600', color: '#0d1b3e' },

  // Error / empty
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12,
  },
  errorText: { fontSize: 13, flex: 1 },
  emptyText: { textAlign: 'center', fontSize: 14, marginTop: 32 },
});
