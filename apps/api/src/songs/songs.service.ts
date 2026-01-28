import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { YouTubeService } from '../youtube/youtube.service';
import { Prisma } from '@prisma/client';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { SongUploadUrlDto } from './dto/upload-url.dto';
import { QuerySongsDto } from './dto/query-songs.dto';
import { UploadUrlResponseDto } from '../storage/dto/upload-url-response.dto';

const MAX_SONG_SIZE = 50 * 1024 * 1024; // 50MB
const SONGS_BUCKET = 'songs';

export interface SongTransformed {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  sourceType: string;

  // YouTube source fields
  youtubeVideoId?: string;

  // Upload source fields
  filePath?: string;
  fileUrl?: string;
  fileSize?: number | null;

  // Shared fields
  duration: number | null;
  thumbnailPath: string | null;
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
    private youtubeService: YouTubeService,
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

    return songs.map((song) => this.transformSong(song));
  }

  // Paginated query with search, filter, sorting
  async findAllPaginated(query: QuerySongsDto): Promise<{
    data: SongTransformed[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }> {
    const {
      search,
      published,
      sourceType,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.SongWhereInput = {};

    // Published filter
    const isPublished =
      published === 'true' ? true : published === 'false' ? false : undefined;
    if (isPublished !== undefined) where.published = isPublished;

    // Source type filter
    if (sourceType) where.sourceType = sourceType;

    // Search across title and artist
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.song.count({ where }),
    ]);

    return {
      data: songs.map((song) => this.transformSong(song)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
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

  /**
   * Create song from YouTube URL
   * Processing time: ~1-2 seconds (vs 30-60s for download)
   */
  async createFromYoutube(youtubeUrl: string): Promise<SongTransformed> {
    // 1. Fetch metadata from YouTube
    const videoInfo = await this.youtubeService.getVideoInfo(youtubeUrl);

    // 2. Parse artist/title from video title
    const metadata = this.youtubeService.parseMetadata(videoInfo.title);

    // 3. Create song record
    const song = await this.prisma.song.create({
      data: {
        title: metadata.title,
        artist: metadata.artist,
        duration: videoInfo.duration,
        youtubeVideoId: videoInfo.videoId,
        thumbnailPath: videoInfo.thumbnailUrl, // Store YouTube URL (not uploaded file)
        sourceType: 'youtube',
        published: false,
      },
    });

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

    // Delete file from storage (only for uploaded songs)
    if (song.sourceType === 'upload' && song.filePath) {
      try {
        await this.storage.deleteFile(SONGS_BUCKET, song.filePath);
      } catch (e) {
        // Log but don't fail if file deletion fails
        console.error('Failed to delete song file:', e);
      }
    }

    // Delete thumbnail if exists (only for uploaded songs)
    if (song.sourceType === 'upload' && song.thumbnailPath) {
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
    album: string | null;
    filePath: string | null;
    fileSize: number | null;
    duration: number | null;
    thumbnailPath: string | null;
    youtubeVideoId: string | null;
    sourceType: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SongTransformed {
    const isYouTube = song.sourceType === 'youtube';

    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      sourceType: song.sourceType,
      thumbnailPath: song.thumbnailPath,

      // YouTube: Return video ID for player
      ...(isYouTube && {
        youtubeVideoId: song.youtubeVideoId || undefined,
        thumbnailUrl: song.thumbnailPath || undefined, // Already full URL
      }),

      // Upload: Return Supabase URLs
      ...(!isYouTube && {
        filePath: song.filePath || undefined,
        fileUrl: song.filePath
          ? this.storage.getPublicUrl(SONGS_BUCKET, song.filePath)
          : undefined,
        fileSize: song.fileSize,
        thumbnailUrl: song.thumbnailPath
          ? this.storage.getPublicUrl('images', song.thumbnailPath)
          : undefined,
      }),

      published: song.published,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };
  }
}
