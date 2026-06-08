# Architecture Documentation

## System Overview

Roots of Araku is a production-ready e-commerce platform with a separated frontend and backend architecture designed for scalability, maintainability, and security.

```
Client (Browser)
      ↓
    React SPA
    (Vercel)
      ↓
   HTTPS API
      ↓
  Express.js
  (Railway/Render)
      ↓
 Supabase
(PostgreSQL)
```

---

## Design Principles

1. **Separation of Concerns**
   - Frontend: UI & User Experience
   - Backend: Business Logic & Data Access
   - Database: Data Persistence & Querying

2. **Security First**
   - JWT tokens for stateless authentication
   - Row Level Security (RLS) policies in database
   - Input validation on all endpoints
   - Rate limiting on API endpoints

3. **Scalability**
   - Horizontal scaling on both frontend & backend
   - Database connection pooling
   - CDN distribution for static assets
   - Efficient database queries with pagination

4. **Developer Experience**
   - Clear folder structure
   - Type-safe TypeScript throughout
   - Well-documented API
   - Easy local development setup

---

## Frontend Architecture

### Technology Stack
- **React 18**: UI framework
- **Vite**: Fast build tool & dev server
- **TypeScript**: Type safety
- **Zustand**: Lightweight state management
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations

### Key Components

#### Pages
- `pages/`: Customer-facing pages (Home, Products, Cart, etc.)
- `auth/`: Authentication pages (Login, Signup, Reset)
- `admin/`: Admin dashboard pages

#### Services
- `services/authService.ts`: JWT-based authentication
- `services/database.ts`: API wrapper for data operations

#### Config
- `config/api.ts`: HTTP client with auto token refresh
- `config/db.ts`: (deprecated, kept for reference)

#### Store
- `store/authStore.ts`: User authentication state
- `store/cartStore.ts`: Shopping cart state
- `store/wishlistStore.ts`: Wishlist state

### Data Flow

```
User Interaction
      ↓
  React Component
      ↓
  useAuthStore / useCartStore
      ↓
  authService / database.ts
      ↓
  apiClient (src/config/api.ts)
      ↓
  Backend API
      ↓
  Supabase
```

### Authentication Flow

```
User enters credentials
      ↓
Frontend POST /auth/login
      ↓
Backend verifies password
      ↓
Backend returns accessToken + refreshToken
      ↓
Frontend stores tokens in localStorage
      ↓
Future requests include Authorization header
      ↓
Backend validates JWT token
```

### Token Management

- **Access Token**: 15-minute validity
  - Contains: userId, email, role
  - Stored in: localStorage
  - Used in: Authorization header
  - Expires → Auto-refresh via refreshToken

- **Refresh Token**: 7-day validity
  - Used to obtain new access token
  - Stored in: localStorage (can be httpOnly in production)
  - Validated against database

---

## Backend Architecture

### Technology Stack
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Supabase**: Database & ORM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Express Rate Limit**: Rate limiting

### Project Structure

```
backend/src/
├── index.ts                 # Server entry point
├── app.ts                   # Express setup & middleware
├── routes/
│   ├── auth.ts             # Authentication endpoints
│   ├── products.ts         # Product CRUD
│   ├── orders.ts           # Order management
│   ├── users.ts            # User profile & addresses
│   └── admin.ts            # Admin-only endpoints
├── middleware/
│   ├── auth.ts             # JWT verification
│   ├── errorHandler.ts     # Error handling
│   └── logger.ts           # Request logging
├── config/
│   └── db.ts               # Supabase client
└── utils/
    └── validators.ts       # Input validation
```

### API Endpoints

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

#### Products (Public)
```
GET    /api/v1/products               # List with filters
GET    /api/v1/products/:id           # Single product
GET    /api/v1/products/featured/list # Featured products
```

#### Users (Protected)
```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/addresses
POST   /api/v1/users/addresses
PUT    /api/v1/users/addresses/:id
DELETE /api/v1/users/addresses/:id
```

#### Orders (Protected)
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/cancel
```

#### Admin (Protected + Admin Role)
```
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id
GET    /api/v1/admin/orders
PUT    /api/v1/admin/orders/:id
GET    /api/v1/admin/analytics/dashboard
```

### Middleware Pipeline

```
Request
  ↓
CORS Headers
  ↓
Body Parser
  ↓
Request Logger
  ↓
Rate Limiter
  ↓
Route Handler
  ↓
Authentication (if needed)
  ↓
Authorization (if needed)
  ↓
Business Logic
  ↓
Error Handling
  ↓
Response
```

### Error Handling

All errors follow standard JSON format:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Descriptive error message"
}
```

Handled error types:
- 400: Bad Request (validation failed)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate data)
- 500: Server Error (unexpected error)

---

## Database Architecture

### Technology: Supabase PostgreSQL

### Core Tables

