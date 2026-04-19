// Fake data so you can build UI without a real backend
// When backend is ready, you replace this with an API call

export const MOCK_USER = {
  id: 'MA-2024-88',
  name: 'Amina Bennani',
  inspectorId: '#44021',
  email: 'a.bennani@sante.gov.ma',
  phone: '+212 661-234-567',
  department: 'Infrastructure & Safety',
  role: 'Field Inspector',
  region: 'Zone 4',
};

export const MOCK_AUDITS = [
  {
    id: 'audit-001',
    hospitalType: 'Provincial Hospital',
    hospitalName: 'CHP Moulay Youssef',
    location: 'Casablanca-Anfa, Maroc',
    status: 'in_progress',   // in_progress | pending | completed
    progress: 65,
    lastSync: '2h ago',
    totalItems: 57,
    checkedItems: 37,
    issuesCount: 8,
  },
  {
    id: 'audit-002',
    hospitalType: 'Private Clinic',
    hospitalName: 'Clinic Atlas Health',
    location: 'Maarif, Casablanca',
    status: 'pending',
    progress: 0,
    lastSync: null,
    totalItems: 42,
    checkedItems: 0,
    issuesCount: 0,
  },
  {
    id: 'audit-003',
    hospitalType: 'University Hospital',
    hospitalName: 'Hôpital Cheikh Zaid',
    location: 'Rabat, Maroc',
    status: 'completed',
    progress: 100,
    lastSync: '3h ago',
    totalItems: 50,
    checkedItems: 50,
    issuesCount: 3,
  },
];

export const MOCK_QUESTIONS = [
  {
    id: 'hyg-01',
    sectionId: 'hygiene',
    sectionLabel: 'HYGIENE & SANITATION',
    code: 'HYG-01',
    text: 'Are handwashing stations equipped with soap and disposable towels?',
    response: 'pass',       // pass | fail | na | null
    hasPhoto: true,
    hasNote: false,
    prerequisiteId: null,   // null means always shown
  },
  {
    id: 'hyg-02',
    sectionId: 'hygiene',
    sectionLabel: 'HYGIENE & SANITATION',
    code: 'HYG-02',
    text: 'Cleaning schedules are posted and signed by responsible staff.',
    response: 'fail',
    hasPhoto: false,
    hasNote: true,
    prerequisiteId: null,
  },
  {
    id: 'eqp-01',
    sectionId: 'equipment',
    sectionLabel: 'EQUIPMENT MAINTENANCE',
    code: 'EQP-01',
    text: 'Emergency defibrillators (AED) are inspected and within battery date.',
    response: null,
    hasPhoto: false,
    hasNote: false,
    prerequisiteId: null,
  },
  {
    id: 'eqp-02',
    sectionId: 'equipment',
    sectionLabel: 'EQUIPMENT MAINTENANCE',
    code: 'EQP-02',
    text: 'Temperature logs for medication refrigerators are current and within range.',
    response: 'pass',
    hasPhoto: false,
    hasNote: true,
    prerequisiteId: 'eqp-01',  // only shown if eqp-01 is answered
  },
  {
    id: 'adm-01',
    sectionId: 'admin',
    sectionLabel: 'ADMINISTRATION',
    code: 'ADM-01',
    text: 'Patient privacy notices are clearly displayed in the waiting area.',
    response: 'na',
    hasPhoto: false,
    hasNote: false,
    prerequisiteId: null,
  },
];

export const MOCK_ISSUES = [
  {
    id: 'nc-001',
    code: 'NC-001',
    title: 'Inadequate medical waste labeling',
    section: 'Section 2.4 – Hygiene',
    severity: 'high',   // high | medium | low
    status: 'open',
  },
  {
    id: 'nc-002',
    code: 'NC-002',
    title: 'Missing hand hygiene stations in ICU',
    section: 'Section 1.1 – Infection Control',
    severity: 'high',
    status: 'open',
  },
  {
    id: 'nc-003',
    code: 'NC-003',
    title: 'Expired fire extinguisher in storage room',
    section: 'Section 3.2 – Safety Equipment',
    severity: 'medium',
    status: 'in_progress',
  },
];