# Love Days - Project Overview

**Version**: 2.0
**Last Updated**: 2025-12-29
**Tech Stack**: Next.js 15, React 19, NestJS 11, TypeScript 5.4, Turborepo, Tailwind CSS, Supabase, Prisma 7
**Status**: Active Development (Phase 05 Complete - Backend Foundation Deployed)

## Quick Summary

Love Days is a modern, design-focused Next.js audio player application. Built as a Turborepo monorepo with TypeScript-first approach. Features an elegant UI with HSL-based theme system, Supabase-powered audio storage, and prepared App Router migration path.

**Core Purpose**: Beautiful, functional music player with backend content management system for non-technical admin users.

## Tech Stack

### Frontend

| Layer             | Technology          | Version | Purpose                          |
| ----------------- | ------------------- | ------- | -------------------------------- |
| **Framework**     | Next.js             | 15.2.1  | Server/static rendering, routing |
| **Language**      | TypeScript          | 5.4.2   | Type-safe development            |
| **UI Framework**  | React               | 19.0.0  | Component system                 |
| **Styling**       | Tailwind CSS        | 3.4.1   | Utility-first CSS                |
| **CSS Processor** | Sass                | 1.71.1  | CSS preprocessing                |
| **Icons**         | Lucide React        | 0.562.0 | Icon library                     |
| **Components**    | shadcn/ui           | -       | Headless UI components           |
| **Animations**    | tailwindcss-animate | 1.0.7   | Built-in animations              |

### Backend

| Layer              | Technology       | Version | Purpose                        |
| ------------------ | ---------------- | ------- | ------------------------------ |
| **Framework**      | NestJS           | 11.0.1  | Modular Node.js backend        |
| **ORM**            | Prisma           | 7.2.0   | Type-safe database access      |
| **Database**       | PostgreSQL       | -       | Relational database (Supabase) |
| **Authentication** | Supabase Auth    | -       | JWT token validation           |
| **File Storage**   | Supabase Storage | -       | Audio/image file hosting       |
| **Deployment**     | Vercel           | -       | Serverless functions           |
| **API Docs**       | Swagger/OpenAPI  | -       | Interactive API documentation  |

### Monorepo

| Tool               | Version | Purpose                           |
| ------------------ | ------- | --------------------------------- |
| **Turborepo**      | 2.5.3   | Workspace orchestration & caching |
| **npm Workspaces** | 10.0.0  | Package management                |

## Architecture

### Monorepo Structure

```
love-days/
├── apps/
│   ├── web/              # Frontend: Next.js 15 (Cloudflare Pages)
│   ├── api/              # Backend: NestJS 11 (Vercel Serverless) ✅ PHASE 1
│   └── portal/           # Secondary application
├── packages/
│   ├── utils/            # Shared utilities (dates, song data)
│   └── types/            # Shared TypeScript types (DTOs, interfaces) ✅ PHASE 1
├── docs/                 # Project documentation
├── turbo.json            # Turborepo configuration
├── package.json          # Workspace root
└── .github/workflows/    # CI/CD pipelines
```

### Web App Structure

