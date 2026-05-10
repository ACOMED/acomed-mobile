# ACOMED Mobile — Claude Code Reference

## Project
Offline-first mobile audit app for Moroccan Ministry of Health inspectors.
React Native + Expo SDK 54, TypeScript, AsyncStorage, React Navigation v7.

## Critical Rules
- NEVER use WatermelonDB — incompatible with Expo SDK 54
- All answer saving goes through syncService.saveAnswer() only
- authService exports named functions — always import with: import * as authService from '../services/authService'
- Never hardcode mock data when real data is available

## Backend
- Base URL: https://api.acomed.tech
- Test inspector: test.inspector@acomed.tech / InspectorTest@123
- Test admin: test.admin@acomed.tech / AcomedTest@123
- Tenant UUID: 9f7d55aa-cd6f-43e0-9fa8-7f6ac4e91f01
- Inspector UUID: 7386b7de-3e03-4f51-a6ef-e26ced09664f

## Auth
- POST /api/auth/login → returns { success, token, user: { id, name, email, role } }
- Note: backend returns 'name' not 'full_name' — normalize in authService
- Token saved to AsyncStorage key: acomed_token
- User saved to AsyncStorage key: acomed_user

## Template API
- GET /api/templates/:id → returns { success, data: { id, name, code, schema, created_at } }
- schema field contains { questions: [...] }
- Question shape: { question_id, type, label, required, reg_points, mat_points, trigger_capa, capa_severity, parent_question_id, prerequisite_condition }
- prerequisite_condition values: "EQUALS_YES", "EQUALS_NO", null
- No template is seeded yet — UUID pending

## Sync
- POST /api/sync → body: { audits[], answers[], capas[] }
- answers shape: { id, audit_id, question_id, response_value, created_at, updated_at }
- Conflict resolution: last-write-wins based on updated_at

## Services
- authService.ts — login, logout, getToken, getUser, isAuthenticated
- syncService.ts — saveAnswer, getQueue, getPendingCount, sync (stub)
- storage.ts — legacy helpers, do not use for new features

## What's Done
- Auth end to end — login, token persistence, auto-login, logout
- Profile shows real name and email from stored user
- Sync queue with deduplication and pending count
- All UI screens complete with dark mode and offline badge
- Notification badge wired to real unread count

## Current Blocker
Template fetch — no template seeded in database yet.
Next task: implement GET /api/templates/:id in templateService.ts
then replace mock questions in ChecklistScreen with real data.

## Real Test Data
- Test user: test@test.com / 12345
- Test user UUID: c9c122fa-a4d1-4e50-a8ed-25f879565650
- Template UUID: e3226ae3-29a9-470c-b052-d3d91fc6609a
- Audit UUID: d0237f4c-b795-4c32-8eba-79b22de93dda (has one response)
- Audit UUID: fa907779-1701-4c27-ba68-a0fdcf3f15f6 (empty, good for testing)

## Template Schema Shape (real)
{
  "id": "uuid",
  "name": "string",
  "code": "string",
  "schema": {
    "questions": [
      {
        "question_id": "node_1",
        "type": "booleanNode",
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

## Real API Flow
1. POST /api/auth/login → get token
2. GET /api/audits → get list of assigned audits
3. GET /api/audits/:id → get audit with existing responses
4. GET /api/templates/:id → get template with questions
5. POST /api/sync → send answers
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
    OtherScreens.tsx       ← ProfileScreen + IssuesScreen combined
  services/
    authService.ts
    syncService.ts
    storage.ts
  navigation/
    AppNavigator.tsx
  theme/
    colors.ts
    ThemeContext.tsx
  mocks/
    data.ts