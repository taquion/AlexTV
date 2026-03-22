import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";
import { validateFile, saveFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { filename, url } = await saveFile(file);

    await connectDB();

    const media = await Media.create({
      title: formData.get("title") as string || null,
      type: validation.type,
      url,
      mimeType: file.type,
      size: file.size,
      filename,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
