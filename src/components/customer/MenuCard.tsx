'use client';

import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';
import { Plus, Minus, Clock, Star } from 'lucide-react';
import type { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAddToCart = () => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity,
      notes: notes || undefined,
      image: item.image,
      restaurantId: item.restaurantId,
    });
    setShowModal(false);
    setQuantity(1);
    setNotes('');
  };

  return (
    <>
      <Card hover onClick={() => setShowModal(true)}>
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {item.image || '🍽️'}
            </div>
          </div>
          {!item.isAvailable && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Sold Out
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-white rounded-full px-3 py-1 shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <span className="text-sm font-semibold">4.5</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                ${item.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{item.preparationTime} min</span>
              </div>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              disabled={!item.isAvailable}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add to Cart Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={item.name}
        size="md"
      >
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-8xl">
              {item.image || '🍽️'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-600">{item.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Special Instructions</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note (e.g., no onions, extra sauce...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Quantity</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-3xl font-bold text-primary-600">
                ${(item.price * quantity).toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
          >
            {t('customer.addToCart')}
          </Button>
        </div>
      </Modal>
    </>
  );
}