# Phase 1: NestJS Backend Foundation - Implementation Report

**Date**: 2025-12-29
**Status**: COMPLETE ✅
**Duration**: Week 1
**Deployment Target**: Vercel (Serverless)

---

## Executive Summary

Phase 1 successfully establishes a production-ready NestJS backend deployed on Vercel with Supabase PostgreSQL integration. The API implements metadata CRUD operations for songs and images with Supabase JWT authentication, Prisma ORM with PostgreSQL adapter, and Swagger documentation.

**Key Achievements:**

- ✅ NestJS monorepo integration complete
- ✅ Prisma 7 + PostgreSQL adapter configured
- ✅ Songs & Images modules with CRUD endpoints
- ✅ Supabase JWT authentication guard
- ✅ Vercel serverless deployment configuration
- ✅ Swagger API documentation at `/api/docs`
- ✅ CORS configured for multi-domain access
- ✅ Shared TypeScript types package (`@love-days/types`)

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE PAGES (Next.js Static Export)                    │
│ - love-days.pages.dev                                       │
│ - Fetches data from NestJS API at build time               │
└────────────────────┬────────────────────────────────────────┘
                     │
                HTTPS + CORS
                     │
┌────────────────────▼────────────────────────────────────────┐
│ VERCEL SERVERLESS (NestJS API)                              │
│ - love-days-api.vercel.app                                  │
│ - Express adapter (Serverless Functions)                    │
│ - Port 3001 (local development)                             │
│ - Swagger docs at /api/docs                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
            (Database + File Storage)
                     │
┌────────────────────▼────────────────────────────────────────┐
│ SUPABASE (PostgreSQL + Storage)                             │
│ - songs table (metadata)                                    │
│ - images table (metadata)                                   │
│ - Auth: JWT token validation                                │
│ - Storage: Presigned URLs (Phase 2)                        │
└──────────────────────────────────────────────────────────────┘
```

### Deployment Flow

```
Git Commit → GitHub → Vercel → Vercel Functions → Supabase
  (Local)      (Push)    (Auto-deploy)  (NestJS)    (Database)
                                ↓
                        Live at love-days-api.vercel.app
                        Swagger: /api/docs
