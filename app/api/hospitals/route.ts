import { NextResponse } from "next/server";
import { readJsonObject, requireRecord } from "@/lib/api-route";
import { fetchHiraHospitalReferences } from "@/lib/hira-hospital";
import type { Patient } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;

  const patient = requireRecord(parsed.body, "patient");
  if (!patient.ok) return patient.response;

  const references = await fetchHiraHospitalReferences(patient.value as Pick<Patient, "region">);
  return NextResponse.json({
    source: references.length > 0 ? "hira-live" : "empty",
    references
  });
}
