import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Heart, Star, Share2, ShieldCheck, Truck, RotateCcw, MessageSquare } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, onSnapshot } from '../firebase';
import { Product } from '../types';
import { ReviewForm, ReviewList } from './Reviews';
import { cn } from '../lib/utils';
import { SimilarProducts } from './SimilarProducts';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const isWishlisted = id ? isInWishlist(id) : false;

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  useEffect(() => {
    if (!id) return;

    // Try to find in mock first for immediate display
    const mockProduct = PRODUCTS.find(p => p.id === id);
    if (mockProduct) {
      setProduct(mockProduct);
      setSelectedSize(mockProduct.sizes[0]);
      setSelectedColor(mockProduct.colors[0]);
    }

    // Then subscribe to Firestore for real-time updates (ratings, etc)
    const unsubscribe = onSnapshot(doc(db, 'products', id), (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() } as Product;
        setProduct(data);
        if (!selectedSize) setSelectedSize(data.sizes[0]);
        if (!selectedColor) setSelectedColor(data.colors[0]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching product:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading && !product) return <div className="pt-24 px-6 text-center font-bold text-pink-500">Loading product...</div>;
  if (!product) return <div className="pt-24 px-6 text-center">Product not found</div>;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white rounded-full shadow-sm">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => id && toggleWishlist(id)}
            className={cn(
              "p-2 rounded-full shadow-sm transition-colors",
              isWishlisted ? "bg-pink-500 text-white" : "bg-white text-pink-500"
            )}
          >
            <Heart size={20} className={cn(isWishlisted && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            src={product.images[activeImage]} 
            alt={product.name} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-20 left-4 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        
        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {product.images.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeImage === idx ? "bg-pink-500 w-6" : "bg-white/60 backdrop-blur-sm"
              )}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails Strip */}
      {product.images.length > 1 && (
        <div className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide bg-white">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={cn(
                "flex-shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                activeImage === idx ? "border-pink-500 scale-105 shadow-lg" : "border-transparent opacity-60"
              )}
            >
              <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className="px-4 py-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-black text-pink-500">${product.price}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-gray-400 line-through font-bold">${product.originalPrice}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-700">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">{product.reviewsCount} Reviews</span>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Color: {selectedColor}</h3>
          <div className="flex gap-4">
            {product.colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                  selectedColor === color ? "border-pink-500 scale-110" : "border-transparent hover:border-gray-200"
                )}
              >
                <div 
                  className="w-8 h-8 rounded-full border border-gray-100 shadow-inner" 
                  style={{ backgroundColor: color.toLowerCase().replace(/\s+/g, '') }}
                />
                {selectedColor === color && (
                  <motion.div 
                    layoutId="color-active"
                    className="absolute -inset-1 rounded-full border-2 border-pink-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Size</h3>
            <button className="text-xs text-pink-500 font-medium underline">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-6 h-10 flex items-center justify-center rounded-full border-2 font-bold transition-all relative overflow-hidden",
                  selectedSize === size 
                    ? "border-pink-500 text-white" 
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                )}
              >
                {selectedSize === size && (
                  <motion.div 
                    layoutId="size-active"
                    className="absolute inset-0 bg-pink-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
              activeTab === 'details' ? "border-pink-500 text-pink-500" : "border-transparent text-gray-400"
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2",
              activeTab === 'reviews' ? "border-pink-500 text-pink-500" : "border-transparent text-gray-400"
            )}
          >
            Reviews ({product.reviewsCount || 0})
          </button>
        </div>

        {activeTab === 'details' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key="details"
          >
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 mb-8">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-pink-500" />
                <span className="text-[10px] font-medium text-gray-500">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw size={20} className="text-pink-500" />
                <span className="text-[10px] font-medium text-gray-500">30 Days Return</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-pink-500" />
                <span className="text-[10px] font-medium text-gray-500">Secure Payment</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key="reviews"
            className="space-y-10"
          >
            <ReviewForm productId={product.id} />
            <div>
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                Customer Reviews <MessageSquare size={20} className="text-pink-500" />
              </h3>
              <ReviewList productId={product.id} />
            </div>
          </motion.div>
        )}

        {/* Similar Products */}
        <SimilarProducts currentProduct={product} />
      </div>

      {/* Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-4 z-50">
        <button 
          onClick={() => id && toggleWishlist(id)}
          className={cn(
            "p-4 border-2 rounded-xl transition-colors",
            isWishlisted ? "border-pink-500 bg-pink-50 text-pink-500" : "border-gray-100 text-gray-400 hover:text-pink-500 hover:border-pink-100"
          )}
        >
          <Heart size={24} className={cn(isWishlisted && "fill-current")} />
        </button>
        <button 
          onClick={() => {
            addToCart(product, selectedSize, selectedColor);
            // Show success animation or toast
          }}
          className="flex-1 bg-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-200 active:scale-95 transition-transform"
        >
          <ShoppingBag size={20} />
          ADD TO CART
        </button>
      </div>
    </div>
  );
};
