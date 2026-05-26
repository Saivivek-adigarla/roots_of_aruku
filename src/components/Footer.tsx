import { Link } from 'react-router-dom';
import { Phone, MapPin, Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-maroon-900 text-gray-300 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Building2 size={18} className="text-gold-400" /> PickUrStay</h3>
            <p className="text-sm">Premium organic products from Araku Valley tribal farms. UPI: pickurstay@ybl</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm"><li><Link to="/" className="hover:text-gold-400">Home</Link></li><li><Link to="/products" className="hover:text-gold-400">Products</Link></li><li><Link to="/about" className="hover:text-gold-400">About</Link></li><li><Link to="/contact" className="hover:text-gold-400">Contact</Link></li></ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Contact</h4>
            <div className="space-y-1 text-sm flex flex-col gap-1">
              <a href="tel:+917036252018" className="flex items-center gap-1 hover:text-gold-400"><Phone size={14} /> +91 7036252018</a>
              <a href="https://wa.me/917036252018" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gold-400">WhatsApp Support</a>
              <div className="flex items-center gap-1"><MapPin size={14} /> Araku Valley, India</div>
            </div>
          </div>
        </div>
        <div className="border-t border-maroon-800 pt-4 text-center text-xs">&copy; 2025 PickUrStay Hotels. All rights reserved.</div>
      </div>
    </footer>
  );
}
