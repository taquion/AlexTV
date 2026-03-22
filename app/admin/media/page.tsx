"use client";

import { useEffect, useState, useCallback } from "react";
import MediaUploader from "@/components/admin/MediaUploader";
import MediaGrid from "@/components/admin/MediaGrid";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <span className="text-text-secondary text-sm">
          {media.length} item{media.length !== 1 ? "s" : ""}
        </span>
      </div>

      <MediaUploader onUploadComplete={fetchMedia} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <MediaGrid media={media} onDelete={() => fetchMedia()} />
      )}
    </div>
  );
}
