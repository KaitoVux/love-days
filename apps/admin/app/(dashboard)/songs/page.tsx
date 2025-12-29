import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function SongsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground">Manage your music collection</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Song
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Song List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Song management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
