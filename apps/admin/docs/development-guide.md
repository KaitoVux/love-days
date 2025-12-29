# Development Guide

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Target Audience:** Developers working on Love Days Admin Portal

## Quick Start

### Prerequisites

- Node.js 20+ (required for TypeScript strict mode)
- npm 10+
- Supabase account with project
- Git access to repository

### Initial Setup

**1. Clone Repository and Install Dependencies**

```bash
# From monorepo root
npm install

# Or from apps/admin directory
cd apps/admin
npm install
```

**2. Configure Environment Variables**

```bash
# Copy environment template
cp .env.example .env.local
```

**3. Add Supabase Credentials**

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api.love-days.com  # Or local dev URL
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=      # Optional
```

**4. Start Development Server**

```bash
npm run dev
```

Visit `http://localhost:3001`

## Development Workflow

### Daily Development Cycle

**1. Start Development Server**

```bash
npm run dev
```

Server runs on port 3001 with Turbopack for fast rebuilds.

**2. Make Changes**

- Edit component files in `components/`
- Update utilities in `lib/`
- Add hooks in `hooks/`
- Create new pages in `app/`

**3. Type Check**

```bash
npm run type-check
```

Catches TypeScript errors before runtime.

**4. Lint Code**

```bash
npm run lint
```

Identifies ESLint violations.

**5. Format Code**

```bash
npm run format
```

Auto-formats code with Prettier.

**6. Commit Changes**

```bash
git add .
git commit -m "feat: description of changes"
```

Pre-commit hooks run lint and format automatically.

### Component Development Pattern

**1. Create Component File**

```typescript
// components/songs/songs-table.tsx
"use client";

import { useState } from "react";
import type { SongResponseDto } from "@love-days/types";
import { Button } from "@/components/ui/button";

export interface SongsTableProps {
  songs: SongResponseDto[];
  onRefresh: () => void;
}

export function SongsTable({ songs, onRefresh }: SongsTableProps) {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // Implementation
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**2. Use in Page**

```typescript
// app/(dashboard)/songs/page.tsx
import { SongsTable } from "@/components/songs/songs-table";
import { songsApi } from "@/lib/api";

export default async function SongsPage() {
  const songs = await songsApi.list();

  return (
    <div>
      <h1>Songs</h1>
      <SongsTable songs={songs} onRefresh={async () => {}} />
    </div>
  );
}
```

### Form Development Pattern

**1. Create Form Component**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { songsApi } from "@/lib/api";
import { toast } from "sonner";

export function SongForm({ mode, initialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "create") {
        await songsApi.create({ title });
        toast.success("Created");
      } else {
        await songsApi.update(initialData.id, { title });
        toast.success("Updated");
      }
      router.push("/songs");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
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

## Code Organization

### File Structure Rules

**Components Directory:**

- Group by feature: `songs/`, `images/`, `ui/`
- One component per file
- Related components in same directory
- Utilities in `lib/` directory

**Naming Convention:**

- Components: PascalCase (`SongsTable.tsx`)
- Utilities: camelCase (`api.ts`, `useUpload.ts`)
- Routes: kebab-case or [brackets] (`songs`, `[id]`)

**Import Organization:**

```typescript
// 1. External imports
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Internal components
import { SongsTable } from "@/components/songs/songs-table";

// 3. Types
import type { SongResponseDto } from "@love-days/types";

// 4. Utilities
import { songsApi } from "@/lib/api";
import { toast } from "sonner";
```

## Working with Components

### Creating UI Components

Use shadcn/ui components as base:

```bash
# Components are already installed in components/ui/
# Don't install new ones unless required
```

Adding new UI component:

```bash
# From admin directory
npx shadcn-ui@latest add component-name
```

### Creating Feature Components

Follow this template:

```typescript
"use client";

import { useState } from "react";
import type { Props } from "@love-days/types";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface ComponentNameProps {
  data: Props[];
  onRefresh: () => void;
}