```

---

## Implementation Details

### 1. Monorepo Structure

#### Added to Root Workspace

**File**: `/package.json`

- Added `apps/api` and `packages/types` to workspaces array
- Dependencies: `@types/node`, `typescript`, `prettier`, etc.

**File**: `/turbo.json`

- Build task configuration for `api:build`
- Dev task configuration for `api:dev`
- Task dependencies: `api:build` runs before `web:build`

#### NestJS Application

**Structure**:

```
apps/api/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # Health check endpoint
│   ├── app.service.ts                   # Basic service
│   ├── auth/                            # Authentication
│   │   ├── auth.guard.ts               # Supabase JWT guard
│   │   ├── auth.service.ts             # Token validation
│   │   ├── auth.module.ts              # Auth module
│   ├── songs/                           # Songs feature
│   │   ├── songs.controller.ts         # API endpoints
│   │   ├── songs.service.ts            # Business logic
│   │   ├── songs.module.ts             # Module config
│   │   └── dto/
│   │       ├── create-song.dto.ts      # Create DTO
│   │       └── update-song.dto.ts      # Update DTO
│   ├── images/                          # Images feature
│   │   ├── images.controller.ts        # API endpoints
│   │   ├── images.service.ts           # Business logic
│   │   ├── images.module.ts            # Module config
│   │   └── dto/
│   │       ├── create-image.dto.ts     # Create DTO
│   │       └── update-image.dto.ts     # Update DTO
│   ├── prisma/                          # Database layer
│   │   ├── prisma.service.ts           # Prisma client
│   │   └── prisma.module.ts            # Prisma module
│   └── common/
│       └── interfaces/
│           └── request-with-user.interface.ts  # Type definitions
├── prisma/
│   ├── schema.prisma                    # Database schema
│   └── migrations/                      # Database migrations
├── test/                                # E2E tests
├── vercel.json                          # Vercel config
├── .env.sample                          # Environment template
├── nest-cli.json                        # NestJS CLI config
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies
└── README.md                            # API documentation
```

### 2. Prisma Configuration

**File**: `/apps/api/prisma/schema.prisma`

#### Database Provider

- **Provider**: PostgreSQL
- **Adapter**: `@prisma/adapter-pg` (Prisma 7 native adapter)
- **Connection**: Supabase connection pooler

#### Database Models

**Song Model**:

```prisma
model Song {
  id            String   @id @default(uuid())
  title         String   @db.VarChar(255)
  artist        String   @db.VarChar(255)
  album         String?  @db.VarChar(255)
  duration      Int?
  filePath      String   @map("file_path") @db.VarChar(500)
  fileSize      Int?     @map("file_size")
  thumbnailPath String?  @map("thumbnail_path") @db.VarChar(500)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  published     Boolean  @default(false)

  @@index([published])
  @@map("songs")
}
```

**Image Model**:

```prisma
model Image {
  id          String   @id @default(uuid())
  title       String   @db.VarChar(255)
  description String?  @db.Text
  filePath    String   @map("file_path") @db.VarChar(500)
  fileSize    Int?     @map("file_size")
  width       Int?
  height      Int?
  category    String   @db.VarChar(50)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  published   Boolean  @default(false)

  @@index([category, published])
  @@map("images")
}
```

### 3. Shared Types Package

**Location**: `packages/types/src/`

**Song Types** (`song.ts`):

```typescript
export interface ISong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath: string;
  fileSize?: number;
  thumbnailPath?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  filePath: string;
  fileSize?: number;
  thumbnailPath?: string;
}

export interface UpdateSongDto {
  title?: string;
  artist?: string;
  album?: string;
  thumbnailPath?: string;
}

export interface SongResponseDto extends ISong {
  fileUrl: string;
  thumbnailUrl?: string;
}
```

**Image Types** (`image.ts`):

```typescript
export interface IImage {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize?: number;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CreateImageDto {
  title: string;
  description?: string;
  filePath: string;
  fileSize?: number;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
}

export interface UpdateImageDto {
  title?: string;
  description?: string;
  category?: "profile" | "background" | "gallery";
}

export interface ImageResponseDto extends IImage {
  fileUrl: string;
}
```

### 4. API Endpoints

#### Songs Endpoints

| Method | Endpoint                    | Auth   | Purpose              |
| ------ | --------------------------- | ------ | -------------------- |
| GET    | `/api/v1/songs`             | Public | List published songs |
| GET    | `/api/v1/songs/:id`         | Public | Get song details     |
| POST   | `/api/v1/songs`             | Admin  | Create song metadata |
| PATCH  | `/api/v1/songs/:id`         | Admin  | Update song metadata |
| DELETE | `/api/v1/songs/:id`         | Admin  | Delete song          |
| POST   | `/api/v1/songs/:id/publish` | Admin  | Publish/unpublish    |

**Example Request** (Create Song):

```bash
curl -X POST http://localhost:3001/api/v1/songs \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "filePath": "songs/123-song.mp3",
    "fileSize": 5242880
  }'
```

**Example Response**:

```json
{
  "id": "uuid-string",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "filePath": "songs/123-song.mp3",
  "fileSize": 5242880,
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/123-song.mp3",
  "createdAt": "2025-12-29T10:00:00Z",
  "updatedAt": "2025-12-29T10:00:00Z",
  "published": false
}
```

#### Images Endpoints

| Method | Endpoint             | Auth   | Purpose                                |
| ------ | -------------------- | ------ | -------------------------------------- |
| GET    | `/api/v1/images`     | Public | List images (query: ?category=profile) |
| GET    | `/api/v1/images/:id` | Public | Get image details                      |
| POST   | `/api/v1/images`     | Admin  | Create image metadata                  |
| PATCH  | `/api/v1/images/:id` | Admin  | Update image metadata                  |
| DELETE | `/api/v1/images/:id` | Admin  | Delete image                           |

### 5. Authentication

#### Supabase JWT Guard

**File**: `apps/api/src/auth/auth.guard.ts`

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header",
      );
    }

    const token = authHeader.split(" ")[1];
    const user = await this.authService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    request.user = user;
    return true;
  }
}
```

