import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX = 6 * 1024 * 1024; // 6 MB

export async function POST(req: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Image must be smaller than 6 MB." }, { status: 400 });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) ? ext : "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);

  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
}
