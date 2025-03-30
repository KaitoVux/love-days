import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GetAllSongsUseCase } from '../../application/use-cases/song/get-all-songs.use-case';
import { GetSignedUrlUseCase } from '../../application/use-cases/song/get-signed-url.use-case';
import {
  SongResponseDto,
  SignedUrlResponseDto,
} from '../../application/dtos/song.dto';

/**
 * SongController - HTTP endpoints for song-related operations
 */
@Controller('songs')
export class SongController {
  private readonly logger = new Logger(SongController.name);

  constructor(
    private readonly getAllSongsUseCase: GetAllSongsUseCase,
    private readonly getSignedUrlUseCase: GetSignedUrlUseCase,
  ) {}

  /**
   * Get all songs
   */
  @Get()
  async getAllSongs(): Promise<SongResponseDto[]> {
    this.logger.log('GET /songs - Getting all songs');
    return this.getAllSongsUseCase.execute();
  }

  /**
   * Get a signed URL for a song file
   */
  @Get('signed-url/:filename')
  async getSignedUrl(
    @Param('filename') filename: string,
    @Query('expiresIn') expiresInStr?: string,
  ): Promise<SignedUrlResponseDto> {
    const expiresIn = expiresInStr ? parseInt(expiresInStr, 10) : 3600; // Default 1 hour

    this.logger.log(
      `GET /songs/signed-url/${filename} - Generating signed URL, expires in ${expiresIn}s`,
    );

    try {
      return await this.getSignedUrlUseCase.execute(filename, expiresIn);
    } catch (error) {
      this.logger.error(`Failed to get signed URL: ${error.message}`);
      throw new NotFoundException(
        `Could not generate signed URL for ${filename}`,
      );
    }
  }
}
