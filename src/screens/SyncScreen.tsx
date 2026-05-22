import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { getPendingCount, getQueue, sync } from '../services/syncService';

type SyncState = 'idle' | 'syncing' | 'done';

export default function SyncScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [queue, setQueue] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string>('Never');

  useEffect(() => {
    async function loadQueue() {
      const count = await getPendingCount();
      const items = await getQueue();
      setPendingCount(count);
      setQueue(items);
      const raw = await AsyncStorage.getItem('last_sync_time');
      if (raw) setLastSync(new Date(raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    loadQueue();
  }, []);

  // ── Live network status via NetInfo ──
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  useEffect(() => {
    NetInfo.fetch().then((state) => setIsConnected(state.isConnected));
    const unsubscribe = NetInfo.addEventListener((state) =>
      setIsConnected(state.isConnected)
    );
    return unsubscribe;
  }, []);

  const isOffline = !isConnected;

  async function handleSyncNow() {
    if (syncState === 'syncing' || isOffline) return;
    setSyncState('syncing');
    try {
      await sync();
      await AsyncStorage.setItem('last_sync_time', new Date().toISOString());
      const count = await getPendingCount();
      const items = await getQueue();
      setPendingCount(count);
      setQueue(items);
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSyncState('done');
      setTimeout(() => setSyncState('idle'), 3000);
    } catch (e) {
      console.warn('[SyncScreen] Manual sync failed:', e);
      setSyncState('idle');
    }
  }

  function getSyncButtonLabel() {
    if (syncState === 'syncing') return 'Synchronisation…';
    if (syncState === 'done')    return 'Sync terminée';
    return 'Synchroniser';
  }

  function getSyncButtonStyle() {
    if (syncState === 'syncing') return [styles.syncBtn, styles.syncBtnSyncing];
    if (syncState === 'done')    return [styles.syncBtn, styles.syncBtnDone];
    return [styles.syncBtn];
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View>
          <Text style={[styles.topBarLabel, { color: theme.text2 }]}>ACOMED</Text>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Synchronisation</Text>
        </View>
        <View style={{ width: 18 }} />
      </View>

      {/* ── CONNECTION BANNER ── */}
      <View style={[
        styles.banner,
        isOffline
          ? { backgroundColor: '#fffbeb', borderColor: '#f59e0b' }
          : { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
      ]}>
        <View style={[styles.bannerDot, { backgroundColor: isOffline ? '#f59e0b' : '#22c55e' }]} />
        <Text style={[styles.bannerText, { color: isOffline ? '#b45309' : '#166534' }]}>
          {isOffline ? 'Hors ligne — Modifications sauvegardées localement' : 'Connecté — Sync active'}
        </Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── METRICS GRID ── */}
        <View style={styles.metricsGrid}>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="time-outline" size={13} color="#8a8f9e" />
              <Text style={styles.metricLbl}>Dernière sync</Text>
            </View>
            <Text style={[styles.metricValMd, { color: theme.text }]}>{lastSync}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="cloud-upload-outline" size={13} color="#8a8f9e" />
              <Text style={styles.metricLbl}>En attente</Text>
            </View>
            <Text style={[styles.metricValLg, { color: pendingCount > 0 ? '#b45309' : theme.text }]}>
              {pendingCount}
            </Text>
            <Text style={styles.metricSub}>À synchroniser</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="checkmark" size={13} color="#8a8f9e" />
              <Text style={styles.metricLbl}>Synchronisés aujourd'hui</Text>
            </View>
            <Text style={[styles.metricValLg, { color: theme.text }]}>
              {queue.filter(i => i.synced).length}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Ionicons name="close-circle-outline" size={13} color="#8a8f9e" />
              <Text style={styles.metricLbl}>Échoués</Text>
            </View>
            <Text style={[styles.metricValLg, { color: theme.text }]}>0</Text>
          </View>

        </View>
{/* ── SYNC NOW BUTTON ── */}
<TouchableOpacity
  style={getSyncButtonStyle()}
  onPress={handleSyncNow}
  activeOpacity={0.8}
  disabled={syncState === 'syncing' || !!isOffline}
>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Ionicons name="refresh-outline" size={20} color="#ffffff" />
    <Text style={styles.syncBtnText}>{getSyncButtonLabel()}</Text>
  </View>
</TouchableOpacity>


{/* ── PENDING QUEUE ── */}
        <Text style={styles.sectionTitle}>File d'attente</Text>

        {queue.map((item) => (
          <View key={item.auditId + item.questionId} style={styles.queueItem}>
            <View style={styles.queueIcon}>
              <Ionicons name="clipboard-outline" size={15} color="#166534" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.queueQuestion, { color: theme.text }]}>Q: {item.questionId}</Text>
              <Text style={[styles.queueAudit, { color: theme.text2 }]}>Audit: {item.auditId.slice(0, 8)}...</Text>
              <Text style={styles.queueTime}>{item.updatedAt}</Text>
            </View>
            <View style={styles.queueDot} />
          </View>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  topBarLabel: {
    fontSize: 11, fontWeight: '500', color: '#8a8f9e',
    letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 2,
  },
  topBarTitle: { fontSize: 22, fontWeight: '500', color: '#0d1b3e' },

  // Connection banner
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 16, marginTop: 16,
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 0.5,
  },
  bannerDot: { width: 8, height: 8, borderRadius: 4 },
  bannerText: { fontSize: 13, fontWeight: '500' },

  // Body
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 0 },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  metricCard: {
    width: '48%', backgroundColor: '#f5f6f9',
    borderRadius: 10, padding: 14,
  },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  metricLbl: { fontSize: 11, color: '#8a8f9e' },
  metricValMd: { fontSize: 16, fontWeight: '500' },
  metricValLg: { fontSize: 24, fontWeight: '500' },
  metricSub: { fontSize: 11, color: '#8a8f9e', marginTop: 3 },

  // Sync button
  syncBtn: {
    backgroundColor: '#0d1b3e', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    marginBottom: 20,
  },
  syncBtnSyncing: { opacity: 0.7 },
  syncBtnDone: { backgroundColor: '#166534' },
  syncBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '500' },

  // Queue section header
  sectionTitle: {
    fontSize: 11, fontWeight: '500', color: '#8a8f9e',
    letterSpacing: 0.07, textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Queue items
  queueItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#eef0f5',
  },
  queueIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center',
  },
  queueQuestion: { fontSize: 13, fontWeight: '500', color: '#0d1b3e', lineHeight: 17 },
  queueAudit: { fontSize: 12, color: '#8a8f9e', marginTop: 2 },
  queueTime: { fontSize: 11, color: '#c0c4d0', marginTop: 2 },
  queueDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#f59e0b',
    alignSelf: 'flex-start', marginTop: 4,
  },
});
