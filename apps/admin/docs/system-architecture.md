# System Architecture Documentation

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Status:** Phase 03 - Admin UI Complete

## Architecture Overview

The Love Days Admin Portal follows a modern three-tier architecture:

1. **Client Tier:** Next.js frontend with React components
2. **API Tier:** Centralized client communicating with backend
3. **Server Tier:** NestJS backend with Prisma ORM (external)

```
┌─────────────────────────────────────────────────────────┐
│           LOVE DAYS ADMIN PORTAL (Frontend)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Login      │  │  Dashboard   │  │  Settings    │   │
│  │   Page       │  │   Layout     │  │  Page        │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                 │                 │             │
│         └─────────────────┼─────────────────┘             │
│                           │                               │
│         ┌─────────────────────────────────┐               │
│         │  Dashboard Route Group          │               │
│         │  ┌─────────────┬─────────────┐   │              │
│         │  │   Songs     │   Images    │   │              │
│         │  │  Management │ Management  │   │              │
│         │  │   CRUD      │   CRUD      │   │              │
│         │  └─────────────┴─────────────┘   │              │
│         │                                   │              │
│         └───────────────┬───────────────────┘              │
│                         │                                  │
│     ┌───────────────────────────────────┐                 │
│     │  API Client Layer (lib/api.ts)    │                 │
│     │  ┌──────────────┬─────────────┐   │                 │
│     │  │  songsApi    │  imagesApi  │   │                 │
│     │  │  CRUD & ops  │  CRUD & ops │   │                 │
│     │  └──────────────┴─────────────┘   │                 │
│     │                                    │                 │
│     │  ┌──────────────────────────────┐ │                 │
│     │  │ Auth & Error Handling        │ │                 │
│     │  │ Bearer Token Injection       │ │                 │
│     │  └──────────────────────────────┘ │                 │
│     └────────────────┬────────────────────┘                │
│                      │                                     │
└──────────────────────┼─────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────┴──────────────────────────────────────┐
│        LOVE DAYS API BACKEND (NestJS) - External            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  POST   /api/v1/songs             (Create)         │  │
│  │  GET    /api/v1/songs/:id         (Read)           │  │
│  │  PATCH  /api/v1/songs/:id         (Update)         │  │
│  │  DELETE /api/v1/songs/:id         (Delete)         │  │
│  │  POST   /api/v1/songs/:id/publish (Publish)        │  │
│  │  POST   /api/v1/songs/upload-url  (Upload URL)     │  │
│  │                                                      │  │
│  │  POST   /api/v1/images            (Create)         │  │
│  │  GET    /api/v1/images/:id        (Read)           │  │
│  │  PATCH  /api/v1/images/:id        (Update)         │  │
│  │  DELETE /api/v1/images/:id        (Delete)         │  │
│  │  POST   /api/v1/images/:id/publish(Publish)        │  │
│  │  POST   /api/v1/images/upload-url (Upload URL)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer (Prisma ORM)                        │  │
│  │  ┌──────────────┬─────────────────┐                │  │
│  │  │  Songs       │  Images         │                │  │
│  │  │  Table       │  Table          │                │  │
│  │  └──────────────┴─────────────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                       │
                       │
┌──────────────────────┴──────────────────────────────────────┐
│          EXTERNAL SERVICES                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Supabase Auth         │ Storage (S3/Supabase Storage)  │ │
│  │ (Authentication)      │ (File uploads)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Cloudflare Pages (Webhook for site rebuilds)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Layer Architecture

### 1. Client Layer - Next.js Frontend

**Technology Stack:**

- Next.js 15 with App Router
- React 19 with TypeScript 5.4.2
- Tailwind CSS for styling
- shadcn/ui + Radix UI components
- Sonner for notifications

**Responsibilities:**

- User interface rendering
- Form management and validation
- File upload UI
- State management (React hooks)
- API call orchestration
- Error presentation

**Key Features:**

- Server-side rendering for authentication
- Client-side components for interactivity
- Responsive design
- Dark theme with rose pink accents

### 2. API Client Layer

Located in `lib/api.ts`, this layer provides a centralized interface to the backend:

```typescript
// API Client Architecture
lib/api.ts
  ├── Authentication Headers
  │   └── getAuthHeaders()
  │       ├── Supabase session retrieval
  │       └── Bearer token injection
  │
  ├── Fetch Wrapper
  │   └── fetchApi<T>()
  │       ├── Request construction
  │       ├── Error handling
  │       └── Response parsing
  │
  ├── Songs API Endpoints
  │   ├── list(published?)
  │   ├── get(id)
  │   ├── create(data)
  │   ├── update(id, data)
  │   ├── delete(id)
  │   ├── publish(id, bool)
  │   └── getUploadUrl()
  │
  └── Images API Endpoints
      ├── list(category?)
      ├── get(id)
      ├── create(data)
      ├── update(id, data)
      ├── delete(id)
      ├── publish(id, bool)
      └── getUploadUrl()
