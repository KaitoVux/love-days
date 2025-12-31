# Phase 2: Database Migration

**Parent**: [Migration Plan](plan.md)
**Dependencies**: [Phase 1](phase-01-setup.md)
**Date**: 2025-12-31
**Priority**: P0 (Critical)
**Status**: 🔴 Not Started

## Overview

Extract song metadata from staticSongs array, transform to new schema, insert into PostgreSQL with new UUIDs.

**Duration**: 45-60 minutes
**Requires**: Phase 1 completed

## Key Insights

- staticSongs array is the single source of truth (16 entries)
- Generate new UUIDs instead of preserving old IDs
- Album field should be null per user decision
- Duration will be extracted from MP3 metadata in Phase 3
- Need ID mapping file for verification and rollback

## Requirements

### Functional

- Extract 16 songs from staticSongs array
- Generate new UUID for each song
- Map old structure to Prisma Song model
- Insert records into PostgreSQL
- Set published=true for all songs
- Create ID mapping JSON file
- Handle transaction rollback on failure

### Non-Functional

- Idempotent (can re-run safely)
- Atomic operation (all or nothing)
- Clear error messages for debugging
- Progress logging (1/16, 2/16, etc.)

## Architecture

### Data Transformation

**Source** (`packages/utils/src/songs.ts`):

```typescript
{
  id: "the-one-kodaline",           // kebab-case
  name: "The One",                   // Song title
  author: "Kodaline",                // Artist
  audio: "https://old.../The One - Kodaline.mp3",
  img: "https://upload.wikimedia.org/..."
}
```

**Destination** (Prisma Song model):

```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // NEW UUID
  title: "The One",                             // From name
  artist: "Kodaline",                           // From author
  album: null,                                  // Per user decision
  duration: null,                               // Set in Phase 3
  filePath: "songs/550e8400-e29b-41d4-a716-446655440000.mp3",
  fileSize: null,                               // Set in Phase 3
  thumbnailPath: "images/550e8400-e29b-41d4-a716-446655440000.png",
  published: true,                              // All published
  createdAt: "2025-12-31T08:00:00.000Z",       // Auto
  updatedAt: "2025-12-31T08:00:00.000Z"        // Auto
}
```

### ID Mapping File Format

```json
{
  "the-one-kodaline": "550e8400-e29b-41d4-a716-446655440000",
  "all-of-me-john-legend": "660e8400-e29b-41d4-a716-446655440001",
  ...
}
```

## Related Files

**To Modify**:

- `apps/api/scripts/migrate-songs.ts` - Add database migration logic
- `apps/api/scripts/migrate-songs-helpers.ts` - Add transform functions

**To Reference**:

- `apps/api/prisma/schema.prisma` - Song model definition
- `packages/utils/src/songs.ts` - Source data (16 songs)

## Implementation Steps

### 1. Add Transform Function

In `apps/api/scripts/migrate-songs-helpers.ts`:

```typescript
import { randomUUID } from "crypto";

export interface TransformedSong {
  id: string; // NEW UUID
  title: string;
  artist: string;
  album: string | null;
  filePath: string;
  thumbnailPath: string;
  published: boolean;
}

export function transformSongForDatabase(
  oldSong: (typeof staticSongs)[0],
): TransformedSong {
  const newId = randomUUID();
  const fileExtension =
    getAudioFilename(oldSong.audio).split(".").pop() || "mp3";
  const thumbnailExtension =
    oldSong.img.split(".").pop()?.split("?")[0] || "png";

  return {
    id: newId,
    title: oldSong.name,
    artist: oldSong.author || "Unknown",
    album: null, // Per user decision
    filePath: `songs/${newId}.${fileExtension}`,
    thumbnailPath: `images/${newId}.${thumbnailExtension}`,
    published: true,
  };
}

export function createMappingEntry(
  oldId: string,
  newId: string,
): { oldId: string; newId: string } {
  return { oldId, newId };
}
```

### 2. Add Database Migration Function

In `apps/api/scripts/migrate-songs.ts`:

```typescript
async function migrateDatabaseRecords(): Promise<MigrationMapping[]> {
  log("info", "=== Phase 2: Database Migration ===");

  const songs = extractSongsData();
  const mapping: MigrationMapping[] = [];

  log("info", `Found ${songs.length} songs to migrate`);

  if (isDryRun) {
    log("info", "[DRY-RUN] Would insert records into database");
    // Simulate mapping
    return songs.map((song) => ({
      oldId: song.oldId,
      newId: randomUUID(),
      title: song.title,
      artist: song.artist,
    }));
  }

  // Use transaction for atomicity
  const inserted = await prisma.$transaction(async (tx) => {
    const results: MigrationMapping[] = [];

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const transformed = transformSongForDatabase(song);

      log(
        "info",
        `[${i + 1}/${songs.length}] Inserting: ${transformed.title} by ${transformed.artist}`,
      );

      const record = await tx.song.create({
        data: {
          id: transformed.id,
          title: transformed.title,
          artist: transformed.artist,
          album: transformed.album,
          filePath: transformed.filePath,
          thumbnailPath: transformed.thumbnailPath,
          published: transformed.published,
        },
      });

      results.push({
        oldId: song.oldId,
        newId: record.id,
        title: record.title,
        artist: record.artist,
      });

      if (isVerbose) {
        log("info", `  ✓ Created record with ID: ${record.id}`);
      }
    }

    return results;
  });

  log("info", `Successfully inserted ${inserted.length} records`);
  return inserted;
}
```

### 3. Save Mapping File

```typescript
async function saveMigrationMapping(mapping: MigrationMapping[]) {
  const outputDir = path.join(__dirname, "migration-output");
  const outputPath = path.join(outputDir, "migration-mapping.json");

  await fs.mkdir(outputDir, { recursive: true });

  const mappingObject = mapping.reduce(
    (acc, m) => {
      acc[m.oldId] = m.newId;
      return acc;
    },
    {} as Record<string, string>,
  );

  await fs.writeFile(outputPath, JSON.stringify(mappingObject, null, 2));
  log("info", `Mapping file saved: ${outputPath}`);
}
```

### 4. Update Main Function

```typescript
async function main() {
  log("info", "Starting migration...");
  validateEnvironment();

  try {
    // Phase 2: Database Migration
    const mapping = await migrateDatabaseRecords();
    await saveMigrationMapping(mapping);

    log("info", "Migration completed successfully");
  } catch (error) {
    log("error", `Migration failed: ${error.message}`);
    throw error;
  }
}
```

### 5. Test Migration

```bash
# Dry run first
npx tsx scripts/migrate-songs.ts --dry-run --verbose

# Actual migration
npx tsx scripts/migrate-songs.ts --verbose
```

Expected output:

```
[INFO] === Phase 2: Database Migration ===
[INFO] Found 16 songs to migrate
[INFO] [1/16] Inserting: The One by Kodaline
[INFO]   ✓ Created record with ID: 550e8400-...
...
[INFO] [16/16] Inserting: Munn by Loved Us More
[INFO] Successfully inserted 16 records
[INFO] Mapping file saved: ./migration-output/migration-mapping.json
```

### 6. Verify Database Records

```bash
# Check in Prisma Studio
npx prisma studio

# Or query directly
npx prisma db execute --stdin <<SQL
SELECT id, title, artist, published, created_at
FROM songs
ORDER BY created_at DESC
LIMIT 16;
SQL
```

## Todo List

- [ ] Add `transformSongForDatabase()` helper function
- [ ] Add `migrateDatabaseRecords()` to main script
- [ ] Add `saveMigrationMapping()` function
- [ ] Implement transaction-based insertion
- [ ] Add progress logging (X/16 format)
- [ ] Test dry-run mode
- [ ] Execute actual database migration
- [ ] Verify all 16 records in database
- [ ] Verify mapping file created correctly
- [ ] Check all records have published=true

## Success Criteria

- ✅ 16 records inserted into `songs` table
- ✅ All records have new UUIDs (not old IDs)
- ✅ All records have published=true
- ✅ Mapping file saved with 16 entries
- ✅ No duplicate titles/artists
- ✅ Transaction committed successfully
- ✅ Album field is null for all records

## Risk Assessment

**Medium Risk**: Transaction failure mid-insertion

- Mitigation: Prisma transactions provide automatic rollback
- Mitigation: Can re-run migration safely (idempotent)

**Low Risk**: Duplicate records on re-run

- Mitigation: Check if records exist before inserting
- Mitigation: Use unique constraints on title+artist

## Security Considerations

- Database credentials via environment variables only
- Use parameterized queries (Prisma handles this)
- No SQL injection risk (ORM layer)
- Validate input data before insertion

## Next Steps

After completion:

1. Proceed to [Phase 3: Storage Migration](phase-03-storage-migration.md)
2. Use mapping file to correlate old URLs with new UUIDs
3. Database is ready to receive file paths and metadata
