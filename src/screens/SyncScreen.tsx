import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

// ─── What this screen does ───────────────────────────────────────────────────
// Shows sync status for offline-first data: a banner (offline/online),
// 3 metric cards (pending, last sync, synced today), a Sync Now button
// with 2-second "Syncing…" state + "Sync Complete ✓" confirmation,
// and a hardcoded pending queue of 4 items.
// ─────────────────────────────────────────────────────────────────────────────

type SyncState = 'idle' | 'syncing' | 'done';

const PENDING_QUEUE = [
  {
    id: '1',
    icon: '📋',
    title: 'Section B — Sterilisation & Infection Control',
    auditName: 'Hôpital Régional Al Farabi',
    timestamp: 'Today, 09:14 AM',
  },
  {
    id: '2',
    icon: '📝',
    title: 'Section E — Fire Safety & Emergency Exits',
    auditName: 'Clinique Avicenne',
    timestamp: 'Today, 08:57 AM',
  },
  {
    id: '3',
    icon: '🖼️',
    title: 'Photo evidence — Ward 3 ceiling damage',
    auditName: 'Centre de Santé Hay Hassani',
    timestamp: 'Yesterday, 16:30 PM',
  },
  {
    id: '4',
    icon: '⚠️',
    title: 'Non-conformity report — Waste disposal',
    auditName: 'Hôpital Ibn Rochd',
    timestamp: 'Yesterday, 14:05 PM',
  },
];

export default function SyncScreen() {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const isOffline = true; // hardcoded for prototype

  function handleSyncNow() {
    if (syncState === 'syncing') return;
    setSyncState('syncing');
    setTimeout(() => setSyncState('done'), 2000);
  }

  function getSyncButtonLabel() {
    if (syncState === 'syncing') return '⏳  Syncing...';
    if (syncState === 'done')    return 'Sync Complete ✓';
    return '🔄  Sync Now';
  }

  function getSyncButtonStyle() {
    if (syncState === 'syncing') return [styles.syncBtn, styles.syncBtnSyncing];
    if (syncState === 'done')    return [styles.syncBtn, styles.syncBtnDone];
    return [styles.syncBtn];
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoSmall}>
            <Text>🔄</Text>
          </View>
          <Text style={styles.topBarTitle}>Data Sync</Text>
        </View>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      {/* ── SYNC STATUS BANNER ── */}
      <View style={[styles.banner, isOffline ? styles.bannerOffline : styles.bannerOnline]}>
        <Text style={styles.bannerIcon}>{isOffline ? '📵' : '✅'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: isOffline ? '#92400E' : Colors.greenDark }]}>
            {isOffline ? 'You are offline' : 'Connected'}
          </Text>
          <Text style={[styles.bannerSub, { color: isOffline ? '#B45309' : Colors.green }]}>
            {isOffline
              ? 'Changes will sync automatically when connected'
              : 'Sync is active — all changes are uploading'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isOffline ? Colors.orange : Colors.green }]} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── METRICS ROW ── */}
        <View style={styles.metricsRow}>
          {/* Pending items */}
          <View style={[styles.metricCard, { backgroundColor: Colors.orangeLight, borderColor: '#FDE68A' }]}>
            <Text style={styles.metricIcon}>⏳</Text>
            <Text style={[styles.metricVal, { color: Colors.orange }]}>4</Text>
            <Text style={styles.metricLbl}>PENDING</Text>
          </View>

          {/* Last sync */}
          <View style={[styles.metricCard, { backgroundColor: Colors.white }]}>
            <Text style={styles.metricIcon}>🕐</Text>
            <Text style={[styles.metricVal, { fontSize: 13, marginTop: 2 }]}>09:41 AM</Text>
            <Text style={styles.metricLbl}>LAST SYNC</Text>
          </View>

          {/* Synced today */}
          <View style={[styles.metricCard, { backgroundColor: Colors.greenLight, borderColor: '#A7F3D0' }]}>
            <Text style={styles.metricIcon}>✅</Text>
            <Text style={[styles.metricVal, { color: Colors.green }]}>18</Text>
            <Text style={styles.metricLbl}>SYNCED TODAY</Text>
          </View>
        </View>

        {/* ── SYNC NOW BUTTON ── */}
        <TouchableOpacity
          style={getSyncButtonStyle()}
          onPress={handleSyncNow}
          activeOpacity={0.8}
          disabled={syncState === 'syncing'}
        >
          <Text style={styles.syncBtnText}>{getSyncButtonLabel()}</Text>
        </TouchableOpacity>

        {/* ── PENDING QUEUE ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Queue</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{PENDING_QUEUE.length} items</Text>
          </View>
        </View>

        {PENDING_QUEUE.map((item, index) => (
          <View key={item.id} style={styles.queueCard}>
            <View style={styles.queueIconWrap}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.queueAudit}>📍 {item.auditName}</Text>
              <Text style={styles.queueTime}>🕐 {item.timestamp}</Text>
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
  safe: { flex: 1, backgroundColor: Colors.background },

  // Top bar — matches HomeScreen / OtherScreens exactly
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.grayBorder,
    backgroundColor: Colors.white,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.grayBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  offlineBadge: {
    backgroundColor: Colors.grayLight, borderWidth: 1,
    borderColor: Colors.grayBorder, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700', color: Colors.text2 },

  // Status banner
  banner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderBottomWidth: 1,
  },
  bannerOffline: {
    backgroundColor: Colors.orangeLight,
    borderBottomColor: '#FDE68A',
  },
  bannerOnline: {
    backgroundColor: Colors.greenLight,
    borderBottomColor: '#A7F3D0',
  },
  bannerIcon: { fontSize: 22 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerSub: { fontSize: 12, marginTop: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  body: { flex: 1, padding: 16 },

  // Metric cards
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.grayBorder,
    padding: 12, alignItems: 'center',
  },
  metricIcon: { fontSize: 20, marginBottom: 4 },
  metricVal: { fontSize: 22, fontWeight: '700', color: Colors.text },
  metricLbl: {
    fontSize: 9, fontWeight: '700', color: Colors.text2,
    letterSpacing: 0.5, marginTop: 4, textTransform: 'uppercase',
    textAlign: 'center',
  },

  // Sync Now button
  syncBtn: {
    backgroundColor: Colors.green, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    marginBottom: 24,
  },
  syncBtnSyncing: { backgroundColor: Colors.orange },
  syncBtnDone: { backgroundColor: Colors.greenMid },
  syncBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  countBadge: {
    backgroundColor: Colors.orangeLight, borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.orange },

  // Queue items
  queueCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  queueIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.grayLight, borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  queueTitle: {
    fontSize: 13, fontWeight: '600', color: Colors.text,
    lineHeight: 18, marginBottom: 4,
  },
  queueAudit: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
  queueTime: { fontSize: 11, color: Colors.text3 },
  queueBadge: {
    backgroundColor: Colors.orangeLight, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
    alignSelf: 'flex-start',
  },
  queueBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.orange, letterSpacing: 0.3 },
});
