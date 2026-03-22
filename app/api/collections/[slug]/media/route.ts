import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { mediaAssignSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = mediaAssignSchema.safeParse(body);
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

    const existingIds = new Set(
      collection.mediaItems.map((item: { mediaId: { toString: () => string } }) => item.mediaId.toString())
    );
    let maxSort = collection.mediaItems.reduce(
      (max: number, item: { sortOrder: number }) => Math.max(max, item.sortOrder),
      -1
    );

    const newItems = parsed.data.mediaIds
      .filter((id) => !existingIds.has(id))
      .map((id) => ({
        mediaId: id,
        sortOrder: ++maxSort,
      }));

    if (newItems.length > 0) {
      await Collection.findOneAndUpdate(
        { slug },
        { $push: { mediaItems: { $each: newItems } } }
      );
    }

    const updated = await Collection.findOne({ slug });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Add media error:", error);
    return NextResponse.json(
      { error: "Failed to add media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = mediaAssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const removeIds = parsed.data.mediaIds;
    await Collection.findOneAndUpdate(
      { slug },
      {
        $pull: {
          mediaItems: { mediaId: { $in: removeIds } },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove media error:", error);
    return NextResponse.json(
      { error: "Failed to remove media" },
      { status: 500 }
    );
  }
}
