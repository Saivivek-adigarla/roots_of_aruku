# Roots of Araku

Premium organic ecommerce platform specializing in tribal coffee, wild turmeric, and golden honey from Araku Valley, Andhra Pradesh, India.

## Project Overview

Roots of Araku is a full-featured ecommerce application built with modern web technologies, designed to connect tribal farmers directly with customers. The platform showcases authentic, organic products from the Araku Valley with an intuitive shopping experience and comprehensive admin management tools.

**Live Features:**
- Fully responsive design (mobile-first)
- Real-time cart management with Zustand
- Multi-step checkout process
- Advanced product filtering and search
- Admin dashboard for inventory management
- Order tracking with timeline visualization
- AI-powered customer support chat (Claude API)
- WhatsApp integration for order confirmation
- Secure authentication (Firebase)

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand (cart, wishlist, auth)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Fetch API

### Backend & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email/Password, Phone OTP, Google Sign-In)
- **File Storage:** Firebase Cloud Storage
- **Payments:** Razorpay (UPI, Cards, Net Banking, COD)
- **AI Chat:** Claude API (via Supabase Edge Functions)
- **Hosting:** Vercel (frontend), Firebase (backend)

### Infrastructure
- **Edge Functions:** Supabase (Claude API integration)
- **Environment:** Node.js 18+, npm/yarn

## Project Structure

```
src/
├── admin/                  # Admin panel pages
│   ├── AdminApp.tsx       # Admin dashboard router
│   ├── AdminLogin.tsx     # Admin authentication
│   ├── Dashboard.tsx      # Stats & overview
│   ├── ProductList.tsx    # Product management table
│   ├── ProductForm.tsx    # Add/edit products
│   ├── OrderList.tsx      # Order management
│   └── ...                # Additional admin features
├── auth/                   # Authentication pages
│   ├── Login.tsx          # Login/OTP flow
│   ├── Signup.tsx         # Registration flow
│   └── ForgotPassword.tsx # Password recovery
├── pages/                  # Customer-facing pages
│   ├── Home.tsx           # Hero + featured products
│   ├── Products.tsx       # Product listing with filters
│   ├── ProductDetail.tsx  # Product detail view
│   ├── Cart.tsx           # Shopping cart
│   ├── Checkout.tsx       # Multi-step checkout
│   ├── Profile.tsx        # User profile
│   ├── MyOrders.tsx       # Order history
│   └── ...                # Additional pages
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Sticky header
│   ├── Footer.tsx         # Footer with links
│   ├── ProductCard.tsx    # Product card component
│   ├── ChatWidget.tsx     # AI chat interface
│   └── ...                # Helper components
├── store/                  # State management
│   ├── authStore.ts       # User authentication state
│   ├── cartStore.ts       # Shopping cart state
│   └── wishlistStore.ts   # Wishlist state
├── utils/                  # Utility functions
│   ├── helpers.ts         # Constants & helpers
│   ├── whatsapp.ts        # WhatsApp integration
│   └── razorpay.ts        # Payment gateway
├── data/                   # Static data
│   ├── products.ts        # Product definitions
│   └── seedProducts.ts    # Database seed
├── firebase/              # Firebase configuration
│   └── config.ts          # Firebase setup
└── App.tsx                # Root component
```

## Key Features

### Customer Experience
- **Hero Banner:** Auto-rotating campaigns with call-to-action
- **Smart Search:** Real-time product search with filters
- **Product Filtering:** By category, price range, weight, stock status
- **Shopping Cart:** Persistent state with quantity controls
- **Wishlist:** Save favorite products for later
- **Multi-Step Checkout:** Address selection, payment options, order summary
- **Order Tracking:** Visual timeline of order status
- **Product Reviews:** Rate and review purchases

### Admin Dashboard
- **Inventory Management:** Add, edit, delete products with bulk image uploads
- **Order Management:** Track orders, update status, manage fulfillment
- **Customer Analytics:** View customer profiles and order history
- **Sales Metrics:** Revenue tracking, order statistics
- **Marketing Tools:** Banner management, promotional offers, discount scheduling

