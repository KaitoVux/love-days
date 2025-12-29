# Love Days Admin Portal - Project Overview & PDR

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Status:** Phase 03 - Admin UI Implementation Complete

## Executive Summary

The Love Days Admin Portal is a comprehensive content management system for the Love Days application, enabling administrators to manage songs and images through a secure, intuitive interface. Built with Next.js 15 and modern TypeScript, the portal provides full CRUD operations, file uploads with progress tracking, and publish/unpublish controls.

**Key Achievements:**

- Phase 01: NestJS backend foundation with Prisma migrations
- Phase 02: Presigned URL file upload implementation
- Phase 03: Complete Admin UI with Songs and Images management

## Product Vision

Create a professional-grade admin portal that enables content managers to:

1. Manage songs (upload, edit metadata, preview, publish)
2. Manage images (upload, organize by category, preview lightbox, publish)
3. Control content visibility through publish toggles
4. Trigger site rebuilds via webhook integration
5. Maintain consistent branding with the Love Days application

## Functional Requirements

### 1. Authentication & Security

- Supabase Auth integration for secure login
- Session-based authentication via Supabase SSR
- Protected dashboard routes with auth redirects
- Bearer token authentication for API calls
- Environment-based configuration for production security

**Status:** ✅ Implemented (Phase 01)

### 2. Songs Management

- List all songs with metadata (title, artist, album)
- Create new songs with audio file uploads (up to 50MB)
- Edit song metadata (title, artist, album)
- Delete songs with confirmation
- Preview audio directly in table with play/pause
- Publish/unpublish songs with toggle switch
- Support multiple audio formats (mp3, wav, m4a, ogg)

**Status:** ✅ Implemented (Phase 03)

**Components:**

- `SongsTable`: Displays songs list with preview and actions
- `SongForm`: Create/edit form with file upload
- Pages: `/songs`, `/songs/new`, `/songs/[id]`

### 3. Images Management

- List images in responsive grid layout
- Create new images with file uploads
- Edit image metadata (title, description, category)
- Delete images with confirmation
- Categorize images (profile, background, gallery)
- Publish/unpublish images
- Lightbox preview with full-screen viewing
- Color-coded category badges

**Status:** ✅ Implemented (Phase 03)

**Components:**

- `ImagesGrid`: Grid display with preview and actions
- `ImageLightbox`: Full-screen image preview modal
- `ImageForm`: Create/edit form with file upload
- Pages: `/images`, `/images/new`, `/images/[id]`

### 4. File Upload Management

- Presigned URL generation via backend API
- Direct S3/Supabase Storage uploads
- Upload progress tracking with visual feedback
- File size validation
- MIME type validation
- Error handling and user feedback

**Status:** ✅ Implemented (Phase 02)

**Hook:** `useUpload` - Manages upload lifecycle with progress tracking

### 5. Settings & Administration

- Account management page
- Rebuild site webhook integration (Cloudflare Pages)
- User profile information display

**Status:** ✅ Implemented (Phase 03)

**Page:** `/settings`

## Non-Functional Requirements

### Performance

- Page load time: < 2 seconds
- API response time: < 500ms
- File uploads: Resume capability for large files
- Image lazy loading for grid optimization

### Scalability

- Support for 1000+ songs and images
- Horizontal scaling via Next.js deployment
- Database query optimization with Prisma
- CDN-friendly static asset delivery

### Security

- HTTPS enforced in production
- API authentication via Bearer tokens
- CORS configured appropriately
- Input validation on client and server
- Rate limiting on upload endpoints
- No sensitive data in environment variables

### Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader optimized
- Semantic HTML structure
- Proper color contrast ratios

### Maintainability

- TypeScript strict mode
- Component-based architecture
- Clear separation of concerns
- Comprehensive error handling
- Consistent code style via Prettier

## Technical Architecture

### Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5.4.2
- **Styling:** Tailwind CSS with custom theme
- **UI Components:** shadcn/ui + Radix UI primitives
- **Authentication:** Supabase Auth + SSR client
- **State Management:** React hooks (useState)
- **Storage:** Supabase Storage / AWS S3
- **Notifications:** Sonner (toast notifications)

### Project Structure

