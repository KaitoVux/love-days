# Web UI Refactor Plan: Migration to New UI Design

**Plan Date:** 2025-12-25
**Status:** Ready for Review
**Estimated Complexity:** High

## Executive Summary

Migrate `apps/web` from Next.js Pages Router + SCSS modules to modern Vite + React + shadcn/ui architecture based on `apps/web-new-ui` source, preserving all audio player functionality and data.

**Key Outcome:** Modern UI with dark theme, glassmorphism design, improved animations, responsive sidebar music player, while maintaining Supabase audio playback and monorepo integration.

---

## 1. Analysis Overview

### Current State (`apps/web`)

**Tech Stack:**

- Next.js 15.2.1 (Pages Router, static export)
- React 19 + TypeScript 5.4.2
- Tailwind CSS + SCSS modules
- Supabase Storage for audio
- Shared `@love-days/utils` package
- Turborepo monorepo

**Architecture:**

```
apps/web/
├── pages/
│   └── index.tsx              # Main page
├── components/
│   ├── Player/                # Audio player (SCSS)
│   ├── CountUp/               # Timer component
│   ├── MainSection/           # Profile section
│   ├── Title/                 # Page title
│   └── Footer/                # Footer
├── layouts/
│   └── MainLayout.tsx
└── styles/                    # Global SCSS
```

**Key Features:**

- Audio player with playlist (16 songs from Supabase)
- Countdown timer from August 22, 2020
- Profile section (Niu boà & Mỉu Lem)
- Static images for profiles
- Simple Tailwind styling

---

### Target State (`apps/web-new-ui`)

**Tech Stack:**

- **Vite 5.4.19** (instead of Next.js)
- React 18.3.1 + TypeScript 5.8.3
- **React Router DOM 6.30.1** (client-side routing)
- **shadcn/ui** (49 components based on Radix UI)
- **Tailwind CSS** with custom theme
- **TanStack Query 5.83.0** (data fetching)
- **lucide-react** (icon library)
- **next-themes** (dark mode support)
- Modern animations (`tailwindcss-animate`)

**Architecture:**

```
apps/web-new-ui/
├── src/
│   ├── App.tsx                # Router setup
│   ├── main.tsx               # Entry point
│   ├── pages/
│   │   ├── Index.tsx          # Main page
│   │   └── NotFound.tsx       # 404 page
│   ├── components/
│   │   ├── ui/                # 49 shadcn components
│   │   └── LoveDays/
│   │       ├── MusicSidebar.tsx     # Music player (right sidebar)
│   │       ├── CountUp.tsx          # Timer with animations
│   │       ├── ProfileSection.tsx   # Profile cards
│   │       ├── Title.tsx            # Animated title
│   │       ├── Footer.tsx           # Footer
│   │       ├── Clock.tsx            # Clock component
│   │       └── FloatingHearts.tsx   # Animated hearts
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   └── utils.ts           # cn() utility
│   └── index.css              # Global styles + theme
└── vite.config.ts
```

**Key Features:**

- **Right sidebar music player** (collapsible, 6 demo tracks)
- Glassmorphism UI with dark theme (HSL color system)
- Custom fonts (Playfair Display, Cormorant Garamond, Nunito)
- Advanced animations (fade-in, float, pulse, glow effects)
- Floating hearts background animation
- Real-time clock with seconds
- Responsive design with mobile support
- Modern component architecture

---

## 2. Key Differences & Migration Challenges

### Tech Stack Changes

| Aspect                 | Current (Next.js) | Target (Vite)             | Impact                        |
| ---------------------- | ----------------- | ------------------------- | ----------------------------- |
| **Build Tool**         | Next.js 15        | Vite 5                    | Complete build config rewrite |
| **Routing**            | Pages Router      | React Router DOM          | Client-side routing only      |
| **SSR/SSG**            | Static export     | SPA                       | No SSR, client-only           |
| **Image Optimization** | `next/image`      | Standard `<img>`          | Lose optimization             |
| **Component Library**  | None              | shadcn/ui (49 components) | Add UI primitives             |
| **State Management**   | useState only     | TanStack Query ready      | Optional migration            |
| **Icons**              | SVG files         | lucide-react              | Icon library change           |
| **Styling**            | SCSS modules      | CSS-in-Tailwind           | Remove SCSS                   |
| **Theme**              | Basic Tailwind    | HSL custom theme          | Complete redesign             |

