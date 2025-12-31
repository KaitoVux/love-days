# Supabase Songs Migration

**Created**: 2025-12-31 08:00
**Status**: 🟡 Ready to Execute
**Estimated Time**: 3-4 hours total

## Quick Start

1. **Read**: [plan.md](plan.md) - Overview and decisions
2. **Execute**: Follow phases in order (01 → 05)
3. **Verify**: Run verification after each phase

## Execution Order

| Phase | File                                                             | Time   | Status         |
| ----- | ---------------------------------------------------------------- | ------ | -------------- |
| 1     | [phase-01-setup.md](phase-01-setup.md)                           | 30-45m | 🔴 Not Started |
| 2     | [phase-02-database-migration.md](phase-02-database-migration.md) | 45-60m | 🔴 Not Started |
| 3     | [phase-03-storage-migration.md](phase-03-storage-migration.md)   | 1-2h   | 🔴 Not Started |
| 4     | [phase-04-verification.md](phase-04-verification.md)             | 30-45m | 🔴 Not Started |
| 5     | [phase-05-frontend-updates.md](phase-05-frontend-updates.md)     | 30m    | 🔴 Not Started |

## Key Decisions (Finalized)

1. **Duration**: Extract from MP3 metadata ✅
2. **Album**: Leave null ✅
3. **Timing**: Run anytime (zero downtime) ✅
4. **Retention**: Keep old Supabase 30 days ✅
5. **Thumbnails**: Keep original format ✅

## Migration Scope

- **Songs**: 16 from staticSongs array
- **Audio Files**: ~50-80MB total
- **Thumbnails**: 16 images (various formats)
- **Database**: PostgreSQL via Prisma
- **Storage**: Existing Supabase buckets (songs, images)

## Critical Files

- `apps/api/scripts/migrate-songs.ts` - Main script (to create)
- `packages/utils/src/songs.ts` - Source data
- `apps/api/prisma/schema.prisma` - Destination schema

## Success Metrics

- ✅ 16 songs in database with UUIDs
- ✅ 16 audio files in storage
- ✅ 16 thumbnails in storage
- ✅ API endpoints working
- ✅ Frontend audio player functional

## Rollback

If migration fails:

```bash
# 1. Keep old Supabase instance active
# 2. Revert frontend to use old URLs
# 3. Delete migrated records and files
# 4. See rollback section in plan.md
```

## Help

- Issues? Check phase file "Risk Assessment" sections
- Questions? See plan.md "Unresolved Questions" (all resolved)
- Errors? Check migration.log in migration-output/