```
apps/web/
├── app/                  # App Router (active, Phase 02 ✅)
│   ├── layout.tsx        # Root layout with metadata API
│   └── page.tsx          # Home page (updated Phase 04)
├── pages/                # Legacy (empty, kept for future API routes)
├── components/
│   ├── LoveDays/         # Main feature components (Phase 04 ✅)
│   │   ├── Title.tsx     # Main title with hearts
│   │   ├── ProfileSection.tsx  # Profile images & names
│   │   ├── CountUp.tsx   # Days counter + clock
│   │   ├── Footer.tsx    # Footer text
│   │   ├── FloatingHearts.tsx  # Background animation
│   │   └── index.ts      # Barrel export
│   ├── Player/           # Main audio player (client component)
│   ├── ui/               # shadcn/ui components (ready to install)
│   └── [feature]/        # Other feature-specific components
├── lib/
│   └── utils.ts          # cn() for className merging
├── styles/
│   ├── globals.scss      # Global styles + CSS variables (HSL theme)
│   └── [module].scss     # Component-scoped styles (legacy)
├── public/               # Static assets (favicon, images)
├── next.config.js        # Next.js config (static export enabled)
├── tailwind.config.ts    # Tailwind configuration (TypeScript)
├── tsconfig.json         # TypeScript config with path aliases (@/)
└── package.json          # App-specific dependencies

packages/utils/
├── src/
│   ├── types.ts          # Shared interfaces (ISong)
│   ├── songs.ts          # Song data + Supabase URL generation
│   └── date-utils.ts     # Date manipulation functions
├── dist/                 # Compiled output
├── package.json
└── tsconfig.json

packages/types/  ✅ NEW PHASE 1
├── src/
│   ├── song.ts           # ISong, CreateSongDto, SongResponseDto
│   ├── image.ts          # IImage, CreateImageDto, ImageResponseDto
│   └── index.ts          # Barrel exports
├── dist/                 # Compiled output
├── package.json
└── tsconfig.json

apps/api/  ✅ NEW PHASE 1
├── src/
│   ├── main.ts           # Application bootstrap + CORS + Swagger
│   ├── app.module.ts     # Root module
│   ├── app.controller.ts # Health check endpoint
│   ├── auth/
│   │   ├── auth.guard.ts        # Supabase JWT validation
│   │   ├── auth.service.ts      # Token verification logic
│   │   └── auth.module.ts       # Auth module
│   ├── songs/
│   │   ├── songs.controller.ts  # REST endpoints
│   │   ├── songs.service.ts     # Business logic
│   │   ├── songs.module.ts      # Module config
│   │   └── dto/
│   │       ├── create-song.dto.ts
│   │       └── update-song.dto.ts
│   ├── images/
│   │   ├── images.controller.ts # REST endpoints
│   │   ├── images.service.ts    # Business logic
│   │   ├── images.module.ts     # Module config
│   │   └── dto/
│   │       ├── create-image.dto.ts
│   │       └── update-image.dto.ts
│   ├── prisma/
│   │   ├── prisma.service.ts    # Database client
│   │   └── prisma.module.ts     # Prisma module
│   └── common/
│       └── interfaces/
│           └── request-with-user.interface.ts
├── prisma/
│   ├── schema.prisma     # Database schema (songs, images tables)
│   └── migrations/       # Database migrations
├── test/                 # E2E tests
├── vercel.json           # Vercel serverless config
├── .env.sample           # Environment template
├── package.json          # NestJS dependencies
└── tsconfig.json         # TypeScript config
```

## Key Features

### 1. NestJS Backend API ✅ PHASE 1

**Status**: Production-ready, deployed to Vercel Serverless

- **Song Management**: CRUD metadata operations
- **Image Management**: CRUD metadata operations
- **Authentication**: Supabase JWT validation
- **Database**: PostgreSQL via Prisma ORM with Prisma 7 adapter
- **API Documentation**: Swagger/OpenAPI at `/api/docs`
- **CORS**: Configured for multi-domain access
- **TypeScript**: Shared types with `@love-days/types` package
- **Deployment**: Vercel serverless functions
- **Local Development**: Port 3001

**Endpoints**:

- `GET /api/v1/songs` - List published songs
- `POST /api/v1/songs` - Create song (admin)
- `PATCH /api/v1/songs/:id` - Update song (admin)
- `DELETE /api/v1/songs/:id` - Delete song (admin)
- `GET /api/v1/images` - List images
- `POST /api/v1/images` - Create image (admin)

**Phase 2 Coming**: Presigned URL file uploads, Sharp thumbnails, direct Supabase Storage integration

### 2. Audio Player (`apps/web/components/Player`)

- Playlist management
- Play/pause/skip controls
- Progress visualization
- Current time / duration display
- Volume control
- Uses Supabase Storage for audio files

### 3. Design System

- **Theme**: HSL-based color system (11 primary variables)
- **Fonts**: Three-tier hierarchy (display, body, sans)
- **Icons**: 580+ icons available (Lucide React)
- **Animations**: Fade-in, pulse, float effects
- **Components**: shadcn/ui ready (Button, Dialog, Card, etc.)

### 3. Data Layer

- **Song Metadata**: Static array in `packages/utils/src/songs.ts`
- **Audio Files**: Public Supabase bucket (`songs/`)
- **Types**: Shared `ISong` interface
- **URL Generation**: Automatic Supabase Storage URLs

### 4. Responsive Design