export function ComponentName({ data, onRefresh }: ComponentNameProps) {
  const [state, setState] = useState(false);

  const handleAction = async (id: string) => {
    try {
      await api.action(id);
      toast.success("Action completed");
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    }
  };

  return (
    <div>
      {/* Implementation */}
    </div>
  );
}
```

## Working with Forms

### Form Input Pattern

```typescript
const [value, setValue] = useState("");

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Placeholder text"
  required
/>
```

### Form Validation Pattern

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) {
    toast.error("Title is required");
    return;
  }

  // Submit...
};
```

### Loading States Pattern

```typescript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    await api.action();
    toast.success("Done");
  } finally {
    setSubmitting(false);
  }
};

<Button disabled={submitting}>
  {submitting ? "Loading..." : "Submit"}
</Button>
```

## Working with API

### Using the API Client

All API calls through centralized client:

```typescript
import { songsApi, imagesApi } from "@/lib/api";

// List
const songs = await songsApi.list();
const published = await songsApi.list(true);

// Get
const song = await songsApi.get(id);

// Create
const newSong = await songsApi.create({
  title: "Title",
  artist: "Artist",
  album: "Album",
  filePath: "path/to/file",
});

// Update
await songsApi.update(id, { title: "New Title" });

// Delete
await songsApi.delete(id);

// Publish
await songsApi.publish(id, true);

// Upload URL
const { uploadUrl, filePath } = await songsApi.getUploadUrl(
  fileName,
  fileType,
  fileSize,
);
```

### Error Handling Pattern

```typescript
try {
  const result = await api.action(data);
  toast.success("Success");
  return result;
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "An error occurred";
  toast.error(message);
  throw error; // Re-throw if needed
}
```

## Working with File Uploads

### Upload Component Pattern

```typescript
import { FileUpload } from "@/components/upload/file-upload";
import { useUpload } from "@/hooks/use-upload";
import { songsApi } from "@/lib/api";

export function UploadExample() {
  const [filePath, setFilePath] = useState("");

  const { upload, uploading } = useUpload({
    getUploadUrl: (fileName, fileType, fileSize) =>
      songsApi.getUploadUrl(fileName, fileType, fileSize),
    onSuccess: (path) => {
      setFilePath(path);
      toast.success("Upload complete");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <FileUpload
      accept={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
      maxSize={50 * 1024 * 1024}  // 50MB
      onUpload={upload}
      onComplete={(path) => setFilePath(path)}
    />
  );
}
```

## Styling with Tailwind

### Class Naming

```typescript
// ✅ Correct
className="flex gap-4 p-4 rounded-lg bg-card"
className="text-sm text-muted-foreground"

// ❌ Avoid
className="flex" className="gap-4"  // Should be single className
className="w-1/2 h-full"  // Use layout components instead
```

### Using Custom Theme

```typescript
// Rose pink theme colors
className = "text-primary"; // Rose pink accent
className = "bg-card"; // Card background
className = "text-muted-foreground"; // Muted text
className = "border-border"; // Border color
```

### Responsive Classes

```typescript
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
className = "text-sm md:text-base lg:text-lg";
className = "p-4 md:p-6 lg:p-8";
```

## Testing Workflow

### Manual Testing Checklist

Before committing:

- [ ] Component renders without errors
- [ ] All inputs work
- [ ] Form submission works
- [ ] Error messages display
- [ ] Loading states show
- [ ] Responsive design works (desktop, tablet, mobile)
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Running Type Checks

```bash
npm run type-check
```

### Running Linter

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Running Tests (When Available)

```bash
npm test
npm test -- --watch
npm test -- --coverage
```

## Debugging

### Browser DevTools

**1. React DevTools**

- Inspect component props and state
- Trace re-renders
- Check component hierarchy

**2. Network Tab**

