import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, reviewCount, size = 14, showCount = true }) {
  const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.floor(rounded);
          const half = !filled && star - 0.5 === rounded;
          return (
            <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="text-stone-200"
                fill="currentColor"
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                >
                  <Star
                    size={size}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-stone-500">
          {rating.toFixed(1)} ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
