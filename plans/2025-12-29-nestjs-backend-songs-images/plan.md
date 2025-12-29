# NestJS Backend for Songs & Images Management

**Plan ID**: 2025-12-29-nestjs-backend-songs-images
**Created**: 2025-12-29
**Status**: Planning Complete
**Priority**: High
**Source**: [Brainstorm Report](../reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)

---

## Executive Summary

Implement NestJS backend API on Vercel serverless with Supabase integration, shadcn Admin UI, and presigned URL file upload pattern. Enables non-technical admin to manage songs/images without code deployments.

**Architecture Confirmed**:

- **Frontend**: Cloudflare Pages (static export, manual webhooks)
- **Backend**: NestJS on Vercel (serverless functions)
- **Admin UI**: Separate Next.js app on Vercel (shadcn dashboard)
- **Database**: Supabase PostgreSQL + Storage
- **Total Cost**: $0/month (all free tiers)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│ PUBLIC FRONTEND (Next.js Static - apps/web)              │
│ - Cloudflare Pages (free, global edge CDN)               │
│ - Manual webhook rebuilds when admin publishes           │
│ - Fetches song/image data from NestJS API at build      │
└────────────────────┬─────────────────────────────────────┘
                     │
                HTTPS + CORS
                     │
┌────────────────────▼─────────────────────────────────────┐
│ ADMIN UI (Next.js Separate App - apps/admin)             │
│ - Vercel deployment (shadcn dashboard)                   │
│ - Supabase Auth protected routes                         │
│ - Direct file upload to Supabase via presigned URLs     │
│ - Calls NestJS API for metadata CRUD                     │
│ - Manual "Rebuild Site" webhook trigger button          │
└────────────────────┬─────────────────────────────────────┘
                     │
                HTTPS + JWT
                     │
┌────────────────────▼─────────────────────────────────────┐
│ BACKEND API (NestJS Serverless - apps/api)               │
│ - Vercel serverless functions (Express adapter)          │
│ - Generates presigned URLs for Supabase Storage          │
│ - Validates Supabase JWT tokens                          │
│ - Metadata CRUD (PostgreSQL via Prisma)                  │
│ - Swagger API docs at /api/docs                          │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│ SUPABASE (Existing Infrastructure)                       │
│ - PostgreSQL: songs, images metadata tables              │
│ - Storage: direct uploads via presigned URLs             │
│ - Auth: JWT tokens for admin access                      │
└──────────────────────────────────────────────────────────┘
```

---

## Phase Overview

| Phase | Name                                                                           | Duration | Status      | Dependencies | Completion Date |
| ----- | ------------------------------------------------------------------------------ | -------- | ----------- | ------------ | --------------- |
| 1     | [NestJS Backend Foundation](./phase-01-nestjs-backend-foundation.md)           | Week 1   | DONE        | None         | 2025-12-29      |
| 2     | [Presigned URL File Upload](./phase-02-presigned-url-file-upload.md)           | Week 2   | DONE        | Phase 1      | 2025-12-29      |
| 3     | [Admin UI (shadcn Dashboard)](./phase-03-admin-ui-shadcn-dashboard.md)         | Week 3   | In Progress | Phase 2      | 2025-12-31 ETA  |
| 4     | [Frontend Integration & Webhooks](./phase-04-frontend-integration-webhooks.md) | Week 3-4 | Pending     | Phase 3      | 2026-01-05 ETA  |

**Total Estimated Duration**: 2-3 weeks (accelerated: both Phase 1&2 done in week 1)

---

## Key Technical Decisions

### 1. Presigned URL Pattern (Critical)

Admin uploads file directly to Supabase, bypassing Vercel 4.5MB limit:

```
1. Admin requests upload URL from NestJS API
2. NestJS generates Supabase presigned URL
3. Admin uploads file DIRECTLY to Supabase
4. Admin sends metadata to NestJS API
5. NestJS saves metadata to PostgreSQL
```

### 2. Separate Admin App

- Clean separation from public frontend
- Independent deployment lifecycle
- No impact on static export performance
- Dedicated shadcn dashboard template

### 3. Supabase Auth Integration

- JWT validation in NestJS via Supabase Admin SDK
- No session storage needed (stateless serverless)
- Protected admin routes with auth guard

### 4. Manual Webhook Rebuilds

- Cloudflare Pages deploy hooks
- Admin triggers via "Rebuild Site" button
- ~2 minute rebuild time acceptable

---

## Monorepo Structure (After Implementation)

```
love-days/
├── apps/
│   ├── web/              # Next.js static export (Cloudflare Pages) - EXISTING
│   ├── api/              # NestJS backend (Vercel serverless) - NEW
│   ├── admin/            # Next.js admin dashboard (Vercel) - NEW
│   └── portal/           # Existing secondary app
├── packages/
│   ├── utils/            # Shared utilities - EXISTING (update)
│   └── types/            # Shared TypeScript interfaces - NEW
├── docs/                 # Project documentation
└── turbo.json            # Turborepo configuration (update)
```

---

## Database Schema

### Songs Table

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration INTEGER,  -- seconds
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,  -- bytes
  thumbnail_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

CREATE INDEX idx_songs_published ON songs(published);
```