```

**Error Handling:**

- Automatic JSON parsing of error responses
- HTTP status code validation
- User-friendly error messages
- Error propagation to consumers

**Authentication:**

- Automatic Bearer token injection
- Session-based token refresh
- Fallback for unauthenticated requests

### 3. Component Architecture

Components are organized by feature and responsibility:

```
Components Hierarchy
│
├── Layout Components
│   ├── Dashboard Layout
│   │   └── Sidebar Navigation
│   └── Root Layout
│
├── Feature Components (Songs)
│   ├── SongsTable
│   │   ├── Audio Preview
│   │   ├── Actions Menu
│   │   ├── Publish Toggle
│   │   └── Edit/Delete
│   │
│   └── SongForm
│       ├── File Upload
│       ├── Title Input
│       ├── Artist Input
│       ├── Album Input
│       └── Submit/Cancel
│
├── Feature Components (Images)
│   ├── ImagesGrid
│   │   ├── Image Cards
│   │   ├── Category Badge
│   │   ├── Publish Toggle
│   │   ├── Eye Icon
│   │   └── Actions Menu
│   │
│   ├── ImageLightbox
│   │   └── Full-screen Preview
│   │
│   └── ImageForm
│       ├── File Upload
│       ├── Title Input
│       ├── Description Input
│       ├── Category Select
│       └── Submit/Cancel
│
├── Upload Components
│   └── FileUpload
│       ├── Dropzone
│       ├── File Input
│       ├── Progress Bar
│       └── Error Display
│
└── UI Components (shadcn/ui)
    ├── Button
    ├── Input
    ├── Table
    ├── Card
    ├── Switch
    ├── Dropdown Menu
    ├── Select
    ├── Dialog
    └── [others]
```

**Component Communication Pattern:**

```
Page Component (Server)
  ├── Fetch data
  ├── Pass data as props
  │
  └── Feature Component (Client)
      ├── State management
      ├── Event handlers
      ├── API calls
      └── Child components
          └── UI Components
```

### 4. State Management

Uses React hooks for state management (no Redux/Zustand needed for this scope):

```typescript
// Page-level state
useState<SongResponseDto[]>(); // Songs/Images list
useState<string | null>(); // Playing song / Lightbox image
useState<boolean>(); // Loading/Submitting state

// Form state
useState<string>(); // Title, artist, album
useState<string>(); // File path for uploaded file

// Upload state (via custom hook)
useState<boolean>(); // Uploading flag
useState<number>(); // Upload progress
```

**State Flow:**

```
User Action
  ↓
Event Handler (e.g., handlePublish)
  ↓
API Call (songsApi.publish)
  ↓
State Update (setPublished)
  ↓
Component Re-render
  ↓
Toast Notification
```

### 5. File Upload Architecture

```
FileUpload Component
  ├── React Dropzone
  │   └── Drag & drop support
  │
  ├── useUpload Hook
  │   ├── Get presigned URL (via API)
  │   ├── Upload to storage
  │   ├── Progress tracking
  │   └── Error handling
  │
  └── Progress UI
      └── Progress bar + percentage
```

**Upload Flow:**

```
1. User selects file
   ↓
