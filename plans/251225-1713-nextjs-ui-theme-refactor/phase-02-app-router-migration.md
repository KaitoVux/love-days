# Phase 02: App Router Migration

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 01: Foundation Setup](./phase-01-foundation-setup.md)
**Related Docs:** [App Router Migration Research](./research/researcher-app-router-migration.md)

---

## Overview

| Field     | Value           |
| --------- | --------------- |
| Date      | 2025-12-26      |
| Priority  | Critical        |
| Status    | DONE (2025-12-26 17:30 UTC) |
| Est. Time | 2-3 hours       |

Create `app/` directory structure, migrate from Pages Router to App Router. Single-page app simplifies migration - only home page needs conversion.

---

## Key Insights from Research

1. **Coexistence mode** - `app/` and `pages/` work simultaneously, `app/` takes precedence
2. **Root layout required** - Replaces `_app.tsx` + `_document.tsx`
3. **Metadata API** - `export const metadata` replaces `<Head>` component
4. **Client components** - Use `'use client'` directive for interactivity
5. **Static export** - `output: "export"` works unchanged with App Router
6. **Navigation import** - `next/router` -> `next/navigation`

---

## Requirements

### Must Have

- [ ] Create `app/` directory structure
- [ ] Create root `layout.tsx` with metadata
- [ ] Create `page.tsx` (home page)
- [ ] Migrate global styles to root layout
- [ ] Verify static export works

### Should Have

- [ ] Remove `pages/` directory after migration
- [ ] Clean up `_app.tsx`, `_document.tsx`

### Nice to Have

- [ ] Add loading.tsx for loading states

---

## Architecture Decisions

### 1. Directory Structure

```
apps/web/
├── app/
│   ├── layout.tsx      # Root layout (html, body, fonts, styles)
│   ├── page.tsx        # Home page component
│   └── globals.css     # Optional: can import from styles/
├── components/         # Shared components (unchanged)
├── styles/             # SCSS files (unchanged)
└── lib/                # Utilities
```

### 2. Layout Pattern

Root layout handles:

- HTML structure (`<html>`, `<body>`)
- Global styles import
- Font loading
- Metadata

Page handles:

- Content rendering
- Client components composition

### 3. Client vs Server Components

| Component      | Type   | Reason                         |
| -------------- | ------ | ------------------------------ |
| layout.tsx     | Server | Static, no interactivity       |
| page.tsx       | Server | Can be, wraps client children  |
| Player         | Client | Audio refs, state, effects     |
| CountUp        | Client | setInterval, real-time updates |
| Clock          | Client | setInterval                    |
| FloatingHearts | Client | Animation state                |
| Other          | Server | Static display                 |

---

## Related Code Files

| File                       | Action | Purpose              |
| -------------------------- | ------ | -------------------- |
| `apps/web/app/layout.tsx`  | Create | Root layout          |
| `apps/web/app/page.tsx`    | Create | Home page            |
| `apps/web/pages/index.tsx` | Delete | After migration      |
| `apps/web/pages/_app.tsx`  | Delete | After migration      |
| `apps/web/next.config.js`  | Verify | Static export config |

---

## Implementation Steps

### Step 1: Create App Directory (5 min)

```bash
mkdir -p apps/web/app
```

### Step 2: Create Root Layout (30 min)

```typescript
// apps/web/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Love Days",
  description: "Counting our days together",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 3: Create Home Page (45 min)

```typescript
// apps/web/app/page.tsx
import Title from "@/components/LoveDays/Title";
import CountUp from "@/components/LoveDays/CountUp";
import ProfileSection from "@/components/LoveDays/ProfileSection";
import MusicSidebar from "@/components/LoveDays/MusicSidebar";
import Footer from "@/components/LoveDays/Footer";
import FloatingHearts from "@/components/LoveDays/FloatingHearts";

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

**Note:** Components referenced above will be created/refactored in Phase 04-05. For initial migration, use existing component paths:

```typescript
// apps/web/app/page.tsx (initial migration - use existing components)
import MainTitle from "@/components/Title";
import CountUp from "@/components/CountUp";
import MainSection from "@/components/MainSection";
import Footer from "@/components/Footer";
import Player from "@/components/Player";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 xs:grid-cols-1 lg:gap-3 md:gap-2">
          <div className="md:col-span-2 flex flex-col items-center gap-6">
            <MainTitle />
            <MainSection />
            <CountUp />
            <Footer />
          </div>
          <div className="flex justify-center items-start pt-4">
            <Player />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Step 4: Update next.config.js (10 min)

Verify static export settings:

```javascript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // distDir removed - defaults to 'out' for static export
};

module.exports = nextConfig;
```

### Step 5: Test App Router (15 min)

```bash
cd apps/web
npm run dev
# Visit http://localhost:3000
# Verify page loads with App Router
```

### Step 6: Verify Static Export (15 min)

```bash
npm run build
# Check apps/web/out/ directory
# Verify index.html generated
```

### Step 7: Remove Pages Router Files (10 min)

After confirming App Router works:

```bash
rm apps/web/pages/index.tsx
rm apps/web/pages/_app.tsx
# Keep pages/ if other pages exist, otherwise:
rmdir apps/web/pages
```

---

## Todo List

- [x] Create app/ directory
- [x] Create app/layout.tsx with metadata
- [x] Create app/page.tsx with existing components
- [x] Verify dev server works
- [x] Verify static export generates correctly
- [x] Remove pages/index.tsx
- [x] Remove pages/\_app.tsx
- [x] Run type-check, lint, build

---

## Success Criteria

1. `npm run dev` loads home page via App Router
2. `npm run build` succeeds
3. `out/` directory contains `index.html`
4. All existing functionality preserved
5. No Pages Router files remain (or only API routes if any)

---

## Risk Assessment

| Risk                         | Likelihood | Impact | Mitigation                                 |
| ---------------------------- | ---------- | ------ | ------------------------------------------ |
| Component import path issues | Medium     | Low    | Use absolute @/ imports                    |
| Client component boundaries  | Medium     | Medium | Add 'use client' to interactive components |
| Metadata not rendering       | Low        | Low    | Verify in page source                      |
| Static export failure        | Low        | High   | Test incrementally                         |

---

## Security Considerations

- No changes to authentication or data handling
- Metadata visible in page source (public info only)

---

## Next Steps

After completion:

1. Proceed to [Phase 03: Theme System](./phase-03-theme-system.md)
2. Verify all components render correctly
3. Check browser console for errors
