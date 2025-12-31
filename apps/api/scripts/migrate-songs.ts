import 'dotenv/config';

// Set NEXT_PUBLIC_SUPABASE_URL for staticSongs to generate proper URLs
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.OLD_NEXT_PUBLIC_SUPABASE_URL;

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  extractSongsData,
  transformSongForDatabase,
  MigrationMapping,
  downloadFile,
  extractAudioMetadata,
  getThumbnailExtension,
  uploadToSupabase,
  getAudioFilename,
} from './migrate-songs-helpers';
import { staticSongs } from '../../../packages/utils/src/songs';

// Environment validation
const requiredEnvVars = [
  'OLD_NEXT_PUBLIC_SUPABASE_URL',
  'OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'DATABASE_URL',
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

// CLI flags
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

// Logger
function log(level: 'info' | 'warn' | 'error', message: string) {
  const timestamp = new Date().toISOString();
  const prefix = isDryRun ? '[DRY-RUN]' : '';
  console.log(`${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`);
}

// Verify buckets exist
async function verifyBuckets(supabase: SupabaseClient) {
  log('info', 'Verifying Supabase buckets...');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) throw new Error(`Failed to list buckets: ${error.message}`);

  const requiredBuckets = ['songs', 'images'];
  const existingBuckets = buckets?.map((b) => b.name) || [];
  const missing = requiredBuckets.filter((b) => !existingBuckets.includes(b));

  if (missing.length > 0) {
    throw new Error(`Missing buckets: ${missing.join(', ')}`);
  }

  log('info', '✓ Buckets verified: songs, images');
}

// Migrate database records
async function migrateDatabaseRecords(
  prisma: PrismaClient,
): Promise<MigrationMapping[]> {
  log('info', '=== Phase 2: Database Migration ===');

  const songs = staticSongs;
  const mapping: MigrationMapping[] = [];

  log('info', `Found ${songs.length} songs to migrate`);

  if (isDryRun) {
    log('info', '[DRY-RUN] Would insert records into database');
    // Simulate mapping
    return songs.map((song) => ({
      oldId: song.id,
      newId: randomUUID(),
      title: song.name,
      artist: song.author || 'Unknown',
    }));
  }

  // Use transaction for atomicity
  const inserted = await prisma.$transaction(async (tx) => {
    const results: MigrationMapping[] = [];

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const transformed = transformSongForDatabase(song);

      log(
        'info',
        `[${i + 1}/${songs.length}] Inserting: ${transformed.title} by ${transformed.artist}`,
      );

      const record = await tx.song.create({
        data: {
          id: transformed.id,
          title: transformed.title,
          artist: transformed.artist,
          album: transformed.album,
          filePath: transformed.filePath,
          thumbnailPath: transformed.thumbnailPath,
          published: transformed.published,
        },
      });

      results.push({
        oldId: song.id,
        newId: record.id,
        title: record.title,
        artist: record.artist,
        oldAudioUrl: song.audio,
        oldThumbnailUrl: song.img,
      });

      if (isVerbose) {
        log('info', `  ✓ Created record with ID: ${record.id}`);
      }
    }

    return results;
  });

  log('info', `Successfully inserted ${inserted.length} records`);
  return inserted;
}

// Hardcoded filename mapping from actual old Supabase storage
const OLD_FILENAMES: Record<string, string> = {
  'the-one-kodaline': 'The One - Kodaline.mp3',
  'all-of-me-john-legend': 'All Of Me - John Legend.mp3',
  'make-you-feel-my-love-adele': 'Make You Feel My Love - Adele.mp3',
  'i-do-911': 'I Do - 911.mp3',
  'wake-me-up-when-september-ends-green-d':
    'Wake Me Up When September Ends - Green D.mp3',
  'cant-take-my-eyes-off-you': "Can't Take My Eyes Off You.mp3", // No artist!
  'say-you-wont-let-go-james-arthur': "Say You Won't Let Go - James Arthur.mp3",
  'love-someone-lukas-graham': 'Love Someone - Lukas Graham.mp3',
  'im-yours-jason-mraz': "I'm Yours - Jason Mraz.mp3",
  'perfect-ed-sheeran': 'Perfect - Ed Sheeran.mp3',
  'perfect-tanner-patrick': 'Perfect - Cover by Tanner Patrick.mp3',
  'you-are-the-reason-calum-scott': 'You Are The Reason - Calum Scott.mp3',
  'always-isak-danielson': 'Always - Isak Danielson.mp3',
  'little-things-one-direction': 'Little Things - One Direction.mp3',
  'i-know-you-know': 'I Know You Know - Unknown.mp3', // Artist is "Unknown"
  'munn-loved-us-more': 'Munn - Loved Us More.mp3',
};

