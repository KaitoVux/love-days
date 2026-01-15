# YouTube Integration Developer Guide

**Version:** 2.0
**Last Updated:** 2026-01-13
**Audience:** Frontend developers, integrators

---

## Quick Start

### Adding a YouTube Song

```typescript
// 1. Get YouTube video ID from URL
// URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
// Video ID: dQw4w9WgXcQ

// 2. Create song object
const youTubeSong: ISong = {
  id: "yt-unique-id",
  title: "Song Title",
  artist: "Artist Name",
  sourceType: "youtube",
  youtubeVideoId: "dQw4w9WgXcQ", // 11 characters
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 3. Add to database or send to API
// The player will automatically render YouTube embed
```

### Displaying YouTube in Player

```typescript
import { YouTubeEmbed } from "@/components/LoveDays/YouTubeEmbed";

// MusicSidebar already handles this automatically
// When currentSong.sourceType === "youtube", it renders:

<YouTubeEmbed
  videoId={currentSong.youtubeVideoId}
  className="aspect-video w-full shadow-lg"
/>
```

---

## Architecture Understanding

### Component Hierarchy

```
App
├── MusicSidebar (orchestrator)
│   ├── YouTubeEmbed (when YouTube song playing)
│   │   └── iframe (YouTube player)
│   └── audio element (when upload song playing)
```

### Data Flow

```
song selection
    ↓
MusicSidebar detects sourceType
    ↓
YouTube → show YouTubeEmbed
Upload  → show audio player
    ↓
YouTube video ends
    ↓
postMessage received (playerState === 0)
    ↓
handleNextTrack() called
    ↓
next song loads
```

### State Management

**MusicSidebar State:**

```typescript
// Global/shared state
const [currentTrack, setCurrentTrack] = useState(0);
const [isShuffle, setIsShuffle] = useState(false);
const [repeatMode, setRepeatMode] = useState("off");

// Upload-specific state
const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(70);
const [progress, setProgress] = useState(0);
const [duration, setDuration] = useState(0);

// Derived state
const isYouTube = currentSong?.sourceType === "youtube";
```

---

## Implementation Patterns

### Pattern 1: Conditional Rendering

Render different UI based on song type:

```typescript
{isYouTube ? (
  // YouTube: Show embed with native controls
  <YouTubeEmbed videoId={currentSong.youtubeVideoId} />
) : (
  // Upload: Show custom controls
  <AudioPlayer audioRef={audioRef} {...props} />
)}
```

### Pattern 2: Auto-Next Detection

Detect YouTube video end via postMessage:

```typescript
useEffect(() => {
  if (!isYouTube) return;

  // Set up listening
  const iframe = document.getElementById("youtube-player-iframe");
  iframe?.contentWindow?.postMessage('{"event":"listening"}', "*");

  // Handle messages
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== "https://www.youtube.com") return;
    const data = JSON.parse(event.data);
    if (data.info?.playerState === 0) {
      handleNextTrack();
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, [isYouTube, handleNextTrack]);
```

### Pattern 3: Skipping Upload-Only Logic

Guard effects/handlers with `isYouTube` check:

```typescript
// Volume control - skip for YouTube
useEffect(() => {
  if (!isYouTube && audioRef.current) {
    audioRef.current.volume = volume / 100;
  }
}, [volume, isYouTube]);

// Seek - skip for YouTube
const handleSeek = (value: number[]) => {
  if (!isYouTube && audioRef.current) {
    audioRef.current.currentTime = value[0];
  }
};
```

---

## Common Tasks

### Task 1: Add YouTube Song via Admin API

**Location:** Admin dashboard song creation

```typescript
import axios from "axios";

async function createYouTubeSong(videoId: string) {
  try {
    const response = await axios.post("/api/songs", {
      title: "Song Title",
      artist: "Artist Name",
      sourceType: "youtube",
      youtubeVideoId: videoId,
      published: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create YouTube song:", error);
  }
}
```

### Task 2: Extract Video ID from URL

```typescript
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    // https://www.youtube.com/watch?v=dQw4w9WgXcQ
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    // Short form: youtu.be/dQw4w9WgXcQ
    /youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

// Usage
const videoId = extractYouTubeVideoId(
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
);
// "dQw4w9WgXcQ"
```

### Task 3: Validate Video ID Format

```typescript
function isValidYouTubeVideoId(videoId: string): boolean {
  // Must be exactly 11 characters: alphanumeric, dash, underscore
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// Usage
isValidYouTubeVideoId("dQw4w9WgXcQ"); // true
isValidYouTubeVideoId("short"); // false (too short)
isValidYouTubeVideoId("toolongtouse"); // false (too long)
```

### Task 4: Create YouTube Song Object

```typescript
function createYouTubeSongObject(
  videoId: string,
  title: string,
  artist: string,
): ISong {
  return {
    id: `yt-${Date.now()}`,
    title,
    artist,
    sourceType: "youtube",
    youtubeVideoId: videoId,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Usage
const song = createYouTubeSongObject(
  "dQw4w9WgXcQ",
  "Never Gonna Give You Up",
  "Rick Astley",
);
```

