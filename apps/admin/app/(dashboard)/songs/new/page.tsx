import { SongForm } from "@/components/songs/song-form";

export default function NewSongPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Upload Song</h1>
        <p className="text-muted-foreground">
          Add a new song to your collection
        </p>
      </div>

      <SongForm mode="create" />
    </div>
  );
}
