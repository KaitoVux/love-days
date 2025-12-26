# UI Theme Refactor - Phase 02: App Router Migration

**Status**: Complete
**Date**: 2025-12-26
**Version**: 1.0
**Previous Phase**: [Phase 01: Foundation Setup](./UI_THEME_REFACTOR_PHASE01.md)
**Next Phase**: Phase 03 (Theme System)

## Overview

Phase 02 successfully migrated application from Pages Router to App Router architecture. Single-page application simplified migration to only home page conversion. Root layout created with Metadata API. Static export verified working. All functionality preserved.

## Changes Summary

### 1. New Files Created

#### `apps/web/app/layout.tsx`

Root layout file replacing `_app.tsx` and `_document.tsx`. Implements metadata API and global style imports.

```typescript
import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Love Days",
  description: "Made by Dat Vu with love",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Key Points**:
- Server component (no `'use client'` directive)
- Metadata API handles document head (title, description, icons)
- Global SCSS imported once at layout level
- HTML/body tags provided by root layout
- Children prop receives page content

#### `apps/web/app/page.tsx`

Home page component replacing `pages/index.tsx`. Uses existing component structure.

```typescript
import { Footer } from "@/components/Footer";
import { MainSection } from "@/components/MainSection";
import { Player } from "@/components/Player";
import { MainTitle } from "@/components/Title";
import { CountUp } from "@/components/CountUp";
import { MainLayout } from "@/layouts/MainLayout";

export default function Home() {
  return (
    <section id="main" className="min-h-screen">
      <MainLayout>
        <div className="grid md:grid-cols-3 xs:grid-cols-1 lg:gap-3 md:gap-2">
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
    </section>
  );
}
```

**Key Points**:
- Server component (renders static content with client children)
- Uses existing components without refactoring
- Maintains existing layout structure
- Player positioned in sidebar via grid layout
- Reduces risk by preserving working component APIs

### 2. Deleted Files

#### `apps/web/pages/index.tsx` (DELETED)

Pages Router home page. Superseded by `app/page.tsx`.

#### `apps/web/pages/_app.tsx` (DELETED)

Pages Router app wrapper. Superseded by `app/layout.tsx`.

**Note**: `pages/` directory remains empty for future API routes.

## Architecture Changes

### Router Migration: Pages → App Router

| Aspect | Pages Router | App Router |
|--------|-------------|-----------|
| **Routing** | File-based in `pages/` | File-based in `app/` |
| **Root wrapper** | `_app.tsx` + `_document.tsx` | `app/layout.tsx` |
| **Metadata** | `<Head>` component | `export const metadata` |
| **Server components** | All client by default | All server by default |
| **Client marking** | `getServerSideProps` | `'use client'` directive |
| **Navigation imports** | `next/router` | `next/navigation` |

### Directory Structure Changes

**Before (Pages Router)**:
```
apps/web/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── components/
└── styles/
```

**After (App Router)**:
```
apps/web/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
├── styles/
└── pages/                  # Empty (legacy)
```

### Metadata API Implementation

**Previous (Pages Router)**:

Metadata handled in HTML `<Head>` tag, typically in `_document.tsx`:

```typescript
// Old approach (deleted)
<Head>
  <title>Love Days</title>
  <meta name="description" content="Made by Dat Vu with love" />
  <link rel="icon" href="/favicon.png" />
