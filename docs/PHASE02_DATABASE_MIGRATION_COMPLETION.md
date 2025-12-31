# Phase 02: Database Migration Completion

**Date**: 2025-12-31
**Status**: ✅ Complete
**Migration Type**: Static Array → PostgreSQL with Prisma 7
**Records Migrated**: 16 songs
**New UUIDs Generated**: 16 unique identifiers
**Mapping File**: `/apps/api/scripts/migration-output/migration-mapping.json`

---

## Executive Summary

Phase 02 successfully completed the migration of 16 songs from the static `staticSongs` array (previously in `/packages/utils/src/songs.ts`) to PostgreSQL via Prisma ORM. The migration generated new UUIDs for all records and created an ID mapping file for maintaining backward compatibility with old references.

**Key Achievements:**

- 16 songs migrated to PostgreSQL database
- New UUIDs generated and tracked
- Migration mapping file created (old ID → new UUID)
- All records set to `published=true`
- All records set to `album=null` (per user decision)
- Database schema updated (Prisma 7 compatible)
- Migration script with dry-run and verbose modes

---

## Migration Scope

### Source Data

**Source**: `/packages/utils/src/songs.ts` - `staticSongs` array

**Fields Migrated**:

- `id` (old UUID) → Old ID reference (stored in mapping file)
- `name` → `title` (VARCHAR 255)
- `author` → `artist` (VARCHAR 255)
- `audio` → `filePath` (Supabase path, e.g., `songs/{newId}.mp3`)
- `img` → `thumbnailPath` (Supabase path, e.g., `images/{newId}.{ext}`)

### Target Schema

**Database**: PostgreSQL
**ORM**: Prisma 7 (with PrismaPg adapter)
**Tables**: `songs` table

**Schema Definition** (`/apps/api/prisma/schema.prisma`):

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

---

## Migration Files

### 1. Main Migration Script

**File**: `/apps/api/scripts/migrate-songs.ts`

**Features**:

- Environment validation (7 required variables)
- Dry-run mode: `npm run migrate -- --dry-run`
- Verbose mode: `npm run migrate -- --verbose`
- Supabase bucket verification
- Transaction-based atomicity
- Detailed logging with timestamps
- Graceful error handling with cleanup

**Key Functions**:

1. `validateEnvironment()` - Validates required env vars
2. `verifyBuckets()` - Confirms Supabase buckets exist
3. `migrateDatabaseRecords()` - Performs actual migration with transactional safety
4. `saveMigrationMapping()` - Writes mapping file to disk
5. `main()` - Orchestrates migration flow

**Environment Variables Required**:

```
OLD_NEXT_PUBLIC_SUPABASE_URL         # Old Supabase project URL
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY    # Old Supabase anon key
SUPABASE_URL                         # New Supabase project URL
SUPABASE_SERVICE_KEY                 # New Supabase service key
DATABASE_URL                         # PostgreSQL connection string
```

### 2. Helper Functions

**File**: `/apps/api/scripts/migrate-songs-helpers.ts`

**Interfaces**:

```typescript
interface MigrationSong {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
  oldAudioUrl: string;
  oldThumbnailUrl: string;
}

interface TransformedSong {
  id: string; // New UUID
  title: string;
  artist: string;
  album: string | null;
  filePath: string;
  thumbnailPath: string;
  published: boolean;
}

interface MigrationMapping {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
}
```

**Key Functions**:

1. `extractSongsData()` - Extracts song data from staticSongs
2. `getAudioFilename()` - Extracts filename from URL with fallback handling
3. `transformSongForDatabase()` - Transforms old structure to new schema
4. `createMappingEntry()` - Creates mapping entry object

### 3. Migration Mapping File

**File**: `/apps/api/scripts/migration-output/migration-mapping.json`

**Format**: Object mapping old IDs to new UUIDs
**Purpose**: Maintains bidirectional ID reference for backward compatibility

**Sample Content**:

```json
{
  "the-one-kodaline": "5fa8a54b-219c-4b68-bb7e-8f14030f406d",
  "all-of-me-john-legend": "8612a648-0d01-4358-973f-2c0df8865be3",
  "make-you-feel-my-love-adele": "9b9a1e8a-2d30-4623-8613-47dd1d4104b5",
  "i-do-911": "b2638f28-72d0-41d0-869a-04f3b4e7b9d6",
  "wake-me-up-when-september-ends-green-d": "35b5942a-25b9-4379-83bf-8c3790d8fd76",
  ...
}
```

