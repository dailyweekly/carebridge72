import { describe, expect, it } from "vitest";
import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import { buildFallbackDraft } from "@/lib/llm-draft";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import type { CareResource, Patient } from "@/lib/types";

const patient = (patients as Patient[]).find((item) => item.id === "P003") as Patient;
const risk = calculateRisk(patient);
const candidates = matchCareResources(patient, resources as CareResource[]).candidates;

describe("LLM draft fallback", () => {
  it("creates a handoff summary without prohibited placement wording", () => {
    const text = buildFallbackDraft({ kind: "handoff", patient, risk, candidates });

    expect(text).toContain("사례 P003");
    expect(text).not.toMatch(/병원\s*추천|의료기관\s*추천|환자\s*연결|기관\s*자동\s*배정/);
  });

  it("creates a family draft without medication or dosage instructions", () => {
    const text = buildFallbackDraft({ kind: "family", patient, risk, candidates });

    expect(text).toContain("퇴원 후 첫 72시간");
    expect(text).not.toMatch(/mg|복용량|dose|medication|약물명/i);
  });
});
