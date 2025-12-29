# Code Standards & Codebase Structure

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Status:** Enforced across Phase 03

## Codebase Overview

The Love Days Admin Portal follows a modular, component-based architecture with clear separation of concerns. All code adheres to strict TypeScript, follows established naming conventions, and maintains consistent formatting standards.

**Total Files:** 49
**Total Tokens:** 25,441
**Primary Language:** TypeScript
**Build Tool:** Next.js 15 with Turbopack

## Project Structure

### Root Level Configuration

```
apps/admin/
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript strict mode
├── tailwind.config.ts      # Tailwind CSS theme
├── postcss.config.js       # PostCSS processing
├── .eslintrc.json          # ESLint rules
├── .prettierrc              # Prettier formatting
├── middleware.ts           # Auth middleware
├── package.json            # Dependencies
├── .env.example            # Environment template
└── README.md               # Quick start guide
```

### Directory Structure

#### `app/` - Next.js App Router

```
app/
├── (dashboard)/              # Protected routes with layout
│   ├── layout.tsx           # Dashboard layout with sidebar
│   ├── dashboard/           # Home page
│   │   └── page.tsx
│   ├── songs/               # Song CRUD routes
│   │   ├── page.tsx         # List songs
│   │   ├── new/page.tsx     # Create song
│   │   └── [id]/page.tsx    # Edit song
│   ├── images/              # Image CRUD routes
│   │   ├── page.tsx         # List images
│   │   ├── new/page.tsx     # Create image
│   │   └── [id]/page.tsx    # Edit image
│   └── settings/page.tsx    # Settings page
├── login/
│   └── page.tsx             # Login page
├── layout.tsx               # Root layout
├── page.tsx                 # Root redirect
└── globals.css              # Global styles
```

**Route Organization:**

- Root level: `page.tsx` only - routes to login or dashboard
- Login: Public page without layout
- Dashboard: Protected routes with persistent sidebar
- Resources: Nested under `/songs` and `/images` for RESTful structure

#### `components/` - React Components

```
components/
├── auth/                    # Authentication components
│   ├── logout-button.tsx
│   └── [other auth components]
├── dashboard/               # Dashboard-specific components
│   ├── sidebar.tsx         # Main sidebar navigation
│   └── [other dashboard components]
├── ui/                      # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── input.tsx
│   ├── table.tsx
│   ├── card.tsx
│   ├── switch.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── alert.tsx
│   ├── badge.tsx
│   └── [other UI components]
├── songs/                   # Song management components
│   ├── songs-table.tsx     # Songs list with actions
│   └── song-form.tsx       # Create/edit form
├── images/                  # Image management components
│   ├── images-grid.tsx     # Image grid display
│   ├── image-form.tsx      # Create/edit form
│   └── image-lightbox.tsx  # Full-screen preview
└── upload/                  # File upload components
    └── file-upload.tsx     # Dropzone upload widget
```

**Component Categories:**

- **UI Components:** Reusable Radix UI primitives (button, input, table, etc.)
- **Feature Components:** Domain-specific (songs, images, upload)
- **Layout Components:** Page structure (sidebar, dashboard layout)
- **Auth Components:** Authentication-related (logout button)

#### `lib/` - Utilities & Clients

```
lib/
├── supabase.ts             # Supabase client initialization
├── api.ts                  # Centralized API client
├── toast.ts                # Toast notification utilities
└── utils.ts                # General utilities
```

**Purpose:**

- `supabase.ts`: Creates Supabase SSR client for auth context
- `api.ts`: Typed API endpoints with error handling
- `toast.ts`: Toast notification helper functions
- `utils.ts`: Date formatting, string utilities, etc.

#### `hooks/` - Custom React Hooks

```
hooks/
└── use-upload.ts           # File upload management hook
```

**Purpose:**

- Encapsulate complex state and side effects
- Reusable logic across components
- Clear dependency management

### File Naming Conventions

**Strict Case Rules:**

| File Type        | Convention               | Example                                 |
| ---------------- | ------------------------ | --------------------------------------- |
| React Components | PascalCase               | `SongsTable.tsx`, `SongForm.tsx`        |
| Utilities/Hooks  | camelCase                | `useUpload.ts`, `api.ts`, `supabase.ts` |
| Routes (files)   | kebab-case or [brackets] | `[id]`, `new`, `page.tsx`               |
| Directories      | kebab-case or lowercase  | `components/`, `songs/`, `ui/`          |
| CSS Files        | kebab-case               | `globals.css`                           |

