import { NextResponse } from "next/server";
import resources from "@/data/care_resources.mock.json";
import { fetchNhisLongTermCareResources } from "@/lib/nhis-ltc";
import { matchCareResources } from "@/lib/resources";
import type { CareResource } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const liveResources = await fetchNhisLongTermCareResources(body.patient);
  const combinedResources = [...liveResources, ...(resources as CareResource[])];
  const result = matchCareResources(body.patient, combinedResources);
  return NextResponse.json({
    ...result,
    source: liveResources.length > 0 ? "nhis-live-with-mock-fallback" : "mock"
  });
}
