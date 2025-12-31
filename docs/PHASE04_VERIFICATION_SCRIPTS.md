# Phase 04: Verification Scripts - Complete Reference

**Status**: ✅ Complete | **Date**: 2025-12-31 | **Scripts**: 4 Created | **Purpose**: Data integrity & migration verification

---

## Overview

Phase 04 introduces four specialized verification scripts that validate the Supabase songs migration and ensure data integrity across database and storage layers. These scripts provide comprehensive diagnostics without modifying production data.

---

## Quick Start

### Installation & Setup

```bash
# Navigate to API directory
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api

# Ensure environment variables are set in .env
# Required: DATABASE_URL, SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL (optional)

# Create migration-output directory if not exists
mkdir -p scripts/migration-output

# All scripts use tsx for TypeScript execution (no build needed)
```

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running and accessible
- Supabase account with songs bucket configured
- `.env` file in `/apps/api/` with required variables

---

## Verification Scripts

### 1. verify-migration.ts

**Purpose**: Comprehensive three-layer verification of migration integrity

**Location**: `/apps/api/scripts/verify-migration.ts` (214 lines)

**What It Does**:

1. **Database Verification Layer**

   - Confirms exactly 16 songs in database
   - Validates all songs have `published=true`
   - Checks all required fields (title, artist, filePath, duration, fileSize)

2. **Storage Verification Layer**

   - Tests accessibility of audio files via Supabase URLs
   - Attempts to fetch thumbnail images (non-blocking failures)
   - Reports success/failure with HTTP status codes

3. **API Verification Layer**
   - Tests `GET /api/v1/songs?published=true` endpoint
   - Validates response structure (id, title, artist, fileUrl)
   - Measures response time
   - Verifies correct count returned

#### Usage

```bash
# Run complete verification
npx tsx scripts/verify-migration.ts

# Expected output if successful:
# === Database Verification ===
# Total songs: 16
# Published songs: 16
# ✓ Database verification complete
#
# === Storage Verification ===
# Audio files accessible: 16/16
# Thumbnails accessible: 0/16
# ✓ Storage verification complete
#
# === API Verification ===
# GET /songs returned 16 songs in 45ms
# ✓ API verification complete
#
# === Verification Results ===
# ✅ All checks passed!
# Migration verified successfully. Ready to proceed to Phase 5.
```

#### Environment Variables Required

```bash
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3002  # Optional, defaults to localhost:3002
```

#### Error Scenarios

| Error                              | Cause                               | Solution                                |
| ---------------------------------- | ----------------------------------- | --------------------------------------- |
| `Expected 16 songs, found X`       | Wrong record count in database      | Check DB migration ran successfully     |
| `Audio HTTP 404`                   | File path incorrect or file missing | Verify file paths in database           |
| `GET /songs returned 404`          | API not running or endpoint broken  | Start API: `cd apps/api && npm run dev` |
| `Missing env vars`                 | Environment variables not set       | Add to `.env` file                      |
| `Audio fetch failed: ECONNREFUSED` | Network/connectivity issue          | Check internet connection               |

#### Notes

- API verification is **optional** - script logs warning if API unavailable
- Thumbnail verification is **non-blocking** - missing thumbnails don't fail the check
- Script exits with code 1 if any critical error found
- All checks are **read-only** - no data modifications

---

### 2. check-songs.ts

**Purpose**: Quick diagnostic listing of all songs with status indicators

**Location**: `/apps/api/scripts/check-songs.ts` (31 lines)

**What It Does**:

- Lists all songs ordered by creation date
- Shows publish status (✓ = published, ✗ = unpublished)
- Displays ID, title, artist, and file path
- Flags missing duration or fileSize with warnings
- Useful for quick data verification and debugging

#### Usage

```bash
# List all songs
npx tsx scripts/check-songs.ts

# Example output:
# Total songs: 16
#
# 1. [✓] All Of Me - John Legend
#    ID: 8612a648-0d01-4358-973f-2c0df8865be3
#    File: songs/8612a648-0d01-4358-973f-2c0df8865be3.mp3
#
# 2. [✓] The One - Kodaline
#    ID: 5fa8a54b-219c-4b68-bb7e-8f14030f406d
#    File: songs/5fa8a54b-219c-4b68-bb7e-8f14030f406d.mp3
#    ⚠️  Missing duration
#
# 3. [✓] Wake Me Up When September Ends - Green Day
#    ID: 35b5942a-25b9-4379-83bf-8c3790d8fd76
#    File: songs/35b5942a-25b9-4379-83bf-8c3790d8fd76.mp3
```

