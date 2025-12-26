# System Architecture Documentation

**Version**: 1.2
**Last Updated**: 2025-12-26
**Architecture Pattern**: Layered + Component-Based
**Current Router**: App Router (migrated Phase 02)
**Component System**: Modular LoveDays Components (Phase 04 ✅)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│         Next.js Application (apps/web)              │
├─────────────────────────────────────────────────────┤
│                 Routing Layer                       │
│         (app/, App Router - Phase 02)               │
├─────────────────────────────────────────────────────┤
│            Component Layer                          │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Feature      │  │ UI / shadcn  │                │
│  │ Components   │  │ Components   │                │
│  └──────────────┘  └──────────────┘                │
├─────────────────────────────────────────────────────┤
│          Styling Layer                              │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Tailwind CSS │  │ CSS Modules  │                │
│  │ (utilities)  │  │ (scoped)     │                │
│  └──────────────┘  └──────────────┘                │
├─────────────────────────────────────────────────────┤
│              Data Layer                             │
│  ┌──────────────────────────────────────────┐      │
│  │ Shared Utilities (@love-days/utils)      │      │
│  │ ├─ Types (ISong)                         │      │
│  │ ├─ Song Data + Supabase URLs             │      │
│  │ └─ Date Utilities                        │      │
│  └──────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────┤
│           Infrastructure                           │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Supabase     │  │ Environment  │                │
│  │ Storage      │  │ Variables    │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Routing Layer

**Current**: App Router (Phase 02 ✅)
**Previous**: Pages Router (deprecated)

```
app/
├── layout.tsx            # Root layout (html, body, metadata)
├── page.tsx              # Home page
└── api/                  # API routes (future)

pages/                     # Legacy (empty, kept for API routes)
```

**Characteristics**:

- File-based routing (filename = route)
- Server components by default
- Metadata API for document head
- Static export compatible
- Client components marked with `'use client'`

### 2. Component Layer

#### Feature Components

Located in `components/` by feature:

```
components/
├── LoveDays/                    # Main feature (Phase 04 ✅)
│   ├── Title.tsx               # Main title with hearts
│   ├── ProfileSection.tsx       # Profile images & names
│   ├── CountUp.tsx             # Days counter + clock
│   ├── Footer.tsx              # Footer text
│   ├── FloatingHearts.tsx       # Background animation
│   └── index.ts                # Barrel export
├── Player/
│   ├── index.tsx               # Main player component
│   ├── controls.tsx            # Play/pause/skip
│   ├── progress.tsx            # Progress bar
│   └── Player.module.scss
└── [Feature]/
```

**LoveDays Component Details** (Phase 04):

| Component      | Type   | Purpose                    | Styling  |
| -------------- | ------ | -------------------------- | -------- |
| Title          | Server | Main title with hearts     | Tailwind |
| ProfileSection | Server | Profile images & names     | Tailwind |
| CountUp        | Client | Days counter + clock       | Tailwind |
| Footer         | Server | Footer with heart icon     | Tailwind |
| FloatingHearts | Client | Animated background hearts | Tailwind |

**Characteristics**:

- Feature-organized
- Tailwind-first styling (no CSS Modules)
- Own state management (useState for client components)
- Uses @love-days/utils for date calculations
- Server/client separation for performance
- Responsive design (xs/md/lg breakpoints)

#### UI Components (shadcn/ui)

```
components/ui/
├── index.ts              # Central export hub
├── button.tsx            # Button component (install via cli)
├── dialog.tsx            # Dialog component
├── card.tsx              # Card component
└── [shadcn-component]/
```

**Installation**:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

**Usage**:

```typescript
import { Button } from "@components/ui";
import { cn } from "@lib/utils";

export function MyButton() {
  return (
    <Button className={cn("px-4", "bg-primary")}>
      Click me
    </Button>
  );
}
```

### 3. Styling Layer

#### Tailwind CSS (Utility-First)

```
Tailwind Utilities (Tailwind)
│
├─ Responsive Prefixes: sm:, md:, lg:, xl:, 2xl:, xs:
├─ Dark Mode: dark:
├─ States: hover:, focus:, active:, disabled:
├─ Pseudo-elements: before:, after:
└─ Theme Colors: text-primary, bg-accent, border-border
```

**Theme Color Map** (defined in `tailwind.config.ts`):

```
Color Variable    │  Tailwind Class
──────────────────┼─────────────────────
--background      │  bg-background
--foreground      │  text-foreground
--primary         │  text-primary, bg-primary, border-primary
--secondary       │  text-secondary, bg-secondary
--accent          │  text-accent, bg-accent
--muted           │  text-muted, bg-muted
--destructive     │  text-destructive, bg-destructive
--border          │  border-border
--input           │  border-input
--ring            │  ring-ring
--card            │  bg-card, text-card-foreground
```

**CSS Variables Location**: `apps/web/styles/globals.scss` (`:root` block)

#### CSS Modules (Component Scope)

```scss
// components/Player/Player.module.scss
.player {
  display: flex;
  gap: 1rem;
}

.controls {
  display: flex;
  justify-content: center;
}
```

**Usage**:

```typescript
import styles from "./Player.module.scss";

export function Player() {
  return <div className={styles.player}>...</div>;
}
```

#### Global Styles

**File**: `apps/web/styles/globals.scss`

Structure:

```scss
// 1. Font imports (Google Fonts)
// 2. @tailwind directives
// 3. @layer base (CSS variables, resets)
// 4. @layer utilities (custom utilities)
// 5. Scrollbar styling
```

### 4. Data Layer

#### Shared Utilities Package

```
packages/utils/
├── src/
│   ├── types.ts          # ISong, IPlayer interfaces
│   ├── songs.ts          # Song data + URL generation
│   ├── date-utils.ts     # Date manipulation
│   └── index.ts          # Public exports
├── dist/                 # Compiled output
└── package.json
```

**ISong Interface**:

```typescript
interface ISong {
  id: string; // Unique identifier (kebab-case)
  name: string; // Song title
  author: string; // Artist name
  audio: string; // Full Supabase URL
  img: string; // Album artwork URL
  duration?: string; // Optional duration
}
```

**Song Data**: Static array of 15 songs
**Data Flow**:

1. Song data defined in `packages/utils/src/songs.ts`
2. Exported as array of ISong
3. Imported in Player component
4. Audio URLs generated via Supabase URL helper

#### Data Access Patterns

**Current** (Phase 01):

- Static imports
- No fetching
- Hardcoded metadata

**Future** (Phase 03-04):

- API routes for dynamic data
- Database queries
- Real-time updates

### 5. Infrastructure Layer

#### Supabase Integration

```
┌─────────────────────────┐
│   Supabase Project      │
├─────────────────────────┤
│     Storage API         │
│  ├─ songs/ bucket       │
│  │  ├─ audio1.mp3       │
│  │  ├─ audio2.mp3       │
│  │  └─ ...              │
│  └─ public access       │
└─────────────────────────┘
         ▲
         │ Audio URL
         │ (CDN)
         │
┌─────────────────────────┐
│   Browser               │
│  <audio src="URL" />    │
└─────────────────────────┘
```

**URL Construction** (in `packages/utils/src/songs.ts`):

```typescript
const supabaseStorageUrl = `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs`;
const createSongUrl = (filename: string) => {
  return `${supabaseStorageUrl}/${encodeURIComponent(filename)}`;
};
```

**Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL     // Project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY // Anon key (public)
```

#### Build Output

**Static Export**:

```
apps/web/
├── out/                  # Static export output
│   ├── index.html        # Home page
│   ├── _next/
│   │   ├── static/       # JS chunks
│   │   ├── css/          # CSS files
│   │   └── image-files/  # Optimized images (if used)
│   └── [other-pages]/
└── .next/                # Build cache (intermediate)
```

**Deployment**: Copy `out/` directory to static host.

## Data Flow Diagrams

### Page Load Sequence

```
1. Build time (App Router)
   ├─ app/layout.tsx renders (server component)
   ├─ app/page.tsx renders (server component)
   ├─ Metadata API applied to document head
   └─ Static HTML generated → out/index.html

2. User visits app
   ├─ Browser loads HTML (out/index.html)
   ├─ Browser loads JS chunks (out/_next/static/)
   ├─ Browser loads CSS (out/_next/css/)
   └─ React hydrates client components

3. Client components mount
   ├─ Player (client component, 'use client')
   ├─ CountUp (client component, 'use client')
   └─ Other interactive elements

4. Player component initialization
   ├─ Imports songs from @love-days/utils
   ├─ Renders playlist
   └─ Audio <audio/> elements with Supabase URLs

5. User plays song
   ├─ Browser requests audio from Supabase CDN
   ├─ Audio streams from public bucket
   └─ Player displays UI state
