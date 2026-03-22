"use client";

import { useEffect, useRef, useState } from "react";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface BrowseGridProps {
  media: MediaItem[];
  collectionName: string;
  onSelect: (index: number) => void;
}

export default function BrowseGrid({
  media,
  collectionName,
  onSelect,
}: BrowseGridProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const cols = Math.floor(
        (gridRef.current?.clientWidth || 800) / 220
      );
      const total = media.length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusIndex((prev) => Math.min(prev + 1, total - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((prev) => Math.min(prev + cols, total - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((prev) => Math.max(prev - cols, 0));
          break;
        case "Enter":
          e.preventDefault();
          onSelect(focusIndex);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusIndex, media.length, onSelect]);

  // Scroll focused item into view
  useEffect(() => {
    itemRefs.current[focusIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    itemRefs.current[focusIndex]?.focus();
  }, [focusIndex]);

  return (
    <div className="fixed inset-0 bg-surface overflow-auto scrollbar-hide p-6">
      <h1 className="text-2xl font-bold mb-6">{collectionName}</h1>
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
      >
        {media.map((item, index) => (
          <button
            key={item._id}
            ref={(el) => { itemRefs.current[index] = el; }}
            onClick={() => onSelect(index)}
            className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 tv-focus ${
              index === focusIndex
                ? "border-accent scale-105 shadow-lg shadow-accent/20"
                : "border-transparent hover:border-surface-border"
            }`}
          >
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={item.title || ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white truncate">
                {item.title || `${index + 1}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
