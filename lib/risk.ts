import rules from "@/data/risk_rules.json";
import type { Comorbidity, Patient, RiskBand, RiskFactor, RiskResult } from "./types";

type DiagnosisRule = {
  points: number;
  label: string;
  reason: string;
};

const typedRules = rules as {
  baseScore: number;
  age: { min: number; points: number; reason: string }[];
  diagnosis: Record<string, DiagnosisRule>;
  comorbidities: Record<string, { points: number; label: string }>;
  caregiver: {
    absentPoints: number;
    presentPoints: number;
    absentReason: string;
    presentReason: string;
  };
  living: Record<string, { points: number; label: string; reason: string }>;
  notes: {
    watchWords: string[];
    points: number;
    reason: string;
  };
  model: {
    version: string;
    confidence: number;
    evidenceBasis: string[];
  };
};

export function calculateRisk(patient?: Partial<Patient> | null): RiskResult {
  if (!patient) {
    return {
      score: 25,
      band: "LOW",
      reasons: [
        "입력 정보가 부족하여 보수적인 기본값으로 표시합니다.",
        "가명 데이터만 사용되며 실제 의료 판단은 포함하지 않습니다.",
        "공공 담당자가 원자료를 확인해야 합니다."
      ],
      factors: [],
      confidence: typedRules.model.confidence,
      modelVersion: typedRules.model.version,
      evidenceBasis: typedRules.model.evidenceBasis
    };
  }

  const age = Number.isFinite(patient.age) ? Number(patient.age) : 0;
  const ageRule =
    typedRules.age.find((rule) => age >= rule.min) ?? typedRules.age[typedRules.age.length - 1];
  const diagnosis = patient.primaryDiagnosisGroup ?? "FRAILTY";
  const diagnosisRule = typedRules.diagnosis[diagnosis] ?? typedRules.diagnosis.FRAILTY;
  const comorbidities = normalizeComorbidities(patient.comorbidities);
  const comorbidityPoints = comorbidities.reduce((sum, item) => {
    return sum + (typedRules.comorbidities[item]?.points ?? 0);
  }, 0);

  const caregiverPoints = patient.caregiverPresent
    ? typedRules.caregiver.presentPoints
    : typedRules.caregiver.absentPoints;
  const living = patient.livingArrangement ?? "ALONE";
  const livingRule = typedRules.living[living] ?? typedRules.living.ALONE;

  const rawScore =
    typedRules.baseScore +
    ageRule.points +
    diagnosisRule.points +
    comorbidityPoints +
    caregiverPoints +
    livingRule.points;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const band = bandFromScore(score);
  const comorbidityLabel = comorbidities
    .filter((item) => item !== "NONE")
    .map((item) => typedRules.comorbidities[item]?.label ?? item)
    .slice(0, 2)
    .join(", ");

  const reasons = [
    ageRule.reason,
    diagnosisRule.reason,
    comorbidityLabel
      ? `${comorbidityLabel} 동반으로 퇴원 후 생활 관리 확인 필요성이 더해집니다.`
      : "동반질환 입력이 없어 추가 가중치는 낮게 반영되었습니다.",
    patient.caregiverPresent
      ? typedRules.caregiver.presentReason
      : typedRules.caregiver.absentReason
  ];

  const noteMatches = extractNoteMatches(patient.notes ?? "", typedRules.notes.watchWords);
  const factors: RiskFactor[] = [
    { axis: "age", label: `${age}세`, points: ageRule.points },
    { axis: "diagnosis", label: diagnosisRule.label, points: diagnosisRule.points },
    ...comorbidities
      .filter((item) => item !== "NONE")
      .map((item) => ({
        axis: "comorbidity" as const,
        label: typedRules.comorbidities[item]?.label ?? item,
        points: typedRules.comorbidities[item]?.points ?? 0
      })),
    {
      axis: "caregiver",
      label: patient.caregiverPresent ? "상주 돌봄자 있음" : "상주 돌봄자 없음",
      points: caregiverPoints
    },
    { axis: "living", label: livingRule.label, points: livingRule.points }
  ];

  if (noteMatches.length > 0) {
    factors.push({
      axis: "notes",
      label: `비고 키워드: ${noteMatches.join(", ")}`,
      points: typedRules.notes.points
    });
  }

  return {
    score,
    band,
    reasons: reasons.slice(0, 3),
    factors,
    confidence: typedRules.model.confidence,
    modelVersion: typedRules.model.version,
    evidenceBasis: typedRules.model.evidenceBasis
  };
}

function normalizeComorbidities(value: unknown): Comorbidity[] {
  if (!Array.isArray(value) || value.length === 0) {
    return ["NONE"];
  }
  const items = value.filter((item): item is Comorbidity => typeof item === "string") as Comorbidity[];
  return items.includes("NONE") && items.length > 1 ? items.filter((item) => item !== "NONE") : items;
}

export function bandFromScore(score: number): RiskBand {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function extractNoteMatches(notes: string, watchWords: string[]) {
  return watchWords.filter((word) => notes.includes(word));
}
