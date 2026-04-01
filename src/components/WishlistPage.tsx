import React from 'react';
import { useWishlist } from '../WishlistContext';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistPage = () => {
  const { wishlist, loading } = useWishlist();
  
  const wishlistedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">My Wishlist</h1>
          </div>
          <div className="flex items-center gap-2 text-pink-500 font-bold text-sm">
            <Heart size={18} className="fill-current" />
            <span>{wishlistedProducts.length} Items</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-pink-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Save items you love to your wishlist and they'll appear here.
            </p>
            <Link 
              to="/" 
              className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};
