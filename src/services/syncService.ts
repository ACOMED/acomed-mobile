// syncService.ts
// Manages a local sync queue for audit answers.
//
// Storage key: 'acomed_sync_queue'
// The queue is stored as a JSON array of SyncEntry objects.
//
// Deduplication rule: a composite key of `${auditId}::${questionId}` uniquely
// identifies an answer. Saving the same audit+question again replaces the
// existing entry rather than appending a duplicate.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncEntry {
  /** Composite deduplication key — never stored on the server, internal only. */
  _key: string;
  /** Valid UUID v4 sent to the backend as the answer id. */
  id: string;
  auditId: string;
  questionId: string;
  value: string;
  /** ISO 8601 string of the last local write. */
  updated_at: string;
  /** False until the backend confirms a successful upload. */
  synced: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUEUE_KEY = 'acomed_sync_queue';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeKey(auditId: string, questionId: string): string {
  return `${auditId}::${questionId}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function readQueue(): Promise<SyncEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncEntry[]) : [];
  } catch (err) {
    console.error('[syncService] readQueue failed:', err);
    return [];
  }
}

async function writeQueue(queue: SyncEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[syncService] writeQueue failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Saves an answer for a given audit question into the local sync queue.
 *
 * If an entry with the same auditId + questionId already exists it is
 * replaced in-place (deduplication). Otherwise a new entry is appended.
 * The entry is always marked `synced: false` and `updated_at` is refreshed
 * to the current UTC timestamp.
 */
export async function saveAnswer(
  auditId: string,
  questionId: string,
  value: string,
): Promise<void> {
  const queue = await readQueue();
  const key = makeKey(auditId, questionId);
  const now = new Date().toISOString();

  const existingIndex = queue.findIndex((e) => e._key === key);
  const existingEntry = existingIndex !== -1 ? queue[existingIndex] : undefined;

  const entry: SyncEntry = {
    _key: key,
    id: existingEntry?.id ?? generateUUID(),
    auditId,
    questionId,
    value,
    updated_at: now,
    synced: false,
  };

  if (existingIndex !== -1) {
    // Replace existing entry — deduplication
    queue[existingIndex] = entry;
    console.log(`[syncService] Updated answer for ${key}`);
  } else {
    // New entry
    queue.push(entry);
    console.log(`[syncService] Queued new answer for ${key}`);
  }

  await writeQueue(queue);
}

/**
 * Returns the full sync queue as an array, ordered by insertion / update time.
 */
export async function getQueue(): Promise<SyncEntry[]> {
  return readQueue();
}

/**
 * Returns the number of entries that have not yet been synced to the server.
 */
export async function getPendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.filter((e) => !e.synced).length;
}

export async function sync(): Promise<void> {
  const queue = await readQueue();
  const pending = queue.filter((e) => !e.synced);

  if (pending.length === 0) {
    console.log('[syncService] sync() — nothing to sync.');
    return;
  }

  const token = await SecureStore.getItemAsync('acomed_token');
  if (!token) {
    console.warn('[syncService] sync() — no auth token, skipping.');
    return;
  }

  const answers = pending.map((e) => ({
    id: e.id,
    audit_id: e.auditId,
    question_id: e.questionId,
    response_value: JSON.stringify(e.value),
    created_at: e.updated_at,
    updated_at: e.updated_at,
  }));

  try {
    const response = await fetch('https://api.acomed.tech/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ audits: [], answers, capas: [] }),
    });

    if (!response.ok) {
      console.error('[syncService] sync() — server error:', response.status);
      return;
    }

    const updated = queue.map((e) =>
      pending.some((p) => p._key === e._key) ? { ...e, synced: true } : e
    );
    await writeQueue(updated);
    await AsyncStorage.removeItem('cache_audits');
    console.log(`[syncService] sync() — ${pending.length} item(s) synced successfully.`);
  } catch (err) {
    console.error('[syncService] sync() — network error:', err);
  }
}
