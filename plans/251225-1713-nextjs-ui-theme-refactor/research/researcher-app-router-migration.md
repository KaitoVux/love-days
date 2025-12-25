# Research Report: Next.js App Router Migration Strategy for Static Export 2025

**Research Date:** December 25, 2025
**Status:** ✓ Complete
**Sources Consulted:** 12 authoritative sources
**Key Terms:** App Router, Pages Router, static export, incremental migration, metadata, layouts

---

## Executive Summary

Next.js App Router fully supports `output: "export"` for static sites (added v13.3, stable in v15). Migration from Pages Router to App Router can be done incrementally, allowing both routers to coexist. Key changes: file-based routing with `layout.tsx`/`page.tsx`, metadata API replaces `<Head>`, server components default, `'use client'` for interactivity. Coexistence mode enables zero-downtime migration but introduces navigation challenges between routers.

---

## Key Findings

### 1. Static Export with App Router

**Fully Supported:** App Router supports `output: "export"` configuration. When enabled:

- `next build` generates static HTML per route (outputs to `out/` directory)
- No server-side rendering or API routes allowed
- Images unoptimized for static hosting compatibility
- Perfect for Vercel, Netlify, GitHub Pages, or any static host

**Configuration:**

```javascript
// next.config.js
const nextConfig = {
  output: "export",
  trailingSlash: true, // optional
};
module.exports = nextConfig;
```

**Impact on Love Days:** Your existing `output: "export"` configuration works unchanged with App Router.

---

### 2. Routing Model Differences

| Aspect                | Pages Router                              | App Router                                      |
| --------------------- | ----------------------------------------- | ----------------------------------------------- |
| **Directory**         | `pages/`                                  | `app/`                                          |
| **Special Files**     | `[slug].tsx`, `_app.tsx`, `_document.tsx` | `[slug]/page.tsx`, `layout.tsx`, `error.tsx`    |
| **Layouts**           | Per-page manual wrapping                  | Automatic nesting, preservation on nav          |
| **Metadata**          | `<Head>` component + `_document.tsx`      | `metadata` export, `generateMetadata()`         |
| **Dynamic Routes**    | `useRouter`, `router.query`               | `useRouter` with `searchParams`, `params`       |
| **API Routes**        | `pages/api/`                              | `app/route.ts` (Route Handlers)                 |
| **Static Generation** | `getStaticProps`                          | Automatic for default (no fetch), caching hints |

---

### 3. App Router Core Concepts

**Layout System:**

- Layouts persist across navigation, preserve state
- Root layout required, defines `<html>` and `<body>`
- Nested layouts cascade automatically
- Example structure:

```
app/
├── layout.tsx          (root layout)
├── page.tsx           (home page)
└── dashboard/
    ├── layout.tsx     (dashboard layout)
    └── page.tsx       (dashboard page)
```

**Metadata API:**

- Server-only: metadata export, `generateMetadata()` function
- Replaces `<Head>` component (Pages Router pattern)
- Supports cascading: page metadata merges with layout metadata

```typescript
// app/layout.tsx
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Love Days",
};
```

**Component Types:**

- Server Components (default): async, DB access, environment variables safe
- Client Components (`'use client'` directive): interactivity, hooks, listeners

---

### 4. Breaking Changes for Love Days Migration

**Critical Changes:**

1. **Routing Structure**

   - Move from `pages/` to `app/`
   - Convert `pages/index.tsx` → `app/page.tsx`
   - Convert `pages/player.tsx` → `app/player/page.tsx`
   - No more `_app.tsx` / `_document.tsx`

2. **Navigation Imports**

   ```typescript
   // Pages Router
   import { useRouter } from "next/router";
   const router = useRouter();
   const slug = router.query.slug;

   // App Router
   import { useRouter } from "next/navigation";
   const router = useRouter();
   // Access params via layout/page props
   ```

