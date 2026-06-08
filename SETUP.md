# Local Development Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18 or higher
- Git
- PostgreSQL (or Supabase free tier)

### 1. Clone & Install

```bash
git clone <your-repo>
cd roots-of-araku
npm install
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roots_araku
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret
```

### 3. Setup Frontend

```bash
cd ../
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit http://localhost:5173

---

## Detailed Setup Instructions

### A. Database Setup

#### Option 1: Use Supabase (Recommended)

1. Go to https://supabase.com
2. Create a free project
3. Copy these from Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Paste in `backend/.env`
5. Supabase automatically creates tables from migrations

#### Option 2: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
```bash
createdb roots_araku
```

3. Set DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roots_araku
```

4. Tables are auto-created on first API call

### B. Authentication Setup

#### Email/Password Auth
- Automatically works
- Create account at http://localhost:5173/signup
- Login at http://localhost:5173/login

#### Google OAuth (Optional)

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect: `http://localhost:5173/auth/callback`
4. Copy `GOOGLE_CLIENT_ID` to `.env.local`

### C. Environment Variables Explained

**Frontend (.env.local):**
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:3000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth | `xxx.apps.googleusercontent.com` |

**Backend (.env):**
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host/db` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Database access key | (from Supabase dashboard) |
| `JWT_SECRET` | Sign JWT tokens | (auto-generated, min 32 chars) |
| `JWT_REFRESH_SECRET` | Sign refresh tokens | (auto-generated, min 32 chars) |

---

## Project Structure

```
roots-of-araku/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── app.ts             # Express app setup
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── products.ts    # Products CRUD
│   │   │   ├── orders.ts      # Orders CRUD
│   │   │   └── admin.ts       # Admin endpoints
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT verification
│   │   │   ├── errorHandler.ts
│   │   │   └── logger.ts
│   │   ├── config/            # Configuration
│   │   │   └── db.ts          # Supabase client
│   │   └── utils/
│   │       └── validators.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── src/                        # React Frontend
│   ├── pages/                 # Page components
│   ├── components/            # Reusable components
│   ├── auth/                  # Auth pages
│   ├── admin/                 # Admin pages
│   ├── services/
│   │   ├── authService.ts     # JWT auth
│   │   └── database.ts        # API wrapper
│   ├── config/
│   │   └── api.ts             # API client
│   ├── store/                 # Zustand stores
│   ├── utils/                 # Utilities
│   └── App.tsx
│
├── public/                     # Static assets
├── DEPLOYMENT_GUIDE.md         # Production deployment
├── SETUP.md                    # This file
├── vercel.json                 # Vercel config
└── package.json
```

---

## Common Commands

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Backend
```bash
# Start dev server
npm run dev

# Build TypeScript
npm run build

# Start production
npm start

# Run tests
npm test
```

---

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Products (with Auth)
```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Troubleshooting

### Backend won't start
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix**: Make sure PostgreSQL/Supabase is running and DATABASE_URL is correct

### Frontend API calls fail
```
Error: Failed to fetch from http://localhost:3000/api/v1
```
**Fix**: 
- Check if backend is running
- Verify VITE_API_BASE_URL in .env.local
- Check browser console for CORS errors

### JWT Token invalid
```
Error: Invalid token
```
**Fix**: 
- Tokens expire after 15 minutes
- Ensure JWT_SECRET matches between frontend & backend
- Clear localStorage and login again

### Database connection fails
```
Error: Unexpected token < in JSON at position 0
```
**Fix**: DATABASE_URL format is incorrect. Should be:
```
postgresql://user:password@host:5432/database
```

---

## Database Management

### View Supabase Tables
1. Go to https://supabase.com
2. Select your project
3. Click "SQL Editor"
4. Tables: users, products, orders, addresses, etc.

### Reset Database
```bash
# Delete all data (production backup first!)
supabase db reset
```

### Backup Database
```bash
# Export data
pg_dump $DATABASE_URL > backup.sql

# Restore data
psql $DATABASE_URL < backup.sql
```

---

## Performance Tips

1. **Frontend**
   - Use React DevTools Profiler
   - Check bundle size: `npm run build`
   - Enable code splitting with lazy() import

2. **Backend**
   - Enable request logging in development
   - Use pagination for large datasets
   - Add database indexes for frequent queries

3. **Database**
   - Monitor slow queries in Supabase
   - Use connection pooling
   - Regular vacuum/analyze

---

## Security in Development

⚠️ **These are for development only:**
- Store real secrets in `.env` files (NOT in code)
- Enable HTTPS in production
- Rotate JWT secrets monthly
- Use strong passwords for test accounts

---

## Next Steps

1. Complete this setup
2. Read DEPLOYMENT_GUIDE.md for production deployment
3. Check backend/README.md for API documentation
4. Review project guidelines in ARCHITECTURE.md

---

## Getting Help

1. Check error logs: `npm run dev` (check console)
2. Review API responses in Network tab (DevTools)
3. Check Supabase logs in dashboard
4. Review middleware in backend/src/middleware/

---

**Happy coding!**
