# Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Supabase Cloud                     │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ PostgreSQL   │  │  Storage    │  │   Auth     │ │
│  │  (Pooler)    │  │  (songs/    │  │ (Single)   │ │
│  │              │  │   images)   │  │            │ │
│  └──────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
         ↑                ↑                ↑
         │                │                │
    ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
    │   API   │      │  Admin  │      │   Web   │
    │ (Vercel)│◄─────│(Vercel) │      │(CF Pages)│
    │ NestJS  │      │ Next.js │      │ Next.js │
    │         │      │  (SSR)  │      │ (Static)│
    └─────────┘      └─────────┘      └─────────┘
api.domain.com   admin.domain.com   domain.com
```

## Prerequisites

- Vercel account
- Custom domains ready
- Supabase instance: `pizsodtvikocjjpqxwbh.supabase.co`
- GitHub repository connected

---

## Phase 1: API Deployment

### 1.1 Environment Variables

**Vercel Dashboard → Project Settings → Environment Variables**

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://pizsodtvikocjjpqxwbh.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbG..." # Service role key

# CORS Configuration (comma-separated list of allowed origins)
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com,http://localhost:3000,http://localhost:3001"

# Optional
CLOUDFLARE_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID"
```

**Get connection strings:**

1. Supabase Dashboard → Project Settings → Database
2. Copy "Connection Pooling" URL (port 6543) for `DATABASE_URL`
3. Change port to 5432 for `DIRECT_URL`

### 1.2 Deploy

**Option A: Vercel CLI**

```bash
cd apps/api
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Git Integration (Recommended)**

1. Vercel Dashboard → Add New Project
2. Import from GitHub: `love-days` repository
3. Framework Preset: **NestJS** (auto-detected)
4. Root Directory: `apps/api`
5. Build Command: `npm run vercel-build` (auto-filled)
6. Deploy

**Note:** Vercel auto-detects NestJS from `src/main.ts` - no `vercel.json` needed!

### 1.3 Verify

```bash
# Health check
curl https://your-api.vercel.app/health

# Get songs
curl https://your-api.vercel.app/songs

# Swagger docs
open https://your-api.vercel.app/api
```

### 1.4 Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add: `api.yourdomain.com`
3. Add DNS record:
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL provisioning (~5 min)

---

## Phase 2: Admin Deployment

### 2.1 Verify Next.js Config

**File: `apps/admin/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Keep for Supabase images
  },
  // DO NOT add output: "export" - needs SSR for auth
};

module.exports = nextConfig;
```

### 2.2 Environment Variables

**Vercel Dashboard → Admin Project → Environment Variables**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://pizsodtvikocjjpqxwbh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..." # Anon key (public)

# API
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### 2.3 Deploy

**Important:** For Turborepo monorepo with workspace packages, we use `vercel.json` to configure build.

**File: `apps/admin/vercel.json`** (already created)

```json
{
  "buildCommand": "cd ../.. && npm run build --filter=@love-days/admin...",
  "outputDirectory": ".next",
  "installCommand": "npm install --prefix=../.."
}
```

**Vercel Dashboard:**

1. Add New Project
2. Import: `love-days` repository
3. Framework Preset: Next.js
4. Root Directory: `apps/admin` ⚠️ **Important: Keep this setting**
5. Build Command: (leave empty - uses vercel.json)
6. Output Directory: (leave empty - uses vercel.json)
7. Add environment variables
8. Deploy

**Why this works:**

- `installCommand` installs from monorepo root
- `buildCommand` uses Turbo filter to build `@love-days/admin` AND dependencies (including `@love-days/types`)
- `outputDirectory` points to `.next` relative to `apps/admin`

### 2.4 Custom Domain

1. Add: `admin.yourdomain.com`
2. DNS:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

---

## Phase 3: Authentication Setup

### 3.1 Supabase Auth Configuration

**Supabase Dashboard → Authentication → URL Configuration**

```
Site URL: https://admin.yourdomain.com
Redirect URLs:
  - https://admin.yourdomain.com/auth/callback
  - http://localhost:3001/auth/callback (development)
```

### 3.2 Create Admin User

**Supabase Dashboard → Authentication → Users**

1. Click "Add User"
2. Email: your-email@domain.com
3. Password: (generate strong password)
4. Confirm email: ✅ (auto-confirm)

### 3.3 Add Auth Middleware

**File: `apps/admin/middleware.ts`** (create if not exists)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if authenticated and on login page
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 3.4 Create Login Page

**File: `apps/admin/app/login/page.tsx`** (if not exists)

```typescript
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded">
          Login
        </button>
      </form>
    </div>
  )
}
```

---

## Phase 4: CI/CD (Optional - Vercel Git Integration)

**Auto-deploy on push:**

1. Vercel Dashboard → Project → Settings → Git
2. Production Branch: `master`
3. Ignored Build Step: (leave empty for auto-deploy)

**Monorepo Build Detection:**
Vercel automatically detects changes in `apps/api` and `apps/admin` directories.

---

## Free Tier Limits

**Vercel (Hobby Plan):**

- ✅ 100 GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Serverless function: 10s timeout
- ✅ 100K function invocations/month
- ⚠️ No team collaboration
- ⚠️ No password protection

**Supabase (Free Plan):**

- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 25 GB bandwidth/month
- ✅ 50K monthly active users
- ⚠️ Pauses after 1 week inactivity (auto-resume on request)

**Cloudflare Pages (Free):**

- ✅ Already deployed for `apps/web`
- ✅ Unlimited bandwidth
- ✅ Unlimited requests

---

## Monitoring

### Essential Health Checks

**UptimeRobot (Free):**

1. Create monitor: `https://api.yourdomain.com/health`
2. Create monitor: `https://admin.yourdomain.com`
3. Alert email on downtime

