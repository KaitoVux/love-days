# Love Days Admin Dashboard

Admin dashboard for managing Love Days content (songs and images).

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Authentication:** Supabase Auth
- **Notifications:** Sonner

## Features

- 🔐 **Authentication** - Secure login with Supabase
- 📊 **Dashboard** - Overview with stats and quick actions
- 🎵 **Song Management** - Upload and manage music files
- 🖼️ **Image Management** - Upload and manage image gallery
- ⚙️ **Settings** - Account management

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

```bash
npm run dev
```

Visit http://localhost:3001

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
apps/admin/
├── app/                      # Next.js app directory
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   ├── dashboard/       # Overview page
│   │   ├── songs/           # Song management
│   │   ├── images/          # Image management
│   │   └── settings/        # Settings page
│   ├── login/               # Login page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root redirect
│   └── globals.css          # Global styles
├── components/
│   ├── auth/                # Authentication components
│   ├── dashboard/           # Dashboard components
│   ├── ui/                  # UI components (shadcn/ui)
│   ├── songs/               # Song-specific components
│   ├── images/              # Image-specific components
│   └── upload/              # Upload components
├── lib/                     # Utilities
│   ├── supabase.ts          # Supabase client
│   ├── toast.ts             # Toast utilities
│   ├── api.ts               # API client
│   └── utils.ts             # General utilities
└── hooks/                   # Custom hooks
    └── use-upload.ts        # Upload hook
```

## Design System

### Colors (Rose Pink Theme - 350 Hue)

- **Primary:** `hsl(350, 80%, 65%)` - Rose pink accent
- **Background:** `hsl(350, 30%, 8%)` - Dark background
- **Card:** `hsl(350, 20%, 10%)` - Card backgrounds
- **Border:** `hsl(350, 20%, 20%)` - Subtle borders

### Typography

- **Display Font:** Playfair Display (headings)
- **Body Font:** Nunito (body text)

### Key Features

- Dark theme optimized
- Responsive design (mobile/tablet/desktop)
- Accessible (WCAG 2.1 AA)
- Smooth animations
- Professional UI/UX

## Authentication Flow

1. User visits `/` → redirects based on auth state
2. Not authenticated → `/login`
3. Login → Supabase Auth
4. Success → `/dashboard`
5. Protected routes check auth → redirect if not authenticated

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript type checking
- `npm run clean` - Clean build artifacts

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
```

## UI Components

Built with shadcn/ui:

- Button, Card, Input, Label
- Alert, Badge, Progress
- Dialog, Dropdown Menu, Select
- Switch, Table, Toaster

All components follow the rose pink theme and are fully accessible.

## Contributing

When adding new features:

1. Follow existing code structure
2. Use TypeScript strict mode
3. Maintain design consistency
4. Test responsive design
5. Ensure accessibility
6. Run type-check before committing

## License

Private - Love Days Project
