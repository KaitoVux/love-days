export interface IImage {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize?: number;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface CreateImageDto {
  title: string;
  description?: string;
  filePath: string;
  fileSize?: number;
  width?: number;
  height?: number;
  category: "profile" | "background" | "gallery";
}

export interface UpdateImageDto {
  title?: string;
  description?: string;
  category?: "profile" | "background" | "gallery";
}

export interface ImageResponseDto extends IImage {
  fileUrl: string;
}
