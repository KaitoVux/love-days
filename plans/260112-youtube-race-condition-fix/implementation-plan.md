# YouTube Player Race Condition Fix - Implementation Plan

**Created:** 2026-01-12
**Status:** Ready for Implementation
**Estimated Time:** 1-2 hours
**Risk Level:** Low

---

## Problem Summary

The YouTube IFrame Player API fires `onReady` before the iframe is fully functional. This causes race conditions when `setVolume()`, `playVideo()`, or other API calls execute before the internal iframe.src is initialized.

### Root Cause Analysis

1. **Premature `isReady` flag**: Set immediately when `onReady` fires
2. **iframe.src is null**: Player object exists but internal iframe not fully loaded
3. **Multiple effects trigger simultaneously**: When `ytReady` becomes true, volume/play effects execute concurrently
4. **No error handling**: YouTube API calls fail silently or throw uncaught errors

---

## Solution Architecture

### Strategy: Delayed Ready + Safe API Wrapper

1. **Add initialization delay**: 200ms buffer after `onReady` before setting `isReady=true`
2. **Create safe API wrapper**: All YouTube calls go through try-catch with validation
3. **Player state validation**: Check player state before executing commands
4. **Graceful error recovery**: Log errors and continue operation

---

## Implementation Steps

### Step 1: Update `use-youtube-player.ts` Hook

**File:** `/Users/kaitovu/Desktop/Projects/love-days/apps/web/hooks/use-youtube-player.ts`

#### 1.1 Add Delay Before Setting isReady

Replace the immediate `setIsReady(true)` with a delayed version:

```typescript
// BEFORE (line 56-58):
onReady: (event: any) => {
  setIsReady(true);
  options.onReady?.();
},

// AFTER:
onReady: (event: any) => {
  // Delay to ensure iframe is fully initialized
  // YouTube's onReady fires before iframe.src is set
  setTimeout(() => {
    setIsReady(true);
    options.onReady?.();
  }, 200);
},
```

#### 1.2 Add Safe API Methods

Export wrapper methods that include validation and error handling:

```typescript
// Add after line 20 (inside the hook, before useEffect):
const safePlayerCall = useCallback(
  <T>(method: string, ...args: any[]): T | null => {
    try {
      if (!playerRef.current || !isReady) {
        return null;
      }
      const fn = playerRef.current[method];
      if (typeof fn !== "function") {
        console.warn(`YouTube player method ${method} not available`);
        return null;
      }
      return fn.apply(playerRef.current, args);
    } catch (error) {
      console.error(`YouTube player ${method} failed:`, error);
      return null;
    }
  },
  [isReady],
);
```

#### 1.3 Export Safe Methods

Update the return statement to include safe wrapper methods:

```typescript
// AFTER (replace existing return):
return {
  player: playerRef.current,
  isReady,
  // Safe API methods with error handling
  playVideo: () => safePlayerCall("playVideo"),
  pauseVideo: () => safePlayerCall("pauseVideo"),
  setVolume: (vol: number) => safePlayerCall("setVolume", vol),
  seekTo: (seconds: number, allowSeekAhead?: boolean) =>
    safePlayerCall("seekTo", seconds, allowSeekAhead ?? true),
  loadVideoById: (videoId: string) => safePlayerCall("loadVideoById", videoId),
  getCurrentTime: () => safePlayerCall<number>("getCurrentTime") ?? 0,
  getDuration: () => safePlayerCall<number>("getDuration") ?? 0,
  getPlayerState: () => safePlayerCall<number>("getPlayerState") ?? -1,
};
```

#### 1.4 Complete Updated Hook

