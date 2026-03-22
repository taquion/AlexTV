import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";

export async function GET() {
  try {
    await connectDB();
    const media = await Media.find().sort({ createdAt: -1 });
    return NextResponse.json(media);
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