**Critical:** Never mix naming conventions. A single project violation breaks consistency.

## Naming Standards

### TypeScript/React Naming

**Components:**

```typescript
// ✅ Correct
export function SongsTable() {}
export function SongForm({ mode }: SongFormProps) {}
export function ImageLightbox() {}

// ❌ Incorrect
export function SongsTable_Item() {} // Use proper separation
export function songForm() {} // Component is not camelCase
```

**Props Interfaces:**

```typescript
// ✅ Correct
interface SongsTableProps {
  songs: SongResponseDto[];
  onRefresh: () => void;
}

interface SongFormProps {
  mode: "create" | "edit";
  initialData?: Song;
}

// ❌ Incorrect
interface Props {
  songs: any;
}

interface SongsTablePropsType {
  songs: SongResponseDto[];
}
```

**State Variables:**

```typescript
// ✅ Correct
const [playingId, setPlayingId] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);
const [lightboxImage, setLightboxImage] = useState<ImageResponseDto | null>(
  null,
);

// ❌ Incorrect
const [isPlaying, setIsPlaying] = useState(false); // Too vague
const [loading, setLoading] = useState(false); // Too generic
```

**Event Handlers:**

```typescript
// ✅ Correct
const handlePublish = async (id: string, published: boolean) => {};
const handleDelete = async (id: string) => {};
const togglePlay = (song: SongResponseDto) => {};

// ❌ Incorrect
const onPublish = (id: string) => {}; // Use 'handle' for handlers
const publishSong = (id: string) => {}; // Too specific for generic handler
```

**API Functions:**

```typescript
// ✅ Correct (in lib/api.ts)
export const songsApi = {
  list: () => {},
  get: (id: string) => {},
  create: (data: CreateSongDto) => {},
  update: (id: string, data) => {},
  delete: (id: string) => {},
  publish: (id: string, published: boolean) => {},
  getUploadUrl: (fileName, fileType) => {},
};

// ❌ Incorrect
export const getSongs = () => {};
export async function createSong() {}
```

## TypeScript Standards

### Strict Mode Enforcement

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type Definitions

**Always Import from @love-days/types:**

```typescript
// ✅ Correct
import type {
  SongResponseDto,
  ImageResponseDto,
  CreateSongDto,
  UpdateSongDto,
} from "@love-days/types";

// ❌ Incorrect
interface Song {
  id: string;
  title: string;
}

type Image = {
  id: string;
  title: string;
};
```

**Props with Union Types:**

```typescript
// ✅ Correct
interface SongFormProps {
  mode: "create" | "edit";
  initialData?: SongResponseDto;
}

// ❌ Incorrect
interface SongFormProps {
  mode: string; // Too vague
  initialData: any; // Avoid any
}
```

**Async Function Returns:**

```typescript
// ✅ Correct
async function fetchSongs(): Promise<SongResponseDto[]> {
  return songsApi.list();
}

// ❌ Incorrect
async function fetchSongs() {
  // Missing return type
  return songsApi.list();
}
```

**Error Handling:**

```typescript
// ✅ Correct
try {
  await songsApi.delete(id);
  toast.success("Song deleted");
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to delete";
  toast.error(message);
}

// ❌ Incorrect
try {
  await songsApi.delete(id);
} catch (error) {
  console.log(error); // No error handling
}
```

## Component Standards

### Client vs Server Components

```typescript
// ✅ Client Components (interactive features)
"use client";

import { useState } from "react";

export function SongsTable({ songs }: SongsTableProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  // Interactive state, event handlers...
}

// ✅ Server Components (data fetching, layouts)
import { SongsTable } from "@/components/songs/songs-table";

export default async function SongsPage() {
  const songs = await songsApi.list();
  return <SongsTable songs={songs} onRefresh={() => {}} />;
}

// ❌ Incorrect (mixing patterns)
export function Component() {
  // No "use client" but using hooks - will error
  const [state, setState] = useState();
}
```

### Component Props Structure

