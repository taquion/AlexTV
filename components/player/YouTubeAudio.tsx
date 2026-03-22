"use client";

interface YouTubeAudioProps {
  playlistUrl: string | null;
}

function extractPlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list");
  } catch {
    return null;
  }
}

export default function YouTubeAudio({ playlistUrl }: YouTubeAudioProps) {
  if (!playlistUrl) return null;

  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) return null;

  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&loop=1&controls=0&showinfo=0&modestbranding=1`;

  return (
    <iframe
      src={embedUrl}
      className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none"
      allow="autoplay; encrypted-media"
      title="Background audio"
    />
  );
}
