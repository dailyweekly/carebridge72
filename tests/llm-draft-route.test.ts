import { afterEach, describe, expect, it } from "vitest";
import patients from "@/data/patients.mock.json";
import { POST } from "@/app/api/llm/draft/route";
import { calculateRisk } from "@/lib/risk";
import type { Patient } from "@/lib/types";

const originalEnv = {
  accessCode: process.env.WORKSPACE_ACCESS_CODE,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY
};
const patient = (patients as Patient[]).find((item) => item.id === "P003") as Patient;
const risk = calculateRisk(patient);

afterEach(() => {
  restoreEnv("WORKSPACE_ACCESS_CODE", originalEnv.accessCode);
  restoreEnv("ANTHROPIC_API_KEY", originalEnv.anthropicApiKey);
  restoreEnv("CLAUDE_API_KEY", originalEnv.claudeApiKey);
});

describe("LLM draft route", () => {
  it("rejects requests without workspace access", async () => {
    process.env.WORKSPACE_ACCESS_CODE = "9999";

    const response = await POST(makeRequest({ code: "0000", body: validBody() }));

    expect(response.status).toBe(401);
  });

  it("rejects malformed JSON and invalid draft kind", async () => {
    process.env.WORKSPACE_ACCESS_CODE = "9999";

    const malformed = await POST(
      new Request("http://localhost/api/llm/draft", {
        method: "POST",
        headers: { "x-carebridge-access-code": "9999" },
        body: "{"
      })
    );
    const invalidKind = await POST(makeRequest({ code: "9999", body: { ...validBody(), kind: "other" } }));

    expect(malformed.status).toBe(400);
    expect(invalidKind.status).toBe(400);
  });

  it("returns a fallback draft when Claude credentials are absent", async () => {
    process.env.WORKSPACE_ACCESS_CODE = "9999";
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLAUDE_API_KEY;

    const response = await POST(makeRequest({ code: "9999", body: validBody() }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("fallback");
    expect(body.promptVersion).toBe("CB72-PROMPT-v2026.05.25");
    expect(body.safetyPass).toBe(true);
    expect(body.text).toContain("사례 P003");
  });
});

function makeRequest({ code, body }: { code: string; body: unknown }) {
  return new Request("http://localhost/api/llm/draft", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-carebridge-access-code": code
    },
    body: JSON.stringify(body)
  });
}

function validBody() {
  return {
    kind: "handoff",
    patient,
    risk,
    candidates: [],
    memo: "식사와 이동 공백 확인"
  };
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
