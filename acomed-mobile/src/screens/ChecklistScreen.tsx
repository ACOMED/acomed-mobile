import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MOCK_QUESTIONS } from '../mocks/data';

// ─── KEY CONCEPT: Conditional Logic ──────────────────────────────────────────
// Each question has a `prerequisiteId`. If that ID exists, we check whether
// the prerequisite question has been answered with 'pass'. If not — the
// question is BLOCKED (shown as non-evaluable, grayed out).
// This is the core engine from the PRD Section 9.6.
// ─────────────────────────────────────────────────────────────────────────────

export default function ChecklistScreen({ route, navigation }: any) {
  // responses stores the current answers: { questionId: 'pass' | 'fail' | 'na' }
  const [responses, setResponses] = useState<Record<string, string>>({
    'hyg-01': 'pass',
    'hyg-02': 'fail',
    'eqp-02': 'pass',
    'adm-01': 'na',
  });

  // Check if a question is blocked by its prerequisite
  function isBlocked(question: typeof MOCK_QUESTIONS[0]): boolean {
    if (!question.prerequisiteId) return false;
    const prereqAnswer = responses[question.prerequisiteId];
    // Blocked if prerequisite hasn't been answered with 'pass'
    return prereqAnswer !== 'pass';
  }

  // Set a response for a question
  function setResponse(questionId: string, value: string) {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  }

  // Group questions by section
  const sections = [...new Set(MOCK_QUESTIONS.map(q => q.sectionLabel))];

  // Calculate progress
  const applicable = MOCK_QUESTIONS.filter(q => !isBlocked(q));
  const answered = applicable.filter(q => responses[q.id]);
  const progress = applicable.length > 0 ? Math.round((answered.length / applicable.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checklist</Text>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      {/* ── PROGRESS MINI BAR ── */}
      <View style={styles.progressContainer}>
        <View style={styles.progressWrap}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>{answered.length}/{applicable.length} items • {progress}%</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {sections.map(sectionLabel => {
          const sectionQuestions = MOCK_QUESTIONS.filter(q => q.sectionLabel === sectionLabel);
          return (
            <View key={sectionLabel}>
              {/* Section header */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>{sectionLabel}</Text>
              </View>

              {sectionQuestions.map(q => {
                const blocked = isBlocked(q);
                const currentResponse = responses[q.id];

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[styles.questionCard, blocked && styles.questionCardBlocked]}
                    onPress={() => !blocked && navigation.navigate('ItemDetail', { questionId: q.id })}
                    disabled={blocked}
                  >
                    {/* Header row */}
                    <View style={styles.qHeader}>
                      <View style={styles.qHeaderLeft}>
                        <View style={styles.qCodeBadge}>
                          <Text style={styles.qCodeText}>{q.code}</Text>
                        </View>
                        {/* Status tag */}
                        {blocked ? (
                          <View style={[styles.tag, { backgroundColor: '#F1F5F9' }]}>
                            <Text style={[styles.tagText, { color: '#64748B' }]}>Blocked</Text>
                          </View>
                        ) : currentResponse === 'pass' ? (
                          <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
                            <Text style={[styles.tagText, { color: Colors.greenDark }]}>Pass</Text>
                          </View>
                        ) : currentResponse === 'fail' ? (
                          <View style={[styles.tag, { backgroundColor: Colors.redLight }]}>
                            <Text style={[styles.tagText, { color: Colors.red }]}>Fail</Text>
                          </View>
                        ) : currentResponse === 'na' ? (
                          <View style={[styles.tag, { backgroundColor: '#F1F5F9' }]}>
                            <Text style={[styles.tagText, { color: '#475569' }]}>N/A</Text>
                          </View>
                        ) : (
                          <View style={[styles.tag, { backgroundColor: Colors.grayLight }]}>
                            <Text style={[styles.tagText, { color: Colors.gray }]}>Pending</Text>
                          </View>
                        )}
                      </View>
                      {/* Circle indicator */}
                      <View style={[
                        styles.circleIndicator,
                        currentResponse === 'pass' && styles.circlePass,
                        currentResponse === 'fail' && styles.circleFail,
                        currentResponse === 'na' && styles.circleNa,
                        blocked && styles.circleBlocked,
                      ]}>
                        <Text style={{ fontSize: 14, color: currentResponse === 'pass' ? Colors.green : currentResponse === 'fail' ? Colors.red : Colors.text3 }}>
                          {currentResponse === 'pass' ? '✓' : currentResponse === 'fail' ? '✗' : currentResponse === 'na' ? '−' : '○'}
                        </Text>
                      </View>
                    </View>

                    {/* Question text */}
                    <Text style={[styles.qText, blocked && { color: Colors.text3 }]}>
                      {blocked ? '⛔ Blocked — prerequisite not met' : q.text}
                    </Text>

                    {/* Meta row */}
                    <View style={styles.qMeta}>
                      <Text style={styles.qMetaText}>
                        {q.hasPhoto ? '📷 Photo' : '📷 No Photo'}
                      </Text>
                      <Text style={styles.qMetaText}>
                        {q.hasNote ? '📄 Note' : '📄 No Note'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <Text style={styles.endLabel}>END OF CHECKLIST</Text>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── BOTTOM FINISH BUTTON ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnFinish}>
          <Text style={styles.btnFinishText}>✓ Terminer la visite</Text>
        </TouchableOpacity>
        <Text style={styles.savedLabel}>💾 Enregistrer localement • Dernière sauvegarde: il y a 2 min</Text>
      </View>
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
  progressContainer: {
    backgroundColor: Colors.white, padding: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.grayBorder,
  },
  progressWrap: { height: 6, backgroundColor: Colors.grayBorder, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressLabel: { fontSize: 12, color: Colors.text2, textAlign: 'right' },
  body: { flex: 1, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 8 },
  sectionLine: { width: 18, height: 3, backgroundColor: Colors.green, borderRadius: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text2, letterSpacing: 0.7, textTransform: 'uppercase' },
  questionCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 14, marginBottom: 10,
  },
  questionCardBlocked: { opacity: 0.5 },
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  qHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qCodeBadge: {
    backgroundColor: Colors.greenLight, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  qCodeText: { fontSize: 11, fontWeight: '700', color: Colors.green },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  circleIndicator: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.grayBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  circlePass: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  circleFail: { borderColor: Colors.red, backgroundColor: Colors.redLight },
  circleNa: { borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },
  circleBlocked: { borderColor: Colors.grayBorder, backgroundColor: Colors.grayLight },
  qText: { fontSize: 14, color: Colors.text, lineHeight: 20, marginTop: 8, marginBottom: 6 },
  qMeta: { flexDirection: 'row', gap: 10 },
  qMetaText: { fontSize: 11, color: Colors.text3 },
  endLabel: { textAlign: 'center', fontSize: 11, color: Colors.text3, padding: 12 },
  bottomBar: {
    backgroundColor: Colors.white, borderTopWidth: 1,
    borderTopColor: Colors.grayBorder, padding: 12,
  },
  btnFinish: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnFinishText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, color: Colors.text3, marginTop: 6, marginBottom: 4 },
});