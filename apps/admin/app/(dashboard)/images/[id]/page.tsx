"use client";

import { use, useEffect, useState } from "react";
import { ImageForm } from "@/components/images/image-form";
import { imagesApi } from "@/lib/api";
import type { ImageResponseDto } from "@love-days/types";
import { toast } from "sonner";

export default function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [image, setImage] = useState<ImageResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const data = await imagesApi.get(id);
        setImage(data);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load image",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Edit Image</h1>
        <p className="text-muted-foreground">Update image information</p>
      </div>

      <ImageForm
        mode="edit"
        initialData={{
          id: image.id,
          title: image.title,
          description: image.description,
          category: image.category,
          filePath: image.filePath,
        }}
      />
    </div>
  );
}
