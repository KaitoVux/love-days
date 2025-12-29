# API Reference Documentation

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Backend:** NestJS API
**API Base URL:** `NEXT_PUBLIC_API_URL` environment variable

## Authentication

All API requests require Bearer token authentication:

```
Authorization: Bearer {access_token}
```

The token is automatically obtained from Supabase Auth session and injected by the API client in `lib/api.ts`.

### Getting Auth Headers

```typescript
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
```

## API Client Interface

All API calls use the centralized client in `lib/api.ts`:

```typescript
import { songsApi, imagesApi } from "@/lib/api";

// Songs API
await songsApi.list(published?: boolean);
await songsApi.get(id: string);
await songsApi.create(data: CreateSongDto);
await songsApi.update(id: string, data: UpdateSongDto);
await songsApi.delete(id: string);
await songsApi.publish(id: string, published: boolean);
await songsApi.getUploadUrl(fileName: string, fileType: string, fileSize?: number);

// Images API
await imagesApi.list(category?: string);
await imagesApi.get(id: string);
await imagesApi.create(data: CreateImageDto);
await imagesApi.update(id: string, data: UpdateImageDto);
await imagesApi.delete(id: string);
await imagesApi.publish(id: string, published: boolean);
await imagesApi.getUploadUrl(fileName: string, fileType: string, fileSize?: number);
```

## Songs API Endpoints

### List Songs

**Method:** GET
**Endpoint:** `/api/v1/songs`
**Query Parameters:**

- `published` (optional): Filter by published status (true/false)

**Response:**

```typescript
SongResponseDto[]
```

**Example:**

```typescript
// Get all songs
const allSongs = await songsApi.list();

// Get published songs only
const publishedSongs = await songsApi.list(true);

// Get unpublished songs only
const draftSongs = await songsApi.list(false);
```

### Get Single Song

**Method:** GET
**Endpoint:** `/api/v1/songs/:id`
**Path Parameters:**

- `id` (required): Song UUID

**Response:**

```typescript
SongResponseDto;
```

**Example:**

```typescript
const song = await songsApi.get("550e8400-e29b-41d4-a716-446655440000");
```

### Create Song

**Method:** POST
**Endpoint:** `/api/v1/songs`
**Request Body:**

```typescript
CreateSongDto {
  title: string;         // Required: Song title (1-255 chars)
  artist: string;        // Required: Artist name (1-255 chars)
  album?: string;        // Optional: Album name (1-255 chars)
  filePath: string;      // Required: File path from upload URL
}
```

**Response:**

```typescript
SongResponseDto {
  id: string;
  title: string;
  artist: string;
  album?: string;
  filePath: string;
  fileUrl: string;       // Full URL to audio file
  published: boolean;
  createdAt: string;     // ISO 8601 timestamp
  updatedAt: string;     // ISO 8601 timestamp
}
```

**Example:**

```typescript
const newSong = await songsApi.create({
  title: "Beautiful Day",
  artist: "Artists Name",
  album: "Album Name",
  filePath: "songs/550e8400-e29b-41d4-a716-446655440000.mp3",
});
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or validation failed
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

### Update Song

**Method:** PATCH
**Endpoint:** `/api/v1/songs/:id`
**Path Parameters:**

- `id` (required): Song UUID

**Request Body:**

```typescript
UpdateSongDto {
  title?: string;        // Optional: Updated title
  artist?: string;       // Optional: Updated artist
  album?: string;        // Optional: Updated album
}
```

**Response:**

```typescript
SongResponseDto; // Updated song data
```

**Example:**

```typescript
const updated = await songsApi.update("550e8400-e29b-41d4-a716-446655440000", {
  title: "Updated Title",
  artist: "Updated Artist",
});
```

**Note:** File cannot be updated after creation. Delete and recreate to change audio file.

### Delete Song

**Method:** DELETE
**Endpoint:** `/api/v1/songs/:id`
**Path Parameters:**

- `id` (required): Song UUID

**Response:** No content (204 No Content)

**Example:**

```typescript
await songsApi.delete("550e8400-e29b-41d4-a716-446655440000");
```

**Error Responses:**

- `404 Not Found`: Song doesn't exist
- `401 Unauthorized`: Authentication failed

### Publish Song

**Method:** POST
**Endpoint:** `/api/v1/songs/:id/publish`
**Path Parameters:**

- `id` (required): Song UUID

**Request Body:**

```typescript
{
  published: boolean; // true to publish, false to unpublish
}
```

**Response:**

```typescript
SongResponseDto; // Updated song data with published status
```

**Example:**

```typescript
// Publish song
await songsApi.publish("550e8400-e29b-41d4-a716-446655440000", true);

