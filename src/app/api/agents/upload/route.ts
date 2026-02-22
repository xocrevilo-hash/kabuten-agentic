import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/upload
 * Upload an image to Supabase Storage bucket `sector-thread-images`.
 * Accepts multipart/form-data with a single `file` field.
 * Returns { url: string } — the public URL for the uploaded image.
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    // Max size: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Fallback: if Supabase is not configured, convert to base64 data URL
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = "sector-thread-images";

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer();
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return NextResponse.json(
        { error: `Upload failed: ${err}` },
        { status: 500 }
      );
    }

    // Construct public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
