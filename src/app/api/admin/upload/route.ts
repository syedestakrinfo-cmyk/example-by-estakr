import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminId } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX = 6 * 1024 * 1024; // 6 MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  const adminId = await getAdminId();

  if (!adminId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX) {
    return NextResponse.json(
      { error: "Image must be smaller than 6 MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "china-garden",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error || new Error("Cloudinary upload failed.")
              );
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          }
        );

        uploadStream.end(buffer);
      }
    );

    return NextResponse.json(
      { url: result.secure_url },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      { error: "Image upload failed." },
      { status: 500 }
    );
  }
}