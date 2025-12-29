# Brainstorm: NestJS Backend for Songs & Images Management

**Date:** 2025-12-29
**Status:** ✅ Final Architecture Confirmed
**Deployment:** Cloudflare Pages (frontend) + Vercel (NestJS backend + Admin UI)

---

## 🎯 FINAL ARCHITECTURE UPDATE

**Confirmed Decisions (2025-12-29 10:51 AM):**

### Deployment Strategy

- ✅ **Frontend:** Cloudflare Pages (static export, manual webhooks for rebuild)
- ✅ **Backend:** NestJS on Vercel (serverless functions, presigned URL pattern)
- ✅ **Admin UI:** Separate Next.js app on Vercel (shadcn dashboard)
- ✅ **Database:** Supabase PostgreSQL + Storage
- ✅ **Total Cost:** $0/month (all free tiers)

### Key Architectural Decisions

**1. Admin UI Deployment:** Separate app (not /admin routes in main app)
**2. Image Thumbnails:** Auto-generate with Sharp library
**3. Frontend Rebuild:** Manual webhook trigger (Cloudflare doesn't support ISR)
**4. Audio Transcoding:** Accept as-is initially (add later if needed)
**5. Caching:** Cloudflare CDN (no Redis needed)

### Critical Vercel Adaptations

**File Upload Pattern:** Presigned URLs (not direct upload)

- Admin requests upload URL from NestJS API
- NestJS generates Supabase presigned URL
- Admin uploads file DIRECTLY to Supabase (bypasses Vercel 4.5MB limit)
- Admin sends metadata to NestJS API
- NestJS saves metadata to PostgreSQL

**Benefits:**

- Bypasses Vercel request body size limits
- Faster uploads (direct to Supabase CDN)
- Industry standard pattern (AWS S3 compatible)
- Reduces backend bandwidth

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│ PUBLIC FRONTEND (Next.js Static)                         │
│ - Cloudflare Pages (free, global edge CDN)              │
│ - Manual webhook rebuilds when admin publishes          │
│ - Fetches song/image data from NestJS API at build     │
└────────────────────┬─────────────────────────────────────┘
                     │
                HTTPS + CORS
                     │
┌────────────────────▼─────────────────────────────────────┐
│ ADMIN UI (Next.js Separate App)                          │
│ - Vercel deployment (shadcn dashboard)                  │
│ - Supabase Auth protected routes                        │
│ - Direct file upload to Supabase via presigned URLs    │
│ - Calls NestJS API for metadata CRUD                    │
│ - Manual "Rebuild Site" webhook trigger button         │
└────────────────────┬─────────────────────────────────────┘
                     │
                HTTPS + JWT
                     │
┌────────────────────▼─────────────────────────────────────┐
│ BACKEND API (NestJS Serverless on Vercel)               │
│ - Vercel serverless functions (Express adapter)         │
│ - Generates presigned URLs for Supabase Storage         │
│ - Validates Supabase JWT tokens                         │
│ - Metadata CRUD (PostgreSQL via Prisma)                 │
│ - Swagger API docs at /api/docs                         │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│ SUPABASE (Existing Infrastructure)                       │
│ - PostgreSQL: songs, images metadata tables             │
│ - Storage: direct uploads via presigned URLs            │
│ - Auth: JWT tokens for admin access                     │
└──────────────────────────────────────────────────────────┘
```

### Vercel NestJS Configuration

**File: `apps/api/vercel.json`**

```json
{
  "version": 2,
  "builds": [{ "src": "src/main.ts", "use": "@vercel/node" }],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
  ]
}
```

**File: `apps/api/src/main.ts`** (Serverless Adapter)

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: [
      "https://love-days.pages.dev", // Public frontend
      "https://love-days-admin.vercel.app", // Admin UI
      "http://localhost:3000", // Local dev
    ],
    credentials: true,
  });

  await app.init();
}

bootstrap();

// Export for Vercel serverless
export default expressApp;
```

### Presigned URL Endpoints

```typescript
// Generate upload URL
POST /api/v1/songs/upload-url
Body: { fileName: "song.mp3", fileType: "audio/mpeg" }
Response: { uploadUrl: "https://...", filePath: "songs/123-song.mp3" }

// Save song metadata after upload
POST /api/v1/songs
Body: { title: "...", artist: "...", filePath: "songs/123-song.mp3" }
Response: { id: "uuid", title: "...", fileUrl: "https://..." }
```

