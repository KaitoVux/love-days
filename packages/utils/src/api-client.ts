import { ISong } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface FetchOptions {
  timeout?: number;
  fallback?: any;
}

async function fetchWithTimeout<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 10000, fallback } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Failed to fetch ${url}:`, error);

    if (fallback !== undefined) {
      return fallback as T;
    }
    throw error;
  }
}

interface ApiSongResponse {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath: string;
  fileUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiImageResponse {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileUrl?: string;
  width?: number;
  height?: number;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

function getDefaultThumbnail(): string {
  return "/images/default-album.png";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Fetch published songs from API (for build-time static generation)
 */
export async function fetchPublishedSongs(): Promise<ISong[]> {
  try {
    const songs = await fetchWithTimeout<ApiSongResponse[]>(
      `${API_URL}/api/v1/songs?published=true`,
      { timeout: 15000, fallback: [] }
    );

    // Transform API response to match existing ISong interface
    return songs.map(song => ({
      id: song.id,
      name: song.title,
      author: song.artist,
      audio: song.fileUrl || "",
      img: song.thumbnailUrl || getDefaultThumbnail(),
      duration: song.duration ? formatDuration(song.duration) : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch songs from API:", error);
    return [];
  }
}

/**
 * Fetch published images from API (for build-time static generation)
 */
export async function fetchPublishedImages(category?: string): Promise<ApiImageResponse[]> {
  try {
    const url = category
      ? `${API_URL}/api/v1/images?published=true&category=${category}`
      : `${API_URL}/api/v1/images?published=true`;

    return await fetchWithTimeout<ApiImageResponse[]>(url, {
      timeout: 15000,
      fallback: [],
    });
  } catch (error) {
    console.error("Failed to fetch images from API:", error);
    return [];
  }
}
