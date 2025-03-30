import { Song } from '../entities/song.entity';

/**
 * Interface for SongRepository - defines the contract for data access
 */
export interface ISongRepository {
  /**
   * Find all songs
   */
  findAll(): Promise<Song[]>;

  /**
   * Find a song by ID
   */
  findById(id: string): Promise<Song | null>;

  /**
   * Get a signed URL for a song file
   */
  getSignedUrl(filename: string, expiresIn: number): Promise<string | null>;
}

// Token to be used for dependency injection
export const SONG_REPOSITORY = 'SONG_REPOSITORY';