```
apps/admin/
├── app/                           # Next.js App Router
│   ├── (dashboard)/              # Protected routes layout
│   │   ├── dashboard/page.tsx    # Dashboard overview
│   │   ├── songs/                # Song management routes
│   │   │   ├── page.tsx          # Songs list
│   │   │   ├── new/page.tsx      # Create song
│   │   │   └── [id]/page.tsx     # Edit song
│   │   ├── images/               # Image management routes
│   │   │   ├── page.tsx          # Images gallery
│   │   │   ├── new/page.tsx      # Create image
│   │   │   └── [id]/page.tsx     # Edit image
│   │   ├── settings/page.tsx     # Settings page
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── login/                    # Authentication
│   │   └── page.tsx              # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   └── globals.css               # Global styles
├── components/
│   ├── auth/                     # Auth components
│   │   └── logout-button.tsx
│   ├── dashboard/                # Dashboard components
│   │   └── sidebar.tsx
│   ├── ui/                       # UI components (shadcn)
│   ├── songs/                    # Song management
│   │   ├── songs-table.tsx
│   │   └── song-form.tsx
│   ├── images/                   # Image management
│   │   ├── images-grid.tsx
│   │   ├── image-form.tsx
│   │   └── image-lightbox.tsx
│   └── upload/                   # Upload components
│       └── file-upload.tsx
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── api.ts                   # API client
│   ├── toast.ts                 # Toast utilities
│   └── utils.ts                 # General utilities
├── hooks/
│   └── use-upload.ts            # Upload hook
├── middleware.ts                # Auth middleware
├── tailwind.config.ts           # Tailwind config
├── next.config.js               # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json
```

### Design System

**Color Palette (350 Hue - Rose Pink):**

- Primary: `hsl(350, 80%, 65%)` - Rose pink accent
- Background: `hsl(350, 30%, 8%)` - Dark background
- Foreground: `hsl(350, 20%, 95%)` - Light text
- Card: `hsl(350, 20%, 10%)` - Card backgrounds
- Muted: `hsl(350, 10%, 40%)` - Muted text
- Accent: `hsl(350, 60%, 60%)` - Additional accent
- Border: `hsl(350, 20%, 20%)` - Border color

**Typography:**

- Display Font: Playfair Display (headings)
- Body Font: Nunito (body text)
- Sans Font: System UI fallback

**Responsive Breakpoints:**

- xs: 320px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## API Integration

All API calls go through the centralized client in `lib/api.ts`:

### Songs API

```typescript
songsApi.list(published?: boolean)        // Get all/published songs
songsApi.get(id: string)                  // Get single song
songsApi.create(data: CreateSongDto)      // Create new song
songsApi.update(id: string, data)         // Update song metadata
songsApi.delete(id: string)               // Delete song
songsApi.publish(id: string, bool)        // Toggle publish status
songsApi.getUploadUrl(name, type, size)   // Get presigned upload URL
```

### Images API

```typescript
imagesApi.list(category?: string)         // Get all/filtered images
imagesApi.get(id: string)                 // Get single image
imagesApi.create(data: CreateImageDto)    // Create new image
imagesApi.update(id: string, data)        // Update image metadata
imagesApi.delete(id: string)              // Delete image
imagesApi.publish(id: string, bool)       // Toggle publish status
imagesApi.getUploadUrl(name, type, size)  // Get presigned upload URL
```

## Environment Configuration

**Required Variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://...      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...         # Supabase anonymous key
NEXT_PUBLIC_API_URL=...                   # Backend API base URL
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=   # Cloudflare webhook (optional)
```

All `NEXT_PUBLIC_*` variables are embedded in client bundle and visible in browser.

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add Supabase credentials

# Start development server (port 3001)
npm run dev

# Visit http://localhost:3001
```

### Code Quality

```bash
npm run type-check   # TypeScript validation
npm run lint         # ESLint checks
npm run lint:fix     # Auto-fix issues
npm run format       # Prettier formatting
npm run build        # Production build
```

### Commit Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run format` applied
- [ ] `npm run build` succeeds
- [ ] Functionality tested with `npm run dev`

## Acceptance Criteria

### Phase 03 - Admin UI Implementation

**Songs Management:**

- ✅ Display songs list in table format
- ✅ Show title, artist, album, published status
- ✅ Audio preview with play/pause in table
- ✅ Create new song with audio upload (50MB max)
- ✅ Edit song metadata (title, artist, album)
- ✅ Delete song with confirmation dialog
- ✅ Toggle publish/unpublish status
- ✅ Show loading states during uploads

