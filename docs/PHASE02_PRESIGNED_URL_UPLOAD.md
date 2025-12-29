# Phase 02: Presigned URL File Upload - Complete Documentation

**Status**: ✅ Complete
**Date**: 2025-12-29
**Files Changed**: 9 (5 new, 4 modified)
**Lines Added**: ~450
**Security Focus**: XSS Prevention, Path Traversal Prevention
**Build Status**: ✅ Pass

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Implementation](#security-implementation)
4. [API Endpoints](#api-endpoints)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Environment Configuration](#environment-configuration)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Migration from Direct Upload](#migration-from-direct-upload)

---

## Overview

Phase 02 implements **Presigned URL File Upload** pattern to bypass Vercel's 4.5MB request size limit. This allows clients to upload large files (up to 50MB for audio, 5MB for images) directly to Supabase storage without routing through the API server.

### Problem Solved

**Before Phase 02**: Direct file uploads to API → Vercel enforces 4.5MB limit → Large files rejected
**After Phase 02**: Client requests presigned URL → Uploads directly to Supabase → No server bottleneck

### Key Features

- ✅ Presigned URLs generated on-demand
- ✅ MIME type allowlist validation (XSS prevention)
- ✅ File extension validation (Path traversal prevention)
- ✅ File size validation before upload
- ✅ Global StorageModule for reusability
- ✅ Separate size limits per content type (50MB audio, 5MB images)
- ✅ Environment variable validation at startup
- ✅ Shared DTO pattern across modules

---

## Architecture

### Module Structure

```
apps/api/src/
├── storage/                          # NEW: File storage management
│   ├── storage.module.ts            # Global module (exported to all)
│   ├── storage.service.ts           # Core presigned URL logic
│   └── dto/
│       └── upload-url-response.dto.ts  # Shared response DTO
├── songs/
│   ├── songs.controller.ts          # MODIFIED: Added upload-url endpoint
│   ├── songs.service.ts             # MODIFIED: Delegated to StorageService
│   └── dto/
│       └── upload-url.dto.ts        # NEW: Song-specific request DTO
├── images/
│   ├── images.controller.ts         # MODIFIED: Added upload-url endpoint
│   ├── images.service.ts            # MODIFIED: Delegated to StorageService
│   └── dto/
│       └── upload-url.dto.ts        # NEW: Image-specific request DTO
└── app.module.ts                    # MODIFIED: Imports StorageModule
```

### Dependency Injection

```
AppModule
├── StorageModule (Global)
│   └── StorageService (Singleton)
│       ├── Supabase Client
│       └── MIME Type + Extension Validators
├── SongsModule
│   ├── SongsController
│   ├── SongsService (depends on StorageService)
│   └── PrismaService
└── ImagesModule
    ├── ImagesController
    ├── ImagesService (depends on StorageService)
    └── PrismaService
```

### Request Flow

```
Client                    API                      Supabase
  │                        │                          │
  ├──POST /upload-url────→ │                          │
  │    {fileName,          │                          │
  │     fileType,          │                          │
  │     fileSize}          │                          │
  │                        │ Validates MIME type    │
  │                        │ Validates extension    │
  │                        │ Validates file size    │
  │                        │ Generates UUID path    │
  │                        ├──createSignedUploadUrl──→
  │                        │                          │
  │←─PresignedUrl ────────│←──signedUrl ────────────│
  │  {uploadUrl,           │                          │
  │   filePath}            │                          │
  │                        │                          │
  ├─────PUT/POST data────────────────────────────→ │
  │    (direct to Supabase)                         │
  │                        │                          ├─ Validate signature
  │                        │                          ├─ Store file
  │←─────200 OK ────────────────────────────────── │
  │                        │                          │
  ├──POST /songs ─────────→│                          │
  │  {filePath,            │                          │
  │   title, artist...}    │                          │
  │                        ├─ Create metadata record  │
  │                        │                          │
  │←─Song record──────────│                          │
  │                        │                          │
```

---

## Security Implementation

### 1. MIME Type Validation (XSS Prevention)

**Risk**: Attacker uploads malicious file with `.html` extension disguised as audio/image.

**Implementation**:

```typescript
private readonly ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

private readonly ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
];

private isValidFileType(bucket: string, fileType: string): boolean {
  if (bucket === 'songs') {
    return this.ALLOWED_AUDIO_TYPES.includes(fileType.toLowerCase());
  }
  if (bucket === 'images') {
    return this.ALLOWED_IMAGE_TYPES.includes(fileType.toLowerCase());
  }
  return false;
}
```

**Defense**:

- Only whitelisted MIME types accepted
- Case-insensitive matching
- Per-bucket type restrictions
- Rejected types: `text/html`, `application/javascript`, `text/plain`

### 2. File Extension Validation (Path Traversal Prevention)

**Risk**: Attacker uses path traversal (e.g., `../../../etc/passwd`) in filename.

**Implementation**:

```typescript
private getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';

  const extension = fileName.substring(lastDot).toLowerCase();

  // Sanitize extension to prevent path traversal attacks
  const sanitized = extension.replace(/[^a-z0-9.]/g, '');

  // Validate extension is in allowed list
  const allowedExtensions = [
    '.mp3', '.wav', '.ogg', '.flac', // audio
    '.jpg', '.jpeg', '.png', '.webp', '.gif', // images
  ];

  if (!allowedExtensions.includes(sanitized)) {
    throw new BadRequestException(`File extension ${extension} not allowed`);
  }

  return sanitized;
}
```

**Defense**:

- Extracts only final extension (blocks multiple dots)
- Removes special characters from extension (blocks path traversal)
- Validates against allowlist of safe extensions
- Rejected patterns: `..`, `/`, `\`, `:`, `;`, `@`, etc.

### 3. File Size Validation (DoS Prevention)

**Risk**: Attacker uploads multi-gigabyte file → Storage quota exhausted → Denial of Service.

**Implementation**:

```typescript
async generateUploadUrl(
  options: UploadUrlOptions,
): Promise<UploadUrlResponse> {
  const { bucket, fileName, fileType, fileSize, maxSizeBytes } = options;

  // Validate file size
  if (maxSizeBytes && fileSize && fileSize > maxSizeBytes) {
    throw new BadRequestException(
      `File size exceeds limit of ${maxSizeBytes / 1024 / 1024}MB`,
    );
  }
  // ...
}
```

**Defense**:

- Audio uploads capped at 50MB
- Image uploads capped at 5MB
- Validation happens before URL generation (early rejection)
- Client pre-validates file size before sending request

### 4. Unique File Path Generation (Collision Prevention)

**Implementation**:

```typescript
import { randomUUID } from "crypto";

// Generate unique file path
const extension = this.getExtension(fileName);
const uuid = randomUUID();
const filePath = `${uuid}${extension}`;
```

**Defense**:

- Uses cryptographic UUID (v4) for uniqueness
- Prevents filename collisions
- Prevents overwriting existing files
- Pattern: `550e8400-e29b-41d4-a716-446655440000.mp3`

### 5. Environment Variable Validation

**Implementation**:

```typescript
constructor() {
  // Validate required environment variables
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
  }

  this.supabaseUrl = process.env.SUPABASE_URL;
  this.supabase = createClient(
    this.supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY,
  );
}
```

**Defense**:

- Fails fast if credentials missing
- Prevents runtime errors in production
- Clear error messages for debugging

---

## API Endpoints

### Songs: Generate Upload URL

**Endpoint**: `POST /api/v1/songs/upload-url`

**Authentication**: Required (Bearer token)

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "fileName": "my-song.mp3",
  "fileType": "audio/mpeg",
  "fileSize": 15728640
}
```

**Request DTO**:
| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| fileName | string | Yes | 1+ chars | `"my-song.mp3"` |
| fileType | string | Yes | MIME type | `"audio/mpeg"` |
| fileSize | number | No | 1-52428800 (50MB) | `15728640` |

**Response**: 201 Created

```json
{
  "uploadUrl": "https://[project].supabase.co/storage/v1/object/public/songs/550e8400-e29b-41d4-a716-446655440000.mp3?token=...",
  "filePath": "songs/550e8400-e29b-41d4-a716-446655440000.mp3"
}
```

**Response DTO**:
| Field | Type | Description |
|-------|------|-------------|
| uploadUrl | string | Presigned URL valid for file upload (expires in 1 hour) |
| filePath | string | File path for metadata storage (use in CreateSongDto) |

**Error Responses**:

| Status | Error                 | Description                     |
| ------ | --------------------- | ------------------------------- |
| 400    | BadRequestException   | File size exceeds limit of 50MB |
| 400    | BadRequestException   | Invalid file type: text/plain   |
| 400    | BadRequestException   | File extension .exe not allowed |
| 401    | Unauthorized          | Missing or invalid Bearer token |
| 500    | Internal Server Error | Supabase connection failure     |

**Example Requests**:

```bash
# Using curl
curl -X POST http://localhost:3001/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "autumn-leaves.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 15728640
  }'

# Using JavaScript/Fetch
const response = await fetch('http://localhost:3001/api/v1/songs/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: 'autumn-leaves.mp3',
    fileType: 'audio/mpeg',
    fileSize: file.size,
  }),
});
const { uploadUrl, filePath } = await response.json();
```

---

### Images: Generate Upload URL

**Endpoint**: `POST /api/v1/images/upload-url`

**Authentication**: Required (Bearer token)

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2097152
}
```

**Request DTO**:
| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| fileName | string | Yes | 1+ chars | `"photo.jpg"` |
| fileType | string | Yes | MIME type | `"image/jpeg"` |
| fileSize | number | No | 1-5242880 (5MB) | `2097152` |

**Response**: 201 Created

```json
{
  "uploadUrl": "https://[project].supabase.co/storage/v1/object/public/images/550e8400-e29b-41d4-a716-446655440000.jpg?token=...",
  "filePath": "images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Error Responses**: Same as Songs endpoint, with 5MB image limit instead of 50MB.

**Example Requests**:

```bash
# Using curl
curl -X POST http://localhost:3001/api/v1/images/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "profile.jpg",
    "fileType": "image/jpeg",
    "fileSize": 2097152
  }'

# Using JavaScript/Fetch
const response = await fetch('http://localhost:3001/api/v1/images/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: 'profile.jpg',
    fileType: 'image/jpeg',
    fileSize: file.size,
  }),
});
const { uploadUrl, filePath } = await response.json();
```

---

## Implementation Details

### StorageService

**File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/storage.service.ts`

**Responsibilities**:

1. Generate presigned upload URLs
2. Validate MIME types
3. Validate file extensions
4. Validate file sizes
5. Generate public URLs
6. Delete files from storage

**Methods**:

#### `generateUploadUrl(options: UploadUrlOptions)`

```typescript
async generateUploadUrl(
  options: UploadUrlOptions,
): Promise<UploadUrlResponse>
```

Generates a presigned URL for client-side upload. Validates all parameters before delegating to Supabase.

**Parameters**:

- `bucket`: 'songs' or 'images'
- `fileName`: Original filename (e.g., 'my-song.mp3')
- `fileType`: MIME type (e.g., 'audio/mpeg')
- `fileSize`: File size in bytes (optional)
- `maxSizeBytes`: Maximum allowed size (50MB for audio, 5MB for images)

**Returns**:

```typescript
{
  uploadUrl: string; // Presigned URL for client upload
  filePath: string; // Path for metadata storage
}
```

#### `getPublicUrl(bucket: string, filePath: string)`

```typescript
getPublicUrl(bucket: string, filePath: string): string
```

Generates a public URL for accessing uploaded files. Used in song/image responses.

**Parameters**:

- `bucket`: 'songs' or 'images'
- `filePath`: File path from database (e.g., 'songs/uuid.mp3')

**Returns**: Public URL (e.g., `https://[project].supabase.co/storage/v1/object/public/songs/uuid.mp3`)

#### `deleteFile(bucket: string, filePath: string)`

```typescript
async deleteFile(bucket: string, filePath: string): Promise<void>
```

Deletes a file from Supabase storage. Called when song/image is deleted.

### StorageModule

**File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/storage.module.ts`

```typescript
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
```

**Key Features**:

- `@Global()` decorator makes StorageService available to all modules
- No need to import StorageModule in each feature module
- Singleton instance (shared across all modules)

**Why Global?**

- Presigned URL generation needed by multiple modules (Songs, Images)
- Reduces boilerplate imports
- Single source of truth for storage logic

### DTOs

#### UploadUrlResponseDto

**File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/dto/upload-url-response.dto.ts`

**Purpose**: Shared response DTO used by both Songs and Images modules.

```typescript
export class UploadUrlResponseDto {
  @ApiProperty({ description: "Presigned upload URL" })
  uploadUrl: string;

  @ApiProperty({
    description: "File path for metadata",
    example: "songs/uuid-filename.mp3",
  })
  filePath: string;
}
```

#### SongUploadUrlDto

**File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/songs/dto/upload-url.dto.ts`

```typescript
export class SongUploadUrlDto {
  @ApiProperty({ description: "Original file name", example: "my-song.mp3" })
  @IsString()
  fileName: string;

  @ApiProperty({ description: "MIME type", example: "audio/mpeg" })
  @IsString()
  fileType: string;

  @ApiPropertyOptional({ description: "File size in bytes" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52428800) // 50MB
  fileSize?: number;
}
```

#### ImageUploadUrlDto

**File**: `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/images/dto/upload-url.dto.ts`

```typescript
export class ImageUploadUrlDto {
  @ApiProperty({ description: "Original file name", example: "photo.jpg" })
  @IsString()
  fileName: string;

  @ApiProperty({ description: "MIME type", example: "image/jpeg" })
  @IsString()
  fileType: string;

  @ApiPropertyOptional({ description: "File size in bytes" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5242880) // 5MB
  fileSize?: number;
}
```

---

## Usage Examples

### Complete Upload Flow (JavaScript/TypeScript)

```typescript
// Step 1: Get presigned URL from API
async function requestUploadUrl(file: File, token: string) {
  const response = await fetch(
    "http://localhost:3001/api/v1/songs/upload-url",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Upload URL generation failed: ${error.message}`);
  }

  return response.json(); // { uploadUrl, filePath }
}

// Step 2: Upload file directly to Supabase
async function uploadFileToSupabase(file: File, uploadUrl: string) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  return response;
}

// Step 3: Create metadata record in API
async function createSongRecord(
  filePath: string,
  metadata: { title: string; artist: string; album: string },
  token: string,
) {
  const response = await fetch("http://localhost:3001/api/v1/songs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filePath,
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      duration: 0, // Will be calculated from file
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create song: ${error.message}`);
  }

  return response.json();
}

// Main flow
async function uploadSong(file: File, metadata: any, token: string) {
  try {
    // Step 1: Get presigned URL
    console.log("Requesting upload URL...");
    const { uploadUrl, filePath } = await requestUploadUrl(file, token);
    console.log("Upload URL received:", uploadUrl);

    // Step 2: Upload to Supabase
    console.log("Uploading file to Supabase...");
    await uploadFileToSupabase(file, uploadUrl);
    console.log("File uploaded successfully");

    // Step 3: Create metadata
    console.log("Creating song record...");
    const song = await createSongRecord(filePath, metadata, token);
    console.log("Song created:", song);

    return song;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
```

### React Hook for File Upload

```typescript
import { useState, useCallback } from 'react';

function useSongUpload(token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadSong = useCallback(
    async (file: File, metadata: { title: string; artist: string; album: string }) => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Step 1: Get upload URL
        const urlResponse = await fetch('/api/v1/songs/upload-url', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!urlResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, filePath } = await urlResponse.json();
        setProgress(25);

        // Step 2: Upload file with progress tracking
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(25 + (percentComplete * 0.5));
          }
        });

        await new Promise((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(null);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Upload error')));

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        setProgress(75);

        // Step 3: Create metadata
        const createResponse = await fetch('/api/v1/songs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath,
            ...metadata,
            duration: 0,
          }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create song record');
        }

        const song = await createResponse.json();
        setProgress(100);

        return song;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return { uploadSong, loading, error, progress };
}

// Usage in component
export function SongUploadForm() {
  const { user } = useAuth();
  const { uploadSong, loading, error, progress } = useSongUpload(user?.token || '');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData(e.currentTarget);
    const metadata = {
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      album: formData.get('album') as string,
    };

    await uploadSong(file, metadata);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Song title" required />
      <input type="text" name="artist" placeholder="Artist" required />
      <input type="text" name="album" placeholder="Album" required />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.currentTarget.files?.[0] || null)}
        required
      />

      {progress > 0 && <progress value={progress} max={100} />}
      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? `Uploading ${progress.toFixed(0)}%...` : 'Upload'}
      </button>
    </form>
  );
}
```

---

## Environment Configuration

### Required Environment Variables

**File**: `apps/api/.env.local`

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional but recommended
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/love_days
```

