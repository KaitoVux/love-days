import { Injectable, Logger } from '@nestjs/common';
import { ISongRepository } from '../../domain/repositories/song.repository.interface';
import { Song } from '../../domain/entities/song.entity';
import { SupabaseService } from './supabase.service';
import { SupabaseConfig } from '../config/supabase.config';

/**
 * Metadata mapping for songs - this would typically come from a database,
 * but for simplicity, we're defining it here directly
 */
const songMetadata: Record<
  string,
  { id: string; name: string; author: string; imageUrl: string }
> = {
  'The One - Kodaline.mp3': {
    id: 'the-one-kodaline',
    name: 'The One',
    author: 'Kodaline',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/7/76/The_One_single_cover.png/220px-The_One_single_cover.png',
  },
  'All Of Me - John Legend.mp3': {
    id: 'all-of-me-john-legend',
    name: 'All Of Me',
    author: 'John Legend',
    imageUrl: 'https://cdn.imweb.me/thumbnail/20210617/07d16fbc20710.jpg',
  },
  'Make You Feel My Love - Adele.mp3': {
    id: 'make-you-feel-my-love-adele',
    name: 'Make You Feel My Love',
    author: 'Adele',
    imageUrl: 'https://i1.sndcdn.com/artworks-000328637838-mlumy9-t500x500.jpg',
  },
  'I Do - 911.mp3': {
    id: 'i-do-911',
    name: 'I Do',
    author: '911',
    imageUrl: 'https://i.ytimg.com/vi/Cgpzghb1zyo/maxresdefault.jpg',
  },
  'Wake Me Up When September Ends - Green D.mp3': {
    id: 'wake-me-up-when-september-ends-green-d',
    name: 'Wake Me Up When September Ends',
    author: 'Green D',
    imageUrl: 'https://i.ytimg.com/vi/rdpBZ5_b48g/maxresdefault.jpg',
  },
  "Can't Take My Eyes Off You.mp3": {
    id: 'cant-take-my-eyes-off-you',
    name: "Can't Take My Eyes Off You",
    author: '',
    imageUrl: 'https://i.ytimg.com/vi/-HGX_phi6WA/maxresdefault.jpg',
  },
  "Say You Won't Let Go - James Arthur.mp3": {
    id: 'say-you-wont-let-go-james-arthur',
    name: "Say You Won't Let Go",
    author: 'James Arthur',
    imageUrl: 'https://i1.sndcdn.com/artworks-000459317130-tbbjuk-t500x500.jpg',
  },
  'Love Someone - Lukas Graham.mp3': {
    id: 'love-someone-lukas-graham',
    name: 'Love Someone',
    author: 'Lukas Graham',
    imageUrl:
      'https://i.vdoc.vn/data/image/2018/10/20/hoc-tieng-anh-qua-bai-hat-love-someone-640.jpg',
  },
  "I'm Yours - Jason Mraz.mp3": {
    id: 'im-yours-jason-mraz',
    name: "I'm Yours",
    author: 'Jason Mraz',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/vi/thumb/c/c3/Jason_Mraz_-_I%27m_Yours.jpg/220px-Jason_Mraz_-_I%27m_Yours.jpg',
  },
  'Perfect - Ed Sheeran.mp3': {
    id: 'perfect-ed-sheeran',
    name: 'Perfect',
    author: 'Ed Sheeran',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg',
  },
  'Perfect - Cover by Tanner Patrick.mp3': {
    id: 'perfect-tanner-patrick',
    name: 'Perfect',
    author: 'Cover by Tanner Patrick',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg',
  },
  'You Are The Reason - Calum Scott.mp3': {
    id: 'you-are-the-reason-calum-scott',
    name: 'You Are The Reason',
    author: 'Calum Scott',
    imageUrl:
      'https://avatar-ex-swe.nixcdn.com/song/2017/12/13/6/6/b/e/1513132182265_640.jpg',
  },
  'Always - Isak Danielson.mp3': {
    id: 'always-isak-danielson',
    name: 'Always',
    author: 'Isak Danielson',
    imageUrl: 'https://i1.sndcdn.com/artworks-000360398808-ro02i7-t500x500.jpg',
  },
  'Little Things - One Direction.mp3': {
    id: 'little-things-one-direction',
    name: 'Little Things',
    author: 'One Direction',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/1/10/One_Direction_-_Little_Things.png',
  },
  'I Know You Know - Unknown.mp3': {
    id: 'i-know-you-know',
    name: 'I Know You Know',
    author: '',
    imageUrl: 'https://i1.sndcdn.com/avatars-000437586054-giecep-t500x500.jpg',
  },
  'Munn - Loved Us More.mp3': {
    id: 'munn-loved-us-more',
    name: 'Munn',
    author: 'Loved Us More',
    imageUrl: 'https://i.ytimg.com/vi/Svq5Q0LmaFc/maxresdefault.jpg',
  },
};

/**
 * SupabaseSongRepository - Supabase implementation of ISongRepository
 */
@Injectable()
export class SupabaseSongRepository implements ISongRepository {
  private readonly logger = new Logger(SupabaseSongRepository.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly config: SupabaseConfig,
  ) {}

  /**
   * Extract metadata from filename when not in our predefined mapping
   */
  private extractMetadataFromFilename(filename: string): {
    name: string;
    author: string;
  } {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Check if there's a separator for artist
    if (nameWithoutExt.includes(' - ')) {
      const [name, author] = nameWithoutExt.split(' - ');
      return { name, author };
    }

    return { name: nameWithoutExt, author: '' };
  }

  /**
   * Create a Song entity from a storage file
   */
  private createSongFromFile(file: { name: string }): Song {
    const filename = file.name;

    // Check if we have predefined metadata for this file
    const metadata = songMetadata[filename] || null;

    if (metadata) {
      return Song.create({
        id: metadata.id,
        name: metadata.name,
        author: metadata.author,
        imageUrl: metadata.imageUrl,
        filename,
      });
    }

    // Otherwise, extract metadata from filename
    const { name, author } = this.extractMetadataFromFilename(filename);
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${author.toLowerCase().replace(/\s+/g, '-')}`;

    return Song.create({
      id,
      name,
      author,
      imageUrl: `https://placehold.co/400x400/333/FFF?text=${encodeURIComponent(name)}`,
      filename,
    });
  }

  /**
   * Find all songs
   */
  async findAll(): Promise<Song[]> {
    try {
      const files = await this.supabaseService.listFiles(
        this.config.songsBucket,
      );

      // Filter to include only audio files
      const audioFiles = files.filter(
        (file) =>
          file.name.endsWith('.mp3') ||
          file.name.endsWith('.wav') ||
          file.name.endsWith('.ogg'),
      );

      // Map files to Song entities
      return audioFiles.map((file) => this.createSongFromFile(file));
    } catch (error) {
      this.logger.error(`Failed to find all songs: ${error.message}`);
      return [];
    }
  }

  /**
   * Find a song by ID
   */
  async findById(id: string): Promise<Song | null> {
    try {
      // Get all songs and find the one with matching ID
      const songs = await this.findAll();
      return songs.find((song) => song.id === id) || null;
    } catch (error) {
      this.logger.error(`Failed to find song by ID ${id}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get a signed URL for a song file
   */
  async getSignedUrl(
    filename: string,
    expiresIn: number,
  ): Promise<string | null> {
    try {
      return this.supabaseService.createSignedUrl(
        this.config.songsBucket,
        filename,
        expiresIn,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get signed URL for ${filename}: ${error.message}`,
      );
      return null;
    }
  }
}
