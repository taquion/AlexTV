import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { reorderSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);
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

    // Rebuild mediaItems with new order
    const newMediaItems = parsed.data.mediaIds.map((id, index) => ({
      mediaId: id,
      sortOrder: index,
    }));

    await Collection.findOneAndUpdate(
      { slug },
      { $set: { mediaItems: newMediaItems } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder" },
      { status: 500 }
    );
  }
}
