"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Play, Pause } from "lucide-react";
import type { SongResponseDto } from "@love-days/types";
import { songsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SongsTableProps {
  songs: SongResponseDto[];
  onRefresh: () => void;
}

export function SongsTable({ songs, onRefresh }: SongsTableProps) {
  const router = useRouter();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const handlePublish = async (id: string, published: boolean) => {
    try {
      await songsApi.publish(id, published);
      toast.success(published ? "Song published" : "Song unpublished");
      onRefresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;

    try {
      await songsApi.delete(id);
      toast.success("Song deleted");
      onRefresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const togglePlay = (song: SongResponseDto) => {
    if (playingId === song.id) {
      audio?.pause();
      setPlayingId(null);
      setAudio(null);
    } else {
      audio?.pause();
      const newAudio = new Audio(song.fileUrl);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudio(newAudio);
      setPlayingId(song.id);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Album</TableHead>
            <TableHead className="text-center">Published</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePlay(song)}
                >
                  {playingId === song.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>{song.artist}</TableCell>
              <TableCell>{song.album || "-"}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={song.published}
                  onCheckedChange={(checked) => handlePublish(song.id, checked)}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/songs/${song.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(song.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {songs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No songs yet. Upload your first song!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
