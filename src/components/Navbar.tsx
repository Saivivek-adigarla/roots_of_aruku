import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Search, Menu, X, Heart, Package, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartStore = useCartStore();
  const itemCount = cartStore.itemCount();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-maroon-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/image copy copy copy copy copy copy copy.png"
                alt="Roots of Araku"
                className="h-14 w-auto"
              />
              <span className="hidden md:inline text-sm font-semibold text-gold-300">Roots of Araku</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffee, turmeric, honey..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-0 focus:ring-2 focus:ring-gold-400 outline-none text-gray-800"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden text-white p-1">
              <Search size={22} />
            </button>
            <Link to="/wishlist" className="relative text-white hover:text-gold-400 p-1 hidden sm:block">
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-400 text-maroon-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-white hover:text-gold-400 p-1">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-400 text-maroon-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="relative">
              {user ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center text-maroon-900 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-100 w-56 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                          <UserIcon size={18} /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                          <Package size={18} /> My Orders
                        </Link>
                        <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700">
                          <Heart size={18} /> Wishlist
                        </Link>
                        {user.isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-maroon-700 font-medium">
                            <Settings size={18} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600 w-full">
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="text-white hover:text-gold-400 p-1">
                  <UserIcon size={22} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg outline-none text-gray-800"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-maroon-800 border-t border-maroon-600">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Products</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">About Us</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Contact</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">My Orders</Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Wishlist</Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-gold-400 font-medium">Admin Panel</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block py-2 text-white hover:text-gold-400">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
