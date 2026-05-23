import { describe, expect, it } from "vitest";
import resources from "@/data/care_resources.mock.json";
import { matchCareResources } from "@/lib/resources";
import type { CareResource, Patient } from "@/lib/types";

const patient = {
  region: "GG-SUWON"
} as Patient;

describe("matchCareResources", () => {
  it("prioritizes same-region records", () => {
    const result = matchCareResources(patient, resources as CareResource[]);
    expect(result.candidates.every((candidate) => candidate.region === "GG-SUWON")).toBe(true);
  });

  it("keeps category diversity", () => {
    const result = matchCareResources(patient, resources as CareResource[]);
    const categories = new Set(result.candidates.map((candidate) => candidate.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it("does not output direct placement wording", () => {
    const result = matchCareResources(patient, resources as CareResource[]);
    expect(JSON.stringify(result)).not.toMatch(/병원\s*추천|의료기관\s*추천|자동\s*배정/);
  });
});
