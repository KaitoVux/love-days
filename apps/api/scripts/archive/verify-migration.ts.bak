import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Prisma client with adapter (Prisma 7 requirement)
const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Get Supabase credentials from env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL environment variable not set');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable not set',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface VerificationError {
  check: string;
  error: string;
}

const errors: VerificationError[] = [];

async function verifyDatabase() {
  console.log('=== Database Verification ===');

  // Check total count
  const count = await prisma.song.count();
  console.log(`Total songs: ${count}`);
  if (count !== 16) {
    errors.push({
      check: 'database-count',
      error: `Expected 16 songs, found ${count}`,
    });
  }

  // Check all published
  const publishedCount = await prisma.song.count({
    where: { published: true },
  });
  console.log(`Published songs: ${publishedCount}`);
  if (publishedCount !== 16) {
    errors.push({
      check: 'database-published',
      error: `Expected 16 published, found ${publishedCount}`,
    });
  }

  // Check required fields
  const songs = await prisma.song.findMany();
  for (const song of songs) {
    const missing = [];
    if (!song.title) missing.push('title');
    if (!song.artist) missing.push('artist');
    if (!song.filePath) missing.push('filePath');
    if (!song.duration) missing.push('duration');
    if (!song.fileSize) missing.push('fileSize');

    if (missing.length > 0) {
      errors.push({
        check: `database-fields-${song.id}`,
        error: `Song "${song.title}" missing: ${missing.join(', ')}`,
      });
    }
  }

  console.log(`✓ Database verification complete\n`);
  return songs;
}

async function verifyStorage(songs: any[]) {
  console.log('=== Storage Verification ===');

  let audioSuccess = 0;
  let thumbnailSuccess = 0;

  for (const song of songs) {
    // Test audio URL
    const audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/songs/${song.filePath.split('/')[1]}`;
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      if (response.ok) {
        audioSuccess++;
      } else {
        errors.push({
          check: `storage-audio-${song.id}`,
          error: `Audio HTTP ${response.status}: ${audioUrl}`,
        });
      }
    } catch (error: any) {
      errors.push({
        check: `storage-audio-${song.id}`,
        error: `Audio fetch failed: ${error.message}`,
      });
    }

    // Test thumbnail URL (if exists)
    // Note: Thumbnails are from old Supabase and may not be migrated yet
    if (song.thumbnailPath) {
      const thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${song.thumbnailPath.split('/')[1]}`;
      try {
        const response = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (response.ok) {
          thumbnailSuccess++;
        }
        // Don't fail verification if thumbnails are missing (Phase 3 only migrated audio)
      } catch (error: any) {
        // Thumbnail errors are warnings, not failures
      }
    }
  }

  console.log(`Audio files accessible: ${audioSuccess}/16`);
  console.log(`Thumbnails accessible: ${thumbnailSuccess}/16`);
  console.log(`✓ Storage verification complete\n`);
}

async function verifyAPI() {
  console.log('=== API Verification ===');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  // Test GET /api/v1/songs?published=true
  try {
    const start = Date.now();
    const response = await fetch(`${apiUrl}/api/v1/songs?published=true`);
    const duration = Date.now() - start;

    if (!response.ok) {
      errors.push({
        check: 'api-list',
        error: `GET /songs returned ${response.status}`,
      });
    } else {
      const data: any = await response.json();
      console.log(`GET /songs returned ${data.length} songs in ${duration}ms`);

      if (data.length !== 16) {
        errors.push({
          check: 'api-list-count',
          error: `Expected 16 songs, got ${data.length}`,
        });
      }

      // Verify response structure
      const firstSong = data[0];
      const requiredFields = ['id', 'title', 'artist', 'fileUrl'];
      const missing = requiredFields.filter((f) => !firstSong[f]);
      if (missing.length > 0) {
        errors.push({
          check: 'api-response-structure',
          error: `Missing fields: ${missing.join(', ')}`,
        });
      }
    }
  } catch (error: any) {
    console.log(`⚠️  API not running: ${error.message}`);
    console.log(`   Start API with: cd apps/api && npm run dev`);
    console.log(
      `   This check is optional for database/storage verification\n`,
    );
  }

  console.log(`✓ API verification complete\n`);
}

async function printResults() {
  console.log('=== Verification Results ===');

  if (errors.length === 0) {
    console.log('✅ All checks passed!');
    console.log(
      '\nMigration verified successfully. Ready to proceed to Phase 5.',
    );
  } else {
    console.log(`❌ Found ${errors.length} errors:\n`);
    errors.forEach((e) => {
      console.log(`  [${e.check}] ${e.error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding.');
    process.exit(1);
  }
}

async function main() {
  console.log('Starting migration verification...\n');

  try {
    const songs = await verifyDatabase();
    await verifyStorage(songs);
    await verifyAPI();
    await printResults();
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
