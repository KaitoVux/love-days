# Phase 03: Theme System

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 01: Foundation Setup](./phase-01-foundation-setup.md), [Phase 02: App Router Migration](./phase-02-app-router-migration.md)
**Related Docs:** [shadcn Integration Research](./research/researcher-shadcn-integration.md), [Current Web Structure Scout](./scout/scout-current-web-structure.md)

---

## Overview

| Field     | Value      |
| --------- | ---------- |
| Date      | 2025-12-25 |
| Priority  | High       |
| Status    | Pending    |
| Est. Time | 1-2 hours  |

Finalize HSL color system, add custom fonts, configure animations, update SCSS variables to use CSS custom properties bridge.

---

## Key Insights from Research

1. **Current color fragmentation:**

   - SCSS: `$primary: #ec407a`, `$secondary: #b90d46`
   - Globals: `#ee9ca7`, `#ffdde1` (gradients)
   - Player: `#071739`, `#c471ed`, `#a770ef`, `#fdb99b`
   - Tailwind: `text-purple-500`

2. **Target HSL system (hue 350):**

   - Primary: `350 80% 65%` (rose pink)
   - Accent: `350 60% 50%`
   - Background: `350 30% 8%` (dark)
   - Foreground: `350 20% 95%` (light)

3. **SCSS-Tailwind bridge:**

   ```scss
   color: hsl(var(--primary)); // Works in both SCSS and Tailwind
   ```

4. **Font stack:**
   - Display: Playfair Display (headings)
   - Body: Cormorant Garamond (text)
   - Sans: Nunito (UI elements)

---

## Requirements

### Must Have

- [ ] HSL CSS variables complete in globals.scss
- [ ] Tailwind theme colors mapped to CSS variables
- [ ] Google Fonts imported (Playfair, Cormorant, Nunito)
- [ ] Animation keyframes defined
- [ ] Utility classes (.text-gradient, .glow-primary)

### Should Have

- [ ] Update SCSS \_variables.scss to use CSS vars
- [ ] Remove hardcoded colors from component SCSS

### Nice to Have

- [ ] Dark mode toggle preparation

---

## Architecture Decisions

### 1. Color Token Mapping

| Token                  | HSL Value   | Usage                  |
| ---------------------- | ----------- | ---------------------- |
| `--background`         | 350 30% 8%  | Page background        |
| `--foreground`         | 350 20% 95% | Text color             |
| `--primary`            | 350 80% 65% | Accent, buttons, links |
| `--primary-foreground` | 350 20% 98% | Text on primary        |
| `--secondary`          | 350 30% 18% | Secondary buttons      |
| `--muted`              | 350 20% 20% | Disabled states        |
| `--muted-foreground`   | 350 15% 65% | Placeholder text       |
| `--accent`             | 350 60% 50% | Highlights             |
| `--card`               | 350 25% 12% | Card backgrounds       |
| `--border`             | 350 25% 20% | Borders                |
| `--ring`               | 350 80% 65% | Focus rings            |

### 2. SCSS Variable Bridge

Update `_variables.scss`:

```scss
// Bridge: SCSS vars now reference CSS custom properties
$primary: hsl(var(--primary));
$secondary: hsl(var(--secondary));
$background: hsl(var(--background));
$foreground: hsl(var(--foreground));
// Legacy support - can be removed after component refactor
$black: #000000;
```

### 3. Font Configuration

```scss
// Tailwind utilities
.font-display {
  font-family: "Playfair Display", serif;
}
.font-body {
  font-family: "Cormorant Garamond", serif;
}
.font-sans-clean {
  font-family: "Nunito", sans-serif;
}
```

---

## Related Code Files

| File                                            | Action | Purpose                   |
| ----------------------------------------------- | ------ | ------------------------- |
| `apps/web/styles/globals.scss`                  | Modify | Complete CSS variables    |
| `apps/web/styles/_variables.scss`               | Modify | Bridge to CSS vars        |
| `apps/web/tailwind.config.ts`                   | Verify | Font families             |
| `apps/web/components/*/[Component].module.scss` | Audit  | Identify hardcoded colors |

---

## Implementation Steps

### Step 1: Complete CSS Variables (20 min)

Ensure `styles/globals.scss` has all variables (from Phase 01):

