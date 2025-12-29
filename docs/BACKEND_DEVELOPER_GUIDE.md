# Backend Developer Guide - NestJS API

**Target Audience**: Developers working on the Love Days NestJS backend
**Difficulty**: Intermediate (NestJS experience recommended)
**Last Updated**: 2025-12-29

---

## Quick Start

### Setup (5 minutes)

```bash
# 1. Clone and navigate
cd /Users/kaitovu/Desktop/Projects/love-days
git clone https://github.com/kaitovu/love-days.git

# 2. Install dependencies
npm install
cd apps/api
npm install

# 3. Configure environment
cp .env.sample .env.local
# Edit .env.local with your Supabase credentials

# 4. Set up database
npx prisma db push
npx prisma generate

# 5. Start development server
npm run dev
# Output: 🚀 API running on http://localhost:3001
```

### Verify Setup

```bash
# Test API health
curl http://localhost:3001/health

# Open Swagger docs
open http://localhost:3001/api/docs

# Open Prisma Studio
npx prisma studio
```

---

## Architecture Overview

### NestJS Module Structure

Love Days API follows standard NestJS modular architecture:

```
AppModule
├── PrismaModule              # Database abstraction layer
├── AuthModule                # Authentication & authorization
├── SongsModule               # Song CRUD operations
│   ├── SongsController       # HTTP request handling
│   ├── SongsService          # Business logic
│   ├── CreateSongDto         # DTO validation
│   └── UpdateSongDto         # DTO validation
└── ImagesModule              # Image CRUD operations
    ├── ImagesController      # HTTP request handling
    ├── ImagesService         # Business logic
    ├── CreateImageDto        # DTO validation
    └── UpdateImageDto        # DTO validation
```

### Request Flow Diagram

```
HTTP Request
    ↓
Express Adapter
    ↓
CORS Middleware
    ↓
Controller (HTTP handling)
    ↓
Guard Check (SupabaseAuthGuard) [if protected]
    ↓
Pipe (ValidationPipe - DTO validation)
    ↓
Service (Business logic)
    ↓
Prisma Client (Database query)
    ↓
Database (Supabase PostgreSQL)
    ↓
Response (JSON)
```

---

## Core Concepts

### 1. Modules

**What**: Containers for related functionality
**Example**: `SongsModule` contains controller, service, DTOs for song operations

**Key Module**:

```typescript
@Module({
  controllers: [SongsController],
  providers: [SongsService],
  imports: [PrismaModule],
})
export class SongsModule {}
```

### 2. Controllers

**What**: HTTP request handlers
**Responsibility**: Route requests, call services, return responses

**Example**:

```typescript
@Controller("api/v1/songs")
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get()
  async findAll() {
    return this.songsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.songsService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }
}
```

### 3. Services

**What**: Business logic containers
**Responsibility**: Data manipulation, validation, database operations

**Example**:

```typescript
@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async findAll(published: boolean = true) {
    return this.prisma.song.findMany({
      where: { published },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateSongDto) {
    return this.prisma.song.create({
      data: dto,
    });
  }
}
```

### 4. DTOs (Data Transfer Objects)

**What**: Type-safe request/response contracts
**Responsibility**: Validate incoming data before processing

**Example**:

```typescript
export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  artist: string;

  @IsString()
  @IsOptional()
  album?: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;
}
```

### 5. Guards

**What**: Authorization/permission checks
**Responsibility**: Allow/deny request access based on conditions

**Example**:

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    const user = await this.authService.validateToken(token);
    if (!user) throw new UnauthorizedException("Invalid token");

    request.user = user;
    return true;
  }
}
```

### 6. Pipes

**What**: Data transformation and validation
**Responsibility**: Transform and validate request data

**Used Globally**:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove unknown properties
    transform: true, // Transform to DTO class instances
  }),
);
```

---

## Development Workflow

### Adding a New Feature

#### Step 1: Create Feature Module

```bash
nest generate module features/newfeature
nest generate controller features/newfeature
nest generate service features/newfeature
```

#### Step 2: Define Database Schema

Edit `/prisma/schema.prisma`:

```prisma
model NewFeature {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(255)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("new_features")
}
```

#### Step 3: Run Migration

```bash
npx prisma migrate dev --name add_new_feature_table
```

#### Step 4: Create DTOs

`src/newfeature/dto/create-newfeature.dto.ts`:

```typescript
export class CreateNewFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

#### Step 5: Implement Service

`src/newfeature/newfeature.service.ts`:

```typescript
@Injectable()
export class NewFeatureService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNewFeatureDto) {
    return this.prisma.newFeature.create({ data: dto });
  }

  async findAll() {
    return this.prisma.newFeature.findMany();
  }
}
```

#### Step 6: Implement Controller

`src/newfeature/newfeature.controller.ts`:

```typescript
@Controller("api/v1/newfeature")
export class NewFeatureController {
  constructor(private service: NewFeatureService) {}

