import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';

type Notification = {
  id: string;
  hospitalName: string;
  location: string;
  date: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', hospitalName: 'Hôpital Al Ghassani',       location: 'Fès, Maroc',        date: 'Apr 22, 2026', read: false },
  { id: '2', hospitalName: 'Centre de Santé Hay Nahda', location: 'Rabat, Maroc',      date: 'Apr 21, 2026', read: false },
  { id: '3', hospitalName: 'CHP Moulay Youssef',        location: 'Casablanca, Maroc', date: 'Apr 20, 2026', read: true  },
];

export default function NotificationsScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.logoSmall, { borderColor: theme.borderColor }]}>
            <Ionicons name="notifications-outline" size={18} color={Colors.green} />
          </View>
          <View>
            <Text style={[styles.topBarTitle, { color: theme.text }]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>{unreadCount} unread</Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={markAllRead} style={[styles.markReadBtn, { borderColor: theme.borderColor }]}>
          <Ionicons name="checkmark-done-outline" size={14} color={Colors.green} />
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {notifications.map((notif) => (
          <View
            key={notif.id}
            style={[
              styles.card,
              {
                backgroundColor: notif.read
                  ? theme.cardBg
                  : (isDark ? '#0D2B1F' : Colors.greenLight),
                borderColor: theme.borderColor,
              },
              !notif.read && styles.cardUnread,
            ]}
          >
            {/* Left green border for unread */}
            {!notif.read && <View style={styles.unreadStripe} />}

            <View style={styles.cardInner}>
              {/* Bell icon */}
              <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1E293B' : '#E8F5EF' }]}>
                <Ionicons name="notifications" size={20} color={Colors.green} />
              </View>

              <View style={{ flex: 1 }}>
                {/* Hospital name */}
                <Text style={[styles.hospitalName, { color: theme.text }]}>{notif.hospitalName}</Text>

                {/* Message */}
                <Text style={[styles.message, { color: theme.text2 }]}>
                  You have been assigned to this facility
                </Text>

                {/* Location + date row */}
                <View style={styles.metaRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="location-outline" size={11} color={theme.text2} />
                    <Text style={[styles.metaText, { color: theme.text2 }]}>{notif.location}</Text>
                  </View>
                  <View style={[styles.dot, { backgroundColor: theme.text2 }]} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="calendar-outline" size={11} color={theme.text2} />
                    <Text style={[styles.metaText, { color: theme.text2 }]}>{notif.date}</Text>
                  </View>
                </View>

                {/* View Audit button */}
                <TouchableOpacity
                  style={styles.viewAuditBtn}
                  onPress={() => navigation.navigate('HomeTab')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={14} color={Colors.white} />
                  <Text style={styles.viewAuditText}>View Audit</Text>
                </TouchableOpacity>
              </View>

              {/* Unread dot indicator */}
              {!notif.read && <View style={styles.unreadDot} />}
            </View>
          </View>
        ))}

        {notifications.every(n => n.read) && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={Colors.green} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up!</Text>
            <Text style={[styles.emptySubtitle, { color: theme.text2 }]}>No unread notifications.</Text>
          </View>
        )}

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
  unreadCount: { fontSize: 11, color: Colors.green, fontWeight: '600', marginTop: 1 },
  markReadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  markReadText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  body: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16, borderWidth: 1,
    marginBottom: 12, overflow: 'hidden',
    flexDirection: 'row',
  },
  cardUnread: {
    // extra glow handled by stripe
  },
  unreadStripe: {
    width: 4,
    backgroundColor: Colors.green,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardInner: {
    flex: 1, flexDirection: 'row',
    padding: 14, gap: 12, alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  hospitalName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  viewAuditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.green, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  viewAuditText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  unreadDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.green,
    flexShrink: 0, marginTop: 4,
  },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { fontSize: 14 },
});
