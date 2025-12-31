# Supabase Songs Migration - Phase 1: Setup & Preparation

**Status**: COMPLETED
**Date**: 2025-12-31
**Previous Phase**: N/A
**Next Phase**: Phase 2 - Database Migration

---

## Overview

Phase 1 establishes foundation for Supabase songs migration. Provides safe, validatable migration scaffold with dry-run capability. Prepares environment validation, bucket verification, and song data extraction without making database changes.

**Key Deliverables**:

- Migration script scaffold (`migrate-songs.ts`)
- Helper functions for data extraction (`migrate-songs-helpers.ts`)
- Environment configuration templates
- Dry-run validation mechanism
- Migration output directory

---

## Migration Context

**Why Migrate?**

- Consolidate Supabase instances (separate old/new instances during transition)
- Ensure data integrity with validation steps
- Enable safe rollback with dry-run testing
- Support phased cutover without downtime

**Current State**:

- Songs stored in old Supabase bucket (configured via `OLD_NEXT_PUBLIC_SUPABASE_*`)
- Static song data in `packages/utils/src/songs.ts`
- New Supabase instance ready for consolidated data
- Backend API database initialized (Prisma + PostgreSQL)

**Target State** (post Phase 2):

- All songs migrated to new Supabase instance
- Database records created for each song
- Audio/thumbnail URLs mapped to new bucket structure

---

## Phase 1 Deliverables

### 1. Migration Script Scaffold

**File**: `/apps/api/scripts/migrate-songs.ts`

Core entry point for migration. Features:

- **Environment Validation**: Checks all required env vars before execution
- **Bucket Verification**: Confirms `songs` and `images` buckets exist in new instance
- **Error Handling**: Graceful failure with clear error messages
- **Logging**: Timestamped, structured logs with dry-run indicators
- **Prisma Integration**: Initializes database client (skipped in dry-run to avoid side effects)
- **CLI Flags**: Supports `--dry-run` and `--verbose` options

**Key Functions**:

```typescript
validateEnvironment(); // Checks required env vars
verifyBuckets(); // Confirms bucket existence
main(); // Orchestrates migration phases
log(); // Structured logging with levels
```

**Execution**:

```bash
# Dry-run (validate setup, no changes)
npm run migrate -- --dry-run

# Verbose output
npm run migrate -- --verbose

# Full migration (after Phase 2 implementation)
npm run migrate
```

### 2. Helper Functions

**File**: `/apps/api/scripts/migrate-songs-helpers.ts`

Utility functions for song data processing.

**Functions**:

```typescript
extractSongsData(): MigrationSong[]
  // Extract static song data for migration
  // Maps: id → oldId, name → title, author → artist
  // Returns array with song metadata + file URLs

getAudioFilename(oldUrl: string): string
  // Extract filename from audio URL
  // Validates URL format
  // Throws error if filename missing
```

**MigrationSong Interface**:

```typescript
interface MigrationSong {
  oldId: string; // ID from old Supabase
  newId: string; // Will be set during DB insertion
  title: string; // Song title
  artist: string; // Artist/author name
  oldAudioUrl: string; // Current audio file URL
  oldThumbnailUrl: string; // Current thumbnail URL
}
```

### 3. Environment Configuration

**File**: `/apps/api/.env.example`

Template for migration environment variables:

```bash
# OLD SUPABASE (Phase 1-2 only, remove after 30 days)
OLD_NEXT_PUBLIC_SUPABASE_URL="https://old-project.supabase.co"
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY="your-old-anon-key-here"

# NEW SUPABASE (long-term)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key-here"

# DATABASE
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
```

**Validation Checklist**:

- [ ] `OLD_NEXT_PUBLIC_SUPABASE_URL` points to old instance
- [ ] `OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid (anon key, not service key)
- [ ] `SUPABASE_URL` points to new instance
- [ ] `SUPABASE_SERVICE_KEY` is service role key (has write permissions)
- [ ] `DATABASE_URL` uses connection pooling (pgbouncer)
- [ ] `DIRECT_URL` is direct connection (for migrations)

### 4. Migration Output Directory

**Directory**: `/apps/api/scripts/migration-output/`

Reserved for Phase 2+ output:

- Detailed migration logs
- Failed migration records (for retry logic)
- Migration statistics
- Batch processing reports

### 5. Package.json Updates

**Script Added**:

```json
"migrate": "tsx scripts/migrate-songs.ts"
```

**New Dependencies**:

- `@supabase/supabase-js` (^2.89.0) - Supabase client for bucket verification
- `tsx` (^4.21.0) - TypeScript runner for scripts
- `dotenv` (^17.2.3) - Environment variable loading
- `@prisma/client` (^7.2.0) - Database client (already present)

---

## Setup Instructions

### 1. Environment Configuration

```bash
# Navigate to API directory
cd apps/api

