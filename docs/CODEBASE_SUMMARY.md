# Love Days - Codebase Summary

**Last Updated**: 2025-12-30
**Documentation Version**: 1.0
**Phase Status**: Phase 04 - Frontend Integration Complete

---

## Quick Navigation

1. [Architecture Overview](#architecture-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Frontend Application](#frontend-application)
4. [Backend Application](#backend-application)
5. [Shared Packages](#shared-packages)
6. [Key Technologies](#key-technologies)
7. [Development Workflow](#development-workflow)
8. [Deployment Strategy](#deployment-strategy)

---

## Architecture Overview

**Love Days** is a full-stack, type-safe web application built as a Turborepo monorepo with:

- **Frontend**: Next.js 15 (React 19) with static export to Cloudflare Pages
- **Backend**: NestJS 11 with PostgreSQL (Supabase) and file storage
- **Shared**: TypeScript utilities and types across apps
- **Storage**: Supabase for audio and image files
- **Deployment**: Vercel (backend), Cloudflare Pages (frontend)

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Build Time (CI/CD)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend Build                                             │
│  └─ app/page.tsx (Server Component)                        │
│     └─ getSongs() from @love-days/utils                   │
│        └─ Fetch from API: GET /api/v1/songs              │
│           └─ Transform API response to ISong[]            │
│              └─ Bake data into static HTML               │
│                 └─ Deploy to Cloudflare Pages            │
│                                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Runtime (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User visits site                                           │
│  └─ Cloudflare serves static HTML with songs              │
│     └─ MusicSidebar renders (client-side)                │
│        └─ Audio player becomes interactive               │
│           └─ All data from static export (no API calls)  │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
love-days/
├── apps/
│   ├── web/                          # Next.js frontend (Phase 04)
│   │   ├── app/                      # App Router
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── page.tsx              # Home page (async server component)
│   │   ├── components/
│   │   │   ├── LoveDays/             # Main feature components
│   │   │   │   ├── Title.tsx         # Main title with hearts
│   │   │   │   ├── ProfileSection.tsx# Profile images & names
│   │   │   │   ├── CountUp.tsx       # Days counter + clock
│   │   │   │   ├── Footer.tsx        # Footer with heart
│   │   │   │   ├── FloatingHearts.tsx# Background animation
│   │   │   │   ├── MusicSidebar.tsx  # Audio player (accepts songs prop)
│   │   │   │   └── index.ts          # Barrel export
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   └── slider.tsx        # Progress/volume slider
│   │   │   └── [Feature]/
│   │   ├── lib/
│   │   │   └── utils.ts              # Utility functions (cn, etc)
│   │   ├── styles/
│   │   │   ├── globals.scss          # Global styles with HSL theme
│   │   │   └── [component].module.scss
│   │   ├── public/                   # Static assets
│   │   ├── .env.sample               # Environment template
│   │   ├── next.config.js            # Next.js configuration
│   │   └── tsconfig.json             # TypeScript config
│   │
│   ├── api/                          # NestJS backend (Phase 01)
│   │   ├── src/
│   │   │   ├── main.ts               # Entry point
│   │   │   ├── app.module.ts         # Root module
│   │   │   ├── songs/                # Songs CRUD module
│   │   │   │   ├── songs.controller.ts
│   │   │   │   ├── songs.service.ts
│   │   │   │   ├── songs.module.ts
│   │   │   │   └── dto/              # Data transfer objects
│   │   │   ├── images/               # Images CRUD module
│   │   │   │   ├── images.controller.ts
│   │   │   │   ├── images.service.ts
│   │   │   │   ├── images.module.ts
│   │   │   │   └── dto/
│   │   │   ├── auth/                 # Supabase JWT validation
│   │   │   │   ├── supabase-auth.guard.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── storage/              # Supabase Storage integration
│   │   │   │   ├── storage.service.ts
│   │   │   │   └── storage.module.ts
│   │   │   ├── prisma/               # Database ORM
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── schema.prisma
│   │   │   ├── config/               # Configuration
│   │   │   │   └── database.config.ts
│   │   │   └── [Feature]/
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── migrations/           # Database migrations
│   │   ├── .env.sample               # Environment template
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── portal/                       # Secondary application
│       └── (similar structure)
│
├── packages/
│   ├── utils/                        # Shared utilities
│   │   ├── src/
│   │   │   ├── index.ts              # Main export
│   │   │   ├── types.ts              # Interfaces (ISong, IImageApiResponse)
│   │   │   ├── api-client.ts         # NEW Phase 04: API client
│   │   │   ├── songs.ts              # Song data + getSongs() hybrid function
│   │   │   ├── date-utils.ts         # Date utilities
│   │   │   └── [util]/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── types/                        # Shared types (future)
│       └── src/
│           ├── index.ts
│           ├── dtos.ts               # Request/response DTOs
│           └── [types]/
│
├── docs/                             # Documentation
│   ├── README.md                     # Documentation index
│   ├── PROJECT_OVERVIEW.md           # Project overview
│   ├── SYSTEM_ARCHITECTURE.md        # Architecture details
│   ├── API_REFERENCE.md              # API documentation
│   ├── CODE_STANDARDS.md             # Code standards
│   ├── PHASE01_*.md                  # Phase 01 docs
│   ├── PHASE02_*.md                  # Phase 02 docs
│   ├── PHASE04_FRONTEND_INTEGRATION.md # NEW Phase 04
│   └── [phase-docs]/
│
├── plans/                            # Project planning
│   ├── reports/                      # Documentation reports
│   └── [planning-docs]/
│
├── .github/
│   └── workflows/                    # CI/CD pipelines
│
├── turbo.json                        # Turborepo config
├── package.json                      # Workspace root
├── pnpm-workspace.yaml               # Workspace config
└── README.md                         # Project README

```

---

## Frontend Application

### Location

`/Users/kaitovu/Desktop/Projects/love-days/apps/web`

### Technology Stack

| Layer         | Technology   | Version | Notes                           |
| ------------- | ------------ | ------- | ------------------------------- |
| Framework     | Next.js      | 15.2.1  | App Router, static export       |
| Language      | TypeScript   | 5.4.2   | Strict mode                     |
| Runtime       | React        | 19.0.0  | Server & client components      |
| Styling       | Tailwind CSS | 3.4.1   | Utility-first, custom HSL theme |
| CSS Processor | Sass         | 1.71.1  | For global styles               |
| Icons         | Lucide React | 0.562.0 | Icon library                    |
| UI Components | shadcn/ui    | -       | Headless components             |
| Build Tool    | Turbopack    | -       | Fast Next.js builds             |

### Key Files & Responsibilities

#### Server Components (No Client-Side Logic)

**app/page.tsx**

- Async server component
- Fetches songs at build time via `getSongs()`
- Passes songs to MusicSidebar as prop
- Composes all page components

**components/LoveDays/Title.tsx**

- Renders main title with decorative hearts
- Static content
- Tailwind styling

**components/LoveDays/ProfileSection.tsx**

- Displays couple profile images and names
- Static content
- Image optimization

**components/LoveDays/Footer.tsx**

- Footer with heart icon
- Static content

#### Client Components (Interactive UI)

**components/LoveDays/CountUp.tsx**

- Days counter with real-time updates
- Clock display
- Client-side calculations
- Animation effects

**components/LoveDays/MusicSidebar.tsx**

- Full-featured audio player
- Accepts `songs: ISong[]` as prop
- Features:
  - Play/pause, skip, shuffle
  - Volume control with mute
  - Progress slider (using shadcn Slider)
  - Repeat modes (off, all, one)
  - Playlist management
  - HTML5 audio element

**components/LoveDays/FloatingHearts.tsx**

- Background animation
- Floating hearts effect
- CSS animations via Tailwind

### Styling System

**Theme (HSL-Based)**

```scss
// styles/globals.scss
--primary: 350 80% 65%; // Rose pink
--background: 350 30% 8%; // Dark background
--foreground: 350 20% 95%; // Light text
--card: 350 20% 10%; // Card backgrounds
--muted: 350 10% 40%; // Muted text
--accent: 350 60% 60%; // Accent color
--border: 350 20% 20%; // Border color
```

**Typography**

- Headings: "Playfair Display" (serif display font)
- Body: system-ui (system fonts)
- UI: ui-sans-serif (clean UI fonts)

**Responsive Breakpoints**

- xs: 320px | sm: 640px | md: 768px | lg: 1024px | xl: 1280px

### Build Output

```
apps/web/
├── out/                         # Static export directory
│   ├── index.html               # Pre-rendered home page
│   ├── _next/                   # Next.js static assets
│   │   ├── static/css/          # Compiled Tailwind
│   │   ├── static/js/           # Client-side JavaScript
│   │   └── data/                # Build-time data (future)
│   └── [other-routes]/
```

### Environment Variables

```bash
# .env.local (required for build)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app
```

---

## Backend Application

### Location

`/Users/kaitovu/Desktop/Projects/love-days/apps/api`

### Technology Stack

| Layer      | Technology       | Version | Notes                     |
| ---------- | ---------------- | ------- | ------------------------- |
| Framework  | NestJS           | 11.0.1  | Modular Node.js framework |
| Language   | TypeScript       | 5.4.2   | Strict mode               |
| Runtime    | Node.js          | 18+     | Serverless compatible     |
| Database   | PostgreSQL       | 15+     | Via Supabase              |
| ORM        | Prisma           | 7.2.0   | Type-safe database access |
| Auth       | Supabase Auth    | -       | JWT token validation      |
| Storage    | Supabase Storage | -       | File hosting              |
| API Docs   | Swagger/OpenAPI  | -       | Interactive documentation |
| Deployment | Vercel           | -       | Serverless functions      |

### Module Structure

#### Core Modules

**app.module.ts**

- Root module
- Imports all feature modules
- Configures global middleware/guards

**prisma/ (Database)**

- `prisma.service.ts`: Database connection
- `schema.prisma`: Database schema definition
- `migrations/`: Database migration files

#### Feature Modules

**songs/** (Songs CRUD)

- `songs.controller.ts`: HTTP endpoints
- `songs.service.ts`: Business logic
- `songs.module.ts`: Module definition
- `dto/`: Request/response DTOs
  - `create-song.dto.ts`
  - `update-song.dto.ts`

**images/** (Images CRUD)

- Similar structure to songs module
- Handles image metadata and file operations

**auth/** (Authentication)

- `supabase-auth.guard.ts`: JWT validation guard
- Protects admin endpoints
- Validates Supabase JWT tokens

**storage/** (File Storage)

- `storage.service.ts`: Supabase Storage integration
- Presigned URL generation
- File upload/delete operations

### Database Schema

**Songs Table**

```typescript
model Song {
  id           String   @id @default(uuid())
  title        String
  artist       String
  album        String?
  duration     Int?     // Duration in seconds
  filePath     String   // Supabase storage path
  fileSize     Int?
  thumbnailPath String?
  published    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Images Table**

```typescript
model Image {
  id          String   @id @default(uuid())
  title       String
  description String?
  filePath    String
  fileSize    Int?
  width       Int?
  height      Int?
  category    String   // "profile" | "background" | "gallery"
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Endpoints

**Songs Endpoints**

- `GET /api/v1/songs` - List published songs (public)
- `GET /api/v1/songs/:id` - Get song by ID (public)
- `POST /api/v1/songs` - Create song (admin)
- `PATCH /api/v1/songs/:id` - Update song (admin)
- `DELETE /api/v1/songs/:id` - Delete song (admin)
- `POST /api/v1/songs/:id/publish` - Publish/unpublish (admin)
- `POST /api/v1/songs/upload-url` - Get presigned URL (admin)

**Images Endpoints**

- `GET /api/v1/images` - List published images (public)
- `GET /api/v1/images/:id` - Get image by ID (public)
- `POST /api/v1/images` - Create image (admin)
- `PATCH /api/v1/images/:id` - Update image (admin)
- `DELETE /api/v1/images/:id` - Delete image (admin)
- `POST /api/v1/images/upload-url` - Get presigned URL (admin)

---

## Shared Packages

### @love-days/utils

**Location**: `/Users/kaitovu/Desktop/Projects/love-days/packages/utils`

**Purpose**: Shared utilities and types used across frontend and backend

**Key Exports**:

```typescript
// Types
export interface ISong { ... }
export interface ISongApiResponse { ... }
export interface IImageApiResponse { ... }

// API Client (NEW Phase 04)
export async function fetchPublishedSongs(): Promise<ISong[]>
export async function fetchPublishedImages(category?: string): Promise<IImageApiResponse[]>

// Song utilities
export async function getSongs(): Promise<ISong[]>      // Hybrid API + fallback
export const staticSongs: ISong[]                       // Static fallback data
export function getSongById(id: string): ISong | undefined

// Date utilities
export function calculateDaysBetween(startDate: Date, endDate: Date): number
export function formatDate(date: Date, format: string): string
```

**Files**:

- `types.ts`: Type definitions (ISong, API responses)
- `api-client.ts` (NEW): API client with timeout handling
- `songs.ts`: Song data and hybrid `getSongs()` function
- `date-utils.ts`: Date utilities for CountUp component
- `index.ts`: Main export file

**Build Output**:

```
packages/utils/
└── dist/
    ├── index.d.ts               # TypeScript declarations
    ├── index.js                 # Compiled JavaScript
    └── [module-files]/
```

---

## Key Technologies

### Next.js 15 (Frontend)

**Static Export Mode**:

- `output: "export"` in next.config.js
- Builds to `out/` directory
- No server runtime needed
- Requires environment variables at build time

**Server vs Client Components**:

- Server components (default): data fetching, backend access
- Client components (`"use client"`): interactivity, browser APIs

**App Router**:

- File-based routing in `app/` directory
- Supports dynamic routes, layouts, error boundaries

### NestJS 11 (Backend)

**Module System**:

- Organized by features
- Each feature has controller, service, module, DTOs
- Dependency injection for testing

**Guards & Decorators**:

- `SupabaseAuthGuard`: Validates JWT tokens
- `@UseGuards(SupabaseAuthGuard)`: Protects routes

**Exception Handling**:

- Custom exceptions extend `HttpException`
- Automatic JSON response formatting

### Turborepo

**Workspace Management**:

- `apps/`: Applications
- `packages/`: Shared libraries
- `npm workspaces` for package management

**Task Caching**:

- `turbo.json` defines task dependencies
- Caches build outputs for fast rebuilds
- Supports local and remote caching

**Commands**:

```bash
npm run dev              # Dev mode for all apps
npm run build            # Build all apps
npm run lint             # Lint all apps
npm run type-check       # Type check all apps
npm run clean            # Clean build artifacts
```

### Supabase

**Authentication**:

- JWT token generation on signup/login
- Token validation on backend via guard
- User context attached to requests

**Storage**:

- Public buckets: `songs/`, `images/`
- Presigned URLs for admin uploads
- Direct file access for public files

**Database**:

- PostgreSQL backend
- Prisma ORM for type-safe access
- Automatic schema migrations

---

## Development Workflow

### Initial Setup

```bash
# 1. Clone and install
git clone <repo>
npm install

# 2. Backend setup
cd apps/api
cp .env.sample .env.local
# Add Supabase credentials and database URL

# 3. Frontend setup
cd apps/web
cp .env.sample .env.local
# Add Supabase and API URL

# 4. Initialize database
cd apps/api
npx prisma migrate dev
npx prisma db seed     # Optional: seed sample data
```

### Local Development

```bash
# Terminal 1: Start all apps (web + api)
npm run dev

# Terminal 2: Watch utils package (optional)
cd packages/utils
npm run dev

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3002
# - API Docs: http://localhost:3002/api/docs
```

### Building

```bash
# Full build
npm run build

# Build specific app
cd apps/web
npm run build

# Check output
ls apps/web/out/      # Static export
```

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix      # Auto-fix

# Formatting
npm run format
npm run format:check
```

### Database Management

```bash
# Create migration
cd apps/api
npx prisma migrate dev --name "feature_name"

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## Deployment Strategy

### Frontend (Cloudflare Pages)

1. **Build Phase** (GitHub Actions):

   - Install dependencies
   - Fetch data from backend API (`getSongs()`)
   - Build static HTML export
   - Songs data baked into HTML

2. **Deploy Phase**:

   - Upload `out/` directory to Cloudflare Pages
   - Enable CDN caching
   - Custom domain via Cloudflare DNS

3. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

### Backend (Vercel Serverless)

1. **Deploy**:

   - Connected to GitHub repository
   - Automatic builds on push to main
   - Serverless functions in `api/` folder

2. **Environment Variables**:

   ```bash
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

3. **Database**:
   - PostgreSQL hosted on Supabase
   - Prisma migrations run during deployment
   - Connection pooling via PgBouncer

---

## Code Standards

### TypeScript

- Strict mode enabled (`strict: true`)
- No implicit `any` types
- Unused imports removed
- Type everything, no hardcoded strings

### Formatting

- Prettier: 100 character line length
- 2 spaces indentation
- Double quotes for strings
- Semicolons required

### File Organization

- Features organized in folders
- Barrel exports (`index.ts`) for clean imports
- Components with co-located styles
- Tests co-located with source

### Naming Conventions

- Components: PascalCase (`MusicSidebar.tsx`)
- Functions/variables: camelCase (`getSongs()`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Types/interfaces: PascalCase with I prefix (`ISong`)
- Database models: PascalCase (`Song`, `Image`)

---

## Performance Considerations

### Frontend

- Static export: No runtime overhead
- Images unoptimized for static export
- Client-side audio playback via HTML5 audio
- Animations via Tailwind CSS

### Backend

- Database connection pooling
- Presigned URLs for direct uploads (no file proxy)
- Efficient query patterns with Prisma
- Serverless cold start optimization

### Caching

- Cloudflare Pages: Static file caching
- Build-time data fetching: No API calls at runtime
- Static songs data: No database round-trips

---

## Troubleshooting

### Build Issues

**"Cannot find module @love-days/utils"**

- Run: `npm run build` in packages/utils first
- Check imports use `@love-days/utils` (not relative paths)

**Environment variables not found**

- Check `.env.local` in both apps/web and apps/api
- Rebuild after updating env vars
- `NEXT_PUBLIC_*` vars must be set at build time

### Runtime Issues

**"API is returning 500 errors"**

- Check backend logs: `npm run dev` in apps/api
- Verify database connection: `npx prisma db execute --stdin`
- Check Supabase configuration

**"Songs not loading on frontend"**

- Verify API URL in build environment
- Check API returns `published: true` songs
- Review build logs for fetch errors

---

## References

- [PHASE04_FRONTEND_INTEGRATION.md](PHASE04_FRONTEND_INTEGRATION.md) - Frontend API integration details
- [API_REFERENCE.md](API_REFERENCE.md) - Complete API documentation
- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) - System design documentation
- [CODE_STANDARDS.md](CODE_STANDARDS.md) - Code standards and conventions
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project overview and roadmap

---

**Codebase Version**: 1.0
**Last Updated**: 2025-12-30
**Phase Status**: Phase 04 Complete - Frontend Integration Achieved
