export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration?: number
  genre?: string
  releaseYear?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateSongInput {
  title: string
  artist: string
  album?: string
  duration?: number
  genre?: string
  releaseYear?: number
}

export interface UpdateSongInput extends Partial<CreateSongInput> {
  id: string
}
