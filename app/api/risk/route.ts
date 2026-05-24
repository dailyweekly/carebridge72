import { NextResponse } from "next/server";
import { calculateRisk } from "@/lib/risk";
import { readJsonObject, requireRecord } from "@/lib/api-route";
import type { Patient } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;

  const patient = requireRecord(parsed.body, "patient");
  if (!patient.ok) return patient.response;

  return NextResponse.json(calculateRisk(patient.value as Partial<Patient>));
}
