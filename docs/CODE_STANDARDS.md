# Code Standards & Best Practices

**Version**: 1.0
**Last Updated**: 2025-12-26
**Framework**: Next.js 15 + React 19 + TypeScript 5.4
**Enforced By**: ESLint, Prettier, Husky

## Overview

Standards document for Love Days codebase. Enforced at pre-commit via Husky + lint-staged. TypeScript strict mode enabled. No implicit `any` types. All code must be formatted via Prettier before committing.

## TypeScript Standards

### Strict Mode Enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Annotations

**Required**:

- All function parameters
- All function return types
- All exported values
- All component props

```typescript
// ❌ BAD
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Interface & Type Usage

**Preferred Order**:

1. Props interfaces (PascalCase suffix `Props`)
2. State interfaces (PascalCase)
3. API interfaces (PascalCase)
4. Utility types (camelCase suffix `Type`)

```typescript
// Props interface
interface PlayerProps {
  songs: ISong[];
  onSongChange?: (song: ISong) => void;
  autoPlay?: boolean;
}

// State interface
interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
}

// Component
export function Player({ songs, onSongChange, autoPlay }: PlayerProps) {
  const [state, setState] = useState<PlayerState>({
    currentIndex: 0,
    isPlaying: autoPlay ?? false,
    volume: 1,
  });
  // ...
}
```

### Generic Types

Use generics for reusable logic:

```typescript
// ❌ BAD
function useLocalStorage(key: string, defaultValue: any) {
  const [value, setValue] = useState(defaultValue);
  return [value, setValue];
}

// ✅ GOOD
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  return [value, setValue] as const;
}

// Usage
const [user, setUser] = useLocalStorage<User>("user", defaultUser);
```

### Unused Variables

Prefix with `_` if intentionally unused:

```typescript
// ✅ GOOD - Explicitly ignored
const [_unused, setUsed] = useState(0);

// ✅ GOOD - Used
const { id, name } = props;
```

### Avoid `any`

```typescript
// ❌ BAD
const data: any = fetchData();

// ✅ GOOD
const data: ISong = fetchData();

// ✅ GOOD if unknown
const data: unknown = fetchData();
// Then narrow type with type guards
if (isSong(data)) {
  // data is ISong here
}
```

## React Component Standards

### Functional Components Only

```typescript
// ❌ BAD - Class components not used
class PlayerComponent extends React.Component { }

// ✅ GOOD - Functional components
export function Player(props: PlayerProps) {
  return <div>...</div>;
}
```

### Naming Conventions

**Components**: PascalCase (matches filename)
**Props interfaces**: `ComponentProps`
**Custom hooks**: `useHookName`

```typescript
// components/Player/index.tsx
export function Player(props: PlayerProps) {}

// hooks/useAudio.ts
export function useAudio(url: string) {}

// utils/formatDuration.ts
export function formatDuration(seconds: number): string {}
```

### Props Destructuring

Always destructure props:

```typescript
// ❌ BAD
export function Button(props: ButtonProps) {
  return <button>{props.children}</button>;
}