#### Environment Variables Required

```bash
DATABASE_URL=postgresql://user:password@host:5432/db
```

#### Use Cases

1. **Quick Status Check**: See all songs at a glance
2. **Field Validation**: Identify missing metadata (duration, fileSize)
3. **Publish Status**: Find unpublished songs that should be published
4. **Debugging**: Get all song IDs quickly for manual testing

---

### 3. cleanup-test-songs.ts

**Purpose**: Remove test/placeholder songs added during development

**Location**: `/apps/api/scripts/cleanup-test-songs.ts` (32 lines)

**What It Does**:

- Identifies and removes hardcoded test song IDs
- Logs deletion confirmation with song title/artist
- Reports final song count after cleanup
- **Note**: Currently configured for 2 specific test IDs (can be customized)

#### Test Song IDs (Default)

```typescript
const testSongIds = [
  "bad6c91c-adef-416c-8664-342ea6cec151",
  "e46fe46b-c734-4a4f-ae0b-d3ce11a0b12c",
];
```

#### Usage

```bash
# Remove test songs
npx tsx scripts/cleanup-test-songs.ts

# Expected output:
# Removing test songs...
#
# ✓ Deleted: Test Song 1 - Test Artist
# ✓ Deleted: Test Song 2 - Test Artist
#
# ✅ Cleanup complete. Total songs: 14
```

#### Customization

To cleanup different songs, edit `/apps/api/scripts/cleanup-test-songs.ts`:

```typescript
const testSongIds = ["your-test-id-1", "your-test-id-2", "your-test-id-3"];
```

#### Safety Features

- Only deletes songs with IDs in the hardcoded list
- Won't accidentally delete production songs
- Logs each deletion for audit trail
- Reports total remaining songs

#### When to Use

1. After development/testing phase
2. Before final verification
3. When finalizing migration for Phase 5
4. To clean up non-production data

---

### 4. check-thumbnails.ts

**Purpose**: Inventory and URL generation for thumbnail images

**Location**: `/apps/api/scripts/check-thumbnails.ts` (36 lines)

**What It Does**:

- Lists all songs with thumbnail paths
- Generates full Supabase URLs for each thumbnail
- Helps identify missing or misconfigured thumbnails
- Useful for tracking thumbnail migration status

#### Usage

```bash
# Check thumbnail configuration
npx tsx scripts/check-thumbnails.ts

# Example output:
# Thumbnail paths:
#
# All Of Me
#   Path: images/8612a648-0d01-4358-973f-2c0df8865be3.png
#   URL:  https://your-project.supabase.co/storage/v1/object/public/images/8612a648-0d01-4358-973f-2c0df8865be3.png
#
# The One
#   Path: images/5fa8a54b-219c-4b68-bb7e-8f14030f406d.png
#   URL:  https://your-project.supabase.co/storage/v1/object/public/images/5fa8a54b-219c-4b68-bb7e-8f14030f406d.png
```

#### Environment Variables Required

```bash
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
```

#### Use Cases

1. **Thumbnail Audit**: See all configured thumbnails
2. **URL Testing**: Copy URL to browser to test accessibility
3. **Missing Thumbnails**: Identify songs without thumbnails
4. **Phase 5 Planning**: Understand thumbnail migration status

#### Notes

- Only shows songs that have a `thumbnailPath` set
- URLs are read-only (no authentication required for public bucket)
- Can be extended to verify thumbnail URLs are accessible

---

## Verification Workflow

### Complete Migration Verification Flow

```
1. Run check-songs.ts
   ↓ Ensure all 16 songs present and published
   ↓
2. Run check-thumbnails.ts
   ↓ Verify thumbnail configuration status
   ↓
3. Run verify-migration.ts
   ↓ Comprehensive 3-layer verification (DB → Storage → API)
   ↓
4. Review Results
   ↓ All checks passed? Continue to Phase 5
   ↓ Issues found? Troubleshoot & re-run
```

