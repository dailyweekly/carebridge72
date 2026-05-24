import { describe, expect, it } from "vitest";
import { dataIntegrations, getIntegrationReadiness } from "@/lib/data-integrations";

describe("data integration readiness", () => {
  it("lists required production integrations", () => {
    expect(dataIntegrations.map((item) => item.id)).toContain("ANTHROPIC_CLAUDE");
    expect(dataIntegrations.map((item) => item.id)).toContain("DATA_GO_KR_NHIS_LTC");
    expect(dataIntegrations.map((item) => item.id)).toContain("HIRA_CDM");
  });

  it("reports configured and missing environment keys without exposing values", () => {
    const status = getIntegrationReadiness({
      ANTHROPIC_API_KEY: "secret-key",
      ANTHROPIC_MODEL: "claude-3-5-haiku-20241022",
      WORKSPACE_ACCESS_CODE: "7272"
    });
    const claude = status.find((item) => item.id === "ANTHROPIC_CLAUDE");

    expect(claude?.stage).toBe("configured");
    expect(claude?.configuredKeys).toEqual(["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL", "WORKSPACE_ACCESS_CODE"]);
    expect(JSON.stringify(status)).not.toContain("secret-key");
  });
});
