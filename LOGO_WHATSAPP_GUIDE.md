# Logo & WhatsApp Integration Guide

## What's Been Added

### 1. **Animated Logo Component** (`src/components/Logo.tsx`)

A reusable, professional logo component with multiple size options and animations.

**Features:**
- 4 size options: `sm`, `md`, `lg`, `xl`
- Animated bounce effect on splash screen and auth pages
- Text toggle to show/hide brand name
- Smooth hover effects
- Uses Leaf icon from lucide-react in gold color

**Usage:**
```tsx
import Logo from '../components/Logo';

// Basic usage
<Logo size="md" animated={false} showText={true} />

// With animation (splash screen)
<Logo size="xl" animated={true} showText={true} />

// Icon only (navbar)
<Logo size="sm" animated={false} showText={false} />
```

### 2. **Locations Updated with Logo**

The animated logo is now integrated in:

#### **Navbar** (`src/components/Navbar.tsx`)
- Small logo icon next to "Roots of Araku" text
- Static (no animation) for smooth performance

#### **Footer** (`src/components/Footer.tsx`)
- Medium logo with text in brand section
- Professional branding at footer top

#### **Splash Screen** (`src/components/SplashScreen.tsx`)
- Large animated logo with bounce effect
- Shows for 1 second on app load
- Uses sessionStorage to prevent flash on reload

#### **Home Page** (`src/pages/Home.tsx`)
- Large animated logo in hero section
- Bouncing effect with smooth transitions
- Above main heading

#### **Auth Pages** (Login, Signup, ForgotPassword)
- **Desktop (lg screens)**: Large animated logo with full branding text
- **Mobile**: Medium logo with text
- Consistent branding across all auth flows

#### **Admin Pages** (AdminLogin, AdminApp)
- Logo in admin login header
- Admin identifier in sidebar

### 3. **WhatsApp Integration** (Already Active)

Located in `src/utils/whatsapp.ts` - fully functional WhatsApp integration.

**Fixed WhatsApp Number:** `+91 7036252018`

**Features:**
- Quick contact via WhatsApp button in chat widget
- Order confirmation messages
- Pre-formatted messages with order details
- Direct wa.me links for instant messaging

**How It Works:**

```typescript
import { openWhatsApp, buildOrderMessage } from '../utils/whatsapp';

// Simple message
openWhatsApp('Hi, I need help!');

// Order confirmation
const message = buildOrderMessage(
  'ORD-12345',
  [{name: 'Coffee', weight: '100g', qty: 1, price: 299}],
  299,
  {name: 'John', address: '...', city: 'Bangalore', pincode: '560001', phone: '9876543210'}
);
openWhatsApp(message);
```

**Integration Points:**
- **Chat Widget** (`src/components/ChatWidget.tsx`): Has "WhatsApp" button for support
- **Checkout** (`src/pages/Checkout.tsx`): Order confirmation via WhatsApp
- **OrderSuccess** (`src/pages/OrderSuccess.tsx`): Share order confirmation

### 4. **Chat Widget with WhatsApp Support** (`src/components/ChatWidget.tsx`)

- AI chatbot with knowledge base (understands Telugu & English)
- "Call" and "WhatsApp" support buttons for complex queries
- Fixed to bottom-right corner of screen
- Smart fallback to local knowledge base

## Design Features

### Logo Animation Properties
- **Bounce**: Continuous vertical bounce (2s cycle)
- **Hover**: Upward movement on hover
- **Entry**: Smooth fade-in and scale animation
- **Color**: Gold (#F59E0B) for visibility and brand consistency

### Color Scheme Integration
- **Maroon-700**: Primary brand color (backgrounds, buttons)
- **Gold-400**: Accent color (logo, highlights)
- **Text**: White and warm tones for contrast

## How to Customize

### Change WhatsApp Number
Edit `src/utils/whatsapp.ts`:
```typescript
const WA_NUMBER = '917036252018'; // Change this
```

### Customize Logo Animation
Edit `src/components/Logo.tsx` - modify `iconVariants`:
```typescript
const iconVariants = {
  bounce: animated ? {
    y: [0, -8, 0], // Change bounce height
    transition: { duration: 2, repeat: Infinity } // Change duration
  } : {},
};
```

### Adjust Logo Sizes
Edit `src/components/Logo.tsx` - modify `sizeMap`:
```typescript
const sizeMap = {
  sm: { icon: 20, text: 'text-sm' },    // Mobile navbar
  md: { icon: 32, text: 'text-base' },  // Footer
  lg: { icon: 48, text: 'text-lg' },    // Auth pages
  xl: { icon: 64, text: 'text-2xl' },   // Splash, hero
};
```

## Testing

### Local Development
```bash
npm run dev
```

**Test Points:**
1. **Splash Screen**: Load app - should see animated logo for 1 second
2. **Navbar**: Check logo appears in top-left
3. **Footer**: Scroll down - logo in footer brand section
4. **Home Page**: Hero section has large bouncing logo
5. **Auth Pages**: Login/Signup show animated logos
6. **Chat Widget**: Bottom-right corner has chat button with WhatsApp option

### WhatsApp Integration
1. Click chat widget → "WhatsApp" button
2. Should open WhatsApp web with pre-filled message
3. Message includes your inquiry text

## Files Modified

1. `src/components/Logo.tsx` (NEW)
2. `src/components/Navbar.tsx`
3. `src/components/Footer.tsx`
4. `src/components/SplashScreen.tsx`
5. `src/pages/Home.tsx`
6. `src/auth/Login.tsx`
7. `src/auth/Signup.tsx`
8. `src/auth/ForgotPassword.tsx`
9. `src/admin/AdminLogin.tsx`
10. `src/admin/AdminApp.tsx`

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ WhatsApp Web & App

## Performance

- Logo component is lightweight (uses lucide-react icon)
- Animations use GPU-accelerated transitions
- No external image dependencies
- Build size remains optimized

## Notes

- Logo uses Leaf emoji/icon for universal compatibility
- If you have a custom logo image, replace Leaf icon with `<img />` element
- WhatsApp link works on desktop (opens web.whatsapp.com) and mobile (opens app)
- Chat widget AI supports both English and Telugu language queries
