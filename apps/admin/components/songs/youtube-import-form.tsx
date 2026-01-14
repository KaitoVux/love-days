"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { songsApi } from "@/lib/api";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function YouTubeImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await songsApi.createFromYoutube(url);
      setSuccess(true);
      setUrl("");

      // Redirect to songs list after 1.5s
      setTimeout(() => {
        router.push("/songs");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to import song from YouTube",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from YouTube</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL or Video ID</Label>
            <Input
              id="youtube-url"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Paste a YouTube URL or video ID. Metadata will be auto-extracted.
            </p>
          </div>

          <Button type="submit" disabled={loading || !url}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import from YouTube"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Song imported successfully! Redirecting to songs list...
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Supported formats:</strong>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>https://www.youtube.com/watch?v=ID</li>
            <li>https://youtu.be/ID</li>
            <li>Video ID only (e.g., dQw4w9WgXcQ)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
