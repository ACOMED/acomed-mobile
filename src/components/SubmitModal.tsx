import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

interface Stats {
  answered: number;
  total: number;
  fails: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  stats: Stats;
}

export default function SubmitModal({ visible, onClose, onConfirm, isSubmitting, stats }: Props) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.white, borderColor: theme.borderColor }]}>
          <Text style={[styles.header, { color: theme.text }]}>Soumettre l'audit ?</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.green} />
              <Text style={[styles.statText, { color: theme.text }]}>
                {stats.answered}/{stats.total} questions répondues
              </Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.red} />
              <Text style={[styles.statText, { color: theme.text }]}>
                {stats.fails} non-conformité(s) détectée(s)
              </Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.gray} />
              <Text style={[styles.statText, { color: theme.text2 }]}>
                Les données seront synchronisées
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btnAnnuler, { borderColor: Colors.gray }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.btnAnnulerText, { color: theme.text2 }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSoumettre, isSubmitting && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={styles.btnSoumettreText}>Soumettre</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: { gap: 12, marginBottom: 24 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statText: { fontSize: 14, flex: 1 },
  btnRow: { flexDirection: 'row', gap: 12 },
  btnAnnuler: {
    flex: 1, borderWidth: 1.5, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  btnAnnulerText: { fontSize: 15, fontWeight: '600' },
  btnSoumettre: {
    flex: 1, backgroundColor: Colors.green,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnSoumettreText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