#### users
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
name VARCHAR(255) NOT NULL
phone VARCHAR(20) NOT NULL
password_hash VARCHAR(255)
role ENUM('customer', 'admin') DEFAULT 'customer'
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### products
```sql
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
category VARCHAR(50) NOT NULL
weight VARCHAR(50) NOT NULL
mrp DECIMAL(10, 2) NOT NULL
selling_price DECIMAL(10, 2) NOT NULL
offer_price DECIMAL(10, 2) NOT NULL
description TEXT
benefits TEXT[]
images TEXT[]
emoji VARCHAR(10)
status ENUM('active', 'outofstock') DEFAULT 'active'
featured BOOLEAN DEFAULT false
stock_quantity INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### orders
```sql
id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
order_number VARCHAR(50) UNIQUE
total_amount DECIMAL(10, 2)
delivery_charge DECIMAL(10, 2) DEFAULT 0
status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
payment_method VARCHAR(50)
payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending'
address_snapshot JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### order_items
```sql
id UUID PRIMARY KEY
order_id UUID FOREIGN KEY
product_id UUID FOREIGN KEY
product_name VARCHAR(255)
weight VARCHAR(50)
quantity INTEGER
unit_price DECIMAL(10, 2)
total_price DECIMAL(10, 2)
created_at TIMESTAMP
```

#### addresses
```sql
id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
name VARCHAR(255)
phone VARCHAR(20)
address TEXT
city VARCHAR(100)
state VARCHAR(100)
pincode VARCHAR(10)
landmark VARCHAR(255)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### jwt_refresh_tokens
```sql
id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
token_hash VARCHAR(255) UNIQUE
ip_address VARCHAR(45)
user_agent TEXT
created_at TIMESTAMP
expires_at TIMESTAMP
revoked_at TIMESTAMP
```

### Security Features

#### Row Level Security (RLS)
- Users can only access their own data
- Admins have special privileges
- Policies enforce at database level

#### Indexes
- Fast lookups on frequently queried columns
- Example: user_id, order_id, email

#### Constraints
- UNIQUE constraints prevent duplicates
- FOREIGN KEY constraints maintain referential integrity
- NOT NULL constraints ensure data quality

---

## Deployment Architecture

### Frontend (Vercel)

```
GitHub Commit
      ↓
Vercel Webhook
      ↓
npm run build
      ↓
npm run type check
      ↓
Deploy to CDN
      ↓
Available at rootsofaraku.com
```

### Backend (Railway)

```
GitHub Commit
      ↓
Railway Webhook
      ↓
npm install
      ↓
npm run build
      ↓
npm start
      ↓
Running on railway.app
```

### Database (Supabase)

- Managed PostgreSQL
- Automatic backups
- Row Level Security
- Real-time subscriptions (optional)

---

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS minification
- JS minification & tree-shaking
- Bundle size: < 500KB (gzipped)

### Backend
- Connection pooling for database
- Request caching with Redis (optional)
- Pagination for large datasets (default: 20 items)
- Rate limiting: 100 requests/15 minutes
- Database indexes on foreign keys

### Database
- Pagination to limit result sets
- Indexes on frequently queried columns
- Automatic vacuum & analyze
- Connection pooling via Supabase

---

## Security Architecture

### Authentication & Authorization

```
Login Request
      ↓
Verify email/password
      ↓
Issue JWT Token (15 min)
      ↓
Issue Refresh Token (7 days)
      ↓
Client stores both tokens
      ↓
Every API request includes JWT
      ↓
Backend validates JWT
      ↓
Check user role/permissions
      ↓
Allow/Deny request
```

### Password Security
- Hashed with bcrypt (salt rounds: 12)
- Never stored in plain text
- Reset via email link (time-limited)

### API Security
- HTTPS only in production
- CORS configured for specific origins
- Rate limiting prevents brute force
- Input validation on all endpoints
- SQL injection prevented via Supabase parameterized queries

### Database Security
- RLS policies enforce access control
- Secrets stored in environment variables
- Service role key not exposed to frontend
- Regular backups & monitoring

---

## Monitoring & Logging

### Frontend
- Vercel Analytics Dashboard
- Browser error reporting
- Performance metrics

### Backend
- Railway Logs Dashboard
- Request/error logging
- Database query monitoring

### Database
- Supabase Health Dashboard
- Slow query logging
- Connection monitoring
- Backup verification

---

## Scalability Considerations

### When Traffic Increases

1. **Frontend**
   - Vercel automatically scales
   - No action needed

2. **Backend**
   - Monitor Railway CPU/Memory
   - Upgrade plan to increase resources
   - Enable horizontal scaling (multiple replicas)

3. **Database**
   - Monitor connection count
   - Enable connection pooling
   - Upgrade PostgreSQL plan
   - Archive old data

### Caching Strategy

- **Frontend**: Browser cache (via Vercel headers)
- **Backend**: In-memory cache for frequent queries (optional)
- **Database**: Connection pooling

---

## Future Enhancements

1. **Microservices**
   - Separate payment service
   - Email notification service
   - Analytics service

2. **Real-time Features**
   - Live order updates
   - Inventory sync
   - Chat support

3. **Advanced Features**
   - Recommendation engine
   - A/B testing framework
   - Advanced analytics

---

## Technology Decision Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | React + Vite | Fast, popular, great DX |
| Backend | Express.js | Lightweight, flexible, good ecosystem |
| Database | Supabase | Managed PostgreSQL, RLS, free tier |
| Hosting | Vercel + Railway | Free tier, auto-scaling, simple setup |
| Auth | JWT | Stateless, scales horizontally |
| Styling | Tailwind CSS | Utility-first, responsive, fast |
| State | Zustand | Lightweight, simple API |

---

## Conclusion

This architecture provides:
- ✅ Scalable independent services
- ✅ Type-safe development
- ✅ Production-ready security
- ✅ Easy to understand and maintain
- ✅ Cost-effective (free/low-cost services)
- ✅ One-click deployment

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`
