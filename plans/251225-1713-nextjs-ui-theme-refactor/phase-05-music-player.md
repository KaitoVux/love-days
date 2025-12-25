# Phase 05: Music Player

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 01](./phase-01-foundation-setup.md), [Phase 02](./phase-02-app-router-migration.md), [Phase 03](./phase-03-theme-system.md), [Phase 04](./phase-04-component-refactor.md)
**Related Docs:** [shadcn Integration Research](./research/researcher-shadcn-integration.md), [Current Web Structure Scout](./scout/scout-current-web-structure.md)

---

## Overview

| Field     | Value      |
| --------- | ---------- |
| Date      | 2025-12-25 |
| Priority  | Critical   |
| Status    | Pending    |
| Est. Time | 3-4 hours  |

Create right sidebar music player using shadcn/ui Slider, lucide-react icons, Supabase audio integration. Most complex refactor - replaces 363-line Player.module.scss.

---

## Key Insights from Research

1. **shadcn Slider** - Based on @radix-ui/react-slider, ~5KB gzipped
2. **Reference implementation** - apps/web-new-ui/src/components/LoveDays/MusicSidebar.tsx
3. **Supabase integration preserved** - `@love-days/utils` provides songs array with audio URLs
4. **Layout pattern** - Fixed right sidebar, toggle button, collapsible
5. **Features needed:**
   - Play/Pause/Next/Prev controls
   - Progress slider (seekable)
   - Volume slider with mute
   - Playlist with track selection
   - Shuffle/Repeat modes
   - Now playing display
   - Mobile responsive (drawer or overlay)

---

## Requirements

### Must Have

- [ ] Install shadcn Slider component
- [ ] Create MusicSidebar component
- [ ] Integrate with @love-days/utils songs array
- [ ] Implement audio playback (HTML5 Audio API)
- [ ] Progress bar with seek functionality
- [ ] Volume control with mute
- [ ] Play/Pause/Next/Prev buttons
- [ ] Playlist display with track selection
- [ ] Auto-advance to next track

### Should Have

- [ ] Shuffle mode
- [ ] Repeat modes (off/all/one)
- [ ] Now playing indicator
- [ ] Toggle sidebar open/close
- [ ] Persist volume preference

### Nice to Have

- [ ] Time display (current/total)
- [ ] Keyboard shortcuts
- [ ] Mobile drawer variant

---

## Architecture Decisions

### 1. Audio State Management

Use refs for audio element, state for UI:

```typescript
const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [currentTrack, setCurrentTrack] = useState(0);
const [progress, setProgress] = useState(0);
const [volume, setVolume] = useState(70);
```

### 2. Supabase Audio Integration

```typescript
import { songs, ISong } from "@love-days/utils";
// songs array contains: { audio, img, name, author, duration }
// audio URL format: {SUPABASE_URL}/storage/v1/object/public/songs/{filename}
```

### 3. Component Structure

```
MusicSidebar.tsx
├── Toggle Button (fixed position)
├── Sidebar Container (fixed right)
│   ├── Header ("Our Playlist")
│   ├── Now Playing
│   │   ├── Album Art
│   │   ├── Track Info
│   │   ├── Progress Slider
│   │   ├── Time Display
│   │   ├── Controls (shuffle, prev, play, next, repeat)
│   │   └── Volume Control
│   └── Playlist (scrollable)
│       └── Track Items
└── Audio Element (hidden)
```

### 4. Responsive Behavior

- Desktop (lg+): Fixed sidebar, ~320px width
- Mobile (< lg): Collapsible overlay or drawer

---

## Related Code Files

| File                                   | Action | Purpose          |
| -------------------------------------- | ------ | ---------------- |
| `components/ui/slider.tsx`             | Create | shadcn Slider    |
| `components/LoveDays/MusicSidebar.tsx` | Create | Main player      |
| `app/page.tsx`                         | Modify | Add MusicSidebar |
| `components/Player/`                   | Delete | Old player       |
| `packages/utils/src/songs.ts`          | Verify | Song data source |

---

## Implementation Steps

### Step 1: Install Radix Slider (5 min)

```bash
cd apps/web
npm install @radix-ui/react-slider
```

### Step 2: Create shadcn Slider Component (15 min)

```typescript
// apps/web/components/ui/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
```

### Step 3: Create MusicSidebar Component (90 min)

