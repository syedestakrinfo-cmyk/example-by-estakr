import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getContent());
}
