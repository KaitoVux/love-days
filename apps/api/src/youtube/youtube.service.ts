import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';

interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  duration: number; // seconds
  thumbnailUrl: string;
  channelTitle: string;
}

@Injectable()
export class YouTubeService {
  private youtube: youtube_v3.Youtube;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  /**
   * Extract video ID from YouTube URL
   * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
   */
  extractVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    throw new BadRequestException('Invalid YouTube URL or video ID');
  }

  /**
   * Fetch video metadata from YouTube Data API
   * Quota cost: 1 unit per call
   */
  async getVideoInfo(videoIdOrUrl: string): Promise<YouTubeVideoInfo> {
    const videoId = this.extractVideoId(videoIdOrUrl);

    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'status'],
        id: [videoId],
      });

      const video = response.data.items?.[0];
      if (!video) {
        throw new NotFoundException(`YouTube video not found: ${videoId}`);
      }

      // Check if video is embeddable
      if (!video.status?.embeddable) {
        throw new BadRequestException(
          'Video embedding is disabled by the creator',
        );
      }

      return {
        videoId,
        title: video.snippet?.title || 'Unknown Title',
        duration: this.parseDuration(video.contentDetails?.duration || 'PT0S'),
        thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
        channelTitle: video.snippet?.channelTitle || '',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to fetch YouTube video: ${errorMessage}`,
      );
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   * Example: "PT4M13S" → 253 seconds
   */
  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Parse metadata title into artist/song
   * Common patterns: "Artist - Title", "Title | Artist", "Artist: Title"
   */
  parseMetadata(videoTitle: string): { artist: string; title: string } {
    const patterns = [
      { regex: /^(.+?)\s*-\s*(.+)$/, artist: 1, title: 2 }, // "Artist - Title"
      { regex: /^(.+?)\s*\|\s*(.+)$/, artist: 2, title: 1 }, // "Title | Artist"
      { regex: /^(.+?):\s*(.+)$/, artist: 1, title: 2 }, // "Artist: Title"
      { regex: /^(.+?)\s*by\s+(.+)$/i, artist: 2, title: 1 }, // "Title by Artist"
    ];

    for (const pattern of patterns) {
      const match = videoTitle.match(pattern.regex);
      if (match) {
        return {
          artist: match[pattern.artist].trim(),
          title: match[pattern.title].trim(),
        };
      }
    }

    // Fallback: use channel name as artist
    return {
      title: videoTitle.trim(),
      artist: 'Unknown Artist',
    };
  }
}