#### Usage in Controllers

```typescript
@Post()
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create song (admin only)' })
create(@Body() dto: CreateSongDto) {
  return this.songsService.create(dto);
}
```

**Token Validation Flow**:

1. Admin sends request with `Authorization: Bearer <jwt-token>` header
2. Guard extracts token from header
3. AuthService validates token with Supabase
4. If valid: User object attached to request, endpoint executes
5. If invalid: Returns 401 Unauthorized

### 6. Vercel Deployment Configuration

**File**: `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
  ]
}
```

**Deployment Process**:

1. Push to GitHub
2. Vercel detects changes in `apps/api`
3. Runs `npm run vercel-build` (defined in `package.json`)
4. Generates Prisma client and builds NestJS
5. Packages `dist/main.js` as serverless function
6. Deploys to Vercel edge network

### 7. CORS Configuration

**File**: `apps/api/src/main.ts`

```typescript
app.enableCors({
  origin: [
    "https://love-days.pages.dev", // Public frontend
    "https://love-days-admin.vercel.app", // Admin UI (Phase 3)
    "http://localhost:3000", // Local dev (web)
    "http://localhost:3002", // Local dev (admin)
  ],
  credentials: true,
});
```

**Allowed Domains**:

- Production frontend: Cloudflare Pages
- Production admin: Vercel (future)
- Local development: Both web and admin apps

### 8. Swagger Documentation

**Enabled at**: `http://localhost:3001/api/docs` (local) / `https://love-days-api.vercel.app/api/docs` (production)

**Configuration**:

```typescript
const config = new DocumentBuilder()
  .setTitle("Love Days API")
  .setDescription("Backend API for songs and images management")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

**Features**:

- Interactive API explorer
- Bearer token authentication
- Request/response examples
- Parameter documentation
- Live testing endpoint

---

## Environment Configuration

### `.env.sample` Template

```bash
# Server configuration
PORT=3001

# Database configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase configuration
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_KEY="[your-service-key]"
```

### Setup Instructions

1. **Copy environment template**:

   ```bash
   cp apps/api/.env.sample apps/api/.env.local
   ```

2. **Add Supabase credentials**:

   - Get `DATABASE_URL` from Supabase Project Settings → Database
   - Get `DIRECT_URL` from Supabase Project Settings → Database (direct connection)
   - Get `SUPABASE_URL` from Supabase Project Settings → API
   - Get `SUPABASE_SERVICE_KEY` from Supabase Project Settings → API → Service Role Secret Key

3. **Verify database connection**:
   ```bash
   cd apps/api
   npx prisma db push  # Create tables from schema
   npx prisma studio   # View database GUI
   ```

---

## Dependencies

### Production Dependencies

| Package                    | Version                   | Purpose                       |
| -------------------------- | ------------------------- | ----------------------------- |
| `@nestjs/common`           | ^11.0.1                   | Core NestJS framework         |
| `@nestjs/core`             | ^11.0.1                   | NestJS core utilities         |
| `@nestjs/platform-express` | ^11.1.10                  | Express HTTP adapter          |
| `@nestjs/swagger`          | ^11.2.3                   | Swagger/OpenAPI documentation |
| `@love-days/types`         | file:../../packages/types | Shared TypeScript types       |
| `@prisma/client`           | ^7.2.0                    | Prisma ORM client             |
| `@prisma/adapter-pg`       | ^7.2.0                    | PostgreSQL adapter (Prisma 7) |
| `@supabase/supabase-js`    | ^2.89.0                   | Supabase SDK (Phase 2)        |
| `class-validator`          | ^0.14.3                   | DTO validation                |
| `class-transformer`        | ^0.5.1                    | DTO transformation            |
| `express`                  | ^5.2.1                    | HTTP server framework         |
| `pg`                       | ^8.16.3                   | PostgreSQL client             |

### Development Dependencies

- `@nestjs/cli`: NestJS project scaffolding
- `@nestjs/testing`: Testing utilities
- `typescript`: TypeScript compiler
- `prettier`: Code formatting
- `eslint`: Linting

---

## Scripts

### Development

```bash
# Start NestJS in watch mode
npm run dev

