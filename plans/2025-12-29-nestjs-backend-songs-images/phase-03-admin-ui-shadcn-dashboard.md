# Phase 3: Admin UI (shadcn Dashboard)

**Phase**: 3 of 4
**Duration**: Week 3
**Status**: Pending
**Priority**: High
**Parent**: [Main Plan](./plan.md)

---

## Context Links

- **Parent Plan**: [NestJS Backend Songs & Images](./plan.md)
- **Previous Phase**: [Phase 2 - Presigned URL File Upload](./phase-02-presigned-url-file-upload.md)
- **Next Phase**: [Phase 4 - Frontend Integration & Webhooks](./phase-04-frontend-integration-webhooks.md)
- **Brainstorm Source**: [Brainstorm Report](../reports/brainstorm-2025-12-29-nestjs-backend-songs-images.md)

---

## Overview

Build separate Next.js admin dashboard using shadcn/ui components. Enables non-technical users to manage songs and images with presigned URL file uploads, data tables, and webhook rebuild triggers.

**Goal**: Production-ready admin dashboard deployed on Vercel with Supabase Auth.

---

## Key Insights from Brainstorm

### Template Choice

**Recommended**: [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)

- Next.js 15+ App Router
- React 19 (matches existing stack)
- shadcn/ui components pre-built
- TypeScript + Tailwind CSS
- Auth scaffolding (swap Clerk with Supabase)
- Data tables, forms, charts included

### Design Requirements

- Match Love Days theme (350 hue rose pink)
- Mobile-responsive dashboard
- File upload with progress bar
- Audio preview player
- Image preview lightbox
- "Rebuild Site" webhook button

---

## Requirements

### Functional

- [ ] Supabase Auth (email/password login)
- [ ] Songs management page (CRUD, publish, preview)
- [ ] Images management page (CRUD, category filter)
- [ ] Presigned URL file upload with progress
- [ ] Audio preview player component
- [ ] Image preview lightbox
- [ ] "Rebuild Site" button (Cloudflare webhook)
- [ ] Toast notifications for feedback

### Non-Functional

- [ ] Theme matches Love Days (350 hue rose pink)
- [ ] Mobile-responsive (sm/md/lg breakpoints)
- [ ] Load time <2s
- [ ] Type-safe API integration

---

## Architecture

### Folder Structure (apps/admin/)

```
apps/admin/
├── app/
│   ├── layout.tsx                    # Root layout with auth provider
│   ├── page.tsx                      # Redirect to /dashboard or /login
│   ├── login/
│   │   └── page.tsx                  # Supabase Auth login
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Overview/stats page
│   │   ├── songs/
│   │   │   ├── page.tsx              # Songs list (data table)
│   │   │   ├── new/page.tsx          # Create song form
│   │   │   └── [id]/page.tsx         # Edit song form
│   │   ├── images/
│   │   │   ├── page.tsx              # Images gallery/list
│   │   │   ├── new/page.tsx          # Upload image
│   │   │   └── [id]/page.tsx         # Edit image
│   │   └── settings/
│   │       └── page.tsx              # Rebuild site button
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── auth/
│   │   ├── auth-provider.tsx         # Supabase auth context
│   │   └── protected-route.tsx       # Auth guard wrapper
│   ├── dashboard/
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   └── header.tsx                # Top header with user menu
│   ├── songs/
│   │   ├── songs-table.tsx           # Data table
│   │   ├── song-form.tsx             # Create/edit form
│   │   └── audio-preview.tsx         # Audio player preview
│   ├── images/
│   │   ├── images-grid.tsx           # Image gallery grid
│   │   ├── image-form.tsx            # Upload/edit form
│   │   └── image-lightbox.tsx        # Preview lightbox
│   └── upload/
│       ├── file-upload.tsx           # Presigned URL upload
│       └── progress-bar.tsx          # Upload progress
├── lib/
│   ├── api.ts                        # API client (typed fetch)
│   ├── supabase.ts                   # Supabase client
│   └── utils.ts                      # Utility functions
├── hooks/
│   ├── use-auth.ts                   # Auth state hook
│   └── use-upload.ts                 # File upload hook
├── styles/
│   └── globals.css                   # Global styles + theme vars
├── types/
│   └── index.ts                      # Re-export from @love-days/types
├── .env.local                        # Environment variables
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Related Code Files

### Files to Create

| File                            | Purpose                  |
| ------------------------------- | ------------------------ |
| `apps/admin/`                   | Entire admin application |
| `apps/admin/lib/api.ts`         | Type-safe API client     |
| `apps/admin/components/auth/`   | Supabase auth components |
| `apps/admin/components/upload/` | File upload components   |

### Files to Reference

| File                           | Purpose                      |
| ------------------------------ | ---------------------------- |
| `apps/web/styles/globals.scss` | Theme CSS variables to copy  |
| `apps/web/tailwind.config.ts`  | Tailwind theme to match      |
| `packages/types/`              | Shared TypeScript interfaces |

---

## Implementation Steps

### Step 1: Fork and Set Up Admin App

**Duration**: 45 min

1. Create admin app from template:

```bash
cd apps
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir=false
cd admin
```

2. Install dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-table
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-slot @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @love-days/types@file:../../packages/types

npm install -D @types/node
```

