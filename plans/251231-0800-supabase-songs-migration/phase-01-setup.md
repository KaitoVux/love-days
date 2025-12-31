# Phase 1: Setup & Preparation

**Parent**: [Migration Plan](plan.md)
**Date**: 2025-12-31
**Priority**: P0 (Critical)
**Status**: ✅ COMPLETE (2025-12-31 08:00)

## Overview

Setup Supabase storage buckets and create migration script scaffold with dry-run capability.

**Duration**: 30-45 minutes
**Dependencies**: None

## Key Insights

- Need 2 public storage buckets in new Supabase
- Migration script should be idempotent and resumable
- Dry-run mode prevents accidental data changes
- Environment validation prevents runtime errors

## Requirements

### Functional

- Verify "songs" bucket exists and is accessible
- Verify "images" bucket exists and is accessible (will use for thumbnails)
- Scaffold migration script with logging
- Validate all environment variables
- Implement dry-run mode flag

### Non-Functional

- Script runs without errors in dry-run mode
- Clear progress logging (console + file)
- Error messages are actionable
- Zero manual configuration after env setup

## Architecture

### Supabase Buckets (Existing)

```typescript
// songs bucket - already exists
{
  name: "songs",
  public: true,
  allowedMimeTypes: ["audio/mpeg", "audio/mp3"]
}

// images bucket - already exists (will use for thumbnails)
{
  name: "images",
  public: true,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
}
```

### Migration Script Structure

```
apps/api/scripts/
├── migrate-songs.ts              # Main script
├── migrate-songs-helpers.ts      # Helper functions
└── migration-output/
    ├── migration.log             # Detailed log
    └── migration-mapping.json    # ID mapping (generated later)
```

## Related Files

**To Create**:

- `apps/api/scripts/migrate-songs.ts` (~180 lines)
- `apps/api/scripts/migrate-songs-helpers.ts` (~100 lines)

**To Reference**:

- `apps/api/src/storage/storage.service.ts` - Storage patterns
- `apps/web/.env.local` - Environment variables
- `packages/utils/src/songs.ts` - Source data

## Implementation Steps

### 1. Verify Supabase Storage Buckets

```bash
# Navigate to new Supabase dashboard
# https://app.supabase.com/project/pizsodtvikocjjpqxwbh/storage/buckets

# Verify 'songs' bucket exists:
- Name: songs ✅ (already exists)
- Public: true
- Ready for audio files

# Verify 'images' bucket exists:
- Name: images ✅ (already exists)
- Public: true
- Will use for song thumbnails
```

Add bucket verification to migration script:

```typescript
async function verifyBuckets() {
  const { data: buckets, error } = await newSupabase.storage.listBuckets();

  if (error) throw new Error(`Failed to list buckets: ${error.message}`);

  const requiredBuckets = ["songs", "images"];
  const existingBuckets = buckets.map((b) => b.name);
  const missing = requiredBuckets.filter((b) => !existingBuckets.includes(b));

  if (missing.length > 0) {
    throw new Error(`Missing buckets: ${missing.join(", ")}`);
  }

  log("info", "✓ Buckets verified: songs, images");
}
```

### 2. Install Dependencies

```bash
cd apps/api
npm install --save-dev music-metadata
npm install --save-dev @types/node-fetch
```

### 3. Create Migration Script Scaffold

`apps/api/scripts/migrate-songs.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as mm from "music-metadata";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";

// Environment validation
const requiredEnvVars = [
  "OLD_NEXT_PUBLIC_SUPABASE_URL",
  "OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "DATABASE_URL",
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

// Clients
const prisma = new PrismaClient();
const oldSupabase = createClient(
  process.env.OLD_NEXT_PUBLIC_SUPABASE_URL!,
  process.env.OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const newSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// CLI flags
const isDryRun = process.argv.includes("--dry-run");
const isVerbose = process.argv.includes("--verbose");

// Logger
function log(level: "info" | "warn" | "error", message: string) {
  const timestamp = new Date().toISOString();
  const prefix = isDryRun ? "[DRY-RUN]" : "";
  console.log(`${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`);
}

async function main() {
  log("info", "Starting migration...");

  // Validate environment
  validateEnvironment();
  log("info", "Environment validated");

  // TODO: Implement migration phases
  if (isDryRun) {
    log("info", "Dry-run completed successfully");
  } else {
    log("info", "Migration completed successfully");
  }
}

main()
  .catch((error) => {
    log("error", error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### 4. Create Helper Functions File

`apps/api/scripts/migrate-songs-helpers.ts`:

```typescript
import { staticSongs } from "../../../packages/utils/src/songs";

export interface MigrationSong {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
  oldAudioUrl: string;
  oldThumbnailUrl: string;
}

export function extractSongsData(): MigrationSong[] {
  return staticSongs.map((song) => ({
    oldId: song.id,
    newId: "", // Will be set during DB insertion
    title: song.name,
    artist: song.author || "Unknown",
    oldAudioUrl: song.audio,
    oldThumbnailUrl: song.img,
  }));
}

export function getAudioFilename(oldUrl: string): string {
  return oldUrl.split("/").pop() || "";
}

export async function saveMappingFile(
  songs: MigrationSong[],
  outputPath: string,
) {
  const mapping = songs.reduce(
    (acc, song) => {
      acc[song.oldId] = song.newId;
      return acc;
    },
    {} as Record<string, string>,
  );

  await fs.writeFile(outputPath, JSON.stringify(mapping, null, 2));
}
```

### 5. Test Dry-Run Mode

```bash
cd apps/api
npx tsx scripts/migrate-songs.ts --dry-run
```

Expected output:

```
2025-12-31T08:00:00.000Z [INFO] Starting migration...
2025-12-31T08:00:00.100Z [INFO] Environment validated
2025-12-31T08:00:00.200Z [DRY-RUN] [INFO] Dry-run completed successfully
```

## Todo List

- [x] Verify "songs" bucket exists in Supabase dashboard
- [x] Verify "images" bucket exists in Supabase dashboard
- [x] Verify both buckets are public and accessible
- [x] Install npm dependencies (music-metadata, @types/node-fetch)
- [x] Create `apps/api/scripts/migrate-songs.ts`
- [x] Create `apps/api/scripts/migrate-songs-helpers.ts`
- [x] Add bucket verification function to script
- [x] Create `apps/api/scripts/migration-output/` directory
- [x] Test dry-run mode successfully
- [x] Verify environment variables are set correctly

## Success Criteria

- ✅ Both storage buckets verified (songs, images)
- ✅ Buckets are public and accessible
- ✅ Migration script runs without errors in dry-run mode
- ✅ All environment variables validated
- ✅ Helper functions extract 16 songs from staticSongs
- ✅ Logging outputs to console clearly

## Risk Assessment

**Low Risk**: Configuration errors

- Mitigation: Validation functions catch errors early

**Low Risk**: Missing dependencies

- Mitigation: Clear error messages guide installation

## Security Considerations

- Use SUPABASE_SERVICE_KEY (not ANON_KEY) for writes
- Never commit service keys to git
- Set bucket policies: public read, auth write only
- Validate file types and sizes on upload

## Next Steps

After completion:

1. Proceed to [Phase 2: Database Migration](phase-02-database-migration.md)
2. Script is ready to implement actual migration logic
3. Buckets are ready to receive files
