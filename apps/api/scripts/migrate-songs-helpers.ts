import { staticSongs } from '../../../packages/utils/src/songs';
import { randomUUID } from 'crypto';
import * as mm from 'music-metadata';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';

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
  oldAudioUrl?: string;
  oldThumbnailUrl?: string;
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

const TEMP_DIR = path.join(__dirname, 'migration-output', 'temp');

/**
 * Download file with retry logic
 */
export async function downloadFile(url: string, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Download failed after retries');
}

/**
 * Extract audio metadata from MP3 buffer
 */
export async function extractAudioMetadata(buffer: Buffer) {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  const tempPath = path.join(TEMP_DIR, `temp-${Date.now()}.mp3`);

  try {
    await fs.writeFile(tempPath, buffer);
    const metadata = await mm.parseFile(tempPath);

    return {
      duration: Math.round(metadata.format.duration || 0),
      bitrate: metadata.format.bitrate || 0,
      sampleRate: metadata.format.sampleRate || 0,
      fileSize: buffer.length,
    };
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

/**
 * Get thumbnail file extension from URL
 */
export function getThumbnailExtension(url: string): string {
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '') ? ext! : 'png';
}

/**
 * Upload file to Supabase storage with retry logic
 */
export async function uploadToSupabase(
  supabase: SupabaseClient,
  bucket: string,
  filepath: string,
  buffer: Buffer,
  contentType: string,
  retries = 3,
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filepath, buffer, {
          contentType,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filepath);

      return urlData.publicUrl;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error('Upload failed after retries');
}
