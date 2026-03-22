"use client";

import { useState } from "react";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface MediaGridProps {
  media: MediaItem[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaGrid({
  media,
  selectable,
  selectedIds,
  onToggleSelect,
  onDelete,
}: MediaGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      onDelete?.(id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleting(null);
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">No media yet</p>
        <p className="text-sm mt-1">Upload some photos or videos to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {media.map((item) => (
        <div
          key={item._id}
          className={`group relative bg-surface-alt rounded-lg overflow-hidden border transition-colors ${
            selectedIds?.has(item._id)
              ? "border-accent"
              : "border-surface-border hover:border-text-muted"
          }`}
          onClick={() => selectable && onToggleSelect?.(item._id)}
        >
          <div className="aspect-square relative">
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={item.title || ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {selectable && (
              <div className="absolute top-2 left-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedIds?.has(item._id)
                      ? "bg-accent border-accent"
                      : "border-white/50 bg-black/30"
                  }`}
                >
                  {selectedIds?.has(item._id) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-2">
            <p className="text-xs text-text-secondary truncate">
              {item.title || item.url.split("/").pop()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                item.type === "IMAGE" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
              }`}>
                {item.type}
              </span>
              <span className="text-[10px] text-text-muted">
                {formatSize(item.size)}
              </span>
            </div>
          </div>
          {!selectable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item._id);
              }}
              disabled={deleting === item._id}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
