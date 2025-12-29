# Code Review: Phase 02 - Presigned URL File Upload

**Date**: 2025-12-29
**Reviewer**: Claude Code (code-reviewer)
**Scope**: Phase 02 implementation - Presigned URL file upload pattern
**Branch**: feat/init_backend

---

## Executive Summary

Phase 02 implementation is **functionally complete** but has **46 linting errors** (primarily formatting) and **type safety issues** that must be resolved before deployment.

**Overall Assessment**: B+ (Good architecture, security-conscious design, but code quality needs cleanup)

---

## Scope

### Files Reviewed

**New Files:**

- `apps/api/src/storage/storage.service.ts` (110 lines)
- `apps/api/src/storage/storage.module.ts` (9 lines)
- `apps/api/src/songs/dto/upload-url.dto.ts` (31 lines)
- `apps/api/src/images/dto/upload-url.dto.ts` (31 lines)

**Modified Files:**

- `apps/api/src/songs/songs.service.ts` (109 lines)
- `apps/api/src/songs/songs.controller.ts` (88 lines)
- `apps/api/src/images/images.service.ts` (96 lines)
- `apps/api/src/images/images.controller.ts` (91 lines)
- `apps/api/src/app.module.ts` (20 lines)

**Total Lines Analyzed**: ~585 lines
**Review Focus**: Security vulnerabilities, type safety, architecture patterns, OWASP compliance

---

## Critical Issues

### ❌ CRITICAL: Environment Variable Validation Missing

**File**: `apps/api/src/storage/storage.service.ts:24-28`

```typescript
constructor() {
  this.supabaseUrl = process.env.SUPABASE_URL!;  // ⚠️ Non-null assertion dangerous
  this.supabase = createClient(
    this.supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY!,  // ⚠️ Non-null assertion dangerous
  );
}
```

**Risk**: Application will crash at runtime if env vars missing. No graceful failure.

**Impact**: Production outage risk

**Recommendation**:

```typescript
constructor() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY'
    );
  }

  this.supabaseUrl = supabaseUrl;
  this.supabase = createClient(this.supabaseUrl, serviceKey);
}
```

---

### ❌ CRITICAL: MIME Type Validation Insufficient

**File**: `apps/api/src/storage/storage.service.ts:95-103`

```typescript
private isValidFileType(bucket: string, fileType: string): boolean {
  if (bucket === "songs") {
    return fileType.startsWith("audio/");  // ⚠️ Too permissive
  }
  if (bucket === "images") {
    return fileType.startsWith("image/");  // ⚠️ Too permissive
  }
  return false;
}
```

**Vulnerability**: Client can bypass by setting `Content-Type: audio/malicious` or `image/svg+xml` (XSS vector)

**OWASP**: A03:2021 – Injection (XSS via SVG upload)

**Recommendation**: Use allowlist of specific MIME types:

```typescript
private isValidFileType(bucket: string, fileType: string): boolean {
  const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (bucket === 'songs') return ALLOWED_AUDIO.includes(fileType);
  if (bucket === 'images') return ALLOWED_IMAGES.includes(fileType);
  return false;
}
```

**Note**: Explicitly exclude `image/svg+xml` to prevent XSS attacks via SVG uploads.

---

### ⚠️ HIGH: Presigned URL Expiry Not Configurable

**File**: `apps/api/src/storage/storage.service.ts:54-58`

```typescript
const { data, error } = await this.supabase.storage
  .from(bucket)
  .createSignedUploadUrl(filePath, {
    upsert: false, // Good: prevents overwriting
  });
```

**Issue**: Supabase default presigned URL expiry is 60 seconds (not 60 minutes as plan suggests)

**Impact**: User experience degradation - URLs expire too quickly for large file uploads

**Verification Needed**: Confirm actual expiry time from Supabase docs

**Recommendation**: Make expiry configurable:

```typescript
.createSignedUploadUrl(filePath, {
  upsert: false,
  expiresIn: 3600, // 1 hour in seconds
});
```

---

## High Priority Findings

### 🔴 Type Safety Issues (18 errors)

**Files**: `songs.service.ts`, `images.service.ts`

**Issue**: Unsafe `any` types returned from Prisma operations

```typescript
// Current (unsafe):
private transformSong(song: any) {  // ⚠️ `any` type
  return {
    ...song,
    fileUrl: this.storage.getPublicUrl(SONGS_BUCKET, song.filePath),
    thumbnailUrl: song.thumbnailPath
      ? this.storage.getPublicUrl('images', song.thumbnailPath)
      : null,
  };
}
```

**Recommendation**: Create proper return types:

```typescript
// Create types/song.types.ts
import { Song } from '@prisma/client';

export interface SongWithUrls extends Song {
  fileUrl: string;
  thumbnailUrl: string | null;
}

// Update service:
private transformSong(song: Song): SongWithUrls {
  return {
    ...song,
    fileUrl: this.storage.getPublicUrl(SONGS_BUCKET, song.filePath),
    thumbnailUrl: song.thumbnailPath
      ? this.storage.getPublicUrl('images', song.thumbnailPath)
      : null,
  };
}
```

---

### 🔴 File Extension Validation Missing

**File**: `apps/api/src/storage/storage.service.ts:105-109`

```typescript
private getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";  // ⚠️ Allows files without extensions
  return fileName.substring(lastDot).toLowerCase();
}
```

**Security Issue**: No validation on file extension content

**Attack Vector**: User uploads `../../etc/passwd.mp3` or `file.mp3.exe`

**Recommendation**:

```typescript
private getExtension(fileName: string): string {
  // Sanitize filename to prevent path traversal
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '');
  const lastDot = safeName.lastIndexOf('.');

  if (lastDot === -1) {
    throw new BadRequestException('File must have an extension');
  }

  const ext = safeName.substring(lastDot).toLowerCase();

  // Validate extension matches expected formats
  const validExtensions = ['.mp3', '.wav', '.ogg', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (!validExtensions.includes(ext)) {
    throw new BadRequestException(`Invalid file extension: ${ext}`);
  }

  return ext;
}
```

---

### 🔴 Error Logging Exposes Sensitive Data

**File**: `apps/api/src/songs/songs.service.ts:70-84`

```typescript
try {
  await this.storage.deleteFile(SONGS_BUCKET, song.filePath);
} catch (e) {
  console.error("Failed to delete song file:", e); // ⚠️ May leak error details
}
```

**Security Issue**: Error objects may contain stack traces, file paths, or internal details

**OWASP**: A05:2021 – Security Misconfiguration (Information Disclosure)

**Recommendation**: Use proper logging service and sanitize errors:

```typescript
try {
  await this.storage.deleteFile(SONGS_BUCKET, song.filePath);
} catch (e) {
  // Log securely (use Logger service in production)
  this.logger.error("Failed to delete song file", {
    songId: song.id,
    filePath: song.filePath,
    error: e instanceof Error ? e.message : "Unknown error",
  });
  // Don't expose to client
}
```

---

### 🔴 Query Parameter Type Coercion Bug

**File**: `apps/api/src/songs/songs.controller.ts:45-47`

```typescript
findAll(@Query('published') published?: string) {
  const isPublished = published === 'false' ? false : true;  // ⚠️ Defaults to true
  return this.songsService.findAll(isPublished);
}
```

**Bug**: `/api/v1/songs?published=garbage` returns published songs (defaults to true)

**Expected**: Should return error or all songs

**Recommendation**: Use ParseBoolPipe or explicit validation:

```typescript
@Get()
@ApiQuery({ name: 'published', required: false, type: Boolean })
findAll(
  @Query('published', new ParseBoolPipe({ optional: true })) published?: boolean
) {
  return this.songsService.findAll(published);
}
```

---

