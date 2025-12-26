# Next.js UI Theme Refactor Plan

**Created:** 2025-12-25 | **Status:** In Progress (Phase 03 Complete)
**Goal:** Refactor apps/web to adopt visual design from apps/web-new-ui while keeping Next.js framework

---

## Overview

Migrate Love Days web app from Pages Router to App Router, adopting shadcn/ui components, HSL-based theme system (hue 350), right sidebar music player layout. Preserve Supabase audio integration, static export, @love-days/utils dependency.

### Key Changes

- **Router:** Pages Router -> App Router (incremental)
- **Components:** Custom SCSS -> shadcn/ui + hybrid Tailwind/SCSS
- **Theme:** Scattered hardcoded colors -> HSL CSS variables (350 hue)
- **Layout:** Grid with inline player -> Main content + right sidebar player
- **Icons:** Static SVG -> lucide-react

### Preserved

- Static export (`output: "export"`)
- Supabase audio storage integration
- @love-days/utils package usage
- Monorepo structure

---

## Phase Summary

| Phase | Name                                                       | Priority | Est. Time | Status   |
| ----- | ---------------------------------------------------------- | -------- | --------- | -------- |
| 01    | [Foundation Setup](./phase-01-foundation-setup.md)         | Critical | 2-3h      | Done     |
| 02    | [App Router Migration](./phase-02-app-router-migration.md) | Critical | 2-3h      | Done     |
| 03    | [Theme System](./phase-03-theme-system.md)                 | High     | 1-2h      | Done     |
| 04    | [Component Refactor](./phase-04-component-refactor.md)     | High     | 3-4h      | Pending  |
| 05    | [Music Player](./phase-05-music-player.md)                 | Critical | 3-4h      | Pending  |
| 06    | [Testing & Polish](./phase-06-testing-polish.md)           | Medium   | 2-3h      | Pending  |

**Total Estimated Time:** 13-19 hours

---

## Architecture Decisions

1. **App Router for future-proofing** - Metadata API, layout persistence, server components
2. **shadcn/ui for music player** - Slider/Button copy-paste, full source control, ~25KB impact
3. **HSL CSS variables** - Runtime theme switching ready, shadcn compatible
4. **Hybrid Tailwind+SCSS** - CSS variables bridge both systems, preserve existing SCSS investment
5. **lucide-react icons** - Consistent with shadcn, tree-shakeable

---

## Progress Tracking

- [x] Phase 01: Foundation Setup (2025-12-26)
- [x] Phase 02: App Router Migration (2025-12-26)
- [x] Phase 03: Theme System (2025-12-26)
- [ ] Phase 04: Component Refactor
- [ ] Phase 05: Music Player
- [ ] Phase 06: Testing & Polish

**Progress:** 50.0% (3/6 phases complete) - Last update: 2025-12-26 (Phase 03 DONE at 2025-12-26 17:13)

---

## Reports & Research

- [App Router Migration Research](./research/researcher-app-router-migration.md)
- [shadcn/ui Integration Research](./research/researcher-shadcn-integration.md)
- [Current Web Structure Scout](./scout/scout-current-web-structure.md)
- [Phase 03: SCSS Color Audit](./reports/phase-03-scss-color-audit.md)
- [Phase 03: Code Review](./reports/code-reviewer-251226-phase-03-theme-system.md)

---

## Risk Summary

| Risk                                        | Impact | Mitigation                         |
| ------------------------------------------- | ------ | ---------------------------------- |
| Navigation between routers during migration | Medium | Complete migration in single phase |
| SCSS/Tailwind conflicts                     | Low    | CSS variables bridge               |
| Static export constraints                   | Low    | Already working, no changes needed |
| Bundle size increase                        | Low    | shadcn copy-paste, tree-shaking    |

---

## Unresolved Questions

1. Dark mode toggle - implement or skip?
2. Mobile sidebar behavior - drawer or overlay?
3. Profile images - keep actual photos or use emojis like new-ui?