// ✅ GOOD
export function Button({ children, className, ...rest }: ButtonProps) {
  return <button className={className} {...rest}>{children}</button>;
}
```

### Event Handlers

Arrow functions in component scope (auto-bound):

```typescript
export function Button({ onSubmit }: ButtonProps) {
  // ✅ GOOD - Arrow function (auto-bound)
  const handleClick = () => {
    onSubmit?.();
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### Hook Rules

**Order** (same component):

1. useState
2. useEffect
3. Custom hooks
4. Event handlers

```typescript
export function Player(props: PlayerProps) {
  // State first
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effects second
  useEffect(() => {
    // Cleanup effect
  }, [currentIndex]);

  // Custom hooks
  const audio = useAudio(props.songs[currentIndex].audio);

  // Event handlers
  const handlePlay = () => {
    audio.play();
    setIsPlaying(true);
  };

  return <div onClick={handlePlay}>Play</div>;
}
```

### Conditional Rendering

```typescript
// ✅ GOOD - Ternary for simple cases
{isLoading ? <Spinner /> : <Content />}

// ✅ GOOD - Logical AND for single element
{isVisible && <Dialog />}

// ✅ GOOD - Early return for complex logic
if (!data) return <Empty />;
if (error) return <Error message={error} />;
return <Success data={data} />;
```

### Keys in Lists

Always provide stable keys (never index):

```typescript
// ❌ BAD - Index as key
{songs.map((song, index) => (
  <SongItem key={index} song={song} />
))}

// ✅ GOOD - Unique identifier
{songs.map((song) => (
  <SongItem key={song.id} song={song} />
))}
```

## File Organization

### Component Structure

```
components/
├── Player/
│   ├── index.tsx              # Main component
│   ├── Player.module.scss     # Component styles
│   ├── controls.tsx           # Sub-components
│   ├── progress.tsx
│   └── types.ts               # Component types
│
├── ui/                        # shadcn/ui components
│   ├── index.ts              # Barrel export
│   ├── button.tsx
│   ├── dialog.tsx
│   └── [shadcn-component]/
│
└── [Feature]/                 # Feature folder pattern
    ├── index.tsx
    ├── [Feature].module.scss
    └── [subcomponent].tsx
```

### Barrel Exports

Use `index.ts` for cleaner imports:

```typescript
// components/ui/index.ts
export { Button } from "./button";
export { Dialog } from "./dialog";
export type { ButtonProps } from "./button";

// Usage
import { Button, Dialog } from "@components/ui";
```

### Module Organization

```
lib/
├── utils.ts                   # Shared utilities
├── hooks.ts                   # Shared hooks
└── constants.ts               # Constants

utils/
├── formatting.ts              # Format functions
├── validation.ts              # Validators
└── math.ts                    # Math functions

types.ts                       # Shared types (if needed)
```

## CSS Standards

### CSS Modules

Use `.module.scss` for component-scoped styles:

```scss
// components/Player/Player.module.scss
.player {
  display: flex;
  gap: 1rem;

  &__controls {
    display: flex;
    justify-content: center;
  }

  &__button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;

    &:hover {
      background-color: hsl(var(--primary));
    }
  }
}
```

**Usage**:

```typescript
import styles from "./Player.module.scss";

export function Player() {
  return (
    <div className={styles.player}>
      <div className={styles.__controls}>
        <button className={styles.__button}>Play</button>
      </div>
    </div>
  );
}
```

### Tailwind Usage

Use Tailwind for utility styles:

```typescript
// ✅ GOOD - Tailwind for layout/spacing
<div className="flex gap-4 md:gap-6">
  <div className="w-full md:w-1/2">Content</div>
</div>

// ✅ GOOD - Mix Tailwind + CSS Modules
<button className={cn(
  "px-4 py-2 rounded-lg",
  "bg-primary text-white",
  "hover:bg-primary/90",
  styles.customButton  // Add CSS Module for special needs
)}>
  Click
</button>
```

### CSS Variables

Use theme variables from `globals.scss`:

```scss
// ✅ GOOD - Use CSS variables
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
}

// ✅ GOOD - Use computed values
.highlight {
  color: hsl(var(--primary));
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}
```

## Formatting & Style

### Prettier Configuration

```json
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "tabWidth": 2
}
```

### Line Length

Maximum **100 characters** per line:

```typescript
// ❌ BAD - Over 100 characters
const veryLongVariableName = calculateSomethingWithManyParameters(
  param1,
  param2,
  param3,
  param4,
);

// ✅ GOOD - Break into multiple lines
const veryLongVariableName = calculateSomethingWithManyParameters(
  param1,
  param2,
  param3,
  param4,
);
```

### Quotes

Use **double quotes**:

```typescript
// ❌ BAD
const message = "Hello world";

// ✅ GOOD
const message = "Hello world";

// ✅ GOOD - Backticks for interpolation
const greeting = `Hello ${name}`;
```

### Semicolons

All statements require semicolons:

```typescript
// ✅ GOOD
const x = 5;
function foo() {}
export default App;
```

### Imports

Group and sort imports:

```typescript
// ✅ GOOD - Organized imports

// 1. External dependencies
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { format } from "date-fns";

// 2. Internal imports (features, utils)
import { Button } from "@components/ui";
import { useAudio } from "@hooks/useAudio";
import { calculateDuration } from "@utils/math";

// 3. Types
import type { ISong, PlayerState } from "@types";

// 4. Styles
import styles from "./Player.module.scss";
```

**Rules**:

- Type imports after value imports
- Internal absolute paths (@ aliases)
- No relative paths for far imports (`../../../`)
- One import per line for objects

## Git & Commit Standards

### Commit Message Format

```
<type>: <subject>

<body>
```

**Type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Subject**: Imperative, lowercase, no period

```bash
# ✅ GOOD
git commit -m "feat: add player controls component"
git commit -m "fix: resolve audio playback issue on iOS"
git commit -m "docs: update theme documentation"

# ❌ BAD
git commit -m "add controls"
git commit -m "Fixed bug"
git commit -m "WIP: stuff"
```

### Pre-commit Checks

Husky runs automatically:

```bash
# 1. Prettier formatting
# 2. ESLint checking
# 3. Type checking (optional, slower)

# If checks fail: Fix issues and commit again
npm run lint:fix
npm run format
npm run type-check
```

### Branch Naming

```bash
feature/component-name
fix/issue-description
docs/topic-name
refactor/system-area
```

## Error Handling

### Try-Catch Pattern

```typescript
// ✅ GOOD - Explicit error handling
async function fetchSongs() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    // Return fallback or rethrow
    return [];
  }
}
```

### Error Boundaries

```typescript
// ✅ GOOD - Component error boundaries (Phase 02+)
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### Console Logging

```typescript
// ✅ GOOD - Structured logging
console.error("Feature failed:", { feature, error, context });
console.warn("Deprecated API used:", { oldAPI, newAPI });
console.log("Debug info:", { state, props });

// ❌ BAD - Vague logging
console.log("error");
console.log(someObject);
```

## Performance Guidelines

### Memoization

Use `memo` for expensive components:

```typescript
// ✅ GOOD - Memoized expensive component
export const SongCard = React.memo(function SongCard({
  song,
  onPlay,
}: SongCardProps) {
  return <div onClick={onPlay}>{song.name}</div>;
}, (prev, next) => {
  // Custom comparison if needed
  return prev.song.id === next.song.id;
});
```

### useMemo & useCallback

Use sparingly (not all functions need memoization):

```typescript
// ✅ GOOD - Memoize expensive calculations
const memoizedTotal = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items],
);

