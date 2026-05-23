export type DiagnosisGroup =
  | "HEART_FAILURE"
  | "COPD"
  | "STROKE"
  | "PNEUMONIA"
  | "FRAILTY";

export type Comorbidity =
  | "DIABETES"
  | "CKD_STAGE_3"
  | "HYPERTENSION"
  | "DEMENTIA"
  | "MOBILITY_LIMITATION"
  | "NONE";

export type RegionCode = "GG-SUWON" | "GG-GOYANG" | "GG-SEONGNAM" | "GG-ANSAN";

export type Language = "ko" | "en" | "vi" | "zh";

export type LivingArrangement = "ALONE" | "WITH_FAMILY" | "FACILITY";

export type RiskBand = "LOW" | "MEDIUM" | "HIGH";

export type Patient = {
  id: string;
  age: number;
  dischargeDate: string;
  primaryDiagnosisGroup: DiagnosisGroup;
  comorbidities: Comorbidity[];
  region: RegionCode;
  livingArrangement: LivingArrangement;
  caregiverPresent: boolean;
  preferredLanguage: Language;
  notes: string;
};

export type RiskFactor = {
  axis: "age" | "diagnosis" | "comorbidity" | "caregiver" | "living" | "notes";
  label: string;
  points: number;
};

export type RiskResult = {
  score: number;
  band: RiskBand;
  reasons: string[];
  factors: RiskFactor[];
  confidence: number;
  modelVersion: string;
  evidenceBasis: string[];
};

export type CareResource = {
  id: string;
  region: RegionCode;
  regionLabel: string;
  name: string;
  category: "VISITING_NURSING" | "HOME_CARE" | "DAY_CARE" | "MEAL_SUPPORT" | "TRANSPORT";
  distanceKm: number;
  publicContact: string;
  operatingWindow: string;
  notes: string;
};

export type ResourceMatch = {
  candidates: CareResource[];
  rationale: string;
};

export type CandidateReviewStatus = "검토 대상" | "보류" | "제외";

export type LegalFlag = {
  level: "RED" | "YELLOW";
  pattern: string;
  snippet: string;
};

export type LegalValidation = {
  pass: boolean;
  flagged: LegalFlag[];
};

export type FamilyGuide = {
  text: string;
  language: Language;
  safety: LegalValidation;
  sourceUrls: string[];
  updatedAt: string;
};

export type PublicDataSource = {
  id: string;
  name: string;
  provider: string;
  use: string;
  status: "MOCK_PUBLIC" | "FORMAL_REQUEST" | "BETA_TARGET";
  updateCycle: string;
  url: string;
};

export type ReviewCase = {
  id: string;
  patientId: string;
  owner: "시군 통합돌봄" | "병원 사회사업실";
  stage: "접수" | "검토 중" | "가족 안내 준비" | "담당자 판단 대기";
  dueHours: number;
  channel: "B2G" | "B2B";
};

export type AuditLogEntry = {
  id: string;
  at: string;
  actor: "시군 담당자" | "병원 사회사업실" | "시스템";
  action: string;
  detail: string;
};