```scss
@layer base {
  :root {
    /* Backgrounds */
    --background: 350 30% 8%;
    --foreground: 350 20% 95%;

    /* Card/Popover */
    --card: 350 25% 12%;
    --card-foreground: 350 20% 95%;
    --popover: 350 25% 12%;
    --popover-foreground: 350 20% 95%;

    /* Primary */
    --primary: 350 80% 65%;
    --primary-foreground: 350 20% 98%;

    /* Secondary */
    --secondary: 350 30% 18%;
    --secondary-foreground: 350 20% 95%;

    /* Muted */
    --muted: 350 20% 20%;
    --muted-foreground: 350 15% 65%;

    /* Accent */
    --accent: 350 60% 50%;
    --accent-foreground: 350 20% 98%;

    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* Utility */
    --border: 350 25% 20%;
    --input: 350 25% 20%;
    --ring: 350 80% 65%;
    --radius: 1rem;

    /* Sidebar */
    --sidebar-background: 350 30% 10%;
    --sidebar-foreground: 350 20% 95%;
    --sidebar-primary: 350 80% 65%;
    --sidebar-primary-foreground: 350 20% 98%;
    --sidebar-accent: 350 30% 18%;
    --sidebar-accent-foreground: 350 20% 95%;
    --sidebar-border: 350 25% 20%;
  }
}
```

### Step 2: Update SCSS Variables Bridge (15 min)

```scss
// apps/web/styles/_variables.scss

// CSS Custom Properties Bridge
// These map to Tailwind theme colors
$primary: hsl(var(--primary));
$primary-foreground: hsl(var(--primary-foreground));
$secondary: hsl(var(--secondary));
$secondary-foreground: hsl(var(--secondary-foreground));
$background: hsl(var(--background));
$foreground: hsl(var(--foreground));
$muted: hsl(var(--muted));
$muted-foreground: hsl(var(--muted-foreground));
$accent: hsl(var(--accent));
$card: hsl(var(--card));
$border: hsl(var(--border));

// Border radius
$radius: var(--radius);

// Legacy (for backward compat during migration)
$black: #000000;
$white: #ffffff;
```

### Step 3: Add Animation Keyframes (15 min)

Add to `globals.scss`:

```scss
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes heartbeat {
  0%,
  40%,
  80%,
  100% {
    transform: scale(0.75);
  }
  20%,
  60% {
    transform: scale(1);
  }
}
```

### Step 4: Add Utility Classes (10 min)

Add to `globals.scss`:

```scss
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
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-up {
    animation: float-up linear infinite;
  }
  .animate-heartbeat {
    animation: heartbeat 4s linear infinite;
  }
}
```

### Step 5: Audit Component SCSS Files (20 min)

Identify hardcoded colors to replace in Phase 04:

| File                      | Hardcoded Colors                                      | Replace With |
| ------------------------- | ----------------------------------------------------- | ------------ |
| `Player.module.scss`      | `#071739`, `#c471ed`, `#a770ef`, `#fdb99b`, `#cf8bf3` | CSS vars     |
| `CountUp.module.scss`     | Uses `v.$secondary` (OK with bridge)                  | Keep         |
| `MainSection.module.scss` | Uses `v.$primary`, `v.$secondary`                     | Keep         |
| `MainTitle.module.scss`   | Uses `v.$primary`                                     | Keep         |

### Step 6: Verify Theme Works (15 min)

```bash
cd apps/web
npm run dev
# Check: background color dark, text light, primary pink
npm run build
```

---

## Todo List

- [ ] Complete CSS variables in globals.scss
- [ ] Update \_variables.scss with CSS var bridge
- [ ] Add animation keyframes
- [ ] Add utility classes
- [ ] Audit component SCSS for hardcoded colors
- [ ] Verify theme renders correctly
- [ ] Run type-check, lint, build

---

## Success Criteria

1. Page renders with dark background (350 30% 8%)
2. Text is light (350 20% 95%)
3. Primary color is rose pink (350 80% 65%)
4. Fonts load: Playfair Display, Cormorant Garamond, Nunito
5. Animations work: pulse-slow, float, float-up
6. SCSS variables reference CSS custom properties

---

## Risk Assessment

| Risk                      | Likelihood | Impact | Mitigation          |
| ------------------------- | ---------- | ------ | ------------------- |
| HSL syntax errors         | Medium     | Medium | Test each variable  |
| Font loading delay        | Low        | Low    | font-display: swap  |
| Gradient rendering issues | Low        | Low    | Use fallback colors |
| SCSS compilation errors   | Medium     | Medium | Test incrementally  |

---

## Security Considerations

- Google Fonts loaded from external CDN (trusted)
- No user data in theme system

---

## Next Steps

After completion:

1. Proceed to [Phase 04: Component Refactor](./phase-04-component-refactor.md)
2. Replace hardcoded colors in Player.module.scss
3. Test responsive behavior with new theme
