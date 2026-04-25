// schema.ts
// Defines the WatermelonDB database schema for the ACOMED mobile app.
// Each tableSchema corresponds to a local SQLite table synced with the backend.

import { appSchema, tableSchema } from '@nozbe/watermelondb';

const schema = appSchema({
  version: 1,
  tables: [
    // Stores authenticated inspector/user account details
    tableSchema({
      name: 'users',
      columns: [
        { name: 'full_name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'inspector_id', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'token', type: 'string' },
      ],
    }),

    // Stores audit sessions assigned to inspectors for specific facilities
    tableSchema({
      name: 'audits',
      columns: [
        { name: 'facility_id', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'inspector_id', type: 'string' },
        { name: 'template_id', type: 'string' },
        { name: 'scheduled_date', type: 'number' }, // stored as Unix timestamp (ms)
        { name: 'updated_at', type: 'number' },     // stored as Unix timestamp (ms)
      ],
    }),

    // Stores audit templates (forms) that define the structure of an inspection
    tableSchema({
      name: 'templates',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'updated_at', type: 'number' }, // stored as Unix timestamp (ms)
      ],
    }),

    // Stores individual inspection questions belonging to a template section
    tableSchema({
      name: 'questions',
      columns: [
        { name: 'template_id', type: 'string' },
        { name: 'section_id', type: 'string' },
        { name: 'question_text', type: 'string' },
        { name: 'answer_type', type: 'string' },
        { name: 'parent_question_id', type: 'string' },
        { name: 'prerequisite_condition', type: 'string' },
        { name: 'required', type: 'boolean' },
      ],
    }),

    // Stores inspector responses to individual questions within an audit
    tableSchema({
      name: 'answers',
      columns: [
        { name: 'audit_id', type: 'string' },
        { name: 'question_id', type: 'string' },
        { name: 'response_value', type: 'string' },
        { name: 'updated_at', type: 'number' }, // stored as Unix timestamp (ms)
      ],
    }),

    // Stores Corrective and Preventive Actions (CAPAs) raised from non-conformities
    tableSchema({
      name: 'capas',
      columns: [
        { name: 'audit_id', type: 'string' },
        { name: 'non_conformity_desc', type: 'string' },
        { name: 'assigned_to', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'due_date', type: 'number' },    // stored as Unix timestamp (ms)
        { name: 'updated_at', type: 'number' },  // stored as Unix timestamp (ms)
      ],
    }),
  ],
});

export default schema;
