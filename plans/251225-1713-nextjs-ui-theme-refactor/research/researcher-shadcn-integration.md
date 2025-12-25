# shadcn/ui Integration Research Report

**Date:** 2025-12-25 | **Project:** Love Days UI Theme Refactor

---

## Executive Summary

shadcn/ui is a **copy-paste component library** built on Radix UI primitives, styled with Tailwind CSS. Ideal for Next.js 15. HSL-based theme system aligns perfectly with apps/web-new-ui existing color scheme (hue 350°). Full SCSS coexistence requires workaround since shadcn is Tailwind-only.

---

## 1. Installation (Next.js 15)

### Quick Setup

```bash
# Install dependencies first (avoid conflicts)
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# Initialize shadcn/ui
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add slider button dialog tooltip
```

### Configuration Auto-Generated

- Creates `components/ui/` directory
- Updates `tailwind.config.ts` with theme extend
- Injects CSS variables into global styles
- Zero framework overhead (components are copied, not npm packages)

**Key Advantage:** Only components you add are bundled. No tree-shaking worries—unused components never enter your bundle.

---

## 2. Components Relevant for Music Player

### Primary Components

| Component    | Use Case                     | Notes                                      |
| ------------ | ---------------------------- | ------------------------------------------ |
| **Slider**   | Volume, progress bar         | Fully Radix-based, easy to customize       |
| **Dialog**   | Play queue, settings modal   | Accessible, built-in focus management      |
| **Tooltip**  | Hover info on buttons        | Lightweight alternative to popovers        |
| **Button**   | Controls (play, pause, skip) | Variant system (default, secondary, ghost) |
| **Progress** | Track duration indicator     | Simpler than Slider if read-only           |
| **Popover**  | Advanced controls dropdown   | Positioned tooltips                        |

### Reference

