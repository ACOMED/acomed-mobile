import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_QUESTIONS } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

export default function ChecklistScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [responses, setResponses] = useState<Record<string, string>>({
    'hyg-01': 'pass',
    'hyg-02': 'fail',
    'eqp-02': 'pass',
    'adm-01': 'na',
  });

  function isBlocked(question: typeof MOCK_QUESTIONS[0]): boolean {
    if (!question.prerequisiteId) return false;
    return responses[question.prerequisiteId] !== 'pass';
  }

  function setResponse(questionId: string, value: string) {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  }

  const sections = [...new Set(MOCK_QUESTIONS.map(q => q.sectionLabel))];
  const applicable = MOCK_QUESTIONS.filter(q => !isBlocked(q));
  const answered = applicable.filter(q => responses[q.id]);
  const progress = applicable.length > 0 ? Math.round((answered.length / applicable.length) * 100) : 0;

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

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {sections.map(sectionLabel => {
          const sectionQuestions = MOCK_QUESTIONS.filter(q => q.sectionLabel === sectionLabel);
          return (
            <View key={sectionLabel}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={[styles.sectionLabel, { color: theme.text2 }]}>{sectionLabel}</Text>
              </View>

              {sectionQuestions.map(q => {
                const blocked = isBlocked(q);
                const cur = responses[q.id];

                // Pick name for the circle indicator
                let circleIconName: any = 'ellipse-outline';
                let circleIconColor = theme.text3;
                if (cur === 'pass')  { circleIconName = 'checkmark'; circleIconColor = Colors.green; }
                if (cur === 'fail')  { circleIconName = 'close';     circleIconColor = Colors.red; }
                if (cur === 'na')    { circleIconName = 'remove';    circleIconColor = '#94A3B8'; }

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.questionCard,
                      { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
                      blocked && styles.questionCardBlocked,
                    ]}
                    onPress={() => !blocked && navigation.navigate('ItemDetail', { questionId: q.id })}
                    disabled={blocked}
                  >
                    <View style={styles.qHeader}>
                      <View style={styles.qHeaderLeft}>
                        <View style={styles.qCodeBadge}>
                          <Text style={styles.qCodeText}>{q.code}</Text>
                        </View>
                        {/* Status tag */}
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
                      {/* Circle indicator */}
                      <View style={[
                        styles.circleIndicator,
                        { borderColor: theme.borderColor },
                        cur === 'pass' && styles.circlePass,
                        cur === 'fail' && styles.circleFail,
                        cur === 'na'   && styles.circleNa,
                        blocked        && { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight },
                      ]}>
                        <Ionicons name={circleIconName} size={14} color={circleIconColor} />
                      </View>
                    </View>

                    <Text style={[styles.qText, { color: blocked ? theme.text3 : theme.text }]}>
                      {blocked ? 'Blocked — prerequisite not met' : q.text}
                    </Text>

                    <View style={styles.qMeta}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="camera-outline" size={12} color={theme.text3} />
                        <Text style={[styles.qMetaText, { color: theme.text3 }]}>{q.hasPhoto ? 'Photo' : 'No Photo'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="document-text-outline" size={12} color={theme.text3} />
                        <Text style={[styles.qMetaText, { color: theme.text3 }]}>{q.hasNote ? 'Note' : 'No Note'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <Text style={[styles.endLabel, { color: theme.text3 }]}>END OF CHECKLIST</Text>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── BOTTOM FINISH BUTTON ── */}
      <View style={[styles.bottomBar, { backgroundColor: theme.white, borderTopColor: theme.borderColor }]}>
        <TouchableOpacity style={styles.btnFinish}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark" size={18} color={Colors.white} />
            <Text style={styles.btnFinishText}>Terminer la visite</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.savedLabel, { color: theme.text3 }]}>Enregistrer localement • Dernière sauvegarde: il y a 2 min</Text>
      </View>
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
  progressContainer: {
    padding: 12, borderBottomWidth: 1,
  },
  progressWrap: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressLabel: { fontSize: 12, textAlign: 'right' },
  body: { flex: 1, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 8 },
  sectionLine: { width: 18, height: 3, backgroundColor: Colors.green, borderRadius: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  questionCard: {
    borderRadius: 14, borderWidth: 1,
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
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  circlePass: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  circleFail: { borderColor: Colors.red, backgroundColor: Colors.redLight },
  circleNa: { borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },
  qText: { fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 6 },
  qMeta: { flexDirection: 'row', gap: 12 },
  qMetaText: { fontSize: 11 },
  endLabel: { textAlign: 'center', fontSize: 11, padding: 12 },
  bottomBar: {
    borderTopWidth: 1, padding: 12,
  },
  btnFinish: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnFinishText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, marginTop: 6, marginBottom: 4 },
});