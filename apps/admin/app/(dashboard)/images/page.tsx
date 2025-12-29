"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { ImagesGrid } from "@/components/images/images-grid";
import { imagesApi } from "@/lib/api";
import type { ImageResponseDto } from "@love-days/types";
import { toast } from "sonner";

export default function ImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchImages = useCallback(async () => {
    try {
      const filter = categoryFilter === "all" ? undefined : categoryFilter;
      const data = await imagesApi.list(filter);
      setImages(data);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load images",
      );
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Images</h1>
          <p className="text-muted-foreground">Manage your image gallery</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="profile">Profile</SelectItem>
              <SelectItem value="background">Background</SelectItem>
              <SelectItem value="gallery">Gallery</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => router.push("/images/new")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <ImagesGrid images={images} onRefresh={fetchImages} />
      )}
    </div>
  );
}
