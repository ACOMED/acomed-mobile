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
import { setLocalAuditStatus, getLocalAuditStatus } from '../services/auditStatusService';

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
      .then(async (fetched) => {
        const local = await getLocalAuditStatus(auditId);
        setAudit(local ? { ...fetched, status: local } : fetched);
      })
      .catch((err) => setError(err.message ?? 'Impossible de charger l\'audit.'))
      .finally(() => setLoading(false));
  }, [auditId]);

  function getStatusPill(status: string): { borderColor: string; color: string; label: string } {
    if (status === 'en cours')  return { borderColor: '#185fa5', color: '#185fa5', label: 'EN COURS'  };
    if (status === 'soumis')    return { borderColor: '#1A6B4A', color: '#1A6B4A', label: 'SOUMIS'    };
    if (status === 'cloture')   return { borderColor: '#8a8f9e', color: '#8a8f9e', label: 'CLÔTURÉ'   };
    if (status === 'planifie')  return { borderColor: '#7c3aed', color: '#7c3aed', label: 'PLANIFIÉ'  };
    return { borderColor: '#b45309', color: '#b45309', label: 'ASSIGNÉ' };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Détail de l'audit</Text>
        <View style={{ width: 28 }} />
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
          <View style={[styles.card, { backgroundColor: theme.white, borderColor: theme.borderColor }]}>
            <Text style={[styles.facilityName, { color: theme.text }]} numberOfLines={2}>
              {audit.facility_name || audit.facility}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.refText, { color: theme.text2 }]}>{audit.code}</Text>
              <View style={[styles.metaSep, { backgroundColor: theme.borderColor }]} />
              {(() => {
                const pill = getStatusPill(audit.status);
                return (
                  <View style={[styles.statusPill, { borderColor: pill.borderColor }]}>
                    <Text style={[styles.statusPillText, { color: pill.color }]}>{pill.label}</Text>
                  </View>
                );
              })()}
            </View>
          </View>

          {/* ── SCORES CARD ── */}
          <View style={[styles.card, { backgroundColor: theme.white, borderColor: theme.borderColor }]}>
            <View style={styles.scoresRow}>
              <View style={styles.scoreItem}>
                <View style={styles.scoreLabelRow}>
                  <Ionicons name="bar-chart-outline" size={13} color={theme.text2} />
                  <Text style={[styles.scoreLbl, { color: theme.text2 }]}>Conformité</Text>
                </View>
                <Text style={[styles.scoreVal, { color: theme.text }]}>{fmtScore(audit.compliance_score)}</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.borderColor }]} />
              <View style={styles.scoreItem}>
                <View style={styles.scoreLabelRow}>
                  <Ionicons name="trending-up-outline" size={13} color={theme.text2} />
                  <Text style={[styles.scoreLbl, { color: theme.text2 }]}>Maturité</Text>
                </View>
                <Text style={[styles.scoreVal, { color: theme.text }]}>{fmtScore(audit.maturity_score)}</Text>
              </View>
            </View>
          </View>

          {/* ── INSPECTOR CARD ── */}
          <View style={[styles.card, { backgroundColor: theme.white, borderColor: theme.borderColor }]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="person-outline" size={16} color={theme.text2} />
              </View>
              <View>
                <Text style={[styles.infoLbl, { color: theme.text2 }]}>Inspecteur</Text>
                <Text style={[styles.infoVal, { color: theme.text }]}>{audit.inspector_name || '—'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: 0.5, borderTopColor: theme.borderColor, paddingTop: 12, marginTop: 12 }]}>
              <View style={[styles.infoIconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="calendar-outline" size={16} color={theme.text2} />
              </View>
              <View>
                <Text style={[styles.infoLbl, { color: theme.text2 }]}>Date de visite</Text>
                <Text style={[styles.infoVal, { color: theme.text }]}>{audit.date ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* ── ACTION BUTTON ── */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={async () => {
              if (audit.status !== 'soumis' && audit.status !== 'cloture') {
                await setLocalAuditStatus(auditId, 'en cours');
              }
              navigation.navigate('Checklist', { auditId });
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="clipboard-outline" size={18} color="#ffffff" />
              <Text style={styles.btnPrimaryText}>
                {audit.status === 'soumis' || audit.status === 'cloture'
                  ? 'Voir les réponses ›'
                  : audit.status === 'brouillon'
                    ? 'Démarrer la checklist'
                    : 'Continuer la checklist'}
              </Text>
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

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtn: { fontSize: 28, lineHeight: 32, color: '#0d1b3e' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: '#0d1b3e' },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  body: { flex: 1, padding: 16 },

  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },

  // Facility card
  facilityName: { fontSize: 18, fontWeight: '600', color: '#0d1b3e', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refText: { fontSize: 11, color: '#8a8f9e' },
  metaSep: { width: 1, height: 12, backgroundColor: '#dde0e8' },
  statusPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600' },

  // Scores card
  scoresRow: { flexDirection: 'row', alignItems: 'center' },
  scoreItem: { flex: 1, alignItems: 'center' },
  scoreLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  scoreLbl: { fontSize: 11, color: '#8a8f9e' },
  scoreVal: { fontSize: 28, fontWeight: '600', color: '#0d1b3e' },
  scoreDivider: { width: 1, height: 40, backgroundColor: '#dde0e8', marginHorizontal: 4 },

  // Inspector card
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f5f6f9', alignItems: 'center', justifyContent: 'center',
  },
  infoLbl: { fontSize: 12, color: '#8a8f9e' },
  infoVal: { fontSize: 14, fontWeight: '500', color: '#0d1b3e', marginTop: 1 },

  // Action button
  btnPrimary: {
    backgroundColor: '#0d1b3e', borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
