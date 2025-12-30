import { createClient } from "@/lib/supabase";
import type {
  SongResponseDto,
  ImageResponseDto,
  CreateSongDto,
  CreateImageDto,
  UpdateSongDto,
  UpdateImageDto,
  DeployResponseDto,
  DeployStatusDto,
} from "@love-days/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(data.session
      ? { Authorization: `Bearer ${data.session.access_token}` }
      : {}),
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Songs API
export const songsApi = {
  list: (published?: boolean) =>
    fetchApi<SongResponseDto[]>(`/api/v1/songs?published=${published ?? ""}`),

  get: (id: string) => fetchApi<SongResponseDto>(`/api/v1/songs/${id}`),

  create: (data: CreateSongDto) =>
    fetchApi<SongResponseDto>("/api/v1/songs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSongDto) =>
    fetchApi<SongResponseDto>(`/api/v1/songs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/songs/${id}`, { method: "DELETE" }),

  publish: (id: string, published: boolean) =>
    fetchApi<SongResponseDto>(`/api/v1/songs/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    }),

  getUploadUrl: (fileName: string, fileType: string, fileSize?: number) =>
    fetchApi<{ uploadUrl: string; filePath: string }>(
      "/api/v1/songs/upload-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      },
    ),
};

// Images API
export const imagesApi = {
  list: (category?: string) =>
    fetchApi<ImageResponseDto[]>(`/api/v1/images?category=${category ?? ""}`),

  get: (id: string) => fetchApi<ImageResponseDto>(`/api/v1/images/${id}`),

  create: (data: CreateImageDto) =>
    fetchApi<ImageResponseDto>("/api/v1/images", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateImageDto) =>
    fetchApi<ImageResponseDto>(`/api/v1/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/images/${id}`, { method: "DELETE" }),

  publish: (id: string, published: boolean) =>
    fetchApi<ImageResponseDto>(`/api/v1/images/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    }),

  getUploadUrl: (fileName: string, fileType: string, fileSize?: number) =>
    fetchApi<{ uploadUrl: string; filePath: string }>(
      "/api/v1/images/upload-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      },
    ),
};

// Deploy API
export const deployApi = {
  trigger: () =>
    fetchApi<DeployResponseDto>("/api/v1/deploy/trigger", {
      method: "POST",
    }),

  status: () => fetchApi<DeployStatusDto>("/api/v1/deploy/status"),
};
