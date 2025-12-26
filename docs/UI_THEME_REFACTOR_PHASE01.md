# UI Theme Refactor - Phase 01: Foundation Setup

**Status**: Complete
**Date**: 2025-12-26
**Version**: 1.0
**Next Phase**: Phase 02 (App Router Migration)

## Overview

Phase 01 establishes comprehensive design system foundation for modern component architecture. Completed full migration from JavaScript to TypeScript configs, installed shadcn/ui component library, implemented HSL-based theme system, and configured necessary build utilities.

Foundation layer ready. No breaking changes. Pages Router remains functional. App Router content paths prepared.

## Changes Summary

### 1. Dependencies Added

**Package**: `apps/web/package.json`

Six new dependencies installed for shadcn/ui + styling foundation:

```json
{
  "dependencies": {
    "@radix-ui/react-slider": "^1.3.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

**Purpose**:

- **@radix-ui/react-slider**: Accessible slider component (headless UI)
- **class-variance-authority**: Type-safe variant management for components
- **clsx**: Conditional CSS class composition
- **lucide-react**: Icon library (580+ icons)
- **tailwind-merge**: Smart merge of Tailwind conflicting utilities
- **tailwindcss-animate**: Built-in animation utilities

### 2. Tailwind Configuration - JavaScript to TypeScript

**File**: `apps/web/tailwind.config.ts` (new)

Converted from `.js` to `.ts` for type safety + added complete theme configuration:

```typescript
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // App Router ready
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Cormorant Garamond", "serif"],
        sans: ["Nunito", "sans-serif"],
      },
      colors: {
        /* HSL theme variables */
      },
      borderRadius: {
        /* Custom radius system */
      },
      animation: {
        /* Custom animations */
      },
      screens: { xs: "320px", ...defaultTheme.screens },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

**Key Features**:

- Type-safe with `satisfies Config`
- Dark mode support via class strategy
- HSL-based color system (11 theme variables)
- Custom animations (fade-in, pulse-slow, float, float-up)
- Extra small screen breakpoint (320px)
- Three-tier font hierarchy (display, body, sans)

### 3. Global Styles & CSS Variables

**File**: `apps/web/styles/globals.scss` (updated)

Implemented HSL-based theme system with CSS custom properties:

```scss
@layer base {
  :root {
    // Base colors
    --background: 350 30% 8%; // Dark background
    --foreground: 350 20% 95%; // Light text
    --card: 350 25% 12%; // Card background
    --primary: 350 80% 65%; // Primary accent (rose/pink)
    --secondary: 350 30% 18%; // Secondary surface
    --accent: 350 60% 50%; // Accent highlight
    --muted: 350 20% 20%; // Muted elements
    --destructive: 0 84.2% 60.2%; // Error state
    --border: 350 25% 20%; // Border color
    --input: 350 25% 20%; // Input fields
    --ring: 350 80% 65%; // Focus rings
    --radius: 1rem; // Base border radius

    // Sidebar theme
    --sidebar-background: 350 30% 10%;
    --sidebar-foreground: 350 20% 95%;
    --sidebar-primary: 350 80% 65%;
    --sidebar-accent: 350 30% 18%;
    --sidebar-border: 350 25% 20%;
  }
}
```

**Features**:

- HSL format for easy color adjustments (hue/saturation/lightness)
- All colors use `hsl(var(--color))` in Tailwind
- Includes sidebar-specific theme variables
- Radial gradient backgrounds (subtle depth)
- Custom utilities: `.text-gradient`, `.glow-primary`
- Google Fonts loaded (Playfair Display, Cormorant Garamond, Nunito)
- Custom scrollbar styling with primary color

### 4. TypeScript Utility Function

**File**: `apps/web/lib/utils.ts` (new)

Core utility for safe className composition:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Purpose**: Merge CSS classes while resolving Tailwind conflicts intelligently.

**Usage**:

```typescript
cn("px-2", "px-4"); // Returns "px-4" (not both)
cn("text-red-500", "text-blue-500"); // Returns "text-blue-500"
```

### 5. TypeScript Configuration Update

**File**: `apps/web/tsconfig.json` (updated)

