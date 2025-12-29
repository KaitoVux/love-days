# Phase 1 - Quick Start Guide

**Duration**: 5-10 minutes to get the API running locally
**Status**: COMPLETE ✅ - Backend ready for development

---

## What's New in Phase 1

- ✅ NestJS backend deployed on Vercel Serverless
- ✅ Prisma 7 + PostgreSQL adapter for type-safe database access
- ✅ Songs & Images CRUD metadata endpoints
- ✅ Supabase JWT authentication guard
- ✅ Swagger API documentation at `/api/docs`
- ✅ Shared types package (`@love-days/types`)
- ✅ CORS configured for multi-domain access

---

## Getting Started

### 1. Install Dependencies (30 seconds)

```bash
# From project root
npm install

# From API directory
cd apps/api
npm install
```

### 2. Configure Environment (1 minute)

```bash
# Copy environment template
cp apps/api/.env.sample apps/api/.env.local

# Edit .env.local with your Supabase credentials:
# - DATABASE_URL (from Supabase → Settings → Database)
# - DIRECT_URL (from Supabase → Settings → Database)
# - SUPABASE_URL (from Supabase → Settings → API)
# - SUPABASE_SERVICE_KEY (from Supabase → Settings → API)
```

### 3. Set Up Database (2 minutes)

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Create tables in Supabase
npx prisma db push

# (Optional) Open database GUI
npx prisma studio
```

### 4. Start Development Server (1 minute)

```bash
cd apps/api
npm run dev

# Output:
# 🚀 API running on http://localhost:3001
# 📚 Swagger docs: http://localhost:3001/api/docs
```

### 5. Verify Setup (1 minute)

```bash
# Test API health
curl http://localhost:3001/health
# Expected: { "status": "ok" }

# List songs (empty initially)
curl http://localhost:3001/api/v1/songs
# Expected: []

# Open Swagger UI in browser
open http://localhost:3001/api/docs
```

---

## Key Files to Know

| File                            | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| `apps/api/src/main.ts`          | Application entry point (CORS, Swagger, port 3001) |
| `apps/api/src/songs/`           | Songs CRUD module                                  |
| `apps/api/src/images/`          | Images CRUD module                                 |
| `apps/api/src/auth/`            | Supabase JWT validation                            |
| `apps/api/prisma/schema.prisma` | Database schema (models)                           |
| `apps/api/.env.sample`          | Environment variables template                     |
| `packages/types/src/`           | Shared TypeScript types                            |
| `apps/api/vercel.json`          | Vercel serverless configuration                    |

---

## Common Commands

### Development

```bash
npm run dev              # Start dev server (watch mode)
npm run build            # Build for production
npm run start:prod       # Run production build
npm run type-check       # Check TypeScript types
npm run format           # Format code with Prettier
npm run lint             # Lint code with ESLint
```

### Database

```bash
npx prisma migrate dev --name migration_name   # Create migration
npx prisma db push                             # Sync schema
npx prisma studio                              # Open GUI
npx prisma generate                            # Regenerate client
```

### Testing

```bash
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report
```

---

## API Endpoints Overview

### Public Endpoints (No Auth Required)

```bash
# List songs
GET /api/v1/songs

# Get song by ID
GET /api/v1/songs/:id

# List images
GET /api/v1/images?category=profile

# Get image by ID
GET /api/v1/images/:id
```

### Admin Endpoints (JWT Required)

```bash
# Create song
POST /api/v1/songs
Header: Authorization: Bearer <jwt-token>
Body: { title, artist, filePath, ... }

# Update song
PATCH /api/v1/songs/:id
Header: Authorization: Bearer <jwt-token>
Body: { title, artist, ... }

# Delete song
DELETE /api/v1/songs/:id
Header: Authorization: Bearer <jwt-token>

# Create image
POST /api/v1/images
Header: Authorization: Bearer <jwt-token>
Body: { title, filePath, category, ... }
```

---

## Testing with Swagger UI

1. Open `http://localhost:3001/api/docs` in browser
2. For protected endpoints (🔒):
   - Click "Authorize" button (top-right)
   - Paste JWT token from Supabase
   - Click "Try it out"
3. Click "Execute" to test endpoint

---

## Troubleshooting

### Issue: Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solution**:

- Verify DATABASE_URL in `.env.local`
- Check Supabase project is active
- Ensure connection string has `pgbouncer=true`

### Issue: Port 3001 Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution**:

```bash
lsof -i :3001          # Find process
kill -9 <PID>          # Kill it
PORT=3002 npm run dev  # Use different port
```

### Issue: Prisma Schema Out of Sync

```
npx prisma db push     # Sync schema
npx prisma generate    # Regenerate client
npm run dev            # Restart
```

---

## Architecture Overview

```
HTTP Request
    ↓
Controller (SongsController, ImagesController)
    ↓
Guard (SupabaseAuthGuard) [if protected]
    ↓
Service (SongsService, ImagesService)
    ↓
Prisma Client
    ↓
Supabase PostgreSQL
    ↓
JSON Response
```

---

## Swagger Documentation

The Swagger UI at `/api/docs` provides:

- Interactive endpoint explorer
- Request/response examples
- Parameter documentation
- Bearer token authentication
- Live endpoint testing

**Example**: To test creating a song:

1. Navigate to POST `/api/v1/songs`
2. Click "Try it out"
3. Fill in request body
4. Click "Execute"

---

## Environment Variables

### Required for Development

```bash
PORT=3001
DATABASE_URL=postgresql://...  # Pooler connection
DIRECT_URL=postgresql://...    # Direct connection
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
```

### How to Get Them

1. Go to Supabase Project Dashboard
2. Settings → Database
   - Copy DATABASE_URL (with pgbouncer)
   - Copy DIRECT_URL (without pgbouncer)
3. Settings → API
   - Copy Project URL (SUPABASE_URL)
   - Copy Service Role Secret Key (SUPABASE_SERVICE_KEY)

---

## Next Steps

### For Backend Development

1. Review [API Reference](/docs/API_REFERENCE.md)
2. Check [Backend Developer Guide](/docs/BACKEND_DEVELOPER_GUIDE.md)
3. Explore `apps/api/src/` structure
4. Add new features following NestJS patterns

### For Phase 2 (Presigned URLs)

1. Add Supabase Storage client
2. Implement upload URL generation
3. Add file validation
4. Integrate with Supabase Storage

### For Admin UI (Phase 3)

1. Create separate `apps/admin/` app
2. Fork shadcn dashboard template
3. Implement Supabase Auth
4. Build song/image management pages

---

## Documentation

- [Phase 1 Complete Report](/docs/PHASE01_NESTJS_BACKEND_FOUNDATION.md)
- [API Reference](/docs/API_REFERENCE.md)
- [Backend Developer Guide](/docs/BACKEND_DEVELOPER_GUIDE.md)
- [Project Overview](/docs/PROJECT_OVERVIEW.md)

---

## Support

### Swagger UI

Open `http://localhost:3001/api/docs` for interactive API testing

### Prisma Studio

Run `npx prisma studio` to view/edit database GUI

### Logs

Check `npm run dev` console output for errors and debug info

### Database

Run `npx prisma studio` to view all data

---

**You're all set! The backend is ready for development. Start with the [API Reference](/docs/API_REFERENCE.md) to understand the endpoints.**

Next: [Backend Developer Guide](/docs/BACKEND_DEVELOPER_GUIDE.md)
