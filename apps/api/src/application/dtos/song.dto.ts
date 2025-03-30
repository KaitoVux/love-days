import { Song } from '../../domain/entities/song.entity';

/**
 * SongResponseDto - Data transfer object for song data
 * Field names match the client-side ISong interface
 */
export class SongResponseDto {
  id: string;
  name: string;
  author: string;
  img: string; // matches client-side 'img' field
  audio: string; // matches client-side 'audio' field
  duration?: string; // optional, will be calculated by the client if not provided

  constructor(song: Song) {
    this.id = song.id;
    this.name = song.name;
    this.author = song.author;
    this.img = song.imageUrl; // Map from imageUrl to img
    this.audio = song.audioUrl || ''; // Map from audioUrl to audio
    // Duration is calculated client-side based on the audio file metadata
    this.duration = '0:00'; // Default placeholder
  }

  /**
   * Factory method to map a domain entity to a DTO
   */
  static fromEntity(song: Song): SongResponseDto {
    return new SongResponseDto(song);
  }

  /**
   * Factory method to map multiple domain entities to DTOs
   */
  static fromEntities(songs: Song[]): SongResponseDto[] {
    return songs.map((song) => SongResponseDto.fromEntity(song));
  }
}

/**
 * SignedUrlResponseDto - Response with a signed URL
 */
export class SignedUrlResponseDto {
  filename: string;
  signedUrl: string;
  expiresIn: number;

  constructor(filename: string, signedUrl: string, expiresIn: number) {
    this.filename = filename;
    this.signedUrl = signedUrl;
    this.expiresIn = expiresIn;
  }
}