2. FileUpload component validates
   - File size (max 50MB)
   - File type (audio/* or image/*)
   ↓
3. useUpload hook runs:
   - Calls API to get presigned URL
   - Initiates multipart upload
   - Tracks progress
   ↓
4. Success callback
   - Returns file path
   - Updates form state
   ↓
5. User submits form
   - Creates/updates record with file path
```

### 6. Authentication Architecture

```
Auth Flow
│
├── Root Page
│   └── Checks auth state
│       ├── Not authenticated → Redirect to /login
│       └── Authenticated → Redirect to /dashboard
│
├── Login Page
│   └── Supabase Auth UI
│       └── Email/Password or OAuth
│
├── Middleware
│   └── Validates session on protected routes
│       ├── Valid session → Allow access
│       └── No session → Redirect to login
│
├── API Client
│   └── Adds Bearer token to all requests
│       ├── From current session
│       └── Backend validates token
│
└── Logout
    └── Clears session
        └── Redirects to login
```

**Session Management:**

- Supabase SSR client for server-side auth context
- Token stored in secure HTTP-only cookie
- Automatic token refresh
- Session validation on protected routes

### 7. Routing Structure

```
routes/
├── / (Root)
│   └── Checks auth → Redirect to /login or /dashboard
│
├── /login (Public)
│   └── Authentication page
│
└── /(dashboard) (Protected with Layout)
    ├── /dashboard
    │   └── Overview page
    │
    ├── /songs
    │   ├── /page (List)
    │   ├── /new (Create)
    │   └── /[id] (Edit)
    │
    ├── /images
    │   ├── /page (List)
    │   ├── /new (Create)
    │   └── /[id] (Edit)
    │
    └── /settings
        └── Account page
```

**Route Parameters:**

- `[id]`: Dynamic song/image ID for edit pages
- Derived from URL pathname
- Type-safe with TypeScript

### 8. Error Handling Architecture

```
Error Sources
├── Network Errors
│   └── API Client catches & formats
│
├── Validation Errors
│   ├── Client-side (form validation)
│   └── Server-side (API response)
│
├── Authentication Errors
│   └── Redirect to login
│
└── Application Errors
    └── Toast notification to user
```

**Error Flow:**

```
Component
  └── try/catch
      ├── Success
      │   └── toast.success()
      │   └── Update state
      │   └── Refresh/Navigate
      │
      └── Error
          └── Format message
          └── toast.error()
          └── Keep UI state
```

## Data Flow Patterns

### Create Song Flow

```
SongForm (mode: "create")
  ├── User fills form
  ├── User selects audio file
  │   └── FileUpload
  │       └── useUpload
  │           ├── songsApi.getUploadUrl()
  │           ├── Direct storage upload
  │           └── Returns file path
  │
  ├── User submits form
  │   └── handleSubmit()
  │       ├── Validates data
  │       ├── songsApi.create({title, artist, album, filePath})
  │       ├── Toast success
  │       └── Navigate to /songs
  │
  └── SongsPage refreshes
      └── Fetches updated list
```

### Publish Toggle Flow

```
SongsTable
  ├── User clicks switch
  │   └── handlePublish(id, published)
  │       ├── songsApi.publish(id, published)
  │       ├── Toast success/fail
  │       └── Call onRefresh()
  │
  └── SongsPage
      └── Refetch songs list
          └── Table updates
```

### Image Preview Flow

```
ImagesGrid
  ├── User clicks Eye icon or image
  │   └── setLightboxImage(image)
  │
  └── ImageLightbox
      ├── Modal opens
      ├── Full-screen image displays
      └── User clicks close
          └── setLightboxImage(null)
          └── Modal closes
```

## Integration Points

### Backend API Integration

- **Base URL:** `NEXT_PUBLIC_API_URL` environment variable
- **Authentication:** Bearer token in Authorization header
- **Content-Type:** JSON for request/response
- **Error Format:** `{ message: string }` in error responses

### Supabase Integration

- **Auth:** Email/password authentication
- **Storage:** File uploads to presigned URLs
- **Session:** SSR client for auth context
- **Configuration:** URL and anon key in env vars

### External Services

- **Cloudflare Pages:** Webhook trigger for site rebuilds
- **Configuration:** Webhook URL in settings

## Performance Considerations

### Frontend Optimization

- **Lazy Loading:** Components loaded on demand
- **Code Splitting:** Next.js automatic route splitting
- **Image Optimization:** Lazy load images in grid
- **Caching:** API response caching at component level

### Network Optimization

- **Presigned URLs:** Direct uploads avoid backend bottleneck
- **Parallel Uploads:** Multiple files simultaneously
- **Progressive Upload:** Chunk support for large files

### Database Optimization (Backend)

- **Query Indexing:** Primary keys and foreign keys
- **Published Filter:** Indexed for fast queries
- **Pagination:** Limit result sets

## Security Architecture

### Authentication

- Supabase Auth handles credential validation
- Session tokens stored securely
- Token refresh automatic
- HTTPS enforced in production

### Authorization

- Protected routes via middleware
- Bearer token validation on backend
- Resource ownership verification (backend)
- API key in environment variables (server-side only)

### Data Protection

- No sensitive data in localStorage
- Credentials stored in secure cookies
- No hardcoded secrets in code
- Environment variables for config

### Input Validation

- Client-side: Form validation
- File validation: MIME type & size
- Server-side: All inputs validated (backend)

## Scalability Considerations

### Horizontal Scaling

- Stateless Next.js instances
- Load balanced via hosting platform
- Session stored in Supabase (not in-memory)

### Vertical Scaling

- Database optimization (indexes)
- Query result caching
- CDN for static assets

### Future Improvements

- Image optimization/compression
- Batch uploads
- Pagination for large lists
- GraphQL for efficient queries

## Deployment Architecture

### Development Environment

```
localhost:3001
├── Next.js dev server (Turbopack)
├── File uploads to local storage (mock)
└── API calls to localhost backend
```

### Production Environment

```
Vercel / Cloud Platform
├── Next.js compiled application
├── Environment variables configured
├── File uploads to Supabase Storage
├── API calls to production backend
└── HTTPS enforced
```

**Environment-Specific Configuration:**

```
Development:
  NEXT_PUBLIC_API_URL=http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL=...

Production:
  NEXT_PUBLIC_API_URL=https://api.love-days.com
  NEXT_PUBLIC_SUPABASE_URL=...
```

## Monitoring & Observability

### Logging

- Browser console logs for development
- Backend logs for API calls
- Error tracking via Sentry (optional)

### Metrics

- Page load time
- API response time
- Upload success rate
- Error rate

### Debugging

- React DevTools for component inspection
- Network tab for API calls
- Application tab for storage inspection
- TypeScript strict mode for type safety

## Future Architecture Enhancements

### Phase 04 Planned Improvements

1. **Caching Strategy:**

   - SWR for API responses
   - React Query for server state
   - Optimistic updates

2. **Real-time Updates:**

   - WebSocket for live notifications
   - Live list updates
   - Collaborative editing indicators

3. **Advanced Features:**

   - Batch operations
   - Scheduled publishing
   - Content versioning
   - Audit logs

4. **Analytics:**
   - User activity tracking
   - Upload metrics
   - Content popularity

## Architectural Decision Records (ADR)

### ADR-001: Centralized API Client

**Decision:** All API calls through `lib/api.ts`
**Rationale:** Single point for error handling, auth, and request/response transformation
**Consequence:** Easier testing, consistent error handling, easier to migrate to different API

### ADR-002: React Hooks for State Management

**Decision:** No external state management (Redux, Zustand)
**Rationale:** Scope doesn't require complex shared state; props drilling is manageable
**Consequence:** Simpler architecture, easier to understand, easier to test

### ADR-003: shadcn/ui Components

**Decision:** Use shadcn/ui for UI components
**Rationale:** Tailwind-based, fully customizable, type-safe, no dependency on component library CSS
**Consequence:** Consistent design system, easy theming, full control

### ADR-004: Separate API Client Layer

**Decision:** Dedicated `lib/api.ts` instead of direct fetch calls
**Rationale:** Centralized error handling, auth, and future flexibility
**Consequence:** Easier to mock in tests, easier to change API endpoint

## Conclusion

The Love Days Admin Portal architecture emphasizes:

- **Simplicity:** No unnecessary abstraction layers
- **Maintainability:** Clear separation of concerns
- **Scalability:** Stateless design, easily horizontally scalable
- **Type Safety:** TypeScript strict mode throughout
- **User Experience:** Responsive, dark-themed, professional UI

The architecture supports current requirements and provides foundation for future enhancements.

---

**Last Updated:** 2025-12-29
**Architecture Version:** 1.0.0
**Next Review:** 2026-01-15
