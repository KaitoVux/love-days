# Deployment Checklist

Quick reference for deploying API and Admin to Vercel.

## Pre-deployment

- [ ] Supabase project: `pizsodtvikocjjpqxwbh.supabase.co`
- [ ] Custom domains ready (needed for CORS_ORIGINS)
- [ ] Vercel account connected to GitHub
- [ ] Get Supabase credentials:
  - [ ] Connection Pooling URL (port 6543)
  - [ ] Direct URL (port 5432)
  - [ ] Service role key
  - [ ] Anon key

---

## API Deployment

### Vercel Setup

- [ ] Create new project → Import `love-days` repo
- [ ] Root Directory: `apps/api`
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `dist`

### Environment Variables

```bash
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@...pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://pizsodtvikocjjpqxwbh.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbG..."
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com,http://localhost:3000,http://localhost:3001"
```

**Important:** Update `CORS_ORIGINS` with your actual domain names after deployment.

### Deploy & Verify

- [ ] Deploy
- [ ] Test: `curl https://your-api.vercel.app/songs`
- [ ] Add custom domain: `api.yourdomain.com`
- [ ] DNS CNAME: `api` → `cname.vercel-dns.com`
- [ ] Wait for SSL (~5 min)

---

## Admin Deployment

### Vercel Setup

- [ ] Create new project → Import `love-days` repo
- [ ] Root Directory: `apps/admin`
- [ ] Framework: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL="https://pizsodtvikocjjpqxwbh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### Deploy & Verify

- [ ] Deploy
- [ ] Test: Open `https://your-admin.vercel.app`
- [ ] Add custom domain: `admin.yourdomain.com`
- [ ] DNS CNAME: `admin` → `cname.vercel-dns.com`
- [ ] Wait for SSL (~5 min)

---

## Authentication Setup

### Supabase Config

- [ ] Dashboard → Authentication → URL Configuration
  - Site URL: `https://admin.yourdomain.com`
  - Redirect URLs: `https://admin.yourdomain.com/auth/callback`

### Create Admin User

- [ ] Dashboard → Authentication → Users → Add User
  - Email: `your-email@domain.com`
  - Password: (strong password)
  - Auto-confirm: ✅

### Code Changes (if not exists)

- [ ] Create `apps/admin/middleware.ts` (see deployment-guide.md)
- [ ] Create `apps/admin/app/login/page.tsx` (see deployment-guide.md)
- [ ] Commit and push → Vercel auto-deploys

---

## Post-deployment

### Monitoring

- [ ] UptimeRobot: Monitor `https://api.yourdomain.com/health`
- [ ] UptimeRobot: Monitor `https://admin.yourdomain.com`
- [ ] Enable Vercel Analytics (Dashboard)

### Testing

- [ ] Login to admin panel: `https://admin.yourdomain.com/login`
- [ ] Upload test song
- [ ] Verify song appears on web app: `https://yourdomain.com`
- [ ] Check Supabase storage: songs + images buckets

### Documentation

- [ ] Save admin credentials in password manager
- [ ] Document custom domain DNS records
- [ ] Add API URL to `.env.example` files

---

## Rollback Plan

If deployment fails:

1. Vercel Dashboard → Deployments → Previous version → Promote
2. Check logs: Vercel Dashboard → Deployment → Build Logs
3. Verify env vars: Settings → Environment Variables

---

## Quick Commands

```bash
# Deploy API (CLI)
cd apps/api && vercel --prod

# Deploy Admin (CLI)
cd apps/admin && vercel --prod

# Test API locally
cd apps/api && npm run dev
curl http://localhost:3002/songs

# Test Admin locally
cd apps/admin && npm run dev
open http://localhost:3001
```

---

## Troubleshooting

**API 500 error:**

- Check DATABASE_URL in Vercel env vars
- Wake Supabase project if paused

**Admin can't reach API:**

- Verify NEXT_PUBLIC_API_URL env var
- Check CORS_ORIGINS includes admin domain in Vercel env vars
- Test CORS: `curl -H "Origin: https://admin.yourdomain.com" https://api.yourdomain.com/songs -v`

**CORS errors (blocked by browser):**

- Verify CORS_ORIGINS in Vercel env vars includes requesting domain
- Check browser console for specific blocked origin
- Add origin to CORS_ORIGINS: `existing-origins,https://new-origin.com`
- Redeploy after env var change

**Auth redirect loop:**

- Check Supabase callback URL matches admin domain
- Clear browser cookies

**Build fails:**

- Check package.json scripts
- Verify Turborepo builds packages in correct order
- Check Vercel build logs

---

## Success Criteria

- [ ] API responds: `https://api.yourdomain.com/songs`
- [ ] Admin loads: `https://admin.yourdomain.com`
- [ ] CORS allows admin domain (check browser console, no CORS errors)
- [ ] Auth works: Login → Redirect to dashboard
- [ ] Song upload works end-to-end
- [ ] Web app fetches from API
- [ ] Custom domains have valid SSL
- [ ] Monitoring alerts configured

---

## Estimated Time

- API deployment: **15 minutes**
- Admin deployment: **20 minutes**
- Auth setup: **30 minutes**
- Testing: **15 minutes**
- **Total: ~1.5 hours**