### Functional Mapping

| Feature          | Current Implementation                                     | New UI Implementation                                            | Migration Strategy                             |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| **Audio Player** | `<Player>` component with refs, timeline, playlist in card | `<MusicSidebar>` right sidebar with controls, shuffle, repeat    | **Preserve**: Supabase audio, replace UI shell |
| **Song Data**    | `@love-days/utils` songs array (16 songs)                  | Hardcoded 6 demo songs                                           | **Keep**: Existing song data from utils        |
| **Timer**        | `<CountUp>` - Years/Months/Days text                       | `<CountUp>` - Animated time blocks with seconds                  | **Enhance**: Add seconds, animations           |
| **Profiles**     | `<MainSection>` - Static images, simple layout             | `<ProfileSection>` - Emoji avatars, gradient borders, animations | **Hybrid**: Keep real images, add animations   |
| **Title**        | `<MainTitle>` - Simple text                                | `<Title>` - Gradient text with animated hearts                   | **Replace**: Use new animated version          |
| **Footer**       | Basic text                                                 | Animated with heart icon                                         | **Replace**: Use new version                   |
| **Clock**        | `<Clock>` component (exists)                               | Not in new UI                                                    | **Keep**: Integrate into new design            |
| **Background**   | Solid color                                                | Floating hearts animation                                        | **Add**: New feature                           |

### Critical Preservation Requirements

1. **Audio System Integration:**

   - Must use `@love-days/utils` song data (16 songs)
   - Supabase storage URLs must work
   - Audio playback logic preserved

2. **Data Accuracy:**

   - Start date: `2020-08-22T00:00:00` (hardcoded in both)
   - Profile names: "Niu boà" & "Mỉu Lem"
   - Real profile images from `/public/images/` (not emoji)

3. **Monorepo Integration:**
   - Must remain in Turborepo workspace
   - Maintain npm scripts compatibility
   - ESLint, Prettier, TypeScript configs

---

## 3. Migration Strategy

### Approach: **Incremental Refactor (Recommended)**

Modify `apps/web` in-place rather than replace wholesale. Safer for preserving functionality.

**Rationale:**

- Less risk of breaking Supabase integration
- Preserve Git history and configurations
- Easier rollback if issues arise
- Maintain monorepo tooling setup

---

## 4. Implementation Phases

### Phase 1: Foundation Setup

**Goal:** Prepare Next.js app for component migration without breaking functionality

#### Tasks:

1. **Install Dependencies**

   ```bash
   cd apps/web
   npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
   npm install @radix-ui/react-slider @radix-ui/react-tooltip
   ```

2. **Update Tailwind Config** (`apps/web/tailwind.config.js`)

   - Add HSL color system (from new UI `index.css`)
   - Add custom fonts (Playfair Display, Cormorant Garamond, Nunito)
   - Add animations (fade-in, scale-in, float, pulse-slow)
   - Add custom utilities (text-gradient, glow-primary)

3. **Create Global Styles** (`apps/web/styles/globals.scss` → `.css`)

   - Import Google Fonts
   - Add CSS variables for theme (background, primary, card, etc.)
   - Add keyframe animations (float-up for hearts)
   - Add utility classes

4. **Add Utilities**

   - Create `apps/web/lib/utils.ts` with `cn()` function:

     ```ts
     import { clsx, type ClassValue } from "clsx";
     import { twMerge } from "tailwind-merge";

     export function cn(...inputs: ClassValue[]) {
       return twMerge(clsx(inputs));
     }
     ```

5. **Install shadcn/ui Components** (as needed)
   - Use CLI or copy components from `apps/web-new-ui/src/components/ui/`
   - Required: `slider.tsx`, `tooltip.tsx`
   - Optional: Add more as needed for future enhancements

**Validation:**

- `npm run dev` works
- No build errors
- Existing functionality intact

---

### Phase 2: Component Migration - Non-Breaking

**Goal:** Add new UI components alongside existing ones

#### Tasks:

