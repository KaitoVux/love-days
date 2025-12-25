# Suggested Commands

## Development Commands

- `npm run dev` - Start development server for all apps (uses Turbo)
- `npm run build` - Build all apps and packages
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts (.next, .turbo directories)

## Code Quality Commands

- `npm run lint` - Run ESLint across all apps/packages
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Workspace-specific Commands

- `cd apps/web && npm run dev` - Run only the web app with Turbopack
- `cd apps/web && npm run type-check` - Type check only web app
- `cd packages/utils && npm run build` - Build only utils package

## Pre-commit Hooks

Pre-commit hooks automatically run:

1. lint-staged (Prettier formatting)
2. Project-wide lint check
3. Must pass for commit to succeed

## Environment Setup

1. Copy `apps/web/.env.sample` to `apps/web/.env.local`
2. Add Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
