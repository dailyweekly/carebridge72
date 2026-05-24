import { describe, expect, it } from "vitest";
import { getServiceHealth } from "@/lib/service-health";

describe("service health", () => {
  it("summarizes deployment readiness without exposing secret values", () => {
    const health = getServiceHealth({
      ANTHROPIC_API_KEY: "secret-anthropic",
      ANTHROPIC_MODEL: "claude-3-5-haiku-20241022",
      WORKSPACE_ACCESS_CODE: "7272",
      DATA_GO_KR_SERVICE_KEY: "secret-public-data"
    });
    const serialized = JSON.stringify(health);

    expect(health.service).toBe("carebridge72");
    expect(health.appVersion).toBe("0.1.0");
    expect(health.riskModelVersion).toContain("CB72");
    expect(health.dataMode.publicApi).toBe("enabled-with-fallback");
    expect(health.dataMode.llm).toBe("claude-enabled");
    expect(health.operationalControls.workspaceAccess).toBe("enabled");
    expect(health.operationalControls.llmCostControl).toBe("workspace-gated");
    expect(health.operationalControls.patientIdentifiers).toBe("not-collected");
    expect(health.routes).toContain("/api/health");
    expect(serialized).not.toContain("secret-anthropic");
    expect(serialized).not.toContain("secret-public-data");
  });

  it("marks missing P1 integrations as degraded while preserving fallback mode", () => {
    const health = getServiceHealth({});

    expect(health.status).toBe("degraded");
    expect(health.dataMode.publicApi).toBe("fallback-only");
    expect(health.dataMode.llm).toBe("fallback-only");
    expect(health.operationalControls.workspaceAccess).toBe("default-code");
    expect(health.operationalControls.outputPolicyCheck).toBe("enabled");
    expect(health.readiness.p1Missing).toContain("ANTHROPIC_CLAUDE");
    expect(health.readiness.p1Missing).toContain("DATA_GO_KR_NHIS_LTC");
  });
});
