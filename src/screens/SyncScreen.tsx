import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { getPendingCount, getQueue } from '../services/syncService';

type SyncState = 'idle' | 'syncing' | 'done';

export default function SyncScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    async function loadQueue() {
      const count = await getPendingCount();
      const items = await getQueue();
      setPendingCount(count);
      setQueue(items);
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

  function handleSyncNow() {
    if (syncState === 'syncing') return;
    setSyncState('syncing');
    setTimeout(() => setSyncState('done'), 2000);
  }

  function getSyncButtonLabel() {
    if (syncState === 'syncing') return 'Syncing...';
    if (syncState === 'done')    return 'Sync Complete';
    return 'Sync Now';
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
        <View style={styles.topBarLeft}>
          <View style={[styles.logoSmall, { borderColor: theme.borderColor }]}>
            <Ionicons name="sync-outline" size={18} color={Colors.green} />
          </View>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Data Sync</Text>
        </View>
        <View style={[
          styles.offlineBadge,
          isConnected
            ? { backgroundColor: Colors.greenLight, borderColor: '#A7F3D0' }
            : { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor },
        ]}>
          <Text style={[
            styles.offlineText,
            { color: isConnected ? Colors.greenDark : theme.text2 },
          ]}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* ── SYNC STATUS BANNER ── */}
      <View style={[styles.banner, isOffline ? styles.bannerOffline : styles.bannerOnline]}>
        <Ionicons name={isOffline ? 'wifi-outline' : 'wifi'} size={22} color={isOffline ? '#92400E' : Colors.greenDark} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: isOffline ? '#92400E' : Colors.greenDark }]}>
            {isOffline ? 'You are offline' : 'Connected'}
          </Text>
          <Text style={[styles.bannerSub, { color: isOffline ? '#B45309' : Colors.green }]}>
            {isOffline ? 'Changes will sync automatically when connected' : 'Sync is active — all changes are uploading'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isOffline ? Colors.orange : Colors.green }]} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── METRICS ROW ── */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: Colors.orangeLight, borderColor: '#FDE68A' }]}>
            <Ionicons name="time-outline" size={22} color={Colors.orange} />
            <Text style={[styles.metricVal, { color: Colors.orange }]}>{pendingCount}</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>PENDING</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Ionicons name="sync-outline" size={22} color={theme.text2} />
            <Text style={[styles.metricVal, { fontSize: 13, marginTop: 2, color: theme.text }]}>09:41 AM</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>LAST SYNC</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: Colors.greenLight, borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.green} />
            <Text style={[styles.metricVal, { color: Colors.green }]}>18</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>SYNCED TODAY</Text>
          </View>
        </View>

        {/* ── SYNC NOW BUTTON ── */}
        <TouchableOpacity
          style={getSyncButtonStyle()}
          onPress={handleSyncNow}
          activeOpacity={0.8}
          disabled={syncState === 'syncing'}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons
              name={syncState === 'done' ? 'checkmark-circle' : 'sync'}
              size={18}
              color={Colors.white}
            />
            <Text style={styles.syncBtnText}>{getSyncButtonLabel()}</Text>
          </View>
        </TouchableOpacity>

        {/* ── PENDING QUEUE ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Queue</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{pendingCount} items</Text>
          </View>
        </View>

        {queue.map((item) => (
          <View key={item.auditId + item.questionId} style={[styles.queueCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <View style={[styles.queueIconWrap, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.queueTitle, { color: theme.text }]} numberOfLines={2}>
                Question: {item.questionId}
              </Text>
              <Text style={[styles.queueAudit, { color: theme.text2 }]}>Audit: {item.auditId}</Text>
              <Text style={[styles.queueTime, { color: theme.text3 }]}>{item.updatedAt}</Text>
            </View>
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>PENDING</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 90 }} />
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
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600' },
  offlineBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderBottomWidth: 1,
  },
  bannerOffline: { backgroundColor: Colors.orangeLight, borderBottomColor: '#FDE68A' },
  bannerOnline:  { backgroundColor: Colors.greenLight,  borderBottomColor: '#A7F3D0' },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerSub: { fontSize: 12, marginTop: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  body: { flex: 1, padding: 16 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: 'center',
  },
  metricVal: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  metricLbl: {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 0.5, marginTop: 4, textTransform: 'uppercase',
    textAlign: 'center',
  },
  syncBtn: {
    backgroundColor: Colors.green, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    marginBottom: 24,
  },
  syncBtnSyncing: { backgroundColor: Colors.orange },
  syncBtnDone: { backgroundColor: Colors.greenMid },
  syncBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  countBadge: {
    backgroundColor: Colors.orangeLight, borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.orange },
  queueCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  queueIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  queueTitle: {
    fontSize: 13, fontWeight: '600',
    lineHeight: 18, marginBottom: 4,
  },
  queueAudit: { fontSize: 12, marginBottom: 2 },
  queueTime: { fontSize: 11 },
  queueBadge: {
    backgroundColor: Colors.orangeLight, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
    alignSelf: 'flex-start',
  },
  queueBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.orange, letterSpacing: 0.3 },
});
