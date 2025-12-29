import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(published?: boolean, category?: string) {
    return this.prisma.image.findMany({
      where: {
        ...(published !== undefined && { published }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async create(dto: CreateImageDto) {
    return this.prisma.image.create({ data: dto });
  }

  async update(id: string, dto: UpdateImageDto) {
    await this.findOne(id);
    return this.prisma.image.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.image.delete({ where: { id } });
  }

  async publish(id: string, published: boolean) {
    await this.findOne(id);
    return this.prisma.image.update({
      where: { id },
      data: { published },
    });
  }
}
