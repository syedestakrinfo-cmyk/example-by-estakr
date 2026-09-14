import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteContent } from "@/db/schema";
import { getContent } from "@/lib/content";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getContent());
}

export async function PUT(req: Request) {
  const adminId = await getAdminId();

  if (!adminId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid content data." },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;

      await db
        .insert(siteContent)
        .values({
          key,
          value,
        })
        .onConflictDoUpdate({
          target: siteContent.key,
          set: {
            value,
          },
        });
    }

    return NextResponse.json({
      success: true,
      content: await getContent(),
    });
  } catch (error) {
    console.error("Content update error:", error);

    return NextResponse.json(
      { error: "Failed to update website content." },
      { status: 500 }
    );
  }
}