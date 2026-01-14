"use client";

import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoId: string;
  className?: string;
}

/**
 * Simple YouTube iframe embed with native controls.
 *
 * Design decisions:
 * - No JavaScript API = no race conditions
 * - Native controls = 100% reliability
 * - modestbranding=1 = smaller YouTube logo
 * - rel=0 = no related videos at end
 *
 * ToS Compliance:
 * - Player visible (not hidden or obscured)
 * - Controls accessible to user
 * - Minimum 200x200px (we use aspect-video which exceeds this)
 */
export const YouTubeEmbed = ({ videoId, className }: YouTubeEmbedProps) => {
  // Validate YouTube video ID format (11 characters: alphanumeric, dash, underscore)
  const isValidVideoId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  if (!isValidVideoId) {
    console.error(`Invalid YouTube video ID: ${videoId}`);
    return null;
  }

  // Enable JS API for postMessage events (auto-next support)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`;

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-black", className)}>
      <iframe
        id="youtube-player-iframe"
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;