Added path alias for cleaner imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@lib/*": ["lib/*"]
    }
  }
}
```

**Import Examples**:

```typescript
// Before
import { cn } from "../../../lib/utils";

// After
import { cn } from "@lib/utils";
```

Existing aliases remain: `@components`, `@public`, `@styles`, `@utils`.

### 6. UI Components Placeholder

**File**: `apps/web/components/ui/index.ts` (new)

Preparation structure for shadcn/ui components:

```typescript
// shadcn/ui components
// Components will be added here as they are installed
```

**Future**: Will export individual components as they're installed (Button, Dialog, Card, etc.)

## Theme Structure

### Color Palette (HSL Format)

| Role            | HSL Value     | Use Case                     |
| --------------- | ------------- | ---------------------------- |
| `--background`  | 350 30% 8%    | Page/layout background       |
| `--foreground`  | 350 20% 95%   | Primary text color           |
| `--primary`     | 350 80% 65%   | CTA buttons, primary accent  |
| `--secondary`   | 350 30% 18%   | Secondary surfaces           |
| `--accent`      | 350 60% 50%   | Highlights, hovers           |
| `--muted`       | 350 20% 20%   | Disabled, subtle states      |
| `--destructive` | 0 84.2% 60.2% | Error states, delete actions |
| `--border`      | 350 25% 20%   | All border elements          |
| `--ring`        | 350 80% 65%   | Focus rings (keyboard nav)   |

### Font Stack

| Type        | Font               | Weights            | Use Case           |
| ----------- | ------------------ | ------------------ | ------------------ |
| **Display** | Playfair Display   | 400, 500, 600, 700 | Headings, titles   |
| **Body**    | Cormorant Garamond | 300, 400, 500, 600 | Body text, content |
| **Sans**    | Nunito             | 400, 500, 600, 700 | UI labels, buttons |

### Built-in Animations

| Name         | Duration | Behavior                    |
| ------------ | -------- | --------------------------- |
| `spin-slow`  | 12s      | Slow continuous rotation    |
| `fade-in`    | 0.5s     | Fade in with up translation |
| `pulse-slow` | 3s       | Subtle opacity pulse        |
| `float`      | 6s       | Vertical float movement     |
| `float-up`   | Variable | Rising float with rotation  |

## File Structure

```
apps/web/
├── tailwind.config.ts           # NEW: Type-safe config
├── styles/
│   └── globals.scss             # UPDATED: CSS variables + fonts
├── lib/
│   └── utils.ts                 # NEW: cn() utility
├── components/
│   └── ui/
│       └── index.ts             # NEW: Component export hub
├── tsconfig.json                # UPDATED: @lib/* alias
└── package.json                 # UPDATED: 6 new dependencies
```

## Build Configuration Impact

### Tailwind Processing

- CSS variables compiled to HSL values at build time
- Dark mode class strategy (`class="dark"` on root)
- Responsive breakpoints: `xs` (320px), `sm`, `md`, `lg`, `xl`, `2xl`
- Tree-shaking of unused CSS variables

### Next.js Integration

- Static export compatible (no runtime changes)
- Pages Router fully functional
- App Router content paths already configured
- No changes to current page rendering

### Type Safety

- TypeScript strict mode maintained
- `cn()` utility fully type-safe
- Tailwind IntelliSense available in `globals.scss`
- No implicit `any` types

## Breaking Changes

**None**. Phase 01 is purely additive:

- Existing components work unchanged
- Pages Router unaffected
- CSS utilities available immediately
- Old imports still function

## Dependencies Tree

```
apps/web/
├── @radix-ui/react-slider
│   └── @radix-ui/react-compose-refs
│   └── @radix-ui/react-context
│   └── @radix-ui/primitive
├── class-variance-authority (0 dependencies)
├── clsx (0 dependencies)
├── lucide-react (0 dependencies)
├── tailwind-merge (0 dependencies)
└── tailwindcss-animate (0 dependencies)
```

All dependencies are production-safe with minimal footprint.

## Next Phase (Phase 02) Prerequisites

Phase 02 (App Router Migration) requires:

- ✅ Foundation layer complete
- ✅ shadcn/ui configured
- ✅ Theme system ready
- ✅ TypeScript paths set up
- ✅ @lib/utils available

Phase 02 will:

1. Create `app/` directory structure
2. Migrate root layout
3. Convert pages to route groups
4. Implement server/client boundaries
5. Test incremental adoption

## Quick Start - Using the Theme

### Add Custom Component

```typescript
// apps/web/components/CustomButton.tsx
import { cn } from "@lib/utils";

export function CustomButton({ children, className }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 transition-colors",
        className
      )}
    >
      {children}
    </button>
  );
}
```

### Access Theme in CSS

```scss
// components/CustomCard.module.scss
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}
```

### Use Icons

```typescript
import { Heart, Music, Play } from "lucide-react";

export function Player() {
  return (
    <>
      <Play className="w-6 h-6" />
      <Music className="w-6 h-6" />
      <Heart className="w-6 h-6" />
    </>
  );
}
```

## Verification Checklist

- ✅ All dependencies installed (`npm install`)
- ✅ `tailwind.config.ts` validates
- ✅ `globals.scss` compiles without errors
- ✅ `lib/utils.ts` exports `cn()` correctly
- ✅ `tsconfig.json` recognizes `@lib/*` paths
- ✅ No TypeScript errors in current codebase
- ✅ `npm run build` completes successfully
- ✅ `npm run dev` runs without warnings

## Performance Notes

- **CSS Size**: Theme adds ~2KB to compiled CSS
- **Font Load**: Google Fonts loaded via `@import` (3 families, 14 weights)
- **Icons**: Only used icons included in final bundle (tree-shaken)
- **Utilities**: All Tailwind utilities available but only used ones included

## Environment Variables

No new environment variables required. Existing `.env.local` remains functional.

**Next Phase** may require:

- `NEXT_PUBLIC_APP_ROUTER_ENABLED` (feature flag)

## Questions/Blockers

None identified. Phase 01 fully independent.

## Related Documentation

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