### Task 5: Add YouTube Song Form Input

```typescript
import { useState } from "react";
import { Input } from "@/components/ui/input";

function YouTubeSongForm() {
  const [videoId, setVideoId] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const handleUrlInput = (url: string) => {
    setUrlInput(url);
    const id = extractYouTubeVideoId(url);
    if (id) {
      setVideoId(id);
    }
  };

  return (
    <form>
      <div>
        <label>YouTube URL</label>
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={urlInput}
          onChange={(e) => handleUrlInput(e.target.value)}
        />
      </div>
      <div>
        <label>Video ID (auto-filled)</label>
        <Input value={videoId} disabled />
      </div>
      {videoId && !isValidYouTubeVideoId(videoId) && (
        <p className="text-red-600">Invalid video ID</p>
      )}
    </form>
  );
}
```

---

## Debugging

### Debug Checklist

```
[ ] Video ID is 11 characters
[ ] Video ID contains only alphanumeric, dash, underscore
[ ] YouTube origin header is "https://www.youtube.com"
[ ] postMessage listener is registered
[ ] Console shows "Video ended, playing next track"
[ ] No CORS errors in Network tab
[ ] iframe allows="..." includes all required permissions
```

### Common Errors

**Error: "Invalid YouTube video ID"**

```
Cause: Video ID doesn't match pattern
Solution: Verify ID is exactly 11 chars with valid characters
```

**Error: "Failed to parse YouTube message"**

```
Cause: Malformed message data
Solution: Check JSON.parse, add defensive checks
```

**Error: "postMessage from different origin"**

```
Cause: Message from non-YouTube source
Solution: Check origin validation is working
```

**Error: Auto-next not triggering**

```
Cause:
  - enablejsapi=1 not in embed URL
  - iframe not found (wrong id)
  - postMessage not sent initially
Solution: Verify all three above
```

### Debug Logging

Add temporary logging to track flow:

```typescript
// In YouTubeEmbed.tsx
export const YouTubeEmbed = ({ videoId, className }: YouTubeEmbedProps) => {
  console.log("YouTubeEmbed mounted with videoId:", videoId);

  const isValidVideoId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  if (!isValidVideoId) {
    console.error(`Invalid YouTube video ID: ${videoId}`);
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`;
  console.log("Embed URL:", embedUrl);

  return (
    // ... JSX
  );
};

// In MusicSidebar.tsx
useEffect(() => {
  if (!isYouTube) return;

  console.log("Setting up YouTube auto-next");

  const iframe = document.getElementById("youtube-player-iframe");
  console.log("iframe element:", iframe);

  if (!iframe?.contentWindow) {
    console.error("iframe.contentWindow not available");
    return;
  }

  iframe.contentWindow.postMessage('{"event":"listening"}', "*");
  console.log("Sent listening message");

  const handleYouTubeMessage = (event: MessageEvent) => {
    console.log("Message received:", {
      origin: event.origin,
      data: event.data,
    });

    if (event.origin !== "https://www.youtube.com") {
      console.log("Rejected: wrong origin");
      return;
    }

    try {
      const data = typeof event.data === "string"
        ? JSON.parse(event.data)
        : event.data;

      console.log("Parsed data:", data);

      if (data.event === "infoDelivery" && data.info?.playerState === 0) {
        console.log("Video ended! Playing next track");
        handleNextTrack();
      }
    } catch (error) {
      console.error("Failed to parse YouTube message:", error);
    }
  };

  window.addEventListener("message", handleYouTubeMessage);
  console.log("Message listener registered");

  return () => {
    window.removeEventListener("message", handleYouTubeMessage);
    console.log("Message listener removed");
  };
}, [isYouTube, currentTrack, handleNextTrack]);
```

### Browser DevTools

**Chrome DevTools:**

1. Open DevTools (F12)
2. Go to Console tab
3. Look for logs and errors
4. Check Network tab for failed requests
5. Use "Break on" for network errors

**YouTube Player State Monitor:**

```javascript
// Paste in console to monitor events
window.addEventListener("message", (e) => {
  if (e.origin === "https://www.youtube.com") {
    console.log("YouTube event:", e.data);
  }
});
```

---

## Testing

### Unit Test Example

```typescript
import { render } from "@testing-library/react";
import { YouTubeEmbed } from "./YouTubeEmbed";

