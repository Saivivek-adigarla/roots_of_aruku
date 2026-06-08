# Complete Deployment Guide - Roots of Araku

## Overview

This guide walks you through deploying the Roots of Araku e-commerce platform from development to production. The architecture consists of:

- **Frontend**: React + Vite on Vercel
- **Backend**: Express.js on Railway or Render
- **Database**: Supabase PostgreSQL
- **Domain**: GoDaddy DNS

---

## Prerequisites

Before starting, you need:

1. **GitHub Account** - For version control
2. **Vercel Account** - For frontend hosting
3. **Railway/Render Account** - For backend hosting
4. **Supabase Account** - For database
5. **GoDaddy Account** - For domain DNS management
6. **Node.js 18+** - Installed locally
7. **Git** - Installed locally
8. **Your Custom Domain** - Already purchased on GoDaddy

---

## Architecture Diagram

```
┌─────────────────┐
│   GoDaddy DNS   │ (Points to both frontend & backend)
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────┐
│ Vercel  │  │ Railway/ │
│Frontend │  │ Render   │
│ React   │  │ Backend  │
└────┬────┘  └────┬─────┘
     │            │
     └────┬───────┘
          │
          ▼
    ┌──────────────┐
    │  Supabase    │
    │  PostgreSQL  │
    └──────────────┘
```

---

## Phase 1: Local Development Setup

### 1.1 Clone Repository

```bash
git clone https://github.com/yourusername/roots-of-araku.git
cd roots-of-araku
```

### 1.2 Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

**Required .env variables:**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=your-secret-key
```

### 1.3 Setup Frontend

```bash
cd ../
# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Required .env.local variables:**
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=xxx
```

### 1.4 Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should show: ✓ Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should show: Local: http://localhost:5173
```

### 1.5 Test Locally

1. Go to http://localhost:5173
2. Click "Sign Up"
3. Create a test account
4. Verify you can login/logout

---

## Phase 2: Prepare for Deployment

### 2.1 Update API URLs

Edit `frontend/.env.production`:
```
VITE_API_BASE_URL=https://api.rootsofaraku.com/api/v1
```

