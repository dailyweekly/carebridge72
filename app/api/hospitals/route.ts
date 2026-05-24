import { NextResponse } from "next/server";
import { fetchHiraHospitalReferences } from "@/lib/hira-hospital";

export async function POST(request: Request) {
  const body = await request.json();
  const references = await fetchHiraHospitalReferences(body.patient);
  return NextResponse.json({
    source: references.length > 0 ? "hira-live" : "empty",
    references
  });
}
