# Phase 4: Testing & Validation Guide

**Quick Start:** Follow this guide to manually test the YouTube integration implementation.

---

## Prerequisites

1. **API Running:** `cd apps/api && npm run dev`
2. **Admin Running:** `cd apps/admin && npm run dev`
3. **Web Running:** `cd apps/web && npm run dev`
4. **YouTube API Key:** Configured in `apps/api/.env`

---

## Test Suite 1: Backend API

### ✅ Test Completed: List Songs Endpoint

**Status:** PASS ✅

**Verification:**

```bash
curl http://localhost:3002/api/v1/songs | jq .
```

**Result:** Successfully returns all songs with proper `sourceType` field.

---

### 🔄 Test Pending: YouTube Import API

**Endpoint:** `POST /api/v1/songs/youtube`

**Why Manual Testing Required:**

- Endpoint requires authentication (Supabase auth guard)
- Best tested via Admin UI workflow

**Alternative Testing:** Use Admin UI (see Test Suite 2 below)

---

## Test Suite 2: Admin UI (RECOMMENDED START HERE)

### Test 2.1: YouTube Import - Happy Path

**Steps:**

1. Open `http://localhost:3001` (Admin app)
2. Navigate to: **Songs → Add Song**
3. Verify "YouTube Import" tab is **selected by default** ✓
4. Paste URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Click **"Import from YouTube"**

**Expected Results:**

- ⏳ Loading spinner shows "Importing..."
- ✅ Success alert: "Song imported successfully! Redirecting..."
- 🔄 Auto-redirect to edit page after 1.5s
- 📝 Metadata fields populated:
  - **Title:** "Never Gonna Give You Up" (or parsed title)
  - **Artist:** "Rick Astley" (or parsed artist)
  - **Duration:** ~212 seconds
  - **Source Type:** "YouTube" (read-only badge)
  - **Thumbnail:** YouTube video thumbnail

**Screenshot Locations:**

- `docs/screenshots/phase-4-admin-youtube-import-success.png`
- `docs/screenshots/phase-4-admin-edit-youtube-song.png`

---

### Test 2.2: YouTube Import - Error Handling

**Test 2.2a: Invalid URL**

**Steps:**

1. Songs → Add Song → YouTube Import tab
2. Paste: `invalid-url-here`
3. Click "Import from YouTube"

**Expected:**

- ❌ Error alert: "Invalid YouTube URL or video ID"
- Form remains on page (no redirect)

---

**Test 2.2b: Video Not Found**

**Steps:**

1. Paste: `https://www.youtube.com/watch?v=INVALIDVIDEO`
2. Click "Import from YouTube"

**Expected:**

- ❌ Error alert: "YouTube video not found: INVALIDVIDEO"

---

**Test 2.2c: Embedding Disabled**

**Steps:**

1. Find a video with embedding disabled (rare)
2. Try to import

**Expected:**

- ❌ Error alert: "Video embedding is disabled by the creator"

---

### Test 2.3: File Upload (Regression Test)

**Steps:**

1. Songs → Add Song
2. Switch to **"File Upload"** tab
3. Upload an MP3 file
4. Fill metadata manually
5. Submit

**Expected:**

- Traditional upload flow works exactly as before
- No regressions or errors

---

### Test 2.4: Edit Song Metadata

**Test 2.4a: Edit YouTube Song**

**Steps:**

1. Import YouTube song (from Test 2.1)
2. Navigate to edit page
3. Modify: Title, Artist, Album
4. Click "Save"

**Expected:**

- ✅ Changes saved successfully
- 🔒 Source Type is **read-only** (cannot change YouTube → Upload)
- YouTube video ID remains unchanged

---

**Test 2.4b: Edit Uploaded Song**

**Steps:**

1. Select any uploaded song
2. Edit metadata
3. Save

**Expected:**

- Works exactly as before (no regression)

---

## Test Suite 3: Web App Player

### Test 3.1: YouTube Song Playback

**Prerequisites:** Complete Test 2.1 first (create YouTube song)

**Steps:**

1. Open `http://localhost:3000` (Web app)
2. Open music sidebar
3. Find the YouTube song you created
4. Click **Play**

**Expected:**

- ▶️ YouTube IFrame Player loads
- 🎵 Audio plays correctly
- 🖼️ Album art (YouTube thumbnail) displays
- 🎚️ Controls work: Play/Pause, Next, Previous, Seek
- ⏱️ Duration displays correctly
- 🔊 Volume control works