### Validation

The `StorageService` validates these variables on startup:

```typescript
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}
if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY environment variable is required");
}
```

**If missing**: Application crashes with clear error message (fail-fast pattern).

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API → Copy these values:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` → `SUPABASE_SERVICE_KEY` (use service role, not anon key)

---

## Testing Guide

### Manual API Testing

#### Test 1: Valid Audio Upload URL Generation

```bash
# Set variables
export JWT_TOKEN="your-supabase-jwt-token"
export API_URL="http://localhost:3001"

# Generate upload URL
curl -X POST $API_URL/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-song.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 5242880
  }' | jq

# Expected response:
# {
#   "uploadUrl": "https://...",
#   "filePath": "songs/uuid.mp3"
# }
```

#### Test 2: Reject Invalid MIME Type

```bash
curl -X POST $API_URL/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "evil.exe",
    "fileType": "application/octet-stream",
    "fileSize": 1024
  }' | jq

# Expected response (400 Bad Request):
# {
#   "statusCode": 400,
#   "message": "Invalid file type: application/octet-stream"
# }
```

#### Test 3: Reject Invalid Extension

```bash
curl -X POST $API_URL/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "script.js",
    "fileType": "audio/mpeg",
    "fileSize": 1024
  }' | jq

# Expected response (400 Bad Request):
# {
#   "statusCode": 400,
#   "message": "File extension .js not allowed"
# }
```

#### Test 4: Reject File Size Exceeding Limit

```bash
curl -X POST $API_URL/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "huge-file.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 104857600
  }' | jq

