import { NextResponse } from "next/server";
import { generateFamilyGuide } from "@/lib/guide";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    generateFamilyGuide(body.patient, body.risk, body.candidates, body.lang)
  );
}
