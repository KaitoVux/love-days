# Phase 04: Frontend Integration & Webhooks

**Version**: 1.0
**Completed**: 2025-12-30
**Status**: Complete ✅
**Phase**: Frontend API Integration & Build-Time Data Fetching

---

## Overview

Phase 04 implements the critical integration layer between the Next.js frontend and the NestJS backend API. This phase establishes a robust, type-safe data fetching pattern with automatic fallback to static data for reliability.

**Key Achievement**: Build-time data fetching from API with graceful degradation to static fallback data.

---

## Architecture Changes

### Before Phase 04

- Frontend relied entirely on hardcoded static song data
- No connection to backend API
- Manual data updates required code changes

### After Phase 04

- **Build-time API integration**: `getSongs()` attempts API fetch during build
- **Type-safe responses**: API responses mapped to existing `ISong` interface
- **Graceful fallback**: Static data automatically used if API unavailable
- **Environment configuration**: API URL configurable via env vars
- **Hybrid approach**: Supports both API-driven and static-fallback modes

---

## Implementation Details

### 1. New API Client Module

**File**: `packages/utils/src/api-client.ts`

```typescript
// Exports two main functions:
export async function fetchPublishedSongs(): Promise<ISong[]>;
export async function fetchPublishedImages(
  category?: string,
): Promise<IImageApiResponse[]>;

// Features:
// - Timeout handling (15 second default)
// - Error logging and fallback support
// - Automatic response transformation
// - Type-safe fetch with generic <T>
```

**Key Features**:

- Generic `fetchWithTimeout<T>()` utility with configurable timeout (default: 10s)
- Automatic response transformation from API format to frontend format
- Optional fallback values for graceful degradation
- Console error logging for debugging

**Transformation Logic** (API → Frontend):

```
API Response          →  Frontend ISong
├─ id                 →  id
├─ title              →  name
├─ artist             →  author
├─ fileUrl            →  audio
├─ thumbnailUrl       →  img
└─ duration (seconds) →  duration (formatted MM:SS)
```

### 2. Updated Type Definitions

**File**: `packages/utils/src/types.ts`

Added new interfaces for API responses:

```typescript
export interface ISongApiResponse {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath: string;
  fileUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IImageApiResponse {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileUrl?: string;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Existing interface (unchanged for backward compatibility):
export interface ISong {
  id: string;
  name: string;
  author: string;
  audio: string;
  img: string;
  duration?: string;
}
```

### 3. Enhanced Songs Module

**File**: `packages/utils/src/songs.ts`

```typescript
// New function - hybrid approach
export async function getSongs(): Promise<ISong[]> {
  // 1. Check if API URL is configured
  // 2. Try fetching from API (if configured)
  // 3. Fall back to static data if API unavailable
  // 4. Return result with console logging
}

// Kept for backward compatibility:
export const songs = staticSongs;
export const getSongById = (id: string): ISong | undefined
```

**Hybrid Strategy**:

1. If `NEXT_PUBLIC_API_URL` is set: attempt API fetch
2. If API returns data: use it (with console log)
3. If API fails/timeout: use static fallback (with console log)
4. Always maintains type safety

### 4. Server Component Update

**File**: `apps/web/app/page.tsx`

Changed from static to async server component:

```typescript
// BEFORE: Client-side component or static import
export default function Home() {
  const songs = staticSongs; // or import
}

// AFTER: Async server component
export default async function Home() {
  const songs = await getSongs(); // Fetched at build time
  return (
    <div>
      <MusicSidebar songs={songs} />
      {/* other components */}
    </div>
  );
}
```

**Implications**:

- Songs fetched during build process (static export)
- Data is baked into HTML at build time
- No runtime API calls needed
- Supports Cloudflare Pages static deployment

### 5. Component Props Update

**File**: `apps/web/components/LoveDays/MusicSidebar.tsx`

```typescript
interface MusicSidebarProps {
  songs: ISong[]; // Now accepts songs as prop
}

const MusicSidebar = ({ songs }: MusicSidebarProps) => {
  // Component now uses passed-in songs array
  // instead of importing static data
};
```

### 6. Environment Configuration

**File**: `apps/web/.env.sample`

```bash
# Supabase Storage (for audio files)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API (NEW - for build-time data fetching)
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app

# Note: Rename this file to .env.local and fill in with your actual values
# Supabase values: Project settings > API
# API URL: Your deployed NestJS backend URL
#   Local dev: http://localhost:3002
#   Production: https://love-days-api.vercel.app
```

### 7. Next.js Configuration

**File**: `apps/web/next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  distDir: "out",
  // Expose env vars to both server and client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};
```

---

## Data Flow Diagram

