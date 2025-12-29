# Love Days API Reference

**Version**: 1.0.0
**Base URL**:

- Development: `http://localhost:3001`
- Production: `https://love-days-api.vercel.app`
- Swagger Docs: `/api/docs`

**Status**: Phase 1 Complete - Metadata Operations Only

---

## Authentication

All protected endpoints require a Supabase JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

**Getting a Token**:

1. Sign up/login via Supabase Auth
2. Copy JWT token from Supabase Auth response
3. Include in `Authorization` header

**Token Validation Flow**:

1. Client sends request with Bearer token
2. `SupabaseAuthGuard` validates token
3. If valid: Request processed, User attached to request context
4. If invalid: Returns `401 Unauthorized`

**Scopes** (Phase 1):

- Public endpoints: No token required
- Admin endpoints: Valid Supabase JWT required

---

## Songs Endpoints

### List Songs

List all published songs (public endpoint).

**Endpoint**: `GET /api/v1/songs`

**Query Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| published | boolean | No | Filter by published status (default: true) |

**Response**: 200 OK

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Autumn Leaves",
    "artist": "Ed Sheeran",
    "album": "x",
    "duration": 264,
    "filePath": "songs/123-autumn-leaves.mp3",
    "fileSize": 5242880,
    "thumbnailPath": "songs/thumbnails/123-autumn.jpg",
    "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/123-autumn-leaves.mp3",
    "thumbnailUrl": "https://[project].supabase.co/storage/v1/object/public/songs/thumbnails/123-autumn.jpg",
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-29T10:00:00.000Z",
    "published": true
  }
]
```

**Example Requests**:

```bash
# List all published songs
curl http://localhost:3001/api/v1/songs

# List unpublished songs (draft)
curl http://localhost:3001/api/v1/songs?published=false
```

---

### Get Song by ID

Get details for a specific song (public endpoint).

**Endpoint**: `GET /api/v1/songs/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Song unique identifier |

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Autumn Leaves",
  "artist": "Ed Sheeran",
  "album": "x",
  "duration": 264,
  "filePath": "songs/123-autumn-leaves.mp3",
  "fileSize": 5242880,
  "thumbnailPath": "songs/thumbnails/123-autumn.jpg",
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/123-autumn-leaves.mp3",
  "thumbnailUrl": "https://[project].supabase.co/storage/v1/object/public/songs/thumbnails/123-autumn.jpg",
  "createdAt": "2025-12-29T10:00:00.000Z",
  "updatedAt": "2025-12-29T10:00:00.000Z",
  "published": true
}
```

**Error Responses**:

404 Not Found

```json
{
  "statusCode": 404,
  "message": "Song not found"
}
```

**Example Request**:

```bash
curl http://localhost:3001/api/v1/songs/550e8400-e29b-41d4-a716-446655440000
```

---

### Create Song

Create a new song metadata entry (admin only).

**Endpoint**: `POST /api/v1/songs`

**Authentication**: Required (Bearer token)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Song title (max 255 chars) |
| artist | string | Yes | Artist name (max 255 chars) |
| album | string | No | Album name (max 255 chars) |
| filePath | string | Yes | Supabase Storage path (e.g., `songs/123-song.mp3`) |
| fileSize | number | No | File size in bytes |
| thumbnailPath | string | No | Supabase Storage thumbnail path |

**Response**: 201 Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "New Song",
  "artist": "Artist Name",
  "album": "Album Name",
  "filePath": "songs/456-new-song.mp3",
  "fileSize": 4194304,
  "thumbnailPath": null,
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/456-new-song.mp3",
  "thumbnailUrl": null,
  "createdAt": "2025-12-29T10:30:00.000Z",
  "updatedAt": "2025-12-29T10:30:00.000Z",
  "published": false
}
```

**Error Responses**:

401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Missing or invalid authorization header"
}
```

400 Bad Request (Validation Error)

```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "artist should not be empty"],
  "error": "Bad Request"
}
```

**Example Request**:

```bash
curl -X POST http://localhost:3001/api/v1/songs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "filePath": "songs/456-song.mp3",
    "fileSize": 5242880
  }'
```

---

### Update Song

Update song metadata (admin only).

**Endpoint**: `PATCH /api/v1/songs/:id`

**Authentication**: Required (Bearer token)

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Song unique identifier |

**Request Body** (all optional):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | New song title |
| artist | string | No | New artist name |
| album | string | No | New album name |
| thumbnailPath | string | No | New thumbnail path |

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "artist": "Updated Artist",
  "album": "Album Name",
  "filePath": "songs/456-song.mp3",
  "fileSize": 5242880,
  "thumbnailPath": "songs/thumbnails/456-thumb.jpg",
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/456-song.mp3",
  "thumbnailUrl": "https://[project].supabase.co/storage/v1/object/public/songs/thumbnails/456-thumb.jpg",
  "createdAt": "2025-12-29T10:30:00.000Z",
  "updatedAt": "2025-12-29T11:00:00.000Z",
  "published": false
}
```

