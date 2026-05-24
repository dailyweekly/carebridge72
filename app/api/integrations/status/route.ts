import { NextResponse } from "next/server";
import { getIntegrationReadiness } from "@/lib/data-integrations";

export function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    integrations: getIntegrationReadiness().map((item) => ({
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
