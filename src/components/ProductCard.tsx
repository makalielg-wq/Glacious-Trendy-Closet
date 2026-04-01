import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { QuickViewModal } from './QuickViewModal';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group"
      >
        <div className="block relative aspect-[3/4] overflow-hidden">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </Link>
          
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className={cn(
                "p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-colors",
                isWishlisted ? "bg-pink-500 text-white" : "text-pink-500 hover:bg-pink-500 hover:text-white"
              )}
            >
              <Heart size={18} className={cn(isWishlisted && "fill-current")} />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 shadow-sm hover:bg-pink-500 hover:text-white transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
              <Eye size={18} />
            </button>
          </div>

          {product.isFeatured && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-pink-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
              Trending
            </span>
          )}

          {product.originalPrice && product.originalPrice > product.price && (
            <span className={cn(
              "absolute px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded uppercase tracking-wider",
              product.isFeatured ? "top-8 left-2" : "top-2 left-2"
            )}>
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}

          {/* Quick Add Button for Desktop */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform hidden md:block">
            <button 
              onClick={() => setIsQuickViewOpen(true)}
              className="w-full bg-white/90 backdrop-blur-md text-pink-500 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-pink-500 hover:text-white transition-all"
            >
              Quick View
            </button>
          </div>
        </div>
        <div className="p-3">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-pink-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-500">{product.rating} ({product.reviewsCount})</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] text-gray-400 line-through">${product.originalPrice}</span>
              )}
              <span className="text-pink-500 font-bold">${product.price}</span>
            </div>
            <button 
              onClick={() => addToCart(product, product.sizes[0], product.colors[0])}
              className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-sm active:scale-95"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};
