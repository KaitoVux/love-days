"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageResponseDto } from "@love-days/types";

interface ImageLightboxProps {
  image: ImageResponseDto;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <div
        className="max-w-7xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.fileUrl}
          alt={image.title}
          className="w-full h-full object-contain"
        />

        <div className="mt-4 text-white text-center space-y-2">
          <h2 className="text-2xl font-bold">{image.title}</h2>
          {image.description && (
            <p className="text-gray-300">{image.description}</p>
          )}
          <p className="text-sm text-gray-400">
            Category: {image.category} • {image.width} × {image.height}
          </p>
        </div>
      </div>
    </div>
  );
}
