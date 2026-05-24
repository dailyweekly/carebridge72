import { NextResponse } from "next/server";

export type JsonObject = Record<string, unknown>;

export async function readJsonObject(request: Request):
  Promise<{ ok: true; body: JsonObject } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    if (!isRecord(body)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "request body must be an object" }, { status: 400 })
      };
    }
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid json body" }, { status: 400 })
    };
  }
}

export function requireRecord(body: JsonObject, key: string):
  | { ok: true; value: JsonObject }
  | { ok: false; response: NextResponse } {
  const value = body[key];
  if (!isRecord(value)) {
    return {
      ok: false,
      response: NextResponse.json({ error: `${key} is required` }, { status: 400 })
    };
  }
  return { ok: true, value };
}

export function requireArray(body: JsonObject, key: string):
  | { ok: true; value: unknown[] }
  | { ok: false; response: NextResponse } {
  const value = body[key];
  if (!Array.isArray(value)) {
    return {
      ok: false,
      response: NextResponse.json({ error: `${key} must be an array` }, { status: 400 })
    };
  }
  return { ok: true, value };
}

export function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
