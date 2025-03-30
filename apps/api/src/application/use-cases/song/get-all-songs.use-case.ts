import { Injectable } from '@nestjs/common';
import { SongService } from '../../../domain/services/song.service';
import { SongResponseDto } from '../../dtos/song.dto';

/**
 * GetAllSongsUseCase - Retrieves all songs with signed URLs
 */
@Injectable()
export class GetAllSongsUseCase {
  constructor(private readonly songService: SongService) {}

  /**
   * Execute the use case - retrieves all songs and adds signed URLs
   */
  async execute(): Promise<SongResponseDto[]> {
    // Get all songs
    const songs = await this.songService.getAllSongs();

    // Generate signed URLs for each song
    for (const song of songs) {
      if (song.filename) {
        // Default expiry time of 1 hour (3600 seconds)
        const signedUrl = await this.songService.getSignedUrl(
          song.filename,
          3600,
        );
        if (signedUrl) {
          song.audioUrl = signedUrl;
        }
      }
    }

    return SongResponseDto.fromEntities(songs);
  }
}
