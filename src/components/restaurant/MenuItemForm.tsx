'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';
import type { MenuItem } from '@/types';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<MenuItem>) => void;
  editItem?: MenuItem;
}

export default function MenuItemForm({ isOpen, onClose, onSubmit, editItem }: MenuItemFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<MenuItem>>(
    editItem || {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      preparationTime: 15,
      isAvailable: true,
      tags: [],
    }
  );

  const categories = ['Pizza', 'Burgers', 'Sushi', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Preparation Time (minutes)"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
            required
          />

          <Input
            label="Image (emoji or URL)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="🍕"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
          <Input
            placeholder="vegetarian, spicy, popular"
            value={formData.tags?.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              })
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isAvailable" className="font-medium text-gray-700">
            Available for ordering
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" type="submit">
            {editItem ? t('common.save') : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}