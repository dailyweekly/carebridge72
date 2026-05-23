import { NextResponse } from "next/server";
import resources from "@/data/care_resources.mock.json";
import { matchCareResources } from "@/lib/resources";
import type { CareResource } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    matchCareResources(body.patient, resources as CareResource[])
  );
}