### Webhook Rebuild Flow

**Admin Dashboard → "Rebuild Site" Button:**

```typescript
// Admin UI calls Cloudflare Pages webhook
async function rebuildSite() {
  await fetch(process.env.CLOUDFLARE_DEPLOY_HOOK_URL, { method: "POST" });
  // Shows "Rebuilding site... ETA 2 minutes" notification
}
```

**Cloudflare Pages Deploy Hook:**

- Settings → Build & Deployments → Deploy Hooks
- Create hook, copy URL to admin UI environment variable
- Manual trigger or automatic via NestJS webhook after publish

---

## Problem Statement

Love Days currently uses static Next.js export on Cloudflare Pages with hardcoded song data in `packages/utils/src/songs.ts`. Need backend system for:

- Admin UI for non-technical users to upload/manage songs & images
- Weekly/monthly content updates without code deployments
- Learn NestJS architecture properly with production-grade patterns

**Constraints:**

- Keep Cloudflare Pages for frontend (free, fast CDN)
- Willing to host Node.js backend server
- Must integrate with existing Supabase Storage & PostgreSQL

---

## Requirements

### Functional

- CRUD operations for songs (title, artist, album art, audio file)
- CRUD operations for images (profile photos, backgrounds)
- File upload handling (audio files up to 50MB, images up to 5MB)
- Admin authentication & authorization
- Content preview before publishing

### Non-Functional

- Simple deployment workflow
- Cost-effective ($0-10/month)
- TypeScript monorepo with shared types
- Consistent UI (shadcn/ui design system)
- Scalable architecture for future features

---

## Evaluated Approaches

### Option 1: NestJS Monorepo ✅ **CHOSEN**

**Architecture:**

```
apps/
├── web/              # Next.js static export (Cloudflare Pages)
├── api/              # NestJS backend (Render/Railway)
└── admin/            # Optional: Separate admin app OR /admin routes in web
packages/
├── types/            # Shared TypeScript interfaces (ISong, IImage, DTOs)
├── utils/            # Shared utilities + API client
└── config/           # Shared env validation schemas
```

**Pros:**

- Full control over backend & admin UI
- TypeScript everywhere, shared types prevent API/frontend drift
- NestJS modular architecture scales well
- Reuse Supabase infrastructure (storage + DB)
- Excellent learning experience for backend patterns
- Clean separation of concerns

**Cons:**

- Highest dev time (2-3 weeks for MVP)
- More deployment complexity (2 services)
- Need to build/configure admin UI

**Verdict:** Best for learning NestJS properly with production-grade architecture.

---

### Option 2: Headless CMS (Directus/Strapi)

**Pros:** Admin UI out-of-box, 2-3 days to production
**Cons:** Less control, vendor lock-in, minimal learning value
**Verdict:** Rejected - prioritizing learning over speed.

---

### Option 3: Next.js API Routes Only

**Deployment Impact on Cloudflare Pages:**

**Choice A: Cloudflare Pages + SSR**

- Requires `@cloudflare/next-on-pages` adapter
- API routes run on Cloudflare Workers (edge runtime)
- **Limitations:** No full Node.js APIs, edge-compatible packages only
- **Works:** Supabase (edge-compatible ✅), file uploads via fetch API ✅
- **Breaks:** Some npm packages, complex business logic

**Choice B: Switch to Vercel**

- Full Node.js support for API routes
- Simpler dev experience
- **Cost:** Free tier generous

**Verdict:** Rejected - loses static export benefits, less structured than NestJS for learning.

---

## Deployment Strategy Analysis

### Vercel NestJS (Serverless)

**How it works:**

- NestJS runs as Vercel Serverless Functions (not traditional server)
- Requires `vercel.json` configuration
- Each request handled by isolated function instance

**Limitations:**