```typescript
// apps/web/components/LoveDays/MusicSidebar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { songs, ISong } from "@love-days/utils";
import Image from "next/image";

const MusicSidebar = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const currentSong: ISong = songs[currentTrack];

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all" || currentTrack < songs.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, repeatMode]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      setCurrentTrack((prev) =>
        prev === 0 ? songs.length - 1 : prev - 1
      );
      setProgress(0);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (isShuffle) {
      let next = currentTrack;
      while (next === currentTrack && songs.length > 1) {
        next = Math.floor(Math.random() * songs.length);
      }
      setCurrentTrack(next);
    } else {
      setCurrentTrack((prev) =>
        prev === songs.length - 1 ? 0 : prev + 1
      );
    }
    setProgress(0);
    setIsPlaying(true);
  }, [currentTrack, isShuffle]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setProgress(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrack(index);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentSong.audio} preload="metadata" />

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 p-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-l-lg transition-all duration-300",
          isOpen ? "right-72 md:right-80" : "right-0"
        )}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-primary" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 md:w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 z-40 transition-transform duration-300 flex flex-col font-sans-clean",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Our Playlist
          </h2>
        </div>

        {/* Now Playing */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg glow-primary">
              {currentSong.img ? (
                <Image
                  src={currentSong.img}
                  alt={currentSong.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Now Playing
              </p>
              <h3 className="font-display text-lg font-semibold text-foreground truncate">
                {currentSong.name}
              </h3>
              <p className="text-sm text-muted-foreground font-body truncate">
                {currentSong.author}
              </p>
            </div>
          </div>

          {/* Progress */}
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            className="cursor-pointer mb-2"
            onValueChange={handleSeek}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{currentSong.duration || formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={toggleShuffle}
              className={cn(
                "p-2 rounded-full transition-colors",
                isShuffle
                  ? "text-primary bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={cycleRepeat}
              className={cn(
                "p-2 rounded-full transition-colors",
                repeatMode !== "off"
                  ? "text-primary bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              className="flex-1"
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Playlist */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Playlist
          </h3>
          <div className="space-y-2">
            {songs.map((track, index) => (
              <button
                key={index}
                onClick={() => selectTrack(index)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  currentTrack === index
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-secondary/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg overflow-hidden",
                    currentTrack === index && "ring-2 ring-primary"
                  )}
                >
                  {track.img ? (
                    <Image
                      src={track.img}
                      alt={track.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Music className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      currentTrack === index
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {track.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.author}
                  </p>
                </div>
                {currentTrack === index && isPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "60%" }}
                    />
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "100%", animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "40%", animationDelay: "0.4s" }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicSidebar;
```

### Step 4: Update LoveDays Barrel Export (5 min)

```typescript
// apps/web/components/LoveDays/index.ts
export { default as Title } from "./Title";
export { default as ProfileSection } from "./ProfileSection";
export { default as CountUp } from "./CountUp";
export { default as Footer } from "./Footer";
export { default as FloatingHearts } from "./FloatingHearts";
export { default as MusicSidebar } from "./MusicSidebar";
```

### Step 5: Update Page with MusicSidebar (10 min)

```typescript
// apps/web/app/page.tsx
import {
  Title,
  ProfileSection,
  CountUp,
  Footer,
  FloatingHearts,
  MusicSidebar,
} from "@/components/LoveDays";

export default function Home() {
  return (
    <div className="min-h-[100svh] flex flex-col overflow-x-hidden relative">
      <FloatingHearts />
      <MusicSidebar />
      <main className="flex-1 container mx-auto px-4 pt-4 pb-16 md:pt-6 md:pb-20 flex flex-col items-center justify-center gap-4 md:gap-5 relative z-10">
        <Title />
        <ProfileSection />
        <CountUp />
      </main>
      <Footer />
    </div>
  );
}
```

### Step 6: Remove Old Player Component (5 min)

```bash
rm -rf apps/web/components/Player
```

### Step 7: Verify Functionality (30 min)

```bash
cd apps/web
npm run dev
# Test:
# - Audio plays from Supabase
# - Progress bar updates
# - Seeking works
# - Volume control works
# - Mute toggle works
# - Next/Prev navigation
# - Playlist selection
# - Shuffle mode
# - Repeat modes
# - Sidebar toggle
```

### Step 8: Build Verification (10 min)

```bash
npm run type-check
npm run lint
npm run build
```

---

## Todo List

- [ ] Install @radix-ui/react-slider
- [ ] Create components/ui/slider.tsx
- [ ] Create MusicSidebar.tsx
- [ ] Update LoveDays index.ts
- [ ] Update app/page.tsx
- [ ] Test audio playback
- [ ] Test all player controls
- [ ] Remove old Player component
- [ ] Run type-check, lint, build

---

## Success Criteria

1. Audio plays from Supabase storage
2. Progress slider updates during playback
3. Seeking via progress slider works
4. Volume slider and mute button work
5. Play/Pause toggles correctly
6. Next/Prev navigation works
7. Playlist track selection works
8. Shuffle mode randomizes tracks
9. Repeat modes work (off/all/one)
10. Sidebar toggles open/close
11. Build succeeds

---

## Risk Assessment

| Risk                        | Likelihood | Impact | Mitigation                     |
| --------------------------- | ---------- | ------ | ------------------------------ |
| Audio CORS issues           | Low        | High   | Supabase bucket is public      |
| Mobile autoplay blocked     | Medium     | Medium | Require user interaction first |
| Image loading from Supabase | Low        | Low    | Fallback to icon               |
| Slider thumb not draggable  | Low        | Medium | Test touch events              |

---

## Security Considerations

- Audio URLs from Supabase (trusted)
- No user input processed
- No sensitive data in player state

---

## Next Steps

After completion:

1. Proceed to [Phase 06: Testing & Polish](./phase-06-testing-polish.md)
2. Test on mobile devices
3. Verify audio works on different browsers
