# Supabase Integration Documentation

This document provides comprehensive documentation for the Supabase integration in the Love Days project, covering storage structure, data models, and implementation patterns.

## Overview

Love Days uses Supabase primarily for **audio file storage** rather than database operations. The integration is focused on serving audio files through Supabase Storage with a simple, static data model approach.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │───▶│  Supabase       │───▶│   Audio Files   │
│   (Client)      │    │  Storage        │    │   (songs/)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Static Song    │
│  Metadata       │
│  (utils/songs)  │
└─────────────────┘
```

## Configuration

### Environment Variables

```bash
# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Location**: `apps/web/.env.local`

**Security Notes**:

- Uses `NEXT_PUBLIC_*` prefix for client-side access
- Anon key is safe for client-side use (public bucket access)
- No database authentication required for storage-only access

### Storage URL Construction

```typescript
// packages/utils/src/songs.ts
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs`
  : "";

const createSongUrl = (filename: string): string => {
  if (!supabaseStorageUrl) {
    console.error(
      "Supabase URL not configured. Please check your environment variables.",
    );
    return "";
  }
  return `${supabaseStorageUrl}/${encodeURIComponent(filename)}`;
};
```

## Storage Structure

### Bucket Configuration

**Bucket Name**: `songs`  
**Access Level**: **Public** (no authentication required)  
**Purpose**: Store audio files (.mp3) for the music player

### File Naming Convention

```
songs/
├── The One - Kodaline.mp3
├── All Of Me - John Legend.mp3
├── Make You Feel My Love - Adele.mp3
├── I Do - 911.mp3
├── Wake Me Up When September Ends - Green D.mp3
├── Can't Take My Eyes Off You.mp3
├── Say You Won't Let Go - James Arthur.mp3
├── Love Someone - Lukas Graham.mp3
├── I'm Yours - Jason Mraz.mp3
├── Perfect - Ed Sheeran.mp3
├── Perfect - Cover by Tanner Patrick.mp3
├── You Are The Reason - Calum Scott.mp3
├── Always - Isak Danielson.mp3
├── Little Things - One Direction.mp3
├── I Know You Know - Unknown.mp3
└── Munn - Loved Us More.mp3
```

**Pattern**: `{Title} - {Artist}.mp3`  
**Encoding**: URL-encoded when accessed via API

## Data Models

### ISong Interface

```typescript
// packages/utils/src/types.ts
export interface ISong {
  id: string; // Unique identifier (kebab-case)
  name: string; // Display name/title
  author: string; // Artist name (can be empty)
  audio: string; // Full Supabase Storage URL
  img: string; // Album artwork URL (external)
  duration?: string; // Optional duration string
}
```

### Song Data Structure

**Storage**: Static array in `packages/utils/src/songs.ts`  
**Total Songs**: 15 tracks  
**Data Source**: Hardcoded with external album artwork URLs

**Example Entry**:

```typescript
{
  id: "the-one-kodaline",
  name: "The One",
  author: "Kodaline",
  audio: createSongUrl("The One - Kodaline.mp3"),
  img: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/The_One_single_cover.png/220px-The_One_single_cover.png",
}
```

## Integration Patterns

### Client-Side Audio Loading

```typescript
// apps/web/components/Player/index.tsx
const [currentPlay, setCurrentPlay] = useState<ISong>(songs[0]);

// Audio element with Supabase URL
<audio
  ref={playerRef}
  onEnded={nextSong}
  src={currentPlay.audio}  // Supabase Storage URL
  autoPlay
  className={styles.audioPlayer}
>
```

### URL Generation

```typescript
// Helper function handles URL construction and encoding
const createSongUrl = (filename: string): string => {
  if (!supabaseStorageUrl) {
    console.error(
      "Supabase URL not configured. Please check your environment variables.",
    );
    return "";
  }
  return `${supabaseStorageUrl}/${encodeURIComponent(filename)}`;
};
```

### Error Handling

```typescript
// Graceful degradation when Supabase URL is missing
if (!supabaseStorageUrl) {
  console.error(
    "Supabase URL not configured. Please check your environment variables.",
  );
  return "";
}
```

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to **Storage** → **Buckets**
3. Create a new bucket named `songs`
4. Set bucket to **Public** access
5. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Audio File Upload

1. Access Supabase Dashboard → Storage → songs bucket
2. Upload MP3 files following naming convention: `{Title} - {Artist}.mp3`
3. Ensure files are publicly accessible
4. Verify URLs work: `https://your-project.supabase.co/storage/v1/object/public/songs/filename.mp3`