**Example Request**:

```bash
curl -X PATCH http://localhost:3001/api/v1/songs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "artist": "Updated Artist"
  }'
```

---

### Delete Song

Delete a song and its metadata (admin only).

**Endpoint**: `DELETE /api/v1/songs/:id`

**Authentication**: Required (Bearer token)

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Song unique identifier |

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Deleted Song",
  "artist": "Artist Name",
  "album": "Album Name",
  "filePath": "songs/456-song.mp3",
  "fileSize": 5242880,
  "thumbnailPath": null,
  "createdAt": "2025-12-29T10:30:00.000Z",
  "updatedAt": "2025-12-29T11:00:00.000Z",
  "published": false
}
```

**Error Responses**:

404 Not Found

```json
{
  "statusCode": 404,
  "message": "Song not found"
}
```

**Example Request**:

```bash
curl -X DELETE http://localhost:3001/api/v1/songs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Publish Song

Publish or unpublish a song (admin only).

**Endpoint**: `POST /api/v1/songs/:id/publish`

**Authentication**: Required (Bearer token)

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Song unique identifier |

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| published | boolean | Yes | Publication status (true = published, false = draft) |

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "filePath": "songs/456-song.mp3",
  "fileSize": 5242880,
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/songs/456-song.mp3",
  "createdAt": "2025-12-29T10:30:00.000Z",
  "updatedAt": "2025-12-29T11:15:00.000Z",
  "published": true
}
```

**Example Request**:

```bash
# Publish
curl -X POST http://localhost:3001/api/v1/songs/550e8400-e29b-41d4-a716-446655440000/publish \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"published": true}'

# Unpublish (draft)
curl -X POST http://localhost:3001/api/v1/songs/550e8400-e29b-41d4-a716-446655440000/publish \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"published": false}'
```

---

## Images Endpoints

### List Images

List images with optional category filter (public endpoint).

**Endpoint**: `GET /api/v1/images`

**Query Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| category | string | No | Filter by category: `profile`, `background`, `gallery` |

**Response**: 200 OK

```json
[
  {
    "id": "660f9511-f40c-52e5-b827-557766551111",
    "title": "Profile Picture",
    "description": "Main profile photo",
    "filePath": "images/123-profile.jpg",
    "fileSize": 1024000,
    "width": 500,
    "height": 500,
    "category": "profile",
    "fileUrl": "https://[project].supabase.co/storage/v1/object/public/images/123-profile.jpg",
    "createdAt": "2025-12-29T09:00:00.000Z",
    "updatedAt": "2025-12-29T09:00:00.000Z",
    "published": true
  }
]
```

**Example Requests**:

```bash
# List all images
curl http://localhost:3001/api/v1/images

# List profile pictures only
curl http://localhost:3001/api/v1/images?category=profile

# List background images only
curl http://localhost:3001/api/v1/images?category=background
```

---

### Get Image by ID

Get details for a specific image (public endpoint).

**Endpoint**: `GET /api/v1/images/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Image unique identifier |

**Response**: 200 OK

```json
{
  "id": "660f9511-f40c-52e5-b827-557766551111",
  "title": "Profile Picture",
  "description": "Main profile photo",
  "filePath": "images/123-profile.jpg",
  "fileSize": 1024000,
  "width": 500,
  "height": 500,
  "category": "profile",
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/images/123-profile.jpg",
  "createdAt": "2025-12-29T09:00:00.000Z",
  "updatedAt": "2025-12-29T09:00:00.000Z",
  "published": true
}
```

**Example Request**:

```bash
curl http://localhost:3001/api/v1/images/660f9511-f40c-52e5-b827-557766551111
```

---

### Create Image

Create a new image metadata entry (admin only).

**Endpoint**: `POST /api/v1/images`

**Authentication**: Required (Bearer token)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Image title (max 255 chars) |
| description | string | No | Image description |
| filePath | string | Yes | Supabase Storage path (e.g., `images/123-image.jpg`) |
| fileSize | number | No | File size in bytes |
| width | number | No | Image width in pixels |
| height | number | No | Image height in pixels |
| category | string | Yes | Category: `profile`, `background`, or `gallery` |

**Response**: 201 Created

```json
{
  "id": "660f9511-f40c-52e5-b827-557766551111",
  "title": "Background Image",
  "description": "Beautiful sunset background",
  "filePath": "images/456-sunset.jpg",
  "fileSize": 2048000,
  "width": 1920,
  "height": 1080,
  "category": "background",
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/images/456-sunset.jpg",
  "createdAt": "2025-12-29T10:45:00.000Z",
  "updatedAt": "2025-12-29T10:45:00.000Z",
  "published": false
}
```

**Error Responses**:

