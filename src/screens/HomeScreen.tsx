import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import { getUser, AuthUser } from '../services/authService';
import { fetchAudits, Audit } from '../services/auditService';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => { getUser().then(setUser); }, []);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  useEffect(() => {
    NetInfo.fetch().then((state) => setIsConnected(state.isConnected));
    const unsubscribe = NetInfo.addEventListener((state) => setIsConnected(state.isConnected));
    return unsubscribe;
  }, []);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits()
      .then(setAudits)
      .catch((err) => setFetchError(err.message ?? 'Failed to load audits.'))
      .finally(() => setLoadingAudits(false));
  }, []);

  function getStatusTag(status: string) {
    if (status === 'in_progress') return { bg: Colors.greenLight, color: Colors.greenDark, label: 'In Progress' };
    if (status === 'completed')   return { bg: '#D1FAE5',         color: '#065F46',        label: 'Completed'   };
    if (status === 'assigned')    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Assigned' };
    return { bg: isDark ? '#1E293B' : Colors.grayLight, color: isDark ? '#94A3B8' : Colors.gray, label: 'Pending' };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.logoSmall, { borderColor: theme.borderColor }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.green} />
          </View>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Dashboard</Text>
        </View>
        <View style={[
          styles.offlineBadge,
          isConnected
            ? { backgroundColor: Colors.greenLight, borderColor: '#A7F3D0' }
            : { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor },
        ]}>
          <Text style={[styles.offlineText, { color: isConnected ? Colors.greenDark : theme.text2 }]}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── WELCOME CARD ── */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeSub, { color: theme.text2 }]}>Welcome back,</Text>
            <Text style={[styles.welcomeName, { color: theme.text }]}>{user?.full_name || '—'}</Text>
            <Text style={styles.welcomeId}>Inspector ID: {user?.id?.slice(0, 8) || '—'}</Text>
          </View>
          <View style={[styles.avatarWrap, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
            <Ionicons name="person" size={22} color={Colors.green} />
            <View style={styles.avatarDot} />
          </View>
        </View>

        {/* ── METRICS ROW ── */}
        <View style={[styles.metricsCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
          <View style={[styles.metricItem, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
            <Text style={[styles.metricVal, { color: theme.text }]}>{audits.length}</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>ASSIGNED</Text>
          </View>
          <View style={[styles.metricItem, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.metricVal, { color: Colors.red }]}>24</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>ISSUES</Text>
          </View>
          <View style={[styles.metricItem, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
            <Text style={[styles.metricVal, { fontSize: 18, color: theme.text }]}>98%</Text>
            <Text style={[styles.metricLbl, { color: theme.text2 }]}>SYNCED</Text>
          </View>
        </View>

        {/* ── AUDIT LIST ── */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text }]}>Active Audits</Text>
        </View>

        {loadingAudits ? (
          <ActivityIndicator size="large" color={Colors.green} style={{ marginTop: 32 }} />
        ) : fetchError ? (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.red} />
            <Text style={[styles.errorText, { color: Colors.red }]}>{fetchError}</Text>
          </View>
        ) : audits.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text2 }]}>No audits assigned.</Text>
        ) : (
          audits.map((audit) => {
            const tag = getStatusTag(audit.status);
            return (
              <TouchableOpacity
                key={audit.id}
                style={[styles.auditCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                onPress={() => navigation.navigate('AuditDetail', { auditId: audit.id })}
              >
                <View style={styles.auditCardHeader}>
                  <View style={[styles.refBadge, { backgroundColor: Colors.greenLight }]}>
                    <Text style={styles.refText}>{audit.ref}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                    <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                  </View>
                </View>
                <Text style={[styles.auditName, { color: theme.text }]} numberOfLines={2}>{audit.facility}</Text>
                <View style={styles.auditFooter}>
                  <Text style={[styles.footerText, { color: theme.text2 }]}>{formatDate(audit.date)}</Text>
                  <Text style={styles.footerLink}>
                    {audit.status === 'completed' ? 'View Report ›' : audit.status === 'in_progress' ? 'Continue ›' : 'Start ›'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <Text style={[styles.tagline, { color: theme.text2 }]}>"Ensuring healthcare excellence across Morocco."</Text>
        <View style={{ height: 100 }} />
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
  body: { flex: 1, padding: 16 },
  welcomeCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  welcomeSub: { fontSize: 13, marginBottom: 2 },
  welcomeName: { fontSize: 20, fontWeight: '700' },
  welcomeId: { fontSize: 12, color: Colors.green, fontWeight: '600', marginTop: 2 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E', borderWidth: 1.5, borderColor: Colors.white,
  },
  metricsCard: {
    borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', padding: 16, gap: 10, marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  metricVal: { fontSize: 22, fontWeight: '700' },
  metricLbl: {
    fontSize: 10, fontWeight: '600',
    letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase',
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  auditCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 12,
  },
  auditCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  refBadge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  refText: { fontSize: 11, fontWeight: '700', color: Colors.green, letterSpacing: 0.5 },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  auditName: { fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 10 },
  auditFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 12 },
  footerLink: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12,
  },
  errorText: { fontSize: 13, flex: 1 },
  emptyText: { textAlign: 'center', fontSize: 14, marginTop: 32 },
  tagline: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginTop: 8, paddingBottom: 8 },
});