- Mobile-first approach
- Breakpoints: xs (320px), sm, md, lg, xl, 2xl
- CSS Modules for scoped styling
- Tailwind for utility styling
- Dark mode support (class-based)

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Create .env.local
cp apps/web/.env.sample apps/web/.env.local

# Add Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Common Commands

```bash
# Development (all apps)
npm run dev

# Development (web app only with Turbopack)
cd apps/web && npm run dev

# Build all
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Clean artifacts
npm run clean
```

### Pre-commit Hooks

Husky + lint-staged automatically:

1. Format changed files with Prettier
2. Run ESLint checks
3. Block commit if failures

**Skip hooks** (discouraged):

```bash
git commit --no-verify
```

## Code Standards

### TypeScript

- Strict mode enabled
- No implicit `any` types
- All exports typed
- `_` prefix for unused variables

### Formatting (Prettier)

- Line length: 100 characters
- Indentation: 2 spaces
- Quotes: Double
- Trailing commas: ES5
- Semicolons: Required

### Linting (ESLint)

- next/core-web-vitals
- typescript-eslint recommended
- Unused imports auto-removed
- Prettier integration enabled

### CSS

- CSS Modules for component scope
- Sass for preprocessing
- Tailwind for utilities
- BEM naming when needed

## Component Library

### Available from shadcn/ui (Installed)

**Installed in Phase 01**:

- @radix-ui/react-slider (base primitive)
- class-variance-authority (component variants)
- tailwindcss-animate (animations)

**To Install** (planned):

- Button
- Dialog / Modal
- Card
- Input
- Select
- Tabs
- Dropdown Menu
- Popover
- Toast
- Drawer
- Sidebar

## Build & Deployment

### Current Configuration

- **Router**: Pages Router (static export)
- **Output**: Static HTML/CSS/JS
- **Export Directory**: `apps/web/out/`
- **Images**: Unoptimized for static hosting
- **Env Variables**: Build-time (embedded in static files)

### Deployment Targets

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static host (S3, etc.)

### Build Process

```bash
npm run build
# Outputs to:
# - apps/web/.next/ (temporary)
# - apps/web/out/ (final static export)
```

## Environment Configuration

### Required Variables

