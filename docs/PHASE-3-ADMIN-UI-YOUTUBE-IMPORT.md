# Phase 3: Admin UI YouTube Import Form

**Implementation Date**: 2026-01-07
**Status**: Complete
**Scope**: Admin dashboard UI for YouTube song imports, tab switcher for dual input modes, edit mode enhancements

---

## Overview

Phase 3 implements the admin dashboard user interface for YouTube song imports, completing the YouTube integration workflow. Users can now import songs from YouTube directly through the admin panel via a dedicated import form, alongside the existing file upload functionality. The implementation features a modern tab-based interface and proper handling of YouTube-sourced songs in edit mode.

### Key Capabilities

- YouTube URL/Video ID input form with metadata auto-extraction
- Tab-based switcher: YouTube Import (default) | File Upload
- Seamless redirect to songs list upon successful import
- Edit mode detection with YouTube source badge
- Type-safe data handling with SongResponseDto interface
- Client-side validation and error handling
- User-friendly success/error messaging

---

## Implementation Files

### 1. API Client Enhancement (`apps/admin/lib/api.ts`)

**Purpose**: Extends songsApi with YouTube import endpoint

**New Method**:

```typescript
createFromYoutube: (youtubeUrl: string) =>
  fetchApi<SongResponseDto>("/api/v1/songs/youtube", {
    method: "POST",
    body: JSON.stringify({ youtubeUrl }),
  }),
```

**Details**:

| Aspect             | Value                                 |
| ------------------ | ------------------------------------- |
| **HTTP Method**    | POST                                  |
| **Endpoint**       | `/api/v1/songs/youtube`               |
| **Request Body**   | `{ youtubeUrl: string }`              |
| **Response Type**  | `SongResponseDto`                     |
| **Authentication** | Bearer token (via `getAuthHeaders()`) |

**Request Flow**:

1. Admin enters YouTube URL or video ID
2. Client calls `songsApi.createFromYoutube(url)`
3. API validates and processes YouTube metadata
4. Backend creates song record with YouTube source
5. Response returns complete `SongResponseDto` with auto-extracted metadata

**Error Handling**:

- HTTP errors caught by `fetchApi` wrapper
- Error message extracted from API response
- Fallback error message if response parsing fails

---

### 2. YouTube Import Form Component (`apps/admin/components/songs/youtube-import-form.tsx`)

**Purpose**: Standalone form for importing songs from YouTube URLs

**File Location**: `/Users/kaitovu/Desktop/Projects/love-days/apps/admin/components/songs/youtube-import-form.tsx`

**Component Interface**:

```typescript
export function YouTubeImportForm() {
  // Component implementation
}
```

**Features**:

| Feature               | Implementation                                        |
| --------------------- | ----------------------------------------------------- |
| **URL Input**         | Text input field with placeholder showing example URL |
| **Supported Formats** | Full URLs, shortened URLs, video IDs only             |
| **Submit Validation** | URL required, button disabled if empty                |
| **Loading State**     | Spinner with "Importing..." text during request       |
| **Success Feedback**  | Green alert with success message + auto-redirect      |
| **Error Handling**    | Red alert with error details                          |
| **Auto-redirect**     | Navigates to `/songs` list after 1.5s on success      |

**Supported YouTube URL Formats**:

```
https://www.youtube.com/watch?v=ID       # Standard URL
https://youtu.be/ID                       # Shortened URL
dQw4w9WgXcQ                               # Video ID only
```

**UI Components Used**:

- `Card` - Main container
- `Input` - URL input field
- `Button` - Submit button
- `Alert` - Error/success messaging
- `Loader2` icon - Loading spinner
- `AlertCircle` icon - Error indicator
- `CheckCircle2` icon - Success indicator

**State Management**:

```typescript
const [url, setUrl] = useState(""); // URL input
const [loading, setLoading] = useState(false); // Loading state
const [error, setError] = useState<string | null>(null); // Error message
const [success, setSuccess] = useState(false); // Success state
```

