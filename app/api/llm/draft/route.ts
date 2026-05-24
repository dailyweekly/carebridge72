import { NextResponse } from "next/server";
import { createLlmDraft } from "@/lib/llm-draft";
import type { DraftKind } from "@/lib/llm-draft";

export async function POST(request: Request) {
  const accessCode = process.env.WORKSPACE_ACCESS_CODE || "7272";
  const providedCode = request.headers.get("x-carebridge-access-code");
  if (providedCode !== accessCode) {
    return NextResponse.json({ error: "workspace access required" }, { status: 401 });
  }

  const body = await parseJson(request);
  if (!body) {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const validation = validateDraftBody(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await createLlmDraft(validation.value);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "draft generation failed" }, { status: 500 });
  }
}

async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validateDraftBody(body: unknown):
  | {
      ok: true;
      value: Parameters<typeof createLlmDraft>[0];
    }
  | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "request body must be an object" };
  }
  if (!isDraftKind(body.kind)) {
    return { ok: false, error: "kind must be handoff or family" };
  }
  if (!isRecord(body.patient)) {
    return { ok: false, error: "patient is required" };
  }
  if (!isRecord(body.risk)) {
    return { ok: false, error: "risk is required" };
  }

  return {
    ok: true,
    value: {
      kind: body.kind,
      patient: body.patient as Parameters<typeof createLlmDraft>[0]["patient"],
      risk: body.risk as Parameters<typeof createLlmDraft>[0]["risk"],
      candidates: Array.isArray(body.candidates)
        ? (body.candidates as Parameters<typeof createLlmDraft>[0]["candidates"])
        : [],
      guide: isRecord(body.guide) ? (body.guide as Parameters<typeof createLlmDraft>[0]["guide"]) : undefined,
      memo: typeof body.memo === "string" ? body.memo : undefined
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDraftKind(value: unknown): value is DraftKind {
  return value === "handoff" || value === "family";
}
