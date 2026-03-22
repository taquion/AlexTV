import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { Media } from "@/lib/models/Media";
import { collectionSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const collection = await Collection.findOne({ slug }).lean();
    if (!collection) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Populate media items
    const mediaIds = collection.mediaItems
      ?.sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
      .map((item: { mediaId: unknown }) => item.mediaId) || [];

    const mediaMap = new Map<string, unknown>();
    if (mediaIds.length > 0) {
      const mediaItems = await Media.find({ _id: { $in: mediaIds } }).lean();
      mediaItems.forEach((m) => mediaMap.set(m._id.toString(), m));
    }

    const orderedMedia = mediaIds
      .map((id: { toString: () => string }) => mediaMap.get(id.toString()))
      .filter(Boolean);

    const { pinHash: _pin, ...rest } = collection;
    return NextResponse.json({
      ...rest,
      requiresPin: collection.visibility === "PIN",
      media: orderedMedia,
    });
  } catch (error) {
    console.error("Collection get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = collectionSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check new slug uniqueness if changed
    if (parsed.data.slug && parsed.data.slug !== slug) {
      const existing = await Collection.findOne({ slug: parsed.data.slug });
      if (existing) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const update: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.slug !== undefined) update.slug = parsed.data.slug;
    if (parsed.data.description !== undefined) update.description = parsed.data.description || null;
    if (parsed.data.visibility !== undefined) update.visibility = parsed.data.visibility;
    if (parsed.data.youtubePlaylistUrl !== undefined) update.youtubePlaylistUrl = parsed.data.youtubePlaylistUrl || null;
    if (parsed.data.coverMediaId !== undefined) update.coverMediaId = parsed.data.coverMediaId || null;

    if (parsed.data.visibility === "PIN" && parsed.data.pin) {
      update.pinHash = await bcrypt.hash(parsed.data.pin, 12);
    } else if (parsed.data.visibility === "PUBLIC") {
      update.pinHash = null;
    }

    const updated = await Collection.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true }
    ).select("-pinHash");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Collection update error:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const deleted = await Collection.findOneAndDelete({ slug });
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Collection delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
