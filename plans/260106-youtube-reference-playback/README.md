# YouTube Reference-Based Playback - Quick Start

**Plan:** `plans/260106-youtube-reference-playback/plan.md`
**Strategy:** Hybrid (YouTube references + file upload fallback)
**Duration:** 1-2 days (13-19 hours)

---

## What's Being Built

Replace downloaded audio files with YouTube IFrame Player references while maintaining file upload as fallback.

**Benefits:**

- ✅ 99.99% storage reduction (1 GB → 10 KB)
- ✅ $0/month cost (vs $45/month storage)
- ✅ <2s song addition (vs 30-60s download)
- ✅ Legal compliance (YouTube ToS)
- ✅ No Vercel timeouts
- ✅ Better audio quality

---

## Before You Start

### 1. Get YouTube Data API Key (10 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `apps/api/.env`: `YOUTUBE_API_KEY=your_key`

**Cost:** Free (10,000 units/day quota)

### 2. Install Dependencies

```bash
# Backend
cd apps/api
npm install googleapis

# Frontend (no new deps - YouTube API via CDN)
```

---

## Implementation Phases

### Phase 1: Database + Backend API (4-6 hours)

- Database migration (add `youtubeVideoId`, `sourceType`)
- YouTube service (fetch metadata from YouTube Data API)
- Songs service (add `createFromYoutube()` method)
- API endpoint (`POST /api/v1/songs/youtube`)

### Phase 2: Web Player (3-4 hours)

- YouTube IFrame Player hook
- Update MusicSidebar (support both YouTube + audio)
- Hybrid playback logic

### Phase 3: Admin UI (2-3 hours)

- YouTube import form
- Tab navigation (YouTube vs File Upload)
- API client integration

### Phase 4: Testing (2-3 hours)

- Backend API tests
- Frontend player tests
- Admin UI tests
- Performance validation

### Phase 5: Deployment (1-2 hours)

- Environment variables (production)
- Database migration (production)
- Deploy all apps
- Smoke testing

---

## Architecture

```
Admin → YouTube Import Form → POST /api/v1/songs/youtube
                                      ↓
                              YouTube Data API (fetch metadata)
                                      ↓
                              PostgreSQL (store video ID)
                                      ↓
User → Web App → YouTube IFrame Player (stream from YouTube)
```

**Database:**

```prisma
model Song {
  // Existing fields
  filePath: String?      // For uploaded files

  // NEW fields
  youtubeVideoId: String?  // For YouTube references
  sourceType: "youtube" | "upload"
}
```

**Playback logic:**

- YouTube songs → YouTube IFrame Player
- Uploaded songs → `<audio>` tag
- Mixed playlists supported

---

## Quick Reference

### Key Files

**Backend:**

- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/src/youtube/youtube.service.ts` - YouTube API integration
- `apps/api/src/songs/songs.service.ts` - Add `createFromYoutube()`

**Frontend (Web):**

- `apps/web/hooks/use-youtube-player.ts` - YouTube player hook
- `apps/web/components/LoveDays/MusicSidebar.tsx` - Hybrid player

**Admin:**

- `apps/admin/components/songs/youtube-import-form.tsx` - Import UI
- `apps/admin/app/(dashboard)/songs/new/page.tsx` - Tabs navigation

### Testing Commands

```bash
# Backend - YouTube import
curl -X POST http://localhost:3002/api/v1/songs/youtube \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Expected: Song with youtubeVideoId

# Frontend - Run dev server
cd apps/web && npm run dev
# Test YouTube playback in browser
```

---

## Deployment Checklist

### Environment Variables

**Vercel (API):**

- [ ] Add `YOUTUBE_API_KEY` to production env vars

**Database:**

- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Verify migration applied

**Apps:**

- [ ] Deploy API (Vercel)
- [ ] Deploy Admin (Vercel)
- [ ] Deploy Web (Cloudflare Pages)

### Smoke Tests

- [ ] YouTube import works in admin
- [ ] YouTube songs play on web
- [ ] Uploaded songs still work
- [ ] Mixed playlists work
- [ ] YouTube player visible (ToS compliance)

---

## Risk Mitigation

| Risk               | Likelihood | Mitigation                                     |
| ------------------ | ---------- | ---------------------------------------------- |
| Video deleted      | Medium     | Health check system (Phase 2), fallback upload |
| API quota exceeded | Very low   | Free tier: 10K/day, monitor usage              |
| Embedding disabled | Low        | Pre-check on import, clear error               |
| ToS violation      | Low        | Player ≥200px, visible                         |

---

## Success Criteria

**Functional:**

- ✅ YouTube import <2s
- ✅ Playback works for both sources
- ✅ Backward compatibility maintained

**Performance:**

- ✅ No Vercel timeouts
- ✅ <10% API quota usage

**Legal:**

- ✅ YouTube ToS compliant

---

## Next Steps After Implementation

**Immediate (Week 1):**

- Monitor YouTube import success rates
- Track API quota usage
- Collect user feedback

**Short-term (Month 1):**

- Implement health check system
- Add bulk YouTube playlist import
- Improve metadata parsing

**Long-term (3 Months):**

- Analytics dashboard
- Cache optimization
- Advanced features (Spotify, Apple Music)

---

## Support

**Documentation:**

- Full plan: `plan.md`
- Brainstorm report: `plans/reports/brainstorm-20260106-youtube-reference-playback.md`

**Questions:**

- Check "Questions & Clarifications" section in main plan
- Create GitHub issue if blocked

---

**Created:** 2026-01-06
**Status:** Ready for Implementation ✅
