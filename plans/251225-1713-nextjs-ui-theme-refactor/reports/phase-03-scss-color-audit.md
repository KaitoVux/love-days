# Phase 03: SCSS Color Audit

**Date:** 2025-12-26
**Purpose:** Identify hardcoded colors in component SCSS files for Phase 04 refactoring

---

## Files with Hardcoded Colors

### 1. CountUp.module.scss
**Location:** `apps/web/components/CountUp/CountUp.module.scss`

**Hardcoded Colors:**
- `#ee9ca7` - Pink gradient (fallback)
- `#ffdde1` - Light pink gradient
- Linear gradient: `#ffdde1` → `#ee9ca7`

**Recommendation for Phase 04:**
- Replace with CSS variable gradients using `hsl(var(--primary))`
- Keep gradients but use theme colors

---

### 2. Player.module.scss
**Location:** `apps/web/components/Player/Player.module.scss`

**Hardcoded Colors:**
- `$base: #071739` - Dark blue
- `$shadow-color: #c471ed` - Purple shadow
- `$white: #fff`
- `$gray: #8c8c8c`
- `#a770ef`, `#cf8bf3`, `#fdb99b` - Purple/pink/orange gradient
- `#e2e2e2` - Light gray border
- `#ec407a` - Pink (primary color)

**Recommendation for Phase 04:**
- Replace `$base` with `hsl(var(--card))`
- Replace `$shadow-color` with `hsl(var(--primary))` with opacity
- Replace gradients with theme-based gradients
- Replace `#ec407a` with `hsl(var(--primary))`
- Replace `#e2e2e2` with `hsl(var(--border))`

---

## Files Using SCSS Variables (OK with Bridge)

### 3. MainTitle.module.scss
**Location:** `apps/web/components/Title/MainTitle.module.scss`

**Status:** ✅ Uses `v.$primary` via `@use "../../styles/variables"`

**Action Required:** None - Will use CSS variables through bridge

---

### 4. MainSection.module.scss
**Location:** `apps/web/components/MainSection/MainSection.module.scss`

**Status:** ✅ Uses `v.$primary`, `v.$secondary` via `@use "../../styles/variables"`

**Action Required:** None - Will use CSS variables through bridge

---

### 5. CountUp.module.scss
**Location:** `apps/web/components/CountUp/CountUp.module.scss`

**Status:** ⚠️ Uses `v.$secondary` but also has hardcoded gradients

**Action Required:** Update gradients in Phase 04

---

## Summary

| Component    | Hardcoded Colors | Using Bridge | Phase 04 Priority |
| ------------ | ---------------- | ------------ | ----------------- |
| CountUp      | 2                | Yes          | Medium            |
| Player       | 8                | No           | High              |
| MainTitle    | 0                | Yes          | None              |
| MainSection  | 0                | Yes          | None              |
| RoundedImage | 0                | N/A          | None              |

**Total Hardcoded Colors:** 10
**Files to Update in Phase 04:** 2 (CountUp, Player)
**Priority:** Player component (High) - most hardcoded colors

---

## Notes

- SCSS variable bridge (`_variables.scss`) now maps to CSS custom properties
- Components using `v.$primary`, `v.$secondary` will automatically use new theme colors
- Hardcoded colors will be addressed in Phase 04: Component Refactor
- No breaking changes expected - bridge maintains backward compatibility