3. Add shadcn/ui:

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu input
npx shadcn@latest add label select table toast badge switch
npx shadcn@latest add form textarea progress alert sheet
```

---

### Step 2: Configure Theme (Love Days 350 Hue)

**Duration**: 30 min

Update `apps/admin/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

Update `apps/admin/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Love Days 350 Hue Rose Pink Theme */
    --background: 350 30% 8%;
    --foreground: 350 20% 95%;
    --card: 350 20% 10%;
    --card-foreground: 350 20% 95%;
    --popover: 350 20% 10%;
    --popover-foreground: 350 20% 95%;
    --primary: 350 80% 65%;
    --primary-foreground: 350 20% 10%;
    --secondary: 350 15% 15%;
    --secondary-foreground: 350 20% 95%;
    --muted: 350 15% 25%;
    --muted-foreground: 350 10% 55%;
    --accent: 350 60% 60%;
    --accent-foreground: 350 20% 10%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 350 20% 95%;
    --border: 350 20% 20%;
    --input: 350 20% 20%;
    --ring: 350 80% 65%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

### Step 3: Set Up Supabase Auth

**Duration**: 45 min

Create `apps/admin/lib/supabase.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Create `apps/admin/components/auth/auth-provider.tsx`:

```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    router.push("/dashboard");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

Create `apps/admin/app/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">
            Love Days Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 4: Create API Client

**Duration**: 30 min

Create `apps/admin/lib/api.ts`:

```typescript
import { createClient } from "./supabase";
import type {
  ISong,
  IImage,
  CreateSongDto,
  CreateImageDto,
  UpdateSongDto,
  UpdateImageDto,
} from "@love-days/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(data.session
      ? { Authorization: `Bearer ${data.session.access_token}` }
      : {}),
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Songs API
export const songsApi = {
  list: (published?: boolean) =>
    fetchApi<ISong[]>(`/api/v1/songs?published=${published ?? ""}`),

  get: (id: string) => fetchApi<ISong>(`/api/v1/songs/${id}`),

  create: (data: CreateSongDto) =>
    fetchApi<ISong>("/api/v1/songs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSongDto) =>
    fetchApi<ISong>(`/api/v1/songs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/songs/${id}`, { method: "DELETE" }),

  publish: (id: string, published: boolean) =>
    fetchApi<ISong>(`/api/v1/songs/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ published }),
    }),

  getUploadUrl: (fileName: string, fileType: string, fileSize?: number) =>
    fetchApi<{ uploadUrl: string; filePath: string }>(
      "/api/v1/songs/upload-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      },
    ),
};

