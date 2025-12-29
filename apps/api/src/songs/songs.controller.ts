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
} from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('songs')
@Controller('api/v1/songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({ summary: 'List all songs (public: published only)' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  findAll(@Query('published') published?: string) {
    const isPublished = published === 'false' ? false : true;
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
  @ApiOperation({ summary: 'Create song (admin only)' })
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
  @ApiOperation({ summary: 'Delete song (admin only)' })
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