</Head>
```

**Current (App Router)**:

Metadata defined as static export in layout:

```typescript
// New approach
export const metadata: Metadata = {
  title: "Love Days",
  description: "Made by Dat Vu with love",
  icons: {
    icon: "/favicon.png",
  },
};
```

**Benefits**:
- Type-safe via `Metadata` type
- Accessible to all pages/routes via inheritance
- Compiled at build time
- Better NextSEO integration

## Component Server/Client Boundaries

### Server Components (No directive)

| Component | Type | Reason |
|-----------|------|--------|
| `app/layout.tsx` | Server | Static, provides metadata |
| `app/page.tsx` | Server | Renders static structure, composes client children |
| `MainLayout` | Server | Static wrapper/container |
| `MainTitle` | Server | Static text rendering |
| `MainSection` | Server | Static content display |
| `Footer` | Server | Static footer content |

### Client Components (`'use client'` directive)

| Component | Type | Reason |
|-----------|------|--------|
| `Player` | Client | Audio refs, event listeners, state management |
| `CountUp` | Client | Timer intervals, dynamic state |
| `Clock` (if present) | Client | Real-time updates |
| `FloatingHearts` | Client | Animation state, requestAnimationFrame |

## Static Export Verification

Build output confirmed static export working correctly:

```
npm run build
→ Exports page to out/index.html (19.8 KB)
→ Static indicator: ○ (not dynamic)
→ Bundle: 14.8 kB page + 101 kB shared JS
```

**Static Export Compatibility**:
- ✅ No dynamic routes
- ✅ No server-only features required
- ✅ `output: "export"` unchanged in `next.config.js`
- ✅ Build produces `out/` directory with static HTML
- ✅ Images unoptimized (static deployment compatible)

## Type Safety & Imports

### Import Paths Updated

All components use absolute `@/` imports (configured in `tsconfig.json`):

```typescript
// ✅ Correct (used in migration)
import { Player } from "@/components/Player";
import { cn } from "@lib/utils";

// ❌ Incorrect (relative)
import { Player } from "../components/Player";
```

### TypeScript Strictness

- ✅ All imports resolve via path aliases
- ✅ `React.ReactNode` properly typed in layout
- ✅ `Metadata` type imported from `next`
- ✅ No implicit `any` types
- ✅ Type-check passes

## Build Impact

### Build Outputs

| Directory | Purpose | Notes |
|-----------|---------|-------|
| `out/` | Static HTML export | Primary deployment target |
| `.next/` | Not generated | Static export uses `out/` |
| `dist/` (utils) | Utility package build | Unchanged |

### Build Configuration

No changes to `next.config.js`:

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: "export",            // ✅ Unchanged
  images: {
    unoptimized: true,         // ✅ Static compatible
  },
};
```

### Performance Metrics

- **Build time**: ~5-10s
- **Pages generated**: 4 (index, 404, not-found, etc.)
- **Main page**: 14.8 kB (brotli compressed)
- **Shared JS**: 101 kB total
- **Total First Load**: 116 kB

## Breaking Changes

**None**. Migration is internal architecture change:

- ✅ All existing functionality preserved
- ✅ Component APIs unchanged
- ✅ Styling systems work identically
- ✅ Static export output identical
- ✅ Environment variables unchanged
- ✅ Supabase integration untouched

## Migration Steps Executed

### Step 1: Create App Directory
```bash
mkdir -p apps/web/app
```
✅ Complete

### Step 2: Create Root Layout
- Implements Metadata API
- Imports global styles
- Provides html/body structure
✅ Complete

### Step 3: Create Home Page
- Converts existing Pages Router page
- Uses existing components
- Maintains layout structure
✅ Complete

### Step 4: Verify Development
```bash
cd apps/web
npm run dev
# Verified: http://localhost:3000 loads via App Router
```
✅ Complete

### Step 5: Verify Static Export
```bash
npm run build
# Verified: out/index.html generated (19.8 KB)
```
✅ Complete

### Step 6: Type Checking
```bash
npm run type-check
# Result: No errors
```
✅ Complete

### Step 7: Linting
```bash
npm run lint
# Result: Pass
```
✅ Complete

### Step 8: Remove Legacy Files
- Deleted `pages/index.tsx`
- Deleted `pages/_app.tsx`
- Kept `pages/` for future API routes
✅ Complete

## File Changes Summary

| File | Status | Action |
|------|--------|--------|
| `apps/web/app/layout.tsx` | NEW | ✅ Created |
| `apps/web/app/page.tsx` | NEW | ✅ Created |
| `apps/web/pages/index.tsx` | DELETED | ✅ Removed |
| `apps/web/pages/_app.tsx` | DELETED | ✅ Removed |
| `apps/web/next.config.js` | UNCHANGED | Verified |
| `apps/web/tsconfig.json` | UNCHANGED | Verified |
| `apps/web/package.json` | UNCHANGED | Verified |

## Verification Checklist

- [x] `app/` directory created
- [x] `app/layout.tsx` with metadata implemented
- [x] `app/page.tsx` using existing components
- [x] `pages/index.tsx` deleted
- [x] `pages/_app.tsx` deleted
- [x] `npm run dev` loads home page via App Router
- [x] `npm run build` succeeds with static export
- [x] `out/index.html` generated correctly
- [x] `npm run type-check` passes
- [x] `npm run lint` passes
- [x] All components render correctly
- [x] No console errors in browser
- [x] Supabase integration still functional