**Images Management:**

- ✅ Display images in responsive grid (1/2/3 columns)
- ✅ Show category badges with color coding
- ✅ Image lightbox preview with full-screen viewing
- ✅ Create new image with file upload
- ✅ Edit image metadata (title, description, category)
- ✅ Delete image with confirmation dialog
- ✅ Toggle publish/unpublish status
- ✅ Support categories: profile, background, gallery

**File Upload:**

- ✅ Progress tracking with visual feedback
- ✅ File size validation
- ✅ MIME type validation
- ✅ Error handling with user notifications
- ✅ Support multiple file formats

**UI/UX:**

- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark theme with rose pink accents
- ✅ Consistent component library usage
- ✅ Accessible keyboard navigation
- ✅ Toast notifications for feedback
- ✅ Dropdown menus for actions
- ✅ Loading and disabled states

**Branding:**

- ✅ Rose pink (350 hue) color scheme
- ✅ Playfair Display for headings
- ✅ Smooth animations and transitions
- ✅ Professional UI components

## Testing Strategy

### Unit Testing

- Component rendering and state management
- Form validation and submission
- API error handling

### Integration Testing

- Authentication flow
- CRUD operations (create, read, update, delete)
- File upload workflow
- Publish/unpublish toggle

### Manual Testing Checklist

- [ ] Login redirects to dashboard
- [ ] Songs list loads and displays
- [ ] Audio preview plays in table
- [ ] Create song with file upload
- [ ] Edit song metadata
- [ ] Delete song with confirmation
- [ ] Images grid displays responsive
- [ ] Image lightbox opens fullscreen
- [ ] Create image with categorization
- [ ] Edit image metadata
- [ ] Delete image with confirmation
- [ ] Publish toggles update immediately
- [ ] Settings page loads and displays

## Deployment

### Build Process

```bash
npm run build        # Next.js production build
npm run start        # Start production server (port 3001)
```

### Environment Setup

1. Set all `NEXT_PUBLIC_*` variables in deployment platform
2. Ensure backend API is accessible
3. Configure Supabase project
4. Set Cloudflare webhook URL (optional)

### Monitoring

- Monitor API response times
- Track upload success rates
- Monitor authentication failures
- Watch error logs for exceptions

## Future Enhancements

### Phase 04 Planned Features

- Batch operations (upload multiple files)
- Song playlist management
- Image album/collection grouping
- Advanced filtering and search
- User role-based permissions
- Audit logging for changes
- Content scheduling

### Performance Optimizations

- Image optimization and compression
- Database query indexing
- API response caching
- Client-side state caching

### Analytics & Monitoring

- User activity tracking
- Upload success metrics
- API performance monitoring
- Error rate tracking

## Support & Documentation

### Key Files

- `/docs/project-overview-pdr.md` - This document
- `/docs/code-standards.md` - Code organization and standards
- `/docs/system-architecture.md` - System design documentation
- `/docs/codebase-summary.md` - Generated codebase overview
- `/README.md` - Quick start guide

### Team Communication

- Code reviews required for PRs
- Merge to master via pull requests
- Feature branches for development
- Meaningful commit messages

## Success Metrics

### User Experience

- Admin portal load time < 2 seconds
- File upload success rate > 99%
- User satisfaction score > 4.5/5

### Technical Quality

- Test coverage > 80%
- Zero critical bugs at release
- TypeScript strict mode compliance: 100%
- Accessibility compliance: WCAG 2.1 AA

### Performance

- Core Web Vitals: Good (Lighthouse score > 90)
- API response time < 500ms
- Database query time < 100ms

## Glossary

**Presigned URL:** Temporary signed URL that allows direct file uploads to cloud storage without exposing credentials

**CRUD:** Create, Read, Update, Delete operations on resources

**Lightbox:** Modal overlay showing full-screen image preview

**Published:** Content visibility toggle controlling if item appears in public application

**SSR:** Server-Side Rendering for authentication context

**Bearer Token:** Authentication token included in API request headers

**Webhook:** HTTP callback for triggering external actions (site rebuilds)

## Document Control

| Version | Date       | Author   | Changes                        |
| ------- | ---------- | -------- | ------------------------------ |
| 1.0.0   | 2025-12-29 | Dev Team | Initial Phase 03 documentation |

---

**Last Updated:** 2025-12-29
**Next Review:** 2026-01-15
