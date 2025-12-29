"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import type { ImageResponseDto } from "@love-days/types";
import { imagesApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageLightbox } from "./image-lightbox";

interface ImagesGridProps {
  images: ImageResponseDto[];
  onRefresh: () => void;
}

export function ImagesGrid({ images, onRefresh }: ImagesGridProps) {
  const router = useRouter();
  const [lightboxImage, setLightboxImage] = useState<ImageResponseDto | null>(
    null,
  );

  const handlePublish = async (id: string, published: boolean) => {
    try {
      await imagesApi.publish(id, published);
      toast.success(published ? "Image published" : "Image unpublished");
      onRefresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await imagesApi.delete(id);
      toast.success("Image deleted");
      onRefresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "profile":
        return "bg-blue-500/10 text-blue-500";
      case "background":
        return "bg-purple-500/10 text-purple-500";
      case "gallery":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video relative bg-muted">
              <img
                src={image.fileUrl}
                alt={image.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxImage(image)}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setLightboxImage(image)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <h3 className="font-semibold truncate">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-md ${getCategoryColor(image.category)}`}
                >
                  {image.category}
                </span>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={image.published}
                    onCheckedChange={(checked) =>
                      handlePublish(image.id, checked)
                    }
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/images/${image.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No images yet. Upload your first image!
          </div>
        )}
      </div>

      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
