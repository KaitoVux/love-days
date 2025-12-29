# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Love Days is a Next.js application with audio player functionality that uses Supabase for audio file storage. Built as a Turborepo monorepo with TypeScript and modern tooling.

**Tech Stack:**

- Next.js 15.2.1 with React 19 and TypeScript 5.4.2
- Turborepo for monorepo orchestration
- Tailwind CSS + Sass for styling
- Supabase for audio storage
- Husky + lint-staged for pre-commit hooks

## Architecture

**Monorepo Structure:**

```
apps/
├── web/           # Main Next.js application (Pages Router, static export)
└── portal/        # Additional application
packages/
└── utils/         # Shared utility library (date utilities, song data)
```

**Next.js Application (`apps/web`):**

- Uses **App Router** with `app/` directory (Next.js 15)
- Configured for **static export** (`output: "export"`) - builds to `out/` directory
- Components organized in:
  - `components/LoveDays/` - Main app components (Title, ProfileSection, CountUp, Footer, FloatingHearts, MusicSidebar)
  - `components/ui/` - shadcn/ui components (Slider)
- Styling with **Tailwind-first** approach + CSS custom properties
- Icons: **lucide-react** (replaced static images)
- Key component: `MusicSidebar` - full-featured audio player with playlist, uses Supabase storage

**Shared Utilities (`packages/utils`):**

- `date-utils.ts` - Date manipulation with dayjs (calculateDaysBetween, formatDate, etc.)
- `songs.ts` - Song data array and Supabase URL generation (uses NEXT_PUBLIC_SUPABASE_URL)
- `types.ts` - Shared TypeScript interfaces (ISong, etc.)
- Builds to `dist/` with TypeScript declarations

**Key Dependencies:**

- `@love-days/utils` - Internal utility package shared across apps
- Supabase Storage - Audio files stored in public "songs" bucket
- Turbopack - Fast development builds with Next.js 15
- `@radix-ui/react-slider` - Accessible slider primitive for music player
- `lucide-react` - Icon library (^0.562.0)

## Theme System

**Color Scheme (350 hue - Rose Pink):**

HSL CSS custom properties defined in `styles/globals.scss`:

```scss
--primary: 350 80% 65%; // Rose pink accent
--background: 350 30% 8%; // Dark background
--foreground: 350 20% 95%; // Light text
--card: 350 20% 10%; // Card backgrounds
--muted: 350 10% 40%; // Muted text
--accent: 350 60% 60%; // Accent color
--border: 350 20% 20%; // Border color
```

**Typography:**

- `font-display: "Playfair Display"` - Headings and titles
- `font-body: system-ui` - Body text
- `font-sans-clean: ui-sans-serif` - Clean UI text (player, clock)

**Responsive Breakpoints:**

- xs: 320px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px

**Animations:**

- `animate-fade-in` - Entrance animations with staggered delays
- `animate-pulse-slow` - Slow pulse for heart icons
- `animate-float` - Floating animation for profile images
- `animate-float-up` - Upward floating for background hearts

## Essential Commands

**Development:**

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run start` - Start production servers
- `npm run clean` - Clean build artifacts

**Code Quality (Always run before committing):**

- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint checks
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Prettier formatting
- `npm run format:check` - Check formatting

**Workspace-specific (from workspace directories):**

- `cd apps/web && npm run dev` - Web app only with Turbopack
- `cd apps/web && npm run type-check` - Web app type checking
- `cd packages/utils && npm run build` - Build utils package only
- `cd packages/utils && npm run dev` - Watch mode for utils development

## Code Standards

**TypeScript:**

- Strict mode enabled across all packages
- No explicit `any` types (warns)
- Unused imports automatically removed by ESLint
- Use `_` prefix for intentionally unused variables

**Formatting (Prettier):**

- 100 character line length
- 2 spaces, no tabs
- Double quotes, semicolons required
- ES5 trailing commas
- Arrow functions without parens when possible

**ESLint Rules:**

- Next.js core-web-vitals + TypeScript recommended
- `unused-imports` plugin enforced
- Prettier integration enabled
- Ignores: `tailwind.config.js`, `postcss.config.js`

## Environment Setup

1. Copy `apps/web/.env.sample` to `apps/web/.env.local`
2. Add Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Ensure Supabase storage bucket "songs" exists with public access
4. Upload audio files to the "songs" bucket (referenced in `packages/utils/src/songs.ts`)

**Important:** The `NEXT_PUBLIC_SUPABASE_URL` is used by `packages/utils` to generate song URLs dynamically. The audio player component fetches songs from `{SUPABASE_URL}/storage/v1/object/public/songs/{filename}`

## Pre-commit Process

Husky automatically runs on commit:

1. **lint-staged** - Formats changed files with Prettier
2. **npm run lint** - Project-wide ESLint check
3. **Blocks commit** if any checks fail

## Task Completion Checklist

Before any commit:

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run format` applied
- [ ] `npm run build` succeeds
- [ ] Functionality tested with `npm run dev`

## Turborepo Tasks

The `turbo.json` defines task dependencies:

- **build**: Depends on upstream builds, outputs to `.next/` and `dist/`
- **dev/start**: Persistent tasks, not cached
- **lint**: Depends on upstream linting
- **type-check**: Runs across all packages

## Package Management

- **Package Manager**: npm 10.0.0 (specified in packageManager field)
- **Workspaces**: Uses npm workspaces for `apps/*` and `packages/*`
- **Internal Packages**: Reference with `file:` protocol (e.g., `@love-days/utils`)

**Working with internal packages:**

- After modifying `packages/utils`, rebuild with `npm run build` from utils directory
- Web app will automatically use updated utils after rebuild
- For continuous development: run `npm run dev` in utils package (watch mode)

## Deployment

**Static Export Configuration:**

- Next.js is configured for static export (`output: "export"` in `next.config.js`)
- Build output goes to `apps/web/out/` directory (not `.next/`)
- Images are unoptimized for static hosting compatibility
- Deploy the `out/` directory to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)
- Environment variables must be set at build time (they're embedded in the static output)
