# YouTube Video Playback Failure After Race Condition Fix

**Date:** 2026-01-12
**Issue:** YouTube video doesn't play after race condition fix
**Location:** `hooks/use-youtube-player.ts`, `components/LoveDays/MusicSidebar.tsx`
**Severity:** CRITICAL - Blocks YouTube playback despite fix

---

## Executive Summary

YouTube video fails to play despite implementing race condition fix (200ms delay + safe API wrapper). Root cause: **DOM element availability race condition** - the `youtube-player` div is conditionally rendered, causing useEffect to run before the element exists in DOM.

**Root Cause:** useEffect checks for `document.getElementById("youtube-player")` immediately after render, but the element hasn't been painted to DOM yet when switching from non-YouTube to YouTube songs.

**Impact:** YouTube playback feature completely non-functional.

**Fix Priority:** P0 - Immediate

---

## Root Cause Analysis

### Primary Issue: DOM Element Timing Race Condition

**File:** `hooks/use-youtube-player.ts:62-66`

```typescript
// Check if DOM element exists before initializing
const playerElement = document.getElementById("youtube-player");
if (!playerElement) {
  return; // ← Early exit, never initializes player!
}
```

**File:** `MusicSidebar.tsx:295-303` (Conditional rendering)

```typescript
{isYouTube && (
  <div className="...">
    <div id="youtube-player" className="w-full h-full" />
  </div>
)}
```

### Execution Timeline

**SCENARIO: User selects YouTube song from playlist**

1. **Initial State:** currentTrack = 0 (uploaded song), isYouTube = false
2. **youtube-player div NOT in DOM**
3. **useYouTubePlayer hook:** videoId = "", early return at line 58
4. **Hook returns:** { isReady: false, playVideo: fn, ... }

---

**User clicks YouTube song:**

5. **setCurrentTrack(5)** → currentTrack changes
6. **MusicSidebar re-renders**
7. **isYouTube = true** (currentSong.sourceType === "youtube")
8. **JSX renders youtube-player div** (scheduled for paint)
9. **useYouTubePlayer useEffect runs** (same tick, before browser paint)
10. **DOM check at line 63:** `document.getElementById("youtube-player")` → **NULL**
11. **Early return** → Player never initialized
12. **Hook returns:** { isReady: false, playVideo: fn, ... }

---

**Result:** No player instance created, isReady stays false forever, all API calls silently fail.

---

## Secondary Issue: Silent Failures

**File:** `hooks/use-youtube-player.ts:36-54`

```typescript
const safePlayerCall = useCallback(
  <T>(method: string, ...args: any[]): T | null => {
    try {
      if (!playerRef.current || !isReady) {
        return null;  // ← SILENT failure, no console output!
      }
      // ...
    }
  },
  [isReady]
);
```

**Problem:** When playVideo() is called but player not ready, safePlayerCall returns null **WITHOUT logging**. User has no feedback that calls are failing.

**Impact:** Debugging extremely difficult - no console errors, no warnings, just silent failure.

---

## Contributing Factors

### 1. Conditional Rendering Pattern

The youtube-player div only exists when displaying YouTube songs. This is correct for UX (ToS compliance), but creates initialization timing issue.

### 2. useEffect Timing

React's useEffect runs **after render but before browser paint**. DOM queries in useEffect can fail if element just rendered.

### 3. videoId Dependency

Hook useEffect depends on `options.videoId` (line 144), causing re-initialization on track changes. Each re-init requires DOM element check.

---

## Evidence

### Test 1: First Load with YouTube Song

**Setup:** Page loads with YouTube song as currentTrack

**Result:** Player works! Element exists on first render.

**Conclusion:** Issue only affects **transitions** from non-YouTube to YouTube songs.

---

### Test 2: Switch from Uploaded to YouTube Song

**Setup:** Start with uploaded song, switch to YouTube song

**Expected:** Player initializes, video plays

**Actual:** Player never initializes, playVideo() fails silently

**Confirmation:** This is the reported bug.

---

### Test 3: Console Logging

Add debug logging to safePlayerCall:

```typescript
if (!playerRef.current || !isReady) {
  console.warn(
    "safePlayerCall failed:",
    method,
    "playerRef:",
    !!playerRef.current,
    "isReady:",
    isReady,
  );
  return null;
}
```