**File**: `apps/web/.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables (Planned)

- `NEXT_PUBLIC_APP_ROUTER_ENABLED` (Phase 02)
- `NEXT_PUBLIC_ANALYTICS_ID` (Phase 03)

## Project Phases

### Phase 01: Foundation Setup ✅ COMPLETE

- shadcn/ui setup
- HSL theme system
- TypeScript configs
- Utility functions
- No breaking changes

**Deliverables**:

- 6 new dependencies
- TypeScript Tailwind config
- CSS variable system
- @lib/\* path alias
- UI component structure

### Phase 02: App Router Migration ✅ COMPLETE

✅ **Completed 2025-12-26**:

- App Router directory created
- Root layout with metadata API implemented
- Home page migrated (app/page.tsx)
- Metadata API replaces Head component
- Static export verified working
- All functionality preserved
- Type safety verified (strict mode passes)

**Deliverables**:

- New app/layout.tsx with Metadata API
- New app/page.tsx using existing components
- Pages Router files deprecated
- Static export to out/index.html
- 50+ lines added, full compatibility maintained

### Phase 03: Theme System & Animations ✅ COMPLETE

✅ **Completed 2025-12-25**:

- Tailwind animations configured (fade-in, pulse-slow, float, float-up)
- CSS Keyframe animations defined
- Custom animation classes in globals.scss
- Animation delays and durations optimized

**Deliverables**:

- Updated tailwind.config.ts with animations
- Enhanced globals.scss with animation definitions
- Responsive animation timing

### Phase 04: Component Refactor ✅ COMPLETE

✅ **Completed 2025-12-26**:

- 5 new components created (Title, ProfileSection, CountUp, Footer, FloatingHearts)
- Tailwind-first styling approach implemented
- lucide-react icons integrated
- Server/client component separation
- Responsive design (xs/md/lg breakpoints)
- Barrel exports for clean imports
- Animation staggering implemented

**Deliverables**:

- components/LoveDays/ directory with 5 components
- app/page.tsx updated with new component layout
- Hydration-safe patterns applied
- All build checks passing (type-check, lint, build)

### Phase 05: Music Player Integration (PLANNED)

- Integrate existing Player component
- Add sidebar with controls
- Test audio playback
- Responsive layout tuning

### Phase 06: Advanced Features (PLANNED)

- User authentication
- Playlist management
- Search functionality
- Dark mode toggle
- Settings page

## File Size & Performance

### Current Metrics

- **Next.js Bundle**: ~180KB (gzipped)
- **React**: ~41KB (gzipped)
- **Tailwind CSS**: ~15KB (gzipped)
- **Total Overhead**: ~256KB

### Fonts

- Playfair Display: ~2 weights
- Cormorant Garamond: ~3 weights
- Nunito: ~4 weights
- **Total Font Size**: ~150KB (cached by browser)

### Images

- Unoptimized (static export)
- Album artwork fetched from external URLs
- No local image assets yet

## TypeScript Paths

```json
{
  "@/*": "./*",
  "@components/*": "components/*",
  "@components": "components",
  "@public/*": "public/*",
  "@public": "public",
  "@styles/*": "styles/*",
  "@styles": "styles",
  "@utils/*": "utils/*",
  "@utils": "utils",
  "@lib/*": "lib/*"
}
```

## CSS Architecture

### Hierarchy

1. **Tailwind Base** (`@tailwind base`) - Reset + HTML defaults
2. **CSS Variables** (`:root`) - Theme colors + sizing
3. **Google Fonts** (`@import`) - Custom typography
4. **Tailwind Components** (`@tailwind components`) - Utility classes
5. **Custom Utilities** (`@layer utilities`) - `.text-gradient`, `.glow-primary`
6. **Tailwind Utilities** (`@tailwind utilities`) - All responsive utilities
7. **Module Styles** (`*.module.scss`) - Component scoped CSS

### Color System

All colors defined as CSS variables with HSL format:

```css
--primary: 350 80% 65%;        /* hsl(350, 80%, 65%) */
hsl(var(--primary))            /* Used in Tailwind config */
```

Advantage: Easy theme switching by updating `:root` vars.

## Dependencies Graph

### Direct Production Dependencies

```
apps/web:
├── @love-days/utils (internal)
├── @radix-ui/react-slider
├── class-variance-authority
├── clsx
├── dayjs
├── lucide-react
├── next
├── react & react-dom
├── sharp
├── tailwind-merge
└── tailwindcss-animate

packages/utils:
└── (0 external dependencies)
```

### Development Dependencies

- TypeScript
- ESLint + plugins
- Prettier
- Tailwind CSS
- PostCSS
- Sass
- Next.js ESLint config

## Security Considerations

### Current Setup

✅ **Safe**:

- Supabase anon key public (storage-only)
- No sensitive data in client
- No database operations
- Static export (no server secrets)

🔒 **If Adding Features**:

- Implement Row Level Security (RLS)
- Server-side API routes for sensitive ops
- Input validation
- Rate limiting

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 12+, Android 5+

**Note**: Older browsers need polyfills (not configured yet).

## Monitoring & Logging

Currently no observability. Considered additions:

- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics
- Log aggregation

## Related Documentation

- [UI Theme Refactor Phase 01](./UI_THEME_REFACTOR_PHASE01.md)
- [Supabase Integration](./SUPABASE_INTEGRATION.md)
- [Code Standards](./CODE_STANDARDS.md) (if exists)
- [System Architecture](./SYSTEM_ARCHITECTURE.md) (if exists)

## Links & Resources

### Official Docs

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

### Component Libraries

- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

### Related Projects

- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)

## FAQ

**Q: When does App Router migration happen?**
A: Phase 02 (planning in progress).

**Q: Can I use shadcn/ui components now?**
A: Yes! Install via `npx shadcn-ui@latest add [component]`. Structure ready.

**Q: How do I customize colors?**
A: Edit CSS variables in `apps/web/styles/globals.scss` `:root` block.

**Q: Is dark mode supported?**
A: Yes, add `class="dark"` to root element. CSS variables support both themes.

**Q: Can I use Pages Router during App Router migration?**
A: Yes! Both work simultaneously during Phase 02.

**Q: How are fonts loaded?**
A: Google Fonts via `@import` in `globals.scss` (no local files yet).

## Unresolved Questions

- Exact timeline for Phase 02 completion
- Feature priorities for Phase 03
- Storybook vs documentation site for components
- Analytics integration timing (Phase 03 or 04)