// ✅ GOOD - Memoize callback if passed to memoized child
const handleSubmit = useCallback(() => {
  submitData(data);
}, [data]);
```

### Lazy Loading

```typescript
// ✅ GOOD - Code splitting for routes
const AdminPage = lazy(() => import("./pages/admin"));

// Usage
<Suspense fallback={<Spinner />}>
  <AdminPage />
</Suspense>
```

## Testing Standards

**Current**: Minimal testing (Phase 03)

**Future Standards**:

```typescript
// __tests__/utils.test.ts
import { formatDuration } from "@utils/math";

describe("formatDuration", () => {
  test("formats seconds to MM:SS", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  test("handles zero duration", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});
```

**Coverage Targets**:

- Utilities: 90%+
- Components: 70%+
- Pages: 60%+ (E2E coverage preferred)

## Documentation Standards

### Code Comments

```typescript
// ✅ GOOD - Explain WHY, not WHAT
// Preload next song to reduce play latency
useEffect(() => {
  const next = songs[(currentIndex + 1) % songs.length];
  new Audio(next.audio).preload = "metadata";
}, [currentIndex, songs]);

// ❌ BAD - Obvious, doesn't help
// Set current index
setCurrentIndex(index);
```

### JSDoc for Public APIs

```typescript
/**
 * Format duration in seconds to readable MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 * @example
 * formatDuration(125) // "2:05"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
```

## Common Patterns

### Custom Hooks

```typescript
export function useAudio(url: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, url]);

  return {
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying((prev) => !prev),
    audioRef,
    isPlaying,
  };
}
```

### Utility Functions

```typescript
export function cn(...inputs: (string | undefined | false)[]): string {
  return inputs
    .filter(Boolean)
    .join(" ");
}

// Or use imported cn from @lib/utils
import { cn } from "@lib/utils";

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg bg-primary",
        className,
      )}
      {...props}
    />
  );
}
```

## Anti-Patterns (Avoid)

### ❌ Hard-coded Values

```typescript
// BAD
const maxRetries = 3;
const timeout = 5000;

// GOOD
const CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 5000,
} as const;
```

### ❌ Mutating State

```typescript
// BAD
const [items, setItems] = useState([]);
items.push(newItem); // Mutation!

// GOOD
setItems((prev) => [...prev, newItem]);
```

### ❌ Boolean Props (Use Variants)

```typescript
// BAD
<Button primary disabled large />

// GOOD (with class-variance-authority)
<Button variant="primary" size="large" disabled />
```

### ❌ Prop Drilling

```typescript
// BAD
<Component1 theme={theme}>
  <Component2 theme={theme}>
    <Component3 theme={theme} />
  </Component2>
</Component1>

// GOOD
<ThemeProvider value={theme}>
  <Component1>
    <Component2>
      <Component3 />
    </Component2>
  </Component1>
</ThemeProvider>
```

## Review Checklist

Before committing, verify:

- [ ] TypeScript strict mode passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatted (`npm run format`)
- [ ] No `any` types (unless with comment)
- [ ] All exports typed
- [ ] Meaningful commit message
- [ ] No console.log left in code
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if API changed)

## Quick Reference Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint          # Check only
npm run lint:fix      # Fix automatically

# Formatting
npm run format        # Apply formatting
npm run format:check  # Check only

# Combined (pre-commit)
npm run lint:fix && npm run type-check

# Build
npm run build         # Full build

# Development
npm run dev           # Start with hot reload
```

## Questions?

Refer to:

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

Check recent PRs for current patterns and style.
