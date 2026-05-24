import { NextResponse } from "next/server";
import { createLlmDraft } from "@/lib/llm-draft";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createLlmDraft({
    kind: body.kind,
    patient: body.patient,
    risk: body.risk,
    candidates: body.candidates ?? [],
    guide: body.guide,
    memo: body.memo
  });

  return NextResponse.json(result);
}
