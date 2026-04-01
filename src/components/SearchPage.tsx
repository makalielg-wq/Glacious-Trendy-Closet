import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowLeft, SlidersHorizontal, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { db, collection, getDocs } from '../firebase';
import { ProductCard } from './ProductCard';
import { SortDropdown, SortOption } from './SortDropdown';
import { ColorFilter } from './ColorFilter';
import { cn } from '../lib/utils';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

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

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q)
      );
    } else {
      return [];
    }

    return result;
  }, [searchQuery, products]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    filteredProducts.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [filteredProducts]);

  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...filteredProducts];

    // Filter by color
    if (selectedColor) {
      result = result.filter(p => p.colors.includes(selectedColor));
    }

    // Apply sorting
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
        break;
    }

    return result;
  }, [filteredProducts, sortBy, selectedColor]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      saveSearch(searchQuery.trim());
      setSearchParams({ q: searchQuery.trim() });
      setIsFocused(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      {/* Search Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search products, styles..."
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-10 text-sm font-medium focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </form>
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Real-time Suggestions Overlay */}
        <AnimatePresence>
          {isFocused && (suggestions.length > 0 || (recentSearches.length > 0 && !searchQuery)) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed left-0 right-0 top-[72px] bg-white z-40 shadow-xl border-b border-gray-100 max-h-[60vh] overflow-y-auto"
            >
              <div className="p-4">
                {!searchQuery && recentSearches.length > 0 ? (
                  <>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Searches</h3>
                    <div className="space-y-3">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSearchQuery(s);
                            setSearchParams({ q: s });
                            setIsFocused(false);
                          }}
                          className="w-full flex items-center gap-3 text-left group"
                        >
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                            <Search size={14} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-pink-500 transition-colors">{s}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : suggestions.length > 0 ? (
                  <>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Suggestions</h3>
                    <div className="space-y-4">
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSearchQuery(p.name);
                            saveSearch(p.name);
                            setSearchParams({ q: p.name });
                            setIsFocused(false);
                          }}
                          className="w-full flex items-center gap-4 text-left group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-pink-500 transition-colors">{p.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{p.category}</p>
                          </div>
                          <ArrowLeft size={16} className="text-gray-300 rotate-180" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : searchQuery && filteredProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  Results for "{searchQuery}"
                </h2>
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
            </>
          ) : searchQuery ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-pink-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">No results found</h3>
              <p className="text-gray-500 text-sm max-w-[200px] mx-auto">
                We couldn't find anything matching "{searchQuery}". Try different keywords.
              </p>
            </div>
          ) : (
            <div className="py-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Summer Dress', 'Pink Top', 'Denim', 'Accessories', 'New Arrivals'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setSearchParams({ q: tag });
                    }}
                    className="px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
