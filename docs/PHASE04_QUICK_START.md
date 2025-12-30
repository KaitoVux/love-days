# Phase 04: Frontend Integration - Quick Start Guide

**Version**: 1.0
**Date**: 2025-12-30
**Phase**: Phase 04 - Frontend API Integration Complete

---

## What Changed in Phase 04?

Frontend now fetches songs from the NestJS backend API at build time, with automatic fallback to static data.

**Before**: Hardcoded static song data
**After**: API-driven with fallback, environment-configurable

---

## Quick Setup

### 1. Configure Environment Variables

Create/update `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002           # Local dev
# OR
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app # Production

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Local Development

```bash
# Terminal 1: Start backend API
cd apps/api
npm run start:dev
# Runs on http://localhost:3002

# Terminal 2: Build frontend (fetches from API)
cd apps/web
npm run build
# Build output: apps/web/out/index.html (with songs baked in)

# Terminal 3: Dev server
npm run dev
# Frontend at http://localhost:3000
```

### 3. Production Build

```bash
# API must be running at NEXT_PUBLIC_API_URL during build
cd apps/web
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app npm run build

# Output: apps/web/out/ ready for Cloudflare Pages
```

---

## Key Concepts

### Build-Time Fetching

Songs are fetched when you run `npm run build`, not when users visit the site.

```typescript
// This happens during build:
// GET https://love-days-api.vercel.app/api/v1/songs?published=true
// Response baked into static HTML
```

### Graceful Fallback

If API is down during build, uses static fallback songs:

```typescript
// In packages/utils/songs.ts
export async function getSongs(): Promise<ISong[]> {
  if (apiUrl && apiSongs.length > 0) {
    return apiSongs; // API songs
  }
  return staticSongs; // Fallback
}
```

### Component Data Flow

```
Server Component (page.tsx)
  └─ await getSongs()
     └─ Fetches from API at build time
        └─ Passes songs as prop
           └─ Client Component (MusicSidebar)
              └─ Receives songs, renders player
```

---

## File Changes Summary

| File                           | What Changed                |
| ------------------------------ | --------------------------- |
| `packages/utils/api-client.ts` | NEW - API client module     |
| `packages/utils/songs.ts`      | Added `getSongs()` function |
| `apps/web/app/page.tsx`        | Now async server component  |
| `apps/web/.env.sample`         | Added `NEXT_PUBLIC_API_URL` |
| `apps/web/next.config.js`      | Expose env variables        |

---

## Common Tasks

### Check API is Running

```bash
curl http://localhost:3002/api/v1/songs?published=true
# Should return: [{ id: "...", title: "...", ... }, ...]
```

### Check Build Fetched from API

Look at build output:

```bash
npm run build
# Console should show: "Fetched 15 songs from API"
# OR "Using static song data (API unavailable...)"
```

### Troubleshoot: Static Data When Should Use API

```bash
# 1. Check env var is set
echo $NEXT_PUBLIC_API_URL

# 2. Check API is running
curl https://love-days-api.vercel.app/api/v1/songs?published=true

# 3. Rebuild
npm run build

# 4. Check build output for API status
```

### Update Songs on Frontend

Songs are baked at build time. To update:

1. Add/edit songs in backend
2. Rebuild frontend: `npm run build`
3. Deploy frontend

---

## Type System

### ISong (Frontend Interface)

```typescript
interface ISong {
  id: string;
  name: string; // from API: title
  author: string; // from API: artist
  audio: string; // from API: fileUrl
  img: string; // from API: thumbnailUrl
  duration?: string; // from API: duration (formatted MM:SS)
}
```

### ISongApiResponse (Backend Interface)

```typescript
interface ISongApiResponse {
  id: string;
  title: string;
  artist: string;
  fileUrl: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  // ... other fields
}
```

API response automatically transformed to ISong by `api-client.ts`.

---

## API Endpoints Used

### Fetch Published Songs

```bash
GET /api/v1/songs?published=true
```

**Response**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The One",
    "artist": "Kodaline",
    "fileUrl": "https://...",
    "thumbnailUrl": "https://...",
    "published": true
  }
]
```

---

## Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Backend API running at NEXT_PUBLIC_API_URL
- [ ] Frontend env vars set in CI/CD
- [ ] Frontend build succeeds with "Fetched X songs from API"
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Test site loads with songs playing

---

## Environment Variables Reference

| Variable                        | Required | Example                   | Purpose         |
| ------------------------------- | -------- | ------------------------- | --------------- |
| `NEXT_PUBLIC_API_URL`           | Yes      | `http://localhost:3002`   | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | `https://xxx.supabase.co` | Supabase URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | `xxx`                     | Supabase key    |

All variables must be set at build time for static export.

---

## Helpful Commands

```bash
# Check build output
ls -la apps/web/out/

# View build logs
npm run build 2>&1 | grep -i "song\|api\|fallback"

# Test API locally
curl http://localhost:3002/api/v1/songs

# Type check
npm run type-check

# Format code
npm run format

# Lint
npm run lint
```

---

## What's Next?

Phase 05 will add:

- Webhook support for real-time updates
- Cache invalidation strategy
- Preview/draft song support

See [PHASE04_FRONTEND_INTEGRATION.md](PHASE04_FRONTEND_INTEGRATION.md) for full details.

---

## References

- [PHASE04_FRONTEND_INTEGRATION.md](PHASE04_FRONTEND_INTEGRATION.md) - Complete guide
- [API_REFERENCE.md](API_REFERENCE.md) - API endpoints
- [CODEBASE_SUMMARY.md](CODEBASE_SUMMARY.md) - Codebase structure

---

**Need Help?** Check [PHASE04_FRONTEND_INTEGRATION.md § Troubleshooting Guide](PHASE04_FRONTEND_INTEGRATION.md#troubleshooting-guide)
