# ACOMED Mobile

Offline-first audit and compliance app for field inspectors. Built for the Moroccan Ministry of Health's healthcare facility inspection workflow, where inspectors operate in locations with unreliable or no internet connectivity.

This is the mobile client of the **ACOMED** platform — a three-component system (mobile app, backend API, web dashboard) developed as a final-year engineering project. This repository covers the mobile component only.

## Why offline-first

Healthcare facility audits in Morocco are often conducted in rural or semi-urban areas with weak network coverage. A standard "always-connected" app would be unusable in the field. ACOMED Mobile is designed around the opposite assumption: connectivity is the exception, not the default. Every core action — loading an audit template, answering questions, attaching evidence — works fully offline. Synchronization with the server is a deferred, explicit operation, not a requirement for the app to function.

## Key features

- **JWT authentication** with local token persistence and automatic re-login on app restart, no network call required.
- **Offline template caching** — audit templates (the question schemas) are fetched once and cached locally for repeated offline access.
- **Dynamic form rendering** supporting two schema shapes: a flat list of questions, and a graph-based decision tree with conditional branching between nodes.
- **Conditional logic engine** — questions can be hidden or shown based on prior answers (e.g. a "no" on a prerequisite question hides its dependent sub-questions).
- **Photo evidence capture** via the device camera, attached directly to audit answers.
- **Sync queue with deduplication** — every answer is queued locally under a composite key (`auditId::questionId`), so repeated edits to the same question never produce duplicate queue entries.
- **Manual sync** — pending answers are sent to the backend's Last-Write-Wins sync endpoint on demand; entries are only marked as synced once the server confirms receipt.
- **Submitted audit review** — inspectors can review their submitted audits and the full answer breakdown after sync.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Navigation | React Navigation v7 (Stack + Tab navigators) |
| Local storage | AsyncStorage |
| Network detection | `@react-native-community/netinfo` |
| Camera | `expo-camera` |

No state management library is used — local component state and AsyncStorage cover the app's needs at its current scope.

## Architecture

```
src/
├── screens/        Screen components (Login, Home, Checklist, Sync, Profile, ...)
├── services/        Business logic and data access (auth, audits, sync)
├── navigation/       Navigator configuration and routing logic
├── components/       Reusable components independent of any single screen
└── theme/            Color system and light/dark theme context
```

Three services carry the core logic:

- **authService** — login, token/user persistence, logout. Exposes named functions only.
- **auditService** — fetches audits and templates, with offline cache fallback on network failure.
- **syncService** — manages the local answer queue and pushes it to the backend.

## Sync strategy

Every answer is written to a local queue immediately on entry — there is no "save" step the inspector has to trigger. Each queue entry carries a stable UUID (generated once, kept across edits to the same answer) and an `updated_at` timestamp.

When the inspector triggers a sync, the queue is sent as a batch to the backend's `/api/sync` endpoint. The server resolves conflicts with a **Last-Write-Wins** strategy: it compares the timestamp on the incoming answer against the timestamp on its own stored copy, and only writes the incoming data if it is strictly newer. Entries are marked as synced locally only after the server confirms the write — anything that doesn't get confirmed stays in the queue for the next sync attempt.

## Getting started

### Prerequisites
- Node.js (LTS)
- Expo Go installed on a physical Android device, or an Android emulator
- Access to a running instance of the ACOMED backend API

### Install and run

```bash
git clone <repo-url>
cd acomed-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` to launch on a connected Android emulator.

### Configuration

The backend base URL is set in the API client config. Point it at your running backend instance before testing against real data — there is no `.env`-based override at this time.

## Known limitations

This section is intentionally explicit rather than swept under "future work":

- **Graph-mode text input is not functional.** In templates using the graph (node/edge) schema, text-type questions currently show a placeholder "Continue" button instead of a real text field. Flat-schema text input works correctly.
- **Signature capture is a placeholder.** Graph-mode signature nodes save a fixed placeholder value rather than an actual signature.
- **Photos are device-local only.** Captured evidence photos are stored as local file URIs. There is no upload endpoint on the backend yet, so photos do not currently sync to the server.
- **Token storage is not encrypted.** Auth tokens are stored in AsyncStorage, which is not encrypted at rest. A migration to `expo-secure-store` is planned to close this gap.
- **No automated test suite.** There is no Jest/Detox coverage yet, particularly around the sync engine, which is the most logically critical part of the app.
- **Dark mode preference is not persisted.** It resets to light mode on every app restart.

## Related repositories

ACOMED is split across three independently deployed repositories:

- `acomed-backend` — Node.js/Express/PostgreSQL API, sync engine, scoring engine.
- `acomed-dashboard` — React.js web dashboard for supervisors (template builder, CAPA management, analytics).
- `acomed-mobile` — this repository.

## License

Academic project — Licence Génie Informatique, Faculté Polydisciplinaire de Taroudant, 2025–2026.
