# Production Deployment Guide

## Overview
This guide covers deploying the Custom Belt Builder Shopify app to production with a hosted database and backend.

## Prerequisites
- [ ] Shopify Partner account
- [ ] Production database (PostgreSQL recommended)
- [ ] Hosting platform account (Railway, Render, Heroku, or similar)
- [ ] Domain for app (optional but recommended)

---

## Step 1: Set Up Production Database

### Option A: Railway (Recommended - Easy Setup)
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from the PostgreSQL service
4. Format: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### Option B: Supabase (Free Tier Available)
1. Go to [supabase.com](https://supabase.com) and create project
2. Go to Project Settings → Database
3. Copy the connection string (URI format)
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

### Option C: Heroku Postgres
1. Create Heroku app
2. Add Heroku Postgres add-on
3. Get `DATABASE_URL` from config vars
4. Format: `postgresql://user:password@ec2-xxx.compute-1.amazonaws.com:5432/database`

---

## Step 2: Configure Environment Variables

Create a `.env` file in your project root (or configure in your hosting platform):

```bash
# Production Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Shopify Configuration (from Partner Dashboard)
SHOPIFY_API_KEY="your_api_key"
SHOPIFY_API_SECRET="your_api_secret"
SCOPES="write_products"
```

**Important:** Never commit `.env` to git. It's already in `.gitignore`.

---

## Step 3: Run Database Migrations

### First Time Setup
```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Or if you prefer, push schema directly (no migration files)
npx prisma db push
```

### For Production Deployment
```bash
# Deploy migrations to production database
npx prisma migrate deploy
```

---

## Step 4: Choose Hosting Platform

### Option A: Railway (Recommended)
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

**Railway will:**
- Auto-detect Node.js app
- Run `npm install`
- Run `npm run setup` (if configured)
- Expose your app on a public URL

### Option B: Render
1. Connect GitHub repo to Render
2. Create new Web Service
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npm start`
5. Add environment variables in Render dashboard

### Option C: Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `heroku addons:create heroku-postgresql:mini`
4. `git push heroku main`
5. `heroku run npx prisma migrate deploy`

### Option D: Vercel/Netlify (Serverless)
**Note:** These require serverless-compatible database (like Supabase or PlanetScale)
- Vercel: Use Vercel Postgres or connect external DB
- Netlify: Use Netlify Functions with external DB

---

## Step 5: Update Shopify App Configuration

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Select your app
3. Go to Configuration → App URL
4. Update **App URL** to your production URL (e.g., `https://your-app.railway.app`)
5. Update **Allowed redirection URL(s)**:
   - `https://your-app.railway.app/api/auth`
   - `https://your-app.railway.app/api/auth/callback`

---

## Step 6: Deploy Theme Extension

```bash
# Build the theme extension
npm run build

# Deploy to Shopify
npm run deploy
```

This will:
- Build the belt-wizard web component
- Upload theme extension to Shopify
- Make it available to all stores with the app installed

---

## Step 7: Test Production Deployment

### Backend Health Check
1. Visit `https://your-app.railway.app/api/settings?shop=test.myshopify.com`
2. Should return JSON with default settings (or 400 if shop validation is strict)

### Admin UI
1. Install app in a test store
2. Navigate to Apps → Custom Belt Builder
3. Configure settings (background color, font, etc.)
4. Save and verify in database

### Storefront
1. Add belt-wizard block to theme
2. Open storefront in browser
3. Check browser console for:
   - `[Settings API] Fetching from: https://...`
   - `[Settings API] Response status: 200`
   - `[Settings API] Settings fetched: {...}`
4. Verify settings are applied (inspect CSS variables)

---

## Step 8: Monitor and Maintain

### Database Backups
- **Railway**: Automatic backups included
- **Supabase**: Automatic backups on paid plans
- **Heroku**: Configure Heroku Postgres backups

### Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Render
Check dashboard logs
```

### Database Migrations
When you update the schema:
```bash
# Create migration locally
npx prisma migrate dev --name your_migration_name

# Deploy to production
npx prisma migrate deploy
```

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check firewall/IP whitelist settings
- Ensure SSL mode is configured if required

### App Not Loading in Shopify Admin
- Verify App URL in Partner Dashboard
- Check redirect URLs are correct
- Ensure HTTPS is enabled

### Settings Not Loading on Storefront
- Check `/api/settings` endpoint is accessible
- Verify CORS headers are set
- Check browser console for errors
- Ensure shop parameter is being passed correctly

### Migration Errors
```bash
# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Force push schema (for development only)
npx prisma db push --force-reset
```

---

## Production Checklist

- [ ] PostgreSQL database provisioned
- [ ] `DATABASE_URL` environment variable set
- [ ] Prisma migrations deployed
- [ ] App backend deployed and accessible via HTTPS
- [ ] Shopify app URLs updated in Partner Dashboard
- [ ] Theme extension built and deployed
- [ ] Settings API endpoint tested
- [ ] Admin UI tested in production
- [ ] Storefront integration tested
- [ ] Database backups configured
- [ ] Monitoring/logging set up

---

## Cost Estimates (as of 2026)

### Free Tier Options
- **Supabase**: Free tier includes PostgreSQL (500MB)
- **Railway**: $5/month credit (enough for small apps)
- **Render**: Free tier available (with limitations)

### Paid Options
- **Railway**: ~$5-20/month (database + hosting)
- **Heroku**: ~$7-25/month (Eco dyno + mini Postgres)
- **Render**: ~$7-25/month (starter plan)

---

## Support

For issues:
1. Check Shopify app logs
2. Check hosting platform logs
3. Verify database connectivity
4. Review Prisma migration status
5. Test API endpoints directly

## Additional Resources
- [Shopify App Deployment](https://shopify.dev/docs/apps/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