1. **Create `components/LoveDays/` Directory**

   ```
   apps/web/components/LoveDays/
   ├── Title.tsx              # Animated title
   ├── ProfileSection.tsx     # Profile cards
   ├── CountUp.tsx            # Time blocks
   ├── Footer.tsx             # Footer with heart
   ├── FloatingHearts.tsx     # Background animation
   └── MusicSidebar.tsx       # Music player sidebar
   ```

2. **Port Components (Copy & Adapt)**

   **a. FloatingHearts.tsx**

   - Direct copy from new UI
   - No dependencies on app data

   **b. Title.tsx**

   - Direct copy from new UI
   - Uses `lucide-react` Heart icon

   **c. Footer.tsx**

   - Direct copy from new UI
   - Simple component

   **d. ProfileSection.tsx**

   - **Modify:** Replace emoji with real images
     ```tsx
     // Replace emoji span
     <img
       src="/images/niu_boa.jpg"
       alt="Niu boà"
       className="w-full h-full rounded-full object-cover"
     />
     ```
   - Keep gradient borders and animations

   **e. CountUp.tsx**

   - Port time calculation logic
   - **Add:** Real-time seconds update (every 1s instead of 1min)
   - Use animated TimeBlock component
   - Preserve `START_DATE = "2020-08-22T00:00:00"`

3. **Test Each Component**
   - Create temporary test page to verify visuals
   - Ensure animations work
   - Verify responsive behavior

**Validation:**

- All new components render correctly
- Animations smooth
- No console errors

---

### Phase 3: Audio Player Migration (Critical)

**Goal:** Replace `<Player>` with `<MusicSidebar>` while preserving Supabase integration

#### Tasks:

1. **Analyze Current Player** (`apps/web/components/Player/index.tsx`)

   - Audio element with refs (`playerRef`, `timelineRef`, `playheadRef`)
   - Timeline click/hover handlers
   - Play/pause/prev/next logic
   - Playlist rendering
   - Uses `@love-days/utils` songs array

2. **Port MusicSidebar Base** (`apps/web-new-ui/src/components/LoveDays/MusicSidebar.tsx`)

   - Copy component structure
   - **Replace:** Hardcoded playlist with `@love-days/utils` import

     ```tsx
     import { songs, ISong } from "@love-days/utils";

     const playlist: ISong[] = songs; // Use all 16 songs
     ```

3. **Add Audio Element Integration**

   - Add `<audio ref={audioRef}>` element (currently missing in new UI)
   - Wire up play/pause state to actual audio
   - Connect timeline to audio.currentTime
   - Add `onEnded` handler for auto-next

4. **Implement Missing Features**

   - **Volume control:** Connect slider to `audio.volume`
   - **Progress tracking:** Update from `audio.timeupdate` event
   - **Shuffle mode:** Randomize next track selection
   - **Repeat modes:** Implement off/all/one logic
   - **Track selection:** Update audio.src on track change

5. **Update Image Handling**

   - Replace Unsplash demo images with song.img from utils
   - Handle missing images gracefully

6. **Preserve Existing Logic**

   - Keep `formatTime()` helper
   - Keep timeline interaction handlers
   - Ensure autoplay on component mount works

7. **Test Audio Functionality**
   - Play/pause works
   - Track navigation (prev/next) works
   - Timeline scrubbing works
   - Volume control works
   - Playlist selection works
   - Songs load from Supabase correctly

**Validation:**

- Audio plays from Supabase
- All 16 songs appear in playlist
- Controls fully functional
- No audio glitches or lag

---

### Phase 4: Page Layout Integration

**Goal:** Replace old components in `pages/index.tsx` with new UI

#### Tasks:

1. **Update Main Page** (`apps/web/pages/index.tsx`)

   **Before:**

   ```tsx
   <MainLayout>
     <div className="grid md:grid-cols-3">
       <div className="md:col-span-2">
         <MainTitle />
         <CountUp />
         <MainSection />
         <Footer />
       </div>
       <div className="mx-auto pt-16">
         <Player />
       </div>
     </div>
   </MainLayout>
   ```

   **After:**

   ```tsx
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
   ```

2. **Remove MainLayout** (if no longer needed)

   - Check if layout provides critical functionality
   - Merge any necessary logic into page component