# Build NestJS
npm run build

# Start production server
npm run start

# Run TypeScript type checking
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

### Database

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Push schema to database
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Deployment

```bash
# Vercel build command (uses vercel.json)
npm run vercel-build  # runs: prisma generate && nest build
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+ (v22 recommended)
- npm 10+
- PostgreSQL database (Supabase free tier works)

### Step 1: Install Dependencies

```bash
# From root directory
npm install

# Install API dependencies
cd apps/api
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp apps/api/.env.sample apps/api/.env.local

# Edit .env.local with your Supabase credentials
```

### Step 3: Set Up Database

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Create tables in Supabase
npx prisma db push

# (Optional) Seed with test data
npx prisma db seed
```

### Step 4: Start Development Server

```bash
# Terminal 1: Start NestJS API
cd apps/api
npm run dev
# Output: 🚀 API running on http://localhost:3001
# Output: 📚 Swagger docs: http://localhost:3001/api/docs

# Terminal 2: Start Next.js frontend (optional)
cd apps/web
npm run dev
# Output: ▲ Next.js 15.2.1
# Output: - Local: http://localhost:3000
```

### Step 5: Verify Setup

1. **API Health Check**: `curl http://localhost:3001/health`

   - Expected: `{ "status": "ok" }`

2. **Database Connection**: `curl http://localhost:3001/api/v1/songs`

   - Expected: `[]` (empty array, no songs yet)

3. **Swagger Docs**: Open `http://localhost:3001/api/docs` in browser
   - Should display interactive API documentation

---

## Code Standards

### NestJS Architecture

**Module Organization**:

- One module per feature (Songs, Images, Auth, Prisma)
- Services handle business logic
- Controllers handle HTTP requests/responses
- DTOs for request/response validation

**Naming Conventions**:

- Files: `feature.controller.ts`, `feature.service.ts`, `feature.module.ts`
- Classes: `FeatureController`, `FeatureService`, `FeatureModule`
- DTOs: `CreateFeatureDto`, `UpdateFeatureDto`
- Guards: `SupabaseAuthGuard`

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if necessary)
- All public methods documented
- Use interfaces for type definitions

### Testing

- Unit tests: Service business logic
- Integration tests: Controller endpoints
- E2E tests: Full request/response flow
- Minimum 80% coverage for critical paths

---

## Verified Features

### ✅ Functional Requirements Met

- **CRUD Operations**: Songs and Images fully implemented
- **Authentication**: Supabase JWT validation working
- **Database**: Prisma schema synchronized with Supabase PostgreSQL
- **API Documentation**: Swagger UI accessible
- **CORS**: Multi-domain support configured
- **TypeScript**: Strict types, shared `@love-days/types` package

### ✅ Non-Functional Requirements Met

- **Deployment**: Vercel serverless configuration complete
- **Development**: Local server runs on port 3001
- **Validation**: DTOs with class-validator
- **Error Handling**: Standard NestJS exception handling
- **Logging**: Console logging for debugging

### ⏳ Coming in Phase 2

