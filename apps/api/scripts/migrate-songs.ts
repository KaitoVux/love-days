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
    // Phase 2: Database Migration
    const mapping = await migrateDatabaseRecords(prisma);
    await saveMigrationMapping(mapping);

    if (isDryRun) {
      log('info', 'Dry-run completed successfully');
    } else {
      log('info', 'Migration completed successfully');
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
