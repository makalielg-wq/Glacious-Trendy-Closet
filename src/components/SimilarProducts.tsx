import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, db } from '../firebase';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';

interface SimilarProductsProps {
  currentProduct: Product;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct }) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', currentProduct.category),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.id !== currentProduct.id); // Exclude current product

        // Sort by color similarity (simple check if any color matches)
        const sorted = products.sort((a, b) => {
          const aHasColor = a.colors.some(c => currentProduct.colors.includes(c));
          const bHasColor = b.colors.some(c => currentProduct.colors.includes(c));
          if (aHasColor && !bHasColor) return -1;
          if (!aHasColor && bHasColor) return 1;
          return 0;
        });

        setSimilarProducts(sorted.slice(0, 4));
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentProduct.id, currentProduct.category, currentProduct.colors]);

  if (loading) {
    return (
      <div className="mt-12 px-4">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (similarProducts.length === 0) return null;

  return (
    <div className="mt-12 px-4">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">You Might Also Like</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        {similarProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
