import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageUploadUrlDto } from './dto/upload-url.dto';
import { UploadUrlResponseDto } from '../storage/dto/upload-url-response.dto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGES_BUCKET = 'images';

export interface ImageTransformed {
  id: string;
  title: string;
  description: string | null;
  filePath: string;
  fileUrl: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  category: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async generateUploadUrl(
    dto: ImageUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    return this.storage.generateUploadUrl({
      bucket: IMAGES_BUCKET,
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileSize: dto.fileSize,
      maxSizeBytes: MAX_IMAGE_SIZE,
    });
  }

  async findAll(
    published?: boolean,
    category?: string,
  ): Promise<ImageTransformed[]> {
    const images = await this.prisma.image.findMany({
      where: {
        ...(published !== undefined && { published }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return images.map((image) => this.transformImage(image));
  }

  async findOne(id: string): Promise<ImageTransformed> {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return this.transformImage(image);
  }

  async create(dto: CreateImageDto): Promise<ImageTransformed> {
    const image = await this.prisma.image.create({ data: dto });
    return this.transformImage(image);
  }

  async update(id: string, dto: UpdateImageDto): Promise<ImageTransformed> {
    await this.findOne(id);
    const image = await this.prisma.image.update({
      where: { id },
      data: dto,
    });
    return this.transformImage(image);
  }

  async remove(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Delete file from storage
    try {
      await this.storage.deleteFile(IMAGES_BUCKET, image.filePath);
    } catch (e) {
      console.error('Failed to delete image file:', e);
    }

    return this.prisma.image.delete({ where: { id } });
  }

  async publish(id: string, published: boolean): Promise<ImageTransformed> {
    await this.findOne(id);
    const image = await this.prisma.image.update({
      where: { id },
      data: { published },
    });
    return this.transformImage(image);
  }

  private transformImage(image: {
    id: string;
    title: string;
    description: string | null;
    filePath: string;
    fileSize: number | null;
    width: number | null;
    height: number | null;
    category: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ImageTransformed {
    return {
      ...image,
      fileUrl: this.storage.getPublicUrl(IMAGES_BUCKET, image.filePath),
    };
  }
}
