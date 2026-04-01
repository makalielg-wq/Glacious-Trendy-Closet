import React, { useState } from 'react';
import { X, ShoppingBag, Star, Heart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { cn } from '../lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Reset selections when product changes or modal opens
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
    }
  }, [product, isOpen]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-pink-500 transition-colors z-10 shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="w-full md:w-1/2 aspect-[3/4] bg-gray-50 relative">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded font-black text-[10px] uppercase tracking-widest shadow-lg">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">{product.category}</p>
                    <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">{product.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            className={cn(
                              star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">({product.reviewsCount} Reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <div className="text-2xl font-black text-pink-500">${product.price}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-sm text-gray-400 line-through font-bold">${product.originalPrice}</div>
                    )}
                  </div>

                  {/* Size Selection */}
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "px-4 h-9 flex items-center justify-center rounded-full border-2 text-xs font-bold transition-all relative overflow-hidden",
                            selectedSize === size 
                              ? "border-pink-500 text-white" 
                              : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                          )}
                        >
                          {selectedSize === size && (
                            <motion.div 
                              layoutId="size-active-modal"
                              className="absolute inset-0 bg-pink-500"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Color</h3>
                    <div className="flex gap-3">
                      {product.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                            selectedColor === color ? "border-pink-500 scale-110" : "border-transparent hover:border-gray-200"
                          )}
                        >
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-100 shadow-inner" 
                            style={{ backgroundColor: color.toLowerCase().replace(/\s+/g, '') }}
                          />
                          {selectedColor === color && (
                            <motion.div 
                              layoutId="color-active-modal"
                              className="absolute -inset-1 rounded-full border-2 border-pink-500"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button 
                      onClick={() => {
                        addToCart(product, selectedSize, selectedColor);
                        onClose();
                      }}
                      className="flex-1 bg-pink-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-100 hover:bg-pink-600 active:scale-95 transition-all"
                    >
                      <ShoppingBag size={18} />
                      ADD TO CART
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={cn(
                        "p-4 rounded-xl transition-all",
                        isWishlisted ? "bg-pink-500 text-white" : "bg-gray-50 text-gray-400 hover:text-pink-500"
                      )}
                    >
                      <Heart size={20} className={cn(isWishlisted && "fill-current")} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
