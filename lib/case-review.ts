import { bandLabels } from "./labels";
import type { Patient, ReviewCase, RiskBand, RiskResult } from "./types";

export const REVIEW_WINDOW_HOURS = 72;
export const DEMO_REVIEW_REFERENCE_AT = "2026-05-23T09:00:00.000Z";
const REFERENCE_NOW = Date.parse(DEMO_REVIEW_REFERENCE_AT);

export type ReviewWindowStatus = "검토 필요" | "일반 확인" | "72시간 초과" | "퇴원 전";

export type CaseReviewSignal = {
  elapsedHours: number;
  remainingHours: number;
  windowStatus: ReviewWindowStatus;
  priorityScore: number;
  reasons: string[];
  referenceAt: string;
  referenceLabel: string;
};

export function assessCaseReview(
  patient: Patient,
  risk: Pick<RiskResult, "band">,
  reviewCase?: Pick<ReviewCase, "channel">
): CaseReviewSignal {
  const elapsedHours = getElapsedHours(patient.dischargeDate);
  const remainingHours = REVIEW_WINDOW_HOURS - elapsedHours;
  const withinWindow = elapsedHours >= 0 && remainingHours >= 0;
  const urgentWindow = withinWindow && remainingHours <= 24;
  const reasons = buildReviewReasons(patient, risk.band, withinWindow, urgentWindow);
  const windowStatus = getWindowStatus(elapsedHours, remainingHours, reasons);
  const priorityScore = getPriorityScore(patient, risk.band, withinWindow, urgentWindow, reviewCase?.channel);

  return {
    elapsedHours,
    remainingHours,
    windowStatus,
    priorityScore,
    reasons,
    referenceAt: DEMO_REVIEW_REFERENCE_AT,
    referenceLabel: formatReferenceLabel(DEMO_REVIEW_REFERENCE_AT)
  };
}

export function sortCasesByReviewPriority<T extends ReviewCase>(
  cases: T[],
  patients: Patient[],
  riskByPatientId: (patient: Patient) => Pick<RiskResult, "band">
) {
  return [...cases].sort((a, b) => {
    const patientA = patients.find((patient) => patient.id === a.patientId);
    const patientB = patients.find((patient) => patient.id === b.patientId);
    if (!patientA || !patientB) return patientA ? -1 : 1;

    const signalA = assessCaseReview(patientA, riskByPatientId(patientA), a);
    const signalB = assessCaseReview(patientB, riskByPatientId(patientB), b);
    return signalB.priorityScore - signalA.priorityScore || signalA.remainingHours - signalB.remainingHours;
  });
}

function getElapsedHours(dischargeDate: string) {
  const dischargedAt = parseDateOnly(dischargeDate);
  if (!dischargedAt) return REVIEW_WINDOW_HOURS;
  return Math.max(-24, Math.round((REFERENCE_NOW - dischargedAt.getTime()) / (60 * 60 * 1000)));
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

function getWindowStatus(elapsedHours: number, remainingHours: number, reasons: string[]): ReviewWindowStatus {
  if (elapsedHours < 0) return "퇴원 전";
  if (remainingHours < 0) return "72시간 초과";
  return reasons.some((reason) => reason !== "72시간 내 확인") ? "검토 필요" : "일반 확인";
}

function buildReviewReasons(
  patient: Patient,
  band: RiskBand,
  withinWindow: boolean,
  urgentWindow: boolean
) {
  const reasons: string[] = [];
  if (withinWindow) reasons.push(urgentWindow ? "72시간 임박" : "72시간 내 확인");
  if (band === "HIGH") reasons.push(`${bandLabels[band]} 위험 신호`);
  if (band === "MEDIUM") reasons.push(`${bandLabels[band]} 위험 신호`);
  if (!patient.caregiverPresent) reasons.push("상주 돌봄자 없음");
  if (patient.livingArrangement === "ALONE") reasons.push("단독 거주");
  if (patient.preferredLanguage !== "ko") reasons.push("다국어 안내 필요");
  return reasons.length > 0 ? reasons : ["일반 퇴원 확인"];
}

function formatReferenceLabel(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:00 기준`;
}

function getPriorityScore(
  patient: Patient,
  band: RiskBand,
  withinWindow: boolean,
  urgentWindow: boolean,
  channel?: ReviewCase["channel"]
) {
  let score = 0;
  if (withinWindow) score += 20;
  if (urgentWindow) score += 20;
  if (band === "HIGH") score += 60;
  if (band === "MEDIUM") score += 25;
  if (!patient.caregiverPresent) score += 18;
  if (patient.livingArrangement === "ALONE") score += 12;
  if (patient.preferredLanguage !== "ko") score += 8;
  if (channel === "B2G") score += 5;
  if (!withinWindow) score -= 15;
  return score;
}
