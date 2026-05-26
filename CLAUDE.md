# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.
PFE deadline: end of May 2026.
Current branch: feat/ui-redesign (UI work only, logic must not change)
Working branch: feat/mobile-setup (stable, all logic working)

## Critical Rules
- NEVER use WatermelonDB — incompatible with Expo SDK 54
- All answer saving goes through syncService.saveAnswer() only
- authService exports named functions — always import with:
  import * as authService from '../services/authService'
- Never hardcode mock data when real data is available
- Do not over-engineer — this is a student project, keep it lean
- Never touch logic, state, hooks, or navigation when doing UI work

## Backend
- Base URL: https://api.acomed.tech
- Test inspector: test@test.com / 12345 (name: Sofiane lmoftich)
- Test inspector 2: test.inspector@acomed.tech / InspectorTest@123
- Test admin: test.admin@acomed.tech / AcomedTest@123
- Tenant UUID: 9f7d55aa-cd6f-43e0-9fa8-7f6ac4e91f01
- Inspector UUID: c9c122fa-a4d1-4e50-a8ed-25f879565650

## Auth
- POST /api/auth/login → returns { success, token, user: { id, name, email, role } }
- Backend returns 'name' not 'full_name' — normalized in authService to full_name
- Token saved to AsyncStorage key: acomed_token
- User saved to AsyncStorage key: acomed_user

## Real API Responses

### GET /api/audits
- Filtered by inspector_id automatically from JWT
- Inspector only sees own audits, admin sees all
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ref": "AUD-2026-Y3H9",
      "facility": "Test Facility",
      "inspector": "Sofiane lmoftich",
      "date": "2026-05-06T00:00:00.000Z",
      "status": "brouillon"
    }
  ]
}
```

### GET /api/audits/:id
- Returns both `responses` and `answers` keys — identical data, answers is alias
- `template_id` is now included in the response ✅
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "AUD-2026-Y3H9",
    "facility_name": "Test Facility",
    "inspector_name": "Sofiane lmoftich",
    "status": "brouillon",
    "template_id": "uuid",
    "compliance_score": 0,
    "maturity_score": 0,
    "responses": [...],
    "answers": [...]
  }
}
```

### GET /api/templates/:id
- Inspector token can only fetch templates linked to their assigned audits (RBAC)
- Admin token can fetch any template
- Schema always contains BOTH shapes:
  - schema.questions — flat array (what ChecklistScreen uses)
  - schema.visual.nodes + schema.visual.edges — graph (for dashboard visual editor)

### POST /api/sync — WORKING ✅
- response_value column in DB is JSONB
- Mobile sends JSON.stringify(value) for response_value
- Accepted fields per answer: id, audit_id, question_id, response_value, updated_at
```json
{
  "audits": [],
  "answers": [
    {
      "id": "uuid-v4",
      "audit_id": "uuid",
      "question_id": "node_8",
      "response_value": "\"pass\"",
      "updated_at": "2026-05-23T10:00:00.000Z"
    }
  ],
  "capas": []
}
```

### PATCH /api/audits/:id/status — WORKING ✅
- Payload: { "status": "soumis" }
- Locks the audit after submission
- Backend normalizes status case automatically

## Real Test Data
- FALLBACK_TEMPLATE_ID: 10ed2d2b-b2e7-468e-b647-6d991c341535 (Audit Inspection Hospitalière V1)
- Real French healthcare questions: node_2, node_7, node_8, node_9, node_10, node_11, node_12, node_13
- TEST graph template: 9aabc527-205b-4d8b-a3cb-29cdf4855251
- Audit with real French answers: fc2572fe-c4b4-44b9-bf58-c7ddfbf1acb9 (AUD-2026-9VQ1)
- Active test audits assigned to Sofiane: AUD-2026-J8H6, AUD-2026-AV03

## Services
- authService.ts — login, logout, getToken, getUser, isAuthenticated
- auditService.ts — fetchAudits, fetchAudit, fetchTemplate
  — all three have offline cache (cache_audits, cache_audit_{id}, cache_template_{id})
  — tries API first, falls back to cache only on network error