```
Build Time Flow:
┌────────────────────────────────────────────────────────┐
│ npm run build (Next.js Build Process)                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  app/page.tsx (Server Component)                       │
│  ├─ await getSongs()                                   │
│  │                                                     │
│  └─ packages/utils/songs.ts: getSongs()               │
│     ├─ Check NEXT_PUBLIC_API_URL                      │
│     │                                                 │
│     ├─ If configured:                                │
│     │  └─ await fetchPublishedSongs()                │
│     │     └─ api-client.ts: fetchWithTimeout()       │
│     │        ├─ GET /api/v1/songs?published=true    │
│     │        ├─ Transform ApiSongResponse → ISong    │
│     │        └─ Return songs (or [])                │
│     │                                                 │
│     ├─ If empty/failed:                              │
│     │  └─ Use staticSongs array                      │
│     │                                                 │
│     └─ Return ISong[]                                │
│                                                      │
│  ├─ MusicSidebar receives songs prop               │
│  │                                                 │
│  └─ Component renders with data baked into HTML   │
│                                                  │
│  Output: apps/web/out/index.html (static)       │
│                                                  │
└────────────────────────────────────────────────────────┘

Runtime Flow (Cloudflare Pages):
┌────────────────────────────────────────────────────────┐
│ User visits https://love-days.com                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Cloudflare Pages serves: apps/web/out/index.html    │
│  ├─ Static HTML with songs baked in                   │
│  ├─ MusicSidebar renders with data                    │
│  └─ Audio player becomes interactive (client-side)    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## API Integration Points

### Endpoint: GET /api/v1/songs

**Purpose**: Fetch published songs for build-time static generation

**Request**:

```bash
curl https://love-days-api.vercel.app/api/v1/songs?published=true
```

**Response** (200 OK):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The One",
    "artist": "Kodaline",
    "album": "In a Perfect World",
    "duration": 264,
    "filePath": "songs/550e8400-the-one.mp3",
    "fileUrl": "https://[supabase-url]/storage/v1/object/public/songs/550e8400-the-one.mp3",
    "thumbnailPath": "songs/thumbnails/550e8400-thumbnail.jpg",
    "thumbnailUrl": "https://[supabase-url]/storage/v1/object/public/songs/thumbnails/550e8400-thumbnail.jpg",
    "published": true,
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-29T10:00:00.000Z"
  }
]
```

**Error Handling**:

- Timeout (>15s): Returns `[]` (empty array) → fallback to static
- Network error: Returns `[]` (empty array) → fallback to static
- Empty response: Returns `[]` (empty array) → fallback to static
- 500 error: Returns `[]` (empty array) → fallback to static

### Endpoint: GET /api/v1/images

**Purpose**: Fetch published images (future use)

**Request**:

```bash
curl https://love-days-api.vercel.app/api/v1/images?published=true&category=profile
```

**Response** (200 OK):

```json
[
  {
    "id": "img-001",
    "title": "Profile Image",
    "description": "Couple profile photo",
    "filePath": "images/profile/img-001.jpg",
    "fileUrl": "https://[supabase-url]/storage/v1/object/public/images/profile/img-001.jpg",
    "width": 800,
    "height": 600,
    "category": "profile",
    "published": true,
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-29T10:00:00.000Z"
  }
]
```

---

## Development Workflow

### Local Development

1. **Start Backend API**:

   ```bash
   cd apps/api
   npm run start:dev
   # Runs on http://localhost:3002
   ```

2. **Configure Frontend**:

   ```bash
   cd apps/web
   # Create/update .env.local:
   NEXT_PUBLIC_API_URL=http://localhost:3002
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

3. **Build Frontend** (fetches from local API):

   ```bash
   cd apps/web
   npm run build
   # During build: GET http://localhost:3002/api/v1/songs?published=true
   # Console output: "Fetched 12 songs from API" or fallback message
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   # Serves from apps/web/out/
   ```

### Production Build

**Deployment Process**:

1. Backend deployed to Vercel: `https://love-days-api.vercel.app`
2. Environment variable set: `NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app`
3. Frontend built in CI/CD pipeline
4. Build-time: GET `https://love-days-api.vercel.app/api/v1/songs?published=true`
5. Songs data baked into static HTML
6. Frontend deployed to Cloudflare Pages

**Build Log Output**:

```
Fetched 15 songs from API
✔ exported to apps/web/out/
```

Or with fallback:

```
Using static song data (API unavailable or returned no songs)
✔ exported to apps/web/out/
```

---

## Key Design Decisions

### 1. Build-Time Fetching (Not Runtime)

**Why**:

- Cloudflare Pages static deployment requires pre-built HTML
- No runtime API calls needed (faster UX)
- SEO benefits of static HTML
- Reduced API load

**Trade-off**: Songs are static between builds

### 2. Graceful Fallback Pattern

**Why**:

- Ensures app works even if API is down during build
- Maintains reliability for users
- No broken deployments due to API issues

**Implementation**: If API fails → use `staticSongs` array

### 3. Type Transformation

**Why**:

- Keep existing `ISong` interface stable
- Support API response changes without breaking frontend
- Centralize transformation logic in `api-client.ts`

**Pattern**:

