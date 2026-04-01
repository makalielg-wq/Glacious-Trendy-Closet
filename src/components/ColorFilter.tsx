import React from 'react';
import { cn } from '../lib/utils';

interface ColorFilterProps {
  colors: string[];
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
}

export const ColorFilter = ({ colors, selectedColor, onSelectColor }: ColorFilterProps) => {
  if (colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Filter by Color</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2">
        <button
          onClick={() => onSelectColor(null)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
            selectedColor === null 
              ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100" 
              : "bg-white border-gray-100 text-gray-400 hover:border-pink-200"
          )}
        >
          All Colors
        </button>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2",
              selectedColor === color 
                ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100" 
                : "bg-white border-gray-100 text-gray-400 hover:border-pink-200"
            )}
          >
            <div 
              className="w-3 h-3 rounded-full border border-gray-200" 
              style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
            />
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};
