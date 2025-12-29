"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  onUpload: (file: File) => Promise<string>;
  onComplete?: (filePath: string) => void;
  className?: string;
}

export function FileUpload({
  accept = { "audio/*": [".mp3", ".wav", ".m4a"] },
  maxSize = 50 * 1024 * 1024,
  onUpload,
  onComplete,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      try {
        const filePath = await onUpload(file);
        setProgress(100);
        setSuccess(true);
        onComplete?.(filePath);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {success ? (
            <CheckCircle className="h-10 w-10 text-green-500" />
          ) : error ? (
            <AlertCircle className="h-10 w-10 text-destructive" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the file here"
              : success
                ? "File uploaded successfully"
                : "Drag & drop a file, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
