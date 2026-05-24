import { NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/lib/data-integrations";

export function GET() {
  const integrations = getIntegrationReadiness();
  const summary = {
    configured: integrations.filter((item) => item.stage === "configured").length,
    missing: integrations.filter((item) => item.stage === "missing").length,
    procedural: integrations.filter((item) => item.stage === "procedural").length
  };

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary,
    integrations: integrations.map((item) => ({
      id: item.id,
      name: item.name,
      provider: item.provider,
      purpose: item.purpose,
      priority: item.priority,
      stage: item.stage,
      configuredKeys: item.configuredKeys,
      missingKeys: item.missingKeys,
      obtainFrom: item.obtainFrom,
      url: item.url
    }))
  });
}
