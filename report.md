ACOMED Codebase Pre-Demo Audit Report
Generated: 2026-05-17

1. Unused Imports
File	Unused Import
syncService.ts:181-186	clearQueue function was pasted at the bottom of the file — it references setPendingCount and setQueue which are React state setters that don't exist in a service file. This dead, broken code must be removed.
No unused imports in the strict sense were found in screen files — all imports resolve to used symbols. However:

ChecklistScreen.tsx:8 — Colors is imported and still used (progress fill, error icon, etc.) ✓
2. Dead / Orphaned Files
File	Status
src/services/storage.ts	Confirmed dead — nothing in src/ imports from '../services/storage' or './storage'. The file exists but is entirely unreferenced.
src/screens/ItemDetailScreen.tsx	Effectively dead — registered in AppNavigator but navigate('ItemDetail', ...) is called nowhere. No screen links to it. Uses MOCK_QUESTIONS.
3. TODO / FIXME / HACK Comments
File	Line	Comment
ChecklistScreen.tsx:353	353	// TODO: replace with real TextInput and persist typed value (graph text node)
ChecklistScreen.tsx:360	360	Continue (text input — TODO) visible in UI label
ChecklistScreen.tsx:391	391	// TODO: implement signature pad
ChecklistScreen.tsx:398	398	Sign here (TODO: signature pad) visible in UI label
All four are in graph mode only and concern node types (text, signature) that the flat-mode template doesn't use. Low demo risk if demoing with the SOUFIAN flat template.

4. console.log Calls
High priority — visible in production logs:

File	Lines	Notes
ChecklistScreen.tsx:137-141	137–141	5× [DEBUG] logs — schema structure dumps, remove before demo
ChecklistScreen.tsx:147,154	147, 154	Schema mode detection logs
ItemDetailScreen.tsx:148,154	148, 154, 158	Answer save logs (screen is dead anyway)
syncService.ts:108,112	108, 112, 138	Queue mutation logs — acceptable for demo
Low priority — service-level, expected:

All console.error and console.warn calls in auditService.ts, authService.ts, syncService.ts are error handlers — fine to keep.

Summary by category:

[DEBUG] logs in ChecklistScreen (lines 137–141): remove before demo
Schema shape logs (lines 147, 154): optional cleanup
All service console.error/console.warn: keep
5. any Types in Service Files
Services are clean — grep found zero : any occurrences in src/services/*.ts.

The any types are confined to screens (mostly { route, navigation }: any on component props — standard React Navigation pattern, not a concern).

One screen-level any worth noting:

ChecklistScreen.tsx:122 — (a: any) on audit.responses?.forEach — acceptable since the backend response isn't fully typed.
6. storage.ts — Isolation Confirmed
src/services/storage.ts is not imported by any file in src/. It is completely isolated:


grep "from.*services/storage" src/**  →  0 results
Safe to delete. It exports saveUser, getUser, clearUser, saveAuditResponse, getAuditResponses, clearAuditResponses, getSyncQueue, markAsSynced — all superseded by authService.ts and syncService.ts.

Critical Fix Needed Before Demo
syncService.ts:181-186 contains a stray code block that was pasted at the bottom of the file during development:


// Add this function in SyncScreen
async function clearQueue() {
  await AsyncStorage.removeItem('acomed_sync_queue');
  setPendingCount(0);   // ← setPendingCount does not exist here
  setQueue([]);         // ← setQueue does not exist here
}
This will crash at runtime if ever called. It should be removed from syncService.ts — the actual clear-queue button in SyncScreen.tsx already calls AsyncStorage.removeItem inline directly, so this function is also unused.