### Images Table

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  category VARCHAR(50),  -- 'profile', 'background', 'gallery'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

CREATE INDEX idx_images_category ON images(category, published);
```

---

## API Endpoints

### Songs API

```
GET    /api/v1/songs              - List published songs (public)
GET    /api/v1/songs/:id          - Get song details (public)
POST   /api/v1/songs/upload-url   - Generate presigned upload URL (admin)
POST   /api/v1/songs              - Create song metadata (admin)
PATCH  /api/v1/songs/:id          - Update song metadata (admin)
DELETE /api/v1/songs/:id          - Delete song (admin)
POST   /api/v1/songs/:id/publish  - Publish song (admin)
```

### Images API

```
GET    /api/v1/images             - List images (query: ?category=profile)
GET    /api/v1/images/:id         - Get image details
POST   /api/v1/images/upload-url  - Generate presigned upload URL (admin)
POST   /api/v1/images             - Upload image metadata (admin)
PATCH  /api/v1/images/:id         - Update image metadata (admin)
DELETE /api/v1/images/:id         - Delete image (admin)
```

---

## Success Metrics

### Development

- [ ] NestJS API deployed on Vercel with <500ms response time (warm)
- [ ] Admin can upload 50MB audio file without timeout
- [ ] Zero CORS errors in production
- [ ] API documented via Swagger at `/api/docs`

### User Experience

- [ ] Non-technical admin manages content without developer help
- [ ] Admin UI matches Love Days theme (350 hue rose pink)
- [ ] Frontend updates within 5 minutes of publish action
- [ ] Upload progress bar with error handling

### Architecture Quality

- [ ] Shared types prevent frontend/backend API drift
- [ ] NestJS follows modular design (Songs, Images, Auth modules)
- [ ] 80%+ test coverage on business logic

---

## Risk Assessment

| Risk                        | Impact | Mitigation                                     |
| --------------------------- | ------ | ---------------------------------------------- |
| Vercel cold starts (3-5s)   | Medium | Acceptable for admin usage; show loading state |
| Vercel 4.5MB body limit     | High   | Presigned URL pattern bypasses completely      |
| Vercel 10s function timeout | Low    | Presigned URLs = fast URL generation           |
| CORS misconfiguration       | High   | Test thoroughly; configure both domains        |
| Supabase free tier limits   | Medium | Monitor storage; compress audio files          |

---

## Environment Variables

### Backend (apps/api/.env)

```bash
DATABASE_URL=postgresql://...supabase...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # Service key for admin operations
```

### Admin UI (apps/admin/.env)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app
CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/...
```

### Frontend (apps/web/.env)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # Existing
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # Existing
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app  # NEW
```

---

## Getting Started

1. Read Phase 1 plan: [NestJS Backend Foundation](./phase-01-nestjs-backend-foundation.md)
2. Set up Supabase PostgreSQL tables
3. Create `apps/api/` NestJS project
4. Deploy to Vercel (verify serverless config)

---

## Related Documentation

- [Brainstorm Report](../reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)
- [System Architecture](../../docs/SYSTEM_ARCHITECTURE.md)
- [Code Standards](../../docs/CODE_STANDARDS.md)
- [Project Overview](../../docs/PROJECT_OVERVIEW.md)

---

## Changelog

| Date       | Change                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-12-29 | Phase 2 marked DONE: Presigned URL file upload complete with security hardening, MIME validation, env checks, shared DTOs, all quality issues resolved, all tests passing |
| 2025-12-29 | Phase 1 marked DONE: NestJS backend foundation complete with Prisma, Supabase auth, CRUD endpoints, Swagger docs, all tests passed                                        |
| 2025-12-29 | Initial plan created from brainstorm report                                                                                                                               |
