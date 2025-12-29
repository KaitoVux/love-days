# Supabase Storage Bucket Configuration

This document describes the required Supabase Storage configuration for Phase 2 presigned URL file uploads.

## Required Buckets

### 1. Songs Bucket

**Name**: `songs`
**Settings**:

- Public: Yes
- File size limit: 50MB
- Allowed MIME types: audio/\*

### 2. Images Bucket

**Name**: `images`
**Settings**:

- Public: Yes
- File size limit: 5MB
- Allowed MIME types: image/\*

## Storage Policies (RLS)

Run these SQL commands in Supabase SQL Editor to configure Row Level Security policies:

```sql
-- Songs bucket policy: public read, authenticated upload
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

-- Images bucket policy (same pattern)
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

## Environment Variables

Add the following environment variables to `apps/api/.env`:

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

**Note**: Use the **service role key** (not anon key) for server-side operations. The service role key bypasses RLS policies and should be kept secure.

## Bucket Creation Steps

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. For **songs** bucket:
   - Name: `songs`
   - Check "Public bucket"
   - File size limit: 50MB
   - Allowed MIME types: `audio/*`
4. For **images** bucket:
   - Name: `images`
   - Check "Public bucket"
   - File size limit: 5MB
   - Allowed MIME types: `image/*`
5. Run the SQL policies above in SQL Editor

## Verification

Test the configuration:

1. Generate upload URL:

```bash
curl -X POST http://localhost:3000/api/v1/songs/upload-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"fileName": "test.mp3", "fileType": "audio/mpeg", "fileSize": 1024}'
```

2. Upload file to presigned URL (from response)
3. Verify file is accessible via public URL
