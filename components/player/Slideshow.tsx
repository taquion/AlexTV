"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";

interface MediaItem {
  _id: string;
  title: string | null;
  type: "IMAGE" | "VIDEO";
  url: string;
  width?: number | null;
  height?: number | null;
}

interface SlideshowProps {
  media: MediaItem[];
  startIndex: number;
  onExit: () => void;
  collectionName: string;
  overlayContent: (state: {
    currentIndex: number;
    isPlaying: boolean;
    showOverlay: boolean;
  }) => React.ReactNode;
}

type State = {
  currentIndex: number;
  isPlaying: boolean;
  showOverlay: boolean;
};

type Action =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "TOGGLE_PLAY" }
  | { type: "SHOW_OVERLAY" }
  | { type: "HIDE_OVERLAY" };

function createReducer(total: number) {
  return function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "NEXT":
        return { ...state, currentIndex: (state.currentIndex + 1) % total };
      case "PREV":
        return {
          ...state,
          currentIndex: (state.currentIndex - 1 + total) % total,
        };
      case "TOGGLE_PLAY":
        return { ...state, isPlaying: !state.isPlaying };
      case "SHOW_OVERLAY":
        return { ...state, showOverlay: true };
      case "HIDE_OVERLAY":
        return { ...state, showOverlay: false };
      default:
        return state;
    }
  };
}

const IMAGE_DURATION = 8000;
const OVERLAY_TIMEOUT = 5000;
const FADE_DURATION = 500;

export default function Slideshow({
  media,
  startIndex,
  onExit,
  overlayContent,
}: SlideshowProps) {
  const reducer = useRef(createReducer(media.length)).current;
  const [state, dispatch] = useReducer(reducer, {
    currentIndex: startIndex,
    isPlaying: true,
    showOverlay: true,
  });

  const overlayTimerRef = useRef<NodeJS.Timeout>(undefined);
  const slideTimerRef = useRef<NodeJS.Timeout>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [displayIndex, setDisplayIndex] = useState(startIndex);

  const resetOverlay = useCallback(() => {
    dispatch({ type: "SHOW_OVERLAY" });
    clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      dispatch({ type: "HIDE_OVERLAY" });
    }, OVERLAY_TIMEOUT);
  }, []);

  // Initial overlay auto-hide
  useEffect(() => {
    overlayTimerRef.current = setTimeout(() => {
      dispatch({ type: "HIDE_OVERLAY" });
    }, OVERLAY_TIMEOUT);
    return () => clearTimeout(overlayTimerRef.current);
  }, []);

  // Fade transition when index changes
  useEffect(() => {
    if (state.currentIndex === displayIndex) return;
    setFadeClass("opacity-0");
    const timer = setTimeout(() => {
      setDisplayIndex(state.currentIndex);
      setFadeClass("opacity-100");
    }, FADE_DURATION);
    return () => clearTimeout(timer);
  }, [state.currentIndex, displayIndex]);

  // Auto-advance for images
  useEffect(() => {
    if (!state.isPlaying) return;
    const current = media[state.currentIndex];
    if (current.type === "IMAGE") {
      slideTimerRef.current = setTimeout(() => {
        dispatch({ type: "NEXT" });
      }, IMAGE_DURATION);
      return () => clearTimeout(slideTimerRef.current);
    }
  }, [state.currentIndex, state.isPlaying, media]);

  const handleVideoEnded = useCallback(() => {
    if (state.isPlaying) {
      dispatch({ type: "NEXT" });
    }
  }, [state.isPlaying]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      resetOverlay();
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          dispatch({ type: "NEXT" });
          break;
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "PREV" });
          break;
        case " ":
          e.preventDefault();
          dispatch({ type: "TOGGLE_PLAY" });
          break;
        case "Escape":
        case "Backspace":
          e.preventDefault();
          onExit();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, resetOverlay]);

  // Mouse shows overlay
  useEffect(() => {
    const handler = () => resetOverlay();
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [resetOverlay]);

  const item = media[displayIndex];
  const isVertical = item.width && item.height && item.height > item.width;

  return (
    <div className="fixed inset-0 bg-black z-10" onClick={resetOverlay}>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${fadeClass}`}
      >
        {item.type === "IMAGE" ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {isVertical && (
              <img
                src={item.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
              />
            )}
            <img
              src={item.url}
              alt={item.title || ""}
              className="relative max-w-full max-h-full object-contain z-10"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            key={item._id}
            src={item.url}
            className="w-full h-full object-contain"
            autoPlay
            onEnded={handleVideoEnded}
          />
        )}
      </div>

      {overlayContent({
        currentIndex: state.currentIndex,
        isPlaying: state.isPlaying,
        showOverlay: state.showOverlay,
      })}
    </div>
  );
}
