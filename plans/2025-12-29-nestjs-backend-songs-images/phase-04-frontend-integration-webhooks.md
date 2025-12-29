# Phase 4: Frontend Integration & Webhooks

**Phase**: 4 of 4
**Duration**: Week 3-4
**Status**: Pending
**Priority**: High
**Parent**: [Main Plan](./plan.md)

---

## Context Links

- **Parent Plan**: [NestJS Backend Songs & Images](./plan.md)
- **Previous Phase**: [Phase 3 - Admin UI (shadcn Dashboard)](./phase-03-admin-ui-shadcn-dashboard.md)
- **Brainstorm Source**: [Brainstorm Report](../reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)
- **Related Docs**: [System Architecture](../../docs/SYSTEM_ARCHITECTURE.md)

---

## Overview

Connect public frontend (apps/web) to NestJS API. Update static build to fetch songs/images from API. Configure Cloudflare Pages deploy hooks for admin-triggered rebuilds.

**Goal**: Full workflow from admin upload to frontend display, with manual webhook rebuilds.

---

## Key Insights from Brainstorm

### Build-Time Data Fetching

- Static export fetches data at build time
- No runtime API calls (static HTML)
- Rebuild required to update content
- ~2 minute rebuild on Cloudflare Pages

### Webhook Flow

```
1. Admin publishes song in dashboard
2. Admin clicks "Rebuild Site" button
3. Dashboard POSTs to Cloudflare deploy hook URL
4. Cloudflare Pages triggers new build
5. Build fetches latest data from NestJS API
6. New static site deployed (~2 minutes)
7. Users see updated content
```

---

## Requirements

### Functional

- [ ] Frontend fetches songs from NestJS API at build time
- [ ] Frontend fetches images from NestJS API at build time
- [ ] Filter only `published: true` items
- [ ] Cloudflare Pages deploy hook configured
- [ ] Environment variable for API URL
- [ ] Backward compatible with existing Supabase URLs

### Non-Functional

- [ ] Build time <3 minutes
- [ ] API fetch timeout handling
- [ ] Fallback to empty array on API failure
- [ ] No runtime CORS issues (build-time only)

---

## Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ BUILD TIME (on Cloudflare Pages)                                 │
│                                                                  │
│ 1. Cloudflare triggers build (manual webhook or git push)       │
│ 2. npm run build executes                                       │
│ 3. Next.js static export starts                                 │
│ 4. getStaticProps/generateStaticParams fetch from NestJS API    │
│    GET https://love-days-api.vercel.app/api/v1/songs            │
│    GET https://love-days-api.vercel.app/api/v1/images           │
│ 5. Data embedded in static HTML                                 │
│ 6. Output: apps/web/out/ (static files)                         │
│ 7. Deploy to Cloudflare CDN                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                         │
                    (Static HTML)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ RUNTIME (User visits site)                                       │
│                                                                  │
│ 1. Browser loads static HTML from Cloudflare CDN                │
│ 2. React hydrates client components                             │
│ 3. Audio plays from Supabase Storage URLs (embedded in HTML)    │
│ 4. NO runtime API calls needed                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Related Code Files

### Files to Modify

| File                          | Change                    |
| ----------------------------- | ------------------------- |
| `packages/utils/src/songs.ts` | Add API fetch function    |
| `packages/utils/src/index.ts` | Export new API functions  |
| `apps/web/app/page.tsx`       | Fetch songs at build time |
| `apps/web/next.config.js`     | Add API URL env var       |
| `apps/web/.env.sample`        | Document new env vars     |

### Files to Create

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `packages/utils/src/api-client.ts` | API client for build-time fetching |

---

## Implementation Steps

### Step 1: Create API Client in Packages

**Duration**: 30 min

Create `packages/utils/src/api-client.ts`:

```typescript
import { ISong, IImage } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FetchOptions {
  timeout?: number;
  fallback?: any;
}

async function fetchWithTimeout<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { timeout = 10000, fallback } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Failed to fetch ${url}:`, error);

    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Fetch published songs from API (for build-time static generation)
 */