// Unpublish song
await songsApi.publish("550e8400-e29b-41d4-a716-446655440000", false);
```

### Get Upload URL (Presigned)

**Method:** POST
**Endpoint:** `/api/v1/songs/upload-url`

**Request Body:**

```typescript
{
  fileName: string;      // Original filename (with extension)
  fileType: string;      // MIME type (e.g., "audio/mpeg")
  fileSize?: number;     // Optional: File size in bytes
}
```

**Response:**

```typescript
{
  uploadUrl: string; // Presigned URL for direct upload
  filePath: string; // Path to use in create/update
}
```

**Example:**

```typescript
const { uploadUrl, filePath } = await songsApi.getUploadUrl(
  "song.mp3",
  "audio/mpeg",
  1024000,
);

// Upload directly to presigned URL
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": "audio/mpeg" },
});
```

## Images API Endpoints

### List Images

**Method:** GET
**Endpoint:** `/api/v1/images`
**Query Parameters:**

- `category` (optional): Filter by category ("profile", "background", "gallery")

**Response:**

```typescript
ImageResponseDto[]
```

**Example:**

```typescript
// Get all images
const allImages = await imagesApi.list();

// Get profile images
const profileImages = await imagesApi.list("profile");
```

### Get Single Image

**Method:** GET
**Endpoint:** `/api/v1/images/:id`
**Path Parameters:**

- `id` (required): Image UUID

**Response:**

```typescript
ImageResponseDto;
```

**Example:**

```typescript
const image = await imagesApi.get("550e8400-e29b-41d4-a716-446655440000");
```

### Create Image

**Method:** POST
**Endpoint:** `/api/v1/images`
**Request Body:**

```typescript
CreateImageDto {
  title: string;         // Required: Image title (1-255 chars)
  description?: string;  // Optional: Image description (1-500 chars)
  category: string;      // Required: Category (profile, background, gallery)
  filePath: string;      // Required: File path from upload URL
}
```

**Response:**

```typescript
ImageResponseDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  filePath: string;
  fileUrl: string;       // Full URL to image file
  published: boolean;
  createdAt: string;     // ISO 8601 timestamp
  updatedAt: string;     // ISO 8601 timestamp
}
```

**Categories:**

- `profile`: Profile pictures
- `background`: Background images
- `gallery`: Gallery images

**Example:**

```typescript
const newImage = await imagesApi.create({
  title: "Profile Picture",
  description: "Beautiful profile photo",
  category: "profile",
  filePath: "images/550e8400-e29b-41d4-a716-446655440000.jpg",
});
```

### Update Image

**Method:** PATCH
**Endpoint:** `/api/v1/images/:id`
**Path Parameters:**

- `id` (required): Image UUID

**Request Body:**

```typescript
UpdateImageDto {
  title?: string;        // Optional: Updated title
  description?: string;  // Optional: Updated description
  category?: string;     // Optional: Updated category
}
```

**Response:**

```typescript
ImageResponseDto; // Updated image data
```

**Example:**

```typescript
const updated = await imagesApi.update("550e8400-e29b-41d4-a716-446655440000", {
  title: "Updated Title",
  category: "background",
});
```

### Delete Image

**Method:** DELETE
**Endpoint:** `/api/v1/images/:id`
**Path Parameters:**

- `id` (required): Image UUID

**Response:** No content (204 No Content)

**Example:**

```typescript
await imagesApi.delete("550e8400-e29b-41d4-a716-446655440000");
```

### Publish Image

**Method:** POST
**Endpoint:** `/api/v1/images/:id/publish`
**Path Parameters:**

- `id` (required): Image UUID

**Request Body:**

```typescript
{
  published: boolean; // true to publish, false to unpublish
}
```

**Response:**

```typescript
ImageResponseDto; // Updated image data with published status
```

**Example:**

```typescript
// Publish image
await imagesApi.publish("550e8400-e29b-41d4-a716-446655440000", true);