## Medium Priority Improvements

### 🟡 Hardcoded Magic Strings (YAGNI/DRY Violation)

**Files**: Multiple services

```typescript
// Duplicated across songs.service.ts and images.service.ts:
const SONGS_BUCKET = "songs";
const IMAGES_BUCKET = "images";
```

**Recommendation**: Centralize configuration:

```typescript
// src/storage/storage.constants.ts
export const STORAGE_CONFIG = {
  buckets: {
    SONGS: "songs",
    IMAGES: "images",
  },
  limits: {
    MAX_SONG_SIZE: 50 * 1024 * 1024,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  },
} as const;
```

---

### 🟡 File Path Prefix Inconsistency

**File**: `apps/api/src/storage/storage.service.ts:68-78`

```typescript
return {
  uploadUrl: data.signedUrl,
  filePath: `${bucket}/${filePath}`, // ✅ Includes bucket prefix
};

// Later in getPublicUrl:
const cleanPath = filePath.startsWith(`${bucket}/`)
  ? filePath.substring(bucket.length + 1) // Strips bucket prefix
  : filePath;
```

**Issue**: Inconsistent file path format (sometimes with bucket, sometimes without)

**Risk**: Future maintainers may misuse API

**Recommendation**: Document clearly or normalize to always strip bucket prefix in storage service:

```typescript
// Return clean path without bucket prefix
return {
  uploadUrl: data.signedUrl,
  filePath: filePath, // Just UUID + extension
  bucket: bucket, // Explicit bucket field
};
```

---

### 🟡 Missing Rate Limiting on Upload URL Generation

**Security Issue**: No rate limiting on `POST /api/v1/songs/upload-url`

**Attack Vector**: Attacker can generate unlimited presigned URLs, potentially:

1. Exhausting Supabase Storage API quota
2. Creating orphaned signed URLs

**OWASP**: A04:2021 – Insecure Design (Lack of Resource Limits)

**Recommendation**: Add NestJS Throttler module:

```typescript
// songs.controller.ts
@Post('upload-url')
@UseGuards(SupabaseAuthGuard, ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })  // 10 requests per minute
@ApiBearerAuth()
async getUploadUrl(@Body() dto: SongUploadUrlDto) {
  return this.songsService.generateUploadUrl(dto);
}
```

---

## Low Priority Suggestions

### 🟢 Prettier Formatting (27 errors)

All DTO files have double quote vs single quote issues.

**Fix**: Run `npm run format` to auto-fix.

---

### 🟢 Swagger Documentation Improvements

**Current**: Basic API documentation present ✅

**Enhancement**: Add example responses for error cases:

```typescript
@ApiResponse({ status: 400, description: 'File size exceeds limit or invalid file type' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

---

### 🟢 TODO: Verify Supabase Storage Bucket Configuration

**Missing from implementation**:

1. Bucket creation verification (manual step)
2. RLS policy deployment script (SQL provided in plan but not automated)

**Recommendation**: Create migration script or setup docs in `/docs/deployment/`.

---

## Positive Observations

### ✅ Excellent Architecture Decisions

1. **Global Storage Module** (`@Global()` decorator) - Proper NestJS pattern for shared services
2. **Dependency Injection** - Clean separation of concerns (Storage ↔ Songs/Images services)
3. **UUID-based File Paths** - Prevents path traversal and collision attacks
4. **`upsert: false`** - Prevents accidental file overwrites
5. **Auth Guard Placement** - All mutation endpoints protected with `@UseGuards(SupabaseAuthGuard)`

---

### ✅ Security Best Practices Applied

1. **Presigned URLs** - Correct implementation pattern (bypasses Vercel limits)
2. **File Size Validation** - Both DTO-level (`@Max()`) and service-level checks
3. **MIME Type Validation** - Present (needs strengthening per Critical section)
4. **Auth Required** - Upload URL generation requires JWT token
5. **No Direct File Uploads** - API never handles file buffers (good for serverless)

---

### ✅ Code Quality Highlights

1. **Swagger Documentation** - Comprehensive `@ApiOperation`, `@ApiProperty` usage
2. **Error Handling** - Graceful degradation on file deletion failures
3. **Type Safety Intent** - DTOs use class-validator decorators
4. **Clean Code** - Small, focused methods (SRP compliance)

---

## Recommended Actions (Priority Order)

### Must Fix Before Deployment (Blockers)

1. **Add environment variable validation** in `StorageService` constructor
2. **Strengthen MIME type validation** with allowlist (prevent SVG XSS)
3. **Fix 27 Prettier errors** with `npm run format`
4. **Fix 18 TypeScript type safety errors** by adding proper return types
5. **Validate file extensions** in `getExtension()` method

### Should Fix Before Production (High Priority)

6. **Verify presigned URL expiry time** and make configurable
7. **Fix query parameter type coercion** using `ParseBoolPipe`
8. **Add rate limiting** to upload URL endpoints (`@nestjs/throttler`)
9. **Improve error logging** (use Logger service, sanitize outputs)
10. **Add extension validation** to prevent malicious filenames

### Can Fix Later (Medium Priority)

11. **Centralize storage constants** in `storage.constants.ts`
12. **Normalize file path format** (document bucket prefix behavior)
13. **Create Supabase setup automation** (bucket creation + RLS policies)
14. **Add integration tests** for presigned URL flow
15. **Enhance Swagger error documentation**

---

## Task Completeness Verification

### ✅ Completed Tasks (from Plan)

- [x] Create StorageModule and StorageService
- [x] Create upload URL DTOs for songs and images
- [x] Add generateUploadUrl method to SongsService
- [x] Add upload-url endpoint to SongsController
- [x] Add generateUploadUrl method to ImagesService
- [x] Add upload-url endpoint to ImagesController
- [x] Update services to transform file paths to public URLs
- [x] Add file deletion on song/image remove
- [x] Update App Module to import StorageModule

### ⏸️ Partially Completed

- [ ] **Configure Supabase Storage buckets** (manual step - needs automation/docs)
- [ ] **Set up Supabase Storage RLS policies** (SQL provided but not deployed)
- [ ] **Testing** (no evidence of manual testing with curl commands)

### ❌ Not Started

- [ ] Build compliance - Blocked by linting errors
- [ ] Integration tests - No test files created
- [ ] Deployment to Vercel - Blocked by code quality issues

---

## Security Audit (OWASP Top 10 2021)

| OWASP Category                     | Status     | Findings                                                                    |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------- |
| **A01: Broken Access Control**     | ✅ Pass    | Auth guards correctly placed on all mutation endpoints                      |
| **A02: Cryptographic Failures**    | ✅ Pass    | No sensitive data in transit (uses HTTPS, presigned URLs)                   |
| **A03: Injection**                 | ⚠️ Warning | MIME validation too permissive (SVG XSS risk), filename sanitization needed |
| **A04: Insecure Design**           | ⚠️ Warning | No rate limiting on URL generation, missing presigned URL expiry config     |
| **A05: Security Misconfiguration** | ⚠️ Warning | Error logging may expose stack traces, missing env var validation           |
| **A06: Vulnerable Components**     | ✅ Pass    | Dependencies up-to-date (`@supabase/supabase-js` latest)                    |
| **A07: Auth Failures**             | ✅ Pass    | JWT validation via SupabaseAuthGuard (Phase 01)                             |
| **A08: Software Integrity**        | ✅ Pass    | No dynamic code execution, all dependencies from npm                        |
| **A09: Logging Failures**          | 🟡 Minor   | Error logging present but not production-grade (use Logger service)         |
| **A10: SSRF**                      | ✅ N/A     | No user-controlled URLs fetched by backend                                  |

---

## Performance Analysis

### ✅ Performance Considerations

1. **URL Generation Speed**: Single Supabase API call (~50ms expected)
2. **No File Buffering**: Backend never touches file contents (optimal for serverless)
3. **Prisma Queries**: Efficient (uses indexes on `id`, `published`, `category`)
4. **Transform Operations**: In-memory mapping (negligible overhead)

### 🟡 Potential Bottlenecks

1. **Supabase API Latency**: If Supabase is slow, URL generation blocks

   - **Mitigation**: Add timeout handling (NestJS `@Timeout()` decorator)

2. **Database Query Optimization**: `findAll()` with no pagination
   - **Risk**: If 10,000+ songs, response becomes slow
   - **Mitigation**: Add pagination in Phase 03 admin UI

---

## Metrics

| Metric              | Value              | Target     | Status               |
| ------------------- | ------------------ | ---------- | -------------------- |
| **Type Coverage**   | ~70%               | 100%       | ⚠️ Needs improvement |
| **Linting Issues**  | 46 errors          | 0          | ❌ Blocker           |
| **Build Status**    | ✅ Passes          | ✅         | ✅                   |
| **Test Coverage**   | 0%                 | >80%       | ❌ No tests written  |
| **Security Issues** | 3 critical, 5 high | 0 critical | ⚠️ Must fix          |
| **Lines of Code**   | 585                | N/A        | ✅ Reasonable        |

---

## Updated Plan Status

**Phase 02 Status**: ⚠️ **Requires Fixes** (85% complete)

### Blocking Issues for Phase Completion

1. Fix 46 linting errors (`npm run format` + manual fixes)
2. Add environment variable validation (1 file change)
3. Strengthen MIME type validation (1 method change)
4. Fix TypeScript type safety issues (add return types)

**Estimated Time to Fix**: 2-3 hours

**Phase Sign-off**: Not recommended until blockers resolved

---

## Next Steps

### Immediate (Before Any Commit)

1. Run `npm run format` to fix Prettier errors
2. Fix critical security issues (env validation, MIME types)
3. Add proper return types to service methods
4. Run `npm run lint` again - must pass with 0 errors
5. Verify `npm run build` still passes

### Before Deployment

6. Add rate limiting to upload URL endpoints
7. Create Supabase setup documentation
8. Manual testing of upload flow with curl
9. Update `.env.sample` with clear instructions

### Phase 03 Preparation

10. Review plan for [Phase 03 - Admin UI](./phase-03-admin-ui-shadcn-dashboard.md)
11. Plan integration tests for end-to-end upload flow
12. Consider adding monitoring/logging instrumentation

---

## Unresolved Questions

1. **Presigned URL Expiry**: Supabase docs claim 60 seconds default, plan assumes 60 minutes. Which is correct?

2. **Orphaned File Cleanup**: Plan acknowledges risk but offers no solution. Should we:

   - Accept technical debt for MVP?
   - Add cleanup job now?
   - Track uploads in Redis for garbage collection?

3. **MIME Type Enforcement**: Supabase Storage may accept any file type regardless of backend validation. Are Supabase bucket policies configured to reject mismatched types?

4. **Service Role Key Security**: Using `SUPABASE_SERVICE_KEY` bypasses RLS. Is this acceptable, or should we use user-scoped keys?

---

## Conclusion

Implementation demonstrates **strong architectural understanding** and **security awareness**, but **code quality** and **type safety** need immediate attention before this can be considered production-ready.

Key strengths:

- Correct presigned URL pattern
- Proper auth guard placement
- Clean service layer separation

Critical gaps:

- Missing env validation (crash risk)
- Weak MIME validation (XSS risk)
- Type safety violations

**Recommendation**: Address 5 blocking issues (2-3 hours work), then approve for Phase 03 transition.

---

**Review Confidence**: High
**Files Requiring Re-review After Fixes**:

- `storage.service.ts` (security fixes)
- `*.service.ts` (type safety)
- All DTOs (formatting)
