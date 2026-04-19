import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { MOCK_ISSUES } from '../mocks/data';

export function IssuesScreen({ navigation }: any) {
  function getSeverityStyle(severity: string) {
    if (severity === 'high') return { bg: Colors.red, color: Colors.white, label: '🔴 High' };
    if (severity === 'medium') return { bg: Colors.orangeLight, color: '#92400E', label: '🟠 Medium' };
    return { bg: Colors.grayLight, color: Colors.gray, label: '🟡 Low' };
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Non-Conformities</Text>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      </View>

      {/* Summary metrics */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryItem, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.summaryVal, { color: Colors.red }]}>{MOCK_ISSUES.filter(i => i.severity === 'high').length}</Text>
          <Text style={styles.summaryLbl}>HIGH</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: Colors.orangeLight }]}>
          <Text style={[styles.summaryVal, { color: '#92400E' }]}>{MOCK_ISSUES.filter(i => i.severity === 'medium').length}</Text>
          <Text style={styles.summaryLbl}>MEDIUM</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{MOCK_ISSUES.length}</Text>
          <Text style={styles.summaryLbl}>TOTAL</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {MOCK_ISSUES.map(issue => {
          const sev = getSeverityStyle(issue.severity);
          return (
            <View key={issue.id} style={styles.issueCard}>
              <View style={styles.issueCardHeader}>
                <Text style={styles.issueCode}>{issue.code}</Text>
                <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                  <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
                </View>
              </View>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <View style={styles.issueFooter}>
                <Text style={styles.issueSectionText}>📋 {issue.section}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{issue.status === 'open' ? '🔴 Open' : '🟡 In Progress'}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Teal header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white', fontSize: 28 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>My Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={styles.profileName}>Amina Bennani</Text>
          <Text style={styles.profileInspectorId}>Inspector ID: #44021</Text>
          <Text style={styles.profileRegion}>Region: Zone 4</Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* Account info */}
          <Text style={styles.sectionLabel}>ACCOUNT INFORMATION</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="✉️" label="Email" value="a.bennani@sante.gov.ma" valueColor={Colors.teal} />
            <InfoRow icon="📞" label="Phone" value="+212 661-234-567" />
            <InfoRow icon="🏥" label="Department" value="Infrastructure & Safety" />
            <InfoRow icon="👤" label="Role" value="Field Inspector" isLast />
          </View>

          {/* Device status */}
          <Text style={styles.sectionLabel}>DEVICE STATUS</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="🔄" label="Last Sync" value="Oct 24, 09:41 AM" />
            <InfoRow icon="📋" label="Pending Audits" value="12 Pending" valueBg={Colors.orangeLight} valueColor="#92400E" />
            <InfoRow icon="💾" label="Offline Data" value="142.5 MB" isLast />
          </View>

          {/* Sign out */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.signOutText}>➡ Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.appVersion}>APP VERSION 4.2.1-STABLE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Small reusable component for profile rows
function InfoRow({ icon, label, value, isLast, valueColor, valueBg }: any) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoRowLabel}>{icon}  {label}</Text>
      <View style={valueBg ? [styles.valuePill, { backgroundColor: valueBg }] : null}>
        <Text style={[styles.infoRowValue, valueColor && { color: valueColor }, valueBg && { fontWeight: '700', fontSize: 12 }]}>
          {value}
        </Text>
      </View>
    </View>
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
  summaryRow: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.grayBorder,
  },
  summaryItem: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '700', color: Colors.text },
  summaryLbl: { fontSize: 10, fontWeight: '600', color: Colors.text2, letterSpacing: 0.5, textTransform: 'uppercase' },
  body: { flex: 1, padding: 16 },
  issueCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.grayBorder,
    padding: 14, marginBottom: 10,
  },
  issueCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  issueCode: { fontSize: 11, fontWeight: '700', color: Colors.green },
  severityBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  severityText: { fontSize: 11, fontWeight: '700' },
  issueTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 20, marginBottom: 6 },
  issueFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  issueSectionText: { fontSize: 12, color: Colors.text2 },
  statusBadge: { backgroundColor: Colors.grayLight, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600', color: Colors.text2 },

  // Profile styles
  profileHeader: {
    backgroundColor: Colors.teal, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  profileHeaderTitle: { fontSize: 17, fontWeight: '600', color: 'white' },
  avatarSection: {
    backgroundColor: Colors.teal, alignItems: 'center', paddingBottom: 24,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E0F2FE', borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  profileName: { fontSize: 20, fontWeight: '700', color: 'white' },
  profileInspectorId: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  profileRegion: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    color: Colors.text2, marginBottom: 10, marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.grayBorder, marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.grayBorder,
  },
  infoRowLabel: { fontSize: 13, color: Colors.text2 },
  infoRowValue: { fontSize: 13, fontWeight: '500', color: Colors.text },
  valuePill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  signOutBtn: {
    backgroundColor: Colors.red, borderRadius: 14,
    padding: 15, alignItems: 'center', marginBottom: 10,
  },
  signOutText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  appVersion: { textAlign: 'center', fontSize: 11, color: Colors.text3, marginTop: 4, paddingBottom: 16 },
});