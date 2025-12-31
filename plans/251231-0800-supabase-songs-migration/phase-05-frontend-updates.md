# Phase 5: Frontend Updates & Cleanup

**Parent**: [Migration Plan](plan.md)
**Dependencies**: [Phase 4](phase-04-verification.md)
**Date**: 2025-12-31
**Priority**: P1 (High)
**Status**: 🔴 Not Started

## Overview

Update frontend to use API by default, clean up old references, update documentation, and archive migration artifacts.

**Duration**: 30 minutes
**Requires**: Phase 4 verification passed

## Key Insights

- Keep staticSongs as fallback for offline/API-down scenarios
- Remove old Supabase URL generation logic
- Update documentation to reflect new architecture
- Archive migration artifacts for future reference
- Plan for old Supabase decommission (30 days)

## Requirements

### Functional

- Update `packages/utils/src/songs.ts` to prioritize API
- Remove old Supabase URL dependencies
- Update environment variable documentation
- Test frontend still works if API unavailable (fallback)
- Archive migration scripts and outputs
- Update CLAUDE.md with migration notes

### Non-Functional

- Zero breaking changes to existing code
- Backward compatibility maintained
- Clear documentation for future developers
- Clean codebase (no dead code)

## Architecture

### Before Migration

```typescript
// packages/utils/src/songs.ts
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs`
  : "";

export const songs = staticSongs.map((song) => ({
  ...song,
  audio: createSongUrl(song.filename), // Old Supabase
}));
```

### After Migration

```typescript
// packages/utils/src/songs.ts
export async function getSongs(): Promise<ISong[]> {
  // Try API first (new Supabase)
  const apiSongs = await fetchPublishedSongs();
  if (apiSongs.length > 0) return apiSongs;

  // Fallback to static (for offline/dev)
  return staticSongs;
}
```

## Related Files

**To Modify**:

- `packages/utils/src/songs.ts` - Update to prioritize API
- `apps/web/.env.sample` - Remove old Supabase vars
- `CLAUDE.md` - Add migration documentation

**To Archive**:

- `apps/api/scripts/migrate-songs.ts`
- `apps/api/scripts/migrate-songs-helpers.ts`
- `apps/api/scripts/verify-migration.ts`
- `apps/api/scripts/migration-output/`

**To Create**:

- `docs/migrations/2025-12-31-supabase-songs.md` - Migration report

## Implementation Steps

### 1. Update songs.ts (Already Done)

The file already has the correct implementation from earlier refactoring:

```typescript
// packages/utils/src/songs.ts

// Static songs as fallback
export const staticSongs: Array<ISong> = [
  /* 16 songs */
];

// getSongs() already prioritizes API
export async function getSongs(): Promise<ISong[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    const apiSongs = await fetchPublishedSongs();
    if (apiSongs.length > 0) {
      console.log(`Fetched ${apiSongs.length} songs from API`);
      return apiSongs;
    }
  }

  console.log("Using static song data (API unavailable)");
  return staticSongs;
}
```

**Verification**: File already correct, no changes needed! ✅

### 2. Clean Up Environment Variables

Update `apps/web/.env.sample`:

```bash
# Supabase (New - Post Migration 2025-12-31)
NEXT_PUBLIC_SUPABASE_URL=https://pizsodtvikocjjpqxwbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3002

# Note: OLD_NEXT_PUBLIC_SUPABASE_URL removed after migration
# Old instance will be decommissioned on 2026-01-30
```

Remove from `.env.local` after migration verified (keep for 30 days):

```bash
# Can remove after 2026-01-30:
# OLD_NEXT_PUBLIC_SUPABASE_URL=https://lzjihzubgrerjezxguyx.supabase.co
# OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Update CLAUDE.md Documentation

Add migration section to `CLAUDE.md`:

```markdown
## Recent Changes

### Supabase Migration (2025-12-31)

**What Changed**:

- Migrated 16 songs from old Supabase (lzjihzubgrerjezxguyx) to new (pizsodtvikocjjpqxwbh)
- New PostgreSQL database with Prisma schema
- Audio files in new "songs" bucket
- Thumbnails in new "thumbnails" bucket
- All songs have new UUIDs (old IDs discarded)

**Architecture**:

- Frontend uses API by default: `packages/utils/src/getSongs()`
- API serves songs from new Supabase via NestJS
- Static fallback if API unavailable
- Old Supabase instance retained until 2026-01-30

**Migration Artifacts**:

- Plan: `plans/251231-0800-supabase-songs-migration/`
- Report: `docs/migrations/2025-12-31-supabase-songs.md`
- Scripts: `apps/api/scripts/archive/migrate-songs-*.ts`

**Storage Buckets**:

- Audio files: "songs" bucket (existing)
- Thumbnails: "images" bucket (existing)

**Environment Variables**:

- Removed: `OLD_NEXT_PUBLIC_SUPABASE_URL`, `OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Current: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`
```

### 4. Create Migration Report

`docs/migrations/2025-12-31-supabase-songs.md`:

```markdown
# Supabase Songs Migration Report

**Date**: 2025-12-31
**Duration**: ~2-3 hours
**Status**: ✅ Completed Successfully

## Summary

Migrated 16 songs from old Supabase instance to new instance with new database schema and storage structure.

## Migration Details

**Source**:

- Old Supabase: `https://lzjihzubgrerjezxguyx.supabase.co`
- Data: 16 songs from `packages/utils/src/songs.ts` staticSongs array
- Storage: Audio files in "songs" bucket