describe("YouTubeEmbed", () => {
  it("should render iframe with valid video ID", () => {
    const { container } = render(
      <YouTubeEmbed videoId="dQw4w9WgXcQ" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain("dQw4w9WgXcQ");
  });

  it("should return null for invalid video ID", () => {
    const { container } = render(
      <YouTubeEmbed videoId="invalid" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should include enablejsapi parameter", () => {
    const { container } = render(
      <YouTubeEmbed videoId="dQw4w9WgXcQ" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.src).toContain("enablejsapi=1");
  });
});
```

### Integration Test Example

```typescript
describe("YouTube auto-next", () => {
  it("should call handleNextTrack when video ends", async () => {
    const handleNextTrack = jest.fn();
    render(<MusicSidebar songs={[youTubeSong]} />);

    // Simulate YouTube iframe sending end event
    const event = new MessageEvent("message", {
      origin: "https://www.youtube.com",
      data: {
        event: "infoDelivery",
        info: { playerState: 0 },
      },
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(handleNextTrack).toHaveBeenCalled();
    });
  });
});
```

### Manual Testing Checklist

```
[ ] YouTube video loads and displays
[ ] Native play/pause buttons work
[ ] Progress bar updates as video plays
[ ] Volume slider changes video volume
[ ] Fullscreen button works
[ ] Auto-next plays when video ends
[ ] Next track on shuffle is different
[ ] Repeat modes work with YouTube
[ ] YouTube → Upload transition smooth
[ ] Upload → YouTube transition smooth
[ ] Multiple rapid track changes stable
[ ] Console has no errors
```

---

## Performance Optimization

### Lazy Loading

YouTube embeds already use `loading="lazy"`:

```typescript
<iframe
  src={embedUrl}
  loading="lazy"  // Defer until near viewport
  // ...
/>
```

### Responsive Container

Use CSS aspect ratio for responsive sizing:

```typescript
// Good: Responsive, maintains aspect
className = "aspect-video w-full";

// Bad: Fixed size, not responsive
className = "w-full h-[400px]";
```

### PostMessage Cleanup

Always remove listeners to prevent memory leaks:

```typescript
useEffect(() => {
  const handler = (event) => {
    /* ... */
  };
  window.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler); // Important!
  };
}, []);
```

### Avoid Unnecessary Re-renders

Use `useCallback` for stable function references:

```typescript
// Good: Function won't change unless dependencies do
const handleNextTrack = useCallback(() => {
  // ...
}, [currentTrack, songs.length]);

// Bad: Function recreated every render
const handleNextTrack = () => {
  // ...
};
```

---

## Security Considerations

### Origin Validation

Always check message origin:

```typescript
const handleYouTubeMessage = (event: MessageEvent) => {
  // Only accept from YouTube
  if (event.origin !== "https://www.youtube.com") {
    console.warn("Rejected message from:", event.origin);
    return;
  }
  // Safe to process
};
```

### Content Security Policy

Ensure CSP allows YouTube:

```
script-src 'self' https://www.youtube.com;
frame-src https://www.youtube.com;
connect-src https://www.youtube.com;
```

### Input Validation

Always validate video IDs:

```typescript
if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
  throw new Error(`Invalid video ID: ${videoId}`);
}
```

### No Sensitive Data

Don't send auth tokens via postMessage:

```typescript
// Bad - Don't do this
iframe.contentWindow.postMessage(
  {
    event: "auth",
    token: userToken, // INSECURE
  },
  "*",
);

// Good - Only send public data
iframe.contentWindow.postMessage(
  {
    event: "listening",
  },
  "*",
);
```

---

## Best Practices

### Do's

- ✅ Validate video IDs before use
- ✅ Check iframe origin in postMessage handlers
- ✅ Use try-catch for JSON parsing
- ✅ Clean up event listeners in useEffect return
- ✅ Test with multiple YouTube videos
- ✅ Monitor console for errors
- ✅ Use lazy loading for performance

### Don'ts

- ❌ Don't modify YouTube player HTML directly
- ❌ Don't send private data via postMessage
- ❌ Don't ignore origin validation
- ❌ Don't leave event listeners registered
- ❌ Don't assume video ID is always present
- ❌ Don't use `eval()` on message data
- ❌ Don't hardcode full URLs

---

## FAQ

**Q: Can I control YouTube volume programmatically?**
A: No. YouTube embed doesn't expose volume control via API. User must adjust volume in embed.

**Q: How do I get the current playback time?**
A: postMessage API doesn't provide this. YouTube embed shows it visually.

**Q: Can I use the YouTube iframe in a modal?**
A: Yes, just render it anywhere. Make sure modal doesn't have CSP restrictions.

**Q: What if YouTube blocks my domain?**
A: YouTube allows embeds from any domain. No whitelist needed.

**Q: How do I track analytics?**
A: YouTube handles its own analytics. You can track song selection in your app.

**Q: Can I embed YouTube in React Server Components?**
A: No, it needs `"use client"` directive because of browser APIs (iframe, postMessage).

---

## Resources

- **YouTubeEmbed Source:** `apps/web/components/LoveDays/YouTubeEmbed.tsx`
- **MusicSidebar Source:** `apps/web/components/LoveDays/MusicSidebar.tsx`
- **Implementation Guide:** `docs/youtube-simple-embed-implementation.md`
- **API Reference:** `docs/YOUTUBE_INTEGRATION_API.md`
- **YouTube Embed Docs:** https://developers.google.com/youtube/player_parameters

---

**Guide Version:** 2.0
**Last Updated:** 2026-01-13
**Status:** FINAL
