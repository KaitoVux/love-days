# YouTube Integration API Documentation

**Last Updated:** 2026-01-13
**Version:** 2.0 (Simplified Embed)
**Phase:** 260112-youtube-simple-embed

---

## Table of Contents

1. [Overview](#overview)
2. [Component API](#component-api)
3. [Data Models](#data-models)
4. [PostMessage Events](#postmessage-events)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Overview

The YouTube integration provides embedded video playback in the Love Days playlist. Unlike previous versions with the YouTube IFrame API, this implementation uses simple iframe embeds with optional auto-next via postMessage API.

### Architecture Changes (v1 → v2)

| Aspect              | v1 (API Wrapper)             | v2 (Simple Embed)            |
| ------------------- | ---------------------------- | ---------------------------- |
| **Approach**        | IFrame API initialization    | iframe with enablejsapi=1    |
| **Race Conditions** | Yes (onReady timing)         | No (native YouTube)          |
| **Custom Controls** | Yes (play/pause/seek/volume) | No (YouTube native controls) |
| **Auto-Next**       | Manual via hook              | postMessage listener         |
| **Complexity**      | 175 lines                    | 50 lines                     |
| **Reliability**     | 2+ fixes needed              | 100% native                  |

---

## Component API

### YouTubeEmbed Component

**Location:** `/Users/kaitovu/Desktop/Projects/love-days/apps/web/components/LoveDays/YouTubeEmbed.tsx`

#### Props

```typescript
interface YouTubeEmbedProps {
  videoId: string; // YouTube video ID (11 chars: alphanumeric, dash, underscore)
  className?: string; // Optional Tailwind classes
}
```

#### Usage

```typescript
import { YouTubeEmbed } from "./YouTubeEmbed";

export function MyComponent() {
  return (
    <YouTubeEmbed
      videoId="dQw4w9WgXcQ"
      className="aspect-video w-full shadow-lg border border-primary/30"
    />
  );
}
```

#### Features

- **Video ID Validation:** Regex checks for valid 11-character format
- **Embed URL Parameters:**
  - `enablejsapi=1` - Enable postMessage events (required for auto-next)
  - `modestbranding=1` - Smaller YouTube logo
  - `rel=0` - No related videos at end
- **Lazy Loading:** `loading="lazy"` for performance
- **Responsive:** Fills container width, maintains aspect ratio
- **Accessible:** `title`, `allow`, `allowFullScreen` attributes

#### Return Value

- **Success:** Renders iframe container with YouTube player
- **Error:** Returns `null` if videoId is invalid (logs console error)

#### Example: Full Usage

```typescript
import { YouTubeEmbed } from "./LoveDays/YouTubeEmbed";

export function SongPlayer({ song }: { song: ISong }) {
  if (song.sourceType !== "youtube" || !song.youtubeVideoId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <YouTubeEmbed
        videoId={song.youtubeVideoId}
        className="aspect-video w-full rounded-lg shadow-lg border border-primary/30"
      />
      <div>
        <h3 className="font-bold">{song.title}</h3>
        <p className="text-sm text-gray-600">{song.artist}</p>
      </div>
    </div>
  );
}
```

---

## Data Models

### ISong (Extended)

```typescript
interface ISong {
  id: string; // Unique identifier
  title: string; // Song title
  artist: string; // Artist name
  album?: string; // Album name (optional)
  duration?: number; // Duration in seconds (optional)
  sourceType: "upload" | "youtube"; // Song source

  // For upload songs:
  fileUrl?: string; // URL to audio file
  filePath?: string; // Storage path
  fileSize?: number; // File size in bytes (optional)
  thumbnailUrl?: string; // Album art URL (optional)
  thumbnailPath?: string; // Thumbnail storage path

  // For YouTube songs:
  youtubeVideoId?: string; // YouTube video ID (11 chars)

  // Metadata:
  published: boolean; // Is song published/active
  createdAt: Date; // Creation date
  updatedAt: Date; // Last updated
}
```

### YouTube Song Example

```typescript
const youTubeSong: ISong = {
  id: "yt-abc123def456",
  title: "Never Gonna Give You Up",
  artist: "Rick Astley",
  sourceType: "youtube",
  youtubeVideoId: "dQw4w9WgXcQ",
  duration: 213, // YouTube videos can report duration
  published: true,
  createdAt: new Date("2026-01-13"),
  updatedAt: new Date("2026-01-13"),
};
```

---

## PostMessage Events

### YouTube Auto-Next Mechanism

When playing a YouTube song, the MusicSidebar listens for postMessage events from the YouTube iframe to detect when a video ends and automatically advance to the next track.

### Event Flow

**1. Setup (when YouTube song starts playing)**

```typescript
// Sent by: MusicSidebar.tsx useEffect
const iframe = document.getElementById("youtube-player-iframe");
iframe.contentWindow.postMessage('{"event":"listening"}', "*");
```

**2. YouTube Sends State Updates**

```javascript
// Sent by: YouTube iframe
window.parent.postMessage(
  {
    event: "infoDelivery",
    info: {
      playerState: 0, // 0=ended, 1=playing, 2=paused, 3=buffering, 5=video cued
    },
  },
  "https://your-domain.com",
);
```

**3. Handler Processes End Event**

```typescript
// In MusicSidebar.tsx
const handleYouTubeMessage = (event: MessageEvent) => {
  // Security: Only accept from YouTube
  if (event.origin !== "https://www.youtube.com") return;

  try {
    const data =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;

    // Detect video end (playerState === 0)
    if (data.event === "infoDelivery" && data.info?.playerState === 0) {
      handleNextTrack(); // Advance to next track
    }
  } catch (error) {
    console.log("Failed to parse YouTube message:", error);
  }
};
```

### Player State Values

| State     | Value | Meaning                |
| --------- | ----- | ---------------------- |
| UNSTARTED | -1    | Video unstarted        |
| ENDED     | 0     | Video finished playing |
| PLAYING   | 1     | Video actively playing |
| PAUSED    | 2     | Video paused           |
| BUFFERING | 3     | Video buffering        |
| CUED      | 5     | Video cued and ready   |

### Security Considerations

- **Origin Check:** Only accept messages from `https://www.youtube.com`
- **Error Handling:** Wrapped in try-catch to prevent app crashes
- **Silent Failures:** Logs console message but doesn't break playback
- **No Token Leak:** postMessage API doesn't expose authentication tokens

---

## Error Handling

### Video ID Validation

**Valid Examples:**

```
dQw4w9WgXcQ   ✅ Standard video ID
-_9OHgXcQ     ✅ Contains dash and underscore
jE4tP2xp3aQ   ✅ All alphanumeric
```

**Invalid Examples:**

```
short         ❌ Too short (5 chars)
ThisIsTooLong ❌ Too long (12 chars)
123-456-789a  ❌ Format mismatch
```

### Error Messages

**Invalid Video ID (Component):**

```
console.error(`Invalid YouTube video ID: ${videoId}`)
// Returns: null (component not rendered)
```

**PostMessage Parse Error (MusicSidebar):**

```
console.log("Failed to parse YouTube message:", error)
// Continues listening, doesn't crash app
```

**Origin Validation Fails:**

```
// Message silently ignored
if (event.origin !== "https://www.youtube.com") return;
```

### Handling Unavailable Videos

If a YouTube video is deleted, private, or unavailable:

- YouTube iframe displays error message to user
- MusicSidebar doesn't need to handle this
- Auto-next may not trigger (no end event)
- User can manually select next track

---

## Examples

### Basic Usage

```typescript
import { YouTubeEmbed } from "./LoveDays/YouTubeEmbed";

function VideoPlayer() {
  const videoId = "dQw4w9WgXcQ";

  return (
    <YouTubeEmbed
      videoId={videoId}
      className="w-full aspect-video rounded-lg shadow-lg"
    />
  );
}
```

### With Metadata

```typescript
function SongCard({ song }: { song: ISong }) {
  if (song.sourceType !== "youtube") return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <YouTubeEmbed
        videoId={song.youtubeVideoId}
        className="aspect-video w-full rounded shadow-md"
      />
      <div>
        <h2 className="text-lg font-bold">{song.title}</h2>
        <p className="text-sm text-gray-600">{song.artist}</p>
        {song.duration && (
          <p className="text-xs text-gray-500">
            Duration: {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Error Handling

```typescript
function SafeYouTubePlayer({ videoId }: { videoId?: string }) {
  if (!videoId) {
    return <div className="p-4 bg-red-100 rounded text-red-800">No video ID provided</div>;
  }

  // YouTubeEmbed will validate videoId internally
  return (
    <YouTubeEmbed
      videoId={videoId}
      className="aspect-video w-full rounded-lg"
    />
  );
}
```

### In MusicSidebar

```typescript
export const MusicSidebar = ({ songs }: MusicSidebarProps) => {
  const currentSong = songs[currentTrack];
  const isYouTube = currentSong?.sourceType === "youtube";

  return (
    <div className="space-y-4">
      {/* Now Playing Section */}
      {isYouTube && currentSong.youtubeVideoId && (
        <div className="p-4 border rounded-lg">
          <YouTubeEmbed
            videoId={currentSong.youtubeVideoId}
            className="aspect-video w-full shadow-lg border border-primary/30"
          />
          <div className="mt-3">
            <h3 className="font-bold">{currentSong.title}</h3>
            <p className="text-sm text-gray-600">{currentSong.artist}</p>
            <p className="text-xs text-gray-500 mt-1">Use YouTube controls above</p>
          </div>
        </div>
      )}

      {/* Upload Song Controls */}
      {!isYouTube && (
        <>
          {/* Upload player UI */}
        </>
      )}
    </div>
  );
};
```

---

## REST API Integration

### Fetching Songs with YouTube Support

**Endpoint:** `GET /api/songs`

**Response:**

```json
[
  {
    "id": "yt-abc123",
    "title": "Never Gonna Give You Up",
    "artist": "Rick Astley",
    "sourceType": "youtube",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "published": true,
    "createdAt": "2026-01-13T08:15:00Z",
    "updatedAt": "2026-01-13T08:15:00Z"
  },
  {
    "id": "upload-def456",
    "title": "Our Song",
    "artist": "Our Artists",
    "sourceType": "upload",
    "fileUrl": "https://supabase.../songs/5fa8a54b-219c-4b68-bb7e-8f14030f406d.mp3",
    "thumbnailUrl": "https://supabase.../images/5fa8a54b-219c-4b68-bb7e-8f14030f406d.png",
    "published": true,
    "createdAt": "2026-01-13T08:15:00Z",
    "updatedAt": "2026-01-13T08:15:00Z"
  }
]
```

### Creating a YouTube Song

**Endpoint:** `POST /api/songs`

**Request:**

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "sourceType": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "published": true
}
```

**Response:**

```json
{
  "id": "yt-xyz789",
  "title": "Song Title",
  "artist": "Artist Name",
  "sourceType": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "published": true,
  "createdAt": "2026-01-13T08:15:00Z",
  "updatedAt": "2026-01-13T08:15:00Z"
}
```

---

## Performance Considerations

### Lazy Loading

The YouTube iframe uses `loading="lazy"` to defer loading until the component is near the viewport.

```typescript
<iframe
  src={embedUrl}
  loading="lazy"
  // ...
/>
```

### Responsive Container

Uses CSS aspect ratio for responsive video sizing:

```typescript
className = "aspect-video w-full"; // 16:9 aspect ratio, full width
```

### PostMessage Listener Cleanup

The postMessage listener is properly cleaned up when component unmounts:

```typescript
useEffect(() => {
  window.addEventListener("message", handleYouTubeMessage);
  return () => window.removeEventListener("message", handleYouTubeMessage); // Cleanup
}, []);
```

---

## Browser Support

| Feature      | Chrome | Safari | Firefox | Edge |
| ------------ | ------ | ------ | ------- | ---- |
| iframe embed | ✅     | ✅     | ✅      | ✅   |
| enablejsapi  | ✅     | ✅     | ✅      | ✅   |
| postMessage  | ✅     | ✅     | ✅      | ✅   |
| Fullscreen   | ✅     | ✅     | ✅      | ✅   |
| autoplay     | ⚠️     | ⚠️     | ⚠️      | ⚠️   |

**Note on autoplay:** YouTube allows autoplay only with sound muted due to browser autoplay policies.

---

## Troubleshooting

### Problem: Video ID validation failing

**Cause:** Invalid character in video ID
**Solution:** Ensure video ID is exactly 11 characters with only alphanumeric, dash, underscore

```typescript
// Valid
"dQw4w9WgXcQ";

// Invalid
"dQw4w9WgXcQ extra"; // Too long
"dQw4w9Wg"; // Too short
"dQw4w9Wg@cQ"; // Invalid char
```

### Problem: Auto-next not working

**Cause:** postMessage not received or origin check failing
**Solution:** Check browser console for errors, verify YouTube origin

```typescript
// Debug: Add logging
const handleYouTubeMessage = (event: MessageEvent) => {
  console.log("Received message from:", event.origin); // Should be https://www.youtube.com
  console.log("Message data:", event.data); // Should have event and info
};
```

### Problem: Iframe not loading

**Cause:** Cross-origin policy or Content Security Policy
**Solution:** Verify allow attribute and CSP headers

```typescript
// Required allow attribute
allow =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
```

---

## Related Documentation

- [Implementation Guide](./youtube-simple-embed-implementation.md)
- [Component Source](../apps/web/components/LoveDays/YouTubeEmbed.tsx)
- [MusicSidebar Source](../apps/web/components/LoveDays/MusicSidebar.tsx)
- [YouTube Developer Docs](https://developers.google.com/youtube/player_parameters)

---

**Document Version:** 2.0
**Last Updated:** 2026-01-13
**Status:** FINAL
