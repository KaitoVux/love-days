# Phase 02: Presigned URL Upload - Quick Reference

**Status**: ✅ Complete
**Date**: 2025-12-29
**Key Change**: File upload via presigned URLs (bypass 4.5MB Vercel limit)

---

## What Changed

### New Files (5)

1. `apps/api/src/storage/storage.service.ts` - Core presigned URL logic
2. `apps/api/src/storage/storage.module.ts` - Global module
3. `apps/api/src/storage/dto/upload-url-response.dto.ts` - Shared response DTO
4. `apps/api/src/songs/dto/upload-url.dto.ts` - Song upload request DTO
5. `apps/api/src/images/dto/upload-url.dto.ts` - Image upload request DTO

### Modified Files (4)

1. `apps/api/src/app.module.ts` - Import StorageModule
2. `apps/api/src/songs/songs.service.ts` - Add generateUploadUrl method
3. `apps/api/src/songs/songs.controller.ts` - Add POST /upload-url endpoint
4. `apps/api/src/images/images.service.ts` - Add generateUploadUrl method
5. `apps/api/src/images/images.controller.ts` - Add POST /upload-url endpoint

---

## Architecture Overview

```
Client Request
    ↓
POST /api/v1/songs/upload-url
    ↓
SongsController → SongsService → StorageService
    ↓
Validate: MIME type, extension, file size
    ↓
Generate UUID path: 550e8400-e29b-41d4-a716-446655440000.mp3
    ↓
Call Supabase: createSignedUploadUrl()
    ↓
Return: {uploadUrl, filePath}
    ↓
Client uploads directly to Supabase using uploadUrl
    ↓
Client creates metadata: POST /api/v1/songs {filePath, title, ...}
```

---

## API Endpoints

### Generate Song Upload URL

```http
POST /api/v1/songs/upload-url
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fileName": "my-song.mp3",
  "fileType": "audio/mpeg",
  "fileSize": 15728640
}

Response: 201 Created
{
  "uploadUrl": "https://[project].supabase.co/storage/v1/object/public/songs/uuid.mp3?token=...",
  "filePath": "songs/uuid.mp3"
}
```

### Generate Image Upload URL

```http
POST /api/v1/images/upload-url
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2097152
}

Response: 201 Created
{
  "uploadUrl": "https://[project].supabase.co/storage/v1/object/public/images/uuid.jpg?token=...",
  "filePath": "images/uuid.jpg"
}
```

---

## File Size & Type Limits

| Type      | MIME Types                                              | Extensions                     | Max Size |
| --------- | ------------------------------------------------------- | ------------------------------ | -------- |
| **Audio** | audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/flac | .mp3, .wav, .ogg, .flac        | 50MB     |
| **Image** | image/jpeg, image/png, image/webp, image/gif            | .jpg, .jpeg, .png, .webp, .gif | 5MB      |

---

## Security Features

### 1. MIME Type Validation

```typescript
// Only whitelisted types accepted
ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', ...]
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', ...]
```

Prevents: Uploading .html files as audio/image (XSS)

### 2. Extension Validation

```typescript
// Only specific extensions allowed
allowedExtensions = ['.mp3', '.wav', '.jpg', '.png', ...]
// Sanitizes: Removes special characters (blocks path traversal)
// Pattern: ../../../etc/passwd → blocked
```

Prevents: Path traversal attacks (../../../)

### 3. File Size Validation

```typescript
// Before presigned URL generation
if (fileSize > maxSizeBytes) {
  throw new BadRequestException(
    `Exceeds limit of ${maxSizeBytes / 1024 / 1024}MB`,
  );
}
```

Prevents: Storage exhaustion attacks (DoS)

### 4. Unique Path Generation

```typescript
// UUID v4 + extension
const filePath = `${randomUUID()}${extension}`;
// Result: 550e8400-e29b-41d4-a716-446655440000.mp3
```

Prevents: Filename collisions and overwrites

---

## Implementation Pattern

### Step 1: Request Presigned URL (Backend)

