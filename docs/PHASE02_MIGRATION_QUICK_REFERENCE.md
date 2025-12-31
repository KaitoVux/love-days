# Phase 02: Database Migration - Quick Reference

**Status**: ✅ Complete | **Date**: 2025-12-31 | **Records**: 16 Songs Migrated

---

## At a Glance

**What Changed**: 16 songs moved from static array → PostgreSQL database with new UUIDs
**Why**: Enable dynamic song management, support CRUD operations, prepare for future features
**What's New**: ID mapping file, Prisma 7 compatible schema, transaction-safe migration script

---

## Migration Summary

```
OLD (packages/utils/src/songs.ts):
├── staticSongs array (hardcoded)
├── String IDs (e.g., "all-of-me-john-legend")
└── Embedded in frontend

NEW (PostgreSQL):
├── songs table
├── UUID IDs (e.g., "8612a648-0d01-4358-973f-2c0df8865be3")
└── Accessible via API
```

---

## Key Files

| File                         | Purpose                      | Location                                                    |
| ---------------------------- | ---------------------------- | ----------------------------------------------------------- |
| **migrate-songs.ts**         | Main migration script        | `/apps/api/scripts/migrate-songs.ts`                        |
| **migrate-songs-helpers.ts** | Transform & helper functions | `/apps/api/scripts/migrate-songs-helpers.ts`                |
| **migration-mapping.json**   | Old ID → New UUID mappings   | `/apps/api/scripts/migration-output/migration-mapping.json` |
| **schema.prisma**            | Updated DB schema (Prisma 7) | `/apps/api/prisma/schema.prisma`                            |

---

## All 16 Migrated Songs

```json
{
  "the-one-kodaline": "5fa8a54b-219c-4b68-bb7e-8f14030f406d",
  "all-of-me-john-legend": "8612a648-0d01-4358-973f-2c0df8865be3",
  "make-you-feel-my-love-adele": "9b9a1e8a-2d30-4623-8613-47dd1d4104b5",
  "i-do-911": "b2638f28-72d0-41d0-869a-04f3b4e7b9d6",
  "wake-me-up-when-september-ends-green-d": "35b5942a-25b9-4379-83bf-8c3790d8fd76",
  "cant-take-my-eyes-off-you": "d823e791-8b6a-4c1f-b6ac-275eb185b379",
  "say-you-wont-let-go-james-arthur": "18e391fb-ffab-4d8f-b716-134ef1826e3b",
  "love-someone-lukas-graham": "af431030-3e70-4014-a057-c8d1cddf8503",
  "im-yours-jason-mraz": "55461b7e-29a6-4bde-af22-1ffe534837dd",
  "perfect-ed-sheeran": "bf4d6c98-8132-4c79-8bb6-67c3e71047a3",
  "perfect-tanner-patrick": "fe7016ca-3e9e-4687-ac58-058dcf47cf2e",
  "you-are-the-reason-calum-scott": "b3fe0831-90a4-4b35-81cc-55fef93e2cd2",
  "always-isak-danielson": "b5d1f3f3-b969-444a-8726-79a4e8d53628",
  "little-things-one-direction": "06ebe82a-4f7a-4836-ab2e-3570a9720959",
  "i-know-you-know": "6c74b70a-3842-4e59-a0d4-a9b98c358a8d",
  "munn-loved-us-more": "fab5824b-43ae-44e8-8d8c-319d70a1d192"
}
```

---

## Database Schema

```prisma
model Song {
  id            String   @id @default(uuid())
  title         String   @db.VarChar(255)        // From: name
  artist        String   @db.VarChar(255)        // From: author
  album         String?  @db.VarChar(255)        // Set to: null
  duration      Int?
  filePath      String   @map("file_path")       // From: audio
  fileSize      Int?     @map("file_size")
  thumbnailPath String?  @map("thumbnail_path")  // From: img
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  published     Boolean  @default(false)         // Set to: true

  @@index([published])
  @@map("songs")
}
```

---

## Data Transformation

| Old Field     | New Field        | Format                 | Example                                           |
| ------------- | ---------------- | ---------------------- | ------------------------------------------------- |
| `id` (string) | Old ID reference | Stored in mapping file | `all-of-me-john-legend`                           |
| (generated)   | `id` (UUID)      | UUID v4                | `8612a648-0d01-4358-973f-2c0df8865be3`            |
| `name`        | `title`          | VarChar(255)           | `All Of Me`                                       |
| `author`      | `artist`         | VarChar(255)           | `John Legend`                                     |
| (none)        | `album`          | NULL                   | null                                              |
| `audio` (URL) | `filePath`       | songs/{uuid}.{ext}     | `songs/8612a648-0d01-4358-973f-2c0df8865be3.mp3`  |
| `img` (URL)   | `thumbnailPath`  | images/{uuid}.{ext}    | `images/8612a648-0d01-4358-973f-2c0df8865be3.png` |
| (none)        | `published`      | true                   | true                                              |

