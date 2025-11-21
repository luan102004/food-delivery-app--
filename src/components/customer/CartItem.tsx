'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 text-4xl">
        {item.image || '🍽️'}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
        <div className="text-primary-600 font-bold text-xl mb-2">
          ${item.price.toFixed(2)}
        </div>
        
        {item.notes && (
          <p className="text-sm text-gray-500 italic mb-2">
            Note: {item.notes}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.menuItemId)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="text-xl font-bold">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
}