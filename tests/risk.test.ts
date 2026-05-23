import { describe, expect, it } from "vitest";
import { calculateRisk } from "@/lib/risk";
import type { Patient } from "@/lib/types";

const base: Patient = {
  id: "PTEST",
  age: 60,
  dischargeDate: "2026-05-20",
  primaryDiagnosisGroup: "PNEUMONIA",
  comorbidities: ["NONE"],
  region: "GG-SUWON",
  livingArrangement: "WITH_FAMILY",
  caregiverPresent: true,
  preferredLanguage: "ko",
  notes: ""
};

describe("calculateRisk", () => {
  it("classifies 75+ heart failure with CKD3 as HIGH", () => {
    const result = calculateRisk({
      ...base,
      age: 78,
      primaryDiagnosisGroup: "HEART_FAILURE",
      comorbidities: ["DIABETES", "CKD_STAGE_3"],
      livingArrangement: "ALONE",
      caregiverPresent: false
    });
    expect(result.band).toBe("HIGH");
    expect(result.score).toBe(78);
    expect(result.reasons).toHaveLength(3);
  });

  it("classifies 60-year pneumonia with caregiver as LOW", () => {
    const result = calculateRisk(base);
    expect(result.band).toBe("LOW");
    expect(result.score).toBeLessThan(40);
  });

  it("returns a safe default when input is missing", () => {
    const result = calculateRisk(null);
    expect(result.band).toBe("LOW");
    expect(result.reasons[0]).toContain("입력 정보");
  });
});
