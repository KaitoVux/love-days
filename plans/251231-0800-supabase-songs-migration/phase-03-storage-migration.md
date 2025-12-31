# Phase 3: Storage Migration

**Parent**: [Migration Plan](plan.md)
**Dependencies**: [Phase 1](phase-01-setup.md), [Phase 2](phase-02-database-migration.md)
**Date**: 2025-12-31
**Priority**: P0 (Critical)
**Status**: 🔴 Not Started

## Overview

Download audio files and thumbnails from old sources, extract metadata, upload to new Supabase storage, update database with file info.

**Duration**: 1-2 hours (network-dependent)
**Requires**: Phases 1-2 completed

## Key Insights

- 16 MP3 files (~3-5MB each = ~50-80MB total)
- Extract duration from MP3 metadata per user decision
- Keep original thumbnail formats per user decision
- Old audio files in old Supabase storage
- Thumbnails from external URLs (Wikipedia, CDN, etc.)
- Use existing 'images' bucket for thumbnails (not separate bucket)
- Network operations need retry logic
- Continue on thumbnail failure (use default)

## Requirements

### Functional

- Download 16 audio files from old Supabase
- Extract metadata (duration, bitrate, file size)
- Upload audio to new Supabase "songs" bucket
- Download thumbnails from external URLs
- Upload thumbnails to new Supabase "images" bucket (original format)
- Update database with fileSize, duration, actual paths
- Retry failed operations (3 attempts)
- Handle network timeouts gracefully

### Non-Functional

- Preserve audio quality (no re-encoding)
- Resume capability (skip already uploaded)
- Progress tracking with percentage
- Detailed error logging
- Bandwidth-efficient downloads

## Architecture

### File Naming Strategy

- Audio: `{uuid}.mp3` (e.g., `550e8400-e29b-41d4-a716-446655440000.mp3`)
- Thumbnail: `{uuid}.{original-ext}` (png/jpg/webp kept as-is)

### Storage Paths

- Old audio: `https://lzjihzubgrerjezxguyx.supabase.co/storage/v1/object/public/songs/The%20One%20-%20Kodaline.mp3`
- New audio: `https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/songs/550e8400-....mp3`
- New thumbnail: `https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/images/550e8400-....png`

### Metadata Extraction (music-metadata)

```typescript
{
  format: {
    duration: 234.5,        // seconds
    bitrate: 320000,        // bits/second
    sampleRate: 44100,      // Hz
  },
  common: {
    title: "The One",
    artist: "Kodaline",
    album: "In A Perfect World"
  }
}
```

## Related Files

**To Modify**:

- `apps/api/scripts/migrate-songs.ts` - Add storage migration logic
- `apps/api/scripts/migrate-songs-helpers.ts` - Add download/upload helpers

**To Reference**:

- `apps/api/src/storage/storage.service.ts` - Storage patterns
- `packages/utils/src/songs.ts` - Old URLs

## Implementation Steps

### 1. Add Download Helper Functions

In `apps/api/scripts/migrate-songs-helpers.ts`:

```typescript
import * as mm from "music-metadata";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";

const TEMP_DIR = path.join(__dirname, "migration-output", "temp");

export async function downloadFile(url: string, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { timeout: 30000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Download failed after retries");
}

export async function extractAudioMetadata(buffer: Buffer) {
  // Save to temp file for music-metadata
  await fs.mkdir(TEMP_DIR, { recursive: true });
  const tempPath = path.join(TEMP_DIR, `temp-${Date.now()}.mp3`);

  try {
    await fs.writeFile(tempPath, buffer);
    const metadata = await mm.parseFile(tempPath);

    return {
      duration: Math.round(metadata.format.duration || 0),
      bitrate: metadata.format.bitrate || 0,
      sampleRate: metadata.format.sampleRate || 0,
      fileSize: buffer.length,
    };
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

export function getThumbnailExtension(url: string): string {
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase();
  return ["png", "jpg", "jpeg", "webp"].includes(ext || "") ? ext! : "png";
}
```

### 2. Add Upload Helper Functions

```typescript
import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadToSupabase(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  retries = 3,
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType,
          upsert: true, // Allow re-upload
        });

      if (error) throw error;

      // Return public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error("Upload failed after retries");
}
```

### 3. Add Storage Migration Function

In `apps/api/scripts/migrate-songs.ts`:

```typescript
async function migrateStorageFiles(mapping: MigrationMapping[]): Promise<void> {
  log("info", "=== Phase 3: Storage Migration ===");

  for (let i = 0; i < mapping.length; i++) {
    const song = mapping[i];
    const progress = `[${i + 1}/${mapping.length}]`;

    log("info", `${progress} Processing: ${song.title}`);

    try {
      // 1. Download audio from old Supabase
      log("info", `  Downloading audio...`);
      const audioBuffer = await downloadFile(song.oldAudioUrl);

      // 2. Extract metadata
      log("info", `  Extracting metadata...`);
      const metadata = await extractAudioMetadata(audioBuffer);
      log(
        "info",
        `  Duration: ${metadata.duration}s, Size: ${Math.round(metadata.fileSize / 1024)}KB`,
      );

      // 3. Upload audio to new Supabase
      if (!isDryRun) {
        log("info", `  Uploading audio...`);
        const audioPath = `${song.newId}.mp3`;
        await uploadToSupabase(
          newSupabase,
          "songs",
          audioPath,
          audioBuffer,
          "audio/mpeg",
        );
        log("info", `  ✓ Audio uploaded`);

        // 4. Download thumbnail
        log("info", `  Downloading thumbnail...`);
        try {
          const thumbnailBuffer = await downloadFile(song.oldThumbnailUrl);
          const ext = getThumbnailExtension(song.oldThumbnailUrl);
          const thumbnailPath = `${song.newId}.${ext}`;
          const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

          log("info", `  Uploading thumbnail...`);
          await uploadToSupabase(
            newSupabase,
            "images",
            thumbnailPath,
            thumbnailBuffer,
            contentType,
          );
          log("info", `  ✓ Thumbnail uploaded`);
        } catch (error) {
          log(
            "warn",
            `  ! Thumbnail failed, will use default: ${error.message}`,
          );
        }

        // 5. Update database with metadata
        log("info", `  Updating database...`);
        await prisma.song.update({
          where: { id: song.newId },
          data: {
            duration: metadata.duration,
            fileSize: metadata.fileSize,
          },
        });
        log("info", `  ✓ Database updated`);
      } else {
        log("info", `  [DRY-RUN] Would upload audio and thumbnail`);
      }

      log("info", `  ✓ ${progress} Completed`);
    } catch (error) {
      log("error", `  ✗ ${progress} Failed: ${error.message}`);
      throw error; // Stop on first failure
    }
  }

  log("info", `Storage migration completed for ${mapping.length} songs`);
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

    // Phase 3: Storage Migration
    await migrateStorageFiles(mapping);

    log("info", "🎉 Migration completed successfully");
  } catch (error) {
    log("error", `Migration failed: ${error.message}`);
    throw error;
  }
}
```

### 5. Test Storage Migration

```bash
# Test one song first (modify script to limit to 1)
npx tsx scripts/migrate-songs.ts --verbose

# If successful, run full migration
npx tsx scripts/migrate-songs.ts --verbose
```

Expected output:

```
[INFO] === Phase 3: Storage Migration ===
[INFO] [1/16] Processing: The One
[INFO]   Downloading audio...
[INFO]   Extracting metadata...
[INFO]   Duration: 234s, Size: 4512KB
[INFO]   Uploading audio...
[INFO]   ✓ Audio uploaded
[INFO]   Downloading thumbnail...
[INFO]   Uploading thumbnail...
[INFO]   ✓ Thumbnail uploaded
[INFO]   Updating database...
[INFO]   ✓ Database updated
[INFO]   ✓ [1/16] Completed
...
[INFO] Storage migration completed for 16 songs
```

### 6. Verify Uploads

```bash
# Check Supabase dashboard
# https://app.supabase.com/project/pizsodtvikocjjpqxwbh/storage/buckets/songs
# https://app.supabase.com/project/pizsodtvikocjjpqxwbh/storage/buckets/images

# Test public URLs
curl -I "https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/songs/{uuid}.mp3"
curl -I "https://pizsodtvikocjjpqxwbh.supabase.co/storage/v1/object/public/images/{uuid}.png"
# Should return 200 OK
```

## Todo List

- [ ] Add `downloadFile()` helper with retry logic
- [ ] Add `extractAudioMetadata()` using music-metadata
- [ ] Add `uploadToSupabase()` helper
- [ ] Implement `migrateStorageFiles()` function
- [ ] Add progress logging for each file
- [ ] Handle thumbnail download failures gracefully
- [ ] Test migration with 1 song first
- [ ] Run full migration for all 16 songs
- [ ] Verify all audio files accessible
- [ ] Verify all thumbnails accessible (or default used)
- [ ] Verify database updated with duration and fileSize

## Success Criteria

- ✅ 16 audio files uploaded to "songs" bucket
- ✅ All audio files accessible via public URLs
- ✅ 16 thumbnails uploaded to "images" bucket (or defaults used)
- ✅ All thumbnails accessible via public URLs
- ✅ Database updated with duration (seconds)
- ✅ Database updated with fileSize (bytes)
- ✅ Original audio quality preserved
- ✅ Original thumbnail formats preserved

## Risk Assessment

**High Risk**: Network failures during large downloads

- Mitigation: Retry logic (3 attempts with backoff)
- Mitigation: Resume capability (check if file exists before upload)

**Medium Risk**: External thumbnail URLs unavailable

- Mitigation: Continue on failure (log warning)
- Mitigation: Use default thumbnail as fallback

**Low Risk**: Supabase storage quota exceeded

- Mitigation: Pre-calculated total size (~80MB well within 1GB limit)
- Mitigation: Monitor storage usage in dashboard

## Security Considerations

- Validate file types before upload (audio/mpeg, image/\*)
- Validate file sizes (max 10MB audio, 2MB thumbnails)
- Use SUPABASE_SERVICE_KEY for uploads
- Set bucket policies to prevent unauthorized writes
- Clean up temp files after processing

## Next Steps

After completion:

1. Proceed to [Phase 4: Verification](phase-04-verification.md)
2. All files are now in new Supabase storage
3. Database has complete metadata for all songs