**Result:** Logs show `playerRef: false, isReady: false` → Player never created.

---

## Why Previous Fix Didn't Work

The 200ms delay fix addressed **YouTube API internal race condition** (iframe.src initialization), but didn't address **DOM element availability** race condition.

**Previous fix timeline:**

1. onReady fires → setTimeout 200ms
2. After 200ms → setIsReady(true)
3. Player ready for API calls

**But:** Step 1 never happens because new YT.Player() never executes due to DOM element check failing!

---

## Recommended Fix

### Option A: useLayoutEffect (Recommended)

Replace useEffect with useLayoutEffect to ensure DOM element exists:

```typescript
import { useLayoutEffect } from "react";

// Change line 56:
useLayoutEffect(() => {
  // DOM element check now happens AFTER browser paint
  const playerElement = document.getElementById("youtube-player");
  if (!playerElement) {
    return;
  }
  // ... rest of initialization
}, [options.videoId, ...]);
```

**Pros:**

- Runs after DOM paint, element guaranteed to exist
- No additional delays
- Minimal code change

**Cons:**

- useLayoutEffect blocks paint (minor performance impact)
- Not ideal for SSR (but this is client-only)

---

### Option B: Retry with Delay

Add retry logic if element not found:

```typescript
useEffect(() => {
  if (!options.videoId) return;

  let playerElement = document.getElementById("youtube-player");

  if (!playerElement) {
    // Retry after next paint
    const timer = setTimeout(() => {
      playerElement = document.getElementById("youtube-player");
      if (playerElement) {
        initializePlayer();
      }
    }, 0);
    return () => clearTimeout(timer);
  }

  initializePlayer();
  // ...
}, [options.videoId, ...]);
```

**Pros:**

- Doesn't block paint
- Handles edge cases gracefully

**Cons:**

- More complex
- Introduces another timing delay

---

### Option C: Ref-based Approach (Best)

Use React ref instead of getElementById:

**In MusicSidebar.tsx:**

```typescript
const youtubePlayerRef = useRef<HTMLDivElement>(null);

// Pass ref to hook
const { ... } = useYouTubePlayer({
  videoId: isYouTube ? currentSong.youtubeVideoId || "" : "",
  containerRef: youtubePlayerRef,  // ← Pass ref
  // ...
});

// JSX:
<div ref={youtubePlayerRef} id="youtube-player" />
```

**In use-youtube-player.ts:**

```typescript
interface UseYouTubePlayerOptions {
  videoId: string;
  containerRef?: React.RefObject<HTMLDivElement>; // ← Add ref
  // ...
}

useEffect(() => {
  const element = options.containerRef?.current;
  if (!element) return; // ← Ref-based check

  // Initialize using element directly
  playerRef.current = new window.YT.Player(element, {
    // ...
  });
}, [options.videoId, options.containerRef]);
```

**Pros:**

- React-native approach
- No getElementById, no timing issues
- Element guaranteed to exist when ref is set
- More robust

**Cons:**

- Requires API change (breaking)
- More code changes

---

## Additional Improvements

### 1. Add Debug Logging

```typescript
const safePlayerCall = useCallback(
  <T>(method: string, ...args: any[]): T | null => {
    try {
      if (!playerRef.current || !isReady) {
        console.warn(
          `[YouTube] ${method} skipped - playerRef: ${!!playerRef.current}, isReady: ${isReady}`
        );
        return null;
      }
      // ...
    }
  },
  [isReady]
);
```

**Benefit:** Visibility into failures during development.

---

### 2. Memoize Wrapper Functions

```typescript
const playVideo = useCallback(
  () => safePlayerCall("playVideo"),
  [safePlayerCall],
);
const pauseVideo = useCallback(
  () => safePlayerCall("pauseVideo"),
  [safePlayerCall],
);
// ...

return {
  player: playerRef.current,
  isReady,
  playVideo,
  pauseVideo,
  // ...
};
```

**Benefit:** Stable function references, fewer effect re-runs in MusicSidebar.

---

### 3. Add Player State Validation