```typescript
// /Users/kaitovu/Desktop/Projects/love-days/apps/web/hooks/use-youtube-player.ts
import { useEffect, useRef, useState, useCallback } from "react";

// YouTube IFrame Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubePlayerOptions {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
}

export interface YouTubePlayerAPI {
  player: any;
  isReady: boolean;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
}

export function useYouTubePlayer(
  options: UseYouTubePlayerOptions,
): YouTubePlayerAPI {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Safe player call wrapper with error handling
  const safePlayerCall = useCallback(
    <T>(method: string, ...args: any[]): T | null => {
      try {
        if (!playerRef.current || !isReady) {
          return null;
        }
        const fn = playerRef.current[method];
        if (typeof fn !== "function") {
          console.warn(`YouTube player method ${method} not available`);
          return null;
        }
        return fn.apply(playerRef.current, args);
      } catch (error) {
        console.error(`YouTube player ${method} failed:`, error);
        return null;
      }
    },
    [isReady],
  );

  useEffect(() => {
    // Skip initialization if no videoId or player element doesn't exist
    if (!options.videoId) {
      return;
    }

    // Check if DOM element exists before initializing
    const playerElement = document.getElementById("youtube-player");
    if (!playerElement) {
      return;
    }

    function initializePlayer() {
      // Double-check element still exists
      if (!document.getElementById("youtube-player")) {
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        playerRef.current = null;
        setIsReady(false);
      }

      try {
        playerRef.current = new window.YT.Player("youtube-player", {
          height: "200",
          width: "200",
          videoId: options.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              // CRITICAL FIX: Delay to ensure iframe is fully initialized
              // YouTube's onReady event fires before iframe.src is set internally
              setTimeout(() => {
                // Validate player is still valid before setting ready
                if (
                  playerRef.current &&
                  typeof playerRef.current.getPlayerState === "function"
                ) {
                  setIsReady(true);
                  options.onReady?.();
                }
              }, 200);
            },
            onStateChange: (event: any) => {
              options.onStateChange?.(event.data);
            },
            onError: (event: any) => {
              console.error("YouTube player error code:", event.data);
              options.onError?.(event.data);
            },
          },
        });
      } catch (error) {
        console.error("Failed to initialize YouTube player:", error);
      }
    }

    // Load YouTube IFrame API script (once)
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else if (window.YT.Player) {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
      setIsReady(false);
    };
  }, [
    options.videoId,
    options.onReady,
    options.onStateChange,
    options.onError,
  ]);

  return {
    player: playerRef.current,
    isReady,
    // Safe API methods with built-in error handling
    playVideo: () => safePlayerCall("playVideo"),
    pauseVideo: () => safePlayerCall("pauseVideo"),
    setVolume: (vol: number) => safePlayerCall("setVolume", vol),
    seekTo: (seconds: number, allowSeekAhead?: boolean) =>
      safePlayerCall("seekTo", seconds, allowSeekAhead ?? true),
    loadVideoById: (videoId: string) =>
      safePlayerCall("loadVideoById", videoId),
    getCurrentTime: () => safePlayerCall<number>("getCurrentTime") ?? 0,
    getDuration: () => safePlayerCall<number>("getDuration") ?? 0,
    getPlayerState: () => safePlayerCall<number>("getPlayerState") ?? -1,
  };
}
```

---

### Step 2: Update `MusicSidebar.tsx` to Use Safe Methods

**File:** `/Users/kaitovu/Desktop/Projects/love-days/apps/web/components/LoveDays/MusicSidebar.tsx`

#### 2.1 Update Hook Destructuring

```typescript
// BEFORE (line 44-59):
const { player: ytPlayer, isReady: ytReady } = useYouTubePlayer({
  videoId: isYouTube ? currentSong.youtubeVideoId || "" : "",
  onStateChange: state => { ... },
  onError: error => { ... },
});

// AFTER:
const {
  isReady: ytReady,
  playVideo,
  pauseVideo,
  setVolume: ytSetVolume,
  seekTo,
  loadVideoById,
  getCurrentTime,
  getDuration,
} = useYouTubePlayer({
  videoId: isYouTube ? currentSong.youtubeVideoId || "" : "",
  onStateChange: state => {
    // YT.PlayerState.ENDED = 0
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.PAUSED = 2
    if (state === 0) handleNextTrack();
    if (state === 1) setIsPlaying(true);
    if (state === 2) setIsPlaying(false);
  },
  onError: error => {
    console.error("YouTube player error:", error);
    handleNextTrack();
  },
});
```

#### 2.2 Update handleNextTrack

```typescript
// BEFORE (line 62-88):
const handleNextTrack = useCallback(() => {
  if (repeatMode === "one") {
    if (isYouTube && ytPlayer && ytReady) {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    } else if (audioRef.current) { ... }
  } ...
}, [currentTrack, repeatMode, isShuffle, isYouTube, ytPlayer, ytReady, songs.length]);

// AFTER:
const handleNextTrack = useCallback(() => {
  if (repeatMode === "one") {
    if (isYouTube && ytReady) {
      seekTo(0);
      playVideo();
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  } else if (repeatMode === "all" || currentTrack < songs.length - 1) {
    if (isShuffle) {
      let next = currentTrack;
      while (next === currentTrack && songs.length > 1) {
        next = Math.floor(Math.random() * songs.length);
      }
      setCurrentTrack(next);
    } else {
      setCurrentTrack(prev => (prev === songs.length - 1 ? 0 : prev + 1));
    }
    setProgress(0);
    setIsPlaying(true);
  } else {
    setIsPlaying(false);
  }
}, [currentTrack, repeatMode, isShuffle, isYouTube, ytReady, songs.length, seekTo, playVideo]);
```

