# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.
PFE deadline: end of May 2026.
Current branch: feat/ui-redesign
Stable branch: feat/mobile-setup (all logic working, old UI)

## Critical Rules
- NEVER use WatermelonDB — incompatible with Expo SDK 54 + React 19
- All answer saving goes through syncService.saveAnswer() ONLY
- authService exports named functions — always import with:
  `import * as authService from '../services/authService'`
- Never hardcode mock data when real data is available
- Do not over-engineer — this is a student project, keep it lean
- Never touch logic, state, hooks, or navigation when doing UI-only work
- AsyncStorage is the ONLY local storage solution — no SQLite, no WatermelonDB

## Backend
- Base URL: https://api.acomed.tech
- Test inspector: test@test.com / 12345 (name: Sofiane lmoftich)
- Test inspector 2: test.inspector@acomed.tech / InspectorTest@123
- Test admin: test.admin@acomed.tech / AcomedTest@123
- Tenant UUID: 9f7d55aa-cd6f-43e0-9fa8-7f6ac4e91f01
- Inspector UUID: c9c122fa-a4d1-4e50-a8ed-25f879565650

## API Endpoints

| Method | Endpoint | Called from | Notes |
|--------|----------|-------------|-------|
| POST | /api/auth/login | authService.login | Returns { success, token, user } |
| GET | /api/audits | auditService.fetchAudits | Returns { data: Audit[] } |
| GET | /api/audits/:id | auditService.fetchAudit | Returns { data: AuditDetail } |
| GET | /api/templates/:id | auditService.fetchTemplate | Returns template with schema |
| POST | /api/sync | syncService.sync | Sends { audits[], answers[] } |
| PATCH | /api/audits/:id | ChecklistScreen (direct) | Updates audit status on submit |

## Auth
- POST /api/auth/login → returns { success, token, user: { id, name, email, role } }
- Backend returns 'name' not 'full_name' — normalized in authService
- Token: AsyncStorage key `acomed_token`
- User: AsyncStorage key `acomed_user`

## AsyncStorage Keys (complete list)

| Key | Set by | Read by |
|-----|--------|---------|
| acomed_token | authService.login | authService.getToken, syncService.sync (direct) |
| acomed_user | authService.login | authService.getUser |
| acomed_sync_queue | syncService (writeQueue) | syncService (readQueue), SyncScreen (clear button) |
| cache_audits | auditService.fetchAudits | auditService.fetchAudits (fallback) |
| cache_audit_{id} | auditService.fetchAudit | auditService.fetchAudit (fallback) |
| cache_template_{id} | auditService.fetchTemplate | auditService.fetchTemplate (fallback) |
| audit_status_{id} | auditStatusService | auditStatusService, mergeAuditStatuses |
| last_sync_time | SyncScreen.handleSyncNow | SyncScreen (on mount) |

## Template Schemas
Templates exist in TWO shapes. ChecklistScreen detects and handles both.

Shape A — flat:
```json
{ "schema": { "questions": [{ "question_id": "node_1", "type": "boolean", "label": "...", "parent_question_id": null, "prerequisite_condition": null }] } }
```

Shape B — graph (nodes + edges):
```json
{ "schema": { "nodes": [{ "id": "node_1", "type": "boolean", "label": "..." }], "edges": [{ "sourceNodeId": "node_1", "sourceHandle": "yes", "targetNodeId": "node_2" }] } }
```

Type guards: `isFlatSchema()` and `isGraphSchema()` in auditService.ts.

## Real Test Data
- FALLBACK_TEMPLATE_ID: 10ed2d2b-b2e7-468e-b647-6d991c341535 (Audit Inspection Hospitalière V1, 8 questions)
- TEST graph template: 9aabc527-205b-4d8b-a3cb-29cdf4855251 (4 nodes, real edges)
- Audit UUID (has responses): d0237f4c-b795-4c32-8eba-79b22de93dda
- Audit UUID (active, used for testing): fc2572fe-c4b4-44b9-bf58-c7ddfbf1acb9 (ref: AUD-2026-9VQ1)

## Navigation Structure

```
Root Stack:
├── Login (LoginScreen)
└── MainTabs
    ├── HomeTab → HomeStackNavigator
    │   ├── Home (HomeScreen)
    │   ├── AuditDetail (AuditDetailScreen)
    │   ├── Checklist (ChecklistScreen)
    │   ├── ItemDetail (ItemDetailScreen) — DEAD, nothing navigates here
    │   └── NonConformities (NonConformitiesScreen) — placeholder
    ├── AuditsTab → AuditsStackNavigator (same screens as HomeStack)
    ├── ReportTab → ReportStackNavigator
    │   ├── ReportHome (ReportScreen)
    │   ├── AuditDetail (AuditDetailScreen)
    │   └── Checklist (ChecklistScreen)
    ├── Sync (SyncScreen)
    └── Profile (ProfileScreen)
```

## What Each Screen Does

