# Changelog

All notable changes to the Love Days project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-25

### Added

- Turborepo monorepo structure
- Shared utilities package (`@love-days/utils`)
- Comprehensive date utility functions
- Centralized type definitions
- Smart build caching with Turborepo
- Parallel task execution
- Enhanced developer tooling

### Changed

- **BREAKING:** Migrated from single Next.js app to monorepo structure
- Moved Next.js application to `apps/web` directory
- Restructured utilities into shared package
- Updated import paths to use `@love-days/utils`
- Enhanced `.gitignore` patterns for monorepo compatibility
- Improved ESLint configuration across packages

### Fixed

- Code formatting inconsistencies
- Import resolution errors
- Build artifact management
- Git hook compatibility with monorepo structure

### Removed

- Legacy build artifacts and unused files
- Redundant configuration files
- macOS system files from repository

### Technical Details

- **Turborepo Version:** 2.5.3
- **Node Version:** 20.18.3
- **Packages Structure:**
  - `apps/web`: Next.js 15.2.1 application
  - `packages/utils`: Shared TypeScript utilities
- **Build System:** Turborepo with smart caching
- **Linting:** ESLint + Prettier across all packages
- **Type Safety:** Full TypeScript support with shared types

### Migration Notes

- All existing functionality preserved
- Development workflow improved with faster builds
- Enhanced code reusability across packages
- Prepared for future scaling with additional apps/packages

---

## Pre-Turborepo Versions

### [0.1.0] - Previous

- Initial Next.js application
- Basic music player functionality
- Song management utilities
- Love days countdown features