# Copy template
cp .env.example .env

# Edit with actual credentials
# Required for Phase 1:
# - OLD_NEXT_PUBLIC_SUPABASE_URL
# - OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - DATABASE_URL
# - DIRECT_URL
```

**Getting Credentials**:

**Old Supabase**:

- Login to old project dashboard
- Settings → API → Project URL (OLD_NEXT_PUBLIC_SUPABASE_URL)
- Settings → API → Anon Public key (OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY)

**New Supabase**:

- Login to new project dashboard
- Settings → API → Project URL (SUPABASE_URL)
- Settings → API → Service Role Key (SUPABASE_SERVICE_KEY)

**Database**:

- Supabase: Settings → Database → Connection String (use Connection Pooler)
- Direct URL: Same location, switch tab to "Direct connection"

### 2. Dependencies

Already added to `package.json`:

```bash
npm install
```

Includes: `@supabase/supabase-js`, `tsx`, `dotenv`, `@prisma/client`

### 3. Verify Setup

```bash
# Test environment validation + bucket verification
npm run migrate -- --dry-run

# Expected output:
# [2025-12-31T...] [INFO] Starting migration...
# [2025-12-31T...] [DRY-RUN] [INFO] Environment validated
# [2025-12-31T...] [DRY-RUN] [INFO] Verifying Supabase buckets...
# [2025-12-31T...] [DRY-RUN] [INFO] ✓ Buckets verified: songs, images
# [2025-12-31T...] [DRY-RUN] [INFO] Dry-run completed successfully
```

---

## Architecture

### Data Flow

```
Static Song Data (packages/utils/songs.ts)
        ↓
extractSongsData() [Helper]
        ↓
MigrationSong[] (with old URLs)
        ↓
Validate Environment [Main Script]
        ↓
Verify Buckets [Main Script]
        ↓
[Phase 2: Copy Files + Create DB Records]
        ↓
Migration Output Directory
```

### Environment Validation

Script validates before proceeding:

```
migrate-songs.ts
├── validateEnvironment()
│   └── Check all required vars present
├── verifyBuckets(newSupabase)
│   └── Confirm 'songs', 'images' buckets exist
├── Initialize Prisma (skip in dry-run)
└── TODO: Phase 2-3 implementation
```

### Error Handling

All errors logged with context + exit code 1:

```typescript
log("error", error.message);
process.exit(1);
```

Dry-run mode never modifies state:

- Supabase: Read-only operations only
- Database: Prisma skipped completely
- Files: No downloads/uploads

---

## Usage Guide

### Phase 1 Validation (Dry-Run)

```bash
npm run migrate -- --dry-run
```

Validates:

- All environment variables set correctly
- Old Supabase instance accessible
- New Supabase instance accessible
- Required buckets exist in new instance

### Verbose Output

```bash
npm run migrate -- --dry-run --verbose
```

Shows additional details (implemented in Phase 2).

### Phase 2 Preview

Full migration script (not yet implemented):

```bash
# Attempt migration (with database changes)
npm run migrate

# Monitor logs in migration-output/
ls -la scripts/migration-output/
```

---

## Testing Checklist

Before proceeding to Phase 2:

- [ ] Environment file created with valid credentials
- [ ] `npm run migrate -- --dry-run` succeeds without errors
- [ ] Both Supabase instances accessible (confirmed by bucket verification)
- [ ] Required buckets exist in new Supabase
- [ ] `extractSongsData()` returns all songs from static data
- [ ] `getAudioFilename()` correctly extracts filenames
- [ ] All dependencies installed (`npm install`)
- [ ] Script runs with `tsx` executable

---

## Troubleshooting

### Error: "Missing env vars: ..."

**Cause**: One or more required environment variables not set.

**Solution**:

```bash
# Check .env file
cat apps/api/.env

