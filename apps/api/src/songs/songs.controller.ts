import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongUploadUrlDto } from './dto/upload-url.dto';
import { UploadUrlResponseDto } from '../storage/dto/upload-url-response.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('songs')
@Controller('api/v1/songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  // Generate presigned upload URL
  @Post('upload-url')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate presigned upload URL for audio file' })
  @ApiResponse({ status: 201, type: UploadUrlResponseDto })
  async getUploadUrl(
    @Body() dto: SongUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    return this.songsService.generateUploadUrl(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all songs' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  findAll(@Query('published') published?: string) {
    // Handle query param: 'true' -> true, 'false' -> false, empty/undefined -> undefined (all)
    const isPublished =
      published === 'true' ? true : published === 'false' ? false : undefined;
    return this.songsService.findAll(isPublished);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get song by ID' })
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create song with metadata (after file upload)' })
  create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update song (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateSongDto) {
    return this.songsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete song and file from storage' })
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish/unpublish song (admin only)' })
  publish(@Param('id') id: string, @Body('published') published: boolean) {
    return this.songsService.publish(id, published);
  }
}