### Quick Check (5 minutes)

```bash
# Single command to verify migration health
npx tsx scripts/verify-migration.ts
```

### Detailed Audit (15 minutes)

```bash
# 1. Check all songs present
npx tsx scripts/check-songs.ts

# 2. Verify thumbnails
npx tsx scripts/check-thumbnails.ts

# 3. Run full verification
npx tsx scripts/verify-migration.ts
```

---

## Common Verification Scenarios

### Scenario 1: Post-Migration Verification

**Objective**: Confirm Phase 3 migration was successful

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api

# Step 1: List all songs
npx tsx scripts/check-songs.ts
# ✓ Confirms 16 songs present and published

# Step 2: Verify storage accessibility
npx tsx scripts/verify-migration.ts
# ✓ Confirms audio files accessible
# ✓ Confirms API responding correctly

# Result: Migration successful, ready for Phase 5
```

### Scenario 2: Debugging Audio File Issues

**Objective**: Identify why certain songs aren't accessible

```bash
# Step 1: Check file paths in database
npx tsx scripts/check-songs.ts
# Review filePath for songs with issues

# Step 2: Run full verification
npx tsx scripts/verify-migration.ts
# Review detailed error messages for specific files

# Step 3: Check actual file in Supabase
# Navigate to Supabase dashboard → Storage → songs bucket
# Verify file exists with expected name
```

### Scenario 3: Thumbnail Migration Planning

**Objective**: Understand current thumbnail status before Phase 5

```bash
# Check existing thumbnails
npx tsx scripts/check-thumbnails.ts

# Output tells you:
# - How many songs have thumbnails configured
# - Current thumbnail paths and URLs
# - Which songs need thumbnail migration
# - Can test URLs by copying to browser
```

### Scenario 4: Cleanup Before Final Verification

**Objective**: Remove test data before locking down Phase 4

```bash
# Step 1: List current songs
npx tsx scripts/check-songs.ts
# Note any test/development songs

# Step 2: Update cleanup-test-songs.ts with test IDs
# Edit: /apps/api/scripts/cleanup-test-songs.ts
# Add test song IDs to testSongIds array

# Step 3: Run cleanup
npx tsx scripts/cleanup-test-songs.ts
# ✓ Test songs removed

# Step 4: Verify final count
npx tsx scripts/check-songs.ts
# Confirm correct number of production songs remain
```

---

## Integration with Package.json

### Adding Verification Scripts to package.json

To make scripts easily accessible, add to `/apps/api/package.json`:

```json
{
  "scripts": {
    "migrate": "tsx scripts/migrate-songs.ts",
    "verify": "tsx scripts/verify-migration.ts",
    "check:songs": "tsx scripts/check-songs.ts",
    "check:thumbnails": "tsx scripts/check-thumbnails.ts",
    "cleanup:test-songs": "tsx scripts/cleanup-test-songs.ts"
  }
}
```

Then run with:

```bash
npm run verify              # Full verification
npm run check:songs         # List all songs
npm run check:thumbnails    # Check thumbnail config
npm run cleanup:test-songs  # Remove test data
```

---

## Troubleshooting

### Script Execution Issues

#### "Module not found: @prisma/client"

```bash
# Solution: Ensure dependencies installed
cd apps/api
npm install

# Then run script again
npx tsx scripts/verify-migration.ts
```

#### "Error: spawn tsx ENOENT"

```bash
# Solution: Install tsx globally or use npm
npm install -g tsx

# Or use npx (preferred)
npx tsx scripts/verify-migration.ts
```

#### "ECONNREFUSED: Connection refused"

```bash
# Solution: PostgreSQL database not running
# Check database connection string in .env

# Test connection manually
psql $DATABASE_URL -c "SELECT 1"

# If failing, start your database service
# (Command depends on your setup: Docker, system service, etc.)
```

### Data Verification Issues

#### "Expected 16 songs, found X"

```bash
# Check database directly
psql $DATABASE_URL -c "SELECT COUNT(*) FROM songs;"

# If count is wrong:
# 1. Verify migration script completed successfully
# 2. Check for failed transactions
# 3. Review migration logs
```

#### "Audio HTTP 404"

```bash
# Check actual files in Supabase:
# 1. Dashboard → Storage → songs bucket
# 2. Verify files exist with expected names