# Expected response (400 Bad Request):
# {
#   "statusCode": 400,
#   "message": "File size exceeds limit of 50MB"
# }
```

#### Test 5: Missing Authentication

```bash
curl -X POST $API_URL/api/v1/songs/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.mp3",
    "fileType": "audio/mpeg"
  }' | jq

# Expected response (401 Unauthorized):
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }
```

### Automated Testing

#### Unit Test Example (Jest)

```typescript
// tests/storage.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { StorageService } from "../src/storage/storage.service";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe("validateFileType", () => {
    it("should accept valid audio MIME types", () => {
      const isValid = service["isValidFileType"]("songs", "audio/mpeg");
      expect(isValid).toBe(true);
    });

    it("should reject invalid MIME types", () => {
      const isValid = service["isValidFileType"]("songs", "text/plain");
      expect(isValid).toBe(false);
    });
  });

  describe("validateExtension", () => {
    it("should accept .mp3 extension", () => {
      const ext = service["getExtension"]("song.mp3");
      expect(ext).toBe(".mp3");
    });

    it("should reject .exe extension", () => {
      expect(() => service["getExtension"]("virus.exe")).toThrow(
        BadRequestException,
      );
    });

    it("should block path traversal attempts", () => {
      expect(() => service["getExtension"]("../../../etc/passwd")).toThrow();
    });
  });
});
```

---

## Troubleshooting

### Issue: "SUPABASE_URL environment variable is required"

**Cause**: Missing environment variables in `.env.local`

**Solution**:

```bash
# 1. Check if .env.local exists
ls -la apps/api/.env.local

