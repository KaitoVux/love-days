// Existing interface (for backward compatibility with frontend)
export interface ISong {
  id: string;
  name: string;
  author: string;
  audio: string;
  img: string;
  duration?: string;
}

// New interface matching API response
export interface ISongApiResponse {
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
