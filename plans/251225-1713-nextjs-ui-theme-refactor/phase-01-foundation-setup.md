# Phase 01: Foundation Setup

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** None (first phase)
**Related Docs:** [shadcn Integration Research](./research/researcher-shadcn-integration.md)

---

## Overview

| Field     | Value      |
| --------- | ---------- |
| Date      | 2025-12-25 |
| Priority  | Critical   |
| Status    | Pending    |
| Est. Time | 2-3 hours  |

Install shadcn/ui dependencies, configure Tailwind theme with HSL CSS variables, setup component infrastructure for App Router migration.

---

## Key Insights from Research

1. **shadcn installation** requires: `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`
2. **HSL color system** uses format `350 80% 65%` (no hsl() wrapper in CSS vars)
3. **SCSS coexistence** - CSS variables bridge both Tailwind and SCSS
4. **lucide-react** for icons, consistent with shadcn components
5. **@radix-ui/react-slider** dependency for Slider component

---

## Requirements

### Must Have

- [ ] Install shadcn/ui base dependencies
- [ ] Configure tailwind.config.ts with HSL color system
- [ ] Create CSS variables in global styles
- [ ] Add lucide-react for icons
- [ ] Create `lib/utils.ts` with `cn()` helper
- [ ] Create `components/ui/` directory structure

### Should Have

- [ ] Configure path aliases for `@/` imports
- [ ] Add tailwindcss-animate plugin

### Nice to Have

- [ ] Setup components.json for shadcn CLI

---

## Architecture Decisions

### 1. Tailwind Config Structure

Use TypeScript config (`tailwind.config.ts`) for type safety:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default { ... } satisfies Config;
```

### 2. CSS Variables Location

Define in `styles/globals.scss` within `@layer base`:

```scss
@layer base {
  :root {
    --background: 350 30% 8%;
    --foreground: 350 20% 95%;
    // ...
  }
}
```

### 3. cn() Utility Pattern

Standard shadcn pattern for class merging:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Related Code Files

| File                           | Action  | Purpose                  |
| ------------------------------ | ------- | ------------------------ |
| `apps/web/package.json`        | Modify  | Add dependencies         |
| `apps/web/tailwind.config.js`  | Replace | Convert to TS, add theme |
| `apps/web/styles/globals.scss` | Modify  | Add CSS variables        |
| `apps/web/lib/utils.ts`        | Create  | cn() helper              |
| `apps/web/components/ui/`      | Create  | shadcn components dir    |
| `apps/web/tsconfig.json`       | Modify  | Add @/ path alias        |

---

## Implementation Steps

### Step 1: Install Dependencies (10 min)

```bash
cd apps/web
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react
npm install @radix-ui/react-slider  # For music player later
```

### Step 2: Convert Tailwind Config to TypeScript (15 min)

Rename `tailwind.config.js` -> `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // For App Router
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Cormorant Garamond", "serif"],
        sans: ["Nunito", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-up": "float-up linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": {
            transform: "translateY(-100vh) rotate(360deg)",
            opacity: "0",
          },
        },
      },
      screens: {
        xs: "320px",
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Step 3: Update globals.scss with CSS Variables (20 min)

Add to `styles/globals.scss`:

```scss
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600&family=Nunito:wght@400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 350 30% 8%;
    --foreground: 350 20% 95%;
    --card: 350 25% 12%;
    --card-foreground: 350 20% 95%;
    --popover: 350 25% 12%;
    --popover-foreground: 350 20% 95%;
    --primary: 350 80% 65%;
    --primary-foreground: 350 20% 98%;
    --secondary: 350 30% 18%;
    --secondary-foreground: 350 20% 95%;
    --muted: 350 20% 20%;
    --muted-foreground: 350 15% 65%;
    --accent: 350 60% 50%;
    --accent-foreground: 350 20% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 350 25% 20%;
    --input: 350 25% 20%;
    --ring: 350 80% 65%;
    --radius: 1rem;

    --sidebar-background: 350 30% 10%;
    --sidebar-foreground: 350 20% 95%;
    --sidebar-primary: 350 80% 65%;
    --sidebar-primary-foreground: 350 20% 98%;
    --sidebar-accent: 350 30% 18%;
    --sidebar-accent-foreground: 350 20% 95%;
    --sidebar-border: 350 25% 20%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-body antialiased;
    background-image:
      radial-gradient(ellipse at top, hsl(350 80% 65% / 0.08), transparent 50%),
      radial-gradient(
        ellipse at bottom,
        hsl(320 70% 50% / 0.05),
        transparent 50%
      );
    min-height: 100vh;
  }
}

@layer utilities {
  .font-display {
    font-family: "Playfair Display", serif;
  }
  .font-body {
    font-family: "Cormorant Garamond", serif;
  }
  .font-sans-clean {
    font-family: "Nunito", sans-serif;
  }
  .text-gradient {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(
      135deg,
      hsl(350 80% 70%),
      hsl(320 70% 60%)
    );
  }
  .glow-primary {
    box-shadow: 0 0 40px hsl(350 80% 65% / 0.3);
  }
}
```

### Step 4: Create lib/utils.ts (5 min)

```typescript
// apps/web/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 5: Update tsconfig.json Path Alias (5 min)

Add/update in `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@lib/*": ["lib/*"]
    }
  }
}
```

### Step 6: Create UI Components Directory (10 min)

```bash
mkdir -p apps/web/components/ui
```

Create placeholder for future shadcn components:

```typescript
// apps/web/components/ui/index.ts
export * from "./button";
export * from "./slider";
// Add more as installed
```

### Step 7: Verify Build (15 min)

```bash
cd apps/web
npm run type-check
npm run lint
npm run build
```

---

## Todo List

- [ ] Install npm dependencies
- [ ] Rename tailwind.config.js to tailwind.config.ts
- [ ] Update Tailwind config with theme
- [ ] Update globals.scss with CSS variables
- [ ] Create lib/utils.ts
- [ ] Update tsconfig.json paths
- [ ] Create components/ui directory
- [ ] Verify build passes

---

## Success Criteria

1. `npm run build` succeeds with no errors
2. `npm run type-check` passes
3. CSS variables defined in `:root`
4. `cn()` utility available for imports
5. tailwindcss-animate plugin active
6. lucide-react installed and importable

---

## Risk Assessment

| Risk                              | Likelihood | Impact | Mitigation                          |
| --------------------------------- | ---------- | ------ | ----------------------------------- |
| Tailwind TS config not recognized | Low        | Medium | Verify postcss.config.js compatible |
| CSS variable syntax errors        | Medium     | Low    | Copy exact format from new-ui       |
| Path alias conflicts              | Low        | Low    | Use existing patterns               |

---

## Security Considerations

- No user input handled
- No external API calls
- Dependencies from trusted sources (npm registry)

---

## Next Steps

After completion:

1. Proceed to [Phase 02: App Router Migration](./phase-02-app-router-migration.md)
2. Test CSS variables work with existing components
3. Verify font imports load correctly
