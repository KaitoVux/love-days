# Phase 2: Database Migration

**Parent**: [Migration Plan](plan.md)
**Dependencies**: [Phase 1](phase-01-setup.md)
**Date**: 2025-12-31
**Priority**: P0 (Critical)
**Status**: ✅ DONE - 2025-12-31T08:30:00Z

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

### ✅ Implementation Complete (10/10)

- [x] Add `transformSongForDatabase()` helper function
- [x] Add `migrateDatabaseRecords()` to main script
- [x] Add `saveMigrationMapping()` function
- [x] Implement transaction-based insertion
- [x] Add progress logging (X/16 format)
- [x] Dry-run mode implemented and tested
- [x] TypeScript compilation passes
- [x] ESLint validation passes
- [x] Execute actual database migration
- [x] Verify all 16 records inserted successfully

### ✅ Code Review Fixes Applied

- [x] **FIXED**: Dead code removed (extractSongsData, createMappingEntry)
- [x] **FIXED**: Idempotency checks implemented
- [x] **FIXED**: Security hardening applied (no process.env mutation)
- [x] **FIXED**: Input validation added (file extension whitelist, string checks)
- [x] **FIXED**: Error logging improved with proper context

### ✅ Verification Complete

- [x] Test dry-run mode (`npm run migrate -- --dry-run --verbose`)
- [x] Execute actual database migration
- [x] Verify all 16 records in database
- [x] Verify mapping file created correctly
- [x] Check all records have published=true

## Success Criteria - ALL MET ✅

- ✅ 16 records inserted into `songs` table
- ✅ All records have new UUIDs (not old IDs)
- ✅ All records have published=true
- ✅ Mapping file saved with 16 entries (`scripts/migration-output/migration-mapping.json`)
- ✅ No duplicate titles/artists
- ✅ Transaction committed successfully
- ✅ Album field is null for all records
- ✅ Migration script passes all code review requirements
- ✅ Database verified with all 16 songs present
- ✅ UUID mapping file generated and validated

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

## Code Review Status

**Initial Review Date**: 2025-12-31
**Initial Report**: [reports/code-reviewer-251231-phase02-database-migration.md](reports/code-reviewer-251231-phase02-database-migration.md)
**Initial Verdict**: ⚠️ Critical issues identified

**Final Review Date**: 2025-12-31
**Final Verdict**: ✅ **ALL CRITICAL ISSUES RESOLVED - MIGRATION EXECUTED SUCCESSFULLY**

**Fixes Applied**:

1. ✅ Security: Removed all potential service key exposure vectors
2. ✅ Architecture: Removed all dead code (extractSongsData, createMappingEntry)
3. ✅ Logic: Implemented idempotency checks (upsert pattern with pre-flight validation)
4. ✅ Security: Added comprehensive input validation (whitelist, length checks)
5. ✅ Architecture: Fixed connection pool management with proper cleanup

**Actual Fix Time**: 1.5 hours
**Re-review Completed**: Yes - Migration executed with full approval

---

## Completion Summary

**Phase Completed**: 2025-12-31 08:30 UTC
**Duration**: Approximately 1.5-2 hours from implementation to successful execution

### Deliverables

| File                                                       | Status | Purpose                                   |
| ---------------------------------------------------------- | ------ | ----------------------------------------- |
| `apps/api/scripts/migrate-songs.ts`                        | ✅     | Main migration script with database logic |
| `apps/api/scripts/migrate-songs-helpers.ts`                | ✅     | Data transformation helper functions      |
| `apps/api/scripts/migration-output/migration-mapping.json` | ✅     | UUID mapping file for all 16 songs        |
| `apps/api/prisma/schema.prisma`                            | ✅     | Restored to original state                |

### Migration Results

- **Total Songs Migrated**: 16
- **New UUIDs Generated**: 16
- **Published Flag**: true (all records)
- **Album Field**: null (all records)
- **Database Transactions**: 1 (atomic, all-or-nothing)
- **Mapping Entries**: 16

### Quality Metrics

- Code Coverage: 100% of song records migrated
- Error Handling: Proper transaction rollback on failure
- Logging: Progress indicators for all 16 records
- Idempotency: Fully idempotent (safe to re-run)
- Security: All code review findings addressed

---

## Next Steps

**COMPLETED - READY FOR PHASE 3**:

1. ✅ Applied all critical fixes from code review
2. ✅ Tested dry-run mode successfully
3. ✅ Backed up database via Supabase dashboard
4. ✅ Obtained code re-review approval
5. ✅ Executed migration successfully
6. ✅ Verified 16 records inserted successfully

**Proceed to [Phase 3: Storage Migration](phase-03-storage-migration.md)**

- Use migration-mapping.json to correlate old URLs with new UUIDs
- File transfer from Supabase storage to new structure
- Update filePath and thumbnailPath references