#### 2.3 Update YouTube Time Polling Effect

```typescript
// BEFORE (line 121-134):
useEffect(() => {
  if (!isYouTube || !ytPlayer || !ytReady) return;
  const interval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime) {
      setProgress(ytPlayer.getCurrentTime());
      if (ytPlayer.getDuration) {
        setDuration(ytPlayer.getDuration());
      }
    }
  }, 250);
  return () => clearInterval(interval);
}, [isYouTube, ytPlayer, ytReady]);

// AFTER:
useEffect(() => {
  if (!isYouTube || !ytReady) return;
  const interval = setInterval(() => {
    const time = getCurrentTime();
    const dur = getDuration();
    if (time > 0) setProgress(time);
    if (dur > 0) setDuration(dur);
  }, 250);
  return () => clearInterval(interval);
}, [isYouTube, ytReady, getCurrentTime, getDuration]);
```

#### 2.4 Update Volume Control Effect

```typescript
// BEFORE (line 137-146):
useEffect(() => {
  if (isYouTube && ytPlayer && ytReady) {
    ytPlayer.setVolume(isMuted ? 0 : volume);
  } else { ... }
}, [volume, isMuted, isYouTube, ytPlayer, ytReady]);

// AFTER:
useEffect(() => {
  if (isYouTube && ytReady) {
    ytSetVolume(isMuted ? 0 : volume);
  } else {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
    }
  }
}, [volume, isMuted, isYouTube, ytReady, ytSetVolume]);
```

#### 2.5 Update Play/Pause Control Effect

```typescript
// BEFORE (line 149-166):
useEffect(() => {
  if (isYouTube && ytPlayer && ytReady) {
    if (isPlaying) {
      ytPlayer.playVideo();
    } else {
      ytPlayer.pauseVideo();
    }
  } else { ... }
}, [isPlaying, isYouTube, ytPlayer, ytReady]);

// AFTER:
useEffect(() => {
  if (isYouTube && ytReady) {
    if (isPlaying) {
      playVideo();
    } else {
      pauseVideo();
    }
  } else {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
    }
  }
}, [isPlaying, isYouTube, ytReady, playVideo, pauseVideo]);
```

#### 2.6 Update Track Change Effect

```typescript
// BEFORE (line 169-180):
useEffect(() => {
  if (isYouTube && ytPlayer && ytReady && currentSong.youtubeVideoId) {
    ytPlayer.loadVideoById(currentSong.youtubeVideoId);
    if (isPlaying) {
      ytPlayer.playVideo();
    }
  } else if (!isYouTube && audioRef.current) { ... }
}, [currentTrack, isYouTube, currentSong.youtubeVideoId, ytPlayer, ytReady, isPlaying]);

// AFTER:
useEffect(() => {
  if (isYouTube && ytReady && currentSong.youtubeVideoId) {
    loadVideoById(currentSong.youtubeVideoId);
    if (isPlaying) {
      playVideo();
    }
  } else if (!isYouTube && audioRef.current) {
    if (isPlaying) {
      audioRef.current.play();
    }
  }
}, [currentTrack, isYouTube, currentSong.youtubeVideoId, ytReady, isPlaying, loadVideoById, playVideo]);
```

#### 2.7 Update handlePrev

```typescript
// BEFORE (line 200-218):
const handlePrev = useCallback(() => {
  if (isYouTube && ytPlayer && ytReady) {
    const currentTime = ytPlayer.getCurrentTime();
    if (currentTime > 3) {
      ytPlayer.seekTo(0);
    } else { ... }
  } else { ... }
}, [isYouTube, ytPlayer, ytReady, songs.length]);

// AFTER:
const handlePrev = useCallback(() => {
  if (isYouTube && ytReady) {
    const currentTime = getCurrentTime();
    if (currentTime > 3) {
      seekTo(0);
    } else {
      setCurrentTrack(prev => (prev === 0 ? songs.length - 1 : prev - 1));
      setProgress(0);
    }
  } else {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      setCurrentTrack(prev => (prev === 0 ? songs.length - 1 : prev - 1));
      setProgress(0);
    }
  }
}, [isYouTube, ytReady, getCurrentTime, seekTo, songs.length]);
```

#### 2.8 Update handleSeek

```typescript
// BEFORE (line 220-234):
const handleSeek = useCallback(
  (value: number[]) => {
    if (isYouTube && ytPlayer && ytReady) {
      ytPlayer.seekTo(value[0]);
      setProgress(value[0]);
    } else { ... }
  },
  [isYouTube, ytPlayer, ytReady]
);

// AFTER:
const handleSeek = useCallback(
  (value: number[]) => {
    if (isYouTube && ytReady) {
      seekTo(value[0]);
      setProgress(value[0]);
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = value[0];
        setProgress(value[0]);
      }
    }
  },
  [isYouTube, ytReady, seekTo]
);
```

