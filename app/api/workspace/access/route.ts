import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const accessCode = process.env.WORKSPACE_ACCESS_CODE || "7272";
  const body = await request.json().catch(() => ({}));
  const providedCode = typeof body.code === "string" ? body.code.trim() : "";

  if (providedCode !== accessCode) {
    return NextResponse.json({ ok: false, error: "invalid access code" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
