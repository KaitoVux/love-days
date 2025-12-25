# Code Style and Conventions

## TypeScript Configuration

- **Strict TypeScript**: All packages use TypeScript with strict mode
- **No explicit any**: Warns on `@typescript-eslint/no-explicit-any`
- **Unused imports**: Enforced with `unused-imports` ESLint plugin
- **Module boundaries**: Explicit module boundary types disabled

## Prettier Configuration

- **Semicolons**: Required (semi: true)
- **Quotes**: Double quotes (singleQuote: false)
- **Print width**: 100 characters
- **Tab width**: 2 spaces (no tabs)
- **Trailing commas**: ES5 style
- **Bracket spacing**: Enabled
- **Arrow parens**: Avoid when possible

## ESLint Configuration

- **Base**: Extends Next.js core-web-vitals + TypeScript recommended
- **Prettier integration**: Uses plugin:prettier/recommended
- **Unused variables**: Error on unused imports and variables (except prefixed with \_)
- **Ignored files**: tailwind.config.js, postcss.config.js

## File Organization

- **Components**: Located in `apps/web/components/`
- **Layouts**: Located in `apps/web/layouts/`
- **Pages**: Next.js pages in `apps/web/pages/`
- **Styles**: Global styles in `apps/web/styles/`
- **Utils**: Shared utilities in `packages/utils/src/`

## Naming Conventions

- **Files**: Follow Next.js conventions (kebab-case for components, pages)
- **TypeScript**: PascalCase for types/interfaces, camelCase for variables
- **Package names**: Scoped packages with @love-days/ prefix
