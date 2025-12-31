# Supabase Songs Migration - Phase 1 Quick Reference

**Cheat sheet for Phase 1: Setup & Preparation**

---

## Setup (5 minutes)

### 1. Copy Environment Template

```bash
cd apps/api
cp .env.example .env
```

### 2. Fill Required Variables

```bash
# Old Supabase (from old project dashboard)
OLD_NEXT_PUBLIC_SUPABASE_URL=https://OLD-PROJECT.supabase.co
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-old-anon-key

# New Supabase (from new project dashboard)
SUPABASE_URL=https://NEW-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://user:pass@host:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://user:pass@host:5432/postgres
```

### 3. Run Dry-Run

```bash
npm run migrate -- --dry-run
```

**Expected Output**:

```
[2025-12-31T...] [INFO] Starting migration...
[2025-12-31T...] [DRY-RUN] [INFO] Environment validated
[2025-12-31T...] [DRY-RUN] [INFO] Verifying Supabase buckets...
[2025-12-31T...] [DRY-RUN] [INFO] ✓ Buckets verified: songs, images
[2025-12-31T...] [DRY-RUN] [INFO] Dry-run completed successfully
```

---

## Key Files

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `scripts/migrate-songs.ts`         | Main migration script (96 lines)   |
| `scripts/migrate-songs-helpers.ts` | Helper functions (36 lines)        |
| `scripts/migration-output/`        | Output directory (empty, reserved) |
| `.env.example`                     | Environment template               |
| `package.json`                     | Has `migrate` script + deps        |

---

## CLI Commands

```bash
# Validate setup (no changes)
npm run migrate -- --dry-run

# Verbose output (detailed logging)
npm run migrate -- --verbose

# Full migration (Phase 2+)
npm run migrate
```

---

## Environment Variables

### Must Have

```bash
OLD_NEXT_PUBLIC_SUPABASE_URL        # Old Supabase URL
OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY   # Old Supabase anon key
SUPABASE_URL                         # New Supabase URL
SUPABASE_SERVICE_KEY                 # New Supabase service key
DATABASE_URL                         # Connection pooling URL
DIRECT_URL                           # Direct connection URL
```

### Validation

```bash
# Check all vars set
grep -E "OLD_|SUPABASE_|DATABASE_|DIRECT_" apps/api/.env

# Should show 6 lines if all present
```

---

## Troubleshooting

### "Missing env vars"

→ Check `.env` file has all 6 required variables

### "Failed to list buckets"

→ Verify `SUPABASE_SERVICE_KEY` is service role key (not anon)

### "Missing buckets: songs, images"

→ Create buckets in new Supabase dashboard (Storage section)

### "Invalid audio URL"

→ Check song URLs in `packages/utils/src/songs.ts` have filenames

---

## Helper Functions

```typescript
// Extract song data for migration
extractSongsData(): MigrationSong[]

// Get filename from URL
getAudioFilename(oldUrl: string): string

// MigrationSong structure
interface MigrationSong {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
  oldAudioUrl: string;
  oldThumbnailUrl: string;
}
```

---

## Architecture

```
.env validation
    ↓
Old Supabase connection
    ↓
New Supabase connection
    ↓
Bucket verification
    ↓
Prisma initialization (skip in dry-run)
    ↓
TODO: Phase 2 implementation
```

---

## Checklist

- [ ] Copy `.env.example` → `.env`
- [ ] Fill 6 environment variables
- [ ] Run `npm run migrate -- --dry-run`
- [ ] See "Dry-run completed successfully"
- [ ] Ready for Phase 2

---

## Reference Docs

**Full Details**: `/docs/MIGRATION_PHASE01_SETUP_PREPARATION.md`

**Backend Guide**: `/docs/BACKEND_DEVELOPER_GUIDE.md`

**Supabase Setup**: `/docs/SUPABASE_INTEGRATION.md`

---

## FAQ

**Q: Can I run dry-run multiple times?**
A: Yes, completely safe + repeatable.

**Q: What does Phase 2 do?**
A: Copies files from old bucket to new + creates database records.

**Q: How long does migration take?**
A: Phase 1 ~5 sec. Phase 2 ~1 min per 100 songs.

**Q: Can I rollback?**
A: Yes. Old Supabase kept live for 30 days.

---

**Status**: Phase 1 Complete ✅ → Ready for Phase 2
