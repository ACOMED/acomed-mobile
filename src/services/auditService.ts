import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from './authService';

const BASE_URL = 'https://api.acomed.tech';

export interface Audit {
  id: string;
  ref: string;
  facility: string;
  inspector: string;
  date: string;
  status: string;
}

export interface Answer {
  id: string;
  audit_id: string;
  question_id: string;
  response_value: string;
  created_at: string;
  updated_at: string;
}

export interface AuditResponse {
  id: string;
  question_id: string;
  question_text: string;
  answer_value: string;
  evidence_url: string | null;
}

export interface AuditDetail extends Audit {
  code: string;
  facility_name: string;
  inspector_name: string;
  template_id: string | null;
  compliance_score: number | null;
  maturity_score: number | null;
  answers: Answer[];
  responses: AuditResponse[];
}

// ── Flat schema ───────────────────────────────────────────────────────────────

export interface Question {
  question_id: string;
  type: string;
  label: string;
  required: boolean;
  reg_points: number;
  mat_points: number;
  trigger_capa: boolean;
  capa_severity: string | null;
  parent_question_id: string | null;
  prerequisite_condition: 'EQUALS_YES' | 'EQUALS_NO' | null;
}

export interface FlatTemplateSchema {
  questions: Question[];
}

// ── Graph schema ──────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  sourceHandle: 'out' | 'yes' | 'no';
  targetNodeId: string;
  targetHandle?: string;
}

export interface GraphTemplateSchema {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type TemplateSchema = FlatTemplateSchema | GraphTemplateSchema;

export function isGraphSchema(schema: TemplateSchema): schema is GraphTemplateSchema {
  return Array.isArray((schema as GraphTemplateSchema).nodes) &&
         Array.isArray((schema as GraphTemplateSchema).edges);
}

export function isFlatSchema(schema: TemplateSchema): schema is FlatTemplateSchema {
  return !isGraphSchema(schema);
}

// ── Template ──────────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  code: string;
  schema: TemplateSchema;
  created_at: string;
}

// ── Network ───────────────────────────────────────────────────────────────────

async function authedFetch(path: string): Promise<Response> {
  const token = await authService.getToken();
  if (!token) throw new Error('Not authenticated.');

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (networkErr) {
    console.error('[auditService] Network error:', networkErr);
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }

  if (response.status === 401) throw new Error('Session expired. Please log in again.');
  if (!response.ok) throw new Error(`Server error (${response.status}). Please try again later.`);

  return response;
}

export async function fetchAudits(): Promise<Audit[]> {
  try {
    const data = await authedFetch('/api/audits')
      .then(r => r.json())
      .then(b => (b.data ?? b) as Audit[]);
    await AsyncStorage.setItem('cache_audits', JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = await AsyncStorage.getItem('cache_audits');
    if (cached) {
      console.log('[auditService] Offline — serving audits from cache');
      return JSON.parse(cached) as Audit[];
    }
    throw err;
  }
}

export async function fetchAudit(auditId: string): Promise<AuditDetail> {
  const key = `cache_audit_${auditId}`;
  try {
    const data = await authedFetch(`/api/audits/${auditId}`)
      .then(r => r.json())
      .then(b => (b.data ?? b) as AuditDetail);
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      console.log(`[auditService] Offline — serving audit ${auditId} from cache`);
      return JSON.parse(cached) as AuditDetail;
    }
    throw err;
  }
}

export async function fetchTemplate(templateId: string): Promise<Template> {
  const key = `cache_template_${templateId}`;
  try {
    const data = await authedFetch(`/api/templates/${templateId}`)
      .then(r => r.json())
      .then(b => (b.data ?? b) as Template);
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      console.log(`[auditService] Offline — serving template ${templateId} from cache`);
      return JSON.parse(cached) as Template;
    }
    throw err;
  }
}
