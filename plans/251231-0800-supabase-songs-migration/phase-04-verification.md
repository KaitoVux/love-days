# Phase 4: Verification & Testing

**Parent**: [Migration Plan](plan.md)
**Dependencies**: [Phase 1](phase-01-setup.md), [Phase 2](phase-02-database-migration.md), [Phase 3](phase-03-storage-migration.md)
**Date**: 2025-12-31
**Priority**: P0 (Critical)
**Status**: 🔴 Not Started

## Overview

Verify database records, storage files, API endpoints, and audio player functionality to ensure migration success.

**Duration**: 30-45 minutes
**Requires**: Phases 1-3 completed

## Key Insights

- Verification must be comprehensive before going live
- Test both backend API and frontend integration
- Validate data integrity and file accessibility
- Ensure zero data loss from migration
- Check performance metrics (response times, file load times)

## Requirements

### Functional

- Verify 16 records in PostgreSQL
- Verify all required fields populated
- Test all audio file URLs (HTTP 200)
- Test all thumbnail URLs (HTTP 200)
- Test API GET /api/v1/songs?published=true
- Test API GET /api/v1/songs/{id}
- Test frontend audio player with migrated data
- Validate data matches original staticSongs

### Non-Functional

- API response time < 500ms
- Audio files load within 3 seconds
- No broken links or 404 errors
- Frontend displays all songs correctly

## Architecture

### Verification Checklist

```typescript
interface VerificationResults {
  database: {
    totalRecords: number;
    allFieldsPopulated: boolean;
    allPublished: boolean;
  };
  storage: {
    audioFilesAccessible: number;
    thumbnailsAccessible: number;
    brokenLinks: string[];
  };
  api: {
    endpointsWorking: boolean;
    responseTime: number;
    dataIntegrity: boolean;
  };
  frontend: {
    audioPlayerWorks: boolean;
    allSongsDisplay: boolean;
  };
}
```

## Related Files

**To Create**:

- `apps/api/scripts/verify-migration.ts` - Verification script (~150 lines)

**To Reference**:

- `apps/api/src/songs/songs.controller.ts` - API endpoints
- `apps/web/components/LoveDays/MusicSidebar.tsx` - Audio player
- `packages/utils/src/api-client.ts` - API client functions

## Implementation Steps

### 1. Create Verification Script

