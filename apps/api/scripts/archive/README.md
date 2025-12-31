# Migration Scripts Archive

## Supabase Songs Migration (2025-12-31)

These scripts were used for the one-time migration of songs from old to new Supabase.

**Scripts** (archived with .ts.bak extension to prevent compilation):

- `migrate-songs.ts.bak` - Main migration script (downloads, uploads, creates DB records)
- `migrate-songs-helpers.ts.bak` - Helper functions (UUID generation, Supabase clients)
- `verify-migration.ts.bak` - Verification script (DB, storage, API checks)
- `check-songs.ts.bak` - Database inspection utility
- `cleanup-test-songs.ts.bak` - Test data cleanup script
- `check-thumbnails.ts.bak` - Thumbnail audit tool

**Note**: Scripts renamed to `.ts.bak` to exclude from TypeScript compilation while preserving for historical reference.

**Outputs**:

- `migration-output/migration-mapping.json` - Old ID → New UUID mapping
- `migration-output/migration.log` - Detailed migration log

**Status**: ✅ Migration completed successfully, scripts archived for reference.

**Note**: Do not run these scripts again unless performing another migration.

## Usage (Historical Reference)

To reference these scripts (if needed for another migration):

```bash
# Rename back to .ts if needed
cd apps/api/scripts/archive
cp migrate-songs.ts.bak migrate-songs.ts

# Then run (not recommended - this was a one-time migration)
npx tsx migrate-songs.ts
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
