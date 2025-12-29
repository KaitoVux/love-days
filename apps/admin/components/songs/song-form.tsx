"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { songsApi } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

interface SongFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    filePath: string;
  };
}

export function SongForm({ mode, initialData }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [album, setAlbum] = useState(initialData?.album || "");
  const [filePath, setFilePath] = useState(initialData?.filePath || "");
  const [submitting, setSubmitting] = useState(false);

  const { upload, uploading } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      songsApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => setFilePath(path),
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !filePath) {
      toast.error("Please upload an audio file");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await songsApi.create({ title, artist, album, filePath });
        toast.success("Song created successfully");
      } else {
        await songsApi.update(initialData!.id, { title, artist, album });
        toast.success("Song updated successfully");
      }
      router.push("/songs");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Upload New Song" : "Edit Song"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "create" && (
            <div className="space-y-2">
              <Label>Audio File</Label>
              <FileUpload
                accept={{ "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] }}
                maxSize={50 * 1024 * 1024}
                onUpload={upload}
                onComplete={(path) => setFilePath(path)}
              />
              {filePath && (
                <p className="text-sm text-muted-foreground">
                  Uploaded: {filePath}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="album">Album (optional)</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Song"
                  : "Update Song"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
