# Phase 05: Music Player - Quick Reference

**Status**: ✅ Complete
**Date**: 2025-12-26
**Files Changed**: 4 modified, 2 created, 3 removed

---

## What's New

### New Components

#### MusicSidebar
**Location**: `apps/web/components/LoveDays/MusicSidebar.tsx`
**Type**: Client component
**Purpose**: Full-featured music player with sidebar layout

```typescript
import { MusicSidebar } from "@/components/LoveDays";

export default function Home() {
  return (
    <>
      <MusicSidebar />
    </>
  );
}
```

#### Slider (shadcn/ui)
**Location**: `apps/web/components/ui/slider.tsx`
**Purpose**: Progress and volume sliders
**Base**: @radix-ui/react-slider

```typescript
<Slider
  value={[progress]}
  max={duration}
  step={1}
  onValueChange={handleSeek}
/>
```

---

## Features at a Glance

| Feature | Status | Notes |
|---------|--------|-------|
| Play/Pause | ✅ | Center button with visual feedback |
| Progress bar | ✅ | Seekable slider with drag support |
| Volume control | ✅ | 0-100 scale slider + mute button |
| Playlist | ✅ | Full track list with selection |
| Next/Previous | ✅ | Smart prev (restart if >3s elapsed) |
| Shuffle | ✅ | Random mode with no-repeat guarantee |
| Repeat | ✅ | Modes: off → all → one |
| Time display | ✅ | Current/Total in MM:SS format |
| Album art | ✅ | 80x80 display with fallback |
| Sidebar toggle | ✅ | Fixed button to show/hide |
| Animations | ✅ | Equalizer bars, smooth transitions |

---

## File Changes

### Created
```
apps/web/components/ui/slider.tsx              (24 lines)
apps/web/components/LoveDays/MusicSidebar.tsx  (394 lines)
```

### Modified
```
apps/web/components/LoveDays/index.ts         (added export)
apps/web/app/page.tsx                          (added <MusicSidebar />)
```

### Removed
```
apps/web/components/Player/                    (entire directory)
  ├── index.tsx
  ├── controls.tsx
  ├── progress.tsx
  └── Player.module.scss
```

---

## Component State

```typescript
// Sidebar state
isOpen: boolean                    // Visible/hidden

// Playback state
isPlaying: boolean                 // Currently playing
currentTrack: number               // Index in songs array
progress: number                   // Current time (seconds)
duration: number                   // Track length (seconds)

// Volume state
volume: number                     // 0-100 scale
isMuted: boolean                   // Muted state

// Playback mode state
isShuffle: boolean                 // Random mode
repeatMode: "off" | "all" | "one"  // Repeat mode
```

---

## Control Behavior

### Play/Pause
- Toggles playback state
- Visual indicator (Play → Pause icon)
- Auto-plays when selecting track

### Previous Button
- If current time > 3s: Restart current track
- Otherwise: Go to previous track
- Circular: Last track → First track

### Next Button
- Advance to next track
- In shuffle mode: Random selection (no immediate repeat)
- Circular: Last track → First track

### Repeat Modes
- **Off**: Stop at end of playlist
- **All**: Loop to beginning
- **One**: Repeat current track indefinitely

### Shuffle
- Only affects next track selection
- Doesn't change current playback
- Visual indicator when active

### Volume
- Slider: 0-100 scale
- Auto-unmute when adjusted above 0
- Mute button: Toggles to 0 volume

---

## CSS Classes Used

### Layout
```
fixed top-0 right-0 h-full w-72 md:w-80
z-40 transition-transform duration-300
```

### Glass-morphism
```
bg-card/95 backdrop-blur-xl border-l border-border/50
```

### Button States
```
hover:bg-secondary/50 transition-colors
p-2 rounded-full | p-3 rounded-full
text-primary bg-primary/20  (active state)
text-muted-foreground hover:text-foreground
```

### Typography
```
font-display text-xl font-semibold
text-xs text-muted-foreground uppercase tracking-wider
```

---

## Styling Reference

