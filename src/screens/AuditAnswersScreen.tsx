import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { fetchAudit, AuditDetail } from '../services/auditService';

function fmtScore(val: number | null | undefined): string {
  return val !== null && val !== undefined ? `${val}%` : '—';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type AnswerKind = 'pass' | 'fail' | 'na' | 'other';

function classifyAnswer(value: string | null | undefined): AnswerKind {
  if (!value) return 'other';
  const v = value.toLowerCase();
  if (v === 'pass') return 'pass';
  if (v === 'fail') return 'fail';
  if (v === 'na' || v === 'n/a') return 'na';
  return 'other';
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export default function AuditAnswersScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { auditId } = route.params as { auditId: string };

  const [audit, setAudit]     = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchAudit(auditId)
      .then(setAudit)
      .catch((err) => setError(err.message ?? 'Failed to load audit.'))
      .finally(() => setLoading(false));
  }, [auditId]);

  const responses = audit?.responses ?? [];
  const total  = responses.length;
  const passed = responses.filter((r) => (r.answer_value ?? '').toLowerCase() === 'pass').length;
  const failed = responses.filter((r) => (r.answer_value ?? '').toLowerCase() === 'fail').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Audit Report</Text>
        <View style={{ width: 28 }} />
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
      ) : audit ? (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

          {/* ── FACILITY CARD ── */}
          <View style={styles.card}>
            <Text style={styles.facilityName} numberOfLines={2}>
              {audit.facility_name || audit.facility}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.refText}>{audit.code}</Text>
              <View style={styles.metaSep} />
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color="#8a8f9e" />
                <Text style={styles.dateText}>{audit.date ? formatDate(audit.date) : '—'}</Text>
              </View>
            </View>
            <View style={styles.submittedPill}>
              <Text style={styles.submittedPillText}>SUBMITTED</Text>
            </View>
          </View>

          {/* ── SCORES ROW ── */}
          <View style={styles.scoresRow}>
            <View style={[styles.card, styles.scoreCard]}>
              <Text style={styles.scoreLbl}>Compliance</Text>
              <Text style={styles.scoreVal}>{fmtScore(audit.compliance_score)}</Text>
              <Text style={styles.scoreSub}>Pending calculation</Text>
            </View>
            <View style={[styles.card, styles.scoreCard]}>
              <Text style={styles.scoreLbl}>Maturity</Text>
              <Text style={styles.scoreVal}>{fmtScore(audit.maturity_score)}</Text>
              <Text style={styles.scoreSub}>Pending calculation</Text>
            </View>
          </View>

          {/* ── SUMMARY CARD ── */}
          <View style={styles.card}>
            <Text style={styles.summaryTitle}>Audit Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{total}</Text>
                <Text style={styles.summaryLbl}>Total Questions</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{passed}</Text>
                <Text style={styles.summaryLbl}>Passed</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{failed}</Text>
                <Text style={styles.summaryLbl}>Failed</Text>
              </View>
            </View>
          </View>

          {/* ── ANSWERS ── */}
          <Text style={styles.sectionHeader}>Answers</Text>
          {responses.length === 0 ? (
            <Text style={styles.emptyAnswers}>No answers recorded.</Text>
          ) : (
            responses.map((r) => {
              const kind = classifyAnswer(r.answer_value);
              return (
                <View key={r.id} style={styles.answerCard}>
                  <Text style={styles.answerQuestion} numberOfLines={3}>
                    {r.question_text || r.question_id}
                  </Text>
                  {kind === 'pass' && (
                    <View style={[styles.answerPill, { backgroundColor: '#1A6B4A' }]}>
                      <Text style={styles.answerPillText}>PASS</Text>
                    </View>
                  )}
                  {kind === 'fail' && (
                    <View style={[styles.answerPill, { backgroundColor: '#C0392B' }]}>
                      <Text style={styles.answerPillText}>FAIL</Text>
                    </View>
                  )}
                  {kind === 'na' && (
                    <View style={[styles.answerPill, { backgroundColor: '#94A3B8' }]}>
                      <Text style={styles.answerPillText}>N/A</Text>
                    </View>
                  )}
                  {kind === 'other' && (
                    <View style={styles.answerPillOutline}>
                      <Text style={styles.answerPillOutlineText} numberOfLines={1}>
                        {truncate(r.answer_value ?? '—', 30)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: 80 }} />
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
    borderBottomWidth: 0.5, borderBottomColor: '#dde0e8',
  },
  backBtn: { fontSize: 28, lineHeight: 32, color: '#0d1b3e' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: '#0d1b3e' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },

  body: { flex: 1, padding: 16 },

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },

  // Facility
  facilityName: { fontSize: 18, fontWeight: '600', color: '#0d1b3e', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  refText: { fontSize: 11, color: '#8a8f9e' },
  metaSep: { width: 1, height: 12, backgroundColor: '#dde0e8' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#8a8f9e' },
  submittedPill: {
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#1A6B4A', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  submittedPillText: { fontSize: 11, fontWeight: '600', color: '#1A6B4A' },

  // Scores
  scoresRow: { flexDirection: 'row', gap: 10 },
  scoreCard: { flex: 1, alignItems: 'center' },
  scoreLbl: { fontSize: 11, color: '#8a8f9e', marginBottom: 6 },
  scoreVal: { fontSize: 28, fontWeight: '600', color: '#0d1b3e' },
  scoreSub: { fontSize: 11, color: '#8a8f9e', marginTop: 3 },

  // Summary
  summaryTitle: { fontSize: 14, fontWeight: '600', color: '#0d1b3e', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 24, fontWeight: '600', color: '#0d1b3e' },
  summaryLbl: { fontSize: 11, color: '#8a8f9e', marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#dde0e8' },

  // Answers list
  sectionHeader: {
    fontSize: 13, fontWeight: '600', color: '#8a8f9e',
    letterSpacing: 0.07, textTransform: 'uppercase',
    paddingHorizontal: 4, marginTop: 4, marginBottom: 10,
  },
  emptyAnswers: { fontSize: 13, color: '#8a8f9e', textAlign: 'center', padding: 20 },
  answerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5, borderColor: '#dde0e8',
    borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  answerQuestion: { flex: 1, fontSize: 13, lineHeight: 18, color: '#0d1b3e' },
  answerPill: {
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  answerPillText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  answerPillOutline: {
    borderWidth: 1, borderColor: '#0d1b3e', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, maxWidth: 180,
  },
  answerPillOutlineText: { fontSize: 11, fontWeight: '600', color: '#0d1b3e' },
});