**Vercel Analytics (Built-in):**

- Vercel Dashboard → Analytics
- Free tier: 2,500 events/month

**Supabase Monitoring:**

- Dashboard → Reports
- Monitor: DB connections, storage usage

### Manual Checks

```bash
# API health
curl https://api.yourdomain.com/health

# API songs endpoint
curl https://api.yourdomain.com/songs | jq '.[] | {id, title}'

# Admin accessibility
curl -I https://admin.yourdomain.com

# DB connections (Supabase Dashboard)
# Settings → Database → Connection Pooling → Active connections
```

---

## Rollback Procedures

### API Rollback

**Vercel Dashboard:**

1. Project → Deployments
2. Find previous working deployment
3. Click ⋯ → Promote to Production

### Admin Rollback

Same as API rollback.

### Database Rollback

**Supabase:**

1. Dashboard → Database → Backups
2. Restore from snapshot (available for paid plans)
3. Free tier: No automatic backups, manual export/import

**Workaround for Free Tier:**

```bash
# Backup before risky migrations
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260105.sql
```

---

## Troubleshooting

### Admin: "Cannot find module '@love-days/types'"

**Symptom:** Build fails with type error during Vercel deployment.

```
Type error: Cannot find module '@love-days/types' or its corresponding type declarations.
```

**Cause:** Vercel building from isolated `apps/admin` directory without building workspace dependencies.

**Fix:**

1. Ensure `apps/admin/vercel.json` exists with correct config (see Phase 2.3)
2. In Vercel Dashboard → Project Settings → General:
   - Root Directory: `apps/admin`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
3. Trigger redeploy

**The vercel.json ensures:**

- Dependencies install from monorepo root
- Turbo builds `@love-days/types` before admin app
- Build command: `npm run build --filter=@love-days/admin...`

### API: "Database connection failed"

**Cause:** Wrong `DATABASE_URL` or Supabase paused.
**Fix:**

1. Check Supabase Dashboard → Database → Connection Pooler
2. Wake paused project
3. Verify connection string in Vercel env vars

### Admin: "Invalid API URL"

**Cause:** `NEXT_PUBLIC_API_URL` not set or wrong.
**Fix:**

1. Vercel Dashboard → Admin Project → Settings → Environment Variables
2. Add/update `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
3. Redeploy

### API: Cold start timeout

**Symptom:** First request takes 5-10s.
**Fix (Free Tier):**

- Use UptimeRobot to ping every 5 minutes (keeps warm)
  **Fix (Paid):**
- Upgrade to Vercel Pro ($20/mo) for reserved instances

### Admin: Infinite redirect loop

**Cause:** Middleware auth check fails.
**Fix:**

1. Check Supabase URL Configuration (callback URL)
2. Verify `middleware.ts` matcher excludes `/login`
3. Clear cookies and retry

---

## Security Checklist

- [x] Database uses connection pooling
- [ ] API has rate limiting (TODO)
- [ ] Admin requires authentication
- [ ] Supabase RLS policies enabled (TODO)
- [x] Environment variables not in git
- [x] CORS configurable via CORS_ORIGINS env variable
- [ ] Custom domains use HTTPS
- [ ] Service role key not exposed to client

---

## Cost Optimization

**Current Setup (Free):**

- API: Vercel Hobby (free)
- Admin: Vercel Hobby (free)
- Web: Cloudflare Pages (free)
- Database: Supabase Free Tier
- **Total: $0/month**

**If Limits Exceeded:**
| Service | Trigger | Upgrade | Cost |
|---------|---------|---------|------|
| Vercel | >100K function calls | Pro | $20/mo |
| Supabase | >500 MB DB or >1 GB storage | Pro | $25/mo |
| Total | | | $45/mo |

**Optimization Tips:**

1. Use Cloudflare CDN in front of API (cache GET requests)
2. Implement Redis caching (Upstash free tier: 10K commands/day)
3. Compress images before upload
4. Clean up unused storage monthly

---

## Next Steps

1. ✅ Deploy API to Vercel
2. ✅ Deploy Admin to Vercel
3. ✅ Configure custom domains
4. ✅ Set up single-user Supabase auth
5. [ ] Add auth middleware to Admin
6. [ ] Create login page
7. [ ] Set up UptimeRobot monitoring
8. [ ] Test end-to-end flow
9. [ ] Document admin credentials securely

---

## References

- API Endpoint: `https://api.yourdomain.com`
- Admin Panel: `https://admin.yourdomain.com`
- Web App: `https://yourdomain.com` (Cloudflare Pages)
- Supabase Dashboard: `https://supabase.com/dashboard/project/pizsodtvikocjjpqxwbh`
- Vercel Dashboard: `https://vercel.com/dashboard`
