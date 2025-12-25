# Phase 04: Component Refactor

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** [Phase 01](./phase-01-foundation-setup.md), [Phase 02](./phase-02-app-router-migration.md), [Phase 03](./phase-03-theme-system.md)
**Related Docs:** [Current Web Structure Scout](./scout/scout-current-web-structure.md)

---

## Overview

| Field     | Value      |
| --------- | ---------- |
| Date      | 2025-12-25 |
| Priority  | High       |
| Status    | Pending    |
| Est. Time | 3-4 hours  |

Refactor existing components to match new-ui visual design. Create new components: Title, ProfileSection, CountUp, Footer, FloatingHearts. Migrate from SCSS Modules to Tailwind-first with CSS variable support.

---

## Key Insights from Research

1. **Component mapping (current -> new):**

   - `MainTitle` -> `Title` (with heart icons, text-gradient)
   - `MainSection` + `RoundedImage` -> `ProfileSection` (gradient borders, glow)
   - `CountUp` + `Clock` -> `CountUp` (consolidated, font-display)
   - `Footer` -> `Footer` (centered, muted text)
   - NEW: `FloatingHearts` (background animation)

2. **Icon migration:**

   - Static PNG/SVG -> lucide-react icons
   - `heart.png` -> `<Heart />` from lucide-react

3. **Styling approach:**

   - Tailwind-first for layout/spacing/colors
   - Keep SCSS modules for complex animations only
   - Use CSS custom properties for colors

4. **Client components needed:**
   - FloatingHearts (randomized animation)
   - CountUp (interval updates)
   - Clock (real-time display)

---

## Requirements

### Must Have

- [ ] Create `components/LoveDays/Title.tsx`
- [ ] Create `components/LoveDays/ProfileSection.tsx`
- [ ] Create `components/LoveDays/CountUp.tsx` (with Clock)
- [ ] Create `components/LoveDays/Footer.tsx`
- [ ] Create `components/LoveDays/FloatingHearts.tsx`
- [ ] Use lucide-react for icons
- [ ] Responsive design (xs/md/lg breakpoints)

### Should Have

- [ ] Remove old component files after migration
- [ ] Update @love-days/utils if needed

### Nice to Have

- [ ] Staggered animation delays

---

## Architecture Decisions

### 1. Component Directory Structure

```
components/
├── LoveDays/
│   ├── Title.tsx
│   ├── ProfileSection.tsx
│   ├── CountUp.tsx
│   ├── Footer.tsx
│   ├── FloatingHearts.tsx
│   └── index.ts  (barrel export)
├── ui/  (shadcn components)
└── [old components - delete after]
```

### 2. Component Patterns

| Component      | Type   | Styling                  |
| -------------- | ------ | ------------------------ |
| Title          | Server | Tailwind                 |
| ProfileSection | Server | Tailwind                 |
| CountUp        | Client | Tailwind                 |
| Footer         | Server | Tailwind                 |
| FloatingHearts | Client | Tailwind + inline styles |

### 3. Keep Profile Images

Decision: Keep actual profile photos from `public/images/` instead of emoji placeholders.

```tsx
// ProfileSection.tsx
import NiuBoa from "@public/images/niu_boa.jpg";
import MiuLem from "@public/images/miu_nem.jpg";
```

---

## Related Code Files

| File                                     | Action | Purpose                |
| ---------------------------------------- | ------ | ---------------------- |
| `components/LoveDays/Title.tsx`          | Create | Title with hearts      |
| `components/LoveDays/ProfileSection.tsx` | Create | Profile images + names |
| `components/LoveDays/CountUp.tsx`        | Create | Days counter + clock   |
| `components/LoveDays/Footer.tsx`         | Create | Footer text            |
| `components/LoveDays/FloatingHearts.tsx` | Create | Background animation   |
| `components/LoveDays/index.ts`           | Create | Barrel exports         |
| `components/Title/`                      | Delete | Old component          |
| `components/MainSection/`                | Delete | Old component          |
| `components/CountUp/`                    | Delete | Old component          |
| `components/Clock/`                      | Delete | Old component          |
| `components/Footer/`                     | Delete | Old component          |
| `components/RoundedImage/`               | Delete | Old component          |

