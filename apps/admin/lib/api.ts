import { createClient } from "@/lib/supabase";
import type {
  ISong,
  IImage,
  CreateSongDto,
  CreateImageDto,
  UpdateSongDto,
  UpdateImageDto,
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
    fetchApi<ISong[]>(`/api/v1/songs?published=${published ?? ""}`),

  get: (id: string) => fetchApi<ISong>(`/api/v1/songs/${id}`),

  create: (data: CreateSongDto) =>
    fetchApi<ISong>("/api/v1/songs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSongDto) =>
    fetchApi<ISong>(`/api/v1/songs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/songs/${id}`, { method: "DELETE" }),

  publish: (id: string, published: boolean) =>
    fetchApi<ISong>(`/api/v1/songs/${id}/publish`, {
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
    fetchApi<IImage[]>(`/api/v1/images?category=${category ?? ""}`),

  get: (id: string) => fetchApi<IImage>(`/api/v1/images/${id}`),

  create: (data: CreateImageDto) =>
    fetchApi<IImage>("/api/v1/images", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateImageDto) =>
    fetchApi<IImage>(`/api/v1/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/images/${id}`, { method: "DELETE" }),

  getUploadUrl: (fileName: string, fileType: string, fileSize?: number) =>
    fetchApi<{ uploadUrl: string; filePath: string }>(
      "/api/v1/images/upload-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      },
    ),
};