### 3. Environment Configuration

```bash
# Copy and update environment file
cp apps/web/.env.sample apps/web/.env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 4. Song Metadata Updates

Update `packages/utils/src/songs.ts` to match your uploaded files:

```typescript
export const songs: Array<ISong> = [
  {
    id: "your-song-id",
    name: "Your Song Title",
    author: "Artist Name",
    audio: createSongUrl("Your Song Title - Artist Name.mp3"),
    img: "https://external-artwork-url.com/image.jpg",
  },
  // ... more songs
];
```

## Integration Benefits

### Advantages

- **Simple Setup**: No database schema or authentication required
- **CDN Performance**: Supabase provides global CDN for audio files
- **Scalability**: Handles audio streaming efficiently
- **Cost Effective**: Pay-per-use storage model
- **Client-Side**: Direct browser access without server proxy

### Limitations

- **Static Data**: Song metadata hardcoded in application
- **No Dynamic Updates**: Requires code changes to add/remove songs
- **No User Data**: No playlists, favorites, or user-specific features
- **No Analytics**: No playback tracking or user behavior data

## Migration Considerations

### To Full Database Integration

If you want to add dynamic song management:

1. **Enable Database**: Add Supabase database tables
2. **Song Metadata Table**:
   ```sql
   CREATE TABLE songs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     artist TEXT,
     filename TEXT NOT NULL,
     duration INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. **API Routes**: Add Next.js API routes for CRUD operations
4. **Dynamic Loading**: Replace static imports with API calls

### To Advanced Features

- **User Management**: Add Supabase Auth for user accounts
- **Playlists**: Add user-specific playlist tables
- **Upload Management**: Add admin interface for file uploads
- **Metadata Extraction**: Add duration calculation from uploaded files

## Troubleshooting

### Common Issues

**1. Audio Not Loading**

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify bucket access
curl https://your-project.supabase.co/storage/v1/object/public/songs/
```

**2. CORS Errors**

- Ensure bucket is set to **Public** access
- Verify anon key has storage read permissions
- Check browser network tab for 403/404 errors

**3. File Not Found**

- Verify filename matches exactly (case-sensitive)
- Check URL encoding for special characters
- Ensure file exists in `songs` bucket

### Performance Optimization

**Preloading**:

```typescript
// Preload next song in playlist
useEffect(() => {
  const nextSong = songs[(currentIndex + 1) % songs.length];
  const audio = new Audio(nextSong.audio);
  audio.preload = "metadata";
}, [currentIndex]);
```

**Caching**:

- Supabase Storage includes CDN caching automatically
- Browser caches audio files after first load
- Consider service worker for offline playback

## Security Considerations

### Current Setup (Storage-Only)

- ✅ **Safe**: Anon key exposure acceptable for public storage
- ✅ **No Sensitive Data**: No user data or private content
- ✅ **Read-Only**: Client cannot modify storage contents

### If Adding Database Features

- 🔒 **Row Level Security**: Enable RLS for user data tables
- 🔒 **API Keys**: Use service role key for server-side operations only
- 🔒 **Input Validation**: Sanitize all user inputs
- 🔒 **Rate Limiting**: Implement request limits for API routes

## Monitoring & Analytics

Currently no built-in analytics. Consider adding:

- **Playback Events**: Track play/pause/skip actions
- **Popular Songs**: Monitor most played tracks
- **Error Tracking**: Log failed audio loads
- **Performance**: Monitor load times and buffering

```typescript
// Example analytics integration
const trackPlayEvent = (songId: string) => {
  // Send to your analytics service
  analytics.track("song_played", {
    song_id: songId,
    timestamp: new Date().toISOString(),
  });
};
```
