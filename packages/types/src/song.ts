export interface ISong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number; // seconds

  // Source type discriminator
  sourceType: "youtube" | "upload";

  // YouTube source fields
  youtubeVideoId?: string;

  // Upload source fields
  filePath?: string;
  fileSize?: number; // bytes

  // Shared fields
  thumbnailPath?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  filePath: string;
  fileSize?: number;
  thumbnailPath?: string;
}

export interface UpdateSongDto {
  title?: string;
  artist?: string;
  album?: string;
  thumbnailPath?: string;
}

export interface SongResponseDto extends ISong {
  fileUrl?: string;
  thumbnailUrl?: string;
}