# 2. Verify variables are set
cat apps/api/.env.local | grep SUPABASE

# 3. Restart development server
cd apps/api
npm run dev
```

### Issue: "Failed to generate upload URL: Bucket not found"

**Cause**: Supabase storage buckets not created

**Solution**:

1. Go to Supabase Dashboard → Storage
2. Create two buckets:
   - Name: `songs` (Public)
   - Name: `images` (Public)
3. Set both to public access

### Issue: "Invalid file type" for valid audio file

**Cause**: Browser not sending correct MIME type

**Solution**:

```typescript
// Explicitly specify MIME type
const file = new File([blob], "song.mp3", { type: "audio/mpeg" });

// Or use fetch headers
fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "audio/mpeg", // Explicit
  },
  body: file,
});
```

### Issue: Presigned URL expires before upload completes

**Cause**: Supabase presigned URLs valid for 1 hour; slow uploads timeout

**Solution**:

```typescript
// Request new URL for large uploads
if (totalUploadTime > 50 * 60 * 1000) {
  // 50 minutes
  const { uploadUrl: newUrl } = await requestUploadUrl(file, token);
  // Resume with new URL
}
```

### Issue: "File extension not allowed" for valid audio file

**Cause**: File extension not in allowed list

**Solution**: Check allowed extensions in `StorageService`:

```typescript
// Currently supported:
// Audio: .mp3, .wav, .ogg, .flac
// Images: .jpg, .jpeg, .png, .webp, .gif