- Official music app example: [ui.shadcn.com/examples/music](https://ui.shadcn.com/examples/music)
- Slider component: [ui.shadcn.com/docs/components/slider](https://ui.shadcn.com/docs/components/slider)

---

## 3. Theme Customization (HSL System)

### Current apps/web-new-ui HSL Palette

```css
/* Primary accent: hue 350° (rose/pink) */
--primary: 350 80% 65%;
--accent: 350 60% 50%;

/* Background/foreground contrast */
--background: 350 30% 8%;
--foreground: 350 20% 95%;
```

### shadcn Theme Integration

shadcn uses **CSS variable references** matching apps/web-new-ui structure:

```tsx
// tailwind.config.ts
colors: {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  border: "hsl(var(--border))",
  // ... rest auto-generated
}

// src/index.css
@layer base {
  :root {
    --primary: 350 80% 65%;      // ← Matches existing
    --accent: 350 60% 50%;
    --destructive: 0 84.2% 60.2%;
    // ... other theme vars
  }
}
```

### Customization Process

1. **Automatic**: Run `npx shadcn@latest init` → prompts for primary color
2. **Manual**: Edit `src/index.css` CSS variables directly
3. **No Config Bloat**: Tailwind auto-extends from CSS vars (no tailwind.config.ts color duplication)

**Result:** Full alignment with 350° hue without code changes.

---

## 4. SCSS Coexistence & Integration

### Current Situation

- **Official**: shadcn components styled exclusively with Tailwind CSS
- **Limitation**: shadcn CLI doesn't detect `.scss` files automatically
- **Impact**: Can't auto-initialize in SCSS-first projects

### Viable Workarounds

**Option A: Dual Styling (Recommended)**

```tsx
// Component with both Tailwind + SCSS
import styles from "./Player.module.scss";
import { Slider } from "@/components/ui/slider";

export function Player() {
  return (
    <div className={styles.playerWrapper}>
      {/* shadcn Tailwind components */}
      <Slider className="w-full" />

      {/* SCSS module scoped styles */}
      <div className={styles.controls}>...</div>
    </div>
  );
}
```

**Option B: Pure CSS Variables Bridge**

```scss
// Player.module.scss
.playerContainer {
  // Use same CSS vars shadcn uses
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);

  // SCSS nesting still works
  .slider {
    color: hsl(var(--primary));
  }
}
```

**Why This Works:**

- CSS variables transcend Tailwind/SCSS boundary
- apps/web-new-ui already defines all vars in `:root`
- shadcn components read same vars

### Not Recommended

- Converting shadcn to CSS Modules (community ports exist but unmaintained)
- Removing SCSS in favor of pure Tailwind (breaking change)

---

## 5. Bundle Size & Performance

### shadcn/ui Advantages

- **Additive-Only**: Each `npx shadcn add <component>` adds ~2-5KB gzipped
- **No Unused Code**: Copy-paste ensures 100% of included code is used
- **Tree-Shaking Guaranteed**: Unlike Material-UI, zero reliance on bundler optimization
- **Next.js 15 Optimization**: Works with Turbopack (faster dev builds)

### Realistic Music Player Bundle Impact

```
Button + Slider + Dialog + Tooltip + Progress:
  Estimated gzipped: ~12-15KB
  Radix UI dependencies: ~8KB (shared across components)
  Tailwind CSS utilities: ~2KB incremental (mostly existing)
  Total: ~20-25KB impact
```

### vs. Full Component Libraries

| Library         | bundled code?      | Customization   | Size   |
| --------------- | ------------------ | --------------- | ------ |
| **shadcn/ui**   | Copy-paste (yours) | ✅ Full source  | ~25KB  |
| **Material-UI** | npm package        | ⚠️ Wrapper hell | ~200KB |
| **Chakra UI**   | npm package        | ✅ Good theming | ~60KB  |

---

## 6. Implementation Checklist

### Phase 1: Setup (1-2 hours)

- [ ] `npm install tailwindcss-animate class-variance-authority`
- [ ] `npx shadcn@latest init` (select primary color: rose)
- [ ] Verify `components/ui/` created
- [ ] Test one component in isolation

### Phase 2: Music Player Components (2-3 hours)

- [ ] `npx shadcn add slider`
- [ ] `npx shadcn add dialog`
- [ ] `npx shadcn add tooltip`
- [ ] `npx shadcn add button` (if not exists)
- [ ] Create `Player.tsx` using Slider + Button + Dialog

### Phase 3: Theme Validation (30 minutes)

- [ ] Compare CSS variables in `index.css` with apps/web-new-ui
- [ ] Adjust HSL values if needed (unlikely—already aligned)
- [ ] Test dark mode toggle

### Phase 4: SCSS Bridge (1 hour)

- [ ] Add `Player.module.scss` using CSS var system
- [ ] Verify no style conflicts
- [ ] Test component composition

---

## 7. Code Examples

### Basic Player with Slider

```tsx
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

export function MusicPlayer() {
  const [progress, setProgress] = useState([0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg">
      {/* Play/Pause Controls */}
      <div className="flex gap-2">
        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Queue</Button>
          </DialogTrigger>
          <DialogContent>
            <h2>Play Queue</h2>
            {/* Queue list */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Slider */}
      <Slider
        value={progress}
        onValueChange={setProgress}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
}
```

### SCSS Module Integration

```scss
// Player.module.scss
.playerContainer {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;

  .controlsRow {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .slider {
    // Tailwind classes applied to Slider component
    // This module scopes additional styles if needed
    cursor: pointer;
  }
}
```

---

## 8. Migration Path (apps/web → shadcn)

If integrating into existing apps/web (Turborepo):

1. Keep existing CSS Modules in place
2. Add shadcn components alongside (gradual migration)
3. Merge theme CSS variables (already compatible)
4. Prioritize audio player component first
5. Expand to other components (form inputs, modals) as needed

---

## Key Takeaways

✅ **Use shadcn/ui if:**

- Full source code control needed
- Tailwind CSS already in stack
- Bundle size matters (audiophiles care!)
- HSL-based theming required (perfect match)
- Rapid component iteration needed

⚠️ **Workaround required:**

- SCSS coexistence (use CSS variable bridge—proven)
- Non-Tailwind projects (not applicable here)

---

## Unresolved Questions

1. **Specific audio player UX**: Are you extending the Slider with custom markers (chapters, saved positions)?
2. **Dark mode toggle**: Implemented via next-themes or custom context?
3. **Mobile responsiveness**: Any touch-specific interactions for volume/progress?
4. **Accessibility compliance**: WCAG AA target? (shadcn ships WCAG AAA)

---

## Sources

- [shadcn/ui Official Documentation](https://ui.shadcn.com)
- [Installation Guide - Next.js](https://ui.shadcn.com/docs/installation/next)
- [Theme Customization](https://ui.shadcn.com/docs/theming)
- [Slider Component](https://ui.shadcn.com/docs/components/slider)
- [Dialog Component](https://ui.shadcn.com/docs/components/dialog)
- [Music App Example](https://ui.shadcn.com/examples/music)
- [Next.js 15 + shadcn/ui Setup Guide](https://dev.to/darshan_bajgain/setting-up-2025-nextjs-15-with-shadcn-tailwind-css-v4-no-config-needed-dark-mode-5kl)
- [shadcn/ui vs Material-UI Performance Comparison 2025](https://asepalazhari.com/blog/shadcn-ui-vs-chakra-ui-vs-material-ui-component-battle-2025)
- [SCSS/CSS Modules Compatibility Discussion](https://github.com/shadcn-ui/ui/discussions/2832)
- [GitHub Issue: SCSS Detection](https://github.com/shadcn-ui/ui/issues/4689)
