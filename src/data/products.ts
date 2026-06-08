import type { Product } from '../types';

// Verified Pexels image URLs - curated for premium luxury e-commerce look
// Format: product shot (white/clean bg) + lifestyle shot (natural environment)

const COFFEE = {
  // Tribal Reserve - rich dark roast, tribal origin story
  tribal: {
    product: 'https://images.pexels.com/photos/26117179/pexels-photo-26117179.jpeg?w=600',
    lifestyle: 'https://images.pexels.com/photos/28495599/pexels-photo-28495599.jpeg?w=600',
    beans: 'https://images.pexels.com/photos/33015766/pexels-photo-33015766.jpeg?w=600',
  },
  // Estate Blend - smooth plantation coffee
  estate: {
    product: 'https://images.pexels.com/photos/17077385/pexels-photo-17077385.jpeg?w=600',
    lifestyle: 'https://images.pexels.com/photos/9329115/pexels-photo-9329115.jpeg?w=600',
    beans: 'https://images.pexels.com/photos/29527487/pexels-photo-29527487.jpeg?w=600',
  },
  // Valley Drip - pour over brewing style
  drip: {
    product: 'https://images.pexels.com/photos/11504124/pexels-photo-11504124.jpeg?w=600',
    lifestyle: 'https://images.pexels.com/photos/10917525/pexels-photo-10917525.jpeg?w=600',
    brewed: 'https://images.pexels.com/photos/29323229/pexels-photo-29323229.jpeg?w=600',
  },
  // Mountain Roast - whole beans, mountain origin
  mountain: {
    product: 'https://images.pexels.com/photos/14050911/pexels-photo-14050911.jpeg?w=600',
    lifestyle: 'https://images.pexels.com/photos/14751086/pexels-photo-14751086.jpeg?w=600',
    beans: 'https://images.pexels.com/photos/30737408/pexels-photo-30737408.jpeg?w=600',
  },
};

const TURMERIC = {
  product: 'https://images.pexels.com/photos/8760466/pexels-photo-8760466.jpeg?w=600',
  lifestyle: 'https://images.pexels.com/photos/7771976/pexels-photo-7771976.jpeg?w=600',
  powder: 'https://images.pexels.com/photos/17380335/pexels-photo-17380335.jpeg?w=600',
};

const HONEY = {
  jar: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?w=600',
  dripping: 'https://images.pexels.com/photos/533936/pexels-photo-533936.jpeg?w=600',
  honeycomb: 'https://images.pexels.com/photos/1584866/pexels-photo-1584866.jpeg?w=600',
};