// Load mapping from file
async function loadMigrationMapping(): Promise<MigrationMapping[]> {
  const outputPath = path.join(
    __dirname,
    'migration-output',
    'migration-mapping.json',
  );

  try {
    const content = await fs.readFile(outputPath, 'utf-8');
    const mappingObject = JSON.parse(content) as Record<string, string>;

    // Construct URLs using actual old filenames
    const oldSupabaseUrl = process.env.OLD_NEXT_PUBLIC_SUPABASE_URL!;
    const createOldSongUrl = (songId: string) => {
      const filename = OLD_FILENAMES[songId];
      return `${oldSupabaseUrl}/storage/v1/object/public/songs/${encodeURIComponent(filename)}`;
    };

    // Reconstruct full mapping with URLs
    return staticSongs.map((song) => ({
      oldId: song.id,
      newId: mappingObject[song.id],
      title: song.name,
      artist: song.author || 'Unknown',
      oldAudioUrl: createOldSongUrl(song.id),
      oldThumbnailUrl: song.img,
    }));
  } catch (error) {
    throw new Error(`Failed to load mapping file: ${error.message}`);
  }
}

// Save migration mapping to file
async function saveMigrationMapping(mapping: MigrationMapping[]) {
  const outputDir = path.join(__dirname, 'migration-output');
  const outputPath = path.join(outputDir, 'migration-mapping.json');

  await fs.mkdir(outputDir, { recursive: true });

  const mappingObject = mapping.reduce(
    (acc, m) => {
      acc[m.oldId] = m.newId;
      return acc;
    },
    {} as Record<string, string>,
  );

  await fs.writeFile(outputPath, JSON.stringify(mappingObject, null, 2));
  log('info', `Mapping file saved: ${outputPath}`);
}

// Migrate storage files (Phase 3)
async function migrateStorageFiles(
  mapping: MigrationMapping[],
  newSupabase: SupabaseClient,
  prisma: PrismaClient,
): Promise<void> {
  log('info', '=== Phase 3: Storage Migration ===');

  for (let i = 0; i < mapping.length; i++) {
    const song = mapping[i];
    const progress = `[${i + 1}/${mapping.length}]`;

    log('info', `${progress} Processing: ${song.title}`);

    try {
      // 1. Download audio from old URL
      log('info', `  Downloading audio...`);
      const audioBuffer = await downloadFile(song.oldAudioUrl!);

      // 2. Extract metadata
      log('info', `  Extracting metadata...`);
      const metadata = await extractAudioMetadata(audioBuffer);
      log(
        'info',
        `  Duration: ${metadata.duration}s, Size: ${Math.round(metadata.fileSize / 1024)}KB`,
      );

      if (!isDryRun) {
        // 3. Upload audio to new Supabase
        log('info', `  Uploading audio...`);
        const audioPath = `${song.newId}.mp3`;
        await uploadToSupabase(
          newSupabase,
          'songs',
          audioPath,
          audioBuffer,
          'audio/mpeg',
        );
        log('info', `  ✓ Audio uploaded`);

        // 4. Download and upload thumbnail
        log('info', `  Downloading thumbnail...`);
        try {
          const thumbnailBuffer = await downloadFile(song.oldThumbnailUrl!);
          const ext = getThumbnailExtension(song.oldThumbnailUrl!);
          const thumbnailPath = `${song.newId}.${ext}`;
          const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

          log('info', `  Uploading thumbnail...`);
          await uploadToSupabase(
            newSupabase,
            'images',
            thumbnailPath,
            thumbnailBuffer,
            contentType,
          );
          log('info', `  ✓ Thumbnail uploaded`);
        } catch (error) {
          log(
            'warn',
            `  ! Thumbnail failed, will use default: ${error.message}`,
          );
        }

        // 5. Update database with metadata
        log('info', `  Updating database...`);
        await prisma.song.update({
          where: { id: song.newId },
          data: {
            duration: metadata.duration,
            fileSize: metadata.fileSize,
          },
        });
        log('info', `  ✓ Database updated`);
      } else {
        log('info', `  [DRY-RUN] Would upload audio and thumbnail`);
      }

      log('info', `  ✓ ${progress} Completed`);
    } catch (error) {
      log('error', `  ✗ ${progress} Failed: ${error.message}`);
      throw error;
    }
  }

  log('info', `Storage migration completed for ${mapping.length} songs`);
}

async function main() {
  log('info', 'Starting migration...');

  // Validate environment
  validateEnvironment();
  log('info', 'Environment validated');

  // Initialize Supabase clients
  const oldSupabase = createClient(
    process.env.OLD_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.OLD_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const newSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  // Verify buckets
  await verifyBuckets(newSupabase);

  // Initialize PostgreSQL pool and Prisma adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Check if Phase 2 already completed
    const mappingFile = path.join(
      __dirname,
      'migration-output',
      'migration-mapping.json',
    );
    let mapping: MigrationMapping[];

    try {
      await fs.access(mappingFile);
      log('info', 'Phase 2 already completed, loading mapping from file...');
      mapping = await loadMigrationMapping();
      log('info', `Loaded ${mapping.length} song mappings`);
    } catch {
      // Phase 2: Database Migration
      log('info', 'Running Phase 2: Database Migration...');
      mapping = await migrateDatabaseRecords(prisma);
      await saveMigrationMapping(mapping);
    }

    // Phase 3: Storage Migration
    await migrateStorageFiles(mapping, newSupabase, prisma);

    if (isDryRun) {
      log('info', 'Dry-run completed successfully');
    } else {
      log('info', '🎉 Migration completed successfully');
    }
  } finally {
    // Cleanup
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  log('error', error.message);
  process.exit(1);
});