- syncService.ts — saveAnswer, getQueue, getPendingCount, sync
  — SyncEntry has id field (UUID v4, generated on first save, preserved on update)
  — clears cache_audits after successful sync
  — TODO: replace direct AsyncStorage.getItem('acomed_token') with authService.getToken()

## Components
- src/components/CameraModal.tsx — full screen camera, calls onPhotoCaptured(uri)
- src/components/SubmitModal.tsx — audit submission modal with stats

## What's Done ✅
- Auth end to end — login, token persistence, auto-login, logout
- Auto-login works offline (token checked from AsyncStorage only)
- Offline cache — fetchAudits, fetchAudit, fetchTemplate all cache to AsyncStorage
- HomeScreen — real audit list, useFocusEffect, navy redesign
- AuditDetailScreen — real data from fetchAudit(auditId)
- ChecklistScreen — supports BOTH flat and graph template schemas
  - Flat mode: conditional logic (EQUALS_YES, EQUALS_NO, COMPLETED)
  - Graph mode: decision tree traversal via nodes + edges
  - Blocked questions hidden in flat mode
  - Camera nodes → CameraModal
  - Text nodes → TextInput
  - Boolean/booleanNode → Pass/Fail/NA buttons
- Photo capture — CameraModal with expo-camera
- Sync queue — answers queued with composite key auditId::questionId
  - Each entry has stable UUID v4 id field
- Auto-sync — fires on offline→online transition in AppNavigator
- POST /api/sync — CONFIRMED WORKING, answers reach DB, dashboard shows them
- SyncScreen — real pending count, queue, manual sync, last sync time, navy redesign
- Submit audit — SubmitModal, PATCH /api/audits/:id/status → soumis ✅
- ReportScreen — fetches fresh data on every focus, clears cache before fetch
  - Filters status === 'soumis' only
  - Reviewed audits (revu/cloture) disappear automatically
- NonConformitiesScreen — placeholder empty state
- ProfileScreen — real name/email, dark mode toggle, sign out, navy redesign
- UI redesign — navy #0d1b3e primary, green #1A6B4A accent only
- RBAC — inspector token only fetches own audits (backend enforced)
- Security review passed — no HIGH or MEDIUM vulnerabilities

## Known Issues / TODOs
1. Photos stored as local URI — no upload endpoint exists on backend yet
2. syncService reads token directly via AsyncStorage instead of authService.getToken()
3. Remove dev "Clear queue" button from SyncScreen before demo
4. Math.random() UUID not crypto-grade — acceptable for PFE, fix before production
5. ChecklistScreen PATCH uses raw fetch() instead of authedFetch()

## Backend Known Issues
1. All test audits have template_id = NULL in DB — need assignment from dashboard
2. Photos stored as local file:// URI — no evidence upload endpoint yet

## Color System (feat/ui-redesign branch)
- Navy (primary): #0d1b3e
- Green (accent/action): #1A6B4A
- Background: #f9fafb
- Card background: #ffffff
- Border: #dde0e8
- Text secondary: #8a8f9e
- Text tertiary: #c0c4d0

## File Structure
src/
  screens/
    LoginScreen.tsx
    HomeScreen.tsx           ← redesigned, useFocusEffect
    AuditDetailScreen.tsx
    ChecklistScreen.tsx      ← redesigned, flat + graph schema
    ItemDetailScreen.tsx
    SyncScreen.tsx           ← redesigned
    ReportScreen.tsx         ← cache cleared on focus, fresh fetch
    NotificationsScreen.tsx
    NonConformitiesScreen.tsx
    OtherScreens.tsx         ← ProfileScreen redesigned
  services/
    authService.ts
    auditService.ts          ← offline cache layer
    syncService.ts           ← sync working, clears cache after sync
    storage.ts               ← legacy, do not use
  navigation/
    AppNavigator.tsx         ← auto-sync on reconnection
  components/
    CameraModal.tsx
    SubmitModal.tsx
  theme/
    colors.ts                ← navy system
    ThemeContext.tsx         ← LightColors/DarkColors
  mocks/
    data.ts                  ← used by IssuesScreen only