- Monitor API calls
- Check request/response headers
- Verify status codes

**3. Console Tab**

- View error messages
- Check logs
- Test API calls manually

### Server Logs

```bash
# Dev server logs appear in terminal
# Watch for compilation errors and warnings
npm run dev
```

### Common Debugging Patterns

**Check API Call:**

```typescript
console.log("Before API call");
const result = await songsApi.list();
console.log("After API call:", result);
```

**Check State Updates:**

```typescript
const [state, setState] = useState(initialValue);
console.log("State before:", state);
// In handler
setState(newValue);
console.log("State after:", newValue);
```

**Check Props:**

```typescript
export function Component({ prop1, prop2 }: ComponentProps) {
  console.log("Props:", { prop1, prop2 });
  return /* JSX */;
}
```

## Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/description-of-change
```

### Commit Changes

```bash
git add .
git commit -m "feat: description of what was added"
git commit -m "fix: description of bug fix"
git commit -m "refactor: description of refactoring"
```

### Push to Remote

```bash
git push -u origin feature/description-of-change
```

### Create Pull Request

- Go to GitHub/GitLab
- Create PR against `master` branch
- Add description of changes
- Request code review

### Merge After Review

```bash
# After approval
git checkout master
git pull origin master
git merge feature/description-of-change
git push origin master
```

## Environment Configuration

### Development (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3000  # Local backend
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=   # Skip if testing
```

### Production (.env.production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=https://api.love-days.com  # Production API
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=https://...
```

## Build & Deployment

### Local Build

```bash
npm run build
```

Outputs to `.next/` directory.

### Production Build

```bash
npm run build
npm run start
```

Starts production server on port 3001.

### Deployment Checklist

- [ ] All tests pass
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] Supabase credentials valid
- [ ] No console errors/warnings

## Performance Optimization

### Code Splitting

Next.js automatically splits code by route. No action needed.

### Image Optimization

```typescript
// ❌ Avoid
<img src={imageUrl} alt="description" />

// ✅ Use
<img
  src={imageUrl}
  alt="description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Component Optimization

```typescript
// Avoid rendering large lists without pagination
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(function Expensive() {
  return /* JSX */;
});
```

## Security Best Practices

### Never Hardcode Secrets

```typescript
// ❌ Wrong
const API_KEY = "sk_live_123456789";

// ✅ Correct
const API_KEY = process.env.NEXT_PUBLIC_API_URL;
```

### Validate Input

```typescript
// ❌ Wrong
<Input value={input} onChange={(e) => setInput(e.target.value)} />

// ✅ Correct
<Input
  value={title}
  onChange={(e) => setTitle(e.target.value.trim())}
  maxLength={255}
  required
/>
```

### Handle Errors Safely

```typescript
// ❌ Wrong
try {
  await api.action();
} catch (error) {
  console.error(error); // Logs may contain sensitive data
}

// ✅ Correct
try {
  await api.action();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Error";
  toast.error(message);
}
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
npm run dev -- -p 3002
```

### Node Modules Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### Build Fails

```bash
# Clean build
npm run clean
npm run build
```

### Type Errors

```bash
# Check all type errors
npm run type-check

# Watch for changes
npm run type-check -- --watch
```

### Lint Errors

```bash
# See all errors
npm run lint

# Auto-fix what's possible
npm run lint:fix
```

## Resources

### Documentation

- Project Overview: `/docs/project-overview-pdr.md`
- Code Standards: `/docs/code-standards.md`
- System Architecture: `/docs/system-architecture.md`
- API Reference: `/docs/api-reference.md`
- Codebase Summary: `/docs/codebase-summary.md`

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### Team Communication

- Code reviews: Merge requests required
- Questions: Team Slack/Discord
- Bugs: GitHub Issues
- Documentation: Update docs/ when making changes

---

**Last Updated:** 2025-12-29
**Version:** 1.0.0
**Next Review:** 2026-01-15