// Unpublish image
await imagesApi.publish("550e8400-e29b-41d4-a716-446655440000", false);
```

### Get Upload URL (Presigned)

**Method:** POST
**Endpoint:** `/api/v1/images/upload-url`

**Request Body:**

```typescript
{
  fileName: string;      // Original filename (with extension)
  fileType: string;      // MIME type (e.g., "image/jpeg")
  fileSize?: number;     // Optional: File size in bytes
}
```

**Response:**

```typescript
{
  uploadUrl: string; // Presigned URL for direct upload
  filePath: string; // Path to use in create/update
}
```

**Example:**

```typescript
const { uploadUrl, filePath } = await imagesApi.getUploadUrl(
  "image.jpg",
  "image/jpeg",
  2048000,
);

// Upload directly to presigned URL
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": "image/jpeg" },
});
```

## Data Types

### SongResponseDto

```typescript
{
  id: string;              // UUID
  title: string;           // Song title
  artist: string;          // Artist name
  album?: string;          // Album name (optional)
  filePath: string;        // Storage path
  fileUrl: string;         // Full URL to audio file
  published: boolean;      // Publication status
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### ImageResponseDto

```typescript
{
  id: string;              // UUID
  title: string;           // Image title
  description?: string;    // Description (optional)
  category: string;        // Category (profile, background, gallery)
  filePath: string;        // Storage path
  fileUrl: string;         // Full URL to image file
  published: boolean;      // Publication status
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### CreateSongDto

```typescript
{
  title: string;           // Required: Song title
  artist: string;          // Required: Artist name
  album?: string;          // Optional: Album name
  filePath: string;        // Required: File path from upload URL
}
```

### CreateImageDto

```typescript
{
  title: string;           // Required: Image title
  description?: string;    // Optional: Description
  category: string;        // Required: Category
  filePath: string;        // Required: File path from upload URL
}
```

### UpdateSongDto

```typescript
{
  title?: string;          // Optional: Updated title
  artist?: string;         // Optional: Updated artist
  album?: string;          // Optional: Updated album
}
```

### UpdateImageDto

```typescript
{
  title?: string;          // Optional: Updated title
  description?: string;    // Optional: Updated description
  category?: string;       // Optional: Updated category
}
```

## Error Handling

### Error Response Format

```typescript
{
  message: string; // Error description
  statusCode: number; // HTTP status code
  timestamp: string; // ISO 8601 timestamp
  path: string; // API path
}
```

### Common Error Codes

| Code | Message               | Cause                                       |
| ---- | --------------------- | ------------------------------------------- |
| 400  | Bad Request           | Invalid request format or validation failed |
| 401  | Unauthorized          | Missing or invalid authentication token     |
| 403  | Forbidden             | User doesn't have permission                |
| 404  | Not Found             | Resource doesn't exist                      |
| 409  | Conflict              | Resource already exists (e.g., duplicate)   |
| 413  | Payload Too Large     | File size exceeds limit                     |
| 422  | Unprocessable Entity  | Validation error in request body            |
| 429  | Too Many Requests     | Rate limit exceeded                         |
| 500  | Internal Server Error | Server error                                |

### Client Error Handling Pattern

```typescript
try {
  const result = await songsApi.create(data);
  toast.success("Song created");
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Failed to create song";
  toast.error(message);
}
```

## File Upload Flow

### Step 1: Get Presigned URL

```typescript
const { uploadUrl, filePath } = await songsApi.getUploadUrl(
  file.name,
  file.type,
  file.size,
);
```

### Step 2: Upload File Directly

```typescript
const response = await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type,
  },
});

