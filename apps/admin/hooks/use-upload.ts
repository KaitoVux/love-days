"use client";

import { useState, useCallback } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseUploadOptions {
  getUploadUrl: (
    fileName: string,
    fileType: string,
    fileSize: number,
  ) => Promise<{
    uploadUrl: string;
    filePath: string;
  }>;
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export function useUpload({
  getUploadUrl,
  onSuccess,
  onError,
}: UseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });
      setError(null);

      try {
        // Get presigned URL
        const { uploadUrl, filePath } = await getUploadUrl(
          file.name,
          file.type,
          file.size,
        );

        // Upload file with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress({
                loaded: e.loaded,
                total: e.total,
                percentage: Math.round((e.loaded / e.total) * 100),
              });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        onSuccess?.(filePath);
        return filePath;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [getUploadUrl, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return { upload, uploading, progress, error, reset };
}