**Form Submission Handler**:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);
  setLoading(true);

  try {
    await songsApi.createFromYoutube(url);
    setSuccess(true);
    setUrl("");

    // Auto-redirect after 1.5s
    setTimeout(() => {
      router.push("/songs");
      router.refresh();
    }, 1500);
  } catch (err: unknown) {
    setError(
      err instanceof Error ? err.message : "Failed to import song from YouTube",
    );
  } finally {
    setLoading(false);
  }
};
```

---

### 3. New Song Page with Tab Switcher (`apps/admin/app/(dashboard)/songs/new/page.tsx`)

**Purpose**: Dual-mode song entry page with tab-based switcher

**File Location**: `/Users/kaitovu/Desktop/Projects/love-days/apps/admin/app/(dashboard)/songs/new/page.tsx`

**Features**:

| Feature            | Implementation                             |
| ------------------ | ------------------------------------------ |
| **Default Tab**    | YouTube Import (preferred method)          |
| **Tab Switcher**   | Button-based toggle between modes          |
| **Active State**   | Visual feedback with variant="default"     |
| **Inactive State** | Muted appearance with variant="ghost"      |
| **Tab Styling**    | Bottom border styling, rounded-bottom-none |

**Page Structure**:

```
Add Song Page
├── Header
│   ├── h1: "Add Song"
│   └── Description: "Import from YouTube or upload audio file"
├── Tab Switcher
│   ├── YouTube Import (Button)
│   └── File Upload (Button)
└── Content Area
    ├── YouTubeImportForm (when activeTab === "youtube")
    └── SongForm with mode="create" (when activeTab === "upload")
