import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { collectionSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const collections = await Collection.find()
      .select("-pinHash")
      .sort({ updatedAt: -1 })
      .populate("coverMediaId")
      .lean();

    const result = collections.map((c) => ({
      ...c,
      mediaCount: c.mediaItems?.length || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Collections list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = collectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Check slug uniqueness
    const existing = await Collection.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const data: Record<string, unknown> = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      visibility: parsed.data.visibility,
      youtubePlaylistUrl: parsed.data.youtubePlaylistUrl || null,
      coverMediaId: parsed.data.coverMediaId || null,
    };

    if (parsed.data.visibility === "PIN" && parsed.data.pin) {
      data.pinHash = await bcrypt.hash(parsed.data.pin, 12);
    }

    const collection = await Collection.create(data);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Collection create error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
