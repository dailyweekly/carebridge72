import { describe, expect, it } from "vitest";
import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import { generateFamilyGuide } from "@/lib/guide";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import type { CareResource, Language, Patient } from "@/lib/types";

const patient = (patients as Patient[])[0];
const risk = calculateRisk(patient);
const candidates = matchCareResources(patient, resources as CareResource[]).candidates;

describe("generateFamilyGuide", () => {
  it("renders ko, en, vi, and zh guides", () => {
    for (const lang of ["ko", "en", "vi", "zh"] as Language[]) {
      const guide = generateFamilyGuide(patient, risk, candidates, lang);
      expect(guide.language).toBe(lang);
      expect(guide.text.length).toBeGreaterThan(40);
    }
  });

  it("does not include diagnosis, medication, or dosage tokens", () => {
    const guide = generateFamilyGuide(patient, risk, candidates, "ko");
    expect(guide.text).not.toMatch(/진단|약|mg|복용량|dose|medication/i);
  });

  it("returns visible text only after safety validation passes", () => {
    const guide = generateFamilyGuide(patient, risk, candidates, "en");
    expect(guide.safety.pass).toBe(true);
    expect(guide.text).not.toContain("안전선 검사 실패");
  });

  it("selects vi and zh diagnosis-specific templates for P004 and P002", () => {
    const patientP004 = (patients as Patient[]).find((item) => item.id === "P004");
    const patientP002 = (patients as Patient[]).find((item) => item.id === "P002");
    if (!patientP004 || !patientP002) throw new Error("fixture patients missing");

    const viGuide = generateFamilyGuide(
      patientP004,
      calculateRisk(patientP004),
      matchCareResources(patientP004, resources as CareResource[]).candidates,
      "vi"
    );
    const zhGuide = generateFamilyGuide(
      patientP002,
      calculateRisk(patientP002),
      matchCareResources(patientP002, resources as CareResource[]).candidates,
      "zh"
    );

    expect(viGuide.language).toBe("vi");
    expect(viGuide.text).toContain("tinh trang tho");
    expect(zhGuide.language).toBe("zh");
    expect(zhGuide.text).toContain("体温记录");
    expect(`${viGuide.text}\n${zhGuide.text}`).not.toMatch(/심부전|COPD|폐렴|mg|복용량|dose|medication/i);
  });
});
