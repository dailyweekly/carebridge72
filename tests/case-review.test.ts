import { describe, expect, it } from "vitest";
import { assessCaseReview, sortCasesByReviewPriority } from "@/lib/case-review";
import { calculateRisk } from "@/lib/risk";
import type { Patient, ReviewCase } from "@/lib/types";

const highWithin72: Patient = {
  id: "P-HIGH",
  age: 78,
  dischargeDate: "2026-05-22",
  primaryDiagnosisGroup: "HEART_FAILURE",
  comorbidities: ["DIABETES", "CKD_STAGE_3"],
  region: "GG-SUWON",
  livingArrangement: "ALONE",
  caregiverPresent: false,
  preferredLanguage: "en",
  notes: "단독 거주"
};

const lowExpired: Patient = {
  id: "P-LOW",
  age: 58,
  dischargeDate: "2026-05-18",
  primaryDiagnosisGroup: "PNEUMONIA",
  comorbidities: ["NONE"],
  region: "GG-GOYANG",
  livingArrangement: "WITH_FAMILY",
  caregiverPresent: true,
  preferredLanguage: "ko",
  notes: ""
};

describe("case review assessment", () => {
  it("marks high risk discharge within 72 hours as review needed with concrete reasons", () => {
    const signal = assessCaseReview(highWithin72, calculateRisk(highWithin72), { channel: "B2G" });

    expect(signal.windowStatus).toBe("검토 필요");
    expect(signal.elapsedHours).toBe(33);
    expect(signal.remainingHours).toBe(39);
    expect(signal.reasons).toContain("HIGH 위험 신호");
    expect(signal.reasons).toContain("상주 돌봄자 없음");
    expect(signal.reasons).toContain("단독 거주");
  });

  it("marks cases outside the first 72 hours as expired", () => {
    const signal = assessCaseReview(lowExpired, calculateRisk(lowExpired), { channel: "B2B" });

    expect(signal.windowStatus).toBe("72시간 초과");
    expect(signal.remainingHours).toBeLessThan(0);
  });

  it("sorts active high risk cases ahead of lower priority cases", () => {
    const cases: ReviewCase[] = [
      { id: "CASE-LOW", patientId: "P-LOW", owner: "병원 사회사업실", stage: "사후 확인", dueHours: 0, channel: "B2B" },
      { id: "CASE-HIGH", patientId: "P-HIGH", owner: "시군 통합돌봄", stage: "담당자 판단 대기", dueHours: 39, channel: "B2G" }
    ];

    const sorted = sortCasesByReviewPriority(cases, [lowExpired, highWithin72], calculateRisk);

    expect(sorted[0]?.id).toBe("CASE-HIGH");
  });
});