```

### Component Communication

```
app/layout.tsx (Root layout - Server)
│
└─ app/page.tsx (Home page - Server)
   │
   └─ MainLayout (Server component wrapper)
      │
      ├─ MainTitle (Server)
      ├─ CountUp (Client, 'use client')
      ├─ MainSection (Server)
      ├─ Footer (Server)
      │
      └─ Player (Client, 'use client' - main component)
         ├─ useState(currentSong)
         ├─ useState(isPlaying)
         │
         ├─ Controls (Client)
         │  ├─ Button (prev)
         │  ├─ Button (play/pause)
         │  └─ Button (next)
         │
         ├─ Progress (Client)
         │ └─ Slider
         │
         └─ Playlist (Client)
            └─ SongItem (click to play)
```

**State Management**: Component-local (useState)
**Server Components**: Static content rendered at build time
**Client Components**: Interactive elements hydrated in browser
**Context API**: Available for future state sharing
**Global State**: Planned for Phase 03+

## Design System Architecture

### Theme Structure

```
CSS Variables (:root in globals.scss)
│
├─ Semantic Colors
│  ├─ --background / --foreground (page)
│  ├─ --primary / --primary-foreground (actions)
│  ├─ --secondary / --secondary-foreground (surfaces)
│  ├─ --accent / --accent-foreground (highlights)
│  ├─ --card / --card-foreground (containers)
│  ├─ --border / --input / --ring (UI elements)
│  └─ --destructive / --destructive-foreground (errors)
│
├─ Component-Specific
│  ├─ --sidebar-background
│  ├─ --sidebar-foreground
│  ├─ --sidebar-primary
│  └─ --sidebar-accent
│
├─ Spacing
│  └─ Tailwind scale (0.25rem increments)
│
├─ Typography
│  ├─ --font-display (Playfair Display)
│  ├─ --font-body (Cormorant Garamond)
│  ├─ --font-sans (Nunito)
│  └─ --radius (border radius)
│
└─ Animation
   ├─ fade-in (0.5s)
   ├─ pulse-slow (3s)
   └─ float (6s, 12s)
```

### Responsive Strategy

**Mobile-First Breakpoints**:

```
xs:  320px   (phones)
sm:  640px   (tablets)
md:  768px   (small laptops)
lg:  1024px  (laptops)
xl:  1280px  (large screens)
2xl: 1536px  (very large screens)
```

**Example Usage**:

```html
<!-- 2 columns on mobile, 4 on tablet, 6 on desktop -->
<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"></div>
```

## Build & Deployment Pipeline

### Build Steps

```
1. Install Dependencies
   npm install

2. Type Check
   tsc --noEmit

3. Lint
   eslint .

4. Build Next.js
   next build
   ├─ Compile TypeScript
   ├─ Bundle JavaScript
   ├─ Process Tailwind CSS
   ├─ Optimize images (if any)
   └─ Generate static export (out/)

5. Output
   apps/web/out/ → deployable static site
```

### Deployment Target

**Type**: Static Site Hosting
**Examples**: Vercel, Netlify, GitHub Pages, Cloudflare Pages

**Requirements**:

- Support for static HTML/CSS/JS
- Environment variables at build time
- Optional: Automatic deployments from git

## Security Architecture

### Current Model (Phase 01)

```
Browser ──────────────────────────────────────┐
  │                                           │
  ├─ Fetch app.js, styles.css (from host)   │
  │                                           │
  └─ Fetch audio.mp3 (from Supabase CDN)    │
       (Public bucket, no auth)               │
                                              │
Supabase (Storage Only)                       │
  ├─ Public bucket "songs"                    │
  ├─ No row-level security (not needed)       │
  └─ Anon key is safe (read-only, public)
```

**Security Characteristics**:

- ✅ No private keys in client
- ✅ No database access
- ✅ Static export (no server secrets)
- ✅ Read-only to public storage

### Future Model (Phase 03+)

```
Browser ──── API Route ──── Server ──── Supabase
               ├─ Rate limit     ├─ Service key
               ├─ Auth token     └─ RLS enabled
               └─ Input validation
```

## Performance Architecture

### Current Optimization

1. **Static Export**: No server overhead
2. **Lazy Loading**: Code splitting via Next.js
3. **CSS Optimization**: Tailwind tree-shaking
4. **Font Loading**: Google Fonts (cached)
5. **Image CDN**: Supabase Storage (CDN included)
6. **Browser Caching**: Static assets cached

### Metrics Target

- **First Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: > 90
- **Audio Load**: Stream from CDN (< 500ms)

### Optimization Opportunities (Phase 02+)

- Image optimization (Next.js Image component)
- Code splitting for large components
- Dynamic imports for heavy libraries
- Service worker for offline playback
- Audio preloading strategy

## Error Handling Strategy

### Current Implementation

```typescript
// Supabase URL missing
if (!supabaseStorageUrl) {
  console.error("Supabase URL not configured");
  return "";  // Graceful degradation
}

