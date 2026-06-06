import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-maroon-900 text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src="/image copy copy copy copy copy copy copy.png" alt="Roots of Araku" className="h-20 w-auto" />
            </div>
            <p className="text-sm">Premium organic products from Araku Valley tribal farms. 100% authentic, chemical-free.</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/story" className="hover:text-gold-400 transition">Our Story</Link></li>
              <li><Link to="/about" className="hover:text-gold-400 transition">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-gold-400 transition">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/products" className="hover:text-gold-400 transition">All Products</Link></li>
              <li><Link to="/faq" className="hover:text-gold-400 transition">FAQ</Link></li>
              <li><Link to="/cart" className="hover:text-gold-400 transition">Cart</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold mb-3">Policies</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/privacy" className="hover:text-gold-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/returns" className="hover:text-gold-400 transition">Returns Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-gold-400 transition">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <a href="tel:+917036252018" className="flex items-center gap-2 hover:text-gold-400 transition">
                <Phone size={14} /> +91 7036252018
              </a>
              <a href="https://wa.me/917036252018" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-400 transition">
                💬 WhatsApp Support
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> Araku Valley, AP
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-maroon-800 pt-6">
          <div className="text-center text-xs text-gray-400">
            <p>&copy; 2025 Roots of Araku. All rights reserved. | Promoting organic farming and tribal heritage.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
