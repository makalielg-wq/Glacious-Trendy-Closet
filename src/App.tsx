import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Home, Menu, X, ChevronRight, Star, Bell } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CartProvider, useCart } from './CartContext';
import { WishlistProvider, useWishlist } from './WishlistContext';
import { AuthProvider, useAuth } from './AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRODUCTS, CATEGORIES } from './constants';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { SearchPage } from './components/SearchPage';
import { CategoriesPage } from './components/CategoriesPage';
import { OrdersPage } from './components/OrdersPage';
import { WishlistPage } from './components/WishlistPage';
import { LoginPage } from './components/LoginPage';
import { ContactPage } from './components/ContactPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SortDropdown, SortOption } from './components/SortDropdown';
import { ColorFilter } from './components/ColorFilter';
import { LogIn, LogOut, Settings, CreditCard, MapPin, Package, HelpCircle, Phone, Mail } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { db, collection, getDocs, OperationType, handleFirestoreError } from './firebase';
import { Product } from './types';

// Home Page Component
const HomePage = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        if (docs.length > 0) {
          setProducts(docs);
        } else {
          setProducts(PRODUCTS); // Fallback to mock
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(PRODUCTS); // Fallback on error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [products]);

  const featuredProducts = products.filter(p => p.isFeatured);

  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by color
    if (selectedColor) {
      result = result.filter(p => p.colors.includes(selectedColor));
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt?.seconds || parseInt(a.id);
          const dateB = b.createdAt?.seconds || parseInt(b.id);
          return dateB - dateA;
        });
        break;
      default:
        // Default could be newest or just as is
        break;
    }
    return result;
  }, [products, sortBy, selectedColor]);
  
  return (
    <div className="pb-24">
      {/* Hero Banner */}
      <div className="relative h-[450px] bg-pink-500 overflow-hidden">
        {profile?.role === 'admin' && (
          <Link 
            to="/admin" 
            className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm text-pink-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Settings size={14} />
            Admin Dashboard
          </Link>
        )}
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1600&fit=crop" 
          alt="Hero" 
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-pink-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mb-3 inline-block">New Collection</span>
            <h1 className="text-5xl font-black mb-2 leading-none tracking-tighter">
              SUMMER<br />VIBES
            </h1>
            <p className="text-lg mb-6 text-white/90 font-medium">Up to 50% OFF on all pink items</p>
            <button className="bg-white text-pink-500 px-10 py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl active:scale-95 transition-transform">
              SHOP NOW
            </button>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Categories</h2>
          <Link to="/categories" className="text-pink-500 text-sm font-bold flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/explore?q=${cat.name}`} className="flex-shrink-0 text-center group">
              <div className="w-24 h-24 rounded-3xl bg-pink-50 mb-3 overflow-hidden border-2 border-transparent group-hover:border-pink-500 transition-all shadow-sm">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trending Now</h2>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="w-2 h-2 rounded-full bg-pink-100" />
            <span className="w-2 h-2 rounded-full bg-pink-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Banner 2 */}
      <div className="mx-4 my-10 rounded-3xl bg-gray-900 h-48 relative overflow-hidden flex items-center px-8">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=400&fit=crop" 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10">
          <h3 className="text-white text-2xl font-black leading-tight mb-2">JOIN THE<br />GLACIOUS CLUB</h3>
          <p className="text-white/70 text-sm mb-4">Get exclusive deals and early access</p>
          <button className="bg-pink-500 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest">Join Now</button>
        </div>
      </div>

      {/* All Products */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Arrivals</h2>
          <SortDropdown currentSort={sortBy} onSort={setSortBy} />
        </div>
        
        <ColorFilter 
          colors={availableColors} 
          selectedColor={selectedColor} 
          onSelectColor={setSelectedColor} 
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {sortedAndFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Footer / Contact Info */}
      <div className="mt-12 px-6 py-12 bg-gray-50 rounded-t-[3rem] border-t border-gray-100">
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl font-black tracking-tighter text-pink-500 mb-6">GLACIOUS</span>
          <div className="space-y-6 w-full max-w-xs">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-500">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visit Us</p>
                <p className="text-xs font-bold text-gray-700 leading-tight">Shop D1 Sunset Mall, Corner Mbuya Nehanda and Speke</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-500">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Us</p>
                <p className="text-xs font-bold text-gray-700">+263 774 711 615</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Us</p>
                <p className="text-xs font-bold text-gray-700">glacioustrendy@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 w-full">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Supported Payments</p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png' },
                { name: 'ZimSwitch', logo: 'https://zimswitch.co.zw/wp-content/uploads/2021/05/Zimswitch-Logo-1.png' },
                { name: 'EcoCash', logo: 'https://www.ecocash.co.zw/wp-content/uploads/2022/03/ecocash-logo.png' },
                { name: 'OneMoney', logo: 'https://www.netone.co.zw/wp-content/uploads/2018/10/OneMoney-Logo-1.png' },
                { name: 'Omari', logo: 'https://omari.co.zw/wp-content/uploads/2023/05/Omari-Logo-1.png' },
              ].map((pay) => (
                <div key={pay.name} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm border border-gray-100">
                    <img src={pay.logo} alt={pay.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{pay.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 w-full">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">© 2026 GLACIOUS TRENDY CLOSET</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = !isScrolled && location.pathname === '/';
  const { user, signIn } = useAuth();

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 flex items-center justify-between",
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          isDark ? "bg-white/20 text-white" : "bg-gray-50 text-gray-800"
        )}>
          <Menu size={20} />
        </div>
        <span className={cn(
          "text-2xl font-black tracking-tighter transition-colors",
          isDark ? "text-white" : "text-pink-500"
        )}>
          GLACIOUS
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!user && (
          <button 
            onClick={signIn}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95",
              isDark ? "bg-white text-pink-500 shadow-lg" : "bg-pink-500 text-white shadow-lg shadow-pink-100"
            )}
          >
            Sign In
          </button>
        )}
        <Link to="/explore" className={cn(
          "p-2 rounded-xl transition-colors",
          isDark ? "bg-white/20 text-white" : "bg-gray-50 text-gray-800"
        )}>
          <Search size={20} />
        </Link>
        <Link to="/cart" className={cn(
          "p-2 rounded-xl transition-colors relative",
          isDark ? "bg-white/20 text-white" : "bg-gray-50 text-gray-800"
        )}>
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'HOME', path: '/' },
    { icon: Search, label: 'EXPLORE', path: '/explore' },
    { icon: Heart, label: 'WISHLIST', path: '/wishlist' },
    { icon: User, label: 'PROFILE', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 pb-8">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.label} 
            to={item.path} 
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all",
              isActive ? "text-pink-500 scale-110" : "text-gray-400"
            )}
          >
            <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[9px] font-black tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const ProfilePage = () => {
  const { user, profile, signIn, signOut, loading } = useAuth();

  if (loading) return <div className="pt-24 px-6 text-center font-bold text-pink-500">Loading profile...</div>;

  if (!user) {
    return <LoginPage />;
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', path: '/orders' },
    { icon: Heart, label: 'My Wishlist', path: '/wishlist' },
    ...(profile?.role === 'admin' ? [{ icon: Settings, label: 'Admin Dashboard', path: '/admin' }] : []),
    { icon: MapPin, label: 'Shipping Address' },
    { icon: CreditCard, label: 'Payment Methods' },
    { icon: HelpCircle, label: 'Contact Us', path: '/contact' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="pt-24 px-6 pb-24">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-20 h-20 bg-pink-100 rounded-full overflow-hidden border-4 border-pink-50">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-pink-500 font-black text-2xl">
              {profile?.displayName?.[0] || 'U'}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{profile?.displayName}</h2>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          {profile?.role === 'admin' && (
            <span className="mt-1 inline-block bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path || '#'} 
            className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-gray-400 group-hover:text-pink-500" />
              {item.label}
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-pink-500" />
          </Link>
        ))}
        
        <button 
          onClick={signOut}
          className="w-full flex justify-between items-center p-4 bg-red-50 rounded-2xl font-bold text-red-500 mt-6"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} />
            Sign Out
          </div>
        </button>
      </div>

      {/* Supported Payments Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Supported Payment Methods</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png' },
            { name: 'ZimSwitch', logo: 'https://zimswitch.co.zw/wp-content/uploads/2021/05/Zimswitch-Logo-1.png' },
            { name: 'EcoCash', logo: 'https://www.ecocash.co.zw/wp-content/uploads/2022/03/ecocash-logo.png' },
            { name: 'OneMoney', logo: 'https://www.netone.co.zw/wp-content/uploads/2018/10/OneMoney-Logo-1.png' },
            { name: 'Omari', logo: 'https://omari.co.zw/wp-content/uploads/2023/05/Omari-Logo-1.png' },
          ].map((pay) => (
            <div key={pay.name} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-[3/2] bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-gray-100">
                <img src={pay.logo} alt={pay.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{pay.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-100 flex items-start gap-3">
          <CreditCard size={16} className="text-pink-500 mt-0.5" />
          <p className="text-[9px] font-bold text-gray-500 leading-relaxed">
            All transactions are encrypted and secure. We support local mobile money and international cards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-500 overflow-x-hidden">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/explore" element={<SearchPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </main>
                <BottomNav />
              </div>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
