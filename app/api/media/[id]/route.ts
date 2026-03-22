import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";
import { Collection } from "@/lib/models/Collection";
import { deleteFile } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(media);
  } catch (error) {
    console.error("Media get error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const media = await Media.findByIdAndUpdate(
      id,
      { title: body.title ?? null },
      { new: true }
    );
    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(media);
  } catch (error) {
    console.error("Media update error:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Remove from all collections
    await Collection.updateMany(
      { "mediaItems.mediaId": id },
      { $pull: { mediaItems: { mediaId: id } } }
    );

    // Delete file from disk
    await deleteFile(media.url);

    // Delete DB record
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
