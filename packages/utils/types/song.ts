/**
 * Represents a song with metadata and audio URL
 */
export interface ISong {
  id: string;
  name: string;
  author: string;
  img: string;
  audio: string;
  duration?: string;
}