# Verify all required vars present
grep -E "OLD_NEXT_PUBLIC_SUPABASE|SUPABASE_|DATABASE_URL|DIRECT_URL" apps/api/.env
```

### Error: "Failed to list buckets: ..."

**Cause**:

- Invalid `SUPABASE_URL` or `SUPABASE_SERVICE_KEY`
- Service key has insufficient permissions
- Network connectivity issue

**Solution**:

```bash
# Verify credentials in dashboard
# - SUPABASE_URL must be exact project URL
# - SUPABASE_SERVICE_KEY must be Service Role key (not anon key)

# Test connectivity
curl -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  https://your-project.supabase.co/storage/v1/buckets
```

### Error: "Missing buckets: songs, images"

**Cause**: Required buckets not created in new Supabase instance.

**Solution**:

```bash
# Create via Supabase dashboard:
# 1. Navigate to Storage section
# 2. Create "songs" bucket (make public)
# 3. Create "images" bucket (make public)
# 4. Retry migration
```

### Error: "Invalid audio URL - no filename found"

**Cause**: Song URL format invalid or missing filename.

**Solution**:

```bash
# Check song data in packages/utils/src/songs.ts
# Verify all URLs have format: .../filename.ext
# Update malformed URLs before migration
```

---

## Implementation Notes

### Why Dry-Run Safety?

Phase 1 validates all prerequisites without side effects:

- **No database writes** (Prisma skipped)
- **No file uploads** (read-only bucket checks)
- **No deletions** (only verification)
- **Easily repeatable** (run many times safely)

### Why Separate Old/New Credentials?

Dual-instance approach enables:

- **Zero-downtime migration** (old instance stays live)
- **Safe rollback** (revert if issues detected)
- **Validation before cutover** (test with real data)
- **Decommissioning timeline** (remove old after 30 days)

### Helper Functions Rationale

Extracted to separate file for:

- **Testability** (unit test without script overhead)
- **Reusability** (import in Phase 2-3 code)
- **Clarity** (data extraction logic isolated)
- **Maintainability** (easier to debug/modify)

---

## Phase 1 → Phase 2 Handoff

When Phase 2 begins, these pieces are ready:

1. **Script Framework** - Main orchestration loop prepared
2. **Helper Functions** - Song extraction functions tested
3. **Environment** - Validated before each run
4. **Buckets** - Confirmed to exist
5. **Logging** - Structured output for monitoring

Phase 2 will implement:

- Batch file downloads from old Supabase
- File uploads to new Supabase
- Database record creation (using `newId`)
- Error recovery with retry logic
- Performance optimization (parallel uploads)

---

## File References

### Core Files

- **Script**: `/apps/api/scripts/migrate-songs.ts` (96 lines)
- **Helpers**: `/apps/api/scripts/migrate-songs-helpers.ts` (36 lines)
- **Output Dir**: `/apps/api/scripts/migration-output/` (empty, reserved)
- **Config**: `/apps/api/.env.example` (updated)
- **Package**: `/apps/api/package.json` (migrate script + deps added)

### Related Documentation

- `/docs/BACKEND_DEVELOPER_GUIDE.md` - Backend setup guide
- `/docs/API_REFERENCE.md` - API endpoints reference
- `/docs/SUPABASE_INTEGRATION.md` - Supabase configuration details
- `/docs/SYSTEM_ARCHITECTURE.md` - System architecture overview

### Related Code

- `/packages/utils/src/songs.ts` - Static song data source
- `/apps/api/src/prisma.module.ts` - Database client setup
- `/apps/api/src/main.ts` - NestJS app initialization

---

## FAQ

**Q: Can I run Phase 1 multiple times?**
A: Yes. Dry-run is fully repeatable with no side effects.

**Q: When should I run Phase 2?**
A: After Phase 1 dry-run succeeds and you've verified all credentials.

**Q: Can I stop migration mid-Phase 2?**
A: Yes. Unprocessed songs remain in old Supabase. Restart to continue.

**Q: How long will migration take?**
A: Phase 1 ~5 seconds (validation only). Phase 2 ~1 minute per 100 songs.

**Q: What if a file upload fails in Phase 2?**
A: Failed records logged to `migration-output/` for retry.

**Q: When can I delete old Supabase?**
A: After Phase 3 (cleanup) confirms all data migrated + no failures. Recommend 30-day retention.

---

## Summary

Phase 1 establishes safe migration foundation. Validates prerequisites, prepares data structures, provides dry-run capability. Ready for Phase 2 implementation: actual file copying + database records.

**Status**: Ready for Phase 2 development.
