import { Injectable, NotFoundException } from '@nestjs/common';
import { SongService } from '../../../domain/services/song.service';
import { SignedUrlResponseDto } from '../../dtos/song.dto';

/**
 * GetSignedUrlUseCase - Generates a signed URL for a song file
 */
@Injectable()
export class GetSignedUrlUseCase {
  constructor(private readonly songService: SongService) {}

  /**
   * Execute the use case
   */
  async execute(
    filename: string,
    expiresIn: number = 3600,
  ): Promise<SignedUrlResponseDto> {
    const signedUrl = await this.songService.getSignedUrl(filename, expiresIn);

    if (!signedUrl) {
      throw new NotFoundException(
        `Could not generate signed URL for file: ${filename}`,
      );
    }

    return new SignedUrlResponseDto(filename, signedUrl, expiresIn);
  }
}
