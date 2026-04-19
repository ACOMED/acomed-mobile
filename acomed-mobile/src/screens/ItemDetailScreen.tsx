import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MOCK_QUESTIONS } from '../mocks/data';

export default function ItemDetailScreen({ route, navigation }: any) {
  const { questionId } = route.params;
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
    <SafeAreaView style={styles.safe}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Item Detail</Text>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── QUESTION HEADER ── */}
        <View style={styles.questionMeta}>
          <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
            <Text style={[styles.tagText, { color: Colors.greenDark }]}>
              {question.sectionLabel}
            </Text>
          </View>
          <Text style={styles.refText}>📋 Ref: {question.code}</Text>
        </View>
        <Text style={styles.questionText}>{question.text}</Text>
        <Text style={styles.questionHint}>
          Inspect carefully and select the appropriate response below.
        </Text>

        {/* ── RESPONSE BUTTONS ── */}
        <View style={styles.responseBtns}>
          <TouchableOpacity
            style={[styles.responseBtn, selectedResponse === 'pass' && styles.responseBtnPass]}
            onPress={() => setSelectedResponse('pass')}
          >
            <Text style={[styles.responseBtnIcon, selectedResponse === 'pass' && { color: Colors.green }]}>✓</Text>
            <Text style={[styles.responseBtnText, selectedResponse === 'pass' && { color: Colors.greenDark }]}>PASS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseBtn, selectedResponse === 'fail' && styles.responseBtnFail]}
            onPress={() => setSelectedResponse('fail')}
          >
            <Text style={[styles.responseBtnIcon, selectedResponse === 'fail' && { color: Colors.red }]}>✗</Text>
            <Text style={[styles.responseBtnText, selectedResponse === 'fail' && { color: Colors.red }]}>FAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseBtn, selectedResponse === 'na' && styles.responseBtnNa]}
            onPress={() => setSelectedResponse('na')}
          >
            <Text style={[styles.responseBtnIcon, selectedResponse === 'na' && { color: '#475569' }]}>—</Text>
            <Text style={[styles.responseBtnText, selectedResponse === 'na' && { color: '#475569' }]}>N/A</Text>
          </TouchableOpacity>
        </View>

        {/* ── NOTES ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Observations & Notes</Text>
            <Text style={styles.cardOptional}>OPTIONAL</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={4}
            placeholder="Describe any non-conformities or general observations here..."
            placeholderTextColor={Colors.text3}
            value={note}
            onChangeText={setNote}
          />
          {/* Quick tags */}
          <View style={styles.quickTagRow}>
            {QUICK_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.quickTag}
                onPress={() => addQuickTag(tag)}
              >
                <Text style={styles.quickTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── EVIDENCE ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Evidence Gallery</Text>
            <Text style={styles.cardOptional}>0 photos added</Text>
          </View>
          <View style={styles.evidenceBtns}>
            <TouchableOpacity style={styles.evidenceBtn}>
              <Text style={styles.evidenceBtnText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenceBtn}>
              <Text style={styles.evidenceBtnText}>🖼 Gallery</Text>
            </TouchableOpacity>
          </View>
          {/* Placeholder for no photos yet */}
          <View style={styles.noPhotosBox}>
            <Text style={styles.noPhotosText}>📷</Text>
            <Text style={[styles.noPhotosText, { fontSize: 12, marginTop: 4 }]}>No photos yet</Text>
          </View>
        </View>

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity
          style={[styles.btnSave, !selectedResponse && { opacity: 0.5 }]}
          onPress={() => {
            if (selectedResponse) navigation.goBack();
          }}
          disabled={!selectedResponse}
        >
          <Text style={styles.btnSaveText}>Save Assessment ›</Text>
        </TouchableOpacity>
        <Text style={styles.savedLabel}>Last auto-saved 2 mins ago (Offline)</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  body: { flex: 1, padding: 16 },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  refText: { fontSize: 12, color: Colors.text2 },
  questionText: { fontSize: 19, fontWeight: '700', color: Colors.text, lineHeight: 26, marginBottom: 8 },
  questionHint: { fontSize: 13, color: Colors.text2, lineHeight: 19, marginBottom: 18 },
  responseBtns: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  responseBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    borderWidth: 1.5, borderColor: Colors.grayBorder,
    backgroundColor: Colors.grayLight, alignItems: 'center',
  },
  responseBtnPass: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  responseBtnFail: { backgroundColor: Colors.redLight, borderColor: Colors.red },
  responseBtnNa: { backgroundColor: '#F1F5F9', borderColor: '#94A3B8' },
  responseBtnIcon: { fontSize: 18, color: Colors.text2, fontWeight: '700' },
  responseBtnText: { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 14, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  cardOptional: { fontSize: 11, fontWeight: '600', color: Colors.text3, letterSpacing: 0.5 },
  noteInput: {
    borderWidth: 1, borderColor: Colors.grayBorder, borderRadius: 10,
    padding: 10, fontSize: 13, color: Colors.text2,
    backgroundColor: Colors.background, minHeight: 80,
    textAlignVertical: 'top', fontFamily: undefined,
  },
  quickTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  quickTag: {
    backgroundColor: '#F1F5F9', borderWidth: 1,
    borderColor: '#CBD5E1', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  quickTagText: { fontSize: 12, color: '#475569' },
  evidenceBtns: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  evidenceBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.green,
    borderRadius: 14, padding: 10, alignItems: 'center',
  },
  evidenceBtnText: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  noPhotosBox: {
    borderWidth: 1.5, borderColor: Colors.grayBorder, borderStyle: 'dashed',
    borderRadius: 10, padding: 20, alignItems: 'center',
  },
  noPhotosText: { fontSize: 24, color: Colors.text3 },
  btnSave: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnSaveText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, color: Colors.text3, marginTop: 8 },
});