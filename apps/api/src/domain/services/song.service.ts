import { Inject, Injectable } from '@nestjs/common';
import { Song } from '../entities/song.entity';
import {
  ISongRepository,
  SONG_REPOSITORY,
} from '../repositories/song.repository.interface';

/**
 * SongService - contains the domain logic for songs
 */
@Injectable()
export class SongService {
  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  /**
   * Get all songs
   */
  async getAllSongs(): Promise<Song[]> {
    return this.songRepository.findAll();
  }

  /**
   * Get a song by its ID
   */
  async getSongById(id: string): Promise<Song | null> {
    return this.songRepository.findById(id);
  }

  /**
   * Get a signed URL for a song file
   */
  async getSignedUrl(
    filename: string,
    expiresIn: number,
  ): Promise<string | null> {
    return this.songRepository.getSignedUrl(filename, expiresIn);
  }
}
