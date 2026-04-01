import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES, PRODUCTS } from '../constants';
import { db, collection, getDocs } from '../firebase';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ColorFilter } from './ColorFilter';

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        if (docs.length > 0) {
          setProducts(docs);
        } else {
          setProducts(PRODUCTS);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(PRODUCTS);
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

  const filteredProducts = useMemo(() => {
    if (!selectedColor) return products;
    return products.filter(p => p.colors.includes(selectedColor));
  }, [products, selectedColor]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-4">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">All Categories</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={`/explore?q=${category.name}`}
              className="relative h-48 rounded-3xl overflow-hidden group block"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                <div>
                  <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">{category.name}</h2>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-widest">
                    Explore Collection <ChevronRight size={16} className="text-pink-500" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Featured Collections */}
      <div className="mt-12">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Featured Collections</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/explore?q=summer-essentials"
            className="relative aspect-square rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform active:scale-95"
          >
            <img 
              src="https://images.unsplash.com/photo-1522771935876-249711cdca47?w=600&h=600&fit=crop" 
              alt="Summer Essentials" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/80 to-transparent p-6 flex flex-col justify-end text-white">
              <h4 className="font-black text-lg leading-tight mb-1 uppercase">Summer Essentials</h4>
              <p className="text-[10px] opacity-80 uppercase font-bold">24 Items</p>
            </div>
          </Link>
          <Link 
            to="/explore?q=night-out"
            className="relative aspect-square rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform active:scale-95"
          >
            <img 
              src="https://images.unsplash.com/photo-1519706824391-0947707371f0?w=600&h=600&fit=crop" 
              alt="Night Out" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6 flex flex-col justify-end text-white">
              <h4 className="font-black text-lg leading-tight mb-1 uppercase">Night Out</h4>
              <p className="text-[10px] opacity-80 uppercase font-bold">18 Items</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Browse All Products with Color Filter */}
      <div className="mt-12">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Browse All Products</h3>
        
        <ColorFilter 
          colors={availableColors} 
          selectedColor={selectedColor} 
          onSelectColor={setSelectedColor} 
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
