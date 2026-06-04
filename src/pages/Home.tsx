import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingCart, Leaf, Award, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { SEED_PRODUCTS } from '../data/products';
import { fetchProducts } from '../services/database';
import type { Product } from '../types';

const fallbackProducts: Product[] = SEED_PRODUCTS.slice(0, 4).map((p, i) => ({ id: String(i), ...p }));

const testimonials = [
  {
    name: 'Priya Sharma',
    rating: 5,
    text: 'The quality and taste are incomparable. I have been ordering for 6 months now and never disappointed.',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=100',
  },
  {
    name: 'Rahul Verma',
    rating: 5,
    text: 'Finally found authentic organic products from tribal farmers. Support authentic farming!',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100',
  },
  {
    name: 'Anjali Patel',
    rating: 5,
    text: 'The honey is pure and unfiltered. My kids love the taste. Highly recommend Roots of Araku.',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=100',
  },
];

const categories = [
  { name: 'Coffee', icon: '☕', link: '/products?category=coffee' },
  { name: 'Honey', icon: '🍯', link: '/products?category=honey' },
  { name: 'Millets', icon: '🌾', link: '/products?category=millets' },
  { name: 'Spices', icon: '🌶️', link: '/products?category=spices' },
  { name: 'Dry Fruits', icon: '🥜', link: '/products?category=dry-fruits' },
  { name: 'Tribal', icon: '🪶', link: '/products?category=tribal' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>(fallbackProducts);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetchProducts({ featured: true, status: 'active' })
      .then(setFeatured)
      .catch(() => setFeatured(fallbackProducts));
  }, []);

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <SEO
        title="Roots of Araku - Organic Products from Tribal Farmers"
        description="Premium organic coffee, honey, spices and tribal products directly from Araku Valley farmers. 100% authentic, chemical-free."
        keywords="organic coffee, honey, spices, tribal products, Araku Valley, organic farming"
      />

      <div className="pb-12">
        {/* Premium Hero Section */}
        <div className="relative h-screen bg-black overflow-hidden flex items-center justify-center">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="https://media.pexels.com/videos/2156104/free-video-2156104.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center text-white max-w-4xl mx-auto px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 bg-gold-400/20 text-gold-300 px-6 py-2 rounded-full border border-gold-400/30"
            >
              <Leaf size={16} /> From Araku Valley, With Love
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Pure Organic <span className="text-gold-400">Heritage</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Premium products from tribal farmers in Eastern Ghats. Taste authenticity. Support sustainability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-gold-400 text-maroon-900 px-8 py-4 rounded-full font-bold hover:bg-gold-500 transition-all transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart size={20} /> Explore Collection
              </Link>
              <Link
                to="/story"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20"
              >
                <Leaf size={20} /> Our Story
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="text-white/60 text-sm">Scroll to explore</div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Trust Indicators */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-12 -mt-16 relative z-20"
          >
            {[
              { icon: Leaf, title: '100% Organic', text: 'Chemical-free farming' },
              { icon: Award, title: 'Fair Trade', text: 'Direct farmer payments' },
              { icon: Truck, title: 'Fast Delivery', text: '2-3 days delivery' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <item.icon className="text-gold-400 mb-3" size={32} />
                <h3 className="font-bold text-lg text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Categories Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="py-16"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Explore by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <motion.a
                  key={i}
                  href={cat.link}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-warm-100 to-warm-50 p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-semibold text-gray-800 group-hover:text-gold-400 transition-colors">{cat.name}</p>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* Featured Products */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="py-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-800">Best Sellers</h2>
              <Link to="/products" className="text-gold-400 hover:text-gold-500 font-semibold flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Story Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 to-maroon-700/20 rounded-3xl blur-3xl" />
              <img
                src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=600"
                alt="Araku Valley"
                className="relative rounded-3xl shadow-2xl object-cover h-96"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-gold-400 font-semibold mb-4">
                <Leaf size={20} /> Our Heritage
              </span>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Araku Valley Stories</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                For centuries, tribal communities in Araku Valley have cultivated the finest organic products. From tribal farmers to your table, we ensure fair prices and sustainable practices.
              </p>
              <ul className="space-y-3 mb-8">
                {['Organic farming since generations', 'Fair prices for tribal farmers', '100% chemical-free products'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-gold-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/story"
                className="inline-flex items-center gap-2 bg-maroon-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-maroon-800 transition-colors"
              >
                <Leaf size={16} /> Read Full Story
              </Link>
            </div>
          </motion.section>

          {/* Testimonials */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="py-16"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Customer Love</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      <div className="flex gap-1">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star key={j} size={14} className="fill-gold-400 text-gold-400" />
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Newsletter */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="py-16"
          >
            <div className="bg-gradient-to-r from-maroon-700 to-maroon-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Subscribe to our Newsletter</h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Get exclusive recipes, health tips, and early access to new organic products
                </p>

                <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 rounded-full text-gray-800 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-gold-400 text-maroon-900 px-6 py-3 rounded-full font-bold hover:bg-gold-500 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>

                {subscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-300 mt-4 font-semibold"
                  >
                    ✓ Thanks for subscribing!
                  </motion.p>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
