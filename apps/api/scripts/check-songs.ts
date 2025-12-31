import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nTotal songs: ${songs.length}\n`);

  songs.forEach((song, idx) => {
    console.log(
      `${idx + 1}. [${song.published ? '✓' : '✗'}] ${song.title} - ${song.artist}`,
    );
    console.log(`   ID: ${song.id}`);
    console.log(`   File: ${song.filePath}`);
    if (!song.duration) console.log('   ⚠️  Missing duration');
    if (!song.fileSize) console.log('   ⚠️  Missing fileSize');
    console.log();
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
