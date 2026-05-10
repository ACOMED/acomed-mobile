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

export interface AuditDetail extends Audit {
  facility_name: string;
  compliance_score: number | null;
  maturity_score: number | null;
  answers: Answer[];
}

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

export interface Template {
  id: string;
  name: string;
  code: string;
  schema: { questions: Question[] };
  created_at: string;
}

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
  const response = await authedFetch('/api/audits');
  const body = await response.json();
  return (body.data ?? body) as Audit[];
}

export async function fetchAudit(auditId: string): Promise<AuditDetail> {
  const response = await authedFetch(`/api/audits/${auditId}`);
  const body = await response.json();
  return (body.data ?? body) as AuditDetail;
}

export async function fetchTemplate(templateId: string): Promise<Template> {
  const response = await authedFetch(`/api/templates/${templateId}`);
  const body = await response.json();
  return (body.data ?? body) as Template;
}
