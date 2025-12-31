import { staticSongs } from '../../../packages/utils/src/songs';

export interface MigrationSong {
  oldId: string;
  newId: string;
  title: string;
  artist: string;
  oldAudioUrl: string;
  oldThumbnailUrl: string;
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
 */
export function getAudioFilename(oldUrl: string): string {
  const filename = oldUrl.split('/').pop();
  if (!filename) {
    throw new Error(`Invalid audio URL - no filename found: ${oldUrl}`);
  }
  return filename;
}