```typescript
ApiResponse → Transform → ISong (internal interface)
```

### 4. Props-Based Component Data

**Why**:

- Separates data fetching (server) from UI rendering (client)
- MusicSidebar remains client component (pure UI)
- Follows Next.js 15 best practices

**Pattern**:

```
Server (Home)  →  fetch getSongs()  →  Client (MusicSidebar)
```

### 5. Environment Variable Strategy

**Why**:

- Supports multiple environments (local, staging, production)
- No hardcoded URLs
- Easy deployment configuration

**Pattern**:

```
NEXT_PUBLIC_API_URL (set at build time)
  ↓
packages/utils/api-client.ts (reads env var)
  ↓
apps/web build process
```

---

## Troubleshooting Guide

### Build Succeeds but Shows Static Data

**Symptom**: Console shows "Using static song data (API unavailable...)"

**Solutions**:

1. Check `NEXT_PUBLIC_API_URL` is set in build environment
2. Verify backend API is deployed and running
3. Check API returns `published: true` songs
4. Review API logs for errors

**Debug**:

```bash
# Test API manually during build:
curl https://love-days-api.vercel.app/api/v1/songs?published=true
# Should return array of song objects
```

### Build Fails with Timeout

**Symptom**: Build times out during `getSongs()`

**Solutions**:

1. Increase timeout in `packages/utils/api-client.ts` (currently 15s)
2. Check backend API response time
3. Verify network connectivity in CI/CD environment
4. Static fallback should prevent build failure

### Type Errors on Build

**Symptom**: TypeScript errors with `ISong` or API responses

**Solutions**:

1. Regenerate types: `npm run build` in packages/utils
2. Verify all interfaces exported in `packages/utils/src/index.ts`
3. Check component props match `ISong[]` type

### Songs Not Updating After API Changes

**Symptom**: Frontend still shows old songs after API update

**Root Cause**: Songs cached at build time

**Solution**: Trigger rebuild to refetch songs

```bash
# On Cloudflare Pages or CI/CD:
# Redeploy frontend (even without code changes)
# Frontend rebuild will fetch latest songs from API
```

---

## Testing Checklist

- [ ] Build succeeds with API URL configured
- [ ] Build succeeds without API URL (uses fallback)
- [ ] Build succeeds with API timeout (uses fallback)
- [ ] MusicSidebar receives songs prop correctly
- [ ] Static fallback songs work (no broken audio links)
- [ ] Duration formatting works (MM:SS format)
- [ ] Thumbnail URLs fallback to default image
- [ ] Type checking passes: `npm run type-check`
- [ ] Local dev works with `NEXT_PUBLIC_API_URL=http://localhost:3002`
- [ ] Production build fetches from deployed API

---

## Files Modified in Phase 04

| File                                            | Type     | Changes                             |
| ----------------------------------------------- | -------- | ----------------------------------- |
| `packages/utils/src/api-client.ts`              | NEW      | API client with fetch utilities     |
| `packages/utils/src/types.ts`                   | MODIFIED | Added API response interfaces       |
| `packages/utils/src/index.ts`                   | MODIFIED | Export api-client module            |
| `packages/utils/src/songs.ts`                   | MODIFIED | Added `getSongs()` hybrid function  |
| `apps/web/app/page.tsx`                         | MODIFIED | Async server component, fetch songs |
| `apps/web/components/LoveDays/MusicSidebar.tsx` | MODIFIED | Accept songs prop                   |
| `apps/web/.env.sample`                          | MODIFIED | Added `NEXT_PUBLIC_API_URL`         |
| `apps/web/next.config.js`                       | MODIFIED | Expose API URL env var              |

---

## Phase 04 Impact Summary

### Data Architecture

- Moved from hardcoded to API-driven (with fallback)
- Type-safe transformation layer
- Hybrid build-time/fallback strategy

### Component Architecture

- Server component fetches data
- Client component receives as prop
- Better separation of concerns

### Deployment

- Build-time data fetching
- Static HTML output for Cloudflare Pages
- Environment-specific configuration

### Developer Experience

- Clear API integration pattern
- Fallback mechanism prevents deployment failures
- Console logging for debugging
- Type-safe throughout

---

## Next Steps

### Phase 05 Considerations

1. Webhook support for real-time updates
2. Cache invalidation strategy
3. Preview/draft song support
4. Image gallery integration

### Future Enhancements

1. Incremental Static Regeneration (ISR)
2. Runtime data fetching with caching
3. Admin-only preview mode
4. Song search/filtering

---

## References

- [Next.js Server Components](https://nextjs.org/docs/getting-started/react-essentials#server-components)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [NestJS API Reference](../API_REFERENCE.md)
- [System Architecture](../SYSTEM_ARCHITECTURE.md)

---

**Documentation Version**: 1.0
**Last Updated**: 2025-12-30
**Phase Status**: Complete ✅
**Next Phase**: Phase 05 - Webhook Integration & Real-Time Updates
