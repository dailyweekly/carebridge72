import { NextResponse } from "next/server";
import { getServiceHealth } from "@/lib/service-health";

export function GET() {
  return NextResponse.json(getServiceHealth());
}