`apps/api/scripts/verify-migration.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface VerificationError {
  check: string;
  error: string;
}

const errors: VerificationError[] = [];

async function verifyDatabase() {
  console.log("=== Database Verification ===");

  // Check total count
  const count = await prisma.song.count();
  console.log(`Total songs: ${count}`);
  if (count !== 16) {
    errors.push({
      check: "database-count",
      error: `Expected 16 songs, found ${count}`,
    });
  }

  // Check all published
  const publishedCount = await prisma.song.count({
    where: { published: true },
  });
  console.log(`Published songs: ${publishedCount}`);
  if (publishedCount !== 16) {
    errors.push({
      check: "database-published",
      error: `Expected 16 published, found ${publishedCount}`,
    });
  }

  // Check required fields
  const songs = await prisma.song.findMany();
  for (const song of songs) {
    const missing = [];
    if (!song.title) missing.push("title");
    if (!song.artist) missing.push("artist");
    if (!song.filePath) missing.push("filePath");
    if (!song.duration) missing.push("duration");
    if (!song.fileSize) missing.push("fileSize");

    if (missing.length > 0) {
      errors.push({
        check: `database-fields-${song.id}`,
        error: `Song "${song.title}" missing: ${missing.join(", ")}`,
      });
    }
  }

  console.log(`✓ Database verification complete\n`);
  return songs;
}

async function verifyStorage(songs: any[]) {
  console.log("=== Storage Verification ===");

  let audioSuccess = 0;
  let thumbnailSuccess = 0;

  for (const song of songs) {
    // Test audio URL
    const audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/songs/${song.filePath.split("/")[1]}`;
    try {
      const response = await fetch(audioUrl, { method: "HEAD" });
      if (response.ok) {
        audioSuccess++;
      } else {
        errors.push({
          check: `storage-audio-${song.id}`,
          error: `Audio HTTP ${response.status}: ${audioUrl}`,
        });
      }
    } catch (error) {
      errors.push({
        check: `storage-audio-${song.id}`,
        error: `Audio fetch failed: ${error.message}`,
      });
    }

    // Test thumbnail URL (if exists)
    if (song.thumbnailPath) {
      const thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${song.thumbnailPath.split("/")[1]}`;
      try {
        const response = await fetch(thumbnailUrl, { method: "HEAD" });
        if (response.ok) {
          thumbnailSuccess++;
        } else {
          errors.push({
            check: `storage-thumbnail-${song.id}`,
            error: `Thumbnail HTTP ${response.status}`,
          });
        }
      } catch (error) {
        errors.push({
          check: `storage-thumbnail-${song.id}`,
          error: `Thumbnail fetch failed: ${error.message}`,
        });
      }
    }
  }

  console.log(`Audio files accessible: ${audioSuccess}/16`);
  console.log(`Thumbnails accessible: ${thumbnailSuccess}/16`);
  console.log(`✓ Storage verification complete\n`);
}

async function verifyAPI() {
  console.log("=== API Verification ===");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  // Test GET /api/v1/songs?published=true
  try {
    const start = Date.now();
    const response = await fetch(`${apiUrl}/api/v1/songs?published=true`);
    const duration = Date.now() - start;

    if (!response.ok) {
      errors.push({
        check: "api-list",
        error: `GET /songs returned ${response.status}`,
      });
    } else {
      const data = await response.json();
      console.log(`GET /songs returned ${data.length} songs in ${duration}ms`);

      if (data.length !== 16) {
        errors.push({
          check: "api-list-count",
          error: `Expected 16 songs, got ${data.length}`,
        });
      }

      // Verify response structure
      const firstSong = data[0];
      const requiredFields = ["id", "title", "artist", "fileUrl"];
      const missing = requiredFields.filter((f) => !firstSong[f]);
      if (missing.length > 0) {
        errors.push({
          check: "api-response-structure",
          error: `Missing fields: ${missing.join(", ")}`,
        });
      }
    }
  } catch (error) {
    errors.push({
      check: "api-list",
      error: `API request failed: ${error.message}`,
    });
  }

  console.log(`✓ API verification complete\n`);
}

async function printResults() {
  console.log("=== Verification Results ===");

  if (errors.length === 0) {
    console.log("✅ All checks passed!");
    console.log(
      "\nMigration verified successfully. Ready to proceed to Phase 5.",
    );
  } else {
    console.log(`❌ Found ${errors.length} errors:\n`);
    errors.forEach((e) => {
      console.log(`  [${e.check}] ${e.error}`);
    });
    console.log("\n⚠️  Please fix errors before proceeding.");
    process.exit(1);
  }
}

async function main() {
  console.log("Starting migration verification...\n");

  try {
    const songs = await verifyDatabase();
    await verifyStorage(songs);
    await verifyAPI();
    await printResults();
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 2. Run Database Verification

```bash
cd apps/api
npx tsx scripts/verify-migration.ts
```

Expected output:

```
=== Database Verification ===
Total songs: 16
Published songs: 16
✓ Database verification complete

=== Storage Verification ===
Audio files accessible: 16/16
Thumbnails accessible: 16/16
✓ Storage verification complete

=== API Verification ===
GET /songs returned 16 songs in 245ms
✓ API verification complete

=== Verification Results ===
✅ All checks passed!

Migration verified successfully. Ready to proceed to Phase 5.
```

### 3. Manual API Testing

```bash
# Test list endpoint
curl "http://localhost:3002/api/v1/songs?published=true" | jq

# Test single song endpoint
curl "http://localhost:3002/api/v1/songs/{uuid}" | jq

# Test file accessibility
curl -I "https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/songs/{uuid}.mp3"
```

### 4. Frontend Integration Test

Start the API and web app:

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start web app
cd apps/web
npm run dev
```

Test checklist:

- [ ] Navigate to http://localhost:3000
- [ ] Open MusicSidebar component
- [ ] Verify 16 songs appear in playlist
- [ ] Click on a song to play
- [ ] Verify audio loads and plays
- [ ] Verify thumbnail displays correctly
- [ ] Test next/previous buttons
- [ ] Test volume and progress controls
- [ ] Check browser console for errors

### 5. Data Integrity Validation

Create comparison script:

```typescript
// Compare migrated data with original staticSongs
import { staticSongs } from "../../../packages/utils/src/songs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compareData() {
  const migratedSongs = await prisma.song.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log("Comparing titles and artists...");
  const mismatches = [];

  for (let i = 0; i < staticSongs.length; i++) {
    const original = staticSongs[i];
    const migrated = migratedSongs.find(
      (s) => s.title === original.name && s.artist === original.author,
    );

    if (!migrated) {
      mismatches.push(`Missing: ${original.name} by ${original.author}`);
    }
  }

  if (mismatches.length === 0) {
    console.log("✅ All songs migrated correctly");
  } else {
    console.log(`❌ Found ${mismatches.length} mismatches:`);
    mismatches.forEach((m) => console.log(`  - ${m}`));
  }
}
```

### 6. Performance Testing

```bash
# Test API response time (should be < 500ms)
time curl "http://localhost:3002/api/v1/songs?published=true" > /dev/null

# Test audio file load time (should be < 3s for first byte)
time curl -s -o /dev/null -w "%{time_starttransfer}\n" "https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/songs/{uuid}.mp3"
```

## Todo List

- [ ] Create `apps/api/scripts/verify-migration.ts`
- [ ] Run database verification (16 records check)
- [ ] Run storage verification (all URLs accessible)
- [ ] Run API verification (endpoints working)
- [ ] Test API list endpoint manually
- [ ] Test API single song endpoint manually
- [ ] Start frontend and test audio player
- [ ] Verify all 16 songs display in UI
- [ ] Test audio playback for sample songs
- [ ] Run data integrity comparison
- [ ] Run performance tests
- [ ] Document any issues found

## Success Criteria

- ✅ Database has exactly 16 songs
- ✅ All songs have required fields populated
- ✅ All songs published=true
- ✅ All 16 audio files accessible from "songs" bucket (HTTP 200)
- ✅ All 16 thumbnails accessible from "images" bucket (HTTP 200)
- ✅ API returns 16 songs with correct structure
- ✅ API response time < 500ms
- ✅ Frontend displays all 16 songs
- ✅ Audio player works without errors
- ✅ No console errors in browser
- ✅ Data matches original staticSongs

## Risk Assessment

**Low Risk**: API not running during verification

- Mitigation: Start API before running verification script
- Mitigation: Clear error messages guide troubleshooting

**Low Risk**: Temporary network issues

- Mitigation: Retry verification if transient failures occur

## Security Considerations

- Use ANON_KEY for public read operations
- No sensitive data exposed in verification logs
- Verification script safe to run in production

## Next Steps

After successful verification:

1. Proceed to [Phase 5: Frontend Updates](phase-05-frontend-updates.md)
2. Migration is confirmed successful
3. Ready to update frontend to use migrated data
