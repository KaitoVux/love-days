# Supabase Songs Migration Plan

**Plan ID**: 251231-0800-supabase-songs-migration
**Created**: 2025-12-31
**Status**: ✅ Phase 1-4 Complete (Verification Done)
**Branch**: feat/init_backend
**Last Updated**: 2025-12-31 14:06:20 UTC

## Overview

Migrate 16 songs from old Supabase to new Supabase instance with new UUIDs, database records, and storage files.

**Scope**:

- 16 songs from `packages/utils/src/songs.ts`
- Audio files (MP3) migration
- Thumbnail images migration
- Database records with new schema

**Strategy**:

- Generate new UUIDs (fresh start)
- Use staticSongs array as migration source
- Extract duration from MP3 metadata
- Leave album field null
- Keep original thumbnail formats (optimize later)
- Run anytime (zero downtime approach)
- Retain old Supabase for 30 days

## Implementation Phases

| Phase                                     | Description                | Status                        | Progress |
| ----------------------------------------- | -------------------------- | ----------------------------- | -------- |
| [Phase 1](phase-01-setup.md)              | Setup & Preparation        | ✅ DONE (2025-12-31 08:00)    | 100%     |
| [Phase 2](phase-02-database-migration.md) | Database Migration         | ✅ DONE (2025-12-31 08:30)    | 100%     |
| [Phase 3](phase-03-storage-migration.md)  | Storage Migration          | ✅ DONE (2025-12-31 12:12)    | 100%     |
| [Phase 4](phase-04-verification.md)       | Verification & Testing     | ✅ DONE (2025-12-31 14:06:20) | 100%     |
| [Phase 5](phase-05-frontend-updates.md)   | Frontend Updates & Cleanup | 🟡 Ready to Start             | 0%       |

## Key Decisions

1. **Duration**: Extract from MP3 metadata using `music-metadata` library
2. **Album**: Leave null (most songs don't have album info)
3. **Timing**: Run anytime (zero downtime strategy)
4. **Retention**: Keep old Supabase active for 30 days
5. **Thumbnails**: Keep original format, plan optimization later

## Environment

**Old Supabase** (Source):

- URL: `https://lzjihzubgrerjezxguyx.supabase.co`
- Storage: `songs` bucket (16 MP3 files)
- Data: staticSongs array

**New Supabase** (Destination):

- URL: `https://pizsodtvikocjjpqxwbh.supabase.co`
- Database: PostgreSQL via Prisma
- Storage: Existing `songs` and `images` buckets ✅
- API: NestJS at `apps/api/`

## Critical Files

1. `apps/api/scripts/migrate-songs.ts` - Main migration script (to create)
2. `packages/utils/src/songs.ts` - Source data + update after migration
3. `apps/api/src/songs/songs.service.ts` - Reference for data structure
4. `apps/api/prisma/schema.prisma` - Destination schema
5. `apps/api/src/storage/storage.service.ts` - Storage operations

## Success Metrics

- ✅ 16 songs in PostgreSQL with valid UUIDs
- ✅ 16 audio files in "songs" bucket (accessible URLs)
- ✅ 16 thumbnails in "images" bucket (accessible URLs)
- ✅ API endpoints return correct data
- ✅ Audio player works without errors
- ✅ Zero downtime during migration

## Risks & Mitigations

**High**: Network failures → Retry logic + resume capability
**Medium**: Thumbnail URLs unavailable → Fallback to default
**Low**: UUID collision → Prisma's uuid() is collision-resistant

## Next Steps

1. Start Phase 1: Setup Supabase buckets and migration script
2. Review each phase file for detailed implementation steps
3. Run migration script with `--dry-run` first
4. Execute actual migration after verification
