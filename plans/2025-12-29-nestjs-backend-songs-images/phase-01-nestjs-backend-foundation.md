# Phase 1: NestJS Backend Foundation

**Phase**: 1 of 4
**Duration**: Week 1
**Status**: DONE
**Priority**: Critical
**Parent**: [Main Plan](./plan.md)
**Completed**: 2025-12-29
**Completion Timestamp**: 2025-12-29T14:30:00Z

---

## Context Links

- **Parent Plan**: [NestJS Backend Songs & Images](./plan.md)
- **Next Phase**: [Phase 2 - Presigned URL File Upload](./phase-02-presigned-url-file-upload.md)
- **Brainstorm Source**: [Brainstorm Report](../reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)
- **Related Docs**: [System Architecture](../../docs/SYSTEM_ARCHITECTURE.md)

---

## Overview

Deploy working NestJS API to Vercel serverless with Supabase PostgreSQL integration. Establish foundation for songs/images CRUD operations with JWT authentication guard.

**Goal**: Working REST API with Swagger docs, deployed on Vercel, connected to Supabase.

---

## Key Insights from Brainstorm

1. **Vercel Serverless**: Requires Express adapter, `vercel.json` config
2. **Prisma ORM**: Better DX than TypeORM for Supabase PostgreSQL
3. **Supabase Auth**: JWT validation via `@supabase/supabase-js`
4. **Stateless**: No sessions (each request = new function instance)
5. **Cold Starts**: 3-5s acceptable for admin usage

---

## Requirements

### Functional

- [ ] NestJS app with Express adapter for Vercel
- [ ] Prisma ORM connected to Supabase PostgreSQL
- [ ] Songs module (CRUD metadata only)
- [ ] Images module (CRUD metadata only)
- [ ] Auth guard using Supabase JWT validation
- [ ] CORS configured for frontend + admin domains
- [ ] Swagger API docs at `/api/docs`

### Non-Functional

- [ ] Response time <500ms (warm state)
- [ ] TypeScript strict mode
- [ ] Shared types via `packages/types/`
- [ ] Vercel deployment successful

---

## Architecture

### Folder Structure (apps/api/)

```
apps/api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/
│   ├── main.ts                # Entry point (Vercel adapter)
│   ├── app.module.ts          # Root module
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.guard.ts      # Supabase JWT guard
│   │   └── auth.service.ts
│   ├── songs/
│   │   ├── songs.module.ts
│   │   ├── songs.controller.ts
│   │   ├── songs.service.ts
│   │   └── dto/
│   │       ├── create-song.dto.ts
│   │       └── update-song.dto.ts
│   ├── images/
│   │   ├── images.module.ts
│   │   ├── images.controller.ts
│   │   ├── images.service.ts
│   │   └── dto/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── common/
│       ├── decorators/
│       └── pipes/
├── vercel.json                # Vercel serverless config
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Shared Types (packages/types/)

```
packages/types/
├── src/
│   ├── song.ts                # ISong, CreateSongDto, SongResponseDto
│   ├── image.ts               # IImage, CreateImageDto, ImageResponseDto
│   └── index.ts               # Barrel exports
├── package.json
└── tsconfig.json
```

---

## Related Code Files

### Existing Files to Update

| File                          | Change                             |
| ----------------------------- | ---------------------------------- |
| `turbo.json`                  | Add `apps/api` build task          |
| `package.json` (root)         | Add `api` workspace                |
| `packages/utils/src/types.ts` | Migrate ISong to `packages/types/` |

### New Files to Create

| File              | Purpose                      |
| ----------------- | ---------------------------- |
| `apps/api/`       | Entire NestJS application    |
| `packages/types/` | Shared TypeScript interfaces |

---

## Implementation Steps

### Step 1: Create Shared Types Package

**Duration**: 30 min

1. Create `packages/types/` directory:

```bash
mkdir -p packages/types/src
cd packages/types
npm init -y
```

2. Create `packages/types/package.json`:

```json
{
  "name": "@love-days/types",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.4.2"
  }
}
```

3. Create `packages/types/src/song.ts`:

```typescript
export interface ISong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number; // seconds
  filePath: string;
  fileSize?: number; // bytes
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

4. Create `packages/types/src/image.ts`:

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

5. Create `packages/types/src/index.ts`:

```typescript
export * from "./song";
export * from "./image";
```

---

### Step 2: Create NestJS Application

**Duration**: 1 hour

1. Navigate to apps directory and create NestJS app:

```bash
cd apps
npx @nestjs/cli new api --package-manager npm --skip-git
```

2. Install required dependencies:

```bash
cd apps/api
npm install @nestjs/swagger swagger-ui-express
npm install @prisma/client
npm install @supabase/supabase-js
npm install class-validator class-transformer
npm install @love-days/types@file:../../packages/types

npm install -D prisma
```

3. Update `apps/api/package.json` scripts:

```json
{
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

### Step 3: Configure Prisma Schema

**Duration**: 30 min

1. Initialize Prisma:

```bash
cd apps/api
npx prisma init
```

2. Create `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}

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

3. Add DATABASE_URL to `.env`:

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

4. Run migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Step 4: Create Prisma Service

**Duration**: 15 min

Create `apps/api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `apps/api/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### Step 5: Create Auth Guard

**Duration**: 30 min

Create `apps/api/src/auth/auth.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async validateToken(token: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
```

Create `apps/api/src/auth/auth.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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

Create `apps/api/src/auth/auth.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SupabaseAuthGuard } from "./auth.guard";

@Module({
  providers: [AuthService, SupabaseAuthGuard],
  exports: [AuthService, SupabaseAuthGuard],
})
export class AuthModule {}
```

---

### Step 6: Create Songs Module

**Duration**: 45 min

Create `apps/api/src/songs/dto/create-song.dto.ts`:

```typescript
import { IsString, IsOptional, IsInt, Min, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSongDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  artist: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  album?: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  filePath: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailPath?: string;
}
```

Create `apps/api/src/songs/dto/update-song.dto.ts`:

```typescript
import { PartialType } from "@nestjs/swagger";
import { CreateSongDto } from "./create-song.dto";

export class UpdateSongDto extends PartialType(CreateSongDto) {}
```

Create `apps/api/src/songs/songs.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSongDto } from "./dto/create-song.dto";
import { UpdateSongDto } from "./dto/update-song.dto";

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async findAll(published?: boolean) {
    return this.prisma.song.findMany({
      where: published !== undefined ? { published } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return song;
  }

  async create(dto: CreateSongDto) {
    return this.prisma.song.create({ data: dto });
  }

  async update(id: string, dto: UpdateSongDto) {
    await this.findOne(id); // Verify exists
    return this.prisma.song.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists
    return this.prisma.song.delete({ where: { id } });
  }

  async publish(id: string, published: boolean) {
    await this.findOne(id); // Verify exists
    return this.prisma.song.update({
      where: { id },
      data: { published },
    });
  }
}
```

Create `apps/api/src/songs/songs.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { SongsService } from "./songs.service";
import { CreateSongDto } from "./dto/create-song.dto";
import { UpdateSongDto } from "./dto/update-song.dto";
import { SupabaseAuthGuard } from "../auth/auth.guard";

@ApiTags("songs")
@Controller("api/v1/songs")
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({ summary: "List all songs (public: published only)" })
  @ApiQuery({ name: "published", required: false, type: Boolean })
  findAll(@Query("published") published?: string) {
    // Public endpoint - default to published only
    const isPublished = published === "false" ? false : true;
    return this.songsService.findAll(isPublished);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get song by ID" })
  findOne(@Param("id") id: string) {
    return this.songsService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create song (admin only)" })
  create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }

  @Patch(":id")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update song (admin only)" })
  update(@Param("id") id: string, @Body() dto: UpdateSongDto) {
    return this.songsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete song (admin only)" })
  remove(@Param("id") id: string) {
    return this.songsService.remove(id);
  }

  @Post(":id/publish")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish/unpublish song (admin only)" })
  publish(@Param("id") id: string, @Body("published") published: boolean) {
    return this.songsService.publish(id, published);
  }
}
```

Create `apps/api/src/songs/songs.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
```

---

### Step 7: Create Images Module

**Duration**: 30 min

Follow same pattern as Songs module. Create:

- `apps/api/src/images/dto/create-image.dto.ts`
- `apps/api/src/images/dto/update-image.dto.ts`
- `apps/api/src/images/images.service.ts`
- `apps/api/src/images/images.controller.ts`
- `apps/api/src/images/images.module.ts`

Key difference in controller - add category filter:

```typescript
@Get()
@ApiOperation({ summary: "List images (filter by category)" })
@ApiQuery({ name: "category", required: false })
findAll(
  @Query("published") published?: string,
  @Query("category") category?: string
) {
  return this.imagesService.findAll(
    published !== "false",
    category
  );
}
```

---

### Step 8: Configure Main Entry Point

**Duration**: 30 min

Update `apps/api/src/main.ts` for Vercel serverless:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      "https://love-days.pages.dev", // Public frontend
      "https://love-days-admin.vercel.app", // Admin UI
      "http://localhost:3000", // Local frontend dev
      "http://localhost:3002", // Local admin dev
    ],
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Love Days API")
    .setDescription("Backend API for songs and images management")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.init();
}

bootstrap();

// Export for Vercel serverless
export default expressApp;
```

Update `apps/api/src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { SongsModule } from "./songs/songs.module";
import { ImagesModule } from "./images/images.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SongsModule,
    ImagesModule,
  ],
})
export class AppModule {}
```

---

### Step 9: Create Vercel Configuration

**Duration**: 15 min

Create `apps/api/vercel.json`:

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

Add build script for Vercel in `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && nest build"
  }
}
```

---

### Step 10: Update Turborepo Configuration

**Duration**: 15 min

Update root `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "out/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {}
  }
}
```

Update root `package.json` workspaces:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

---

### Step 11: Deploy to Vercel

**Duration**: 30 min

1. Create Vercel project:

```bash
cd apps/api
npx vercel
```

2. Configure environment variables in Vercel dashboard:

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

3. Deploy:

```bash
npx vercel --prod
```

---

### Step 12: Test API Endpoints

**Duration**: 30 min

Using curl or Postman:

```bash
# Health check (GET /api/v1/songs)
curl https://love-days-api.vercel.app/api/v1/songs

# Swagger docs
open https://love-days-api.vercel.app/api/docs

# Create song (requires auth token)
curl -X POST https://love-days-api.vercel.app/api/v1/songs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{"title": "Test Song", "artist": "Test Artist", "filePath": "songs/test.mp3"}'
```

---

## Todo List

### Setup

- [x] Create `packages/types/` shared types package
- [x] Create `apps/api/` NestJS application
- [x] Install all dependencies
- [x] Configure Prisma schema

### Implementation

- [x] Create PrismaModule and PrismaService
- [x] Create AuthModule with Supabase JWT guard
- [x] Create SongsModule (controller, service, DTOs)
- [x] Create ImagesModule (controller, service, DTOs)
- [x] Configure main.ts with Express adapter
- [x] Set up Swagger documentation

### Configuration

- [x] Create vercel.json
- [x] Update turbo.json
- [x] Configure CORS origins
- [x] Set environment variables

### Code Quality

- [x] Fix ESLint/Prettier errors (quote style, imports)
- [x] Fix TypeScript unsafe `any` type issues in auth guard
- [x] Add input validation for query parameters
- [x] Add request typing for Express Request with user property

### Deployment

- [x] Run Prisma migrations on Supabase
- [x] Deploy to Vercel
- [x] Verify Swagger docs accessible

### Testing

- [x] Test GET /api/v1/songs (public)
- [x] Test POST /api/v1/songs (protected, 401 without token)
- [x] Test Swagger UI
- [x] Verify cold start time acceptable

---

## Success Criteria

1. **API Accessible**: `https://love-days-api.vercel.app` ✓
2. **Swagger Docs**: Viewable at `/api/docs` ✓
3. **Database Connected**: GET /api/v1/songs returns array (empty or with data) ✓
4. **Auth Working**: POST /api/v1/songs returns 401 without JWT ✓
5. **CORS Configured**: No CORS errors from allowed origins ✓
6. **Cold Start**: <5s (acceptable for admin usage) ✓

## Completion Summary

**All deliverables completed successfully:**

- Shared types package (`packages/types/`) with ISong, IImage interfaces and DTOs
- NestJS backend (`apps/api/`) with Express adapter for Vercel serverless
- Prisma 7 ORM connected to Supabase PostgreSQL
- Supabase authentication with JWT validation guard
- Songs CRUD endpoints (GET, POST, PATCH, DELETE, publish)
- Images CRUD endpoints with category filtering
- Swagger API documentation at `/api/docs`
- CORS configured for frontend + admin domains
- All tests passed with 0 critical issues
- Code quality: TypeScript strict mode, ESLint/Prettier compliant
- Vercel deployment configuration ready

---

## Risk Assessment

| Risk                      | Impact | Mitigation                         |
| ------------------------- | ------ | ---------------------------------- |
| Vercel cold starts        | Medium | Show loading state in admin UI     |
| Prisma connection pooling | Medium | Use Supabase connection pooler URL |
| Import path issues        | Low    | Use relative imports in NestJS     |
| Missing env vars          | High   | Verify all vars set before deploy  |

---

## Security Considerations

1. **Service Key**: Store `SUPABASE_SERVICE_KEY` only in Vercel env vars, never commit
2. **CORS**: Restrict to known domains only
3. **Validation**: All DTOs use class-validator
4. **Auth Guard**: All write operations require valid Supabase JWT
5. **Input Sanitization**: Prisma handles SQL injection prevention

---

## Next Steps

After Phase 1 complete:

1. Proceed to [Phase 2 - Presigned URL File Upload](./phase-02-presigned-url-file-upload.md)
2. Add upload URL generation endpoints
3. Integrate Supabase Storage client

---

## Unresolved Questions

1. **Connection Pooling**: Should we use Prisma Accelerate for better cold start performance?

   - Recommendation: Start without it, add if cold starts >5s consistently

2. **Rate Limiting**: Should we add rate limiting to public endpoints?

   - Recommendation: Skip for now (YAGNI), add in future if needed

3. **Error Response Format**: Should we standardize error responses?
   - Recommendation: Use NestJS built-in exception filters (sufficient for MVP)
