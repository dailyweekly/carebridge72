import { NextResponse } from "next/server";
import resources from "@/data/care_resources.mock.json";
import { readJsonObject, requireRecord } from "@/lib/api-route";
import { fetchNhisLongTermCareResources } from "@/lib/nhis-ltc";
import { matchCareResources } from "@/lib/resources";
import type { CareResource, Patient } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;

  const patient = requireRecord(parsed.body, "patient");
  if (!patient.ok) return patient.response;

  const liveResources = await fetchNhisLongTermCareResources(patient.value as Pick<Patient, "region">);
  const combinedResources = [...liveResources, ...(resources as CareResource[])];
  const result = matchCareResources(patient.value as Pick<Patient, "region">, combinedResources);
  return NextResponse.json({
    ...result,
    source: liveResources.length > 0 ? "nhis-live-with-mock-fallback" : "mock"
  });
}