## Success Criteria Met

1. ✅ `npm run dev` loads home page via App Router
2. ✅ `npm run build` succeeds with no errors
3. ✅ `out/` directory contains `index.html`
4. ✅ All existing functionality preserved
5. ✅ No Pages Router files remain in use
6. ✅ All tests/checks pass

## Performance Notes

### Bundle Size
- Minimal increase from App Router migration
- Client components unchanged
- Metadata API adds ~0.5KB to layout
- No additional JavaScript libraries introduced

### Static Export
- Page fully static (no server-side rendering required)
- Can be deployed to any static hosting service
- Build output unchanged in size/structure

### Development Speed
- `npm run dev` starts with Turbopack (fast refresh)
- HMR works identically with App Router
- No rebuild needed for component changes

## Configuration Notes

### Environment Variables

No new environment variables required. Existing setup sufficient:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Metadata is static text (no environment variable substitution needed).

### Font Loading

Global fonts continue loading from `styles/globals.scss`:

```scss
@import url("https://fonts.googleapis.com/css2?family=...");
```

No changes needed for App Router.

### CSS Processing

SCSS compilation unchanged:
- Imported in root layout: `import "@/styles/globals.scss"`
- Processes before page HTML
- CSS variables available to all components

## Next Phase Prerequisites

Phase 03 (Theme System) ready to begin:

- ✅ App Router architecture in place
- ✅ Root layout with metadata implemented
- ✅ Static export verified
- ✅ Component structure preserved
- ✅ Type safety verified

Phase 03 will add:
- HSL-based color theme refinement
- Dark mode implementation
- Component library integration

## Troubleshooting

### Issue: Build fails with missing imports

**Solution**: Verify `tsconfig.json` path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["/*"],
      "@lib/*": ["lib/*"]
    }
  }
}
```

### Issue: Styles not loading in production

**Ensure** `app/layout.tsx` imports globals:
```typescript
import "@/styles/globals.scss";
```

Must be at top-level, not in page components.

### Issue: Metadata not rendering

**Verify** metadata exported from `app/layout.tsx`:
```typescript
export const metadata: Metadata = { ... };
```

Check build output HTML (browser inspector) for `<title>`, `<meta>` tags.

## Code Standards Alignment

### TypeScript
- ✅ Strict mode enabled
- ✅ No explicit `any` types
- ✅ Proper type imports (`type { Metadata }`)
- ✅ React.ReactNode properly typed

### Component Organization
- ✅ Feature-based component structure
- ✅ Consistent absolute imports (`@/`)
- ✅ Proper server/client boundaries
- ✅ No unnecessary client directives

### Code Quality
- ✅ ESLint passes (no violations)
- ✅ Prettier formatting compliant
- ✅ No unused imports
- ✅ Consistent naming conventions

## Related Documentation

- [App Router Documentation](https://nextjs.org/docs/app)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-and-client-components)
- [Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## Migration Reference

For future migrations of similar projects:

1. **Create app directory**: No build steps needed
2. **Create root layout**: Must provide `html`, `body` tags
3. **Implement metadata**: Use `export const metadata` pattern
4. **Move pages**: Create `page.tsx` for each route
5. **Mark client components**: Add `'use client'` where needed
6. **Remove legacy files**: Delete `pages/`, `_app.tsx`, `_document.tsx`
7. **Test incrementally**: Verify dev, build, static export

## Questions/Blockers

None identified. Migration complete and verified.

## Commit Summary

**Files Changed**: 4 (2 new, 2 deleted)
**Lines Added**: ~50 (layout.tsx, page.tsx)
**Lines Removed**: ~30 (deleted Pages Router files)
**Net Change**: +20 lines
**Build Status**: ✅ Pass
**Type Check**: ✅ Pass
**Lint Status**: ✅ Pass

## Reviewed By

Code Review Agent - [phase-02-app-router-migration.md](../plans/251225-1713-nextjs-ui-theme-refactor/reports/code-reviewer-251226-phase02-app-router.md)

**Review Date**: 2025-12-26
**Status**: ✅ APPROVED
