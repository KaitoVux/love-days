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
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('images')
@Controller('api/v1/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

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
  @ApiOperation({ summary: 'Create image (admin only)' })
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
  @ApiOperation({ summary: 'Delete image (admin only)' })
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
