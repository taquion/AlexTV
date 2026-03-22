"use client";

interface PlayerOverlayProps {
  visible: boolean;
  collectionName: string;
  currentIndex: number;
  totalItems: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onBrowse: () => void;
}

export default function PlayerOverlay({
  visible,
  collectionName,
  currentIndex,
  totalItems,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
  onBrowse,
}: PlayerOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 pointer-events-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{collectionName}</h2>
          <span className="text-text-secondary text-sm">
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pointer-events-auto">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onBrowse}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors tv-focus"
          >
            Grid
          </button>
          <button
            onClick={onPrev}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors tv-focus"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            onClick={onTogglePlay}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors tv-focus"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={onNext}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors tv-focus"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