401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "category should be one of the following values: profile, background, gallery"
  ],
  "error": "Bad Request"
}
```

**Example Request**:

```bash
curl -X POST http://localhost:3001/api/v1/images \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Profile Photo",
    "description": "Main profile picture",
    "filePath": "images/789-profile.jpg",
    "fileSize": 1536000,
    "width": 600,
    "height": 600,
    "category": "profile"
  }'
```

---

### Update Image

Update image metadata (admin only).

**Endpoint**: `PATCH /api/v1/images/:id`

**Authentication**: Required (Bearer token)

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Image unique identifier |

**Request Body** (all optional):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | New image title |
| description | string | No | New image description |
| category | string | No | New category (`profile`, `background`, `gallery`) |

**Response**: 200 OK

```json
{
  "id": "660f9511-f40c-52e5-b827-557766551111",
  "title": "Updated Title",
  "description": "Updated description",
  "filePath": "images/456-sunset.jpg",
  "fileSize": 2048000,
  "width": 1920,
  "height": 1080,
  "category": "gallery",
  "fileUrl": "https://[project].supabase.co/storage/v1/object/public/images/456-sunset.jpg",
  "createdAt": "2025-12-29T10:45:00.000Z",
  "updatedAt": "2025-12-29T11:20:00.000Z",
  "published": false
}
```

**Example Request**:

```bash
curl -X PATCH http://localhost:3001/api/v1/images/660f9511-f40c-52e5-b827-557766551111 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "category": "gallery"
  }'
```

---

### Delete Image

Delete an image and its metadata (admin only).

**Endpoint**: `DELETE /api/v1/images/:id`

**Authentication**: Required (Bearer token)

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string (UUID) | Yes | Image unique identifier |

**Response**: 200 OK

```json
{
  "id": "660f9511-f40c-52e5-b827-557766551111",
  "title": "Deleted Image",
  "description": "Was a great image",
  "filePath": "images/456-sunset.jpg",
  "fileSize": 2048000,
  "width": 1920,
  "height": 1080,
  "category": "gallery",
  "createdAt": "2025-12-29T10:45:00.000Z",
  "updatedAt": "2025-12-29T11:20:00.000Z",
  "published": true
}
```

**Example Request**:

```bash
curl -X DELETE http://localhost:3001/api/v1/images/660f9511-f40c-52e5-b827-557766551111 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning      | Cause                                   |
| ---- | ------------ | --------------------------------------- |
| 200  | OK           | Successful request                      |
| 201  | Created      | Resource successfully created           |
| 400  | Bad Request  | Invalid input data (validation failure) |
| 401  | Unauthorized | Missing or invalid authentication token |
| 404  | Not Found    | Resource not found                      |
| 500  | Server Error | Internal server error                   |

### Error Response Format

All errors return JSON with structure:

```json
{
  "statusCode": 400,
  "message": "Error description or array of validation messages",
  "error": "Error Type"
}
```

**Example Validation Error**:

```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "artist should not be empty"],
  "error": "Bad Request"
}
```

**Example Authentication Error**:

```json
{
  "statusCode": 401,
  "message": "Missing or invalid authorization header",
  "error": "Unauthorized"
}
```

---

## Rate Limiting

**Phase 1**: No rate limiting implemented (added in future phases)

---

## Data Types

### Song Object

```typescript
{
  id: string;              // UUID
  title: string;           // Max 255 characters
  artist: string;          // Max 255 characters
  album?: string;          // Max 255 characters
  duration?: number;       // Duration in seconds
  filePath: string;        // Supabase storage path
  fileSize?: number;       // File size in bytes
  thumbnailPath?: string;  // Supabase storage path
  fileUrl: string;         // Public Supabase URL
  thumbnailUrl?: string;   // Public Supabase URL
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
  published: boolean;      // Publication status
}
```

### Image Object

```typescript
{
  id: string;            // UUID
  title: string;         // Max 255 characters
  description?: string;  // Optional description
  filePath: string;      // Supabase storage path
  fileSize?: number;     // File size in bytes
  width?: number;        // Image width in pixels
  height?: number;       // Image height in pixels
  category: string;      // "profile" | "background" | "gallery"
  fileUrl: string;       // Public Supabase URL
  createdAt: string;     // ISO 8601 datetime
  updatedAt: string;     // ISO 8601 datetime
  published: boolean;    // Publication status
}
```

---

## Coming in Phase 2

- Presigned URL file upload endpoints
- Direct Supabase Storage integration
- Image thumbnail generation (Sharp)
- File validation (type, size)
- Upload progress tracking

---

## Support

For issues or questions:

1. Check Swagger docs: `http://localhost:3001/api/docs`
2. Review error messages and status codes
3. Check API logs: `npm run dev` console output
4. Check database: `npx prisma studio`

---

**Last Updated**: 2025-12-29
**API Version**: 1.0.0