**All 16 Migrated Songs**:
| Old ID | New UUID | Title | Artist |
|--------|----------|-------|--------|
| the-one-kodaline | 5fa8a54b-219c-4b68-bb7e-8f14030f406d | The One | Kodaline |
| all-of-me-john-legend | 8612a648-0d01-4358-973f-2c0df8865be3 | All Of Me | John Legend |
| make-you-feel-my-love-adele | 9b9a1e8a-2d30-4623-8613-47dd1d4104b5 | Make You Feel My Love | Adele |
| i-do-911 | b2638f28-72d0-41d0-869a-04f3b4e7b9d6 | I Do | 911 |
| wake-me-up-when-september-ends-green-d | 35b5942a-25b9-4379-83bf-8c3790d8fd76 | Wake Me Up When September Ends | Green Day |
| cant-take-my-eyes-off-you | d823e791-8b6a-4c1f-b6ac-275eb185b379 | Can't Take My Eyes Off You | Frankie Valli |
| say-you-wont-let-go-james-arthur | 18e391fb-ffab-4d8f-b716-134ef1826e3b | Say You Won't Let Go | James Arthur |
| love-someone-lukas-graham | af431030-3e70-4014-a057-c8d1cddf8503 | Love Someone | Lukas Graham |
| im-yours-jason-mraz | 55461b7e-29a6-4bde-af22-1ffe534837dd | I'm Yours | Jason Mraz |
| perfect-ed-sheeran | bf4d6c98-8132-4c79-8bb6-67c3e71047a3 | Perfect | Ed Sheeran |
| perfect-tanner-patrick | fe7016ca-3e9e-4687-ac58-058dcf47cf2e | Perfect | Tanner Patrick |
| you-are-the-reason-calum-scott | b3fe0831-90a4-4b35-81cc-55fef93e2cd2 | You Are The Reason | Calum Scott |
| always-isak-danielson | b5d1f3f3-b969-444a-8726-79a4e8d53628 | Always | Isak Danielson |
| little-things-one-direction | 06ebe82a-4f7a-4836-ab2e-3570a9720959 | Little Things | One Direction |
| i-know-you-know | 6c74b70a-3842-4e59-a0d4-a9b98c358a8d | I Know You Know | Unknown |
| munn-loved-us-more | fab5824b-43ae-44e8-8d8c-319d70a1d192 | Loved Us More | Unknown |

---

## Migration Flow Diagram

```
┌─────────────────────────────────────┐
│ 1. Environment Validation           │
│ - Check 7 required env vars         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Initialize Clients               │
│ - Supabase (old & new)              │
│ - PostgreSQL pool                   │
│ - Prisma with PrismaPg adapter      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Verify Buckets                   │
│ - Confirm 'songs' bucket exists     │
│ - Confirm 'images' bucket exists    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Database Migration               │
│ - For each song in staticSongs:     │
│   - Generate new UUID               │
│   - Transform to DB schema          │
│   - Insert via Prisma transaction   │
│   - Create mapping entry            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 5. Save Mapping File                │
│ - Write old ID → new UUID map       │
│ - JSON format for easy parsing      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 6. Cleanup & Exit                   │
│ - Disconnect Prisma client          │
│ - Close DB pool                     │
└─────────────────────────────────────┘
```

---

## Data Transformation Details

### Field Mapping

**Title Transformation**:

- `staticSongs[i].name` → `Song.title`
- Field type: `VarChar(255)`
- No transformation applied (preserved as-is)

**Artist Transformation**:

- `staticSongs[i].author` → `Song.artist`
- Field type: `VarChar(255)`
- Fallback: `"Unknown"` if author is undefined/empty

**File Path Transformation**:

- Source: `staticSongs[i].audio` (Supabase URL)
- Extracted filename: Last segment of URL (e.g., `song.mp3`)
- Format: `songs/{newId}.{extension}`
- Example: `songs/5fa8a54b-219c-4b68-bb7e-8f14030f406d.mp3`

**Thumbnail Path Transformation**:

- Source: `staticSongs[i].img` (Supabase URL with optional query params)
- Extracted extension: From URL pathname (removes query params)
- Format: `images/{newId}.{extension}`
- Example: `images/5fa8a54b-219c-4b68-bb7e-8f14030f406d.png`

**Album Field**:

- Set to: `null` for all records
- Rationale: User decision to migrate without album metadata initially
- Future: Can be populated once album data is curated

**Published Status**:

- Set to: `true` for all records
- Rationale: Existing songs are ready for consumption
- Future: Can be toggled via admin API

**ID Generation**:

- Type: UUID v4 (randomly generated)
- Source: `randomUUID()` from Node.js `crypto` module
- Format: Standard UUID string format (36 chars with hyphens)
- Example: `5fa8a54b-219c-4b68-bb7e-8f14030f406d`

---

## Running the Migration

### Prerequisites

1. **Environment Variables** - Create `.env` in `/apps/api`:

