# Phase 02 Onboarding Guide

## Prerequisites

Before deploying Phase 02 (Presigned URL File Upload), ensure the following are configured:

## 1. Environment Variables

Add these variables to `apps/api/.env`:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Database (Already configured in Phase 01)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

**Important:**

- Use **service role key**, not anon key
- Service role key bypasses RLS (required for presigned URL generation)
- Never commit these to git - keep in `.env` only

## 2. Supabase Storage Setup

### Create Buckets

1. Go to Supabase Dashboard → Storage
2. Create two buckets:

**Songs Bucket:**

- Name: `songs`
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: Leave empty (validated by backend)

**Images Bucket:**

- Name: `images`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: Leave empty (validated by backend)

### Configure RLS Policies

Run in Supabase SQL Editor:

```sql
-- Songs bucket policies
CREATE POLICY "Public read songs" ON storage.objects
  FOR SELECT USING (bucket_id = 'songs');

CREATE POLICY "Authenticated upload songs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'songs' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated delete songs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'songs' AND
    auth.role() = 'authenticated'
  );

-- Images bucket policies
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );
```

## 3. Verify Setup

### Local Testing

```bash
# 1. Start development server
npm run dev

# 2. Generate presigned URL (requires JWT token)
curl -X POST http://localhost:3000/api/v1/songs/upload-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fileName": "test.mp3",
    "fileType": "audio/mpeg",
    "fileSize": 1024000
  }'

# Expected response:
# {
#   "uploadUrl": "https://xxx.supabase.co/storage/v1/upload/sign/songs/uuid.mp3?token=...",
#   "filePath": "songs/uuid.mp3"
# }
```

### Upload Test File

```bash
# 3. Upload file to presigned URL (from step 2 response)
curl -X PUT "PASTE_UPLOAD_URL_HERE" \
  -H "Content-Type: audio/mpeg" \
  --data-binary @test.mp3

# 4. Create song metadata
curl -X POST http://localhost:3000/api/v1/songs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Song",
    "artist": "Test Artist",
    "filePath": "songs/uuid.mp3",
    "fileSize": 1024000
  }'
```

## 4. Security Validation

Verify security features are working:

### ✅ MIME Type Validation

```bash
# Should reject (SVG XSS attack)
curl -X POST http://localhost:3000/api/v1/images/upload-url \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fileName": "evil.svg", "fileType": "image/svg+xml"}'
# Expected: 400 Bad Request - Invalid file type
```

### ✅ Extension Validation

```bash
# Should reject (path traversal)
curl -X POST http://localhost:3000/api/v1/songs/upload-url \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fileName": "../../etc/passwd.mp3", "fileType": "audio/mpeg"}'
# Expected: 400 Bad Request - File extension not allowed
```

### ✅ Environment Variables

```bash
# Server should fail to start if env vars missing
# Unset SUPABASE_URL temporarily and run:
npm run dev
# Expected: Error: SUPABASE_URL environment variable is required
```

## 5. Deployment Checklist

- [ ] Environment variables configured in production (Vercel, Railway, etc.)
- [ ] Supabase buckets created (`songs`, `images`)
- [ ] RLS policies applied
- [ ] Test presigned URL generation
- [ ] Test file upload to Supabase
- [ ] Test metadata creation
- [ ] Verify public URLs work
- [ ] Test file deletion

## 6. Next Steps

After Phase 02 is deployed:

1. Proceed to **Phase 03: Admin UI (shadcn Dashboard)**
2. Build upload form UI with progress bar
3. Implement presigned URL flow in frontend
4. Add drag-and-drop file upload

## Troubleshooting

### "Environment variable required" error

- Check `.env` file exists in `apps/api/`
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
- Restart development server

### "Invalid file type" error

- Check MIME type is in allowed list
- Songs: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/flac`
- Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### "Failed to generate upload URL" error

- Verify Supabase service key is correct (not anon key)
- Check bucket exists in Supabase Storage
- Verify RLS policies are applied

### Presigned URL expired

- Default expiry: 60 seconds (Supabase default)
- Regenerate URL if upload takes longer
- Consider implementing retry logic in frontend

## Support

For issues or questions:

- Review: `/docs/2025-12-29/supabase-storage-setup.md`
- Check Supabase Storage logs
- Verify JWT token is valid
