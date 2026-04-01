import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export type SortOption = 'price-low' | 'price-high' | 'newest' | 'rating' | 'default';

interface SortDropdownProps {
  currentSort: SortOption;
  onSort: (option: SortOption) => void;
}

const SORT_OPTIONS = [
  { id: 'default', label: 'Recommended' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ currentSort, onSort }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = SORT_OPTIONS.find(o => o.id === currentSort)?.label || 'Sort By';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-all border border-transparent active:scale-95"
      >
        <ArrowUpDown size={14} />
        {currentLabel}
        <ChevronDown size={14} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSort(option.id as SortOption);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors",
                      currentSort === option.id 
                        ? "bg-pink-50 text-pink-500" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
