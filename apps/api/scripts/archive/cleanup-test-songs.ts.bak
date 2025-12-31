import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Removing test songs...\n');

  const testSongIds = [
    'bad6c91c-adef-416c-8664-342ea6cec151',
    'e46fe46b-c734-4a4f-ae0b-d3ce11a0b12c',
  ];

  for (const id of testSongIds) {
    const song = await prisma.song.findUnique({ where: { id } });
    if (song) {
      await prisma.song.delete({ where: { id } });
      console.log(`✓ Deleted: ${song.title} - ${song.artist}`);
    }
  }

  const count = await prisma.song.count();
  console.log(`\n✅ Cleanup complete. Total songs: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
