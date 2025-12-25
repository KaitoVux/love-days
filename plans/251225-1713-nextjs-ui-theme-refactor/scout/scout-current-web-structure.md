# UI Theme Refactor: Current Web Structure Scout Report

**Date:** 2025-12-25  
**Directory Scoped:** `apps/web/`  
**Analysis Depth:** Very Thorough  
**Status:** Complete

---

## Executive Summary

The Love Days Next.js application uses a **hybrid styling approach** combining SCSS Modules (for component-scoped styles) and Tailwind CSS (utility-first), with global SCSS variables. The app employs **Pages Router with static export**, a **client-side player component**, and **hardcoded color themes** embedded across multiple configuration files.

**Key Finding:** Theme colors are scattered across 4 locations:

- `styles/_variables.scss` - Primary colors (#ec407a, #b90d46)
- `styles/globals.scss` - Background gradients
- Component SCSS files - Hard-coded colors
- `tailwind.config.js` - Minimal customization
- `package.json` - React 19, Next.js 15.2.1

---

## 1. File Structure & Routing

### Pages & Entry Points

| File                        | Type        | Purpose                                   | Notes                                              |
| --------------------------- | ----------- | ----------------------------------------- | -------------------------------------------------- |
| `/apps/web/pages/_app.tsx`  | App Wrapper | Root app component, imports global styles | Imports `globals.scss`                             |
| `/apps/web/pages/index.tsx` | Page        | Main home page (single page app)          | Uses Pages Router, renders layout + all components |

**Code Structure:**

- **\_app.tsx:** Minimal wrapper, no providers or context
- **index.tsx:** Renders `MainLayout` with grid layout (responsive: md:grid-cols-3, xs:grid-cols-1)

### Layouts

| File                                     | Type   | Purpose                          |
| ---------------------------------------- | ------ | -------------------------------- |
| `/apps/web/layouts/MainLayout/index.tsx` | Layout | Container with `mx-auto` padding |

**Code:**

```tsx
export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main className="container mx-auto">{children}</main>;
};
```

---

## 2. Components Architecture

### Component Tree

```
index.tsx (MainPage)
├── MainLayout
│   └── MainTitle
│   └── CountUp
│   │   └── Clock
│   └── MainSection
│   │   ├── RoundedImage (2x)
│   └── Footer
│   └── Player (Client Component)
```

### Component Files & Details

| Component        | Location                            | Type       | Features                                                      | Styling                                 |
| ---------------- | ----------------------------------- | ---------- | ------------------------------------------------------------- | --------------------------------------- |
| **MainTitle**    | `components/Title/index.tsx`        | Functional | Displays "Love Days" heading                                  | Tailwind + MainTitle.module.scss        |
| **CountUp**      | `components/CountUp/index.tsx`      | Client     | Calculates days/months/years since 2020-08-22, updates hourly | CountUp.module.scss + gradient bg       |
| **Clock**        | `components/Clock/index.tsx`        | Client     | Real-time HH:MM:SS display, updates every 1s                  | Tailwind only                           |
| **MainSection**  | `components/MainSection/index.tsx`  | Functional | Layout with 2 profile images + date + heart icon              | MainSection.module.scss + Tailwind grid |
| **RoundedImage** | `components/RoundedImage/index.tsx` | Functional | Circular rotating images, uses Next Image                     | RoundedImage.module.scss                |
| **Player**       | `components/Player/index.tsx`       | Client     | Audio player with playlist, timeline, controls                | Player.module.scss (380+ lines)         |
| **Footer**       | `components/Footer/index.tsx`       | Functional | Text message with emoji                                       | Tailwind text-purple-500                |

### Component Usage Details

#### Player Component (Most Complex)

- **Location:** `/apps/web/components/Player/index.tsx`
- **Marked:** `"use client"` (Client Component)
- **Dependencies:** `@love-days/utils` (songs array, ISong type)
- **Features:**
  - Current song display with image
  - Playlist with scrollable track list
  - Timeline with hover preview & time display
  - Previous/Next/Play-Pause controls
  - Auto-advance to next track on end
  - State management: currentPlay, currentTime, pause, playlist refs
- **Styling Scope:** Complex, uses 30+ SCSS classes with shadows & gradients
- **Import Pattern:** `import styles from "./Player.module.scss"`

#### CountUp Component

- **Location:** `/apps/web/components/CountUp/index.tsx`
- **Marked:** `"use client"` (Client Component)
- **Features:**
  - Calculates relationship duration from hardcoded `startDate: 2020-08-22`
  - Updates every 60 seconds (not reactive)
  - Contains nested `Clock` component
- **Styling:** Circular container with gradient background from globals

#### MainSection Component

- **Location:** `/apps/web/components/MainSection/index.tsx`
- **Features:**
  - Responsive grid: 3 cols on lg/desktop, 1 col on mobile
  - Imports images as static imports: `NiuBoa`, `MiuLem`
  - Heart icon imported and animated
  - Uses `RoundedImage` component for circular images
- **Styling:** Grid layout + dynamic colors (#ec407a for names, #b90d46 for date)

---

## 3. Styling System

### Global Styles Structure

#### Style Hierarchy

1. **Tailwind Core** (`globals.scss` line 1-3) - base, components, utilities
2. **Google Fonts** - Dancing Script (400,500,600,700)
3. **Global CSS** - html, body, a, \* reset rules
4. **Animations** - spin keyframe
5. **Scrollbar Styling** - webkit-scrollbar

### Color Variables (SCSS)

**File:** `/apps/web/styles/_variables.scss`

```scss
$black: #000000;
$primary: #ec407a; // Pink - used for player, titles, names
$secondary: #b90d46; // Dark red - used for dates, secondary text
```

**Usage Pattern:** Components import with `@use "../../styles/variables" as v;` then reference `v.$primary`, `v.$secondary`

### Global Styles

**File:** `/apps/web/styles/globals.scss` (78 lines)

**Key Styles:**

- **Background:** Gradient from `#ffdde1` to `#ee9ca7` (light pink to coral)
- **Font:** Dancing Script cursive, system fonts as fallback
- **Font Size:** Base 62.5% (for rem calculations)
- **Scrollbar:** Pink (`#ec407a`) with custom styling
- **Keyframes:** `spin` animation (0deg to 360deg rotation)

**Gradient Details:**

```css
background: #ee9ca7; /* fallback */
background: -webkit-linear-gradient(to right, #ffdde1, #ee9ca7);
background: linear-gradient(to right, #ffdde1, #ee9ca7);
background-repeat: no-repeat;
background-size: cover;
```

### SCSS Mixins & Utilities

**File:** `/apps/web/styles/_mixins.scss` (48 lines)

**Mixins Provided:**

1. **@mixin pseudo()** - Creates content, display, position pseudo-elements
2. **@mixin responsive-ratio()** - Aspect ratio helper with padding-top technique
3. **@mixin mq()** - Media query helper with breakpoint names
4. **@mixin truncate()** - Text overflow ellipsis helper

**Defined Breakpoints:**

- `phone`: 400px
- `phone-wide`: 480px
- `phablet`: 560px
- `tablet-small`: 640px
- `tablet`: 768px
- `tablet-wide`: 1024px
- `desktop`: 1248px
- `desktop-wide`: 1440px

### Component SCSS Modules

#### Player.module.scss (363 lines)

**Location:** `/apps/web/components/Player/Player.module.scss`

**Color Scheme:**

- `$base: #071739` (Dark navy - text in player)
- `$shadow-color: #c471ed` (Purple - hover states, shadows)
- `$lighter-shadow: rgba($shadow-color, 0.7)`
- `$white: #fff`
- `$gray: #8c8c8c`
- `$border-radius: 20px`

**Key Classes:**

- `.card` - Main container, gradient bg from coral to purple
- `.currentSong` - White background section for song info
- `.imgWrap` - Image container with shadow
- `.timeline` - Progress bar with playhead animation
- `.playlist` - Scrollable track list with custom scrollbar
- `.track` - Individual playlist item
- `.controls` - Button container for play/pause/next/prev
- `.playButton` - Larger play/pause button
- `.prevNextButton` - Smaller navigation buttons

**Special Features:**

- **Pseudo-elements:** `::before` (time tooltip), `::after` (arrow indicator)
- **Hover animations:** Scale transforms, shadow effects
- **SVG Animation:** Base64 encoded spinning icon for now-playing track
- **Transitions:** `0.3s all ease` standard transition

#### CountUp.module.scss (13 lines)

**Location:** `/apps/web/components/CountUp/CountUp.module.scss`

**Styles:**

```scss
#clock {
  margin-top: 25px;
}
.wrapper {
  background: linear-gradient(to right, #ffdde1, #ee9ca7);
  color: v.$secondary; // #b90d46
  border-radius: rounded-full;
  box-shadow: shadow-inner;
}
```

#### MainSection.module.scss (35 lines)

**Location:** `/apps/web/components/MainSection/MainSection.module.scss`

**Animations:**

```scss
@keyframes heartbeat {
  0%, 40%, 80%, 100%: scale(0.75);
  20%, 60%: scale(1);
}
.heart { animation: heartbeat 4s linear infinite; }
```

**Colors:**

- `.heart` - Animated heartbeat on heart icon
- `.date` - Color: `v.$secondary` (#b90d46)
- `.name` - Color: `v.$primary` (#ec407a)

#### MainTitle.module.scss (6 lines)

**Location:** `/apps/web/components/Title/MainTitle.module.scss`

```scss
.title {
  color: v.$primary; /* #ec407a */
}
```

#### RoundedImage.module.scss (7 lines)

**Location:** `/apps/web/components/RoundedImage/RoundedImage.module.scss`

```scss
.imgWrapper img {
  width: 250px !important;
  height: 250px !important;
}
```

#### Home.module.scss

**File Status:** Exists but empty (1 line)

### Tailwind Configuration

**File:** `/apps/web/tailwind.config.js` (19 lines)

**Current Configuration:**

```js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 12s linear infinite", // Custom animation
      },
    },
    screens: {
      xs: "320px", // Custom small breakpoint
      ...defaultTheme.screens, // md, lg, etc.
    },
  },
  plugins: [],
};
```

**Tailwind Usage in Components:**

- `min-h-screen`, `grid`, `md:grid-cols-3`, `xs:grid-cols-1`
- `flex`, `flex-col`, `justify-center`, `items-center`
- `text-center`, `text-8xl`, `text-5xl`, `text-4xl`, `text-3xl`
- `font-bold`, `font-medium`
- `py-12`, `pt-4`, `pt-10`, `mb-8`, `px-9`
- `rounded-full`, `shadow-inner`
- `text-purple-500` (Footer component)
- `mx-auto`, `container` (Layout)

---

## 4. Static Assets

### Public Directory Structure

```
apps/web/public/
├── favicon.png
├── icons/
│   ├── heart.png
│   ├── next.svg
│   ├── pause.svg
│   ├── play.svg
│   ├── previous.svg
│   └── vercel.svg
└── images/
    ├── miu_nem.jpg (Profile image)
    └── niu_boa.jpg (Profile image)
```

### Asset Usage

| Asset          | Component        | Type         | Import Pattern                                                        |
| -------------- | ---------------- | ------------ | --------------------------------------------------------------------- |
| `favicon.png`  | index.tsx (Head) | Static       | `href="/favicon.png"`                                                 |
| `heart.png`    | MainSection      | Image        | Static import: `import Heart from "../../public/icons/heart.png"`     |
| `play.svg`     | Player           | Image        | `src="/icons/play.svg"`                                               |
| `pause.svg`    | Player           | Image        | `src="/icons/pause.svg"`                                              |
| `previous.svg` | Player           | Image        | `src="/icons/previous.svg"`                                           |
| `next.svg`     | Player           | Image        | `src="/icons/next.svg"`                                               |
| `miu_nem.jpg`  | MainSection      | Static Image | Static import: `import MiuLem from "../../public/images/miu_nem.jpg"` |
| `niu_boa.jpg`  | MainSection      | Static Image | Static import: `import NiuBoa from "../../public/images/niu_boa.jpg"` |

---

## 5. Shared Dependencies

### @love-days/utils Package

**Location:** `/packages/utils/`  
**Referenced In:** Player component

**Imports in Player:**

```tsx
import { songs, ISong } from "@love-days/utils";
```

**Dependency Usage:**

- `songs` - Array of song objects with properties:
  - `audio` (string) - Supabase storage URL
  - `img` (string) - Image URL
  - `name` (string) - Song title
  - `author` (string) - Artist name
  - `duration` (string) - Formatted duration (MM:SS)
- `ISong` - TypeScript interface for song type

**Integration Pattern:** The Player component imports and uses songs to populate the playlist, iterates with `.map()`, and manages current song state.

### External Dependencies

**From package.json:**

- `next` (^15.2.1) - Framework with Pages Router
- `react` (^19.0.0) - UI library with new hooks
- `react-dom` (^19.0.0) - DOM rendering
- `dayjs` (^1.11.10) - Used in CountUp & MainSection for date calculations
- `@love-days/utils` (file:../../packages/utils) - Internal package
- `sharp` (^0.33.5) - Image optimization

**Dev Dependencies:**

- `typescript` (^5.4.2) - TS compilation
- `sass` (^1.71.1) - SCSS compilation
- `tailwindcss` (^3.4.1) - Utility CSS
- `postcss` (^8.4.35) - CSS processing
- `autoprefixer` (^10.4.18) - Browser prefixes
- `eslint`, `prettier` - Code quality

---

## 6. Configuration Files

### next.config.js

```js
const nextConfig = {
  reactStrictMode: true,
  output: "export", // Static export (no Node.js)
  images: {
    unoptimized: true, // Required for static export
  },
  distDir: "out", // Output to 'out/' not '.next/'
};
```

**Implications:**

- No server-side rendering
- No API routes
- No dynamic routing at build time
- Must use `unoptimized` images

### tsconfig.json

**Compiler Options:**

- `strict: true` - All strict type checks enabled
- `moduleResolution: bundler` - For Next.js 15 compatibility
- `jsx: "preserve"` - Next.js handles JSX transformation

**Path Aliases Configured:**

```json
"paths": {
  "@/*": ["./*"],
  "@components/*": ["components/*"],
  "@components": ["components"],
  "@public/*": ["public/*"],
  "@public": ["public"],
  "@styles/*": ["styles/*"],
  "@styles": ["styles"],
  "@utils/*": ["utils/*"],
  "@utils": ["utils"]
}
```

**Current Usage:** Not extensively used in components (mostly direct relative imports)

### postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### package.json Scripts

```json
{
  "dev": "next dev --turbopack", // Dev server with turbopack
  "build": "next build", // Production build
  "start": "next start", // Start production server
  "lint": "next lint", // ESLint checking
  "lint:fix": "next lint --fix", // Auto-fix linting
  "format": "prettier --write .", // Format all files
  "format:check": "prettier --check .", // Check formatting
  "type-check": "tsc --noEmit", // TypeScript validation
  "clean": "rm -rf .next && rm -rf .turbo" // Clean build artifacts
}
```

---

## 7. Component Dependency Tree & Import Analysis

### Direct Component Dependencies

```
index.tsx
  ├─ MainLayout
  ├─ MainTitle (imports MainTitle.module.scss, uses v.$primary)
  ├─ CountUp (Client)
  │  └─ Clock (Client)
  ├─ MainSection (imports NiuBoa, MiuLem images, Heart icon)
  │  └─ RoundedImage (2x)
  │     └─ Next Image component
  ├─ Footer
  └─ Player (Client, imports @love-days/utils)
     └─ imports songs, ISong from @love-days/utils
     └─ Next Image component (for controls icons)
```

### Import Patterns Observed

1. **SCSS Module Imports:**

   ```tsx
   import styles from "./Player.module.scss";
   // Usage: className={styles.card}
   ```

2. **Static Image Imports:**

   ```tsx
   import NiuBoa from "../../public/images/niu_boa.jpg";
   import MiuLem from "../../public/images/miu_nem.jpg";
   import Heart from "../../public/icons/heart.png";
   ```

3. **Dynamic Icons (SVG):**

   ```tsx
   <Image src="/icons/play.svg" width={20} height={20} alt="Play" />
   ```

4. **SCSS Variable Imports:**

   ```tsx
   @use "../../styles/variables" as v;
   // Usage: color: v.$primary;
   ```

5. **Shared Utils:**

   ```tsx
   import { songs, ISong } from "@love-days/utils";
   ```

6. **Next.js Core:**

   ```tsx
   import Image from "next/image";
   import Head from "next/head";
   import type { NextPage } from "next";
   import type { AppProps } from "next/app";
   ```

7. **React Hooks:**
   ```tsx
   import { FC, useEffect, useState, useRef, useCallback } from "react";
   import { PropsWithChildren } from "react";
   ```

---

## 8. Current Styling Patterns & Challenges

### SCSS Module Pattern

- Each component has its own `.module.scss` file
- Scoped class names prevent global conflicts
- Uses SCSS variables from `_variables.scss` with `@use` syntax
- Contains hardcoded color values mixed with variable references

### Tailwind CSS Pattern

- Utility-first classes in JSX
- Extended with custom animation (`spin-slow`) and breakpoint (`xs`)
- Used for layout, spacing, typography, and responsive design
- **No custom theme colors defined** in tailwind.config.js

### Hybrid Issues

1. **Color System Fragmentation:**

   - Variables in SCSS: `#ec407a`, `#b90d46`
   - Globals hardcoded: `#ee9ca7`, `#ffdde1`
   - Player hardcoded: `#071739`, `#c471ed`, `#a770ef`, `#fdb99b`, `#cf8bf3`
   - Tailwind: Uses default theme colors (e.g., `text-purple-500`)

2. **No Centralized Theme:**

   - Colors scattered across multiple files
   - Gradients duplicated (CountUp matches globals)
   - No design tokens or theme system

3. **Client Component Usage:**
   - Player, CountUp, Clock marked as Client Components
   - Necessary for useEffect and state management
   - May impact performance on first render

### Design System Gap

- No theme provider or context
- No CSS custom properties (variables)
- No design tokens file
- No component variant system

---

## 9. Responsive Design & Layout

### Breakpoint Usage

**Tailwind Breakpoints Used:**

- `xs` (320px) - Custom, mobile phones
- `sm` (640px) - Small devices
- `md` (768px) - Tablets
- `lg` (1024px) - Laptops
- No xl/2xl breakpoints detected in current code

### Responsive Classes in Components

| Component    | Breakpoint Classes                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------- |
| index.tsx    | `md:grid-cols-3`, `xs:grid-cols-1`, `lg:gap-3`, `md:gap-2`, `md:col-span-2`                         |
| MainSection  | `lg:grid-cols-3`, `sm:grid-cols-1`, `lg:gap-4`, `md:gap-2`, `xs:justify-center`, `lg:justify-start` |
| RoundedImage | Uses fixed dimensions (250px) via SCSS, no responsive adjustment                                    |
| Player       | Fixed max-width (290px), no media queries                                                           |
| Clock        | No responsive adjustments                                                                           |

### Layout Strategy

- **Desktop (lg+):** 3-column grid (2 cols content, 1 col player)
- **Tablet (md-lg):** 3-column grid with tighter gaps
- **Mobile (xs-sm):** 1-column stacked layout

---

## 10. Build & Performance Considerations

### Static Export Constraints

- **No dynamic routes:** All pages must be static
- **No image optimization:** Using `unoptimized: true`
- **No API routes:** Backend calls handled via external services (Supabase)
- **Output:** Single `out/` directory ready for static hosting

### Client-Side Rendering Pattern

- **Player:** Interactive with state and refs - Client Component
- **CountUp:** Real-time updates - Client Component
- **Clock:** Ticking display - Client Component
- **Other components:** Functional, can be Server Components (but not explicitly marked)

### Bundle Considerations

- **No code splitting:** Single page app
- **Large SCSS:** Player.module.scss is 363 lines (largest styling file)
- **Image assets:** 2 profile images, multiple icons
- **Dayjs dependency:** Used for date calculations (includes full library)

---

## Summary Table: All Files for Theme Refactor

| Category      | File Path                                          | Type           | Priority | Reason                                   |
| ------------- | -------------------------------------------------- | -------------- | -------- | ---------------------------------------- |
| **Routing**   | `pages/index.tsx`                                  | Page           | Critical | Main entry point, renders all components |
| **Routing**   | `pages/_app.tsx`                                   | App            | High     | Imports global styles                    |
| **Layout**    | `layouts/MainLayout/index.tsx`                     | Layout         | High     | Main wrapper component                   |
| **Component** | `components/Title/index.tsx`                       | Component      | High     | Uses primary color                       |
| **Component** | `components/CountUp/index.tsx`                     | Component      | Medium   | Client component with state              |
| **Component** | `components/Clock/index.tsx`                       | Component      | Medium   | Client component, real-time              |
| **Component** | `components/MainSection/index.tsx`                 | Component      | High     | Uses colors for names/dates              |
| **Component** | `components/RoundedImage/index.tsx`                | Component      | Medium   | Layout component                         |
| **Component** | `components/Player/index.tsx`                      | Component      | Critical | Largest, most complex component          |
| **Component** | `components/Footer/index.tsx`                      | Component      | Low      | Simple text component                    |
| **Styling**   | `styles/globals.scss`                              | Global         | Critical | Background gradient, fonts, scrollbar    |
| **Styling**   | `styles/_variables.scss`                           | SCSS Variables | Critical | Core color definitions                   |
| **Styling**   | `styles/_mixins.scss`                              | SCSS Utilities | Medium   | Breakpoint & utility mixins              |
| **Styling**   | `styles/Home.module.scss`                          | CSS Module     | Low      | Empty file                               |
| **Styling**   | `components/Player/Player.module.scss`             | CSS Module     | Critical | 363 lines, hardcoded colors              |
| **Styling**   | `components/CountUp/CountUp.module.scss`           | CSS Module     | High     | Gradient background                      |
| **Styling**   | `components/MainSection/MainSection.module.scss`   | CSS Module     | High     | Color definitions for names/dates        |
| **Styling**   | `components/Title/MainTitle.module.scss`           | CSS Module     | High     | Uses primary color                       |
| **Styling**   | `components/RoundedImage/RoundedImage.module.scss` | CSS Module     | Medium   | Sizing only                              |
| **Config**    | `next.config.js`                                   | Config         | High     | Static export settings                   |
| **Config**    | `tailwind.config.js`                               | Config         | High     | Minimal, needs theme extension           |
| **Config**    | `tsconfig.json`                                    | Config         | Medium   | Path aliases, compiler options           |
| **Config**    | `postcss.config.js`                                | Config         | Medium   | CSS processing pipeline                  |
| **Config**    | `package.json`                                     | Config         | High     | Dependencies and scripts                 |
| **Assets**    | `public/images/miu_nem.jpg`                        | Image          | Low      | Profile image                            |
| **Assets**    | `public/images/niu_boa.jpg`                        | Image          | Low      | Profile image                            |
| **Assets**    | `public/icons/*`                                   | SVG/PNG        | Low      | Player controls, decorative              |

---

## Unresolved Questions / Refactor Considerations

1. **Should theme colors use CSS custom properties (--color-primary) instead of SCSS variables?**

   - Allows runtime theme switching without rebuild
   - Better Tailwind integration
   - Requires CSS-in-JS or CSS custom properties strategy

2. **Is the Tailwind + SCSS Module hybrid approach intentional?**

   - Could streamline to Tailwind-only using extend.colors
   - Or use CSS modules exclusively with custom properties

3. **Why is Footer using `text-purple-500` instead of custom SCSS variable?**

   - Inconsistent with rest of app
   - Should use `v.$primary` or custom class

4. **RoundedImage component uses `250px !important` - why force override?**

   - Could indicate responsive sizing conflict
   - Should support responsive widths

5. **Hardcoded dates in components:**

   - `startDate = new Date("2020-08-22T00:00:00")` duplicated in CountUp and MainSection
   - Should be centralized in `@love-days/utils`

6. **Player styling has 30+ classes - is modularization needed?**

   - Consider splitting into sub-components (Controls, Playlist, Timeline, SongInfo)
   - Would make theme refactoring easier

7. **How will theme switching be implemented?**

   - Context provider with theme state?
   - CSS custom properties at :root level?
   - Multiple CSS files loaded conditionally?

8. **Image optimization strategy for static export:**
   - Current: `unoptimized: true` for all images
   - Future: Pre-optimize images in build step?

---

## Next Steps for Theme Refactor

1. **Extract Theme System**

   - Create `styles/theme.ts` or `styles/theme.scss` with color tokens
   - Define theme object with all colors, gradients, shadows
   - Export as CSS custom properties and TypeScript constants

2. **Centralize SCSS Variables**

   - Consolidate colors from all SCSS files into single theme file
   - Remove hardcoded colors from components
   - Use consistent naming (light, dark variants)

3. **Extend Tailwind Theme**

   - Add custom colors to `tailwind.config.js` theme.extend.colors
   - Map theme colors to Tailwind utilities
   - Add gradient definitions

4. **Audit Component Colors**

   - Document every color usage in each component
   - Identify color role (primary, secondary, accent, background, etc.)
   - Replace hardcoded with theme variables

5. **Consider Client Components**

   - Evaluate if theme context is needed
   - Plan how Client Components will access theme
   - May need useTheme hook or Theme provider

6. **Test Responsiveness**

   - Ensure RoundedImage works at all breakpoints
   - Verify grid gaps at each breakpoint
   - Player sizing on mobile (currently 290px max)

7. **Documentation**
   - Create color palette reference
   - Document Tailwind custom config
   - Add theme switching implementation guide