(You'll update this after deploying backend)

### 2.2 Setup GitHub Repository

```bash
git add .
git commit -m "Initial commit: deployment-ready architecture"
git push origin main
```

---

## Phase 3: Deploy Backend (Railway Recommended)

### 3.1 Create Railway Account
1. Go to https://railway.app
2. Sign in with GitHub
3. Create new project

### 3.2 Connect Database

1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Create PostgreSQL instance
4. Copy the DATABASE_URL from Railway

### 3.3 Deploy Backend Service

1. Click "New" → "GitHub Repo"
2. Select `roots-of-araku` repository
3. Set root directory to `backend`
4. Add environment variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<from Railway Postgres>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
JWT_SECRET=<generate-random-string>
JWT_REFRESH_SECRET=<generate-random-string>
FRONTEND_URL_PROD=https://rootsofaraku.com
```

5. Deploy
6. Railway gives you a public URL: `https://xxx-railway.app`

### 3.4 Test Backend in Production

```bash
curl https://xxx-railway.app/api/v1/
# Should return API info
```

---

## Phase 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign in with GitHub
3. Create new project

### 4.2 Import Repository

1. Click "New Project"
2. Select `roots-of-araku` repository
3. Set root directory to `.` (root)
4. Framework: React + Vite

### 4.3 Configure Environment Variables

Add these in Vercel Settings → Environment Variables:

```
VITE_API_BASE_URL=https://xxx-railway.app/api/v1
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 4.4 Deploy

1. Click "Deploy"
2. Vercel gives you a URL: `https://roots-of-araku.vercel.app`
3. Test the deployment by visiting the URL

---

## Phase 5: Connect Custom Domain (GoDaddy)

### 5.1 Add Domain to Vercel

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add `rootsofaraku.com`
4. Vercel will show you nameservers to add

### 5.2 Update GoDaddy DNS

1. Log in to GoDaddy
2. Go to Domain Management
3. Click your domain
4. Go to "DNS" section
5. Change nameservers to Vercel's:
   - `ns1.vercel.app`
   - `ns2.vercel.app`
   - `ns3.vercel.app`
   - `ns4.vercel.app`

### 5.3 Setup API Domain (Optional but Recommended)

For better branding, deploy backend to `api.rootsofaraku.com`:

1. **Option A: Railway Custom Domain**
   - In Railway: Add custom domain `api.rootsofaraku.com`
   - Create CNAME record in GoDaddy pointing to Railway URL

2. **Option B: Use Railway Default URL**
   - Keep using `https://xxx-railway.app/api/v1`

### 5.4 Verify Domain

```bash
# Test frontend
curl https://rootsofaraku.com/

# Test backend (if custom domain set)
curl https://api.rootsofaraku.com/api/v1/
```

---

## Phase 6: Configure SSL/HTTPS

Both Vercel and Railway automatically provide SSL certificates. No additional setup needed.

**Verify HTTPS:**
- https://rootsofaraku.com should show green lock
- https://api.rootsofaraku.com should show green lock

---

## Phase 7: Setup Monitoring & Logs

### Backend Logs (Railway)

1. Go to Railway dashboard
2. Select your backend project
3. Click "Logs" tab
4. See real-time logs

### Frontend Logs (Vercel)

1. Go to Vercel dashboard
2. Click your project
3. Go to "Analytics" tab
4. View request logs

---

## Phase 8: Database Backups

### Automatic Backups (Supabase)

1. Go to Supabase dashboard
2. Select your project
3. Go to "Backups"
4. Enable automatic daily backups

### Manual Backup

```bash
# Export database
pg_dump postgresql://user:pass@host/db > backup.sql

# To restore
psql postgresql://user:pass@host/db < backup.sql
```

---

## Phase 9: Post-Deployment Checklist

- [ ] Frontend accessible at https://rootsofaraku.com
- [ ] Backend accessible at https://api.rootsofaraku.com
- [ ] SSL/HTTPS working (green lock)
- [ ] Registration works
- [ ] Login works
- [ ] View products works
- [ ] Create order works
- [ ] Admin panel accessible
- [ ] Database backups enabled
- [ ] Error logs monitored
- [ ] Email notifications configured

---

## Environment Variables Reference

### Frontend (Vercel .env)

```
# API Configuration
VITE_API_BASE_URL=https://api.rootsofaraku.com/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (Railway .env)

```
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Domain
FRONTEND_URL_PROD=https://rootsofaraku.com

# Third-party services
GOOGLE_CLIENT_ID=xxx
RAZORPAY_KEY_ID=xxx
```

---

## Troubleshooting

### Frontend Won't Connect to Backend
1. Check `VITE_API_BASE_URL` in Vercel env
2. Verify backend is running: `curl https://api.xxx.railway.app/api/v1/`
3. Check CORS settings in `backend/src/app.ts`

### Backend Crashes on Startup
1. Check Railway logs
2. Verify DATABASE_URL is correct
3. Ensure JWT_SECRET is set

### Domain Not Resolving
1. Wait 24-48 hours for DNS propagation
2. Clear browser cache
3. Use: `nslookup rootsofaraku.com`

### SSL Certificate Issues
1. Vercel/Railway handle SSL automatically
2. If issues persist, clear browser cache and try again

---

## Scaling & Maintenance

### When to Scale

**Frontend (Vercel):**
- Vercel auto-scales - no action needed
- Monitor Analytics tab for traffic spikes

**Backend (Railway):**
- Monitor CPU/Memory in Railway dashboard
- Upgrade plan if consistently >80% usage

**Database (Supabase):**
- Monitor "Database Health" in Supabase dashboard
- Upgrade if connection pool exhausted

### Regular Maintenance

**Weekly:**
- Check error logs
- Verify backups completed

**Monthly:**
- Review analytics
- Check for security updates
- Update dependencies

**Quarterly:**
- Review scaling needs
- Optimize database queries
- Check cost optimization

---

## Security Best Practices

1. **Keep Secrets Secure**
   - Never commit `.env` files
   - Rotate JWT secrets monthly
   - Use strong random strings

2. **Enable HTTPS Everywhere**
   - Both Vercel and Railway auto-enable
   - Redirect HTTP to HTTPS

3. **Database Security**
   - Use Row Level Security (RLS) policies
   - Limit API keys scope
   - Regular backups

4. **API Security**
   - Rate limiting enabled
   - Input validation on all endpoints
   - JWT token verification

5. **Monitoring**
   - Setup error alerts
   - Monitor failed login attempts
   - Review admin audit logs

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com

---

## Next Steps

1. Follow Phase 1-5 in order
2. Test each phase before moving to next
3. Keep monitoring dashboard after deployment
4. Setup alerts and error monitoring
5. Plan regular backups and maintenance

---

**Last Updated**: June 8, 2026
**Version**: 1.0.0
