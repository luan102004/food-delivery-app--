'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import PromotionForm from '@/components/restaurant/PromotionForm';
import { Plus, Edit2, Trash2, Tag, Calendar, TrendingUp, Users } from 'lucide-react';
import type { Promotion } from '@/types';

export default function RestaurantPromotionsPage() {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | undefined>();

  // Mock data
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      _id: '1',
      code: 'SAVE30',
      type: 'percentage',
      value: 30,
      description: 'Get 30% off on all orders',
      minOrderAmount: 20,
      maxDiscount: 15,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      usageLimit: 1000,
      usedCount: 342,
      createdAt: new Date(),
    },
    {
      _id: '2',
      code: 'FREESHIP',
      type: 'free_delivery',
      value: 0,
      description: 'Free delivery on orders over $25',
      minOrderAmount: 25,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      usageLimit: 500,
      usedCount: 189,
      createdAt: new Date(),
    },
    {
      _id: '3',
      code: 'FIRST10',
      type: 'fixed',
      value: 10,
      description: '$10 off for first-time customers',
      minOrderAmount: 30,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      usageLimit: 200,
      usedCount: 156,
      createdAt: new Date(),
    },
    {
      _id: '4',
      code: 'WEEKEND20',
      type: 'percentage',
      value: 20,
      description: '20% off on weekend orders',
      minOrderAmount: 15,
      maxDiscount: 10,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      isActive: false,
      usageLimit: 300,
      usedCount: 298,
      createdAt: new Date(),
    },
  ]);

  const handleAddPromo = (promo: Partial<Promotion>) => {
    const newPromo: Promotion = {
      ...promo,
      _id: Math.random().toString(),
      usedCount: 0,
      createdAt: new Date(),
    } as Promotion;
    setPromotions([...promotions, newPromo]);
  };

  const handleEditPromo = (promo: Partial<Promotion>) => {
    setPromotions(promotions.map((p) => (p._id === editingPromo?._id ? { ...p, ...promo } : p)));
    setEditingPromo(undefined);
  };

  const handleDeletePromo = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter((p) => p._id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setPromotions(promotions.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      percentage: 'bg-blue-100 text-blue-700',
      fixed: 'bg-green-100 text-green-700',
      free_delivery: 'bg-purple-100 text-purple-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      percentage: 'Percentage',
      fixed: 'Fixed Amount',
      free_delivery: 'Free Delivery',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);
  const activePromos = promotions.filter((p) => p.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('nav.promotions')}</h1>
            <p className="text-gray-600">Create and manage promotional offers</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setEditingPromo(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Create Promotion
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-8 h-8 text-primary-600" />
                <span className="text-3xl font-bold">{promotions.length}</span>
              </div>
              <div className="text-gray-600">Total Promos</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold">{activePromos}</span>
              </div>
              <div className="text-gray-600">Active Promos</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold">{totalUsage}</span>
              </div>
              <div className="text-gray-600">Total Usage</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold">
                  {promotions.filter((p) => new Date(p.endDate) > new Date()).length}
                </span>
              </div>
              <div className="text-gray-600">Valid Promos</div>
            </div>
          </Card>
        </div>

        {/* Promotions Grid */}
        {promotions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {promotions.map((promo) => {
              const usagePercent = (promo.usedCount / promo.usageLimit) * 100;
              const isExpired = new Date(promo.endDate) < new Date();

              return (
                <Card key={promo._id}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-primary-600">{promo.code}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(promo.type)}`}>
                            {getTypeLabel(promo.type)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{promo.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPromo(promo);
                            setIsFormOpen(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo._id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Promo Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Discount Value</div>
                        <div className="font-bold text-lg">
                          {promo.type === 'percentage'
                            ? `${promo.value}%`
                            : promo.type === 'fixed'
                            ? `$${promo.value}`
                            : 'Free Delivery'}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Min Order</div>
                        <div className="font-bold text-lg">${promo.minOrderAmount}</div>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Usage</span>
                        <span className="text-sm text-gray-600">
                          {promo.usedCount} / {promo.usageLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Expired</span>
                        ) : promo.isActive ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>

                      {!isExpired && (
                        <button
                          onClick={() => toggleActive(promo._id)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            promo.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {promo.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold mb-2">No promotions yet</h3>
            <p className="text-gray-600 mb-6">Create your first promotion to attract more customers</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setEditingPromo(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Create Promotion
            </Button>
          </div>
        )}

        {/* Promotion Form Modal */}
        <PromotionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPromo(undefined);
          }}
          onSubmit={editingPromo ? handleEditPromo : handleAddPromo}
          editPromo={editingPromo}
        />
      </div>
    </div>
  );
}