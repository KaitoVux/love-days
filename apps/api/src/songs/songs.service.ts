import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongUploadUrlDto } from './dto/upload-url.dto';
import { UploadUrlResponseDto } from '../storage/dto/upload-url-response.dto';

const MAX_SONG_SIZE = 50 * 1024 * 1024; // 50MB
const SONGS_BUCKET = 'songs';

interface SongTransformed {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  duration?: number;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SongsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // Generate presigned upload URL
  async generateUploadUrl(
    dto: SongUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    return this.storage.generateUploadUrl({
      bucket: SONGS_BUCKET,
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileSize: dto.fileSize,
      maxSizeBytes: MAX_SONG_SIZE,
    });
  }

  async findAll(published?: boolean): Promise<SongTransformed[]> {
    const songs = await this.prisma.song.findMany({
      where: published !== undefined ? { published } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include public URLs
    return songs.map((song) => this.transformSong(song));
  }

  async findOne(id: string): Promise<SongTransformed> {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return this.transformSong(song);
  }

  async create(dto: CreateSongDto): Promise<SongTransformed> {
    const song = await this.prisma.song.create({ data: dto });
    return this.transformSong(song);
  }

  async update(id: string, dto: UpdateSongDto): Promise<SongTransformed> {
    await this.findOne(id);
    const song = await this.prisma.song.update({
      where: { id },
      data: dto,
    });
    return this.transformSong(song);
  }

  async remove(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    // Delete file from storage
    try {
      await this.storage.deleteFile(SONGS_BUCKET, song.filePath);
    } catch (e) {
      // Log but don't fail if file deletion fails
      console.error('Failed to delete song file:', e);
    }

    // Delete thumbnail if exists
    if (song.thumbnailPath) {
      try {
        await this.storage.deleteFile('images', song.thumbnailPath);
      } catch (e) {
        console.error('Failed to delete thumbnail:', e);
      }
    }

    return this.prisma.song.delete({ where: { id } });
  }

  async publish(id: string, published: boolean): Promise<SongTransformed> {
    await this.findOne(id);
    const song = await this.prisma.song.update({
      where: { id },
      data: { published },
    });
    return this.transformSong(song);
  }

  // Transform song to include public URLs
  private transformSong(song: {
    id: string;
    title: string;
    artist: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    duration?: number;
    thumbnailPath?: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SongTransformed {
    return {
      ...song,
      fileUrl: this.storage.getPublicUrl(SONGS_BUCKET, song.filePath),
      thumbnailUrl: song.thumbnailPath
        ? this.storage.getPublicUrl('images', song.thumbnailPath)
        : undefined,
    };
  }
}
