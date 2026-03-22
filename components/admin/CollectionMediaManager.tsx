"use client";

import { useState, useEffect, useCallback } from "react";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface CollectionMediaManagerProps {
  slug: string;
}

export default function CollectionMediaManager({
  slug,
}: CollectionMediaManagerProps) {
  const [assigned, setAssigned] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [collRes, mediaRes] = await Promise.all([
        fetch(`/api/collections/${slug}`),
        fetch("/api/media"),
      ]);
      const collData = await collRes.json();
      const mediaData = await mediaRes.json();
      setAssigned(collData.media || []);
      setAllMedia(mediaData);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignedIds = new Set(assigned.map((m) => m._id));
  const available = allMedia.filter((m) => !assignedIds.has(m._id));

  const addMedia = async (mediaId: string) => {
    await fetch(`/api/collections/${slug}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaIds: [mediaId] }),
    });
    fetchData();
  };

  const removeMedia = async (mediaId: string) => {
    await fetch(`/api/collections/${slug}/media`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaIds: [mediaId] }),
    });
    fetchData();
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    const newAssigned = [...assigned];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newAssigned.length) return;
    [newAssigned[index], newAssigned[newIndex]] = [
      newAssigned[newIndex],
      newAssigned[index],
    ];
    setAssigned(newAssigned);

    await fetch(`/api/collections/${slug}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaIds: newAssigned.map((m) => m._id),
      }),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Assigned media */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Collection Media ({assigned.length})
        </h3>
        {assigned.length === 0 ? (
          <p className="text-text-muted text-sm py-4">
            No media assigned. Add from the right panel.
          </p>
        ) : (
          <div className="space-y-2">
            {assigned.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-surface-alt border border-surface-border rounded-lg p-2"
              >
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  {item.type === "IMAGE" ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm truncate">
                  {item.title || `${item.type.toLowerCase()}-${index + 1}`}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="w-7 h-7 rounded bg-surface hover:bg-surface-hover disabled:opacity-30 flex items-center justify-center text-sm"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(index, 1)}
                    disabled={index === assigned.length - 1}
                    className="w-7 h-7 rounded bg-surface hover:bg-surface-hover disabled:opacity-30 flex items-center justify-center text-sm"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeMedia(item._id)}
                    className="w-7 h-7 rounded bg-surface hover:bg-danger flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available media */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Available Media ({available.length})
        </h3>
        {available.length === 0 ? (
          <p className="text-text-muted text-sm py-4">
            All media is assigned to this collection.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {available.map((item) => (
              <button
                key={item._id}
                onClick={() => addMedia(item._id)}
                className="relative aspect-square rounded-lg overflow-hidden border border-surface-border hover:border-accent transition-colors group"
              >
                {item.type === "IMAGE" ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    +
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