// To add new format:
// 1. Add MIME type to ALLOWED_AUDIO_TYPES or ALLOWED_IMAGE_TYPES
// 2. Add extension to allowedExtensions array
// 3. Update documentation
```

---

## Migration from Direct Upload

### If you previously had direct file uploads:

**Before Phase 02** (Vercel limit enforced):

```typescript
@Post('upload')
async uploadFile(@Body() file: Express.Multer.File) {
  // ❌ Limited to 4.5MB by Vercel
  // ❌ Blocks server during upload
  // ❌ Wastes API resources
}
```

**After Phase 02** (Presigned URL):

```typescript
@Post('upload-url')
async getUploadUrl(@Body() dto: SongUploadUrlDto) {
  // ✅ Supports up to 50MB
  // ✅ Direct Supabase upload
  // ✅ Server just validates and delegates
  return this.storage.generateUploadUrl({
    bucket: 'songs',
    fileName: dto.fileName,
    fileType: dto.fileType,
    fileSize: dto.fileSize,
    maxSizeBytes: 50 * 1024 * 1024,
  });
}
```

### Migration Steps for Clients:

1. **Get upload URL** (authenticated):

   ```
   POST /api/v1/songs/upload-url
   Authorization: Bearer <token>
   {fileName, fileType, fileSize}
   ```

2. **Upload file** (no authentication needed):

   ```
   PUT <uploadUrl>
   Content-Type: <fileType>
   <binary file data>
   ```

3. **Create metadata**:
   ```
   POST /api/v1/songs
   Authorization: Bearer <token>
   {filePath, title, artist, ...}
   ```

---

## Summary

Phase 02 successfully implements presigned URL file upload with:

✅ **Security**:

- MIME type validation (XSS prevention)
- Extension validation (path traversal prevention)
- File size limits (DoS prevention)
- Environment validation

✅ **Architecture**:

- Global StorageModule for reusability
- Clean separation of concerns
- Type-safe DTOs
- Consistent error handling

✅ **Scalability**:

- 50MB audio limit (vs 4.5MB Vercel)
- 5MB image limit (reasonable for thumbnails)
- Direct Supabase upload (no server bottleneck)
- Support for concurrent uploads

✅ **Developer Experience**:

- Clear API documentation
- Example code in TypeScript/JavaScript
- Complete troubleshooting guide
- Easy to extend with new file types

---

**Files Modified**:

- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/storage.service.ts` (new)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/storage.module.ts` (new)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/storage/dto/upload-url-response.dto.ts` (new)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/songs/dto/upload-url.dto.ts` (new)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/images/dto/upload-url.dto.ts` (new)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/songs/songs.service.ts` (modified)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/songs/songs.controller.ts` (modified)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/images/images.service.ts` (modified)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/images/images.controller.ts` (modified)
- `/Users/kaitovu/Desktop/Projects/love-days/apps/api/src/app.module.ts` (modified)

**Last Updated**: 2025-12-29
**Status**: ✅ Phase 02 Complete
