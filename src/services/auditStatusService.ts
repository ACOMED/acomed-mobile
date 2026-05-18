import AsyncStorage from '@react-native-async-storage/async-storage';

function statusKey(auditId: string): string {
  return `audit_status_${auditId}`;
}

export async function setLocalAuditStatus(auditId: string, status: string): Promise<void> {
  try {
    await AsyncStorage.setItem(statusKey(auditId), status);
  } catch (err) {
    console.error('[auditStatusService] setLocalAuditStatus failed:', err);
  }
}

export async function getLocalAuditStatus(auditId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(statusKey(auditId));
  } catch (err) {
    console.error('[auditStatusService] getLocalAuditStatus failed:', err);
    return null;
  }
}

export async function mergeAuditStatuses(audits: any[]): Promise<any[]> {
  return Promise.all(
    audits.map(async (audit) => {
      const local = await getLocalAuditStatus(audit.id);
      return local ? { ...audit, status: local } : audit;
    })
  );
}
