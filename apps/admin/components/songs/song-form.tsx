"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { ImageCropper } from "@/components/upload/image-cropper";
import { songsApi, imagesApi } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";

interface SongFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    filePath: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
  };
}

export function SongForm({ mode, initialData }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [album, setAlbum] = useState(initialData?.album || "");
  const [filePath, setFilePath] = useState(initialData?.filePath || "");
  const [thumbnailPath, setThumbnailPath] = useState(
    initialData?.thumbnailPath || "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const { upload, uploading } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      songsApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => setFilePath(path),
    onError: (error) => toast.error(error.message),
  });

  const { upload: uploadThumbnail, uploading: uploadingThumbnail } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      imagesApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => {
      setThumbnailPath(path);
      // Generate preview URL using Supabase storage URL pattern
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const previewUrl = `${supabaseUrl}/storage/v1/object/public/${path}`;
      setThumbnailUrl(previewUrl);
    },
    onError: (error) => toast.error(error.message),
  });

  // Handle image selection - show cropper before upload
  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageUrl(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle cropped image - upload to server
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!selectedImageFile) return;

    // Create a new File object from the cropped blob
    const croppedFile = new File([croppedBlob], selectedImageFile.name, {
      type: "image/jpeg",
    });

    // Upload the cropped image
    await uploadThumbnail(croppedFile);
    setSelectedImageFile(null);
    setSelectedImageUrl("");
  };

  // Handle thumbnail removal
  const handleRemoveThumbnail = () => {
    setThumbnailPath("");
    setThumbnailUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !filePath) {
      toast.error("Please upload an audio file");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await songsApi.create({
          title,
          artist,
          album,
          filePath,
          thumbnailPath: thumbnailPath || undefined,
        });
        toast.success("Song created successfully");
      } else {
        await songsApi.update(initialData!.id, {
          title,
          artist,
          album,
          thumbnailPath: thumbnailPath || undefined,
        });
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
              <Label>Audio File *</Label>
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

          {/* Thumbnail Upload - Available in both create and edit mode */}
          <div className="space-y-2">
            <Label>Thumbnail (Album Art)</Label>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Optional: Upload album cover art (will be cropped to square)"
                : "Update album cover art (will be cropped to square)"}
            </p>

            {thumbnailUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Image
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    width={120}
                    height={120}
                    className="rounded-md border border-border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                    className="hidden"
                    id="thumbnail-replace"
                  />
                  <Label htmlFor="thumbnail-replace">
                    <Button type="button" variant="outline" asChild>
                      <span>Replace Image</span>
                    </Button>
                  </Label>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <Label htmlFor="thumbnail-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                    disabled={uploadingThumbnail}
                  >
                    <span>
                      {uploadingThumbnail ? "Uploading..." : "Choose Image"}
                    </span>
                  </Button>
                </Label>
              </div>
            )}
          </div>

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
            <Button
              type="submit"
              disabled={submitting || uploading || uploadingThumbnail}
            >
              {submitting
                ? "Saving..."
                : uploading || uploadingThumbnail
                  ? "Uploading..."
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

      {/* Image Cropper Modal */}
      <ImageCropper
        imageUrl={selectedImageUrl}
        open={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setSelectedImageUrl("");
          setSelectedImageFile(null);
        }}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="rect"
      />
    </form>
  );
}
