// src/components/shared/RatingStars.tsx
'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showNumber?: boolean;
  className?: string;
}

export default function RatingStars({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showNumber = false,
  className = '',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!interactive) return;
    setSelectedRating(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!interactive) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const displayRating = interactive ? (hoverRating || selectedRating) : rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalfFilled = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
                interactive ? 'hover:scale-110 transition-transform' : ''
              }`}
            >
              {/* Background star (empty) */}
              <Star
                className={`${sizes[size]} text-gray-300`}
                strokeWidth={2}
              />
              
              {/* Filled star */}
              {isFilled && (
                <Star
                  className={`${sizes[size]} text-yellow-500 absolute top-0 left-0`}
                  fill="currentColor"
                  strokeWidth={2}
                />
              )}
              
              {/* Half-filled star */}
              {isHalfFilled && (
                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    className={`${sizes[size]} text-yellow-500`}
                    fill="currentColor"
                    strokeWidth={2}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}