```typescript
// ✅ Correct - props destructured with interface
interface ImagesGridProps {
  images: ImageResponseDto[];
  onRefresh: () => void;
}

export function ImagesGrid({ images, onRefresh }: ImagesGridProps) {
  // Implementation
}

// ❌ Incorrect - props passed as object
export function ImagesGrid(props: ImagesGridProps) {
  const { images, onRefresh } = props; // Extra step
}

// ❌ Incorrect - missing interface
export function ImagesGrid({ images, onRefresh }: any) {
  // Missing type safety
}
```

### Component Export Pattern

```typescript
// ✅ Correct - named export with interface
export interface SongFormProps {
  mode: "create" | "edit";
  initialData?: SongResponseDto;
}

export function SongForm({ mode, initialData }: SongFormProps) {
  // Implementation
}

// ❌ Incorrect - default export
export default function SongForm() {
  // Harder to refactor and organize
}
```

## API Client Standards

### Centralized API Client Pattern

All API calls must go through `lib/api.ts`:

```typescript
// ✅ Correct - Using API client
import { songsApi } from "@/lib/api";

export function SongsTable({ songs }: SongsTableProps) {
  const handleDelete = async (id: string) => {
    await songsApi.delete(id);
  };
}

// ❌ Incorrect - Direct fetch
export function SongsTable({ songs }: SongsTableProps) {
  const handleDelete = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/songs/${id}`, {
      method: "DELETE",
    });
  };
}
```

### Error Handling in API

```typescript
// ✅ Correct - Typed errors with fallback
try {
  await songsApi.create(data);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  toast.error(message);
}

// ❌ Incorrect - Untyped error
try {
  await songsApi.create(data);
} catch (error) {
  toast.error(error); // Error might not be Error type
}
```

### API Response Types

Always use types from `@love-days/types`:

```typescript
// ✅ Correct
import type { SongResponseDto } from "@love-days/types";

const data: SongResponseDto = await songsApi.get(id);

// ❌ Incorrect
const data = await songsApi.get(id); // No type inference
```

## State Management Standards

### React Hooks Pattern

```typescript
// ✅ Correct - Descriptive state
const [playingId, setPlayingId] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);
const [lightboxImage, setLightboxImage] = useState<ImageResponseDto | null>(
  null,
);

// ❌ Incorrect - Vague state
const [state, setState] = useState(null);
const [data, setData] = useState({});
```

### Custom Hook Pattern

```typescript
// ✅ Correct - Encapsulated logic
export function useUpload({
  getUploadUrl,
  onSuccess,
  onError,
}: UseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File) => {
    // Implementation
  };

  return { upload, uploading, progress };
}

// Usage
const { upload, uploading } = useUpload({
  getUploadUrl: songsApi.getUploadUrl,
  onSuccess: (path) => setFilePath(path),
});
```

## Form Standards

### Form Component Pattern

```typescript
// ✅ Correct - Controlled inputs with state
export function SongForm({ mode, initialData }: SongFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "create") {
        await songsApi.create({ title, artist });
      } else {
        await songsApi.update(initialData!.id, { title, artist });
      }
      toast.success("Saved");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
```

## Code Formatting & Style

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "printWidth": 100
}
```

### ESLint Rules

- Next.js core-web-vitals
- TypeScript recommended
- Unused imports plugin
- Prettier integration

### Formatting Commands

```bash
npm run format          # Format all files
npm run format:check   # Check formatting
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix issues
```

## Import Organization

### Correct Import Order

```typescript
// 1. External dependencies
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// 2. Internal components
import { SongsTable } from "@/components/songs/songs-table";

// 3. Types
import type { SongResponseDto } from "@love-days/types";

// 4. Utilities
import { songsApi } from "@/lib/api";
import { toast } from "sonner";
```

**Rules:**

- No empty lines between external and internal imports
- Group related imports
- External before internal
- Types with `import type`

## Component Structure Template