  @Post()
  create(@Body() dto: CreateNewFeatureDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

#### Step 7: Register Module

Edit `src/app.module.ts`:

```typescript
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SongsModule,
    ImagesModule,
    NewFeatureModule, // Add here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Step 8: Test

```bash
# Restart dev server
npm run dev

# Test endpoint
curl http://localhost:3001/api/v1/newfeature
```

---

## Database Operations

### Prisma Client Usage

#### Basic Queries

```typescript
// Create
const song = await prisma.song.create({
  data: {
    title: "Song",
    artist: "Artist",
    filePath: "songs/123.mp3",
  },
});

// Read (single)
const song = await prisma.song.findUnique({
  where: { id: "uuid" },
});

// Read (multiple)
const songs = await prisma.song.findMany({
  where: { published: true },
  orderBy: { createdAt: "desc" },
});

// Update
const updated = await prisma.song.update({
  where: { id: "uuid" },
  data: { title: "New Title" },
});

// Delete
const deleted = await prisma.song.delete({
  where: { id: "uuid" },
});
```

#### Advanced Queries

```typescript
// Filter multiple conditions
const songs = await prisma.song.findMany({
  where: {
    AND: [{ published: true }, { artist: { contains: "Ed" } }],
  },
});

// Pagination
const songs = await prisma.song.findMany({
  skip: 10,
  take: 20,
});

// Sorting
const songs = await prisma.song.findMany({
  orderBy: [{ published: "desc" }, { createdAt: "desc" }],
});

// Count
const count = await prisma.song.count({
  where: { published: true },
});
```

### Common Patterns

#### Service Error Handling

```typescript
async findOne(id: string) {
  const song = await this.prisma.song.findUnique({
    where: { id },
  });

  if (!song) {
    throw new NotFoundException(`Song with ID ${id} not found`);
  }

  return song;
}
```

#### Validation in Service

```typescript
async create(dto: CreateSongDto) {
  // Validate
  if (!dto.title || dto.title.trim().length === 0) {
    throw new BadRequestException('Title cannot be empty');
  }

  // Create
  return this.prisma.song.create({ data: dto });
}
```

---

## Testing

### Unit Tests (Service)

Create `/src/songs/songs.service.spec.ts`:

```typescript
import { Test } from "@nestjs/testing";
import { SongsService } from "./songs.service";
import { PrismaService } from "../prisma/prisma.service";

describe("SongsService", () => {
  let service: SongsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: PrismaService,
          useValue: {
            song: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should find all songs", async () => {
    const mockSongs = [{ id: "1", title: "Song" }];
    jest.spyOn(prisma.song, "findMany").mockResolvedValue(mockSongs);

    const result = await service.findAll();

    expect(result).toEqual(mockSongs);
    expect(prisma.song.findMany).toHaveBeenCalled();
  });

  it("should create a song", async () => {
    const dto = { title: "New", artist: "Artist", filePath: "path" };
    const expected = { id: "1", ...dto };
    jest.spyOn(prisma.song, "create").mockResolvedValue(expected);

    const result = await service.create(dto);

    expect(result).toEqual(expected);
    expect(prisma.song.create).toHaveBeenCalledWith({ data: dto });
  });
});
```

### Integration Tests (Controller)

Create `/test/songs.e2e-spec.ts`:

```typescript
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Songs (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/v1/songs", () => {
    it("should return songs array", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/songs")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/v1/songs (protected)", () => {
    it("should require authentication", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/songs")
        .send({ title: "Test", artist: "Test", filePath: "test.mp3" })
        .expect(401);
    });
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Code Style & Standards

### TypeScript Conventions

```typescript
// ✅ GOOD: Explicit types, descriptive names
async findPublishedSongs(): Promise<Song[]> {
  return this.prisma.song.findMany({
    where: { published: true },
  });
}

// ❌ BAD: Missing types, vague names
async getStuff() {
  return this.prisma.song.findMany();
}
```

### Naming Conventions

| Type       | Convention              | Example                  |
| ---------- | ----------------------- | ------------------------ |
| Module     | PascalCase              | `SongsModule`            |
| Controller | PascalCase + Controller | `SongsController`        |
| Service    | PascalCase + Service    | `SongsService`           |
| DTO        | PascalCase + Dto        | `CreateSongDto`          |
| Interface  | PascalCase + I prefix   | `ISong`                  |
| Method     | camelCase               | `findPublishedSongs()`   |
| Variable   | camelCase               | `newSong`                |
| Constant   | UPPER_SNAKE_CASE        | `DEFAULT_PAGE_SIZE = 10` |

### File Organization

```
src/
├── [feature]/
│   ├── [feature].controller.ts
│   ├── [feature].controller.spec.ts
│   ├── [feature].service.ts
│   ├── [feature].service.spec.ts
│   ├── [feature].module.ts
│   └── dto/
│       ├── create-[feature].dto.ts
│       └── update-[feature].dto.ts
├── common/
│   ├── interfaces/
│   ├── pipes/
│   ├── guards/
│   └── decorators/
├── auth/
├── prisma/
└── main.ts
```

### Documentation

```typescript
/**
 * Find all published songs
 * @returns Array of published songs sorted by creation date
 * @throws NotFoundException if database connection fails
 */
async findPublishedSongs(): Promise<Song[]> {
  return this.prisma.song.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## Debugging

### Enable Debug Logging

```typescript
// In main.ts
if (process.env.DEBUG === "true") {
  Logger.debug("Debug mode enabled");
}
```

### Prisma Debugging

```bash
# Enable Prisma client logging
export DEBUG="prisma:*"
npm run dev

# Open Prisma Studio
npx prisma studio
```

### DevTools Network Inspection

```bash
# cURL
curl -v http://localhost:3001/api/v1/songs

# Thunder Client / Postman
# Use built-in network inspector

# Browser DevTools
# Network tab → Select request → Details
```

### Swagger Interactive Testing

1. Navigate to `http://localhost:3001/api/docs`
2. Click endpoint to expand
3. Click "Try it out"
4. Modify parameters/body
5. Click "Execute"
6. View response

---

## Troubleshooting

### Issue: Database Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:

1. Verify `DATABASE_URL` in `.env.local`
2. Check Supabase project is active
3. Ensure pooler connection string has `pgbouncer=true`
4. Test connection: `psql [DATABASE_URL]`

### Issue: Prisma Migration Failed

```
Error: Migration failed to apply cleanly to the shadow database
```

**Solution**:

```bash
# Reset database (clears all data)
npx prisma migrate reset

# Or manually sync
npx prisma db push --force-reset
```

### Issue: TypeScript Compilation Error

```
Error: src/songs/songs.service.ts:10:5 - error TS2345: ...
```

**Solution**:

```bash
# Check types
npm run type-check

# Regenerate Prisma client
npx prisma generate

# Clear cache and rebuild
rm -rf dist/
npm run build
```

### Issue: Port 3001 Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution**:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

---

## Performance Tips

### Query Optimization

```typescript
// ❌ N+1 query problem
const songs = await this.prisma.song.findMany();
for (const song of songs) {
  const artist = await this.prisma.artist.findUnique({
    where: { id: song.artistId },
  });
}

// ✅ Optimized with include
const songs = await this.prisma.song.findMany({
  include: { artist: true },
});
```

### Caching Strategy

```typescript
// Simple cache with timeout
private cache = new Map();

async findPublished(): Promise<Song[]> {
  const cacheKey = 'songs-published';
  const cached = this.cache.get(cacheKey);
  if (cached) return cached;

  const songs = await this.prisma.song.findMany({
    where: { published: true },
  });

  // Expire cache after 5 minutes
  this.cache.set(cacheKey, songs);
  setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

  return songs;
}
```

### Pagination

```typescript
// Instead of fetching all records
async findAll() {
  const page = 1;
  const pageSize = 20;

  return this.prisma.song.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## Security Best Practices

### Input Validation

```typescript
// Always validate DTO
export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  artist: string;

  @IsString()
  @Matches(/^songs\/.*\.(mp3|wav|flac)$/, {
    message: "Invalid file path format",
  })
  filePath: string;
}
```

### Authentication Check

```typescript
// Always use guard for protected endpoints
@Post()
@UseGuards(SupabaseAuthGuard)
async create(@Body() dto: CreateSongDto) {
  // Only authenticated users reach here
}
```

### Error Messages

```typescript
// ❌ LEAK INFO: Don't expose internal details
throw new Error("Database error: " + error.message);

// ✅ SAFE: Generic error message
throw new InternalServerErrorException(
  "Failed to create song. Please try again.",
);
```

---

## Deployment

### Build for Production

```bash
# Build NestJS
npm run build

# Output in ./dist/
ls -la dist/

# Run production build
npm run start:prod
```

### Vercel Deployment

```bash
# Push to GitHub
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel auto-deploys via GitHub webhook
# Check deployment status in Vercel dashboard
```

### Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

---

## Resources

### Official Docs

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community

- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [Stack Overflow - NestJS](https://stackoverflow.com/questions/tagged/nestjs)

### Related Docs

- [API Reference](/docs/API_REFERENCE.md)
- [Phase 1 Report](/docs/PHASE01_NESTJS_BACKEND_FOUNDATION.md)
- [Code Standards](/docs/CODE_STANDARDS.md)

---

**Happy coding! 🚀**
