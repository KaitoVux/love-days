import { staticSongs } from '../../../packages/utils/src/songs';
import { randomUUID } from 'crypto';

export interface MigrationSong {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
  oldAudioUrl: string;
  oldThumbnailUrl: string;
}

export interface TransformedSong {
  id: string; // NEW UUID
  title: string;
  artist: string;
  album: string | null;
  filePath: string;
  thumbnailPath: string;
  published: boolean;
}

export interface MigrationMapping {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
}

/**
 * Extract song data from staticSongs array for migration
 */
export function extractSongsData(): MigrationSong[] {
  return staticSongs.map((song) => ({
    oldId: song.id,
    newId: '', // Will be set during DB insertion
    title: song.name,
    artist: song.author || 'Unknown',
    oldAudioUrl: song.audio,
    oldThumbnailUrl: song.img,
  }));
}

/**
 * Extract filename from audio URL with validation
 * Handles both full URLs and empty strings (when env var not set)
 */
export function getAudioFilename(oldUrl: string): string {
  // If URL is empty (migration context without NEXT_PUBLIC_SUPABASE_URL),
  // extract from the original staticSongs id + .mp3
  if (!oldUrl || oldUrl.trim() === '') {
    return 'song.mp3'; // Default fallback
  }

  const filename = oldUrl.split('/').pop();
  if (!filename) {
    throw new Error(`Invalid audio URL - no filename found: ${oldUrl}`);
  }
  return filename;
}

/**
 * Transform old song structure to new database schema
 */
export function transformSongForDatabase(
  oldSong: (typeof staticSongs)[0],
): TransformedSong {
  const newId = randomUUID();
  const fileExtension =
    getAudioFilename(oldSong.audio).split('.').pop() || 'mp3';
  const thumbnailExtension =
    oldSong.img.split('.').pop()?.split('?')[0] || 'png';

  return {
    id: newId,
    title: oldSong.name,
    artist: oldSong.author || 'Unknown',
    album: null, // Per user decision
    filePath: `songs/${newId}.${fileExtension}`,
    thumbnailPath: `images/${newId}.${thumbnailExtension}`,
    published: true,
  };
}

/**
 * Create mapping entry for old ID to new UUID
 */
export function createMappingEntry(
  oldId: string,
  newId: string,
  title: string,
  artist: string,
): MigrationMapping {
  return { oldId, newId, title, artist };
}