```typescript
// ✅ Correct structure
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SongResponseDto } from "@love-days/types";
import { Button } from "@/components/ui/button";
import { songsApi } from "@/lib/api";
import { toast } from "sonner";

// 1. Props interface
export interface SongsTableProps {
  songs: SongResponseDto[];
  onRefresh: () => void;
}

// 2. Component definition
export function SongsTable({ songs, onRefresh }: SongsTableProps) {
  // 3. State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const router = useRouter();

  // 4. Event handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      await songsApi.delete(id);
      toast.success("Deleted");
      onRefresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error");
    }
  };

  // 5. Effects (if needed)
  // useEffect(() => { }, [])

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Testing Standards

### Test File Organization

```typescript
// location: components/songs/__tests__/songs-table.test.tsx

import { render, screen } from "@testing-library/react";
import { SongsTable } from "../songs-table";
import type { SongResponseDto } from "@love-days/types";

describe("SongsTable", () => {
  it("renders song list", () => {
    const songs: SongResponseDto[] = [
      { id: "1", title: "Test", artist: "Artist", fileUrl: "", published: false },
    ];

    render(<SongsTable songs={songs} onRefresh={() => {}} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

## Security Standards

### No Hardcoded Secrets

```typescript
// ❌ Incorrect - Hardcoded API URL
const API_URL = "https://api.example.com";

// ✅ Correct - Environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

### Secure Auth Handling

```typescript
// ✅ Correct - Bearer token from session
async function getAuthHeaders() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return {
    ...(data.session
      ? { Authorization: `Bearer ${data.session.access_token}` }
      : {}),
  };
}

// ❌ Incorrect - Storing token in localStorage
localStorage.setItem("token", session.access_token);
```

## Performance Standards

### Image Optimization

```typescript
// ✅ Correct - Use Next.js Image
import Image from "next/image";

<Image src={imageUrl} alt="description" width={300} height={200} />

// ❌ Incorrect - Plain img tag (no optimization)
<img src={imageUrl} alt="description" />
```

### Lazy Loading Lists

```typescript
// ✅ Correct - Show empty state
{songs.length === 0 && (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      No songs yet.
    </TableCell>
  </TableRow>
)}

// ❌ Incorrect - Render nothing without feedback
{songs.length === 0 && null}
```

## Common Patterns

### CRUD Create Pattern

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    const result = await songsApi.create({
      title,
      artist,
      album,
      filePath,
    });
    toast.success("Created");
    router.push("/songs");
    router.refresh();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : "Failed");
  } finally {
    setSubmitting(false);
  }
};
```

### CRUD Update Pattern

```typescript
const handleUpdate = async () => {
  setSubmitting(true);
  try {
    await songsApi.update(id, {
      title,
      artist,
      album,
    });
    toast.success("Updated");
    router.push("/songs");
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : "Failed");
  } finally {
    setSubmitting(false);
  }
};
```

### CRUD Delete Pattern

```typescript
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure?")) return;

  try {
    await songsApi.delete(id);
    toast.success("Deleted");
    onRefresh();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : "Failed");
  }
};
```

### Toggle Pattern

```typescript
const handlePublish = async (id: string, published: boolean) => {
  try {
    await songsApi.publish(id, published);
    toast.success(published ? "Published" : "Unpublished");
    onRefresh();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : "Failed");
  }
};
```

## Pre-commit Checklist

Before committing code:

- [ ] `npm run type-check` - All TypeScript errors resolved
- [ ] `npm run lint` - All ESLint errors fixed
- [ ] `npm run format` - All files formatted
- [ ] `npm run build` - Build succeeds without errors
- [ ] Follow all naming conventions
- [ ] Add proper TypeScript types
- [ ] Handle errors in try-catch
- [ ] Use API client for all requests

## Documentation Comments

Only add comments for complex logic:

```typescript
// ✅ Good - Explains why
// Pause existing audio before playing new track
const togglePlay = (song: SongResponseDto) => {
  audio?.pause();
  // ...
};

// ❌ Bad - Explains what (obvious from code)
// Set playing ID
setPlayingId(song.id);

// ❌ Bad - TODOs in production code
// TODO: implement this later
```

## Refactoring Guidelines

When refactoring:

1. Preserve component interfaces (no breaking changes to props)
2. Maintain naming conventions
3. Ensure TypeScript types remain strict
4. Keep tests passing
5. No new functionality in refactoring commits
6. Use feature branches for large refactors

---

**Last Updated:** 2025-12-29
**Review Frequency:** Every 2 weeks
**Enforcement:** Automated via ESLint + Prettier
