"use client";

import { useState } from "react";
import { SongForm } from "@/components/songs/song-form";
import { YouTubeImportForm } from "@/components/songs/youtube-import-form";
import { Button } from "@/components/ui/button";

export default function NewSongPage() {
  const [activeTab, setActiveTab] = useState<"youtube" | "upload">("youtube");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Add Song</h1>
        <p className="text-muted-foreground">
          Import from YouTube or upload audio file
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "youtube" ? "default" : "ghost"}
          onClick={() => setActiveTab("youtube")}
          className="rounded-b-none"
        >
          YouTube Import
        </Button>
        <Button
          variant={activeTab === "upload" ? "default" : "ghost"}
          onClick={() => setActiveTab("upload")}
          className="rounded-b-none"
        >
          File Upload
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === "youtube" ? (
          <YouTubeImportForm />
        ) : (
          <SongForm mode="create" />
        )}
      </div>
    </div>
  );
}
