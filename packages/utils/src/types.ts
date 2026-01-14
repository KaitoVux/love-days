// Song interface matching API response
export interface ISong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;

  // Source type discriminator
  sourceType: "youtube" | "upload";

  // YouTube source fields
  youtubeVideoId?: string;

  // Upload source fields
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;

  // Shared fields
  thumbnailPath?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IImageApiResponse {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileUrl?: string;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
