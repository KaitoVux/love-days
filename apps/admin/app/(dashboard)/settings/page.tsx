"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [rebuilding, setRebuilding] = useState(false);
  const [lastRebuild, setLastRebuild] = useState<Date | null>(null);

  const handleRebuild = async () => {
    const webhookUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL;

    if (!webhookUrl) {
      toast.error("Cloudflare deploy hook URL not configured");
      return;
    }

    setRebuilding(true);
    try {
      const response = await fetch(webhookUrl, { method: "POST" });

      if (!response.ok) {
        throw new Error("Failed to trigger rebuild");
      }

      setLastRebuild(new Date());
      toast.success("Site rebuild triggered! It will be live in ~2 minutes.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to trigger rebuild",
      );
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your site settings and account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rebuild Site</CardTitle>
          <CardDescription>
            Trigger a rebuild to publish your latest changes to the live site.
            The rebuild typically takes 2-3 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRebuild}
            disabled={rebuilding}
            className="flex items-center gap-2"
          >
            <RefreshCw className={rebuilding ? "animate-spin" : ""} size={16} />
            {rebuilding ? "Rebuilding..." : "Rebuild Site"}
          </Button>

          {lastRebuild && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Last rebuild triggered at {lastRebuild.toLocaleTimeString()}.
                Your changes will be live shortly.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Rebuild is needed after:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Publishing or unpublishing songs</li>
              <li>Publishing or unpublishing images</li>
              <li>Editing song or image metadata</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <p className="text-sm text-muted-foreground">{user?.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
