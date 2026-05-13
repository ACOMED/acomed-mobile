# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.
PFE deadline: end of May 2026.

## Critical Rules
- NEVER use WatermelonDB — incompatible with Expo SDK 54
- All answer saving goes through syncService.saveAnswer() only
- authService exports named functions — always import with:
  import * as authService from '../services/authService'
- Never hardcode mock data when real data is available
- Do not over-engineer — this is a student project, keep it lean

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
```json
{
  "data": {
    "id": "uuid",
    "name": "ISO 9001 Master 2026",
    "code": "TPL-xxx",
    "schema": {
      "questions": [
        {
          "question_id": "node_1",
          "type": "booleanNode",
          "label": "Are equipment calibration logs up to date?",
          "required": true,
          "reg_points": 5,
          "mat_points": 2,
          "trigger_capa": true,
          "capa_severity": "Critical",
          "parent_question_id": null,
          "prerequisite_condition": null
        }
      ]
    },
    "created_at": "2026-05-06T..."
  }
}
```

### POST /api/sync
- Body: { audits[], answers[], capas[] }
- answers shape: { id, audit_id, question_id, response_value, created_at, updated_at }
- Conflict resolution: last-write-wins based on updated_at

## Real Test Data
- Template UUID: e3226ae3-29a9-470c-b052-d3d91fc6609a
- Audit UUID (has one response): d0237f4c-b795-4c32-8eba-79b22de93dda
- Audit UUID (empty): fa907779-1701-4c27-ba68-a0fdcf3f15f6

## Services
- authService.ts — login, logout, getToken, getUser, isAuthenticated
- auditService.ts — fetchAudits, fetchAudit, fetchTemplate
- syncService.ts — saveAnswer, getQueue, getPendingCount, sync (stub)
- storage.ts — legacy helpers, do not use for new features

## What's Done
- Auth end to end — login, token persistence, auto-login, logout
- Profile shows real name and email from stored user
- HomeScreen shows real audit list from API
- ChecklistScreen fetches real template and renders questions
- booleanNode questions render Pass/Fail/NA buttons
- Conditional logic — questions blocked by prerequisite
- Sync queue with deduplication and pending count
- All UI screens complete with dark mode
- Online/Offline badge wired to NetInfo
- Notification badge wired to real unread count
- WatermelonDB dead code removed
- Sync engine — POST /api/sync called on network reconnection (AppNavigator.tsx)
- SyncScreen wired to real getPendingCount() and getQueue()
- AuditDetailScreen wired to real fetchAudit(auditId)

## What's Left (Priority Order)
1. Photo capture — Expo Camera for evidence (lowest priority)

## File Structure
src/
  screens/
    LoginScreen.tsx
    HomeScreen.tsx
    AuditDetailScreen.tsx      ← still shows mock data
    ChecklistScreen.tsx        ← template hardcoded
    ItemDetailScreen.tsx
    SyncScreen.tsx             ← pending count hardcoded
    NotificationsScreen.tsx
    OtherScreens.tsx           ← ProfileScreen + IssuesScreen combined
  services/
    authService.ts
    auditService.ts
    syncService.ts
    storage.ts
  navigation/
    AppNavigator.tsx
  theme/
    colors.ts
    ThemeContext.tsx
  mocks/
    data.ts                    ← still used by ChecklistScreen/ItemDetail

## Known Issues
- Audit cards show same data because backend has same test data for all audits
- TEMPLATE_ID fallback hardcoded in ChecklistScreen — waiting for backend to add template_id to GET /api/audits/:id response


## Template Schema Reality

Templates exist in TWO shapes in the backend:

### Flat shape (legacy, used by current ChecklistScreen)
schema.questions[] = array of question objects.

### Graph shape (real source of truth, used by dashboard builder)
schema.nodes[] + schema.edges[]
- nodes: { id, type, label, x, y, color }
- edges: { id, sourceNodeId, sourceHandle, targetNodeId, targetHandle }
- sourceHandle values: "out" (unconditional), "yes", "no"
- Root node = the node with no incoming edges
- Traversal: render node → on answer, follow edge where sourceNodeId=current and sourceHandle matches answer → go to targetNodeId

Node types seen so far: "text", "boolean", "booleanNode", "camera", "signature"

The mobile app must support BOTH shapes — detect which one and render accordingly.