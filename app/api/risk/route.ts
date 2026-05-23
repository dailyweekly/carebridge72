import { NextResponse } from "next/server";
import { calculateRisk } from "@/lib/risk";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(calculateRisk(body.patient));
}
