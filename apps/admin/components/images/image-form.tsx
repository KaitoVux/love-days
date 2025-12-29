"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { imagesApi } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

interface ImageFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description?: string;
    category: "profile" | "background" | "gallery";
    filePath: string;
  };
}

export function ImageForm({ mode, initialData }: ImageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [category, setCategory] = useState<
    "profile" | "background" | "gallery"
  >(initialData?.category || "gallery");
  const [filePath, setFilePath] = useState(initialData?.filePath || "");
  const [submitting, setSubmitting] = useState(false);

  const { upload, uploading } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      imagesApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => setFilePath(path),
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !filePath) {
      toast.error("Please upload an image file");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await imagesApi.create({
          title,
          description,
          category,
          filePath,
        });
        toast.success("Image created successfully");
      } else {
        await imagesApi.update(initialData!.id, {
          title,
          description,
          category,
        });
        toast.success("Image updated successfully");
      }
      router.push("/images");
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
            {mode === "create" ? "Upload New Image" : "Edit Image"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "create" && (
            <div className="space-y-2">
              <Label>Image File</Label>
              <FileUpload
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                }}
                maxSize={10 * 1024 * 1024}
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Image description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as never)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="background">Background</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Image"
                  : "Update Image"}
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