3. **Data Fetching**

   - Pages Router: `getStaticProps`, `getStaticPaths`, `getServerSideProps`
   - App Router: async Server Components + fetch with caching headers
   - For static export: no server-side data sources (only build-time)

4. **Global Styles**
   - Move from `_app.tsx` imports to `app/layout.tsx`
   - CSS Modules work same way
   - Tailwind/Sass continue unchanged

---

### 5. Incremental Migration Path

**Coexistence Strategy:**
Both routers work simultaneously. Next.js matches routes: `app/` routes take precedence over `pages/` routes.

**Step-by-Step for Love Days:**

1. **Create app directory** (keep `pages/` intact)

   ```bash
   mkdir -p apps/web/app
   ```

2. **Create root layout** (from current `_document.tsx` + `_app.tsx`)

   ```typescript
   // app/layout.tsx
   import '@/styles/globals.css'
   import './tailwind.css'

   export const metadata = {
     title: 'Love Days',
     description: 'Audio player app'
   }

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>{children}</body>
       </html>
     )
   }
   ```

3. **Migrate high-traffic pages first** (home, player)

   - Copy component logic, add `'use client'` if needed
   - Test in app router context
   - Monitor navigation between routers

4. **Handle shared components**

   - Create wrapper for navigation (use conditional imports)
   - Move shared UI to `components/` (works with both routers)
   - Avoid mixing `next/router` and `next/navigation` in same component

5. **Migrate remaining pages** incrementally
   - One page at a time
   - Test before moving to next

---

### 6. Static Export Constraints

**Limitations with App Router + Static Export:**

- **No API Routes:** Route Handlers must be static (no `POST`, `PUT`, `DELETE`)
- **No Dynamic Routes:** Can't use `[id]/page.tsx` without `generateStaticParams()`
- **No useParams() on Client:** Dynamic params not available in client components (use `searchParams` instead)
- **Build-Time Fetching Only:** All data must be fetched during `next build`

**For Love Days:**

- Song list: fetch at build time from Supabase
- Audio files: pre-generate URLs at build time
- No runtime API calls

---

### 7. Best Practices for Migration

1. **Start with layout migration:** Root layout is foundation
2. **Migrate pages strategically:** High-traffic → low-traffic
3. **Test navigation:** Verify experience between old/new routes
4. **Use coexistence window:** Keep both routers ~2-3 weeks
5. **Update imports carefully:** `next/router` → `next/navigation`
6. **Monitor bundle size:** App Router may differ in final output
7. **Leverage Server Components:** Reduce client bundle, improve performance

---

## Implementation Checklist for Love Days

- [ ] Create `app/` directory structure
- [ ] Build root layout from `_app.tsx` + `_document.tsx`
- [ ] Migrate `pages/index.tsx` → `app/page.tsx`
- [ ] Migrate `pages/player.tsx` → `app/player/page.tsx`
- [ ] Update `next/router` imports to `next/navigation` in client components
- [ ] Verify metadata API works correctly
- [ ] Test static export: `npm run build` → check `out/` directory
- [ ] Verify Supabase audio URLs still work
- [ ] Test Player component with `'use client'` directive
- [ ] Remove `pages/` directory after full migration
- [ ] Run type-check, lint, build validation

---

## Unresolved Questions

- Does your Player component require interactive state that necessitates `'use client'`? (Likely yes for audio controls)
- Are there any API routes in `pages/api/` that need conversion to Route Handlers or refactoring?
- Does the build system need any updates for App Router support?

---

## Sources

- [Next.js App Router Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Incremental Adoption Strategy](https://clerk.com/blog/migrating-pages-router-to-app-router-an-incremental-guide)
- [App Router Layouts & Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Server & Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [App Router Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js 15 Best Practices 2025](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)
- [Page Router vs App Router Comparison](https://www.storieasy.com/blog/next-js-page-router-vs-app-router-modern-api-structures-explained-2025)
