import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

  // Initialize Prisma only if not dry-run (avoid initialization issues during testing)
  let prisma: PrismaClient | null = null;
  try {
    if (!isDryRun) {
      prisma = new PrismaClient();
    }

    // TODO: Implement migration phases
    if (isDryRun) {
      log('info', 'Dry-run completed successfully');
    } else {
      log('info', 'Migration completed successfully');
    }
  } finally {
    // Cleanup
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  log('error', error.message);
  process.exit(1);
});
