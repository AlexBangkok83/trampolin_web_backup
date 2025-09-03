# 🚀 DEPLOYMENT CHECKLIST

## Quick Deploy to Production

**⚠️ IMPORTANT: Always use `upstream` for live deployment!**

### 1. Pre-Deployment Check

```bash
npm run deploy:check  # Runs lint + build + test
```

### 2. Deploy to Live Site

```bash
git add .
git commit -m "feat: describe your changes"
git push upstream main  # 🔴 LIVE DEPLOYMENT
```

### 3. Verify Deployment

- Check DigitalOcean App Platform dashboard
- Visit live site in 2-5 minutes
- Monitor `/api/health` endpoint

---

## Repository Remotes

- **upstream** = `https://github.com/BrightOnAnalytics/trampolin-web` 🔴 **PRODUCTION**
- **origin** = `https://github.com/AlexBangkok83/trampolin_web_backup` 🟡 **BACKUP ONLY**

## Common Commands

```bash
# Check deployment readiness
npm run deploy:check

# See correct deployment command
npm run deploy:live

# Deploy to production (the real command)
git push upstream main

# Backup only (NOT live deployment)
git push origin main
```

## Troubleshooting

**Build fails locally?**

1. Check `npm run lint` for errors
2. Check `npm run build` for issues
3. Fix issues before deploying

**Deployment fails on DigitalOcean?**

1. Check App Platform logs
2. Verify environment variables
3. Check database connection

## Subdomain Configuration

The app supports three subdomains:

- **insights.trampolin.ai** - Public marketing site (/, /pricing, /features, /about)
- **app.insights.trampolin.ai** - Protected app interface (/dashboard, /analyze, /saved, /history)
- **admin.insights.trampolin.ai** - Admin interface (/dashboard/admin)

### DigitalOcean Domain Setup

In your DigitalOcean App Platform settings, add all three domains:

1. Go to Settings → Domains
2. Add domains:
   - `insights.trampolin.ai`
   - `app.insights.trampolin.ai`
   - `admin.insights.trampolin.ai`
3. All should point to the same app instance

The middleware automatically routes users to the correct subdomain based on authentication and role.

## Environment Variables (DigitalOcean)

Required for production:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