---

## Implementation Steps

### Step 1: Create LoveDays Directory (5 min)

```bash
mkdir -p apps/web/components/LoveDays
```

### Step 2: Create Title Component (20 min)

```typescript
// apps/web/components/LoveDays/Title.tsx
import { Heart } from "lucide-react";

const Title = () => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 animate-fade-in">
      <Heart
        className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary animate-pulse-slow"
        fill="currentColor"
      />
      <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-gradient leading-tight whitespace-nowrap">
        Love Days
      </h1>
      <Heart
        className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary animate-pulse-slow"
        fill="currentColor"
      />
    </div>
  );
};

export default Title;
```

### Step 3: Create ProfileSection Component (40 min)

```typescript
// apps/web/components/LoveDays/ProfileSection.tsx
import { Heart } from "lucide-react";
import Image from "next/image";
import NiuBoa from "@public/images/niu_boa.jpg";
import MiuLem from "@public/images/miu_nem.jpg";

const ProfileSection = () => {
  return (
    <div
      className="flex items-center justify-center gap-6 md:gap-10 lg:gap-16 animate-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      {/* Person 1 */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 p-0.5 glow-primary animate-float">
          <div className="w-full h-full rounded-full bg-card overflow-hidden">
            <Image
              src={NiuBoa}
              alt="Niu boà"
              className="w-full h-full object-cover"
              width={144}
              height={144}
            />
          </div>
        </div>
        <h3 className="mt-2 font-display text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
          Niu boà
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body">
          Forever yours
        </p>
      </div>

      {/* Heart connector */}
      <div className="flex flex-col items-center gap-1">
        <Heart
          className="w-8 h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 text-primary animate-pulse-slow"
          fill="currentColor"
        />
        <span className="text-primary font-display text-sm md:text-base lg:text-lg">
          &
        </span>
      </div>

      {/* Person 2 */}
      <div className="flex flex-col items-center">
        <div
          className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 p-0.5 glow-primary animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-full h-full rounded-full bg-card overflow-hidden">
            <Image
              src={MiuLem}
              alt="Mỉu Lem"
              className="w-full h-full object-cover"
              width={144}
              height={144}
            />
          </div>
        </div>
        <h3 className="mt-2 font-display text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
          Mỉu Lem
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body">
          Forever mine
        </p>
      </div>
    </div>
  );
};

export default ProfileSection;
```

### Step 4: Create CountUp Component (45 min)

```typescript
// apps/web/components/LoveDays/CountUp.tsx
"use client";

import { useState, useEffect } from "react";
import { calculateDaysBetween } from "@love-days/utils";

const Clock = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xl md:text-2xl lg:text-3xl font-sans-clean text-muted-foreground tabular-nums">
      {time || "00:00:00"}
    </div>
  );
};

const CountUp = () => {
  const [mounted, setMounted] = useState(false);
  const startDate = new Date("2020-08-22T00:00:00");

  useEffect(() => {
    setMounted(true);
  }, []);

  const days = mounted ? calculateDaysBetween(startDate, new Date()) : 0;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 animate-fade-in"
      style={{ animationDelay: "0.6s" }}
    >
      <p className="text-sm md:text-base text-muted-foreground font-body uppercase tracking-wider">
        Together for
      </p>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient">
          {days.toLocaleString()}
        </span>
        <span className="text-lg md:text-xl text-muted-foreground font-body">
          days
        </span>
      </div>

      <div className="flex gap-4 text-sm md:text-base text-muted-foreground font-body">
        <span>
          <strong className="text-foreground">{years}</strong> years
        </span>
        <span>
          <strong className="text-foreground">{months}</strong> months
        </span>
        <span>
          <strong className="text-foreground">{remainingDays}</strong> days
        </span>
      </div>

      <div className="mt-2">
        <Clock />
      </div>

      <p className="text-xs text-muted-foreground/70 font-body">
        Since August 22, 2020
      </p>
    </div>
  );
};

export default CountUp;
```

### Step 5: Create Footer Component (15 min)

