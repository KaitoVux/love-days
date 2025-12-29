# Phase 06: Testing & Polish

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** All previous phases completed
**Related Docs:** All research and scout reports

---

## Overview

| Field     | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Date      | 2025-12-25                                                   |
| Priority  | Medium                                                       |
| Status    | NOT STARTED (Phase 05 just completed at f308715)             |
| Est. Time | 2-3 hours                                                    |
| Blocker   | CLAUDE.md must be updated with App Router structure (Step 8) |

Final testing, responsive verification, animation polish, cleanup unused files, documentation update.

---

## Key Objectives

1. **Responsive testing** - xs/sm/md/lg/xl breakpoints
2. **Cross-browser verification** - Chrome, Safari, Firefox
3. **Animation performance** - FloatingHearts, transitions
4. **Static export verification** - Build and deploy test
5. **Cleanup** - Remove unused files, dependencies
6. **Documentation** - Update CLAUDE.md

---

## Requirements

### Must Have

- [ ] Test all breakpoints visually
- [ ] Verify static export works
- [ ] Remove unused SCSS files
- [ ] Remove unused dependencies
- [ ] Update CLAUDE.md with new structure

### Should Have

- [ ] Test on mobile device (or emulator)
- [ ] Verify animations smooth at 60fps
- [ ] Check for console errors

### Nice to Have

- [ ] Lighthouse performance audit
- [ ] Add loading skeleton

---

## Testing Checklist

### Responsive Testing

| Breakpoint | Width  | Test Items                                              |
| ---------- | ------ | ------------------------------------------------------- |
| xs         | 320px  | Title readable, ProfileSection stacked, Sidebar overlay |
| sm         | 640px  | Layout adjusts, Sidebar toggle visible                  |
| md         | 768px  | Grid layout if applicable, Font sizes                   |
| lg         | 1024px | Full sidebar visible, Proper spacing                    |
| xl         | 1280px | Content centered, Max-width container                   |

### Component Testing

| Component      | Tests                                                          |
| -------------- | -------------------------------------------------------------- |
| Title          | Hearts render, text-gradient works, responsive font sizes      |
| ProfileSection | Images load, names display, animations work, responsive sizing |
| CountUp        | Days calculate correctly, clock ticks, responsive layout       |
| Footer         | Centered, muted color, heart icon                              |
| FloatingHearts | 15 hearts render, float-up animation, no overflow              |
| MusicSidebar   | See dedicated section below                                    |

### Music Player Testing

| Feature        | Test Steps                                         |
| -------------- | -------------------------------------------------- |
| Play/Pause     | Click play, audio starts; click pause, audio stops |
| Progress       | Slider updates during play; drag to seek           |
| Volume         | Drag volume slider; mute button toggles            |
| Next/Prev      | Navigate tracks; prev within 3s restarts track     |
| Playlist       | Click track to play; current track highlighted     |
| Shuffle        | Enable, next track random                          |
| Repeat All     | Last track -> first track                          |
| Repeat One     | Track loops                                        |
| Sidebar Toggle | Open/close animation smooth                        |
| Track End      | Auto-advance respects repeat mode                  |

### Static Export Testing

```bash
# Build
cd apps/web
npm run build

# Verify output
ls -la out/
# Should contain: index.html, _next/, favicon.png, icons/, images/

# Local server test
npx serve out
# Visit http://localhost:3000
```

---

## Implementation Steps

### Step 1: Visual Regression Check (30 min)

```bash
cd apps/web
npm run dev
```

Open DevTools, test each breakpoint:

- 320px (xs)
- 640px (sm)
- 768px (md)
- 1024px (lg)
- 1280px (xl)

Document any layout issues.

### Step 2: Cross-Browser Testing (20 min)

Test in:

- Chrome (primary)
- Safari (webkit)
- Firefox (gecko)

Check for:

- CSS variable support
- Animation rendering
- Audio playback
- Slider interaction

### Step 3: Animation Performance (15 min)

```javascript
// In browser DevTools Console
// Enable FPS meter: Rendering > Frame Rendering Stats
```

Check:

- FloatingHearts at 60fps
- Sidebar transition smooth
- No layout thrashing

### Step 4: Console Error Check (10 min)

Open DevTools Console, reload page:

- No React hydration errors
- No undefined errors
- No 404s for assets
- No CORS errors for audio

### Step 5: Static Export Build (15 min)

```bash
npm run build
# Check for build errors

npx serve out
# Test locally

# Verify all pages work
# - Home page loads
# - Images display
# - Audio plays
# - Animations work
```

### Step 6: Cleanup Unused Files (20 min)

**Files to Remove:**

