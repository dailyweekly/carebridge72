import { describe, expect, it } from "vitest";
import patients from "@/data/patients.mock.json";
import { POST as guidePost } from "@/app/api/guide/route";
import { POST as hospitalsPost } from "@/app/api/hospitals/route";
import { POST as resourcesPost } from "@/app/api/resources/route";
import { POST as riskPost } from "@/app/api/risk/route";
import { calculateRisk } from "@/lib/risk";
import type { Patient } from "@/lib/types";

const patient = (patients as Patient[]).find((item) => item.id === "P003") as Patient;
const risk = calculateRisk(patient);

describe("core API route validation", () => {
  it("returns 400 for malformed JSON instead of throwing", async () => {
    const response = await riskPost(
      new Request("http://localhost/api/risk", {
        method: "POST",
        body: "{"
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid json body");
  });

  it("requires patient input for risk, resources, and hospitals", async () => {
    const body = {};

    const riskResponse = await riskPost(makeRequest("/api/risk", body));
    const resourcesResponse = await resourcesPost(makeRequest("/api/resources", body));
    const hospitalsResponse = await hospitalsPost(makeRequest("/api/hospitals", body));

    expect(riskResponse.status).toBe(400);
    expect(resourcesResponse.status).toBe(400);
    expect(hospitalsResponse.status).toBe(400);
  });

  it("requires guide candidates to be an array", async () => {
    const response = await guidePost(
      makeRequest("/api/guide", {
        patient,
        risk,
        candidates: {}
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("candidates must be an array");
  });

  it("returns normal results for valid core route inputs", async () => {
    const riskResponse = await riskPost(makeRequest("/api/risk", { patient }));
    const guideResponse = await guidePost(
      makeRequest("/api/guide", {
        patient,
        risk,
        candidates: [],
        lang: "ko"
      })
    );

    expect(riskResponse.status).toBe(200);
    expect(guideResponse.status).toBe(200);
  });
});

function makeRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}
