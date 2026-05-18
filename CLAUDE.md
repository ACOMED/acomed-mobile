# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.
PFE deadline: end of May 2026.
Current branch: feat/ui-redesign (redesigning UI, logic must not change)
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
```json
{
  "data": [
    {
      "id": "uuid",
      "ref": "AUD-2026-DTZ6",
      "facility": "Test Facility",
      "inspector": "Sofiane lmoftich",
      "date": "2026-05-06T00:00:00.000Z",
      "status": "brouillon"
    }
  ]
}
```

### GET /api/audits/:id
```json
{
  "data": {
    "id": "uuid",
    "code": "AUD-2026-DTZ6",
    "facility_name": "Test Facility",
    "inspector_name": "Sofiane lmoftich",
    "status": "brouillon",
    "compliance_score": 0,
    "maturity_score": 0,
    "responses": [
      {
        "id": "uuid",
        "question_id": "node_1",
        "question_text": "Are equipment calibration logs up to date?",
        "answer_value": "No",
        "evidence_url": null
      }
    ]
  }
}
```

### GET /api/templates/:id
Template schema exists in TWO shapes:

Shape A — flat (what ChecklistScreen reads):
```json
{
  "schema": {
    "questions": [
      {
        "question_id": "node_1",
        "type": "boolean",
        "label": "Question text",
        "required": true,
        "reg_points": 5,
        "mat_points": 2,
        "trigger_capa": true,
        "capa_severity": "Critical",
        "parent_question_id": null,
        "prerequisite_condition": null
      }
    ]
  }
}
```

Shape B — graph (nodes + edges):
```json
{
  "schema": {
    "nodes": [{ "id": "node_1", "type": "boolean", "label": "..." }],
    "edges": [{ "sourceNodeId": "node_1", "sourceHandle": "yes", "targetNodeId": "node_2" }]
  }
}
```

### POST /api/sync — CURRENTLY BROKEN
- Body we send: { audits[], answers[], capas[] }
- answers shape: { id (valid UUID v4), audit_id, question_id, response_value, created_at, updated_at }
- Server returns: {"success":false,"message":"invalid input syntax for type json"}
- UUID fix was applied — id field is now valid UUID v4
- Root cause unknown — backend teammate must check server logs
- field name might be wrong: response_value vs value vs answer

## Real Test Data
- FALLBACK_TEMPLATE_ID: f78ad1f4-5d9d-4a11-95dc-0f890f393387 (SOUFIAN template, 6 questions)
- TEST graph template: 9aabc527-205b-4d8b-a3cb-29cdf4855251 (4 nodes, real edges)
- Audit UUID (has responses): d0237f4c-b795-4c32-8eba-79b22de93dda
- Audit UUID (active, used for testing): 33410b8f-c0f4-4a10-8afd-f672dc06b923

## Services
- authService.ts — login, logout, getToken, getUser, isAuthenticated
- auditService.ts — fetchAudits, fetchAudit, fetchTemplate
  — all three have offline cache (cache_audits, cache_audit_{id}, cache_template_{id})
- syncService.ts — saveAnswer, getQueue, getPendingCount, sync
  — SyncEntry now has id field (UUID v4, generated on first save, preserved on update)
- storage.ts — legacy, do not use

## Components
- src/components/CameraModal.tsx — full screen camera, calls onPhotoCaptured(uri)
- src/components/SubmitModal.tsx — audit submission modal with stats

## What's Done
- Auth end to end — login, token persistence, auto-login, logout
- Auto-login works offline (token checked from AsyncStorage only)
- Offline cache — fetchAudits, fetchAudit, fetchTemplate all cache to AsyncStorage
- HomeScreen — real audit list, offline cache, navy redesign
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
  - Each entry has a stable UUID v4 id field
- Auto-sync — fires on offline→online transition in AppNavigator
- SyncScreen — real pending count, queue, manual sync, last sync time, navy redesign
- Submit audit — SubmitModal shows stats, PATCH /api/audits/:id status→soumis
- NonConformitiesScreen — placeholder empty state
- ProfileScreen — real name/email, dark mode toggle, sign out, navy redesign
- UI redesign — navy #0d1b3e primary, green #1A6B4A accent only

## Current Blockers (backend bugs — not mobile issues)
1. POST /api/sync returns "invalid input syntax for type json"
   - UUID fix applied, id field is now valid UUID v4
   - Backend teammate must check: is response_value the correct field name?
   - Backend teammate must check server logs for exact failure point
2. GET /api/audits/:id does not return template_id
   - Mobile uses FALLBACK_TEMPLATE_ID as workaround
3. Test template SOUFIAN has generic labels not real healthcare questions
4. All test audits show same facility name

## Color System (New — feat/ui-redesign branch)
- Navy (primary text): #0d1b3e
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
    HomeScreen.tsx           ← redesigned
    AuditDetailScreen.tsx
    ChecklistScreen.tsx      ← redesigned
    ItemDetailScreen.tsx
    SyncScreen.tsx           ← redesigned
    NotificationsScreen.tsx
    NonConformitiesScreen.tsx
    OtherScreens.tsx         ← ProfileScreen redesigned, IssuesScreen unchanged
  services/
    authService.ts
    auditService.ts          ← offline cache layer
    syncService.ts           ← UUID fix applied
    storage.ts               ← legacy, do not use
  navigation/
    AppNavigator.tsx         ← auto-sync on reconnection
  components/
    CameraModal.tsx
    SubmitModal.tsx
  theme/
    colors.ts                ← navy system
    ThemeContext.tsx         ← LightColors/DarkColors updated
  mocks/
    data.ts                  ← used by IssuesScreen only