```typescript
// apps/web/components/LoveDays/Footer.tsx
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-4 md:py-6 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
      <p className="text-sm md:text-base text-muted-foreground font-body flex items-center justify-center gap-2">
        Made with{" "}
        <Heart className="w-4 h-4 text-primary animate-pulse-slow" fill="currentColor" />{" "}
        for us
      </p>
    </footer>
  );
};

export default Footer;
```

### Step 6: Create FloatingHearts Component (30 min)

```typescript
// apps/web/components/LoveDays/FloatingHearts.tsx
"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";

const FloatingHearts = () => {
  const hearts = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${8 + Math.random() * 6}s`,
        size: 12 + Math.random() * 16,
        opacity: 0.1 + Math.random() * 0.2,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute text-primary animate-float-up"
          style={{
            left: heart.left,
            bottom: "-20px",
            width: heart.size,
            height: heart.size,
            opacity: heart.opacity,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export default FloatingHearts;
```

### Step 7: Create Barrel Export (5 min)

```typescript
// apps/web/components/LoveDays/index.ts
export { default as Title } from "./Title";
export { default as ProfileSection } from "./ProfileSection";
export { default as CountUp } from "./CountUp";
export { default as Footer } from "./Footer";
export { default as FloatingHearts } from "./FloatingHearts";
```

### Step 8: Update Page to Use New Components (15 min)

```typescript
// apps/web/app/page.tsx
import {
  Title,
  ProfileSection,
  CountUp,
  Footer,
  FloatingHearts,
} from "@/components/LoveDays";
// MusicSidebar imported in Phase 05

export default function Home() {
  return (
    <div className="min-h-[100svh] flex flex-col overflow-x-hidden relative">
      <FloatingHearts />
      {/* MusicSidebar will be added in Phase 05 */}
      <main className="flex-1 container mx-auto px-4 pt-4 pb-16 md:pt-6 md:pb-20 flex flex-col items-center justify-center gap-4 md:gap-5 relative z-10">
        <Title />
        <ProfileSection />
        <CountUp />
      </main>
      <Footer />
    </div>
  );
}
```

### Step 9: Remove Old Components (10 min)

After verification:

```bash
rm -rf apps/web/components/Title
rm -rf apps/web/components/MainSection
rm -rf apps/web/components/CountUp
rm -rf apps/web/components/Clock
rm -rf apps/web/components/Footer
rm -rf apps/web/components/RoundedImage
rm -rf apps/web/layouts  # MainLayout no longer needed
```

### Step 10: Verify Build (15 min)

```bash
cd apps/web
npm run type-check
npm run lint
npm run dev  # Visual verification
npm run build
```

---

## Todo List

- [ ] Create components/LoveDays directory
- [ ] Create Title.tsx
- [ ] Create ProfileSection.tsx
- [ ] Create CountUp.tsx (with Clock)
- [ ] Create Footer.tsx
- [ ] Create FloatingHearts.tsx
- [ ] Create index.ts barrel export
- [ ] Update app/page.tsx
- [ ] Visual verification in dev
- [ ] Remove old components
- [ ] Run type-check, lint, build

---

## Success Criteria

1. All 5 components render correctly
2. Responsive at xs/md/lg breakpoints
3. Animations work (fade-in, float, pulse-slow, float-up)
4. Profile images display correctly
5. CountUp shows accurate day count
6. Clock ticks in real-time
7. FloatingHearts animate upward
8. Build succeeds with no errors

---

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                            |
| ----------------------- | ---------- | ------ | ------------------------------------- |
| Image import issues     | Medium     | Low    | Use Next.js Image with static imports |
| Animation performance   | Low        | Medium | Limit floating hearts count           |
| @love-days/utils import | Low        | Medium | Verify package exports                |
| Hydration mismatch      | Medium     | Medium | Use mounted state check               |

---

## Security Considerations

- No user input in these components
- Static image paths (no dynamic URLs)
- No external data fetching

---

## Next Steps

After completion:

1. Proceed to [Phase 05: Music Player](./phase-05-music-player.md)
2. Test responsive behavior thoroughly
3. Verify animation performance on mobile