```bash
# Old components (if not already removed)
rm -rf apps/web/components/Title
rm -rf apps/web/components/MainSection
rm -rf apps/web/components/CountUp
rm -rf apps/web/components/Clock
rm -rf apps/web/components/Footer
rm -rf apps/web/components/RoundedImage
rm -rf apps/web/components/Player
rm -rf apps/web/layouts

# Old pages (if not already removed)
rm -f apps/web/pages/index.tsx
rm -f apps/web/pages/_app.tsx
rmdir apps/web/pages 2>/dev/null || true

# Empty SCSS files
rm -f apps/web/styles/Home.module.scss

# Old SCSS modules (verify not needed first)
# rm -f apps/web/components/*/[Component].module.scss
```

**Verify SCSS files can be removed:**

- `CountUp/CountUp.module.scss` - replaced by Tailwind
- `MainSection/MainSection.module.scss` - replaced by Tailwind
- `Title/MainTitle.module.scss` - replaced by Tailwind
- `RoundedImage/RoundedImage.module.scss` - replaced by Tailwind
- `Player/Player.module.scss` - replaced by Tailwind

### Step 7: Dependency Cleanup (10 min)

Check `package.json` for unused deps:

```bash
cd apps/web
npx depcheck
```

Potentially removable (verify first):

- None expected - all deps should be in use

### Step 8: Update CLAUDE.md (20 min)

Add new sections:

```markdown
## Updated Project Structure (Post-Refactor)

**Apps/web uses App Router:**

- `app/layout.tsx` - Root layout with metadata
- `app/page.tsx` - Home page

**New Component Structure:**

- `components/LoveDays/` - Main app components
  - Title, ProfileSection, CountUp, Footer, FloatingHearts, MusicSidebar
- `components/ui/` - shadcn/ui components
  - Slider

**Styling System:**

- HSL CSS variables in `styles/globals.scss`
- Tailwind-first with CSS variable colors
- lucide-react icons

**Theme Colors (350 hue):**

- `--primary: 350 80% 65%` (rose pink)
- `--background: 350 30% 8%` (dark)
- `--foreground: 350 20% 95%` (light)
```

### Step 9: Final Build Verification (15 min)

```bash
cd /Users/kaitovu/Desktop/Projects/love-days
npm run type-check
npm run lint
npm run build
```

All must pass.

---

## Todo List

- [ ] Test xs breakpoint (320px)
- [ ] Test sm breakpoint (640px)
- [ ] Test md breakpoint (768px)
- [ ] Test lg breakpoint (1024px)
- [ ] Test Chrome browser
- [ ] Test Safari browser
- [ ] Test Firefox browser
- [ ] Verify FloatingHearts 60fps
- [ ] Check console for errors
- [ ] Build static export
- [ ] Test static export locally
- [ ] Remove unused component files
- [ ] Remove unused SCSS files
- [ ] Update CLAUDE.md
- [ ] Final type-check, lint, build

---

## Success Criteria

1. No visual bugs at any breakpoint
2. No console errors
3. All animations smooth (60fps)
4. Static export builds successfully
5. Static site works when served locally
6. No unused files remain
7. CLAUDE.md updated with new structure
8. All pre-commit checks pass

---

## Risk Assessment

| Risk                 | Likelihood | Impact | Mitigation                    |
| -------------------- | ---------- | ------ | ----------------------------- |
| Safari CSS issues    | Medium     | Low    | Test early, fix with prefixes |
| Mobile touch issues  | Low        | Medium | Test on real device           |
| Static export breaks | Low        | High   | Test before removing pages/   |

---

## Security Considerations

- No new security concerns
- Review: no sensitive data exposed in static build

---

## Cleanup Summary

### Files Removed

- `components/Title/` - Replaced by LoveDays/Title
- `components/MainSection/` - Replaced by LoveDays/ProfileSection
- `components/CountUp/` - Replaced by LoveDays/CountUp
- `components/Clock/` - Merged into CountUp
- `components/Footer/` - Replaced by LoveDays/Footer
- `components/RoundedImage/` - Merged into ProfileSection
- `components/Player/` - Replaced by LoveDays/MusicSidebar
- `layouts/MainLayout/` - No longer needed
- `pages/` directory - Replaced by app/
- SCSS modules for old components

### Files Added

- `app/layout.tsx`
- `app/page.tsx`
- `components/LoveDays/*.tsx`
- `components/ui/slider.tsx`
- `lib/utils.ts`
- `tailwind.config.ts`

### Files Modified

- `styles/globals.scss` - CSS variables
- `styles/_variables.scss` - CSS var bridge
- `package.json` - New dependencies
- `tsconfig.json` - Path aliases
- `CLAUDE.md` - Documentation

---

## Post-Completion

After all phases complete:

1. Create git commit with descriptive message
2. Consider creating PR if on feature branch
3. Deploy to hosting platform
4. Monitor for any production issues
