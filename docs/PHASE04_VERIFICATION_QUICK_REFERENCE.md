# Phase 04: Verification Scripts - Quick Reference

**Status**: ✅ Complete | **Date**: 2025-12-31 | **Quick Start**: 2 minutes

---

## TL;DR - Run This

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api
npx tsx scripts/verify-migration.ts
```

**Expected Output**: `✅ All checks passed! Migration verified successfully. Ready to proceed to Phase 5.`

---

## Four Scripts

| Script                    | Command                                 | Purpose                   | Time |
| ------------------------- | --------------------------------------- | ------------------------- | ---- |
| **verify-migration.ts**   | `npx tsx scripts/verify-migration.ts`   | Full 3-layer verification | 15s  |
| **check-songs.ts**        | `npx tsx scripts/check-songs.ts`        | List all songs            | 1s   |
| **check-thumbnails.ts**   | `npx tsx scripts/check-thumbnails.ts`   | Thumbnail audit           | 1s   |
| **cleanup-test-songs.ts** | `npx tsx scripts/cleanup-test-songs.ts` | Remove test data          | 1s   |

---

## 5-Minute Workflow

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api

# 1. Check current state
npx tsx scripts/check-songs.ts
# Should show: 16 songs, all with [✓]

# 2. Verify thumbnails status
npx tsx scripts/check-thumbnails.ts
# Shows configured thumbnails (0 or more)

# 3. Run full verification
npx tsx scripts/verify-migration.ts
# Should show all three layers passing

# Done! Migration verified.
```

---

## Before Running Scripts

### Requirements

- Node.js 18+ installed
- PostgreSQL running and accessible
- `.env` file in `/apps/api/` with:

```bash
DATABASE_URL=postgresql://user:password@host:5432/love_days
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_API_URL=http://localhost:3002  # Optional
```

### Setup (first time only)

```bash
cd /Users/kaitovu/Desktop/Projects/love-days/apps/api
npm install                      # Ensure dependencies installed
mkdir -p scripts/migration-output # Create output directory
```

---

## What Each Script Does

### 1. verify-migration.ts (Comprehensive)

**What**: 3-layer verification (Database → Storage → API)

**Check**:

```
✓ Database has exactly 16 songs, all published
✓ All required fields present (title, artist, filePath, duration, fileSize)
✓ All audio files accessible in Supabase storage
✓ API endpoint responding and returning correct data
```

**Failure**: Script exits with error message + code 1

### 2. check-songs.ts (Quick Diagnostic)

**What**: Lists all songs with status

**Output**:

```
Total songs: 16

1. [✓] All Of Me - John Legend
   ID: 8612a648-0d01-4358-973f-2c0df8865be3
   File: songs/8612a648-0d01-4358-973f-2c0df8865be3.mp3
```

**Use When**: Need to see what's in database

### 3. check-thumbnails.ts (Thumbnail Audit)

**What**: Lists all thumbnail paths and URLs

**Output**:

```
Thumbnail paths:

All Of Me
  Path: images/8612a648-0d01-4358-973f-2c0df8865be3.png
  URL:  https://project.supabase.co/storage/v1/object/public/images/...
```

**Use When**: Checking thumbnail configuration

### 4. cleanup-test-songs.ts (Data Cleanup)

**What**: Removes test songs from database

**Default Test IDs**:

```typescript
"bad6c91c-adef-416c-8664-342ea6cec151";
"e46fe46b-c734-4a4f-ae0b-d3ce11a0b12c";
```

**Customize**:

1. Edit `/apps/api/scripts/cleanup-test-songs.ts`
2. Replace test IDs in `testSongIds` array
3. Run: `npx tsx scripts/cleanup-test-songs.ts`

---

## Common Scenarios

### Scenario A: Verify Migration Worked

```bash
npx tsx scripts/verify-migration.ts
# ✅ All checks passed! = Success
# ❌ Found X errors = Check errors listed
```

### Scenario B: Debug Missing File

```bash
# Step 1: See all songs
npx tsx scripts/check-songs.ts

# Step 2: Find the problem song, note its filePath
# Step 3: Check if file actually exists in Supabase
# - Login to Supabase Dashboard
# - Go to Storage → songs bucket
# - Search for the filename
```

### Scenario C: Test Thumbnail URLs

```bash
npx tsx scripts/check-thumbnails.ts
# Copy any URL to browser
# Should show the image (if file exists)
```

### Scenario D: Remove Test Data

```bash
# See current count
npx tsx scripts/check-songs.ts
# Note which songs are "test" or shouldn't be there

# Edit cleanup script
nano /Users/kaitovu/Desktop/Projects/love-days/apps/api/scripts/cleanup-test-songs.ts
# Add test song IDs to the testSongIds array

# Run cleanup
npx tsx scripts/cleanup-test-songs.ts

# Verify new count
npx tsx scripts/check-songs.ts
```

---

## Troubleshooting

| Problem                   | Solution                                     |
| ------------------------- | -------------------------------------------- |
| "module not found"        | Run `npm install` in `/apps/api/`            |
| "ECONNREFUSED" on DB      | Start PostgreSQL (check `.env` DATABASE_URL) |
| "HTTP 404" on audio files | Check file paths in Supabase Storage console |
| "API not running" warning | Start API with `npm run dev` (optional)      |
| "Missing env vars"        | Add all required vars to `/apps/api/.env`    |

---

## Success Criteria

Phase 04 complete when:

- [x] `check-songs.ts` shows 16 songs, all `[✓]`
- [x] `verify-migration.ts` shows no errors
- [x] Audio files: 16/16 accessible
- [x] Test songs removed (if applicable)

---

## Next: Phase 5

When all checks pass:

1. Frontend starts consuming new API endpoints
2. Update `/apps/web` to use UUIDs instead of string IDs
3. Deploy with confidence

---

## One-Liner Commands

```bash
# Just verify
npx tsx scripts/verify-migration.ts

# Full audit (all 4 checks)
for script in check-songs check-thumbnails verify-migration cleanup-test-songs; do
  echo "=== Running $script ==="; npx tsx scripts/$script.ts; done

# Quick DB check
npx tsx scripts/check-songs.ts | head -5
```

---

## Files & Locations

```
Scripts:
├── /apps/api/scripts/verify-migration.ts
├── /apps/api/scripts/check-songs.ts
├── /apps/api/scripts/cleanup-test-songs.ts
└── /apps/api/scripts/check-thumbnails.ts

Docs:
├── PHASE04_VERIFICATION_SCRIPTS.md (full reference)
└── PHASE04_VERIFICATION_COMPLETION.md (detailed status)
```

---

## Need More Details?

- **Full Guide**: See `PHASE04_VERIFICATION_SCRIPTS.md`
- **Status Report**: See `PHASE04_VERIFICATION_COMPLETION.md`
- **API Details**: See `API_REFERENCE.md`

---

**Date**: 2025-12-31 | **Status**: ✅ Complete | **Version**: 1.0
