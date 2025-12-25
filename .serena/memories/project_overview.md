# Love Days - Project Overview

## Purpose

Love Days is a Next.js application with audio player functionality that uses Supabase for audio file storage. The app allows users to play songs stored in a Supabase storage bucket.

## Tech Stack

- **Framework**: Next.js 15.2.1 with React 19
- **Language**: TypeScript 5.4.2
- **Monorepo**: Turborepo with npm workspaces
- **Styling**: Tailwind CSS + Sass
- **Backend**: Supabase (for audio storage)
- **Package Manager**: npm 10.0.0
- **Pre-commit**: Husky with lint-staged

## Architecture

- **Monorepo Structure**: Uses Turborepo for build orchestration
- **Apps**:
  - `apps/web`: Main Next.js application
  - `apps/portal`: Additional app (discovered but not detailed)
- **Packages**:
  - `packages/utils`: Shared utility library used by apps
- **Environment**: Uses `.env.local` with Supabase credentials
