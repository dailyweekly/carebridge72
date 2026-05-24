import packageJson from "@/package.json";
import riskRules from "@/data/risk_rules.json";
import { getIntegrationReadiness } from "./data-integrations";

type HealthStatus = "ok" | "degraded";

export function getServiceHealth(env: Record<string, string | undefined> = process.env) {
  const integrations = getIntegrationReadiness(env);
  const missingP1 = integrations.filter((item) => item.priority === "P1" && item.stage === "missing");
  const summary = {
    configured: integrations.filter((item) => item.stage === "configured").length,
    missing: integrations.filter((item) => item.stage === "missing").length,
    procedural: integrations.filter((item) => item.stage === "procedural").length,
    p1Missing: missingP1.map((item) => item.id)
  };
  const status: HealthStatus = missingP1.length > 0 ? "degraded" : "ok";

  return {
    service: "carebridge72",
    status,
    generatedAt: new Date().toISOString(),
    appVersion: packageJson.version,
    riskModelVersion: riskRules.model.version,
    dataMode: {
      patientData: "pseudonym-mock-only",
      publicApi: env.DATA_GO_KR_SERVICE_KEY ? "enabled-with-fallback" : "fallback-only",
      llm: env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY ? "claude-enabled" : "fallback-only",
      hiraCdm: "procedural-request"
    },
    operationalControls: {
      workspaceAccess: env.WORKSPACE_ACCESS_CODE ? "enabled" : "default-code",
      llmCostControl: "workspace-gated",
      llmFailureMode: "deterministic-fallback",
      publicApiFailureMode: "mock-fallback",
      privacyInputFilter: "enabled",
      outputPolicyCheck: "enabled",
      patientIdentifiers: "not-collected"
    },
    readiness: summary,
    routes: [
      "/",
      "/readiness",
      "/workspace",
      "/capture",
      "/api/risk",
      "/api/resources",
      "/api/guide",
      "/api/hospitals",
      "/api/llm/draft",
      "/api/integrations/status",
      "/api/health"
    ]
  };
}
