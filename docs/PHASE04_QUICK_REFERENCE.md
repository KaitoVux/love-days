# Phase 04: Component Refactor - Quick Reference

**Last Updated**: 2025-12-26
**Phase Status**: ✅ Complete
**Relevant Documentation**: [UI_THEME_REFACTOR_PHASE04.md](./UI_THEME_REFACTOR_PHASE04.md)

---

## Quick Facts

| Item             | Details                                                        |
| ---------------- | -------------------------------------------------------------- |
| **Phase**        | 04: Component Refactor                                         |
| **Completed**    | 2025-12-26                                                     |
| **Components**   | 5 new (Title, ProfileSection, CountUp, Footer, FloatingHearts) |
| **Styling**      | Tailwind-first (no CSS Modules)                                |
| **Icons**        | lucide-react                                                   |
| **Build Status** | ✅ All checks pass                                             |

---

## Component Import Guide

### From Page (app/page.tsx)

```tsx
import {
  Title,
  ProfileSection,
  CountUp,
  Footer,
  FloatingHearts,
} from "@/components/LoveDays";
```

### Individual Imports (Not Recommended)

```tsx
import Title from "@/components/LoveDays/Title";
import ProfileSection from "@/components/LoveDays/ProfileSection";
// ... etc (use barrel export instead)
```

---

## Component Quick Reference

### Title

```tsx
<Title />
```

**Type**: Server Component
**Props**: None
**Renders**: Main title with heart icons
**Animations**: fade-in, pulse-slow (hearts)

---

### ProfileSection

```tsx
<ProfileSection />
```

**Type**: Server Component
**Props**: None
**Renders**: Two profile images with names
**Animations**: fade-in (0.4s delay), float (with 1s stagger)

---

### CountUp

```tsx
<CountUp />
```

**Type**: Client Component (`"use client"`)
**Props**: None
**Renders**: Days counter + real-time clock
**Features**:

- Shows days, years, months, days breakdown
- Clock updates every second
- Hydration-safe with mounted check

---

### Footer

```tsx
<Footer />
```

**Type**: Server Component
**Props**: None
**Renders**: Footer text with heart icon
**Animations**: fade-in (0.8s delay), pulse-slow (heart)

---

### FloatingHearts

```tsx
<FloatingHearts />
```

**Type**: Client Component (`"use client"`)
**Props**: None
**Renders**: Background animated hearts
**Features**:

- 15 randomized hearts
- Position from useMemo (no re-randomization)
- Fixed positioning (z-index 0)

---

## Responsive Sizing Cheat Sheet

### Title

```
xs: Heart w-5 h-5, Title text-2xl, Gap-2
md: Heart w-7 h-7, Title text-4xl, Gap-3
lg: Heart w-8 h-8, Title text-5xl
```

### ProfileSection

```
xs: Image w-20 h-20, Gap-6, Heart w-8 h-8
md: Image w-28 h-28, Gap-10, Heart w-10 h-10
lg: Image w-36 h-36, Gap-16, Heart w-14 h-14
```

### CountUp

```
xs: Counter text-4xl, Time text-xl, Padding p-6
md: Counter text-5xl, Time text-2xl, Padding p-8
lg: Counter text-6xl, Time text-3xl
```

---

## CSS Classes Used

### Layout & Spacing

```
flex, items-center, justify-center
gap-2, gap-4, gap-6
p-6, mt-2, py-4
container, mx-auto, px-4
```

### Typography

```
font-display      # Display font
font-body         # Body font
font-sans-clean   # Clock font
text-gradient     # Gradient effect
text-primary      # Primary color
text-muted-foreground
```

### Sizing

```
w-5, h-5          # Icon sizes
w-20, h-20        # Profile images
md:w-28, md:h-28  # Medium profile
lg:w-36, lg:h-36  # Large profile
text-2xl through text-6xl
```

### Effects

```
rounded-full      # Circular
bg-card/50        # Transparent background
backdrop-blur-sm  # Blur effect
glow-primary      # Custom glow
border-border/30  # Transparent border
```

### Animations

```
animate-fade-in      # 0.6s entrance
animate-pulse-slow   # 2s pulse
animate-float        # 6s floating
animate-float-up     # 8-14s upward
```

---

## Animation Delays

| Component      | Animation Delay | Start Time |
| -------------- | --------------- | ---------- |
| Title          | None            | 0.0s       |
| ProfileSection | 0.4s            | 0.4s       |
| CountUp        | 0.6s            | 0.6s       |
| Footer         | 0.8s            | 0.8s       |
| FloatingHearts | Various (each)  | Random     |

---

## Common Patterns

### Using calculateDaysBetween (CountUp)

```tsx
import { calculateDaysBetween } from "@love-days/utils";

const days = calculateDaysBetween(startDate, new Date());
const years = Math.floor(days / 365);
const months = Math.floor((days % 365) / 30);
const remainingDays = days % 30;
```

### Using Next.js Image

```tsx
import Image from "next/image";
import NiuBoa from "@public/images/niu_boa.jpg";

<Image
  src={NiuBoa}
  alt="Niu boà"
  className="w-full h-full object-cover"
  width={144}
  height={144}
/>;
```

### Using lucide-react Icons

```tsx
import { Heart } from "lucide-react";

<Heart className="w-5 h-5 text-primary" fill="currentColor" />;
```

### Client Component Pattern

```tsx
"use client";

import { useState, useEffect } from "react";

export default function MyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  // render component
}
```

---

## Common Modifying Tasks

### Change component animation delay

```tsx
<ProfileSection style={{ animationDelay: "0.5s" }} />
```

### Add new animation to component

```tsx
<div className="animate-fade-in animate-pulse">Content</div>
```

### Adjust responsive breakpoints

```tsx
// Current pattern:
<div className="w-20 md:w-28 lg:w-36">
// Change md breakpoint:
<div className="w-20 md:w-32 lg:w-36">
```

### Change heart size in ProfileSection

```tsx
// Current: w-8 h-8 md:w-10 md:h-10 lg:w-14 lg:h-14
// Change to:
<Heart className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12" />
```

### Customize floating hearts count

```tsx
// In FloatingHearts.tsx, change:
Array.from({ length: 15 }, ...)  // Change 15 to different number
```

---

## Troubleshooting

### Clock not updating

**Cause**: Component might not be mounted
**Fix**: Check CountUp uses `mounted` state check before rendering time

### Images not showing

**Cause**: Image path might be wrong
**Fix**: Verify image files exist in `public/images/` with correct names

### Animations not smooth

**Cause**: Could be performance issue
**Fix**: Check FloatingHearts uses `useMemo` (prevent re-randomization)

### Hydration mismatch warnings

**Cause**: Client-side state differs from server
**Fix**: Use `mounted` state check pattern (already applied in Phase 04)

### Build failing

**Cause**: TypeScript or linting errors
**Fix**: Run `npm run lint:fix` and `npm run format`

---

## Files & Locations

### Component Files

```
/components/LoveDays/
├── Title.tsx               (Server)
├── ProfileSection.tsx      (Server)
├── CountUp.tsx             (Client)
├── Footer.tsx              (Server)
├── FloatingHearts.tsx      (Client)
└── index.ts                (Barrel export)
```

### Updated Files

```
/app/page.tsx              (Uses new components)
```

### Configuration (From Phase 01)

```
/tailwind.config.ts        (Animations defined)
/styles/globals.scss       (CSS variables, custom utilities)
```

---

## Checklist for Phase 05 Integration

Before proceeding to Phase 05:

- [ ] All components render correctly in dev
- [ ] Responsive design verified (xs/md/lg)
- [ ] Animations play smoothly
- [ ] No console errors
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Ready to add Player component

---

## Key Differences from Previous Implementation

| Aspect          | Before              | After              |
| --------------- | ------------------- | ------------------ |
| Directory       | Scattered (6 dirs)  | Unified (LoveDays) |
| Styling         | SCSS Modules        | Tailwind           |
| Icons           | PNG/SVG files       | lucide-react       |
| Imports         | 6 import statements | 1 import + barrel  |
| Component Types | Mixed               | Clear separation   |
| Layout.tsx      | MainLayout wrapper  | Removed            |

---

## Design System Integration

All components use Phase 01 design system:

**Colors** (CSS Variables):

- `--primary` (330 100% 55%) - Heart color
- `--accent` (40 100% 55%) - Gradient end
- `--background` (0 0% 3.9%) - Dark background
- `--foreground` (0 0% 98%) - Light text

**Fonts**:

- `font-display` - Playfair Display (headings)
- `font-body` - Nunito (body text)
- `font-sans-clean` - Clean sans (numbers)

**Animations** (tailwind.config.ts):

- `animate-fade-in` - Entrance
- `animate-pulse-slow` - Gentle pulse
- `animate-float` - Floating motion
- `animate-float-up` - Upward motion

---

## Performance Notes

- Total component JS: ~2 KB (gzipped)
- useMemo in FloatingHearts prevents re-randomization
- CSS animations are GPU-accelerated
- No blocking operations in render
- Static export compatible

---

## Related Documentation

- **Full Details**: [UI_THEME_REFACTOR_PHASE04.md](./UI_THEME_REFACTOR_PHASE04.md)
- **Completion Report**: [PHASE04_COMPLETION_REPORT.md](./PHASE04_COMPLETION_REPORT.md)
- **Code Standards**: [CODE_STANDARDS.md](./CODE_STANDARDS.md)
- **System Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

---

**Status**: ✅ Phase 04 Complete
**Next**: Phase 05 - Music Player Integration