**Destination**:

- New Supabase: `https://pizsodtvikocjjpqxwbh.supabase.co`
- Database: PostgreSQL with Prisma schema
- Storage: "songs" bucket (audio) + "images" bucket (thumbnails)

**Results**:

- ✅ 16 songs migrated successfully
- ✅ 16 audio files uploaded (total ~78MB)
- ✅ 16 thumbnails uploaded
- ✅ All database records complete with metadata
- ✅ API endpoints working
- ✅ Frontend audio player functional

## Changes

1. **Database**: New UUID-based Song model with duration, fileSize, thumbnailPath
2. **Storage**: Organized buckets with UUID-based file naming
3. **Frontend**: Uses API by default with static fallback
4. **Environment**: Removed OLD*NEXT_PUBLIC_SUPABASE*\* variables

## Verification Results

- Database: 16/16 records ✅
- Storage: 16/16 audio files accessible ✅
- Storage: 16/16 thumbnails accessible ✅
- API: Response time 245ms (< 500ms target) ✅
- Frontend: All songs play correctly ✅

## Rollback Plan

If issues arise:

1. Re-enable OLD_NEXT_PUBLIC_SUPABASE_URL in .env.local
2. Revert `packages/utils/src/songs.ts` to use old URLs
3. Old Supabase instance remains active until 2026-01-30

## Next Steps

1. Monitor API performance and storage usage
2. Archive old Supabase instance on 2026-01-30 (30 days retention)
3. Consider thumbnail optimization (WebP conversion) in future
4. Consider extracting album metadata for songs that have it

## Artifacts

- Migration plan: `plans/251231-0800-supabase-songs-migration/`
- Migration scripts: `apps/api/scripts/archive/`
- ID mapping: `apps/api/scripts/migration-output/migration-mapping.json`
```

### 5. Archive Migration Scripts

```bash
cd apps/api/scripts
mkdir -p archive
mv migrate-songs.ts archive/
mv migrate-songs-helpers.ts archive/
mv verify-migration.ts archive/
mv migration-output/ archive/

# Create archive README
cat > archive/README.md << 'EOF'
# Migration Scripts Archive

## Supabase Songs Migration (2025-12-31)

These scripts were used for the one-time migration of songs from old to new Supabase.

**Scripts**:
- `migrate-songs.ts` - Main migration script
- `migrate-songs-helpers.ts` - Helper functions
- `verify-migration.ts` - Verification script

**Outputs**:
- `migration-output/migration-mapping.json` - Old ID → New UUID mapping
- `migration-output/migration.log` - Detailed migration log

**Status**: Migration completed successfully, scripts archived for reference.

**Note**: Do not run these scripts again unless performing another migration.
EOF
```

### 6. Final Testing

```bash
# Build and test production
cd apps/web
npm run build
npm run start

# Verify no console errors
# Verify songs load from API
# Verify playback works
```

### 7. Create Migration Summary for Team

```bash
# Optional: Create summary for team notification
cat > docs/migrations/SUMMARY.md << 'EOF'
# 🎉 Songs Migration Complete

The migration of 16 songs to the new Supabase instance is complete!

**What changed**:
- All songs now served from new Supabase backend
- Faster API responses (~250ms)
- Better metadata (duration, file sizes)
- UUID-based organization

**For developers**:
- Pull latest changes
- Update .env.local (remove OLD_* variables)
- Restart dev server
- Everything should just work™

**Questions?** See `docs/migrations/2025-12-31-supabase-songs.md`
EOF
```

## Todo List

- [ ] Verify `packages/utils/src/songs.ts` already correct
- [ ] Update `apps/web/.env.sample` documentation
- [ ] Remove OLD\_\* variables from `.env.local` (after 30 days)
- [ ] Add migration section to `CLAUDE.md`
- [ ] Create migration report in `docs/migrations/`
- [ ] Create archive directory for migration scripts
- [ ] Move scripts to archive/
- [ ] Create archive README
- [ ] Run production build test
- [ ] Verify no errors in production mode
- [ ] Create team summary (optional)
- [ ] Update git branch with all changes

## Success Criteria

- ✅ Frontend uses API by default
- ✅ Static fallback still works
- ✅ Documentation updated
- ✅ Migration scripts archived
- ✅ Production build successful
- ✅ No console errors
- ✅ Clean codebase (no dead code)

## Risk Assessment

**Low Risk**: Breaking changes during cleanup

- Mitigation: Thorough testing before deployment
- Mitigation: Keep old env vars for 30 days

**Low Risk**: Documentation outdated

- Mitigation: Comprehensive migration report created

## Security Considerations

- Archive contains no sensitive credentials
- Migration mapping file has no sensitive data
- Old Supabase credentials can be rotated after 30 days

## Next Steps

**Immediate**:

1. Commit all changes to git
2. Create PR for team review
3. Deploy to production

**30 Days Later (2026-01-30)**:

1. Verify no issues in production
2. Remove OLD\_\* environment variables completely
3. Archive old Supabase project
4. Rotate old credentials if needed

**Future Enhancements**:

1. Thumbnail optimization (WebP conversion)
2. Album metadata extraction
3. CDN integration for faster delivery
4. Progressive Web App offline support