```typescript
// SongsService.generateUploadUrl()
const uploadUrl = await storageService.generateUploadUrl({
  bucket: "songs",
  fileName: "song.mp3",
  fileType: "audio/mpeg",
  fileSize: 15728640,
  maxSizeBytes: 50 * 1024 * 1024,
});
// Returns: {uploadUrl, filePath}
```

### Step 2: Upload File (Client)

```typescript
// Direct to Supabase (no server involved)
fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": "audio/mpeg" },
  body: file,
});
```

### Step 3: Create Metadata (Backend)

```typescript
// After successful file upload
POST /api/v1/songs
{
  "filePath": "songs/uuid.mp3",
  "title": "My Song",
  "artist": "Artist Name",
  "album": "Album"
}
```

---

## Code Examples

### JavaScript/TypeScript - Get Upload URL

```typescript
const response = await fetch("/api/v1/songs/upload-url", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fileName: "song.mp3",
    fileType: "audio/mpeg",
    fileSize: file.size,
  }),
});

const { uploadUrl, filePath } = await response.json();
```

### JavaScript/TypeScript - Upload File

```typescript
const uploadResponse = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "audio/mpeg",
  },
  body: file,
});

if (uploadResponse.ok) {
  console.log("File uploaded successfully");
}
```

### JavaScript/TypeScript - Create Metadata

```typescript
const createResponse = await fetch("/api/v1/songs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    filePath, // From uploadUrl response
    title: "Song Title",
    artist: "Artist",
    album: "Album",
    duration: 0,
  }),
});

const song = await createResponse.json();
```

### cURL Examples

```bash
# 1. Get upload URL
curl -X POST http://localhost:3001/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "song.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 15728640
  }'

# 2. Upload file (using presigned URL from step 1)
curl -X PUT $UPLOAD_URL \
  -H "Content-Type: audio/mpeg" \
  --data-binary @song.mp3

# 3. Create metadata
curl -X POST http://localhost:3001/api/v1/songs \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "songs/550e8400-e29b-41d4-a716-446655440000.mp3",
    "title": "Song Title",
    "artist": "Artist",
    "album": "Album",
    "duration": 0
  }'
```

---

## Error Handling

### Common Errors

| Status | Error                           | Cause                 | Solution                                    |
| ------ | ------------------------------- | --------------------- | ------------------------------------------- |
| 400    | File size exceeds limit of 50MB | Uploading file > 50MB | Split into chunks or reduce size            |
| 400    | Invalid file type: text/plain   | Wrong MIME type       | Specify correct MIME type in request        |
| 400    | File extension .exe not allowed | Unsupported extension | Use .mp3, .wav, .jpg, .png, etc.            |
| 401    | Unauthorized                    | Missing/invalid token | Include valid JWT in Authorization header   |
| 500    | Failed to generate upload URL   | Supabase error        | Check SUPABASE_URL and SUPABASE_SERVICE_KEY |

---

## Environment Setup

**Required in `.env.local`**:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Validation**: Checked at application startup (fail-fast pattern)

---

## Testing Locally

### 1. Start API Server

```bash
cd /Users/kaitovu/Desktop/Projects/love-days
npm run dev
```

### 2. Get JWT Token

```bash
# Via Supabase Dashboard or auth provider
export JWT="your-supabase-jwt-token"
```

### 3. Test Valid Upload URL Generation

```bash
curl -X POST http://localhost:3001/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 5242880
  }' | jq
```

### 4. Test Invalid MIME Type (Should Fail)

```bash
curl -X POST http://localhost:3001/api/v1/songs/upload-url \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "evil.txt",
    "fileType": "text/plain",
    "fileSize": 1024
  }' | jq
# Expected: 400 Bad Request - "Invalid file type"
```

---

## Module Dependencies

### StorageModule (Global)

```typescript
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
```

- Singleton across entire application
- Available to all modules without import

### Dependency Injection

```typescript
// SongsService
constructor(
  private prisma: PrismaService,
  private storage: StorageService, // Injected by NestJS
) {}

// ImagesService
constructor(
  private prisma: PrismaService,
  private storage: StorageService, // Injected by NestJS
) {}
```

