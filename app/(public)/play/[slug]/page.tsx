import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Collection } from "@/lib/models/Collection";
import { Media } from "@/lib/models/Media";
import PlayerShell from "@/components/player/PlayerShell";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();

  const collection = await Collection.findOne({ slug }).lean();
  if (!collection) return notFound();

  const requiresPin = collection.visibility === "PIN";

  // If PIN required, don't send media data
  let mediaItems: { _id: string; title: string | null; type: "IMAGE" | "VIDEO"; url: string; width: number | null; height: number | null }[] = [];

  if (!requiresPin) {
    const sortedItems = (collection.mediaItems || [])
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);

    const mediaIds = sortedItems.map((item: { mediaId: unknown }) => item.mediaId);

    if (mediaIds.length > 0) {
      const mediaMap = new Map<string, { _id: { toString: () => string }; title: string | null; type: "IMAGE" | "VIDEO"; url: string; width: number | null; height: number | null }>();
      const mediaList = await Media.find({ _id: { $in: mediaIds } }).lean();
      mediaList.forEach((m) => mediaMap.set(m._id.toString(), m as typeof mediaList[0]));

      mediaItems = mediaIds
        .map((id: { toString: () => string }) => {
          const m = mediaMap.get(id.toString());
          if (!m) return null;
          return {
            _id: m._id.toString(),
            title: m.title,
            type: m.type as "IMAGE" | "VIDEO",
            url: m.url,
            width: m.width ?? null,
            height: m.height ?? null,
          };
        })
        .filter(Boolean) as typeof mediaItems;
    }
  }

  return (
    <PlayerShell
      collection={{
        name: collection.name,
        slug: collection.slug,
        youtubePlaylistUrl: collection.youtubePlaylistUrl ?? null,
        requiresPin,
      }}
      initialMedia={mediaItems}
    />
  );
}