---

## How to Run Migration

### Prerequisites

```bash
# 1. Set environment variables in /apps/api/.env
OLD_NEXT_PUBLIC_SUPABASE_URL=https://old-project.supabase.co
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-old-key
SUPABASE_URL=https://new-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://user:password@localhost:5432/love_days

# 2. Verify buckets exist in Supabase
# - songs bucket (public)
# - images bucket (public)
```

### Run Migration

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api

# Dry run (no changes)
npm run migrate -- --dry-run

# Actual migration
npm run migrate

# With verbose output
npm run migrate -- --verbose
```

### Verify Success

```bash
# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) as count FROM songs;"
# Expected: 16

# Check mapping file
jq 'keys | length' scripts/migration-output/migration-mapping.json
# Expected: 16

# Test API
curl http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: Array of 16 songs with new UUIDs
```

---

## Common Tasks

### Task 1: Look up new UUID for old ID

```bash
jq '.["all-of-me-john-legend"]' scripts/migration-output/migration-mapping.json
# Output: "8612a648-0d01-4358-973f-2c0df8865be3"
```

### Task 2: Fetch song by new ID

```bash
curl http://localhost:3000/api/v1/songs/8612a648-0d01-4358-973f-2c0df8865be3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Task 3: Get all songs from database

```bash
curl http://localhost:3000/api/v1/songs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Task 4: Verify migration completeness

```sql
-- Check all records are present
SELECT COUNT(*) as total FROM songs;

-- Check all are published
SELECT COUNT(*) as published FROM songs WHERE published = true;

-- Check file paths are valid
SELECT file_path FROM songs LIMIT 1;
-- Should be: songs/{uuid}.{extension}
```

---

## Migration Code Structure

### Main Script Flow

```typescript
validateEnvironment()
  ↓
initializeClients()
  ↓
verifyBuckets()
  ↓
migrateDatabaseRecords()
  ├─ For each song:
  │  ├─ transformSongForDatabase()
  │  ├─ Create transaction
  │  ├─ Insert record
  │  └─ Create mapping entry
  ↓
saveMigrationMapping()
  ↓
cleanup()
```

### Key Functions

```typescript
// Transform old song to new database record
transformSongForDatabase(oldSong) {
  return {
    id: randomUUID(),
    title: oldSong.name,
    artist: oldSong.author || 'Unknown',
    album: null,
    filePath: `songs/{newId}.{ext}`,
    thumbnailPath: `images/{newId}.{ext}`,
    published: true
  }
}

// Generate Prisma adapter connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

---

## Important Notes

### Prisma 7 Changes

- ❌ Don't use: `url = env("DATABASE_URL")` in schema
- ✅ Do use: `provider = "postgresql"` + `DATABASE_URL` env var
- ✅ Use: `PrismaPg` adapter for connection pooling

### Transaction Safety

- All 16 inserts happen in a single transaction
- If any insert fails, entire migration rolls back
- Atomicity guaranteed: all or nothing

### ID Mapping File

- **Location**: `/apps/api/scripts/migration-output/migration-mapping.json`
- **Purpose**: Backward compatibility, old ID → new UUID lookup
- **Keep**: Safe to commit to git (no sensitive data)
- **Use**: Frontend migration, API redirects, audit trails

### Published Status

- All migrated songs: `published = true`
- Ready for consumption via public API
- Can be toggled individually if needed

---

## Troubleshooting Quick Fixes

| Issue                      | Check                      | Fix                                 |
| -------------------------- | -------------------------- | ----------------------------------- |
| "Missing env vars"         | `.env` file in `/apps/api` | Add missing variables               |
| "Connection refused"       | PostgreSQL running?        | `psql --version` or start DB        |
| "Missing buckets"          | Supabase console > Storage | Create 'songs' and 'images' buckets |
| "Migration duplicates"     | Already ran twice?         | DELETE from songs, re-run           |
| "Duplicate IDs in mapping" | Mapping file corrupted?    | Re-run migration                    |

---

## Next Steps

1. **Frontend Updates** - Update references to use new UUIDs
2. **File Verification** - Confirm audio/image files accessible via new paths
3. **API Testing** - Verify all song endpoints work with new IDs
4. **Remove Legacy Code** - Deprecate staticSongs from packages/utils

---

## Related Documentation

- **Full Details**: `PHASE02_DATABASE_MIGRATION_COMPLETION.md`
- **Presigned URLs**: `PHASE02_PRESIGNED_URL_UPLOAD.md`
- **API Reference**: `API_REFERENCE.md`
- **Backend Guide**: `BACKEND_DEVELOPER_GUIDE.md`

---

**Phase 02 Status**: ✅ Complete | **Date**: 2025-12-31