---

## File Organization

```
apps/api/src/
├── storage/
│   ├── storage.service.ts              # 157 lines
│   ├── storage.module.ts               # 9 lines
│   └── dto/
│       └── upload-url-response.dto.ts  # 12 lines
├── songs/
│   ├── songs.service.ts                # 110 lines (modified)
│   ├── songs.controller.ts             # 89 lines (modified)
│   └── dto/
│       ├── create-song.dto.ts
│       ├── update-song.dto.ts
│       └── upload-url.dto.ts           # 19 lines (NEW)
├── images/
│   ├── images.service.ts               # 97 lines (modified)
│   ├── images.controller.ts            # 92 lines (modified)
│   └── dto/
│       ├── create-image.dto.ts
│       ├── update-image.dto.ts
│       └── upload-url.dto.ts           # 19 lines (NEW)
└── app.module.ts                       # 19 lines (modified)
```

---

## Key Methods

### StorageService.generateUploadUrl()

```typescript
async generateUploadUrl(options: {
  bucket: string,           // 'songs' | 'images'
  fileName: string,         // Original filename
  fileType: string,         // MIME type
  fileSize?: number,        // File size in bytes
  maxSizeBytes?: number,    // Max allowed size
}): Promise<{
  uploadUrl: string,        // Presigned URL for PUT
  filePath: string,         // Path for metadata
}>
```

### StorageService.getPublicUrl()

```typescript
getPublicUrl(bucket: string, filePath: string): string
// Returns: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
```

### StorageService.deleteFile()

```typescript
async deleteFile(bucket: string, filePath: string): Promise<void>
// Deletes file from Supabase storage
```

---

## Validation Flow

```
Client submits: {fileName: "song.mp3", fileType: "audio/mpeg", fileSize: 15MB}
    ↓
StorageService.generateUploadUrl()
    ├─ Check fileSize ≤ maxSizeBytes (50MB)? → 400 if exceeds
    ├─ Check fileType in ALLOWED_AUDIO_TYPES? → 400 if invalid
    ├─ Extract extension from fileName? → get ".mp3"
    ├─ Check extension in allowedExtensions? → 400 if blocked
    ├─ Sanitize extension (remove special chars)?
    ├─ Generate UUID: 550e8400-e29b-41d4-a716-446655440000
    ├─ Create path: 550e8400-e29b-41d4-a716-446655440000.mp3
    ├─ Call Supabase.createSignedUploadUrl(path)
    └─ Return {uploadUrl, filePath}
```

---

## Comparison: Before vs After

| Aspect              | Before (Phase 01)           | After (Phase 02)                      |
| ------------------- | --------------------------- | ------------------------------------- |
| **Upload Method**   | POST to API server          | PUT to Supabase (presigned)           |
| **File Size Limit** | 4.5MB (Vercel)              | 50MB audio, 5MB images                |
| **Server Load**     | High (binary data transfer) | Low (just validates)                  |
| **Response Speed**  | Slow (full upload time)     | Fast (just validation)                |
| **Scalability**     | Limited by server           | Unlimited (Supabase)                  |
| **Security**        | Basic checks                | MIME type, extension, size validation |

---

## Next Steps

1. **Frontend Integration**: Update web app to use presigned URLs
2. **Progress Tracking**: Add upload progress indication (% complete)
3. **Retry Logic**: Handle failed uploads with exponential backoff
4. **Audio Metadata**: Extract duration from uploaded files
5. **Thumbnail Generation**: Auto-generate image thumbnails

---

## Related Documentation

- **Full Details**: [PHASE02_PRESIGNED_URL_UPLOAD.md](./PHASE02_PRESIGNED_URL_UPLOAD.md)
- **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Backend Guide**: [BACKEND_DEVELOPER_GUIDE.md](./BACKEND_DEVELOPER_GUIDE.md)
- **System Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

**Last Updated**: 2025-12-29
**Status**: ✅ Phase 02 Complete - Ready for Frontend Integration