```

**Tab State**:

```typescript
const [activeTab, setActiveTab] = useState<"youtube" | "upload">("youtube");
```

**Default Behavior**:

- Page loads with YouTube Import tab active
- Users can switch to File Upload tab for manual audio uploads
- Tab state persists during form interaction

---

### 4. Song Form Enhancements (`apps/admin/components/songs/song-form.tsx`)

**Purpose**: Unified song editing component with YouTube source detection

**Modified Sections**:

#### Props Interface Update

```typescript
interface SongFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    filePath?: string;
    sourceType?: "youtube" | "upload"; // NEW
    youtubeVideoId?: string; // NEW
    thumbnailPath?: string;
    thumbnailUrl?: string;
  };
}
```

#### YouTube Source Detection

```typescript
const isYouTubeSong = initialData?.sourceType === "youtube";
```

#### Edit Mode UI Enhancement

When editing a YouTube-sourced song, a blue information banner displays:

```typescript
{mode === "edit" && isYouTubeSong && (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
    <p className="text-sm text-blue-800">
      <strong>Source:</strong> YouTube ({initialData?.youtubeVideoId})
    </p>
    <p className="text-xs text-blue-600 mt-1">
      YouTube songs cannot change audio source. Edit metadata only.
    </p>
  </div>
)}
```

#### Audio File Upload Behavior

**Create Mode**: Audio file required (file upload section visible)

```typescript
{mode === "create" && (
  <div className="space-y-2">
    <Label>Audio File *</Label>
    <FileUpload
      accept={{ "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] }}
      maxSize={50 * 1024 * 1024}
      onUpload={upload}
      onComplete={(path) => setFilePath(path)}
    />
  </div>
)}
```

**Edit Mode**: Only metadata editable for YouTube songs, thumbnail always available

#### Form Validation

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Create mode requires audio file
  if (mode === "create" && !filePath) {
    toast.error("Please upload an audio file");
    return;
  }

  setSubmitting(true);
  try {
    if (mode === "create") {
      // Full song creation with audio
      await songsApi.create({
        title,
        artist,
        album,
        filePath,
        thumbnailPath: thumbnailPath || undefined,
      });
    } else {
      // Edit: metadata and thumbnail only (no filePath)
      await songsApi.update(initialData!.id, {
        title,
        artist,
        album,
        thumbnailPath: thumbnailPath || undefined,
      });
    }
    // Redirect to songs list
  } finally {
    setSubmitting(false);
  }
};
```

---

## Data Models & Types

### SongResponseDto

**Location**: `packages/types/src/song.ts`

```typescript
interface SongResponseDto {
  id: string; // UUID
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath?: string; // songs/{uuid}.mp3 or songs/youtube/{videoId}
  fileSize?: number;
  sourceType?: "youtube" | "upload"; // NEW - indicates source
  youtubeVideoId?: string; // NEW - YouTube video ID
  thumbnailPath?: string; // images/{uuid}.png
  thumbnailUrl?: string; // Computed: Supabase URL
  fileUrl?: string; // Computed: Supabase URL
  published: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### CreateSongDto

```typescript
interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  filePath: string; // Required for regular uploads
  thumbnailPath?: string;
}
```

### API Request: YouTube Import

```typescript
POST /api/v1/songs/youtube
Content-Type: application/json
Authorization: Bearer <token>

{
  "youtubeUrl": "https://www.youtube.com/watch?v=ID"
}
```

### API Response: Song Created

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "sourceType": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "filePath": "songs/youtube/dQw4w9WgXcQ",
  "thumbnailPath": "images/123e4567-e89b-12d3-a456-426614174000.png",
  "published": false,
  "createdAt": "2026-01-07T12:30:00Z",
  "updatedAt": "2026-01-07T12:30:00Z"
}
```

---

## User Workflows

### Workflow 1: Import Song from YouTube

```
1. Admin navigates to /songs/new
2. YouTube Import tab is active by default
3. Admin enters YouTube URL or video ID
4. Admin clicks "Import from YouTube" button
5. Form sends POST /api/v1/songs/youtube with URL
6. Backend:
   - Validates YouTube URL
   - Extracts metadata (title, artist, duration, thumbnail)
   - Creates Song record with sourceType="youtube"
   - Returns SongResponseDto
7. Frontend shows success alert
8. After 1.5s, auto-redirects to /songs list
9. Song appears in list with YouTube badge
```

### Workflow 2: Upload Song from File

```
1. Admin navigates to /songs/new
2. Admin clicks "File Upload" tab
3. SongForm (create mode) displays
4. Admin:
   - Selects audio file via FileUpload component
   - Optionally adds thumbnail via image cropper
   - Enters title, artist, album
   - Clicks "Create Song"
5. Form validates audio file is selected
6. Creates song with POST /api/v1/songs
7. Redirects to /songs list
```

### Workflow 3: Edit YouTube Song

```
1. Admin clicks edit icon on YouTube song in /songs list
2. Song Form loads with edit mode + initialData
3. YouTube source badge displays (blue banner)
4. Admin can:
   - Edit title, artist, album
   - Replace thumbnail
   - Cannot edit audio source
5. Clicks "Update Song"
6. PATCH /api/v1/songs/{id} with metadata only
7. Redirects to /songs list
```

### Workflow 4: Edit Uploaded Song

```
1. Admin clicks edit icon on uploaded song in /songs list
2. Song Form loads with edit mode + initialData
3. No YouTube badge displays
4. Admin can:
   - Edit title, artist, album
   - Cannot re-upload audio file (by design)
   - Replace thumbnail
5. Clicks "Update Song"
6. PATCH /api/v1/songs/{id} with metadata + thumbnail
7. Redirects to /songs list
```

---

## Error Handling & Validation

### Client-Side Validation

| Validation                       | Rule                 | Trigger                         |
| -------------------------------- | -------------------- | ------------------------------- |
| **URL Required**                 | Non-empty string     | Submit button disabled if empty |
| **Audio File Required (Create)** | filePath must be set | Toast error on submit           |
| **Title Required**               | Non-empty string     | HTML5 required attribute        |
| **Artist Required**              | Non-empty string     | HTML5 required attribute        |
| **File Upload Size**             | Max 50MB             | FileUpload component enforces   |

### Server-Side Validation (API)

Expected handled by backend `/api/v1/songs/youtube` endpoint:

- YouTube URL format validation
- Video accessibility check (not private, removed, geo-blocked)
- Metadata extraction success
- Duplicate URL prevention (optional)

### Error Message Handling

```typescript
try {
  await songsApi.createFromYoutube(url);
} catch (err: unknown) {
  setError(
    err instanceof Error ? err.message : "Failed to import song from YouTube",
  );
}
```

**Error Display**:

```
Alert variant="destructive"
├── AlertCircle icon
└── AlertDescription: Error message from API or fallback text
```

---

## UI/UX Details

### Color Scheme (Rose Pink - 350 Hue)

All components use the project's CSS custom properties:

```css
--primary: 350 80% 65%; /* Rose pink buttons/active states */
--background: 350 30% 8%; /* Dark backgrounds */
--foreground: 350 20% 95%; /* Light text */
--card: 350 20% 10%; /* Card backgrounds */
--border: 350 20% 20%; /* Borders */
--muted: 350 10% 40%; /* Muted text */
```

### Typography

- **Card Title**: `.font-display` (Playfair Display, serif)
- **Body Text**: Default sans-serif
- **Labels**: `text-sm` (14px)
- **Descriptions**: `text-sm text-muted-foreground`

### Responsive Behavior

- **Mobile**: Stacked layout, full-width inputs
- **Tablet**: Single column forms
- **Desktop**: Multi-column grids (where applicable)

### Icons & Indicators

| Icon           | Use Case        | Color              |
| -------------- | --------------- | ------------------ |
| `Loader2`      | Loading spinner | Current text color |
| `AlertCircle`  | Error state     | Destructive (red)  |
| `CheckCircle2` | Success state   | Green (#16a34a)    |

---

## Integration with Backend API

### API Endpoint: Create Song from YouTube

**Endpoint Definition**: `POST /api/v1/songs/youtube`

**Required Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Payload**:

```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Success Response (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Never Gonna Give You Up",
  "artist": "Rick Astley",
  "album": "Whenever You Need Somebody",
  "sourceType": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "duration": 213,
  "filePath": "songs/youtube/dQw4w9WgXcQ",
  "thumbnailPath": "images/550e8400.png",
  "published": false,
  "createdAt": "2026-01-07T12:30:00.000Z",
  "updatedAt": "2026-01-07T12:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Invalid YouTube URL format"
}
```

**Error Response (401 Unauthorized)**:

```json
{
  "message": "Unauthorized"
}
```

---

## Testing Guide

### Manual Test Cases

#### Test 1: YouTube Import Success

1. Navigate to `/songs/new`
2. Verify YouTube Import tab is active
3. Enter valid URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Click "Import from YouTube"
5. Verify success alert shows
6. Verify redirect to `/songs` after 1.5s
7. Verify song appears in list

#### Test 2: YouTube Import - Invalid URL

1. Navigate to `/songs/new`
2. Enter invalid URL: `not-a-youtube-url`
3. Click "Import from YouTube"
4. Verify error alert shows API error message
5. Verify form still visible for retry

#### Test 3: Tab Switching

1. Navigate to `/songs/new`
2. Verify YouTube Import form visible
3. Click "File Upload" tab
4. Verify SongForm (create mode) displays
5. Click "YouTube Import" tab
6. Verify YouTubeImportForm displays again

#### Test 4: Edit YouTube Song

1. Navigate to `/songs`
2. Click edit on YouTube-sourced song
3. Verify blue banner shows YouTube source info
4. Edit title field
5. Click "Update Song"
6. Verify update succeeds
7. Verify edit badge shows YouTube source

#### Test 5: Edit Upload Song

1. Navigate to `/songs`
2. Click edit on uploaded song
3. Verify NO YouTube source badge
4. Edit title field
5. Click "Update Song"
6. Verify update succeeds

---

## Component Dependencies

### YouTubeImportForm

```
YouTubeImportForm
├── Imports
│   ├── React (useState, useRouter)
│   ├── next/navigation (useRouter)
│   ├── @/components/ui/* (Card, Button, Input, Label, Alert)
│   ├── @/lib/api (songsApi)
│   └── lucide-react (AlertCircle, CheckCircle2, Loader2)
└── Exports
    └── YouTubeImportForm (named export)
```

### NewSongPage

```
NewSongPage
├── Imports
│   ├── React (useState)
│   ├── @/components/songs/* (SongForm, YouTubeImportForm)
│   └── @/components/ui/button (Button)
└── Exports
    └── default (page export)
```

### SongForm

```
SongForm
├── Modifications
│   ├── New Props: sourceType, youtubeVideoId
│   ├── New Logic: isYouTubeSong detection
│   └── New UI: YouTube source banner
└── No Breaking Changes
    └── Backward compatible with existing code
```

---

## Backend Requirements Checklist

For Phase 3 to function end-to-end, backend must provide:

- [ ] `POST /api/v1/songs/youtube` endpoint
- [ ] YouTube URL parsing (full URLs, shortened URLs, video IDs)
- [ ] Metadata extraction (title, artist, duration, thumbnail)
- [ ] Song record creation with `sourceType: "youtube"`
- [ ] YouTube video ID storage
- [ ] Proper error responses (400 for invalid URL, 401 for auth, 500 for server errors)
- [ ] Response includes full `SongResponseDto` with source info
- [ ] Integration with existing song list endpoint (includes sourceType, youtubeVideoId)

---

## File Structure Summary

```
apps/admin/
├── lib/
│   └── api.ts
│       └── songsApi.createFromYoutube() [NEW METHOD]
│
├── components/
│   └── songs/
│       ├── youtube-import-form.tsx [NEW COMPONENT]
│       └── song-form.tsx [MODIFIED]
│           ├── Props: sourceType, youtubeVideoId
│           ├── Logic: YouTube detection
│           └── UI: Source badge
│
└── app/
    └── (dashboard)/
        └── songs/
            └── new/
                └── page.tsx [MODIFIED]
                    ├── Tab switcher
                    ├── Active: "youtube" | "upload"
                    └── Conditional rendering
```

---

## Design Decisions

### 1. Tab-Based UI for Dual Input

**Rationale**: Users should see both options clearly but default to YouTube import (faster, less file handling)
**Alternative Rejected**: Single form with mode toggle (less clear to users)

### 2. Auto-Redirect After Success

**Rationale**: Immediate feedback that import succeeded, quick return to song list for next action
**Timeout**: 1.5s allows users to read success message before navigation

### 3. YouTube Badge in Edit Mode

**Rationale**: Prevents user confusion and accidental attempts to modify audio source
**Placement**: Top of form for maximum visibility
**Color**: Blue (informational) vs red (warning) - less intrusive

### 4. Metadata-Only Updates for YouTube Songs

**Rationale**: YouTube source is immutable once imported (points to public video)
**User Impact**: Can update title, artist, album, thumbnail but not audio content
**API**: PATCH endpoint excludes filePath for YouTube songs

### 5. No Audio Upload in Edit Mode

**Rationale**: Audio already uploaded/sourced; edit focuses on metadata
**Future Enhancement**: Could allow re-upload with soft delete of old file

---

## Maintenance Notes

### Code Quality Standards

- **Type Safety**: All components use TypeScript with strict mode
- **Error Boundaries**: Try-catch blocks in async operations
- **User Feedback**: Toast notifications for errors, alerts for state changes
- **Accessibility**: Semantic HTML, ARIA labels, keyboard support
- **Responsive**: Mobile-first CSS with Tailwind utilities

### Potential Extensions

1. **Batch Import**: Multiple URLs in textarea
2. **Metadata Preview**: Show extracted metadata before confirmation
3. **Duplicate Detection**: Warn if YouTube URL already imported
4. **Schedule Publishing**: Defer publication to future date
5. **Import History**: Log and display successful imports

### Known Limitations

1. **No Client-Side YouTube Validation**: Full validation happens server-side
2. **No Retry Logic**: Failed imports require manual retry
3. **No Bulk Operations**: Import one song at a time
4. **Static Metadata**: No live metadata refresh in edit mode

---

## Summary

Phase 3 completes the admin UI for YouTube song import, providing users with:

1. **Easy Import Path**: Dedicated YouTube import form (preferred default)
2. **Flexible Input**: Supports multiple YouTube URL formats
3. **Seamless Experience**: Tab switcher for both import methods
4. **Safe Editing**: YouTube source protection with visual badges
5. **Clear Feedback**: Success/error messages with auto-navigation
6. **Type Safety**: Comprehensive TypeScript interfaces
7. **User-Friendly**: Minimal clicks, helpful descriptions, responsive design

The implementation is production-ready with proper error handling, validation, and integration with the backend API.
