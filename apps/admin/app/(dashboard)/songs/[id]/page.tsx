"use client";

import { use, useEffect, useState } from "react";
import { SongForm } from "@/components/songs/song-form";
import { songsApi } from "@/lib/api";
import type { SongResponseDto } from "@love-days/types";
import { toast } from "sonner";

export default function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [song, setSong] = useState<SongResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const data = await songsApi.get(id);
        setSong(data);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load song",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!song) {
    return <div>Song not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Edit Song</h1>
        <p className="text-muted-foreground">Update song information</p>
      </div>

      <SongForm
        mode="edit"
        initialData={{
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          filePath: song.filePath,
          thumbnailPath: song.thumbnailPath,
          thumbnailUrl: song.thumbnailUrl,
        }}
      />
    </div>
  );
}