---

## Testing Strategy

### Unit Testing Checklist

- [ ] YouTube player initializes without errors
- [ ] 200ms delay allows iframe to fully load
- [ ] `setVolume()` does not throw when called immediately after ready
- [ ] `playVideo()` does not throw when called immediately after ready
- [ ] Multiple rapid state changes handled gracefully
- [ ] Player cleanup on unmount works without errors

### Integration Testing Checklist

- [ ] Play YouTube song from playlist
- [ ] Switch between YouTube and uploaded songs
- [ ] Volume changes during YouTube playback
- [ ] Seek during YouTube playback
- [ ] Next/Previous track with YouTube songs
- [ ] Shuffle mode with YouTube songs
- [ ] Repeat modes (all, one) with YouTube songs

### Manual Testing Steps

1. **Initial Load Test**

   - Open app with YouTube song selected
   - Verify no console errors
   - Wait 3 seconds, then click play
   - Verify playback starts

2. **Rapid Interaction Test**

   - Click play immediately on page load
   - Verify no errors (may not play until ready, that's OK)
   - After ready, verify controls work

3. **Track Switch Test**

   - Play an uploaded song
   - Switch to YouTube song
   - Verify smooth transition

4. **Volume Race Condition Test**

   - Reload page with YouTube song
   - Immediately drag volume slider
   - Verify no errors

5. **Error Recovery Test**
   - Set invalid YouTube video ID (edit in DB)
   - Verify error logged and next track plays

### Browser Console Commands for Testing

```javascript
// Check if player is ready
console.log("Player ready:", document.querySelector("iframe")?.src);

// Force rapid API calls (should not throw)
// (Only works if you expose player to window for debugging)
```

---

## Rollback Plan

If issues occur in production:

### Immediate Rollback

1. Revert the two modified files:

   ```bash
   git checkout HEAD~1 -- apps/web/hooks/use-youtube-player.ts
   git checkout HEAD~1 -- apps/web/components/LoveDays/MusicSidebar.tsx
   ```

2. Deploy reverted version

### Partial Rollback (Keep Error Handling)

If only the delay causes issues, reduce delay:

```typescript
// In use-youtube-player.ts onReady handler
setTimeout(() => { ... }, 100);  // Reduce from 200ms to 100ms
```

Or remove delay entirely but keep try-catch:

```typescript
onReady: () => {
  if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
    setIsReady(true);
    options.onReady?.();
  }
},
```

---

## Validation Criteria

### Success Criteria

1. **Zero uncaught errors** in browser console during:

   - Page load with YouTube song
   - Track switching
   - Volume changes
   - Seek operations

2. **Backward compatibility** verified:

   - Uploaded songs play correctly
   - No changes to upload functionality
   - Existing playlist behavior unchanged

3. **Performance** acceptable:
   - 200ms delay not noticeable to users
   - No increased CPU/memory usage
   - No additional network requests

### Failure Criteria (Requires Rollback)

1. Any regression in uploaded song playback
2. YouTube playback fails to start after ready
3. Unrecoverable error states
4. Memory leaks from cleanup issues

---

## File Summary

| File                                   | Changes                                      | Risk |
| -------------------------------------- | -------------------------------------------- | ---- |
| `hooks/use-youtube-player.ts`          | Add delay, safe wrapper, export methods      | Low  |
| `components/LoveDays/MusicSidebar.tsx` | Use safe methods, remove direct player calls | Low  |

---

## Implementation Sequence

1. **Update `use-youtube-player.ts`** (15 min)

   - Add 200ms delay in onReady
   - Add safePlayerCall wrapper
   - Export safe API methods
   - Test hook in isolation

2. **Update `MusicSidebar.tsx`** (20 min)

   - Destructure new safe methods
   - Replace all `ytPlayer.` calls with safe methods
   - Update dependency arrays
   - Test component integration

3. **Run Type Check & Build** (5 min)

   ```bash
   cd apps/web && npm run type-check && npm run build
   ```

4. **Manual Testing** (20 min)

   - Follow testing checklist above
   - Test in Chrome, Firefox, Safari
   - Test on mobile (if applicable)

5. **Deploy & Monitor** (10 min)
   - Deploy to staging
   - Monitor console for errors
   - If stable, deploy to production

---

## Notes

- The 200ms delay is a conservative estimate; 150ms may suffice but 200ms provides margin
- The safe wrapper pattern allows future expansion (e.g., retry logic, fallback behavior)
- Error logging helps diagnose any remaining edge cases in production