export const SEED_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  // ═══════════════════════════════════════════
  // COFFEE COLLECTION
  // ═══════════════════════════════════════════

  // Tribal Reserve Coffee - Premium tribal origin
  {
    name: 'Tribal Reserve Coffee',
    weight: '50g',
    category: 'coffee',
    mrp: 299,
    sellingPrice: 229,
    offerPrice: 199,
    emoji: '☕',
    description: 'Premium organic coffee from Araku Valley tribal farms. Grown under natural shade at 900-1200m elevation, hand-picked and sun-dried for a rich, smooth flavor profile with hints of dark chocolate and wild berries.',
    benefits: ['100% Organic', 'Tribal Sourced', 'Shade Grown', 'Hand Picked', 'Sun Dried'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.tribal.product, COFFEE.tribal.lifestyle, COFFEE.tribal.beans],
  },
  {
    name: 'Tribal Reserve Coffee',
    weight: '100g',
    category: 'coffee',
    mrp: 599,
    sellingPrice: 449,
    offerPrice: 399,
    emoji: '☕',
    description: 'Our flagship tribal reserve coffee in a generous 100g pack. Deep aroma with notes of dark chocolate and wild berries, sourced directly from tribal communities of Araku Valley.',
    benefits: ['100% Organic', 'Tribal Sourced', 'Dark Chocolate Notes', 'Single Origin', 'Direct Trade'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.tribal.lifestyle, COFFEE.tribal.product, COFFEE.tribal.beans],
  },

  // Estate Blend Coffee - Smooth plantation blend
  {
    name: 'Estate Blend Coffee',
    weight: '50g',
    category: 'coffee',
    mrp: 249,
    sellingPrice: 199,
    offerPrice: 179,
    emoji: '☕',
    description: 'Smooth and aromatic blend from the finest estates of Araku Valley. A balanced cup with mild acidity and a clean finish, perfect for everyday brewing.',
    benefits: ['100% Organic', 'Single Origin', 'Smooth Blend', 'No Pesticides', 'Award Winning'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.estate.product, COFFEE.estate.lifestyle, COFFEE.estate.beans],
  },
  {
    name: 'Estate Blend Coffee',
    weight: '100g',
    category: 'coffee',
    mrp: 499,
    sellingPrice: 399,
    offerPrice: 349,
    emoji: '☕',
    description: 'Our signature estate blend in a full 100g pack. Crafted from carefully selected beans grown on the misty slopes of Araku Valley.',
    benefits: ['100% Organic', 'Single Origin', 'Rich Aroma', 'No Pesticides', 'Direct from Farm'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.estate.lifestyle, COFFEE.estate.product, COFFEE.estate.beans],
  },

  // Valley Drip Coffee - Pour over / drip brewing
  {
    name: 'Valley Drip Coffee',
    weight: '200g',
    category: 'coffee',
    mrp: 449,
    sellingPrice: 349,
    offerPrice: 299,
    emoji: '☕',
    description: 'Specially ground for drip brewing, this medium-roast coffee delivers a clean, bright cup with floral undertones. Inspired by the misty mornings of Araku Valley.',
    benefits: ['100% Organic', 'Drip Ground', 'Floral Notes', 'Medium Roast', 'Valley Sourced'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.drip.product, COFFEE.drip.lifestyle, COFFEE.drip.brewed],
  },

  // Valley Drip Pure Coffee - Specialty single-estate
  {
    name: 'Valley Drip Pure Coffee',
    weight: '200g',
    category: 'coffee',
    mrp: 499,
    sellingPrice: 399,
    offerPrice: 349,
    emoji: '☕',
    description: 'The purest expression of Araku Valley coffee. Unblended, single-estate beans ground to perfection for drip brewing. A connoisseur\'s choice.',
    benefits: ['100% Organic', 'Single Estate', 'Pure Unblended', 'Full Bodied', 'Premium Grind'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.drip.brewed, COFFEE.drip.product, COFFEE.drip.lifestyle],
  },

  // Mountain Roast Beans - Whole bean premium
  {
    name: 'Mountain Roast Beans',
    weight: '500g',
    category: 'coffee',
    mrp: 1199,
    sellingPrice: 999,
    offerPrice: 899,
    emoji: '☕',
    description: 'Whole roasted coffee beans from the high elevations of Araku Valley. Bold, complex flavor with smoky undertones. Perfect for home grinding and French press.',
    benefits: ['100% Organic', 'Whole Beans', 'Bold & Complex', 'High Elevation', 'Fresh Roasted'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.mountain.product, COFFEE.mountain.lifestyle, COFFEE.mountain.beans],
  },
  {
    name: 'Mountain Roast Beans',
    weight: '1Kg',
    category: 'coffee',
    mrp: 1999,
    sellingPrice: 1699,
    offerPrice: 1499,
    emoji: '☕',
    description: 'Premium whole bean coffee in a generous 1kg pack. Sourced from the highest slopes of Araku Valley for an exceptionally rich and nuanced cup.',
    benefits: ['100% Organic', 'Whole Beans', 'Connoisseur Grade', 'High Elevation', 'Bulk Value'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [COFFEE.mountain.lifestyle, COFFEE.mountain.product, COFFEE.mountain.beans],
  },

  // ═══════════════════════════════════════════
  // TURMERIC COLLECTION
  // ═══════════════════════════════════════════

  {
    name: 'Wild Turmeric',
    weight: '1Kg',
    category: 'turmeric',
    mrp: 549,
    sellingPrice: 449,
    offerPrice: 399,
    emoji: '🌿',
    description: 'Wild-harvested turmeric from the tribal forests of Eastern Ghats. Exceptionally high curcumin content with medicinal properties. Ideal for daily wellness and cooking.',
    benefits: ['100% Organic', 'Wild Harvested', 'High Curcumin', 'Tribal Sourced', 'No Chemicals'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [TURMERIC.product, TURMERIC.lifestyle, TURMERIC.powder],
  },
  {
    name: 'Wild Turmeric',
    weight: '500g',
    category: 'turmeric',
    mrp: 299,
    sellingPrice: 229,
    offerPrice: 199,
    emoji: '🌿',
    description: 'Premium wild turmeric powder in a convenient 500g pack. Hand-processed by tribal communities using traditional methods that preserve maximum curcumin.',
    benefits: ['100% Organic', 'Wild Harvested', 'Traditional Process', 'High Curcumin', 'No Additives'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [TURMERIC.product, TURMERIC.powder],
  },
  {
    name: 'Wild Turmeric',
    weight: '200g',
    category: 'turmeric',
    mrp: 149,
    sellingPrice: 109,
    offerPrice: 99,
    emoji: '🌿',
    description: 'Our popular 200g wild turmeric pack. Perfect for trying our premium turmeric or for smaller households.',
    benefits: ['100% Organic', 'Wild Harvested', 'Convenient Size', 'High Curcumin', 'Pure & Natural'],
    status: 'active',
    showOfferBadge: true,
    featured: false,
    images: [TURMERIC.product, TURMERIC.lifestyle],
  },
  {
    name: 'Wild Turmeric',
    weight: '100g',
    category: 'turmeric',
    mrp: 79,
    sellingPrice: 59,
    offerPrice: 49,
    emoji: '🌿',
    description: 'Starter pack of our famous wild turmeric. Experience the authentic flavor and vibrant color that only forest-harvested turmeric can provide.',
    benefits: ['100% Organic', 'Wild Harvested', 'Starter Pack', 'Vibrant Color', 'Pure Quality'],
    status: 'active',
    showOfferBadge: true,
    featured: false,
    images: [TURMERIC.powder, TURMERIC.product],
  },
  {
    name: 'Wild Turmeric',
    weight: '50g',
    category: 'turmeric',
    mrp: 59,
    sellingPrice: 45,
    offerPrice: 39,
    emoji: '🌿',
    description: 'Trial size wild turmeric powder. Perfect for those curious about the difference wild-harvested turmeric makes. Rich aroma and deep golden color.',
    benefits: ['100% Organic', 'Wild Harvested', 'Trial Size', 'Rich Aroma', 'Natural Golden'],
    status: 'active',
    showOfferBadge: true,
    featured: false,
    images: [TURMERIC.powder],
  },

  // ═══════════════════════════════════════════
  // HONEY COLLECTION
  // ═══════════════════════════════════════════

  {
    name: 'Wild Golden Honey',
    weight: '500g',
    category: 'honey',
    mrp: 449,
    sellingPrice: 349,
    offerPrice: 299,
    emoji: '🍯',
    description: 'Raw, unfiltered honey from wild beehives in the untouched forests of Araku Valley. Pure, natural, and bursting with enzymes and antioxidants.',
    benefits: ['100% Raw', 'Wild Harvested', 'No Processing', 'Tribal Sourced', 'Natural Antibiotic'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [HONEY.jar, HONEY.dripping, HONEY.honeycomb],
  },
  {
    name: 'Wild Golden Honey',
    weight: '1Kg',
    category: 'honey',
    mrp: 849,
    sellingPrice: 699,
    offerPrice: 649,
    emoji: '🍯',
    description: 'Our popular 1kg wild honey jar. Collected from deep within the Araku Valley forests by traditional honey hunters. Each jar is a testament to purity and tradition.',
    benefits: ['100% Raw', 'Wild Harvested', 'Traditional Collection', 'No Additives', 'Forest Fresh'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [HONEY.dripping, HONEY.jar, HONEY.honeycomb],
  },
  {
    name: 'Wild Golden Honey',
    weight: '5Kg',
    category: 'honey',
    mrp: 3199,
    sellingPrice: 2799,
    offerPrice: 2499,
    emoji: '🍯',
    description: 'Bulk pack of our premium wild honey. Perfect for families, health enthusiasts, and businesses. Same wild-harvested purity in a generous 5kg container.',
    benefits: ['100% Raw', 'Wild Harvested', 'Bulk Value', 'No Additives', 'Family Pack'],
    status: 'active',
    showOfferBadge: true,
    featured: true,
    images: [HONEY.honeycomb, HONEY.jar, HONEY.dripping],
  },
];

// Hero banner images for homepage
export const HERO_IMAGES = {
  main: 'https://images.pexels.com/photos/1398297/pexels-photo-1398297.jpeg?w=1200',
  coffee: 'https://images.pexels.com/photos/28495599/pexels-photo-28495599.jpeg?w=1200',
  turmeric: 'https://images.pexels.com/photos/8760466/pexels-photo-8760466.jpeg?w=1200',
  honey: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?w=1200',
};

// Category images for homepage category section
export const CATEGORY_IMAGES = {
  coffee: 'https://images.pexels.com/photos/26117179/pexels-photo-26117179.jpeg?w=600',
  turmeric: 'https://images.pexels.com/photos/7771976/pexels-photo-7771976.jpeg?w=600',
  honey: 'https://images.pexels.com/photos/533936/pexels-photo-533936.jpeg?w=600',
};

// Featured product highlights for homepage
export const FEATURED_IMAGES = {
  bestseller: 'https://images.pexels.com/photos/28495599/pexels-photo-28495599.jpeg?w=600',
  newarrival: 'https://images.pexels.com/photos/11504124/pexels-photo-11504124.jpeg?w=600',
  organic: 'https://images.pexels.com/photos/8760466/pexels-photo-8760466.jpeg?w=600',
};

// Alt text for accessibility and SEO
export const IMAGE_ALT_TEXT: Record<string, string> = {
  // Coffee
  [COFFEE.tribal.product]: 'Premium Tribal Reserve Coffee from Araku Valley - organic coffee packaging with beans',
  [COFFEE.tribal.lifestyle]: 'Tribal Reserve Coffee beans surrounded by premium packaging display',
  [COFFEE.tribal.beans]: 'Close-up of roasted Tribal Reserve coffee beans on white background',
  [COFFEE.estate.product]: 'Estate Blend Coffee premium packaging with cup and natural elements',
  [COFFEE.estate.lifestyle]: 'Estate Blend Coffee bags on rustic shelving in artisan cafe',
  [COFFEE.estate.beans]: 'Fresh roasted Estate Blend coffee beans detailed close-up',
  [COFFEE.drip.product]: 'Valley Drip Coffee pour-over brewing setup on wooden table',
  [COFFEE.drip.lifestyle]: 'Coffee dripper with carafe on wooden table - artisan brewing',
  [COFFEE.drip.brewed]: 'Elegant pour-over coffee brewing process with golden extraction',
  [COFFEE.mountain.product]: 'Mountain Roast Beans coffee packaging with scattered beans on yellow',
  [COFFEE.mountain.lifestyle]: 'Mountain Roast coffee bags at outdoor artisan market',
  [COFFEE.mountain.beans]: 'Scattered roasted Mountain Roast coffee beans on white background',
  // Turmeric
  [TURMERIC.product]: 'Organic Wild Turmeric powder jar with fresh turmeric roots - product shot',
  [TURMERIC.lifestyle]: 'Glass jars of organic turmeric and cinnamon on wooden shelf',
  [TURMERIC.powder]: 'Turmeric powder with curcuma roots and essential oil on wooden surface',
  // Honey
  [HONEY.jar]: 'Wild Golden Honey glass jar with wooden dipper - premium organic honey',
  [HONEY.dripping]: 'Golden honey being drizzled from honey dipper - raw organic honey',
  [HONEY.honeycomb]: 'Fresh honeycomb with dripping honey - wild harvested from Araku Valley forests',
};

export const discountPercent = (mrp: number, offer: number) => Math.round(((mrp - offer) / mrp) * 100);