### Authentication
- **Mobile OTP Login:** Firebase Phone Authentication
- **Email/Password:** Secure credential-based auth
- **Google Sign-In:** Third-party authentication
- **Role-Based Access:** Admin vs. customer views
- **Session Persistence:** Auto-login on return visit

### Payment Integration
- **Razorpay Gateway:** Multiple payment methods
  - UPI (PhonePe, Google Pay, Paytm)
  - Credit/Debit Cards
  - Net Banking
  - Cash on Delivery (COD)
- **WhatsApp Orders:** Direct messaging for purchase confirmation

### AI & Automation
- **Claude AI Chat:** Intelligent product recommendations and customer support
- **WhatsApp Notifications:** Order confirmation and updates
- **Auto-Seed:** Initial product data on first load

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Firestore enabled
- Razorpay merchant account (optional, for payments)
- Anthropic API key (optional, for AI chat)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd roots-of-araku
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=rootsofaraku
   VITE_FIREBASE_STORAGE_BUCKET=rootsofaraku.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   VITE_CLAUDE_API_KEY=your_claude_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_ADMIN_EMAIL=pickurstay@gmail.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Configuration

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database, Authentication, and Storage
3. Copy your project credentials to `.env`

### Razorpay Integration
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your Key ID from Dashboard → Settings → API Keys
3. Add `VITE_RAZORPAY_KEY_ID` to `.env`

### Claude API Setup (AI Chat)
1. Generate an API key at [console.anthropic.com](https://console.anthropic.com)
2. Add `VITE_CLAUDE_API_KEY` to `.env`

## Admin Credentials

| Field | Value |
|-------|-------|
| Email | pickurstay@gmail.com |
| Password | SANTOSHKUMAR |
| Admin URL | `/admin` |
| Phone Reset | +91 7036252018 |

## Database Schema

### Key Collections
- **products** - Product inventory with pricing and images
- **orders** - Customer orders with status tracking
- **users** - Customer profiles and authentication
- **users/{userId}/addresses** - Saved delivery addresses
- **users/{userId}/wishlist** - Favorite products
- **reviews** - Product ratings and reviews
- **banners** - Marketing banners and campaigns
- **settings** - Store configuration and API keys

## Design & Branding

| Element | Value |
|---------|-------|
| Primary Color | #6B1A1A (Deep Maroon) |
| Accent Color | #F5C04A (Golden Yellow) |
| Background | #FFF8F0 (Warm White) |
| Typography | Poppins (Google Fonts) |
| Logo | Leaf icon from Lucide React |

## Performance Metrics

- **Bundle Size:** ~214KB (gzipped)
- **Page Load:** < 2s on 4G
- **Mobile Responsive:** Optimized for all devices
- **Accessibility:** WCAG 2.1 compliant

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Development Workflow

### Running Tests
```bash
npm run lint      # ESLint
npm run typecheck # TypeScript
```

### Building
```bash
npm run build     # Production build
npm run preview   # Preview production build
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy ./dist to Vercel
```

### Backend (Firebase)
- Firestore and Authentication auto-deploy
- Edge Functions via Supabase

## Security

- **RLS Policies:** Row-level security on Firestore collections
- **Authentication:** Firebase handles user verification
- **Payment PCI:** Razorpay handles all payment security
- **API Keys:** Sensitive keys stored in environment variables
- **HTTPS:** All connections encrypted in transit

## Roadmap

- [ ] Email order notifications
- [ ] Advanced analytics dashboard
- [ ] Inventory alerts system
- [ ] Customer loyalty program
- [ ] Multi-language support
- [ ] PWA functionality

## Support & Contact

- **Phone:** +91 7036252018
- **WhatsApp:** +91 7036252018
- **Instagram:** [@rootsofaraku](https://instagram.com/rootsofaraku)
- **Email:** pickurstay@gmail.com

## License

Private project for Roots of Araku. All rights reserved.

---

**Built with ❤️ from Araku Valley**
