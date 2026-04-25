import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MOCK_QUESTIONS } from '../mocks/data';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { saveAuditResponse } from '../services/storage';

export default function ItemDetailScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { questionId, auditId = 'unknown' } = route.params;
  const question = MOCK_QUESTIONS.find(q => q.id === questionId) || MOCK_QUESTIONS[0];

  const [selectedResponse, setSelectedResponse] = useState<'pass' | 'fail' | 'na' | null>(
    (question.response as any) || null
  );
  const [note, setNote] = useState('');

  const QUICK_TAGS = ['+ Labels missing', '+ Wrong bin color', '+ Overflowing', '+ Improper seal'];

  function addQuickTag(tag: string) {
    setNote(prev => prev ? prev + ' ' + tag.replace('+ ', '') : tag.replace('+ ', ''));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Item Detail</Text>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── QUESTION HEADER ── */}
        <View style={styles.questionMeta}>
          <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
            <Text style={[styles.tagText, { color: Colors.greenDark }]}>{question.sectionLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="clipboard-outline" size={13} color={theme.text2} />
            <Text style={[styles.refText, { color: theme.text2 }]}>Ref: {question.code}</Text>
          </View>
        </View>
        <Text style={[styles.questionText, { color: theme.text }]}>{question.text}</Text>
        <Text style={[styles.questionHint, { color: theme.text2 }]}>
          Inspect carefully and select the appropriate response below.
        </Text>

        {/* ── RESPONSE BUTTONS ── */}
        <View style={styles.responseBtns}>
          <TouchableOpacity
            style={[styles.responseBtn, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }, selectedResponse === 'pass' && styles.responseBtnPass]}
            onPress={() => setSelectedResponse('pass')}
          >
            <Ionicons name="checkmark" size={20} color={selectedResponse === 'pass' ? Colors.green : theme.text2} />
            <Text style={[styles.responseBtnText, { color: selectedResponse === 'pass' ? Colors.greenDark : theme.text2 }]}>PASS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseBtn, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }, selectedResponse === 'fail' && styles.responseBtnFail]}
            onPress={() => setSelectedResponse('fail')}
          >
            <Ionicons name="close" size={20} color={selectedResponse === 'fail' ? Colors.red : theme.text2} />
            <Text style={[styles.responseBtnText, { color: selectedResponse === 'fail' ? Colors.red : theme.text2 }]}>FAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseBtn, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }, selectedResponse === 'na' && styles.responseBtnNa]}
            onPress={() => setSelectedResponse('na')}
          >
            <Ionicons name="remove" size={20} color={selectedResponse === 'na' ? '#475569' : theme.text2} />
            <Text style={[styles.responseBtnText, { color: selectedResponse === 'na' ? '#475569' : theme.text2 }]}>N/A</Text>
          </TouchableOpacity>
        </View>

        {/* ── NOTES ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Observations & Notes</Text>
            <Text style={[styles.cardOptional, { color: theme.text3 }]}>OPTIONAL</Text>
          </View>
          <TextInput
            style={[styles.noteInput, { backgroundColor: theme.background, borderColor: theme.borderColor, color: theme.text2 }]}
            multiline
            numberOfLines={4}
            placeholder="Describe any non-conformities or general observations here..."
            placeholderTextColor={theme.text3}
            value={note}
            onChangeText={setNote}
          />
          <View style={styles.quickTagRow}>
            {QUICK_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.quickTag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? '#334155' : '#CBD5E1' }]}
                onPress={() => addQuickTag(tag)}
              >
                <Text style={[styles.quickTagText, { color: isDark ? '#94A3B8' : '#475569' }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── EVIDENCE ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Evidence Gallery</Text>
            <Text style={[styles.cardOptional, { color: theme.text3 }]}>0 photos added</Text>
          </View>
          <View style={styles.evidenceBtns}>
            <TouchableOpacity style={styles.evidenceBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="camera-outline" size={16} color={Colors.green} />
                <Text style={styles.evidenceBtnText}>Take Photo</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenceBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="images-outline" size={16} color={Colors.green} />
                <Text style={styles.evidenceBtnText}>Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.noPhotosBox, { borderColor: theme.borderColor }]}>
            <Ionicons name="camera-outline" size={28} color={theme.text3} />
            <Text style={[styles.noPhotosLabel, { color: theme.text3 }]}>No photos yet</Text>
          </View>
        </View>

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity
          style={[styles.btnSave, !selectedResponse && { opacity: 0.5 }]}
          onPress={async () => {
            if (!selectedResponse) return;
            try {
              console.log('Attempting to save...');
              await saveAuditResponse(
                route.params?.auditId || 'test-audit',
                question.id,
                selectedResponse
              );
              console.log('Save successful');
              Alert.alert('Saved', 'Response saved locally');
              navigation.goBack();
            } catch (error) {
              console.log('Save error:', error);
              Alert.alert('Error', 'Failed to save response');
            }
          }}
          disabled={!selectedResponse}
        >
          <Text style={styles.btnSaveText}>Save Assessment ›</Text>
        </TouchableOpacity>
        <Text style={[styles.savedLabel, { color: theme.text3 }]}>Last auto-saved 2 mins ago (Offline)</Text>

        <View style={{ height: 40 }} />
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
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  refText: { fontSize: 12 },
  questionText: { fontSize: 19, fontWeight: '700', lineHeight: 26, marginBottom: 8 },
  questionHint: { fontSize: 13, lineHeight: 19, marginBottom: 18 },
  responseBtns: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  responseBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    borderWidth: 1.5, alignItems: 'center',
  },
  responseBtnPass: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  responseBtnFail: { backgroundColor: Colors.redLight, borderColor: Colors.red },
  responseBtnNa: { backgroundColor: '#F1F5F9', borderColor: '#94A3B8' },
  responseBtnText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  card: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardOptional: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  noteInput: {
    borderWidth: 1, borderRadius: 10,
    padding: 10, fontSize: 13,
    minHeight: 80, textAlignVertical: 'top',
  },
  quickTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  quickTag: {
    borderWidth: 1, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  quickTagText: { fontSize: 12 },
  evidenceBtns: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  evidenceBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.green,
    borderRadius: 14, padding: 10, alignItems: 'center',
  },
  evidenceBtnText: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  noPhotosBox: {
    borderWidth: 1.5, borderStyle: 'dashed',
    borderRadius: 10, padding: 20, alignItems: 'center',
  },
  noPhotosLabel: { fontSize: 12, marginTop: 4 },
  btnSave: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnSaveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, marginTop: 8 },
});