"use client";

import { useState, useCallback } from "react";
import PinGate from "./PinGate";
import BrowseGrid from "./BrowseGrid";
import Slideshow from "./Slideshow";
import PlayerOverlay from "./PlayerOverlay";
import YouTubeAudio from "./YouTubeAudio";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
  width?: number | null;
  height?: number | null;
}

interface CollectionInfo {
  name: string;
  slug: string;
  youtubePlaylistUrl: string | null;
  requiresPin: boolean;
}

interface PlayerShellProps {
  collection: CollectionInfo;
  initialMedia: MediaItem[];
}

export default function PlayerShell({
  collection,
  initialMedia,
}: PlayerShellProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [mode, setMode] = useState<"browse" | "slideshow">("browse");
  const [startIndex, setStartIndex] = useState(0);
  const [pinVerified, setPinVerified] = useState(!collection.requiresPin);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handlePinSuccess = useCallback(async () => {
    // Fetch media after PIN verification
    const res = await fetch(`/api/collections/${collection.slug}`);
    const data = await res.json();
    setMedia(data.media || []);
    setPinVerified(true);
  }, [collection.slug]);

  const handleSelect = useCallback((index: number) => {
    setStartIndex(index);
    setMode("slideshow");
    setHasInteracted(true);
  }, []);

  const handleExitSlideshow = useCallback(() => {
    setMode("browse");
  }, []);

  if (!pinVerified) {
    return <PinGate slug={collection.slug} onSuccess={handlePinSuccess} />;
  }

  if (media.length === 0) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
          <p className="text-text-muted">This collection is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {mode === "browse" ? (
        <BrowseGrid
          media={media}
          collectionName={collection.name}
          onSelect={handleSelect}
        />
      ) : (
        <Slideshow
          media={media}
          startIndex={startIndex}
          onExit={handleExitSlideshow}
          collectionName={collection.name}
          overlayContent={({ currentIndex, isPlaying, showOverlay }) => (
            <PlayerOverlay
              visible={showOverlay}
              collectionName={collection.name}
              currentIndex={currentIndex}
              totalItems={media.length}
              isPlaying={isPlaying}
              onPrev={() => {}}
              onNext={() => {}}
              onTogglePlay={() => {}}
              onBrowse={handleExitSlideshow}
            />
          )}
        />
      )}

      {hasInteracted && (
        <YouTubeAudio playlistUrl={collection.youtubePlaylistUrl} />
      )}
    </div>
  );
}
