# Love Days Admin Dashboard

Professional content management system for the Love Days application. Manage songs, images, and control content visibility with a modern, intuitive interface.

**Status:** Phase 03 - Admin UI Implementation Complete
**Version:** 1.0.0
**Last Updated:** 2025-12-29

## Quick Links

📖 **Documentation:**

- [Project Overview & PDR](./docs/project-overview-pdr.md) - Requirements, vision, and acceptance criteria
- [Code Standards](./docs/code-standards.md) - Naming conventions and coding patterns
- [System Architecture](./docs/system-architecture.md) - Technical design and components
- [API Reference](./docs/api-reference.md) - Complete API endpoint documentation
- [Development Guide](./docs/development-guide.md) - How to develop and contribute
- [Codebase Summary](./docs/codebase-summary.md) - Generated overview of all files

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5.4.2 (strict mode)
- **Styling:** Tailwind CSS + custom rose pink theme
- **UI Components:** shadcn/ui + Radix UI primitives
- **Authentication:** Supabase Auth with SSR
- **Storage:** Supabase Storage / AWS S3 (presigned URLs)
- **Notifications:** Sonner (toast messages)

## Features

✅ **Phase 03 - Admin UI Complete**

- 🔐 **Authentication** - Secure login with Supabase, session management
- 📊 **Dashboard** - Overview and navigation hub
- 🎵 **Song Management** - Full CRUD with audio preview (play/pause in table)
- 🖼️ **Image Management** - Full CRUD with lightbox preview and category organization
- 📤 **File Upload** - Presigned URL uploads with progress tracking (up to 50MB audio)
- 🔄 **Publish Controls** - Toggle visibility for songs and images
- ⚙️ **Settings** - Account management and site rebuild webhook
- 🌙 **Dark Theme** - Rose pink (350 hue) accent color, professional styling
- 📱 **Responsive** - Mobile, tablet, and desktop support

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account with project

### Quick Setup

**1. Install dependencies:**

```bash
npm install
```

**2. Configure environment:**

```bash
cp .env.example .env.local
```

**3. Add Supabase credentials to `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api.love-days.com
```

**4. Start development server:**

```bash
npm run dev
```

Visit `http://localhost:3001` and login with your Supabase credentials.

**See [Development Guide](./docs/development-guide.md) for detailed setup and development workflow.**

## Project Structure

```
apps/admin/
├── docs/                          # Documentation
│   ├── project-overview-pdr.md   # Requirements & vision
│   ├── code-standards.md          # Conventions & patterns
│   ├── system-architecture.md     # Technical design
│   ├── api-reference.md           # API endpoints
│   ├── development-guide.md       # Development workflow
│   └── codebase-summary.md        # Generated overview
│
├── app/                           # Next.js App Router
│   ├── (dashboard)/               # Protected routes with layout
│   │   ├── layout.tsx            # Dashboard layout + sidebar
│   │   ├── dashboard/page.tsx    # Home/overview
│   │   ├── songs/                # Song CRUD routes
│   │   │   ├── page.tsx          # List songs
│   │   │   ├── new/page.tsx      # Create song
│   │   │   └── [id]/page.tsx     # Edit song
│   │   ├── images/               # Image CRUD routes
│   │   │   ├── page.tsx          # List images
│   │   │   ├── new/page.tsx      # Create image
│   │   │   └── [id]/page.tsx     # Edit image
│   │   └── settings/page.tsx     # Account settings
│   ├── login/page.tsx            # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   └── globals.css               # Global styles
│
├── components/
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard layout components
│   ├── ui/                       # shadcn/ui components
│   ├── songs/                    # Song management
│   │   ├── songs-table.tsx      # List with audio preview
│   │   └── song-form.tsx        # Create/edit form
│   ├── images/                   # Image management
│   │   ├── images-grid.tsx      # Responsive grid gallery
│   │   ├── image-form.tsx       # Create/edit form
│   │   └── image-lightbox.tsx   # Full-screen preview modal
│   └── upload/                   # File upload components
│       └── file-upload.tsx      # Dropzone + progress
│
├── lib/                          # Utilities
│   ├── api.ts                   # Centralized API client
│   ├── supabase.ts              # Supabase SSR client
│   ├── toast.ts                 # Toast helpers
│   └── utils.ts                 # General utilities
│
├── hooks/                        # Custom React hooks
│   └── use-upload.ts            # Upload state & progress
│
├── middleware.ts                 # Auth middleware
├── tailwind.config.ts           # Tailwind theme (rose pink)
├── next.config.js               # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## Key Features Explained

### Songs Management

- **List:** Display all songs in table with title, artist, album, publish status
- **Audio Preview:** Play/pause directly in table row
- **Create:** Upload MP3/WAV/M4A/OGG files (up to 50MB) with metadata
- **Edit:** Update title, artist, album metadata
- **Delete:** Remove song with confirmation
- **Publish:** Toggle visibility with switch control

### Images Management

- **Grid Gallery:** Responsive layout (1/2/3 columns based on screen size)
- **Categories:** Profile, background, gallery with color-coded badges
- **Lightbox:** Full-screen preview modal on click
- **Create:** Upload images with title, description, category
- **Edit:** Update metadata
- **Delete:** Remove with confirmation
- **Publish:** Toggle visibility with switch control

### File Upload

- **Drag & Drop:** Dropzone support
- **Progress Tracking:** Visual upload progress bar
- **Validation:** File size (max 50MB audio), MIME type
- **Error Handling:** User-friendly error messages
- **Presigned URLs:** Direct upload to storage, no server bottleneck

## Design System

### Color Palette (350 Hue - Rose Pink)

- **Primary:** `hsl(350, 80%, 65%)` - Rose pink accent
- **Background:** `hsl(350, 30%, 8%)` - Very dark background
- **Foreground:** `hsl(350, 20%, 95%)` - Light text
- **Card:** `hsl(350, 20%, 10%)` - Card backgrounds
- **Muted:** `hsl(350, 10%, 40%)` - Muted text
- **Border:** `hsl(350, 20%, 20%)` - Subtle borders

### Typography

- **Display:** Playfair Display (headings)
- **Body:** System UI fallback (readable sans-serif)

## Available Scripts

```bash
npm run dev              # Start dev server (port 3001, Turbopack)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint checks
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking
npm run clean           # Remove build artifacts
```

## Code Quality Standards

**All code must:**

- ✅ Pass TypeScript strict mode
- ✅ Pass ESLint checks
- ✅ Follow naming conventions (Components: PascalCase, utils: camelCase)
- ✅ Have proper error handling
- ✅ Include loading/disabled states
- ✅ Use API client for requests
- ✅ Be formatted with Prettier

**Pre-commit Checklist:**

```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint validation
npm run format      # Apply Prettier formatting
npm run build       # Verify production build
```

## Environment Variables

**Required:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=https://api.love-days.com
```