### Theme Variables Used
| Variable | Used For |
|----------|----------|
| `--primary` | Play button, active states |
| `--primary-foreground` | Button text |
| `--secondary` | Hover backgrounds |
| `--muted-foreground` | Secondary text |
| `--card` | Container background |
| `--foreground` | Primary text |
| `--border` | Dividers |
| `--background` | Slider thumb |

---

## Dependencies

### New
```json
"@radix-ui/react-slider": "^1.x.x"
```

### Existing Used
- `react` 19
- `next` 15
- `lucide-react`
- `tailwindcss`
- `@love-days/utils`

---

## Responsive Behavior

### Desktop (md and up)
- Sidebar width: 320px (`w-80`)
- Always visible by default
- Slide-in animation when toggled

### Mobile (below md)
- Sidebar width: 288px (`w-72`)
- Overlays main content
- Slide-in animation

---

## Audio Integration

### Data Source
```typescript
import { songs, ISong } from "@love-days/utils";

// songs array format:
// {
//   audio: "https://...supabase.../songs/filename",
//   img: "image-url-or-path",
//   name: "Track Name",
//   author: "Artist Name",
//   duration: "HH:MM:SS" | undefined
// }
```

### Audio Element
```typescript
<audio
  ref={audioRef}
  src={currentSong.audio}
  preload="metadata"
/>
```

### Event Listeners
- `timeupdate` - Progress bar update
- `loadedmetadata` - Duration capture
- `ended` - Auto-advance logic

---

## Performance Notes

### Bundle Impact
- Slider: ~5 KB gzipped
- MusicSidebar: ~8 KB gzipped
- Total: ~13 KB gzipped addition
- Build: 130 kB First Load JS ✅

### Runtime
- 4 useEffect hooks
- 1 audio ref
- 8 state variables
- Batched updates via React 19
- Proper cleanup on unmount

---

## Common Tasks

### Change Default Volume
In `MusicSidebar.tsx` line 28:
```typescript
const [volume, setVolume] = useState(70);  // Change 70 to desired value (0-100)
```

### Modify Sidebar Width
In `MusicSidebar.tsx` line 364:
```typescript
// Change:   w-72 md:w-80
// To: w-64 md:w-96
```

### Add Custom Icons
Replace imports from `lucide-react`:
```typescript
import { CustomIcon } from "lucide-react";
// Use in JSX: <CustomIcon className="w-5 h-5" />
```

### Adjust Colors
Modify Tailwind classes:
```
text-primary → text-red-500
bg-primary/20 → bg-red-100
bg-card/95 → bg-blue-950/95
```

---

## Troubleshooting

### Audio Not Playing
1. Check Supabase URL in environment
2. Verify audio bucket is public
3. Check browser console for CORS errors
4. Try different audio format

### Slider Not Working
1. Verify duration is loaded
2. Check onValueChange callback
3. Inspect audio element in DevTools

### Sidebar Not Opening
1. Check z-index layers (50, 40, 10)
2. Verify toggleButton onClick
3. Check isOpen state

### Playlist Not Showing
1. Verify songs array from @love-days/utils
2. Check map function in playlist section
3. Verify data structure matches ISong

---

## Testing Checklist

- [ ] Audio plays from Supabase
- [ ] Progress updates during playback
- [ ] Seeking works with slider drag
- [ ] Volume slider adjusts sound
- [ ] Mute button silences audio
- [ ] Play/Pause toggles correctly
- [ ] Previous/Next work correctly
- [ ] Shuffle randomizes selection
- [ ] Repeat modes cycle properly
- [ ] Sidebar toggle works
- [ ] Album art displays
- [ ] Fallback icon shows when no image
- [ ] Playlist items selectable
- [ ] Current track highlighted
- [ ] Equalizer animation shows when playing

---

## Related Documents

- [Full Phase 05 Documentation](./UI_THEME_REFACTOR_PHASE05.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Code Standards](./CODE_STANDARDS.md)
- [Supabase Integration](./SUPABASE_INTEGRATION.md)

---

**Quick Ref Version**: 1.0
**Last Updated**: 2025-12-26
