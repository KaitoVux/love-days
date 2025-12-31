import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const songs = await prisma.song.findMany({
    select: {
      id: true,
      title: true,
      thumbnailPath: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('\nThumbnail paths:\n');

  songs.forEach((song) => {
    if (song.thumbnailPath) {
      const filename = song.thumbnailPath.split('/')[1] || song.thumbnailPath;
      const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${filename}`;
      console.log(`${song.title}`);
      console.log(`  Path: ${song.thumbnailPath}`);
      console.log(`  URL:  ${url}`);
      console.log();
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
