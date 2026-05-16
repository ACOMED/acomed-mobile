# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.
PFE deadline: end of May 2026.
Current branch: feat/ui-redesign (redesigning UI, logic must not change)

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

### POST /api/sync
- Body: { audits[], answers[], capas[] }
- answers shape: { id (must be valid UUID v4), audit_id, question_id, response_value, created_at, updated_at }
- Conflict resolution: last-write-wins based on updated_at
- Currently returns 500 — backend bug, not mobile bug

## Real Test Data
- FALLBACK_TEMPLATE_ID: f78ad1f4-5d9d-4a11-95dc-0f890f393387 (SOUFIAN template, 6 questions)
- TEST graph template: 9aabc527-205b-4d8b-a3cb-29cdf4855251 (4 nodes, real edges)
- Audit UUID (has responses): d0237f4c-b795-4c32-8eba-79b22de93dda
- Audit UUID (empty): fa907779-1701-4c27-ba68-a0fdcf3f15f6

## Services
- authService.ts — login, logout, getToken, getUser, isAuthenticated
- auditService.ts — fetchAudits, fetchAudit, fetchTemplate
  — all three functions have offline cache (AsyncStorage cache_audits, cache_audit_{id}, cache_template_{id})
- syncService.ts — saveAnswer, getQueue, getPendingCount, sync
- storage.ts — legacy helpers, do not use for new features

## Components
- src/components/CameraModal.tsx — full screen camera, calls onPhotoCaptured(uri)
- src/components/SubmitModal.tsx — audit submission modal with stats

## What's Done
- Auth end to end — login, token persistence, auto-login, logout
- Auto-login works offline (token checked from AsyncStorage only)
- Offline cache — fetchAudits, fetchAudit, fetchTemplate all cache to AsyncStorage
- HomeScreen — real audit list from API with offline cache
- AuditDetailScreen — real data from fetchAudit(auditId)
- ChecklistScreen — supports BOTH flat and graph template schemas
  - Flat mode: conditional logic (EQUALS_YES, EQUALS_NO, COMPLETED)
  - Graph mode: decision tree traversal via nodes + edges
  - Blocked questions hidden (not rendered) in flat mode
  - Camera nodes wired to CameraModal
  - Text nodes render TextInput
  - Boolean nodes render Pass/Fail/NA buttons
- Photo capture — CameraModal with expo-camera
- Sync queue — answers queued with composite key auditId::questionId
- Auto-sync — fires on offline→online transition in AppNavigator
- SyncScreen — real pending count, queue, manual sync, last sync time
- Submit audit — SubmitModal shows stats, PATCH /api/audits/:id status→soumis
- NonConformitiesScreen — placeholder empty state
- ProfileScreen — real name and email, dark mode toggle, sign out
- Dark mode — full support via ThemeContext

## Current State (UI Redesign Branch)
- Switching from green primary to navy #0d1b3e as primary text color
- Green #1A6B4A kept as accent/action color only
- Colors updated in src/theme/colors.ts and ThemeContext.tsx
- Screens being redesigned one by one — logic untouched

## Color System (New)
- Navy (primary text): #0d1b3e
- Green (accent/action): #1A6B4A
- Background: #f9fafb
- Card background: #ffffff
- Border: #dde0e8
- Text secondary: #8a8f9e
- Text tertiary: #c0c4d0

## Known Backend Bugs (not mobile issues)
- POST /api/sync returns 500 — id field must be valid UUID v4
- GET /api/audits/:id does not return template_id
- Template SOUFIAN only has test data labels, not real healthcare questions
- All audits show same facility name (test data issue)

## File Structure
src/
  screens/
    LoginScreen.tsx
    HomeScreen.tsx
    AuditDetailScreen.tsx
    ChecklistScreen.tsx
    ItemDetailScreen.tsx
    SyncScreen.tsx
    NotificationsScreen.tsx
    NonConformitiesScreen.tsx
    OtherScreens.tsx           ← ProfileScreen + IssuesScreen combined
  services/
    authService.ts
    auditService.ts            ← has offline cache layer
    syncService.ts
    storage.ts                 ← legacy, do not use
  navigation/
    AppNavigator.tsx           ← auto-sync on reconnection
  components/
    CameraModal.tsx
    SubmitModal.tsx
  theme/
    colors.ts                  ← updated to navy system
    ThemeContext.tsx           ← LightColors/DarkColors updated
  mocks/
    data.ts                    ← used by IssuesScreen only