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
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageUploadUrlDto } from './dto/upload-url.dto';
import { UploadUrlResponseDto } from '../storage/dto/upload-url-response.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('images')
@Controller('api/v1/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload-url')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate presigned upload URL for image file' })
  @ApiResponse({ status: 201, type: UploadUrlResponseDto })
  async getUploadUrl(
    @Body() dto: ImageUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    return this.imagesService.generateUploadUrl(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List images (filter by category)' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Query('published') published?: string,
    @Query('category') category?: string,
  ) {
    const isPublished = published === 'false' ? false : true;
    return this.imagesService.findAll(isPublished, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create image with metadata (after file upload)' })
  create(@Body() dto: CreateImageDto) {
    return this.imagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update image (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateImageDto) {
    return this.imagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete image and file from storage' })
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish/unpublish image (admin only)' })
  publish(@Param('id') id: string, @Body('published') published: boolean) {
    return this.imagesService.publish(id, published);
  }
}
