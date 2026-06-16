// storage.ts
// AsyncStorage service for the ACOMED mobile app.
// Handles local persistence of user session data, in-progress audit answers,
// and a sync queue so unsynced answers can be identified before uploading.
//
// Key namespacing strategy:
//   user data     → '@acomed:user'
//   audit answers → '@acomed:answers:<auditId>'

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoredAnswer {
  questionId: string;
  value: string;
  savedAt: number; // Unix timestamp (ms)
  synced: boolean;
}

interface SyncQueueItem {
  auditId: string;
  questionId: string;
  value: string;
  savedAt: number;
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const USER_KEY = '@acomed:user';
const answerKey = (auditId: string) => `@acomed:answers:${auditId}`;

// ---------------------------------------------------------------------------
// User session
// ---------------------------------------------------------------------------

/**
 * Persists the logged-in user object to local storage.
 * Call this immediately after a successful login response.
 */
export async function saveUser(user: object): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('[storage] saveUser failed:', err);
  }
}

/**
 * Retrieves the saved user object.
 * Returns null if no user is stored (not logged in or storage was cleared).
 */
export async function getUser(): Promise<object | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as object) : null;
  } catch (err) {
    console.error('[storage] getUser failed:', err);
    return null;
  }
}

/**
 * Removes the stored user object from local storage.
 * Call this on logout to clear the session.
 */
export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('[storage] clearUser failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Audit answers (draft / offline storage)
// ---------------------------------------------------------------------------

/**
 * Saves a single answer for a given audit question.
 * If an answer for the same questionId already exists it is overwritten.
 * New answers are stored with synced: false so they appear in the sync queue.
 */
export async function saveAuditResponse(
  auditId: string,
  questionId: string,
  value: string,
): Promise<void> {
  try {
    const key = answerKey(auditId);
    const raw = await AsyncStorage.getItem(key);
    const answers: Record<string, StoredAnswer> = raw ? JSON.parse(raw) : {};

    answers[questionId] = {
      questionId,
      value,
      savedAt: Date.now(),
      synced: false,
    };

    await AsyncStorage.setItem(key, JSON.stringify(answers));
  } catch (err) {
    console.error('[storage] saveAuditResponse failed:', err);
  }
}

/**
 * Returns all saved answers for a specific audit as an array.
 * Returns an empty array if nothing has been saved yet.
 */
export async function getAuditResponses(auditId: string): Promise<StoredAnswer[]> {
  try {
    const raw = await AsyncStorage.getItem(answerKey(auditId));
    if (!raw) return [];
    const answers: Record<string, StoredAnswer> = JSON.parse(raw);
    return Object.values(answers);
  } catch (err) {
    console.error('[storage] getAuditResponses failed:', err);
    return [];
  }
}

/**
 * Deletes all locally stored answers for a specific audit.
 * Use this after a successful full sync or when discarding a draft.
 */
export async function clearAuditResponses(auditId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(answerKey(auditId));
  } catch (err) {
    console.error('[storage] clearAuditResponses failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Sync queue
// ---------------------------------------------------------------------------

/**
 * Scans all stored answers across every audit and returns those not yet synced.
 * The result is a flat array of SyncQueueItem ready to send to the backend.
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const answerKeys = allKeys.filter((k) => k.startsWith('@acomed:answers:'));

    if (answerKeys.length === 0) return [];

    const pairs = await AsyncStorage.multiGet(answerKeys);
    const queue: SyncQueueItem[] = [];

    for (const [key, raw] of pairs) {
      if (!raw) continue;
      const auditId = key.replace('@acomed:answers:', '');
      const answers: Record<string, StoredAnswer> = JSON.parse(raw);

      for (const answer of Object.values(answers)) {
        if (!answer.synced) {
          queue.push({
            auditId,
            questionId: answer.questionId,
            value: answer.value,
            savedAt: answer.savedAt,
          });
        }
      }
    }

    return queue;
  } catch (err) {
    console.error('[storage] getSyncQueue failed:', err);
    return [];
  }
}

/**
 * Marks all answers for a given audit as synced.
 * Call this after the backend confirms a successful upload for that audit.
 * Answers are kept in storage (not deleted) so they can be reviewed offline.
 */
export async function markAsSynced(auditId: string): Promise<void> {
  try {
    const key = answerKey(auditId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;

    const answers: Record<string, StoredAnswer> = JSON.parse(raw);
    for (const questionId in answers) {
      answers[questionId].synced = true;
    }

    await AsyncStorage.setItem(key, JSON.stringify(answers));
  } catch (err) {
    console.error('[storage] markAsSynced failed:', err);
  }
}
