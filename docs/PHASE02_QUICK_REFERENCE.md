# Phase 02: App Router Migration - Quick Reference

**Status**: ✅ Complete
**Date**: 2025-12-26
**Files Changed**: 4 (2 new, 2 deleted)
**Lines Added**: ~50
**Build Status**: ✅ Pass

---

## What Changed

### New Files

#### `apps/web/app/layout.tsx` (18 lines)
Root layout with metadata API. Replaces `_app.tsx` + `_document.tsx`.

```typescript
import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Love Days",
  description: "Made by Dat Vu with love",
  icons: { icon: "/favicon.png" },
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
- Server component (no 'use client')
- Metadata API (type-safe)
- Global SCSS imported once
- Provides html/body structure

#### `apps/web/app/page.tsx` (27 lines)
Home page using existing components.

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
- Server component (static structure)
- Uses existing components
- No refactoring (preserves working APIs)
- Player in sidebar via grid

### Deleted Files

- ✅ `apps/web/pages/index.tsx` (deleted)
- ✅ `apps/web/pages/_app.tsx` (deleted)
- ℹ️ `pages/` directory kept empty for future API routes

---

## Architecture Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Router** | Pages Router | App Router |
| **Root** | `_app.tsx` + `_document.tsx` | `app/layout.tsx` |
| **Metadata** | `<Head>` component | `export const metadata` |
| **Home** | `pages/index.tsx` | `app/page.tsx` |
| **Structure** | File-based in pages/ | File-based in app/ |
| **Defaults** | Client components | Server components |
| **Build Output** | `out/` (static) | `out/` (static) ✅ |

---

## Metadata API

### Before (Pages Router)
```typescript
// In _document.tsx or _app.tsx
<Head>
  <title>Love Days</title>
  <meta name="description" content="Made by Dat Vu with love" />
  <link rel="icon" href="/favicon.png" />
</Head>
```

### After (App Router)
```typescript
// In app/layout.tsx
export const metadata: Metadata = {
  title: "Love Days",
  description: "Made by Dat Vu with love",
  icons: { icon: "/favicon.png" },
};
```

**Benefits**:
- ✅ Type-safe (Metadata type)
- ✅ Compiled at build time
- ✅ Inherited by all routes
- ✅ Better tooling support

---

## Server vs Client Components

### Server Components (No directive)
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page
- `MainLayout`, `MainTitle`, `MainSection`, `Footer` - Static content

### Client Components ('use client' directive)
- `Player` - Audio refs, event handlers, state
- `CountUp` - Timer intervals, dynamic updates
- `Clock` (if present) - Real-time updates

---

## Build Verification

```
$ npm run build

Build output:
✓ Type-check passed
✓ Lint passed
✓ Static export generated
✓ out/index.html (19.8 KB)
✓ Bundle: 14.8 kB page + 101 kB shared JS

Pages:
✓ / - Static (marked ○)
✓ /404 - Generated
✓ /not-found - Generated
```

All success criteria met:
1. ✅ App Router loads via `npm run dev`
2. ✅ Build succeeds
3. ✅ Static export works (out/index.html exists)
4. ✅ All functionality preserved
5. ✅ No Pages Router files remain

---

## Key Benefits

1. **Server Components**: Smaller client bundle, better performance
2. **Metadata API**: Type-safe, build-time processing
3. **Static Export**: Unchanged deployment target
4. **Modern React**: Access to latest React features
5. **Type Safety**: Strict TypeScript mode
6. **Developer Experience**: Better HMR with Turbopack

---

## Compatibility

- ✅ Static export unchanged (`out/` directory)
- ✅ Existing components work without changes
- ✅ Supabase integration untouched
- ✅ CSS/styling system unchanged
- ✅ Environment variables unchanged
- ✅ No breaking changes

---

## Common Patterns

### Importing Components
```typescript
// ✅ Correct (absolute path)
import { Player } from "@/components/Player";

// ❌ Avoid (relative)
import { Player } from "../components/Player";
```

### Server/Client Boundaries
```typescript
// Server component (default)
export default function Layout() {
  return <ClientComponent />;  // OK - import allowed
}

// Client component
'use client';
export default function Button() {
  const [state, setState] = useState(); // OK - hooks allowed
}
```

### Metadata Inheritance
```typescript
// Metadata in layout.tsx applies to all routes
export const metadata: Metadata = { ... };

// Metadata in page.tsx overrides layout
export const metadata: Metadata = { ... };
```

---

## Testing Locally

```bash
# Development (hot reload)
cd apps/web
npm run dev
# Visit http://localhost:3000

# Build (static export)
npm run build
# Check apps/web/out/index.html

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

---

## Next Steps (Phase 03)

- Theme system refinement
- Dark mode implementation
- shadcn/ui component installation
- Component library documentation

---

## Related Documentation

- **Full Details**: [UI_THEME_REFACTOR_PHASE02.md](./UI_THEME_REFACTOR_PHASE02.md)
- **Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- **Project**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- **Foundation**: [UI_THEME_REFACTOR_PHASE01.md](./UI_THEME_REFACTOR_PHASE01.md)

---

## FAQ

**Q: Where's the Pages Router?**
A: Deprecated in Phase 02. Legacy `pages/` directory kept for future API routes. All routing via `app/`.

**Q: Do I need to rewrite components?**
A: No. Existing components work unchanged. Mark interactive ones with `'use client'`.

**Q: Will static export still work?**
A: Yes. Static export unchanged. Build outputs to `out/index.html` as before.

**Q: How do I migrate my own components?**
A: Add `'use client'` only to interactive components. Server components by default.

**Q: What about environment variables?**
A: Unchanged. `.env.local` works the same. Metadata is static text (no env substitution).

---

**Last Updated**: 2025-12-26
**Status**: ✅ Phase 02 Complete