**Optional:**

```env
NEXT_PUBLIC_CLOUDFLARE_DEPLOY_HOOK_URL=https://...  # For site rebuilds
```

All `NEXT_PUBLIC_*` variables are visible in the browser. Never put secrets in them.

## API Integration

All API endpoints go through the centralized client in `lib/api.ts`:

**Songs API:**

- `songsApi.list(published?)` - Get all/published songs
- `songsApi.get(id)` - Get single song
- `songsApi.create(data)` - Create new song
- `songsApi.update(id, data)` - Update metadata
- `songsApi.delete(id)` - Delete song
- `songsApi.publish(id, bool)` - Toggle publish
- `songsApi.getUploadUrl()` - Get presigned upload URL

**Images API:**

- `imagesApi.list(category?)` - Get all/filtered images
- `imagesApi.get(id)` - Get single image
- `imagesApi.create(data)` - Create new image
- `imagesApi.update(id, data)` - Update metadata
- `imagesApi.delete(id)` - Delete image
- `imagesApi.publish(id, bool)` - Toggle publish
- `imagesApi.getUploadUrl()` - Get presigned upload URL

**See [API Reference](./docs/api-reference.md) for complete endpoint documentation.**

## Contributing

### Getting Started with Development

1. Read [Project Overview](./docs/project-overview-pdr.md) for context
2. Review [Code Standards](./docs/code-standards.md) for conventions
3. Check [Development Guide](./docs/development-guide.md) for workflow
4. Follow the development cycle described in that guide

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Start development
npm run dev

# 3. Make changes and commit
git add .
git commit -m "feat: description of changes"

# 4. Verify quality before pushing
npm run type-check
npm run lint
npm run format
npm run build

# 5. Push and create PR
git push -u origin feature/description
```

### Code Review Requirements

- Must follow code standards
- Must pass all linting checks
- Must have TypeScript strict mode compliance
- Must be reviewed before merge

## Performance Targets

- **Page Load:** < 2 seconds
- **API Response:** < 500ms
- **Build Size:** Optimized with code splitting
- **Accessibility:** WCAG 2.1 AA compliance

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### Type Errors

```bash
npm run type-check
```

### Lint Errors

```bash
npm run lint:fix
```

### Build Fails

```bash
npm run clean
npm run build
```

## License

Private - Love Days Project

## Support

- **Documentation:** See `docs/` directory
- **Development Help:** See [Development Guide](./docs/development-guide.md)
- **API Help:** See [API Reference](./docs/api-reference.md)
- **Architecture:** See [System Architecture](./docs/system-architecture.md)