```bash
# Old Supabase credentials (source of staticSongs URLs)
OLD_NEXT_PUBLIC_SUPABASE_URL=https://old-project.supabase.co
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-old-anon-key

# New Supabase credentials (target for file storage)
SUPABASE_URL=https://new-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# PostgreSQL connection (target for records)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

2. **Supabase Buckets** - Ensure buckets exist and have public access:

   - `songs` bucket
   - `images` bucket

3. **Database** - PostgreSQL database initialized with schema applied via Prisma migrations

### Execution

**Dry Run** (Recommended first):

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api
npm run migrate -- --dry-run
```

**Actual Migration**:

```bash
npm run migrate
```

**With Verbose Output**:

```bash
npm run migrate -- --verbose
```

**Dry Run + Verbose**:

```bash
npm run migrate -- --dry-run --verbose
```

### Output

**Console Logs**:

```
2025-12-31T10:30:45.123Z  [INFO] Starting migration...
2025-12-31T10:30:45.234Z  [INFO] Environment validated
2025-12-31T10:30:45.345Z  [INFO] Verifying Supabase buckets...
2025-12-31T10:30:45.456Z  [INFO] ✓ Buckets verified: songs, images
2025-12-31T10:30:45.567Z  [INFO] === Phase 2: Database Migration ===
2025-12-31T10:30:45.678Z  [INFO] Found 16 songs to migrate
2025-12-31T10:30:45.789Z  [INFO] [1/16] Inserting: The One by Kodaline
2025-12-31T10:30:45.890Z  [INFO]   ✓ Created record with ID: 5fa8a54b-219c-4b68-bb7e-8f14030f406d
...
2025-12-31T10:30:46.789Z  [INFO] Successfully inserted 16 records
2025-12-31T10:30:46.890Z  [INFO] Mapping file saved: /apps/api/scripts/migration-output/migration-mapping.json
2025-12-31T10:30:46.901Z  [INFO] Migration completed successfully
```

**Mapping File** (`migration-mapping.json`):

- Location: `/apps/api/scripts/migration-output/migration-mapping.json`
- Content: JSON object with old ID → new UUID mappings
- Size: ~1.5 KB
- Purpose: Reference for ID correlation, frontend updates, backward compatibility

---

## Post-Migration Verification

### 1. Database Verification

**Check Record Count**:

```sql
SELECT COUNT(*) as song_count FROM songs;
-- Expected: 16
```

**View Sample Records**:

```sql
SELECT id, title, artist, published, file_path FROM songs LIMIT 5;
```

**Verify Published Status**:

```sql
SELECT COUNT(*) as published_count FROM songs WHERE published = true;
-- Expected: 16
```

**Check File Paths**:

```sql
SELECT COUNT(*) as valid_paths FROM songs
WHERE file_path LIKE 'songs/%-%.mp3' OR file_path LIKE 'songs/%.flac' OR file_path LIKE 'songs/%.wav' OR file_path LIKE 'songs/%.ogg';
-- Expected: 16
```

### 2. API Verification

**Fetch All Songs**:

```bash
curl http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected**: Array of 16 song objects with new UUIDs

**Sample Response**:

```json
{
  "data": [
    {
      "id": "5fa8a54b-219c-4b68-bb7e-8f14030f406d",
      "title": "The One",
      "artist": "Kodaline",
      "album": null,
      "filePath": "songs/5fa8a54b-219c-4b68-bb7e-8f14030f406d.mp3",
      "thumbnailPath": "images/5fa8a54b-219c-4b68-bb7e-8f14030f406d.png",
      "published": true,
      "createdAt": "2025-12-31T10:30:45.890Z",
      "updatedAt": "2025-12-31T10:30:45.890Z"
    },
    ...
  ],
  "total": 16
}
```

### 3. Mapping File Verification

**Check Mapping File Exists**:

```bash
ls -lh /Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migration-output/migration-mapping.json
```

**Count Entries**:

```bash
jq 'keys | length' /Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migration-output/migration-mapping.json
-- Expected: 16
```

**Verify Format**:

```bash
jq '.' /Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migration-output/migration-mapping.json | head -20
```

---

## Schema Differences: Prisma 7

### Key Changes from Previous Versions

**Connection URL Parameter**:

- Previous: `datasource db { url = env("DATABASE_URL") }`
- Prisma 7: `datasource db { provider = "postgresql" }`
- **Important**: Remove `url` field - use `DATABASE_URL` env var only

**Adapter Pattern**:

```typescript
// New Prisma 7 pattern
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Current Schema Structure** (`/apps/api/prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

---

## Troubleshooting Guide

### Issue: "Missing env vars: DATABASE_URL"

**Cause**: Environment variable not set in `.env`
**Solution**:

```bash
# Add to .env
DATABASE_URL="postgresql://user:password@localhost:5432/love_days"
```

### Issue: "Missing buckets: songs"

**Cause**: Supabase bucket doesn't exist or credentials wrong
**Solution**:

1. Login to Supabase console
2. Navigate to Storage
3. Create `songs` bucket (if missing)
4. Verify bucket has public access

### Issue: "Migration already ran" (duplicate records)

**Cause**: Script ran twice without cleanup
**Solution**:

1. Delete created records: `DELETE FROM songs WHERE created_at > NOW() - INTERVAL '1 hour';`
2. Re-run migration script

### Issue: "Connection refused to PostgreSQL"

**Cause**: Database server not running or wrong connection string
**Solution**:

```bash
# Test connection
psql postgresql://user:password@localhost:5432/love_days -c "SELECT 1"
```

### Issue: "Request for bucket 'songs' is missing Bearer token"

**Cause**: Using anon key instead of service key for SUPABASE_SERVICE_KEY
**Solution**:

1. Go to Supabase console
2. Settings → API
3. Copy Service Role Key (not Anon Key)
4. Update SUPABASE_SERVICE_KEY in `.env`

---

## Backward Compatibility

### Mapping File Usage

**Purpose**: Maintain reference between old string IDs and new UUIDs

**Example Use Case - Frontend Migration**:

```typescript
// Old code: hardcoded song ID
const oldSongId = "all-of-me-john-legend";

// Lookup new ID from mapping
import migrationMap from "./migration-output/migration-mapping.json";
const newSongId = migrationMap[oldSongId];
// newSongId = "8612a648-0d01-4358-973f-2c0df8865be3"

// Use new ID with API
const response = await fetch(`/api/v1/songs/${newSongId}`);
```

**API Endpoint Support** (if needed):

```typescript
// Optional: Add reverse lookup endpoint
app.get("/api/v1/songs/legacy/:oldId", (req, res) => {
  const newId = migrationMap[req.params.oldId];
  if (newId) {
    return res.redirect(301, `/api/v1/songs/${newId}`);
  }
  return res.status(404).json({ error: "Song not found" });
});
```

---

## Next Steps

### 1. Frontend Updates (Phase 03)

- Update references from old string IDs to new UUIDs
- Use mapping file for transition period
- Update API client implementations
- Test all song-related features

### 2. File Storage Verification (Phase 03)

- Verify audio files exist in `songs` bucket with new paths
- Verify thumbnail images exist in `images` bucket with new paths
- Check file accessibility via public URLs

### 3. API Integration Testing (Phase 03)

- Test GET /api/v1/songs (retrieves all 16)
- Test GET /api/v1/songs/:id (retrieves single song)
- Test audio playback with new file paths
- Test thumbnail display with new image paths

### 4. Documentation Updates

- Update API_REFERENCE.md with UUID examples
- Create frontend migration guide
- Document old ID deprecation timeline
- Update developer onboarding docs

### 5. Cleanup Tasks

- Deprecate `staticSongs` from `packages/utils/src/songs.ts` (or remove)
- Remove unused utility functions
- Clean up migration script directory (optional)
- Archive migration mapping file for reference

---

## Files Modified/Created

| File                                                        | Type   | Status  | Purpose                                        |
| ----------------------------------------------------------- | ------ | ------- | ---------------------------------------------- |
| `/apps/api/scripts/migrate-songs.ts`                        | Script | NEW     | Main migration script with Prisma adapter      |
| `/apps/api/scripts/migrate-songs-helpers.ts`                | Module | NEW     | Helper functions for transformation            |
| `/apps/api/scripts/migration-output/migration-mapping.json` | Data   | NEW     | Generated mapping file (16 entries)            |
| `/apps/api/prisma/schema.prisma`                            | Config | UPDATED | Removed `url` field for Prisma 7 compatibility |

---

## Migration Metadata

**Start Date**: 2025-12-31
**Completion Date**: 2025-12-31
**Total Duration**: <1 minute (actual migration)
**Dry Run Time**: <1 minute
**Records Processed**: 16
**Success Rate**: 100% (16/16)
**Mapping Entries Generated**: 16
**Database Transactions**: 1 (atomic)

---

## References

- **Migration Script**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migrate-songs.ts`
- **Helper Functions**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migrate-songs-helpers.ts`
- **Mapping File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/migration-output/migration-mapping.json`
- **Database Schema**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/prisma/schema.prisma`
- **Related Docs**: `PHASE02_PRESIGNED_URL_UPLOAD.md`, `API_REFERENCE.md`
- **Related Phase**: Phase 01 - Backend Setup & Preparation

---

**Status**: ✅ Phase 02 Complete - Database Migration Successful
**Last Updated**: 2025-12-31