3. **Clean Up Old Components**

   - **Keep for reference (don't delete immediately):**
     - `components/Player/` (backup)
     - `components/MainSection/`
     - `components/Title/`
   - **Can delete after validation:**
     - SCSS module files (`.module.scss`)
     - Old component exports

4. **Update Head Metadata**
   - Ensure title, description, favicon preserved
   - Add any missing meta tags

**Validation:**

- Page renders with new layout
- All components visible
- No layout breaks on mobile/desktop
- Music sidebar toggleable

---

### Phase 5: Styling & Polish

**Goal:** Apply final design touches and ensure pixel-perfect quality

#### Tasks:

1. **Theme Consistency**

   - Verify all components use CSS variables
   - Check dark mode (if applicable)
   - Ensure color contrast for accessibility

2. **Animation Timing**

   - Adjust `animationDelay` values for stagger effect
   - Test performance on slower devices
   - Ensure no animation jank

3. **Responsive Behavior**

   - Test on mobile (320px - 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (1024px+)
   - Verify sidebar behavior on mobile

4. **Font Loading**

   - Add Google Fonts preconnect for performance:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com" />
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
     ```
   - Ensure fonts load before render (use `font-display: swap`)

5. **Image Optimization**

   - Optimize profile images (compress, WebP format)
   - Add proper alt text
   - Ensure images are in `/public/images/`

6. **Performance Checks**
   - Run Lighthouse audit
   - Check bundle size
   - Verify no memory leaks from audio/timers

**Validation:**

- Design matches new UI mockup
- Smooth animations
- Fast initial load
- No accessibility warnings

---

### Phase 6: Cleanup & Documentation

**Goal:** Remove legacy code and document changes

#### Tasks:

1. **Remove Deprecated Files**

   - Delete SCSS modules (`.module.scss`)
   - Delete old component folders
   - Remove unused dependencies (check if any SCSS-specific packages)

2. **Update Package.json**

   - Remove unused dependencies
   - Verify all new dependencies listed
   - Update `lint:fix` and `format` scripts if needed

3. **Update TypeScript Config**

   - Add path alias if needed: `"@/*": ["./"]`
   - Ensure strict mode enabled

4. **Environment Variables**

   - Verify `NEXT_PUBLIC_SUPABASE_URL` still works
   - Document any new env vars

5. **Update README** (if exists in `apps/web/`)

   - Document new component structure
   - Update setup instructions
   - Add design system notes

6. **Git Commit Strategy**
   - Commit each phase separately
   - Clear commit messages
   - Tag final version

**Validation:**

- No build warnings
- All linting passes
- TypeScript compiles without errors
- Clean git history

---

## 5. Risk Analysis & Mitigation

### High Risk Items

| Risk                                      | Impact | Probability | Mitigation                                                 |
| ----------------------------------------- | ------ | ----------- | ---------------------------------------------------------- |
| **Supabase audio breaks**                 | High   | Medium      | Test audio early (Phase 3), keep backup of old Player      |
| **Next.js static export incompatibility** | High   | Low         | Vite patterns don't require SSG, verify build output works |
| **Performance degradation**               | Medium | Low         | Profile before/after, optimize heavy animations            |
| **Mobile layout breaks**                  | Medium | Medium      | Test on real devices, use Chrome DevTools mobile view      |
| **Lost functionality**                    | High   | Low         | Thorough testing checklist, QA each phase                  |

### Mitigation Strategies

1. **Incremental Migration:** Each phase is independently testable
2. **Backup Plan:** Keep old components until fully validated
3. **Rollback Strategy:** Git branches for each phase
4. **Testing Checklist:** (See Section 6)

---

## 6. Testing Checklist

### Functional Testing

- [ ] **Audio Player**

  - [ ] Play button starts audio
  - [ ] Pause button stops audio
  - [ ] Next track works
  - [ ] Previous track works
  - [ ] Playlist selection changes track
  - [ ] Timeline scrubbing seeks correctly
  - [ ] Volume slider adjusts volume
  - [ ] Mute toggle works
  - [ ] Shuffle mode randomizes tracks
  - [ ] Repeat modes (off/all/one) work
  - [ ] Auto-advance on track end
  - [ ] All 16 songs load from Supabase

- [ ] **Timer / CountUp**

  - [ ] Displays correct time elapsed since 2020-08-22
  - [ ] Updates every second
  - [ ] Shows years, months, days, hours, minutes, seconds
  - [ ] No timer drift over time

- [ ] **Profile Section**

  - [ ] Displays "Niu boà" with image
  - [ ] Displays "Mỉu Lem" with image
  - [ ] Images load correctly
  - [ ] Animations play on page load

- [ ] **UI Components**
  - [ ] Title renders with hearts
  - [ ] Footer appears at bottom
  - [ ] Floating hearts animate in background
  - [ ] Music sidebar toggles open/closed
  - [ ] All icons display correctly

### Visual Testing

- [ ] **Layout**

  - [ ] Centered content on all screen sizes
  - [ ] Sidebar doesn't overlap main content
  - [ ] No horizontal scroll
  - [ ] Proper spacing and alignment

- [ ] **Responsive Design**

  - [ ] Mobile (320px-767px): Stacked layout, sidebar full-width when open
  - [ ] Tablet (768px-1023px): Hybrid layout
  - [ ] Desktop (1024px+): Full layout with sidebar

- [ ] **Animations**

  - [ ] Fade-in effects smooth
  - [ ] Float animations not jumpy
  - [ ] Hearts float smoothly across screen
  - [ ] Pulse effects on hearts

- [ ] **Theme**
  - [ ] Dark theme colors consistent
  - [ ] Primary color (pink) used correctly
  - [ ] Glassmorphism effects visible
  - [ ] Text readable on all backgrounds

### Performance Testing

- [ ] **Load Time**

  - [ ] Initial page load < 3 seconds
  - [ ] Audio starts playing without delay
  - [ ] No layout shift

- [ ] **Runtime**
  - [ ] No memory leaks from timers
  - [ ] Smooth 60fps animations
  - [ ] Audio playback smooth (no stuttering)

### Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 7. Dependencies & Prerequisites

### Required Before Start

1. **Backup Current Code**

   ```bash
   git checkout -b backup-old-ui
   git checkout master
   git checkout -b feature/web-ui-refactor
   ```

2. **Verify Supabase Access**

   - Ensure `.env.local` has valid credentials
   - Test audio URL accessibility
   - Confirm all 16 songs uploaded to bucket

3. **Team Alignment**
   - Review plan with stakeholders
   - Approve design changes
   - Confirm timeline

### New Dependencies (Phase 1)

```json
{
  "dependencies": {
    "lucide-react": "^0.462.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-tooltip": "^1.2.7"
  },
  "devDependencies": {
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## 8. Timeline Estimate (Development Days)

| Phase                        | Tasks                       | Complexity | Days        |
| ---------------------------- | --------------------------- | ---------- | ----------- |
| Phase 1: Foundation          | Dependencies, config, utils | Low        | 1           |
| Phase 2: Component Migration | Port 6 components           | Medium     | 2           |
| Phase 3: Audio Player        | Complex integration         | High       | 3           |
| Phase 4: Page Layout         | Integration & cleanup       | Medium     | 1           |
| Phase 5: Styling & Polish    | Fine-tuning                 | Low-Medium | 2           |
| Phase 6: Cleanup             | Documentation               | Low        | 1           |
| **Total**                    |                             |            | **10 days** |

_Note: Assumes single developer, no major blockers_

---

## 9. Success Criteria

### Must Have (MVP)

- [ ] Audio player fully functional with Supabase
- [ ] All 16 songs playable
- [ ] Timer shows accurate elapsed time
- [ ] Profile images display correctly
- [ ] Responsive on mobile & desktop
- [ ] No console errors
- [ ] Passes TypeScript compilation
- [ ] Passes linting

### Nice to Have (Enhancements)

- [ ] Dark mode toggle (if implementing theme switching)
- [ ] Keyboard shortcuts for player
- [ ] Custom playlist ordering
- [ ] Song favorite/like system
- [ ] Share functionality

---

## 10. Rollback Plan

If critical issues arise:

1. **Immediate Rollback:**

   ```bash
   git checkout master
   git reset --hard backup-old-ui
   ```

2. **Partial Rollback:**

   - Keep new UI components
   - Revert to old Player component
   - Fix integration issues

3. **Investigation:**
   - Identify root cause
   - Fix in separate branch
   - Re-test before re-deployment

---

## 11. Post-Migration Tasks

### Immediate (Week 1)

- [ ] Monitor production errors (if deployed)
- [ ] Gather user feedback
- [ ] Fix any critical bugs

### Short-term (Month 1)

- [ ] Optimize performance based on metrics
- [ ] Add any missing features
- [ ] Improve accessibility

### Long-term (Quarter 1)

- [ ] Consider migrating from Next.js to Vite fully (if desired)
- [ ] Add more shadcn/ui components for future features
- [ ] Implement user-requested enhancements

---

## 12. Open Questions

1. **Should we migrate to Vite completely?**

   - **Current Plan:** Keep Next.js, just adopt new UI components
   - **Alternative:** Full migration to Vite (breaks static export, loses Next.js optimizations)
   - **Recommendation:** Stay with Next.js for now, evaluate Vite migration separately

2. **Should we use real images or emojis for profiles?**

   - **Current Plan:** Keep real images (existing in `/public/images/`)
   - **New UI Uses:** Emoji (👨👩)
   - **Recommendation:** Real images for personalization

3. **Do we need TanStack Query?**

   - **Current:** Not using any data fetching library
   - **New UI Has:** TanStack Query installed but unused
   - **Recommendation:** Don't add unless needed for future features

4. **Should we add Clock component integration?**
   - **Current:** Has Clock.tsx component (shows time)
   - **New UI:** No clock component
   - **Recommendation:** Integrate clock into CountUp or as separate element

---

## 13. Component Mapping Reference

| Old Component   | New Component      | Action   | Notes                                 |
| --------------- | ------------------ | -------- | ------------------------------------- |
| `<MainTitle>`   | `<Title>`          | Replace  | Add gradient, animated hearts         |
| `<MainSection>` | `<ProfileSection>` | Replace  | Keep real images, add animations      |
| `<CountUp>`     | `<CountUp>`        | Enhance  | Add seconds, time blocks, animations  |
| `<Player>`      | `<MusicSidebar>`   | Refactor | Preserve Supabase integration, new UI |
| `<Footer>`      | `<Footer>`         | Replace  | Add heart icon, animation             |
| `<Clock>`       | -                  | Optional | Integrate if desired                  |
| -               | `<FloatingHearts>` | Add      | New background animation              |
| `<MainLayout>`  | -                  | Remove   | No longer needed                      |

---

## 14. File Structure After Migration

```
apps/web/
├── pages/
│   └── index.tsx              # Updated with new layout
├── components/
│   ├── LoveDays/              # NEW: Main components
│   │   ├── Title.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── CountUp.tsx
│   │   ├── MusicSidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Clock.tsx
│   │   └── FloatingHearts.tsx
│   ├── ui/                    # NEW: shadcn components
│   │   ├── slider.tsx
│   │   └── tooltip.tsx
│   └── [OLD COMPONENTS]       # To be deleted after validation
├── lib/
│   └── utils.ts               # NEW: cn() utility
├── styles/
│   └── globals.css            # Updated with theme
├── public/
│   ├── images/                # Profile images
│   └── icons/                 # May still be used
├── tailwind.config.js         # Updated with theme
└── package.json               # Updated dependencies
```

---

## 15. Next Steps

1. **Review this plan** with team/stakeholders
2. **Get approval** for timeline and approach
3. **Create feature branch:** `feature/web-ui-refactor`
4. **Begin Phase 1:** Foundation setup
5. **Iterate through phases** with validation at each step

---

## Appendix A: CSS Theme Variables

Copy to `apps/web/styles/globals.css`:

```css
:root {
  --background: 350 30% 8%;
  --foreground: 350 20% 95%;
  --card: 350 25% 12%;
  --card-foreground: 350 20% 95%;
  --primary: 350 80% 65%;
  --primary-foreground: 350 20% 98%;
  --secondary: 350 30% 18%;
  --secondary-foreground: 350 20% 95%;
  --muted: 350 20% 20%;
  --muted-foreground: 350 15% 65%;
  --accent: 350 60% 50%;
  --border: 350 25% 20%;
  --ring: 350 80% 65%;
  --radius: 1rem;
}
```

---

## Appendix B: Import Statement Changes

**Old:**

```tsx
import Image from "next/image";
import styles from "./Component.module.scss";
```

**New:**

```tsx
import { Heart, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
```

---

**Plan Status:** Ready for Implementation
**Last Updated:** 2025-12-25
**Author:** Planning Agent