// Images API
export const imagesApi = {
  list: (category?: string) =>
    fetchApi<IImage[]>(`/api/v1/images?category=${category ?? ""}`),

  get: (id: string) => fetchApi<IImage>(`/api/v1/images/${id}`),

  create: (data: CreateImageDto) =>
    fetchApi<IImage>("/api/v1/images", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateImageDto) =>
    fetchApi<IImage>(`/api/v1/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/v1/images/${id}`, { method: "DELETE" }),

  getUploadUrl: (fileName: string, fileType: string, fileSize?: number) =>
    fetchApi<{ uploadUrl: string; filePath: string }>(
      "/api/v1/images/upload-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName, fileType, fileSize }),
      },
    ),
};
```

---

### Step 5: Create File Upload Component

**Duration**: 45 min

Create `apps/admin/hooks/use-upload.ts`:

```typescript
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
      } catch (err: any) {
        const message = err.message || "Upload failed";
        setError(message);
        onError?.(err);
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
```

Create `apps/admin/components/upload/file-upload.tsx`:

```typescript
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
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
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onComplete]
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
          uploading && "pointer-events-none opacity-50"
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
```

Install dropzone:

```bash
npm install react-dropzone
```

---

### Step 6: Create Songs Data Table

**Duration**: 45 min

Create `apps/admin/components/songs/songs-table.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Play, Pause } from "lucide-react";
import { ISong } from "@love-days/types";
import { songsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SongsTableProps {
  songs: ISong[];
  onRefresh: () => void;
}

export function SongsTable({ songs, onRefresh }: SongsTableProps) {
  const router = useRouter();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePublish = async (id: string, published: boolean) => {
    try {
      await songsApi.publish(id, published);
      toast.success(published ? "Song published" : "Song unpublished");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;

    try {
      await songsApi.delete(id);
      toast.success("Song deleted");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePlay = (song: ISong) => {
    if (playingId === song.id) {
      audio?.pause();
      setPlayingId(null);
      setAudio(null);
    } else {
      audio?.pause();
      const newAudio = new Audio(song.fileUrl);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudio(newAudio);
      setPlayingId(song.id);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Album</TableHead>
            <TableHead className="text-center">Published</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePlay(song)}
                >
                  {playingId === song.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>{song.artist}</TableCell>
              <TableCell>{song.album || "-"}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={song.published}
                  onCheckedChange={(checked) => handlePublish(song.id, checked)}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/songs/${song.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(song.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {songs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No songs yet. Upload your first song!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### Step 7: Create Song Form

**Duration**: 45 min

Create `apps/admin/components/songs/song-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { songsApi } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";

interface SongFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    filePath: string;
  };
}

export function SongForm({ mode, initialData }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [album, setAlbum] = useState(initialData?.album || "");
  const [filePath, setFilePath] = useState(initialData?.filePath || "");
  const [submitting, setSubmitting] = useState(false);

  const { upload, uploading, progress } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      songsApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => setFilePath(path),
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !filePath) {
      toast.error("Please upload an audio file");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await songsApi.create({ title, artist, album, filePath });
        toast.success("Song created successfully");
      } else {
        await songsApi.update(initialData!.id, { title, artist, album });
        toast.success("Song updated successfully");
      }
      router.push("/songs");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Upload New Song" : "Edit Song"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "create" && (
            <div className="space-y-2">
              <Label>Audio File</Label>
              <FileUpload
                accept={{ "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] }}
                maxSize={50 * 1024 * 1024}
                onUpload={upload}
                onComplete={(path) => setFilePath(path)}
              />
              {filePath && (
                <p className="text-sm text-muted-foreground">
                  Uploaded: {filePath}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="album">Album (optional)</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? "Saving..." : mode === "create" ? "Create Song" : "Update Song"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
```

---

### Step 8: Create Settings Page with Rebuild Button

**Duration**: 30 min

Create `apps/admin/app/(dashboard)/settings/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your site settings
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
    </div>
  );
}
```

---

### Step 9: Create Dashboard Layout

**Duration**: 30 min

Create `apps/admin/app/(dashboard)/layout.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Create `apps/admin/components/dashboard/sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart, Music, Image, Settings, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/images", label: "Images", icon: Image },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold">Love Days</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

### Step 10: Environment Variables

**Duration**: 10 min

Create `apps/admin/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://love-days-api.vercel.app
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx
```

---

### Step 11: Deploy to Vercel

**Duration**: 20 min

```bash
cd apps/admin
npx vercel
# Configure environment variables in Vercel dashboard
npx vercel --prod
```

---

## Todo List

### Setup

- [ ] Create admin app from template
- [ ] Install all dependencies
- [ ] Configure shadcn/ui components
- [ ] Set up theme (350 hue rose pink)

### Authentication

- [ ] Configure Supabase client
- [ ] Create auth provider
- [ ] Build login page
- [ ] Implement protected routes

### Core Features

- [ ] Create API client (typed fetch)
- [ ] Build file upload component with progress
- [ ] Create songs data table
- [ ] Build song form (create/edit)
- [ ] Create images grid/gallery
- [ ] Build image form

### Settings

- [ ] Create settings page
- [ ] Implement rebuild site button
- [ ] Add Cloudflare webhook integration

### Layout

- [ ] Create dashboard sidebar
- [ ] Create header with user menu
- [ ] Implement responsive design

### Deployment

- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test all functionality

---

## Success Criteria

1. **Auth Working**: Login/logout with Supabase Auth
2. **CRUD Operations**: Can create, read, update, delete songs/images
3. **File Upload**: 50MB audio uploads with progress bar
4. **Publish Toggle**: Can publish/unpublish content
5. **Rebuild Button**: Triggers Cloudflare webhook
6. **Theme Match**: UI matches Love Days rose pink theme
7. **Mobile Responsive**: Works on tablet/mobile

---

## Risk Assessment

| Risk                         | Impact | Mitigation                            |
| ---------------------------- | ------ | ------------------------------------- |
| Auth state persistence       | Medium | Use Supabase SSR helpers              |
| Upload progress not updating | Low    | Use XHR instead of fetch for progress |
| Cloudflare webhook fails     | Medium | Show error toast, manual retry        |
| Theme mismatch               | Low    | Copy CSS variables from web app       |

---

## Security Considerations

1. **Auth Required**: All dashboard routes protected
2. **JWT in API Calls**: Auth header automatically added
3. **Webhook URL**: Store in env vars, never expose
4. **Supabase Keys**: Only use anon key in client
5. **Session Refresh**: Supabase handles token refresh

---

## Next Steps

After Phase 3 complete:

1. Proceed to [Phase 4 - Frontend Integration & Webhooks](./phase-04-frontend-integration-webhooks.md)
2. Update frontend to fetch from API
3. Test end-to-end workflow

---

## Unresolved Questions

1. **Image Lightbox**: Use existing solution or build custom?

   - Recommendation: Use `react-photo-view` or similar library

2. **Audio Duration**: Extract on client or display from API?

   - Recommendation: Client-side extraction using AudioContext

3. **Bulk Actions**: Support bulk delete/publish?
   - Recommendation: Skip for MVP (YAGNI), add later if needed