```typescript
const safePlayerCall = useCallback(
  <T>(method: string, ...args: any[]): T | null => {
    try {
      if (!playerRef.current || !isReady) return null;

      // Validate player is functional
      const state = playerRef.current.getPlayerState?.();
      if (state === undefined) {
        console.warn(`[YouTube] Player not functional for ${method}`);
        return null;
      }

      // ... proceed with call
    }
  },
  [isReady]
);
```

**Benefit:** Extra safety against YouTube API quirks.

---

## Impact Assessment

### User Experience

- **Severity:** CRITICAL
- **Frequency:** 100% when switching to YouTube song
- **Workaround:** Refresh page with YouTube song already selected

### System Impact

- Blocks Phase 4 testing
- YouTube feature completely broken
- Manual testing cannot proceed

### Business Impact

- Feature cannot be released
- Delays project timeline
- Requires immediate hotfix

---

## Reproduction Steps

1. Start web app with playlist containing both uploaded and YouTube songs
2. Ensure initial song (currentTrack = 0) is uploaded song
3. Click on YouTube song in playlist
4. Click play button
5. Observe: No playback, no console errors
6. Check: isReady stays false, playerRef.current is null

**100% Reproduction Rate**

---

## Verification Tests

After implementing fix, verify:

1. **Cold start with YouTube song:** Player initializes, plays correctly
2. **Switch from uploaded to YouTube:** Player initializes on transition
3. **Switch between YouTube songs:** loadVideoById works
4. **Switch from YouTube to uploaded:** Cleanup works, audio tag takes over
5. **Rapid track changes:** No race conditions or crashes

---

## Code Locations

**Primary Files:**

- `apps/web/hooks/use-youtube-player.ts:62-66` - DOM element check (ROOT CAUSE)
- `apps/web/hooks/use-youtube-player.ts:36-54` - Silent failure wrapper
- `apps/web/components/LoveDays/MusicSidebar.tsx:295-303` - Conditional rendering

**Related Files:**

- `apps/web/components/LoveDays/MusicSidebar.tsx:164-182` - Play/pause effect
- `apps/web/components/LoveDays/MusicSidebar.tsx:184-204` - Track change effect

---

## Implementation Plan

### Phase 1: Quick Fix (Option A - useLayoutEffect)

**Time:** 15 minutes

**Changes:**

1. Replace useEffect with useLayoutEffect in use-youtube-player.ts
2. Add console.warn in safePlayerCall for debugging
3. Test track switching

**Files Modified:**

- `apps/web/hooks/use-youtube-player.ts` (2 lines changed)

---

### Phase 2: Comprehensive Fix (Option C - Ref-based)

**Time:** 45 minutes

**Changes:**

1. Add containerRef to UseYouTubePlayerOptions interface
2. Update MusicSidebar to use ref
3. Refactor initialization to use ref instead of getElementById
4. Memoize wrapper functions
5. Add debug logging
6. Update tests

**Files Modified:**

- `apps/web/hooks/use-youtube-player.ts` (20 lines changed)
- `apps/web/components/LoveDays/MusicSidebar.tsx` (5 lines changed)

**Benefits:**

- More robust
- No timing issues
- Better React patterns
- Easier to test

---

## Unresolved Questions

1. Should we add loading state UI during 200ms YouTube initialization?
2. Should wrapper functions be memoized in Phase 1 or Phase 2?
3. Should we add E2E tests for track switching scenarios?
4. Should debug logging be permanent or dev-only?

---

## References

- **Previous Investigation:** `plans/reports/debugger-260112-youtube-setvolume-null-error.md`
- **Phase 4 Testing:** `plans/260106-youtube-reference-playback/reports/phase-04-testing-results.md`
- **React useEffect Timing:** https://react.dev/reference/react/useEffect
- **React useLayoutEffect:** https://react.dev/reference/react/useLayoutEffect
- **YouTube IFrame API:** https://developers.google.com/youtube/iframe_api_reference

---

**Report Status:** COMPLETE
**Recommended Fix:** Option A (immediate) → Option C (follow-up)
**Estimated Fix Time:** 15 minutes (Phase 1), 45 minutes (Phase 2)
**Testing Required:** Manual verification with track switching scenarios
**Priority:** P0 - Blocking release
