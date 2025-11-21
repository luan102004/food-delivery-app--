'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';
import type { Promotion, PromotionType } from '@/types';

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promo: Partial<Promotion>) => void;
  editPromo?: Promotion;
}

export default function PromotionForm({ isOpen, onClose, onSubmit, editPromo }: PromotionFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Promotion>>(
    editPromo || {
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      minOrderAmount: 0,
      maxDiscount: undefined,
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      usageLimit: 100,
      usedCount: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editPromo ? 'Edit Promotion' : 'Create Promotion'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Promo Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder="SAVE30"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as PromotionType })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="percentage">Percentage Off</option>
            <option value="fixed">Fixed Amount</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
        </div>

        <Input
          label={formData.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
          type="number"
          step="0.01"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="Get 30% off on all orders"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Minimum Order Amount ($)"
            type="number"
            step="0.01"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
          />

          {formData.type === 'percentage' && (
            <Input
              label="Maximum Discount ($)"
              type="number"
              step="0.01"
              value={formData.maxDiscount || ''}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              placeholder="Optional"
            />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <Input
          label="Usage Limit"
          type="number"
          value={formData.usageLimit}
          onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
          required
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="font-medium text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" type="submit">
            {editPromo ? t('common.save') : 'Create Promotion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}