- Presigned URL file upload integration
- Supabase Storage file handling
- Sharp thumbnail generation
- Direct file upload endpoints

---

## Known Limitations & Notes

### Vercel Serverless Characteristics

1. **Cold Starts**: 3-5s on first request after idle (acceptable for admin usage)
2. **Request Timeout**: 10s (hobby) / 60s (pro) - metadata-only operations well within limit
3. **Request Body Size**: 4.5MB limit (hobby) - presigned URL pattern bypasses this
4. **No WebSockets**: Not needed for Phase 1 API
5. **No In-Memory State**: Using stateless JWT tokens (no session storage needed)

### File Upload Strategy (Phase 2)

Currently: Metadata only (filePath pre-provided)
Future: Presigned URLs from Supabase (Phase 2)

---

## Testing the API

### Using cURL

**List Songs**:

```bash
curl http://localhost:3001/api/v1/songs
```

**Get Song by ID**:

```bash
curl http://localhost:3001/api/v1/songs/[uuid]
```

**Create Song (requires token)**:

```bash
curl -X POST http://localhost:3001/api/v1/songs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Song",
    "artist": "My Artist",
    "filePath": "songs/123-mysong.mp3",
    "fileSize": 5242880
  }'
```

### Using Swagger UI

1. Navigate to `http://localhost:3001/api/docs`
2. Click on endpoint to expand
3. For protected endpoints (🔒):
   - Click "Authorize" button (top-right)
   - Paste JWT token from Supabase
   - Click "Try it out" → "Execute"

### Using Thunder Client / Postman

1. Create new request
2. Set method: GET/POST/PATCH/DELETE
3. Set URL: `http://localhost:3001/api/v1/songs`
4. For auth endpoints, add header:
   ```
   Authorization: Bearer <jwt-token>
   ```
5. Send request

---

## Troubleshooting

### Issue: Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solutions**:

1. Check DATABASE_URL in `.env.local`
2. Verify Supabase project credentials
3. Ensure `pgbouncer=true` in connection string (pooler)
4. Check network connectivity

### Issue: Prisma Schema Out of Sync

```
npx prisma db push
```

**Solutions**:

1. Run `npx prisma db push` to sync schema
2. Run `npx prisma generate` to regenerate client
3. Restart development server

### Issue: CORS Errors in Frontend

**Solutions**:

1. Verify origin domain in `main.ts` CORS config
2. Check that `credentials: true` is set
3. Clear browser cache
4. Check Network tab in DevTools for actual error

### Issue: Swagger Docs Not Showing

**Solutions**:

1. Check API is running: `curl http://localhost:3001/health`
2. Verify port 3001 is not blocked
3. Clear browser cache
4. Check console for errors

---

## Next Steps: Phase 2 Preparation

**Phase 2 Focus**: Presigned URL File Upload

1. **Add Supabase Storage integration**:

   - Generate presigned upload URLs
   - Validate file types and sizes
   - Handle upload completion

2. **Implement upload endpoints**:

   - `POST /api/v1/songs/upload-url`
   - `POST /api/v1/images/upload-url`

3. **Add image processing**:

   - Sharp library for thumbnail generation
   - Automatic image optimization

4. **Testing**:
   - Upload 50MB audio file
   - Verify direct Supabase upload
   - Confirm file accessibility

---

## References & Resources

### Official Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel NestJS Deployment](https://vercel.com/docs/frameworks/backend/nestjs)

### Related Documents

- [Project Overview](/docs/PROJECT_OVERVIEW.md)
- [System Architecture](/docs/SYSTEM_ARCHITECTURE.md)
- [Code Standards](/docs/CODE_STANDARDS.md)
- [Brainstorm Report](/plans/reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)

### Tools

- Swagger UI: `http://localhost:3001/api/docs`
- Prisma Studio: `npx prisma studio`
- GitHub Repository: [love-days](https://github.com/kaitovu/love-days)

---

**End of Phase 1 Report**