export async function fetchPublishedSongs(): Promise<ISong[]> {
  try {
    const songs = await fetchWithTimeout<ISong[]>(
      `${API_URL}/api/v1/songs?published=true`,
      { timeout: 15000, fallback: [] },
    );

    // Transform API response to match existing ISong interface
    return songs.map((song) => ({
      id: song.id,
      name: song.title,
      author: song.artist,
      audio: song.fileUrl,
      img: song.thumbnailUrl || getDefaultThumbnail(),
      duration: song.duration ? formatDuration(song.duration) : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch songs from API:", error);
    return [];
  }
}

/**
 * Fetch published images from API (for build-time static generation)
 */
export async function fetchPublishedImages(
  category?: string,
): Promise<IImage[]> {
  try {
    const url = category
      ? `${API_URL}/api/v1/images?published=true&category=${category}`
      : `${API_URL}/api/v1/images?published=true`;

    return await fetchWithTimeout<IImage[]>(url, {
      timeout: 15000,
      fallback: [],
    });
  } catch (error) {
    console.error("Failed to fetch images from API:", error);
    return [];
  }
}

function getDefaultThumbnail(): string {
  return "/images/default-album.png";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
```

---

### Step 2: Update Shared Types

**Duration**: 15 min

Update `packages/utils/src/types.ts` to align with API response:

```typescript
// Existing interface (keep for backward compatibility)
export interface ISong {
  id: string;
  name: string;
  author: string;
  audio: string;
  img: string;
  duration?: string;
}

// New interface matching API response
export interface ISongApiResponse {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath: string;
  fileUrl: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IImage {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
  published: boolean;
}
```

---

### Step 3: Update Packages Index Export

**Duration**: 5 min

Update `packages/utils/src/index.ts`:

```typescript
export * from "./types";
export * from "./date-utils";
export * from "./songs";
export * from "./api-client"; // NEW
```

Rebuild the package:

```bash
cd packages/utils
npm run build
```

---

### Step 4: Update Songs.ts with Hybrid Approach

**Duration**: 20 min

Update `packages/utils/src/songs.ts` to support both static and API data:

```typescript
import { ISong } from "./types";
import { fetchPublishedSongs } from "./api-client";

// Supabase storage base URL from environment variables
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs`
  : "";

// Helper function to create song storage URL
const createSongUrl = (filename: string): string => {
  if (!supabaseStorageUrl) {
    console.error("Supabase URL not configured.");
    return "";
  }
  return `${supabaseStorageUrl}/${encodeURIComponent(filename)}`;
};

// Static fallback songs (used if API unavailable)
export const staticSongs: Array<ISong> = [
  // ... existing static song data ...
];

/**
 * Get songs - tries API first, falls back to static data
 */
export async function getSongs(): Promise<ISong[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // If API URL configured, try fetching from API
  if (apiUrl) {
    const apiSongs = await fetchPublishedSongs();
    if (apiSongs.length > 0) {
      return apiSongs;
    }
  }

  // Fallback to static songs
  console.log("Using static song data");
  return staticSongs;
}

// Keep existing exports for backward compatibility
export const songs = staticSongs;

export const getSongById = (id: string): ISong | undefined => {
  return staticSongs.find((song) => song.id === id);
};
```

---

### Step 5: Update Frontend Page Component

**Duration**: 30 min

Since Next.js 15 uses App Router with Server Components, update `apps/web/app/page.tsx`:

```typescript
import { Suspense } from "react";
import {
  Title,
  ProfileSection,
  CountUp,
  Footer,
  FloatingHearts,
  MusicSidebar,
} from "@/components/LoveDays";
import { getSongs } from "@love-days/utils";

// Mark as async for server-side data fetching
async function HomePage() {
  // Fetch songs at build time (static export)
  const songs = await getSongs();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <FloatingHearts />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:py-12">
        <div className="text-center space-y-6 sm:space-y-8">
          <Title />
          <ProfileSection />
          <CountUp />
        </div>

        <Footer />
      </main>

      <MusicSidebar songs={songs} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
```

---

### Step 6: Update MusicSidebar Props

**Duration**: 15 min

Update `apps/web/components/LoveDays/MusicSidebar.tsx` to accept songs prop:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { ISong } from "@love-days/utils";
// ... other imports

interface MusicSidebarProps {
  songs: ISong[];
}

export function MusicSidebar({ songs }: MusicSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // ... rest of component implementation

  const currentSong = songs[currentIndex];

  // ... rest of component
}
```

---

### Step 7: Update Environment Variables

**Duration**: 10 min

Update `apps/web/.env.sample`:

```bash
# Supabase Storage (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API (NEW)
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app
```

Create/Update `apps/web/.env.local` with actual values.

---

### Step 8: Update Next.js Config

**Duration**: 10 min

Update `apps/web/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Expose env vars to both server and client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
};

module.exports = nextConfig;
```

---

### Step 9: Configure Cloudflare Pages Deploy Hook

**Duration**: 20 min

1. **Create Deploy Hook in Cloudflare**:

   - Go to Cloudflare Dashboard → Pages → your project
   - Settings → Build & Deployments → Deploy Hooks
   - Click "Add deploy hook"
   - Name: "Admin UI Rebuild"
   - Branch: main (or production branch)
   - Copy the webhook URL

2. **Add to Admin UI Environment**:

```bash
# apps/admin/.env.local
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx
```

3. **Verify in Admin Dashboard**:
   - Login to admin UI
   - Go to Settings
   - Click "Rebuild Site" button
   - Verify Cloudflare build starts

---

### Step 10: Configure Cloudflare Pages Environment

**Duration**: 15 min

1. **Add Environment Variables to Cloudflare**:

   - Go to Cloudflare Dashboard → Pages → your project
   - Settings → Environment Variables
   - Add for Production:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL`

2. **Verify Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `apps/web/out`
   - Root directory: `/` (monorepo root)

---

### Step 11: Test Local Build

**Duration**: 20 min

```bash
# Build packages first
cd packages/utils
npm run build

# Build web app
cd apps/web
npm run build

# Verify output
ls out/
# Should see index.html and static assets

# Preview locally
npx serve out
# Open http://localhost:3000
```

---

### Step 12: End-to-End Testing

**Duration**: 30 min

**Test Scenario**:

1. **Upload Song via Admin**:

   ```
   - Login to admin dashboard
   - Navigate to Songs → New
   - Upload audio file
   - Fill in title, artist
   - Save (published = false by default)
   ```

2. **Verify in Admin**:

   ```
   - Song appears in songs list
   - Can play preview
   - Toggle publish = true
   ```

3. **Trigger Rebuild**:

   ```
   - Navigate to Settings
   - Click "Rebuild Site"
   - Wait for notification
   ```

4. **Verify Cloudflare Build**:

   ```
   - Go to Cloudflare Pages dashboard
   - Verify new build triggered
   - Wait for completion (~2 minutes)
   ```

5. **Verify Live Site**:
   ```
   - Visit production URL
   - New song appears in playlist
   - Audio plays correctly
   ```

---

## Todo List

### API Integration

- [ ] Create api-client.ts in packages/utils
- [ ] Add fetchPublishedSongs function
- [ ] Add fetchPublishedImages function
- [ ] Update types.ts with API response types
- [ ] Update index.ts exports
- [ ] Rebuild packages/utils

### Frontend Updates

- [ ] Update songs.ts with getSongs function
- [ ] Update app/page.tsx to fetch at build time
- [ ] Update MusicSidebar to accept songs prop
- [ ] Update environment variables
- [ ] Update next.config.js

### Cloudflare Configuration

- [ ] Create Cloudflare deploy hook
- [ ] Add webhook URL to admin env vars
- [ ] Configure Cloudflare env vars
- [ ] Verify build settings

### Testing

- [ ] Test local build
- [ ] Test API fetch works at build time
- [ ] Test fallback to static data
- [ ] Test admin upload workflow
- [ ] Test rebuild webhook
- [ ] Test end-to-end flow

### Deployment

- [ ] Deploy admin with new env var
- [ ] Push frontend changes
- [ ] Verify Cloudflare build succeeds
- [ ] Verify live site shows new content

---

## Success Criteria

1. **Build Fetches API Data**: Build logs show API fetch
2. **Static Export Works**: `npm run build` produces out/ directory
3. **Songs Display**: Frontend shows songs from API
4. **Fallback Works**: If API down, static songs used
5. **Rebuild Webhook**: Admin button triggers Cloudflare build
6. **E2E Flow**: Upload → Publish → Rebuild → Live (within 5 min)

---

## Risk Assessment

| Risk                     | Impact | Mitigation                              |
| ------------------------ | ------ | --------------------------------------- |
| API unavailable at build | High   | Fallback to static data                 |
| Build timeout            | Medium | Increase Cloudflare timeout, cache deps |
| Wrong env vars           | High   | Document all vars, verify before deploy |
| CORS at build time       | Low    | No CORS for server-side fetch           |
| Webhook fails            | Medium | Show error in admin, manual retry       |

---

## Security Considerations

1. **No Auth at Build Time**: Public API endpoints only
2. **Webhook URL Secret**: Never expose in client code
3. **API URL Public**: OK to expose (read-only public endpoints)
4. **Build Logs**: Don't log sensitive data

---

## Rollback Plan

If API integration causes issues:

1. Set `NEXT_PUBLIC_API_URL` to empty string
2. Frontend will use static song data (fallback)
3. Push change, rebuild
4. Investigate API issue separately

---

## Performance Considerations

### Build Time Optimization

- API timeout: 15 seconds max
- Parallel fetch songs and images if needed
- Cache node_modules in Cloudflare

### Runtime Performance

- Static export = no runtime API calls
- CDN serves all content
- Audio streams from Supabase CDN

---

## Future Enhancements

### Automatic Webhooks (Optional)

Add webhook trigger in NestJS when content published:

```typescript
// apps/api/src/songs/songs.service.ts
async publish(id: string, published: boolean) {
  const song = await this.prisma.song.update({
    where: { id },
    data: { published },
  });

  // Trigger rebuild if publishing
  if (published) {
    await this.triggerRebuild();
  }

  return song;
}

private async triggerRebuild() {
  const webhookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, { method: "POST" });
  }
}
```

### ISR Alternative (If Moving to Vercel)

If frontend moves to Vercel, can use ISR for automatic revalidation:

```typescript
export const revalidate = 3600; // Revalidate every hour
```

---

## Monitoring & Debugging

### Build Logs

Check Cloudflare Pages build logs for:

- API fetch success/failure
- Song count fetched
- Build time duration

### API Health

Monitor NestJS API for:

- Response times
- Error rates
- Cold start frequency

### Admin Usage

Track in admin dashboard:

- Last rebuild timestamp
- Rebuild success/failure

---

## Unresolved Questions

1. **Automatic vs Manual Rebuild**: Should API auto-trigger rebuild on publish?

   - Recommendation: Manual for MVP, auto-trigger adds complexity

2. **Rebuild Throttling**: What if admin clicks rebuild multiple times?

   - Recommendation: Cloudflare queues builds, OK to click multiple times

3. **Preview Environment**: Should admin have preview before rebuild?
   - Recommendation: Skip for MVP; admin can preview in dashboard

---

## Completion Checklist

Before marking Phase 4 complete:

- [ ] API client created and tested
- [ ] Frontend fetches from API at build time
- [ ] Fallback to static data works
- [ ] Cloudflare deploy hook configured
- [ ] Admin rebuild button works
- [ ] E2E test passed (upload → rebuild → live)
- [ ] Documentation updated
- [ ] Team notified of new workflow

---

## Summary

Phase 4 completes the NestJS backend project by:

1. Connecting frontend to API for build-time data
2. Enabling admin-triggered rebuilds via Cloudflare webhooks
3. Providing fallback to static data for reliability
4. Documenting the full content management workflow

**After Phase 4**: Non-technical admins can upload songs/images, publish content, and trigger rebuilds without developer assistance.
