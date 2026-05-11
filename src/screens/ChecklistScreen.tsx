import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { fetchAudit, fetchTemplate, Question } from '../services/auditService';
import { saveAnswer } from '../services/syncService';

const FALLBACK_TEMPLATE_ID = 'e3226ae3-29a9-470c-b052-d3d91fc6609a';

export default function ChecklistScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { auditId } = route.params as { auditId: string };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      let audit;
      try {
        audit = await fetchAudit(auditId);
      } catch (e) {
        setError('Failed to load audit. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[DEBUG] audit object:', JSON.stringify(audit));

      const initial: Record<string, string> = {};
      audit.responses?.forEach((a: any) => { initial[a.question_id] = a.answer_value; });
      setResponses(initial);

      try {
        const templateId = audit.template_id ?? FALLBACK_TEMPLATE_ID;
        const template = await fetchTemplate(templateId);
        console.log('[DEBUG] template questions count:', template.schema.questions.length);
        console.log('[DEBUG] questions:', JSON.stringify(template.schema.questions));
        setQuestions(template.schema.questions);
      } catch (e) {
        setError('Failed to load checklist questions. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[DEBUG] template_id value:', audit.template_id);

      setLoading(false);
    }
    load();
  }, [auditId]);

  function isBlocked(q: Question): boolean {
    if (!q.parent_question_id || !q.prerequisite_condition) return false;
    const parentValue = responses[q.parent_question_id];
    if (q.prerequisite_condition === 'EQUALS_YES') return parentValue !== 'pass';
    if (q.prerequisite_condition === 'EQUALS_NO')  return parentValue !== 'fail';
    return false;
  }

  async function handleAnswer(questionId: string, value: string) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    await saveAnswer(auditId, questionId, value);
  }

  const applicable = questions.filter((q) => !isBlocked(q));
  const answered   = applicable.filter((q) => responses[q.question_id]);
  const progress   = applicable.length > 0 ? Math.round((answered.length / applicable.length) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Checklist</Text>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={[styles.progressContainer, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={[styles.progressWrap, { backgroundColor: theme.borderColor }]}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <Text style={[styles.progressLabel, { color: theme.text2 }]}>{answered.length}/{applicable.length} items • {progress}%</Text>
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
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {questions.map((q) => {
            const blocked = isBlocked(q);
            const cur = responses[q.question_id];

            let circleIconName: any = 'ellipse-outline';
            let circleIconColor = theme.text3;
            if (cur === 'pass') { circleIconName = 'checkmark'; circleIconColor = Colors.green; }
            if (cur === 'fail') { circleIconName = 'close';     circleIconColor = Colors.red;   }
            if (cur === 'na')   { circleIconName = 'remove';    circleIconColor = '#94A3B8';    }

            return (
              <View
                key={q.question_id}
                style={[
                  styles.questionCard,
                  { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
                  blocked && styles.questionCardBlocked,
                ]}
              >
                <View style={styles.qHeader}>
                  <View style={styles.qHeaderLeft}>
                    <View style={styles.qCodeBadge}>
                      <Text style={styles.qCodeText}>{q.question_id}</Text>
                    </View>
                    {blocked ? (
                      <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <Text style={[styles.tagText, { color: '#64748B' }]}>Blocked</Text>
                      </View>
                    ) : cur === 'pass' ? (
                      <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
                        <Text style={[styles.tagText, { color: Colors.greenDark }]}>Pass</Text>
                      </View>
                    ) : cur === 'fail' ? (
                      <View style={[styles.tag, { backgroundColor: Colors.redLight }]}>
                        <Text style={[styles.tagText, { color: Colors.red }]}>Fail</Text>
                      </View>
                    ) : cur === 'na' ? (
                      <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <Text style={[styles.tagText, { color: '#475569' }]}>N/A</Text>
                      </View>
                    ) : (
                      <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
                        <Text style={[styles.tagText, { color: isDark ? '#94A3B8' : Colors.gray }]}>Pending</Text>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.circleIndicator,
                    { borderColor: theme.borderColor },
                    cur === 'pass' && styles.circlePass,
                    cur === 'fail' && styles.circleFail,
                    cur === 'na'   && styles.circleNa,
                    blocked && { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight },
                  ]}>
                    <Ionicons name={circleIconName} size={14} color={circleIconColor} />
                  </View>
                </View>

                <Text style={[styles.qText, { color: blocked ? theme.text3 : theme.text }]}>
                  {blocked ? 'Blocked — prerequisite not met' : q.label}
                </Text>

                {q.type === 'booleanNode' && !blocked && (
                  <View style={styles.answerBtnRow}>
                    <TouchableOpacity
                      style={[styles.answerBtn, cur === 'pass' ? styles.answerBtnPassActive : { borderColor: Colors.green }]}
                      onPress={() => handleAnswer(q.question_id, 'pass')}
                    >
                      <Text style={[styles.answerBtnText, { color: cur === 'pass' ? Colors.greenDark : Colors.green }]}>Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.answerBtn, cur === 'fail' ? styles.answerBtnFailActive : { borderColor: Colors.red }]}
                      onPress={() => handleAnswer(q.question_id, 'fail')}
                    >
                      <Text style={[styles.answerBtnText, { color: cur === 'fail' ? Colors.red : Colors.red }]}>Fail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.answerBtn, cur === 'na' ? styles.answerBtnNaActive : { borderColor: '#94A3B8' }]}
                      onPress={() => handleAnswer(q.question_id, 'na')}
                    >
                      <Text style={[styles.answerBtnText, { color: '#64748B' }]}>N/A</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <Text style={[styles.endLabel, { color: theme.text3 }]}>END OF CHECKLIST</Text>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* ── BOTTOM FINISH BUTTON ── */}
      {!loading && !error && (
        <View style={[styles.bottomBar, { backgroundColor: theme.white, borderTopColor: theme.borderColor }]}>
          <TouchableOpacity style={styles.btnFinish}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
              <Text style={styles.btnFinishText}>Terminer la visite</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.savedLabel, { color: theme.text3 }]}>Enregistrer localement • Dernière sauvegarde: il y a 2 min</Text>
        </View>
      )}
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
  progressContainer: { padding: 12, borderBottomWidth: 1 },
  progressWrap: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressLabel: { fontSize: 12, textAlign: 'right' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  body: { flex: 1, padding: 16 },
  questionCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  questionCardBlocked: { opacity: 0.5 },
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  qHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  qCodeBadge: {
    backgroundColor: Colors.greenLight, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  qCodeText: { fontSize: 11, fontWeight: '700', color: Colors.green },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  circleIndicator: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  circlePass: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  circleFail: { borderColor: Colors.red, backgroundColor: Colors.redLight },
  circleNa: { borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },
  qText: { fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 6 },
  answerBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  answerBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1.5,
    paddingVertical: 8, alignItems: 'center',
  },
  answerBtnPassActive: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  answerBtnFailActive: { backgroundColor: Colors.redLight,   borderColor: Colors.red   },
  answerBtnNaActive:   { backgroundColor: '#F1F5F9',         borderColor: '#94A3B8'    },
  answerBtnText: { fontSize: 13, fontWeight: '600' },
  endLabel: { textAlign: 'center', fontSize: 11, padding: 12 },
  bottomBar: { borderTopWidth: 1, padding: 12 },
  btnFinish: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnFinishText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, marginTop: 6, marginBottom: 4 },
});