**YouTube ToS Compliance Check:**

- [ ] Player is **visible** on page
- [ ] Player is **≥200px × 200px**
- [ ] No overlays blocking player controls
- [ ] Can see YouTube branding when album art removed

---

### Test 3.2: Uploaded Song Playback

**Steps:**

1. Select any uploaded song from playlist
2. Click Play

**Expected:**

- Uses `<audio>` tag (not YouTube player)
- Plays correctly (no regression)
- All controls work as before

---

### Test 3.3: Mixed Playlist

**Steps:**

1. Create playlist with:
   - 1-2 YouTube songs
   - 2-3 uploaded songs
2. Play through entire playlist using "Next" button

**Expected:**

- ✅ Smooth transition between YouTube and upload songs
- No playback interruptions
- No errors in console
- Player switches between YouTube IFrame and `<audio>` tag seamlessly

---

## Test Suite 4: Performance

### Test 4.1: YouTube Import Speed

**Steps:**

1. Admin → Add Song → YouTube Import
2. Paste URL and click import
3. **Time how long** from click to success message

**Target:** < 2 seconds

**Record Results:**

- Trial 1: **\_** ms
- Trial 2: **\_** ms
- Trial 3: **\_** ms
- **Average:** **\_** ms

**Pass Criteria:** Average < 2000ms

---

### Test 4.2: Playback Start Time

**Steps:**

1. Web app → Select song
2. Click Play button
3. **Time how long** until audio starts

**Target:**

- YouTube songs: < 3 seconds
- Uploaded songs: < 2 seconds

**Record Results:**

**YouTube Songs:**

- Trial 1: **\_** ms
- Trial 2: **\_** ms
- Trial 3: **\_** ms
- **Average:** **\_** ms

**Uploaded Songs:**

- Trial 1: **\_** ms
- Trial 2: **\_** ms
- Trial 3: **\_** ms
- **Average:** **\_** ms

**Pass Criteria:** Both averages meet targets

---

## Test Results Summary

**Fill out this checklist after completing all tests:**

### Backend API

- [x] ✅ List songs endpoint works
- [ ] ⏸️ YouTube import (tested via Admin UI)
- [ ] ⏸️ Error handling (tested via Admin UI)

### Admin UI

- [ ] YouTube import - happy path
- [ ] YouTube import - invalid URL error
- [ ] YouTube import - video not found error
- [ ] File upload regression test
- [ ] Edit YouTube song metadata
- [ ] Edit uploaded song metadata

### Web App Player

- [ ] YouTube song playback
- [ ] Uploaded song playback (regression)
- [ ] Mixed playlist transitions
- [ ] YouTube ToS compliance verified

### Performance

- [ ] Import time < 2s
- [ ] Playback start time meets targets

---

## Troubleshooting

### Issue: YouTube import fails with "Missing authorization header"

**Solution:** Check that you're logged into Admin UI. Clear cookies and re-login if needed.

---

### Issue: YouTube player doesn't load

**Solution:**

1. Check browser console for errors
2. Verify YouTube IFrame API script loaded
3. Check video ID is correct in database

---

### Issue: "Video embedding is disabled"

**Solution:** Try a different video. Some creators disable embedding.

---

## Next Steps

1. **Complete all tests** in this guide
2. **Document any issues** found
3. **Report results** in `phase-04-testing-results.md`
4. **Proceed to Code Review** (Step 3)

---

## Test Data

**Recommended Test Videos:**

1. **Rick Astley - Never Gonna Give You Up**

   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Duration: 212s
   - Always available, embedding enabled

2. **Luis Fonsi - Despacito**

   - URL: `https://www.youtube.com/watch?v=kJQP7kiw5Fk`
   - Duration: 282s
   - Most viewed video on YouTube

3. **Ed Sheeran - Shape of You**
   - URL: `https://www.youtube.com/watch?v=JGwWNGJdvx8`
   - Duration: 234s
   - Popular music video

**Test Different URL Formats:**

- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Short URL: `https://youtu.be/dQw4w9WgXcQ`
- Video ID only: `dQw4w9WgXcQ`

---

**Testing Time Estimate:** 30-45 minutes for complete suite

**Good luck! 🎉**
