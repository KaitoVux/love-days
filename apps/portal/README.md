# Portal App

A Next.js application for song management with a modern UI built using Shadcn UI components.

## Features

- **Authentication**: Supabase authentication with real user management
- **Song Management**: Full CRUD operations for songs
- **Search**: Search songs by title, artist, album, or genre
- **Modern UI**: Built with Shadcn UI and Tailwind CSS
- **Responsive**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Create environment file:

```bash
# Create .env.local file with your actual Supabase project credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Usage

### Login

- Navigate to `/login`
- Use the credentials for the user you've set up in Supabase:
  - **Email**: `admin@lovedays.vn`
  - **Password**: `biubuimiunemxinhdep`

### Song Management

- View all songs in a table format
- Add new songs using the "Add Song" button
- Edit existing songs by clicking the edit icon
- Delete songs by clicking the delete icon
- Search songs using the search bar

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── login/          # Login page
│   ├── songs/          # Songs management page
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   └── song-form.tsx  # Song form component
├── lib/               # Utility functions
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Technologies Used

- **Next.js 15**: React framework with app router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Supabase**: Backend-as-a-Service for authentication and database
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Modern UI components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking
