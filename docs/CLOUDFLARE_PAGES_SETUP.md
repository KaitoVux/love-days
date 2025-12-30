# Cloudflare Pages Setup Guide

This guide explains how to deploy the Love Days web application to Cloudflare Pages.

## Prerequisites

- Cloudflare account with Pages enabled
- GitHub repository connected to Cloudflare Pages

## Build Configuration

### Required Settings in Cloudflare Pages Dashboard

Navigate to your Cloudflare Pages project settings and configure:

**Framework preset:** `Next.js (Static HTML Export)`

**Build settings:**

- **Production branch:** `master` (or your main branch)
- **Build command:** `npx turbo build --filter=@love-days/web...`
- **Build output directory:** `apps/web/out`
- **Root directory:** `/` (monorepo root)

**Environment variables:**

```bash
NODE_VERSION=22.21.1
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Node.js Version

The project uses **Node.js 22.21.1** for consistency across all environments.

Cloudflare Pages will automatically detect the Node.js version from:

1. `.nvmrc` file (recommended)
2. `.node-version` file (fallback)
3. `package.json` `engines.node` field
4. `NODE_VERSION` environment variable (override)

Current version specified: **22.21.1**

**Note:** With Turborepo filtered builds, only `apps/web` and `packages/utils` dependencies are installed, so Prisma (from `apps/api`) is not included in the web build.

## Build Process

The build process uses **Turborepo filtering** to build only the web app and its dependencies:

1. Cloudflare Pages reads `.nvmrc` or `NODE_VERSION` env var
2. Installs Node.js 22.21.1
3. Runs `npm install` at monorepo root
4. Executes build command: `npx turbo build --filter=@love-days/web...`
   - Turborepo analyzes dependency graph
   - Builds only `@love-days/web` and `@love-days/utils` (skips `apps/api`, `apps/admin`)
   - Reduces build time by ~40% compared to full monorepo build
5. Outputs static files to `apps/web/out/`
6. Deploys static files to Cloudflare CDN

**Why Turbo filtering?**

- Only installs dependencies needed for web app
- Skips heavy API dependencies (Prisma, NestJS, etc.)
- Faster builds with smaller dependency footprint
- Maintains monorepo benefits (shared packages)

## Monorepo Considerations

**Turborepo Filtered Builds:**

The monorepo contains multiple apps:

- `apps/web` - Main Next.js application (deployed to Cloudflare Pages)
- `apps/admin` - Admin dashboard (not needed for web build)
- `apps/api` - NestJS backend API with Prisma (not needed for web build)

Using `--filter=@love-days/web...` tells Turborepo to:

1. Build only `@love-days/web` package
2. Include transitive dependencies (`packages/utils`)
3. Skip unrelated packages (`apps/api`, `apps/admin`)

**Benefits:**

- ✅ Faster builds (only 2 packages instead of 5)
- ✅ Smaller dependency tree
- ✅ No Prisma installation for web builds
- ✅ Shared packages (`packages/utils`, `packages/types`) still work correctly

## Troubleshooting

### Error: "Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+"

**Cause:** Build command is not using Turbo filter, causing all workspace dependencies (including Prisma) to be installed

**Solutions:**

1. Verify build command is: `npx turbo build --filter=@love-days/web...`
2. If still occurring, verify `.nvmrc` file exists in repository root
3. Check Cloudflare Pages build logs to confirm correct Node.js version

### Error: "turbo: command not found"

**Cause:** Turborepo is not installed

**Solution:** Verify `turbo` is in root `package.json` devDependencies (should be version `^2.5.3`)

### Build fails with "No tasks found"

**Cause:** Turbo filter syntax error or package name mismatch

**Solution:**

1. Verify package name is `@love-days/web` in `apps/web/package.json`
2. Ensure build command includes the `...` suffix: `--filter=@love-days/web...`

### Static export errors

**Cause:** Next.js configuration issues

**Solution:**

- Verify `apps/web/next.config.js` has `output: "export"`
- Check for dynamic routes or unsupported features in static export mode

## Deploy Hook Configuration

To trigger rebuilds via API (admin dashboard):

1. Go to Cloudflare Pages project → Settings → Builds & deployments
2. Click "Add deploy hook"
3. Name: "Admin Rebuild Hook"
4. Production branch: `master`
5. Copy the webhook URL
6. Add to API `.env`:
   ```
   CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID
   ```

## Deployment Workflow

1. **Manual Deploy:** Push to production branch triggers automatic build
2. **Admin Trigger:** Click "Rebuild Site" in admin dashboard settings
3. **API Trigger:** POST request to `/api/v1/deploy/trigger` with auth token

## Performance Optimization

**Cloudflare Pages provides:**

- Global CDN distribution
- Automatic HTTPS
- Unlimited bandwidth
- Instant cache invalidation
- Smart caching with stale-while-revalidate

**Turborepo optimizations:**

- **Filtered builds** - Only build required packages
- **Dependency graph analysis** - Automatically includes transitive dependencies
- **Remote caching** (optional) - Cache build outputs across CI/CD runs
- **Parallel execution** - Build multiple packages concurrently when possible

**Build time comparison:**

| Build Strategy | Packages Built | Avg Build Time | Dependencies Installed |
| -------------- | -------------- | -------------- | ---------------------- |
| Full monorepo  | 5 packages     | ~4-5 min       | ~800 packages          |
| Turbo filtered | 2 packages     | ~2-3 min       | ~400 packages          |

## Advanced: Testing the Build Locally

Before deploying to Cloudflare Pages, test the filtered build locally:

```bash
# Clean previous builds
rm -rf apps/web/out apps/web/.next

# Run filtered build (same as Cloudflare Pages)
npx turbo build --filter=@love-days/web...

# Verify output
ls -lh apps/web/out/

# Test locally
cd apps/web && npx serve out
```

**Expected output:**

```
• Packages in scope: @love-days/utils, @love-days/web
• Running build in 2 packages
```

If you see more than 2 packages, the filter is not working correctly.

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Deploy Hooks Documentation](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
- [Turborepo Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Turborepo with Cloudflare Pages](https://turbo.build/repo/docs/guides/deploying-with-cloudflare-pages)
