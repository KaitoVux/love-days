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
- **Build command:** `cd apps/web && npm run build`
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

The project requires **Node.js 22.12+** due to Prisma dependency in the monorepo.

Cloudflare Pages will automatically detect the Node.js version from:

1. `.nvmrc` file (recommended)
2. `.node-version` file (fallback)
3. `package.json` `engines.node` field
4. `NODE_VERSION` environment variable (override)

Current version specified: **22.21.1**

## Build Process

The build process:

1. Cloudflare Pages reads `.nvmrc` or `NODE_VERSION` env var
2. Installs Node.js 22.21.1
3. Runs `npm install` at monorepo root (installs all workspace dependencies)
4. Executes build command: `cd apps/web && npm run build`
5. Outputs static files to `apps/web/out/`
6. Deploys static files to Cloudflare CDN

## Monorepo Considerations

**Why Prisma dependency causes issues:**

- The monorepo includes `apps/api` which uses Prisma
- `npm install` at root installs ALL workspace dependencies
- Prisma requires Node.js 20.19+, 22.12+, or 24.0+
- Older Cloudflare Pages default Node.js version causes Prisma installation to fail

**Solution:**

- Specify Node.js version via `.nvmrc` or `NODE_VERSION` environment variable
- Cloudflare Pages will use the correct version for all dependencies

## Troubleshooting

### Error: "Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+"

**Cause:** Cloudflare Pages is using an outdated Node.js version

**Solutions:**

1. Verify `.nvmrc` file exists in repository root
2. Set `NODE_VERSION=22.21.1` in Cloudflare Pages environment variables
3. Check Cloudflare Pages build logs to confirm Node.js version being used

### Build fails with "command not found"

**Cause:** Build command might not be in correct directory

**Solution:** Ensure build command starts with `cd apps/web && ...`

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

Cloudflare Pages provides:

- Global CDN distribution
- Automatic HTTPS
- Unlimited bandwidth
- Instant cache invalidation
- Smart caching with stale-while-revalidate

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Deploy Hooks Documentation](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
