import { NextResponse } from "next/server";
import { createLlmDraft } from "@/lib/llm-draft";

export async function POST(request: Request) {
  const accessCode = process.env.WORKSPACE_ACCESS_CODE || "7272";
  const providedCode = request.headers.get("x-carebridge-access-code");
  if (providedCode !== accessCode) {
    return NextResponse.json({ error: "workspace access required" }, { status: 401 });
  }

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
