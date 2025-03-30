/**
 * Represents a Song entity in our domain
 */
export class Song {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly author: string,
    public readonly imageUrl: string,
    public readonly filename: string,
    public audioUrl?: string,
  ) {}

  /**
   * Factory method to create a Song instance from raw data
   */
  static create(params: {
    id: string;
    name: string;
    author?: string;
    imageUrl: string;
    filename: string;
    audioUrl?: string;
  }): Song {
    return new Song(
      params.id,
      params.name,
      params.author || '',
      params.imageUrl,
      params.filename,
      params.audioUrl,
    );
  }
}