if (!response.ok) {
  throw new Error("Upload failed");
}
```

### Step 3: Create/Update Record

```typescript
await songsApi.create({
  title: "Song Title",
  artist: "Artist Name",
  album: "Album Name",
  filePath: filePath, // From step 1
});
```

## Validation Rules

### Songs

- **title:** 1-255 characters, required
- **artist:** 1-255 characters, required
- **album:** 1-255 characters, optional
- **filePath:** Required, must be from upload URL response

### Images

- **title:** 1-255 characters, required
- **description:** 1-500 characters, optional
- **category:** Must be one of: "profile", "background", "gallery", required
- **filePath:** Required, must be from upload URL response

### Files

- **Audio files:** MP3, WAV, M4A, OGG (max 50MB)
- **Image files:** JPG, PNG, WebP, GIF (max 10MB based on upload bucket config)
- **File names:** Must be valid UTF-8, < 255 characters

## Rate Limiting

**Current Status:** No rate limiting on API endpoints (may be added in production)

**Expected Limits (future):**

- Global: 1000 requests/hour per user
- Upload: 100 uploads/hour per user
- File size: 50MB per file max

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://api.love-days.com

# Used by API client
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=https://...
```

## API Usage Examples

### Create and Publish a Song

```typescript
// 1. Upload audio file
const { uploadUrl, filePath } = await songsApi.getUploadUrl(
  "love-song.mp3",
  "audio/mpeg",
  2048000,
);

await fetch(uploadUrl, {
  method: "PUT",
  body: audioFile,
  headers: { "Content-Type": "audio/mpeg" },
});

// 2. Create song record
const song = await songsApi.create({
  title: "Love Song",
  artist: "My Band",
  album: "My Album",
  filePath: filePath,
});

// 3. Publish immediately
await songsApi.publish(song.id, true);
```

### Update and Toggle Publish

```typescript
// Update metadata
await songsApi.update(songId, {
  title: "Updated Title",
  artist: "Updated Artist",
});

// Toggle publish status
const currentSong = await songsApi.get(songId);
await songsApi.publish(songId, !currentSong.published);
```

### Filter and List

```typescript
// Get all songs
const allSongs = await songsApi.list();

// Get only published songs
const published = await songsApi.list(true);

// Get only unpublished drafts
const drafts = await songsApi.list(false);

// Get images by category
const profiles = await imagesApi.list("profile");
const backgrounds = await imagesApi.list("background");
```

## Troubleshooting

### 401 Unauthorized

**Cause:** Missing or expired authentication token
**Solution:**

- Ensure user is logged in
- Check Supabase session validity
- Refresh page to get new token

### 404 Not Found

**Cause:** Resource doesn't exist
**Solution:**

- Verify resource ID is correct
- Check if resource was deleted
- Refresh list to see current state

### 413 Payload Too Large

**Cause:** File exceeds size limit
**Solution:**

- Compress file before upload
- Audio files: max 50MB
- Images: check bucket configuration

### Network Errors

**Cause:** API endpoint unreachable
**Solution:**

- Check `NEXT_PUBLIC_API_URL` configuration
- Verify backend is running
- Check network connectivity
- Try again after a few seconds

---

**Last Updated:** 2025-12-29
**API Version:** 1.0.0
**Backend Framework:** NestJS