// Audio load error
<audio
  onError={() => console.error("Audio failed to load")}
  src={currentPlay.audio}
/>
```

### Future (Phase 03)

- Error boundary components
- Global error logger (Sentry)
- User-friendly error messages
- Retry logic for failed requests
- Error recovery strategies

## Testing Architecture

**Current Status**: Minimal testing

**Future Plan** (Phase 03):

```
Unit Tests (Jest)
├─ Utility functions
├─ Type validation
└─ Data transformations

Component Tests (React Testing Library)
├─ Player component
├─ UI components
└─ Integration

E2E Tests (Playwright)
├─ User flows
├─ Audio playback
└─ Browser compatibility
```

## Monorepo Architecture

### Turborepo Setup

```
turbo.json (root)
├─ build task
│  ├─ outputs: [".next/**", "dist/**"]
│  └─ depends on: ["^build"]
├─ dev task
│  └─ persistent: true
├─ lint task
│  └─ depends on: ["^lint"]
└─ type-check task
   └─ outputs: []
```

### Workspace Organization

```
npm workspaces
├─ apps/web (Next.js app)
│  └─ imports: @love-days/utils
├─ apps/portal (other app)
│  └─ imports: @love-days/utils
└─ packages/utils (shared)
   └─ exports: types, songs, dates
```

**Advantages**:

- Single node_modules
- Shared dependency versions
- Cross-workspace imports
- Unified build pipeline

## Extension Points (Future)

### Phase 02: App Router Migration ✅ COMPLETE

- ✅ New `app/` directory structure
- ✅ Root layout with metadata API
- ✅ Server/client component boundaries
- ✅ Static export preserved
- Future: Route groups for layouts, Streaming + Suspense support

### Phase 03: Component System

- shadcn/ui component installation
- Storybook setup
- Component documentation
- Design tokens export

### Phase 04: Advanced Features

- User authentication (Supabase Auth)
- Database integration
- Real-time features
- Analytics integration

## Technology Justification

| Technology | Why?                     | Alternative      | Trade-off                   |
| ---------- | ------------------------ | ---------------- | --------------------------- |
| Next.js 15 | Unified React framework  | Create React App | More opinionated            |
| App Router | Server/client components | Pages Router     | Learning curve (now active) |
| TypeScript | Type safety              | JavaScript       | Compile step                |
| Tailwind   | Utility-first CSS        | CSS-in-JS        | Class string overhead       |
| Sass       | CSS preprocessing        | PostCSS          | Extra build step            |
| shadcn/ui  | Headless components      | Material UI      | More control needed         |
| Supabase   | Managed backend          | Firebase         | Self-hosted option          |
| Turborepo  | Fast monorepo builds     | Lerna            | Learning curve              |

## Known Limitations

1. **Static Data**: Songs hardcoded in code (Phase 01/02)
2. **No Real-time**: Updates require rebuild (Phase 03+)
3. **No Auth**: No user accounts yet (Phase 04+)
4. **No Database**: Storage-only approach (Phase 04+)
5. **No Offline**: No service worker (Phase 05+)
6. **Mobile UI**: Responsive but not touch-optimized (Phase 03+)
7. **Dark Mode**: Not yet implemented (Phase 03)

## Roadmap Integration

```
Phase 01: Foundation Setup ✅
 ├─ Status: Complete
 ├─ shadcn/ui setup, theme system, TypeScript paths
 └─ Next Phase: Phase 02

Phase 02: App Router Migration ✅
 ├─ Status: Complete (2025-12-26)
 ├─ App Router, metadata API, static export verified
 └─ Next Phase: Phase 03

Phase 03: Component System 📋
 ├─ Duration: 3-4 weeks
 ├─ Blockers: None (Phase 02 complete)
 ├─ Content: Theme refinement, dark mode, shadcn components
 └─ Next Phase: Phase 04

Phase 04: Advanced Features 📋
 ├─ Duration: Ongoing
 ├─ Content: Auth, database, real-time
 └─ Priority: User feedback
```

## References

- [Next.js Architecture](https://nextjs.org/docs/architecture)
- [React Component Patterns](https://react.dev/learn)
- [Tailwind CSS Concepts](https://tailwindcss.com/docs/utility-first)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Turborepo Docs](https://turbo.build/repo/docs)
