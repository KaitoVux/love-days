"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { SongsTable } from "@/components/songs/songs-table";
import { songsApi } from "@/lib/api";
import type { SongResponseDto } from "@love-days/types";
import { toast } from "sonner";

export default function SongsPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<SongResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    try {
      const data = await songsApi.list();
      setSongs(data);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load songs",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground">Manage your music collection</p>
        </div>
        <Button onClick={() => router.push("/songs/new")}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Song
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <SongsTable songs={songs} onRefresh={fetchSongs} />
      )}
    </div>
  );
}