**HomeScreen** — Dashboard. Shows stats row (Assigned / In Progress / Completed counts) and active audit cards (brouillon + en cours only). Uses useFocusEffect to refresh on every visit. Navigates to AuditDetail on card tap.

**AuditDetailScreen** — Single audit view. Shows facility name, ref, status pill, compliance/maturity scores, inspector, date. Merges local status override on load. Button label: 'Start Checklist' (brouillon), 'Continue ›' (en cours), 'View Answers ›' (soumis). All navigate to ChecklistScreen.

**ChecklistScreen** — Core audit form. Loads template via FALLBACK_TEMPLATE_ID (backend doesn't return template_id yet). Renders flat or graph schema. Saves answers via syncService.saveAnswer(). Submit button opens SubmitModal → PATCH status to soumis → sets local status to soumis.

**ReportScreen** — Lists submitted audits (status === 'soumis'). Each card navigates to AuditDetail within ReportStack.

**SyncScreen** — Shows pending count, last sync time, synced today count, queue list. Manual sync button. Dev-only clear queue button still present.

**ProfileScreen** (in OtherScreens.tsx) — Real user data from authService. Dark mode toggle. Sign out button.

**IssuesScreen** (in OtherScreens.tsx) — Uses MOCK_ISSUES, not wired to real data. Not visible in nav bar.

## Services

**authService.ts** — login, logout, getToken, getUser, isAuthenticated. All AsyncStorage-based.

**auditService.ts** — fetchAudits, fetchAudit, fetchTemplate. Network-first with AsyncStorage cache fallback. Exports TypeScript types for Audit, AuditDetail, Question, GraphNode, GraphEdge, Template, etc.

**syncService.ts** — saveAnswer (deduplicates by auditId::questionId), getQueue, getPendingCount, sync (POST /api/sync). Each entry has stable UUID v4 id. NOTE: reads acomed_token directly via AsyncStorage, does not use authService.getToken().

**auditStatusService.ts** — setLocalAuditStatus, getLocalAuditStatus, mergeAuditStatuses. Thin AsyncStorage wrapper for local status overrides.

## Sync Details
- Sync payload: `{ audits: [], answers: [{ id, audit_id, question_id, response_value, created_at, updated_at }] }`
- response_value column in Postgres is JSONB — values are wrapped with JSON.stringify() before sending
- Sync is WORKING as of 2026-05-20. Verified 5 answers synced to DB successfully.
- Auto-sync fires on offline→online transition via NetInfo listener in AppNavigator

## Color System

| Token | Value |
|-------|-------|
| Navy (primary text) | #0d1b3e |
| Green (accent/action) | #1A6B4A |
| Background | #f9fafb |
| Card background | #ffffff |
| Border | #dde0e8 |
| Text secondary | #8a8f9e |
| Text tertiary | #c0c4d0 |

## Known Issues & TODOs
1. FALLBACK_TEMPLATE_ID hardcoded in ChecklistScreen — remove when backend adds template_id to GET /api/audits/:id
2. ChecklistScreen bottom bar shows static "il y a 2 min" — not a real timestamp
3. Graph mode text node: TODO replace with real TextInput and persist value (line ~347)
4. Graph mode signature node: TODO implement signature pad (line ~386)
5. SyncScreen: dev-only "Clear queue" button still in production code — remove before final build
6. SyncScreen: "Failed" metric hardcoded to 0
7. ProfileScreen: stats cards show "—" (Total audits, Avg compliance, This quarter) — not wired to real data
8. IssuesScreen: entirely mock data, not in nav bar
9. ItemDetailScreen: dead code, nothing navigates to it
10. syncService reads acomed_token directly instead of using authService.getToken()
11. HomeScreen still shows notification bell icon in header — should be removed (Notifications tab already removed)

## File Structure
```
src/
  screens/
    LoginScreen.tsx
    HomeScreen.tsx              ← active audits, stats, navy redesign
    AuditDetailScreen.tsx       ← single audit view, local status merge
    ChecklistScreen.tsx         ← flat + graph schema, submit flow
    ReportScreen.tsx            ← submitted audits list
    SyncScreen.tsx              ← sync metrics, manual sync
    ItemDetailScreen.tsx        ← DEAD CODE
    NotificationsScreen.tsx     ← DEAD CODE (tab removed)
    NonConformitiesScreen.tsx   ← placeholder empty state
    OtherScreens.tsx            ← ProfileScreen + IssuesScreen
  services/
    authService.ts              ← login, logout, token management
    auditService.ts             ← API calls + offline cache
    syncService.ts              ← answer queue + sync POST
    auditStatusService.ts       ← local audit status overrides
    storage.ts                  ← DEAD CODE, do not use
  navigation/
    AppNavigator.tsx            ← tabs, stacks, auto-sync listener
  components/
    CameraModal.tsx             ← full screen camera
    SubmitModal.tsx              ← audit submission modal
  theme/
    colors.ts                   ← navy color system
    ThemeContext.tsx             ← light/dark mode
  mocks/
    data.ts                     ← used by IssuesScreen only
```