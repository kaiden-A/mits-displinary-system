export interface Offence {
  code: string;
  name: string;
  points: number;
}

export interface CaseEvent {
  ts: string;
  text: string;
  by_name: string;
  by_role: string;
}

export interface B02Form {
  id: number;
  fill_by: string;
  fill_role: string;
  filled_at: string;
  fields: Record<string, string>;
}

export interface CaseDoc {
  doc_code: string;
  data: Record<string, unknown>;
}

export interface CaseSummary {
  id: number;
  seq: number;
  source: string;
  status: string;
  student_source_id: number;
  student_snapshot: { name: string; kelas_label: string; tingkatan?: number; kelas?: string; ic_number?: string };
  reporter_name: string;
  reporter_role: string;
  points: number;
  details: string;
  warning_level: string;
  meeting?: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface CaseDetail extends CaseSummary {
  offences: Offence[];
  events: CaseEvent[];
  b02_forms: B02Form[];
  docs: CaseDoc[];
  b01?: Record<string, unknown> | null;
  b03?: Record<string, unknown> | null;
  b05?: Record<string, unknown> | null;
  b06?: Record<string, unknown> | null;
  b07?: Record<string, unknown> | null;
  b08?: Record<string, unknown> | null;
}

export interface StudentSummary {
  student: Student;
  cases: CaseSummary[];
  historical_points: number;
}

export interface Notification {
  id: number;
  ntype: string;
  case_id: number | null;
  text: string;
  read: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  ic_number: string;
  name: string;
  gender: string;
  tingkatan: number;
  kelas: string;
  birth_year: number;
  year: number;
}

export interface LadderTier {
  tier: number;
  up_to: number;
  label: string;
  steps: string[];
}

export interface CaseStep {
  text: string;
  actor: string;
  action: string;
}
