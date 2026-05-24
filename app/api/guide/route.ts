import { NextResponse } from "next/server";
import { readJsonObject, requireArray, requireRecord } from "@/lib/api-route";
import { generateFamilyGuide } from "@/lib/guide";
import type { CareResource, Language, Patient, RiskResult } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;

  const patient = requireRecord(parsed.body, "patient");
  if (!patient.ok) return patient.response;

  const risk = requireRecord(parsed.body, "risk");
  if (!risk.ok) return risk.response;

  const candidates = requireArray(parsed.body, "candidates");
  if (!candidates.ok) return candidates.response;

  return NextResponse.json(
    generateFamilyGuide(
      patient.value as Patient,
      risk.value as RiskResult,
      candidates.value as CareResource[],
      parsed.body.lang as Language
    )
  );
}