# Check database file paths:
npx tsx scripts/check-songs.ts
# Ensure filePath format: songs/{uuid}.{extension}

# Check Supabase URL in .env
# Must match your project URL
```

#### "API endpoint returning 404"

```bash
# Start API server
cd apps/api
npm run dev

# Verify API is running on correct port
# Check NEXT_PUBLIC_API_URL in .env
# Default: http://localhost:3002
```

---

## Success Criteria

### Phase 04 Verification Complete When

- [x] `verify-migration.ts` runs successfully with all checks passing
- [x] `check-songs.ts` shows exactly 16 songs, all published
- [x] `check-thumbnails.ts` lists all thumbnail configurations
- [x] No critical errors in any verification script output
- [x] API endpoint responding and returning correct data
- [x] Audio files accessible via generated URLs
- [x] Test songs removed (if applicable)
- [x] Migration data integrity confirmed

### Readiness for Phase 5

When all checks pass, you can proceed to:

1. **Frontend Integration**: Update apps/web to consume new API endpoints
2. **Feature Development**: Build new features with stable data layer
3. **Production Deployment**: Deploy with confidence in migration integrity

---

## Data Integrity Guarantees

### What Verification Ensures

| Check                  | Guarantees                                       |
| ---------------------- | ------------------------------------------------ |
| Database Verification  | All 16 songs present, published, fields complete |
| Storage Verification   | All audio files accessible in Supabase           |
| File Path Verification | File paths in DB match actual files in storage   |
| API Verification       | API endpoints working and returning valid data   |
| Field Validation       | No null/missing required fields                  |
| Publishing Status      | All songs marked as published                    |

### What Verification Does NOT Check

- File integrity/corruption (would require download + hash check)
- Thumbnail migration (only checks thumbnails already in DB)
- Performance metrics (only basic response time)
- Frontend integration (requires separate testing)

---

## Performance Notes

### Script Execution Times

| Script             | Typical Duration | Factors                     |
| ------------------ | ---------------- | --------------------------- |
| check-songs.ts     | < 1 second       | Database query performance  |
| check-thumbnails   | < 1 second       | Database query performance  |
| verify-migration   | 15-30 seconds    | Network requests to storage |
| cleanup-test-songs | < 1 second       | Database write performance  |

### Storage Access Timing

- Database queries: ~10-50ms per song
- Supabase HEAD requests: ~200-500ms per file (network dependent)
- API endpoint test: Varies by API response time

---

## Next Steps

### Phase 5: Frontend Integration

After verification scripts confirm migration integrity:

1. **Update Frontend**: Apps/web to use new API endpoints
2. **Test Integration**: Verify frontend fetches songs correctly
3. **Deploy**: Deploy updated applications to production

### Monitoring & Maintenance

1. **Regular Audits**: Run verification scripts weekly
2. **Log Monitoring**: Watch for storage/API errors
3. **Thumbnail Migration**: Plan thumbnail file migration (not completed in Phase 4)
4. **Performance Tuning**: Monitor response times, optimize queries

---

## Related Documentation

- **Phase 02 Migration**: `PHASE02_MIGRATION_QUICK_REFERENCE.md`
- **Phase 03 Storage Migration**: Documentation for Phase 3 execution
- **API Reference**: `API_REFERENCE.md` (endpoints details)
- **Backend Guide**: `BACKEND_DEVELOPER_GUIDE.md`
- **System Architecture**: `SYSTEM_ARCHITECTURE.md`

---

## Summary

**Phase 04 provides four specialized verification scripts**:

1. **verify-migration.ts** - Comprehensive 3-layer verification (DB → Storage → API)
2. **check-songs.ts** - Quick diagnostic listing of all songs
3. **check-thumbnails.ts** - Thumbnail configuration audit
4. **cleanup-test-songs.ts** - Test data cleanup utility

All scripts are **read-only** except cleanup (which only touches test data), **non-blocking** for failures, and provide detailed output for troubleshooting. Together they ensure complete migration integrity before Phase 5.

---

**Status**: ✅ Complete | **Date**: 2025-12-31 | **Version**: 1.0
