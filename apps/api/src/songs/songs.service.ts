import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async findAll(published?: boolean) {
    return this.prisma.song.findMany({
      where: published !== undefined ? { published } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return song;
  }

  async create(dto: CreateSongDto) {
    return this.prisma.song.create({ data: dto });
  }

  async update(id: string, dto: UpdateSongDto) {
    await this.findOne(id);
    return this.prisma.song.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.song.delete({ where: { id } });
  }

  async publish(id: string, published: boolean) {
    await this.findOne(id);
    return this.prisma.song.update({
      where: { id },
      data: { published },
    });
  }
}