- ❌ Cold starts (first request after idle is slow)
- ❌ Function timeouts (10s hobby, 60s pro)
- ❌ No WebSockets or long-running processes
- ❌ Session management needs Redis (can't use in-memory)
- ❌ Import aliases problematic
- ❌ Not representative of production NestJS deployment

**Good for:** Small APIs tightly coupled to Next.js frontend
**Bad for:** Learning traditional NestJS server architecture

**Sources:**

- [NestJS on Vercel](https://vercel.com/docs/frameworks/backend/nestjs)
- [Lessons Learned: Hosting NestJS on Vercel](https://nerd-corner.com/lessons-learned-hosting-nestjs-app-on-vercel/)

---

### Render / Railway (Traditional Server) ✅ **RECOMMENDED**

**How it works:**

- NestJS runs as long-lived Node.js process
- Docker container deployment (auto-managed)
- Traditional HTTP server with WebSocket support

**Render Free Tier:**

- 750 hours/month (enough for 1 always-on service)
- Sleeps after 15 min inactivity (30s cold start)
- Auto-wakes on request
- $0/month forever

**Railway Pricing:**

- $5/month hobby plan (was free first month only)
- No sleep, always-on
- Better DX, instant deploys

**Pros:**

- ✅ Full Node.js environment (learn NestJS properly)
- ✅ WebSockets, background jobs, cron tasks supported
- ✅ Traditional request/response cycle (no cold start masking)
- ✅ Simple Git-based deployment
- ✅ Environment variables, logs, metrics included

**Verdict:** **Render free tier** best for learning (true NestJS experience, $0 cost). Accept 30s cold start trade-off for weekly/monthly admin usage.

---

## Chosen Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js Static Export)                            │
│ - Cloudflare Pages (free, global CDN)                       │
│ - ISR/SSG build fetches song data from NestJS API           │
│ - Client-side dynamic fetches for real-time updates         │
│ - No API routes needed                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTPS + CORS
                         │
┌────────────────────────▼────────────────────────────────────┐
│ BACKEND (NestJS)                                            │
│ - Render free tier (traditional Node.js server)            │
│ - RESTful API: /api/v1/songs, /api/v1/images               │
│ - Connects to Supabase PostgreSQL + Storage                │
│ - JWT auth validation via Supabase tokens                  │
│ - File upload handling (multipart/form-data)               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ ADMIN UI                                                     │
│ - shadcn-based Next.js dashboard (reuse web app base)      │
│ - Protected routes with Supabase Auth                      │
│ - File upload forms with drag-and-drop                     │
│ - Real-time preview before publish                         │
└──────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ SUPABASE (Existing)                                         │
│ - PostgreSQL: songs, images metadata tables                │
│ - Storage: /songs bucket, /images bucket                   │
│ - Auth: Admin user authentication                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend (NestJS)

- **Framework:** NestJS 10.x
- **ORM:** TypeORM or Prisma (Prisma recommended for better DX)
- **Database:** Supabase PostgreSQL
- **Storage:** `@supabase/supabase-js` client
- **Auth:** Supabase JWT validation via `@supabase/supabase-js`
- **Validation:** `class-validator` + `class-transformer`
- **File Upload:** `multer` or `fastify-multipart`
- **API Docs:** Swagger/OpenAPI via `@nestjs/swagger`

### Admin UI (shadcn Template)

**Recommended: [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)**

**Why this template:**

- ✅ Next.js 16 App Router (matches your current setup)
- ✅ React 19 (latest)
- ✅ shadcn/ui components (consistent with your existing UI)
- ✅ TypeScript + Tailwind CSS (same stack)
- ✅ Authentication scaffolding (swap Clerk with Supabase Auth)
- ✅ Data tables, forms, charts pre-built
- ✅ Active maintenance (last updated Dec 2024)

**Alternatives:**

- [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) - Vite-based (lighter, faster builds)
- [Vercel's Official Template](https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard) - Includes Postgres + Auth
- [Shadcnblocks Admin](https://www.shadcnblocks.com/admin-dashboard) - Premium, $49 (complex data tables)

**Sources:**

- [shadcn Admin Templates](https://www.shadcn.io/template/category/dashboard)
- [Next.js Shadcn Dashboard Starters](https://github.com/topics/shadcn-ui-admin)

### Monorepo (Turborepo)

- Keep existing Turborepo setup
- Add `apps/api/` for NestJS
- Add `packages/types/` for shared interfaces
- Turborepo task dependencies: `api:build` → `web:build`

### Deployment

- **Frontend:** Cloudflare Pages (existing setup, $0)
- **Backend:** Render free tier ($0, 30s cold start acceptable)
- **Database:** Supabase free tier (existing, $0)
- **Total Cost:** $0/month (upgrade to Railway $5/mo if need always-on)

---

## Database Schema

### Songs Table

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration INTEGER, -- seconds
  file_path VARCHAR(500) NOT NULL, -- Supabase Storage path
  file_size INTEGER, -- bytes
  thumbnail_path VARCHAR(500), -- album art
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
  category VARCHAR(50), -- 'profile', 'background', 'gallery'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

CREATE INDEX idx_images_category ON images(category, published);
```

---

## API Design

### Endpoints

**Songs API:**

```
GET    /api/v1/songs              - List published songs (public)
GET    /api/v1/songs/:id          - Get song details (public)
POST   /api/v1/songs              - Create song (admin, multipart)
PATCH  /api/v1/songs/:id          - Update song metadata (admin)
DELETE /api/v1/songs/:id          - Delete song (admin)
POST   /api/v1/songs/:id/publish  - Publish song (admin)
```

**Images API:**

```
GET    /api/v1/images             - List images (query: ?category=profile)
GET    /api/v1/images/:id         - Get image details
POST   /api/v1/images             - Upload image (admin, multipart)
PATCH  /api/v1/images/:id         - Update image metadata (admin)
DELETE /api/v1/images/:id         - Delete image (admin)
```

### DTOs (Shared via `packages/types/`)

```typescript
// packages/types/src/song.dto.ts
export interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  file: File; // multipart upload
  thumbnail?: File;
}

export interface SongResponseDto {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  fileUrl: string; // Supabase public URL
  thumbnailUrl?: string;
  createdAt: string;
  published: boolean;
}
```

---

## Authentication Strategy

### Supabase Auth Integration

**Flow:**

1. Admin logs in via Supabase Auth (email/password or OAuth)
2. Supabase returns JWT access token
3. Admin UI includes token in `Authorization: Bearer <token>` header
4. NestJS validates token via Supabase Admin SDK

**NestJS Implementation:**

```typescript
// apps/api/src/auth/supabase-auth.guard.ts
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException();

    request.user = data.user;
    return true;
  }
}
```

**Protected Routes:**

```typescript
@Post()
@UseGuards(SupabaseAuthGuard)
async createSong(@Body() dto: CreateSongDto) {
  // Only authenticated admins can create
}
```

---

## File Upload Strategy

### Process Flow

1. **Admin uploads file** via form (drag-and-drop UI)
2. **NestJS receives** multipart/form-data request
3. **Validation:** Check file type, size, metadata
4. **Upload to Supabase Storage:** Using `supabase.storage.from('songs').upload()`
5. **Save metadata to PostgreSQL:** Store file path, size, etc.
6. **Return response:** Include Supabase public URL

### NestJS Service

```typescript
// apps/api/src/songs/songs.service.ts
async createSong(dto: CreateSongDto, file: Express.Multer.File) {
  // Upload to Supabase Storage
  const fileName = `${Date.now()}-${file.originalname}`;
  const { data, error } = await this.supabase.storage
    .from('songs')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
    });

  if (error) throw new InternalServerErrorException('Upload failed');

  // Save metadata to PostgreSQL
  const song = await this.prisma.song.create({
    data: {
      title: dto.title,
      artist: dto.artist,
      filePath: data.path,
      fileSize: file.size,
    },
  });

  return song;
}
```

---

## Implementation Phases

### Phase 1: NestJS Backend Foundation (Week 1)

**Goal:** Deploy working NestJS API to Vercel with Supabase integration

**Tasks:**

- [ ] Create `apps/api/` NestJS app with Express adapter in monorepo
- [ ] Configure `vercel.json` for serverless deployment
- [ ] Set up Prisma with Supabase PostgreSQL connection
- [ ] Define database schema (songs, images tables) & run migrations
- [ ] Create `packages/types/` for shared DTOs (ISong, IImage, etc.)
- [ ] Implement Songs module (CRUD metadata only, no file upload)
- [ ] Implement Images module (CRUD metadata only, no file upload)
- [ ] Add Supabase Auth JWT validation guard
- [ ] Configure CORS for Cloudflare Pages + admin UI domains
- [ ] Set up Swagger API docs at `/api/docs`
- [ ] Deploy to Vercel (test serverless deployment)
- [ ] Test API endpoints with Postman/Thunder Client

**Deliverable:** Working REST API with Swagger docs deployed on Vercel

**Verification:**

- ✅ API accessible at `https://love-days-api.vercel.app`
- ✅ Swagger docs viewable at `/api/docs`
- ✅ GET /api/v1/songs returns empty array (database connected)
- ✅ POST /api/v1/songs protected by auth (401 without JWT)

---

### Phase 2: Presigned URL File Upload (Week 2)

**Goal:** Implement Supabase presigned URL pattern for file uploads

**Tasks:**

- [ ] Add Supabase Storage client to NestJS (`@supabase/supabase-js`)
- [ ] Implement presigned URL generation endpoints:
  - [ ] `POST /api/v1/songs/upload-url` (returns Supabase signed upload URL)
  - [ ] `POST /api/v1/images/upload-url`
- [ ] Add file metadata validation (type, size limits)
- [ ] Update Songs CRUD to include `filePath` from presigned upload
- [ ] Update Images CRUD with `filePath` and optional Sharp thumbnail generation
- [ ] Test presigned URL flow with curl/Postman:
  1. Get presigned URL from API
  2. Upload file directly to Supabase
  3. Save metadata via API with filePath
- [ ] Verify files accessible via Supabase public URLs

**Deliverable:** API supports 50MB+ file uploads via presigned URLs

**Verification:**

- ✅ Can generate presigned upload URL
- ✅ Can upload 50MB MP3 file directly to Supabase
- ✅ File accessible at Supabase public URL
- ✅ Metadata saved in PostgreSQL with correct filePath

---

### Phase 3: Admin UI with shadcn Dashboard (Week 3)

**Goal:** Build separate admin app for content management

**Tasks:**

- [ ] Fork `Kiranism/next-shadcn-dashboard-starter` to `apps/admin/`
- [ ] Replace Clerk auth with Supabase Auth (email/password login)
- [ ] Set up environment variables (Supabase + NestJS API URL)
- [ ] Build Songs management page:
  - [ ] List all songs (data table with sort/filter)
  - [ ] Create song form (title, artist, album, file upload)
  - [ ] Edit song metadata
  - [ ] Delete song (with confirmation modal)
  - [ ] Publish/unpublish toggle
  - [ ] Audio preview player
- [ ] Build Images management page:
  - [ ] List images by category (profile, background, gallery)
  - [ ] Upload image with drag-and-drop UI
  - [ ] Auto-generate thumbnails (Sharp on client-side or API call)
  - [ ] Edit image metadata (title, description, category)
  - [ ] Delete image
  - [ ] Image preview lightbox
- [ ] Implement presigned URL upload flow in UI:
  1. Request upload URL from API
  2. Upload file to Supabase with progress bar
  3. Submit metadata to API on success
- [ ] Add "Rebuild Site" button (triggers Cloudflare webhook)
- [ ] Style to match Love Days theme (350 hue rose pink color scheme)
- [ ] Deploy admin to Vercel as separate app

**Deliverable:** Working admin dashboard deployed on Vercel

**Verification:**

- ✅ Admin accessible at `https://love-days-admin.vercel.app`
- ✅ Supabase Auth login/logout works
- ✅ Can upload song (50MB MP3) with metadata
- ✅ Can view/edit/delete songs
- ✅ Upload shows progress bar, handles errors gracefully
- ✅ "Rebuild Site" button triggers Cloudflare webhook

---

### Phase 4: Frontend Integration & Webhooks (Week 3-4)

**Goal:** Connect frontend to NestJS API and enable webhook rebuilds

**Tasks:**

- [ ] Update `packages/utils/songs.ts` to fetch from NestJS API
- [ ] Add API client helper in `packages/utils/` (fetch wrapper with types)
- [ ] Update Next.js static build to fetch data at build time:
  - [ ] `getStaticProps` calls NestJS API for songs/images
  - [ ] Filter only `published: true` items
- [ ] Test static export build locally with API data
- [ ] Set up Cloudflare Pages deploy hook:
  - [ ] Cloudflare: Settings → Build & Deployments → Deploy Hooks
  - [ ] Copy webhook URL to admin UI `.env`
- [ ] Implement webhook trigger in admin UI
- [ ] Deploy frontend to Cloudflare Pages
- [ ] End-to-end testing:
  1. Admin uploads song → Published
  2. Admin clicks "Rebuild Site"
  3. Cloudflare rebuilds (2 min wait)
  4. Verify song appears on live frontend

**Deliverable:** Full workflow from admin upload to frontend display

**Verification:**

- ✅ Frontend fetches data from NestJS API at build time
- ✅ Static export includes latest published songs/images
- ✅ Admin can trigger Cloudflare rebuild via webhook
- ✅ Rebuild completes within 5 minutes
- ✅ New content appears on live site after rebuild
- ✅ No CORS errors in browser console

---

## Development Workflow

### Local Development

```bash
# Terminal 1: Run NestJS backend
cd apps/api
npm run dev  # Runs on http://localhost:3001

# Terminal 2: Run Next.js frontend
cd apps/web
npm run dev  # Runs on http://localhost:3000

# Terminal 3: Run admin dashboard (if separate app)
cd apps/admin
npm run dev  # Runs on http://localhost:3002
```

### Deployment Workflow

**Backend (NestJS → Vercel):**

1. Push to GitHub `main` branch
2. Vercel auto-deploys from GitHub (serverless functions)
3. Runs `vercel build` using `vercel.json` config
4. Live at `https://love-days-api.vercel.app`
5. Serverless functions cold start on first request after idle

**Admin UI (Next.js → Vercel):**

1. Push to GitHub `main` branch or `admin` branch
2. Vercel auto-deploys from GitHub
3. Runs `next build` (standard Next.js build)
4. Live at `https://love-days-admin.vercel.app`

**Frontend (Next.js Static → Cloudflare Pages):**

1. Push to GitHub `main` branch OR trigger webhook manually
2. Cloudflare Pages auto-deploys
3. Runs `npm run build` (static export)
4. Live at `https://love-days.pages.dev`
5. Manual rebuild via webhook when content updates

---

## Risk Considerations

### Technical Risks

**Vercel Serverless Cold Starts:**

- **Risk:** 3-5s cold start on first request after idle (hobby plan)
- **Mitigation:** Acceptable for admin usage (weekly/monthly). Show loading state in admin UI. Vercel Pro ($20/mo) reduces cold starts if needed.
- **Note:** Educational benefit - learn serverless architecture patterns

**Vercel Request Body Size Limits:**

- **Risk:** 4.5MB limit (hobby), 50MB audio files won't upload through API
- **Mitigation:** ✅ **Using presigned URL pattern** - files upload directly to Supabase, bypassing Vercel completely
- **Benefit:** Actually better architecture (faster uploads, CDN direct)

**Vercel Function Timeout:**

- **Risk:** 10s timeout (hobby), 60s (pro) for function execution
- **Mitigation:** Presigned URL pattern means NestJS only generates URLs (fast operation). No timeout risk for actual file uploads.

**CORS Configuration:**

- **Risk:** Cloudflare Pages + Admin UI → Vercel API cross-origin blocked
- **Mitigation:** Configure NestJS CORS to allow both domains:
  ```typescript
  app.enableCors({
    origin: [
      "https://love-days.pages.dev", // Public frontend
      "https://love-days-admin.vercel.app", // Admin UI
      "http://localhost:3000", // Local dev
    ],
    credentials: true,
  });
  ```

**Serverless State Management:**

- **Risk:** Can't use in-memory sessions (each request = new function instance)
- **Mitigation:** ✅ Using stateless JWT tokens from Supabase Auth. No session storage needed.

**Database Migration Coordination:**

- **Risk:** Schema changes require coordinated deployment
- **Mitigation:** Use Prisma migrations, version control schema. Deploy backend first, then frontend.

### Operational Risks

**Supabase Free Tier Limits:**

- **Current:** 500MB database, 1GB storage
- **Risk:** Exceeding limits if many large audio files
- **Mitigation:** Monitor storage usage. Upgrade to Supabase Pro ($25/mo) if needed. Compress audio files (MP3 128kbps).

**Learning Curve:**

- **Risk:** NestJS unfamiliar, slower development initially
- **Mitigation:** Follow official NestJS docs, use `nest generate` CLI for scaffolding. Budget extra time for learning.

---

## Success Metrics

**Development Success:**

- [ ] NestJS API deployed on Render with 99% uptime (free tier)
- [ ] Admin can upload song in <2 minutes (including 30s cold start)
- [ ] File upload supports 50MB audio files without timeout
- [ ] API response time <500ms for list operations (warm state)
- [ ] Zero CORS errors in production

**User Experience:**

- [ ] Non-technical admin can manage content without developer help
- [ ] Admin UI matches Love Days theme consistency
- [ ] Frontend updates within 5 minutes of admin publish action
- [ ] Mobile-responsive admin dashboard (shadcn/ui handles this)

**Architecture Quality:**

- [ ] Shared types prevent frontend/backend API drift
- [ ] NestJS follows modular design (separate modules for Songs, Images, Auth)
- [ ] 80%+ test coverage on NestJS business logic (unit + e2e tests)
- [ ] API documented via Swagger at `/api/docs`

---

## Next Steps

### Immediate Actions (This Week)

1. **Research shadcn admin template deeper:**

   - Fork Kiranism template
   - Review authentication flow (Clerk → Supabase swap)
   - Identify components needed (file upload, data tables)

2. **Set up Render account:**

   - Create free account
   - Link GitHub repository
   - Test deployment with basic NestJS app

3. **Database schema refinement:**
   - Review Supabase PostgreSQL current state
   - Design migrations for Songs & Images tables
   - Plan row-level security policies (if using Supabase RLS)

### Phase 1 Kickoff (Week 1)

1. **Create NestJS app in monorepo:**

   ```bash
   cd apps/
   npx @nestjs/cli new api
   ```

2. **Set up Prisma:**

   ```bash
   cd apps/api
   npm install prisma @prisma/client
   npx prisma init
   ```

3. **Define shared types package:**

   ```bash
   mkdir -p packages/types/src
   # Create ISong, IImage, DTOs
   ```

4. **First deployment to Render:**
   - Push initial NestJS app
   - Verify deployment works
   - Test /health endpoint

---

## Unresolved Questions

1. **Admin UI deployment:** Should admin live at `/admin` routes in main Next.js app (requires switching from static export) OR as completely separate app?

   - **Recommendation:** Separate app initially for clean separation. Can consolidate later if needed.

2. **Image thumbnail generation:** Should NestJS auto-generate thumbnails for uploaded images using Sharp library, or rely on admin to upload pre-sized images?

   - **Recommendation:** Auto-generate using Sharp for better UX. Add to Phase 2.

3. **Webhook for frontend rebuild:** When admin publishes song, should NestJS trigger Cloudflare Pages rebuild via webhook, or rely on ISR/scheduled rebuilds?

   - **Recommendation:** Start with manual rebuild trigger in admin UI. Add webhook automation in Phase 4 if needed.

4. **Audio file transcoding:** Should backend transcode uploaded audio to standardized format (MP3 128kbps) for consistency, or accept as-is?

   - **Recommendation:** Accept as-is initially. Add transcoding in future phase if quality inconsistencies emerge.

5. **Caching strategy:** Should NestJS implement response caching (Redis) for GET /songs endpoint, or rely on Cloudflare CDN caching?
   - **Recommendation:** Cloudflare CDN caching sufficient for static content. Skip Redis initially (YAGNI).

---

## Sources

**shadcn Admin Templates:**

- [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin)
- [Vercel's Next.js & shadcn/ui Admin Dashboard](https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard)
- [shadcn/ui Dashboard Examples](https://ui.shadcn.com/examples/dashboard)

**NestJS Deployment:**

- [NestJS on Vercel - Official Docs](https://vercel.com/docs/frameworks/backend/nestjs)
- [Lessons Learned: Hosting NestJS on Vercel](https://nerd-corner.com/lessons-learned-hosting-nestjs-app-on-vercel/)
- [Deploying NestJS with Vercel and Supabase](https://dev.to/abayomijohn273/deploying-nestjs-application-using-vercel-and-supabase-3n7m)

---

**END OF BRAINSTORM REPORT**
