# Migration Scripts Archive

## Supabase Songs Migration (2025-12-31)

These scripts were used for the one-time migration of songs from old to new Supabase.

**Scripts**:

- `migrate-songs.ts` - Main migration script (downloads, uploads, creates DB records)
- `migrate-songs-helpers.ts` - Helper functions (UUID generation, Supabase clients)
- `verify-migration.ts` - Verification script (DB, storage, API checks)
- `check-songs.ts` - Database inspection utility
- `cleanup-test-songs.ts` - Test data cleanup script
- `check-thumbnails.ts` - Thumbnail audit tool

**Outputs**:

- `migration-output/migration-mapping.json` - Old ID → New UUID mapping
- `migration-output/migration.log` - Detailed migration log

**Status**: ✅ Migration completed successfully, scripts archived for reference.

**Note**: Do not run these scripts again unless performing another migration.

## Usage (Historical Reference)

### Migration Execution

```bash
# 1. Setup environment
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.

# 2. Run migration
cd apps/api
npx tsx scripts/archive/migrate-songs.ts

# 3. Verify results
npx tsx scripts/archive/verify-migration.ts

# 4. Cleanup test data (if any)
npx tsx scripts/archive/cleanup-test-songs.ts
```

### Verification Commands

```bash
# Check database records
npx tsx scripts/archive/check-songs.ts

# Verify thumbnail paths
npx tsx scripts/archive/check-thumbnails.ts

# Full verification (DB + Storage + API)
npx tsx scripts/archive/verify-migration.ts
```

## Migration Results

**Database**: 16 songs migrated ✅
**Storage**: 16 audio files uploaded ✅
**Thumbnails**: 12/16 uploaded (4 missing from source)
**API**: All endpoints working ✅
**Frontend**: Audio player functional ✅

## Rollback Information

If rollback needed (within 30 days):

1. Old Supabase instance: `lzjihzubgrerjezxguyx` (active until 2026-01-30)
2. ID mapping available in `migration-output/migration-mapping.json`
3. Original filenames preserved in mapping

## Related Documentation

- Migration plan: `plans/251231-0800-supabase-songs-migration/`
- Migration report: `docs/migrations/2025-12-31-supabase-songs.md`
- Updated CLAUDE.md: Recent Changes section

---

**Archive Date**: 2025-12-31
**Migration Status**: Complete
**Scripts Status**: Archived (historical reference only)
