// index.ts
// Initializes the WatermelonDB database instance for the ACOMED mobile app.
// Uses SQLiteAdapter backed by the defined schema and registers all model classes.
// Import this singleton anywhere in the app to access the local database.

console.log('DATABASE INIT STARTED');

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';

// --- Model imports ---
import User from './models/User';
import Audit from './models/Audit';
import Template from './models/Template';
import Question from './models/Question';
import Answer from './models/Answer';
import Capa from './models/Capa';

// SQLiteAdapter connects WatermelonDB to the device's native SQLite engine.
// 'dbName' is the filename used on disk (without extension on iOS/Android).
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'acomed_db',
  // jsi: true,        // Uncomment for JSI (faster) mode once native build is confirmed
  // migrations,       // Add a migrations object here once schema versions are needed
});

// The Database instance is the single entry point for all read/write operations.
// All model classes must be registered in the 'modelClasses' array.
const database = new Database({
  adapter,
  modelClasses: [User, Audit, Template, Question, Answer, Capa],
});

console.log('DATABASE INITIALIZED');

// ---------------------------------------------------------------------------
// testDatabase
// Creates a fake Audit record, reads it back and logs it, then deletes it.
// Called once at module initialisation to verify the SQLite adapter is working.
// ---------------------------------------------------------------------------
async function testDatabase(): Promise<void> {
  const auditsCollection = database.get<Audit>('audits');

  await database.write(async () => {
    // 1. Create a fake audit record
    const testAudit = await auditsCollection.create((audit) => {
      audit.facilityId = 'TEST_FACILITY_001';
      audit.status = 'draft';
      audit.inspectorId = 'TEST_INSPECTOR_001';
      audit.templateId = 'TEST_TEMPLATE_001';
      // @date fields accept a timestamp in ms; cast via (audit as any) to bypass
      // the read-only Date typing on decorated properties at runtime.
      (audit as any).scheduledDate = Date.now();
      (audit as any).updatedAt = Date.now();
    });

    // 2. Read it back by ID and log
    const fetched = await auditsCollection.find(testAudit.id);
    console.log('[WatermelonDB test] Record read back:', {
      id: fetched.id,
      facilityId: fetched.facilityId,
      status: fetched.status,
      inspectorId: fetched.inspectorId,
      templateId: fetched.templateId,
      scheduledDate: fetched.scheduledDate,
      updatedAt: fetched.updatedAt,
    });

    // 3. Delete the test record (destroyPermanently must also run inside write)
    await testAudit.destroyPermanently();
  });
}

// Run once when this module is first imported
testDatabase()
  .then(() => console.log('[WatermelonDB test] Database test passed ✅'))
  .catch((err) => console.error('[WatermelonDB test] Database test FAILED ❌', err));

export default database;
